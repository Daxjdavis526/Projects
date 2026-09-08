/* =============================================================================
   SAVE — coming back to where you left off
   -----------------------------------------------------------------------------
   A lunar day is 29 and a half Earth days long, and an expedition in this game
   can take several of them. Nobody is going to sit through that in one session,
   so the state that matters has to survive the browser being closed.

   What matters is small: where the ship is, where the rover is and what it has
   left, where you are, what your suit has left, what time it is, and what you
   have already been to see. All of that fits in a few kilobytes of
   localStorage, so there is no database and no server.

   What is deliberately not saved is anything that can be recomputed. Terrain,
   imagery, the sky, the temperature of the ground: all of it is a function of
   position and time, so it comes back identically from the same seed and the
   same clock without being written down.
   ========================================================================== */

const KEY = 'selene.save.v1';
const SETTINGS_KEY = 'selene.settings.v1';

export class Save {
  constructor(opts = {}) {
    this.key = opts.key || KEY;
    this.lastAuto = 0;
    this.autoInterval = opts.autoInterval ?? 180;    // seconds of real time
  }

  /** Gather everything worth keeping from the live game. */
  static capture(game) {
    const { state, base, vehicle, eva, waypoints, visited, shelter } = game;
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      simMs: state.simMs,
      timeRate: state.timeRate,
      quality: state.qualityName,
      base: base ? { lat: base.lat, lon: base.lon, heading: base.heading,
                     cabinDust: base.cabinDust ?? 0 } : null,
      rover: vehicle ? {
        lat: vehicle.rover.lat, lon: vehicle.rover.lon, heading: vehicle.rover.heading,
        mode: vehicle.rover.mode, canopy: vehicle.rover.canopy,
        supplies: { ...vehicle.rover.supplies },
        distance: vehicle.rover.distance, dust: vehicle.dust,
        rolled: !!vehicle.rover.rolled, boostHeat: vehicle.rover.boostHeat,
      } : null,
      player: eva ? {
        lat: eva.player.llh.lat, lon: eva.player.llh.lon,
        yaw: eva.player.yaw, pitch: eva.player.pitch,
        distance: eva.player.distance, steps: eva.player.stepsTaken,
        view: eva.view, lamps: eva.lampMode, jetHeat: eva.player.jetHeat,
      } : null,
      suit: eva ? {
        o2: eva.suit.o2, o2Reserve: eva.suit.o2Reserve, co2: eva.suit.co2,
        power: eva.suit.power, water: eva.suit.water, elapsed: eva.suit.elapsed,
        mode: eva.suit.mode, dust: eva.suit.dust,
      } : null,
      driving: !!game.driving,
      needs: shelter ? {
        sinceMeal: shelter.needs.sinceMeal,
        sinceSleep: shelter.needs.sinceSleep,
        sleepDebt: shelter.needs.sleepDebt,
      } : null,
      waypoints: (waypoints || []).map((w) => ({ lat: w.lat, lon: w.lon })),
      visited: visited ? (visited.capture ? visited.capture() : visited) : [],
    };
  }

  /** Put a captured state back into the live game. Returns what it could not. */
  static restore(game, data) {
    if (!data || data.version !== 1) return { ok: false, why: 'unrecognised save' };
    const { state } = game;
    state.simMs = data.simMs;
    state.timeRate = data.timeRate ?? 1;
    if (data.base) {
      game.settle(data.base.lat, data.base.lon, data.base.heading);
      /* After `settle`, which is what builds the ship. */
      if (game.base && game.base.interior) {
        game.base.interior.cabinDust = data.base.cabinDust || 0;
      }
    }
    if (data.rover && game.vehicle) {
      const r = game.vehicle.rover;
      r.place(data.rover.lat, data.rover.lon, data.rover.heading);
      r.mode = data.rover.mode;
      r.canopy = data.rover.canopy;
      r.supplies = { ...data.rover.supplies };
      r.distance = data.rover.distance || 0;
      r.rolled = !!data.rover.rolled;
      r.boostHeat = data.rover.boostHeat || 0;
      game.vehicle.dust = data.rover.dust || 0;
    }
    if (data.player && game.eva) {
      game.eva.place(data.player.lat, data.player.lon, 0.05);
      game.eva.player.yaw = data.player.yaw;
      game.eva.player.pitch = data.player.pitch;
      game.eva.player.distance = data.player.distance || 0;
      game.eva.player.stepsTaken = data.player.steps || 0;
      game.eva.view = data.player.view || 'first';
      game.eva.lampMode = data.player.lamps || 0;
      game.eva.player.jetHeat = data.player.jetHeat || 0;
    }
    if (data.suit && game.eva) Object.assign(game.eva.suit, data.suit);
    /* The rest of it. All of this was written by `capture` and read by nobody,
       which is the quietest kind of bug there is: the save file looked
       complete, the game came back subtly wrong, and no test that did not
       compare the two halves could have seen it. */
    if (data.needs && game.shelter) Object.assign(game.shelter.needs, data.needs);
    game.waypoints = data.waypoints || [];
    if (game.visited && game.visited.load) game.visited.load(data.visited);
    else game.visited = data.visited || [];
    /* Boarding last: `settle` puts you on the ground beside the ladder, so
       anything that decides where you are has to happen after it. */
    game.driving = !!data.driving && !!game.vehicle;
    return { ok: true, at: data.savedAt };
  }

  write(game, reason = 'manual') {
    try {
      const data = Save.capture(game);
      data.reason = reason;
      localStorage.setItem(this.key, JSON.stringify(data));
      return data;
    } catch (e) {
      /* A full or disabled localStorage is not worth interrupting anything. */
      return null;
    }
  }

  read() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  clear() { try { localStorage.removeItem(this.key); } catch { /* ignore */ } }

  /** Called every frame. Writes at most once every `autoInterval` seconds. */
  tick(now, game) {
    if (now - this.lastAuto < this.autoInterval * 1000) return null;
    this.lastAuto = now;
    return this.write(game, 'auto');
  }

  /* --- settings, which are separate from the game state ------------------- */
  static readSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); }
    catch { return {}; }
  }

  static writeSettings(s) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  }
}
