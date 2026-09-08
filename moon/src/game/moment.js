/* =============================================================================
   MOMENT — the first time you stand on it, and the times it goes wrong
   -----------------------------------------------------------------------------
   Two short scripted beats and nothing else. The game has no story and does not
   want one; what it has is a place, and these exist to give the place a second
   of room rather than to explain it.

   The first is stepping off the ladder. It says where you are, what the ground
   under you is, and how far from home the Earth is, and then it goes away. The
   numbers in it are the real ones for wherever you actually landed, which is
   the point: it is not a cutscene, it is a caption.

   The second is losing consciousness, which is where the honesty about failure
   has to be careful. Oxygen running out on the Moon has a real and well
   documented sequence and none of it is shown here: what the game does is take
   the screen to black and offer to bring you home. That is a game convention
   and it is labelled as one. Nothing about it pretends to be a simulation.
   ========================================================================== */

const el = (id) => document.getElementById(id);

export class Moment {
  constructor() {
    this.root = el('moment');
    this.shown = new Set();
    this.hideAt = 0;
  }

  /**
   * @param {string} id shown once per session
   * @param {object} lines { title, a, b, seconds }
   */
  show(id, lines) {
    if (this.shown.has(id) || !this.root) return false;
    this.shown.add(id);
    el('moment-title').textContent = lines.title || '';
    el('moment-1').textContent = lines.a || '';
    el('moment-2').textContent = lines.b || '';
    this.root.style.display = 'flex';
    /* One frame so the transition has something to animate from. */
    requestAnimationFrame(() => this.root.classList.add('show'));
    this.hideAt = performance.now() + (lines.seconds ?? 11) * 1000;
    return true;
  }

  update(now) {
    if (!this.hideAt || now < this.hideAt || !this.root) return;
    this.hideAt = 0;
    this.root.classList.remove('show');
    setTimeout(() => { if (!this.hideAt) this.root.style.display = 'none'; }, 2600);
  }

  /**
   * The caption for arriving. Everything in it is read off where you actually
   * are rather than written in advance.
   */
  firstStep(info) {
    const lat = `${Math.abs(info.lat).toFixed(4)}° ${info.lat >= 0 ? 'N' : 'S'}`;
    const lon = `${Math.abs(info.lon).toFixed(4)}° ${info.lon >= 0 ? 'E' : 'W'}`;
    const where = info.feature ? info.feature : 'unnamed ground';
    const earth = info.earthVisible
      ? `The Earth is ${info.earthEl.toFixed(0)} degrees above the horizon, ${(info.earthDist / 1000).toFixed(0)} thousand kilometres away, and everyone you have ever known is on it.`
      : 'The Earth is not in the sky here, and will not be. This is the far side.';
    return this.show('firstStep', {
      title: where.toUpperCase(),
      a: `${lat}  ${lon} · ${info.elevation.toFixed(0)} m · ${info.unit || 'regolith'}`,
      b: earth,
      seconds: 14,
    });
  }
}
