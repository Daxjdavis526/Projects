/* =============================================================================
   SETTINGS — the handful of choices that are genuinely the player's
   -----------------------------------------------------------------------------
   Deliberately short. Most of what a settings screen usually offers is either
   a decision the game should make for itself or a decision it should not be
   making at all, so what is here is what a person really might want changed:
   how hard the machine has to work, how fast the suit runs down, whether the
   game is allowed to talk to NASA while you play, whether historic sites are
   labelled, and how much of your disk the cache may use.

   Everything is remembered in localStorage. Quality is the only one that needs
   a reload, because the tile budget and the shadow map size are decided when
   the renderer is built.
   ========================================================================== */

import { Save } from '../game/save.js';

const el = (id) => document.getElementById(id);

const QUALITIES = ['performance', 'balanced', 'high', 'ultra', 'science'];
const SUIT_MODES = ['realistic', 'relaxed', 'unlimited'];
const CACHE_SIZES = [128, 512, 2048];

export class Settings {
  /**
   * @param {object} opts { state, get: {streams, cache, eva, historic}, onQuality }
   */
  constructor(opts) {
    this.state = opts.state;
    this.get = opts.get;
    this.onQuality = opts.onQuality;
    this.root = el('settings');
    this.open = false;
    this.values = Object.assign({
      quality: opts.state.qualityName,
      suit: 'realistic',
      stream: true,
      markers: false,
      cacheMb: 512,
    }, Save.readSettings());
    this.build();
  }

  build() {
    const row = (id, options, labels, key) => {
      const host = el(id);
      if (!host) return;
      host.innerHTML = options.map((o, i) =>
        `<button data-v="${o}">${labels ? labels[i] : o}</button>`).join('');
      host.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        this.set(key, b.dataset.v);
      });
    };
    row('set-quality', QUALITIES, ['low', 'balanced', 'high', 'ultra', 'science'], 'quality');
    row('set-suit', SUIT_MODES, ['realistic', 'relaxed', 'unlimited'], 'suit');
    row('set-stream', ['on', 'off'], null, 'stream');
    row('set-markers', ['on', 'off'], null, 'markers');
    row('set-cache', CACHE_SIZES.map(String).concat('clear'),
        CACHE_SIZES.map(m => m >= 1024 ? (m / 1024) + ' GB' : m + ' MB').concat('clear'), 'cache');
    this.apply();
  }

  set(key, value) {
    if (key === 'cache') {
      if (value === 'clear') {
        const c = this.get.cache();
        if (c) c.clear();
      } else this.values.cacheMb = Number(value);
    } else if (key === 'stream' || key === 'markers') {
      this.values[key] = value === 'on';
    } else {
      this.values[key] = value;
    }
    Save.writeSettings(this.values);
    this.apply();
    if (key === 'quality' && this.onQuality) this.onQuality(value);
  }

  /** Push the values into the live game and mark the buttons. */
  apply() {
    const v = this.values;
    const mark = (id, active) => {
      const host = el(id);
      if (!host) return;
      for (const b of host.querySelectorAll('button')) {
        b.classList.toggle('on', String(b.dataset.v) === String(active));
      }
    };
    mark('set-quality', v.quality);
    mark('set-suit', v.suit);
    mark('set-stream', v.stream ? 'on' : 'off');
    mark('set-markers', v.markers ? 'on' : 'off');
    mark('set-cache', v.cacheMb);

    const eva = this.get.eva();
    if (eva) eva.suit.mode = v.suit;
    const streams = this.get.streams();
    if (streams) streams.enabled = v.stream;
    const historic = this.get.historic();
    if (historic) historic.setMarkers(v.markers);
    const cache = this.get.cache();
    if (cache) cache.setLimit(v.cacheMb * 1e6);
    if (el('set-cache-status')) {
      el('set-cache-status').textContent = cache ? cache.status() : 'unavailable';
    }
    if (el('set-foot')) {
      el('set-foot').textContent = streams
        ? `streaming: ${streams.status()}`
        : 'streaming unavailable';
    }
  }

  toggle() {
    this.open = !this.open;
    if (this.root) this.root.style.display = this.open ? 'block' : 'none';
    if (this.open) this.apply();
    return this.open;
  }
}
