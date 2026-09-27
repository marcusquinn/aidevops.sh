#!/usr/bin/env python3
"""Generate cached aidevops site statistics for the home page."""

from __future__ import annotations

import base64
import datetime as dt
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


TARGET_REPO = os.environ.get("AIDEVOPS_STATS_REPO", "marcusquinn/aidevops")
# Maintainer profile README whose STATS block (auto-updated by the aidevops pulse) supplies time-leverage stats.
MAINTAINER_PROFILE_REPO = os.environ.get("AIDEVOPS_MAINTAINER_PROFILE_REPO", "marcusquinn/marcusquinn")
PROFILE_HUMAN_ROWS = ("Interactive human attention", "Worker-classified human attention")
PROFILE_AI_ROWS = ("Interactive AI generation", "Worker/headless AI generation")
# Public commit-history.com profile (server-rendered, keyless) that supplies the maintainer's total-contributions rank.
COMMIT_HISTORY_USER = os.environ.get("AIDEVOPS_COMMIT_HISTORY_USER", "marcusquinn")
COMMIT_HISTORY_RANK_PATTERN = re.compile(r">#([\d,]+)</div>\s*<div[^>]*>\s*Total rank\s*</div>")
OUTPUT_PATH = Path("data/aidevops-stats.json")
OG_IMAGE_PATH = Path("og-image.svg")
INDEX_PATH = Path("index.html")
PREVIEW_EXTENSIONS = {".md", ".txt", ".sh", ".py", ".js", ".json", ".yml", ".yaml", ".toml"}
MAX_PREVIEWS = 60
MAX_PREVIEW_CHARS = 6000
MAX_SOURCE_CHARS = 1_000_000
MCP_REGISTRY_PATH = ".agents/plugins/opencode-aidevops/mcp-registry.mjs"
# Upstream README hero labels; keep these exact so site counts match the README.
INVENTORY_LABELS = {
    "mainAgents": "main agents",
    "subAgents": "sub agents",
    "helperScripts": "helper scripts",
    "slashCommands": "slash commands",
}
VERSION_PATTERN = re.compile(r"^v?(\d+\.\d+\.\d+)$")
MAX_REQUEST_ATTEMPTS = 4
RETRY_STATUS_CODES = {403, 429, 500, 502, 503, 504}


def base64_text(value: str) -> str:
    return base64.b64encode(value.encode("utf-8")).decode("ascii")


def retry_delay(attempt: int, headers: object | None = None) -> float:
    retry_after = headers.get("Retry-After") if headers is not None and hasattr(headers, "get") else None
    if retry_after:
        try:
            return min(float(retry_after), 30.0)
        except ValueError:
            pass
    return min(2.0**attempt, 30.0)


def urlopen_with_retries(request: urllib.request.Request, timeout: int = 60):
    for attempt in range(MAX_REQUEST_ATTEMPTS):
        try:
            response = urllib.request.urlopen(request, timeout=timeout)
            if getattr(response, "status", 200) == 202 and attempt < MAX_REQUEST_ATTEMPTS - 1:
                delay = retry_delay(attempt, response.headers)
                response.close()
                time.sleep(delay)
                continue
            return response
        except urllib.error.HTTPError as error:
            if error.code not in RETRY_STATUS_CODES or attempt == MAX_REQUEST_ATTEMPTS - 1:
                raise
            time.sleep(retry_delay(attempt, error.headers))
        except urllib.error.URLError:
            if attempt == MAX_REQUEST_ATTEMPTS - 1:
                raise
            time.sleep(retry_delay(attempt))
    raise RuntimeError("GitHub request retry loop exhausted")


def github_request(path: str, params: dict[str, str] | None = None) -> object:
    data, _headers = github_request_with_headers(path, params)
    return data


def github_request_with_headers(
    path: str,
    params: dict[str, str] | None = None,
) -> tuple[object, object]:
    token = os.environ.get("GITHUB_TOKEN")
    query = ""
    if params:
        query = "?" + urllib.parse.urlencode(params)
    return github_url_request(f"https://api.github.com{path}{query}", token)


def github_url_request(url: str, token: str | None = None) -> tuple[object, object]:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "aidevops.sh-site-stats",
            **({"Authorization": f"Bearer {token}"} if token else {}),
        },
    )
    with urlopen_with_retries(request, timeout=60) as response:
        body = response.read().decode("utf-8")
        return (json.loads(body) if body else {}), response.headers


def next_link_url(link_header: str | None) -> str | None:
    if not link_header:
        return None
    for link in link_header.split(","):
        if 'rel="next"' not in link:
            continue
        start = link.find("<")
        end = link.find(">")
        if start != -1 and end != -1 and start < end:
            return link[start + 1 : end]
    return None


def last_page_number(link_header: str | None) -> int | None:
    if not link_header:
        return None
    for link in link_header.split(","):
        if 'rel="last"' not in link:
            continue
        match = re.search(r"[?&]page=(\d+)", link)
        if match:
            return int(match.group(1))
    return None


def raw_github_text(path: str, max_chars: int = MAX_PREVIEW_CHARS, repo: str = TARGET_REPO) -> str:
    quoted = "/".join(urllib.parse.quote(part) for part in path.split("/"))
    request = urllib.request.Request(
        f"https://raw.githubusercontent.com/{repo}/HEAD/{quoted}",
        headers={"User-Agent": "aidevops.sh-site-stats"},
    )
    with urlopen_with_retries(request, timeout=30) as response:
        return response.read(max_chars + 1).decode("utf-8", errors="replace")[:max_chars]


def month_range(start: dt.datetime, end: dt.datetime) -> list[tuple[int, int]]:
    months: list[tuple[int, int]] = []
    year = start.year
    month = start.month
    while (year, month) <= (end.year, end.month):
        months.append((year, month))
        month += 1
        if month == 13:
            year += 1
            month = 1
    return months


def paginated_issues() -> list[dict[str, object]]:
    items: list[dict[str, object]] = []
    per_page = 100
    url: str | None = None
    params = {"state": "all", "per_page": str(per_page), "sort": "created", "direction": "asc"}
    while True:
        if url:
            data, headers = github_url_request(url, os.environ.get("GITHUB_TOKEN"))
        else:
            data, headers = github_request_with_headers(f"/repos/{TARGET_REPO}/issues", params)
        if not isinstance(data, list):
            raise TypeError("Unexpected GitHub issues response")
        items.extend(item for item in data if isinstance(item, dict))
        url = next_link_url(headers.get("Link"))
        if not url:
            break
    return items


def month_key(value: object) -> str | None:
    if not isinstance(value, str) or not value:
        return None
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00")).strftime("%Y-%m")


def monthly_issue_counts(
    repo_created_at: str,
    items: list[dict[str, object]],
) -> dict[str, list[dict[str, int | str]]]:
    created = dt.datetime.fromisoformat(repo_created_at.replace("Z", "+00:00"))
    now = dt.datetime.now(dt.timezone.utc)
    result: dict[str, list[dict[str, int | str]]] = {"issues": [], "prs": []}
    indexes: dict[str, dict[str, dict[str, int | str]]] = {"issues": {}, "prs": {}}
    for key in ("issues", "prs"):
        for year, month in month_range(created, now):
            start = f"{year:04d}-{month:02d}-01"
            entry = {"month": start[:7], "opened": 0, "closed": 0}
            result[key].append(entry)
            indexes[key][start[:7]] = entry
    for item in items:
        key = "prs" if "pull_request" in item else "issues"
        opened_month = month_key(item.get("created_at"))
        if opened_month in indexes[key]:
            indexes[key][opened_month]["opened"] += 1
        closed_month = month_key(item.get("closed_at"))
        if closed_month in indexes[key]:
            indexes[key][closed_month]["closed"] += 1
    return result


def activity_totals(items: list[dict[str, object]]) -> dict[str, dict[str, int]]:
    """Lifetime issue and PR state totals from the same paginated issues list (no extra API calls)."""
    issues = {"open": 0, "closed": 0}
    pull_requests = {"open": 0, "merged": 0, "closedUnmerged": 0}
    for item in items:
        is_open = item.get("state") == "open"
        if "pull_request" not in item:
            issues["open" if is_open else "closed"] += 1
            continue
        pull_request = item.get("pull_request")
        if is_open:
            pull_requests["open"] += 1
        elif isinstance(pull_request, dict) and pull_request.get("merged_at"):
            pull_requests["merged"] += 1
        else:
            pull_requests["closedUnmerged"] += 1
    return {"issues": issues, "pullRequests": pull_requests}


def label_count() -> int | None:
    """Repository label total from one per_page=1 request and its rel="last" page number."""
    try:
        data, headers = github_request_with_headers(f"/repos/{TARGET_REPO}/labels", {"per_page": "1"})
    except (OSError, ValueError):
        return None
    last_page = last_page_number(headers.get("Link"))
    if last_page:
        return last_page
    return len(data) if isinstance(data, list) else None


def profile_hours(readme: str, label: str) -> float | None:
    """Prior-365-day hours for one row of the maintainer profile 'Work with AI' table."""
    match = re.search(rf"^\|\s*{re.escape(label)}\s*\|(.+)\|\s*$", readme, re.M)
    if not match:
        return None
    value = match.group(1).split("|")[-1].strip()
    number = re.fullmatch(r"~?([\d,]+(?:\.\d+)?)h\*?", value)
    return float(number.group(1).replace(",", "")) if number else None


def maintainer_profile_stats() -> dict[str, object] | None:
    """Read time-leverage and token totals from the maintainer profile; None when the format is unrecognised."""
    try:
        readme = raw_github_text("README.md", MAX_SOURCE_CHARS, MAINTAINER_PROFILE_REPO)
    except (OSError, UnicodeDecodeError):
        return None
    if not re.search(r"^\|\s*Metric\s*\|.*\|\s*Prior 365 Days\s*\|\s*$", readme, re.M):
        return None
    human = [profile_hours(readme, label) for label in PROFILE_HUMAN_ROWS]
    machine = [profile_hours(readme, label) for label in PROFILE_AI_ROWS]
    if any(value is None for value in human + machine):
        return None
    human_hours = sum(value for value in human if value is not None)
    ai_hours = sum(value for value in machine if value is not None)
    if human_hours <= 0:
        return None
    result: dict[str, object] = {
        "humanHours365": round(human_hours, 1),
        "aiHours365": round(ai_hours, 1),
        "source": f"{MAINTAINER_PROFILE_REPO}/README.md",
    }
    _recent, separator, all_time = readme.partition("## AI Model Usage (all time)")
    tokens = re.search(r"_([\d,]+(?:\.\d+)?)M total tokens processed", all_time) if separator else None
    if tokens:
        result["tokensMillions"] = float(tokens.group(1).replace(",", ""))
    return result


def commit_history_rank() -> dict[str, object] | None:
    """Maintainer total-contributions rank from the public commit-history.com profile; None when unavailable."""
    url = f"https://commit-history.com/{urllib.parse.quote(COMMIT_HISTORY_USER)}?metric=total"
    request = urllib.request.Request(url, headers={"User-Agent": "aidevops.sh-site-stats"})
    try:
        with urlopen_with_retries(request, timeout=30) as response:
            html = response.read(MAX_SOURCE_CHARS).decode("utf-8", errors="replace")
    except (OSError, RuntimeError, ValueError):
        return None
    match = COMMIT_HISTORY_RANK_PATTERN.search(html)
    if not match:
        return None
    rank = parse_count(match.group(1))
    if rank <= 0:
        return None
    checked_on = dt.datetime.now(dt.timezone.utc).date().isoformat()
    return {"rank": rank, "checkedOn": checked_on, "source": url}


def rank_bracket(rank: int) -> int:
    """Conservative 'Top N' bracket: the rank rounded up to the next hundred (next ten inside the top 100)."""
    step = 100 if rank > 100 else 10
    return -(-rank // step) * step


def update_index_commit_history(ranking: dict[str, object] | None) -> None:
    """Refresh the #github-memory commit-history.com card; keep the static fallback when the rank is unavailable."""
    if not ranking or not INDEX_PATH.exists():
        print("::warning::commit-history.com rank unavailable; keeping the static fallback in index.html")
        return
    rank = int(ranking["rank"])
    checked = dt.date.fromisoformat(str(ranking["checkedOn"]))
    values = {
        r'(id="memoryRankCard"[^>]*\stitle=")[^"]*(")': (
            f"Maintainer total-contributions rank on commit-history.com: #{rank:,} on {checked.day} {checked:%B %Y}"
        ),
        r'(id="memoryRank">)[^<]*(<)': f"Top {rank_bracket(rank):,}",
        r'(id="memoryRankDetail">)[^<]*(<)': f"#{rank:,} by total GitHub contributions · {checked:%b %Y}",
    }
    content = INDEX_PATH.read_text(encoding="utf-8")
    updated = content
    for pattern, value in values.items():
        updated, count = re.subn(pattern, lambda match, text=value: f"{match.group(1)}{text}{match.group(2)}", updated, count=1)
        if count != 1:
            print(f"::warning::commit-history.com card element not found for pattern {pattern}; keeping the static fallback")
            return
    if updated != content:
        INDEX_PATH.write_text(updated, encoding="utf-8")


def commit_activity(repo_created_at: str) -> list[dict[str, int | str]]:
    created_day = repo_created_at[:10]
    weeks = github_request(f"/repos/{TARGET_REPO}/stats/commit_activity")
    if not isinstance(weeks, list):
        return []
    days: list[dict[str, int | str]] = []
    for week in weeks:
        if not isinstance(week, dict):
            continue
        week_start = int(week.get("week", 0))
        for offset, count in enumerate(week.get("days", [])):
            date = dt.datetime.fromtimestamp(week_start + offset * 86400, tz=dt.timezone.utc).date().isoformat()
            if date >= created_day:
                days.append({"date": date, "count": int(count)})
    return days


def agents_tree_and_previews() -> dict[str, object]:
    tree_data = github_request(f"/repos/{TARGET_REPO}/git/trees/HEAD", {"recursive": "1"})
    if not isinstance(tree_data, dict):
        return {"encoding": "base64", "tree": [], "previews": {}}
    tree: list[dict[str, str]] = []
    previews: dict[str, str] = {}
    preview_count = 0
    for item in tree_data.get("tree", []):
        if not isinstance(item, dict):
            continue
        path = str(item.get("path", ""))
        kind = str(item.get("type", ""))
        if not path.startswith(".agents/") or kind not in {"tree", "blob"}:
            continue
        tree.append({"path64": base64_text(path), "sort_path": path, "type": kind})
        if kind != "blob" or preview_count >= MAX_PREVIEWS:
            continue
        suffix = Path(path).suffix.lower()
        shallow = path.count("/") <= 2
        if suffix in PREVIEW_EXTENSIONS and shallow:
            try:
                previews[base64_text(path)] = base64_text(raw_github_text(path))
                preview_count += 1
            except (OSError, UnicodeDecodeError, urllib.error.URLError):
                continue
    tree.sort(key=lambda item: (item["type"] != "tree", item["sort_path"]))
    serialized_tree = [{"path64": item["path64"], "type": item["type"]} for item in tree]
    return {"encoding": "base64", "tree": serialized_tree, "previews": previews}


def rounded_hundred_label(count: int) -> str:
    rounded = max(0, count // 100 * 100)
    return f"{rounded:,}+"


def rounded_five_label(count: int) -> str:
    if count < 5:
        return str(max(0, count))
    return f"{count // 5 * 5:,}+"


def active_mcp_server_count(registry: str) -> int:
    """Count registry entries before the deprecated-MCP list; 0 when the layout is unrecognised."""
    start = registry.find("function getMcpRegistry")
    end = registry.find("const DEPRECATED_MCPS")
    if start == -1 or end == -1 or end <= start:
        return 0
    return len(re.findall(r'\bname:\s*"[^"]+"', registry[start:end]))


def parse_count(value: str) -> int:
    return int(value.replace(",", "").rstrip("+"))


def source_inventory() -> dict[str, object] | None:
    """Read upstream README hero counts; return None when the format is unrecognised."""
    try:
        readme = raw_github_text("README.md", MAX_SOURCE_CHARS)
    except (OSError, UnicodeDecodeError):
        return None
    exact_line = re.search(r"Exact source inventory:([^\n]+)", readme)
    hero_alt = re.search(r"!\[([^\]]*main agents[^\]]*)\]", readme)
    if not exact_line or not hero_alt:
        return None
    exact: dict[str, int] = {}
    rounded: dict[str, str] = {}
    for key, label in INVENTORY_LABELS.items():
        exact_match = re.search(rf"\*\*([\d,]+) {label}\*\*", exact_line.group(1))
        rounded_match = re.search(rf"([\d,]+\+?) {label}", hero_alt.group(1))
        if not exact_match or not rounded_match:
            return None
        exact[key] = parse_count(exact_match.group(1))
        rounded[key] = rounded_match.group(1)
    try:
        registry = raw_github_text(MCP_REGISTRY_PATH, MAX_SOURCE_CHARS)
    except (OSError, UnicodeDecodeError):
        registry = ""
    mcp_servers = active_mcp_server_count(registry)
    if mcp_servers:
        exact["mcpServers"] = mcp_servers
        rounded["mcpServers"] = rounded_five_label(mcp_servers)
    return {"exact": exact, "rounded": rounded, "source": "README.md"}


def latest_release() -> dict[str, str] | None:
    try:
        release = github_request(f"/repos/{TARGET_REPO}/releases/latest")
    except (OSError, ValueError):
        return None
    if not isinstance(release, dict):
        return None
    tag = str(release.get("tag_name", ""))
    if not VERSION_PATTERN.match(tag):
        return None
    return {"tag": tag, "publishedAt": str(release.get("published_at", ""))}


def update_index_version(release: dict[str, str] | None) -> None:
    """Keep the JSON-LD softwareVersion and hero badge fallback in sync with the latest release."""
    if not release or not INDEX_PATH.exists():
        return
    match = VERSION_PATTERN.match(release["tag"])
    if not match:
        return
    version = match.group(1)
    content = INDEX_PATH.read_text(encoding="utf-8")
    updated = re.sub(r'("softwareVersion":\s*")[^"]*(")', rf"\g<1>{version}\g<2>", content, count=1)
    updated = re.sub(r'(id="heroVersion">)v?[^<]*(<)', rf"\g<1>v{version}\g<2>", updated, count=1)
    if updated != content:
        INDEX_PATH.write_text(updated, encoding="utf-8")


def update_og_image_metric(agents_payload: dict[str, object], inventory: dict[str, object] | None = None) -> None:
    tree = agents_payload.get("tree", [])
    if not isinstance(tree, list) or not tree or not OG_IMAGE_PATH.exists():
        return
    label = rounded_hundred_label(len(tree))
    rounded = inventory.get("rounded", {}) if inventory else {}
    if not isinstance(rounded, dict):
        rounded = {}
    content = OG_IMAGE_PATH.read_text(encoding="utf-8")
    content, metric_replacements = re.subn(
        r'(<g transform="translate\()\d+( 28\)">\s*<text[^>]*>)[^<]+(</text>\s*<text[^>]*>)(?:subagent skills|subagents skills &amp; helpers)(</text>)',
        rf'\g<1>300\g<2>{label}\g<3>subagents skills &amp; helpers\g<4>',
        content,
        count=1,
    )
    command_label = rounded.get("slashCommands")
    content, command_replacements = re.subn(
        r'(<g transform="translate\()\d+( 28\)">\s*<text[^>]*>)([^<]+)(</text>\s*<text[^>]*>/command shortcuts</text>)',
        lambda match: f"{match.group(1)}700{match.group(2)}{command_label or match.group(3)}{match.group(4)}",
        content,
        count=1,
    )
    main_label = rounded.get("mainAgents")
    if main_label:
        content = re.sub(
            r'(<text[^>]*>)[^<]+(</text>\s*<text[^>]*>main agent experts</text>)',
            lambda match: f"{match.group(1)}{main_label}{match.group(2)}",
            content,
            count=1,
        )
    if metric_replacements != 1 or command_replacements != 1:
        raise RuntimeError("Unable to update social graph .agents metric")
    OG_IMAGE_PATH.write_text(content, encoding="utf-8")


def main() -> None:
    repo = github_request(f"/repos/{TARGET_REPO}")
    if not isinstance(repo, dict):
        raise TypeError("Unexpected GitHub repository response")
    repo_created_at = str(repo["created_at"])
    generated_at = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    agents_payload = agents_tree_and_previews()
    inventory = source_inventory()
    release = latest_release()
    ranking = commit_history_rank()
    update_og_image_metric(agents_payload, inventory)
    update_index_version(release)
    update_index_commit_history(ranking)
    items = paginated_issues()
    activity: dict[str, object] = dict(activity_totals(items))
    labels = label_count()
    if labels is not None:
        activity["labels"] = labels
    payload = {
        "generatedAt": generated_at,
        "repo": TARGET_REPO,
        "repoStats": {
            "stars": int(repo.get("stargazers_count") or 0),
            "forks": int(repo.get("forks_count") or 0),
        },
        "monthly": monthly_issue_counts(repo_created_at, items),
        "activity": activity,
        "commitsDaily": commit_activity(repo_created_at),
        "agents": agents_payload,
    }
    if inventory:
        payload["inventory"] = inventory
    if release:
        payload["release"] = release
    if ranking:
        payload["commitHistory"] = ranking
    maintainer = maintainer_profile_stats()
    if maintainer:
        payload["maintainer"] = maintainer
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
