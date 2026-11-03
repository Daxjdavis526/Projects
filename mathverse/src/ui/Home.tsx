// The welcome page, the tutorial list and the Fidget gallery.
import { MODULES } from '../modules/types';
import { DEMOS } from '../modules/registry';
import { Tex } from './tex';
import { Icon } from './icons';
import { EXAMPLES as PROJECTS } from '../project/examples';

const EXAMPLES = [
  'f(x) = x^3 - 4x', 'z = A sin(Bx) cos(Cy)', 'r(t) = (cos(t), sin(t), t/4)', 'F(x,y) = (-y, x - 0.3y)',
  'A = [[2,1],[1,2]]', 'dy/dt = y(1 - y) - h', "y'' + c y' + 4y = 0", 'x^2/4 + y^2 = 1', 'r = 1 + 2cos(3θ)',
];

export function Home({ onTry, onOpen, recent, onOpenRecent, onExample, completed }: { onTry: (s: string) => void; onOpen: (id: string) => void; recent: { name: string; path?: string }[]; onOpenRecent: (path: string) => void; onExample: (id: string) => void; completed: string[] }) {
  const tutorials = DEMOS.filter((d) => d.tutorial?.length);
  const fidget = DEMOS.filter((d) => d.module === 'fidget');
  return (
    <div className="home">
      <header className="home-hero">
        <h1>MathVerse</h1>
        <p>Don’t just look at mathematics — grab it. Type anything above, or open a module.</p>
        <div className="examples">{EXAMPLES.map((e) => <button key={e} onClick={() => onTry(e)}>{e}</button>)}</div>
      </header>
      {fidget.length > 0 && (
        <section>
          <h2><Icon name="wand" /> Fidget playgrounds</h2>
          <div className="cards">{fidget.map((d) => <button key={d.id} className="card" onClick={() => onOpen(d.id)}><b>{d.title}</b><span>{d.summary}</span></button>)}</div>
        </section>
      )}
      <section>
        <h2><Icon name="layers" /> Modules</h2>
        <div className="cards">
          {MODULES.map((m) => {
            const list = DEMOS.filter((d) => d.module === m.id);
            return (
              <button key={m.id} className="card module-card" style={{ ['--accent' as string]: m.color }} onClick={() => list[0] && onOpen(list[0].id)} disabled={!list.length}>
                <b>{m.title}</b><span>{m.blurb}</span><small>{list.length} demonstration{list.length === 1 ? '' : 's'}</small>
              </button>
            );
          })}
        </div>
      </section>
      {tutorials.length > 0 && (
        <section>
          <h2><Icon name="cap" /> Tutorials</h2>
          <div className="cards">{tutorials.slice(0, 9).map((d) => <button key={d.id} className="card" onClick={() => onOpen(d.id + '#tutorial')}><b>{d.title}{completed.includes(d.id) && <span className="done-badge"><Icon name="check" size={13} /></span>}</b><span>{d.tutorial!.length} steps · {MODULES.find((m) => m.id === d.module)?.title ?? 'Fidget'}</span></button>)}</div>
        </section>
      )}
      {PROJECTS.length > 0 && (
        <section>
          <h2><Icon name="open" /> Example projects</h2>
          <div className="cards">{PROJECTS.map((e) => <button key={e.id} className="card" onClick={() => onExample(e.id)}><b>{e.name}</b><span>{e.project().tabs.map((t) => t.title).join(' · ')}</span><small>{e.tabs} tabs</small></button>)}</div>
        </section>
      )}
      {recent.length > 0 && (
        <section>
          <h2><Icon name="open" /> Recent projects</h2>
          <ul className="recent">{recent.slice(0, 8).map((r, i) => <li key={i}><button onClick={() => r.path && onOpenRecent(r.path)}>{r.name}</button></li>)}</ul>
        </section>
      )}
    </div>
  );
}

export function TutorialList({ onOpen, completed }: { onOpen: (id: string) => void; completed: string[] }) {
  const list = DEMOS.filter((d) => d.tutorial?.length);
  return (
    <div className="home">
      <header className="home-hero"><h1>Tutorials</h1><p>Guided, step-by-step lessons. Each one drives a live demonstration: read a step, try the experiment, and the next step opens.</p></header>
      {MODULES.map((m) => {
        const mine = list.filter((d) => d.module === m.id);
        if (!mine.length) return null;
        return (
          <section key={m.id}>
            <h2><span className="dot" style={{ background: m.color }} />{m.title}</h2>
            <div className="cards">{mine.map((d) => <button key={d.id} className="card" onClick={() => onOpen(d.id + '#tutorial')}><b>{d.title}{completed.includes(d.id) && <span className="done-badge"><Icon name="check" size={13} /></span>}</b><span>{d.summary}</span><small><Tex tex={d.tex} /></small></button>)}</div>
          </section>
        );
      })}
      {!list.length && <p className="muted">Tutorials are being written.</p>}
    </div>
  );
}

export function FidgetGallery({ onOpen }: { onOpen: (id: string) => void }) {
  const list = DEMOS.filter((d) => d.module === 'fidget');
  return (
    <div className="home">
      <header className="home-hero"><h1>Fidget playgrounds</h1><p>No exercises, no scores — just mathematics to push around. Drag, spin, sculpt and listen.</p></header>
      <div className="cards">{list.map((d) => <button key={d.id} className="card" onClick={() => onOpen(d.id)}><b>{d.title}</b><span>{d.summary}</span></button>)}</div>
      {!list.length && <p className="muted">Playgrounds are being built.</p>}
    </div>
  );
}
