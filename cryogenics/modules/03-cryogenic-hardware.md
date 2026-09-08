# Module 03 — Cryogenic Hardware

*Roughly 25 minutes. Prerequisite: Module 02.*

Every cryogenic component looks like its room-temperature cousin and is not one. A
ball valve is still a ball valve, but the cold version has a stem half a metre long,
a hole drilled through the ball, and a flow arrow that matters. Read a cryogenic
system as if it were a compressed-air system and you will miss the three or four
features actually holding the hazard down.

## What you'll be able to do

- Tell the four kinds of "tank" apart, and say which is not a pressure vessel.
- Explain what the vacuum annulus does, and what losing it does to heat leak.
- Say why a cryogenic valve has an extended bonnet and why some balls are drilled.
- Find every isolatable volume on a schematic and ask whether it is relieved.
- Read ISA tags, valve and relief symbols and line types off a cryogenic P&ID.

---

## 1. Storage

**Open-neck dewars** are double-walled vessels closed by a *loose plug*, not a seal:
the plug lets boiloff out continuously while keeping air — and the water and CO₂ in
it, which freeze — from diffusing down the neck. The defining property is that
**this is not a pressure vessel**; it is vented by construction, good for storage
"at maximum several days" `[LBNL-PUB3000-29]`. Sealing it, or letting the neck ice
over, makes it a sealed vessel with no relief.

**Pressurised liquid cylinders** are vacuum-jacketed ASME vessels on castors with an
internal pressure-building circuit, an economiser, a liquid leg and a relief stack —
roughly 22 psig for liquid withdrawal, 230–350 psig for gas use
`[LBNL-PUB3000-29]` `[CHART-LIQUID-CYLINDER]`. Not a static store like a K-bottle
but an **active, self-pressurising machine** whose pressure rises when idle and sags
when you withdraw hard: closer to a small boiler than to a cylinder.

**Bulk tanks** are foundation-mounted stationary vessels with an external vaporiser
and a full relief system; typical catalogue MAWP is 250 psig, with "dual relief
valves and rupture disks ... as standard" `[CHART-BULK]`.

**Run tanks** are what the engine draws from, filled shortly before a firing. A
storage tank is optimised for *hold time*; a run tank for *discharge* — big outlet,
controlled ullage pressure, predictable pressure history — and may be poorly
insulated because it is only cold for hours. Its design case is a transient, and so
are its failure modes: ullage collapse when cold pressurant meets warm liquid,
stratification that makes measured saturation pressure unrepresentative of the
liquid being drawn, chilldown eating propellant budget, geysering in tall feed legs.

**The annulus.** Two concentric boundaries: the inner vessel holds the cryogen, the
outer jacket holds one atmosphere out, and the gap is evacuated. That kills gas
conduction and convection, leaving radiation across the gap and solid conduction
through the supports. So radiation now dominates, and you add shields; the supports
now dominate the residual, so they are long, thin and low-conductivity, fighting the
structural requirement; and the vacuum is a consumable, degrading by outgassing,
permeation and leakage — hence the molecular sieve and getter in the annulus (the
sieve adsorbs everything larger than hydrogen, the getter "converts free hydrogen
into water that the molecular sieve can then adsorb") and a pump-out port
`[AIGA-106]`.

<figure>
<svg viewBox="0 0 660 330" role="img" aria-label="Cross-section of a vacuum-jacketed tank showing outer jacket, evacuated annulus filled with multilayer insulation, inner vessel with liquid and ullage, support struts, neck penetration and a combined pump-out port and annulus relief device">
  <rect x="60" y="40" width="260" height="250" rx="10" fill="var(--side)" stroke="currentColor" stroke-width="2"/>
  <rect x="72" y="52" width="236" height="226" rx="8" fill="none" stroke="var(--muted)" stroke-dasharray="3 3"/>
  <rect x="79" y="59" width="222" height="212" rx="8" fill="none" stroke="var(--muted)" stroke-dasharray="3 3"/>
  <rect x="86" y="66" width="208" height="198" rx="8" fill="none" stroke="var(--muted)" stroke-dasharray="3 3"/>
  <rect x="95" y="75" width="190" height="180" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
  <rect x="97" y="177" width="186" height="76" fill="var(--oxy)" opacity="0.25"/>
  <line x1="97" y1="177" x2="283" y2="177" stroke="var(--oxy)" stroke-width="2"/>
  <text x="190" y="222" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor">liquid</text>
  <text x="190" y="130" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor">ullage (vapour)</text>
  <line x1="120" y1="255" x2="100" y2="289" stroke="currentColor" stroke-width="3"/>
  <line x1="260" y1="255" x2="280" y2="289" stroke="currentColor" stroke-width="3"/>
  <line x1="175" y1="12" x2="175" y2="75" stroke="currentColor" stroke-width="2"/>
  <line x1="205" y1="12" x2="205" y2="75" stroke="currentColor" stroke-width="2"/>
  <line x1="320" y1="120" x2="352" y2="120" stroke="currentColor" stroke-width="2"/>
  <circle cx="360" cy="120" r="8" fill="none" stroke="var(--warn)" stroke-width="2"/>
  <text x="215" y="26" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">neck &amp; penetrations</text>
  <text x="376" y="60" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">Outer jacket — holds 1 atm out</text>
  <text x="376" y="86" font-size="13" font-family="system-ui, sans-serif" fill="var(--muted)">Annulus: evacuated, MLI, getter</text>
  <text x="376" y="112" font-size="13" font-family="system-ui, sans-serif" fill="var(--warn)">Pump-out port + annulus relief</text>
  <text x="376" y="138" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">Inner vessel — the pressure boundary</text>
  <text x="376" y="164" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">Ullage sets the tank pressure</text>
  <text x="376" y="190" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">Liquid (colour = service: oxidiser)</text>
  <text x="376" y="216" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">Supports: long, thin, low-k —</text>
  <text x="376" y="234" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">the residual conduction path</text>
  <line x1="320" y1="55" x2="366" y2="55" stroke="var(--muted)"/>
  <line x1="300" y1="81" x2="366" y2="81" stroke="var(--muted)"/>
  <line x1="286" y1="133" x2="366" y2="133" stroke="var(--muted)"/>
  <line x1="280" y1="285" x2="366" y2="229" stroke="var(--muted)"/>
</svg>
<figcaption>Figure 3.1 — A vacuum-jacketed vessel. Everything interesting happens in the annulus: the vacuum kills gas conduction, the MLI attacks radiation, and the supports and neck are what is left.</figcaption>
</figure>

**MLI** alternates a low-emissivity shield (aluminised Mylar or foil) with a
low-conductivity spacer. Radiation falls roughly with the number of floating
shields, but conduction rises with spacer thickness, so performance "is a function
of the number of layers per thickness, or layer density" `[NASA-MLI-JOHNSON]` —
there is an optimum layer *density*, not an optimum count. Blankets run 10–80 layers
`[NASA-FESMIRE-KSC]`, and MLI performs only below about 10⁻³ torr
`[NASA-MLI-JOHNSON]`; below that the spacer stops isolating and starts conducting.
Hence **evacuated perlite** on big field-erected tanks, which works at 1–10
millitorr `[NASA-KOGAN-MLI]`, pours rather than being hand-laid, and tolerates
compression; and **foam** where no vacuum is practical, which degrades
monotonically as moisture drives in, freezes, cracks it, and admits more moisture.

Compression is MLI's underappreciated killer. Against a no-load baseline near
**0.6 W/m²**, a load of 0.7 kPa (0.1 psi) causes a **15× rise in heat flux**, 7 kPa
about 40×, 70 kPa more than 100× `[NASA-FESMIRE-KSC]`. A cable tie or a support pad
destroys the insulation locally; seams, penetrations and edge effects add 100 % or
more again `[NASA-KOGAN-MLI]`.

**Loss of vacuum** is the number that sizes reliefs. Design fluxes for a failed
insulating vacuum are **25–40 kW/m² bare and 1–7 kW/m² insulated**
`[JLAB-OVERPRESSURE]`, against a healthy ~0.6 W/m² `[NASA-FESMIRE-KSC]` — a ratio
near **10⁴**. The mechanism is not convection: air entering a cold annulus
**condenses and freezes on the inner vessel**, and the latent heat delivers the
flux. Frozen air can also obstruct relief devices, so SLAC requires designs where
air that enters and freezes "cannot prevent proper functioning of pressure relief
devices" `[SLAC-CH36]`.

<div class="box remember"><span class="lbl">Remember this</span>
A vacuum jacket is not an efficiency measure. It is what stands between 0.6 W/m² and
25–40 kW/m². Every vacuum-jacketed volume needs two relief answers — normal boiloff,
and the day the annulus goes to atmosphere — usually satisfied by different devices.
</div>

Vacuum quality is measurable: acceptance is a rise under 2 microns/day over two days
then no rise, final level no worse than 15 microns; in service, below 2 Pa is
"suitable for the continuity of service" and 2–20 Pa is "degraded" `[AIGA-106]`.

**Boiloff** is quoted as NER, percent of contents lost per day standing idle.
Vertical bulk tanks run **0.35 %/day down to 0.10 %/day in oxygen or argon** and
**0.56 % down to 0.16 % in nitrogen**; horizontal tanks of the same capacity are
worse (0.90 % at the small end) `[CHART-BULK]`. Bigger is better, by
surface-to-volume; nitrogen is worse than oxygen in the same tank because its latent
heat per unit volume is lower. Small vessels are far worse — a 10-litre LN₂ dewar
with an NER of 8.8 litres/day holds for **1.1 days** `[TRADE-EXPLANATORY]` — which
is why small dewars, as continuous gas sources, drive the oxygen-deficiency analysis
of a room.

**Pressure build.** A liquid cylinder needs no external pressurant: liquid is drawn
off the bottom, gasified in a **pressure-building coil** warmed by ambient air, and
returned to the ullage, with a **PB regulator** opening that loop below its set
point. An **economiser regulator** about 15 psig higher does the opposite — when
heat leak walks pressure up it takes withdrawal from the *ullage*, so demand
consumes the excess head gas rather than venting it `[TRADE-EXPLANATORY]`. Three
consequences: the tank is a pressure source that never switches off, so parked it
reaches its relief setting and sits there venting; delivery pressure is coupled to
withdrawal rate, because the coil is a heat exchanger of finite capacity that
*falls* as it ices; and with the economiser open you are drawing **gas, not
liquid** — a commonly missed failure mode for a run tank fed from a liquid cylinder.

<div class="box"><span class="lbl">Worth knowing</span>
Frost is diagnostic, not decorative. A ring of ice after use is normal, but permanent
or growing external ice on a vacuum-jacketed surface means the vacuum is failing —
"if ice does form on the outside of the dewar, it indicates that the dewar may have
lost vacuum" `[LBNL-PUB3000-29]`, and AIGA says the same for piping `[AIGA-106]`.
</div>

---

## 2. Piping and joints

**Bare line** is defensible only for short runs nobody can touch; on LOX service it
condenses moisture and, worse, liquid air, which is oxygen-enriched as it drips.
**Foam** is cheap and field-repairable at 5–20 W/m² and degrades by the moisture
ratchet above. **Vacuum-jacketed line** is pipe within pipe at roughly 0.5–2.0 W/m²
`[CHART-VIP]`, the default for anything long or anything that must arrive
single-phase.

VJ brings two obligations. First, **expansion provisions**: the inner pipe goes to
77 K while the jacket stays near ambient, and austenitic stainless contracts roughly
0.3 % from 293 K to 77 K — read the exact coefficient off `[NIST-CRYO-MATERIALS]`
before quoting one — so a 30 m run moves about 90 mm relative to its jacket. AIGA
requires a flexibility analysis covering bellows selection and fixed and sliding
supports, with bellows rated for a minimum **1000 cycles** `[AIGA-106]`; a stand
chilling down twice a day eats that in under two years. Second, an **annulus
relief**: the annulus is a sealed volume beside a cryogen, so an inner leak fills it
with liquid that boils and bursts a jacket built only to hold out one atmosphere.
AIGA requires an annular-space relief device, usually combined with the pump-out
port, and notes the diagnostic — a **missing pump-out plug** may mean an inner leak
blew it out `[AIGA-106]`. Jefferson Lab requires the vacuum space to be relieved and
points at the CGA S-1 series for capacity `[JLAB-OVERPRESSURE]`.

**Bayonet joints** connect two VJ lines with concentric halves that slide together,
sealing at the *warm* end, a **static column of vapour** in the gap doing the
insulating `[TRADE-EXPLANATORY]`; the sliding fit also absorbs contraction. Icing at
a bayonet means that column has been defeated. In LOX service, oxygen leaking into
the gap and evaporating can enrich hydrocarbons on the metal until ignition occurs
`[AIGA-106]` — one reason oxygen cleanliness standards exist `[CGA-G-4.1]`.

**Bellows** absorb contraction and misalignment, and fail characteristically by
**squirm**: above a stability limit the convolutions buckle sideways, as column
squirm (lateral shift of the centre section) or in-plane squirm (rotation of a
convolution's plane). A squirmed bellows cannot be reset — it is scrapped — and left
in service it fatigues fast; EJMA requires a **safety factor of 3 against squirm**
`[EJMA]`. They also fail by fatigue, by flow-induced vibration when vortex shedding
at the convolution pitch meets the natural frequency (hence liners on high-velocity
runs), and by being anchored or guided wrongly.

For joints the cold ranking is **welded > brazed > mechanical**, because of
differential contraction at a seal interface: a full-penetration weld has no seal to
relax and no preload to lose, braze filler and parent contract differently, and every
mechanical joint depends on a contact stress that cooling changes — thermal *cycling*
being worse than steady cold, because it ratchets. Where a demountable joint is
needed the metal gasket face seal (VCR) is preferred, its seal set by plastic
deformation rather than by an elastomer that can relax `[SWAGELOK-VCR]`; NASA did not
assume catalogue fittings would hold but leak-tested them from ambient to 20 K, before
and after launch environment `[NASA-VCR-FITTINGS]`. Most elastomers pass their glass
transition well above cryogenic temperature and stop sealing `[PARKER-ORD-5712]`,
which is why the standard trick is to keep the elastomer warm — the logic of both the
bayonet and the extended bonnet.

---

## 3. Valves

**Ball** valves are the quarter-turn isolation default — full bore, low drop, fast,
and cursed with a body cavity. **Globe** valves throttle well at the price of
pressure drop and a large wetted body. **Gate** valves are less common cold, because
guide clearances and large seat areas sit badly with differential contraction.
**Needle** valves meter instrument and purge flows. All four differ from their warm
cousins in the same four ways: materials that stay ductile cold (austenitic
stainless, never carbon steel), clearances opened so contraction cannot seize them,
seat polymers chosen for cold ductility, and an extended bonnet.

**Why the stem is that long.** A stem passes through polymeric packing, and at 77 K
polymers are not seals but brittle rings that shrink away from the stem, while the
gland ices externally and freezes it in place. So the bonnet is lengthened until the
packing sits far enough from the cold body to stay warm, with a **static column of
cryogen vapour** between as the insulator. MSS SP-134 puts it functionally: the
extension must "sufficiently isolate the stem packing and valve operating mechanism
from the temperature effects of the cryogenic fluid" and be "long enough to provide
an insulating gas column that prevents the packing area and operating mechanism from
freezing" `[MSS-SP-134]`. Two competing pressures live inside it: stem-to-bore
clearance is set to **minimise convection**, since too much gap lets the column
circulate and carry heat, while wall thickness is **minimised** consistent with
pressure rating and operating bending stress, to cut conduction down the wall
`[MSS-SP-134]`. Hence **orientation matters** — the column insulates only while it
can stratify, so these valves go stem-vertical or close to it, and one mounted far
off vertical lets liquid into the extension and freezes the packing. The slender
extension is also compliant, so the operator can turn while the closure member has
not moved, and it is itself a conduction path into the fluid.

<figure>
<svg viewBox="0 0 660 340" role="img" aria-label="Cross-section of an extended-bonnet cryogenic ball valve showing the cold body with ball and trapped body cavity, a relief hole through the ball facing upstream, the long bonnet extension containing a static vapour column, the frost line, and the warm packing gland and actuator at the top">
  <rect x="180" y="228" width="150" height="84" rx="6" fill="var(--side)" stroke="currentColor" stroke-width="2"/>
  <line x1="90" y1="252" x2="180" y2="252" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="90" y1="288" x2="180" y2="288" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="330" y1="252" x2="420" y2="252" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="330" y1="288" x2="420" y2="288" stroke="var(--oxy)" stroke-width="2"/>
  <path d="M120 270 l22 -7 v14 z" fill="var(--oxy)"/>
  <text x="96" y="243" font-size="13" font-family="system-ui, sans-serif" fill="var(--oxy)">upstream</text>
  <text x="336" y="243" font-size="13" font-family="system-ui, sans-serif" fill="var(--oxy)">downstream</text>
  <circle cx="255" cy="270" r="34" fill="none" stroke="currentColor" stroke-width="2"/>
  <rect x="247" y="240" width="16" height="60" fill="var(--side)" stroke="currentColor"/>
  <path d="M186 236 h44 a34 34 0 0 0 50 0 h44 v68 h-44 a34 34 0 0 0 -50 0 h-44 z" fill="var(--warn)" opacity="0.22"/>
  <text x="255" y="332" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="var(--warn)">body cavity — trapped volume</text>
  <path d="M232 252 l-14 -8" stroke="var(--ok)" stroke-width="3"/>
  <path d="M218 244 l10 0 l-4 -7 z" fill="var(--ok)"/>
  <text x="430" y="252" font-size="13" font-family="system-ui, sans-serif" fill="var(--ok)">relief hole through the ball,</text>
  <text x="430" y="270" font-size="13" font-family="system-ui, sans-serif" fill="var(--ok)">facing upstream — so the valve</text>
  <text x="430" y="288" font-size="13" font-family="system-ui, sans-serif" fill="var(--ok)">is unidirectional</text>
  <rect x="240" y="96" width="30" height="132" fill="none" stroke="currentColor" stroke-width="2"/>
  <line x1="255" y1="96" x2="255" y2="228" stroke="var(--muted)" stroke-dasharray="4 4"/>
  <text x="284" y="150" font-size="13" font-family="system-ui, sans-serif" fill="var(--muted)">static vapour column</text>
  <text x="284" y="168" font-size="13" font-family="system-ui, sans-serif" fill="var(--muted)">in the bonnet extension</text>
  <rect x="226" y="66" width="58" height="30" fill="var(--side)" stroke="currentColor" stroke-width="2"/>
  <text x="300" y="86" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">packing — must stay warm</text>
  <path d="M226 66 a29 26 0 0 1 58 0 z" fill="var(--side)" stroke="currentColor" stroke-width="2"/>
  <text x="300" y="44" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">actuator (pneumatic)</text>
  <line x1="100" y1="200" x2="420" y2="200" stroke="var(--warn)" stroke-dasharray="6 4"/>
  <text x="100" y="194" font-size="13" font-family="system-ui, sans-serif" fill="var(--warn)">frost line</text>
  <text x="100" y="322" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">body at process temperature</text>
</svg>
<figcaption>Figure 3.2 — The extended bonnet exists to put a stagnant vapour column between the cold body and the polymer packing. The drilled ball exists because the closed body cavity would otherwise be a sealed volume of warming cryogen.</figcaption>
</figure>

**Check valves** stop reverse flow but are not isolation valves: close tolerances
mean contamination causes sticking and leakage `[NASA-PROP-TEST-HANDBOOK]`, and
check-valve leakage is a named cause of overpressure `[JLAB-OVERPRESSURE]`. There is
a neat cryogenic *use* for one — routine boiloff relief can be "an open passage to
the atmosphere with a check valve" `[SLAC-CH36]`, keeping air and its water out of a
continuously venting line.

**Actuation** is manual, solenoid, or — for anything large — pneumatic piloted by a
small solenoid `[NASA-PROP-TEST-HANDBOOK]`. **Fail-safe position** asks which state
is least dangerous when air, power or signal disappears, and the answer is per-valve.
Propellant isolation and pressurisation valves fail **closed**: stop adding
propellant, stop adding pressure. Vent and relief paths fail **open**, because loss
of control must not leave a cryogenic volume bottled up — that reversal is the whole
point. Inert purge is usually fail open, but a purge is also an asphyxiant, so it is
case-dependent. Fuel and oxidiser isolation logic is the same; the asymmetry is in
consequence — a failed-open oxidiser path creates an ignition environment, a
failed-open fuel path a flammable cloud — and no single failure may open both into a
common volume. Note too that "fail-safe" describes the actuator on loss of its
utility. It does not mean the valve cannot stick.

**Trapped volume.** When a ball valve closes, fluid is sealed in the **body cavity**,
connected to neither line, and it warms. Confined cryogen warming to ambient
generates pressure "in excess of 10,000 psig" `[LBNL-PUB3000-29]`, driven by an
expansion ratio near **696:1 for nitrogen** at 70 °F `[AP-SG-27]`; the body was never
designed for that and fails as a fragmentation event. The fix is a **relief hole**
drilled through one wall of the ball into the cavity, so cavity pressure cannot
exceed line pressure. It always faces **upstream**: venting downstream would push the
ball off the upstream seat and open a permanent leak path `[TRADE-EXPLANATORY]`. The
consequence is large — a vented ball valve is **unidirectional**, and its arrow must
match the direction in which it is expected to *hold pressure*, which during a drain
or purge may not be the normal flow direction. The alternative is spring-loaded
self-relieving seats, which keep bidirectional sealing.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
Two block valves in a line with nothing between them. Close both and the pipe between
is a sealed volume of liquid with no relief and no instrument on it. It warms at
whatever rate heat leaks in, and the first indication is the pipe or a valve body
letting go. This is the canonical cryogenic review finding, and Module 05 is largely
about it.
</div>

---

## 4. Relief and venting

**The philosophy in one sentence:** every volume that can hold cryogen and can be
isolated needs its own relief path that cannot itself be isolated, sized for the worst
credible heat input into that volume. SLAC: "Each and every portion of the cryogenic
system must have uninterruptible pressure relief" `[SLAC-CH36]`; LBNL says the same
and extends it to any volume cooled externally by a cryogen and any vacuum space in
contact with one `[LBNL-PUB3000-29]`.

**Reclosing relief valves** open at set pressure and reseat, which is what the boiloff
case wants because the system keeps running — typically 2 psi tolerance for settings
through 70 psi and 3 % above, reseating before pressure falls below 90 % of set
`[NASA-PROP-TEST-HANDBOOK]`. **Burst discs** are non-reclosing: more capacity for a
given size, no seat to leak, no set-point drift, but once open the system stays open.
The usual tank arrangement puts them **in parallel** — valve for boiloff, disc set
higher for the catastrophic case `[CHART-BULK]`. **In series** (disc upstream of the
valve) protects the seat from freezing or fouling, at the cost of a code de-rating —
a combination capacity factor of **0.90** unless a higher one is certified by test
`[ASME-BPVC-VIII]` — and adds a forgotten failure mode: a pinhole in the disc
pressurises the space between, so the disc no longer sees full differential and will
not burst at its rated pressure.

**The two sizing cases.** *Normal heat leak* is steady state — heat crosses the
insulation, boils liquid, and the relief passes that vapour within the accumulation
limit — and it sizes the small device. *Fire* is the accident case and sizes the large
one: CGA gives the form Q = G·A^0.82, where the exponent encodes the fact that a fire
does not engulf the whole surface, and where the much smaller *insulated* gas factor
may be used only if the insulation remains completely in place at 1200 °F
`[CGA-S-1-SERIES]`. If it burns off, you size as if bare. Cryogenics adds a third
named case: "failure of the vacuum space shall be considered for piping and vessels
containing cryogenic fluids insulated in this manner" `[JLAB-OVERPRESSURE]`, at the
fluxes above. Get the part number right — **CGA S-1.3** covers stationary storage
containers (10th ed., 2024), **S-1.2** portable containers (11th ed., 2024)
`[CGA-S-1-SERIES]` — and above them sits ASME BPVC VIII Div. 1, whose accumulation
limits are 10 % or 3 psi above MAWP normally and 21 % for fire `[ASME-BPVC-VIII]`.

**Vent routing** must not put discharge where people are: a device that could pull
room oxygen below 19.5 % should exhaust outside the building `[SLAC-CH36]`, while a
valve-cavity relief passing a few cubic centimetres needs no stack to the roof —
routing is proportionate to inventory. A relieving stack is also a nozzle, and must be
restrained against reaction force `[JLAB-OVERPRESSURE]`.

**Fuel and oxidiser vents are never combined.** A shared header is a mixing chamber:
it holds gas from one system until the other vents, accumulates hydrocarbon residue in
an oxygen line, and condenses cold vapour into deposits. Separate, physically
separated stacks for fuel, oxidiser and inert, far enough apart that two plumes cannot
meet at the discharge; hydrogen has its own standard, CGA G-5.5 `[CGA-OTHER]`.

**Icing** attacks the one component whose job is never to be blocked: cold gas leaving
a vent freezes atmospheric moisture at the outlet, and blocked or partially obstructed
vent lines are a principal cause of overpressure `[JLAB-OVERPRESSURE]`. Note the trap
— a flame arrestor added to a hydrogen vent for safety can ice up and restrict flow,
and MLI or a radiation baffle in a relief path can pass normal boiloff invisibly and
then choke exactly when full capacity is needed `[TRADE-EXPLANATORY]`.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
Relief devices are the layer that does not depend on the control system. If a finding
can be closed only by "the interlock will catch it", it is not closed.
</div>

---

## 5. Conditioning

**Filters and strainers** protect seats and orifices from debris and, cold, from
*frozen* contaminant — water, CO₂ and hydrocarbons that are harmless gases at ambient
are solid particles at 77 K. A cryogenic filter is therefore also a trap, and traps
plug; a plugged filter is a blockage that can isolate liquid on its downstream side.

**Phase separators** let two-phase flow disengage, venting gas and passing liquid on,
because heat leak in a transfer line inevitably makes vapour and downstream equipment
needs single-phase liquid. In review terms a separator is a vent source by design: its
discharge must go somewhere safe and it counts toward the room's ODH inventory.

**Vaporisers** — finned bundles gasifying liquid with ambient air — are how bulk
liquid becomes usable gas and how a pressure-building circuit works. Their dominant
issue is **icing**: as fins drop below the frost point, moisture deposits and
insulates the fin from the air it is meant to draw heat from, so capacity falls
through a run. Hence derating for continuous duty or duty-cycling in pairs, and a real
structural load from accumulated ice — frost growth, wind and seismic are co-equal
design cases. Ask what delivery pressure looks like at the end of a long run, and what
is underneath when the ice sheds.

---

## 6. Instrumentation

**Temperature.** How cold you need to go picks the sensor `[LAKESHORE-SENSORS]`.
**Silicon diodes** (DT-670) cover 1.4–500 K, grow *more* sensitive as they get colder,
follow a standard curve so units are interchangeable, and give about ±0.25 K from
1.4 K to 100 K — the default absent magnetic fields. **Platinum RTDs** are the
industrial standard and beautifully stable (±10 mK/year over 77–273 K), but below
about 30 K the resistance flattens and sensitivity collapses; catalogue guidance is
"suggested use only T ≥ 30 K", which covers LOX and LN₂ comfortably and liquid
hydrogen not at all. **Thermocouples** are cheap, rugged and everywhere in industrial
plant, but every standard pair's Seebeck coefficient falls toward zero as it cools —
Type E is the usual choice and even it is "useful when T > 10 K" — and the reference
junction becomes a dominant error source when the signal is a few µV/K.

**Pressure.** The sensing element is usually not rated for process temperature, so the
common arrangement is a standard transmitter behind a thermal standoff line. That line
fills with cryogen, heat leak boils it, and a column of cold vapour becomes the
measurement path: not a static head you can correct for, because gas density along the
tube varies with how much heat is leaking in; liable to oscillate, as liquid
periodically enters the warm section and flashes; and able to freeze solid. Hence
deliberately traced or purged sense lines `[NASA-PROP-TEST-HANDBOOK]`, and hence the
review questions — is the tap at the top of the line, or deliberately at the bottom
for a DP level measurement, and does an interlock depend on a transducer behind an
unmonitored sense line?

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
A moisture plug freezes in a pressure sense line. The transducer does not read zero and
does not read noise — it reads the last pressure it saw, steadily and plausibly, while
real tank pressure walks away from it. Instruments that fail obviously are a gift; this
one fails quietly.
</div>

**Flow.** Turbine meters work cold — to about −450 °F, at ±0.05 % of reading — but
only given their straight run (10D upstream, 5D downstream) and their filtration
`[NASA-PROP-TEST-HANDBOOK]`. Coriolis meters give mass and density directly; DP meters
inherit every sense-line problem twice over. The central problem is that **a cryogen
in a pipe sits close to its boiling point and every flow meter works by creating a
pressure drop** — the measurement tends to create the condition that invalidates it.
With vapour present, volumetric meters lose their meaning (the same volume carries far
less mass, and quality is unknown), turbine rotors over-speed while cavitation erodes
them, Coriolis tubes lose signal to damping even at low void fraction, and DP meters
lose the constant density their physics assumes. A cryogenic flow reading is valid only
if the fluid is single-phase *at the meter* — a claim needing a pressure and a
temperature against the saturation curve, not an assertion.

**Level** is harder than in water for six compounding reasons: the liquid is boiling,
so there is no quiet surface; density is low and varies along the saturation line; head
per metre is tiny; the vapour above is dense and variable; any tube dipping in boils
its own contents; and there is no sight glass on a vacuum-jacketed vessel. DP is the
bulk-tank standard but needs density, hence temperature and pressure; capacitance
probes need dielectric corrections for both; point sensors — typically a self-heated
resistor that cools sharply when wetted — are discrete but unambiguous, which is why
safety interlocks generally sit on them.

**Gas detection**, where placement is the whole lesson: *put the sensor where the gas
goes*, at the temperature it arrives at. An oxygen-deficiency hazard exists below
**19.5 % O₂** `[SLAC-CH36]` `[LBNL-PUB3000-29]`. Helium and hydrogen rise, so helium
monitors go at ceiling height `[SLAC-CH36]`; argon always sinks; nitrogen is the
interesting case, since warm N₂ is near air density but **cold nitrogen vapour is far
denser** — as every cryogenic vapour is at its own boiling point — so a release behaves
like a heavy gas first and a neutral one later. Breathing-zone height is the usual
compromise, with low-level sensing wherever there is a pit or trench, and readouts
*outside* the space so a room can be known unsafe without entering it. Combustible gas
detectors answer a different question and go **high**, above the leak source, alarming
on a fraction of the lower explosive limit (commonly 20 % and 40 % LEL) — a margin on
a mixture that is not yet flammable. The review question for any detector is what it
cannot see: infrared sensors cannot detect hydrogen at all, and a catalytic bead needs
oxygen to work, which is what a large inert release removes.

---

## 7. Reading a cryogenic P&ID

The tag scheme is ANSI/ISA-5.1 `[ISA-5.1]`: **letters plus a loop number**. The
**first letter is the measured variable** — P pressure, T temperature, F flow, L
level, A analysis, Z position. **Succeeding letters say what the device does with
it** — T transmit, I indicate, R record, C control, S switch *or* safety, V valve, E
sensing element, with H/L/D as high/low/differential modifiers. So `PT` is a pressure
transmitter, `FE` the flow element itself, `LSH` a level switch high, `PSV` a pressure
safety valve (P + safety modifier + valve), `PSE` conventionally the rupture disc, and
`AT` an analyser transmitter — on a cryogenic drawing, usually the oxygen or
combustible-gas monitor. Read the first letter as a noun and the rest as a verb phrase,
and remember `S` is ambiguous: *safety* in PSV, *switch* in LSH. The digits identify
the **loop, not the device** — `PT-101`, `PIC-101` and `PCV-101` belong to one loop —
and cryogenic drawings usually number loops by system (100-series LOX, 200-series fuel,
300-series pneumatics), so the number carries as much meaning as the letters.

<figure>
<svg viewBox="0 0 660 290" role="img" aria-label="Legend of P&amp;ID symbols: normally open and normally closed valves, check valve, manual, solenoid and pneumatic actuators, relief valve and burst disc, field and control-room instrument bubbles, and line types for liquid, gas, vacuum-jacketed pipe and electrical signal">
  <path d="M30 34 l0 24 l26 -24 l0 24 z" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="64" y="52" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">normally open</text>
  <path d="M200 34 l0 24 l26 -24 l0 24 z" fill="currentColor"/>
  <text x="234" y="52" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">normally closed</text>
  <path d="M400 34 l0 24 l26 -24 l0 24 z" fill="none" stroke="currentColor" stroke-width="2"/>
  <line x1="426" y1="30" x2="426" y2="62" stroke="currentColor" stroke-width="3"/>
  <text x="436" y="52" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">check valve</text>
  <line x1="43" y1="100" x2="43" y2="82" stroke="currentColor" stroke-width="2"/>
  <line x1="33" y1="82" x2="53" y2="82" stroke="currentColor" stroke-width="2"/>
  <path d="M30 100 l0 24 l26 -24 l0 24 z" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="64" y="118" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">manual</text>
  <line x1="213" y1="100" x2="213" y2="88" stroke="currentColor" stroke-width="2"/>
  <circle cx="213" cy="80" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="209" y="85" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">S</text>
  <path d="M200 100 l0 24 l26 -24 l0 24 z" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="234" y="118" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">solenoid</text>
  <line x1="413" y1="100" x2="413" y2="90" stroke="currentColor" stroke-width="2"/>
  <path d="M395 90 a18 14 0 0 1 36 0 z" fill="none" stroke="currentColor" stroke-width="2"/>
  <path d="M400 100 l0 24 l26 -24 l0 24 z" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="436" y="118" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">pneumatic, FC/FO noted</text>
  <path d="M30 168 l0 24 l26 -24 l0 24 z" fill="none" stroke="var(--warn)" stroke-width="2"/>
  <line x1="43" y1="168" x2="43" y2="146" stroke="var(--warn)" stroke-width="2"/>
  <path d="M37 152 l6 -8 l6 8" fill="none" stroke="var(--warn)" stroke-width="2"/>
  <text x="64" y="186" font-size="13" font-family="system-ui, sans-serif" fill="var(--warn)">PSV, set pressure labelled</text>
  <path d="M280 192 a16 16 0 0 1 32 0" fill="none" stroke="var(--warn)" stroke-width="2"/>
  <line x1="280" y1="192" x2="312" y2="192" stroke="var(--warn)" stroke-width="2"/>
  <text x="322" y="186" font-size="13" font-family="system-ui, sans-serif" fill="var(--warn)">PSE, burst disc</text>
  <circle cx="43" cy="240" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="43" y="238" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor">PT</text>
  <text x="43" y="252" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor">101</text>
  <text x="68" y="244" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">field</text>
  <circle cx="150" cy="240" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
  <line x1="132" y1="240" x2="168" y2="240" stroke="currentColor"/>
  <text x="150" y="236" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor">PIC</text>
  <text x="150" y="253" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor">101</text>
  <text x="175" y="244" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">control room</text>
  <line x1="300" y1="222" x2="360" y2="222" stroke="currentColor" stroke-width="3"/>
  <text x="368" y="226" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">liquid</text>
  <line x1="300" y1="242" x2="360" y2="242" stroke="currentColor" stroke-width="1"/>
  <text x="368" y="246" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">gas</text>
  <line x1="300" y1="260" x2="360" y2="260" stroke="currentColor" stroke-width="2"/>
  <line x1="300" y1="266" x2="360" y2="266" stroke="currentColor" stroke-width="2"/>
  <text x="368" y="268" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">vacuum-jacketed (VJ)</text>
  <line x1="300" y1="282" x2="360" y2="282" stroke="currentColor" stroke-dasharray="5 4"/>
  <text x="368" y="286" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">electrical signal</text>
</svg>
<figcaption>Figure 3.3 — The minimum symbology needed to read a cryogenic schematic. Filled means normally closed; the actuator sits on top; every relief carries its set pressure and must discharge somewhere the drawing shows.</figcaption>
</figure>

Layout conventions matter too. Flow runs **left to right**, source to use point. **One
fluid, one horizontal band** — LOX on one level, fuel on another, inert on a third —
which is itself a safety measure, because it makes an accidental interconnection
visually obvious. VJ line is drawn as a double line or annotated `VJ`, with its
pump-out and annulus relief shown. **Every relief is drawn**, including the small ones,
so a cryogenic P&ID carries far more PSV and PSE bubbles than an ambient drawing, and
trapped-volume reliefs between valve pairs are a visual signature of the genre. Vent
headers are shown *terminating*, with fuel, oxidiser and inert terminating separately.
Bayonets and flex hoses are called out, because they are flexibility elements and
maintenance break points. And line classes carry design temperature, which is how
"austenitic stainless, no carbon steel" gets enforced from the drawing.

<figure>
<svg viewBox="0 0 660 320" role="img" aria-label="Annotated cryogenic schematic fragment: a vacuum-jacketed LOX run tank with pressure, temperature and level transmitters, a relief valve and burst disc venting to a dedicated LOX vent stack, a vacuum-jacketed outlet line through two block valves with a trapped-volume relief between them, a flow transmitter, and an oxygen-deficiency analyser">
  <rect x="60" y="150" width="120" height="120" rx="6" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <rect x="53" y="143" width="134" height="134" rx="8" fill="none" stroke="var(--oxy)" stroke-width="1"/>
  <text x="120" y="200" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="var(--oxy)">LOX</text>
  <text x="120" y="218" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="var(--oxy)">run tank</text>
  <text x="120" y="236" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="var(--oxy)">TK-101</text>
  <circle cx="30" cy="140" r="17" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="30" y="145" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor">PT</text>
  <line x1="30" y1="157" x2="30" y2="175" stroke="currentColor"/>
  <line x1="30" y1="175" x2="60" y2="175" stroke="currentColor"/>
  <circle cx="30" cy="230" r="17" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="30" y="235" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor">LT</text>
  <line x1="47" y1="230" x2="60" y2="230" stroke="currentColor"/>
  <circle cx="30" cy="290" r="17" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="30" y="295" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor">TT</text>
  <line x1="47" y1="285" x2="70" y2="272" stroke="currentColor"/>
  <line x1="100" y1="150" x2="100" y2="90" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="150" y1="150" x2="150" y2="90" stroke="var(--oxy)" stroke-width="2"/>
  <path d="M88 78 l0 20 l24 -20 l0 20 z" fill="none" stroke="var(--warn)" stroke-width="2"/>
  <line x1="100" y1="78" x2="100" y2="56" stroke="var(--warn)" stroke-width="2"/>
  <path d="M134 90 a16 16 0 0 1 32 0" fill="none" stroke="var(--warn)" stroke-width="2"/>
  <line x1="134" y1="90" x2="166" y2="90" stroke="var(--warn)" stroke-width="2"/>
  <line x1="150" y1="74" x2="150" y2="56" stroke="var(--warn)" stroke-width="2"/>
  <line x1="90" y1="56" x2="330" y2="56" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="330" y1="56" x2="330" y2="26" stroke="var(--oxy)" stroke-width="2"/>
  <text x="340" y="30" font-size="13" font-family="system-ui, sans-serif" fill="var(--oxy)">to LOX vent stack — dedicated,</text>
  <text x="340" y="48" font-size="13" font-family="system-ui, sans-serif" fill="var(--oxy)">never shared with fuel</text>
  <text x="60" y="112" font-size="13" font-family="system-ui, sans-serif" fill="var(--warn)">PSV-102</text>
  <text x="176" y="112" font-size="13" font-family="system-ui, sans-serif" fill="var(--warn)">PSE-103</text>
  <line x1="187" y1="228" x2="600" y2="228" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="187" y1="236" x2="600" y2="236" stroke="var(--oxy)" stroke-width="2"/>
  <text x="230" y="262" font-size="13" font-family="system-ui, sans-serif" fill="var(--oxy)">VJ line (double)</text>
  <path d="M300 220 l0 24 l26 -24 l0 24 z" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="292" y="212" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">HV-104</text>
  <path d="M430 220 l0 24 l26 -24 l0 24 z" fill="none" stroke="currentColor" stroke-width="2"/>
  <line x1="443" y1="220" x2="443" y2="210" stroke="currentColor" stroke-width="2"/>
  <path d="M425 210 a18 14 0 0 1 36 0 z" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="416" y="188" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">FCV-106 (FC)</text>
  <path d="M366 268 l0 -24 l26 24 l0 -24 z" fill="none" stroke="var(--warn)" stroke-width="2"/>
  <line x1="379" y1="236" x2="379" y2="244" stroke="var(--warn)" stroke-width="2"/>
  <text x="330" y="296" font-size="13" font-family="system-ui, sans-serif" fill="var(--warn)">PSV-105 — trapped volume</text>
  <circle cx="530" cy="196" r="17" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="530" y="201" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor">FT</text>
  <line x1="530" y1="213" x2="530" y2="228" stroke="currentColor" stroke-dasharray="4 3"/>
  <text x="606" y="226" font-size="13" font-family="system-ui, sans-serif" fill="var(--oxy)">engine</text>
  <circle cx="600" cy="290" r="17" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="600" y="295" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor">AT</text>
  <text x="470" y="295" font-size="13" font-family="system-ui, sans-serif" fill="currentColor">AT-107, O₂ monitor</text>
</svg>
<figcaption>Figure 3.4 — A fragment to practise on. Loop numbers are 100-series, so this is the oxidiser system. Work the checklist below across it and see what you can and cannot answer from the drawing alone.</figcaption>
</figure>

### How to read a cryogenic schematic

1. **Close every valve mentally.** List every volume now isolated. Does each have a
   relief?
2. **Find every relief and trace its discharge.** Where does it end up? Do fuel and
   oxidiser reliefs share anything?
3. **Check every vented ball valve's orientation** against the direction it must hold
   pressure — not always the normal flow direction.
4. **Read every fail position.** On loss of air and loss of power, what state does the
   whole system go to, and is that state safe?
5. **Find the vacuum-jacketed sections** and confirm each has an annulus relief and an
   accessible pump-out port.
6. **Check every instrument's sense line** for freeze or plug, and for whether an
   interlock depends on it.
7. **Check that every flow measurement can be shown to be single-phase at the meter.**
8. **Locate the gas detection** and ask what release scenario each detector covers.

---

## Checkpoint quiz

1. A colleague calls an open-neck laboratory dewar and a portable liquid cylinder
   "both just dewars". Give the most important difference, and one failure mode that
   follows from it.

2. A vacuum-jacketed LN₂ line has healthy MLI in its annulus, and the pump-out port
   plug is found on the floor beneath it. What does that most likely mean, and by
   roughly what factor could the heat input have changed?

3. Why does a cryogenic valve have a bonnet extension several times longer than its
   warm-service equivalent, and what does that impose on how it may be *installed*?

4. A relief valve is protected by a rupture disc at its inlet. Name one advantage, one
   code penalty, and one failure mode specific to the arrangement.

5. **Schematic reading.** In Figure 3.4, PSV-105 sits between HV-104 and FCV-106.
   (a) What is it for? (b) FCV-106 is annotated FC — is that right for this valve's
   function, and why? (c) Name two things the drawing does *not* let you verify.

<details>
<summary>Show answers</summary>

1. **The liquid cylinder is a pressure vessel; the open-neck dewar is not.** The dewar
   is vented by construction, closed only by a loose plug that lets boiloff out while
   keeping air and its water and CO₂ from diffusing down the neck; the cylinder is an
   ASME vessel with a pressure-building circuit, an economiser and relief devices,
   running at roughly 22 psig for liquid use or 230–350 psig for gas use
   `[LBNL-PUB3000-29]`. The failure mode: anything that seals the dewar — a tight cap,
   an ice plug in the neck — turns a non-pressure-vessel into a sealed volume of
   warming cryogen, at pressures "in excess of 10,000 psig" `[LBNL-PUB3000-29]`.
   Treating the cylinder as an open dewar is the mirror-image error.

2. **It suggests the annulus has pressurised — most likely an inner-line leak**
   `[AIGA-106]`. The plug seats in the combined pump-out and annulus-relief port and
   blows out when the annulus is no longer a vacuum. Heat flux then moves from about
   0.6 W/m² for healthy MLI `[NASA-FESMIRE-KSC]` to the loss-of-vacuum design range,
   1–7 kW/m² insulated or 25–40 kW/m² bare `[JLAB-OVERPRESSURE]` — three to four orders
   of magnitude. "The MLI is still there" is no defence: MLI performs only below about
   10⁻³ torr `[NASA-MLI-JOHNSON]`.

3. **To keep the stem packing warm.** Cold polymers are brittle rings that shrink away
   from the stem rather than seal, and the gland ices externally and freezes the stem.
   The extension puts a static vapour column between the cold body and the packing so
   the packing and operating mechanism stay in their normal temperature range
   `[MSS-SP-134]`. The installation consequence is **orientation**: the column insulates
   only while it can stratify, so the valve goes stem-vertical or within a limited angle
   of it. Mounted on its side or inverted, liquid enters the extension and freezes the
   packing — the exact failure the extension was bought to prevent.

4. **Advantage:** the disc isolates the valve seat from the process, so it cannot be
   fouled, frozen or corroded shut, and leakage past the seat goes to zero. **Code
   penalty:** the valve capacity must be de-rated by a combination capacity factor of
   0.90 unless a higher factor is certified by test for that pairing
   `[ASME-BPVC-VIII]`. **Failure mode:** a pinhole in the disc pressurises the space
   between disc and valve, so the disc no longer sees full differential and will not
   burst at its rated pressure — which is why that space is monitored. This is the
   *series* arrangement; the parallel one (valve for boiloff, disc set higher for the
   accident case) is the usual tank configuration and carries no de-rating
   `[CHART-BULK]`.

5. (a) **A trapped-volume relief.** With HV-104 and FCV-106 both closed, the pipe
   between them is an isolated volume that can hold liquid oxygen; heat leak boils it
   and, with no relief, the line or a valve body fails. Every isolatable portion needs
   its own uninterruptible relief `[SLAC-CH36]` `[LBNL-PUB3000-29]`, so nothing between
   those valves would be a finding. (b) **Yes** — FCV-106 is a propellant flow-control
   valve feeding the engine, so on loss of instrument air or signal you want the
   oxidiser supply cut off rather than continuing to feed a system nobody is commanding;
   fail-*open* is right for the opposite function, vent and relief paths, because loss
   of control must never leave a cryogenic volume bottled up. (c) Any two of: whether
   PSV-102 and PSE-103 are sized for the fire and loss-of-vacuum cases rather than
   boiloff alone; where the LOX vent stack discharges relative to people, air intakes
   and the fuel stack; whether the VJ run has an annulus relief and an accessible
   pump-out port; whether the fluid is single-phase at the flow element; whether
   PT-101's sense line is traced or purged against a freeze plug; and whether AT-107
   sits where cold, dense oxygen-rich vapour would reach it. The drawing shows topology,
   not sizing, elevation or mounting height.

</details>
