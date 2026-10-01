/* Local persistence: settings, competency progress, the engineering
   notebook, plot layouts, run numbering. Browser storage only, and every
   access is guarded — a private window or a blocked origin simply means
   nothing is remembered. Recorded run DATA stays in memory for the session
   (it is megabytes); the notebook keeps each run's summary. */

const KEY = 'redline.v1';

const DEFAULTS = () => ({
  settings: { pressure: 'psi', force: 'N', temperature: 'C', sound: true },
  progress: {},
  notebook: [],
  sessionNotes: [],
  layouts: {},
  nextRun: {},
});

export const store = {
  data: DEFAULTS(),
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.data = Object.assign(DEFAULTS(), JSON.parse(raw));
    } catch { this.data = DEFAULTS(); }
    return this.data;
  },
  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch { /* storage unavailable: fine */ }
  },
};
