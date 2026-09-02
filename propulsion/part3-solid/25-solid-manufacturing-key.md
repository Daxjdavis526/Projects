# Module 25 — Solid rocket manufacturing — ANSWER KEY

Solutions to the problems and quiz in
[`25-solid-manufacturing.md`](25-solid-manufacturing.md). Do not read this until
you have attempted the problems. Equation numbers refer to the module.

---

## K1. Problem solutions

### Conceptual

**C1 — The three buried interfaces.**

| interface | inspectable by | principal blind spot |
|---|---|---|
| case ↔ insulation | ultrasonic pulse-echo from outside the case; flash/lock-in thermography if the case is thin and composite | UT needs couplant and full-surface access; thermography is limited to a few mm of depth, so a thick composite case defeats it. Both are near-blind at the dome knuckles where geometry is complex and where the bond is most loaded. |
| insulation ↔ liner | ultrasonics from outside (the return is the second interface behind the first, so the case/insulation bond must be good enough to transmit) | if the *first* interface is degraded, the second cannot be interrogated — you get a shadow. Also, an ultrasonic scan cannot distinguish a true unbond from a kissing bond (surfaces in contact but not adhered), which is the failure mode most likely to be produced by a contaminated surface. |
| liner ↔ propellant | ultrasonics from outside, plus radiography *only* if the gap is wide enough and favourably oriented | the defect is planar and normal to the radiographic beam, which is the worst case for Eq. 3.4 (contrast ∝ material removed *along* the beam). A tight unbond with zero gap gives essentially no radiographic contrast at all. |

The grader wants to see the physics, not the table: an unbond is a planar
impedance discontinuity, which is what UT is for and what radiography is worst
at, and all three interfaces lie under the grain so no direct inspection is
possible.

**C2 — Mixer scaling.** Mixing quality is set by the total strain imposed on the
material, i.e. roughly by (shear rate × time) with complete bowl turnover. Blade
tip speed sets the shear rate; bowl volume divided by the swept volume per
revolution sets the turnover time. Scale the bowl up geometrically and hold tip
speed constant and the turnover time grows with the linear dimension, so mix
time grows. Hold mix time constant instead and tip speed must rise, so the
viscous dissipation per unit volume rises.

Now the heat balance. Dissipated power scales with volume, $\propto L^3$. Heat
removal through a jacketed bowl scales with wall area, $\propto L^2$. So the
temperature rise for a fixed mix scales as $L$, and beyond some size the mix
becomes effectively adiabatic. For a material whose oxidiser is an energetic
salt and whose binder cure rate is strongly temperature-dependent, that is
unacceptable in two independent ways — hazard, and loss of control of the
pot life. Hence a practical ceiling on batch size of order a few cubic metres,
and hence Eq. 3.2: a large motor's propellant must come from several mixers run
in parallel within one pot life.

**C3 — Cure hotter, cure faster.** The physical argument is Eq. 3.3. At gelation
the grain is stress-free at the cure temperature, so the cure temperature *is*
the stress-free temperature $T_{sf}$, and the strain the grain must survive at
its cold qualification limit is proportional to $\Delta T = T_{sf} - T_{\rm use}$.
Raising cure temperature by 20 K raises $\Delta T$ by 20 K and raises bore hoop
strain in direct proportion. The degraded quantity is **grain structural margin
at the cold end of the qualification envelope** — strain capability divided by
demanded strain — and it does not appear at ambient, in the cure record, in the
strand data or in the NDE. It appears at the cold-conditioned static test, or
in the field ten years later after aging has taken another slice off strain
capability (§3.11). The colleague's "the chemistry doesn't care" is true and
irrelevant: the mechanics care.

A complete answer also notes that the arithmetic is optimistic anyway: cure time
is limited by conduction into a thick web ($\alpha_{\rm th}\sim10^{-7}$ m²/s),
so raising the oven temperature raises the *surface* rate first and produces a
larger cure gradient, which is itself a defect mechanism at the bondline.

**C4 — Radiography vs ultrasonics on an unbond.** Radiography measures the line
integral of attenuation along the beam (Eq. 3.4); contrast is $\mu\Delta x$
where $\Delta x$ is the *length of material removed along the beam*. An unbond is
a planar gap of perhaps tens of micrometres lying on a cylindrical surface, so
for a beam crossing it at normal incidence $\Delta x \approx 0$ and the contrast
is zero regardless of how large the unbond is in area. Ultrasonics measures a
reflection at an impedance discontinuity; a solid–air interface reflects
essentially 100 % of the incident acoustic energy regardless of gap thickness,
and the defect's plane is normal to the beam, which is the optimum geometry.
The two techniques are sensitive to orthogonal defect geometries, which is why
a real acceptance programme uses both.

**C5 — The lot-structure inversion.** At tactical scale one mix fills many
motors: $N_b \ll 1$ per motor. The natural lot is the *mix*, and the population
of motors from it is large, so lot acceptance is a statistical argument — fire
$k$ of $N$, inspect the rest, and infer the shipped population's properties from
the fired sample. At booster scale one motor consumes tens of mixes, so the
natural lot is the *motor*, the population is one, and no sampling argument
exists. Lot acceptance becomes per-article: NDE, dimensional inspection, mass
properties, and an argument from the mixes' own specimens plus a separately
built static-test article that is *not* the one you ship.

The practical consequence: a tactical programme's acceptance cost is dominated
by static-fired articles (you destroy inventory to buy confidence); a booster
programme's is dominated by inspection and documentation (you cannot destroy the
article, so you must characterise it). It also flips what a defect means: a
tactical defect is a lot-disposition question about hundreds of units, a booster
defect is a scrap-or-fly question about one very expensive one.

**C6 — Why continuous mixing has not displaced batch.** The technical case is
strong: in-process energetic inventory falls from tonnes to kilograms, which
reduces the quantity-distance footprint and therefore the capital cost of the
entire facility; residence time is minutes so the pot-life constraint of
Eq. 3.2 disappears; throughput becomes a screw-speed setting rather than a pit
count; and process variation is monitored continuously instead of sampled per
batch.

The obstacle is that **the certification basis of solid propellant is the
batch.** Every element of §3.8 — strand samples, tensile specimens, bond
specimens, density specimens, traceability to raw material lots — is defined
against a mix with a number. A continuous process has no natural lot boundary,
so it must define one artificially and then demonstrate that in-line process
monitoring gives at least equivalent confidence. That demonstration is a
qualification programme, and its cost falls on whichever motor programme adopts
it first, while the benefit accrues to the industry. **The non-technical part of
the obstacle is that no single programme has an incentive to pay for a change
whose payoff is generic.** That is a classic first-mover problem, and it is why
continuous mixing tends to advance only where a government customer funds the
qualification directly.

**C7 — Mandrel CTE.** The mandrel is inside a grain that shrinks onto it during
cool-down. What matters is the *relative* contraction between the mandrel's
outer surface and the propellant's bore. Propellant CTE is of order
$10^{-4}$ K⁻¹; steel is about $1.2\times10^{-5}$ K⁻¹ and aluminium about
$2.3\times10^{-5}$ K⁻¹, so on cooling the propellant always shrinks more.
The dangerous sign is the one where the mandrel shrinks *less* than the
propellant — which is the normal case — because then the grain grips the
mandrel and extraction loads the bore surface in tension and shear at exactly
the location Eq. 3.3 has already strained. Extraction force can crack the bore
or tear the grain from the liner.

The fixes follow directly: taper the mandrel so it releases with a small axial
motion, use a qualified release coating, and — the physics-based answer —
*chill the mandrel before extraction* so it shrinks away from the grain, or use
a collapsible or segmented mandrel that reduces its own diameter mechanically.

**C8 — Service-life extension on firing success.** The flaw: six successful
static firings is a pass/fail observation with $n = 6$ and no measured margin.
It tells you the motors were above the failure threshold at year 14; it tells
you nothing about *how far* above, and therefore nothing about the slope with
which they are approaching it. A property that has fallen 90 % of the way to its
limit fires exactly as successfully as one that has not moved. Extending life on
this basis is extrapolating a binary variable, which is not possible.

What would support the extension:

1. A **trend** of the life-limiting continuous property — cold-temperature
   strain capability, and bondline peel strength — measured on dissected
   surveillance articles across many pull ages, with a fitted slope and
   confidence bounds.
2. A **requirement** for that property, derived from grain structural analysis
   at the cold qualification corner with the programme's required margin, so the
   trend can be compared against a number rather than against zero.
3. Demonstration that the trend, projected to the extended age with statistical
   margin at the upper bound of the storage-temperature distribution, stays
   above the requirement.
4. The **actual thermal history** of the fielded population, because the
   projection is only as good as the assumed storage environment.
5. Static firings retained as *confirmation* of the property-based argument, not
   as its basis — and ideally cold-conditioned firings, since the ambient firing
   does not interrogate the limiting condition at all.

---

### Calculation

**N1.**

(a) Eq. 3.1: $N_b = \lceil 4200/900 \rceil = \lceil 4.667 \rceil = \mathbf{5}$
batches.

(b) Batches per mixer within the working life:
$\lfloor t_{\rm pot}/t_{\rm mix}\rfloor = \lfloor 6.0/3.5 \rfloor = \lfloor 1.714 \rfloor = 1$.
The floor is the whole point — a mixer that is 86 % of the way through a second
cycle when the pot life expires has delivered one batch, not 1.7. Eq. 3.2:
$N_{\rm mixers} \ge \lceil 5/1 \rceil = \mathbf{5}$ mixers.

(c) With three mixers, at most 3 batches can be delivered inside the working
life, so $M_{p,\max} = 3 \times 900 = \mathbf{2{,}700\ kg}$.

Note the discontinuity: reduce the mix cycle from 3.5 h to 2.9 h and each mixer
delivers two batches, the mixer requirement halves to 3, and the same plant can
suddenly cast 5,400 kg. Throughput arithmetic in this business is full of step
functions, and they sit exactly where a floor or ceiling function does.

**N2.** Station capacities (before availability):

- Cure pits: $8/8.0 = 1.000$ motors/day.
- Casting bay: unchanged from WE1 at $1/0.500 = 2.000$ motors/day.
- Radiography: $2 \times (16/8) = 4.000$ motors/day.

Eq. 3.6: $\dot N = 0.80 \times \min(2.000, 1.000, 4.000) = 0.800$ motors/day
$\times 30 = \mathbf{24\ motors/month}$. **The cure pits bind.**

Pits stop binding when $N_{\rm pits}/8.0 \ge 2.000$, i.e. $N_{\rm pits} = 16$.
At 16 pits the pit and casting-bay capacities tie; at 17 the **casting bay**
binds, and output saturates at $0.80 \times 2.000 = 1.600$ motors/day = 48
motors/month. Pits 9 through 16 each buy $0.80/8.0 = 0.100$ motors/day (3
motors/month); pit 17 buys nothing.

Note the comparison with WE1: an extra day of cure (occupancy 7→8 d) and a
0.05 drop in availability cost this line more than the two extra pits gained.
Cure time is the most leveraged single number on the whole line.

**N3.**

(a) Geometry factor: $b^2/a_i^2 = 0.16/0.01 = 16.0$, so
$(b^2/a_i^2 - 1) = 15.0$ and the Eq. 3.3 amplifier is
$1.5 \times 15.0 = 22.5$.

Free strain: $\Delta T = 60 - (-45) = 105$ K, so
$\alpha\Delta T = (9.5\times10^{-5})(105) = 9.975\times10^{-3}$; chemical
shrinkage contributes $\varepsilon_{\rm chem,vol}/3 = 0.008/3 = 2.667\times10^{-3}$.

$$\varepsilon_f = 9.975\times10^{-3} + 2.667\times10^{-3} = 1.2642\times10^{-2}$$
$$\varepsilon_\theta = 22.5 \times 1.2642\times10^{-2} = \mathbf{0.284 = 28.4\ \%}$$

(b) Margin $= 0.22/0.284 = \mathbf{0.77}$. Less than one: **the grain fails at
the cold qualification limit as designed.**

(c) For a margin of 1.5 the allowable strain is $0.22/1.5 = 0.1467$, so
$\varepsilon_f = 0.1467/22.5 = 6.519\times10^{-3}$. Subtracting the chemical
term leaves $\alpha\Delta T = 3.852\times10^{-3}$, i.e.
$\Delta T = 40.5$ K, i.e. a cure temperature of
$-45 + 40.5 = \mathbf{-4.5\ ^\circ C}$.

**The correct answer to (c) is that there is no answer.** You cannot cure a
composite propellant below zero. The point of the problem is that when Eq. 3.3's
geometry factor is large — here $b/a_i = 4$, a very thick web — cure temperature
is no longer an available lever, and the fix must be structural or material:
open the bore (going to $b/a_i = 2.5$ drops the amplifier from 22.5 to 7.9 and
the strain to 10.0 %), add stress-relief boots at the grain ends to decouple the
bondline, relieve the case-bond over part of the length, or move to a
higher-elongation propellant. This is exactly why thick-web case-bonded grains
are not simple cylinders in practice. Full marks require identifying that the
computed cure temperature is physically impossible and saying what to do
instead; computing $-4.5\ ^\circ$C and stopping earns half.

**N4.**

(a) $a = r/p^n = 0.0105/(6.0\times10^6)^{0.42}$. With
$(6.0\times10^6)^{0.42} = 702.8$:

$$a = \frac{0.0105}{702.8} = \mathbf{1.494\times10^{-5}\ m\,s^{-1}Pa^{-0.42}}$$

$a\rho_p c^* = (1.494\times10^{-5})(1810)(1540) = 41.64\ \mathrm{Pa^{0.58}}$, and
$(6.0\times10^6)^{0.58} = 8.537\times10^{3}$, so

$$K_n = \frac{8.537\times10^{3}}{41.64} = \mathbf{205.0}$$

(b) Eq. 3.7 with $a' = 0.97a$:

$$\frac{p_c'}{p_c} = (0.97)^{1/0.58} = (0.97)^{1.7241} = \exp(-0.05252) = 0.9488$$

$$p_c' = 6.0 \times 0.9488 = \mathbf{5.69\ MPa} \qquad (\delta p_c/p_c = -5.12\ \%)$$

Note the amplifier: $1/(1-n) = 1.724$ at $n = 0.42$, so a 3 % input became a
5.1 % output. At $n = 0.35$ the same input would have given 4.6 %; at $n = 0.6$
it would give 7.3 %. High-exponent propellants are ballistically fragile, which
is the manufacturing reason (as well as the stability reason) to keep $n$ low.

Burn rate tracks pressure exactly at equilibrium:
$r' = 10.5 \times 0.9488 = \mathbf{9.96\ mm/s}$, i.e. $-5.12$ %.

Peak thrust $\propto p_c$ at fixed $A_t$ and $C_F$: $\mathbf{-5.12\ \%}$.
Burn time $\propto 1/r$: $1/0.9488 - 1 = \mathbf{+5.39\ \%}$.
(Total impulse $1.0 - $ second order: $0.9488 \times 1.0539 = 1.000$.)

(c) $p_c \propto (aK_n)^{1/(1-n)}$, so to restore $p_c$ you need $aK_n$
restored, i.e. $K_n' = K_n/0.97 = 205.0/0.97 = 211.3$, a **+3.09 % change in
$K_n$**. Since $K_n = A_b/A_t$ and $A_b$ is fixed by the grain,
$A_t' = 0.97\,A_t$: **reduce the throat area by 3.0 %**, i.e. throat diameter by
1.5 %. **A slow lot gets a smaller throat.** Get the direction wrong and you
have doubled the error instead of removing it, which is the single most common
mistake on this problem.

**N5.** $\pi_K = \sigma_p/(1-n) = 0.0025/0.58 = \mathbf{4.310\times10^{-3}\ K^{-1}}$.

At $T_i = -30\ ^\circ$C, $\Delta T_i = -51$ K:
$$\frac{p_c}{p_{c,\rm ref}} = \exp(4.310\times10^{-3} \times -51) = \exp(-0.2198) = 0.8027$$
$$p_c = 6.0 \times 0.8027 = \mathbf{4.82\ MPa}\qquad(-19.7\ \%)$$

At $T_i = +50\ ^\circ$C, $\Delta T_i = +29$ K:
$$\exp(4.310\times10^{-3}\times 29) = \exp(0.1250) = 1.1331,\qquad p_c = \mathbf{6.80\ MPa}\ (+13.3\ \%)$$

Cold *and* 3 % low in $a$: $0.8027 \times 0.9488 = 0.7616$, so
$p_c = \mathbf{4.57\ MPa}$, **−23.8 %** from nominal.

Full excursion from the hot corner (6.80 MPa) to the cold-low corner
(4.57 MPa) is a factor of 1.49 — the motor must operate stably, ignite reliably,
and hold its nozzle over a pressure band of nearly 50 %. Two consequences worth
stating: the low corner is where combustion stability and ignition margin are
tested (module 20), and the high corner is where the case MEOP and the nozzle
structural margin are set. Note also that the temperature term (−19.7 %) is
nearly four times the lot term (−5.1 %), reinforcing WE2(c).

**N6.**

(a) $\mu x = 4.3 \times 0.85 = 3.655$, so transmitted fraction
$= e^{-3.655} = \mathbf{2.6\times10^{-2}}$ — about 2.6 % of the incident beam.
That is why a MeV linac source is required; at 1 MeV the same path transmits
$\sim 10^{-4}$ and you are counting stray photons.

(b) Eq. 3.4 with $\Delta I/I = 0.015$:
$\Delta x = 0.015/4.3 = 3.5\times10^{-3}$ m $= \mathbf{3.5\ mm}$.

(c) CT: $4 \times 1.5\ \mathrm{mm} = \mathbf{6.0\ mm}$.

**The comment is the point of the problem.** Taken at face value the idealised
radiographic limit (3.5 mm) beats the CT limit (6.0 mm), which would make CT
pointless. It is not, for three reasons:

1. Eq. 3.4's stated failure mode is exactly this case. Through 0.85 m of
   propellant, Compton scatter build-up fills in the flaw's shadow and photon
   statistics at 2.6 % transmission set a noise floor well above the assumed
   1.5 % contrast threshold. The empirical 1–2 %-of-thickness rule gives
   9–17 mm for this article, and that is the number to trust. The factor of ~4
   between the two is the scatter-and-noise penalty.
2. The 3.5 mm figure assumes the void's full extent lies along the beam. Rotate
   it and the contrast collapses; CT has no orientation dependence.
3. CT returns a location and a volume; radiography returns a shadow on a
   projection with no depth information, so you cannot tell whether an
   indication is at the bore (structurally critical) or at the case bond
   (critical for a different reason) or in the middle of the web (probably
   benign).

**N7.**

(a) $S_v = \pi(4.0\times10^{-3})^2 = 5.027\times10^{-5}$ m².
$\delta A_b/A_b = 5.027\times10^{-5}/22 = \mathbf{2.29\times10^{-6}}$
(2.3 parts per million).

(b) $1/(1-n) = 1/0.62 = 1.613$, so
$\delta p_c/p_c = 1.613 \times 2.29\times10^{-6} = \mathbf{3.7\times10^{-6}}$ —
about four parts per million, four orders of magnitude below transducer noise.

(c) $0.01 \times 22 = \mathbf{0.22\ m^2}$ — for example a strip 1.1 m long by
200 mm wide.

Why the surface-area framing is the wrong reason to care, in two layers:

*First*, an unbond does not expose propellant; it exposes **liner and
insulation**, which do not burn as propellant. So the added burning surface from
an unbond may be essentially zero while the defect is still lethal. The
$\delta A_b$ calculation is not merely small, it is the wrong model.

*Second*, the actual mechanism is a flame path. At ignition, chamber pressure
reaches the unbonded region through any crack or through the propellant/liner
interface, and hot gas flows axially along a channel with no propellant web
above it, exposing insulation designed for a few seconds of end-of-burn exposure
to full-duration, full-pressure flow. The failure is case burn-through on a
timescale of seconds, not a pressure perturbation. That is why the acceptance
criterion for bondline unbonds is written in terms of area and location, and why
it is enforced by ultrasonics rather than radiography.

**N8.**

(a) Propellant mass $= 9{,}398 - 1{,}041 = \mathbf{8{,}357\ kg}$.

(b) Deficit against the specified 8,400 kg is 43 kg. If the grain fills the same
envelope volume (the mandrel and case set the geometry, so it does), the mass
deficit fraction is the porosity:

$$\phi = \frac{43}{8400} = \mathbf{5.1\times10^{-3} = 0.51\ \%}$$

For a physical picture: the design grain volume is
$8400/1780 = 4.719$ m³, and 0.51 % of that is **24 litres of distributed gas**
inside the motor.

(c) The scale resolves ±4 kg, which is $4/8400 = 0.048$ % of propellant mass.
The 43 kg deficit is **11 times the resolution** — comfortably detected. The
impulse consequence is directly proportional: **−0.51 % of total impulse**, an
order of magnitude larger than the ±0.05 % repeatability a launch vehicle
expects and enough to matter to a trajectory.

The lesson: this defect is invisible to every volumetric NDE method in §3.9 —
24 litres distributed as millions of sub-millimetre bubbles produces no callable
indication anywhere — and is trivially found by a scale. Programmes that treat
motor weight as a data-recording step rather than an acceptance criterion have
given this defect a free pass.

**N9.**

(a) $E_a/R_u = 95{,}000/8.31446 = 1.1426\times10^{4}$ K.
$1/293.15 - 1/323.15 = 3.4112\times10^{-3} - 3.0945\times10^{-3} = 3.167\times10^{-4}$ K⁻¹.

$$\frac{t_{20}}{t_{50}} = \exp\left(1.1426\times10^{4} \times 3.167\times10^{-4}\right) = \exp(3.618) = \mathbf{37}$$

(b) $20\ \mathrm{yr}/37.3 = 0.537$ yr $= \mathbf{6.4\ months}$ in the oven at
50 °C.

(c) Any two of:

1. **Single-mechanism assumption.** Composite propellant ages by several
   competing routes — binder crosslinking, chain scission, oxidation, bondline
   migration, oxidiser–binder interface degradation — with different $E_a$.
   Raising the temperature reweights them, so the oven ages the coupon along a
   path the magazine never takes. The extrapolation is only valid if the
   dominant mechanism is the same at both temperatures, which is precisely what
   the experiment cannot establish.
2. **50 °C may cross a transition.** Post-cure reactions that are quiescent at
   20 °C can run to completion at 50 °C; plasticiser or catalyst mobility rises
   sharply; and 50 °C may simply exceed anything the fleet sees.
3. **Geometry.** The oven ages coupons; the fleet ages case-bonded grains that
   are also being thermally cycled, which produces cumulative mechanical damage
   (Mullins-type stress softening, microcracking at the bondline) that no
   isothermal oven test reproduces at any temperature.
4. **The storage environment is a distribution, not 20 °C**, and the tail of the
   distribution — a magazine in a hot climate — does the damage.

The defensible use of Eq. 3.5 is to *rank* candidate formulations and to bound
the shape of a trend, with real-time surveillance (§3.11) doing the certifying.

---

### Engineering reasoning

**R1 — Rising indication rate at constant pass rate.**

"They all passed" is not a response because the acceptance limit is a threshold
on a continuous quantity, and a population whose mean indication count has
risen by a factor of 2.6 is a population whose *distribution* has moved toward
the limit. The next lot is the one that fails, and it will fail as a surprise.
The rising rate is evidence of a process drift; a pass/fail record is blind to
drift by construction. This is the same statistical error as C8, seen from the
other side.

Investigation, in priority order:

1. **Classify the indications.** Are they the same *type* (porosity? inclusions?
   bore-surface cracks? bondline?) and in the same *location*? A rise in one
   class in one location points at one process step; a uniform rise across
   classes points at the inspection, not the article.
2. **Rule out the inspection system.** Has the source, detector, technique,
   film/digital processing, or the *interpreter* changed? An operator change or
   a detector recalibration will move the called-indication rate with no change
   whatever in the motors. Re-read a sample of the first ten articles' images
   with the current interpreter and technique — if the rate rises on the old
   images too, the process is fine and the inspection changed.
3. **Correlate against process records.** Raw material lot changes (especially
   oxidiser particle size distribution and prepolymer lot), mixer maintenance,
   cast vacuum trend, cure profile records, ambient humidity, liner
   application-to-cast interval. Plot indication count against each.
4. **Check the calibration standards and the reference radiographs.** Image
   quality indicator readings across the run: if sensitivity has *improved*, you
   are calling more indications on the same population.
5. **Trend the correlated variables**, not just the indication count — mix
   density specimens, motor weights, strand $a$. If motor weight is also
   drifting down, the porosity story is confirmed and the cast station is the
   suspect.
6. **Disposition:** halt at the current lot pending the drift's cause, and
   consider a full CT scan of one recent article to characterise indications
   that radiography can only shadow.

A strong answer explicitly separates the two hypotheses — the *process* changed
versus the *inspection* changed — and gives the discriminating test (re-read old
images) before spending money on the process investigation.

**R2 — Two motors, same lot, different anomalies.**

*Motor A: +4 % pressure, −3.5 % burn time, total impulse therefore ≈ nominal
($1.04 \times 0.965 = 1.004$).* This is the classic burn-rate signature. Burn
rate is high and burn time is correspondingly short, with the area under the
trace preserved — exactly the behaviour of Eq. 3.7 and §3.13. Candidate causes:
the propellant was warmer than the assumed conditioning temperature (most
likely; a +13 K error at $\pi_K = 0.003$ K⁻¹ gives +4 %), the mix's $a$ was
above the strand value (strand-to-motor scale factor wrong), or $K_n$ is high
because $A_t$ is undersized or $A_b$ slightly over.

*Motor B: +4 % pressure, nominal burn time, +3 % total impulse.* This is **not**
a burn-rate signature, because a burn-rate change must move pressure and burn
time in opposite directions. Pressure up with duration unchanged and impulse up
means more mass flowed per unit time for the same duration, i.e. more propellant
burned — the web was not the problem, the *throat* or the *surface* was.
Candidates: a throat that eroded less than predicted or was undersized (raises
$K_n$, raises $p_c$, but would also shorten burn time — so this is a poor fit
alone); more likely **the motor contained more propellant than nominal, or the
burning surface was larger than the design** (a mandrel undersize, a bore
machined oversize, extra propellant loaded). More propellant at the same web
means higher $A_b$ throughout with the same web thickness, which raises $p_c$
and impulse while leaving burn time — set by web/rate — unchanged. That fits all
three observations.

*The single discriminating measurement:* **weigh the motors before firing, and
compare loaded propellant mass with the recorded value** (§3.10). Motor B's
hypothesis predicts a propellant mass ~3 % above nominal; motor A's predicts
nominal mass. If pre-fire weights are unavailable, the next best is the
pre-fire bore dimensional scan (web thickness and port area), which distinguishes
a geometry error from a rate error directly. Post-fire throat measurement is a
useful third, but it cannot separate A's hypotheses.

**R3 — Doubling rate in 18 months.**

Baseline: pits $6/7 = 0.857$/day; casting bay 1 bay — its occupancy is not
stated but from WE1's structure it is of order 0.5 d, so ≈ 2/day; radiography
$1 \times 24/6 = 4$/day. **The pits bind at 0.857/day.** Target: 1.714/day.

| intervention | benefit | schedule risk | verdict |
|---|---|---|---|
| **More cure pits** | Each pit adds $1/7 = 0.143$/day. Reaching 1.714/day needs 12 pits, i.e. **six more**. That is exactly the doubling. | Moderate: concrete, ovens, controls, and a quantity-distance siting review — but *inside* an already-licensed facility, so no new license. 12–18 months is achievable. | **Rank 1.** It is the only intervention that both attacks the binding constraint and can be finished in time. |
| **Second casting bay** | Zero benefit now (casting bay is at 43 % utilisation) — but becomes necessary once pits exceed $2.0 \times 7 = 14$. | Low. | **Rank 3** — do it only if the pit expansion goes past 14, i.e. plan for it, do not build it yet. |
| **Automated defect recognition** | Zero rate benefit (radiography at 21 % utilisation). Real benefit is removing the certified-interpreter labour constraint and inter-operator variability. | Low technical risk, high *validation* risk (§3.14: you cannot train on defects you do not have). | **Rank 4.** Worth funding for quality and labour reasons, not for rate. |
| **Second radiographic cell** | Zero benefit. | Low. | **Rank 6.** Do not do this. |
| **15 K hotter cure** | If it cuts cure from ~5 d to ~3.5 d, occupancy 7→5.5 d and output rises to $6/5.5 = 1.09$/day, +27 %. Combined with four extra pits it would reach the target with less concrete. | **High.** Eq. 3.3 says $\Delta T$ rises 15 K, raising bore strain proportionally — for a grain with an amplifier of 8 and $\alpha = 10^{-4}$, that is +1.2 percentage points of strain, consuming margin at the cold qualification corner. It also requires re-running the grain structural analysis and, realistically, a cold-conditioned requalification firing. | **Rank 5**, and only as a partial measure with a funded structural requalification. Never as the primary lever. |
| **Continuous mixing** | Transformative in principle; irrelevant here, because the binding constraint is *cure*, not *mix* — continuous mixing does not shorten cure at all. | Very high: a qualification programme measured in years (C6). | **Rank 7.** Wrong tool for this constraint, and cannot be done in 18 months. |

Also worth naming as **Rank 2**: an **in-process cure-state monitor**
(dielectric or ultrasonic), which ends the cure when the propellant is cured
rather than when the clock says so. On most lines the cure profile carries
conservatism worth a fraction of a day per motor, and harvesting it costs no
structural margin at all. It will not deliver the whole doubling, but it is the
only "faster cure" that does not appear on the debit side of Eq. 3.3.

A strong answer computes the six-pit requirement, notices that three of the six
proposed interventions attack non-binding stations and are therefore worthless
for rate, and distinguishes "hotter cure" (buys rate, spends margin) from
"smarter cure monitoring" (buys rate, spends nothing).

**R4 — Strand data with a step in intercept and no change in slope.**

Interpretation. In $\ln r = \ln a + n \ln p$, the slope is $n$ and the intercept
is $\ln a$. The slope is unchanged at $0.36 \pm 0.01$ across all 30 mixes, so
**the propellant's combustion mechanism has not changed** — $n$ is set by the
flame structure and the condensed-phase/gas-phase coupling, which depend on the
formulation's chemistry, not on its physical processing. The intercept has
stepped 2.5 %, so $a$ has changed: the propellant burns 2.5 % faster (or slower)
at every pressure by the same factor.

What produces a step in $a$ at constant $n$: almost always a change in the
**oxidiser particle size distribution** — a new AP lot, a different grind, a
changed coarse/fine ratio — since burn rate at fixed chemistry is strongly
controlled by the diffusion length between oxidiser and binder, while $n$ is
not. Other candidates: a burn-rate modifier lot change (iron oxide content and
fineness), or a change in metal powder size. A step *between two consecutive
mixes* rather than a drift points hard at a raw-material lot boundary, so the
first action is to pull the incoming material certifications and find what
changed at mix 18.

What did **not** change: the pressure exponent, hence the stability margin and
the $1/(1-n)$ amplification factor; and by inference the propellant's density,
$c^*$ and mechanical properties — though those must be checked, not assumed,
from the mixes' own specimens.

Disposition of motors already cast from mixes 18–30. This is not a scrap
question; it is a **ballistic re-prediction and throat-trim** question (§3.13):

1. Confirm the step is real and not an artefact of the strand rig — re-burn
   retained strands from mixes 15–17 and 19–21 in the same session on the same
   apparatus.
2. Verify the mixes' other properties (density, tensile) against the pre-step
   population; if those also stepped, the disposition is broader than ballistics.
3. Apply the configuration's strand-to-motor scale factor and re-predict each
   affected motor with its own mix-specific $a$. With $n = 0.36$, the
   amplification is $1/(1-n) = 1.56$, so 2.5 % in $a$ is **3.9 %** in $p_c$ and
   in peak thrust, and **−3.8 %** in burn time — total impulse essentially
   unchanged.
4. Check that the re-predicted 3σ high corner (this lot, hot-conditioned) still
   sits below MEOP with the required margin, and that the low corner still
   ignites and burns stably.
5. If the margin closes, **trim the throat** on the affected motors — a
   $\pm 2.5$ % change in $A_t$ in the direction that restores $K_n \cdot a$ —
   and re-baseline the delivered ballistic prediction for those serial numbers.
   If the motors are already integrated and the throat cannot be trimmed, deliver
   them with a revised ballistic prediction and let the vehicle's trajectory
   dispersion absorb 3.9 %.
6. Update the material specification so the particle size distribution parameter
   that moved becomes a controlled and inspected incoming characteristic. A
   2.5 % step that nobody predicted means the specification did not control the
   thing that matters.

Full marks require the observation that *nothing is wrong with the motors* —
they are within the propellant family's normal variation and the correct
response is prediction and trim, not rejection — plus the specification fix.

**R5 — 200 mm × 60 mm aft-dome bondline unbond.**

Area $= 0.012$ m². The information given cuts both ways and the honest answer
argues both sides before choosing.

*The case for accept-as-is.* The location is favourable on both counts stated:
the web above the bondline is thick, so the flame front does not reach the
region until late in the burn if at all; and the local gas exposure time is
short, so the insulation beneath has capability the design did not need to
spend. The area is small relative to any credible flame-path criterion. Aft
domes are geometrically complex, and UT on a doubly-curved surface is prone to
geometric artefacts that mimic unbonds. Scrapping a completed motor over a
0.012 m² indication in a benign location is an expensive response to a defect
that may not be structurally or thermally significant.

*The case for reject.* An unbond is not a static defect. It is a crack in an
interface that will be cycled through the Eq. 3.3 strain excursion every time
the motor is thermally cycled in storage and transport, and interfacial cracks
grow under cyclic loading. The aft dome is also where the grain's axial shrinkage
is reacted, so the bondline there is loaded in **peel**, the weakest mode. And
the thing that makes an unbond dangerous is not its area but its **connectivity
to the bore**: if hot gas can reach it — through a crack, through the propellant/
liner interface, or simply because the grain end is exposed at ignition — then
its area is irrelevant and its axial extent is everything. "Thick web above it"
protects against the flame arriving from *outside*; it says nothing about gas
arriving *along* the interface. Finally, an unbond of this size at this location
is evidence of a process escape, and the article in front of you may not be the
only one.

*What would decide it.*

1. **Is the unbond connected to the grain's gas-exposed boundary?** A CT scan or
   a denser UT raster to map the indication's full extent and, critically,
   whether it runs to the aft grain termination or to any exposed liner. This is
   the single decisive question.
2. **What does the acceptance criterion say, and where did it come from?** If the
   drawing's bondline criterion was derived from a thermal and structural
   analysis with a stated critical area and location, apply it. If it was
   derived from "what the UT can see," it is not a criterion (§3.8) and the
   analysis must be run now.
3. **A thermal/flow analysis of the specific location** at the specific arrival
   time, giving insulation margin with the unbond present.
4. **A grain structural analysis** with the debond modelled as a crack, giving
   growth per thermal cycle over the required storage life.
5. **The population question:** UT records for the rest of the lot, and the
   process records for this article's liner application-to-cast interval and
   surface preparation.

*Recommendation.* **Do not accept as-is on the argument given, and do not scrap
yet.** Run item 1 first: if the unbond is isolated within the bondline with no
path to gas, and items 3 and 4 show margin over the service life, accept with a
documented analysis and add the article to a surveillance pull list. If it
connects to any gas-exposed boundary, reject the motor — the failure mode is
case burn-through and there is no acceptable margin argument for a flame path.
Independently, treat the finding as a process escape and inspect the lot, because
a bondline defect that reached final NDE means the upstream controls did not
catch it.

The grader is looking for: recognition that area is the wrong metric and
connectivity is the right one; the peel-loading observation about aft domes; the
distinction between "the flame cannot reach it from the bore" and "gas cannot
reach it along the interface"; and a disposition that is conditional on a
specific measurement rather than a flat accept or reject.

---

## K2. Quiz answers with explanations

**Q1 (8 pts).** *Proves:* the Vieille coefficient $a$ and pressure exponent $n$
of that specific mix, measured in a quiescent bomb at several pressures — i.e.
the propellant's intrinsic burn-rate law as produced by that batch. *Does not
prove:* how that propellant burns in the motor, because the strand sees no
cross-flow (hence no erosive burning), no transient pressure history, no
port-to-throat geometry, and is not at the motor's bulk conditioning
temperature. The gap is bridged by a configuration-specific, empirically
determined strand-to-motor scale factor of a few per cent, derived from
static-fired motors of that family. (4 pts each half; deduct 2 for an answer
that does not mention the scale factor or erosive burning.)

**Q2 (10 pts).** Batches deliverable per mixer inside the working life:
$\lfloor t_{\rm pot}/t_{\rm mix}\rfloor = \lfloor 7.0/3.0\rfloor = \lfloor 2.33\rfloor = 2$.
Eq. 3.2: $N_{\rm mixers} \ge \lceil 9/2 \rceil = \mathbf{5}$ mixers.

The reasoning that earns the marks: the floor is not a rounding convenience.
A mixer that is one-third of the way into a third cycle when the first batch
passes its working life has contributed two batches, not 2.33. And the ceiling
on the outer division is equally physical — four mixers deliver eight batches
and the ninth batch has nowhere to come from, so the motor cannot be cast at
all, not merely cast slowly. (6 pts for the number, 4 for the floor/ceiling
reasoning.)

**Q3 (12 pts).** $n = 0.30 \Rightarrow 1/(1-n) = 1.4286$.

(a) $p_c$: $(1.025)^{1.4286} = \exp(1.4286 \times 0.024693) = \exp(0.035275) = 1.0359$
→ **+3.59 %**.
(b) Peak thrust $\propto p_c$ at fixed $A_t$, $C_F$ → **+3.59 %**.
(c) Burn rate tracks pressure at equilibrium, so $t_b \propto 1/r$:
$1/1.0359 - 1 = $ **−3.47 %**.
(d) Total impulse: $1.0359 \times 0.9653 = 1.0000$ → **0 % to first order**.

(3 pts each. Full marks on (d) require the explanation, not just "zero": the
same propellant mass burns at the same $c^*$ and $C_F$, so the area under the
thrust trace is preserved and only its shape changes.)

**Q4 (10 pts).** **(iii)** — weighing the motor and comparing with the recorded
inert mass. A 0.4 % bulk porosity distributed as millions of sub-millimetre
bubbles produces no callable indication in radiography (contrast per bubble is
far below the noise floor) or CT (each bubble is below the voxel-count
threshold), is invisible to a bondline ultrasonic scan (it is not at a bond),
and is far too deep for thermography. It is, however, a 0.4 % mass deficit,
which a scale resolving ~0.05 % detects with an order of magnitude to spare.

(6 pts for the choice, 4 for a justification that names *why the volumetric
methods fail* rather than only why the scale works.)

**Q5 (12 pts).** Geometry factor: $(b/a_i)^2 - 1 = 6.25 - 1 = 5.25$; Eq. 3.3
amplifier $= 1.5 \times 5.25 = 7.875$.
$\Delta T = 65 - (-40) = 105$ K, so $\alpha\Delta T = 1.05\times10^{-2}$.

$$\varepsilon_\theta = 7.875 \times 1.05\times10^{-2} = \mathbf{0.0827 = 8.3\ \%}$$

Against an 18 % limit: **passes**, with a margin of $0.18/0.0827 = 2.18$.

(8 pts for the number, 4 for the pass/fail with margin. Note for the grader: a
student who also observes that ignoring chemical shrinkage is non-conservative —
adding 1 % volumetric shrinkage would push the strain to about 10.9 % and the
margin to 1.65 — deserves the credit even though it was not asked.)

**Q6 (10 pts).** **(ii)** — casting pit and cure oven occupancy. Cure takes days
while mixing takes hours, so a pit holds an article roughly an order of
magnitude longer than any other station holds it; and the obvious remedy —
raising cure temperature to shorten the cure — is blocked because cure
temperature sets the grain's stress-free temperature and therefore its cold-end
structural margin (Eq. 3.3).

A different answer is correct when: **(i)** on a tactical line, where one mix
fills many motors and the ovens hold batches of them, so mixer and moulding
tooling throughput binds instead; **(iii)** on a programme that CT-scans 100 %
of articles, since CT is hours per article; **(iv)** or **(v)** whenever case
fabrication (winding hall time, forging lead) or a single-source raw material is
in shortage — which binds the whole industry rather than one line and is the
answer that most often surprises programmes.

(5 pts for the choice, 3 for the reason, 2 for a valid exception.)

**Q7 (12 pts).** Radiography through 0.9 m at 1–2 % of traversed thickness:
$0.009$–$0.018$ m = **9–18 mm**. CT at 1.5 mm voxel × 3 voxels =
**4.5 mm** — a factor of 2–4 better, and orientation-independent, and with a
location attached.

Why radiography is nonetheless the 100 % inspection: **throughput and capital**.
A radiograph of a segment is minutes to an hour; a CT scan of the same article
is hours of acquisition plus reconstruction, and the machine that can rotate and
scan a large booster segment is a building rather than a cabinet. Eq. 3.6 says a
station that takes hours per article will bind the line long before a station
that takes minutes. CT is therefore used for qualification, for first articles,
and for characterising indications that radiography has flagged but cannot
resolve.

(4 pts each detection limit, 4 for the throughput argument. Deduct 2 for a
student who says CT is "more accurate" without saying that its advantage is
orientation-independence and 3-D location, not just size.)

**Q8 (10 pts).** *The argument for enlarging the throat.* $K_n = A_b/A_t$ is the
only term in Eq. 3.7 the manufacturer can still change once the propellant
exists. A lot 3 % high in $a$ would fly $(1.03)^{1/(1-n)}$ high in chamber
pressure — about +4.6 % at $n = 0.35$ — with correspondingly higher peak thrust
and a shorter burn. Increasing $A_t$ by 3.0 % (diameter +1.5 %) drops $K_n$ by
3.0 %, restoring the product $a K_n$ and hence $p_c$, peak thrust and burn time
to nominal. The lot is perfectly good propellant; rejecting it discards material
and schedule for a variation the design can absorb.

*What it actually does to the ballistics.* It restores $p_c(t)$, $F(t)$ and
$t_b$ to the nominal trace. It does **not** change total impulse, which was
never off. But it does reduce the nozzle expansion ratio
$\varepsilon = A_e/A_t$ by 3 % at fixed exit area, which costs a small amount of
$C_F$ and therefore of delivered specific impulse — a few tenths of a per cent.
That penalty is the real, and usually acceptable, price of the trim, and a
student who names it has understood the trade rather than memorised the fix.

*The configuration-management cost.* Throat diameter becomes a build-to-lot
dimension rather than a drawing dimension. That means: the nozzle cannot be
finish-machined until the lot's strand data exist, so long-lead nozzle
assemblies must be held in an unfinished state; every motor needs a serialised
as-built record of its actual throat and its mix-specific ballistic prediction;
the delivered performance prediction supplied to the vehicle differs motor to
motor; and any subsequent throat erosion analysis must be run against the
as-built dimension, not the nominal.

(4 pts argument, 3 pts ballistic effect including the $\varepsilon$ penalty,
3 pts configuration-management cost.)

**Q9 (8 pts).** At equilibrium the mass generated equals the mass choked:
$\rho_p A_b r = p_c A_t/c^*$. With $A_b$, $A_t$, $\rho_p$ and $c^*$ fixed by the
hardware, $r \propto p_c$ exactly, so a lot with a higher $a$ raises both burn
rate and pressure by the same fraction. Peak thrust follows $p_c$ and rises;
burn time follows $w/r$ and falls by the same fraction. Total impulse is
$\int F\,dt$, and to first order the two effects cancel — the same propellant
mass is expelled at the same $c^*$ and $C_F$, just faster. **Lot variation
changes the shape of the thrust trace, not the area under it.**

(4 pts for the $r \propto p_c$ argument, 4 for the cancellation. An answer that
just asserts "impulse depends only on mass" without connecting it to the
equilibrium relation earns 4.)

**Q10 (8 pts).** *Decision:* **do not extend beyond year 15 on this data**, but
the case is not hopeless — it is under-evidenced.

The numbers: the requirement with margin is $0.19 \times 1.25 = 23.75$ %.
Measured capability at year 12 is 21 %, which is **already below** the required
value. The fleet is therefore not merely un-extendable; its *current*
certification basis needs re-examination. The trend is roughly
$(28 - 21)/12 = 0.58$ percentage points per year, so year 15 projects to about
19.3 % — at the bare requirement with no margin at all.

*Additional data demanded:*
- More pull points to establish whether the trend is linear or decelerating —
  binder aging often slows as the accessible reaction sites are consumed, and a
  decelerating trend changes the projection materially.
- The **storage temperature distribution** of the fielded population, since the
  12-year articles pulled may not represent the hottest sites.
- Bondline peel data alongside the propellant strain data; the propellant may
  not be the life-limiting element.
- A re-run of the **grain structural analysis** with the aged property set —
  including aged modulus, which usually rises and increases the demanded stress
  even at constant strain — rather than comparison against a requirement derived
  from delivery-condition properties.
- At least one **cold-conditioned static firing** of a 12-year article; ambient
  firings do not interrogate the limiting condition.

*Interim restriction:* raise the fleet's minimum operating and handling
temperature — restrict cold conditioning to a limit at which the analysis shows
margin with the measured 21 % capability — and prioritise the hottest-stored
serial numbers for pull and disposition. That converts a certification problem
into an operational limitation while the data is gathered.

(3 pts for computing the requirement and comparing it, 3 for the data demands,
2 for a coherent interim restriction. A student who extends the life because
"21 % is still above 19 %" has ignored the margin factor and earns at most 2.)

---

## K3. Trade-study reference solution (T1)

### The arithmetic first

**Throughput.** 24 motors/year is 0.066 motors/day. The existing inland plant
has six cure pits; at a 60 t-class motor's plausible 8–10 day occupancy that is
$6/9 \approx 0.67$ motors/day raw, and even at $\eta_a = 0.7$ it delivers
0.47 motors/day ≈ 170 motors/year. **The existing plant is roughly seven times
oversized for this requirement.** Four mixers at, say, a 2 t working batch give
$N_b = \lceil 60{,}000/2{,}000 \rceil = 30$ batches per motor — which Eq. 3.2
says four mixers cannot deliver inside one pot life unless the pot life is long
or the batch is much larger, so a mixer expansion is likely needed for a 60 t
monolithic cast at *any* site. That is a real cost and it applies to options A,
B and D as well as to a monolithic cast at the inland plant.

This is the first finding and it is decisive: **no option is justified by
throughput.** The plant capacity argument that usually drives a new facility is
absent here. Any new plant is being built for *logistics*, not for rate, and
must be justified on that basis alone.

**Mass fraction.** Requirement 0.88, margin to 0.86.

- Monolithic filament-wound: the P120C achieves 0.924 and the GEM family
  0.894–0.908 `[CALC from WP/NG-COMM]`. A 60 t monolith should reach 0.90±.
  Comfortably above requirement.
- Two-segment steel: the four-segment RSRM achieves 0.85 `[CALC]` at 500 t, but
  that is a rail-constrained, 11-casting-segment, field-jointed article. A
  two-segment 60 t steel case with a single factory-assembled or field joint
  should do better — plausibly 0.86–0.88. **That lands on or just below the
  requirement and inside the stated margin, with no room to spare.** This is the
  central technical risk of option C and must be stated as such, not glossed.

**Schedule.** First flight in 5 years. A new energetic-materials facility takes
4–6 years to site and license. Options A and D therefore have a licensing
critical path that consumes the entire programme schedule with zero margin, and
a 6-year outcome misses the date outright. Option B has no licensing path but
substitutes the problem of moving a ~68 t loaded Class 1.3 article by road from
an inland plant — a route survey, permit and public-safety exercise that is
slow, expensive per shipment, and a recurring risk for the life of the
programme rather than a one-time cost.

### Recommendation

**Option C for first flight, with a funded parallel start on option A.**

Fly the two-segment steel motor from the existing inland plant, rail-transported
and joined at the launch site, to meet the five-year date. Simultaneously begin
siting and licensing the coastal casting facility on day one, and transition to
a monolithic filament-wound motor when the license lands — realistically around
flight 15–25.

The reasoning:

1. **Schedule is the binding constraint and only C respects it.** A and D put a
   4–6 year licensing process on the critical path of a 5-year programme. That
   is not a risk, it is a plan to be late.
2. **The mass-fraction requirement is met, with the margin the customer already
   allowed.** 0.86–0.88 for a two-segment steel case sits inside the stated
   0.86 floor. The programme flies with reduced but adequate performance and
   buys the 0.90+ monolith later — the classic block upgrade.
3. **The existing plant's capacity is enormous relative to 24/yr**, so the
   marginal cost of using it is low and there is no throughput case for the new
   facility. A new plant built for this rate would run at ~15 % utilisation.
4. **A two-segment joint is a far smaller version of the RSRM problem, and the
   engineering is public and mature.** The capture-feature/third-O-ring/joint-
   heater architecture `[Rogers86]` exists precisely so that this choice can be
   made safely. One joint, assembled once per motor at a single site by a
   dedicated crew, is a manageable risk — which is not the same as a free one,
   and the programme must fund joint qualification properly.
5. **Segmented articles fail in units of a segment** (§6.2). At 24 motors/year
   and a low-rate learning curve, an NDE finding that scraps one 30 t segment
   instead of one 60 t loaded monolith is worth real money in the early flights,
   which is exactly when findings are most likely.

### What would change the recommendation

- **Rate requirement of 100+/yr.** A dedicated coastal plant amortises, the
  segment joint becomes 100+ field assemblies a year, and option A wins despite
  the schedule — you would then negotiate the first-flight date instead.
- **Mass-fraction requirement of 0.90.** Steel segmented cannot reach it. The
  monolith becomes mandatory and the honest answer is to slip first flight to
  year 6–7 and take option A, because option B's loaded road transport of a
  68 t Class 1.3 article at 24 shipments a year is not a sustainable operating
  concept.
- **The inland plant is on navigable water.** Barge transport of a loaded
  monolith is routine in this industry and removes option B's entire objection.
  B then becomes strongly competitive with C and probably beats it, since it
  delivers the full mass fraction on the original schedule.
- **The launch site sits inside an already-licensed range with existing
  energetic-materials authorisation.** The 4–6 year figure collapses, and options
  A and D become schedule-feasible; D in particular (wound cases shipped empty
  from the existing plant, cast at a modest coastal facility) is then the
  lowest-capital route to a monolith.
- **A qualified two-segment case cannot be shown to reach 0.86.** Then C fails
  the requirement and you are choosing among three options that all miss the
  date; the correct engineering answer is to say so early rather than to
  discover it at CDR.

### Rubric

A strong answer must contain:

- The throughput calculation showing the existing plant is oversized, and the
  explicit conclusion that **no option is justified on rate grounds**. (Answers
  that argue for a new plant on capacity grounds have not done the arithmetic.)
- The mass-fraction comparison using real numbers — RSRM 0.85, GEM 0.89–0.91,
  P120C 0.924 — and an estimate for a two-segment steel case with its
  uncertainty acknowledged.
- Explicit identification of facility licensing as the schedule critical path,
  and the observation that A and D consume the whole programme schedule with it.
- A recommendation that is *conditional and phased* rather than a single
  architecture for all time, since the constraint that decides it (licensing
  duration) expires.
- The failure-consequence argument: monoliths scrap in units of the whole motor.
- At least three specific circumstances that would flip the answer.

Loses marks for:

- Choosing the monolith on mass fraction alone without addressing licensing
  schedule. Performance does not win architecture arguments against a facility
  timeline.
- Choosing option B without noticing that "inland" plus "loaded" means road
  transport of a 68 t energetic article, and without asking whether barge is
  available. The transport mode is the whole question in option B and it was
  deliberately left unstated.
- Treating the segmented joint as automatically disqualifying because of
  STS-51-L. The redesign worked for 110 subsequent flights; the lesson is that
  joints must be engineered and inspected, not that they cannot be used.
- Any answer that does not compute anything.

---

## K4. Common wrong answers and what they reveal

**"The void adds burning surface, so the motor overpressures."** The single most
common error on this material (WE3, N7). It reveals a student who has learned
$p_c = f(K_n)$ and is applying it without checking magnitudes: the effect is
$10^{-6}$, four orders of magnitude below measurable. It also reveals a habit of
reaching for the equation you know instead of asking what the actual failure
mechanism is. The correct chain is void → stress concentration → crack
initiation → crack growth → *then* surface area, and the surface area only
becomes relevant after the crack has grown by three orders of magnitude.

**Confusing an unbond with added propellant surface.** Related, and worse: an
unbond exposes liner and insulation, which are not propellant. Students compute
$\delta A_b$ for a debond and get a plausible-looking number that models nothing.
Reveals that the student has not internalised what each material in the stack
actually is.

**Getting the throat-trim direction backwards.** A fast lot needs a *bigger*
throat (lower $K_n$, lower $p_c$); a slow lot needs a smaller one. Students who
guess get it right half the time and cannot say why. Reveals that
$K_n = A_b/A_t$ is being memorised rather than reasoned from mass balance:
more throat area means more mass can escape at a given pressure, so equilibrium
pressure falls.

**Forgetting the $1/(1-n)$ amplifier.** Reporting a 2 % change in $a$ as a 2 %
change in $p_c$. Reveals that Eq. 3.7 has been used as a formula rather than
understood as a balance whose solution is a power law. The amplifier is the
single most important number in solid motor ballistics after $n$ itself, and it
is also the reason low-$n$ propellants are preferred for manufacturing
robustness as well as for stability.

**Claiming total impulse changes with burn rate.** It does not, to first order:
the same propellant mass burns at the same $c^*$ and the same $C_F$, just faster.
Students who assert an impulse change have confused "more thrust" with "more
impulse" — a conflation that also produces bad answers in trajectory work.

**Using floor/ceiling functions wrong in the throughput problems.** Writing
$N_{\rm mixers} = N_b t_{\rm mix}/t_{\rm pot}$ without the floor on batches per
mixer (N1). A mixer 86 % of the way through its second batch when the pot life
expires has delivered one batch. Reveals a student who has not thought about
what the constraint physically is.

**Treating cure time as a free parameter.** Answering "shorten the cure" to
every throughput question without touching Eq. 3.3. Reveals that the module's
central coupling — cure temperature *is* stress-free temperature — has not
landed. The related error is answering "cure hotter" to N3(c) and reporting
$-4.5\ ^\circ$C without noticing that the number is physically impossible, which
reveals a student who computes without sanity-checking.

**Answering "they all passed acceptance" to R1.** Reveals confusion between a
threshold and a distribution, which is the same statistical error as extending
service life on firing success (C8). Both are cases of treating a censored
binary observation as though it carried information about margin.

**Recommending automated defect recognition or a second X-ray cell to fix a rate
problem at a station running at 21 % utilisation (R3).** Reveals that Eq. 3.6 —
a line runs at its tightest station — has been read but not used. This is the
most common failure in the reasoning problems and the easiest to avoid: compute
every station's capacity before proposing anything.

**Assuming radiography and CT are interchangeable.** They are sensitive to
different defect geometries and have detection limits that scale with different
quantities — path fraction for radiography, voxel size for CT. Students who
treat "we X-rayed it" as equivalent to "we inspected it" will accept motors with
bondline defects, which is the defect class that actually loses vehicles.

**Trusting Eq. 3.5's acceleration factor (N9).** Computing 37× and then
proposing a 6-month oven test as a 20-year life certification. Reveals a student
who has not read the equation's failure conditions — which is, in this course,
the point of writing failure conditions under every equation.

**In the trade study, choosing the highest-performance architecture without
costing the facility schedule.** Reveals an engineer who optimises the artefact
and ignores the system that produces it — which is the exact failure mode this
entire module exists to correct.
