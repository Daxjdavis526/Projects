// The ode module's demonstrations (see AUTHORING.md).
import type { DemoDef, DemoCtx } from '../types';
import { md } from './common';
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

/** Route every piece of prose through md() (see common.ts) so square roots render in Markup. */
function prose(d: DemoDef): DemoDef {
  return {
    ...d,
    experiments: d.experiments.map(md),
    tutorial: d.tutorial?.map((s) => ({ ...s, text: md(s.text), task: s.task && md(s.task) })),
    create: (ctx) => {
      const c = Object.create(ctx) as DemoCtx;   // reads fall through to the live shell context
      c.setNote = (t) => ctx.setNote(md(t));
      c.setSteps = (rows) => ctx.setSteps(rows.map((r) => ({ ...r, detail: r.detail && md(r.detail) })));
      return d.create(c);
    },
  };
}

export const demos: DemoDef[] = [slopefield, separable, linear1Demo, ivp, charroots, spring, nonhomog, resonance, phase, stability, pendulum, lotka, vanderpol, lorenz, euler, adaptive].map(prose);
