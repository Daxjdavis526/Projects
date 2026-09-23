/* The dust, and the white sky it used to put over everything.

   The bug this file exists for was two bugs, and between them they made the
   dust simultaneously invisible where it should have been and enormous where
   it should not:

   - `size` was documented as "pixels at one metre" and every caller passed 10
     to 22 accordingly, while the shader divides by depth and multiplies by a
     pixels-per-metre scale of about 1150 -- i.e. it reads the number as
     METRES. A footfall grain was an eighteen-metre sphere: about a thousand
     pixels across at twenty paces, and with a 1.0 m floor on the depth
     divisor, some twenty thousand for anything nearer than a metre. Since
     footfalls are emitted at the boots, 1.6 m below the eye, that was most of
     them.
   - render/stage.js asks for a logarithmic depth buffer, and three.js then
     writes gl_FragDepth only in shaders that include the `logdepthbuf`
     chunks. This material did not. So it wrote hardware z/w while the terrain
     wrote log depth, and under GL_LESS every grain failed the depth test
     anywhere the ground had drawn -- passing ONLY against the cleared sky.

   Which is why the report was "the sky has weird glitches where it's white
   when I look around" rather than "the dust is too big": the only dust that
   could be seen at all was the dust over the sky.

   Two of the checks below exist because of mistakes made writing the fix, not
   the original bug. A backtick inside the shader source closes the template
   literal that holds it, and a GLSL comment mentioning `aSize` in backticks
   broke the whole module twice in a row. Importing it here catches that class
   outright, which is better than any scan. */
import { register } from 'node:module';
register('./importmap.mjs', import.meta.url);

import { readFileSync } from 'node:fs';

const THREE = await import('../vendor/three/three.module.min.js');
const dustMod = await import('../src/render/dust.js');
const { DustField } = dustMod;

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const src = readFileSync(new URL('../src/render/dust.js', import.meta.url), 'utf8');
const shaderBlock = src.slice(src.indexOf('const VERT ='), src.indexOf('export class DustField'));

console.log('the module is syntactically whole');
{
  /* It imported, or nothing below this line would be running. Stated as a
     check anyway, because the thing it guards against is invisible: a stray
     backtick in a shader comment does not look like an error, it looks like
     prose. */
  check('dust.js parses and exports DustField', typeof DustField === 'function');
  check('and the shader sources carry exactly their four delimiters',
    (shaderBlock.match(/`/g) || []).length === 4,
    `${(shaderBlock.match(/`/g) || []).length} backticks — a fifth would end a template early`);
}

console.log('the shaders ask for the depth encoding the renderer uses');
{
  for (const chunk of ['logdepthbuf_pars_vertex', 'logdepthbuf_vertex',
                       'logdepthbuf_pars_fragment', 'logdepthbuf_fragment']) {
    check(`the ${chunk} chunk is included`, shaderBlock.includes(`#include <${chunk}>`));
  }
  /* logdepthbuf_vertex calls isPerspectiveMatrix, which lives in `common`, and
     without it the shader compiles to nothing and the field silently
     disappears. That failure only shows up in a GL context, so it is checked
     here textually. */
  check('and the common chunk, which declares isPerspectiveMatrix',
    shaderBlock.includes('#include <common>'));
  check('depthTest is left on, so grains are occluded by the ground properly',
    !/depthTest\s*:\s*false/.test(src));
}

console.log('a grain is a few centimetres, not a few metres');
{
  check('the point size is clamped at both ends',
    /gl_PointSize\s*=\s*clamp\(/.test(shaderBlock),
    'an unbounded size is what filled the screen');
  const upper = shaderBlock.match(/gl_PointSize[^;]*?,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/);
  check('with a finite ceiling in pixels', !!upper && parseFloat(upper[1]) <= 128,
    upper ? upper[1] + ' px' : 'no ceiling found');
  const floor = shaderBlock.match(/max\(\s*([\d.]+)\s*,\s*-mv\.z\s*\)/);
  check('and a depth floor well under a metre',
    !!floor && parseFloat(floor[1]) < 0.5,
    floor ? floor[1] + ' m' : 'no floor found');

  /* Every caller, in metres. A regression here is a number like 13 creeping
     back in, which would look entirely reasonable and be a thousand times too
     large. */
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const sizes = [...main.matchAll(/dust\.burst\(\{[\s\S]{0,400}?\}\)/g)]
    .map(m => m[0].match(/size:\s*([\d.]+)/))
    .filter(Boolean).map(m => parseFloat(m[1]));
  check('every dust.burst call site was found', sizes.length >= 3, sizes.length + ' of them');
  check('and every one of them is a size in metres',
    sizes.every(v => v > 0 && v < 0.2), sizes.join(', ') + ' m');
}

console.log('and it is still ballistic, which is the point of the file');
{
  const stage = { world: new THREE.Group() };
  const field = new DustField(stage, { max: 200 });
  /* Straight up from a flat surface, in a frame where up is +Y. */
  const up = { x: 0, y: 1, z: 0 };
  field.burst({ at: { x: 0, y: 0, z: 0 }, up, count: 50, speed: 2.0, angle: 90,
                spread: 0, size: 0.02 });
  check('a burst puts grains in the air', field.count === 50, field.count + ' grains');

  let peak = 0, t = 0;
  while (field.count > 0 && t < 20) {
    field.update(1 / 120, null);
    t += 1 / 120;
    for (let i = 0; i < field.count; i++) peak = Math.max(peak, field.ground[i]);
  }
  /* Thrown at 2 m/s in 1.62 m/s^2 reaches v^2/2g = 1.23 m and comes back down
     in 2v/g = 2.47 s. No air to change either number. */
  check('they rise to the height lunar gravity says',
    Math.abs(peak - 1.23) < 0.08, peak.toFixed(2) + ' m against 1.23 m');
  check('and they all come down again, on their own',
    field.count === 0 && Math.abs(t - 2.47) < 0.15,
    `${t.toFixed(2)} s against 2.47 s, ${field.count} left aloft`);

  /* Lighting. The number that matters is the comparison: a grain must not be
     brighter than sunlit mare, because that is the value the exposure model is
     built around and anything well over it clips to white. */
  const mare = 0.10;
  field.setLight({ mu0: 1, albedo: mare });
  const lit = field.material.uniforms.uColor.value.r;
  field.setLight({ mu0: 0, albedo: mare });
  const dark = field.material.uniforms.uColor.value.r;
  check('a grain in full sun is about as bright as the ground it came off',
    lit <= mare * 1.05 && lit > mare * 0.5, lit.toFixed(3) + ' against ' + mare.toFixed(2));
  check('and one thrown into shadow goes dim rather than black',
    dark > 0 && dark < lit * 0.35, dark.toFixed(3));
  check('neither is anywhere near the 0.62 that used to clip to white',
    lit < 0.2 && dark < 0.2, `${lit.toFixed(3)} / ${dark.toFixed(3)}`);
}

console.log(failures ? `\ndust: ${failures} FAILED` : '\ndust: all checks passed');
process.exit(failures ? 1 : 0);
