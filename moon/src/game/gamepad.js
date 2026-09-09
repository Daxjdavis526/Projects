/* =============================================================================
   GAMEPAD — the same controls, with sticks
   -----------------------------------------------------------------------------
   Nothing here is a second input model. The keyboard produces a set of held
   keys and a mouse delta; this produces the same two things from a pad, and
   everything downstream is unchanged. That is deliberate: two code paths for
   "am I moving forward" is how one of them ends up subtly different from the
   other, and the physics should not be able to tell which hand is on it.

   The standard mapping is what browsers report for anything that looks like an
   Xbox controller, which is nearly everything:

     axes 0,1   left stick    walk and strafe, or throttle and steer
     axes 2,3   right stick   look
     button 0   A             jump / brake
     button 1   B             lamps
     button 2   X             jetpack
     button 3   Y             view
     buttons 4,5 bumpers      board the rover / the ship hatch
     buttons 6,7 triggers     run or boost
     button 9   start         controls

   Sticks are analogue and the keyboard is not, so the analogue value is passed
   through where the physics takes one — walking gently is a real thing a stick
   can ask for and a key cannot — and thresholded where it does not.

   Deadzones are radial rather than per-axis, because a per-axis deadzone makes
   a stick pushed diagonally feel like it is snapping to the axes.
   ========================================================================== */

const DEADZONE = 0.16;
/* Degrees per second at full deflection. A stick is a rate control and a mouse
   is a position one, so this is a speed rather than a sensitivity. */
const LOOK_RATE = 180;
const LOOK_RATE_PITCH = 120;

/* Which button does what. Named rather than numbered at the call site so the
   mapping is readable and changing a pad means changing one table. */
export const PAD = {
  jump: 0, lamps: 1, jet: 2, view: 3,
  board: 4, hatch: 5,
  runL: 6, runR: 7,
  help: 9,
};

const dead = (x, y) => {
  const m = Math.hypot(x, y);
  if (m < DEADZONE) return { x: 0, y: 0, m: 0 };
  /* Rescale so the first movement past the deadzone is small rather than a
     step: at the edge of the zone the output is zero, not 0.16. */
  const k = (m - DEADZONE) / (1 - DEADZONE) / m;
  return { x: x * k, y: y * k, m: (m - DEADZONE) / (1 - DEADZONE) };
};

export class Gamepads {
  constructor() {
    this.was = new Map();          // index -> pressed buttons last frame
    this.connected = false;
  }

  /** Whatever the browser is reporting, or an empty list. */
  static list() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return [];
    return [...navigator.getGamepads()].filter(Boolean);
  }

  /**
   * Read every pad and fold them into one state.
   *
   * @param {number} dt seconds, for the look rate
   * @returns {{
   *   connected: boolean, forward: number, strafe: number,
   *   lookYaw: number, lookPitch: number, run: boolean,
   *   held: Set<string>, pressed: Set<string>
   * }}  `held` is what is down now; `pressed` is what went down this frame,
   *     which is what a toggle wants.
   */
  read(dt) {
    const out = {
      connected: false, forward: 0, strafe: 0, lookYaw: 0, lookPitch: 0,
      run: false, held: new Set(), pressed: new Set(),
    };
    const pads = Gamepads.list();
    if (!pads.length) { this.connected = false; return out; }
    out.connected = true;
    this.connected = true;

    for (const p of pads) {
      const ax = p.axes || [];
      const move = dead(ax[0] || 0, ax[1] || 0);
      /* Up on a stick is negative, and forward is positive. */
      out.forward += -move.y;
      out.strafe += move.x;
      const look = dead(ax[2] || 0, ax[3] || 0);
      out.lookYaw += look.x * LOOK_RATE * dt;
      out.lookPitch += -look.y * LOOK_RATE_PITCH * dt;

      const prev = this.was.get(p.index) || new Set();
      const now = new Set();
      for (const [name, i] of Object.entries(PAD)) {
        const b = p.buttons && p.buttons[i];
        const down = !!(b && (b.pressed || b.value > 0.5));
        if (!down) continue;
        now.add(name);
        out.held.add(name);
        if (!prev.has(name)) out.pressed.add(name);
      }
      this.was.set(p.index, now);
      if (now.has('runL') || now.has('runR')) out.run = true;
    }
    /* Two pads pushing the same way must not add up to two. */
    out.forward = Math.max(-1, Math.min(1, out.forward));
    out.strafe = Math.max(-1, Math.min(1, out.strafe));
    return out;
  }
}
