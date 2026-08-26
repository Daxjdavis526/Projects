/* ============================================================================
   tour.js — the guided cosmic journey
   ----------------------------------------------------------------------------
   A scripted chain of flyTo waypoints with captions. Each step: fly (locked
   against accidental input), dwell with caption, continue. Esc or the End
   button stops it; the camera simply stays where it is.
   ========================================================================== */
const $ = s => document.querySelector(s);

const STOPS = [
  ['earth', 7.5, 'Earth',
    'Home. A rocky world 12,742 km across, the only place in the universe where we know anyone is watching.', 6],
  ['moon', 9.0, 'The Earth–Moon System',
    'Light takes 1.3 seconds to cross this gap. It is the farthest any human has ever traveled.', 6],
  ['sun', 11.95, 'The Inner Solar System',
    'Four rocky worlds huddle near the Sun’s warmth. The distances between them are already millions of kilometers.', 7],
  ['sun', 13.6, 'The Realm of the Giants',
    'The four giant planets orbit in the cold dark, shepherding the asteroid belt inside and the Kuiper Belt beyond.', 7],
  ['sun', 14.6, 'The Heliosphere',
    'The bubble blown by the solar wind — the Sun’s sphere of influence. Voyager 1, our farthest emissary, has just crossed its edge.', 6],
  ['sun', 16.5, 'The Oort Cloud',
    'A trillion sleeping comets, reaching a substantial fraction of the way to the next star. The Sun’s light here is just another bright star.', 6],
  ['sun', 17.9, 'The Solar Neighborhood',
    'Every star you have ever seen with your own eyes lives within this view — our few thousand nearest neighbors.', 7],
  ['neb:Orion Nebula (M42)', 17.6, 'The Orion Nebula',
    'A stellar nursery 1,300 light-years away: a cavern of glowing gas where a thousand new stars are switching on.', 7],
  ['milkyway', 21.4, 'The Milky Way',
    'Our galaxy: hundreds of billions of stars in a slow 230-million-year rotation. The Sun is one point of light, two-thirds of the way out.', 9],
  ['localgroup', 23.4, 'The Local Group',
    'Galaxies come in families. Ours has two great spirals — the Milky Way and Andromeda — falling gently toward each other.', 8],
  ['cl:Virgo Cluster', 24.55, 'The Virgo Cluster',
    'Fifteen hundred galaxies swarming in our nearest great cluster. Its gravity tugs on the entire Local Group.', 7],
  ['laniakea', 25.4, 'Laniakea',
    '"Immeasurable heaven" — one hundred thousand galaxies streaming together toward the Great Attractor.', 8],
  ['observable', 26.35, 'The Cosmic Web',
    'At the largest scales, galaxies trace a glowing foam: filaments and walls around vast dark voids. This is the architecture of everything.', 9],
  ['observable', 27.05, 'The Observable Universe',
    'Ninety-three billion light-years, two trillion galaxies, one horizon of ancient light — and somewhere inside it, one small blue world. Welcome home.', 12],
];

export class Tour {
  constructor(rig, registry, hooks) {
    this.rig = rig;
    this.registry = registry;
    this.hooks = hooks;          // {onStart, onStop}
    this.active = false;
    this.step = -1;
    this.dwell = 0;
    this.state = 'idle';
    $('#tourStop').onclick = () => this.stop();
  }
  start() {
    if (this.active) return;
    this.active = true;
    this.step = -1;
    $('#tourStop').style.display = 'block';
    this.hooks.onStart();
    this._next();
  }
  stop() {
    if (!this.active) return;
    this.active = false;
    this.state = 'idle';
    if (this.rig.fly && this.rig.fly.locked) this.rig.fly = null;
    $('#caption').classList.remove('on');
    $('#tourStop').style.display = 'none';
    this.hooks.onStop();
  }
  _next() {
    this.step++;
    if (this.step >= STOPS.length) { this.stop(); return; }
    const [id, logD, title, text, dwell] = STOPS[this.step];
    const obj = this.registry.find(o => o.id === id);
    if (!obj) { this._next(); return; }
    $('#caption').classList.remove('on');
    this.state = 'flying';
    this.dwell = dwell;
    this.rig.flyTo(obj, logD, {
      locked: true,
      done: () => {
        if (!this.active) return;
        $('#capTitle').textContent = title;
        $('#capText').textContent = text;
        $('#caption').classList.add('on');
        this.state = 'dwelling';
      },
    });
  }
  update(dt) {
    if (!this.active || this.state !== 'dwelling') return;
    this.dwell -= dt;
    if (this.dwell <= 0) this._next();
  }
}
