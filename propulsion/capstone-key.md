# Capstone — reference solutions, matrices and rubric

Key to [`capstone.md`](capstone.md). Read nothing here until your report is
written and dated.

---

## How to use this key

**The recommendations below are not "the answers".** Each mission has at least
two defensible outcomes and the rubric in `capstone.md` says explicitly that
the recommendation is not graded. What is in here is:

1. **The sizing chain**, with numbers, so you can check your arithmetic against
   a chain that closes. Every step is registered in
   [`tools/examples/capstone.py`](tools/examples/capstone.py) and is verified
   by `python3 tools/check_examples.py`. If your number differs by more than a
   few percent, find out why before you decide the key is wrong — but the key
   *can* be wrong, and a report that shows where and why scores above one that
   agrees.
2. **The recommendation this chain supports and the strongest alternative**,
   with the argument for each.
3. **A Pugh matrix**, its weights, and the sensitivity result including the
   weight that flips it. If your matrix has different weights and reaches a
   different winner, that is not a failure; if your matrix has different
   weights and you never checked what flips it, that is.
4. **The risk list.**
5. **What distinguishes an A from a C** on this mission specifically.
6. **The ten errors students actually make**, in the order they cost marks.

A note on the arithmetic. Everything below uses the chamber-state tables in
`capstone.md`, which are labelled [A]: representative equilibrium values, not
CEA transcripts. Delivered performance therefore carries a real uncertainty of
roughly ±1.5 % on $c^*$ and ±2 s on $I_{sp}$ before any hardware exists. The
*rankings* are robust to that; several of the *absolute* numbers are not, and
the key says so where it matters.

---
---

# Mission A — reference solution

## A.1 The sizing chain

### A.1.1 Thrust, and where the engine count comes from

This is the first number in the report and most students guess it.

GLOW ceiling (A1.3) $m_0 = 460{,}000$ kg. Weight at lift-off

$$W_0 = 460{,}000 \times 9.80665 = 4{,}511.1\ \mathrm{kN}$$

A1.4 requires $T/W \ge 1.25$, so

$$F_{SL,\text{total}} \ge 1.25 \times 4511.1 = 5{,}638.8\ \mathrm{kN}$$

A1.5 requires $T/W \ge 1.05$ with one engine out at T+0. With $N$ identical
engines sized so that $N F = F_{SL,\text{total}}$,

$$\frac{N-1}{N} \ge \frac{1.05}{1.25} = 0.84 \quad\Longrightarrow\quad N \ge \frac{1}{0.16} = 6.25$$

**$N \ge 7$.** The engine-out requirement, not the thrust requirement, sets the
engine count, and it does so through a ratio that does not depend on the
vehicle mass at all. A student who writes "nine engines, like Falcon 9" and
stops has skipped the only part of this step that is engineering.

Take $N = 7$ and round the engine up to $F_{SL} = 850$ kN:

| case | thrust (kN) | T/W at 460 t |
|---|---|---|
| all seven | 5,950 | **1.319** |
| one out at T+0 | 5,100 | **1.131** |

Both requirements met with margin; the margin on A1.4 is what pays for GLOW
growth, which is the direction GLOW always moves.

### A.1.2 Chamber state and $c^*$

$R = R_u/\mathcal{M}$; ideal $c^* = \sqrt{R T_0}/\Gamma(\gamma)$ (Eq. 3.1,
module 03); delivered $c^* = \eta_{c^*} c^*_{ideal}$.

| | $\mathcal{M}$ | $T_0$ (K) | $\gamma$ | $R$ (J/kg·K) | $c^*_{ideal}$ (m/s) | $\eta_{c^*}$ | $c^*$ (m/s) |
|---|---|---|---|---|---|---|---|
| A1 LOX/RP-1 GG, 100 bar | 23.0 | 3600 | 1.20 | 361.50 | 1759.0 | 0.960 | 1688.7 |
| A2 LOX/CH₄ GG, 100 bar | 21.3 | 3550 | 1.20 | 390.35 | 1815.1 | 0.960 | 1742.5 |
| A3 LOX/CH₄ ORSC, 180 bar | 21.6 | 3600 | 1.19 | 384.93 | 1820.6 | 0.975 | 1775.1 |
| A4 LOX/CH₄ FFSC, 280 bar | 21.9 | 3640 | 1.19 | 379.66 | 1818.1 | 0.980 | 1781.8 |
| A5 LOX/CH₄ e-pump, 60 bar | 21.1 | 3520 | 1.20 | 394.05 | 1816.0 | 0.955 | 1734.3 |

The $\sqrt{T_0/\mathcal{M}}$ check, A1 against A2: $T_0$ falls 1.4 % and
$\mathcal{M}$ falls 7.4 %, so $\sqrt{T_0/\mathcal{M}}$ rises 3.2 %, and
$c^*_{ideal}$ rises 3.2 % (1759.0 → 1815.1). Methane's entire $c^*$ advantage
over kerosene is molar mass, not flame temperature — the flame is *cooler*.
Say that in the report; it is the sentence that shows you read module 04.

Note also that $\eta_{c^*}$ is not a constant of nature: the staged-combustion
candidates get 0.975–0.98 because the preburner delivers partly reacted,
well-mixed gas to the main injector, and the electric-pump candidate gets
0.955 because at 60 bar the injector $\Delta p$ that buys mixing is a smaller
absolute number. **Using one $\eta_{c^*}$ for all five candidates is a
defensible simplification only if you say so and note which way it biases the
answer** (it flatters the low-pressure candidates).

### A.1.3 Nozzle: $\varepsilon$, and the separation check

Design rule used here: size $\varepsilon$ for a sea-level exit pressure of
0.55–0.70 bar, i.e. slightly overexpanded at lift-off, which is standard
first-stage practice because the stage spends most of its burn well above sea
level [J]. `optimum_eps_for_pa(gamma, pc, pe)` gives:

| | $p_e$ target (bar) | $\varepsilon$ | $M_e$ | $C_{F,SL}$ | $C_{F,vac}$ |
|---|---|---|---|---|---|
| A1 | 0.60 | 17.56 | 3.669 | 1.6291 | 1.8070 |
| A2 | 0.60 | 17.56 | 3.669 | 1.6291 | 1.8070 |
| A3 | 0.65 | 26.78 | 3.913 | 1.7076 | 1.8583 |
| A4 | 0.70 | 35.78 | 4.108 | 1.7558 | 1.8852 |
| A5 | 0.55 | 12.68 | 3.444 | 1.5568 | 1.7710 |

Separation at lift-off, both criteria, for A3 as the worked case:

- **Summerfield** [E]: separation when $p_e < 0.4\,p_a = 0.405$ bar. Design
  $p_e = 0.65$ bar. Attached, with 60 % margin.
- **Schmucker** [Schmucker73]: $p_{sep}/p_a = (1.88 M_e - 1)^{-0.64}$, and at
  $M_e = 3.913$ this gives $p_{sep} = 0.310$ bar. Attached, with 110 % margin.

The two criteria disagree by a factor of 1.3, which is normal: Summerfield is a
single-number rule fitted to a narrow data set, Schmucker carries the Mach
dependence and is the better of the two for a modern high-$\varepsilon$
contour. **Quote both, say which you trust, and note that neither predicts the
*side load*, which is what actually breaks nozzles** [Ostlund02]. A report that
checks separation only at the nominal point and not at the throttled condition
has missed the case that matters: at 40 % thrust (A1.7) the chamber pressure
falls to 72 bar for A3 and $p_e$ falls to 0.26 bar, which is *below* both
criteria. Sea-level throttling to 40 % is therefore not available at lift-off
and the throttle requirement must be read as applying above the altitude where
it becomes safe — roughly 8–10 km. Saying that is worth more marks than the
whole nozzle table.

### A.1.4 Engine geometry at $F_{SL} = 850$ kN

$A_t = F/(p_c C_{F,SL}\eta_n)$ with $\eta_n = 0.98$; $\dot m = F/(c^* C_{F,SL}\eta_n)$.

| | $A_t$ (cm²) | $D_t$ (mm) | $D_e$ (mm) | $\dot m$ (kg/s) | $I_{sp,SL}$ (s) | $I_{sp,vac}$ (s) |
|---|---|---|---|---|---|---|
| A1 | 532.4 | 260.4 | 1,091 | 315.3 | 274.9 | 304.9 |
| A2 | 532.4 | 260.4 | 1,091 | 305.5 | 283.7 | 314.7 |
| A3 | 282.2 | 189.6 | 981 | 286.2 | **302.9** | **329.6** |
| A4 | 176.4 | 149.9 | 896 | 277.3 | **312.6** | **335.7** |
| A5 | 928.6 | 343.8 | 1,225 | 321.3 | 269.8 | 306.9 |

Sanity check against the database: A1 at 274.9/304.9 s sits just below the
Merlin 1D's 282/311 s, which is right — Merlin runs 97 bar with a claimed
$\varepsilon$ of 16 and a higher chamber efficiency than the 0.96 assumed here,
**and every Merlin figure in the database is a company claim**. A3 at
302.9/329.6 s sits close to the RD-180's 311/338 s at a much lower chamber
pressure and on a different propellant, which is also plausible: the RD-180 is
267 bar `noz`† kerolox at $\varepsilon$ 36.87 and is one of the best engines
ever built.

Nine engines' worth of nozzle would not fit: seven 981 mm bells on a 3.7 m
stage is already a tight cluster and is one more argument for $N = 7$.

Second-stage variants, same power head, high-$\varepsilon$ bell:

| | $\varepsilon_2$ | $I_{sp,vac}$ (s) | $D_e$ (mm) |
|---|---|---|---|
| A1 | 90 | 328.3 | 2,470 |
| A2 | 110 | 341.0 | 2,731 |
| A3 | 120 | **350.9** | 2,076 |
| A4 | 130 | 353.2 | 1,709 |
| A5 | 80 | 335.7 | 3,075 |

A quiet but important result: the **higher-pressure candidates give a smaller
upper-stage nozzle for a higher $I_{sp}$**, because $A_t$ shrinks faster than
$\varepsilon$ grows. A1's 2.47 m bell and A5's 3.08 m bell are both envelope
problems on a 3.7 m stage; A3's 2.08 m is not. This is a real A1.15 discriminator
and almost nobody finds it.

### A.1.5 Vehicle closure

Total ideal Δv 9,300 m/s (A-G1), split between stages as a free variable and
optimised; recovery reserve 1,400 m/s on the first stage at $0.97 I_{sp,vac}$
(A-G2). Stage inert masses are *derived*, not assumed: tank and structure mass
is taken as $k_s$ per kg of propellant with $k_s$ scaled by the inverse square
root of propellant bulk density (denser propellant, smaller tanks, lighter
structure), plus engines, plus a fixed allowance (1,800 kg of recovery hardware
— legs, grid fins, TPS — on the first stage). Ascent $I_{sp}$ is taken as
$0.45 I_{sp,SL} + 0.55 I_{sp,vac}$ [A].

| | bulk $\rho$ (kg/m³) | $I_{sp,eff}$ (s) | S1 dry (kg) | S2 dry (kg) | optimum Δv₂ (m/s) | recovery prop (kg) | **payload, reusable (kg)** | payload, expended (kg) |
|---|---|---|---|---|---|---|---|---|
| A1 | 1,017 | 291.4 | 21,133 | 6,614 | 5,650 | 13,668 | **9,388** | 11,480 |
| A2 | 823 | 300.7 | 22,899 | 7,392 | 5,650 | 14,193 | **10,228** | 12,511 |
| A3 | 828 | 317.6 | 25,106 | 8,295 | 5,700 | 14,636 | **11,585** | 14,095 |
| A4 | 833 | 325.3 | 26,033 | 8,422 | 5,650 | 14,821 | **12,076** | 14,701 |
| A5 | 818 | 290.2 | 31,699 | 7,587 | 6,100 | 20,057 | **7,589** | 10,002 |

**Requirement A1.1 is 10,000 kg reusable. A1 and A5 fail it. A2 passes it by
228 kg, which is 2.3 % and is not a margin.** A3 and A4 pass with 16 % and
21 %.

This is the result that decides Mission A, and it is decided on arithmetic
before any judgment is applied. Two observations that a strong report makes:

- **The kerolox candidate fails on density, not on $I_{sp}$.** A1 has the
  highest bulk density of the five (1,017 vs ~825 kg/m³) and therefore the
  lightest tanks, and it still loses, because 291.4 s of effective ascent
  $I_{sp}$ against 300.7 s for the same cycle on methane is worth more than the
  structure the density saves. The density argument for kerosene is real and it
  is not big enough here. Run it and show it; do not assert it either way.
- **The recovery reserve is what kills the low-$I_{sp}$ candidates.** A5 spends
  20.1 t of propellant coming home against A3's 14.6 t, on a stage whose dry
  mass is 6.6 t larger. Recovery propellant scales with dry mass *and* with
  $\exp(\Delta v / I_{sp} g_0)$, so a heavy low-$I_{sp}$ stage is punished twice.

### A.1.6 The A5 battery calculation, which is the one that matters

Students dismiss the electric-pump candidate with adjectives. Do it with
numbers, because at this scale the numbers are not close.

Per engine at $F_{SL} = 850$ kN, $p_c = 60$ bar, $\dot m = 321.3$ kg/s at
$r = 3.30$: $\dot m_{ox} = 246.5$ kg/s, $\dot m_f = 74.7$ kg/s. Pump discharge
must cover $p_c$ + injector drop (0.20 $p_c$ = 12 bar) + jacket (20 bar) +
lines (5 bar) = 97 bar; with a 3 bar inlet, $\Delta p = 94$ bar. At
$\eta_p = 0.70$:

$$P_{ox} = \frac{\dot m \Delta p}{\rho \eta} = \frac{246.5 \times 94\times10^5}{1141 \times 0.70} = 2.902\ \mathrm{MW}$$
$$P_{fuel} = \frac{74.7 \times 94\times10^5}{423 \times 0.70} = 2.372\ \mathrm{MW}$$

Hydraulic total 5.274 MW; through a motor at 0.95 and an inverter at 0.96,
**5.78 MW of electrical power per engine**. Seven engines for a 165 s ascent
burn:

$$E = 7 \times 5.78\ \mathrm{MW} \times 165\ \mathrm{s} = 6.68\ \mathrm{GJ} = 1{,}855\ \mathrm{kWh}$$

At **180 Wh/kg usable** — which is optimistic for a cell that must deliver a
40 MW pulse and survive it, i.e. a power cell, not an energy cell —

$$m_{battery} = \frac{1{,}855\ \mathrm{kWh}}{180\ \mathrm{Wh/kg}} = 10{,}300\ \mathrm{kg}$$

Ten tonnes of battery on a stage whose entire structural mass is about 20 t,
plus more for the entry and landing burns, plus the fact that on Rutherford the
batteries are *ejected* mid-flight — which a recoverable booster cannot do
without also recovering them or throwing away ten tonnes of battery per flight.
At 250 Wh/kg it is still 7,420 kg. **The candidate does not close, and the
reason is that pump power scales with thrust while battery specific energy does
not scale with anything.** Rutherford is a 24 kN engine; this is 850 kN. That
factor of 35 is the whole answer, and one paragraph of arithmetic is worth more
than three pages of prose about complexity.

*(Marking note: a report that eliminates A5 with this calculation and then
spends only half a page on it is doing exactly the right thing. A report that
eliminates A5 without the calculation loses the marks for D2 and D10 on that
candidate and gets the −10 automatic deduction for a candidate without sizing.)*

### A.1.7 Heat transfer — the deliverable that separates the grades

Bartz [Bartz57] at the throat, $\sigma$ from `bartz_sigma` at $M = 1$ and
$T_w/T_0 = 800/T_0$; $r_c = 1.5 R_t$; chamber transport properties from A-G3;
$T_{wg} = 800$ K assumed for a copper-alloy liner; 0.8 mm hot wall of
GRCop-42-class alloy, $k = 300$ W/(m·K) [GRCop].

| | $D_t$ (mm) | $h_g$ (W/m²K) | $T_{aw}$ (K) | $q_t$ (MW/m²) | $\Delta T_{wall}$ (K) | $T_{wc}$ (K) | $\sigma_{th}$ (MPa) |
|---|---|---|---|---|---|---|---|
| A1 | 260.4 | 28,288 | 3,567 | 78.3 | 209 | 591 | 323 |
| A2 | 260.4 | 27,535 | 3,518 | 74.8 | 200 | 600 | 308 |
| A3 | 189.6 | 46,982 | 3,569 | **130.1** | 347 | 453 | **536** |
| A4 | 149.9 | 70,301 | 3,608 | **197.4** | 526 | **274** | **814** |
| A5 | 343.8 | 17,282 | 3,488 | 46.5 | 124 | 676 | 191 |

Four things must be said about this table, and a C-grade report says none of
them.

**(a) The A4 row is physically impossible as posed.** A coolant-side wall
temperature of 274 K with methane entering the jacket at about 120 K and
leaving 190 K hotter is not a solution, it is a signal that the assumed
0.8 mm wall cannot be used at 280 bar. Reduce the hot wall to 0.5 mm:
$\Delta T = 197.4\times10^6 \times 0.5\times10^{-3}/300 = 329$ K, so
$T_{wc} = 471$ K, which is a design. **But a 0.5 mm copper-alloy wall in a
141 mm-throat chamber that must survive 25 flights is a manufacturing and
inspection problem of a different order** — you cannot borescope a channel
land you cannot see, and wall thinning by oxidation and by cleaning is now a
first-order life item. That single consequence is most of the argument against
A4 on this mission and it comes out of a two-line calculation.

**(b) Every candidate exceeds its material allowable in thermal stress.**
Constrained-wall thermal stress $\sigma = E\alpha\Delta T/(2(1-\nu))$ with
$E = 120$ GPa, $\alpha = 17\times10^{-6}$ /K, $\nu = 0.34$ gives 191–814 MPa
against a GRCop-class yield of roughly 130 MPa at 800 K. **This is not an
error. It is the normal state of a regeneratively cooled chamber and it is why
liner life is measured in cycles, not hours.** The hot wall yields in
compression on every start, ratchets, thins, and eventually forms the classic
"doghouse" — the throat channel land bulging into the chamber and splitting
[module 10, module 11]. The design question is not "does it yield" but "how
many cycles before the accumulated strain opens it", and the answer scales
steeply with $\Delta T_{wall}$. A3 at 347 K and A4 at 329 K (thinned wall) are
in a different life regime from A2 at 200 K, and **A1.10's 25-flight retirement
life is the requirement this table is really about.**

**(c) The heat *load* barely changes while the *flux* triples.** $Q$ is 50.0,
47.8, 44.1, 41.8 and 51.8 MW for A1–A5. The coolant has no trouble absorbing
it in any candidate (bulk rise 191–253 K on the full fuel flow with methane at
$c_p \approx 3600$ J/kg·K). **The problem at high $p_c$ is never the total heat;
it is the local flux and the wall gradient.** Students who compute $Q$, find
the bulk rise acceptable and declare the cooling closed have answered the easy
half of the question.

**(d) Bartz is ±20–30 % [Bartz57], and that band is larger than the difference
between two of these candidates.** Say so. The correct use of Bartz here is to
rank and to size a jacket, not to certify a wall. What resolves it is a
heat-sink or calorimetric subscale chamber, and it belongs in the D8 test
pyramid before the first full-scale hot fire.

### A.1.8 Feed system, A3 as the worked candidate

Pressure budget for the ORSC candidate, per engine, $\dot m = 286.2$ kg/s at
$r = 3.5$ ($\dot m_{ox} = 222.6$, $\dot m_f = 63.6$ kg/s):

| item | ox side | fuel side |
|---|---|---|
| chamber $p_c$ | 180 bar | 180 bar |
| injector $\Delta p$ (0.20 $p_c$) | — (enters as preburner gas) | 36 bar |
| preburner + turbine + hot-gas manifold | ~140 bar | — |
| regen jacket | — | 55 bar |
| lines, valves, margin | 4 bar | 14 bar |
| **pump discharge** | **324 bar** | **289 bar** |
| inlet | 4 bar | 4 bar |
| **pump $\Delta p$** | **320 bar** | **285 bar** |

At $\eta_p = 0.72$:

$$P_{ox} = \frac{222.6 \times 320\times10^5}{1141\times0.72} = 8.669\ \mathrm{MW}, \qquad
P_{fuel} = \frac{63.6 \times 285\times10^5}{423\times0.72} = 5.951\ \mathrm{MW}$$

Total hydraulic 14.62 MW; at $\eta_m = 0.98$ the turbine must deliver
**14.92 MW** per engine, 104 MW for the stage. For scale, the RD-170's
turbopump is roughly 170–190 MW for four chambers, so 15 MW for one 850 kN
chamber is the right order.

NPSH available at 3.5 bar tank pressure, saturated propellant, 0.3 bar (ox) and
0.2 bar (fuel) line loss:

$$\mathrm{NPSH}_{ox} = \frac{(3.5 - 1.013 - 0.3)\times10^5}{1141\times9.80665} = 19.6\ \mathrm{m}, \qquad
\mathrm{NPSH}_{fuel} = 55.1\ \mathrm{m}$$

Suction specific speed on the ox side at 22,000 rpm and
$Q = 222.6/1141 = 0.195$ m³/s: $N_{ss} = \omega\sqrt{Q}/(g_0\,\mathrm{NPSH})^{0.75} = 19.8$
(SI, dimensionless form). That is deep into inducer territory — a bare
centrifugal impeller lives near 3–5 — so **the ox pump needs an inducer, and if
the analysis holds it needs a good one.** The alternatives are a higher tank
pressure (which costs tank mass and pressurant on every flight) or subcooled
LOX (which costs a ground system and buys density as well). Say which you
choose and price it; this is a real vehicle-level trade that hides inside a
pump number.

Chamber sizing, A3: $L^* = 0.9$ m [E, typical for methalox with a coaxial swirl
injector] gives $V_c = L^* A_t = 25.4$ L, and with chamber gas density
$\rho_c = p_c/(RT_0) = 12.99$ kg/m³ the stay time is
$t_s = V_c\rho_c/\dot m = 1.15$ ms — at the short end of the 0.8–3 ms band and
consistent with a high-$p_c$ engine. Injector: 36 bar drop gives an ox-side
orifice velocity of $v = C_d\sqrt{2\Delta p/\rho} = 59.6$ m/s at $C_d = 0.75$.

## A.2 Recommended architecture and the strongest alternative

### Recommended: **A3 — LOX/CH₄, oxidizer-rich staged combustion, $p_c = 180$ bar, seven engines of 850 kN**

The case, in the order the numbers make it:

1. **It closes the mission with margin.** 11,585 kg reusable against a 10,000 kg
   requirement, and it keeps that margin until the recovery budget grows past
   about 1,930 m/s. A2 loses its margin at 1,540 m/s. The recovery budget is the
   number on this vehicle most likely to grow, because it depends on entry
   heating and landing accuracy, both of which are learned in flight.
2. **The chamber pressure is chosen, not maximised.** 180 bar sits where the
   throat flux (130 MW/m²) and the wall gradient (347 K) are demanding but
   conventional, on a wall thick enough (0.8 mm) to inspect and to lose
   material to over 25 flights. Blue Origin says publicly that the BE-4's
   relatively low 140 bar `n.s.` is a life-and-reusability choice rather than a
   limitation [database, BE-4 entry]; this is the same argument one step up.
3. **Methane, not kerosene, because of the coolant.** RP-1 coking in the
   channels is a reuse problem you cannot inspect your way out of; methane does
   not coke, which is why it is the coolant in every new reusable hydrocarbon
   engine. This is worth more on this mission than kerosene's density, and the
   closure table shows by how much.
4. **The second stage falls out for free**: same power head, $\varepsilon$ 120,
   350.9 s vacuum, 2.08 m bell that fits the stage. A1.15 satisfied without a
   second development programme.

**What it costs, and the memo must say so:**

- **Schedule.** ORSC is the highest-risk item in the 48-month clock (A1.14).
  The oxidizer-rich hot-gas path needs a coating qualification and a
  materials-compatibility campaign that A2 does not need at all. This is the
  criterion on which A3 loses hardest.
- **Non-recurring cost.** Preburner, hot-gas manifold, coated turbine — roughly
  1.8× A2's NRI on the estimate below.
- **Engine T/W.** ~87:1 at 1,000 kg estimated dry mass, against A2's ~144:1.
  Meets A1.12's 70:1 but is not the leader.
- **Ignition and start sequence complexity.** An ORSC start is a sequenced,
  choreographed event with a real ox-rich overtemperature failure mode; a GG
  start is not.

### Strongest alternative: **A2 — LOX/CH₄ gas generator, $p_c = 100$ bar**

It is the strongest alternative and not by a small margin. It wins outright on
schedule, on NRI, on part count, on start-sequence simplicity, on engine T/W,
and on the throat-flux/life table (200 K wall gradient against 347 K, which is
the single best predictor of liner life in the whole study). Its
whole weakness is one number: **10,228 kg against a 10,000 kg requirement.**

That is a 2.3 % margin on the mission's primary requirement at the
*architecture-selection* stage, before a single kilogram of real hardware has
been weighed. Under the G4 margin policy the vehicle would need 15 % system
margin against its mass ceiling and it does not have it. Two specific triggers,
both computed:

- If delivered $\eta_{c^*}$ comes in at **0.9575 or below** — a 0.3 % shortfall,
  well inside normal development scatter — A2 no longer meets A1.1.
- If the recovery Δv budget grows past **1,540 m/s**, A2 no longer meets A1.1.

A programme that selects A2 is betting the payload requirement on both of those
going its way. That is a defensible bet — it is roughly the bet SpaceX made and
won with a gas-generator engine — but it must be made explicitly, with the
GLOW growth path (A1.3 is a ceiling, not a law of physics) identified as the
escape route. **A report that recommends A2, states these two triggers, and
names the GLOW increase or the payload-requirement renegotiation that recovers
the margin, scores as highly as one that recommends A3.**

A4 (FFSC) is the performance winner and the schedule loser: it needs a 0.5 mm
liner wall, two preburners, an ox-rich *and* a fuel-rich hot-gas system, and it
buys 491 kg of payload over A3 — 4 % — for what is plainly more than 4 % of the
development. On a company that can afford one engine programme, that trade does
not close. On a company building a Mars architecture, it might.

## A.3 Pugh matrix

Datum: **A2**, the methalox gas generator — a real candidate, as required, and
the one closest to conventional practice. Scoring −2 to +2. Weights written
and justified before scoring.

| criterion | weight | justification (tied to this mission) |
|---|---|---|
| Performance (payload delivered) | 18 | A1.1 is the primary requirement and two candidates fail it. |
| Reusability / cyclic life | 16 | A1.9–A1.11 are the business case; an engine that needs an overhaul at flight 5 destroys the economics regardless of its $I_{sp}$. |
| Schedule confidence to first flight | 15 | A1.14 is 48 months and the company has funding for one attempt. |
| Cost — reuse-adjusted recurring + non-recurring | 14 | Eight flights/yr rising to twenty; NRI is amortised over few units, so it behaves like recurring cost here. |
| Reliability | 12 | Engine-out (A1.5, A1.6) buys tolerance to *one* failure; it does not buy tolerance to a failure mode common to all seven. |
| Manufacturability and rate | 9 | A1.13's 160 engine-equivalents/yr through acceptance is a throughput constraint before it is a cost one. |
| Complexity | 6 | Partly captured by reliability and cost; kept separate because part count drives turnaround labour independently. |
| Mass (engine + stage dry) | 5 | Real but largely already priced inside Performance. |
| Mission fit / second-stage derivability | 5 | A1.15; a poor upper-stage derivative costs a second programme. |
| **total** | **100** | |

| criterion | w | A1 kerolox GG | **A2 datum** | **A3 ORSC** | A4 FFSC | A5 e-pump |
|---|---|---|---|---|---|---|
| Performance | 18 | −2 *(9,388 kg, fails A1.1)* | 0 *(10,228)* | **+1** *(11,585, 16 % margin)* | +2 *(12,076)* | −2 *(7,589, fails)* |
| Reusability / life | 16 | −1 *(RP-1 coking in channels, uninspectable)* | 0 *(200 K wall gradient)* | **−1** *(347 K gradient, 536 MPa)* | −2 *(0.5 mm wall, 526 K raw gradient)* | +1 *(46 MW/m², 124 K; battery is the life item)* |
| Schedule confidence | 15 | +1 *(most mature cycle + propellant)* | 0 | **−1** *(ox-rich coating qual is the long pole)* | −2 *(two preburners, two hot-gas systems)* | −1 *(40 MW pulse battery has no precedent at scale)* |
| Cost (reuse-adjusted) | 14 | 0 *(cheap to build, poor $I_{sp}$ per flight)* | 0 | **−1** *(NRI ≈ 1.8× datum)* | −2 *(NRI ≈ 3× datum)* | +1 *(low UCI, but battery is a per-flight consumable)* |
| Reliability | 12 | +1 *(fewest hot-gas joints)* | 0 | **−1** *(ox-rich manifold is a new failure class)* | −1 *(more of everything, but no dumped flow)* | +1 *(no rotating hot machinery)* |
| Manufacturability / rate | 9 | +1 | 0 | **−1** *(coated parts, sole-source process)* | −2 *(0.5 mm liner at rate)* | 0 |
| Complexity | 6 | +1 | 0 | **−1** | −2 | +2 *(no turbine, no preburner)* |
| Mass | 5 | +1 *(densest, lightest tanks)* | 0 | **−1** *(heavier engine)* | −1 | −2 *(10.3 t battery)* |
| Mission fit / S2 derivative | 5 | −1 *(2.47 m bell, 328 s)* | 0 *(2.73 m bell)* | **+2** *(2.08 m bell, 350.9 s)* | +2 | −2 *(3.08 m bell, does not fit)* |
| **weighted total** | | **−22** | **0** | **−9** | **−31** | **−13** |

**On the raw matrix, A2 wins.** That is the honest result of these weights and
it must be reported as such.

### A.3.1 The sensitivity, and the flip

Vary each weight by ±50 % of its own value, redistributing proportionally
across the others.

| weight varied | value at which the winner changes | new winner |
|---|---|---|
| Performance | **> 27** (from 18, i.e. +50 %) | A3 |
| Reusability / life | never in ±50 % | — |
| Schedule confidence | **< 8** | A3 |
| Cost | < 7 | A3 (marginally) |
| all others | never | — |

**The decision turns on one thing: how much you believe the payload
requirement.** At the given weights A2 wins by 9 points; raising Performance
from 18 to 27 flips it to A3. Nine weight-points is not a large move for a
criterion that is the mission's primary requirement and that two candidates
outright fail.

**The two-criterion perturbation** (Performance 18 → 24 with Schedule 15 → 11,
the trade a programme makes when the customer's payload manifest firms up
before the launch date does) flips to A3 decisively, −4 against A2's 0.

**The input perturbation, and this is the one that matters.** Move delivered
$\eta_{c^*}$ from 0.960 to 0.955 — a 0.5 % shortfall, smaller than the scatter
between two development engines of the same design. A2's payload falls to
**9,941 kg and it fails A1.1 outright**, which is not a score change but a
compliance change: it removes A2 from the matrix. A3 at the same shortfall
delivers 11,270 kg and still complies.

**This is the finding the memo leads with.** The raw matrix prefers A2. The
matrix is scored on a payload number with 2.3 % of margin, and a compliance
analysis with 2.3 % of margin at architecture selection is not an analysis, it
is a hope. Recommend A3, and state that the recommendation would reverse if
either (a) the customer accepts 9,500 kg, or (b) the GLOW ceiling A1.3 moves to
490 t, which restores A2's margin at a vehicle cost the company may well prefer
to an engine cost.

**A report that recommends A2 on the raw matrix, and identifies the same
$\eta_{c^*}$ trigger, is equally correct and scores the same.** A report that
recommends A3 *without* noticing that the raw matrix prefers A2 has scored its
matrix to match its conclusion, and the rubric's −10 for "wins on every
criterion" is joined by the loss of the sensitivity marks.

## A.4 Risk register (10; eight is the minimum)

| # | risk (if–then) | L | C | score | mitigation | retires at |
|---|---|---|---|---|---|---|
| A-R1 | **If** the ox-rich hot-gas surface coating cannot be qualified to 25 flights, **then** engine retirement life drops to the coating's demonstrated life and A1.10 fails. | 3 | 5 | 15 | Coating coupon programme in month 1, before the preburner design is frozen; parallel-path a second coating supplier; a subscale ox-rich hot-gas rig by month 9. | Subscale ox-rich rig completes 25 thermal cycles — month 14. |
| A-R2 | **If** the throat liner shows doghouse initiation before 10 flights, **then** A1.9 fails and the turnaround economics collapse. | 4 | 4 | 16 | Calorimetric subscale chamber before full-scale design freeze; instrument throat channel lands; plan a wall-thickness increase and the $I_{sp}$ it costs as a held option. | 10 cycles on a full-scale chamber at rated $p_c$ — month 30. |
| A-R3 | **If** delivered $\eta_{c^*}$ is below 0.965, **then** payload margin falls below 10 % and the GLOW ceiling must move. | 3 | 4 | 12 | Injector element characterisation on a single-element rig by month 6; hold a mixture-ratio and $\varepsilon$ trim as recovery. | First full-scale hot fire — month 24. |
| A-R4 | **If** the ox pump inducer cannot hold $N_{ss} \approx 20$ without cavitation-induced instability, **then** tank pressure must rise, costing stage dry mass on every flight. | 3 | 3 | 9 | Water-flow inducer rig by month 8; subcooled-LOX ground system as the alternative, priced now. | Inducer rig completes suction-performance map — month 12. |
| A-R5 | **If** engine-out at T+25 s produces a thrust asymmetry the TVC cannot trim, **then** A1.6 fails and the engine-out claim is marketing. | 2 | 5 | 10 | Gimbal-authority analysis with the actual 7-engine layout in month 2; ground-test a commanded shutdown of an outboard engine. | Stage static fire with a commanded engine-out — month 40. |
| A-R6 | **If** the acceptance stand cannot absorb 160 engine-equivalents per year, **then** flight rate is limited by test throughput, not by manufacturing. | 4 | 3 | 12 | Two-cell stand from the start; define a reduced-duration post-flight acceptance profile and qualify it. | Stand commissioning + throughput demonstration — month 34. |
| A-R7 | *(non-technical)* **If** the sole qualified supplier of the coating process loses the line, **then** engine production stops with no alternative. | 2 | 5 | 10 | Second-source qualification funded from month 6 whether or not it is needed; in-house process licence negotiated at contract signature. | Second source passes coupon qual — month 20. |
| A-R8 | *(non-technical)* **If** LNG-grade methane supply at the launch site cannot meet the purity specification at 20 flights/yr, **then** flight rate is limited by propellant logistics. | 2 | 3 | 6 | Purity specification written against two suppliers in month 3; on-site storage sized for four flights. | Supply contract with spec — month 12. |
| A-R9 | *(created by the recommendation)* **If** the ORSC start sequence has an ox-rich overtemperature excursion at any throttle setting, **then** the failure destroys the engine and probably the stage — a failure mode A2 does not have at all. | 2 | 5 | 10 | Start-sequence model validated on the subscale rig; a preburner-only start test series; hard temperature-limit abort in the engine controller. | 50 starts across the throttle envelope — month 36. |
| A-R10 | **If** sea-level throttling below ~55 % causes nozzle flow separation and side loads at low altitude, **then** A1.7 cannot be met where the landing burn needs it. | 3 | 4 | 12 | Compute separation with Schmucker across the throttle range at every altitude in the trajectory; if needed, restrict deep throttle to above 8 km and re-plan the landing burn. | Sub-scale altitude-simulating nozzle test — month 26. |

Two of these (A-R7, A-R8) are non-technical as required, and A-R9 is a risk
*created by* the recommendation — the requirement in `capstone.md` §D5 that
students most often skip.

## A.5 What distinguishes an A from a C on Mission A

**A C-grade report** sizes the recommended engine correctly, gets $c^*$,
$C_F$ and $I_{sp}$ right, assumes an engine count, computes $Q$ through the
jacket and declares the cooling closed, builds a mass budget with a flat 20 %,
scores a matrix in which the winner wins everywhere, and recommends the
architecture it liked on page one. Everything in it is true and nothing in it
is decisive. It typically lands at 58–68.

**A B-grade report** derives the engine count from A1.4 and A1.5, sizes all
five candidates, finds that A1 and A5 fail the payload requirement, computes
throat flux with Bartz, and builds a matrix with justified weights and one
sensitivity axis. It usually still stops at $Q$ in the heat-transfer section and
still treats the payload margin as a score rather than as a compliance
statement. 72–84.

**An A-grade report** does four things a B does not:

1. **It treats the 2.3 % payload margin on A2 as the central finding**, not as
   a row in a table — because that number, not the matrix, is what makes the
   decision.
2. **It carries the heat-transfer chain past the flux to its consequence**: the
   wall gradient, the thermal stress against the allowable *at temperature*, the
   admission that the wall yields on every start, and the statement that this
   is what A1.9 and A1.10 are really about. It notices that A4's 0.8 mm wall
   gives an impossible $T_{wc}$ and derives the 0.5 mm wall that follows, and
   then says what a 0.5 mm wall does to inspection and to reuse.
3. **It reports the matrix result honestly even when the matrix disagrees with
   the recommendation**, and uses the input perturbation — not a weight — to
   justify overriding it.
4. **It finds at least one thing nobody asked for.** The high-pressure
   candidates giving a *smaller* upper-stage nozzle is the one hiding in
   Mission A; so is the observation that recovery propellant punishes a heavy
   low-$I_{sp}$ stage twice. 88–96.

Nobody scores 100. A report that reads as though every number were certain has
misrepresented a study built on a chamber-state table labelled [A] and a
correlation with a ±25 % band.

## A.6 The ten most common errors on Mission A

1. **Assuming the engine count.** Nine, because Falcon 9. A1.4 and A1.5
   together give $N \ge 6.25$ and the derivation takes three lines. Costs the
   marks for the first paragraph of the report and sets the tone for the rest.
2. **Stopping the heat-transfer analysis at the heat load.** $Q$ is 42–52 MW
   for all five candidates and the coolant absorbs it in all five. The
   difference between them is the *flux* and the *gradient*, and a report that
   never computes $\Delta T_{wall}$ has not addressed the reuse requirement at
   all. This is the single largest mark loss on this mission.
3. **Reporting a thermal stress above yield and not saying anything.** The
   automatic −8 exists for this. It is the difference between a calculation and
   an analysis.
4. **Dismissing the electric-pump candidate with adjectives.** The battery
   calculation is eight lines and it is decisive. Skipping it costs the D2 and
   D10 marks for A5 *and* the −10 for a candidate without sizing.
5. **Sizing the vehicle on basic rather than margined mass.** Automatic −8. The
   symptom is a payload number quoted to four significant figures with no
   margin statement anywhere near it.
6. **Forgetting that the recovery propellant is carried through ascent.** It is
   14.6 t on the recommended candidate — larger than the payload. Reports that
   apply the recovery Δv to the landed stage only, or that omit it from the
   ascent mass, over-predict payload by 15–20 %.
7. **Quoting Merlin, Raptor or BE-4 figures without the caveat.** The database
   flags every one of them; Raptor's entire performance block traces to company
   statements including social-media posts. Automatic −5 each time.
8. **Checking nozzle separation only at the design point.** At 40 % thrust the
   sea-level exit pressure of every candidate here is below both separation
   criteria. A1.7 and A1.5 interact through the nozzle and almost nobody notices.
9. **A matrix whose winner wins everywhere.** Automatic −10, and it is the
   error the trade-study file warns about in its opening paragraphs. If A3
   scores positive on schedule, cost, complexity *and* reliability, the report
   has stopped being an analysis.
10. **Ignoring A1.15.** The second-stage derivative is a stated requirement and
    it is where the high-$p_c$ candidates quietly win. A report that mentions it
    in one sentence at the end has left marks on the table and, more
    importantly, has missed a genuine argument for its own recommendation.

---
---

# Mission B — reference solution

## B.1 The sizing chain

### B.1.1 The Δv budget and the mass chain

Total Δv from the requirements: 100 (TCM/trim) + 1,050 (MOI) + 90 (deorbit) +
620 (descent, hazard avoidance, divert) = **1,860 m/s**, plus the 5 %
performance reserve of B1.6 applied to the propellant, not to the Δv.

The chain has **three legs and one jettison**, and getting the jettison on the
wrong side of a leg is the most expensive arithmetic error available in this
mission:

```
                                     arrival wet mass
   leg 1  TCM + MOI + trim   1,150 m/s   (aeroshell attached)
                                     ↓
   leg 2  deorbit               90 m/s   (aeroshell attached)
                                     ↓
          JETTISON aeroshell + backshell  −550 kg   (B1.17)
                                     ↓
   leg 3  powered descent      620 m/s   (aeroshell gone)
                                     ↓
                             1,200 kg landed (B1.1)
```

Work backwards from 1,200 kg with
`propellant_for_dv(Isp, m_final, dv)` on each leg. The 550 kg of aeroshell is
carried by legs 1 and 2 and not by leg 3, so it is *added* to the leg-3 start
mass before leg 2 is sized. Students who subtract it at the wrong point, or who
apply the 620 m/s to a stack that still includes it, are typically 60–90 kg out.

### B.1.2 Delivered performance of the candidates

MON-3/MMH at $r = 1.65$, $p_c = 10$ bar: $\mathcal{M} = 21.2$, $T_0 = 3120$ K,
$\gamma = 1.24$, so $R = 392.19$ J/(kg·K) and

$$c^*_{ideal} = \frac{\sqrt{392.19 \times 3120}}{\Gamma(1.24)} = 1685.8\ \mathrm{m/s}, \qquad c^* = 0.975 \times 1685.8 = 1643.6\ \mathrm{m/s}$$

| $\varepsilon$ | $C_{F,vac}$ | $I_{sp,vac}$ (s) with $\eta_n = 0.98$ |
|---|---|---|
| 28.9 | 1.8199 | 298.9 |
| 60 | 1.8712 | 307.4 |
| 100 | 1.9012 | 312.3 |
| 120 | 1.9110 | 313.9 |
| 150 | 1.9220 | 315.7 |
| 200 | 1.9355 | 317.9 |

Sanity check: the LMDE delivered 311 s at $\varepsilon = 47.5$ on
N₂O₄/Aerozine 50 at 7.6 bar `inj` [database, LMDE entry — one of the best
documented blocks in the file]. 307–316 s on MON-3/MMH at 10 bar and higher
$\varepsilon$ is the right neighbourhood.

Note how flat the column is: going from $\varepsilon = 60$ to 200 buys 10.5 s,
3.4 %. **Area ratio is cheap performance right up to the moment it becomes an
envelope problem, and on this mission it becomes one.**

### B.1.3 The constraint that decides Mission B

B1.10 requires $T/W \ge 2.2$ at the start of powered descent. Descent start
mass is 1,200 kg + descent propellant. At $I_{sp} = 307$ s the descent
propellant is 274.1 kg, so the descent starts at **1,474.1 kg**, weighing
$1474.1 \times 3.721 = 5{,}485$ N on Mars. Therefore

$$F_{descent} \ge 2.2 \times 5485 = 12{,}070\ \mathrm{N}$$

B1.12 requires any engine firing below 30 m to have $D_e \le 500$ mm. For a
single engine delivering 12.07 kN at $p_c = 10$ bar, the largest area ratio
that fits is found by solving $D_t\sqrt{\varepsilon} = 0.5$ m with
$A_t = F/(p_c C_F \eta_n)$:

$$\varepsilon_{max} = 28.9, \qquad I_{sp} = 298.9\ \mathrm{s}$$

**A single-engine architecture is forced down to $\varepsilon \approx 29$ by two
requirements that never mention the nozzle**, and it pays that penalty on the
1,050 m/s orbit insertion as well as on the landing, because it is the same
engine. That is the whole Mission B trade in one paragraph, and it is invisible
to anyone who sizes the engine for $I_{sp}$ and checks the envelope afterwards.

Raising $p_c$ to 20 bar restores $\varepsilon_{max}$ to 59.5 and $I_{sp}$ to
307.3 s — at the cost of a pressure-fed tank system designed to about 26 bar
MEOP instead of 16, which is roughly 60 % more tank and pressurant mass on a
1.2 m³ propellant volume. Price it; do not wave at it.

### B.1.4 Mass closure, all five candidates

Legs as above; 5 % performance reserve; arrival wet mass compared with the
B1.14 ceiling of 3,200 kg.

| candidate | $I_{sp}$ used (s) | descent (kg) | deorbit (kg) | MOI+TCM (kg) | total (kg) | +5 % reserve | **arrival wet (kg)** | vs B1.14 |
|---|---|---|---|---|---|---|---|---|
| **B1** single engine, $\varepsilon = 28.9$ | 298.9 / 298.9 | 288.6 | 63.6 | 1,003.5 | 1,355.7 | 1,423.5 | **3,173.5** | passes by **0.8 %** |
| **B2** split, $\varepsilon = 60$ / 120 | 307.4 / 313.9 | 274.1 | 60.1 | 944.1 | 1,278.2 | 1,342.1 | **3,092.1** | passes by 3.4 % |
| **B3** hydrazine monoprop | 232 | 375.9 | 85.8 | 1,454.7 | 1,916.4 | 2,012.3 | **3,762.3** | **fails by 17.6 %** |
| **B4** LOX/CH₄ pump-fed | 369.8 | 223.7 | 49.6 | 754.9 | 1,028.2 | 1,079.6 | **2,829.6** | passes by 11.6 % |
| **B5** LMP-103S class | 253 | 340.7 | 77.2 | 1,278.3 | 1,696.2 | 1,781.0 | **3,531.0** | **fails by 10.3 %** |

**B3 and B5 are eliminated here, on arithmetic, before any judgment is
applied.** This is the Mission B version of the lesson: 232 s of hydrazine
against 307 s of hypergolic bipropellant is 660 kg of extra propellant on a
mission with a 3,200 kg arrival ceiling, and no amount of simplicity argument
recovers that. The green monopropellant closes the gap by a third and it is not
enough. **Size before you argue** — both of these candidates have real
advocates and both are dead on the first page of arithmetic.

The B4 result is the interesting one: LOX/CH₄ is 262 kg lighter at arrival than
the recommended architecture. It loses this mission somewhere other than the Δv
budget, and finding *where* is D2/D5/D12 work, not D10 work.

### B.1.5 The landing cluster, and why B1.11 is easy for B2 and moot for B1

B2's descent set: **four engines of 3.5 kN at $\varepsilon = 60$**,
$D_t = 49.3$ mm, $D_e = 381.8$ mm each — comfortably inside B1.12.

| condition | mass (kg) | Mars weight (N) | available thrust (N) | T/W |
|---|---|---|---|---|
| descent start, four engines | 1,474.1 | 5,485 | 14,000 | **2.55** ✓ (B1.10) |
| descent start, one engine failed | 1,474.1 | 5,485 | 10,500 | **1.91** ✓ |
| touchdown, four engines | 1,225.6 | 4,560 | 14,000 | 3.07 |
| touchdown, one engine failed | 1,225.6 | 4,560 | 10,500 | **2.30** ✓ (B1.11) |

Hover at touchdown mass needs **32.6 %** of the four-engine cluster — a 3.07:1
turndown, inside the 4:1 of B1.9 with room for the divert authority. B1.11 is
satisfied by inspection because losing one of four engines still leaves
T/W = 2.30 at touchdown; note that it also leaves a thrust asymmetry, so the
gimbal or differential-throttle authority to trim it is a real design item and
belongs in the report.

For B1, B1.11's wording ("if the architecture is multi-engine") exempts the
single-engine case. That exemption is a gift and the report should say what it
costs: the single engine is a **non-removable single-point failure on the only
propulsion event that cannot be retried**, which is exactly the Apollo SPS
situation, and the SPS answer was to remove mechanisms rather than to add
redundancy [SLPRE]. B1 can make that argument honestly. It cannot make the
argument that the failure does not exist.

### B.1.6 MOI: the finite-burn check

At 12 kN on a 3,092 kg stack, $a = 3.88$ m/s² and the 1,150 m/s of leg 1 takes
**296 s**. A five-minute burn at the periapsis of a Mars capture orbit is not
impulsive; the finite-burn (gravity) loss is of order 1–2 % of the burn, so add
**≈ 20 m/s** to leg 1 and re-close. The reference chain above does not include
it, deliberately, so that you can see the effect: adding 20 m/s adds about
17 kg of propellant and reduces B1's already thin margin to 0.3 %.

At 6 kN the same burn takes 592 s and the loss roughly doubles. **This is a
second, independent reason the MOI thrust level cannot be chosen for
convenience**, and a report that sizes MOI thrust only from "the burn should
not take too long" has stated the right conclusion without the mechanism.

### B.1.7 Feed system, B2

Propellant loaded 1,342.1 kg at $r = 1.65$: fuel 506.5 kg MMH (0.5795 m³ at
874 kg/m³), oxidizer 835.7 kg MON-3 (0.5791 m³ at 1443 kg/m³). The volumes are
within 0.1 % of each other, which is a pleasant property of this pair and means
four identical tanks rather than two sizes. Tank volume with 5 % ullage:
**1.2165 m³**.

Pressure budget: $p_c$ 10 bar + injector $\Delta p$ 2.5 bar + lines and valves
1.5 bar + regulator droop and margin 2.0 bar → **tank pressure 16 bar**,
regulated. Helium at 290 K:

$$m_{He} = \frac{p V}{R_{He} T} = \frac{16\times10^5 \times 1.2165}{2077.1 \times 290} = 3.23\ \mathrm{kg}$$

stored at 310 bar in **0.0628 m³** — a 493 mm sphere. That is the ideal
isothermal number and it is optimistic in both directions at once: the gas
cools as it expands out of the storage bottle (raising the mass needed) and
warms as it is compressed into the ullage (lowering it), and a real regulated
system with a 9-month dormancy carries 20–30 % more helium than this [J].
Say which way you corrected and why.

**Regulated versus blowdown.** Blowdown from 310 to 20 bar has an isothermal
usable fraction of 0.935, which sounds like a reason to delete the regulator.
It is not: in blowdown the chamber pressure falls with the tank, so the engine
that must deliver 12 kN at the start of descent delivers far less at the end,
and the throttle authority of B1.9 is consumed by the blowdown instead of by
the guidance law. Regulated, with the regulator as a named single-point failure
mitigated by a redundant parallel leg with series-redundant latch valves.

### B.1.8 Propulsion dry mass, B2 and B4 — where B4 actually loses

**B2**, maturity-based MGA per G4:

| item | basic (kg) | MGA | predicted (kg) |
|---|---|---|---|
| MOI engine, 12 kN, $\varepsilon = 120$ | 14 | 15 % | 16.1 |
| 4 × landing engine, 3.5 kN, $\varepsilon = 60$ | 22 | 15 % | 25.3 |
| propellant tanks (4 × Ti, 1.22 m³, 16 bar, with diaphragms) | 42 | 10 % | 46.2 |
| He COPV + 3.23 kg He | 22 | 5 % | 23.1 |
| regulator, latch and isolation valves, lines, filters | 28 | 10 % | 30.8 |
| ACS, 8 × 22 N, integrated on main propellant | 14 | 5 % | 14.7 |
| structure, mounts, gimbals | 58 | 15 % | 66.7 |
| thermal: MLI, heaters, thermostats, catbed heaters | 22 | 15 % | 25.3 |
| harness, transducers | 10 | 10 % | 11.0 |
| **subtotal** | **232** | | **259.2** |
| system margin, 15 % | | | 38.9 |
| **predicted total** | | | **298.1** |

Against B1.13's 340 kg ceiling: **passes with 12 % margin.** Residuals and
trapped propellant: 2 % of the load, **26.8 kg**, stated as a separate line and
*not* counted as usable — this is the line item most often missing and it is
worth about 8 m/s of Δv you do not have.

**B4** on the same policy — and this is where the cryogenic candidate dies:

| item | basic (kg) | MGA | predicted (kg) |
|---|---|---|---|
| main engine, 12 kN pump-fed LOX/CH₄ | 32 | 25 % | 40.0 |
| 4 × landing engine + feed | 30 | 25 % | 37.5 |
| turbopump and drive | 26 | 25 % | 32.5 |
| cryogenic tanks, 1.33 m³, Al-Li | 62 | 15 % | 71.3 |
| MLI, vapour-cooled shield, supports | 30 | 25 % | 37.5 |
| cryocooler + radiator (~90 W input) | 48 | 35 % | 64.8 |
| valves, chilldown lines, vents | 34 | 15 % | 39.1 |
| ACS, separate (main system not restartable cold on demand) | 22 | 15 % | 25.3 |
| structure, mounts | 62 | 15 % | 71.3 |
| harness, transducers | 12 | 10 % | 13.2 |
| **subtotal** | **358** | | **432.5** |
| system margin, 15 % | | | 64.9 |
| **predicted total** | | | **497.4** |

**B4 exceeds B1.13 by 46 %**, and independently exceeds B1.15's 25 W
orbit-average cruise power allocation by a factor of about 3.6 with the
cryocooler alone. It wins the Δv budget by 262 kg and loses the dry-mass budget
by 157 kg and the power budget outright. **The candidate with the best $I_{sp}$
loses this mission on the propulsion system's own dry mass**, which is the
single most useful thing Mission B teaches, and it is invisible to anybody who
stops at D10.

### B.1.9 Contamination, quantified against the datum

B-G6 asks for a mechanistic ranking, not a CFD model. Three axes:

**(i) Plume species.** MON-3/MMH combustion products are H₂O, CO, CO₂, N₂ and
H₂ with residual NO$_x$ and, under deep throttling and during the start and
shutdown transients, **unburned MMH and nitrosamine-forming species** — which
is precisely the class of nitrogen-bearing organic compound the payload is
looking for in the regolith. This is the datum's fundamental weakness and it is
not fixable by nozzle design. Hydrazine and LMP-103S have the same problem in
different proportions. **LOX/CH₄ has no nitrogen and no hydrazine derivative
anywhere in the system**, and its unburned residue is methane, which the
instrument can be blind to by design. On this axis the ranking is
B4 ≫ B1 ≈ B2 ≈ B3 ≈ B5, and the gap is qualitative, not incremental.

**(ii) Plume–surface interaction.** Take the surface loading as thrust divided
by total exit area as a first-order proxy [A] — crude, but it scales correctly
with what matters:

| | thrust at touchdown (N) | total $A_e$ (m²) | proxy loading (kPa) |
|---|---|---|---|
| B1, one engine, $D_e = 492$ mm | 4,560 | 0.1901 | **24.0** |
| B2, four engines, $D_e = 382$ mm each | 4,560 | 0.4580 | **10.0** |

B2 more than halves the surface loading, which is the direct driver of regolith
excavation and hence of debris re-deposition on the sampling site. **But** four
plumes impinging on a flat surface under a vehicle interact, and the
interaction produces a stagnation region under the vehicle centre that a single
plume does not — which is exactly where the sampling arm goes. A report that
claims the four-engine layout is unambiguously cleaner has over-claimed; the
honest statement is that it reduces peak loading and introduces a new,
less well characterised flow feature, and that the retirement for that risk is
a subscale plume-impingement test in a vacuum chamber over Mars-simulant
regolith.

**(iii) Deposition during coast.** ACS thruster plumes fire thousands of times
over nine months, and an integrated ACS on MMH deposits fuel-derived species on
every surface with line of sight. A separate cold-gas ACS eliminates that at
the cost of a second system. This axis is the one that most often decides the
real version of this argument and it is the one students never mention.

## B.2 Recommended architecture and the strongest alternative

### Recommended: **B2 — MON-3/MMH pressure-fed, split: one 12 kN $\varepsilon = 120$ MOI/deorbit engine, four 3.5 kN $\varepsilon = 60$ throttleable landing engines**

1. **It is the only candidate that meets B1.10, B1.11 and B1.12 without
   forcing a performance penalty onto the orbit-insertion burn.** The MOI
   engine never fires near the ground, so it keeps the area ratio it wants
   (313.9 s); the landing engines never need a high area ratio, so they fit
   inside the 500 mm envelope with 24 % to spare.
2. **3.4 % arrival-mass margin against B1.14 and 12 % dry-mass margin against
   B1.13**, on a mass budget built with maturity-based MGA and a 15 % system
   margin. B1 has 0.8 % and 0.3 % once the finite-burn loss is included.
3. **Hypergolic ignition means no ignition consumable and therefore no restart
   count.** B1.8 asks for eight restarts including one after a 90-day coast;
   for a hypergolic pressure-fed system the answer is "the valve cycles are the
   limit, and they are qualified in the thousands". Every other candidate has
   to argue this.
4. **Nine-month storage is the flight-proven case for this propellant pair.**
   MMH freezes at −52 °C, well below the −30 °C floor of B1.15; MON-3's
   additive exists partly to depress the N₂O₄ freezing point near −11 °C, and
   the oxidizer, not the fuel, sets the heater budget [SB, Clark]. Sizing the
   heaters against the oxidizer and saying so is worth marks.

**What it costs, and the memo must name it:**

- **48 kg of landed science mass** against B1, from the heavier propulsion
  system (298 kg vs ~250 kg predicted), inside a fixed 1,200 kg landed mass.
  That is a real number the payload team will feel and it must appear in the
  memo, not in an appendix.
- **Two engine qualifications instead of one**, plus a thrust-asymmetry trim
  problem that B1 does not have.
- **Contamination**: it is the datum. It does not beat anything on nitrogen
  chemistry, and its four-plume interaction is a new unknown.
- **Part count**: five engines, ten propellant valves in the thrust path
  against B1's two.

### Strongest alternative: **B1 — the single-engine LMDE architecture**

It is genuinely strong and the report must treat it that way. Fewest parts of
any candidate, one qualification, the simplest possible start sequence, the
lowest dry mass, 48 kg more science, and sixty years of heritage on almost
exactly this problem. It closes the mission.

It closes it by **0.8 %**, falling to **0.3 %** once the finite-burn loss of
§B.1.6 is included, and it does so with an engine forced to $\varepsilon = 28.9$
by two requirements that have nothing to do with propulsion performance. That
margin will not survive contact with a real spacecraft. The recovery paths are
real and should be named: raise $p_c$ to 20 bar (buys 8.4 s of $I_{sp}$, costs
tank and pressurant mass — compute it, it is close), or negotiate B1.12 from
500 mm to 620 mm, or accept 1,150 kg landed instead of 1,200.

**A report that recommends B1, states the 0.3 % margin honestly, and names the
$p_c = 20$ bar recovery path scores as highly as one that recommends B2.** A
report that recommends B1 without discovering the $\varepsilon \le 28.9$
constraint has not done the mission.

**B4 deserves a paragraph in the memo even though it loses**, because it wins
the criterion the science team cares most about by a margin nothing else
approaches, and because its failure is not fundamental — it is a 157 kg dry
mass overrun and a power budget. If this mission flew ten years later, with a
lighter cryocooler or a passive zero-boil-off scheme, B4 would be the
recommendation. Say so. That is D12 question 3, and it is worth 4 marks nobody
collects.

## B.3 Pugh matrix

Datum: **B1**, the single-engine architecture. Scoring −2 to +2.

| criterion | weight | justification (tied to this mission) |
|---|---|---|
| Landing controllability | 16 | B1.9–B1.12 are four requirements describing one thing, and the last 30 seconds of this mission cannot be retried or aborted. |
| Mass closure and margin | 15 | Two candidates fail B1.14 outright and one passes it by 0.8 %; margin here is compliance, not comfort. |
| Reliability | 14 | Every propulsion event is single-string in the sense that matters; there is one vehicle and one window. |
| Contamination / science compatibility | 12 | The payload's primary measurement is organics in regolith taken from under the lander; a contaminated site is a failed mission with a healthy spacecraft. |
| Storage and dormancy robustness | 12 | Nine months, B1.7, with a 25 W heater allocation and a 90-day coast before a required restart. |
| Performance ($I_{sp}$, propellant mass) | 9 | Real, but largely already priced through Mass closure. |
| Complexity | 7 | Part count drives both qualification cost and the FMEA length on a single-string vehicle. |
| Manufacturability and cost | 7 | One vehicle; NRI dominates and heritage hardware is the lever. |
| Mission fit | 8 | Interfaces to aeroshell, ACS, power and the sampling system; B1.15's power allocation is a propulsion requirement in disguise. |
| **total** | **100** | |

| criterion | w | **B1 datum** | **B2** | B3 N₂H₄ | B4 LOX/CH₄ | B5 LMP-103S |
|---|---|---|---|---|---|---|
| Landing controllability | 16 | 0 *(ε forced to 28.9; 24.0 kPa plume; no engine-out)* | **+2** *(2.55 T/W, 3.07:1 turndown, 10.0 kPa, engine-out at 2.30)* | −1 *(monoprop throttling is poorer)* | +1 *(deep throttle easy; cryo start transients)* | −1 |
| Mass closure and margin | 15 | −1 *(0.8 %, 0.3 % with finite burn)* | **+1** *(3.4 % arrival, 12 % dry)* | −2 *(fails B1.14 by 17.6 %)* | **−2** *(fails B1.13 by 46 %, B1.15 by 3.6×)* | −2 *(fails B1.14 by 10.3 %)* |
| Reliability | 14 | 0 *(2 valves in thrust path; one non-removable SPF)* | **−1** *(5 engines, 10 valves; SPF removed, count tripled)* | +1 *(catbed, no MR control)* | −2 *(turbopump start after 90-day cold soak)* | 0 |
| Contamination | 12 | 0 *(datum)* | **+1** *(halves surface loading; same chemistry)* | −1 *(NH₃, N₂ and unreacted N₂H₄)* | **+2** *(no nitrogen, no hydrazine derivative anywhere)* | 0 |
| Storage / dormancy | 12 | 0 *(flight-proven pair, oxidizer sets heater)* | **0** *(same)* | +1 *(single fluid, simplest)* | **−2** *(boil-off, cryocooler, 9 months)* | +1 |
| Performance | 9 | 0 *(298.9 s)* | **+1** *(307/314 s)* | −2 *(232 s)* | +2 *(369.8 s)* | −1 *(253 s)* |
| Complexity | 7 | 0 | **−1** | +1 | −2 | +1 |
| Manufacturability / cost | 7 | 0 | **−1** *(two quals)* | +1 | −2 | 0 |
| Mission fit | 8 | 0 | **+1** *(engine-out satisfies the reviewers, ACS integrated)* | 0 | −1 *(power budget, chilldown GSE, no Mars heritage)* | 0 |
| **weighted total** | | **0** | **+34** | **−22** | **−26** | **−22** |

B2 wins, and it wins by enough that the raw result is not in doubt. The
sensitivity is therefore about *how* it wins, not whether.

### B.3.1 Sensitivity and the flip

| weight varied ±50 % | flips? | at what value |
|---|---|---|
| Landing controllability | **yes** | below **7** (from 16) the winner becomes B1 |
| Mass closure and margin | no | — |
| Contamination | no within ±50 %; at **> 30** B4's compliance failures still block it | — |
| Reliability | no | — |
| all others | no | — |

**Two-criterion perturbation.** Landing controllability 16 → 9 together with
Complexity 7 → 14 — the trade a programme makes when the reviewer who worries
about part count is louder than the reviewer who worries about touchdown —
brings B2 down to +9 and B1 to 0. B2 still wins but the margin has gone from
decisive to arguable, and that is the honest way to report it.

**Input perturbation, and this is the important one.** The B4 dry-mass estimate
is the softest number in the study: the cryocooler line carries a 35 % MGA
because it is a new design with a new process and no analysis, and the whole
subtotal rests on a mass model, not on hardware. **Reduce B4's cryogenic
overhead (cooler + MLI + chilldown) by 40 %** — which is roughly what a decade
of development in passive zero-boil-off would deliver — and B4's predicted dry
mass falls to about 380 kg. It still fails B1.13's 340 kg. **Reduce it by 55 %
and B4 complies, and with +2 on contamination and +2 on performance it becomes
the winner.** That is the single most useful sensitivity in Mission B: the
recommendation is not "hypergolics are better", it is "hypergolics are better
*at this dry-mass technology level*", and the report should name the number
(a ~55 % reduction in cryogenic thermal-management mass) at which the answer
changes. A trigger stated that precisely is what a chief engineer can act on.

## B.4 Risk register (10)

| # | risk (if–then) | L | C | score | mitigation | retires at |
|---|---|---|---|---|---|---|
| B-R1 | **If** the four landing plumes interact to produce a stagnation region under the vehicle centre, **then** regolith is excavated and re-deposited exactly on the sampling site and the primary measurement is compromised. | 3 | 5 | 15 | Subscale four-plume impingement test over Mars-simulant regolith in a vacuum chamber; if confirmed, cant the engines outboard and re-check gimbal trim. | Impingement test complete — PDR + 6 months. |
| B-R2 | **If** MON-3 freezes in a line or a valve during a cold excursion, **then** the deorbit or descent burn does not start and the mission ends. | 2 | 5 | 10 | Heater sizing against the oxidizer, not the fuel; two-string thermostats; line trace heaters on every run inside the coldest zone; thermal-vacuum cycling of the full feed system at the B1.15 floor. | System-level TVAC at −30 °C — CDR + 4 months. |
| B-R3 | **If** the helium regulator drifts or fails open during the 9-month dormancy, **then** tanks over-pressurise or the engine runs off-mixture through the most important burn. | 2 | 5 | 10 | Redundant parallel regulator legs with series latch valves; tank burst margin against full upstream pressure; long-duration regulator life test at flight duty cycle. | 12-month regulator life test — CDR + 12 months. |
| B-R4 | **If** delivered $I_{sp}$ is 5 s below the assumed 307/314 s, **then** the 3.4 % arrival margin falls to 1.6 % and B1.14 is at risk. | 3 | 3 | 9 | Engine acceptance-test $I_{sp}$ measured on every flight unit at altitude; hold a 20 kg propellant offload and a landed-mass renegotiation as recovery. | Engine qualification hot fire — CDR + 8 months. |
| B-R5 | **If** the landing engines cannot hold stable combustion at 33 % thrust, **then** the terminal descent guidance loses authority in the last 30 seconds. | 3 | 5 | 15 | Variable-area pintle or fixed-area with a stated minimum-$\Delta p$ floor; stability rating by bomb test at minimum throttle, not just at rated; the LMDE precedent of a *prohibited* throttle band is the model for how to report the result honestly [database, LMDE]. | Throttle-envelope hot fire with stability rating — CDR + 8 months. |
| B-R6 | **If** the MOI burn's finite-burn loss exceeds the 20 m/s allowed, **then** the capture orbit is wrong and the deorbit budget absorbs the error. | 2 | 4 | 8 | Trajectory-integrated burn simulation rather than an impulsive assumption, at PDR; keep the 5 % reserve unallocated until after that analysis. | PDR trajectory closure. |
| B-R7 | *(non-technical)* **If** MON-3 or MMH supply, transport or launch-site handling approval slips, **then** the launch window is missed and the mission waits 26 months. | 2 | 5 | 10 | Propellant procurement and range approvals started at PDR, not at shipment; identify the single approval with the longest lead and track it as a programme milestone. | Range handling approval — L−12 months. |
| B-R8 | *(non-technical)* **If** the science team re-weights contamination after PDR, **then** the architecture is challenged with no time to change it. | 3 | 3 | 9 | Get the contamination requirement B1.16 written as a number with a datum *before* PDR; the analysis in §B.1.9 exists to force that conversation early. | B1.16 quantified and baselined — PDR. |
| B-R9 | *(created by the recommendation)* **If** one landing engine fails off-nominally in the last 15 seconds, **then** the thrust asymmetry must be trimmed within the control bandwidth — a failure mode the single-engine B1 does not have at all. | 2 | 5 | 10 | Differential-throttle authority sized for one-out at touchdown; demonstrate the trim in a hardware-in-the-loop descent simulation; consider engine cant to reduce the moment arm. | HWIL one-out descent case — CDR + 10 months. |
| B-R10 | **If** the 90-day-coast restart (B1.8) finds propellant migrated or vapour locked in the feed lines, **then** the descent burn starts on gas. | 2 | 5 | 10 | Diaphragm or vane-managed tanks qualified for the coast; settling burn on ACS before every main-engine start; a 90-day dormancy included in the qualification duty cycle, not simulated by a shorter one. | Qualification duty cycle with a 90-day dwell — CDR + 14 months. |

## B.5 What distinguishes an A from a C on Mission B

**A C-grade report** builds the Δv budget, applies the rocket equation, sizes
one engine, notes that hydrazine has a low $I_{sp}$, produces a mass budget with
a flat margin, and recommends hypergolic bipropellant because that is what
Mars landers use. It is not wrong. It also never discovers the constraint that
actually decides the mission. 55–66.

**A B-grade report** gets the three-leg chain and the jettison right, sizes all
five candidates, eliminates B3 and B5 on arithmetic, computes the descent T/W,
and builds a matrix with justified weights. It usually treats B1.12 as a
checkbox rather than as a driver, and it usually treats B4 as "too hard"
without producing the dry-mass table that shows *why*. 72–84.

**An A-grade report** does five things:

1. **It finds that B1.10 and B1.12 together cap $\varepsilon$ at 28.9** and
   therefore that a single-engine architecture pays a 9 s $I_{sp}$ penalty on
   orbit insertion for a requirement about ground clearance. This is the
   mission's central insight and it is available to anyone who checks the exit
   diameter *before* choosing the area ratio.
2. **It kills B4 with a dry-mass table, not with an adjective**, and then says
   what would resurrect it, with a number.
3. **It puts the finite-burn loss into the closure** and shows what it does to
   B1's margin.
4. **It quantifies contamination on three axes** including the ACS-plume axis
   nobody mentions, and it admits that the four-engine layout trades peak
   loading for a less well characterised interaction.
5. **It states the landed-science cost of its own recommendation in kilograms**
   in the memo. 88–96.

## B.6 The ten most common errors on Mission B

1. **Putting the aeroshell jettison on the wrong side of a leg.** Typically
   60–90 kg of error, always in the flattering direction, and it propagates
   into every subsequent number.
2. **Choosing $\varepsilon$ for $I_{sp}$ and checking $D_e$ afterwards — or
   not at all.** B1.12 is a hard requirement and it is the one that decides the
   architecture. Reports that quote a 780 mm bell on a lander with 500 mm of
   ground clearance have not read their own requirements table.
3. **Not sizing B3 and B5 because "monopropellant is obviously worse".** It is
   obviously worse *here*, by 17.6 % and 10.3 % of arrival mass, and the marks
   are for showing it. Automatic −10 for a candidate without sizing.
4. **Assuming MOI is impulsive.** A 296 s burn is not, and the loss eats the
   margin of the candidate that has least of it.
5. **Omitting residuals and trapped propellant.** 2 % of 1,342 kg is 26.8 kg —
   more than the entire arrival-mass margin of the single-engine candidate.
6. **Costing the cryogenic candidate only in boil-off.** Boil-off is the
   headline and the cryocooler, MLI, vapour-cooled shield, chilldown lines and
   the power to run them are the actual mass. The B4 dry-mass table is the
   deliverable, and B1.15's 25 W allocation is a propulsion requirement.
7. **Treating "contamination" as a word.** B1.16 asks for a quantification
   against a stated datum. Three axes, a proxy number for surface loading, and
   an honest statement of what the multi-engine layout makes worse is a
   complete answer; "hypergolics are dirty" is not.
8. **Claiming the four-engine cluster removes the single-point failure without
   pricing the asymmetry.** It removes one failure mode and creates another,
   and the new one is a control problem in the last fifteen seconds.
9. **Sizing the heater budget against the fuel.** MMH freezes at −52 °C and
   MON-3 near −11 °C. The oxidizer sets the budget. Getting this backwards is a
   tell that the storage section was written from memory.
10. **A memo that does not state what the recommendation costs in landed science
    mass.** 48 kg out of a 1,200 kg lander is 4 % of everything the mission
    exists to do, and it is exactly the number the person reading the memo
    needs. Leaving it in an appendix is the difference between a report and a
    decision.

---
---

# Mission C — reference solution

## C.1 The sizing chain

### C.1.1 Impulse, propellant mass, thrust

Take the design point at the middle of the C1.2 band, $t_b = 8.0$ s, and at
$p_c = 7.0$ MPa (a conventional design pressure for a case of this class [J]).

**C1, aluminized AP/HTPB/Al.** $\mathcal{M} = 27.5$, $T_0 = 3300$ K,
$\gamma = 1.18$, so $R = 302.34$ J/(kg·K) and

$$c^*_{ideal} = \frac{\sqrt{302.34\times3300}}{\Gamma(1.18)} = 1549.5\ \mathrm{m/s} \quad(\text{table: } 1550)$$

which confirms the chamber-gas row and the $c^*$ row of C-G1 are consistent —
**check this; it is a two-line check and it catches a table you have
misread.** With $\eta_{c^*} = 0.95$, $c^* = 1472.5$ m/s.

At $\varepsilon = 8$, $\gamma = 1.18$: $C_{F,vac} = 1.7239$, $C_{F,SL} = 1.6081$.
With $\eta_n = 0.96$:

$$I_{sp,vac} = \frac{1472.5 \times 1.7239 \times 0.96}{9.80665} = 248.5\ \mathrm{s}, \qquad I_{sp,SL} = 231.8\ \mathrm{s}$$

Sanity check against the database: the Orion 38 delivers 281.7 s at
$\varepsilon = 68.5$ and the GEM-40 274 s at $\varepsilon = 11$ [database,
confidence B]. At $\varepsilon = 8$ on a much smaller motor with a 4 % nozzle
loss, 248.5 s vacuum is the right neighbourhood; the gap to the GEM-40 is
mostly nozzle and partly scale.

$$m_p = \frac{I_{tot}}{I_{sp,vac}\,g_0} = \frac{155{,}000}{248.5 \times 9.80665} = 63.60\ \mathrm{kg}$$
$$\dot m = \frac{63.60}{8.0} = 7.951\ \mathrm{kg/s}, \qquad F_{vac} = \dot m I_{sp} g_0 = 19.375\ \mathrm{kN}$$
$$A_t = \frac{F}{p_c C_{F,vac}\eta_n} = 1{,}672\ \mathrm{mm^2} \Rightarrow D_t = 46.15\ \mathrm{mm}, \quad D_e = 130.5\ \mathrm{mm}$$

**C2, reduced-smoke AP/HTPB.** $c^*_{ideal} = 1500$ m/s, $\eta_{c^*} = 0.96$,
$\gamma = 1.20$: $C_{F,vac} = 1.7133$ and $I_{sp,vac} = 241.5$ s — **7.0 s, or
2.8 %, below C1.** That is the price of taking the aluminium out, and it is
smaller than most students expect. It buys back a lower $n$, a lower $\sigma_p$,
a cooler flame, less throat erosion, no slag, and a plume an optical payload can
see through. $m_p$ rises to 65.44 kg and $\dot m$ to 8.181 kg/s at the same
19.375 kN.

### C.1.2 Ballistics: $a$, $K_n$, and the equilibrium check

Convert the tabulated burn rate to SI. For C1, $r = 8.0$ mm/s at 7.0 MPa with
$n = 0.35$:

$$a = \frac{r}{p^n} = \frac{0.0080}{(7.0\times10^6)^{0.35}} = 3.2159\times10^{-5}\ \mathrm{(m/s)/Pa^{0.35}}$$

Required burn area:

$$A_b = \frac{\dot m}{\rho_p r} = \frac{7.951}{1770 \times 0.0080} = 0.5615\ \mathrm{m^2}, \qquad K_n = \frac{A_b}{A_t} = 335.7$$

Verify by closing the loop — `solid_equilibrium_pressure(a, n, ρ, Ab, At, c*)`
returns **7.0000 MPa**, which is the check that your $a$, your $K_n$ and your
$c^*$ are mutually consistent. Do it. A student who computes $K_n$ from $A_b$
and $A_t$ and never feeds it back through the equilibrium relation has not
checked anything.

For C2: $a = 6.1883\times10^{-5}$, $A_b = 0.6794$ m², $K_n = 403.7$. The
**higher $K_n$ is a direct consequence of the lower burn rate**, and it means
more burning surface in the same envelope — a more aggressive fin geometry, a
thinner web, and a larger sliver if you are not careful. This is the first place
the "obvious" propellant swap costs something in the grain.

### C.1.3 The temperature range, which is the hardest requirement

$\pi_K = \sigma_p/(1-n)$ (module 20). Reference temperature +21 °C;
$\Delta T = +39$ K to the hot limit and $-61$ K to the cold limit.

| | $\sigma_p$ (K⁻¹) | $n$ | $\pi_K$ (K⁻¹) | $p_c$ at −40 °C | $p_c$ at +21 °C | $p_c$ at +60 °C | hot/cold ratio |
|---|---|---|---|---|---|---|---|
| C1 | 0.0020 | 0.35 | 0.003077 | **5.802 MPa** | 7.000 | **7.892 MPa** | **1.360** |
| C2 | 0.0018 | 0.30 | 0.002571 | **5.984 MPa** | 7.000 | **7.738 MPa** | **1.293** |

Burn rate itself moves less than chamber pressure does — that is the whole point
of $\pi_K$, and the amplification factor is $1/(1-n)$, which is 1.54 for C1 and
1.43 for C2. Action time follows $r$: C1 runs **7.40 s** hot and **9.04 s**
cold, C2 **7.46 s** and **8.93 s**. **C1 violates C1.2's 7.0–9.0 s band at the
cold limit by 0.04 s.** That is inside the accuracy of the model and it is not
a reason to reject the candidate, but it *is* a reason to state that C1 has no
margin on action time at −40 °C and that the design point may need to move to
$t_b = 7.8$ s. Finding that is worth marks; not noticing it is the tell of a
student who computed the hot case only.

MEOP per C-G3 (hot equilibrium × 1.10 for ignition transient and lot dispersion):

| | MEOP | design burst (1.5×) | $t$ CFRP (1,400 MPa) | $t$ 15-5PH (1,100 MPa) | $t$ 4130 (620 MPa) |
|---|---|---|---|---|---|
| C1 | **8.68 MPa** | 13.02 MPa | 1.21 mm | 1.54 mm | 2.73 mm |
| C2 | **8.51 MPa** | 12.77 MPa | 1.19 mm | 1.51 mm | 2.68 mm |

C2's lower $\pi_K$ buys 2 % of case thickness, which is worth almost nothing on
its own, and a **5 % narrower thrust dispersion across the temperature range**,
which is worth a great deal against C1.3.

### C.1.4 C1.3 and C1.4: the requirements the temperature range actually sets

**C1.3, thrust shape.** Max/mean ≤ 1.30 across the conditioned range. Taking the
+21 °C mean as the datum, the hot case raises thrust by the same factor as
$p_c$: 1.128 for C1 and 1.106 for C2. A finocyl trimmed to ±3 % neutrality then
gives max/mean of **1.16 (C1)** and **1.14 (C2)**, both compliant, with C1
holding about half the margin. Any grain that is genuinely progressive — a
plain internal-burning tube, for instance — adds 20–40 % on its own and blows
the requirement immediately at the hot limit. **C1.3 is a grain-geometry
requirement disguised as a thrust requirement, and $\pi_K$ is what makes it
tight.**

**C1.4, peak acceleration, and the most satisfying result in this mission.**
On the C-G9 reference vehicle: lift-off mass = 45 (payload) + 40 (airframe) +
74.2 (C1 motor) = **159.2 kg**; burnout mass = 159.2 − 63.6 = **95.6 kg**. Peak
acceleration is at burnout, hot-conditioned.

If the throat did not erode, the hot thrust at burnout would still be 21.85 kN
and

$$a = \frac{21{,}850}{95.6} = 228.6\ \mathrm{m/s^2} = 23.3\,g \quad \textbf{— fails C1.4.}$$

But it does erode. A carbon-phenolic insert at the mid of its class
(0.10 mm/s over 8 s) grows the throat radius by 0.8 mm, so $A_t$ grows by 7.05 %
and, since $p_c \propto (1/A_t)^{1/(1-n)}$,

$$\frac{p_{c,\text{end}}}{p_{c,\text{start}}} = \left(\frac{1}{1.0705}\right)^{1/0.65} = 0.900$$

Thrust at burnout is therefore about 19.7 kN and

$$a = \frac{19{,}700}{95.6} = 206\ \mathrm{m/s^2} = 21.0\,g \quad \textbf{— compliant, by 1 g.}$$

**Throat erosion, which is a loss mechanism everywhere else in this course, is
what makes this requirement achievable.** It flattens the tail of the thrust
trace exactly where the vehicle is lightest. That also means the erosion rate is
now a *design parameter with a two-sided tolerance*: too little and C1.4 fails,
too much and the delivered impulse and C1.3 both suffer (graphite at 0.175 mm/s
drops $p_c$ by 16.6 % and costs about 2 % of total impulse). Reporting erosion
as a one-sided "loss to be minimised" is the standard error and it is wrong
here.

C2 lands at 20.7 g on the same calculation. Both candidates are inside C1.4 by
about a gravity, which is a statement the memo should make plainly: **this
motor is acceleration-limited at burnout and the margin is thin.**

### C.1.5 Envelope and mass fraction — where three candidates die

Propellant volume $V_p = m_p/\rho_p$; grain length at 260 mm case ID and 88 %
volumetric loading (a case-bonded finocyl figure [E]):

| | $m_p$ (kg) | $V_p$ (m³) | grain length (m) | overall length est. (m) |
|---|---|---|---|---|
| C1 | 63.60 | 0.03593 | 0.769 | ~1.02 with closures and nozzle |
| C2 | 65.44 | 0.03805 | 0.814 | ~1.07 |
| C4 (cartridge, 75 % loading) | 63.60 | 0.03593 | 0.902 | ~1.16 |

All inside C1.6's 1,200 mm; C4 with 40 mm to spare, which is not a margin.

Now the mass fraction, C1.7 ≥ 0.85. Case mass from the wall thickness above,
with a ×2.5 factor on the wound cylinder for domes, polar bosses and skirts, and
×1.6 on a metal case for closures:

| candidate | case (kg) | insulation | nozzle | igniter | misc | **inert** | motor (kg) | **$m_p/m_{motor}$** |
|---|---|---|---|---|---|---|---|---|
| **C1** aluminized, CFRP, finocyl | 4.7 | 1.9 | 2.8 | 0.7 | 0.5 | 10.6 | 74.20 | **0.857** ✓ |
| **C2** reduced-smoke, CFRP, finocyl | 4.8 | 1.7 | 2.8 | 0.7 | 0.5 | 10.5 | 75.94 | **0.862** ✓ |
| **C3** aluminized, **15-5PH steel** case | 12.6 | 1.9 | 2.8 | 0.7 | 0.5 | 18.5 | 82.10 | **0.775** ✗ |
| **C3b** aluminized, **4130 steel** case | 22.4 | 1.9 | 2.8 | 0.7 | 0.5 | 28.3 | 91.90 | **0.692** ✗ |
| **C4** cartridge-loaded, CFRP | 5.5 | 2.2 | 2.8 | 0.7 | 1.7 | 12.9 | 76.50 | **0.831** ✗ |

**C3 and C4 fail C1.7 on arithmetic.** The steel case fails it decisively — even
in a 1,100 MPa precipitation-hardening alloy the case is 12.6 kg against the
composite's 4.7, and at this size that is 8 percentage points of mass fraction.
The cartridge-loaded candidate fails it marginally, and for a specific reason
worth naming: cartridge loading costs volumetric loading (88 % → 75 %), which
costs length, which costs case mass, *and* it adds an inhibitor, a support
structure and a thermal standoff. It buys the elimination of the case-bond
failure mode, and on this mission that is not enough.

C2 having a **higher** mass fraction than C1 despite a lower $I_{sp}$ is not a
paradox: the inert mass is nearly fixed by the envelope and the pressure, so
carrying 1.8 kg more propellant raises the ratio. **Mass fraction and delivered
impulse are different questions and C1.7 is not a performance requirement.**
Students who conflate them get this backwards.

### C.1.6 C5, the hybrid, and why the arithmetic ends the argument

Take a delivered $I_{sp}$ of 245 s ($\eta_{c^*} = 0.92$, which is generous for a
multi-port hybrid) at $O/F = 7$:

$$m_{total} = \frac{155{,}000}{245 \times 9.80665} = 64.5\ \mathrm{kg} \Rightarrow m_{fuel} = 8.06\ \mathrm{kg},\quad m_{ox} = 56.45\ \mathrm{kg}$$

$$V_{ox} = \frac{56.45}{745} = 0.0758\ \mathrm{m^3} \Rightarrow L_{ox\ tank} = \frac{0.0758}{\pi (0.13)^2} = \mathbf{1.427\ m}$$

**The oxidizer tank alone is 227 mm longer than the entire motor is allowed to
be (C1.6, 1,200 mm), before the fuel grain, the injector, the combustion chamber
or the nozzle.** With a multi-port HTPB grain at perhaps 60 % volumetric
efficiency the fuel section adds another 0.27 m; the vehicle is ≥ 1.70 m of
propulsion. C5 fails C1.6 by 42 %.

That alone ends it, but the temperature requirement ends it twice. **N₂O's
critical temperature is 36.4 °C.** Above that, self-pressurising N₂O is
supercritical, there is no vapour pressure to regulate the tank to, and pressure
becomes a steep function of fill density and temperature. C1.8 requires firing
at **+60 °C** and C1.9 requires *storage* at **+71 °C**, both far above the
critical point. A sealed, pre-loaded N₂O tank at +71 °C is a pressure vessel
whose pressure depends on how full it was when it left the factory, and N₂O has
a documented exothermic decomposition hazard. C1.16 then finishes the job: the
alternative — loading at the site — is exactly what C1.16 forbids.

**Evaluate the hybrid, do not dismiss it.** The report must contain this
paragraph and these three numbers. It must not contain a sentence that says
hybrids are unsuitable for sounding rockets, which is false in general and true
only against *these* requirements.

### C.1.7 Grain concept and the burn-area history

C1's finocyl must deliver $A_b = 0.5615$ m² held within about ±3 % over a web of
$w \approx (0.13 - r_{port,0})$. In a 260 mm ID, 769 mm long case the bore alone
at mid-web (say 180 mm mean diameter) gives $\pi \times 0.18 \times 0.769 =
0.435$ m². The fins supply the remaining 0.13 m² and, more importantly, supply
it **early**, when the cylindrical bore area is smallest — which is exactly how
a finocyl is neutralised: a progressive cylindrical term summed with a
regressive fin term. Sliver at the end of web, where the fins have burned out
and the remaining propellant sits in the corners between fin roots, should be
held below **3 %** of the load; above that the tail-off lengthens, $I_{tot}$
falls and C1.2's action-time definition becomes ambiguous.

The nozzle: $\varepsilon = 8$ gives $M_e = 3.07$ and, at sea-level ignition,
$p_e = 1.24$ bar — slightly *under*expanded at lift-off, which is the right
choice for a motor that spends most of its 8 s above 5 km. The Schmucker
separation pressure at that $M_e$ is 0.372 bar, so there is no separation risk
anywhere in the trajectory; the only altitude-related loss is the underexpansion
at $t = 0$, which is small and which buys a shorter, lighter nozzle. Say that
explicitly — a report that sizes $\varepsilon$ for vacuum on a motor that fires
from the ground has optimised the wrong end of the trajectory.

## C.2 Recommended architecture and the strongest alternative

### Recommended: **C2 — reduced-smoke AP/HTPB (no metal), case-bonded finocyl, filament-wound carbon/epoxy case**

1. **It has the widest margin on the requirement that is hardest to hold.**
   $\pi_K = 0.00257$ K⁻¹ against C1's 0.00308 gives a hot/cold chamber-pressure
   ratio of 1.293 against 1.360, a max/mean thrust of 1.14 against 1.16, and an
   action time of 7.46–8.93 s that sits inside C1.2 at both ends — which C1's
   9.04 s cold case does not.
2. **It meets C1.7 with the largest margin of any compliant candidate** (0.862),
   despite the lower $I_{sp}$, because inert mass is set by envelope and pressure
   rather than by propellant mass.
3. **Lower flame temperature and no condensed alumina** means less throat
   erosion, no slag accumulation in the aft dome, a longer-lived insulation
   design and — for a payload class that includes optical and atmospheric
   instruments — a plume that does not obscure the vehicle. That is a mission-fit
   argument, not a propulsion argument, and it belongs in D12.
4. **Production**: no metal powder in the mix, which simplifies the raw-material
   supply chain, the mix hazard classification and the cleanup, and helps the
   Class 1.3 certification argument of C1.11.

**What it costs, and the memo must say it:**

- **7.0 s of $I_{sp}$, 2.8 %.** That is 1.84 kg more propellant, 45 mm more
  grain, and about 1.7 kg more motor mass for the same 155 kN·s.
- **$K_n = 404$ against 336** — a more aggressive fin geometry in the same
  envelope, a thinner web, and a harder sliver problem.
- **Erosion margin against C1.4.** C2 lands at 20.7 g against C1's 21.0 g, so it
  is marginally better, but *both* rely on throat erosion to comply and C2's
  cooler, cleaner flame erodes less. This is the one place where C2's advantage
  on paper works against it, and the report should notice.
- **It is the less conventional choice** for a high-impulse sounding motor and
  will need to be defended to a customer who has bought aluminized motors for
  thirty years.

### Strongest alternative: **C1 — aluminized AP/HTPB, same case and grain concept**

It is a very strong alternative. Higher $I_{sp}$, shorter motor, higher
density-impulse, and it is the incumbent technology with the deepest supply
chain and the least qualification novelty. It complies with C1.7 (0.857) and
C1.4 (21.0 g) and, on a straight performance-per-envelope basis, it wins.

Its whole weakness is **dispersion**: $\sigma_p$ and $n$ are both higher, so
every temperature-driven quantity is worse — MEOP by 2 %, thrust ratio by 5 %,
and the cold action time at 9.04 s falls outside the C1.2 band by 0.04 s on the
nominal ballistic model, before any lot-to-lot variation is added. A programme
buying 600 motors over ten years will see lot variation; a candidate that has no
margin on the nominal will fail acceptance on some lots.

**A report that recommends C1, identifies the cold action-time exceedance, and
proposes moving the design point to $t_b = 7.8$ s to recover it, scores as
highly as one that recommends C2.** That is a real and probably better answer,
and it is precisely the kind of small design move that a trade study should
surface.

## C.3 Pugh matrix

Datum: **C1**, the aluminized composite in a wound case — the incumbent
architecture and a real candidate. Scoring −2 to +2.

| criterion | weight | justification (tied to this mission) |
|---|---|---|
| Temperature-range robustness | 18 | C1.8's −40/+60 °C drives C1.3, C1.4 and MEOP simultaneously; it is the requirement that eliminates margin everywhere else. |
| Storage, transport and certification | 14 | C1.9–C1.11: an article that cannot ship as delivered is not a candidate at any performance. |
| Performance ($I_{sp}$, impulse in envelope) | 13 | C1.1 inside C1.5 and C1.6; the envelope is fixed and small. |
| Mass fraction | 12 | C1.7 is a hard number and it eliminates two candidates outright. |
| Manufacturability and rate | 12 | 60 units/yr for ten years on one line; C1.14 is a sustained-rate requirement, not a peak. |
| Cost (UCI) | 11 | The customer stated cost matters as much as performance; unusual, and the weight should reflect that it was said out loud. |
| Reliability | 8 | 600 units; reliability is demonstrated by lot acceptance statistics, not by a single qualification. |
| Complexity | 6 | Few moving parts in any candidate; kept separate because it drives the igniter and inspection story. |
| Mission fit | 6 | Plume transparency for optical payloads, launch-site handling, interstage interface. |
| **total** | **100** | |

| criterion | w | **C1 datum** | **C2** | C3 steel | C4 cartridge | C5 hybrid |
|---|---|---|---|---|---|---|
| Temperature robustness | 18 | 0 *(π_K 0.00308; 1.360 hot/cold; cold $t_b$ 9.04 s, outside C1.2)* | **+1** *(π_K 0.00257; 1.293; 7.46–8.93 s, inside)* | 0 *(same propellant)* | −1 *(free-standing grain, different thermal soak, ends unbonded)* | **−2** *(N₂O critical at 36.4 °C; C1.8 and C1.9 both above it)* |
| Storage / certification | 14 | 0 | **0** *(same family; metal-free mix marginally simpler)* | +1 *(metal case is the easiest NDT and damage-tolerance case)* | 0 | **−2** *(pressurised, temperature-dependent, decomposition hazard)* |
| Performance | 13 | 0 *(248.5 s)* | **−1** *(241.5 s, −2.8 %)* | 0 | 0 | −1 *(245 s but cannot fit)* |
| Mass fraction | 12 | 0 *(0.857)* | **+1** *(0.862)* | **−2** *(0.775, fails C1.7)* | **−2** *(0.831, fails C1.7)* | −2 |
| Manufacturability / rate | 12 | 0 *(winding is the takt driver)* | **0** *(same route; no metal powder handling)* | +2 *(no winding line; commodity tube stock)* | +1 *(grain and case are independent lines)* | −2 *(new everything)* |
| Cost (UCI) | 11 | 0 | **0** *(cheaper mix, same case)* | +2 *(case is the dominant part and it is 4× cheaper)* | +1 | −1 |
| Reliability | 8 | 0 | **+1** *(narrower dispersion → fewer acceptance failures)* | 0 | +1 *(no case bond to fail)* | −2 *(O/F drift, blowdown, ignition)* |
| Complexity | 6 | 0 | **0** | +1 | 0 | −2 |
| Mission fit | 6 | 0 *(smoke and Al₂O₃ obscure optical payloads)* | **+2** *(clean plume)* | 0 | 0 | +1 *(shutdown capability, unused here)* |
| **weighted total** | | **0** | **+22** | **+9** | **−13** | **−87** |

C3's +9 is worth staring at: **on the weighted criteria the steel case scores
positively**, because it wins manufacturability and cost — the two things the
customer said out loud — by two full points each. It is eliminated anyway,
because C1.7 is a hard requirement and 0.775 is not 0.85. **A Pugh matrix does
not enforce compliance; the requirements table does, and the matrix is scored
only over compliant candidates.** Reports that let C3 win because it scored well
have made the classic error of treating a scoring exercise as a decision
procedure.

### C.3.1 Sensitivity and the flip

| weight varied ±50 % | flips? | at what value |
|---|---|---|
| Temperature robustness | **yes** | below **9** (from 18) the winner becomes C1 |
| Performance | **yes** | above **22** (from 13) the winner becomes C1 |
| Mission fit (plume) | no | — |
| Mass fraction | no | — |
| all others | no | — |

The decision is a two-body problem between C1 and C2 and it turns on a single
question: **is 7 s of $I_{sp}$ worth a 5 % narrower thrust dispersion across
100 K?** At the weights above, no. Move Performance from 13 to 22 — which is
what happens if the customer's altitude requirement tightens — and it becomes
yes.

**Two-criterion perturbation.** Temperature robustness 18 → 12 with Performance
13 → 19 (the trade a scientific customer makes when apogee matters more than
schedule predictability) brings C2 to +4 and C1 to 0 — still C2, but the
decision has become a coin toss and the memo must say so.

**Input perturbation, and it is the decisive one.** The tabulated $\sigma_p$
values are class values labelled [A], and real propellant $\sigma_p$ is measured
lot by lot with genuine scatter — ±15 % is not unusual [E]. Push C2's
$\sigma_p$ from 0.0018 to 0.0021 (the top of a plausible band) and its $\pi_K$
becomes 0.0030 K⁻¹, essentially identical to C1's, and **the entire basis of the
recommendation evaporates**: C2 is then a lower-$I_{sp}$ propellant with no
compensating dispersion advantage and C1 wins on every criterion that is left.

That single sentence is the most valuable output of this trade study, and it
converts directly into a programme action: **the first thing to do after
architecture selection is to measure $\sigma_p$ and $n$ on the actual candidate
propellant across the actual temperature range, on at least three mix lots,
before the grain design is frozen.** If those measurements come back at
$\sigma_p > 0.0020$, revert to C1. A recommendation with a measurable
reversal trigger is worth ten with a confident conclusion.

## C.4 Risk register (10)

| # | risk (if–then) | L | C | score | mitigation | retires at |
|---|---|---|---|---|---|---|
| C-R1 | **If** measured $\sigma_p$ on production lots exceeds 0.0020 K⁻¹, **then** C2's entire advantage over C1 disappears and the selection reverses. | 3 | 4 | 12 | Strand-burner and small-motor temperature characterisation on three mix lots before grain design freeze; hold C1 as a funded fallback until the data is in. | Three-lot $\sigma_p$/$n$ characterisation — month 5. |
| C-R2 | **If** the throat erodes less than 0.08 mm/s, **then** burnout thrust stays high, the vehicle exceeds 22 g and C1.4 fails. | 3 | 4 | 12 | Specify the insert material and density with a *two-sided* erosion tolerance; measure throat profile after every development firing; hold a small nozzle-throat oversize as the design recovery. | Throat profile measured on 3 hot firings across temperature — month 14. |
| C-R3 | **If** case-bond integrity is lost during a −54 °C storage excursion (C1.9), **then** exposed grain surface increases $A_b$, $p_c$ rises above MEOP and the case bursts on ignition. | 2 | 5 | 10 | Liner and bond-system qualification by thermal cycling to both storage limits; X-ray or CT of every unit at acceptance; bond tensile coupons from every mix lot. | Thermal-cycle bond qualification — month 18. |
| C-R4 | **If** cold ignition at −40 °C is slower than 250 ms (C1.12), **then** the vehicle leaves the rail off-nominally or chuffs. | 3 | 4 | 12 | Pyrogen igniter sized against the cold case, not the nominal; ignition testing at the cold limit *first*, not last; instrument the ignition transient with a high-rate pressure transducer. | 10 cold-conditioned ignitions — month 12. |
| C-R5 | **If** sliver fraction exceeds 3 %, **then** tail-off lengthens, action time becomes ambiguous against C1.2 and delivered $I_{tot}$ falls. | 3 | 3 | 9 | Burn-area integration of the actual fin geometry, not a 2-D approximation; measure the sliver on a cut inert grain before the first live cast. | Inert-grain cut and measurement — month 8. |
| C-R6 | **If** filament winding cannot sustain 60 cases/year on the planned mandrel count, **then** C1.14 fails on the case line regardless of the propellant line. | 3 | 4 | 12 | Takt-time analysis from the P120C winding data scaled to this diameter [P120C]; procure a second mandrel set at contract award, not at ramp; qualify a second winding cell. | Rate demonstration: 6 cases in 30 days — month 20. |
| C-R7 | *(non-technical)* **If** AP or HTPB supply is interrupted, **then** the propellant line stops and there is no substitute qualified. | 3 | 5 | 15 | Dual-source both at qualification, not after; carry 12 months of raw material; write the specification to a property envelope rather than to one supplier's product. | Second source qualified on a full mix lot — month 24. |
| C-R8 | *(non-technical)* **If** the Class 1.3 certification (C1.11) requires a change to the propellant or the packaging, **then** the qualification restarts. | 2 | 5 | 10 | Engage the certifying authority at architecture selection, not at first article; run the classification test series on the actual formulation family early. | Classification testing complete — month 16. |
| C-R9 | *(created by the recommendation)* **If** the metal-free propellant's lower flame temperature reduces throat erosion below the range assumed, **then** C1.4 compliance is lost — a risk C1 does not have, because C2 is the cleaner-burning of the two. | 3 | 4 | 12 | Measure erosion on C2 specifically; do not carry across a rate measured on an aluminized motor. Size the nozzle with the C2 erosion data or accept a small throat oversize. | C2-specific erosion data — month 14. |
| C-R10 | **If** the composite case is damaged in field handling and the damage is not detectable by visual inspection, **then** a motor with a compromised case is fired. | 3 | 5 | 15 | Impact-damage tolerance testing; a field-inspectable protective layer or a damage-indicating coating; handling fixtures specified as part of the delivered article; train the field crews and put the inspection in the launch procedure. | Damage-tolerance test series — month 22. |

## C.5 What distinguishes an A from a C on Mission C

**A C-grade report** computes total impulse, propellant mass, $A_t$ and $K_n$
for one candidate, states that composite cases are lighter than steel,
recommends the aluminized composite motor, and treats the temperature range as a
storage requirement. It usually never converts $\sigma_p$ into $\pi_K$ and
therefore never discovers that the temperature range is a *thrust* requirement.
50–64.

**A B-grade report** sizes all the candidates, converts $\sigma_p$ to $\pi_K$,
produces hot and cold chamber pressures, derives MEOP correctly, computes the
mass fraction and eliminates the steel case on it, and builds a matrix with
justified weights. It usually treats throat erosion as a one-sided loss and it
usually evaluates the hybrid qualitatively. 70–84.

**An A-grade report** does five things:

1. **It converts $\sigma_p$ to $\pi_K$ and then follows the consequence all the
   way through** — to MEOP, to case thickness, to C1.3's thrust ratio, to C1.2's
   action-time band, and to the discovery that C1's cold action time falls
   outside the requirement.
2. **It finds that C1.4 is met only because the throat erodes**, and therefore
   treats the erosion rate as a two-sided requirement on the insert rather than
   as a loss.
3. **It kills the hybrid with three numbers** — a 1.427 m oxidizer tank in a
   1.2 m envelope, a 36.4 °C critical temperature against a +71 °C storage
   requirement, and C1.16 — and does not editorialise beyond them.
4. **It notices that C3 scores positively in the matrix and is eliminated
   anyway**, and says explicitly that compliance is checked in the requirements
   table and not in the Pugh matrix.
5. **It states the measurement that would reverse its own recommendation**,
   with the number ($\sigma_p > 0.0020$ K⁻¹) and the schedule point (before
   grain design freeze). 88–96.

## C.6 The ten most common errors on Mission C

1. **Never computing $\pi_K$.** $\sigma_p$ is a burn-rate sensitivity; the
   chamber pressure moves by $\sigma_p/(1-n)$, which is 1.4–1.5 times larger.
   Reports that apply $\sigma_p$ directly to $p_c$ under-predict the hot case by
   about 4 % and then size the case to it.
2. **Sizing MEOP from the nominal chamber pressure.** MEOP is a hot-conditioned,
   transient-and-dispersion-loaded number. Sizing the case at 7.0 MPa instead of
   8.68 MPa understates the wall by 24 % and the whole mass-fraction table with
   it.
3. **Computing peak acceleration at ignition.** It is at burnout, on the hot
   case, after erosion. Getting it at ignition understates it by about 60 %.
4. **Treating throat erosion as purely a loss.** On this motor it is the only
   reason C1.4 closes. A one-sided "minimise erosion" statement is the tell.
5. **Confusing mass fraction with performance.** C2 has the lower $I_{sp}$ *and*
   the higher mass fraction, and both statements are correct. C1.7 constrains
   inert mass in an envelope, not delivered impulse.
6. **Dismissing the hybrid in a sentence.** C-G7 requires an evaluation. The
   oxidizer-tank length and the N₂O critical temperature are two lines of
   arithmetic and they are worth full marks; an assertion is worth none.
7. **Letting a non-compliant candidate win the matrix.** C3 scores +9 and fails
   C1.7. Compliance is a gate, the matrix is a comparison among survivors, and
   confusing the two is the most consequential process error in the mission.
8. **Never closing the ballistic loop.** Computing $K_n$ from $A_b/A_t$ and not
   feeding it back through the equilibrium-pressure relation means the $a$,
   $\rho_p$, $c^*$ and $K_n$ you report may be mutually inconsistent, and
   nobody — including you — will know.
9. **Sizing $\varepsilon$ for vacuum on a ground-launched motor.** At
   $\varepsilon = 8$ this motor is slightly underexpanded at lift-off, which is
   correct; sizing it for vacuum adds nozzle mass, adds length inside a 1,200 mm
   envelope, and risks separation at ignition for a gain the 8 s burn never
   collects.
10. **Writing a rate argument as an assertion.** C1.14 asks for 60 units a year
    sustained on one line. "The architecture supports the rate" is worth nothing;
    a takt-time argument naming the winding cell, the mix batch size and the cure
    oven cycle, with the step that saturates first, is worth the marks and is the
    answer to the third memo question.

---

## Closing note for the grader

Across all three missions the same four failures recur, and they are worth more
than any individual calculation:

1. **Sizing only the preferred candidate.** Every mission here has a candidate
   that is eliminated by arithmetic — A5's battery, B3's and B5's arrival mass,
   C3's and C5's mass fraction and envelope — and in every case the elimination
   is the most valuable page in the report.
2. **Stopping one step short of the consequence.** Heat flux without wall
   gradient. $\sigma_p$ without $\pi_K$. Δv without residuals. Exit diameter
   never checked at all. The step that is skipped is almost always the one that
   turns a number into a decision.
3. **A matrix that agrees with the author.** If the recommendation wins
   everywhere, the analysis stopped before the trade began. All three reference
   solutions above recommend an architecture that loses on at least three
   criteria, and two of the three recommend against the raw matrix result and
   say why.
4. **No reversal trigger.** A recommendation without a measurable condition that
   would change it is an opinion. The three triggers in this key —
   $\eta_{c^*} < 0.9575$ for Mission A, a 55 % reduction in cryogenic thermal
   mass for Mission B, $\sigma_p > 0.0020$ K⁻¹ for Mission C — are what make the
   three recommendations engineering rather than preference.
