#!/usr/bin/env python3
"""Generate cached aidevops site statistics for the home page."""

from __future__ import annotations

import base64
import datetime as dt
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


TARGET_REPO = os.environ.get("AIDEVOPS_STATS_REPO", "marcusquinn/aidevops")
OUTPUT_PATH = Path("data/aidevops-stats.json")
PREVIEW_EXTENSIONS = {".md", ".txt", ".sh", ".py", ".js", ".json", ".yml", ".yaml", ".toml"}
MAX_PREVIEWS = 60
MAX_PREVIEW_CHARS = 6000


def base64_text(value: str) -> str:
    return base64.b64encode(value.encode("utf-8")).decode("ascii")


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
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode("utf-8")), response.headers


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
    with urllib.request.urlopen(request, timeout=30) as response:
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
        tree.append({"path64": base64_text(path), "type": kind})
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
    tree.sort(key=lambda item: (item["type"] != "tree", item["path64"]))
    return {"encoding": "base64", "tree": tree, "previews": previews}


def main() -> None:
    repo = github_request(f"/repos/{TARGET_REPO}")
    if not isinstance(repo, dict):
        raise TypeError("Unexpected GitHub repository response")
    repo_created_at = str(repo["created_at"])
    generated_at = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    payload = {
        "generatedAt": generated_at,
        "repo": TARGET_REPO,
        "monthly": monthly_issue_counts(repo_created_at),
        "commitsDaily": commit_activity(repo_created_at),
        "agents": agents_tree_and_previews(),
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
