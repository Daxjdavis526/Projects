/* ============================================================================
   layers/deepsky.js — nebulae · star clusters · nearby galaxies ·
                       black holes & quasars · exoplanet systems
   ----------------------------------------------------------------------------
   Everything here sits at its real published position and distance
   (src/data/deepsky.json, fact-checked). Appearances are procedural
   impostors: layered cloud sprites for nebulae, painted planes for
   galaxies, point swarms for clusters, an accretion micro-scene for
   black holes you approach, and schematic orbit rings + planet dots for
   famous exoplanet systems (planet positions use real periods; orbital
   phases are arbitrary).
   ========================================================================== */
import * as THREE from 'three';
import { AU, LY, PC, MPC, clamp, smoothstep, bandFade, mulberry32, gauss,
         radecToXYZ } from '../scale.js';
import { starMaterial, updateStarUniforms, glowTexture, kelvinToRGB,
         placeBody } from '../render.js';
import { starRadius } from './stars.js';
import { specLum } from './starphys.js';

const L_SUN = 6e26;

// ------------------------------------------------------ nebula textures
function puffTexture(seed, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  const d = img.data;
  const P = 128, grid = new Float32Array(P * P);
  const rnd = mulberry32(seed);
  for (let i = 0; i < P * P; i++) grid[i] = rnd();
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
    const q = (a, b) => grid[((b % P + P) % P) * P + ((a % P + P) % P)];
    return (q(xi, yi) * (1 - sx) + q(xi + 1, yi) * sx) * (1 - sy)
         + (q(xi, yi + 1) * (1 - sx) + q(xi + 1, yi + 1) * sx) * sy;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const dx = u - 0.5, dy = v - 0.5;
    const r = Math.hypot(dx, dy) * 2;
    let n = 0, a = 0.55, f = 3;
    for (let o = 0; o < 5; o++) { n += a * noise(u * f * P / 16, v * f * P / 16); f *= 2.1; a *= 0.55; }
    let val = Math.pow(Math.max(0, n - 0.18), 1.5) * 1.6;
    val *= Math.max(0, 1 - r * r * (0.9 + 0.4 * noise(u * 8, v * 8)));
    const i = (y * size + x) * 4;
    const b = Math.min(255, val * 255);
    d[i] = d[i+1] = d[i+2] = b; d[i+3] = b;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const NEB_TINTS = {
  emission:   [[1.0, 0.36, 0.30], [1.0, 0.55, 0.62], [0.55, 0.55, 1.0]],
  starforming:[[1.0, 0.40, 0.34], [0.95, 0.62, 0.72], [0.5, 0.6, 1.0]],
  reflection: [[0.42, 0.60, 1.0], [0.62, 0.76, 1.0], [0.8, 0.88, 1.0]],
  planetary:  [[0.30, 0.95, 0.85], [0.5, 0.85, 1.0], [0.9, 0.5, 0.7]],
  snr:        [[0.9, 0.5, 0.9], [0.4, 0.8, 1.0], [1.0, 0.6, 0.4]],
  dark:       [[0.06, 0.045, 0.04], [0.05, 0.04, 0.045], [0.07, 0.05, 0.04]],
};

// ---------------------------------------------------- galaxy impostors
function galaxyImpostorTexture(kind, seed, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  const d = img.data;
  const rnd = mulberry32(seed);
  const pitch = 0.20 + rnd() * 0.1;
  const arms = 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x + 0.5) / size * 2 - 1, v = (y + 0.5) / size * 2 - 1;
    const r = Math.hypot(u, v);
    const i = (y * size + x) * 4;
    if (r > 1) { d[i+3] = 0; continue; }
    let L = 0, heat = 0;
    if (kind === 'elliptical') {
      L = 1.5 * Math.exp(-Math.pow(r * 2.6, 0.8));
      heat = 1;
    } else {
      const th = Math.atan2(v, u);
      const thArm = Math.log(Math.max(r, 0.02) / 0.06) / pitch;
      let best = 1e9;
      for (let k = 0; k < arms; k++) {
        let dd = (th - thArm - k * Math.PI * 2 / arms) % (Math.PI * 2);
        if (dd > Math.PI) dd -= Math.PI * 2;
        if (dd < -Math.PI) dd += Math.PI * 2;
        best = Math.min(best, Math.abs(dd) * Math.max(r, 0.05));
      }
      const w = Math.exp(-best * best * 90);
      const disk = Math.exp(-r * 3.2) * (0.30 + 0.85 * w);
      const bulge = 1.4 * Math.exp(-Math.pow(r * 7, 1.3));
      L = disk + bulge;
      heat = Math.min(1, bulge * 1.2 + 0.35);
    }
    L *= 0.9 + 0.2 * rnd();
    const warm = [1.0, 0.87, 0.65], cool = [0.62, 0.72, 1.0];
    d[i]   = Math.min(255, 255 * (warm[0] * heat + cool[0] * (1 - heat)) * L);
    d[i+1] = Math.min(255, 255 * (warm[1] * heat + cool[1] * (1 - heat)) * L);
    d[i+2] = Math.min(255, 255 * (warm[2] * heat + cool[2] * (1 - heat)) * L);
    d[i+3] = Math.min(255, 255 * Math.min(1, L));
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export async function buildDeepSkyLayer(scene, registry, ctx0) {
  let data;
  try { data = await (await fetch('src/data/deepsky.json')).json(); }
  catch { return null; }
  const group = new THREE.Group();
  scene.add(group);
  const rnd = mulberry32(20260826);
  const placed = [];                    // {mesh, pos, sizeM, band:[lo,hi], baseOp}

  // ------------------------------------------------------------ nebulae
  const puffs = [puffTexture(11), puffTexture(22), puffTexture(33)];
  for (const nb of data.nebulae ?? []) {
    const p = radecToXYZ(nb.ra, nb.dec, nb.distLy * LY);
    const type = nb.extra?.type ?? 'emission';
    const tints = NEB_TINTS[type] ?? NEB_TINTS.emission;
    const dark = type === 'dark';
    const sub = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: puffs[(k + nb.name.length) % 3],
        color: new THREE.Color(...tints[k % tints.length]),
        transparent: true, depthWrite: false,
        blending: dark ? THREE.NormalBlending : THREE.AdditiveBlending,
        opacity: dark ? 0.65 : 0.72,
        rotation: rnd() * Math.PI * 2,
      }));
      sp.userData.rscale = 0.55 + 0.5 * rnd();
      sp.userData.off = [gauss(rnd) * 0.16, gauss(rnd) * 0.16, gauss(rnd) * 0.16];
      sub.add(sp);
    }
    group.add(sub);
    placed.push({ kind: 'nebula', sub, pos: p, sizeM: nb.sizeLy * LY,
                  band: [13.6, 20.6] });
    registry.push({
      id: 'neb:' + nb.name, name: nb.name, cls: (nb.extra?.type ?? 'nebula') + ' nebula',
      blurb: nb.blurb, radius: nb.sizeLy * LY / 2, distLy: nb.distLy,
      color: new THREE.Color(...(tints[0].map(v => Math.min(1, v + 0.2)))),
      lum: 0, pos: () => p,
      labelBand: [14.6, 19.6], focusD: nb.sizeLy * LY * 2.4,
      kind: 'nebula', priority: 6,
    });
  }

  // ------------------------------------------------------ star clusters
  {
    const items = data.clusters ?? [];
    let total = 0;
    const counts = items.map(it => {
      const n = it.extra?.type === 'globular' ? 520 : 110;
      total += n; return n;
    });
    const pos = new Float32Array(total * 3), col = new Float32Array(total * 3), lum = new Float32Array(total);
    let i = 0;
    items.forEach((it, idx) => {
      const p = radecToXYZ(it.ra, it.dec, it.distLy * LY);
      const R = it.sizeLy * LY / 2;
      const glob = it.extra?.type === 'globular';
      for (let k = 0; k < counts[idx]; k++) {
        let r = glob ? R * Math.pow(rnd(), 2.2) : R * (0.2 + 0.8 * Math.sqrt(rnd()));
        const u2 = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s2 = Math.sqrt(1 - u2 * u2);
        pos[i*3]   = (p[0] + r * s2 * Math.cos(th)) / LY;
        pos[i*3+1] = (p[1] + r * u2) / LY;
        pos[i*3+2] = (p[2] + r * s2 * Math.sin(th)) / LY;
        const K = glob ? 4200 + rnd() * 1800 : 6000 + rnd() * rnd() * 14000;
        const [cr, cg, cb] = kelvinToRGB(K);
        col[i*3] = cr; col[i*3+1] = cg; col[i*3+2] = cb;
        lum[i] = Math.log2((glob ? 40 : 25) * (0.3 + rnd() * 2) * L_SUN);
        i++;
      }
      registry.push({
        id: 'cl2:' + it.name, name: it.name, cls: (it.extra?.type ?? 'star') + ' cluster',
        blurb: it.blurb, radius: R, distLy: it.distLy,
        color: new THREE.Color(glob ? 0xffe0b8 : 0xbfd4ff),
        lum: 0, pos: () => p,
        labelBand: [14.2, 19.4], focusD: it.sizeLy * LY * 3,
        kind: 'cluster', priority: 6,
      });
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aLum', new THREE.BufferAttribute(lum, 1));
    const mat = starMaterial({ fluxScale: 5.5e6, maxPx: 7 });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false; pts.renderOrder = 2;
    group.add(pts);
    group.userData.clusterPts = { pts, mat };
  }

  // ------------------------------------------------- nearby galaxies
  const impostors = {
    spiral: [galaxyImpostorTexture('spiral', 1), galaxyImpostorTexture('spiral', 2),
             galaxyImpostorTexture('spiral', 3)],
    elliptical: [galaxyImpostorTexture('elliptical', 4)],
  };
  for (const gx of data.galaxies ?? []) {
    const p = radecToXYZ(gx.ra, gx.dec, gx.distLy * LY);
    const type = (gx.extra?.type ?? 'spiral').toLowerCase();
    const ell = type.includes('elliptical') || type.includes('lenticular');
    const tex = ell ? impostors.elliptical[0]
      : impostors.spiral[gx.name.length % 3];
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false,
        side: THREE.DoubleSide, opacity: 0.9 }));
    // representative orientation; strongly inclined if flagged edge-on
    const tiltX = gx.extra?.edgeOn ? Math.PI / 2 - 0.12 : rnd() * 1.1;
    mesh.rotation.set(tiltX, rnd() * Math.PI, rnd() * Math.PI);
    group.add(mesh);
    placed.push({ kind: 'galaxy', sub: mesh, pos: p, sizeM: gx.sizeLy * LY,
                  band: [20.4, 24.6] });
    registry.push({
      id: 'gx:' + gx.name, name: gx.name, cls: gx.extra?.type ?? 'galaxy',
      blurb: gx.blurb, radius: gx.sizeLy * LY / 2, distLy: gx.distLy,
      color: new THREE.Color(0xe8dcc0), lum: 0, pos: () => p,
      labelBand: [21.0, 24.0], focusD: gx.sizeLy * LY * 2.2,
      kind: 'galaxy', priority: 6,
    });
  }

  // -------------------------------------------- black holes & quasars
  const bhObjs = [];
  for (const bh of data.blackholes ?? []) {
    const p = radecToXYZ(bh.ra, bh.dec, bh.distLy * LY);
    const quasar = bh.distLy > 5e8;
    const mass = bh.extra?.massMsun ?? 10;
    const obj = {
      id: 'bh:' + bh.name, name: bh.name,
      cls: quasar ? 'quasar' : 'black hole · ' + (mass >= 1e6
        ? (mass / 1e6).toPrecision(2) + 'M M☉' : mass.toPrecision(2) + ' M☉'),
      blurb: bh.blurb, radius: mass * 2953, distLy: bh.distLy, massMsun: mass,
      color: new THREE.Color(quasar ? 0xaad4ff : 0x9fb8ff),
      lum: quasar ? 3e39 : 0.5 * L_SUN,
      pos: () => p,
      labelBand: quasar ? [23.0, 26.6] : [14.0, 19.0],
      focusD: quasar ? 3e24 : Math.max(mass * 2953 * 4e4, 5e9),
      kind: 'blackhole', priority: 6,
    };
    registry.push(obj);
    bhObjs.push(obj);
  }
  // accretion micro-scene for the one you're closest to
  const bhScene = new THREE.Group();
  {
    const ringTex = (() => {
      const c = document.createElement('canvas'); c.width = 128; c.height = 8;
      const g = c.getContext('2d');
      const grd = g.createLinearGradient(0, 0, 128, 0);
      grd.addColorStop(0, 'rgba(255,255,255,0)');
      grd.addColorStop(0.18, 'rgba(255,240,220,1)');
      grd.addColorStop(0.5, 'rgba(255,150,60,0.8)');
      grd.addColorStop(1, 'rgba(120,30,10,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 128, 8);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const rg = new THREE.RingGeometry(1.6, 6, 96, 1);
    const uv = rg.attributes.uv, posA = rg.attributes.position;
    for (let i = 0; i < uv.count; i++) {
      const x = posA.getX(i), y = posA.getY(i);
      uv.setXY(i, (Math.hypot(x, y) - 1.6) / 4.4, 0.5);
    }
    const disk = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({
      map: ringTex, transparent: true, blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide, depthWrite: false }));
    disk.rotation.x = Math.PI / 2 - 0.35;
    const shadow = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 }));
    const photonRing = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), color: 0xfff0dd, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.8 }));
    photonRing.scale.setScalar(2.6);
    bhScene.add(disk, shadow, photonRing);
    bhScene.visible = false;
    group.add(bhScene);
  }

  // ------------------------------------------------ exoplanet systems
  const systems = [];
  for (const ex of data.exoplanets ?? []) {
    const p = radecToXYZ(ex.ra, ex.dec, ex.distLy * LY);
    // host: reuse an existing star if we have it, else add one
    let host = registry.find(o => o.kind === 'star' &&
      (o.name === ex.name || (() => { const q = o.pos();
        return Math.hypot(q[0]-p[0], q[1]-p[1], q[2]-p[2]) < 1.5 * LY; })()));
    if (!host) {
      const spec = ex.extra?.spectral ?? 'G2V';
      const Lsun = specLum(spec);
      const K = { O: 30000, B: 15000, A: 8500, F: 6800, G: 5700, K: 4700, M: 3000 }[spec[0]] ?? 5500;
      host = {
        id: 'star:' + ex.name, name: ex.name, cls: spec + ' · exoplanet host',
        blurb: ex.blurb, radius: starRadius(Lsun, K), distLy: ex.distLy,
        tempK: K, lumSun: Lsun,
        color: new THREE.Color(...kelvinToRGB(K)), lum: Lsun * L_SUN,
        pos: () => p, labelBand: [12.6, 17.5],
        focusD: 3e10, kind: 'star', priority: 5,
      };
      registry.push(host);
    }
    host.blurb = ex.blurb ?? host.blurb;
    host.cls += host.cls.includes('host') ? '' : ' · planetary system';
    const planets = (ex.extra?.planets ?? []).slice(0, 7).map((pl, i) => {
      const aM = pl.a_au * AU;
      const phase = (i * 0.61803 + 0.15) % 1;
      const hp = host.pos();
      const pobj = {
        id: 'exo:' + pl.name, name: pl.name,
        cls: 'exoplanet · ' + (pl.radius_re ? pl.radius_re.toPrecision(2) + ' R⊕' : 'planet'),
        blurb: (pl.note ? pl.note + ' ' : '') +
          `Orbits ${ex.name} every ${pl.period_days < 1000 ? pl.period_days.toPrecision(3) + ' days' : (pl.period_days / 365.25).toPrecision(3) + ' years'} at ${pl.a_au.toPrecision(2)} AU. Position along its real orbit is schematic.`,
        radius: (pl.radius_re ?? 1.5) * 6.371e6, aM, period: pl.period_days,
        color: new THREE.Color(0x9fd8c8),
        lum: 5e18 * (pl.radius_re ?? 1.5) ** 2,
        pos: (c) => {
          const t = (c ?? window.__ctx).T * 36525;
          const ang = (t / pl.period_days + phase) * Math.PI * 2;
          return [hp[0] + aM * Math.cos(ang), hp[1], hp[2] - aM * Math.sin(ang)];
        },
        labelBand: [Math.log10(aM * 0.02), Math.log10(aM * 30)],
        focusD: Math.max((pl.radius_re ?? 1.5) * 6.371e6 * 30, aM * 0.02),
        kind: 'exoplanet', priority: 5,
      };
      registry.push(pobj);
      return pobj;
    });
    // orbit rings
    const ringGroup = new THREE.Group();
    for (const pl of ex.extra?.planets ?? []) {
      const pts2 = [];
      for (let k = 0; k <= 96; k++) {
        const a2 = k / 96 * Math.PI * 2;
        pts2.push(new THREE.Vector3(Math.cos(a2) * pl.a_au, 0, -Math.sin(a2) * pl.a_au));
      }
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2),
        new THREE.LineBasicMaterial({ color: 0x6a90b8, transparent: true,
          opacity: 0.35, depthWrite: false }));
      ringGroup.add(line);
    }
    ringGroup.visible = false;
    group.add(ringGroup);
    systems.push({ host, planets, ringGroup, aMaxM: Math.max(1, ...((ex.extra?.planets ?? []).map(pl => pl.a_au))) * AU });
  }

  // ------------------------------------------------------------ update
  const V = new THREE.Vector3();
  function update(ctx) {
    group.visible = ctx.logS < 26.8;
    if (!group.visible) return;
    const S = ctx.S, fc = ctx.focus;

    // impostors & nebulae
    for (const it of placed) {
      const f = bandFade(ctx.logS, it.band[0], it.band[1], 0.7);
      const sub = it.sub;
      // distance-based reveal: things should also appear when you're near them
      const cp = ctx.camPos;
      const dCam = Math.hypot(it.pos[0]-cp[0], it.pos[1]-cp[1], it.pos[2]-cp[2]);
      const near = clamp(it.sizeM * 2e3 / dCam, 0, 1);
      const vis = Math.max(f, near > 0.02 ? Math.min(near, 1) : 0);
      sub.visible = vis > 0.015;
      if (!sub.visible) continue;
      const rx = (it.pos[0]-fc[0])/S, ry = (it.pos[1]-fc[1])/S, rz = (it.pos[2]-fc[2])/S;
      const L = Math.hypot(rx, ry, rz);
      const k = L > 1e4 ? (1e4 * (1 + Math.log10(L / 1e4))) / L : 1;
      sub.position.set(rx*k, ry*k, rz*k);
      const sc = it.sizeM / S * k;
      if (it.kind === 'nebula') {
        sub.children.forEach((sp, i2) => {
          const o2 = sp.userData.off;
          sp.position.set(o2[0]*sc, o2[1]*sc, o2[2]*sc);
          sp.scale.setScalar(sc * sp.userData.rscale);
          sp.material.opacity = (sp.material.blending === THREE.NormalBlending ? 0.65 : 0.72) * vis;
        });
      } else {
        sub.scale.setScalar(sc / 2);
        sub.material.opacity = 0.9 * vis;
      }
    }

    // cluster points
    const cl = group.userData.clusterPts;
    const cf = bandFade(ctx.logS, 12.0, 19.8, 1.0);
    cl.pts.visible = cf > 0.01;
    if (cl.pts.visible) {
      cl.mat.uniforms.uOpacity.value = cf;
      updateStarUniforms(cl.mat, ctx, [0, 0, 0], null, LY);
    }

    // black-hole close-up
    let bBest = null, bRatio = Infinity;
    const cp = ctx.camPos;
    for (const o of bhObjs) {
      if (o.distLy > 5e8) continue;                 // quasars stay points
      const q = o.pos();
      const d = Math.hypot(q[0]-cp[0], q[1]-cp[1], q[2]-cp[2]);
      const vscale = o.focusD / 3;                  // visual scene size
      if (d / vscale < bRatio) { bRatio = d / vscale; bBest = o; }
    }
    bhScene.visible = bBest && bRatio < 60;
    if (bhScene.visible) {
      placeBody(bhScene, bBest.pos(), bBest.focusD / 8, ctx);
      bhScene.rotation.y += ctx.dt * 0.05;
    }

    // exoplanet systems: rings + host proximity
    for (const sys of systems) {
      const hp = sys.host.pos(ctx);
      const show = ctx.S < sys.aMaxM * 900;
      sys.ringGroup.visible = show;
      if (show) {
        const rx = (hp[0]-fc[0])/S, ry = (hp[1]-fc[1])/S, rz = (hp[2]-fc[2])/S;
        sys.ringGroup.position.set(rx, ry, rz);
        sys.ringGroup.scale.setScalar(AU / S);
        const op = 0.35 * smoothstep(Math.log10(sys.aMaxM * 900), Math.log10(sys.aMaxM * 40), ctx.logS);
        sys.ringGroup.children.forEach(l => l.material.opacity = op);
      }
    }
  }
  return { group, update };
}
