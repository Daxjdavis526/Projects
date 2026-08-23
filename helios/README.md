# HELIOS — solar flight sandbox

A first-person spaceship flight sim through a continuous model of our solar
system. One HTML file plus the Three.js library — no build, no install, no
server. Open `index.html` in a desktop browser (or play the hosted version)
and click to launch.

**Keyboard + mouse required.** This one is a desktop game.

## Controls

| Input | Action |
|---|---|
| Mouse | pitch / yaw |
| A / D | roll |
| W / S | throttle up / down (S past zero = reverse) |
| X | full stop |
| Shift / Ctrl or mouse wheel | raise / lower the speed limit (1 km/s → 1000× light speed) |
| Tab or 1–9, 0 | select a target planet |
| F | autopilot to target — accelerates, then brakes into a close flyby |
| Click / Space | fire cannons |
| V | cockpit ↔ exterior camera |
| Hold right mouse | look around freely |
| H | controls panel · M mute · R respawn after death |

## What's in the box

- The Sun (a real 3D body, and the scene's light source) and all eight
  planets plus the Moon and Pluto, at real relative sizes and real orbital
  distances. Planets are drawn at 10× their true radius so they read as
  huge at gameplay ranges.
- Speeds from docking pace to 1000c. Warp streaks, FOV stretch and an
  engine hum that follows the throttle.
- Saturn's rings you can fly straight through — thousands of tumbling ice
  chunks appear around the ship inside the ring plane.
- A denser asteroid field through the real belt between Mars and Jupiter.
- Occasional hostile fighters: lead-indicator pip, hull damage, respawn.
- Procedural everything: planet textures, cockpit, ship, sounds. No assets.

## How the impossible distances work

Neptune is 4.5 billion km out, and graphics hardware is only accurate to
about 7 digits. The trick is a **floating origin**: the ship is always at
coordinate (0,0,0) and the rest of the universe is repositioned around it
every frame using JavaScript's 15-digit numbers. The GPU only ever sees
"relative to the ship" coordinates, which are small and precise exactly
where precision matters — near you.

## Files

- `index.html` — the whole game (styles, HUD, and ~1100 lines of game code
  in 8 labelled sections: core, world, ship, effects, combat, control, HUD, loop)
- `three.min.js` — Three.js r150, the 3D engine
