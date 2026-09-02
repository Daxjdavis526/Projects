# Part II Exam A — Bipropellant liquid engines, modules 05–11

**Time: 3 hours. Total: 100 points. Closed book except the permitted material below.**

Covers Module 05 (propellants), Module 06 (combustion chambers), Module 07
(injectors), Module 08 (ignition), Module 09 (nozzles), Module 10 (heat
transfer) and Module 11 (cooling systems).

---

## Instructions

- **SI units throughout.** $g_0 = 9.80665\ \mathrm{m/s^2}$,
  $R_u = 8314.46\ \mathrm{J/(kmol\,K)}$,
  $\sigma_{SB} = 5.670374\times10^{-8}\ \mathrm{W/(m^2\,K^4)}$. Sea-level
  ambient $p_a = 101\,325$ Pa unless a question says otherwise. Where an
  altitude is asked for, use the 1976 US Standard Atmosphere troposphere
  ($T_0 = 288.15$ K, lapse rate $L = 6.5$ K/km, $R_{air} = 287.05$ J/(kg·K)).
- **Show every step and carry units.** Calculation questions are graded on
  method first: a correct setup with an arithmetic slip loses at most 30 % of
  the marks for that part; a correct number obtained from a wrong setup scores
  zero.
- Quote answers to **four significant figures** unless the question says
  otherwise, and state the assumption behind any value you must choose
  yourself.
- **State the pressure station** every time you write a chamber pressure.
  Injector-end and nozzle-stagnation pressures differ by several percent in
  every engine in this exam, and an answer that conflates them loses marks even
  when the arithmetic is right.
- **Permitted:** a non-programmable calculator, the course equation sheet
  (`reference/equation-sheet.md`), and the printed extracts supplied inside the
  questions. Nothing else.
- Where a question hands you a published engine figure, **carry its caveat**.
  Quoting a company claim or a contested value as if it were measured loses
  marks.
- Marks are shown for every part. Sections may be attempted in any order.

| section | topic | points | suggested time |
|---|---|---|---|
| A | Propellants | 15 | 25 min |
| B | Combustion chambers and injectors | 30 | 55 min |
| C | Ignition and nozzles | 25 | 45 min |
| D | Heat transfer and cooling | 30 | 55 min |

---

# Section A — Propellants (15 points)

## A1 (4 points) — Multiple choice

A press release for a new reusable methalox booster engine states that
LOX/methane was selected "for its specific impulse." You are asked to review
the statement for a technical audience.

The **strongest single technical objection** is:

- **(a)** the statement is simply wrong — methane's specific impulse is below
  kerosene's, so nothing was gained;
- **(b)** the specific-impulse advantage over RP-1 is of order 5 s, inside the
  uncertainty of any preliminary design, whereas the property that actually
  decided the choice is methane's coolant-side wall-temperature limit, roughly
  350 K above RP-1's;
- **(c)** methane's density impulse exceeds kerosene's, so the correct
  justification is volumetric, not gravimetric;
- **(d)** methane cannot be used for autogenous tank pressurisation, so the
  choice must have been made on cycle grounds instead.

Choose one **and justify it in no more than three sentences.** Then name the
**second** strongest technical reason a reusable programme picks methane over
kerosene, and say in one sentence why it is second rather than first.

## A2 (7 points) — Ranking a candidate LOX/methane pair

A CEA-class equilibrium run for **LOX/LCH₄** at $r = 3.60$ and
$p_c = 130$ bar gives $T_0 = 3565$ K, $\mathcal{M} = 21.8$ kg/kmol,
$\gamma = 1.15$ (chamber value, held constant through the nozzle).

Densities: LOX at NBP **1,141 kg/m³**, LCH₄ at NBP **422 kg/m³**; densified
LOX at 66 K **1,256 kg/m³**, densified LCH₄ at 100 K **439 kg/m³**.

Compute, showing the relation you use at each step:

- **(a)** the specific gas constant $R$, the Vandenkerckhove function
  $\Gamma(\gamma)$, and the ideal characteristic velocity $c^*$; **(2)**
- **(b)** the exit Mach number, vacuum thrust coefficient and ideal vacuum
  specific impulse at $\varepsilon = 35$, for ideal one-dimensional
  constant-$\gamma$ flow; **(2)**
- **(c)** the bulk density $\rho_b$ of the loaded propellant and the density
  impulse $I_d = \rho_b I_{sp}$ at NBP loading; **(2)**
- **(d)** the same two quantities with **both** propellants densified, and the
  percentage gain in $I_d$. **(1)**

Finish with a one-line sanity check of your $I_d$ against the LOX/CH₄ row of
the Module 05 §4.3 table, and state what the comparison does **not** tell you
about the vehicle.

## A3 (4 points) — Short answer

Design practice states the hydrocarbon coking limit as a ceiling on the
**coolant-side wall temperature** $T_{wc}$, not on the coolant **bulk exit
temperature** $T_b$.

- **(a)** Explain the physical reason for that choice of station, and state
  which of the two is typically the larger number in a high-flux throat and by
  roughly how much. **(2)**
- **(b)** Name the single cheapest instrument that detects an incipient coking
  problem across a test series, say what its trend looks like, and give one
  independent measurement you would use to confirm the diagnosis before cutting
  the chamber open. **(2)**

---

# Section B — Combustion chambers and injectors (30 points)

**Sections B and D share a reference engine. Read this block once.**

> ### Reference engine **MX-450** (fictional, but built from real practice)
>
> | parameter | value |
> |---|---|
> | Propellants | LOX / LCH₄, $\mathrm{MR} = 3.45$ |
> | Sea-level thrust $F_{SL}$ | 450 kN |
> | Chamber pressure $p_{c,\mathrm{ns}}$ (**nozzle stagnation station**) | 130 bar |
> | Chamber temperature $T_c$ | 3,560 K |
> | $\gamma$, $\mathcal{M}$ | 1.16, 21.8 kg/kmol |
> | Nozzle area ratio $\varepsilon$ | 22 |
> | $c^*$ efficiency $\eta_{c^*}$ | 0.970 |
> | Characteristic length $L^*$ | 1.05 m |
> | Contraction ratio $\varepsilon_c$ | 2.2 |
> | Throat upstream radius $R_u$ | $1.5\,R_t$ |
> | Injector | 400 unlike-doublet elements; $C_d = 0.78$ on both circuits; $\Delta p = 0.20\,p_{c,\mathrm{ns}}$ on both circuits; orifices run full ($C_c \approx 1$) |
> | Injection densities | LOX 1,141 kg/m³; LCH₄ 423 kg/m³ |
>
> Assume ideal one-dimensional constant-$\gamma$ flow for $C_F$, and take the
> throat as choked throughout.

## B1 (7 points) — Derivation: residence time and vent time constant

- **(a)** Starting from mass conservation in the chamber control volume, the
  choked-throat mass-flow law and the definition $L^* \equiv V_c/A_t$,
  **derive**
  $$t_s = \frac{L^*}{\Gamma^2 c^*}$$
  for the mean gas residence time, stating every substitution. Show explicitly
  where chamber pressure cancels. **(3)**

- **(b)** Module 08 defines the chamber's blowdown (vent) time constant as
  $\tau_e = V_c/(\Gamma^2 c^* A_t)$. **Prove that $\tau_e = t_s$ identically**,
  and explain in two sentences why a chamber's *filling* time and its
  *emptying* time constant are the same number. **(1)**

- **(c)** Evaluate for MX-450: compute $\Gamma$, the ideal $c^*$, the delivered
  $c^*$, $C_{F,SL}$, $A_t$, $D_t$, $\dot m$, $V_c$, and then $t_s$. **(2)**

- **(d)** You will find that $t_s$ computed from $L^*/(\Gamma^2 c^*)$ and $t_s$
  computed from $\rho_c V_c/\dot m$ **do not agree**. State the discrepancy as a
  percentage, explain its cause in one sentence, and say which of the two
  numbers you would carry into a chug calculation and why. **(1)**

## B2 (13 points) — Orifice sizing, injector stiffness and chug margin

Use the MX-450 block.

- **(a)** Compute the total, oxidiser and fuel mass flows, and the fuel flow per
  injection element. **(2)**

- **(b)** Size one **fuel** orifice: compute its area, diameter and jet
  velocity, and state the faceplate thickness implied by $L/D = 4$. Comment in
  one sentence on where the diameter sits in the normal range. **(3)**

- **(c)** Compute the barrel-exit Mach number from $\varepsilon_c$, and from it
  the Rayleigh stagnation-pressure loss and the **injector-end** chamber
  pressure the fuel pump must work against. **(2)**

- **(d)** The linear chug criterion (Module 07 Eq. 3.7–3.8) gives, at neutral
  stability,
  $$\omega\tau + \arctan(\omega t_s) = \pi, \qquad
  k_{crit} = \sqrt{1+(\omega t_s)^2}, \qquad
  \left.\frac{\Delta p}{p_c}\right|_{min} = \frac{1}{2k_{crit}}$$
  Take the combustion time lag as $\tau = 0.80$ ms and use the residence time
  you selected in B1(d). Compute the neutral chug frequency in Hz, $k_{crit}$,
  and the minimum $\Delta p/p_c$. **(3)**

- **(e)** State the loop gain $k$ of the design **twice**: once using
  $p_{c,\mathrm{ns}}$ and once using the injector-end pressure from (c). Say
  which is correct and why, and give the gain margin against $k_{crit}$ in both
  cases. **(2)**

- **(f)** The engine must throttle to 55 % thrust on a fixed-area injector.
  Compute $\Delta p/p_c$ at that condition, compare with the requirement, and
  state whether the requirement at 55 % is easier or harder than at 100 % —
  giving the physical reason, not just the arithmetic. **(1)**

## B3 (6 points) — Rupe momentum balance for the unlike doublet

Still MX-450, with equal $\Delta p$ and equal $C_d$ on both circuits.

- **(a)** Compute the oxidiser jet velocity, the oxidiser flow per element, and
  the oxidiser orifice area and diameter. **(2)**

- **(b)** Compute the Rupe parameter
  $R_u = \rho_o V_o^2 d_o/(\rho_f V_f^2 d_f)$ and the total momentum ratio
  $\mathrm{TMR} = \dot m_o V_o/(\dot m_f V_f)$. State which stream dominates
  and what that does to the resultant spray fan. **(2)**

- **(c)** Two fixes are proposed: **(i)** rebalance by lowering the oxidiser
  circuit's pressure drop, **(ii)** split the oxidiser orifice into two and make
  the element an O–F–O triplet at unchanged $\Delta p$. Quantify both — for
  (i) give the required $\Delta p_o$ as a fraction of $p_c$, for (ii) give the
  new orifice diameter and the new $R_u$ — and recommend one, with the
  constraint from B2 that decides it. **(2)**

## B4 (4 points) — Data interpretation: injector cold-flow bench

One fuel orifice from the MX-450 face ($d = 1.715$ mm, $L/D = 4$, sharp inlet)
is water-flowed on a bench at 293 K. The **pressure drop is held at exactly
20.0 bar** and the **back pressure $p_2$ is varied**. Water:
$\rho = 998$ kg/m³, $p_v = 2.34$ kPa.

| $p_2$ (bar abs) | 30.0 | 25.0 | 20.0 | 15.0 | 12.0 | 10.0 | 8.0 | 5.0 | 2.0 | 1.0 |
|---|---|---|---|---|---|---|---|---|---|---|
| measured $\dot m$ (kg/s) | 0.1139 | 0.1139 | 0.1139 | 0.1139 | 0.1126 | 0.1090 | 0.1053 | 0.0995 | 0.0934 | 0.0912 |

Below $p_2 = 5$ bar the operator reports that the jet, previously frothy and
opaque, becomes a smooth glassy column.

- **(a)** Compute the discharge coefficient at $p_2 = 30$ bar and at
  $p_2 = 2$ bar, and the cavitation number at each of those two points. **(2)**
- **(b)** Name the phenomenon, state the approximate critical cavitation number
  the data implies, and say what the glassy jet indicates. **(1)**
- **(c)** State, with a reason, whether this behaviour can occur on the **fuel**
  circuit of the flight engine at mainstage, and whether it can occur on the
  **oxidiser** circuit (LOX at 100 K, $p_v = 0.254$ MPa). Then name the one
  phase of engine operation in which your answer changes. **(1)**

---

# Section C — Ignition and nozzles (25 points)

## C1 (10 points) — Accumulated-propellant overpressure

> ### Reference engine **UX-220** (fictional)
>
> | parameter | value |
> |---|---|
> | Propellants | LOX / LCH₄, upper stage |
> | Vacuum thrust | 220 kN |
> | Vacuum $I_{sp}$ | 372 s |
> | Chamber pressure | 90 bar |
> | Delivered $c^*$ | 1,830 m/s |
> | Characteristic length $L^*$ | 1.00 m |
> | Structural limit on peak chamber pressure | $1.60\,p_c$ |
>
> Transient (accumulation-burn) product gas: $\mathcal{M} = 21.0$ kg/kmol,
> $\gamma = 1.16$, net heat release $\Delta h_c = 10.2$ MJ per kg of mixture.

On a vacuum-cell start the torch igniter fails to establish a flame. Propellant
enters at $\phi = 0.10$ of mainstage flow and the mixture finally lights
$\tau_d = 180$ ms after propellant first reaches the chamber. The nozzle carries
a closure, so nothing drains.

- **(a)** Compute $\dot m$, $A_t$, $D_t$ and the free chamber volume $V_c$. **(2)**
- **(b)** Compute the accumulated mass $m_{acc}$ and the mean liquid loading of
  the chamber in kg/m³. **(1)**
- **(c)** Compute the constant-volume flame temperature $T_v$ and the
  constant-volume explosion pressure $p_{CV}$, in bar and as a multiple of
  $p_c$. Sanity-check $T_v$ in one line. **(3)**
- **(d)** The accumulation burns over $t_b = 4.0$ ms. Compute the chamber vent
  time constant $\tau_e$ and the vented peak pressure
  $p_{peak} = p_{CV}\,(\tau_e/t_b)\left(1-e^{-t_b/\tau_e}\right)$,
  in bar and as a multiple of $p_c$. **(2)**
- **(e)** Invert for the maximum permissible ignition delay against the
  $1.60\,p_c$ limit, both without venting credit and with the $t_b = 4$ ms
  credit. State which number you would write into the ignition-detect
  requirement and name the weakest assumption in the chain. **(2)**

## C2 (11 points) — Expansion ratio, separation and break-even altitude

A sea-level kerolox booster engine runs $p_c = 85$ bar (nozzle stagnation
station), $\gamma = 1.20$, $A_t = 0.0350$ m². Two candidate nozzles are on the
same throat: $\varepsilon = 14$ and $\varepsilon = 24$.

- **(a)** For each, compute the exit Mach number, the exit static pressure, and
  $p_e/p_a$ at sea level. **(3)**
- **(b)** Apply **both** separation criteria at sea level — Summerfield
  ($p_{sep} \approx 0.4\,p_a$) and Schmucker
  ($p_{sep}/p_a = (1.88 M_e - 1)^{-0.64}$) — to each nozzle, and state clearly
  where they agree and where they do not. **(2)**
- **(c)** Compute $C_{F,vac}$ and $C_{F,SL}$ for each, and the sea-level thrust
  of each. **(2)**
- **(d)** Derive and evaluate the break-even ambient pressure between the two
  area ratios, and convert it to an altitude. Then give the thrust difference
  $F_{24}-F_{14}$ at sea level and at 20 km ($p_a = 5\,474.9$ Pa). **(3)**
- **(e)** Suppose the programme insists on $\varepsilon = 24$. Compute the
  chamber pressure at which the Summerfield criterion would be satisfied at sea
  level with the same area ratio, and comment in one sentence on what that
  implies about high-$p_c$ engines carrying large sea-level area ratios. **(1)**

## C3 (4 points) — Short answer: ignition detection

- **(a)** Explain in two or three sentences why "the igniter fired" and "the
  engine ignited" are different measurements, and describe one plausible fault
  in which the first reads healthy and the second is false. **(2)**
- **(b)** For a **vacuum-start** methalox upper stage, propose two *dissimilar*
  ignition-detect measurements, and for each name the specific failure mode
  that would fool it. **(2)**

---

# Section D — Heat transfer and cooling (30 points)

## D1 (16 points) — Bartz → wall temperature → coolant channel, end to end

Return to **MX-450**. Additional data:

> **Gas-side.** Evaluate transport properties at chamber stagnation using the
> course conventions: $c_{p,0} = \gamma R/(\gamma-1)$,
> $\mathrm{Pr}_0 = 4\gamma/(9\gamma-5)$,
> $\mu_0 = 1.184\times10^{-7}\,\mathcal{M}^{0.5}T_0^{0.6}$ Pa·s. Recovery
> factor $r = 0.90$. Use the **delivered** $c^*$ in the Bartz mass-flux term.
>
> **Wall.** GRCop-42 liner, hot wall $t_w = 0.80$ mm, $k_w = 290$ W/(m·K),
> $E = 110$ GPa, $\alpha = 17\times10^{-6}$ /K, $\nu = 0.33$, 0.2 % yield at
> 800 K = 130–190 MPa. Design band for a long-life copper-alloy hot wall:
> $T_{wg} \le 850$ K.
>
> **Channels.** 150 channels, at the throat $w = 1.80$ mm, $h_{ch} = 4.50$ mm,
> pitch $= \pi(D_t + 2t_w)/N_{ch}$. All of the fuel is the coolant.
> Counter-flow; bulk coolant temperature at the throat $T_b = 250$ K.
> Methane at 250 K and 150 bar: $\rho = 190$ kg/m³, $c_p = 3{,}050$ J/(kg·K),
> $k = 0.070$ W/(m·K), $\mu = 2.6\times10^{-5}$ Pa·s. Methane coolant-side
> decomposition limit 900–950 K.

- **(a)** Compute $c_{p,0}$, $\mathrm{Pr}_0$, $\mu_0$, and the
  station-independent Bartz group
  $K_0 = (0.026/D_t^{0.2})(\mu_0^{0.2}c_{p,0}/\mathrm{Pr}_0^{0.6})
  (p_c/c^*)^{0.8}(D_t/R_u)^{0.1}$, so that $h_g = K_0 (A_t/A)^{0.9}\sigma$.
  **(3)**
- **(b)** Compute the adiabatic wall temperature at the throat. State in one
  sentence why it is *not* 3,560 K and why the difference is small. **(1)**
- **(c)** Compute the channel hydraulic diameter, the pitch, the land width and
  the aspect ratio, and check the land width against manufacturing practice.
  **(2)**
- **(d)** Compute the coolant per channel, its velocity, $Re_c$, $Pr_c$, and the
  Dittus–Boelter coolant-side coefficient $h_c$. **(3)**
- **(e)** Treat the land as a straight fin with an adiabatic tip. Compute $m$,
  the fin efficiency $\eta_f$, the area enhancement $\Phi$ and
  $h_{c,\mathrm{eff}}$. **(2)**
- **(f)** Solve the series-resistance chain for $q''$, $T_{wg}$,
  $\Delta T_{wall}$ and $T_{wc}$. Iterate on the Bartz $\sigma$ correction
  (start from $T_{wg} = 900$ K) and report the converged values, together with
  the percentage of the total resistance held by each of the three paths. **(3)**
- **(g)** State whether the design closes. Check $T_{wc}$ against the methane
  limit and $T_{wg}$ against the 850 K band, compute the elastic thermal stress
  $\sigma_{th} = E\alpha\Delta T_{wall}/[2(1-\nu)]$ and compare it with yield,
  and say in two sentences what the stress number does and does not tell you
  about liner life. **(2)**

## D2 (8 points) — Engineering judgment: the as-printed channel

Your additive-manufacturing supplier offers the MX-450 liner two ways.

| option | internal channel finish | absolute roughness $\epsilon$ | unit cost | lead time |
|---|---|---|---|---|
| **P** | as printed | 20 µm | baseline | baseline |
| **Q** | abrasive-flow machined after printing | 3 µm | +18 % | +5 weeks |

Use your D1 channel ($D_h$, $Re_c$, $\rho$, $V_c$) throughout. Smooth-duct
friction factor $f = 0.184\,Re^{-0.2}$; rough-duct friction factor from
Haaland,
$$\frac{1}{\sqrt f} = -1.8\log_{10}\!\left[\left(\frac{\epsilon/D_h}{3.7}\right)^{1.11}+\frac{6.9}{Re}\right]$$
Take the heat-transfer enhancement of roughness as
$h_{c,rough}/h_{c,smooth} = (f_{rough}/f_{smooth})^{1/2}$, and note that
measured enhancements in rocket channels usually fall between 1.3 and 1.6 —
i.e. below what that relation predicts.

- **(a)** Compute $f$ and the throat-zone pressure gradient $dp/dx$ for the
  smooth channel, for option Q and for option P, and the pressure drop each
  accumulates over a 0.18 m throat zone. **(3)**
- **(b)** Recompute the D1(f) wall chain for option P at the full
  $(f_{rough}/f_{smooth})^{1/2}$ enhancement and again at a measured
  enhancement of 1.40, reporting $q''$, $T_{wg}$ and $T_{wc}$ for each. **(2)**
- **(c)** **Recommend P or Q.** Your answer must state which D1 verdict changes
  and which does not, put a number on both the benefit and the cost, name the
  one measurement you would demand before committing, and say what result would
  reverse your recommendation. **(3)**

## D3 (6 points) — Where the regenerative circuit ends

A vacuum variant, **MX-450V**, keeps the same throat, chamber pressure and gas
properties but carries a nozzle to $\varepsilon = 120$. The regenerative circuit
is to end at some station $\varepsilon_j$, beyond which a radiatively cooled
skirt runs at radiative equilibrium with emissivity $\varepsilon_{em} = 0.85$
and a view to deep space.

- **(a)** At $\varepsilon = 30$, compute the local Mach number, $T_{aw}$, the
  Bartz $h_g$ (iterate $\sigma$ on the wall temperature) and the equilibrium
  wall temperature from $\varepsilon_{em}\sigma_{SB}T_w^4 = h_g(T_{aw}-T_w)$.
  **(3)**
- **(b)** Repeat at $\varepsilon = 60$ and $\varepsilon = 100$ — you may quote
  $h_g$ from the $(A_t/A)^{0.9}$ scaling with the $\sigma$ values 0.812 and
  0.806 respectively. **(1)**
- **(c)** Silicide-coated C-103 niobium is limited to about 1,600 K in service;
  3D carbon–carbon to about 2,000 K. State where each material could begin.
  Then apply the Module 10 §3.7 correction that Bartz **over-predicts** $h_g$ by
  30–50 % beyond $\varepsilon \approx 10$, redo the $\varepsilon = 60$ case with
  $0.6\,h_g$, and say how the answer moves and what you would actually design
  to. **(2)**

---

## End of examination

Before you hand in, check that you have:

- stated the pressure station wherever a chamber pressure appears;
- carried units through every calculation;
- flagged every place where you used a value from the engine database that the
  reference file labels contested or company-claimed.
