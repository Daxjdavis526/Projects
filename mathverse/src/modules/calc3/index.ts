// The calc3 module's demonstrations (see AUTHORING.md), in teaching order.
import type { DemoDef } from '../types';
import { coords, triple } from './coords';
import { vectors, vecfn } from './curves';
import { partials, gradient, chain } from './derivatives';
import { optimize, lagrange } from './optimize';
import { double, jacobian } from './integrals';
import { fields, divcurl, lineint } from './fields';
import { flux, green, stokes, divthm } from './theorems';

export const demos: DemoDef[] = [
  coords, vectors, vecfn,
  partials, gradient, chain, optimize, lagrange,
  double, triple, jacobian,
  fields, divcurl, lineint, flux, green, stokes, divthm,
];
