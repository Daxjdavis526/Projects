# Final exam

*Practice section. Allow about 90 minutes. Prerequisite: Modules 01–08, the
practical engineering section and the safety-committee questions.*

Thirty questions across four sections. Every one of them is answerable from this
course; none of them is answerable by recalling a single number without knowing
what the number is for. Where a question has an honest answer of *"it depends on
the facility"*, say so and say what it depends on — that is a correct answer here,
not a dodge.

The answer key is in [`final-exam-key.md`](final-exam-key.md). **Work the whole
paper before you open it.** Nothing in this file, including the figures and their
captions, contains an answer.

## Marking and weighting

| Section | Questions | Marks each | Section total | Weight |
|---|---|---|---|---|
| **A — Multiple choice** | 15 | 2 | 30 | 30 % |
| **B — Short answer** | 5 | 4 | 20 | 20 % |
| **C — Scenario and hazard analysis** | 5 | 6 | 30 | 30 % |
| **D — Schematic and component** | 5 | 4 | 20 | 20 % |
| | **30** | | **100** | **100 %** |

In Sections B, C and D a bare conclusion earns roughly a third of the marks. The
rest is in the mechanism: *why* that is the hazard, *what* would confirm it, and
*which* facts are facility-specific.

## Grading scale

| Score | What it means |
|---|---|
| **90–100** | Strong foundational understanding. |
| **80–89** | Good. Some review needed on the topics you dropped marks in. |
| **70–79** | Significant gaps. Re-read the modules those questions came from before moving on. |
| **Below 70** | Restudy the course before progressing. |

## What this exam is, and is not

This is a **self-assessment of understanding**. It is not a qualification, a
certification, or permission to operate anything. A perfect score means you can
recognise hazards, diagnose symptoms and judge what deserves review on a drawing —
which is exactly what this course set out to teach, and exactly as far as it goes.
Competence with LOX, liquid methane or any other cryogen comes from trained
supervision on real hardware, written procedures specific to that hardware, and
institutional approval. No question here asks you to produce a procedure, and no
answer in the key supplies one.

---

# Section A — Multiple choice

*15 questions · 2 marks each · 30 marks. One best answer per question.*

**A1.** A LOX run tank sits vented, with TT-101 reading 90.2 K and PT-102 reading
14.7 psia. Helium is then admitted to the ullage until PT-102 reads 60 psia.
Fifteen seconds later TT-101 still reads 90.2 K. Which statement is best
supported?

  a) TT-101 is faulty: at 60 psia saturated oxygen must be near 105 K, so the
     readings are inconsistent.
  b) The liquid is now subcooled with respect to the total tank pressure, because
     a non-condensable pressurant raises total pressure without changing the
     liquid's temperature — which is how feed-system margin is bought.
  c) The tank no longer contains saturated liquid anywhere, since pressure and
     temperature can never be independent in a cryogenic vessel.
  d) The helium will condense on the cold ullage wall, so the pressure reading is
     transient and will collapse back to 14.7 psia.

**A2.** You are asked for "the" expansion ratio of liquid nitrogen to support two
different pieces of work: sizing an oxygen-deficiency inventory for a room, and
describing how fast a cloud is growing in the first seconds of a spill. Which
statement is correct?

  a) 696 : 1 serves both; the ratio is a property of the fluid.
  b) 694 : 1 and 696 : 1 disagree because one is a measurement and the other a
     calculation, so neither should be used without a third source.
  c) 696 : 1 (liquid at NBP → gas at 70 °F, 1 atm) is the right basis for the
     eventual inventory; the immediate volume off the liquid is far smaller,
     about 175 : 1, and that is closer to the early cloud.
  d) The immediate ratio, about 175 : 1, is the conservative number and should be
     used for both, because it is the one that occurs first.

**A3.** A bay contains both a methane system and a LOX system. Which statement
about oxygen enrichment and flammability is correct?

  a) Enrichment lowers methane's lower flammable limit substantially, so
     combustible-gas alarm setpoints must be reduced.
  b) Enrichment raises methane's autoignition temperature, so ignition becomes
     less likely but burns hotter.
  c) The lower limit moves barely at all (5.0 % → 5.15 %); the rich limit moves
     from 15 % to about 60.5 %, and materials that are not fuels in air become
     fuels in oxygen.
  d) Enrichment has no effect on gas-phase limits; it only affects solid
     materials.

**A4.** Which of these external surfaces, exposed to humid room air, will
condense an oxygen-enriched liquid out of the atmosphere?

  a) An uninsulated liquid nitrogen line at 77.4 K.
  b) An uninsulated liquid methane line at 111.7 K.
  c) An uninsulated LOX line at 90.2 K, because it is a LOX line.
  d) Any line below 0 °C, because that is where atmospheric condensation begins.

**A5.** A colleague reads that a trapped cryogen warmed to room temperature
generates "in excess of 10,000 psig" and proposes specifying 15,000 psi tubing
for a short isolatable LOX segment instead of fitting a thermal relief. What is
wrong with the reasoning?

  a) The 10,000 psig figure is an idealised endpoint, not a threshold; it is also
     not conservative, because the real fluid is dense and supercritical rather
     than an ideal gas. The demand is unbounded relative to any containment you
     could specify, so the answer is a relief path.
  b) Nothing, provided the tubing is rated at temperature and the fittings match.
  c) The figure is too high — real trapped segments rarely exceed 2,000 psig, so
     the tubing is heavily over-specified.
  d) It is acceptable for nitrogen but not for oxygen, since oxygen's expansion
     ratio is 860 : 1 rather than 696 : 1.

**A6.** An aluminium 6061 valve body is bolted with stainless 304 cap screws and
preloaded at room temperature. At 77 K, what has happened to the joint?

  a) The bolts contract more than the clamped members, so preload increases and
     the risk is overload.
  b) The dominant problem is brittle fracture of the 304 bolts at 77 K.
  c) Contraction is negligible, because the coefficient of thermal expansion falls
     steeply on cooling.
  d) The clamped members contract more than the bolts, so a large fraction of the
     bolt's elastic stretch — and therefore of the preload — is given back.

**A7.** Which seal arrangement is the standard answer for a *dynamic* cryogenic
seal, and why?

  a) A fluorocarbon (FKM/Viton) O-ring, because it is rated to −15 °F, the lowest
     in the common elastomer catalogue.
  b) A silicone O-ring, because silicone stays flexible to −75 °F.
  c) A plain PTFE O-ring, because PTFE remains usable to 4 K.
  d) A spring-energised PTFE seal, because a metal spring supplies the contact
     load instead of the polymer's own elasticity, and its travel absorbs the
     differential contraction.

**A8.** A proposal specifies 9 % nickel steel (A553 Type I) for the inner vessel
of a liquid-hydrogen dewar, on the grounds that it is a qualified cryogenic
material. The best objection is:

  a) None — 9 % Ni steel is the standard choice for liquid hydrogen.
  b) Nickel steels contract too much relative to the outer jacket.
  c) The nickel steels are still body-centred cubic, and even 9 % Ni is qualified
     only down to about 77 K; liquid hydrogen is 20 K.
  d) Nickel alloying makes the steel austenitic, so the objection is cost, not
     safety.

**A9.** A vacuum-jacketed LN₂ line is found with frost on its outer casing and its
pump-out plug lying on the floor beneath it. Which statement is best supported?

  a) The annulus has been pressurised — most likely by an inner-line leak — and
     heat input can rise by three to four orders of magnitude, because air
     entering a cold annulus condenses and freezes on the inner vessel and
     delivers that latent heat.
  b) The multilayer insulation has been damaged and heat leak has roughly doubled.
  c) Frost on the casing is normal for a cold line, and the plug is a maintenance
     item.
  d) The heat leak has risen by convection in the annulus, which is why the
     relief must be sized for a gas-filled jacket.

**A10.** A stand already has a high-pressure GN₂ supply on site. Why is helium
used to pressurise the LOX run tank ullage instead?

  a) Helium's latent heat is lower, so it chills the ullage less.
  b) Nitrogen is chemically incompatible with liquid oxygen.
  c) Nitrogen's saturation temperature rises with pressure — it condenses at about
     3.6 bar against a 90 K surface — so GN₂ pressurant above that liquefies on
     the cold ullage wall, putting liquid where gas was intended and taking tank
     pressure with it.
  d) Helium is required by code for all oxidiser pressurisation.

**A11.** A catalytic-bead combustible-gas detector is installed inside a
nitrogen-purged enclosure on a methane system. What will it do if methane leaks
into that enclosure?

  a) Read high, because the sensor responds to any combustible gas.
  b) Fail to a fault alarm, because the sensor detects its own loss of oxygen.
  c) Read correctly; oxygen affects only electrochemical sensors.
  d) Read low or zero, because a pellistor needs oxygen to oxidise the gas on the
     bead — and it will look exactly like a clean atmosphere on the panel.

**A12.** A methalox cell copies its gas-detection layout from a hydrogen
facility: combustible-gas detectors at roof level only. The best statement of the
error is:

  a) The detectors are the wrong technology; height is not the issue.
  b) Methane is lighter than air, so roof placement is right, but the count is
     too low.
  c) Cold methane vapour is about 1.5 times the density of ambient air and must
     warm roughly 52.6 K — to about 164.25 K — before it becomes buoyant, so a
     cold release runs along the floor and into trenches; hydrogen's crossover is
     within about 1.7 K of its boiling point, which is why the imported layout
     does not transfer.
  d) Roof-only placement is acceptable provided the alarm is set at 10 % LEL
     rather than 20 %.

**A13.** For a dead-ended GOX line, the isentropic compression relation gives a
theoretical final gas temperature well above any plausible autoignition
temperature. What does that calculation license you to conclude?

  a) That ignition will occur, and the design must be rejected.
  b) That the rapid-pressurisation mechanism cannot be ruled out — it is a
     screening bound that opens a question. Real compressions lose heat and take
     finite time, and qualification comes from testing the actual configuration.
  c) That the line is safe as long as the calculated temperature stays below the
     melting point of the metal at the dead end.
  d) That the mechanism is irrelevant, since the equation ignores heat loss and
     is therefore wrong.

**A14.** Promoted-ignition data show 304L stainless sustaining combustion in
oxygen above about 250 psi, while Monel, nickel, copper and brass resist to the
10,000 psi top of the test range. What follows?

  a) Stainless is not "oxygen-safe"; it is a material with a threshold, and at
     ordinary system pressures the valve body itself is flammable — which is why
     a documented control can be to change the body material.
  b) Stainless steel is oxygen-safe at all pressures found in cryogenic
     propulsion, since those data are for gaseous oxygen.
  c) Aluminium should be substituted, being lighter and non-sparking.
  d) The numbers are absolute thresholds and can be used directly as design
     limits without naming the test.

**A15.** A relief valve is protected by a rupture disc installed at its inlet.
Which combination is correct?

  a) Capacity is unaffected; the disc adds a second independent relief path.
  b) Capacity is de-rated by a factor of 0.90 unless a higher factor is certified
     by test, and a pinhole in the disc lets the space between pressurise so the
     disc no longer sees full differential and bursts late.
  c) The arrangement is prohibited, because a relief path must never contain
     another device.
  d) The disc must be set below the relief valve, so that it opens first and
     protects the seat from freezing.

---

# Section B — Short answer

*5 questions · 4 marks each · 20 marks. A short paragraph each; state assumptions.*

**B16.** A pump takes suction from a *vented* LOX run tank. Explain, in terms of
the fluid's state rather than the hardware, why the pump inlet is the most
fragile point in the whole feed system — and name the two independent directions
in which margin can be bought.

**B17.** State the margin between liquid oxygen's normal boiling point and
methane's freezing point, name two pieces of hardware whose design that margin
constrains, and say whether the resulting failure mode is documented or inferred.

**B18.** A team completes a HAZOP in March. In April someone adds an isolation
valve so a transducer can be swapped without draining the run tank, and does not
update the P&ID. Explain why this is a safety defect rather than a paperwork
defect, and why a *generic* written procedure would be worse than no procedure at
all.

**B19.** What does an oxygen-deficiency-hazard analysis actually compute? Name its
two halves, two inputs a student group could supply, and who may perform and
approve it. State one thing the method explicitly refuses to credit.

**B20.** "Oxygen clean" is a condition, not an adjective. Say what makes it a
specified, verified and documented condition, name the two contaminant families
and the ignition mechanism each feeds, and say what evidence should travel with a
cleaned part.

---

# Section C — Scenario and hazard analysis

*5 questions · 6 marks each · 30 marks. These reward structured reasoning. Say
what you would investigate and why, what would discriminate between competing
explanations, and where the answer depends on the facility.*

**C21. An unexplained pressure rise.**
A LOX run tank is left cold and idle overnight, ullage pressurised, with no
transfer in progress and nobody on the stand. Over eight hours PT-102 climbs
steadily; by morning the relief valve is lifting far more often than it did on
previous nights, and the level indication has dropped more than the crew expected.
The tank vent valve is confirmed to be in its normal position and the pressurant
supply is isolated.

List the physical phenomena you would investigate as candidate explanations, say
what each would predict about the *other* instruments on the tank, and identify
which of your candidates could make the pressure reading itself untrustworthy.

**C22. Which of these deserves an oxygen compatibility review?**
Five situations arrive in the same design-review package. For each, say whether it
warrants a formal oxygen compatibility assessment, and why — including the cases
where the honest answer is "largely not, but here is the question that still has
to be asked".

  1. A 304L stainless ball valve newly specified for a 400 psi GOX line.
  2. A Monel needle valve in the same 400 psi GOX line.
  3. An aluminium bracket clamping a vacuum-jacketed LOX line, outside the wetted
     boundary.
  4. A PTFE-seated check valve that has been cycling in a 300 psi GOX line for six
     years.
  5. A GN₂ purge line that the latest P&ID revision re-tags as GOX service, with no
     other change.

**C23. A liquid nitrogen leak indoors.**
A fitting on a liquid nitrogen transfer line weeps into a low-ceilinged basement
laboratory. A white cloud forms and drifts along the floor. Somebody says: "It's
only nitrogen — it's inert, and you can see exactly where it is."

Identify the hazard that matters most here and explain why it is invisible; say
what the white cloud is and why its boundary is not the boundary of the hazard;
name a second hazard the same leak creates on the surfaces it cools; and state
what determines how dangerous this particular room is, and who determines it.

**C24. Frost on a methane line.**
During a chilled hold, a heavy frost collar appears on a liquid methane line at a
pipe support bracket, roughly two metres downstream of a flanged joint. There is
no frost at the flange. The combustible-gas detectors show nothing.

State what the frost does tell you, what it does *not* tell you, and why frost is
an unreliable leak locator. Then say what would actually locate a leak, what the
absence of a detector alarm does and does not prove, and what a methane leak at
floor level would do that a hydrogen leak would not.

**C25. Independent hazards in a small methalox system.**
A student group proposes a small LOX/liquid-methane engine test stand in a
university bay. The bay has a cable trench running the length of the floor. Both
run tanks are pressurised from a single helium pack through a common header, with
one check valve per propellant leg. A single tall vent stack serves both tanks'
reliefs, "because height disperses everything safely". A common GN₂ purge manifold
feeds both propellant sides through check valves. The LOX drain discharges onto
the asphalt apron outside the roller door. Gas detection is one oxygen monitor at
head height by the door.

Identify at least **five independent hazards** in this description. For each, name
the mechanism, and say whether the fix is a physical separation, a device, or an
analysis someone qualified has to perform.

---

# Section D — Schematic and component

*5 questions · 4 marks each · 20 marks.*

<figure>
<svg viewBox="0 0 680 330" role="img" aria-label="Schematic of a liquid oxygen feed leg. From left: a vacuum-jacketed bulk tank with a pressure transmitter on its ullage, then a horizontal vacuum-jacketed liquid line running left to right through a manual valve, a filter, a check valve, a nitrogen purge tie-in with its own check valve rising from a purge panel below, a second manual valve, a riser carrying a manual block valve and a relief valve whose discharge runs left to a vent stack, a branch running down through a manual valve to a quick disconnect that is parted, a flow transmitter below the line, a pneumatic main valve marked fail closed, and an engine at the right-hand end.">
  <g font-family="system-ui, sans-serif" font-size="13">

    <!-- bulk tank -->
    <rect x="24" y="90" width="86" height="120" rx="8" fill="var(--side)" stroke="var(--oxy)" stroke-width="2.4"/>
    <rect x="31" y="97" width="72" height="106" rx="5" fill="none" stroke="var(--oxy)" stroke-width="1.2"/>
    <text x="67" y="142" text-anchor="middle" fill="var(--oxy)">LOX</text>
    <text x="67" y="160" text-anchor="middle" fill="currentColor">TK-1</text>
    <text x="67" y="228" text-anchor="middle" fill="var(--muted)">bulk tank</text>

    <!-- PT on ullage -->
    <polyline points="67,90 67,58 133,58" fill="none" stroke="currentColor" stroke-width="1"/>
    <circle cx="150" cy="58" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
    <text x="150" y="55" text-anchor="middle" fill="currentColor">PT</text>
    <text x="150" y="69" text-anchor="middle" fill="currentColor">1</text>

    <!-- main line, vacuum jacket drawn as a double line -->
    <line x1="110" y1="163" x2="585" y2="163" stroke="var(--muted)" stroke-width="1"/>
    <line x1="110" y1="177" x2="585" y2="177" stroke="var(--muted)" stroke-width="1"/>
    <line x1="110" y1="170" x2="650" y2="170" stroke="var(--oxy)" stroke-width="2.8"/>
    <text x="112" y="214" fill="var(--muted)">vacuum-jacketed run</text>

    <!-- HV-1 manual, open -->
    <path d="M127 158 l0 24 l26 -24 l0 24 z" fill="none" stroke="var(--oxy)" stroke-width="2"/>
    <line x1="140" y1="158" x2="140" y2="146" stroke="var(--oxy)" stroke-width="1.5"/>
    <line x1="132" y1="146" x2="148" y2="146" stroke="var(--oxy)" stroke-width="1.5"/>
    <text x="140" y="138" text-anchor="middle" fill="currentColor">HV-1</text>

    <!-- filter -->
    <rect x="187" y="157" width="26" height="26" fill="var(--bg)" stroke="var(--oxy)" stroke-width="2"/>
    <line x1="187" y1="183" x2="213" y2="157" stroke="var(--oxy)" stroke-width="1.4"/>
    <text x="200" y="148" text-anchor="middle" fill="currentColor">F-1</text>

    <!-- CV-1 check valve -->
    <path d="M247 161 L263 170 L247 179 Z" fill="none" stroke="var(--oxy)" stroke-width="1.8"/>
    <line x1="263" y1="160" x2="263" y2="180" stroke="var(--oxy)" stroke-width="1.8"/>
    <text x="258" y="200" text-anchor="middle" fill="currentColor">CV-1</text>

    <!-- purge tie-in -->
    <rect x="270" y="256" width="124" height="46" rx="5" fill="var(--side)" stroke="var(--inert)" stroke-width="1.8"/>
    <text x="332" y="276" text-anchor="middle" fill="currentColor">GN₂ purge</text>
    <text x="332" y="293" text-anchor="middle" fill="var(--muted)">shared panel</text>
    <line x1="332" y1="256" x2="332" y2="170" stroke="var(--inert)" stroke-width="1.8"/>
    <path d="M323 224 L341 224 L332 208 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
    <line x1="323" y1="206" x2="341" y2="206" stroke="var(--inert)" stroke-width="1.8"/>
    <text x="348" y="220" fill="currentColor">CV-2</text>

    <!-- HV-2 manual, open -->
    <path d="M382 158 l0 24 l26 -24 l0 24 z" fill="none" stroke="var(--oxy)" stroke-width="2"/>
    <line x1="395" y1="158" x2="395" y2="146" stroke="var(--oxy)" stroke-width="1.5"/>
    <line x1="387" y1="146" x2="403" y2="146" stroke="var(--oxy)" stroke-width="1.5"/>
    <text x="395" y="138" text-anchor="middle" fill="currentColor">HV-2</text>

    <!-- relief riser: BV-1 then PSV-1 -->
    <line x1="455" y1="170" x2="455" y2="118" stroke="var(--oxy)" stroke-width="2.2"/>
    <path d="M446 155 L464 155 L455 146 Z" fill="none" stroke="var(--oxy)" stroke-width="1.6"/>
    <path d="M446 137 L464 137 L455 146 Z" fill="none" stroke="var(--oxy)" stroke-width="1.6"/>
    <line x1="455" y1="146" x2="471" y2="146" stroke="var(--oxy)" stroke-width="1.6"/>
    <line x1="471" y1="138" x2="471" y2="154" stroke="var(--oxy)" stroke-width="1.6"/>
    <text x="478" y="150" fill="currentColor">BV-1</text>
    <path d="M446 118 L464 118 L455 106 Z" fill="none" stroke="var(--oxy)" stroke-width="1.8"/>
    <path d="M443 97 L443 115 L455 106 Z" fill="none" stroke="var(--oxy)" stroke-width="1.8"/>
    <polyline points="455,106 449,100 461,96 449,92 461,88 455,84" fill="none" stroke="var(--oxy)" stroke-width="1.4"/>
    <line x1="443" y1="106" x2="304" y2="106" stroke="var(--oxy)" stroke-width="2.2"/>
    <path d="M304 106 l9 -4 l0 8 z" fill="var(--oxy)"/>
    <text x="470" y="100" fill="currentColor">PSV-1 · 200 psig</text>
    <text x="298" y="102" text-anchor="end" fill="var(--muted)">to LOX vent stack</text>

    <!-- drain branch to a parted quick disconnect -->
    <line x1="520" y1="170" x2="520" y2="236" stroke="var(--oxy)" stroke-width="2.2"/>
    <path d="M508 188 l0 24 l24 -24 l0 24 z" fill="none" stroke="var(--oxy)" stroke-width="2"/>
    <line x1="520" y1="188" x2="520" y2="178" stroke="var(--oxy)" stroke-width="1.5"/>
    <line x1="512" y1="178" x2="528" y2="178" stroke="var(--oxy)" stroke-width="1.5"/>
    <text x="538" y="198" fill="currentColor">HV-3</text>
    <line x1="514" y1="236" x2="514" y2="254" stroke="currentColor" stroke-width="2"/>
    <line x1="526" y1="236" x2="526" y2="254" stroke="currentColor" stroke-width="2"/>
    <text x="538" y="244" fill="currentColor">QD-1</text>
    <text x="538" y="260" fill="var(--muted)">parted, capped</text>

    <!-- FT below the line -->
    <line x1="430" y1="170" x2="430" y2="223" stroke="currentColor" stroke-width="1"/>
    <circle cx="430" cy="240" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
    <text x="430" y="237" text-anchor="middle" fill="currentColor">FT</text>
    <text x="430" y="251" text-anchor="middle" fill="currentColor">1</text>

    <!-- MOV pneumatic -->
    <path d="M572 158 l0 24 l26 -24 l0 24 z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
    <path d="M572 152 a13 11 0 0 1 26 0 z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="1.5"/>
    <line x1="585" y1="158" x2="585" y2="152" stroke="var(--oxy)" stroke-width="1.5"/>
    <text x="585" y="220" text-anchor="middle" fill="currentColor">MOV-1  FC</text>

    <!-- engine -->
    <rect x="612" y="146" width="58" height="48" rx="4" fill="var(--side)" stroke="currentColor" stroke-width="2"/>
    <text x="641" y="166" text-anchor="middle" fill="currentColor">E-1</text>
    <text x="641" y="184" text-anchor="middle" fill="currentColor">engine</text>
  </g>
</svg>
<figcaption>Figure E.1 — A liquid-oxygen feed leg. Valves are drawn in the positions shown; MOV-1 is filled, the manual valves are not. Set pressures are illustrative placeholders, as everywhere in this course.</figcaption>
</figure>

**D26.** Using Figure E.1: mentally close HV-1, HV-2, HV-3 and MOV-1, and let
CV-1 and CV-2 hold. Name **five** distinct volumes that can now hold cryogenic
liquid with no path out, giving the boundary of each. Then name one trapped volume
that exists even with every drawn valve open, and one that the drawing does not
give you enough information to rule in or out.

<figure>
<svg viewBox="0 0 680 360" role="img" aria-label="Schematic of the relief arrangement on two run tanks. On the left a liquid oxygen run tank has two risers: one carrying a manual block valve marked car-sealed open below a relief valve set at 145 psig, and one carrying a burst disc set at 210 psig. On the right a liquid methane run tank has a single riser carrying a burst disc set at 190 psig in series below a relief valve set at 130 psig. All four devices discharge into one horizontal header that feeds a single vent stack rising from the middle of the drawing.">
  <g font-family="system-ui, sans-serif" font-size="13">

    <!-- tanks -->
    <rect x="40" y="232" width="150" height="96" rx="20" fill="var(--side)" stroke="var(--oxy)" stroke-width="2.4"/>
    <text x="115" y="272" text-anchor="middle" fill="currentColor">LOX RUN TANK</text>
    <text x="115" y="290" text-anchor="middle" fill="var(--oxy)">V-101</text>
    <rect x="430" y="232" width="150" height="96" rx="20" fill="var(--side)" stroke="var(--fuel)" stroke-width="2.4"/>
    <text x="505" y="272" text-anchor="middle" fill="currentColor">LCH₄ RUN TANK</text>
    <text x="505" y="290" text-anchor="middle" fill="var(--fuel)">V-201</text>

    <!-- LOX riser A: block valve + relief -->
    <line x1="80" y1="232" x2="80" y2="162" stroke="var(--oxy)" stroke-width="2.2"/>
    <path d="M71 214 L89 214 L80 205 Z" fill="none" stroke="var(--oxy)" stroke-width="1.6"/>
    <path d="M71 196 L89 196 L80 205 Z" fill="none" stroke="var(--oxy)" stroke-width="1.6"/>
    <line x1="80" y1="205" x2="96" y2="205" stroke="var(--oxy)" stroke-width="1.6"/>
    <line x1="96" y1="197" x2="96" y2="213" stroke="var(--oxy)" stroke-width="1.6"/>
    <circle cx="88" cy="219" r="5" fill="none" stroke="var(--muted)" stroke-width="1.3"/>
    <text x="104" y="201" fill="currentColor">BV-101</text>
    <text x="104" y="217" fill="var(--muted)">car-sealed open</text>
    <path d="M71 162 L89 162 L80 150 Z" fill="none" stroke="var(--oxy)" stroke-width="1.8"/>
    <path d="M92 141 L92 159 L80 150 Z" fill="none" stroke="var(--oxy)" stroke-width="1.8"/>
    <polyline points="80,150 74,144 86,140 74,136 86,132 80,128" fill="none" stroke="var(--oxy)" stroke-width="1.4"/>
    <polyline points="92,150 112,150 112,90" fill="none" stroke="var(--oxy)" stroke-width="2.2"/>
    <text x="118" y="132" fill="currentColor">PSV-101 · 145 psig</text>

    <!-- LOX riser B: burst disc -->
    <line x1="250" y1="232" x2="250" y2="90" stroke="var(--oxy)" stroke-width="2.2"/>
    <path d="M236 198 a14 14 0 0 1 28 0" fill="none" stroke="var(--oxy)" stroke-width="2"/>
    <line x1="236" y1="198" x2="264" y2="198" stroke="var(--oxy)" stroke-width="2"/>
    <line x1="190" y1="280" x2="250" y2="280" stroke="var(--oxy)" stroke-width="2.2"/>
    <line x1="250" y1="280" x2="250" y2="232" stroke="var(--oxy)" stroke-width="2.2"/>
    <text x="272" y="186" fill="currentColor">PSE-102 · 210 psig</text>

    <!-- fuel riser: disc in series below relief -->
    <line x1="540" y1="232" x2="540" y2="162" stroke="var(--fuel)" stroke-width="2.2"/>
    <path d="M526 208 a14 14 0 0 1 28 0" fill="none" stroke="var(--fuel)" stroke-width="2"/>
    <line x1="526" y1="208" x2="554" y2="208" stroke="var(--fuel)" stroke-width="2"/>
    <text x="520" y="212" text-anchor="end" fill="currentColor">PSE-202 · 190 psig</text>
    <path d="M531 162 L549 162 L540 150 Z" fill="none" stroke="var(--fuel)" stroke-width="1.8"/>
    <path d="M528 141 L528 159 L540 150 Z" fill="none" stroke="var(--fuel)" stroke-width="1.8"/>
    <polyline points="540,150 534,144 546,140 534,136 546,132 540,128" fill="none" stroke="var(--fuel)" stroke-width="1.4"/>
    <polyline points="528,150 508,150 508,90" fill="none" stroke="var(--fuel)" stroke-width="2.2"/>
    <text x="502" y="140" text-anchor="end" fill="currentColor">PSV-201 · 130 psig</text>

    <!-- common header and stack -->
    <line x1="112" y1="90" x2="508" y2="90" stroke="currentColor" stroke-width="2.4"/>
    <line x1="310" y1="90" x2="310" y2="44" stroke="currentColor" stroke-width="2.4"/>
    <path d="M310 44 L310 34 L324 26" fill="none" stroke="currentColor" stroke-width="2.4"/>
    <path d="M324 26 l-8 -1 l4 7 z" fill="currentColor"/>
    <text x="310" y="82" text-anchor="middle" fill="var(--muted)">one header, one stack, serving both tanks</text>
    <text x="332" y="30" fill="currentColor">stack outlet</text>
    <text x="40" y="350" fill="var(--muted)">Oxidiser green, fuel orange. Set pressures are illustrative placeholders.</text>
  </g>
</svg>
<figcaption>Figure E.2 — The relief and vent arrangement proposed for a two-propellant stand.</figcaption>
</figure>

**D27.** Using Figure E.2: list every finding you would raise, in order of
seriousness. For each, state the mechanism in one sentence. Include at least one
finding about something the drawing does *not* show that a reviewer would have to
ask for.

<figure>
<svg viewBox="0 0 660 320" role="img" aria-label="Cross-section of an extended-bonnet ball valve as installed in a vertical liquid oxygen line with upward flow. The bonnet extension, packing gland and actuator run horizontally to the right of the valve body, so the stem is horizontal. A hole is drilled through one wall of the ball, facing the top of the drawing, and the observed frost front reaches part-way along the bonnet extension.">
  <g font-family="system-ui, sans-serif" font-size="13">

    <!-- vertical pipe, flow upward -->
    <line x1="158" y1="30" x2="158" y2="290" stroke="var(--oxy)" stroke-width="2"/>
    <line x1="202" y1="30" x2="202" y2="290" stroke="var(--oxy)" stroke-width="2"/>
    <path d="M180 276 l-7 22 l14 0 z" fill="var(--oxy)"/>
    <text x="120" y="290" text-anchor="end" fill="var(--oxy)">flow ↑</text>
    <text x="120" y="272" text-anchor="end" fill="var(--muted)">LOX line</text>
    <text x="120" y="60" text-anchor="end" fill="var(--muted)">downstream</text>
    <text x="120" y="42" text-anchor="end" fill="var(--muted)">(engine side)</text>

    <!-- body -->
    <rect x="138" y="120" width="84" height="100" rx="6" fill="var(--side)" stroke="currentColor" stroke-width="2"/>
    <circle cx="180" cy="170" r="32" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="150" y="162" width="60" height="16" fill="var(--side)" stroke="currentColor" stroke-width="1.2"/>
    <text x="180" y="242" text-anchor="middle" fill="currentColor">body cavity</text>

    <!-- drilled hole through one wall of the ball, facing up -->
    <path d="M172 142 l-10 -14" stroke="currentColor" stroke-width="3"/>
    <path d="M162 128 l10 1 l-4 -8 z" fill="currentColor"/>
    <text x="132" y="112" text-anchor="end" fill="currentColor">hole drilled through</text>
    <text x="132" y="128" text-anchor="end" fill="currentColor">one wall of the ball</text>

    <!-- bonnet extension, horizontal -->
    <rect x="222" y="152" width="150" height="36" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="222" y1="170" x2="372" y2="170" stroke="var(--muted)" stroke-dasharray="5 4"/>
    <text x="238" y="212" fill="var(--muted)">bonnet extension, as installed</text>

    <!-- packing and actuator -->
    <rect x="372" y="146" width="42" height="48" fill="var(--side)" stroke="currentColor" stroke-width="2"/>
    <text x="393" y="130" text-anchor="middle" fill="currentColor">packing</text>
    <rect x="414" y="140" width="52" height="60" rx="6" fill="var(--side)" stroke="currentColor" stroke-width="2"/>
    <text x="440" y="226" text-anchor="middle" fill="currentColor">actuator</text>

    <!-- frost front -->
    <line x1="330" y1="118" x2="330" y2="230" stroke="var(--muted)" stroke-dasharray="6 4" stroke-width="1.5"/>
    <text x="336" y="112" fill="var(--muted)">frost front observed here</text>

    <!-- direction the valve must hold -->
    <text x="480" y="266" text-anchor="end" fill="currentColor">Closed, this valve must hold pressure</text>
    <text x="480" y="284" text-anchor="end" fill="currentColor">from the upstream (lower) side.</text>
  </g>
</svg>
<figcaption>Figure E.3 — An extended-bonnet ball valve as found during a walkdown of a vertical LOX line.</figcaption>
</figure>

**D28.** Using Figure E.3: identify **two** installation problems and give the
physical consequence of each. Then say what feature of this valve makes it
directional, and what the frost front tells you about whether the bonnet is doing
its job.

**D29.** A P&ID fragment carries the following tags: `PT-201`, `TT-201`,
`LT-201`, `FT-207`, `PSV-209`, `PSE-202`, `AT-403`, `HV-204`, `BV-205`, `CV-201`,
`QD-2`. Answer briefly:

  a) Which propellant system do the 200-series loop numbers belong to on a stand
     tagged the way this course tags them, and what does the loop number identify?
  b) What is `PSE` conventionally, and how does its role differ from `PSV`?
  c) A bubble drawn with a horizontal bar through it means what, and what does a
     plain bubble on a line mean?
  d) Which device on that list is routinely treated as an isolation device or a
     barrier, and is neither?

**D30.** Four instruments, four ways to be misled. For each, name a failure that
produces a **plausible but wrong** reading rather than an obvious fault, and say
what that failure would do to any interlock that depends on it:

  a) A pressure transmitter behind a standoff sense line on a cold tank.
  b) A turbine flow meter in a saturated liquid feed leg.
  c) A catalytic-bead combustible-gas detector at a methane facility.
  d) An oxygen monitor mounted at head height in a room with a floor trench.

---

*End of exam. The key is in [`final-exam-key.md`](final-exam-key.md).*
