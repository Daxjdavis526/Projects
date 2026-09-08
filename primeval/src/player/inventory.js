// What you are carrying, and what happens when you eat it.
//
// Deliberately small. Survival on THERA is meant to be legible: you are
// hungry, there is food in the world, you go and get it.

export const ITEMS = {
  arrow: { name: 'Arrow', tag: 'AMMO', desc: 'Fire-hardened shaft, iron head. Recoverable if you can find it.', stack: 40 },
  berries: { name: 'Sable Berries', tag: 'FOOD', food: 11, desc: 'Tart, dark, faintly numbing. Safe in quantity.', usable: true },
  fruit: { name: 'Canopy Fruit', tag: 'FOOD', food: 19, desc: 'Grows high. Worth the climb, or the wait for something to knock it down.', usable: true },
  meat_raw: { name: 'Raw Meat', tag: 'FOOD', food: 17, health: -4, desc: 'Edible. Not advisable. Cook it aboard the ship or at the station.', usable: true },
  meat_cooked: { name: 'Cooked Meat', tag: 'FOOD', food: 42, health: 6, desc: 'Seared through. This is what a good day looks like.', usable: true },
  fish_raw: { name: 'Glimmerfin', tag: 'FOOD', food: 15, health: -2, desc: 'Oily and rich. Better cooked.', usable: true },
  fish_cooked: { name: 'Grilled Glimmerfin', tag: 'FOOD', food: 36, health: 5, desc: 'The single best meal available on this planet.', usable: true },
  egg: { name: 'Nest Egg', tag: 'FOOD', food: 26, health: 3, desc: 'Taken from a nest. Something noticed you taking it.', usable: true },
  hide: { name: 'Hide', tag: 'MATERIAL', desc: 'Thick dermal plating. Station fabricators want this.' },
  tooth: { name: 'Serrated Tooth', tag: 'TROPHY', desc: 'Recurved, twelve centimetres, still sharp.' },
  claw: { name: 'Sickle Claw', tag: 'TROPHY', desc: 'The second toe. It is not for walking.' },
  horn: { name: 'Brow Horn', tag: 'TROPHY', desc: 'Solid keratin over bone. Heavy.' },
  plate: { name: 'Osteoderm', tag: 'MATERIAL', desc: 'Bone plate from an armoured back. Absurdly tough.' },
  crown: { name: 'Crown Scute', tag: 'TROPHY', desc: 'Off the skull of something that should not have died.' },
  crystal: { name: 'Volcanic Crystal', tag: 'RESOURCE', desc: 'Grown in a lava tube. The station wants six of these.' },
  ore: { name: 'Ferrite Nodule', tag: 'RESOURCE', desc: 'Dense, magnetic, unusually pure.' },
  sample: { name: 'Biological Sample', tag: 'DATA', desc: 'Sealed tissue vial. Survey credit on return.' },
  fossil: { name: 'Fossil Fragment', tag: 'DATA', desc: 'Something older than everything alive here.' },
  probe: { name: 'Probe Core', tag: 'SALVAGE', desc: 'From a crashed survey drone. Still warm.' },
  cell: { name: 'Power Cell', tag: 'RESOURCE', desc: 'Recharges the SUNDER and the exosuit.' },
};

export class Inventory {
  constructor() {
    this.slots = new Map();
    this.onChange = null;
  }

  count(id) { return this.slots.get(id) ?? 0; }

  add(id, n = 1) {
    if (!ITEMS[id] || n <= 0) return 0;
    const cur = this.count(id);
    const cap = ITEMS[id].stack ?? 999;
    const put = Math.min(n, cap - cur);
    if (put <= 0) return 0;
    this.slots.set(id, cur + put);
    this.onChange?.(id, put);
    return put;
  }

  take(id, n = 1) {
    const cur = this.count(id);
    if (cur < n) return false;
    if (cur === n) this.slots.delete(id); else this.slots.set(id, cur - n);
    this.onChange?.(id, -n);
    return true;
  }

  has(id, n = 1) { return this.count(id) >= n; }

  /** Eat something. Returns a line for the message log, or null. */
  consume(id, player) {
    const it = ITEMS[id];
    if (!it || !it.food) return null;
    if (!this.take(id, 1)) return null;
    player.feed(it.food);
    if (it.health) {
      if (it.health > 0) player.heal(it.health);
      else player.damage(-it.health, 'bad meat');
    }
    return it.health < 0
      ? `Ate ${it.name.toLowerCase()}. It fights back on the way down.`
      : `Ate ${it.name.toLowerCase()}.`;
  }

  /** Turn every raw thing into a cooked thing. Ship galley and station. */
  cookAll() {
    let n = 0;
    const pairs = [['meat_raw', 'meat_cooked'], ['fish_raw', 'fish_cooked']];
    for (const [raw, done] of pairs) {
      const c = this.count(raw);
      if (c > 0) { this.take(raw, c); this.add(done, c); n += c; }
    }
    return n;
  }

  /** Rows for the HUD pack panel, best food first. */
  list() {
    const out = [];
    for (const [id, count] of this.slots) {
      const it = ITEMS[id];
      out.push({ id, count, name: it.name, tag: it.tag, desc: it.desc, usable: !!it.usable, food: it.food ?? 0 });
    }
    out.sort((a, b) => (b.food - a.food) || a.name.localeCompare(b.name));
    return out;
  }

  totalFood() {
    let f = 0;
    for (const [id, c] of this.slots) f += (ITEMS[id].food ?? 0) * c;
    return f;
  }
}
