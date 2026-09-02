# Module 22 — Solid Motor Cases
Part III · Prerequisites: modules 20, 21 · Estimated time: 6 h

A solid rocket motor case is the only pressure vessel in aerospace that is
also the primary structure of the vehicle, the mould for the propellant, the
mounting ring for the nozzle, the thrust path to the payload, and — for a
booster — the thing that has to survive being dropped on a rail car. It is
easy to treat it as "the tube the propellant lives in" and size it in ten
minutes from hoop stress. That is how you get a case that passes hydroburst
at 1.5 × MEOP and then fails in flight, because nobody checked the axial
load from a gimballed nozzle at 7° with 6 MN of thrust behind it, or because
a 2 mm grinding scratch under a skirt bond went critical at proof-pressure
stress in a material with 90 MPa√m of toughness. The case is where the
propellant chemist's beautiful 0.93 mass fraction is either realised or
thrown away, and it is where the two most instructive structural failures in
the history of solid propulsion happened: the Titan IV SRMU case that burst
on a test stand in 1991, and the joint on the right-hand Shuttle booster on
28 January 1986.

---

## 1. Learning objectives

After this module you should be able to:

1. Derive the thin-wall hoop and axial (longitudinal) membrane stresses in a
   cylindrical case from a free-body cut, and state the thin-wall validity
   limit.
2. Size a metallic case wall for a given internal diameter, MEOP, burst
   factor and material allowable, and compute the resulting mass per unit
   length.
3. Define MEOP, proof pressure, burst factor and ultimate factor of safety,
   and explain what each one screens for; place `[SP-8025]`, `[AIAA-S-080]`
   and `[AIAA-S-081]` in that framework.
4. Compute a critical surface-flaw size from $K_{Ic}$ and the operating hoop
   stress, and argue from it what the NDE acceptance threshold must be.
5. Perform a netting analysis of a filament-wound cylinder: given internal
   pressure, radius, helical winding angle and fibre allowable, return the
   helical and hoop fibre thicknesses.
6. Compute the ideal pressure-vessel performance index $PV/W$ for a metal
   and a composite case and rank candidate materials with it.
7. Propagate a case-mass change into the motor propellant mass fraction and
   into stage $\Delta v$, and state the sensitivity per 1000 kg of inert
   mass.
8. Explain the clevis–tang field joint at architecture level, the joint
   rotation mechanism, why it made the seal rate-dependent and
   temperature-dependent, and what the RSRM capture feature changed.
9. Name the structural loads a case sees besides internal pressure, and say
   which one sizes which part of the case.
10. Describe hydroburst, proof and NDE testing: what is measured, with what,
    and what a bad article looks like in the data.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Internal (bore) radius | $R$ | m | inside radius of the case cylinder |
| Wall thickness | $t$ | m | membrane thickness of the case wall |
| Mean radius | $R_m$ | m | $R + t/2$; used for mass, not for stress, in thin-wall work |
| Internal pressure | $p$ | Pa | gauge pressure inside the case |
| Maximum expected operating pressure | MEOP | Pa | the highest pressure the case sees in any credible service condition, including hot-day propellant and ignition overshoot |
| Proof pressure | $p_{pr}$ | Pa | pressure each flight article is taken to on the ground as an acceptance screen |
| Burst pressure | $p_b$ | Pa | pressure at which the case ruptures; the design target is a factor above MEOP |
| Burst factor | $j_b$ | — | $p_b/\mathrm{MEOP}$, the design ultimate factor of safety on pressure |
| Hoop (circumferential) stress | $\sigma_\theta$ | Pa | membrane stress around the circumference |
| Axial (longitudinal, meridional) stress | $\sigma_z$ | Pa | membrane stress along the motor axis |
| Ultimate tensile strength | $F_{tu}$ | Pa | material allowable in tension at ultimate |
| Yield strength | $F_{ty}$ | Pa | 0.2 % offset yield allowable |
| Plane-strain fracture toughness | $K_{Ic}$ | Pa·m$^{1/2}$ | resistance to unstable crack growth |
| Stress-intensity factor | $K_I$ | Pa·m$^{1/2}$ | crack-tip driving parameter |
| Critical flaw depth | $a_c$ | m | flaw depth at which $K_I = K_{Ic}$ at the operating stress |
| Material density | $\rho$ | kg/m³ | case material density |
| Propellant density | $\rho_p$ | kg/m³ | cured propellant density |
| Helical winding angle | $\alpha$ | rad (quoted in °) | angle between the fibre path and the motor axis |
| Helical layer thickness | $t_\alpha$ | m | fibre-only thickness of the helical (±α) layers |
| Hoop layer thickness | $t_{90}$ | m | fibre-only thickness of the circumferential layers |
| Fibre allowable stress | $\sigma_f$ | Pa | delivered (translated) fibre stress at burst in a wound vessel |
| Fibre volume fraction | $V_f$ | — | fibre volume / laminate volume |
| Laminate thickness | $t_L$ | m | $(t_\alpha + t_{90})/V_f$, the physical wall thickness |
| Vessel performance index | $PV/W$ | m | $pV/(mg_0)$ at burst; a length, the classic pressure-vessel figure of merit |
| Case mass per unit length | $m'$ | kg/m | membrane mass of one metre of cylinder |
| Propellant mass | $m_p$ | kg | loaded propellant mass |
| Inert (dry) mass | $m_i$ | kg | motor mass less propellant |
| Propellant mass fraction | $\zeta$ | — | $m_p/(m_p+m_i)$ |
| Volumetric loading fraction | $\eta_V$ | — | propellant volume / case internal volume |
| Chamber pressure | $p_c$ | Pa | operating pressure from Module 20 |
| Joint rotation | $\delta_\theta$ | rad | relative angular opening of a clevis–tang joint under pressure |
| Interference / squeeze | — | m | radial compression designed into an O-ring seal |
| Thrust | $F$ | N | motor thrust |
| Gimbal angle | $\delta$ | rad (quoted in °) | nozzle deflection from the motor axis |

---

## 3. Theory

### 3.1 What the case actually has to do

Five jobs, and they conflict.

1. **Contain the combustion pressure** for the burn duration at temperature,
   with a margin against burst.
2. **Carry the vehicle's structural loads.** For a strap-on booster the case
   is the load path from the aft attach to the forward attach: axial thrust,
   bending from aerodynamic angle of attack, shear from the vehicle stack.
   For an all-solid stage the case is the airframe.
3. **React the nozzle loads.** The aft dome carries the entire thrust of the
   motor, plus, if the nozzle gimbals, a side force and a bending moment that
   the boss and the aft dome must feed into the cylinder.
4. **Be the tool the grain is cast in.** The insulation is bonded to the case
   and the propellant is bonded to the insulation, so the case's inner
   surface finish, its dimensional stability during cure at 50–65 °C, and its
   ability to be handled with a 120-tonne slug of viscoelastic solid inside
   it are design requirements, not afterthoughts.
5. **Survive everything that is not flight**: hydroproof, transport,
   handling, storage for 10–25 years in a silo or a magazine, thermal cycling
   between −40 °C and +60 °C, and (for a recovered booster) salt water.

The pressure job sets the wall thickness of the cylinder in almost every
case. The other four set the domes, the bosses, the skirts, the joints and
about half the total case mass. [J] A useful rule when reading a case mass
budget: the membrane cylinder is typically 55–75 % of case mass, and the
remainder is domes, bosses, skirts, attach rings and joints — the parts that
exist because of jobs 2 through 5.

### 3.2 Membrane stresses in a thin-walled cylinder — derivation

Take a closed cylinder of internal radius $R$, wall thickness $t$, internal
gauge pressure $p$, with $t \ll R$. Cut it in half with a plane containing
the axis, of length $L$. The pressure acts on the projected area $2RL$ and
must be reacted by the two wall cuts, each of area $tL$:

$$p\,(2RL) = 2\,\sigma_\theta\, t L \qquad \Rightarrow \qquad
\boxed{\;\sigma_\theta = \frac{pR}{t}\;}$$

> **Eq. 3.1 (hoop stress)** — variables: $\sigma_\theta$ [Pa],
> $p$ internal gauge pressure [Pa], $R$ internal radius [m], $t$ wall
> thickness [m]. Meaning: the circumferential tension per unit wall area
> that keeps the cylinder from unzipping along a generator. Assumes: thin
> wall ($t/R \lesssim 0.1$), membrane behaviour (no through-thickness
> bending), uniform pressure, far from discontinuities. Fails: within about
> $\sqrt{Rt}$ of any dome junction, joint, boss or thickness step, where
> bending boundary layers add local stress; and for thick walls, where the
> Lamé solution must be used and the inner-surface stress exceeds Eq. 3.1.
> [F]

Now cut the cylinder with a plane normal to the axis. Pressure acts on the
end area $\pi R^2$ and is reacted by the annular wall of area $2\pi R t$:

$$p\,\pi R^2 = \sigma_z \, 2\pi R t \qquad \Rightarrow \qquad
\boxed{\;\sigma_z = \frac{pR}{2t} = \frac{\sigma_\theta}{2}\;}$$

> **Eq. 3.2 (axial membrane stress)** — variables as Eq. 3.1;
> $\sigma_z$ [Pa] is the meridional membrane stress. Meaning: the axial
> tension that carries the pressure load on the domes back through the
> cylinder. Assumes: closed vessel, pressure-only loading, thin wall.
> Fails: when external axial load is present — a gimballed nozzle, stack
> compression, or a bending moment adds to or subtracts from this term, and
> in a booster in max-Q the compressive side of the bending distribution can
> drive $\sigma_z$ negative and turn the case into a buckling problem
> (`[SP-8007]`). [F]

**The 2:1 ratio is the single most consequential fact about pressure vessel
design.** A cylinder loaded only by internal pressure is twice as highly
stressed circumferentially as axially. Three consequences follow directly:

- An isotropic metal case sized by hoop stress has 100 % margin in the axial
  direction. That "wasted" axial capability is what absorbs flight bending
  and gimbal loads for free, which is one reason steel cases are more
  forgiving than their mass suggests.
- A composite case can be *tailored* to the 2:1 ratio and therefore beats the
  metal by more than the raw specific strength ratio predicts (§3.9). It also
  has *no* free margin, which is why composite cases need explicit analysis of
  every non-pressure load case.
- A pressurised cylinder fails by a **longitudinal** crack, not a
  circumferential one, because the crack opens against the larger stress.
  Every case burst photograph shows an axial split. If your test article
  split circumferentially, you had an axial load you did not know about.

Thick-wall check: the exact (Lamé) inner-surface hoop stress for a cylinder
of inner radius $a$, outer $b$ is $\sigma_\theta(a) = p(b^2+a^2)/(b^2-a^2)$.
At $t/R = 0.1$ this exceeds Eq. 3.1 by about 5 %; at $t/R = 0.05$, by 2.5 %.
[A] Solid motor cases run $t/R \approx 0.005$–$0.02$, so the membrane
solution is good to better than 1 % and the error is far smaller than the
material allowable's scatter.

### 3.3 Domes

The domes close the ends. For an axisymmetric membrane shell with meridional
radius of curvature $r_1$ and circumferential radius $r_2$, equilibrium
normal to the surface gives the general membrane shell equation:

$$\frac{\sigma_1}{r_1} + \frac{\sigma_2}{r_2} = \frac{p}{t}$$

> **Eq. 3.3 (Laplace–Young membrane shell equation)** — variables:
> $\sigma_1$ meridional and $\sigma_2$ circumferential membrane stress [Pa],
> $r_1, r_2$ principal radii of curvature [m], $p$ [Pa], $t$ [m]. Meaning:
> pressure is carried by the *curvature* of the shell, not by bending.
> Assumes: membrane state (no moments), smooth continuous shape, thickness
> small compared to both radii. Fails: at the dome–cylinder junction of any
> dome that is not tangent-continuous *and* curvature-compatible, and near
> the polar opening; both need a bending analysis or a local thickening.
> [F]

For a **hemisphere**, $r_1 = r_2 = R$ and $\sigma_1 = \sigma_2 = pR/2t$: half
the cylinder's hoop stress, which is why a spherical vessel is the lightest
possible shape per unit volume and why nobody builds a spherical solid motor
(you cannot get propellant volume into it efficiently, and you cannot mount a
nozzle on it without ruining the membrane state).

For a **2:1 ellipsoidal dome** (semi-major $R$, semi-minor $R/2$), the
circumferential stress at the equator goes *compressive*. That compressive
hoop ring is a real buckling concern in thin metal domes and is why many
solid motor domes are torispherical or, in composites, **geodesic isotensoid**
shapes derived from the winding path rather than chosen from a catalogue
(§3.9).

The dome shape is also a volumetric-efficiency decision. A hemispherical dome
adds $\tfrac{2}{3}\pi R^3$ of volume for $2\pi R^2$ of surface; an elliptical
2:1 dome adds $\tfrac{1}{3}\pi R^3$ for roughly $1.4\pi R^2$. [J] For a long
booster the domes are a small fraction of the volume and you shape them for
mass and for the winding path; for a short apogee motor the domes *are* the
motor and you go as close to spherical as the nozzle and igniter bosses
allow.

### 3.4 MEOP, proof, burst, and the standards framework

The pressure that sizes the case is not the nominal chamber pressure from
Module 20. It is the **maximum expected operating pressure**, and building
it requires stacking every effect that raises pressure:

$$\mathrm{MEOP} = p_{c,\mathrm{nom}} \times k_{T} \times k_{\mathrm{ign}}
\times k_{\mathrm{mfg}} \times k_{\mathrm{stat}}$$

> **Eq. 3.4 (MEOP build-up)** — variables: $p_{c,\mathrm{nom}}$ nominal
> equilibrium chamber pressure [Pa]; $k_T$ hot-day temperature-sensitivity
> factor (from $\pi_K = \sigma_p/(1-n)$, Module 20 — a $\sigma_p$ of
> 0.002 K⁻¹ with $n=0.35$ gives $\pi_K \approx 0.0031$ K⁻¹, so +30 K of
> propellant conditioning is about +9.7 % pressure); $k_{\mathrm{ign}}$
> ignition-transient overshoot; $k_{\mathrm{mfg}}$ burn-rate and throat-area
> manufacturing tolerance; $k_{\mathrm{stat}}$ the statistical allowance
> (typically a 3σ or 99.865 % upper bound). Meaning: the design pressure is a
> *worst credible stack*, not a mean. Assumes: the factors are independent
> and multiplicative. Fails: when a factor is not independent — throat
> erosion and burn rate are correlated through the same propellant batch —
> and when a genuinely off-nominal event (a grain crack raising burning area,
> Module 21) is outside the stack entirely. [E]

[J] For a well-characterised large booster MEOP typically lands 10–25 % above
nominal $p_c$; for a tactical motor that must fire at +71 °C after storage,
the temperature term alone can be +25 % and MEOP can be 1.5 × the 21 °C
nominal. This is why tactical motors look absurdly heavy on a
pressure-per-kilogram basis: they are not sized for the pressure they usually
see.

From MEOP the design pressures follow:

$$p_b = j_b\,\mathrm{MEOP}, \qquad p_{pr} = j_{pr}\,\mathrm{MEOP}$$

> **Eq. 3.5** — $j_b$ burst (ultimate) factor, $j_{pr}$ proof factor, both
> dimensionless. Meaning: the case must not rupture below $p_b$ and every
> flight article is taken to $p_{pr}$ as an acceptance screen. Assumes:
> ambient-temperature material allowables unless the case runs hot. Fails:
> when the case is hot at the moment of peak pressure — a thin steel case
> under a failed insulation panel loses strength fast, and the burst factor
> evaporates (see §3.12). [M]

**Typical values.** [M][J] Uncrewed expendable boosters run $j_b = 1.25$–1.4;
1.4 is the common large-booster number and was Shuttle-class practice. Crewed
or human-rated systems and pressure vessels governed by the AIAA metallic
standard run to 1.5 on ultimate with a separate yield factor near 1.1. Proof
factors are 1.05–1.25 of MEOP for metals; composite overwrapped vessels use
proof both as a screen and, historically, as an autofrettage step for the
metallic liner. `[AIAA-S-080]` is the metallic pressure-vessel standard,
`[AIAA-S-081]` the composite-overwrapped one; both define MEOP, proof,
burst, damage tolerance and the required verification logic, and both grew
out of the same lineage as the NASA design-criteria monographs.

`[SP-8025]`, *Solid rocket motor metal cases* (1970), is still the most
compact statement of the metal-case design problem: it is organised around
MEOP definition, membrane and discontinuity analysis, fracture control,
joint design, and the interaction with insulation and with the nozzle
attachment. Its numbers are of their period; its structure is not. [H]

**A warning about the word "safety factor" in solid motors.** [J] The burst
factor is *not* a safety factor in the civil-engineering sense of ignorance
allowance. In a solid motor a large part of $j_b$ is consumed by things you
know about but cannot pin down: propellant temperature at launch, the
scatter in $a$ between batches, throat erosion history. A case at $j_b=1.4$
with a MEOP built on a 3σ stack is not 40 % over-strong; it is roughly at its
design limit on a hot day at the end of a bad batch.

### 3.5 Fracture control: why toughness, not strength, sizes high-strength steel cases

A case wall at 1000 MPa of hoop stress contains enough elastic energy that a
crack, once it starts running, does not stop. So the design question is not
"will it yield?" but "what is the largest flaw that can be present without
going unstable at proof or at MEOP?"

For a semi-elliptical surface flaw of depth $a$ in a membrane field:

$$K_I \approx 1.12\,\sigma\sqrt{\pi a}\ \big/\ \sqrt{Q}$$

and setting $K_I = K_{Ic}$ and $Q\to 1$ (a conservative long shallow flaw):

$$\boxed{\;a_c = \frac{1}{\pi}\left(\frac{K_{Ic}}{1.12\,\sigma}\right)^{2}\;}$$

> **Eq. 3.6 (critical surface-flaw depth)** — variables: $a_c$ [m] flaw
> depth at instability, $K_{Ic}$ [Pa·m$^{1/2}$] plane-strain fracture
> toughness, $\sigma$ [Pa] the membrane stress normal to the flaw (use the
> hoop stress; the critical flaw is axial), 1.12 the free-surface correction,
> $Q$ the flaw-shape parameter (1.0 for a long shallow flaw, up to ~2.4 for
> a semicircular one). Meaning: the flaw size that NDE must be able to find
> with confidence. Assumes: linear-elastic fracture mechanics, plane strain
> (thickness large compared to the plastic zone), a flaw normal to the
> maximum principal stress. Fails: in thin sections where plane stress
> raises apparent toughness; in the presence of residual stress (welds,
> forming) which must be added to $\sigma$; and for environmentally assisted
> cracking, where the governing threshold is $K_{ISCC} \ll K_{Ic}$. [F]

Two things fall out of Eq. 3.6 immediately.

**Higher strength is not free.** In steels, $K_{Ic}$ falls as $F_{tu}$ rises.
Going from a 1240 MPa (180 ksi) temper to a 1650 MPa (240 ksi) temper buys
25 % wall-thickness reduction, but if $K_{Ic}$ drops from 110 to 60 MPa√m
while $\sigma$ rises by 33 %, $a_c$ falls by a factor of about 6. The case
gets lighter and simultaneously becomes an NDE problem. [F] This is the
central trade of high-strength-steel case design and the reason D6AC exists:
it holds usable toughness at 1500–1650 MPa where 4340 does not.

**Proof test is a fracture screen, not a strength test.** A case that
survives proof at $\sigma_{pr}$ demonstrates that it contains no flaw larger
than $a_c(\sigma_{pr})$. Because $\sigma_{pr} > \sigma_{\mathrm{MEOP}}$,
$a_c(\sigma_{pr}) < a_c(\mathrm{MEOP})$ and the surviving article has a
guaranteed margin — the "proof-test logic" of fracture control. The catch is
subcritical growth: if a flaw at $a_c(\sigma_{pr})$ can grow by fatigue or
stress-corrosion during the service life to $a_c(\mathrm{MEOP})$, the proof
test proves nothing about the article five years later. That is why
**storage-life motors are the hardest fracture-control problem in the
field**: the case is proofed once and then sits for two decades. [M]

**Leak-before-burst** is the design condition where a through-thickness flaw
of length $2t$ is still stable, so the vessel leaks (a detectable, benign
event) rather than bursting. It requires roughly $K_{Ic}/\sigma \gtrsim
\sqrt{\pi t}$. [A] For our 10 mm D6AC wall at 1013 MPa this demands $K_{Ic}
\gtrsim 180$ MPa√m — far beyond D6AC. **Solid motor cases in high-strength
steel are burst-before-leak by construction**, which is exactly why the
fracture-control programme (NDE, proof, flaw-growth analysis, handling
control) is not optional. Aluminium and titanium cases at lower stress can be
designed leak-before-burst; high-strength steel ones cannot.

### 3.6 Steel cases: alloys and heat treatment

**4130** (0.30 C, 1 Cr, 0.2 Mo) is the entry-level case steel: cheap,
weldable, forgiving, used at 700–1100 MPa. It is what amateur and small
tactical motors are made of, and what you use when the case is not
mass-critical. [H]

**4340** (0.40 C, 1.8 Ni, 0.8 Cr, 0.25 Mo) is the classical
quenched-and-tempered high-strength steel, usable to about 1400 MPa before
toughness collapses. Hardenability limits it in thick sections. [H]

**D6AC** (0.46 C, 1.0 Cr, 1.0 Mo, 0.55 Ni, 0.1 V) was developed precisely for
large rocket cases and heavy aircraft structure. Austenitised, quenched, and
double-tempered, it delivers $F_{tu}$ of 1450–1650 MPa (210–240 ksi) with
$K_{Ic}$ typically 60–100 MPa√m depending on temper and section. It is the
material of the Titan and Space Shuttle booster cases `[NASA-SRB]`. Its
weakness is that the properties depend violently on heat-treat practice: D6AC
is famous in the structures community for the 1960s F-111 wing-carry-through
failures traced to inconsistent quenching and to flaws below the then-current
NDE threshold. The lesson transferred directly to case practice: **for D6AC,
the heat-treat lot and the NDE record are part of the design.** [H]

**Maraging steels** (18Ni-250, 18Ni-300; grade M250 in Indian practice) are a
different animal. Very low carbon, hardened by precipitation of intermetallics
during a simple 480 °C age rather than by a quench. They reach 1700–2000 MPa
with $K_{Ic}$ of 80–110 MPa√m — a substantially better strength/toughness
combination than D6AC — and, critically, they are **weldable in the annealed
condition and can be aged after welding** with minimal distortion, which
makes large welded cases practical. That is why ISRO builds the PSLV S139
and LVM3 S200 cases in M250 maraging steel `[WP]`. The cost is the nickel and
cobalt content and a long, tightly controlled heat-treat cycle. [M]

**Heat treatment is a case-design variable, not a materials footnote.** The
same forging can be tempered to 1300 MPa/110 MPa√m or 1650 MPa/60 MPa√m. The
first gives a 25 % heavier case with a 6× larger tolerable flaw; the second
gives the mass and a fracture-control programme. [J] Large recoverable
boosters — where the same case flies ten times and is dunked in the Atlantic
in between — argue for the tough temper. Expendable single-flight boosters
argue for the strong one.

### 3.7 Segmented cases and field joints

A 3.7 m diameter, 45 m long steel case cannot be built in one piece, cast in
one piece, shipped in one piece, or handled in one piece. The Shuttle
booster's cases were built as 11 casting segments, assembled into **four
flight segments joined by three field joints**, with factory joints inside
each flight segment `[NASA-SRB]`. Ariane 5's EAP used three bolted steel
segments `[ESA-EAP]`; LVM3's S200 uses three maraging segments; Titan's
UA1205/UA1207 used five and seven `[WP]`.

Segmenting costs you, every time:

- **Mass.** Every joint is a local thickening plus a mechanical fastening
  system. Joint hardware is the reason a segmented steel booster reaches
  $\zeta \approx 0.85$ where a monolithic composite reaches 0.92.
- **A thermal seal.** The joint is a hole in the insulation. Hot gas at
  3300 K will find any leak path, and once it does, the mass flow through a
  growing gap is self-amplifying.
- **A structural discontinuity.** Membrane theory dies at the joint. The
  joint deflects under pressure in a way the continuous shell does not, and
  the deflection is the whole story.

#### The clevis–tang joint, at architecture level

A **clevis–tang** (sometimes tang-and-clevis) joint is the simplest way to
join two thick cylinders and carry hoop tension across the seam. The upper
segment ends in a **tang**, a single projecting wall. The lower segment ends
in a **clevis**, a U-shaped fork with an inner and an outer leg. The tang
drops into the clevis and a large number of radial **pins** through all three
walls carry the load. Sealing is by elastomeric O-rings in grooves in the
clevis legs, squeezed against the tang.

```
     segment above (tang)
            │ │
            │ │            <- tang, one wall
   ─────────┤ ├─────────
    outer   │ │  inner        <- clevis, two legs
     leg  ┌─┤ ├─┐ leg
          │ │ │ │
      ●   │ │ │ │   ● <- radial pins through outer leg, tang, inner leg
          │ O │ O │        O-rings in clevis-leg grooves, squeezed on the tang
          └───┴───┘
     segment below (clevis)
```

Now apply internal pressure. The cylinder wants to grow radially by
$\Delta R = \sigma_\theta R/E \times (1-\nu/2)$. In the joint region the
geometry is not a uniform cylinder: the clevis inner leg is on the pressure
side, the outer leg is outboard, and the tang is between them. The inner leg,
loaded by pressure on its inside face, bows outward. The outer leg is
restrained by the pins. **The result is that the tang and the clevis inner
leg rotate away from each other about the pin line, and the gap that the
O-ring must seal momentarily opens.** This is **joint rotation**, and it is a
structural phenomenon, not a sealing one.

> **Eq. 3.7 (why joint rotation is a rate problem)** — the seal is
> maintained only if the O-ring's own elastic recovery plus the pressure
> pushing it into the gap can close the gap as fast as the gap opens:
> $\dot{\delta}_{\mathrm{seal}} \ge \dot{\delta}_{\mathrm{gap}}$, with the
> gap opening on the ignition-rise timescale (order 0.3–0.6 s, Module 20).
> Variables: $\dot\delta$ [m/s]. Meaning: this is a *rate*-matched seal, not
> a static one. Assumes: the ring is seated with design squeeze at the moment
> of ignition. Fails: when elastomer stiffness rises — an O-ring's response
> time is strongly temperature-dependent, and a fluorocarbon elastomer
> below its glass-transition-influenced range responds far more slowly than
> the same ring at 25 °C. [F]

That is the entire mechanism of the Challenger accident, stated
structurally. The Rogers Commission's finding was that on STS-51-L the
cold-stiffened O-rings in the aft field joint of the right-hand booster
failed to seat, hot gas blew by the primary and secondary seals, the joint
burned through, and the resulting plume impinged on the External Tank aft
attachment and the tank itself `[Rogers86]`.

**What the redesign changed** `[Rogers86]`, and note that all four items
attack *rotation and temperature*, not seal material:

1. A **capture feature**: an added inner lip on the tang that engages the
   inside clevis leg and mechanically limits the joint from rotating open.
   This is the structural fix; everything else is defence in depth.
2. A **third O-ring** on that capture feature, upstream of the original two.
3. **Redesigned joint insulation** to keep combustion gas away from the
   seals in the first place.
4. **Joint heaters** to hold the seals above a minimum temperature
   regardless of ambient.

The provenance of the capture-feature concept is sometimes given as the
"double tang" joint of the abandoned filament-wound-case booster; that
attribution is weakly sourced and should be quoted as such. [H]

**The teachable point** [J]: the pre-Challenger design treated a structural
deflection problem as a sealing problem, and the fix therefore kept arriving
as better seal materials and tighter squeeze specifications. The redesign
worked because it changed the *deflection*. When a seal keeps failing, ask
what is moving.

#### Other joint architectures

- **Bolted flange joints** (Ariane 5 EAP, most composite segmented cases):
  heavier per joint than a pinned clevis but statically determinate,
  inspectable, and the flange stiffness can be tuned to control rotation
  directly. Sealing on a flat flange face is a far more benign problem than
  sealing across a rotating gap.
- **Threaded and shear-pin joints** for small motors: a snap ring or a
  breech-lock thread in the aft closure of a tactical motor.
- **Factory joints**: joints made and pressure-tested at the plant, with the
  insulation laid up continuously across them. A factory joint is a much
  smaller risk than a field joint because it is sealed with a bonded
  insulation path rather than an elastomeric one, and because it is never
  disturbed after test.

### 3.8 Aluminium cases

Aluminium had a real run in solid motors and then largely lost. 2014-T6,
2219-T87 and 7075-T73 give $F_{tu}$ of 440–560 MPa at $\rho = 2800$ kg/m³,
i.e. $\sigma/\rho \approx 155$–200 kJ/kg, which is comparable to or better
than 4130 steel and, for small motors, weldable and cheap to machine. [H]

Where aluminium survives:

- Small tactical and sounding-rocket motors where wall thickness would be
  below the minimum handleable gauge in steel, so the steel case would be
  gauge-limited rather than stress-limited. Aluminium's thicker wall at the
  same mass is a manufacturing convenience.
- Cases that double as a machined structure with integral bosses and rails.
- Hobby and amateur high-power motors, universally.

Where it lost, and why:

- **Temperature.** Aluminium loses roughly half its strength by 200 °C and
  essentially all of it by 350 °C. A steel case tolerates a local insulation
  thin spot; an aluminium case does not. This is the killer for long-burn
  boosters.
- **Fatigue and notch sensitivity** in the alloys strong enough to be
  competitive.
- **It was beaten from both sides.** Composites beat it on $PV/W$ by a factor
  of 3–5; steel beat it on temperature and toughness. Aluminium's niche got
  squeezed out from above and below. [J]

Aluminium's most visible modern role in propulsion pressure vessels is as the
**liner of a composite-overwrapped pressure vessel** — the MMU's nitrogen
tanks were aluminium with a Kevlar overwrap — where it does not carry the
load, it just keeps the gas in.

### 3.9 Filament-wound composite cases

A filament-wound case is made by winding continuous resin-impregnated fibre
tow over a mandrel under controlled tension, in a programmed path, then curing
the assembly and (usually) removing or dissolving the mandrel. The case is not
a shell with fibres in it; it is a fibre load path with resin holding it in
place. Analysing it as an isotropic shell will mislead you. The first-order
tool is **netting analysis**.

#### Netting analysis

Assume the resin carries no load, the fibres carry only axial tension, and
all fibres in a layer are at the same stress $\sigma_f$. Consider a cylinder
with helical layers wound at $\pm\alpha$ to the motor axis, fibre-only
thickness $t_\alpha$, plus circumferential ("hoop") layers at 90°, fibre-only
thickness $t_{90}$.

*Axial equilibrium.* Only the helical fibres have an axial component. Each
carries $\sigma_f$ along its own direction; the axial force per unit
circumference from a helical layer of thickness $t_\alpha$ is
$\sigma_f t_\alpha \cos^2\alpha$ (one $\cos\alpha$ resolves the force, one
accounts for the fibre spacing seen by an axial cut). Equating to Eq. 3.2's
load $pR/2$:

$$\sigma_f\, t_\alpha \cos^2\alpha = \frac{pR}{2}
\qquad\Rightarrow\qquad
t_\alpha = \frac{pR}{2\,\sigma_f \cos^2\alpha}$$

*Hoop equilibrium.* The helical layers contribute $\sigma_f t_\alpha
\sin^2\alpha$ and the hoop layers contribute $\sigma_f t_{90}$; together they
must carry $pR$:

$$\sigma_f t_\alpha \sin^2\alpha + \sigma_f t_{90} = pR
\qquad\Rightarrow\qquad
t_{90} = \frac{pR}{\sigma_f}\left(1 - \frac{\tan^2\alpha}{2}\right)$$

$$\boxed{\;t_\alpha = \frac{pR}{2\sigma_f\cos^2\alpha},\qquad
t_{90} = \frac{pR}{\sigma_f}\left(1-\frac{\tan^{2}\alpha}{2}\right),\qquad
t_L = \frac{t_\alpha + t_{90}}{V_f}\;}$$

> **Eq. 3.8 (netting analysis of a wound cylinder)** — variables:
> $t_\alpha, t_{90}$ fibre-only layer thicknesses [m]; $\alpha$ helical
> winding angle from the motor axis [rad]; $\sigma_f$ delivered fibre
> allowable [Pa]; $V_f$ fibre volume fraction; $t_L$ physical laminate
> thickness [m]. Meaning: a direct force balance that tells you how much
> fibre to put in each direction. Assumes: resin carries nothing, fibres are
> straight and equally stressed, membrane state, no interlaminar or bending
> stress, perfect fibre translation. Fails: near bosses, skirts and any
> discontinuity; in compression or shear (netting analysis says a composite
> has zero compressive strength, which is wrong but usefully conservative);
> and whenever fibre waviness, tow-drop or cure residual stress reduces
> translation — real burst pressures run below netting prediction unless
> $\sigma_f$ is calibrated on burst tests of the same construction. [E]

**Read the two corner cases.** At $\tan^2\alpha = 2$, i.e.
$\alpha = 54.74^\circ$, $t_{90} = 0$: the helical layers alone satisfy both
equilibria, and the total fibre thickness is $1.5\,pR/\sigma_f$. This is the
famous **isotensoid angle**, the reason 54.7° appears in every pressure-vessel
and reinforced-hose text, and the minimum-fibre-mass solution for a cylinder
with no polar opening. Below 54.7°, hoop layers are needed and the total
fibre thickness is

$$t_\alpha + t_{90} = \frac{pR}{\sigma_f}\left(\frac{1}{2\cos^2\alpha} + 1 -
\frac{\tan^2\alpha}{2}\right) = \frac{3}{2}\frac{pR}{\sigma_f}$$

which is *independent of $\alpha$* — the algebra collapses to exactly the
same $1.5\,pR/\sigma_f$ for any $\alpha < 54.7^\circ$. [F] That is a small,
genuinely surprising result and it is worth internalising: **within netting
theory, the helical angle does not change the fibre mass of the cylinder at
all.** It only changes how the fibre is distributed between directions. The
angle is therefore chosen for other reasons entirely.

#### Why the helical angle is what it is

A helical fibre wound over the cylinder must continue over the dome and turn
around at the polar opening. The geodesic (slip-free) path on a surface of
revolution obeys **Clairaut's relation**, $r\sin\theta = \mathrm{constant}$,
which at the cylinder ($r = R$, angle from the meridian $= 90° - \alpha$)
and at the polar opening ($r = r_0$, fibre tangent to the opening) gives:

$$\sin\alpha = \frac{r_0}{R}$$

> **Eq. 3.9 (winding angle set by the polar opening)** — variables: $r_0$
> polar opening (boss) radius [m], $R$ cylinder radius [m], $\alpha$ helical
> angle at the cylinder [rad]. Meaning: the boss size dictates the winding
> angle; you do not get to choose them independently. Assumes: geodesic
> (frictionless) winding on a surface of revolution, constant $r_0$ at both
> ends. Fails: for non-geodesic winding where fibre friction is exploited to
> hold off-geodesic paths (used deliberately to open up the design space),
> and for cases with different fore and aft boss diameters. [F]

So: a large aft opening for the nozzle means a large $r_0/R$ and a steep
helical angle; a small forward igniter boss means a shallow one. A case with
a nozzle boss at $r_0/R = 0.34$ has $\alpha \approx 20°$, and Eq. 3.8 then
says roughly 62 % of the fibre goes into hoop layers and 38 % into helicals.
The **dome contour** is not free either: for a geodesic-wound isotensoid dome
the shape is *derived* from $r_0/R$ so that every fibre is at the same stress
everywhere on the dome. That is why filament-wound domes all look alike and
none of them are hemispheres.

#### Fibres, and the historical progression

| generation | fibre | typical composite density (kg/m³) | why it was adopted | why it was superseded |
|---|---|---|---|---|
| 1950s–60s | **E-glass, then S-glass** | 1900–2000 | first fibre with usable specific strength; Polaris A-2/A-3, Poseidon glass-wound cases `[WP]` | low stiffness (large strain, so large case growth and grain strain), moisture sensitivity, static fatigue |
| 1970s–80s | **Aramid (Kevlar 49)** | 1350–1400 | ~40 % better $PV/W$ than glass at much lower density; Trident I C-4, Peacekeeper stages, IUS Orbus | poor compressive strength, moisture uptake, and — cited explicitly for the Trident D-5 stage-3 change — an **electrostatic potential difference against graphite hardware** `[WP]` |
| 1980s– | **Carbon/graphite (AS4, IM7, T800, T1000)** | 1550–1620 | highest $PV/W$, high stiffness (low case growth, benign for the grain), dimensionally stable, no moisture problem | cost; conductive (an EMI and lightning consideration); notch- and impact-sensitive; needs damage-tolerance analysis |

The Trident line is the cleanest single-programme illustration in the open
literature: **steel → glass filament wound → Kevlar/epoxy → graphite/epoxy**
across Polaris A-1 to Trident II D-5, with the D-5 third stage changing from
Kevlar to graphite mid-programme in 1988 for two stated reasons — inert-weight
reduction *and* elimination of the electrostatic potential difference between
Kevlar and graphite `[WP]`. Each step in that chain is roughly a 20–30 % case
mass reduction at equal burst pressure, and that progression alone accounts
for a substantial part of the range growth from A-1 to D-5, independent of
propellant chemistry. [H]

#### Bosses, skirts and the parts netting analysis cannot do

- **Polar bosses.** Metal (titanium, steel or aluminium) rings at each pole
  that the fibre turns around, and to which the nozzle and the igniter are
  bolted. The boss is a stiffness discontinuity in the middle of the highest
  fibre curvature; it is where composite cases actually fail on test. Load
  transfer is by a combination of fibre bearing on the boss shoulder,
  adhesive shear along a bonded flange, and mechanical fastening.
- **Skirts.** The cylindrical extensions fore and aft that carry the vehicle
  interface loads. They are bonded and/or co-wound onto the case and are
  loaded in **compression and bending**, not pressure, so they buckle rather
  than burst (`[SP-8007]`) and they are the one place on a composite case
  where you may be laying up ±45° and 0° plies for stability rather than
  hoop-and-helical for pressure. The **skirt-to-case bond termination** is
  a classic stress concentration and a classic failure site.
- **Case growth.** A composite case at 1 % fibre strain grows radially ~1 %.
  The bonded insulation and the propellant grain must accommodate that
  strain (Module 21's grain-structural-integrity problem); with a stiff
  carbon case this is easy, with a glass case at 2 % strain it was a real
  design driver. [F]

#### Monolithic versus segmented composite cases

Filament winding removes the *manufacturing* reason to segment. What remains
is transport and handling: a monolithic 3.4 m × 13.5 m case must be wound,
cured, insulated, cast and shipped as one object.

- **P120C** (Vega-C first stage, Ariane 6 strap-on) is the reference:
  carbon-fibre filament-wound, **monolithic, one piece, no segments and no
  field joints**, roughly 3,500 km of carbon fibre wound over about 33 days
  in a climate-controlled hall, 3.4 m diameter × 13.5 m, 141,400 kg of HTPB
  1912 propellant `[WP]`. It is the largest monolithic composite case flying.
- **Titan IV SRMU** went the other way: graphite/epoxy filament wound but
  **three segments**, because the motor was too large to transport whole and
  because the vehicle integration flow at the Cape was built around segments
  `[WP]`.
- Northrop Grumman describes **GEM-63XL** as "the longest monolithic rocket
  motor produced to date" at 1.62 m × 22.0 m `[NG-COMM]` — long and slender is
  easier to keep monolithic than short and fat, because the transport
  constraint is diameter.

[J] The decision rule is simple and almost entirely non-technical: **segment
only if you must move it.** A field joint on a composite case costs more,
relatively, than on a steel one, because the joint hardware is metal and does
not scale down with the composite's lightness.

### 3.10 The vessel performance index $PV/W$, and how it becomes motor mass fraction

The classic figure of merit for any pressure vessel is the stored
pressure-volume energy per unit weight. For our cylinder, take the membrane
mass of a length $L$: $m = \rho\,2\pi R t L$, the contained volume
$V = \pi R^2 L$, and the burst condition $t = p_b R/\sigma$:

$$\frac{pV}{W} = \frac{p_b\,\pi R^2 L}{\rho\,2\pi R t L\, g_0}
= \frac{p_b R}{2\rho t g_0}
= \boxed{\;\frac{\sigma}{2\rho g_0}\;}\quad\text{(cylinder)}$$

and by the same construction for a sphere ($t = pR/2\sigma$,
$V = \tfrac43\pi R^3$, $m = \rho 4\pi R^2 t$):

$$\frac{pV}{W} = \frac{2}{3}\frac{\sigma}{\rho g_0}\quad\text{(sphere)}$$

> **Eq. 3.10 ($PV/W$ vessel index)** — variables: $\sigma$ material
> allowable at burst [Pa], $\rho$ density [kg/m³], $g_0$ [m/s²]. Units:
> metres (it is an energy per unit weight, i.e. a length — think of it as
> the height the vessel could lift itself to on its own stored gas energy).
> Meaning: the material-only merit of a pressure vessel; higher is a lighter
> case for the same pressure and volume. Assumes: membrane cylinder or
> sphere, no domes, bosses, joints, skirts, insulation or minimum-gauge
> constraint; isotropic material at a single allowable. Fails: for real
> hardware, where the parasitic mass is 25–50 % on top; for anisotropic
> composites, where you must substitute the netting-derived effective value;
> and when minimum gauge, handling or non-pressure loads set the thickness
> instead of $\sigma$. [F]

For a **netting-designed composite cylinder**, substitute
$t_L = 1.5\,p_bR/(\sigma_f V_f)$ into $pV/W = p_bR/(2\rho t_L g_0)$:

$$\frac{pV}{W}\bigg|_{\mathrm{netting}} = \frac{\sigma_f V_f}{3\rho\, g_0}$$

> **Eq. 3.11** — variables as Eq. 3.8, $\rho$ here the *laminate* density.
> Meaning: the composite equivalent of Eq. 3.10, with the factor 3 (rather
> than 2) paying for the 1.5× fibre penalty of a cylinder that is not a pure
> isotensoid sphere. Assumes: netting theory, fibre translation captured in
> $\sigma_f$. Fails: everywhere netting fails (see Eq. 3.8). [E]

**From $PV/W$ to mass fraction.** The case mass for a motor of internal
volume $V$ at burst pressure $p_b$ is $m_{\mathrm{case}} = p_b V/(g_0\,
[PV/W])$, and the propellant mass is $m_p = \eta_V V \rho_p$. Then

$$\zeta = \frac{m_p}{m_p + m_{\mathrm{case}} + m_{\mathrm{other}}}
= \left[1 + \frac{p_b}{\eta_V \rho_p g_0 (PV/W)}
+ \frac{m_{\mathrm{other}}}{\eta_V V\rho_p}\right]^{-1}$$

> **Eq. 3.12 (mass fraction from vessel index)** — variables: $\eta_V$
> volumetric loading fraction, $\rho_p$ propellant density [kg/m³],
> $m_{\mathrm{other}}$ nozzle + insulation + igniter + skirts + TVC [kg],
> $V$ case internal volume [m³]. Meaning: the whole case-design argument in
> one line — mass fraction improves with a better vessel index, a higher
> propellant density, a fuller case, and a *lower* design pressure. Assumes:
> the case is membrane-sized. Fails: for small motors where
> $m_{\mathrm{other}}$ dominates and the case material barely matters. [F]

Read the middle term. It says the case penalty scales as
$p_b/(\rho_p\,PV/W)$ and **not** with motor size at all: to first order, a
membrane-sized case costs the same *fraction* of the motor whether the motor
is 1 tonne or 500 tonnes. That is why solid motors have such consistent mass
fractions across three orders of magnitude, and why the third term — the
fixed nozzle-and-hardware mass — is what actually makes small motors worse.
It also says the case designer and the internal ballistician are in direct
conflict: every bar of chamber pressure the ballistician wants for $c^*$
efficiency and nozzle compactness is paid for linearly in case mass.

### 3.11 The thermal protection interface

The case must not get hot. Steel loses about 40 % of its strength by 400 °C
and essentially all of it by 700 °C; carbon/epoxy is limited by its resin
glass transition at 120–200 °C, i.e. it goes soft far sooner than the fibre
degrades. Combustion gas is at 3000–3500 K. Between them sits the insulation
(Module 23), and the case designer owns two things about that interface:

- **The bond.** Case → liner/adhesive → insulation → liner → propellant is a
  chain of bonded interfaces, each of which must survive cure shrinkage,
  thermal cycling and the case's pressurisation strain. A composite case
  grows more than a steel one under pressure, so the bondline strain is
  larger — and the insulation must be compliant enough to take it. Surface
  preparation (grit blast, primer, cleanliness) on the case ID is a
  first-order structural requirement.
- **The temperature the case is allowed to reach.** Insulation is sized so
  the case stays below an allowable at the end of burn plus a soak-back
  margin. A thin spot is a direct hit on the burst factor at the worst
  moment: peak pressure and peak temperature are not simultaneous, but for a
  regressive trace they are close enough to matter. [J] "Insulation is
  parasitic mass" is true, and cutting it is the single most reliable way to
  lose a case.

For **recoverable** boosters, add a third: external thermal protection and
corrosion protection. The Shuttle boosters carried an external ablative and
cork system against ascent heating and were then recovered from salt water,
which imposed a refurbishment and corrosion-inspection regime that had no
counterpart on expendable motors. SLS deleted it — no parachutes, no
recovery, no salt-water refurbishment constraint `[NASA-SLS-SRB]`.

### 3.12 Structural loads beyond pressure

The case is sized by pressure and then *checked*, or sometimes re-sized, by
everything else. A non-exhaustive load list, with what each one drives:

| load | source | what it sizes |
|---|---|---|
| Internal pressure at MEOP | ballistics, hot day | cylinder wall thickness |
| Axial thrust | motor thrust reacted at the aft dome | aft dome, nozzle boss, aft skirt |
| **Gimbal side load and moment** | TVC actuator reacting nozzle deflection: $F\sin\delta$ side force plus a moment about the flexseal pivot | aft dome, boss, actuator attach brackets |
| Actuator reaction | the actuator's own load path back into the case or skirt | local hard points, skirt |
| Flight bending | aerodynamic angle of attack, gust, wind shear at max-Q | cylinder in **compression on the leeward side** — a buckling check, not a strength check |
| Stack compression | vehicle stack mass above the booster during liftoff and max-Q | skirts, forward attach |
| Attach-point loads | strap-on thrust take-out struts, often at 2–4 discrete points | local doublers, forward and aft attach rings |
| Handling and transport | lifting, rail-car and road shock, horizontal storage on saddles with the grain's own weight bearing on the case | cylinder ovalisation, local crush; often sets minimum gauge on small motors |
| Thermal cycling | storage between −40 °C and +60 °C, and the case/insulation/propellant CTE mismatch | bondlines, and the grain (Module 21) — but the *case* takes the reaction |
| Ignition transient | pressure rise in 0.3–0.6 s, a dynamic load with overshoot | joints, seals |
| Water impact | recovered boosters | aft skirt, cylinder near the waterline |

Two of these deserve emphasis.

**Gimbal loads.** A 4 MN motor gimballing 7° puts $4\times10^6\sin 7° \approx
490$ kN of side force into the aft dome, applied at the nozzle pivot with a
long moment arm. This is a large, cyclic, off-axis load applied exactly where
the case has a big hole in it. It is the reason that going from a fixed
nozzle to a gimballed one is not a nozzle-only change — the aft closure has
to be redesigned.

**Buckling.** [F] A thin cylinder in compression or bending fails by
buckling at a stress far below yield, and the classical buckling load is
notoriously sensitive to initial geometric imperfection: real cylinders
achieve 30–70 % of the classical prediction, which is why `[SP-8007]`
exists and is written entirely around empirical knockdown factors. Internal
pressure *stabilises* a cylinder against buckling, so the critical buckling
case is often at low or zero internal pressure — during transport, or in the
tail-off of the burn, or for an unpressurised stage being pushed by the stage
below it.

---

## 4. Typical engineering ranges

| quantity | typical range | low end / high end |
|---|---|---|
| Case internal diameter | 0.1 m (tactical) – 3.71 m (RSRM/SLS `[NASA-SLS-SRB]`) | Shuttle/SLS 3.71 m is the largest flown; P120C 3.4 m is the largest monolithic composite |
| MEOP | 3–12 MPa large boosters; 7–20 MPa tactical and upper stages | RSRM ≈ 6.25 MPa nominal `[NASA-SRB]`; small high-performance motors run far higher |
| Burst factor $j_b$ | 1.25–1.5 | 1.4 typical for large expendable boosters; 1.5 where human-rating or `[AIAA-S-080]` practice applies |
| Proof factor | 1.05–1.25 × MEOP | metals lower, composites often screened by a higher proof |
| Steel case wall (large booster) | 8–20 mm | RSRM nominal membrane 12.7 mm (0.5 in); local joint regions thicker `[NASA-SRB]` |
| $F_{tu}$, case steels | 1100 MPa (4130) – 2000 MPa (18Ni-300 maraging) | D6AC 1450–1650 MPa; M250 maraging ~1700 MPa |
| $K_{Ic}$, case steels | 45–130 MPa√m | falls as $F_{tu}$ rises; D6AC 60–100, maraging 80–110 |
| Delivered fibre stress $\sigma_f$ (burst, netting basis) | 1900–2400 MPa (S-glass), 2400–2800 (Kevlar 49), 3000–4000 (IM7/T1000 carbon) | translation efficiency 0.70–0.85 of tow strength |
| Fibre volume fraction $V_f$ | 0.55–0.68 | wet winding at the low end, towpreg at the high end |
| Helical winding angle $\alpha$ | 12°–30° at the cylinder | set by $\sin\alpha = r_0/R$ (Eq. 3.9); 54.74° only for a boss-less isotensoid |
| Cylinder $PV/W$ | 7 km (4130) – 12.7 km (Ti-6Al-4V) metals; 23–45 km composites | see Worked Example 2 |
| Volumetric loading $\eta_V$ | 0.80–0.93 | limited by port area (Module 21) and by insulation volume |
| Propellant mass fraction $\zeta$ | 0.82–0.94 | S139 segmented maraging steel 0.821; RSRM segmented steel ≈0.85; GEM family 0.894–0.908; P120C monolithic carbon **0.924**; Star 48B ≈0.94 (upper stage, low pressure, high $\eta_V$) `[WP]` |
| Case mass / total inert mass | 40–70 % | higher for big boosters, lower for small motors where the nozzle dominates |
| Number of segments | 1 (monolithic) – 11 casting segments / 4 flight segments (RSRM) | Ariane 5 EAP 3; SRMU 3; LVM3 S200 3; Titan UA1207 7 |

---

## 5. Worked examples

### WE1 — Sizing a steel case, and what the same job costs in carbon

**Given.** A generic large booster: case internal diameter $D_i = 3.00$ m
($R = 1.50$ m), MEOP $= 7.00$ MPa (1015 psi), burst factor $j_b = 1.5$,
D6AC steel with $F_{tu} = 1520$ MPa (220 ksi), $\rho = 7830$ kg/m³.

**(a) Wall thickness.**

$$p_b = j_b\,\mathrm{MEOP} = 1.5 \times 7.00\times10^6 = 1.050\times10^7\ \mathrm{Pa}
= 10.50\ \mathrm{MPa}$$

Set the burst hoop stress (Eq. 3.1) equal to $F_{tu}$:

$$t = \frac{p_b R}{F_{tu}} = \frac{1.050\times10^{7}\ \mathrm{Pa}\times 1.50\ \mathrm{m}}
{1.520\times10^{9}\ \mathrm{Pa}} = 1.0362\times10^{-2}\ \mathrm{m}
= \mathbf{10.36\ mm}$$

Thin-wall check: $t/R = 0.0069 \ll 0.1$. Membrane theory is good to under
0.4 %.

**(b) Stresses at MEOP.**

$$\sigma_\theta = \frac{pR}{t} = \frac{7.00\times10^{6}\times1.50}{1.0362\times10^{-2}}
= 1.013\times10^{9}\ \mathrm{Pa} = 1013\ \mathrm{MPa}\ (66.7\%\ \mathrm{of}\ F_{tu})$$
$$\sigma_z = \sigma_\theta/2 = 507\ \mathrm{MPa}$$

**(c) Mass per unit length of cylinder.**

$$R_m = R + t/2 = 1.50 + 0.00518 = 1.5052\ \mathrm{m}$$
$$m'_{\mathrm{steel}} = \rho\,2\pi R_m t = 7830 \times 2\pi \times 1.5052
\times 1.0362\times10^{-2} = \mathbf{767\ kg/m}$$

**(d) The same case in carbon/epoxy, by netting analysis.** Nozzle boss
radius $r_0 = 0.513$ m, so from Eq. 3.9 $\sin\alpha = 0.513/1.50 = 0.342$,
$\alpha = 20.0°$. Delivered fibre allowable $\sigma_f = 3500$ MPa (IM7-class
at ~0.75 translation), $V_f = 0.60$, laminate density 1580 kg/m³.

$$t_\alpha = \frac{p_b R}{2\sigma_f\cos^2\alpha}
= \frac{1.050\times10^{7}\times1.50}{2\times3.50\times10^{9}\times0.8830}
= 2.548\times10^{-3}\ \mathrm{m} = 2.55\ \mathrm{mm}$$

$$t_{90} = \frac{p_b R}{\sigma_f}\left(1-\frac{\tan^2 20°}{2}\right)
= \frac{1.575\times10^{7}}{3.50\times10^{9}}\times(1-0.0662)
= 4.202\times10^{-3}\ \mathrm{m} = 4.20\ \mathrm{mm}$$

Total fibre thickness $= 6.75$ mm (and indeed $1.5\,p_bR/\sigma_f =
1.5\times15.75\times10^6/3.5\times10^9 = 6.75$ mm — the angle-independence
of §3.9). Laminate:

$$t_L = \frac{6.750\times10^{-3}}{0.60} = 1.125\times10^{-2}\ \mathrm{m}
= 11.25\ \mathrm{mm}$$

$$m'_{\mathrm{carbon}} = 1580 \times 2\pi \times (1.50+0.00563)
\times 1.125\times10^{-2} = \mathbf{168\ kg/m}$$

**Ratio: 767/168 = 4.56.** The composite cylinder is *thicker* (11.25 mm vs
10.36 mm) and still 4.6× lighter.

**(e) The fracture-control consequence for the steel case.** At the MEOP
hoop stress of 1013 MPa, Eq. 3.6 with a range of D6AC toughness:

| $K_{Ic}$ (MPa√m) | $a_c$ (mm) |
|---|---|
| 60 | 0.89 |
| 90 | 2.00 |
| 110 | 2.99 |

**Sanity check.** The RSRM case is D6AC at a nominal 12.7 mm membrane on a
3.71 m diameter at ≈6.25 MPa nominal chamber pressure `[NASA-SRB]`. Scaling
our result to that diameter and to a MEOP ≈ 1.15× nominal
($t \propto p_b R$) gives $t \approx 10.4 \times (1.855/1.50) \times
(1.15\times6.25/7.00) = 13.2$ mm — within 4 % of the real article, which for
a first-principles membrane calculation is as good as this kind of estimate
gets. And the critical flaw depth of about 2 mm in a 12–13 mm wall is exactly
why large steel cases get 100 % volumetric NDE and a documented handling
regime: a scratch you can feel with a fingernail is a substantial fraction of
the way to critical.

### WE2 — $PV/W$: ranking case materials

**Given.** Eq. 3.10 for metals ($\sigma/2\rho g_0$) and Eq. 3.11 for
netting-designed composites ($\sigma_f V_f/3\rho g_0$), with $V_f = 0.60$.

| material | $\sigma$ or $\sigma_f$ (MPa) | $\rho$ (kg/m³) | $\sigma/\rho$ (kJ/kg) | **cylinder $PV/W$ (km)** |
|---|---|---|---|---|
| 4130 steel, Q&T | 1100 | 7850 | 140 | **7.1** |
| 2219-T87 aluminium | 440 | 2840 | 155 | **7.9** |
| D6AC steel | 1520 | 7830 | 194 | **9.9** |
| 18Ni-250 maraging | 1700 | 8000 | 213 | **10.8** |
| Ti-6Al-4V | 1100 | 4430 | 248 | **12.7** |
| S-glass/epoxy | 2300 (fibre) | 2000 | — | **23.5** |
| Kevlar 49/epoxy | 2600 (fibre) | 1380 | — | **38.4** |
| IM7-class carbon/epoxy | 3500 (fibre) | 1580 | — | **45.2** |

Sample arithmetic, D6AC:
$$\frac{PV}{W} = \frac{\sigma}{2\rho g_0}
= \frac{1.520\times10^{9}}{2\times 7830 \times 9.80665}
= 9.90\times10^{3}\ \mathrm{m} = 9.9\ \mathrm{km}$$

and carbon/epoxy:
$$\frac{PV}{W} = \frac{\sigma_f V_f}{3\rho g_0}
= \frac{3.500\times10^{9}\times0.60}{3\times1580\times9.80665}
= 4.52\times10^{4}\ \mathrm{m} = 45.2\ \mathrm{km}$$

**Read the table as history.** The ratios glass:Kevlar:carbon are
1 : 1.63 : 1.92, and steel:glass is 1 : 2.4. That is the Polaris → Trident
case-material progression quantified: each generation is worth roughly
20–30 % of case mass, and the whole chain from steel to graphite/epoxy is
worth a factor of about 4.5 in membrane case mass at fixed burst pressure and
volume `[WP]`.

**Sanity check.** Titanium beats every steel on this index and yet almost no
large motors are titanium — because $PV/W$ ignores cost, weldability, and the
fact that at $12.7$ km titanium is still a factor of 3.6 below carbon. Where
titanium *does* win is small upper-stage motors that need a metal case for a
bonded grain and a nozzle boss and are too small for winding to pay: the
Star 48B case is titanium 6Al-4V (a figure this course flags as needing a
primary source `[EA]`), and its mass fraction of about 0.94 is the best in the
table in §4. $PV/W$ is a material screen, not a design.

### WE3 — Case density and the propellant mass fraction

**Given.** A generic monolithic motor, internal radius $R = 1.50$ m,
cylindrical length $L = 10.0$ m, two 2:1 ellipsoidal domes, MEOP 7.00 MPa,
$j_b = 1.5$ (so $p_b = 10.5$ MPa as in WE1). Volumetric loading
$\eta_V = 0.88$, propellant density $\rho_p = 1770$ kg/m³. Non-case inert
mass (nozzle, insulation, igniter, TVC, skirts) fixed at
$m_{\mathrm{other}} = 6000$ kg. Case mass is taken as the membrane cylinder
mass × 1.35 to account for domes, bosses, skirts and attach rings.

**(a) Internal volume and propellant mass.**

$$V_{\mathrm{cyl}} = \pi R^2 L = \pi(1.50)^2(10.0) = 70.69\ \mathrm{m^3}$$
$$V_{\mathrm{domes}} = 2\times\tfrac13\pi R^3 = \tfrac23\pi(1.50)^3
= 7.07\ \mathrm{m^3}$$
$$V = 77.75\ \mathrm{m^3},\qquad
m_p = \eta_V V \rho_p = 0.88\times77.75\times1770 =
\mathbf{1.211\times10^{5}\ kg}$$

(For scale: P120C carries 141,400 kg in a 3.4 m × 13.5 m case `[WP]`. Our
generic motor is in the right class.)

**(b) Case mass and $\zeta$ for six materials.** Thickness from Eq. 3.1 for
metals and Eq. 3.8 for composites at $\alpha = 20°$, $V_f = 0.60$.

| case material | $t$ (mm) | $m'$ (kg/m) | $m_{\mathrm{case}}$ (kg) | $m_i$ (kg) | $\zeta$ |
|---|---|---|---|---|---|
| D6AC steel | 10.36 | 767 | 10,359 | 16,359 | **0.8810** |
| 18Ni-250 maraging | 9.26 | 701 | 9,459 | 15,459 | **0.8868** |
| Ti-6Al-4V | 14.32 | 601 | 8,109 | 14,109 | **0.8957** |
| S-glass/epoxy | 17.12 | 325 | 4,381 | 10,381 | **0.9210** |
| Kevlar 49/epoxy | 15.14 | 198 | 2,673 | 8,673 | **0.9332** |
| IM7 carbon/epoxy | 11.25 | 168 | 2,270 | 8,270 | **0.9361** |

Worked line, D6AC: $m_{\mathrm{case}} = 767.3 \times 10.0 \times 1.35 =
10{,}359$ kg; $m_i = 10{,}359 + 6{,}000 = 16{,}359$ kg;
$\zeta = 121{,}110/(121{,}110+16{,}359) = 0.8810$.

**(c) Sensitivity.** Differentiate $\zeta = m_p/(m_p+m_i)$:

$$\frac{\partial \zeta}{\partial m_i} = -\frac{m_p}{(m_p+m_i)^2}
= -\frac{1.211\times10^{5}}{(1.3747\times10^{5})^2}
= -6.41\times10^{-6}\ \mathrm{kg^{-1}}$$

i.e. **every 1000 kg of inert mass costs 0.0064 of mass fraction** on this
motor. The steel→carbon change removes 8,089 kg of case and buys
$0.9361-0.8810 = 0.055$ of mass fraction.

**(d) What that is worth in $\Delta v$.** Put an 8,000 kg payload on top,
$I_{sp} = 280$ s (vacuum, HTPB/AP/Al, Module 20 class):

$$\Delta v = I_{sp}g_0 \ln\frac{m_p+m_i+m_{\mathrm{pay}}}{m_i+m_{\mathrm{pay}}}$$

| case | $m_0$ (kg) | $m_f$ (kg) | $\Delta v$ (m/s) |
|---|---|---|---|
| D6AC steel | 145,469 | 24,359 | 4,907 |
| Ti-6Al-4V | 143,219 | 22,109 | 5,130 |
| S-glass/epoxy | 139,492 | 18,381 | 5,565 |
| Kevlar 49/epoxy | 137,783 | 16,673 | 5,799 |
| IM7 carbon/epoxy | 137,380 | 16,270 | **5,858** |

Steel → carbon is worth **951 m/s** on this stage, all of it from case
material, with no change to the propellant, the nozzle or the grain.

**Sanity check.** Our steel number, $\zeta = 0.881$, is *better* than the real
segmented RSRM's ≈0.85 `[NASA-SRB]`, and our carbon number, 0.936, is a
little better than P120C's measured 0.924 `[WP]`. Both discrepancies point the
same way and are the point of the example: our generic case is **monolithic**
and carries no field joints, no thrust-termination ports, no parachutes and
no recovery hardware. The gap between 0.881 and 0.85 is roughly what
segmenting a steel booster costs; the gap between 0.936 and 0.924 is the
honest overhead of a real case's bosses, skirts and attach hardware over a
1.35 multiplier. Neither number is wrong; they bracket reality from the
optimistic side, as a membrane estimate should.

---

## 6. Real motors — why did they design it that way?

### 6.1 RSRM / Space Shuttle SRB — D6AC steel, segmented (historical)

**Choice.** D6AC high-strength low-alloy steel, ~12.7 mm nominal membrane,
3.71 m diameter, 11 casting segments assembled into 4 flight segments with 3
field joints `[NASA-SRB]`.

**Alternatives available in 1974.** Filament-wound glass or the emerging
Kevlar; a monolithic steel case; aluminium. NASA in fact carried a
**filament-wound case** booster to a substantial state of development for the
Vandenberg (high-inclination) Shuttle missions and abandoned it.

**Why steel and segments made sense at the time.** [J] Three reasons, in
order of weight. (1) The boosters were to be **recovered and reflown** —
salt-water immersion, water-impact loads, and a refurbishment cycle argue for
a tough, inspectable, repairable metal, not a 1974-vintage composite of
unknown wet-life. (2) The motors were built in Utah and flown from Florida,
so they had to move by rail; a 3.71 m × 38 m monolithic case cannot. (3)
Steel's factor-of-two free axial margin (§3.2) absorbed the water impact and
handling loads that would each have required explicit design in a composite.

**What it cost.** The mass fraction: ≈0.85, against 0.92+ for a monolithic
filament-wound motor of the same class. And the field joint, whose rotation
mechanism (§3.7) destroyed *Challenger* `[Rogers86]`.

**Would a modern engineer choose the same?** For a *reusable* booster
recovered from the sea, the steel argument still has force. For everything
else, no — and the industry voted with its feet: SRMU went composite in 1997,
GEM went composite, P120C went monolithic composite, and Northrop Grumman's
BOLE programme is replacing the refurbished Shuttle-heritage steel cases with
carbon-fibre composite ones for SLS Block 2, with the DM-1 cases in IM7/T300
fibre and DM-2 onward planned in T1100 `[NG-BOLE]`. Note that BOLE is in
development, every figure is a contractor claim, and the DM-1 static test on
26 June 2025 showed a nozzle anomaly near the end of the burn `[NG-BOLE]`.

### 6.2 Titan IV SRMU — graphite/epoxy, three segments (transitional)

**Choice.** Graphite/epoxy filament-wound case in three segments, replacing
the UA1207's seven-segment steel case, with HTPB propellant replacing PBAN
and a gimballed nozzle replacing liquid injection TVC `[WP]`.

**Why.** The SRMU is the cleanest controlled experiment in the field: same
vehicle, same mission, same diameter class, four simultaneous generational
changes. The case change alone is worth a large inert-mass saving; the whole
package bought roughly +14 s of $I_{sp}$ and a large payload increase.

**What it cost.** SRMU development was famously troubled: a case failed
during a structural test in 1991, killing a worker, and the programme slipped
years, which is why early Titan IV-B flights flew leftover UA1207 steel
motors `[WP]`. This course records that as conf-C pending a primary source
(a GAO report or an AIAA paper), but the architectural lesson stands: a
composite case has no free margin (§3.2), and a structural test article is
where you find that out. Three segments rather than one, for the same
transport reason as the Shuttle.

**Modern view.** Right direction, and the industry followed. A modern
programme would go monolithic if transport allowed.

### 6.3 P120C — the largest monolithic composite case (modern)

**Choice.** Carbon-fibre filament-wound, **monolithic**: one piece, no
segments, no field joints. 3.4 m × 13.5 m, 141,400 kg of HTPB 1912
propellant, gross 153,000 kg, inert 11,200 kg, **$\zeta = 0.924$** `[WP]`.
Roughly 3,500 km of fibre wound over about 33 days.

**Alternatives.** A segmented composite case (SRMU-style) or a segmented
steel one (EAP-style, which is what P120C replaced on Vega and supplemented
on Ariane 6).

**Why monolithic won here.** The motor is cast and integrated in Kourou and
Colleferro and does not have to cross a continent by rail. Removing the field
joints removes their mass, their seals, their insulation discontinuity, their
assembly labour and their failure mode simultaneously. The 0.924 against
Ariane 5 EAP's segmented-steel architecture is the single most useful
number-pair in Part III.

**What it cost.** A 33-day winding cycle in a climate-controlled hall is a
throughput constraint, and one mandrel failure is one motor. Monolithic also
means the whole case is a single non-repairable article: there is no swapping
a bad segment.

**Modern view.** This is the modern answer. Every new large solid that can be
shipped whole is being designed this way.

### 6.4 Trident C-4 → D-5 — Kevlar to graphite (architecture level only)

**Choice.** Trident I C-4 used **Kevlar/epoxy** filament-wound cases;
Trident II D-5 uses **graphite/epoxy** on stages 1 and 2, with stage 3
changed from Kevlar to graphite mid-programme in 1988 `[WP]`. Each stage has
a single gimballed nozzle, replacing the four-nozzle and liquid-injection
architectures of the Polaris and Poseidon generations, and the vehicle
carries a telescoping **drag-reduction aerospike** deployed from the nose
(which is *not* an aerospike nozzle — the naming collision confuses students
every year).

**Why the case change.** Two reasons are stated in open sources: **inert
weight reduction**, and **elimination of the electrostatic potential
difference between Kevlar and graphite** in a vehicle that mixes both
materials `[WP]`.

**What the whole progression teaches.** Steel → glass filament wound →
Kevlar/epoxy → graphite/epoxy, each step roughly 20–30 % of case mass at
equal burst pressure. That progression alone accounts for a large part of the
range growth from Polaris A-1 to Trident D-5 independently of propellant
chemistry. Note also the *other* arc: jetavators → liquid injection → single
gimballed flexseal nozzle. Both arcs are inert-mass stories, and both are
architecture, which is all this course records for these systems.

**Modern view.** Graphite/epoxy remains the answer for a length- and
mass-critical stage. The design pressure on a submarine-launched stage is set
partly by decades of magazine storage, which is a fracture-control and
ageing problem rather than a strength one.

### 6.5 GEM-63XL — long, slender, monolithic (modern, commercial)

1.62 m diameter × 22.0 m, 47,853 kg of HTPB propellant, gross 53,030 kg,
carbon-fibre filament-wound monolithic case, $\zeta = 0.902$ `[NG-COMM]`.
Northrop Grumman calls it "the longest monolithic rocket motor produced to
date."

**Why it is interesting for this module.** It shows the transport constraint
is on **diameter**, not length: a 22 m case at 1.62 m diameter fits a
standard oversize road and rail envelope where a 3.7 m one does not.
Slenderness has a structural price — a long thin cylinder is a bending and
buckling problem more than a pressure problem — and the GEM family's mass
fractions (0.894–0.908 across five variants) show the case is doing its job
consistently across a 4× range in propellant mass, exactly as Eq. 3.12
predicts.

### 6.6 LVM3 S200 — maraging steel, segmented (modern, non-US)

M250 maraging steel case, 3 segments, 3.2 m × 25 m, 205,000 kg propellant per
booster, flex nozzle ±8° with electro-hydraulic actuators; the published
per-segment propellant split (27,100 / 97,380 / 82,210 kg) is unusually
generous documentation `[WP]`. PSLV's S139 uses the same material family and
comes out at $\zeta = 0.821$.

**Why maraging steel, in 2014.** [J] Weldability in the annealed condition
with post-weld ageing makes very large welded segments practical without a
composite winding infrastructure; the strength/toughness combination is
better than D6AC; and the whole supply chain is domestic. The mass fraction
penalty is real and visible — 0.821 for S139 against 0.924 for P120C — and is
being paid deliberately in exchange for a manufacturing base.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 Trade-offs

| decision | in favour | against |
|---|---|---|
| Higher chamber pressure | smaller nozzle, higher $c^*$ efficiency, shorter motor | case mass scales linearly with $p_b$ (Eq. 3.12); insulation gets worse |
| Higher-strength steel temper | thinner, lighter wall | $a_c$ collapses (Eq. 3.6); NDE and handling become programme risks |
| Composite over metal | 2–5× $PV/W$; no field joints if monolithic | no free axial margin; impact/damage tolerance; boss and skirt attachments are the hard part; non-repairable |
| Segmented | transportable; parallel casting; swap a bad segment | mass, seals, insulation discontinuity, joint rotation, assembly labour |
| Monolithic | best mass fraction, no joint failure mode | transport-limited; one mandrel failure loses the motor; long cycle time |
| Thicker insulation | protects the burst factor | parasitic mass, reduces $\eta_V$ |
| Recoverable / reusable | amortises the case | forces a tough temper, corrosion protection, water-impact structure — all mass |

### 7.2 Failure modes

**Burst at a wall flaw (mechanism → symptom → evidence → fix).** A subsurface
inclusion or a surface scratch exceeds $a_c$ at proof or at MEOP; the crack
runs axially at near-sonic speed and the case unzips along a generator.
*Symptom*: instantaneous pressure collapse; a long axial split with a
chevron-marked fracture surface. *Evidence*: fractography traces the chevrons
back to an origin; the origin is measured and compared with the NDE record.
*Fix*: raise NDE sensitivity below $a_c$, tighten handling, or move to a
tougher temper.

**Joint leakage and burn-through.** Joint rotation opens the seal gap faster
than the elastomer can follow; hot gas blows by; the leak path erodes and
grows. *Symptom*: a jet of hot gas from the joint, a local pressure and
thrust anomaly, structural damage downstream of the plume. *Evidence*: soot
and erosion on the primary seal, "blow-by" past the O-ring, char in the joint
insulation; post-flight inspection of recovered hardware. *Fix*: the RSRM
capture feature, third O-ring, redesigned insulation, joint heaters
`[Rogers86]`.

**Boss or skirt disbond in a composite case.** Cure residual stress plus
pressurisation strain plus a bond-line defect exceeds the adhesive's
interlaminar strength. *Symptom*: at proof, a nonlinear pressure–strain
knee, or an acoustic-emission burst with no pressure drop. *Evidence*:
ultrasonic C-scan of the bond, dye penetrant at the termination.
*Fix*: taper the bond termination, add mechanical fastening, thicken the
overwrap over the boss shoulder.

**Buckling of an unpressurised or lightly pressurised case.** Bending during
transport, handling, or in a stack. *Symptom*: a diamond or lobed local
collapse pattern. *Evidence*: none in advance — this is a stability failure
and it is instantaneous. *Fix*: knockdown-factor design per `[SP-8007]`,
handling fixtures that support the case at designed stations, transport with
internal pressure or with a stiffening mandrel.

**Case overheating from an insulation defect.** A void or thin spot lets the
wall exceed its allowable while pressure is still high. *Symptom*: a local
bulge, discolouration, or a burn-through. *Evidence*: recovered hardware with
a hot spot and thinned char. *Fix*: insulation NDE, bond verification,
margin on the thermal analysis.

**Stress-corrosion cracking in storage.** High-strength steel plus moisture
plus sustained hoop stress from a residual or an assembly preload.
*Symptom*: a crack found on inspection years after manufacture. *Evidence*:
intergranular fracture morphology; $K_{ISCC}$ well below $K_{Ic}$.
*Fix*: controlled environment, coatings, lower-strength temper, or a material
change.

### 7.3 Materials — why these, specifically

Case materials are chosen on $\sigma/\rho$ *subject to* four gates that
$PV/W$ does not see: fracture toughness at the operating stress, temperature
capability at the insulation's design allowable, the ability to be joined
(welded, wound, or bolted) at the required size, and life in the storage
environment. D6AC passes all four for a large expendable or recoverable
steel booster; maraging steel passes them better but costs more; aluminium
fails the temperature gate for long burns; titanium passes everything but
cost; carbon/epoxy wins the first two gates outright and fails nothing except
damage tolerance and repairability. Kevlar's fall from favour is a good
illustration that a fifth gate exists — **compatibility with the rest of the
vehicle** — which is what the Trident stage-3 electrostatic-potential
argument is `[WP]`.

### 7.4 Manufacturing, and what it limits

**Steel cases**: forge or roll-and-weld a cylinder, machine the joint and
boss features, heat treat (the dimensional-control problem — a 3.7 m ring
distorts on quench and must be sized afterwards), machine to final, NDE,
grit-blast the ID, prime, bond insulation, cast. What it limits: the maximum
monolithic length is set by the furnace, the quench tank and the transport
envelope. Weld lines are fracture-control features and get 100 % volumetric
inspection.

**Filament winding**: mount a mandrel (metal, collapsible, or dissolvable
sand/plaster), wind wet tow or towpreg under programmed tension through a
computer-controlled path, laying helicals and hoops in a planned sequence,
cure in an oven or autoclave, extract the mandrel. What it limits: the winding
path must be geodesic (or held off-geodesic by friction), which couples the
boss diameter, the dome shape and the helical angle into one decision
(Eq. 3.9); a 3.4 m × 13.5 m case takes ~33 days of winding `[WP]`, so
throughput is a machine-hours problem; and mandrel extraction through a
0.5 m polar opening is a real design constraint.

**Joints**: pin holes in a clevis–tang joint are drilled and reamed to tight
tolerance in heat-treated high-strength steel — expensive, and each hole is a
stress concentration in a fracture-critical part.

### 7.5 Testing

**Hydroburst.** Fill a case with water (incompressible — a burst releases
almost no stored energy, unlike a pneumatic test, which is why nobody
gas-tests a large case), pressurise to failure. *Measured*: pressure vs
volume-in, plus 50–300 strain-gauge channels and, on composites, acoustic
emission. *Instrument*: pressure transducers on redundant ports, bonded foil
or fibre-optic strain gauges, AE sensors, high-speed video.

*What the data looks like when the article is right*: pressure vs strain
linear to within a few percent up to burst; strains at the cylinder mid-bay
match the membrane prediction to 5–10 %; burst pressure within ~5 % of
netting/membrane prediction; the failure origin is in the cylinder, away from
every discontinuity.

*What it looks like when it is wrong*: the strain-vs-pressure slope changes
(a knee) well below burst — something has yielded, disbonded or shifted load
path; strains near a boss or skirt run 1.5–3× the membrane value; acoustic
emission ramps up with each pressure hold instead of falling silent (the
Felicity-ratio test — a sound article is quiet on re-pressurisation below its
previous maximum); and the burst origin is at a boss, a skirt termination or
a joint rather than in the free cylinder. **A composite case that bursts at a
boss has told you nothing about its membrane design and everything about its
attachment design.**

**Proof test.** Every flight article, to $j_{pr}\,\mathrm{MEOP}$, with strain
gauges at a defined set of stations. *Measured*: permanent set (measure the
diameter before and after; a metallic case that has grown permanently has
yielded and is scrap), strain linearity, and leak-tightness.

**NDE.** For metals: 100 % volumetric ultrasonic and/or radiographic
inspection with an acceptance threshold set below $a_c$ from Eq. 3.6 —
which is why WE1's 2 mm answer matters — plus magnetic-particle or penetrant
for surface flaws, and eddy current around fastener holes. For composites:
ultrasonic C-scan for delamination and porosity, thermography and shearography
for disbonds, and dimensional/thickness mapping (a wound case's thickness is
a *process* output, not a machined dimension, so it must be measured).

**Static firing** is the only test that combines pressure, temperature and
time. Case instrumentation on a static test is thermocouples on the outer
wall (the insulation-margin measurement), strain gauges, and post-test
sectioning of the insulation to measure residual char. `[SB §12]`

---

## 8. Misconceptions and what engineers actually care about

**"The case is sized for chamber pressure."** No — it is sized for MEOP,
which is nominal chamber pressure multiplied by a hot-day factor, an ignition
overshoot, a manufacturing tolerance and a statistical allowance, and then
multiplied again by the burst factor. For a tactical motor qualified to
+71 °C, the design burst pressure can be 2× the pressure the motor usually
runs at.

**"Hoop and axial stress are about the same."** Hoop is exactly twice axial
in a pressure-only cylinder. This is why cases split lengthwise, why
composites are wound with more hoop than helical fibre, and why an isotropic
case has 100 % unused axial capability.

**"The composite case is thinner."** Usually it is *thicker*. In WE1 the
carbon case is 11.25 mm against the steel's 10.36 mm. Composites win on
density and on tailoring, not on thickness. If your packaging assumed a
thinner wall, redo it.

**"A 54.7° winding angle is optimal."** It is optimal only for a cylinder
with no polar opening, and within netting theory the total fibre mass of the
cylinder is *identical* for any angle at or below 54.7° (§3.9). Real cases
wind at 12°–30° because the boss diameter sets the angle through Clairaut's
relation, not because someone chose it.

**"Challenger was an O-ring material problem."** It was a joint-rotation
problem that made the seal rate-dependent, and a temperature problem that
slowed the elastomer's response. The fix that mattered was the **capture
feature** — a structural change that stopped the joint opening `[Rogers86]`.
Better rubber would not have fixed a moving gap.

**"Higher-strength steel always gives a lighter case."** It gives a thinner
wall and a smaller critical flaw. Past a point the NDE cannot reliably find
the flaws that matter and the programme risk exceeds the mass saving.

**"Segmenting is a design choice."** It is almost always a *logistics*
choice. Nobody segments a case they could ship whole.

**"$PV/W$ picks the material."** $PV/W$ is a screen. It cannot see
toughness, temperature, weldability, damage tolerance, cost, or supply chain
— which is why titanium (12.7 km) loses to steel (9.9 km) on large boosters
and to carbon (45.2 km) everywhere else.

### What engineers actually care about

1. **MEOP, and its provenance.** Not the number, but the stack behind it.
   An unjustified 5 % in MEOP is 5 % of case mass, forever.
2. **The critical flaw size and whether NDE can find it.** This is the
   go/no-go on a high-strength steel case design and it is a single equation
   away from the material choice.
3. **Mass fraction, tracked to three decimals.** Everything in this module
   exists to move $\zeta$, and everyone in the programme knows what 0.001 is
   worth in payload.
4. **Every load case that is not pressure.** Pressure is easy and everybody
   does it. Gimbal loads, handling, buckling at zero pressure, and the
   skirt-bond termination are what kills real cases.
5. **The bondline.** Case → insulation → propellant is a chain of adhesive
   joints that must survive cure, storage, thermal cycling and
   pressurisation strain. It is the most common source of "we do not
   understand this test result."

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can state that hoop stress is twice axial,
explain why a case splits lengthwise, define MEOP and burst factor in plain
language, name steel and carbon/epoxy as the two dominant case families and
say which is lighter and why, explain in a sentence what a field joint is and
why the Shuttle had them, and name two motors with steel cases and two with
composite ones.

**Level 2 — Working engineering knowledge.** Given diameter, MEOP, burst
factor and material allowables, you can size a metal wall, compute mass per
unit length, run a netting analysis for a composite of the same case, compute
$PV/W$ for both, compute a critical flaw size from $K_{Ic}$, and propagate
the case mass difference into $\zeta$ and $\Delta v$. You can quote typical
ranges for $j_b$, $\eta_V$, $\zeta$ and case wall thickness from memory, and
state where the thin-wall membrane assumption fails.

**Level 3 — Interview mastery.** Given an unfamiliar motor — a diameter, a
pressure, a mission and a photograph — you can argue for a case architecture
(material, monolithic or segmented, joint type, boss and skirt concept),
identify which non-pressure load case is likely to size which part, say what
you would measure on a hydroburst article to confirm the design and what a
bad trace would look like, and name the historical programme that faced the
same decision and what it chose. You can explain the *Challenger* joint as a
structural-deflection problem, argue the composite-versus-steel decision both
ways for a reusable booster, and say which figures you would refuse to quote
without a primary source.

---

## 10. Problems

### Conceptual

**C1.** A case bursts on a hydroburst test with a clean circumferential
(hoop-direction) fracture, not the expected axial split. Give two physically
distinct explanations and say what evidence would distinguish them.

**C2.** Explain why a proof test is best understood as a fracture-mechanics
screen rather than a strength demonstration, and state the one service
condition that invalidates the logic.

**C3.** Netting analysis predicts that a filament-wound cylinder has zero
compressive strength. This is obviously false. Explain why the theory says
it, why the result is nonetheless useful, and name one case-design region
where you must abandon netting analysis entirely.

**C4.** A programme proposes to save mass by re-tempering its D6AC cases from
1450 MPa to 1650 MPa ultimate. State the mass saving as a percentage, and
state the question you would ask before approving it.

**C5.** Why does internal pressure make a cylinder *harder* to buckle, and
what does that imply about which point in the mission is the critical
buckling case for a strap-on booster?

**C6.** The RSRM field-joint redesign added a third O-ring, better
insulation, joint heaters, and a capture feature. Rank these four by how much
they address the root cause, and justify the ranking.

**C7.** Explain why a solid motor case is a worse fracture-control problem
after 15 years in storage than on the day it passed proof, even though it has
seen no pressure cycles in between.

**C8.** Two motors have identical propellant, grain, nozzle and mass
fraction. One has a monolithic composite case, the other a segmented steel
case with the same $\zeta$ (achieved by a lower chamber pressure). Give two
reasons a customer might still prefer the segmented steel one.

### Calculation

**N1.** A motor has internal diameter 1.60 m and MEOP 9.5 MPa. Using 4340
steel at $F_{tu} = 1380$ MPa and a burst factor of 1.4, compute the wall
thickness, the hoop and axial stress at MEOP, and the mass per metre
($\rho = 7850$ kg/m³).

**N2.** For the case in N1, compute the critical surface-flaw depth at the
MEOP hoop stress if $K_{Ic} = 75$ MPa√m. Then compute it at a proof pressure
of 1.15 × MEOP. Comment on what NDE threshold you would specify.

**N3.** Design the same case (1.60 m ID, $p_b$ from N1) in Kevlar 49/epoxy by
netting analysis, with a polar boss radius of 0.28 m, $\sigma_f = 2600$ MPa,
$V_f = 0.62$, laminate density 1380 kg/m³. Report $\alpha$, $t_\alpha$,
$t_{90}$, $t_L$ and mass per metre, and the ratio to N1.

**N4.** Compute $PV/W$ (in km) for: (a) 7075-T73 aluminium, $F_{tu} = 505$
MPa, $\rho = 2800$ kg/m³; (b) an S-glass/epoxy netting design with
$\sigma_f = 2200$ MPa, $V_f = 0.58$, $\rho = 1990$ kg/m³. Which is lighter,
and by what factor?

**N5.** A motor has $m_p = 44{,}087$ kg and gross mass 49,342 kg (these are
the GEM-63 figures from the database `[NG-COMM]`). Compute $\zeta$. Then
compute how much inert mass you could add before $\zeta$ falls below 0.880,
and express that as a percentage of the current inert mass.

**N6.** For the WE3 motor with the steel case, the ballistician proposes
raising MEOP from 7.00 to 8.00 MPa to shorten the nozzle. Recompute the case
thickness, case mass and $\zeta$, and state the $\Delta v$ change (payload
8,000 kg, $I_{sp} = 280$ s, other inert unchanged). Was it worth it?

**N7.** A 4.0 MN motor gimbals its nozzle to 6°. Compute the side force at
the nozzle. If the nozzle pivot is 1.2 m aft of the aft-dome/cylinder
tangent line, compute the bending moment the aft dome must react.

**N8.** A composite case has a measured laminate thickness of 12.0 mm with
$V_f = 0.58$ at a radius of 0.85 m, wound at $\alpha = 24°$ with
$\sigma_f = 3300$ MPa. Predict its burst pressure by netting analysis. The
article bursts at 82 % of your prediction, at a polar boss. What do you
conclude and what do you do next?

### Engineering reasoning

**R1.** You are handed a hydroburst plot: pressure on the x-axis, hoop strain
at the cylinder mid-bay on the y-axis. The trace is linear to 70 % of
predicted burst, then the slope increases by about 15 % and stays linear to
failure at 91 % of prediction. Give the two most likely explanations and say
what additional channel would separate them.

**R2.** Compare the RSRM and P120C case architectures as engineering
responses to their respective requirement sets. For each of the four
differences (material, segmentation, joint type, recovery), state the
requirement that drove it and whether the decision would be the same today.

**R3.** An acoustic-emission record from a composite case proof test shows a
Felicity ratio of 0.83 on the third pressure cycle. Explain what that number
means, why it is alarming, and what you would do with the article.

**R4.** A programme wants to qualify a motor for storage at −40 °C to +60 °C
and firing at either extreme. Explain how each extreme propagates into the
case design, and say which extreme sizes the case and which sizes the joint.

**R5.** The Trident programme changed the D-5 third-stage case from Kevlar to
graphite in 1988 for two stated reasons: inert-weight reduction and
elimination of an electrostatic potential difference `[WP]`. Construct the
argument a programme manager would have had to make against the change, and
say why it lost.

### Mini trade study

**T1.** You are the case lead for a new 3.2 m diameter, 90-tonne-propellant
strap-on booster. MEOP 8.0 MPa, burst factor 1.4, expendable, produced at 24
units per year, integrated at a launch site 2,400 km by rail from the motor
plant. The rail envelope permits a 3.4 m diameter load but limits a single
car to 15 m of usable deck. Four options are on the table:

- **A.** Monolithic carbon/epoxy filament-wound case, shipped whole by
  purpose-built rail car (requires a route survey and a capital investment).
- **B.** Three-segment carbon/epoxy case with bolted flange joints.
- **C.** Three-segment D6AC steel case with bolted flange joints.
- **D.** Monolithic maraging-steel case, welded, shipped whole.

Constraints: first flight in five years; the plant has no filament-winding
capability today; the customer's payload requirement has 400 kg of margin
against the current point design. Recommend one option. Justify with numbers
where you can (use the methods of WE1–WE3 with generic material properties
from §4), state the two largest risks in your recommendation, and say what
you would need to measure or test in year one to retire them.

---

## 11. Quiz (100 points)

**Q1 (8).** In a thin-walled cylindrical case under internal pressure only,
the ratio $\sigma_\theta/\sigma_z$ is:
(a) 0.5 (b) 1.0 (c) 2.0 (d) depends on $t/R$

**Q2 (8).** A case is to be built with $R = 0.90$ m, MEOP 6.5 MPa, burst
factor 1.4, $F_{tu} = 1500$ MPa. Compute the wall thickness in mm and the
hoop stress at MEOP in MPa.

**Q3 (10).** State what MEOP is, and list four distinct effects that must be
stacked to build it from the nominal chamber pressure.

**Q4 (10).** A filament-wound cylinder is wound at $\alpha = 18°$ with a
delivered fibre stress of 3200 MPa. For $p_bR = 1.20\times10^{7}$ N/m,
compute $t_\alpha$ and $t_{90}$, and state the total fibre thickness. Then
state what the total fibre thickness would be at $\alpha = 30°$ and explain
the result.

**Q5 (10).** Two candidate case materials: maraging steel at 1750 MPa /
8000 kg/m³, and carbon/epoxy with $\sigma_f = 3600$ MPa, $V_f = 0.62$,
$\rho = 1590$ kg/m³. Compute both cylinder $PV/W$ values in km and the ratio.

**Q6 (10).** The largest monolithic composite solid motor case currently
flying is:
(a) the RSRM segment (b) the Titan IV SRMU segment (c) P120C (d) GEM-63XL
Give the diameter and the propellant mass fraction of your answer.

**Q7 (12).** Explain the clevis–tang joint-rotation mechanism and why it made
the O-ring seal both rate-dependent and temperature-dependent. Then name the
RSRM redesign feature that addressed the root cause and say what it does
mechanically.

**Q8 (12).** A motor has $m_p = 121{,}000$ kg and $m_i = 16{,}400$ kg. The
case team offers a change that removes 3,200 kg of case mass but raises the
programme's fracture-control cost and reduces the burst factor from 1.4 to
1.3. Compute the new $\zeta$ and the $\Delta v$ gain with an 8,000 kg payload
at $I_{sp} = 280$ s. Then give the engineering judgment: accept or reject,
and on what evidence would you decide?

**Q9 (10).** A high-strength steel case is proposed with $F_{tu} = 1700$ MPa
and $K_{Ic} = 55$ MPa√m, running at a MEOP hoop stress of 1130 MPa. Compute
the critical surface-flaw depth. State whether this design is
leak-before-burst if the wall is 9 mm thick, showing the comparison.

**Q10 (10).** You have hydroburst data from two nominally identical composite
cases. Article 1 bursts at 103 % of netting prediction with the origin at the
cylinder mid-bay. Article 2 bursts at 78 % with the origin at the aft polar
boss. For each article, state what has been demonstrated and what has not,
and say which article's failure is the more serious programme problem.

---

## 12. Further reading

- **`[SP-8025]`, *Solid rocket motor metal cases*.** The compact statement of
  the metal-case problem: MEOP definition, membrane and discontinuity
  analysis, fracture control, joints, and the insulation interface. Read it
  for the structure of the argument, not for its 1970 allowables.
- **`[SP-8007]`, *Buckling of thin-walled circular cylinders*.** Read it for
  the empirical knockdown factors and for why the classical buckling
  prediction is unusable without them — the reference behind every
  transport-and-handling load case in this module.
- **`[AIAA-S-080]` and `[AIAA-S-081]`.** The metallic and
  composite-overwrapped pressure-vessel standards. Read them for the
  definitions (MEOP, proof, burst, damage tolerance) and for the verification
  logic that a modern programme is actually held to.
- **`[Rogers86]`, Report of the Presidential Commission on the Space Shuttle
  Challenger Accident, Vol. I, ch. IV.** Read the joint chapter for the
  rotation mechanism and the temperature dependence of the seal; it is the
  best-written failure analysis in the propulsion literature and it is a
  structures document, not a materials one.
- **`[SB §12]`, Sutton & Biblarz, *Rocket Propulsion Elements*, solid motor
  chapters.** Read for the case-and-insulation system overview and for the
  standard mass-fraction tables.
- **`[Davenas]`, *Solid Rocket Propulsion Technology*.** Read for the
  European perspective on segmented steel versus monolithic composite cases
  and for the filament-winding process detail.
- **`[Kubota]`, *Propellants and Explosives*.** Read alongside Module 21 for
  the grain-structural-integrity side of the case-growth problem.
- **`[HHL]`, Humble, Henry & Larson, *Space Propulsion Analysis and
  Design*.** Read chapter 6 for a compact solid-motor mass-estimating
  relationship set, including case mass as a function of $PV/W$.
- **`[NASA-SRB]` and `[NASA-SLS-SRB]`.** The primary fact-sheet material for
  the Shuttle and SLS boosters. Read them for the architecture and the
  masses; note that this course flags several widely repeated derived
  numbers as needing re-verification against these pages.
- **`[NG-COMM]`, Northrop Grumman propulsion product pages and catalog.**
  Read for the GEM family's dimensions and masses, which are the best public
  data set for exercising Eq. 3.12 across a size range.
