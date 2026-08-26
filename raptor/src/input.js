// Input: keyboard + mouse, gamepad, and an axis layer that a HOTAS can be
// bound to later without touching anything downstream. Everything the sim
// consumes goes through `axes` and `actions`.

const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

export const KEYMAP = {
  pitchUp: ['KeyS', 'ArrowDown'],
  pitchDown: ['KeyW', 'ArrowUp'],
  rollLeft: ['KeyA', 'ArrowLeft'],
  rollRight: ['KeyD', 'ArrowRight'],
  yawLeft: ['KeyQ'],
  yawRight: ['KeyE'],
  throttleUp: ['ShiftLeft', 'ShiftRight', 'Equal'],
  throttleDown: ['ControlLeft', 'ControlRight', 'Minus'],
  brakes: ['Space'],
  speedbrake: ['KeyB'],
  gear: ['KeyG'],
  trimUp: ['BracketRight'],
  trimDown: ['BracketLeft'],
};

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.axes = { pitch: 0, roll: 0, yaw: 0, throttle: 0 };
    this.raw = { pitch: 0, roll: 0, yaw: 0 };
    this.mouseStick = false;
    this.mouseX = 0; this.mouseY = 0;
    this.dragging = false;
    this.pointerLocked = false;
    this.gamepadIndex = null;
    this.deadzone = 0.08;
    this.invertPitch = false;
    this.sensitivity = 1.0;
    this.listeners = new Map();
    this.lastDevice = 'keyboard';

    const el = canvas;
    this.el = el;

    window.addEventListener('keydown', (e) => {
      if (e.repeat) { return; }
      if (e.code === 'Tab') e.preventDefault();
      this.keys.add(e.code);
      this.lastDevice = 'keyboard';
      this.emit('key', e.code, e);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      if (e.button === 2 || (e.button === 0 && !this.mouseStick)) {
        this.dragging = true;
        this._lx = e.clientX; this._ly = e.clientY;
      }
      if (e.button === 0) this.emit('click', e);
    });
    el.addEventListener('pointerup', (e) => { this.dragging = false; });
    el.addEventListener('pointermove', (e) => {
      if (this.dragging) {
        this.emit('drag', e.clientX - this._lx, e.clientY - this._ly);
        this._lx = e.clientX; this._ly = e.clientY;
      }
      const r = el.getBoundingClientRect();
      this.mouseX = ((e.clientX - r.left) / r.width) * 2 - 1;
      this.mouseY = ((e.clientY - r.top) / r.height) * 2 - 1;
    });
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.emit('wheel', e.deltaY);
    }, { passive: false });

    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadIndex = e.gamepad.index;
      this.emit('gamepad', e.gamepad.id);
    });
    window.addEventListener('gamepaddisconnected', () => { this.gamepadIndex = null; });
  }

  on(evt, fn) {
    if (!this.listeners.has(evt)) this.listeners.set(evt, []);
    this.listeners.get(evt).push(fn);
  }
  emit(evt, ...args) {
    const l = this.listeners.get(evt);
    if (l) for (const f of l) f(...args);
  }

  held(action) {
    const codes = KEYMAP[action] || [];
    for (const c of codes) if (this.keys.has(c)) return true;
    return false;
  }

  _dz(v) {
    const a = Math.abs(v);
    if (a < this.deadzone) return 0;
    return Math.sign(v) * (a - this.deadzone) / (1 - this.deadzone);
  }

  update(dt) {
    // ---- keyboard axes with rate-limited return to centre ----
    const rate = 3.4 * this.sensitivity, back = 4.6;
    const step = (cur, want) => {
      if (want !== 0) return clamp(cur + want * rate * dt, -1, 1);
      if (cur > 0) return Math.max(0, cur - back * dt);
      if (cur < 0) return Math.min(0, cur + back * dt);
      return 0;
    };
    let wp = (this.held('pitchUp') ? 1 : 0) - (this.held('pitchDown') ? 1 : 0);
    let wr = (this.held('rollRight') ? 1 : 0) - (this.held('rollLeft') ? 1 : 0);
    let wy = (this.held('yawRight') ? 1 : 0) - (this.held('yawLeft') ? 1 : 0);
    this.raw.pitch = step(this.raw.pitch, wp);
    this.raw.roll = step(this.raw.roll, wr);
    this.raw.yaw = step(this.raw.yaw, wy);

    let pitch = this.raw.pitch, roll = this.raw.roll, yaw = this.raw.yaw;

    // ---- mouse as a centre stick ----
    if (this.mouseStick) {
      pitch = clamp(-this.mouseY * 1.25, -1, 1) * (this.invertPitch ? -1 : 1);
      roll = clamp(this.mouseX * 1.25, -1, 1);
      this.lastDevice = 'mouse';
    }

    // ---- throttle ----
    let dThr = (this.held('throttleUp') ? 1 : 0) - (this.held('throttleDown') ? 1 : 0);
    this.axes.throttle = clamp(this.axes.throttle + dThr * 0.55 * dt, 0, 1.5);

    // ---- gamepad overrides when it is actually being moved ----
    const gp = this.gamepadIndex !== null ? navigator.getGamepads()[this.gamepadIndex] : null;
    if (gp) {
      const lx = this._dz(gp.axes[0] || 0), ly = this._dz(gp.axes[1] || 0);
      const rx = this._dz(gp.axes[2] || 0);
      const lt = gp.buttons[6] ? gp.buttons[6].value : 0;
      const rt = gp.buttons[7] ? gp.buttons[7].value : 0;
      if (Math.abs(lx) + Math.abs(ly) + Math.abs(rx) > 0.02) this.lastDevice = 'gamepad';
      if (Math.abs(lx) > 0) roll = lx;
      if (Math.abs(ly) > 0) pitch = -ly * (this.invertPitch ? -1 : 1);
      if (Math.abs(rx) > 0) yaw = rx;
      if (rt > 0.02 || lt > 0.02) {
        this.axes.throttle = clamp(this.axes.throttle + (rt - lt) * 0.9 * dt, 0, 1.5);
      }
      this.gamepadButtons = gp.buttons.map(b => b.pressed);
      if (!this._prevButtons) this._prevButtons = this.gamepadButtons.slice();
      for (let i = 0; i < this.gamepadButtons.length; i++) {
        if (this.gamepadButtons[i] && !this._prevButtons[i]) this.emit('padbutton', i);
      }
      this._prevButtons = this.gamepadButtons.slice();
    }

    // exponential curve: fine around centre, full authority at the stops
    const expo = (v) => Math.sign(v) * (0.35 * Math.abs(v) + 0.65 * Math.pow(Math.abs(v), 3));
    this.axes.pitch = expo(clamp(pitch, -1, 1));
    this.axes.roll = expo(clamp(roll, -1, 1));
    this.axes.yaw = expo(clamp(yaw, -1, 1));
  }
}
