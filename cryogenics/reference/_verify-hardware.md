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
in one line: SOFI over MLI "prevented purge gas liquefaction within the MLI and
resulted in the expected ground hold heat leak of **63 W/m²**," while orbit-hold
tests gave **0.085 and 0.22 W/m²** at warm boundary temperatures of 164 K and
305 K. **[B]** (reported in the NASA SOFI/composite-insulation literature; see
Fesmire's KSC Cryogenics Test Laboratory work, e.g.
https://ntrs.nasa.gov/api/citations/20180006600/downloads/20180006600.pdf for
the comparative framework and test method)

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
