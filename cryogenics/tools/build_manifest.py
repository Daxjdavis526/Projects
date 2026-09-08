#!/usr/bin/env python3
"""
build_manifest.py — derive reader/manifest.js from README.md's tables.

Produces window.COURSE = [{part, items:[{id, title, file, key}]}] so the
browser reader (index.html) and the offline single-file build share one
table of contents. Run after editing README.md.
"""
from __future__ import annotations
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

LINK = re.compile(r"\[([^\]]+)\]\(([^)]+\.md)\)")


def main() -> None:
    text = open(os.path.join(ROOT, "README.md"), encoding="utf-8").read()
    parts: list[dict] = []
    current: dict | None = None
    for line in text.splitlines():
        if line.startswith("### "):
            current = {"part": line[4:].strip(), "items": []}
            parts.append(current)
            continue
        if current is None or not line.startswith("|"):
            continue
        links = LINK.findall(line)
        if not links:
            continue
        title, file = links[0]
        key = next((f for t, f in links[1:] if f.endswith("-key.md")), None)
        # reference rows: first link is the main file; ignore rows that are only keys
        if file.endswith("-key.md"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        num = cells[0] if cells and re.match(r"^\d{2}$", cells[0]) else ""
        item = {"id": num or re.sub(r"[^a-z0-9]+", "-", file.lower()).strip("-"),
                "title": (num + " · " if num else "") + title, "file": file}
        if key:
            item["key"] = key
        current["items"].append(item)
    # diagnostic exam lives outside the tables
    parts.insert(0, {"part": "Start here", "items": [
        {"id": "readme", "title": "Course guide", "file": "README.md"},
        {"id": "00", "title": "00 · Diagnostic entrance exam", "file": "00-diagnostic-exam.md",
         "key": "00-diagnostic-key.md"},
    ]})
    out = "window.COURSE = " + json.dumps(parts, indent=1, ensure_ascii=False) + ";\n"
    os.makedirs(os.path.join(ROOT, "reader"), exist_ok=True)
    with open(os.path.join(ROOT, "reader", "manifest.js"), "w", encoding="utf-8") as f:
        f.write(out)
    n = sum(len(p["items"]) for p in parts)
    print(f"manifest: {len(parts)} parts, {n} items")


if __name__ == "__main__":
    main()
