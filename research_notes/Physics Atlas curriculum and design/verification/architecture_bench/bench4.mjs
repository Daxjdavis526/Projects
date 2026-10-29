import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const base = 'http://127.0.0.1:8765';
const F = ['E=mc^2','\\nabla\\cdot\\mathbf{E}=\\frac{\\rho}{\\varepsilon_0}','\\oint_{\\partial\\Sigma}\\mathbf{B}\\cdot d\\boldsymbol{\\ell}=\\mu_0 I','i\\hbar\\frac{\\partial}{\\partial t}\\Psi=\\hat H\\Psi','R_{\\mu\\nu}-\\tfrac12 R g_{\\mu\\nu}+\\Lambda g_{\\mu\\nu}=\\frac{8\\pi G}{c^4}T_{\\mu\\nu}','\\int_0^\\infty e^{-x^2}\\,dx=\\frac{\\sqrt\\pi}{2}','\\sum_{n=1}^{\\infty}\\frac{1}{n^2}=\\frac{\\pi^2}{6}','\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}^{-1}=\\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}','x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}','\\frac{d^2x}{dt^2}+2\\zeta\\omega_0\\frac{dx}{dt}+\\omega_0^2x=0'];
const formulas = Array.from({length: 500}, (_, i) => F[i % F.length] + ` + ${i}`);
const browser = await chromium.launch();
for (const [name, extra] of [['a11y defaults', {}], ['enableSpeech/Braille/Enrichment/Explorer=false', { options: { enableSpeech: false, enableBraille: false, enableEnrichment: false, enableExplorer: false } }]]) {
  const page = await browser.newPage(); await page.goto(base + '/bench/page.html');
  const r = await page.evaluate(async ([formulas, extra]) => {
    window.MathJax = Object.assign({ startup: { typeset: false }, loader: { paths: { mathjax: '/dl/mathjax@4.1.3/package', fonts: '/bench/mjfonts' } } }, extra);
    await new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/dl/mathjax@4.1.3/package/tex-chtml.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    await MathJax.startup.promise;
    const out = document.getElementById('out');
    for (const f of formulas.slice(0, 10)) out.appendChild(await MathJax.tex2chtmlPromise(f));   // warm-up: dynamic font ranges load here
    const t0 = performance.now();
    for (const f of formulas.slice(10)) out.appendChild(MathJax.tex2chtml(f));                   // synchronous conversion
    const t1 = performance.now();
    MathJax.startup.document.clear(); MathJax.startup.document.updateDocument();
    const t2 = performance.now();
    const o = MathJax.startup.document.options;
    return { sync490Ms: Math.round(t1 - t0), perFormulaMs: +((t1 - t0) / 490).toFixed(2), cssUpdateMs: Math.round(t2 - t1), opts: { enableSpeech: o.enableSpeech, enableBraille: o.enableBraille, enableEnrichment: o.enableEnrichment, enableExplorer: o.enableExplorer } };
  }, [formulas, extra]);
  console.log(name, JSON.stringify(r)); await page.close();
}
await browser.close();
