# Projects — working notes

A collection of self-contained browser toys, one per directory, published
straight to GitHub Pages from `main`. Different ideas on the daily.

## The one rule that matters

**Never open the vendored library files.** They are downloaded dependencies,
not code anyone here wrote, and several are minified bundles hundreds of
kilobytes wide on a single line. Reading one wastes an enormous amount of
context for zero insight.

```
*/vendor/**              three.js and friends — do not read
helios/three.min.js      same, older layout
```

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
| `propulsion/` | rocket propulsion engineering course (Markdown, no code to run beyond the example checker) |

## Conventions

- **No build step.** Everything is static files served as-is. No bundler, no
  npm install, no transpilation. `python3 -m http.server` is the dev loop.
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

For visual verification, drive a headless Chromium (Playwright is available)
and screenshot the page — several rendering bugs in this repo were only ever
visible in a screenshot, never in a stack trace.

## Deployment

`main` is live. Merging to `main` publishes. There is no staging.
