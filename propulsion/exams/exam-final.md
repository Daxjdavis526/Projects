# Final Comprehensive Examination

**PROPULSION — a rocket propulsion engineering course**
Covers modules 01–36 and the Part VI interview material ·
**4 hours** · **100 points** · closed book, calculator permitted

---

## Instructions

- **SI units throughout.** An answer without units, or with inconsistent
  units, loses marks even when the number is right.
- Constants you are given: $g_0 = 9.80665\ \mathrm{m/s^2}$,
  $R_u = 8314.46\ \mathrm{J/(kmol\,K)}$,
  $p_{\mathrm{amb,SL}} = 101325\ \mathrm{Pa}$,
  $\sigma_{SB} = 5.6704\times10^{-8}\ \mathrm{W/(m^2K^4)}$.
- **Everything else in Section A you are expected to carry in your head.**
  Section A is closed to the engine database on purpose: an engineer who has
  to look up the injector pressure-drop band is not yet at Level 2.
- **Show every step in Sections B, C and D.** Grading is method-first: a
  correct setup with an arithmetic slip loses at most 30 % of that part's
  marks; a correct number from a wrong setup scores zero. A number with no
  stated assumption behind it is an unsupported number.
- **Two engines and one propellant in this paper are fictional.** FX-250
  (liquid), TR-90 (liquid) and the *EXAM-F* solid propellant are teaching
  articles with generic, internally consistent properties. They are **not**
  any company's hardware and their coefficients are not any manufacturer's
  data. Where a real engine, motor or thruster is named, only publicly
  published figures are used and the question says which are contested.
- Where a question asks for a **judgment**, a defensible argument with its
  counter-argument earns more than an assertion. Where it asks what you
  would **measure**, name the instrument as well as the quantity.
- Epistemic tags **[F] [E] [H] [M] [R] [A] [J]** and source tags such as
  `[SB]`, `[SP-8076]`, `[Bartz57]` are the course conventions; you may use
  them in your answers and Section A asks about them.
- No answers appear anywhere in this file. Score yourself with
  [`exam-final-key.md`](exam-final-key.md) **after** you finish.

**Suggested time budget:** A 25 min · B 100 min · C 50 min · D 50 min ·
15 min review.

**Mark distribution**

| section | content | marks |
|---|---|---|
| A | 20 rapid items | 20 |
| B | 4 calculation problems | 40 |
| C | 2 diagnosis problems | 20 |
| D | 1 design and trade problem | 20 |
| | **total** | **100** |

---

# Section A — Rapid items (20 points, 1 point each)

No working required. For the multiple-choice items write the letter only;
for the one-line items write the number with its units, or the phrase.
Anything you cannot answer in about a minute, leave and come back to.

**A1.** The mass-flow function $\Gamma(\gamma)=\sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$
evaluated at $\gamma = 1.20$ is closest to:

- **(a)** 0.6337  **(b)** 0.6485  **(c)** 0.6584  **(d)** 0.6847

**A2.** State the ideal characteristic velocity of LOX/LH2 at booster/upper-stage
chamber conditions, to the nearest 50 m/s.

**A3.** The vacuum thrust coefficient of a $\gamma = 1.20$ nozzle at
$\varepsilon = 60$ is closest to:

- **(a)** 1.80  **(b)** 1.92  **(c)** 2.00  **(d)** 2.12

**A4.** State the injector pressure-drop band, as a fraction of chamber
pressure, inside which a liquid engine is normally chug-free.

**A5.** Characteristic chamber length $L^*$ for a LOX/RP-1 thrust chamber is
normally:

- **(a)** 0.08–0.13 m  **(b)** 0.3–0.5 m  **(c)** 0.8–1.3 m  **(d)** 3–5 m

**A6.** State the throat heat flux of the RS-25 at full power level, as an
order of magnitude in MW/m².

**A7.** An open gas-generator cycle stops being worth building somewhere near
100–130 bar chamber pressure. The single quantity that forces that ceiling is:

- **(a)** the turbine blade material temperature limit
- **(b)** the gas-generator flow fraction, which grows in proportion to $p_c$
- **(c)** the maximum achievable pump impeller tip speed
- **(d)** the onset of injector-coupled high-frequency instability

**A8.** State the normal turbine inlet temperature band for a fuel-rich gas
generator, in kelvin.

**A9.** A pump is run with $\mathrm{NPSH}_a$ below $\mathrm{NPSH}_r$. The first
symptom on the test stand is:

- **(a)** a rise in discharge pressure and shaft power
- **(b)** a fall in delivered head, with broadband noise and impeller inlet damage
- **(c)** an immediate seal fire
- **(d)** a rise in turbine inlet temperature at constant flow

**A10.** State the coolant-side wall temperature at which RP-1 in a copper-alloy
channel is normally taken to begin coking, and the corresponding limiting
temperature for methane.

**A11.** For civil AP/HTPB composite propellants the Saint-Robert/Vieille
pressure exponent $n$ normally lies in the range:

- **(a)** 0.02–0.10  **(b)** 0.2–0.5  **(c)** 0.6–0.8  **(d)** 1.0–1.3

**A12.** Define $\pi_K$ in one clause, and give its value for a propellant with
$\sigma_p = 0.0021\ \mathrm{K^{-1}}$ and $n = 0.35$.

**A13.** On a solid motor's head-end pressure trace, erosive burning shows up as:

- **(a)** a step increase part-way through the burn that does not decay
- **(b)** a hump in the first few percent of the burn that decays as the port opens
- **(c)** a slow monotonic decline over the whole burn
- **(d)** a long low-pressure tail after the main tail-off

**A14.** State the aft-end port-to-throat area ratio $J$ below which a visible
erosive hump is almost certain.

**A15.** Delivered specific impulse of a well-made gaseous-nitrogen cold-gas
thruster is closest to:

- **(a)** 30–40 s  **(b)** 65–73 s  **(c)** 110–130 s  **(d)** 180–200 s

**A16.** State the usable mass fraction of an unregulated gas tank blown down
10:1, on the isothermal assumption.

**A17.** A seat is leak-tested with helium and the flight fluid is nitrogen. In
the **molecular (Knudsen)** regime the measured helium rate must be multiplied
by which factor to give the nitrogen rate?

- **(a)** $\sqrt{M_{He}/M_{N_2}} = 0.378$
- **(b)** $\sqrt{M_{N_2}/M_{He}} = 2.645$
- **(c)** $M_{N_2}/M_{He} = 7.00$
- **(d)** 1.00 — leak rate is independent of gas in that regime

**A18.** Name the flown chemical rocket engine with the highest specific
impulse ever demonstrated in flight, and give the figure.

**A19.** An interviewer describes an engine: gas-generator cycle, its turbine
exhaust dumped into the nozzle extension as a film-cooling curtain; a
tube-wall chamber of 178 brazed tubes; a flat-face injector split into 13
compartments by copper baffles; a single direct-drive shaft at 5,488 rpm.
Name the engine.

**A20.** In this course's tagging scheme, the Bartz correlation for gas-side
heat-transfer coefficient carries which tag, and why in one clause?

- **(a)** [F]  **(b)** [E]  **(c)** [H]  **(d)** [R]

---

# Section B — Calculation (40 points, 10 points each)

## B1 (10 points) — FX-250: performance chain into the heat-transfer chain

**FX-250** is a fictional staged-combustion LOX/LCH₄ booster engine. Design
point, vacuum:

| quantity | symbol | value |
|---|---|---|
| vacuum thrust | $F_{vac}$ | 1,200 kN |
| nozzle-stagnation chamber pressure | $p_c$ | 250 bar |
| mixture ratio (mass) | $MR$ | 3.40 |
| expansion ratio | $\varepsilon$ | 40.0 |
| chamber stagnation temperature | $T_0$ | 3,600 K |
| exhaust ratio of specific heats | $\gamma$ | 1.16 |
| mean molar mass | $\mathcal{M}$ | 21.0 kg/kmol |
| $c^*$ efficiency | $\eta_{c^*}$ | 0.960 |
| stagnation viscosity | $\mu_0$ | $9.50\times10^{-5}$ Pa·s |
| throat radius of curvature (upstream) | $r_{cu}$ | $1.50\,R_t$ |

Take $c_{p0}=\gamma R/(\gamma-1)$ and $\mathrm{Pr}_0 = 4\gamma/(9\gamma-5)$.

**(a)** (3 pts) Compute $R$, $\Gamma(\gamma)$, the ideal and delivered $c^*$,
the vacuum $C_F$, the throat area $A_t$ and diameter $D_t$, the total mass flow
$\dot m$, the propellant split $\dot m_o$ and $\dot m_f$, and the vacuum
$I_{sp}$. State which of $c^*_{ideal}$ or $c^*_{del}$ belongs in
$\dot m = p_cA_t/c^*$ and why.

**(b)** (3 pts) Assume a first-guess gas-side wall temperature
$T_{wg} = 800$ K. Compute the Bartz property factor $\sigma$, the gas-side
coefficient $h_g$ at the throat, the adiabatic wall temperature $T_{aw}$
(recovery factor $r = 0.90$), and the throat heat flux $q''$. Compare $q''$
with the RS-25 figure you quoted in A6 and say whether the comparison is
consistent with the pressure ratio between the two engines.

**(c)** (2 pts) The liner is 0.80 mm of GRCop-42, $k = 290$ W/(m·K). Compute
the through-wall temperature drop at your $q''$ and the coolant-side wall
temperature. Then compute the coolant-side heat-transfer coefficient that
would be required to hold $T_{wg} = 800$ K with methane at a bulk temperature
of 290 K, and comment on that number.

**(d)** (2 pts) The best methane-side coefficient the channel designer will
promise is $h_c = 1.5\times10^{5}$ W/(m²·K). With the same 0.80 mm wall, the
same 800 K hot-wall limit and the same 290 K bulk, compute the largest heat
flux the wall can pass, and the factor by which the Bartz throat flux exceeds
it. Name the **two** effects that close that gap in a real engine, and say
which of the two you would refuse to carry as margin in a design memo, and why.

---

## B2 (10 points) — FX-250: turbopump and cycle balance

Same engine, same flows as B1(a). FX-250 is **fuel-rich staged combustion**:
the whole fuel flow passes the cooling jacket, then the preburner, then the
turbine, then the main injector; the oxidiser goes straight to the main
injector except for the preburner oxidiser, which is raised by a separate
boost stage.

| quantity | value |
|---|---|
| preburner pressure $p_{pb}$ | 480 bar |
| preburner mixture ratio $MR_{pb}$ | 0.400 |
| turbine inlet temperature $T_t$ | 750 K |
| preburner gas $\mathcal{M}_t$, $\gamma_t$ | 14.0 kg/kmol, 1.32 |
| turbine efficiency $\eta_t$ | 0.78 |
| mechanical efficiency $\eta_m$ | 0.98 |
| fuel pump efficiency $\eta_{p,f}$ | 0.75 |
| oxidiser pump efficiency $\eta_{p,o}$ | 0.78 |
| main-injector drop (both sides) $\Delta p_{inj}$ | 40 bar |
| cooling-jacket drop $\Delta p_j$ | 45 bar |
| preburner injector drop | 25 bar |
| lines and valves, each circuit | 10 bar |
| pump inlet pressures (fuel / ox) | 8 bar / 6 bar |
| $\rho_{LOX}$, $\rho_{LCH_4}$ | 1,140 / 422 kg/m³ |
| preburner-oxidiser boost stage | 0.80 MW (given) |

**(a)** (3 pts) Build the pressure budget. Compute the fuel and oxidiser pump
discharge pressures and pressure rises, the head each pump develops, and the
shaft power each absorbs. Report the total shaft power the turbine must
deliver, including $\eta_m$ and the boost stage.

**(b)** (3 pts) Compute the turbine gas $R_t$ and $c_{p,t}$, the turbine
pressure ratio $\pi_t$, the specific work $w_t$, the turbine mass flow
available, and the power the turbine actually delivers. **Does the cycle
close?** If not, compute the turbine inlet temperature that would close it,
and state the consequence of that temperature for the turbine blade material
and for the preburner.

**(c)** (2 pts) Now suppose the same thrust chamber were fed by an **open gas
generator** instead: fuel pump discharge $= p_c + \Delta p_{inj} + \Delta p_j
+ 10$ bar, oxidiser discharge as before, gas generator at 300 bar exhausting
to 2.0 bar, $T_{gg} = 900$ K, $\mathcal{M}_{gg} = 14.5$ kg/kmol,
$\gamma_{gg} = 1.30$, $\eta_t = 0.62$. Compute the required turbine flow, its
fraction of main flow, and — taking the dumped exhaust to deliver
$I_{sp,gg} = 110$ s — the effective engine $I_{sp}$ and the loss in seconds.

**(d)** (2 pts) The LOX tank is regulated to 3.5 bar, LOX vapour pressure at
the pump inlet is 1.5 bar, the liquid column above the inlet is 6.0 m, the
feed line loses 0.35 bar and the vehicle is accelerating at $1.35\,g_0$.
Compute $\mathrm{NPSH}_a$ and the suction specific speed at 11,500 rpm. Say
whether an inducer is required and what fixes the problem if it is not enough.

---

## B3 (10 points) — Internal ballistics with erosive burning and temperature sensitivity

The **EXAM-F** propellant (generic, not a real formulation):

| property | symbol | value |
|---|---|---|
| burn rate at 6.00 MPa | $r_{ref}$ | 7.20 mm/s |
| pressure exponent | $n$ | 0.35 |
| density | $\rho_p$ | 1,770 kg/m³ |
| delivered characteristic velocity | $c^*$ | 1,545 m/s |
| temperature sensitivity of burn rate | $\sigma_p$ | 0.0021 K⁻¹ |
| exhaust ratio of specific heats | $\gamma$ | 1.18 |

A generic tactical sustainer motor uses a **finocyl** grain whose burnback
analysis gives a burning area neutral within $\pm 4$ % at
$A_b = 1.4451\ \mathrm{m^2}$ over the whole web. The aft-end port is circular
at ignition with bore diameter $D_p = 100.0$ mm and grain length 4.60 m. The
throat is $D_t = 74.0$ mm and does not erode over the interval considered.
Web thickness 95.0 mm; nominal web time 22 s; $\varepsilon = 9.0$, vacuum.
Threshold erosive model (Module 20, Eq. 3.12), constants generic:
$G_{th} = 1{,}150\ \mathrm{kg\,m^{-2}s^{-1}}$,
$k = 1.60\times10^{-6}\ \mathrm{m^3/kg}$. The aft **30 %** of the burning
surface sees the full aft-end flux; the forward 70 % is below threshold.
Motor MEOP is 9.50 MPa and the case burst pressure is $1.40\times$ MEOP.

**(a)** (2 pts) Convert $r_{ref}$ into the SI coefficient $a$ in
$\mathrm{m\,s^{-1}Pa^{-n}}$. Compute $A_t$, $K_n$, the **non-erosive**
equilibrium chamber pressure, the burn rate at that pressure, and $\dot m$.

**(b)** (1 pt) Compute the aft-end port area and $J = A_p/A_t$, and the
aft-end mass flux $G$ at the non-erosive pressure. State, with the reason,
whether an erosive hump is expected.

**(c)** (3 pts) Solve the **coupled** erosive equilibrium. Show at least three
iterations of your loop and report the converged chamber pressure, the mean
burn rate, the aft-end local burn rate, the local augmentation ratio, and the
percentage by which the erosive pressure exceeds the non-erosive prediction.
State in one sentence why evaluating the erosive term once at the non-erosive
pressure is wrong.

**(d)** (2 pts) The motor is conditioned to $+30$ K above the reference
temperature. Compute $\pi_K$, the hot non-erosive pressure, and the hot
**erosive** pressure by re-running your loop. Compare the worst case with
MEOP and with burst, and name three further contributors that belong in the
stack before you sign the case off.

**(e)** (2 pts) The chamber pressure is held constant by the neutral grain.
Compute the aft-end port diameter at which the erosive term extinguishes, the
web burned to reach it, and the fraction of the nominal web time over which
the hump persists. State the one geometric change you would make to the grain
to remove the hump, and what it costs.

---

## B4 (10 points) — Cold-gas blowdown module: sizing from a total-impulse requirement

A 145 kg ESPA-class spacecraft carries an **unregulated blowdown** cold-gas
module for drag make-up and collision avoidance.

| requirement / property | value |
|---|---|
| delivered total impulse | 1,150 N·s |
| propellant | GN₂, $\mathcal{M} = 28.014$ kg/kmol, $\gamma = 1.400$ |
| tank initial pressure / temperature | 200 bar / 293.15 K |
| compressibility at fill, $Z_i$ | 1.05 |
| end-of-life tank pressure | 20.0 bar |
| nozzle area ratio | $\varepsilon = 60$, vacuum |
| realisation factor on ideal $I_{sp}$ | 0.90 |
| minimum acceptable end-of-life thrust | 0.350 N |
| tank fill fraction (ullage-free spherical tank) | 95 % of internal volume |

**(a)** (3 pts) Compute the ideal vacuum $I_{sp}$ at $\varepsilon = 60$ and the
delivered $I_{sp}$. Compute the usable propellant mass, the isothermal usable
fraction over the stated blowdown, the loaded gas mass, the required internal
tank volume, and the diameter of the spherical tank that holds it.

**(b)** (2 pts) Size the thruster. Compute the vacuum $C_F$ at
$\varepsilon = 60$, the throat area and throat diameter that give exactly the
minimum end-of-life thrust, the beginning-of-life thrust, and the mass flow at
both ends. State the control problem the resulting thrust ratio creates and the
two standard fixes.

**(c)** (3 pts) Repeat the propellant bookkeeping on the **adiabatic** bound:
compute the adiabatic usable fraction, the final gas temperature, the usable
mass, the shortfall against the isothermal answer as a percentage, and the
specific impulse at cut-off. State which bound the real tank sits nearer and
what physical parameter decides it.

**(d)** (2 pts) A colleague proposes argon ($\mathcal{M} = 39.948$ kg/kmol,
$\gamma = 1.667$, $Z_i = 1.02$) in the **same tank at the same pressures**.
Compute argon's ideal and delivered $I_{sp}$ at $\varepsilon = 60$, the loaded
mass, and the delivered total impulse. Then state which propellant you would
fly, on what criterion, and what would reverse your answer.

---

# Section C — Diagnosis (20 points, 10 points each)

## C1 (10 points) — A liquid engine acceptance series that drifts

**TR-90** is a fictional 90 kN-class LOX/RP-1 gas-generator engine, tested at
sea level. Constants for the reduction: $A_t = 9.600\times10^{-3}\ \mathrm{m^2}$,
$\varepsilon = 14.0$, $\gamma = 1.20$, contraction ratio $\varepsilon_c = 2.5$
for which the injector-end to nozzle-stagnation correction is
$p_{c,ns} = p_{c,inj}/1.030$. Ideal $c^*$ for this propellant at the run
mixture ratio is 1,798.6 m/s. Fuel density 810 kg/m³; injector fuel orifices
are 1.60 mm diameter, $C_d = 0.80$.

The acceptance series is five identical 65 s runs. The propellant lot,
facility, instrumentation calibration and ambient conditions did not change.

| | run 1 (accepted) | run 5 |
|---|---|---|
| total flow $\dot m$ | 33.50 kg/s | 33.50 kg/s |
| mixture ratio | 2.35 | 2.35 |
| injector-end $p_{c,inj}$ | 62.00 bar | 60.40 bar |
| fuel injector $\Delta p$ | 11.20 bar | 9.10 bar |
| oxidiser injector $\Delta p$ | 12.40 bar | 12.30 bar |
| measured sea-level thrust | 89.4 kN | 86.7 kN |
| chamber wall thermocouple, one azimuth | 690 K | 781 K |
| all other wall thermocouples | 660–700 K | 665–705 K |
| low-frequency $p_c$ oscillation at 60 % throttle | none | 220 Hz, 1.5 % of $p_c$ |
| post-test throat measurement | nominal | nominal within 0.3 % |
| post-test borescope | clean | radial streaking on the fuel side of 6 injector elements |

**(a)** (3 pts) Reduce both runs: compute $p_{c,ns}$, the delivered $c^*$, the
$c^*$ efficiency, the **measured** thrust coefficient
$C_{F} = F/(p_{c,ns}A_t)$ together with its efficiency against the ideal
sea-level $C_F$ at that $p_{c,ns}$, and the delivered $I_{sp}$. Then state how
much of the thrust loss is $c^*$ and how much is $C_F$.

**(b)** (2 pts) At constant fuel flow and constant density, compute the
fractional change in the fuel injector's effective flow area $C_dA$ implied by
the change in $\Delta p$. Compute the number of 1.60 mm orifices run 1's
$C_dA$ corresponds to, and comment on whether six streaked elements can
account for the whole change.

**(c)** (2 pts) Compute $\Delta p_{inj,f}/p_{c,inj}$ for both runs and place
each in the stability band from A4. Explain the appearance of the 220 Hz
oscillation at 60 % throttle in terms of the quantity you just computed, and
name the frequency band and the coupling mechanism it belongs to.

**(d)** (3 pts) Give your diagnosis in one sentence. Then take these four
candidate explanations and say, for each, what evidence in the record rules it
in or out: (i) throat erosion; (ii) a drifting fuel flowmeter; (iii) injector
face erosion or orifice enlargement; (iv) a shift in mixture ratio. Finally,
name the one measurement you would add to the next run to settle it, and the
instrument you would use.

---

## C2 (10 points) — A solid motor qualification firing with three separate anomalies

A qualification static firing of a generic tactical motor using the **EXAM-F**
propellant of B3 ($n = 0.35$, $\gamma = 1.18$, $c^* = 1,545$ m/s,
$\varepsilon = 9.0$ nominal). The predicted trace is a flat 6.98 MPa for 24.0 s
followed by a 2.0 s tail-off. The record:

- Ignition normal. Head-end pressure peaks at **8.15 MPa at $t = 0.25$ s**,
  then decays smoothly to **6.98 MPa by $t = 3.4$ s**.
- Flat within $\pm 1.5$ % from 3.4 s to 18.0 s.
- From $t = 18.0$ s the pressure **rises smoothly to 7.60 MPa** by $t = 24.0$ s.
- Tail-off begins at 24.5 s, takes **4.2 s** (predicted 2.0 s), and ends in a
  long low tail below 0.5 MPa.
- $\int p_c\,dt$ over the record is **1.5 % above** prediction.
- Delivered vacuum $I_{sp}$, computed on **loaded** propellant mass, is
  **3.1 % below** prediction.
- Post-fire: throat area at end of burn **4.0 % larger** than the predicted
  eroded area, and **1.5 % larger** when area-averaged over the burn; a
  12 mm-deep asymmetric gouge in the nozzle entry at one azimuth; aft-dome
  insulation char depth twice predicted.
- The propellant lot's strand-burner data were nominal and the four previous
  motors from the same lot were nominal.

**(a)** (2 pts) From the 8.15 → 6.98 MPa decay, compute the mean burning-rate
multiplier implied at $t = 0.25$ s, and the **local** multiplier if only the
aft 30 % of the surface is affected. Name the phenomenon and say why it decays.

**(b)** (2 pts) From the 6.98 → 7.60 MPa rise between 18.0 s and 24.0 s,
compute the implied fractional increase in burning area. Give the two
mechanisms that produce a *smooth ramp* rather than a step, and say which one
the aft-dome char evidence supports.

**(c)** (2 pts) Compute the chamber-pressure effect of a 4.0 % throat-area
growth at fixed burning area, and the $C_F$ and $I_{sp}$ effect of the
resulting expansion-ratio loss at end of burn. Show that the $C_F$ term alone
is far too small to explain a 3.1 % $I_{sp}$ shortfall.

**(d)** (2 pts) Reconcile the two integrated numbers. Write total impulse as
$I_t = \overline{C_F}\,\overline{A_t}\int p_c\,dt$, use the burn-averaged
$A_t$ and $C_F$ figures, and compute the total impulse the **trace** predicts
relative to the nominal. Compare it with the measured $-3.1$ %, state the size
of the unaccounted impulse deficit, and explain why $\int p_c\,dt$ and $I_t$
are **not** proportional in a metallised motor. Name the post-fire measurement
that would confirm your explanation.

**(e)** (2 pts) Give a one-sentence diagnosis for each of the three anomalies,
then state which single one you would refuse to certify around and why. Name
the instrumentation you would add to the next motor for each anomaly, and say
which of the three is invisible on a head-end pressure transducer.

---

# Section D — Design and trade (20 points)

## D1 (20 points) — Propulsion architecture for the AURELIA-G mission

**Mission.** AURELIA-G is a fictional 620 kg (dry, excluding all propulsion
hardware and propellant) communications demonstrator. It rides to GTO as a
rideshare and must:

1. **R-1.** Deliver $\Delta v_1 = 1{,}450$ m/s to circularise at GEO, in **at
   least three separate burns** spread over up to **40 days**, with at least one
   burn commanded after a 30-day coast.
2. **R-2.** Deliver $\Delta v_2 = 120$ m/s of station-keeping over an 8-year
   life, in **not fewer than 400 discrete burns**, minimum impulse bit
   $\le 5$ N·s.
3. **R-3.** Fit inside a 1,250 kg rideshare wet-mass allocation.
4. **R-4.** Be ready for a launch 26 months from authority to proceed.
5. **R-5.** Be single-fault tolerant against loss of the mission after the
   first burn of R-1.

**Candidate architectures.** Inert mass is modelled as
$m_{inert} = m_{fixed} + k\,m_p$ for each stage.

| | architecture | $I_{sp}$ (s) | $k$ | $m_{fixed}$ (kg) |
|---|---|---|---|---|
| **A** | solid kick motor for R-1, **plus** a hydrazine monopropellant system for R-2 | 289 (solid) / 225 (monoprop) | 0.099 / 0.28 | 3.0 / 4.0 |
| **B** | one pressure-fed NTO/MMH bipropellant system for R-1 and R-2 | 315 | 0.20 | 14.0 |
| **C** | one electric-pump-fed NTO/MMH system for R-1 and R-2 | 322 | 0.135 | 26.0 |
| **D** | one GN₂ cold-gas system for R-1 and R-2 | 68 | 0.55 | 6.0 |

**(a)** (3 pts) State the closure condition of Module 32 in the form
$k\left(e^{\Delta v/c}-1\right) < 1$, explain in two sentences what it means
physically, and evaluate it for architecture **D** against the full 1,570 m/s.
Declare D feasible or infeasible **before** sizing it, and then show what
architecture D would need for R-2 alone to make the point quantitatively.

**(b)** (6 pts) Size architectures **A**, **B** and **C**. For A, size the
monopropellant system first and the solid second, because the solid must
accelerate everything the monopropellant system will later carry. Report for
each: propellant mass, inert mass, total propulsion system mass, and total wet
mass at separation from the rideshare. Check each against R-3.

**(c)** (4 pts) Build a **Pugh matrix** with **B as the datum**, scoring the
candidates that survive your part-(a) screen as $+$, $0$ or $-$ against at
least **eight** criteria. Say explicitly what you did with any candidate that
did not survive, and why. Your criteria
must include, at minimum: wet mass, compliance with R-1 (multi-burn),
compliance with R-2 (minimum impulse bit), single-fault tolerance (R-5),
development schedule against R-4, technology readiness, ground handling and
range safety, and recurring cost. State your weighting scheme explicitly and
give the weighted totals. A matrix with no stated weighting scores half marks.

**(d)** (4 pts) Sensitivity. For your recommended architecture, compute the
change in wet mass for each of: $I_{sp}$ $\pm 10$ s; $k$ $\pm 0.03$;
$\Delta v_1$ $\pm 100$ m/s. Present the three as a ranked list with units of
kg per unit of the driving parameter. Then answer: **which single parameter,
if it moved against you by the amount you computed, would change your
recommendation, and to what?**

**(e)** (3 pts) Write the recommendation as it would appear at the top of a
one-page decision memo: the architecture, the two strongest reasons, the
strongest argument against it, the one piece of evidence you would go and get
before the design freezes, and the decision date by which it must arrive. Name
one flown programme that made the opposite choice and say what was different
about its requirements.

---

*End of paper. Total: 100 points.*
