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
