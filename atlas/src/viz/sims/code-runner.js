// A runnable Python snippet as a lesson's interactive visual: an editor
// holding the lesson's code, Run and Reset buttons, the printed output, and
// any figures (atlas.plot or Matplotlib). Python is the real interpreter in
// the shared worker (src/lab/python.js), started on first Run.
//
//   { type: 'code-runner', params: { code: '…', rows: 12 }, caption: '…' }

import { h } from '../../ui/dom.js';

export const defaults = { code: 'print("Hello from Python")', rows: 0 };

export function mount(F, P) {
  const lines = P.code.split('\n').length;
  const ta = h('textarea.code-input', { spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'Python code to run', rows: P.rows || Math.min(20, Math.max(5, lines + 1)) });
  ta.value = P.code;
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); const a = ta.selectionStart, b = ta.selectionEnd; ta.value = ta.value.slice(0, a) + '    ' + ta.value.slice(b); ta.selectionStart = ta.selectionEnd = a + 4; }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(); }
  });
  const out = h('pre.code-run', { 'aria-live': 'polite', hidden: true });
  const figs = h('div.code-plot', { hidden: true });
  const status = h('span.tiny.faint', 'Python starts the first time you press Run (about 13 MB, then cached).');
  const box = h('div', { style: { marginBottom: '.6rem' } }, ta, out, figs);
  F.el.insertBefore(box, F.el.firstChild);
  const runBtn = F.button({ label: 'Run ▶', primary: true, onClick: () => go() });
  F.button({ label: 'Reset the code', onClick: () => { ta.value = P.code; } });
  runBtn.parentElement.append(status);

  let busy = false;
  async function go() {
    if (busy) return;
    busy = true; runBtn.disabled = true; runBtn.textContent = 'Running…';
    out.replaceChildren(); out.hidden = false; figs.replaceChildren(); figs.hidden = true;
    try {
      const py = await import('../../lab/python.js');
      const r = await py.run(ta.value, { onOutput: (m) => { if (m.type === 'status') status.textContent = m.text; else out.append(m.type === 'stderr' ? h('span.err', m.text) : m.text); } });
      if (!r.ok) {
        const { cleanTraceback } = await import('../../lab/harness.js');
        out.append(h('span.err', cleanTraceback(r.error)));
      } else if (r.result !== undefined) out.append(h('span.faint', `→ ${r.result}`));
      if (!out.textContent) out.append(h('span.faint', '(no output)'));
      if (r.figures?.length || r.images?.length) {
        figs.hidden = false;
        if (r.figures?.length) { const { renderFigures } = await import('../../lab/figures.js'); renderFigures(figs, r.figures); }
        (r.images || []).forEach((src, i) => figs.append(h('img.mpl', { src, alt: `Figure ${i + 1}` })));
      }
      const info = py.pythonInfo();
      status.textContent = info ? `Python ${info.python} · finished in ${((r.ms || 0) / 1000).toFixed(2)} s` : '';
    } catch (e) {
      out.append(h('span.err', String(e?.message || e)));
    } finally {
      busy = false; runBtn.disabled = false; runBtn.textContent = 'Run ▶';
    }
  }
  return { get: (k) => (k === 'code' ? ta.value : undefined) };
}

export function validate(P) {
  return typeof P.code === 'string' && P.code.trim() ? [] : ['code-runner needs code'];
}
