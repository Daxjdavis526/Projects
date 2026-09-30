/* A session: one stand, one training scenario, one operator, running.

   It wires the layers together and owns the clock:

       physics (truth) ──► DAQ (measurement) ──► alarms, procedure, UI
              ▲                                          │
              └──────────── controller (commands) ◄──────┘

   and it is the only object the UI talks to. It imports nothing that touches
   the DOM, so a whole test — pressurise, fire, safe — can be driven from a
   Node script (see test/session.test.mjs).

   Time: the physics advances in its own adaptive sub-steps; the controller,
   alarms and timers run every 5 ms of sim time between them; the procedure
   engine checks a few times a second. Sim speed can be raised to skip
   waits (a leak-check hold, a bottle warming up) but is forced to 1× while
   the stand is armed, firing or aborting. */

import { Emitter } from '../lib/emitter.js';
import { Rng } from '../lib/rng.js';
import { psi, fmt } from '../lib/units.js';
import { ColdGasModel } from '../physics/coldgas.js';
import { predictColdGas } from '../physics/predict.js';
import { DAQ } from '../instruments/daq.js';
import { Controller } from '../control/controller.js';
import { Alarms } from '../control/alarms.js';
import { EventLog } from '../control/eventlog.js';
import { ProcedureRunner } from '../control/procedure.js';
import { runPoll, concludePoll } from '../control/gonogo.js';
import { computeMetrics } from '../analysis/metrics.js';
import { FaultEngine, HINT_COST } from '../faults/engine.js';
import { scoreDiagnosis, abortAssessment } from '../faults/diagnosis.js';
import { leakPre, leakEval, LEAK_SECONDS } from '../control/leakcheck.js';
import { FAILURE_MODES, RIGHT_ACTION } from '../content/faults/ts1-faults.js';

const MODELS = { coldgas: ColdGasModel };
const CHUNK = 0.005;

export class Session extends Emitter {
  constructor({ def, scenario = null, mode = 'guided', seed = (Date.now() & 0xffffff), runPrefix = null, firstRun = 1, clockStart = 8.5 * 3600, fault = null, faultChanceNone }) {
    super();
    this.def = def;
    this.scenario = scenario;
    this.mode = mode;
    this.seed = seed;
    this.uid = `S${seed.toString(36)}${(Date.now() % 1e6).toString(36)}`;   // names this session's filed reports
    this.rng = new Rng(seed);
    const M = MODELS[def.physics.model];
    if (!M) throw new Error(`no physics model '${def.physics.model}'`);
    this.model = new M(def, { rng: this.rng });
    this.t = 0;
    this.log = new EventLog();
    this.controller = new Controller(this);
    this.daq = new DAQ(def, this.model, this.rng, id => this.controller.cmd[id]);
    this.alarms = new Alarms(this);
    this.safetyViolations = [];
    this.violationsReviewed = 0;
    this.polls = [];
    this.pollMisses = [];
    this.inspected = new Set();
    this.flags = new Set();          // UI milestones the procedures can check (analysis opened, report filed)
    this.timers = [];
    this.runs = [];
    this.runPrefix = runPrefix || `${def.id.replace('-', '')}-${def.program === 'coldgas' ? 'CG' : 'BP'}`;
    this.nextRun = firstRun;
    this.clockStart = clockStart;
    this.speed = 1;
    this.frozen = false;
    this.leakCheck = null;
    this.leakRun = null;
    this.prediction = null;
    this._predKey = null;
    this._procAcc = 0;
    this._audio = null;
    this.request = scenario?.request ? scenario.request(def) : null;
    this.inspections = [];
    this.faults = new FaultEngine(this, def.faults || [], {
      enabled: mode === 'fault' || !!scenario?.faults,
      chanceNone: faultChanceNone ?? scenario?.faultChanceNone ?? 0.2,
      pool: scenario?.faultPool || null,
      forced: fault,
    });
    this.controller.on('abort', () => this.later(5, () => { if (this.daq.recording) this.stopRecording('auto-stop after abort'); }));
    if (scenario?.setup) scenario.setup(this);
    if (scenario?.procedure) {
      this.procedure = new ProcedureRunner(this, scenario.procedure(def));
    } else this.procedure = null;
    this.log.add(0, 'SYS', `Session start — ${def.name} (${def.fictional ? 'fictional configuration' : ''}), ${scenario ? scenario.title : 'open stand'}, ${mode} mode`);
    // predicted now, so the first thing the operator reads has numbers in it
    this.requestPrediction();
    this.updatePrediction();
  }

  /* The UI may attach a sound engine; the core only names events. */
  set audioSink(fn) { this._audio = fn; }
  audio(name, data) { if (this._audio) this._audio(name, data); }

  /* Wall-clock time of day in the simulated facility, seconds. */
  get clock() { return this.clockStart + this.t; }

  get locked1x() {
    const c = this.controller;
    return c.armed || !!c.seq || !!(c.abort && !c.abort.complete);
  }
  get effectiveSpeed() { return this.locked1x ? 1 : this.speed; }

  later(dt, fn) { this.timers.push({ at: this.t + dt, fn }); }

  /* Advance by real elapsed seconds (the UI's frame time). */
  advance(realDt) {
    if (this.frozen) return;
    let span = Math.min(realDt, 0.1) * this.effectiveSpeed;
    while (span > 1e-9) {
      // Land exactly on the next scheduled valve event, so a 6 ms pulse is
      // 6 ms, not whatever the chunk size rounds it to.
      const tn = this.controller.nextEventTime();
      let d = Math.min(CHUNK, span);
      if (tn > this.t + 1e-9 && tn - this.t < d) d = tn - this.t;
      this.model.advance(d, t => this.daq.tick(t));
      this.t = this.model.t;
      this.controller.tick();
      this.faults.tick();
      this.alarms.evaluate(this.alarmCtx());
      if (this.timers.length) {
        const due = this.timers.filter(x => x.at <= this.t);
        if (due.length) { this.timers = this.timers.filter(x => x.at > this.t); for (const x of due) x.fn(); }
      }
      this._procAcc += d;
      if (this._procAcc >= 0.2) { this._procAcc = 0; if (this.procedure) this.procedure.tick(this.view()); }
      span -= d;
    }
    if (this._predWanted) this.updatePrediction();
    this.emit('tick', this.t);
  }

  /* Run for `seconds` of sim time regardless of wall clock (tests, holds). */
  run(seconds, step = 0.02) {
    const n = Math.round(seconds / step);
    const f = this.frozen; this.frozen = false;
    const sp = this.speed; this.speed = 1;
    for (let i = 0; i < n; i++) this.advance(step);
    this.speed = sp; this.frozen = f;
  }

  /* ---- context objects ---------------------------------------------- */

  alarmCtx() {
    const c = this.controller, q = c.seq;
    const T = q ? this.t - q.tFire : null;
    const svCmd = !!c.cmd[this.def.fireValve];
    const burning = !!q && q.state === 'BURN' && svCmd;
    let Tburn = null;
    if (burning) Tburn = this.t - (c.lastSvOn ?? q.tFire);
    return {
      armed: c.armed, seqActive: !!q,
      firing: !!q && (q.state === 'BURN' || q.state === 'TAIL'),
      burning, Tburn, T,
      regSet: c.regSet,
      domeSettled: Math.abs(this.daq.latest('EPC-101') - c.regSet) < psi(5),
      flowing: svCmd || c.cmd['VV-101'] === 1 || c.cmd['VV-201'] === 1,
      predF: this.prediction ? this.prediction.F : 0,
      svCmd, sinceSvOff: c.sinceSvOff(),
    };
  }

  /* The read-only view that procedures and the go/no-go poll use: measured
     data and states, nothing from the physics. */
  view() {
    const c = this.controller, d = this.daq, s = this;
    const stale = [...this.alarms.list].filter(a => a.active && (a.id.startsWith('STALE-') || a.id.startsWith('DAQ-'))).map(a => a.id.replace(/^(STALE|DAQ)-/, ''));
    return {
      t: this.t, mode: this.mode,
      ch: id => d.latest(id),
      stats: (id, span) => d.store.stats(id, span),
      cmd: id => c.cmd[id],
      regSet: c.regSet,
      armed: c.armed,
      plan: c.plan, planText: c.planText(),
      seq: c.seq, abortActive: !!(c.abort && !c.abort.reset),
      lastAbort: c.lastAbort || c.abort,
      facility: c.facility,
      techBusy: !!c.tech,
      daq: { powered: d.powered, online: d.online, rate: d.rate, recording: !!d.recording, runId: d.recording?.meta.runId },
      ratings: this.def.ratings,
      request: this.request,
      prediction: this.prediction,
      events: this.log,
      has: pred => this.log.has(pred),
      inspected: this.inspected,
      inspections: this.inspections,
      diagnosis: this.faults.diagnosis,
      faultSession: this.faults.enabled,
      flags: this.flags,
      session: this,
      runs: this.runs,
      lastRun: this.runs[this.runs.length - 1] || null,
      leakCheck: this.leakCheck,
      pollGo: c.pollGo,
      lastPoll: this.polls[this.polls.length - 1] || null,
      pollAfter: t => this.polls.some(p => p.tEnd >= t),
      unackedAlarms: this.alarms.list.filter(a => !a.acked).length,
      activeAlarms: this.alarms.list.filter(a => a.active).map(a => a.id),
      staleChannels: stale,
      paMade: this.log.has(e => e.cat === 'FAC' && e.text.startsWith('PA:') && e.n > (this._paEpochN ?? 0)),
      safetyViolations: this.safetyViolations.length - this.violationsReviewed,
      completedSeq: c.completed || null,
      proc: this.procedure,
      stepDone: id => s.procedure?.status(id) === 'COMPLETE',
    };
  }

  /* ---- predictions --------------------------------------------------- */

  requestPrediction() { this._predWanted = true; }
  updatePrediction() {
    if (!this._predWanted) return this.prediction;
    this._predWanted = false;
    const supply = this.request?.supplyAssumed ?? psi(2200);
    let sup = this.daq.online ? this.daq.latest('PT-101') : NaN;
    if (!(sup > psi(300))) sup = supply;
    const regSet = this.controller.regSet > psi(5) ? this.controller.regSet : (this.request?.regSet ?? psi(150));
    this.prediction = predictColdGas(this.def, { supplyGauge: sup, regSet });
    this.emit('prediction', this.prediction);
    return this.prediction;
  }

  /* ---- operator actions that are not stand commands ------------------ */

  execute(action, args, opts) { return this.controller.execute(action, args, opts); }

  inspect(id) {
    if (!this.inspected.has(id)) {
      this.inspected.add(id);
      this.emit('inspected', id);
    }
  }

  flag(name) {
    if (this.flags.has(name)) return;
    this.flags.add(name);
    this.emit('flag', name);
  }

  /* A leak check from the console, outside any procedure: the same
     isolation, the same 60 s hold and the same limit as the procedure step.
     The result is what the PROPULSION station reports at the poll. */
  startLeakCheck() {
    if (this.leakRun) return { ok: false, msg: 'A leak check is already running.' };
    const pre = leakPre(this.view());
    if (!pre.ok) return pre;
    this.leakRun = { start: this.t, end: this.t + LEAK_SECONDS };
    this.log.add(this.t, 'PROC', `Leak check: isolated, ${LEAK_SECONDS} s hold started`);
    this.later(LEAK_SECONDS, () => {
      const v = this.view();
      const r = leakPre(v).ok ? leakEval(v) : { ok: false, value: NaN, msg: 'isolation was broken during the hold — result void' };
      this.leakCheck = r;
      this.leakRun = null;
      this.log.add(this.t, 'PROC', `Leak check complete: ${r.msg}`, { level: r.ok ? 'info' : 'caution' });
      this.emit('leakCheck', r);
    });
    return { ok: true };
  }

  /* The operator's diagnosis. Scores it, keeps it, and unlocks the reveal. */
  submitDiagnosis(sub) {
    if (this.faults.diagnosis) return this.faults.diagnosis;
    const f = this.faults.active;
    const result = scoreDiagnosis(sub, f, { modes: FAILURE_MODES, rightAction: RIGHT_ACTION });
    const nh = this.faults.hints.length;
    if (nh) {
      result.parts.push({ label: 'Hints used', got: -HINT_COST * nh, max: 0, note: `${nh} hint${nh > 1 ? 's' : ''} from the senior engineer.` });
      result.score = Math.max(0, result.score - HINT_COST * nh);
      result.grade = result.score >= 85 ? 'Diagnosed' : result.score >= 55 ? 'Partly diagnosed' : 'Missed';
    }
    const rec ={ ...sub, t: this.t, result, abort: abortAssessment(this, f) };
    this.faults.diagnosis = rec;
    this.log.add(this.t, 'OPR', `Diagnosis submitted: ${sub.component} — ${FAILURE_MODES.find(m => m[0] === sub.mode)?.[1] || sub.mode}. Score ${result.score}/100.`);
    this.emit('diagnosis', rec);
    return rec;
  }

  startPoll() { return runPoll(this); }
  concludePoll(poll, calls, final) { return concludePoll(this, poll, calls, final); }

  reviewViolations() {
    const n = this.safetyViolations.length - this.violationsReviewed;
    if (n > 0) {
      this.violationsReviewed = this.safetyViolations.length;
      this.log.add(this.t, 'SAF', `${n} safety violation(s) reviewed with the test director and recorded`);
    }
  }

  note(text, runId = null) {
    this.log.add(this.t, 'OPR', text, { runId });
    const run = runId ? this.runs.find(r => r.id === runId) : null;
    if (run) run.notes.push({ t: this.t, text });
  }

  /* ---- recording and runs -------------------------------------------- */

  startRecording() {
    const runId = `${this.runPrefix}-${String(this.nextRun).padStart(4, '0')}`;
    const c = this.controller;
    const rec = this.daq.startRecording(this.t, {
      runId,
      clock: this.clock,
      objective: this.scenario?.objective || 'Open stand operation',
      scenario: this.scenario?.id || null,
      mode: this.mode,
      config: this.configSnapshot(),
    });
    if (!rec) return null;
    this.nextRun++;
    this.emit('recording', { on: true, runId });
    return rec.meta.runId ? rec : null;
  }

  configSnapshot() {
    const c = this.controller, d = this.daq;
    return {
      stand: this.def.id, article: this.def.article,
      regSet: c.regSet, plan: { ...c.plan }, rate: d.rate,
      supply: d.latest('PT-101'),
      valves: { ...c.cmd },
      prediction: this.prediction ? { ...this.prediction } : null,
    };
  }

  stopRecording(reason = 'operator') {
    const rec = this.daq.stopRecording(this.t, reason);
    if (!rec) return null;
    const firings = this.log.filter(e => e.cat === 'SEQ' && e.text === 'T-0' && e.t >= rec.start && e.t <= rec.stop).map(e => e.t);
    const aborts = this.log.filter(e => e.cat === 'ABT' && e.text.startsWith('ABORT') && e.t >= rec.start && e.t <= rec.stop);
    const alarms = this.log.filter(e => e.cat === 'ALM' && e.t >= rec.start && e.t <= rec.stop).map(e => e.text);
    const events = this.log.filter(e => e.t >= rec.start && e.t <= rec.stop && ['CMD', 'SEQ', 'ABT', 'ALM', 'IND'].includes(e.cat))
      .map(e => ({ t: e.t, cat: e.cat, text: e.text, level: e.level }));
    const seq = this._seqForRun(rec);
    const run = {
      id: rec.meta.runId, meta: rec.meta, data: rec.run, start: rec.start, stop: rec.stop, reason,
      tFire: firings[0] ?? null, firings, plan: seq?.plan || rec.meta.config.plan,
      cutoff: !!seq?.cutoff, aborted: aborts.length > 0, abort: aborts[0]?.text || null,
      alarms, events, notes: [], clock: rec.meta.clock,
    };
    run.metrics = run.tFire !== null ? computeMetrics(run, this.def) : null;
    this.runs.push(run);
    this.log.add(this.t, 'DAQ', `Recording STOPPED — ${run.id}, ${(run.stop - run.start).toFixed(1)} s, ${run.data.n} samples (${reason})`, { runId: run.id });
    this.emit('run', run);
    this.emit('recording', { on: false, runId: run.id });
    return run;
  }

  _seqForRun(rec) {
    const c = this.controller;
    const q = c.completed;
    if (q && q.tFire >= rec.start && q.tFire <= rec.stop) return q;
    return null;
  }

  onSequenceComplete(q) {
    if (this.controller.autoStop && this.daq.recording) {
      this.later(Math.max(0, this.controller.recordTail - 2), () => {
        if (this.daq.recording) this.stopRecording('auto-stop after sequence');
      });
    }
  }
}
