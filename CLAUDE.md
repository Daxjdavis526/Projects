# Projects — working notes

A collection of self-contained browser toys, one per directory, published
straight to GitHub Pages from `main` (plus one desktop game, `strata/`, one
desktop engineering application, `sonicline/`, and one server app,
`spotter/`). Different ideas on the daily.

## The one rule that matters

**Never open the vendored library files.** They are downloaded dependencies,
not code anyone here wrote, and several are minified bundles hundreds of
kilobytes wide on a single line. Reading one wastes an enormous amount of
context for zero insight.

```
*/vendor/**              three.js and friends — do not read
helios/three.min.js      same, older layout
wormsign/dist/*.wasm     compiled game binary, tens of MB — do not read
wormsign/dist/*.js       generated wasm-bindgen glue — do not read
wormsign/target*/        Rust build output (untracked) — do not read
strata/.godot/           Godot's import cache and compiled C# (untracked) — do not read
strata/build/            exported game builds (untracked) — do not read
sonicline/src/*.egg-info/  pip metadata (untracked) — do not read
spotter/node_modules/    npm dependencies (untracked) — do not read
spotter/.next/           Next.js build output (untracked) — do not read
spotter/.data/           embedded dev database and dev secrets (untracked) — do not read
zr1/target/              Rust build output (untracked) — do not read
zr1/model/*              generated STEP/3MF/GLB, tens of MB — do not read
```

`moon/data/` is 47 MB of vendored NASA rasters. They are data, not code: read
them with `moon/tools/build_data.py --check` or numpy, never by opening them.

If you need to know a library's API, consult its documentation or the small
readable addon files under `vendor/three/jsm/` — never the bundle itself.
When searching the repo, expect vendor paths in the results and skip them;
roughly 40% of matches for common graphics terms are vendor noise.

## Layout

Each directory is an independent project. They share no code and no build
step, and that is deliberate — one can be rewritten or deleted without
touching the others.

| dir | what |
|---|---|
| `branch/` | music-driven generative lightning / vascular growth |
| `blackhole/` | black hole visualiser |
| `helios/` | first-person solar system flight sim |
| `universe/` | observable universe explorer (HORIZON) |
| `raptor/` | F-22A flight simulator |
| `supernova/` | core-collapse supernova simulator |
| `moon/` | SELENE — open-world exploration of the real Moon at full scale |
| `propulsion/` | rocket propulsion engineering course (Markdown, no code to run beyond the example checker) |
| `cryogenics/` | cryogenic propulsion hardware & safety course (Markdown + hand-authored SVG, browser reader) |
| `geodesic/` | spacetime curvature & gravitational dynamics sandbox |
| `redline/` | REDLINE — rocket test-stand operations trainer (cold-gas stand TS-1, bipropellant stand TS-2 — cold flow and hot fire, heat-sink and regeneratively cooled engines — turbopump component stand TS-3, and gas-generator engine stand TS-3G; a 3D cell with cameras whose plume follows the running engine — three.js vendored, loaded only when the cameras open; physics/instruments/control and what the cameras are given (`src/sim/visual.js`) are DOM-free, tested headlessly: `node redline/test/*.test.mjs`; `redline/tools/cell-shots.mjs` screenshots the cameras) |
| `peraspera/` | PER ASPERA — an animated short film, canvas-drawn and WebAudio-scored live; `test/film.test.mjs`, `tools/frames.mjs` renders frames |
| `wormsign/` | WORMSIGN — sandworm-riding game in Rust, compiled to WebAssembly (has a build step; `dist/` is committed at milestones) |
| `strata/` | STRATA — voxel survival game in Godot 4 + C#. A desktop game, not a web page: Pages serves nothing playable from it. Windows and Linux builds come from GitHub Actions (`.github/workflows/strata.yml`) |
| `sonicline/` | SONICLINE — propulsion CFD for nitrogen cold-gas thrusters: a Python desktop application driving OpenFOAM as an external solver. Not a web page. Plan and decisions in `sonicline/DESIGN.md`; tests in `.github/workflows/sonicline.yml` |
| `zr1/` | ZR1 — a 1:15.3 C8 Corvette ZR1 (ZTK, Arctic White and carbon) generated in Rust on the Orbital Dawn geometry kernel, which it references by path (`../../Orbital-Dawn-Astronautics`, private; never copied here). Outputs `model/zr1.{step,3mf,glb}` and a three.js viewer; `cargo run --release` in `zr1/` |
| `spotter/` | SPOTTER — trend intelligence for a fitness creator: Next.js + PostgreSQL server app with OAuth connectors for YouTube, Instagram and TikTok. Not a static page: Pages serves nothing usable from it. Checks run in GitHub Actions (`.github/workflows/spotter.yml`) |

## Conventions

- **No build step** for the browser projects. Everything is static files
  served as-is. No bundler, no npm install, no transpilation.
  `python3 -m http.server` is the dev loop. The four exceptions, `wormsign/`,
  `strata/`, `sonicline/` (a pip-installable Python package) and `spotter/`
  (npm, Next.js) keep their builds to themselves; their READMEs say how.
- **Vendor dependencies locally**, do not hotlink a CDN — these pages should
  keep working when a CDN does not.
- **Prefer the minified build** when vendoring. `three.module.min.js` plus
  `three.core.min.js` is ~720 KB in 12 lines; the unminified equivalent is
  2 MB in 77,000 lines and offers nothing at runtime.
- **ES modules with an importmap** for anything using three.js addons
  (EffectComposer, UnrealBloomPass, and friends). See `supernova/index.html`
  or `universe/index.html` for the pattern.
- **One README per project**, describing controls, architecture, and — where
  a project simulates something real — what is physically accurate versus
  artistically approximated. Be blunt about the approximations; that honesty
  is the house style.
- Root `README.md` carries a short section per project with its live URL.

## Testing

Anything with real logic should be testable without a browser. `supernova/`
is the reference: its physics engine imports no DOM and no three.js, so
`node supernova/test/physics.test.mjs` validates the simulation headlessly.
Keep simulation state separate from rendering so this stays possible.
`strata/` does the same in C#: `godot --headless --path strata -- --test`,
which CI also runs on every change to it. `sonicline/` keeps its physics in
`sonicline/src/sonicline/core/`, which imports no OpenFOAM, Qt or VTK (a test
enforces it): `pip install -e ./sonicline[dev] && python -m pytest
sonicline/tests`, run by CI on Linux and Windows. `spotter/` keeps its engine
under `src/core` free of React and Next.js: `cd spotter && npm test` runs it
all headlessly, including the whole pipeline on an in-memory PostgreSQL.

For visual verification, drive a headless Chromium (Playwright is available)
and screenshot the page — several rendering bugs in this repo were only ever
visible in a screenshot, never in a stack trace.

## Deployment

`main` is live. Merging to `main` publishes. There is no staging.
