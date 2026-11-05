// The ode module's demonstrations (see AUTHORING.md).
import type { DemoDef } from '../types';
import { slopefield } from './slopefield';
import { separable } from './separable';
import { linear1Demo } from './linear1';
import { ivp } from './ivp';
import { charroots, nonhomog } from './second';
import { spring } from './spring';
import { resonance } from './resonance';
import { phase } from './phase';
import { stability } from './stability';
import { pendulum } from './pendulum';
import { lotka, vanderpol } from './cycles';
import { lorenz } from './lorenz';
import { euler, adaptive } from './numerics';

export const demos: DemoDef[] = [slopefield, separable, linear1Demo, ivp, charroots, spring, nonhomog, resonance, phase, stability, pendulum, lotka, vanderpol, lorenz, euler, adaptive];
