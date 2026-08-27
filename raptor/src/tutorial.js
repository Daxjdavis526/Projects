// Guided tutorial.
//
// A small state machine over the live simulation: each step shows one
// instruction and watches the flight model until you have actually done the
// thing. Nothing is scripted or faked — the checks read the same state the
// HUD does, so passing a step means you really flew it.

const M_TO_FT = 3.28084;
const MS_TO_KT = 1.94384;

export const STEPS = [
  {
    id: 'look',
    title: 'Look around',
    text: 'Press <kbd>2</kbd> for the chase camera, then <kbd>1</kbd> to come back to the cockpit. Drag the mouse to look around.',
    hint: 'Both views fly identically — the physics never changes.',
    check: (s) => s.sawCockpit && s.sawChase,
  },
  {
    id: 'throttle',
    title: 'Run the engines up',
    text: 'Hold <kbd>Shift</kbd> until the throttle passes 100% and the afterburners light.',
    hint: 'THR in the corner shows AB when they light. Hold the brakes with <kbd>Space</kbd> if you want to feel it build.',
    check: (s) => s.prop.throttle > 1.02,
  },
  {
    id: 'roll',
    title: 'Takeoff roll',
    text: 'Release the brakes and keep straight down the centreline with <kbd>Q</kbd> and <kbd>E</kbd>.',
    hint: 'Q and E steer the nosewheel below about 90 knots, and become the rudder above it.',
    check: (s) => s.fm.tas > 55,
  },
  {
    id: 'rotate',
    title: 'Rotate',
    text: 'Passing 150 knots, ease back on <kbd>S</kbd> and let her fly off.',
    hint: 'Gently. Ten to fifteen degrees nose up is plenty.',
    check: (s) => !s.fm.onGround && s.fm.altAGL > 25,
  },
  {
    id: 'gear',
    title: 'Gear up',
    text: 'Press <kbd>G</kbd> to raise the landing gear.',
    hint: 'The gear costs you a lot of drag, and it comes apart above 300 knots.',
    check: (s) => s.fm.gearPos < 0.05,
  },
  {
    id: 'climb',
    title: 'Climb',
    text: 'Climb to 10,000 feet. Roll with <kbd>A</kbd> and <kbd>D</kbd>, pull with <kbd>S</kbd>.',
    hint: 'Bank first, then pull — that is how an aeroplane turns. Pulling without banking just climbs.',
    check: (s) => s.fm.position.y * M_TO_FT > 10000,
  },
  {
    id: 'turn',
    title: 'Turn ninety degrees',
    text: 'Roll into a bank of at least 45° and hold it until your heading has changed by 90°.',
    hint: 'Watch the g on the HUD. Past about 5 g your vision starts to grey out.',
    check: (s) => s.turnedDegrees > 90,
  },
  {
    id: 'supercruise',
    title: 'Supercruise',
    text: 'Climb above 30,000 ft, pull the throttle back to military power with <kbd>Ctrl</kbd>, and hold Mach 1.',
    hint: 'Supersonic without afterburner is the whole point of this aeroplane. It will take a couple of minutes.',
    check: (s) => s.fm.mach > 1.0 && s.prop.throttle <= 1.02,
  },
  {
    id: 'camera',
    title: 'Fly it from outside',
    text: 'Press <kbd>C</kbd> a few times to cycle the cameras. Try <kbd>7</kbd> for the flyby and <kbd>6</kbd> for cinematic.',
    hint: 'Drag to orbit, wheel to zoom. <kbd>Tab</kbd> has sliders for distance, lag and shake.',
    check: (s) => s.camerasSeen >= 4,
  },
  {
    id: 'boom',
    title: 'Break the sound barrier over someone',
    text: 'Get down low and supersonic, then press <kbd>O</kbd> to drop a ground observer and fly past it.',
    hint: 'You will pass in silence. The boom arrives afterwards — that is the point.',
    check: (s) => s.boomHeard,
  },
  {
    id: 'nav',
    title: 'Navigate',
    text: 'Press <kbd>M</kbd> for the map and click an airfield to set it as your waypoint.',
    hint: 'The waypoint shows on the HUD and on the centre display. <kbd>F</kbd> lets the autopilot fly it.',
    check: (s) => s.nav.waypoint !== null && s.setWaypoint,
  },
  {
    id: 'land',
    title: 'Bring her home',
    text: 'Fly to a runway, gear down with <kbd>G</kbd>, speedbrake on <kbd>B</kbd>, and land.',
    hint: 'Cross the threshold at about 150 knots with the flight path marker on the touchdown zone.',
    check: (s) => s.landed,
  },
];

export class Tutorial {
  constructor(ui) {
    this.ui = ui;
    this.active = false;
    this.index = 0;
    this.state = {
      sawCockpit: false, sawChase: false, camerasSeen: 0,
      boomHeard: false, setWaypoint: false, landed: false,
      turnedDegrees: 0, _lastHeading: null, _seenCameras: new Set(),
    };
    this._holdTimer = 0;
    this._doneFlash = 0;
  }

  get step() { return STEPS[this.index]; }

  start(fromStep = 0) {
    this.active = true;
    this.index = fromStep;
    this.resetProgress();
    this.render();
    this.ui.panel.classList.add('open');
  }

  stop() {
    this.active = false;
    this.ui.panel.classList.remove('open');
    try { localStorage.setItem('raptor.tutorialDone', '1'); } catch (e) { /* ignore */ }
  }

  resetProgress() {
    const s = this.state;
    s.camerasSeen = 0; s._seenCameras.clear();
    s.boomHeard = false; s.setWaypoint = false; s.landed = false;
    s.turnedDegrees = 0; s._lastHeading = null;
  }

  next() {
    if (this.index >= STEPS.length - 1) { this.finish(); return; }
    this.index++;
    this.resetProgress();
    this.render();
  }

  back() {
    if (this.index === 0) return;
    this.index--;
    this.resetProgress();
    this.render();
  }

  finish() {
    this.ui.title.textContent = 'Checked out';
    this.ui.text.innerHTML = 'That is the whole aeroplane. Go and fly it.';
    this.ui.hint.innerHTML = '';
    this.ui.progress.style.width = '100%';
    this._doneFlash = 4;
  }

  // --- events fed in from the sim ---
  noteCamera(mode) {
    if (!this.active) return;
    const s = this.state;
    if (mode === 'cockpit') s.sawCockpit = true;
    if (mode.startsWith('chase')) s.sawChase = true;
    s._seenCameras.add(mode);
    s.camerasSeen = s._seenCameras.size;
  }
  noteBoom() { if (this.active) this.state.boomHeard = true; }
  noteWaypoint() { if (this.active) this.state.setWaypoint = true; }
  noteLanding() { if (this.active) this.state.landed = true; }

  update(dt, fm, prop, nav) {
    if (!this.active) return;
    if (this._doneFlash > 0) {
      this._doneFlash -= dt;
      if (this._doneFlash <= 0) this.stop();
      return;
    }

    // track cumulative heading change for the turn step
    const s = this.state;
    if (s._lastHeading === null) s._lastHeading = fm.heading;
    let d = fm.heading - s._lastHeading;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    if (Math.abs(fm.bankAngle) > 40 * Math.PI / 180) s.turnedDegrees += Math.abs(d);
    s._lastHeading = fm.heading;

    const ctx = { fm, prop, nav, ...s };
    let ok = false;
    try { ok = !!this.step.check(ctx); } catch (e) { ok = false; }

    // a step has to stay satisfied for a moment, so a single frame of noise
    // does not tick it off
    this._holdTimer = ok ? this._holdTimer + dt : 0;
    const need = 0.4;
    this.ui.progress.style.width = `${Math.min(100, this._holdTimer / need * 100)}%`;
    if (this._holdTimer >= need) {
      this._holdTimer = 0;
      this.ui.card.classList.add('done');
      setTimeout(() => this.ui.card.classList.remove('done'), 450);
      this.next();
    }
  }

  render() {
    const st = this.step;
    this.ui.title.textContent = st.title;
    this.ui.text.innerHTML = st.text;
    this.ui.hint.innerHTML = st.hint || '';
    this.ui.count.textContent = `${this.index + 1} / ${STEPS.length}`;
    this.ui.progress.style.width = '0%';
  }
}
