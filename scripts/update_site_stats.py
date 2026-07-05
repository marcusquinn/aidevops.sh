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
OUTPUT_PATH = Path("data/aidevops-stats.json")
OG_IMAGE_PATH = Path("og-image.svg")
PREVIEW_EXTENSIONS = {".md", ".txt", ".sh", ".py", ".js", ".json", ".yml", ".yaml", ".toml"}
MAX_PREVIEWS = 60
MAX_PREVIEW_CHARS = 6000
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


def raw_github_text(path: str) -> str:
    quoted = "/".join(urllib.parse.quote(part) for part in path.split("/"))
    request = urllib.request.Request(
        f"https://raw.githubusercontent.com/{TARGET_REPO}/HEAD/{quoted}",
        headers={"User-Agent": "aidevops.sh-site-stats"},
    )
    with urlopen_with_retries(request, timeout=30) as response:
        return response.read(MAX_PREVIEW_CHARS + 1).decode("utf-8", errors="replace")[:MAX_PREVIEW_CHARS]


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


def monthly_issue_counts(repo_created_at: str) -> dict[str, list[dict[str, int | str]]]:
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
    for item in paginated_issues():
        key = "prs" if "pull_request" in item else "issues"
        opened_month = month_key(item.get("created_at"))
        if opened_month in indexes[key]:
            indexes[key][opened_month]["opened"] += 1
        closed_month = month_key(item.get("closed_at"))
        if closed_month in indexes[key]:
            indexes[key][closed_month]["closed"] += 1
    return result


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


def update_og_image_metric(agents_payload: dict[str, object]) -> None:
    tree = agents_payload.get("tree", [])
    if not isinstance(tree, list) or not tree or not OG_IMAGE_PATH.exists():
        return
    label = rounded_hundred_label(len(tree))
    content = OG_IMAGE_PATH.read_text(encoding="utf-8")
    content, metric_replacements = re.subn(
        r'(<g transform="translate\()\d+( 28\)">\s*<text[^>]*>)[^<]+(</text>\s*<text[^>]*>)(?:subagent skills|subagents skills &amp; helpers)(</text>)',
        rf'\g<1>300\g<2>{label}\g<3>subagents skills &amp; helpers\g<4>',
        content,
        count=1,
    )
    content, command_replacements = re.subn(
        r'(<g transform="translate\()\d+( 28\)">\s*<text[^>]*>185\+</text>\s*<text[^>]*>/command shortcuts</text>)',
        r'\g<1>700\g<2>',
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
    update_og_image_metric(agents_payload)
    payload = {
        "generatedAt": generated_at,
        "repo": TARGET_REPO,
        "monthly": monthly_issue_counts(repo_created_at),
        "commitsDaily": commit_activity(repo_created_at),
        "agents": agents_payload,
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
