/* Modals, confirmations and toasts. */
import { h, btn } from './dom.js';

let toastHost = null;

export function modal({ title, body, footer = [], narrow = false, onClose = null, closable = true }) {
  const close = () => { scrim.remove(); document.removeEventListener('keydown', onKey); onClose && onClose(); };
  const onKey = e => { if (e.key === 'Escape' && closable) close(); };
  const box = h('div.modal' + (narrow ? '.narrow' : ''),
    h('div.mh', h('h3', title), closable ? h('button.x', { onclick: close, title: 'Close' }, '×') : null),
    h('div.mb', body),
    footer.length ? h('div.mf', footer) : null);
  const scrim = h('div.scrim', { onmousedown: e => { if (e.target === scrim && closable) close(); } }, box);
  document.body.append(scrim);
  document.addEventListener('keydown', onKey);
  return { close, box, scrim };
}

/* An interlock warning: "this is unwise because…" — proceed or cancel. */
export function confirmWarnings(warnings, onProceed, title = 'Caution') {
  const m = modal({
    title, narrow: true,
    body: [
      ...warnings.map(w => h('div.warnbox', h('b', w.msg), w.why ? h('div.muted', w.why) : null)),
      h('p.faint', 'Proceeding is recorded in the event log.'),
    ],
    footer: [
      btn('Cancel', () => m.close(), 'ghost'),
      btn('Proceed anyway', () => { m.close(); onProceed(); }, 'warn'),
    ],
  });
  return m;
}

export function toast(title, text = '', kind = 'block', ms = 5200) {
  if (!toastHost) { toastHost = h('div.toast-host'); document.body.append(toastHost); }
  const t = h('div.toast' + (kind === 'info' ? '.info' : ''), h('b', title), text ? h('span.why', text) : null);
  toastHost.append(t);
  setTimeout(() => t.remove(), ms);
}

/* Run a controller action with the standard UI for its outcome. */
export function act(session, action, args = {}, after = null) {
  const r = session.execute(action, args);
  if (r.ok) { after && after(r); return r; }
  if (r.blocked) { toast('BLOCKED — ' + r.blocked.msg, r.blocked.why); return r; }
  if (r.confirm) {
    confirmWarnings(r.confirm, () => {
      const r2 = session.execute(action, args, { confirmed: true });
      if (r2.ok) after && after(r2);
      else if (r2.blocked) toast('BLOCKED — ' + r2.blocked.msg, r2.blocked.why);
    });
  }
  return r;
}
