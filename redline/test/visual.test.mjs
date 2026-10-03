/* What the cameras and the microphone are given, headless: the plume's
   regimes and shock structure from the nozzle and the chamber pressure,
   hot-wall colour, the flame's look, and cellState/CellEvents from real
   runs on each stand.
   run: node redline/test/visual.test.mjs */
import { jetState, blackbody, glow, flameLook, cellState, CellEvents, Tape, machOfArea, areaRatio } from '../src/sim/visual.js';
import { Session } from '../src/sim/session.js';
import ts1 from '../src/content/stands/ts1-coldgas.js';
import ts2 from '../src/content/stands/ts2-biprop.js';
import ts3 from '../src/content/stands/ts3-turbopump.js';
import ts3g from '../src/content/stands/ts3g-engine.js';
import { psi } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const Pa = 101325, mm = x => x / 1000;
const bpe1 = Pc => jetState({ Pc, Pa, Tc: 3200, Dt: mm(14.4), De: mm(28) });

console.log('isentropic relations');
{
  check('area ratio of Mach 1 is 1', Math.abs(areaRatio(1, 1.4) - 1) < 1e-9);
  check('Mach 2 in air has A/A* = 1.6875', Math.abs(areaRatio(2, 1.4) - 1.6875) < 1e-3, areaRatio(2, 1.4).toFixed(4));
  check('and inverts', Math.abs(machOfArea(1.6875, 1.4) - 2) < 1e-3);
}

console.log('the jet from BPE-1 against chamber pressure');
{
  const pts = [1.15e5, 3e5, 1e6, 1.9e6, 2.4e6, 4e6].map(bpe1);
  check('barely above ambient: subsonic, no shock cells', pts[0].regime === 'subsonic' && pts[0].diamonds === 0);
  check('at 3 bar the nozzle runs separated, with a Mach disk', pts[1].regime === 'separated' && pts[1].machDisk && pts[1].sepFrac > 0.3, `${pts[1].regime}, sep ${pts[1].sepFrac.toFixed(2)}`);
  check('at 10 bar it flows full but strongly overexpanded (Mach disk)', pts[2].regime === 'overexpanded' && pts[2].machDisk, `pe/Pa ${pts[2].peRatio.toFixed(2)}`);
  check('at the design 19 bar: mildly overexpanded, no Mach disk', pts[3].regime === 'overexpanded' && !pts[3].machDisk && pts[3].peRatio > 0.8, `pe/Pa ${pts[3].peRatio.toFixed(2)}`);
  check('at 24 bar: underexpanded', pts[4].regime === 'underexpanded');
  check('the fully expanded jet Mach number rises with Pc', pts.every((p, i) => i === 0 || p.Mj > pts[i - 1].Mj));
  check('exit Mach number is fixed by the area ratio once flowing full', Math.abs(pts[3].Me - pts[5].Me) < 1e-6 && Math.abs(pts[3].Me - 2.61) < 0.03, pts[3].Me.toFixed(3));
  check('the jet diameter is near the exit diameter when nearly matched', Math.abs(pts[4].Dj / mm(28) - 1) < 0.05, `${(pts[4].Dj * 1e3).toFixed(1)} mm`);
  const j = pts[3];
  check('shock-cell spacing is 1.306·Dj·√(Mj²−1)', Math.abs(j.cell - 1.306 * j.Dj * Math.sqrt(j.Mj ** 2 - 1)) < 1e-12, `${(j.cell * 1e3).toFixed(0)} mm`);
  check('a few diamonds in the supersonic core (2–6)', j.diamonds >= 2 && j.diamonds <= 6, `${j.diamonds}`);
  check('diamonds are brighter when the mismatch is larger', pts[2].strength > j.strength && pts[5].strength > pts[4].strength);
  check('the exit is much colder than the chamber', j.Te < 0.65 * 3200, `${j.Te.toFixed(0)} K`);
}

console.log('a cold-gas jet');
{
  const c = jetState({ Pc: 11e5, Pa, Tc: 293, g: 1.4, R: 296.8, Dt: mm(2.5), De: mm(3.55) });
  check('TS-1 at ~150 psia is near matched', c.regime === 'matched' || Math.abs(c.peRatio - 1) < 0.1, `${c.regime} pe/Pa ${c.peRatio.toFixed(2)}`);
  check('and its exit is cold (it can fog humid air)', c.Te < 180, `${c.Te.toFixed(0)} K`);
  check('jet velocity is a few hundred m/s', c.Uj > 400 && c.Uj < 700, `${c.Uj.toFixed(0)} m/s`);
}

console.log('colour');
{
  check('blackbody colour is normalised and red at 1000 K', blackbody(1000)[0] === 1 && blackbody(1000)[2] < 0.05);
  check('it whitens with temperature', blackbody(3000)[2] > blackbody(1500)[2]);
  check('no visible glow below the Draper point', glow(700) === 0 && glow(760) === 0);
  check('and it climbs steeply above it', glow(900) > 0 && glow(1200) > 5 * glow(900));
  const lean = flameLook({ Tc: 3000, MR: 2.0, MRst: 2.0 }), rich = flameLook({ Tc: 3000, MR: 1.0, MRst: 2.0 });
  check('a fuel-rich flame is sootier and afterburns', rich.soot > lean.soot && rich.afterburn > lean.afterburn && lean.afterburn === 0);
}

const ready = (def, setup) => {
  const s = new Session({ def, mode: 'independent', seed: 3, faultChanceNone: 1 });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  setup(s, ex);
  return { s, ex };
};
const hotTS2 = (s, ex) => {
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: ts2.sensors.filter(x => x.kind === 'PT').map(x => x.id) });
  ex('tare', { ids: ['WT-716', 'WT-726'] });
  ex('tech', { task: 'loadPropellants' }); s.run(121);
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-601', open: true }); s.run(2); ex('clearCell'); s.run(7);
  ex('regSet', { id: 'PR-630', value: psi(150) }); ex('regSet', { id: 'PR-610', value: psi(400) }); ex('regSet', { id: 'PR-620', value: psi(400) });
  s.run(30);
};
/* Fire and sample cellState every 10 ms through the run. */
function sampleRun(s, ex, plan, T) {
  ex('plan', { plan }); ex('arm'); ex('fire');
  const ev = new CellEvents(), out = [], evs = [];
  for (let t = 0; t < T; t += 0.01) { s.run(0.01, 0.01); const st = cellState(s); out.push(st); for (const e of ev.update(st)) evs.push({ ...e, t: s.t }); }
  return { out, evs };
}

console.log('cellState through a TS-2 hot fire');
{
  const { s, ex } = ready(ts2, hotTS2);
  const tape = new Tape();
  s.samplers.add(tape.sampler);
  const st0 = cellState(s);
  check('before the run: the cell is secured, nothing lit, nothing flowing', st0.area !== 'OPEN' && !st0.jet.lit && !st0.spray && st0.personnel === 0);
  const { out, evs } = sampleRun(s, ex, { mode: 'hot', duration: 2, lead: 0, ignLead: 0.5, ignOff: 1.0, ignCheck: 0.5, shutdown: 'ox-first', shutLag: 0.05, postPurge: 3 }, 12);
  const lit = out.filter(x => x.jet.lit), bright = lit.filter(x => x.jet.look.lum > 0.3);
  const mid = lit[Math.floor(lit.length / 2)];
  check('it burns bright for about the planned two seconds', bright.length > 170 && bright.length < 240, `${(bright.length / 100).toFixed(2)} s bright`);
  check('and the dribble burns on, dimly, after the valves close', lit.length > bright.length + 20, `${(lit.length / 100).toFixed(2)} s lit in all`);
  check('mid-burn: Pc at nominal, overexpanded a little, shock diamonds', Math.abs(mid.jet.Pc / mid.jet.Pnom - 1) < 0.15 && mid.jet.regime === 'overexpanded' && mid.jet.diamonds >= 2, `${(mid.jet.Pc / 1e5).toFixed(1)} bar, ${mid.jet.regime}, ${mid.jet.diamonds} diamonds`);
  check('the flame is bright and its mixture ratio is the burning one', mid.jet.look.lum > 0.5 && Math.abs(mid.jet.MR - 1.5) < 0.3, `lum ${mid.jet.look.lum.toFixed(2)}, MR ${mid.jet.MR.toFixed(2)}`);
  check('the jet carries hundreds of kW of mechanical power (≈ 150 dB of sound)', mid.sound.jetPower > 2e5 && mid.sound.jetPower < 1e6, `${(mid.sound.jetPower / 1e3).toFixed(0)} kW`);
  check('the igniter shows before light-up', out.some(x => x.igniter && !x.jet.lit));
  check('the beacon is red during the run', mid.beacon === 'RED');
  check('events: one ignition, one shutdown, no hard start', evs.filter(e => e.type === 'ignition').length === 1 && evs.filter(e => e.type === 'shutdown').length === 1 && !evs.some(e => e.type === 'hardstart'), evs.map(e => e.type).join(','));
  check('the purge shows after shutdown', out.slice(out.indexOf(lit[lit.length - 1])).some(x => x.purge > 1e-4));
  check('the main valves are seen open during the burn and shut after', mid.valves['MOV-713'] > 0.95 && out[out.length - 1].valves['MOV-713'] < 0.05);
  check('the tank sight glasses fall', out[out.length - 1].tanks[0].fill < st0.tanks[0].fill);
  check('the throat wall is hot but not glowing after a 2 s burn', mid.walls.th > 330 && mid.walls.glowTh < 0.2, `${mid.walls.th.toFixed(0)} K`);
  s.run(6);
  const T = tape.last, [a, b] = tape.span();
  check('the tape caught the run from just before T-0 to after the sequence', !!T && a <= -0.95 && b > 4, T ? `${a.toFixed(2)} → ${b.toFixed(2)} s` : 'nothing recorded');
  check('at 100 frames a second', T && Math.abs(T.frames.length / (b - a) - 100) < 3, T ? `${(T.frames.length / (b - a)).toFixed(1)} /s` : '');
  check('a frame mid-burn is lit; one before T-0 is not', tape.at(1.0)?.jet.lit && !tape.at(-0.5)?.jet.lit);
}

console.log('a hard start is seen and heard');
{
  const { s, ex } = ready(ts2, hotTS2);
  const { evs } = sampleRun(s, ex, { mode: 'hot', duration: 2, lead: 0.2, ignLead: 0.5, ignOff: 1.0, ignCheck: 0.5, shutdown: 'ox-first', shutLag: 0.05, postPurge: 3 }, 9);
  const hs = evs.find(e => e.type === 'hardstart');
  check('a 200 ms oxidiser lead gives a hard-start event', !!hs, evs.map(e => e.type).join(','));
  check('with the overpressure in it', hs && hs.ratio > 1.35, hs ? hs.ratio.toFixed(2) : '');
}

console.log('a TS-2 cold flow: spray, no flame');
{
  const { s, ex } = ready(ts2, (s, ex) => {
    ex('daqPower', { on: true }); s.run(5);
    ex('tech', { task: 'fillTanks' }); s.run(91);
    ex('tech', { task: 'openHV' }); s.run(9);
    for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
    ex('valve', { id: 'IV-601', open: true }); s.run(2); ex('clearCell'); s.run(7);
    ex('regSet', { id: 'PR-610', value: psi(150) }); ex('regSet', { id: 'PR-620', value: psi(150) }); s.run(30);
  });
  const { out } = sampleRun(s, ex, { mode: 'single', duration: 2, sides: 'both', lead: 0, postPurge: 3 }, 9);
  const sp = out.filter(x => x.spray);
  check('water leaves the nozzle as spray', sp.length > 100 && sp.some(x => x.spray.mdot > 0.1), `${sp.length} samples, peak ${Math.max(...sp.map(x => x.spray.mdot)).toFixed(3)} kg/s`);
  check('at a jet velocity of tens of m/s', sp.every(x => x.spray.v >= 5 && x.spray.v <= 60));
  check('nothing lights', out.every(x => !x.jet.lit));
}

console.log('a TS-1 cold-gas firing');
{
  const { s, ex } = ready(ts1, (s, ex) => {
    ex('daqPower', { on: true }); s.run(5);
    ex('tech', { task: 'openHV' }); s.run(9);
    ex('valve', { id: 'VV-101', open: false }); ex('valve', { id: 'VV-201', open: false });
    ex('valve', { id: 'IV-101', open: true }); s.run(2); ex('clearCell'); s.run(7);
    ex('regSet', { id: 'PR-101', value: psi(150) }); s.run(20);
  });
  const { out } = sampleRun(s, ex, { mode: 'single', duration: 2 }, 9);
  const on = out.filter(x => x.jet.mdot > 1e-4);
  check('the jet flows and is never lit', on.length > 150 && out.every(x => !x.jet.lit));
  const m = on[Math.floor(on.length / 2)];
  check('it is choked and supersonic, with shock cells', m.jet.choked && m.jet.Mj > 1.5 && m.jet.diamonds > 0, `Mj ${m.jet.Mj.toFixed(2)}`);
  check('cold enough to fog humid air', m.jet.fog > 0.3, m.jet.fog.toFixed(2));
  check('loud: a jet of the order of a kilowatt', m.sound.jetPower > 200 && m.sound.jetPower < 5000, `${m.sound.jetPower.toFixed(0)} W`);
}

console.log('a TS-3 spin');
{
  const { s, ex } = ready(ts3, (s, ex) => {
    ex('daqPower', { on: true }); s.run(5);
    ex('tech', { task: 'fillTanks' }); s.run(91); ex('tech', { task: 'turnRotor' }); s.run(31);
    ex('tech', { task: 'openHV' }); s.run(9);
    for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
    ex('valve', { id: 'IV-301', open: true }); s.run(2); ex('clearCell'); s.run(7);
    ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); s.run(25);
  });
  const ev = new CellEvents(), evs = [];
  ex('plan', { plan: { mode: 'spin', ctl: 'speed', speed: 36000, ramp: 3, duration: 8, thr: 0.66 } }); ex('arm'); ex('fire');
  let st;
  for (let t = 0; t < 11; t += 0.05) { s.run(0.05, 0.05); st = cellState(s); for (const e of ev.update(st)) evs.push(e.type); }
  check('at design speed the camera sees 36 000 rpm', Math.abs(st.tp.rpm - 36000) < 800, `${st.tp.rpm.toFixed(0)} rpm`);
  check('the turbine exhaust is cold nitrogen (it fogs)', st.tp.exhaust.mdot > 0.01 && st.tp.exhaust.T < 273, `${st.tp.exhaust.mdot.toFixed(3)} kg/s at ${st.tp.exhaust.T.toFixed(0)} K`);
  check('both pumps discharge into the catch tank', st.tp.discharge.ox > 0.3 && st.tp.discharge.fu > 0.3);
  check('no cavitation at 50 psig', st.sound.cav < 0.02, st.sound.cav.toFixed(3));
  check('a spin-up event', evs.includes('spinup'));
  for (let t = 0; t < 30; t += 0.1) { s.run(0.1, 0.05); st = cellState(s); for (const e of ev.update(st)) evs.push(e.type); }
  check('and a spin-down after the coast', evs.includes('spindown') && st.tp.rpm < 300, `${st.tp.rpm.toFixed(0)} rpm`);
}

console.log('a TS-3G hot fire: the start gas, then the gas generator, then the engine');
{
  const { s, ex } = ready(ts3g, (s, ex) => {
    ex('daqPower', { on: true }); s.run(5);
    ex('tech', { task: 'loadPropellants' }); s.run(151);
    ex('meterCal', { line: 'ox', fluid: 'LOX' }); ex('meterCal', { line: 'fu', fluid: 'ethanol' });
    ex('inspection', { id: 'spark-check' }); s.run(41);
    ex('tech', { task: 'openHV' }); s.run(9);
    for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
    ex('valve', { id: 'IV-301', open: true }); s.run(2); ex('clearCell'); s.run(7);
    ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); ex('regSet', { id: 'PR-630', value: psi(150) }); s.run(30);
  });
  const ev = new CellEvents(), evs = [];
  ex('plan', { plan: { mode: 'hot', duration: 6, thrSteps: null } }); ex('arm'); ex('fire');
  let st, spin = null;
  for (let t = 0; t < 9.6; t += 0.05) {   // a 5 s countdown, then T+4.6: mainstage
    s.run(0.05, 0.05); st = cellState(s); for (const e of ev.update(st)) evs.push(e.type);
    // T+0.3: the turbine on start gas alone — cold nitrogen out of the duct, nothing lit
    if (!spin && s.controller.seq?.tFire != null && s.t - s.controller.seq.tFire > 0.3) spin = st;
  }
  check('on start gas the turbine spins and its exhaust is unlit nitrogen', spin && spin.tp.rpm > 3000 && spin.tp.exhaust.mdot > 0.01 && !spin.tp.exhaust.lit && !spin.gg.lit,
    spin ? `${spin.tp.rpm.toFixed(0)} rpm, ${spin.tp.exhaust.mdot.toFixed(3)} kg/s` : 'no snapshot');
  check('at mainstage the gas generator burns and its exhaust is lit (the afterburning flame)', st.gg.lit && st.tp.exhaust.lit && st.tp.exhaust.mdot > 0.02, `${st.tp.exhaust.mdot.toFixed(3)} kg/s at ${st.tp.exhaust.T.toFixed(0)} K`);
  check('the gas generator\'s can does not glow: its steel stays far below the Draper point', st.gg.glow < 0.05 && st.gg.T > 700, `${st.gg.glow.toFixed(3)}, gas ${st.gg.T.toFixed(0)} K`);
  check('the main chamber is lit, its plume flowing full', st.jet.lit && st.jet.regime !== 'separated' && st.jet.diamonds > 0, `${st.jet.regime}, Mj ${st.jet.Mj.toFixed(2)}`);
  check('the camera sees the tap valves and the main valves open', st.valves['GOV-416'] > 0.9 && st.valves['GFV-426'] > 0.9 && st.valves['MOV-414'] > 0.9, JSON.stringify({ gov: st.valves['GOV-416'], mov: st.valves['MOV-414'] }));
  check('no liquid sound while the chamber burns', st.sound.liquid === 0, String(st.sound.liquid));
  check('ignition and spin-up events', evs.includes('ignition') && evs.includes('spinup'), evs.join(','));
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
