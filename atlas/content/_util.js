// Shorthand for course index files.
//   mod('C2-2', 'Techniques of integration', [ 'Integration by parts', { title: '…', minutes: 8 } ])
// A lesson is "ready" once its file exists (content/<course>/C2-2.1.js) and
// `node atlas/tools/register.mjs` has listed it in content/loads.js.

export function mod(id, title, lessons, extra = {}) {
  return {
    id, title, ...extra,
    lessons: lessons.map((l, i) => (typeof l === 'string' ? { n: i + 1, title: l } : { n: i + 1, ...l })),
  };
}

/** A lesson entry with explicit fields. */
export const L = (title, extra = {}) => ({ title, ...extra });
