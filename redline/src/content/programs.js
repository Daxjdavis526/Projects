/* The training catalogue. Competency-based: each level lists what it
   teaches, and nothing is locked — jump in anywhere. Levels that are not
   built yet say so plainly, and which development phase brings them. */

import ts1 from './stands/ts1-coldgas.js';
import ts2 from './stands/ts2-biprop.js';
import bpOrientation from './procedures/bp-orientation.js';
import bpColdflow from './procedures/bp-coldflow.js';
import orientation from './procedures/cg-orientation.js';
import basicFiring from './procedures/cg-basic-firing.js';
import pressureChar from './procedures/cg-pressure-char.js';
import pulse from './procedures/cg-pulse.js';
import trouble from './procedures/cg-trouble.js';
import campaign from './procedures/cg-campaign.js';

export const STANDS = { 'TS-1': ts1, 'TS-2': ts2 };

export const MODES = {
  tutorial:    { label: 'Tutorial', text: 'Every step explained. Strict interlocks. Stations make their own go/no-go calls and say why.' },
  guided:      { label: 'Guided', text: 'The procedure is shown and checked; explanations on request. Unsafe actions warn before they happen.' },
  independent: { label: 'Independent', text: 'Checklist titles only. You decide. Stations report data, not calls. Consequences arrive through the physics.' },
  fault:       { label: 'Fault injection', text: 'Independent, with hidden faults that may or may not be present. Diagnose from the data.' },
  analysis:    { label: 'Post-test analysis', text: 'Reduce and compare recorded runs.' },
};

export const PROGRAMS = [
  {
    id: 'coldgas', title: 'Cold-gas thruster testing', stand: 'TS-1',
    blurb: 'A nitrogen cold-gas thruster on a small load-cell stand. The simplest propulsion system that still has every part of a test: stored energy, regulation, a fire valve, a nozzle, instruments, and decisions.',
    levels: [
      { n: 1, id: 'cg-orient', title: 'Cold-gas stand orientation', scenario: orientation, modes: ['tutorial', 'guided'],
        teaches: ['Control-room layout', 'P&ID reading', 'Zero offset and noise', 'Regulator droop and lock-up', 'Trapped volumes'] },
      { n: 2, id: 'cg-basic', title: 'Basic cold-gas firing', scenario: basicFiring, modes: ['tutorial', 'guided', 'independent', 'fault'],
        teaches: ['Full test procedure', 'Zero, tare and shunt calibration', 'Leak check', 'Go/no-go', 'Arming and firing', 'Safing', 'Data reduction'] },
      { n: 3, id: 'cg-pressure', title: 'Pressure characterisation', scenario: pressureChar, modes: ['tutorial', 'guided', 'independent', 'fault'],
        teaches: ['Test series and series polls', 'Thrust vs absolute chamber pressure', 'Reading nozzle geometry from a fit', 'Measured vs calculated mass flow', 'Regulator characterisation'] },
      { n: 4, id: 'cg-pulse', title: 'Pulse testing', scenario: pulse, modes: ['tutorial', 'guided', 'independent', 'fault'],
        teaches: ['Valve response vs inlet pressure', 'Impulse bit', 'Minimum impulse bit', 'Repeatability', 'High-rate DAQ'] },
      { n: 5, id: 'cg-trouble', title: 'Cold-gas troubleshooting', scenario: trouble, modes: ['guided', 'independent'],
        teaches: ['Sensor vs system faults', 'When to hold, abort or continue', 'Inspection', 'Root-cause diagnosis'] },
      { n: 6, id: 'cg-indep', title: 'Independent cold-gas test conductor', scenario: campaign, modes: ['independent'],
        teaches: ['Planning a campaign from a test request', 'Unscripted operations', 'Hidden faults', 'Is the data valid?', 'Test reports'] },
    ],
  },
  {
    id: 'biprop', title: 'Liquid bipropellant engine testing', stand: 'TS-2',
    blurb: 'A small pressure-fed research engine on fictional propellants: two feed systems, an injector, purge, and — before anything is lit — cold flows with water to find out what the injector really does.',
    levels: [
      { n: 7, id: 'bp-orient', title: 'Bipropellant stand orientation', scenario: bpOrientation, modes: ['tutorial', 'guided'],
        teaches: ['Separate oxidiser and fuel systems', 'Loading and tank scales', 'Pressure tare', 'Purge', 'Trapped volumes, twice'] },
      { n: 8, id: 'bp-coldflow', title: 'Bipropellant cold-flow test', scenario: bpColdflow, modes: ['tutorial', 'guided', 'independent'],
        teaches: ['Injector pressure drop and CdA', 'Priming and water hammer', 'Flowmeter vs tank scale', 'Mixture ratio from cold flow', 'Single-side flows'] },
      { n: 9, id: 'bp-hotfire', title: 'First hot fire', phase: 7, teaches: ['Ignition timing and confirmation', 'Valve sequencing', 'Hard start'] },
      { n: 10, id: 'bp-transients', title: 'Startup/shutdown analysis', phase: 7, teaches: ['Start and shutdown transients', 'Residual propellant'] },
      { n: 11, id: 'bp-faults', title: 'Bipropellant fault diagnosis', phase: 7, teaches: ['Combustion instability', 'Cooling faults', 'False redlines'] },
      { n: 12, id: 'bp-campaign', title: 'Independent test campaign', phase: 7, teaches: ['Campaign planning', 'Everything'] },
    ],
  },
];

export function findLevel(id) {
  for (const p of PROGRAMS) for (const l of p.levels) if (l.id === id) return { program: p, level: l };
  return null;
}
