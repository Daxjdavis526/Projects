# Final Comprehensive Examination — Answer Key

**PROPULSION — a rocket propulsion engineering course** · 100 points

Every arithmetic step below is registered in
[`tools/examples/exam-final.py`](../tools/examples/exam-final.py) and is
reproduced by `python3 tools/check_examples.py`. Where a step has no library
function (an iteration loop, a Pugh matrix, a leak conversion) the arithmetic
is written out in that file's docstring instead.

Numbers are quoted to more figures than an examinee should be asked to
produce; grade on the leading three significant figures unless a rubric line
says otherwise.

---

## How to score this paper

- **Method first.** A correct setup with an arithmetic slip loses at most
  30 % of that part's marks. A correct number from a wrong setup scores zero.
  This rule is the course README's and it is not negotiable on the final.
- **Units are part of the answer.** A number without units, or with
  inconsistent units, loses a mark inside the part, floored at zero for that
  part.
- **Assumptions are part of the answer** in Sections C and D. A diagnosis
  with no ruled-out alternative is a guess that happened to be right; award
  no more than half the marks for the sub-part.
- **Judgment parts are graded on the argument, not the conclusion.** Both
  answers to "would you fly it" can earn full marks. Neither earns anything
  without the counter-argument.

### Score bands and the README mastery levels

| score | README band | what it means on *this* paper |
|---|---|---|
| **90–100** | **Level 3 — interview mastery** | Section B essentially clean; both Section C diagnoses correct *with* the ruled-out alternatives named; Section D recommends a compliant architecture, prices the sensitivity, and identifies the parameter that would flip it. Could defend the paper to a senior propulsion engineer. |
| **75–89** | **Level 2 — working engineering knowledge** | Section A ≥ 15; Section B setups all correct with at most one chain broken by arithmetic; Section C diagnoses right but thin on the evidence that rules out alternatives; Section D sized correctly but the trade is asserted rather than weighted. Correct analysis, gaps in judgment. |
| **60–74** | **Level 1 → 2 — familiarity** | Concepts identified, equations written, but calculations incomplete: typically the coupled loop in B3, the closure check in B2(b), or the reconciliation in C2(d) is missing. Re-work Modules 13, 20 and 32 before the capstone. |
| **< 60** | **re-study** | Below this line the paper is not diagnostic of which module failed. Re-sit the Part exams for whichever section scored worst and return here. |

**Section-level diagnosis, for the student scoring themselves.** If your
losses concentrate in

- **Section A** → recall, not reasoning. Re-read Module 32's comparison table
  and the whiteboard drill's "numbers worth memorising"; this is a week's work.
- **B1/B2** → Modules 10, 11, 12, 13. The single most common failure is
  treating the heat-transfer chain as a formula instead of a series resistance.
- **B3/C2** → Modules 20, 21, 27. The failure is almost always evaluating the
  erosive term once instead of solving the loop.
- **B4** → Modules 28–30. Usually the isothermal/adiabatic bound confusion.
- **C1** → Module 18. You cannot reduce a hot-fire dataset without the
  injector-end to nozzle-stagnation correction.
- **D** → Modules 32, 33. Sizing without the closure condition, or a Pugh
  matrix with no weights, is the signature.

---

# Section A — Rapid items (20 points)

One mark each, no partial credit except where noted.

**A1 — (b) 0.6485.**
$\Gamma(1.20) = \sqrt{1.20}\,(2/2.20)^{2.20/0.40} = 0.648531$.
*Distractors:* (a) 0.6337 is $\Gamma(1.14)$-ish, the value for a
hydrogen-rich gas — a student who memorised one number for "combustion gas"
picks it. (c) 0.6584 is $\Gamma(1.25)$, a gas-generator gas. (d) 0.6847 is
$\Gamma(1.40)$ — cold-gas nitrogen. Picking (d) means confusing combustion
products with the working fluid of Part IV.

**A2 — ≈ 2,350 m/s ideal** (accept 2,300–2,400). LOX/RP-1 ≈ 1,800 ideal /
1,730 delivered; LOX/CH₄ ≈ 1,880. Award the mark only if the student says
*ideal*; "2,350 delivered" is wrong by the $\eta_{c^*}$ they will need in B1.

**A3 — (b) 1.92.** $C_{F,vac}(\gamma{=}1.20,\varepsilon{=}60) = 1.9164$.
*Distractors:* (a) 1.80 is $\varepsilon \approx 16$; (c) 2.00 is
$\varepsilon \approx 240$; (d) 2.12 exceeds the $\gamma = 1.20$ vacuum
asymptote and is unphysical for any finite $\varepsilon$ — a student who picks
(d) does not know $C_F$ is bounded.

**A4 — 0.15 to 0.25** ($\Delta p_{inj}/p_c$). Accept "15–25 %". Below ~0.10
expect chug. Half a mark for "about 20 %" with no band.

**A5 — (c) 0.8–1.3 m.** *Distractors:* (a) is a *contraction-ratio*-like
number or an $L^*$ quoted in metres when it was inches; (b) is hydrolox
under-sized; (d) is a monopropellant catalyst bed's residence requirement
misapplied.

**A6 — 100–160 MW/m²** at the throat at full power level. Accept "of order
10² MW/m²". "10 MW/m²" is the F-1 class, not the RS-25, and scores zero.

**A7 — (b).** Eq. 3.4 of Module 13: $f_{gg} \propto K p_c/(\bar\rho\,\eta\,
c_pT_t[1-\pi_t^{-\kappa}])$. The dumped fraction grows in direct proportion
to $p_c$, and the $I_{sp}$ penalty is roughly $0.7f_{gg}$. *Distractors:*
(a) is a real constraint but it caps $T_t$, not $p_c$; (c) is a pump design
constraint that scales with head, not with the cycle's ceiling; (d) is a
chamber/injector matter unrelated to the cycle.

**A8 — 900–1,200 K.** Accept 850–1,250 K. Below it the flow required becomes
prohibitive; above it the uncooled blade alloy and free oxygen in a
oxidiser-rich GG become the limit.

**A9 — (b).** Head breakdown with broadband noise and inlet-vane cavitation
damage. *Distractors:* (a) is backwards — cavitation *destroys* head;
(c) confuses cavitation with a seal failure mode; (d) is what happens to a
turbine if the pump *stalls*, one causal step further downstream.

**A10 — RP-1 ≈ 700 K coolant-side wall** (sources spread 600–800 K; RP-2 buys
50–100 K more). **Methane ≈ 1,000–1,100 K**, limited by pyrolysis rather than
coking. Half a mark for one of the two.

**A11 — (b) 0.2–0.5**; large boosters cluster at 0.25–0.40. *Distractors:*
(a) is a plateau/mesa double-base propellant; (c)–(d) would make the
equilibrium marginal or unstable — at $n \to 1$ the equilibrium in
$p_c = (a\rho_pc^*K_n)^{1/(1-n)}$ ceases to exist.

**A12 — $\pi_K = \sigma_p/(1-n)$**, the fractional change in equilibrium
chamber pressure per kelvin of grain conditioning temperature at constant
$K_n$. Value $= 0.0021/0.65 = 3.231\times10^{-3}\ \mathrm{K^{-1}}$, i.e.
**0.323 %/K**. Half a mark for the definition without the number.

**A13 — (b).** Erosive burning is an aft-end, early-time phenomenon; it decays
as the port opens and $G$ falls below threshold. *Distractors:* (a) is a
debond or an exposed-surface anomaly (Part III exam D2); (c) is throat
erosion; (d) is a sliver.

**A14 — $J < 1.5$** almost guarantees a visible hump; $J > 2$ is comfortable.
Accept either statement; accept the equivalent port-Mach form ($M_{port}
\gtrsim 0.2$–0.3).

**A15 — (b) 65–73 s.** Ideal frozen at $\varepsilon = 50$, 300 K is ≈ 77 s;
realisation is ~0.90. *Distractors:* (a) is a badly under-expanded or
low-$\varepsilon$ micro-thruster; (c) is a monopropellant hydrazine thruster —
this is the most common confusion in the whole of Part IV; (d) is a
bipropellant.

**A16 — 0.90.** Isothermal: $\phi = 1 - p_f/p_i = 1 - 0.1$. (Adiabatic would
be $1-(p_f/p_i)^{1/\gamma} = 0.807$; that answer scores zero here because the
question said isothermal.)

**A17 — (a) 0.378.** In molecular flow the throughput scales as
$1/\sqrt{M}$, so going *from* helium *to* the heavier nitrogen the rate falls
by $\sqrt{M_{He}/M_{N_2}} = \sqrt{4.003/28.014} = 0.3780$. *Distractors:*
(b) 2.645 is the reciprocal — the factor you use going from a nitrogen
requirement to the helium rate you must *measure*, and it is the single most
common sign error in leak-budget work; (c) is the viscous-regime intuition
applied to the wrong power; (d) is the *viscous* regime's rough behaviour, not
molecular.

**A18 — Aerojet Rocketdyne RL10B-2, 465.5 s vacuum.** The highest $I_{sp}$ of
any flown chemical rocket engine. Do **not** accept the RD-0146's 470 s or the
J-2S's 436 s: both are test-stand or paper figures for engines that never flew.
Half a mark for naming the engine without the number.

**A19 — Rocketdyne F-1.** Every clue is uniquely F-1: GG exhaust as a nozzle
film curtain, 178 brazed tubes, 13 baffle compartments, 5,488 rpm on a single
direct-drive shaft. A student answering "H-1" has the family right and the
scale wrong — no mark, but note it: the H-1 is geared and has no baffled
13-compartment face.

**A20 — (b) [E].** Bartz is an empirical correlation fitted to data, valid
inside a stated range and known to err by ±20–30 % at the throat and by a
factor of two against a film-cooled or soot-coated wall. It is not derivable
from conservation laws, which is what [F] would claim.

**Section A rubric.** 1 mark each, 20 total. No partial credit on
multiple-choice. Half marks are available only on A10, A12 and A18 as noted.
A student scoring below 12 here is below Level 2 on recall regardless of what
the rest of the paper says.
