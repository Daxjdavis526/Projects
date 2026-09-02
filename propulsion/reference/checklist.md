# WHAT A PROPULSION ENGINEER SHOULD KNOW

A self-audit inventory. Every line is one **testable capability**, phrased so
that you can attempt it cold — no notes, no calculator beyond arithmetic — and
know within a minute whether you could actually do it in front of somebody.

Each item carries two tags:

- **Mastery level** — L1 familiarity, L2 working engineering knowledge, L3
  interview mastery, in the sense defined in the [README](../README.md#mastery-system)
  and refined module by module.
- **Module** — where the material is taught, so a failed item maps directly to
  a study target.

Three kinds of item recur deliberately, because all three are things real
engineers are expected to do without warning:

- **Number items** — "state the typical range from memory". Engineering ranges,
  not exact values; if you are within the stated band you pass.
- **Real-engine items** — a specific fact about a specific machine. Every
  numerical claim traces to [`engine-database.md`](engine-database.md), and the
  item carries that file's caveat with it. Where a figure is contested,
  disputed or a company claim, **saying so is part of passing the item**.
- **Diagnosis items** — "given a described trace, I can…". These are the ones
  that separate L2 from L3, and they are the ones interviews are made of.

Do not tick an item you have merely read. Tick it when you have done it.

Scoring and the audit protocol are at the [end of this file](#self-audit-protocol).

---

## Thermodynamics

- [ ] (L1, M01) I can state the integral control-volume forms of mass, momentum and energy conservation for a steady-flow engine, and point at the term in the momentum equation that becomes thrust.
- [ ] (L1, M01) I can explain in plain language why stagnation enthalpy is conserved through an adiabatic nozzle but stagnation pressure is not, without using the word "isentropic" incorrectly.
- [ ] (L2, M01) I can derive the steady-flow energy equation from the first law and show that $h_0$ is constant through an adiabatic nozzle with or without friction.
- [ ] (L2, M01) I can compute $T_0$, $p_0$ and $h_0$ at any station from static properties and Mach number, and say which of the three is conserved under which condition.
- [ ] (L2, M01) I can convert a stagnation-pressure loss into entropy generated per unit mass, and then into lost exhaust velocity and lost $I_{sp}$.
- [ ] (L2, M01) I can compute $\mathcal{M}$, $R$, $c_p$ and $\gamma$ of a combustion-product mixture from its mole fractions, with correct units, in under five minutes.
- [ ] (L2, M01) I can state from memory the typical ranges for rocket exhaust: $T_0$ 2600–3800 K, $\mathcal{M}$ 10–25 kg/kmol, $\gamma$ 1.14–1.30, and say why $\gamma = 1.4$ is wrong here.
- [ ] (L2, M01) I can compute the chamber Mach number from a contraction ratio and the injector-face-to-throat-stagnation pressure loss that follows, and state the typical Rayleigh loss range (2–5 %, up to 10 % at low $\varepsilon_c$).
- [ ] (L2, M01) I can correct a published $p_c$ between the injector-end and nozzle-stagnation conventions and say which direction the correction goes.
- [ ] (L2, M01) I can select between calorically perfect, thermally perfect and real-gas models for the tank, pump inlet, chamber and nozzle exit, and estimate the error of the simpler choice at each station.
- [ ] (L2, M01) I can explain what a compressibility factor is, and state that helium at ~310 bar and 293 K has $Z \approx 1.17$ — i.e. an ideal-gas bottle sizing is ~16 % short.
- [ ] (L2, M01) I can compute $\eta_{c^*}$ from hot-fire data and name the three distinct physical losses it silently lumps together.
- [ ] (L2, M01) I can state the typical $\eta_{c^*}$ range (0.94–0.99, up to 0.995 on developed hydrogen faces) and say what a value of 1.02 means.
- [ ] (L2, M01) I can explain, using $K_p$ and Le Chatelier, why dissociation falls roughly as $p^{-1/3}$ and therefore why $T_c$ saturates with chamber pressure.
- [ ] (L2, M01) I can estimate the frozen-versus-shifting-equilibrium $I_{sp}$ spread for a given propellant and say which real engines sit near which limit.
- [ ] (L3, M01) Given an unfamiliar engine datasheet, I can say which chamber-pressure convention it probably used, how I would confirm it, and what the error does to every derived quantity.
- [ ] (L3, M01) Given a reported $\eta_{c^*}$ above 1.0, I can diagnose the reference-model error — station, hot throat area, or an uncounted flow — rather than crediting the hardware.
- [ ] (L3, M01) I can argue both sides of a mixture-ratio choice for a stated vehicle and name the single computation that would settle it.
- [ ] (L3, M01) I can estimate where in a nozzle the chemistry freezes for a propellant I have not used, from its flame temperature and product species, and say what the kinetic loss costs in seconds.
- [ ] (L3, M01) I can explain why the RS-25 runs at MR 6.03 rather than at the $I_{sp}$ optimum, and give the tank-volume argument in numbers.

---

## Fluids and compressible flow

- [ ] (L1, M02) I can explain in plain language why a nozzle has a throat, why the throat is sonic when the nozzle flows supersonically, and what overexpanded and underexpanded mean.
- [ ] (L1, M02) I can state that thrust rises with altitude and attribute it correctly to the $-p_a A_e$ term rather than to "pushing on air".
- [ ] (L1, M02) I can name two engines at opposite ends of the expansion-ratio range — the F-1 at $\varepsilon = 16$ and the RL10B-2 at a contested 285:1 deployed / 77:1 retracted — and say why each is right for its stage.
- [ ] (L2, M02) I can derive the speed of sound from a control volume around a weak wave and state exactly which assumptions give $a = \sqrt{\gamma R T}$.
- [ ] (L2, M02) I can derive the area–velocity relation and use it to show that a converging duct cannot produce supersonic flow however hard it is driven.
- [ ] (L2, M02) I can produce a full station table — $M$, $p$, $T$, $\rho$, $V$ — at any area ratio given $\gamma$, and do it without a chart.
- [ ] (L2, M02) I can state from memory the $M=1$ property ratios for $\gamma = 1.2$ and use them as a sanity check on any nozzle calculation.
- [ ] (L2, M02) I can write the choked mass-flow relation $\dot m = \Gamma p_0 A_t/\sqrt{RT_0}$, derive it, and explain why ambient pressure does not appear in it.
- [ ] (L2, M02) I can compute $\Gamma(\gamma)$ for any $\gamma$ and state that it varies only ~3 % across the whole plausible rocket range — and that $\Gamma = 0.685$ at $\gamma = 1.4$.
- [ ] (L2, M02) I can classify a converging–diverging nozzle's operating regime from $p_0/p_a$ and $\varepsilon$, and sketch the wall pressure distribution for each regime.
- [ ] (L2, M02) I can derive the normal-shock relations for a perfect gas, compute the stagnation-pressure loss and entropy rise, and locate a shock inside a nozzle for a given back pressure — including the change in $A^*$ across it.
- [ ] (L2, M02) I can use oblique-shock and Prandtl–Meyer relations to explain the plume structure of an overexpanded and an underexpanded nozzle, and say honestly what Mach diamonds are actually showing.
- [ ] (L2, M02) I can apply both the Summerfield and Schmucker separation criteria to a real contour, state where they disagree and by how much, and say which I would use and why.
- [ ] (L2, M02) I can distinguish free shock separation from restricted shock separation and state which contour class is at risk of the transition.
- [ ] (L2, M02) I can quantify how thrust and $I_{sp}$ change with altitude for a fixed nozzle and reproduce a real engine's sea-level-to-vacuum $I_{sp}$ gap from $\varepsilon$ alone.
- [ ] (L2, M02) I can derive the break-even altitude at which a higher-$\varepsilon$ nozzle overtakes a lower-$\varepsilon$ one on the same engine.
- [ ] (L3, M02) Given an unfamiliar engine's $\varepsilon$, $p_c$ and mission, I can predict whether it separates at sea level, and name what I would instrument on the stand to confirm it.
- [ ] (L3, M02) Given a wall-static-pressure trace from a test, I can say which operating regime the nozzle is in and whether the shock is inside or outside the exit plane.
- [ ] (L3, M02) I can argue both sides of a high-$\varepsilon$ booster nozzle — trajectory-integrated impulse against side loads and mass — and name the programmes that hit the problem (SSME, Vulcain 2, J-2S).
- [ ] (L3, M02) I can explain why Merlin 1D and Merlin 1D Vacuum share propellants and a powerhead yet differ by tens of seconds of $I_{sp}$, and attribute the difference entirely to $\varepsilon$.

---

## Combustion and thermochemistry

- [ ] (L1, M04) I can state that every flying bipropellant engine runs fuel-rich of stoichiometric, and explain in plain language why light exhaust beats hot exhaust.
- [ ] (L1, M04) I can quote the stoichiometric O/F of LOX/LH₂ (≈7.9) and LOX/RP-1 (≈3.4) and say roughly where real engines run (≈6 and 2.3–2.7).
- [ ] (L1, M04) I can say what CEA is, who wrote it, and what a "rocket problem" input deck contains.
- [ ] (L2, M04) I can balance the combustion equation for LOX/LH₂, LOX/CH₄, LOX/RP-1 (as CH$_{1.95}$), N₂O₄/MMH and N₂O₄/UDMH, and compute $r_{st}$ to three significant figures for each.
- [ ] (L2, M04) I can convert freely between mixture ratio, fuel mass fraction, equivalence ratio and molar O/F, and explain why rocket engineers use mass O/F rather than $\phi$.
- [ ] (L2, M04) I can set up and solve an adiabatic-flame-temperature enthalpy balance from heats of formation and a $c_p(T)$ polynomial, handling cryogenic reactant enthalpy correctly.
- [ ] (L2, M04) I can state the sign and rough size of the error in a dissociation-free flame temperature — 300–700 K high for hydrogen or kerosene flames — and say why it shrinks as the flame cools.
- [ ] (L2, M04) I can write $K_p$ for H₂O ⇌ H₂ + ½O₂ and for OH formation and predict from Le Chatelier which way pressure and mixture ratio move the dissociated fraction.
- [ ] (L2, M04) I can show quantitatively why $I_{sp} \propto \sqrt{T_0/\mathcal{M}}$ drives the optimum mixture ratio fuel-rich, and compute roughly how far.
- [ ] (L2, M04) I can state what CEA's "frozen" and "equilibrium" options each assume, which bounds reality from which side, and where a real nozzle sits between them.
- [ ] (L2, M04) I can read a CEA rocket output block line by line, including `(dLV/dLP)t`, `GAMMAs`, `CSTAR`, `CF`, `Ivac` and `Isp`, and explain why `Isp` is not the specific impulse I want.
- [ ] (L2, M04) I can convert a CEA theoretical $I_{sp}$ into an expected delivered $I_{sp}$ with an itemised, defensible efficiency chain, and state that real engines deliver 93–98 % of it.
- [ ] (L2, M04) I can name four regimes in which CEA's answer is physically wrong and say what I would use instead in each.
- [ ] (L2, M01) I can explain why the frozen $\gamma$ of a mixture is not the isentropic exponent of an equilibrium expansion, and give the rough size of the difference (≈1.19 frozen versus 1.13–1.15 shifting for a hydrolox mixture).
- [ ] (L2, M04) I can state from memory that LOX/LH₂ at flight MR burns *cooler* (≈3550 K) than LOX/RP-1 (≈3670 K) and explain why it still wins.
- [ ] (L3, M04) Given an unfamiliar engine's propellants, cycle, $p_c$ and $\varepsilon$, I can estimate its mixture ratio to within about 10 % and defend the estimate from cooling, cycle and density arguments.
- [ ] (L3, M04) I can explain why Vulcain 2 has a *lower* vacuum $I_{sp}$ (429 s) than Vulcain 1 (431 s) despite higher chamber pressure, and attribute it to the MR change from 5.3 to 6.1.
- [ ] (L3, M04) Given a $c^*$-efficiency-versus-mixture-ratio plot, I can say whether the problem is mixing, residence time or instrumentation.
- [ ] (L3, M04) I can argue both sides of frozen versus equilibrium for a specific nozzle and name the measurement that would settle it.
- [ ] (L3, M04) I can say which of CEA's assumptions I would abandon first for an aluminised solid, an oxidiser-rich preburner or a gelled hydrocarbon, and name the tool I would reach for instead.

---

## Liquid engines (system level)

- [ ] (L1, M03) I can state the thrust equation $F = \dot m u_e + (p_e - p_a)A_e$ and explain both terms in plain language, including why the ambient term subtracts.
- [ ] (L1, M03) I can explain what $c^*$ and $C_f$ separately measure and why splitting the two is useful.
- [ ] (L1, M03) I can quote from memory that $I_{sp}$ is 250–320 s for kerolox and 420–465 s for hydrolox, and name the flown record holder (RL10B-2, 465.5 s vacuum).
- [ ] (L2, M03) I can prove that thrust is maximised at $p_e = p_a$ for fixed $p_c$ and $p_a$, and state what that proof assumes.
- [ ] (L2, M03) I can derive $c^* = \sqrt{RT_0}/\Gamma(\gamma)$ from the choked-throat mass-flow relation.
- [ ] (L2, M03) I can size a thrust chamber end to end: thrust → $p_c$ → $c^*$ → $\dot m$ → $A_t$ → $\varepsilon$ → $A_e$ → chamber volume from $L^*$ and $\varepsilon_c$.
- [ ] (L2, M03) I can size a throat from thrust, chamber pressure and $C_f$, and state the assumption behind $C_f$ that makes the answer only as good as the assumed $\gamma$ and expansion.
- [ ] (L2, M03) I can cross-check that throat two ways — from $\dot m$ and $c^*$, and from $F$, $p_c$ and $C_f$ — and say which I would put in a contract and why.
- [ ] (L2, M03) I can reduce hot-fire data to $\eta_{c^*}$ and $\eta_{C_f}$ and name which physical loss each one contains.
- [ ] (L2, M03) I can estimate the divergence loss $\lambda = (1+\cos\alpha)/2$ and place it correctly alongside kinetic, boundary-layer, two-phase and finite-rate losses in a budget.
- [ ] (L2, M03) I can state that $C_{f,max}$ falls with $\gamma$ (about 2.25 at $\gamma=1.2$ versus 1.81 at $\gamma=1.4$) and explain why a monatomic working fluid is a poor rocket propellant per unit mass.
- [ ] (L2, M03) I can read a published datasheet ($p_c$, $\varepsilon$, $F$, $\dot m$) and back out the implied $c^*$ and $C_f$, and judge in two minutes whether the set is self-consistent.
- [ ] (L2, M32) I can compute the closure condition $k(e^{\Delta v/c}-1)<1$ for a stated inert-mass model and declare a propulsion class infeasible before sizing anything.
- [ ] (L2, M32) I can size cold-gas, monopropellant, bipropellant and solid solutions to the same Δv on the same spacecraft, including inert mass, and say which wins and by how much.
- [ ] (L2, M32) I can compute a demonstrated reliability from a flight record as a binomial point estimate with a Clopper–Pearson lower bound, and say what that number does not cover.
- [ ] (L3, M03) Given a hot-fire result 4 % below prediction, I can lay out the diagnostic tree — which measurements separate a chamber problem from a nozzle problem from an instrumentation problem — and the order I would take them in.
- [ ] (L3, M32) Given an unfamiliar mission, I can derive the propulsion class from the requirement set alone, name the single load-bearing requirement, and argue the losing option's case convincingly.
- [ ] (L3, M32) I can locate the crossover points — where cold gas loses to monopropellant, where a solid kick motor loses to a storable bipropellant stage — and show how each moves with the inert-mass assumptions.

### Ignition and start transients

- [ ] (L1, M08) I can name the six igniter families — pyrotechnic, hypergolic slug, torch, spark/augmented-spark, catalytic, and the research options — and name two engines for each of the first three.
- [ ] (L1, M08) I can state what a fuel lead is, why hydrogen engines use one, and what a hard start and a hangfire are.
- [ ] (L2, M08) I can compute accumulated unburned mass from a start-transient flow rate and an ignition delay, and turn it into a constant-volume peak pressure corrected for venting through the throat.
- [ ] (L2, M08) I can invert that chain into a maximum permissible ignition delay for a stated overpressure limit, and name the weakest assumption in it.
- [ ] (L2, M08) I can explain minimum ignition energy, why it is a property of a mixture rather than of a propellant, and why MIE rising roughly as $p^{-2}$ makes vacuum ignition hard.
- [ ] (L2, M08) I can lay out a complete pump-fed start sequence — inert purge, chilldown, igniter-on, ignition detect, lead valve, main valves, thrust ramp — and justify the ordering of every step.
- [ ] (L2, M08) I can size a torch or augmented-spark igniter's flow and throat area for a given main engine and state the two independent criteria the sizing must satisfy.
- [ ] (L2, M08) I can estimate the propellant a restart consumes in settling and chilldown and express it as a fraction of the burn it enables.
- [ ] (L2, M13) I can state the typical engine start duration range from memory (0.5–5 s; pressure-fed under 0.2 s; RS-25 ≈4.4 s).
- [ ] (L2, M08) I can explain the physical origin of the TEA-TEB green flash — BO₂ emission from the triethylborane — and state that the slug contributes nothing measurable to impulse.
- [ ] (L3, M08) Given a described start transient — chamber pressure trace, igniter pressure, valve positions — I can classify it as nominal, hard, hangfire or failure-to-detect, and say what evidence separates them.
- [ ] (L3, M08) I can select an igniter architecture for an unfamiliar engine and defend it against three alternatives on restart count, ground operations, mass, parasitic flow and heritage.
- [ ] (L3, M08) I can explain why a restart count is a hardware limit before it is a software feature, and name what limited the J-2's (a helium start bottle) and Merlin Vacuum's (a TEA-TEB tank).
- [ ] (L3, M08) I can argue both sides of pyrophoric slug ignition on a reusable vehicle, and note that Raptor 2 onward eliminated the main-chamber igniter entirely by lighting from hot preburner gas.

---

## Propellants

- [ ] (L1, M05) I can name the storage state, approximate density and toxicity class of LOX, LH₂, CH₄, RP-1, N₂O₄/MON and MMH from memory.
- [ ] (L1, M05) I can say what hypergolic means, why it matters, and name two engines for each of the four main propellant pairs.
- [ ] (L1, M05) I can explain in plain language why hydrogen gives high $I_{sp}$ and poor density impulse.
- [ ] (L2, M05) I can compute $c^*$, vacuum $I_{sp}$, bulk density $\rho_b$ and density impulse $I_d$ for any pair given chamber conditions and component densities, and rank pairs on both a mass and a volume basis.
- [ ] (L2, M05) I can state from memory the storage temperature, freezing point, vapour pressure and toxicity class of the twelve propellants in current or recent flight use, to engineering accuracy.
- [ ] (L2, M05) I can read a NIST or REFPROP saturation table and pull exactly the numbers a feed system needs: tank density, pump-inlet vapour pressure, latent heat and $c_p$.
- [ ] (L2, M05) I can estimate a coolant-side wall temperature in a hydrocarbon channel and decide whether the design violates the coking limit.
- [ ] (L2, M05) I can quote the coking-limited $T_{wc}$ band for RP-1 from memory (≈560–590 K for long life, up to ~700 K for short life) and the corresponding methane cracking limit (≈900–950 K).
- [ ] (L2, M05) I can estimate cryogenic boil-off from a stated heat leak and size the ullage and vent consequences, and explain why LH₂ loses a far larger *fraction* than LOX in the same tank.
- [ ] (L2, M05) I can state the compatibility and cleanliness rules for LOX, hydrazine and HTP systems from memory, and name the physics or the accident behind each.
- [ ] (L2, M05) I can explain what RP-1 is defined by — limits on olefins, aromatics and sulphur — and why RP-2 tightens sulphur by roughly an order of magnitude.
- [ ] (L2, M05) I can state the real reasons methane is displacing kerosene (coking, cryogenic commonality, autogenous pressurisation, reuse) rather than the ≈5 s of $I_{sp}$ it is worth.
- [ ] (L3, M05) Given an unfamiliar mission, I can select a propellant pair, name the single constraint that decides it, and argue the runner-up's case honestly.
- [ ] (L3, M05) I can explain in cycle terms why LH₂ makes closed expander cycles possible, why kerosene pushed the Soviets into oxidiser-rich staged combustion, and why methane sits between the two.
- [ ] (L3, M05) I can explain why the RL10 cannot simply be scaled to 500 kN, using the expander heat-balance argument rather than an assertion.
- [ ] (L3, M05) I can say, for any propellant in the course's property table, what would go wrong first if its temperature were 30 K off.
- [ ] (L3, M05) I can argue why MMH/MON is not obsolete — Orion, essentially every GEO satellite, most planetary spacecraft — and identify the threat to hydrazines as regulatory rather than technical.
- [ ] (L3, M05) I can explain why a propellant cannot be substituted late in a programme, and list the six downstream items (tank volume, structure, materials, cleanliness spec, GSE, licensing) that make it a new vehicle.

---

## Injectors

- [ ] (L1, M07) I can name and sketch the showerhead, like doublet, unlike doublet, triplet, shear coaxial, swirl coaxial and pintle elements, and name a real engine for each.
- [ ] (L1, M07) I can state the seven jobs an injector performs and say which one is binding for a stated engine.
- [ ] (L1, M07) I can state the 15–25 % $\Delta p/p_c$ rule and the 50–300 μm SMD range from memory.
- [ ] (L2, M07) I can size an injector orifice from $\dot m$, $\Delta p$, $\rho$ and $C_d$, and state the uncertainty in the result.
- [ ] (L2, M07) I can state the typical $C_d$ ranges from memory: 0.75–0.85 for a sharp-edged orifice at $L/D \ge 3$, 0.61 flipped or thin-plate, up to 0.95 well-rounded, 0.20–0.45 for a swirl element.
- [ ] (L2, M07) I can predict how $C_d$ varies with orifice $L/D$, inlet geometry and cavitation number, and recognise hydraulic flip on a flow-bench $\dot m$-versus-$\sqrt{\Delta p}$ plot.
- [ ] (L2, M07) I can explain why a fully cavitating orifice is hydraulically choked and therefore the strongest possible chug fix, and why *partial* or *unsteady* cavitation is a fault.
- [ ] (L2, M07) I can derive the manifold-to-orifice area-ratio rule rather than quoting it, and state the typical value (4–6, with ≈2.4 giving roughly 5 % distribution error).
- [ ] (L2, M07) I can derive the linear chug criterion relating $\Delta p_{inj}/p_c$, chamber residence time and combustion time lag, and show why the answer lands at 15–25 %.
- [ ] (L2, M07) I can compute Weber, Reynolds and Ohnesorge numbers for an injected jet, place it on the Ohnesorge breakup map and name the regime.
- [ ] (L2, M07) I can estimate an SMD from a stated correlation, convert it to a droplet lifetime with the $d^2$ law, and check that lifetime against the chamber stay time and $L^*$.
- [ ] (L2, M07) I can apply Rupe's momentum criterion to size the two orifices of an unlike doublet and diagnose an imbalance from a cold-flow mass-distribution map.
- [ ] (L2, M07) I can quote typical injection velocities from memory: 20–60 m/s liquid, 200–400 m/s for a gas annulus, coaxial velocity ratio 10–20, momentum flux ratio $J$ 1–10.
- [ ] (L2, M07) I can state the typical combustion time lag range (0.2–2 ms; ~0.2 ms hydrogen, ~2 ms cold viscous hydrocarbons) and say what it implies for the chug criterion.
- [ ] (L2, M07) I can explain why every flown injector is deliberately stratified fuel-rich at the outer row, and why perfect uniformity would give the best $\eta_{c^*}$ and destroy the chamber.
- [ ] (L2, M07) I can describe the RS-25 main injector — 600 coaxial shear elements, ASI at the face centre, acoustic-resonator cavities in the face — and say what each feature is for.
- [ ] (L2, M07) I can describe the F-1 injector — a flat face with a mixed doublet/triplet "5U(f)" pattern and a copper baffle assembly dividing it into 13 compartments — and say why the baffles are there.
- [ ] (L3, M07) Given an unfamiliar engine's propellants, $p_c$, thrust, throttle range, cycle and mission, I can propose an element type and defend it against the two strongest alternatives on mixing, stability, throttling, wall compatibility and manufacturability.
- [ ] (L3, M07) Given a described failure — a wall streak, a $c^*$ step, a 300 Hz oscillation, a cracked LOX post — I can name the mechanism, the distinguishing evidence, the fix, and a programme that hit the same thing.
- [ ] (L3, M07) Given a throttling requirement, I can compute where the chug margin disappears and argue for a specific mitigation.
- [ ] (L3, M07) I can argue honestly what the pintle gives up — mixing fineness, a point or two of $\eta_{c^*}$, a hot loaded part on the axis — against what it buys, and place Merlin and the LM descent engine correctly in that argument.
- [ ] (L3, M07) I can explain why unit-to-unit flow calibration on every circuit is a standard deliverable, and what a 4 % oxidiser-area difference between units does.

---

## Chambers

- [ ] (L1, M06) I can state the chamber's three physical jobs — atomise, vaporise and mix; react to near equilibrium; deliver the gas to the throat — and give the characteristic time of each.
- [ ] (L1, M06) I can define $L^*$ and contraction ratio in words, and explain why $L^*$ is a volume normalised by throat area and not a length in the chamber.
- [ ] (L1, M06) I can name two engines at opposite ends of the chamber-pressure range — the V-2 at 15.2 bar, the RS-25 at 206.4 bar at 109 % — and say why each sits there.
- [ ] (L2, M06) I can derive the relation between $L^*$, chamber volume and mean gas residence time, and compute residence time in milliseconds for a given engine.
- [ ] (L2, M06) I can state from memory the typical ranges: $L^*$ 0.8–1.2 m (0.5–1.8 m overall), residence time 1.0–1.5 ms, $\varepsilon_c$ 1.6–2.5 for large engines (up to 4–6 for small storables).
- [ ] (L2, M06) I can size a complete chamber — $A_t$, $V_c$, $D_c$, $L_{cyl}$, total length, mass flux $G$ — from $F$, $p_c$, $\varepsilon$, $\gamma$, $T_c$ and $\mathcal{M}$.
- [ ] (L2, M06) I can compute residence time two independent ways and get the same answer, and show that it is independent of chamber pressure.
- [ ] (L2, M06) I can compute the barrel Mach number from $\varepsilon_c$ and the Rayleigh stagnation loss that follows, then state the resulting injector-end pressure.
- [ ] (L2, M06) I can state the typical chamber mass flux range (1500–4000 kg/(m²·s), up to ~7000) and note that it rises linearly with $p_c$.
- [ ] (L2, M06) I can estimate a droplet vaporisation time from the $d^2$-law, compare it to residence time, and decide whether a chamber is long enough — stating where the $d^2$-law fails.
- [ ] (L2, M06) I can compute $\eta_{c^*}$ from hot-fire data including the station correction, and separate a vaporisation-limited from a mixing-limited from a film-cooling-accounting deficit.
- [ ] (L2, M06) I can state why the hot-gas wall of a regeneratively cooled chamber is 0.6–1.0 mm thick and why thinner is *better*, given that the pressure load is carried by the closeout or jacket.
- [ ] (L2, M06) I can quantify the diminishing return on chamber pressure — roughly 8 % on ideal sea-level $I_{sp}$ from 70 to 206 bar, about 2 % more from 206 to 300 — against a heat flux that rises as $p_c^{0.8}$ throughout.
- [ ] (L2, M06) I can state the typical first tangential frequency range (2–6 kHz, up to 15 kHz on small thrusters) and note that it scales as $1/D_c$.
- [ ] (L3, M06) Given an unfamiliar engine's published parameters, I can reason to whether its chamber is vaporisation- or mixing-limited and name the test that would settle it.
- [ ] (L3, M06) Given a described $\eta_{c^*}$ trend, coolant $\Delta T$ trend or dynamic-pressure spectrum, I can say which failure mode is developing.
- [ ] (L3, M06) I can explain why the BE-4 stopped at ≈140 bar rather than chasing RD-180-class pressure, and frame it as a life-and-reusability choice rather than a limitation.
- [ ] (L3, M06) I can name the historical programme behind each chamber problem — F-1 for stability at scale, RL10 for the expander ceiling, BE-4 for pressure versus life — and say whether I would have done the same.

---

## Nozzles

- [ ] (L1, M09) I can explain in plain language why a nozzle has a converging and a diverging section and why a first-stage nozzle is smaller than an upper-stage one.
- [ ] (L1, M09) I can sketch thrust versus altitude for two area ratios on the same engine and identify the crossover.
- [ ] (L1, M09) I can name a conical, a bell, an aerospike and an extendable nozzle and name a real flown engine using each of the first, second and fourth.
- [ ] (L2, M09) I can apply the standard throat radius-of-curvature rules from memory ($R_u = 1.5\,r_t$ upstream, $R_d \approx 0.382\,r_t$ downstream) and say what each is protecting.
- [ ] (L2, M09) I can choose a contraction ratio and convergence half-angle (20–45°, typically 25–35°) and say what goes wrong at each end of the band.
- [ ] (L2, M09) I can derive the conical divergence efficiency $\lambda = (1+\cos\alpha)/2$, and state that a 15° cone loses about 1.7 %.
- [ ] (L2, M09) I can compute the length and wetted area of a conical nozzle of a given $\varepsilon$, and the length of an 80 % bell — stating that the 80 % is measured against a 15° cone of the same $\varepsilon$ and $r_t$.
- [ ] (L2, M09) I can construct a Rao parabolic contour from $\theta_n$, $\theta_e$ and a percentage bell length, and say what Rao actually solved.
- [ ] (L2, M09) I can build a nozzle efficiency budget — divergence, friction, kinetics, and two-phase for solids — and say which term dominates for a given engine class, with $\eta_n$ typically 0.96–0.98.
- [ ] (L2, M09) I can explain why exit pressure does not depend on ambient pressure for attached flow, and name separation as the only mechanism by which ambient pressure reaches inside the nozzle.
- [ ] (L2, M09) I can read a $C_f$ reduction and say whether the nozzle or the chamber is underperforming.
- [ ] (L2, M09) I can explain the difference between geometric, effective (sonic) and assumed throat area, and why "expansion ratio" is therefore not a single well-defined number.
- [ ] (L2, M09) I can match a construction method — tube wall, milled channel, radiatively cooled refractory metal, carbon–carbon, ablative, dump/film-cooled — to a heat flux, burn time, production rate and cost target, and name a flown engine for each.
- [ ] (L2, M09) I can state that the RS-27 → RS-27A change gave up sea-level thrust (971 → 890 kN) to raise $\varepsilon$ from 8:1 to 12:1, and explain why that was deliberate.
- [ ] (L2, M09) I can describe the RL10B-2's carbon–carbon extension — a 3D C–C skirt, over 2 m exit diameter, translated into place after separation, worth roughly 30 s of $I_{sp}$ — and note that its 285:1 deployed area ratio is contested against a 77:1 retracted figure.
- [ ] (L3, M09) Given an unfamiliar engine and its stage, I can defend an expansion ratio from the trajectory, the separation limit and the vehicle base area, and say which of the three is binding.
- [ ] (L3, M09) I can explain FSS versus RSS from the internal shock structure, predict which contour class is at risk, and put an order-of-magnitude number on the side load with a stated model.
- [ ] (L3, M09) I can explain why separation-line wander alone (of order kN on an RS-25-class nozzle) is two orders of magnitude short of the measured side loads, and attribute the loads to the FSS↔RSS topology transition.
- [ ] (L3, M09) Given a described data set — wall pressures, strain gauges, a $p_c$ trace, a post-test borescope — I can distinguish separation from a coolant failure from injector streaking.
- [ ] (L3, M09) I can explain why the RS-25's expansion ratio is disputed (69:1 versus 77.5:1 versus 78:1), what measurement would settle it, and why no performance data can.
- [ ] (L3, M09) I can argue why aerospikes have not flown — the cooled-area-per-unit-thrust problem — without either dismissing them or being credulous, and name J-2T and XRS-2200/X-33 as the programmes that built and fired them.
- [ ] (L3, M09) I can explain why Vulcain 2.1's nozzle redesign (90 % fewer parts, 40 % lower cost, 30 % faster to produce, by laser-welded sandwich construction) is the best-documented manufacturing-driven nozzle change in Europe, and that it cost a little thrust.

---

## Heat transfer and cooling

- [ ] (L1, M10) I can rank the three heat-transfer modes in a thrust chamber and say that radiation is 5–25 % for sooty hydrocarbons and under 1 % at a hydrolox throat.
- [ ] (L1, M10) I can say why the throat is the hottest wall in one sentence — thinnest boundary layer and highest mass flux — and note that the gas there is 300–400 K *cooler* than in the chamber.
- [ ] (L1, M10) I can explain why copper liners exist (conductivity, not melting point) and state that copper melts at 1358 K, below Inconel 718.
- [ ] (L1, M11) I can name the seven cooling methods used in flight hardware and identify from a cutaway whether a chamber is tube-wall, milled-channel or ablative.
- [ ] (L2, M10) I can derive the adiabatic wall temperature from the recovery factor and explain why the driving potential is $T_{aw}-T_{wg}$, not $T_c-T_{wg}$.
- [ ] (L2, M10) I can show that at $\varepsilon = 16$ the free stream sits near $0.44\,T_0$ while $T_{aw}$ is still about $0.94\,T_0$, and explain why nozzle extensions survive anyway.
- [ ] (L2, M10) I can derive the Bartz correlation from the Colburn/Dittus–Boelter pipe-flow analogy, including where the leading 0.026 comes from.
- [ ] (L2, M10) I can evaluate the Bartz property-correction factor $\sigma$ from a reference-temperature argument.
- [ ] (L2, M10) I can compute $h_g$ and $q''$ at the chamber, throat and a supersonic station, and state the accuracy (±20–30 % at a clean throat) and its sign.
- [ ] (L2, M10) I can state four regimes in which Bartz is known to be wrong and which way it errs in each, and note it can be off by a factor of 2–5 wherever film cooling or a deposit exists.
- [ ] (L2, M10) I can solve the steady 1-D resistance chain gas → wall → coolant, identify which resistance dominates, and compute $T_{wg}$, $\Delta T_w$ and $T_{wc}$.
- [ ] (L2, M10) I can derive the constrained-wall thermal stress $\sigma_{th} = E\alpha\Delta T/[2(1-\nu)]$, compare it to hot yield, and explain the low-cycle-fatigue "dog-house" failure.
- [ ] (L2, M10) I can compute the survival time of an uncooled heat-sink chamber from the semi-infinite-solid solution and then check that assumption.
- [ ] (L2, M10) I can state the transient timescales from memory: a 1 mm copper liner reaches steady state in ~11 ms, a nickel alloy in ~140 ms, a 10 mm heat-sink wall in over a second.
- [ ] (L2, M10) I can estimate gas radiation from a Hottel-type emissivity and decide whether it matters for a stated propellant combination.
- [ ] (L2, M11) I can size a cooling channel — count, width, height, aspect ratio, land width, hot-wall thickness — and compute the fin efficiency and effective coolant-side coefficient that follow.
- [ ] (L2, M11) I can compute coolant-side heat transfer with Dittus–Boelter and Sieder–Tate, apply the curvature enhancement, and state where each correlation fails.
- [ ] (L2, M11) I can compute channel pressure drop with Darcy–Weisbach plus curvature and manifold losses, and convert it into required pump discharge pressure and shaft power.
- [ ] (L2, M11) I can state from memory the typical ranges: throat $q''$ 20–80 MW/m² (RS-25 at 109 % ≈160), $T_{wg}$ 700–850 K for a copper liner, $\Delta T_w$ 60–200 K, hot-wall 0.6–1.0 mm, channel count 100–400, jacket $\Delta p_j$ 20–60 bar.
- [ ] (L2, M11) I can state coolant velocity ranges by fluid from memory: RP-1 15–60 m/s, CH₄ 60–180 m/s, LH₂ 100–300 m/s, and explain why they differ.
- [ ] (L2, M11) I can estimate a film-cooling flow fraction from a wall heat load and convert it into an $I_{sp}$ penalty, quoting the typical 1–4 % of flow costing 0.3–1.5 % of $I_{sp}$.
- [ ] (L2, M11) I can compute the enthalpy pickup in an expander cooling jacket and show why it must be roughly an order of magnitude larger than the turbine shaft power it produces.
- [ ] (L2, M11) I can explain why improving the coolant side *increases* heat flux while lowering wall temperature, and why "cooling harder" costs pump work and buys wall life.
- [ ] (L2, M11) I can explain heat-transfer deterioration near the pseudo-critical temperature — methane's density falling ~3× and $c_p$ doubling over 30 K — and why a supercritical jacket is not property-smooth.
- [ ] (L3, M10) Given a photograph, a cycle diagram and two numbers, I can estimate an unfamiliar engine's throat heat flux to within a factor of two and argue what its cooling scheme must be.
- [ ] (L3, M10) Given a hot-fire anomaly I can distinguish injector streaking from channel voiding from a low-cycle-fatigue liner from coolant-side fouling, and name the measurement that settles it.
- [ ] (L3, M11) Given an unfamiliar engine — propellants, $p_c$, thrust, duty cycle, era, manufacturing base — I can propose a cooling architecture and defend it against the two obvious alternatives.
- [ ] (L3, M11) I can explain why the same engine would be cooled differently in 1965, 1985 and 2025, attributing each difference to coolant chemistry, alloy availability or manufacturing process.
- [ ] (L3, M11) I can diagnose a described hot streak from its axial origin, and read a jacket $\Delta p$ trend across a test history as a health monitor.
- [ ] (L3, M11) I can argue the methane-versus-kerosene cooling case with numbers, and describe the F-1's design point — soot as a thermal barrier plus gas-generator exhaust dumped into the nozzle extension as a film curtain — as a deliberate architecture rather than a patch.
- [ ] (L3, M11) I can argue why ablatives are not obsolete, citing the RS-68's ablative nozzle flying until 2024 and essentially every pressure-fed storable spacecraft engine.

---

## Turbomachinery and feed systems

- [ ] (L1, M12) I can name the parts of a turbopump — inducer, impeller, volute or diffuser, turbine, bearings, seals — and say what each does.
- [ ] (L1, M12) I can explain in plain language why a pressure-fed engine has a low chamber pressure and a pump-fed one does not, and name two of each with their approximate pressures.
- [ ] (L1, M12) I can say what cavitation is, why it matters, and sketch which way head, flow and power move when shaft speed rises.
- [ ] (L2, M12) I can build a complete tank-to-injector pressure budget — $p_c$, injector drop, jacket drop, line friction, minor losses, acceleration head — and state which term dominates.
- [ ] (L2, M12) I can derive the mass of a pressurised tank as a function of pressure and volume and use it to explain why pressure-fed $p_c$ saturates near 2–3 MPa.
- [ ] (L2, M12) I can size a stored-gas pressurant system including the real-gas correction and the ullage collapse factor, quoting typical collapse factors (1.3–1.6 for storables, 2–4 for hydrogen).
- [ ] (L2, M12) I can compute the pressure and thrust decay of a blowdown system for a given blowdown ratio and convert it into an $I_{sp}$ and total-impulse penalty.
- [ ] (L2, M12) I can derive the Euler turbomachine equation and relate tip speed, blade backsweep, slip and delivered head.
- [ ] (L2, M12) I can compute pump head, flow, shaft power and efficiency for a real engine's propellant flows, and state typical pump efficiency (0.65–0.85) and turbine efficiency (0.55–0.80).
- [ ] (L2, M12) I can compute specific speed, use it to select impeller type, and decide whether a circuit needs staging.
- [ ] (L2, M12) I can compute NPSH available from a tank state and NPSH required from suction specific speed, and decide whether the design closes.
- [ ] (L2, M12) I can explain why a tank at 5 bar of saturated LOX has less usable NPSH than one at 2.5 bar subcooled by 5 K, and why self-pressurised tanks are the trap.
- [ ] (L2, M12) I can apply the affinity laws to scale a pump between thrust levels and state explicitly what does *not* scale — the suction requirement.
- [ ] (L2, M12) I can show that shaft speed scales roughly as $F^{-1/2}$ at constant chamber pressure, and cite RD-0146's fuel pump above 120,000 rpm as the published extreme.
- [ ] (L2, M12) I can size turbine flow from a stated inlet temperature and pressure ratio and convert it into an engine-level $I_{sp}$ penalty in seconds.
- [ ] (L2, M12) I can state the turbopump shaft-power range from memory (0.4 MW for the V-2 to ~170–190 MW for the RD-170, a figure contested between 170 and 192 MW in a single source).
- [ ] (L2, M12) I can describe the RS-25's four-pump architecture and quote the HPFTP at ~35,360 rpm and ~53 MW, and the HPOTP at ~28,120 rpm and ~17 MW.
- [ ] (L2, M12) I can read a pump $H$–$Q$ curve or a suction-performance knee and say what is wrong.
- [ ] (L3, M12) I can explain why an inducer is *designed to cavitate*, and why its own failure modes — rotating cavitation, auto-oscillation — are what broke the LE-7.
- [ ] (L3, M12) Given an unfamiliar engine's propellants, thrust, $p_c$ and mission, I can propose a feed architecture — pressure-fed or pumped, single- or dual-shaft, geared or not, inducer or boost pump — and defend every branch with a number.
- [ ] (L3, M12) Given a described failure — a discharge-pressure collapse, a non-synchronous vibration line, a rising bearing temperature, a purge-cavity pressure rise — I can name the two most likely mechanisms and the measurement that distinguishes them.
- [ ] (L3, M12) I can argue both sides of the RS-25 dual-shaft versus RD-0120 single-shaft question, the RL10 gearbox, and the pressure-fed Aestus decision, and say what would change my mind.
- [ ] (L3, M12) I can explain why "a pump raises head, not pressure" is the sentence from which every architectural difference between hydrogen and hydrocarbon turbopumps descends.
- [ ] (L3, M12) I can explain why a pressure-fed booster stage cannot reach orbit — the tank and pressurant mass — and therefore why "pressure feeding is more reliable" is only true at small total impulse.

---

## Engine cycles

- [ ] (L1, M13) I can name the nine cycles, draw a block diagram of each showing where the turbine gets its gas and where the exhaust goes, and name two flown engines for each.
- [ ] (L1, M13) I can state which cycles carry an $I_{sp}$ penalty and roughly how large, and explain in plain language why closed cycles reach higher chamber pressure.
- [ ] (L2, M13) I can write the turbomachinery power balance from memory with correct units and state its assumptions.
- [ ] (L2, M13) I can use that balance to show quantitatively why open cycles cap near 100–120 bar while closed cycles reach 200–330 bar.
- [ ] (L2, M13) I can compute the gas-generator flow fraction for a stated engine from pump power, turbine inlet temperature and pressure ratio, and convert it into seconds of $I_{sp}$.
- [ ] (L2, M13) I can state typical GG flow fractions (2–5 % of total) and the resulting $I_{sp}$ penalty (3–8 s), and explain why 2.75 % of flow costs only about 1.8 % of $I_{sp}$.
- [ ] (L2, M13) I can perform an expander-cycle feasibility check including the jacket-$\Delta p$ feedback into pump discharge, and say what $p_c$ and thrust the cycle supports.
- [ ] (L2, M13) I can quote turbine inlet temperatures by cycle from memory: GG 900–1200 K, FRSC 700–1100 K, ORSC 600–800 K, closed expander 150–250 K.
- [ ] (L2, M13) I can quote turbine pressure ratios by cycle from memory: 15–40 open, 1.3–1.8 closed (RS-25 ≈1.4).
- [ ] (L2, M13) I can correctly distinguish the three architectures the literature indiscriminately calls "expander" — closed expander, expander bleed, and tap-off — and give a flown example of each.
- [ ] (L2, M13) I can state that the BE-3PM (tap-off) and BE-3U (expander bleed) share a name and not a power cycle, and that this is a documented trap.
- [ ] (L2, M13) I can size the battery mass for an electric-pump-fed stage and derive the battery-mass-to-propellant-mass ratio in closed form, using a usable specific energy of 100–130 Wh/kg against a 180–250 Wh/kg cell rating.
- [ ] (L2, M13) I can read a published engine datasheet and infer which cycle it must be, with reasons.
- [ ] (L3, M13) I can explain precisely why kerolox forces oxidiser-rich staged combustion — at MR 2.6 oxygen is ~72 % of the flow, and a fuel-rich kerosene preburner would coke a closed circuit shut — and why methane changes the answer.
- [ ] (L3, M13) I can state that full-flow staged combustion's real advantages are lower turbine temperature at a given power and no interpropellant seal, both reuse arguments, rather than $I_{sp}$.
- [ ] (L3, M13) I can construct and defend a cycle trade study for a stated vehicle requirement with throttle, restart, reuse and cost as first-class criteria.
- [ ] (L3, M13) Given a described failure — a turbine overspeed, a rising jacket $\Delta p$, an oxidiser-rich excursion — I can name the mechanism, the confirming measurement, and the fix.
- [ ] (L3, M13) I can state honestly which published numbers are company claims (every Raptor figure), which chamber pressures are quoted at which station, and which thrust-to-weight figures used which mass.
- [ ] (L3, M13) I can settle the "highest-thrust engine" question correctly: the RD-170 at 7,900 kN vacuum across four chambers, the F-1 at 7,770 kN vacuum as the highest single-chamber engine ever flown.
- [ ] (L3, M13) I can explain why the LE-9 at 1,471 kN proves the expander-bleed variant has no practical thrust ceiling while the closed expander is capped near Vinci's 180 kN.

---

## Valves and plumbing

- [ ] (L1, M14) I can name the five main valve types — ball, butterfly, poppet, visor, gate — and say what each is good at.
- [ ] (L1, M14) I can explain what $C_v$ means in plain language and why cryogenic valves cavitate more readily than water valves.
- [ ] (L1, M14) I can say what water hammer is, why slower closure helps, and why a cryogenic line needs a bellows.
- [ ] (L1, M14) I can describe the valve architecture of two engines — the RS-25's five hydraulically actuated ball valves, and Merlin's pneumatic valves with RP-1-actuated TVC.
- [ ] (L2, M14) I can derive $C_v$ and $K_v$ from incompressible orifice flow, convert between them and to an SI $C_dA$, and size a main propellant valve to a stated budget (0.1–1 % of $p_c$).
- [ ] (L2, M14) I can compute a cavitation index at a stated operating point and say whether the valve will cavitate, flash or run solid — and why the answer differs for a throttling and a shutoff valve.
- [ ] (L2, M14) I can derive the Joukowsky surge $\Delta p = \rho a \Delta v$ from a control volume moving with the wave, and compute pipe wave speed including wall elasticity.
- [ ] (L2, M14) I can distinguish rapid from slow closure using the pipe period $2L/a$ and show that closing faster than the pipe period buys nothing.
- [ ] (L2, M14) I can state that the impedance $\rho a$ for LOX in steel is about $9.3\times10^5$ Pa per (m/s), so a 15 m/s line generates roughly 140 bar on an instantaneous stop.
- [ ] (L2, M14) I can size a valve closing schedule so the surge stays inside proof pressure, and explain the interaction with column separation and cavitation in a cryogenic line.
- [ ] (L2, M14) I can compute free contraction, restraint stress, restraint force and Euler buckling load for a cryogenic line, and say which governs.
- [ ] (L2, M14) I can size a relief valve or burst disk for a failed-open regulator using choked flow, and stack set point, reseat and accumulation correctly.
- [ ] (L2, M14) I can apply the manifold-to-orifice area rule quantitatively and estimate the maldistribution a given manifold area produces.
- [ ] (L2, M14) I can state the compatibility rules that actually get enforced — LOX cleanliness and impact sensitivity, titanium excluded from oxygen service, hydrogen embrittlement, elastomers with MMH and with cryogens — and name the accident or physics behind each.
- [ ] (L2, M14) I can read a valve or seal specification and identify what it fails to specify — usually the temperature, the leakage test gas, or the definition of response time.
- [ ] (L3, M14) I can diagnose a bad instrumentation port from the data it produces: a lagged pressure trace, a thermocouple reading the wall, a recessed Kulite ringing at its Helmholtz frequency.
- [ ] (L3, M14) Given a described anomaly — a bowed feed line, a bellows that failed in three minutes, a leak rate doubling every test, a 340 Hz tone on every channel sharing a manifold, a hard start — I can name candidate mechanisms and the measurement that separates them.
- [ ] (L3, M14) I can explain why bellows flow liners exist, and why flow-induced vibration destroys bellows that passed gimbal-cycle qualification with margin.
- [ ] (L3, M14) I can argue both sides of pneumatic versus hydraulic versus electromechanical actuation, relief valve versus series-redundant regulators, and check valve versus burst disk, and name which programme made each choice.
- [ ] (L3, M14) I can reconstruct the reason for a start or shutdown sequence — lead direction, ramp rates, valve overlap — from the combustion and thermal constraints it protects against.

---

## Combustion instability

- [ ] (L1, M15) I can explain in plain language why heat release in phase with pressure drives an oscillation.
- [ ] (L1, M15) I can name the three frequency bands — chug 50–500 Hz, buzz, screech 1–10 kHz — and one fix for each.
- [ ] (L1, M15) I can state that $f_{1T} \propto c/D_c$ and that bigger chambers have lower modes, making instability a big-engine problem.
- [ ] (L1, M15) I can describe two engines' stability solutions in a sentence each — the F-1's 13-compartment copper baffles and the RS-25's injector-face acoustic cavities.
- [ ] (L2, M15) I can classify an observed oscillation from its frequency, amplitude and which transducers see it, and name the coupling mechanism for that band.
- [ ] (L2, M15) I can derive the lumped-parameter chug model from chamber mass conservation, orifice hydraulics and a combustion time lag, and obtain the chamber fill time $\tau_c = L^*/(\Gamma^2 c^*)$.
- [ ] (L2, M15) I can evaluate the chug neutral-stability condition on $\Delta p_{inj}/p_c$ for a given $\tau$ and say whether a marginal case meets a stated damping-rate requirement.
- [ ] (L2, M15) I can state and derive the Rayleigh criterion from the linearised acoustic energy equation and use the $p'$–$q'$ phase to argue whether a mechanism drives or damps a mode.
- [ ] (L2, M15) I can compute the 1L, 1T, 2T and 1R frequencies of a cylindrical chamber from the Bessel-root table and $c = \sqrt{\gamma R T_c}$, and say which transducer or accelerometer sees each.
- [ ] (L2, M15) I can explain the Crocco–Cheng sensitive time-lag model, compute a neutral interaction index $n$, read a stability map, and say where the response function peaks.
- [ ] (L2, M15) I can size a quarter-wave cavity or Helmholtz resonator for a target mode, including the effect of the uncertain cavity gas temperature.
- [ ] (L2, M15) I can choose a baffle compartment count that moves the lowest transverse mode above a target frequency, and state what the baffle costs.
- [ ] (L2, M15) I can specify a stability-rating programme — bomb, pulse gun, directed gas flow — and apply a damping-rate criterion to a dynamic-pressure trace.
- [ ] (L2, M15) I can quote typical ranges from memory for $\tau$, $n$, $\Delta p/p_c$, amplitude thresholds and damping rates.
- [ ] (L2, M15) I can explain why baffles mostly do not absorb — they change the boundary conditions so the dangerous low-order transverse modes cannot exist where they would be driven.
- [ ] (L3, M15) Given a hot-fire dynamic-pressure PSD and a two-transducer phase plot, I can identify the mode, say whether it is standing or spinning, and say whether the engine met its dynamic-stability requirement.
- [ ] (L3, M15) Given an unfamiliar chamber geometry, propellant and a described anomaly, I can produce a ranked hypothesis list with the frequency estimates that justify the ranking and the discriminating measurement.
- [ ] (L3, M15) I can argue both sides of baffles versus acoustic cavities for a specific engine and say what decides it.
- [ ] (L3, M15) I can explain why the F-1's problem was a coincidence of two frequencies rather than a design error, and why the Soviet multi-chamber architecture attacks the same problem geometrically.
- [ ] (L3, M15) I can explain why swirl-coaxial and pintle injectors are comparatively stable and large like-on-like doublets are not, in terms of where the heat release sits and how fast it responds.
- [ ] (L3, M15) I can state honestly what modern CFD/LES can and cannot predict about instability, and defend why the bomb test survives as the certification basis.
- [ ] (L3, M15) I can explain why "the engine ran 500 seconds without incident" is not a stability claim, and why dynamic stability is rated rather than observed.

---

## Materials

- [ ] (L1, M16) I can name the load and environment set on a chamber liner, a turbine blade and a nozzle extension, and say which one sizes which part.
- [ ] (L1, M16) I can state which alloy family goes with each of: chamber liner, jacket, pump housing, turbine blade, radiation-cooled extension, cryogenic line, propellant tank.
- [ ] (L1, M16) I can name two engines with a copper-alloy liner (RS-25's NARloy-Z, F-1's brazed Inconel X-750 tube wall as the contrast) and two with a radiation-cooled niobium extension (Merlin Vacuum among them).
- [ ] (L2, M16) I can compute $\Delta T_w$ and the constrained thermal stress for a stated flux, thickness and alloy, and say whether the wall is elastic.
- [ ] (L2, M16) I can estimate low-cycle-fatigue life from a strain range with the Manson–Coffin–Basquin relation and apply the standard design factor on cycles.
- [ ] (L2, M16) I can invert a Larson–Miller parameter for an allowable wall temperature and state why the answer is an upper bound rather than a permission — phase stability, oxidation and coating limits usually bind first.
- [ ] (L2, M16) I can select an alloy for a stated component on the correct index: thermal-shock figure of merit for a liner, specific strength for a housing, hydrogen compatibility for a hydrogen-wetted part, oxygen compatibility for an ORSC part.
- [ ] (L2, M16) I can quote from memory: copper conductivity ~300–390 W/(m·K), austenitic stainless ~16 W/(m·K), Inconel 718 yield ~1,030 MPa with a ~925 K overaging limit, C-103 to ~1,650 K coated, Ir/Re to ~2,470 K.
- [ ] (L2, M16) I can rank hydrogen susceptibility from memory (JBK-75 ≈ A-286 ≫ 718) and state that hydrogen environment embrittlement peaks near 200–300 K and is negligible below ~120 K.
- [ ] (L2, M16) I can compute Lamé stresses in a thick-walled housing and screen candidate alloys against factored allowables.
- [ ] (L2, M16) I can compute a CTE-mismatch stress in a bonded bimetallic wall and get the factor of two right.
- [ ] (L2, M16) I can explain what an A-basis allowable actually is — exceeded by 99 % of the population at 95 % confidence — and why a single low coupon is not a material rejection.
- [ ] (L2, M16) I can state the LOX-compatibility screening logic (mechanical impact, promoted ignition, system design guidance) and why titanium is categorically excluded rather than margin-managed.
- [ ] (L3, M16) I can explain why a liner's life is a strain-controlled problem, and therefore why a stronger alloy buys nothing and conductivity plus ductility buy everything.
- [ ] (L3, M16) Given an unfamiliar engine's cycle, $p_c$, propellants and duty cycle, I can propose a material for every major component, defend each on the correct index, and name the two life-limiting components.
- [ ] (L3, M16) Given a described failure — a leak at flight 12, a turbine blade liberation, a preburner burn-through — I can produce a ranked differential diagnosis with the fractographic or metallographic evidence that separates the candidates.
- [ ] (L3, M16) I can argue both sides of the ORSC materials question: the RD-180's inert enamel coating on every oxygen-wetted surface versus the BE-4's lower-pressure approach at ≈140 bar.
- [ ] (L3, M16) I can state honestly where the public record ends — Raptor's alloys, Rutherford's chamber material, the RS-25 nozzle tube alloy — rather than filling the gap.
- [ ] (L3, M16) I can explain why the printable alloy list is *shorter* than the wrought list, and why GRCop-42 exists partly because GRCop-84 was hard to print.

---

## Manufacturing

- [ ] (L1, M17) I can name the main chamber manufacturing routes — tube wall, milled plus electroform, milled plus brazed jacket, L-PBF, DED — and say which real engine used each.
- [ ] (L1, M17) I can explain in plain language why brazing needs a small clearance, why a printed overhang needs support, and why a single-crystal turbine blade cannot be printed.
- [ ] (L1, M17) I can name two engines built largely by additive manufacturing (Rutherford — chamber, injectors, pumps and main valves printed; SuperDraco's DMLS Inconel chamber, the first printed chamber to fly crewed).
- [ ] (L2, M17) I can work out how many tubes or channels a throat circumference accepts, what section each needs to pass the coolant, and where the geometry forces a bifurcation or a change of cooling method.
- [ ] (L2, M17) I can explain furnace brazing physically — capillary rise, wetting, isothermal solidification — and state why joint clearance rather than filler strength governs quality.
- [ ] (L2, M17) I can describe the electroforming mechanism behind a nickel closeout and name its three failure modes: adhesion, nodules, residual stress.
- [ ] (L2, M17) I can distinguish an electroform (1.5–5 mm, structural, a week to grow) from a plating (5–50 µm, protective).
- [ ] (L2, M17) I can predict the effect of as-built AM roughness on channel friction factor, pressure drop and heat-transfer coefficient with a roughness-corrected friction correlation and a Nusselt–friction analogy, and state the uncertainty.
- [ ] (L2, M17) I can estimate L-PBF build time, part mass and powder inventory from layer thickness, hatch spacing, scan speed, laser count and part volume, and say whether the build is recoat- or exposure-limited.
- [ ] (L2, M17) I can propagate an orifice diameter and $C_d$ tolerance stack into element-level and engine-level mixture-ratio spreads, explain the $\sqrt{N}$ difference, and say which of the two burns a wall.
- [ ] (L2, M17) I can name the characteristic defect of each process — recast layer, forging lap, casting porosity, braze void, solidification crack, lack of fusion, keyhole porosity — and the inspection that finds it.
- [ ] (L2, M17) I can state what HIP does and does not fix: internal gas or vacuum porosity, not surface-connected lack of fusion, residual powder or geometric error.
- [ ] (L3, M17) Given an unfamiliar component, I can propose a manufacturing route, defend it on heat flux, size, rate, joint count and inspectability, name the dominant defect and the acceptance test, and say what changes if production rate is multiplied by fifty.
- [ ] (L3, M17) Given a hot-fire anomaly — a coolant $\Delta p$ 12 % below prediction, a local wall streak, a mixture-ratio shift — I can list the manufacturing defects consistent with it, rank them, and specify the discriminating inspection.
- [ ] (L3, M17) I can argue with numbers both where additive manufacturing changed engine design and where it did not, and separate today's AM capability claims into physics and current machine limits.
- [ ] (L3, M17) I can explain the RD-170's four-chamber layout as a manufacturing and cooling decision, and describe the family logic that produced the two-chamber RD-180 and single-chamber RD-191 from the same chamber part.

---

## Testing and instrumentation

- [ ] (L1, M18) I can distinguish development, qualification and acceptance testing and give an example of each, and name the levels of the component → subsystem → engine → stage pyramid.
- [ ] (L1, M18) I can say what a redline is, name four common ones, and explain why an engine is fired remotely.
- [ ] (L1, M18) I can name the three pressure-transducer principles and say which is used for combustion dynamics.
- [ ] (L2, M18) I can compute a hydrostatic proof pressure from MEOP and a proof factor, and explain why the medium is water rather than nitrogen.
- [ ] (L2, M18) I can reduce a hot-fire dataset ($F$, $p_c$, $\dot m$, $A_t$, $\varepsilon$) to $c^*$, $C_f$, $I_{sp}$ and both efficiencies, applying the injector-end to nozzle-stagnation correction and stating its magnitude.
- [ ] (L2, M18) I can explain why the throat area in that reduction must be the hot area at the test condition, not the cold machined value.
- [ ] (L2, M18) I can scale an injector cold-flow test from water to the real propellant by matching Weber and Reynolds number, and state what the scaling cannot reproduce.
- [ ] (L2, M18) I can build an $I_{sp}$ uncertainty budget from stated sensor uncertainties, deriving the partials and combining in root-sum-square, correctly distinguishing sums from products.
- [ ] (L2, M18) I can distinguish Type A from Type B uncertainty and explain why averaging reduces only the first, as $1/\sqrt{n}$.
- [ ] (L2, M18) I can compute a sense-line quarter-wave or Helmholtz frequency and decide whether a named combustion mode is observable at all.
- [ ] (L2, M18) I can correct a first-order sensor for its own lag on a ramp and on a step, and quantify the error a slow thermocouple introduces into a transient.
- [ ] (L2, M18) I can choose a sample rate and anti-alias corner for a stated bandwidth and state the phase lag the filter introduces.
- [ ] (L2, M18) I can state that a magnet-mounted accelerometer resonates around 2–7 kHz and will report itself enthusiastically.
- [ ] (L3, M18) Given an annotated hot-fire trace, I can identify chug, a mixture-ratio shift, a sense-line resonance and an instrumentation failure, and say what evidence separates them.
- [ ] (L3, M18) I can state a redline set for a given engine, justify each limit physically, estimate the detection-to-shutdown latency (typically 50–500 ms of the failure already happened), and say what damage accrues inside it.
- [ ] (L3, M18) Given an unfamiliar engine and a described anomaly, I can propose the instrumentation that discriminates among candidate causes and say what each channel shows under each hypothesis.
- [ ] (L3, M18) I can argue both sides of a green-run decision for a specific stage.
- [ ] (L3, M18) Given a proposed test campaign, I can state what it does not prove and what additional test or analysis closes each gap — and explain why that list is the document a review board actually reads.

---

## Solid propulsion — fundamentals

- [ ] (L1, M19) I can explain in plain language why a solid motor's chamber pressure is set by $K_n$ and the propellant and cannot be changed in flight.
- [ ] (L1, M19) I can name the four constituents of a composite propellant and say what each does — including that the binder is a fuel and the entire structure.
- [ ] (L1, M19) I can state that flown solids give 240–300 s and hydrolox about 450 s, and give one physical reason (product molar mass, plus two-phase loss).
- [ ] (L1, M19) I can classify a propellant into double-base, composite, CMDB or NEPE from a description of its constituents, and say what each family buys and costs.
- [ ] (L2, M19) I can compute ideal $I_{sp}$ from $T_c$, $\bar M$, $\gamma$, $p_c$ and $\varepsilon$ via $c^*$ and $C_F$, and name the loss mechanisms that separate it from a published figure.
- [ ] (L2, M19) I can compute condensed-phase mass fraction from an aluminium loading and bracket the two-phase loss with a stated model.
- [ ] (L2, M19) I can compute and compare density impulse across propellant classes with correct bulk-density arithmetic, and argue a stage-sizing decision from it.
- [ ] (L2, M19) I can quote from memory typical solids loading, $\rho_p$ 1600–1900 kg/m³ (AP/Al composites 1750–1850), $n$ 0.2–0.5, delivered $c^*$ 1450–1600 m/s, and the 1.3/1.1 hazard-class distinction.
- [ ] (L2, M19) I can read the published Shuttle SRB composition — AP 69.6 %, Al 16 %, Fe₂O₃ 0.4 %, PBAN 12.04 %, epoxy curative 1.96 % — say what each constituent does, and identify which 0.2 percentage-point change would most alter the thrust trace.
- [ ] (L2, M19) I can rank PBAN, CTPB, HTPB and energetic binders on solids loading, low-temperature strain capability and processing viscosity, and explain why HTPB's advantage is rheological rather than energetic.
- [ ] (L3, M19) Given an unfamiliar application — a silo-stored strategic stage, a tactical missile, an apogee kick motor, a commercial strap-on — I can argue to a propellant family, binder, metal loading and hazard class, and say what I would measure to confirm.
- [ ] (L3, M19) Given a motor that ran 5 % hot, I can produce a ranked list of causes spanning formulation, process, grain structural failure and instrumentation, and say what evidence discriminates them.
- [ ] (L3, M19) I can explain why aluminium is added for density impulse and acoustic damping at least as much as for $I_{sp}$, and why refining it to chase $I_{sp}$ has destabilised motors.
- [ ] (L3, M19) I can state precisely what "a solid motor cannot be shut down" should say: it can be terminated once, destructively, by opening thrust-termination ports until pressure falls below the deflagration limit — as on Minuteman third stages.

## Solid propulsion — burn rate and internal ballistics

- [ ] (L1, M20) I can state $r = a p^n$, define each symbol, and explain in plain language why $p_c$ is set by $A_b/A_t$ and not by propellant mass.
- [ ] (L1, M20) I can say why $n$ must be less than 1, and what erosive burning is and where in a grain it happens.
- [ ] (L2, M20) I can describe the combustion-zone structure above a burning composite or double-base surface — condensed phase, foam/fizz, dark zone, luminous flame — and say which zone controls the pressure dependence.
- [ ] (L2, M20) I can explain the granular diffusion flame and BDP models at the level of what each says is rate-controlling, and predict how $n$ changes with pressure and oxidiser particle size.
- [ ] (L2, M20) I can convert a burn-rate coefficient quoted in mm/s·MPa$^{-n}$ or in/s·psi$^{-n}$ into SI m/s·Pa$^{-n}$ without error.
- [ ] (L2, M20) I can derive $p_c = (a\rho_p c^* K_n)^{1/(1-n)}$ from a chamber mass balance and state every assumption in it.
- [ ] (L2, M20) I can prove the $n<1$ stability requirement both graphically and from the linearised chamber-filling equation, and state the relaxation time.
- [ ] (L2, M20) I can derive $\pi_K = \sigma_p/(1-n)$ and compute hot- and cold-day pressure, thrust and burn time for a stated soak-temperature change.
- [ ] (L2, M20) I can quote from memory: $K_n$ 150–500, $\sigma_p$ 0.001–0.009 K⁻¹, $\pi_K$ 0.0015–0.02 K⁻¹, $p_c$ 3–15 MPa, port-to-throat $J$ 1.5–4, throat erosion 2–10 % on $A_t$, sliver 1–8 % of propellant mass.
- [ ] (L2, M20) I can state the low-pressure deflagration limit range (0.5–1.5 MPa) and say why it matters to tail-off and to thrust termination.
- [ ] (L2, M20) I can estimate whether erosive burning matters from $J$ or port Mach number, and compute the coupled — not single-pass — pressure rise it causes.
- [ ] (L2, M20) I can compute the effect of a stated throat-area growth on pressure and on thrust, and explain why thrust falls only as $n/(1-n)$ so throat erosion is a pressure problem, not a thrust problem.
- [ ] (L2, M20) I can distinguish $L^*$ (bulk) instability from acoustic instability in a solid motor, name the damping mechanisms available, and explain why aluminium particle size is an instability parameter.
- [ ] (L2, M20) I can predict $p_c(t)$ from a $K_n(t)$ table including throat erosion, and say where the quasi-steady assumption fails.
- [ ] (L3, M20) Given a pressure–time trace, I can identify ignition transient, equilibrium burn, tail-off, sliver burn, and an erosive hump, and diagnose throat erosion versus hot conditioning from the shape.
- [ ] (L3, M20) Given an unfamiliar motor's $p$–$t$ trace and a nominal prediction, I can say which term — $A_b$, $a$, $A_t$ or $c^*$ — is wrong and what measurement confirms it, using the head-to-aft pressure difference as the separating instrument.
- [ ] (L3, M20) I can argue both sides of a high-$n$ versus low-$n$ propellant selection for a stated mission and temperature band, and quantify the case-mass consequence.
- [ ] (L3, M20) Given a motor that went unstable, I can lay out the candidate mechanisms ($L^*$/bulk, longitudinal, tangential, velocity-coupled), say how frequency and mean-pressure behaviour discriminate, and propose fixes in order of programme cost.

## Solid propulsion — grain geometry

- [ ] (L1, M21) I can explain why a solid motor's thrust curve is fixed at manufacture, sketch progressive, neutral and regressive traces, and name a grain family for each.
- [ ] (L1, M21) I can define web, sliver, volumetric loading and $K_n$ in plain language and sketch a star and an end-burner cross-section.
- [ ] (L1, M21) I can name the grain architecture of two real motors — the Shuttle RSRM's 11-point star forward segment with double-truncated-cone aft segments, and the Ariane 5 EAP's star forward segment with cylindrical-bore aft segments.
- [ ] (L2, M21) I can derive the relation between fractional burning-area error and fractional chamber-pressure error, and use the $1/(1-n)$ amplification in both directions.
- [ ] (L2, M21) I can classify a grain from $dA_b/dw$ and compute $p_c(t)$ and $F(t)$ from $K_n(w)$ and Vieille's law.
- [ ] (L2, M21) I can compute web thickness, web fraction, volumetric loading, port-to-throat ratio and sliver fraction for a given cross-section, and say what each constrains.
- [ ] (L2, M21) I can perform a burn-back by parallel offset, applying the corner rules correctly: a convex port corner opens into a circular fan of radius equal to the burned distance; a re-entrant corner is consumed.
- [ ] (L2, M21) I can derive $A_b(w)$ in closed form for a generic $N$-point star from its defining angles and solve the neutrality condition.
- [ ] (L2, M21) I can compute the ignition surface area a grain presents and explain why the igniter is sized against geometry rather than propellant mass.
- [ ] (L2, M21) I can explain why a fillet radius is simultaneously a ballistic and a structural variable — it puts the grain where a sharp grain would be after burning $f$.
- [ ] (L3, M21) Given a required thrust trace, envelope, temperature range and storage life, I can propose a grain family, defend it against two alternatives, and name what I would compute or measure to confirm.
- [ ] (L3, M21) I can argue the neutrality-versus-volumetric-loading trade with numbers, and explain why modern large monolithic motors favour finocyls and slotted tubes over stars.
- [ ] (L3, M21) I can argue case-bonded versus cartridge-loaded for a stated mission and temperature range.
- [ ] (L3, M21) I can explain why "neutral" is a property of the motor rather than of the grain, given that a mildly progressive grain plus a mildly eroding throat measures as neutral and will not in a carbon–carbon-throated motor.

## Solid propulsion — cases

- [ ] (L1, M22) I can state that hoop stress is exactly twice axial, explain why a case splits lengthwise, and define MEOP and burst factor in plain language.
- [ ] (L1, M22) I can name steel and carbon/epoxy as the two dominant case families, say which is lighter and why, and name two motors with each — Shuttle RSRM's segmented D6AC steel against P120C's monolithic filament-wound carbon.
- [ ] (L1, M22) I can explain in one sentence what a field joint is and why the Shuttle had them.
- [ ] (L2, M22) I can derive thin-wall hoop and axial membrane stresses from a free-body cut and state the thin-wall validity limit.
- [ ] (L2, M22) I can size a metallic case wall from diameter, MEOP, burst factor and allowable, and compute mass per unit length.
- [ ] (L2, M22) I can define MEOP, proof pressure, burst factor and ultimate factor of safety, and say what each one screens for.
- [ ] (L2, M22) I can compute a critical surface-flaw size from $K_{Ic}$ and hoop stress and argue what the NDE acceptance threshold must be.
- [ ] (L2, M22) I can run a netting analysis of a filament-wound cylinder and return helical and hoop fibre thicknesses from pressure, radius, winding angle and fibre allowable.
- [ ] (L2, M22) I can compute $PV/W$ for a metal and a composite case and rank candidates, quoting the order of magnitude — steel ≈10 km, titanium ≈13 km, carbon ≈45 km.
- [ ] (L2, M22) I can propagate a case-mass change into propellant mass fraction and stage Δv, and state the sensitivity per 1000 kg of inert mass.
- [ ] (L2, M22) I can quote typical mass fractions from memory: ≈0.85 for the segmented steel Shuttle RSRM against 0.924 for the monolithic composite P120C, and 0.89–0.92 for the GEM and Zefiro families.
- [ ] (L2, M22) I can name the structural loads a case sees besides internal pressure — gimbal, handling, buckling at zero pressure, skirt-bond termination — and say which sizes which part.
- [ ] (L3, M22) I can explain the clevis–tang field joint, the joint-rotation mechanism, why it made the seal rate- and temperature-dependent, and what the RSRM capture feature changed.
- [ ] (L3, M22) I can explain why a composite case is usually *thicker* than the steel one it replaces, and why 54.7° is not a universal optimum winding angle — the boss diameter sets it through Clairaut's relation.
- [ ] (L3, M22) Given a diameter, pressure, mission and photograph, I can argue a case architecture and say what I would measure on a hydroburst article and what a bad trace looks like.
- [ ] (L3, M22) I can explain why higher-strength steel does not always give a lighter case — smaller critical flaw, NDE limits — and why segmenting is almost always a logistics decision.

## Solid propulsion — insulation and liners

- [ ] (L1, M23) I can explain what internal insulation and liner each do and why a motor needs both.
- [ ] (L1, M23) I can name the two dominant material families (NBR, EPDM) and the three filler families (silica, aramid, carbon), and say what each filler buys.
- [ ] (L1, M23) I can state that exposure time varies along the case and give the reason, and name two motors with an insulation-relevant design choice each.
- [ ] (L1, M23) I can say why a debond is worse than a crack.
- [ ] (L2, M23) I can distinguish char rate, erosion rate and surface recession rate, and say when they coincide and when they do not.
- [ ] (L2, M23) I can size insulation thickness at a station from a char-rate model and an exposure-time profile, apply the margin and residual-virgin-layer stack, and estimate the mass penalty of not tapering.
- [ ] (L2, M23) I can compute a chamber-pressure rise from a stated added burning area with $p_2/p_1 = (A_{b2}/A_{b1})^{1/(1-n)}$ and compare it against MEOP and burst.
- [ ] (L2, M23) I can show the severity gap between a crack (a few percent of pressure) and a debond (potentially several-fold overpressure), and explain why that gap is the basis of acceptance criteria.
- [ ] (L2, M23) I can estimate cure-cooldown bore hoop strain from a thermal-mismatch argument and compare it against a strain capability.
- [ ] (L2, M23) I can explain the case–insulation–liner–propellant stack, what each interface does, and what test qualifies each.
- [ ] (L2, M23) I can read a bondline thermocouple trace or a post-test char-depth map and say whether the design is on prediction.
- [ ] (L2, M23) I can explain why the *forward dome* — at the lowest mass flux in the motor — can need several times the thickness of the forward cylinder, because exposure time and not flux governs.
- [ ] (L3, M23) Given an unfamiliar motor's diameter, burn time, propellant family, case material and nozzle architecture, I can reason to an insulation architecture and name the top three risks.
- [ ] (L3, M23) Given a described failure — a pressure trace, recovered hardware, a surveillance CT finding — I can discriminate the added-burning-surface path from the gas-path-to-case path and say what evidence settles it.
- [ ] (L3, M23) I can argue both sides of low-density versus erosion-resistant insulation for a specific motor.
- [ ] (L3, M23) I can explain why the asbestos substitution was not a paperwork change, and why the SLS five-segment motor carries asbestos-free insulation *and* a new liner configuration — the stack is qualified as a stack.
- [ ] (L3, M23) I can explain why a composite case makes mass fraction better but the grain thermal-strain problem and the bondline temperature limit worse.
- [ ] (L3, M23) I can say what an accelerated-ageing programme owes: a demonstration of mechanism equivalence, without which the Arrhenius extrapolation measures a reaction that never runs in the field.

## Solid propulsion — nozzles

- [ ] (L1, M24) I can explain why a solid nozzle is ablative or heat-sink rather than regeneratively cooled, and name carbon–carbon, bulk graphite and carbon-cloth phenolic with roughly where each goes.
- [ ] (L1, M24) I can describe what "submerged" and "flexseal" mean and name two motors using each (RSRM and P120C for submerged flexseal; Minuteman and Titan for LITVC).
- [ ] (L2, M24) I can enumerate the four thermal-protection strategies available to a solid nozzle — heat sink, ablation, radiation, transpiration — with the regime where each wins.
- [ ] (L2, M24) I can compute the convective throat heat flux from Bartz, add the particle-radiation term, and say why the radiative fraction is much larger in a metallised solid than in a liquid engine.
- [ ] (L2, M24) I can name the three throat-erosion mechanisms, write the thermochemical reactions with H₂O and CO₂, and justify the $\dot s \propto p_c^{0.8}$ scaling from the heat/mass-transfer analogy.
- [ ] (L2, M24) I can derive the coupling between throat erosion and $K_n$ and predict $p_c$, thrust, mass flow and burn time of an eroding neutral-grain motor in closed form.
- [ ] (L2, M24) I can estimate two-phase losses from aluminium loading, particle size and nozzle length, and explain why the loss scales roughly as $d_p^2$ and inversely with nozzle length.
- [ ] (L2, M24) I can size an ablative liner from a recession rate, action time, bond-line temperature limit and margin policy, and say what each term in the stack protects against.
- [ ] (L2, M24) I can explain why roughly half the thickness of a good ablative liner exists to stop heat reaching the bondline *after* the burn, so sizing on recession alone under-thicknesses by nearly a factor of two.
- [ ] (L2, M24) I can explain the packaging benefit of a submerged nozzle in volumetric-loading terms and name the two penalties that buy it.
- [ ] (L2, M24) I can compare flexseal, gimbal ring, liquid injection, jet vanes and jet tabs on side-force capability, actuation load, inert mass and performance penalty, and match each to a real motor.
- [ ] (L2, M24) I can explain why a solid booster runs a low expansion ratio (RSRM at 7.72 initial / 7.16 later; Ariane 5 EAP raised from 9.7 to 11.0) while solid upper stages routinely run 30–70.
- [ ] (L3, M24) Given a stated propellant, pressure, burn time, packaging constraint and mission, I can propose a complete nozzle architecture — submerged or not, insert material, liner thicknesses, $\varepsilon$, TVC concept — and justify each choice.
- [ ] (L3, M24) Given a failure description I can distinguish thermochemical erosion, particle impingement, ply lift, thermal shock and a TVC actuation problem from the trace and the post-fire hardware.
- [ ] (L3, M24) I can explain why more aluminium can *reduce* thermochemical erosion by scavenging H₂O and CO₂ while increasing impingement, slag and two-phase loss, and refuse to assert a direction without the exhaust composition.
- [ ] (L3, M24) I can explain why flexseal spring rate is an elastomer problem whose temperature dependence sizes the actuator, and why sizing on the nominal day is the classic error.
- [ ] (L3, M24) I can distinguish an extendable exit cone from a merely longer fixed nozzle (Star 48B's long nozzle is the latter), and state the reliability objection to EECs.
- [ ] (L3, M24) I can correct the annual confusion that the Trident "aerospike" is a nozzle — it is a telescoping drag-reduction spike on the missile nose.

## Solid propulsion — manufacturing

- [ ] (L1, M25) I can draw the production flow from case stock to shipped motor from memory and say what each step constrains downstream.
- [ ] (L1, M25) I can name the three case-forming routes and three insulation routes with an advantage and a disadvantage of each.
- [ ] (L1, M25) I can say why propellant is mixed in batches, cast under vacuum, and cured for days, and name the main NDE methods and the defect class each targets.
- [ ] (L2, M25) I can compute batches per motor, mixers required, line throughput and the binding station from batch size, mix cycle, pot life, cure time and station counts, and say where the next capital should go.
- [ ] (L2, M25) I can derive bore hoop strain from cure shrinkage and cool-down and use it to argue against raising cure temperature to shorten cure time — cure temperature *is* the stress-free temperature.
- [ ] (L2, M25) I can convert a lot-to-lot burn-rate coefficient variation into $p_c$, thrust and burn-time variation, and compare it against the temperature-sensitivity effect, which usually dominates by a factor of two or more.
- [ ] (L2, M25) I can select an NDE method for a named defect, state its detection limit in physical units, and explain why radiography of a large motor (1–2 % of traversed thickness — a centimetre on a booster segment) is far less sensitive than CT of a small one.
- [ ] (L2, M25) I can explain the lot-acceptance evidence layers — strand burners, mechanical property specimens, subscale motors, static-fired acceptance articles — and what each is and is not evidence for.
- [ ] (L2, M25) I can explain why total impulse is nearly independent of burn rate to first order, while peak thrust, max-Q loading, staging time and separation conditions are not.
- [ ] (L2, M25) I can explain why a detectable void changes chamber pressure by parts per million, and why voids nevertheless matter as crack initiators in a strain-limited material.
- [ ] (L3, M25) Given an unfamiliar motor and plant, I can identify the likely bottleneck (usually cure pits) and the likely dominant dispersion source from architecture alone, and defend both.
- [ ] (L3, M25) Given a described defect indication, I can say what NDE found it, what would have missed it, what mechanism produces it, whether it is ballistically or structurally significant, and what the disposition should be.
- [ ] (L3, M25) Given a proposed rate increase, I can say which of hotter cure, more pits, more mixers, automated NDE or continuous mixing actually helps, quantify the first two, and name the qualification cost of the last.
- [ ] (L3, M25) I can explain the logic of an ageing surveillance programme, what justifies a service-life extension, and why static-fire success alone would not.

---

## Defense-propulsion requirements (architecture level)

*Scope note: this section stays inside the course's boundary — requirement
classes, publicly documented architectures and analytical methods. It contains
no formulations, processing procedures or weapon-specific dimensions.*

- [ ] (L1, M27) I can name the seven public requirement classes — launch booster, large strategic-class stage, tactical, boost, sustain, dual-pulse, controllable/hybrid — and state the two dominant requirements for each.
- [ ] (L1, M27) I can explain in plain language why cold is the structural design case and hot is the pressure design case.
- [ ] (L1, M27) I can state what insensitive-munitions requirements ask for, name the six standard stimuli, and say that the requirement is about the violence of the reaction rather than its absence.
- [ ] (L1, M27) I can distinguish primary from secondary smoke and explain why a hybrid's O/F changes during a burn.
- [ ] (L2, M27) I can compute the pressure, thrust and burn-time excursion across a stated temperature envelope from $\sigma_p$ and $n$, and turn it into a MEOP argument.
- [ ] (L2, M27) I can size a boost–sustain grain from a required thrust ratio and a pressure exponent, check the sustain pressure against the low-pressure limit at the cold extreme, and say what a slower sustain propellant buys.
- [ ] (L2, M27) I can estimate hybrid regression rate, fuel flow and O/F from $\dot r = a G_{ox}^n$, and predict the sign and magnitude of the O/F drift from $n$ alone.
- [ ] (L2, M27) I can compute what a zero-failure firing programme demonstrates — of order 229 firings for 0.99 at 90 % confidence — and explain why that is not how reliability is actually bought.
- [ ] (L2, M27) I can explain the dual-pulse architecture: what the inter-pulse barrier must do, the three public barrier concepts, and the inert-mass and volumetric cost.
- [ ] (L2, M27) I can trace at least three hardware consequences of an insensitive-munitions requirement, and explain the three-cornered energy–signature–insensitivity trade.
- [ ] (L2, M27) I can state the research status of throttleable solids and explain why the pressure exponent decides whether the concept is controllable at all.
- [ ] (L3, M27) Given an unfamiliar motor's requirement set, I can predict its architecture — case family, grain type, propellant class, nozzle concept, whether dual-pulse — and defend each prediction from the requirement that drives it.
- [ ] (L3, M27) Given an anomalous static-firing trace and a recorded soak temperature, I can separate a temperature effect from a burning-area effect.
- [ ] (L3, M27) I can argue both sides of the energy-versus-insensitivity trade and of the fixed-throat-versus-controllable trade, and name a public-record programme that faced each.
- [ ] (L3, M27) I can explain why ageing is a structural failure driven by chemistry, appearing at the cold limit where demand is highest and capability lowest, and what a fleet-leader population is for.
- [ ] (L3, M27) I can answer "what does this change force us to requalify, and how many firings is that?" for any proposed modification.

---

## Cold-gas propulsion

- [ ] (L1, M28) I can explain in plain language why cold-gas $I_{sp}$ is limited to a few tens of seconds and why it depends on the gas rather than on anything done to the hardware.
- [ ] (L1, M28) I can sketch the tank-to-nozzle chain — tank, filter, isolation valve, regulator, relief, manifold, thruster valves, nozzles — in the right order and name what each prevents.
- [ ] (L1, M28) I can state which way $I_{sp}$ and storage density move with molar mass, and name two flown systems with their propellants and rough scale.
- [ ] (L1, M31) I can correctly answer "does Hubble have cold-gas thrusters?" and "is Centaur's settling system cold gas?" with *no* and *no*, and say what each actually uses.
- [ ] (L2, M28) I can derive $I_{sp}^{max} \propto \sqrt{T_0/M}$ from the steady-flow energy equation and show that stored enthalpy sets the ceiling.
- [ ] (L2, M28) I can compute ideal vacuum $I_{sp}$, choked mass flow, thrust and $C_F$ for any stored gas at stated $\gamma$, $M$, $T_0$, $p_0$, $A_t$ and $\varepsilon$, and apply the right realisation discount.
- [ ] (L2, M28) I can quote from memory that nitrogen's ideal $I_{sp}$ at $\varepsilon = 50$ and 300 K is ≈77 s, realised 65–73 s continuous, and that a CubeSat refrigerant system delivers ≈40 s.
- [ ] (L2, M28) I can state the realisation efficiency ranges from memory: 0.85–0.95 continuous (use 0.90), 0.5–0.7 pulsed — and say why sizing a pulsed system on the 0.90 rule under-sizes the tank by 40 %.
- [ ] (L2, M28) I can size a stored-gas tank using $Z$ and show that tank mass per kilogram of propellant scales as $ZRT$ — hence as $1/M$ — and is independent of storage pressure in the thin-wall limit.
- [ ] (L2, M28) I can predict whether a given gas cools or warms on throttling from the Joule–Thomson coefficient and the inversion temperature, and state the design consequence at the regulator.
- [ ] (L2, M28) I can distinguish Joule–Thomson throttling at the regulator from isentropic expansion through the nozzle, and say that every gas cools in the nozzle.
- [ ] (L2, M28) I can compute impulse bit and minimum impulse bit from valve rise time, fall time, commanded on-time and downstream dead volume, and say which of the four dominates the scatter.
- [ ] (L2, M28) I can convert deadband, moment of inertia, disturbance torque and slew requirement into a three-term total-impulse budget with a valve-cycle check.
- [ ] (L2, M28) I can quote system-level ranges from memory: thrust 10 μN–4 N, true cold gas 30–75 s, warm gas 75–110 s, gaseous storage 150–350 bar, liquefied storage 1–10 bar, $\varepsilon$ 20–100, throat 0.1–1.0 mm, valve response 1–10 ms, cycle life 10⁵–2×10⁶.
- [ ] (L2, M29) I can derive the polytropic tank-state relation and identify which exponent applies to a given blowdown from the hardware's thermal time constants.
- [ ] (L2, M29) I can derive and solve the blowdown ODE in isothermal and adiabatic limits and compute usable propellant fraction in each — $1-p_f/p_i$ versus $1-(p_f/p_i)^{1/\gamma}$, roughly 15 % apart.
- [ ] (L2, M29) I can estimate throat Reynolds number for a sub-millimetre nozzle and apply a low-Reynolds-number efficiency to $C_F$ and $I_{sp}$, citing the correlation's source and uncertainty.
- [ ] (L2, M29) I can explain why the optimum expansion ratio falls below $Re_t \sim 10^4$ and why realised $I_{sp}$ peaks near $\varepsilon = 50$–100 in a 0.1 mm-throat nozzle.
- [ ] (L2, M29) I can convert a helium leak-rate specification into a five-year propellant loss in grams and compare it against the propellant budget.
- [ ] (L2, M30) I can size a spherical pressure vessel for a stated MEOP, volume and material, apply the burst factor, and compute mass and $PV/W$.
- [ ] (L2, M30) I can explain leak-before-burst, what design feature produces it, and why a COPV cannot claim it the way a metallic tank can.
- [ ] (L2, M30) I can write a leak budget from an allowable propellant loss, allocate it across seats and joints, and convert between helium and nitrogen leak rates with the correct regime factor — 2.65 molecular, 0.89 viscous, with no universal conversion.
- [ ] (L2, M30) I can derive the solenoid force balance and explain pull-in, drop-out, holding current and peak-and-hold drive, and estimate opening delay from the coil $L/R$ constant.
- [ ] (L2, M30) I can compute the thrust uncertainty from a machining tolerance on a sub-millimetre throat and combine it by RSS with regulation and $C_d$ uncertainty.
- [ ] (L2, M30) I can name the four distinct regulator behaviours — setpoint, droop, lockup, creep — plus supply pressure effect, and state that a regulator's characteristic failure is to pass full inlet pressure downstream.
- [ ] (L2, M30) I can predict the pressure and thrust change of a stored-gas tank and of a self-pressurising saturated-liquid tank for a stated temperature swing, and size thermal control accordingly.
- [ ] (L2, M31) I can reconstruct a published Δv from propellant mass, system mass and $I_{sp}$, and state which reference mass it must refer to for the set to close.
- [ ] (L2, M31) I can compute impulse density $\rho I_{sp}$ and use it — not $I_{sp}$ — to select a propellant for a volume-limited spacecraft, showing that R-236fa at ≈43 s beats nitrogen at ≈77 s by a factor of about 2.7 per unit propellant volume.
- [ ] (L2, M31) I can read a blowdown pressure–time trace and separate consumption from leakage, quoting the leak rate in both kg/s and sccm.
- [ ] (L2, M31) I can state SAFER's published set from memory — GN₂ at 224 bar, 24 thrusters, 1.4 kg of propellant, 37.7 kg system, 3.05 m/s Δv, implying ≈40 s — and MarCO's — R-236fa self-pressurising at ≈2.7 bar, 8 thrusters, 755 N·s, 3.49 kg wet, >40 m/s, ≈40 s.
- [ ] (L3, M31) I can show that the MMU's published set does not close — 11.8 kg of GN₂ against a claimed 110–130 ft/s — and explain why SAFER is the honest reference system instead.
- [ ] (L3, M28) Given an unfamiliar mission — a 12U formation-flying rideshare, a 20-year GEO satellite, an EVA aid, a booster coast phase — I can select propellant and architecture and defend both against the three strongest alternatives.
- [ ] (L3, M29) Given a cold-gas datasheet, I can decide whether the quoted $I_{sp}$ is defensible by estimating $Re_t$ from thrust and pressure alone.
- [ ] (L3, M29) Given a thrust-stand trace, I can say whether the scatter is timing jitter, tail-dominated pulse dynamics, condensation, or a partially blocked throat.
- [ ] (L3, M30) I can recognise a vendor "number of firings" that is really total impulse divided by minimum impulse bit — two lines quoting 880,000 and 1,860,000 firings that both reduce to exactly 5.0×10⁻⁵ N·s — and ask for the qualification cycle count separately.
- [ ] (L3, M30) Given a described anomaly — slow tank decay, creeping downstream pressure, accumulating attitude momentum, a valve that opens only when warm — I can name the mechanism and the evidence I would gather.
- [ ] (L3, M31) I can explain why MarCO's 40 s propellant was the correct engineering decision, and under exactly what change of requirement it would become wrong.
- [ ] (L3, M28) I can explain why the answer to "should we use helium, it has the best $I_{sp}$?" is no, using tank mass, volume and leak rate rather than adjectives.
- [ ] (L3, M31) I can argue regulated versus blowdown versus self-pressurising for a stated mission, and name the control-law consequence of a blowdown impulse bit that falls to a third of its beginning-of-life value.

---

## Systems engineering

- [ ] (L1, M33) I can name the seven interfaces a propulsion system has — structures, thermal, GN&C, avionics, tanks, spacecraft/payload, launch vehicle — and the one or two quantities that dominate each.
- [ ] (L1, M33) I can explain requirement flow-down, margin, and the difference between verification and validation in plain language.
- [ ] (L1, M33) I can say what pogo is, why an accumulator helps, and name two vehicles that had it.
- [ ] (L2, M33) I can flow a requirement down four levels — mission → vehicle → engine → component — writing each as a verifiable "shall" with a parent, a rationale and a verification method, and show the arithmetic connecting child to parent.
- [ ] (L2, M33) I can compute $\mathrm{NPSH}_a$ at a pump inlet from tank pressure, vapour pressure, liquid column and vehicle acceleration, and invert it for the ullage pressure required at end of burn.
- [ ] (L2, M33) I can derive $\partial \Delta v/\partial I_{sp}$ and $\partial \Delta v/\partial m_f$ and combine independent uncertainties by RSS into a Δv standard deviation, then decompose the variance by contributor.
- [ ] (L2, M33) I can distinguish design margin from demonstrated margin, apply mass growth allowance by design maturity, and state the factors of safety and life factors a propulsion pressure component must carry.
- [ ] (L2, M33) I can build a weighted trade matrix against a datum, compute the ranking, then sweep the weights and report the range over which the recommendation survives.
- [ ] (L2, M33) I can write a verification matrix assigning inspection, analysis, test or demonstration to every requirement, and explain why a requirement with no verification method is not a requirement.
- [ ] (L2, M33) I can lay out a qualification campaign — qualification versus protoflight, levels relative to the maximum predicted environment, and the environmental sequence order — and say what each test protects against.
- [ ] (L2, M33) I can state what a propulsion engineer must bring to SRR, PDR, CDR, TRR and FRR, and what closes each.
- [ ] (L2, M33) I can convert any engineering argument on a launch vehicle into kilograms of payload via the stage exchange ratio, in my head.
- [ ] (L3, M33) Given an anomaly description, I can identify which interface is implicated and which requirement was missing, wrong or unverified — and argue the counter-case.
- [ ] (L3, M33) I can defend a margin philosophy against a reviewer who wants more and a programme manager who wants less, using variance decomposition rather than assertion.
- [ ] (L3, M33) I can say when a Monte Carlo is worth running and when it is theatre.
- [ ] (L3, M33) Given a trade study, I can find the criterion the answer actually turns on and the assumption smuggled in as a weight.
- [ ] (L3, M33) I can explain why NPSH is a system allocation rather than a pump problem, and show the three ways to meet it — tank pressure, subcooling, boost pump — and where each moves mass.
- [ ] (L3, M33) I can identify, for any programme I am on, the short honest list of numbers nobody has tested and analyses nobody has validated, and report it at every review.

---

## Failure history

- [ ] (L1, M34) I can name the propulsion failure mode in each major case: Challenger field-joint seal, Titan 34D-9 insulation debond, CRS-7 strut/COPV, AMOS-6 COPV ignition, LE-7 inducer cavitation fatigue, Vega VV22 carbon–carbon throat erosion.
- [ ] (L1, M34) I can state the six recurring failure classes — design margin, manufacturing/process escape, operations/environment, instrumentation/redline logic, materials compatibility, unrecognised physics — and say what corrective action each demands.
- [ ] (L1, M34) I can explain in plain language why a cold O-ring is *slow* rather than brittle.
- [ ] (L2, M34) I can distinguish proximate, intermediate and root cause, and explain why an investigation that stops at the proximate cause produces a fix that does not hold.
- [ ] (L2, M34) I can apply a fixed six-question interrogation to a failure I have never seen and produce a defensible answer.
- [ ] (L2, M34) I can reconstruct the O-ring resilience-versus-temperature argument quantitatively from the Rogers Commission's own test data with a time–temperature superposition model, and state the argument's limits.
- [ ] (L2, M34) I can predict the pressure–time signature of an insulation debond, a case burn-through and a throat over-erosion from the equilibrium-pressure relation, and distinguish the three from telemetry alone.
- [ ] (L2, M34) I can compute COPV stored energy and the energy available from solid oxygen trapped under an overwrap, and explain why that is a materials-compatibility problem before it is a structural one.
- [ ] (L2, M34) I can estimate the fatigue cycles an inducer blade accumulates under rotating cavitation in a single flight, and explain how a component passes a long ground programme and fails on its eighth flight.
- [ ] (L2, M34) I can explain why falling chamber pressure has at least four independent causes and why the thrust-to-pressure ratio and vehicle rates — not the pressure trace — separate them.
- [ ] (L3, M34) Given a described telemetry trace — chamber pressure, turbopump speed, turbine discharge temperature, mixture ratio, vehicle rates — I can name the failure class and the most probable mechanism.
- [ ] (L3, M34) Handed an unfamiliar failure, I can build the fault tree, say what evidence closes each branch and in what order I would seek it, and name two or three historical cases sharing the mechanism.
- [ ] (L3, M34) I can explain why a stronger COPV would not have prevented AMOS-6 — the mechanism was ignition, not overload — and treat that as the module's central distinction.
- [ ] (L3, M34) I can explain why three identical sensors from the same lot in the same location do not make a redline safe, using STS-51F as the case.
- [ ] (L3, M34) I can explain why engine count and reliability couple through architecture — the N1's thirty engines without meaningful engine-out or integrated ground test, against Falcon 9's nine with both.
- [ ] (L3, M34) I can distinguish a presidential or independent commission report, a regulatory closure and a company statement as evidence, and cite accordingly.
- [ ] (L3, M34) I can argue the other side: when a programme was *right* to accept a known anomaly, and what distinguishes that judgement from normalisation of deviance.
- [ ] (L3, M34) I can explain why Titan 34D-9 was not "another Challenger" — an insulation-to-case bond failure near a joint versus a seal failure at one — and what the conflation costs.

---

## Historical engines

- [ ] (L1, M35) I can place the V-2, F-1, J-2, RL10, RD-253, RS-25, RD-180, Merlin, Raptor, the Shuttle SRB and P120C on a timeline within a decade and state each one's cycle and propellant.
- [ ] (L1, M35) I can name one thing each of those was the first to do, and say what film cooling, a tube wall and a field joint are.
- [ ] (L1, M26) I can name the five solid-motor architecture axes — binder family, case material and construction, nozzle and TVC concept, grain philosophy, manufacturing and transport — and classify any large motor on all five.
- [ ] (L2, M35) I can state the V-2's parameter set from memory to engineering accuracy: ≈15.2 bar chamber pressure, ≈245 kN sea level rising to ≈285 kN, ≈203 s sea-level $I_{sp}$ (a reconstruction, 199–210 s across sources), 18 pot-type burner cups, and a hydrogen-peroxide steam turbine at ~4,000 rpm.
- [ ] (L2, M35) I can state the F-1's set: MR 2.27, ≈70 bar (contested), 6,770 kN sea level / 7,770 kN vacuum, $\varepsilon$ 16:1, 8,400 kg dry, 178 brazed tubes, TEA/TEB ignition, direct-drive turbopump at 5,488 rpm and 41 MW.
- [ ] (L2, M35) I can state the J-2's set: gas generator, MR nominally 5.5 with a PU valve shifting 4.5–5.5 (trading 780–1,000 kN against $I_{sp}$), 1,033 kN vacuum, 421 s, $\varepsilon$ 27.5, 614 coaxial posts through a transpiration-cooled porous faceplate, restartable on a helium start bottle.
- [ ] (L2, M35) I can state the RL10A-3-3A's set: closed expander, MR 5.0, 73.4 kN, 32.8 bar, 444–445 s, $\varepsilon$ 61, geared single shaft — and explain why its chamber pressure is low *by design*.
- [ ] (L2, M35) I can state the RS-25's set: fuel-rich staged combustion, dual-shaft, two preburners, MR 6.03, 206.4 bar at 109 %, 1,860 kN sea level / 2,279 kN vacuum, 452.3 s, throttle 67–109 %, NARloy-Z liner with 390 milled channels and a 1,080-tube nozzle — and flag that its mass and expansion ratio are both contested.
- [ ] (L2, M35) I can state the RD-180's set: ORSC, two chambers on one turbopump, MR 2.72, 267 bar quoted at *nozzle stagnation*, 3,830 kN sea level, 338 s vacuum, 5,480 kg, throttle 47–100 % — and say why comparing that 267 bar to the RS-25's injector-end 206 bar slightly overstates the gap.
- [ ] (L2, M35) I can state the RD-253's set and its significance: the first ORSC engine ever flown, 147 bar in 1963, T/W ≈156:1 — fifteen years before an American engine reached that pressure.
- [ ] (L2, M35) I can state the Merlin 1D's set and its provenance: gas generator, pintle injector traced to the Apollo LM descent engine, 845 kN sea level, 97 bar (a company claim), 282 s / 311 s, $\varepsilon$ 16, 470 kg, T/W ≈184:1 claimed, single-shaft dual-impeller pump at ~36,000 rpm.
- [ ] (L2, M35) I can state the Vulcain family's set: gas generator by deliberate choice, Vulcain 1 at 100 bar / 1,140 kN / 431 s at MR 5.3; Vulcain 2 at 117.3 bar / 1,359 kN / 429 s at MR 6.1 with film cooling added to the lower nozzle; Vulcain 2.1 at 120.8 bar and slightly *lower* thrust, a manufacturing simplification.
- [ ] (L2, M35) I can state the LE-7A's set: fuel-rich staged combustion, MR 5.9, 120 bar — deliberately *lower* than the LE-7's 127 bar, trading performance for turbopump margin after the 1999 inducer failure — 1,098 kN vacuum, 440 s, throttle 72–100 %.
- [ ] (L2, M35) I can state the LE-9's set: expander bleed at 1,471 kN and 100 bar, 426 s, by a wide margin the largest expander-family engine ever flown, delayed roughly two years by chamber-wall and turbine-blade cracks found in 2020.
- [ ] (L2, M26) I can state the Shuttle RSRM's set: PBAN/AP/Al, 11-point star forward segment, D6AC steel in four flight segments with three field joints, ≈62.5 bar average, ≈14,700 kN peak per motor, 242 s sea level / 268 s vacuum, ≈123–124 s action time, ≈500 t propellant, mass fraction ≈0.85.
- [ ] (L2, M26) I can state P120C's set: HTPB 1912 (19 % Al, 12 % binder), monolithic filament-wound carbon case with no field joints, 141,400 kg propellant, ≈4,780 kN peak vacuum, ≈280 s, mass fraction 0.924 — and contrast it directly with the RSRM.
- [ ] (L2, M26) I can state Star 48B's set and its trap: ≈66 kN vacuum, ≈87 s burn, ≈2,010 kg propellant, titanium case, and $I_{sp}$ of **either** 286.2 s (short nozzle) **or** 292.2 s (long nozzle, $\varepsilon$ up to ~70) — never quotable without the nozzle.
- [ ] (L2, M26) I can convert between total impulse, average thrust, burn time and propellant mass, and detect an inconsistent published data set by doing so.
- [ ] (L2, M26) I can state whether a quoted solid-motor thrust is per-motor or per-vehicle, maximum or average, sea level or vacuum, and refuse to use one that is not tagged.
- [ ] (L2, M26) I can trace the four-step case-material progression (steel → glass filament wound → Kevlar/epoxy → graphite/epoxy) and the three-step TVC progression (jet deflection → liquid injection → gimballed flexseal), naming what each step removed.
- [ ] (L3, M35) For any transition in the course's tables, I can name the enabling technology, classify it as materials, manufacturing, analysis, propellant or economics, and separately name the programme pressure that funded it.
- [ ] (L3, M35) I can explain why chamber pressure rose by a factor of ten in twenty years and then only twofold in the sixty after, with cycle and materials arguments rather than a trend line.
- [ ] (L3, M35) I can decompose a measured $I_{sp}$ difference between two engines into propellant, chamber-pressure, expansion-ratio and combustion-efficiency contributions, and explain why the decomposition is path-dependent.
- [ ] (L3, M35) I can explain the ORSC metallurgy bottleneck, why it delayed Western adoption for decades, why the Soviet answer was a surface-chemistry one, and why no American ORSC engine flew until the BE-4 in 2024.
- [ ] (L3, M35) I can explain the Soviet multi-chamber choice as buying stability geometrically rather than through a decade of injector development — and note that it shipped in 1957 while the F-1 was still exploding.
- [ ] (L3, M26) Given an unfamiliar solid motor described only by dimensions, casting location and mission, I can predict its architecture on all five axes and defend each prediction.
- [ ] (L3, M26) Given a published motor data set, I can find the internal inconsistency and say which of the numbers I would trust — and I can explain why "Ariane 5's P238 carries 270 tonnes" is a widely copied mislabelling of gross mass.
- [ ] (L3, M26) I can argue both sides of segmented steel versus monolithic composite for a named new vehicle, including transport, refurbishment, joint count and schedule, and say what would change my recommendation.

---

## Modern engines and methods

- [ ] (L1, M36) I can name the main method families — equilibrium codes, ROM/cycle codes, RANS/LES/DNS, conjugate heat transfer, FEA, MDO, topology optimisation, surrogates, UQ, MBSE, digital twins — say in one sentence what each computes, and place them in cost order.
- [ ] (L1, M36) I can state that verification and validation are different questions and that the engine is sized in a reduced-order model before any CFD is run.
- [ ] (L2, M36) I can place any analysis result on the verification / validation / qualification ladder in the sense of NASA-STD-7009.
- [ ] (L2, M36) I can choose between RANS, URANS, LES and DNS for a stated question and estimate grid count and wall-clock cost to within an order of magnitude from $Re$ and the resolution requirement.
- [ ] (L2, M36) I can state what a flamelet/FGM model assumes, name three rocket situations that violate those assumptions, and say what finite-rate chemistry costs instead.
- [ ] (L2, M36) I can write down the algebraic and differential equations a cycle balance solves and the closure correlations it needs.
- [ ] (L2, M36) I can run a Bartz cross-check against a conjugate-heat-transfer CFD result and state three things that would make me believe the CFD and three that would make me believe Bartz.
- [ ] (L2, M36) I can propagate stated input uncertainties through a $c^*$/$C_F$ chain by Monte Carlo, report a distribution, decompose variance by first-order Sobol index, and contrast that with deterministic margin stacking.
- [ ] (L2, M36) I can compute a stiffness-driven beam-theory mass bound for a bracket and say why real topology optimisation lands above it.
- [ ] (L2, M36) I can read a CFD or FEA report and list the three questions whose absence makes it uninterpretable.
- [ ] (L2, M36) I can describe what an engine digital twin actually contains, what test data updates in it, and name three things it cannot predict.
- [ ] (L3, M36) Given an unfamiliar development problem, I can lay out the V&V ladder — what each rung retires, what it costs, where it should stop — and defend the sequencing against an alternative.
- [ ] (L3, M36) I can argue both sides of "should this be qualified by analysis?" using NASA-STD-7009 credibility language.
- [ ] (L3, M36) Given a simulation that disagrees with a correlation, I can enumerate the physical and numerical explanations, say which is testable and how, and say what I would do if the test were unavailable.
- [ ] (L3, M36) I can explain, with cases, why combustion instability, ignition, cavitation inception and AM allowables remain empirical, and what would have to change for that to stop being true.
- [ ] (L3, M36) I can explain why a finer mesh does nothing about model-form error, and why a grid-converged $k$–$\epsilon$ answer in separated flow is a precise wrong number.
- [ ] (L3, M35) I can state honestly what the modern record does and does not support: Raptor's 250 → 300 → 330 bar and 1,814 → 2,256 → 2,452 kN progression is a chain of company claims, one traceable to a 2020 social-media post, and the same caution applies to BE-4's uprate from 2,460 to a claimed 2,847 kN.
- [ ] (L3, M35) I can explain why additive manufacturing has raised no engine's chamber pressure or $I_{sp}$, and why what it changed — part count, internal geometry freedom, development calendar time — is a bigger deal and a different one.
- [ ] (L3, M35) I can explain why Rutherford's electric pump cycle wins below a thrust threshold and loses above it, and why its 72.8:1 engine T/W excludes the batteries.
- [ ] (L3, M35) I can explain why newer is not automatically better: Merlin 1D's sea-level $I_{sp}$ is below the F-1's and its chamber pressure well below the RD-253's, because the objective function changed from payload mass to unit cost to cost per flight.

---

## Self-audit protocol

A checklist you tick once is a reading list. A checklist you *sample* is an
instrument. Run this every three to six months.

**1. Sample.** Draw **40 items at random** across the whole file — not by
section, not by the parts you enjoy. Number the items and use a random number
generator, or shuffle a deck of section names and pick items blind. Sampling by
section defeats the purpose: the point is to find the gaps you would not have
gone looking for.

**2. Attempt cold.** No notes, no engine database, no course text, no search.
Give yourself a sheet of paper and a fixed budget: **5 minutes for an L1 item,
15 for an L2, 20 for an L3**. Write the answer out. An answer you cannot write
is an answer you cannot give in a review.

**3. Score honestly, by level.** Score each attempt 1 or 0, with no partial
credit and one rule for what counts:

| level | passes when |
|---|---|
| **L1** | you produced the explanation, the names and the trend, in plain language, and got the direction of every trend right |
| **L2** | you set up the calculation correctly, carried units, produced a number, and quoted the range or assumption the item asked for. A right setup with an arithmetic slip **passes**; a wrong setup with a lucky number **fails** — the same rule as the course exams |
| **L3** | you produced a defensible position, named what you would measure or compute to test it, argued the other side, and named the programme or engine that faced it. Missing the counter-argument fails the item |

Number items pass inside the stated band and fail outside it. Real-engine items
require the number **and** its caveat: a Raptor figure quoted without the word
"claim", or a Star 48B $I_{sp}$ quoted without the nozzle, is a failed item even
if the digits are right. Diagnosis items require the discriminating measurement,
not just the most likely cause.

**4. Compute three percentages** — one per level — from your sample. A 40-item
sample gives roughly ±8 percentage points of sampling error per level, so treat
a 5-point move between audits as noise and a 20-point move as real.

**5. Map every failure to its module and re-study *that module only*.** The
module tag exists for this. Three or more failures carrying the same module tag
is a re-read; a single failure is a worked example. Failures clustered by
*level* rather than by module mean something different: many L2 failures across
unrelated modules is a calculation-fluency problem, and many L3 failures with
solid L2s means you know the physics and have not practised defending a
position — go to [Part VI](../part6-interview/) rather than back to the modules.

**6. Log the date, the sample, and the three percentages.** The trend matters
more than any single audit, exactly as it does with $\eta_{c^*}$ across a test
series and with bond strength across a surveillance programme. A score that is
flat across two years means the sampling has stopped finding your gaps — widen
the budget, tighten the pass rule, or move to the oral-exam bank.

### Scoring

Map each level's percentage onto the course's [grading scale](../README.md#grading-scale):

| % of sampled items ticked | band | reading |
|---|---|---|
| **90–100** | interview mastery | you could defend this material to a senior propulsion engineer |
| **75–89** | working engineering knowledge | correct analysis; the gaps are in judgment, not method |
| **60–74** | familiarity | concepts right, calculations or reasoning incomplete |
| **< 60** | re-study | go back to the modules the failures point at before proceeding |

Read the three percentages as a profile, not as one number:

| profile | what it means | what to do |
|---|---|---|
| L1 ≥ 90, L2 < 75 | you can talk about propulsion and cannot yet do it | work the module problems and the [whiteboard problems](../part6-interview/whiteboard-problems.md); do not read more |
| L1 and L2 ≥ 90, L3 < 60 | textbook-solid, argument-thin | [trade-study projects](../part6-interview/trade-study-projects.md), the [oral-exam bank](../part6-interview/oral-exam.md), and the capstone |
| L2 ≥ L1 | you have been calculating without consolidating | you will fail the "explain it in plain language" questions; practise the [explain-to-an-engineer](../part6-interview/explain-to-an-engineer.md) prompts |
| all three ≥ 90 | the checklist has stopped measuring you | sit the [final exam](../exams/exam-final.md) cold, then re-audit on the items you have never sampled |

If you want a single number for the whole audit, weight it the way the course
weights judgment over recall: **L1 × 0.2 + L2 × 0.4 + L3 × 0.4**, and read it
against the same four bands.
