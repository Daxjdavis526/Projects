# Module 08 — Ignition systems — answer key

Reference engine **RE-100** (from §5 of the module): methalox upper stage,
$F=100$ kN vacuum, $I_{sp}=370$ s, $p_c=60$ bar, $MR=3.4$, $c^*=1800$ m/s,
$L^*=1.1$ m. Derived: $\dot m = 27.56$ kg/s, $A_t = 8.268\times10^{-3}$ m²,
$V_c = 9.095\times10^{-3}$ m³. Transient product gas: $R=377.9$ J/(kg·K),
$\gamma=1.15$, $\Delta h_c = 10.5$ MJ/kg, $T_v = 4167$ K, $\Gamma = 0.6386$,
$c^*_v = 1965$ m/s, $\tau_e = 1.372$ ms.

Every numerical answer here is reproduced by `tools/examples/08.py`.

---

## K1. Problem solutions

### Conceptual

**C1.** In normal operation the propellant enters the chamber and burns
essentially where and when it is injected, so at any instant the chamber holds
only the small gas mass that the throat is currently passing — a few grams,
resident for under a millisecond. Chamber pressure is then just
$\dot m c^*/A_t$: a *flow* balance, and the throat is sized to pass exactly that
flow at exactly that pressure. In a delayed ignition the propellant enters but
does *not* burn, and unburned liquid cannot leave through a nozzle sized for gas.
Mass therefore integrates: hundreds of grams to kilograms, thousands of times the
steady-state gas inventory. When it finally lights, all of that energy is
released into a fixed volume in a time comparable to or shorter than the
chamber's own blowdown time, so the throat cannot relieve it. The pressure is set
by a *volume* balance ($p=(\gamma-1)E/V_c$) instead of a flow balance, and those
two numbers differ by an order of magnitude or more. The grader is looking for
the words "mass accumulates because liquid does not choke" and "constant volume
versus steady flow".

**C2.** Two reasons it is a bad idea:
1. A larger $V_c$ at fixed $A_t$ means a larger $L^*$, which means a heavier
   chamber, more wetted area to cool, more residence time (usually good for
   $\eta_{c^*}$, but past the vaporization-limited point it buys nothing) and,
   critically, a *lower* natural acoustic frequency and a longer chug-relevant
   residence time — you are trading a start problem for a stability problem
   (module 07 §3.4, module 15).
2. The accumulated mass is not independent of chamber size. A bigger chamber has
   more injector face and more wall area for liquid films to form on, and the
   ignition delay itself tends to lengthen because the igniter's jet has further
   to penetrate. $m_{acc}$ grows with the chamber, partly cancelling the $V_c$ in
   the denominator.
3. (Deeper) Problem P8 shows the effect is close to self-cancelling anyway once
   venting is credited: halving $V_c$ raises $p_{CV}$ by 2× but drops $\tau_e$ by
   2×, and the two nearly offset.

It *would* help under one condition: if the extra volume is a genuine drain or
plenum that the accumulated liquid can occupy and then leave through, without
being part of the pressurised combustion volume — for example an engine started
nozzle-down with an open, unobstructed nozzle. That is a drain, not a bigger
chamber, and it should be designed as one.

**C3.**
- *Wall material.* An oxidiser lead means hot oxygen against copper alloy,
  nickel closeout, and steel, in the presence of an igniter flame. Hot
  oxygen-rich gas attacks structural metals; a fuel lead gives a reducing
  environment that every alloy tolerates. This argues for a fuel lead in both
  cases.
- *Coking.* A fuel lead in a kerolox engine wets a hot chamber wall with RP-1,
  which cracks and deposits carbon in cooling channels and injector orifices.
  Hydrogen and methane do not do this. This argues for an oxidiser lead in
  kerolox only.
- *Ignition delay.* Hydrogen has an enormous flammability range in oxygen
  (roughly 4–94 % by volume) and essentially no delay against a torch, so a
  hydrogen-rich chamber remains ignitable and accumulates little. Kerosene's
  delay against LOX is much longer, so a kerosene lead accumulates more for the
  same lead duration. This argues for a fuel lead in hydrolox and an oxidiser
  lead in kerolox.

**Decisive:** the wall-material argument for hydrolox (nothing is worth putting
liquid oxygen against a NARloy-Z liner with a torch burning), and the coking
argument for kerolox — because coking is not a start failure, it is a *cumulative
degradation* that shows up on the fifth flight, and cumulative degradation is
much harder to detect than a single bad start. A strong answer notes that the
kerolox oxidiser lead is short (fractions of a second) precisely because the
wall-material argument has not gone away, it has only been outranked.

**C4.**
1. **Hardware life.** The igniter is a small, uncooled body with a throat of a
   few millimetres. At stoichiometric methalox or hydrolox temperature (3300–3600
   K) an uncooled Inconel throat erodes in seconds and changes $A_{t,ig}$, and
   therefore $\dot m_{ig}$, mid-start. At 1200–1500 K it survives.
2. **Extended reaction zone.** A fuel-rich torch jet carries unburned fuel into
   the main chamber, where it continues to react against the main oxidiser
   supply. The effective ignition region is therefore much larger than the torch
   exit, and the flame is anchored over a volume rather than at a point.
Acceptable third answers: it keeps the torch's own combustion stable and far from
the lean flammability limit at off-nominal feed pressures; and a fuel-rich jet
avoids putting an oxygen-rich stream onto the injector face it is mounted in.

**C5.** "The igniter fired" is a measurement of the igniter's own state — its
chamber pressure, its spark current, a thermocouple in its exhaust. "The engine
ignited" is a measurement of the main chamber — chamber pressure rise rate, or
optical emission from the main combustion volume.

*Fault in which the first is true and the second false:* the igniter lights
normally, but the main oxidiser valve fails to open (stuck actuator, frozen seal,
pneumatic supply low). Igniter chamber pressure is nominal, the sequence proceeds
on that signal, the fuel main valve opens on schedule — and now the chamber is
filling with fuel with no oxidiser and a torch burning in it. Or the mirror case:
the igniter's exhaust passage is blocked by ice, so its chamber pressure reads
high *because* it is blocked, and no hot gas reaches the chamber at all.

*Instrument to add:* a flush-mounted, high-bandwidth (≥ 10 kHz) chamber pressure
transducer at the injector face with a $dp_c/dt$ threshold, backed by an optical
(OH* ~310 nm) detector viewing the main combustion volume through a sapphire
window. Two dissimilar sensors, both looking at the main chamber, required to
agree.

**C6.** The four (of six in §3.13), ranked for a LOX/methane upper stage:
1. **No drain path if the nozzle is closed.** This is the one that turns a slow
   light into a destroyed engine, because it removes the only passive mitigation.
   Most worrying.
2. **Cryogen flashing at the injector.** LOX injected against near-vacuum is far
   above its saturation pressure; the injector's $C_d$, mixture ratio and spray
   structure all shift away from design, which is a *systematic* error in exactly
   the quantity the ignition depends on. Second most worrying because it is hard
   to characterise without an altitude cell.
3. **MIE rises roughly as $p^{-2}$.** Real, but the margin between a torch's
   energy and MIE is four to five orders of magnitude, so this alone rarely
   decides it. Matters most for direct-spark igniters.
4. **No back-pressure to confine the spray.** The spray fans wider and thins the
   mixture at the igniter, and the kernel is more easily convected out. Real, and
   it interacts with (2).
Also acceptable in the list: non-uniform thermal soak, and no convective cooling
of the igniter body in vacuum.

**C7.** *Mission difference.* Falcon 9's second stage performs a small, known
number of burns — typically an ascent burn and one or two relights — and the
first stage performs a boostback and a landing burn. Those counts are known at
design time and are small, so a consumable initiator sized by tankage is a
perfectly good engineering answer. Starship's mission set is the opposite: launch,
orbital operations, propellant transfer, trans-lunar or trans-Mars injection,
entry, landing, ascent from another body, and eventually return. The number of
starts is not known at design time, is large, and is expected to grow. A
consumable puts a hard ceiling on a vehicle whose selling point is that it has no
ceiling. Add rapid reuse: a hazardous pyrophoric fluid servicing operation per
engine per flight is incompatible with aircraft-like turnaround.

*Technology change that made the second choice available:* the switch from
kerosene to **methane**. Kerosene cannot be cleanly gasified — it cracks and cokes
in a heat exchanger — so a kerolox gas-gas torch would need a separate gaseous
fuel supply, which is the same consumable problem in a different bottle. Methane
gasifies cleanly in the regenerative jacket alongside oxygen, so a gas-gas spark
torch runs on nothing but the engine's own propellants.

**C8.** Because the catalyst is the constraint. Specifically:
- The propellant must be one that decomposes exothermically over a catalyst. In
  practice that means hydrogen peroxide or hydrazine, and both are poor launch
  vehicle propellants: HTP gives 245–265 s of $I_{sp}$ (Gamma, AR2-3), decomposes
  in storage, and demands extreme cleanliness because any contaminant is a
  catalyst. You cannot catalytically ignite LOX/LH₂ or LOX/RP-1 — there is
  nothing to decompose.
- Catalyst beds have finite life. They are poisoned by contaminants, they degrade
  with thermal cycling, and cold starts are the damaging case (hence the bed
  heaters on hydrazine thrusters). "No consumable charge" is not the same as "no
  wear item".
- The bed adds pressure drop and mass in the main flow path, permanently, in
  exchange for a benefit that is only needed at start.
So catalytic ignition survives where the propellant was going to be a
decomposable monopropellant anyway — spacecraft hydrazine and green
monopropellants — and dies where propellant performance is the driver.

---

### Calculation

**P1.** $R = 8314.46/21 = 395.9$ J/(kg·K); $T_v = (\gamma-1)\Delta h_c/R =
0.2\times6.2\times10^6/395.9 = 3132$ K.

At 20 °C: $m_{acc} = 0.15\times0.004 = 6.00\times10^{-4}$ kg.
$$p_{CV} = \frac{6.00\times10^{-4}\times395.9\times3132}{1.5\times10^{-4}} = 4.96\ \mathrm{MPa} = 5.5\,p_c$$

At −15 °C: $m_{acc} = 0.15\times0.045 = 6.75\times10^{-3}$ kg.
$$p_{CV} = 55.8\ \mathrm{MPa} = 62\,p_c$$

Certification limit: $m_{acc,max} = p_{lim}V_c/(RT_v) =
3\times10^6\times1.5\times10^{-4}/(395.9\times3132) = 3.63\times10^{-4}$ kg, so
$\tau_{d,max} = 3.63\times10^{-4}/0.15 = 2.42$ ms.

The 20 °C delay of 4 ms already exceeds this on the unvented bound, so **on this
analysis the thruster does not close at any temperature** — which is the point of
the problem. The correct engineering reading is: (a) a real hypergolic start does
not deposit all propellant into a fully mixed charge, so the unvented bound is
very conservative for this case, and venting/partial mixing must be credited with
test evidence; (b) *nevertheless* the trend is what matters — a 10× longer delay
gives a 10× larger $m_{acc}$ and a 10× higher $p_{CV}$, so the cold case is 10×
worse than a case that is already marginal. A defensible certification answer is
a minimum start temperature at or above 20 °C, enforced by valve-body and
propellant heaters, with the delay measured on the actual propellant lot. Full
marks for identifying that the unvented model condemns the design and that the
right response is to instrument the real start, not to accept the cold case.

**P2.** $\dot m_{st} = 0.04\times27.56 = 1.102$ kg/s;
$m_{acc} = 1.102\times0.060 = 0.0661$ kg.

$$p_{CV} = \frac{0.0661\times377.9\times4167}{9.095\times10^{-3}} = 11.45\ \mathrm{MPa} = 1.91\,p_c$$

With $t_b = 5$ ms the venting factor is 0.267 (unchanged — it depends only on
chamber geometry and gas properties), so

$$p_{peak} = 0.267\times11.45 = 3.06\ \mathrm{MPa} = 0.51\,p_c$$

Against the $1.5p_c = 9$ MPa limit: **the vented case closes with a factor of
2.9 margin; the unvented case does not close** (11.45 > 9 MPa, exceeding by
27 %). The correct engineering statement is that the design closes only if you
are willing to defend $t_b \geq 5$ ms, and that the tank-head start has bought a
factor of 3.75 reduction in $m_{acc}$ relative to WE1's $\phi=0.15$ at the same
delay — which is why tank-head starts are attractive on cryogenic upper stages
quite apart from their turbomachinery benefits.

**P3.** $\dot m_{ig} = 0.003\times470 = 1.41$ kg/s.
$R = 8314.46/6 = 1385.7$ J/(kg·K); $\Gamma(1.26) = 0.6579$;

$$c^*_{ig} = \frac{\sqrt{1385.7\times1200}}{0.6579} = 1954\ \mathrm{m/s}$$

$p_{ig} = 1.2\times206 = 247.2$ bar $= 2.472\times10^7$ Pa.

$$A_{t,ig} = \frac{1.41\times1954}{2.472\times10^7} = 1.115\times10^{-4}\ \mathrm{m^2}
\quad\Rightarrow\quad d_{t,ig} = 11.9\ \mathrm{mm}$$

$I_{sp}$ penalty if the igniter runs continuously and contributes no thrust: the
flow fraction is 0.3 %, so the loss is **0.3 % of $I_{sp}$** — about 1.4 s on a
452 s engine. Over 480 s the igniter passes $1.41\times480 = 677$ kg of
propellant. Marking note: a strong answer observes that this is *not* how a real
ASI is accounted, because the igniter flow enters the main chamber and burns
there, contributing most of its momentum; the 0.3 % figure is the pessimistic
bound in which the flow is dumped. A student who spots this gets full marks even
with a different number.

**P4.** Required starts: $1 + 3 + 1 = 5$; with 30 % margin, $6.5 \rightarrow 7$
starts (round up — you cannot carry two-thirds of a cartridge).

Fluid required: $7\times1.8 = 12.6$ kg. Fluid carried: 12 kg, which is
$12/1.8 = 6.67 \rightarrow$ **6 usable starts**. **The stage does not close** — it
is one start short, and the shortfall is entirely inside the margin, which is
exactly where a programme is most tempted to argue it away.

Torch alternative: $0.28\ \mathrm{kg/s}\times0.4\ \mathrm{s} = 0.112$ kg per
start, so 12 kg would nominally buy $12/0.112 = 107$ starts. But the honest
answer is stronger than that arithmetic: **the torch's propellant comes from the
main tanks**, so it is not a separate 12 kg budget at all — deleting the slug
system returns most of that 12 kg (plus the 6 kg of tankage and cartridges) to
the vehicle, and the restart count stops being propellant-limited entirely. The
new limits become igniter hardware life (spark plug cycles, exciter cycles),
chilldown propellant, and settling propellant. Full marks require making this
observation; the 107 number alone is a partial answer.

**P5.** Oxidiser side: $Q_{ox} = 140\times320\times(270-100) = 7.62$ MJ;
$m_{ch,ox} = 7.62\times10^6/(0.5\times290\times10^3) = 52.5$ kg.

Fuel side: $Q_f = 60\times180\times(270-25) = 2.65$ MJ;
$m_{ch,f} = 2.65\times10^6/(0.5\times620\times10^3) = 8.5$ kg.

Total per chilldown: **61.1 kg**, which is $61.1/3800 = $ **1.6 % of the usable
propellant load**.

$\Delta v$ cost at $I_{sp}=450$ s, $m_f = 6000$ kg:
$\Delta v_{full} = 450\times9.80665\ln(9800/6000) = 2165.1$ m/s;
$\Delta v_{reduced} = 450\times9.80665\ln(9738.9/6000) = 2137.5$ m/s.
**Loss = 27.6 m/s per restart.**

Note the asymmetry worth commenting on: the oxidiser side dominates (52.5 of
61.1 kg) despite the fuel having to be chilled through a far larger temperature
range, because LOX's latent heat is small and the oxidiser hardware is heavier.
This is general — on hydrolox stages the LOX-side chilldown usually dominates the
mass even though the LH₂-side temperature swing is bigger.

**P6.** Chain the scalings from 0.28 mJ (air, 1 bar, 300 K):
- pressure $1\to0.5$ bar at $p^{-2}$: $\times4$
- air $\to$ oxygen: $\times 1/50$
- temperature $300\to200$ K with $d_q\propto T^{0.7}$ and MIE $\propto d_q^3$:
  $\times(200/300)^{2.1} = 0.4267$

$$\mathrm{MIE} = 0.28\times4\times\frac{1}{50}\times0.4267 = 9.6\times10^{-3}\ \mathrm{mJ} = 9.6\ \mu\mathrm{J}$$

Which scalings to trust: the **air-to-oxygen factor** is the most robust in
direction (it is certainly one to two orders of magnitude) and the least reliable
in value — 50 is a representative number, not a measured one for this mixture.
The **$p^{-2}$ scaling** is a decent empirical fit over modest pressure ranges
and is defensible here. The **temperature scaling through $d_q$** is the weakest
link: at 200 K methane is near its condensation regime at these pressures, the
mixture may be two-phase, and a correlation fitted at room temperature has no
business being extrapolated 100 K down. Insist on measuring the temperature
dependence, and note that the whole exercise is academic for a torch igniter
because 10–100 mJ is four orders of magnitude above any of these answers — the
calculation matters only for a direct-spark design.

**P7.**

| event | commanded | dead time | stroke | actual start of motion | actual 20 % area | actual full open |
|---|---|---|---|---|---|---|
| Ox main valve | 0.120 s | 35 ms | 90 ms | 0.155 s | 0.173 s | 0.245 s |
| Fuel main valve | 0.200 s | 15 ms | 40 ms | 0.215 s | 0.223 s | 0.255 s |

(Linear stroke assumed, so 20 % area is reached at 20 % of stroke time.)

- Commanded lead, command-to-command: **80 ms**.
- Actual lead at start of motion: $0.215 - 0.155 = $ **60 ms**.
- Actual lead at 20 % flow area: $0.223 - 0.173 = $ **50 ms**.
- Actual lead at full open: $0.255 - 0.245 = $ **10 ms**.

**No — the engine does not experience the commanded 80 ms lead.** The dissimilar
actuator dynamics eat 20 ms of it immediately (because the ox valve is the slow
one and it is the one that leads), and the faster fuel valve then closes the gap
further as both open, so by full flow the lead has collapsed to 10 ms. The design
lesson: **a lead must be specified at a stated flow condition, not as a
command-to-command interval**, and the sequence must be verified with the real
actuators in a cold-flow test [SP-8090][SP-8097]. If the intent was an 80 ms lead
at 20 % flow, the ox valve must be commanded roughly 110 ms before the fuel
valve.

**P8.** With $L^* = 0.7$ m: $V_c = 0.7\times8.268\times10^{-3} =
5.788\times10^{-3}$ m³.

$$\tau_e = \frac{5.788\times10^{-3}}{0.4079\times1965\times8.268\times10^{-3}} = 0.873\ \mathrm{ms}$$

Venting factor at $t_b = 5$ ms: $(0.873/5)(1-e^{-5/0.873}) = 0.1741$
(against 0.2673 for the long chamber).

For $m_{acc} = 0.2$ kg:

| | $L^*=1.1$ m | $L^*=0.7$ m |
|---|---|---|
| $V_c$ | 9.095 L | 5.788 L |
| $p_{CV}$ | 34.6 MPa | 54.4 MPa |
| $\tau_e$ | 1.372 ms | 0.873 ms |
| factor at $t_b=5$ ms | 0.2673 | 0.1741 |
| $p_{peak}$ | **9.26 MPa** | **9.48 MPa** |

**The shorter chamber is 2.4 % worse — essentially neutral.** This is the
interesting result. Shrinking $V_c$ raises the constant-volume pressure in
proportion, but it shortens $\tau_e$ in the same proportion, and in the
vent-dominated regime ($t_b \gg \tau_e$) the two cancel exactly:
$p_{peak}\to p_{CV}\tau_e/t_b = m_{acc}c^*/(A_t t_b)$, which contains no $V_c$ at
all. Chamber volume is therefore **not** a hard-start design variable in that
regime; the variables that are, are $m_{acc}$ (hence $\phi$ and $\tau_d$) and
$A_t$. A student who says "bigger chamber is safer" without checking the regime
has missed the physics; this problem exists to kill that intuition, and it is the
quantitative version of C2.

---

### Engineering reasoning

**R1.** *What happened:* Trace B is a **hard start** — a 430 bar spike, 4 ms
wide, at 7.2× mainstage pressure, with a width comparable to a few $\tau_e$. The
engine survived because the impulse was small: the spike's duration is
milliseconds against a chamber whose thermal and structural response times are
longer, and thin-walled regen chambers can survive short excursions above their
static proof pressure. Working backwards with Eq. 3.2, a 430 bar peak with a
plausible venting factor implies an accumulation of order 0.1–0.2 kg for a
chamber of this size, i.e. an ignition delay of a few tens of milliseconds beyond
nominal. The 0.31 s timing suggests the light came *after* the main valves were
already substantially open.

*What to check next, in order:*
1. Igniter chamber pressure and spark current traces on both tests — did the
   igniter light on time on B?
2. Main valve position (LVDT) traces — was the ox/fuel sequence the same on both?
   A single sticky actuator explains everything.
3. High-rate data at full bandwidth, not decimated. A 4 ms spike at 20 kHz is
   80 samples; check for a faster precursor that was aliased.
4. Chamber proof-pressure history and the transducer's own dynamic calibration —
   a recessed transducer on a tube will *ring*, and a "430 bar spike" can be a
   transducer artefact. This must be eliminated before anything else is
   concluded.
5. Borescope the injector face, the igniter cavity, and the throat. Look for
   bulging, weld distortion, and film-cooling orifice deformation. Proof-pressure
   test the chamber.
6. Strain gauges / dimensional inspection of the chamber and the injector-to-dome
   bolt joint.

*Would I fly it?* **No, not on this evidence.** Two reasons. First, "no visible
damage" is not "no damage": a chamber that has seen 7× design pressure has
consumed an unknown fraction of its low-cycle fatigue life, and the correct
response is a dimensional and proof-pressure requalification, not a visual
inspection. Second and more important, the *cause* is unknown. A hard start that
you cannot explain will happen again, and the next one may be 8 ms wide instead
of 4. Flight clearance requires a root cause and a demonstrated fix, then a
requalification test series showing the spike is gone. The counter-argument —
that one benign spike in a development programme is normal and the engine
completed the test — is real, and it is how programmes talk themselves into
flying unresolved anomalies. It loses because the failure mode is catastrophic
and the observable is intermittent.

**R2.** *Candidate explanations, each with its confirming measurement:*

1. **The igniter fires but its flame does not survive at low back-pressure.** In
   vacuum the torch jet expands rapidly, its density and residence time collapse,
   and the flame front is not sustained downstream of the igniter exit even
   though the igniter's own chamber pressure is nominal (it is choked and does
   not know what is downstream). *Confirm:* an optical detector viewing the main
   chamber, or a thermocouple in the igniter *exhaust plume* rather than in its
   chamber. Also: repeat the igniter-only test in the altitude cell with the main
   engine dry.
2. **Main propellant flashing changes the injector's delivered mixture ratio at
   the igniter.** LOX injected against near-vacuum flashes; the injector's $C_d$
   drops and the local mixture at the torch goes outside its flammability limits.
   *Confirm:* measure injector $\Delta p$ and both circuit flows during the
   start; reconstruct the delivered $MR$ over the first 200 ms and compare
   sea-level with altitude. Look for a $C_d$ change on the oxidiser circuit.
3. **The spray fans wider without back-pressure, so the flammable region has
   moved away from the torch.** Geometric, not chemical. *Confirm:* cold-flow the
   injector in a vacuum chamber and image the spray cone angle; compare with the
   sea-level cone. Or move the torch/change its aim and see whether the failure
   rate changes.

Also acceptable: cell back-pressure recovery (the diffuser starts and the cell
pressure rises during the start, so the "altitude" condition is not what you
think), and igniter body overheating in the absence of convection.

The general point the grader wants: **igniter chamber pressure being nominal
proves the igniter is flowing and choked, and proves nothing about whether a
flame exists in the main chamber.** Every candidate above is consistent with a
nominal igniter pressure.

**R3.** *The proposal:* delete the main-chamber igniter, light the main chamber
from the gas-generator exhaust.

*Why it does not transfer.* In a staged-combustion engine the preburner exhaust
is the **entire** propellant flow (full-flow) or the entire fuel flow plus part of
the oxidiser (fuel-rich SC), it enters the main injector as the main injector's
own feed, and it is hot fuel-rich gas at high pressure arriving *through* the
injector elements. Lighting the main chamber from it is not "ignition by a nearby
flame", it is "the propellant arrives already burning". In a **gas-generator
cycle** the GG exhaust does none of that: it is a small fraction of total flow
(typically 2–5 %), it exits through a **separate** duct to a nozzle exhaust
manifold or overboard, and it never passes through the main injector at all. It
is not upstream of the main chamber in any useful sense.

*Verdict: reject as stated.* The physical mechanism the proposal borrows does not
exist in this cycle.

*What could be salvaged.* If the programme is willing to re-plumb, a small tapped
flow of GG exhaust routed into the main injector face as a hot-gas torch is a
legitimate architecture — it is a torch igniter whose gas generator happens to be
the engine's own. But then: the GG needs its own igniter (so nothing has been
deleted, only moved); the tap duct is a hot-gas line with valves and thermal
growth; the GG must be lit and stable *before* the main chamber, which lengthens
and complicates the sequence; and GG exhaust is soot-laden on kerolox, less so on
methalox. On a methalox GG-cycle engine this is worth a trade study. On kerolox
it is not.

*One more caution:* Raptor's claimed architecture is a company statement, not a
published design. Building a programme decision on an unverified competitor claim
is bad engineering regardless of whether the claim is true.

**R4.** In order of how likely each is to bind:

1. **Igniter fluid quantity.** How many slugs are carried, versus how many the
   revised profile needs, with margin? This is almost always the binding
   constraint and is checkable in a day. If the cartridge count is fixed hardware
   (a fixed number of burst-diaphragm cartridges rather than a tank), the answer
   may be an immediate no.
2. **Propellant budget.** The disposal burn needs propellant, and so does the
   settling and chilldown *before* it. On a cryogenic stage the pre-burn overhead
   (P5: 61 kg, 27.6 m/s) can exceed the disposal burn's own requirement.
3. **Pressurant budget.** Each restart needs tank repressurisation; helium is
   frequently the true limiting consumable on multi-burn stages and is easy to
   forget.
4. **Battery and thermal budget.** Avionics, valve actuation and heaters over an
   extended mission. A disposal burn hours after the last nominal burn may be
   outside the battery profile.
5. **Engine thermal state.** Is the coast duration and the resulting soak
   temperature inside the qualified restart envelope? If the disposal burn comes
   after a much longer coast than anything qualified, this becomes a
   qualification issue, not a budget issue.
6. **Valve and seal cycle life.** Main valve cycles, igniter cartridge mechanism
   cycles, spark exciter cycles — all qualified to a number.
7. **Software and sequence.** Last, because it is the only item on this list that
   is cheap to change. Note that this is the item integrators usually ask about
   first, which is the wrong order.

**R5.** The argument against accepting "lit late on 3 of 20, no damage":

*Quantitative.* Take RE-100 at $\phi=0.15$, $\dot m_{st}=4.13$ kg/s. A nominal
light produces some small $m_{acc}$; a 70 ms late light adds
$4.13\times0.070 = 0.289$ kg of extra accumulation on top of it. From WE1's
$p_{CV}$ coefficient ($1.733\times10^8$ Pa/kg) that additional charge alone
carries $p_{CV} = 50.1$ MPa, and even with the 5 ms venting factor of 0.267 it is
$13.4$ MPa $= 2.2\,p_c$ — already past the $1.5p_c$ structural limit, from the
*increment* alone. The design closed at $\tau_{d,max}\approx 13$–47 ms depending
on venting credit; 40–70 ms is at or beyond the top of that band on every
assumption.

*Statistical.* Three events in twenty is a 15 % point estimate with a 95 %
upper confidence bound around 35 %. That is not scatter; that is a bimodal
population. Something is different on those starts, and "we don't know what" is
the actual finding. Worse, the design case is not the mean or even the observed
maximum — it is the tail. If 70 ms occurs at 15 %, the sample gives no
information about whether 150 ms occurs at 1 %, and Eq. 3.1's linearity means 150
ms is 2.1× the damage of 70 ms.

*Physical.* "No damage" on a 20-sample set is weak evidence. The failure is
threshold-like: below the structural limit nothing visible happens and low-cycle
fatigue accumulates invisibly; above it, the chamber fails. A programme that has
seen no damage in 20 starts has learned that it has not yet crossed the
threshold, not that the threshold is far away.

*The counter-argument, honestly stated:* development engines light late; the
population may be dominated by a known test-stand effect (a cold igniter feed
line, a stand purge that over-cools the cavity) that will not exist in flight;
and requiring a root cause for every 40 ms of scatter is how programmes never
fly. This loses on the numbers above — the observed late lights are not inside
the delay budget, they are outside it — and on the asymmetry of consequences.

*What I would require before flight:* root cause on the late lights; a
demonstrated fix; a measured distribution of time-to-light over a sample large
enough to bound the 99.9th percentile (order 100 starts, or a physics-based
argument for the tail); and an abort interlock that closes the main valves if
ignition is not confirmed within the budget, so that a late light becomes an abort
rather than a hard start.

---

## K2. Quiz answers with explanations

**Q1 (8).** $t_b \ll \tau_e$ means the accumulated charge burns much faster than
the chamber can vent through its own throat — the throat is effectively closed
for the duration of the event. The equation reduces to $p_{peak} \to p_{CV} =
(\gamma-1)m_{acc}\Delta h_c/V_c = m_{acc}RT_v/V_c$, the constant-volume explosion
pressure. Marks: 4 for the physical statement, 4 for the limit.

**Q2 (8).** **(b).** The delay budget comes from inverting the accumulation
argument: $\tau_{d,max}=p_{lim}V_c/(\phi\dot m R T_v)$ — a structural limit
divided by an accumulation rate. (a) is wrong because MIE is four to five orders
of magnitude below what any real igniter delivers and never binds; (c) and (d)
are igniter *design* parameters that affect what delay you achieve, not what
delay you can tolerate.

**Q3 (10).** $\dot m_{st} = 0.12\times40 = 4.80$ kg/s;
$m_{acc} = 4.80\times0.080 = 0.384$ kg.
$$p_{CV} = \frac{0.384\times380\times4000}{0.022} = 2.65\times10^{7}\ \mathrm{Pa} = 26.5\ \mathrm{MPa}\ (265\ \mathrm{bar})$$
Marks: 3 for $\dot m_{st}$, 3 for $m_{acc}$, 4 for $p_{CV}$ with correct units.
Deduct nothing for not converting to bar; deduct everything for using litres as
m³.

**Q4 (10).** $\dot m_{ig} = 0.005\times300 = 1.50$ kg/s.
$\Gamma(1.28) = 0.6636$; $c^*_{ig} = \sqrt{500\times1300}/0.6636 = 1215$ m/s.
$p_{ig} = 1.25\times110 = 137.5$ bar.
$A_{t,ig} = 1.50\times1215/1.375\times10^7 = 1.325\times10^{-4}$ m²;
$d_{t,ig} = \sqrt{4A/\pi} = $ **13.0 mm**.

**Q5 (10), 2.5 each.**
(a) **False.** Above a few times MIE, additional spark energy buys very little.
What matters for a flowing two-phase spray is kernel size relative to the
quenching distance, kernel placement in a locally flammable pocket, and
repetition rate — which is why augmented spark exists.
(b) **True.** The green is emission from BO₂ radicals (bands near 518 and 546 nm)
produced by burning the triethylborane component of TEA-TEB. Credit is also due
for noting the aluminium contributes white Al₂O₃ incandescence.
(c) **False, and dangerously so.** An oxidiser lead in a LOX/LH₂ engine puts hot
oxygen against a copper-alloy liner and nickel closeout with an igniter burning
nearby. Hydrolox engines universally use a fuel lead.
(d) **False.** The RL10 is a closed expander with a spark torch igniter and a
tank-head start; it has no start cartridge to consume and was designed from the
outset for multiple restarts.

**Q6 (12).** *Diagnosis:* the igniter lit and was **blown out by the main
oxidiser flow** — igniter chamber pressure collapses 10 ms after the ox valve
opens, and the main chamber then never lights (4 bar is a flow-through
pressurisation, not combustion). This is an igniter blowout, not a failure to
light and not a hard start; note that the sequence *did* correctly abort on the
absent chamber pressure rise, which is the system working.

*Two design changes (any two of):*
- Raise $f_{ig}$ and/or $p_{ig}$ so the torch jet has more momentum flux than the
  arriving main flow can strip. Eq. 3.6/3.7.
- Recess the igniter, or move it to a lower-velocity region of the injector face,
  so the kernel is sheltered during valve motion.
- Slow the oxidiser valve's opening rate, or delay it, so the torch's flame is
  fully established and has propagated before the main flow arrives.
- Reorient the torch jet to be co-flowing with rather than transverse to the main
  spray.
Marks: 6 for the diagnosis, 3 each for two defensible changes. No marks for "use
a bigger spark" — the spark is not the problem.

**Q7 (12).** A fuel lead on a hydrolox engine means unburned hydrogen flows
through the chamber, out of the nozzle, and into the boat-tail/flame trench
before ignition. Hydrogen's flammability range in air is enormous (about 4–75 %)
and its MIE is about 0.017 mJ — essentially any spark, static discharge or hot
surface will light it — so an accumulating hydrogen cloud under the vehicle is a
deflagration (potentially a detonation, in confinement) waiting for the engine's
own ignition to set it off [G-095].

*Two mitigations used on flown vehicles:*
1. **ROFIs — radial outward firing igniters**, pyrotechnic devices fired below
   the engines before main ignition to burn the hydrogen off deliberately as a
   controlled diffusion flame rather than letting it accumulate. Used on the
   Shuttle.
2. **Base purge and vent routing** — inert gas flow through the boat-tail to keep
   the local concentration below the lower flammability limit, and ducting of
   pre-start vents away from the vehicle base.
Also creditable: deliberately accepting and designing for the bloom, which is
what the RS-68's characteristic pre-ignition fireball amounts to, with base heat
shielding sized for it.

**Q8 (10).** Per restart overhead $= 30+15 = 45$ kg; four restarts $= 180$ kg.
Five burns (one initial plus four restarts) at 700 kg $= 3500$ kg.
Total $= 3680$ kg. Overhead fraction $= 180/3680 = $ **4.9 %**.

*Architectural change:* an idle/low-thrust mode that keeps the engine chilled and
the propellant settled between burns — LE-5B's 3 % idle mode is the flown example
— eliminates most of the per-restart chilldown and the separate settling burn.
*Cost:* propellant consumed continuously through the coast (which for a 6-hour
coast may be worse than the chilldown it replaces, so it only wins for short
coasts), a qualified low-thrust operating point with its own combustion stability
and cooling margins, and additional engine cycles. Alternatives worth full marks:
a dedicated settling/pressurisation APU (Vinci), or accepting fewer, longer burns
in the mission design.

**Q9 (10).**

*For Engine X (hypergolic):* (1) No igniter at all — the largest single failure
mode in a multi-restart mission is deleted, which is exactly why the Aestus,
LR91 and Apollo SPS architectures survived so long; restart count is limited only
by propellant and valve cycles. (2) No chilldown, no cryogenic boil-off over 14
hours, no settling requirement driven by pump inlet quality, and no
thermal-soak-dependent ignition envelope — the 14-hour duration is nearly free.

*For Engine Y (methalox torch):* (1) Non-toxic propellants: no
carcinogenic/corrosive ground handling, no exclusion zones, dramatically lower
launch-site operating cost, and the propellants are cheap. (2) The torch runs on
main propellants, so restart count is unbounded by consumables, and methane is
compatible with in-space production and long-term reusable architectures.

*Pick, for a six-burn 14-hour mission with $I_{sp}$ and thrust held equal:*
**Engine X.** The problem statement removes performance from the trade, and what
remains is boil-off, chilldown, settling and ignition-system complexity over 14
hours — every one of which favours storables. The 14-hour duration is doing the
work here; at 40 minutes the answer flips to Y on ground-operations cost alone. A
full-marks answer states which assumption is load-bearing.

**Q10 (10).** They are measurements of different physical objects. "Detecting the
igniter" observes the igniter's own state and confirms only that it is flowing
and burning; a plugged igniter exhaust reads *higher* chamber pressure while
delivering nothing to the engine, and a perfect igniter firing into a chamber
with a stuck main valve reads perfectly normal. "Detecting ignition" observes the
main combustion volume.

*Instruments:* for the igniter — a pressure transducer in the igniter chamber (or
spark ionisation current, or a thermocouple in the igniter exhaust). For the
engine — a flush-mounted high-bandwidth main chamber pressure transducer with a
$dp_c/dt$ threshold, or an optical/UV chemiluminescence detector (OH* near 310
nm) viewing the main chamber through a sapphire window. Full marks require naming
one of each and stating the failure that motivates the distinction.

---

## K3. Trade-study reference solution (T1)

**Recommendation: Option C — gas-gas spark torch fed from tapped main
propellants through a jacket heat exchanger.**

### Mass comparison

| | eight starts | three starts |
|---|---|---|
| **A** pyro magazine | $8\times0.9 + 4 = $ **11.2 kg** | $3\times0.9+4 = $ 6.7 kg |
| **B** slug + tank | $8\times0.5 + 6 = $ **10.0 kg** | $3\times0.5+6 = $ 7.5 kg |
| **C** torch, tapped | $7 + 8\times0.3 = $ **9.4 kg** | $7+0.9 = $ 7.9 kg |
| **D** torch, bottles | $11 + 8\times0.25 = $ **13.0 kg** | $11+0.75 = $ 12.8 kg |

At eight starts C is lightest, but the spread among A, B and C is 1.8 kg on a
stage that is expendable — **mass does not decide this trade**, and a candidate
who stops at the mass table has missed the point. At three starts the ordering
flips to A, and D is never competitive because its bottle mass is fixed
regardless of start count. The important structural observation is the *slope*:
A, B and D have per-start mass; C's per-start mass is main propellant it was
going to carry anyway (0.3 kg per start against a 33 kg/s engine is 9 ms of
mainstage flow), so C's line is essentially flat. **The more starts the
requirement grows to, the more decisively C wins**, and requirements of this kind
grow.

### Failure-mode correlation

- **A (pyro):** independent of the main engine. A cartridge that fails to fire is
  a discrete, uncorrelated event — but the indexing mechanism is a single-point
  failure that is correlated across *all* remaining starts. One jam and you have
  zero starts left, not one fewer.
- **B (slug):** largely independent, except that slug delivery depends on fuel
  system pressure, so a fuel-side feed anomaly disables both the engine and its
  igniter. Burst diaphragms are single-use and their burst pressure is a
  qualification item.
- **C (torch, tapped):** **strongly correlated with the main engine.** The torch's
  propellant comes from the same tanks through the same jacket. A chilldown that
  goes wrong, a jacket heat-exchanger blockage, or a low tank pressure disables
  the igniter and the engine together. This is the honest cost of C, and it must
  be stated. Mitigations: a small accumulator downstream of the heat exchanger so
  the torch has an independent gas inventory for the ignition window, and
  dual-redundant spark exciters and plugs (the J-2 precedent).
- **D (torch, bottles):** independent of the main engine — this is D's whole
  argument, and it is a good one. Its own failure mode is bottle pressure decay
  over a long coast and regulator behaviour at low outlet pressure.

### Ground operations and production cost of 400 engines

- **A:** a pyrotechnic device on the vehicle. Safe-and-arm hardware, ordnance
  handling procedures, magazine storage, shelf-life tracking and lot acceptance
  testing on 3,200 cartridges. Ordnance handling drives range-safety procedure
  and pad access rules, and it makes every stage integration operation an
  ordnance operation. Expensive per unit and expensive in schedule.
- **B:** a pyrophoric, toxic fluid. Inerted servicing, dedicated GSE, a hazardous
  fluid operation on every stage, spill response, and a supply chain for a
  specialty chemical across a ten-year run. This is the most operationally
  expensive option.
- **C:** electrical and fluid interfaces only, both of which the engine already
  has. Ground checkout is a spark test and a leak check — and, decisively for a
  400-engine run, **the igniter can be functionally tested on the acceptance
  stand as many times as you like** with no consumable. That is an enormous
  quality-assurance advantage: every flight igniter can be demonstrated on its
  own engine, repeatedly, before delivery. Highest non-recurring cost (heat
  exchanger development and the ignition sequence), lowest recurring cost.
- **D:** composite overwrapped pressure vessels at 300 bar. COPVs bring their own
  qualification, cycle life, damage-tolerance inspection and safety regime, plus
  a high-pressure gas servicing operation per flight. Recurring cost is high and
  the operations burden is real.

### Sensitivity to coast duration

The 6-hour requirement is the second-order driver and it hurts D most: bottle
pressure and temperature drift over six hours, and the regulator must still
deliver at the end. It hurts C at the *first* start after a long coast, because
the jacket heat exchanger has no hot wall to work with until the engine is
running — **this is C's real technical risk and the answer must address it**. The
standard resolution is a small warm-gas accumulator charged during the previous
burn, or a modest electrical trim heater, sized only for the ignition window. It
barely affects A and B, whose energy source is chemical and cold-tolerant. If the
requirement grew to a 30-day coast, the recommendation would shift toward A or B
on exactly this argument.

### What would change my mind

Any one of:
- **Test evidence that a jacket-fed torch cannot be lit reliably after a 6-hour
  cold soak** without a heater and accumulator whose combined mass exceeds a few
  kilograms. That converts C into D with extra steps, and D's independence
  argument then wins.
- **A firm requirement reduction to three starts or fewer**, with a credible
  commitment that it will not grow. At three starts A is lighter, far simpler,
  and its development cost is near zero.
- **Demonstrated igniter hardware life below the required cycle count** — if the
  spark plug or exciter cannot do eight starts plus qualification margin plus
  acceptance testing, C's flat mass line is an illusion.
- **A vehicle-level decision to make the upper stage reusable.** That raises the
  required start count and makes any consumable untenable, strengthening C.

### Rubric

**A strong answer contains:** the mass table at both start counts *and* the
observation that mass does not decide the trade; explicit identification of C's
correlated-failure weakness and a named mitigation; the acceptance-testability
argument for C over 400 engines; the cold-soak first-start risk for C and how to
retire it; and at least one falsifiable statement of what would change the
recommendation.

**Loses marks for:** picking on mass alone; failing to notice that C's per-start
propellant comes from the main tanks and is therefore nearly free; treating
"unlimited restarts" as an unqualified benefit when the requirement is a firm
eight; ignoring the ordnance and hazardous-fluid operations burden of A and B,
which is the largest real cost in a 400-engine programme; and recommending D
without confronting its fixed 11 kg and its COPV qualification burden.

**Also defensible with full marks:** Option B, argued on the grounds that the
requirement is a firm eight starts, TEA-TEB has flown thousands of ignitions with
near-zero delay, the stage is expendable so reuse arguments do not apply, and
development cost and schedule risk are lowest for a heritage architecture. This
answer must confront the hazardous-fluid operations cost over 400 engines and
explain why it is acceptable. Option A is defensible only if the answer confronts
the indexing mechanism as a single-point failure affecting all remaining starts.

---

## K4. Common wrong answers

**"A hard start happens because the igniter is too energetic."** The most common
error, and it inverts the physics. The igniter contributes grams; the
overpressure comes from the *main* propellant that accumulated while the igniter
was failing to do its job. Students who make this error will then "fix" a hard
start by weakening the igniter, which makes it worse. It reveals that they have
not internalised Eq. 3.1 — that $m_{acc}$ is $\dot m_{st}\tau_d$, and that the
igniter's role is to make $\tau_d$ small.

**Forgetting that the throat cannot pass liquid.** Students write $p =
\dot m c^*/A_t$ during the start transient and conclude that the pressure is
fine, because that equation always gives a sensible answer. It is a *steady, all
gas* relation. During accumulation there is no gas to choke and no combustion to
make any, and the flow balance is simply not the governing equation. This reveals
an equation memorised without its derivation.

**Using $L^*$ or $V_c$ as the hard-start design variable.** Problem P8 exists to
kill this. In the vent-dominated regime $p_{peak}=m_{acc}c^*/(A_t t_b)$ contains
no $V_c$ at all. Students who "solve" hard starts by enlarging the chamber have
found the $V_c$ in Eq. 3.2 and stopped reading.

**Confusing the igniter's flow fraction with its power fraction.** These are
nearly equal only if the igniter runs at the same mixture ratio as the main
chamber, which it deliberately does not. A torch at $MR=0.5$ against a main
chamber at $MR=3.4$ releases far less energy per kilogram. Students who compute
igniter power as $f_{ig}\times$ main power are out by a factor of two or more.

**Quoting MIE as the igniter sizing criterion.** MIE is a laboratory measurement
on a quiescent premixed gas. A rocket chamber during start is a flowing two-phase
spray of unknown local composition. The four-to-five order of magnitude margin
between MIE and a real exciter is not waste, it is the price of those three
differences. A student who says "the igniter only needs 0.3 mJ" has confused a
necessary condition with a sufficient one.

**Treating a commanded valve schedule as the achieved lead.** Problem P7. The
lead you write in the sequence document and the lead the propellant experiences
differ by the actuator dynamics, and they differ *differently* at each flow
fraction. Students report the commanded 80 ms and never notice that it has
collapsed to 10 ms at full open.

**Assuming restart is free once the engine can restart.** Chilldown and settling
are 4–8 % of a burn's propellant *per restart* and produce no impulse. Students
size multi-burn missions on ideal $\Delta v$ and then cannot explain why real
upper stages carry the residuals they do.

**Attributing flight failures to ignition on press evidence.** Several
well-known launch failures are popularly described as ignition failures and were
not. A student who cites one confidently, without checking what the investigation
concluded, has demonstrated the habit this course is most concerned to prevent.
The correct form is "reported as X; the investigation attributed it to Y" or "not
established in the public record".

**Believing that hypergolic means no ignition system.** It means no *igniter*.
The ignition delay is still real, still temperature-dependent, and still capable
of producing an accumulation. Heaters, minimum start temperatures and cold-start
qualification are an ignition system by another name, and students who skip them
will size a spacecraft thruster that hard-starts on the cold side of an eclipse.

**Reporting $p_{CV}$ in the wrong units by three orders of magnitude.** Using
litres where the formula wants m³, or bar where it wants Pa. The check is
trivial and should be automatic: if a start transient produces a peak below
mainstage pressure, or above 10 GPa, the arithmetic is wrong.
