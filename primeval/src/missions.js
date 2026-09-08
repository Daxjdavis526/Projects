// Progression: three jobs, each of which unlocks the tool you needed for it
// the last time you nearly died.

import { ITEMS } from './player/inventory.js';
import { SPECIES } from './life/species.js';

export const MISSIONS = [
  {
    id: 'survey',
    tag: 'OBJECTIVE · SURVEY',
    title: 'Survey Site ECHO-7',
    hint: 'Fly the HALBERD to THERA. Scan three subjects. Get back to ANVIL alive.',
    steps: [
      { key: 'land', text: 'Set down on THERA', done: (s) => s.landedOnThera },
      { key: 'scan', text: 'Scan 3 subjects', done: (s) => s.scans >= 3, progress: (s) => `${Math.min(s.scans, 3)}/3` },
      { key: 'home', text: 'Return to ANVIL Station', done: (s) => s.landedOnAnvilAfter('scan') },
    ],
    reward: 'rifle',
    rewardText: 'ARMOURY UNLOCKED — SUNDER PULSE LANCE AUTHORISED',
  },
  {
    id: 'hardware',
    tag: 'OBJECTIVE · MATERIALS',
    title: 'Fabrication Stock',
    hint: 'The exosuit needs volcanic crystal. Take the SUNDER. You will want it.',
    steps: [
      { key: 'crystal', text: 'Recover 6 volcanic crystals', done: (s) => s.crystals >= 6, progress: (s) => `${Math.min(s.crystals, 6)}/6` },
      { key: 'apex', text: 'Put down one large predator', done: (s) => s.apexKills >= 1, progress: (s) => `${Math.min(s.apexKills, 1)}/1` },
      { key: 'home', text: 'Return to ANVIL Station', done: (s) => s.landedOnAnvilAfter('hardware') },
    ],
    reward: 'mech',
    rewardText: 'MECH BAY UNLOCKED — BASTION EXOSUIT ONLINE',
  },
  {
    id: 'apex',
    tag: 'OBJECTIVE · APEX',
    title: 'Find the Dreadcrown',
    hint: 'One of them is alive on this continent, in the volcanic country. Take the exosuit.',
    steps: [
      { key: 'kill', text: 'Kill the DREADCROWN', done: (s) => s.dreadKilled },
    ],
    reward: null,
    rewardText: 'THERA SURVEY COMPLETE — THE PLANET IS YOURS TO WANDER',
  },
];

export class Missions {
  constructor(game) {
    this.game = game;
    this.index = 0;
    this.complete = false;
    this.state = {
      scans: 0, crystals: 0, apexKills: 0, dreadKilled: false,
      landedOnThera: false, lastLanding: null, stageAtLanding: {},
      landedOnAnvilAfter: (stage) => this.state.stageAtLanding[stage] === true,
    };
    this.bind();
  }

  get current() { return this.complete ? null : MISSIONS[this.index]; }

  bind() {
    const g = this.game, s = this.state;
    g.on('scan', (result, fresh) => { if (fresh) { s.scans++; this.refresh(); } });
    g.on('loot', () => { s.crystals = g.inventory.count('crystal'); this.refresh(); });
    g.on('creatureDeath', (c, killer) => {
      if (killer !== 'player') return;
      if (c.sp.danger >= 6) { s.apexKills++; }
      if (c.sp.id === 'dreadcrown') { s.dreadKilled = true; }
      this.refresh();
    });
    g.on('shipLanded', () => {
      if (g.locale.id === 'planet') { s.landedOnThera = true; }
      else {
        // Landing at ANVIL banks whichever stage you were working on.
        const cur = this.current;
        if (cur) s.stageAtLanding[cur.id === 'survey' ? 'scan' : cur.id] = true;
      }
      this.refresh();
    });
    g.on('localeChanged', () => this.refresh());
  }

  /** Recompute the objective panel and grant rewards. */
  refresh() {
    const g = this.game;
    const m = this.current;
    if (!m) {
      g.hud.objective('THERA · OPEN', 'No standing orders',
        'Hunt, explore, or go and pick a fight. The planet does not require you.');
      return;
    }
    // Advance when every step reads done.
    const allDone = m.steps.every(st => st.done(this.state));
    if (allDone) {
      this.award(m);
      return;
    }
    const next = m.steps.find(st => !st.done(this.state));
    const prog = next.progress ? ` (${next.progress(this.state)})` : '';
    const doneCount = m.steps.filter(st => st.done(this.state)).length;
    g.hud.objective(m.tag, m.title,
      `${doneCount}/${m.steps.length} · ${next.text}${prog}\n${m.hint}`);
  }

  award(m) {
    const g = this.game;
    if (m.reward === 'rifle') {
      g.gear.unlocked.rifle = true;
      g.emit('unlock', 'rifle');
    } else if (m.reward === 'mech') {
      g.gear.unlocked.mech = true;
      g.emit('unlock', 'mech');
    }
    g.hud.log(m.rewardText, 'good');
    this.index++;
    if (this.index >= MISSIONS.length) this.complete = true;
    // Reset the banked landing flags for the next stage.
    this.state.stageAtLanding = {};
    this.refresh();
  }

  update(dt) {
    // Crystal count can change without a loot event (recovered from the ground).
    const c = this.game.inventory.count('crystal');
    if (c !== this.state.crystals) { this.state.crystals = c; this.refresh(); }
  }
}
