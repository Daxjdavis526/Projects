# Module 07 — Liquid Methane & Methalox Facilities

*Roughly 25 minutes. Prerequisite: Module 06.*

A LOX facility has one propellant that makes everything else burn. A methalox
facility has that, plus a fuel of its own, plus every place the two can meet: a
shared trench, a shared purge manifold, a low spot where both drain. NASA's own
position in 2023 was that guidance for assessing the explosive hazard of LOX with
liquefied natural gas was *interim* `[NASA-NESC-LOXLNG]`. That is not a
comfortable sentence, and it is the honest starting point.

## What you'll be able to do

- State why methane beat hydrogen and kerosene, in numbers, and what each
  argument costs on the ground.
- Explain the 0.507 K margin between LOX's boiling point and methane's freezing
  point, and name the hardware it constrains.
- Predict where a cold methane cloud goes, and site combustible-gas detectors and
  oxygen monitors for different physical reasons.
- Say what triggers hazardous area classification and what it then drives.
- Walk the LN₂ → LOX → methalox ladder and name what changes at each rung.

---

## 1. Why methane

NASA's framing: LOX/methane "can provide a specific impulse during space flight
of up to 321 seconds; it is clean-burning, non-toxic, and cryogenic, but
space-storable," with in-situ production possible on planetary surfaces
`[NASA-MORPHEUS-LESSONS]`.

**Density.** Liquid methane is **423 kg/m³**, against **71** for LH₂ and **808**
for RP-1 `[NASA-CHEN-ISRU]` — six times denser than hydrogen, half as dense as
kerosene. For a fixed fuel mass the tank is about one sixth of a hydrogen tank
and twice an RP-1 tank, which sets the inventory a facility must site, relieve
and separate. The criterion worth carrying from that trade study: it is Isp
*combined with* bulk density that decides, not Isp alone.

**Storability.** Hydrogen lost on mass, not Isp — boil-off, tank volume and pump
complexity "resulted in a high spacecraft dry mass and cost which offset the high
specific impulse" `[NASA-HURLBERT-2016]`. LOX and methane sit at **90–120 K** in
equilibrium with deep space: no heaters, no active cooling.

**Coking and cleanliness.** A propellant must "avoid thermal decomposition and
coking in engine coolant channels" `[NASA-CHEN-ISRU]`, and NASA's repeated
"clean burning, non-sooting" `[NASA-HURLBERT-2016]` is the citable contrast with
RP-1 — though no NASA source giving a side-by-side coking *rate* was found for
this course, so treat specific pyrolysis numbers as unverified. Operationally,
non-toxic propellants "enable rapid loading, testing, and turnaround operations"
with no hazardous loading offsite `[NASA-HURLBERT-2016]`. Methalox deletes the
SCAPE suits and scrubbers of hypergolics and substitutes cryogenic and
flammable-gas problems. A trade, not a free win.

**Mars ISRU.** Human-Mars architectures point to "an oxygen-methane economy"
built on ISRU commodities `[NASA-IPP]`; a ~95 % CO₂ atmosphere plus regolith
water makes both propellants producible in place `[NASA-CHEN-ISRU]`.

**Thermal proximity.** LOX boils at 90.1875 K, methane at 111.667 K
`[NIST-FLUIDS]` — close enough that a common bulkhead avoids the brutal gradient
of a LOX/LH₂ one. Hold that thought: the same proximity puts a fuel and an
oxidiser one wall apart.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
Methane boils nearer to ambient than LOX, so the methane tank has lower heat leak
and less boil-off than the LOX tank beside it — but its vent gas is flammable,
which the LOX and LN₂ vent gas is not. Boil-off becomes a smaller thermal problem
and a larger hazard problem.
</div>

## 2. How cold methane behaves

**Two-phase flow is a normal regime, not a fault.** Every line starts warm and
runs two-phase until cold: vapour slugs, unstable flow, transient pressure and
thermal loads, unreliable metering. NASA built dedicated conditioning rigs for it
`[NASA-PCFS]`. Reliefs, restraints, supports and instrument ranges are designed
for that regime.

**Weathering and rollover are LNG phenomena.** Weathering is compositional drift
as lighter components boil off first; rollover is the sudden inversion of a
stratified tank, releasing vapour at many times the normal boil-off rate.
Rocket-grade methane is high-purity and single-component, so it does not weather
and a run tank is a poor rollover candidate. They still earn their place: NASA's
Morpheus consumables were "liquid oxygen, **liquefied natural gas**, helium,
liquid nitrogen, and gaseous nitrogen" `[NASA-MORPHEUS-LESSONS]`, so mixture
behaviour was live there; purity is also a combustion variable `[NASA-IGNITER]`;
and the general lesson holds everywhere — **relief sizing must consider credible
upset vapour-generation rates, not just steady heat leak.**

**The margin.** Methane's triple point is **90.6941 K**, oxygen's normal boiling
point **90.1875 K** `[NIST-FLUIDS]`; Chen's trade table independently lists
methane freezing at 90.8 K `[NASA-CHEN-ISRU]`.

<div class="box remember"><span class="lbl">Remember this</span>
<strong>Methane freezes 0.507 K above the boiling point of LOX.</strong> A
methane-side surface in contact with boiling LOX is, in principle, below the
methane freezing point — and subcooling the LOX or dropping its pressure only
widens the gap.
</div>

Three designs are constrained by it. A **LOX/methane heat exchanger** must be
de-rated: methane cooled against LOX condenses at 111.7 K, keeps cooling, and
freezes, so designers insulate to *retard* heat transfer — the opposite of normal
practice. **Densification** spends the same margin: the window between methane's
NBP and freezing is 21 K wide, and Chen's subcooled case sits at 101.7 K.
**Common bulkheads and common-walled downcomers** put the two fluids in thermal
contact across that half kelvin by design.

State it as the evidence supports: the property collision is certain, the
incident is not. No primary source reporting an actual methane-freezing event in
a methalox exchanger or bulkhead was found. This is a design constraint that
follows from property data, not a case study.

## 3. Flammability and ignition

| | Methane | Hydrogen |
|---|---|---|
| Flammable range in air | **5.0 – 15.0 %** `[USBM-627]` | 4.0 – 75.0 % |
| Flammable range in oxygen | **5.15 – 60.5 %** `[USBM-503]` | 4.65 – 93.9 % |
| Autoignition in air | **537 °C** `[USBM-627]`; 630 °C `[USBM-680]` | ~500–580 °C |
| Minimum ignition energy in air | ~0.28 mJ | ~0.017 mJ |
| NEC gas group | **D** | B |

The **narrow range in air** is methane's real advantage: a leak is more often
outside the window than in it, and ventilation can be designed against a
10-point band. The **rich limit in oxygen** deletes that advantage — the range
widens roughly fourfold `[USBM-503]` — while the lean limit barely moves. Oxygen
enrichment does not make a leak ignite *sooner*; it makes almost every mixture
ignitable.

The **AIT disagreement is a test-method artefact.** Use the value in the code you
work to, because the T-code in §6 depends on it; picking 630 °C where the AHJ
uses 537 °C is choosing the less conservative surface-temperature limit.

The **MIE comparison flatters methane and should not.** A human static discharge
is about 10 mJ — 35× methane's MIE. Neither margin is a margin; bonding,
grounding and ignition-source control are mandatory for both fuels. Methane's
flash point is **−188 °C** `[USBM-680]`: there is no temperature at which liquid
methane is not giving off ignitable vapour. And the limits are themselves
method-dependent — 15.0 % rich in a flammability tube, 15.8 % in a 120 L closed
vessel `[NIOSH-ZLOCHOWER]`. A flammability limit is a property of the gas *plus*
the vessel *plus* the criterion, never a line to operate up to.

## 4. Where the cloud goes

Cold methane vapour is **denser than air**, and matches ambient air's density
only at **164.25 K** — more than 52 K above its boiling point `[NIST-FLUIDS]`,
corroborated at 164.3 K by Sandia `[SANDIA-SFBREEZE]`. Below that it slumps and
spreads laterally, and it *resists* dilution, because gravity-driven slumping
suppresses the mixing that would entrain air.

<figure>
<svg viewBox="0 0 660 320" role="img" aria-label="Three-stage sequence of a cold liquid methane release: the cloud slumps to grade, fills a trench, and only lifts once it warms past 164.25 kelvin.">
  <text x="8" y="18" font-family="system-ui, sans-serif" font-size="14" fill="currentColor" font-weight="600">A cold methane release goes down before it goes up</text>

  <!-- panel A -->
  <rect x="8" y="34" width="205" height="180" fill="none" stroke="var(--muted)" stroke-width="1"/>
  <text x="18" y="52" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">1 · release, ~112 K</text>
  <line x1="18" y1="190" x2="203" y2="190" stroke="currentColor" stroke-width="1.5"/>
  <rect x="30" y="66" width="26" height="34" fill="var(--side)" stroke="var(--fuel)" stroke-width="2"/>
  <text x="30" y="62" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">LCH₄</text>
  <path d="M56 92 L84 120" stroke="var(--fuel)" stroke-width="2"/>
  <ellipse cx="112" cy="182" rx="52" ry="9" fill="var(--fuel)" opacity="0.35"/>
  <ellipse cx="112" cy="170" rx="40" ry="14" fill="var(--fuel)" opacity="0.2"/>
  <text x="18" y="207" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">vapour ≈1.45× air density</text>

  <!-- panel B -->
  <rect x="227" y="34" width="205" height="180" fill="none" stroke="var(--muted)" stroke-width="1"/>
  <text x="237" y="52" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">2 · slumps, fills low spots</text>
  <path d="M237 190 L300 190 L300 208 L342 208 L342 190 L422 190" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="300" y="192" width="42" height="16" fill="var(--warn)" opacity="0.4"/>
  <ellipse cx="330" cy="178" rx="78" ry="12" fill="var(--fuel)" opacity="0.3"/>
  <text x="285" y="228" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">trench = collection point</text>
  <text x="237" y="248" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">still &lt; 164.25 K — dense</text>
  <text x="237" y="264" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">and inside 5–15 % somewhere</text>

  <!-- panel C -->
  <rect x="446" y="34" width="205" height="180" fill="none" stroke="var(--muted)" stroke-width="1"/>
  <text x="456" y="52" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">3 · warms &gt; 164.25 K, lifts</text>
  <line x1="456" y1="190" x2="641" y2="190" stroke="currentColor" stroke-width="1.5"/>
  <path d="M500 180 L500 96" stroke="var(--fuel)" stroke-width="2" marker-end="url(#ar)"/>
  <path d="M548 180 L548 82" stroke="var(--fuel)" stroke-width="2" marker-end="url(#ar)"/>
  <path d="M596 180 L596 104" stroke="var(--fuel)" stroke-width="2" marker-end="url(#ar)"/>
  <ellipse cx="548" cy="178" rx="60" ry="10" fill="var(--fuel)" opacity="0.18"/>
  <text x="456" y="207" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">buoyant at last</text>
  <defs><marker id="ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
    <path d="M0 0 L8 4 L0 8 z" fill="var(--fuel)"/></marker></defs>

  <!-- temperature strip -->
  <line x1="30" y1="288" x2="630" y2="288" stroke="var(--muted)" stroke-width="1.5"/>
  <line x1="60" y1="282" x2="60" y2="294" stroke="var(--fuel)" stroke-width="2"/>
  <text x="34" y="310" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">111.7 K NBP</text>
  <line x1="330" y1="278" x2="330" y2="298" stroke="var(--warn)" stroke-width="2.5"/>
  <text x="256" y="272" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">164.25 K — buoyancy crossover</text>
  <line x1="600" y1="282" x2="600" y2="294" stroke="var(--muted)" stroke-width="2"/>
  <text x="558" y="310" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">293 K air</text>
</svg>
<figcaption>Figure 7.1 — The hazard lives in stage 2: cold enough to hug the ground, already diluted into the flammable band. Methane must warm more than 52 K above its boiling point before it will lift.</figcaption>
</figure>
Recognition criteria, not construction rules. **Low points are collection
points** — trenches, cable ducts, sumps, stairwells, below-grade rooms. **Grade
and drainage decide where the cloud runs before wind does.** **Buildings are
entered at grade**, through doorways, floor penetrations, cable entries and
low-level HVAC intakes. **Trenches are the specific trap**: they channel and
concentrate a dense cloud, they are hard to ventilate, and they hold exactly the
cabling and junction boxes that area classification exists to control.

On scale, conceptually: Sandia's LNG work is the reference body for large
releases, and its own caveat is the teachable part — dispersion is dominated by
site-specific terrain, weather and operations, and published distances serve for
"identifying the scale of hazards, not… defining hazard distances for a specific
site" `[SANDIA-LNG-SPILL]`. `[NFPA-59A]` (2026 edition) is the best-developed
design thinking about cryogenic methane — dispersion exclusion zones,
impoundment, spill containment, grading — but it governs LNG plants, not test
stands. Expect an AHJ to reach for it as precedent; do not assume it applies.

## 5. Detection and monitoring

- **Catalytic bead (pellistor):** burns gas on a heated bead. Cheap, rugged, sees
  hydrogen too — but it **requires oxygen to work**, so it reads low or zero in an
  inert or fuel-rich atmosphere; it is poisoned by silicones, sulphur and
  halogens; and a very rich mixture can read *low*.
- **Point infrared:** absorption over a short fixed path. Immune to poisoning,
  works with no oxygen, self-checking — but blinded by dirt, ice or condensation.
- **Open-path infrared:** covers a line, good for perimeters and large equipment.
  Reports a path-integrated value (LEL·metres), not a point concentration;
  alignment and obscuration are its failure modes.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
A catalytic bead inside a nitrogen-purged enclosure reads zero — not because
there is no methane, but because there is no oxygen for it to burn. A poisoned
pellistor fails the same direction: it reports safe. On the panel, both look
exactly like a clean atmosphere.
</div>

**Setpoints are a fraction of LEL, and there are always two.** Common practice is
a low alarm near 10–20 % LEL and a high alarm near 20–40 %, set by site risk
assessment. The alarm measures *margin*, not danger: 20 % LEL leaves 80 % to
absorb sensor error, sampling delay, and the fact that a stratified dense cloud
is not well mixed — 20 % LEL at a sensor two metres away can coexist with 100 %
LEL at the leak. Two levels separate warning from action; one level forces a
choice between nuisance shutdowns and a late response. OSHA's hazardous-atmosphere
definition already catches a flammable gas above **10 % of its LFL** — 0.5 vol %
for methane `[OSHA-1910.146]`.

<figure>
<svg viewBox="0 0 660 330" role="img" aria-label="Cross-section of a test-stand enclosure showing methane detectors at high and low level and in a trench, and an oxygen monitor at breathing height, each labelled with the physical reason for its position.">
  <text x="8" y="18" font-family="system-ui, sans-serif" font-size="14" fill="currentColor" font-weight="600">Different sensors, different physics, different heights</text>
  <rect x="20" y="34" width="400" height="230" fill="var(--side)" stroke="currentColor" stroke-width="1.5"/>
  <line x1="20" y1="264" x2="420" y2="264" stroke="currentColor" stroke-width="2"/>
  <rect x="150" y="264" width="70" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="152" y="278" width="66" height="26" fill="var(--fuel)" opacity="0.25"/>
  <text x="146" y="322" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">trench / cable duct</text>

  <!-- person for breathing height -->
  <circle cx="330" cy="196" r="10" fill="none" stroke="var(--muted)" stroke-width="1.5"/>
  <path d="M330 206 L330 246 M330 246 L320 264 M330 246 L340 264 M314 220 L346 220" stroke="var(--muted)" stroke-width="1.5" fill="none"/>
  <line x1="240" y1="188" x2="420" y2="188" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="240" y="182" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">breathing height ≈1.5 m</text>

  <!-- detectors -->
  <circle cx="70" cy="58" r="15" fill="var(--bg)" stroke="var(--fuel)" stroke-width="2"/>
  <text x="58" y="63" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">AT1</text>
  <circle cx="70" cy="248" r="15" fill="var(--bg)" stroke="var(--fuel)" stroke-width="2"/>
  <text x="58" y="253" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">AT2</text>
  <circle cx="185" cy="292" r="15" fill="var(--bg)" stroke="var(--fuel)" stroke-width="2"/>
  <text x="173" y="297" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">AT3</text>
  <circle cx="286" cy="196" r="15" fill="var(--bg)" stroke="var(--inert)" stroke-width="2"/>
  <text x="274" y="201" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">AT4</text>
  <circle cx="392" cy="248" r="15" fill="var(--bg)" stroke="var(--oxy)" stroke-width="2"/>
  <text x="380" y="253" font-family="system-ui, sans-serif" font-size="13" fill="var(--oxy)">AT5</text>

  <text x="440" y="52" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">AT1 methane, high —</text>
  <text x="440" y="70" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">warm methane is buoyant</text>
  <text x="440" y="98" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">AT2 methane, low —</text>
  <text x="440" y="116" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">cold methane is dense</text>
  <text x="440" y="144" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">AT3 methane, in trench —</text>
  <text x="440" y="162" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">that is where it collects</text>
  <text x="440" y="190" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">AT4 O₂ deficiency —</text>
  <text x="440" y="208" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">protects people, so it sits</text>
  <text x="440" y="226" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">where people breathe</text>
  <text x="440" y="254" font-family="system-ui, sans-serif" font-size="13" fill="var(--oxy)">AT5 O₂ enrichment —</text>
  <text x="440" y="272" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">near the LOX release source</text>
</svg>
<figcaption>Figure 7.2 — Combustible-gas detectors go where the gas goes; oxygen-deficiency monitors go where the lungs are. An ODH monitor at head height can read normal while a cold, dense, lethal atmosphere sits at floor level.</figcaption>
</figure>
A methalox facility runs **three distinct detection populations** — combustible
gas, oxygen deficiency, oxygen enrichment — with different sensors, setpoints,
placements and responses. Conflating them is a design finding. Deficiency
threshold **19.5 % O₂**, enrichment **23.5 %** `[OSHA-1910.146]`, `[SLAC-CH36]`.

**Calibration, in concept.** Sensors are calibrated against a reference gas and
read others through a cross-sensitivity factor, so where calibration gas and
target gas differ, setpoints must be conservative. A **bump test** proves the
loop is alive; only **calibration** proves the number. Smell will not help —
rocket-grade methane is not odorised, and a sulphur odorant is unwelcome near
oxygen-cleaned components.

## 6. Hazardous area classification

Nitrogen needs none. Oxygen, being non-flammable, creates no classified area by
itself. **Methane does**, and that is where the facility's paperwork changes
character.

`[NFPA-70]` (2026 edition) Art. 500 is the foundation: **Class I**, **Division 1**
where an ignitable mixture is present in normal operation or frequently,
**Division 2** where only abnormally. Art. 505 offers the IEC-aligned **Zone
0/1/2** alternative, Art. 504 intrinsic safety, Art. 501 wiring methods.
`[NFPA-497]` (2024 edition) is the recommended practice used to draw the boundary
and look up gas group and AIT. The enforceable chain: OSHA 29 CFR 1910.307 →
NFPA 70 → the area must be classified → NFPA 497 is the recognised method.

Three questions classify an area: is there a **source of release** (flanges,
seals, valve stems, vents, relief discharges, drains)? **How likely, how long?**
And **where does it go** — for cold methane, the classified volume is not the
shape you would draw around a hydrogen source; it reaches down and sideways.

Classification drives every electrical choice: equipment certified for **Group D**
with a suitable **T-code**, wiring to Art. 501 or 505, conduit seals so a
classified volume cannot communicate with an unclassified one through the wiring,
and a classification drawing maintained as the plant changes. Group D hardware is
cheap and everywhere; hydrogen's Group B is neither.

Findings a review actually turns up, in order of frequency: the drawing was not
updated after a modification; an unrated item sits inside the boundary (laptop,
phone, camera, portable light, temporary heater); trenches and pits were never
treated as classified volumes; conduit seals were omitted; and — most often
missed on a methalox stand — the oxygen system was ignored, even though
**equipment certified for a Group D methane atmosphere was tested in air, and
says nothing about an oxygen-enriched one**.

## 7. Purging and inerting

A GN₂ purge does four separable jobs: displace oxygen before fuel enters;
displace fuel before the system is opened to air; exclude moisture and CO₂ that
freeze solid on cold surfaces and block orifices; and hold a continuous inert
blanket in annular, interstitial and enclosed volumes so a leak into them cannot
find an oxidiser. **Inert before, inert after** — the transitions in and out of
service are when the flammable window opens. If the inner wall of a
vacuum-jacketed line or double-walled vessel leaks, that interstitial space
receives fuel; if it also communicates with air, it is a confined flammable
mixture inside a strong container.

**Fuel and oxidiser are never purged from a shared supply.** A purge manifold is
a flow path; share one and the only thing keeping methane out of the LOX side is
a check valve. Check valves leak, hang open on debris, cannot be tested in place
without breaking the joint, and fail in whichever direction the differential
pressure points. **A check valve is not a barrier between a fuel and an
oxidiser.** The control is physical separation — separate sources, manifolds and
connections — with positive isolation (double block and bleed, or spool removal)
where systems must cross-connect. Hydrocarbon into an oxygen system is a
contamination event; oxygen into a fuel system creates an internal flammable
mixture in a volume designed on the assumption there is no oxidiser.

The purge gas entering an oxygen system *is part of the oxygen system*: it must
meet the same cleanliness standard, because the purge line injects whatever is in
it — compressor oil, hydrocarbon residue, particulate. `[CGA-G-4.1]` governs
cleaning of surfaces contacting fluid above 23.5 % oxygen, and particulate
matters on its own account, since particle impact is a recognised oxygen ignition
mechanism `[NASA-TM-2007-213740]`.

**Helium versus nitrogen.** Nitrogen's triple point is 63.15 K, far above liquid
hydrogen's 20.3 K, so nitrogen in an LH₂ system **freezes solid** — hence helium
`[NIST-FLUIDS]`, `[LINDE-PURGE]`. For methalox, nitrogen does not freeze and GN₂
is generally fine. But that is a 1 bar statement: nitrogen's saturation
temperature reaches 90 K at **3.6 bar** and 111.7 K near **15.6 bar**
`[NIST-FLUIDS]`, and purge and pressurant supplies run well above those
pressures. Nitrogen can **liquefy** against a LOX-temperature surface, depositing
liquid where gas was intended — pressurant collapse, unexpected chilling, slug
flow. Helium stays gaseous under anything the system will see.

## 8. Methalox is more than the sum of its parts

Neither propellant alone makes a flammable atmosphere in an enclosure: methane
burns only between 5 and 15 %, and oxygen is not a fuel at any concentration.
**Together the window opens to 5.15–60.5 %** `[USBM-503]` — four times wider on
the rich side — in whatever volume both releases can reach.

NASA has published on the combined hazard directly. The NESC investigation of
LO₂/LNG found that the **miscibility** of the two liquids creates a risk of
**condensed-phase detonation** with significantly higher overpressures than
LO₂/LH₂ or LO₂/RP-1, with "unique risks when used in launch vehicles that have
common bulkhead tank designs, common-walled downcomers, or transfer tubes," and
that intentionally mixed unconfined mixtures showed "a broad detonable range with
yields greater than that of TNT" `[NASA-NESC-LOXLNG]`. The same source records
that little data exist for launch-vehicle accident scenarios and that guidance
was interim. Two caveats travel with the citation: it is a presentation whose
text had to be reconstructed during verification, and no numeric value from it is
reproduced here.

<figure>
<svg viewBox="0 0 660 330" role="img" aria-label="Layout diagram: separate fuel and oxidiser vent stacks, separate purge panels and separate trenches, with a shared trench and a combined vent header marked as prohibited.">
  <text x="8" y="18" font-family="system-ui, sans-serif" font-size="14" fill="currentColor" font-weight="600">Separate everything that can carry one fluid to the other</text>

  <!-- fuel side -->
  <rect x="30" y="150" width="90" height="70" fill="var(--side)" stroke="var(--fuel)" stroke-width="2"/>
  <text x="40" y="190" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">LCH₄ tank</text>
  <line x1="75" y1="150" x2="75" y2="70" stroke="var(--fuel)" stroke-width="2"/>
  <path d="M62 70 L75 46 L88 70" fill="none" stroke="var(--fuel)" stroke-width="2"/>
  <text x="26" y="40" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">fuel vent stack</text>
  <rect x="30" y="252" width="90" height="26" fill="none" stroke="var(--inert)" stroke-width="1.5"/>
  <text x="36" y="270" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">GN₂ panel A</text>
  <line x1="75" y1="252" x2="75" y2="220" stroke="var(--inert)" stroke-width="1.5"/>

  <!-- ox side -->
  <rect x="470" y="150" width="90" height="70" fill="var(--side)" stroke="var(--oxy)" stroke-width="2"/>
  <text x="484" y="190" font-family="system-ui, sans-serif" font-size="13" fill="var(--oxy)">LOX tank</text>
  <line x1="515" y1="150" x2="515" y2="70" stroke="var(--oxy)" stroke-width="2"/>
  <path d="M502 70 L515 46 L528 70" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <text x="452" y="40" font-family="system-ui, sans-serif" font-size="13" fill="var(--oxy)">oxidiser vent stack</text>
  <rect x="470" y="252" width="90" height="26" fill="none" stroke="var(--inert)" stroke-width="1.5"/>
  <text x="476" y="270" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">GN₂ panel B</text>
  <line x1="515" y1="252" x2="515" y2="220" stroke="var(--inert)" stroke-width="1.5"/>

  <!-- separation dimension -->
  <line x1="120" y1="234" x2="470" y2="234" stroke="var(--muted)" stroke-width="1" stroke-dasharray="5 4"/>
  <text x="204" y="230" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">fuel–oxidiser separation governs the layout</text>

  <!-- prohibited crossties -->
  <path d="M75 60 C 200 20, 390 20, 515 60" fill="none" stroke="var(--warn)" stroke-width="2" stroke-dasharray="7 5"/>
  <text x="228" y="16" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">combined vent header — never</text>
  <line x1="120" y1="290" x2="470" y2="290" stroke="var(--warn)" stroke-width="2" stroke-dasharray="7 5"/>
  <text x="180" y="310" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">shared trench or shared purge manifold — never</text>
  <g stroke="var(--warn)" stroke-width="3">
    <line x1="286" y1="24" x2="304" y2="42"/><line x1="304" y1="24" x2="286" y2="42"/>
    <line x1="286" y1="282" x2="304" y2="300"/><line x1="304" y1="282" x2="286" y2="300"/>
  </g>
</svg>
<figcaption>Figure 7.3 — Fuel orange, oxidiser green, inert grey. Every dashed warn-coloured path is a route by which one fluid reaches the other: a combined vent header, a shared trench, a shared purge manifold behind a check valve.</figcaption>
</figure>
The recognition criteria are structural. Is there **any volume** — room, trench,
duct, pit, cable chase — into which both a fuel and an oxidiser release are
credible? Is there **shared drainage or grading** bringing a methane pool and a
LOX pool to the same low point, remembering that cold methane actively seeks low
points? Are the two systems' **relief and vent discharges** routed so their
plumes can meet under any wind?

A shared vent stack is the one flat prohibition here: it makes a flammable
mixture inside a pipe, at whatever composition the two flows produce, undiluted
and uninspectable. The same logic covers shared relief headers and knockout
drums — and the subtler case of separate stacks whose plumes co-mingle downstream
because discharge points are close, exit velocities low, or the building wake
brings them together.

At the engine, start and shutdown transients pass through mixture ratios nowhere
near the design point. A fuel-rich pocket at the injector face or an oxygen-rich
pocket in the chamber is a normal transient feature — and an oxygen-rich
condition makes chamber and nozzle *materials* flammable in a way they are not at
the design mixture ratio `[NASA-TM-2007-213740]`. Sequencing and ignition timing
are operating-procedure content and stop being this course's business here.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
NASA flooded 2 m square asphalt slabs with LOX. In rainy weather, plummet impact
produced no reaction. On a dry slab, a plummet-initiated test gave <em>a violent
reaction that appeared to propagate over the entire slab surface</em>, destroyed
the fixture and threw fragments 48 m; laboratory impact tests reacted on old
asphalt at energies as low as 1 kg·m, while concrete never reacted
<code>[UVU-LOX-ASPHALT]</code>. Both halves are true — initiation takes real
energy, and moisture suppressed it — but those energies are within reach of
ordinary mechanical events. LOX plus <em>any</em> hydrocarbon (asphalt, grease,
oil, paint, leaves, cardboard) is an impact-sensitive mixture in intimate
contact. Housekeeping is an engineering control, not tidiness.
</div>

## 9. The escalation ladder

| Dimension | LN₂ only | + LOX | + LOX & methane |
|---|---|---|---|
| **Dominant hazard** | Asphyxiation, cold burn, trapped liquid | **plus fire**: LOX makes existing materials flammable | **plus a fuel**, and a **miscible pair** capable of condensed-phase detonation `[NASA-NESC-LOXLNG]` |
| **Materials & cleaning** | Ordinary cryogenic selection; embrittlement | **Step change:** oxygen cleaning above 23.5 % O₂, hydrocarbon and particulate limits `[CGA-G-4.1]` | Oxygen cleaning still governs the LOX side; methane is undemanding, so **cross-contamination control dominates** |
| **Ignition sources** | Largely irrelevant | Oxygen mechanisms: particle impact, heat of compression, friction, mechanical impact | Those **and** the flammable-atmosphere set (static, electrical, hot surfaces), at once, on the same hardware |
| **Area classification** | None | Still none from flammability — but O₂ invalidates certifications tested in air | **Required.** Class I, Group D, T-codes, classification drawings, conduit seals `[NFPA-70]`, `[NFPA-497]` |
| **Detection** | O₂ deficiency at breathing height | Add **O₂ enrichment** — different sensor, opposite alarm direction | Add **combustible gas, high and low.** Three populations, three setpoint philosophies |
| **Separation & quantity** | Modest; driven by ODH and relief discharge | Bulk oxygen separation from combustibles controls `[NFPA-55]` | **Fuel–oxidiser separation governs**; launch sites add explosive siting and net explosive weight |
| **Relief & vent design** | Vents are benign | Discharge is an **oxygen-enriching** plume | Discharge is a **flammable** plume; vents **never share a stack**, and plume interaction must be assessed |
| **Procedures & training** | Cryogen handling, PPE, confined space | Add oxygen discipline: cleanliness, no hydrocarbons, saturated clothing | Add flammable-gas and ignition-source control, hot work, cross-contamination rules |
| **Emergency response** | Evacuate, ventilate, warm up | Fire credible; LOX-soaked material impact-sensitive `[UVU-LOX-ASPHALT]` | Vapour cloud and pool fire; **detonation credible**; a fire fed by an oxidiser you cannot exclude |
| **Code & institutional triggers** | `[NFPA-55]` Ch. 8; OSHA 1910.101 | `[NFPA-55]` Ch. 9; OSHA 1910.104; oxygen compatibility assessment | Add NEC classification, `[NFPA-59A]` as reference practice, explosive siting, hazard analysis by methods NASA called interim |

**LN₂ → LOX is a change of kind, not degree.** Nothing burns; then everything
does. The facility does not get a bigger version of its old hazard, it gets a new
one, and the whole materials and cleanliness discipline exists only from this
rung upward.

**LOX → methalox is not additive, and this is the step people underestimate.**
Adding a fuel adds a fuel's hazards; that much is expected. What is not expected
is that the *co-location* creates hazards neither system has — a flammable range
four times wider wherever the clouds meet, a shared trench that collects both, a
purge manifold connecting them behind a check valve, vent plumes merging in a
crosswind, and a miscible liquid pair whose intimate mixture can detonate rather
than deflagrate. Those hazards live in the spaces *between* the systems, exactly
where a system-by-system review does not look. And the methods lag the hardware:
a review assuming the LOX/RP-1 or LOX/LH₂ siting precedent transfers is assuming
something NASA does not `[NASA-NESC-LOXLNG]`.

## 10. What NASA actually published

Project Morpheus is the deepest public facility-and-operations record:
`[NASA-MORPHEUS-LESSONS]` (JSC-CN-29387, NTRS 20140001410) carries the propellant
rationale, pad-crew positions with per-position certification for cryogenic
handling, hazard tracking with an embedded S&MA engineer, and the August 2012
vehicle loss, investigated in `[NASA-MORPHEUS-FAILURE]` (NTRS 20140001490). The
propulsion rationale is best stated in `[NASA-HURLBERT-2016]` (JSC-CN-35060).
Hardware experience: RS-18 ascent-engine testing at White Sands
`[NASA-RS18-WSTF]`, vehicle-level hot-fire at thermal vacuum
`[NASA-TVAC-HOTFIRE]`, igniter testing with methane purity as a variable
`[NASA-IGNITER]` (NASA/TM-2008-215421), the conditioning feed rigs `[NASA-PCFS]`,
and the propellant trade study `[NASA-CHEN-ISRU]`.

<div class="box"><span class="lbl">Worth knowing</span>
<strong>Morpheus did not run on rocket-grade methane — it ran on LNG</strong>:
the consumables list is "liquid oxygen, liquefied natural gas, helium, liquid
nitrogen, and gaseous nitrogen" <code>[NASA-MORPHEUS-LESSONS]</code>, and the
NESC explosive-hazard work is likewise framed as LO₂/LNG. And <strong>there is no
public NASA training document called "Cryogenics Safety for Morpheus"</strong> —
it is widely assumed to exist, but searches of NTRS and nasa.gov return nothing
under that title. The real sources are the lessons-learned papers above, plus the
centre-level certification requirement in <strong>JPR 1700.1 Ch. 6.4</strong>.
Citing a document that does not exist is a fast way to lose a design review.
</div>

---

## Checkpoint quiz

1. A stand routes its fuel-tank relief and its LOX-tank relief into one header
   discharging from a single tall stack, arguing that height disperses both
   safely. What is wrong — and what subtler version of the same mistake survives
   if you split the stacks?

2. A cold methane leak occurs at grade on a still day. When is the cloud *most*
   dangerous? (a) at release, 112 K · (b) partway through warming, still below
   164.25 K · (c) once warmed above 164.25 K · (d) risk is constant

3. A design uses catalytic bead detectors throughout, including inside a
   continuously GN₂-purged enclosure and in the roof space of a methane pump
   house, with none at low level. Identify two independent problems.

4. Methane's triple point is 90.6941 K; oxygen's normal boiling point 90.1875 K.
   State the margin, name two pieces of hardware it constrains, and say whether
   this is a documented failure mode or an inferred one.

5. A facility handles LN₂ only and proposes adding LOX, then methane. Which rung
   introduces hazardous area classification — and why does the other rung not,
   despite still changing the electrical problem?

<details>
<summary>Show answers</summary>

1. **A shared header makes a flammable mixture inside a pipe** — undiluted,
   uninspectable, in a strong container — and stack height does nothing, because
   the mixing happened upstream of the tip. The same ban covers shared relief
   headers and knockout drums. What survives separate stacks: **plumes co-mingle
   downstream in the atmosphere** when discharge points are close, exit
   velocities low, or terrain and building wake bring them together. Separation
   is about where the plumes go, not where the pipes end.

2. **(b).** At release the cloud is far too rich to burn and hugs the ground;
   above 164.25 K it is buoyant and lifting away. In between it is still denser
   than air — running into trenches, pits and doorways — while having entrained
   enough air to sit inside 5–15 % somewhere. (a) is wrong because a mixture
   above the upper limit is not ignitable until it dilutes; (c) is wrong because
   buoyancy is what removes the cloud; (d) is wrong because the hazard is
   entirely a function of temperature and dilution history.

3. **Catalytic beads need oxygen to work.** In a nitrogen-purged enclosure the
   sensor reads near zero however much methane is present — the atmosphere you
   most need to measure is the one it cannot. Point IR is oxygen-independent and
   belongs there. **Roof-only placement is imported hydrogen practice.** High
   detectors catch the small warm leak, but a cryogenic release makes vapour
   ~1.45× the density of air that must warm more than 52 K before it lifts, so
   without low-level or trench detection the worst case is invisible. Also
   acceptable: beads can be poisoned silently and fail *low*, reporting safe.

4. **0.507 K — methane freezes above the temperature at which LOX boils.** Any
   two of: a LOX/methane heat exchanger (de-rated and insulated to *retard* heat
   transfer, because methane cooled against LOX condenses, then freezes and plugs
   it); a common bulkhead or common-walled downcomer, which puts the fluids in
   thermal contact by design; densified methane storage, which spends freezing
   margin to buy density. It is **inferred**: the property data are Confidence A
   and the arithmetic elementary, but no primary source documenting an actual
   freezing incident was found. Say "this follows from the property data," not
   "this has happened."

5. **Methane triggers classification; LOX does not.** NEC Art. 500/505 covers
   locations where a *flammable* gas or vapour may be present, and **oxygen is an
   oxidiser, not a fuel** — it creates no ignitable atmosphere of its own. The
   trap in the second half: adding LOX still changes the electrical problem,
   because equipment certified for a Group D methane atmosphere was tested **in
   air** and says nothing about an oxygen-enriched one. On a methalox stand the
   classification exercise must account for the oxygen system even though the
   oxygen system did not trigger it.

</details>
