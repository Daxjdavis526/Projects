# Module 30 — Cold-Gas Hardware — Answer Key

Solutions to the problems and quiz in
[`30-coldgas-hardware.md`](30-coldgas-hardware.md). Numerical answers were
computed with `tools/rocket.py`; the reproducible inputs are in
`tools/examples/30.py`. Where a problem admits more than one defensible
answer, the key says so and gives the grading criterion.

---

## K1. Problem solutions

### Conceptual

**C1.** Substituting the membrane relation $t = p_b r/(2\sigma_\mathrm{tu})$ into $PV/W = p_\mathrm{MEOP}V/(mg_0)$ with $V = \tfrac43\pi r^3$ and $m = 4\pi r^2 t\rho$ gives

$$\frac{PV}{W} = \frac{p_\mathrm{MEOP}\cdot\tfrac43\pi r^3}{4\pi r^2\left(\frac{FS_u\,p_\mathrm{MEOP} r}{2\sigma_\mathrm{tu}}\right)\rho\, g_0} = \frac{\sigma_\mathrm{tu}}{2\,FS_u\,\rho\,g_0}.$$

Radius and pressure both cancel: the figure of merit is specific strength divided by twice the burst factor. Three effects that break it at small scale:
1. **Minimum manufacturable gauge** — you cannot spin, weld or machine a shell (or a COPV liner) below roughly 0.3–0.5 mm, so below some size the wall is thicker than strength requires and mass stops scaling.
2. **Bosses and fittings** — a fixed-size port is a negligible fraction of a large tank and a large fraction of a small one; boss mass scales with roughly nothing.
3. **Non-membrane regions** — dome buildup and doilies on a COPV, knuckles and weld lands on a metallic tank, all fixed-ish in extent.
(Accept also: fracture-control minimum thickness for a screenable flaw; handling and stiffness requirements that have nothing to do with pressure.)

**C2.** The two strongest objections are **helium permeation** through the polymer liner (Eq. 3.4 — solution-diffusion transport with no hole in the wall, at rates irrelevant over an automotive fill cycle and fatal over five years) and **liner buckling** on depressurisation, which microcracks the liner and destroys whatever permeation barrier it had. **Permeation is decisive** because it is a steady, unavoidable, first-order loss present in a perfectly manufactured vessel, whereas buckling can in principle be designed against with a minimum-operating-pressure constraint. A weaker third objection worth a mark: boss-to-liner joint integrity.

**C3.** *Mechanism:* leakage past the closed regulator seat integrating into the downstream volume; since the outlet is a closed volume whenever no thruster is firing, the pressure walks up asymptotically toward inlet pressure. *Why worse when pulsing:* an attitude-control system fires for milliseconds and then sits for hours, so the duty cycle is essentially zero and the downstream volume is closed essentially all the time; a continuously flowing system sweeps the leak straight through and never sees a pressure rise. *Two independent defences:* (i) a downstream relief valve or burst disk, which caps the pressure but does not stop the loss; (ii) an upstream latching isolation valve commanded closed between activity periods, which removes the pressure source and stops the loss. (Accept also: series regulators; rating the whole downstream section to MEOP, which tolerates the creep rather than preventing it.)

**C4.** *Physics:* the poppet must be held closed against $p\,A_\mathrm{seat}$, and the available magnetic force goes as $\mu_0N^2I^2A_p/(2g^2)$ (Eq. 3.7) with a hard ceiling set by iron saturation. Fifteen-fold more pressure means fifteen-fold more seat force, and the solenoid cannot supply it without becoming large and power-hungry. *Two architectures:* (i) a **latching valve**, which needs force only during the transition and holds state on a permanent magnet or over-centre mechanism; (ii) a **pilot-operated valve**, where a small solenoid vents a control volume and line pressure does the sealing work. Accept also: a **pyrotechnic** valve for one-shot isolation, or a **pressure-balanced poppet** — flagging that balancing requires a dynamic seal on the balance stem, which is a new leak path.

**C5.** A soft polymer land is compliant: it conforms to the mating surface's form error and roughness and it *embeds* small particles, so it achieves 10⁻⁴–10⁻⁶ scc/s GHe. It also cold-flows under sustained seat load, has a limited temperature range, and outgasses. Two hard surfaces seal only where their asperities happen to touch, so leakage is an order of magnitude worse, but there is no creep and impact wear is far lower, giving longer cycle life. *Why the seat sets the filtration:* a soft seat swallows a 10 μm particle; a hard seat is propped open by it and leaks permanently. The filter's absolute rating therefore has to be smaller than the particle the *chosen seat* cannot tolerate — the requirement flows seat → filter, not filter → seat.

**C6.** A flyback diode clamps the coil at ~0.7 V, so $dI/dt = V_\mathrm{clamp}/L$ is small and the current — and hence the holding force — decays slowly; the armature stays seated longer, lengthening $t_\mathrm{cl}$ and making it temperature- and unit-dependent. That directly perturbs $t_\mathrm{eff} = t_\mathrm{cmd}-t_\mathrm{op}+t_\mathrm{cl}$ and therefore the impulse bit. The EMI benefit is that the switch node never rises far, so there is no fast high-voltage transient to conduct or radiate. *Instead:* a Zener or TVS clamp at, say, 60 V, giving $dI/dt = 2000$ A/s for a 30 mH coil and a ~0.2 ms collapse. *Cost:* a larger, faster transient — more conducted and radiated emissions, requiring twisted/shielded valve harness, careful return routing, and margin against the programme's conducted-emissions limit.

**C7.** (i) **Throat area mismatch** — each throat is machined to a tolerance and $A_t\propto D_t^2$, so a ±10 μm tolerance on a 0.3 mm throat is ±6.7 % thrust each and up to ~13 % net force between a pair. (ii) **Thrust-vector misalignment** — nozzle axis not normal to the mounting face, or exit not concentric with throat, giving an angular error of order a degree. *Calibration fixes (i)*: measure each flight throat, record it, use the measured $A_t$ in the thrust model, and the residual is the measurement uncertainty. *Calibration does not fix (ii)* in the same way — the misalignment angle is a fixed geometric property that can be measured and compensated in the control allocation matrix only if the spacecraft's alignment metrology is good enough, and any residual shows up as accumulated momentum on every burn. Full marks require noting that (i) is a magnitude error and (ii) is a direction error, and that direction errors integrate into the attitude system.

**C8.** Two normally-closed valves in series protect against **inadvertent thrust** — either a stuck-open valve or a leaking seat, since both must fail before propellant escapes. It makes **loss of thrust more likely**: there are now two components either of which failing closed disables the thruster, so the fail-to-open probability roughly doubles. A four-valve series-parallel (quad) arrangement adds tolerance to *both* failures simultaneously: two parallel legs each of two valves in series, so one stuck-closed valve leaves the other leg, and one leaking seat still has its partner in series. Full marks note that this asymmetry is deliberate on small spacecraft (inadvertent thrust is a safety issue and a mission-killer; loss of thrust usually only costs the propulsive part of the mission) and that a range-safety requirement for two independent inhibits typically forces the series arrangement regardless of the propulsion analysis.

### Calculation

**N1.** $V = 2.00$ L: $r = (3V/4\pi)^{1/3} = 0.07816$ m (156 mm diameter), $A = 4\pi r^2 = 0.07677$ m². Burst pressure $p_b = 1.5\times200 = 300$ bar $= 30.0$ MPa.

*6061-T6:* $t = p_br/(2\sigma) = (30\times10^{6})(0.07816)/(2\times310\times10^{6}) = 3.782$ mm; $m = A t \rho = (0.07677)(3.782\times10^{-3})(2700) = 0.784$ kg; $PV/W = (20\times10^{6})(0.002)/(0.784\times9.80665) = 5.20\times10^{3}$ m.

*Ti-6Al-4V:* $t = 1.303$ mm; $m = (0.07677)(1.303\times10^{-3})(4430) = 0.443$ kg; $PV/W = 9.21\times10^{3}$ m.

Titanium is 1.77× lighter, exactly the ratio of the two materials' $\sigma_\mathrm{tu}/\rho$. *Why aluminium tanks of this class exist:* cost (a factor of several in material and machining), weldability of thin sections without the inert-atmosphere discipline titanium needs, better formability, no galling/cold-welding concerns, and full [MMPDS] allowables for a very well-understood alloy. On a mission where 0.34 kg does not decide anything, aluminium is the cheaper and lower-risk part. Full marks require naming at least two of these and noting that the *choice is a programme decision, not a physics one*.

**N2.** Loss $= 0.02\times0.80 = 16.0$ g over $5.0\times365.25\times24 = 43{,}830$ h $\Rightarrow 3.650\times10^{-4}$ g/h.
Standard density of R-236fa: $\rho_\mathrm{std} = (101325)(152.04)/((8314.46)(273.15)) = 6.783\times10^{-3}$ g/cm³.
$$\dot V_\mathrm{total} = \frac{3.650\times10^{-4}}{6.783\times10^{-3}} = 5.38\times10^{-2}\ \mathrm{scc/h} = 1.49\times10^{-5}\ \mathrm{scc/s}$$
*Seats (60 % over 4):* $0.0323/4 = 8.07\times10^{-3}$ scc/h $= 2.24\times10^{-6}$ scc/s each.
*Joints (30 % over 12):* $0.0161/12 = 1.35\times10^{-3}$ scc/h $= 3.74\times10^{-7}$ scc/s each.
*GHe conversion (molecular):* $\sqrt{152.04/4.003} = 6.163$, so the helium-measured seat spec is $2.24\times10^{-6}\times6.163 = 1.38\times10^{-5}$ scc/s GHe (0.0497 scc/h).

Comment expected for full marks: this is a **tighter** requirement than the nitrogen case of Worked Example 2 (1.1×10⁻⁴ scc/s GHe) even though the propellant is stored at 2.7 bar rather than 300 bar — because the budget is set by *mass loss over time*, not by pressure. The saving grace is that leak flow scales with upstream pressure, so a seat qualified at a high test differential will leak far less at 2.7 bar; a good answer states the seat's **test pressure** must be recorded alongside its leak spec or the spec is meaningless.

**N3.** $A_t = \tfrac{\pi}{4}(1.50\times10^{-4})^2 = 1.767\times10^{-8}$ m² $= 0.01767$ mm².
$C_{F,\mathrm{vac}}(\gamma=1.4,\varepsilon=40) = 1.7210$; $F_\mathrm{ideal} = C_F p_c A_t = (1.7210)(3.0\times10^{5})(1.767\times10^{-8}) = 9.12\times10^{-3}$ N $= 9.12$ mN.
Throat conditions: $T^{*} = 285/1.2 = 237.5$ K, $p^{*} = 3.0\times10^{5}(0.5283) = 1.585\times10^{5}$ Pa, $\rho^{*} = p^{*}/(RT^{*}) = 2.248$ kg/m³, $a^{*} = \sqrt{\gamma R T^{*}} = 314.1$ m/s.
$$Re_t = \frac{(2.248)(314.1)(1.50\times10^{-4})}{15.2\times10^{-6}} = 6.97\times10^{3}$$
$C_d = 1 - 3/\sqrt{6970} = 0.964$, so $F_\mathrm{corr} = 0.964\times9.12 = 8.80$ mN.
Throat tolerance: $\delta A_t/A_t = 2(8/150) = 0.1067 = \pm10.7\ \%$.
Sanity note expected: halving the throat from Worked Example 3's 0.30 mm at a comparable absolute tolerance has driven the thrust uncertainty from ±6.7 % to ±10.7 %, and $Re_t$ down by a factor of three toward the regime where Eq. 3.9b's constant is no longer trustworthy.

**N4.** $I_\mathrm{final} = 12/60 = 0.200$ A; $\tau = L/R = 0.045/60 = 0.750$ ms.
$A_p = \tfrac{\pi}{4}(5.0\times10^{-3})^2 = 1.963\times10^{-5}$ m².
Force at $I_\mathrm{final}$: $F = \mu_0N^2I^2A_p/(2g^2) = (4\pi\times10^{-7})(1200)^2(0.200)^2(1.963\times10^{-5})/(2(2.5\times10^{-4})^2) = 11.4$ N.
Force at the 0.15 A pull-in current: $11.4\times(0.15/0.20)^2 = 6.40$ N.
$t_\mathrm{elec} = \tau\ln[1/(1-0.15/0.20)] = 0.750\times\ln 4 = 1.04$ ms.
Holding current at 0.04 mm gap (same force as pull-in): $I_\mathrm{hold} = 0.15(0.04/0.25) = 0.024$ A; take ~0.04 A with margin. Dissipation falls from $I_\mathrm{final}^2R = 2.4$ W to $\sim(0.04)^2(60) = 0.10$ W.
Seat: $A_\mathrm{seat} = \tfrac{\pi}{4}(1.2\times10^{-3})^2 = 1.131\times10^{-6}$ m²; $F_p = (1.131\times10^{-6})(2.5\times10^{6}) = 2.83$ N. Against 6.40 N at pull-in this is a margin of 2.3, and against 11.4 N at full current a margin of 4.0. **Verdict: it will hold, but not generously** — the return-spring preload and any friction still have to come out of the same budget, and 2.3 is thin for a pull-in condition. A good answer says this is a design that needs the spring-force budget written down before it can be accepted, and notes that $t_\mathrm{elec}$ of 1.04 ms plus armature travel gives a total opening delay in the usual 2–4 ms band.

**N5.** $t_\mathrm{eff} = t_\mathrm{cmd} - 4.0 + 1.5 = t_\mathrm{cmd} - 2.5$ ms. With $F = 30$ mN and $I_\mathrm{bit} = F(t_\mathrm{eff} - \tfrac12 t_r + \tfrac12 t_f) = F(t_\mathrm{eff} - 0.30\ \mathrm{ms})$:

| $t_\mathrm{cmd}$ (ms) | $t_\mathrm{eff}$ (ms) | $I_\mathrm{bit}$ (mN·s) | $F t_\mathrm{eff}$ (mN·s) | bias |
|---|---|---|---|---|
| 5 | 2.5 | 0.0660 | 0.0750 | −12.0 % |
| 10 | 7.5 | 0.2160 | 0.2250 | −4.0 % |
| 40 | 37.5 | 1.1160 | 1.1250 | −0.8 % |

The bias is $-\tfrac12(t_r - t_f)/t_\mathrm{eff} = -0.30\ \mathrm{ms}/t_\mathrm{eff}$: negative because the opening ramp is longer than the closing ramp (a fast, clamped drive), and inversely proportional to pulse length, so it is negligible for long pulses and dominant for short ones. Full marks note that this is why the transition times must be *measured*, not assumed symmetric, for any system whose control authority depends on short pulses.

**N6.** Isothermal blowdown: usable fraction $= 1 - p_f/p_i = 1 - 40/250 = 0.840$, i.e. 84 % of the stored gas is usable. Thrust is proportional to $p_c$, hence to tank pressure in a blowdown system, so $F_f/F_i = 40/250 = 0.16$ — a **6.25:1 thrust decay** across the mission.
Temperature swing at fixed fill: $p \propto T$, so $p_\mathrm{hot}/p_\mathrm{cold} = 318.15/258.15 = 1.232$, i.e. +23.2 %, and thrust with it.
**Blowdown dominates by a wide margin** (a factor of 6.25 against a factor of 1.23). The design consequence: the thrust model must be driven by *measured tank pressure*, not by temperature and certainly not by a nominal constant; and the control system must be stable across a 6:1 thrust range. Credit an answer that also notes the two effects are not independent — pressure telemetry captures both at once, which is exactly why you instrument pressure rather than trying to model it.

**N7.** $A_s = \tfrac{\pi}{4}(0.020)^2 = 3.142\times10^{-4}$ m²; $\Gamma(1.4) = 0.6847$; $\sqrt{RT} = \sqrt{(296.8)(290)} = 293.4$ m/s.
$$x = \frac{\dot m\sqrt{RT}}{C_d\pi d_s\Gamma p_\mathrm{in}}$$
At 250 bar: $x = (1.2\times10^{-3})(293.4)/[(0.8)(\pi)(1.5\times10^{-3})(0.6847)(2.5\times10^{7})] = 5.5\ \mu$m, droop $= kx/A_s = (8000)(5.5\times10^{-6})/(3.142\times10^{-4}) = 139$ Pa $= 0.0014$ bar.
At 45 bar: $x = 30.3\ \mu$m, droop $= 772$ Pa $= 0.0077$ bar — **5.6× worse**, exactly the $1/p_\mathrm{in}$ scaling of Eq. 3.6.
$SPE = (d_s/d_\mathrm{diaphragm})^2 = (1.5/20)^2 = 5.63\times10^{-3}$; setpoint shift over a 205 bar inlet decay $= 5.63\times10^{-3}\times205 = 1.15$ bar, or **7.7 % of a 15 bar setpoint**.

Comment expected: the *modelled* droop is negligible (hundredths of a bar) while the SPE shift is 7.7 % — so for this regulator the supply-pressure effect, not droop, is the error that matters, and the fix is a smaller seat, a larger diaphragm, or a second stage. Full marks also note that real regulators droop by 1–5 %, far more than Eq. 3.6 predicts here, because of flow-induced (Bernoulli) force on the poppet, seal friction hysteresis, and diaphragm effective-area change — all of which this idealised balance omits. Reporting "droop is negligible" without that caveat loses marks.

**N8.**
*Helium:* $m = 500/(155\times9.80665) = 0.329$ kg; at 0.04 g/cm³, $V = 8.22$ L — a 250 mm sphere. Tank mass from $PV/W$: $m_\mathrm{tank} = p V/(PV\!/\!W \cdot g_0) = (241\times10^{5})(8.224\times10^{-3})/(26000\times9.80665) = 0.777$ kg. **System: 1.11 kg, 8.2 L.**
*R-236fa:* $m = 500/(40\times9.80665) = 1.275$ kg; at 1.36 g/cm³, $V = 0.937$ L — a 121 mm sphere. Membrane thickness at $p_b = 1.5\times3 = 4.5$ bar: $t = p_br/(2\sigma) = 0.044$ mm, far below any manufacturable gauge, so use the 0.5 mm floor: $m_\mathrm{tank} = A t\rho = 0.063$ kg. **System: 1.34 kg, 0.94 L.**

**Helium is lighter by ~17 %; R-236fa is smaller by a factor of 8.8.** That is the entire cold-gas propellant argument in two numbers, and the answer to "which wins" is "whichever constraint is binding." Full marks require the observation that the R-236fa tank is **thickness-floor limited, not strength limited** — the pressure vessel has essentially infinite structural margin and its mass is set by what you can manufacture — and that this is why low-pressure self-pressurising systems have such favourable tankage: you are not paying for pressure containment at all.

### Engineering reasoning

**R1.** Ranked by likelihood:

1. **External leak downstream of the latch valve is excluded** by the observation that the decay continued unchanged for 60 days with the latch valve closed. That single fact eliminates every thruster seat and everything downstream, and it should be the first thing stated.
2. **External leak on the high-pressure side** — a joint, the fill valve, a boss seal, or the tank itself. *Predicts:* a decay whose rate is proportional to tank pressure (hence approximately exponential, matching the observation), with a mild temperature correlation through gas viscosity and density.
3. **Liner permeation or a microcracked COPV liner.** *Predicts:* essentially the same exponential shape and a stronger temperature correlation, since permeability is Arrhenius in temperature. Distinguishing it from (2) requires the temperature correlation and the absence of a localisable leak.
4. **Latch valve seat leak with a leak further downstream** — a two-fault explanation. *Predicts:* the same curve, and is worth listing precisely so that it is explicitly deprioritised as requiring two failures.
5. **Instrumentation** — a transducer with a drifting zero. *Predicts:* a decay that does *not* correlate with any physical consumption, and would be caught by cross-checking against a temperature-corrected mass estimate or a second sensor. Cheap to check; check it first even though it is unlikely.

*The one ground test:* a **long-duration pressure-decay hold on the fully assembled flight-configuration system at flight pressure, at the maximum predicted temperature, after the vibration environment** — with a helium mass-spectrometer bagged-article test to localise anything it finds. A 400-day time constant corresponds to a leak far too small to see in a two-hour proof-and-leak check; only a long hold, or a helium test with the sensitivity to extrapolate, would have caught it.

**R2.** The 20 ms and 10 ms points are consistent with a linear model: 0.62 and 0.31 mN·s scale as 2:1, implying $t_\mathrm{eff}$ proportional to $t_\mathrm{cmd}$ with a small offset. Extrapolating that line to 5 ms predicts ~0.155 mN·s; the measurement is 0.09 mN·s — 42 % low — and the scatter has gone from 2 % to 22 %.

*Interpretation:* the valve is **no longer reaching full lift** at 5 ms. The command is short enough that the armature is still travelling, or has only partly opened, when the drive turns off; peak flow area is less than the fully-open area, so the steady-state thrust $F$ in the trapezoidal model is simply wrong, and the effective profile is a truncated triangle rather than a trapezoid. The scatter explodes because in the partial-lift regime the delivered impulse depends on armature dynamics — friction, residual magnetism, gas damping, temperature-dependent spring rate — none of which repeat to better than tens of percent.

*What to change to extend the usable range down:* reduce the opening delay and the travel time so that full lift is reached sooner — overdrive the coil (higher drive voltage for the first millisecond), reduce the armature mass, reduce the stroke, and raise the pull-in force margin. Also reduce and characterise command jitter, since at short pulses jitter dominates. If a genuinely smaller impulse bit is required and cannot be reached this way, the honest answers are a **lower-thrust thruster** (smaller throat, so the same on-time delivers less impulse) or a **proportional valve** with a controlled low-flow set-point — not a shorter pulse.

**R3.** *Unit A* — 3×10⁻⁵ scc/s, flat over 100 hours — is a **stable seat leak**: a real, repeatable, characterisable leakage rate somewhat above the best achievable, most likely surface finish or seat-load related. It is a known quantity that goes straight into the leak budget, and if the budget closes at 3×10⁻⁵ scc/s the unit is acceptable as-is.

*Unit B* — starting at 2×10⁻⁶, rising two orders of magnitude over ten hours, dropping back after cycling, then rising again — is **particulate contamination**. The signature is unmistakable: a particle migrates onto the seat and props it open, cycling the valve dislodges it (temporarily), and it comes back because the particle is still in the system. It could alternatively be soft-seat creep, but creep does not recover when you cycle the valve — the recovery is what identifies it as a particle.

*Which to fly:* **Unit A.** Its leak is worse on the best day and vastly better on the worst day, and — decisively — it is *predictable*. Unit B's leak rate is a random variable with a range spanning two orders of magnitude and no upper bound you can defend; you cannot write a leak budget against it. Unit B is not a unit to be flown at all until the contamination source is found (filter integrity, cleanliness of the fill operation, debris from a pyro valve or an assembly step) and the system is flushed or rebuilt. Marks are lost for flying B on the grounds that "its best reading is better."

**R4.** *For blowdown:* the regulator is the least reliable component in the schematic and its characteristic failure — passing full inlet pressure downstream — is a hazard rather than a degradation (§3.3.2). Deleting it removes that failure mode, a set of seats that leak, mass, volume, and the need for a downstream relief path sized for fail-open flow. Δv also closes more easily than it looks: from 200 bar down to a 20 bar cut-off, 90 % of the propellant is usable.

*Against blowdown:* the ±5 % thrust-knowledge requirement. In blowdown, $p_c$ falls with tank pressure, so thrust varies by up to 10:1 across the mission. That is not automatically disqualifying — thrust is *known* if the tank pressure transducer is good — but the accuracy chain now runs through the transducer's calibration, its temperature sensitivity and its drift over four years, plus the $C_d$ and $A_t$ knowledge, all of which must RSS to under 5 % at end of life when the signal is smallest. Additionally, the entire low-pressure section must be rated to 200 bar, which as §5.4 shows makes the thruster valves genuinely hard: a small direct-acting solenoid may not seal against 200 bar on a usable seat diameter at all.

*What would settle it:* (i) the pressure transducer's specified accuracy, temperature coefficient and long-term drift over the actual pressure range, since that is what converts "thrust varies" into "thrust known to ±5 %"; (ii) whether a qualified thruster valve exists that seals at 200 bar with the required response time and leak rate — if not, the argument is over and the answer is a regulator (or a two-tank staged architecture); (iii) whether the ±5 % applies instantaneously or in an averaged sense over a burn, since a slowly varying, well-measured thrust is much easier to satisfy than an instantaneous tolerance. A strong answer identifies (ii) as the potential show-stopper: it is a hardware-availability question, not an analysis question.

**R5.** *Explanation:* the feed pressure of a self-pressurising propellant is its vapour pressure, exponential in temperature (Eq. 3.10). For R-236fa, $\Delta H_\mathrm{vap}/(RT) \approx 9$, so vapour pressure falls roughly 30 % per 10 K of cooling. From +25 °C to 0 °C the feed pressure drops by well over half, and by −15 °C it has fallen below the value the nozzle needs to produce useful choked flow. The behaviour is exactly what the physics predicts; nothing has broken.

*Is it the test or the design?* **It is a design/requirements question, and the test result is valid** — with one important caveat about the test setup. The design question is: what is the minimum predicted tank temperature in flight, and is the heater sized to keep the tank above the temperature at which vapour pressure meets the minimum feed-pressure requirement? If the flight thermal analysis says the tank never goes below +10 °C with the heater on, the module is fine and the −15 °C data point is simply outside the operating range and should be recorded as such.

*The caveat on the test setup:* the tank thermistor reads the **tank wall**, not the **liquid**. In a TVAC transient the wall responds much faster than the liquid mass, so "the thermistor read the commanded temperature" does not establish that the propellant was at that temperature. Vaporisation during a burn also draws latent heat directly out of the liquid, depressing the liquid temperature below the wall's. *How to tell:* instrument the **feed pressure** and compare it against the propellant's published vapour-pressure curve at the indicated temperature. If feed pressure is consistent with the thermistor reading, the thermal state is understood and the issue is purely one of operating range; if feed pressure is systematically below the curve for the indicated temperature, the liquid is colder than the wall, the thermistor is in the wrong place, and both the test data and the flight heater sizing must be reworked around the liquid's thermal mass. Full marks require naming feed pressure as the diagnostic and stating the wall-versus-liquid distinction.

---

## K3. Trade-study reference solution

### T1 — 12U smallsat propulsion module

**Requirements recap:** 120 N·s total impulse, 4 years, $I_\mathrm{bit}\le0.2$ mN·s, 1.5 L envelope for *all* hardware, 2 W orbit-average power, two inhibits against inadvertent thrust, ≤3 % propellant loss to leakage.

**Sizing (all four options).** Mission time 35,064 h.

| | A: GN₂ 300 bar COPV, regulated | B: GN₂ 300 bar printed Ti, blowdown | C: R-236fa self-pressurising | D: n-butane, proportional |
|---|---|---|---|---|
| Assumed realized Isp | 65 s | 65 s | 40 s | 65 s |
| Propellant mass | 0.188 kg | 0.209 kg (90 % usable to 30 bar) | 0.306 kg | 0.188 kg |
| Propellant/tank volume | 0.639 L (real gas, $Z=1.17$) | 0.710 L | 0.225 L liquid, ~0.28 L tank | 0.33 L liquid, ~0.41 L tank |
| Tank shape and bounding box | 107 mm sphere → **1.22 L bounding box** | conformal, ~0.71 L usable | 81 mm sphere or a flat welded module → ~0.54 L box | ~0.42 L |
| Tank mass | 0.075 kg (COPV at $PV/W$ = 26,000 m) | ~0.31 kg (at $PV/W$ ≈ 7,000 m) | 0.028 kg (0.5 mm Al, gauge-limited) | ~0.04 kg |
| Total leak budget | 0.129 scc/h GN₂ | 0.129 scc/h | 0.0386 scc/h R-236fa vapour | ~0.1 scc/h |
| Per-seat budget (50 %/N seats), GHe equivalent | 7.9×10⁻⁶ scc/s | 7.9×10⁻⁶ scc/s | 4.1×10⁻⁶ scc/s | ~1×10⁻⁵ scc/s |
| Storage pressure at the seats | 6 bar (thruster), 300 bar (3 seats) | **300 bar at every seat** | 2.7 bar everywhere | 2.5 bar everywhere |
| $I_\mathrm{bit}$ achievable | ~0.05 mN·s at 1 ms | varies 10:1 with tank pressure | ~0.05 mN·s | continuous, ~μN resolution |
| Heater need | none essential | none essential | mandatory, ~0.5–1 W | mandatory, ~0.5–1 W |
| Continuous valve power | peak-and-hold, ~0 average | peak-and-hold, ~0 average | peak-and-hold, ~0 average | **continuous while thrusting** |

**Recommendation: option C — R-236fa self-pressurising in a welded (or printed) low-pressure module.**

The argument, in the order the constraints bind:

1. **Envelope kills A.** A 0.639 L sphere is 107 mm across; its bounding box alone is 1.22 L of the 1.5 L allocation, before the regulator, relief valve, latch valve, manifold, six thrusters and drive electronics. A cylindrical GN₂ tank packs better but is heavier and still leaves little room. C's propellant occupies 0.225 L and its tank can be a flat welded module rather than a sphere.
2. **The 300 bar seats kill B.** In blowdown from 300 bar every seat in the system, including the thruster valves, sees full tank pressure. Worked Example 4 shows a small direct-acting solenoid producing ~26 N against a 24 N pressure force at 300 bar on a 1 mm seat — no margin. B also gives a 10:1 thrust variation, which multiplies the impulse-bit uncertainty across the mission, and its printed titanium tank costs 0.24 kg more than A's COPV.
3. **Power and sealing kill D.** Proportional valves need continuous drive current while thrusting, against a 2 W budget that must also carry a butane tank heater; and proportional valves do not seal to the leak rate a four-year budget demands, which is why the option carries a latching valve in series — that latch valve then becomes the actual long-term seal and the proportional valve's advantage is confined to control resolution the mission has not asked for ($I_\mathrm{bit}\le0.2$ mN·s is comfortably met by pulsed on/off).
4. **C meets every stated requirement.** 0.28 L tank inside a 1.5 L envelope with room to spare; two inhibits from a latching isolation valve in series with each thruster's own solenoid; $I_\mathrm{bit}\approx0.05$ mN·s, well inside the 0.2 mN·s requirement; no regulator and no COPV, so the two most hazardous components in the schematic are simply absent; and roughly 0.5–1 W of heater inside a 2 W allocation.
5. **The leak budget is the closest call, and it is closest for C on paper** — 4.1×10⁻⁶ scc/s GHe per seat, against 7.9×10⁻⁶ for A. But leak *flow* scales with upstream pressure, and C's seats see 2.7 bar rather than the 6–300 bar of A. A seat qualified at a high test differential will leak roughly two orders of magnitude less at 2.7 bar, so C closes with margin while A must hold a tight spec on three seats at 300 bar. **The answer must state the test pressure alongside the leak spec** — a leak number without a differential pressure is not a specification.

**The single strongest argument against the recommendation:** C carries **0.306 kg of propellant against 0.188 kg for a GN₂ system — 63 % more propellant mass** for the same total impulse, and 0.23 kg more system mass overall. On an 18 kg spacecraft that is 1.3 % of wet mass, which does not decide anything here. **But if the binding constraint were mass rather than volume — a mass-limited rideshare slot, or a mission needing four times the impulse — the trade flips to A**, and a good answer states the crossover explicitly rather than declaring C universally correct. A secondary argument against: R-236fa's vapour pressure changes ~37 % per 10 K (Eq. 3.10), so thrust knowledge depends entirely on tank thermal control and a temperature-corrected thrust model; if the mission needed thrust known to a few percent, that would be real work.

### Rubric

**A strong answer must contain:**
- Propellant mass for each option computed from the stated Isp and 120 N·s, and tank volume computed from stored density — **with real-gas $Z$ applied to the 300 bar nitrogen cases** (ignoring $Z$ over-predicts the load by ~15 % and is a 3-mark error).
- An explicit **bounding-box** check against the 1.5 L envelope, not just a tank-volume check. Recognising that a sphere packs badly is the insight this problem is built around.
- A leak budget in scc/h derived from the 3 % / 4 year requirement, converted to a per-seat number, **and a statement of the test pressure at which that spec must be met.**
- The two-inhibit requirement traced to specific hardware in each architecture.
- Identification that blowdown from 300 bar puts every seat at 300 bar, with the Worked-Example-4 force argument for why that is a problem.
- A recommendation with a stated binding constraint, and a stated condition under which the recommendation would change.

**What loses marks:**
- Choosing on Isp alone. Option A has the best Isp and does not fit.
- Quoting tank volume without a packaging argument.
- Treating "low pressure means low leakage" as self-evident without the mass-loss calculation — the fractional budget is *tighter* for C, and only the pressure-scaling of leak flow rescues it.
- Ignoring the power budget for D, or assuming proportional valves seal like on/off valves.
- Using ideal-gas density for 300 bar nitrogen.
- Any answer that recommends an option without naming the strongest counter-argument to it.

---

## K2. Quiz answers with explanations

**Q1 (8) — (b) 8,000 m.** From C1's derivation, $PV/W = \sigma_\mathrm{tu}/(2FS_u\rho g_0)$ for a membrane sphere: radius and pressure cancel exactly. Doubling the volume doubles both the stored $pV$ and the shell mass.
*(a) 4,000 m* assumes mass scales faster than volume — it does not; both scale as $r^3$.
*(c) 11,300 m* is $8000\sqrt{2}$, the answer if mass scaled as area at constant thickness.
*(d) 16,000 m* assumes mass does not change at all.
Credit a note that in reality the larger tank does slightly better, because bosses and non-membrane regions are a smaller fraction of it — the idealisation errs in the conservative direction.

**Q2 (8) — (d).** Polymer liners in Type IV vessels are specifically designed to accommodate the strain of the overwrap at burst; strain capability is not the objection. (a), (b) and (c) are all genuine reasons spaceflight uses metal-lined Type III: helium permeation over multi-year missions (Eq. 3.4), liner buckling on depressurisation, and the difficulty of making a leak-tight, load-carrying boss interface to a polymer.

**Q3 (12).** Loss $= 0.04\times2.4 = 96.0$ g over $4\times365.25\times24 = 35{,}064$ h $= 2.738\times10^{-3}$ g/h. With $\rho_\mathrm{std}(N_2) = 1.2498\times10^{-3}$ g/cm³:
$$\dot V_\mathrm{total} = 2.19\ \mathrm{scc/h} = 6.08\times10^{-4}\ \mathrm{scc/s}$$
40 % over eight seats: $0.876/8 = 0.1095$ scc/h $= 3.04\times10^{-5}$ scc/s GN₂ each.
GHe equivalent (molecular, ×2.645): $8.05\times10^{-5}$ scc/s GHe.
*Marking:* 4 for the total, 4 for the per-seat allocation, 4 for the correct helium conversion with the regime named. Using 2 instead of 2.645, or converting the wrong way (dividing), loses the last 4.

**Q4 (10).** $SPE = A_\mathrm{seat}/A_s = (1.2/30)^2 = 1.60\times10^{-3}$. Inlet decay $280-40 = 240$ bar, so setpoint shift $= 1.60\times10^{-3}\times240 = 0.384$ bar $= 2.56$ % of a 15 bar setpoint. Full marks require recognising that the areas enter as the *square* of the diameter ratio; using $1.2/30 = 0.04$ directly gives 9.6 bar and is the standard error here.

**Q5 (10).** (i) A valve that **fails to open** is defeated by **parallel** valves. (ii) A **leaking seat** is defeated by **series** valves. (iii) **Both** require **series-parallel (quad)**, four valves. For a two-valve CubeSat: choose **series**. Grounds: inadvertent thrust can tumble or de-orbit the spacecraft and is a range-safety concern before launch, so it must be prevented; loss of thrust usually costs only the propulsive portion of the mission and can often be tolerated. In addition, the two-independent-inhibits requirement typically mandates series regardless. Full marks require both the correct pairing and a stated reason for the asymmetry, not just a preference.

**Q6 (12).** Throat: $\delta A_t/A_t = 2(6/200) = 0.060 = \pm6.0$ %.
Combined: $\sqrt{0.060^2 + 0.015^2 + 0.025^2} = \sqrt{0.0036+0.000225+0.000625} = 0.0667 = \pm6.67$ %.
Variance fraction from the throat: $0.0036/0.004450 = 0.809$, i.e. **81 %**.
*Marking:* 4 for remembering the factor of 2 on the diameter, 4 for the RSS, 4 for the variance fraction (a common error is to quote the ratio of the *uncertainties*, $0.060/0.0667 = 90$ %, rather than of the variances).

**Q7 (10).** $t_\mathrm{eff} = 6.0 - 2.5 + 3.5 = 7.0$ ms; equal rise and fall cancel, so $I_\mathrm{bit} = (0.040)(7.0\times10^{-3}) = 2.8\times10^{-4}$ N·s $= 0.28$ mN·s. Note that $t_\mathrm{eff}$ exceeds $t_\mathrm{cmd}$, because the closing delay is longer than the opening delay — the valve stays open past the end of the command.
As $t_\mathrm{cmd}\to2.5$ ms (the opening delay), the valve is commanded off at almost the same moment it begins to move: it never reaches full lift, the flow area peaks below its open value, and the delivered profile is a truncated triangle rather than a trapezoid. The trapezoidal model assumes the thruster reaches its steady-state thrust $F$; in partial lift it does not, so both $F$ and the profile shape are wrong, and the pulse-to-pulse scatter is governed by armature dynamics rather than by command timing.

**Q8 (10).** $\Delta H_\mathrm{vap}/(RT) = 21000/(8.314\times295) = 8.56$. Linearised: $\Delta p_v/p_v \approx 8.56\times(8/295) = 0.232$, i.e. **+23 %** (the exact exponential form gives +25 %). A stored gas at constant volume: $\Delta p/p = \Delta T/T = 8/295 = 0.027$, i.e. **+2.7 %**. The self-pressurising propellant is **~8.6× more temperature-sensitive**.
Design consequence (one sentence): a self-pressurising system requires active tank thermal control and a temperature-corrected thrust model, because its feed pressure — and therefore its thrust — is an exponential function of tank temperature.

**Q9 (10).** **Total impulse and firing count are not independent**: $220\ \mathrm{N\,s} / 2{,}200{,}000 = 1.0\times10^{-4}$ N·s $= 0.1$ mN·s, exactly the quoted minimum impulse bit. So the "firing count" is total impulse divided by minimum impulse bit — an arithmetic statement of how many minimum-size bits fit in the tank, not a demonstrated cycle-life result. (Strictly, all three of total impulse, firing count and minimum impulse bit are linked; identifying firing count as the derived quantity is what earns the marks.) *What to ask for instead:* the **qualification cycle count** — how many actuations a valve was demonstrated to survive on a life test, with the test pressure, temperature, pulse width and post-test leak rate. Also worth asking: the impulse bit at the pulse widths the mission will actually use, since a duty cycle built on 5 ms pulses will exhaust the propellant in a fifth of the quoted firings.

**Q10 (10).** Torque $= 1.5\times10^{-3}\ \mathrm{N\,m\,s}/10\ \mathrm{s} = 1.5\times10^{-4}$ N·m.
$$\sin\theta_m = \frac{T}{FL} = \frac{1.5\times10^{-4}}{(0.060)(0.20)} = 1.25\times10^{-2} \quad\Rightarrow\quad \theta_m = 0.72^\circ$$
*Two hardware causes:* (i) **thrust magnitude mismatch** between the paired thrusters, from throat-area tolerance ($A_t\propto D_t^2$); (ii) **thrust-vector misalignment**, from throat-to-exit non-concentricity, a throat burr, or the nozzle axis not being normal to its mounting face.
*Which is correctable after the fact:* **(i)**. Measure each flight nozzle's throat, record it, and use the measured $A_t$ in the flight software's thrust model and control allocation; the residual then reduces to the metrology uncertainty. (ii) can be partially compensated only if the misalignment has been measured to better accuracy than the effect you are correcting, and any residual continues to accumulate momentum on every burn. Full marks require the correct arithmetic *and* the distinction between a magnitude error (calibratable) and a direction error (largely not).

---

## K4. Common wrong answers

**Using the ideal gas law for high-pressure nitrogen.** At 300 bar and room temperature $Z\approx1.17$, so $m = pV/RT$ over-predicts the stored propellant by about 15 %. This appears in almost every first attempt at a stored-gas sizing problem and it propagates into total impulse, Δv, and the leak budget's denominator. It reveals a habit of applying an equation without checking its validity range — the same habit that produces $\gamma$ = 1.4 for a saturated refrigerant.

**Forgetting the factor of two between diameter tolerance and area tolerance.** $A_t\propto D_t^2$, so $\delta A_t/A_t = 2\,\delta D_t/D_t$. Answers that report ±3.3 % for a ±10 μm tolerance on a 0.30 mm throat have halved the real thrust uncertainty. It reveals a student computing with symbols rather than thinking about what the symbols measure.

**Reporting the ratio of uncertainties instead of the ratio of variances.** In an RSS combination, "how much does the throat contribute" means $\sigma_i^2/\sigma_\mathrm{total}^2$, not $\sigma_i/\sigma_\mathrm{total}$. The two differ substantially (81 % against 90 % in Q6) and only the variance ratio tells you where to spend effort.

**Converting helium leak rates with a remembered single factor.** The helium-to-nitrogen ratio is 2.65 in molecular flow and 0.89 in viscous flow. Answers that use 2, or that divide when they should multiply, or that convert without naming the regime, all lose marks. The deeper error is not knowing that a leak specification without a *gas*, a *pressure differential* and a *regime* is not a specification.

**Believing droop is the regulator's dominant error.** Working Eq. 3.6 honestly usually returns a droop of hundredths of a bar while the supply-pressure effect is percent-level. Students who compute droop and stop have found the smaller term. The complementary error is the opposite one: reporting "droop is negligible" without noting that real regulators droop by 1–5 % because of flow forces, friction hysteresis and diaphragm effective-area change, none of which the idealised balance contains.

**Treating "the regulator fails safe."** The characteristic regulator failure is to pass full inlet pressure downstream. Answers that treat regulator failure as a loss of function rather than as an over-pressure hazard have missed the reason the component gets so much scrutiny, and will not have sized the relief path correctly (thermal-relief sizing is orders of magnitude too small for a fail-open regulator).

**Choosing propellant on Isp.** MarCO chose 40 s over 70 s and flew to Mars, because the tank, not the exhaust velocity, was the binding constraint. Students who recommend helium or nitrogen for a CubeSat on Isp grounds have optimised the wrong objective — and have usually not computed the tank's bounding box.

**Assuming a vendor's "firings" figure is a life test.** Two vendor lines quoting 880,000 and 1,860,000 firings that both reduce to exactly 5.0×10⁻⁵ N·s per firing are stating total impulse divided by minimum impulse bit. Quoting such a number as evidence of valve cycle life in a design review is a credibility-losing mistake.

**Confusing tank-wall temperature with propellant temperature.** In a self-pressurising system the liquid is the thermal mass and the vaporisation draws latent heat directly from it, so a thermistor on the wall can read the commanded temperature while the propellant is colder. The diagnostic is feed pressure against the vapour-pressure curve, and answers that accept the thermistor reading as proof of the propellant's state have skipped it.

**Assuming the trapezoidal impulse-bit model holds at any pulse width.** It assumes the valve reaches full lift and the thruster reaches steady-state thrust. Below roughly the opening delay it does neither, and both the magnitude and the shape of the model are wrong. Students who extrapolate the linear $I_\mathrm{bit}$-versus-$t_\mathrm{cmd}$ line down to arbitrarily short pulses will over-predict the impulse and badly under-predict the scatter.

**Believing series redundancy makes a system "more reliable" without qualification.** It makes inadvertent thrust less likely and loss of thrust more likely. Reliability statements in this module are meaningless without naming the failure mode; an answer that says "two valves are more reliable than one" has not said anything.
