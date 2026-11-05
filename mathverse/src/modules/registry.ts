// Every demonstration, by module. Each module's index.ts exports `demos`.
import type { DemoDef, ModuleId } from './types';
import { demos as calc1 } from './calc1';
import { demos as calc2 } from './calc2';
import { demos as calc3 } from './calc3';
import { demos as linalg } from './linalg';
import { demos as ode } from './ode';
import { demos as pde } from './pde';
import { demos as geometry } from './geometry';
import { demos as fidget } from '../fidget';

export const DEMOS: DemoDef[] = [...calc1, ...calc2, ...calc3, ...linalg, ...ode, ...pde, ...geometry, ...fidget];
export const byId = new Map(DEMOS.map((d) => [d.id, d]));
export const demosOf = (m: ModuleId) => DEMOS.filter((d) => d.module === m);
