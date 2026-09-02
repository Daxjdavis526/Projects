#!/usr/bin/env python3
"""
build_offline.py — bundle the whole course into ONE self-contained HTML file.

Output: propulsion/offline/PROPULSION-course.html (~15 MB). Double-click it
in any modern browser; no internet or server needed. Progress is stored in
that browser's localStorage, and the Export/Import buttons move it between
machines as a small JSON file.

Everything is inlined: the reader, the vendored libraries (marked, MathJax
tex-svg, Mermaid), the manifest, and every Markdown file as JSON.
"""
from __future__ import annotations
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def read(p: str) -> str:
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return f.read()


def main() -> None:
    files: dict[str, str] = {}
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in {"vendor", "tools", "offline", "reader", ".git", "__pycache__"}]
        for fn in filenames:
            if fn.endswith(".md") and not fn.startswith("_"):
                rel = os.path.relpath(os.path.join(dirpath, fn), ROOT).replace(os.sep, "/")
                files[rel] = read(rel)

    # </script> inside embedded JSON would terminate the script tag
    payload = json.dumps(files, ensure_ascii=False).replace("</", "<\\/")
    manifest = read("reader/manifest.js")
    css = read("reader/reader.css")
    app = read("reader/reader.js")
    marked = read("vendor/marked.min.js")
    mathjax = read("vendor/tex-svg.js")
    mermaid = read("vendor/mermaid.min.js")

    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PROPULSION — course (offline)</title>
<style>{css}</style>
<script>
  window.MathJax = {{ tex: {{ inlineMath: [['$', '$']], displayMath: [['$$', '$$']], processEscapes: true }},
                     svg: {{ fontCache: 'global' }}, startup: {{ typeset: false }} }};
</script>
<script>{marked}</script>
<script>{mathjax}</script>
<script>{mermaid}</script>
<script>mermaid.initialize({{ startOnLoad: false, theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default' }});</script>
<script>{manifest}</script>
<script>window.COURSE_FILES = {payload};</script>
</head>
<body>
<aside id="side">
  <header>
    <h1>PROPULSION</h1>
    <div id="progress"></div>
    <div id="progress-track"><div id="progress-bar"></div></div>
    <a id="resume" href="#" hidden></a>
  </header>
  <nav id="nav"></nav>
  <footer>
    <button id="export" title="Save your progress to a file">Export progress</button>
    <label title="Load a saved progress file">Import<input id="import" type="file" accept="application/json"></label>
    <button id="reset">Reset</button>
  </footer>
</aside>
<section id="main">
  <div id="topbar"><button id="menu">☰</button><h2 id="doc-title"></h2></div>
  <div id="toolbar" hidden></div>
  <article id="content"></article>
</section>
<script>{app}</script>
</body>
</html>
"""
    out_dir = os.path.join(ROOT, "offline")
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, "PROPULSION-course.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"wrote {out}: {len(files)} files, {os.path.getsize(out) / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
