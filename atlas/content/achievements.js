// Achievements. Each rewards a learning behaviour or a milestone of real
// mastery — never volume, speed or clicking. `test` receives the helpers
// from src/core/achievements.js; `progress` returns [have, need] for the bar.

const mods = (keys) => keys;

export default [
  // ── behaviours ─────────────────────────────────────────────────────────
  { id: 'first-light', title: 'First Light', blurb: 'Finish your first lesson.', tier: 'bronze', glyph: 'star',
    test: (x) => x.lessonsCompleted >= 1, progress: (x) => [Math.min(1, x.lessonsCompleted), 1] },
  { id: 'came-back', title: 'Came Back to It', blurb: 'Succeed at a review 30 or more days after you last practised that skill.', tier: 'silver', glyph: 'return',
    test: (x) => x.c.longReturns >= 1 },
  { id: 'little-often', title: 'Little and Often', blurb: 'Study on five different days within two weeks.', tier: 'bronze', glyph: 'calendar',
    test: (x) => x.studyDaysIn(14) >= 5, progress: (x) => [Math.min(5, x.studyDaysIn(14)), 5] },
  { id: 'new-territory', title: 'New Territory', blurb: 'Start lessons in three different courses.', tier: 'bronze', glyph: 'compass',
    test: (x) => x.coursesStarted >= 3, progress: (x) => [Math.min(3, x.coursesStarted), 3] },
  { id: 'worked-it-out', title: 'Worked It Out', blurb: 'Solve ten problems on a later try after a wrong first answer, without opening the solution.', tier: 'silver', glyph: 'target',
    test: (x) => x.c.recoveries >= 10, progress: (x) => [Math.min(10, x.c.recoveries), 10] },
  { id: 'hint-then-own', title: 'Hint, Then Own It', blurb: 'Use a hint on a skill, then later solve that skill unaided on the first try.', tier: 'bronze', glyph: 'bulb',
    test: (x) => x.c.hintThenOwn >= 1 },
  { id: 'calibrated', title: 'Calibrated', blurb: 'Rate your confidence on 20 answers, right most of the time when you say “sure”.', tier: 'silver', glyph: 'scale',
    test: (x) => x.calibrationGood, progress: (x) => [Math.min(20, x.calibrationN), 20] },
  { id: 'debugger', title: 'Debugger', blurb: 'Find the error in ten flawed solutions.', tier: 'silver', glyph: 'bug',
    test: (x) => x.c.errorsFound >= 10, progress: (x) => [Math.min(10, x.c.errorsFound), 10] },
  { id: 'experimenter', title: 'Experimenter', blurb: 'Complete five lab lessons.', tier: 'silver', glyph: 'flask',
    test: (x) => x.c.labs >= 5, progress: (x) => [Math.min(5, x.c.labs), 5] },
  { id: 'daily-ten', title: 'Daily Explorer', blurb: 'Solve ten daily challenges (on any days you like).', tier: 'silver', glyph: 'calendar',
    test: (x) => x.c.dailies >= 10, progress: (x) => [Math.min(10, x.c.dailies), 10] },
  { id: 'reviewer', title: 'Spaced Out', blurb: 'Complete fifty spaced reviews.', tier: 'gold', glyph: 'return',
    test: (x) => x.c.reviews >= 50, progress: (x) => [Math.min(50, x.c.reviews), 50] },

  // ── mastery milestones (named in the brief) ───────────────────────────
  { id: 'first-derivative', title: 'First Derivative', blurb: 'Reach Proficient on the derivative as a rate of change.', tier: 'bronze', glyph: 'derivative',
    test: (x) => x.atLeast('math1210.C1-3.1', 'proficient') || x.atLeast('math1210.C1-3.2', 'proficient') },
  { id: 'master-integrals', title: 'Master of Integrals', blurb: 'Reach Proficient on every built lesson in Techniques of Integration.', tier: 'gold', glyph: 'integral',
    test: (x) => x.moduleAtLeast('math1220.C2-2', 'proficient') },
  { id: 'series-sage', title: 'Series Sage', blurb: 'Reach Proficient on every built lesson in Power and Taylor Series.', tier: 'gold', glyph: 'wave',
    test: (x) => x.moduleAtLeast('math1220.C2-5', 'proficient') },
  { id: 'vector-navigator', title: 'Vector Navigator', blurb: 'Reach Proficient on the vector lessons of Physics I.', tier: 'silver', glyph: 'vector',
    test: (x) => x.moduleAtLeast('phys2210.M2', 'proficient') },
  { id: 'newtonian-mechanic', title: 'Newtonian Mechanic', blurb: 'Reach Proficient across Newton’s laws and their applications.', tier: 'gold', glyph: 'apple',
    test: (x) => x.moduleAtLeast('phys2210.M5', 'proficient') && x.moduleAtLeast('phys2210.M6', 'proficient', 0.6) },
  { id: 'orbital-mechanic', title: 'Orbital Mechanic', blurb: 'Reach Proficient on gravitation and orbits.', tier: 'silver', glyph: 'orbit',
    test: (x) => x.moduleAtLeast('phys2210.M13', 'proficient') },
  { id: 'quantum-explorer', title: 'Quantum Explorer', blurb: 'Finish five lessons on quantum physics.', tier: 'silver', glyph: 'quantum',
    test: (x) => ['phys2710', 'phys4700', 'phys4710'].reduce((a, c) => a + x.completedIn(c), 0) >= 5,
    progress: (x) => [Math.min(5, ['phys2710', 'phys4700', 'phys4710'].reduce((a, c) => a + x.completedIn(c), 0)), 5] },
  { id: 'tensor-apprentice', title: 'Tensor Apprentice', blurb: 'Reach Proficient on index notation, covectors and the metric.', tier: 'gold', glyph: 'tensor',
    test: (x) => x.moduleAtLeast('st-a.A1', 'proficient') && x.moduleAtLeast('st-a.A3', 'proficient') && x.moduleAtLeast('st-a.A6', 'proficient') },
  { id: 'curvature-cartographer', title: 'Curvature Cartographer', blurb: 'Reach Proficient on intrinsic geometry: Theorema Egregium, geodesics, holonomy.', tier: 'gold', glyph: 'curvature',
    test: (x) => x.moduleAtLeast('st-c.C6', 'proficient') },
  { id: 'event-horizon', title: 'Event Horizon', blurb: 'Finish the black-hole fast track: proper time to light bending.', tier: 'gold', glyph: 'blackhole',
    test: (x) => ['gr.S09.i', 'gr.S12.i', 'gr.S20.i', 'gr.S23.i', 'gr.S21.i', 'gr.S22.i', 'gr.S24.i'].every((id) => x.st.lessons[id]?.completed),
    progress: (x) => [['gr.S09.i', 'gr.S12.i', 'gr.S20.i', 'gr.S23.i', 'gr.S21.i', 'gr.S22.i', 'gr.S24.i'].filter((id) => x.st.lessons[id]?.completed).length, 7] },
  { id: 'relativity-researcher', title: 'Relativity Researcher', blurb: 'Finish twenty steps of the Road to Einstein’s Field Equations, in either mode.', tier: 'cosmic', glyph: 'orbit',
    test: (x) => grSteps(x) >= 20, progress: (x) => [Math.min(20, grSteps(x)), 20] },
  { id: 'field-equations', title: 'Field Equations', blurb: 'Defeat the boss of the Road to Einstein’s Field Equations.', tier: 'cosmic', glyph: 'crown',
    test: (x) => x.bossPassed('gr') },

  // ── bosses ────────────────────────────────────────────────────────────
  { id: 'boss-1', title: 'Giant Slayer', blurb: 'Defeat your first boss battle.', tier: 'silver', glyph: 'sword',
    test: (x) => x.bossesPassed >= 1 },
  { id: 'boss-5', title: 'Boss Rush', blurb: 'Defeat five different boss battles.', tier: 'gold', glyph: 'sword',
    test: (x) => x.bossesPassed >= 5, progress: (x) => [Math.min(5, x.bossesPassed), 5] },
  { id: 'infinite-series', title: 'The Infinite Series Challenge', blurb: 'Defeat the Calculus II boss.', tier: 'gold', glyph: 'integral',
    test: (x) => x.bossPassed('math1220') },
  { id: 'mission-orbit', title: 'Mission to Orbit', blurb: 'Defeat the Physics I boss.', tier: 'gold', glyph: 'orbit',
    test: (x) => x.bossPassed('phys2210') },
];

function grSteps(x) {
  const done = new Set();
  for (const [id, l] of Object.entries(x.st.lessons)) {
    const m = /^gr\.S(\d\d)\.[id]$/.exec(id);
    if (m && l.completed) done.add(m[1]);
  }
  return done.size;
}

export { mods };
