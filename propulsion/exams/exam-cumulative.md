# Cumulative Exam — Parts I–V (Modules 01–36)

**PROPULSION — a rocket propulsion engineering course**
**Time: 4 hours. Total: 100 points.** Closed book except the permitted
material below.

This paper is deliberately *integrative*. The five long problems each cut
across three or more Parts of the course: a problem that begins in Part I
thermodynamics ends in Part II materials and Part V test planning, and a
problem that begins with a solid grain ends with a case, a nozzle insert and
a failure diagnosis. The ten short-answer items sample what the long
problems do not reach.

---

## Instructions

- **SI units throughout.** $g_0 = 9.80665\ \mathrm{m/s^2}$,
  $R_u = 8314.46\ \mathrm{J/(kmol\,K)}$. Sea-level ambient
  $p_a = 101\,325$ Pa unless a question says otherwise. An answer without a
  unit is wrong even when the digits are right.
- **Show every step.** Grading is method-first: a correct setup with an
  arithmetic slip loses at most 30 % of that part's marks; a correct number
  from a wrong setup scores zero.
- Quote answers to **four significant figures** unless told otherwise, and
  **state every assumption you have to make yourself** — chosen $\gamma$,
  chosen efficiency, chosen station convention.
- **Chamber pressure convention.** Unless a question says otherwise, $p_c$ is
  the stagnation pressure at the injector face, per the course README. Where
  a question hands you a published engine figure, carry the engine
  database's caveat with it. Quoting a contested or company-claimed number as
  if it were exact loses marks even when the arithmetic is right.
- **Permitted:** a non-programmable calculator, the course equation sheet
  (`reference/equation-sheet.md`), and the extracts printed inside the
  questions. Nothing else.
- Every engine, motor, grain, thruster and factory that is not named from the
  engine database is **generic or fictional**, and its coefficients are not
  any manufacturer's data.
- Sections may be attempted in any order. Marks are shown for every part.

| section | contents | points | suggested time |
|---|---|---|---|
| **1** | RE-1000: a kerolox gas-generator booster engine, end to end | 18 | 50 min |
| **2** | A composite-cased solid booster, from grain to anomaly | 17 | 45 min |
| **3** | Cold-gas attitude control against a monopropellant alternative | 15 | 35 min |
| **4** | Failure diagnosis from a hot-fire trace set | 15 | 35 min |
| **5** | Cross-system selection for a lunar kick stage | 15 | 35 min |
| **6** | Ten short-answer items | 20 | 25 min |
| | | **100** | **3 h 45 + 15 min review** |

---

# Problem 1 — RE-1000, a kerolox gas-generator booster engine (18 points)

*Cuts across modules 01, 03, 06, 07, 10, 11, 12, 13, 16, 18.*

**RE-1000** is a fictional LOX/RP-1 open gas-generator booster engine. You are
the responsible engineer taking it from a thrust requirement to a test plan.

**Requirement and predicted properties**

| quantity | symbol | value |
|---|---|---|
| sea-level thrust | $F_{SL}$ | 1000 kN |
| chamber stagnation pressure (injector face) | $p_c$ | 100.0 bar |
| ratio of specific heats, main chamber | $\gamma$ | 1.21 |
| mean molar mass, main chamber | $\mathcal{M}$ | 23.3 kg/kmol |
| chamber stagnation temperature | $T_0$ | 3600 K |
| expansion ratio | $\varepsilon$ | 16.0 |
| mixture ratio (O/F, mass) | $r$ | 2.35 |
| characteristic-velocity efficiency | $\eta_{c^*}$ | 0.960 |
| thrust-coefficient efficiency | $\eta_{C_f}$ | 0.980 |
| characteristic chamber length | $L^*$ | 1.10 m |
| contraction ratio $A_c/A_t$ | $\varepsilon_c$ | 2.00 |

Take the nozzle-stagnation pressure equal to the injector-face value for
sizing, and say in one line what that assumption costs you.

**(a) (4 points) — Size the thrust chamber.**
Compute, in this order and showing the chain: $R$; $\Gamma(\gamma)$; the ideal
and delivered $c^*$; the **ideal** sea-level and vacuum thrust coefficients at
$\varepsilon = 16.0$; the **delivered** $C_f$ at both conditions; delivered
sea-level and vacuum $I_{sp}$; the throat area and diameter; the exit area and
diameter; total mass flow and the oxidiser and fuel flows separately. Verify
the throat area a second way, from $\dot m$ and $c^*$. Finish with a one-line
sanity check against the **Merlin 1D** row of the engine database, carrying
that row's confidence tags.

**(b) (3 points) — Chamber and injector.**
1. Compute the chamber volume from $L^*$, the chamber cross-sectional area
   and diameter from $\varepsilon_c$, and the cylindrical length if the
   convergent section holds 20 % of the chamber volume.
2. Compute the chamber gas density and the mean residence time in
   milliseconds, and say whether it is comfortable for a kerolox spray.
3. The injector runs $\Delta p_f/p_c = 0.20$ on the fuel side and
   $\Delta p_o/p_c = 0.15$ on the oxidiser side. With
   $\rho_{RP-1} = 810\ \mathrm{kg/m^3}$, $\rho_{LOX} = 1140\ \mathrm{kg/m^3}$,
   $C_{d,f} = 0.78$ with 1.40 mm orifices and $C_{d,o} = 0.80$ with 1.80 mm
   orifices, compute the total orifice area, the orifice count and the jet
   velocity on each side. State whether the fuel-side $\Delta p/p_c$ sits
   inside the chug-stability band and name the band.

**(c) (2 points) — Cooling channels.**
All of the fuel is used as the regenerative coolant. At the throat the liner
carries rectangular channels **2.00 mm wide × 4.50 mm high** on **1.50 mm
lands**. Coolant properties at the throat station:
$\rho = 780\ \mathrm{kg/m^3}$, $c_p = 2100\ \mathrm{J/(kg\,K)}$,
$k = 0.120\ \mathrm{W/(m\,K)}$, $\mu = 4.00\times10^{-4}$ Pa·s.
Compute the channel count that fits the throat circumference, the per-channel
mass flow, the coolant velocity, the hydraulic diameter, the Reynolds and
Prandtl numbers, and the coolant-side heat-transfer coefficient from
Dittus–Boelter with $n = 0.4$. The jacket absorbs a total of **25.0 MW**;
compute the coolant bulk temperature rise and the outlet bulk temperature
from a 300 K inlet.

**(d) (3 points) — Throat heat flux, and why the first answer is wrong.**
Bartz inputs at the throat: $\mu_0 = 9.00\times10^{-5}$ Pa·s,
$c_{p,0} = 1900\ \mathrm{J/(kg\,K)}$, $Pr_0 = 0.500$, throat radius of
curvature $r_c = 1.5\,R_t$, delivered $c^*$ from (a).

1. Compute $T_{aw}$ at the throat with a recovery factor $r = 0.90$, then
   $\sigma$, $h_g$ and $q''$ **assuming** a gas-side wall temperature
   $T_{wg} = 800$ K.
2. That assumption is not free. Solve the series chain
   $q'' = h_g(T_{aw}-T_{wg}) = (k_w/t)(T_{wg}-T_{wc}) = h_c(T_{wc}-T_b)$
   **self-consistently** (iterate on $\sigma$) for a 0.900 mm GRCop-42 hot
   wall, $k_w = 320\ \mathrm{W/(m\,K)}$, using your $h_c$ and outlet bulk
   temperature from (c). Report $q''$, $T_{wg}$, $T_{wc}$, the through-wall
   $\Delta T$, and the constrained thermal stress with
   $E = 98$ GPa, $\alpha = 17.0\times10^{-6}\ \mathrm{K^{-1}}$, $\nu = 0.33$.
   Compare $T_{wg}$ with the 800 K GRCop-42 design limit, $T_{wc}$ with the
   RP-1 coking limit of about 600 K, and the thermal stress with the ~100 MPa
   hot yield strength. State the verdict in one sentence.
3. Two things are missing from that model. Add both: a kerolox **soot layer**
   of thermal resistance $R_s = 3.00\times10^{-5}\ \mathrm{m^2K/W}$ [E], and
   **6.0 % of the fuel injected as film coolant**, which reduces the effective
   driving temperature to $T_{aw,\mathrm{eff}} = 2600$ K [E, given]. Re-solve
   and report $q''$, $T_{wg}$, $T_{wc}$. Then compute the specific-impulse
   penalty of the film, taking film coolant as contributing at 60 % of
   mainstream $I_{sp}$. Say in one sentence what the remaining margin problem
   is and name the historical engine whose chamber pressure choice was made
   for exactly this reason.

**(e) (2 points) — Pumps.**
Pump discharge pressures are built as follows. **Fuel:** $p_c$ + injector drop
+ 45.0 bar jacket + 5.0 bar lines. **Oxidiser:** $p_c$ + injector drop
+ 5.0 bar dome and lines. Both pump inlets are at 4.00 bar. Pump efficiencies
are $\eta_f = 0.72$ and $\eta_o = 0.74$; mechanical efficiency
$\eta_m = 0.98$. Compute each pump's rise, head and shaft power, the total
pump power, and the turbine shaft power required.

**(f) (2 points) — Gas generator and its price.**
The gas generator delivers turbine gas at $T_t = 1000$ K with
$c_p = 2050\ \mathrm{J/(kg\,K)}$ and $\gamma_t = 1.22$, expanded through
$\pi_t = 24.0$ at $\eta_t = 0.600$. The turbine exhaust is ducted overboard
and delivers $I_{sp,gg} = 95.0$ s at sea level.
1. Compute the specific turbine work, the gas-generator mass flow, and the GG
   flow as a percentage of total **engine** flow.
2. Compute the engine-level sea-level $I_{sp}$ including the overboard
   exhaust, and hence the specific-impulse penalty of the cycle in seconds.
   Add the film-cooling penalty from (d) and state the combined figure.
3. State in one sentence what the F-1 did with its gas-generator exhaust
   instead, and what that bought.

**(g) (2 points) — Materials and test plan.**
1. Name the alloy family you would specify for the **liner**, the **jacket**,
   the **turbine manifold** and the **LOX pump housing**, and give the *index*
   that decides each one (not the alloy's marketing).
2. Your answer to (d) says the liner is strain-controlled, not
   stress-controlled. Say what that changes about how you qualify the
   chamber, and name the **one** hot-fire measurement and the **one**
   post-test inspection you would make mandatory on every development firing
   to detect the failure mode of (d) before it is terminal.

---

# Problem 2 — A composite-cased solid booster (17 points)

*Cuts across modules 19, 20, 21, 22, 23, 24, 26, 32, 34.*

Every motor, propellant and factory below is generic or fictional.

**Exam propellant "S-2"** — a generic aluminised AP/HTPB-class composite. It
is **not** a real formulation and its coefficients are not any manufacturer's
data.

| property | symbol | value |
|---|---|---|
| burn rate at 6.00 MPa | $r_{\mathrm{ref}}$ | 7.20 mm/s |
| pressure exponent | $n$ | 0.350 |
| density | $\rho_p$ | 1770 kg/m³ |
| delivered characteristic velocity | $c^*$ | 1560 m/s |
| temperature sensitivity of burn rate | $\sigma_p$ | 0.00200 K⁻¹ |
| exhaust ratio of specific heats | $\gamma$ | 1.15 |

**The motor.** A monolithic filament-wound strap-on. Case internal radius
$R_c = 0.800$ m, cylindrical length $L_c = 8.00$ m (treat the case as a plain
cylinder for stress and account for domes, skirts and the aft closure with a
flat **1.25×** multiplier on the membrane mass). The grain is a slotted tube
whose burn-back analysis returns a **neutral** burning area
$A_b = 28.30\ \mathrm{m^2} \pm 3\ \%$ over a web of $w_b = 0.500$ m, ends
inhibited. Initial throat diameter $D_{t0} = 0.340$ m, fixed exit area giving
$\varepsilon_0 = 11.0$. Vacuum operation. Qualification conditioning
temperature $+21\ ^\circ$C.

**(a) (3 points) — Internal ballistics.**
Compute the SI burn-rate coefficient $a$ from the quoted reference point; the
throat area; $K_n$; the equilibrium chamber pressure; the burn rate; the web
burn time; the propellant volume, volumetric loading fraction and propellant
mass; and the mass flow. Verify by showing that $m_p/t_b$ reproduces your
mass flow.

**(b) (3 points) — Delivered performance.**
Compute the vacuum thrust coefficient, vacuum thrust, vacuum $I_{sp}$, total
impulse and the **impulse density** $\rho_p I_{sp} g_0$ in N·s/L. Compare the
impulse density with the module 32 master-table range for solids and with
LOX/RP-1, and say in one sentence what that comparison buys a strap-on.

**(c) (4 points) — Case, mass fraction and the case-material argument.**
MEOP is built as
$\mathrm{MEOP} = p_{c,\mathrm{nom}}\,k_T k_{\mathrm{ign}} k_{\mathrm{mfg}}
k_{\mathrm{stat}}$ with $k_T$ from a $+30$ K hot-day soak using this
propellant's $\pi_K$, $k_{\mathrm{ign}} = 1.06$, $k_{\mathrm{mfg}} = 1.05$,
$k_{\mathrm{stat}} = 1.03$. Burst factor for a composite case
$j_b = 1.50$.

1. Compute $\pi_K$, $k_T$, MEOP and the burst pressure.
2. Size the carbon/epoxy cylinder by netting theory,
   $t_L = 1.5\,p_bR/(\sigma_f V_f)$, with $\sigma_f = 2550$ MPa,
   $V_f = 0.600$, laminate density 1580 kg/m³, and the 1.25× multiplier.
   Report thickness, $t/R$ (check the thin-wall assumption) and case mass.
3. Repeat for a D6AC-class steel case, $F_{tu} = 1500$ MPa,
   $\rho = 7830\ \mathrm{kg/m^3}$, membrane sizing at $p_b$.
4. Non-case, non-propellant hardware (nozzle, insulation, igniter, TVC) is
   6.0 % of propellant mass. Compute the propellant mass fraction $\zeta$ and
   the ideal $\Delta v$ of a stage consisting of the motor alone, for each
   case material, and both $PV/W$ values in km. State which single number a
   programme manager should be shown and why.

**(d) (3 points) — Throat erosion.**
The carbon–carbon insert erodes at
$\dot s = \dot s_{\mathrm{ref}}\,(p_c/p_{\mathrm{ref}})^{0.8}$ with
$\dot s_{\mathrm{ref}} = 0.100$ mm/s at $p_{\mathrm{ref}} = 6.00$ MPa.
1. Compute $\dot s$ at the initial chamber pressure.
2. Using the module 24 closed forms
   $p_c(t)/p_c(0) = (1+\dot s t/r_{t0})^{-2/(1-n)}$ and
   $F(t)/F(0) = (1+\dot s t/r_{t0})^{-2n/(1-n)}$ with $\dot s$ held at your
   answer to (1), compute the end-of-burn throat area ratio, chamber
   pressure, chamber-pressure ratio and thrust ratio.
3. Compute the eroded expansion ratio and the corresponding vacuum $C_F$ and
   $I_{sp}$, and report the $I_{sp}$ change in seconds. Then state, with a
   reason, which way the constant-$\dot s$ assumption errs against the true
   coupled solution, and why total impulse is nearly conserved while the
   trajectory is not.

**(e) (4 points) — Diagnose a cold-conditioned static firing.**
A qualification motor of this design is soaked to $-30\ ^\circ$C and static
fired. The record:

- Ignition normal; head-end pressure reaches steady state at $t = 0.5$ s.
- Steady head-end pressure **5.95 MPa**.
- Web burn time **72.3 s**.
- $\int p_c\,\mathrm{d}t$ over the record within **0.4 %** of the value
  predicted for the cold soak.
- Post-fire: throat diameter within 1 % of the predicted eroded value; case,
  joints and aft closure show no anomaly; insulation char depths nominal.
- A **40 Hz** oscillation of ±1.5 % amplitude is present on the head-end
  transducer for the first 8 s and then disappears.
- The propellant lot's strand data at $+21\ ^\circ$C were nominal, and three
  earlier motors from the same lot fired at $+21\ ^\circ$C were nominal.

1. Compute the **predicted** cold-soak chamber pressure and web burn time
   from $\pi_K$ and $\sigma_p$.
2. Compare with the record. From the pressure discrepancy alone, compute the
   fractional increase in burning area it implies, and show that the burn-time
   discrepancy is quantitatively consistent with it.
3. Show algebraically why $\int p_c\,\mathrm{d}t$ is the invariant that proves
   this is **not** a $c^*$, propellant-mass or throat-area problem. State what
   that integral equals.
4. Give your diagnosis in one sentence, name the module 34 failure class it
   belongs to, and say what the 40 Hz feature adds to the case. Then say what
   evidence would rule in or out each of: (i) an out-of-family burn-rate lot;
   (ii) an insulation-to-propellant debond; (iii) erosive burning; (iv) a
   mis-recorded soak temperature.

---

# Problem 3 — Cold-gas attitude control against a monopropellant (15 points)

*Cuts across modules 03, 12, 28, 29, 30, 31, 32, 33.*

**AURA-9** is a fictional 165 kg ESPA-class Earth-observation spacecraft in a
550 km sun-synchronous orbit with a 5.0-year design life. The propulsion
subsystem must provide reaction-wheel momentum dumping, drag make-up and
commissioning detumble.

**Requirements**

| item | value |
|---|---|
| wheel desaturations | 3 per week for 5.00 years, **0.800 N·m·s** of stored momentum each |
| desaturation thruster couple, moment arm | 0.450 m (a pure couple, two thrusters firing) |
| drag make-up | $\Delta v = 14.0$ m/s on the 165 kg spacecraft |
| commissioning detumble | 200 N·s, given |
| pointing | 0.02° control deadband; the ACS asks for a minimum impulse bit **below 1 mN·s** |
| propellant loss to leakage | ≤ 2.0 % of the load over 5.00 years |

**Baseline: cold gas.** GN₂ at $T_0 = 293.15$ K, $\gamma = 1.400$,
$\mathcal{M} = 28.014$ kg/kmol, nozzle $\varepsilon = 50$, realized $I_{sp}$
taken as **0.90 ×** the frozen-ideal value (module 28 §C.1.3). Stored in a
Type III COPV at 250 bar, **regulated** to a 5.00 bar plenum, and usable in
blowdown down to 20.0 bar. Treat the blowdown as **isothermal** and the gas
as ideal, and say in one line what each of those two assumptions costs.
Thruster steady thrust 50.0 mN; valve rise 4.0 ms, fall 3.0 ms.

**(a) (3 points)** Compute $R$, $\Gamma$, $c^*$, the vacuum $C_F$ at
$\varepsilon = 50$, the **ideal** vacuum $I_{sp}$ at 293.15 K and the realized
$I_{sp}$. Compare the ideal figure with the engine database's Part C value for
N₂ and account for the difference in one sentence.

**(b) (3 points)** Build the total-impulse budget: the impulse per
desaturation delivered by the couple, the number of desaturations, the
desaturation total, the drag-make-up propellant mass and its impulse from the
rocket equation, the detumble allocation, and the grand total. Then compute
the usable propellant mass required.

**(c) (3 points)** Compute the isothermal usable mass fraction between 250 bar
and 20.0 bar, the loaded propellant mass, the tank internal volume and the
tank mass for a COPV of $PV/W = 25.0$ km. Then size one thruster: the throat
area and diameter for 50.0 mN at the 5.00 bar plenum, the mass flow, and the
minimum impulse bit for a 5.0 ms command using the trapezoidal model. State
whether the MIB requirement is met.

**(d) (3 points)** The alternative is a hydrazine monopropellant system:
delivered $I_{sp} = 220$ s on the drag-make-up burns but only **140 s** in the
short desaturation pulses, $\rho = 1004\ \mathrm{kg/m^3}$, minimum impulse bit
20 mN·s, four thrusters each with a 10 W catalyst-bed heater that must be on
whenever a firing is possible. Compute its propellant mass and tank volume at
10 % ullage. Then build a two-column system-mass comparison (propellant,
tank, everything else — state and defend your own numbers for "everything
else") and state which system is lighter and by how much.

**(e) (3 points)** Convert the 2.0 % leak allowance into an allowable mass
loss, a mass-loss rate in mg/h, and a total system specification in **scc/h of
GN₂** (standard conditions 273.15 K, 101.325 kPa, $\rho_{std} = 1.2504$
kg/m³). Convert it to a **helium** acceptance specification twice — once in
the molecular-flow limit and once in the viscous limit
($\mu_{He} = 1.96\times10^{-5}$, $\mu_{N_2} = 1.78\times10^{-5}$ Pa·s) — and
say which you would write into the procurement specification and why. Finish
with a recommendation of **not more than 200 words** between the two systems.
It must name the criterion that decides it, and it must not be mass.

---

# Problem 4 — Failure diagnosis from a hot-fire trace set (15 points)

*Cuts across modules 03, 06, 07, 10, 11, 15, 18, 34, 36.*

The **RE-1000** of Problem 1 is now in development test. The production
configuration injects **6.0 % of the fuel through a rim film-cooling
manifold** fed from the jacket outlet, and the main injector was re-sized for
the remaining 94 % of the fuel at $\Delta p_f = 20.0$ bar. All other design
values are as in Problem 1.

Test 014, sea level, 120 s steady. Measured values, predicted in brackets:

| channel | measured | [predicted] |
|---|---|---|
| sea-level thrust $F$ | **1008 kN** | [1000 kN] |
| injector-face $p_c$ | **101.2 bar** | [100.0 bar] |
| oxidiser flow $\dot m_o$ | 262.9 kg/s | [262.9 kg/s] |
| total fuel flow $\dot m_f$ | 111.9 kg/s | [111.9 kg/s] |
| main-injector fuel $\Delta p_f$ | **22.4 bar** | [20.0 bar] |
| jacket $\Delta p$ | **51 bar** | [45 bar] |
| coolant outlet bulk temperature | **441 K** | [406 K] |
| coolant inlet bulk temperature | 300 K | [300 K] |
| dynamic pressure | broadband only; no discrete tone; no chug | [same] |

Post-test hardware:

- Throat diameter **283.4 mm** against an as-built **282.5 mm**.
- The last 150 mm of the barrel and the whole convergent section are **bare
  and bright**; the rest of the barrel carries the usual dull deposit.
- A blanched band about 40 mm upstream of the throat.
- The rim manifold's downstream face carries a hard grey scale; several rim
  orifices measure under-size on a pin gauge.

**(a) (3 points)** Compute the measured throat area and its ratio to as-built;
the measured $c^*$ and $\eta_{c^*}$ against the design 0.960; the effective
expansion ratio; the ideal sea-level $C_f$ at that effective $\varepsilon$ and
$p_c$; the measured $C_f$ and $\eta_{C_f}$; and the delivered sea-level
$I_{sp}$. State which single efficiency moved in the *unexpected* direction.

**(b) (3 points)** Treating the main injector's $C_dA$ as unchanged, compute
the core fuel flow implied by the measured $\Delta p_f$, and hence the film
fraction actually delivered. State the number to two decimal places as a
percentage of total fuel flow.

**(c) (3 points)** Compute the jacket heat load from the coolant flow and the
measured temperature rise, and its ratio to the predicted 25.0 MW. Then
compute, from your Problem 1(d) results, the ratio by which the *throat-local*
flux would rise if both the film and the soot layer were removed; if you did
not reach that part, write the ratio symbolically and argue the comparison
qualitatively for partial credit. Explain in
two sentences why the measured integrated jacket ratio is much smaller than
the throat-local ratio, and say whether the two are consistent.

**(d) (3 points)** Give your diagnosis in one sentence. Then take these four
candidates and say, for each, what evidence in the record rules it in or out:
(i) an out-of-family injector build with over-size main orifices; (ii)
coke deposition inside the cooling channels; (iii) loss of film cooling
through the rim manifold; (iv) a combustion instability driving the wall.

**(e) (3 points)** Classify the failure into one of the six module 34 failure
classes and justify the choice. Distinguish the **proximate** cause from the
**root** cause here, name the one additional measurement or inspection that
would confirm the root cause, and state the corrective action that class
demands — which is *not* the same as the action that fixes this engine.

---

# Problem 5 — Cross-system selection for a lunar kick stage (15 points)

*Cuts across modules 05, 13, 19, 26, 32, 33, 35.*

A fictional programme must deliver a **450 kg** payload from a
geostationary-transfer-orbit drop-off into low lunar orbit. The propulsion
stage is procured as a unit and must satisfy:

- **REQ-1** main $\Delta v$ **1750 m/s**, delivered in one burn;
- **REQ-2** a further **40 m/s** of midcourse correction, in at least four
  separate burns spread over the cruise;
- **REQ-3** a **6-month** cruise between drop-off and the main burn;
- **REQ-4** stage wet mass at separation **≤ 1100 kg** (a hard ESPA-class
  limit, not a preference);
- **REQ-5** the stage shall not preclude a rideshare launch (a constraint on
  stored energy and on hazardous processing at the pad).

Four candidate architectures. Inert mass is modelled as
$m_{inert} = k\,m_p + m_{fixed}$.

| | architecture | $I_{sp}$ (s) | $k$ | $m_{fixed}$ (kg) | notes |
|---|---|---|---|---|---|
| **A** | solid kick motor, monolithic composite case | 293 | 0.12 | 15 | no restart, no throttle, no midcourse capability of its own |
| **B** | storable pressure-fed N₂O₄/MMH | 322 | 0.24 | 35 | qualified hardware lineage; unlimited restarts |
| **C** | monopropellant hydrazine | 228 | 0.30 | 25 | simplest; unlimited restarts |
| **D** | LOX/CH₄ pump-fed | 365 | 0.20 | 60 | new development; cryogenic boil-off over the cruise |

**(a) (4 points)** For each architecture, derive and then evaluate the closed
form for propellant mass with a $k$-model inert mass:
$$m_p = \frac{(\mu-1)(m_{pl}+m_{fixed})}{1-k(\mu-1)},\qquad
\mu = e^{\Delta v/(I_{sp}g_0)}$$
Show the derivation in three lines. Then tabulate, for the 1750 m/s main
$\Delta v$: $\mu$, the closure quantity $k(\mu-1)$, propellant mass, inert
mass, stage wet mass and the stage propellant mass fraction. State what
$k(\mu-1) \ge 1$ would mean physically.

**(b) (3 points)** Screen the four against REQ-1 to REQ-5 *as constraints,
before any scoring*. Say which architectures survive and which requirement
each eliminated one fails. For architecture **A**, size the additional
monopropellant RCS module needed to meet REQ-2 (take $I_{sp} = 220$ s,
$k = 0.35$, $m_{fixed} = 8$ kg, acting on the payload plus the spent motor
inert mass) and add it to A's wet mass before you conclude.

**(c) (5 points)** Build a Pugh matrix for the **survivors** with **B as the
datum**, on a $-2\ldots+2$ scale, using exactly these criteria and weights:

| criterion | weight |
|---|---|
| delivered performance / mass margin against REQ-4 | 25 |
| development and schedule risk | 25 |
| long-coast and restart capability (REQ-2, REQ-3) | 20 |
| recurring cost | 15 |
| ground and range operations, rideshare compatibility (REQ-5) | 10 |
| single-point-failure count | 5 |

Justify every score in at most one line each. Compute the weighted totals.
Then **sweep the weights**: move the "development and schedule risk" weight
from 10 to 40, taking the difference proportionally from the other five, and
report the range over which the ranking survives. State the crossover weight
if there is one.

**(d) (3 points)** Write a recommendation of **not more than 250 words**. It
must: name the winner and the runner-up; state the single number that decides
it; name the one measurement or piece of information you could obtain in the
next quarter that would most change the answer, and which way; and say what
you would recommend instead if REQ-3 were relaxed from 6 months to 6 days.

---

# Problem 6 — Short answer (10 items × 2 points = 20 points)

Answer each in the space of a short paragraph or a short calculation. No
extended essays; the marks are for precision.

**6.1 (2 points) — Nozzle separation on the Problem 2 motor.**
The solid booster of Problem 2 is static fired at sea level rather than in
vacuum, at its initial chamber pressure with $\gamma = 1.15$ and
$\varepsilon = 11.0$. Use your answer to Problem 2(a) for $p_c$; if you did
not reach it, use 6.31 MPa and say so. Compute the exit Mach number and exit static pressure,
then apply **both** the Summerfield criterion and the Schmucker criterion
$p_{sep}/p_a = (1.88M_e - 1)^{-0.64}$. Does the nozzle flow full? Say which
criterion is the conservative one here and by how much they disagree.

**6.2 (2 points) — Frozen and equilibrium.**
State which of frozen and shifting-equilibrium nozzle flow bounds the real
delivered specific impulse from **above** and which from **below**, and why.
Give the approximate size of the gap for LOX/LH₂ and for a metallised solid,
and say which of the two sits nearer the frozen limit and what physical
feature of its exhaust puts it there.

**6.3 (2 points) — The RP-1 coking limit.**
State the mechanism of coking in a hydrocarbon cooling channel, the wall
temperature at which it becomes design-limiting, and the two things that go
wrong in the channel once a deposit forms. Then say why the coking limit —
and not chamber material strength — is what caps regeneratively cooled RP-1
chamber pressure, and name one flown engine whose architecture is a direct
consequence.

**6.4 (2 points) — Fuel lead or oxidiser lead.**
For **LOX/LH₂** and for **LOX/RP-1**, state which propellant you would lead
into the chamber at start, and defend each choice on wall-material, ignition-
delay and accumulation grounds. Then name the weakest assumption in the
standard constant-volume hard-start overpressure calculation.

**6.5 (2 points) — Water hammer in a LOX line.**
A LOX line ($\rho = 1140\ \mathrm{kg/m^3}$) carries flow at 8.00 m/s. The
pressure wave speed including wall elasticity is 1100 m/s and the run between
the valve and the tank is 4.50 m. Compute the Joukowsky surge for
instantaneous closure and the pipe period $2L/a$. The valve closes in 40 ms;
classify the closure and estimate the surge actually developed. State the one
additional phenomenon you would still check for in a **cryogenic** line that
you would not in an ambient hydraulic line.

**6.6 (2 points) — Chamber acoustics.**
For the RE-1000 chamber of Problem 1(b) with a chamber sound speed of
1150 m/s (take $D_c = 0.400$ m if you did not reach Problem 1(b)), compute the first tangential (1T) mode frequency using the Bessel
root 1.8412. State which transducer or sensor would see it and which would
not, and give the sample rate and anti-alias corner you would specify to
capture it honestly.

**6.7 (2 points) — Uncertainty budget.**
A hot fire measures thrust to ±0.30 % and total mass flow to ±0.25 %, both
1σ and independent. Derive $\partial I_{sp}/\partial F$ and
$\partial I_{sp}/\partial \dot m$, combine in root-sum-square, and report the
1σ uncertainty on the RE-1000's delivered sea-level $I_{sp}$ in per cent and
in seconds (take $I_{sp,SL} = 272$ s if you did not reach Problem 1(a)). Then state why averaging 500 samples of the steady segment
reduces some of that uncertainty and not the rest.

**6.8 (2 points) — Insulation.**
Distinguish **char rate**, **erosion rate** and **surface recession rate** in
a filled-elastomer motor insulator, and say which one a thickness sizing
actually uses. Then explain why exposure time at a given station is a function
of axial position and grain burn-back rather than a single number, and name
the station in the Problem 2 motor that sizes the insulation.

**6.9 (2 points) — Reading a published solid-motor figure.**
A trade study quotes "booster thrust 14.2 MN, $I_{sp}$ 286 s, burn time
128 s". State the **four** tags that figure must carry before you would use
it, and show with one line of arithmetic how a missing tag can produce a
factor-of-two error. Then state, in one sentence each, what the four-step case
material progression (steel → glass filament wound → Kevlar/epoxy →
carbon/epoxy) bought in propellant mass fraction and why segmented steel cases
nevertheless persisted.

**6.10 (2 points) — Believing the CFD or believing Bartz.**
A vendor delivers a conjugate-heat-transfer CFD result for a throat that sits
35 % below your Bartz estimate. Give **three** things that would make you
believe the CFD over Bartz, and **three** that would make you believe Bartz
over the CFD. Then place the CFD result on the NASA-STD-7009
verification / validation / qualification ladder and say what would be needed
to move it one rung.

---

## End of examination

Before you hand in, check that every numerical answer carries a unit; that
every efficiency, $\gamma$ and station convention you chose yourself is
stated; that every published engine figure you used carries the database's
confidence tag; and that in each of Problems 2(e), 4(d) and 5(d) you have
committed to **one** answer rather than listing possibilities.
