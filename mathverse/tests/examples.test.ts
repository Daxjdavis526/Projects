import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { readProject } from '../src/project/format';
import { classify } from '../src/core/input/classify';

const dir = join(__dirname, '..', 'examples');
const src = readdirSync(join(__dirname, '..', 'src', 'modules'), { recursive: true }).filter((f) => String(f).endsWith('.ts'))
  .map((f) => readFileSync(join(__dirname, '..', 'src', 'modules', String(f)), 'utf8')).join('\n')
  + readdirSync(join(__dirname, '..', 'src', 'fidget')).filter((f) => f.endsWith('.ts')).map((f) => readFileSync(join(__dirname, '..', 'src', 'fidget', f), 'utf8')).join('\n');

describe('example projects', () => {
  const files = readdirSync(dir).filter((f) => f.endsWith('.mathverse'));
  it('exist', () => expect(files.length).toBeGreaterThanOrEqual(4));
  for (const f of files) {
    it(`${f} loads and refers only to real demonstrations and valid input`, () => {
      const p = readProject(readFileSync(join(dir, f), 'utf8'));
      expect(p.tabs.length).toBeGreaterThan(0);
      for (const t of p.tabs) {
        if (t.demoId === 'explore') expect(() => classify(t.input)).not.toThrow();
        else expect(src.includes(`id: '${t.demoId}'`), `${t.demoId} is not a demonstration`).toBe(true);
      }
    });
  }
});
