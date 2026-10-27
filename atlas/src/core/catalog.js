// The curriculum as a graph: tracks → courses → modules → lessons, with
// prerequisite edges at every level. Course index files (content/<id>/index.js)
// list every lesson the manifest plans; a lesson is "ready" when its index
// entry carries a `load` function for its module, "planned" otherwise.

export const TRACKS = [
  { id: 'math', title: 'Mathematics', blurb: 'From algebra to differential equations — the language every later course is written in.' },
  { id: 'physics', title: 'Physics', blurb: 'The Professional Emphasis core, from Newton to quantum mechanics.' },
  { id: 'experimental', title: 'Experimental Physics', blurb: 'Measurement, uncertainty, virtual experiments and research.' },
  { id: 'computing', title: 'Scientific Computing', blurb: 'Python and the numerical methods physicists use daily.' },
  { id: 'spacetime', title: 'Mathematics of Spacetime', blurb: 'Tensors, geometry, PDEs and analysis — the mathematics of general relativity.' },
  { id: 'gr', title: 'General Relativity', blurb: 'The Road to Einstein’s Field Equations, in Intuition and Derivation modes.' },
];

export const PROVENANCE = {
  'usu-required': { label: 'USU required', tone: 'req', blurb: 'Required by the Physics: Professional Emphasis B.S.' },
  'usu-entry': { label: 'USU entry requirement', tone: 'req', blurb: 'Required before admission to a USU physics program.' },
  'usu-reconstructed': { label: 'USU required (reconstructed)', tone: 'recon', blurb: 'Very probably required; the catalog rows for this block could not be read, so this placement is reconstructed.' },
  'usu-course': { label: 'USU course, not required', tone: 'usu', blurb: 'A real USU course that this degree does not require.' },
  supplementary: { label: 'Supplementary', tone: 'supp', blurb: 'Beyond USU’s catalog — added for the road to general relativity.' },
};

/**
 * Build lookup tables from course definitions.
 * @param {object[]} courses course index objects
 */
export function buildCatalog(courses) {
  const cat = { courses: [], byId: {}, modules: {}, lessons: {}, order: [] };
  for (const c of courses) {
    const course = { prereqs: [], modules: [], ...c };
    cat.courses.push(course);
    cat.byId[course.id] = course;
    course.lessonIds = [];
    course.modules.forEach((m, mi) => {
      const mid = `${course.id}.${m.id}`;
      const mod = { ...m, key: mid, course: course.id, index: mi, prereqs: m.prereqs || [], lessonIds: [] };
      cat.modules[mid] = mod;
      (m.lessons || []).forEach((l, li) => {
        const id = l.id || `${mid}.${l.n ?? li + 1}`;
        const prev = li > 0 && !m.independent ? mod.lessonIds[li - 1] : null;
        const lesson = {
          minutes: 6, difficulty: 2, ...l, id, course: course.id, module: mid, index: cat.order.length,
          // a lesson needs the lesson before it in its module, plus whatever it lists
          prereqs: [...(prev ? [prev] : []), ...(l.prereqs || [])],
          ready: typeof l.load === 'function',
        };
        cat.lessons[id] = lesson;
        mod.lessonIds.push(id);
        course.lessonIds.push(id);
        cat.order.push(id);
      });
    });
  }
  // alias modules (refs) borrow the lessons of the modules they point at
  for (const mod of Object.values(cat.modules)) {
    if (!mod.refs) continue;
    for (const r of mod.refs) {
      const target = cat.modules[r];
      if (!target) continue;
      mod.lessonIds.push(...target.lessonIds);
      cat.byId[mod.course].lessonIds.push(...target.lessonIds);
    }
  }
  // a lesson may name a whole module as a prerequisite: that means its last lesson
  for (const lesson of Object.values(cat.lessons)) {
    lesson.prereqs = lesson.prereqs.map((p) => {
      if (cat.lessons[p]) return p;
      const m = cat.modules[p];
      return m && m.lessonIds.length ? m.lessonIds[m.lessonIds.length - 1] : p;
    });
  }
  // first lessons of a module inherit the module's prerequisites (their last lessons)
  for (const mod of Object.values(cat.modules)) {
    if (mod.independent || mod.refs) continue;
    const first = cat.lessons[mod.lessonIds[0]];
    if (!first) continue;
    for (const pm of mod.prereqs) {
      const m = cat.modules[pm];
      if (m && m.lessonIds.length) first.prereqs.push(m.lessonIds[m.lessonIds.length - 1]);
      else if (cat.lessons[pm]) first.prereqs.push(pm);
    }
  }
  return cat;
}

/** Problems in the catalog graph: dangling references and cycles. */
export function validateCatalog(cat) {
  const p = [];
  for (const c of cat.courses) {
    for (const pre of c.prereqs) if (!cat.byId[pre]) p.push(`course ${c.id} needs unknown course ${pre}`);
    if (!c.title || !c.track) p.push(`course ${c.id} needs a title and a track`);
    if (!PROVENANCE[c.provenance]) p.push(`course ${c.id} has unknown provenance ${c.provenance}`);
  }
  for (const m of Object.values(cat.modules)) {
    for (const pre of m.prereqs) if (!cat.modules[pre] && !cat.lessons[pre]) p.push(`module ${m.key} needs unknown ${pre}`);
  }
  for (const l of Object.values(cat.lessons)) {
    for (const pre of l.prereqs) if (!cat.lessons[pre]) p.push(`lesson ${l.id} needs unknown lesson ${pre}`);
  }
  // cycle check (iterative DFS)
  const color = {};
  for (const start of Object.keys(cat.lessons)) {
    if (color[start]) continue;
    const stack = [[start, 0]];
    color[start] = 1;
    while (stack.length) {
      const top = stack[stack.length - 1];
      const pre = cat.lessons[top[0]].prereqs;
      if (top[1] < pre.length) {
        const nx = pre[top[1]++];
        if (!cat.lessons[nx]) continue;
        if (color[nx] === 1) { p.push(`prerequisite cycle through ${nx}`); continue; }
        if (!color[nx]) { color[nx] = 1; stack.push([nx, 0]); }
      } else { color[top[0]] = 2; stack.pop(); }
    }
  }
  return p;
}
