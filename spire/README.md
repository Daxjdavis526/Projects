# SPIRE

A tower from an architect's sketchbook, built in the browser. It opens as an
ink drawing that puts itself down stroke by stroke, the way it was first
drawn; **Bring it to life** washes colour up over the paper from the waterline,
and the drawing becomes the building: glass and aluminium on a stone plinth in
a calm bay, under a sky you can move from dawn to night.

Live: https://daxjdavis526.github.io/Projects/spire/

Add `?by=Name` to the URL to put the architect's name on the title card
(`?title=` renames the tower). For example `spire/?by=Jane%20Doe`. Where a
query string can't be passed, `#by-Jane-Doe` does the same.

## Where the form comes from

The design came as a pen sketch, a white 3D print and a stacked acrylic study
model. The **acrylic model is the master**: the tower is built from it plate
by plate, one plate a floor. `src/tower.js` reads it as:

- **one big, nearly square plate a level**, threaded on the rod off centre.
  The plates come in clusters of about six. Within a cluster each plate steps
  a little further out and turns a few degrees; each new cluster starts
  sharply round from the last and leans out the other way. That is the
  model's fanned, tiered, twisting body, narrower at the foot and widest
  about halfway up;
- **the clusters carrying on above where the model stops** (it is missing
  its top, at about floor 48), each smaller than the last and a little
  shorter, five plates and then four, keeping the same twist and lean in
  proportion;
- **a short steeple** on the last plate, and **the mast** on that, where the
  model's brass rod comes out of the top.

Built for real, each plate becomes a floor: a pale slab whose edge reads as
the acrylic plate, with a storey of glass set back beneath it. **Model** shows
the plates and steeple as frosted acrylic on a brass rod, like his.

The plate sizes, offsets and angles were measured by eye from photographs and
checked by rendering the model from the same angles as the photos. They are
close, not exact: there are no drawings with dimensions. How the top
continues is a design choice, not something the model shows. The scale (4 m a
floor, 59 floors, about 310 m to the mast tip) is a plausible guess.

## Controls

| | |
|---|---|
| drag | turn around the tower |
| scroll / pinch | approach |
| **Sketch · Model · Built** | the drawing; the plates as frosted acrylic on a brass rod, like his model; the building |
| time slider | dawn → midday → golden hour → dusk → night |
| **Orbit** (O) | a slow turn around the tower |
| **Save image** | downloads the current view as a PNG |
| Space | toggle sketch / built |

## How it is built

No build step: static files, three.js r180 vendored under `vendor/`.

- `src/tower.js`: the form, as plain polyhedra. Imports nothing, so it is
  checked headlessly: `node spire/test/tower.test.mjs` (closed, outward-wound
  solids; every plate a floor with its glass set back under the slab; every
  plate threaded on the rod; the clusters turning one way all the way up,
  each smaller than the last above the widest; a short steeple centred on
  the rod with the mast on it).
- `src/build.js`: turns the polyhedra into flat-shaded geometry, each face
  carrying a "facade" coordinate (along the face, and height) that both the
  glass and the ink shaders draw their grids from.
- `src/ink.js`: the drawing. Each plate's outline is a screen-space ribbon
  that overshoots its corners the way ruled pen lines do, with an order so the drawing can
  be put down from the ground up. Faces carry a lightly ruled glazing grid
  and screen-space hatching that thickens on faces turned from the light. The
  reflection in the water is the same drawing, flipped and broken into dashes.
- `src/main.js`: two scenes, the ink one and the real one, composited at
  the end. The wash between them is a ragged noise front with pigment
  gathering at its edge. The real scene has a painted sky (`KEYS` holds the
  colours per hour), stock three.js water with three small shader changes
  (noted where they are made), shadows from the sun, a moon after dark, and
  bloom.

`node spire/tools/shots.mjs [outdir]` screenshots the drawing, the wash and
the building at several hours, headless.

## What is real and what is not

- **The sky is painted, not computed.** It is a gradient with a sun glow and a
  veil of cloud, its colours chosen per hour for how they look. There is no
  atmospheric scattering.
- **The glass is a shader, not a curtain wall.** Mullions, spandrels, panes a
  fraction of a degree out of plane, and lit rooms at night are all drawn on
  flat faces from one coordinate. There are no floors inside.
- **The light is roughly right.** Physically based materials, a directional
  sun with shadows, reflections from the sky. The sun's path is arranged for
  the view, not taken from any real latitude.
- **The water is a mirror with ripples.** Real reflection of the scene,
  with ripples that flatten with distance to avoid aliasing. There are no
  waves and no wake.
- **The trees, plinth and steps are invented** to give the tower something to
  stand on and a sense of size. None of them are in his drawings or models.
- **The hatching is laid in screen space**, as a hand would hatch it, so it
  stays put while the building turns under it. That is deliberate.
