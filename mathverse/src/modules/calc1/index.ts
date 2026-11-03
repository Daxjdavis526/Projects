// The calc1 module's demonstrations (see AUTHORING.md).
import type { DemoDef } from '../types';
import { limitDemos } from './limits';
import { derivativeDemos } from './derivative';
import { ruleDemos } from './rules';
import { chainDemos } from './chain';
import { implicitDemos } from './implicit';
import { ratesDemos } from './relatedrates';
import { extremaDemos } from './extrema';
import { optimizationDemos } from './optimize';
import { integralDemos } from './integral';
import { motionDemos } from './motion';

export const demos: DemoDef[] = [
  ...limitDemos,
  ...derivativeDemos,
  ...ruleDemos,
  ...chainDemos,
  ...implicitDemos,
  ...ratesDemos,
  ...extremaDemos,
  ...optimizationDemos,
  ...integralDemos,
  ...motionDemos,
];
