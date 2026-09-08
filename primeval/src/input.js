// Keyboard, mouse and pointer lock. Nothing else in the game reads the DOM
// for input, so rebinding or adding a gamepad later happens only here.

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();       // keys that went down this frame
    this.released = new Set();
    this.mouse = { dx: 0, dy: 0, wheel: 0 };
    this.buttons = [false, false, false];
    this.clicked = [false, false, false];
    this.locked = false;
    this.sensitivity = 0.0022;
    this.invertY = false;
    this.enabled = true;
    this._onLock = null;

    addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.code === 'Tab' || (e.code === 'Space' && this.locked)) e.preventDefault();
      this.keys.add(e.code);
      this.pressed.add(e.code);
    });
    addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      this.released.add(e.code);
    });
    addEventListener('blur', () => { this.keys.clear(); this.buttons = [false, false, false]; });

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
      if (this._onLock) this._onLock(this.locked);
    });
    canvas.addEventListener('mousedown', (e) => {
      if (!this.locked) return;
      this.buttons[e.button] = true;
      this.clicked[e.button] = true;
    });
    addEventListener('mouseup', (e) => { this.buttons[e.button] = false; });
    addEventListener('mousemove', (e) => {
      if (!this.locked || !this.enabled) return;
      this.mouse.dx += e.movementX || 0;
      this.mouse.dy += e.movementY || 0;
    });
    addEventListener('wheel', (e) => {
      if (this.locked) { e.preventDefault(); this.mouse.wheel += Math.sign(e.deltaY); }
    }, { passive: false });
    addEventListener('contextmenu', (e) => { if (this.locked) e.preventDefault(); });
  }

  requestLock() {
    const p = this.canvas.requestPointerLock?.();
    if (p && p.catch) p.catch(() => {});
  }
  exitLock() { document.exitPointerLock?.(); }
  onLockChange(fn) { this._onLock = fn; }

  down(code) { return this.keys.has(code); }
  any(codes) { for (const c of codes) if (this.keys.has(c)) return true; return false; }
  hit(code) { return this.pressed.has(code); }
  anyHit(codes) { for (const c of codes) if (this.pressed.has(c)) return true; return false; }
  click(b = 0) { return this.clicked[b]; }
  held(b = 0) { return this.buttons[b]; }

  /** Movement intent in local space: x = strafe, z = forward. */
  moveAxis() {
    let x = 0, z = 0;
    if (this.down('KeyW') || this.down('ArrowUp')) z += 1;
    if (this.down('KeyS') || this.down('ArrowDown')) z -= 1;
    if (this.down('KeyD') || this.down('ArrowRight')) x += 1;
    if (this.down('KeyA') || this.down('ArrowLeft')) x -= 1;
    const l = Math.hypot(x, z);
    return l > 1 ? { x: x / l, z: z / l } : { x, z };
  }

  /** Call once at the end of every frame. */
  endFrame() {
    this.pressed.clear();
    this.released.clear();
    this.mouse.dx = 0; this.mouse.dy = 0; this.mouse.wheel = 0;
    this.clicked[0] = this.clicked[1] = this.clicked[2] = false;
  }
}
