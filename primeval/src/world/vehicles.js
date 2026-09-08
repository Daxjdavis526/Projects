// The HALBERD, ANVIL Station, and moving between worlds.

import * as THREE from 'three';
import { Ship, SHIP_STATE } from '../ship/ship.js';
import { SpaceStage } from '../ship/space.js';
import { buildStation } from './base.js';
import { Mech } from '../player/mech.js';
import { MOON_LOCALE, ANVIL_SAMPLER, findMoonSite, setBaseSite, moonHeight } from './moon.js';
import { clamp, lerp, smoothstep } from '../math/noise.js';
import { MOON } from '../config.js';

export class VehicleSystem {
  async load(game) {
    // --- the moon and the station ----------------------------------------
    const site = findMoonSite(0, 0);
    setBaseSite(site.x, site.z, site.h, 150);
    game.moonSite = { x: site.x, z: site.z, h: site.h };

    this.station = buildStation();
    this.station.group.position.set(site.x, site.h, site.z);
    game.scene.add(this.station.group);
    game.station = this.station;

    // Station colliders, in world space.
    this.stationColliders = [];
    for (const c of this.station.colliders) {
      const b = game.colliders.addBox(
        site.x + c.cx, site.h + c.cy, site.z + c.cz,
        c.hx, c.hy, c.hz, 0, 'station');
      b.enabled = false;
      this.stationColliders.push(b);
    }

    // Terminals become E-key interactions when you are close enough.
    game.terminals = this.station.terminals.map(t => ({
      position: new THREE.Vector3(site.x + t.x, site.h + 1.2, site.z + t.z),
      radius: 2.6,
      label: t.label,
      tag: t.tag,
      act: () => game.emit('terminal', t.tag),
    }));

    // --- the ship ----------------------------------------------------------
    this.ship = new Ship(game.scene, game.camera);
    game.ship = this.ship;
    this.space = new SpaceStage(game);
    game.space = this.space;

    const pad = this.station.padCentres[0];
    game.moonPad = { x: site.x + pad.x, z: site.z + pad.z };

    // --- the exosuit -------------------------------------------------------
    this.mech = new Mech(game.scene, game.camera);
    game.mech = this.mech;
    this.mech.place(site.x + 11, site.h, site.z - 8.5, Math.PI);
    this.mech.group.visible = false;
    game.mechBay = { position: new THREE.Vector3(site.x + 11, site.h + 2, site.z - 8.5) };
    this.mechAtStation = true;

    this.mech.onLand = (impact, pos) => {
      game.fx?.dustRing(pos, 1.6 + impact * 1.4, 18);
      game.emit('mechLand', impact);
    };
    this.mech.onStep = (kind, power) => {
      if (kind !== 'jump') game.fx?.dustRing(this.mech.pos, 0.7 * power, 5);
      game.emit('mechStep', kind, power);
    };
    this.mech.onFire = (kind, from, to, hit) => {
      if (kind !== 'shot') return;
      game.fx?.beam(from, to, { color: 0xffb066, width: 0.16, life: 0.11 });
      game.fx?.flash(from, { color: 0xffd0a0, size: 1.4, life: 0.09 });
      game.fx?.light(from, 0xffb066, 60, 0.14, 34);
      if (!hit) game.fx?.impact(to, new THREE.Vector3(0, 1, 0), { color: 0xffb066, scale: 1.6 });
      else game.fx?.hitFlesh(to, this.mech.lookDir(), 1.6);
      game.emit('mechFire');
    };
    this.mech.onPunch = (pos, hit) => {
      game.fx?.flash(pos, { color: 0xfff0d0, size: 1.6, life: 0.12 });
      game.fx?.dustRing(pos, 1.2, 8);
      game.emit('mechPunch', !!hit);
    };

    game.on('enterShip', () => this.board(game));
    game.on('enterMech', () => this.mount(game));
    game.on('terminal', (tag) => this.terminal(game, tag));
    game.on('unlock', (what) => {
      if (what === 'mech') this.mech.group.visible = true;
    });
  }

  // --- terminals -----------------------------------------------------------

  terminal(game, tag) {
    const hud = game.hud, inv = game.inventory, p = game.player;
    switch (tag) {
      case 'food': {
        const cooked = inv.cookAll();
        inv.add('meat_cooked', 2);
        inv.add('fish_cooked', 1);
        p.feed(100); p.heal(45);
        hud.log(cooked
          ? `Galley: cooked ${cooked} item${cooked > 1 ? 's' : ''}, rations topped up, wounds sealed.`
          : 'Galley: rations topped up, wounds sealed.', 'good');
        game.refreshInventory();
        break;
      }
      case 'suit': {
        const need = 40 - inv.count('arrow');
        if (need > 0) inv.add('arrow', need);
        game.gear.rifle.energy = 100;
        game.gear.rifle.heat = 0;
        p.heal(100);
        hud.log('Suit serviced. Quiver full, cell recharged.', 'good');
        game.refreshInventory();
        break;
      }
      case 'rifle': {
        if (!game.gear.unlocked.rifle) {
          hud.log('WEAPON LOCKER — SEALED. Complete the ECHO-7 survey first.', 'warn');
          break;
        }
        game.gear.rifle.energy = 100;
        game.gear.equip(2);
        hud.log('SUNDER pulse lance drawn. Cell at 100%.', 'good');
        break;
      }
      case 'mech': {
        if (!game.gear.unlocked.mech) {
          hud.log('EXOSUIT CRADLE — LOCKED. Fabrication stock incomplete.', 'warn');
          break;
        }
        this.mount(game);
        break;
      }
      case 'sleep': {
        game.daylight.time += game.locale.dayLength * 0.42;
        p.health = 100; p.stamina = 100;
        p.hunger = Math.max(20, p.hunger - 18);
        hud.log('Slept. Woke up hungry, which on ANVIL is a solvable problem.', 'good');
        break;
      }
      case 'airlock': {
        hud.log('Airlock cycled. Suit sealed — ANVIL surface pressure is zero.', 'warn');
        break;
      }
      case 'mission': {
        const m = game.missions?.current;
        hud.log(m ? `${m.title} — ${m.hint}` : 'No standing orders. The board is clear.', 'warn');
        break;
      }
    }
  }

  // --- the exosuit ---------------------------------------------------------

  mount(game) {
    if (!game.gear.unlocked.mech) return;
    if (game.mode !== 'ON_FOOT') return;
    const d = game.player.pos.distanceTo(this.mech.pos);
    if (d > 7) { game.hud.log('Exosuit out of reach.', 'warn'); return; }
    game.mode = 'MECH';
    this.mech.piloted = true;
    this.mech.yaw = game.player.yaw;
    this.mech.pitch = game.player.pitch;
    game.player.frozen = true;
    game.hud.vehicle('mech');
    game.hud.log('BASTION online. SHIFT sprint · SPACE jump, hold to boost · LMB cannon · RMB punch · R vent · V view · E dismount', 'good');
    game.emit('mechMounted');
  }

  dismount(game) {
    const m = this.mech;
    if (!m.grounded) { game.hud.log('Land first.', 'warn'); return; }
    game.mode = 'ON_FOOT';
    m.piloted = false;
    game.player.frozen = false;
    const side = new THREE.Vector3(Math.cos(m.yaw), 0, -Math.sin(m.yaw)).multiplyScalar(3.2);
    const x = m.pos.x + side.x, z = m.pos.z + side.z;
    game.player.setPosition(x, game.locale.heightAt(x, z) + 0.4, z);
    game.player.yaw = m.yaw;
    game.camera.up.set(0, 1, 0);
    game.hud.vehicle(null);
    game.emit('mechDismounted');
  }

  board(game) {
    if (game.mode !== 'ON_FOOT') return;
    game.mode = 'SHIP';
    this.ship.piloted = true;
    this.ship.rampOpen = false;
    game.player.frozen = true;
    game.hud.vehicle('ship');
    game.hud.crosshair(false);
    game.hud.log('HALBERD — systems live. W/S throttle · SPACE lift · A/D roll · R mode · G gear · V view · TAB transit · B deploy exosuit · E disembark', 'good');
    this.ship.say('POWER ON', 3);
    game.emit('boarded');
  }

  disembark(game) {
    const s = this.ship;
    if (s.state !== SHIP_STATE.LANDED) { s.say('LAND FIRST', 2); return; }
    game.mode = 'ON_FOOT';
    s.piloted = false;
    s.rampOpen = true;
    game.player.frozen = false;
    const p = s.boardingPoint();
    game.player.setPosition(p.x, game.locale.heightAt(p.x, p.z) + 0.4, p.z);
    game.player.yaw = s.yawOf(s.quat) + Math.PI;
    game.camera.up.set(0, 1, 0);
    game.hud.vehicle(null);
    game.emit('disembarked');
  }

  update(dt, game) {
    const s = this.ship;
    const onMoon = game.locale.id === 'moon';

    // The exosuit exists once it is unlocked; at the station it stands in its
    // cradle, on THERA it stands where the ship dropped it.
    if (game.gear?.unlocked.mech) {
      this.mech.group.visible = onMoon ? true : this.mech.deployed;
      if (game.mode === 'MECH') {
        if (game.input.hit('KeyE')) this.dismount(game);
        this.mech.update(dt, game.input, game);
        game.player.pos.copy(this.mech.pos);
        game.hud.mech(this.mech.hudState());
      } else if (this.mech.group.visible) {
        this.mech.update(dt, game.input, game);
      }
    }

    // Station only exists on ANVIL.
    this.station.group.visible = onMoon;
    for (const b of this.stationColliders) b.enabled = onMoon;
    for (const l of this.station.lights) l.visible = onMoon;

    if (game.mode === 'SHIP') {
      const input = game.input;
      if (input.hit('KeyE')) this.disembark(game);
      if (input.hit('KeyB') && game.gear?.unlocked.mech && s.state === SHIP_STATE.LANDED) {
        this.deployMech(game);
      }
      if (input.hit('Tab')) {
        if (this.space.transit) this.space.abort(game);
        else if (!this.space.begin(game)) {
          const why = this.space.transitBlocker(game);
          if (why) s.say(why, 2.6);
        }
      }
      s.update(dt, input, game);
      const nav = this.space.navText(game);
      game.navTarget = nav.target;
      game.navRange = nav.range;
      game.hud.ship(s.hudState(game));
      game.hud.shipMessage(s.message);
      // Keep the walking body with the ship so exiting works anywhere.
      game.player.pos.copy(s.pos);
    } else {
      s.update(dt, game.input, game);
      // Standing near the ship on the pad, its lights stay on.
      s.piloted = false;
    }

    this.space.update(dt, game);

    // Reentry and burn effects bleed into the post grade.
    const grade = game.renderer.grade.uniforms;
    game.heatShimmer = s.entryHeat * 1.2 + (this.space.transit ? 0.25 : 0);
    grade.uAberration.value = lerp(0.0016, 0.0075, clamp(s.entryHeat + this.space.starStreak * 0.6, 0, 1));
    if (game.mode === 'SHIP') game.player.addShake(0);
  }
}

VehicleSystem.prototype.deployMech = function (game) {
  const s = this.ship;
  const side = new THREE.Vector3(0, 0, 1).applyQuaternion(s.quat).multiplyScalar(16);
  const x = s.pos.x + side.x, z = s.pos.z + side.z;
  this.mech.place(x, game.locale.heightAt(x, z), z, s.yawOf(s.quat) + Math.PI);
  this.mech.deployed = true;
  this.mech.group.visible = true;
  s.say('BASTION DEPLOYED', 3);
  game.hud.log('Exosuit released onto the surface.', 'good');
};

/** Locale definitions live here so game.js does not import the moon. */
export function moonLocale() { return MOON_LOCALE; }
export function moonSampler() { return ANVIL_SAMPLER; }
