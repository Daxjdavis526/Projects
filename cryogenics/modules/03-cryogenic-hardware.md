# Module 03 — Cryogenic Hardware

*Roughly 25 minutes. Prerequisite: Module 02.*

A cryogenic component looks like its room-temperature cousin and is not one. A ball
valve is still a ball valve, but the cold version has a stem half a metre long, a hole
drilled through the ball, and a flow arrow that matters. Read the system as if it were
compressed air and you miss the few features holding the hazard down.

## What you'll be able to do

- Tell the four kinds of "tank" apart, and say which is not a pressure vessel.
- Explain what the vacuum annulus does, and what losing it does to heat leak.
- Say why a cryogenic valve has an extended bonnet and why some balls are drilled.
- Find every isolatable volume on a schematic and ask whether it is relieved.
- Read ISA tags, valve and relief symbols and line types off a cryogenic P&ID.

---

## 1. Storage

Four different vessels get called "a tank", and each has a different relief basis.

- **Open-neck dewar.** Closed by a *loose plug* that lets boiloff out while keeping
  back air, whose water and CO₂ freeze in the neck. It is **not a pressure vessel** —
  vented by construction, good for "at maximum several days" `[LBNL-PUB3000-29]`.
  Sealing it, or icing the neck shut, leaves a sealed vessel with no relief.
- **Pressurised liquid cylinder.** A vacuum-jacketed ASME vessel with a
  pressure-building circuit, economiser, liquid leg and relief stack — about 22 psig for
  liquid use, 230–350 psig for gas `[LBNL-PUB3000-29]`. Not a static store but an
  **active, self-pressurising machine**, closer to a small boiler than to a K-bottle.
- **Bulk tank.** Foundation-mounted, external vaporiser, full relief system; typical
  MAWP 250 psig, with "dual relief valves and rupture disks ... as standard"
  `[CHART-BULK]`.
- **Run tank.** What the engine draws from. Storage tanks are optimised for *hold time*,
  run tanks for *discharge*, and may be barely insulated because they are cold for
  hours. The design case is a transient, and so are the failure modes: ullage collapse,
  stratification, geysering in tall feed legs.

**The annulus.** The inner vessel holds the cryogen, the jacket holds one atmosphere
out, and the evacuated gap kills gas conduction. What is left is radiation across the
gap and conduction through the supports — so you add radiation shields and make the
supports long, thin and low-conductivity, which fights the structure. The vacuum is a
consumable, degrading by outgassing and leakage: hence sieve and getter in the annulus,
and a pump-out port `[AIGA-106]`.

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

**MLI** alternates a low-emissivity shield with a low-conductivity spacer. Radiation
falls with the number of floating shields while conduction rises with spacer thickness,
so there is an optimum layer *density*, not an optimum count `[NASA-MLI-JOHNSON]`. It
performs only below about 10⁻³ torr — hence **evacuated perlite** on large tanks, poured
rather than laid and happy at 1–10 millitorr `[NASA-KOGAN-MLI]`, and **foam** where no
vacuum is practical, which degrades as moisture drives in, freezes and cracks it.
Compression is MLI's quiet killer: against a baseline near **0.6 W/m²**, 0.7 kPa
(0.1 psi) of load gives a **15× rise in heat flux** `[NASA-FESMIRE-KSC]`.

**Loss of vacuum** sizes reliefs. Design fluxes for a failed insulating vacuum are
**25–40 kW/m² bare and 1–7 kW/m² insulated** `[JLAB-OVERPRESSURE]` against a healthy
~0.6 W/m² — a ratio near **10⁴**. The mechanism is not convection: air entering a cold
annulus **condenses and freezes on the inner vessel**, and the latent heat delivers the
flux. That same ice can obstruct the reliefs you are relying on `[SLAC-CH36]`.

<div class="box remember"><span class="lbl">Remember this</span>
A vacuum jacket is not an efficiency measure. It is what stands between 0.6 W/m² and
25–40 kW/m². Every vacuum-jacketed volume needs two relief answers: normal boiloff, and
the day the annulus goes to atmosphere.
</div>

**Boiloff** is quoted as NER, percent of contents lost per day standing idle. Vertical
bulk tanks run **0.35 down to 0.10 %/day in oxygen**, **0.56 down to 0.16 % in
nitrogen** `[CHART-BULK]` — bigger is better by surface-to-volume, and nitrogen is worse
because its latent heat per unit volume is lower. A 10-litre LN₂ dewar losing
8.8 litres/day holds **1.1 days** `[TRADE-EXPLANATORY]`: small dewars are continuous gas
sources, which is what drives a room's oxygen-deficiency analysis.

**Pressure build.** A liquid cylinder needs no external pressurant. Liquid is drawn off
the bottom, gasified in a **pressure-building coil** warmed by ambient air and returned
to the ullage, a **PB regulator** opening that loop below its set point; an
**economiser** set higher takes withdrawal from the *ullage* instead when heat leak
walks pressure up `[TRADE-EXPLANATORY]`. So the tank never stops making pressure;
delivery pressure sags if you outrun the coil, whose capacity falls as it ices; and with
the economiser open you are drawing **gas, not liquid**.

<div class="box"><span class="lbl">Worth knowing</span>
Frost is diagnostic. Permanent or growing ice on a vacuum-jacketed surface means the
vacuum is failing — "if ice does form on the outside of the dewar, it indicates that the
dewar may have lost vacuum" `[LBNL-PUB3000-29]`.
</div>

---

## 2. Piping and joints

**Bare line** suits only short runs nobody can touch; on LOX service it condenses liquid
air, which is oxygen-enriched as it drips. **Foam** is cheap and field-repairable at
5–20 W/m² and degrades by the moisture ratchet above. **Vacuum-jacketed (VJ) line** is
pipe within pipe at 0.5–2.0 W/m² `[CHART-VIP]`, the default for anything long or
anything that must arrive single-phase. VJ brings two obligations:

- **Expansion provisions.** The inner pipe goes to 77 K while the jacket stays near
  ambient, and austenitic stainless contracts roughly 0.3 % over that range (take the
  exact coefficient from `[NIST-CRYO-MATERIALS]`), so a 30 m run moves about 90 mm
  relative to its jacket. AIGA requires a flexibility analysis covering bellows and the
  fixed and sliding supports, with bellows rated for at least **1000 cycles**
  `[AIGA-106]` — a stand chilling down twice a day eats that in two years.
- **An annulus relief.** The annulus is a sealed volume beside a cryogen: an inner leak
  fills it with boiling liquid and bursts a jacket built to hold out one atmosphere. It
  usually sits in the pump-out port, which gives a diagnostic — a **missing pump-out
  plug** may mean a leak blew it out `[AIGA-106]`.

**Bayonet joints** connect VJ lines with concentric halves that slide together, sealing
at the *warm* end, a **static column of vapour** in the gap doing the insulating while
the sliding fit absorbs contraction `[TRADE-EXPLANATORY]`. Icing at a bayonet means that
column has been defeated; in LOX service, oxygen leaking into the gap can enrich
hydrocarbons on the metal until ignition `[AIGA-106]`.

**Bellows** take up contraction and misalignment, and fail characteristically by
**squirm** — above a stability limit the convolutions buckle sideways. A squirmed
bellows cannot be reset; it is scrapped, and left in service it fatigues fast. EJMA
requires a **safety factor of 3 against squirm** `[EJMA]`. They also fail by fatigue, by
flow-induced vibration, and by being anchored or guided wrongly.

Cold, the joint ranking is **welded > brazed > mechanical**, because every mechanical
joint depends on a contact stress that cooling changes — and cycling is worse than
steady cold, because it ratchets. Where a joint must come apart, the metal gasket face
seal is preferred, sealing by plastic deformation rather than by an elastomer that can
relax `[SWAGELOK-VCR]`; NASA leak-tested such fittings to 20 K rather than trusting the
catalogue `[NASA-VCR-FITTINGS]`. Most elastomers pass their glass transition well above
cryogenic temperature and stop sealing `[PARKER-ORD-5712]` — hence the trick of keeping
the elastomer warm, which is the logic of both the bayonet and the extended bonnet.

---

## 3. Valves

**Ball** valves are the quarter-turn isolation default — full bore, fast, and cursed
with a body cavity. **Globe** valves throttle well at the price of pressure drop and a
large wetted body. **Gate** valves are rarer cold, because guide clearances and large
seat areas sit badly with differential contraction. **Needle** valves meter instrument
and purge flows. All four differ from warm valves in the same ways: materials that stay
ductile cold (austenitic stainless, never carbon steel), clearances opened so
contraction cannot seize them, cold-ductile seat polymers, and an extended bonnet.

**Why the stem is that long.** The stem passes through polymeric packing, and at 77 K
polymers are not seals but brittle rings that shrink away from the stem, while the gland
ices up and freezes it in place. So the bonnet is lengthened until the packing is far
enough from the cold body to stay warm, with a **static column of cryogen vapour**
between as the insulator — "long enough to provide an insulating gas column that
prevents the packing area and operating mechanism from freezing" `[MSS-SP-134]`. Inside
it two pressures compete: clearance is kept small to **minimise convection**, and wall
thickness small to cut conduction. Hence **orientation matters** — the column insulates
only while it can stratify, so the valve goes stem-vertical, and one mounted far off
vertical lets liquid in and freezes the packing.

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

**Check valves** stop reverse flow but are not isolation valves: tight tolerances mean
contamination causes sticking and leakage, and check-valve leakage is a named cause of
overpressure `[NASA-PROP-TEST-HANDBOOK]` `[JLAB-OVERPRESSURE]`.

**Actuation** is manual, solenoid, or — for anything large — pneumatic piloted by a small
solenoid `[NASA-PROP-TEST-HANDBOOK]`. **Fail-safe position** asks which state is least
dangerous when air, power or signal disappears, and it is decided per valve. Propellant
isolation and pressurisation valves fail **closed**: stop adding propellant, stop adding
pressure. Vent and relief paths fail **open**, because loss of control must not leave a
cryogenic volume bottled up — that reversal is the point. Fuel and oxidiser logic is
identical, but the consequences are not symmetric — a failed-open oxidiser path creates
an ignition environment, a fuel path a flammable cloud — and no single failure may open
both into a common volume.

**Trapped volume.** When a ball valve closes, fluid is sealed in the **body cavity**,
connected to neither line, and it warms. Confined cryogen warming to ambient generates
pressure "in excess of 10,000 psig" `[LBNL-PUB3000-29]`, driven by an expansion ratio
near **696:1 for nitrogen** `[AP-SG-27]`; the body fails as a fragmentation event. The
fix is a **relief hole** through one wall of the ball, capping cavity pressure at line
pressure — and it faces **upstream**, because venting downstream would push the ball off
its seat and open a permanent leak path `[TRADE-EXPLANATORY]`. So a vented ball valve is
**unidirectional**, and its arrow must match the direction in which it must *hold
pressure*, which during a drain may not be the normal flow direction.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
Two block valves in a line with nothing between them. Close both and the pipe between is
a sealed volume of liquid with no relief on it. The first indication is the pipe or a
valve body letting go. Module 05 is largely about this finding.
</div>

---

## 4. Relief and venting

**The philosophy in one sentence:** every volume that can hold cryogen and can be
isolated needs its own relief path that cannot itself be isolated, sized for the worst
credible heat input. SLAC: "Each and every portion of the cryogenic system must have
uninterruptible pressure relief" `[SLAC-CH36]`, extended by LBNL to any vacuum space in
contact with a cryogen `[LBNL-PUB3000-29]`.

- **Reclosing relief valves** open and reseat, which the boiloff case wants because the
  system keeps running — typically 2 psi tolerance through 70 psi and 3 % above,
  reseating before 90 % of set `[NASA-PROP-TEST-HANDBOOK]`.
- **Burst discs** are non-reclosing: more capacity per size, no seat to leak, no
  set-point drift, but once open the system stays open.
- **In parallel** is the usual tank arrangement — valve for boiloff, disc set higher for
  the catastrophic case `[CHART-BULK]`. **In series**, a disc upstream of the valve
  protects the seat from freezing or fouling, at the cost of de-rating capacity by a
  factor of **0.90** `[ASME-BPVC-VIII]`, and if the disc pinholes the space between
  pressurises and it will not burst at its rated pressure.

**The two sizing cases.** *Normal heat leak* is steady state and sizes the small device.
*Fire* is the accident case and sizes the large one: CGA gives Q = G·A^0.82, whose
exponent encodes that a fire does not engulf the whole surface, and whose much smaller
*insulated* factor may be used only if the insulation stays in place at 1200 °F
`[CGA-S-1-SERIES]`. Cryogenics adds a third case — "failure of the vacuum space shall be
considered for piping and vessels containing cryogenic fluids insulated in this manner"
`[JLAB-OVERPRESSURE]`, at the fluxes above. Get the part number right: **CGA S-1.3** is
stationary containers, **S-1.2** portable ones `[CGA-S-1-SERIES]`; above them ASME BPVC
VIII allows accumulation of 10 % or 3 psi above MAWP, 21 % for fire `[ASME-BPVC-VIII]`.

**Venting.** Discharge must not go where people are: anything that could pull room
oxygen below 19.5 % exhausts outside the building `[SLAC-CH36]`, while a valve-cavity
relief passing a few cubic centimetres needs no stack. A relieving stack is a nozzle,
and must be restrained `[JLAB-OVERPRESSURE]`. **Fuel and oxidiser vents are never
combined:** a shared header is a mixing chamber that holds gas from one system until the
other vents, and collects hydrocarbon residue in an oxygen line. **Icing** attacks the
one component that must never block — blocked vent lines are a principal cause of
overpressure `[JLAB-OVERPRESSURE]`, and a flame arrestor added to a hydrogen vent for
safety can itself ice up.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
Relief devices are the layer that does not depend on the control system. If a finding can
be closed only by "the interlock will catch it", it is not closed.
</div>

---

## 5. Conditioning

- **Filters and strainers** stop debris and, cold, *frozen* contaminant: water, CO₂ and
  hydrocarbons that are harmless gases at ambient are solid particles at 77 K. A
  cryogenic filter is therefore a trap, and traps plug, isolating liquid downstream.
- **Phase separators** let two-phase flow disengage, venting gas and passing liquid on,
  because heat leak makes vapour and downstream equipment needs liquid. A separator is a
  vent source by design, and counts toward the room's ODH inventory.
- **Vaporisers** — finned bundles gasifying liquid with ambient air — turn bulk liquid
  into usable gas and drive pressure-building circuits. Their issue is **icing**: frost
  insulates the fin from the air it must draw heat from, so capacity falls through a run.
  Hence derating or duty-cycling in pairs, and a real structural load from the ice.

---

## 6. Instrumentation

**Temperature.** How cold you need to go picks the sensor `[LAKESHORE-SENSORS]`.
**Silicon diodes** cover 1.4–500 K, grow *more* sensitive as they get colder, and give
about ±0.25 K to 100 K. **Platinum RTDs** are stable to ±10 mK/year over 77–273 K, but
below about 30 K the resistance flattens and sensitivity collapses — fine for LOX and
LN₂, useless for liquid hydrogen. **Thermocouples** are cheap and rugged, but every
standard pair's sensitivity falls toward zero as it cools (Type E is "useful when
T > 10 K"), and the reference junction dominates the error at a few µV/K.

**Pressure.** The sensing element is rarely rated for process temperature, so the usual
arrangement is a transmitter behind a standoff line. That line fills with cryogen, heat
leak boils it, and a column of cold vapour becomes the measurement path: not a static
head you can correct for, since its density varies with the heat leaking in; liable to
oscillate as liquid enters the warm section and flashes; and able to freeze solid. Hence
traced or purged sense lines `[NASA-PROP-TEST-HANDBOOK]` — and hence the question of
whether an interlock depends on one.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
A moisture plug freezes in a sense line. The transducer does not read zero and does not
read noise — it reads the last pressure it saw, steadily and plausibly, while real tank
pressure walks away from it. This one fails quietly.
</div>

**Flow.** Turbine meters work cold — to about −450 °F at ±0.05 % of reading — given their
straight run and filtration `[NASA-PROP-TEST-HANDBOOK]`; Coriolis meters give mass and
density directly; DP meters inherit every sense-line problem twice. The central problem
is that **a cryogen sits close to its boiling point and every meter works by creating a
pressure drop**, so the measurement creates the condition that invalidates it. With
vapour present, volumetric meters lose their meaning, turbine rotors over-speed while
cavitation erodes them, Coriolis tubes lose signal to damping, and DP meters lose the
constant density they assume. A flow reading is valid only if the fluid is single-phase
*at the meter* — which needs a pressure and a temperature against the saturation curve.

**Level** is harder than in water: the liquid is boiling, so there is no quiet surface;
density is low and varies along the saturation line; head per metre is tiny; and there
is no sight glass on a jacketed vessel. DP is the bulk-tank standard but needs density,
hence temperature and pressure; capacitance probes need dielectric corrections; point
sensors — a self-heated resistor that cools sharply when wetted — are discrete but
unambiguous, which is why interlocks sit on them.

**Gas detection.** Placement is the whole lesson: *put the sensor where the gas goes*, at
the temperature it arrives at. An oxygen-deficiency hazard exists below **19.5 % O₂**
`[SLAC-CH36]`. Helium and hydrogen rise, so helium monitors go at ceiling height; argon
sinks; nitrogen is the interesting case, because **cold nitrogen vapour is far denser
than air** — as every cryogenic vapour is at its boiling point — so a release acts heavy
first and neutral later. Breathing-zone height is the compromise, with low-level sensing
over pits and trenches, and readouts *outside* the space. Combustible detectors go
**high**, above the leak source, alarming at 20 % and 40 % LEL — a margin on a mixture
that is not yet flammable. Always ask what a detector cannot see: infrared cannot detect
hydrogen, and a catalytic bead needs the oxygen a large inert release removes.

---

## 7. Reading a cryogenic P&ID

The tag scheme is ANSI/ISA-5.1 `[ISA-5.1]`: **letters plus a loop number**. The **first
letter is the measured variable** — P pressure, T temperature, F flow, L level, A
analysis, Z position — and **succeeding letters say what the device does with it**: T
transmit, I indicate, R record, C control, S switch *or* safety, V valve, E element, with
H/L/D as high/low/differential modifiers. So `PT` is a pressure transmitter, `FE` the
flow element, `LSH` a level switch high, `PSV` a pressure safety valve, `PSE`
conventionally the rupture disc, and `AT` an analyser — usually the gas monitor. Read the
first letter as a noun and the rest as a verb phrase, and remember `S` is ambiguous:
*safety* in PSV, *switch* in LSH. The digits identify the **loop, not the device**, and
loops are numbered by system: 100-series LOX, 200-series fuel, 300-series pneumatics.

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

Flow runs **left to right**, source to use point, and **one fluid gets one horizontal
band** — which is itself a safety measure, because it makes an accidental
interconnection visually obvious. VJ line is drawn as a double line or annotated `VJ`,
with its pump-out and annulus relief shown. **Every relief is drawn**, including the
small ones, so a cryogenic P&ID carries far more PSV and PSE bubbles than an ambient
drawing, and trapped-volume reliefs between valve pairs are the visual signature of the
genre. Vent headers are shown *terminating*, fuel, oxidiser and inert separately;
bayonets and flex hoses are called out; and line classes carry design temperature, which
is how "austenitic stainless, no carbon steel" gets enforced from the drawing.

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
2. **Find every relief and trace its discharge.** Do fuel and oxidiser reliefs share
   anything?
3. **Check every vented ball valve's orientation** against the direction it must hold
   pressure.
4. **Read every fail position.** On loss of air and of power, what state does the system
   go to, and is it safe?
5. **Find the vacuum-jacketed sections** and confirm each has an annulus relief and an
   accessible pump-out port.
6. **Check every instrument's sense line** for freeze or plug, and for interlocks
   depending on it.
7. **Check that every flow measurement can be shown to be single-phase at the meter.**
8. **Locate the gas detection** and ask what release scenario each detector covers.

---

## Checkpoint quiz

1. A colleague calls an open-neck dewar and a portable liquid cylinder "both just dewars".
   Give the most important difference, and one failure mode that follows.

2. A vacuum-jacketed LN₂ line has healthy MLI in its annulus, and its pump-out plug is
   found on the floor beneath it. What does that mean, and by roughly what factor could
   the heat input have changed?

3. Why is a cryogenic valve's bonnet extension so long, and what does that impose on how
   the valve may be *installed*?

4. A relief valve is protected by a rupture disc at its inlet. Name one advantage, one
   code penalty, and one failure mode specific to the arrangement.

5. **Schematic reading.** In Figure 3.4, PSV-105 sits between HV-104 and FCV-106. (a) What
   is it for? (b) FCV-106 is annotated FC — is that right for this valve's function, and
   why? (c) Name two things the drawing does *not* let you verify.

<details>
<summary>Show answers</summary>

1. **The cylinder is a pressure vessel; the dewar is not.** The dewar is vented by
   construction, closed by a loose plug; the cylinder is an ASME vessel with a
   pressure-building circuit, economiser and reliefs `[LBNL-PUB3000-29]`. So anything that
   seals the dewar — a tight cap, an ice plug — leaves a sealed volume of warming cryogen,
   at pressures "in excess of 10,000 psig" `[LBNL-PUB3000-29]`.

2. **The annulus has pressurised — most likely an inner-line leak** `[AIGA-106]`: the plug
   sits in the combined pump-out and relief port and blows out when the annulus is no
   longer a vacuum. Flux moves from about 0.6 W/m² `[NASA-FESMIRE-KSC]` to 1–7 kW/m²
   insulated or 25–40 kW/m² bare `[JLAB-OVERPRESSURE]` — three to four orders of
   magnitude. Intact MLI is no defence; it performs only below ~10⁻³ torr
   `[NASA-MLI-JOHNSON]`.

3. **To keep the stem packing warm**, since cold polymers are brittle rings that shrink
   away from the stem instead of sealing; the extension holds a static vapour column
   between cold body and packing `[MSS-SP-134]`. Hence **orientation**: the column
   insulates only while it can stratify, so the valve is installed stem-vertical. On its
   side, liquid enters the extension and freezes the packing — the exact failure it was
   bought to prevent.

4. **Advantage:** the disc isolates the valve seat from the process, so it cannot be
   fouled, frozen or corroded shut. **Code penalty:** capacity is de-rated by a
   combination factor of 0.90 unless a higher one is certified by test
   `[ASME-BPVC-VIII]`. **Failure mode:** a pinhole in the disc pressurises the space
   between, so the disc no longer sees full differential and will not burst at its rated
   pressure.

5. (a) **A trapped-volume relief:** with both valves closed the pipe between holds
   isolated liquid oxygen, which heat leak boils until something fails — every isolatable
   portion needs its own uninterruptible relief `[SLAC-CH36]`, so nothing there would be a
   finding. (b) **Yes.** FCV-106 feeds the engine, so on loss of air or signal you want
   the oxidiser cut off, not fed to a system nobody is commanding; fail-*open* belongs to
   vent and relief paths instead. (c) Any two of: whether PSV-102 and PSE-103 are sized
   for fire and loss of vacuum rather than boiloff alone; where the vent stack discharges
   relative to people and the fuel stack; whether the VJ run has an annulus relief and an
   accessible pump-out port; whether the fluid is single-phase at the flow element; and
   whether PT-101's sense line can freeze. The drawing shows topology, not sizing,
   elevation or mounting height.

</details>
