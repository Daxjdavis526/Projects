# Module 05 — Universal Cryogenic Hazards

*Roughly 20 minutes. Prerequisite: Module 04.*

Oxygen makes other things burn, methane and hydrogen burn themselves, and helium
finds joints nothing else finds. This module is about the hazards that do not care
which fluid you chose — the ones that follow from cold and expansion ratio alone,
and are as present in the nitrogen line as in the LOX line. The worst of them,
liquid trapped between two closed valves, is not an operator error at all. It is a
drawing error, committed months earlier by someone who never touched a valve.

## What you'll be able to do

- Explain why a brief splash on bare skin often does nothing while the same splash
  inside a glove causes a deep injury — and derive the PPE conventions from that.
- Estimate the pressure a trapped cryogen demands, state every assumption, and
  explain why the real number does not matter.
- Look at a schematic fragment and name every volume that can trap liquid.
- Say what an ODH analysis computes, what it needs as input, and who does it.
- Apply one design rule: every isolatable volume that can hold cryogen gets a
  relief path that cannot itself be isolated.

---

## 1. Cold injury

Cold reaches skin by three routes, and they are not equally dangerous
`[LBNL-PUB3000-29]`. **Liquid splash** is often the mildest: liquid landing on a
surface far above its own boiling point hovers on a self-generated vapour film —
the Leidenfrost effect — which insulates, so a small splash on bare skin "tends to
skate off on a cushion of expanding gas." **Cold vapour** does burn; boil-off
leaving a vent or relief path is barely warmer than the liquid, and university
manuals name cold vapour from a relief valve as a specific injury source
`[UNIV-EHS-OTHER]`. **Cold metal** has no Leidenfrost protection at all — piping,
valves and fittings that have held cryogen "can and will cause severe burns on
contact with skin," and LBNL's response guidance contemplates skin torn from
freezing to a cold surface. A bare cold fitting is more dangerous than the liquid
inside it.

What separates a nuisance from a disfiguring injury is not the cryogen. It is
whether the liquid can leave. Leidenfrost protection depends entirely on free
run-off, and anywhere liquid collects — a cupped hand, a shirt pocket, a rolled
cuff — destroys it. Absorbent material destroys it outright: LBNL records learning
"the hard way" that cloth absorbs liquid nitrogen and holds it against skin.

That is where the PPE conventions come from. Berkeley Lab recommends cryo gloves
with **wide, loose wrist openings**, oversized for the hand, and labels
elastic-cuff gloves "Not Recommended" — a glove that has taken liquid must come
off with a flick of the arm. The same logic puts trousers over boots and sleeves
outside gloves: every tucked interface is a cup. Watches and rings come off
because they chill and hold the cold against skin. Understand also what PPE is
not: LBNL states cryo gloves give "minimal protection" against a flow, a
submersion or prolonged contact with a cooled object, and that a wetted glove
loses its insulation entirely. It is the last line, and a weak one.

The eye is the highest-consequence target — no reflex is fast enough, and LBNL
treats contact with liquid *or cold vapour* as an immediate emergency that can
cause permanent loss of vision. That is the argument for a face shield rather than
glasses wherever there is a splash path or a vent path.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
The injury hides itself. Below about 7 °C tissue goes numb, so there may be no
pain at the time; LBNL reports burns the injured person did not recognise, and
says it can be "nearly impossible to distinguish between a cold sensation that is
harmless and a cold sensation that is associated with a burn" `[LBNL-PUB3000-29]`.
The tissue looks pale, yellowish and waxy rather than red. Pain arrives on
rewarming, by which time the damage is done.
</div>

First aid is out of scope here. What belongs in a design review is that the
facility **has** a written cryogenic first-response protocol tied to its own
emergency numbers and occupational-medicine route — written with medical input,
not copied from a course.

---

## 2. Trapped-liquid expansion

This is the centrepiece. It is the mechanism that turns a correctly specified,
leak-free, well-built system into a fragmentation hazard with no operator error at
the moment of failure and no energy input beyond room-temperature heat leak.

### 2.1 The physics

A cryogen sealed into a closed volume warms. If the volume is **not** liquid-full,
the liquid boils, pressure climbs along the saturation curve, and past the
critical temperature the contents are simply a dense fluid whose pressure is set
by density and temperature.

If the segment is **liquid-full**, the rise is *hydraulic* and far more violent
per degree, because a liquid must either expand or push. For a fixed volume the
exact relation is

> dP/dT |_V = β / κ_T

with β the isobaric thermal expansivity and κ_T the isothermal compressibility.
Cryogens near their boiling point have large β and modest κ_T, so the ratio is
large: the rise starts immediately, before any boiling, and it is steep. No free
tabulation of β/κ_T for the common cryogens could be verified for this course, so
take the steepness, not a psi-per-kelvin number.

### 2.2 The idealised estimate — and why it is only an estimate

Berkeley Lab publishes the endpoint directly `[LBNL-PUB3000-29]`:

| Cryogen | NBP | Expansion ratio | Pressure from trapped liquid warmed to room temperature |
|---|---|---|---|
| LO₂ | 90.2 K | 860 : 1 | **12,600 psig** |
| LAr | 87.3 K | 847 : 1 | **12,300 psig** |
| LN₂ | 77.4 K | 696 : 1 | **10,200 psig** |
| LH₂ | 20.3 K | 851 : 1 | **12,400 psig** |
| LHe | 4.2 K | 757 : 1 | **11,000 psig** |

Those come from one line of arithmetic, worth doing because it turns a memorised
number into an understood one. **State every assumption:** a rigid, perfectly
strong, perfectly sealed volume *V*; initially **100 % liquid-full** at its normal
boiling point and 1 atm; all of it ending as gas at room temperature (~294 K — the
70 °F basis these ratios are quoted on, see `reference/properties.md` §4) in that
same *V*; **ideal-gas** behaviour; no leakage and no container expansion. The
final pressure is then just the expansion ratio times one atmosphere:

> LN₂: *P* ≈ 696 × 1 atm ≈ **10,200 psi ≈ 70 MPa**

Now label it as an idealisation in the same breath, the way LBNL does. At that
density (~800 kg/m³ of nitrogen at 294 K) the fluid is a **dense supercritical
fluid, not an ideal gas**; its compressibility factor exceeds 1, so the true
pressure is *higher* — the idealisation does not err in the safe direction. **Real
hardware never gets there**: tube, fittings, hose and valve bodies fail one to two
orders of magnitude below these pressures. The number's job is not to predict a
pressure but to show that the demand is unbounded relative to any containment you
could specify. And the table is an **endpoint, not a threshold** — a segment that
warms only partway still reaches destructive pressure.

<div class="box remember"><span class="lbl">Remember this</span>
There is no "strong enough pipe" answer to a trapped cryogen. There is only a
relief path. LBNL's plain version: cryogenic liquid confined and allowed to warm
to room temperature "will generate pressure in excess of 10,000 psig"
`[LBNL-PUB3000-29]`.
</div>

### 2.3 Where liquid gets trapped

Nine places, and every one appears on real drawings.

1. **Between two closed valves.** The canonical case; LBNL's own example
   `[LBNL-PUB3000-29]`.
2. **Inside a valve body cavity.** A closed floating ball valve seals liquid
   between ball, seats and body, connected to neither line. Outcomes run from seat
   distortion to destruction of the body.
3. **A dead leg or instrument sense line.** A capped stub, a gauge line, a DP
   transmitter leg: it fills, has one connection, and warms from the closed end in.
4. **Downstream of a check valve** — a closed valve no operator can open. Jefferson
   Lab separately lists check-valve leakage among the principal causes of system
   overpressure `[JLAB-OVERPRESSURE]`.
5. **A hose disconnected at one end**, the free end capped or self-sealing: a
   filled pressure vessel with no rating and no relief.
6. **A jacket or annulus.** A crack in the inner vessel admits cryogen to the
   vacuum space. LBNL requires relief there; SLAC extends it to "any volume cooled
   externally by a cryogen or any vacuum space in contact with a cryogen"
   `[SLAC-CH36]`.
7. **A pump casing** — a valve cavity with a bigger volume and its own isolation.
8. **Under a relief that a block valve has isolated.** The relief exists, is
   correctly sized, and is disconnected from what it protects.
9. **A line sealed by a plug of solid air or ice.** The blockage *is* the closed
   valve, and it forms with nobody touching anything.

<figure>
<svg viewBox="0 0 680 210" role="img" aria-label="Schematic fragment of a liquid nitrogen transfer line from a supply dewar to a run tank, showing manual valves, a check valve, a pump, a relief valve on an isolatable riser, an instrument sense line, and a flexible hose with a quick disconnect.">
  <rect x="18" y="70" width="64" height="100" rx="6" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <rect x="24" y="76" width="52" height="88" rx="4" fill="none" stroke="var(--inert)" stroke-width="1.5"/>
  <line x1="50" y1="58" x2="50" y2="74" stroke="var(--muted)" stroke-width="1"/>
  <text x="50" y="52" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="var(--muted)">annulus</text>
  <text x="50" y="190" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">V-1 supply dewar</text>

  <line x1="82" y1="120" x2="575" y2="120" stroke="var(--inert)" stroke-width="3"/>

  <path d="M 119 111 L 119 129 L 130 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 141 111 L 141 129 L 130 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <line x1="130" y1="120" x2="130" y2="102" stroke="currentColor" stroke-width="1.6"/>
  <line x1="122" y1="102" x2="138" y2="102" stroke="currentColor" stroke-width="1.6"/>
  <text x="130" y="150" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">HV-1</text>

  <line x1="180" y1="120" x2="180" y2="74" stroke="var(--inert)" stroke-width="2"/>
  <circle cx="180" cy="56" r="18" fill="var(--side)" stroke="currentColor" stroke-width="1.6"/>
  <text x="180" y="61" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">PT-1</text>

  <path d="M 217 111 L 217 129 L 228 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 239 111 L 239 129 L 228 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <line x1="228" y1="120" x2="228" y2="102" stroke="currentColor" stroke-width="1.6"/>
  <line x1="220" y1="102" x2="236" y2="102" stroke="currentColor" stroke-width="1.6"/>
  <text x="228" y="150" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">HV-2</text>

  <path d="M 269 111 L 269 129 L 280 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 291 111 L 291 129 L 280 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 296 114 L 308 120 L 296 126 Z" fill="currentColor" stroke="none"/>
  <text x="284" y="150" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">CV-1</text>

  <line x1="330" y1="120" x2="330" y2="107" stroke="var(--inert)" stroke-width="2"/>
  <path d="M 321 89 L 339 89 L 330 98 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 321 107 L 339 107 L 330 98 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <line x1="330" y1="98" x2="348" y2="98" stroke="currentColor" stroke-width="1.6"/>
  <line x1="348" y1="90" x2="348" y2="106" stroke="currentColor" stroke-width="1.6"/>
  <text x="354" y="103" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">BV-2</text>
  <line x1="330" y1="89" x2="330" y2="74" stroke="var(--inert)" stroke-width="2"/>
  <path d="M 321 74 L 339 74 L 330 62 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 342 53 L 342 71 L 330 62 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <polyline points="330,62 324,56 336,52 324,48 336,44 330,40" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="342" y1="62" x2="468" y2="62" stroke="var(--inert)" stroke-width="2"/>
  <path d="M 468 57 L 481 62 L 468 67 Z" fill="var(--inert)" stroke="none"/>
  <text x="352" y="36" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">PSV-1 · set 150 psig</text>
  <text x="410" y="82" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="var(--muted)">to vent stack, safe location</text>

  <path d="M 371 111 L 371 129 L 382 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 393 111 L 393 129 L 382 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <line x1="382" y1="120" x2="382" y2="102" stroke="currentColor" stroke-width="1.6"/>
  <line x1="374" y1="102" x2="390" y2="102" stroke="currentColor" stroke-width="1.6"/>
  <text x="382" y="150" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">HV-3</text>

  <circle cx="430" cy="120" r="18" fill="var(--side)" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 423 111 L 441 120 L 423 129 Z" fill="currentColor" stroke="none"/>
  <text x="430" y="150" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">P-1</text>

  <path d="M 467 111 L 467 129 L 478 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 489 111 L 489 129 L 478 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <line x1="478" y1="120" x2="478" y2="102" stroke="currentColor" stroke-width="1.6"/>
  <line x1="470" y1="102" x2="486" y2="102" stroke="currentColor" stroke-width="1.6"/>
  <text x="478" y="150" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">HV-4</text>

  <path d="M 489 120 q 7 -9 14 0 q 7 9 14 0 q 7 -9 14 0 q 7 9 14 0" fill="none" stroke="var(--inert)" stroke-width="2.4"/>
  <text x="518" y="170" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">flex hose</text>
  <line x1="549" y1="108" x2="549" y2="132" stroke="currentColor" stroke-width="2"/>
  <line x1="557" y1="108" x2="557" y2="132" stroke="currentColor" stroke-width="2"/>
  <line x1="557" y1="120" x2="575" y2="120" stroke="var(--inert)" stroke-width="3"/>
  <text x="553" y="150" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">QD-1</text>

  <rect x="575" y="72" width="80" height="96" rx="6" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <rect x="581" y="78" width="68" height="84" rx="4" fill="none" stroke="var(--inert)" stroke-width="1.5"/>
  <text x="615" y="190" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">T-2 run tank</text>

  <text x="300" y="192" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="var(--inert)">LN₂ liquid line — all valves drawn in the open position</text>
</svg>
<figcaption>Figure 5.1 — Find the trapped volumes. A liquid nitrogen line from supply
dewar V-1 to run tank T-2. Every valve is drawn open, because the test is not what
the valves are doing now: it is what happens if you mentally close all of them.
Set pressures shown are illustrative — real values are facility-specific.</figcaption>
</figure>

The review exercise is the one LANL and LBNL both describe: take the drawing,
close every valve in your head, and enumerate every volume now isolated. Each
needs a relief path or a documented reason it cannot hold liquid. Do it on
Figure 5.1 before reading on — the quiz asks for your list.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
The test is <em>isolatable</em>, not <em>normally isolated</em>: "every isolatable
part of the system which could conceivably have cryogenic liquid or gas
introduced must have its own pressure relief" `[LBNL-PUB3000-29]`. If any
combination of valve positions can strand liquid, that segment needs relief —
whether or not anyone intends to create that combination.
</div>

### 2.4 The controls

**Thermal relief on every isolatable segment**, discharging somewhere the drawing
shows. Set pressure, capacity and routing are design-review outputs and
facility-specific; the existence of the path is not negotiable.

**Vented ball valves** solve the body cavity: a hole drilled through one wall of
the ball ties the cavity permanently to one side of the line, capping cavity
pressure at line pressure. The hole faces **upstream** — vent it downstream and
cavity pressure pushes the ball off the upstream seat, giving a permanent leak
path. So a vented ball valve is **unidirectional**. It has a flow arrow and seals
one way only, and a review should check each one is oriented for the direction in
which it must *hold pressure*, which during a drain or purge may not be the
normal flow direction. The bidirectional alternative is a trunnion valve with
self-relieving seats.

**No block valve upstream of a relief unless positively locked open.** Jefferson
Lab permits them only under ASME BPVC VIII Div. 1 Appendix M controls — written
procedures plus locks or anti-tampering devices `[JLAB-OVERPRESSURE]`,
`[ASME-BPVC-VIII]`. Car-sealed-open is standard practice and still an
**administrative** control; §2.5 shows what that is worth.

**Relief hardware suited to the service.** Devices must not stop working in
extreme cold or fail from ice build-up, and must not shift set pressure when
thermally shocked; a device fine for LN₂ may be unsuitable for LHe or LO₂. LBNL's
rule is that users never replace or repair cryogenic relief devices. Standard
practice also mounts the device on a riser so it sees warmed gas rather than
sitting in the cold liquid stream, where it would freeze.

<figure>
<svg viewBox="0 0 680 240" role="img" aria-label="Three relief arrangements compared: a relief isolated behind a closed block valve, a car-sealed open block valve, and a relief mounted with no isolation.">
  <text x="105" y="24" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" font-weight="600" fill="var(--warn)">A — relief is isolatable</text>
  <rect x="55" y="150" width="100" height="58" rx="6" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <text x="105" y="184" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">segment</text>
  <line x1="105" y1="150" x2="105" y2="131" stroke="var(--inert)" stroke-width="2"/>
  <path d="M 96 111 L 114 111 L 105 120 Z" fill="var(--warn)" stroke="var(--warn)" stroke-width="1.6"/>
  <path d="M 96 129 L 114 129 L 105 120 Z" fill="var(--warn)" stroke="var(--warn)" stroke-width="1.6"/>
  <line x1="105" y1="120" x2="123" y2="120" stroke="var(--warn)" stroke-width="1.6"/>
  <line x1="123" y1="112" x2="123" y2="128" stroke="var(--warn)" stroke-width="1.6"/>
  <line x1="105" y1="111" x2="105" y2="96" stroke="var(--inert)" stroke-width="2"/>
  <path d="M 96 96 L 114 96 L 105 84 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 117 75 L 117 93 L 105 84 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <polyline points="105,84 99,78 111,74 99,70 111,66 105,62" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="117" y1="84" x2="165" y2="84" stroke="var(--inert)" stroke-width="2"/>
  <path d="M 165 79 L 177 84 L 165 89 Z" fill="var(--inert)" stroke="none"/>
  <text x="105" y="228" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="var(--warn)">closes → unrelieved volume</text>

  <text x="335" y="24" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" font-weight="600" fill="var(--muted)">B — car-sealed open</text>
  <rect x="285" y="150" width="100" height="58" rx="6" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <text x="335" y="184" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">segment</text>
  <line x1="335" y1="150" x2="335" y2="131" stroke="var(--inert)" stroke-width="2"/>
  <path d="M 326 111 L 344 111 L 335 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 326 129 L 344 129 L 335 120 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <line x1="335" y1="120" x2="353" y2="120" stroke="currentColor" stroke-width="1.6"/>
  <line x1="353" y1="112" x2="353" y2="128" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="345" cy="134" r="5" fill="none" stroke="var(--muted)" stroke-width="1.4"/>
  <text x="356" y="142" font-size="13" font-family="system-ui, sans-serif" fill="var(--muted)">CSO</text>
  <line x1="335" y1="111" x2="335" y2="96" stroke="var(--inert)" stroke-width="2"/>
  <path d="M 326 96 L 344 96 L 335 84 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M 347 75 L 347 93 L 335 84 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <polyline points="335,84 329,78 341,74 329,70 341,66 335,62" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="347" y1="84" x2="395" y2="84" stroke="var(--inert)" stroke-width="2"/>
  <path d="M 395 79 L 407 84 L 395 89 Z" fill="var(--inert)" stroke="none"/>
  <text x="335" y="228" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="var(--muted)">works only if people obey</text>

  <text x="565" y="24" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" font-weight="600" fill="var(--ok)">C — no isolation possible</text>
  <rect x="515" y="150" width="100" height="58" rx="6" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <text x="565" y="184" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">segment</text>
  <line x1="565" y1="150" x2="565" y2="96" stroke="var(--ok)" stroke-width="2"/>
  <path d="M 556 96 L 574 96 L 565 84 Z" fill="none" stroke="var(--ok)" stroke-width="1.8"/>
  <path d="M 577 75 L 577 93 L 565 84 Z" fill="none" stroke="var(--ok)" stroke-width="1.8"/>
  <polyline points="565,84 559,78 571,74 559,70 571,66 565,62" fill="none" stroke="var(--ok)" stroke-width="1.4"/>
  <line x1="577" y1="84" x2="625" y2="84" stroke="var(--ok)" stroke-width="2"/>
  <path d="M 625 79 L 637 84 L 625 89 Z" fill="var(--ok)" stroke="none"/>
  <text x="565" y="228" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="var(--ok)">the design rule</text>
</svg>
<figcaption>Figure 5.2 — Three ways to mount the same relief valve. Only C is a
relief path; A and B are relief paths plus a way to remove them. All three reliefs
discharge to a shown destination, which is itself a drawing requirement.</figcaption>
</figure>

### 2.5 What it looks like when it goes wrong

**Williams Olefins, Geismar, Louisiana, 13 June 2013** `[CSB-WILLIAMS-OLEFINS]`. A
reboiler was offline and **isolated from its pressure relief device**. Non-routine
work introduced heat, the confined liquid heated, and the shell ruptured
catastrophically, producing a BLEVE and fire. **Two workers were killed and 167
people reported injuries.** The cause reached back twelve years, to a 2001
management-of-change that installed block valves able to isolate each reboiler
from its relief, after which the organisation relied on administrative control of
valve positions. The CSB's lesson is the transferable one: a hierarchy-of-controls
approach could have led Williams to install a relief valve on the reboiler itself
"instead of relying on a locked open block valve... which is less reliable due to
the possibility of human implementation errors." Propane is not a cryogen; the
mechanism transfers exactly.

**A university LN₂ dewar cylinder, 12 January 2006** `[TX-FIRE-MARSHAL-2006]`. At
about 3 a.m. a liquid nitrogen cylinder ruptured in a chemistry building, causing
substantial structural damage. Examination found its relief valve and rupture disc
"had been replaced by two brass plugs" — an undocumented modification by
unidentified people. The cylinder had been venting through a leaking gasket for
twelve to eighteen months, read by everyone as a nuisance rather than as evidence
that the relief path was gone. Twelve hours before the explosion someone replaced
the gasket and refilled it, removing the last vent. It ruptured above 1,000 psi.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
The trapping agent can be the atmosphere itself. At Berkeley Lab's Advanced Light
Source a liquid helium cylinder was left with one valve open; days later a user
found the withdrawal tube hitting "something hard" well above the bottom. Air had
entered and **frozen solid on top of the liquid helium, forming an impenetrable
plug**. Had it not been found, "the cylinder may have exploded as the helium
trapped below the plug slowly vaporized" `[LBNL-PUB3000-29]`. Nobody closed a
valve. Nobody made a mistake that day.
</div>

---

## 3. Oxygen deficiency

An inert release does not poison anyone; it removes the oxygen, and the body has
no sensor for that. Breathing is driven by carbon dioxide, which a diluent does
not raise — so there is no gasping and no warning. The bands, published by the CSB
and attributed there to the Compressed Gas Association `[CSB-NITROGEN]`:

| Atmospheric O₂ (%) | Possible results |
|---|---|
| 20.9 | Normal |
| 19.0 | Some unnoticeable adverse physiological effects |
| 16.0 | Increased pulse and breathing rate, impaired thinking and attention, reduced coordination |
| 14.0 | Abnormal fatigue on exertion, emotional upset, faulty coordination, poor judgment |
| 12.5 | Very poor judgment and coordination, impaired respiration that may cause permanent heart damage, nausea and vomiting |
| < 10 | Inability to move, loss of consciousness, convulsions, death |

At 4–6 % oxygen the same bulletin reports coma in **under 40 seconds**. OSHA fixes
the regulatory lines at **below 19.5 %** (deficient) and **above 23.5 %**
(enriched) `[OSHA-1910.146]`. Note where the impairment bands sit: long before the
fatal concentration, the person in the room has lost the judgment to recognise the
problem and leave. Self-rescue is not a control — and neither is a rescuer's
instinct, which is why these events are usually one victim plus whoever went in
after them.

### The ODH analysis method, conceptually

Fermilab originated the method `[FNAL-ODH]`; Jefferson Lab and Berkeley Lab
reproduce it publicly and are the citable sources `[JLAB-ODH]`,
`[LBNL-PUB3000-29]`. **It is not a procedure for you to execute** — a designated,
qualified ODH analysis authority performs it and a second one checks it.

**What it computes** is a fatality-rate figure of merit, in fatalities per hour of
occupancy: *f* = Σ *P*ᵢ *F*ᵢ, summed over every credible release scenario *i*,
where *P*ᵢ is how often that release happens per hour and *F*ᵢ the probability it
kills someone if it does. Likelihood and consequence, in one reviewable number.

It has **two halves**. First a **concentration model** — an oxygen mass balance on
the room given the inert volume released and the ventilation provided, with
separate cases for a fan blowing in, a fan drawing out at more or less than the
spill rate, the period after the release, and stratification. One rule from JLab's
appendix is worth quoting verbatim: **"Stratification should not be used to reduce
the risk."** You may be penalised for it; you may never take credit for it. Second
a **fatality factor** *F*ᵢ set by concentration, exposure duration and difficulty
of escape: zero above 18 % O₂, 10⁻⁷ at 18 %, and **1 at 8.8 %** — the
concentration at which one minute of consciousness is expected. Between those it
is logarithmic in oxygen *partial pressure*, so **altitude is a real input**; LBNL
runs its model at 730 mmHg rather than 760 for a site at about 1,000 ft. A test
site on high ground inherits a worse answer than the same room at sea level.

**Inputs:** room volume with doorways, penetrations and passive vent area;
ventilation capacities, with an explicit statement of whether ventilation is
credited in each case; the inventory of every ODH source and its flow rates; the
release scenarios, up to instantaneous venting of the whole inventory; event rates
from operating experience or published failure data; ease of egress and the work
actually done in the space; and atmospheric pressure. One number from JLab's
failure tables deserves reading twice: a cryogenic line is given a leak or rupture
rate around 10⁻⁷ per hour, while a human-in-the-loop transfer connection is given
around 10⁻² to 10⁻³ **per demand**. Making and breaking connections is four to
five orders of magnitude more likely to release cryogen than the pipe is to fail.

**What follows** is an **ODH class**, 0 to 4. JLab treats classes 3 and 4 as
unacceptable results requiring further mitigation, and the bottom of class 0 —
10⁻⁷ per hour — is the definition of "not an ODH operation." The class then drives
engineering controls to obtain *and retain* it (ventilation, sealed penetrations,
passive vent area, lintels to stop dense gas draining into lower spaces),
installed and calibrated oxygen monitors, alarms and posting verified in place
*before* the source arrives, training, restricted access and periodic re-review.
CERN's HSE runs an equivalent service `[CERN-ODH]`, so this is international
practice. **The class of your specific space is facility-specific**, and a student
team cannot self-certify it.

---

## 4. Confined spaces and low points

Cold vapour collects low for two reasons often conflated. Molecular weight matters
— argon is genuinely denser than air — but near a release **temperature
dominates**: boil-off leaves at the liquid's boiling point and is enormously
denser than room air until it warms. UT Austin puts it plainly: gas from spills or
malfunctioning equipment is "cold and denser than ambient air. Even well-ventilated
lab spaces that have pits or other low-lying areas could have the oxygen displaced
by this cold, dense gas" `[UNIV-EHS-OTHER]`. So a nitrogen release is a low-lying
hazard **for as long as it stays cold**, even though room-temperature nitrogen is
nearly neutrally buoyant. The buoyancy reverses as it warms, and the danger zone
moves with it.

The locations: pits, trenches, sumps, basements, crawl spaces, cold rooms and
environmental chambers, stairwells (vertical drains), and lift cars. Elevators get
separate treatment because the occupant cannot leave — LBNL requires a risk
assessment for a passenger trapped with an evaporating cryogen, UT Austin
prohibits pressurised cryogen cylinders in passenger elevators, and the common
convention is to send the container up alone and meet it `[LBNL-PUB3000-29]`,
`[UNIV-EHS-OTHER]`.

Under OSHA a **permit-required confined space** is one that "contains, or has the
potential to contain, a hazardous atmosphere" `[OSHA-1910.146]`. Read *potential*:
a pit reading 20.9 % today is a permit space if a credible release could make it
hazardous. Whether a given pit or test cell is one is decided by that facility's
confined-space programme, not by this course.

<figure>
<svg viewBox="0 0 680 290" role="img" aria-label="Cross-section of a room containing a cryogenic dewar, showing cold dense vapour pooling on the floor, draining into a pit and down a stairwell, with oxygen monitors and low-level exhaust.">
  <path d="M 45 240 L 130 240 L 130 285 L 205 285 L 205 240 L 545 240 L 545 285 L 640 285" fill="none" stroke="currentColor" stroke-width="2"/>
  <line x1="45" y1="55" x2="640" y2="55" stroke="currentColor" stroke-width="2"/>
  <line x1="45" y1="55" x2="45" y2="240" stroke="currentColor" stroke-width="2"/>
  <line x1="640" y1="55" x2="640" y2="285" stroke="currentColor" stroke-width="2"/>
  <path d="M 48 200 L 545 200 L 545 282 L 208 282 L 208 237 L 127 237 L 127 282 L 48 282 Z" fill="var(--warn)" opacity="0.16" stroke="none"/>
  <path d="M 48 200 L 545 200" stroke="var(--warn)" stroke-width="1.4" stroke-dasharray="6 4" fill="none"/>
  <rect x="300" y="150" width="56" height="90" rx="5" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <rect x="305" y="155" width="46" height="80" rx="3" fill="none" stroke="var(--inert)" stroke-width="1.4"/>
  <text x="328" y="143" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">LN₂ dewar</text>
  <path d="M 300 205 q -40 8 -70 22" fill="none" stroke="var(--warn)" stroke-width="1.6"/>
  <path d="M 236 224 L 224 231 L 235 234 Z" fill="var(--warn)" stroke="none"/>
  <path d="M 356 205 q 40 8 70 22" fill="none" stroke="var(--warn)" stroke-width="1.6"/>
  <path d="M 420 224 L 432 231 L 421 234 Z" fill="var(--warn)" stroke="none"/>
  <text x="166" y="214" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="var(--warn)">cold vapour, denser than air</text>
  <path d="M 166 246 L 166 274" fill="none" stroke="var(--warn)" stroke-width="1.6"/>
  <path d="M 161 274 L 166 284 L 171 274 Z" fill="var(--warn)" stroke="none"/>
  <text x="166" y="126" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">pit / trench:</text>
  <text x="166" y="142" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">O₂ falls here first</text>
  <line x1="166" y1="148" x2="166" y2="196" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 3"/>
  <path d="M 592 246 L 592 274" fill="none" stroke="var(--warn)" stroke-width="1.6"/>
  <path d="M 587 274 L 592 284 L 597 274 Z" fill="var(--warn)" stroke="none"/>
  <text x="592" y="150" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">stairwell:</text>
  <text x="592" y="166" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">a vertical drain</text>
  <path d="M 470 195 L 470 100" fill="none" stroke="var(--ok)" stroke-width="1.6" stroke-dasharray="5 4"/>
  <path d="M 465 100 L 470 88 L 475 100 Z" fill="var(--ok)" stroke="none"/>
  <text x="478" y="98" font-size="13" font-family="system-ui, sans-serif" fill="var(--ok)">warms → rises</text>
  <circle cx="255" cy="120" r="17" fill="var(--side)" stroke="currentColor" stroke-width="1.6"/>
  <text x="255" y="125" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">AT-1</text>
  <line x1="255" y1="137" x2="255" y2="196" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>
  <circle cx="90" cy="120" r="17" fill="var(--side)" stroke="currentColor" stroke-width="1.6"/>
  <text x="90" y="125" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">AT-2</text>
  <line x1="90" y1="137" x2="90" y2="268" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>
  <text x="345" y="72" font-size="13" font-family="system-ui, sans-serif" fill="var(--muted)">O₂ monitor placement is an ODH-analysis output</text>
</svg>
<figcaption>Figure 5.3 — Why the hazard is at your feet. Cold boil-off pools on the
floor, drains into the pit and down the stairwell, and only becomes buoyant once it
has warmed. AT-1 and AT-2 are field-mounted oxygen analysers; how many, and where,
is a facility-specific output of the ODH analysis, not a rule of thumb.</figcaption>
</figure>

---

## 5. Vapour clouds and what they do not tell you

The white cloud over a cryogenic release is **condensed atmospheric water** — fog
in ambient air the release has chilled. Nitrogen, oxygen, argon, helium and
hydrogen are all colourless. The cloud traces chilled air, not the substance.

So the hazardous envelope can be **larger** than the visible cloud: at the fog's
edge, chilled air has mixed with enough warm air to rise back above its dew point,
and the fog evaporates while the displacing gas is still there. And for helium and
hydrogen it can be **smaller**, or effectively absent — both warm and become
buoyant so fast that the cold zone sustaining a fog is small and short-lived while
the gas keeps travelling.

<div class="box"><span class="lbl">Worth knowing</span>
The visible cloud and the hazardous envelope are two different shapes, and neither
reliably contains the other. Dense cold vapour extends beyond the fog and
downward; helium and hydrogen extend beyond it and upward. Vision is not an
instrument. Oxygen and combustible-gas monitoring is.
</div>

---

## 6. Condensed air, solid air, and ice

Liquid nitrogen boils at **77.4 K**; oxygen at **90.2 K**. Any surface at LN₂
temperature therefore sits **13 K below the boiling point of oxygen** and
condenses oxygen preferentially out of the air touching it. Module 02 introduced
this; here is what it produces. LBNL quantifies it `[LBNL-PUB3000-29]`: condensed
"liquid air" dripping off uninsulated LN₂ lines is "approximately 50 % oxygen,"
and **open dewars can enrich to as high as 80 % oxygen** by condensing air into
the bath. Cornell adds the closed-system version — condensed oxygen on an
LN₂-cooled surface will over-pressurise the equipment when the nitrogen is
removed, or cause a chemical explosion if it meets combustibles such as rotary
pump oil `[CORNELL-CRYO]`. The pale blue liquid in a cold trap is that
condensate: a concentrated oxidiser inside apparatus never designed for oxygen
service. The control has the same shape as the glove rule — exclude air **without**
sealing the vessel, using loose covers that still vent the boil-off.

<figure>
<svg viewBox="0 0 680 235" role="img" aria-label="Left: an uninsulated liquid nitrogen line condensing oxygen-enriched liquid air that drips onto combustible material below. Right: an open-neck dewar with a loose cover, enriching its own bath with condensed oxygen.">
  <text x="170" y="26" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" font-weight="600" fill="currentColor">Uninsulated LN₂ line at 77.4 K</text>
  <path d="M 90 52 L 90 74" stroke="var(--muted)" stroke-width="1.4"/><path d="M 85 74 L 90 84 L 95 74 Z" fill="var(--muted)"/>
  <path d="M 170 52 L 170 74" stroke="var(--muted)" stroke-width="1.4"/><path d="M 165 74 L 170 84 L 175 74 Z" fill="var(--muted)"/>
  <path d="M 250 52 L 250 74" stroke="var(--muted)" stroke-width="1.4"/><path d="M 245 74 L 250 84 L 255 74 Z" fill="var(--muted)"/>
  <text x="290" y="60" font-size="13" font-family="system-ui, sans-serif" fill="var(--muted)">air, 21 % O₂</text>
  <rect x="45" y="88" width="250" height="30" rx="15" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <text x="170" y="108" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="var(--inert)">LN₂</text>
  <ellipse cx="105" cy="132" rx="6" ry="8" fill="var(--oxy)" opacity="0.75"/>
  <ellipse cx="170" cy="146" rx="6" ry="8" fill="var(--oxy)" opacity="0.75"/>
  <ellipse cx="238" cy="136" rx="6" ry="8" fill="var(--oxy)" opacity="0.75"/>
  <text x="170" y="178" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="var(--oxy)">condensate ≈ 50 % O₂</text>
  <rect x="45" y="192" width="250" height="18" fill="var(--warn)" opacity="0.18" stroke="var(--warn)" stroke-width="1.2"/>
  <text x="170" y="226" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="var(--warn)">asphalt, cable insulation, cloth</text>

  <text x="510" y="26" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" font-weight="600" fill="currentColor">Open-neck dewar</text>
  <rect x="450" y="70" width="120" height="140" rx="8" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <rect x="457" y="77" width="106" height="126" rx="5" fill="none" stroke="var(--inert)" stroke-width="1.4"/>
  <rect x="463" y="120" width="94" height="77" rx="3" fill="var(--inert)" opacity="0.25" stroke="none"/>
  <line x1="440" y1="62" x2="580" y2="62" stroke="currentColor" stroke-width="3"/>
  <path d="M 470 46 L 470 58" stroke="var(--muted)" stroke-width="1.4"/><path d="M 465 58 L 470 68 L 475 58 Z" fill="var(--muted)"/>
  <path d="M 550 68 L 550 46" stroke="var(--ok)" stroke-width="1.4"/><path d="M 545 46 L 550 36 L 555 46 Z" fill="var(--ok)"/>
  <text x="596" y="52" font-size="13" font-family="system-ui, sans-serif" fill="var(--ok)">boil-off</text>
  <text x="404" y="42" font-size="13" font-family="system-ui, sans-serif" fill="var(--muted)">air in</text>
  <text x="510" y="164" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">bath enriches</text>
  <text x="510" y="182" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">to as much as 80 % O₂</text>
  <text x="510" y="228" text-anchor="middle" font-size="13" font-family="system-ui, sans-serif" fill="var(--muted)">loose cover: excludes air, does not seal</text>
</svg>
<figcaption>Figure 5.4 — Oxygen enrichment needs no oxygen system. Any surface at
LN₂ temperature is 13 K below the boiling point of oxygen and will harvest it from
the room air.</figcaption>
</figure>

Colder still and air does not condense but **freezes**. Air, CO₂ and water
entering a cold line solidify and accumulate until the passage blocks — and they
block vent and relief paths first, because that is where cold gas meets
atmosphere. LBNL: "The function of vent lines can be defeated by the formation of
ice... With LHe, air or other gases can solidify to form this blockage." That is
taxonomy item 9: a closed valve nobody installed. Icing fails a relief in both
directions, and both matter:

| Icing failure | Consequence |
|---|---|
| Relief frozen shut, or vent stack plugged | The system is now an unrelieved closed volume — back to §2 |
| Relief frozen open | Continuous release: an ODH source, and loss of inventory |

Unexplained ice is also a **diagnostic**. On a vacuum-jacketed vessel, ice on the
outer casing "is a clear sign that the vacuum jacket has failed". Frost where
frost does not belong is data.

---

## 7. Brittle failure, spills, and rapid phase change

**Embrittlement.** Carbon and many ferritic steels have a ductile-to-brittle
transition: above it they yield and deform before failing, below it they fracture
fast from a small flaw with no plastic warning. Face-centred-cubic metals —
austenitic stainless steels, aluminium alloys, copper — largely do not, which is
why they dominate cryogenic construction `[CERN-DUTHIL]`. Two consequences for
review: the system passes its room-temperature pressure test and fails cold, and
every §2 overpressure becomes a **fragmentation** event rather than a leak,
because a brittle vessel does not bulge and weep. Everyday materials embrittle
too — Cornell names the epoxy and phenolic of bench tops and sinks
`[CORNELL-CRYO]`.

**Spills.** A cryogenic spill drives a severe thermal gradient into concrete and
freezes the moisture in its pores; the result is spalling and cracking. No free
authoritative source quantifies it, so this course gives no number.

**LOX on asphalt** needs care, because the folk version is stronger than the
evidence and overstating one hazard discredits the correctly stated ones beside it
`[UVU-LOX-ASPHALT]`. NASA's 1973 impact tests did detonate — but the stratum was
crumbled asphalt with a **solid aluminium block** buried in it, immersed in LOX. A
2021–23 replication reproduced the detonations *only* with that stratum, and got
no reaction from solid or crumbled asphalt and LOX alone: none from driving
apparatus through a LOX pool, from dropped tools, or from a simulated sledgehammer
strike. The same study is emphatic in the other direction — with an ignition
source present, combustion in a LOX-soaked or oxygen-enriched environment is
"violent and instantaneous." So the defensible teaching is: *LOX plus a
hydrocarbon plus any ignition source is immediate and violent, and LOX-soaked
porous materials stay hazardous long after the frost is gone.* Module 06 takes
this further.

**BLEVE.** If a vessel holding liquid above its atmospheric boiling point fails,
depressurisation flashes a large fraction of it to vapour essentially
instantaneously, producing a blast wave and fragments — and a fireball if the
fluid is flammable `[LBNL-PUB3000-29]`. Two points: a BLEVE requires **no
combustion**, the blast being stored thermodynamic energy, so a nitrogen or helium
vessel can BLEVE; and the trapped-liquid case and the BLEVE case are the same
physics at different boundaries — in §2 the container holds and pressure climbs,
in a BLEVE it lets go and the energy arrives at once.

---

## 8. Relief philosophy

One sentence, which SLAC and LBNL state in nearly the same words: **every volume
that can contain cryogen and can be isolated must have its own relief path that
cannot itself be isolated, sized for the worst credible heat input into that
volume** `[SLAC-CH36]`, `[LBNL-PUB3000-29]`.

Sizing comes down to two cases. **Normal heat leak and boil-off** is the steady
case: ambient heat leaks through the insulation regardless of its quality, and the
relief must pass that vapour without exceeding the accumulation limit. It sizes
the *small* reclosing device, and the system keeps running afterwards. **Fire —
and, for cryogenics, loss of vacuum** — is the accident case that sizes the *large*
device, usually a burst disc. The equations live in the CGA relief-device
standards: **CGA S-1.3** for stationary storage containers and **CGA S-1.2** for
portable containers, both 2024 editions `[CGA-S-1-SERIES]`; note that S-1.2, not
S-1.3, is the portable-container document. Jefferson Lab treats **loss of
insulating vacuum** as a third mandatory case alongside fire, because it subjects
the inner pressure boundary to a sudden enormous heat flux `[JLAB-OVERPRESSURE]`.

The code basis for the vessel is **ASME BPVC Section VIII Division 1** (2025) —
UG-125 for when relief is required, UG-127 for rupture discs, UG-131 for capacity
certification, Appendix M for block valves upstream of reliefs — with **ASME
B31.3** for the piping and API 520/521 for fire-case heat input
`[ASME-BPVC-VIII]`, `[JLAB-OVERPRESSURE]`. Set pressures and capacities for a
specific system are design outputs, not course numbers.

---

## Boundary of this module

This is hazard recognition and design review. It contains no transfer procedures,
no valve sequences, no fill or drain operations and no first-aid instructions;
those need trained personnel, written facility procedures, manufacturer
instructions and institutional approval. Several answers here are genuinely
facility-specific and are said to be: ODH class, monitor placement, ventilation
rates, relief set pressures, confined-space classification and the emergency
response route.

---

## Checkpoint quiz

<div class="quiz">

1. **Schematic reading.** In Figure 5.1, mentally close HV-1, HV-2, HV-3 and HV-4.
   Name at least **five** distinct volumes that can now trap liquid, with the
   boundaries of each. Which one exists even with every valve open?

2. **Identify the hazard.** A team reports that the outer casing of their
   vacuum-jacketed LN₂ dewar has grown a patch of frost over the last week, and
   that the relief valve on top has grown a ball of ice. Name the two distinct
   hazards this indicates, and say which one can fail in two opposite directions.

3. **Conceptual calculation.** Estimate the pressure a rigid, liquid-full, sealed
   LN₂ segment would demand if warmed to 294 K. State every assumption. Then say
   why it must not be used as a design pressure — and why the estimate is not even
   conservative.

4. **Multiple choice.** A worker will be inside a below-grade test cell during an
   LN₂ transfer. Which statement is correct?
   (a) Nitrogen gas is lighter than air, so the hazard is at the ceiling.
   (b) The visible white cloud marks the boundary of the hazardous atmosphere.
   (c) Cold nitrogen vapour pools at floor level and drains into pits until it
   warms, so the hazard is low and moves.
   (d) 17 % oxygen is acceptable for short work periods.

5. **What would concern you here?** A drawing shows a relief valve on a run tank
   with a manual block valve between the tank and the relief. The team explains
   that it is car-sealed open and covered by a written procedure. What is your
   finding, what would you ask for instead, and which documented incident supports
   you?

</div>

<details>
<summary>Show answers</summary>

1. Isolated volumes include: **(i)** the segment HV-1 to HV-2, the canonical
   two-closed-valves trap; **(ii)** the sense line up to **PT-1**, a dead leg that
   fills and warms from the closed end; **(iii)** **CV-1 to HV-3** — CV-1 is a
   closed valve no operator can open, so that liquid has no path back; **(iv)** the
   **P-1 pump casing** between HV-3 and HV-4, geometrically a large valve cavity;
   **(v)** the **flex hose** through QD-1, which becomes a filled, capped tube with
   no rating and no relief the moment the disconnect is parted; **(vi)** the
   segment under **PSV-1** if **BV-2** is closed — a correctly sized relief
   completely disconnected from what it protects; **(vii)** each ball-valve **body
   cavity**, unless the valves are vented-ball or self-relieving types, which the
   drawing does not say. The volume that exists **with every valve open** is the
   **annulus** of V-1 and T-2: a crack in an inner vessel admits cryogen to the
   vacuum space, which needs its own relief. Five is a pass; the annulus and the
   PSV-1/BV-2 pair are what separate a reviewer from a reader.

2. Frost on the outer casing means **loss of insulating vacuum** — LBNL treats
   external ice as a clear sign the jacket has failed. That is at once a step
   change in heat leak (rapid boil-off, an ODH source, and a pressure rise the
   relief must now handle) and a possible route for cryogen into the annulus. The
   **iced relief valve** is the second hazard and the one that fails both ways:
   frozen shut, the vessel is an unrelieved closed volume; frozen open, it releases
   continuously into the room. Neither is a user-repair item.

3. Assumptions: rigid, perfectly strong, perfectly sealed volume; initially 100 %
   liquid-full at NBP and 1 atm; all of it ending as gas at 294 K in the same
   volume; ideal-gas behaviour; no leakage or container expansion. Then
   *P* ≈ 696 × 1 atm ≈ **10,200 psi ≈ 70 MPa**, which is where LBNL's published
   figure comes from. It is not a design pressure because ordinary tube, fittings
   and valve bodies fail one to two orders of magnitude lower — the demand is
   unbounded relative to realistic containment, so the answer is a relief path, not
   a thicker wall. It is **not conservative** either: at ~800 kg/m³ and 294 K the
   nitrogen is a dense supercritical fluid with a compressibility factor above 1,
   so the true pressure is higher than the ideal-gas estimate.

4. **(c).** (a) is the classic error — room-temperature nitrogen is nearly
   neutrally buoyant, but vapour leaving a spill is at 77 K and behaves as a heavy
   gas until it warms. (b) is wrong because the cloud is condensed atmospheric
   water and evaporates at its edge while the displacing gas is still present.
   (d) is wrong on both counts: OSHA defines oxygen-deficient as below 19.5 %, and
   by 16 % the published effects already include impaired thinking and attention —
   the concentration that removes your judgment arrives well before the one that
   kills you.

5. The finding is that **the relief is isolatable**, so the tank has no
   uninterruptible relief path — LBNL's and SLAC's rule is that every isolatable
   volume needs a relief that cannot itself be isolated. A car seal is an
   administrative control that depends on people; Appendix M treatment of
   locked-open block valves is a permission, not an equivalence. Ask for the relief
   to be mounted with no isolation between it and the protected volume, or, if the
   block valve genuinely must exist for maintenance, for a second independent
   relief that stays connected. The supporting incident is **Williams Olefins,
   Geismar, 13 June 2013** — a reboiler isolated from its relief, heat input,
   catastrophic rupture, BLEVE and fire, two dead and 167 reporting injuries, with
   the CSB finding explicitly that installing a relief valve on the reboiler would
   have been more reliable than relying on a locked-open block valve. The 2006 LN₂
   cylinder rupture is the blunter version of the same principle.

</details>
