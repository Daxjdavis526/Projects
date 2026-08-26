/* =============================================================================
   LIGHT CURVE — the little plot that carries the whole photometric story
   -----------------------------------------------------------------------------
   log L against the NARRATIVE coordinate, so the breakout spike, the 100-day
   plateau and the straight cobalt tail are all visible at once — on a linear
   time axis the plateau would be one pixel and the collapse invisible. Phase
   ticks come from the same segment table as the scrub bar, so the two axes
   line up and teach each other.

   Samples accumulate as the simulation runs; a backward seek truncates.
   ========================================================================== */

export class LightCurve {
  constructor(clock) {
    this.clock = clock;
    this.canvas = document.getElementById('lc-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.samples = [];          // [u, log10 L]
    this._lastU = -1;
    this.LMIN = 36, this.LMAX = 46;
    const dpr = Math.min(devicePixelRatio, 2);
    this.canvas.width = 236 * dpr; this.canvas.height = 92 * dpr;
    this.ctx.scale(dpr, dpr);
  }

  push(snap) {
    const u = this.clock.u;
    if (u < this._lastU - 1e-6) {
      /* backward seek: truncate the future */
      const cut = this.samples.findIndex(s => s[0] > u);
      if (cut >= 0) this.samples.length = cut;
    }
    if (u - this._lastU > 0.0015 && snap.L_em > 0) {
      this.samples.push([u, Math.log10(snap.L_em)]);
      this._lastU = u;
    } else if (u < this._lastU) this._lastU = u;
  }

  draw() {
    const c = this.ctx, W = 236, H = 92;
    c.clearRect(0, 0, W, H);

    /* frame + phase ticks */
    c.strokeStyle = 'rgba(215,211,204,0.18)';
    c.lineWidth = 1;
    c.strokeRect(0.5, 0.5, W - 1, H - 1);
    for (const s of this.clock.segments) {
      const x = s.u0 * W;
      c.beginPath(); c.moveTo(x, H - 6); c.lineTo(x, H); c.stroke();
    }
    /* faint decade rules */
    c.strokeStyle = 'rgba(215,211,204,0.07)';
    for (let L = this.LMIN + 2; L < this.LMAX; L += 2) {
      const y = H - ((L - this.LMIN) / (this.LMAX - this.LMIN)) * H;
      c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
    }

    /* the curve */
    if (this.samples.length > 1) {
      c.strokeStyle = 'rgba(255,179,71,0.9)';
      c.lineWidth = 1.4;
      c.beginPath();
      let started = false;
      for (const [u, lL] of this.samples) {
        const x = u * W;
        const y = H - Math.min(Math.max((lL - this.LMIN) / (this.LMAX - this.LMIN), 0), 1) * H;
        if (!started) { c.moveTo(x, y); started = true; } else c.lineTo(x, y);
      }
      c.stroke();

      /* current point */
      const [u, lL] = this.samples[this.samples.length - 1];
      const x = u * W;
      const y = H - Math.min(Math.max((lL - this.LMIN) / (this.LMAX - this.LMIN), 0), 1) * H;
      c.fillStyle = '#fff6ec';
      c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill();
    }

    /* labels */
    c.fillStyle = 'rgba(124,119,112,0.9)';
    c.font = '8px "IBM Plex Mono", monospace';
    c.fillText('10⁴⁶', 4, 9);
    c.fillText('10³⁶', 4, H - 3);
  }
}
