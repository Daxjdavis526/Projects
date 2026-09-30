/* Training: programs, levels, modes, and what each level teaches.
   Nothing is locked; progress is recorded by competency, per mode. */
import { h, btn, clear } from '../dom.js';
import { PROGRAMS, MODES } from '../../content/programs.js';
import { store } from '../store.js';

export class TrainingView {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    this.render();
  }

  render() {
    const host = this.host;
    clear(host);
    const page = h('div.page');
    page.append(h('h1', 'Rocket-engine test engineering'),
      h('p.lede', 'A simulated test-control room. You prepare, instrument, pressurise, fire, safe and diagnose propulsion hardware — seeing it only through its instruments, the way a test engineer does. The physics underneath is a lumped-parameter model; the decisions are the real ones.'),
      h('div.disclaimer', 'Educational software. Every stand, engine and procedure here is fictional and generalised. It teaches concepts and how test engineers think; it is not a certified procedure for real hardware and does not qualify anyone to operate a real test facility.'));

    // open stand
    page.append(h('h2', 'Open stand'));
    const open = h('div.levels', { style: { gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' } },
      h('div.level',
        h('div.ln', 'TS-1 · SANDBOX'),
        h('div.lt', 'Cold-gas stand, no procedure'),
        h('ul', h('li', 'Every control available; interlocks and physics still apply'), h('li', 'Write your own plan in the notebook first'), h('li', 'Fault injection: a hidden fault may or may not be present; diagnose it from Console ▸ INSPECT')),
        h('div.modes', btn('Guided rules', () => this.app.start(null, 'guided'), 'sm'), btn('Independent rules', () => this.app.start(null, 'independent'), 'sm'), btn('Fault injection', () => this.app.start(null, 'fault'), 'sm', { title: MODES.fault.text }))));
    page.append(open);

    for (const p of PROGRAMS) {
      const built = p.levels.filter(l => l.scenario);
      const earned = built.filter(l => Object.keys(store.data.progress[l.id] || {}).length).length;
      page.append(h('div.prog-head', h('h2', p.title), p.stand ? h('span.tag', p.stand) : h('span.tag', 'planned'),
        built.length ? h('span.faint', { style: { fontSize: '11px', marginLeft: '10px' } }, `competency recorded on ${earned} of ${built.length} levels`) : null));
      page.append(h('p.lede', p.blurb));
      const grid = h('div.levels');
      for (const l of p.levels) {
        const built = !!l.scenario;
        const prog = store.data.progress[l.id] || {};
        const card = h('div.level' + (built ? '' : '.todo'),
          h('div.ln', `LEVEL ${l.n}`),
          h('div.lt', l.title),
          h('ul', l.teaches.map(t => h('li', t))));
        if (built) {
          const done = Object.entries(prog).map(([m, d]) => `${MODES[m]?.label || m} ✓ ${d}`).join(' · ');
          if (done) card.append(h('div.done', done));
          card.append(h('div.modes', l.modes.map(m => btn(MODES[m].label, () => this.app.start(l.id, m), m === 'tutorial' ? 'sm primary' : 'sm', { title: MODES[m].text }))));
        } else {
          card.append(h('div.modes', h('span.faint', { style: { fontSize: '11px' } }, `Not built yet — development phase ${l.phase}`)));
        }
        grid.append(card);
      }
      page.append(grid);
    }

    page.append(h('h2', 'Modes'));
    page.append(h('div.kv', { style: { maxWidth: '100ch', gap: '6px 16px' } },
      Object.entries(MODES).map(([k, m]) => [h('span.k', m.label), h('span', { style: { color: 'var(--ink-2)' } }, m.text)])));
    host.append(page);
  }
}
