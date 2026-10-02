/* The training catalogue. Competency-based: each level lists what it
   teaches, and nothing is locked — jump in anywhere. Levels that are not
   built yet say so plainly, and which development phase brings them. */

import ts1 from './stands/ts1-coldgas.js';
import ts2 from './stands/ts2-biprop.js';
import ts2r from './stands/ts2-regen.js';
import ts3 from './stands/ts3-turbopump.js';
import ts3g from './stands/ts3g-engine.js';
import tpOrientation from './procedures/tp-orientation.js';
import tpSpin from './procedures/tp-spin.js';
import tpMap from './procedures/tp-map.js';
import tpSuction from './procedures/tp-suction.js';
import tpTrouble from './procedures/tp-trouble.js';
import tpCampaign from './procedures/tp-campaign.js';
import ggOrientation from './procedures/gg-orientation.js';
import ggColdflow from './procedures/gg-coldflow.js';
import ggFirstfire from './procedures/gg-firstfire.js';
import ggThrottle from './procedures/gg-throttle.js';
import ggTrouble from './procedures/gg-trouble.js';
import ggCampaign from './procedures/gg-campaign.js';
import rgColdflow from './procedures/rg-coldflow.js';
import rgHotfire from './procedures/rg-hotfire.js';
import rgMargins from './procedures/rg-margins.js';
import rgTrouble from './procedures/rg-trouble.js';
import rgCampaign from './procedures/rg-campaign.js';
import bpOrientation from './procedures/bp-orientation.js';
import bpColdflow from './procedures/bp-coldflow.js';
import bpHotfire from './procedures/bp-hotfire.js';
import bpTransients from './procedures/bp-transients.js';
import bpTrouble from './procedures/bp-trouble.js';
import bpCampaign from './procedures/bp-campaign.js';
import orientation from './procedures/cg-orientation.js';
import basicFiring from './procedures/cg-basic-firing.js';
import pressureChar from './procedures/cg-pressure-char.js';
import pulse from './procedures/cg-pulse.js';
import trouble from './procedures/cg-trouble.js';
import campaign from './procedures/cg-campaign.js';

export const STANDS = { 'TS-1': ts1, 'TS-2': ts2, 'TS-2R': ts2r, 'TS-3': ts3, 'TS-3G': ts3g };

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
    blurb: 'A small pressure-fed research engine on fictional propellants: two feed systems, an injector, purge, cold flows with water to find out what the injector really does — and then fire: a spark igniter, start sequences, an uncooled copper chamber, and the faults that come with combustion.',
    levels: [
      { n: 7, id: 'bp-orient', title: 'Bipropellant stand orientation', scenario: bpOrientation, modes: ['tutorial', 'guided'],
        teaches: ['Separate oxidiser and fuel systems', 'Loading and tank scales', 'Pressure tare', 'Purge', 'Trapped volumes, twice'] },
      { n: 8, id: 'bp-coldflow', title: 'Bipropellant cold-flow test', scenario: bpColdflow, modes: ['tutorial', 'guided', 'independent'],
        teaches: ['Injector pressure drop and CdA', 'Priming and water hammer', 'Flowmeter vs tank scale', 'Mixture ratio from cold flow', 'Single-side flows'] },
      { n: 9, id: 'bp-hotfire', title: 'First hot fire', scenario: bpHotfire, modes: ['tutorial', 'guided', 'independent'],
        teaches: ['Loading propellants', 'Meter calibration fluid', 'Spark check and ignition confirmation', 'The start sequence', 'c* efficiency', 'Heat-sink burn limit and soak-back'] },
      { n: 10, id: 'bp-transients', title: 'Startup/shutdown analysis', scenario: bpTransients, modes: ['guided', 'independent'],
        teaches: ['Valve lead and start overshoot', 'Hard start', 'Dribble volume and shutdown impulse', 'Cooling between burns'] },
      { n: 11, id: 'bp-faults', title: 'Bipropellant fault diagnosis', scenario: bpTrouble, modes: ['guided', 'independent'],
        teaches: ['Igniter faults', 'Injector faults', 'Combustion instability', 'Cooling faults', 'False redlines'] },
      { n: 12, id: 'bp-campaign', title: 'Independent test campaign', scenario: bpCampaign, modes: ['independent'],
        teaches: ['Mixture-ratio and Pc targets', 'Throttling and injector stiffness', 'Campaign planning', 'Data validity'] },
    ],
  },
  {
    id: 'regen', title: 'Regeneratively cooled engine', stand: 'TS-2R',
    blurb: 'BPE-2 on the same stand: the same size and propellants as BPE-1, but its fuel flows through channels in the chamber wall on the way to the injector. No heat sink to fill — the burn lasts as long as the propellant, as long as the coolant keeps up: does not boil at the wall, does not coke, and has the pressure left over to feed the injector.',
    levels: [
      { n: 13, id: 'rg-coldflow', title: 'Cooling-jacket cold flow', scenario: rgColdflow, modes: ['tutorial', 'guided', 'independent'],
        teaches: ['Jacket ΔP and flow coefficient', 'Priming a jacket', 'Choosing a valve lead from priming times'] },
      { n: 14, id: 'rg-hotfire', title: 'First regen hot fire', scenario: rgHotfire, modes: ['tutorial', 'guided', 'independent'],
        teaches: ['Fuel lead', 'Coolant temperature rise and heat load', 'Boiling margin', 'A cooled wall reaches steady state'] },
      { n: 15, id: 'rg-margins', title: 'Cooling margins', scenario: rgMargins, modes: ['guided', 'independent'],
        teaches: ['Mixture ratio and coolant flow', 'Throttling a regen engine', 'Finding the limiting point'] },
      { n: 16, id: 'rg-faults', title: 'Regen engine fault diagnosis', scenario: rgTrouble, modes: ['guided', 'independent'],
        teaches: ['Blocked channels', 'Coking', 'Liner cracks', 'Coolant temperature', 'Instruments that lie about margin'] },
      { n: 17, id: 'rg-campaign', title: 'Long-duration acceptance campaign', scenario: rgCampaign, modes: ['independent'],
        teaches: ['20 s at the design point', 'Propellant and coolant budgets', 'Cooling deliverables', 'Data validity'] },
    ],
  },
  {
    id: 'turbopump', title: 'Turbopump component testing', stand: 'TS-3',
    blurb: 'TPA-1, the turbopump for a pump-fed engine, on the bench: two centrifugal pumps on water and an impulse turbine on cold nitrogen, one shaft at 36 000 rpm. Speed control, the affinity laws, head–flow maps, suction performance, bearings and vibration — and the runaway that follows when a pump loses its load.',
    levels: [
      { n: 18, id: 'tp-orient', title: 'Turbopump stand orientation', scenario: tpOrientation, modes: ['tutorial', 'guided'],
        teaches: ['What spins, what drives it, what loads it', 'Turning the rotor by hand', 'Head, not pressure', 'Relieving regulators'] },
      { n: 19, id: 'tp-spin', title: 'First spin', scenario: tpSpin, modes: ['tutorial', 'guided', 'independent'],
        teaches: ['Speed control and its feed-forward', 'Two speed pickups', 'The affinity laws', 'Turbine efficiency from temperatures', 'Coast-down'] },
      { n: 20, id: 'tp-map', title: 'Pump map', scenario: tpMap, modes: ['guided', 'independent'],
        teaches: ['Head–flow curves', 'Throttle steps at constant speed', 'Referring data to design speed', 'Power balance'] },
      { n: 21, id: 'tp-suction', title: 'Suction performance (NPSH)', scenario: tpSuction, modes: ['guided', 'independent'],
        teaches: ['NPSH available and required', 'The 3 % head-drop definition', 'Cavitation and unloading', 'Testing past an edge on purpose'] },
      { n: 22, id: 'tp-faults', title: 'Turbopump fault diagnosis', scenario: tpTrouble, modes: ['guided', 'independent'],
        teaches: ['Bearings, rubs and imbalance', 'Worn rings and damaged blading', 'Instrument faults inside a control loop', 'Reading a controller\'s output'] },
      { n: 23, id: 'tp-campaign', title: 'Turbopump acceptance campaign', scenario: tpCampaign, modes: ['independent'],
        teaches: ['Planning runs, water and gas', 'Design point, map and suction deliverables', 'Data validity'] },
    ],
  },
  {
    id: 'ggengine', title: 'Gas-generator cycle engine', stand: 'TS-3G',
    blurb: 'BPE-3 on TPA-1: the turbopump from TS-3 now feeds an engine, and a small fuel-rich gas generator burning 5 % of the propellant drives its turbine. Start gas, bootstrap, two igniters, a start that can hang or overspeed, throttling on the gas generator, an ablative chamber that erodes as it burns — and the Isp the cycle costs.',
    levels: [
      { n: 24, id: 'gg-orient', title: 'Gas-generator engine stand orientation', scenario: ggOrientation, modes: ['tutorial', 'guided'],
        teaches: ['The gas-generator cycle', 'Bootstrap and the start sequence', 'Two igniters', 'Three purges', 'Reading a start on paper'] },
      { n: 25, id: 'gg-coldflow', title: 'Pump-fed cold flow', scenario: ggColdflow, modes: ['tutorial', 'guided', 'independent'],
        teaches: ['A turbine on start gas alone', 'The injector under pump feed', 'Drawing vs as-built CdA', 'Coast-down with the valves open'] },
      { n: 26, id: 'gg-firstfire', title: 'First gas-generator hot fire', scenario: ggFirstfire, modes: ['tutorial', 'guided', 'independent'],
        teaches: ['Bootstrap', 'Start checks: light, light, speed', 'Turbine inlet temperature', 'Inferred GG flows', 'Engine vs chamber Isp'] },
      { n: 27, id: 'gg-throttle', title: 'Throttling and duration', scenario: ggThrottle, modes: ['guided', 'independent'],
        teaches: ['Throttling on the gas generator', 'GG mixture ratio and TIT', 'Injector stiffness at low thrust', 'Ablative throat erosion', 'Case soak-back'] },
      { n: 28, id: 'gg-faults', title: 'Gas-generator engine fault diagnosis', scenario: ggTrouble, modes: ['guided', 'independent'],
        teaches: ['Faults coupled through the shaft', 'GG orifices and igniters', 'Start gas faults', 'Liner and throat', 'Instruments inferring flows'] },
      { n: 29, id: 'gg-campaign', title: 'Engine acceptance campaign', scenario: ggCampaign, modes: ['independent'],
        teaches: ['Cold flow before hot fire', 'Propellant and gas budgets', 'Design point and throttle deliverables', 'Data validity'] },
    ],
  },
];

export function findLevel(id) {
  for (const p of PROGRAMS) for (const l of p.levels) if (l.id === id) return { program: p, level: l };
  return null;
}
