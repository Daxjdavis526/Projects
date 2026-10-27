# Vendored libraries

Downloaded, not written here. Do not edit (and do not open the minified
bundles — they are hundreds of kilobytes on a line).

| directory | what | source | licence |
|---|---|---|---|
| `katex-0.19.0/` | KaTeX 0.19.0 (math typesetting) | npm `katex@0.19.0` | MIT |
| `fonts/` | Inter, Source Serif 4 and JetBrains Mono variable web fonts (Latin, Latin-ext and Greek subsets) | Fontsource packages on npm | SIL OFL 1.1 (`OFL-*.txt`) |
| `pyodide-314.0.7/` | Pyodide 314.0.7: CPython 3.14.2 compiled to WebAssembly, its standard library and lock file | GitHub release `pyodide/pyodide` 314.0.7 | MPL-2.0 (`LICENSE`) |
| `pyodide-314.0.7/*.whl` | Pyodide's own builds of NumPy 2.4.6, SciPy 1.18.0, Matplotlib 3.10.8 and Matplotlib's dependencies (contourpy, cycler, fonttools, kiwisolver, packaging, Pillow, pyparsing, python-dateutil, pytz, six) | the same release archive (`pyodide-314.0.7.tar.bz2`); each file's SHA-256 matches `pyodide-lock.json`, which Pyodide checks again when it loads them | NumPy, SciPy, contourpy, kiwisolver: BSD-3-Clause; Matplotlib: Matplotlib licence (PSF-based); Pillow: MIT-CMU; fonttools, pyparsing, cycler, six: MIT/BSD; python-dateutil: Apache-2.0/BSD; packaging: Apache-2.0/BSD; pytz: MIT |
| `pyodide-314.0.7/wheels/` | SymPy 1.14.0 and mpmath 1.4.1 (pure-Python wheels) | PyPI; hashes in `wheels/wheels.json`, checked by the worker before installing | BSD-3-Clause |
