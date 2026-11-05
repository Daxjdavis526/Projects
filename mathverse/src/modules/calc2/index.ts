// The calc2 module's demonstrations (see AUTHORING.md).
import type { DemoDef } from '../types';
import { partsDemo } from './parts';
import { trigintDemo } from './trigint';
import { trigsubDemo } from './trigsub';
import { partfracDemo } from './partfrac';
import { improperDemo } from './improper';
import { numintDemo } from './numint';
import { arclengthDemo } from './arclength';
import { washersDemo, shellsDemo } from './revolution';
import { surfaceDemo } from './surface';
import { parametricDemo } from './parametric';
import { polarDemo } from './polar';
import { seriesDemo } from './series';
import { testsDemo } from './tests';
import { taylorDemo } from './taylor';
import { powerseriesDemo } from './powerseries';
import { pendulumDemo } from './pendulum';

export const demos: DemoDef[] = [
  partsDemo, trigintDemo, trigsubDemo, partfracDemo, improperDemo, numintDemo,
  arclengthDemo, surfaceDemo, washersDemo, shellsDemo,
  parametricDemo, polarDemo,
  seriesDemo, testsDemo, taylorDemo, powerseriesDemo, pendulumDemo,
];
