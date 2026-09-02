# Module 16 — Structures and Materials — Answer Key
Part II · Key to `16-materials.md`

Standing constants: $g_0 = 9.80665$ m/s². Property values are the §4 typical values of the
module unless the problem states otherwise; they are **not design allowables** ([MMPDS]
is). Numerical results were recomputed with `tools/rocket.py`; the registered reruns are
in `tools/examples/16.py`.

Equations referenced: **3.1** $\Delta T_w = q''t/k$; **3.2**
$\sigma_{th} = E\alpha\Delta T_w/[2(1-\nu)]$; **3.3** $M_{ts} = kF_{ty}(1-\nu)/(E\alpha)$;
**3.4** $P_{LM}=T(C+\log_{10}t_r)$; **3.7**
$\Delta\varepsilon_t/2 = (\sigma'_f/E)(2N_f)^b + \varepsilon'_f(2N_f)^c$; **3.8**
$K = Y\sigma\sqrt{\pi a}$; **3.10** $\Delta\varepsilon_{grad} = \alpha q'' t/[2(1-\nu)k]$.

---

## K1. Problem solutions

### Conceptual

**C1.** At 200 bar the gas-side flux is of order 80–160 MW/m². Push that through a
sub-millimetre wall (Eq. 3.1) and the through-thickness temperature drop is 200–450 K in
copper and several thousand kelvin in any nickel or iron alloy — which is not a design,
it is a melt. The wall is restrained, so that temperature drop is a strain, and a strain
of that size in a wall with the low conductivity of a steel would exceed the material's
ductility in a handful of cycles even if it survived the first one. At 33 bar the flux is
roughly $(33/200)^{0.8} \approx 0.24$ of that, the gradient falls in proportion, and the
strain becomes small enough for austenitic stainless to survive thousands of cycles.
Conductivity has stopped being the driver, and the choice moves to brazeability, hydrogen
compatibility, cryogenic toughness and cost — all of which stainless wins.

*The one number for the 90 bar case:* compute $\Delta T_w = q''t/k$ for the candidate
alloy at the design flux and thickness, convert it to a strain range with Eq. 3.10, and
compare that strain against the alloy's LCF curve (Eq. 3.7) at the required cycle count.
Comparing $\Delta T_w$ against a "maximum allowable temperature" is the common wrong
answer: the limit is a *strain-range/life* limit, not a temperature limit. Credit an
answer that names $\Delta T_w$ *and* says what it is compared against.

**C2.** *Two sentences:* the load on a liner is an imposed strain, not an imposed stress,
so a stronger alloy delivers the same strain at higher stress and buys no life; and 718's
conductivity is about 5 % of copper's, so the same flux through the same wall would
require a 3,000 K gradient, which is not a life problem but a melting problem.

*The full version:* Eq. 3.10 shows the strain range is
$\alpha q''t/[2(1-\nu)k]$ — it contains conductivity, CTE, thickness and flux, and it does
not contain strength at all. Life then follows from Eq. 3.7, whose plastic branch is
governed by $\varepsilon'_f$, the fatigue ductility. Substituting 718 for NARloy-Z
multiplies $q''t/k$ by roughly 15 (316 → 21 W/(m·K) hot), which multiplies the strain range
by the same factor, which by Eq. 3.6 with $c \approx -0.6$ cuts life by a factor of
$15^{1/0.6} \approx 90$ — before the wall melts. The property that actually sets liner
life is thermal conductivity first (it sets the strain) and fatigue ductility second (it
sets the allowable strain). Strength enters only in that the liner must not ratchet, and
that is what GRCop's *hot* strength buys, not its room-temperature strength.

**C3.** Mechanism: HEE requires hydrogen to adsorb, dissociate and diffuse into the
hydrostatic tensile field ahead of a crack tip or notch, where it accumulates and either
lowers grain-boundary cohesion (HEDE) or localises slip (HELP). All of that is
diffusion-controlled. Below about 120 K hydrogen cannot diffuse fast enough to reach the
crack tip within the loading time, so the material behaves as it would in helium. Above
about 500 K hydrogen desorbs and the trap occupancy falls. The maximum is therefore in
between, near 200–300 K, and it is worse at low strain rate for the same reason.

*Worst-case components:* the hydrogen-side turbine hot-gas path and its manifolds, the
turbopump seal cavities and bearing housings, the hydrogen-side pump discharge volute and
ducting, and any warm-hydrogen valve body. Accept any of these. The LH₂ tank and the
pump inlet, at 20 K, are the *safest* hydrogen-wetted parts in the engine.

**C4.** The four elements and their classification:

| element | classification | why it does not transfer with drawings |
|---|---|---|
| Inert enamel coating on all hot-oxygen-wetted surfaces | **process** | Surface prep, application, firing, adhesion criteria, inspection and repair are a qualified process sheet built from decades of test failures, none of which appears on a part drawing. |
| Very oxidizer-rich preburner, gas at 500–800 K | **operating-point choice** | Visible on a cycle diagram, so this part *does* transfer — and is the part the West copied first. |
| Welded rather than bolted construction, extreme particulate and cleanliness control | **system-design rule** | Appears as cleanliness callouts whose *rationale* and enforcement culture do not transfer. |
| Nickel- and copper-based alloy selection for oxygen-wetted parts | **material** | The most transferable element, and the least sufficient on its own. |

The point of the classification: the only genuinely non-transferable element is the one
that is a process, and it is also the one the RD-180 block calls *"the single technology
that makes ORSC survivable"*. A cycle diagram is public; a process qualification is
institutional memory.

**C5.** All three mechanisms localise at grain boundaries. Creep: diffusional flow and
cavitation nucleate on transverse grain boundaries, and grain-boundary sliding is a major
strain contributor at high homologous temperature. Thermal fatigue: the crack initiates
and propagates preferentially along grain boundaries, which are also where the strain
concentrates because of elastic and CTE anisotropy between neighbouring grains. Hydrogen
embrittlement: hydrogen segregates to grain boundaries and lowers their cohesive strength,
which is why the embrittled fracture surface is intergranular.

A single-crystal blade has no grain boundaries at all, so all three mechanisms lose their
preferred path simultaneously. Secondary benefits worth credit: no grain-boundary
strengtheners (B, C, Zr, Hf) are needed, so the alloy can be given a higher solution
temperature and a fuller γ′ solution treatment; and an integrally-bladed rotor additionally
removes the fir-tree root, its fretting and its load-transfer stress concentration.

**C6.** Two independent refusals:

1. **Crystal structure / DBTT.** 4340 is a body-centred-cubic low-alloy steel. In BCC
   metals the critical resolved shear stress rises steeply as temperature falls because
   screw-dislocation motion is thermally activated; below the transition temperature the
   stress to move dislocations exceeds the stress to cleave, and fracture switches to
   transgranular cleavage with an order-of-magnitude drop in Charpy energy. 4340's
   transition is far above 90 K. A cryogenic valve body in 4340 is a brittle pressure
   vessel.
2. **Hydrogen.** High-strength low-alloy steels are in the most severely affected class
   for hydrogen environment embrittlement, and they are also susceptible to internal
   hydrogen embrittlement from plating and pickling. If the valve is anywhere near a
   hydrogen system, the alloy is disqualified twice.

Accept as a third reason: SCC susceptibility in chlorides and marine environments at that
strength level.

**C7.** $M_{ts} = kF_{ty}(1-\nu)/(E\alpha)$ rewards high conductivity and strength and
punishes stiffness and expansion. 2219 aluminium has $k = 120$ W/(m·K) with a *low* modulus
(73 GPa) and a respectable yield (393 MPa), which together give $M_{ts} \approx 19.4$ kW/m
against NARloy-Z's 14.7 kW/m. The ranking is useless because 2219 has no strength above
about 450 K and melts near 900 K, while a liner hot face runs at 800 K. The index measures
*resistance to thermal stress at the temperature its inputs were evaluated at*; it says
nothing about whether the material can exist at the service temperature.

The general rule: **a selection index is valid only inside the constraint set you have
already applied.** Screen on the hard constraints first (service temperature, chemical
compatibility, joinability), then rank the survivors with the index — and evaluate the
index at the operating temperature, not at 300 K. The module's own table makes the same
point twice: CuCrZr tops the room-temperature column and collapses in the 800 K column.

**C8.** In a closed expander cycle the hydrogen picks up heat in the chamber wall, and that
enthalpy *is* the turbine power — nothing is burned to drive the pumps. The wall is
therefore a heat exchanger whose job is to transfer as much heat as possible into the
coolant, not to keep heat out of the structure. A wall running hotter on the coolant side
raises the coolant outlet temperature and the available turbine work, which is exactly what
the cycle wants.

Implication for the objective function: in a staged-combustion or gas-generator engine the
wall design minimises hot-face temperature and strain subject to a coolant pressure-drop
budget — heat into the coolant is a nuisance you must survive. In an expander cycle the
wall design *maximises* heat pickup subject to a hot-face temperature limit and a pressure
drop budget — heat into the coolant is the product. This is also why the expander cycle has
a thrust ceiling: pickup scales with wall area ($\propto D^2$) while thrust scales with
throat area, so beyond a certain size the cycle cannot close and the design must go to
expander-bleed or a preburner.

### Calculation

**N1.**

(a) Eq. 3.1: $\Delta T_w = (45\times10^6)(1.0\times10^{-3})/340 = \mathbf{132.4\ K}$.

(b) Eq. 3.2: $\sigma_{th} = (105\times10^9)(18.5\times10^{-6})(132.4)/[2(1-0.33)]
= \mathbf{191.9\ MPa}$.

(c) 191.9 MPa against a hot yield of ~110 MPa: **the wall is not elastic.** It yields on
the hot face during the burn and reverse-yields on shutdown, which is why the life
calculation must be strain-based. (The computed 191.9 MPa is not a stress that exists; it
is a flag.)

(d) Eq. 3.10: $\Delta\varepsilon_{grad} = (18.5\times10^{-6})(132.4)/[2(0.67)]
= 1.827\times10^{-3}$. Total $= 2.2\times = 4.020\times10^{-3}$, so
$\Delta\varepsilon_t/2 = 2.010\times10^{-3}$.

Eq. 3.7 with $\sigma'_f/E = 400/100{,}000 = 4.00\times10^{-3}$:

$$2.010\times10^{-3} = 4.00\times10^{-3}(2N_f)^{-0.10} + 0.40\,(2N_f)^{-0.62}$$

Iterating: $2N_f = 3.53\times10^4$, so $N_f = \mathbf{17{,}640}$ cycles; with the factor of
4, **4,410 allowable cycles**. At this life the elastic term (1.40×10⁻³) dominates the
plastic term (0.61×10⁻³) — we are past the transition life and into the HCF-like branch,
which is the signature of a comfortably designed, moderate-flux liner. Compare WE1, where
the plastic term was 72 % of the total and the life was 765 cycles.

**N2.**

| alloy | $k$ (W/m·K) | $\Delta T_w$ at 45 MW/m², 1 mm | $t$ for $\Delta T_w = 200$ K |
|---|---|---|---|
| Inconel 718 (hot) | 21 | 2,143 K | 0.093 mm |
| 316L (hot) | 21.5 | 2,093 K | 0.096 mm |
| Ti-6Al-4V | 10 | 4,500 K | 0.044 mm |

All three gradients are physically impossible — the hot face would melt (718 melts near
1,600 K) long before the gradient established, which means in reality the wall temperature
would run away, not that a 2,000 K gradient exists. The thicknesses that *would* hold
200 K are 40–100 μm: foil, not structure. You cannot machine a coolant channel land at
that thickness, you cannot inspect it, it has no erosion or corrosion margin, and it would
buckle under the coolant-to-gas pressure difference. Titanium is additionally disqualified
if there is any oxygen anywhere near it. **Conclusion: at 45 MW/m² there is no non-copper
liner**, which is the same conclusion as C1 reached from the other direction.

**N3.**

(a) $300\ \mathrm{s} \times 150 = 45{,}000\ \mathrm{s} = \mathbf{12.5\ h}$.

(b) Eq. 3.4 inverted: $T = 27{,}600/(20 + \log_{10}12.5) = 27{,}600/21.097 =
\mathbf{1{,}308\ K}$.

(c) Operating at 1,050 K gives a margin of **258 K** on the creep-rupture limit, which is
ample — creep is not the life driver here.

*What to check next:* oxidation. Haynes 230 at 1,050 K in a fuel-rich or oxygen-bearing
gas-generator flow forms a chromia scale, and scale growth plus spallation on thermal
cycling thins the wall. Also check (i) thermal fatigue from 150 start–shutdown cycles,
(ii) creep–fatigue interaction, since each firing is a 300 s hold at temperature inside a
strain cycle, and (iii) whether a TBC is needed and whether it will stay attached for 150
cycles. Full marks require naming oxidation *or* thermal/creep fatigue with a reason.

**N4.** Sphere: $\sigma = pR/(2t)$.

(a) Allowable at MEOP: $390/1.25 = 312$ MPa.
$t = pR/(2\sigma) = (35\times10^6)(0.150)/(2\times312\times10^6) = \mathbf{8.41\ mm}$.

(b) At proof ($1.5\times$ MEOP $= 52.5$ MPa) with that thickness:
$\sigma = (52.5\times10^6)(0.150)/(2\times8.41\times10^{-3}) = \mathbf{468\ MPa}$ —
**which is above the 390 MPa yield.** The part yields in proof. This is the trap in the
problem: a factor of 1.25 on yield at MEOP does not automatically cover a 1.5 proof
factor, because $1.5/1.25 = 1.2 > 1$. Sizing on the proof condition instead
($\sigma_{proof} \le F_{ty}$) gives $t = 10.10$ mm, at which the MEOP stress is 260 MPa
and the yield margin at MEOP is $390/260 = 1.50 > 1.25$ ✓. **The proof condition governs.**

(c) With $t = 10.10$ mm and $\sigma_{proof} = 390$ MPa:
$a_{cr} = (1/\pi)\left[K_{Ic}/(Y\sigma)\right]^2
= (1/\pi)[150/(1.12\times390)]^2 = \mathbf{37.5\ mm}$.
(With the 8.41 mm wall and 468 MPa: 26.1 mm.)

(d) The critical flaw at proof stress is 37.5 mm; NDE finds 0.8 mm. The demonstrated flaw
margin is a factor of ~47 in depth. **Yes, the design is comfortably damage-tolerant** —
which is characteristic of a tough austenitic at moderate stress, and is exactly why 316L
is used for pressurant bottles despite its low strength and consequent mass. Note the flaw
size is larger than the wall thickness, so the governing failure mode is leak-before-burst,
which is the desired behaviour for a pressure vessel.

**N5.** $\Delta\alpha = (17.5 - 13.0)\times10^{-6} = 4.5\times10^{-6}$/K;
$|\Delta T| = 190$ K.

$$\varepsilon_{mis} = 4.5\times10^{-6}\times190 = 8.55\times10^{-4}$$

$$E^*_{Cu} = \frac{125}{1-0.33} = 186.6\ \mathrm{GPa},\qquad
E^*_{Ni} = \frac{200}{1-0.29} = 281.7\ \mathrm{GPa}$$

$$\frac{E^*_{Cu}t_{Cu}}{E^*_{Ni}t_{Ni}} = \frac{186.6\times1.0}{281.7\times4.0} = 0.1656$$

$$\sigma_{Cu} = \frac{186.6\times10^9\times8.55\times10^{-4}}{1.1656} = \mathbf{136.9\ MPa}
\ \text{(tension)}$$

$$\sigma_{Ni} = \sigma_{Cu}\frac{t_{Cu}}{t_{Ni}} = \mathbf{34.2\ MPa}\ \text{(compression)}$$

**Signs:** copper has the larger CTE, so on cooldown it wants to contract more; the
stiffer, thicker nickel holds it back, putting the **copper in tension** and the **nickel
in compression**. Neither yields: GRCop-84 gains strength cold and is well above 200 MPa
yield at 110 K, and 718 at 34 MPa is nowhere near its 1,000 MPa yield. But 137 MPa is a
mean-stress shift that is present on every chilldown and adds to the hot-fire cycle, so it
belongs in the fatigue analysis, and the interfacial shear it implies at free edges is
where a debond would start.

**N6.** With $b = 0.120$ m, $a = 0.100$ m:

$$\sigma_\theta = 30\times10^6\,\frac{0.120^2+0.100^2}{0.120^2-0.100^2}
= 30\times10^6\times5.545 = \mathbf{166.4\ MPa}$$

Stress falls from 265.8 to 166.4 MPa, a **37.4 % reduction**. Mass per unit length
$\propto (b^2-a^2)$, which goes from $2.544\times10^{-3}$ to $4.400\times10^{-3}$ m² — a
**73.0 % increase**.

*Exchange rate:* you paid 73 % of the housing mass to remove 37 % of a stress that already
had a factor of 3.9 margin in Inconel 718. That is a terrible trade and it is the general
shape of the thick-wall relation: hoop stress falls as roughly $1/(b^2-a^2)$ near this
geometry, while mass rises as $(b^2-a^2)$, so the marginal mass cost of stress reduction
grows without bound. If the housing needs to be thicker, it is for stiffness,
rotordynamics or fracture control, not for static strength — and you should say so
explicitly in the stress report rather than letting a reader assume the wall was
strength-sized.

**N7.** Paris' law is $da/dN = C(\Delta K)^m$. Multiplying $da/dN$ by 40 at every $\Delta K$
is equivalent to replacing $C$ by $40C$ with $m$ unchanged. Life is
$N = \int_{a_0}^{a_{cr}} da/[C(\Delta K)^m]$, so it scales as $1/C$:

$$N_{H_2} = \frac{4{,}000}{40} = \mathbf{100\ cycles}$$

*Assumption you had to make:* that the factor of 40 applies **uniformly across the whole
$\Delta K$ range** integrated, and that $m$ and the critical flaw size are unchanged. Both
are questionable: hydrogen typically raises $da/dN$ by a *variable* factor that is largest
near threshold, and it also lowers $\Delta K_{th}$ and can lower $K_{Ic}$, both of which
make the real answer worse than 100. Note that $m = 3$ is irrelevant to the arithmetic
once the factor is uniform — a common wrong turn is to take the cube root of 40.

*What to do about it:* 100 cycles is very likely below the required life, so, in order:
(1) get real hydrogen-environment crack-growth data at the actual pressure, temperature and
$R$-ratio rather than a scalar factor; (2) reduce $\Delta K$ — lower the stress, open the
fillet radius, shot peen to put the surface in compression; (3) apply a barrier
(gold or copper plating) to the hydrogen-wetted surface; (4) change the alloy to
A-286/JBK-75 or derate the 718 heat treatment; (5) improve NDE so $a_0$ is smaller, which
helps most because the integrand is largest at small $a$. Do **not** simply reduce the
required life by inspection interval unless the part is actually inspectable in the
assembled engine.

### Engineering reasoning

**R1.** Symptoms: coolant outlet temperature up 6 %, coolant $\Delta p$ down 3 %,
$\eta_{c^*}$ unchanged, liner surface dull and roughened.

*Ranked differential:*

1. **Blanching (most likely).** Cyclic oxidation/reduction of the copper roughens and
   porosifies the gas-side surface. Roughness raises the gas-side heat-transfer
   coefficient, so the heat load into the coolant rises → coolant outlet temperature up.
   The visual evidence (dull, roughened surface) is the signature. It explains the
   temperature rise directly and is consistent with 40 cycles of accumulated exposure.
   It does not by itself explain the $\Delta p$ drop.
2. **Channel bulging / early ratcheting.** Progressive plastic deformation of the land into
   the gas path enlarges the channel cross-section → **lower** coolant $\Delta p$, which
   is exactly the second symptom, and thins the land → less conduction resistance and a
   higher heat load. This explains both symptoms and is the dangerous candidate, because
   the endpoint is a doghouse rupture.
3. **Coolant-side deposit or fouling** would raise $\Delta T$ but would *raise* $\Delta p$,
   not lower it. Rank low.
4. **Instrumentation drift** on the outlet RTD or the $\Delta p$ transducer. Always on the
   list; cheap to eliminate.
5. **Throat erosion** would show as falling $\eta_{c^*}$ and a growing $A_t$. $\eta_{c^*}$
   is unchanged, so rank this low — and note that unchanged $\eta_{c^*}$ also argues
   against an injector or mixture-ratio shift as the cause of the extra heat.

*Next measurement:* a dimensional check of the channel lands and the local wall thickness —
borescope with a measuring reticle, or better, an X-ray CT or ultrasonic wall-thickness
map of the barrel, plus a throat CMM to confirm $A_t$. That single measurement separates
candidate 1 (roughened surface, lands unchanged) from candidate 2 (lands thinned and
bulged), and the two have completely different dispositions: blanching is a life-shortening
degradation you can trend, incipient ratcheting is a stop-work.

**R2.** Burn-through at 4.2 s in an ORSC preburner, originating at a weld land downstream
of an injector element.

| candidate initiating event | distinguishing evidence | design change |
|---|---|---|
| **Particle impact ignition** — a chip of weld spatter, machining debris or filter bypass striking the land at high velocity in hot oxygen | Metallographic section at the origin showing an impact crater or an embedded foreign particle; system-level evidence from filter inspection and cleanliness sampling; origin at a stagnation or impingement point | Tighten cleanliness spec and verification; add or upgrade the upstream filter; deburr and re-inspect welds; passivate; re-clean to a numbered level per ASTM G88 |
| **Local fuel-rich streak / injector maldistribution** creating a hot spot on an otherwise survivable surface | Origin correlates with a specific element's position; CFD or cold-flow showing impingement on that land; thermal discoloration pattern upstream of the origin | Change element geometry or spacing; add a film or barrier; re-index the element pattern relative to welds |
| **Coating defect or absence at the weld land** — the weld was made after coating, or the coating did not adhere in the fillet | Metallography showing bare substrate under the origin with intact coating adjacent; coating thickness map | Change the manufacturing sequence so coating follows welding; qualify a coating repair procedure; design the joint so it is not in the hot-oxygen path |
| **Velocity/impingement violation** — local gas velocity above the oxygen-service limit at a geometric feature | Origin at a step, weld bead protrusion or flow reattachment point; CFD velocity map exceeding the G88 guidance | Blend the weld bead flush; change local flow area; move the joint out of the high-velocity region |

Accept also: adiabatic compression at a fast-opening valve during start (evidence: origin
near a valve or dead-end cavity, and a start-transient pressure trace with a very high
$dp/dt$), and resonance heating in a dead-end cavity. Note in the answer that all five
candidates are consistent with §3.4.2's claim that oxygen fires are started by geometry
and contamination, not by the base metal's intrinsic properties — the substrate alloy is
rarely the root cause and is rarely the right fix.

**R3.** Team A: 8 engines/year. Team B: 200 engines/year.

*Team A → carbon–carbon.* At 8 units a year, a high non-recurring and per-unit cost is
amortised over a small number of very valuable articles; the mass saving of C–C over
C-103 is large (density ~1,800 versus 8,850 kg/m³) and on an upper stage translates
directly into payload; and low rate means the specialist supply chain and the long lead
time are tolerable. This is the RL10B-2 case: a 2.5 m extension worth ~30 s of $I_{sp}$
[_verify-liquid, RL10B-2 block].

*Team B → silicide-coated C-103.* At 200 units a year, unit cost, lead time, supply-chain
depth, handling robustness and yield dominate. C-103 is formable and weldable at room
temperature, producible in quantity, and repairable. This is the Merlin Vacuum case
[_verify-liquid, Merlin block].

*The single number that flips each recommendation:*
- **For team A:** the *stage* mass sensitivity — specifically, the payload gained per kg of
  extension mass saved, in dollars. If that number is smaller than the C–C cost premium per
  kg saved, buy niobium. (Equivalently: if the extension is small enough that the absolute
  mass difference is a few kilograms, C–C stops paying.)
- **For team B:** the *production cost and lead time of C–C at rate*. If a supplier can
  deliver 200 coated C–C extensions a year at a unit cost within a small multiple of the
  niobium part, take the mass. Rate capability, not the material property, is the
  discriminator.

A strong answer also notes that **both** materials need an oxidation coating and that in
both cases the coating, not the substrate, sets the life and the handling requirements —
so the "coating repair procedure exists and is qualified" question should be asked of both
suppliers before the trade is run.

**R4.** Brittle, intergranular fracture from a machined fillet in a hydrogen-service
Inconel 718 housing that passed its static analysis with a 2.1 yield margin.

*What most likely happened.* This is the classic hydrogen environment embrittlement
signature (§3.4.1): 718 is in the most severely affected class, with notched strength
ratios of 0.3–0.6 in high-pressure hydrogen; the fracture is intergranular; the origin is a
notch (a machined fillet is a stress concentrator and a hydrogen-accumulation site); and a
proof test is a *slow*, monotonic load application, which is the worst loading rate for a
diffusion-controlled mechanism. A 2.1 margin computed against smooth-specimen room-
temperature allowables in air is not a margin at all in this environment: the effective
notched strength may be half the allowable used. A secondary possibility is **internal**
hydrogen embrittlement from processing — pickling or plating without a bake-out — which
would produce the same fractography with no service hydrogen required.

*Two tests to demand on the failed part:*
1. **Fractography (SEM) at the origin**, to confirm intergranular or quasi-cleavage
   morphology and locate the initiation site relative to the fillet and the machining
   marks. Ductile dimples would send you somewhere else entirely.
2. **Hydrogen content analysis** of material adjacent to the fracture (inert-gas fusion /
   thermal desorption), to separate *internal* hydrogen from processing (elevated bulk
   hydrogen) from *environmental* hydrogen (bulk content normal). Accept as an alternative
   or additional: a slow-strain-rate notched tensile test on material from the same heat in
   H₂ versus He, to measure the $NSR$ and confirm the alloy and heat treatment are as
   susceptible as suspected.

*Three fixes, in the order to try them:*
1. **Design and process fixes first, because they are cheapest:** open the fillet radius,
   improve the surface finish, shot peen to put the surface in residual compression, and
   verify there is no post-machining residual tensile stress. Add a bake-out after any
   plating or pickling.
2. **Barrier plating** — gold or copper on the hydrogen-wetted surface, as the RS-25 did
   (§3.4.1, §6.2), with a plating coverage and adhesion inspection, since a pinhole is an
   entry point.
3. **Change the material state or the material:** derate the 718 heat treatment to a lower
   yield (susceptibility falls with strength level), or substitute A-286 or JBK-75, which
   sit at $NSR \approx 0.8$–0.9. This is last because it is a requalification.

A strong answer notes that the correct *analysis* fix — recomputing the margin against
hydrogen-environment notched allowables rather than air allowables — must happen regardless
of which hardware fix is chosen, or the next part will fail the same way.

**R5.** Eq. 3.7 has two branches. At **high strain range** the plastic term
$\varepsilon'_f(2N_f)^c$ dominates; at **low strain range** the elastic term
$(\sigma'_f/E)(2N_f)^b$ dominates. On a log–log plot the two branches are straight lines of
slope $c$ (steep) and $b$ (shallow), and the observed curve is their sum.

The two temperature curves being *nearly parallel at high strain range* means the plastic
branch has barely moved: $\varepsilon'_f$ and $c$ are roughly unchanged, i.e. the alloy's
fatigue ductility is not much degraded at 800 K. The **divergence at low strain range**,
with 800 K below 300 K, means the **elastic branch has dropped**: $\sigma'_f/E$ has fallen.
Both of its parts move the right way — $\sigma'_f$ scales roughly with the tensile
strength, which for a copper alloy falls by half or more between 300 K and 800 K, and $E$
falls too but by much less, so the ratio drops. If the two lines also converge at very high
strain range and the 800 K slope is slightly steeper, a secondary reduction in
$\varepsilon'_f$ (or a creep–fatigue contribution) is present as well.

*Why the divergence is at the low-strain end, stated physically:* long-life, low-strain
fatigue is controlled by the stress needed to nucleate and grow a crack in a nominally
elastic material — a **strength**-controlled process, and strength is what temperature
destroys in copper alloys. Short-life, high-strain fatigue is controlled by how much
plastic strain the material can absorb per cycle before it exhausts its ductility — a
**ductility**-controlled process, and copper alloys keep their ductility hot. Temperature
attacks strength much harder than it attacks ductility, so it moves the elastic branch and
leaves the plastic branch nearly alone.

*Design consequence:* for a liner running at high strain range (a high-flux, high-$p_c$
engine), the room-temperature and hot LCF curves give similar answers and the hot data are
not critical. For a lightly loaded, long-life liner, using room-temperature LCF constants
is dangerously unconservative. Credit an answer that draws this conclusion.

---

## K2. Quiz answers with explanations

**Q1 (8) — (b).**
Conductivity keeps $\Delta T_w = q''t/k$ small (Eq. 3.1), and the strain range is
proportional to $\Delta T_w$ (Eq. 3.10). Everything else follows.
*(a)* Ductility does help — it raises $\varepsilon'_f$ and hence the allowable strain — but
it is a second-order benefit of the same choice, and it would not save a low-conductivity
material, which would melt rather than fatigue. *(c)* Copper's modulus (110–125 GPa) is
lower than a superalloy's, which helps the *stress* but not the *strain*, and the strain is
the load. *(d)* Backwards: copper alloys **suffer** blanching; GRCop resists it better than
NARloy-Z, but no copper alloy is chosen *for* blanching resistance.

**Q2 (10).**
$\Delta T_w = (100\times10^6)(0.80\times10^{-3})/310 = \mathbf{258.1\ K}$.
$\sigma_{th} = (100\times10^9)(18\times10^{-6})(258.1)/[2(1-0.33)] = \mathbf{346.7\ MPa}$.
Meaning: 346.7 MPa is 2.7× the hot yield of 130 MPa, so the wall **cannot be elastic** —
it yields in compression on the hot face during the burn and reverse-yields in tension on
shutdown. The number is not a stress that exists in the part; it is the signal to switch
from a stress-margin calculation to a strain-based low-cycle-fatigue life calculation.
Full marks require the interpretation sentence, not just the two numbers.

**Q3 (8) — (c).**
HEE is diffusion-controlled: hydrogen must reach the crack-tip stress field within the
loading time. That gives a susceptibility maximum near 200–300 K (below ~120 K diffusion is
too slow; above ~500 K hydrogen desorbs) and a worse effect at low strain rate, which gives
diffusion more time.
*(a)* and *(b)* are wrong on temperature — 20 K is essentially safe. *(a)* is also wrong on
strain rate. *(d)* is wrong on both: at 800 K the mechanism is largely gone, and 718 has
other problems there (overaging).

**Q4 (12).**
(a) $T = 24{,}000/(20+\log_{10}100) = 24{,}000/22 = \mathbf{1{,}090.9\ K}$.
(b) $T = 24{,}000/(20+\log_{10}10{,}000) = 24{,}000/24 = \mathbf{1{,}000\ K}$.
(c) Any one of: the alloy may undergo a microstructural change (precipitate overaging,
phase transformation, carbide coarsening) above the temperature the master curve was
fitted over, and Larson–Miller cannot see it — the 718 case in WE2; oxidation may set the
life before creep does at that temperature; the extrapolation may be outside the tested
range of the fit; a coating may have a lower limit than the substrate; or creep
*deformation* (a dimensional limit, e.g. turbine tip clearance) may be reached long before
rupture, and $P_{LM}$ curves are usually rupture curves.

**Q5 (10).** Ranking for a radiation-cooled extension at 1,500 K:

1. **C-103 with silicide coating** — the only one of the four that can exist at 1,500 K. It
   is designed for exactly this: formable, weldable, ductile cold, good to ~1,650 K coated.
2. **316L** — a distant second in principle: austenitic stainless has essentially no useful
   strength above ~1,100 K and would creep-sag and oxidise rapidly. Not usable, but it at
   least does not melt.
3. **GRCop-84** — melts around 1,350 K. It also throws away the one property it is good
   for: a radiation-cooled wall has no through-thickness gradient to conduct away.
4. **Ti-6Al-4V — the loser.** It has no strength above ~700 K, its α+β structure is gone,
   and if there is any oxygen in the plume (there is) it will ignite. It also fails
   catastrophically on the LOX-compatibility grounds of §3.3.5. Losing on three
   independent counts is what makes it last.

**Q6 (10).** The one word: **ignition** (accept "combustion", "burning", "flammability").
Titanium's huge heat of oxidation (~19 MJ/kg) and low thermal conductivity mean a reacting
site cannot shed heat and runs away, and its oxide is not protective; the result is that
titanium ignites in oxygen at low impact energies. On the hydrogen side there is no
oxidizer, so its outstanding specific strength (830 MPa at 4,430 kg/m³) can be used freely
for impellers and inducers.

The standardised test: **ASTM G86**, *Standard Test Method for Determining Ignition
Sensitivity of Materials to Mechanical Impact in Ambient Liquid Oxygen and Pressurized
Liquid and Gaseous Oxygen Environments* (NASA implementation: NASA-STD-6001 Test 13).
Accept ASTM G124 (promoted ignition) or ASTM G94 (the evaluation guide) for partial credit,
but G86 is the impact test that specifically disqualifies titanium.

**Q7 (12).**
$$0.005 = 3.5\times10^{-3}(2N_f)^{-0.10} + 0.35\,(2N_f)^{-0.60}$$
Iterate: at $2N_f = 2{,}000$ the sum is $5.32\times10^{-3}$ (too high); at $2N_f = 2{,}500$
it is $4.83\times10^{-3}$ (too low); at $2N_f = 2{,}278$ it is $5.00\times10^{-3}$ ✓.

$2N_f = \mathbf{2{,}278}$ (anything from 1,900 to 2,700 is within 20 %),
$N_f = \mathbf{1{,}139}$ cycles, and with the factor of 4, **285 allowable cycles**.

Plastic dominance: at $2N_f = 2{,}278$ the elastic term is $1.62\times10^{-3}$ and the
plastic term is $3.38\times10^{-3}$, so the plastic term is **68 %** of the total — still
in the LCF regime, as expected at a 1 % strain range.

**Q8 (10) — (c) is wrong.**
Inconel 718 is one of the *most* hydrogen-susceptible engineering alloys (notched strength
ratio ~0.3–0.6 in high-pressure H₂), not one of the resistant ones. It is also not a
turbine-blade alloy: blades are investment-cast DS or single-crystal superalloys, because
718 overages above ~925 K and a wrought alloy has grain boundaries where creep, thermal
fatigue and hydrogen all attack. Both halves of (c) are wrong, which is what makes it the
answer.
*(a)*, *(b)* and *(d)* are all correct as stated: 625 is solid-solution and freely
weldable; Haynes 230 is chosen for oxidation resistance and thermal stability to 1,400 K in
a sheet-metal hot part; 21-6-9 is the standard hydrogen-line austenitic, chosen for exactly
those two reasons.

**Q9 (10).**
*Reason to choose GRCop-84:* higher strength and creep resistance at temperature (roughly
190–210 MPa yield at RT and ~130 MPa at 800 K, from twice the Cr₂Nb dispersoid loading),
and a much larger and better-documented property database — the NASA Glenn work and the
*Aerospace Structural Materials Handbook* supplement [GRCop]. If you need allowables you
can defend, -84 has them.

*Reason to choose GRCop-42:* markedly better **printability** in laser powder-bed fusion —
half the dispersoid loading gives a wider process window, less cracking, and lower reflected
laser power — plus slightly higher thermal conductivity (~340 versus ~310 W/(m·K)), which
directly reduces $\Delta T_w$ and hence the strain range.

*For a first-of-kind printed chamber: **GRCop-42.*** On a first build, process yield is the
programme risk, not a 15 % strength difference — a chamber you cannot print without cracks
has zero allowables. The conductivity edge also partly offsets the strength deficit by
lowering the strain range (Eq. 3.10). Accept GRCop-84 for full marks *only* if the answer
argues from an established, qualified in-house -84 parameter set and accepts the yield risk
explicitly.

**Q10 (10).**
*The argument against:* raising chamber pressure from 140 to 250 bar raises the oxygen
partial pressure everywhere in the oxidizer-rich preburner, turbine and hot-gas manifold by
roughly the same factor. **Promoted-ignition threshold pressure falls as oxygen pressure
rises** — that is the whole content of an ASTM G124 curve — so the margin against
self-sustained metal combustion shrinks. At the same time the higher pressure raises gas
density and velocity, which increases the kinetic energy of any entrained particle (the
dominant ignition source) and worsens erosion of the protective surface layer. The
mechanism is **metal fire / promoted ignition in high-pressure oxygen** (§3.4.2), not
creep, not oxidation, not fatigue.

*What the RD-180 has that would have to be developed or acquired:* the **inert enamel
coating on every hot-oxygen-wetted surface** — and specifically the qualified *process* for
applying, adhering, inspecting and repairing it, which is what the RD-180 verification
block calls the single technology that makes ORSC survivable [_verify-liquid, RD-180
block]. Accept "a qualified oxidation/ignition-barrier coating process" as the answer.
Do not accept "a better alloy": no monolithic structural alloy is inert in that
environment, which is why the solution is a coating in the first place. A strong answer
also notes that Blue Origin's 140 bar was chosen explicitly for life and reusability, i.e.
the proposal is asking to give back exactly the margin the design was built around.

---

## K3. Trade-study reference solution (T1)

### The defensible recommendation: **(a), printed GRCop-42 liner with a printed Inconel 718 jacket**

**Step 1 — screen on the hard constraints first (C7's rule).**

- **(d) Printed Inconel 718 monolithic chamber** is eliminated immediately. Eq. 3.1 with
  718's hot conductivity (21 W/(m·K)) and a 1 mm wall gives $\Delta T_w = 4{,}524$ K at the
  95 MW/m² throat. To hold a survivable 250 K gradient the flux would have to be cut to
  **5.25 MW/m²**, i.e. by a factor of 18. No film-cooling scheme delivers that without
  destroying $I_{sp}$ and $\eta_{c^*}$ (Module 06 §3.11, Module 11), and a heavily
  film-cooled reusable booster chamber has its own wall-streaking and life problems.
  Reject on physics, before cost.
- **(c) CuCrZr liner** is eliminated on temperature. CuCrZr is a conventional
  precipitation-hardened alloy that overages above roughly 700 K; a liner hot face at 800 K
  will soften progressively over 280 cycles, and the failure mode is creep and ratcheting
  rather than clean LCF. It has the best room-temperature index in the module's $M_{ts}$
  table (29.6 kW/m) and the *worst* collapse hot (5.8 kW/m) — the exact trap C7 describes.
  Also: the company would have to braze the 718 jacket, and the braze cycle temperature is
  in the overaging range for CuCrZr.

That leaves (a) and (b), both of which are copper liners with a nickel jacket.

**Step 2 — run the numbers on the two survivors.** Throat, $t = 1.0$ mm, $q'' = 95$ MW/m².

| | (a) GRCop-42 | (b) NARloy-Z |
|---|---|---|
| $k$ (W/m·K) | 340 | 316 |
| $\Delta T_w$ (Eq. 3.1) | **279.4 K** | **300.6 K** |
| $\alpha$, $\nu$, $E$ hot | 18.5e-6, 0.33, 105 GPa | 18.0e-6, 0.34, 100 GPa |
| elastic $\sigma_{th}$ (Eq. 3.2) | 405 MPa | 410 MPa (both ≫ hot yield → LCF) |
| gradient strain (Eq. 3.10) | 3.86×10⁻³ | 4.10×10⁻³ |
| total $\Delta\varepsilon_t$ (×2.2) | 8.49×10⁻³ | 9.02×10⁻³ |
| LCF constants used | 4.0e-3, −0.10, 0.40, −0.62 | 3.542e-3, −0.10, 0.35, −0.60 |
| $2N_f$ (Eq. 3.7) | 3,633 | 2,923 |
| $N_f$ | **1,817** | **1,461** |
| allowable (÷4) | **454 cycles** | **365 cycles** |
| requirement | 280 | 280 |
| margin on cycles | **1.62** | **1.30** |

Barrel check for (a): $\Delta T_w = 161.8$ K at 55 MW/m², comfortably below the throat and
not life-limiting. Both options meet the requirement on the LCF calculation alone. The
recommendation must therefore be made on the things the LCF calculation does not capture.

**Step 3 — the decisive arguments, which are not the strain numbers.**

1. **Manufacturability, and it is decisive.** The stated capability is LPBF with qualified
   parameter sets for **718 and GRCop-42**, forging/milling/brazing in house, **no
   electroforming** and **no DED**. Option (a) uses exactly the two qualified print
   materials. Option (b) requires forging and milling a NARloy-Z liner and then brazing a
   625 jacket — a braze operation over a large, thin, channelled copper part, whose failure
   mode is a braze void that becomes a leak at cycle 200. It also requires a NARloy-Z
   forging supply chain the company does not have. The RS-25 solved the same closeout
   problem with electroforming, which is explicitly unavailable here (§6.1).
2. **Blanching.** 280 cycles of a LOX/methane reusable engine is exactly the regime where
   NARloy-Z's blanching degrades the surface, raises the flux, and erodes the very margin
   computed above. GRCop's markedly better blanching resistance was one of the two stated
   motivations for developing it [GRCop]. The 1.62 margin for (a) is more real than the
   1.30 for (b).
3. **Creep and overaging.** NARloy-Z overages above ~750 K; GRCop's Cr₂Nb dispersoids do
   not. Over 70 firings the (b) liner's properties drift downward and the (a) liner's do
   not, which means the (b) analysis is optimistic in a way the factor of 4 was not
   intended to cover.
4. **Methane helps both equally** and is not a discriminator: it does not coke like RP-1 and
   does not embrittle like hydrogen, so the coolant side is benign for either copper.

**Step 4 — the two largest risks in the recommendation, and the test that retires each.**

| risk | why it is the top risk | retiring test |
|---|---|---|
| **Printed GRCop-42 property scatter and internal defects** — LPBF copper is the newer half of the qualified capability, and lack-of-fusion porosity or trapped powder in the coolant channels would invalidate both the allowables and the flow area | The whole life calculation rests on GRCop-42 LCF constants and on channels being the size they were drawn | Build-level: X-ray CT of the full channel network plus witness coupons from every build; material-level: strain-controlled LCF coupons cut from a representative build at 800 K, at the analysed strain range, to confirm $\varepsilon'_f$ and $c$; flow-level: cold-flow channel $\Delta p$ against prediction before first fire |
| **The GRCop-42-to-718 joint** — two prints joined, with different CTEs (17.5 vs 13.0 ×10⁻⁶/K), different heat-treat requirements and a bond that sees the N5-type mismatch stress on every chilldown plus interfacial shear at every free edge | Neither the LCF calculation nor the pressure calculation looks at the interface, which is where the failure would actually initiate | Subscale bimetallic coupons through the full thermal cycle (300 K → 110 K → 800 K) for the required cycle count, with metallographic and ultrasonic inspection of the bond line before and after; a burst test of a subscale joined section to confirm the jacket carries the pressure with the liner debonded |

**Step 5 — what would change the answer.** State any two of:

- **If electroforming or DED were available**, option (b)'s closeout risk largely
  disappears and NARloy-Z's mature, well-documented allowables become attractive for a
  first flight article — though blanching would still argue for GRCop.
- **If the required life were 30 cycles instead of 280** (an expendable engine), both
  copper options are enormous overkill and the trade reopens toward the cheapest
  manufacturable option, possibly including a film-cooled design.
- **If the throat flux estimate is wrong by +30 %** (95 → 124 MW/m²), the strain range rises
  ~30 %, and by the Eq. 3.7 sensitivity in WE1 the allowable cycles for (b) fall below the
  280 requirement while (a) is marginal. That makes the flux prediction, not the material,
  the programme's critical uncertainty — and it argues for building the calorimetric
  chamber before committing.
- **If GRCop-42 LCF coupons come back below the assumed constants**, fall back to GRCop-84
  (better strength, worse printability) and accept a lower build yield, or thin the wall to
  0.8 mm, which by Eq. 3.10 cuts the strain range 20 % and restores the margin.

### Rubric

**Must contain for a pass (60):** a numerical $\Delta T_w$ for the recommendation *and* the
runner-up; an LCF life estimate for both with the factor of 4 applied and compared against
280 cycles; elimination of (d) on conductivity grounds with a number; a clear
recommendation.

**Strong answer (80+) adds:** elimination of (c) on the overaging/temperature argument
rather than on strength; explicit use of the stated manufacturing capability (no
electroforming, no DED) as the decisive discriminator; blanching named as a life mechanism
the LCF calculation does not capture; two named risks with a specific test for each; at
least two credible answer-flipping conditions.

**Loses marks for:** choosing on room-temperature strength or on the room-temperature
$M_{ts}$ index (C7's trap); ignoring the manufacturing constraints as stated; computing the
barrel flux only and never the throat; treating the factor of 4 as covering blanching,
creep–fatigue and ratcheting when the module says it only partly does; recommending (d)
with hand-waved film cooling and no flux number; quoting the module's typical property
values as design allowables without noting that flight sizing requires [MMPDS] and
alloy-specific test data.

---

## K4. Common wrong answers and what they reveal

**"Use a stronger liner alloy so the thermal stress doesn't yield it."**
Reveals that the student is still treating the liner as a stress-controlled part. The
temperature field imposes a *strain* (Eq. 3.10); strength changes the stress at which that
strain is delivered and does not change the strain. The tell is a student who computes
Eq. 3.2, gets 300+ MPa, and then goes looking for a 400 MPa copper alloy instead of
switching to Eq. 3.7.

**"Hydrogen embrittlement is worst at cryogenic temperature."**
The single most common error in this module, and it comes from conflating "hydrogen is
cold" with "hydrogen embrittles". The mechanism is diffusion-controlled and peaks near
200–300 K. A student who gets this wrong will protect the LH₂ tank and leave the warm
turbine manifold unplated.

**"Titanium is acceptable in LOX with a large enough safety factor."**
Reveals a category error: ignition is not a stress-margin problem, it is a threshold
phenomenon established by test (ASTM G86). There is no factor of safety on "does it catch
fire". Any answer that treats an oxygen-compatibility prohibition as tradeable should lose
most of the marks for that item.

**Taking Larson–Miller at face value.**
A student who reports "718 is good to 1,071 K" from WE2's arithmetic has done the algebra
correctly and the engineering not at all. The equation cannot see a phase transformation.
The same error in a different costume is quoting a creep limit without checking oxidation
or coating limits.

**Using `thermal_stress_hoop` for the CTE-mismatch problem (WE4, N5).**
Off by exactly 2×, because Eq. 3.2's factor of 2 belongs to a linear through-thickness
gradient with an unstrained mid-plane, and a bimetallic membrane mismatch has no such
plane. Reveals a student calling library functions without reading the assumption callout —
which is the specific habit this course's equation callouts exist to break.

**Confusing "typical property" with "design allowable".**
Reveals no exposure to [MMPDS] and its statistical basis. A- and B-basis values are
lower tolerance bounds over many heats and lots, with product-form, direction and thickness
debits. A student who sizes a flight part from the module's §4 tables has produced a number
with no defensible provenance.

**Assuming a smooth-specimen allowable applies to a notched part in hydrogen (R4).**
The 2.1 "margin" was never a margin. Reveals a failure to connect the environment section
to the stress analysis — which is exactly how the real failure in R4 happens.

**Taking the cube root of the hydrogen crack-growth factor in N7.**
Reveals confusion between a factor on $C$ (which scales life linearly) and a factor on
$\Delta K$ or stress (which scales life as the $m$-th power). Worth diagnosing explicitly,
because the same confusion produces order-of-magnitude errors in every damage-tolerance
calculation the student will ever do.

**Answering "the West couldn't copy the RD-180 because the Russians had a secret alloy".**
Reveals that the student read the cycle and missed the process. The verification file is
explicit that the enabling technology is a *coating* — and coatings are process
qualifications, surface preparation, inspection criteria and repair procedures, which is
precisely the category of knowledge that does not appear on a drawing and cannot be
reverse-engineered from flight hardware.

**Quoting Raptor or Rutherford alloy details as fact.**
Reveals that the student has not internalised the course's epistemic conventions. Raptor's
alloys are unpublished; its chamber pressure is a company claim; Rutherford's chamber alloy
is reported but not in this course's verification file. The correct behaviour is to say so
and reason from the cycle instead, as §6.6 does.
