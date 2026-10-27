// The running app's state: the catalog, the event log, the replayed learner
// state, the profile and settings. Every learner action appends an event,
// which is saved, replayed and broadcast to whatever page is showing.

import { replay } from '../core/progress.js';
import { evaluate } from '../core/achievements.js';
import * as store from './store.js';
import { CATALOG } from '../../content/catalog.js';
import ACHIEVEMENTS from '../../content/achievements.js';
import { toast } from './dom.js';
import { medalSVG } from './medals.js';

export const DEFAULT_SETTINGS = {
  theme: 'dark',            // 'dark' | 'light' | 'auto'
  retention: 0.9,           // 0.85 light, 0.9 standard, 0.95 exam prep
  maxInterval: 180,
  weeklyGoal: 0,            // study days per week; 0 = off (streaks are opt-in)
  motion: 'auto',           // 'auto' | 'reduce'
  confidence: true,         // ask "how sure were you?" after answers
  grMode: 'intuition',      // default mode for the GR road
};

export const app = {
  cat: CATALOG,
  events: [],
  st: null,
  profile: null,
  settings: { ...DEFAULT_SETTINGS },
  achievements: [],
  seen: {},
  ready: false,
};

const listeners = new Set();
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const notify = () => { for (const fn of listeners) { try { fn(app); } catch (e) { console.error(e); } } };

const encompassing = {};
for (const L of Object.values(CATALOG.lessons)) if (L.encompasses?.length) encompassing[L.id] = L.encompasses;

export async function init() {
  const [events, profile, settings, seen] = await Promise.all([
    store.loadEvents(), store.getKV('profile'), store.getKV('settings'), store.getKV('achievementsSeen'),
  ]);
  app.events = events || [];
  app.profile = profile;
  app.settings = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  app.seen = seen || {};
  applyTheme();
  recompute({ silent: true });
  app.ready = true;
}

export function recompute({ silent = false } = {}) {
  app.st = replay(app.events, {
    retention: app.settings.retention, maxInterval: app.settings.maxInterval, now: Date.now(),
    tz: new Date().getTimezoneOffset(), weeklyGoal: app.settings.weeklyGoal, encompassing,
  });
  app.achievements = evaluate(ACHIEVEMENTS, app.st, app.cat);
  const fresh = app.achievements.filter((a) => a.unlocked && !app.seen[a.id]);
  if (fresh.length) {
    const t = Date.now();
    for (const a of fresh) app.seen[a.id] = t;
    store.setKV('achievementsSeen', app.seen);
    if (!silent) for (const a of fresh.slice(0, 3)) toast({ title: `Achievement: ${a.title}`, body: a.blurb, art: medalSVG(a, 44) });
  }
  if (!silent) notify();
}

/** Append one event to the log. */
export async function log(kind, fields = {}) {
  const ev = { id: store.newId(), t: Date.now(), kind, ...fields };
  app.events.push(ev);
  try { await store.addEvents([ev]); } catch (e) { console.warn('Could not save progress', e); }
  recompute();
  return ev;
}

export async function setSettings(patch) {
  app.settings = { ...app.settings, ...patch };
  await store.setKV('settings', app.settings);
  applyTheme();
  recompute();
}

export async function setProfile(patch) {
  app.profile = { ...(app.profile || { created: Date.now() }), ...patch };
  await store.setKV('profile', app.profile);
  notify();
}

export function applyTheme() {
  const root = document.documentElement;
  const th = app.settings.theme;
  if (th === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', th);
  try { localStorage.setItem('atlas:theme', th); } catch { /* storage may be blocked */ }
  if (app.settings.motion === 'reduce') root.setAttribute('data-motion', 'reduce'); else root.removeAttribute('data-motion');
}

export const reducedMotion = () => app.settings.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function resetAll() {
  await store.wipe();
  app.events = []; app.profile = null; app.seen = {};
  app.settings = { ...DEFAULT_SETTINGS };
  applyTheme();
  recompute();
}
