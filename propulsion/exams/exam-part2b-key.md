# Part II Exam B — Liquid Engine Systems: Answer Key and Grading Rubric

Full worked solutions for [`exam-part2b.md`](exam-part2b.md). Every step carries
units. Every multiple-choice distractor is explained. Every question carries a
rubric.

All numbers below were computed with `tools/rocket.py` and are registered in
`tools/examples/exam-part2b.py`; run `python3 tools/check_examples.py` to
recompute them. Steps whose arithmetic is not a single library call are written
out in the header of that file so they can be re-checked by hand.

**Constants.** $g_0 = 9.80665\ \mathrm{m/s^2}$,
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$, $p_a = 101\,325$ Pa at sea level.

**General grading rule** (course README): calculation questions are graded on
method first. A correct setup with an arithmetic slip loses at most 30 % of the
marks for that part. A correct number obtained from a wrong setup scores zero.
Missing units cost 1 mark per question, once, not per line. Quoting a contested
or company-claimed engine figure without its caveat costs 1 mark wherever the
question asked for the comparison.

---

# Section A — Feed systems and turbopumps (25 points)

## A1 — Multiple choice (4 points)

**Answer: (b).**

Two similarity groups do all the work. Hold specific speed
$N_s = \omega\sqrt{Q}/(g_0H)^{3/4}$ fixed. Scaling thrust by $s = 1/4$ at
constant $p_c$ scales every flow by $s$ but leaves **every head unchanged**,
because each term of the pressure budget ($p_c$, $\Delta p_{inj}$,
$\Delta p_{jacket}$, line losses) is unchanged. Therefore

$$\omega \propto Q^{-1/2} \propto s^{-1/2} = 2,\qquad
D \propto \omega^{-1} \propto s^{1/2} = \tfrac12$$

(the second from $H \propto N^2D^2$ at fixed $H$). Tip speed
$u_2 = \omega D/2$ is then **unchanged** — as it must be, since
$u_2 = \sqrt{g_0H/\psi}$ and neither $H$ nor $\psi$ moved.

The second group is suction specific speed, $N_{ss} = \omega\sqrt{Q}/(g_0\,\mathrm{NPSH})^{3/4}$.
Here $\omega\sqrt{Q} \to (s^{-1/2}\omega)\sqrt{sQ} = \omega\sqrt{Q}$ — **exactly
invariant** — so NPSH$_r$ does not move either.

**Implication for a small vehicle.** Tank pressure, pressurant mass, boost-pump
requirement and NPSH margin are *fixed* requirements that do not shrink with the
vehicle, so on a small stage they are a larger fraction of a smaller dry mass.
That is one of the structural reasons small launchers have worse mass fractions
than large ones — and one of the reasons Rocket Lab put electric motors on
Rutherford, decoupling pump speed from a turbine [engine-database A.3].

**Why each distractor is wrong.**

- **(a)** Gets the speed and diameter right and then asserts that tip speed and
  NPSH follow the size. They do not: $u_2 = \omega D/2$ is a product of a factor
  of 2 and a factor of $\tfrac12$. This is the most attractive wrong answer
  because it matches the intuition that "small parts are less stressed", and the
  intuition is wrong here.
- **(c)** Reverses the direction of the speed scaling. Small pumps spin *faster*
  ($\omega \propto s^{-1/2}$); the record is unambiguous — F-1 at 6770 kN runs
  5488 rpm, RD-0146 at 68.6 kN runs above 120 000 rpm [engine-database].
- **(d)** Invents a scaling in which everything moves together. NPSH does not
  scale with thrust at all; it scales with $\omega\sqrt{Q}$, which is the whole
  point of the question.

### Rubric (4)

| | |
|---|---|
| 2 | correct choice (b) |
| 1 | justification invoking $N_s$ constant with $H$ unchanged, giving $\omega \propto s^{-1/2}$ and $D \propto s^{1/2}$, hence $u_2$ invariant |
| 1 | notes $\omega\sqrt{Q}$ invariant $\Rightarrow$ NPSH$_r$ invariant, and draws the dry-mass-fraction conclusion |
| −1 | choosing (b) but justifying it with an argument that actually supports (a) |

---

## A2 — Pressure budget → head → power → NPSH (13 points)

### (a) Discharge pressures, pressure rise, head (3)

Sum the budget backwards from the injector face [SP-8107]:

| | fuel (LCH$_4$) | oxidiser (LOX) |
|---|---|---|
| $p_{c,\mathrm{inj}}$ | 90.0 bar | 90.0 bar |
| injector $\Delta p$ | 18.0 | 18.0 |
| jacket $\Delta p$ | 25.0 | — |
| lines + valves | 4.0 | 4.0 |
| **pump discharge** | **137.0 bar** | **112.0 bar** |
| pump inlet | 3.5 | 4.0 |
| **$\Delta p_p$** | **133.5 bar** | **108.0 bar** |

$$H_f = \frac{\Delta p_f}{\rho_f g_0} = \frac{1.335\times10^7\ \mathrm{Pa}}{423\ \mathrm{kg/m^3}\times9.80665\ \mathrm{m/s^2}} = \mathbf{3218\ m}$$

$$H_o = \frac{\Delta p_o}{\rho_o g_0} = \frac{1.080\times10^7}{1141\times9.80665} = \mathbf{965.2\ m}$$

**The fuel pump makes 3.33 times the head while moving 29 % of the mass**, for
two independent reasons: methane is **2.70 times less dense** than LOX, so the
same $\Delta p$ costs 2.70 times the head; **and** the fuel side carries the
25 bar regenerative jacket that the oxidiser side does not. Either alone would
make the fuel pump the harder machine; together they are the reason single-shaft
pumps on a cryogenic pair are hard.

### (b) Volumetric flow, power, and W/N (4)

$$Q_f = \frac{26.50}{423} = 6.2648\times10^{-2}\ \mathrm{m^3/s},\qquad
Q_o = \frac{91.50}{1141} = 8.0193\times10^{-2}\ \mathrm{m^3/s}$$

$$P_f = \frac{\dot m_f\,\Delta p_f}{\rho_f\eta_{p,f}} = \frac{26.50\times1.335\times10^7}{423\times0.68} = \mathbf{1.2299\ MW}$$

$$P_o = \frac{91.50\times1.080\times10^7}{1141\times0.74} = \mathbf{1.1704\ MW}$$

$$P_{\text{pump,total}} = \mathbf{2.4003\ MW}, \qquad
\frac{P}{F_{SL}} = \frac{2.4003\times10^6\ \mathrm{W}}{3.50\times10^5\ \mathrm{N}} = \mathbf{6.858\ W/N}$$

Note the near-parity of the two powers (51 % / 49 %) despite a 3.33:1 head ratio:
the oxidiser pump moves 3.45 times the mass. Students who assume "the high-head
pump takes the power" get this backwards.

**Comparison with the record** [engine-database]:

| engine | shaft power | $F_{SL}$ | W/N | $p_c$ |
|---|---|---|---|---|
| F-1 | 41 MW (55 000 bhp) | 6770 kN | **6.06** | ≈70 bar `inj` |
| MB-350 | 2.400 MW | 350 kN | **6.86** | 90 bar |
| Merlin 1D | ~7.5 MW (10 000 hp) | 845 kN | **8.88** | 97 bar `n.s.` |

MB-350 sits between them and in the right order — pump power per newton rises
with chamber pressure, as Eq. 3.3 of Module 13 requires ($P \propto F\times p_c$).

**The caveats, which the question asked for.** The Merlin 1D turbopump power and
speed are **company figures at medium confidence**, and its 97 bar chamber
pressure is a **claim** whose pressure station is **not stated** (`n.s.`); it may
be injector-end or nozzle-stagnation, and those differ by a few per cent. The
F-1's chamber pressure is itself **contested** across four published values
(965 / 982 / 1015 / 1125 psia, database note A.2.2), though its 41 MW and
6770 kN are high-confidence. Quoting 8.88 W/N for Merlin to four figures as if
it were measured is the error to avoid.

### (c) Specific speed (3)

$\omega = 2\pi\times 25\,000/60 = 2618.0$ rad/s.

$$N_{s,f} = \frac{\omega\sqrt{Q_f}}{(g_0H_f)^{3/4}}
= \frac{2618.0\times\sqrt{6.2648\times10^{-2}}}{(9.80665\times3218)^{3/4}}
= \frac{655.2}{2367.6} = \mathbf{0.2767}$$

$$N_{s,o} = \frac{2618.0\times\sqrt{8.0193\times10^{-2}}}{(9.80665\times965.2)^{3/4}}
= \frac{741.4}{959.6} = \mathbf{0.7726}$$

- **Oxidiser pump, $N_s = 0.773$:** squarely in the 0.3–0.8 radial-centrifugal
  band. **One stage is right.**
- **Fuel pump, $N_s = 0.277$:** **below the usable band.** At this specific speed
  the impeller wants passages so narrow that disc friction dominates and the
  assumed $\eta_p = 0.68$ is optimistic. The fix is to split the head across two
  stages, which raises $N_s$ by $2^{3/4} = 1.682$:

$$N_{s,f}(\text{2 stages}) = \frac{2618.0\sqrt{6.2648\times10^{-2}}}{(9.80665\times1609)^{3/4}} = \mathbf{0.4654}$$

which is comfortably inside the band. This is the whole reason high-head fuel
pumps are multistage — the RS-25 HPFTP is a three-stage centrifugal machine for
exactly this reason [engine-database].

### (d) NPSH (3)

$$\mathrm{NPSH_a} = \frac{p_t - p_v - \Delta p_{\text{line}}}{\rho g_0} + z\frac{a}{g_0}
= \frac{(3.20 - 1.36 - 0.30)\times10^{5}}{1141\times9.80665} + 5.50\times1.50$$

$$= 13.76\ \mathrm{m} + 8.25\ \mathrm{m} = \mathbf{22.01\ m}$$

The static column contributes 37 % of it and **disappears as the tank drains**;
the pressurisation term is the only part you can rely on at burnout.

$$\mathrm{NPSH_r} = \frac{1}{g_0}\left(\frac{\omega\sqrt{Q_o}}{N_{ss}}\right)^{4/3},
\qquad \omega\sqrt{Q_o} = 741.4$$

| architecture | $N_{ss}$ | NPSH$_r$ |
|---|---|---|
| plain impeller, no inducer | 2.5 | **201.7 m** |
| impeller + modest inducer | 4.0 | 107.8 m |
| impeller + good rocket inducer | 8.0 | **42.76 m** |

**No. The pump cannot run at 25 000 rpm.** Even a good rocket inducer needs
42.76 m and only 22.01 m is available — the required suction specific speed is

$$N_{ss,\text{req}} = \frac{741.4}{(9.80665\times22.01)^{3/4}} = 13.16$$

which is above anything demonstrated outside hydrogen service with thermodynamic
credit [SP-8052][Brennen-Pumps]. Three honest fixes: **(i)** slow the shaft —
holding $N_{ss} = 8$ gives $\omega_{\max} = 8(g_0\,\mathrm{NPSH_a})^{3/4}/\sqrt{Q_o}
= 1591.0$ rad/s = **15 193 rpm**, which then throws the fuel pump's $N_s$ down to
0.169 and forces multistaging; **(ii)** raise the LOX tank to
$p_t = 5.52$ bar, at a real tank-mass and pressurant cost; **(iii)** fit a
low-pressure **boost pump**, which is what large engines actually do. Note also
that a self-pressurised (autogenous) LOX tank with $p_t = p_v$ would give
NPSH$_a$ = 5.57 m and no architecture at all would close.

### Rubric (13)

| | |
|---|---|
| 3 | (a) both discharge pressures and both heads correct; the two-cause explanation (density *and* jacket) |
| 4 | (b) both $Q$, both powers, total and W/N; database comparison **with** the Merlin claim / F-1 contested-$p_c$ caveats (1 of the 4 is for the caveat) |
| 3 | (c) both $N_s$; correct verdict on each; the $2^{3/4}$ two-stage result |
| 3 | (d) NPSH$_a$ split into its two terms; all three NPSH$_r$; explicit "does not close" verdict with a fix |
| −1 | using rpm instead of rad/s in $N_s$ or $N_{ss}$ without converting (this gives numbers 2733× too large) |
| −1 | quoting the Merlin or F-1 figure without its caveat |

---

## A3 — Euler equation derivation and hydraulic check (8 points)

### (a) The derivation (4)

Take a control volume enclosing the impeller, with steady axisymmetric flow in
and out. The **only** way the shaft can do work on the fluid is by exerting a
torque, and the torque equals the rate at which the through-flow's angular
momentum changes:

$$T = \dot m\,(r_2 c_{u2} - r_1 c_{u1})$$

Shaft power is torque times angular velocity:

$$P = T\omega = \dot m\,\omega\,(r_2c_{u2} - r_1c_{u1}) = \dot m\,(u_2c_{u2} - u_1c_{u1})$$

using $u = \omega r$ for the blade speed at each radius.

Head is defined as energy per unit **weight** of fluid, so divide the power by
the weight flow $\dot m g_0$:

$$H_{\mathrm{Euler}} = \frac{P}{\dot m g_0} = \frac{u_2c_{u2} - u_1c_{u1}}{g_0}$$

With a plain axial inlet there is **no pre-whirl**, $c_{u1} = 0$, and

$$\boxed{\;H_{\mathrm{Euler}} = \frac{u_2c_{u2}}{g_0}\;}$$

**Assumptions.** Steady flow; axisymmetric and uniform velocity profiles at
inlet and exit (so a single $c_u$ represents each station); all shaft work goes
into the angular momentum of the through-flow — no disc friction on the impeller
back face, no leakage recirculating past the front shroud, no heat transfer;
$c_{u1} = 0$, which requires a purely axial approach with no inlet guide vanes
and no inducer imparting swirl. An inducer *does* impart swirl, and the $u_1c_{u1}$
term must then be carried.

**Which fluid property appears:** *none*. The result contains only velocities.
A pump therefore develops the same **head** on hydrogen as on oxygen at the same
speed and geometry — and therefore, since $\Delta p = \rho g_0 H$, about
**one sixteenth** of the pressure rise on LH$_2$ ($\rho \approx 71$) that it makes
on LOX ($\rho \approx 1141$).

**Consequence for a single-shaft LOX/LH$_2$ turbopump:** the two pumps need
wildly different heads at the same discharge pressure, so on one shaft either
the hydrogen side is multistage and enormous or the oxygen side is grossly
over-speeded for its suction limit. That is why hydrogen engines put the two
pumps on separate shafts (RS-25: four pumps, two shafts) or accept a gearbox
(RL10) [engine-database].

### (b) Tip speed and diameter (2)

$$u_2 = \sqrt{\frac{g_0H_o}{\psi}} = \sqrt{\frac{9.80665\times965.2}{0.52}} = \mathbf{134.9\ m/s}$$

$$D_2 = \frac{2u_2}{\omega} = \frac{2\times134.92}{2618.0} = 0.10307\ \mathrm{m} = \mathbf{103.1\ mm}$$

134.9 m/s is comfortably inside the 150–250 m/s band quoted for LOX and
hydrocarbon stages, where the limit is rub-ignition risk rather than disc stress
[SP-8109].

### (c) Euler cross-check (2)

$$c_{m2} = \frac{Q_o}{\pi D_2 b_2} = \frac{8.0193\times10^{-2}}{\pi\times0.10307\times0.01400} = \mathbf{17.69\ m/s}$$

$$\phi = \frac{c_{m2}}{u_2} = \frac{17.69}{134.92} = \mathbf{0.1311}\quad
(\text{inside the 0.08–0.20 band } \checkmark)$$

$$c_{u2} = \sigma u_2 - \frac{c_{m2}}{\tan\beta_2}
= 0.86\times134.92 - \frac{17.69}{\tan 26.0°} = 116.03 - 36.27 = \mathbf{79.76\ m/s}$$

$$H_{\mathrm{Euler}} = \frac{u_2c_{u2}}{g_0} = \frac{134.92\times79.76}{9.80665} = \mathbf{1097\ m}$$

$$\eta_h = \frac{H_o}{H_{\mathrm{Euler}}} = \frac{965.2}{1097.3} = \mathbf{0.8796}$$

**Feasible.** An 88.0 % hydraulic efficiency against an assumed 74 % overall is
the right relationship: the remaining ~16 points are volumetric (wear-ring and
balance-piston leakage) and mechanical (disc friction, bearings, seals).

**If $\eta_h$ had come out above unity** the design would be infeasible — the
blade row would be being asked to deliver more head than Euler allows — and the
responses, in order of cheapness, are: more tip speed (raise $\psi$ target or
$D_2$), less backsweep (raise $\beta_2$ toward radial, at the cost of a rising
$H$–$Q$ curve and instability at low flow), or more blades (raises $\sigma$).

### Rubric (8)

| | |
|---|---|
| 2 | (a) angular-momentum → power → head chain, each step justified |
| 1 | (a) assumptions listed, including explicitly why $c_{u1}=0$ |
| 1 | (a) "no fluid property appears" + the single-shaft LOX/LH$_2$ consequence |
| 2 | (b) $u_2$ and $D_2$ |
| 2 | (c) $c_{m2}$, $\phi$, $c_{u2}$, $H_{\text{Euler}}$, $\eta_h$, verdict, and the remedy if $\eta_h>1$ |
| −2 | "it can be shown that" in place of the derivation |

---

# Section B — Engine cycles (25 points)

## B1 — Multiple choice (4 points)

**Answer: (c) — oxidiser-rich staged combustion.** (The engine is the RD-180.)

Three independent pieces of evidence agree. **First**, 267 bar is far above the
open-cycle ceiling: the highest flown gas-generator chamber pressure is about
120 bar (Vulcain 2.1), because in an open cycle the turbine exhausts near ambient
and the drive-flow penalty grows with $p_c$ faster than the performance gained.
**Second**, no dump duct means nothing is thrown overboard, so the cycle is
closed. **Third**, the propellant decides *which* closed cycle: a kerosene
preburner run fuel-rich at the flow a 4 MN engine needs would coke and foul the
turbine, which is precisely why Soviet practice went oxidiser-rich and developed
the burn-resistant coatings that make it survivable [engine-database A.4].

**The caveat before comparing 267 bar with the RS-25's 206.4 bar.** The two
numbers are quoted at **different stations**. Soviet/Russian practice quotes
**nozzle-stagnation** pressure; the RS-25's 206.4 bar is quoted **injector-end**
(`inj`), which is a few per cent *higher* than its own nozzle-stagnation value.
Comparing them directly therefore **overstates** the RD-180's advantage
[engine-database "How to read this table"; A.2 notes].

**Why each distractor is wrong.**

- **(a) gas generator.** The $I_{sp}$ argument is backwards: 338 s vacuum for
  kerolox at 267 bar is *high*, not low — Merlin 1D manages 311 s at 97 bar. And
  a gas-generator engine has a dump duct, which the photograph does not show.
  This distractor catches students who treat "$I_{sp}$ below ideal" as evidence
  of a cycle loss when it is mostly nozzle and combustion efficiency.
- **(b) fuel-rich staged combustion.** Gets the "closed cycle" half right and the
  propellant half wrong. FRSC is a **hydrogen** technology; hydrogen is a
  wonderful preburner fuel because it does not coke. There is no flown fuel-rich
  staged-combustion kerosene engine, and the reason is chemistry, not preference.
- **(d) closed expander.** Two fatal problems. Kerosene is not a usable expander
  working fluid — it cokes in the jacket well before it reaches useful turbine
  inlet enthalpy — and the closed expander's chamber pressure is *capped* by the
  heat-pickup-versus-thrust scaling at 30–60 bar, an order below 267 bar. The
  "no duct ⇒ closed" step is sound; the conclusion drawn from it is not.

### Rubric (4)

| | |
|---|---|
| 2 | correct choice (c) |
| 1 | justification naming **both** the pressure ceiling and the fuel-rich-coking reason for ox-rich |
| 1 | the pressure-station caveat, stated in the correct direction (RS-25 `inj` is the higher station) |

---

## B2 — Gas-generator flow fraction and $I_{sp}$ penalty (12 points)

### (a) Drive-gas properties and turbine specific work (3)

$$R_t = \frac{R_u}{\mathcal{M}_t} = \frac{8314.46}{17.5} = \mathbf{475.1\ J/(kg\,K)}$$

$$c_{p,t} = \frac{\gamma_t R_t}{\gamma_t - 1} = \frac{1.24\times475.11}{0.24} = \mathbf{2455\ J/(kg\,K)}$$

$$\pi_t^{-(\gamma_t-1)/\gamma_t} = 22.0^{-0.193548} = 0.5104$$

$$\Delta h_{is} = c_{p,t}T_t\left[1 - \pi_t^{-(\gamma_t-1)/\gamma_t}\right]
= 2454.7\times1000\times0.48959 = \mathbf{1.1052\ MJ/kg}$$

$$w_t = \eta_t\,\Delta h_{is} = 0.62\times1.1052\times10^6 = \mathbf{6.852\times10^5\ J/kg}$$

### (b) Drive flow and flow fraction (3)

From A2(b), $P_{\text{pump}} = 2.4003$ MW, so the turbine must deliver

$$P_{\text{shaft}} = \frac{P_{\text{pump}}}{\eta_m} = \frac{2.4003}{0.98} = \mathbf{2.4493\ MW}$$

$$\dot m_t = \frac{P_{\text{shaft}}}{w_t} = \frac{2.4493\times10^{6}}{6.8523\times10^{5}} = \mathbf{3.574\ kg/s}$$

$$\dot m_{\text{total}} = 118.00 + 3.574 = \mathbf{121.57\ kg/s},\qquad
f_{gg} = \frac{3.574}{121.57} = \mathbf{2.940\ \%}$$

That sits inside the 2–5 % band the cycle occupies, and near its efficient end.
Cross-check against the record: the J-2 dumped "2–3 % of propellant"
[_verify-liquid].

### (c) $I_{sp}$ penalty, two ways (3)

**Dump produces no thrust** (the pessimistic bound):

$$I_{sp} = 327.0\times\frac{118.00}{121.57} = \mathbf{317.4\ s}
\quad\Rightarrow\quad \Delta I_{sp} = \mathbf{9.61\ s}$$

**Dump nozzle at 115 s:**

$$I_{sp} = \frac{118.00\times327.0 + 3.574\times115.0}{121.57}
= \frac{38\,586 + 411.0}{121.57} = \mathbf{320.8\ s}
\quad\Rightarrow\quad \Delta I_{sp} = \mathbf{6.23\ s}$$

**The 115 s figure is the honest one for a booster engine.** The exhaust is
physically going through a nozzle and producing measurable thrust; a first-stage
engine's dump duct is at sea level where the small nozzle still works, and the
F-1 went further and routed its gas-generator exhaust into the nozzle extension
as a film-cooling curtain, recovering part of the loss twice over
[engine-database]. The no-thrust number is the right bound only if the exhaust
is vented normal to the thrust axis or used purely as a roll-control actuator.
Either way, **6.2 s (1.9 %) is the entire open-cycle penalty**, and it is what a
staged-combustion cycle spends its complexity to recover.

### (d) Raising turbine inlet temperature to 1200 K (3)

$$w_t = 0.62\times2454.7\times1200\times0.48959 = \mathbf{8.223\times10^5\ J/kg}$$

$$\dot m_t = \frac{2.4493\times10^6}{8.2228\times10^5} = \mathbf{2.979\ kg/s},\qquad
\dot m_{\text{total}} = 120.98\ \mathrm{kg/s},\qquad f_{gg} = \mathbf{2.462\ \%}$$

$$I_{sp} = \frac{118.00\times327.0 + 2.979\times115.0}{120.98} = \mathbf{321.8\ s}$$

**Gain: 1.01 s** — one third of one per cent.

**Two independent reasons not to do it:**

1. **Turbine metallurgy.** 1200 K is at or above the uncooled-blade limit for a
   wrought superalloy; Inconel 718's $\gamma''$ strengthening phase overages
   above about 925 K, and holding stress at 1200 K puts the blade squarely in the
   creep regime (Module 16 §3.2.3). You would be buying 1 s of $I_{sp}$ with
   cast or single-crystal blades, a cooling scheme, or a life limit.
2. **Gas-generator mixture ratio and free oxygen.** Raising $T_t$ at fixed
   propellants means running the gas generator less fuel-rich. As $MR_{gg}$
   climbs, free oxygen appears in the drive gas and begins attacking the turbine
   nozzle and blades — the failure mode is oxidation and burn-through, not creep,
   and it is not fixed by a better alloy.

**The quantity to compute** for whether reason 2 binds: the **gas-generator
mixture ratio required to reach 1200 K**, and from it the equilibrium free-O$_2$
(and free-CO) mole fraction in the drive gas at that $MR$ and pressure — a CEA
run (Module 04). If the products are still comfortably fuel-rich with no free
oxygen at 1200 K, reason 2 does not bind and only reason 1 remains.

### Rubric (12)

| | |
|---|---|
| 3 | (a) $R_t$, $c_{p,t}$, $\Delta h_{is}$, $w_t$, with the exponent $-(\gamma-1)/\gamma$ right |
| 3 | (b) $\eta_m$ applied in the correct direction (power **up**, not down); $\dot m_t$; $f_{gg}$ computed on **total** flow, not main-chamber flow; comparison to the 2–5 % band |
| 3 | (c) both $I_{sp}$ values and both penalties; reasoned choice of the 115 s case with a real justification |
| 3 | (d) all four recomputed numbers; two *independent* reasons; the CEA / $MR_{gg}$ answer to the last part |
| −1 | dividing by $\eta_m$ the wrong way (giving 2.352 MW) |
| −1 | computing $f_{gg} = \dot m_t/\dot m_{\text{main}}$ (3.03 %) instead of on total flow |

---

## B3 — Cycle selection for a methalox upper stage (9 points)

### (a) What each cycle exploits and what limits it (2)

Reading Eq. 3.3, $\eta_t\dot m_t c_pT_t[1-\pi_t^{-(\gamma-1)/\gamma}] = \sum P_{\text{pump}}/\eta_m$:

| cycle | exploits | limited by |
|---|---|---|
| **A** gas generator | large $\pi_t$ (15–40) with a tiny $\dot m_t$ | the drive flow is dumped — a direct $I_{sp}$ loss that grows with $p_c$ |
| **B** closed expander | the whole fuel flow as $\dot m_t$ | $T_t$ comes only from wall heat pickup, which scales as chamber **area** while pump power scales as thrust — a hard ceiling on $p_c$ and on thrust |
| **C** expander bleed | a modest $\dot m_t$ at large $\pi_t$, heated in a dedicated jacket segment | still an open cycle: a small but real $I_{sp}$ penalty, and jacket heat still caps $T_t$ |
| **D** ORSC | the whole oxidiser flow as $\dot m_t$ at high $T_t$ | preburner, hot-gas manifold and oxygen-compatible metallurgy — a development, not a design, problem |

### (b) Flight record (1)

| cycle | flown $p_c$ | flown engine |
|---|---|---|
| A gas generator | 15–120 bar | Vulcain 2, HM7B, Merlin 1D |
| B closed expander | 33–60 bar | RL10A-3-3A (32.8 bar), Vinci (60 bar) |
| C expander bleed | 36–100 bar | LE-5B (35.8 bar), LE-9 (100 bar) |
| D ORSC | 140–267 bar | RD-180 (267 bar `noz`), BE-4 (140 bar `n.s.`) |

**Thin record to declare:** there is **no flown methane expander of either kind**.
Every expander in the list is hydrogen. Methane's specific heat is about a fifth
of hydrogen's and its coking limit sits near 700–800 K, so the hydrogen expander
record does **not** transfer, and any expander answer here is an extrapolation.

### (c) Recommendation (4)

**Recommend (A), the gas generator.** The reasoning, requirement by requirement:

- **Restart × 5 after 6 h coasts.** A gas generator restarts easily given a start
  source, and the company has flown one. An expander restarts on tank head, which
  is *better*; ORSC restart is possible (BE-4 uses a head-pressure start) but is
  the hardest of the four to develop. Advantage: B/C, then A, then D.
- **40 % throttle.** Gas generators throttle well over 40–100 %, and the drive
  flow is a free control variable. Expander bleed is the best deep throttler
  (LE-5B: 3–100 %); a **closed** expander throttles poorly because reducing flow
  reduces heat pickup, which reduces pump power, which reduces flow — the loop
  is a self-reinforcing shutdown. Advantage: C, then A.
- **3000 s / 12 cycles life.** Undemanding for any of the four. Not a
  discriminator.
- **380 kg dry mass at 250 kN.** That is a T/W of 67:1, which is achievable for a
  gas generator or an expander at moderate $p_c$ (RL10B-2 sits at ≈37:1 with a
  huge extension; Vinci at 64:1) but demands a fairly aggressive design in any
  cycle. Not a strong discriminator either.
- **First flight in four years, no preburner experience.** This **kills (D)**.
  An ORSC preburner and its oxygen-compatible hot-gas path is a decade-scale
  capability build; every programme that has done it (Glushko's bureau, Blue
  Origin) took far longer than four years from a standing start.
- **Vacuum only, $\varepsilon = 90$.** The one argument that *favours* an
  expander: an upper stage in vacuum sees the full cycle penalty with nothing to
  recover it against, and vacuum $I_{sp}$ is the currency.

**The number that decides it.** Size the closed expander (B) against its own
power balance. At 250 kN and, say, $p_c = 55$ bar, the pumps must raise
LOX/LCH$_4$ by roughly $1.5p_c \approx 83$ bar; at $MR = 3.4$,
$\dot m \approx 79$ kg/s ($\dot m_f \approx 18$ kg/s,
$\dot m_o \approx 61$ kg/s), giving $H_f \approx 2000$ m and
$H_o \approx 740$ m, so

$$P_{\text{pump}} \approx \frac{18\times8.3\times10^6}{423\times0.70} + \frac{61\times8.3\times10^6}{1141\times0.72}
\approx 0.50 + 0.62 \approx 1.1\ \mathrm{MW}$$

The methane side must supply that from a jacket temperature rise. With
$c_p \approx 3500$ J/(kg·K) for supercritical methane and $\eta_t \approx 0.7$ at
a closed-cycle $\pi_t \approx 1.5$, the specific work available is roughly
$\eta_t c_p T_t[1-1.5^{-0.25}] \approx 0.7\times3500\times T_t\times0.096
\approx 235\,T_t$ J/kg. Covering 1.1 MW with 18 kg/s therefore needs
$T_t \approx 260$ K **above** the pump discharge temperature — plausible on paper,
but it sits close to the point where methane coking (700–800 K bulk) and the
$q''\propto$ area scaling take the margin away, and **there is no flown methane
expander to calibrate the estimate against.** That is an unquantified risk on a
four-year schedule.

**So: gas generator.** It costs about 5–8 s of vacuum $I_{sp}$, it is the cycle
the team has flown, it restarts and throttles adequately, and it will make the
date. Buy back the $I_{sp}$ with expansion ratio and nozzle contour, which are
Module 09 problems and cheap by comparison.

### (d) Strongest objection, answer, and the information wanted (2)

**Strongest objection.** On an *upper* stage the cycle penalty is pure loss —
there is no ambient recovery, no film-cooling reuse, and every second of $I_{sp}$
multiplies through the rocket equation over the whole burn. A 6 s penalty on a
330 s engine is 1.8 %, which on a high-$\Delta v$ upper stage is worth several
per cent of payload. Choosing an open cycle for an upper stage is exactly the
place where the argument is weakest.

**Answer.** True, and the answer is to shrink the penalty rather than to change
the cycle. The penalty scales with the pump power that must be paid for, i.e.
with $p_c$. An upper stage does not need a high chamber pressure — its nozzle can
be large because there is no base-area constraint and no sea-level operation.
Design at 55–70 bar instead of 120, and $f_{gg}$ falls roughly in proportion,
taking the penalty toward 3–4 s. Route the dump through a nozzle-wall duct for
partial recovery. That gets most of the closed-cycle benefit without the
closed-cycle programme.

**The one piece of information I would most want:** a **measured coking limit
and heat-transfer correlation for supercritical methane in a representative
channel at representative wall temperature and flux**. That single dataset
decides whether (B) or (C) is real for methane, and it is the only thing that
would reverse the recommendation.

### Rubric (9)

| | |
|---|---|
| 2 | (a) all four rows, each naming a term of Eq. 3.3 and a distinct limit |
| 1 | (b) pressure bands and engines correct; **explicitly flags that no methane expander has flown** |
| 4 | (c) a clear recommendation; every one of the six requirements addressed by name; at least one number computed on the spot; the schedule/experience argument used to eliminate (D) |
| 2 | (d) an objection that is genuinely the strongest available (upper-stage $I_{sp}$ is the right one), an answer that engages with it quantitatively, and a decision-relevant piece of information |

**What loses marks.** Recommending (D) on performance grounds without addressing
the four-year schedule and the absence of preburner experience — the performance
case for ORSC is real and it is not the question asked. Recommending (B) without
noticing that no methane expander has flown. Listing the requirements without
saying which of them the recommendation *fails* — a recommendation that claims to
win on every axis is not a trade study.

---

# Section C — Valves, plumbing and combustion instability (25 points)

## C1 — Main oxidiser valve and closure surge (10 points)

### (a) $C_v$, $K_v$, $C_dA$ (3)

$$Q = \frac{\dot m_o}{\rho} = \frac{91.50}{1141} = 8.0193\times10^{-2}\ \mathrm{m^3/s}
= 288.7\ \mathrm{m^3/h} = 1271\ \mathrm{US\ gpm}$$

$$SG = \frac{1141}{999} = 1.1421,\qquad
\Delta p = 0.30\ \mathrm{bar} = 3.000\times10^4\ \mathrm{Pa} = 4.351\ \mathrm{psi}$$

$$C_v = Q_{[\mathrm{gpm}]}\sqrt{\frac{SG}{\Delta p_{[\mathrm{psi}]}}}
= 1271.1\sqrt{\frac{1.1421}{4.3511}} = \mathbf{651.2}$$

$$K_v = Q_{[\mathrm{m^3/h}]}\sqrt{\frac{SG}{\Delta p_{[\mathrm{bar}]}}}
= 288.69\sqrt{\frac{1.1421}{0.30}} = \mathbf{563.3}
\qquad\left(\frac{C_v}{K_v} = 1.156\ \checkmark\right)$$

$$C_dA = 1.698\times10^{-5}\times651.23 = 1.1058\times10^{-2}\ \mathrm{m^2} = \mathbf{110.6\ cm^2}$$

Check it directly: $\dot m = C_dA\sqrt{2\rho\Delta p}
= 1.1058\times10^{-2}\sqrt{2\times1141\times3\times10^4} = 91.49$ kg/s ✓.

At $C_d = 0.90$: $A = 110.58/0.90 = 122.9\ \mathrm{cm^2}$, so
$D = \sqrt{4A/\pi} = \mathbf{125.1\ mm}$ — **larger than the 100 mm line.**
That is the tell: the valve must be *full-bore or better*, and a
pressure-recovering geometry is the only way to make a 100 mm valve pass this
flow at 0.30 bar.

### (b) Line velocity and required $K$ (2)

$$A_{\text{line}} = \frac{\pi(0.100)^2}{4} = 7.854\times10^{-3}\ \mathrm{m^2},\qquad
v = \frac{Q}{A} = \frac{8.0193\times10^{-2}}{7.854\times10^{-3}} = \mathbf{10.21\ m/s}$$

$$K = \frac{\Delta p}{\tfrac12\rho v^2} = \frac{3.000\times10^{4}}{0.5\times1141\times10.210^2} = \mathbf{0.5044}$$

From the Module 14 table: a **full-bore ball valve** ($K = 0.05$–0.10) or a
**visor/gate valve** ($K = 0.1$–0.3) meets this with room to spare; a
**butterfly** ($K = 0.2$–0.6) meets it marginally and only at the good end of its
range; a **reduced-bore ball** (0.3–1.5) is doubtful; a **poppet** ($K = 2$–10)
misses by an order of magnitude, which is the quantitative form of "do not put a
poppet in a large main propellant line".

*(Cavitation check, for completeness: with 4.0 bar upstream and LOX at
$p_v = 1.36$ bar, $\sigma = (4.00-1.36)/0.30 = 8.80$, well above the $\sigma > 4$
no-cavitation target.)*

### (c) Wave speed and pipe period (2)

$$a_{\text{free}} = \sqrt{\frac{K_f}{\rho}} = \sqrt{\frac{0.94\times10^{9}}{1141}} = \mathbf{907.7\ m/s}$$

$$\frac{K_fD}{Et} = \frac{0.94\times10^{9}\times0.100}{200\times10^{9}\times0.0025} = 0.1880$$

$$a = \frac{a_{\text{free}}}{\sqrt{1 + K_fD/(Et)}} = \frac{907.66}{\sqrt{1.1880}} = \mathbf{832.7\ m/s}$$

The pipe compliance costs 8.3 % of the wave speed — and would cost far more in a
bellows or flex hose, which is a genuine (if secondary) reason flexible sections
suppress water hammer.

$$\frac{2L}{a} = \frac{2\times5.00}{832.75} = 1.201\times10^{-2}\ \mathrm{s} = \mathbf{12.01\ ms}$$

### (d) Surge, hoop stress, and required closure time (3)

$$\Delta p_J = \rho a\,\Delta v = 1141\times832.75\times10.210 = 9.702\times10^{6}\ \mathrm{Pa} = \mathbf{97.02\ bar}$$

Peak line pressure $= 45.0 + 97.0 = 142.0$ bar, so the thin-wall hoop stress is

$$\sigma_\theta = \frac{pD}{2t} = \frac{1.4202\times10^{7}\times0.100}{2\times0.0025} = 2.840\times10^{8}\ \mathrm{Pa} = \mathbf{284.0\ MPa}$$

against ≈340 MPa yield for 304L at 90 K: a margin of only **1.20 on yield**,
before any weld knockdown, stress concentration or fatigue allowance. This is not
a survivable design point for a line that will see the transient on every
shutdown.

For slow closure ($t_c > 2L/a$), Michaud gives
$\Delta p \approx 2\rho L\Delta v/t_c$, so for $\Delta p \le 20.0$ bar:

$$t_c \ge \frac{2\rho L\,\Delta v}{\Delta p} = \frac{2\times1141\times5.00\times10.210}{2.00\times10^{6}} = 5.825\times10^{-2}\ \mathrm{s} = \mathbf{58.25\ ms}$$

Comfortably above $2L/a = 12.0$ ms, so the slow-closure formula is the right one
to have used. ✓

**The most common way engineers under-estimate $t_c$:** using the **mechanical
stroke time** instead of the **effective flow-closure time**. A ball or butterfly
valve passes most of its flow in the last 20 % of travel, so a valve with a
200 ms stroke can produce a velocity change over an effective 40–50 ms and a
surge four to five times the naive prediction. Design the *last* part of the
stroke slowly, not the whole stroke.

### Rubric (10)

| | |
|---|---|
| 3 | (a) $Q$ in all three unit systems; $C_v$, $K_v$ with the 1.156 check; $C_dA$; the $C_d=0.90$ bore and the observation that it exceeds the line |
| 2 | (b) $v$, $K$, and a valve-type verdict that uses the table |
| 2 | (c) $a_{\text{free}}$, the $K_fD/Et$ correction, $a$, $2L/a$ |
| 3 | (d) $\Delta p_J$; hoop stress **including** the 45 bar line pressure; $t_c$; the effective-closure-time answer |
| −1 | omitting the static line pressure from the hoop calculation (gives 194 MPa) |
| −1 | applying the Joukowsky form at $t_c = 58$ ms, or Michaud at $t_c < 2L/a$ |

---

## C2 — Acoustic modes and chug margin (10 points)

### (a) Sound speed and mode frequencies (4)

$$R = \frac{8314.46}{20.4} = 407.6\ \mathrm{J/(kg\,K)},\qquad
c = \sqrt{\gamma RT_c} = \sqrt{1.19\times407.57\times3500} = \mathbf{1302.9\ m/s}$$

$$f_{1L} = \frac{c}{2L_{cyl}} = \frac{1302.9}{0.600} = \mathbf{2171\ Hz}$$

Transverse, $f_{mn0} = \alpha_{mn}c/(\pi D_c)$ with $\pi D_c = 0.8796$ m, so
$f = 1481.2\,\alpha_{mn}$:

| mode | $\alpha_{mn}$ | $f$ (Hz) |
|---|---|---|
| 1T | 1.8412 | **2727** |
| 2T | 3.0542 | **4524** |
| 1R | 3.8317 | **5675** |

$$f_{1T1L} = \sqrt{f_{1T}^2 + f_{1L}^2} = \sqrt{2727.1^2 + 2171.5^2} = \mathbf{3486\ Hz}$$

**What a lateral accelerometer sees:** only **1T**. A mode exerts a net force on
the chamber shell only if its wall-pressure distribution has a non-zero
resultant. 1T ($m=1$) is high on one side and low on the other, so it integrates
to a net lateral force at 2727 Hz. 2T ($m=2$) has four alternating lobes whose
lateral resultants cancel — it ovalises the shell instead. 1R ($m=0$) and 1L are
axisymmetric and produce no lateral force at all.

**What two circumferentially opposed transducers read at 1T:** the same amplitude
**180° out of phase**. (If instead the phase between two transducers ramps
linearly with their azimuthal separation rather than jumping, the 1T is
*spinning* rather than standing — the standard discriminator.)

### (b) Fill time (2)

$$\Gamma(1.19) = \sqrt{1.19}\left(\frac{2}{2.19}\right)^{2.19/0.38} = \mathbf{0.6466}$$

$$c^* = \frac{\sqrt{RT_c}}{\Gamma} = \frac{\sqrt{407.57\times3500}}{0.64658} = \frac{1194.4}{0.64658} = \mathbf{1847\ m/s}$$

$$\tau_c = \frac{L^*}{\Gamma^2c^*} = \frac{1.15}{0.64658^2\times1847.19}
= \frac{1.15}{772.3} = 1.489\times10^{-3}\ \mathrm{s} = \mathbf{1.489\ ms}$$

### (c) Neutral stability and margin (3)

Solve $\omega\tau + \arctan(\omega\tau_c) = \pi$ with $\tau = 9.00\times10^{-4}$ s
and $\tau_c = 1.4891\times10^{-3}$ s. Iterating:

| $\omega$ (rad/s) | $\omega\tau$ | $\arctan(\omega\tau_c)$ | sum |
|---|---|---|---|
| 2000 | 1.8000 | 1.2470 | 3.0470 |
| 2100 | 1.8900 | 1.2610 | 3.1510 |
| **2090.7** | **1.8816** | **1.2600** | **3.1416** = $\pi$ ✓ |

$$f_{\text{neutral}} = \frac{2090.7}{2\pi} = \mathbf{332.7\ Hz}$$

$$\omega\tau_c = 2090.66\times1.4891\times10^{-3} = 3.1132$$

$$k_{crit} = \sqrt{1 + (\omega\tau_c)^2} = \sqrt{1 + 9.6921} = \mathbf{3.270}$$

$$\left(\frac{\Delta p_{inj}}{p_c}\right)_{\min} = \frac{1}{2k_{crit}} = \frac{1}{6.5399} = \mathbf{15.29\ \%}$$

The design drop is 20 %, giving a loop gain $k = p_c/(2\Delta p_{inj}) = 1/(2\times0.20) = 2.500$
against $k_{crit} = 3.270$. **Stable, with 23.5 % margin in $k$**
($(3.270-2.500)/3.270$), equivalently the drop could fall to 15.3 % before the
mode goes neutral.

*(Optional check that a strong answer may include: the complex root of
$\tau_cs + 1 + ke^{-s\tau} = 0$ at $k = 2.500$ is
$s = -218.8 + 1993.5i\ \mathrm{s^{-1}}$, i.e. 317.3 Hz decaying to 10 % of peak in
$\ln 10/218.8 = 10.5$ ms — which would pass a 45 ms dynamic-stability
requirement. At 15 % drop, $k = 3.333$ and the root is $s = +15.7 + 2097.2i$: it
**grows**, doubling in 44 ms.)*

### (d) Effect of doubling $p_c$ (1)

**Nothing.** $\tau_c = L^*/(\Gamma^2c^*)$ contains only $L^*$ and the propellant's
$\Gamma$ and $c^*$; chamber pressure cancels out of it exactly. Physically, the
chamber's gas capacitance rises with density ($\propto p_c$) but the throat drains
it faster in exactly the same proportion ($\dot m \propto p_c$), so the RC time is
unchanged. What *does* change with $p_c$ is the absolute $\Delta p_{inj}$ needed to
hold the same *ratio*, and hence the pump work.

### Rubric (10)

| | |
|---|---|
| 4 | (a) $c$; all five frequencies; correct 1T-only answer for the accelerometer with the net-resultant reason; 180° for opposed transducers |
| 2 | (b) $\Gamma$, $c^*$, $\tau_c$ |
| 3 | (c) iterated $\omega$ shown; $f$, $k_{crit}$, 15.29 %; explicit verdict and a quantified margin |
| 1 | (d) "unchanged", with the capacitance-versus-drain reason (the bare word "unchanged" scores 0.5) |
| −1 | using $\pi D_c$ where $2\pi R_c$ was meant, or vice versa — check: they are the same thing, but a factor-of-2 slip here is the classic error and halves or doubles every transverse frequency |

---

## C3 — Data interpretation: the 315 Hz trace (5 points)

### (a) The 60 % condition (1)

A fixed-area injector follows $\dot m \propto \sqrt{\Delta p}$, so
$\Delta p \propto \dot m^2$:

$$\Delta p_{inj} = 18.0\times(0.60)^2 = \mathbf{6.48\ bar}$$

$$\frac{\Delta p_{inj}}{p_c} = \frac{6.48}{54.0} = \mathbf{12.00\ \%},\qquad
k = \frac{p_c}{2\Delta p_{inj}} = \frac{1}{2\times0.12} = \mathbf{4.167}$$

**Note the trap the throttle sets.** Flow falls 40 %, so $\Delta p_{inj}$ falls
64 %, while $p_c$ falls only 40 %. The *ratio* therefore collapses from 20 % to
12 %, and injector stiffness is exactly the quantity chug cares about. This is
why deep-throttling engines need variable-area injectors, cavitating venturis or
a pintle.

### (b) Which mode (2)

**Answer: (ii), chug.**

Three of the five observations, plus (a):

1. **$k = 4.167 > k_{crit} = 3.270$** (C2c). The chug criterion, computed for
   this chamber with no free parameters, predicts instability at exactly this
   operating point. The predicted neutral frequency is 333 Hz and the measured
   tone is 315 Hz — well inside the ±10–20 % the lumped model is worth.
2. **All three chamber transducers in phase.** Chug is a *bulk* mode: the whole
   chamber pressure rises and falls together, so every transducer reads in phase
   regardless of azimuth. A 1T would put two of the three 120°-spaced
   transducers strongly out of phase with the third.
3. **The fuel manifold oscillates at the same frequency, 180° out of phase with
   $p_c$.** That is the feedback loop made visible: when $p_c$ is high the
   injector is back-pressured and the manifold sees the complementary swing. An
   acoustic mode in the chamber gas does not require a correlated
   manifold-pressure signal at all.

Supporting: **the lateral accelerometer is silent** (a bulk mode exerts no net
lateral force — and 315 Hz is far below any chamber shell mode anyway), and
**there is nothing near 2.7 kHz**, which is where C2(a) put the 1T. So the
acoustic modes are quiet and the low-frequency loop is not.

**Why the others are wrong.** (i) 1T is at 2727 Hz, a factor of 8.7 away, and
would not be in phase across the face. (iii) $L^*$ instability is a real
low-frequency mode but it appears in **low-pressure, large-$L^*$** chambers and
behaves in the opposite sense — raising $L^*$ makes it worse, and it does not
track injector stiffness the way this does. (iv) A sense-line quarter-wave would
be an artefact of the *instrument*: it would not correlate with the fuel manifold
pressure, it would not scale with throttle setting, and it would move if you
changed the sense-line length — the standard test.

### (c) Growth then saturation, and the fixes (2)

**What the saturation tells you.** The mode is **linearly unstable** — the small
disturbance grew — but the growth is arrested by a **nonlinearity**, so the system
settles into a **limit cycle** rather than diverging. The usual arresting
nonlinearities are the square-root injector characteristic itself (large
excursions no longer behave linearly), the combustion lag $\tau$ shortening as
amplitude rises, or orifices momentarily cavitating at the bottom of the pressure
swing, which cuts the feedback ($k \to 0$) for part of the cycle. A limit cycle at
11 % of $p_c$ is not benign: it is 6 bar of pressure oscillation at 315 Hz driving
the injector face, the feed lines and the vehicle structure for the whole burn.

**A fix acting on the loop gain $k$:** raise the injector pressure drop at the
throttled condition — a **variable-area injector**, a pintle with a movable
sleeve, or simply restricting the throttle range. Cost: pump work and turbine
flow at *all* conditions if you do it by shrinking the orifices (a 20 % → 30 %
drop at full thrust costs ~9 bar of pump discharge on each side, worth roughly
0.2 MW here), plus mechanism complexity and a new failure mode if you do it with
a variable element.

**A fix acting on the coupling:** install a **cavitating venturi** in each feed
line upstream of the injector. Once the venturi throat is at vapour pressure the
flow is set by upstream conditions alone, $\partial\dot m/\partial p_c = 0$, and
$k \to 0$ — the loop is cut, not merely stiffened. Cost: a permanent, unrecoverable
pressure loss of roughly 20–30 % of the upstream pressure that the pump must
supply for the whole burn, at every throttle setting, plus loss of the ability to
throttle by feed pressure at all. (The cheaper cousin, a **line accumulator**,
moves the feed-line resonance instead of cutting the coupling; it helps only if
the feed line is participating.)

### Rubric (5)

| | |
|---|---|
| 1 | (a) $\Delta p \propto \dot m^2$ used; 6.48 bar, 12.0 %, $k = 4.167$ |
| 2 | (b) correct choice (ii) supported by **three** distinct observations, at least one of which is the quantitative $k$ vs $k_{crit}$ comparison |
| 2 | (c) "linearly unstable, nonlinearly limit-cycling" identified; one gain fix and one coupling fix, each with a stated cost |
| −1 | choosing (ii) but justifying it only by "315 Hz is a low frequency" — the frequency band alone is a convention about mechanism, not evidence |

---

# Section D — Materials, manufacturing and testing (25 points)

## D1 — Thermal stress and LCF of the throat liner (9 points)

### (a) Through-wall $\Delta T$ and elastic thermal stress (2)

$$\Delta T_w = \frac{q''t}{k} = \frac{95\times10^{6}\times0.90\times10^{-3}}{340} = \mathbf{251.5\ K}$$

$$\sigma_{th} = \frac{E\alpha\Delta T_w}{2(1-\nu)}
= \frac{105\times10^{9}\times18.5\times10^{-6}\times251.47}{2(1-0.33)} = \mathbf{364.5\ MPa}$$

**That is 3.3 times the ~110 MPa hot yield.** The wall cannot behave elastically:
it yields in compression on the hot face during the burn and yields back in
tension on shutdown. The elastic number is therefore not a stress at all, it is
an *indicator* — and the correct life method is **strain-based (LCF)**, not
stress-based. Any answer that computes a margin of safety against yield here has
misread the physics.

*(Aside worth one line: the same flux through an Inconel 718 wall of the same
thickness at $k = 21$ W/(m·K) would demand $\Delta T_w = 4071$ K. There is no
clever design that gets round that. High-flux regenerative cooling requires a
copper alloy.)*

### (b) Gradient-only strain (2)

$$\frac{\Delta\varepsilon_{\text{grad}}}{1} = \frac{\alpha\Delta T_w}{2(1-\nu)}
= \frac{18.5\times10^{-6}\times251.47}{2\times0.67} = 3.472\times10^{-3} = \mathbf{0.347\ \%}$$

as a fraction of the reported total: $0.347/2.40 = \mathbf{14.5\ \%}$. The
gradient alone is barely a seventh of the analysed strain range.

**Two contributors to the rest:** (i) the **mean-temperature excursion** of the
whole liner against the much colder, much stiffer closeout jacket, which
restrains it in-plane over the start–shutdown cycle — a far larger kinematic
excursion than the through-thickness gradient; (ii) the **stress concentration at
the coolant-channel corners**, where the local strain is several times the
nominal, compounded by the biaxial pressure load ($p_c$ inside, coolant pressure
in the channel) that a pure gradient calculation omits. (A third, worth credit:
**ratcheting** — the strain need not fully reverse each cycle, which is the
mechanism behind the classic "doghouse" bulge.)

### (c) Manson–Coffin–Basquin (3)

$$\frac{\Delta\varepsilon_t}{2} = 0.01200
= \frac{380\times10^{6}}{102\times10^{9}}(2N_f)^{-0.11} + 0.38\,(2N_f)^{-0.60}
= 3.7255\times10^{-3}(2N_f)^{-0.11} + 0.38\,(2N_f)^{-0.60}$$

Bisecting on $\log(2N_f)$:

| $2N_f$ | elastic term | plastic term | sum |
|---|---|---|---|
| 300 | 2.010×10⁻³ | 1.226×10⁻² | 1.427×10⁻² |
| 600 | 1.862×10⁻³ | 8.087×10⁻³ | 9.95×10⁻³ |
| 400 | 1.955×10⁻³ | 1.023×10⁻² | 1.219×10⁻² |
| **423.5** | **1.915×10⁻³** | **1.008×10⁻²** | **1.200×10⁻²** ✓ |

$$2N_f = 423.5 \quad\Rightarrow\quad \boxed{N_f = 211.8\ \text{cycles}}$$

The **plastic term is 84 %** of the total — deep in the LCF regime, exactly as
part (a) predicted. Life here is bought with ductility, not with strength, which
is the whole argument against "just use a stronger alloy".

### (d) Design factor and the verdict (2)

[SP-8087] practice: factor of 4 on cycles **or** 2 on strain range, whichever is
more conservative.

- **Factor 4 on cycles:** $211.8/4 = \mathbf{52.9}$ allowable cycles.
- **Factor 2 on strain:** $\Delta\varepsilon_t = 4.80\ \%$,
  $\Delta\varepsilon_t/2 = 0.0240$, which solves to $2N_f = 117.2$,
  $N_f = \mathbf{58.6}$ allowable cycles.

The factor on cycles is the more conservative here, so the **design life is 52.9
cycles** — and the requirement is **53**. The liner **fails, by a hair.** A
0.2 % shortfall is not a pass with a rounding argument; it is a design with zero
margin against an analysis whose own scatter is a factor of two.

**The fix.** Strain range scales with $\Delta T_w \propto t$ at fixed flux
(Eq. 3.1 into Eq. 3.10), so thinning the hot wall buys life directly. Take
$t = 0.80$ mm:

$$\Delta T_w = \frac{95\times10^{6}\times0.80\times10^{-3}}{340} = 223.5\ \mathrm{K},
\qquad \Delta\varepsilon_t = 2.40\%\times\frac{223.53}{251.47} = 2.133\ \%$$

which solves to $2N_f = 531.6$, $N_f = 265.8$, and a design life of
$265.8/4 = \mathbf{66.5\ cycles}$ — **25 % margin over the 53 required.** ✓

The exchange rate is brutal and worth stating: an 11 % reduction in wall
thickness bought 26 % more life. It is also why liner walls are made as thin as
erosion margin, machining tolerance and blanching allowance permit, and why the
industry moved from NARloy-Z to GRCop.

### Rubric (9)

| | |
|---|---|
| 2 | (a) $\Delta T_w$; $\sigma_{th}$ with the $2(1-\nu)$ denominator; explicit "exceeds yield ⇒ use a strain method" |
| 2 | (b) 0.347 % and 14.5 %; two named contributors |
| 3 | (c) equation set up correctly; **at least three iterates tabulated**; $N_f = 212$; plastic term identified as dominant |
| 2 | (d) both design factors computed; the correct one identified as governing; explicit fail verdict; a thickness that passes with quantified margin |
| −1 | computing a "margin of safety" against yield in (a) |
| −1 | using $\Delta\varepsilon_t$ where $\Delta\varepsilon_t/2$ is required (gives $2N_f \approx 60$, $N_f \approx 30$) |

---

## D2 — Additive versus brazed construction (7 points)

### (a) Build time (3)

**Exposure.** The laser must sweep the whole solid volume at a rate
$t_\ell h_s v_s$ per laser:

$$t_{\text{exp}} = \frac{V}{t_\ell h_s v_s N_{\text{lasers}}}
= \frac{1.900\times10^{-3}\ \mathrm{m^3}}{40\times10^{-6}\times110\times10^{-6}\times1.0\times4}
= \frac{1.900\times10^{-3}}{1.760\times10^{-8}} = 1.0795\times10^{5}\ \mathrm{s} = \mathbf{29.99\ h}$$

**Recoat.** Layers $= 0.480/40\times10^{-6} = 12\,000$, at 8.0 s each:

$$t_{\text{recoat}} = 12\,000\times8.0 = 9.600\times10^{4}\ \mathrm{s} = \mathbf{26.67\ h}$$

$$t_{\text{build}} = 29.99 + 26.67 = \mathbf{56.65\ h} \approx 2.4\ \text{days}$$

**Exposure is limiting — but only just** (53 % of the total). With 8 lasers:

$$t_{\text{exp}} = 15.0\ \mathrm{h},\qquad t_{\text{build}} = 15.0 + 26.67 = \mathbf{41.66\ h}$$

Doubling the lasers cut the build by only **26 %**, not 50 %, because the recoat
time is untouched by laser count. **Where to spend money:** past about four
lasers on a part this tall, the return is in **recoater speed and layer
thickness** (a 60 µm layer halves the layer count at the cost of resolution and
downskin quality), not in more lasers. That is the general lesson — a tall,
thin-walled part is *recoat-bound*, a squat solid part is *exposure-bound*, and
you must know which you have before buying a machine.

### (b) Two arguments each (2)

**For Option A (L-PBF):**

1. **Joint count goes to zero in the cooling circuit.** A brazed tube-wall or
   brazed-jacket chamber has hundreds to thousands of braze joints, every one of
   which is a potential leak path between the coolant and the gas side, and the
   capillary window that governs them is 0.025–0.125 mm **at brazing
   temperature** — a differential-expansion problem, not a room-temperature
   fit-up problem. Removing the joints removes the dominant escape.
2. **Channel geometry becomes free.** Milling limits channel depth-to-width to
   about 2:1–4:1 by cutter stiffness; L-PBF reaches ~6:1 and permits variable
   cross-section, curved and bifurcating channels that put coolant velocity
   exactly where the flux is. That is a direct heat-transfer gain, not a
   manufacturing convenience.

**For Option B (milled + brazed):**

1. **Surface finish and its heat-transfer consequence are known and good.** A
   milled channel is $R_a \approx 0.4$–1.6 µm; as-built L-PBF is 5–40 µm, worst
   on the downskin (the channel roof). With $k_s \approx 5R_a$ that is a
   substantially higher friction factor and pressure drop — real pump work — and
   an $h$ enhancement that is smaller than the friction penalty. On a printed
   chamber you cannot reach in and fix it.
2. **Material properties are wrought, not as-built.** A forged and milled liner
   has isotropic, fully characterised properties with A/B-basis allowables
   [MMPDS]. An L-PBF part carries build-direction anisotropy, residual stress from
   $10^5$–$10^7$ K/s cooling rates, and a defect population (lack-of-fusion voids
   are planar, crack-like and aligned with the build direction) that must be
   closed by HIP and demonstrated by CT — and HIP cannot close a void that
   intersects a channel wall, because it is surface-connected.

### (c) Recommendation (2)

**Recommend Option A, the monolithic L-PBF chamber.** Six development chambers
at 2.4 days of build time each is under three weeks of machine time, against a
brazed liner-and-jacket route whose *first* article is a multi-month tooling,
fixturing and furnace-cycle development on a size the company has never brazed.
At forty per year — one chamber every nine days — a single 4-laser machine is
already sufficient, and the rate scales by buying machines rather than by growing
a braze shop and a furnace queue. The company's L-PBF capability is already
qualified for GRCop-42; its brazing capability for a chamber this size does not
exist.

**Qualification activity I would require before committing:** a **full-size
process-witness build** — the actual chamber geometry, or a full-diameter,
full-height section of it, built on the production parameter set, then **CT
scanned in the channel region and flow-tested channel-by-channel**, plus witness
coupons from the same build tested for tensile properties and porosity in both
build directions. Coupons alone are not sufficient evidence for a part of this
size: the thermal history at the top of a 480 mm build is not the thermal history
of a 20 mm coupon.

**The inspection result that would make me switch:** **lack-of-fusion porosity
intersecting a coolant-channel wall**, found by CT or by a channel flow test that
does not close against prediction. That defect is planar, crack-like, aligned
with the build direction, **not closable by HIP** because it is surface-connected,
and it sits in the highest-strain-range location in the engine (D1). One
confirmed instance in a witness build and I would revert to the milled-and-brazed
route and spend the schedule on the braze development instead.

### Rubric (7)

| | |
|---|---|
| 3 | (a) exposure and recoat computed separately; total; correct identification of the limiting term; 8-laser case with the "only 26 %" observation and the recoat-versus-exposure lesson |
| 2 | (b) four arguments, each naming a **specific mechanism** (capillary window, depth:width limit, $k_s \approx 5R_a$, lack-of-fusion morphology, residual stress, anisotropy). Generic "AM is faster / brazing is proven" scores zero |
| 2 | (c) a recommendation tied to the stated six-then-forty rate and to the company's actual capabilities; a qualification activity at **full scale**; a switch criterion that is a specific inspection finding, not a vague "if it fails" |

---

## D3 — Uncertainty on a measured $I_{sp}$ (9 points)

### (a) Specific impulse (1)

$$\dot m = 91.50 + 26.50 = 118.00\ \mathrm{kg/s}$$

$$I_{sp} = \frac{F}{\dot m g_0} = \frac{3.186\times10^{5}}{118.00\times9.80665} = \mathbf{275.3\ s}$$

### (b) Thrust uncertainty (1)

The three thrust terms are **independent** contributions to the **same** quantity,
so they combine in root-sum-square (Eq. 3.19):

$$\frac{u_F}{F} = \sqrt{0.0015^2 + 0.0030^2 + 0.0008^2} = 3.448\times10^{-3} = \mathbf{0.3448\ \%}$$

The tare-and-alignment term dominates: it contributes
$(0.0030/0.003448)^2 = 76\ \%$ of the variance on its own.

### (c) Total mass flow — a sum, not a product (2)

$$u_{\dot m_o} = 0.0025\times91.50 = 0.22875\ \mathrm{kg/s},\qquad
u_{\dot m_f} = 0.0055\times26.50 = 0.14575\ \mathrm{kg/s}$$

$$u_{\dot m} = \sqrt{0.22875^2 + 0.14575^2} = \mathbf{0.2712\ kg/s}
\quad\Rightarrow\quad \frac{u_{\dot m}}{\dot m} = \frac{0.27124}{118.00} = \mathbf{0.2299\ \%}$$

**What "sum" changes:** for a sum you combine **absolute** uncertainties, not
relative ones. Adding 0.25 % and 0.55 % in quadrature would give 0.605 % — nearly
three times the truth — because it ignores that the 0.55 % applies to only 22 %
of the flow.

Variance shares: oxidiser $(0.22875/0.27124)^2 = \mathbf{71.1\ \%}$, fuel
$\mathbf{28.9\ \%}$. **The worse meter is not the bigger problem**, because it is
metering the smaller stream.

### (d) $I_{sp}$ uncertainty (2)

$I_{sp} = F/(\dot m g_0)$ is a pure quotient and $g_0$ is a defined constant with
no uncertainty, so

$$\frac{u_{I_{sp}}}{I_{sp}} = \sqrt{\left(\frac{u_F}{F}\right)^2 + \left(\frac{u_{\dot m}}{\dot m}\right)^2}
= \sqrt{0.003448^2 + 0.002299^2} = 4.144\times10^{-3} = \mathbf{0.4144\ \%}$$

$$u_{I_{sp}} = 0.004144\times275.32 = \mathbf{1.141\ s}$$

$$\boxed{I_{sp} = 275.3 \pm 2.28\ \mathrm{s}\quad (k = 2,\ \approx95\,\%)}$$

**Caveat that a strong answer states:** this formula assumes $F$ and $\dot m$ were
measured **independently**. If the reduction had computed $\dot m$ from $p_c$ and
an assumed $c^*$, the two would be correlated and the RSS would understate the
uncertainty badly.

### (e) $c^*$ uncertainty (1)

$$\frac{u_p}{p} = \sqrt{0.0022^2 + 0.0012^2} = 2.506\times10^{-3} = 0.2506\ \%$$

$$\frac{u_{A_t}}{A_t} = 2\times\frac{u_{D_t}}{D_t} = 2\times0.0009 = 0.1800\ \%$$

$c^* = p_{c,ns}A_t/\dot m$ is a pure product/quotient:

$$\frac{u_{c^*}}{c^*} = \sqrt{0.002506^2 + 0.001800^2 + 0.002299^2} = 3.848\times10^{-3} = \mathbf{0.3848\ \%}$$

### (f) Which upgrade (2)

| upgrade | new $u_{\dot m}/\dot m$ or $u_F/F$ | resulting $u_{I_{sp}}/I_{sp}$ | improvement |
|---|---|---|---|
| baseline | 0.2299 % / 0.3448 % | **0.4144 %** | — |
| (i) ox meter → 0.10 % | 0.1458 % | **0.3744 %** | 9.7 % |
| (ii) fuel meter → 0.15 % | 0.1968 % | **0.3970 %** | 4.2 % |
| (iii) thrust stand tare → 0.12 % | $u_F/F = 0.2081$ % | **0.3101 %** | **25.2 %** |

**Recommend (iii), the thrust-stand rebuild.** It is worth more than the other two
combined, and it improves the one term that no amount of repetition can shrink —
a tare and alignment error is systematic, so averaging $n$ runs reduces it by
nothing while it reduces the Type A scatter by $\sqrt n$.

**Why the intuitive choice is wrong.** The fuel meter carries the largest
*relative* number, 0.55 %, so it looks like the obvious target. But it meters
22 % of the flow, so its absolute contribution is 0.1458 kg/s against the
oxidiser's 0.2288 kg/s — and the whole flow term (0.2299 %) is in any case
*smaller* than the thrust term (0.3448 %), which the eye skips over because none
of its three components is individually large. **Uncertainty budgets must be
compared in absolute contribution to the final quantity, never in the size of the
input percentages.** That is the single most common way a budget misdirects a
programme's money.

*(Note also what none of the three buys: a 0.31 % $I_{sp}$ uncertainty still means
a claimed 0.3 % injector improvement is **not measurable in one test**. The
sensitive experiment is a back-to-back A/B comparison on the same stand on the
same day, where the shared systematic errors cancel in the difference.)*

### Rubric (9)

| | |
|---|---|
| 1 | (a) $I_{sp} = 275.3$ s |
| 1 | (b) 0.3448 % with RSS named and justified |
| 2 | (c) absolute combination, 0.2712 kg/s and 0.2299 %; explicit statement of why a sum differs from a product; both variance shares |
| 2 | (d) 0.4144 %, 1.141 s, reported at $k=2$ with the coverage factor stated; independence caveat |
| 1 | (e) 0.3848 %, with the factor 2 on $D_t$ |
| 2 | (f) all three upgrades computed; (iii) recommended; the "absolute contribution, not input percentage" explanation |
| −1 | reporting $I_{sp}$ without a coverage factor |
| −1 | combining the two flow uncertainties in relative form (gives 0.605 %) |

---

## Score interpretation

| score | meaning |
|---|---|
| 90–100 | interview mastery: you could defend this material to a senior propulsion engineer |
| 75–89 | working engineering knowledge: correct analysis, minor gaps in judgment |
| 60–74 | familiarity: concepts right, calculations or reasoning incomplete |
| < 60 | re-study modules 12–18 before proceeding to Part III |

**Diagnostic by section.** Losing marks concentrated in **A** means the similarity
groups ($N_s$, $N_{ss}$, $\psi$, affinity) are not yet reflexes — re-read Module 12
§3.10–3.14. Concentrated in **B** means the cycle equation is being used as a
formula rather than as a budget — re-read Module 13 §3.2–3.3. Concentrated in
**C** means the difference between a bulk mode and an acoustic mode is not yet
diagnostic — re-read Module 15 §3.4 and §3.8 together, and Module 14 §3.4.
Concentrated in **D** means the strain-versus-stress distinction, or the
absolute-versus-relative distinction in an uncertainty budget, has not landed —
Module 16 §3.2.4 and Module 18 §3.7.4.

## Further reading for the topics this paper tested

- [SP-8107] *Turbopump Systems for Liquid Rocket Engines* — the system-level
  companion to Section A.
- [SP-8109] *Liquid Rocket Engine Centrifugal Flow Turbopumps* — Euler head,
  $\psi$, slip, and the geometry of A3.
- [SP-8052] *Liquid Rocket Engine Turbopump Inducers* and [Brennen-Pumps] — for
  why NPSH$_r$ at 3 % head loss is not NPSH free of rotating cavitation.
- [SP-8110] *Liquid Rocket Engine Turbines* and [SP-8081] *Liquid Propellant Gas
  Generators* — Section B's drive side.
- [SP-8094], [SP-8097] *Liquid Rocket Valve Components / Assemblies* — Section C1,
  including the warning about applying water-measured $C_v$ to LOX.
- [SP-194] Harrje & Reardon, and [CC56] Crocco & Cheng — the chug and acoustic
  theory of C2 in their original form.
- [SP-8087] *Fluid-Cooled Combustion Chambers* and [GRCop] — the LCF factor and
  the copper alloys of D1.
- [GradlAM], [Gradl18] — the AM process physics and the current capability
  numbers behind D2. Treat the capability numbers as perishable.
- [CPIA-245] — the JANNAF uncertainty and performance-reduction convention that
  D3 follows.
