// The HALBERD, ANVIL Station, and moving between worlds.

import * as THREE from 'three';
import { Ship, SHIP_STATE } from '../ship/ship.js';
import { SpaceStage } from '../ship/space.js';
import { buildStation } from './base.js';
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

    game.on('enterShip', () => this.board(game));
    game.on('terminal', () => {});
  }

  board(game) {
    if (game.mode !== 'ON_FOOT') return;
    game.mode = 'SHIP';
    this.ship.piloted = true;
    this.ship.rampOpen = false;
    game.player.frozen = true;
    game.hud.vehicle('ship');
    game.hud.crosshair(false);
    game.hud.log('HALBERD — systems live. W/S throttle · SPACE lift · A/D roll · R mode · G gear · V view · TAB transit · E disembark', 'good');
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

    // Station only exists on ANVIL.
    this.station.group.visible = onMoon;
    for (const b of this.stationColliders) b.enabled = onMoon;
    for (const l of this.station.lights) l.visible = onMoon;

    if (game.mode === 'SHIP') {
      const input = game.input;
      if (input.hit('KeyE')) this.disembark(game);
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

/** Locale definitions live here so game.js does not import the moon. */
export function moonLocale() { return MOON_LOCALE; }
export function moonSampler() { return ANVIL_SAMPLER; }
