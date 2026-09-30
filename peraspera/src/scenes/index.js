// Scene id → draw(ctx, t, scene). Each draw paints the whole frame for scene
// time t (seconds from the scene's first frame) and keeps no state between
// calls, so any frame can be drawn on its own.

import * as kid from './kid.js';
import * as england from './england.js';
import * as iron from './iron.js';
import * as speed from './speed.js';
import * as her from './her.js';
import * as loss from './loss.js';
import * as question from './question.js';
import * as summer from './summer.js';
import * as home from './home.js';
import * as rockets from './rockets.js';
import * as job from './job.js';
import * as dream from './dream.js';
import * as credits from './credits.js';
import * as future from './future.js';

export const SCENE_DRAW = {
  sky: kid.sky,
  bedroom: kid.bedroom,
  england: england.england,
  shop: iron.shop,
  brothers: iron.brothers,
  track: speed.track,
  podium: speed.podium,
  meet: her.meet,
  wedding: her.wedding,
  friend: loss.friend,
  gym: question.gym,
  apply: question.apply,
  leaving: summer.leaving,
  doors: summer.doors,
  goodbyes: summer.goodbyes,
  nights: summer.nights,
  driveway: home.driveway,
  school: rockets.school,
  study: rockets.study,
  teststand: rockets.teststand,
  cleanroom: job.cleanroom,
  cad: job.cad,
  research: job.research,
  code: dream.code,
  farm: dream.farm,
  lookup: dream.lookup,
  credits: credits.credits,
  guess: credits.guess,
  'future-stand': future.stand,
  'future-fire': future.fire,
  'future-stage': future.stage,
  'future-night': future.night,
};
