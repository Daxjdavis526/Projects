// Saving and opening files. In the desktop app: native dialogs and the file
// system (Tauri plugins, limited by the app's capabilities to files the user
// picks). In a browser (development, tests): a download and a file picker.

import type { Project } from './format';
import { readProject, writeProject } from './format';

export const isDesktop = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

async function tauri() {
  const [dialog, fs] = await Promise.all([import('@tauri-apps/plugin-dialog'), import('@tauri-apps/plugin-fs')]);
  return { dialog, fs };
}

/** Save a project. Returns the path (desktop) or the file name, or null if cancelled. */
export async function saveProject(p: Project, path?: string): Promise<string | null> {
  const text = writeProject(p);
  if (isDesktop()) {
    const { dialog, fs } = await tauri();
    const target = path ?? await dialog.save({ defaultPath: `${p.name || 'Untitled'}.mathverse`, filters: [{ name: 'MathVerse project', extensions: ['mathverse'] }] });
    if (!target) return null;
    await fs.writeTextFile(target, text);
    return target;
  }
  download(`${p.name || 'Untitled'}.mathverse`, text, 'application/json');
  return `${p.name || 'Untitled'}.mathverse`;
}

/** Open a project chosen by the user (or at a known path, desktop only). */
export async function openProject(path?: string): Promise<{ project: Project; path: string } | null> {
  if (isDesktop()) {
    const { dialog, fs } = await tauri();
    const target = path ?? await dialog.open({ multiple: false, filters: [{ name: 'MathVerse project', extensions: ['mathverse'] }] });
    if (!target || Array.isArray(target)) return null;
    const text = await fs.readTextFile(target as string);
    return { project: readProject(text), path: target as string };
  }
  const file = await pickFile('.mathverse,application/json');
  if (!file) return null;
  return { project: readProject(await file.text()), path: file.name };
}

/** Export a file (PNG/SVG/CSV/TeX/JSON): a native save dialog on the desktop, a download in a browser. */
export async function exportFile(name: string, data: string | Blob, mime: string, ext: string): Promise<string | null> {
  if (isDesktop()) {
    const { dialog, fs } = await tauri();
    const target = await dialog.save({ defaultPath: name, filters: [{ name: ext.toUpperCase(), extensions: [ext] }] });
    if (!target) return null;
    if (typeof data === 'string' && !data.startsWith('data:')) await fs.writeTextFile(target, data);
    else {
      const blob = typeof data === 'string' ? await (await fetch(data)).blob() : data;
      await fs.writeFile(target, new Uint8Array(await blob.arrayBuffer()));
    }
    return target;
  }
  if (typeof data === 'string' && data.startsWith('data:')) { const a = document.createElement('a'); a.href = data; a.download = name; a.click(); return name; }
  download(name, data, mime);
  return name;
}

function download(name: string, data: string | Blob, mime: string) {
  const blob = typeof data === 'string' ? new Blob([data], { type: mime }) : data;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = accept;
    inp.onchange = () => resolve(inp.files?.[0] ?? null);
    inp.click();
  });
}
