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
