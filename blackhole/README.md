# BLACK HOLE EXPLORER

A real-time, scientifically grounded black-hole visualization. Every pixel is a
null geodesic traced through exact Kerr spacetime on the GPU — the shadow, the
photon ring, the lensed double image of the accretion disk and the Doppler
brightness asymmetry all *emerge* from the integration; nothing is painted in.

**Live:** https://daxjdavis526.github.io/Projects/blackhole/

Desktop only (keyboard + mouse). No build step, no dependencies — a single
`index.html` with WebGL2.

## Running locally

```
python3 -m http.server        # from the repo root
# open http://localhost:8000/blackhole/
```

Any static file server works (the page has no network dependencies beyond
Google Fonts, which degrade gracefully).

## Controls

| Input | Action |
|---|---|
| Click canvas | capture mouse (Esc releases) |
| Mouse | look |
| `W A S D` | translate; `Q / E` down / up |
| Scroll | adjust navigation speed (log scale) |
| `Shift` / `Ctrl` | boost ×8 / precision ×0.12 |
| `T` | guided tour |
| `P` | pause disk motion |
| `H` | hide interface |
| `Esc` | leave orbit / free-fall / tour |

**Modes** (right panel): Free flight, Orbit (radius via `W/S`, inclination and
rate sliders, retrograde toggle, ISCO warning), Free fall (radial geodesic
infall with proper-time vs far-clock readout). Camera presets fly you
smoothly to the far view, disk edge, pole, photon ring, ISCO and horizon.

**Tabs**: Cinematic (clean), Physics (data panel + horizon/ISCO overlays),
Disk (ISCO + photon-orbit rings).

**Background**: star field, or a "Lensing demo" grid that makes arcs, double
images and Einstein-ring geometry obvious. Toggle the disk off to study pure
lensing.

## Rendering architecture

- **Spacetime**: Kerr metric in Cartesian Kerr–Schild form,
  `g_μν = η_μν + f k_μ k_ν`, `f = 2r³/(r⁴ + a²z²)` (G = c = M = 1). This is
  horizon-regular and reduces exactly to Schwarzschild at `a = 0`, so one code
  path serves every preset.
- **Integration**: per-pixel backward ray tracing. Hamiltonian formulation
  `H = ½ g^{αβ} p_α p_β` with conserved `p_t`; 4th-order Runge–Kutta with an
  adaptive step `∝ r`, on the GPU (WebGL2 fragment shader). Rays terminate on
  the horizon (shadow), on the disk plane, or escape to a cubemap sky.
- **Far field**: outside ~140 r_g rays advance analytically; rays that never
  enter that sphere get the weak-field deflection `α = 4GM/(c²b)` so the
  starfield stays continuous.
- **Disk shading**: gas on circular Kerr geodesics, `Ω = (r^{3/2}+a)⁻¹`. Each
  hit computes the relativistic factor `g = (p·u)_cam / (p·u)_gas`; intensity
  scales as `g³` and color as a blackbody at `g·T(r)` with a
  Shakura–Sunyaev-like `T ∝ r^{-3/4}` profile cut off at the ISCO. Doppler
  boosting, beaming and gravitational redshift all come from this one factor.
- **Sky**: procedural HDR cubemap (power-law star brightness, stellar colors,
  Milky-Way band with dust, a few galaxies) generated once at startup and
  mip-mapped so lensed star trails stay crisp.
- **Pipeline**: HDR (RGBA16F) → threshold + dual-filter bloom → ACES tonemap →
  dither. Ultra quality supersamples at 1.35× internal resolution.
- **Units**: 1 simulation unit = 1 gravitational radius `r_g = GM/c²`. All
  km/AU/velocity/tidal readouts derive from the selected mass and spin.

## Physics assumptions & simplifications

See the in-app **Model & assumptions** panel for the full honest list. Key
points: simplified radiative transfer (opaque blackbody proxy + procedural
turbulence, no scattering, snapshot light-travel time); display temperatures
shifted into the visible band; disk motion time-lapsed (readouts show true
values — near a 4.3×10⁶ M☉ hole the ISCO period is ~18 minutes); free fall
uses the Schwarzschild radial solution; g-factor clamped to a displayable
range; no interior physics.

## Presets

| Preset | Mass | Spin | Note |
|---|---|---|---|
| Supermassive | 4.3×10⁶ M☉ | 0.60 | default; galactic-center scale |
| Stellar-mass | 10 M☉ | 0.50 | same geometry, ~10⁶× smaller and violent tides |
| Monster | 10⁹ M☉ | 0.70 | quasar scale; horizon ≈ 20 AU |
| Extreme spin | 4.3×10⁶ M☉ | 0.998 | ISCO dives toward the horizon; ferocious beaming |

Geometry in `r_g` units is mass-invariant, so switching mass changes every
physical readout (horizon km, tidal Δg, orbital periods, time-lapse factor)
while the view stays continuous — which is itself the lesson.

## Performance

Quality presets change internal resolution (0.5×–1.35×), geodesic step count
(110–400), and sky resolution. Default is High; a hint appears if the frame
rate is low. URL parameters for testing: `?q=0..3` (quality), `k=` (step
scale), `s=` (max steps), `p=smbh|stellar|monster|extreme`, `cx,cy,cz`
(camera, in r_g), `ov=1` (overlays), `grid=1` (lensing demo), `nodisk=1`,
`tour=1`.

## Known limitations

- Rays escaping the 140 r_g integration sphere ignore the small residual
  bending beyond it (< 2° at the boundary).
- Camera aiming uses coordinate direction rather than a full static-observer
  tetrad; very close to the horizon the mapping distorts slightly.
- No relativistic aberration for the moving camera (navigation speed is a
  convenience, clearly labeled, not a physical velocity).
- Inside the ergosphere a static observer cannot exist; the dτ/dt readout
  shows "—" there.
- WebGL2 required; smoothness needs a real GPU (software rendering works but
  crawls).
