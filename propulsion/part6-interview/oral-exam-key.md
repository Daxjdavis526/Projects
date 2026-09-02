# Oral Exam Question Bank — Examiner's Key

Part VI · Companion to [`oral-exam.md`](oral-exam.md)

This is not a set of model answers. An oral exam has no script, and a candidate
reciting one is transparent from the far side of the table. For each of the
sixty items the key gives:

- **What a strong answer contains** — the content, equations and numbers an
  examiner is listening for, and the trade-offs they want you to raise
  unprompted. Bulleted, because that is how it is scored: as a checklist of
  things you either said or did not.
- **Per-follow-up notes** — what each follow-up is actually testing, which is
  usually not the surface topic, and the answer that satisfies it.
- **What ends the line of questioning early** — the one observation that makes
  further pushing pointless. Examiners stop when the candidate demonstrably
  owns the mechanism; they keep going when they suspect recall. Saying the
  ending line early is the difference between a fifteen-minute item and a
  four-minute one.
- **Classic wrong turn** — the failure the examiner has seen most often on
  this material, and what it reveals.

**Numbers.** Every quantitative figure below was computed with
[`tools/rocket.py`](../tools/rocket.py) and is registered in
[`tools/examples/oral.py`](../tools/examples/oral.py); run
`python3 tools/check_examples.py` to reproduce the set. Real-engine figures
come only from [`reference/engine-database.md`](../reference/engine-database.md),
carrying that file's confidence labels, `inj`/`noz` pressure-station flags,
`/motor` versus `/vehicle` tags, and contested-figure notes. Where the database
records a company claim, this key says "claim" every time it uses the number.
Citation tags in brackets refer to [`reference/sources.md`](../reference/sources.md).

**Epistemic tags** are as in the course README: [F] fundamental, [E] empirical,
[H] historical, [M] modern practice, [R] research, [A] approximation,
[J] judgment.

**A standing warning about the reference chamber.** Items 2, 3, 5, 12, 13, 22
and 23 all use one consistent LOX/RP-1 chamber — γ = 1.20, M = 23 kg/kmol,
T₀ = 3600 K, p_c = 97 bar, F_SL = 845 kN — chosen so the answers cannot drift
apart across items. The 97 bar and 845 kN inputs are SpaceX's published Merlin
1D figures, which the database records as a **claim with no primary source and
no stated pressure station** `[engine-database A.3]`. Everything computed from
them is arithmetic on a claim. A candidate who quotes 260.9 mm of throat
diameter as a fact about a real Merlin has made exactly the error this course
spends thirty-six modules trying to prevent.

---

# Block A — Foundations (items 1–8)

## Item 1 — Thrust from first principles `[M01, M03]`

**What a strong answer contains**

- The control volume drawn *before* the algebra, cutting the propellant inlets
  (where inflow momentum is negligible if the vehicle frame is used) and the
  nozzle exit plane, with the outside surface at ambient pressure. [F]
- $F = \dot m v_e + (p_e - p_a)A_e$, with each term identified: momentum flux
  out, plus the residual of integrating pressure over the whole closed surface.
  [F] `[SB §2.2]`
- A statement of which frame the answer is in, and the observation that thrust
  is what the *mount* feels, not what the exhaust "does".
- The magnitude: for a first-stage nozzle the pressure term is worth roughly
  10–20 % of sea-level thrust; the V-2 was rated ~245 kN SL rising to ~285 kN
  vac, a 16 % altitude gain `[engine-database A.1, A.1.5]`.

**F1 — "the exhaust pushes on the atmosphere".** This is a screen for whether
the pressure term is understood as bookkeeping. It is not the exhaust shoving
against air: $p_a$ acts everywhere on the engine's exterior *except* the exit
disc, and the term is what is left over. A rocket in vacuum has the largest
pressure term of all, which disposes of the claim in one sentence.

**F2 — the alternative control volume.** Extend the surface downstream until
the plume has expanded to ambient. Then $p_e = p_a$ identically, the pressure
term vanishes, and all the thrust is momentum flux at a higher $v_e$. Two
control volumes, one thrust: the split between the terms is a choice of
accounting surface, not physics. [F]

**F3 — the A-7 thrust triple.** 75,000 lbf is the NAA 75-110 nameplate rating;
78,000 lbf is that plus roughly 3,000 lbf of steam-generator exhaust thrust;
82,977 lbf (369 kN) SL / 93,565 lbf (416 kN) vac is the uprated A-7 as flown on
Mercury-Redstone `[engine-database A.1.1]`. Three control-volume boundaries and
two engine blocks. The right answer names *which* boundary each figure uses.

**F4 — turbine exhaust dumped overboard.** It is thrust, it is inside any
control volume that cuts the vehicle rather than the engine, and it is measured
directly by a stand load cell that carries the whole engine — which is why
stand thrust and "chamber thrust" from $C_F p_c A_t$ disagree on
gas-generator engines. The RS-68's GG exhaust goes through a side duct
`[engine-database A.2]`; the F-1's went into the nozzle extension as a film
curtain and is inside the nozzle's own accounting `[engine-database A.2]`.

**Ends the line early.** "The pressure term is the residual of a surface
integral, so it depends on where I put the surface — here is a second control
volume with no pressure term at all and the same thrust."

**Classic wrong turn.** Deriving the equation correctly and then explaining it
as action–reaction against the air. It reveals that the derivation was
memorised, and it predicts the wrong sign for the altitude trend.

## Item 2 — Why performance splits into c\* and C_F `[M03]`

**What a strong answer contains**

- $I_{sp} g_0 = c = c^{*} C_F$, with $c^{*} = p_c A_t/\dot m$ and
  $C_F = F/(p_c A_t)$. [F] `[SB §3.3]`
- The split is diagnostic, not cosmetic: it separates *how well the propellant
  released its energy and how well it was mixed* from *how well the nozzle
  turned that into axial momentum*. Two subsystems, two owners, two fixes.
- The reference chamber worked: γ = 1.20, R = 361.4983 J/(kg·K) (M = 23),
  T₀ = 3600 K gives Γ = 0.648531 and c\* = **1759.03 m/s**; at ε = 16 and
  p_c = 97 bar, sea-level $C_F$ = **1.62995**, so c = **2867.1 m/s** and
  Isp_SL = **292.4 s**. Merlin 1D's published SL Isp is 282 s
  `[engine-database A.3, claim]` — the ideal is ~4 % optimistic, which is the
  loss budget of item 7.

**F1 — which is propellant, which is geometry.** c\* is *nearly* pure
propellant and chamber: it depends on γ, R and T₀, which the mixture ratio and
the chamber pressure set, and on how completely combustion finished, which the
injector and L\* set. $C_F$ is *nearly* pure geometry: γ, ε and $p_a/p_c$. The
impurity in each is worth saying — c\* has a weak chamber-pressure dependence
through dissociation, and $C_F$ inherits γ from the chemistry.

**F2 — computing both efficiencies.** $\eta_{c^*} = c^*_{meas}/c^*_{ideal}$
indicts the injector, the chamber length and the mixture-ratio distribution.
$\eta_{C_F}$ indicts the nozzle contour, the divergence angle and the boundary
layer. Worked case for the reference chamber: a measured $\dot m$ of 306.0 kg/s
against the ideal 294.72 kg/s gives
$c^*_{meas} = 97\times10^5 \times 0.05344557/306.0 = 1693.6$ m/s and
$\eta_{c^*} = 0.963$ — a typical, unremarkable, *acceptable* number.

**F3 — where to spend the money.** $\eta_{c^*} = 0.96$ leaves 4 % on the table;
$\eta_{C_F} = 0.99$ leaves 1 %, and most of that 1 % is boundary-layer loss you
cannot buy back. Injector redesign is where the money goes. The strong answer
adds that injector changes threaten stability and therefore drag in a bomb-test
campaign — a 2 % Isp gain that costs a stability requalification may not close
`[SP-194]`.

**F4 — η > 1.** It means the "ideal" was computed wrong, or $A_t$ has eroded
(so the real throat is bigger than the drawing), or the pressure tap is reading
a different station from the one the ideal assumed, or the flowmeter is under-
reading. On a solid, throat erosion is the usual answer; on a liquid, the
pressure station is `[engine-database, "What Pc means"]`.

**Ends the line early.** "The split exists so that a bad number points at a
subsystem. Give me p_c, A_t, ṁ and F and I will tell you whether to go and see
the injector team or the nozzle team."

**Classic wrong turn.** Saying c\* is "the propellant's specific impulse". It
is not an impulse, it has no nozzle in it, and treating it that way makes the
candidate unable to explain why c\* is unchanged when you bolt on an extension.

## Item 3 — Choking and what the throat controls `[M02]`

**What a strong answer contains**

- Choking stated as a physical mechanism, not a formula: information travels at
  the local speed of sound relative to the fluid, so once the throat reaches
  M = 1 no downstream disturbance can propagate upstream past it. [F]
  `[Anderson-MCF §5]`
- $\dot m = \Gamma p_0 A_t/\sqrt{R T_0}$ with
  $\Gamma = \sqrt{\gamma}\,(2/(\gamma+1))^{(\gamma+1)/2(\gamma-1)}$ — linear in
  $p_0$ and $A_t$, inverse-square-root in $T_0$, and *nothing* about the
  downstream. [F]
- The reference chamber: **294.72 kg/s** at 97 bar through 0.05345 m². Doubling
  to 194 bar gives **589.44 kg/s** exactly — the linearity is the point.

**F1 — doubling chamber pressure.** Mass flow doubles. Thrust
($F = C_F p_c A_t$) roughly doubles — only *roughly*, because $C_F$ creeps up
as the ambient-pressure term becomes a smaller fraction: at ε = 34.34 and
γ = 1.20, $C_F^{SL}$ goes from **1.6393** at 150 bar to **1.7553** at 300 bar, a
7 % gain. Isp therefore rises by that same ~7 %, not by a factor of two. A
candidate who says "Isp doubles" has confused thrust with efficiency; one who
says "Isp is unchanged" has forgotten the ambient term.

**F2 — 6 % throat erosion, solid versus pressure-fed liquid.** Solid: the
burning area does not care, so pressure re-equilibrates at
$p_2/p_1 = (A_{t1}/A_{t2})^{1/(1-n)} = (1/1.06)^{1/0.65} = 0.9143$, an 8.6 %
pressure drop — the erosion is *amplified* by the exponent. [E] Pressure-fed
liquid: the injector Δp is what sets flow, so a bigger throat means lower
chamber pressure, more injector Δp, *more* flow, and the system finds a new
point with higher ṁ and lower p_c. Different in kind because the solid's
"injector" is the propellant surface itself and its flow rises with pressure.

**F3 — where the sonic point really is.** Slightly downstream of the geometric
minimum, displaced by wall curvature and by the boundary-layer displacement
thickness; the sonic line is curved, not flat. You care when computing $A_t$
from a drawing for a c\* determination — a 1 % area error is a 1 % c\* error,
which is the size of the effect you are trying to measure. `[ZH Vol. 1]`

**F4 — 3 % low mass flow at correct p_c.** Candidates: (i) $A_t$ smaller than
drawing — measure it; (ii) flowmeter calibration — cross-check with tank
level/weight; (iii) T₀ higher than assumed, i.e. mixture ratio off — check the
two flows independently; (iv) the pressure tap is reading a different station.
The separating measurement is a tank-gauging mass balance against the
integrated flowmeter signal, because it is independent of both.

**Ends the line early.** "Choked flow makes ṁ a boundary condition set entirely
upstream — that is why $A_t$ is the one dimension you machine to a tenth of a
percent."

**Classic wrong turn.** Saying flow chokes "because the gas cannot go faster
than sound". It can and does, immediately downstream. The constraint is on
information, not on speed.

## Item 4 — What CEA gives you and what it does not `[M04, M01]`

**What a strong answer contains**

- What was solved: minimisation of Gibbs free energy over a species set at
  fixed enthalpy and pressure, then an isentropic expansion, giving equilibrium
  composition, T₀, γ (an effective one), M, c\*, and Isp at stated ε.
  `[CEA]`, `[RP-1311]`
- What to trust: c\* and T₀ to a couple of percent, *given* correct thermo data
  and the assumption of complete mixing. What not to trust: any implication
  that the injector achieves that mixing, any two-phase or particle effects
  unless asked for, and Isp quoted without stating frozen or shifting.
- The habit of stating the assumption set out loud: adiabatic, one-dimensional,
  chemical equilibrium at every station, no boundary layer, no droplets.

**F1 — frozen versus shifting.** Shifting (composition re-equilibrates as the
gas cools, releasing recombination energy) is the optimistic bound; frozen
(composition locked at the throat) is the pessimistic one. For a large
hydrocarbon engine the gap is roughly 2–4 % of Isp; for hydrolox it is larger
because there is more dissociation to recombine. Real engines land between and
nearer shifting. [A] `[SB §5.4]`, `[CPIA-246]`

**F2 — off-optimum mixture ratio.** Five reasons, all worth points: (i) the
Isp optimum and the *density-impulse* optimum are at different O/F, and vehicle
mass cares about the second; (ii) running fuel-rich lowers T₀ and buys cooling
margin; (iii) fuel-rich exhaust is less aggressive to the turbine and the wall;
(iv) film and barrier cooling deliberately runs the near-wall zone rich; (v)
the flame temperature optimum and the c\* optimum are not at the same O/F
because M is falling as you go rich. The F-1 ran 2.27 and the RD-180 runs 2.72
`noz`† `[engine-database A.2, A.6]`.

**F3 — doubling chamber pressure 100 → 200 bar.** T₀ rises a little (less
dissociation at higher pressure), c\* rises a little for the same reason —
both effects are a percent or two. Isp at fixed ε rises mostly because $C_F$
improves against a fixed ambient. The *smallest* of the three effects is the
c\* gain. A candidate who claims a large c\* gain from pressure has not
internalised that c\* is nearly pressure-independent. [F]

**F4 — verifying CEA against a hot fire.** Measure p_c, A_t and ṁ, form
$c^*_{meas}$, and compare to CEA's c\* at the *measured* mixture ratio — which
means you need both flows accurately, so the flowmeters are the experiment.
State that you are measuring $\eta_{c^*}$, a product of CEA error and injector
performance, and that separating them needs either a very long chamber (drive
η → 1) or a second chamber length.

**Ends the line early.** "CEA tells me the best the chemistry can do with
perfect mixing. Everything between that and my test data belongs to the
injector."

**Classic wrong turn.** Quoting a CEA Isp as the engine's Isp. It has no
boundary layer, no divergence loss, no film cooling and no mixing shortfall,
and it is 4–8 % high for a real engine.

## Item 5 — Expansion ratio and the altitude compromise `[M02, M03, M09]`

**What a strong answer contains**

- The two competing terms in $C_F$: the momentum term grows with ε, the
  pressure term $-(p_a/p_c)\varepsilon$ punishes it at low altitude. [F]
- Optimum ε is where $p_e = p_a$; the proof is that $dF/d\varepsilon$ has the
  factor $(p_e - p_a)$, so thrust is stationary exactly there. [F] `[SB §3.4]`
- Numbers for the reference chamber: at 97 bar the sea-level-optimum ε is
  **11.48**; at the RS-25's 206.4 bar `inj` it is **20.5**. Real first stages
  fly higher than that — Merlin 1D at 16, Raptor at ~34.3 (claim) — because the
  vehicle spends most of the burn above sea level and the integral, not the
  liftoff instant, is what matters `[engine-database A.3]`.
- Vacuum $C_F$ at γ = 1.20: **1.7971** at ε = 16, **1.8843** at 40, **1.9349**
  at 77.5, **2.0040** at 240; at γ = 1.19, **2.0299** at ε = 285. The diminishing
  return is visible without a plot.

**F1 — why nobody flies at the sea-level optimum.** Because the objective is
mission Δv, not liftoff thrust. Over-expanding slightly costs a little at t = 0
and pays for the rest of the burn. The constraint that stops you is flow
separation and side loads, not performance.

**F2 — break-even altitude, set up.** Equate the two $C_F$ values:
$p_{a,BE} = p_c\,[C_F^{vac}(\varepsilon_2) - C_F^{vac}(\varepsilon_1)]/(\varepsilon_2-\varepsilon_1)$,
then invert the troposphere,
$h = (T_0/L)\,[1 - (p_a/p_{SL})^{R_{air}L/g_0}]$ with T₀ = 288.15 K,
L = 0.0065 K/m, $R_{air}$ = 287.05 J/(kg·K). For 100 bar between ε = 16 and 60
this lands near 10 km. [A]

**F3 — why stop at ε = 285.** Four limits, and the strong answer gives at least
three: nozzle mass grows faster than the Isp gain (the $C_F$ curve is flat out
there — 240 → 285 is worth under 1 %); the exit diameter must fit the stage and
the fairing, which is why RL10B-2's extension is deployable
`[engine-database A.2.7]`; the boundary layer thickens and eats the ideal gain;
and an uncooled radiative extension has a temperature limit set by the material,
which for the RL10B-2 is 3D carbon–carbon.

**F4 — later staging.** Later separation means more of the burn happens higher
up, so the optimum first-stage ε goes **up**. It depends on payload only through
the trajectory it forces — a heavier payload flies a lofted, lower-dynamic-
pressure profile and shifts the answer again. [J]

**Ends the line early.** "$C_F$ is flat near the optimum and the ambient
penalty is linear in ε, so the design point is set by separation and by nozzle
mass, not by the optimum."

**Classic wrong turn.** Designing to $p_e = p_a$ at sea level for a first
stage. It is the textbook optimum for a single instant that the vehicle spends
almost none of its burn at.

## Item 6 — Molecular weight, gamma, temperature `[M01, M04]`

**What a strong answer contains**

- $c^{*} = \sqrt{R T_0}/\Gamma$ with $R = R_u/M$, so $c^{*}\propto\sqrt{T_0/M}$
  at fixed γ. [F]
- The asymmetry of the two levers: T₀ is bounded above by materials, cooling
  and dissociation and is roughly the same 3,300–3,700 K for every practical
  chemistry; M varies by a factor of ten between hydrolox (~13.5) and a
  metallised solid (~28–29). M is where the freedom is.
- Worked contrast: LOX/LH2 at γ = 1.19, M = 13.5, T₀ = 3550 K gives
  c\* = **2286.9 m/s**; the reference LOX/RP-1 chamber gives **1759.0 m/s**.
  A 30 % c\* advantage from molecular weight alone.

**F1 — cooler and better.** Hydrolox at O/F ≈ 6 burns near 3,300–3,600 K,
cooler than LOX/RP-1's ~3,600 K, but at M ≈ 13.5 against ~23. The ratio
$\sqrt{T_0/M}$ favours hydrogen by about $\sqrt{(3550/13.5)/(3600/23)} = 1.30$.
Molecular weight beats temperature, and it beats it by more than the
temperature deficit costs.

**F2 — what γ does, twice, with opposite sign.** In c\*, low γ *helps*: Γ falls
as γ falls, and c\* = √(RT₀)/Γ. In $C_F$, low γ also helps, because a softer
gas converts more enthalpy per unit pressure ratio. But low γ comes from
polyatomic, heavy species, which raises M and hurts c\* — so the γ preference
is real but usually dominated by what γ implies about M. Saying "γ appears in
both and I have to be careful about which effect wins" is the answer; picking
a side without justification is not.

**F3 — cold helium against hydrolox.** Helium at 300 K, γ = 1.667, M = 4.003
gives ideal vacuum Isp **178.1 s** at ε = 50; hydrolox gets ~450 s. The ratio is
2.5. Account: $\sqrt{T_0}$ contributes $\sqrt{3550/300} = 3.44$; $\sqrt{1/M}$
runs the *other* way, $\sqrt{4.003/13.5} = 0.54$; Γ and $C_F$ differences make
up the rest. Temperature is doing all the work, and helium's tiny molecular
weight is the only reason cold gas is not worse still.

**F4 — fuel-rich as a lever.** For hydrolox, going rich adds free H₂ (M = 2) to
the exhaust, dropping mean M sharply — a big lever, which is why the optimum
O/F for Isp (~4.5–5) sits well below stoichiometric (8). For a hydrocarbon, the
excess fuel decomposes to CO, CH₄ and carbon, which do not drop M much and can
condense — a weak lever, and one that eventually costs you c\* to soot. The J-2
exploited exactly this, shifting O/F 4.5–5.5 with a PU valve to trade thrust
780–1,000 kN against Isp `[engine-database A.2]`.

**Ends the line early.** "T₀ is capped by materials at roughly the same value
for every chemistry, so the whole game is molecular weight — which is why
hydrogen wins and why every cold-gas system is a molecular-weight argument."

**Classic wrong turn.** "Hydrogen is better because it burns hotter." It burns
cooler at its operating point, and a candidate who says otherwise cannot then
explain why hydrolox chambers are easier to cool than kerolox ones.

## Item 7 — The Isp loss budget `[M03, M09]`

**What a strong answer contains**

- The named terms, roughly in order for a large booster: combustion/mixing
  inefficiency (1–4 %), boundary-layer/friction (0.5–1.5 %), divergence
  (0.5–2 %), two-phase or kinetic (0–2 %, chemistry-dependent), film-cooling
  dilution (0–3 %, if used), and cycle losses if the accounting includes
  turbine flow. `[CPIA-246]`, `[SB §3.5]`
- The 366 → 348 s example: 18 s is ~4.9 %, which is a *normal* stack for a
  gas-generator engine, not a sign of anything wrong.
- The candidate should ask what the 366 s was — frozen or shifting, and at
  what ε — before allocating anything to it.

**F1 — multiply or add.** Physically they multiply: each is an efficiency on
what survives the previous one. Numerically it barely matters at these sizes —
a multiplicative stack on 366 s gives 349.1 s where the additive one gives
348.8 s, a 0.3 s difference. Saying "they multiply, and here is the arithmetic
showing that it does not matter here" is a stronger answer than either
convention alone. [A]

**F2 — reordering for two engines.** Pressure-fed hypergolic upper stage:
divergence and boundary layer dominate (large ε, small size, low Reynolds
number, thick boundary layer), combustion loss is small because hypergols mix
and react fast, and there is no cycle loss at all. Staged-combustion booster:
combustion loss is small (high p_c, good atomisation), cycle loss is zero by
definition, and the biggest term is boundary layer plus whatever film cooling
is spent. The item is testing whether "the loss budget" is a memorised list or
a physical model.

**F3 — divergence factor derived.** Integrate the axial component of exit
momentum over a spherical cap of half-angle α:
$\lambda = (1 + \cos\alpha)/2$, which is 0.9830 for α = 15°, a 1.7 % loss. [F]
Say that a bell recovers most of it by turning the flow back toward axial.

**F4 — what a bigger engine has less of.** Boundary-layer loss, because the
boundary layer is a surface effect and thrust is a volume/area effect — the
wetted-area-to-throat-area ratio falls with size. Also relatively less film
cooling for the same wall margin, for the same reason. This is the same scaling
argument as the expander-cycle ceiling in item 29, and saying so out loud is
worth points.

**Ends the line early.** "Before I allocate anything I need to know whether 366
is frozen or shifting and at what area ratio — otherwise I am budgeting against
a number that may already contain half the answer."

**Classic wrong turn.** Attributing the whole shortfall to "combustion
efficiency". It puts 18 s on the injector when a third of it belongs to the
boundary layer and the divergence angle, and it sends the wrong team to work.

## Item 8 — Reading a hot-fire record `[M03, M18]`

**What a strong answer contains**

- An order, stated as a procedure: (i) did the sequence execute — valve
  positions and timings; (ii) chamber pressure trace shape — start transient,
  overshoot, steady value; (iii) both flows and therefore mixture ratio;
  (iv) thrust against $C_F p_c A_t$ for consistency; (v) wall temperatures last,
  because they are slow and they are the *consequence* of everything above.
- The instinct to check consistency between independent channels before
  believing any of them. `[SP-8041]`, `[CPIA-246]`
- Sample-rate awareness: chamber pressure needs kHz-class sampling to see chug
  and screech; thermocouples at 10 Hz are fine and anything faster is a lie
  about their response time.

**F1 — 4 % C_F disagreement.** In likelihood order: (i) throat area differs
from drawing (erosion, thermal growth, or it was never measured); (ii) the
pressure tap station — injector-end versus nozzle-stagnation is worth a few
percent by itself `[engine-database, "What Pc means"]`; (iii) load-cell
alignment or tare, including line-tension restraint from propellant hoses;
(iv) real nozzle losses that the ideal $C_F$ omits; (v) transducer
calibration drift.

**F2 — uncertainty combination.** Isp = F/(ṁ g₀): with ±0.25 % on thrust and
±0.5 % on total flow, RSS gives **±0.56 %**. c\* = p_c A_t/ṁ: with ±0.3 % on
pressure and ±0.5 % on flow (area taken as exact), RSS gives **±0.58 %**. Then
the point the examiner wants: a 1 % Isp improvement is *inside* the noise of a
single test, so acceptance is on a population of tests, not one.

**F3 — one thermocouple 150 K hot from t = 0.4 s.** First hypothesis: a local
hot streak from injector maldistribution — a plugged or misdrilled element, or
an element running locally ox-rich. Second, which must be ruled out first
because it is cheaper: the instrument itself — debonded thermocouple, changed
contact resistance, or a wiring fault. Check whether the offset appeared at the
same instant as anything in the sequence, and whether the channel's noise
character changed. Only then go near hardware. `[SP-8089]`

**F4 — what you refuse to accept on.** Anything with a stability event, however
brief; anything where the sequence did not execute as written; any test where
the instrumentation set was incomplete for the parameter being accepted; any
excursion outside the qualified box even if performance was nominal. The
principle: acceptance tests demonstrate conformance, they do not discover
whether the design works. `[SMC-S-016]`

**Ends the line early.** "I look for consistency between channels first,
because a trace that disagrees with another trace tells me more than either
trace's absolute value."

**Classic wrong turn.** Going straight to the wall temperatures because they
look alarming. They are the slowest, most derived, least trustworthy channel on
the stand, and they cannot be interpreted until the mixture ratio is known.
