#!/usr/bin/env python3
"""Detect drift between the site's service list and aidevops integration guides."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from update_site_stats import github_request, urlopen_with_retries

CONFIG_PATH = Path("data/services-sync.json")
INDEX_PATH = Path("index.html")
EXCLUDED_BASENAMES = {"README.md", "AGENTS.md", "index.md"}
DEPRECATION = re.compile(r"\b(deprecated|legacy|retired|sunset|unsupported)\b", re.I)
MARKER = "<!-- aidevops:generator=services-sync-check -->"


def load_site_entries() -> set[str]:
    html = INDEX_PATH.read_text(encoding="utf-8")
    section = html[html.index('id="services"') : html.index('services-footer')]
    names = [re.sub(r"<[^>]+>", "", item).strip() for item in re.findall(r"<li>.*?</li>", section)]
    return set(names)


def load_tree(repo: str, sha: str) -> set[str]:
    data = github_request(f"/repos/{repo}/git/trees/{sha}", {"recursive": "1"})
    if not isinstance(data, dict) or data.get("truncated"):
        raise RuntimeError(f"upstream tree for {sha} is unavailable or truncated")
    return {str(item["path"]) for item in data.get("tree", []) if item.get("type") == "blob"}


def upstream_head(repo: str) -> str:
    data = github_request(f"/repos/{repo}/commits/main")
    if not isinstance(data, dict) or not isinstance(data.get("sha"), str):
        raise RuntimeError("could not resolve upstream main")
    return data["sha"]


def raw_text(repo: str, sha: str, path: str) -> str:
    quoted = "/".join(urllib.parse.quote(part) for part in path.split("/"))
    request = urllib.request.Request(f"https://raw.githubusercontent.com/{repo}/{sha}/{quoted}")
    with urlopen_with_retries(request, timeout=30) as response:
        return response.read(6001).decode("utf-8", errors="replace")[:6000]


def description(text: str) -> str:
    match = re.search(r"^description:\s*[\"']?(.+?)[\"']?\s*$", text, re.M)
    return match.group(1).strip() if match else ""


def changed_paths(repo: str, baseline: str, head: str) -> set[str]:
    data = github_request(f"/repos/{repo}/compare/{baseline}...{head}")
    if not isinstance(data, dict):
        raise RuntimeError("upstream comparison failed")
    return {str(item["filename"]) for item in data.get("files", [])}


def findings(config: dict[str, object], head: str) -> dict[str, object]:
    repo = str(config["upstream_repo"])
    baseline = str(config["baseline_commit"])
    prefixes = tuple(str(prefix) for prefix in config["candidate_prefixes"])
    services = dict(config["services"])
    acknowledged = dict(config.get("acknowledged", {}))
    current, previous = load_tree(repo, head), load_tree(repo, baseline)
    mapped = {path for paths in services.values() for path in paths}
    added = sorted(path for path in current - previous if path.startswith(prefixes) and path.endswith(".md") and Path(path).name not in EXCLUDED_BASENAMES and path not in mapped and path not in acknowledged)
    overflow = max(0, len(added) - 60)
    added = added[:60]
    changed_files = changed_paths(repo, baseline, head)
    removed = sorted(path for path in mapped if path not in current)
    changed = []
    for path in sorted(mapped & changed_files & current):
        text = raw_text(repo, head, path)
        heading = next((line[2:] for line in text.splitlines() if line.startswith("# ")), "")
        if DEPRECATION.search(f"{description(text)} {heading}"):
            changed.append(path)
    site_entries = load_site_entries()
    expected = (len(site_entries) // 10) * 10
    html = INDEX_PATH.read_text(encoding="utf-8")
    claims = sorted(set(re.findall(r"\b(\d+)\+ (?:service integrations|services|integrations)\b", html)))
    return {"added": [(path, description(raw_text(repo, head, path))) for path in added], "added_overflow": overflow, "removed": removed, "changed": changed, "unmapped": sorted(site_entries ^ set(services)), "count_claims": [claim for claim in claims if int(claim) != expected], "head": head, "expected_count": expected}


def render(result: dict[str, object]) -> str:
    lines = ["# Services sync check", f"Upstream HEAD: `{result['head']}`", f"Expected integration claim: `{result['expected_count']}+`"]
    for key in ("added", "removed", "changed", "unmapped", "count_claims"):
        values = result[key]
        lines.append(f"## {key.replace('_', ' ').title()} ({len(values)})")
        if key == "added":
            lines.extend(f"- `{path}` — {detail}" for path, detail in values)
            if result["added_overflow"]:
                lines.append(f"- … and {result['added_overflow']} more candidates")
        else:
            lines.extend(f"- `{item}`" for item in values)
    return "\n".join(lines)


def has_findings(result: dict[str, object]) -> bool:
    return any(result[key] for key in ("added", "removed", "changed", "unmapped", "count_claims"))


def create_issue(summary: str, config: dict[str, object], result: dict[str, object]) -> None:
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN is required to file a drift issue")
    repo = str(config["upstream_repo"])
    target = "marcusquinn/aidevops.sh"
    existing = github_request(f"/repos/{target}/issues", {"state": "open", "per_page": "100"})
    if any(MARKER in str(issue.get("body", "")) for issue in existing if isinstance(issue, dict)):
        return
    body = f"{MARKER}\n\n{summary}\n\n## What\nSynchronize the site services list with upstream aidevops.\n\n## How\nUpdate `index.html` and `data/services-sync.json` together. Triage non-service candidates into `acknowledged`, use confirmed official URLs, remove retired services, update count claims, and set `baseline_commit` to `{result['head']}`. Verify with `python3 scripts/check_services_sync.py --dry-run --head {result['head']}`.\n\n## Acceptance\nThe dry run reports no findings."
    payload = json.dumps({"title": f"Sync site services list with upstream aidevops ({str(result['head'])[:7]})", "body": body, "labels": ["enhancement", "auto-dispatch", "tier:standard", "origin:worker"]}).encode()
    request = urllib.request.Request(f"https://api.github.com/repos/{target}/issues", data=payload, method="POST", headers={"Accept": "application/vnd.github+json", "Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    with urlopen_with_retries(request, timeout=60):
        pass


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--head")
    parser.add_argument("--baseline")
    args = parser.parse_args()
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    if args.baseline:
        config["baseline_commit"] = args.baseline
    head = args.head or upstream_head(str(config["upstream_repo"]))
    result = findings(config, head)
    summary = render(result)
    print(summary)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        Path(os.environ["GITHUB_STEP_SUMMARY"]).write_text(summary + "\n", encoding="utf-8")
    if has_findings(result) and not args.dry_run:
        create_issue(summary, config, result)
    return 0


if __name__ == "__main__":
    sys.exit(main())
