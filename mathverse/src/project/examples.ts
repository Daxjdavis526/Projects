// The example projects in mathverse/examples/, bundled into the app so they
// open without touching the disk. They go through the same validating reader
// as any file the user opens.
import { readProject, type Project } from './format';

const files = import.meta.glob('../../examples/*.mathverse', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export interface Example { id: string; name: string; tabs: number; project: () => Project }

export const EXAMPLES: Example[] = Object.entries(files)
  .map(([path, text]) => {
    const p = readProject(text);
    return { id: path.split('/').pop()!.replace(/\.mathverse$/, ''), name: p.name, tabs: p.tabs.length, project: () => readProject(text) };
  })
  .sort((a, b) => a.name.localeCompare(b.name));
