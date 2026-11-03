// The left sidebar: home, the seven modules and their demonstrations, Fidget
// mode, the Homework Companion, tutorials, and a search over everything.
import { useMemo, useState } from 'react';
import { MODULES, ModuleId, DemoDef } from '../modules/types';
import { DEMOS } from '../modules/registry';
import { Icon } from './icons';
import { score } from './Palette';

export type Place = { kind: 'home' } | { kind: 'demo'; id: string } | { kind: 'companion' } | { kind: 'tutorials' } | { kind: 'fidget' };

export function Sidebar({ place, currentDemo, onOpen, onPlace }: { place: Place; currentDemo?: string; onOpen: (id: string) => void; onPlace: (p: Place) => void }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Set<ModuleId>>(() => new Set(currentDemo ? [currentDemo.split('.')[0] as ModuleId] : []));
  const hits = useMemo(() => (q ? DEMOS.map((d) => ({ d, s: score(q, `${d.title} ${d.topic} ${d.summary}`) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 40).map((x) => x.d) : []), [q]);
  const toggle = (m: ModuleId) => setOpen((s) => { const n = new Set(s); if (n.has(m)) n.delete(m); else n.add(m); return n; });
  const item = (d: DemoDef) => (
    <li key={d.id}><button className={currentDemo === d.id && place.kind === 'demo' ? 'active' : ''} onClick={() => onOpen(d.id)} title={d.summary}>{d.title}</button></li>
  );
  return (
    <nav className="sidebar" aria-label="Subjects">
      <div className="search"><Icon name="search" size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics…" aria-label="Search topics" /></div>
      {q ? (
        <ul className="demo-list">{hits.map(item)}{!hits.length && <li className="empty">No topic matches.</li>}</ul>
      ) : (
        <>
          <button className={`nav-item ${place.kind === 'home' ? 'active' : ''}`} onClick={() => onPlace({ kind: 'home' })}><Icon name="spark" />Home</button>
          <button className={`nav-item ${place.kind === 'companion' ? 'active' : ''}`} onClick={() => onPlace({ kind: 'companion' })}><Icon name="pen" />Homework Companion</button>
          <button className={`nav-item ${place.kind === 'tutorials' ? 'active' : ''}`} onClick={() => onPlace({ kind: 'tutorials' })}><Icon name="cap" />Tutorials</button>
          <button className={`nav-item ${place.kind === 'fidget' ? 'active' : ''}`} onClick={() => onPlace({ kind: 'fidget' })}><Icon name="wand" />Fidget playgrounds</button>
          <div className="nav-heading">Modules</div>
          {MODULES.map((m) => {
            const list = DEMOS.filter((d) => d.module === m.id);
            const isOpen = open.has(m.id);
            return (
              <div key={m.id} className="module">
                <button className="module-head" onClick={() => toggle(m.id)} aria-expanded={isOpen}>
                  <span className="dot" style={{ background: m.color }} />{m.title}<span className="count">{list.length}</span>
                </button>
                {isOpen && <ul className="demo-list">{list.map(item)}{!list.length && <li className="empty">Coming soon</li>}</ul>}
              </div>
            );
          })}
        </>
      )}
    </nav>
  );
}
