// The pde module's demonstrations (see AUTHORING.md).
import type { DemoDef } from '../types';
import { heat1d } from './heat1d';
import { stability } from './stability';
import { wave } from './wave';
import { membrane } from './membrane';
import { laplace } from './laplace';
import { heat2d } from './heat2d';
import { poisson } from './poisson';
import { bc } from './bc';
import { diffusion } from './diffusion';
import { separation } from './separation';
import { fourier } from './fourier';

export const demos: DemoDef[] = [heat1d, bc, heat2d, wave, membrane, laplace, poisson, diffusion, separation, fourier, stability];
