# Module 22 — Solid Motor Cases — Answer key

Numbers recomputed with `tools/rocket.py` conventions
($g_0 = 9.80665$ m/s²) and archived in
`tools/examples/22-cases.py`. Where a result depends on a rounded
intermediate, both are shown.

---

## K1. Problem solutions

### Conceptual

**C1 — Circumferential burst instead of axial.**
A pressure-only cylinder has $\sigma_\theta = 2\sigma_z$ (Eqs. 3.1, 3.2), so
the crack that opens against the larger stress is *axial* and the split is
lengthwise. A circumferential fracture means the axial stress reached the
allowable first, which requires either (i) **an axial load that was not
pressure** — the test fixture reacting the end load through a rod, a
mis-designed closure that put bending into the cylinder, or a hydraulic ram
in the load path; or (ii) **a circumferentially oriented defect that made the
axial direction locally the weak one** — a girth weld, a machining
undercut at a thickness step, or in a composite a circumferential
delamination or a hoop-layer termination.

*Distinguishing evidence*: strain gauges. If $\varepsilon_z/\varepsilon_\theta$
during pressurisation is near the membrane value ($\approx 0.5$ for the
stresses, and $(1-2\nu)/(2-\nu)\approx 0.13$ for the strains at $\nu=0.3$),
the loading was pressure-only and the answer is (ii): go to fractography and
find the origin at a discontinuity. If the axial strain runs high relative to
hoop, the answer is (i): the fixture put load in. Fractography also
distinguishes directly — a weld or defect origin versus an origin at a
fixture attachment.

**C2 — Proof as a fracture screen.**
Surviving proof at $\sigma_{pr}$ demonstrates, by Eq. 3.6, that the article
contains no flaw larger than $a_c(\sigma_{pr}) = (1/\pi)(K_{Ic}/1.12
\sigma_{pr})^2$. Since $\sigma_{pr} > \sigma_{\mathrm{MEOP}}$, we have
$a_c(\sigma_{pr}) < a_c(\mathrm{MEOP})$, so the surviving article has a
demonstrated margin against the flaw size that would be critical in service.
That is a *screen* — it proves the absence of large flaws, which no
strength test can do — and it is why proof is applied to every flight
article rather than to a sample.

The service condition that invalidates it is **subcritical flaw growth**:
stress-corrosion cracking in storage, or fatigue from pressure/thermal
cycling. A flaw at $a_c(\sigma_{pr})$ that grows to $a_c(\mathrm{MEOP})$
during the service life makes the proof result meaningless at the time of
firing. Hence the long-storage-life motor is the hardest fracture-control
case: proofed once, fired twenty years later.

**C3 — Netting analysis and zero compressive strength.**
Netting theory assumes the resin carries nothing and the fibres carry only
axial *tension*. A fibre in compression is a slender column with no lateral
support in the model, so its capability is zero by construction. It is useful
anyway because (a) a filament-wound case is a pressure vessel, and pressure
puts everything in tension — the model covers the sizing load case exactly;
(b) it is conservative wherever compression is incidental; and (c) it gives
the correct *direction* allocation of fibre, which is what winding-programme
design needs.

You must abandon netting analysis in any region where the load is not
membrane tension: **skirts** (compression and bending, buckling-driven),
**boss and skirt-bond terminations** (interlaminar shear and peel), and the
dome-to-cylinder transition. Those need classical laminate theory plus finite
elements plus test.

**C4 — Re-tempering D6AC 1450 → 1650 MPa.**
$t \propto 1/F_{tu}$, so the membrane mass falls by
$1 - 1450/1650 = \mathbf{12.1\ \%}$.

The question to ask first: **what does $K_{Ic}$ do, and can NDE find the
resulting critical flaw?** Eq. 3.6 gives $a_c \propto (K_{Ic}/\sigma)^2$, and
the operating stress rises by 13.8 % while $K_{Ic}$ in D6AC typically falls
across that temper range. If $K_{Ic}$ goes from, say, 100 to 65 MPa√m, $a_c$
falls by a factor of $(100/65)^2 \times 1.138^2 \approx 3.1$. A 12 % mass
saving is not worth moving the NDE acceptance threshold below what the
inspection method can reliably detect at the required probability of
detection. Secondary questions: heat-treat distortion control at the new
temper, and whether the qualification base (allowables, weld properties,
$K_{ISCC}$) exists for the new condition.

**C5 — Pressure and buckling.**
Buckling of a cylinder in axial compression or bending is driven by the
compressive membrane stress overcoming the shell's resistance to forming
out-of-plane waves. Internal pressure adds a tensile hoop stress and a
stabilising normal pressure on the wall that opposes the inward lobes of the
buckling mode, raising the critical load. Consequently the critical buckling
case for a strap-on booster is **not at max-Q with the motor at full
pressure**; it is where compression is high and pressure is low or zero:
during ground handling and transport, during stack assembly, at liftoff hold
before ignition, and in tail-off/after burnout when the case is still carrying
vehicle loads at near-ambient internal pressure. `[SP-8007]`

**C6 — Ranking the four RSRM redesign features against root cause.**
1. **Capture feature** — attacks the root cause directly. Joint rotation
   was the mechanism; the capture feature is a structural change that limits
   the rotation, so the gap the seal must follow largely stops opening.
2. **Joint heaters** — attacks the second-order cause: the temperature
   dependence of the elastomer's response rate. It does not stop the gap
   opening, but it restores the seal's ability to follow it.
3. **Redesigned joint insulation** — defence in depth: keeps combustion gas
   away from the seals so that a marginal seal is not immediately exposed to
   3300 K gas.
4. **Third O-ring** — pure redundancy. It addresses no mechanism; it adds a
   third chance at the same rate-limited seating problem. Worth having, but
   the pre-Challenger design already had two rings and both failed for the
   same common-cause reason, which is exactly why redundancy ranks last.

**C7 — Why storage makes fracture control worse.**
Three effects, none of which involve pressure cycles. (i) **Stress-corrosion
cracking**: high-strength steel under sustained stress (residual stress from
forming and heat treatment, plus assembly preload) in the presence of
moisture grows cracks at $K_I$ values far below $K_{Ic}$; the threshold
$K_{ISCC}$ can be a third of $K_{Ic}$. (ii) **Thermal cycling** of the
case/insulation/propellant stack drives low-cycle strain at bondlines and at
stress concentrations. (iii) **The propellant ages** — the grain stiffens and
its own thermally induced loads on the case change. None of this is visible
to the original proof test, which characterised the article on day one. That
is why storage-life programmes rely on surveillance: periodic removal,
inspection and firing of sample motors rather than on the acceptance test.

**C8 — Preferring the segmented steel case at equal $\zeta$.**
Two good reasons among several:
- **Logistics and production flow.** Segments can be cast in parallel in
  smaller autoclaves and shipped on standard rail cars; a bad segment can be
  scrapped and replaced without losing the whole motor. A monolithic case is
  one article, one mandrel, one 30-day winding cycle, and no salvage.
- **Inspectability, repairability and damage tolerance.** Steel takes an
  impact and dents; carbon/epoxy takes an impact and delaminates invisibly.
  Metal cases can be repaired, re-inspected by well-established volumetric
  NDE, and are tolerant of handling in a way composites are not. For a
  reusable or a long-stored motor this can outweigh mass.
(Also acceptable: existing qualified production base and lower unit cost; no
requirement for a filament-winding capital investment; steel's free axial
margin covering unanalysed handling loads.)

### Calculation

**N1 — 4340 case.** $R = 0.80$ m, MEOP $= 9.5$ MPa, $j_b = 1.4$,
$F_{tu} = 1380$ MPa, $\rho = 7850$ kg/m³.

$$p_b = 1.4\times9.5 = 13.30\ \mathrm{MPa}$$
$$t = \frac{p_bR}{F_{tu}} = \frac{1.330\times10^{7}\times0.80}{1.380\times10^{9}}
= 7.710\times10^{-3}\ \mathrm{m} = \mathbf{7.71\ mm}$$
$$\sigma_\theta = \frac{pR}{t} = \frac{9.5\times10^{6}\times0.80}{7.710\times10^{-3}}
= \mathbf{986\ MPa}\ (71.4\%\ F_{tu}),\qquad \sigma_z = \mathbf{493\ MPa}$$
$$m' = \rho\,2\pi(R+t/2)t = 7850\times2\pi\times0.80386\times7.710\times10^{-3}
= \mathbf{306\ kg/m}$$
$t/R = 0.0096$, comfortably thin-wall.

**N2 — Critical flaw depth.** Eq. 3.6, $K_{Ic} = 75$ MPa√m.
$$a_c(\mathrm{MEOP}) = \frac{1}{\pi}\left(\frac{7.5\times10^{7}}
{1.12\times9.857\times10^{8}}\right)^2 = 1.47\times10^{-3}\ \mathrm{m}
= \mathbf{1.47\ mm}$$
At proof $= 1.15\times$ MEOP, $\sigma = 1134$ MPa:
$$a_c(\mathrm{proof}) = \mathbf{1.11\ mm}$$

*NDE specification.* The acceptance threshold must be below the *proof*
critical size with margin for detection reliability, so specify reliable
detection of surface and subsurface flaws of depth $\ge 0.5$ mm (roughly
$a_c/2$) at 90/95 probability of detection, in a 7.7 mm wall. That is
demanding but achievable with ultrasonic and magnetic-particle inspection —
and it is precisely the argument for not going to a stronger, less tough
temper. Full marks require noting that the flaw is only 19 % of the wall
thickness, i.e. this design is firmly **burst-before-leak**.

**N3 — Kevlar 49/epoxy version.** $r_0 = 0.28$ m, $R = 0.80$ m:
$$\sin\alpha = 0.28/0.80 = 0.350 \Rightarrow \alpha = \mathbf{20.5°}$$
$$t_\alpha = \frac{p_bR}{2\sigma_f\cos^2\alpha}
= \frac{1.330\times10^{7}\times0.80}{2\times2.60\times10^{9}\times0.8775}
= 2.332\times10^{-3} = \mathbf{2.33\ mm}$$
$$t_{90} = \frac{p_bR}{\sigma_f}\left(1-\frac{\tan^2\alpha}{2}\right)
= \frac{1.064\times10^{7}}{2.60\times10^{9}}(1-0.0699)
= 3.807\times10^{-3} = \mathbf{3.81\ mm}$$
Total fibre $= 6.14$ mm (check: $1.5p_bR/\sigma_f = 6.138$ mm ✓).
$$t_L = 6.138/0.62 = \mathbf{9.90\ mm}$$
$$m' = 1380\times2\pi\times(0.80+0.00495)\times9.901\times10^{-3}
= \mathbf{69.1\ kg/m}$$
Ratio steel : Kevlar $= 305.7/69.1 = \mathbf{4.42}$.

**N4 — $PV/W$.**
$$\text{(a) 7075-T73: } \frac{\sigma}{2\rho g_0}
= \frac{5.05\times10^{8}}{2\times2800\times9.80665} = 9.20\times10^{3}\ \mathrm{m}
= \mathbf{9.20\ km}$$
$$\text{(b) S-glass netting: } \frac{\sigma_f V_f}{3\rho g_0}
= \frac{2.20\times10^{9}\times0.58}{3\times1990\times9.80665}
= 2.179\times10^{4}\ \mathrm{m} = \mathbf{21.8\ km}$$
The glass composite is lighter by a factor of **2.37** for the same pressure
and volume. Note the aluminium is *not* embarrassing here — 9.20 km beats
4130 steel's 7.1 km — which is why aluminium survived as long as it did; it
lost on temperature and on the arrival of carbon, not on $PV/W$ against
low-strength steel.

**N5 — GEM-63 mass fraction and inert-mass budget.**
$$m_i = 49{,}342 - 44{,}087 = 5{,}255\ \mathrm{kg},\qquad
\zeta = \frac{44{,}087}{49{,}342} = \mathbf{0.8935}$$
For $\zeta \ge 0.880$: $m_{i,\max} = m_p(1-\zeta)/\zeta =
44{,}087\times0.120/0.880 = 6{,}012$ kg. Allowable growth
$= 6{,}012-5{,}255 = \mathbf{757\ kg}$, which is **14.4 %** of the current
inert mass. The point of the problem: a 14 % inert-mass growth allowance
sounds generous until you notice it is only 1.5 % of gross mass, and that a
strap-on booster's inert mass is fought over in tens of kilograms.

**N6 — Raising MEOP from 7.0 to 8.0 MPa.**
$$p_b = 12.0\ \mathrm{MPa},\quad t = \frac{1.20\times10^{7}\times1.50}
{1.52\times10^{9}} = 11.84\ \mathrm{mm},\quad m' = 877.3\ \mathrm{kg/m}$$
$$m_{\mathrm{case}} = 877.3\times10.0\times1.35 = 11{,}844\ \mathrm{kg},
\qquad m_i = 17{,}844\ \mathrm{kg}$$
$$\zeta = \frac{121{,}110}{121{,}110+17{,}844} = \mathbf{0.8716}
\quad(\text{was } 0.8810)$$
$$\Delta v = 280\times9.80665\times\ln\frac{121{,}110+17{,}844+8{,}000}
{17{,}844+8{,}000} = \mathbf{4{,}772\ m/s}\quad(\text{was }4{,}907)$$

**A loss of 135 m/s.** Judged on the case alone the change is bad, and the
grader is looking for the student to say why the question is nonetheless
legitimate: raising $p_c$ raises $c^*$ efficiency slightly, raises the
optimum expansion ratio at fixed exit diameter, and shortens and lightens the
nozzle. The change is worth it only if those effects return more than 135 m/s
— which for a 14 % pressure rise on an already-efficient booster they will
not. Full marks require the numbers *and* the statement that the case term is
linear in $p_b$ (Eq. 3.12) while the performance return is roughly
logarithmic, so this trade always turns negative above some pressure.

**N7 — Gimbal loads.** $F = 4.0$ MN, $\delta = 6°$.
$$F_{\mathrm{side}} = F\sin\delta = 4.0\times10^{6}\times0.10453
= \mathbf{418\ kN},\qquad F_{\mathrm{axial}} = F\cos\delta = 3{,}978\ \mathrm{kN}$$
$$M = F_{\mathrm{side}}\times 1.2\ \mathrm{m} = \mathbf{502\ kN\,m}$$
Sanity: 418 kN is about 42 tonnes-force of side load applied to a dome with a
1 m hole in it, cycling at actuator bandwidth for the whole burn. That is why
gimballing a large motor is an aft-closure redesign, not a nozzle change.

**N8 — Burst prediction and a boss failure.**
Fibre thickness $t_f = t_L V_f = 12.0\times0.58 = 6.96$ mm. Netting
(Eq. 3.8, using the angle-independent total $t_f = 1.5\,pR/\sigma_f$):
$$p_b = \frac{t_f \sigma_f}{1.5R} = \frac{6.96\times10^{-3}\times3.30\times10^{9}}
{1.5\times0.85} = 1.80\times10^{7} = \mathbf{18.0\ MPa}$$
(The 24° winding angle does not enter the total — that is the point of the
check.) The article burst at $0.82\times18.0 = \mathbf{14.8\ MPa}$, at a
polar boss.

*Conclusion*: **the membrane design was not tested.** The article failed in
an attachment detail before the cylinder reached its capability, so the burst
pressure is a lower bound on the membrane strength and says nothing about
fibre translation, $V_f$, or winding quality. *Next steps*: fractography and
C-scan at the boss to identify the mechanism (fibre bearing, adhesive shear
in the boss flange bond, or interlaminar failure in the dome build-up);
strain-gauge review to see whether the boss region was running above the
membrane prediction; redesign the boss (taper the bond termination, thicken
the dome build-up, add doublers) and **re-test**. Do not adjust $\sigma_f$
downward on the basis of this test — the test did not measure it.

### Engineering reasoning

**R1 — Slope increase at 70 % of predicted burst.**
The hoop strain per unit pressure *increased*, i.e. the structure got softer.
Two leading explanations:
1. **Yielding** (metal case) or **matrix cracking / first-ply failure**
   (composite). The load path is intact but the effective modulus dropped. In
   a metal case at 70 % of burst this is expected if $F_{ty}/F_{tu}$ is around
   0.7–0.8 — and then the trace is not a defect at all.
2. **Load shedding from an adjacent structure into the cylinder** — a skirt
   bond, a boss flange or a doubler disbonded, so a region that had been
   sharing load stopped, and the mid-bay gauge picked up more.

*The channel that separates them*: a second strain gauge (or better, a rosette
plus an axial gauge) **at the suspected disbond region** — a skirt
termination or boss. Explanation 1 produces a simultaneous, smooth softening
at *all* stations. Explanation 2 produces a step at one station and a
softening elsewhere, with the local gauge going the opposite way (unloading).
Acoustic emission also separates them cleanly: a disbond is a discrete
high-energy event; yielding is a broad low-amplitude ramp.

Note the burst at 91 % of prediction is itself a finding worth chasing: a
sound article should be within about 5 %.

**R2 — RSRM vs P120C.**

| difference | RSRM | P120C | driving requirement | same today? |
|---|---|---|---|---|
| Material | D6AC steel | carbon/epoxy | RSRM: recovery from salt water, water impact, refurbishment, 1974 composite maturity. P120C: mass fraction, expendable | **No** for an expendable; arguably still yes for a sea-recovered reusable booster |
| Segmentation | 4 flight segments, 3 field joints | monolithic | RSRM: built in Utah, flown from Florida, rail transport of a 3.71 m × 38 m article is impossible. P120C: cast and integrated locally | **No** where transport allows; the constraint, not the physics, decides |
| Joint type | pinned clevis–tang with elastomeric seals | none (and bolted flanges where composite motors do segment) | RSRM: hoop-load transfer with rapid field assembly | **No** — a modern segmented design uses a bolted flange whose rotation can be analysed and tuned |
| Recovery | parachutes, water impact, refurbishment | expended | RSRM: cost amortisation policy of the Shuttle programme | **No** for this class — SLS deleted recovery entirely `[NASA-SLS-SRB]`, judging refurbishment more expensive than new hardware |

The synthesis a strong answer reaches: **three of the four RSRM decisions
were consequences of one programmatic choice (reuse) and one geographic fact
(Utah to Florida), not of propulsion physics.** P120C is what you get when
neither applies.

**R3 — Felicity ratio 0.83.**
The Felicity ratio is the pressure at which acoustic emission resumes on a
re-pressurisation cycle, divided by the maximum pressure previously reached.
A sound composite article is quiet until it exceeds its previous maximum
(the Kaiser effect), giving a ratio at or above 1.0. A ratio of **0.83** means
the structure begins emitting at 83 % of its previous peak — damage created
on the earlier cycle is growing on re-load. In composite pressure-vessel
practice a Felicity ratio below about 0.95 is treated as evidence of
progressive, load-driven damage; 0.83 is well into reject territory.

*What to do with the article*: it does not fly. Take it as an engineering
article: locate the emission sources by source triangulation, C-scan and
thermograph those regions, section them, and identify whether the damage is
in the membrane (a process problem — fibre waviness, low $V_f$, porosity) or
at a boss/skirt (a design detail problem). Then decide whether the fleet is
affected: if the source is process, the whole lot is suspect and the
acceptance proof profile must be revisited.

**R4 — Storage −40 °C to +60 °C, firing at either extreme.**
- **Hot extreme (+60 °C at firing)** drives **MEOP**, through the
  temperature sensitivity of burn rate: with $\pi_K = \sigma_p/(1-n)$, a
  +39 K excursion from a 21 °C reference at $\pi_K \approx 0.003$ K⁻¹ is
  roughly +12 % chamber pressure, before ignition overshoot and
  manufacturing tolerance. So the hot day **sizes the case wall**. It also
  reduces material allowables slightly and softens elastomers.
- **Cold extreme (−40 °C)** drives **the joints and the grain**. Elastomeric
  seals stiffen and their response rate collapses (the Challenger mechanism);
  adhesives embrittle; the propellant's thermal contraction against a
  case with a different CTE puts the grain bore into tension (Module 21) and
  the bondline into peel. It also lowers metal toughness — $K_{Ic}$ of
  high-strength steel falls with temperature, shrinking $a_c$.

So: **the hot day sizes the case, the cold day sizes the joint and the
bondline** — and a qualification programme must fire at both, not average
them.

**R5 — The argument against the Trident D-5 Kevlar→graphite change.**
The case against: Kevlar was the qualified, flight-proven case material for
the C-4 and for the D-5's own third stage as originally built; a material
change mid-programme forces re-qualification of the case, the insulation
bond, the boss attachments and the ageing/surveillance data set, with a real
schedule and cost hit and a real risk of introducing a new failure mode into
a deployed strategic system. Graphite is stiffer and more notch- and
impact-sensitive, so handling and damage-tolerance procedures change. And a
third-stage case is a small fraction of vehicle mass, so the absolute
weight saving is modest.

Why it lost: third-stage inert mass is the most leveraged mass in the
vehicle — it is carried through every prior stage — so a modest absolute
saving is a large range effect. And the second stated reason is not a
performance argument at all but an **integration** one: eliminating the
electrostatic potential difference between Kevlar and graphite in a vehicle
that was otherwise going graphite removed a whole class of
electrostatic-discharge concern `[WP]`. A materials-compatibility argument
that removes a hazard is very hard to argue against, and combined with the
mass leverage it carried the decision. [J]

---

## K2. Quiz answers with explanations

**Q1 (8) — (c) 2.0.**
From the two free-body cuts, $\sigma_\theta = pR/t$ and $\sigma_z = pR/2t$.
(a) inverts the relation. (b) is the *spherical* case, where both membrane
stresses equal $pR/2t$ — a common confusion. (d) is wrong for the membrane
solution: the ratio is exactly 2 independent of $t/R$; only the *absolute*
values pick up a thick-wall correction.

**Q2 (8).** $p_b = 1.4\times6.5 = 9.10$ MPa.
$$t = \frac{9.10\times10^{6}\times0.90}{1.500\times10^{9}}
= 5.46\times10^{-3}\ \mathrm{m} = \mathbf{5.46\ mm}$$
$$\sigma_\theta(\mathrm{MEOP}) = \frac{6.5\times10^{6}\times0.90}
{5.46\times10^{-3}} = \mathbf{1071\ MPa}$$
(Equivalently, $F_{tu}/j_b = 1500/1.4 = 1071$ MPa — the hoop stress at MEOP
is always the allowable divided by the burst factor, which is worth
recognising instantly.)

**Q3 (10).** MEOP is the **maximum expected operating pressure**: the highest
internal pressure the case can credibly see in any service condition, and the
pressure from which proof and burst pressures are derived. Four effects to
stack (Eq. 3.4), 2.5 points each:
1. **Propellant initial temperature** — hot-day conditioning raises burn
   rate, and the pressure sensitivity is $\pi_K = \sigma_p/(1-n)$, amplified
   by $1/(1-n)$ relative to the burn-rate sensitivity itself.
2. **Ignition transient overshoot** — the pressure peak above equilibrium
   during the 0.3–0.6 s rise.
3. **Manufacturing tolerance** — batch-to-batch scatter in the burn-rate
   coefficient $a$, and throat-area tolerance, both feeding $K_n$.
4. **Statistical allowance** — a 3σ (or equivalent) upper bound rather than a
   mean, so the design covers the tail of the population.
(Also creditable: throat erosion history changing $K_n$ during burn; grain
temperature gradients; a defined off-nominal such as a bore crack, if the
student states it is normally excluded from MEOP and handled separately.)

**Q4 (10).** At $\alpha = 18°$, $p_bR = 1.20\times10^{7}$ N/m,
$\sigma_f = 3200$ MPa:
$$t_\alpha = \frac{1.20\times10^{7}}{2\times3.20\times10^{9}\times\cos^2 18°}
= \frac{1.20\times10^{7}}{2\times3.20\times10^{9}\times0.9045}
= \mathbf{2.073\ mm}$$
$$t_{90} = \frac{1.20\times10^{7}}{3.20\times10^{9}}
\left(1-\frac{\tan^2 18°}{2}\right) = 3.75\times10^{-3}\times(1-0.0528)
= \mathbf{3.552\ mm}$$
Total fibre $= \mathbf{5.625\ mm}$.

At $\alpha = 30°$: $t_\alpha = 2.500$ mm, $t_{90} = 3.125$ mm, total
$= \mathbf{5.625\ mm}$ — **identical**. Within netting theory the total fibre
thickness of the cylinder is $1.5\,p_bR/\sigma_f$ for *any* $\alpha \le
54.74°$; changing the angle only redistributes fibre between helical and hoop
layers. The angle is therefore set by the polar boss through Clairaut's
relation (Eq. 3.9), not by a mass optimisation. Full marks require the
explanation, not just the number.

**Q5 (10).**
$$\text{maraging: } \frac{1.750\times10^{9}}{2\times8000\times9.80665}
= 1.115\times10^{4} = \mathbf{11.2\ km}$$
$$\text{carbon: } \frac{3.600\times10^{9}\times0.62}{3\times1590\times9.80665}
= 4.772\times10^{4} = \mathbf{47.7\ km}$$
Ratio $= \mathbf{4.28}$. Common error: using $\sigma_f$ without $V_f$ (gives
77 km) or using the metal formula's factor of 2 for the composite (gives
71.6 km). Both inflate the composite by ~50 %.

**Q6 (10) — (c) P120C.** Carbon-fibre filament-wound **monolithic** case, one
piece, no segments and no field joints; **3.4 m** diameter (13.5 m long);
141,400 kg propellant on 153,000 kg gross, so **$\zeta = 0.924$** `[WP]`.
Why the others are wrong: (a) the RSRM is *steel* and *segmented*; (b) the
SRMU is graphite/epoxy but **three segments**, so not monolithic; (d)
GEM-63XL *is* monolithic composite and Northrop Grumman calls it the longest
monolithic motor produced `[NG-COMM]`, but at 1.62 m diameter it is far
smaller — "longest" is not "largest," and the distinction is the point of the
question.

**Q7 (12).** *Mechanism* (6 pts): in a pinned clevis–tang joint, internal
pressure loads the clevis inner leg from inside while the outer leg is
restrained by the pins, so the tang and the clevis inner leg **rotate apart
about the pin line** and the gap the O-ring must seal momentarily **opens**
during the ignition pressure rise. *Rate dependence* (3 pts): the seal
survives only if the ring can extrude/recover into the gap at least as fast
as the gap opens, over a 0.3–0.6 s transient — it is a rate-matched seal, not
a static one. *Temperature dependence* (3 pts): the elastomer's stiffness and
response time are strongly temperature-dependent; cold-stiffened rings
respond too slowly to follow the gap, which is what happened on STS-51-L
`[Rogers86]`.

*Redesign feature*: the **capture feature** — an added inner lip on the tang
that engages the inside clevis leg and mechanically limits the joint from
rotating open, converting a moving gap into a nearly static one. (The third
O-ring, the redesigned insulation and the joint heaters are also correct
elements of the redesign but do not address the root cause; a student naming
only those gets at most half the redesign marks.)

**Q8 (12).** Baseline $\zeta = 121{,}000/137{,}400 = 0.8806$; new
$m_i = 13{,}200$ kg, $\zeta = 121{,}000/134{,}200 = \mathbf{0.9016}$.
$$\Delta v_{\mathrm{old}} = 280\times9.80665\ln\frac{145{,}400}{24{,}400}
= 4{,}901\ \mathrm{m/s},\qquad
\Delta v_{\mathrm{new}} = 280\times9.80665\ln\frac{142{,}200}{21{,}200}
= 5{,}226\ \mathrm{m/s}$$
Gain $= \mathbf{+325\ m/s}$ (4 pts for the two $\zeta$, 4 for the $\Delta v$).

*Judgment* (4 pts). 325 m/s is a large, real gain. But reducing $j_b$ from
1.4 to 1.3 does not remove risk-free margin — it removes the allowance that
covers the un-modelled part of the MEOP stack. Accept only on evidence:
(i) the MEOP build-up is demonstrably conservative and is backed by measured
flight or static-fire pressure data, not by assumed factors; (ii) the
fracture-control programme can find flaws below $a_c$ at the *higher*
operating stress, with a demonstrated probability of detection; (iii)
hydroburst articles from the production process show burst scatter tight
enough that $1.3\times$MEOP still sits several standard deviations below the
mean burst; (iv) the applicable standard (`[AIAA-S-080]`/`[AIAA-S-081]` or the
customer's) permits 1.3 for this class. Absent (i)–(iii), reject. A student
who accepts on the $\Delta v$ alone loses the judgment marks.

**Q9 (10).**
$$a_c = \frac{1}{\pi}\left(\frac{5.5\times10^{7}}{1.12\times1.130\times10^{9}}
\right)^2 = 6.01\times10^{-4}\ \mathrm{m} = \mathbf{0.60\ mm}$$
*Leak-before-burst check*: LBB requires a through-thickness flaw of length
comparable to the wall to remain stable, i.e. roughly $K_{Ic} \gtrsim
\sigma\sqrt{\pi t} = 1.130\times10^{9}\sqrt{\pi\times9\times10^{-3}}
= 1.90\times10^{8}$ Pa·m$^{1/2}$ = **190 MPa√m**. The material has
55 MPa√m, a factor of 3.5 short. **This design is emphatically
burst-before-leak**, and with a 0.60 mm critical flaw in a 9 mm wall
(6.7 % of thickness) it demands a fracture-control programme at the limit of
practical NDE. The correct engineering response is to question the 1700 MPa
temper.

**Q10 (10).**
*Article 1* (burst 103 % of prediction, origin at cylinder mid-bay):
demonstrates that the **membrane design and the winding process are sound** —
fibre translation, $V_f$, tension control and the netting sizing are all
validated, and the failure occurred where the analysis says it should. It
demonstrates **nothing** about the bosses, skirts or bond terminations, which
were never the weak link and therefore were never loaded to their capability.
*Article 2* (burst 78 %, origin at the aft polar boss): demonstrates only a
**lower bound** on membrane capability (≥78 % of prediction) and identifies a
deficient attachment detail. It says nothing about fibre translation.

*Which is the more serious programme problem*: **Article 2**, and by a wide
margin — but the deeper answer, and the one worth full marks, is that the
pair together is the real finding. Two nominally identical articles bursting
at 103 % and 78 % is a **25-point scatter**, which means either the two
articles are not actually identical (a process-control failure) or the boss
detail is marginal and sensitive to build variation. Either way, the fleet
cannot be certified on a mean. Fix the boss, then re-test enough articles to
establish that the scatter has collapsed.

---

## K3. Trade-study reference solution (T1)

**Restating the problem.** 3.2 m diameter, 90 t propellant, MEOP 8.0 MPa,
$j_b = 1.4$ (so $p_b = 11.2$ MPa), expendable, 24 units/year, 2,400 km rail
from plant to launch site. Rail permits 3.4 m diameter but **15 m of usable
deck per car**. No in-house winding capability. Five years to first flight.
400 kg of payload margin in hand.

**Sizing (generic properties from §4).** With $R = 1.60$ m and
$p_bR = 1.792\times10^{7}$ N/m:

| option | wall | $m'$ (kg/m) | notes |
|---|---|---|---|
| Carbon/epoxy ($\sigma_f$ 3500, $V_f$ 0.60, $\rho$ 1580) | $t_L = 1.5p_bR/(\sigma_fV_f) = 12.8$ mm | ≈ 204 | monolithic or segmented |
| D6AC steel (1520 MPa, 7830) | $t = p_bR/F_{tu} = 11.8$ mm | ≈ 931 | |
| Maraging 18Ni-250 (1700 MPa, 8000) | 10.5 mm | ≈ 848 | weldable, post-weld age |

A 90 t motor at $\eta_V = 0.88$, $\rho_p = 1770$ kg/m³ needs
$V \approx 57.8$ m³, which at $R = 1.60$ m is about **6.4 m** of cylinder
plus domes — call it **8.5 m of case overall**. *That fits on one 15 m rail
car.* Recognising this is the single most important step in the study and is
worth heavy marks: **the transport constraint does not bind**, so the
segmentation question is a false dilemma and options B and C are answering a
problem the programme does not have.

Case masses (cylinder × 1.35 for domes/bosses/skirts, 6.4 m of cylinder):
carbon ≈ **1,760 kg**; D6AC ≈ **8,050 kg**; maraging ≈ **7,320 kg**. Adding
three bolted flange joints to a segmented version costs [J] a further
5–10 % of case mass and a corresponding assembly and sealing burden. Against
a 400 kg payload margin, the carbon-versus-steel difference of ~6,300 kg of
inert mass is not a trade — it is the whole margin, six times over.

**Recommended answer: Option A, monolithic carbon/epoxy, with a hedge.**

Justification:
1. **Mass.** ~6.3 t of inert mass against ~0.4 t of payload margin. No other
   consideration is on the same scale, and the customer requirement is the
   binding constraint.
2. **Transport does not bind.** An 8.5 m monolithic case fits the stated 15 m
   deck limit at 3.2 m diameter inside the 3.4 m envelope. Segmenting
   (B or C) buys nothing and costs joint mass, joint seals, an insulation
   discontinuity and assembly labour at 24 units/year.
3. **Rate.** 24 units/year is the argument *against* naive monolithic
   winding: at a P120C-like 33-day cycle `[WP]` one machine yields ~11
   cases/year. The recommendation must therefore include **two winding cells
   from the start**, or a smaller, faster machine appropriate to a 3.2 m ×
   8.5 m article (which is a quarter the fibre length of P120C, so a
   ~10-day cycle is plausible [J]).
4. **Option D (monolithic maraging)** is the serious runner-up and the right
   *hedge*: it needs no new winding capability, is weldable with post-weld
   ageing, ships whole, and reaches ~7.3 t of case. It is the fallback if the
   winding capital or the qualification schedule fails.

**Two largest risks, and the year-one retirement plan:**

- **Risk 1 — no in-house winding capability, five years to flight.** This is
  a capital, facility, staffing and qualification risk, not a physics risk,
  and it is the reason a competent programme might still choose D. *Retire in
  year one by*: placing the winding-machine order against a firm delivery
  date; subcontracting the first three development cases to an established
  winder to de-risk the design while the facility is built; and winding,
  hydroproofing and **hydrobursting two full-scale development cases** to
  establish delivered $\sigma_f$ and the burst scatter for this specific
  construction. If the demonstrated $\sigma_f$ is below ~3,000 MPa or the
  scatter exceeds ~7 %, the mass advantage erodes and D becomes the choice.
- **Risk 2 — the boss and skirt attachments, not the membrane.** WE1, N8 and
  Q10 all make the same point: composite cases fail at attachments. With a
  nozzle boss, an igniter boss and two skirts each carrying strap-on thrust
  take-out loads into a 12.8 mm laminate, this is where the programme will
  actually get hurt. *Retire in year one by*: subscale boss and
  skirt-termination element tests to failure, a full-scale aft-closure
  structural article loaded with combined pressure + gimbal side load
  (~$F\sin\delta$ at the design gimbal angle) rather than pressure alone, and
  instrumenting the development hydroburst articles heavily at both
  terminations with strain gauges and acoustic emission.

**Rubric.**

| element | marks | what earns them |
|---|---|---|
| Correct sizing of all four options with stated assumptions | 20 | membrane/netting thicknesses and case masses, units correct |
| **Recognising that 8.5 m of case fits a 15 m car** | 20 | the constraint check that dissolves options B and C |
| Mass advantage quantified against the 400 kg payload margin | 15 | the comparison must be to the margin, not in the abstract |
| Production-rate analysis (24/yr vs winding cycle time) | 15 | must notice that one winding cell is not enough |
| A named, credible fallback (D) with the trigger for taking it | 10 | a hedge with a decision criterion, not a hand-wave |
| Two risks with *testable* year-one retirement actions | 20 | the actions must be measurements, with pass/fail thresholds |

**What loses marks.** Recommending B or C without checking the transport
constraint (the study's trap). Choosing A on "composites are lighter" with no
numbers. Ignoring the production rate entirely — the most common real-world
failure of this exact decision. Quoting a mass fraction without stating
$\eta_V$ and $\rho_p$. Proposing to retire the winding risk with "analysis"
rather than a burst test. Treating the 400 kg margin as if it were
comfortable.

---

## K4. Common wrong answers, and what they reveal

**"$\sigma = pD/2t$" with $D$ the outer diameter, or $R$ the mean radius,
used inconsistently.** The membrane derivation uses the *internal* radius for
the pressure-projected area. The error is small (0.3–1 %) and therefore
survives review, but a student who cannot say which radius belongs in which
place has not done the free-body cut and will get it badly wrong on a
thick-walled tactical case where $t/R$ is 0.1.

**Sizing the case to yield rather than to ultimate at burst pressure.** The
burst factor is defined on ultimate. Using $F_{ty}$ with $j_b$ double-counts
margin and produces a case 20–30 % heavier than the design practice the rest
of the industry uses. The reverse error — using $F_{tu}$ with a yield-based
factor — produces a case that takes permanent set at proof and is scrapped.

**Using the metal $PV/W$ formula ($\sigma/2\rho g_0$) for a composite with
$\sigma_f$ substituted directly.** This ignores both the fibre volume
fraction and the 1.5 factor that a cylinder (as opposed to an isotensoid
sphere) demands, and inflates the composite by roughly 50 %. It reveals that
the student has memorised Eq. 3.10 without following the netting derivation
that produces Eq. 3.11.

**Believing 54.7° is the winding angle to use.** It is the isotensoid angle
for a cylinder with no polar opening. Real cases have a nozzle at one end and
an igniter at the other and therefore wind at 12°–30° by Clairaut's relation.
The deeper miss is not knowing that within netting theory the angle does not
change the fibre mass at all.

**Answering "Challenger was an O-ring failure."** True and useless. It was a
joint-rotation failure that made the seal rate-limited and therefore
temperature-limited. Students who stop at the O-ring also tend to rank the
third O-ring above the capture feature in the redesign, which is the same
error twice: mistaking the component that broke for the mechanism that broke
it.

**Comparing motor mass fractions without asking what is inside the inert
mass.** RSRM's 0.85 includes parachutes, recovery hardware, external thermal
protection and field joints; P120C's 0.924 includes none of those. Quoting the
pair as a pure case-material comparison overstates the material effect. The
same error appears with Star 48B's ≈0.94, which is an upper-stage motor at
low pressure with high volumetric loading and a fixed nozzle — a different
design problem entirely.

**Treating the burst factor as a safety margin available for trading.** It is
mostly consumed by known-but-unquantified variability: propellant
temperature, burn-rate scatter, throat erosion. A student who trades
$j_b$ down for $\Delta v$ without asking how the MEOP was built has not
understood Eq. 3.4.

**Assuming a composite case is thinner than a steel one.** In WE1 it is
thicker (11.25 vs 10.36 mm) and still 4.6× lighter. This trips up packaging,
insulation-volume and $\eta_V$ estimates, and it is the most common numerical
surprise in this module.

**Forgetting that the critical buckling case is at *low* pressure.** Students
check buckling at max-Q with the motor running, find enormous margin from the
stabilising internal pressure, and never check transport, handling, or the
unpressurised stack. Real cases have been lost on the ground for exactly this
reason.
