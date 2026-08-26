/* ============================================================================
   ui/settings.js — quality / post / label density (persisted)
   ========================================================================== */
const $ = s => document.querySelector(s);
const KEY = 'horizon.settings';

export const QUALITY = {
  low:   { points: 0.35, pixelRatio: 1,   label: 'Low' },
  med:   { points: 0.6,  pixelRatio: 1.5, label: 'Med' },
  high:  { points: 1.0,  pixelRatio: 2,   label: 'High' },
  ultra: { points: 1.7,  pixelRatio: 2.5, label: 'Ultra' },
};

export function loadSettings() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch {}
  return {
    quality: QUALITY[s.quality] ? s.quality : 'high',
    post: s.post !== false,
    labels: s.labels ?? 1,
    audio: s.audio === true,
  };
}
export function saveSettings(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function initSettingsUI(settings, hooks) {
  const q = $('#optQuality');
  for (const [id, def] of Object.entries(QUALITY)) {
    const b = document.createElement('button');
    b.textContent = def.label;
    b.classList.toggle('on', settings.quality === id);
    b.onclick = () => { settings.quality = id; saveSettings(settings); location.reload(); };
    q.appendChild(b);
  }
  const p = $('#optPost');
  for (const [label, val] of [['On', true], ['Off', false]]) {
    const b = document.createElement('button');
    b.textContent = label;
    b.classList.toggle('on', settings.post === val);
    b.onclick = () => {
      settings.post = val; saveSettings(settings);
      p.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      hooks.setPost(val);
    };
    p.appendChild(b);
  }
  const l = $('#optLabels');
  for (const [label, val] of [['Few', 0.5], ['Normal', 1], ['Many', 1.6]]) {
    const b = document.createElement('button');
    b.textContent = label;
    b.classList.toggle('on', settings.labels === val);
    b.onclick = () => {
      settings.labels = val; saveSettings(settings);
      l.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      hooks.setLabelDensity(val);
    };
    l.appendChild(b);
  }
}
