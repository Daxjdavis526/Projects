/* The go/no-go poll.

   The test conductor calls each station in turn; each station answers from
   its own data. Stations are defined per stand (content/stands/*-gonogo.js):
   each is a list of items, and each item reports a fact — a value — and
   whether that fact is acceptable.

   In tutorial and guided modes the stations make their own call and say why.
   In independent mode they only report the facts; the conductor decides.
   Either way the simulator knows whether each station SHOULD have been GO,
   and remembers whether the conductor's final call was right. Catching a
   problem before firing is worth more than any clean firing. */

export function runPoll(session) {
  const v = session.view();
  const stations = session.def.gonogo.map(st => {
    const items = st.items.map(it => {
      let r;
      try { r = it.eval(v); } catch (e) { r = { value: 'check error', ok: false }; }
      return { label: it.label, value: r.value, ok: !!r.ok, note: r.note || it.note || '', why: it.why || '' };
    });
    return { id: st.id, name: st.name, role: st.role, items, go: items.every(i => i.ok) };
  });
  return { t: session.t, epoch: session.controller.epoch, stations, allGo: stations.every(s => s.go) };
}

/* Record the conductor's decision. `calls` maps station id → 'GO'|'NO-GO'
   (the conductor's reading of each station); `final` is 'GO'|'NO-GO'. */
export function concludePoll(session, poll, calls, final) {
  const go = final === 'GO';
  const missed = poll.stations.filter(s => !s.go && calls[s.id] === 'GO').map(s => s.id);
  const falseAlarms = poll.stations.filter(s => s.go && calls[s.id] === 'NO-GO').map(s => s.id);
  const correct = go === poll.allGo;
  const result = { ...poll, calls, final, go, correct, missed, falseAlarms, tEnd: session.t };
  const c = session.controller;
  c.pollResult = result;
  c.pollEpoch = go ? poll.epoch : -1;
  session.polls.push(result);
  const summary = poll.stations.map(s => `${s.name} ${calls[s.id]}`).join(', ');
  session.log.add(session.t, 'SEQ', `Go/no-go poll: ${summary}. Test conductor: ${final}${go ? '' : ' — HOLD'}`,
                  { level: go ? 'info' : 'caution', poll: true });
  if (!correct) {
    // Not announced to the operator here — revealed at debrief.
    session.pollMisses.push({ t: session.t, missed, allGo: poll.allGo, final });
  }
  session.emit('poll', result);
  return result;
}
