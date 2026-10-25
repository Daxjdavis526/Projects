// The end: the light cone and the worldline from the title, under the last
// lines and the credits.

import { ramp } from '../kit.js';
import { background } from '../paint.js';
import { lightConeGlyph } from './title.js';

export default function draw(g, t) {
  background(g, t, { stars: 260, seed: 7 });
  lightConeGlyph(g, 960, 860, 140, 0.4 * ramp(t, 0, 3) * (1 - ramp(t, 15, 17)), 1);
}
