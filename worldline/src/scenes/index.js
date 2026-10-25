// Every scene's draw function, by scene id. A scene's draw(g, t, s) paints
// the whole frame for scene time t (seconds) and keeps nothing between calls.

import title from './title.js';
import newton from './newton.js';
import lightclock from './lightclock.js';
import muons from './muons.js';
import train from './train.js';
import cones from './cones.js';
import elevator from './elevator.js';
import clocks from './clocks.js';
import geodesics from './geodesics.js';
import equations from './equations.js';
import blackhole from './blackhole.js';
import waves from './waves.js';
import cosmos from './cosmos.js';
import evidence from './evidence.js';
import frontiers from './frontiers.js';
import path from './path.js';
import end from './end.js';

export const SCENE_DRAW = {
  title, newton, lightclock, muons, train, cones, elevator, clocks, geodesics,
  equations, blackhole, waves, cosmos, evidence, frontiers, path, end,
};
