/* =============================================================================
   DEVICE — how much machine is on the other end
   -----------------------------------------------------------------------------
   Two separate questions, deliberately kept apart:

     SMALL   is about LAYOUT, and matches the CSS breakpoint exactly. If these
             two ever disagree the UI ends up half phone and half desktop, so
             the number 860 lives in one place conceptually and is written in
             both — change it here and in index.html together.

     LIGHT   is about WORK. A phone GPU drawing a 13^3 lattice at device pixel
             ratio 3 is doing nine times the fragment work of a laptop for a
             ninth of the budget. This is what the expensive modes scale
             themselves by.

   A tablet in landscape is wide enough for the desktop layout and still wants
   the lighter quality tier, which is why one is not defined in terms of the
   other.
   ========================================================================== */

const mq = (q) => (typeof matchMedia === 'function' ? matchMedia(q).matches : false);

export const SMALL = mq('(max-width: 860px)');
export const COARSE = mq('(pointer: coarse)');

/* Scale work down for touch devices and for anything narrow. */
export const LIGHT = SMALL || COARSE;

/* Pick between a light-tier value and a full one. */
export const q = (light, full) => (LIGHT ? light : full);

/* Rendering at three device pixels per CSS pixel triples the fill cost for a
   difference nobody can see on a 6-inch screen at arm's length. */
export const maxPixelRatio = LIGHT ? 1.75 : 2;
