# Learning science and engagement design for "The Physics Atlas"

Scope: the evidence behind, and concrete specifications for, mastery estimation, skill-level spaced review, lesson design, hints and feedback, confidence and metacognition, gamification, checkpoint and boss-battle assessment, and onboarding/placement for a single-learner, client-side, mastery-based physics and mathematics academy (algebra through graduate general relativity).

How to read these notes:
- **Evidence grades** (used on every recommendation under *Inferences*): **Strong** = several meta-analyses or large field RCTs agree; **Moderate** = meta-analytic or repeated experimental support, but with important moderators, mostly lab settings, or mixed results; **Weak** = few studies, correlational data, or product case studies; **Speculative** = a design extrapolation or a parameter value with no direct empirical test.
- **Verification tags** (on every *Cited Finding*): **(V)** = I checked the content this session against the linked page or file. **(P)** = from the primary literature, cited by DOI from my prior knowledge, not re-fetched this session. **(P\*)** = like (P), but the DOI or a specific number is recalled with less certainty, so spot-check it before publishing. Why so much is (P): the session's shared web-search budget ran out after the first round of searches, and the fetch tool could only reach GitHub-hosted pages. Publisher (Springer), arXiv, doi.org, PNAS, ACL Anthology, PhET, Duolingo blog, Math Academy and the authors' own sites (justinmath.com, fi.muni.cz) all failed DNS from the fetch tool. Khan Academy, Brilliant and Desmos pages were not attempted.
- Numbers marked **computed** were calculated this session from the stated formulas. The scripts are at `/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/research/calc/models.py` and `/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/research/calc/journey.py`.

---

## 1. Mastery estimation: which learner model, with what formulas, thresholds and states, for a single learner with no population data?

### Takeaway
BKT, PFA and IRT all need parameters fitted to population response data, which a single-learner browser app does not have. An Elo-style logistic estimate does not: it needs only author-assigned item difficulties and a shrinking step size, and it accepts partial-credit outcomes, so hints and retries can lower the *evidence* without lowering *XP*. Recommended: a per-skill Elo estimate with an uncertainty-decaying K and context weights. State promotion should be gated by *types* of evidence (independent success, delayed retention, mixed/transfer success), and the estimate should be paired with a per-skill FSRS memory state for "review due" (Section 2). States should be shown as words plus an evidence checklist, never as percentages. Evidence: moderate for the model family; the constants are speculative but were checked by simulation.

### Cited Findings
**Mastery learning itself**
- Across 108 controlled evaluations, mastery-learning programs raised exam scores by about 0.52 SD on average. Gains were larger for weaker students, and the programs needed more instructional time (P) — [Kulik, Kulik & Bangert-Drowns 1990](https://doi.org/10.3102/00346543060002265)
- Bloom reported about 2σ gains for one-to-one tutoring combined with mastery learning, and about 1σ for group mastery learning (P) — [Bloom 1984](https://doi.org/10.3102/0013189X013006004). A later synthesis found smaller effects: human tutoring d ≈ 0.79, step-based tutoring systems d ≈ 0.76, substep-based d ≈ 0.40, answer-based systems d ≈ 0.31 (P) — [VanLehn 2011](https://doi.org/10.1080/00461520.2011.611369)

**Bayesian Knowledge Tracing (BKT)**
- BKT models each skill as a two-state hidden Markov model with four parameters: P(L0) (prior knowledge), P(T) (learning per opportunity), P(G) (guess) and P(S) (slip). The updates are:
  - after a correct answer: P(L|correct) = P(L)(1−S) / [P(L)(1−S) + (1−P(L))G]
  - after an error: P(L|wrong) = P(L)S / [P(L)S + (1−P(L))(1−G)]
  - then: P(L_next) = P(L|obs) + (1−P(L|obs))·T

  Mastery is conventionally declared at P(L) ≥ 0.95 (P) — [Corbett & Anderson 1995](https://doi.org/10.1007/BF01099821)
- In the reference Python implementation, the parameters (prior, learns, guesses, slips, optional forgets) are fitted by EM to response logs, with per-item and per-student variants. The README's own example says "After 10 consecutive correct responses, he should have mastered the skill" — a property of the fitted parameters, not a principled default (V) — [pyBKT README](https://github.com/CAHLR/pyBKT)
- Unconstrained BKT fits can be degenerate (parameters that imply knowing a skill makes correct answers *less* likely). Practitioners therefore bound guess and slip, commonly guess ≤ 0.3 and slip ≤ 0.1 (P\*) — [Baker, Corbett & Aleven 2008](https://doi.org/10.1007/978-3-540-69132-7_44)

**Performance Factors Analysis (PFA)**
- PFA is a logistic model over prior successes s and failures f on each knowledge component j: m = Σ_j (β_j + γ_j·s_j + ρ_j·f_j), p = 1/(1+e^(−m)). β, γ and ρ are fitted per skill from data (P\*) — [Pavlik, Cen & Koedinger 2009](https://doi.org/10.3233/978-1-60750-028-5-531)

**Elo-style ratings**
- Pelánek treats each answer as a "match" between learner and item:
  - learner skill: θ ← θ + K·(c − P)
  - item difficulty: b ← b − K·(c − P)
  - expected score: P = 1/(1+e^(−(θ−b)))

  He argues the system is simple, robust and effective for adaptive educational systems, and that a constant K should be replaced by an uncertainty function that shrinks with the number of updates, of the form U(n) = α/(1+β·n). For a multiple-choice item with k options, the expected score can include a guessing floor: P = 1/k + (1−1/k)·σ(θ−b). (P; I confirmed the manuscript exists but did not read it) — [Pelánek 2016, accepted manuscript](https://www.fi.muni.cz/~xpelanek/publications/CAE-elo.pdf), [DOI](https://doi.org/10.1016/j.compedu.2016.03.017)
- Recent measurement work, from search-result summaries only (full texts not retrieved):
  - A 2025 *British Journal of Mathematical and Statistical Psychology* paper finds that Elo ratings are generally not unbiased and that their variances depend on context. When items are chosen adaptively from current ratings, the ratings do not converge; the paper proposes two parallel rating chains as a fix.
  - A 2026 *User Modeling and User-Adapted Interaction* paper (Vermeiren et al.) studies a dynamic K that trades responsiveness against stability.

  The mapping of these links to these two papers is inferred from the search listing (V, summary level) — [Tilburg "Keeping Elo alive" record](https://research.tilburguniversity.edu/en/publications/keeping-elo-alive-evaluating-and-improving-measurement-properties/); [PMC article](https://pmc.ncbi.nlm.nih.gov/articles/PMC12784335); [imec record](https://imec-publications.be/bitstreams/ce066f54-8369-42ce-b672-9c6eccc0aa0e/download)

**Model comparison, IRT and mastery criteria**
- A survey of learner-modeling techniques (BKT, logistic models including PFA and Elo, IRT) finds that differences in predictive accuracy among reasonable models are often small. It also notes that IRT assumes a static ability and needs item calibration data; the Rasch expected-score function is the same logistic that Elo updates online (P) — [Pelánek 2017](https://doi.org/10.1007/s11257-017-9193-2)
- An experimental comparison of mastery criteria found that the threshold mattered more for mastery decisions than the choice of model. A simple exponential-moving-average criterion was competitive with model-based criteria (P\*) — [Pelánek & Řihák 2017](https://doi.org/10.1145/3079628.3079667)

**Why practice performance must not be read as mastery**
- Performance during acquisition (for example, massed practice right after instruction) is an unreliable index of durable learning. Conditions that depress practice performance can improve retention and transfer (P) — [Soderstrom & Bjork 2015](https://doi.org/10.1177/1745691615569000)
- In blocked practice, students scored 89% during practice but only 20% on a test a week later. Interleaved practice scored 60% during practice and 63% on the delayed test (P) — [Rohrer & Taylor 2007](https://doi.org/10.1007/s11251-007-9015-8)
- Across many datasets, students differ widely in initial knowledge but learn at strikingly similar rates per practice opportunity (P\*) — [Koedinger, Carvalho, Liu & McLaughlin 2023](https://doi.org/10.1073/pnas.2221311120)
- Displayed meters drive behaviour. Before HLR, Duolingo learners said they practised "just to keep the tree gold" even though practice did not review what they needed most (V) — [Settles & Meeder 2016](https://doi.org/10.18653/v1/P16-1174)

### Inferences
**Comparison for this product** (Moderate)

| Model | Needs population data to fit? | Item difficulty | Hints / attempts | Forgetting | Fit for the Atlas |
|---|---|---|---|---|---|
| BKT | Yes: 4 parameters per skill; defaults are arbitrary and fits can be degenerate | No (unless extended) | Binary observations only | None (standard) | Poor as the primary model; its P(L) looks precise without being so |
| PFA | Yes: β, γ, ρ per skill | Only through extensions | Could weight the counts | None without a decay extension | Poor |
| IRT (1–3PL) | Yes: item calibration across many examinees | Yes | No | No (static ability) | Use only its Rasch logistic, inside Elo |
| Elo with uncertainty-K | No for the learner; item difficulty is authored | Yes | Fractional score c ∈ [0,1] works naturally | Pair with a memory model | **Recommended core** |
| Heuristics (N-in-a-row, EMA, Beta) | No | No | Through c | Through the decay rate | Fallback and sanity check |

**Recommended "Atlas Evidence Model"** (model family Moderate; constants Speculative, tuned by simulation)
1. **Item metadata, authored once.**
   - Difficulty tier b: T1 routine single step = −1.0; T2 standard = 0.0; T3 multi-step = +0.75; T4 novel context or transfer = +1.5.
   - Guess floor g: 1/k for k-option multiple choice; 0 for numeric or symbolic entry.
   - Context type: lesson, checkpoint, review, mixed, transfer, boss.
   - Skill tags: one primary skill plus "encompassed" component skills, each with a weight e ∈ {0.25, 0.5, 1.0}.
2. **Evidence score for each response: c = A × H.**
   - A (attempt): 1.0 if correct on the first attempt, 0.5 on the second, 0.25 on the third.
   - H (hint rung reached): none = 1.0; rung 1 (orienting question or first step) = 0.7; rung 2 (principle) = 0.4; rung 3 (near-solution) or full solution viewed = 0.
   - Wrong after the last attempt, or "I don't know": c = 0.
   - c is used only for mastery. XP never depends on it (Section 4).
3. **Expected score:** P = g + (1 − g)·σ(θ_s − b_i), where σ(x) = 1/(1+e^(−x)).
4. **Update:** θ_s ← θ_s + K(n_s)·w·(c − P), with K(n) = max(0.2, 1/(1 + 0.05·n)).
   - n_s = number of earlier scored responses on skill s.
   - The 0.2 floor keeps the estimate responsive, which matters because Elo itself has no forgetting term (compare the dynamic-K work above).
5. **Context weight w:**
   - 0.75 for in-lesson practice (massed, right after the worked example; see Soderstrom & Bjork)
   - 1.0 for checkpoint and daily challenge items
   - 1.25 for a spaced review (≥ 3 days since the last success on s) or a mixed review where the skill is not announced
   - 1.5 for transfer and boss items
6. **Starting values:**
   - θ0 = −1.0 for an unseen skill (P ≈ 0.27 on a T2 item).
   - θ0 = −0.5 if the learner reports recent coursework. This only changes the starting point; it never sets a state.
   - θ0 = +1.0 when a diagnostic places the skill (Section 8).
7. **Items that exercise several skills:**
   - The primary skill gets the full update.
   - Each encompassed component gets credit only for a success (c ≥ 0.7): θ ← θ + K·w·e·max(0, c − P).
   - A failure updates only the primary skill. If the wrong answer matches a component's misconception tag, the component is flagged "check".
   - Rationale: credit for a success is unambiguous; blame for a failure is not. This mirrors FIRe, where review credit flows to simpler encompassed topics (Section 2).
8. **Displayed quantity:** p̂_s = σ(θ_s), read as "the chance of an independent first-try solve of a standard item". It is used internally. Do not display it as a number.

**State machine** (thresholds Speculative; the gating idea Moderate)

| State | Estimate gate | Evidence gates (all required) |
|---|---|---|
| Not Started | — | no scored responses and no placement |
| Learning | any | lesson started or ≥ 1 response, but Developing not yet met |
| Developing | p̂ ≥ 0.60 | ≥ 2 unassisted first-try successes (c = 1) |
| Proficient | p̂ ≥ 0.80 | n_s ≥ 6; ≥ 3 unassisted first-try successes on ≥ 2 distinct item templates; a checkpoint covering s passed; ≥ 2 of the last 3 unassisted attempts correct |
| Mastered | p̂ ≥ 0.85 | Proficient, plus ≥ 1 unassisted success on a spaced review ≥ 7 days after first reaching Proficient, plus ≥ 1 unassisted success in a mixed or transfer context (mixed review, daily challenge, boss), plus successes on ≥ 3 distinct days |
| "Review due" overlay | FSRS retrievability R < 0.90 | shown on Proficient and Mastered skills; never demotes by itself |

- **Hysteresis**, so states do not flicker:
  - Mastered → Proficient only after an unassisted failure on a spaced review *and* p̂ < 0.85.
  - Proficient → Developing only if p̂ < 0.60 after ≥ 2 unassisted failures within 30 days.
  - Re-promotion requires a fresh spaced success.
- **Unlocking is separate from mastery labels.** Passing a lesson's checkpoint unlocks the next lesson. Proficient and Mastered describe retention and depth, not permission to continue.

**Simulated behaviour with these constants** (computed; it shows the design properties, not empirical validity). Steps are listed in order; values are p̂ after each step.
- **Ideal learner:** 6 unassisted in-lesson solves → 0.73. Checkpoint (2 items) → 0.80, Proficient. Spaced review → 0.83. Transfer item → 0.89. Second review → 0.90; Mastered once the gates are met.
- **Typical learner** (one hint-1 solve and one second-attempt solve in the lesson): lesson → 0.67, Developing. Checkpoint → 0.76. First spaced review → 0.80, Proficient. Transfer item and second review → 0.88; Mastered once the gates are met.
- **Struggling learner:** lesson → 0.48. Checkpoint → 0.58. Mixed reviews → 0.65, still Developing, which should trigger targeted practice (Section 2).
- **Hinted solves alone cannot reach Proficient.** Endless rung-1-hint solves level off at p̂ ≈ 0.68, endless second-attempt solves at ≈ 0.49, and rung-2-hint solves at ≈ 0.39. On standard items the Elo fixed point is σ(θ) = c, so p̂ tracks the learner's *independent* success rate by construction. This is how "never punish hints" coexists with honest mastery.
- At context weight 1.0, starting from θ0 = −1, about 6 consecutive unassisted standard solves are needed to reach p̂ ≈ 0.80 (comparable to the common "3–6 in a row" conventions). Four-option multiple choice needs about 9 because of the guessing floor, and harder items (b = +1) need about 4.

**Simple fallback heuristic** (Speculative; usable where authors cannot assign difficulty tiers)
- Recency-weighted Beta evidence, starting from a = b = 1:
  - a ← 0.9·a + c
  - b ← 0.9·b + (1 − c)
  - mean m = a/(a+b)
  - 80% lower bound = m − 1.28·√(ab/((a+b)²(a+b+1)))
- Promote a state only when the *lower bound* clears its threshold. After 3, 5 and 8 unassisted solves, (mean, lower bound) = (0.83, 0.61), (0.89, 0.73) and (0.93, 0.82) (computed). Uncertainty is built in, so a short run of luck cannot produce "Mastered".

**Avoiding overclaiming precision** (Moderate for showing learners their model; Speculative for the specifics)
- Show the state word, an icon, and an evidence checklist ("3 independent solves on 2 problem types ✓ · checked after a week ✗ · solved in a mixed set ✗"). Never show "87%".
- Mark a state "provisional" while n_s < 6.
- Phrase it as an estimate: "The Atlas estimates…", with a "Why this state?" panel listing the evidence.
- Let the learner ask for "Check me" (2–3 unassisted items). Never let a learner self-declare mastery.
- Keep self-reported confidence visibly separate (Section 5).
- Run a local calibration audit. Bin the predicted P against actual first-try outcomes on reviews and checkpoints. If skills labelled Mastered succeed less than 85% of the time on their first spaced review across ≥ 20 cases, raise the Mastered threshold or lower K (Speculative).

### Gaps
- I could not read Pelánek 2016 itself. The uncertainty-function form α/(1+βn) is recalled; the values often quoted (α ≈ 1, β ≈ 0.05) are unverified, and K(n) = max(0.2, 1/(1+0.05n)) above is my choice.
- Partial-credit evidence weighting has prior work in the ASSISTments literature (e.g., Wang & Heffernan 2013 on continuous knowledge tracing; Ostrow et al., EDM 2015, on partial-credit algorithms). I could not retrieve either, so the A×H weights are design heuristics, not fitted values.
- No published study validates this exact hybrid (Elo + evidence gates + FSRS). Validation would require logging outcomes and checking calibration over time.
- Pelánek's AIED 2018 paper separating *uncertainty* about knowledge from *degree* of knowledge is directly relevant to "not overclaiming", but I could not retrieve it.
- Unverified product background (from memory; verify before citing):
  - Khan Academy labels skills Attempted / Familiar / Proficient / Mastered with mastery points.
  - ASSISTments "skill builders" require 3 correct in a row.
  - ASSISTments and Cognitive Tutor scoring conventionally treats a hint request as an incorrect response.

---

## 2. Spaced repetition and adaptive review at the skill level: which scheduler, how to pick review items, how to target persistent weaknesses and let strong learners skip ahead?

### Takeaway
Spacing is among the best-supported findings in learning science. Among scheduling algorithms, FSRS (current released version FSRS-6: 21 parameters, default desired retention 0.9) predicts recall best on large flashcard benchmarks and ships usable defaults. HLR needs training data, and SM-2 is a hand-tuned heuristic. Recommended: FSRS-6 per *skill*, with review problems freshly generated from item variants. Add three things on top:
- FIRe-style fractional implicit credit along an author-encoded "encompassing" graph, so that reviewing an advanced skill also refreshes the components it exercises
- interleaved review sessions
- a "persistent weakness" detector that triggers a short targeted-practice protocol

Strong learners skip ahead through placement, unit test-outs and an in-lesson fast track. Evidence: Strong for spacing; Moderate for FSRS's accuracy on flashcards; Speculative for carrying flashcard-trained defaults over to maths skills.

### Cited Findings
**Spacing evidence**
- A meta-analysis of 839 assessments of distributed practice (317 experiments in 184 articles) confirms robust benefits of spacing over massing (P) — [Cepeda et al. 2006](https://doi.org/10.1037/0033-2909.132.3.354)
- The optimal gap between study sessions grows with the retention interval. As a proportion of that interval, it falls from roughly 20–40% for a 1-week test to roughly 5–10% for a 1-year test (P) — [Cepeda et al. 2008](https://doi.org/10.1111/j.1467-9280.2008.02209.x)
- Successive relearning (retrieving to a criterion, then re-retrieving in later spaced sessions) produces durable retention. After relearning, the initial criterion matters less (P) — [Rawson & Dunlosky 2011](https://doi.org/10.1037/a0023956)

**SM-2** (P; the canonical description, not re-fetched)
- The easiness factor updates as EF' = EF + (0.1 − (5−q)(0.08 + (5−q)·0.02)) for a grade q from 0 to 5, with a floor of 1.3 and a start of 2.5.
- Intervals: I(1) = 1 day, I(2) = 6 days, I(n) = I(n−1)·EF. A grade below 3 restarts the repetitions.
- Source: [SuperMemo SM-2 description](https://super-memory.com/english/ol/sm2.htm)

**Half-life regression (Duolingo)** — all (V), from the paper PDF ([Settles & Meeder 2016](https://doi.org/10.18653/v1/P16-1174); [code and paper](https://github.com/duolingo/halflife-regression))
- Model: predicted recall p̂ = 2^(−Δ/ĥ), where Δ is the time since last practice, and the half-life is ĥ = 2^(Θ·x).
- Features x: counts of exposures, correct and incorrect answers, plus sparse lexeme-tag indicators.
- Loss: ℓ = (p − p̂)² + α(h − ĥ)² + λ‖Θ‖², with the observed half-life h = −Δ/log₂(p). Trained with AdaGrad.
- Fit on historical logs (mean absolute error / AUC):

  | Model | MAE | AUC |
  |---|---|---|
  | HLR | 0.128 | 0.538 |
  | HLR without lexeme features | 0.128 | 0.537 |
  | Leitner | 0.235 | 0.542 |
  | Pimsleur | 0.445 | 0.510 |
  | Logistic regression | 0.211 | 0.513 |
  | Constant baseline | 0.175 | — |

  Abstract: HLR reduces error "by 45%+" against the baselines.
- Live experiments:
  - HLR vs Leitner (6 weeks, just under 1 million students): retention +0.3% for any activity, +0.3% for lessons, and −7.3% for practice. The practice drop was significant.
  - HLR without lexeme features vs HLR (2 weeks, 3.3 million students): +12.0% any activity, +1.7% lessons, +9.5% practice, all significant.
  - The lexeme features overfitted and made some words decay unrealistically fast; removing them also solved cold start for new courses.

**FSRS-6** (V) — [FSRS algorithm wiki](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm); [py-fsrs scheduler source](https://github.com/open-spaced-repetition/py-fsrs/blob/main/fsrs/scheduler.py)
- **Forgetting curve:** R(t,S) = (1 + F·t/S)^(−w20), with F = 0.9^(−1/w20) − 1, so that R(S,S) = 0.9.
- **Interval for desired retention r:** I = (S/F)·(r^(−1/w20) − 1). It is rounded to days and kept between 1 day and the maximum interval.
- **Initial values:** stability S0(G) = w[G−1] for grade G ∈ {1 Again, 2 Hard, 3 Good, 4 Easy}, floored at 0.001. Difficulty D0(G) = w4 − e^(w5·(G−1)) + 1, clamped to [1,10].
- **Difficulty update** (linear damping, then mean reversion toward an *unclamped* D0(Easy)):
  - ΔD = −w6·(G−3)
  - D' = D + ΔD·(10−D)/9
  - D'' = w7·D0(4) + (1−w7)·D', clamped to [1,10]
- **Stability after a successful review:** S' = S·(1 + e^(w8)·(11−D)·S^(−w9)·(e^(w10·(1−R)) − 1)·h·e), where h = w15 for Hard (else 1) and e = w16 for Easy (else 1).
- **Stability after a lapse:** S' = min( w11·D^(−w12)·((S+1)^(w13) − 1)·e^(w14·(1−R)) , S/e^(w17·w18) ).
- **Same-day review:** S' = S·e^(w17·(G−3+w18))·S^(−w19). For Hard and above the growth factor is at least 1.
- **Default parameters w0–w20:** 0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542.
- **py-fsrs scheduler defaults:** desired retention 0.9; learning steps 1 min and 10 min; relearning step 10 min; maximum interval 36,500 days; fuzzing on.
- **Version history:**
  - FSRS-5 → FSRS-6: decay became trainable through w20 (FSRS-4.5 fixed decay at −0.5 with factor 19/81), the same-day formula gained the S^(−w19) term, and the parameter count went from 19 to 21.
  - The Rust library's latest releases are v6.x (v6.6.2 is marked latest) and mention no FSRS-7 — [fsrs-rs releases](https://github.com/open-spaced-repetition/fsrs-rs/releases)

**FSRS benchmark** (V) — [srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)
- Data: about 10,000 Anki collections, about 350 million reviews, evaluated without same-day reviews.
- Results (lower log loss and RMSE are better; higher AUC is better):

  | Model | Log loss | RMSE (bins) | AUC |
  |---|---|---|---|
  | FSRS-6 | 0.3460 | 0.0653 | 0.7034 |
  | FSRS-5 | 0.3561 | 0.0742 | 0.7010 |
  | FSRS-4.5 | 0.3625 | 0.0764 | 0.6891 |
  | DASH | 0.3682 | 0.0838 | 0.6311 |
  | ACT-R | 0.4033 | 0.1074 | 0.5225 |
  | HLR | 0.4694 | 0.1275 | 0.6369 |
  | GRU / LSTM neural nets | ≈ 0.333 | ≈ 0.054 | ≈ 0.733 |

- **FSRS-7** appears in the benchmark as "the newest version": 34 trainable parameters, designed for fractional (sub-day) intervals and realistic same-day predictions. Trained, it scores log loss 0.3401 and AUC 0.7167. With default parameters and no per-user optimization, it scores log loss 0.3620 and AUC 0.7029.
- The page does not say FSRS-7 is released, and it has no SM-2 row.

**Fractional Implicit Repetition (FIRe, Math Academy)** (V, from a search-result summary of Skycak's post, Math Academy's pages and secondary commentary; the full texts could not be fetched) — [Skycak, "Optimized, Individualized Spaced Repetition in Hierarchical Knowledge Structures"](https://justinmath.com/individualized-spaced-repetition-in-hierarchical-knowledge-structures/); [Math Academy, How it works](https://mathacademy.com/how-our-ai-works); [Math Academy pedagogy](https://mathacademy.com/pedagogy); [Matuschak notes](https://notes.andymatuschak.org/Math_Academy); [Hecker commentary](https://frankhecker.com/2025/02/14/math-academy-part-7/)
- Flashcard schedulers treat items as independent, which suits hierarchical mathematics poorly.
- FIRe credits a review of an advanced topic toward the simpler topics it implicitly practises. Example: multiplying a two-digit number by a one-digit number encompasses one-digit multiplication and adding a one-digit number to a two-digit number.
- It uses two expert-encoded graphs: a *prerequisite* graph that controls what to learn next, and an *encompassing* graph that controls how review credit flows. Prerequisites are not always implicitly practised.
- Credit is fractional, because components are often only partly exercised. Implicit repetitions are discounted when they come too early.
- FIRe cuts review load by choosing reviews whose implicit repetitions clear other due reviews ("repetition compression"), and it calibrates spacing speed to each student on each topic.
- I found no independent academic evaluation of FIRe.

**Other relevant evidence**
- Interleaving helps learners tell similar problem types apart, which matters most when strategies look alike (P) — [Rohrer et al. 2020](https://doi.org/10.1037/edu0000367). Details in Section 3.
- A theoretical and machine-learning result puts the optimal training error rate at about 15% (an "85% rule") for gradient-descent learners. Human evidence for a precise target is weak (P) — [Wilson et al. 2019](https://doi.org/10.1038/s41467-019-12552-4)

### Inferences
**Scheduler choice** (Moderate)
- Use FSRS-6 memory state (S, D, last review date) per skill, alongside θ from Section 1.
- Do not use SM-2: it is uncalibrated and has no retrievability estimate, so there is nothing to show as "review due" or to audit. Do not use HLR: it needs fitted weights.
- Keep the scheduler behind an interface, so FSRS-7 (sub-day intervals) can replace it if it ships.

**Mapping skill evidence to FSRS grades** (Speculative). Use only the first scored retrieval of the skill each day:
- Again: c < 0.3 (wrong, or rung-3 hint or solution used)
- Hard: 0.3 ≤ c < 1 (hinted, or solved on the second attempt), or correct but the learner rated it "Guessing"
- Good: c = 1
- Easy: c = 1 on a T3/T4 item, rated "Sure", for a skill already Proficient or better. Keep it rare: the easy bonus w16 = 1.87 multiplies stability growth.
- Later attempts the same day update θ only. This avoids treating massed re-tests as spaced memory evidence.
- The lesson's checkpoint result sets the first rating. For example, Good gives S0 = 2.3 days, so the first review comes about 2 days later.

**What the defaults imply** (computed; reviews taken exactly when R = 0.9)
- A skill rated Good every time reaches intervals of 2.3 → 11.9 → 49.7 → 173.8 → 527 days.
- A skill rated Hard every time reaches 2.3 → 8.1 → 19.6 → 37.1 → 59 days.
- A lapse at S ≈ 174 days resets stability to about 4.8 days.
- Interval multipliers relative to S: 3.32× at r = 0.80, 1.91× at 0.85, 1.00× at 0.90, 0.40× at 0.95.

**Settings** (Speculative)
- Default desired retention 0.90. Offer "light" at 0.85 (about 1.9× longer intervals, fewer reviews) and "exam prep" at 0.95 (about 0.4× intervals).
- Cap intervals at 180 days while a course is active, so every skill is checked at least twice a year.
- Raise retention to 0.95 for the prerequisites of the learner's next three lessons ("just-in-time" review).
- Keep fuzzing on to spread the daily load.

**FIRe-style implicit credit** (concept from Math Academy, V-summary; this formula Speculative)
- When skill B is explicitly reviewed with a grade of Good or better, apply an implicit review to each component A that B encompasses with weight e, but only if R_A ≤ 0.95:
  - S_A ← S_A + e·d·(S'_recall(A, Good) − S_A)
  - discount d = clamp((1 − R_A)/(1 − r_target), 0, 1), so early implicit repetitions earn little
- A failure on B sends no implicit failure to A. Instead, two failures on B trigger a quick probe of its components.
- Authors encode e in three levels: 1.0 when the component is fully exercised (the chain rule inside implicit differentiation); 0.5 when partly exercised; 0.25 when incidental.

**Daily review builder** (Moderate for the principles; Speculative for the weights)
1. **Candidates:** skills at Developing or above whose R(today) is below r_target.
2. **Priority:** (r_target − R) + 0.2 if the weakness flag is set + 0.1 if the skill is a prerequisite of the frontier.
3. **Repetition compression:** greedily choose the review whose explicit and implicit credit covers the most due priority per expected minute, then remove the skills it covers.
4. **Interleave:** never two consecutive items from the same skill; mix units; when both are due, include a discrimination pair (for example, integration by parts against u-substitution).
5. **Item choice:** a parameterised variant not seen in the last 30 days, with predicted P ≈ 0.70–0.85 from θ. For Mastered skills, prefer T3/T4 items.
6. **Load:** cap at about 15–20 review items, or 25–35% of session time. Roll overflow forward by priority, and never present a backlog as failure or "debt".

**Targeted practice for persistent weaknesses** (protocol Moderate, from successive relearning, worked examples and interleaving; triggers Speculative)
- Raise the flag when any of these holds:
  - 2 or more Again ratings on spaced reviews within 30 days
  - the same misconception tag fired 3 or more times across 2 or more days
  - 3 or more rung-3 hints or solutions in the last 8 attempts
  - θ fell by 0.7 logits or more within a week on a Proficient skill
- Protocol, run as a short mini-lesson (example: repeated trouble with integration by parts):
  1. Probe the encompassed components with 2–4 unassisted items to find a broken prerequisite (for example, choosing u and dv, or integrating dv).
  2. Re-teach with a new worked example in a different surface context, with subgoal labels, followed by one faded example.
  3. Give 3–5 focused items with immediate elaborated feedback.
  4. Give 2 discrimination items that interleave the confusable skill (substitution, tabular integration).
  5. Schedule follow-ups at +1 day and +3 days.
  6. Clear the flag after 2 consecutive unassisted spaced successes.

**Skipping ahead** (Moderate for expertise reversal and adaptive placement; Speculative for cut-offs)
- **Placement diagnostic** (Section 8).
- **Unit test-out**, available any time: an unassisted mixed set with at least 2 items per skill, at least one of them T3/T4.
  - A skill solved 2 of 2, or 2 of 3, becomes "Proficient (placed)", with θ = +1.0 and FSRS S = 4–7 days, so a confirmation review comes within a week.
  - A test-out never grants Mastered.
- **In-lesson fast track:** if the first two practice items are solved unassisted (and rated "Sure"), offer "skip to checkpoint".

**Local calibration of the scheduler** (Speculative)
- Track the first-try success rate on scheduled reviews. It should sit near r_target. If it falls below 0.80 over 50 reviews, scale stabilities down with a per-learner multiplier.
- Once there are a few hundred reviews, run the FSRS optimizer on the learner's own logs, if it can run client-side (py-fsrs and fsrs-rs include optimizers; a WebAssembly build is an engineering question).

### Gaps
- FSRS's defaults come from flashcard (declarative) data. I found no evaluation of FSRS for procedural or conceptual skills in mathematics or physics, so the intervals above may be too long or too short for maths skills.
- I could not verify:
  - which way *penalties* flow in FIRe (my unverified recollection: credit flows down to encompassed topics, and failures implicate the more advanced topics that contain them)
  - Math Academy's remediation rules
  - its per-topic speed parameters
- I did not verify how many reviews the FSRS optimizer needs per learner.
- Anki's "leech" convention (a card flagged after about 8 lapses) is from memory; the skill-level triggers above are my own.
- Cepeda's spacing curves come from verbal and factual material. Spacing in mathematics has direct evidence ([Rohrer & Taylor 2007](https://doi.org/10.1007/s11251-007-9015-8) studied spacing and interleaving of maths problems), but the optimal ratios for graduate-level skills are unknown.

---

## 3. Instructional design evidence: what retrieval practice, spacing, interleaving, worked and faded examples, expertise reversal, self-explanation, productive failure, cognitive load, multimedia principles and simulation design imply for lesson structure, question ordering and visual design

### Takeaway
The brief's lesson shape (short intro → manipulable visual → one worked example → one-at-a-time practice → checkpoint → spaced review) matches the strongest evidence: retrieval practice, spacing, and worked examples for novices. Four upgrades strengthen it:
1. Fade the support (worked example → completion problem → full problem), and let advanced learners skip it (expertise reversal).
2. Keep blocked practice short and make later practice, checkpoints and all reviews interleaved.
3. Design visuals with PhET-style *implicit* scaffolding (few controls, sensible constraints, linked representations, a goal prompt) instead of an open sandbox.
4. Offer productive failure only as an optional, conceptual "try first" step, never as the default.

### Cited Findings
**Retrieval and testing**
- In a review of ten techniques, practice testing and distributed practice were rated high utility. Elaborative interrogation, self-explanation and interleaving were rated moderate. Rereading, highlighting and summarisation were rated low (P) — [Dunlosky et al. 2013](https://doi.org/10.1177/1529100612453266)
- One week after study, repeated testing produced 61% recall against 40% for repeated studying (P) — [Roediger & Karpicke 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x)
- Meta-analyses put practice testing at g ≈ 0.61 overall (P) — [Adesope et al. 2017](https://doi.org/10.3102/0034654316689306) — and classroom quizzing at g ≈ 0.50 (P) — [Yang et al. 2021](https://doi.org/10.1037/bul0000309)
- Asking questions *before* instruction improves learning of the tested material, even when the initial answers are wrong (the pretesting effect) (P) — [Richland, Kornell & Kao 2009](https://doi.org/10.1037/a0016496)

**Interleaving**
- Blocked vs interleaved practice of maths problems scored 89% vs 60% during practice, but 20% vs 63% on a test one week later (P) — [Rohrer & Taylor 2007](https://doi.org/10.1007/s11251-007-9015-8)
- In a classroom RCT (54 seventh-grade classes), interleaved practice beat blocked practice on a delayed test, 61% vs 38% (d = 0.83) (P) — [Rohrer, Dedrick, Hartwig & Cheung 2020](https://doi.org/10.1037/edu0000367)
- Meta-analysis: interleaving averages g ≈ 0.42, but the effect depends heavily on the material. It is positive for visual categories and mathematical tasks and not beneficial for word lists or expository texts (P) — [Brunmair & Richter 2019](https://doi.org/10.1037/bul0000209)

**Worked examples, fading and expertise reversal**
- Studying worked examples beats unsupported problem solving for novices (P) — [Atkinson, Derry, Renkl & Wortham 2000](https://doi.org/10.3102/00346543070002181)
- A 2023 meta-analysis of worked examples in mathematics (43 articles, 55 studies, 181 effect sizes, mostly middle-school algebra and geometry) found an average gain of about 18 percentile points over standard problem practice. Correct-solution examples beat incorrect-solution examples. Pairing examples with self-explanation prompts was associated with *lower* performance than examples alone. The authors say the work confirms and extends a 2007 IES practice guide that rated "interleave worked examples with problem solving" as moderate evidence (V, search summary) — [Barbieri et al. 2023](https://doi.org/10.1007/s10648-023-09745-1); [Learning Scientists guest post](https://www.learningscientists.org/blog/2024/1/25-1)
- Gradually fading worked steps, so that examples turn into problems, eases the transition to independent solving (P) — [Renkl & Atkinson 2003](https://doi.org/10.1207/S15326985EP3801_3)
- In tutored problem solving, fading adapted to the student outperformed fixed fading (P) — [Salden, Aleven, Schwonke & Renkl 2010](https://doi.org/10.1007/s11251-009-9107-8)
- Expertise reversal: guidance that helps novices (worked examples, integrated explanations) becomes redundant and can harm more knowledgeable learners, so instruction should adapt to expertise (P) — [Kalyuga, Ayres, Chandler & Sweller 2003](https://doi.org/10.1207/S15326985EP3801_4); [Kalyuga 2007](https://doi.org/10.1007/s10648-007-9054-3)
- Expertise can be assessed quickly by asking learners for the first step of a solution, and e-learning adapted this way was more efficient (P) — [Kalyuga & Sweller 2005](https://doi.org/10.1007/BF02504800)
- Labelling the subgoals of worked examples improves transfer (P) — [Catrambone 1998](https://doi.org/10.1037/0096-3445.127.4.355)

**Self-explanation**
- Good learners spontaneously explain worked-example steps to themselves, and prompting self-explanation improves understanding (P) — [Chi et al. 1989](https://doi.org/10.1207/s15516709cog1302_1); [Chi et al. 1994](https://doi.org/10.1207/s15516709cog1803_3)
- Meta-analysis of self-explanation prompts: g ≈ 0.55 (P) — [Bisra et al. 2018](https://doi.org/10.1007/s10648-018-9434-x)
- Menu-based self-explanation, where students select the geometry principle that justifies each step, improved understanding in a Cognitive Tutor (P) — [Aleven & Koedinger 2002](https://doi.org/10.1207/s15516709cog2602_1)

**Productive failure**
- Productive failure (problem solving before instruction) was first demonstrated by [Kapur 2008](https://doi.org/10.1080/07370000802212669) (P).
- A 2021 meta-analysis covered 53 studies and 166 comparisons, mostly in grades 6–10, across maths, physics, chemistry, biology and medicine. It found benefits for conceptual understanding that depend on how faithfully a design follows productive-failure principles. For example, the initial problems should not be standard textbook exercises. Coverage also notes randomised experiments with the opposite result (V, search summary) — [Sinha & Kapur 2021](https://doi.org/10.3102/00346543211019105); [WEF summary](https://www.weforum.org/stories/2021/09/students-who-productively-fail-learn-more/)
  - Recalled values: overall g ≈ 0.36 for conceptual knowledge, g ≈ 0.58 for high-fidelity designs, and no advantage for procedural knowledge (P\*). These fit the authors' description of "nearly twice" and "up to three times" the effect of a year of good teaching.
- Problem solving before instruction works mainly when the instruction that follows builds on and contrasts the students' own solutions (P) — [Loibl, Roll & Rummel 2017](https://doi.org/10.1007/s10648-016-9379-x)

**Cognitive load and multimedia**
- Working memory is limited. Instruction that imposes unnecessary search or split attention hampers schema acquisition, and element interactivity determines intrinsic load (P) — [Sweller 1988](https://doi.org/10.1207/s15516709cog1202_4); [Sweller, van Merriënboer & Paas 2019](https://doi.org/10.1007/s10648-019-09465-5)
- Multimedia principles with experimental support: coherence (cut extraneous material), signalling, redundancy, spatial and temporal contiguity, segmenting, pre-training, modality and personalisation. Most evidence comes from short lab studies with transfer tests (P) — [Mayer 2017](https://doi.org/10.1111/jcal.12197)
- Concreteness fading (concrete representation → bridging → abstract symbols) is supported across mathematics and science (P) — [Fyfe, McNeil, Son & Goldstone 2014](https://doi.org/10.1007/s10648-014-9249-3)

**Discovery, guidance and interactive simulation**
- Unassisted discovery underperformed explicit instruction (d ≈ −0.38), while enhanced or guided discovery outperformed other methods (d ≈ 0.30) (P) — [Alfieri et al. 2011](https://doi.org/10.1037/a0021017)
- Guidance improves inquiry learning activities, performance and outcomes (P) — [Lazonder & Harmsen 2016](https://doi.org/10.3102/0034654315627366); [Kirschner, Sweller & Clark 2006](https://doi.org/10.1207/s15326985ep4102_1)
- PhET simulations are research-designed: interactive, with dynamic feedback, linked multiple representations, minimal text, and testing through student interviews (P) — [Wieman, Adams & Perkins 2008](https://doi.org/10.1126/science.1161948)
- Engaged exploration depends on interactivity, immediate dynamic feedback and connection to students' own questions (P) — [Podolefsky, Perkins & Adams 2010](https://doi.org/10.1103/PhysRevSTPER.6.020117)
- "Implicit scaffolding" uses affordances, productive constraints and cueing built into the interface to guide exploration without explicit instructions (P\*) — [Podolefsky, Moore & Perkins 2013](https://arxiv.org/abs/1306.6544)
- In a MOOC, doing interactive activities was associated with roughly six times the learning benefit of watching videos or reading (correlational) (P) — [Koedinger et al. 2015](https://doi.org/10.1145/2724660.2724681)
- The ICAP framework ranks engagement as interactive > constructive > active > passive (P) — [Chi & Wylie 2014](https://doi.org/10.1080/00461520.2014.965823)

### Inferences
**Lesson template** (target 8–15 minutes)

| Step | Specification | Evidence |
|---|---|---|
| 1. Intro (2–5 sentences) | Name the key terms and symbols first (pre-training). Include one warm-up retrieval of the most important prerequisite. End with one prequestion or a "predict what happens" prompt for the visual. | Moderate |
| 2. Manipulable visual (1–3 min) | One goal prompt ("Make the net force zero"). 1–3 controls with constrained, meaningful ranges. Picture, graph and equation update together. Signal the element the text refers to; no decorative motion. | Moderate |
| 2a. Optional "try first" (conceptual lessons only) | An unscored 1–2 minute challenge in the visual before the worked example. The example afterwards explicitly contrasts typical attempts. Never used for procedural-fluency lessons. | Moderate, conditional |
| 3. One worked example | Steps revealed one tap at a time (segmenting), with subgoal labels. At most one *menu-based* self-explanation prompt ("Which principle justifies step 3?"). Offer "I know this, skip" when the learner is already Proficient on the prerequisites. | Strong (novices); Moderate (expertise reversal); mixed for self-explanation prompts |
| 4. Practice (4–8, one at a time) | P1 is a completion problem with the last 1–2 steps blank. P2–P3 are full problems with the same deep structure but different surface. Then raise difficulty (T2 → T3) and vary representation (graph, equation, words). The final item is a discrimination item that mixes in an earlier, confusable skill. After an error, show the micro-teaching line and re-present a same-structure variant 2–3 items later. Fast track to the checkpoint after the first two are solved unassisted. | Strong (fading, testing); Moderate (interleaving, adaptivity) |
| 5. Checkpoint (4–6 items) | Unassisted and mixed: at least 2 items on the new skill (different templates), plus at least 2 on earlier skills. Correctness plus elaborated feedback after each item. | Strong (retrieval); Moderate (mixing) |
| 6. Progression | Passing the checkpoint unlocks the next lesson. Failing offers targeted practice. There is always a "continue anyway" choice (autonomy); prerequisite reviews are queued. | Moderate (mastery learning); Speculative (soft gate) |
| 7. Spaced review | As in Section 2. | Strong |

**Question ordering rules** (Moderate)
- Block only within the first lesson exposure. Every later appearance of a skill (checkpoint, review, daily challenge, boss) is interleaved with others, because blocked practice inflates in-the-moment accuracy that does not last.
- Pair confusable skills on purpose, so learners practise *choosing* a strategy, not just executing it.
- Vary surface features while keeping deep structure, so the cue for a method is the structure (cross-reference Chi et al. 1981 in Section 7).

**Visual design rules** (Moderate unless marked)
- Implicit scaffolding: use visual affordances (handles look draggable); constrain ranges so most states are informative; cue change with highlight or motion; keep text inside the visual to labels.
- Show linked representations side by side (spatial contiguity), moving from concrete picture to graph to symbols (concreteness fading).
- Coherence: no decorative animation, mascots or background music inside lesson visuals. Use signalling cues tied to the sentence being read.
- Segmenting: the learner controls the pace; nothing advances on a timer.
- *Interpretive feedback* (Speculative/Weak; no study retrieved): when a numeric answer is wrong, show its consequence in the visual. For example, plot the trajectory the learner's launch speed implies next to the target, so the error is visible in the physics, not only as a red X.
- Accessibility (Speculative here, standard practice): encode mastery state by both colour and shape, make every control keyboard-operable, and honour reduced-motion settings.

**Advanced material (graduate GR)** (Speculative)
- Expertise reversal implies that by graduate topics many learners are experts in the prerequisites. Default to shorter or skippable worked examples for them.
- Keep worked examples for genuinely new formalism (index gymnastics, Christoffel symbols, geodesic equations), with subgoal labels for multi-step derivations.

### Gaps
- I could not retrieve effect sizes for Mayer's principles. They exist (Mayer 2017 tabulates them), but they come mostly from short lab studies with college students.
- Worked-example and interleaving evidence comes mostly from school algebra and geometry. Applying it to university physics and GR is extrapolation.
- The exact productive-failure effect sizes and moderator results (procedural knowledge, transfer) need checking against the 2021 paper.
- I found no direct evidence on the best number of practice items per lesson (4–8 is the brief's choice), or on "interpretive feedback" in simulations.
- I could not retrieve PhET's own design-guideline pages (phet.colorado.edu was unreachable).

---

## 4. Hints and feedback: hint design in tutoring systems, hint ladders, feedback timing and type, misconception-targeted feedback, and how hint use should count as evidence without being punitive

### Takeaway
On-demand, step-level help is part of why step-based tutors approach human tutoring. But help-seeking research shows learners both abuse hints (clicking straight to the answer) and avoid them. That is Koedinger and Aleven's "assistance dilemma".

Recommended:
- a three-rung ladder: an orienting question or first step → the relevant principle applied to this problem → a near-solution (bottom-out); then an optional full solution, which queues a fresh variant for later
- elaborated, misconception-specific feedback after errors
- immediate feedback in practice, and summary feedback after boss battles
- a clean separation: XP is identical whether or not hints are used, while hints and attempts reduce the *evidence weight* of a success, so a hinted solve never counts as independent mastery

### Cited Findings
**The assistance dilemma and tutoring evidence**
- The assistance dilemma is how to balance giving and withholding information or help to optimise learning. Experiments with Cognitive Tutors show that the best level of assistance depends on the learner and the situation (P) — [Koedinger & Aleven 2007](https://doi.org/10.1007/s10648-007-9049-0)
- Step-based tutoring (hints and feedback on each step) reached d ≈ 0.76, close to human tutoring (d ≈ 0.79). Systems that give feedback only on final answers reached d ≈ 0.31 (P) — [VanLehn 2011](https://doi.org/10.1080/00461520.2011.611369)
- Across 50 controlled evaluations, intelligent tutoring systems raised test scores by a median of 0.66 SD (P) — [Kulik & Fletcher 2016](https://doi.org/10.3102/0034654315581420)

**Help seeking**
- Hint use helps learning when it is deliberate. Learners often misuse help, either by rapid clicking to the bottom-out hint or by avoiding help when they need it ("help helps, but only so much") (P) — [Aleven, Roll, McLaren & Koedinger 2016](https://doi.org/10.1007/s40593-015-0089-1)
- A "Help Tutor" that gave metacognitive feedback on help-seeking improved help-seeking behaviour, but not domain learning (P) — [Roll, Aleven, McLaren & Koedinger 2011](https://doi.org/10.1016/j.learninstruc.2010.07.004)
- "Gaming the system" (systematic hint abuse or guessing) was associated with markedly less learning (P) — [Baker, Corbett, Koedinger & Wagner 2004](https://doi.org/10.1145/985692.985741)
- When students used GPT-4 freely during practice, practice performance rose but later unassisted exam performance fell. A tutor version restricted to hints rather than answers largely avoided the harm (P\*) — [Bastani et al. 2025](https://doi.org/10.1073/pnas.2422633122)

**Feedback reviews**
- Formative feedback guidelines: focus on the task, not the learner; make it elaborated but manageable, specific and clear; avoid normative comparisons; give it immediately for difficult tasks and novices, and consider delaying it for simple tasks or high achievers (P) — [Shute 2008](https://doi.org/10.3102/0034654307313795)
- Feedback has an average effect of about 0.79 across syntheses. It works at four levels (task, process, self-regulation, self), and praise directed at the self is least effective. It should answer "Where am I going? How am I going? Where to next?" (P) — [Hattie & Timperley 2007](https://doi.org/10.3102/003465430298487)
- Feedback interventions averaged d ≈ 0.41, but more than a third *reduced* performance, especially when they drew attention to the self rather than the task (P) — [Kluger & DeNisi 1996](https://doi.org/10.1037/0033-2909.119.2.254)
- A newer meta-analysis found d ≈ 0.48, with high-information feedback most effective (P) — [Wisniewski, Zierer & Hattie 2020](https://doi.org/10.3389/fpsyg.2019.03087)
- In computer-based environments, elaborated feedback (g ≈ 0.49) beat knowledge of the correct response (g ≈ 0.32) and right/wrong only (g ≈ 0.05), especially for higher-order outcomes (P) — [Van der Kleij, Feskens & Eggen 2015](https://doi.org/10.3102/0034654314564881)

**Feedback timing**
- Immediate feedback tended to win in applied classroom studies and delayed feedback in list-learning lab studies (P) — [Kulik & Kulik 1988](https://doi.org/10.3102/00346543058001079)
- Delayed feedback on multiple-choice tests can improve later retention (P) — [Butler, Karpicke & Roediger 2007](https://doi.org/10.1037/1076-898X.13.4.273)
- Feedback that lets learners detect and correct their own errors (the "intelligent novice" model) improved conceptual understanding and transfer (P) — [Mathan & Koedinger 2005](https://doi.org/10.1207/s15326985ep4004_7)

**Errors and misconceptions**
- Errors followed by corrective feedback are learning opportunities, and making errors is not harmful when they are corrected (P) — [Metcalfe 2017](https://doi.org/10.1146/annurev-psych-010416-044022)
- Errors made with high confidence are *more* likely to be corrected after feedback (the hypercorrection effect) (P) — [Butterfield & Metcalfe 2001](https://doi.org/10.1037/0278-7393.27.6.1491)
- Multiple-choice tests can teach the lures as facts (a negative suggestion effect), and feedback reduces this (P) — [Roediger & Marsh 2005](https://doi.org/10.1037/0278-7393.31.5.1155); [Butler & Roediger 2008](https://doi.org/10.3758/MC.36.3.604)

**Field evidence**
- In an RCT, online homework with immediate feedback and hints (ASSISTments) raised end-of-year maths scores by about 0.18 SD, with larger gains for lower-achieving students (P\*) — [Roschelle, Feng, Murphy & Mason 2016](https://doi.org/10.1177/2332858416673968)

### Inferences
**Hint ladder per step** (Moderate)
- **Rung 1, Orient** (a "pointing" hint): a question that directs attention to the relevant feature or first move. Examples: "What quantity is conserved during the collision?", "Which variable should you isolate first?"
- **Rung 2, Principle** (a "teaching" hint): name the principle and show how it maps onto *this* problem. Example: "No external horizontal force acts, so total momentum before equals total momentum after: m₁v₁ = (m₁+m₂)v_f."
- **Rung 3, Near-solution** (a "bottom-out" hint): carry out the step, leaving only the final evaluation or entry.
- **Then "Show full solution"**: an annotated worked example. Viewing it queues a fresh same-structure variant 2–3 items later, or next session, so the learner gets an independent attempt.
- Write hints per *step* for multi-step items (step-based support), not just per problem.

**Proactive but not forced** (Weak–Moderate)
- After 2 wrong attempts, or about 90 seconds idle, the hint button pulses. Hints are never imposed and never locked.
- If the learner jumps to rung 3 within 5 seconds of rung 1 on 3 items in a row, show a single tip ("Hints work best after you try the first move"). Change nothing else: no XP effect, no lock-out.

**Micro-teaching line** (one sentence, shown after a wrong answer) (Moderate)
- If the answer matches a tagged misconception or error pattern (sign error, missing factor of ½, v instead of v², confusing proper and coordinate time), name it specifically.
- Otherwise restate the governing principle.
- Never write self-level praise or blame ("Great job, genius!" / "Careless!"). Use task- and process-level language.

**Feedback policy by context** (Moderate; mixed evidence on timing)

| Context | Correctness | Elaboration | Hints | Solution |
|---|---|---|---|---|
| Lesson practice | Immediate | Micro-teaching line on errors; longer explanation for high-confidence errors (hypercorrection) | Ladder available | After completion, or on request |
| Review / daily challenge | Immediate | As above | Ladder available, recorded as assistance | On request |
| Checkpoint | Immediate, after each item | Brief elaboration; explain why the chosen distractor is wrong | Off ("I don't know" allowed) | After each item |
| Boss battle | At the end (delayed) | Full debrief per part | Off; "I'm stuck, reveal" turns that part into practice (c = 0) without ending the battle | Debrief |

**Hints as evidence, not punishment** (Moderate in principle; weights Speculative)
- XP for an item is the same whether or not hints were used. It is awarded for completing the item after a genuine attempt.
- Mastery evidence uses c = A × H (Section 1). Hint and attempt records also set the FSRS grade, so hinted solves are reviewed sooner (Hard rather than Good). This is a scheduling benefit, not a penalty.
- Tell the learner explicitly: "Hints never cost XP. They just tell the Atlas to check this skill again soon."
- After every multiple-choice error, explain the specific distractor chosen, to prevent lure learning.
- Do not add a generative-AI helper that hands out answers. If an AI tutor is ever added, constrain it to the same ladder (hints, never final answers) (Moderate, based on one strong field study).

### Gaps
- I could not retrieve the Andes physics tutor paper (VanLehn et al. 2005, IJAIED). My recollection is that its hint sequence ran pointing → teaching → bottom-out, which the ladder above copies; unverified.
- I could not retrieve evidence on the optimal *number* of hint rungs, or on hint wording effects in physics specifically.
- The conventions that Cognitive Tutor and ASSISTments score a hint request as an error are from memory (verify).
- There is no direct evidence on whether hint-neutral XP changes hint-abuse rates. It is a design inference from self-determination theory (Section 6) and the help-seeking literature.

---

## 5. Confidence checks and metacognition: confidence-based marking, calibration measures, illusions of competence and fluency, and how to present confidence–performance gaps helpfully

### Takeaway
Learners' feelings of knowing are systematically biased. Fluency, massed practice and polished explanations inflate them; effortful, desirable difficulties deflate them. Recommended:
- an optional, three-level confidence rating *after* answering and *before* feedback, stored entirely separately from mastery
- calibration statistics (bias, Brier score, discrimination) shown only after enough ratings, and framed around tasks
- high-confidence errors flagged as "surprises" for elaborated feedback and a next-day re-test
- the wrong-and-sure vs wrong-and-unsure split used to tell misconceptions apart from gaps
- delayed (not immediate) self-assessment prompts
- an up-front explanation that effective practice often *feels* worse

### Cited Findings
**Illusions of competence**
- Learners overestimate how well they will remember material that is in front of them during study (P) — [Koriat & Bjork 2005](https://doi.org/10.1037/0278-7393.31.2.187)
- Most participants judged massed study as at least as effective as spaced study, even though spacing produced better learning (P) — [Kornell & Bjork 2008](https://doi.org/10.1111/j.1467-9280.2008.02127.x)
- Common study beliefs are miscalibrated, and desirable difficulties feel less effective than they are (P) — [Bjork, Dunlosky & Kornell 2013](https://doi.org/10.1146/annurev-psych-113011-143823)
- A fluent instructor raised perceived learning but not actual learning (P) — [Carpenter, Wilford, Kornell & Mullaney 2013](https://doi.org/10.3758/s13423-013-0442-z)
- In Harvard introductory physics, students learned more in actively engaged classes but *felt* they learned less. They misread cognitive effort as poor learning. The authors recommend telling students early about the benefits of active learning (P) — [Deslauriers et al. 2019](https://doi.org/10.1073/pnas.1821936116)
- Bottom-quartile performers (around the 12th percentile) estimated themselves near the 62nd percentile (P) — [Kruger & Dunning 1999](https://doi.org/10.1037/0022-3514.77.6.1121). Self-assessment correlates only modestly with actual performance across domains (P) — [Dunning, Heath & Suls 2004](https://doi.org/10.1111/j.1529-1006.2004.00018.x)

**Measuring and improving monitoring**
- Judgments of learning made after a delay are far more accurate than immediate ones (the delayed-JOL effect) (P) — [Nelson & Dunlosky 1991](https://doi.org/10.1111/j.1467-9280.1991.tb00147.x)
- Monitoring accuracy has several distinct measures: absolute accuracy, bias (over- or under-confidence), relative accuracy (e.g., the Goodman–Kruskal gamma), scatter, and discrimination (P) — [Schraw 2009](https://doi.org/10.1007/s11409-008-9031-3); gamma as a measure of feeling-of-knowing accuracy (P) — [Nelson 1984](https://doi.org/10.1037/0033-2909.95.1.109)
- The Brier score is a proper scoring rule for probability forecasts (P) — [Brier 1950](https://doi.org/10.1175/1520-0493(1950)078%3C0001:VOFEIT%3E2.0.CO;2)
- High-confidence errors are hypercorrected after feedback (P) — [Butterfield & Metcalfe 2001](https://doi.org/10.1037/0278-7393.27.6.1491); [Metcalfe 2017](https://doi.org/10.1146/annurev-psych-010416-044022)
- In physics education, a Certainty of Response Index separates four cases: wrong with high certainty (misconception), wrong with low certainty (lack of knowledge), right with low certainty (lucky guess), and right with high certainty (knowledge) (P\*) — [Hasan, Bagayoko & Kelley 1999](https://doi.org/10.1088/0031-9120/34/5/304)
- Two-tier diagnostic items (an answer tier plus a reason tier) diagnose misconceptions in science (P) — [Treagust 1988](https://doi.org/10.1080/0950069880100204)
- Showing learners their own learner model, with self-assessment prompts, has been reported to improve learning outcomes in a maths tutor (P\*) — [Long & Aleven 2017](https://doi.org/10.1007/s11257-016-9186-6). There is a design framework for such open-learner-model interfaces (P\*) — [Bull & Kay 2016](https://doi.org/10.1007/s40593-015-0090-8)

### Inferences
**Confidence capture** (Moderate for the concept; sampling and mapping Speculative)
- Ask "How sure are you?" after the answer is submitted and before feedback, with three options: Guessing / Unsure / Sure.
- Ask on every checkpoint and boss item, and on about one in three practice and review items, to limit the burden. Learners can switch it off.
- For calibration only, map Guessing = max(1/k, 0.2), Unsure = 0.6, Sure = 0.9.

**Separation rule** (Strong requirement from the brief; Moderate support)
- Confidence never changes XP or mastery state.
- The scheduler may use it: a correct answer rated "Guessing" is graded FSRS Hard, so it comes back sooner (Speculative).

**Metrics**, computed per domain or unit once there are at least 20 rated items (Moderate):
- bias = mean(confidence probability) − mean(correct); above 0 means overconfident
- Brier = mean((confidence probability − correct)²)
- discrimination = accuracy on "Sure" items − accuracy on "Unsure/Guessing" items
- gamma (Goodman–Kruskal) once both outcomes have appeared at both confidence levels

**Presentation** (Moderate for task-focused feedback; specifics Speculative)
- Use counts, not decimals: "When you said *Sure*, you were right 18 of 20 times. When you said *Unsure*, 7 of 12."
- Show a three-bar calibration chart and a plain-language label ("well calibrated", "a bit overconfident in Rotational dynamics").
- Add one concrete action ("Before choosing *Sure*, check units and limiting cases").
- Never rank or label the person ("you are overconfident"). Describe the pattern in the task.

**Diagnosis grid** (CRI-style) (Moderate)

| | Sure | Unsure / Guessing |
|---|---|---|
| Wrong | Likely misconception: show the misconception-specific explanation, tag it, re-test with a fresh variant tomorrow ("Surprise!") | Knowledge gap: offer the hint ladder and the worked example; normal review |
| Right | Knowledge: normal evidence | Fragile or lucky: schedule sooner (FSRS Hard), no mastery penalty |

**Delayed self-assessment** (Moderate)
- At the start of a later session, ask "How well do you remember *X*?" before a quick check. Then show both, so the learner experiences their own monitoring accuracy.
- Do not ask immediately after a lesson, when judgments are inflated.

**Explaining desirable difficulty** (Moderate)
- One onboarding card, plus a short line in review sessions: "Mixed review feels harder than practising one thing at a time. That difficulty is what makes it stick." Evidence: Deslauriers et al. 2019; Kornell & Bjork 2008.

**Optional confidence-based-marking game** (Speculative; see the Gaps for the source scheme)
- An opt-in "calibration challenge" with its own separate score. That score may use confidence-based-marking penalties, which make honest reporting optimal, but it never touches XP or mastery.

### Gaps
- I could not retrieve a primary source for Gardner-Medwin's confidence-based marking (UCL LAPT). From memory, the scheme is: confidence 1/2/3 earns +1/+2/+3 when correct and 0/−2/−6 when wrong. The break-even points computed from that scheme are: choose level 2 over 1 when p > 2/3, and level 3 over 2 when p > 0.8 (computed). Verify the scheme before citing it.
- I did not retrieve evidence on whether calibration *feedback* durably improves calibration, as opposed to merely measuring it; my recollection is that the classroom findings are mixed.
- The cognitive and time cost of frequent confidence prompts is unknown. The sampling rate is a guess.
- The Long & Aleven (2017) and Bull & Kay (2016) DOIs and findings are recalled, not verified.

---

## 6. Gamification evidence: meta-analyses, undermining effects, streak psychology, achievements, daily challenges, progress visualisation, self-determination theory; what Duolingo, Brilliant, Khan Academy, Math Academy, Desmos and PhET do well or badly; and what original design to adopt

### Takeaway
Gamification produces small-to-medium average effects (cognitive g ≈ 0.49, motivational 0.36, behavioural 0.25 in Sailer & Homner). The motivational and behavioural effects are not stable in high-rigor studies. Badly chosen mechanics (leaderboards, controlling expected rewards, loss-framed streaks) can undermine motivation and learning.

The Atlas should treat every game element as *informational* feedback about real learning, consistent with self-determination theory:
- XP measures effort and is hint-neutral
- the skill map (an open learner model) is the main progress display
- achievements recognise learning *behaviours*
- streaks are optional weekly goals with built-in rest and no loss framing
- the daily challenge is optional mixed retrieval with no streak attached
- boss battles are narrative-framed integrative transfer assessments
- there are no leaderboards, hearts, loot boxes or guilt notifications

### Cited Findings
**Meta-analyses**
- Sailer & Homner: significant small effects of gamification on cognitive (g = .49), motivational (g = .36) and behavioural (g = .25) learning outcomes. In the high-rigor subset, the motivational and behavioural effects were less stable (V, search summary). The authors also analyse moderators, including game fiction and social interaction (competition and collaboration); recalled, those were associated with larger behavioural effects (P\*) — [Sailer & Homner 2020](https://link.springer.com/article/10.1007/s10648-019-09498-w)
- Bai, Hew & Huang: across 30 interventions from 24 quantitative studies, an overall g = 0.504 on learning performance (V, search summary) — [summary record](https://www.gbl.uzh.ch/quartz/references/Bai-et-al.-(2020)); [DOI](https://doi.org/10.1016/j.edurev.2020.100322) (P\*)
- A recent meta-analysis of 28 studies (2010–2024) on asynchronous online learning: motivation g = 0.52, achievement g = 0.41, reported robust to publication-bias checks (V, search summary) — [Online Learning journal](https://olj.onlinelearningconsortium.org/index.php/olj/article/view/5188)

**Undermining effects and SDT**
- Expected tangible rewards undermined free-choice intrinsic motivation:
  - all tangible rewards d ≈ −0.34
  - engagement-contingent d ≈ −0.40
  - completion-contingent d ≈ −0.44
  - performance-contingent d ≈ −0.28

  Unexpected rewards did not undermine. Positive verbal feedback *enhanced* intrinsic motivation, in college students though not in children (P) — [Deci, Koestner & Ryan 1999](https://doi.org/10.1037/0033-2909.125.6.627)
- Children who expected a reward for drawing later drew less in free time (the overjustification effect) (P) — [Lepper, Greene & Nisbett 1973](https://doi.org/10.1037/h0035519)
- In a semester-long course with badges, leaderboards and competition, the gamified group showed lower intrinsic motivation, satisfaction and empowerment over time, and lower final exam scores than a non-gamified group (P) — [Hanus & Fox 2015](https://doi.org/10.1016/j.compedu.2014.08.019)
- Points, levels and leaderboards increased the *quantity* of output, but not intrinsic motivation or competence satisfaction (P) — [Mekler, Brühlmann, Tuch & Opwis 2017](https://doi.org/10.1016/j.chb.2015.08.048)
- Self-determination theory: autonomy, competence and relatedness support intrinsic motivation, and rewards perceived as controlling undermine it (P) — [Ryan & Deci 2000](https://doi.org/10.1037/0003-066X.55.1.68). In games, satisfying competence and autonomy needs predicts enjoyment and continued play (P) — [Ryan, Rigby & Przybylski 2006](https://doi.org/10.1007/s11031-006-9051-8)

**Badges, streaks and progress**
- Badges in a large course's question-authoring system increased participation without reducing quality (P\*) — [Denny 2013](https://doi.org/10.1145/2470654.2470763)
- Badge effects depend on badge type (participation vs skill) and on learners' prior knowledge (P) — [Abramovich, Schunn & Higashi 2013](https://doi.org/10.1007/s11423-013-9289-2)
- Streaks increase continuation while they last, and a *broken* streak lowers subsequent engagement (P\*) — [Silverman & Barasch 2023](https://doi.org/10.1093/jcr/ucac029)
- Temporal landmarks such as a new week or month raise motivation for aspirational behaviour (the fresh-start effect) (P) — [Dai, Milkman & Riis 2014](https://doi.org/10.1287/mnsc.2014.1901)
- Effort accelerates as a goal approaches (the goal-gradient effect) (P) — [Kivetz, Urminsky & Zheng 2006](https://doi.org/10.1509/jmkr.43.1.39)
- Ethical problems in gamification include manipulation, exploitation and harm to autonomy (P) — [Kim & Werbach 2016](https://doi.org/10.1007/s10676-016-9401-5)

**Product evidence verified this session**
- Duolingo: learners practised to keep strength meters "gold" rather than to review what they needed. Under HLR's better scheduling, the share of learners who came back the next day to do *practice* fell 7.3% against Leitner, while next-day return for any activity held (+0.3%). HLR without lexeme features later raised next-day return for any activity by 12.0% (V) — [Settles & Meeder 2016](https://doi.org/10.18653/v1/P16-1174)
- Math Academy: an expert-encoded knowledge graph separating prerequisite and encompassing relations, fractional implicit repetition, and per-student, per-topic calibration of review speed (V, search summary) — [Skycak post](https://justinmath.com/individualized-spaced-repetition-in-hierarchical-knowledge-structures/); [Math Academy](https://mathacademy.com/how-our-ai-works)
- PhET: research-based interactive simulation design (P) — [Wieman, Adams & Perkins 2008](https://doi.org/10.1126/science.1161948)

### Inferences
**Core rule: two currencies that never mix** (Moderate; follows from SDT, Deci et al., and the brief)
- **XP** = effort and engagement.
- **Mastery** = evidence (Section 1).
- The map, not the XP bar, is the hero display.

**XP spec** (Speculative values)

| Activity | XP |
|---|---|
| Practice item completed after a genuine attempt (hint-neutral) | 10 |
| Spaced-review item | 15 (rewards the behaviour that matters most) |
| Worked example studied (including "show solution") | 5 |
| Checkpoint | 40 |
| Boss battle *attempt*, pass or fail | 150 |

- No accuracy bonus. Accuracy bonuses would indirectly penalise hint use.
- XP is awarded once per item variant.
- Diminishing returns after about 20 items on the same skill in a day nudge the learner toward spacing instead of cramming.

**Levels** (Weak)
- Gentle XP thresholds (level L needs about 100·L XP), purely cosmetic.
- Always shown next to *map coverage*: skills Proficient or better, and Mastered.

**The map as the open learner model** (Moderate for OLMs; Weak for fiction)
- Each skill node shows state by colour plus shape.
- "Review due" appears as a gentle glint, not a warning.
- The frontier of "ready to learn" nodes is highlighted.
- Completing a region reveals artwork and lore, a light game fiction ("charting the Atlas") that fits the subject.

**Achievements for learning behaviours** (Moderate for the principle; specific badges Speculative). Shown as recognition after the fact, each with a line on *why* the behaviour helps; a browsable list keeps autonomy.

| Behaviour | Achievement |
|---|---|
| Retrieval | "Came back to it": solved a skill review 30+ days after last practice |
| Spacing | "Little and often": studied on 4 different days in a week |
| Transfer | "New territory": solved a transfer item unassisted |
| Persistence | "Worked it out": solved a fresh variant unassisted after needing the full solution |
| Calibration | "Calibrated": bias within ±10 points over 30 rated items |
| Error-finding | "Debugger": found the error in 10 flawed solutions |
| Exploration | "Experimenter": tried 10 "try first" challenges, regardless of result |
| Good help-seeking | "Hint, then own it": unassisted solve on the variant after a hinted one |

Avoid badges for time-on-app, logins, raw streak length, or XP totals alone.

**Streaks** (Weak–Moderate; opt-in at onboarding, off by default)
- The learner sets a weekly goal: 1–7 study days, or minutes per week.
- The streak counts consecutive *weeks* that met the goal.
- One rest token is earned for every 4 goal weeks and applied automatically.
- Cumulative "days studied" and "longest run" are always shown and never reset.
- A missed week reads "New week, fresh start", never "streak lost".
- No paid repair, no countdown, no streak-loss notifications.

**Daily challenge** (Moderate for the mechanism, mixed retrieval and transfer; Speculative for the daily framing)
- One untimed problem a day, combining two skills that are already Proficient in a novel (T3/T4) context.
- Kept in a 7-day archive, so there is no fear of missing out.
- Counts as mixed or transfer evidence. Not tied to the streak.

**Boss battles** (Moderate for integrative assessment; Weak for the framing)
- End-of-course or end-of-region capstones with narrative framing (Section 7).
- Recommended once about 80% of the region's skills are Proficient, but never locked.
- No lives or hearts, progress saved, a full debrief afterwards, and failures routed to targeted practice.

**Notifications** (Moderate)
- Off by default. If enabled, informational only: "3 skills ready for review, about 8 minutes".

**Never include** (Moderate: Hanus & Fox, Deci et al., Kim & Werbach, Silverman & Barasch)
- leaderboards (single learner)
- hearts, lives or energy limits that punish errors
- loot boxes or variable-ratio rewards
- timers on learning
- loss-framed streak warnings
- confirm-shaming
- artificial "endowed progress"
- paywalled streak repair

**Product teardown** (design judgements; product facts outside the "verified" list above are unverified background, see Gaps)

| Product | Does well | Does badly | Adopt / reject |
|---|---|---|---|
| Duolingo | Tiny sessions; data-driven review scheduling validated by A/B tests (HLR, V) | Meters drove learners to practise for the badge rather than for need (V); streak, league and heart mechanics lean on loss aversion and competition (background) | Adopt short sessions and measured scheduling; reject loss-framed streaks, leagues and hearts |
| Brilliant | Interactive, visual, problem-first lessons (background) | Little visible mastery modelling or spaced review; heavy streak and league gamification (background) | Adopt "do before read"; reject engagement mechanics decoupled from evidence |
| Khan Academy | Free, broad, explicit mastery levels; unit tests and course challenges (background) | Mastery can be granted without a delayed retention check; points and badges loosely tied to learning (background) | Adopt visible levels and test-outs; add retention gates |
| Math Academy | Knowledge graph, FIRe implicit review, per-topic calibration, diagnostic placement (V/background) | Strict XP penalties for low effort (background); little exploratory visual interactivity | Adopt the graph and FIRe ideas; reject punitive XP; add PhET-style visuals |
| Desmos | Excellent manipulable graphs; activities that give "interpretive" feedback by showing what your answer does (background) | Not a self-paced mastery system; teacher-led | Adopt interpretive, visual feedback |
| PhET | Research-based implicit scaffolding (P) | No learner model, assessment or spaced review; needs outside activity prompts | Adopt the design method; wrap it in prompts and evidence capture |

**The original synthesis for the Atlas** (Speculative as a whole, built from Moderate parts)
- PhET-grade manipulable visuals with interpretive feedback.
- Math Academy-style graph-aware mastery and implicit review, without punitive XP.
- Duolingo-style short sessions and measured, auditable scheduling, without loss-aversion mechanics.
- An honest open learner model: the map, with evidence checklists.
- SDT-aligned game elements that inform rather than control.

### Gaps
- I could not retrieve Duolingo's own blog or research on streaks (streak freezes, A/B results), leagues, hearts/energy, or Birdbrain (its Elo/IRT-like exercise model). blog.duolingo.com was unreachable and search was exhausted.
- I could not verify product facts for Khan Academy (mastery points and levels, hint scoring), Brilliant, Desmos (Activity Builder, "interpretive feedback"), Math Academy's XP rules, or its diagnostic. The table's "background" entries are recalled impressions and need checking before publication.
- I found no peer-reviewed evidence on "daily challenges" as such, or on weekly vs daily streak designs. The streak recommendations extrapolate from Silverman & Barasch and the fresh-start literature.
- I did not inspect publication bias in the gamification literature beyond the one meta-analysis that reports robustness.
- I found no long-term (more than one year) studies of gamified self-study.

---

## 7. Assessment design for checkpoints and boss battles: measuring genuine understanding, and writing good multiple-choice items with misconception-based distractors

### Takeaway
Checkpoints should be short, unassisted, mixed retrieval sets with immediate corrective feedback. Boss battles should be designed with evidence-centered design (ECD): state the claims, specify the evidence, then build the tasks. Tasks should be multi-step, mixed-topic and novel-context, and include explanation, error-finding and "which principle applies?" items, with the results counting as high-weight transfer evidence. Multiple-choice items should follow Haladyna's guidelines; three good options are usually enough, distractors come from documented misconceptions and error patterns, and every multiple-choice response gets feedback so the lures are not learned.

### Cited Findings
**Item writing**
- Haladyna, Downing & Rodriguez distilled 31 multiple-choice item-writing guidelines from textbooks and research (P) — [Haladyna, Downing & Rodriguez 2002](https://doi.org/10.1207/S15324818AME1503_5). The main ones:
  - test one important idea; use novel material to test higher-level thinking; avoid trick items
  - put the central idea in the stem and word it positively; avoid NOT and EXCEPT, or highlight them if unavoidable
  - make every distractor plausible, and use typical student errors to write them
  - keep options homogeneous and of similar length, place them in a logical or numerical order, and vary the position of the key
  - avoid "all of the above"; use "none of the above" sparingly
  - avoid clues such as grammatical mismatch, clang associations, or absurd options
- A meta-analysis found three options optimal. Moving from four or five options to three barely changes item quality and saves testing time (P) — [Rodriguez 2005](https://doi.org/10.1111/j.1745-3992.2005.00006.x)

**Physics misconceptions and diagnostic formats**
- The Force Concept Inventory uses common-sense misconceptions (impetus, "motion implies force", and so on) as distractors to diagnose Newtonian understanding (P) — [Hestenes, Wells & Swackhamer 1992](https://doi.org/10.1119/1.2343497)
- Two-tier items (answer plus reason) and certainty indices (Section 5) separate misconceptions from knowledge gaps (P) — [Treagust 1988](https://doi.org/10.1080/0950069880100204); [Hasan et al. 1999](https://doi.org/10.1088/0031-9120/34/5/304) (P\*)
- Multiple-choice lures can be learned without feedback (P) — [Roediger & Marsh 2005](https://doi.org/10.1037/0278-7393.31.5.1155); [Butler & Roediger 2008](https://doi.org/10.3758/MC.36.3.604)

**Transfer and expertise**
- A taxonomy of transfer by content (what skill, what kind of performance change, what memory demand) and by context (knowledge domain, physical, temporal, functional, social, modality) (P) — [Barnett & Ceci 2002](https://doi.org/10.1037/0033-2909.128.4.612)
- Preparation for future learning as a transfer measure (P) — [Bransford & Schwartz 1999](https://doi.org/10.3102/0091732X024001061)
- Novices sort physics problems by surface features, experts by underlying principles (P) — [Chi, Feltovich & Glaser 1981](https://doi.org/10.1207/s15516709cog0502_2)

**Assessment design methods**
- Evidence-centered design specifies a competency model, an evidence model and a task model (P\*) — [Mislevy, Almond & Lukas 2003](https://doi.org/10.1002/j.2333-8504.2003.tb01908.x)
- Context-rich physics problems (realistic, no explicit cue to the principle, sometimes with extra or missing information) elicit real problem solving (P\*) — [Heller & Hollabaugh 1992](https://doi.org/10.1119/1.17118)
- Erroneous examples (finding and fixing errors) produced delayed learning benefits in a decimals tutor (P\*) — [McLaren, Adams & Mayer 2015](https://doi.org/10.1007/s40593-015-0064-x). In the 2023 maths meta-analysis, though, incorrect-solution examples were less effective than correct ones for initial learning (V) — [Barbieri et al. 2023](https://doi.org/10.1007/s10648-023-09745-1)

### Inferences
**Checkpoint spec** (Strong for retrieval; Moderate for mixing; cut-offs Speculative)
- 5–8 items, about 3–6 minutes.
- Unassisted: hints off. "I don't know" is allowed, scores c = 0 and carries no XP penalty.
- At least 2 items on the new skill (different templates, at least one T2 and one T3), at least 1 item from earlier in the unit, and at least 1 older item.
- Immediate correctness and elaborated feedback after each item.
- Progression passes with 2 of 2, or at least 2 of 3, on new-skill items. Otherwise offer targeted practice, and a retake with fresh variants after 10 minutes or next session.

**Boss battle spec, built with ECD** (Moderate for the method; structure Speculative)
1. **Claims** (competency model), for example: "chooses and applies momentum and energy principles to an unfamiliar multi-body system", or "computes and interprets proper time along a worldline in a given metric".
2. **Evidence model**: map each observable (principle chosen, intermediate quantities, final answer, explanation chosen, error found) to skills. Use weight w = 1.5 and b = +1.5 in the Section 1 model.
3. **Tasks**: 3–5 multi-part problems of 3–6 steps each, including:
   - at least one context-rich, novel situation with no cue to the principle
   - at least one problem that mixes two units
   - at least one two-tier explanation item (answer + "why", with misconception-based reasons)
   - at least one "find the error in this worked solution" item
   - at least one "which two problems are solved the same way?" categorisation item (deep structure)
   - optionally, an order-of-magnitude estimate and a predict-then-run simulation item
4. **Scoring and passing**:
   - Each claim passes when it earns at least about 70% of its evidence points.
   - Passing supplies the mixed/transfer gate for Mastered on the included skills.
   - Feedback and solutions come at the end.
   - Retries use fresh variants after at least one day. A failed claim routes to targeted practice for its weakest skills.
   - No lives, no timers. "I'm stuck, reveal" converts a part into practice and lets the battle continue (non-punitive).

**Item formats a client-side app can grade without AI** (Moderate)
- numeric answers with tolerance and unit checking
- symbolic answers checked by testing equivalence at random numeric points
- multiple choice for conceptual discrimination
- two-tier multiple choice (answer + reason) for explanation
- ordering or "choose the next step" for derivations
- error-location (tap the faulty line)
- prediction followed by simulation

Prefer numeric or symbolic entry for computation, since it has no guessing floor (g = 0), which makes it stronger evidence.

**Distractor authoring process** (Moderate)
1. List the target misconception and error patterns per skill, from the PER literature (FCI-type) and from common algebra errors: sign, factor of 2, units and dimensions, confusable formulas.
   - Graduate GR examples (Speculative): treating coordinate time as proper time; treating the event horizon as a physical surface; treating gravity as a force in free fall.
2. Write each distractor as the *result* of one specific error, and tag it with the misconception ID that drives the micro-teaching line.
3. Use three options when only two good distractors exist. Do not pad with implausible fillers.
4. After use, any distractor almost never chosen (if aggregate data ever exist) should be rewritten.

**Validity guards** (Moderate)
- No hints during summative parts.
- Novel surface features, so success cannot come from memorising answers.
- Mixed topics, so the question does not announce which skill applies.
- Feedback after every multiple-choice item, to neutralise lures.
- At least one constructed-response part per claim, so recognition alone cannot pass.

### Gaps
- I found no empirical studies of "boss battle" framing as such, nor of whether narrative framing changes assessment validity.
- Automatic grading of free-text explanations without AI is not possible. The two-tier and ordering formats are a compromise, and their validity against interview-based measures of understanding was not retrieved.
- The 70% claim-level pass mark is a convention, not an evidence-based value.
- I did not retrieve item-writing research specific to symbolic-entry items, or misconception inventories for GR (some exist in PER, but none were retrieved).

---

## 8. Onboarding: optional diagnostic assessment (adaptive placement), and why a course taken in school should not mark a topic mastered

### Takeaway
Offer an optional, resumable, graph-aware adaptive diagnostic: about 15–25 unassisted items, no time pressure, and an "I don't know" button. It places the learner on the map as at most "Proficient (placed, provisional)", schedules early confirmation reviews, and leaves test-outs available any time. Self-reported coursework only picks where the diagnostic starts (and nudges the prior). It never sets a state, because:
- school knowledge decays unless it keeps being used
- courses differ in what they cover
- self-assessment is unreliable
- learners differ far more in prior knowledge than in learning rate

### Cited Findings
**Why coursework is not mastery**
- In a study of lifetime retention of high-school algebra and geometry, retention depended mainly on how much mathematics people went on to study. Those who took college maths at or above calculus kept most of their knowledge for decades. Those who stopped after minimal coursework declined toward near-chance levels (P) — [Bahrick & Hall 1991](https://doi.org/10.1037/0096-3445.120.1.20)
- Over a summer break students lose ground, on the order of a month of grade-level equivalents, with mathematical computation among the most affected skills (P) — [Cooper et al. 1996](https://doi.org/10.3102/00346543066003227)
- Forgetting is steep without spaced retrieval (P) — [Cepeda et al. 2008](https://doi.org/10.1111/j.1467-9280.2008.02209.x)
- Self-assessment is flawed and correlates only modestly with performance (P) — [Dunning, Heath & Suls 2004](https://doi.org/10.1111/j.1529-1006.2004.00018.x); [Kruger & Dunning 1999](https://doi.org/10.1037/0022-3514.77.6.1121)
- Students differ widely in initial knowledge but learn at similar rates per opportunity, so prior knowledge must be measured, not assumed (P\*) — [Koedinger et al. 2023](https://doi.org/10.1073/pnas.2221311120)

**How to place**
- Knowledge Space Theory represents a domain as the feasible "knowledge states" (sets of mastered items) consistent with prerequisite structure. That allows efficient adaptive assessment of a learner's state (P) — [Doignon & Falmagne 1985](https://doi.org/10.1016/S0020-7373(85)80031-6)
- Instruction should be matched to existing expertise (expertise reversal), and expertise can be estimated rapidly with first-step tasks (P) — [Kalyuga 2007](https://doi.org/10.1007/s10648-007-9054-3); [Kalyuga & Sweller 2005](https://doi.org/10.1007/BF02504800)
- Math Academy places learners with a diagnostic and then teaches along an expert-encoded knowledge graph (V, existence and summary level only) — [Math Academy, How it works](https://mathacademy.com/how-our-ai-works)

### Inferences
**Self-report screen** (Moderate as a prior; Speculative values)
- Ask "Which of these have you studied, and roughly when?" with a checklist of courses.
- Use the answers only to choose the diagnostic's entry nodes and to set θ0 = −0.5 (instead of −1.0) for skills in recently completed courses.
- Never use them to set a state.

**Diagnostic algorithm**, graph-based and KST-inspired (Moderate for the principle; specifics Speculative)
1. Keep a P(known) for every node in the target course, starting at 0.5 for nodes inside the self-reported courses and 0.15 for the rest.
2. Pick the next item at the node with the most expected information: P closest to 0.5, weighted by how many other nodes its result would inform (descendants for a success, ancestors for a failure).
3. Unassisted success on node N: set P(N) = 0.9, and raise its encompassed ancestors to max(P, 0.75·e).
4. Failure or "I don't know" on node N: set P(N) = 0.15, and lower nodes that depend on N to min(P, 0.3).
5. Stop when every node in the targeted course is below 0.2 or above 0.8, or after 25 items or about 25 minutes. The learner can stop and resume at any time.
6. Use mostly numeric or symbolic entry (no guessing floor), with an explicit "I don't know" button.
7. No hints, no timer, no XP penalty; a small fixed XP award for completing it.

**Mapping results to states** (Speculative)

| Diagnostic result | State | Initial values |
|---|---|---|
| Directly tested success, P > 0.8 | "Proficient (placed)" | θ = +1.0, FSRS S = 3 days (confirmation review within days) |
| Implied only, P > 0.8 but never directly tested | "Developing (placed)" | θ = +0.4, review within 1–2 days |
| 0.2 ≤ P ≤ 0.8 | Learning | lesson recommended |
| P < 0.2 | Not Started | — |
| Any result | Never Mastered | Mastered still requires spaced and transfer evidence (Section 1) |

**Other routes and messaging** (Moderate)
- Unit test-outs stay available any time (Section 2).
- "I already know this" on any lesson runs a 3-item unassisted check instead of granting the state.
- Explain the policy to the learner in one line: "School courses tell us where to start, not what you remember today. A few quick problems will place you."

### Gaps
- I could not retrieve ALEKS's or Math Academy's diagnostic specifics (length, item selection, stopping rules), nor validation data for graph-based placement accuracy against later performance.
- How strongly a success on an advanced item implies its prerequisites (the 0.75·e propagation) has no empirical basis here. It should be logged and audited against those prerequisites' first reviews.
- Bahrick & Hall's exact retention curves, and how they would apply to university physics topics, were not re-checked. The direction of the effect (retention depends on continued use) is well established, but the magnitudes should be verified before quoting.
- The best diagnostic length trade-off (accuracy against onboarding drop-off) is not known from the sources gathered.
