import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const base = 'http://127.0.0.1:8765';
const F = ['E=mc^2','\\nabla\\cdot\\mathbf{E}=\\frac{\\rho}{\\varepsilon_0}','\\oint_{\\partial\\Sigma}\\mathbf{B}\\cdot d\\boldsymbol{\\ell}=\\mu_0 I','i\\hbar\\frac{\\partial}{\\partial t}\\Psi=\\hat H\\Psi','R_{\\mu\\nu}-\\tfrac12 R g_{\\mu\\nu}+\\Lambda g_{\\mu\\nu}=\\frac{8\\pi G}{c^4}T_{\\mu\\nu}','\\int_0^\\infty e^{-x^2}\\,dx=\\frac{\\sqrt\\pi}{2}','\\sum_{n=1}^{\\infty}\\frac{1}{n^2}=\\frac{\\pi^2}{6}','\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}^{-1}=\\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}','x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}','\\frac{d^2x}{dt^2}+2\\zeta\\omega_0\\frac{dx}{dt}+\\omega_0^2x=0'];
const formulas = Array.from({length: 500}, (_, i) => F[i % F.length] + ` + ${i}`);
const browser = await chromium.launch();
async function run(name, fn, arg) {
  const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0,160)));
  await page.goto(base + '/bench/page.html');
  try { const r = await page.evaluate(fn, arg); console.log(name, JSON.stringify(r)); }
  catch (e) { console.log(name, 'FAILED', String(e).slice(0, 300)); }
  if (errs.length) console.log('  pageerrors:', errs.slice(0,3));
  await page.close();
}
await run('pyodide', async () => {
  const t0 = performance.now();
  const { loadPyodide } = await import('/dl/pyodide@314.0.7/package/pyodide.mjs');
  const py = await loadPyodide({ indexURL: '/dl/pyodide@314.0.7/package/' });
  const t1 = performance.now();
  const r = py.runPython('sum(i*i for i in range(10**6))');
  const t2 = performance.now();
  return { loadMs: Math.round(t1 - t0), loopMs: Math.round(t2 - t1), r: String(r), version: py.version, coi: self.crossOriginIsolated };
});
await run('micropython', async () => {
  const t0 = performance.now();
  const { loadMicroPython } = await import('/dl/@micropython_micropython-webassembly-pyscript@1.29.0-6/package/micropython.mjs');
  const mp = await loadMicroPython();
  const t1 = performance.now();
  const r = mp.runPython('sum(i*i for i in range(10**6))');
  const t2 = performance.now();
  return { loadMs: Math.round(t1 - t0), loopMs: Math.round(t2 - t1), r: String(r) };
});
await run('katex', async (formulas) => {
  const t0 = performance.now();
  const katex = (await import('/dl/katex@0.19.0/package/dist/katex.mjs')).default;
  const t1 = performance.now();
  const out = document.getElementById('out');
  for (const f of formulas) { const el = document.createElement('span'); out.appendChild(el); katex.render(f, el, { throwOnError: true }); }
  const t2 = performance.now();
  return { importMs: Math.round(t1 - t0), render500Ms: Math.round(t2 - t1), version: katex.version };
}, formulas);
await run('mathjax-svg', async (formulas) => {
  window.MathJax = { startup: { typeset: false }, loader: { paths: { mathjax: '/dl/mathjax@4.1.3/package' } } };
  const t0 = performance.now();
  await new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/dl/mathjax@4.1.3/package/tex-svg.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  await MathJax.startup.promise;
  const t1 = performance.now();
  const out = document.getElementById('out');
  for (const f of formulas) { out.appendChild(await MathJax.tex2svgPromise(f, { display: false })); }
  const t2 = performance.now();
  return { loadMs: Math.round(t1 - t0), render500Ms: Math.round(t2 - t1), version: MathJax.version };
}, formulas);
await browser.close();
