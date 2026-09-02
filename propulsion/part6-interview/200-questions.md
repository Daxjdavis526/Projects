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
