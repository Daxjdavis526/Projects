/* ============================================================================
   picking.js — screen-space object picking
   ----------------------------------------------------------------------------
   Every registry object gets projected each frame anyway (for labels), so
   picking is a cheap 2D nearest-hit test: click radius grows with an object's
   rendered size, ties break by priority. No raycasting needed at any scale.
   ========================================================================== */
export function pick(registry, x, y, ctx) {
  let best = null, bestScore = Infinity;
  for (const o of registry) {
    if (o._behind || o._sx === undefined) continue;
    const r = Math.max(16, (o._px ?? 0) * 0.5);
    if (r > ctx.cssH * 0.6) continue;               // inside/enveloping: not clickable
    const d = Math.hypot(o._sx - x, o._sy - y);
    if (d > r) continue;
    const score = d - o.priority * 2;
    if (score < bestScore) { bestScore = score; best = o; }
  }
  return best;
}
