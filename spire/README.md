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

The design came as three things: a pen sketch, a white 3D print and a stacked
acrylic study model (which is missing its top section, so it is no guide to
the height). They share one idea, a spiral, and that is what `src/tower.js`
builds:

- a **square core** that rises and tapers;
- **two bands of building winding up round it together**, half a turn apart.
  Each band climbs a quarter turn at a time: one length runs along a face of
  the core and on past the corner, and the next length starts where it ended,
  as high as it ended, on the next face. Seen from any side, the bands are the
  steep diagonal strips climbing the sketch, with the core in the recess under
  each one. At the foot they are its two legs. From above they make the
  pinwheel of the print's top view;
- a slight extra twist on every quarter turn, so the whole spiral turns as it
  rises;
- each band's **last length drawn up into a sail**: its leading edge stands
  straight up, and its top climbs on the spiral's own diagonal to the tip. The
  tall one carries the **mast**; the other stops lower beside it;
- **cables** fanning from the lower turns to anchors on the ground, as in the
  sketch.

The numbers are mine, not his. The drawings have no dimensions, so the
proportions were tuned by eye against the photographs. The scale is a
plausible guess rather than anything he specified: about 455 m to the mast
tip, a full turn of each band every 120 m, 4.2 m floors and 3 m mullions.

## Controls

| | |
|---|---|
| drag | turn around the tower |
| scroll / pinch | approach |
| **Sketch · Model · Built** | the drawing; a white massing model like the 3D print; the building |
| time slider | dawn → midday → golden hour → dusk → night |
| **Orbit** (O) | a slow turn around the tower |
| **Save image** | downloads the current view as a PNG |
| Space | toggle sketch / built |

## How it is built

No build step: static files, three.js r180 vendored under `vendor/`.

- `src/tower.js`: the form, as plain polyhedra. Imports nothing, so it is
  checked headlessly: `node spire/test/tower.test.mjs` (closed, outward-wound
  solids; each band rises, turns one way, narrows and is continuous from one
  length to the next; the bands start together at the ground; cables sag to
  anchors on the plinth).
- `src/build.js`: turns the polyhedra into flat-shaded geometry, each face
  carrying a "facade" coordinate (along the face, and height) that both the
  glass and the ink shaders draw their grids from.
- `src/ink.js`: the drawing. Edges are screen-space ribbons that overshoot
  their corners the way ruled pen lines do, with an order so the drawing can
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
- **The trees, plinth, steps and anchors are invented** to give the tower
  something to stand on and a sense of size. None of them are in the sketch.
- **The hatching is laid in screen space**, as a hand would hatch it, so it
  stays put while the building turns under it. That is deliberate.
