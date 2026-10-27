// Settings: theme, review intensity, optional weekly goal, motion, the
// confidence prompt, and your data — export, import, persistence and reset.

import { h, icon, toast } from '../dom.js';
import { app, setSettings, resetAll, recompute } from '../state.js';
import { exportJSON, importJSON, persist, persisted } from '../store.js';

export async function render(main) {
  const s = app.settings;
  const seg = (key, opts) => h('div.seg', opts.map(([v, label]) => h('button', { type: 'button', 'aria-pressed': String(s[key] === v), onclick: async () => { await setSettings({ [key]: v }); main.replaceChildren(); render(main); } }, label)));
  const isPersisted = await persisted();
  const fileIn = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
  fileIn.addEventListener('change', async () => {
    const f = fileIn.files[0];
    if (!f) return;
    try {
      const n = await importJSON(JSON.parse(await f.text()));
      const { init } = await import('../state.js');
      await init(); recompute();
      toast({ title: 'Progress imported', body: `${n} new event${n === 1 ? '' : 's'} merged.`, icon: 'check' });
    } catch (e) { toast({ title: 'Import failed', body: e.message, icon: 'x' }); }
  });
  main.append(h('div.page.narrow',
    h('header.page-head', h('h1', 'Settings')),
    h('div.card', h('h3', 'Appearance'),
      h('div.switch', h('div', h('b', 'Theme'), h('div.tiny.faint', 'Dark is the default; light is easier in daylight.')), seg('theme', [['dark', 'Dark'], ['light', 'Light'], ['auto', 'System']])),
      h('div.switch', h('div', h('b', 'Motion'), h('div.tiny.faint', 'Reduce animation; simulations then animate only when you press Play.')), seg('motion', [['auto', 'System'], ['reduce', 'Reduce']]))),
    h('div.card', { style: { marginTop: '1rem' } }, h('h3', 'Learning'),
      h('div.switch', h('div', h('b', 'Review intensity'), h('div.tiny.faint', 'Target recall for spaced review. Light ≈ 1.9× longer gaps; exam prep ≈ 0.4×.')), seg('retention', [[0.85, 'Light'], [0.9, 'Standard'], [0.95, 'Exam prep']])),
      h('div.switch', h('div', h('b', 'Weekly goal'), h('div.tiny.faint', 'Optional study days per week. Missing a week never erases anything.')), seg('weeklyGoal', [[0, 'Off'], [2, '2'], [3, '3'], [4, '4'], [5, '5']])),
      h('div.switch', h('div', h('b', 'Confidence check'), h('div.tiny.faint', 'Ask “how sure are you?” after first answers. Tracked separately from mastery.')), seg('confidence', [[true, 'On'], [false, 'Off']])),
      h('div.switch', h('div', h('b', 'Starting point and focus'), h('div.tiny.faint', 'Re-run the short setup.')), h('a.btn.small', { href: '#/welcome' }, 'Edit'))),
    h('div.card', { style: { marginTop: '1rem' } }, h('h3', 'Your data'),
      h('p.small.muted', 'Everything lives in this browser (IndexedDB). Every project on this site shares one storage area, and Safari may delete site data after seven days without a visit — export a backup now and then.'),
      h('div.switch', h('div', h('b', 'Protect from eviction'), h('div.tiny.faint', isPersisted ? 'The browser has agreed to keep this data.' : 'Ask the browser to keep this data even under storage pressure.')),
        isPersisted ? h('span.chip.good', 'Persistent') : h('button.btn.small', { type: 'button', onclick: async () => { const ok = await persist(); toast({ title: ok ? 'Storage is now persistent' : 'The browser declined', body: ok ? '' : 'Exporting backups is the safe alternative.' }); } }, 'Request')),
      h('div.switch', h('div', h('b', 'Export progress'), h('div.tiny.faint', `${app.events.length.toLocaleString()} events, plus your profile and settings, as a JSON file.`)),
        h('button.btn.small', { type: 'button', html: `${icon('down')}Export`, onclick: async () => { const data = await exportJSON(); const blob = new Blob([JSON.stringify(data)], { type: 'application/json' }); const a = h('a', { href: URL.createObjectURL(blob), download: `physics-atlas-${new Date().toISOString().slice(0, 10)}.json` }); document.body.append(a); a.click(); a.remove(); } })),
      h('div.switch', h('div', h('b', 'Import progress'), h('div.tiny.faint', 'Merges a previous export; nothing already here is overwritten.')),
        h('button.btn.small', { type: 'button', html: `${icon('up')}Import`, onclick: () => fileIn.click() }), fileIn),
      h('div.switch', h('div', h('b', 'Reset everything'), h('div.tiny.faint', 'Deletes all progress in this browser. Export first if you might want it back.')),
        h('button.btn.small', { type: 'button', style: { borderColor: 'var(--bad)', color: 'var(--bad)' }, onclick: async () => { if (confirm('Delete all Physics Atlas progress in this browser? This cannot be undone.')) { await resetAll(); location.hash = '#/welcome'; } } }, 'Reset'))),
    h('p.tiny.faint', { style: { marginTop: '1.5rem' } }, 'The Physics Atlas runs entirely in your browser: KaTeX for mathematics, a learning engine written for the Atlas (FSRS-6 scheduling, an evidence-gated mastery estimate), and simulations computed live. No accounts, no tracking.')));
}
