#!/usr/bin/env python3
"""
check_structure.py — structural lint for the PROPULSION course.

Checks:
  * every module NN-topic.md has a matching NN-topic-key.md
  * every file linked from README.md exists
  * module files contain the required section headings from TEMPLATE.md
  * module (non-key) files do not contain answer-key headings or the
    strings "Answer:" / "Solution:" outside of worked examples
  * citation tags used in modules exist in reference/sources.md

Exit code 1 on any failure. Run from the repo root or propulsion/.
"""
from __future__ import annotations
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

REQUIRED_MODULE_HEADINGS = [
    "Learning objectives",
    "Terminology",
    "Theory",
    "Typical engineering ranges",
    "Worked examples",
    "Real engines",
    "Misconceptions",
    "Mastery levels",
    "Problems",
    "Quiz",
    "Further reading",
]
REQUIRED_KEY_HEADINGS = ["K1", "K2", "K3", "K4"]

MODULE_RE = re.compile(r"^(\d{2})-[a-z0-9-]+\.md$")
KEY_RE = re.compile(r"^(\d{2})-[a-z0-9-]+-key\.md$")
LINK_RE = re.compile(r"\]\(([^)#\s]+)(?:#[^)]*)?\)")
TAG_RE = re.compile(r"\[([A-Z][A-Za-z0-9+\-]*(?:\s?§?[^\]]{0,40})?)\]")


def read(path: str) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()


def main() -> int:
    failures: list[str] = []

    # 1. README links resolve
    readme = read(os.path.join(ROOT, "README.md"))
    for link in LINK_RE.findall(readme):
        if link.startswith("http"):
            continue
        if not os.path.exists(os.path.join(ROOT, link)):
            failures.append(f"README link missing: {link}")

    # 2. module/key pairing and headings
    part_dirs = [d for d in os.listdir(ROOT) if d.startswith("part")]
    for d in sorted(part_dirs):
        full = os.path.join(ROOT, d)
        files = sorted(os.listdir(full))
        for fn in files:
            if KEY_RE.match(fn):
                continue
            m = MODULE_RE.match(fn)
            if not m:
                continue
            key = fn[:-3] + "-key.md"
            if key not in files:
                failures.append(f"{d}/{fn}: missing key {key}")
            text = read(os.path.join(full, fn))
            for h in REQUIRED_MODULE_HEADINGS:
                if not re.search(rf"^#+\s.*{re.escape(h)}", text, re.M | re.I):
                    failures.append(f"{d}/{fn}: missing heading '{h}'")
            # answers must not leak into module files
            body_after_problems = text.split("Problems", 1)[-1]
            if re.search(r"^#+\s*K[1-4]\b", body_after_problems, re.M):
                failures.append(f"{d}/{fn}: key heading inside module file")
            if re.search(r"^\*\*?(Answer|Solution)\b", body_after_problems, re.M):
                failures.append(f"{d}/{fn}: 'Answer'/'Solution' after Problems section")
            if key in files:
                ktext = read(os.path.join(full, key))
                for h in REQUIRED_KEY_HEADINGS:
                    if not re.search(rf"^#+\s.*{h}\b", ktext, re.M):
                        failures.append(f"{d}/{key}: missing heading '{h}'")

    # 3. citation tags exist in sources.md
    src_path = os.path.join(ROOT, "reference", "sources.md")
    if os.path.exists(src_path):
        src = read(src_path)
        defined = set(re.findall(r"`\[([^\]`]+)\]`", src))
        if defined:
            for d in sorted(part_dirs) + ["exams", "part6-interview"]:
                full = os.path.join(ROOT, d)
                if not os.path.isdir(full):
                    continue
                for fn in sorted(os.listdir(full)):
                    if not fn.endswith(".md"):
                        continue
                    text = read(os.path.join(full, fn))
                    used = set()
                    for t in TAG_RE.findall(text):
                        base = re.split(r"[\s,;§]", t)[0]
                        used.add(base)
                    # ignore epistemic tags and obvious non-citations
                    skip = {"F", "E", "H", "M", "R", "A", "J", "SI", "K1", "K2", "K3", "K4"}
                    for u in sorted(used - skip):
                        if u not in defined and not any(u == dd.split()[0] for dd in defined):
                            failures.append(f"{d}/{fn}: citation tag [{u}] not in sources.md")
    else:
        failures.append("reference/sources.md missing")

    if failures:
        print("\n".join(failures))
        print(f"\n{len(failures)} problem(s).")
        return 1
    print("structure OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
