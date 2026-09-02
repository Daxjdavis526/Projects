# Module 23 — Insulation and Liners — Answer key

Solutions to the problems and quiz in
[`23-insulation-liners.md`](23-insulation-liners.md). Numerical answers are
recomputed by `tools/examples/23.py`.

---

## K1. Problem solutions

### Conceptual

**P1.** Two physically distinct reasons:

1. **Different exposure times.** Same environment, different burnback: one
   station sits under a thin web (or under a stress-relief flap, or at a slot)
   and is exposed from near ignition; the other sits under the full web and is
   exposed only in the last seconds. This is the dominant explanation in a
   case-bonded motor and it is a factor of 3–5 easily. WE1's forward dome
   versus forward cylinder is exactly this case.
2. **Different flow geometry at the same bulk mass flux.** A boundary-layer
   correlation in $G$ does not capture particle impingement. If one station is
   in attached flow along a wall and the other is where the flow turns (aft
   dome, step, submerged nozzle cavity, slot corner), the impinging station
   recedes several times faster at the same $G$ because momentum, not heat
   flux, is removing the char.

*What data would distinguish them:* the burnback tables giving $t_e(x)$ settle
(1) immediately. For (2), ask for the flow-field solution with a two-phase
(Lagrangian particle) computation and the impingement angle at each station,
and for the geometry of the subscale char motor from which the correlation was
fitted — if it was a straight-duct geometry the correlation has no impingement
content and cannot be applied at a turning station. A grader should reward any
answer that names exposure time as one of the two.

**P2.** Pyrolysis gas leaving the surface has a normal velocity component that
thickens the boundary layer and displaces the high-gradient region away from
the wall. The convective heat transfer coefficient depends on the near-wall
temperature gradient, so pushing the gradient away reduces the flux — the same
mechanism as film cooling or transpiration cooling in a liquid engine, except
that here the coolant is the wall consuming itself.

Why the effect is proportionally largest at low crossflow: the blowing
parameter is the ratio of blown mass flux to free-stream mass flux, roughly
$\rho_w v_w / G$. The blown mass flux is set by the recession rate and the
insulation density and is nearly independent of $G$ at low $G$ (it is
radiation-driven there); the denominator is not. So at a forward dome with
$G \to 0$ the blowing parameter is large and the blockage is nearly complete,
while at an aft station with $G = 130$ kg/(m²·s) the same blown flux is a small
perturbation. Physically, this is why a low-flux station does not simply stop
charring but does char *slowly*: it is radiation-limited and blowing-blocked.

**P3.** Three reasons:

- **Chemical.** A fully cured, crosslinked EPDM presents a saturated,
  low-surface-energy, chemically dead surface. The propellant binder cures by
  urethane or epoxy chemistry that has nothing to react with. The result is at
  best a weak physical adhesion, not a covalent interface. The liner exists
  because it is applied at a *controlled partial cure state* so that it
  co-cures with the propellant binder across the interface.
- **Mechanical.** The modulus step from propellant (1–10 MPa) to insulation
  (3–20 MPa) to case (10⁵ MPa) concentrates stress. Without the compliant,
  tough liner interlayer the bimaterial corner and bondline stresses are
  carried in a zero-thickness plane with no toughening mechanism, and the
  failure becomes adhesive rather than cohesive.
- **Long-term.** No migration barrier. Plasticiser diffuses out of the
  propellant into the EPDM (which is an excellent solvent for it), stiffening
  the propellant precisely at the bondline and softening the insulation.
  Curative migrates and produces an off-ratio band. Ten years later the bond
  strength is unacceptable and nothing in acceptance testing would have caught
  it.

**P4.** A stress-relief boot is a *deliberate debond*: a defined region at a
grain end where the propellant is intentionally not bonded to the insulation,
so the propellant end can displace relative to the case without loading the
bonded bimaterial corner. It replaces a singular stress field with a compliant,
sliding, non-load-bearing interface.

Three features that keep it from behaving like an accidental debond:

1. **The insulation under the flap is sized for the full action time**, because
   the flap cavity is exposed from ignition. This is the feature most often
   missed.
2. **The cavity is long and blind enough that gas entering it stalls and cools**
   before it can reach the case, and the flap tip geometry does not admit a
   free-stream jet. Cavity length and gap are design parameters, not
   consequences.
3. **The flap tip cannot be peeled open by the pressurisation transient** — the
   tip is bonded or mechanically captured, the terminating geometry is a
   defined radius rather than a sharp scarf, and the pressure differential
   across the tip during ignition has been analysed.

A fourth acceptable answer: the flap boundary is *inspectable*, so that an
as-built flap can be distinguished from an as-built debond, which an
uncontrolled debond by definition is not.

**P5.** *Higher bore strain:* the composite case. Eq. 3.5 shows the driving
term is $(3\alpha_p - \alpha_c)$ and the relieving term is $2\alpha_c b^2$; a
carbon/epoxy case with $\alpha_c \approx 1\times10^{-6}$ K⁻¹ shrinks essentially
not at all, so the propellant's shrinkage is resisted almost completely and the
bore takes all of it. WE3's sanity check gives 20.5 % for carbon/epoxy against
18.1 % for steel on the same geometry.

*More demanding bondline limit:* the composite case again. The epoxy matrix
loses stiffness and strength through its glass transition in the 400–450 K
range; a steel case does not care until far higher. So $\delta_{\text{res}}$,
the residual virgin insulation, must be larger for the composite case.

*Same direction?* Yes, and that is the point — both effects penalise the
composite case, and both are paid to buy mass fraction (0.924 for monolithic
composite P120C versus ~0.85 for segmented steel [worksheet A.6, A.1]). A
strong answer notes that the mass-fraction gain is large enough that the
composite case still wins for anything that does not have to ship by rail, and
that the two penalties are *design* problems, not showstoppers.

**P6.**

- **Char rate** $\dot s_c$: rate of advance of the pyrolysis front into virgin
  material. Thermal.
- **Erosion rate** $\dot s_e$: rate of mechanical/chemical removal of char from
  the surface. Momentum and chemistry.
- **Surface recession rate**: the actual movement of the exposed surface, equal
  to $\dot s_e$; the char thickness is the difference of the integrals of the
  first two.

Regimes and stations:

- *Char fully retained* ($\dot s_e \approx 0$): the forward dome of a
  case-bonded motor. Low crossflow, radiation-limited heating, the char builds
  to several millimetres and does most of the insulating.
- *Char partly removed*: the mid-cylinder of a high-L/D motor. A quasi-steady
  char thickness is reached where formation balances shear removal.
- *Char fully swept* ($\dot s_e \approx \dot s_c$): the aft dome under a
  submerged nozzle, or a slot corner, where particle impingement removes char
  as fast as it forms. Here the char provides no benefit and the recession is
  the char rate.

**P7.** *Ballistic.* A single void adds only the surface it exposes, once, when
the burning front reaches it — a discrete step in $A_b$ at a predictable time.
Distributed porosity raises the *effective burn rate everywhere* (the flame
front follows a longer, rougher path and the effective density is lower), so
the whole pressure–time trace shifts up and the action time shortens, with no
single event to point at. It also raises the effective burn-rate exponent's
sensitivity, because the pores respond to pressure.

*Structural.* A single void is a stress concentrator at one location, and the
structural model can be re-run with it present. Distributed porosity lowers the
bulk modulus, the tensile strength, and the strain capability of the propellant
*as a material* — the properties you fed the structural model are wrong
everywhere. And the decisive practical point: a single void may be repairable
or dispositionable; distributed porosity is a property of the cast batch and the
motor is scrap.

**P8.** *Radiography* sees density contrast integrated along the beam. It is
good at voids, inclusions, porosity (as a density change), and cracks whose
plane contains the beam direction. It is blind to a tight interfacial debond —
two surfaces in contact with no gap have no density contrast — and to planar
defects perpendicular to the beam.

*Ultrasonics* sees acoustic impedance discontinuities. It is good at exactly
the interfacial debonds radiography misses, because a debond is an
elastomer/air/elastomer interface with a near-total reflection. It is blind
where the material is too attenuating (heterogeneous, filled propellant at
depth), needs surface access and coupling, and gives poor lateral resolution on
small defects.

*A defect neither would find:* a **kissing bond** — an interface that is in
intimate mechanical contact and transmits ultrasound almost perfectly, and has
no density contrast, but has essentially zero adhesive strength because the
surface was contaminated or the liner missed its tack window. This is the
canonical undetectable bond defect and it is the reason the bond system is
controlled by *process* (surface preparation records, tack-life clocks,
co-processed witness tabs) rather than by inspection. Acceptable alternative:
a slightly-under-thickness insulation ply that is uniform over a large area,
which radiography sees as a small density change indistinguishable from a
tolerance and ultrasonics reads as an in-family thickness.

### Calculation

**P9.** Material A: $\dot s = 0.10 + 0.0060(60) = 0.460$ mm/s.
$\delta_c = 0.460 \times 45 = 20.7$ mm.
$t_{\text{ins}} = 1.5(20.7) + 2.0 = \mathbf{33.1\ mm}$.
Areal mass $= 1{,}100 \times 0.0331 = 36.4$ kg/m².

Crossover: material B has $\dot s = 0.05 + 0.0030(60) = 0.230$ mm/s. Setting
areal masses equal at exposure time $t_e$:

$$ 1350\big[1.5(0.230)t_e + 2.0\big] = 1100\big[1.5(0.460)t_e + 2.0\big] $$
$$ 1350(0.345 t_e) + 2700 = 1100(0.690 t_e) + 2200 $$
$$ 500 = (759 - 465.75)t_e = 293.25\,t_e \;\Rightarrow\; t_e = \mathbf{1.7\ s} $$

**Interpretation, which is the real point of the problem:** at this mass flux
material B is lighter for any exposure longer than about two seconds — i.e.
essentially always. The higher density is irrelevant because it multiplies a
thickness that the recession rate has already halved. At $t_e = 45$ s, B gives
$t_{\text{ins}} = 17.5$ mm and 23.7 kg/m² against A's 36.4 kg/m² — a 35 % saving.
The reasons not to use B everywhere are not mass: they are char thermal
conductivity (bondline temperature), minimum manufacturable ply thickness at
thin stations, and the cost of a second bond qualification.

**P10.** $K_n = A_b/A_t = 4.20/0.0125 = 336.0$.

$$ p = (a\rho_p c^* K_n)^{1/(1-n)} = \big[(4.10\times10^{-5})(1760)(1520)(336)\big]^{1/0.7} $$

$a\rho_p c^* K_n = 36.85$, and $36.85^{1.4286} = 3.34\times10^{6}$ Pa.
$p_1 = \mathbf{3.34\ MPa}$.

With the void: $A_{b,2} = 4.55$ m², $A_{b,2}/A_{b,1} = 1.0833$.

$$ \frac{p_2}{p_1} = 1.0833^{1/0.7} = 1.0833^{1.4286} = 1.121 $$

$p_2 = 1.121 \times 3.34 = \mathbf{3.74\ MPa}$, a **12.1 % increase**.
MEOP $= 1.4 \times 3.34 = 4.67$ MPa. **Yes, still inside MEOP**, with the
pressure at 80 % of MEOP.

Comment a grader should want: an 8.3 % area error became a 12.1 % pressure
error, the $1/(1-n) = 1.43$ amplification. The motor survives, but the margin
has gone from 40 % to 25 %, and this defect has consumed nearly 40 % of the
case's design margin all by itself.

**P11.** Require $p_2 \le 10.35$ MPa with $p_1 = 6.90$ MPa, $n = 0.35$:

$$ \frac{A_{b,2}}{A_{b,1}} \le \left(\frac{10.35}{6.90}\right)^{1-n}
= 1.5^{0.65} = 1.3015 $$

$$ \Delta A_b \le 0.3015 \times 2.827 = 0.8526\ \mathrm{m^2} $$

The debond exposes the outer cylindrical surface at $R_c = 0.550$ m, so

$$ L_{\text{debond}} \le \frac{0.8526}{2\pi(0.550)} = \mathbf{0.247\ m} $$

which is $0.247/3.00 = \mathbf{8.2\ \%}$ of grain length.

*Comment.* Eight percent of the grain length — 247 mm on a 3 m grain — is the
entire allowance before the *equilibrium* pressure alone reaches MEOP, with no
allowance for the ignition transient overshoot, for the debond growing during
the burn (it will: the gas in the debond is at pressure and is peeling it), or
for any other defect. That is why interfacial defect acceptance criteria are
written in millimetres, not percent of length, and why a debond is dispositioned
categorically rather than by size. A strong answer notes that the real
allowable is far below 247 mm because a debond is not a static geometry.

**P12.** $\Delta T = 233 - 335 = -102$ K, $a = 0.120$, $b = 0.500$,
$b^2 = 0.2500$, $a^2 = 0.0144$, $b^2 - a^2 = 0.2356$.

$$ 2\alpha_c b^2 = 2(2.3\times10^{-5})(0.2500) = 1.150\times10^{-5} $$
$$ (3\alpha_p - \alpha_c) = 3.15\times10^{-4} - 2.3\times10^{-5} = 2.920\times10^{-4} $$
$$ (3\alpha_p - \alpha_c)(b^2-a^2) = 6.879\times10^{-5} $$
$$ \text{bracket} = 1.150\times10^{-5} - 6.879\times10^{-5} = -5.729\times10^{-5} $$
$$ \varepsilon_\theta = \frac{(-102)(-5.729\times10^{-5})}{2(0.0144)} = \frac{5.844\times10^{-3}}{0.0288} = 0.203 $$

$$ \varepsilon_\theta = \mathbf{20.3\ \%} $$

For 12 %, solve Eq. 3.5 for $a$ (iterate; the strain scales essentially as
$(b^2-a^2)/a^2$):

$$ a = \mathbf{0.152\ m} $$

Check: $a^2 = 0.02325$, $b^2-a^2 = 0.2268$, bracket
$= 1.150\times10^{-5} - 2.920\times10^{-4}(0.2268) = -5.472\times10^{-5}$,
$\varepsilon = 102(5.472\times10^{-5})/0.0465 = 0.120$. ✓

*Cost.* Propellant cross-sectional area per unit length:
before, $\pi(0.500^2 - 0.120^2) = 0.7402$ m²;
after, $\pi(0.500^2 - 0.152^2) = 0.7124$ m².
Loss $= 0.0278$ m² per metre, i.e. **3.8 % of the propellant** — and, more
importantly, a 27 % larger initial burning perimeter, which changes the whole
ballistic design (higher initial $K_n$, higher initial pressure, a more
progressive trace) and will force a nozzle throat resize. A grader should
reward any answer that notes the ballistic consequence, not just the volume.

**P13.** Aft cylinder, $G = 85$, $t_e$ now 55 s.

Material A: $\dot s = 0.610$ mm/s, $\delta_c = 33.55$ mm,
$t_{\text{ins}} = 1.5(33.55) + 1.5 = \mathbf{51.8\ mm}$, areal 57.0 kg/m².
Material B: $\dot s = 0.305$ mm/s, $\delta_c = 16.78$ mm,
$t_{\text{ins}} = \mathbf{26.7\ mm}$, areal 36.0 kg/m².

Band area $= 2\pi(0.550)(1.0) = 3.456$ m².
Mass with A $= 3.456 \times 0.0518 \times 1100 = 197.0$ kg.
Mass with B $= 3.456 \times 0.0267 \times 1350 = 124.4$ kg. **Use B.**

New total $= 412.6 - 127.4 \;(\text{old aft-cylinder mass in A}) + 124.4
= \mathbf{409.6\ kg}$.

The total moves by $-3.0$ kg, i.e. **it goes slightly down**. This is the
result the problem is designed to produce: a 57 % increase in exposure time at
the governing cylindrical station was absorbed with *no* mass penalty by
switching that station from A to B. Had the design been locked to material A,
the same burnback revision would have cost $197.0 - 127.4 = +69.6$ kg, a 17 %
increase in insulation mass. The lesson is that material choice per station is
the cheap lever and thickness is the expensive one, and that late burnback
revisions are survivable only if the material selection has not been frozen.

**P14.** $\kappa = k_i/(\rho_i c_{p,i}) = 0.25/(1100 \times 1500) =
1.515\times10^{-7}$ m²/s.

From Eq. 3.3 with $C = 1$, $\delta_c = \sqrt{\kappa t}$, so
$t = \delta_c^2/\kappa = (4.0\times10^{-3})^2 / 1.515\times10^{-7} =
\mathbf{105.6\ s}$.

*Comment.* Compare with the linear model's time to reach 4 mm of char at each
WE1 station: forward dome $4/0.130 = 30.8$ s; forward cylinder $4/0.190 =
21.1$ s; mid cylinder $4/0.340 = 11.8$ s; aft cylinder $4/0.610 = 6.6$ s; aft
dome $4/0.880 = 4.5$ s. Every station reaches 4 mm of char far sooner than pure
conduction into a semi-infinite solid would produce it, which tells you the
correct thing: these stations are **not conduction-limited**. The heat is
arriving faster than the virgin material can soak it, and the pyrolysis front
is being driven by the surface energy balance, not by diffusion. The $\sqrt{t}$
model is therefore only defensible for the first few seconds anywhere in this
motor, and the linear model is the right one for sizing at every station.
A student who reports 105.6 s and concludes "all stations are in the $\sqrt{t}$
regime" has the arithmetic right and the physics backwards — the comparison, not
the number, is the answer.

**P15.** Arrhenius scaling of the time to reach a fixed degradation:

$$ \frac{t_2}{t_1} = \exp\left[\frac{E_a}{R}\left(\frac{1}{T_2}-\frac{1}{T_1}\right)\right]
= \exp\left[\frac{85{,}000}{8.314}\left(\frac{1}{298}-\frac{1}{344}\right)\right] $$

$$ = \exp\left[10{,}224 \times 4.487\times10^{-4}\right] = \exp(4.588) = 98.3 $$

$$ t_2 = 180 \times 98.3 = 17{,}700\ \text{days} = \mathbf{48\ years} $$

Two reasons it may be badly wrong:

1. **Mechanism change.** At 344 K a reaction may run that does not run at
   298 K (or vice versa: a humidity-driven hydrolysis that dominates in a
   temperate magazine may be *suppressed* in a dry oven, so the accelerated test
   never sees the real life-limiting mechanism). A single $E_a$ fitted across a
   range that spans a mechanism change is a fitted number with no physical
   meaning, and extrapolating it 46 K is unjustified.
2. **The degradation is not a first-order rate process.** Plasticiser migration
   is diffusion-limited and its penetration depth goes as $\sqrt{Dt}$, so the
   bond-strength loss goes as $\sqrt{t}$ with the temperature dependence in $D$,
   not as a single exponential in $t$. Fitting a rate law of the wrong order
   over one temperature pair and extrapolating two orders of magnitude in time
   is where accelerated-ageing programmes go wrong.

Other acceptable answers: a single temperature point gives no confidence
interval on $E_a$ (three temperatures minimum); the fleet does not sit at a
constant 298 K but cycles, and cycling damage is not captured by an isothermal
Arrhenius model at all; and 48 years is far outside any validated
extrapolation range, so the honest statement is "longer than the required
service life by a comfortable margin, subject to surveillance," not "48 years."

### Engineering reasoning

**P16.** *Diagnosis:* failure path B — a gas path to the case leading to local
burn-through, with no change to burning surface. Specifically, aft-dome
insulation recession exceeded prediction in the impingement/slag region under
the submerged nozzle.

*What the normal pressure trace tells you:* it rules out path A entirely. There
was no added burning surface, so no crack, no grain debond, no propellant
exposure the ballistic model did not know about. It also tells you the burn-rate
and the nozzle throat behaved nominally, so the failure is local and thermal.
The burn-through happened late enough (or the hole was small enough) that it did
not vent measurably — 40 mm at 6–7 MPa is a substantial vent, so this also
argues the hole opened near the very end of the burn.

*Three measurements to add:*

1. **Bondline and in-depth thermocouple rakes in the aft dome**, at several
   circumferential and axial positions bracketing the impingement region. The
   absence of an aft-dome thermocouple is the actual process failure here: the
   station most likely to fail was the one station not instrumented.
2. **Post-test char-depth mapping on a dense grid in the aft dome**, not just
   at the hole — you need the recession *profile* to see where the peak is and
   whether the correlation is wrong in magnitude or in location.
3. **A subscale impingement-geometry char motor** with the flight propellant,
   to refit the recession correlation in a geometry that actually has flow
   turning in it. Additionally acceptable: high-speed thermal imaging of the
   external case surface during the test, which localises the hot spot in time
   and space and would have given a warning before the breach.

**P17.** *Mechanism:* plasticiser migration from the propellant into the liner
and insulation over ten years of storage (§3.5, §3.8). Curative migration is an
acceptable secondary answer but does not explain the *stiffening* of the
propellant as cleanly.

*The link between the stiff band and the adhesive failure:* the stiff band is
plasticiser-depleted propellant. It is stiffer and has lower strain capability
than the bulk. In a bond tensile test the applied displacement is now
accommodated almost entirely by the compliant bulk propellant and by the
interface, because the stiff band will not strain; the strain and hence the
stress concentrate at the interface plane instead of being smeared into the
propellant a millimetre away. The failure therefore moves from cohesive (in the
propellant, which is what a healthy bond does) to adhesive (at the liner). At
the same time the liner itself has *gained* plasticiser and softened, further
weakening the interfacial layer. Note the diagnostic trap: bulk propellant
properties at the bore are fine, so a surveillance programme that only pulls
bulk propellant specimens would have declared this motor healthy.

*Recommendation for the fleet:* this is a trend, not a single data point, so
first establish the trend — pull specimens from the earliest and latest
available surveillance units and fit bond strength against storage age and
against integrated thermal history. Meanwhile compute, with the structural
model, the bondline margin at the cold limit using the *measured* 60 % bond
strength; if the margin is lost, restrict the operational temperature envelope
(which raises the strain-driven bondline stress the least expensive way) rather
than grounding, and increase surveillance sampling rate. Establish a bond
strength floor and a projected date on which the fleet crosses it.

*Recommendation for the next production lot:* reformulate the liner as a
migration barrier — a higher-crosslink-density or filled barrier layer with low
plasticiser solubility — and requalify the bond system. Consider a
non-migrating or polymeric plasticiser in the propellant if the ballistics
allow. And add plasticiser concentration profiling (across the bondline, by
sectioning and extraction) as a standard surveillance measurement, since it is
the leading indicator and bond strength is the lagging one.

**P18.** *The first observation is a burn-rate effect and entirely expected.*
Propellant burn rate has a positive temperature sensitivity
$\sigma_p = (\partial \ln r/\partial T)_p$, typically 0.001–0.004 K⁻¹. A colder
grain burns slower, so $A_b$ generates less gas, so equilibrium pressure falls,
so — because $r$ also falls with pressure through the exponent — the action time
lengthens. The pressure change is amplified by $\pi_K = \sigma_p/(1-n)$
(module 20). Total impulse is roughly preserved; the trace is stretched and
lowered. Both motors being "within family" means the temperature sensitivity is
as characterised. This is not an insulation concern — although note in passing
that the *cold* motor has the longer action time and therefore the longer
exposure time at every station, so cold is the insulation-sizing case even
though hot is the pressure-sizing case. That observation is worth full credit.

*The second observation — a 20 % spike at 0.4 s decaying back to the cold family
trace — is the bonded-assembly concern.* A transient excess of burning surface
that then disappears is the signature of extra surface that burns itself out:
a **grain crack** at the bore that opened during cold soak (Eq. 3.5: the cold
motor is the one at maximum bore strain) and whose faces burn away and merge
into the general bore surface within a fraction of a second. Alternatives that a
grader should accept if argued: a small end-face debond that burns back to the
bonded region; or ignition-transient overshoot from an over-energetic igniter,
though that would appear on the hot motor too and would not be cold-specific.
The cold-specificity is the discriminator: a defect that appears only in the
cold motor is a thermal-strain defect, and thermal-strain defects live in the
grain and at the bondline. Recommended action: CT a cold-conditioned motor
before firing, not after.

**P19.** *Physical explanation.* The aft dome is the one station where the flow
turns and where the condensed phase leaves the streamlines. Alumina droplets
with high Stokes number impinge on the wall, delivering momentum and heat that
a boundary-layer correlation in $G$ does not represent, and molten slag pools
there under acceleration. Both mechanisms remove char mechanically, so the
recession is erosion-limited rather than char-rate-limited, and the peak sits
where the *particles* land — displaced toward the nozzle side, where the flow
turning is sharpest — not where the *gas* mass flux peaks.

*Why the correlation failed only there.* Eq. 3.2 is a boundary-layer
correlation fitted on subscale motors in an essentially straight-duct geometry.
It has no impingement term and no slag term, so it interpolates correctly at
every station where the flow is attached and parallel to the wall, and is
simply the wrong physics at the one station where it is not. The 10 % agreement
elsewhere is not evidence the correlation is good; it is evidence that the
cylindrical stations are inside the fit's validity range. This is the
extrapolation failure of §3.4: a safety factor of 1.5 on a prediction that is
1.7× low leaves you at 0.88 of requirement.

*Change in the next design:* an erosion-resistant compound (carbon-filled) in
the aft dome, thickness set by the *measured* 1.7× recession with the margin
applied on top of that, the peak thickness relocated to the measured peak, and
a smooth taper with no step in the impingement zone. Consider a nozzle-entry
geometry change to reduce turning severity if the ballistics allow.

*Change in the next analysis:* add a two-phase (Lagrangian particle) flow
solution that predicts impingement mass flux and angle, calibrate a separate
impingement recession correlation against a subscale motor *in the turning
geometry*, and stop applying the boundary-layer correlation outside the
geometry it was fitted in. And require thermocouple instrumentation in the aft
dome on every development static test.

**P20.** *For the reduction.* The safety factor exists to cover scatter in a
prediction, not error in the model. Ten flights with four dissections is real
evidence about both. If the four dissections show measured char depth within,
say, ±10 % of prediction at every station with no bias, then the model is
unbiased and the residual scatter is small; carrying 1.6 is then carrying mass
for a risk that has been retired by measurement. The mass is not free: on a
booster, insulation is 15–35 % of inert mass, and a 0.3 reduction in FS on the
char-depth term is a several-hundred-kilogram payload increment. Programmes that
never reduce FS after flight data are paying indefinitely for the ignorance of
their first design.

*Against.* Four samples is a small sample for a distribution whose tail is what
kills you, and ten flights is not ten independent tests of the aft dome if all
ten flew the same trajectory in the same season with propellant from the same
few batches. The dissected boosters are, by construction, the ones that
*survived* and were *recovered* — a selection effect. If recession scales with
things that vary (propellant lot particle size, initial grain temperature,
trajectory-dependent acceleration and slag behaviour), then the flight envelope
tested is narrower than the flight envelope certified. And the failure mode is
not graceful: unlike a structural margin, where exceedance gives yielding, an
insulation exceedance gives burn-through and loss of vehicle with no warning
and no abort.

*What would make it defensible:* dissection data showing (i) no bias and (ii)
scatter small enough that 1.3 covers, say, three standard deviations at *every*
station, not on average; the four motors spanning the propellant lot
distribution and the temperature/trajectory envelope; a demonstrated physical
model rather than a pure correlation, so extrapolation to untested conditions
is defensible; and the reduction applied *station by station* — 1.3 on the
cylinder where the physics is boundary-layer and well understood, and 1.6
retained at the aft dome where impingement is not.

*What would make it reckless:* a uniform reduction across all stations; a
reduction justified by "ten successes" rather than by measured char depths;
any station where the measurements show a bias, however small, because a factor
on a biased mean protects nothing; and any reduction taken at a station that
was not instrumented or dissected. **[J] Verdict: reduce to 1.3 on the
cylindrical stations, hold 1.6 in the aft dome and at every ply drop-off, and
book the mass saving that is actually earned.**

---

## K2. Quiz answers

**1. (6) — (c).** Low conductivity plus sacrificial pyrolysis and blowing.
(a) is backwards: conducting heat into the case is exactly the failure mode.
(b) reflection is not the mechanism — the char is a near-black absorber; it
handles radiation by re-radiating at high surface temperature and by consuming
the absorbed energy in pyrolysis. (d) there is no metallic phase-change filler
in internal insulation; that is a distractor borrowed from some ablators used
elsewhere.

**2. (8).** The two quantities are the **local recession rate** (set by mass
flux, pressure, particle impingement and radiation) and the **exposure time**
(set by the grain burnback at that station). They are often anticorrelated
because propellant is thickest where the port is narrowest: the forward dome is
covered by a thin propellant layer and is exposed almost from ignition but sits
in near-stagnant gas, while the mid-cylinder sits under the full web and is
exposed only near burnout but sees high mass flux. Full marks require both
quantities and a mechanism for the anticorrelation. Half marks for naming heat
flux and exposure time without the burnback reason.

**3. (10).** $\dot s = 0.10 + 0.0060(25) = 0.250$ mm/s.
$\delta_c = 0.250 \times 60 = 15.0$ mm.
$t_{\text{ins}} = 1.5(15.0) + 1.5 = \mathbf{24.0\ mm}$.
(Common slip: forgetting to apply FS to the char depth only and not to
$\delta_{\text{res}}$; applying it to both gives 24.75 mm and loses 3 marks.)

**4. (8).** The **carbon/epoxy case is worse**. Eq. 3.5's relieving term is
$2\alpha_c b^2$ and its driving term is $(3\alpha_p - \alpha_c)(b^2-a^2)$; with
$\alpha_c \approx 10^{-6}$ K⁻¹ the case shrinks essentially not at all, so it
resists the propellant's shrinkage almost completely and the bore absorbs all
of it. WE3: 20.5 % for carbon/epoxy versus 18.1 % for steel on identical
geometry. Answers saying "steel, because steel is stiffer" get zero — the case
is treated as rigid in both cases; it is the *CTE*, not the modulus, that
matters here.

**5. (12).** $p_2/p_1 = 1.18^{1/(1-0.40)} = 1.18^{1.6667} = \mathbf{1.318}$.
$p_2 = 1.318 \times 7.0 = \mathbf{9.22\ MPa}$. MEOP is 10.5 MPa, so
**yes, still inside MEOP**, at 88 % of it. Full marks require the exponent
$1/(1-n) = 1.667$, the ratio, and the MEOP comparison. Note for discussion: an
18 % area error consumed 63 % of the case margin.

**6. (8).** Two marks each for three species plus one for coherence:

- **Plasticiser** — diffuses out of the propellant into liner and insulation;
  stiffens the propellant at the bondline (lowering local strain capability
  exactly where strain concentrates) and softens the liner.
- **Curative (isocyanate/aziridine)** — migrates across the interface producing
  a locally off-ratio band, under- or over-cured, a few hundred microns wide;
  under-cured propellant at the bondline is a low-strength layer where the
  stress is highest.
- **Water / ammonia** — humidity ingress and ammonia off-gassed by AP hydrolyse
  urethane and ester linkages and attack adhesion directly; moisture also
  mobilises AP at the interface.

**7. (10).** This is **path B**, a gas path to the case producing local
burn-through with no change in burning surface. The normal pressure trace rules
out path A entirely: no crack, no propellant debond, no exposed propellant
surface the ballistic model did not know about — because any of those would
have raised $A_b$ and hence pressure by $(A_{b2}/A_{b1})^{1/(1-n)}$. It also
confirms the burn rate, throat and nozzle behaved nominally, so the fault is
local and thermal, i.e. insulation recession exceeded prediction or the
as-built thickness was under drawing at that station.

**8. (12).** $\Delta T = 240-330 = -90$ K, $b^2 = 0.3600$, $a^2 = 0.0324$,
$b^2-a^2 = 0.3276$.
$2\alpha_c b^2 = 8.640\times10^{-6}$;
$(3\alpha_p-\alpha_c) = 2.580\times10^{-4}$;
$(3\alpha_p-\alpha_c)(b^2-a^2) = 8.452\times10^{-5}$;
bracket $= -7.588\times10^{-5}$;
$\varepsilon_\theta = (-90)(-7.588\times10^{-5})/(2 \times 0.0324) =
6.829\times10^{-3}/0.0648 = \mathbf{0.105}$, i.e. **10.5 %**.

*Over-estimate assumption (any one):* perfect incompressibility — real
propellant at $\nu = 0.4995$ can absorb a little volumetric strain, relieving a
few percent; or the neglect of viscoelastic stress relaxation during a slow
cooldown; or the neglect of liner and insulation compliance, which are softer
than the case and let the outer boundary move.

*Under-estimate assumption (any one):* the case is treated as rigid *and* as
following its own free CTE, whereas a real case is loaded outward by the grain
and a real cooldown is not uniform — a transient with a cold bore and a warm
interior produces a larger instantaneous bore strain than the isothermal result;
or the neglect of the superposed ignition pressurisation strain and of ageing
knockdown on capability, which are not in Eq. 3.5 at all and make the *margin*
worse even if not the strain.

**9. (14).** Defensible answer either way; marks are for the reasoning, not the
choice. The expected strong answer:

**Choose carbon-filled for the aft dome, conditionally.** Halving the recession
rate roughly halves the thickness, and $0.5 \times 1.3 = 0.65$, so the areal
mass falls about 35 % despite the higher density — at the aft dome, which is
the single heaviest insulation station in the motor. That is where the mass is,
so that is where the material change pays.

**The analysis to insist on before committing:** a bondline thermal model with
the carbon-filled char's *measured* conductivity. Three times the char
conductivity means the char is a much poorer insulator per millimetre, so the
residual virgin layer $\delta_{\text{res}}$ needed to hold the bondline below
420 K grows — and with a carbon/epoxy case that limit is set by the matrix, not
by the structure, and it is unforgiving. You must also see the recession data
in an *impingement* geometry, not a duct, because the aft dome is where
impingement dominates and the "half the recession" claim was probably measured
in a duct.

**What would reverse the choice:** if the thermal model shows
$\delta_{\text{res}}$ has to grow by more than roughly the thickness saved —
i.e. if the required total thickness converges on the aramid solution — then
carbon-filled buys nothing and costs a second bond qualification and a splice.
Also reversing: if the char, though slower to recede, is found to crack or
delaminate under thermal cycling (carbon-filled compounds are stiffer and less
compliant, and the aft dome is a doubly-curved region the case strains at
ignition), or if the impingement-geometry data show the recession advantage
disappears in the geometry that matters.

Marks: 4 for the mass argument done with numbers; 5 for identifying char
conductivity → bondline temperature → $\delta_{\text{res}}$ as the coupled risk;
5 for a specific, falsifiable reversal criterion. An answer that chooses
carbon-filled purely because "less recession is better" gets 4 of 14.

**10. (12).** *Design intent:* the putty was the **primary thermal barrier**,
packed into the insulation gap so that combustion gas never reached the
O-rings; the rings were a pressure seal, not a thermal component, and were
supposed to see benign temperatures.

*Two mechanisms of failure:* (i) the putty was not a continuous barrier —
pressurisation could form **blow holes**, channels through the putty that jetted
hot gas directly at the primary O-ring; and (ii) **joint rotation** — ignition
pressure deflected the tang and clevis legs apart, opening the gap the ring had
to extrude into at exactly the moment the ring was coldest, stiffest and
slowest to respond. (Accept "cold-stiffened O-ring resilience" as part of (ii).)

*The general principle:* **a thermal component whose as-installed condition
cannot be verified is not a thermal component — it is a hope.** The putty's
function was "the O-ring never gets hot", but its installed state was
hand-worked and uninspectable, so the programme ended up managing the
observable downstream symptom (soot and erosion on recovered rings) instead of
the barrier that was supposed to make that symptom impossible. Design
insulation details so that the thing that protects the critical part is itself
verifiable, or you will end up certifying by the condition of the part it was
supposed to protect. [Rogers86]

---

## K3. Trade-study reference solution (P21)

### The arithmetic first

With FS = 1.5 and $\delta_{\text{res}} = 3.0$ mm (larger than WE1's 1.5 mm
because the composite case's 425 K bondline limit is tighter than a steel
case's), taking aramid-filled EPDM as the reference material with
$\dot s\,[\mathrm{mm/s}] = 0.10 + 0.0060\,G$, low-density at $1.6\times$ that
recession and carbon-filled at $0.5\times$:

| station | $G$ | $t_e$ | aramid (1,050) | low-density (800) | carbon (1,350) |
|---|---|---|---|---|---|
| Forward dome | 8 | 90 | 23.0 mm, **24.1 kg/m²** | 35.0 mm, 28.0 kg/m² | 13.0 mm, 17.5 kg/m² |
| Cylinder | 60 | 25 | 20.3 mm, **21.3 kg/m²** | 30.6 mm, 24.5 kg/m² | 11.6 mm, 15.7 kg/m² |
| Aft dome | 140 | 95 | 137.0 mm, **143.8 kg/m²** | 217.3 mm, 173.9 kg/m² | 70.0 mm, 94.5 kg/m² |

**The decisive number:** low-density EPDM is *heavier at every station*. Its
density advantage is $800/1050 = 0.762$; its recession penalty is $1.6$; the
product is $1.22$. Because thickness scales with recession and mass scales with
thickness × density, a low-density material only wins if
$(\rho_{\text{new}}/\rho_{\text{ref}}) \times (\dot s_{\text{new}}/\dot
s_{\text{ref}}) < 1$. Here it is 1.22, so it loses — by 16 % at the forward
dome, 15 % on the cylinder, and 21 % in the aft dome. Carbon-filled has a
product of $1.286 \times 0.5 = 0.64$ and wins everywhere on mass.

### Recommendation

**None of the four options as written is correct; the right design is option B
with the cylinder material corrected from low-density EPDM to aramid-filled
EPDM — i.e. aramid-filled everywhere except a carbon-filled aft dome.**

If forced to pick from the four as stated: **B**, because it is the only one
that puts an erosion-resistant material where the mass actually is, and its
error (low-density on the cylinder) costs about 3 kg/m² over the cylinder while
its correct decision (carbon in the aft dome) saves about 49 kg/m² over the
aft dome. A candidate who picks B, states that the low-density choice on the
cylinder is wrong and why, and proposes the correction, has produced the best
possible answer.

**Rejecting the others:**

- **(A)** Single-material aramid is the qualified, schedule-safe answer and is
  the fallback. But it leaves 49 kg/m² on the table in the aft dome, and the
  programme is 4 % over its inert budget. On a 1.8 m motor the aft dome is of
  order 5 m² of surface, so that is roughly 250 kg — very likely the entire
  overrun. A is the answer if the schedule risk in §"largest remaining risk"
  below cannot be retired.
- **(C)** Low-density everywhere is the trap option. It is heavier than A at
  every station and it drives the aft dome to 217 mm of insulation, which is a
  volume and a thermal-soak problem in its own right and eats propellant
  volume. Any candidate who chooses C on the grounds that "low density means
  low mass" has not done the arithmetic and should not pass.
- **(D)** A rigid silica-phenolic hard insert bonded into the aft dome of a
  filament-wound composite case is structurally wrong. The case strains 1–2 %
  in hoop at pressurisation and the aft dome is doubly curved; a rigid,
  low-strain-capability phenolic insert bonded to it will debond at its edges,
  and its edges are a step in an impingement region — the worst possible place
  for a discontinuity. It also adds an insert-to-insulation joint that is a new
  gas path to the case. Hard inserts belong in nozzles, where the substrate is
  stiff, not on a case wall that has to strain. Rejecting D on the strain
  argument is worth full marks by itself.

### Justification against each constraint

**Inert mass.** The recommendation saves ≈ 49 kg/m² over ≈ 5 m² of aft dome
relative to A, of order 250 kg, which is the plausible size of the 4 % overrun.
It is the only lever in this problem large enough to close the gap.

**Thermal risk.** Carbon-filled char has roughly three times the thermal
conductivity of aramid-filled char. Halving the recession does not halve the
bondline temperature; with a more conductive char the heat arrives at the
virgin/char interface faster for the same recession, so $\delta_{\text{res}}$
must be re-derived, and against a 425 K epoxy-matrix limit that is not a
formality. This is the largest technical risk in the recommendation.

**Structural interaction.** The grain analysis already shows only 1.4 margin on
cold bore strain at 233 K, and the case is near-zero-CTE carbon/epoxy, which
per Eq. 3.5 makes bore strain worse than a steel case would. Insulation choice
does not directly change bore strain, but three couplings matter: (i) thicker
insulation reduces the grain outer radius $b$, which slightly *reduces* bore
strain — a small argument in favour of the thicker aramid design, worth naming;
(ii) a stiffer carbon-filled insulation at the aft dome changes the compliance
of the bondline at the aft grain end, where the boot is; (iii) the material
splice must not be placed at a grain end or a boot tip, where the bondline
stresses live. Put the splice mid-dome, in a region under compression, and
away from any flap.

**Qualification cost and schedule.** This is the binding constraint. There is
qualification data on aramid-filled EPDM only, and 14 months to first static
test. Adding carbon-filled means: a new case-to-insulation bond qualification,
a new insulation-to-liner bond qualification, a splice qualification, ageing
coupons started immediately, and a recession correlation for the new material
in the right geometry. Fourteen months is achievable only if the coupon and
subscale programme starts in parallel with the design, not after it.

### The largest remaining risk, and how to retire it

**Risk:** that the carbon-filled aft-dome design does not actually save mass
once $\delta_{\text{res}}$ is re-derived against the 425 K bondline limit with
the real char conductivity — and, coupled to that, that the "0.5× recession"
figure was measured in a duct geometry and does not hold under impingement.

**Measurement:** a subscale char motor, in an **impingement geometry
representative of the submerged nozzle aft dome**, firing the flight propellant,
with both candidate materials in the same motor, instrumented with in-depth and
bondline thermocouple rakes. Two outputs: the recession ratio in the geometry
that matters, and the measured bondline temperature history from which
$\delta_{\text{res}}$ is derived directly rather than assumed.

**If it comes back unfavourable** — the recession ratio is 0.8 rather than 0.5
under impingement, or $\delta_{\text{res}}$ for the carbon-filled compound has
to grow to 8–10 mm — then the mass saving collapses and the answer reverts to
**option A**, single-material aramid-filled, tapered. The 4 % inert overrun then
has to be found elsewhere: nozzle mass, skirt structure, or, if nothing else is
available, a reduction in the safety factor on the *cylindrical* stations only,
supported by the same subscale data. A candidate who names a concrete fallback
and a concrete alternative source of mass is doing the job; one who says "then
we would re-evaluate" is not.

### Rubric

| element | marks |
|---|---|
| Computes areal mass, not thickness, and states the $\rho \times \dot s$ product criterion | 20 |
| Identifies that low-density EPDM is heavier here and rejects C explicitly on the arithmetic | 15 |
| Rejects D on the rigid-insert-on-a-straining-composite-case argument | 15 |
| Recommends carbon-filled in the aft dome and justifies it by where the mass is | 15 |
| Identifies char conductivity → bondline temperature → $\delta_{\text{res}}$ as the coupled risk against the 425 K limit | 15 |
| Names a specific, falsifiable measurement (impingement-geometry subscale motor with bondline thermocouples) | 10 |
| States a concrete fallback if the measurement is unfavourable | 10 |

**Loses marks for:** choosing on density alone; ignoring the 425 K bondline
limit; forgetting that the aft dome dominates the mass and optimising the
cylinder; proposing a hard insert without addressing case strain; treating the
qualification schedule as free; failing to say where the material splice goes.

---

## K4. Common wrong answers and what they reveal

**"Thickest insulation goes where the gas is hottest."** The gas is essentially
the same temperature everywhere in the port. This answer reveals a student
carrying liquid-engine intuition, where the wall heat flux really does peak at
the throat and the design follows the flux map. In a solid motor the flux map is
only half the problem and exposure time is the other half. Diagnostic: ask them
to explain WE1's forward dome.

**Applying the safety factor to the whole thickness including
$\delta_{\text{res}}$.** Arithmetically small, conceptually revealing: the
factor covers scatter in the *predicted char depth*, which is the uncertain
quantity. The residual virgin layer is a deterministic thermal requirement
derived from a model with its own margin. Multiplying them together
double-counts and, worse, suggests the student does not know what the safety
factor is protecting against.

**Treating a crack and a debond as the same class of defect.** WE2 gives 2.2 %
versus 570 %. Students who compute the crack case and stop have not internalised
that the severity is set by *how much area the defect can expose*, and that an
interfacial defect can expose the entire flank of the grain while a bulk defect
can only expose twice its own faces. This is the single most important
quantitative intuition in the module.

**Forgetting that the crack case is a lower bound.** The opposite error: a
student who computes 2.2 % and declares the crack benign. Gas generated inside
a deep narrow crack has to vent through the crack mouth; local pressure exceeds
chamber pressure; that drives the crack open; the area grows. Whether a crack
runs away is a fracture problem, and the $K_n$ arithmetic is the floor.

**Using $p_2/p_1 = A_{b2}/A_{b1}$ without the exponent.** Drops the
$1/(1-n)$ amplification and understates every defect consequence by 40–80 %.
Reveals that the student memorised $p \propto K_n$ rather than deriving the
equilibrium condition from mass balance with $r = ap^n$.

**Answering "steel case, because steel is stiffer" on the thermal strain
question.** Both cases are treated as rigid; it is the CTE, not the modulus,
that appears in Eq. 3.5. A near-zero-CTE composite case is *worse*. This is a
reliable discriminator between students who used the equation and students who
pattern-matched "composite is better."

**Reporting a bore strain of 0.98 % (the raw CTE mismatch) instead of 18 %.**
Reveals that the geometric amplification — the incompressibility argument that
forces all the volumetric shrinkage out through the bore — has not been
understood at all. The mismatch strain is what a *thin* grain would see; a
thick-web grain amplifies it by $\approx 3(b^2-a^2)/(2a^2)$.

**Believing that a stress-relief boot solves the bore-strain problem.** It does
not; bore strain is a bulk effect from volumetric shrinkage and a boot at the
grain end does nothing about it. The boot solves the *bondline corner*
singularity, which is a different, usually earlier, failure. Students who
conflate them will propose boots as a fix for cold-temperature grain cracking
and be wrong.

**Choosing low-density insulation on density alone (trade study option C).**
The criterion is $\rho \times \dot s$, not $\rho$. Reveals a student optimising
the visible parameter rather than the objective function, which in propulsion
is the most common single failure of engineering judgment.

**Treating accelerated ageing as a solved extrapolation.** Reporting 48 years
from P15 with no caveat reveals a student who can do Arrhenius arithmetic and
does not know that the whole difficulty is mechanism equivalence and reaction
order. The right answer to "what is the service life" is never a number from a
single accelerated test; it is a number plus a surveillance programme that will
correct it.

**Assuming NDE covers the bond.** Students consistently propose "inspect for
debonds" as the fix for every bond problem. Kissing bonds have no density
contrast and transmit ultrasound; they are invisible. Bond integrity is
controlled by process — surface preparation records, tack-life clocks, witness
tabs — and inspection is a backstop. A student who understands this will propose
process controls first; one who does not will propose more CT.
