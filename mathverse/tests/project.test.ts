import { describe, it, expect } from 'vitest';
import { readProject, writeProject, emptyWorkspace, ProjectError, Project } from '../src/project/format';

const sample = (): Project => ({
  format: 'mathverse', version: 1, name: 'Saddle study', created: '2026-11-03T00:00:00Z', modified: '',
  tabs: [{ ...emptyWorkspace('calc3.tangent-plane', 'Saddle'), input: 'z = x^2 - y^2', params: { a: 0.5 }, paramRanges: { a: [0, 2] },
    camera: { position: [4, 3, 5], target: [0, 0, 0], projection: 'orthographic', zoom: 1.5 }, notes: 'The saddle point at the origin.', t: 2.5 }],
  active: 0,
});

describe('.mathverse files', () => {
  it('round-trip a project exactly', () => {
    const p = sample();
    const back = readProject(writeProject(p));
    expect(back.tabs[0]).toEqual(p.tabs[0]);
    expect(back.name).toBe('Saddle study');
  });
  it('reject what is not a project, with readable messages', () => {
    expect(() => readProject('not json')).toThrow(/not valid JSON/);
    expect(() => readProject('{"format":"other"}')).toThrow(/not a MathVerse project/);
    expect(() => readProject('{"format":"mathverse","version":99,"tabs":[{}]}')).toThrow(/newer MathVerse/);
    expect(() => readProject('{"format":"mathverse","version":1,"tabs":[]}')).toThrow(ProjectError);
  });
  it('drops hostile or malformed fields instead of trusting them', () => {
    const evil = JSON.stringify({ format: 'mathverse', version: 1, name: 'x', tabs: [{ demoId: 'calc1.tangent', params: { __proto__: { polluted: 1 }, 'a b': 3, ok: 2, nan: 'NaN', big: 1e400 }, choices: { constructor: 'x', mode: 'left' }, toggles: { show: 'yes', grid: true }, camera: { position: [1, 2], target: [0, 0, 0] }, display: { opacity: 7 } }] });
    const p = readProject(evil);
    const w = p.tabs[0];
    expect(Object.keys(w.params)).toEqual(['ok']);
    expect(w.choices).toEqual(Object.assign(Object.create(null), { mode: 'left' }));
    expect(w.toggles.grid).toBe(true);
    expect(w.toggles.show).toBeUndefined();
    expect(w.camera).toBeUndefined();
    expect(w.display.opacity).toBe(1);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});
