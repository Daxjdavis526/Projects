# Module 06 — LOX Is Different

*Roughly 30 minutes. Prerequisite: Module 05.*

Everything else in this course is about cold. This module is about the one fluid
where cold is the *second* problem. Liquid oxygen does not burn and has no flammable
range of its own — and it has killed more people in propulsion than any fuel on the
pad, because it changes what everything around it can do. A stainless valve body is
inert plumbing in a nitrogen system and a fuel in an oxygen system. That sentence is
the module.

## What you'll be able to do

- State correctly how enrichment changes a flammable range, and why the common
  "everything ignites sooner" framing is wrong at the lean end.
- Name the ignition mechanisms from NASA's canonical list and, for the major ones,
  the characteristic elements a design must remove.
- Work the adiabatic-compression relation and explain why its answer is a screening
  bound, not a prediction.
- Say what "oxygen clean" means as a specified, verified, documented condition.
- Explain why "is this part oxygen compatible?" cannot be answered without the
  configuration.
- Recognise which items deserve a formal oxygen compatibility assessment.

---

## 1. Oxygen is not a fuel. It is a change of rules.

Oxygen does not burn. It has no flammability limits, no autoignition temperature, no
heat of combustion. Every hazard here belongs to some *other* material — a seal, a
lubricant, a wire insulator, a valve body — that becomes capable of things it was not
capable of in air.

Correct the intuition most engineers arrive with. Enrichment does not lower the
concentration at which a fuel leak becomes flammable: the lower limits in oxygen and
in oxygen–nitrogen mixtures "are essentially the same as those in air at the same
temperature and pressure" `[USBM-627]` **[A]**. What moves — enormously — is the rich
limit.

<figure>
<svg viewBox="0 0 660 250" role="img" aria-label="Bar chart comparing flammable ranges in air and in pure oxygen. Methane spans 5 to 15 percent in air and 5.15 to 60.5 percent in oxygen. Hydrogen spans 4 to 75 percent in air and 4.65 to 93.9 percent in oxygen. The lean limits barely move; the rich limits open far to the right.">
  <line x1="110" y1="205" x2="620" y2="205" stroke="currentColor" stroke-width="1"/>
  <g font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">
    <text x="110" y="225" text-anchor="middle">0</text>
    <text x="210" y="225" text-anchor="middle">20</text>
    <text x="310" y="225" text-anchor="middle">40</text>
    <text x="410" y="225" text-anchor="middle">60</text>
    <text x="510" y="225" text-anchor="middle">80</text>
    <text x="610" y="225" text-anchor="middle">100</text>
    <text x="365" y="243" text-anchor="middle">fuel in the mixture, vol %</text>
  </g>
  <line x1="110" y1="40" x2="110" y2="205" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 3"/>
  <g font-family="system-ui, sans-serif" font-size="13" fill="currentColor">
    <text x="6" y="61">CH₄ in air</text>
    <text x="6" y="96">CH₄ in O₂</text>
    <text x="6" y="141">H₂ in air</text>
    <text x="6" y="176">H₂ in O₂</text>
  </g>
  <rect x="135" y="44" width="50" height="22" fill="var(--fuel)" opacity="0.35" stroke="var(--fuel)"/>
  <rect x="136" y="79" width="277" height="22" fill="var(--fuel)" opacity="0.75" stroke="var(--fuel)"/>
  <rect x="130" y="124" width="355" height="22" fill="var(--fuel)" opacity="0.35" stroke="var(--fuel)"/>
  <rect x="133" y="159" width="446" height="22" fill="var(--fuel)" opacity="0.75" stroke="var(--fuel)"/>
  <g font-family="system-ui, sans-serif" font-size="13" fill="currentColor">
    <text x="193" y="60">5 – 15 %</text>
    <text x="421" y="95">5.15 – 60.5 %</text>
    <text x="493" y="140">4 – 75 %</text>
    <text x="587" y="175">4.65 – 93.9 %</text>
  </g>
  <path d="M185 34 L185 24 L413 24 L413 34" fill="none" stroke="var(--warn)" stroke-width="1.5"/>
  <text x="299" y="18" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)" text-anchor="middle">the rich limit is what opens — ×4 for methane</text>
</svg>
<figcaption>Figure 6.1 — Flammable ranges in air and in pure oxygen, from Bureau of Mines Bulletin 503, measured on the same apparatus by the same investigators <code>[USBM-503]</code>. Confidence A. The left-hand edges barely move. The right-hand edges are the story.</figcaption>
</figure>

Physically, a flame must release heat faster than it loses it. In air, four molecules
in five are inert nitrogen soaking up that heat, so above about 15 % methane the
mixture is too fuel-heavy to carry flame. Remove the nitrogen and there is no thermal
ballast: a 60 % methane mixture still burns. In air a leak is flammable only in a
narrow band near its source; in an oxygen-enriched space — exactly what a co-located
LOX leak creates — it is flammable across most of the composition range. There is no
"too rich to worry about" region.

That is the gas-phase half. The bigger half is that things which are not fuels in air
become fuels in oxygen.

**Burn rate.** NASA MSFC data per ISO 14624-1, in `[NASA-DAVIS-2012]` **[A]**, gives
the number that changes minds. A polyester-based foam at **23 % oxygen** burns 1.3 in
and self-extinguishes, at 0.07 in/s; at **25 % oxygen** the same foam is fully
consumed over the whole 12 in specimen at 0.67 in/s. Two percentage points take a
material from self-extinguishing to fully consumed and multiply its burn rate roughly
tenfold.

**Metals.** From the same source's promoted-ignition (ASTM G124 `[ASTM-G124]`) and
impact (ASTM G86 `[ASTM-G86]`) data, threshold pressures below which self-sustained
burning is on average not sustained **[A]**:

| Material | Sustains combustion in GOX above |
|---|---|
| Magnesium, titanium | below ambient |
| Aluminium 6061 | ambient |
| **Aluminium 4043** (burn-rate test) | **burns at 25 psi** |
| **Stainless 304L** | **250 psi** |
| Stainless 316, 17-4 | 400 psi |
| Inconel 718 | 500 psi |
| **Monel K-400/K-500, nickel, copper 12200, brass** | **10,000 psi — top of range** |

Davis's caveat travels with the table: data "for comparison purposes only, not to be
considered standard values." Build intuition with it; never treat it as an allowable.

<div class="box remember"><span class="lbl">Remember this</span>
<b>304L stainless sustains combustion in oxygen at 250 psi</b> — an ordinary pressure
in a cryogenic propulsion system. Stainless is not an "oxygen-safe" material; it is a
material with a threshold. Monel, nickel, copper and brass resist to the 10,000 psi
top of the test range, which is why "change the valve body from stainless steel to
Monel" is NASA's own worked example of a hazard control
<code>[NASA-TM-2007-213740]</code> <b>[A]</b>.
</div>

The same metal gets very different numbers from different tests: 304L sustains
burning at 250 psi but resists *ignition by mechanical impact* to 10,000 psi, a factor
of forty. A "compatibility pressure" quoted without naming the test is meaningless.
And LOX is not merely cold GOX: aluminium 2219's mechanical-impact threshold is
1,500 psi in GOX and **50 psi in LOX** **[A]**.

**Where the evidence stops.** No citable air-versus-oxygen table of minimum ignition
energy could be found for this course; the circulated figures are untraceable to a
primary source, `properties.md` §14.7 marks them **[C]**, and they are not printed
here. The same goes for a quantitative air-versus-oxygen autoignition or flame-
temperature comparison from an oxygen-safety source. The *direction* is authoritative
— EIGA states ignition temperature and ignition energy are "much lower" and flame
temperature higher in oxygen `[EIGA-04]` **[A]** — but the magnitudes are not. State
the direction; do not invent the multiplier.

---

## 2. Ignition mechanisms, and the method that goes with them

NASA/TM-2007-213740, by **Rosales, Shoffstall and Stoltzfus (2007)**, is the backbone
document `[NASA-TM-2007-213740]`. (It is frequently miscited to Stoltzfus and Beeson;
Harold Beeson edited ASTM MNL36, a different document.) Its Table 1 lists **17**
mechanisms in NASA's own naming: **Particle Impact · Rapid Pressurization · Flow
Friction · Resonance · Mechanical Impact · Galling and Friction · Fresh Metal
Exposure · Static Discharge · Electrical Arc · Chemical Reaction · Thermal Runaway**,
plus six external heat sources grouped as "Other" — lightning, explosive charges,
personnel smoking and open flames, fragments from bursting vessels, welding, engine
exhaust. **[A]**

The method matters more than the list:

> "For ignition mechanisms to be effective, certain elements must be present… **If
> any characteristic element is not present, the ignition mechanism is unlikely to
> occur. Conversely, if all the characteristic elements are present, ignition is
> possible.**" — `[NASA-TM-2007-213740]` §4.3 **[A]**

You do not hunt for the spark. You walk each mechanism and ask which required element
the design has removed.

<figure>
<svg viewBox="0 0 680 330" role="img" aria-label="Map of three ignition mechanisms. Each row shows the mechanism on the left, its required characteristic elements in the centre, and the design control on the right. Removing any one required element removes the mechanism.">
  <g font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">
    <text x="10" y="20">MECHANISM</text>
    <text x="170" y="20">ALL CHARACTERISTIC ELEMENTS REQUIRED</text>
    <text x="520" y="20">CONTROL = REMOVE ONE</text>
  </g>
  <line x1="10" y1="30" x2="670" y2="30" stroke="var(--muted)" stroke-width="1"/>
  <g font-family="system-ui, sans-serif" font-size="13">
    <rect x="10" y="45" width="140" height="70" rx="5" fill="var(--side)" stroke="var(--oxy)" stroke-width="1.5"/>
    <text x="20" y="72" fill="currentColor">Particle</text>
    <text x="20" y="90" fill="currentColor">impact</text>
    <text x="20" y="108" fill="var(--muted)">metals, mainly</text>
    <rect x="170" y="45" width="330" height="70" rx="5" fill="none" stroke="var(--muted)"/>
    <text x="182" y="66" fill="currentColor">1 · entrained particles in the flow</text>
    <text x="182" y="86" fill="currentColor">2 · gas velocity above roughly 30 m/s</text>
    <text x="182" y="106" fill="currentColor">3 · impact target at 45° to perpendicular</text>
    <rect x="516" y="45" width="154" height="70" rx="5" fill="none" stroke="var(--ok)" stroke-width="1.5"/>
    <text x="526" y="66" fill="var(--ok)">clean + filter (1)</text>
    <text x="526" y="86" fill="var(--ok)">velocity limit (2)</text>
    <text x="526" y="106" fill="var(--ok)">no drill points (3)</text>
    <rect x="10" y="130" width="140" height="70" rx="5" fill="var(--side)" stroke="var(--oxy)" stroke-width="1.5"/>
    <text x="20" y="157" fill="currentColor">Rapid</text>
    <text x="20" y="175" fill="currentColor">pressurization</text>
    <text x="20" y="193" fill="var(--muted)">nonmetals</text>
    <rect x="170" y="130" width="330" height="70" rx="5" fill="none" stroke="var(--muted)"/>
    <text x="182" y="151" fill="currentColor">1 · pressurisation in under 1 second</text>
    <text x="182" y="171" fill="currentColor">2 · exposed nonmetal at the dead end</text>
    <text x="182" y="191" fill="currentColor">3 · pressure ratio taking gas above the AIT</text>
    <rect x="516" y="130" width="154" height="70" rx="5" fill="none" stroke="var(--ok)" stroke-width="1.5"/>
    <text x="526" y="151" fill="var(--ok)">slow-open valve (1)</text>
    <text x="526" y="171" fill="var(--ok)">no dead-end leg (2)</text>
    <text x="526" y="191" fill="var(--ok)">lowest usable P (3)</text>
    <rect x="10" y="215" width="140" height="70" rx="5" fill="var(--side)" stroke="var(--oxy)" stroke-width="1.5"/>
    <text x="20" y="242" fill="currentColor">Galling and</text>
    <text x="20" y="260" fill="currentColor">friction</text>
    <text x="20" y="278" fill="var(--muted)">metals</text>
    <rect x="170" y="215" width="330" height="70" rx="5" fill="none" stroke="var(--muted)"/>
    <text x="182" y="236" fill="currentColor">1 · two rubbing surfaces, usually metal</text>
    <text x="182" y="256" fill="currentColor">2 · rapid relative motion</text>
    <text x="182" y="276" fill="currentColor">3 · high load pressing them together</text>
    <rect x="516" y="215" width="154" height="70" rx="5" fill="none" stroke="var(--ok)" stroke-width="1.5"/>
    <text x="526" y="236" fill="var(--ok)">clearances (1)</text>
    <text x="526" y="256" fill="var(--ok)">design out chatter (2)</text>
    <text x="526" y="276" fill="var(--ok)">burn-resistant alloy</text>
  </g>
  <g stroke="currentColor" stroke-width="1.2" fill="none">
    <path d="M150 80 L168 80"/><path d="M500 80 L514 80"/>
    <path d="M150 165 L168 165"/><path d="M500 165 L514 165"/>
    <path d="M150 250 L168 250"/><path d="M500 250 L514 250"/>
  </g>
  <text x="10" y="312" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">If the material's flammability is unknown, it is treated as flammable.</text>
</svg>
<figcaption>Figure 6.2 — The assessment method, drawn for three mechanisms. Elements and definitions from <code>[NASA-TM-2007-213740]</code> Table 1 and §4.3 (Confidence A); the controls are derived from removing an element, corroborated by <code>[LANL-OXYGEN-GUIDE]</code>.</figcaption>
</figure>

Four mechanisms deserve individual comment.

**Particle impact** is the most effective igniter of *metals*, and NASA's test
footnote is the course's best argument for cross-sectional drawings. A fixture
simulating the Space Shuttle Main Propulsion System oxygen flow control valve,
Inconel 718 at 600 K and 4,600 psig, **ignited on the second test** with a drill point
downstream of the flow orifice, and **did not ignite in 40 tests** with the drill
points removed and the impact angle at 45° **[A]**. Same alloy, same pressure, same
particles — one internal geometric feature.

**Flow friction** — heat from oxygen flowing across a polymer, eroding and vibrating
it — is the one NASA admits it does not understand: no laboratory method reproduces
it, and yet "it has caused a significant number of real-life fires" **[A]**. It is a
*degraded-condition* mechanism, typically throttling across a seat damaged by
extensive cycling, so a review of the as-new configuration misses it entirely.

**Resonance** should unsettle a propulsion audience. A sonic jet from an orifice into
a closed-end cavity drives acoustic oscillations that heat the gas at the closed end;
NASA notes the same geometry is used deliberately as a **rocket igniter** **[A]**. The
accidental version is a capped tee downstream of a valve. An audible tone from an
oxygen system is a symptom, not a nuisance.

**Thermal runaway** breaks the intuition that commissioning proves anything. A
high-surface-area accumulation — fines, char, contaminated adsorbent — can self-heat
over "hours, days, or months", and "in the most extreme cases, the thermal runaway
temperature may be near or below normal room temperature" **[A]**. NASA's example is
barbed: particulate generated by a *nitrogen proof test* igniting when the system
later sees oxygen. The test created the hazard.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
A ball valve is specified for a GOX line because it is quick to actuate and cheap. It
opens in a quarter turn (rapid pressurization), rotates a seal against a seat every
cycle (particle generation), can chatter if mis-sized (mechanical impact and friction
on the polymer seat), and the line downstream ends in a capped test port (dead end,
plus resonance geometry). One procurement decision has activated four mechanisms from
the canonical list.
</div>

---

## 3. Adiabatic compression: ideal against real

Drive gas rapidly into a dead-ended volume and it is compressed faster than it can
shed heat to the walls. The compression work goes into internal energy, and the gas
at the closed end gets hot in proportion to the **pressure ratio**, not the pressure
difference. NASA's relation, symbols as the TM defines them **[A]**:

$$T_f = T_i \left(\frac{P_f}{P_i}\right)^{(n-1)/n}, \qquad n = 1.4 \text{ for oxygen}$$

**Worked example — state the assumptions, they do the work.** Ideal gas; constant
*n* = 1.4; isentropic, i.e. adiabatic *and* reversible, so no heat into the wall;
compression fast relative to the volume's thermal time constant; gas initially at
**20 °C and 14.7 psia**, a dead-ended line sitting at ambient; gas phase only. Open a
valve from a **3,000 psi** supply and the pressure ratio is 204:

$$T_f = 293.15 \times 204.1^{0.2857} \approx 1{,}340\ \text{K} \approx 1{,}070\ ^\circ\text{C}\ (1{,}950\ ^\circ\text{F})$$

No spark, no external heat, no contamination — just a valve opening quickly, and a
temperature at which steel glows.

<figure>
<svg viewBox="0 0 660 260" role="img" aria-label="Schematic of a fast-opening valve admitting high-pressure oxygen into a dead-ended line. A pressure wave travels right and a hot spot forms at the capped end where a polymer seat sits.">
  <rect x="20" y="95" width="60" height="40" rx="4" fill="var(--side)" stroke="var(--oxy)" stroke-width="2"/>
  <text x="50" y="112" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" text-anchor="middle">GOX</text>
  <text x="50" y="128" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" text-anchor="middle">3000 psi</text>
  <line x1="80" y1="115" x2="180" y2="115" stroke="var(--oxy)" stroke-width="2.5"/>
  <path d="M180 100 L180 130 L215 100 L215 130 Z" fill="var(--oxy)" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="197" cy="86" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="197" y1="97" x2="197" y2="100" stroke="currentColor" stroke-width="1.5"/>
  <text x="197" y="66" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" text-anchor="middle">HV-1 fast-opening</text>
  <line x1="215" y1="115" x2="560" y2="115" stroke="var(--oxy)" stroke-width="2.5"/>
  <line x1="560" y1="92" x2="560" y2="138" stroke="currentColor" stroke-width="4"/>
  <rect x="543" y="97" width="14" height="36" fill="var(--warn)" opacity="0.55" stroke="var(--warn)"/>
  <text x="612" y="112" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)" text-anchor="middle">seat /</text>
  <text x="612" y="128" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)" text-anchor="middle">O-ring</text>
  <g stroke="var(--muted)" stroke-width="1.5" fill="none">
    <path d="M260 115 L300 115"/><path d="M292 109 L300 115 L292 121"/>
    <path d="M330 115 L370 115"/><path d="M362 109 L370 115 L362 121"/>
    <path d="M400 115 L440 115"/><path d="M432 109 L440 115 L432 121"/>
  </g>
  <text x="350" y="98" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)" text-anchor="middle">pressure wave, &lt; 1 s</text>
  <text x="350" y="148" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)" text-anchor="middle">line was sitting at 14.7 psia — worst-case ratio</text>
  <path d="M470 115 Q515 95 552 115 Q515 135 470 115 Z" fill="var(--warn)" opacity="0.30" stroke="var(--warn)" stroke-width="1.5"/>
  <text x="512" y="70" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)" text-anchor="middle">hot spot</text>
  <text x="512" y="86" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)" text-anchor="middle">theoretical ~1,070 °C</text>
  <rect x="20" y="185" width="620" height="56" rx="6" fill="none" stroke="var(--ok)" stroke-width="1.5"/>
  <text x="34" y="207" font-family="system-ui, sans-serif" font-size="13" fill="var(--ok)">Empirical bound: in testing consistent with ASTM G74, for initial upstream pressures below</text>
  <text x="34" y="227" font-family="system-ui, sans-serif" font-size="13" fill="var(--ok)">275 psia with downstream at ambient or above, the real temperature rise is too small to ignite.</text>
</svg>
<figcaption>Figure 6.3 — The classic hazard, and the number that bounds it. Equation and the 275 psia finding from <code>[NASA-TM-2007-213740]</code> (Confidence A); the 1,070 °C figure is computed here from that equation under the stated assumptions.</figcaption>
</figure>

Now the part that teaches something. The same TM reports that "extensive testing in a
system consistent with ASTM G74 has demonstrated that for **initial upstream
pressures less than 275 psia** and an initial downstream pressure of ambient or above,
the actual temperature rise (with real heat loss) is too small for ignition to occur"
**[A]**. But the equation gives 275 psia a theoretical 404 °C — above the 300 °C
minimum AIT EIGA takes as a working convention for nonmetals `[EIGA-04]` **[B]**. The
ideal calculation predicts ignition where decades of testing say it does not happen.

Both are correct, and the gap is the lesson. The isentropic result is an **upper
bound**: real compressions lose heat to the wall and the seat, take finite time, and
mix. Ignition also needs enough energy delivered for long enough to take a real piece
of polymer through its ignition, not merely a peak gas temperature. Which is why
**ASTM G74-13(2021)** exists as a *test* — 5 mm and 14 mm bore configurations to
69 MPa, reporting a median failure pressure or an ignition-probability curve — rather
than as a formula `[ASTM-G74]` **[A]**.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
The compression equation tells you when you <b>cannot rule the mechanism out</b>. It
never tells you a design is safe. Qualification comes from testing the actual
configuration. Treat every hand calculation in oxygen work the same way: a screen
that opens a question, not an answer that closes one.
</div>

A fast-opening valve into a dead-ended line supplies all three characteristic elements
at once: the valve gives sub-second pressurisation; the dead end is almost always a
component, and components contain polymers, so an exposed nonmetal sits at the
temperature peak; and a line left at atmospheric gives the worst possible ratio.
Quarter-turn valves open inherently fast, long dead legs put more gas mass at the
closed end, and a hydrocarbon film lowers the effective ignition temperature — which
is why WHA report that for nonvolatile residues adiabatic compression "is often the
dominant ignition threat" **[B]**. Eliminating the dead leg removes this mechanism
*and* the resonance geometry at once, the kind of overlap you find only by tabulating
mechanism by mechanism. No numeric pressurisation-rate limit is printed here: none
could be verified from a primary standard, and ASTM G88-21 `[ASTM-G88]` has not been
read. **[C]** for any rate figure quoted elsewhere.

---

## 4. Cleanliness is a fire-prevention measure

"Oxygen clean" is not "visually clean". It is a **specified, verified and documented
level of freedom from contaminants that could act as fuel or as an ignition
initiator**, appropriate to the pressure, concentration and geometry of the particular
system. NASA makes "determine the worst-case cleanliness level of each component" a
required step of the compatibility assessment **[A]**: it is a hazard control, not
housekeeping.

Two contaminant families, two risk profiles. **Nonvolatile residues** — oils, greases,
films, and the classics found in investigations: thread lubricants, crayon, paint —
are dominated by adiabatic compression, a low-AIT fuel film sitting exactly where the
compression peak occurs. EIGA is blunt: oil and grease ignition "often causes a chain
reaction that finally results in metal burning or melting" `[EIGA-04]` **[A]**. A
trace of oil ignites; the *metal* ends up burning. **Particulates** feed particle
impact, whose three elements are entrained particles, >30 m/s and an unfavourable
impact angle — cleanliness removes the first, and it is the only one still
controllable after the geometry is frozen.

The governing documents are **ASTM G93/G93M-25**, *Standard Guide for Cleanliness
Levels and Cleaning Methods for Materials and Equipment Used in Oxygen-Enriched
Environments* `[ASTM-G93]` **[A]**, and **CGA G-4.1, 7th edition (2018)**, *Cleaning
of Equipment for Oxygen Service* `[CGA-G-4.1]` **[B]**. The 2025 revision moved G93
from a *Standard Practice* to a *Standard Guide*: it now deliberately avoids
prescribing single correct levels and expects users to select one from their own
documented risk analysis **[B]**. Material treating G93 as prescriptive is out of date.

Verification is quantitative or it is not verification. **Nonvolatile residue (NVR)**
is the mass of residue left after a solvent extract from a defined surface area is
evaporated, reported as mass per unit area (methods ASTM G120, G136, G144
`[ASTM-NVR-METHODS]` **[A]**); **particle counts** are counts by size band with a
maximum permitted size. Visual and UV inspection detect only gross contamination — a
screening result, not a verification **[B]**.

<div class="box"><span class="lbl">Worth knowing</span>
Cleanliness is a supply-chain and lifecycle property, not a one-time operation.
G93's 2025 edition spans procurement, process specification, verification, packaging,
preservation and assembly — every one a place cleanliness is lost. A purchase order
should carry a level <i>designation</i>, not the adjective "clean". And cleaning has
its own hazards: LANL warns that non-volatile cleaning agents can remain in trapped
spaces, and that caustic or acid solutions can degrade nonmetals and cause crevice
corrosion <code>[LANL-OXYGEN-GUIDE]</code> <b>[A]</b>.
</div>

Cleaning, verification and re-cleaning are tasks for trained personnel working to an
approved written procedure and the manufacturer's instructions; this module teaches
what the process accomplishes and what evidence it should produce, not how to do it.

---

## 5. Materials, lubricants, and why the question is malformed

Hydrocarbon oils and greases are the archetypal wrong answer: low autoignition
temperatures, high heats of combustion, and — as films in crevices and at dead ends —
exactly the geometry and position that maximise both ignition probability and heat
delivery into surrounding metal. EIGA's rule is categorical, and includes a specific
that catches people out: oxygen pressure gauges "shall not be tested or calibrated in
contact with oil" `[EIGA-04]` **[A]**. Where a lubricant is unavoidable, Davis's two
rules are: only when absolutely necessary, and only the smallest workable amount —
"lubricants become contaminants if they enter into the oxygen stream" **[A]**. A less
obvious trap: glycol–water coolant leaking into an oxygen system concentrates as the
water evaporates, turning a coolant into a fuel **[A]**.

The classes actually used are **nickel alloys, copper, brass and bronze** among metals
— harder to ignite and, once ignited, burning with the lowest heats of combustion
**[A]** — and **fluoropolymers and fluorinated (PCTFE-type) lubricants** among
nonmetals, which give the best impact thresholds in the data, 10,000 psi GOX and
8,000 psi LOX **[A]**. Avoid magnesium, titanium and many aluminium alloys. Carry the
counterweight: fluorinated materials can produce toxic fluorinated combustion
products, a genuine trade in crewed or breathing-gas applications **[A]**. Ceramics
are generally compatible and generally too fragile. Composites are permitted outside
the wetted boundary — a composite-overwrapped oxygen tank is the standard example —
which makes "where exactly is the oxygen-wetted boundary?" a safety-critical drawing
question.

Now the central principle. **Compatibility is configuration-dependent.** The same
material changes verdict along at least four axes, each evidenced above:

1. **Pressure** — 304L is acceptable below 250 psi and sustains combustion above.
2. **Thickness and geometry** — thin sections and finely divided forms (mesh, sintered
   filters) are far more flammable than bulk metal **[A]**.
3. **Velocity and impingement angle** — the Shuttle valve burned on test two with a
   drill point and survived 40 tests at 45°.
4. **What it is paired with** — aluminium is routine; aluminium *sheared against
   PCTFE* is a chemical-reaction ignition mechanism **[A]**.

Which is why "is this part oxygen compatible?" has no answer. Without the pressure,
concentration, temperature, velocity, geometry and neighbouring materials there is
nothing to assess. Davis is uncompromising: compatibility "cannot be determined by
similarity to other materials whose properties are known… Testing, and not evaluation,
is the only method by which safe materials can be chosen" **[A]** — while conceding
that "there is no decisive test or evaluation method that will clearly indicate the
best materials for use in oxygen."

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
The promoted-ignition test is so severe that most industry-standard oxygen materials —
stainless alloys included — fail it at their normal working pressures, and essential
seal materials fail it outright. The response was not to abandon them but to build a
process around them. <b>The oxygen compatibility assessment exists precisely because a
materials lookup returns "fail" for almost everything real systems are made of.</b> It
is the discipline of using flammable materials safely by removing ignition mechanisms.
</div>

---

## 6. Incidents, classified by environment

Mechanisms differ by phase and environment, and conflating them produces bad
intuition. Most documented oxygen fire literature is GOX and enriched-atmosphere work;
only the second case below involves cryogenic oxygen as such.

**Apollo 1 / AS-204, 27 January 1967 — oxygen-enriched atmosphere.** *What happened:*
fire broke out in the Command Module during a plugs-out test and killed the three-man
crew `[APOLLO-204-BOARD]` **[A]**. *Why:* the test ran at "16.7 pounds per square inch
absolute, 100-percent oxygen atmosphere", and the Board determined "the test
conditions were extremely hazardous." Evidence of several arcs was found but no single
ignition source identified; the module "contained many types and classes of
combustible material in areas contiguous to possible ignition sources", and
"deficiencies in design, manufacture, installation, rework and quality control existed
in the electrical wiring" **[A]**. *Engineering lesson:* enrichment plus pressure plus
fuel load is the hazard, not any one of them — two percentage points take a foam from
self-extinguishing to fully consumed, and this cabin was at 100 %. The ignition source
did not need identifying: where arcs are credible and the fuel load is uncontrolled,
fire is a matter of time. And a configuration classified as non-hazardous receives no
hazard controls — the absence of fire emergency provisions followed from the paperwork
classification **[B]**. Classification is itself safety-critical.

**Apollo 13 oxygen tank 2, 13 April 1970 — cryogenic oxygen pressure vessel.** *What
happened:* seconds after current reached the tank 2 fans at 55:54:53 GET, telemetry
was lost for 1.8 s, main bus B undervolted, the crew heard a bang, and the tank had
burst `[APOLLO-13-BOARD]`, `[ANDERSON-APOLLO13]` **[A]**. *Why — the chain:* the
tank's protective thermostatic switches were rated **28 V dc**, the spacecraft
standard, but during tanking tests at KSC the heaters ran on **65 V dc ground support
equipment**, and post-flight testing showed the switches failed to open at that
voltage — qualification "did not test the ability at any point for the switches to
operate at 65 V dc." Uncut-off, the heaters may have reached **1,000 °F** during
detanking, causing severe damage to the **Teflon insulation** on wiring inside the
tank; that information never reached the pre-launch discussion, which focused on a
loose fill tube. When the fans were powered, "the current flow generated a spark which
ignited oxygen in the tank" **[A]**. *Engineering lesson:* textbook electrical-arc
ignition — NASA's own guide gives almost word for word an insulated heater element
short-circuiting and arcing through its sheath to combustible material. The mechanism
was catalogued; the tank still carried powered electrical equipment immersed in
oxygen, and the Board recommended removing it **[B]**. Interface voltage is a safety
parameter: ground support equipment is part of the system, and untested protection is
not protection. The damage was latent, inflicted weeks earlier and waiting for a
current. And PTFE — one of the better oxygen nonmetals — still failed: material
selection does not survive an out-of-envelope thermal excursion.

**Mir SFOG / Vika, 24 February 1997 — chemically generated hot GOX.** *What happened:*
a lithium perchlorate oxygen generator "failed having burned through the thin
stainless steel wall. It is assumed that the stainless steel was actually burning in
the high temperature oxygen stream. The fire continued for some 10–20 minutes until
the generator was exhausted" `[GRAF-OXYGEN-CANDLES]` **[A]**. *Why:* the investigation
concluded the unit "was probably contaminated during manufacture. The contaminant
being either a hydrocarbon material or a fragment of the manufacturer's technician's
chemical gloves", and the shell fire was "due in part to its extreme thinness since
thinner metals have been shown to be more flammable" **[A]**. *Engineering lesson:*
manufacturing contamination is an ignition source, and no field discipline could
remove a contaminant sealed inside the canister — cleanliness is a supply-chain
property. Thin stainless *burned*, not melted. The containment was the fuel: the
casing was the next link in the kindling chain.

**Aluminium medical oxygen regulators, 1990s — high-pressure GOX.** *What happened:*
WHA investigated 11 regulator fires, and the FDA received reports of 17 fires between
1993 and 1999 involving aluminium regulators on portable cylinders. At Boone, North
Carolina on 6 October 1995, "flames and molten slag from the regulator erupted from
the carrying case and engulfed the upper torso of the EMT who was carrying it"
`[WHA-REGULATORS]` **[B]**. *Why:* four mechanisms across the set, all already on the
canonical list — heat of compression as the cylinder valve is first opened, contaminant
ignition, particle impact (identified at Boone), and promoted ignition propagating
downstream. All 11 were primarily aluminium, igniting at pressures as low as 25 psi
where brass resists to 10,000 psi **[B]**, agreeing closely with the independent NASA
data in §1. *Engineering lesson:* the most encouraging case here, because the loop
closed — the investigations produced **ASTM G175** `[ASTM-G175]` **[A]**, which tests
**fault tolerance**: whether a regulator survives an ignition event, not merely whether
it avoids one. WHA report no new incidents involving regulators meeting G175 **[B]**.

**Industrial valve fires — high-pressure, high-velocity GOX.** A 300 mm butterfly valve
is reported to have ignited during pipeline start-up, killing three people, after
operators used pipe tongs on a stuck valve `[LAUTKASKI-2008]`. **The bibliographic
record is [A]; the description comes from a search summary, not the paper, and is
[C]** — obtain the paper before teaching it as fact. If it holds, the lesson is clean:
forcing a stuck valve supplies exactly the elements of galling and friction, while
start-up supplies the rapid pressurisation and the particle-laden first flow. To build
an incident library properly the route is ASTM G145 `[ASTM-G145]` and the ASTM
*Flammability and Sensitivity of Materials in Oxygen-Enriched Atmospheres* STP series
`[ASTM-STP-OXYGEN]`, not general web sources.

---

## 7. Why oxygen systems carry special paperwork

An **oxygen compatibility assessment** is a formal review product, not a folder of
datasheets. NASA/TM-2007-213740 states its own authority basis: an assessment "as
required by NASA-STD-6001 and NASA-STD-6016 shall be performed on each component"
**[A]**. Its seven steps: determine worst-case operating conditions; assess material
flammability; evaluate the presence and probability of ignition mechanisms; determine
the **kindling chain**; analyse the **reaction effect**; identify the **history of
use**; report the results.

The kindling chain is what separates an assessment from a materials checklist:
ignition of a polysulfone seat can release enough energy to ignite the stem, which can
ignite the body, "and result in a burn-through of the component" — and NASA's rule is
that "if a component could be breached, a kindling chain is present" **[A]**. The
governing default: if flammability is unknown, or materials are not yet selected, the
material is treated as flammable **[A]**.

What a reviewer looks for:

- A **system flow schematic** and a **cross-sectional drawing of each component**
  showing configuration and materials — mandatory deliverables, and the reason the
  Shuttle drill point was findable at all.
- **Worst-case** operating conditions, including cleanliness level, not nominal ones.
- A **mechanism-by-mechanism walk**, so "not possible" is justified by a missing
  characteristic element rather than by optimism.
- A **hazard control table**: component, ignition hazard, probability rating, reaction
  effect, recommendation, mitigated effect, status.
- **Cleanliness documentation** travelling with the part — specified level and
  standard, who cleaned it, quantitative NVR and particle results, packaging and
  preservation evidence, re-cleaning triggers after assembly or proof test.
- Evidence that the test data justifying a material is **applicable to this
  configuration**; the TM makes consulting the Materials and Processes organisation a
  "shall".

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
The commonest failure in an oxygen review is not a wrong answer. It is a question
never asked, because a line was drawn as "inert service, nitrogen only" and later
revised to GOX without re-running the assessment. Apollo 1's Board found the same
shape of error: a hazardous configuration classified as not hazardous, and therefore
given no hazard controls.
</div>

---

## Checkpoint quiz

1. A colleague says: "We're purging with GOX instead of GN₂, so the methane detector's
   5 % alarm gives us less warning now." Is the reasoning right? What *does* change,
   and by how much?

2. Name the three characteristic elements of **rapid pressurization** and a control
   that removes each. Which single design change removes this mechanism *and* one
   other from the canonical list?

3. A dead-ended GOX line sits at 14.7 psia and 20 °C. A valve from a 1,000 psia supply
   opens in about 0.2 s. Compute the theoretical maximum gas temperature at the dead
   end (*n* = 1.4), then say in one sentence what that number does and does not
   license you to conclude.

4. Which of these deserve a formal oxygen compatibility assessment, and why?
   (a) A stainless ball valve in a 400 psi GOX line. (b) A Monel needle valve in the
   same line. (c) An aluminium bracket clamping a LOX line, outside the wetted
   boundary. (d) A PTFE-seated check valve in a 300 psi GOX line, six years in service.
   (e) A carbon-steel GN₂ purge line that the latest P&ID revision re-tagged as GOX.

5. Two students summarise the Mir SFOG fire. One says "the stainless casing melted
   through", the other "the casing burned". Which is right, what evidence supports it,
   and which of Davis's generalised rules does the incident illustrate?

<details>
<summary>Show answers</summary>

1. **Wrong at the lean end, and badly understated at the rich end.** The lower limit is
   essentially unchanged by enrichment — methane moves only from 5.0 % to 5.15 %
   `[USBM-503]` **[A]** — so the 5 % alarm gives the same warning it always did. What
   changes is the **upper** limit, 15 % in air to **60.5 %** in oxygen, roughly a
   fourfold widening, because without nitrogen as thermal ballast a very rich mixture
   still holds flame temperature. There is no longer a "too rich to burn" region to
   fall back on. The larger change is not gas-phase at all: the seals, insulation and,
   above threshold, the metal around the leak are now fuels.

2. **Elements:** rapid pressurization, generally under 1 s; an exposed nonmetal close
   to the dead end; a pressure ratio producing a compression temperature above the
   nonmetal's situational AIT. **Controls, in order:** slow- or metered-opening valve,
   or an upstream restricting orifice; move soft goods out of the dead-end zone, or
   metal-to-metal seating; lowest usable pressure, and avoid pressurising from
   atmospheric, since it is the *ratio* that matters. **Eliminating the dead-ended
   leg** (no capped tees, no unused ports) kills this mechanism and simultaneously
   removes the closed-end cavity that **resonance** requires.

3. Ratio = 1,000 / 14.7 = 68.0; *T*_f = 293.15 × 68.0^0.2857 ≈ **979 K, about 706 °C
   (1,300 °F)**. It licenses only this: the mechanism **cannot be ruled out**, since
   the theoretical peak is far above the ~300 °C working AIT convention, so the design
   must address it. It does not license concluding that ignition will occur or that any
   margin exists — the isentropic result assumes no heat loss and infinite speed, and
   NASA's G74-consistent testing found no ignition below 275 psia upstream even though
   the equation predicts 404 °C there. Qualification comes from testing the actual
   configuration per ASTM G74.

4. **(a), (b), (d) and especially (e) do; (c) largely does not.** (a) Stainless
   sustains combustion from about 250 psi, so at 400 psi the body is flammable, and a
   ball valve also generates particles by rotating a seal against a seat and opens
   fast. (b) Monel is the burn-resistant choice, but the assessment is not about the
   body alone — seat, seals, cleanliness level, velocity and dead volumes are all in
   scope, and unknown flammability defaults to flammable; a good material choice
   reduces the reaction effect, it does not remove the requirement. (c) Outside the
   wetted boundary, aluminium as structure is normal practice, the same logic that
   permits composite-overwrapped oxygen tanks; the real question is whether the drawing
   defines that boundary correctly and whether a credible spill would wet it. (d) PTFE
   is a comparatively good oxygen nonmetal, but six years of cycling is the setup for
   **flow friction**, a degraded-condition mechanism with no laboratory test method
   that has nonetheless caused many real fires — so assess the worn condition, not the
   as-new one. (e) The most urgent: a service change from GN₂ to GOX invalidates every
   assumption behind the original design — material selection, cleanliness, velocity
   limits, dead legs. This is the Apollo 1 error in miniature, a hazard classification
   that no longer matches the contents.

5. **It burned.** Graf's account of the NASA-assisted investigation says the unit
   "failed having burned through the thin stainless steel wall… the stainless steel was
   actually burning in the high temperature oxygen stream", and that this was "due in
   part to its extreme thinness since thinner metals have been shown to be more
   flammable" `[GRAF-OXYGEN-CANDLES]` **[A]**. "Melted" is the wrong mental model
   because it casts the casing as a passive victim of heat; it was a participant, a
   fuel in the kindling chain. The rule is Davis's fourth: **smaller thickness means
   easier ignition and faster burning; thicker is safer** — the one generalised rule
   that runs against intuition, and one that creates a real design tension, since less
   material also means less fuel.

</details>
