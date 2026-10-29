// Pieces shared by several pages: course cards, provenance chips, mastery
// stack bars, the history heat map, the animated hero background.

import { h, icon, bar, statePill } from './dom.js';
import { PROVENANCE, TRACKS } from '../core/catalog.js';
import { courseProgress } from '../core/plan.js';
import { STATES, STATE_LABEL } from '../core/mastery.js';
import { history } from '../core/progress.js';
import { app, reducedMotion } from './state.js';

export function provenanceChip(course) {
  const p = PROVENANCE[course.provenance];
  return h(`span.chip.${p.tone}`, { title: p.blurb }, p.label);
}
export function evidenceChip(course) {
  if (!course.evidence) return null;
  const meaning = { A: 'official catalog text, quoted', B: 'an official page, paraphrased by a search tool', C: 'a listing or third-party source', D: 'an inference — not official' }[course.evidence];
  return h('span.chip.ev', { title: `Evidence ${course.evidence}: ${meaning}` }, `evidence ${course.evidence}`);
}

export function masteryStack(states, total) {
  const n = total || Object.values(states).reduce((a, b) => a + b, 0) || 1;
  return h('div.stackbar', { role: 'img', 'aria-label': STATES.map((s) => `${states[s] || 0} ${STATE_LABEL[s]}`).join(', ') },
    STATES.slice(1).map((s, i) => h('span', { style: { width: `${((states[s] || 0) / n) * 100}%`, background: `var(--st-${i + 1})` } })));
}

export function courseCard(course) {
  const pr = courseProgress(app.cat, app.st, course.id);
  return h('a.card.hover.course-card', { href: `#/course/${course.id}` },
    h('div.row.between', h('span.code', course.code), provenanceChip(course)),
    h('h3', course.title),
    h('p', course.summary),
    h('div.foot',
      h('div.row.between.small', h('span.faint', pr.ready ? `${pr.completed} of ${pr.ready} built lessons done` : 'Lessons in preparation'), h('span.faint', `${pr.total} planned`)),
      bar(pr.completion),
      pr.started ? masteryStack(pr.states, pr.ready) : null,
    ));
}

export function trackTitle(id) { return TRACKS.find((t) => t.id === id)?.title ?? id; }

export function heatmap(n = 84) {
  const days = history(app.st, n, Date.now(), new Date().getTimezoneOffset());
  const max = Math.max(1, ...days.map((d) => d.items + d.lessons * 3));
  const level = (d) => { const v = d.items + d.lessons * 3; if (!v) return 0; return Math.min(4, 1 + Math.floor((v / max) * 3.999)); };
  const today = new Date();
  // pad so columns are weeks starting Monday
  const firstDow = (new Date(today.getTime() - (n - 1) * 86400000).getDay() + 6) % 7;
  const cells = [...Array(firstDow).fill(null), ...days];
  return h('div.heat', { role: 'img', 'aria-label': `Study activity over the last ${n} days` },
    cells.map((d) => (d ? h('i', { 'data-l': level(d), title: `${new Date(d.day * 86400000).toLocaleDateString()}: ${d.items} items, ${d.lessons} lessons` }) : h('i', { style: { visibility: 'hidden' } }))));
}

/** A slow, faint field of geodesics behind the dashboard hero. */
export function heroCanvas(el) {
  const c = h('canvas', { 'aria-hidden': 'true' });
  el.prepend(c);
  const ctx = c.getContext('2d');
  let raf = 0, t0 = performance.now();
  const draw = (now) => {
    const w = c.clientWidth, hh = c.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(hh * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, hh);
    const t = (now - t0) / 1000;
    const cx = w * 0.82, cy = hh * 0.2;
    // light rays bending around a mass at (cx, cy): deflection ∝ 1/b
    ctx.lineWidth = 1;
    for (let k = -7; k <= 7; k++) {
      const b = k * 22 + 11;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const dx = x - cx;
        const bend = 1600 / (Math.abs(b) + 30) * (1 / (1 + Math.exp(-dx / 60)) - 0.5) * Math.sign(b);
        const y = cy + b - bend * 0.9 + Math.sin(t * 0.3 + k) * 0.6;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(140,186,255,${0.05 + 0.05 * (1 - Math.abs(k) / 8)})`;
      ctx.stroke();
    }
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    g.addColorStop(0, 'rgba(0,0,0,.9)'); g.addColorStop(0.55, 'rgba(0,0,0,.7)'); g.addColorStop(0.62, 'rgba(242,193,78,.35)'); g.addColorStop(1, 'rgba(242,193,78,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
    if (!reducedMotion()) raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(raf);
}

export function emptyState(text, action) {
  return h('div.empty', h('p', text), action || null);
}

export { statePill, icon };
