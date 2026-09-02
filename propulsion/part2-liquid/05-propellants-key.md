# Module 05 — Propellants · Answer key

Solutions to the problems and quiz in
[`05-propellants.md`](05-propellants.md). Numerical answers were computed with
`tools/rocket.py`; small differences from your own arithmetic (±1 in the last
digit) are not errors. Method is graded before number: a correct setup with an
arithmetic slip loses at most 30 % of the marks for that part.

---

## K1. Problem solutions

### Conceptual

**C1 — Cooler flame, higher $I_{sp}$.**

From Eq. 3.4, $c^* = \sqrt{R T_0}/\Gamma(\gamma)$ with $R = R_u/\mathcal{M}$,
so $c^* \propto \sqrt{T_0/\mathcal{M}}$ at fixed $\gamma$. Using the §4.3
chamber states:

- LOX/LH₂: $T_0/\mathcal{M} = 3550/13.5 = 263.0$ K·kmol/kg
- LOX/RP-1: $T_0/\mathcal{M} = 3670/23.3 = 157.5$ K·kmol/kg

Ratio of square roots $= \sqrt{263.0/157.5} = 1.292$. The $\Gamma(\gamma)$
factors differ slightly ($\gamma = 1.19$ vs 1.15, $\Gamma = 0.6467$ vs 0.6417),
which pulls the ratio back to about 1.28; the computed $c^*$ ratio is
$2287/1792 = 1.276$, and the $I_{sp}$ ratio is $442/355 = 1.245$ (the nozzle
term $C_F$ slightly favours the higher-$\gamma$ hydrocarbon, eating a little of
the chamber advantage).

**The molar mass term dominates.** RP-1's flame is 120 K *hotter*, worth
$\sqrt{3670/3550} = 1.017$ — a 1.7 % gain — while hydrogen's molar-mass
advantage is worth $\sqrt{23.3/13.5} = 1.314$, a 31 % gain. Temperature is a
second-order effect here; molar mass is first-order. A strong answer says this
in one sentence and shows the two square roots.

**C2 — Hydrazine's 274.7 K melting point.**

Three system-level consequences:

1. **Heater power becomes a critical, single-fault-tolerant function.** Tanks,
   every metre of line, every valve and every thruster catalyst bed must be
   held above 274.7 K with margin (typically 5–10 K), for ten years, through
   eclipses. That drives solar array size, battery sizing, thermostat and
   heater redundancy, and harness mass — none of which is propulsion hardware,
   all of which exists because of one number.
2. **Freezing is not recoverable, it is destructive.** Hydrazine expands on
   freezing, so a frozen line does not simply thaw — it splits, and the
   spacecraft is lost when the system is next pressurised. There is no
   "recover from a frozen propellant system" contingency worth writing.
3. **Operational constraints on attitude and safe modes.** Any attitude that
   shadows a tank or line for too long is forbidden; the safe mode must
   maintain thermal control, which means safe mode cannot be "everything off."
   This propagates into flight rules and into fault-management design.

How the alternatives address it: **Aerozine-50** blends 50 % UDMH (mp 216 K)
into hydrazine, depressing the mixture's melting point to about 266 K while
retaining most of hydrazine's performance — a freezing-point solution, not a
performance one. **MMH** replaces one hydrogen with a methyl group, dropping
the melting point to 220.7 K, a 54 K margin improvement, at a cost of a few
seconds of $I_{sp}$ (§4.3: 352 s for N₂O₄/N₂H₄ against 341 s for N₂O₄/MMH).
Essentially every long-duration spacecraft has judged those 11 s a bargain.

**C3 — Why the $I_d$ optimum is at higher $r$ than the $I_{sp}$ optimum.**

$I_{sp}(r)$ has an interior maximum somewhere fuel-rich of stoichiometric, and
near that maximum it is *flat* — $dI_{sp}/dr \approx 0$ by definition.
$\rho_b(r)$ from Eq. 3.2 is monotonically increasing in $r$ whenever
$\rho_{ox} > \rho_f$, which is true for every pair in §4.1 except HTP/RP-1-type
cases at extreme ratios. So at $r = r^*_{I_{sp}}$ the product
$I_d = \rho_b I_{sp}$ has derivative
$\rho_b' I_{sp} + \rho_b I_{sp}' = \rho_b' I_{sp} > 0$: increasing $r$ still
increases $I_d$. The maximum of $I_d$ must therefore lie at higher $r$, where
the $I_{sp}$ loss finally balances the density gain. The effect is largest
when the density ratio is largest — which is why LOX/LH₂'s two optima are far
apart and N₂O₄/MMH's are close together.

**C4 — RP-1 → RP-2 to allow +15 % chamber pressure.**

What must be re-qualified:

- **The thermal design**, because $q'' $ scales roughly with $p_c^{0.8}$
  (Bartz), so a 15 % $p_c$ increase is about 12 % more heat flux and a
  correspondingly higher $T_{wc}$ (Eq. 3.6) — the coking margin you gained
  from RP-2 is partly spent immediately.
- **The whole flow path's material compatibility and seal set**, because a
  lower-sulphur fuel is chemically a different fluid at the trace level; also
  the pump, since RP-2's density and viscosity differ marginally.
- **Combustion stability**, because chamber pressure is a stability parameter
  and the acoustic modes and injector pressure drop ratio
  $\Delta p_{inj}/p_c$ both move.
- **The propellant supply and specification chain**: sourcing, acceptance
  testing for sulphur, and storage segregation from RP-1.

What to measure across the test series: jacket $\Delta p$ run over run (the
earliest coking indicator), coolant outlet temperature, wall thermocouples at
the throat, $c^*$ efficiency trend, and a borescope of the channels at fixed
intervals. Insist on **long-duration and repeated-cycle** tests, not a few
short runs: coking is cumulative and a 30-second test will pass a design that
fails at 300 seconds.

A strong answer also says what would *not* need requalification (nozzle
contour, gimbal, TVC) and notes that the honest deliverable is a
$T_{wc}$-versus-exposure-time curve, not a single limit.

**C5 — Why closed expander cycles need hydrogen.**

From Eq. 3.10, the turbine power available is set by the jacket heat pickup:
$\dot m_f c_p \Delta T = \dot Q_{jacket}$, and $P_{turb}$ scales with
$\dot m_f c_p T_{in}$. Hydrogen brings three multiplicative advantages:
$c_p \approx 10$ kJ/(kg·K) (roughly 3× methane, 5× RP-1), no chemical limit on
$T_{in}$ so it can be heated to 500–800 K, and a low molar mass so the turbine
extracts large specific work at modest pressure ratio. A hydrocarbon has
one-third to one-fifth the heat capacity and a hard ceiling on $T_{in}$
(700 K for RP-1, ~1,050 K for methane), so at the same jacket heat it delivers
a small fraction of the pump power needed.

Why methane **expander bleed** is nonetheless plausible: in a bleed cycle only
a fraction of the fuel is heated and it is dumped after the turbine rather
than returned to the chamber, so the turbine can run at a much larger pressure
ratio (it exhausts near ambient rather than above $p_c$). That trades a small
$I_{sp}$ loss for a large power gain and breaks the coupling that caps the
closed cycle. Why a methane **closed** expander at 200 kN is not: jacket heat
scales as chamber area ($\propto D^2$) while required pump power scales with
$\dot m \Delta p \propto A_t p_c$; scale up and the ratio of available to
required power falls. The RL10 sits at 32.8 bar and Vinci — hydrogen, and a
26-year development — reaches only 60 bar and 180 kN. Methane starts with
one-third the heat capacity, so it would hit the same wall at a fraction of
the thrust.

**C6 — Why nitrous oxide is not an orbital-launch oxidiser.**

1. **Performance.** N₂O carries its own nitrogen ballast: only about 36 % of
   its mass is oxygen, and the N₂ diluent raises $\mathcal{M}$ and lowers
   $T_0/\mathcal{M}$. §4.3 gives N₂O/IPA about 298 s against 355 s for
   LOX/RP-1 — a 16 % $I_{sp}$ deficit, which is disqualifying for a launcher.
2. **Density and tank mass.** At 785 kg/m³ it is 31 % less dense than LOX,
   *and* it must be contained at 5.05 MPa at 293 K. A tank sized for 5 MPa is
   a pressure vessel, not a thin-walled propellant tank, so the tank mass
   fraction is far worse than the density alone suggests.
3. **Energetic decomposition.** N₂O decomposes exothermically and can sustain
   a decomposition front, so a bubble collapse, a contaminated valve or a
   valve-closure pressure spike can initiate an event that propagates back
   into the tank. The 2007 Scaled Composites accident during an N₂O flow test
   killed three people.

A fourth acceptable answer: the 309.5 K critical temperature means a warm day
puts the "liquid" above its critical point, changing feed behaviour and
delivered mass flow — unacceptable for a vehicle that must perform identically
in July and January.

**C7 — Mercury-Redstone's reversion to ethanol.**

The argument: Hydyne (60 % UDMH / 40 % DETA) bought roughly 8 % more
performance, which mattered for Jupiter-C's satellite-launch mission where
payload margin was everything. Mercury-Redstone's mission was different — it
carried a person on a suborbital hop with substantial performance margin, so
the extra $I_{sp}$ purchased nothing that the mission needed. Against that,
Hydyne is toxic and carcinogenic, and it would have been loaded, drained,
spilled and vented within metres of a suited astronaut and a ground crew, on a
pad, repeatedly, during an aggressive test campaign. **When performance is not
the binding constraint, accepting less of it to remove a hazard is free.**
The decision is a statement about which requirement is active.

Modern decisions with the same structure: choosing LOX/CH₄ or LOX/RP-1 over
storables for a crewed vehicle's ascent propulsion; choosing "green"
monopropellants (LMP-103S, AF-M315E) over hydrazine on missions with margin;
the Shuttle OMS retaining MMH/MON where restart reliability was the binding
constraint and toxicity was not. Also acceptable: derating a reusable engine's
chamber pressure to buy life (BE-4 at 140 bar).

**C8 — Jacket $\Delta p$ up 8 % over twelve firings.**

*What is happening:* coking. Carbon deposition on the coolant-side wall
reduces the effective flow area and raises roughness, so at constant flow the
pressure drop rises. Eight percent in twelve firings is a clear trend, not
scatter.

*What happens next:* the deposit is an insulator, so the metal temperature
under it rises, which accelerates deposition (§3.6). The $\Delta p$ curve
steepens, the coolant outlet temperature rises, a local hot spot forms, and the
liner burns through — typically without warning in the last test, because the
failure is a runaway.

*Cheapest diagnostic:* borescope the channels. It costs an afternoon and
resolves the question directly. Second cheapest: plot $\Delta p$, coolant
outlet temperature and $c^*$ efficiency against cumulative burn time rather
than against test number — coking correlates with exposure, and a plot against
the wrong abscissa hides it.

*Discriminating alternatives* (a strong answer names them): a partially
blocked inlet manifold or a piece of debris would show as a step change, not a
trend; an instrumentation drift would not be accompanied by rising wall
temperature; a leak would lower, not raise, $\Delta p$.

### Calculation

**N1 — LOX/LH₂ at $r = 5.0$ and 6.5.**

$$\rho_b(5.0) = \frac{6}{\frac{5}{1141.3}+\frac{1}{70.9}}
= \frac{6}{0.0043810+0.0141044} = \frac{6}{0.0184854} = 324.6\ \mathrm{kg/m^3}$$

$$\rho_b(6.5) = \frac{7.5}{\frac{6.5}{1141.3}+\frac{1}{70.9}}
= \frac{7.5}{0.0056953+0.0141044} = \frac{7.5}{0.0197997} = 378.8\ \mathrm{kg/m^3}$$

$I_d(5.0) = 324.6\times445 = 1.444\times10^{5}$ kg·s/m³.
$I_d(6.5) = 378.8\times439 = 1.663\times10^{5}$ kg·s/m³.

A volume-limited stage prefers **$r = 6.5$**, by
$1.663/1.444 = 1.151$, i.e. **+15.1 % in density impulse** — bought with a
1.3 % loss of $I_{sp}$. This is C3 made numerical, and it is why real hydrogen
engines run 5.5–6.1 rather than at the $I_{sp}$ optimum near 4.5–5.

**N2 — $c^*$ and $I_{sp}$ at two area ratios.**

$R = R_u/\mathcal{M} = 8314.46/22.5 = 369.5$ J/(kg·K).

$\Gamma(1.17) = \sqrt{1.17}\,(2/2.17)^{2.17/0.34}
= 1.0817\times(0.92166)^{6.3824} = 1.0817\times0.5942 = 0.6428$.

$c^* = \sqrt{369.5\times3400}/0.6428 = \sqrt{1.2564\times10^{6}}/0.6428
= 1120.9/0.6428 = \mathbf{1744\ m/s}$.

At $\varepsilon = 40$: $M_e = 4.07$, $p_e/p_0 = 2.36\times10^{-3}$,
$C_F = 1.918$, so
$I_{sp} = 1744\times1.918/9.80665 = \mathbf{341.1\ s}$.

At $\varepsilon = 100$: $M_e = 4.65$, $p_e/p_0 = 7.58\times10^{-4}$,
$C_F = 1.995$, so $I_{sp} = \mathbf{354.8\ s}$.

**Comment.** Going from $\varepsilon = 40$ to 100 — 2.5 times the exit area,
and far more than 2.5 times the nozzle mass and length — buys 13.7 s, 4.0 %.
The return is diminishing because $C_F$ approaches its vacuum asymptote
logarithmically: almost all of the pressure-thrust available has already been
recovered by $\varepsilon = 40$. Real upper stages go to $\varepsilon = 240$
(Vinci) only because they have a deployable extension and a mission where 5 s
is worth 400 kg of nozzle.

**N3 — Worked Example 1 at Δv = 3,000 m/s.**

| | LOX/LH₂ | LOX/RP-1 | LOX/CH₄ |
|---|---|---|---|
| $\rho_b$ (kg/m³) | 361.5 | 1,026.3 | 825.2 |
| propellant (kg) | 6,523 | 8,626 | 8,462 |
| ox / fuel volume (m³) | 5.05 / 13.54 | 5.65 / 3.01 | 5.92 / 4.64 |
| total volume (m³) | 18.58 | 8.66 | 10.56 |
| tank mass (kg) | 335 | 104 | 127 |
| **gross mass (kg)** | **13,058** | 14,930 | 14,788 |

LOX/LH₂ still gives the smallest gross mass, now by 12.5 % over kerosene
(against 17 % at Δv = 4,500 m/s) — the hydrogen advantage *shrinks* as Δv
falls, because the exponential term that rewards $I_{sp}$ is weaker. Methane
again lands just under kerosene (−1.0 %). The volume penalty is unchanged in
character: the hydrogen stage is 2.1 times the volume of the kerosene stage.

Full marks require the iteration to be shown and the observation that the
ranking is unchanged but the margins compress.

**N4 — Methane channel.**

$A = 1.2\times10^{-3}\times3.5\times10^{-3} = 4.20\times10^{-6}$ m²;
$D_h = 2(1.2)(3.5)/4.7 = 1.787$ mm.

$G = 0.08/4.20\times10^{-6} = 1.905\times10^{4}$ kg/(m²·s);
$v = G/\rho = 1.905\times10^{4}/210 = 90.7$ m/s.

$Re = GD_h/\mu = 1.905\times10^{4}\times1.787\times10^{-3}/3.0\times10^{-5}
= 1.135\times10^{6}$.

$Pr = c_p\mu/k = 3600\times3.0\times10^{-5}/0.075 = 1.44$.

$h = 0.023(0.075/1.787\times10^{-3})(1.135\times10^{6})^{0.8}(1.44)^{0.4}
= 0.9652\times6.98\times10^{4}\times1.157 = 7.80\times10^{4}$ W/(m²·K).

$\Delta T_{film} = 30\times10^{6}/7.80\times10^{4} = 385$ K, so
$T_{wc} = 250 + 385 = \mathbf{635\ K}$ — **415 K below** the 1,050 K
decomposition limit, and comfortably passing.

**The point of the problem:** compare with Worked Example 2, where RP-1 at a
*lower* heat flux (25 MW/m²) reached 1,070 K against a 700 K limit. Methane
wins twice over — a higher allowable wall temperature *and*, because
$Pr \approx 1.4$ rather than 7.6 and the fluid is supercritical with high
conductivity, a better film coefficient per unit of pumping work. This is the
quantitative core of the methane-for-reuse argument.

Note also that $v = 90.7$ m/s is high; a real design would either use more
channels or accept the pressure drop, and the answer should say so.

**N5 — Maximum heat flux for a 14-day loiter.**

Load $= 70.9\times250 = 17{,}725$ kg. Allowable loss $= 0.05\times17{,}725 =
886$ kg over $14\times86{,}400 = 1.2096\times10^{6}$ s, i.e.
$\dot m_{bo} = 7.33\times10^{-4}$ kg/s.

$\dot Q = \dot m_{bo}h_{fg} = 7.33\times10^{-4}\times4.4896\times10^{5}
= 329$ W. Over 260 m²:

$$q''_{max} = 329/260 = \mathbf{1.27\ W/m^2}$$

**Comment.** That is inside the 0.5–3 W/m² band achievable with good MLI, but
only just, and the number that will actually decide it is *penetrations*:
struts, feedlines, instrumentation leads and the vent line typically carry as
much heat as the whole blanketed area. Fourteen days is roughly the practical
frontier for passive hydrogen storage; beyond it, and certainly for months,
the answer is active cooling (a cryocooler intercepting the heat) or a
different propellant. A strong answer says the requirement is feasible on
paper and marginal in practice, and asks for a penetration heat-leak budget
before agreeing to it.

**N6 — NPSH available.**

Saturated LOX at 90.2 K ($p_v = 101$ kPa, $\rho = 1{,}141.3$ kg/m³):

$$\mathrm{NPSH}_a = \frac{350{,}000-101{,}000-40{,}000}{1141.3\times9.80665}
+ 4.0\times\frac{3g_0}{g_0}
= \frac{209{,}000}{11{,}193} + 12.0 = 18.7 + 12.0 = \mathbf{30.7\ m}$$

Subcooled to 80 K: from §4.2 by interpolation $p_v \approx 30$ kPa, and
$\rho \approx 1{,}190$ kg/m³:

$$\mathrm{NPSH}_a = \frac{350{,}000-30{,}000-40{,}000}{1190\times9.80665} + 12.0
= 24.0 + 12.0 = \mathbf{36.0\ m}$$

**Comment.** Subcooling by 10 K adds 5.3 m of NPSH — a 17 % improvement — and
it does so *without* raising tank pressure, which means thinner tank walls and
less pressurant. Equivalently, you could hold the same margin at a tank
pressure about 70 kPa lower. That, plus the 4 % density gain, is why
densification is worth its ground-equipment cost. Note also that 12 of the
30.7 m come from acceleration head: NPSH margin at $T$ = 0, before the vehicle
accelerates, is a completely different and much harder number, which is why
start transients are where pumps cavitate.

**N7 — Methane vapour pressure.**

Interpolating §4.2 between 139.9 K (0.639 MPa) and 149.9 K (1.036 MPa):

$$T(0.8\ \mathrm{MPa}) = 139.9 + \frac{0.800-0.639}{1.036-0.639}\times10.0
= 139.9 + 4.1 = \mathbf{144.0\ K}$$

Between 130.2 K (0.371 MPa) and 139.9 K (0.639 MPa):

$$T(0.6\ \mathrm{MPa}) = 130.2 + \frac{0.600-0.371}{0.639-0.371}\times9.7
= 130.2 + 8.3 = \mathbf{138.5\ K}$$

So with a 0.6 MPa limit the propellant may warm to 138.5 K before venting is
mandatory. Sensible heat available from NBP:

$$q = c_p\Delta T \approx 3.48\times(138.5-111.67) = 93\ \mathrm{kJ/kg}$$

(using the NBP $c_p$; $c_p$ rises with temperature, so 95–100 kJ/kg is a
better estimate and either is acceptable).

**Comment.** 93 kJ/kg is about 18 % of methane's 510 kJ/kg latent heat, so a
tank loaded at NBP and locked up can absorb roughly a fifth of a boil-off's
worth of heat before it must vent — several hours of pad hold at realistic
heat leaks. Load it subcooled at 100 K and the sensible margin nearly doubles.
This is exactly why launch vehicles load subcooled and why the "no-vent hold"
duration is a propellant-conditioning question, not an insulation question.

**N8 — Storable tank sizing and cold soak.**

$m_{ox} = 12{,}000\times1.65/2.65 = 7{,}472$ kg;
$m_{f} = 12{,}000/2.65 = 4{,}528$ kg.

Liquid volumes at 293 K: $V_{ox} = 7472/1443 = 5.177$ m³;
$V_{f} = 4528/875 = 5.175$ m³.

With 4 % ullage, tank volumes are $\mathbf{5.384\ m^3}$ and
$\mathbf{5.382\ m^3}$ — **essentially identical**. That is not a coincidence
of this problem: N₂O₄/MMH at $r \approx 1.6$–1.7 gives near-equal tank volumes,
which is why storable spacecraft so often have two identical tanks. It is a
real and underrated advantage of the combination (common tooling, common
qualification, symmetric mass properties).

Cold soak to 268 K: $\Delta V/V = \beta\Delta T = 1.1\times10^{-3}\times(-25)
= -2.75\ \%$. Liquid volumes fall to 5.035 m³ and 5.033 m³; ullage grows from
4.0 % to **6.5 %** of tank volume, and ullage pressure falls accordingly in a
locked-up tank (compounded by the temperature drop itself).

**Does anything freeze?** MMH melts at 220.7 K — 47 K of margin, no issue.
**N₂O₄ melts at 261.9 K — only 6.1 K below the soak temperature.** Nothing
freezes at 268 K, but the margin is thin enough that a colder attitude, a
heater failure, or a local cold spot at a valve or a line clamp will freeze the
oxidiser. This is precisely why flight systems use **MON-3** (freezing point
depressed a few kelvin) or **MON-25** (≈218 K) rather than pure N₂O₄, and why
oxidiser lines carry heaters. A full-credit answer names the 6.1 K margin and
draws that conclusion.

### Engineering reasoning

**R1 — 500 kN, $I_{sp} > 450$ s, six restarts, nine-month coast.**

*Which requirements conflict.* $I_{sp} > 450$ s at any realistic area ratio
forces LOX/LH₂ (§4.3: the next-best pair is 100 s short). A nine-month coast
forces either zero boil-off or a non-cryogenic propellant. Worked Example 3
gives the scale: a well-insulated hydrogen tank loses roughly 0.65 %/day, so
nine months is on the order of 100 % of the load. Those two requirements are
directly incompatible with passive storage. Separately, 500 kN in a hydrogen
engine rules out a closed expander cycle (§3.9; Vinci, the largest ever flown,
is 180 kN), so the engine must be a gas generator or staged combustion, which
costs $I_{sp}$ and makes 450 s harder still.

*Two least-bad architectures:*

1. **LOX/LH₂ with active zero-boil-off cooling.** A reverse-turbo-Brayton or
   Stirling cryocooler intercepting the tank heat leak, sized from the N5
   calculation. Meets $I_{sp}$ and restart; costs a power system (hundreds of
   watts to kilowatts continuously for nine months), development risk, and
   mass that partly offsets the $I_{sp}$ advantage. This is the honest
   high-performance answer and it is an active technology area, not flight
   heritage.
2. **Relax $I_{sp}$ to about 360 s and fly LOX/CH₄, or to 340 s and fly
   storables.** Methane's boil-off is 0.096 %/day in the same tank (Worked
   Example 3) — still 26 % over nine months, so it needs modest active cooling
   or a generous load margin, but the problem is an order of magnitude
   smaller. Storables solve the coast requirement completely and give
   unlimited restarts with no igniter, at 341 s.

*What to tell the customer:* the 450 s and the nine months are the two
requirements in conflict; ask which is a real mission need. In almost every
case the coast is the hard requirement and the $I_{sp}$ number is a
preference inherited from a previous design.

**R2 — Falling $c^*$, rising jacket $\Delta p$, rising wall temperature.**

*Diagnosis.* All three signatures are consistent with **coking in the cooling
channels**, and the three together are close to diagnostic: carbon deposition
reduces flow area (raising $\Delta p$) and insulates the wall (raising the
throat wall thermocouple). The $c^*$ efficiency decline is a second-order
consequence — a fouled jacket delivers fuel to the injector at a different
temperature and, if a film-cooling circuit shares the manifold, redistributes
flow toward the film and away from the core, degrading mixing.

*Alternative hypotheses to exclude:* injector orifice erosion or partial
blockage (would move $c^*$ and injector $\Delta p$ but not jacket $\Delta p$);
a throat erosion problem (would drop $p_c$ at fixed flow and change the
$c^*$ calculation's area term); instrumentation drift (would not produce three
consistent trends).

*Three measurements before the next firing:*

1. **Borescope every channel** and photograph, with particular attention to
   the throat region — direct evidence, one afternoon.
2. **Cold-flow the jacket** at a reference flow rate and compare $\Delta p$
   against the as-built baseline. This separates a genuine area reduction from
   a hot-fire property effect, and it is quantitative: 12 % $\Delta p$ at
   constant flow implies roughly 3 % area reduction.
3. **Re-verify the throat area and the $p_c$ instrumentation**, so that the
   $c^*$ trend is known to be real. $c^*$ is computed from $p_c A_t/\dot m$;
   if $A_t$ has changed by erosion, the "efficiency" decline is partly an
   artefact.

A strong answer adds: replot everything against *cumulative burn seconds*, not
test number, and stop testing until the borescope result is in. The cost of
one more test is an engine.

**R3 — LH₂ at 460 s versus CH₄ at 380 s, 40 % longer stage, 6-hour coast.**

*For hydrogen.* 80 s of $I_{sp}$ is 21 %, and it enters the rocket equation
exponentially: for a 4 km/s stage the propellant mass ratio drops from
$e^{4000/(380\times9.807)} = 2.94$ to $e^{4000/(460\times9.807)} = 2.43$ — a
26 % reduction in propellant mass for the same burnout mass. Worked Example 1
shows the tank-mass penalty does not come close to eating that at upper-stage
Δv: the break-even hydrogen tankage factor is 48 kg/m³ against 12 for a
kerosene-class stage.

*For methane.* The 40 % length is not free even though its *mass* is small: it
buys bending-mode problems, a longer interstage, more drag if it flies inside
the aerodynamic envelope, and a transport and integration cost. The 6-hour
coast is the real issue — from Worked Example 3, hydrogen at ~0.65 %/day loses
about 0.16 % of load in 6 hours plus whatever the pad hold cost, while methane
loses 0.024 %. Both are manageable for 6 hours, so the coast alone does not
settle it. Methane also shares a cryogenic regime with LOX, needs no helium,
and if the first stage is already methalox the vehicle has one propellant
supply chain instead of two.

*What single piece of data settles it:* **the mass of the hydrogen stage's
tank and insulation per unit volume — the actual $k_v$, from a real structural
design rather than a factor.** Everything else in the argument is bounded and
known; that number decides whether the 26 % propellant saving survives to the
gross-mass line. Acceptable alternative answers: the vehicle's payload
sensitivity to stage length (a real trajectory and structural analysis), or
whether the first stage is already methalox — commonality can outweigh 80 s.

**R4 — N₂O/IPA cubesat thruster claims.**

- **"Non-toxic."** True in the occupational-health sense: neither fluid needs
  SCAPE, and that is a genuine advantage over hydrazine. But non-toxic is not
  the same as safe. N₂O is an energetic material capable of self-sustained
  exothermic decomposition; the hazard is an explosion, not a poisoning. The
  claim is true but answers the wrong question.
- **"Self-pressurising."** True, and it is the strongest of the three claims:
  5.05 MPa vapour pressure at 293 K (§4.1) removes the pressurant system
  entirely. But it also *couples* feed pressure to temperature: as the tank
  cools during blowdown the pressure falls and thrust and mixture ratio drift.
  Ask for the thrust-versus-time and mixture-ratio-versus-time curves over the
  full qualification temperature range, not at 293 K only. And note that above
  309.5 K there is no liquid at all — the propellant management changes
  character on a warm day.
- **"No ignition system needed."** False as stated. N₂O/IPA is **not
  hypergolic**. What the vendor probably means is catalytic or thermal
  decomposition of the N₂O producing a hot oxidising stream that lights the
  alcohol — an architecture analogous to HTP/kerosene (§6.10). That is a real
  technique, but it is an ignition system: it has a catalyst bed or a preheater
  with a life, a cold-start limit, and a failure mode. Demand the start
  sequence, the number of demonstrated cold starts, and the catalyst-bed life
  data.

*Qualification requirements before flying it near a crewed vehicle:* a
decomposition-propagation and detonation-arrest assessment of the feed system
(flame arrestors, no dead-ended high-pressure volumes, valve-closure water
hammer analysis); pressure-vessel qualification to the crewed-vehicle
visiting-vehicle standard, including a burst test with margin, since this is a
5 MPa tank; contamination control appropriate to a decomposable propellant;
thermal qualification spanning the critical temperature; and a demonstrated
inhibit architecture such that no single fault can pressurise or ignite the
system. The governing question a reviewer will ask is: *what happens if this
tank decomposes while berthed?* Have the answer.

### Mini trade study

See **K3** for the reference solution and rubric.

---

## K2. Quiz answers with explanations

**Q1 (5).** Highest density impulse: **N₂O₄/N₂H₄ at 425,000 kg·s/m³**.
Highest specific impulse: **LF₂/LH₂ at 487 s** — and if the question is read
as restricted to flyable pairs, **LOX/LH₂ at 442 s**. Either reading earns
full marks if stated; naming LOX/RP-1 (364,000) as the density-impulse leader
loses 2 of 5, since it is the highest among *flown launcher* pairs but not the
table maximum.

**Q2 (10).** **(b).** $c^* \propto \sqrt{T_0/\mathcal{M}}$ (Eq. 3.4), and near
stoichiometric the reduction in $\mathcal{M}$ from unburned fuel species
outweighs the loss of $T_0$; dissociation further blunts the temperature gain.
(a) is irrelevant — mixture ratio is not chosen on unit cost. (c) is a real
secondary effect but not the primary reason, and it is not universally true.
(d) is backwards in its logic: protecting the injector face is a *consequence*
of running fuel-rich, and a reason engineers like it, but the performance
optimum exists independently of the hardware.

**Q3 (10).** $R = 8314.46/21.5 = 386.7$ J/(kg·K).
$\Gamma(1.16) = \sqrt{1.16}(2/2.16)^{2.16/0.32} = 1.0770\times(0.92593)^{6.75}
= 1.0770\times0.5949 = 0.6407$.
$c^* = \sqrt{386.7\times3560}/0.6407 = \sqrt{1.3767\times10^{6}}/0.6407
= 1173.3/0.6407 = \mathbf{1{,}831\ m/s}$.
Units: $[\sqrt{\mathrm{J/(kg\,K)}\times\mathrm{K}}] =
[\sqrt{\mathrm{J/kg}}] = [\sqrt{\mathrm{m^2/s^2}}] = \mathrm{m/s}$; $\Gamma$ is
dimensionless. Deduct 3 marks for a missing or wrong unit chain even if the
number is right — this is the one place students routinely lose track.

**Q4 (10).** From §4.2, methane's saturation pressure at 149.9 K is
**1.036 MPa**, which exceeds the 1.0 MPa setting, so **the valve will lift**.
The saturation temperature at exactly 1.0 MPa is, by interpolation between
139.9 K (0.639 MPa) and 149.9 K (1.036 MPa),
$T = 139.9 + (0.361/0.397)\times10 = 149.0$ K. The tank at 150 K is therefore
**about 1 K above** the lift temperature: the margin is $-1$ K, i.e. the tank
is already venting. Full marks require the sign of the margin to be stated
correctly.

**Q5 (10).** **(b).** Titanium is impact-sensitive in oxygen: a particle
impact or rub releases enough local energy to ignite the metal, which then
burns in the oxygen it is immersed in. (a) is false — titanium alloys actually
retain good properties at cryogenic temperature, which is exactly why people
keep proposing them and why the prohibition must be taught explicitly. (c) is
nonsense; oxygen does not decompose. (d) is a fabrication issue, not the
reason for the prohibition, and dissimilar joints are routinely made by other
means.

**Q6 (15).** $G = 0.20/5.5\times10^{-6} = 3.636\times10^{4}$ kg/(m²·s)
($v \approx 50$ m/s at $\rho = 720$ kg/m³).
$Re = 3.636\times10^{4}\times2.0\times10^{-3}/3.5\times10^{-4}
= 2.078\times10^{5}$.
$Pr = 2400\times3.5\times10^{-4}/0.11 = 7.64$.
$h = 0.023(0.11/0.002)(2.078\times10^{5})^{0.8}(7.64)^{0.4}
= 1.265\times1.794\times10^{4}\times2.255 = 5.12\times10^{4}$ W/(m²·K).
$\Delta T_{film} = 18\times10^{6}/5.12\times10^{4} = 352$ K.
$T_{wc} = 420 + 352 = \mathbf{772\ K}$.

**The design fails** a 700 K limit, by 72 K. Marks are for the correct
conclusion *and* for noticing it fails by a margin comparable to the ±20–25 %
accuracy of the Dittus-Boelter correlation itself — the honest engineering
answer is "fails, and the uncertainty is not large enough to save it; redesign
or add film cooling," not "fails by 72 K, therefore reduce the flux by 72 K's
worth."

**Q7 (10).** The RL10 is a **closed expander**: its turbine is driven only by
hydrogen heated in the chamber wall, so the available pump power is capped by
the jacket heat pickup, which scales with chamber surface area while the
required power scales with $p_c$ and throat area (Eq. 3.10). Raising $p_c$
therefore reduces the heat available per unit of power needed, and the cycle
closes at about 33 bar. The RS-25 is **staged combustion**: it burns
propellant in two preburners, so turbine power is limited by what the
turbomachinery and materials can take, not by a heat balance — which is how it
reaches 206 bar, at the cost of preburners, four pumps and a controller.

**Q8 (10).** Two strongest arguments against:

1. **Boil-off over 400 days.** Worked Example 3 gives ~0.096 %/day for methane
   in a well-insulated 100 m³ tank; a small spacecraft tank has a far worse
   surface-to-volume ratio, so the real figure is worse. Four hundred days of
   passive storage is not credible without active cooling, and a cryocooler on
   a spacecraft is power, mass, and a single-point failure with a 400-day
   duty cycle.
2. **Ignition after 400 days.** Storables ignite on contact with nothing to
   fail. A methalox thruster needs a torch or spark igniter that must work on
   the first try after 400 days of cold-soaked dormancy, plus a
   propellant-conditioning sequence, plus settling. Every one of those is a new
   failure mode on the mission-critical burn.

What would convince: flight-demonstrated zero-boil-off performance at this
tank scale with a measured, not modelled, heat-leak budget including
penetrations; and a qualification campaign showing igniter starts after
representative dormancy at the coldest predicted temperature, with statistical
margin. Also acceptable: a mission redesign that performs the burn early or
tolerates a large propellant residual.

**Q9 (10).** $\dot m_{bo} = \dot Q/h_{fg} = 300/2.13\times10^{5}
= 1.408\times10^{-3}$ kg/s $= \mathbf{121.7\ kg/day}$.
Load $= 1141.3\times40 = 45{,}652$ kg, so the loss is
$121.7/45{,}652 = \mathbf{0.267\ \%/day}$. Compare with the LH₂ figure of
0.65 %/day in Worked Example 3 at a *lower* heat leak — the contrast is the
lesson, not the arithmetic.

**Q10 (10).** *Case for RP-1:* qualified, widely available, cheaper, with an
enormous body of engine experience and no supply risk; a fuel-film-cooled
engine at 120 bar can be made to work with it, as the flight record shows.
*Case for RP-2:* sulphur reduced by roughly an order of magnitude raises the
coking-limited wall temperature by perhaps 50–100 K, which at 120 bar with
film cooling translates directly into either less film cooling (recovering
$I_{sp}$ and $c^*$ efficiency, since film coolant is fuel that does not burn
properly) or more margin on liner life between overhauls — and for a
**reusable** engine, life between overhauls is the product.
*Cost accepted:* higher propellant price, a narrower supplier base, and a
requalification of the fuel-side flow path.
*Recommendation:* **RP-2**, on the grounds that the driver stated in the
question is reuse, and coking is the life-limiting mechanism for a reusable
hydrocarbon engine — but conditional on a supply-chain assessment, because a
booster programme that cannot buy its fuel has a worse problem than coking.
Full marks require naming reuse as the deciding constraint and conditioning
the recommendation on supply. An unconditional answer either way loses 3.

---

## K3. Trade-study reference solution (T1)

**Recommendation: (b) LOX/CH₄.**

### The constraints, and what each eliminates

| constraint | effect |
|---|---|
| no SCAPE-level toxic handling | eliminates nothing in the candidate list — all four are acceptable — but it is the reason no storable option appears |
| propellant cost < 5 % of flight cost | strongly disfavours (c) LH₂ (liquefaction cost, boil-off losses on every fill) and mildly disfavours (d) HTP (a specialty chemical with a limited supplier base) |
| 4-hour fuelled hold | hurts (c) badly: at ~0.65 %/day and a small vehicle's poor surface-to-volume ratio, a hydrogen vehicle needs topping through the hold and a replenish system. (a), (b) and (d) hold comfortably |
| 24-h turnaround, no engine teardown | **decides it.** (a) RP-1 cokes and sooths the chamber, injector face and (in a gas-generator engine) the turbine; carbon inspection and cleaning is exactly the teardown the requirement forbids. (d) HTP demands catalyst-pack condition checks and scrupulous cleanliness between flights |
| in-flight restart | favours (b) and (c) (spark torch igniters, unlimited restarts) and (d) (catalytic, restart is inherent). (a) needs TEA-TEB slugs, a consumable to be reloaded each flight — another turnaround task |
| 100 km apogee, 1,000 kg payload | Δv is modest (~1.6–2.0 km/s including losses), so the mission is **not** $I_{sp}$-driven; §4.3 differences of 40 s matter far less than they would on an orbital stage |

### Quantitative support

- **Performance is not binding.** From §4.3, (a) 355 s, (b) 360 s, (c) 442 s,
  (d) 313 s. Worked Example 1's method at a suborbital Δv shows gross-mass
  differences of a few percent between (a) and (b), and even hydrogen's
  advantage is modest at low Δv — the break-even tankage factor table shows the
  hydrogen case is *most* forgiving at low Δv, but that assumes the tank is the
  only penalty, and for a reusable vehicle it is not.
- **Coking is binding.** Worked Example 2: RP-1 at 25 MW/m² and realistic
  channel velocity reaches $T_{wc} \approx 1{,}070$ K against a ~700 K limit,
  and even at 81 m/s it is marginal. Problem N4: methane at a *higher* flux,
  30 MW/m², reaches 635 K against a ~1,050 K limit. For an engine that must fly
  again tomorrow without being opened, that is the whole argument.
- **Ground system is binding on cost.** Methane is conventional LNG practice:
  existing industrial base, existing codes, existing trained people, and one
  cryogenic temperature regime shared with the LOX side (111.7 K versus
  90.2 K), which allows common insulation practice and autogenous
  pressurisation of both tanks — no helium supply at a site with no existing
  infrastructure.

### What is being given up

- About 82 s of $I_{sp}$ against hydrogen, and therefore payload margin — real,
  but purchased back by a shorter vehicle, a simpler pad, and no boil-off
  management during holds.
- Lower bulk density than kerosene (825 versus 1,026 kg/m³), so tanks are 24 %
  larger and the vehicle longer. Accepted.
- A shorter propulsion heritage than kerosene, and therefore more development
  risk in the engine itself.

### The single cheapest falsifying test

**A repeated-cycle hot-fire campaign at flight duty cycle with borescope
inspection between runs, instrumented for jacket $\Delta p$ and throat wall
temperature.** If the methane engine shows a rising $\Delta p$ trend or wall
deposits over 20 flight-equivalent cycles, the entire "no teardown"
justification collapses and the recommendation must be revisited. This costs a
few weeks on an existing test stand and tests the actual decisive assumption,
which is what a falsifying test should do.

### Rubric

| element | marks |
|---|---|
| identifies that the mission is **not** $I_{sp}$-driven and says why (low Δv) | 15 |
| uses coking / turnaround as the deciding constraint, with the WE2 vs N4 numbers | 25 |
| screens all four candidates against every stated constraint, not just the winner | 15 |
| quantitative support: at least two numbers taken from §4.3 / the worked examples and used correctly | 15 |
| states explicitly what is given up | 10 |
| names a falsifying test that tests the *deciding* assumption | 10 |
| clear recommendation, stated once, with the constraint that decides it named | 10 |

**A strong answer** may recommend (a) LOX/RP-1 and still score in the 80s, if
it argues that the engine will be film-cooled at low chamber pressure, that
coking is manageable at suborbital duty cycles, and that cost and heritage
dominate — provided it names the coking risk explicitly and proposes the same
falsifying test. Propellant selection has more than one defensible answer;
what is not defensible is failing to name the binding constraint.

**Marks are lost for:** ranking the candidates on $I_{sp}$ alone (−25);
recommending (c) LH₂ without addressing the 4-hour hold and the cost
constraint (−20); asserting that HTP is "non-toxic and therefore safe" without
noting cleanliness and decomposition (−10); giving no quantitative support at
all (−30); and hedging to two recommendations (−10 — a trade study that does
not decide has not been done).

---

## K4. Common wrong answers, and what they reveal

**"LOX/LH₂ because it has the best $I_{sp}$" as an answer to any selection
question.** Reveals that the student has learned one equation and no systems
engineering. The rocket equation is necessary and nowhere near sufficient;
volume, boil-off, coast time, restart, toxicity and ground infrastructure
routinely dominate. In an interview this answer is disqualifying at
Level 3 and it is the single most common failure mode on this module.

**Quoting a hotter flame as the reason hydrogen performs well.** Reveals a
misreading of Eq. 3.4 — the student has seen $T_0$ under the square root and
stopped there. The correct instinct is that $c^*$ depends on the *ratio*
$T_0/\mathcal{M}$, and for hydrogen the denominator is doing the work. It is
also factually wrong: LOX/LH₂ at flight mixture ratio is the cooler flame.

**Using NBP densities for a densified propellant, or handbook 293 K densities
for a cold-soaked storable.** Reveals that the student is copying a table
rather than thinking about the tank. A 10 % LOX density error is a 10 % tank
length error, and stage length is a structural, aerodynamic and facility
constraint. Always ask "at what temperature?" before writing down a density.

**Checking coking against the coolant's *bulk* temperature.** Reveals that
Eq. 3.6 has been read as a heat balance rather than as a wall-temperature
calculation. The bulk fuel in Worked Example 2 is a benign 400 K; the *wall*
is 1,070 K. Coking is a wall phenomenon, and every propellant-coolant limit in
the literature is quoted as a wall temperature for exactly this reason.

**Treating boil-off in kg/day as the figure of merit.** Reveals a missing
normalisation. LOX boils off more kilograms per day than LH₂ in the same tank
and is a far better storage fluid; what matters is percentage of load per day,
or equivalently boil-off measured against the mission's propellant budget.

**Assuming hypergolic means "always ignites."** Reveals no awareness of
ignition delay (Eq. 3.5). Hypergolic pairs ignite reliably *within their
qualified temperature range*; below it, the delay grows, propellant
accumulates, and the "reliable" ignition becomes a detonation that removes the
injector. Hard starts in cold-soaked hypergolic systems are a recurring,
documented failure mode, not a theoretical concern.

**Calling storable propulsion obsolete.** Reveals that the student has read
about launch vehicles and not about spacecraft. MMH/MON flies today. The
correct criticism of storables is regulatory and occupational, not technical,
and a student who says "REACH" rather than "old-fashioned" is signalling that
they read current literature.

**Presenting a stage-mass optimisation as a propellant decision.** Reveals the
trap Worked Example 1 was built to spring. The simple model prefers hydrogen
at every Δv, which contradicts observed practice; a student who reports the
model's answer without noticing the contradiction has not checked their result
against the world. The missing terms — engine thrust-to-weight, stage length,
gravity loss, ground infrastructure, reuse — are where the real decision
lives.

**Titanium in a LOX line, or an elastomer O-ring in a cryogenic joint, in a
design exercise.** Reveals that compatibility is being treated as trivia
rather than as design constraint. These are not obscure rules; they are the
first things a review board checks, and they have destroyed hardware.

**Quoting a single coking-limit temperature to three significant figures.**
Reveals over-confidence in a number that genuinely spreads from ~600 K to
above 800 K depending on fuel grade, wall material, exposure time and
residence time. The right answer states a design value, states the range, and
says it must be confirmed by long-duration test with channel inspection.
