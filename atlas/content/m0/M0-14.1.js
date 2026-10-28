// Statements, implication and negation — truth tables, the converse fallacy, the contrapositive, and negating "for every" and "there is".
import { lesson, mcq, match } from '../../src/core/content.js';
import { euler, truthTable } from './_m0reason.js';

const t = String.raw;
const TT = truthTable(['P', 'Q', 'P \\Rightarrow Q'], (p, q) => [p, q, !p || q]);
const MU = 398600.4, RE = 6371;   // km³/s², km

export default lesson({
  id: 'm0.M0-14.1',
  title: 'Statements, implication and negation',
  minutes: 10, difficulty: 2,
  intro: t`A **statement** is a sentence that is either true or false. From two statements $P$ and $Q$ you can build the **implication** $P \Rightarrow Q$, “if $P$ then $Q$”. It makes one promise: whenever $P$ holds, $Q$ holds. So it is false in exactly one case, $P$ true and $Q$ false:

${TT}

Picture it as regions: $P \Rightarrow Q$ says the region where $P$ holds sits inside the region where $Q$ holds. Then:

$$P \Rightarrow Q \quad\text{is equivalent to}\quad \neg Q \Rightarrow \neg P$$

the **contrapositive** (outside $Q$ means outside $P$). The **converse** $Q \Rightarrow P$ is a different claim and may be false. To **negate**, flip each quantifier and negate what follows: “not (every $x$ has $P$)” is “some $x$ lacks $P$”; and “not ($P \Rightarrow Q$)” is “$P$ and not $Q$”.`,
  symbols: [
    { tex: 'P,\\ Q', text: 'statements: sentences that are true or false' },
    { tex: '\\Rightarrow', text: '“implies”: $P \\Rightarrow Q$ reads “if $P$ then $Q$”' },
    { tex: '\\neg', text: '“not”: $\\neg P$ is true exactly when $P$ is false' },
    { tex: '\\forall,\\ \\exists', text: '“for every” and “there exists”' },
    { tex: '\\text{T},\\ \\text{F}', text: 'true and false, in the truth table' },
  ],
  why: t`Every theorem you will use — “differentiable implies continuous”, “a closed system conserves energy” — is an implication with conditions. Knowing what it does *not* say (its converse) and how to use it backwards (its contrapositive) is what [the proof techniques of Foundations G1](#/lesson/st-g.G1.1) build on.`,
  visual: {
    type: 'graph',
    title: 'An implication as one region inside another',
    lead: t`$P$: “the orbit is a circle”. $Q$: “the orbit is closed (an ellipse)”. Every circle is an ellipse, so the $P$ region sits inside the $Q$ region. Drag the white point and read the truth values below (1 = true, 0 = false).`,
    tasks: [
      t`Drag the point anywhere: “$P \Rightarrow Q$” never reads $0$. The only way to break it would be a point inside $P$ but outside $Q$ — and there is none.`,
      t`Put the point in the ring between the circles: $Q$ true, $P$ false — an eccentric ellipse. That is a counterexample to the **converse**, $Q \Rightarrow P$.`,
      t`Put it outside both (a hyperbolic flyby): $P$ and $Q$ are false, yet $P \Rightarrow Q$ is true. A false hypothesis makes no promise to break.`,
    ],
    params: {
      ...euler({ inner: 'circles (P)', outer: 'closed orbits (Q)', outsideLabel: 'open orbits' }).params,
      drag: [{ key: 'p', x: 3.2, y: -1.4 }],
      readouts: [
        { label: t`$P$ (circle)`, expr: 'step(1 - sqrt((px + 0.9)^2 + py^2))', digits: 1 },
        { label: t`$Q$ (closed)`, expr: 'step(2.2 - sqrt(px^2 + py^2))', digits: 1 },
        { label: t`$P \Rightarrow Q$`, expr: '1 - step(1 - sqrt((px + 0.9)^2 + py^2))*(1 - step(2.2 - sqrt(px^2 + py^2)))', digits: 1 },
        { label: t`converse $Q \Rightarrow P$`, expr: '1 - step(2.2 - sqrt(px^2 + py^2))*(1 - step(1 - sqrt((px + 0.9)^2 + py^2)))', digits: 1 },
      ],
    },
    caption: t`An Euler diagram: each point is one orbit (Newtonian two-body orbits only). Region sizes mean nothing; only which region lies inside which.`,
  },
  example: {
    prompt: t`Take the true statement “If a spacecraft is orbiting the Earth, it is in free fall” (engines off, no drag). Write its converse, contrapositive and negation, and say which are true.`,
    visual: euler({ inner: 'orbiting', outer: 'in free fall', outsideLabel: 'resting on a pad', points: [{ x: 1.3, y: -0.9, color: 'gold', r: 5, label: 'a dropped ball', labelDx: 8, labelDy: 12 }], caption: t`Everything orbiting is in free fall, but not everything in free fall is orbiting: a dropped ball is in the outer region only.` }),
    steps: [
      { label: 'Name the parts', text: t`$P$: “it is orbiting the Earth”. $Q$: “it is in free fall”. The statement is $P \Rightarrow Q$, and it is true: an orbit *is* free fall that keeps missing the ground.` },
      { label: 'Converse', text: t`$Q \Rightarrow P$: “if it is in free fall, it is orbiting”. **False**: a ball dropped from a tower is in free fall and hits the ground. One counterexample kills it.` },
      { label: 'Contrapositive', text: t`$\neg Q \Rightarrow \neg P$: “if it is not in free fall, it is not orbiting”. **True**, automatically, because it says the same as the original: outside the big region means outside the small one.` },
      { label: 'Negation', text: t`$\neg(P \Rightarrow Q)$ is $P \wedge \neg Q$: “it is orbiting **and** it is not in free fall”. Since the original is true, this is false. A negated implication is not another implication.` },
    ],
    answer: t`Converse false; contrapositive true (equivalent to the original); negation “orbiting and not in free fall”, false.`,
  },
  practice: [
    match({
      id: 'forms', difficulty: 2,
      prompt: t`Start from: “If the engine is firing, the chamber is hot.” Match each name to its sentence.`,
      left: ['the converse', 'the contrapositive', 'the inverse', 'the negation'],
      right: ['If the chamber is hot, the engine is firing.', 'If the chamber is not hot, the engine is not firing.', 'If the engine is not firing, the chamber is not hot.', 'The engine is firing and the chamber is not hot.', 'The engine is not firing and the chamber is hot.'],
      answer: [0, 1, 2, 3],
      hints: [t`Converse swaps $P$ and $Q$; contrapositive swaps *and* negates both; inverse negates both without swapping; the negation of $P \Rightarrow Q$ is “$P$ and not $Q$”.`],
      teach: t`Only the contrapositive says the same as the original; the converse and the inverse say the same as each other.`,
      explain: t`With $P$ = “engine firing” and $Q$ = “chamber hot”: converse $Q \Rightarrow P$, contrapositive $\neg Q \Rightarrow \neg P$, inverse $\neg P \Rightarrow \neg Q$, negation $P \wedge \neg Q$. The chamber stays hot for a while after shutdown, so the converse (and the inverse) are false while the original is true.`,
      visual: euler({ inner: 'firing', outer: 'chamber hot', outsideLabel: 'cold', points: [{ x: 1.25, y: -0.8, color: 'gold', r: 5, label: 'just shut down', labelDx: 8, labelDy: -10 }], caption: t`Firing lies inside hot; just after shutdown the chamber is hot but the engine is not firing.` }),
    }),
    mcq({
      id: 'equilibrium', difficulty: 2,
      prompt: t`A statics rule: “If a rigid body is in equilibrium, the net force on it is zero.” Which statement is equivalent to it?`,
      choices: [t`If the net force on a rigid body is not zero, it is not in equilibrium.`, t`If the net force on a rigid body is zero, it is in equilibrium.`, t`If a rigid body is not in equilibrium, the net force on it is not zero.`, t`A rigid body is in equilibrium and the net force on it is not zero.`],
      answer: 0,
      why: {
        1: t`That is the converse, and it is false: two equal and opposite forces along different lines (a couple) add to zero but still set the body spinning.`,
        2: t`That is the inverse, which says the same as the converse — false for the same spinning body.`,
        3: t`That is the negation: it contradicts the rule rather than restating it.`,
      },
      hints: [t`The equivalent form swaps the two parts *and* negates both.`],
      teach: t`An implication is equivalent to its contrapositive, never to its converse.`,
      explain: t`$P \Rightarrow Q$ is equivalent to $\neg Q \Rightarrow \neg P$: any unbalanced force proves at once that the body is not in equilibrium. Equilibrium needs zero net torque as well, which is why the converse fails.`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-1.5, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', shade: [{ fn: '0.12', lower: '-0.12', from: -2, to: 2, color: 'ink3', alpha: 0.5 }], arrows: [{ from: [-1.9, 0.1], to: [-1.9, 1.3], color: 'accent', label: 'F', labelDx: 8 }, { from: [1.9, -0.1], to: [1.9, -1.3], color: 'accent', label: 'F', labelDx: 8 }] }, caption: t`A couple: equal and opposite forces at the two ends of a bar. The net force is zero, but the bar starts to turn. Arrows show directions only.` },
    }),
    mcq({
      id: 'when-false', difficulty: 1,
      prompt: t`When is the implication $P \Rightarrow Q$ false?`,
      choices: [t`only when $P$ is true and $Q$ is false`, t`whenever $P$ is false`, t`only when $P$ is false and $Q$ is true`, t`whenever $P$ and $Q$ are both false`],
      answer: 0,
      why: {
        1: t`A false hypothesis makes no promise, so nothing can break it: $P \Rightarrow Q$ is *true* when $P$ is false.`,
        2: t`$P$ false, $Q$ true breaks nothing: the promise was only about what happens when $P$ holds.`,
        3: t`Both false is consistent with the promise: the implication is true there.`,
      },
      hints: [t`An implication is a promise: “whenever $P$, also $Q$”. Which case breaks the promise?`],
      teach: t`$P \Rightarrow Q$ is false only in the row $P$ true, $Q$ false.`,
      explain: t`Of the four rows of the truth table only $P = \text{T}$, $Q = \text{F}$ breaks the promise. In the picture, that is a point inside $P$ but outside $Q$ — which is why a true implication draws $P$ inside $Q$.`,
      visual: euler({ points: [{ x: -0.9, y: 0, color: 'good', r: 5, label: 'T, T', labelDx: 8, labelDy: 14 }, { x: 1.4, y: 0.4, color: 'good', r: 5, label: 'F, T', labelDx: 8, labelDy: 12 }, { x: 3.4, y: -1, color: 'good', r: 5, label: 'F, F', labelDx: 8, labelDy: 12 }], caption: t`Points labelled with ($P$, $Q$). For $P \Rightarrow Q$ to fail you would need a point inside $P$ and outside $Q$, and the picture has no such place.` }),
    }),
    mcq({
      id: 'negate-all', difficulty: 2,
      prompt: t`Which is the negation of “Every satellite in geostationary orbit has an orbital period of one sidereal day”?`,
      choices: [t`Some satellite in geostationary orbit has a period other than one sidereal day.`, t`No satellite in geostationary orbit has a period of one sidereal day.`, t`Every satellite in geostationary orbit has a period other than one sidereal day.`, t`Some satellite not in geostationary orbit has a period of one sidereal day.`],
      answer: 0,
      why: {
        1: t`Too strong. To show “every” fails you need only one exception, not for all of them to fail.`,
        2: t`Also too strong, for the same reason: “not every” means “at least one does not”.`,
        3: t`Satellites outside geostationary orbit are irrelevant to a claim about geostationary ones.`,
      },
      hints: [t`$\neg(\forall x,\ P(x))$ is $\exists x,\ \neg P(x)$.`],
      teach: t`“Not every $x$ has $P$” means “some $x$ lacks $P$”: one counterexample.`,
      explain: t`The negation of a “for every” claim is a “there exists” claim with the inside negated. (The original is true by definition: a geostationary orbit has a period of one sidereal day, about $23$ h $56$ min, so the negation is false.)`,
      visual: euler({ inner: 'GEO satellites', outer: 'period = 1 sidereal day', points: [{ x: 3.6, y: -1.3, color: 'warn', r: 6, label: 'a counterexample would sit here', labelAlign: 'right', labelDx: -10, labelDy: 18, hollow: true }], innerR: 1.1, caption: t`“Every GEO satellite has a one-day period” draws GEO inside the one-day region. The negation needs just one GEO satellite outside it (hollow ring).` }),
    }),
    mcq({
      id: 'negate-nested', difficulty: 3,
      prompt: t`Negate: “For every $\varepsilon > 0$ there is a $\delta > 0$ such that every $x$ with $|x - a| < \delta$ has $|f(x) - L| < \varepsilon$.”`,
      choices: [
        t`There is an $\varepsilon > 0$ such that for every $\delta > 0$ some $x$ with $|x - a| < \delta$ has $|f(x) - L| \ge \varepsilon$.`,
        t`For every $\varepsilon > 0$ there is a $\delta > 0$ such that some $x$ with $|x - a| < \delta$ has $|f(x) - L| \ge \varepsilon$.`,
        t`There is an $\varepsilon > 0$ and a $\delta > 0$ such that every $x$ with $|x - a| < \delta$ has $|f(x) - L| \ge \varepsilon$.`,
        t`For every $\varepsilon > 0$ and every $\delta > 0$, every $x$ has $|f(x) - L| \ge \varepsilon$.`,
      ],
      answer: 0,
      why: {
        1: t`Only the innermost part was negated. Every quantifier must flip: “for every $\varepsilon$” becomes “there is an $\varepsilon$”, and “there is a $\delta$” becomes “for every $\delta$”.`,
        2: t`“There is a $\delta$” must become “for every $\delta$”; and “every $x$” becomes “some $x$”, not stays “every”.`,
        3: t`Far too strong: one bad $\varepsilon$ and, for each $\delta$, one bad $x$ are enough.`,
      },
      hints: [t`Work from the outside in: $\neg\forall = \exists\neg$ and $\neg\exists = \forall\neg$.`, t`The last part, “$|f(x) - L| < \varepsilon$ for every such $x$”, becomes “some such $x$ has $|f(x) - L| \ge \varepsilon$”.`],
      teach: t`To negate a nested statement, flip every quantifier in order and negate the final condition.`,
      explain: t`$\neg(\forall\varepsilon\,\exists\delta\,\forall x\ C)$ is $\exists\varepsilon\,\forall\delta\,\exists x\ \neg C$. This is exactly what it means for $f(x)$ *not* to tend to $L$ as $x \to a$: one tolerance $\varepsilon$ that no window $\delta$, however narrow, can meet — as at a jump.`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-0.5, 2.5], aspect: 'wide', xlabel: 'x', ylabel: 'f(x)', curves: [{ fn: '0.5 + 0.2*x', domain: [-2, 0], color: 'accent' }, { fn: '1.7 + 0.2*x', domain: [0, 2], color: 'accent' }], shade: [{ fn: '0.9', lower: '0.1', from: -2, to: 2, color: 'good', alpha: 0.15 }], hlines: [{ y: 0.5, color: 'good', label: 'L' }], points: [{ x: 0, y: 0.5, color: 'accent', r: 4.5 }, { x: 0, y: 1.7, color: 'accent', r: 4.5, hollow: true }] }, caption: t`A function with a jump at $a = 0$ and the band $L \pm \varepsilon$ (green): every window round $0$, however narrow, contains points to the right whose values leave the band.` },
    }),
    mcq({
      id: 'affirm-consequent', difficulty: 2,
      prompt: t`A test-stand rule: “If the turbopump fails, the chamber pressure drops.” During a hot fire, the chamber pressure drops. What follows for certain?`,
      choices: ['Nothing certain about the turbopump: something else could have dropped the pressure', 'The turbopump failed', 'The turbopump did not fail', 'The rule was wrong'],
      answer: 0,
      why: {
        1: t`That is the converse fallacy (“affirming the consequent”): the rule says failure ⇒ pressure drop, not the reverse. A closing valve or a leak drops the pressure too.`,
        2: t`Nothing says the pump is fine either; a pressure drop is consistent with a failure.`,
        3: t`The rule is not contradicted: its only forbidden case is a failed pump with no pressure drop.`,
      },
      hints: [t`Draw the rule as “pump failures” inside “pressure drops”. Where can a pressure drop lie?`],
      teach: t`$P \Rightarrow Q$ and $Q$ together do not give $P$: that is the converse fallacy.`,
      explain: t`The pressure drop puts us somewhere in the big region, which also holds causes other than pump failure. Only the contrapositive runs backwards: *no* pressure drop would prove the pump had not failed.`,
      visual: euler({ inner: 'pump fails', outer: 'pressure drops', points: [{ x: 1.3, y: -0.9, color: 'gold', r: 5, label: 'valve closes', labelDx: 8, labelDy: 12 }], caption: t`Pump failures sit inside pressure drops, but other causes (a closing valve) also drop the pressure.` }),
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-ligo', difficulty: 2, transfer: true,
      prompt: t`Gravitational waves travel at the speed of light, and the two LIGO detectors are about $3000$ km apart, so a working rule is: “If a signal is a real gravitational wave, it appears in both detectors within $10$ ms of each other.” With both detectors running, a candidate signal appears in Hanford but not in Livingston. What follows?`,
      choices: ['The candidate is not a real gravitational wave', 'The candidate is a real gravitational wave', 'Nothing follows from the rule', 'If it had appeared in both, it would certainly have been real'],
      answer: 0,
      why: {
        1: t`The rule never says a one-detector signal is real; it says the opposite, by its contrapositive.`,
        2: t`Something does follow: the contrapositive, “not in both ⇒ not real”, applies directly.`,
        3: t`That is the converse, which the rule does not claim: two detectors can also pick up a coincidence of noise.`,
      },
      hints: [t`The rule is $P \Rightarrow Q$ with $P$ = “real wave”, $Q$ = “seen in both within $10$ ms”. Here $Q$ is false.`],
      teach: t`From $P \Rightarrow Q$ and not $Q$, conclude not $P$: the contrapositive at work.`,
      explain: t`$\neg Q \Rightarrow \neg P$: a signal missing from one detector is not a real wave (given that the rule’s assumptions hold, such as both detectors working). This is exactly how LIGO rejects local glitches: $10$ ms is the light-travel time between the sites.`,
      visual: euler({ inner: 'real waves', outer: 'seen in both', points: [{ x: 3.3, y: -1.2, color: 'warn', r: 5, label: 'the candidate', labelAlign: 'right', labelDx: -10, labelDy: 14 }], caption: t`Real waves lie inside “seen in both detectors within 10 ms”. The candidate is outside that region, so it is outside the real-wave region too.` }),
    }),
    mcq({
      id: 'cp-negate', difficulty: 2,
      prompt: t`Negate: “There is an orbit around the Earth with a period of less than $80$ minutes.”`,
      choices: ['Every orbit around the Earth has a period of at least 80 minutes.', 'There is an orbit around the Earth with a period of at least 80 minutes.', 'Every orbit around the Earth has a period of less than 80 minutes.', 'No orbit around the Earth has a period of at least 80 minutes.'],
      answer: 0,
      why: {
        1: t`That is consistent with the original, not its opposite: both could be true at once.`,
        2: t`“There is” must become “every”, but the condition must be negated too: “less than” becomes “at least”.`,
        3: t`This says every orbit is shorter than $80$ minutes — the inner condition was not negated.`,
      },
      hints: [t`$\neg(\exists x,\ P(x))$ is $\forall x,\ \neg P(x)$. What is the negation of “less than $80$”?`],
      teach: t`“Not (there is an $x$ with $P$)” is “every $x$ has not-$P$”.`,
      explain: t`The negation is “every orbit has a period of at least $80$ minutes” — and it is the true one. Even an orbit skimming the surface (no air) would take $2\pi\sqrt{R^3/GM} = ${(2 * Math.PI * Math.sqrt(RE ** 3 / MU) / 60).toFixed(1)}$ minutes, and higher orbits take longer.`,
      visual: { type: 'graph', params: { x: [0, 2000], y: [70, 130], aspect: 'wide', xlabel: 'altitude of a circular orbit (km)', ylabel: 'period (min)', curves: [{ fn: `2*pi*sqrt((${RE} + x)^3/${MU})/60`, color: 'accent' }], hlines: [{ y: 80, color: 'warn', label: '80 min' }] }, caption: t`The period of a circular orbit against its altitude (Newtonian gravity, a spherical Earth, no air). It never drops below about $84$ minutes.` },
    }),
    mcq({
      id: 'cp-vacuous', difficulty: 3, transfer: true,
      prompt: t`A mission rule says: “If a spacecraft’s speed at perigee exceeds the local escape speed, it leaves on an open orbit.” A probe passes perigee *below* escape speed, then fires its engine later and leaves anyway. Does this break the rule?`,
      choices: ['No: the rule only promises something when the speed exceeds escape speed', 'Yes: the probe left without exceeding escape speed at perigee', 'Yes: the rule implies slower spacecraft never leave', 'It cannot be decided without more data'],
      answer: 0,
      why: {
        1: t`That would break the *inverse* (“below escape speed ⇒ stays”), which the rule never claimed.`,
        2: t`The rule says nothing about slower spacecraft; reading it that way is the inverse error.`,
        3: t`The rule and the facts are enough: the probe’s case has a false hypothesis, so the rule is not tested by it at all.`,
      },
      hints: [t`Which row of the truth table is this case: $P$ true or false?`, t`An implication is broken only by $P$ true and $Q$ false.`],
      teach: t`An implication is not broken by a case where its hypothesis is false.`,
      explain: t`Here $P$ (faster than escape at perigee) is false and $Q$ (leaves) is true: a row where $P \Rightarrow Q$ is true. Only a probe faster than escape that failed to leave would break the rule.`,
      visual: euler({ inner: 'faster than escape', outer: 'leaves', points: [{ x: 1.35, y: -0.85, color: 'gold', r: 5, label: 'the probe', labelDx: 8, labelDy: 12 }], caption: t`The probe lies in “leaves” but outside “faster than escape at perigee”: allowed by the rule.` }),
    }),
  ],
  sources: [
    { label: 'R. Hammack, Book of Proof (3rd ed.), ch. 2 Logic', url: 'https://richardhammack.github.io/BookOfProof/' },
    { label: 'LIGO Scientific Collaboration, Observation of Gravitational Waves from a Binary Black Hole Merger (2016)', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' },
  ],
});
