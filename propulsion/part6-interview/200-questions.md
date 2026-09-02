# 200 Propulsion Interview Questions

Part VI · Prerequisites: all modules · Estimated time: 20–40 h to answer all
of them out loud, well

This is the question bank you drill before an interview, not a problem set.
Every question below is phrased the way a working propulsion engineer would
actually ask it across a table, in one to three sentences, with no scaffolding
and no hints about which equation to reach for. That is the point. Half of the
skill being tested is recognising, in the first five seconds, *which* of the
thirty-six modules the question lives in.

**Answers are in [`200-questions-key.md`](200-questions-key.md).** Do not open
it until you have said your answer out loud. Reading a model answer and
thinking "yes, I knew that" is the single most common way candidates convince
themselves they are ready when they are not.

## How to use it

- **Say the answer out loud, on a timer.** Two minutes for a conceptual
  question, five for a quantitative one. An answer you can only write is an
  answer you will not produce under pressure.
- **Quantitative questions state every input you need.** All of them are
  reachable on a whiteboard in a few minutes with the formulas in
  [`reference/equation-sheet.md`](../reference/equation-sheet.md) and
  [`tools/rocket.py`](../tools/rocket.py). If you find yourself wanting a CEA
  run or a CFD solve, you have misread the question.
- **Judgment questions have no single right answer.** They have defensible
  answers and indefensible ones. The key says which is which and why.
- **Carry the caveats.** Where a question quotes a real engine number, the
  number and its uncertainty both come from
  [`reference/_verify-liquid.md`](../reference/_verify-liquid.md),
  [`reference/_verify-solid-coldgas.md`](../reference/_verify-solid-coldgas.md)
  and [`reference/engine-database.md`](../reference/engine-database.md). An
  answer that quotes the RS-25's expansion ratio as "69" without knowing that
  77.5 is also in the literature is a weaker answer than one that flags it.

## Conventions

SI throughout. $g_0 = 9.80665\ \mathrm{m/s^2}$, $R_u = 8314.46\
\mathrm{J/(kmol\,K)}$. $p_c$ is injector-face stagnation pressure unless
stated. "Isp" means seconds; vacuum or sea level is always specified.
Bracketed tags after each question give the module(s) it draws on — `[M07]`
is Module 07, Injectors.

## Structure

| block | questions | what it tests |
|---|---|---|
| Beginner | 1–50 | definitions, mechanisms, the shape of every trend |
| Intermediate | 51–110 | setting up and solving the governing equations; typical ranges |
| Advanced | 111–165 | coupled reasoning across subsystems; real hardware; diagnosis |
| Very advanced | 166–200 | frontier, contested data, and problems with no clean answer |

Roughly 55 % of the bank is conceptual ("why"), 30 % quantitative, and 15 %
engineering judgment or diagnosis.

---

## Beginner (1–50)

**1.** Define thrust from a control volume drawn around an engine, and explain
why the pressure-area term at the exit plane appears even though nothing is
"pushing on the atmosphere". [M01, M03]

**2.** What is specific impulse, in seconds and in metres per second, and what
is $g_0$ actually doing in the seconds version? [M03]

**3.** Why is stagnation enthalpy conserved through a rocket nozzle but
stagnation pressure is not? [M01, M02]

**4.** A nozzle throat is "choked". Say what that means physically and why the
Mach number locks at exactly 1 there rather than at some other value. [M02]

**5.** Why does a rocket need a converging–diverging nozzle at all? What would
a purely converging nozzle give you? [M02, M09]

**6.** Characteristic velocity and thrust coefficient split engine performance
into two numbers. What physically lives in each, and where is the dividing
line? [M03]

**7.** Two propellant combinations have the same flame temperature but
molecular masses of 12 and 24 kg/kmol. Which gives more $I_{sp}$, and by
roughly what factor? [M01, M03, M04]

**8.** Why can you not compute a flame temperature by simply looking up a heat
of combustion? Name the two effects a chemical-equilibrium code captures that
a hand calculation does not. [M04]

**9.** LOX/LH2 has the highest specific impulse of any flown chemical
combination and is still not used on most first stages. Give the two main
reasons. [M05, M32]

**10.** What makes a propellant combination hypergolic, and name one operational
advantage and one operational cost of choosing hypergolics. [M05, M08]

**11.** Define characteristic chamber length $L^*$. What physical quantity is
it a proxy for, and what goes wrong if it is too small? [M06]

**12.** Why does an injector deliberately throw away 15–25 % of the chamber
pressure as injector pressure drop instead of running that pressure into the
chamber? [M07, M15]

**13.** Walk through the start sequence of a pump-fed liquid engine in the
right order: what opens, what spins, what lights, and why that order. [M08,
M13, M14]

**14.** Sketch the difference between an over-expanded and an under-expanded
nozzle in terms of exit pressure, and say which one a sea-level first stage
engine normally runs. [M02, M09]

**15.** In a regeneratively cooled engine, where is the peak heat flux, and why
is it there rather than in the chamber where the gas is hottest? [M10]

**16.** Explain regenerative cooling in three sentences, including where the
heat ends up. [M11]

**17.** What does a pressure-fed system buy you over a pump-fed one, and what
does it cost? Name the vehicle-level quantity that decides between them. [M12,
M33]

**18.** What distinguishes an open engine cycle from a closed one, and what is
the typical $I_{sp}$ penalty for going open? [M13]

**19.** Why does the order in which the oxidiser and fuel main valves open
matter, and which propellant do engines usually lead with? [M14, M08]

**20.** Distinguish chug from screech in a liquid engine: frequency band,
physical mechanism, and which part of the engine each one implicates. [M15]

**21.** Why are high-performance chamber liners made of copper alloys when
copper melts at 1358 K and the gas is at 3500 K? [M10, M11, M16]

**22.** Name two things additive manufacturing lets you build in a rocket engine
that you could not build by conventional machining and brazing. [M17]

**23.** List the primary measurements taken on a liquid engine hot-fire test
stand, and say which single one you would keep if you could only have one.
[M18]

**24.** What are the three functional ingredient classes in a composite solid
propellant, and what does each contribute? [M19]

**25.** State Saint-Robert's law and explain why the pressure exponent $n$ must
be less than 1 for a motor to run stably. [M20]

**26.** Define progressive, neutral and regressive burning, and name a grain
geometry that gives each. [M21]

**27.** Why did large solid motor cases move from steel to filament-wound
composite, and what did that change buy in one number? [M22, M26]

**28.** What are the two distinct jobs of internal insulation in a solid motor,
and why does the aft end need more of it than the forward end? [M23]

**29.** Why is a solid rocket nozzle throat allowed to erode when a liquid
engine throat is not? [M24, M09]

**30.** Why is solid propellant cast in place inside the case rather than made
separately and inserted? [M25]

**31.** Give three reasons a strategic missile uses solid motors rather than a
liquid engine. [M27, M32]

**32.** Why is a cold-gas thruster's specific impulse so low — 60–80 s for
nitrogen — when it is expanding through a perfectly good supersonic nozzle?
[M28]

**33.** Cold-gas $I_{sp}$ scales as $1/\sqrt{\mathcal{M}}$, so helium beats
nitrogen by a factor of 2.3. Why does almost no flown system use helium as a
propellant? [M28, M30, M31]

**34.** Explain the difference between a blowdown and a regulated cold-gas
system, and name the mission property that decides which you pick. [M29, M30]

**35.** Why do essentially all flown CubeSat cold-gas modules use a liquefiable
propellant such as R-236fa or butane rather than compressed nitrogen? [M30,
M31]

**36.** You need 3 m/s of total $\Delta v$ on a 180 kg system, once, for
self-rescue. You need 4 km/s on a 500 t launch vehicle. You need 40 m/s of
trajectory correction on a 3.5 kg CubeSat. Assign liquid, solid, or cold gas to
each and say why in one sentence apiece. [M32]

**37.** What is a requirement flowdown, and give one example of a propulsion
requirement that is derived rather than stated by the customer. [M33]

**38.** Name a propulsion failure that changed how the industry works, and say
in two sentences what the technical mechanism was. [M34]

**39.** Why did launch vehicles go kerosene → hydrogen → (partly) methane rather
than straight to the highest-$I_{sp}$ option? [M35, M05]

**40.** What does "model-based systems engineering" or a digital twin actually
give a propulsion programme that a stack of documents does not? [M36, M33]

**41.** For a combustion gas with $\gamma = 1.20$, $\mathcal{M} = 22.0$ kg/kmol
and $T_0 = 3400$ K, compute the specific gas constant and the ideal
characteristic velocity. [M01, M03]

**42.** For the gas in the previous question at $p_c = 6.0$ MPa with a throat
diameter of 100 mm, compute the choked mass flow. [M02, M03]

**43.** An engine must produce 250 kN of vacuum thrust at $p_c = 10$ MPa with
$C_f = 1.80$. Compute the required throat area and throat diameter. [M03]

**44.** An engine has $c^* = 1780$ m/s and $C_f = 1.72$. Compute the effective
exhaust velocity and the specific impulse in seconds. [M03]

**45.** For $\gamma = 1.22$ and an area ratio of 40, compute the exit Mach
number and the exit-to-chamber static pressure ratio. [M02, M09]

**46.** A stage has an initial mass of 30,000 kg, a final mass of 4,000 kg and
an $I_{sp}$ of 340 s. Compute the ideal $\Delta v$. [M03, M33]

**47.** A solid motor has $a = 3.5\times10^{-5}$ m/s·Pa$^{-n}$, $n = 0.35$,
propellant density 1770 kg/m³, $c^* = 1550$ m/s, burning area 12.0 m² and
throat area 0.030 m². Compute the equilibrium chamber pressure. [M20, M21]

**48.** A cold-gas tank blows down isothermally from 240 bar to 20 bar. What
fraction of the stored gas mass is usable, and what would the answer be if the
blowdown were adiabatic with $\gamma = 1.4$? [M29]

**49.** A 0.60 m³ propellant tank is to be pressurised to 25 bar with helium at
280 K. Estimate the pressurant mass required, ignoring heat transfer. [M12,
M29]

**50.** A cold-gas thruster produces 50 mN with a 20 ms commanded on-time, a
4 ms rise and a 6 ms fall. Estimate the delivered impulse bit. [M29, M30]

---

## Intermediate (51–110)

**51.** Explain the difference between frozen and shifting-equilibrium
performance predictions, why shifting always predicts a higher $I_{sp}$, and
which one a real engine lands closer to. [M04, M01]

**52.** Why does increasing the expansion ratio give steadily diminishing
returns in vacuum $I_{sp}$, and what sets the point at which you stop? [M02,
M09, M33]

**53.** A nozzle with $\gamma = 1.20$ is operating with a normal shock standing
at an area ratio of 4.0. Compute the Mach number just upstream of the shock,
the static pressure ratio across it, and the Mach number just downstream.
[M02]

**54.** Define $\eta_{c^*}$ and $\eta_{C_f}$. Which physical losses land in
each, and why does a diagnostic engineer want them separated rather than
lumped into one $I_{sp}$ efficiency? [M03, M18]

**55.** For $\gamma = 1.19$, $\varepsilon = 69$, $p_c = 206$ bar and vacuum back
pressure, compute the ideal thrust coefficient and, taking $c^* = 2330$ m/s,
the ideal vacuum $I_{sp}$. Compare with the RS-25's published 452.3 s. [M03,
M09]

**56.** A test article at $p_c = 5.5$ MPa with $A_t = 0.0080$ m² flows 24.0 kg/s
and produces 62.0 kN at sea level. Compute the measured $c^*$ and $C_f$, and
the corresponding efficiencies given ideal values of 1755 m/s and 1.52. [M03,
M18]

**57.** Peak flame temperature occurs near stoichiometric, yet essentially every
engine runs fuel-rich. Explain why, and state the two separate mechanisms that
make it pay. [M04, M05]

**58.** A LOX/LH2 chamber runs $T_0 = 3600$ K with $\mathcal{M} = 13.5$
kg/kmol; a LOX/RP-1 chamber runs $T_0 = 3670$ K with $\mathcal{M} = 23.0$
kg/kmol. Take $\gamma = 1.20$ for both and compute the two ideal $c^*$ values
and their ratio. [M03, M04, M05]

**59.** Define density impulse and explain the class of mission for which it,
rather than $I_{sp}$, is the correct figure of merit. [M05, M32, M33]

**60.** LOX/LH2 at O/F 6.0 has a bulk density of about 360 kg/m³ and a vacuum
$I_{sp}$ of 450 s; LOX/RP-1 at O/F 2.3 has about 1030 kg/m³ and 340 s. Compute
the density impulse of each and state what the ratio implies for first-stage
tank volume. [M05, M32]

**61.** What does the chamber contraction ratio $A_c/A_t$ control, and what goes
wrong at both ends of the range? [M06]

**62.** A chamber has $A_t = 0.0125$ m² and $L^* = 1.0$ m. Compute the chamber
volume; then, with chamber gas at $p_c = 8$ MPa, $T_0 = 3500$ K and
$R = 370$ J/(kg·K), compute the residence time at a mass flow of 30 kg/s. [M06]

**63.** Compare the impinging doublet, the coaxial shear element and the pintle.
For each, name the propellant combination it suits and the dominant atomisation
mechanism. [M07]

**64.** An injector element must flow 0.085 kg/s of LOX ($\rho = 1140$ kg/m³)
with a discharge coefficient of 0.75 across a 1.8 MPa pressure drop. Compute
the required orifice area, diameter, and injection velocity. [M07]

**65.** What is the total momentum ratio at an injector element, and why do
designers care more about it than about the mass mixture ratio at the element
scale? [M07, M15]

**66.** Compare pyrotechnic, hypergolic-slug and torch ignition on four axes:
restartability, reliability evidence, mass, and what happens if the igniter
fails. [M08]

**67.** A hot-fire aborts on a chamber-pressure spike 60 ms after the ignition
command, with the fuel valve position trace showing full open at 30 ms and the
oxidiser valve at 20 ms. What do you suspect, and what would you change first?
[M08, M14, M15]

**68.** What does a bell (Rao) contour buy you over a 15° conical nozzle of the
same area ratio, and what does it cost? [M09]

**69.** A nozzle with $\gamma = 1.20$ and $\varepsilon = 25$ runs at
$p_c = 60$ bar at sea level. Compute the exit Mach number, exit pressure, and
apply the Schmucker criterion to decide whether the flow is separated. [M09,
M02]

**70.** In the Bartz correlation, which grouping of variables dominates the
throat heat-transfer coefficient, and what does the correlation get badly
wrong? [M10]

**71.** For a throat diameter of 0.15 m, $\mu_0 = 8.5\times10^{-5}$ Pa·s,
$c_{p0} = 2000$ J/(kg·K), $Pr_0 = 0.55$, $p_c = 10$ MPa, $c^* = 1780$ m/s,
throat radius of curvature 0.12 m and $\sigma = 1.0$, compute the throat
gas-side heat-transfer coefficient and the heat flux for $T_{aw} = 3300$ K and
$T_{wg} = 800$ K. [M10, M11]

**72.** Why are regenerative cooling channels narrowest and tallest at the
throat, and what limits how far you can push the aspect ratio? [M11, M17]

**73.** A coolant circuit absorbs 12 MW into 28 kg/s of RP-1 with
$c_p = 2100$ J/(kg·K). Compute the bulk temperature rise. Then compute the
temperature drop through a 0.8 mm copper wall ($k = 320$ W/(m·K)) at a heat
flux of 60 MW/m². [M11, M10]

**74.** Define NPSH available and NPSH required. Why does a rocket turbopump
have an inducer in front of the main impeller, and what is the inducer allowed
to do that the impeller is not? [M12]

**75.** A LOX pump raises 250 kg/s of oxygen ($\rho = 1140$ kg/m³) through a
28 MPa pressure rise at 70 % efficiency. Compute the shaft power. [M12]

**76.** A tank is at 3.5 bar with LOX at 90 K ($p_{vap} = 1.0$ bar,
$\rho = 1140$ kg/m³), the pump inlet is 4.0 m below the liquid surface under
1.3 g of vehicle acceleration, and the feed line drops 0.4 bar. Compute the
available NPSH in metres. [M12]

**77.** Explain the expander-cycle thrust ceiling from first principles. Why
does the limit scale the way it does with engine size, and what are the two
standard escapes from it? [M13, M11]

**78.** Why did the Soviet Union build oxidiser-rich staged combustion engines
when the United States concluded the cycle was impractical? What single
technology made it survivable? [M13, M16, M35]

**79.** A turbine takes 18 kg/s of gas at 900 K with $c_p = 2800$ J/(kg·K) and
$\gamma = 1.30$ across a pressure ratio of 16, at 65 % efficiency. Compute the
shaft power. [M12, M13]

**80.** Why do expendable engines use one-shot pyrotechnic valves where reusable
engines use actuated ones, and what does that decision propagate into
elsewhere in the vehicle? [M14, M33]

**81.** Distinguish longitudinal, tangential and radial acoustic modes in a
cylindrical chamber. Which is usually the most destructive, and what hardware
suppresses each? [M15, M06]

**82.** A development engine shows a clean chamber-pressure trace except for a
growing 2.8 kHz component that reaches 8 % of $p_c$ by two seconds into the
burn, with chamber wall thermocouples rising fastest near the injector
periphery. Diagnose it and name your first two fixes. [M15, M07, M10]

**83.** Why is hydrogen embrittlement a design driver in LOX/LH2 engines but not
in kerolox ones, and what are the standard mitigations? [M16, M11]

**84.** Additive manufacturing removed the joints from a lot of engine hardware
but created a new qualification problem. What is it, and how do programmes
currently address it? [M17, M16, M36]

**85.** A $c^*$ measurement uses $p_c$ (±0.5 %), $A_t$ (±0.8 %) and $\dot m$
(±1.2 %). Compute the combined relative uncertainty in $c^*$, and say which
term you would attack first. [M18]

**86.** On a series of five hot-fires, measured $c^*$ efficiency falls
monotonically from 0.97 to 0.93 while chamber pressure and mixture ratio are
unchanged and the throat area measured after each test grows by 1.5 % total.
What is going on, and is the $c^*$ number even meaningful? [M18, M03, M24]

**87.** Why is aluminium loaded into composite solid propellants at 16–19 % by
mass, and what three separate penalties does it bring? [M19, M20, M24]

**88.** What is erosive burning, what dimensionless group governs its onset, and
where in a long grain does it show up first? [M20, M21]

**89.** A propellant has $\sigma_p = 0.0025$ K$^{-1}$ and $n = 0.35$. Compute
the burn-rate ratio between a motor conditioned at 244 K and one at 322 K, and
the corresponding chamber-pressure sensitivity $\pi_K$. [M20, M27]

**90.** Compare a BATES cylindrical grain, an 11-point star and a finocyl. For
each, name the thrust trace it produces and the reason you would accept its
sliver or web-fraction penalty. [M21]

**91.** A motor has a 3.2 m case inner diameter, a 25 m grain length, an initial
port diameter of 1.6 m and a throat area of 0.62 m². Compute the initial
burning area of a simple cylindrical-bore grain (ignoring ends) and the initial
$K_n$. [M21, M20]

**92.** A filament-wound case has a 3.0 m inner diameter and must hold 7.0 MPa
with a burst factor of 1.5 on a material allowable of 1400 MPa. Compute the
required hoop-direction thickness from thin-wall theory and comment on why the
real layup is thicker. [M22]

**93.** What does netting analysis assume, why is it still used for filament-wound
cases, and where does it mislead you? [M22, M16]

**94.** Describe what happens through the thickness of an ablative liner during
a burn: name the zones and say which one actually does the insulating. [M23,
M24]

**95.** Compare carbon–carbon and carbon-phenolic as throat materials on
erosion rate, cost, and failure mode. Which would you choose for a 130 s
first-stage burn and why? [M24, M25]

**96.** A motor runs at 6.2 MPa with $A_t = 0.62$ m² and $n = 0.35$. Throat
erosion increases $A_t$ by 6 % over the burn. Compute the resulting
steady-state chamber-pressure change, holding $K_n$ numerator fixed. [M24,
M20]

**97.** Name four defects that mix, cast or cure can put into a solid grain, and
say how each one shows up in a pressure trace or an inspection. [M25, M21]

**98.** A radiographic inspection of a cast segment shows a 40 mm unbonded
region at the liner-to-propellant interface, 300 mm from the aft end. Do you
scrap the segment, repair it, or fly it? Argue the case. [M25, M23, M33]

**99.** Explain the Shuttle SRB field-joint failure mechanism at the level of
joint rotation, seal rate dependence and temperature — and say what the
redesign changed. [M26, M22, M34]

**100.** Trace the evolution of solid-motor thrust vector control from jetavators
through liquid injection to the flexseal gimballed nozzle. What did each step
buy and what did it cost? [M27, M24]

**101.** When is the ideal-gas assumption inadequate for a cold-gas system, and
what specifically goes wrong if you ignore it? [M28, M29]

**102.** Compute the ideal vacuum $I_{sp}$ at $\varepsilon = 50$ and $T_0 = 300$
K for nitrogen ($\mathcal{M} = 28.014$, $\gamma = 1.40$) and for helium
($\mathcal{M} = 4.003$, $\gamma = 1.667$). Then state what fraction of ideal a
real thruster delivers. [M28, M29]

**103.** A CubeSat module must deliver 755 N·s of total impulse at a realised
$I_{sp}$ of 40 s. Compute the propellant mass required, and the tank volume if
the propellant is stored as a saturated liquid at 1360 kg/m³. [M29, M31]

**104.** Why does a cold-gas thruster's $I_{sp}$ droop during a long firing, and
what does that do to the duty cycle you can advertise? [M29, M30]

**105.** What does a latching solenoid valve buy a cold-gas system over a
non-latching one, and what leak rate is acceptable for a one-year mission?
[M30]

**106.** Your cold-gas module's specification allows $1\times10^{-4}$ scc/s of
helium leakage per joint and there are 14 joints. The mission is three years.
Is that acceptable, and what would you measure to find out? [M30, M31, M33]

**107.** MarCO carried a self-pressurising R-236fa system with no regulator and
no high-pressure COPV. Explain why that architecture was chosen for an
interplanetary CubeSat, and what it gave up. [M31, M30]

**108.** The Shuttle SRB has a propellant mass fraction of about 0.85 and the
P120C about 0.924. You are choosing a booster architecture for a new
medium-lift vehicle. Which do you pick, and what non-performance factors could
overturn the mass-fraction argument? [M22, M26, M32, M33]

**109.** How do you set margin on a propulsion requirement that is not yet
measurable — for example, combustion stability — early in a programme? [M33,
M15]

**110.** The Vega-C VV22 failure was traced to unexpected erosion of a
carbon–carbon nozzle throat insert after a material supplier change. What does
that tell you about how to write a qualification plan, and what would you have
required of the supplier? [M34, M24, M25]

---

## Advanced (111–165)

**111.** Combustion gases in a rocket chamber have $\gamma \approx 1.15$–1.25
rather than the 1.4 of a diatomic gas. Explain the two physical reasons, and
say what a designer loses and gains from the low value. [M01, M04]

**112.** Why is a flown bell nozzle a truncated ideal contour rather than a full
method-of-characteristics ideal contour, and what is actually being traded?
[M02, M09]

**113.** A nozzle with $\gamma = 1.20$ and $\varepsilon = 40$ is fired at sea
level. Compute the ideal exit pressure, then the Mach number and pressure just
downstream of a normal shock at the exit plane, and use the result to argue
whether the flow can plausibly stay attached. [M02, M09]

**114.** Your engine's measured vacuum $I_{sp}$ is 4 s below the CEA
shifting-equilibrium prediction times your assumed efficiencies, and the
discrepancy is repeatable across five units. Walk through how you would
partition that 4 s among candidate causes. [M03, M04, M18]

**115.** For $\gamma = 1.20$ and $p_c = 100$ bar, compute $C_f$ at
$\varepsilon = 16$ and $\varepsilon = 40$, each at sea level and in vacuum.
Use the four numbers to state the altitude-compensation problem quantitatively.
[M03, M09]

**116.** CEA reports both an equilibrium and a frozen $I_{sp}$; real practice
often uses equilibrium in the chamber and frozen downstream of some station.
Justify that hybrid physically and say where the station sits. [M04, M02]

**117.** A LOX/CH4 engine is at O/F 3.6 with $T_0 = 3550$ K and
$\mathcal{M} = 21.5$ kg/kmol. Moving to O/F 3.2 gives $T_0 = 3390$ K and
$\mathcal{M} = 20.3$ kg/kmol. Take $\gamma = 1.20$ and compute both ideal
$c^*$ values; explain why the cooler mixture is not obviously worse. [M04,
M05]

**118.** Compare methane, RP-1 and hydrogen specifically as *reusable* engine
propellants: coking, boil-off, tank volume, and turbomachinery consequences.
[M05, M11, M12]

**119.** What makes a material "LOX compatible", how is that established, and
name one material that is fine in LOX and one that is not. [M05, M16, M14]

**120.** Size a chamber for 800 kN vacuum thrust at $p_c = 12$ MPa with
$c^* = 1820$ m/s, $\eta_{c^*} = 0.96$, $C_f = 1.85$, $L^* = 1.05$ m and a
contraction ratio of 2.5. Give $A_t$, $D_t$, $\dot m$, $V_c$, $A_c$ and $D_c$.
[M06, M03]

**121.** Explain how chamber volume couples into low-frequency (chug)
instability, and why increasing $L^*$ can cure one instability while creating
another. [M06, M15]

**122.** A pintle injector throttles 10:1 with acceptable $c^*$ efficiency at
both ends. Explain the mechanism that makes that possible and what limits it.
[M07, M13]

**123.** A fuel-oxidiser-fuel triplet must flow 0.12 kg/s of LOX
($\rho = 1140$ kg/m³) and 0.052 kg/s of RP-1 ($\rho = 810$ kg/m³) at a common
2.0 MPa drop with $C_d = 0.78$. Compute both orifice areas, both injection
velocities, and the total momentum ratio. [M07]

**124.** Post-test inspection shows streak erosion on the chamber wall in a
regular circumferential pattern matching the outer ring of injector elements,
with the rest of the wall clean. What is the mechanism, and what are your two
candidate fixes? [M07, M10, M11]

**125.** Explain the mechanism of an ignition overpressure "hard start" in a
pump-fed engine, and name three design features that prevent it. [M08, M14,
M15]

**126.** An upper-stage engine has $\gamma = 1.22$, $c^* = 2300$ m/s, and can
carry either $\varepsilon = 77$ or a deployable $\varepsilon = 285$. Compute
the vacuum $C_f$ and $I_{sp}$ for each and the $I_{sp}$ gain. Compare with the
~30 s attributed to the RL10B-2 extendible nozzle. [M09, M03]

**127.** Dual-bell and aerospike nozzles both promise altitude compensation and
neither has flown operationally. Give the technical reasons in each case, not
the programmatic ones. [M09, M35]

**128.** Using the Bartz correlation's $(A_t/A)^{0.9}$ dependence, compute the
ratio of gas-side heat-transfer coefficient at an area ratio of 2.5 in the
chamber and at an area ratio of 10 in the nozzle, relative to the throat.
Comment on where the cooling circuit therefore needs its margin. [M10, M11]

**129.** Film cooling appears to throw away propellant, yet its measured
$I_{sp}$ cost is much smaller than the mass fraction diverted. Explain why,
and state where the argument breaks down. [M11, M10, M06]

**130.** A cooling channel is 1.5 mm × 4.5 mm carrying RP-1 at 6.0 m/s, with
$\rho = 810$ kg/m³, $\mu = 7.5\times10^{-4}$ Pa·s, $k = 0.13$ W/(m·K) and
$c_p = 2100$ J/(kg·K). Compute the hydraulic diameter, Reynolds and Prandtl
numbers, and the Dittus–Boelter coolant-side heat-transfer coefficient. [M11,
M10]

**131.** Wall thermocouples in the throat region read 120 K hotter than the
model predicted, but the coolant bulk temperature rise matches prediction
within 3 %. Where is the error, and how do you prove it? [M11, M10, M18]

**132.** Explain POGO: the physical loop, why the pump is essential to it, and
what an accumulator does. [M12, M14, M34]

**133.** A LH2 pump runs at 36,000 rpm, flows 0.070 m³/s, generates 22,000 m of
head and has 300 m of available NPSH. Compute the specific speed and the
suction specific speed, and say what each number tells you. [M12]

**134.** Why are bearings and dynamic seals the life-limiting components of a
LOX turbopump, and what are the architectural ways around the problem? [M12,
M16]

**135.** You must select a cycle for a 2 MN sea-level methalox booster engine
intended for 25 flights. Argue gas generator versus staged combustion versus
full-flow, and commit to one. [M13, M32, M33]

**136.** A gas-generator engine diverts 3.2 % of total flow to the turbine,
which exhausts at an $I_{sp}$ of 130 s while the main chamber delivers 340 s.
Compute the overall engine $I_{sp}$ and the penalty relative to a closed cycle
at the same chamber conditions. [M13, M03]

**137.** What does full-flow staged combustion buy over conventional staged
combustion, beyond chamber pressure? Name at least three distinct advantages
and one reason it took until Raptor to fly. [M13, M16, M35]

**138.** Explain priming and water hammer in a cryogenic feed line, why it is
worst on the first fill, and what hardware controls it. [M14, M12]

**139.** During a chilldown, the regulated pressure downstream of a helium
regulator oscillates at about 6 Hz with 0.8 bar amplitude, and the oscillation
disappears when a downstream valve is fully opened. What is happening? [M14,
M12, M30]

**140.** State the Rayleigh criterion and explain, using it, why an injector
that responds strongly to chamber pressure fluctuation at the acoustic period
is dangerous. [M15]

**141.** A cylindrical chamber has a 0.28 m internal diameter with a sound speed
of 1150 m/s in the burnt gas. Compute the first tangential, first radial and
second tangential mode frequencies. [M15, M06]

**142.** A bomb test at full thrust induces a 5 % $p_c$ oscillation that decays
to 1 % in 38 ms on unit A and 95 ms on unit B, both nominally identical
hardware. Do you accept unit B? What do you do next? [M15, M18, M33]

**143.** Describe the low-cycle-fatigue failure mode of a milled-channel copper
liner: the loading, the deformation mechanism, and what the failed wall looks
like. [M16, M11, M17]

**144.** A copper-alloy liner has $E = 110$ GPa, $\alpha = 1.8\times10^{-5}$
K$^{-1}$, $\nu = 0.34$ and a through-thickness $\Delta T$ of 150 K. Compute the
thermal hoop stress and compare with a yield strength of about 200 MPa at
temperature. [M16, M11]

**145.** What are the three defect classes specific to laser powder-bed fusion
in a rocket part, and which post-processes address which? [M17, M16]

**146.** You need a channel-wall nozzle for a 200 kN engine at a rate of 40 per
year. Argue additively manufactured versus brazed tube-wall versus milled and
electroformed, and commit. [M17, M11, M36]

**147.** Explain thrust-stand calibration: what tare forces exist, how in-situ
calibration works, and why the propellant lines are the hardest part. [M18]

**148.** An altitude test cell must simulate 5 kPa ambient for a nozzle with
$\varepsilon = 100$, $\gamma = 1.20$ and $p_c = 4.0$ MPa. Compute the exit
pressure and the normal-shock static-pressure ratio at exit, and use it to
estimate the diffuser's required recovery. [M18, M02, M09]

**149.** What is a plateau or mesa propellant, what burn-rate modifiers produce
that behaviour, and why would a designer pay for it? [M19, M20, M27]

**150.** Strand-burner data give $r = 8.4$ mm/s at 4.0 MPa and $r = 11.3$ mm/s at
7.0 MPa. Compute $n$ and $a$, and state whether the propellant is stable in a
motor. [M20, M19]

**151.** A finocyl grain has an initial burning area of 9.0 m², a maximum of
11.5 m² at 30 % of web, and a final area of 6.2 m². The web is 0.42 m,
propellant density 1800 kg/m³, and the burn rate is 9.5 mm/s at the operating
pressure. Compute the burn time and sketch the thrust trace shape with numbers.
[M21, M20]

**152.** The LVM3 S200 has a published max-to-average thrust ratio of 1.44,
against roughly 1.18 for the Shuttle SRB. What grain-design choice does that
imply, what vehicle-level requirement would drive it, and what does it cost?
[M21, M26, M33]

**153.** A filament-wound case is 3.4 m in diameter and 13.5 m long, with a
composite density of 1580 kg/m³ and a required wall of 12 mm, plus 2,400 kg of
insulation, skirts and nozzle. With 141,400 kg of propellant, compute the case
mass, inert mass and propellant mass fraction, and compare with the P120C's
published 0.924. [M22, M26]

**154.** How do you size internal insulation thickness, given that the exposure
time varies along the case and the char layer itself is doing the insulating?
State the safety factor convention and what it is protecting against. [M23,
M21]

**155.** A throat insert with an initial radius of 0.20 m erodes at 0.12 mm/s
over a 120 s burn. Compute the final throat area and the fractional change in
$C_f$-based thrust at fixed $p_c$, and the direction chamber pressure will
actually move. [M24, M20, M03]

**156.** Why do cast solid grains crack, what stresses drive it, and what does a
40-year surveillance programme actually measure? [M25, M19, M27]

**157.** Compare the RSRM, the P120C and the LVM3 S200 as architectures:
segmentation, case material, TVC, and mass fraction. Which choices are physics
and which are logistics? [M26, M22, M24]

**158.** At architecture level only, what does a submarine-launched application
impose on a solid motor that a silo-launched one does not? [M27, M22, M23]

**159.** Nitrogen at 300 K and 300 bar has a compressibility factor of about
1.12. A 4.0 litre tank is filled to that state. Compute the stored mass with
and without the real-gas correction, and state which way the error goes if you
ignore it. [M28, M29]

**160.** A 12 kg CubeSat carries 0.35 kg of nitrogen at a realised $I_{sp}$ of
68 s in a blowdown system usable from 200 bar to 20 bar. Compute the total
impulse actually available and the $\Delta v$ it delivers. [M29, M31]

**161.** Your attitude-control requirement is a 0.02° pointing deadband on a
150 kg·m² inertia with thrusters on a 0.8 m moment arm. The candidate thruster
has a minimum impulse bit of 2 mN·s with 15 % repeatability. Does it close?
[M30, M29, M33]

**162.** Falcon 9's first stage uses GN₂ cold gas for attitude control during
the return, and SpaceX publishes no performance numbers for it. From the
mission profile alone, argue why cold gas is the right choice there. [M31,
M32]

**163.** Compare three systems delivering 10 kN·s of total impulse: a cold-gas
nitrogen system at $I_{sp} = 70$ s, a solid motor at 280 s with an inert mass
fraction of 0.10, and a hydrazine monopropellant at 220 s. Compute propellant
mass for each and rank them on total wet mass with a stated tank/case model.
[M32, M29, M21]

**164.** A structures group wants your chamber pressure reduced 10 % to save
tank wall mass; performance says that costs 2 s of $I_{sp}$ and 4 % of thrust.
How do you resolve it, and what number decides? [M33, M03, M22]

**165.** Sort these into "design error" and "process error" and defend the
split: the Challenger field joint, the Vega-C throat insert, a turbopump
bearing failure from a contaminated LOX line, and a hard start from a slow
oxidiser valve. [M34, M18, M25]

---
