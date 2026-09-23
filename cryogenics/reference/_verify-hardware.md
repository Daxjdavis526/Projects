# Cryogenic Hardware — Design-Review Reference

**Purpose.** Source-verified background on the physical hardware of a cryogenic
propellant system, written for a propulsion *safety* course. The framing is
design review: what each item does, how the cold version differs from its
room-temperature cousin, what an engineer has to decide, and what people worry
about breaking. Nothing here is a procedure. There are no build instructions,
no set-up steps, no operating sequences. Numbers are given so the course can
teach with real figures instead of hand-waving; every one of them is traceable.

**Status.** Draft for verification. Everything below carries a confidence label
and a working URL. Anything that could not be verified against a real document
has been left out rather than guessed.

---

## Confidence key

| Label | Meaning |
|---|---|
| **A** | Taken directly from a primary authoritative document that was fetched and read: a national-lab ES&H manual, a NASA technical report, a CGA/AIGA standard, or a manufacturer's own catalogue or product manual. |
| **B** | Reputable technical source (industry association, standards body's own catalogue page, peer-reviewed or conference literature), or a primary document cited *by* an A-source but not itself read end to end. |
| **C** | Vendor or trade explanatory material. Directionally reliable and consistent with A/B sources, but the specific numbers should be confirmed against a controlling document before a design decision rests on them. |

**A caution on document numbers.** Every standard cited by number below was
checked against the issuing body's own publication database or a public copy.
The CGA numbers were verified one by one at `legacy.cganet.com`. No document
number in this file was reconstructed from memory.

---

# 1. Storage and containment

## 1.1 The four things people all call "a tank"

Four quite different pressure-vessel philosophies get lumped together in casual
speech. Confusing them is a classic root cause, because each has a different
relief basis and a different failure signature.

### Open-neck dewars (laboratory dewars)

A double-walled vessel with an evacuated annulus, closed by a **loose plug**
rather than a seal. The plug's job is to let boiloff gas escape continuously
while keeping ambient air (and therefore water and CO2, which freeze) from
diffusing back down the neck.

The defining property is that **it is not a pressure vessel**. It is vented to
atmosphere by construction. LBNL describes these as suited to "short-term
storage of cryogenic liquids, at maximum several days," using "a loose fitting
plug style cap," and describes the glass-walled laboratory variety as
"double-layered glass, evacuated between the layers, with a protective aluminum
or steel casing," holding liquid "anywhere from a few hours to a few days"
depending on the lid. **[A]** —
https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch29/

*How it differs from a room-temperature equivalent:* there isn't one. The
nearest analogue is a vacuum flask, and the engineering difference is that the
contents are continuously boiling, so the vessel is a continuous gas source.

*What engineers worry about:*
- **Sealing it.** The single most dangerous thing anyone can do to an open-neck
  dewar is close it. Confined cryogen warming to ambient generates pressure
  "in excess of 10,000 psig" **[A]** (LBNL, link above).
- **Neck plugging with ice.** A frozen plug converts the dewar into a sealed
  vessel with no relief.
- **The dewar as an oxygen-deficiency source.** Expansion ratios are the reason:
  LN2 ~696:1, LAr ~847:1, LHe ~757:1, LO2 860:1, LH2 851:1 **[A]** (LBNL).
- **Glass dewars specifically:** implosion/explosion of the glass envelope.

### Pressurised liquid cylinders (portable "dewars", liquid cylinders)

A vacuum-jacketed **ASME pressure vessel** on castors, with an internal
pressure-building circuit, an economiser, a liquid withdrawal leg, a gas-use
path, and a relief stack. This is the workhorse container in a small propulsion
lab and the one most often misunderstood, because people call it a "dewar."

LBNL: intended for "longer-term storage of cryogenic liquids, on the order of a
few weeks to a few months," operating at "approximately 22 psig for liquid use,
or at higher pressures of 230 or 350 psig for gas use." **[A]** —
https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch29/

Chart's Dura-Cyl product manual confirms the pressure classes from the other
direction: its filling-weight tables are banded by relief-valve setting across
0–45 psig, up to 170 psig, 171–230 psig, 231–235 psig and 296–350 psig, and a
model line is labelled "Dura-Cyl 160 HP (350 psig max. RV)." **[A]** —
https://files.chartindustries.com/10642912_Liquid_Cylinder_Product_Manual_ws.pdf

*How it differs from a room-temperature gas cylinder:* a high-pressure gas
cylinder is a static store — pressure only falls as you draw from it. A liquid
cylinder is an **active, self-pressurising machine** whose pressure rises on its
own when idle and falls when you withdraw hard. It has moving parts and set
points. It is closer in behaviour to a small boiler than to a K-bottle.

*What engineers worry about:*
- **Pressure creep when parked.** Heat leak alone will walk the cylinder up to
  its relief setting and hold it there, venting.
- **Withdrawal outrunning the vaporiser**, so delivery pressure sags mid-run.
- **Being treated as an open dewar** and vented/handled accordingly.
- **Tipping**, which can put liquid into the gas-use circuit.

### Bulk storage tanks

Stationary, foundation-mounted, vacuum-jacketed ASME vessels, typically several
thousand to tens of thousands of litres, with an external vaporiser, a
pressure-building circuit, and a full relief system. Chart's bulk catalogue
gives a standard MAWP of **250 psig** for its vertical VS series, with "400,
500 psig tanks available upon request," and notes that the vertical series ships
with "dual relief valves and rupture disks supplied as standard." **[A]** —
https://files.chartindustries.com/13608592_BulkCatalog.pdf

*What engineers worry about:* the fire case and the loss-of-vacuum case (§4),
foundation/settlement loads, and vaporiser icing limiting delivery (§3.5).

### Run tanks

A run tank is a **test-stand** vessel sized for the duration of a firing rather
than for storage — it is filled from bulk or from a transporter shortly before
use and drained during the run. It is the tank the engine actually draws from.

NASA Stennis describes exactly this architecture: propellants are "supplied to
the stands from cryogenic transportation barges and supplied to the B-1 test
position from on-stand run tanks," with resupply from barge to run tank possible
during extended tests, and notes that Space Shuttle Main Engine testing required
run tanks that "were not large enough to support a full-duration (500 seconds)
hot fire," forcing real-time transfer barge → run tank → engine. **[B]** —
https://www.nasa.gov/centers-and-facilities/stennis/a-defining-era-ssme/

*How it differs from a storage tank:* a storage tank is optimised for **hold
time** (minimise heat leak, minimise boiloff, weeks of standing). A run tank is
optimised for **discharge** — large outlet, controlled ullage pressure, fast
drain, predictable pressure history under blowdown or regulated pressurisation.
It may be far less well insulated because it is only cold for hours. Its whole
design case is a transient.

*What engineers worry about:*
- **Ullage collapse** when cold pressurant contacts warm liquid, or warm
  pressurant condenses — the tank pressure drops out from under the feed. NASA
  pressurisation modelling explicitly covers "temperature blowdown in the COPV,
  ullage collapse in the propellant tank, and heat transfer from lines and
  components to/from the helium gas." **[B]** —
  https://ntrs.nasa.gov/api/citations/19980236000/downloads/19980236000.pdf
- **Stratification** — a warm surface layer over cold bulk gives a saturation
  pressure that does not represent the liquid being drawn.
- **Chilldown** consuming propellant budget before the run.
- **Geysering** in tall feed legs.

---

## 1.2 Vacuum-jacketed double-wall construction

### How the annulus works

Two concentric pressure boundaries. The inner vessel holds the cryogen; the
outer jacket holds atmospheric pressure out. The space between is evacuated,
which kills the dominant heat-transfer path — gas conduction and convection —
leaving only radiation across the gap and solid conduction through whatever
mechanically supports the inner vessel (necks, struts, piping penetrations).

Three consequences follow, and they drive most of the design:

1. **Radiation now dominates**, so you add radiation shields (MLI).
2. **The supports now dominate the residual**, so they are made long, thin, and
   from low-conductivity material — which fights structural requirements.
3. **The vacuum is a consumable.** It degrades by outgassing, permeation, and
   leaks. Hence getters and molecular sieve in the annulus, and a pump-out port.

AIGA 106/19, the industry standard for vacuum-jacketed piping in LOX service,
specifies that "each vacuum space shall be equipped with an evacuation port and
annular space relief device (typically provided as a combination device)" and
that "a vacuum transducer or pressure gauge should be installed for monitoring
the vacuum level without breaking the vacuum annulus." It describes the getter
chemistry directly: "Molecular sieve adsorbs all molecules larger than hydrogen.
The getter material converts free hydrogen into water that the molecular sieve
can then adsorb." **[A]** —
https://asiaiga.org/uploaded_docs/en_AIGA_106_19_Vacuum-Jacketed_Piping_in_Liquid_Oxygen_Service.pdf

### What "good vacuum" actually means, numerically

AIGA 106/19 gives acceptance and in-service criteria that are worth teaching
because they turn a vague word into a measurement. **[A]** (same URL)

- **Manufacturing helium leak test:** no detectable leakage with the mass
  spectrometer sensitivity set to at least 0.987 × 10⁻⁸ mbar·L/s, operated at
  5 microns of mercury absolute or less.
- **Standing vacuum retention test:** minimum two days at ambient temperature.
  Static vacuum shall be ≤ 5 × 10⁻⁴ mbar.
- **Acceptance:** vacuum level rises **less than 2 microns (≈2.6 × 10⁻³ mbar)
  per day for 2 days**, followed by a no-rise period, with a final level of no
  more than **15 microns (≈2 × 10⁻² mbar)**. "A steady increase throughout the
  retention period is not acceptable."
- **Spools between 15 and 35 microns** (≈2 × 10⁻² to 4.6 × 10⁻² mbar) require
  further evaluation.
- **In service, cold:** below 2 Pa (≈15 microns Hg) the vacuum "is suitable for
  the continuity of service"; between 2 Pa and 20 Pa (15–150 microns Hg) the
  vacuum "is degraded" and needs attention.

Note the unit convention: this document writes microns of mercury (= mTorr).

### Multilayer insulation (MLI, "superinsulation")

**What it is.** Alternating layers of a low-emissivity radiation shield
(typically aluminised Mylar, or aluminium foil) and a low-conductivity spacer
(Dacron net, glass paper, or perforations/crinkling in place of a spacer). It
only works in vacuum — the spacer's job is to keep shields from touching, and if
gas is present the spacer becomes a conduction path rather than an isolator.

**Why it works.** Radiation between two surfaces is cut roughly in proportion to
the number of intervening floating shields. Wesley Johnson's NASA/UCF thesis
states the trade precisely: "the conduction between reflectors increases with the
thickness of the spacer material, yet the radiation heat transfer is inversely
proportional to the number of layers," so performance "is a function of the
number of layers per thickness, or layer density." Adding layers helps radiation
and hurts conduction; there is an optimum layer density, not an optimum layer
count. **[A]** —
https://ntrs.nasa.gov/citations/20100034929
(full text: https://ntrs.nasa.gov/api/citations/20100034929/downloads/20100034929.pdf)

**How many layers.** Fesmire's aerogel comparison paper characterises the MLI
baseline from 26 different test specimens as spanning **10 to 80 layers**, with
~22 mm total thickness and ~50 kg/m³ typical. **[A]** —
https://ntrs.nasa.gov/api/citations/20180006600/downloads/20180006600.pdf

**MLI needs high vacuum to work at all.** Johnson: MLI "has been shown to be the
best performing cryogenic insulation system at high vacuum (less than 10⁻³
torr)." **[A]** Below that quality, gas conduction takes over and the layer
count stops buying anything. Johnson also found that the high-vacuum-to-soft-
vacuum transition point shifts with layer density, producing "soft vacuum
performance variations by as much as an order of magnitude depending on the
layer density" — i.e. two MLI blankets that look identical at high vacuum can
differ tenfold in a partial-vacuum-loss condition. **[A]**

**What degrades MLI — the four mechanisms.**

1. **Compression.** This is the big one and it is enormously underappreciated.
   Fesmire: compared with the no-load (<0.007 kPa) condition for six MLI systems
   averaging **0.6 W/m²**, "a mere 0.7 kPa (0.1 psi) will cause a 15× increase
   in heat flux. A modest 7-kPa load will cause an approximate 40× increase
   while a 70-kPa load will cause a more than 100× increase." **[A]** —
   https://ntrs.nasa.gov/api/citations/20180006600/downloads/20180006600.pdf
   A cable tie, a support pad, or someone leaning on a blanket locally destroys
   the insulation there.
2. **Seams, penetrations and edges.** Kogan/Fesmire/Johnson: "Compression, seams,
   penetrations and edge effects are known to increase heat leak through MLI
   systems by 100 percent or more if the system is improperly designed." **[A]** —
   https://ntrs.nasa.gov/api/citations/20110006939/downloads/20110006939.pdf
3. **Vacuum degradation** (above).
4. **Pressure cycling / blanket opening.** Johnson records a Shuttle-era reusable
   MLI system in which "over the course of the 100 pressure cycles, the MLI
   degraded by 26% between cycles 1 and 52 and 10% between cycles 53 and 100,"
   traced to "the opening up of the blankets at the seams during the pressure
   transients." **[A]**

Fesmire also lists MLI's three structural limitations plainly: high vacuum is
required; not all hardware can be suitably wrapped or covered; and "localized
compression will ruin the thermal performance. MLI cannot withstand mechanical
loading." **[A]**

MLI thermal testing follows **ASTM C740** as applicable. **[A]** (Fesmire, above)

### Loss of vacuum — what it does to boiloff

This is the single most important quantitative story in cryogenic safety,
because the step change is enormous and it sets relief sizing.

Jefferson Lab's overpressure chapter states the design values used in practice:
"Heat transfer rates between **25 and 40 kW/m²** have been used for bare metal
surfaces. Rates for insulated surfaces range from **1 to 7 kW/m²**." **[A]** —
https://www.jlab.org/ehs/ehsmanual/Pressure%20and%20Vacuum%20Systems%20Supplement/PSS%20Part%204%20Overpressure%20Protection.htm

Independent experimental figures agree. A dewar-industry technical note citing
helium-vessel testing with the vacuum compromised by air gives "16 kW/m² to
38 kW/m² for uninsulated surfaces" and "around 6 kW/m² for surfaces insulated
with multilayer insulation (MLI)." **[B]** —
http://www.mtm-inc.com/ac-20130930-sudden-loss-of-isolation-vacuum-in-cryogenic-liquid-dewars.html

Set that against a *healthy* system at roughly **0.6 W/m²** for uncompressed MLI
**[A]** (Fesmire). The ratio is on the order of **10⁴**. A vacuum jacket is not
a nice-to-have efficiency measure; it is the thing standing between normal
boiloff and a four-order-of-magnitude heat input step.

The mechanism matters too. Air rushing into a cold annulus **condenses and
freezes on the inner vessel**, and the latent heat of that condensation is what
delivers the enormous flux — it is not simple convection. LBNL notes the
corollary: air entering a cryostat and freezing can physically prevent relief
devices from functioning, and SLAC requires that "the system configuration must
ensure that any air that enters the cryostat and freezes cannot prevent proper
functioning of pressure relief devices." **[A]** —
https://www-group.slac.stanford.edu/esh/eshmanual/pdfs/ESHch36.pdf

A review of the loss-of-vacuum literature for helium systems frames the
engineering difficulty: "failure of the insulating vacuum results in rapid heat
transfer to the cryogenic helium often resulting in loss of fluids from venting,
potential over-pressure of the system, and risks damage to vessels and
equipment. The nature of the loss of vacuum problem is highly transient and
difficult to predict uniformly across applications." **[A]** —
https://arxiv.org/abs/2303.15309

Reported peak fluxes in the helium literature reach ~31 kW/m² (3.1 W/cm²) bare
and ~4.4 kW/m² (0.44 W/cm²) insulated. **[B]** (secondary reporting of Lehmann
and Zahn's classic half-filled-LHe-tank experiment; treat the attribution as B
until the original 1978 paper is read directly)

**Design-review implication.** Every vacuum-jacketed volume needs two relief
answers: one for normal boiloff, and one for the day the annulus goes to
atmosphere. They differ by orders of magnitude and they are usually satisfied by
different devices.

## 1.3 Perlite and foam — when each is used

### Evacuated perlite

Expanded volcanic glass powder, poured into the annulus and then evacuated. The
Perlite Institute's technical bulletin gives the numbers: for cryogenic service
at −150 °F (−101 °C) and below, "evacuated perlite provides a superior insulation
with thermal conductivity up to 40 times less than 0.200 Btu·in/h·ft²·°F
(0.029 W/m·K) depending on vacuum and temperature." Recommended density is
"8 to 9½ lb/ft³ (128 to 152 kg/m³)." At a mean temperature of −115 °F (−82 °C),
unevacuated cryogenic perlite at 4 lb/ft³ has a thermal conductivity "about 22
times as great as evacuated perlite at 8.7 lb/ft³ and interstitial pressure of
10 microns." Moisture limit is 0.1 % by weight — wet perlite cannot be pumped
down. **[A]** —
https://www.perlite.org/wp-content/uploads/2018/03/super-insulating-perlite-evacuated-cryogenic-service.pdf

**Why perlite instead of MLI on big tanks.** Perlite tolerates a far worse
vacuum. Fesmire's data notes that the pressure "most commonly used in the
Perlite insulated vessels is in range from 1 to 10 millitorr" **[A]** —
https://ntrs.nasa.gov/api/citations/20110006939/downloads/20110006939.pdf
— versus below ~1 millitorr for MLI to reach its potential. It is also poured
rather than hand-wrapped, so it fills complex annuli and large field-erected
spheres without skilled layup, and it does not care about compression the way
MLI does. The trade is bulk: you need a thick annulus, and perlite settles and
compacts over thermal cycles, which can pack it against the inner vessel and
locally raise heat leak (and, in the worst case, load the inner vessel).

**Rule of thumb from the sources:** MLI where the annulus is thin, the vacuum
can be held below ~1 mTorr, and the layup is manufacturable — small vessels,
transfer lines, flight hardware. Evacuated perlite where the vessel is large,
field-erected, or the annulus geometry is awkward — bulk storage, large spheres.
Composite systems (MLI over a bulk fill, or MLI plus fibreglass) split the
difference; Chart markets exactly such a hybrid as "Composite Super Insulation."
**[A]** — https://files.chartindustries.com/13608592_BulkCatalog.pdf

### Foam

Foam is the **non-vacuum** answer. Its use case is where a vacuum jacket is
impractical: flight tank exteriors, long ambient-pressure runs, complex shapes,
and anywhere weight or cost rules out double walls.

NASA's spray-on foam insulation (SOFI) work gives the ground-vs-space contrast
in one line: SOFI over MLI prevented purge-gas liquefaction within the MLI and
gave a ground-hold heat leak of **63 W/m²**, while orbit-hold tests gave
**0.085 and 0.22 W/m²** at warm boundary temperatures of 164 K and 305 K.

> **[C] — FLAGGED FOR VERIFICATION.** These three figures surfaced in an
> aggregated index of NASA abstracts, and the specific originating report was
> not located before the research budget for this file was exhausted. The
> figures are consistent with the SOFI/MLI literature and with the orders of
> magnitude elsewhere in this file, but **do not put them in course material
> until the source report is identified.** The right place to look is Fesmire's
> KSC Cryogenics Test Laboratory output on composite insulation systems, whose
> comparative framework and boiloff-calorimetry method are documented at
> https://ntrs.nasa.gov/api/citations/20180006600/downloads/20180006600.pdf
> **[A]**.

The *qualitative* point stands on firmer ground and is the one worth teaching:
a foam layer over MLI exists partly to stop the purge gas in the annulus from
condensing into the MLI during ground hold, and ground-hold heat leak through an
ambient-pressure foam system is two to three orders of magnitude worse than the
same tank's on-orbit performance.

For piping, the vendor-reported contrast is roughly **0.5–2.0 W/m² for
vacuum-jacketed versus 5–20 W/m² for foam** **[C]**, and Chart states its
vacuum-insulated pipe "delivers thermal efficiency greater than 10 times better
than traditional foam insulated pipe" **[C]** —
https://www.chartindustries.com/Products/Vacuum-Insulated-Pipe

**What engineers worry about with foam:** it is not a vapour barrier. Ambient
moisture drives into the foam, condenses, and freezes; the ice raises
conductivity, adds mass, and on cycling cracks the foam, which admits more
moisture. This is a ratchet — foam-insulated cryogenic lines degrade
monotonically unless the vapour barrier is genuinely sealed. Foam on LOX service
additionally raises material-compatibility questions (see CGA G-4.4, *Oxygen
Pipeline and Piping Systems*, verified at
https://legacy.cganet.com/Publication/Details.aspx?id=G-4.4 ) **[B]**.

## 1.4 Typical boiloff rates

Boiloff is quoted as **NER — Normal Evaporation Rate** — the percentage of a
full container's contents lost per day, standing idle at about one atmosphere.
It is the single number that tells you how good the insulation actually is, and
it is measured, not calculated: fill, close up, and weigh over 24 hours.

Definition and method, from a cryogenic equipment manufacturer: NER is "the
amount of cryogenic liquid that boils off to vapor during a given period of
time," expressed in volume per unit time, "often calculated by weight since that
is easier to measure," with the weight change over 24 hours divided by the
latent heat of vaporisation to yield heat leak in watts. **[C]** —
https://cranecryogenics.com/normal-evaporation-rate-ner-for-dewars/

### Bulk tanks — real catalogue figures

These are the strongest numbers in this file because they come from a
manufacturer's own published specification table, tank model by tank model.
Chart bulk storage catalogue, standard MAWP 250 psig **[A]** —
https://files.chartindustries.com/13608592_BulkCatalog.pdf

| Series | Smallest model | → | Largest model |
|---|---|---|---|
| Vertical (VS), NER %/day in **O₂ / Ar** | 0.35 | 0.25 → 0.15 | 0.10 |
| Vertical (VS), NER %/day in **N₂** | 0.56 | 0.40 → 0.24 | 0.16 |
| Horizontal (HS), NER %/day in **O₂ / Ar** | 0.56 | 0.32 → 0.22 | 0.15 |
| Horizontal (HS), NER %/day in **N₂** | 0.90 | 0.52 → 0.35 | 0.24 |

Three lessons a course should draw from this table:

1. **Bigger is better.** NER falls by roughly 3–4× from the ~1,500 gal model to
   the ~15,000 gal model, and then plateaus. Surface-to-volume ratio, directly
   visible in a product catalogue.
2. **Nitrogen is worse than oxygen or argon** in the same tank — roughly 1.6×
   worse. Same heat leak, but LN₂'s lower latent heat per unit volume means the
   same watts boil off a larger fraction per day.
3. **Vertical beats horizontal** for the same capacity, by a substantial margin
   (0.56 vs 0.90 %/day in N₂ at the small end). Less surface, and fewer/shorter
   support paths.

Chart also lists **flow capacity 9,000–42,000 SCFH** across the range, rated
"down to a 20 % contents level" — a reminder that a bulk tank's delivery
capability is a function of how full it is. **[A]**

### CO₂ / N₂O bulk tanks

Same catalogue: NER 0.15 / 0.08 / 0.05 / 0.04 %/day for vertical 6 / 14 / 30 /
50 ton units, MAWP 350 psig. **[A]** (much lower — warmer fluid, smaller ΔT)

### Laboratory dewars

Small vessels are dramatically worse, and this is where intuition usually fails.
A manufacturer's worked example: a **10-litre dewar of LN₂ with an NER of 8.8
litres/day**, giving a holding time of **1.1 days**. **[C]** —
https://cranecryogenics.com/normal-evaporation-rate-ner-for-dewars/

Note that this is quoted in litres/day, not %/day; as a percentage it is
enormous. Small open-neck dewars are, for practical purposes, continuously
venting gas sources — which is exactly why they drive oxygen-deficiency analysis
in small rooms (§5.5).

Two caveats worth teaching alongside any NER figure **[C]** (same source, plus
general vendor guidance):
- **An unchilled vessel boils far harder.** "If you fill an unchilled vessel the
  initial evaporation rate will be greater." First-fill losses are not NER.
- **Static ratings are not working ratings.** Opening a vessel, inserting probes,
  or drawing from it degrades hold time substantially below the catalogue figure.

### The general industry picture

For orientation only: standard commercial vessels are commonly quoted at 1–3 %
per day; small-to-mid bulk tanks around 1 %; very large tanks 0.5 % or less;
and the best modern large systems 0.03–0.05 %. **[C]** — these are aggregated
vendor/forum figures and should be treated as a sanity range, not as data. The
Chart catalogue table above is the citable version.

## 1.5 Pressure-build circuits

### What the circuit is

A liquid cylinder or bulk tank does not need an external pressurant to deliver
liquid. It pressurises itself by boiling a little of its own contents.

The loop: liquid is taken off the **bottom** of the inner vessel, routed through
a **pressure-building (PB) vaporiser coil** in contact with ambient air (or on
the warm side of the jacket), where it gasifies, and returned to the **ullage**
at the top. Adding gas to the ullage raises tank pressure. A **PB regulator**
senses tank pressure and opens the loop when pressure falls below its set point,
closing it when the set point is reached. The tank thus holds its own delivery
pressure with no external supply and no moving pumps.

Chart's description of the mechanism: "As the tank pressure drops below the PB
set point, the regulator opens and allows liquid to flow off the bottom of the
tank, through the internal PB vaporization coils, through the R-1 and back into
the gas phase of the tank." **[B/C]** (Chart/MVE liquid cylinder documentation;
the mechanism is confirmed in Chart's own manual, which discusses PB regulator
set points, PB coil frosting, and PB circuit troubleshooting throughout) **[A]** —
https://files.chartindustries.com/10642912_Liquid_Cylinder_Product_Manual_ws.pdf

### The economiser — the second half nobody explains

Alongside the PB regulator sits an **economiser regulator**, set slightly
*higher*. Its job is the opposite: when tank pressure rises above its set point
(from heat leak while idle), it routes the **withdrawal flow from the ullage
instead of from the liquid leg**, so that the customer's demand consumes the
excess head gas rather than venting it.

The two regulators are deliberately offset. Chart/MVE documentation describes
"a fixed pressure difference of about 15 psig ... factory set between the
pressure building and economizer regulating pressures." **[C]**

Typical published PB set points are MP 125 psig, HP 300 psig, VHP 450 psig
**[C]**; the corresponding relief-valve settings are visible directly in Chart's
own filling tables, banded 0–45, up to 170, 171–230, 231–235 and 296–350 psig,
with a model line explicitly labelled "Dura-Cyl 160 HP (350 psig max. RV)."
**[A]** (same manual URL)

### Why this matters operationally — the design-review view

- **The tank is a pressure source that never switches off.** Even with the PB
  valve closed, heat leak alone drives pressure up. A parked cylinder will reach
  its relief setting and sit there venting. Every stored liquid cylinder is a
  slow, continuous gas release into whatever room it is in.
- **Delivery pressure is coupled to withdrawal rate.** Draw faster than the PB
  coil can vaporise and pressure sags mid-run; this is a feed-system stability
  problem, not a nuisance. The PB coil is a heat exchanger with finite capacity,
  and its capacity *falls* as it ices up.
- **The economiser changes what comes out.** With the economiser open, you are
  drawing **gas**, not liquid. A system expecting liquid at the outlet gets
  two-phase or vapour. This is a real and commonly missed failure mode for a run
  tank fed from a liquid cylinder.
- **Symptom reading.** Chart's own troubleshooting logic is instructive: if
  "the pressure builds to the relief valve setting and the PB coil near the
  bottom of the tank is cold or frosted," the PB regulator has failed to close —
  the tank is pressurising itself uncontrollably. Conversely a frosted line or
  head indicates a leak. **[A]** (same manual)
- **Frost is diagnostic, not decorative.** Chart notes that a ring of ice or an
  oval ice ball "often remains on the cylinder for days after the last use" and
  is normal — but *permanent or growing* external ice on a vacuum-jacketed
  surface means the vacuum is failing. LBNL states it plainly: "if ice does form
  on the outside of the dewar, it indicates that the dewar may have lost
  vacuum." **[A]** — https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch29/
  AIGA 106/19 makes the same call for piping: "If frost, ice, or condensation is
  permanent and/or grows on vacuum-jacketed components, monitor the components
  and check the vacuum level of that section." **[A]**

---

# 2. Piping and joints

## 2.1 VJ piping vs foam-insulated piping vs bare line

**Bare line.** Uninsulated pipe. Legitimate only for short runs where the heat
leak and the frost/ice accretion are acceptable and nobody can touch it. On LOX
service a bare line condenses atmospheric moisture and, more dangerously, liquid
air on the outside — which is oxygen-enriched (~50 % O₂) as it drips. Bare line
is also the worst case for relief sizing: JLab's design figures put bare metal
at **25–40 kW/m²** under a cold-surface heat-flux condition, versus 1–7 kW/m²
insulated. **[A]** —
https://www.jlab.org/ehs/ehsmanual/Pressure%20and%20Vacuum%20Systems%20Supplement/PSS%20Part%204%20Overpressure%20Protection.htm

**Foam-insulated line.** Cheap, field-repairable, no vacuum to maintain, and
adequate for short or intermittent runs. Fails by moisture ingress → ice →
cracking → more ingress (see §1.3). Vendor-reported heat leak in the range
**5–20 W/m²** **[C]**.

**Vacuum-jacketed (VJ) line.** Pipe-within-a-pipe with an evacuated, MLI-filled
annulus. Vendor-reported **0.5–2.0 W/m²** **[C]**, i.e. roughly an order of
magnitude better than foam — Chart claims "greater than 10 times better than
traditional foam insulated pipe" **[C]**
(https://www.chartindustries.com/Products/Vacuum-Insulated-Pipe). VJ is the
default for anything long, anything that must stay single-phase at the far end,
and anything where chilldown losses matter.

*The decision, in review terms:* VJ buys you low heat leak and a frost-free
outer surface (touchable, no liquid-air drip) at the cost of a maintained
vacuum, expansion joints, bayonets, annulus relief devices, and a much harder
field repair. Foam buys you simplicity at the cost of monotonic degradation.

## 2.2 Why VJ piping needs expansion joints

Because the inner pipe shrinks and the outer pipe does not.

The inner line goes to 77 K (or 90 K, or 20 K); the jacket stays near ambient.
Austenitic stainless contracts roughly 0.3 % from 293 K to 77 K — on a 30 m run
that is close to 90 mm of differential movement that has to go *somewhere*.
Without a take-up element the contraction loads the jacket, the supports, and
every branch connection.

> **[B] — the ~0.3 % contraction figure.** The standard reference for
> 304 stainless linear contraction 293 K → 77 K is NIST's cryogenic material
> property compilation, which draws on Corruccini and Gniewek (1961):
> https://trc.nist.gov/cryogenics/Papers/Material_Properties/2000-Cryogenic_Material_Properties_Database.pdf
> Read the exact coefficient off the NIST source before quoting a number in
> course material; the 0.3 % here is the widely used engineering approximation,
> not a value transcribed from the table.

AIGA 106/19 makes the requirement explicit: "A flexibility analysis shall be
performed to consider the thermal compensation of the inner pipe due to thermal
contraction of the inner pipe (selection of bellows, identification of the
fixed-point supports, and sliding supports)." It requires that expansion joints
"be installed according to Standards of the Expansion Joint Manufacturers
Association, Inc.," that flexible hoses be designed to ASME B31.3 or equivalent,
and that "the bellows should be dimensioned for a minimum of 1000 cycle loads."
It also notes the alternative: "Overall system flexibility can be addressed by
adding expansion loops, specifically when external bellows are used." **[A]** —
https://asiaiga.org/uploaded_docs/en_AIGA_106_19_Vacuum-Jacketed_Piping_in_Liquid_Oxygen_Service.pdf

The 1000-cycle figure is a good design-review question: *how many cold cycles
will this line actually see over its life, and does that exceed the bellows
rating?* A test stand that chills down twice a day eats 1000 cycles in under
two years.

## 2.3 Why VJ piping needs a vacuum-annulus relief

Because the annulus is a **sealed volume adjacent to a cryogen**, and if the
inner pipe leaks, the annulus fills with liquid that then boils. Without a
relief path, the jacket — designed only to hold out one atmosphere — becomes a
pressure vessel and bursts.

AIGA 106/19: an "Annular space relief device (typically incorporated within the
vacuum pump out port to minimize penetrations to the vacuum jacket) is required
on the vacuum jacket to prevent over pressurization of the annular space in case
of internal leakage." **[A]** (same URL)

Two details from the same document that matter in review:
- The **pump-out port must not be blocked** by a wall or structure — it is a
  relief path, not just a service port.
- **A missing pump-out port plug is a symptom.** "If a vacuum pump out port plug
  is missing, this could indicate an inner leak that should be investigated
  immediately." **[A]** The plug blew because the annulus pressurised.

Jefferson Lab's rule is that the insulating vacuum space "must also be relieved,"
and points at **CGA S-1.3** for the required capacity. **[A]** —
https://www.jlab.org/ehs/ehsmanual/Pressure%20and%20Vacuum%20Systems%20Supplement/PSS%20Part%204%20Overpressure%20Protection.htm
JLab also carves out a practical exemption worth knowing: relief devices with set
pressures below 30 psi protecting vacuum jackets for cryogenic piping ≤ NPS 6
are not required to meet the full ASME BPVC requirements. **[A]**

Fermilab's PIP-II team frames the large-scale version of the same problem:
they size "vacuum vessel relief sizing to protect the cryogenic distribution
system vacuum shells from over pressure during an internal line rupture."
**[A]** — https://arxiv.org/abs/2307.08608

## 2.4 Bayonet joints

**What it is.** A demountable connection between two VJ lines made of two
concentric-tube halves that slide into one another, male into female, with the
seal made at the *warm* end and the cold ends never touching directly. It is
long and slender on purpose.

**Why not just a flange.** A flange on a cold line is a direct metal conduction
path from ambient to cryogen, it frosts and drips, its gasket sees the full
temperature swing, and it must be broken to service the line. A bayonet moves
the seal away from the cold and uses a **static column of vapour** in the
annulus between the two halves as the insulator.

Industry description: the bayonet is "relatively long to provide for thermal
isolation between the room temperature end of the joint and the cold piping.
When one bayonet is inserted in the other and cryogenic fluid flows inside the
inner tube, a static column of vapor fills the region between the two bayonets,"
with sizes chosen for "a close sliding fit to keep the dimensions of this vapor
column to a minimum and reduce heat loss due to convection." Each side keeps its
own isolation vacuum. **[C]** — https://www.mtm-inc.com/how-cryogenic-bayonets-work.html

It also solves contraction: the sliding fit lets the inner tube move as it cools
without loading the joint. **[C]** (same source)

**What engineers worry about:**
- **Installation.** AIGA 106/19: "If not installed correctly, bayonet connections
  can lead to leaks," and warns specifically about leakage into the annular
  space, recommending designs "where axial forces for inner seal and flange
  gaskets can be adjusted independently." **[A]**
- **Icing at the joint.** AIGA 106/19 includes a figure captioned "Example of an
  iced bayonet connection" as something to investigate — an iced bayonet means
  the vapour column has been defeated or the annulus has failed. **[A]**
- **LOX-specific ignition risk.** AIGA 106/19 flags that "Liquid oxygen leaking
  into the annular space or the gap between the male/female parts of the bayonet
  and being totally evaporated can, in the long term, enrich hydrocarbons on the
  metal surface until an ignition occurs," alongside an uncontrolled pressure
  release from the evaporation itself. **[A]** This is the reason LOX systems
  have cleanliness standards at all — see **CGA G-4.1**, *Cleaning of Equipment
  for Oxygen Service* (https://legacy.cganet.com/Publication/Details.aspx?id=G-4.1)
  and **CGA G-4.4**, *Oxygen Pipeline and Piping Systems*
  (https://legacy.cganet.com/Publication/Details.aspx?id=G-4.4). **[B]**
- **Adequate support.** AIGA 106/19 devotes a figure to "well supported bayonet
  connections" — an unsupported bayonet is a cantilever with a seal in it. **[A]**

## 2.5 Flexible hoses, transfer lines and bellows

### Why bellows exist

Two jobs, and they are worth separating in a review:
1. **Contraction take-up** in VJ line — the inner pipe shrinks relative to the
   jacket, and a bellows absorbs the difference (§2.2).
2. **Misalignment and motion** — flexible transfer hoses between a mobile dewar
   and fixed plumbing, or across a thrust structure that moves under load.

AIGA 106/19 distinguishes **internal and external bellows** (its Figure 3) — a
bellows on the inner line inside the vacuum, versus one in the jacket itself.
The choice changes what the vacuum sees and how supports must behave: "For vacuum
jackets with external bellows, external pipe supports shall allow the piping
system to move in order to relieve thermal expansion." **[A]**

### How bellows fail

**Squirm (instability)** — the failure mode unique to bellows and the one people
have not usually heard of. When internal pressure exceeds the bellows' stability
limit, the convolutions buckle sideways. US Bellows distinguishes two forms:
*column squirm*, "a gross lateral shift of the centre section of the bellows,"
associated with a large length-to-diameter ratio and analogous to column
buckling; and *in-plane squirm*, "a shift or rotation of the plane of one or
more convolutions such that the plane of these convolutions is no longer
perpendicular to the axis," driven by high meridional bending stress at the root
and crest. Critically: **a squirmed bellows cannot be reset — it must be
scrapped**, and if left in service the deformity "leads to rapid mechanical
fatigue and thus reduced cycle life." **[B]** —
https://usbellows.com/resources/squirm-or-instability/

**EJMA requires a safety factor of 3 against squirm**, and the designer must
"limit movement capacity and flexibility to a level that insures that the
bellows retains a conservative margin of column stability beyond the required
design pressure." **[B]** — https://usbellows.com/resources/squirm-or-instability/
and https://www.ejma.org/bellows/

**Fatigue.** Bellows are displacement-cycled by definition, so cycle life is a
design quantity, not an afterthought. AIGA 106/19's minimum 1000 cycles **[A]**
is a floor. Material choice, cleaning, and heat treatment before forming all
drive fatigue life, and "improper cleaning can result in premature failure."
**[B]** — https://usbellows.com/resources/installation-maintenance-metallic-ej/typical-causes-of-failure/

**Flow-induced vibration.** Above a critical velocity, flow across the
convolution cavities sheds vortices at the convolution-pitch frequency; if that
coincides with the bellows natural frequency (typically tens to a couple of
hundred Hz depending on size) the convolutions resonate and accumulate fatigue
cycles extremely fast. This is why high-velocity bellows get internal liners.
**[C]**

**Other causes.** Improper installation, overpressurisation, unforeseen system
shifts, improper anchoring/guiding, and corrosion. **[B]** (US Bellows, above)

*Design-review questions for any bellows:* Is it anchored and guided, or is it
being asked to absorb a load it was not rated for? What is its cycle count over
life? Is it lined? Has anyone checked the squirm margin at the actual MAWP, not
the operating pressure?

## 2.6 Fittings: welded vs brazed vs mechanical

The general cold-service ranking is **welded > brazed > mechanical**, and the
reason is differential thermal contraction at a seal interface.

**Welded.** A full-penetration weld is continuous parent-equivalent metal. There
is no seal to relax, no gasket to shrink away, no preload to lose. This is why
cryogenic and high-vacuum systems are welded wherever a joint does not need to
come apart. The cost is that inspection, repair and modification all require hot
work, and every weld is a potential defect site — and austenitic stainless is
sensitive to sensitisation and to weld-metal ferrite content at cryogenic
temperatures.

**Brazed.** A filler metal wets and flows into a close-fitting joint. Useful for
dissimilar metals and for joints that are awkward to weld. The concern cold is
the **mismatch in contraction between filler and parent** and the brittleness of
some braze alloys at cryogenic temperature; braze joints are generally regarded
as less predictable than welds below ~100 K and are avoided in primary cryogenic
pressure boundaries where a weld is possible. **[C]**

**Mechanical.** All mechanical joints share one problem: they rely on a
maintained contact stress, and cooling changes that stress. Contraction can
either tighten a joint (if the outer member shrinks onto the inner) or open it
(if the sealing element shrinks faster than the metal around it). Thermal
*cycling* is worse than steady cold, because it ratchets.

- **VCR (metal gasket face seal).** The preferred demountable joint for cold and
  for high vacuum. The seal is a deformable metal gasket crushed between two
  polished gland faces — metal-to-metal, no elastomer, and the sealing stress is
  set by plastic deformation rather than by an elastic element that can relax.
  Swagelok describes the seal as made "when the gasket is compressed by two beads
  during the engagement of a male nut or body hex and a female nut." **[B]** —
  https://www.swagelok.com/downloads/webcatalogs/en/ms-13-150.pdf

  NASA has quantified VCR performance specifically for cryogenic fluid
  management, testing "the leak rate of Vacuum Coupling Radiation (VCR) fittings
  over the temperature range from ambient to 20 K, both before and after exposure
  to a launch [environment]," at a fitting test pressure of **31 bar (450 psig)**
  in 1/4 in, 1/2 in and larger sizes, using a helium mass-spectrometer leak
  detector in a thermal-vacuum chamber. **[A]** —
  https://ntrs.nasa.gov/api/citations/20230009407/downloads/C3Or2A-06_Manuscript_CEC%202023_VCR%20Fittings_062223%20(002).pdf
  Companion formal test reports:
  https://ntrs.nasa.gov/api/citations/20230004260/downloads/VCR%20Fitting%20Test%20Final%20Report%20-%20Feb%202023.pdf **[A]** and
  https://ntrs.nasa.gov/api/citations/20205011830/downloads/Fitting%20Leak%20Test%20Report%20Public%20Release%20-%20Dec%202020.pdf **[A]**

  The very existence of this NASA test campaign is the teaching point: the
  agency did not assume a catalogue fitting would hold at 20 K after vibration —
  it measured it. That is the correct posture toward every mechanical joint in a
  cryogenic system.

- **Compression (ferrule / "Swagelok-type").** A swaged mechanical joint between
  ferrules and the tube OD. Widely used and workable cold, but the seal is a
  cold-formed interference that can relax under cycling; re-making a joint
  changes its geometry. Generally accepted for instrument and pneumatic tubing,
  treated with more caution on primary cryogenic liquid lines.

- **Flare.** A metal-to-metal seal formed by the flared tube end. Sensitive to
  flare quality and to the exact torque; the flare itself is worked material.

- **CGA connections.** The threaded outlet connections on cylinders and liquid
  cylinders. These are *not* a design choice — they are a standardised,
  gas-specific, deliberately non-interchangeable interface whose entire purpose
  is preventing a fuel container being connected to an oxidiser circuit. In a
  design review the question about a CGA connection is never "is it good enough"
  but "is it the right number for this service, and has anyone adapted around
  it?" An adapter defeating a CGA keying scheme is a serious finding.

- **Elastomer-sealed joints (O-rings) generally.** Most elastomers go through
  their glass transition well above cryogenic temperature and stop sealing. Where
  an elastomer must be used near cold, the design has to keep it warm — which is
  exactly the logic of the extended bonnet (§3.1) and the bayonet (§2.4).

---

# 3. Valves and flow control

## 3.1 Valve types and the extended bonnet

### The valve types, briefly

- **Ball.** Quarter-turn, low pressure drop, full bore, fast. The default
  isolation valve in cryogenic service. Its distinguishing cryogenic problem is
  the **body cavity** (§3.4).
- **Globe.** Rising stem onto a seat, good throttling authority, higher pressure
  drop. Used where flow modulation matters. No trapped body cavity in the ball
  sense, but a large wetted body and more mass to chill.
- **Gate.** Full bore, low drop, poor throttling (gate chatter). Less common
  cold, partly because the guide clearances and the large wetted seat area are
  awkward with differential contraction.
- **Needle.** Fine metering, small Cv, high resolution. Used on instrument and
  purge lines rather than main flow. Sensitive to galling and to contraction
  changing the effective orifice at temperature.

The cryogenic versions of all of these differ from their room-temperature
counterparts in four systematic ways: **materials** selected to stay ductile
cold (austenitic stainless, not carbon steel — carbon steel is brittle at these
temperatures); **clearances** opened up to allow for differential contraction so
things do not seize; **seat materials** chosen for cryogenic ductility; and an
**extended bonnet**.

Seat/seal polymers, ranked for cold: **PCTFE (Kel-F)** is generally regarded as
the best cryogenic valve-seat material, quoted down to roughly −450 °F / −200 °C
depending on the source, at the cost of substantially higher operating torque;
**filled PTFE** is the common general-purpose choice; **PEEK** is strong and
durable but becomes very hard cold and is considered inferior to PCTFE for
cryogenic sealing. Polyimide (Vespel) also retains ductility cold. **[C]** —
https://www.curbellplastics.com/materials/plastics/pctfe/

### Extended bonnets — why they exist

**The problem.** A valve stem passes through a packing set. Packing is polymeric.
Polymers at 77 K are not seals — they are brittle rings that shrink away from the
stem. On top of that, a cold packing gland ices up externally and the stem
freezes in place.

**The solution.** Lengthen the bonnet so the packing sits far enough from the
cold body that it stays warm. The space in between fills with a **static column
of cryogen vapour**, which is an excellent insulator precisely because it is
stagnant. The body runs at cryogenic temperature; the packing and the operator
run near ambient.

MSS SP-134 states the requirement functionally: the body/bonnet extension must
"sufficiently isolate the stem packing and valve operating mechanism from the
temperature effects of the cryogenic fluid," and must be "long enough to provide
an insulating gas column that prevents the packing area and operating mechanism
from freezing." The length "shall be sufficient to maintain the stem packing at
a temperature high enough to permit operation within the normal temperature
range of the packing material." **[B]** —
https://webstore.ansi.org/preview-pages/MSS/preview_MSS+SP-134-2006a.pdf
(the ANSI preview page for MSS SP-134, *Valves for Cryogenic Service Including
Requirements for Body/Bonnet Extensions*; the preview blocks automated retrieval
but the standard's number and title are confirmed)

Two competing design pressures inside the extension, per the same standard
**[B]**:
- **Clearance between stem and extension bore** shall be designed to *minimise
  convection* — too much gap and the vapour column circulates, carrying heat.
- **Wall thickness shall be minimised**, consistent with pressure rating and the
  bending stress from operating the valve, to *reduce conduction* down the
  extension wall.

So the extension is a deliberate compromise between a thermal element and a
structural one. That tension is a good review topic.

**Consequences that follow from the extended bonnet:**
- **Orientation matters.** The vapour column only works if it can stratify. A
  valve installed upside down, or far from vertical, lets liquid into the
  extension and the packing freezes. Cryogenic valves are conventionally
  installed with the stem vertical or within a limited angle of vertical.
- **Stem wind-up.** The long, slender extension is compliant, and that compliance
  compounds with thermal contraction — the operator can turn while the closure
  member has not yet moved. **[C]**
- **It is a heat leak.** Every extended-bonnet valve is a conduction path from
  ambient into the cold fluid.

The industry design overview presented to the Valve Manufacturers Association
covers the same ground and is a useful teaching reference (the document is a
scanned/graphical PDF that resisted automated text extraction, so treat specific
figures from it as unverified until read manually): **[B]** —
https://cdn.ymaws.com/www.vma.org/resource/resmgr/2017_tech_seminar_presentations/Bounds_and_Tesch_-_Design_Sp.pdf

**The two controlling standards** for cryogenic valve design and testing are
**BS 6364** (*Specification for valves for cryogenic service*) and **MSS SP-134**
(above), with pressure/temperature ratings from **ASME B16.34**. **[B]**

## 3.2 Check valves, relief valves, burst discs

**Check valves.** Prevent reverse flow. Cold, the concerns are that the poppet or
disc and its spring change dimension and rate; that close tolerances mean
"contamination or dirt can cause sticking and leakage" **[A]** (NASA Propulsion
Test Handbook —
https://ntrs.nasa.gov/api/citations/20100002189/downloads/20100002189.pdf );
and that a check valve is *not* an isolation valve — check-valve leakage is
listed by Jefferson Lab among the principal causes of system overpressure.
**[A]** —
https://www.jlab.org/ehs/ehsmanual/Pressure%20and%20Vacuum%20Systems%20Supplement/PSS%20Part%204%20Overpressure%20Protection.htm
SLAC notes an interesting cryogenic-specific *use* of a check valve: routine
boiloff relief "is best provided by rated spring-loaded relief devices **or an
open passage to the atmosphere with a check valve**" — the check valve keeping
air (and its water and CO₂) out of a continuously venting line. **[A]** —
https://www-group.slac.stanford.edu/esh/eshmanual/pdfs/ESHch36.pdf

**Relief valves (reclosing).** A spring-loaded device that opens at set pressure
and **recloses**. This is what you want for the normal boiloff case, because the
system keeps running afterwards. NASA's Propulsion Test Handbook gives typical
tolerances: direct-acting relief valves have "a set pressure tolerance of 2 psi
for set pressures through 70 [psi], and 3 percent for set pressures over 70 psi.
They must reseat before the pressure falls below 90 percent" of set. **[A]**
(NTRS 20100002189, above). It also distinguishes **direct-acting** from
**pilot-operated** relief valves, the latter using "a separate direct operating
relief valve (pilot) for control of pressure forces acting on the main valve
piston" — pilot-operated devices give higher capacity and tighter seating near
set pressure. **[A]**

**Burst discs / rupture discs (non-reclosing).** A deliberately weak membrane
that ruptures and stays open. Higher flow capacity for a given size, no seat to
leak, no set-point drift — but once it goes, the system is open to atmosphere
until someone replaces it. Jefferson Lab classifies devices exactly this way:
"reclosing (such as a spring loaded safety relief valve) and non-reclosing
(e.g. rupture disk)." **[A]**

### Series and parallel arrangements

**In parallel** (the usual cryogenic-tank arrangement). A relief valve set at
the lower pressure handles normal boiloff and recloses; a burst disc set higher
handles the catastrophic case (loss of vacuum, fire) with capacity the valve
cannot provide. Chart ships its vertical bulk tanks with exactly this: "dual
relief valves and rupture disks supplied as standard." **[A]** —
https://files.chartindustries.com/13608592_BulkCatalog.pdf

**In series** (disc upstream of valve). The disc isolates the relief valve from
the process — used where the fluid would corrode, foul or freeze the valve seat,
or where zero fugitive leakage is required. The cost is a code penalty: under
ASME BPVC VIII, a rupture disc installed at the inlet of a pressure relief valve
requires the valve capacity to be **de-rated by a combination capacity factor of
0.90**, unless a higher certified factor has been established by test for that
specific disc/valve pairing and registered with the National Board. **[B]** —
see ASME BPVC VIII Div 1 UG-127; a public excerpt is at
https://inglenookeng.com/wp-content/uploads/2019/09/ASMEVIIIUG-127.a.3.c.4.pdf
and a manufacturer's technical bulletin explaining the rule is at
https://my.fike.com/_fike_docs/Pressure_Protection/_GLOBAL_Pressure_Protection/Technical_Bulletins/TB8100_ASME_Code_and_Rupture_Discs.pdf

A series arrangement also introduces a failure mode people forget: **the space
between disc and valve must be monitored**. If the disc develops a pinhole, that
space pressurises, the disc no longer sees full differential, and it will not
burst at its rated pressure.

### Block valves upstream of reliefs

Jefferson Lab permits them only under controls: "Block or stop valves may be
installed upstream of a relief device provided the requirements of ASME BPVC
VIII D1 Appendix M (or equivalent) are met. Such requirements include operating
procedures and the installation [of] locks or anti-tampering devices." **[A]**
In a design review, an unlocked block valve upstream of a relief is a finding.

## 3.3 Regulators, filters, phase separators, vaporisers

**Regulators.** Reduce and hold a downstream pressure. In cryogenic service the
key distinction is whether the regulator sees cold gas (its elastomers and its
spring rate both change) or warm gas downstream of a vaporiser — the latter is
strongly preferred. NASA's Propulsion Test Handbook documents dome-loaded
regulation as the standard high-flow architecture: "The small volume pressure
reducing and relief regulator regulates the static pressure to the dome of the
large volume regulator. The pressure in the dome actuates the large volume
regulator valve, which maintains a constant pressure downstream." **[A]**
(NTRS 20100002189). It also carries a safety note directly relevant to fuel
systems: **"HANDLOADERS SHOULD NOT BE USED IN GASEOUS HYDROGEN SERVICE. THE
HYDROGEN BLEED PRESENTS A FIRE HAZARD."** **[A]**

**Filters and strainers.** Protect seats and orifices from debris — and in
cryogenic service, from **frozen contaminant**. Water, CO₂ and hydrocarbons that
are harmless gases at ambient become solid particles at 77 K. A filter cold is
therefore also a *trap*, and traps plug. The design tension is that a plugged
filter is a flow blockage that can trap liquid on the downstream side. Flow-meter
protection gives a sense of the scale involved: turbine meters call for
"Ball bearings: 10 to 100 microns ... Journal bearings: 75 to 100 microns"
filtration. **[A]** (NTRS 20100002189)

**Phase separators.** A small vessel that lets two-phase flow disengage, venting
the gas and delivering liquid onward. It exists because heat leak in a transfer
line inevitably generates vapour, and downstream equipment (a flow meter, a
pump, an engine) usually needs single-phase liquid. Described in the literature
as removing "any nitrogen gas that forms in the liquid nitrogen supply circuit
due to heat leakage or changes in pipeline pressures," typically built as "a
double-walled, vertically mounted, cylindrical tank" with the inner vessel rated
around 250 psig MAWP and the outer providing vacuum insulation. **[C]**

*Review point:* a phase separator is a vent source by design. Its vent has to go
somewhere safe, and it counts toward the ODH inventory of the room.

**Vaporisers / ambient air vaporisers (AAV).** Finned aluminium tube bundles that
gasify cryogenic liquid using ambient air by natural convection. They are how
bulk liquid becomes usable gas, and how a pressure-building circuit works.

The dominant engineering issue is **icing**. As the fins go below the frost
point, atmospheric moisture deposits on them; the frost layer insulates the fin
from the air it is supposed to be drawing heat from, and vaporiser capacity
falls progressively through a run. Consequences: reduced capacity (so the
vaporiser must be **derated** for continuous duty, or duty-cycled in pairs so one
defrosts while the other runs), and a real **structural load** from ice mass.
The technical literature treats frost growth, wind and seismic loading as
co-equal AAV design cases. **[B]** — *Cryogenic ambient air vaporizers: frost
growth, wind and seismic design for safety*, Cryogenics 33 (1993) 789,
https://ui.adsabs.harvard.edu/abs/1993Cryo...33..789B/abstract

*Review points:* Is the vaporiser sized for continuous duty or for a duty cycle?
What happens to delivery pressure at the end of a long run when it is fully
iced? Is anything (or anyone) underneath it when the ice sheds? And is the
vaporiser's own cold outlet piping treated as cryogenic line?

## 3.4 Trapped volume, vented balls, and relief holes

**What "trapped volume" means.** In a ball valve, when the ball is closed, a
volume of fluid is sealed inside the **body cavity** — between the ball, the two
seats, and the body. It is connected to neither the upstream nor the downstream
line. The same idea applies more generally to any pocket of a system that can be
isolated on both sides.

**Why it is lethal cold.** That trapped liquid warms up. LBNL's number for
confined cryogen warming to ambient is pressure "in excess of 10,000 psig."
**[A]** — https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch29/
The volumetric driver is the expansion ratio: liquid nitrogen expands roughly
**696:1** going to ambient gas **[A]** (LBNL). A valve body was never designed
for that; it fails, and it fails as a fragmentation event. The trade description
is blunt and correct: "trapped liquid nitrogen in a closed ball cavity could
expand 600 times in volume as it warms up, potentially exploding the valve."
**[C]** — https://blog.habonim.com/cryogenic-bi-directional

**The vented ball / relief hole.** The fix is to drill a hole through one wall of
the ball into the cavity, so the cavity is permanently connected to *one* side of
the line. Cavity pressure can then never exceed that side's pressure.

**Which side — and why it is always upstream.** The hole faces **upstream**, the
high-pressure side. Two reasons:

1. Venting to upstream caps cavity pressure at line pressure, which the body is
   rated for.
2. If it vented downstream, cavity pressure would push the ball *off* the
   upstream seat, "and then there would be a continuous leak path by the seat,
   into the ball and thru the relief hole" — i.e. the valve would no longer shut
   off. **[C]** — https://www.eng-tips.com/threads/cryogenic-ball-valve-cavity-vent.231275/

**The consequence for design review, and it is a big one: a vented ball valve is
unidirectional.** It has a flow direction arrow, and it only seals in that
direction. Install it backwards and you have a valve that leaks by design. Any
review of a cryogenic P&ID should check that every vented ball valve's
orientation matches the intended flow and, critically, matches the direction in
which it is expected to *hold pressure* — which during a drain or a purge may
not be the normal flow direction at all.

**The alternative: self-relieving seats.** Rather than drilling the ball,
spring-loaded seats are designed so that above a threshold differential the seat
deflects against its spring and momentarily relieves cavity pressure into the
line, then reseats. This preserves bidirectional sealing. **[C]** —
https://blog.habonim.com/cryogenic-bi-directional

**The generalisation.** The valve-body cavity is only the most compact example
of a universal cryogenic rule. SLAC states the general form: "Each and every
portion of the cryogenic system must have uninterruptible pressure relief. Any
part of the system that can be valved-off from the remainder must have [its own
relief]." **[A]** —
https://www-group.slac.stanford.edu/esh/eshmanual/pdfs/ESHch36.pdf
LBNL states the same: "Every isolatable part of the system which could
conceivably have cryogenic liquid or gas introduced must have its own pressure
relief, in the form of a valve or burst disk with adequate gas flow capacity."
**[A]** — https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch29/

LANL's pressure-safety guidance gives this hazard its own name — **"cryogenic
liquid lock"** — and a dedicated analysis section, sizing it with CGA S-1.3
equations. **[A]** —
https://engstandards.lanl.gov/esm/pressure_safety/Att-GUIDE-1-R1.pdf

*The classic review exercise:* take the P&ID, mentally close every valve, and
find every volume that is now isolated. Each one needs a relief or a documented
reason why it cannot contain liquid. Two block valves in a line with nothing
between them is the canonical finding.

## 3.5 Actuation and fail-safe philosophy

### Pneumatic vs solenoid vs manual

- **Manual.** Simplest, most reliable, no utilities. But it puts a human at the
  valve — unacceptable for anything that must be operated during a hazardous
  operation, and slow.
- **Solenoid.** Direct electrical actuation. Fast, easy to interlock, but limited
  in size/force, and the coil is a heat source and an ignition source in a
  flammable atmosphere (hence area-classification requirements). De-energising
  returns it to its normal position.
- **Pneumatic.** A gas-pressure actuator, usually piloted by a small solenoid.
  This is the standard architecture for large valves on a test stand: the
  solenoid is a low-power signal device, and the pneumatic cylinder provides the
  force. NASA's Propulsion Test Handbook documents this directly, including the
  two cylinder types — "normally closed (N.C.) and normally open (N.O.)" — and
  gives real limits: "The Annin pneumatic cylinders are limited to 150 psi
  maximum pressure (normal operation is in the 120 to 135 psi range to allow
  relief valves to be set at 150 psi)." **[A]** —
  https://ntrs.nasa.gov/api/citations/20100002189/downloads/20100002189.pdf

  Note the design detail embedded in that sentence: the operating band is chosen
  *below* the relief setting on the actuator supply, so a regulator failure
  relieves rather than over-strokes the actuator. That is a small, elegant piece
  of fail-safe design worth putting in front of students.

### Fail-safe position philosophy

The governing question is: **when the utility disappears — electrical power,
instrument air, control signal — which position leaves the system in its least
dangerous state?** There is no universal answer; it is per-valve, and it depends
on what the valve is for.

NASA's Propulsion Test Handbook documents both configurations existing side by
side, giving "fail-safe closed and fail-safe open solenoid control valve
relationships." **[A]** (NTRS 20100002189). The general pattern in propellant
systems:

| Valve function | Usual fail-safe position | Reasoning |
|---|---|---|
| **Propellant isolation / main valves (fuel and oxidiser)** | **Fail closed** | Stop adding propellant. On loss of control you want the source cut off, not continuing to feed a system nobody is commanding. |
| **Vent valves** | **Fail open** | Loss of control must not leave a cryogenic volume bottled up. An open vent is a safe state: it relieves boiloff and prevents pressure rise. This is the reverse of the isolation-valve logic and the reversal is the whole point. |
| **Relief and pressure-control paths** | **Fail open / fail to relieving** | Same reasoning. |
| **Pressurisation (pressurant supply)** | **Fail closed** | Stop adding pressure. |
| **Purge / inert gas** | Often **fail open** | An inert purge is usually the safe state — it keeps air out and dilutes flammables. But it is also an asphyxiant, so this is genuinely case-dependent. |

**Where fuel and oxidiser philosophies diverge.** The isolation logic is the same
for both (fail closed), but the *consequences of getting it wrong* are not
symmetric, and the surrounding design differs:

- **Oxidiser (LOX).** A leaking or failed-open LOX valve creates an
  oxygen-enriched atmosphere in which ordinary materials — clothing, grease,
  asphalt, aluminium — become ignitable or even detonable. So oxidiser-side
  failures are about *creating an ignition environment*, and the mitigations are
  materials and cleanliness (CGA G-4, G-4.1, G-4.4) as much as valve position.
- **Fuel (LH₂, LCH₄, RP-1).** A leaking or failed-open fuel valve creates a
  flammable cloud looking for an ignition source. Hydrogen's very wide
  flammability range and very low ignition energy make this unforgiving, and
  hydrogen flames are nearly invisible.
- **The asymmetry that matters:** you must never allow a single failure to open
  fuel and oxidiser paths into a common volume. Fail-safe positions are chosen so
  that loss of utilities cannot bring the two together — and vent paths for the
  two are kept physically separate (§4.4).

**A caution to teach explicitly.** "Fail-safe" describes the *actuator's*
behaviour on loss of its motive utility. It does not mean the valve cannot stick.
NASA's Artemis I campaign was delayed by a stuck hydrogen vent valve during
tanking — a valve that had a defined fail position and nonetheless did not do
what was wanted. **[C]** —
https://www.space.com/nasa-artemis-1-moon-rocket-test-stuck-valve
Fail-safe position is a design layer, not a guarantee, which is exactly why
relief devices (§4) are independent of the control system and why Jefferson Lab
lists "operator error" as "the most common cause of system overpressure."
**[A]** —
https://www.jlab.org/ehs/ehsmanual/Pressure%20and%20Vacuum%20Systems%20Supplement/PSS%20Part%204%20Overpressure%20Protection.htm

---

# 4. Relief and venting

## 4.1 The philosophy in one sentence

Every volume that can contain cryogen and can be isolated must have its own
relief path that cannot itself be isolated, sized for the worst credible heat
input into that volume.

Both SLAC and LBNL state it in almost the same words **[A]**:

> "Each and every portion of the cryogenic system must have uninterruptible
> pressure relief. Any part of the system that can be valved-off from the
> remainder must have [its own]." — SLAC ESH Chapter 36,
> https://www-group.slac.stanford.edu/esh/eshmanual/pdfs/ESHch36.pdf

> "Every isolatable part of the system which could conceivably have cryogenic
> liquid or gas introduced must have its own pressure relief, in the form of a
> valve or burst disk with adequate gas flow capacity." — LBNL PUB-3000 Ch. 29,
> https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch29/

SLAC extends the requirement past the fluid space into the insulation space:
"any volume cooled externally by a cryogen or any vacuum space in contact with a
cryogen must have the ability to relieve pressure," because "material cracks can
more easily develop at cryogenic temperatures" and "the cryogen or air may leak
into a sealed space through such cracks." **[A]**

## 4.2 The two classic sizing cases

### Case 1 — normal heat leak / boiloff

The steady-state case. Ambient heat leaks through the insulation, boils liquid,
and the relief must pass that vapour without letting pressure exceed the
accumulation limit. This is what the reclosing relief valve is for, and it sizes
the *small* device.

SLAC: heat input "is unavoidable regardless of the quality of the insulation
installed. Pressure relief must be provided to permit routine release of gas
vapors generated by this heat input. Typically such relief is best provided by
rated spring-loaded relief devices or an open passage to the atmosphere with a
check valve." **[A]** It then names the escalation explicitly: "Additional relief
devices should be provided as backup to the operational relief when the capacity
of the operational relief device is not adequate to take care of unusual or
accidental [conditions]." **[A]**

### Case 2 — the fire case (and, for cryogenics, loss of vacuum)

The transient/accident case, which sizes the *large* device (usually the burst
disc).

**The fire case.** External fire heats the vessel wall; the wetted area boils
violently. This is the classic sizing case for any pressure vessel holding a
liquefied gas.

CGA S-1.2 (the portable-container companion to S-1.3, and publicly available)
gives the actual form of the calculation, and it is worth showing students the
real equation rather than describing it:

> "These formulas are based on the principle of relieving the vapor in the
> container generated at **120 % of the DOT design pressure** of the container."
>
> Uninsulated (and insulated containers not meeting the insulation criterion):
> **Qa = Gu · A^0.82**
>
> Insulated containers whose insulation stays in place at 1200 °F:
> **Qa = Gi · A^0.82**
>
> where Qa = flow capacity in cubic feet per minute of free air, Gu and Gi are
> gas factors from the standard's Table 1, and A = total outside surface area of
> the container in square feet.
>
> — CGA S-1.2-1980, §5.3.2–5.3.5. **[A]** —
> https://law.resource.org/pub/us/cfr/ibr/003/cga.s-1.2.1980.pdf

Three design insights fall straight out of that:

- **The A^0.82 exponent** encodes the fact that a fire does not engulf 100 % of
  the surface — relief demand grows more slowly than area.
- **The insulation criterion is about fire survival, not thermal performance.**
  CGA S-1.2 only lets you use the (much smaller) insulated gas factor if "all
  materials comprising a representative sample of the insulation system remain
  completely in place when subjected to 1200 °F." If the insulation burns,
  melts, or falls off in a fire, you must size as if bare. This is why an
  insulation jacket that survives fire is worth so much. **[A]**
- **The standard explicitly flags the cryogenic complication:** "Depending on
  specific insulation system used, it may be desirable to consider the effect of
  air condensation in sizing relief devices." **[A]** That is the loss-of-vacuum
  mechanism appearing inside the fire-case standard.

The same fire-load concept in the process-industry form is API 520/521's
Q = 21,000·F·A^0.82 (adequate drainage and firefighting) or Q = 34,500·F·A^0.82
(without), in BTU/hr, with F an environmental factor and F = 1 for a bare
vessel. **[B]** Jefferson Lab points designers at API 521 for fire exposure and
notes it "represents the highest credible heat flux for fires of any type (with
the exception of metallic combustion)" — that parenthesis being a pointed
reminder about burning metal in oxygen. **[A]**

**Loss of insulating vacuum — the cryogenic third case.** Jefferson Lab treats
this as a named, mandatory case alongside fire:

> "Loss of vacuum in the insulation space, due to a failure of a component,
> operator error, etc., will subject the inner pressure boundary to a high
> temperature gradient ... This high temperature gradient can cause rapid
> boil-off of the cryogenic fluid resulting in a rapid pressure rise in the
> inner fluid space. **Failure of the vacuum space shall be considered for piping
> and vessels containing cryogenic fluids insulated in this manner.**"
> **[A]** —
> https://www.jlab.org/ehs/ehsmanual/Pressure%20and%20Vacuum%20Systems%20Supplement/PSS%20Part%204%20Overpressure%20Protection.htm

with the design heat fluxes given in §1.2 (25–40 kW/m² bare, 1–7 kW/m²
insulated) and a reference list any course could use directly: Barron,
*Cryogenic Heat Transfer* (1999); Collier, *Convective Boiling and Condensation*
(1972); Johnson, *Thermal performance of cryogenic insulation* (2007); Lehman,
*Safety Aspects for the LHE Cryostats and LHE Transport Containers* (1978);
Weisend, *Cryogenic Engineering* (1998); Wiseman, *Loss of cavity vacuum
experiment at CEBAF* (1991). **[A]** (JLab's own citation list, reproduced as
given)

LANL confirms which CGA sections carry the equations, citing **CGA S-1.3 (2020
edition)** for "loss of vacuum insulation in a double-walled pipe or vessel with
fire" and **CGA S-1.3 §6.3.2** for "liquefied compressed gases, refrigerated
fluids, and refrigerated (cryogenic) fluids in uninsulated or insulated
containers that lose insulation." **[A]** —
https://engstandards.lanl.gov/esm/pressure_safety/Att-GUIDE-1-R1.pdf

## 4.3 What code governs

| Standard | Scope | Verified at |
|---|---|---|
| **CGA S-1.3**, *Pressure Relief Device Standards — Part 3 — Stationary Storage Containers for Compressed Gases* | The controlling sizing standard for stationary cryogenic storage, including loss-of-vacuum-with-fire. 9th ed. 2020; revised again 2024. | https://legacy.cganet.com/Publication/Details.aspx?id=S-1.3 **[A]** |
| **CGA S-1.2**, *…Part 2 — Portable Containers for Compressed Gases* | Liquid cylinders, transport containers. Public 1980 copy carries the equations. | https://legacy.cganet.com/Publication/Details.aspx?id=S-1.2 **[A]** |
| **CGA S-1.1**, *…Part 1 — Cylinders for Compressed Gases* | Gas cylinders. | https://legacy.cganet.com/Publication/Details.aspx?id=S-1.1 **[A]** |
| **ASME BPVC Section VIII Div. 1** | Vessel construction and overpressure protection. Key paragraphs: **UG-125** (relief required), **UG-127** (rupture discs, incl. the 0.90 combination factor), **UG-131** (capacity certification), **UG-140** (overpressure protection by system design), **Appendix M** (block valves upstream of reliefs). | Paragraph numbers as cited by JLab **[A]** (link above) |
| **ASME B31.3** | Process piping, including cryogenic piping and flexible hoses. | Cited by AIGA 106/19 **[A]** and JLab **[A]** |
| **API 520 / API 521** | Relief device sizing and fire-case heat input. JLab: "Excellent guidance for this is given in API 520 and API 521." | **[A]** (JLab, link above) |
| **CGA P-12**, *Guideline for Safe Handling of Cryogenic and Refrigerated Liquids* | The general cryogenic handling guideline. 7th ed. 2023. | https://legacy.cganet.com/Publication/Details.aspx?id=P-12 **[A]** |
| **CGA G-5.5**, *Standard for Hydrogen Vent Systems* | Vent system design for hydrogen. | https://legacy.cganet.com/Publication/Details.aspx?id=G-5.5 **[A]** |
| **CGA P-18**, *Standard for Bulk Inert Gas Systems* | Bulk LN₂/LAr installations. | https://legacy.cganet.com/Publication/Details.aspx?id=P-18 **[A]** |
| **CGA H-5**, *Standard for Bulk Hydrogen Supply Systems* | Bulk LH₂/GH₂ installations. | https://legacy.cganet.com/Publication/Details.aspx?id=H-5 **[A]** |
| **AIGA 106/19**, *Vacuum-Jacketed Piping in Liquid Oxygen Service* | VJ piping design, bayonets, bellows, annulus relief, vacuum acceptance. | https://asiaiga.org/uploaded_docs/en_AIGA_106_19_Vacuum-Jacketed_Piping_in_Liquid_Oxygen_Service.pdf **[A]** |
| **MSS SP-134** / **BS 6364** / **ASME B16.34** | Cryogenic valve design, extension bonnets, testing, ratings. | **[B]** — see §3.1 |
| **EJMA** standards | Expansion joint / bellows design, incl. safety factor of 3 against squirm. | https://www.ejma.org/bellows/ **[B]** |
| **ASTM C740** | MLI thermal performance test method. | Cited by Fesmire **[A]** |
| **CGA G-4 / G-4.1 / G-4.4** | Oxygen; cleaning of equipment for oxygen service; oxygen pipeline and piping. | https://legacy.cganet.com/Publication/Details.aspx?id=G-4.1 **[A]** |

**The key ASME numbers.** For vessels other than unfired steam boilers, relief
must prevent pressure rising more than **10 % or 3 psi (whichever is greater)
above MAWP**; for fire or other unexpected external heat, the device shall
prevent pressure rising more than **21 % above MAWP**, and supplemental
fire-exposure valves may be set up to **110 % of MAWP**. **[B]** — ASME BPVC VIII
Div. 1, UG-125; see also
https://www.tataconsultingengineers.com/blogs/pressure-relief-valve-asme-section-viii-unfired-pressure-vessel-code-requirements/

**Capacity of a home-made relief.** If a lab fabricates its own relief device —
common for vacuum-annulus protection — capacity must be established by
calculation or test per ASME BPVC VIII D1 UG-131, Appendix 11, ASME PTC 25, API
520/521 "or other applicable method." Jefferson Lab additionally caps the
assumed discharge coefficient: "Unless measured by suitable technique, the
maximum coefficient of discharge ... shall be no greater than **Kd = 0.62** for
parallel plate relief valves." **[A]** — a nicely specific, teachable number.

## 4.4 Vent stack design — conceptual considerations

### Where vents discharge

The controlling principle is that relief discharge must not create a hazard where
people are. SLAC states it as a rule: a relief device "that may vent a quantity
of gas large enough to reduce the oxygen concentration to < 19.5 percent inside
of the space due to normal operation, quench, operator error, freezing, or
control system failure should be exhausted to a safe location **outside of the
building**." **[A]** —
https://www-group.slac.stanford.edu/esh/eshmanual/references/cryogenicsReqODH.pdf

Note the neat corollary in the same document: "**Trapped volume reliefs** that
cannot vent a quantity of gas large enough to reduce the oxygen concentration to
< 19.5 percent" are treated differently — a valve-cavity relief releasing a few
cubic centimetres of liquid does not need a stack to the roof. Relief routing is
proportionate to inventory.

Fermilab's PIP-II team applies the same logic to a tunnel: relief "flow must
vent to outside to avoid an oxygen deficiency hazard." **[A]** —
https://arxiv.org/abs/2307.08608

Jefferson Lab's overpressure chapter adds the discharge-side considerations a
designer must analyse: "**Reaction forces from relief loads**," "**Venting to
safe locations**," and "Environmental factors and fluid properties (e.g. relief
of toxic fluids at ground level)." **[A]** The reaction force point is
underappreciated — a relieving vent stack is a rocket nozzle, and it must be
restrained.

For hydrogen specifically, the design reference is **CGA G-5.5**, *Standard for
Hydrogen Vent Systems* **[A]**
(https://legacy.cganet.com/Publication/Details.aspx?id=G-5.5). Commonly cited
discharge-geometry guidance is on the order of 3 m (~10 ft) above grade, 0.6 m
(~2 ft) above adjacent equipment, and 1.5 m (~5 ft) above rooftops **[C]** —
verify against G-5.5 and NFPA 2 before using these numbers in course material.

### Why oxygen and fuel vents must never be combined

Because a shared vent header is a **mixing chamber with an ignition source at the
end of it**. Combining an oxidiser vent and a fuel vent creates, inside piping
that is neither instrumented nor rated for it, exactly the stoichiometry the
engine was designed to burn — with no control over when it lights.

Even without simultaneous flow, a shared header is unacceptable:
- **Back-flow and hold-up.** Gas from one system sits in the common header and is
  still there when the other system vents.
- **LOX plus hydrocarbon residue.** AIGA 106/19's warning about oxygen
  evaporating and enriching hydrocarbons on metal surfaces until ignition occurs
  **[A]** applies with far greater force to a header that has also carried fuel.
- **Condensation.** A cold vent header condenses; in an oxygen-containing line,
  condensed or solid fuel is a detonable deposit.

The practical rule taught in industry — separate, dedicated, physically
separated vent stacks for fuel, for oxidiser, and for inert — follows directly.
Separation distance between stack outlets matters too, so that two plumes cannot
meet at the discharge.

### Ice formation on vents

A vent line carrying cold gas to atmosphere condenses and freezes atmospheric
moisture at its outlet. The failure is that **the relief path plugs** — the one
component whose whole job is never to be blocked.

- SLAC requires the design to ensure "that any air that enters the cryostat and
  freezes cannot prevent proper functioning of pressure relief devices." **[A]**
- SLAC lists "freezing" among the conditions under which a relief may vent.
  **[A]**
- Jefferson Lab requires for outdoor reliefs that "the exhaust of relief devices
  shall be protected from rain, snow, and ice," recommends bug screens on all
  outdoor relief devices, and requires materials compatible with water exposure.
  **[A]**
- Jefferson Lab lists "**Blocked or partially obstructed vent lines**" as a
  principal cause of overpressure. **[A]**
- AIGA 106/19's inspection logic includes checking for "Plug, dirt, or debris in
  the exit of the relief valve." **[A]**

Mitigations discussed in the literature include loops and drip legs so that melt
cannot run back and refreeze in the throat, outlets angled downward, and heating
or purge on critical stacks. Note the counter-argument on flame arrestors for
liquid hydrogen vents: an arrestor "might get cold and build up ice, thereby
restricting flow" **[C]** — a device added for safety becoming the blockage.

### Back-pressure

A relief valve does not see atmosphere; it sees whatever pressure the discharge
piping develops at full relieving flow. Two consequences:

1. **Set-point shift and instability.** A conventional spring-loaded relief valve
   is affected by superimposed and built-up back-pressure. The commonly cited
   ASME limit is that built-up back-pressure should stay below **10 % of the
   device set pressure** for proper operation of a reclosing device. **[C]** —
   verify against ASME BPVC VIII and API 520 before quoting.
2. **The relief path itself must be sized.** Jefferson Lab: "The relief path
   shall also be analyzed for adequate capacity and pressure drop." **[A]**

The dewar-industry note on this is unusually clear and worth quoting to students:
total vessel pressure at relief equals the relief valve set point *plus* the
accumulated pressure drops across fittings, piping and corrugated hose, and
designers must account for sonic choking and avoid "unintended flow impedances
from thermal radiation baffles or multilayer insulation that could compromise
relief adequacy." **[B]** —
http://www.mtm-inc.com/ac-20130930-sudden-loss-of-isolation-vacuum-in-cryogenic-liquid-dewars.html

That last clause is a genuine cryogenic trap: **MLI or a radiation baffle sitting
in the relief path** can pass normal boiloff invisibly and then choke the flow
in a loss-of-vacuum event, exactly when full capacity is needed.

*Design-review questions for a vent system:* Where does each relief discharge,
and is it the same place for fuel and oxidiser? What is the built-up
back-pressure at full flow? Is anything in the flow path that was not sized for
the accident case? Is the outlet protected from rain and ice? Is the stack
restrained against reaction force? And can the discharge reach an air intake?

---

# 5. Instrumentation

## 5.1 Temperature

The general problem: at 77 K, and much worse at 20 K, most room-temperature
sensing physics either loses sensitivity or stops working. Sensor choice is a
function of *how cold*, *how accurate*, and *is there a magnetic field*.

The figures below are read directly from Lake Shore Cryotronics' sensor
selection catalogue, which is the de facto reference in the field. **[A]** —
https://www.lakeshore.com/docs/default-source/product-downloads/literature/lstc_sensorselection_l.pdf?sfvrsn=60938ed5_15

| Sensor | Range of use (catalogue limits) | Notes |
|---|---|---|
| **Silicon diode** (DT-670) | **1.4 K – 500 K** (SD package); 1.4 K – 420 K in other packages | Follows a standard curve, so units are interchangeable without individual calibration |
| **Platinum RTD** (PT-103) | **14 K – 873 K**; PT-111 14 K – 673 K | Catalogue guidance: "suggested use only T ≥ 30 K" |
| **Thermocouple Type E** (chromel–constantan) | **3.15 K – 953 K** | Catalogue note: "Useful when T > 10 K" |
| **Thermocouple Type K** | **3.15 K – 1543 K** | Wider high-temperature range, less low-temperature sensitivity |
| **Cernox RTD** | sub-1 K upward (model dependent) | The choice when both very low temperature *and* magnetic field are present |
| **Capacitance** (CS-501) | 1.4 K – 290 K | See the warning below |

### How they actually behave

**Silicon diodes.** A forward-biased diode's voltage drop rises steeply as
temperature falls. That makes the diode *most* sensitive exactly where most
other sensors give up. The catalogue's dimensionless-sensitivity table shows
this directly for the DT-670: −0.01 at 475 K but −1.19 at 4.2 K and −7.5 at
1.4 K — sensitivity climbs by nearly three orders of magnitude as it gets cold.
**[A]**

Typical accuracy for a Band-A DT-670: **±0.25 K from 1.4 K through 100 K**,
loosening to **±0.5 K** at 305–500 K. **[A]**

The catch is magnetic fields and radiation. The catalogue is explicit: the
DT-670-SD is "Not recommended for T < 60 K, or for B > 5 tesla above 60 K," and
notes the SD package "has magnetic leads." **[A]**

*Verdict:* the default general-purpose cryogenic thermometer, from 1.4 K up
through room temperature, absent magnetic fields.

**Platinum RTDs.** Platinum resistance falls with temperature and is beautifully
linear over a wide warm range — which is why it is the industrial standard. But
below about 30 K the resistance flattens out and sensitivity collapses; there
simply isn't enough dR/dT left to resolve temperature. Hence the catalogue's
"suggested use only T ≥ 30 K." **[A]**

Where platinum shines is **stability**: the catalogue quotes long-term stability
of **±10 mK/yr over 77 K to 273 K**, and calibrated accuracy down to ±5 mK.
**[A]** In magnetic fields platinum is "moderately orientation dependent." **[A]**

*Verdict:* excellent from ~30 K up, especially where you need a stable,
repeatable, interchangeable reading — LN₂ and LOX temperatures are comfortably
in its band. Useless for liquid hydrogen or helium.

**Thermocouples.** A thermocouple measures the *difference* between the
measurement junction and a reference junction, which brings two cryogenic
problems:

1. **Sensitivity collapses as it gets cold.** The Seebeck coefficient of every
   standard pair falls toward zero at low temperature. Type E (chromel–
   constantan) has the highest sensitivity of the standard types at low
   temperature and is the usual choice, but even it carries the catalogue
   caveat "Useful when T > 10 K." **[A]** Type T is roughly half of Type E's
   sensitivity in this region.

   > **[C] — FLAGGED.** A figure of "4.1 µV/K at 20 K" for Type T circulated in
   > the sources consulted, but it appeared once with a unit that was clearly a
   > transcription error (mV/K), and Lake Shore's cryogenic catalogue lists only
   > Types E and K. Teach the *ratio* (Type T ≈ half of Type E at low
   > temperature) and read the absolute coefficient off an ASTM/NIST
   > thermocouple table before quoting a number.

2. **The reference junction is now a major error source.** At room temperature,
   a 1 K error in cold-junction compensation is a 1 K error. At 20 K, where the
   output is a few µV/K, the same compensation error is enormous *in
   proportion* to the signal.

Add lead-wire heat conduction into the measurement point (a real self-heating /
thermal-anchoring error at cryogenic temperature), inhomogeneity errors where
the wire passes through the steep temperature gradient at the cryostat wall, and
microvolt-level signals in an electrically noisy test-stand environment.

*Verdict:* thermocouples are the cheap, rugged, easy-to-install choice and they
dominate industrial cryogenic plant — but for accuracy below ~30 K they are the
weakest of the three. Fesmire's KSC test cryostats use Type K and Type E
thermocouples for boundary temperatures **[A]**
(https://ntrs.nasa.gov/api/citations/20180006600/downloads/20180006600.pdf ),
which is a fair signal of where they are and aren't trusted.

**Capacitance sensors.** Worth a specific warning because they look attractive:
they are nearly magnetic-field-immune, but the catalogue rates them at ±0.01 K
"after cooling and stabilizing" while quoting long-term stability of only
**±1.0 K/yr**, and recommends them "for control purposes." **[A]** In other
words: excellent as the feedback element in a temperature controller, not
trustworthy as an absolute thermometer.

### The design-review point about temperature in a propellant system

Cryogenic temperature measurements are almost always used to answer one of three
questions: *is this line chilled down?*, *is this liquid or gas?*, and *what is
the density for a flow or mass calculation?* The first tolerates a coarse
sensor. The third does not — and near saturation, temperature alone doesn't
answer it, because a saturated fluid's temperature tells you the pressure and
nothing about quality.

## 5.2 Pressure

Pressure is usually the *easiest* cryogenic measurement to get roughly right and
one of the easiest to get subtly wrong, because the sensing element is normally
not rated for the process temperature.

**The two architectures:**

1. **Cold-rated transducer immersed directly.** One part, no plumbing, no
   thermal lag. Specialist devices are rated to roughly −260 °C for liquid
   hydrogen and helium service. Simple, expensive, and the calibration must be
   valid at temperature. **[C]**
2. **Standard transmitter behind a thermal standoff / sense line.** A length of
   small-bore tube between the process tap and the transducer. The tube warms up
   along its length, so the diaphragm sits at a temperature the sensor is
   actually calibrated for. Cheap, uses ordinary instruments, and is by far the
   most common arrangement on a test stand. **[C]**

**Why sense lines are kept warm or filled — the actual failure mechanism.**

A standoff line connected to a cryogenic tank fills with cryogen. Heat leaking
in through the tube wall boils that cryogen, and a **column of cold vapour**
establishes itself between the liquid surface and the transducer. This column
is the measurement path, and it has three problems:

- **It is not a static head you can correct for.** The gas density varies along
  the tube, and it varies with how much heat is leaking in — which changes with
  ambient conditions and with whether the line is frosted.
- **It can oscillate.** Liquid periodically ingresses into the warm section and
  flashes, producing pressure pulsations that look like real process dynamics
  and can be violent enough to damage the transducer. This is the cryogenic
  analogue of a steam-trace/impulse-line problem, and it is why the line is kept
  *deliberately* warm (heat traced) or *deliberately* gas-purged rather than
  left to find its own equilibrium.
- **It can freeze solid.** Any moisture or CO₂ in the line becomes a plug, and
  a plugged sense line reads the *last* pressure it saw. This is the dangerous
  one, because the instrument does not fail obviously — it fails *steady*.

NASA's Propulsion Test Handbook covers the general family of protective
accessories and states the underlying reason: "it is desirable to prevent the
process fluid from coming in contact with the sensing element. The process may
be noxious, poisonous, corrosive, abrasive, have the tendency to gel, freeze or
decompose at ambient temperatures, or be hotter or colder than the sensor can
tolerate." It adds, for cold environments: "When freezing temperatures are
expected, resistance heating or steam tracing should be used in combination with
thermal insulation." **[A]** —
https://ntrs.nasa.gov/api/citations/20100002189/downloads/20100002189.pdf

The Handbook also notes that snubbers "filter out spikes, but cause the
measurement to be less responsive," and warns that protecting a transducer with
a relief valve "will result in a loss of measurement when the relief valve is
open" — a good illustration that every instrument protection measure costs you
something in the measurement. **[A]**

**Design-review questions:** Is every pressure tap at the *top* of the line
(so it does not fill with liquid) or deliberately at the bottom (for a DP level
measurement)? Is the sense line traced, purged, or sloped? Is there a
frozen-plug failure mode, and would anyone notice? Does a control interlock
depend on a transducer behind an unmonitored sense line?

## 5.3 Flow

### The technologies

**Turbine meters.** A rotor spins in proportion to volumetric flow; a magnetic or
RF pick-off counts blade passes. The workhorse of cryogenic and LNG flow
measurement. NASA's Propulsion Test Handbook gives representative specifications
**[A]** (NTRS 20100002189):

- Calibration accuracy **±0.05 % of reading**, NIST traceable
- Repeatability **±0.05 % of reading**
- Linearity **±0.5 % of reading** over the normal 10:1 turndown; **±0.10 %**
  over full range with linearising electronics
- Response time **3–4 ms** typical
- Temperature range **−450 °F to 750 °F**, dependent on bearing and pick-off
- Straight run required: **10D upstream and 5D downstream minimum**
- Recommended filtration: ball bearings 10–100 µm; journal bearings 75–100 µm

Note that −450 °F is about 5.8 K — turbine meters genuinely work at cryogenic
temperature. Note equally that the accuracy claim is contingent on the straight
run and the filtration, and that the bearing is a wear item spinning in a fluid
with essentially no lubricity.

**Coriolis meters.** Measure **mass** flow directly by the Coriolis deflection
of a vibrating tube, and give density as a bonus — which is enormously valuable
for a cryogen whose density is temperature-dependent. The cryogenic penalties
are the thermal stress on the vibrating tubes, the need for the tube to be at
process temperature (a large chilldown mass), and a severe sensitivity to gas
entrainment (below).

**Venturi and orifice (differential-pressure) meters.** Infer flow from a
pressure drop across a restriction. NASA's Handbook: "Differential pressure
transducers often are used in flow measurement where they can measure the
pressure differential across a venturi, orifice, or other type of primary
element. The detected pressure differential is related to flowing velocity and
therefore to volumetric flow." **[A]** Robust, no moving parts, but the DP
measurement inherits every sense-line problem in §5.2 — doubled, because there
are two taps — and the ΔP itself can drop the fluid below saturation and flash
it.

**The cavitating venturi** deserves separate mention because it is a *control*
device as much as a measurement one: run choked, it fixes mass flow independent
of downstream pressure. It is described in the literature as "a form of
obstruction flow meter that takes advantage of the Bernoulli principle to limit
fluid flow to a desired rate." **[B]** — *An investigation of a cavitating
venturi flow control feature in a cryogenic propellant delivery system*,
Cryogenics, https://www.sciencedirect.com/science/article/abs/pii/S0955598614001216
This is why cavitating venturis are common in liquid rocket feed systems: they
decouple the engine from upstream pressure transients.

### Why two-phase flow breaks flow meters

This is the central cryogenic flow-measurement problem, and it has one root
cause: **a cryogen in a pipe is sitting close to its boiling point, so any local
pressure drop flashes it.** Every flow meter works by creating a pressure drop.
The measurement therefore tends to create the condition that invalidates it.

What breaks, mechanism by mechanism:

- **Volumetric meters lose their meaning.** A turbine or venturi measures
  *volume*. With vapour present, the same volumetric rate carries wildly less
  mass, and there is no way to recover mass from volume without knowing quality
  — which the meter does not measure. The error is not noise; it is a systematic
  and potentially large over-read.
- **Turbine rotors over-speed and are damaged.** Vapour has far lower density,
  so the rotor spins faster for the same mass flow. Worse, bubbles collapsing
  (cavitation) cause "mechanical erosion and noise/vibration that interferes
  with measurement accuracy." **[C]** The rotor and bearings are attacked at the
  same time the reading goes wrong.
- **Coriolis meters lose their signal.** Gas entrainment raises mechanical
  damping on the flow tube, so oscillation amplitude falls and signal-to-noise
  collapses; at higher void fractions the drive system cannot maintain
  oscillation at all. And crucially, "even at low levels of gas entrainment,
  mass flow errors can be severe." **[B]** — see
  https://arxiv.org/pdf/1805.01379 for the signal-processing treatment.
- **DP meters read the wrong physics.** The Bernoulli relation assumes a known,
  constant density. Two-phase flow breaks that assumption, and flashing across
  the restriction means the density at the throat differs from the density at
  the tap.

**The engineering response** is to *prevent* two-phase flow rather than to
measure through it: subcool the liquid (raise pressure above saturation, or cool
below it), keep the meter's pressure drop small, chill the line down completely
before measuring, place the meter where static head is highest (low in the
system), and use a phase separator upstream (§3.3) where practical.

**The design-review point:** a cryogenic flow measurement is only valid if the
fluid is single-phase *at the meter*. That is a claim which requires evidence —
a pressure and a temperature at the meter, compared against the saturation
curve. A flow reading presented without that evidence should not be trusted, and
this is a good habit to teach early.

## 5.4 Level

### Why level in a cryogen is harder than in water

Six reasons, and they compound:

1. **The liquid is boiling.** There is no flat, quiet surface. There is a
   churning two-phase region whose "level" is a statistical statement.
2. **The density is low and it varies.** LN₂ is about 0.8 g/cm³ and its density
   changes with temperature and pressure along the saturation line. A DP level
   measurement divides by density, so a density error becomes a level error
   directly.
3. **The head is tiny.** Low density means very small hydrostatic pressure per
   metre — so a DP transmitter must resolve a very small differential, often on
   top of a large static pressure.
4. **The vapour above is dense and variable.** Unlike air over water, cold
   vapour has significant density that subtracts from the measured head, and it
   varies with tank pressure and temperature.
5. **The measurement path itself boils.** Any tube dipping into the liquid boils
   its contents (§5.2), so the reference leg is not a clean gas column.
6. **You often cannot see in.** No sight glass on a vacuum-jacketed vessel.

### The techniques

**Differential pressure (DP).** The industry standard for bulk tanks. Measure
between a bottom tap in the liquid and a top tap in the ullage; the difference
is the hydrostatic head, and level follows from ρ. The literature states it as
measuring "the pressure difference between the gas phase in the vessel and the
gas phase in a tube immersed in the liquid," with level from head and density.
**[B]** — https://www.sciencedirect.com/science/article/abs/pii/S0011227517300681

Strengths: no moving parts, works on a sealed vessel, the same instrument family
as everything else on the stand. Weaknesses: needs density (hence needs
temperature/pressure); both sense lines are subject to §5.2's problems; and near
atmospheric pressure "many tanks operate near atmospheric pressure, limiting
differential pressure signal." **[B]**

**Capacitance probe.** A coaxial capacitor down the tank; the dielectric
constant changes as liquid replaces vapour between the electrodes (LN₂ ε ≈ 1.45,
GN₂ ε ≈ 1.0), so capacitance is proportional to submerged length. Continuous,
no moving parts, fast.

The catch is that ε is itself a function of density, hence of temperature and
pressure. The NASA-era work on this is explicit: "the inaccuracy of liquid
nitrogen and liquid hydrogen level measurements by use of a coaxial capacitance
probe varies as a function of fluid temperature and pressure," and the fix is
"fluid dielectric correction factors based on the actual measured fluid
temperature and pressure." **[B]** —
https://ui.adsabs.harvard.edu/abs/1993inin.symp..701E/abstract

So a capacitance level gauge is not a standalone instrument; it needs a
temperature and a pressure to be honest. It is also degraded by the two-phase
froth region, where the dielectric is neither liquid nor vapour.

**Point sensors (discrete level).** A sensor that changes state when wetted,
placed at a specific height. Two common physics:
- **Self-heated resistor / hot wire.** A small element is driven with enough
  current to self-heat in gas; when liquid covers it, the vastly better heat
  transfer cools it and its resistance drops sharply. Very sharp, very
  unambiguous transition.
- **Superconducting wire** (for helium), which goes normal/superconducting at
  the liquid interface.

Strengths: unambiguous, cheap, ideal for interlocks — "full," "low," "trip."
Weaknesses: discrete, not continuous; the self-heating type is a heat source
inside the cryogen; and they can be fooled by splashing or by a froth layer.

*Practical architecture:* most real systems combine them — a continuous DP or
capacitance measurement for operations, plus discrete point sensors for the
safety-critical decisions (fill termination, low-level pump trip). The interlock
should be on the point sensor, because it fails in a more obvious way.

## 5.5 Oxygen deficiency and combustible gas monitoring

### Oxygen deficiency monitors (ODMs)

**The hazard.** Cryogens expand enormously on boiling (LN₂ ~696:1, LAr ~847:1,
LHe ~757:1, LO₂ 860:1, LH₂ 851:1) **[A]** (LBNL), so a modest liquid spill in a
closed room displaces a great deal of air. Nitrogen and argon are odourless,
colourless, non-irritating, and give no warning at all.

**The threshold.** Both LBNL and SLAC define it identically: "An oxygen
deficiency hazard (ODH) exists when the concentration of oxygen is 19.5 percent
or less by volume" **[A]** —
https://www-group.slac.stanford.edu/esh/eshmanual/references/cryogenicsReqODH.pdf ;
"Any local oxygen concentration below 19.5% by volume constitutes an oxygen
deficiency" **[A]** —
https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch29/
Jefferson Lab uses the same 19.5 % figure. **[B]** —
https://www.jlab.org/ehs/ehsmanual/6540.htm

**Alarm setpoints.** SLAC requires that monitors "provide an oxygen readout and a
local audible and visible alarm when the oxygen level falls below 19.5 percent."
**[A]** Commercial units commonly ship with two setpoints, typically **19.5 %
(warning)** and **18.0 % (evacuate)**. **[C]**

**ODH classification.** LBNL uses a risk-rate classification that is a good
teaching device because it makes the point that ODH is assessed as a
*probability × consequence*, not just a concentration **[A]**:

| Class | Fatality risk rate |
|---|---|
| 0 | < 10⁻⁷ per hour |
| 1 | > 10⁻⁷ but < 10⁻⁵ per hour |
| 2 | > 10⁻⁵ but < 10⁻³ per hour |
| 3 | > 10⁻³ per hour |

SLAC's controls table shows how classification drives hardware: warning signs,
installed oxygen monitors and ventilation are required at ODH 1 and above, with
"Relief valves and piping arrangements as required by [the pressure systems
chapter] or the cryogenic and ODH safety program manager." **[A]**

**Placement logic — the single most important concept.** *Put the sensor where
the gas goes.* And where the gas goes depends on its density **at the temperature
it arrives at**, which is not always its density at room temperature.

- **Helium and hydrogen** are lighter than air and rise. SLAC: "if helium [is]
  used as a cryogen in an accelerator tunnel then oxygen sensors need to be
  located where the gas would tend to accumulate during a release. Fixed oxygen
  monitors sensors should be located at **ceiling height** because helium is
  lighter than air." **[A]**
- **Nitrogen and argon.** Argon is denser than air and pools low. Nitrogen is
  almost exactly air's density warm — but **cold nitrogen vapour is much denser
  than air** and will initially sink and flow along the floor like a liquid,
  then rise as it warms. This is why a single mounting height is not a general
  answer for LN₂: a release behaves like a heavy gas at first and a neutral one
  later. Breathing-zone height is the usual compromise, with low-level sensing
  where argon is present or where there is a pit, trench or sump.
- **Read-out location.** SLAC: "Monitors and alarm readouts should be placed so
  that they can be read and operated from **outside** of the potential ODH area."
  **[A]** You must be able to know the room is unsafe without entering it.
- **Architectural traps.** SLAC discusses **lintels** as an engineering control
  to hold a buoyant gas layer at the ceiling and buy evacuation time, and warns
  that "Service buildings located above such a tunnel that have ceiling to floor
  penetrations ... require special attention to prevent an ODH situation in the
  above-ground buildings. Such penetrations must be identified and plugged to
  keep helium out." **[A]**

**A calibration warning that deserves to be taught.** SLAC found that some
oxygen monitors do not behave correctly in a helium atmosphere:

> "Monitors intended for such spaces must be tested in a helium-enriched
> reduced-oxygen environment to establish their performance (once per model) as
> **some models fail to alarm properly in the presence of helium**. Do not depend
> on vendor literature because experience has shown that it is often unclear on
> this topic." **[A]**

This is the general lesson in miniature: a gas detector is calibrated against a
specific mixture, and its behaviour in a *different* diluent is an empirical
question, not a datasheet question.

**Interlocking.** SLAC describes both a differential-pressure switch tripping a
solenoid in the supply line, and "a fixed oxygen deficiency monitor alarm
interlocked in a feedback loop to the supply valve [that] shuts off the flow of
gas in the system if the oxygen level in the room is below a set point," adding
that "the use of interlocks should be considered whenever feasible." **[A]**

### Combustible gas detectors

**Sensing principles:**

- **Catalytic bead (pellistor).** A catalysed bead oxidises the combustible gas
  on its surface; the heat of reaction raises its resistance, measured against a
  matched inert reference bead. Responds to *anything* combustible, including
  hydrogen. Requires oxygen to work (it is a combustion device — so it under-
  reads or fails in an oxygen-depleted atmosphere, which is precisely the
  condition a cryogenic leak creates). Susceptible to poisoning by silicones,
  sulphur and halogens. **[C]**
- **Infrared (NDIR).** Measures absorption at a hydrocarbon C–H band. Immune to
  poisoning, needs no oxygen, and fails safe on beam loss. **But infrared
  sensors cannot detect hydrogen** — H₂ is diatomic and homonuclear, with no IR
  absorption band. **[C]** This is a decisive constraint: an IR detector array is
  useless for a hydrogen system.
- Others in use: electrochemical (for H₂ specifically), thermal conductivity,
  and metal-oxide semiconductor.

**Alarm setpoints.** Combustible gas is measured as a percentage of the **Lower
Explosive Limit (LEL)**, not as an absolute concentration. Conventional practice
is a first alarm at **20 % LEL** and a second at **40 % LEL** (or higher), the
gap giving time to ventilate or evacuate before a flammable atmosphere exists.
**[C]** — https://www.crowcon.com/us-en/article/what-is-lel/

The design logic behind 20 % is worth stating: it is a **safety margin on a
mixture that is not yet flammable**. At 20 % LEL there is no fire risk; the
alarm exists to act before there is.

**Placement — methane detector vs O₂ monitor.** This contrast is a clean teaching
example because the two answers are different for the same room:

| | Combustible (CH₄, H₂) detector | Oxygen deficiency monitor |
|---|---|---|
| **What it is looking for** | A buoyant fuel gas rising and accumulating at the highest point | Displacement of air in the volume people occupy |
| **Where it goes** | **High** — at or near the ceiling, above the leak source. Guidance for lighter-than-air gases is to mount near the ceiling/roof beams, commonly ~30–60 cm below the ceiling, and above the potential leak point **[C]** | **Breathing zone** for N₂/Ar (commonly ~3–5 ft off the ground), and **ceiling height** for helium **[A]** (SLAC) |
| **Why** | Fuel accumulates where it collects, and you want to detect it *before* the layer reaches an ignition source | You want to know the oxygen concentration where a person's lungs actually are |

Note the asymmetry: for **helium** the two happen to agree (both go high), but
helium is not flammable so only the O₂ monitor applies. For **methane or
hydrogen** the fuel detector goes high while the O₂ monitor stays in the
breathing zone. For **argon** the O₂ monitor goes low. There is no single
"gas detector height."

Additional siting rules from vendor practice: mount within roughly 3–5 ft of
the potential leak source for spot coverage, keep monitors out of dead air
pockets and away from doors, vents and fans that would sweep the gas past the
sensor, and site them where they can actually be serviced and bump-tested.
**[C]** — https://www.rcsystemsco.com/gas-detector-placement

**Calibration concepts.** Three distinct activities that get conflated:
- **Zero/span calibration** against a certified gas of known concentration
  (commonly 2.5 % methane in air for combustible sensors, i.e. ~50 % LEL).
  **[C]**
- **Bump test** — a brief exposure to confirm the sensor responds and the alarm
  actuates. Not a calibration; it only proves the device is alive.
- **Cross-sensitivity / correction factors.** A catalytic sensor calibrated on
  methane responds differently to propane, hydrogen or a solvent vapour;
  manufacturers publish correction factors. A detector reading "% LEL" is really
  reading "% LEL *of the calibration gas*" unless corrected. **[C]**

Calibration gas has an expiry date, and an expired cylinder is a silent way to
mis-calibrate a whole facility. **[C]**

**The general design-review question for all gas detection:** what does this
detector *not* see? (IR cannot see hydrogen; catalytic bead needs oxygen; an O₂
monitor at breathing height will not see a helium layer at the ceiling; a
detector downstream of a fan may never see the plume at all.) Detection coverage
should be argued from a release scenario, not from a coverage-radius rule of
thumb.

---

# 6. How to read a cryogenic P&ID

## 6.1 The governing standard

**ANSI/ISA-5.1**, *Instrumentation Symbols and Identification*, is the
authoritative reference for instrument tagging and symbology on a P&ID. It was
"originally published in 1984" and its purpose is to "consistently identify
instrumentation in project documents used for specifying, purchasing, tracking,
installing, and eventually maintaining them." ISA notes that in practice the
standard "is often not followed completely — particularly regarding device
identification tagging." **[A]** —
https://www.isa.org/intech/2020/september-october/isa-5-1-instrumentation-symbols-and-identification

The standard itself is maintained by ISA's ISA5 committee: **[A]** —
https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa5

> **Note on sourcing.** ISA's own materials state that ISA intellectual property
> may not be entered into AI tools, and the public ISA pages therefore do not
> reproduce the letter tables. The tables below are compiled from a public
> engineering reference **[B]** and are consistent across every secondary source
> consulted, but **the controlling document is ANSI/ISA-5.1 itself** and a course
> that teaches this should obtain a copy.

## 6.2 The tag scheme

An ISA tag is **letters + a loop number**, e.g. `PT-101`.

**First letter = the measured or initiating variable.**
**Succeeding letters = what the device does with it** (readout/passive function,
then output/active function), plus modifiers.

### First letters (measured variable) **[B]**

| | | | |
|---|---|---|---|
| **A** Analysis (composition) | **B** Burner, combustion | **D** User's choice (often density) | **E** Voltage |
| **F** Flow rate | **G** User's choice (gauging) | **H** Hand (manual) | **I** Current (electrical) |
| **J** Power | **K** Time, schedule | **L** Level | **P** Pressure, vacuum |
| **Q** Quantity | **R** Radiation | **S** Speed, frequency | **T** Temperature |
| **U** Multivariable | **V** Vibration, mechanical analysis | **W** Weight, force | **X** Unclassified |
| **Y** Event, state, presence | **Z** Position, dimension | | |

### Succeeding letters (function and modifier) **[B]**

| | | | |
|---|---|---|---|
| **A** Alarm | **B** User's choice | **D** Differential *(modifier)* | **E** Sensor, primary element |
| **F** Ratio *(modifier)* | **G** Glass, gauge, viewing device | **H** High *(modifier)* | **I** Indicate |
| **J** Scan *(modifier)* | **K** Time rate of change; control station | **L** Light; Low *(modifier)* | **P** Point (test connection) |
| **Q** Integrate, totalise *(modifier)* | **R** Record | **S** Switch; Safety *(modifier)* | **T** Transmit |
| **U** Multifunction | **V** Valve, damper, louver | **W** Well | **X** Unclassified |
| **Y** Relay, compute, convert | **Z** Driver, actuator, final control element | | |

Source for both tables: https://mechcodex.com/reference/isa-instrumentation-tag-letters **[B]**

### Worked examples **[B]**

| Tag | Reads as |
|---|---|
| **PT** | Pressure Transmitter |
| **TT** | Temperature Transmitter |
| **FT** | Flow Transmitter |
| **LT** | Level Transmitter |
| **PI** | Pressure Indicator (a local gauge) |
| **TE** | Temperature Element — the sensor itself |
| **TW** | Thermowell |
| **FE** | Flow Element — the orifice, venturi or turbine body |
| **PIC / FIC / TIC / LIC** | …Indicating Controller |
| **PSV** | Pressure Safety Valve — P (pressure) + S (safety, modifier) + V (valve) |
| **PSE** | Pressure Safety Element — conventionally the rupture disc |
| **LSH / LSL** | Level Switch High / Low |
| **PDT** | Pressure **D**ifferential Transmitter |
| **FCV / PCV / TCV** | Flow / Pressure / Temperature Control Valve |
| **HV** | Hand Valve (manually actuated, shown as an instrument) |
| **ZS** | Position Switch — e.g. a valve limit switch |

Two decoding habits worth teaching:

1. **Read the first letter as a noun and the rest as a verb phrase.** `PDIT` =
   *pressure, differential, indicate, transmit*.
2. **`S` is ambiguous and context decides.** In `PSV` it is the *safety*
   modifier; in `LSH` it is *switch*. This trips people up constantly.

### Loop numbers

The digits identify the control loop, not the device — `PT-101`, `PIC-101` and
`PCV-101` are the transmitter, controller and valve of the *same* loop. A
cryogenic P&ID often numbers loops by system (100-series = LOX, 200-series =
fuel, 300-series = pneumatics), which is why the number is worth reading as
carefully as the letters.

## 6.3 Bubbles, symbols and line types

**Instrument bubbles.** A circle is an instrument. What is drawn *through* it
tells you where it lives:

| Symbol | Meaning |
|---|---|
| Plain circle | Discrete instrument, **field mounted** |
| Circle with a **single horizontal line** | Discrete instrument, mounted on a **main panel**, accessible to the operator |
| Circle with a **double horizontal line** | Main panel, **rear of panel** / not operator accessible |
| Circle inside a **square** | **Shared display / shared control** — i.e. it lives in the DCS or PLC |
| **Hexagon** | Computer function |
| **Diamond inside a square** | Programmable logic controller |
| **Dashed** enclosure | Software / non-accessible function |

> **[C] — FLAGGED.** Unlike the letter tables above, this bubble/line-type
> summary was **not** confirmed against a specific fetched source; it is the
> widely taught ISA convention as understood across the engineering literature.
> The letter tables came from
> https://mechcodex.com/reference/isa-instrumentation-tag-letters **[B]**, which
> covers tags but was not verified to cover symbology. **Check these against
> ANSI/ISA-5.1 directly before teaching them** — the horizontal-line convention
> in particular has changed in wording across editions.

**Line types.** The P&ID distinguishes the process from the signals carrying
information about it:

| Line | Meaning |
|---|---|
| Heavy solid | **Process line** (the actual pipe) |
| Thin solid | Instrument-to-process connection |
| Dashed | Electrical signal |
| Line with double cross-hatches | Pneumatic signal |
| Line with small circles | Data link / software link |
| Line with `//` marks | Hydraulic |
| Line with `-x-x-` | Capillary (filled system) |

**[C]** — same caveat as the bubble table above: standard ISA convention,
not verified against a fetched primary source. Confirm against ANSI/ISA-5.1.

**Valve symbols.** The body type is drawn (bowtie for a generic valve, with
gate/globe/ball/check variants distinguished by the internal marking), and the
**actuator is drawn on top**: a diaphragm dome for pneumatic, a rectangle with
`S` for solenoid, a handwheel or `M` for manual/motor. **A cryogenic P&ID should
also carry the fail position** — commonly annotated `FC` (fail closed), `FO`
(fail open) or `FL` (fail last) beside the valve, or shown with an arrow on the
actuator. Reading fail positions off the drawing is one of the core skills of a
cryogenic design review (§3.5).

## 6.4 How a cryogenic schematic is typically laid out

Conventions that make cryogenic P&IDs readable:

- **Left to right in the direction of flow**, source to use point: storage →
  transfer → run tank → feed → engine/test article, with the vent and relief
  paths taken off upward.
- **One fluid, one horizontal band.** LOX on one level, fuel on another,
  pneumatics/inert on a third. Crossings are minimised and clearly broken.
  This layout is itself a safety measure: it makes an accidental fuel/oxidiser
  interconnection visually obvious.
- **Vacuum-jacketed line is drawn as a double line** or annotated `VJ`, with the
  jacket's pump-out/relief port shown as its own connection. Insulation type is
  usually a line-class annotation rather than a symbol.
- **Every relief device is drawn**, including the small ones. A cryogenic P&ID
  has far more `PSV`/`PSE` bubbles than a comparable ambient-temperature drawing,
  because of the isolatable-volume rule (§3.4, §4.1). Trapped-volume reliefs
  between valve pairs are a distinguishing visual feature of a cryogenic
  schematic.
- **Vent and relief headers are shown terminating**, with their discharge point
  identified — and fuel, oxidiser and inert vents shown terminating *separately*
  (§4.4).
- **Bayonet joints and flex hoses are called out**, because they are maintenance
  break points and flexibility elements, not just pipe.
- **Line classes carry the design temperature**, which is how material
  requirements (austenitic stainless, no carbon steel) get enforced from the
  drawing.

### A reading checklist for a cryogenic P&ID

A useful exercise for a design-review class, built from the rules above:

1. **Close every valve mentally.** List every volume that is now isolated. Does
   each have a relief? (§3.4)
2. **Find every relief and trace its discharge.** Where does it end up? Do fuel
   and oxidiser reliefs share anything? (§4.4)
3. **Check every vented ball valve's orientation** against the direction it must
   hold pressure. (§3.4)
4. **Read every fail position.** On loss of air and loss of power, what state
   does the whole system go to — and is that state safe? (§3.5)
5. **Find the vacuum-jacketed sections** and confirm each has an annulus relief
   and a pump-out port that is accessible. (§2.3)
6. **Check every instrument's sense line** for freeze/plug and for whether an
   interlock depends on it. (§5.2)
7. **Check that every flow measurement can be shown to be single-phase at the
   meter.** (§5.3)
8. **Locate the gas detection** and ask what release scenario each detector
   covers. (§5.5)
