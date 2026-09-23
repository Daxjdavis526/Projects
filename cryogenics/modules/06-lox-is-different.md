# Module 06 — LOX Is Different

*Roughly 30 minutes. Prerequisite: Module 05.*

Everything else in this course is about cold. This module is about the one fluid where cold
is the *second* problem. Liquid oxygen does not burn and has no flammable range of its own,
and it has still killed more people in propulsion than any fuel on the pad. A stainless
valve body is inert plumbing in a nitrogen system and a fuel in an oxygen system.

## What you'll be able to do

- State how enrichment changes a flammable range, and why "everything ignites sooner" is
  wrong at the lean end.
- Name NASA's ignition mechanisms and the elements a design must remove.
- Work the adiabatic-compression relation and explain why it is a screening bound.
- Say what "oxygen clean" means as a specified, verified, documented condition.
- Explain why "is this part oxygen compatible?" is unanswerable without the configuration.
- Recognise which items deserve a formal compatibility assessment.

---

## 1. Oxygen is not a fuel. It is a change of rules.

Oxygen does not burn: no flammability limits, no autoignition temperature, no heat of
combustion. Every hazard here belongs to some *other* material — a seal, a lubricant, a wire
insulator, a valve body — that becomes capable of things it could not do in air.

Correct the intuition most engineers arrive with. Enrichment does not lower the
concentration at which a leak becomes flammable: the lower limits in oxygen "are essentially
the same as those in air" `[USBM-627]` **[A]**. What moves — enormously — is the rich
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
    <text x="406" y="95" text-anchor="end">5.15 – 60.5 %</text>
    <text x="493" y="140">4 – 75 %</text>
    <text x="572" y="175" text-anchor="end">4.65 – 93.9 %</text>
  </g>
  <path d="M185 34 L185 24 L413 24 L413 34" fill="none" stroke="var(--warn)" stroke-width="1.5"/>
  <text x="299" y="18" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)" text-anchor="middle">the rich limit is what opens — ×4 for methane</text>
</svg>
<figcaption>Figure 6.1 — Flammable ranges in air and in pure oxygen, from Bureau of Mines Bulletin 503, measured on the same apparatus by the same investigators <code>[USBM-503]</code>. Confidence A. The left-hand edges barely move. The right-hand edges are the story.</figcaption>
</figure>

A flame must release heat faster than it loses it. In air, four molecules in five are inert
nitrogen soaking up that heat, so above about 15 % methane the mixture is too fuel-heavy to
carry flame. Remove the ballast and a 60 % mixture still burns: an oxygen-enriched space is
flammable across most of the composition range. That is the gas-phase half; the bigger half
is that non-fuels become fuels.

**Burn rate.** NASA MSFC data per ISO 14624-1, in `[NASA-DAVIS-2012]` **[A]**: a
polyester-based foam at **23 % oxygen** burns 1.3 in and self-extinguishes, at 0.07 in/s; at
**25 % oxygen** the same foam is consumed over the whole 12 in specimen at 0.67 in/s. Two
percentage points take a material from self-extinguishing to fully consumed, tenfold faster.

**Metals.** From the same source's promoted-ignition (ASTM G124 `[ASTM-G124]`) and
impact (ASTM G86 `[ASTM-G86]`) data, pressures below which self-sustained burning is on
average not sustained **[A]**:

| Material | Sustains combustion in GOX above |
|---|---|
| Magnesium, titanium | below ambient |
| Aluminium 6061 | ambient |
| **Aluminium 4043** | **burns at 25 psi** |
| **Stainless 304L** | **250 psi** |
| Stainless 316, 17-4 | 400 psi |
| **Monel, nickel, copper, brass** | **10,000 psi — top of range** |

Davis's caveat travels with the table: "for comparison purposes only, not to be considered
standard values." The same metal scores differently in different tests — 304L sustains
burning at 250 psi but resists *impact* ignition to 10,000 psi — so a compatibility
pressure quoted without naming the test is meaningless. And LOX is not merely cold GOX:
aluminium 2219's impact threshold is 1,500 psi in GOX, **50 psi in LOX** **[A]**.

<div class="box remember"><span class="lbl">Remember this</span>
<b>304L stainless sustains combustion in oxygen at 250 psi</b> — an ordinary pressure in a
cryogenic propulsion system. Stainless is not "oxygen-safe"; it is a material with a
threshold. Monel, nickel, copper and brass resist to the 10,000 psi top of the test range,
which is why NASA's worked hazard control is "change the valve body from stainless steel to
Monel" <b>[A]</b>.
</div>

**Where the evidence stops.** No citable air-versus-oxygen comparison of ignition energy,
autoignition temperature or flame temperature could be found in the oxygen-safety
literature, and `properties.md` §14.7 marks the circulated MIE figures **[C]**. EIGA has
ignition energy "much lower" and flame temperature higher in oxygen `[EIGA-04]` **[A]**:
the direction is authoritative, the magnitudes are not.

---

## 2. Ignition mechanisms, and the method that goes with them

NASA/TM-2007-213740, by **Rosales, Shoffstall and Stoltzfus (2007)**, is the backbone
document `[NASA-TM-2007-213740]`. (It is frequently miscited to Stoltzfus and Beeson;
Harold Beeson edited ASTM MNL36, a different document.) Its Table 1 lists **17**
mechanisms in NASA's own naming: **Particle Impact · Rapid Pressurization · Flow Friction ·
Resonance · Mechanical Impact · Galling and Friction · Fresh Metal Exposure · Static
Discharge · Electrical Arc · Chemical Reaction · Thermal Runaway**, plus six external heat
sources grouped as "Other" — lightning, explosive charges, open flames, bursting-vessel
fragments, welding, engine exhaust. **[A]**

The method matters more than the list:

> "For ignition mechanisms to be effective, certain elements must be present… **If any
> characteristic element is not present, the ignition mechanism is unlikely to occur.
> Conversely, if all the characteristic elements are present, ignition is possible.**"
> — `[NASA-TM-2007-213740]` §4.3 **[A]**

You do not hunt for the spark. You walk each mechanism and ask which required element
the design has removed.

<figure>
<svg viewBox="0 0 700 330" role="img" aria-label="Map of three ignition mechanisms. Each row shows the mechanism on the left, its required characteristic elements in the centre, and the design control on the right. Removing any one required element removes the mechanism.">
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

**Particle impact** is the most effective igniter of *metals*, and NASA's test footnote is
the best argument for cross-sectional drawings. A fixture simulating the Shuttle oxygen flow
control valve, Inconel 718 at 600 K and 4,600 psig, **ignited on the second test** with a
drill point downstream of the orifice and **did not ignite in 40 tests** with the drill
points removed and the impact angle at 45° **[A]**. One geometric feature.

**Flow friction**, heat from oxygen flowing across a polymer, is the one NASA admits it
does not understand — no laboratory method reproduces it, yet "it has caused a significant
number of real-life fires" **[A]**. Being a *degraded-condition* mechanism, throttling
across a seat damaged by cycling, an as-new review misses it.

**Resonance** is a sonic jet into a closed-end cavity heating the gas there — the geometry
used deliberately as a **rocket igniter** **[A]**, appearing accidentally as a capped tee
downstream of a valve. **Thermal runaway** is slower still, fines or char self-heating over
"hours, days, or months" **[A]** — a system can pass every commissioning test and ignite
weeks later.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
A ball valve is chosen for a GOX line because it is quick and cheap. It opens in a quarter
turn (rapid pressurization), rotates a seal against a seat every cycle (particles), can
chatter if mis-sized (mechanical impact, friction), and the line ends in a capped test port
(dead end, plus resonance). One decision, four mechanisms.
</div>

---

## 3. Adiabatic compression: ideal against real

Drive gas rapidly into a dead-ended volume and it is compressed faster than it can shed
heat to the walls. The compression work goes into internal energy, and the gas at the
closed end heats in proportion to the **pressure ratio**, not the pressure difference.
NASA's relation, symbols as the TM defines them **[A]**:

$$T_f = T_i \left(\frac{P_f}{P_i}\right)^{(n-1)/n}, \qquad n = 1.4 \text{ for oxygen}$$

**Worked example — the assumptions do the work.** Ideal gas; constant *n* = 1.4;
isentropic, so no heat into the wall; compression fast relative to the gas volume's thermal
time constant; dead-ended line initially at **20 °C and 14.7 psia**. From a **3,000 psi**
supply the ratio is 204:

$$T_f = 293.15 \times 204.1^{0.2857} \approx 1{,}340\ \text{K} \approx 1{,}070\ ^\circ\text{C}\ (1{,}950\ ^\circ\text{F})$$

No spark, no external heat, no contamination — a valve opening quickly, and a temperature
at which steel glows.

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
  <text x="34" y="207" font-family="system-ui, sans-serif" font-size="13" fill="var(--ok)">Empirical bound (ASTM G74 testing): below 275 psia upstream, with downstream at</text>
  <text x="34" y="227" font-family="system-ui, sans-serif" font-size="13" fill="var(--ok)">ambient or above, the real temperature rise is too small for ignition to occur.</text>
</svg>
<figcaption>Figure 6.3 — The classic hazard, and the number that bounds it. Equation and the 275 psia finding from <code>[NASA-TM-2007-213740]</code> (Confidence A); the 1,070 °C figure is computed here from that equation under the stated assumptions.</figcaption>
</figure>

Now the part that teaches something. The TM also reports that "extensive testing in a
system consistent with ASTM G74 has demonstrated that for **initial upstream pressures
less than 275 psia**… the actual temperature rise (with real heat loss) is too small for
ignition to occur" **[A]** — yet the equation gives 275 psia a theoretical 404 °C, above
the 300 °C minimum AIT EIGA uses as a working convention for nonmetals `[EIGA-04]` **[B]**.

Both are correct, and the gap is the lesson. The isentropic result is an **upper bound**:
real compressions lose heat to the wall and the seat, take finite time, and mix, and
ignition needs energy delivered long enough to carry a real polymer through its ignition.
Which is why **ASTM G74-13(2021)** is a *test*, reporting a median failure pressure or an
ignition-probability curve, not a formula `[ASTM-G74]` **[A]**.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
The compression equation tells you when you <b>cannot rule the mechanism out</b>. It never
tells you a design is safe; qualification comes from testing the actual configuration — a
screen that opens a question, not an answer that closes one.
</div>

A fast-opening valve into a dead-ended line supplies all three elements at once: sub-second
pressurisation; an exposed nonmetal at the temperature peak, since a dead end is almost
always a component and components contain polymers; and the worst possible ratio, the line
having sat at atmospheric. Eliminating the dead leg removes this mechanism *and* the
resonance geometry together. No pressurisation-rate limit is printed here — none could be
verified from a primary standard **[C]**. Slow-opening valves are the recognised control.

---

## 4. Cleanliness is a fire-prevention measure

"Oxygen clean" is not "visually clean". It is a **specified, verified and documented level
of freedom from contaminants that could act as fuel or as an ignition initiator**, matched
to the system's pressure, concentration and geometry — and NASA makes "determine the
worst-case cleanliness level of each component" a required step of the assessment **[A]**.

Two contaminant families. **Nonvolatile residues** — oils, greases, and the classics found
in investigations: thread lubricants, crayon, paint — are dominated by adiabatic
compression, a low-AIT fuel film sitting where the compression peak occurs. EIGA: oil and
grease ignition "often causes a chain reaction that finally results in metal burning or
melting" `[EIGA-04]` **[A]**. **Particulates** feed particle impact, and cleanliness removes
the entrained particles — the only element of that mechanism still controllable once the
geometry is frozen.

The governing documents are **ASTM G93/G93M-25**, *Standard Guide for Cleanliness Levels
and Cleaning Methods for Materials and Equipment Used in Oxygen-Enriched Environments*
`[ASTM-G93]` **[A]**, and **CGA G-4.1, 7th edition (2018)**, *Cleaning of Equipment for
Oxygen Service* `[CGA-G-4.1]` **[B]**. The 2025 revision made G93 a *Guide* rather than a
*Practice*, replacing prescribed levels with selection from a documented risk analysis
**[B]** — so material treating it as prescriptive is out of date.

Verification is quantitative or it is not verification. **Nonvolatile residue (NVR)** is
the mass left after a solvent extract from a defined area is evaporated, reported per
unit area (ASTM G120, G136, G144 `[ASTM-NVR-METHODS]` **[A]**); **particle counts** are
counts by size band with a maximum permitted size. Visual and UV inspection catch only
gross contamination — screening, not verification **[B]**.

<div class="box"><span class="lbl">Worth knowing</span>
Cleanliness is a lifecycle property: G93's 2025 edition spans procurement, cleaning,
verification, packaging and assembly, every one a place it is lost, so a purchase order
should carry a level <i>designation</i>, not the adjective "clean". Cleaning has its own
hazards — LANL warns that non-volatile cleaning agents can remain in trapped spaces
<code>[LANL-OXYGEN-GUIDE]</code> <b>[A]</b>.
</div>

Cleaning is work for trained personnel following an approved procedure; this module teaches
what it accomplishes, not how to do it.

---

## 5. Materials, lubricants, and why the question is malformed

Hydrocarbon oils and greases are the archetypal wrong answer: low autoignition
temperatures, high heats of combustion, and — as films in crevices and at dead ends — the
position that maximises both ignition probability and heat delivery into surrounding metal.
EIGA's rule is categorical, down to the specific that oxygen pressure gauges "shall not be
tested or calibrated in contact with oil" `[EIGA-04]` **[A]**; a lubricant, where
unavoidable, is used in the smallest workable amount, since "lubricants become contaminants
if they enter into the oxygen stream" **[A]**.

The classes used are **nickel alloys, copper, brass and bronze** among metals — harder to
ignite, burning with the lowest heats of combustion **[A]** — and **fluoropolymers and
fluorinated (PCTFE-type) lubricants** among nonmetals, the best impact thresholds in the
data **[A]**. Avoid magnesium, titanium and many aluminium alloys, and carry the
counterweight: fluorinated materials can produce toxic combustion products **[A]**.
Composites are permitted outside the wetted boundary — a composite-overwrapped tank is the
example — which makes "where is the wetted boundary?" a safety-critical drawing question.

**Compatibility is configuration-dependent.** The same material changes verdict along four
axes, each evidenced above:

1. **Pressure** — 304L is acceptable below 250 psi and sustains combustion above.
2. **Thickness and geometry** — thin sections and finely divided forms (mesh, sintered
   filters) are far more flammable than bulk metal **[A]**.
3. **Velocity and impingement angle** — the Shuttle valve burned on test two with a drill
   point and survived 40 tests at 45°.
4. **What it is paired with** — aluminium is routine, but aluminium *sheared against PCTFE*
   is a chemical-reaction ignition mechanism **[A]**.

Which is why "is this part oxygen compatible?" has no answer: without the pressure,
concentration, temperature, velocity, geometry and neighbouring materials there is nothing
to assess. Davis: compatibility "cannot be determined by similarity to other materials whose
properties are known… Testing, and not evaluation, is the only method by which safe
materials can be chosen" **[A]**.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
The promoted-ignition test is so severe that most industry-standard oxygen materials —
stainless included — fail it at their working pressures, and seal materials fail outright.
<b>The oxygen compatibility assessment exists precisely because a materials lookup returns
"fail" for almost everything real systems are made of.</b> It is the discipline of using
flammable materials safely by removing ignition mechanisms.
</div>

---

## 6. Incidents, classified by environment

Mechanisms differ by phase and environment. Most documented oxygen fire literature is GOX
and enriched-atmosphere work; only the second case here involves cryogenic oxygen.

**Apollo 1 / AS-204, 27 January 1967 — oxygen-enriched atmosphere.** *What happened:* fire
broke out in the Command Module during a plugs-out test and killed the three-man crew
`[APOLLO-204-BOARD]` **[A]**. *Why:* the test ran at "16.7 pounds per square inch absolute,
100-percent oxygen atmosphere", judged "extremely hazardous" by the Board; arcs were
evidenced but no single ignition source identified, and the module "contained many types
and classes of combustible material in areas contiguous to possible ignition sources"
**[A]**. *Lesson:* enrichment, pressure and fuel load together are the hazard, and the
ignition source did not need identifying — with arcs credible and the fuel load
uncontrolled, fire was a matter of time. A configuration classified as non-hazardous also
receives no hazard controls **[B]**.

**Apollo 13 oxygen tank 2, 13 April 1970 — cryogenic oxygen pressure vessel.** *What
happened:* seconds after current reached the tank 2 fans, telemetry was lost, the main bus
undervolted, and the tank burst `[ANDERSON-APOLLO13]` **[A]**. *Why — the chain:* the
tank's thermostatic switches were rated **28 V dc**, but during tanking tests at KSC the
heaters ran on **65 V dc ground support equipment** and the switches failed to open —
qualification "did not test the ability at any point for the switches to operate at
65 V dc." Uncut-off, the heaters may have reached **1,000 °F** during detanking, destroying
the **Teflon insulation** on wiring inside the tank. When the fans were powered, "the
current flow generated a spark which ignited oxygen in the tank" **[A]**. *Lesson:*
textbook electrical-arc ignition — NASA's guide gives almost word for word an insulated
heater element arcing through its sheath to combustible material. The mechanism was
catalogued; the tank still carried powered electrics immersed in oxygen. Interface voltage
is a safety parameter, untested protection is not protection, and the damage was latent.

**Mir SFOG / Vika, 24 February 1997 — chemically generated hot GOX.** *What happened:* a
lithium perchlorate oxygen generator "failed having burned through the thin stainless steel
wall… the stainless steel was actually burning in the high temperature oxygen stream"
`[GRAF-OXYGEN-CANDLES]` **[A]**. *Why:* the unit "was probably contaminated
during manufacture… either a hydrocarbon material or a fragment of the manufacturer's
technician's chemical gloves", and the shell fire was "due in part to its extreme thinness"
**[A]**. *Lesson:* no field discipline removes a contaminant sealed inside the canister, so
cleanliness is a supply-chain property; and thin stainless *burned*, the containment
becoming the next link in the kindling chain.

**Aluminium medical oxygen regulators, 1990s — high-pressure GOX.** *What happened:* WHA
investigated 11 regulator fires, and the FDA logged 17 from 1993 to 1999 on portable
cylinders; at Boone, North Carolina in 1995 "flames and molten slag from the regulator
erupted from the carrying case and engulfed the upper torso of the EMT" `[WHA-REGULATORS]`
**[B]**. *Why:* four mechanisms across the set, all on the canonical list — heat of
compression as the valve is opened, contaminant ignition, particle impact (identified at
Boone) and promoted ignition downstream — in units built of aluminium, which ignites as low
as 25 psi where brass resists to 10,000 psi **[B]**. *Lesson:* the loop closed here, in **ASTM G175** `[ASTM-G175]` **[A]**, which tests **fault
tolerance** — whether a regulator survives an ignition event, not merely avoids one.

**Industrial valve fires — high-pressure, high-velocity GOX.** A 300 mm butterfly valve is
reported to have ignited during pipeline start-up, killing three people, after operators
used pipe tongs on a stuck valve `[LAUTKASKI-2008]`. **The bibliographic record is [A]; the
description comes from a search summary and is [C]** — obtain the paper before teaching it
as fact. If it holds, forcing a stuck valve supplies the elements of galling and friction
while start-up supplies the particle-laden first flow. For an incident library, start at
ASTM G145 `[ASTM-G145]`.

---

## 7. Why oxygen systems carry special paperwork

An **oxygen compatibility assessment** is a formal review product, not a folder of
datasheets: NASA/TM-2007-213740 states that one "as required by NASA-STD-6001 and
NASA-STD-6016 shall be performed on each component" **[A]**. Its seven steps: worst-case
conditions; material flammability; ignition mechanisms; the **kindling chain**; the
**reaction effect**; the **history of use**; the report. The kindling chain separates an
assessment from a materials checklist — ignition of a seat can release enough energy to
ignite the stem, then the body, so "if a component could be breached, a kindling chain is
present" **[A]**.

What a reviewer looks for:

- A **system flow schematic** and a **cross-sectional drawing of each component** —
  mandatory deliverables, and the reason the Shuttle drill point was findable.
- **Worst-case** conditions, cleanliness level included, not nominal ones, and a
  **mechanism-by-mechanism walk**, so "not possible" rests on a missing element rather than
  on optimism.
- A **hazard control table**: component, hazard, probability, reaction effect, mitigation,
  status.
- **Cleanliness documentation** travelling with the part — level and standard, who cleaned
  it, quantitative NVR and particle results, re-cleaning triggers — plus evidence that the
  data justifying each material is **applicable to this configuration**.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
The commonest failure in an oxygen review is not a wrong answer but a question never
asked, because a line drawn as "inert service, nitrogen only" was later revised to GOX
without re-running the assessment — Apollo 1's error in miniature: a hazardous
configuration classified as not hazardous, and therefore given no controls.
</div>

---

## Checkpoint quiz

1. "We're purging with GOX instead of GN₂, so the methane detector's 5 % alarm gives us
   less warning." Is that right? What *does* change?

2. Name the three characteristic elements of **rapid pressurization** and a control that
   removes each. Which single design change removes this mechanism *and* one other?

3. A dead-ended GOX line sits at 14.7 psia and 20 °C; a valve from a 1,000 psia supply
   opens in about 0.2 s. Compute the theoretical maximum gas temperature at the dead end
   (*n* = 1.4), then say what that number does and does not license.

4. Which of these deserve a formal oxygen compatibility assessment, and why?
   (a) A stainless ball valve in a 400 psi GOX line. (b) A Monel needle valve in the same
   line. (c) An aluminium bracket clamping a LOX line, outside the wetted boundary. (d) A
   PTFE-seated check valve in a 300 psi GOX line, six years in service. (e) A GN₂ purge line
   that the latest P&ID revision re-tagged as GOX.

5. Two students summarise the Mir SFOG fire. One says "the casing melted through", the
   other "the casing burned". Which is right, on what evidence, and which of Davis's
   generalised rules does the incident illustrate?

<details>
<summary>Show answers</summary>

1. **Wrong at the lean end.** The lower limit barely moves — methane goes from 5.0 % to
   5.15 % `[USBM-503]` **[A]** — so the alarm warns as it always did. The **upper** limit
   goes from 15 % to **60.5 %**, because without nitrogen as ballast a rich mixture still
   holds flame temperature. The larger change is not gas-phase: the seals, insulation and,
   above threshold, the metal are now fuels.

2. **Elements:** pressurisation under 1 s; an exposed nonmetal close to the dead end; a
   pressure ratio taking the gas above that nonmetal's situational AIT. **Controls:** a
   slow-opening valve or upstream orifice; soft goods moved out of the dead-end zone; the
   lowest usable pressure, since it is the *ratio* that matters. **Eliminating the
   dead-ended leg** also removes the cavity **resonance** requires.

3. Ratio = 68.0; *T*_f = 293.15 × 68.0^0.2857 ≈ **979 K, about 706 °C**. One conclusion
   follows — the mechanism **cannot be ruled out**, the peak being far above the ~300 °C
   working AIT convention. It does not license claiming ignition will occur: the isentropic
   result assumes no heat loss, and G74-consistent testing found no ignition below 275 psia
   upstream even where the equation predicts 404 °C.

4. **(a), (b), (d) and especially (e) do; (c) largely does not.** (a) Stainless sustains
   combustion from about 250 psi, so the body is flammable at 400 psi, and a ball valve
   generates particles and opens fast. (b) Monel is the burn-resistant choice, but the
   assessment also covers seat, seals, cleanliness and velocity, and unknown flammability
   defaults to flammable — good material lowers the reaction effect, it does not remove the
   requirement. (c) Outside the wetted boundary aluminium as structure is normal practice;
   the only question is whether the drawing defines that boundary correctly. (d) Six years
   of cycling on a soft seat is the setup for **flow friction** — assess the worn condition. (e) The most urgent: a
   service change to GOX invalidates material selection, cleanliness and velocity limits
   alike.

5. **It burned.** Graf has the unit "burned through the thin stainless steel wall… the
   stainless steel was actually burning in the high temperature oxygen stream", "due in part
   to its extreme thinness" `[GRAF-OXYGEN-CANDLES]` **[A]**. "Melted" casts the casing as a
   passive victim of heat; it was a participant, a fuel in the kindling chain. The rule is
   Davis's fourth: **thinner is easier to ignite; thicker is safer**.

</details>
