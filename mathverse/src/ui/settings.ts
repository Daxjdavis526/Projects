// Preferences kept on this computer (the app's own storage; nothing leaves the machine).
export interface Settings {
  theme: 'dark' | 'light';
  sound: boolean;               // subtle interaction sounds (off by default)
  leftWidth: number; rightWidth: number; bottomHeight: number;
  leftOpen: boolean; rightOpen: boolean; bottomOpen: boolean;
  quality: 'auto' | 'high' | 'low';
  recent: { name: string; path?: string; at: number }[];
  completedTutorials: string[];
}

const KEY = 'mathverse:settings';
export const DEFAULTS: Settings = {
  theme: 'dark', sound: false, leftWidth: 270, rightWidth: 330, bottomHeight: 210,
  leftOpen: true, rightOpen: true, bottomOpen: true, quality: 'auto', recent: [], completedTutorials: [],
};

export function loadSettings(): Settings {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...DEFAULTS }; }
}
export function saveSettings(s: Settings) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
}
