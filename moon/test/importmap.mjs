/* A node resolver hook standing in for the browser's import map.

   `index.html` declares an import map so that source files can say
   `import * as THREE from 'three'` and the browser resolves it to the vendored
   module. Node has no import map, so any file using a bare specifier is
   unimportable in a test — which is why every headless suite here is pure
   physics and imports nothing from `render/` or `models/`.

   That is a good habit and it stays. But the rover's drawn attitude is a
   renderer bug by nature, so `vehicle.test.mjs` has to reach a file that
   imports three.js. This hook is the smallest way through: register it, and
   node resolves the same names the import map does.

   It resolves nothing else. Anything not in the map falls through to node's
   own resolution, so a typo stays an error rather than becoming a silent
   miss. Keep the table in step with the map in `index.html`. */

const MAP = {
  three: '../vendor/three/three.module.min.js',
  'three/addons/': '../vendor/three/jsm/',
};

export function resolve(specifier, context, nextResolve) {
  if (Object.prototype.hasOwnProperty.call(MAP, specifier)) {
    return { url: new URL(MAP[specifier], import.meta.url).href, shortCircuit: true };
  }
  for (const prefix of Object.keys(MAP)) {
    if (prefix.endsWith('/') && specifier.startsWith(prefix)) {
      return {
        url: new URL(MAP[prefix] + specifier.slice(prefix.length), import.meta.url).href,
        shortCircuit: true,
      };
    }
  }
  return nextResolve(specifier, context);
}
