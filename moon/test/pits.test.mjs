/* The holes in the Moon, checked against the catalogue that measured them.

   The claim being tested is that the shape in the game is the shape in the
   LROC Lunar Pits Atlas, and that it is labelled for what it is. The atlas
   gives a funnel diameter, an inner diameter, a total depth, a funnel depth and
   the azimuth of the long axis; the profile here is fitted to those and to
   nothing else, so every one of them should be recoverable from the terrain
   afterwards. If a number drifts, this fails.

   Also here because it was the reason for building any of this: the game
   streams nothing finer than 118 m per pixel over any of these pits, and I
   took that to mean the shape was unknown. It is not — it is published as a
   table rather than as a raster — and the label has to say DERIVED rather than
   MEASURED to keep that distinction honest. */
import { PITS, pitById, pitDepthAt, buildPitRaster, distanceToPit } from '../src/data/pits.js';
import { PitField } from '../src/game/pitfield.js';
import { Heightfield, Raster } from '../src/terrain/heightfield.js';
import { LABEL, GM_MOON, R_MOON, PLAYER } from '../src/config.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const M_PER_DEG = R_MOON * Math.PI / 180;
/* A heightfield with flat ground, so anything that is not flat is the pit. */
function flatGround(h = -1500) {
  const hf = new Heightfield();
  hf.addRaster(new Raster({
    id: 'bg', bbox: [-180, -90, 180, 90], width: 8, height: 8, res_m: 118,
    priority: 1, source: 'test', label: LABEL.MEASURED, wrapX: true,
  }, new Float32Array(64).fill(h)));
  return hf;
}
/* Sample along a bearing from a pit's centre. */
const along = (hf, pit, bearingDeg, metres) => {
  const b = bearingDeg * Math.PI / 180;
  return hf.heightAt(
    pit.lat + metres * Math.cos(b) / M_PER_DEG,
    pit.lon + metres * Math.sin(b) / (M_PER_DEG * Math.cos(pit.lat * Math.PI / 180)));
};

console.log('the catalogue');
{
  check('four mare pits are catalogued', PITS.length === 4);
  for (const p of PITS) {
    const ok = Number.isFinite(p.lat) && Number.isFinite(p.lon) &&
      p.funnelMax >= p.funnelMin && p.innerMax >= p.innerMin &&
      p.funnelMin > p.innerMax && p.depth > p.funnelDepth &&
      p.azimuth >= 0 && p.azimuth < 360 && /lroc\.im-ldi\.com/.test(p.atlas);
    check(`${p.name} is internally consistent`, ok,
      `funnel ${p.funnelMin}-${p.funnelMax}, inner ${p.innerMin}-${p.innerMax}, ` +
      `depth ${p.depth} of which ${p.funnelDepth} funnel`);
  }
  check('every pit cites its atlas entry', PITS.every(p => p.atlas));
  check('every pit says where its depth datum comes from',
    PITS.every(p => /atlas/i.test(p.depthNote)));
  /* The point of the file: anything not straight off the atlas page is named
     as such, so the docs and the overlay can repeat it rather than quietly
     presenting a guess as a measurement. */
  check('and names every value it had to infer',
    PITS.every(p => Array.isArray(p.inferred) && p.inferred.length > 0));
  check('the overhang flag is the atlas flag, verbatim',
    PITS.every(p => ['Y', 'Y?', 'N', '?'].includes(p.overhang)));
  check('and carries a figure only where the atlas states one',
    PITS.filter(p => p.overhangM !== null).length === 1 &&
    pitById('tranquillitatis_pit').overhangM === 10);
  /* The one entry whose published depth excludes its funnel. */
  check('the Tranquillitatis floor is the funnel plus the inner pit',
    pitById('tranquillitatis_pit').depth === 125,
    '20 m funnel + 105 m inner pit');
  check('lookup by id works', pitById('marius_pit').depth === 40 && pitById('nope') === null);
}

console.log('the profile is the catalogue, read back out of the terrain');
{
  for (const pit of PITS) {
    const hf = flatGround();
    const { spec, data } = buildPitRaster(pit, -1500);
    hf.addRaster(new Raster(spec, data));

    const floor = hf.heightAt(pit.lat, pit.lon);
    check(`${pit.name}: the floor is ${pit.depth} m down`,
      Math.abs((floor + 1500) + pit.depth) < 0.5, `${(floor + 1500).toFixed(1)} m`);

    /* Walk out along the long and short axes and find where the ground stops
       going down at all: that is the funnel's outer margin, and it should be
       the catalogued diameter. Two centimetres rather than something rounder,
       because the funnel meets the plain tangentially — there is no rim crest
       to catch — so the only honest question is where a measurable depression
       begins. */
    const rimAt = (bearing) => {
      for (let m = 1; m < pit.funnelMax; m += 0.5) {
        if (along(hf, pit, bearing, m) > -1500.02) return m;
      }
      return -1;
    };
    const long = rimAt(pit.azimuth) * 2, short = rimAt((pit.azimuth + 90) % 360) * 2;
    check(`${pit.name}: the long axis is the catalogued ${pit.funnelMax} m`,
      Math.abs(long - pit.funnelMax) < 3, `${long.toFixed(0)} m`);
    check(`${pit.name}: the short axis is the catalogued ${pit.funnelMin} m`,
      Math.abs(short - pit.funnelMin) < 3, `${short.toFixed(0)} m`);
    check(`${pit.name}: and it is elliptical, as the atlas says`,
      pit.funnelMax === pit.funnelMin ? true : long > short + 1,
      `${long.toFixed(0)} x ${short.toFixed(0)} m at azimuth ${pit.azimuth}`);
  }
}

console.log('the walls are walls');
{
  const pit = pitById('tranquillitatis_pit');
  const hf = flatGround();
  const { spec, data } = buildPitRaster(pit, -1500);
  hf.addRaster(new Raster(spec, data));
  let steepest = 0;
  for (let a = 0; a < 360; a += 10) {
    const b = a * Math.PI / 180, r = pit.innerMax / 2;
    steepest = Math.max(steepest, hf.slopeAt(
      pit.lat + r * Math.cos(b) / M_PER_DEG,
      pit.lon + r * Math.sin(b) / (M_PER_DEG * Math.cos(pit.lat * Math.PI / 180)), 1));
  }
  check('the shaft wall is near vertical, as the atlas describes it',
    steepest > 80, steepest.toFixed(1) + ' deg');
  const friction = Math.atan(0.75) * 180 / Math.PI;
  check('which is far past what a boot can hold', steepest > friction + 30,
    `${steepest.toFixed(0)} deg against a ${friction.toFixed(0)} deg friction angle`);

  /* Falling in has to be a real event, and flying out has to be possible, or
     the pit is either a non-event or a trap. */
  const g = GM_MOON / (R_MOON * R_MOON);
  const impact = Math.sqrt(2 * g * pit.depth);
  check('falling in arrives well past the survivable speed',
    impact > PLAYER.fallFatal, `${impact.toFixed(1)} m/s against ${PLAYER.fallFatal}`);
  let v = 0, h = 0, heat = 0, t = 0;
  const dt = 1 / 120;
  while (h < pit.depth && t < 60) {
    if (heat < 1) {
      v += PLAYER.jetpackAccel * (1 - 0.35 * heat) * dt;
      heat = Math.min(1, heat + PLAYER.jetpackHeatUp * dt);
    }
    v -= g * dt; h += v * dt; t += dt;
  }
  check('and the jetpack can always fly you out again',
    h >= pit.depth && heat < 1, `${t.toFixed(1)} s, pack ${(heat * 100).toFixed(0)} % hot`);
}

console.log('the one pit with a ramp can be walked into');
{
  const friction = Math.atan(0.75) * 180 / Math.PI;
  for (const pit of PITS.filter(p => p.ramp !== null)) {
    const hf = flatGround();
    const { spec, data } = buildPitRaster(pit, -1500);
    hf.addRaster(new Raster(spec, data));
    /* Walk in down the ramp bearing and record the steepest step. */
    let worst = 0;
    for (let m = pit.funnelMax / 2; m > 1; m -= 0.5) {
      worst = Math.max(worst, hf.slopeAt(
        pit.lat + m * Math.cos(pit.ramp * Math.PI / 180) / M_PER_DEG,
        pit.lon + m * Math.sin(pit.ramp * Math.PI / 180) /
          (M_PER_DEG * Math.cos(pit.lat * Math.PI / 180)), 1));
    }
    check(`${pit.name}: the ramp is walkable`, worst < friction,
      `steepest ${worst.toFixed(0)} deg against a ${friction.toFixed(0)} deg limit`);
    /* And the opposite side is not, or the ramp would not be a ramp. */
    const opposite = (pit.ramp + 180) % 360;
    let other = 0;
    for (let m = pit.funnelMax / 2; m > 1; m -= 0.5) {
      other = Math.max(other, hf.slopeAt(
        pit.lat + m * Math.cos(opposite * Math.PI / 180) / M_PER_DEG,
        pit.lon + m * Math.sin(opposite * Math.PI / 180) /
          (M_PER_DEG * Math.cos(pit.lat * Math.PI / 180)), 1));
    }
    check(`${pit.name}: and the far side is not`, other > worst + 10,
      `${other.toFixed(0)} deg on the other side`);
  }
  check('the atlas flags an entrance ramp on exactly one of the four',
    PITS.filter(p => p.ramp !== null).length === 1);
}

console.log('provenance says derived, not measured');
{
  const pit = pitById('tranquillitatis_pit');
  const hf = flatGround();
  const { spec, data } = buildPitRaster(pit, -1500);
  hf.addRaster(new Raster(spec, data));
  const p = hf.probe(pit.lat, pit.lon);
  check('the label is DERIVED', p.label === LABEL.DERIVED, p.label);
  check('and it is not MEASURED, because a profile fitted to six numbers is not a measurement',
    p.label !== LABEL.MEASURED);
  check('the source names the catalogue', /Lunar Pits Atlas/.test(p.source), p.source);
  check('at one metre per pixel', p.res_m === 1, p.res_m + ' m/px');
  check('and nothing is invented on top of it',
    Math.abs(p.proceduralHeight) < 1e-9, p.proceduralHeight + ' m');
  /* Outside the patch the ground is the ordinary background again. */
  const out = hf.probe(pit.lat + 0.01, pit.lon);
  check('and the ground outside the patch is unchanged',
    out.res_m === 118 && Math.abs(hf.heightAt(pit.lat + 0.01, pit.lon) + 1500) < 1);
}

console.log('installing and dropping by range');
{
  const hf = flatGround();
  const field = new PitField({ heightfield: hf, terrain: null });
  const pit = PITS[0];
  field.update(0, 0);
  check('nothing is installed from the far side of the Moon', field.stats.installed === 0);
  check('and the ground there is untouched', Math.abs(hf.heightAt(pit.lat, pit.lon) + 1500) < 0.01);

  field.update(pit.lat, pit.lon);
  check('standing on it installs it', field.stats.installed === 1);
  check('and the hole appears',
    Math.abs(hf.heightAt(pit.lat, pit.lon) + 1500 + pit.depth) < 0.5);
  const bytes = field.stats.bytes;
  check('at a sane cost', bytes > 0 && bytes < 2e6, (bytes / 1024).toFixed(0) + ' KB');

  field.update(pit.lat, pit.lon);
  check('a second pass does not install it twice', field.stats.installed === 1);

  /* Just outside the install range but inside the drop range: hysteresis, so
     walking back and forth across the boundary does not thrash. */
  const at = (km) => field.update(pit.lat + km * 1000 / M_PER_DEG, pit.lon);
  at(40);
  check('it survives crossing back out past the install range', field.stats.installed === 1);
  at(60);
  check('and is dropped once you are well clear', field.stats.installed === 0);
  check('with the ground restored', Math.abs(hf.heightAt(pit.lat, pit.lon) + 1500) < 0.01);

  /* The hole is cut relative to whatever ground was there at the time, and at
     thirty kilometres that can still be the vendored global at two kilometres
     a pixel. When something finer arrives the plain moves; the pit has to
     move with it or there is a step at the rim. */
  {
    const hf2 = flatGround(-1500);
    const field2 = new PitField({ heightfield: hf2, terrain: null });
    field2.update(pit.lat, pit.lon);
    const before = hf2.heightAt(pit.lat, pit.lon);
    check('the hole sits in the ground that was there when it was cut',
      Math.abs(before + 1500 + pit.depth) < 0.5, `${(before + 1500).toFixed(1)} m`);

    /* Now the real ground arrives, forty metres lower. */
    hf2.addRaster(new Raster({
      id: 'better', bbox: [pit.lon - 0.3, pit.lat - 0.3, pit.lon + 0.3, pit.lat + 0.3],
      width: 8, height: 8, res_m: 59, priority: 0.5, source: 'finer', label: LABEL.MEASURED,
    }, new Float32Array(64).fill(-1540)));
    for (let i = 0; i < 100; i++) field2.update(pit.lat, pit.lon);
    const after = hf2.heightAt(pit.lat, pit.lon);
    check('and moves with it when better data lands under it',
      Math.abs(after + 1540 + pit.depth) < 0.5,
      `floor ${(after + 1540).toFixed(1)} m below the new plain`);
    check('rather than leaving a step at the rim',
      Math.abs(after - before + 40) < 0.5,
      `the whole pit dropped ${(before - after).toFixed(1)} m`);
  }

  check('the field knows which pit you are inside',
    field.at(pit.lat, pit.lon).id === pit.id);
  check('and that standing on the rim is not inside it',
    field.at(pit.lat + (pit.funnelMax / 2 + 20) / M_PER_DEG, pit.lon) === null);
  const near = field.nearest(pit.lat + 5000 / M_PER_DEG, pit.lon);
  check('and which is nearest, and how far',
    near.pit.id === pit.id && Math.abs(near.range - 5000) < 50,
    `${near.pit.name} at ${(near.range / 1000).toFixed(2)} km`);
}

console.log('the geometry function itself');
{
  const pit = pitById('tranquillitatis_pit');
  check('the centre is the full depth', Math.abs(pitDepthAt(pit, 0, 0) + pit.depth) < 1e-9);
  check('outside the funnel is nothing', pitDepthAt(pit, 200, 0) === 0);
  check('the funnel is monotonic inwards', (() => {
    let prev = 0;
    for (let r = pit.funnelMax / 2; r > pit.innerMin / 2; r -= 0.5) {
      const d = pitDepthAt(pit, 0, r);
      if (d > prev + 1e-9) return false;
      prev = d;
    }
    return true;
  })());
  check('and it never comes back up inside the shaft',
    pitDepthAt(pit, 0, pit.innerMin / 2 - 5) === -pit.depth);
  check('distance is measured on the surface',
    Math.abs(distanceToPit(pit, pit.lat + 1000 / M_PER_DEG, pit.lon) - 1000) < 1);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
