import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const base = 'http://127.0.0.1:8765';
const F = ['E=mc^2','\\nabla\\cdot\\mathbf{E}=\\frac{\\rho}{\\varepsilon_0}','\\oint_{\\partial\\Sigma}\\mathbf{B}\\cdot d\\boldsymbol{\\ell}=\\mu_0 I','i\\hbar\\frac{\\partial}{\\partial t}\\Psi=\\hat H\\Psi','R_{\\mu\\nu}-\\tfrac12 R g_{\\mu\\nu}+\\Lambda g_{\\mu\\nu}=\\frac{8\\pi G}{c^4}T_{\\mu\\nu}','\\int_0^\\infty e^{-x^2}\\,dx=\\frac{\\sqrt\\pi}{2}','\\sum_{n=1}^{\\infty}\\frac{1}{n^2}=\\frac{\\pi^2}{6}','\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}^{-1}=\\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}','x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}','\\frac{d^2x}{dt^2}+2\\zeta\\omega_0\\frac{dx}{dt}+\\omega_0^2x=0'];
const formulas = Array.from({length: 500}, (_, i) => F[i % F.length] + ` + ${i}`);
const browser = await chromium.launch();
const variants = [
  ['chtml whole-page typeset, a11y defaults', {}],
  ['chtml whole-page typeset, speech/braille/enrichment off', { options: { enableSpeech: false, enableBraille: false, enableEnrichment: false, enableExplorer: false } }],
];
for (const [name, extra] of variants) {
  const page = await browser.newPage(); const errs = []; page.on('console', m => { if (m.type() === 'error' || /Invalid|MathJax/.test(m.text())) errs.push(m.text().slice(0, 160)); });
  await page.goto(base + '/bench/page.html');
  try {
    const r = await page.evaluate(async ([formulas, extra]) => {
      window.MathJax = Object.assign({ startup: { typeset: false }, loader: { paths: { mathjax: '/dl/mathjax@4.1.3/package', fonts: '/bench/mjfonts' } } }, extra);
      const out = document.getElementById('out'); out.innerHTML = formulas.map(f => `<p>\\(${f}\\)</p>`).join('');
      const t0 = performance.now();
      await new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/dl/mathjax@4.1.3/package/tex-chtml.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
      await MathJax.startup.promise; const t1 = performance.now();
      await MathJax.typesetPromise([out]); const t2 = performance.now();
      const c = out.querySelector('mjx-container');
      return { loadMs: Math.round(t1 - t0), typeset500Ms: Math.round(t2 - t1), containers: out.querySelectorAll('mjx-container').length, aria: c?.getAttribute('aria-label')?.slice(0, 60) ?? null, hasMathMLInDom: !!out.querySelector('math') };
    }, [formulas, extra]);
    console.log(name, JSON.stringify(r));
  } catch (e) { console.log(name, 'FAILED', String(e).split('\n')[0].slice(0, 220)); }
  if (errs.length) console.log('  console:', errs.slice(0, 3));
  await page.close();
}
await browser.close();
