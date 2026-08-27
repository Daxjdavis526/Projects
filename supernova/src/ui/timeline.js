/* =============================================================================
   TIMELINE — transport controls and the phase-aware scrub bar
   -----------------------------------------------------------------------------
   The bar is the narrative coordinate u, not time: every phase is a visible,
   labelled, reachable stretch of it. Phase boundaries are drawn as ticks so
   the nonlinearity is legible rather than hidden.
   ========================================================================== */

export class Timeline {
  constructor(clock, engine, onSeek) {
    this.clock = clock;
    this.engine = engine;
    this.onSeek = onSeek;
    this.$ = id => document.getElementById(id);

    this.bar = this.$('tl-bar');
    this.fill = this.$('tl-fill');
    this.handle = this.$('tl-handle');

    this._buildTicks();
    this._bind();
  }

  _buildTicks() {
    const ticks = this.$('tl-ticks');
    ticks.innerHTML = '';
    for (const s of this.clock.segments) {
      const d = document.createElement('div');
      d.className = 'tl-tick';
      d.style.left = (s.u0 * 100) + '%';
      d.title = s.phase;
      ticks.appendChild(d);
      const lb = document.createElement('div');
      lb.className = 'tl-lab';
      lb.style.left = ((s.u0 + s.u1) / 2 * 100) + '%';
      lb.textContent = s.phase;
      ticks.appendChild(lb);
    }
  }

  _bind() {
    const seekFromEvent = e => {
      const r = this.bar.getBoundingClientRect();
      const u = (e.clientX - r.left) / r.width;
      this.clock.seekU(u);
      this.onSeek?.();
    };
    let dragging = false;
    this.bar.addEventListener('mousedown', e => { dragging = true; seekFromEvent(e); e.preventDefault(); });
    addEventListener('mousemove', e => { if (dragging) seekFromEvent(e); });
    addEventListener('mouseup', () => { dragging = false; });

    this.$('tl-play').addEventListener('click', () => this.toggle());
    this.$('tl-restart').addEventListener('click', () => { this.clock.seekU(0); this.onSeek?.(); });
    for (const [id, u] of [['jump-collapse', 0.135], ['jump-explosion', 0.50], ['jump-remnant', 0.90]]) {
      this.$(id)?.addEventListener('click', () => { this.clock.seekU(u); this.onSeek?.(); this.clock.play(); this._sync(); });
    }
    this._sync();
  }

  toggle() {
    if (this.clock.playing) this.clock.pause(); else this.clock.play(this.clock.mode === 'physical' ? 'physical' : 'narrative');
    this._sync();
  }

  _sync() { this.$('tl-play').textContent = this.clock.playing ? '⏸' : '▶'; }

  update() {
    const pct = (this.clock.u * 100).toFixed(3) + '%';
    this.fill.style.width = pct;
    this.handle.style.left = pct;
    if (!this.clock.playing) this._sync();
  }
}
