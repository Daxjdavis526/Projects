import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const base = 'http://127.0.0.1:8765';
const F = ['E=mc^2','\\nabla\\cdot\\mathbf{E}=\\frac{\\rho}{\\varepsilon_0}','\\oint_{\\partial\\Sigma}\\mathbf{B}\\cdot d\\boldsymbol{\\ell}=\\mu_0 I','i\\hbar\\frac{\\partial}{\\partial t}\\Psi=\\hat H\\Psi','R_{\\mu\\nu}-\\tfrac12 R g_{\\mu\\nu}+\\Lambda g_{\\mu\\nu}=\\frac{8\\pi G}{c^4}T_{\\mu\\nu}','\\int_0^\\infty e^{-x^2}\\,dx=\\frac{\\sqrt\\pi}{2}','\\sum_{n=1}^{\\infty}\\frac{1}{n^2}=\\frac{\\pi^2}{6}','\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}^{-1}=\\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}','x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}','\\frac{d^2x}{dt^2}+2\\zeta\\omega_0\\frac{dx}{dt}+\\omega_0^2x=0'];
const formulas = Array.from({length: 500}, (_, i) => F[i % F.length] + ` + ${i}`);
const browser = await chromium.launch();
for (const [name, file, local] of [['mathjax-svg default-config','tex-svg.js',false],['mathjax-svg local-fonts','tex-svg.js',true],['mathjax-chtml local-fonts','tex-chtml.js',true]]) {
  const page = await browser.newPage(); const ext = new Set();
  page.on('request', r => { const u = new URL(r.url()); if (u.hostname !== '127.0.0.1') ext.add(u.origin + u.pathname.split('/').slice(0,4).join('/')); });
  await page.goto(base + '/bench/page.html');
  try {
    const r = await page.evaluate(async ([formulas, file, local]) => {
      window.MathJax = { startup: { typeset: false }, loader: { paths: Object.assign({ mathjax: '/dl/mathjax@4.1.3/package' }, local ? { fonts: '/bench/mjfonts' } : {}) } };
      const t0 = performance.now();
      await new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/dl/mathjax@4.1.3/package/' + file; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
      await MathJax.startup.promise; const t1 = performance.now();
      const out = document.getElementById('out'); const conv = file.includes('svg') ? MathJax.tex2svgPromise : MathJax.tex2chtmlPromise;
      for (const f of formulas) out.appendChild(await conv(f, { display: false }));
      if (MathJax.startup.document.updateDocument) MathJax.startup.document.updateDocument();
      const t2 = performance.now();
      const n = out.querySelectorAll('mjx-container').length; const aria = out.querySelector('mjx-container')?.getAttribute('aria-label') || out.querySelector('[aria-label]')?.getAttribute('aria-label');
      return { loadMs: Math.round(t1 - t0), render500Ms: Math.round(t2 - t1), containers: n, sampleAriaLabel: aria ? aria.slice(0, 80) : null, version: MathJax.version };
    }, [formulas, file, local]);
    console.log(name, JSON.stringify(r));
  } catch (e) { console.log(name, 'FAILED', String(e).split('\n')[0].slice(0, 200)); }
  console.log('  external requests attempted:', [...ext].slice(0, 6));
  await page.close();
}
// KaTeX accessibility output check
const page = await browser.newPage(); await page.goto(base + '/bench/page.html');
console.log('katex-output', await page.evaluate(async () => { const k = (await import('/dl/katex@0.19.0/package/dist/katex.mjs')).default; const h = k.renderToString('\\frac{a}{b}'); return { hasMathML: h.includes('<math'), hasAnnotation: h.includes('annotation encoding="application/x-tex"'), ariaHiddenHtml: h.includes('aria-hidden="true"'), len: h.length }; }));
await browser.close();
