/* Starting points for a custom configuration. Neither is anybody's real
   hardware: one is TS-1, the training stand, as datasheet values; the other
   a generic small hobby/university stand with every value an estimate.
   Real parts — your parts — go in as configurations built from their
   datasheets, with each value's source recorded. */

import { defaultConfig } from './schema.js';

function generic() {
  const c = defaultConfig('Small stand (generic)');
  const set = (k, v, note = 'generic estimate — replace from the datasheet') => { c.f[k] = { v, src: 'estimate', note }; };
  set('bottleV', 6.8, 'e.g. a 6.8 L carbon-fibre cylinder');
  set('fillP', 3000); set('serviceP', 4500);
  set('hvCv', 0.3);
  set('supID', 3.0); set('supL', 1.0); set('supExtra', 15);
  c.f.ivFitted = { v: false, src: 'estimate', note: 'many small stands isolate with the bottle valve only' };
  set('regModel', 'Generic spring-loaded regulator', 'replace with the real part');
  set('regLoading', 'spring', 'hand-knob regulator');
  set('regCv', 0.06); set('regOutMax', 250); set('regInMax', 4500);
  set('droopP', 10); set('droopQ', 10); set('droopPin', 2000); set('spe', 2.0); set('regTau', 2.0); set('setRate', 60);
  set('rvSet', 225); set('rvCv', 0.3);
  set('feedID', 4.57, '1/4-in tube'); set('feedL', 0.8); set('feedFittings', 4); set('feedExtra', 25);
  set('filtFitted', false);
  set('flowmeter', false, 'most small stands have none');
  set('svModel', 'Generic 1/4-in direct-acting solenoid', 'replace with the real part');
  set('svCv', 0.15); set('svVolts', 12); set('svWatts', 10); set('svMOPD', 300); set('svTopen', 15); set('svTclose', 20);
  set('thrModel', 'Small cold-gas thruster'); set('throat', 1.5); set('exit', 3.0); set('halfAngle', 15); set('Cd', 0.95); set('plenum', 1.5);
  set('lcRange', 20); set('lcAcc', 0.1); set('standFn', 80); set('standZeta', 0.08); set('tare', 0.1);
  set('ptSupFS', 5000); set('ptLpFS', 300); set('ptAcc', 0.5); set('ptTau', 1.0);
  set('mawp', 300); set('meop', 200); set('personnel', 50);
  return c;
}

export const PRESETS = [
  { name: 'TS-1 reference values', newName: 'My stand', blurb: 'The training stand, as datasheet-style values', make: () => defaultConfig('My stand') },
  { name: 'Small stand (generic)', blurb: 'Spring regulator, 1/4-in lines, 12 V solenoid — all estimates', make: generic },
];
