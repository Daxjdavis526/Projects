// Settings: theme, review intensity, optional weekly goal, motion, the
// confidence prompt, and your data — export, import, persistence and reset.

import { h, icon, toast } from '../dom.js';
import { app, setSettings, resetAll, recompute } from '../state.js';
import { exportJSON, importJSON, persist, persisted } from '../store.js';
import * as offline from '../offline.js';

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
    appCard(),
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

// Install on the home screen, and keep every lesson for use with no network.
function appCard() {
  const how = offline.installState();
  const installRow = h('div.switch', h('div', h('b', 'Install as an app'), h('div.tiny.faint', {
    installed: 'Installed: you are using the Atlas as an app.',
    prompt: 'Puts the Atlas on your home screen and opens it full screen, like any app.',
    ios: 'In Safari, tap the Share button (the square with an arrow), then “Add to Home Screen”.',
    manual: 'Use your browser’s menu: “Install app” or “Add to Home screen”.',
  }[how])), how === 'installed' ? h('span.chip.good', 'Installed') : how === 'prompt'
    ? h('button.btn.small', { type: 'button', html: `${icon('down')}Install`, onclick: async () => { if (await offline.promptInstall()) toast({ title: 'Installed', body: 'Find the Atlas on your home screen.', icon: 'check' }); } })
    : null);
  const card = h('div.card', { style: { marginTop: '1rem' } }, h('h3', 'App and offline'), installRow);
  if (how === 'installed' || how === 'ios') card.append(h('p.tiny.faint', 'On an iPhone the home-screen app keeps its own progress, separate from Safari’s: to move it, Export below in one and Import in the other.'));
  if (!offline.supported()) { card.append(h('p.small.muted', 'This browser cannot keep the Atlas for offline use.')); return card; }
  const state = h('div.tiny.faint', 'Checking what is saved…');
  const py = h('input', { type: 'checkbox' });
  const bar = h('progress', { max: 1, value: 0, hidden: true, style: { width: '100%', marginTop: '.5rem' } });
  const saveBtn = h('button.btn.small', { type: 'button', html: `${icon('down')}Save` });
  const removeBtn = h('button.btn.small', { type: 'button', hidden: true }, 'Remove');
  async function refresh() {
    try {
      const st = await offline.status();
      const appDone = st.app.have === st.app.total, pyDone = st.python.have === st.python.total;
      state.textContent = appDone
        ? `Every lesson and simulation is saved on this device (${offline.mb(st.app.bytes)})${pyDone ? ', and the Python lab' : ''}. It all works with no network.`
        : `${st.app.have} of ${st.app.total} files saved so far (lessons you open are kept as you go). Save the rest: about ${offline.mb(st.app.bytes)}.`;
      py.checked = pyDone || py.checked;
      py.disabled = pyDone;
      pyLabel.lastChild.textContent = ` Include the Python lab (${offline.mb(st.python.bytes)}) for the code lab and coding exercises`;
      saveBtn.hidden = appDone && (pyDone || !py.checked);
      removeBtn.hidden = st.app.have === 0 && st.python.have === 0;
    } catch (e) { state.textContent = `Could not check: ${e.message}`; }
  }
  const pyLabel = h('label.tiny', { style: { display: 'flex', gap: '.45rem', alignItems: 'center', marginTop: '.4rem' } }, py, h('span', ' Include the Python lab'));
  py.addEventListener('change', refresh);
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true; bar.hidden = false; bar.value = 0;
    try {
      const n = await offline.save({ python: py.checked, onProgress: (d, t) => { bar.value = t ? d / t : 1; state.textContent = `Saving… ${d} of ${t} files`; } });
      toast({ title: 'Saved for offline', body: n ? `${n} files downloaded.` : 'Everything was already saved.', icon: 'check' });
    } catch (e) { toast({ title: 'Not everything was saved', body: e.message, icon: 'x' }); }
    saveBtn.disabled = false; bar.hidden = true;
    refresh();
  });
  removeBtn.addEventListener('click', async () => { if (confirm('Remove the offline copy? Your progress is not affected.')) { await offline.remove(); refresh(); } });
  card.append(h('div.switch', h('div', h('b', 'Save for offline'), state, pyLabel, bar), h('div.row', { style: { gap: '.4rem', flexWrap: 'nowrap' } }, saveBtn, removeBtn)));
  refresh();
  return card;
}
