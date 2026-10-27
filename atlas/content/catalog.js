// Every course in the Atlas, in library order.

import { buildCatalog } from '../src/core/catalog.js';
import m0 from './m0/index.js';
import math1210 from './math1210/index.js';
import math1220 from './math1220/index.js';
import math2210 from './math2210/index.js';
import math2270 from './math2270/index.js';
import math2280 from './math2280/index.js';
import math2250 from './math2250/index.js';
import phys2210 from './phys2210/index.js';
import phys2220 from './phys2220/index.js';
import phys2710 from './phys2710/index.js';
import phys3710 from './phys3710/index.js';
import phys3550 from './phys3550/index.js';
import phys3600 from './phys3600/index.js';
import phys3700 from './phys3700/index.js';
import phys3750 from './phys3750/index.js';
import phys4600 from './phys4600/index.js';
import phys4650 from './phys4650/index.js';
import phys4700 from './phys4700/index.js';
import phys4710 from './phys4710/index.js';
import lab from './lab/index.js';
import research from './research/index.js';
import prog from './prog/index.js';
import stA from './st-a/index.js';
import stB from './st-b/index.js';
import stC from './st-c/index.js';
import stD from './st-d/index.js';
import stE from './st-e/index.js';
import stF from './st-f/index.js';
import stG from './st-g/index.js';
import gr from './gr/index.js';

export const COURSES = [
  m0, math1210, math1220, math2210, math2270, math2280, math2250,
  phys2210, phys2220, phys2710, phys3710, phys3550, phys3600, phys3700, phys3750, phys4600, phys4650, phys4700, phys4710,
  lab, research, prog,
  stA, stB, stC, stD, stE, stF, stG,
  gr,
];

export const CATALOG = buildCatalog(COURSES);
