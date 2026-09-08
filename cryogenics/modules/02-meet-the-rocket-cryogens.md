# Module 02 — Meet the Rocket Cryogens

*Roughly 20 minutes. Prerequisite: Module 01.*

A pad crew handles four cold liquids and two cold-ish gases, and the fastest way
to get hurt is to treat them as one category called "cryogenics". They are not
one category. One of them is chemically inert and still manufactures an oxidiser
out of thin air. One is not a fuel at all and is the reason a clean rag becomes a
hazard. This module is the introductions — names, numbers, and the specific way
each one bites.

## What you'll be able to do

- State the boiling point, liquid density and hazard class of LOX, LCH₄, LN₂ and
  LH₂ from memory.
- Explain both mechanisms by which an inert cryogen kills, including the one
  that has nothing to do with asphyxiation.
- Say precisely what oxygen enrichment does to a flammable range — and what it
  does not do.
- Predict whether a cold leak will pool at your feet or head for the roof.
- Recognise the two temperature collisions that define methalox hardware.

## 1. Six fluids on one temperature axis

Every number here comes from `reference/properties.md`, whose fixed points are
the NIST reference equations of state `[NIST-FLUIDS]`; where a value is
method-dependent the caveat is printed with it. Start with the picture: most of
the hazards in this course follow from where these fluids sit relative to each
other and to the air.

<figure>
<svg viewBox="0 0 660 330" role="img" aria-label="A temperature axis from 0 to 300 kelvin marking helium at 4.2 K, hydrogen at 20.4 K, nitrogen at 77.4 K, oxygen at 90.2 K, methane at 111.7 K and room temperature at 293 K, with an expanded view of the 75 to 115 kelvin band showing that liquid nitrogen boils 12.83 K below liquid oxygen and that methane freezes 0.507 K above the boiling point of liquid oxygen.">
  <text x="60" y="26" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" font-weight="700">Normal boiling points, 1 atm (K)</text>

  <line x1="60" y1="110" x2="620" y2="110" stroke="currentColor" stroke-width="1.5"/>
  <g font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)" text-anchor="middle">
    <line x1="60"  y1="110" x2="60"  y2="118" stroke="var(--muted)"/><text x="60"  y="134">0</text>
    <line x1="153" y1="110" x2="153" y2="118" stroke="var(--muted)"/><text x="153" y="134">50</text>
    <line x1="247" y1="110" x2="247" y2="118" stroke="var(--muted)"/><text x="247" y="134">100</text>
    <line x1="340" y1="110" x2="340" y2="118" stroke="var(--muted)"/><text x="340" y="134">150</text>
    <line x1="433" y1="110" x2="433" y2="118" stroke="var(--muted)"/><text x="433" y="134">200</text>
    <line x1="527" y1="110" x2="527" y2="118" stroke="var(--muted)"/><text x="527" y="134">250</text>
    <line x1="620" y1="110" x2="620" y2="118" stroke="var(--muted)"/><text x="620" y="134">300</text>
  </g>

  <g stroke-width="2">
    <line x1="68"  y1="110" x2="68"  y2="58" stroke="var(--inert)"/>
    <line x1="98"  y1="110" x2="98"  y2="78" stroke="var(--fuel)"/>
    <line x1="204" y1="110" x2="204" y2="58" stroke="var(--inert)"/>
    <line x1="228" y1="110" x2="228" y2="78" stroke="var(--oxy)"/>
    <line x1="268" y1="110" x2="268" y2="58" stroke="var(--fuel)"/>
    <line x1="607" y1="110" x2="607" y2="78" stroke="currentColor"/>
  </g>
  <g font-family="system-ui, sans-serif" font-size="13">
    <text x="72"  y="54" fill="var(--inert)">He 4.2</text>
    <text x="102" y="74" fill="var(--fuel)">LH₂ 20.4</text>
    <text x="208" y="54" fill="var(--inert)">LN₂ 77.4</text>
    <text x="232" y="74" fill="var(--oxy)">LOX 90.2</text>
    <text x="272" y="54" fill="var(--fuel)">LCH₄ 111.7</text>
    <text x="603" y="74" fill="currentColor" text-anchor="end">room 293</text>
  </g>

  <rect x="200" y="100" width="75" height="20" fill="none" stroke="var(--muted)" stroke-dasharray="3 3"/>
  <line x1="200" y1="120" x2="60"  y2="196" stroke="var(--muted)" stroke-dasharray="3 3"/>
  <line x1="275" y1="120" x2="620" y2="196" stroke="var(--muted)" stroke-dasharray="3 3"/>

  <text x="60" y="188" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">expanded: 75 – 115 K</text>
  <line x1="60" y1="255" x2="620" y2="255" stroke="currentColor" stroke-width="1.5"/>
  <g font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)" text-anchor="middle">
    <line x1="130" y1="255" x2="130" y2="262" stroke="var(--muted)"/><text x="130" y="276">80</text>
    <line x1="270" y1="255" x2="270" y2="262" stroke="var(--muted)"/><text x="270" y="276">90</text>
    <line x1="410" y1="255" x2="410" y2="262" stroke="var(--muted)"/><text x="410" y="276">100</text>
    <line x1="550" y1="255" x2="550" y2="262" stroke="var(--muted)"/><text x="550" y="276">110</text>
  </g>
  <g stroke-width="2">
    <line x1="93"  y1="255" x2="93"  y2="228" stroke="var(--inert)"/>
    <line x1="273" y1="255" x2="273" y2="243" stroke="var(--oxy)"/>
    <line x1="280" y1="255" x2="280" y2="228" stroke="var(--warn)"/>
    <line x1="573" y1="255" x2="573" y2="243" stroke="var(--fuel)"/>
  </g>
  <g font-family="system-ui, sans-serif" font-size="13">
    <text x="93"  y="222" fill="var(--inert)" text-anchor="middle">LN₂ boils 77.35</text>
    <text x="268" y="240" fill="var(--oxy)" text-anchor="end">LOX boils 90.19</text>
    <text x="286" y="222" fill="var(--warn)">CH₄ freezes 90.69</text>
    <text x="573" y="240" fill="var(--fuel)" text-anchor="end">LCH₄ boils 111.67</text>
  </g>

  <line x1="93" y1="296" x2="273" y2="296" stroke="var(--warn)" stroke-width="1.5"/>
  <line x1="93" y1="291" x2="93" y2="301" stroke="var(--warn)" stroke-width="1.5"/>
  <line x1="273" y1="291" x2="273" y2="301" stroke="var(--warn)" stroke-width="1.5"/>
  <text x="183" y="291" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)" text-anchor="middle">12.83 K — LN₂ is colder than LOX</text>
  <path d="M 340 300 L 300 300 L 283 262" fill="none" stroke="var(--warn)" stroke-width="1.5"/>
  <text x="346" y="305" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">0.507 K — LOX can freeze methane</text>
</svg>
<figcaption>Figure 2.1 — The two collisions that shape everything else. LN₂ boils 12.83 K below liquid oxygen, so anything LN₂ cools condenses oxygen out of the air. Methane freezes 0.507 K above LOX's boiling point, so boiling LOX at 1 atm can freeze methane solid on contact. Fixed points from <code>[NIST-FLUIDS]</code>, Confidence A.</figcaption>
</figure>

## 2. The master comparison

| | **LOX** | **LCH₄** | **LN₂** | **LH₂** | GHe | GN₂ |
|---|---|---|---|---|---|---|
| Formula | O₂ | CH₄ | N₂ | H₂ | He | N₂ |
| Molar mass (g/mol) | 31.9988 | 16.0425 | 28.0134 | 2.01588 | 4.002602 | 28.0134 |
| **NBP (K)** | **90.1875** | **111.667** | **77.3549** | **20.3689** (normal) | 4.2238 | — (gas in use) |
| NBP (°C) | −182.962 | −161.483 | −195.795 | −252.781 | −268.926 | — |
| **ρ liquid at NBP (kg/m³)** | **1141.18** | **422.355** | **806.085** | **70.8484** | 124.670 | — |
| Latent heat (kJ/kg) | 213.06 | 510.83 | 199.18 | 448.71 | 20.564 | — |
| Gas expansion, NBP → 70 °F | 861 : 1 | 634 : 1 | 696 : 1 | 848 : 1 | 754 : 1 | 696 : 1 |
| Vapour SG vs air at 20 °C | 1.1056 | 0.5549 | 0.9674 | 0.0696 | 0.1381 | 0.9674 |
| Buoyancy crossover *T* | 324.0 K | **164.25 K** | 283.6 K | **22.09 K** | 40.45 K | 283.6 K |
| **Class** | **Oxidiser** (non-flammable) | **Flammable** | **Inert / asphyxiant** | **Flammable** | Inert / asphyxiant | Inert / asphyxiant |
| Principal human hazards | Cold burn; **oxygen-enriched clothing ignites**; enriched atmosphere > 23.5 % | Cold burn; fire and flash fire; asphyxiation in a confined space | Cold burn; **asphyxiation without warning**; LOX condensate | Cold burn; flash fire from an invisible flame; asphyxiation | Cold burn from cold vent gas; asphyxiation at ceiling level | Asphyxiation without warning |
| Principal equipment hazards | Ignition of ordinary materials, metals included; particle impact; adiabatic compression | Flammable cloud that hugs the ground; area classification; freezing against LOX | Condensed LOX on cold surfaces; N₂ liquefying in a pressurised purge line | Leaks through joints that hold other gases; freezes air solid; embrittlement | Leaks through everything; enormous boil-off per unit heat leak | Liquefies above ~3.6 bar against LOX, ~15.6 bar against LCH₄ |
| Typical role | Oxidiser; the larger propellant mass | Fuel; also the tank-pressurisation autogenous gas | Chill-down, cold-shock testing, jacket and shield coolant, inerting | Fuel on hydrolox stages; appendix fluid here | Purge and pressurant where nitrogen would freeze or condense; leak-test tracer | Purge, inerting, valve actuation, pneumatics |

Expansion ratios are quoted **liquid at NBP → gas at 70 °F and 1 atm**, the basis
of Air Products' published table `[AP-SG-27]`; computed values agree to better
than 0.3 %. Never quote one without its reference temperature: the same publisher
prints 694 and 696 for nitrogen in two documents and both are right, because one
is at 68 °F and the other at 70 °F. Methane has no equivalent Safetygram, so use
**634 : 1 at 70 °F** (computed here) and say so.

<div class="box remember"><span class="lbl">Remember this</span>
Four boiling points, in order: <strong>LH₂ 20.4 K, LN₂ 77.4 K, LOX 90.2 K,
LCH₄ 111.7 K.</strong> Nitrogen is colder than oxygen. Methane is warmer than
oxygen. Almost every surprise in this course falls out of those two sentences.
</div>

## 3. The personality cards

<div class="cards">
<div class="card oxidiser">
  <h4>LOX</h4><div class="sub">liquid oxygen · O₂ · pale blue</div>
  <dl><dt>Boils</dt><dd>90.2 K</dd>
      <dt>Density</dt><dd>1141 kg/m³</dd>
      <dt>Class</dt><dd>Oxidiser, non-flammable</dd>
      <dt>Bites by</dt><dd>changing what else burns</dd></dl>
  <div class="say">"I don't burn. I make everything else burn."</div>
</div>
<div class="card fuel">
  <h4>LCH₄</h4><div class="sub">liquid methane · CH₄</div>
  <dl><dt>Boils</dt><dd>111.7 K</dd>
      <dt>Density</dt><dd>422 kg/m³</dd>
      <dt>Class</dt><dd>Flammable, 5–15 % in air</dd>
      <dt>Bites by</dt><dd>pooling low, then finding a spark</dd></dl>
  <div class="say">"I leak downhill and wait 52 kelvin before I float away."</div>
</div>
<div class="card">
  <h4>LN₂</h4><div class="sub">liquid nitrogen · N₂</div>
  <dl><dt>Boils</dt><dd>77.4 K</dd>
      <dt>Density</dt><dd>806 kg/m³</dd>
      <dt>Class</dt><dd>Inert asphyxiant</dd>
      <dt>Bites by</dt><dd>silence — and by making LOX</dd></dl>
  <div class="say">"I'm the safe one. That's the dangerous part."</div>
</div>
<div class="card fuel">
  <h4>LH₂</h4><div class="sub">liquid hydrogen · H₂ (stored as ≥95 % para)</div>
  <dl><dt>Boils</dt><dd>20.4 K</dd>
      <dt>Density</dt><dd>70.8 kg/m³</dd>
      <dt>Class</dt><dd>Flammable, 4–75 % in air</dd>
      <dt>Bites by</dt><dd>escaping, then burning invisibly</dd></dl>
  <div class="say">"Your fitting held methane. It will not hold me."</div>
</div>
</div>

Two more fluids are everywhere without ever being propellants. **GN₂ is the
workhorse inert** — purge, pad pressure, valve actuation — but not a universal
one: it freezes solid at liquid-hydrogen temperature and *condenses* above about
3.6 bar against LOX and 15.6 bar against LCH₄, putting liquid where gas was
intended. **GHe is what you use where nitrogen fails**, being the only element
still gaseous at 20 K. It leaks through joints nothing else finds, and its latent
heat is a tenth of nitrogen's (20.564 kJ/kg).

<figure>
<svg viewBox="0 0 660 250" role="img" aria-label="Four bars showing liquid density at normal boiling point: liquid hydrogen 70.8, liquid methane 422, liquid nitrogen 806 and liquid oxygen 1141 kilograms per cubic metre, each annotated with the gas volume one cubic metre produces at 70 degrees Fahrenheit.">
  <text x="20" y="24" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" font-weight="700">One cubic metre of each liquid: mass held, gas released</text>
  <line x1="20" y1="180" x2="640" y2="180" stroke="currentColor" stroke-width="1.5"/>

  <rect x="60"  y="173" width="90" height="7"   fill="var(--fuel)"  opacity="0.85"/>
  <rect x="215" y="139" width="90" height="41"  fill="var(--fuel)"  opacity="0.85"/>
  <rect x="370" y="102" width="90" height="78"  fill="var(--inert)" opacity="0.85"/>
  <rect x="525" y="69"  width="90" height="111" fill="var(--oxy)"   opacity="0.85"/>

  <g font-family="system-ui, sans-serif" font-size="13" text-anchor="middle" fill="currentColor">
    <text x="105" y="165">70.8 kg</text>
    <text x="260" y="131">422 kg</text>
    <text x="415" y="94">806 kg</text>
    <text x="570" y="61">1141 kg</text>
    <text x="105" y="200" font-weight="700">LH₂</text>
    <text x="260" y="200" font-weight="700">LCH₄</text>
    <text x="415" y="200" font-weight="700">LN₂</text>
    <text x="570" y="200" font-weight="700">LOX</text>
  </g>
  <g font-family="system-ui, sans-serif" font-size="13" text-anchor="middle" fill="var(--muted)">
    <text x="105" y="220">848 m³ gas</text>
    <text x="260" y="220">634 m³ gas</text>
    <text x="415" y="220">696 m³ gas</text>
    <text x="570" y="220">861 m³ gas</text>
    <text x="330" y="240">gas volume at 70 °F and 1 atm — every one of them is roughly 700–860 times the liquid</text>
  </g>
</svg>
<figcaption>Figure 2.2 — The densities differ by 16×; the expansion ratios barely differ at all. A litre spilled is about the same volume of gas whichever fluid it was. Densities and ratios from <code>reference/properties.md</code> §2 and §4, Confidence A.</figcaption>
</figure>

<div class="box"><span class="lbl">Worth knowing</span>
Those ratios assume the gas ends up at room temperature. In the first seconds of
a spill it has not warmed, and the <em>immediate</em> volume is far smaller —
175 : 1 for nitrogen, 7.4 : 1 for helium. Use the big number for total inventory
and treat it as an upper bound on how fast the cloud is growing right now.
</div>

## 4. Why LN₂ is dangerous despite being inert

Liquid nitrogen is the fluid people get casual with — inert, cheap, in every lab.
It kills by two mechanisms, neither of which involves nitrogen reacting with
anything.

### 4.1 Asphyxiation without a warning signal

An inert gas hurts you by displacing oxygen, and **the human body has no sensor
for oxygen**. The urge to breathe tracks rising carbon dioxide, not falling
oxygen; in a nitrogen-diluted volume CO₂ still washes out normally on every
exhale, so nothing tells you to leave. No smell, no taste, no irritation — which
makes nitrogen more dangerous than a toxic gas like chlorine or ammonia, both of
which announce themselves `[EIGA-44]`.

EIGA's physiology table `[EIGA-44]`, for a healthy person at rest at sea level:
19.5–10 % oxygen impairs thinking and coordination; 10–6 % brings nausea and
possible unconsciousness; below 6 %, convulsions, cessation of breathing and
cardiac standstill, *immediately*. In EIGA's words, an oxygen-deficient
atmosphere *"can bring about unconsciousness without warning. In as little as one
or two breaths, an individual's life can be endangered."* The US Chemical Safety
Board built an entire bulletin around this failure `[CSB-NITROGEN]`. The
regulatory line is **19.5 % oxygen by volume** for oxygen-deficient and **23.5 %**
for oxygen-enriched — OSHA 29 CFR 1910.146, in force, no edition year
`[OSHA-1910.146]`. And the inventory is larger than it looks: one cubic metre of
spilled LN₂ becomes about **696 m³ of gas** at 70 °F, so a dewar tipped over in a
lift is a roomful of atmosphere.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
A colleague collapses beside an LN₂ dewar in a small room. You go in to pull
them out and collapse on top of them. Unprotected rescuer entry is
<em>"one of the most common causes of multiple fatalities in cases involving
asphyxiation"</em> <code>[EIGA-44]</code>. The second body is the one the
statistics are built on. Recognising an oxygen-deficient volume from outside it
is the skill; entry is a trained, permitted activity governed by
<code>[OSHA-1910.146]</code>, not something to improvise.
</div>

### 4.2 The one that surprises people: LN₂ makes LOX

Look again at Figure 2.1. **LN₂ boils at 77.3549 K; oxygen boils at 90.1875 K.**
Liquid nitrogen is 12.83 K *colder* than liquid oxygen, so any surface chilled to
LN₂ temperature and open to air condenses oxygen out of it continuously, as a
pale blue liquid.

The sharpest statement of this is a coincidence that is exact rather than
approximate, derived in `reference/properties.md` §11.1 from NIST vapour
pressures rather than repeated from folklore: **the vapour pressure of pure
oxygen at 77.355 K is 0.2076 bar, and the partial pressure of oxygen in air at
1 atm is 0.2122 bar** (0.20946 × 1.01325). Within 2 %. Atmospheric oxygen is
*already essentially at saturation* at liquid-nitrogen temperature, and anything
marginally colder pulls it out of the air.

What condenses is not air. A Raoult's-law calculation on the same NIST vapour
pressures puts air's dew point at 1 atm near **82 K**, with the first liquid at
**≈53.5 mol % oxygen** — against 20.95 % in the air it came from (Confidence A
for the computation; the ideal-solution assumption makes it good to a few
percent, not better). That independently confirms the "about 50 %" figure in
university and national-laboratory EHS literature `[CORNELL-CRYO]`
`[LBNL-PUB3000-29]`. With continued exposure nitrogen preferentially boils off
and the pool enriches further — LBNL and others report **as high as 80 %**; the
trend is certain, the number is indicative rather than measured.

So an uninsulated LN₂ line or an open cold trap in humid air is quietly making
roughly half-and-half liquid oxygen and dripping it onto whatever is underneath.
If that is asphalt, an oily grating or a rag, you have built an
oxygen-enrichment hazard out of the "safe" cryogen. Pale blue liquid where you
expected LN₂ is not a curiosity; it is LOX, plus whatever organics condensed
with it.

Two contrasts. **LH₂ does the same and worse** — at 20.4 K it freezes air solid,
plugging lines and depositing solid oxygen `[SANDIA-SFBREEZE]`. **Liquid methane
cannot do it at all**: its NBP of 111.7 K is 21.5 K *above* oxygen's, so a
methalox system has no oxygen-condensation problem on the fuel side. It has a
different one, in §6.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
"Inert" describes the chemistry, not the hazard. Nitrogen's two kill mechanisms
are an atmosphere you cannot detect with your body, and an oxidiser it
manufactures from the air on every surface it cools.
</div>

## 5. Why LOX makes ordinary situations dangerous

**Oxygen is not a fuel. It does not burn.** The distinction is not pedantry: it
fixes the control strategy. You cannot make an oxygen system safe by removing the
oxygen, because oxygen is the product — you remove fuels and ignition sources
`[AP-SG-6]`.

What enrichment does to flammability is widely misremembered. The intuition
"more oxygen, so things ignite at lower fuel concentrations" is wrong at the lean
end: lower limits in oxygen and in oxygen–nitrogen mixtures are essentially the
same as in air `[USBM-627]`. What moves, enormously, is the rich limit.

<figure>
<svg viewBox="0 0 660 235" role="img" aria-label="Flammable ranges as horizontal bars: methane in air 5 to 15 percent, methane in oxygen 5.15 to 60.5 percent, hydrogen in air 4 to 75 percent, hydrogen in oxygen 4.65 to 93.9 percent. All four lean limits cluster at nearly the same value near 5 percent while the rich limits differ enormously.">
  <text x="0" y="20" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" font-weight="700">Flammable range, vol % fuel</text>
  <g font-family="system-ui, sans-serif" font-size="13" fill="currentColor" text-anchor="end">
    <text x="104" y="55">CH₄ in air</text>
    <text x="104" y="90">CH₄ in O₂</text>
    <text x="104" y="125">H₂ in air</text>
    <text x="104" y="160">H₂ in O₂</text>
  </g>
  <rect x="134" y="42"  width="48"  height="18" fill="var(--fuel)" opacity="0.75"/>
  <rect x="135" y="77"  width="265" height="18" fill="var(--warn)" opacity="0.75"/>
  <rect x="129" y="112" width="341" height="18" fill="var(--fuel)" opacity="0.75"/>
  <rect x="132" y="147" width="429" height="18" fill="var(--warn)" opacity="0.75"/>
  <g font-family="system-ui, sans-serif" font-size="13" fill="currentColor">
    <text x="190" y="56">5.0 – 15.0</text>
    <text x="408" y="91">5.15 – 60.5</text>
    <text x="478" y="126">4.0 – 75.0</text>
    <text x="569" y="161">4.65 – 93.9</text>
  </g>
  <line x1="131" y1="36" x2="131" y2="180" stroke="var(--muted)" stroke-dasharray="4 3"/>
  <text x="138" y="196" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">the lean limits barely move — the rich limits explode</text>
  <line x1="110" y1="180" x2="600" y2="180" stroke="currentColor" stroke-width="1.5"/>
  <g font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)" text-anchor="middle">
    <text x="110" y="214">0</text><text x="206" y="214">20</text><text x="302" y="214">40</text>
    <text x="398" y="214">60</text><text x="494" y="214">80</text><text x="590" y="214">100</text>
  </g>
</svg>
<figcaption>Figure 2.3 — Oxygen enrichment and flammable range. Methane's window widens roughly fourfold; the lean limit moves by 0.15 percentage points. Bulletin 503 values, measured on the same apparatus by the same investigators, so the air-versus-oxygen comparison is genuinely like-for-like <code>[USBM-503]</code>, Confidence A.</figcaption>
</figure>

Methane in air is flammable from **5.0 % to 15.0 %**; in pure oxygen, from
**5.15 % to 60.5 %** `[USBM-503]`. (The classical 15 % is a flammability-tube
value with a visual criterion; a 120-litre closed vessel with a pressure-rise
criterion gives 15.8 % `[NIOSH-ZLOCHOWER]`. Both are right — a flammability
limit is a property of the gas *plus* the vessel *plus* the criterion, never of
the gas alone.)

What does a wide rich limit mean physically? A flame needs enough oxidiser to
carry the reaction. In air, four fifths of the atmosphere is inert ballast, so
above about 15 % fuel there is no longer enough oxygen and the mixture
self-extinguishes. Remove the ballast and the ceiling lifts — at 50 % methane in
oxygen there is still ample oxidiser. The practical consequence is that **far
more of the possible mixtures in the room are ignitable**: a methane leak into
ordinary air spends most of its dilution history outside the flammable band,
while the same leak into an oxygen-enriched space — exactly what a co-located LOX
leak creates — is flammable across most of the composition range.

The bigger effect is not about gases at all. **Materials that are not fuels in
air become fuels in oxygen.** Most materials, metals included, burn in an
oxygen-enriched environment, ignite at considerably lower temperatures than in
air, and burn faster once ignited `[NASA-TM-104823]`; nearly all polymers are
flammable in 100 % oxygen at 1 atm `[NASA-TM-2007-213740]`. "Fire-resistant",
"self-extinguishing", "it's only aluminium" — none of those survive the move
into oxygen service.

The version that hurts people directly: **clothing saturated with oxygen is
readily ignitable and will burn vigorously** `[AP-SG-6]`. A LOX vent plume soaks
coveralls in an oxidiser that persists long after you walk away — Air Products
advise airing exposed clothing at least an hour, clear of ignition sources.
Module 06 takes all of this apart. For now the recognition skill is: *near LOX,
ask what is no longer inert.*

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
A greasy fingerprint inside a LOX line is a fuel that ignites under adiabatic
compression when a valve snaps open. Nothing in the ordinary world flags a
fingerprint as a hazard; oxygen service does. That is why oxygen cleanliness is
a written, verified specification and not a matter of wiping something down.
</div>

## 6. Why methane is a different hazard environment

Methane is neither oxidiser nor inert. Being flammable brings an apparatus
neither LOX nor LN₂ requires: ignition-source control, bonding and grounding,
hazardous-area classification, detection alarmed well below the LFL. OSHA treats
a flammable gas above **10 % of its LFL** as a hazardous atmosphere
`[OSHA-1910.146]` — for methane's 5.0 % LFL, **0.5 vol %**. Its minimum ignition
energy in air is about **0.28–0.29 mJ** (Confidence B; never quote it to more
than two significant figures) against roughly **10 mJ** for a human static
discharge `[SANDIA-SFBREEZE]`, so that margin is not a margin. For area
classification methane is **NEC Group D** — cheaper, more available equipment
than hydrogen's Group B — under NFPA 70, 2026 edition, Articles 500–506
`[NFPA-70]`, a real capital-cost advantage and one reason methalox wins
spacecraft trades `[NASA-HURLBERT-2016]`.

The behaviour that defines methane's ground hazard is buoyancy. Warm methane
vapour is 0.555 times the density of air and rises strongly. **Cold methane
vapour does not.** At its boiling point it is 1.51 times as dense as ambient air
and must warm all the way to **164.25 K — 52.6 K above its NBP** — before it is
as light as 20 °C air. Sandia computed 164.3 K independently, agreeing to 0.05 K
`[SANDIA-SFBREEZE]`.

<figure>
<svg viewBox="0 0 660 280" role="img" aria-label="Cross-section of a bay showing three release behaviours: nitrogen and oxygen vapour sinking and staying near the floor, methane vapour pooling in a trench before lifting once it warms past 164 kelvin, and hydrogen or helium rising to the ceiling almost immediately.">
  <rect x="20" y="30" width="620" height="215" fill="var(--side)" stroke="currentColor"/>
  <line x1="20" y1="225" x2="640" y2="225" stroke="currentColor" stroke-width="1.5"/>
  <rect x="255" y="225" width="100" height="20" fill="var(--bg)" stroke="currentColor"/>
  <text x="305" y="240" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)" text-anchor="middle">trench</text>
  <text x="30" y="48" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">ceiling</text>

  <circle cx="120" cy="120" r="5" fill="var(--inert)"/>
  <path d="M 120 126 C 120 170, 110 195, 70 218 M 120 126 C 120 170, 130 195, 175 218" fill="none" stroke="var(--inert)" stroke-width="2"/>
  <ellipse cx="120" cy="219" rx="70" ry="7" fill="var(--inert)" opacity="0.35"/>
  <text x="120" y="105" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)" text-anchor="middle">LN₂ / LOX leak</text>
  <text x="108" y="265" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)" text-anchor="middle">sinks, stays down</text>

  <circle cx="305" cy="120" r="5" fill="var(--fuel)"/>
  <path d="M 305 126 C 305 170, 290 200, 270 222 M 305 126 C 305 170, 320 200, 340 222" fill="none" stroke="var(--fuel)" stroke-width="2"/>
  <ellipse cx="305" cy="238" rx="46" ry="6" fill="var(--fuel)" opacity="0.35"/>
  <path d="M 390 215 C 400 170, 395 120, 392 70" fill="none" stroke="var(--fuel)" stroke-width="2" stroke-dasharray="5 4"/>
  <polygon points="392,60 387,74 397,74" fill="var(--fuel)"/>
  <text x="305" y="105" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)" text-anchor="middle">LCH₄ leak</text>
  <text x="310" y="265" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)" text-anchor="middle">pools low, lifts above 164.25 K</text>

  <circle cx="545" cy="180" r="5" fill="var(--fuel)"/>
  <path d="M 545 174 C 545 130, 540 90, 542 62" fill="none" stroke="var(--fuel)" stroke-width="2"/>
  <polygon points="542,50 536,66 548,66" fill="var(--fuel)"/>
  <ellipse cx="545" cy="48" rx="60" ry="9" fill="var(--fuel)" opacity="0.3"/>
  <text x="545" y="200" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)" text-anchor="middle">LH₂ / He leak</text>
  <text x="545" y="265" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)" text-anchor="middle">buoyant within 1.7 K of NBP</text>
</svg>
<figcaption>Figure 2.4 — Every cryogenic release starts as a falling cloud; what differs is how long it stays one. Crossover temperatures from <code>reference/properties.md</code> §6, Confidence A, cross-checked against <code>[SANDIA-SFBREEZE]</code>.</figcaption>
</figure>

Combine 52.6 K of warming with an LFL of 5 % and the central methalox ground
hazard appears: **a cold methane leak makes a flammable cloud that goes
sideways** — into trenches, cable pits and doorways — rather than up. Detection
and layout must cover the low regime as well as the high one; Module 07 develops
that into detection strategy and area classification.

One caveat travels with every crossover temperature here: it is computed for
pure vapour warming in ambient air. A large spill entrains and *chills* that air,
and the cold mixture can stay negatively buoyant well past these temperatures.
**Treat the crossover as a floor on buoyant behaviour, not a guarantee of it.**

Methane's other defining feature is the second collision in Figure 2.1.
**Methane freezes at 90.6941 K; LOX boils at 90.1875 K** — boiling LOX is 0.507 K
colder than the temperature at which methane goes solid. A common-bulkhead tank
puts the two fluids in deliberate thermal contact across half a kelvin; a
LOX-cooled methane heat exchanger must be insulated to *retard* heat transfer,
the opposite of normal practice; and sub-cooling methane for density spends
margin toward freezing — NASA's ISRU trade lists subcooled methane at 101.7 K,
about 11 K above freezing `[NASA-CHEN-ISRU]`. State it as a design constraint
that follows from the property data: no primary source documenting an actual
methane-freezing incident was found.

## 7. Why hydrogen is harder than methane

Hydrogen is an appendix fluid in this course, so keep it short. Everything
methane asks of a facility, hydrogen asks harder:

- **Flammable range 4.0–75.0 % in air** against methane's 5–15 % `[AP-SG-9]`, so
  a hydrogen leak is inside its window over most of its dilution history. Oxygen
  closes most of that gap (4.65–93.9 % versus 5.15–60.5 %): **methane's advantage
  is an air-only advantage** `[USBM-503]`.
- **Minimum ignition energy about 0.017–0.020 mJ**, roughly fifteen times lower
  than methane's (Confidence B) — though both sit far below a 10 mJ human static
  discharge, so *neither margin is a margin*.
- **It leaks through joints that hold methane.** A fitting qualified on methane
  is not thereby qualified on the smallest molecule there is.
- **Buoyancy crossover 22.09 K, only 1.7 K above its boiling point** — buoyant
  almost immediately, which is why hydrogen practice is roof vents and high-point
  detection while methane practice must cover both regimes.
- **The flame is essentially invisible** in daylight, and hydrogen is **NEC
  Group B**, a more expensive equipment class than methane's Group D `[NFPA-70]`.

Note the inversion: hydrogen's autoignition temperature is *higher* than
methane's (roughly 500–580 °C, apparatus-dependent, against methane's commonly
cited 537 °C) even though hydrogen is far easier to spark-ignite. AIT and MIE
rank the two fuels oppositely because they measure different things.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
Learn the fluids as four different failure modes, not four cold liquids:
nitrogen fails by silence and by condensing oxygen; oxygen fails by changing
what counts as a fuel; methane fails by pooling low and finding a spark;
hydrogen fails by getting out at all.
</div>

## Checkpoint quiz

1. An uninsulated LN₂ line in a humid bay is dripping a pale blue liquid onto
   the concrete. What is it, what is its composition when it first forms, and
   why does that composition change over a shift?

2. True or false, with a reason: *"An oxygen-enriched atmosphere is dangerous
   because fuels start burning at lower concentrations than they do in air."*

3. A methane line develops a small cold leak at floor level in a bay whose only
   gas detectors are at ceiling level, next to the hydrogen detectors. What
   concerns you, and which number here supports the concern?

4. A design review proposes a common-bulkhead LOX/LCH₄ tank with the LOX side
   vented to atmosphere, so the LOX sits at its normal boiling point. Identify
   the thermal hazard and state the margin.

5. Conceptual calculation. A 50-litre dewar of LN₂ empties into a store room
   4 m × 3 m × 2.5 m. Using the 70 °F expansion ratio, estimate the gas volume
   produced and compare it with the room. Is the room inside or outside OSHA's
   oxygen-deficiency threshold, and give one reason the real hazard is worse
   than a uniform-mixing answer suggests.

<details>
<summary>Show answers</summary>

1. **Liquid oxygen — not liquid air, and not spilled nitrogen.** LN₂ boils
   12.83 K below oxygen, so the line condenses atmospheric oxygen. Air's dew
   point at 1 atm is about 82 K and the first condensate is **≈53.5 mol %
   oxygen** (derived from NIST vapour pressures, `properties.md` §11.1,
   Confidence A). It enriches because nitrogen preferentially boils out —
   reported as rising toward 80 %, a certain trend with an indicative number.
   The colour is the tell: LOX is pale blue, LN₂ colourless.

2. **False.** Lean limits in oxygen are essentially the same as in air
   `[USBM-627]`: methane's LFL moves 5.0 % → 5.15 %, 0.15 percentage points.
   What changes is the **upper** limit (15.0 % → 60.5 %, roughly ×4) and, more
   importantly, that materials which are not fuels in air — polymers, and
   metals — become fuels in oxygen. The statement gets the danger right and the
   mechanism wrong, which points control effort at the wrong place: the fix is
   fuel and ignition-source elimination and material selection, not a lower
   alarm setpoint.

3. Cold methane vapour is **1.51× denser than ambient air at its boiling point**
   and must warm to **164.25 K — 52.6 K above its NBP** — before it is as light
   as 20 °C air, so the leak spreads along the floor and into trenches and the
   ceiling detectors may never see it. Hydrogen is the opposite case, buoyant
   within 1.7 K of its boiling point, so detector placement copied from a
   hydrogen facility is actively wrong here. Action level: 10 % of LFL,
   **0.5 vol % methane**.

4. **LOX at its normal boiling point can freeze methane.** LOX boils at
   90.1875 K; methane's triple point — its 1 atm freezing point for practical
   purposes — is 90.6941 K. The margin is **0.507 K** with the LOX on the cold
   side, so a vented LOX tank sharing a bulkhead with liquid methane sits half a
   kelvin from solidifying fuel against that bulkhead. Framing matters: this
   follows from Confidence A property data, it is not a documented incident.
   Pressurising the LOX tank raises its saturation temperature and is how the
   margin is normally bought back.

5. 0.05 m³ × 696 ≈ **35 m³ of nitrogen gas** at 70 °F, against a room volume of
   4 × 3 × 2.5 = **30 m³**. The gas produced exceeds the whole room, so the room
   ends up essentially pure nitrogen — far below OSHA's 19.5 %, and below the
   6 % at which EIGA's table gives convulsions and cardiac standstill with
   symptoms that *can occur immediately*. Why the real hazard is worse than the
   tidy answer: the cold vapour does **not** mix uniformly — nitrogen's
   crossover is 283.6 K, so it sinks and stratifies, and a reading taken at head
   height in the doorway can look normal while the lower half of the room is
   lethal.

</details>
