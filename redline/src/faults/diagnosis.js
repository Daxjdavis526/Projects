/* Scoring a diagnosis against what really happened. No DOM.

   100 points: the component (40), the failure mode (30), the evidence cited
   (20) and the recommended action (10). Partial credit where the reasoning
   was pointed the right way: the right kind of failure on the wrong part,
   the right subsystem for a sensor-versus-hardware call. The score matters
   less than the reveal that follows it — but reasoning that lands on the
   right answer for the wrong reasons scores lower than reasoning that cites
   the right evidence. */

export function scoreDiagnosis(sub, fault, { modes, rightAction }) {
  const parts = [];
  const cat = m => modes.find(x => x[0] === m)?.[2];
  const isSensorComp = id => /^(PT|TC|TT|LC|FT|EPC|DAQ|WT|OD|VIB|SE|ZT|IGN-I\b)/.test(id || '');
  if (!fault) {
    const saidNone = sub.mode === 'none' || sub.component === 'NONE';
    parts.push({ label: 'Fault present?', got: saidNone ? 70 : 0, max: 70, note: saidNone ? 'Correct: nothing was wrong.' : 'There was no fault. The stand and instruments were nominal.' });
    parts.push({ label: 'Evidence', got: saidNone ? Math.min(20, 5 * (sub.evidence?.length || 0)) : 0, max: 20, note: 'Calling a stand healthy needs evidence as much as calling it faulty.' });
    parts.push({ label: 'Action', got: sub.action === 'continue' || sub.action === 'retest' ? 10 : 0, max: 10, note: '' });
  } else {
    const comps = [fault.component, ...(fault.alt || [])];
    let c = 0, cn;
    if (sub.component === fault.component) { c = 40; cn = 'Correct component.'; }
    else if (comps.includes(sub.component)) { c = 30; cn = `Acceptable — the reference answer is ${fault.component}.`; }
    else if ((fault.category === 'sensor') === isSensorComp(sub.component) && sub.component && sub.component !== 'NONE') { c = 10; cn = `Right kind of thing (${fault.category === 'sensor' ? 'an instrument' : 'hardware'}), wrong one. It was ${fault.component}.`; }
    else cn = `It was ${fault.component}.`;
    parts.push({ label: 'Component', got: c, max: 40, note: cn });
    let m = 0, mn;
    if (sub.mode === fault.mode) { m = 30; mn = 'Correct failure mode.'; }
    else if (cat(sub.mode) && cat(sub.mode) === cat(fault.mode)) { m = 12; mn = `Right family of failure; the mode was "${modes.find(x => x[0] === fault.mode)[1]}".`; }
    else mn = `The mode was "${modes.find(x => x[0] === fault.mode)[1]}".`;
    parts.push({ label: 'Failure mode', got: m, max: 30, note: mn });
    const key = fault.evidence || [];
    const cited = new Set(sub.evidence || []);
    const hits = key.filter(k => cited.has(k));
    const e = key.length ? Math.round(20 * Math.min(1, hits.length / Math.min(3, key.length))) : 0;
    parts.push({ label: 'Evidence', got: e, max: 20, note: hits.length ? `Cited: ${hits.join(', ')}.` : 'None of the key evidence was cited.', key });
    const ok = (rightAction[fault.mode] || []).includes(sub.action);
    parts.push({ label: 'Recommended action', got: ok ? 10 : 0, max: 10, note: ok ? '' : `Better: ${(rightAction[fault.mode] || []).join(' or ')}.` });
  }
  const score = parts.reduce((s, p) => s + p.got, 0);
  return { score, parts, grade: score >= 85 ? 'Diagnosed' : score >= 55 ? 'Partly diagnosed' : 'Missed' };
}

/* Was stopping right? A judgement on the operator's handling, from what
   actually happened and whether the fault was a hazard. */
export function abortAssessment(S, fault) {
  const aborted = S.log.has(e => e.cat === 'ABT' && e.text.startsWith('ABORT'));
  const manual = S.log.has(e => e.cat === 'ABT' && e.text.startsWith('ABORT') && /manual/.test(e.text));
  const heldBeforeFire = S.polls.some(p => !p.go) && !S.log.has(e => e.cat === 'SEQ' && e.text === 'T-0');
  const fired = S.log.has(e => e.cat === 'SEQ' && e.text === 'T-0');
  const lines = [];
  if (heldBeforeFire) lines.push(fault ? 'You held before firing (NO-GO). Catching a problem before T-0 is the best outcome a test engineer gets.' : 'You held before firing, and the stand was in fact nominal. A cautious NO-GO costs minutes; it was not wrong to ask the question — but look at what made you doubt.');
  else if (!fired) lines.push('The stand was never fired.');
  if (aborted) lines.push(manual ? 'You aborted manually.' : 'The abort was automatic (a redline).');
  if (fault?.hazard && fired && !aborted) lines.push('The fault was a genuine hazard and the test ran to its end. Watch for the evidence earlier: this is a case for NO-GO or for stopping.');
  if (fault && !fault.hazard && aborted) lines.push('The real state was not hazardous. Aborting on the data you had is never wrong — the lesson is in finding out whether the data were real before retesting.');
  if (!fault && aborted) lines.push('Nothing was wrong with the stand; check what the abort acted on.');
  return lines;
}
