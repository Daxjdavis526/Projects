// Puts the Python runtime (Pyodide 314.0.7: CPython 3.14 + NumPy, SciPy,
// SymPy, mpmath) into public/pyodide so it ships inside the app and works
// offline. The files are copied from the Physics Atlas, which vendors the same
// release with every wheel's SHA-256 pinned; they are not stored twice in git.
//   node scripts/fetch-pyodide.mjs
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', '..', 'atlas', 'vendor', 'pyodide-314.0.7');
const dst = join(here, '..', 'public', 'pyodide');
if (!existsSync(src)) { console.error(`Pyodide not found at ${src}`); process.exit(1); }
mkdirSync(dst, { recursive: true });
// matplotlib and its helpers are not needed by MathVerse (it draws its own plots)
const skip = /^(matplotlib|contourpy|cycler|fonttools|kiwisolver|pillow|pyparsing|python_dateutil|pytz|six|packaging)-/;
let n = 0;
for (const f of readdirSync(src)) {
  if (skip.test(f)) continue;
  cpSync(join(src, f), join(dst, f), { recursive: true });
  n++;
}
console.log(`public/pyodide: ${n} entries copied from ${src}`);
