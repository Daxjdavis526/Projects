# tools/measure — measuring the car from its renders

Python (numpy, scipy, OpenCV, trimesh). These scripts turned Chevrolet's
renders of the exact build into the crate's data files:

| data file | what | made by |
|---|---|---|
| `data/cameras.json` | the solved cameras of all 38 reference views, hub heights, wheel offsets, landmarks | `joint.py` (+ `spin.py`, `hubs.py`, `landmarks.py`, `bundle.py`) |
| `data/body_cage.json` | body cage + per-vertex displacement of its 3rd subdivision | `cage.py`, `cagefit.py` → `skinfit.py` + `psnorm.py` (`pipeline/run_psfit.py`) → `export_cage.py` |
| `data/regions.json` | glass / carbon / lamp / grille / vent regions as oriented prisms | `texmap.py`, `segment.py`, `regions.py` (`pipeline/run_regions2.py`) |
| `data/arches.json` | wheel-arch edges | measured on the skin against the views |
| `data/addons.json` | wing, splitter, dive planes, mirrors, skirts, exhaust, Gurney | `pipeline/fit_wing.py`, `pipeline/fit_addon.py`, `pipeline/tri.py`, `hullpart.py`, `pipeline/write_addons.py` |

## The references (not included)

The renders are Chevrolet's and are not redistributed here. They come from
Chevrolet's public image server:

- configurator: `https://cgi.chevrolet.com/mmgprod-us/dynres/prove/image.gen?i=2025/1YR07/1YR07__3LZ/G8G_HTE_LT7_M1K_SOG_J6B_3A9_ZTK_TOM_J58_XFS_FEJgmds11.jpg&v=degNN&std=true&country=US&send404=true&background=&transparentBackgroundPng=true`
  for `NN` in 01–07, 42, 43 (2500×1407, transparent PNG); the same with
  `GKZ` (Torch Red) in place of `G8G` for the paint difference;
- the ZR1 page's 360 colorizer, thirty frames of the `my27-3lz` car in G8G
  and in GKZ.

Point `ZR1_REFS` at a directory laid out as `paint.py` expects
(`configurator/2025_3LZ_G8G_ZTK_SOG_J6B_3A9/ext_degNN_transparent.png`,
`paint/cfg2025-gkz/…`, `chevrolet-360-colorizer/my27-3lz-g8g/…`,
`paint/my27-gkz/…`).

## The pipeline, in order

1. **Cameras** — `joint.py`: one bundle adjustment over every view (the spin
   as one rig, the configurator views as free cameras) from GM's wheelbase
   and tracks, hubs found in every frame (`hubs.py`), and mirrored landmarks.
2. **Paint** — `paint.py`: white render minus red render → paint mask and
   diffuse "clay" shading per view.
3. **Feature lines** — `edgemvs.py` (`pipeline/run_paintmvs.py`,
   `run_claymvs.py`): paint boundaries and clay-shading creases triangulated
   across views; `curveclean.py` denoises them along each line.
4. **Cage** — `cage.py`, `cagefit.py` (`pipeline/build_cage.py`,
   `run_cagefit_n.py`): a closed Catmull–Clark cage fitted to the painted
   outline in every view.
5. **Skin** — `skinfit.py` + `psnorm.py` (`pipeline/run_psfit.py`): one
   normal offset per vertex of the cage's 3rd subdivision, fitted to the
   silhouettes, the feature lines and photometric-stereo normals, in
   rounds; `pipeline/finish_skin.sh` writes it out, gates it in the crate,
   and re-traces the regions.
6. **Regions** — `texmap.py` projects every view onto the skin, `segment.py`
   finds the unpainted regions, `regions.py` outlines them by the paint
   probability's iso-contour (`pipeline/run_regions2.py`).
7. **Add-ons** — fitted (`fit_wing.py`, `fit_addon.py` against the observed
   carbon masks of `addon_obs.py`), carved (`hullpart.py`,
   `pipeline/hull_mirror.py`) or triangulated (`pipeline/tri.py` from points
   read off `pipeline/gridcrop.py` crops); `write_addons.py` writes them.
8. **Checks** — `pipeline/clay2.py` (model shading vs the clay images),
   `pipeline/eval_sil.py` (silhouette residuals per view),
   `pipeline/ovl_parts.py` / `ovl_regions.py` (outlines on the references),
   `pipeline/render_parts.py` (the built parts in every view).

The pipeline scripts run from a work directory holding the intermediate
files (`fit_views2.pkl`, the cage pickles, the curve point arrays); they
are a record of what was run, not a one-command tool.

**Superseded experiments**, kept because their results informed the
pipeline: `bsfit*.py`, `bsurf.py` (B-spline body), `fit.py`, `fairfit.py`
(direct mesh fits), `photofit.py`, `turntable.py` (first photometric
attempts; `psnorm.py` replaced them), `maskfit.py`, `dispfit.py`,
`hull.py`, `sfm.py`, `xmatch.py`, `lines.py`, `curves.py`, `trace.py`.
