# Part II Exam B — Liquid Engine Systems (Modules 12–18)

**Time: 3 hours. Total: 100 points. Closed book except the permitted material below.**

Covers Module 12 (feed systems and turbopumps), Module 13 (engine cycles),
Module 14 (valves, plumbing and engine hardware), Module 15 (combustion
instability), Module 16 (structures and materials), Module 17 (manufacturing)
and Module 18 (engine testing and instrumentation).

Part II exam A (modules 05–11) covers the thrust chamber itself — propellants,
chambers, injectors, ignition, nozzles, heat transfer and cooling. This paper
covers everything that feeds it, drives it, holds it together and measures it.

---

## Instructions

- **SI units throughout.** $g_0 = 9.80665\ \mathrm{m/s^2}$,
  $R_u = 8314.46\ \mathrm{J/(kmol\,K)}$. Sea-level ambient
  $p_a = 101\,325$ Pa unless a question says otherwise. Gauge/absolute: every
  pressure in this paper is **absolute**.
- **Show every step and carry units.** Calculation questions are graded on
  method first: a correct setup with an arithmetic slip loses at most 30 % of the
  marks for that part; a correct number from a wrong setup scores zero.
- Quote answers to **four significant figures** unless the question says
  otherwise, and state the assumption behind any value you have to choose
  yourself.
- **Permitted:** a non-programmable calculator, the course equation sheet
  (`reference/equation-sheet.md`), and the printed extracts supplied inside the
  questions. Nothing else.
- Where a question hands you a published engine figure, **carry the engine
  database's caveat with it** — the pressure station (`inj` / `noz` / `n.s.`),
  the confidence label, and whether the number is a company claim. An answer
  that quotes a contested or claimed number as if it were measured fact loses
  marks even when the arithmetic is right.
- Marks are shown for every part. Sections may be attempted in any order.

| section | topic | points | suggested time |
|---|---|---|---|
| A | Feed systems and turbopumps | 25 | 45 min |
| B | Engine cycles | 25 | 45 min |
| C | Valves, plumbing and combustion instability | 25 | 45 min |
| D | Materials, manufacturing and testing | 25 | 45 min |

---

## The reference engine for this paper — **MB-350**

Sections A, B, C and D all work on the same fictional engine, so that a number
you compute in one section is available in the next. **MB-350** is a
LOX/liquid-methane gas-generator booster engine.

| MB-350 parameter | value |
|---|---|
| Propellants | LOX / LCH$_4$ |
| Sea-level thrust $F_{SL}$ | 350 kN |
| Chamber pressure at the injector face $p_{c,\mathrm{inj}}$ | 90.0 bar |
| Mixture ratio $MR$ | 3.453 |
| Oxidiser flow $\dot m_o$ | 91.50 kg/s |
| Fuel flow $\dot m_f$ | 26.50 kg/s |
| Main-chamber total flow $\dot m$ | 118.00 kg/s |
| Main-chamber $I_{sp,\mathrm{vac}}$ (chamber alone, no cycle losses) | 327.0 s |
| $\rho_{\mathrm{LOX}}$ / $\rho_{\mathrm{LCH_4}}$ | 1141 / 423 kg/m³ |
| Chamber barrel diameter $D_c$ / barrel length $L_{cyl}$ | 0.280 / 0.300 m |
| Characteristic length $L^*$ | 1.15 m |
| Chamber gas | $\gamma = 1.19$, $\mathcal{M} = 20.4$ kg/kmol, $T_c = 3500$ K |
| Injector pressure drop, design | 20 % of $p_c$ |
| Single-shaft turbopump speed, baseline | 25 000 rpm |

Cryogenic properties where needed: LOX at 92 K, $p_v = 1.36$ bar
[NIST-WB]; LOX bulk modulus $K_f = 0.94$ GPa. 304L stainless at 90 K:
$E = 200$ GPa.

---

# Section A — Feed systems and turbopumps (25 points)

## A1 (4 points) — Multiple choice

An MB-350-class engine is scaled **down** to one quarter of its thrust at the
**same** chamber pressure, same propellants, same pressure-drop budget, and
with a geometrically similar turbopump held at the same specific speed $N_s$.

Which statement about the scaled-down pump is correct?

- **(a)** Shaft speed doubles, impeller diameter halves, impeller tip speed
  halves, and the required NPSH falls by a factor of two — so the small engine
  can run on a lower tank pressure.
- **(b)** Shaft speed doubles, impeller diameter halves, impeller tip speed is
  unchanged, and the required NPSH is unchanged — so the small engine needs the
  same tank pressure as the large one.
- **(c)** Shaft speed halves, impeller diameter doubles, tip speed is unchanged,
  and the required NPSH rises — so the small engine needs a *higher* tank
  pressure.
- **(d)** Shaft speed, diameter and tip speed all scale with the square root of
  thrust, and NPSH scales with thrust, so every requirement shrinks together.

Choose one, **justify it in no more than three sentences using the two
similarity groups involved**, and state in one further sentence what this result
implies for the dry-mass fraction of a small launch vehicle.

## A2 (13 points) — The pressure-budget → head → power → NPSH chain, and a scaling

MB-350 is single-shaft, both impellers and the turbine on one rotor at
**25 000 rpm**. The feed-system budget, working backwards from the injector
face [SP-8107]:

| item | fuel side | ox side |
|---|---|---|
| chamber pressure at the injector face | 90.0 bar | 90.0 bar |
| injector $\Delta p$ | 18.0 bar | 18.0 bar |
| regenerative jacket $\Delta p$ (methane-cooled) | 25.0 bar | — |
| lines, valves and manifold | 4.0 bar | 4.0 bar |
| pump inlet (tank plus suction line) | 3.5 bar | 4.0 bar |

- **(a)** Compute the pump discharge pressure, the pump pressure rise $\Delta p_p$
  and the **head rise** $H$ for each pump. State in one sentence which pump makes
  the larger head and why, naming both contributing causes. **(3)**
- **(b)** With $\eta_{p,f} = 0.68$ and $\eta_{p,o} = 0.74$, compute the volumetric
  flow and shaft power of each pump, the total pump power, and the pump power per
  newton of sea-level thrust. Compare that last number with the value you can
  compute for the **F-1** and for **Merlin 1D** from `reference/engine-database.md`,
  and state the caveat that attaches to the Merlin figure. **(4)**
- **(c)** Compute the specific speed $N_s$ (SI dimensionless form) of each pump at
  25 000 rpm. State for each whether a single centrifugal stage is the right
  machine, and for any pump that is not, compute the $N_s$ that splitting the head
  across two stages would give. **(3)**
- **(d)** The LOX tank is at 3.20 bar over LOX at 92 K; the suction line loses
  0.30 bar; the liquid surface is 5.50 m above the pump inlet; the vehicle is at
  $1.50\,g_0$ at the worst point in the start box. Compute NPSH$_a$, splitting it
  into its pressure and static-column contributions. Then compute NPSH$_r$ at
  $N_{ss} = 2.5$ (no inducer), 4.0 (modest inducer) and 8.0 (good rocket
  inducer), and state whether the pump can run at 25 000 rpm. **(3)**

## A3 (8 points) — Derivation: the Euler turbomachine equation, and a hydraulic check

- **(a)** **Derive** the Euler pump head equation
  $$H_{\mathrm{Euler}} = \frac{u_2 c_{u2}}{g_0}$$
  starting from **exactly these three statements and nothing else**: (i)
  conservation of angular momentum applied to a control volume around the
  impeller, $T = \dot m\,(r_2 c_{u2} - r_1 c_{u1})$; (ii) shaft power $P = T\omega$;
  (iii) the definition of head as energy per unit weight of fluid.
  State every assumption you make, including the one that lets you drop $c_{u1}$.
  Then answer, in one sentence each: **which fluid property appears in the
  result**, and what that fact implies for a single-shaft LOX/LH$_2$ turbopump. **(4)**
- **(b)** Take the MB-350 **oxidiser** impeller at a head coefficient
  $\psi = 0.52$. Compute the impeller tip speed $u_2$ and the exit diameter $D_2$
  at 25 000 rpm. **(2)**
- **(c)** With an exit blade width $b_2 = 14.0$ mm, a blade exit angle
  $\beta_2 = 26.0°$ from tangential and a slip factor $\sigma = 0.86$, compute the
  meridional velocity $c_{m2}$, the flow coefficient $\phi$, the whirl velocity
  $c_{u2}$, the Euler head, and the implied hydraulic efficiency $\eta_h$. State
  whether the design is feasible and what you would change if $\eta_h$ had come
  out above unity. **(2)**

---

# Section B — Engine cycles (25 points)

## B1 (4 points) — Multiple choice

A datasheet for a flown engine reads: LOX/kerosene; sea-level thrust 4152 kN;
vacuum $I_{sp}$ 338 s; chamber pressure **267 bar**; throttle range 47–100 %;
single shaft; no visible turbine exhaust duct on the engine photograph.

The cycle is:

- **(a)** gas generator, because 338 s is well below the theoretical ideal and
  the shortfall is the dumped drive flow;
- **(b)** fuel-rich staged combustion, because only a closed cycle reaches
  267 bar and Western practice runs preburners fuel-rich;
- **(c)** oxidiser-rich staged combustion, because 267 bar is above the
  demonstrated open-cycle ceiling, there is no dump duct, and a kerosene engine
  cannot run a fuel-rich preburner at the required flow without coking the
  turbine;
- **(d)** closed expander, because the absence of a dump duct proves the cycle is
  closed and kerosene has ample heat capacity at this chamber pressure.

Choose one and **justify it in no more than three sentences.** Then state, in one
further sentence, what caveat you must attach to the 267 bar figure before
comparing it with the RS-25's 206.4 bar.

## B2 (12 points) — Gas-generator flow fraction and the $I_{sp}$ penalty

MB-350's turbine is driven by a fuel-rich LOX/LCH$_4$ gas generator [SP-8081].
Take the pump shaft power from A2(b), a mechanical efficiency $\eta_m = 0.98$ for
bearings, seals and the axial-thrust balance, and this drive gas:

| gas-generator / turbine parameter | value |
|---|---|
| turbine inlet temperature $T_t$ | 1000 K |
| drive-gas molar mass $\mathcal{M}_t$ | 17.5 kg/kmol |
| drive-gas $\gamma_t$ | 1.24 |
| turbine pressure ratio $\pi_t$ | 22.0 |
| turbine efficiency $\eta_t$ | 0.62 |
| $I_{sp}$ of the turbine exhaust through its dump nozzle | 115 s |

- **(a)** Compute the drive gas $R$ and $c_p$, the isentropic enthalpy drop across
  the turbine, and the turbine specific work $w_t$. **(3)**
- **(b)** Compute the required turbine drive flow $\dot m_t$, the engine total
  flow, and the gas-generator flow fraction $f_{gg}$. Compare $f_{gg}$ with the
  typical range for the cycle. **(3)**
- **(c)** Compute the delivered vacuum $I_{sp}$ and the cycle penalty $\Delta I_{sp}$
  **twice**: once assuming the dumped gas produces no thrust at all, and once with
  the 115 s dump nozzle. State which of the two is the honest number for a
  booster engine and why. **(3)**
- **(d)** The programme proposes raising $T_t$ from 1000 K to 1200 K, everything
  else unchanged. Compute the new $w_t$, $\dot m_t$, $f_{gg}$ and $I_{sp}$, and
  state the $I_{sp}$ gained. Then give **two** independent physical reasons the
  programme should not do it, and name the quantity you would compute to decide
  whether the second of your two reasons is binding. **(3)**

## B3 (9 points) — Cycle selection for a methalox upper stage

You must choose the cycle for a **new 250 kN LOX/methane upper-stage engine**.

**Requirements.** Vacuum only, $\varepsilon = 90$. Five in-space restarts after
coast periods of up to 6 hours. Throttle to 40 % for the final trim burn. Total
firing life 3000 s across 12 acceptance and flight cycles. Engine dry mass
target 380 kg. First flight in **four years**. The company has flown a
gas-generator kerolox engine, has never built a preburner, and has an in-house
L-PBF capability qualified for Inconel 718 and GRCop-42.

**Candidate cycles.**

- **(A)** Gas generator, methane-rich, dumping through a nozzle-wall duct.
- **(B)** Closed expander on methane.
- **(C)** Expander bleed (open expander) on methane.
- **(D)** Oxidiser-rich staged combustion.

Answer all of the following.

- **(a)** For each of the four candidates, state the single physical quantity in
  the cycle power balance (Module 13 Eq. 3.3) that the cycle is exploiting, and the
  single quantity that limits it. Four short lines. **(2)**
- **(b)** Using Module 13's master comparison table, state the chamber-pressure
  band each candidate has actually achieved in flight, and name one flown engine
  for each. Where the flight record for a candidate is thin, say so. **(1)**
- **(c)** Make a recommendation. Justify it against **each** of the six stated
  requirements explicitly, and support the argument with at least one number you
  compute or estimate on the spot. **(4)**
- **(d)** State the strongest objection to your recommendation, answer it, and
  name the single piece of information you would most want before freezing the
  choice. **(2)**

---

# Section C — Valves, plumbing and combustion instability (25 points)

## C1 (10 points) — Sizing the main oxidiser valve, and what closing it costs

The MB-350 main oxidiser valve passes $\dot m_o = 91.50$ kg/s of LOX
($\rho = 1141$ kg/m³) and is allowed **0.30 bar** at full open [SP-8094].

- **(a)** Compute the volumetric flow, then the required $C_v$, $K_v$ and
  effective area $C_dA$ (in cm²). Take $SG = \rho/999$;
  1 m³/s = 15 850.32 US gpm; 1 psi = 6894.757 Pa;
  $C_dA\ [\mathrm{m^2}] = 1.698\times10^{-5}\,C_v$. If the valve achieves
  $C_d = 0.90$, what geometric bore diameter does that imply? **(3)**
- **(b)** The valve sits in a 100 mm ID line. Compute the line velocity and the
  loss coefficient $K = \Delta p/(\tfrac12\rho v^2)$ the valve must achieve. State
  from the Module 14 table which valve architectures can meet it and which cannot. **(2)**
- **(c)** The line is 304L, 100 mm ID, 2.5 mm wall, $E = 200$ GPa, LOX
  $K_f = 0.94$ GPa. Compute the free-liquid sound speed, the Korteweg wave speed
  in the installed line, and the pipe period $2L/a$ for a 5.00 m run from the
  valve to the pump discharge volute. **(2)**
- **(d)** Compute the Joukowsky surge for a closure faster than the pipe period.
  With the line running at 45.0 bar, compute the peak hoop stress in the wall and
  compare it with 304L's ~340 MPa yield at 90 K. Then compute the effective
  closure time required to hold the surge below 20.0 bar, and state the single
  most common way an engineer under-estimates that time. **(3)**

## C2 (10 points) — Acoustic modes and chug margin for the MB-350 chamber

Chamber gas: $\gamma = 1.19$, $\mathcal{M} = 20.4$ kg/kmol, $T_c = 3500$ K.
Geometry: $D_c = 0.280$ m, $L_{cyl} = 0.300$ m, $L^* = 1.15$ m.
Bessel roots: 1T $\alpha = 1.8412$; 2T $\alpha = 3.0542$; 1R $\alpha = 3.8317$.

- **(a)** Compute the chamber sound speed $c$ and the 1L, 1T, 2T, 1R and 1T1L
  frequencies. State which one a **lateral** accelerometer bolted to the chamber
  barrel would see, and what two circumferentially opposed dynamic-pressure
  transducers would read for that mode. **(4)**
- **(b)** Compute $\Gamma(\gamma)$, the ideal $c^*$, and the chamber fill time
  $\tau_c = L^*/(\Gamma^2 c^*)$. **(2)**
- **(c)** Methane vaporises fast; take a combustion time lag $\tau = 0.900$ ms.
  Solve the neutral-stability phase condition
  $\omega\tau + \arctan(\omega\tau_c) = \pi$ for $\omega$, then compute the neutral
  frequency, the critical gain $k_{crit} = \sqrt{1+(\omega\tau_c)^2}$, and the
  minimum injector pressure drop $(\Delta p_{inj}/p_c)_{\min} = 1/(2k_{crit})$.
  State whether the design 20 % drop is stable and by what margin in $k$. **(3)**
- **(d)** State, without further calculation, what happens to $\tau_c$ if the
  chamber pressure is doubled at fixed $L^*$, and why. One sentence, with the
  reason. **(1)**

## C3 (5 points) — Data interpretation: a chamber-pressure trace

MB-350 is throttled to **60 % of rated flow**. The injector is a fixed-area
face, so the injector pressure drop follows the square of the flow. Chamber
pressure at 60 % flow is 54.0 bar. The test record shows:

- $p_c$ oscillating at **315 Hz**, 11 % of $p_c$ peak-to-peak, growing over the
  first 400 ms after the throttle step and then holding at constant amplitude;
- all three chamber dynamic-pressure transducers, spaced 120° apart, **in phase**
  with one another;
- the fuel manifold pressure oscillating at the same 315 Hz, roughly **180° out
  of phase** with $p_c$;
- the chamber lateral accelerometer showing nothing above the broadband floor;
- no peak anywhere near 2.7 kHz.

- **(a)** Compute the injector pressure drop and $\Delta p_{inj}/p_c$ at the 60 %
  condition, and the loop gain $k = p_c/(2\Delta p_{inj})$. **(1)**
- **(b)** The oscillation is: **(i)** the first tangential acoustic mode;
  **(ii)** chug, i.e. the bulk-mode injector–chamber feed coupling;
  **(iii)** an $L^*$ instability; **(iv)** a pressure sense-line quarter-wave
  resonance. Choose one and justify it using **three** of the five observations
  above plus your answer to (a). **(2)**
- **(c)** The oscillation grows and then holds at constant amplitude rather than
  growing without limit. State what that tells you about the system, and name one
  fix that acts on the loop gain and one that acts on the coupling, with the cost
  of each. **(2)**

---

# Section D — Materials, manufacturing and testing (25 points)

## D1 (9 points) — Thermal stress and low-cycle fatigue of the MB-350 throat liner

The MB-350 liner is **GRCop-42**, milled or printed, hot-wall thickness
$t = 0.90$ mm at the throat. Throat gas-side heat flux $q'' = 95$ MW/m².
GRCop-42 at the operating temperature: $k = 340$ W/(m·K), $E = 105$ GPa,
$\alpha = 18.5\times10^{-6}$/K, $\nu = 0.33$, yield at 800 K $\approx 110$ MPa
[GRCop]. A nonlinear thermal-structural analysis of this liner reports a **total
mechanical strain range $\Delta\varepsilon_t = 2.40\ \%$** per start–shutdown
cycle at the throat. LCF constants for the alloy at temperature:
$\sigma'_f = 380$ MPa, $E = 102$ GPa, $b = -0.11$, $\varepsilon'_f = 0.38$,
$c = -0.60$.

The engine must fly **50 flights plus 3 acceptance firings — 53 cycles.**

- **(a)** Compute the through-wall temperature drop, and the elastic constrained
  thermal stress. Compare it with the hot yield strength and state, in one
  sentence, what that comparison means for the choice of life method. **(2)**
- **(b)** Compute the strain excursion the gradient alone produces,
  $\alpha\Delta T_w/[2(1-\nu)]$, and express it as a fraction of the reported
  2.40 %. Name two contributors to the difference. **(2)**
- **(c)** Solve the Manson–Coffin–Basquin relation
  $$\frac{\Delta\varepsilon_t}{2} = \frac{\sigma'_f}{E}(2N_f)^{b} + \varepsilon'_f (2N_f)^{c}$$
  for $N_f$ by iteration, showing at least three iterates in a table. State which
  term dominates and what that confirms. **(3)**
- **(d)** Apply the [SP-8087] design factor — 4 on cycles or 2 on strain range,
  **whichever is more conservative** — and state whether the liner meets the
  53-cycle requirement. If it does not, compute the hot-wall thickness that would
  make it pass with at least 20 % margin, assuming the total strain range scales
  linearly with $\Delta T_w$. **(2)**

## D2 (7 points) — Additive versus brazed construction for the MB-350 chamber

Two proposals for the MB-350 regeneratively cooled chamber:

- **Option A — monolithic L-PBF GRCop-42 chamber**, printed to $\varepsilon = 4$
  with integral cooling channels. Solid metal volume 1900 cm³, build height
  480 mm. Machine: 4 lasers, layer thickness $t_\ell = 40$ µm, hatch spacing
  $h_s = 110$ µm, scan speed $v_s = 1.0$ m/s, recoat time 8.0 s per layer.
- **Option B — milled GRCop-42 liner with a brazed Inconel 625 jacket**, the
  classic construction. The company has a vacuum furnace but has never brazed a
  chamber this size.

- **(a)** Using $E_v$-style bookkeeping, compute the total laser exposure time,
  the total recoat time and the total build time for Option A, and state which
  is limiting. Then compute the build time if the machine had 8 lasers instead
  of 4, and say what that tells you about where to spend money. **(3)**
- **(b)** Give **two** technical arguments for Option A and **two** for Option B,
  each tied to a named mechanism from Module 17 (not to generic "AM is faster"
  or "brazing is proven"). **(2)**
- **(c)** Recommend one for a programme that needs **six** chambers for
  development and, if it succeeds, **forty per year**. State the single
  qualification activity you would require before committing, and the one
  inspection result that would make you switch to the other option. **(2)**

## D3 (9 points) — Uncertainty on a measured $I_{sp}$

A sea-level MB-350 acceptance firing is reduced to the following.

| measured quantity | value | standard (1σ) uncertainty |
|---|---|---|
| Axial thrust $F$ | 318.6 kN | load-cell calibration 0.15 %; thrust-stand tare and alignment 0.30 %; zero drift over the run 0.08 % |
| Oxidiser flow $\dot m_o$ | 91.50 kg/s | 0.25 % of $\dot m_o$ (Coriolis) |
| Fuel flow $\dot m_f$ | 26.50 kg/s | 0.55 % of $\dot m_f$ (turbine meter + density) |
| Chamber pressure $p_{c,ns}$ | 88.20 bar | transducer 0.22 %; nozzle-stagnation correction model 0.12 % |
| Throat diameter $D_t$ | — | 0.09 % |

- **(a)** Compute $I_{sp}$ from $F$ and total flow. **(1)**
- **(b)** Compute the relative uncertainty in thrust. State the rule you used and
  why it applies. **(1)**
- **(c)** Compute the uncertainty in **total** mass flow. Note carefully that this
  is a *sum*, not a product, and say in one sentence what that changes. Give the
  fraction of the flow variance contributed by each meter. **(2)**
- **(d)** Compute $u_{I_{sp}}/I_{sp}$, $u_{I_{sp}}$ in seconds, and report $I_{sp}$
  with an expanded uncertainty at $k = 2$. **(2)**
- **(e)** Compute $u_{c^*}/c^*$ for $c^* = p_{c,ns}A_t/\dot m$, remembering that
  $A_t \propto D_t^2$. **(1)**
- **(f)** The programme can afford **one** upgrade: (i) the oxidiser meter to
  0.10 %, (ii) the fuel meter to 0.15 %, or (iii) a thrust-stand rebuild with
  in-situ calibration taking the tare term to 0.12 %. Compute $u_{I_{sp}}/I_{sp}$
  for each and recommend one. Then state why the intuitive choice — attacking the
  0.55 % number because it is the biggest — is wrong. **(2)**

---

## End of paper

*Answers: [`exam-part2b-key.md`](exam-part2b-key.md). Every number in the key is
computed with `tools/rocket.py` and registered in
`tools/examples/exam-part2b.py`; run `python3 tools/check_examples.py` to
recompute them.*
