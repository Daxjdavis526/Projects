# Technical architecture for The Physics Atlas (static files, no build, vendored, headless-testable)

_How these notes were made (2026-10-27): versions, release dates and licenses come from the npm registry JSON. Sizes were measured in this session from the published npm tarballs, downloaded to the session scratchpad and never into the repository. "gz" means `gzip -9` of that one file. KB = 1,024 bytes; "MB (10^6 B)" is marked where decimal megabytes are used. Timings were measured once each, on one machine, in this session: in headless Chromium (Playwright 1.63.0, files served from localhost by `python3 -m http.server`, so no network time is included) and in Node 22.22.0. Treat them as relative numbers, not absolute ones. The web-search budget ran out early, and this sandbox could not reach w3.org, mathlive.io, pyodide.org, developer.mozilla.org, docs.github.com, webwork.maa.org, cdn.jsdelivr.net, api.github.com or *.github.io. Documentation was therefore read from each project's own source files on raw.githubusercontent.com (MDN content, MDN browser-compat-data, github/docs, w3c/wcag, KaTeX, MathJax-docs, Pyodide, MicroPython, WeBWorK PG and so on). No vendored file inside the repository was opened._

## 1. Math typesetting: KaTeX vs MathJax (v3/v4). Versions, size, speed, self-hosted fonts, accessibility, ESM without a build

### Takeaway
KaTeX 0.19.0 should be the default renderer. It is one 74 KB-gz script plus CSS, with fonts fetched only as needed. It rendered about 0.5 ms per formula in the measured run. MathJax 4.1.3 took about 7 ms per formula synchronously and about 75 ms per formula through its full asynchronous pipeline with accessibility on. KaTeX emits MathML for assistive technology by default, self-hosts trivially, and runs in Node, so every TeX string in the course can be linted headlessly. MathJax 4 gives richer accessibility (generated speech and braille, plus an expression explorer), but it is several times heavier. Self-hosting it also needs extra configuration, because by default it fetches fonts from jsDelivr.

### Cited Findings
**KaTeX**
- Latest is katex 0.19.1 (published 2026-10-23, a single bug fix that allows the percent sign in raw arguments). The newest release at least two weeks old is 0.19.0 (2026-10-01). License: MIT. — [npm registry: katex](https://registry.npmjs.org/katex); [KaTeX CHANGELOG](https://raw.githubusercontent.com/KaTeX/KaTeX/main/CHANGELOG.md)
- Breaking changes after the 0.16.x line that worldline vendors (KaTeX 0.16.11):
  - 0.17.0 (2026-05-22) changed the internal `__defineFunction` API.
  - 0.18.0 (2026-07-17) prefixed KaTeX's CSS classes: "users who apply custom styles or have allowlists targeting KaTeX's internal classes must update their selectors".
  - 0.19.0 (2026-10-01) reports missing character metrics through `strict`, with error code `symbolNotInFont`.
  — [KaTeX CHANGELOG](https://raw.githubusercontent.com/KaTeX/KaTeX/main/CHANGELOG.md); [worldline/README.md](/home/user/Projects/worldline/README.md)
- Sizes in 0.19.0:
  - `dist/katex.min.js`: 266.5 KB (74.1 KB gz), a UMD build.
  - `dist/katex.mjs`: 588.8 KB (145.3 KB gz), an ES module. No minified ESM build is shipped.
  - `dist/katex.min.css`: 24,793 bytes.
  - `dist/fonts/`: 20 woff2 files, 253.7 KB in total. `@font-face` loads them on demand.
  - `contrib/mhchem.min.js`: 32.9 KB (8.2 KB gz).
  — measured from [katex-0.19.0.tgz](https://registry.npmjs.org/katex/-/katex-0.19.0.tgz)
- The UMD wrapper in `katex.min.js` uses `self` as its root object (falling back to `this`). Loaded as a classic script, or imported for side effects only, it therefore defines `self.katex`. — header inspected in [katex-0.19.0.tgz](https://registry.npmjs.org/katex/-/katex-0.19.0.tgz)
- The `output` option defaults to `htmlAndMathml`: "Outputs HTML for visual rendering and includes MathML for accessibility. This is the default." — [KaTeX docs/options.md](https://raw.githubusercontent.com/KaTeX/KaTeX/main/docs/options.md). Checked in this session: `renderToString` output contains `<math>` with an `annotation encoding="application/x-tex"`, and the visual HTML is marked `aria-hidden="true"`.
- KaTeX ships fonts as ttf, woff and woff2. The docs describe woff2 as "much smaller and faster to load". The font folder is configurable through the `$font-folder` SASS variable. — [KaTeX docs/font.md](https://raw.githubusercontent.com/KaTeX/KaTeX/main/docs/font.md)
- Speed, measured in headless Chromium: importing `katex.mjs` took 40 ms. Rendering 500 physics formulas into the DOM took 253 ms, about 0.5 ms each. The set included Maxwell's equations, the Einstein field equations, matrices and integrals. — measured in this session
- In Node 22, `katex.renderToString` works without a DOM, and malformed TeX throws `ParseError` when `throwOnError: true` is set. — measured in this session

**MathJax**
- Latest is mathjax 4.1.3 (2026-07-03). Earlier v4 releases: 4.0.0 on 2025-08-04, 4.1.0 on 2025-12-16, 4.1.1 on 2026-02-19, 4.1.2 on 2026-05-03. License: Apache-2.0. The v3 source package's last release, mathjax-full 3.2.2, dates from 2022-06-08. — [npm registry: mathjax](https://registry.npmjs.org/mathjax); [npm registry: mathjax-full](https://registry.npmjs.org/mathjax-full)
- Sizes of the 4.1.3 combined components:
  - `tex-chtml.js`: 974.1 KB (274.6 KB gz).
  - `tex-svg.js`: 1,806.3 KB (600.5 KB gz).
  - `tex-chtml-nofont.js`: 867.6 KB (250.5 KB gz).
  - The package also contains `sre/` (4.6 MB, the Speech Rule Engine) and `a11y/` (368 KB).
  — measured from [mathjax-4.1.3.tgz](https://registry.npmjs.org/mathjax/-/mathjax-4.1.3.tgz)
- In v4 the default font changed to `mathjax-newcm`, based on New Computer Modern, and 11 font sets are available. — [MathJax docs: What's new in 4.0, fonts](https://raw.githubusercontent.com/mathjax/MathJax-docs/master/upgrading/whats-new-4.0/fonts.rst). The font package `@mathjax/mathjax-newcm-font` 4.1.3 is 49.2 MB unpacked. Its CHTML set is 105 woff2 files totalling 1,585 KB, loaded per character range. — [npm registry](https://registry.npmjs.org/@mathjax%2Fmathjax-newcm-font); measured from [mathjax-newcm-font-4.1.3.tgz](https://registry.npmjs.org/@mathjax/mathjax-newcm-font/-/mathjax-newcm-font-4.1.3.tgz)
- **Self-hosting gotcha:** the 4.1.3 browser build sets `loader.paths.fonts` to `https://cdn.jsdelivr.net/npm/@mathjax` by default. In a test where MathJax itself was served locally, the page still requested `https://cdn.jsdelivr.net/npm/@mathjax/mathjax-newcm-font@4.1.3/...`. Typesetting failed with "dynamic file 'script' failed to load", triggered by `\ell`, until `loader.paths.fonts` was pointed at a local copy of the font package. — measured in this session; default visible in `tex-svg.js` of [mathjax-4.1.3.tgz](https://registry.npmjs.org/mathjax/-/mathjax-4.1.3.tgz)
- Accessibility in v4: every combined configuration now includes the expression explorer and the Speech Rule Engine (SRE). SRE generates speech that screen readers receive through `aria-label` and `aria-braille-label`, and expressions are focusable so they can be explored. v3's hidden-MathML approach was dropped because, for example, "the current VoiceOver version doesn't read the mathematics and skips it entirely". — [MathJax docs: explorer](https://raw.githubusercontent.com/mathjax/MathJax-docs/master/upgrading/whats-new-4.0/explorer.rst). In this session a converted formula received the label "E equals m c squared plus 0, math".
- ESM: "Beginning with version 4, MathJax offers both MJS and CJS versions". These are the `@mathjax/src` package: 33.7 MB, 4,287 files. The combined components are classic scripts. — [MathJax docs: ES6 modules](https://raw.githubusercontent.com/mathjax/MathJax-docs/master/upgrading/whats-new-4.0/es6-modules.rst); [npm registry: @mathjax/src](https://registry.npmjs.org/@mathjax%2Fsrc)
- Speed, measured with the same 500 formulas and local fonts:
  - Startup (script plus `startup.promise`): 158–165 ms.
  - Page-level `typesetPromise`: 37–39 s.
  - Sequential `tex2chtmlPromise`: 28.1 s. Sequential `tex2svgPromise`: 36.9 s.
  - Synchronous `tex2chtml` after a warm-up: 7.0–7.35 ms per formula.
  - Caveat: passing `options: {enableSpeech:false, enableBraille:false, enableEnrichment:false, enableExplorer:false}` did not change the document's options (all stayed `true`). The accessibility pipeline's share of the cost was therefore not isolated.
  — measured in this session
- In this repository, cryogenics already uses MathJax (`vendor/tex-svg.js`) together with `vendor/marked.min.js`, both loaded as classic scripts. — [cryogenics/index.html](/home/user/Projects/cryogenics/index.html)

### Inferences
- Use KaTeX for all lesson, practice and feedback math. Vendor `katex.mjs` and import it through the import map, so the browser and the Node tests run the identical file. Alternatively, vendor `katex.min.js` and read `globalThis.katex`, which is the repo's "prefer minified" choice. The trade-off is roughly 71 KB gz more for the ESM file.
- Pin 0.19.0 now. 0.19.1 passes the two-week rule on 2026-11-06. Because 0.18 renamed KaTeX's CSS classes, do not copy worldline's 0.16-era KaTeX style overrides.
- Treat MathJax 4 as an optional, lazy-loaded "enhanced math accessibility" mode, used only if speech, braille or the explorer becomes a hard requirement. Budget at least 275 KB gz of JS, the woff2 fonts and the 4.6 MB `sre/` directory, and set `loader.paths.fonts` to a local folder. Without that, the page silently depends on jsDelivr, which breaks the repo's no-CDN rule and offline use.
- For key equations, KaTeX's MathML is the screen-reader path. Authors can add short text alternatives, for example a `speech` field in content, that the renderer writes into `aria-label` on a wrapping element.

### Gaps
- No independent published benchmarks were consulted, because the search budget was exhausted. The speed figures come from one headless machine.
- The correct v4 configuration keys for turning speech, braille and enrichment off were not found.
- How current VoiceOver, NVDA and JAWS read KaTeX's MathML was not tested. MathJax's own docs report VoiceOver problems with hidden MathML, which may also affect KaTeX's approach.
- The license of KaTeX's font files (separate from the MIT package license) was not checked.

## 2. Math answer input and checking: MathLive, Compute Engine, math.js, nerdamer, Algebrite; randomized numeric equivalence; tolerances, significant figures, units

### Takeaway
Use MathLive 0.111.1 as an optional, lazy-loaded math input field. Put answer checking in a small, DOM-free checker written in-house on top of math.js 15.2.0, which provides parsing, compilation, complex numbers and units, and loads in Node through `createRequire`. The checker should use randomized numeric sampling with WeBWorK's defaults (5 points in [-2, 2], relative tolerance 1e-4, absolute comparison near zero), plus explicit modes for domains, additive constants, numeric tolerance and significant figures, and units. The Cortex Compute Engine does stochastic identity checking, but it is 1.2–1.6 MB gz and shipped 12 releases in 6 days, including breaking changes. That makes it too heavy and volatile to be the core dependency.

### Cited Findings
**MathLive**
- mathlive 0.111.1 (2026-10-09), MIT, with no runtime dependencies. — [npm registry: mathlive](https://registry.npmjs.org/mathlive)
- 0.111.1 fixes several cross-site scripting (XSS) vulnerabilities: the `\enclose` shadow option, `\htmlData`/`\href` values and the MathML `notation` attribute. Speakable text is now inserted as text rather than HTML. — [MathLive CHANGELOG](https://raw.githubusercontent.com/arnog/mathlive/master/CHANGELOG.md)
- Features listed in the README: "Mobile-ready virtual keyboards and physical keyboard shortcuts"; "Export/import as LaTeX, MathML, ASCIIMath, Typst, or MathJSON"; "Screen-reader friendly with math-to-speech and ARIA labels". — [MathLive README](https://raw.githubusercontent.com/arnog/mathlive/master/README.md)
- Size: `mathlive.min.mjs` is 823.3 KB (221.5 KB gz), a single ES module with no imports. The package also carries the same 20 KaTeX woff2 fonts (253.7 KB). — measured from [mathlive-0.111.1.tgz](https://registry.npmjs.org/mathlive/-/mathlive-0.111.1.tgz)
- The bundle finds a Compute Engine through `globalThis.MathfieldElement.computeEngine` and a `Symbol.for("io.cortexjs.compute-engine")` global, so the Compute Engine is optional. — inspected (grep) in [mathlive-0.111.1.tgz](https://registry.npmjs.org/mathlive/-/mathlive-0.111.1.tgz)

**Cortex Compute Engine**
- `@cortex-js/compute-engine` 0.170.0 was published 2026-10-27. The newest release at least two weeks old is 0.152.0 (2026-10-11). Twelve releases appeared between 0.161.0 (2026-10-22) and 0.170.0. License: MIT. — [npm registry](https://registry.npmjs.org/@cortex-js%2Fcompute-engine)
- Breaking changes in 0.170.0: "The package is ESM only, and Node 22.12 or later is required." The UMD builds and the `ComputeEngine` script-tag global were removed; "The published files drop from 61 MB to 24 MB". — [Compute Engine CHANGELOG](https://raw.githubusercontent.com/cortex-js/compute-engine/main/CHANGELOG.md)
- Payload (decimal MB):
  - 0.152.0: the main entry (`dist/esm-min/compute-engine.js`) plus its static imports is 3 files, 4.18 MB (1.23 MB gz). The integration rules are opt-in through `loadIntegrationRules()` and add 8.04 MB (0.66 MB gz).
  - 0.170.0: the main entry including dynamically imported chunks is 21 files, 5.29 MB (1.58 MB gz).
  - The main entry uses no bare module specifiers, so it needs no import-map entries.
  — measured from [compute-engine-0.152.0.tgz](https://registry.npmjs.org/@cortex-js/compute-engine/-/compute-engine-0.152.0.tgz) and [compute-engine-0.170.0.tgz](https://registry.npmjs.org/@cortex-js/compute-engine/-/compute-engine-0.170.0.tgz)
- Equality semantics, from the 0.152.0 type documentation:
  - `isSame` is a structural comparison.
  - `isEqual` compares values within `engine.tolerance`. When an expression has free variables, the result is `undefined` unless the canonical forms coincide or an assumption decides it: "`(x+1)^2` vs `x^2+2x+1`, and even `x+x` vs `2x`, are `undefined`".
  - `isIdenticallyEqual` "is established by stochastic sampling (evaluating both expressions at random points), falling back to a symbolic expand-and-simplify proof". Disagreement at sampled points returns `undefined`, not `false`, and "Richardson's theorem makes a complete decision procedure impossible".
  — `dist/types/compute-engine/types-expression.d.ts` in [compute-engine-0.152.0.tgz](https://registry.npmjs.org/@cortex-js/compute-engine/-/compute-engine-0.152.0.tgz)
- The Compute Engine also models quantities with units; for example, `30 deg = π/6` evaluates to `True`, and `Quantity(2, m)` comparisons work. — [Compute Engine CHANGELOG](https://raw.githubusercontent.com/cortex-js/compute-engine/main/CHANGELOG.md)

**math.js**
- mathjs 15.2.0 (2026-04-07), Apache-2.0. `lib/browser/math.js` is 634.5 KB (171.0 KB gz). The ESM build imports 9 packages by bare specifier: @babel/runtime, complex.js, decimal.js, escape-latex, fraction.js, javascript-natural-sort, seedrandom, tiny-emitter and typed-function. — [npm registry: mathjs](https://registry.npmjs.org/mathjs); measured from [mathjs-15.2.0.tgz](https://registry.npmjs.org/mathjs/-/mathjs-15.2.0.tgz)
- The browser bundle's UMD wrapper passes `this` as its root and assigns `e.math`. At the top level of an ES module, `this` is undefined, so the bundle must be loaded as a classic `<script>` (the header was inspected). In Node it loads through `createRequire` and reports `math.version === "15.2.0"`. — measured in this session
- API: `math.evaluate`, `math.compile`, `math.parse` and `math.parser()`. — [math.js docs: parsing](https://raw.githubusercontent.com/josdejong/mathjs/develop/docs/expressions/parsing.md). The docs say the parser "offers a sandboxed environment" but "It's possible though that there are unknown security vulnerabilities". — [math.js docs: security](https://raw.githubusercontent.com/josdejong/mathjs/develop/docs/expressions/security.md)
- Units: `math.unit('90 km/h')`, `.to('cm')`, `.toNumber('gram')`, `.equals()` and `.equalBase()`, which checks that two units have the same dimension. — [math.js docs: units](https://raw.githubusercontent.com/josdejong/mathjs/develop/docs/datatypes/units.md). Checked in this session: 36 km/h converts to 10 m/s; `unit('5 N').equalBase(unit('1 kg m / s^2'))` is `true`, and against `5 J` it is `false`.

**nerdamer and Algebrite**
- nerdamer 2.0.0 (2026-10-02) is "a TypeScript rewrite of Nerdamer" that keeps the string-based API. Its LICENSE file is Apache 2.0. `dist/bundle.js` is a 528.1 KB (131.7 KB gz) webpack UMD build, and the `exports` map offers only `require`/`default` conditions. TeX helpers: `convertToTeX` and `convertFromLaTeX`. — [nerdamer README](https://raw.githubusercontent.com/jiggzson/nerdamer/master/README.md); [npm registry](https://registry.npmjs.org/nerdamer); measured from [nerdamer-2.0.0.tgz](https://registry.npmjs.org/nerdamer/-/nerdamer-2.0.0.tgz)
- nerdamer-prime 1.5.0 (2026-07-24) is an MIT-licensed fork that ships `all.esm.min.mjs`, 472.2 KB (170.2 KB gz). — [npm registry](https://registry.npmjs.org/nerdamer-prime); measured from [nerdamer-prime-1.5.0.tgz](https://registry.npmjs.org/nerdamer-prime/-/nerdamer-prime-1.5.0.tgz)
- Algebrite 1.4.0 (2021-04-14), MIT. The browser bundle is 830.7 KB (163.8 KB gz). There has been no release since April 2021. — [npm registry](https://registry.npmjs.org/algebrite); measured from [algebrite-1.4.0.tgz](https://registry.npmjs.org/algebrite/-/algebrite-1.4.0.tgz)

**Randomized numeric equivalence (the standard practice)**
- WeBWorK's PG engine compares Formula answers at random test points. Defaults: `num_points` 5; variable `limits` [-2, 2]; `granularity` 1000; `tolerance` 1E-4 with `tolType` 'relative'; `zeroLevel` 1E-14 and `zeroLevelTol` 1E-12 (values near zero are compared absolutely). Authors can fix or add points with `test_points` and `test_at`. `checkUndefinedPoints` (default 0) and `max_undefined` control how points where an expression is undefined are handled. — [PG lib/Value/Formula.pm](https://raw.githubusercontent.com/openwebwork/pg/main/lib/Value/Formula.pm)
- A minimal sampler written in this session used math.js `compile`, 5 points in [-2, 2], relative tolerance 1e-4, and resampled points where a result was not a real number. Results:
  - sin²x + cos²x vs 1 → `true`.
  - (x+1)² vs x²+2x+1 → `true`.
  - √(x²) vs x → `false`.
  - (a+b)² vs a²+b² → `false`.
  - log(x²) vs 2 log x → `true`. This is wrong: math.js returns complex values for the log of a negative number, so only x > 0 survived. It is a domain pitfall.
  - x³/3 vs x³/3 + 7 → `false`. This is the constant-of-integration pitfall.
  - e^{iπ} vs −1 → `undefined`, because the complex result was skipped.
  - 1,000 such checks ran in 69 ms in Node.
  — measured in this session

### Inferences
- **Checker architecture** (`src/core/check/`, DOM-free, shared by the UI and the Node validators):
  - **Numeric answers:** pass when |a − b| ≤ max(atol, rtol·|b|). A significant-figures rule, when a question requires one, counts digits from the learner's string, not from the parsed float.
  - **Units:** parse the answer with `math.unit`. Require `equalBase(expected)`, then compare `toNumber` in SI units. Give feedback that tells "wrong unit dimension" apart from "wrong value".
  - **Expressions:** sample with the WeBWorK defaults, but let the author declare a domain per variable (for example x ∈ [0.5, 3] for logs and roots, integers for n). Treat "defined on one side, undefined on the other" as not equivalent, in the spirit of `checkUndefinedPoints`. Compare complex values when the question allows them, and seed the random number generator so every failure can be reproduced.
  - **Answer modes:**
    - "Up to an additive constant", for antiderivatives: check that a − b is constant across the sample points.
    - "Modulo 2π", for angles.
    - "Equation equivalence": compare normalized residuals, or solve for a named variable.
    - "Form" requirements, such as expanded, factored or simplified. Sampling cannot see form, so inspect the math.js parse tree (allowed functions and operators, node counts).
  - **Trig and special points:** sample away from 0, ±1 and multiples of π/2, and add points for periodic functions.
- **Input:** plain text with calculator syntax (`x^2 + 2*x`) covers most items, and math.js parses it directly. Load MathLive only for questions that need structured symbolic entry (fractions, roots, vectors). The integration risk is the step from MathLive to the checker. MathLive exports ASCIIMath and LaTeX, while math.js parses its own syntax. That needs a small, tested normalizer, or a Compute Engine adapter. Prototype it early.
- **Compute Engine:** keep it as a later option behind an adapter, for LaTeX → MathJSON → evaluation. If adopted, pin 0.152.0 now, or 0.170.x after 2026-11-10 (ESM-only), and load it only on the pages that need it.
- The same checker validates the authored content in Node. Answer keys must pass. Every distractor must fail against the answer and must not be equivalent to any other distractor.

### Gaps
- How well MathLive's ASCIIMath output parses in math.js was not tested.
- Whether math.js can parse LaTeX input was not checked in its docs this session; the working assumption is that it cannot.
- Whether MathLive can import and run in Node was not tested. Tests should not depend on it.
- The Schwartz–Zippel lemma (random points reliably separate distinct polynomials) is general background, not sourced in this session.

## 3. Plotting and interactive graphics: custom Canvas2D/SVG vs JSXGraph, function-plot, uPlot, Plotly, D3; three.js for 3D

### Takeaway
The minimal set is an in-house Canvas2D/SVG kit (axes, adaptive function sampling, vector fields and streamlines, phase portraits, draggable handles with keyboard alternatives) running on DOM-free math, plus three.js for 3D surfaces, geodesics and fields. Add uPlot (21.5 KB gz) only for large time-series plots. JSXGraph is the strongest off-the-shelf 2D option, with keyboard and ARIA hooks, but costs 251 KB gz. Plotly (1.44 MB gz) and full D3 are not needed. three.js r186 no longer ships minified builds on npm, so vendor r185's minified files, or accept r186 unminified (about 408 KB gz).

### Cited Findings
- JSXGraph: 1.14.0 (2026-10-05) is the newest release at least two weeks old; 1.14.1 came out 2026-10-21 and 1.14.2 on 2026-10-26. License: MIT OR LGPL-3.0-or-later. `distrib/jsxgraphcore.mjs` is 1,001.4 KB (251.4 KB gz) as ESM. The npm package is 74.6 MB unpacked. — [npm registry: jsxgraph](https://registry.npmjs.org/jsxgraph); measured from [jsxgraph-1.14.0.tgz](https://registry.npmjs.org/jsxgraph/-/jsxgraph-1.14.0.tgz)
- JSXGraph board options include `keyboard: {enabled, dx, dy, panShift, panCtrl}` and `aria: {enabled: false, label: '', live: 'assertive'}`. The board `title` "is implemented with the attribute 'aria-label' in the JSXGraph container". — `src/options.js` in [jsxgraph-1.14.0.tgz](https://registry.npmjs.org/jsxgraph/-/jsxgraph-1.14.0.tgz)
- function-plot 1.26.0 (2026-10-11), MIT. `dist/function-plot.js` is 206.5 KB (60.8 KB gz), a UMD build with root `self`. Its ESM entry (`dist/index.js`) imports by bare specifier d3-axis, d3-color, d3-format, d3-interpolate, d3-scale, d3-selection, d3-shape, d3-zoom, built-in-math-eval, interval-arithmetic-eval and events. — [npm registry](https://registry.npmjs.org/function-plot); measured from [function-plot-1.26.0.tgz](https://registry.npmjs.org/function-plot/-/function-plot-1.26.0.tgz)
- uPlot 1.6.32 (2025-03-14), MIT. `uPlot.iife.min.js` is 49.9 KB (21.5 KB gz). `uPlot.esm.js` is 142.0 KB (40.7 KB gz) and unminified. The CSS is 1.8 KB. — [npm registry](https://registry.npmjs.org/uplot); measured from [uplot-1.6.32.tgz](https://registry.npmjs.org/uplot/-/uplot-1.6.32.tgz)
- Plotly 4.1.2 (2026-10-05), MIT. `plotly.min.js` is 4,721.1 KB (1,441.6 KB gz). The "basic" bundle is 1,170.4 KB (389.0 KB gz). — [npm registry](https://registry.npmjs.org/plotly.js-dist-min); measured from [plotly.js-dist-min-4.1.2.tgz](https://registry.npmjs.org/plotly.js-dist-min/-/plotly.js-dist-min-4.1.2.tgz) and [plotly.js-basic-dist-min-4.1.2.tgz](https://registry.npmjs.org/plotly.js-basic-dist-min/-/plotly.js-basic-dist-min-4.1.2.tgz)
- D3 7.9.0 (2024-03-12), ISC. `dist/d3.min.js` is 273.2 KB (90.3 KB gz). — [npm registry](https://registry.npmjs.org/d3); measured from [d3-7.9.0.tgz](https://registry.npmjs.org/d3/-/d3-7.9.0.tgz)
- three.js minified builds:
  - The latest npm release is 0.186.1 (2026-09-24), MIT. Its `build/` directory contains no minified files: `three.module.js` is 647.2 KB (127.7 KB gz) and `three.core.js` is 1,423.9 KB (279.8 KB gz).
  - The 0.180.0–0.185.0 tarballs do include `three.module.min.js` and `three.core.min.js`. In 0.185.0 they are 357.0 KB (84.5 KB gz) and 376.4 KB (98.6 KB gz).
  — [npm registry: three](https://registry.npmjs.org/three); measured from [three-0.186.1.tgz](https://registry.npmjs.org/three/-/three-0.186.1.tgz) and [three-0.185.0.tgz](https://registry.npmjs.org/three/-/three-0.185.0.tgz)
- The three.js migration guide's "185 → 186" section does not mention dropping the minified builds; it opens with `Object3D` gaining a `dispose()` method. A "186 → 187" section already exists. — [three.js Migration Guide (wiki source)](https://raw.githubusercontent.com/wiki/mrdoob/three.js/Migration-Guide.md)
- This repo's convention: the import map maps `"three"` to `./vendor/three/three.module.min.js` and `"three/addons/"` to `./vendor/three/jsm/`. redline vendors r180. — [redline/index.html](/home/user/Projects/redline/index.html); [redline/README.md](/home/user/Projects/redline/README.md); [CLAUDE.md](/home/user/Projects/CLAUDE.md)

### Inferences
- **In-house 2D kit**, split into two layers:
  - `src/viz/math/` (DOM-free, tested in Node): adaptive function sampling that refines where curvature is high and breaks lines at discontinuities or NaN, grid and tick generation, RK4/RK45 streamlines and phase-portrait integration, and contour marching squares (or vendor the 49 KB d3-contour module).
  - `src/viz/draw/` (Canvas2D/SVG): a thin drawing layer. Use SVG for small, interactive, accessible scenes, where handles can be real focusable elements, and Canvas for dense fields.
  - This matches the repo's "keep simulation state separate from rendering" rule and the redline/worldline layout.
- **three.js:** vendor `three.module.min.js` and `three.core.min.js` from r185 (0.185.1 was released 2026-07-01 but not inspected), plus the needed `jsm/` addons (OrbitControls; Line2 for geodesics). Use the repo's import-map pattern and load it only when a 3D figure scrolls into view, as redline does. If r186+ features are needed, the unminified files cost about 225 KB more gz. Minifying them would be a build step, which the repo avoids.
- Load uPlot only where long simulated time series appear, for example an oscillator energy trace. Load JSXGraph only if a geometry-construction lesson family justifies 251 KB gz, and only on those pages. Skip Plotly and full D3.

### Gaps
- Whether three.js deliberately dropped minified builds in r186, and whether it will restore them, was not confirmed from release notes; the GitHub release pages were unreachable.
- No accessible-visualization libraries beyond JSXGraph's options were evaluated.

## 4. Real Python in the browser: Pyodide (version, self-hosting, sizes, load time, workers, interrupts, COOP/COEP, coi-serviceworker, offline, GitHub Pages limits, licensing) vs MicroPython+ulab, Skulpt, Brython, PyScript, custom sandbox

### Takeaway
Pyodide 314.0.7 (CPython 3.14.2) is the only option here that runs real numpy, scipy, matplotlib and sympy. Vendor its roughly 13.5 MB core plus only the 15 wheels that stack needs, and load it in a module Web Worker the first time a code cell runs. Stop runaway code by terminating the worker. True interrupts need a SharedArrayBuffer, hence cross-origin isolation, which GitHub Pages cannot provide without a service-worker workaround. MicroPython 1.29 with ulab (236 KB gz, starts in 39 ms) suits instant, tiny exercises, but it cannot be interrupted and offers only a numpy-like subset. Skulpt is stale and Python-2-era, Brython has no numpy, and PyScript is entering maintenance mode.

### Cited Findings
**Pyodide versions and breaking changes**
- pyodide 314.0.7 (2026-09-14) carries the npm `latest` tag. 314.0.0 (2026-06-09) "Upgraded to Python 3.14.2" and upgraded Emscripten to 5.0.3. Other tags: `next` is 315.0.0-alpha.2, and maintenance releases 0.29.5 and 0.27.8 shipped on 2026-09-16. License: MPL-2.0. — [npm registry: pyodide](https://registry.npmjs.org/pyodide); [Pyodide changelog](https://raw.githubusercontent.com/pyodide/pyodide/main/docs/project/changelog.md)
- Breaking changes in 314.0.0:
  - `pyodide.asm.js` was renamed `pyodide.asm.mjs`, and "Classic (non-module) workers: No longer supported".
  - The standard library is no longer split out: sqlite3 and lzma are bundled.
  - `ssl` is a stub, and OpenSSL hash functions were removed.
  — [Pyodide changelog](https://raw.githubusercontent.com/pyodide/pyodide/main/docs/project/changelog.md)
- The worker guide says Pyodide must run as an "ES module. Classic workers using `importScripts()` are not supported", and creates the worker with `new Worker("./webworker.mjs", { type: "module" })`. — [Pyodide docs: webworker](https://raw.githubusercontent.com/pyodide/pyodide/main/docs/usage/webworker.md). Module workers are supported in Chrome 80, Firefox 114 and Safari 15. — [MDN browser-compat-data: Worker](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/Worker.json)

**Self-hosting and sizes**
- Core files (the npm package, which matches pyodide-core):
  - `pyodide.asm.wasm`: 9,373.3 KB (3,446.1 KB gz).
  - `python_stdlib.zip`: 2,486.0 KB (2,444.5 KB gz; it is already compressed).
  - `pyodide.asm.mjs`: 1,221.0 KB (253.9 KB gz).
  - `pyodide-lock.json`: 116.3 KB (25.7 KB gz).
  - `pyodide.mjs`: 17.5 KB.
  - Total: about 13.5 MB raw and 6.3 MB gz (10^6 B).
  — measured from [pyodide-314.0.7.tgz](https://registry.npmjs.org/pyodide/-/pyodide-314.0.7.tgz)
- From the Pyodide deployment docs:
  - The full distribution "is quite large (200+ megabytes)".
  - `pyodide-core` is "the minimal set of files needed to start Pyodide", the same files that `npm install pyodide` installs.
  - "Any service that hosts static files and that correctly sets the WASM MIME type and CORS headers will work. For instance, you can use GitHub Pages."
  - The full release adds `*.whl` wheels, `*.metadata` files, `*.zip` shared libraries, `fonts/` (used by matplotlib-pyodide), `*-tests.tar` and `console.html`.
  — [Pyodide docs: downloading and deploying](https://raw.githubusercontent.com/pyodide/pyodide/main/docs/usage/downloading-and-deploying.md)
- The 314.0.7 lockfile lists Python 3.14.2, platform `emscripten_5_0_3`, ABI 2026_0 and 357 packages. Dependency closures:
  - numpy 2.4.6: 1 package.
  - scipy 1.18.0: scipy plus numpy.
  - matplotlib 3.10.8: 12 packages. It adds contourpy 1.3.3, cycler 0.12.1, fonttools 4.62.1, kiwisolver 1.5.0, numpy, packaging 26.1, pillow 12.2.0, pyparsing 3.3.2, python-dateutil 2.9.0.post0, pytz 2026.1.post1 and six 1.17.0.
  - sympy 1.14.0: sympy plus mpmath 1.4.1.
  - All four together: 15 packages.
  — `pyodide-lock.json` in [pyodide-314.0.7.tgz](https://registry.npmjs.org/pyodide/-/pyodide-314.0.7.tgz)
- PyPI wheel sizes for the pure-Python packages in that closure: sympy 6.30 MB, fonttools 1.15 MB, mpmath 0.57 MB, pytz 0.51 MB, python-dateutil 0.23 MB, pyparsing 0.12 MB, packaging 0.10 MB, cycler and six 0.01 MB each. PyPI carries no Emscripten/Pyodide wheels for numpy, scipy, matplotlib, pillow, contourpy or kiwisolver. — [PyPI: sympy 1.14.0](https://pypi.org/pypi/sympy/1.14.0/json); [PyPI: numpy 2.4.6](https://pypi.org/pypi/numpy/2.4.6/json); [PyPI: fonttools 4.62.1](https://pypi.org/pypi/fonttools/4.62.1/json); [PyPI: mpmath 1.4.1](https://pypi.org/pypi/mpmath/1.4.1/json)
- Licenses from PyPI metadata: numpy "BSD-3-Clause AND 0BSD AND MIT AND Zlib AND CC0-1.0"; sympy BSD; mpmath BSD-3-Clause; pillow MIT-CMU; matplotlib its own license agreement. — [PyPI: numpy](https://pypi.org/pypi/numpy/2.4.6/json); [PyPI: pillow](https://pypi.org/pypi/pillow/12.2.0/json); [PyPI: matplotlib](https://pypi.org/pypi/matplotlib/3.10.8/json)

**Interrupts and cross-origin isolation**
- Pyodide interrupts require Pyodide to run in a web worker and a `SharedArrayBuffer` passed to `pyodide.setInterruptBuffer`. Writing `2` raises `KeyboardInterrupt`, and "your server must set appropriate security headers". `pyodide.checkInterrupt` covers JavaScript functions called from Python. — [Pyodide docs: interrupting execution](https://raw.githubusercontent.com/pyodide/pyodide/main/docs/usage/keyboard-interrupts.md)
- Shared memory requires a secure context and a cross-origin-isolated document; check with `crossOriginIsolated`. — [MDN: SharedArrayBuffer (source)](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/javascript/reference/global_objects/sharedarraybuffer/index.md). SharedArrayBuffer is supported in Chrome 68, Firefox 79 and Safari 15.2. — [MDN browser-compat-data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/builtins/SharedArrayBuffer.json)
- coi-serviceworker 0.1.7 (2023-07-09), MIT; the minified file is 2.2 KB (0.9 KB gz). — [npm registry](https://registry.npmjs.org/coi-serviceworker). Per its README:
  - It provides "Cross-origin isolation (COOP and COEP) through a service worker for situations in which you can't control the headers (e.g. GH pages)".
  - It "will reload the page on the user's first load".
  - It "must be in a separate file", it "can't be loaded from a CDN", and the page must be served over HTTPS or from localhost.
  - Options: `shouldRegister`, `shouldDeregister`, `coepCredentialless`, `coepDegrade` and `doReload`.
  — [coi-serviceworker README](https://raw.githubusercontent.com/gzuidhof/coi-serviceworker/master/README.md)
- The Cross-Origin-Embedder-Policy header is supported in Chrome 83, Firefox 79 and Safari 15.2. Its `credentialless` value is supported in Chrome 96 and Firefox 119, and not in Safari. — [MDN browser-compat-data: COEP](https://raw.githubusercontent.com/mdn/browser-compat-data/main/http/headers/Cross-Origin-Embedder-Policy.json)

**Measured load times**
- Pyodide in headless Chromium, from localhost:
  - Core-only `loadPyodide()`: 3.7 s.
  - Pure-Python `sum(i*i for i in range(10**6))`: 204 ms.
  - `crossOriginIsolated` was `false` on the plain static server.
  — measured in this session

**MicroPython and ulab**
- `@micropython/micropython-webassembly-pyscript` 1.29.0-6 (2026-08-24), MIT. Files:
  - `micropython.mjs`: 107.5 KB (30.1 KB gz).
  - `micropython.wasm`: 439.0 KB (192.7 KB gz).
  - `micropython-ulab.wasm`: 626.5 KB (235.9 KB gz).
  - Variants with settrace: 480.9 KB and 668.4 KB.
  — [npm registry](https://registry.npmjs.org/@micropython%2Fmicropython-webassembly-pyscript); measured from [micropython-webassembly-pyscript-1.29.0-6.tgz](https://registry.npmjs.org/@micropython/micropython-webassembly-pyscript/-/micropython-webassembly-pyscript-1.29.0-6.tgz)
- Measured: `loadMicroPython()` took 39 ms. The same loop took 1,138 ms, about 5.6× slower than Pyodide. — measured in this session
- The MicroPython webassembly README: "MicroPython code execution will suspend the browser so be sure to atomize usage within this environment. Unfortunately interrupts have not been implemented for the browser." — [MicroPython ports/webassembly README](https://raw.githubusercontent.com/micropython/micropython/master/ports/webassembly/README.md)
- ulab is "a `numpy`-like array manipulation library for micropython", with ndarrays of one to four dimensions; 8- and 16-bit integer dtypes, float, and optionally complex. — [ulab README](https://raw.githubusercontent.com/v923z/micropython-ulab/master/README.md)

**Other runtimes**
- Skulpt 1.2.0 (2021-03-25), MIT. `skulpt.min.js` is 546.3 KB (135.7 KB gz) and `skulpt-stdlib.js` 397.8 KB (91.2 KB gz). The README still calls it "a Javascript implementation of Python 2.x", with Python 3 work listed as a priority. — [npm registry](https://registry.npmjs.org/skulpt); [Skulpt README](https://raw.githubusercontent.com/skulpt/skulpt/master/README.md)
- Brython 3.15.0 (2026-10-10), BSD-3-Clause. `brython.min.js` is 973.1 KB (230.3 KB gz) and `brython_stdlib.js` 4,918.9 KB (1,064.7 KB gz). The README describes "an implementation of Python 3 running in the browser, with an interface to the DOM". — [npm registry](https://registry.npmjs.org/brython); [Brython README](https://raw.githubusercontent.com/brython-dev/brython/master/README.md)
- PyScript: `@pyscript/core` 0.7.31 (2026-07-13), Apache-2.0. The README's announcement reads "PyScript is entering maintenance mode". — [npm registry](https://registry.npmjs.org/@pyscript%2Fcore); [PyScript README](https://raw.githubusercontent.com/pyscript/pyscript/main/README.md)

**Hosting limits**
- GitHub warns on files over 50 MiB and blocks files over 100 MiB. Repositories should ideally stay under 1 GB, and under 5 GB is "strongly recommended". — [GitHub docs: large files](https://raw.githubusercontent.com/github/docs/main/content/repositories/working-with-files/managing-large-files/about-large-files-on-github.md); [size variables](https://raw.githubusercontent.com/github/docs/main/data/variables/large_files.yml)
- GitHub Pages limits: published sites "may be no larger than 1 GB"; source repositories have a recommended limit of 1 GB; deployments time out after 10 minutes; soft limits of 100 GB bandwidth per month and 10 builds per hour; HTTP 429 when rate-limited. — [GitHub docs: Pages limits](https://raw.githubusercontent.com/github/docs/main/content/pages/getting-started-with-github-pages/github-pages-limits.md)
- This repository today: the working tree is 129 MB excluding `.git`, and `.git` is 75 MB. — measured (`du`) in this session

### Inferences
- **What to vendor:**
  - `atlas/vendor/pyodide-314.0.7/` holds the core five files plus `pyodide.js` if a legacy entry is wanted, the 15 wheels for numpy, scipy, matplotlib and sympy, any shared-library `.zip` files those wheels list, and the license files.
  - Obtain the wheels once from the `pyodide-314.0.7.tar.bz2` release asset.
  - Add a Node test that recomputes each vendored wheel's sha256 and compares it with `pyodide-lock.json`. That makes vendoring tamper- and mistake-proof without any build step.
  - Packages that are not vendored fail loudly in `loadPackage`, which is the desired behavior.
- **How to load:**
  - Create a module worker (`src/py/worker.mjs`) only when the learner first runs code, or prefetch its files when a programming lesson opens.
  - Each lesson declares its package requirements, and the worker calls `loadPackage([...])`.
  - Render matplotlib off-DOM (Agg to PNG or SVG bytes) and post the image back.
  - Show a staged progress bar: core of about 6 MB gz, then each wheel.
- **How to stop code:**
  - Always provide Stop as `worker.terminate()` followed by a fresh worker. That costs about 3.7 s plus package reloads, and loses Python state.
  - Add SharedArrayBuffer interrupts only as an enhancement when `crossOriginIsolated` is true.
  - To get isolation on Pages, inject COOP/COEP from the Atlas's own service worker, following the coi-serviceworker technique, rather than running a second service worker. Only one service worker can control a scope.
  - Accept the costs: isolation starts only after a reload. Safari has no COEP `credentialless` and needs `require-corp`, which blocks any future cross-origin embeds; everything vendored is same-origin, so that is acceptable.
  - Add a main-thread watchdog (for example 10–30 s) that terminates silent runaway code.
- **Offline:** use cache-first, keyed by the versioned path `vendor/pyodide-314.0.7/`. Offer an explicit "Download Python for offline" action, because tens of megabytes should not be precached silently.
- **Budget:** the core is about 13.5 MB in the repo. sympy alone adds 6.3 MB, and the compiled numpy, scipy and matplotlib wheels were not measured. The total is far below the 100 MiB per-file and 1 GB site limits, but every Pyodide upgrade adds tens of megabytes to git history permanently, so upgrade rarely (about yearly).
- **License:** MPL-2.0 is file-level copyleft. Redistributing the unmodified files with their license is compatible with a static site. Keep each package's license file next to its wheels.
- **MicroPython+ulab:** optional "instant Python" for the first programming lessons (print, loops, functions, small arrays). It must also run in a worker, because it blocks the thread and has no browser interrupts. Running two runtimes doubles the testing surface, so defer it to a later phase.
- **Custom numeric sandbox:** for calculator-style exercises, evaluate math.js expressions in a worker as well. math.js's own docs warn of possible unknown sandbox vulnerabilities. That matters little for a single-user static site but argues against eval-style designs.

### Gaps
- Sizes of the compiled Pyodide wheels (numpy, scipy, matplotlib, pillow, contourpy, kiwisolver) and of the GitHub release tarballs were not measured: cdn.jsdelivr.net, github.com release downloads and api.github.com were blocked from this sandbox.
- Whether GitHub Pages gzip-compresses `.wasm` and `.mjs` responses, and what Cache-Control it sends (often reported as `max-age=600`), was not verified; *.github.io was blocked. The gzip numbers above are therefore potential transfer sizes, not confirmed ones.
- The rationale for Pyodide's version-number change (0.29 to 314.x, matching CPython 3.14) was not found in the changelog excerpts read.
- coi-serviceworker on iOS Safari, and folding its logic into an app service worker, were not tested.
- Real-network cold-start times were not measured; the measurement was on localhost only.
- Whether ulab is enabled by default in the PyScript MicroPython build was not checked, although the npm package ships a separate `micropython-ulab.wasm`.
- The date of PyScript's maintenance-mode announcement could not be read: the linked gist was blocked.

## 5. State and persistence for a single learner without a server

### Takeaway
Keep progress in IndexedDB, through idb-keyval (1.6 KB gz) or idb (3.3 KB gz), and use localStorage only for tiny preferences. localStorage holds 5 MiB per origin, and that origin (daxjdavis526.github.io) is shared with every other project in this repository. Version the schema and test the migrations in Node. Request persistent storage after real engagement. Make JSON export and import, plus backup reminders, first-class: Safari can delete script-written data after seven days without user interaction.

### Cited Findings
- Quotas and eviction apply to an entire origin, "even if this origin is used to run several websites, such as `https://example.com/site1/` and `https://example.com/site2/`". — [MDN: Storage quotas and eviction criteria (source)](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/storage_api/storage_quotas_and_eviction_criteria/index.md). All projects here are served under `https://daxjdavis526.github.io/Projects/...`. — [README.md](/home/user/Projects/README.md)
- Web Storage "is limited to 10 MiB of data maximum on all browsers", and browsers "can store up to 5 MiB of local storage, and 5 MiB of session storage per origin". — [MDN quotas](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/storage_api/storage_quotas_and_eviction_criteria/index.md)
- Storage is "best-effort" by default; persistent storage is requested with `navigator.storage.persist()`. Firefox shows a permission prompt, while Safari and Chromium "automatically approve or deny the request based on the user's history of interaction with the site". Chrome's research found data "very rarely deleted". Private browsing may apply different quotas and clear data at the end of the session. — [MDN quotas](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/storage_api/storage_quotas_and_eviction_criteria/index.md)
- Quota sizes:
  - Firefox best-effort: the smaller of 10% of disk and a 10 GiB group limit. Firefox persistent: up to 50% of disk, capped at 8 TiB.
  - Chromium: 60% of disk in both modes.
  - Safari and other WebKit browser apps: about 60% of disk; other apps embedding WebKit: about 15%.
  - Writes beyond the limit throw `QuotaExceededError`.
  — [MDN quotas](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/storage_api/storage_quotas_and_eviction_criteria/index.md)
- Eviction:
  - Under storage pressure, browsers evict least-recently-used origins and skip persistent ones.
  - Safari also evicts proactively: when cross-site tracking prevention is on, "If an origin has no user interaction, such as click or tap, in the last seven days of browser use, its data created from script will be deleted".
  - Eviction deletes all of an origin's data at once, for example IndexedDB and the Cache API together.
  — [MDN quotas](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/storage_api/storage_quotas_and_eviction_criteria/index.md)
- `persist()` requires a secure context, resolves to `true` when granted, and is "not available in Web Workers". — [MDN: StorageManager.persist() (source)](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/storagemanager/persist/index.md). Support: `persist()` in Chrome 55, Firefox 57 and Safari 15.2; `estimate()` in Chrome 61, Firefox 57 and Safari 17. — [MDN browser-compat-data: StorageManager](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/StorageManager.json)
- Storage library options:
  - idb-keyval 6.3.0 (2026-07-08), Apache-2.0; `dist/index.js` is 6.8 KB (1.6 KB gz).
  - idb 8.0.4 (2026-10-06), ISC; 11.3 KB (3.3 KB gz).
  - Dexie 4.4.6 (2026-09-10; 4.4.7 followed on 2026-10-19), Apache-2.0; `dist/modern/dexie.min.mjs` is 85.3 KB (28.9 KB gz).
  — [npm: idb-keyval](https://registry.npmjs.org/idb-keyval); [npm: idb](https://registry.npmjs.org/idb); [npm: dexie](https://registry.npmjs.org/dexie); sizes measured from the tarballs
- For spaced review, ts-fsrs 5.4.2 (2026-09-01), MIT; `dist/index.mjs` is 59.8 KB (13.1 KB gz). — [npm: ts-fsrs](https://registry.npmjs.org/ts-fsrs); measured from [ts-fsrs-5.4.2.tgz](https://registry.npmjs.org/ts-fsrs/-/ts-fsrs-5.4.2.tgz)
- Precedents in this repo:
  - cryogenics keeps progress in localStorage under one versioned key (`cryogenics-progress-v1`). It exports a JSON Blob download and imports through `FileReader`. — [cryogenics/reader/reader.js](/home/user/Projects/cryogenics/reader/reader.js)
  - The export filename there is `propulsion-progress-<date>.json`, which shows the reader was copied from propulsion/. That is consistent with the repo's no-shared-code rule. — [cryogenics/reader/reader.js](/home/user/Projects/cryogenics/reader/reader.js)
  - redline stores run history in IndexedDB (`indexedDB.open(DB, 1)` with `onupgradeneeded`) and offers a CSV download through a Blob. — [redline/src/ui/history.js](/home/user/Projects/redline/src/ui/history.js)
  - moon caches data in IndexedDB. — [moon/src/data/cache.js](/home/user/Projects/moon/src/data/cache.js)

### Inferences
- **Data model:**
  - An append-only attempt log: question id, variant seed, answer, correct, latency, hints used and timestamp.
  - Derived state: mastery per skill, the review schedule, achievements and diagnostic placement. Derived state can be recomputed from the log, so migrations stay small and a corrupt cache can be rebuilt.
  - Store `schemaVersion` alongside the data. Write migrations as pure functions over plain objects and test them in Node against a fixture for every past version.
- **Shared origin:**
  - Prefix everything: an IndexedDB database named `physics-atlas` and localStorage keys starting `physics-atlas:`.
  - Keep localStorage below a few KB. Its 5 MiB is shared with every project here.
  - "Clear site data" for daxjdavis526.github.io wipes all the projects at once.
- **Export and import:**
  - Export a JSON file with `schemaVersion`, the app version, an export date and a checksum.
  - On import, validate, migrate, and merge by event id rather than overwriting.
  - Offer a "restore from file" path on the welcome screen.
- **Backup reminders:**
  - Prompt after the first milestone, then after every 7 days of activity or N newly mastered skills.
  - Always show the last backup date and `navigator.storage.persisted()` status.
  - Remind Safari users more firmly because of the seven-day rule.
- **Persistent storage:** call `navigator.storage.persist()` after a meaningful action, such as finishing the diagnostic or the first lesson. Chromium and Safari decide from engagement, and Firefox prompts, so a contextual explanation helps.
- **Testability:** keep storage behind a small interface with an in-memory implementation for Node tests. Node has no IndexedDB, and installing a fake-IndexedDB package would need npm.
- **Scheduling:** the scheduler (FSRS via ts-fsrs, or a simpler per-skill forgetting curve) is pure logic and testable headlessly. Which algorithm to use is a learning-science decision outside this scope.

### Gaps
- How durable IndexedDB is in iOS home-screen web apps compared with Safari tabs was not researched beyond MDN's quota table.
- Whether an import of mastered state should be trusted or re-verified (the cheating question) is a product decision, not researched.

## 6. Offline/PWA: service-worker caching for a large static site on GitHub Pages; manifest; update flow

### Takeaway
Write one service worker by hand and scope it to the Atlas directory. Precache a small, versioned app shell; use cache-first for versioned vendor paths and stale-while-revalidate for course modules; let learners make a course, or Python, available offline on demand; and update through the waiting worker plus `skipWaiting()`, triggered from a "new version ready — reload" prompt. Keep the scope narrow, because the origin is shared by every project in the repository.

### Cited Findings
- MDN's caching guide describes three strategies: "cache first", "cache first with cache refresh" (stale-while-revalidate) and "network first", plus guidance on deleting cached data. — [MDN PWA guide: caching (source)](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/progressive_web_apps/guides/caching/index.md)
- Service-worker lifecycle:
  - The first service worker activates without waiting, but existing documents must reload to be controlled.
  - A replacement waits until pages controlled by the old version close.
  - `skipWaiting()` lets the new worker "be activated without waiting for open pages to be closed".
  — [MDN: Using Service Workers (source)](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/service_worker_api/using_service_workers/index.md)
- Cache API data counts toward the origin's quota and is evicted together with IndexedDB. — [MDN quotas](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/storage_api/storage_quotas_and_eviction_criteria/index.md)
- coi-serviceworker works by registering its own service worker and reloading on first load. — [coi-serviceworker README](https://raw.githubusercontent.com/gzuidhof/coi-serviceworker/master/README.md)
- branch/ already ships a `manifest.webmanifest` with name, `start_url` `./index.html`, `display` fullscreen and an SVG icon marked "any maskable". — [branch/manifest.webmanifest](/home/user/Projects/branch/manifest.webmanifest)
- No non-vendor `.js`, `.mjs` or `.html` file in the repository references `serviceWorker` or `navigator.storage`. The only matches were two IndexedDB users. — grep in this session
- GitHub Pages has a soft bandwidth limit of 100 GB per month. — [GitHub docs: Pages limits](https://raw.githubusercontent.com/github/docs/main/content/pages/getting-started-with-github-pages/github-pages-limits.md)

### Inferences
- Place `atlas/sw.js` in the Atlas folder. Its default scope is then that folder only, which matters because sibling projects share the origin.
- **Precache list:** keep it in a hand-maintained JS module (for example `src/offline/precache.js`) with a cache-version string. A Node test fails when a listed file is missing, or when a shell file is not listed, which replaces a build step.
- **Strategies by path:**
  - `index.html` and the precache manifest: network-first, so new releases are discovered.
  - `vendor/<lib>-<version>/` and fonts: cache-first. The paths are immutable, so they can be cached forever.
  - `content/**`: stale-while-revalidate.
  - Course downloads: an explicit "Make this course available offline" action caches every module in that course's index and shows `navigator.storage.estimate()`.
- **Update flow:** on `updatefound`, once the new worker is installed and a controller exists, show "Update available". Clicking it posts `skipWaiting`, and the page reloads on `controllerchange`. Never activate a new version automatically mid-lesson, because old and new modules would mix.
- If Pyodide interrupts are wanted, the same service worker re-wraps responses with COOP and COEP headers, so the app does not register a second worker (see Q4).
- **Manifest:** follow branch/'s minimal manifest, but use `display: standalone`, set `scope` and `start_url` to the Atlas folder, and use dark `theme_color` and `background_color`.

### Gaps
- GitHub Pages' HTTP caching headers were not verified. They decide how fast updates reach users who have no service worker yet.
- iOS-specific PWA installation and storage behavior was not researched.

## 7. App structure without a build: routing, lazy loading, content format, validating thousands of questions, parameterized variants

### Takeaway
- Use hash routing (`#/course/lesson`), which avoids GitHub Pages' 404 behavior for client-side routes.
- Use one import map per page.
- Load each course as ES modules through dynamic `import()`. Long prose can live in Markdown, fetched and parsed at runtime with marked, using cryogenics' trick of stashing math before parsing. Question banks are data plus seeded generator functions.
- A Node test suite imports every course and validates schema, answer keys (with the same checker as the UI), hints, distractor uniqueness, TeX validity (KaTeX in Node), the prerequisite graph and generator output across many seeds.

### Cited Findings
- GitHub Pages "doesn't natively support single page apps". On a fresh load of a client-side route, "the GitHub Pages server returns 404". The workaround is a custom `404.html` that rewrites the path into a query string, plus a redirect script in `index.html`. Project pages without a custom domain must set `pathSegmentsToKeep` to 1. — [spa-github-pages README](https://raw.githubusercontent.com/rafgraph/spa-github-pages/gh-pages/README.md). A custom 404 page is a `404.html` or `404.md` file. — [GitHub docs: custom 404 page](https://raw.githubusercontent.com/github/docs/main/content/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site.md)
- An import map "must be declared and processed before any `<script>` elements that import modules using specifiers declared in the map". It resolves both static and dynamic imports. It must not carry `src`, `async`, `integrity` or similar attributes, and it supports an `integrity` key. — [MDN: importmap (source)](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/html/reference/elements/script/type/importmap/index.md)
- Import-map support: Chrome 89, Firefox 108, Safari 16.4. The `integrity` key: Chrome 127, Firefox 138, Safari 18. Multiple import maps: Chrome 133 and Safari 18.4; Firefox 150 only behind a flag. — [MDN browser-compat-data: script](https://raw.githubusercontent.com/mdn/browser-compat-data/main/html/elements/script.json)
- Parsers:
  - marked 18.1.1 (2026-10-12; 18.1.2 followed on 2026-10-26), MIT; `lib/marked.esm.js` is 46.0 KB (13.8 KB gz).
  - markdown-it 15.0.2 (2026-09-11; 15.0.3 on 2026-10-16), MIT; its browser ESM minified build is 135.0 KB (49.6 KB gz).
  - js-yaml 5.4.3 (2026-10-05; 5.5.0 on 2026-10-15), MIT; its ESM minified build is 76.9 KB (20.2 KB gz).
  — [npm: marked](https://registry.npmjs.org/marked); [npm: markdown-it](https://registry.npmjs.org/markdown-it); [npm: js-yaml](https://registry.npmjs.org/js-yaml); sizes measured from the tarballs
- The cryogenics pattern:
  - The reader fetches Markdown modules and renders them with marked, protecting math from the Markdown parser and restoring it for MathJax.
  - It works "online (index.html on GitHub Pages): fetches the Markdown files" and "offline (single-file build): reads them from window.COURSE_FILES".
  - `tools/build_manifest.py` "derive[s] reader/manifest.js from README.md's tables", and `tools/build_offline.py` bundles "the whole course into ONE self-contained HTML file" (its docstring says about 15 MB). Both are Python tools whose outputs are committed.
  — [cryogenics/reader/reader.js](/home/user/Projects/cryogenics/reader/reader.js); [cryogenics/reader/manifest.js](/home/user/Projects/cryogenics/reader/manifest.js); [cryogenics/tools/build_manifest.py](/home/user/Projects/cryogenics/tools/build_manifest.py)
- The redline pattern:
  - Content (procedures, faults, stands, glossary) lives as JS modules under `src/content/`, imported by both the UI and the Node tests.
  - The 3D cell view loads lazily: `this._cellP = import('../cell/cellview.js')`.
  - Tests are plain Node scripts with a `check(label, cond)` counter.
  — [redline/src/ui/views/control.js](/home/user/Projects/redline/src/ui/views/control.js); [redline/test/biprop.test.mjs](/home/user/Projects/redline/test/biprop.test.mjs)
- KaTeX can parse-check TeX headlessly (malformed input throws `ParseError`), and a sampling checker ran 1,000 checks in 69 ms in Node. — measured in this session

### Inferences
- **Routing:** use a hash router (`#/learn/mechanics/kinematics-1`, `#/practice/<skill>`, `#/map`, `#/review`). Deep links and the service worker then work with no 404 tricks. With the History API, the custom 404 would have to be the repository-level 404.html shared by every project on this Pages site. That is unverified, but follows from the site layout; avoid it.
- **Module graph:**
  - `index.html` holds a single import map: `katex`, `mathlive`, `three`, `three/addons/`, `idb-keyval`. Use a single map only, because Firefox supports multiple maps only behind a flag.
  - `src/app.js` starts the router, which dynamically imports view modules and `content/<course>/index.js`.
  - Group lessons into one module per chapter to limit request counts.
- **Content format:**
  - Course structure, skills, prerequisites and questions as ES modules: no parser, directly importable in Node, and comments plus generator functions allowed.
  - Long-form prose either in JS template literals or in Markdown fetched and rendered with marked (13.8 KB gz), using cryogenics' math-stashing approach.
  - Avoid JSON modules (`import ... with {type:'json'}`), since browser support was not verified; use `fetch()` for any JSON.
- **Question schema:**
  - `id`, `skills[]`, `type` (numeric, expression, choice, multi-select, ordering or graph-interaction).
  - `prompt` (a TeX-capable template).
  - `generate(seed)` returning the values and the answer.
  - `check` configuration: mode, tolerance, domain and units.
  - `hints[]`, `solution`, and `distractors[]`, each tagged with the misconception it represents.
- **Node validation suite** (`atlas/test/content.test.mjs`):
  - Ids are unique, and every referenced skill exists.
  - The prerequisite graph is acyclic.
  - Each skill has at least k items.
  - Every generator, run over at least 200 seeds, produces finite, distinct variants whose answer passes the checker against the worked solution or an independent reference function.
  - Distractors are pairwise non-equivalent and non-equivalent to the answer.
  - Hints are present.
  - Every TeX fragment renders with KaTeX (`throwOnError`).
  - Every lesson module imports without a DOM.
- **Variants:** use a seeded PRNG and pick "nice" numbers through constraints inside the generator. Store the seed in the attempt log, so review and "show me again" reproduce the same variant.
- **Indexes:** with no build step, author course index modules by hand. A tool script that writes them is acceptable only if its output is committed and a test fails when it is stale, as with cryogenics' `build_manifest.py`.

### Gaps
- Browser support for JSON-module import attributes was not verified.
- Request overhead of many small dynamic imports on GitHub Pages was not measured.

## 8. Accessibility and UX: WCAG 2.2 AA, keyboard alternatives to dragging, reduced motion, dark-theme contrast, accessible canvas, responsive layout

### Takeaway
- Target WCAG 2.2 AA throughout.
- Every drag interaction (graph handles, ordering tasks, sliders) needs a single-pointer, non-drag alternative and a keyboard path (2.5.7).
- Pointer targets are at least 24×24 CSS px (2.5.8), and focused elements are never fully hidden by sticky UI (2.4.11).
- The dark palette meets 4.5:1 for text and 3:1 for UI and graph elements.
- Honor `prefers-reduced-motion`.
- Give every canvas a text description plus a live readout or data table generated from the same DOM-free model.

### Cited Findings
- New success criteria in WCAG 2.2, as worded in the W3C source files:
  - Dragging Movements (AA): "All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential". — [w3c/wcag: dragging-movements](https://raw.githubusercontent.com/w3c/wcag/main/guidelines/sc/22/dragging-movements.html)
  - Target Size (Minimum) (AA): "at least 24 by 24 CSS pixels", with exceptions. — [w3c/wcag: target-size-minimum](https://raw.githubusercontent.com/w3c/wcag/main/guidelines/sc/22/target-size-minimum.html)
  - Focus Not Obscured (Minimum) (AA): a focused component "is not entirely hidden due to author-created content". — [w3c/wcag: focus-not-obscured-minimum](https://raw.githubusercontent.com/w3c/wcag/main/guidelines/sc/22/focus-not-obscured-minimum.html)
  - Focus Appearance (AAA). — [w3c/wcag: focus-appearance](https://raw.githubusercontent.com/w3c/wcag/main/guidelines/sc/22/focus-appearance.html)
  - Consistent Help (A). — [w3c/wcag: consistent-help](https://raw.githubusercontent.com/w3c/wcag/main/guidelines/sc/22/consistent-help.html)
  - Redundant Entry (A). — [w3c/wcag: redundant-entry](https://raw.githubusercontent.com/w3c/wcag/main/guidelines/sc/22/redundant-entry.html)
  - Accessible Authentication (Minimum) (AA). — [w3c/wcag: accessible-authentication-minimum](https://raw.githubusercontent.com/w3c/wcag/main/guidelines/sc/22/accessible-authentication-minimum.html)
- Contrast (Minimum) (AA): text and images of text at least 4.5:1, except large text. — [w3c/wcag: contrast-minimum](https://raw.githubusercontent.com/w3c/wcag/main/guidelines/sc/20/contrast-minimum.html). Non-text Contrast (AA): user-interface components and graphical objects at least 3:1 against adjacent colors. — [w3c/wcag: non-text-contrast](https://raw.githubusercontent.com/w3c/wcag/main/guidelines/sc/21/non-text-contrast.html). Animation from Interactions (AAA): "Motion animation triggered by interaction can be disabled". — [w3c/wcag: animation-from-interactions](https://raw.githubusercontent.com/w3c/wcag/main/guidelines/sc/21/animation-from-interactions.html)
- `prefers-reduced-motion` is supported in Chrome 74, Firefox 63 and Safari 10.1. — [MDN browser-compat-data: media queries](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/at-rules/media.json)
- JSXGraph's model of accessible interactive graphs: keyboard moving with `dx`/`dy`, an `aria` live-region option, and a board title exposed as `aria-label`. — `src/options.js` in [jsxgraph-1.14.0.tgz](https://registry.npmjs.org/jsxgraph/-/jsxgraph-1.14.0.tgz)
- MathLive advertises math-to-speech, ARIA labels and a virtual keyboard. — [MathLive README](https://raw.githubusercontent.com/arnog/mathlive/master/README.md). KaTeX emits MathML by default, and MathJax 4 emits speech `aria-label`s (see Q1).

### Inferences
- **Draggable points:** make each one a focusable SVG element (`tabindex="0"`, `role="slider"` or a labelled group, `aria-valuetext="x = 1.50, y = 2.25"`). Arrow keys nudge, Shift-arrow takes coarse steps, and paired number inputs provide the non-drag alternative for 2.5.7. Ordering tasks get "move up/down" buttons.
- **Canvas figures:** wrap them in `<figure>` with a `<figcaption>` stating what is shown and what to notice, and an `aria-describedby` live readout of key values that is throttled while dragging. Add a "Show data" toggle that renders a real `<table>` from the same model. For three.js scenes, add rotate and zoom buttons and a text summary.
- **Dark theme:** define color tokens once, and add a Node test that computes WCAG contrast ratios for every text/background pair (at least 4.5:1) and every plot color against the plot background (at least 3:1). Also encode series by line style or marker, not color alone.
- **Motion:** read the CSS media query and `matchMedia('(prefers-reduced-motion: reduce)')`; replace autoplaying animations with step and play controls, and add an in-app override.
- **Timing and layout:** offer untimed modes for drills and diagnostics (relevant to WCAG 2.2.1 Timing Adjustable). Use a single column below about 720 px, size plots with `ResizeObserver`, and keep sticky headers from covering the focused element (2.4.11).

### Gaps
- No screen-reader or assistive-technology testing was done.
- The success-criterion numbers (2.5.7, 2.5.8, 2.4.11, 2.4.13, 3.2.6, 3.3.7, 3.3.8) are standard WCAG numbering, but they were not shown in the text extracted from the W3C source files.
- The WCAG 2.2 publication date was not verified this session.

## 9. Self-hostable fonts for a premium dark scientific UI with good math pairing, and their licenses

### Takeaway
Use Inter (variable) for the interface, Source Serif 4 (variable) or STIX Two Text for long-form reading next to KaTeX math, and JetBrains Mono or IBM Plex Mono for code. All are OFL-1.1, and each Latin subset is about 15–122 KB as woff2. Self-host them with `@font-face` and keep each license text next to its files, as worldline does. Latin Modern has no Fontsource package, and its license was not verified.

### Cited Findings
- License fields and Latin-subset woff2 sizes, from the npm registry and the tarballs:
  - `@fontsource-variable/inter` 5.3.0, OFL-1.1: `inter-latin-wght-normal.woff2` 48,256 B; `wght-italic` 51,832 B; the optical-size (`opsz`) variant 72,920 B. — [npm](https://registry.npmjs.org/@fontsource-variable%2Finter); measured from [inter-5.3.0.tgz](https://registry.npmjs.org/@fontsource-variable/inter/-/inter-5.3.0.tgz)
  - `@fontsource/ibm-plex-sans` 5.3.0, OFL-1.1: `latin-400-normal` 22,588 B (one static weight per file). A variable package, `@fontsource-variable/ibm-plex-sans` 5.3.0, also exists. — [npm](https://registry.npmjs.org/@fontsource%2Fibm-plex-sans); [npm (variable)](https://registry.npmjs.org/@fontsource-variable%2Fibm-plex-sans)
  - `@fontsource-variable/source-serif-4` 5.3.1 (2026-10-11), OFL-1.1: `latin-wght-normal` 50,936 B; `wght-italic` 51,576 B; `opsz` 122,360 B. — [npm](https://registry.npmjs.org/@fontsource-variable%2Fsource-serif-4)
  - `@fontsource/stix-two-text` 5.3.0, OFL-1.1: `latin-400-normal` 16,776 B. `@fontsource/stix-two-math` 5.3.0 is also OFL-1.1. — [npm](https://registry.npmjs.org/@fontsource%2Fstix-two-text); [npm](https://registry.npmjs.org/@fontsource%2Fstix-two-math)
  - `@fontsource-variable/jetbrains-mono` 5.3.0, OFL-1.1: `latin-wght-normal` 40,404 B. — [npm](https://registry.npmjs.org/@fontsource-variable%2Fjetbrains-mono)
  - `@fontsource/ibm-plex-mono` 5.3.0, OFL-1.1: `latin-400-normal` 14,708 B. — [npm](https://registry.npmjs.org/@fontsource%2Fibm-plex-mono)
- `@fontsource/latin-modern-roman` does not exist on npm (the registry returns 404). — [npm registry](https://registry.npmjs.org/@fontsource%2Flatin-modern-roman)
- KaTeX ships 20 woff2 math fonts (253.7 KB) inside its MIT-licensed package. — [katex-0.19.0.tgz](https://registry.npmjs.org/katex/-/katex-0.19.0.tgz). MathJax 4's default math font is based on New Computer Modern, with 11 font sets in total. — [MathJax docs: fonts](https://raw.githubusercontent.com/mathjax/MathJax-docs/master/upgrading/whats-new-4.0/fonts.rst)
- Precedent in this repo: worldline vendors variable woff2 files for Jost and Cormorant Garamond with their `OFL-*.txt` license texts, and declares `@font-face` with `font-display:block`. — [worldline/index.html](/home/user/Projects/worldline/index.html); vendor file list (names only) gathered in this session

### Inferences
- **Pairing:** KaTeX's math is Computer-Modern-like. A text serif such as Source Serif 4 or STIX Two Text sits better beside inline math in lesson prose than a grotesque sans does. Inter carries the UI, navigation, the skill map and buttons. STIX Two Text pairs well with STIX-style math, but KaTeX cannot use STIX Two Math; MathJax's font sets could.
- **Dark mode:** a variable weight axis lets body text sit slightly heavier (around 420–450) to offset halation on dark backgrounds. That is a design inference; tune it with screenshots.
- **Loading:** use `font-display: swap` for text fonts (worldline's `block` suits a film, not a reader). Preload only the UI regular weight. Latin subsets only.
- **Budget:** about 50 KB (Inter) + 51 KB (Source Serif 4) + 40 KB (JetBrains Mono) up front, plus KaTeX fonts on demand (up to 254 KB).

### Gaps
- The licenses of Latin Modern (generally the GUST Font License) and New Computer Modern were not verified this session.
- Whether MathLive can share KaTeX's vendored font directory instead of carrying its own copy (a `fontsDirectory`-type option) was not verified.

## 10. Patterns in this repository worth reusing (cryogenics, worldline, redline and others)

### Takeaway
The repository already has everything the Atlas needs in pattern form:
- the three import map (in seven projects);
- `vendor/<lib>/` folders with license files, marked as vendored in `.gitattributes`;
- DOM-free models with plain Node test scripts using a tiny `check()` helper;
- a lazy `import()` for the 3D view (redline);
- a Markdown reader with runtime math and localStorage progress plus JSON export and import (cryogenics);
- IndexedDB history with downloads (redline, moon);
- a web manifest (branch).

Browser projects have no CI, so the Atlas tests would only run locally unless a workflow is added.

### Cited Findings
- Seven projects (geodesic, moon, primeval, raptor, redline, supernova, universe) use an import map. supernova and redline map `"three"` to `./vendor/three/three.module.min.js` and `"three/addons/"` to `./vendor/three/jsm/`. — grep of `*/index.html` in this session; [supernova/index.html](/home/user/Projects/supernova/index.html); [redline/index.html](/home/user/Projects/redline/index.html)
- Vendoring layout: redline has `vendor/three/` with `three.module.min.js`, `three.core.min.js` and `jsm/{controls,postprocessing,shaders}`; worldline has `vendor/katex/` (`katex.min.js`, `katex.min.css`, `fonts/`, `LICENSE`) and `vendor/fonts/` with OFL texts; cryogenics has `vendor/marked.min.js` and `vendor/tex-svg.js`. — file names listed (not opened) in this session
- `.gitattributes` marks `*/vendor/**` as `linguist-vendored linguist-generated -diff`, and `*.min.js` as `-diff -merge`. — [.gitattributes](/home/user/Projects/.gitattributes)
- Tests are plain Node scripts, such as `redline/test/*.test.mjs` (20 files), `worldline/test/{film,physics}.test.mjs` and `supernova/test/physics.test.mjs`. Each uses a local `check(label, cond)` counter and is run with `node redline/test/x.test.mjs`. — [redline/test/biprop.test.mjs](/home/user/Projects/redline/test/biprop.test.mjs); [CLAUDE.md](/home/user/Projects/CLAUDE.md)
- CI workflows exist only for sonicline (two), spotter and strata; none runs a browser project's tests. — [.github/workflows](/home/user/Projects/.github/workflows)
- Lazy 3D: redline loads three.js (r180) "only when first opened", via `import('../cell/cellview.js')`. — [redline/README.md](/home/user/Projects/redline/README.md); [redline/src/ui/views/control.js](/home/user/Projects/redline/src/ui/views/control.js)
- The cryogenics reader is a classic-script IIFE (not ES modules) that fetches Markdown and renders it with marked plus MathJax. Progress uses localStorage key `cryogenics-progress-v1` with JSON export and import. Python tools generate the manifest and the offline single-file build. — [cryogenics/reader/reader.js](/home/user/Projects/cryogenics/reader/reader.js); [cryogenics/tools/build_offline.py](/home/user/Projects/cryogenics/tools/build_offline.py)
- worldline uses KaTeX 0.16.11 with DOM-free `src/physics.js` and Node tests. — [worldline/README.md](/home/user/Projects/worldline/README.md); [CLAUDE.md](/home/user/Projects/CLAUDE.md)
- IndexedDB precedents: [redline/src/ui/history.js](/home/user/Projects/redline/src/ui/history.js) and [moon/src/data/cache.js](/home/user/Projects/moon/src/data/cache.js). Web manifest precedent: [branch/manifest.webmanifest](/home/user/Projects/branch/manifest.webmanifest).

### Inferences
- **Reuse:**
  - the import-map pattern, extended with `katex`, `mathlive` and `idb-keyval`;
  - versioned `vendor/` folders, each with its LICENSE;
  - redline's `src/content/*.js` content-as-modules approach and `check()`-style test scripts;
  - redline's lazy `import()` gate for 3D;
  - cryogenics' math-stashing Markdown rendering;
  - cryogenics' export and import UX, moved from localStorage to IndexedDB.
- **Improve on precedent:**
  - Write the Atlas as ES modules rather than cryogenics-style IIFEs, so its logic can be imported by Node tests.
  - Namespace storage keys properly (see the copied `propulsion-progress-` filename).
  - Consider a small GitHub Actions workflow running `node atlas/test/*.test.mjs` on Atlas changes. The repo already does this for strata, sonicline and spotter, though no browser project has one yet.
- Follow CLAUDE.md's rule that each project shares no code: the Atlas vendors its own copies even where other projects already hold the same library.

### Gaps
- `.test.mjs` contents beyond redline's biprop test were not opened, so the test conventions of supernova and worldline were not inspected in detail.

## 11. Synthesis: what should The Physics Atlas vendor, how should it load, and what are the budgets?

### Takeaway
- The minimal vendored stack:
  - KaTeX 0.19.0 for math rendering;
  - math.js 15.2.0 for checking and units;
  - MathLive 0.111.1, loaded lazily for symbolic input;
  - three.js r185 minified, loaded lazily for 3D;
  - idb-keyval 6.3.0 for storage;
  - marked 18.1.1, only if Markdown prose is used;
  - Inter, Source Serif 4 and JetBrains Mono (OFL) for type;
  - Pyodide 314.0.7 with about 15 wheels, loaded lazily in a module worker for the programming track;
  - an in-house DOM-free core (checker, mastery and scheduling, question generators, viz math, storage schema), plus a hand-written service worker.
- Everything else (Compute Engine, JSXGraph, uPlot, MathJax, MicroPython) stays optional.
- Typical lesson pages stay around 0.3–0.4 MB gz before content. The 6+ MB Python runtime loads only on demand.

### Cited Findings
- Recommended pins, applying the two-week rule as of 2026-10-27 (newer releases noted):

| Library | Pin (date) | Newer release | License | Main file and size (raw / gz) | Source |
|---|---|---|---|---|---|
| KaTeX | 0.19.0 (2026-10-01) | 0.19.1 (2026-10-23) | MIT | `katex.mjs` 588.8 / 145.3 KB, or `katex.min.js` 266.5 / 74.1 KB; CSS 24.8 KB; fonts 253.7 KB on demand | [npm](https://registry.npmjs.org/katex) |
| math.js | 15.2.0 (2026-04-07) | — | Apache-2.0 | `lib/browser/math.js` 634.5 / 171.0 KB (classic script) | [npm](https://registry.npmjs.org/mathjs) |
| MathLive | 0.111.1 (2026-10-09) | — | MIT | `mathlive.min.mjs` 823.3 / 221.5 KB | [npm](https://registry.npmjs.org/mathlive) |
| three.js | 0.185.x (r185) minified | 0.186.1 (2026-09-24), unminified only | MIT | `three.module.min.js` + `three.core.min.js` 733.4 / 183.1 KB | [npm](https://registry.npmjs.org/three) |
| idb-keyval | 6.3.0 (2026-07-08) | — | Apache-2.0 | 6.8 / 1.6 KB | [npm](https://registry.npmjs.org/idb-keyval) |
| marked (optional) | 18.1.1 (2026-10-12) | 18.1.2 (2026-10-26) | MIT | 46.0 / 13.8 KB | [npm](https://registry.npmjs.org/marked) |
| ts-fsrs (optional) | 5.4.2 (2026-09-01) | — | MIT | 59.8 / 13.1 KB | [npm](https://registry.npmjs.org/ts-fsrs) |
| Pyodide | 314.0.7 (2026-09-14) | — | MPL-2.0 | core about 13.5 MB / 6.3 MB (10^6 B) plus wheels | [npm](https://registry.npmjs.org/pyodide) |
| coi-serviceworker (technique only) | 0.1.7 (2023-07-09) | — | MIT | 2.2 KB | [npm](https://registry.npmjs.org/coi-serviceworker) |
| JSXGraph (optional) | 1.14.0 (2026-10-05) | 1.14.2 (2026-10-26) | MIT OR LGPL-3.0+ | 1,001.4 / 251.4 KB | [npm](https://registry.npmjs.org/jsxgraph) |
| uPlot (optional) | 1.6.32 (2025-03-14) | — | MIT | 49.9 / 21.5 KB | [npm](https://registry.npmjs.org/uplot) |
| Compute Engine (deferred) | 0.152.0 (2026-10-11) | 0.170.0 (2026-10-27) | MIT | about 4.18 / 1.23 MB (10^6 B) | [npm](https://registry.npmjs.org/@cortex-js%2Fcompute-engine) |
| MicroPython (optional) | 1.29.0-6 (2026-08-24) | — | MIT | `.mjs` 107.5 / 30.1 KB + ulab `.wasm` 626.5 / 235.9 KB | [npm](https://registry.npmjs.org/@micropython%2Fmicropython-webassembly-pyscript) |

- Sizes are taken from the measurements cited in Q1–Q5. The r185 three.js figures are 0.185.0's files. — [three-0.185.0.tgz](https://registry.npmjs.org/three/-/three-0.185.0.tgz)
- Code editor for the programming track, if one is needed:
  - CodeMirror 5.65.21 (2026-02-07), MIT: `lib/codemirror.js` 392.6 KB (103.8 KB gz, unminified) plus the Python mode at 14.6 KB (4.0 KB gz). — [npm: codemirror](https://registry.npmjs.org/codemirror); measured from [codemirror-5.65.21.tgz](https://registry.npmjs.org/codemirror/-/codemirror-5.65.21.tgz)
  - CodeMirror 6 is split into scoped packages (for example `@codemirror/view` 6.43.15, 2026-10-19). PyScript's pre-bundled chunks for CodeMirror 6 view, state, language and Python come to about 378 KB (126 KB gz). — [npm: @codemirror/view](https://registry.npmjs.org/@codemirror%2Fview); measured from [@pyscript/core 0.7.31](https://registry.npmjs.org/@pyscript/core/-/core-0.7.31.tgz)
  - codejar 4.3.0 (2025-10-14), MIT: 16.8 KB (3.9 KB gz). — [npm: codejar](https://registry.npmjs.org/codejar)
  - prism-code-editor 5.4.0 (2026-09-06), MIT. — [npm](https://registry.npmjs.org/prism-code-editor)
  - monaco-editor 0.57.0 is 101.7 MB unpacked. — [npm](https://registry.npmjs.org/monaco-editor)
- Hosting headroom: a GitHub Pages site may be no larger than 1 GB, and files over 100 MiB are blocked. — [GitHub docs: Pages limits](https://raw.githubusercontent.com/github/docs/main/content/pages/getting-started-with-github-pages/github-pages-limits.md); [GitHub size variables](https://raw.githubusercontent.com/github/docs/main/data/variables/large_files.yml). The repository today is 129 MB (working tree) and 75 MB (`.git`). — measured in this session

### Inferences
- **Directory sketch** (one project folder, no build):
  - `index.html`: one import map, a hash router entry and the service-worker registration.
  - `sw.js` and `manifest.webmanifest`.
  - `css/`: tokens with a dark palette whose contrast is checked by a test.
  - `src/core/` (DOM-free): `check/` (numeric, sig figs, units, expression sampling, answer modes), `rng.js`, `mastery.js`, `schedule.js`, `diagnostic.js`, `achievements.js`, `store/schema.js` and `store/migrate.js`, `content-api.js`.
  - `src/viz/math/` (DOM-free) and `src/viz/draw/` (Canvas and SVG).
  - `src/ui/`: views and components.
  - `src/py/worker.mjs`: the Pyodide host.
  - `content/<course>/{index.js, chapters/*.js, questions/*.js}`.
  - `vendor/<lib>-<version>/`, each with its LICENSE.
  - `test/*.test.mjs`: content, checker, generators, migrations, contrast, precache manifest, wheel sha256.
  - `tools/`: Playwright screenshot script(s), following worldline's and redline's `tools/` precedent.
- **Loading tiers:**
  - **Tier 0, every page:** about 74–145 KB gz KaTeX, about 140 KB of fonts, plus the in-house app shell.
  - **Tier 1, practice pages:** +171 KB gz math.js, loaded as a classic script before the module app. On symbolic-input items, add +222 KB gz MathLive.
  - **Tier 2, 3D figures:** +183 KB gz three.js r185 minified, through a lazy `import()` when the figure is near the viewport.
  - **Tier 3, programming lessons:** +6.3 MB gz Pyodide core in a module worker, then wheels per lesson. Cache it in the service worker only on explicit opt-in or first use.
- **Verification loop:** run the Node suite (`node atlas/test/*.test.mjs`) for logic and content, and take Playwright screenshots in light and dark mode at phone and desktop widths for visuals, following the repo's practice.
- **Main technical risks**, in priority order:
  1. Normalizing MathLive output into checker input (Q2).
  2. Pyodide wheel sizes and first-run latency on real networks (Q4).
  3. Cross-origin isolation on GitHub Pages: optional, with terminate-and-respawn as the guaranteed fallback.
  4. Safari's seven-day storage eviction: mitigated with export, backup reminders and `persist()`.
  5. three.js minified-build availability beyond r185.

### Gaps
- Compiled Pyodide wheel sizes, GitHub Pages compression and caching headers, and real-network timings were not measured; the CDN, github.com downloads and github.io were blocked from this sandbox.
- No external benchmarks or community comparisons were gathered, because the web-search budget was exhausted. Every comparison above rests on primary documentation and measurements taken in this session.
