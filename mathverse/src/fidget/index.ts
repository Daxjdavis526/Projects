// Fidget mode: playgrounds for free experiment (see AUTHORING.md).
import type { DemoDef } from '../modules/types';
import { vectorPlayground } from './vectors';
import { surfaceSculptor } from './sculptor';
import { derivativeExplorer } from './derivative';
import { taylorBuilder } from './taylor';
import { eigenMachine } from './eigen';
import { curvatureExplorer } from './curvature';
import { waveLab } from './waves';
import { flowField } from './flow';

export const demos: DemoDef[] = [vectorPlayground, surfaceSculptor, derivativeExplorer, taylorBuilder, eigenMachine, curvatureExplorer, waveLab, flowField];
