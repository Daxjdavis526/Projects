// The linalg module's demonstrations (see AUTHORING.md).
import type { DemoDef } from '../types';
import { vectorDemos } from './vectors';
import { transformDemos } from './transforms';
import { systemDemos } from './systems';
import { eigenDemos } from './eigen';
import { orthogonalDemos } from './orthogonal';
import { physicsDemos } from './physics';

export const demos: DemoDef[] = [...vectorDemos, ...transformDemos, ...systemDemos, ...eigenDemos, ...orthogonalDemos, ...physicsDemos];
