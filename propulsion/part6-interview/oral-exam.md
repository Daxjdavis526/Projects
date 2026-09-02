# Oral Exam Question Bank

Part VI · Prerequisites: all thirty-six modules · Estimated time: 25–40 h to
work the bank properly, plus one three-hour mock sitting

This is not a question list. It is sixty **lines of questioning**, each built
the way a PhD qualifying committee or a design-review board actually works: a
broad opening that anyone who has read the module can start answering, then
three to five follow-ups that walk the candidate off the memorised ground and
into the part where they have to think. The follow-ups are the exam. The
opening exists only to find out where you are standing so the examiner knows
which direction to push.

**Answers are in [`oral-exam-key.md`](oral-exam-key.md).** The key does not
give model answers in the sense of a script to recite — an oral exam has no
script. It gives, per item, what a strong answer contains, what would end the
line of questioning early (the observation that makes further pushing
pointless), and the classic wrong turn.

## How to use it

- **Out loud, standing up, with a whiteboard and no notes.** Every one of
  these items has been written so that the arithmetic in it is doable in front
  of a board in under five minutes. If you find yourself wanting CEA or a CFD
  solve, you have misread the question.
- **Work the item as a chain.** Do not answer the opening and stop. The
  examiner's next question is written down for you; answer it before you look
  at the key. A candidate who visibly stops thinking after the first answer is
  the single easiest failure mode to spot from the other side of the table.
- **Time it.** Fifteen to twenty minutes per full item is the pace of a real
  oral. Sixty items is far more than one sitting; a realistic mock exam is
  four items chosen across four different parts of the course.
- **Say what you do not know, and say what you would do about it.** "I do not
  know the RL10B-2's chamber pressure and neither does the manufacturer's
  public data sheet — but I can bound it from the expander cycle's heat
  balance, and here is how" is a strong answer. Guessing a number is not.
- **Carry the epistemic tags.** Where an item quotes a real engine, the number
  and its confidence both come from
  [`reference/engine-database.md`](../reference/engine-database.md). Several
  of the follow-ups below are specifically about noticing that a widely quoted
  figure is contested, a company claim, or a `/vehicle` number masquerading as
  a `/motor` number.

## Conventions

SI throughout. $g_0 = 9.80665\ \mathrm{m/s^2}$,
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$. $p_c$ is injector-face stagnation
pressure unless stated. "Isp" means seconds, and vacuum or sea level is always
specified. Bracketed tags give the modules an item draws on: `[M07]` is
Module 07, Injectors; `[M07, M15]` means the examiner intends to cross from
injectors into combustion instability, which is where most of these items are
actually going.

## Structure

| block | items | modules | what it tests |
|---|---|---|---|
| A — Foundations | 1–8 | M01–M04 | whether the governing equations are yours or borrowed |
| B — Liquid engines | 9–33 | M05–M18 | subsystem design reasoning and coupled trades |
| C — Solid motors | 34–46 | M19–M27 | internal ballistics, structure, and the manufacturing constraint |
| D — Cold gas | 47–52 | M28–M31 | small-system engineering where Isp is not the figure of merit |
| E — Cross-system | 53–60 | M32–M36 | architecture, failure, history, and method |

The difficulty is not evenly distributed inside an item. Follow-up 1 is
usually still recall; by follow-up 3 the examiner is asking you to reason
about a case the course never covered. That is deliberate and it is what
Level 3 mastery means.

---

# Block A — Foundations (items 1–8)

### 1. Thrust from first principles `[M01, M03]`

**Opening.** Derive the thrust of a rocket engine from a control volume.
Draw the control volume you are using before you write anything down.

**Follow-ups.**
1. Your expression has a pressure–area term. A colleague says that term is the
   exhaust pushing against the atmosphere. Argue him out of it, or agree with
   him and defend it. `[M01]`
2. Now draw a *different* control volume that gives the same thrust with no
   exit-pressure term at all. What does the existence of two answers tell you
   about that term? `[M01]`
3. The Rocketdyne A-7 on Mercury-Redstone is quoted at 75,000 lbf, 78,000 lbf
   and 82,977 lbf by three credible sources. Using your control volume,
   explain how all three can be correct. `[M03, M35]`
4. An engine's turbine exhaust is dumped overboard through a side duct rather
   than into the nozzle. Is that thrust? Where does it appear in your control
   volume, and how would you measure it on a stand? `[M13, M18]`

### 2. Why performance is split into c\* and C_F `[M03]`

**Opening.** Specific impulse could be reported as one number. Why does the
field insist on factoring it into characteristic velocity and thrust
coefficient?

**Follow-ups.**
1. Which of the two is a property of the propellant and which of the geometry?
   Be careful — neither answer is completely clean. `[M03, M04]`
2. You have a hot-fire record: chamber pressure, throat area, mass flow, and
   measured thrust. Compute both efficiencies and tell me which subsystem each
   one indicts. `[M03, M18]`
3. Your c\* efficiency is 0.96 and your C_F efficiency is 0.99. Your programme
   manager wants a 2 % Isp improvement in six months. Where do you spend the
   money and why? `[M07, M09]`
4. Under what circumstance does a c\* efficiency above 1.00 appear in real
   data, and what has gone wrong when it does? `[M18]`

### 3. Choking, and what the throat actually controls `[M02]`

**Opening.** Explain why a converging–diverging nozzle's mass flow stops
responding to downstream pressure, and what sets the flow rate once it has.

**Follow-ups.**
1. Write the choked mass-flow relation and tell me the exponent on each input.
   If chamber pressure doubles at fixed throat area and fixed propellant, what
   happens to mass flow, thrust, and Isp — each separately? `[M02, M03]`
2. The throat erodes 6 % in area over a solid motor's burn. What does chamber
   pressure do? Now do the same for a pressure-fed liquid engine and explain
   why the answers differ in kind, not just in size. `[M20, M12]`
3. Where in a real engine is the sonic point actually located, and how far
   from the geometric throat can it sit before you would care? `[M02, M09]`
4. A test article shows mass flow 3 % below prediction at the correct chamber
   pressure. Give me four candidate causes and the measurement that separates
   them. `[M18]`

### 4. Thermochemistry: what CEA gives you and what it does not `[M04, M01]`

**Opening.** You have a CEA output for LOX/RP-1 at 100 bar. Walk me through
what the code actually solved, and what you would and would not trust in it.

**Follow-ups.**
1. Frozen versus shifting equilibrium: which bounds the truth from above and
   which from below, and by roughly how much for a large hydrocarbon engine?
   `[M04, M09]`
2. Your CEA run says the optimum mixture ratio for Isp is about 2.7 for
   LOX/RP-1, but the F-1 ran 2.27 and the RD-180 runs fuel-rich too. Explain
   every reason a real engine sits off the CEA optimum. `[M04, M05, M11]`
3. Chamber pressure doubles from 100 to 200 bar. What happens to flame
   temperature, to c\*, and to Isp at fixed area ratio — and which of those
   three is the smallest effect? `[M04, M03]`
4. How would you verify a CEA-derived c\* against a hot fire without a
   calorimetric chamber? `[M18, M03]`

### 5. Expansion ratio and the altitude compromise `[M02, M03, M09]`

**Opening.** A first-stage engine and an upper-stage engine burn the same
propellants at the same chamber pressure. Explain, from the physics, why their
nozzles look nothing alike.

**Follow-ups.**
1. Define the optimum expansion ratio and show me why it is optimum. Then tell
   me why almost no first stage flies at it. `[M02, M09]`
2. Compute the break-even altitude between two candidate area ratios for a
   100 bar engine, given only ambient pressure as a function of altitude.
   Set it up on the board. `[M02, M03]`
3. The RL10B-2 flies at ε = 285 (deployed) and Vinci at 240. Both are hydrolox
   upper stages. Why stop there — what stops you going to 600? `[M09, M16]`
4. Your vehicle's first stage now separates 20 s later than baseline. Does the
   optimum first-stage area ratio go up or down, and does the answer depend on
   the payload? `[M33]`

### 6. Molecular weight, gamma, and temperature `[M01, M04]`

**Opening.** c\* goes as the square root of T₀/M, roughly. Rank those two
levers by how much design freedom you actually have over each, and explain
why hydrogen wins.

**Follow-ups.**
1. LOX/LH2 burns *cooler* than LOX/RP-1 at its operating mixture ratio and
   still has 30 % more Isp. Reconcile that. `[M04, M05]`
2. What does γ do in the c\* expression, and what does it do in C_F? The signs
   are not the same — explain. `[M01, M02]`
3. If I hand you a gas with M = 2 and γ = 1.67 at 300 K — helium, cold — you
   get about 178 s ideal at ε = 50. A hydrolox engine at 3,500 K gets 450 s.
   Account for the ratio quantitatively. `[M28, M03]`
4. Why does running fuel-rich raise Isp for hydrolox but is a much weaker
   lever for a hydrocarbon engine? `[M04, M05]`

### 7. The Isp loss budget `[M03, M09]`

**Opening.** An engine's theoretical shifting-equilibrium Isp is 366 s and it
delivers 348 s. Enumerate where the 18 seconds went, in order of size.

**Follow-ups.**
1. Which of your loss terms multiply and which add? Show me that it matters —
   or that it does not. `[M03]`
2. Rank the same loss terms for (a) a 100 kN pressure-fed hypergolic
   upper-stage engine and (b) a 2,000 kN staged-combustion booster. What
   changes order? `[M03, M13]`
3. You are told the divergence loss on a 15° conical nozzle. Derive the
   correction factor rather than quoting it. `[M09]`
4. Which of these losses would a bigger engine of identical design have less
   of, and why? `[M06, M10]`

### 8. Reading a hot-fire record `[M03, M18]`

**Opening.** I hand you the first three seconds of a hot-fire trace: chamber
pressure, both propellant flows, thrust, and eight wall thermocouples. Tell me
in what order you look at them and what you are looking for.

**Follow-ups.**
1. Thrust and chamber pressure disagree by 4 % on the C_F you infer. Name five
   causes, from most to least likely. `[M18, M03]`
2. Your load cell is calibrated to ±0.25 %, your flowmeters to ±0.5 % each,
   your pressure transducer to ±0.3 %. What is your uncertainty on Isp, and on
   c\*? Do the combination on the board. `[M18]`
3. One wall thermocouple runs 150 K hotter than its neighbours from t = 0.4 s
   and stays there. What is your first hypothesis, and what is the second one
   you must rule out before you touch hardware? `[M10, M07]`
4. The customer wants to accept the engine on this test. What would you refuse
   to accept it on? `[M33, M18]`

---

# Block B — Liquid rocket engines (items 9–33)

### 9. Propellant selection `[M05, M32]`

**Opening.** You are choosing propellants for a reusable medium-lift first
stage. Give me your shortlist and the two or three quantities that actually
decide it.

**Follow-ups.**
1. Isp is not the first thing you said. Defend that. `[M05, M33]`
2. Methane against kerosene: give me the full ledger, not just Isp and coking.
   Include the tank, the pump, the pad, and the turnaround. `[M05, M11, M12]`
3. What is density impulse, and for which stage of which vehicle does it beat
   Isp as a figure of merit? Put numbers on it. `[M03, M32]`
4. Your customer now wants the same stage to sit fuelled on the pad for 30
   days. What changes? `[M05, M27]`
5. Which of your shortlist would you refuse to fly on a crewed vehicle, and on
   what grounds? `[M33, M34]`

### 10. The hydrogen tax `[M05, M11, M12]`

**Opening.** Hydrogen has the highest Isp of any practical chemical fuel and
most new boosters do not use it. Make the case against hydrogen as a booster
fuel.

**Follow-ups.**
1. Quantify the tankage penalty. Density ratio is the easy part; what else is
   there? `[M05, M16]`
2. Why does a hydrogen turbopump need so many more stages than a kerosene one
   at the same discharge pressure? `[M12]`
3. Hydrogen is the best regenerative coolant known. Show me why, and then show
   me the case where that becomes a *constraint* rather than a benefit.
   `[M11, M13]`
4. Where does hydrogen still win outright, and why is the RL10 family still
   flying after sixty years? `[M13, M35]`

### 11. Hypergols and storables `[M05, M08]`

**Opening.** Why does almost every spacecraft main engine and reaction-control
system still use NTO/MMH or NTO/hydrazine, when the Isp is 60 s worse than
hydrolox?

**Follow-ups.**
1. What does "hypergolic" buy you that an igniter cannot? Be specific about
   the failure modes it removes. `[M08, M33]`
2. Ignition delay is a measured propellant property. What happens to a chamber
   if it is too long, and what if it is too short? `[M08, M15]`
3. Apollo's SPS ran at about 6.9 bar chamber pressure `inj`. That is
   ludicrously low by launch-engine standards. Justify it. `[M06, M12]`
4. Would you make the same choice for a new lunar-lander descent engine today?
   Argue both sides. `[M05, M32]`

### 12. Chamber sizing and L\* `[M06]`

**Opening.** How do you size a combustion chamber's volume, and what is L\*
really a proxy for?

**Follow-ups.**
1. Take a throat area of 0.053 m² and L\* = 1.0 m. Compute chamber volume,
   chamber gas density and residence time on the board. Is the residence time
   you get plausible? `[M06, M02]`
2. L\* required has fallen by a factor of two or three since the 1950s for the
   same propellants. What changed? `[M07, M35]`
3. What goes wrong if L\* is too small? Too large? Give me the mechanism for
   each, not the symptom. `[M06, M15]`
4. Chamber pressure doubles and you keep thrust constant. What happens to
   chamber volume, chamber mass, and residence time? `[M06, M16]`

### 13. Contraction ratio `[M06, M02]`

**Opening.** What sets the chamber-to-throat area ratio, and what is the
penalty at each end of the range?

**Follow-ups.**
1. At what contraction ratio does chamber Mach number start to cost you
   measurable stagnation pressure? Work it. `[M02, M06]`
2. Small engines run higher contraction ratios than big ones. Why? `[M06, M10]`
3. How does contraction ratio couple to injector face area and therefore to
   element count and stability? `[M07, M15]`

### 14. Injector element selection `[M07]`

**Opening.** You have to choose an injector element type for a 1,000 kN
LOX/methane staged-combustion engine. Walk me through the candidates and your
choice.

**Follow-ups.**
1. Coaxial shear works beautifully for LOX/LH2 and badly for LOX/RP-1. Explain
   the physics that makes the difference. `[M07, M05]`
2. Impinging doublets: what actually sets the mixing quality, and what is the
   quantity you would measure in a cold-flow rig to predict it? `[M07]`
3. Defend the pintle. Then tell me what you give up. `[M07, M15]`
4. Your element count comes out at 3,000. Your manufacturing lead says 600.
   What does that do to your chamber, your stability margin, and your L\*?
   `[M17, M15, M06]`
5. Chamber pressure doubles and you hold element pressure drop percentage
   constant. What happens to orifice diameter and to element count? `[M07]`

### 15. Injector stiffness and feed coupling `[M07, M15]`

**Opening.** Why do injectors have a large deliberate pressure drop when every
pascal of it costs pump work?

**Follow-ups.**
1. State the rule of thumb for injector Δp as a fraction of chamber pressure
   and explain the physics behind the number. `[M07, M15]`
2. Chamber pressure doubles. Does the required Δp fraction stay constant?
   Argue it from the coupling mechanism, not from the rule. `[M15]`
3. A designer proposes cutting Δp from 20 % to 8 % to save 40 kW of pump
   power. What do you demand to see before agreeing? `[M15, M12]`
4. Cavitating venturis are sometimes put in the feed lines instead. What
   problem does that solve, and what does it not solve? `[M14, M15]`

### 16. Atomization and mixing `[M07]`

**Opening.** Take me from a liquid jet leaving an orifice to a burning droplet
cloud. Name the dimensionless groups that govern each step.

**Follow-ups.**
1. Compute a Weber number for a 1 mm jet at 30 m/s in 3 kg/m³ chamber gas with
   30 mN/m surface tension, and tell me what regime you are in. `[M07]`
2. Droplet lifetime goes as d² in the classical law. What does that imply for
   the chamber length you need, and where does the law break down? `[M07, M06]`
3. Your orifice discharge coefficient drops from 0.80 to 0.62 between cold
   flow and hot fire. What happened? `[M07, M14]`
4. Which matters more for c\* efficiency, atomization or mixing? Defend a
   position and say what experiment would settle it. `[M07, M18]`

### 17. Ignition `[M08]`

**Opening.** Compare the ignition options for a LOX/methane booster engine
that must relight in flight, and pick one.

**Follow-ups.**
1. What must an igniter deliver, quantitatively, to light a chamber? `[M08]`
2. Torch igniters need their own small feed system and their own ignition.
   What lights the torch, and what happens when that fails at altitude? `[M08]`
3. Why did the F-1 use a hypergolic TEA/TEB cartridge when the propellants
   were not hypergolic, and why does Merlin still use TEA-TEB? `[M08, M35]`
4. Design the ignition-detection logic. What do you sense, on what timescale,
   and what do you do when it does not confirm? `[M08, M14, M18]`

### 18. Hard start `[M08, M18]`

**Opening.** An engine destroys itself 80 ms after the start command. Chamber
pressure spiked to three times nominal. Walk me through your investigation.

**Follow-ups.**
1. Name the three or four physical mechanisms that produce an over-pressure
   spike at start, and the trace signature that distinguishes them. `[M08, M15]`
2. Your ox valve opened 25 ms before the fuel valve. Is that the cause? Argue
   both ways. `[M14, M08]`
3. What is the design change you would make first, and how would you show that
   it worked without another article loss? `[M14, M18]`
4. Same failure, but the engine is hypergolic. Does your list change? `[M05, M08]`

### 19. Nozzle contour `[M09]`

**Opening.** Why is a real nozzle a bell and not a cone, and what did Rao
actually solve?

**Follow-ups.**
1. Derive or argue the divergence loss for a conical nozzle, then explain what
   the bell does about it. `[M09, M03]`
2. What is the penalty for over-turning the flow near the throat, and what does
   it look like in the exit plane? `[M09]`
3. An 80 % bell versus a 100 % bell: what is the actual trade, and how much Isp
   is in it? `[M09, M16]`
4. Would you ever deliberately fly a conical nozzle today? `[M24, M32]`

### 20. Overexpansion, separation and side loads `[M09, M16]`

**Opening.** A sea-level engine is overexpanded at liftoff. Explain what the
flow is doing inside the nozzle and why anyone tolerates it.

**Follow-ups.**
1. Give me two separation criteria from the literature and say where they
   disagree. Then compute a separation station for a given exit Mach number.
   `[M09]`
2. Where do side loads come from, and why are they worst during start-up and
   shutdown rather than steady state? `[M09, M16]`
3. The J-2S, the RS-25 and Vulcain all had nozzle side-load episodes. What
   structural design choices reduce the load, and which reduce the *response*?
   `[M16, M34]`
4. How would you instrument a stand test to measure side loads you cannot see?
   `[M18]`

### 21. Altitude compensation `[M09, M32]`

**Opening.** Aerospikes, dual-bell nozzles and extendible exit cones all
attack the same problem. State the problem precisely and then compare the
three.

**Follow-ups.**
1. How much Isp is actually available from perfect altitude compensation on a
   typical first stage? Bound it. `[M03, M33]`
2. Extendible exit cones fly — the RL10B-2's carbon–carbon extension is worth
   roughly 30 s. Aerospikes do not fly. Why is one solved and the other not?
   `[M09, M16, M35]`
3. What does an aerospike do to your heat-transfer problem? `[M10, M11]`
4. Given a fixed budget, would you spend it on altitude compensation or on
   chamber pressure? `[M13, M33]`

### 22. Heat flux at the throat `[M10]`

**Opening.** Estimate the gas-side heat flux at the throat of a 100 bar
LOX/RP-1 engine. State every assumption as you make it.

**Follow-ups.**
1. You used Bartz. What is its accuracy, what is it based on, and where is it
   worst? `[M10]`
2. Chamber pressure doubles. What does throat heat flux do, and what does
   *total* heat load do? They are not the same answer. `[M10, M11]`
3. Move to the nozzle at an area ratio of 10. What is the flux there relative
   to the throat, and why does the scaling exponent take that value? `[M10]`
4. Your wall is 0.8 mm of copper alloy. Compute the through-wall ΔT and tell
   me whether you believe the number. `[M10, M16]`
5. What is the adiabatic wall temperature, and why is it not the flame
   temperature? `[M10]`

### 23. Regenerative cooling design `[M11, M10]`

**Opening.** Design the cooling circuit for that chamber. Start with the
decisions you make before you size a single channel.

**Follow-ups.**
1. Why do channels narrow and deepen at the throat? Take it all the way to the
   aspect-ratio limit and say what stops you. `[M11, M17]`
2. Counterflow or coflow? Up-pass or down-pass? Give me the argument in terms
   of where the coolant is hottest relative to where the wall is hottest.
   `[M11]`
3. Compute a coolant-side film coefficient with Dittus–Boelter and tell me the
   three ways that correlation is wrong here. `[M11, M10]`
4. Your coolant bulk temperature rises 200 K across the jacket. Is that a
   problem? It depends on the fluid — take methane, then hydrogen, then
   kerosene. `[M11, M05]`
5. What is the actual failure mode of an overheated regenerative channel, and
   what does the hardware look like afterwards? `[M16, M34]`

### 24. Film and transpiration cooling `[M11, M03]`

**Opening.** Film cooling always costs Isp. Explain the mechanism of the cost
and how you decide how much to spend.

**Follow-ups.**
1. Ten percent of the fuel is used as film coolant at an Isp about 40 % below
   core. Compute the mass-weighted Isp penalty. `[M03, M11]`
2. The V-2 used roughly 10 % of its fuel in four film-cooling rings; the F-1
   dumped gas-generator exhaust into the nozzle extension. Are those the same
   engineering decision? `[M35, M11]`
3. Where does film cooling break down along the wall, and what governs the
   length it protects? `[M11, M10]`
4. When would you choose ablative over regenerative for a flight engine, given
   the Isp and mass penalties? `[M11, M24, M32]`

### 25. Coolant chemistry and material compatibility `[M11, M05, M16]`

**Opening.** Kerosene coking, hydrogen embrittlement, methane's supercritical
behaviour — take each one and tell me what it does to a cooling-circuit
design.

**Follow-ups.**
1. What is the wall-temperature limit for RP-1 coolant, where does the number
   come from, and what happens when you exceed it locally rather than on
   average? `[M11, M05]`
2. Hydrogen at 40 K entering a channel at 700 K wall: what is the coolant
   actually doing thermodynamically, and why does that make the pressure drop
   hard to predict? `[M11]`
3. Which of the three fluids gives you the most benign cooling problem, and is
   that why methane engines are winning? `[M05, M32]`
4. Name the material choices this drives, and one that has failed in service.
   `[M16, M34]`

### 26. Pressure-fed versus pump-fed `[M12]`

**Opening.** Where is the break point between a pressure-fed and a pump-fed
engine, and what quantity is on the x-axis of that trade?

**Follow-ups.**
1. Derive the tank-mass scaling that kills pressure feed as chamber pressure
   rises. `[M12, M16]`
2. Compute the pressurant mass to expel 2 m³ of propellant at 30 bar with
   ambient-temperature helium, and then tell me why the real number is larger.
   `[M12]`
3. Blowdown instead of regulated: what do you gain, what do you lose, and what
   does it do to your engine's operating box? `[M12, M29]`
4. Apollo's descent engine was pressure-fed and throttled 10:1. Would a
   pump-fed engine have done that job better? `[M12, M35]`

### 27. Cavitation, NPSH and inducers `[M12]`

**Opening.** Explain net positive suction head, why it is the tank designer's
problem as much as the pump designer's, and what an inducer does about it.

**Follow-ups.**
1. Compute NPSH available for a 3 bar tank of a fluid at 810 kg/m³ with 0.2 bar
   vapour pressure. What suction specific speed does that let you run? `[M12]`
2. What is the failure mode when you get it wrong, and how fast does it
   destroy the pump? `[M12, M34]`
3. Why is cavitation worse for LOX than for kerosene at the same NPSH margin?
   `[M12, M05]`
4. A booster pump adds mass and a second failure point. When is it the right
   answer? `[M12, M13]`

### 28. Turbines and gas generators `[M12, M13]`

**Opening.** How do you set gas-generator temperature, and what fights with
what in that decision?

**Follow-ups.**
1. Compute the turbine power available from 20 kg/s at 900 K through a 20:1
   pressure ratio at 65 % efficiency. Sanity-check it against a real engine.
   `[M12]`
2. Why fuel-rich rather than ox-rich, and what does the Soviet answer to that
   question tell you about their materials programme? `[M13, M16, M35]`
3. Your turbine is choked and partial admission. What does that do to blade
   loading and to your efficiency estimate? `[M12]`
4. Gas-generator flow is 3 % of total at 40 % of core Isp. Compute the engine
   Isp penalty and compare it to a staged-combustion engine's. `[M13, M03]`

### 29. Cycle selection `[M13]`

**Opening.** Choose a cycle for a 2,000 kN reusable LOX/methane booster
engine. Defend it against the two cycles you rejected.

**Follow-ups.**
1. Draw the flow path of full-flow staged combustion and mark every place a
   turbine-inlet temperature limit binds. `[M13, M16]`
2. What is the actual Isp difference between gas generator and staged
   combustion for the same propellants and chamber pressure? Do not say "a
   few percent" — give me the mechanism and a number. `[M13, M03]`
3. The RS-68 chose gas generator over staged combustion explicitly for cost.
   Was that right? `[M13, M33, M35]`
4. Why can an expander cycle not be scaled up indefinitely? Derive the
   scaling. `[M13, M11]`
5. Chamber pressure doubles. Which cycle's turbomachinery problem grows
   fastest? `[M12, M13]`

### 30. Valves, sequencing and transients `[M14, M08]`

**Opening.** Write me the start sequence for a pump-fed engine, with
approximate timings, and justify each step's position in the order.

**Follow-ups.**
1. What is spin-start, and what are the alternatives? `[M14, M13]`
2. Why is shutdown often harder on the hardware than start? `[M14, M11]`
3. A main valve takes 120 ms to open against a 200 bar differential. What
   actuation would you choose and what does that cost you in the engine's
   mass and control loop? `[M14]`
4. Waterhammer in a propellant line: estimate the peak pressure and tell me
   what you do about it. `[M14, M16]`

### 31. Combustion instability `[M15]`

**Opening.** Distinguish chug, buzz and screech by frequency, by mechanism,
and by what each one destroys.

**Follow-ups.**
1. Compute the first tangential mode frequency of a 0.6 m diameter chamber
   with a 1,100 m/s sound speed. Where does the mode constant come from?
   `[M15, M02]`
2. Baffles, acoustic cavities, injector redesign: what does each actually do
   to the mechanism, and which one is an admission of defeat? `[M15, M07]`
3. What is a bomb test, what does dynamic stability mean, and what is the
   acceptance criterion? `[M15, M18]`
4. The F-1 took roughly 2,000 full-scale tests and a compartmented baffle to
   stabilise. Could that programme be done with simulation today? `[M36, M35]`
5. Chamber pressure doubles. Does your stability margin improve or degrade?
   `[M15]`

### 32. Materials and manufacturing `[M16, M17]`

**Opening.** Why is the hot wall of a regeneratively cooled chamber almost
always a copper alloy, and what are you actually optimising?

**Follow-ups.**
1. Copper is weak and melts at 1,358 K. Explain how a wall made of it survives
   a 3,500 K gas. `[M16, M10]`
2. What is the life-limiting failure mode of a copper liner, and what does the
   "dog-house" deformation tell you about it? `[M16, M34]`
3. Additively manufactured GRCop-42 chambers: what problems does AM solve, and
   what new ones does it create? Include inspection. `[M17, M36]`
4. Compare a brazed tube-wall chamber (F-1, J-2) to a milled-channel one
   (RS-25, J-2X). Why did the industry move, and what was lost? `[M17, M35]`

### 33. Test campaigns `[M18]`

**Opening.** You are the test lead for a new 500 kN engine. Lay out the
campaign from first component test to flight qualification.

**Follow-ups.**
1. What do you measure, with what, and at what sample rate? Justify the rate.
   `[M18, M15]`
2. Sea-level stand or altitude cell for a vacuum engine — what does each one
   cost you in fidelity? `[M18, M09]`
3. How many engines and how many seconds before you fly? Defend the number
   against a programme manager who wants half. `[M33, M18]`
4. What single measurement, if you could add only one, would you add to a
   stand that already has the standard set? `[M18]`

---

# Block C — Solid rocket motors (items 34–46)

### 34. Why solids `[M19, M32]`

**Opening.** Given that solids have lower Isp, cannot be shut down, and cannot
be tested before flight, make the affirmative case for them.

**Follow-ups.**
1. Rank the reasons by how often they are the deciding one in a real
   procurement. `[M27, M33]`
2. Mass fraction: quote a real one and explain why solids beat liquids on it
   for short burns. `[M22, M32]`
3. Where does the "cannot be shut down" claim break down? `[M21, M26]`
4. Would you put a solid on a crewed vehicle? The answer has been both yes and
   no historically — take a side. `[M34, M26]`

### 35. Propellant families `[M19]`

**Opening.** Describe the constituents of a modern composite solid propellant
and what each one is there for.

**Follow-ups.**
1. Aluminium raises Isp and costs you something. What, and how much? `[M19, M24]`
2. PBAN versus HTPB: what actually changed, and why did the Shuttle programme
   never switch? `[M19, M25, M26]`
3. Double-base, composite, and composite-modified double-base: where does each
   still get used and why? `[M19, M27]`
4. What is solids loading, why does it stop at about 88 %, and what does the
   limit cost you? `[M19, M25]`

### 36. Burn rate and the pressure exponent `[M20]`

**Opening.** State the burn-rate law, define every symbol including the units
of the coefficient, and tell me the physical meaning of the exponent.

**Follow-ups.**
1. Prove that n < 1 is required for a stable operating point. `[M20, M21]`
2. A motor with a = 3.5 × 10⁻⁵ SI, n = 0.35, ρ = 1,770 kg/m³, c\* = 1,550 m/s
   has 5.0 m² of burning area and a 0.020 m² throat. Compute equilibrium
   chamber pressure. Now raise burning area 10 % and do it again. `[M20, M21]`
3. Repeat that sensitivity for n = 0.6. What does the comparison tell a
   designer about propellant selection? `[M20]`
4. How is n actually measured, and what is the strand-burner-to-motor
   discrepancy? `[M20, M25]`

### 37. Erosive burning `[M20, M21]`

**Opening.** What is erosive burning, when does it appear, and what does it do
to the pressure trace?

**Follow-ups.**
1. What dimensionless group predicts its onset, and what is the threshold?
   `[M20]`
2. Where in the grain is it worst, and how does that change the design of a
   long, thin motor? `[M21]`
3. Erosive burning raises early pressure. Is that a structural problem, a
   performance problem, or both? `[M22, M20]`
4. What design changes suppress it? `[M21]`

### 38. Temperature sensitivity `[M20]`

**Opening.** A motor conditioned to 233 K and the same motor at 311 K do not
give the same trace. Explain, and give me the two coefficients that quantify
it.

**Follow-ups.**
1. With σ_p = 0.002 K⁻¹ and n = 0.35, compute π_K and then the chamber
   pressure change over a 40 K conditioning swing. `[M20]`
2. Why does the same σ_p produce a much bigger pressure swing in a
   high-n propellant? Show it. `[M20]`
3. What does this do to your case design factor of safety, and to your
   qualification test matrix? `[M22, M27]`
4. How does a designer buy the sensitivity down? `[M19, M20]`

### 39. Grain geometry `[M21]`

**Opening.** Take a required thrust-versus-time trace and tell me how you get
from it to a grain cross-section.

**Follow-ups.**
1. Draw the burning-area history of a star grain, a wagon-wheel, and a simple
   cylindrical bore, and explain the sliver problem. `[M21]`
2. The Shuttle SRB uses an 11-point star forward and double-truncated cones
   aft. Why that combination specifically, and what flight constraint drove
   it? `[M21, M26]`
3. Compute web thickness and burn time for a given burn rate, then tell me
   what you would change to shorten burn time at fixed total impulse. `[M21, M20]`
4. Chamber pressure doubles. What happens to your grain design at fixed
   impulse and fixed envelope? `[M21, M22]`

### 40. Grain structural integrity `[M21, M23]`

**Opening.** A cast grain is a rubbery solid bonded to a stiff case. Tell me
every load case it has to survive before the motor is even fired.

**Follow-ups.**
1. Where does cure shrinkage put the highest strain, and what is the failure
   that follows? `[M25, M23]`
2. What does a bore crack do to the pressure trace, and how fast? `[M21, M20]`
3. How is grain integrity verified without cutting the motor open? `[M25, M18]`
4. Ageing: what changes over ten years in storage, and which property do you
   surveil? `[M27, M19]`

### 41. Motor cases `[M22]`

**Opening.** Steel, or filament-wound composite? Give me the trade for a
large booster.

**Follow-ups.**
1. Compute the membrane thickness for a 3.4 m diameter case at 65 bar with a
   1.4 safety factor in a 1,400 MPa steel. Then say what that calculation
   ignores. `[M22, M16]`
2. Why did P120C go monolithic composite when the Shuttle SRB was segmented
   steel? What did each one's programme constraints demand? `[M22, M25, M26]`
3. Segment joints: name the failure mode and the design features that address
   it. `[M22, M34]`
4. What is the case's real mass driver at large diameter, and is it the
   membrane? `[M22, M16]`

### 42. Insulation and liners `[M23]`

**Opening.** Distinguish insulation from liner, and tell me what each one has
to survive.

**Follow-ups.**
1. How is insulation thickness sized, and what is the design margin actually
   protecting against? `[M23]`
2. Aluminised propellants produce molten alumina. What does that do to
   insulation in the aft dome and around the nozzle entry? `[M23, M24]`
3. Why is insulation mass a bigger fraction of inert mass than newcomers
   expect? `[M23, M22]`
4. What does an insulation failure look like in post-fire hardware and in the
   pressure trace? `[M23, M34]`

### 43. Solid nozzles and throat erosion `[M24]`

**Opening.** Why is a solid motor nozzle made of ablatives rather than cooled
metal, and what governs the design?

**Follow-ups.**
1. Throat area grows 6 % over the burn. Compute the effect on chamber pressure
   for n = 0.35, and then on delivered thrust. `[M24, M20]`
2. Carbon–carbon versus graphite versus carbon-phenolic throat inserts: what
   is the trade? `[M24, M16]`
3. What is a submerged nozzle for, and what does it cost? `[M24, M21]`
4. Why does particle loading make the nozzle problem qualitatively different
   from a liquid engine's? `[M24, M19]`

### 44. Thrust vector control `[M24]`

**Opening.** Compare flexseal gimballing with liquid injection TVC for a large
booster.

**Follow-ups.**
1. What sets the actuator power requirement for a flexseal, and why does it
   rise with chamber pressure? `[M24, M22]`
2. LITVC gives you a side force per unit injectant. What is the efficiency and
   what happens to the injectant mass budget over a long burn? `[M24]`
3. Titan used LITVC; the SRMU that replaced those motors used a gimballed
   nozzle. What changed to make the switch worthwhile? `[M26, M35]`
4. Electromechanical versus hydraulic actuation: which would you choose today
   and why? `[M24, M36]`

### 45. Solid motor manufacturing `[M25]`

**Opening.** Walk me through casting a large segmented motor and tell me where
the quality risk concentrates.

**Follow-ups.**
1. What is the mixing and casting hazard, and how does the process design
   control it? `[M25]`
2. Voids and unbonds: how are they found, and what is the accept criterion
   based on? `[M25, M18]`
3. Why is process control, not design, the dominant reliability driver for
   solids? `[M25, M34]`
4. A production lot shows burn rate 3 % high. What do you do, and what do you
   *not* do? `[M20, M25, M33]`

### 46. Historical motors and the lessons `[M26, M34]`

**Opening.** Pick a large solid motor programme and tell me what the field
learned from it that it did not know before.

**Follow-ups.**
1. The Challenger field joint: state the mechanism precisely, including why
   temperature mattered and why the joint rotated. `[M22, M34]`
2. What was fixed in the RSRM redesign, and what class of fix was it —
   design, process, or organisational? `[M22, M34, M33]`
3. The SLS five-segment booster reuses Shuttle-era steel cases. What does that
   constrain, and what does BOLE change? `[M22, M26]`
4. What number in the public literature about large solids is most often
   quoted wrongly, and how would you catch it? `[M26]`

---

# Block D — Cold-gas systems (items 47–52)

### 47. Cold-gas fundamentals `[M28]`

**Opening.** Explain why a cold-gas thruster has an Isp of 60–70 s when the
same nozzle on a combustion chamber would give 300, and what that number is
made of.

**Follow-ups.**
1. Compute the ideal vacuum Isp for nitrogen at 300 K and ε = 50 on the board.
   `[M28, M02]`
2. Now do ε = 20 and ε = 100. Why is the answer so insensitive, and what does
   that tell you about where to spend design effort? `[M28, M09]`
3. Real systems deliver about 90 % of ideal, and less at small scale. Where do
   the losses go, and which one dominates below 1 N? `[M28, M30]`
4. If your tank cools from 300 K to 250 K during a long burn, what happens to
   Isp and to thrust? `[M29]`

### 48. Gas selection `[M28, M29]`

**Opening.** Choose a propellant for a 6U CubeSat cold-gas system with a 40 m/s
Δv requirement. Justify it.

**Follow-ups.**
1. Helium has the best Isp of any practical cold gas after hydrogen. Why does
   nobody use it? `[M28, M30]`
2. What is a self-pressurising saturated liquid, and what does it remove from
   the system? `[M29, M30]`
3. Compare impulse per unit stored volume for helium and for R-236fa. Which
   figure of merit is actually deciding, and what is the classic arithmetic
   error people make here? `[M28, M31]`
4. Your spacecraft has an infrared instrument. Does that change your
   propellant? `[M31, M33]`

### 49. Blowdown modelling `[M29]`

**Opening.** Model a blowdown cold-gas system from full tank to end of life.
State your assumptions.

**Follow-ups.**
1. Isothermal or adiabatic? Which is conservative for what, and what does the
   real system do? `[M29]`
2. Compute the usable mass fraction between 300 bar and 50 bar under your
   assumption. `[M29]`
3. Your thrust falls by a factor of six over the mission. What does that do to
   the attitude-control system's design? `[M29, M31]`
4. Add a regulator. Quantify what you gained and what you paid. `[M30, M29]`

### 50. Cold-gas hardware `[M30]`

**Opening.** Describe the components of a cold-gas system from tank to nozzle
and tell me which one keeps engineers awake.

**Follow-ups.**
1. Define minimum impulse bit, compute one for a 1 N thruster with a 20 ms
   commanded pulse and 4/6 ms rise and fall, and say what limits it. `[M30, M29]`
2. Leakage: what rate is acceptable for a three-year mission, and how is it
   verified? `[M30, M33]`
3. Why are nozzle Reynolds numbers a problem at millinewton scale, and what
   does it do to the discharge coefficient? `[M30, M28]`
4. COPV or all-welded metal module? Take a side for a CubeSat. `[M30, M16]`

### 51. Flown systems `[M31]`

**Opening.** MarCO flew two 6U CubeSats to Mars on cold gas. Describe the
system and explain why cold gas was the right choice there.

**Follow-ups.**
1. 755 N·s of total impulse at about 40 s Isp — compute propellant mass and
   volume and check it against the published wet mass. `[M31, M03]`
2. SAFER carries 1.4 kg of GN₂ and delivers 3.05 m/s to an EVA crew member.
   Verify that closure. Now try the same arithmetic for the MMU and tell me
   what you find. `[M31]`
3. What would you have to change to double MarCO's Δv? `[M31, M29]`
4. When does cold gas stop being the answer, and what replaces it? `[M32, M31]`

### 52. Warm gas and the boundary `[M31, M28]`

**Opening.** Heating the gas is the only lever that meaningfully raises
cold-gas Isp. Explain why, and where the boundary to "not cold gas any more"
sits.

**Follow-ups.**
1. CHIPS gets 82 s from a propellant whose cold ideal is about 43 s. Account
   for the factor. `[M31, M28]`
2. What does the power budget look like, and what does that do to the mission
   design? `[M31, M33]`
3. Where does this sit against a hydrazine monopropellant or an electric
   thruster on the same bus? `[M32]`

---

# Block E — Cross-system engineering (items 53–60)

### 53. The architecture trade `[M32]`

**Opening.** A customer needs 3 km/s from a 2,000 kg upper stage. Take them
through liquid, solid, and hybrid architectures and give a recommendation.

**Follow-ups.**
1. What information would change your recommendation, and which piece of it
   would change it fastest? `[M33]`
2. Compute the propellant mass for each of your candidates and show me where
   the inert-mass assumption dominates the answer. `[M03, M32]`
3. Now the requirement adds "restartable, three burns over 14 days". What
   survives? `[M32, M05]`
4. The customer says cost, not mass, is the constraint. Redo it. `[M33, M35]`

### 54. Requirements and margins `[M33]`

**Opening.** Where do propulsion requirements come from, and how does a
performance requirement become a hardware specification?

**Follow-ups.**
1. Distinguish margin, contingency, and factor of safety. Who owns each?
   `[M33, M16]`
2. Your Isp prediction has ±1.5 % uncertainty and your inert mass has ±5 %.
   How do you allocate Δv margin? Do the combination. `[M33, M18]`
3. What is a requirement you would push back on, and how would you make the
   argument? `[M33]`
4. A single-string component saves 12 kg. What is your process for accepting
   or rejecting that? `[M33, M34]`

### 55. Verification and qualification `[M33, M18]`

**Opening.** What does it mean to qualify a propulsion system, and how is that
different from testing it?

**Follow-ups.**
1. Qualification, acceptance, protoflight: define each and say when you would
   choose protoflight. `[M33, M18]`
2. What do you do about failure modes you cannot test at full scale? `[M18, M36]`
3. How much of qualification is model validation rather than demonstration,
   and has that ratio changed? `[M36, M33]`
4. A qualification unit fails at 1.4× design pressure when the requirement was
   1.25×. Is that a pass? `[M22, M33]`

### 56. Failure analysis: the SRB joint `[M34, M22, M23]`

**Opening.** Reconstruct the Challenger STS-51-L propulsion failure as an
engineering chain, from ambient temperature to loss of vehicle.

**Follow-ups.**
1. Why did joint rotation matter more than the temperature alone? `[M22, M34]`
2. What did the pressure trace and the film show, and in what order? `[M18, M34]`
3. What is the general lesson about seals in a joint that opens under load?
   `[M16, M22]`
4. Name a second programme where the same class of mistake — normalising an
   out-of-family observation — appeared. `[M34, M33]`

### 57. Failure analysis: turbomachinery and cycles `[M34, M12]`

**Opening.** Give me the failure modes of a rocket turbopump, in order of how
much of the historical record they account for.

**Follow-ups.**
1. Take one: subsynchronous whirl, or a blade failure, or a bearing. Explain
   the mechanism and the instrumentation that catches it. `[M12, M18]`
2. Why is a fire in an ox-rich turbine a different kind of problem from a fire
   in a fuel-rich one? `[M13, M16]`
3. What did the RS-25 programme learn about turbopump life, and how did that
   change the flight rules? `[M12, M35]`
4. A pump on the stand shows a 40 Hz vibration line that grows with speed but
   is not synchronous. What is your first hypothesis? `[M12, M18]`

### 58. Why chamber pressure climbed `[M35]`

**Opening.** From the V-2's 15 bar to Raptor's claimed 300 bar. Tell me the
story as an engineering argument, not a chronology.

**Follow-ups.**
1. What does higher chamber pressure actually buy? Separate the real gains
   from the ones people assert. `[M35, M03]`
2. What technology had to exist at each step for the next pressure level to be
   reachable? `[M12, M16, M17]`
3. Chamber pressure doubles from 150 to 300 bar. Name every subsystem whose
   design problem gets qualitatively harder, not just quantitatively. `[M10, M12, M16]`
4. Is there a ceiling? Argue for a number. `[M13, M16]`

### 59. Modern methods `[M36]`

**Opening.** What has actually changed in how a rocket engine is developed in
the last twenty years, and what has not?

**Follow-ups.**
1. CFD for injector design: what does it predict reliably today, and what does
   it still not? `[M36, M07]`
2. Additive manufacturing changed part count and lead time. Did it change the
   *design*? Give an example where it did. `[M17, M36]`
3. "Test-heavy, iterate fast" versus "analyse first, test to confirm". Which
   is the F-1 programme and which is a modern one, and what determines which
   is cheaper? `[M35, M33]`
4. What would you need to see before you trusted a simulation instead of a
   hot fire for a stability clearance? `[M15, M36]`

### 60. Design it in front of me `[M01–M36]`

**Opening.** Design a 250 kN vacuum-start upper-stage engine for a methalox
launcher. You have a whiteboard and twenty minutes. Start wherever you like
and tell me why you started there.

**Follow-ups.**
1. Size the throat and exit. State chamber pressure and expansion ratio and
   justify both. `[M02, M03, M09]`
2. Choose a cycle and a cooling scheme and tell me what each choice forecloses.
   `[M11, M13]`
3. Now the vehicle grows and the same engine must deliver 320 kN. What do you
   change, in order, and what is the first thing that breaks? `[M06, M12, M16]`
4. What is the single largest risk in your design, and what is the first test
   you would run to retire it? `[M18, M33]`
5. Tell me the number in your design you are least confident about, and how
   you would bound it. `[M33]`

---

## Scoring a mock oral

There is no mark scheme for an oral exam, but there is a consistent way the
outcome is decided. Examiners are answering four questions about you:

| question | evidence they look for |
|---|---|
| Is the physics yours? | you derive rather than recall; you get signs and exponents right without checking |
| Do you know what you do not know? | you flag contested figures, state assumptions, and bound rather than guess |
| Can you reason about hardware you have not seen? | you reach a defensible answer on the unfamiliar follow-up |
| Would you be safe to give a subsystem to? | you say what you would measure, and what would make you stop |

A candidate who answers every opening well and stalls on every third follow-up
has Level 2 mastery and will be told so. Level 3 is the follow-ups.
