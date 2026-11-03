// The Differential Geometry module (see AUTHORING.md): curves, surfaces,
// charts and metrics, geodesics, parallel transport, curvature tensors, and
// an honest first look at curved spacetime.
import type { DemoDef } from '../types';
import { curveDemos } from './curves';
import { surfaceDemos } from './surfaces';
import { chartDemos } from './charts';
import { geodesicDemos } from './geodesics';
import { transportDemos } from './transport';
import { tensorDemos } from './tensors';
import { spacetimeDemos } from './spacetime';

export const demos: DemoDef[] = [...curveDemos, ...surfaceDemos, ...chartDemos, ...geodesicDemos, ...transportDemos, ...tensorDemos, ...spacetimeDemos];
