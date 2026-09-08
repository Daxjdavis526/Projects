# Capstone — Instructor Solution

*The solution to [`capstone.md`](capstone.md). Do not read this until you have
written your findings list down.*

There are **32 findings** below, plus **ten items that are deliberately ambiguous
or facility-dependent** and are raised as questions rather than defects. They are
grouped by severity, and within each group roughly in the order the seven review
lenses of Module 08 §3 would surface them.

Each finding carries: **what · where · why physically · what could happen · what
it violates · what to demand.** The last of those is the part most readers skip
and the part a real review is actually made of.

Two standing notes before the list.

**On set pressures and distances.** No number in Figure C.1 is judged here as
right or wrong. Set pressures belong to the vessel and its relief calculation;
stack heights and standoffs belong to the site and the authority having
jurisdiction. What is judged is the **absence of a traceable basis** for them.

**On the group.** Nothing below implies the group is careless. Most of these
findings are the ordinary output of enthusiastic, competent people who have not
yet been taught the specific failure modes this course covers. That is exactly why
the review exists, and it is why every finding is phrased as a demand for evidence
rather than a verdict.

---

## Critical findings

*Stop. These are not closed by a promise, an interlock or a procedure.*

### F1 — One vent header and one stack serve both the fuel and the oxidiser systems

**Where.** The common vent header at the top of Figure C.1: PSV-101, PV-103,
PSV-201, FV-203 and PSV-209 all discharge into it, and it turns up into V-1.
Claim **C8**.

**Why it matters.** A shared header is a mixing chamber holding gas from one
system until the other vents into it. Methane's flammable range in air is
**5.0 – 15.0 %**; in oxygen it is **5.15 – 60.5 %** — four times wider on the rich
side. Inside a shared pipe you choose neither the composition nor the moment. Even
without simultaneous flow, a cold oxygen-carrying line that has also carried fuel
can hold condensed hydrocarbon as a deposit. And a header carrying oxidiser
relief flow is an oxygen system: every internal surface of it is now in oxygen
service.

**What could happen.** Ignition inside a pipe that runs back to the ullage of both
propellant tanks, with an unrestrained one-inch stack as the only outlet.

**What it violates.** The flat prohibition in Modules 03 §4, 07 §8 and 08 §2.6:
fuel and oxidiser vents are never combined. NFPA 55 (2026 edition) governs the
installation. NASA's NESC work on LO₂/LNG is the reason the methalox case is
worse than the LOX/RP-1 precedent people import.

**Demand.** Separate oxidiser and fuel vent headers sharing no pipework anywhere,
terminating in separate stacks, with the discharge points shown on a site plan and
a statement of why the two **plumes** cannot meet under any wind or building wake.
Claim C8's reasoning — "too dilute by the time it leaves the pipe" — must be
rejected explicitly, because the mixing happens upstream of the tip, where the
dilution has not happened yet.

### F2 — A manual block valve isolates the only relief device on the LOX tank

**Where.** HV-102, beneath PSV-101 on V-101. Claim **C10**.

**Why it matters.** Every isolatable volume that can hold cryogen needs a relief
path **that cannot itself be isolated**. Here the relief path can be closed by one
person, by hand, and the tag on the valve is the only thing preventing it. A tag
is an administrative control; it does not add a protection layer, it replaces one.

**What could happen.** Exactly Williams Olefins, Geismar, 13 June 2013: a vessel
isolated from its correctly sized relief device, heat added, shell rupture, BLEVE
and fire, two dead and 167 reporting injuries. The CSB's own conclusion was that a
relief valve on the vessel itself would have been better than a locked-open block
valve, being "less reliable due to the possibility of human implementation
errors."

**What it violates.** SLAC's uninterruptible-relief rule and LBNL PUB-3000 ch. 29.
ASME BPVC Section VIII Division 1 (2025 edition) permits a block valve upstream of
a relief only under the Appendix M controls — and a car seal or lock is still
administrative. Note that the group's control is weaker than a car seal: it is a
tag plus a rule about who may touch it.

**Demand.** Delete HV-102, or produce the Appendix M case in writing with the
locking hardware and the procedure. Note that F3 makes this worse: HV-102 is not
isolating one of two devices, it is isolating the tank's entire relief capability.

### F3 — One relief device per tank, with no second device for the accident case

**Where.** V-101 has PSV-101 only; V-201 has PSV-201 only. No burst disc anywhere
on the drawing.

**Why it matters.** A cryogenic vessel has at least two sizing cases and they are
answered by two devices. **Normal boiloff** is steady state and sizes a small
reclosing valve, so the test continues. **Loss of the insulating vacuum** — and
fire — is the accident case and sizes a large non-reclosing device: air entering
the annulus condenses and freezes on the cold inner wall, and that latent heat
delivers **1–7 kW/m² insulated or 25–40 kW/m² bare** against roughly **0.6 W/m²**
for healthy MLI. That is a step of three to four orders of magnitude, beyond any
reclosing valve of sensible size. These are surplus dewars of unknown vacuum
history, which makes the loss-of-vacuum case more credible here, not less.

**What could happen.** The relief opens, passes what it was sized for, and the
vessel goes past it anyway — as a fragmentation event, because the failure occurs
cold.

**What it violates.** CGA S-1.2 (11th ed., September 2024) for portable containers
or CGA S-1.3 (10th ed., September 2024) for stationary storage — which of the two
applies is a legitimate question, see Q6 — together with ASME BPVC Section VIII
Division 1 (2025), which allows 10 % accumulation above MAWP and 21 % for the fire
case. JLab treats loss of insulating vacuum as a third mandatory case.

**Demand.** A relief sizing calculation for each vessel covering all three cases,
naming the code part used, with the device selections that follow from it.

### F4 — No relief on the regulated side of PCV-301

**Where.** PCV-301 and the 250 psig GN₂ manifold. Nothing protects the manifold or
anything downstream of it if the regulator fails open.

**Why it matters.** The upstream source is **6000 psig**. Everything downstream is
rated — on the group's own assumption — at 250 psig. A regulator failing open is
an ordinary, credible single failure, and it puts full pack pressure into both
propellant tanks simultaneously through CV-301 and CV-302, and into both feed
legs through CV-303 and CV-304. The tank reliefs are the only thing left, and they
were never sized for that flow.

**What could happen.** Simultaneous overpressure of both propellant tanks and both
purge circuits, from one component failure. Separately, the same failure drives
the adiabatic-compression case of F15 from a pressure ratio of 18 to a ratio of
**409**: on the isentropic relation *T*_f = *T*_i(*P*_f/*P*_i)^0.2857 that is
293 K → about **1630 K**, in an oxygen line.

**What it violates.** The single-failure lens, Module 08 §3 pass 5, and the
governing rule that no single failure may open a fuel path and an oxidiser path
into a common volume. Relief-scenario framing for regulator failure is API STD 521
territory; the device itself is ASME BPVC VIII.

**Demand.** A relief on the low-pressure side sized for full unrestricted
regulator failure, or a written demonstration that the downstream reliefs can pass
that flow within the accumulation limit.

### F5 — The oxidiser feed leg contains a trapped volume of liquid oxygen with no relief path

**Where.** The segment between HV-107 and MOV-110, closed at the bottom by
MOV-110, at the top by HV-107, and at the side by CV-303, which holds. Compare the
fuel side, where **PSV-209 exists on exactly the equivalent segment**.

**Why it matters.** This is the canonical cryogenic finding, and the drawing gives
you the tell for free: the two legs are otherwise mirror images, and one of them
has a relief. Confined cryogenic liquid warming to ambient generates pressure
"in excess of 10,000 psig" (LBNL PUB-3000 ch. 29); oxygen's expansion ratio is
**861 : 1**, liquid at NBP to gas at 70 °F. The hazard is not proportional to how
much you trapped — the segment is a fixed volume, so the pressure goes wherever it
must, and a very small volume is entirely sufficient to burst the pipe.

**What could happen.** A pipe or valve body letting go as a fragmentation event,
while saturated with liquid oxygen — a mechanical failure and an ignition event at
the same instant.

**What it violates.** LBNL PUB-3000 ch. 29 and SLAC ch. 36: "each and every
portion of the cryogenic system must have uninterruptible pressure relief," and
the test is *isolatable*, not *normally isolated*.

**Demand.** A thermal relief on that segment, discharging by a path that cannot
itself be isolated, to the (now separate — see F1) oxidiser vent. Then the same
sweep across the whole drawing: the valve body cavities, the dead leg between QD-1
and HV-105, the volume between HV-204 and the fuel tank, the sight-tube standpipe
LG-101, the volume downstream of every check valve, and every instrument sense
line. Ask for the list, not for one relief.

### F6 — One nitrogen manifold serves both propellant systems, separated only by check valves

**Where.** P-301 → PCV-301 → the 250 psig manifold → CV-301, CV-302, CV-303,
CV-304. Claim **C7**.

**Why it matters.** A purge or pressurant manifold is a flow path. Share one, and
the only thing keeping methane out of the liquid-oxygen system is a check valve —
a device that leaks, hangs open on debris, cannot be tested in place, and fails in
whichever direction the pressure points. Claim C7 states the error outright: "the
check valves prevent any cross-flow." They do not; they resist it, sometimes.

**What could happen.** Methane vapour migrating back into a header that later
feeds the LOX tank ullage or the LOX feed leg — putting fuel into an oxygen system
with no instrument anywhere that would show it.

**What it violates.** Module 07 §7 and Module 08 §2.5, in the same words: **a
check valve is not a barrier between a fuel and an oxidiser.** Physical separation
is the control, with positive isolation where systems must cross-connect.

**Demand.** Physically separate purge and pressurant supplies for the two
propellants, from separate sources. If any cross-connection is unavoidable,
positive isolation — a double block and bleed, or a spool piece removed — not a
non-return device.

### F7 — Two fail-safe positions are inverted

**Where.** MOV-110 annotated **FAIL OPEN**; PV-103 annotated **FAIL CLOSED**.
Claim **C9**. Note that FV-203 and MFV-210 on the fuel side are correct.

**Why it matters.** Fail-safe is per valve, and both answers come from one
question: which position is least dangerous when the utility disappears?
Propellant isolation and pressurisation valves fail **closed** — stop adding
propellant. Vent and relief paths fail **open** — never bottle up a cryogen.
MOV-110 failing open feeds liquid oxygen to an engine nobody is commanding, on a
momentary loss of shop air. PV-103 failing closed seals a cryogenic tank with heat
leaking into it, at the same moment the control system has stopped working, and
leaves PSV-101 — which F2 says can be isolated by hand — as the only path out.

**What could happen.** Loss of instrument air during a fill gives you, from one
event, an unpowered stand with the main oxidiser valve open and the oxidiser tank
vent shut.

**What it violates.** Module 03 §3 and Module 08 §7 and Figure 8.3. Claim C9's
reasoning is the tell: both positions were chosen to protect the *test*, not to
protect the *people*.

**Demand.** MOV-110 fail closed, PV-103 fail open, and then a written
loss-of-utilities state table for the whole system — power, instrument air and
comms cut together as one case, not three — with the resulting whole-system state
read off the drawing.

### F8 — There is no remote-operation boundary, and people are at the stand during the hazardous evolutions

**Where.** The operator station: 8 m, plywood and sandbags, inside the same bay.
Claims **C15** and **C22**. Manual valves HV-102, HV-105, HV-107, HV-108, HV-204,
HV-207, HV-208 and the sight glass LG-101 are all at the stand.

**Why it matters.** Distance is the only control that works against fragments,
blast and a sudden oxygen-deficient atmosphere simultaneously, and it works
whether or not anybody did the right thing. PPE is explicitly the last line of
defence and a weak one. Here the design *requires* two people to stand next to a
pressurised cryogenic oxidiser vessel during filling and pressurisation — the two
evolutions with the highest release rate in the whole campaign (see F31) — and the
barrier is plywood and sandbags inside the same enclosed volume, which does
nothing about an oxygen-deficient or flammable atmosphere at all.

**What could happen.** Vessel or line failure, or a release, with people inside the
hazard envelope by design rather than by mistake.

**What it violates.** The design goal stated in the practical-engineering section:
a system that can be loaded, pressurised, fired and safed with the crew behind the
barricade, with **every surviving manual action treated as a finding to argue
about**. Here the manual actions were never argued about; they were assumed.

**Demand.** A stand that is loadable and pressurisable remotely; a list of every
manual action that survives, each with a written justification for why it could
not be designed out; and a barricade and exclusion zone whose location comes from
a consequence or explosive-siting analysis rather than from where the table
happened to fit. See Q3 — the defect is not that 8 m is the wrong number, it is
that no number was derived at all.

### F9 — The engine fires into an unventilated trench that drains into an occupied basement

**Where.** The trench beneath E-1, 0.9 m deep, opening into a cable chase to the
Building 4 basement. Control cable runs along it. No detector is in it. Claim
**C14** proposes to cover it with steel plate during tests.

**Why it matters.** Cold methane vapour does not rise. At its boiling point it is
**1.51 times** the density of ambient air, and it must warm by **52.6 K — from
111.7 K to 164.25 K** — before it is as light as 20 °C air. Until then it runs
along the floor and pools in exactly this geometry. A trench channels and
concentrates the cloud, resists ventilation, and holds the cabling that area
classification exists to control. This one has a graded path out of it into an
occupied building, which converts a local release into a basement full of
flammable gas. Covering it with steel plate makes ventilation worse, not better,
and turns it into a closed volume with a fuel supply.

**What could happen.** A flammable layer travelling below grade into an occupied
basement, ignited by anything at all — methane's minimum ignition energy in air is
about **0.28 mJ** against roughly **10 mJ** for a static discharge from a person.
Separately, the same trench is the low point the LOX drain is graded toward
(F23), so it is a single volume that can receive both a fuel and an oxidiser
release — the hazard neither system creates alone.

**What it violates.** Module 07 §4 and §8; OSHA 29 CFR 1910.146, under which a
space is permit-required if it *has the potential to contain* a hazardous
atmosphere — the classification follows the potential, not today's reading. The
wiring question is NFPA 70 (2026 edition) Articles 500–506, with NFPA 497 (2024
edition) as the recommended classification method.

**Demand.** Either the trench is removed from the hazard path — sealed against the
cable chase, ventilated, graded away, and instrumented at its floor — or the stand
does not sit over it. Plus a confined-space determination by the facility's
programme, and the trench treated as a classified volume in the area
classification study.

### F10 — The relief basis is fabricated: an assumed MAWP and copied set pressures

**Where.** Claims **C2** and **C3**. PSV-101 and PSV-201 both at 175 psig.

**Why it matters.** A relief set pressure belongs to the vessel it protects. It is
an output of a relief calculation performed against that vessel's MAWP, and the
MAWP is a documented property of that vessel, not a figure from a reseller's web
page for a model number that may or may not match the object in the bay. These
tanks have no nameplate, unknown history, unknown vacuum condition, and
shop-welded penetrations of unknown procedure (§2.1) — which means the pressure
boundary was modified after whatever qualification it originally had.

**What could happen.** Every downstream number is wrong in an unknown direction:
proof pressure, set pressure, relief capacity, and the interlock trips derived
from them. A set pressure copied from another university's stand is a number about
a different vessel.

**What it violates.** ASME BPVC Section VIII Division 1 (2025); NASA-STD-8719.17D
Revision D (26 April 2023) for ground-based pressure vessels and pressurised
systems, and NASA-STD-8719.26 for non-code metallic vessels, as the model for what
a non-code vessel route looks like; and whatever registration threshold the
university's own pressure-systems programme sets — MIT's published programme, as
one example, treats anything capable of exceeding 15 psi as a pressure vessel
system.

**Demand.** Vessel documentation or a documented non-code assessment; the MAWP
with its basis; the weld procedure and material traceability for the shop-made
penetrations; and a relief calculation traceable to that MAWP. Until those exist,
the set pressures are not reviewable and neither is anything derived from them.

---

## Major findings

*Must be closed before the next gate. Several of these are Critical at a larger
scale or a different site.*

### F11 — The vent stack discharge is beside a doorway and an air intake, and nothing about it is sized

**Where.** V-1 in Figure C.1: 2.4 m of one-inch tube up the north wall, terminating
above the roll-up door beside the bay's air-handling intake. Claim **C8**.

**Why it matters.** Four separate questions, none of them answered anywhere in the
proposal.

**Where it discharges.** A relief that works perfectly and dumps cold oxidiser or
fuel into an occupied space, a walkway or a building intake has not done its job.
Anything that could pull room oxygen below **19.5 %** must exhaust outside the
building, and the converse case is worse here: a GOX-enriched plume above **23.5 %**
soaks clothing in an oxidiser that persists long after the wearer has walked away,
and this outlet is directly above the doorway people use. An air intake beside it
takes the plume — fuel or oxidiser — into the building's ventilation.

**Whether it can pass the flow.** One inch of tube is a capacity statement, and it
has to be checked against the largest device discharging into it under its
governing case — which, per F3, has not been established.

**Icing.** Cold gas freezes atmospheric moisture at the outlet, so the component
whose entire job is never to be blocked is the one that ices up. Blocked vent lines
are a principal cause of overpressure.

**Reaction force.** A relieving stack is a rocket nozzle. It must be restrained, and
nothing on the drawing shows how.

**What it violates.** SLAC ch. 36 on discharge destinations; JLab's overpressure
work on blocked vents; OSHA 29 CFR 1910.146 for the oxygen band. The dimensions
themselves are site- and AHJ-dependent — see Q2 — but the *absence of any basis* is
not.

**Demand.** Discharge locations marked on a site plan with distances to doors,
walkways, intakes and property lines; a capacity check against the governing sizing
case; the anti-icing provision; and the stack restraint. All of this applies to each
of the two stacks that F1 requires.

### F12 — Cleanliness is asserted, not specified, verified or recorded — and the proof test contaminated the system

**Where.** Claims **C4** and **C5**.

**Why it matters.** "Oxygen clean" is a specified, verified and documented level of
freedom from contaminants, matched to the system's pressure, concentration and
geometry. Acetone and a wipe is a cleaning *action*, not a level; shop air from an
oil-lubricated compressor is a *contamination source* blown through the oxygen
boundary after cleaning; and a UV torch catches gross contamination only —
screening, not verification. Verification is quantitative: non-volatile residue as
mass per unit area, and particle counts by size band with a maximum permitted size.
Worse, C4 records that the entire assembly was pressurised to 375 psig with that
same shop air, which is a re-cleaning trigger in its own right.

**What could happen.** A hydrocarbon film in the position that maximises both
ignition probability and heat delivery into surrounding metal — a crevice, a dead
end, a valve seat — waiting for the compression peak of F15.

**What it violates.** CGA G-4.1, 7th edition (August 2018), which applies to all
surfaces contacting fluid above 23.5 % oxygen. ASTM G93/G93M-25 for cleanliness
levels and verification methods — note that the 2025 revision made G93 a *Guide*
rather than a *Practice*, so it no longer prescribes a level; the level is selected
from a documented risk analysis, which is itself a deliverable. NVR methods are
ASTM G120, G136 and G144.

**Demand.** A specified cleanliness level with the standard that defines it; the
risk analysis that selected it; quantitative NVR and particle results per part;
packaging and preservation records; re-cleaning triggers; and evidence the system
was re-cleaned after the proof test. "We degreased it carefully" is not a
cleanliness level.

### F13 — The proof test was pneumatic, at pressure, with people in the room

**Where.** Claim **C4**: 375 psig on shop air, ten minutes, two members watching
for leaks.

**Why it matters.** Hydrostatic testing is preferred to pneumatic because far less
energy is stored in a compressed liquid than in a compressed gas. A liquid is
nearly incompressible: when a hydrotested vessel fails, the pressure collapses
almost immediately and little energy is available to throw fragments. The same
vessel pneumatically tested holds a large volume of compressed gas that expands
into the failure, producing a blast wave and shrapnel. The proof test is a
deliberate, controlled overload — one of the most hazardous evolutions in the whole
programme — and the group performed it as a shop task with observers at arm's
length.

**What it violates.** The rule and the reason are stated together in MIT's
published pressure-vessel programme. ASME BPVC Section VIII Division 1 (2025)
governs the test pressure factor and the acceptance criteria.

**Demand.** Hydrostatic proof where the geometry permits; where a pneumatic test is
unavoidable, it becomes a remote operation with an exclusion zone. And note the
sequencing: this test was performed against an MAWP that F10 says is not
established, so the number 375 psig currently means nothing.

### F14 — The oxidiser-side material set will not survive either the cold or the oxygen

**Where.** Claim **C6**, and LG-101 in Figure C.1. Four separate problems.

**The polycarbonate sight tube LG-101.** A thermoplastic at 90 K is far below its
glass transition — brittle, and dimensionally moved by contraction that ordinary
polymers undergo at percent level. It is also a nonmetal inside the oxygen-wetted
boundary, and nearly all polymers are flammable in 100 % oxygen at 1 atm. It is
additionally a dead leg and a stagnant standpipe where contaminant collects, and it
is the reason a person has to stand at the tank (F8, C20).

**The Viton O-rings.** Parker's published service rating for fluorocarbon is
**−15 °F (247 K)**. LOX is **90 K** — some **157 K** below the rating. Below its
glass transition an elastomer's shear modulus rises by about three orders of
magnitude; it cannot conform to the surface finish and cannot rebound to follow a
gland that is still moving. This is not a marginal call; it is off the end of the
table. The cryogenic answers are spring-energised PTFE, where the *spring* supplies
the contact load, or metal seals that work by plastic deformation.

**The zinc-plated carbon-steel cap screws.** Carbon steel is body-centred cubic and
past its ductile-to-brittle transition long before LN₂ temperature — modern A36
mild steel is already brittle at −15 °C at the 27 J Charpy criterion, and this
service is −183 °C. Those are brittle fasteners in a pressure joint: a fracture
hazard, not merely a leak. They are also the worst possible bolt material for an
aluminium flange. Integrated contraction to 77 K is **0.190 %** for carbon steel
against **0.389 %** for aluminium 6061 — a differential of **0.199 %**, nearly
twice the mismatch a stainless bolt would give, and the clamped members shrink more
than the bolt, so the joint unloads. On the Module 04 §2D worked example a
stainless bolt in an aluminium stack loses about half its preload; this combination
loses more.

**Aluminium 6061 flanges in the wetted boundary.** In the promoted-ignition data
aluminium 6061 sustains combustion in oxygen at ambient pressure, and the LOX case
is worse than the GOX case — aluminium 2219's mechanical-impact threshold is
1500 psi in GOX and **50 psi in LOX**.

**What is fine, and should be said so.** The brass QD *body* is a good choice on
both counts: copper alloys are face-centred cubic and stay ductile cold, and brass
resists ignition to the 10,000 psi top of the promoted-ignition test range. PTFE
seats are an appropriate material class. 316L tube is right.

**What it violates.** ASTM G63-15(2023) for nonmetals in oxygen service, G94-22 for
metals, G88-21 for system design; and the course rule that if a material's
flammability is unknown, it is flammable.

**Demand.** A materials list for the wetted boundary with an
oxygen-compatibility rationale per item and the configuration it was assessed at —
pressure, concentration, temperature, velocity, geometry and neighbouring
materials, because "is this part oxygen compatible?" has no answer without them.
Delete the sight tube. Matched-material bolting or an athermalised joint. Metal or
spring-energised seals.

### F15 — A fast-opening valve, a dead-ended oxygen leg, and a hydrocarbon grease in the same place

**Where.** QD-1 and HV-105 in Figure C.1; claims **C6** and **C22**. Also the
purge tie-in at CV-303, which pressurises a dead-ended LOX line from 250 psig.

**Why it matters.** Rapid pressurisation needs three characteristic elements:
pressurisation in under about a second, an exposed nonmetal near the dead end, and
a pressure ratio taking the gas above that nonmetal's situational autoignition
temperature. The design supplies all three at once, and C22 makes the fast opening
a deliberate technique. The isentropic screening relation, with *n* = 1.4 for
oxygen:

$$T_f = T_i\left(\frac{P_f}{P_i}\right)^{(n-1)/n}$$

For the purge case — 250 psig into a leg sitting at 14.7 psia — the ratio is
**18.0** and the screening result is **about 669 K (396 °C)**, above the ~300 °C
working autoignition convention EIGA uses for nonmetals. Under F4's regulator
failure the ratio becomes 409 and the screening result about **1630 K**. Meanwhile
the white lithium grease on the cam-lock is the archetypal wrong material: low
autoignition temperature, high heat of combustion, sitting as a film in a crevice
at exactly the position the compression peak occurs.

**The honest complication, which a good reviewer states.** G74-consistent testing
has shown that for **initial upstream pressures below 275 psia** the real
temperature rise, with heat loss to the wall, is too small for ignition to occur —
and 250 psig is 264.7 psia, just under that. So the screening equation and the
empirical result disagree for the nominal case. That does not close the finding: the
equation tells you when you *cannot rule the mechanism out*, never that a design is
safe, and the regulator-failure case is far above any such threshold.

**What it violates.** NASA/TM-2007-213740 §4.3 — remove a characteristic element or
the mechanism stands. ASTM G74-13(2021) is the test; the pneumatic-impact
qualification is of the actual configuration, not of the formula. CGA G-4.1 for the
lubricant.

**Demand.** A slow-opening valve or an upstream orifice; the dead-ended leg
eliminated, which removes the resonance geometry at the same time; an
oxygen-compatible fluorinated lubricant in the smallest workable quantity, or none;
and QD-1 assessed as a component with a cross-sectional drawing, since a cam-lock
disconnect is a mechanism full of dead volume and generated particles.

### F16 — Nitrogen at 250 psig will condense against both propellant ullages

**Where.** PCV-301, the 250 psig manifold, CV-301 and CV-302. Claim **C7**.

**Why it matters.** "GN₂ does not freeze in a methalox system" is true and
incomplete. Nitrogen's saturation temperature climbs steeply with pressure: it
reaches **90 K — liquid oxygen's boiling point — at only 3.60 bar (about
52 psia)**, and **111.7 K, methane's boiling point, at about 15.6 bar (226 psia)**.
The manifold runs at 250 psig, which is **264.7 psia — 18.25 bar** — above both.
Nitrogen pressurant above that liquefies on the cold ullage walls, putting liquid
where gas was intended, taking tank pressure down with it, and depositing liquid
nitrogen into liquid oxygen and into liquid methane.

**What could happen.** Ullage collapse mid-run: feed pressure sags unpredictably at
the moment the engine is drawing, and the control system's model of the tank is
wrong. On the fuel side, liquid nitrogen in liquid methane also changes the
composition the injector sees.

**What it violates.** Not a standard — property data. `reference/properties.md`
§11.3, Confidence A, from the NIST nitrogen saturation line. Module 08 §2.1 gives
the same reason for helium on the oxidiser side.

**Demand.** Either helium pressurant, or an ullage thermal analysis showing what
fraction of the pressurant condenses at the actual ullage temperature and gas
inlet arrangement, and what that does to tank pressure during a draw. See Q10 —
this is not a prohibition on nitrogen, it is a demand for the analysis.

### F17 — Every detector is in the wrong place, of the wrong type, or missing

**Where.** AT-401, AT-402, AT-403; claim **C11**. Four separate problems.

**AT-402 is a catalytic bead inside a nitrogen-purged enclosure.** A pellistor
works by burning the gas on a heated bead: **it requires oxygen**. In an inert
enclosure it reads near zero however much methane is present, and on the panel that
looks exactly like a clean atmosphere. Point infrared is oxygen-independent and is
what belongs there.

**AT-401 at the roof is imported hydrogen practice.** Warm methane is buoyant, but
a cryogenic release makes vapour **1.51 times** the density of ambient air that
must warm **52.6 K** before it will lift. Claim C11 states the misconception
outright. Combustible-gas detectors on a methalox stand go **high and low**, and
into the trench.

**There is no oxygen-deficiency monitoring where people are.** AT-403 sits at the
operator-station ceiling. Oxygen monitors protect lungs, so they go at breathing
height in occupied spaces — and the occupied space during fill and pressurisation
is the stand itself (F8), which has none. Cold inert vapour stratifies: a reading
at head height in a doorway can look normal while the lower half of the room is
lethal, and JLab's rule is that stratification must not be used to reduce the risk.

**There is no oxygen-enrichment monitoring at all.** A methalox stand runs **three**
detection populations — combustible gas, oxygen deficiency below **19.5 %**, oxygen
enrichment above **23.5 %** — with different sensors, setpoints, placements and
responses. The oxidiser vent plume, the bare fill hose (F24) and the LOX drain all
make enrichment credible here. Conflating the three is itself a design finding.

**What it violates.** OSHA 29 CFR 1910.146 for the 19.5 % / 23.5 % band and for the
10 %-of-LFL rule, which for methane's 5.0 % LFL gives an action level of **0.5
vol %**. Practice is two combustible-gas alarm levels, near 10–20 % and 20–40 % LEL,
because one level forces a choice between nuisance shutdowns and a late response.

**Demand.** A detection plan derived from the release paths, not from a catalogue:
IR where oxygen may be absent, methane heads high and low and in the trench,
breathing-zone oxygen wherever a person may be during any evolution, enrichment
monitoring at the LOX skid, two alarm levels each, and the distinction between a
bump test (proves the loop is alive) and a calibration (proves the number).

### F18 — No oxygen-deficiency analysis, and the inventory is comparable to the room

**Where.** Claims **C1** and **C12**, and the storage arrangement in §2.1.

**Why it matters.** The bay is 14 × 9 × 5 m ≈ **630 m³**. On the stated inventory,
and quoting the expansion ratios at their reference condition of liquid at NBP to
gas at 70 °F and 1 atm:

| Source | Liquid | Ratio | Gas at 70 °F |
|---|---|---|---|
| LOX run tank V-101 | 60 L | 861 : 1 | ≈ 52 m³ of oxygen |
| LCH₄ run tank V-201 | 40 L | 634 : 1 | ≈ 25 m³ of methane |
| LOX delivery dewar | 180 L | 861 : 1 | ≈ 155 m³ of oxygen |
| LNG delivery dewar | 160 L | 634 : 1 | ≈ 101 m³ of methane |
| GN₂ pack P-301 | 6 cylinders | — | order 10² m³ of nitrogen |

Read the last two columns against 630 m³. The methane inventory alone is about
**16 %** of the room volume against a lower flammable limit of **5 %**. The
nitrogen pack — on the ordinary assumption of six cylinders of roughly 50 L water
volume at 414 bar, which is an assumption the group must replace with the real
figure — is of order 120 m³, about 20 % of the room, which takes oxygen from 20.9 %
to roughly **17 %**: below OSHA's 19.5 % line, from the pressurant system alone,
with no propellant involved. The oxygen inventory is the opposite hazard in the
same room.

"The roll-up door is open" is not a ventilation analysis, and it is not even a
stable configuration — C13 says a fan heater is used in winter, which implies the
door is sometimes shut.

**What it violates.** The ODH method as published by Fermilab and reproduced by
Jefferson Lab and LBNL. It is not a calculation a student group performs: a
qualified ODH analysis authority does it and a second independent authority checks
it — JLab requires both plus a department head plus a safety reviewer, with stated
qualification criteria for the role. Monitoring, alarms and posting are verified in
place *before* the hazard arrives.

**Demand.** Room volume, penetrations and passive vent area, ventilation capacity
and whether it may be credited, the real inventory of every source, credible
release scenarios up to instantaneous venting of the largest, and site elevation —
handed to the person your institution designates. Then the ODH class, and the
controls that follow from it, in place before the first delivery.

### F19 — No hazard analysis has been performed, and no independent reviewer exists

**Where.** Claim **C16**.

**Why it matters.** A team meeting where the drawing is projected and everyone is
asked what could go wrong is a *what-if* session with the worst possible team
composition: nobody in the room has watched a vent stack ice over, so nobody
what-ifs a vent stack icing over. It is not a HAZOP, which divides the system into
nodes and forces deviations into existence with guide words — *no, more, less, as
well as, part of, reverse, other than* — and it is precisely "no flow", "reverse
flow" and "more pressure" on an isolated node that surface F5, F6 and F4. Two of
the eleven items raised remain open and the proposal does not say which.

And the reviewer must not be the designer, and must have standing to say no. Here
the drawing's author is the team lead, and the approver is the group's own faculty
advisor — not independent of the project, and by §2.1 without cryogenic hardware
experience. A comment is not a review.

**What it violates.** OSHA's process-safety methodology list — what-if, checklist,
what-if/checklist, HAZOP, FMEA, fault tree, or an appropriate equivalent, with the
method suited to the complexity of the process. IEC 61882:2016 is the HAZOP
application guide.

**Demand.** A HAZOP against a frozen, correct P&ID with the team and their
qualifications named and every finding tracked to disposition; an FMEA alongside it
for component failures; and the name of a reviewer who did not design the system,
understands cryogenics, and whose disapproval stops the test. If no such person
exists, that is the first finding and it precedes all the others.

### F20 — The drawing does not describe the system, and nobody checked it

**Where.** The title block — REV A, DRAWN J.O., **CHECKED —** — and claim **C19**:
HV-102 added and FT-107 moved since the drawing was issued.

**Why it matters.** The P&ID is the controlling document. It is what a hazard
analysis is performed against, what relief sizing is traceable to, where a
procedure's valve tags come from, and what a reviewer reads to decide whether every
isolatable volume has an unisolatable relief path. A drawing that no longer matches
the built system is not a paperwork problem; every analysis performed on it is now
an analysis of a system that does not exist. Note that one of the undrawn changes —
HV-102 — is Critical finding F2, added after the review that would have caught it.
That is the ordinary way this goes wrong: nobody was careless, the configuration
simply drifted away from the analysis.

**What could happen.** The extreme version is a matter of public record: a
university liquid-nitrogen cylinder whose relief valve and rupture disc had been
replaced with two brass plugs by unidentified people, undocumented, discovered only
by forensic examination after it burst.

**What it violates.** Configuration control as described in the practical
engineering section: the system you reviewed must be the system you test. Tagging
per ISA-5.1 (2022) is claimed in the title block and should be held to.

**Demand.** A released, revision-controlled P&ID with a revision history and a
named checker who is not the drafter; a walkdown record signed by someone who
physically traced the built system against the drawing; and a written change-control
mechanism defining what re-review each class of change triggers. "The drawing will
be updated before the test" is the wrong order of operations — the drawing is the
input to the review, not its output.

### F21 — There is no approval, the description given to EHS was wrong, and the AHJ has not been contacted

**Where.** Claims **C21**, **C18**, **C23**.

**Why it matters.** An email describing a LOX and liquid methane engine test as a
"cold-flow test rig" is not a request for approval and the reply is not one either
— and the description was materially wrong, which means the office that answered
was answering a different question. The fire marshal, campus or municipal, is the
authority having jurisdiction and is the one person whose objections are not
advisory; they have not been asked. Nobody has determined the occupancy
classification of the bay or whether the proposed inventory stays under the maximum
allowable quantity for that control area — exceed the threshold and the space
reclassifies to high-hazard occupancy, with heavier construction, separation,
ventilation and suppression attached. Emergency responders have not been briefed on
the inventory or its location, and "call 911" is not an emergency plan. And C23
proposes the first hot fire of a system with none of the above, in front of
spectators, at a public event.

**What it violates.** The MAQ and control-area mechanism of the International Fire
Code as adopted locally; NFPA 55 (2026 edition) for storage, use and handling
including separation and siting; 29 CFR 1910.104 for bulk oxygen siting and
separation from flammables; and the published institutional pattern that emergency
procedures for major installations are developed *and disseminated to emergency
response personnel*.

**Demand.** A correct written description of the fluids, the maximum inventory in
use, in storage and in transit, and the operations proposed, submitted to EHS and
to the AHJ; the occupancy and MAQ determination in writing from the people who own
it; a briefing to campus police, EHS and the fire department; and removal of the
open-day demonstration from the schedule, permanently — a first hot fire is never
a spectator event.

### F22 — No area classification, and unrated equipment inside the credible release envelope

**Where.** Claim **C13**; the extension lead, laptop and fan heater; IG-1's
automotive ignition coil; and the control cable in the trench (F9).

**Why it matters.** Methane creates a classified area; nitrogen does not, and
oxygen — being an oxidiser, not a fuel — does not create one by itself. But the
oxygen still matters, because **equipment certified for a Group D methane
atmosphere was tested in air**, and an oxygen-enriched atmosphere invalidates that
certification. "Effectively outdoors with the door open" is not a classification;
classification asks whether there is a source of release, how likely and how long,
and where the gas goes — and for cold methane the classified volume reaches *down
and sideways*, into the trench that carries the control cable.

**What could happen.** Ignition of a release by ordinary equipment nobody thought
of as an ignition source. Methane's MIE is about 0.28 mJ; a static discharge from a
person is around 10 mJ.

**What it violates.** OSHA 29 CFR 1910.307 → NFPA 70 (2026 edition) Articles
500–506 → NFPA 497 (2024 edition) as the recognised classification method. Methane
is NEC **Group D**, which is the cheap and widely available equipment class — this
is a solvable problem, not an expensive one.

**Demand.** An area classification study performed against the drawings,
identifying the divisions or zones around each credible release point; equipment
certified for Group D with an appropriate T-code inside them; wiring to Article 501
or 505 with conduit seals so a classified volume cannot communicate with an
unclassified one through the wiring; bonding and grounding provisions; and the
drawing maintained as the plant changes. Then remove everything unrated from the
classified volume — starting with the fan heater.

### F23 — Both drains discharge to a shared asphalt apron graded toward the trench

**Where.** HV-108 and HV-208 in Figure C.1; claim **C14**.

**Why it matters.** Two separate problems in one arrangement.

**Asphalt.** LOX plus a hydrocarbon plus an ignition source is immediate and
violent. NASA's slab testing produced no reaction from plummet impact on a wet
slab, but on a dry slab gave a violent reaction that appeared to propagate across
the whole surface, destroyed the fixture and threw fragments 48 m; laboratory
impact tests reacted on old asphalt at energies as low as 1 kg·m. Concrete never
reacted. LOX-soaked porous material stays hazardous long after the frost has gone.

**Shared low point.** Both drains, and the grading of the apron, bring a methane
pool and a LOX pool to the same place — and that place is the trench of F9. The
methalox question, asked in exactly these words in Module 08 §3 pass 4, is whether
any single volume can receive both a fuel and an oxidiser release. Here the answer
is yes, by design. NASA's NESC work on LO₂/LNG found the two liquids are
**miscible**, admitting condensed-phase detonation with significantly higher
overpressures than LO₂/LH₂ or LO₂/RP-1 — a hazard unlike the LOX/RP-1 precedent —
and framed its own assessment guidance as interim as recently as 2023.

**Demand.** A concrete disposal pad, graded *away* from the bay and the trench;
separate and separated disposal points for the two propellants; and a written
statement, traceable to the site plan, that no single volume can receive both a
fuel and an oxidiser release. Housekeeping on that pad is an engineering control,
not tidiness.

---

## Minor findings

*Should be fixed. None of these stops the project on its own; several of them are
how the Critical ones stay hidden.*

### F24 — The LOX fill hose and feed leg are bare, over the drain pad

**Where.** Figure C.1: the fill line has no vacuum jacket and the LOX feed leg is
drawn as a single line, while the fuel side is jacketed on both. Compare HV-204's
double line with HV-105's single one.

**Why it matters.** A bare line at 90 K is both a boiloff source and a condensation
surface. Any surface at LOX or LN₂ temperature open to humid air condenses oxygen
out of it: air's dew point at 1 atm is near 82 K and the first liquid is about
**53.5 mol % oxygen**, enriching further as nitrogen preferentially boils off. That
condensate drips onto whatever is underneath — which here is the asphalt apron of
F23. It also makes FT-107 less likely to see single-phase flow (F27).

**Demand.** Vacuum-jacketed line, or a documented heat-leak and condensate argument
with drip control onto a non-reactive surface. See Q7.

### F25 — PSV-209 is the right device with the wrong destination

**Where.** PSV-209, 200 psig, on the fuel feed leg — discharging into the common
header of F1.

**Why it matters.** Worth calling out separately because it is the one place the
group got the *concept* right: they identified an isolatable segment and relieved
it. Every relief must terminate somewhere the drawing shows, by a path that cannot
be isolated, **and** the destination must be acceptable. Getting the device right
and the destination wrong is a partial credit, not a pass — and this relief cannot
be closed until F1 is.

**Demand.** Re-route to a fuel-only vent header when F1 is fixed, and confirm the
set pressure against the segment's rating rather than against the tank's.

### F26 — Nothing on the drawing would show a plugging filter

**Where.** F-106 and F-206: pressure is measured at the tank ullage (PT-101,
PT-202) and at the chamber (PT-111), but nowhere between them.

**Why it matters.** A cryogenic filter is a trap for *frozen* contaminant — water,
CO₂ and hydrocarbons are harmless gases at ambient and solid particles at 90 K — so
it catches them and then plugs. A plugging filter shows as nothing at all on an
ullage transducer. It also isolates liquid downstream of itself, which is another
entry on F5's trapped-volume list.

**Demand.** Pressure measurement across each filter, or an instrumentation-coverage
argument for why the plug is detectable some other way and how fast.

### F27 — The flow measurements are only meaningful single-phase, and nothing establishes that

**Where.** FT-107 and FT-207.

**Why it matters.** A cryogen sits close to its boiling point and every meter works
by creating a pressure drop, so the measurement creates the condition that
invalidates it. A flow reading is valid only if the fluid is single-phase **at the
meter** — and on the oxidiser side the leg is bare (F24) and takes suction from a
tank whose level is read by eye. Turbine rotors over-speed in two-phase flow while
cavitation erodes them.

**Demand.** The reasoning that establishes single-phase flow at each meter under the
run conditions — subcooling margin from tank pressure, line heat leak, and pressure
drop to the meter — or an acknowledgement in the data plan that the numbers are
indicative.

### F28 — Ball-valve body cavities and vented-ball orientation are not addressed

**Where.** HV-105, HV-107, HV-204, HV-207, HV-108, HV-208, and claim **C6**'s
PTFE-seated ball valves.

**Why it matters.** When a floating ball valve closes, liquid is sealed in the body
cavity, connected to neither line, and it warms. The fix is a relief hole through
one wall of the ball, which caps cavity pressure at line pressure and makes the
valve **unidirectional**: the hole faces upstream, because venting downstream lifts
the ball off its seat and opens a permanent leak path. Nothing on the drawing says
whether these balls are vented, and nothing shows a flow arrow — so nobody can
check an arrow against the direction each valve must *hold* pressure. Separately,
cryogenic valves need extended bonnets and must be installed stem-vertical, because
the insulating vapour column only works while it can stratify.

**Demand.** Valve datasheets: vented ball or not, direction of the vent, bonnet
extension per MSS SP-134, seat and seal materials, and installed orientation marked
on the drawing.

### F29 — Nothing addresses the vacuum annulus of two surplus dewars

**Where.** V-101 and V-201; claim **C2**.

**Why it matters.** The annulus is a sealed volume beside a cryogen. An inner-vessel
leak fills it with boiling liquid and bursts a jacket built only to hold out one
atmosphere, so the annulus needs its own relief — usually in the pump-out port,
which means a missing pump-out plug may mean the annulus already vented once. The
relief rule extends explicitly to vacuum spaces in contact with a cryogen. On
second-hand vessels of unknown history, the vacuum condition is also unknown, and a
degrading jacket shows only as a rising boiloff rate over hours — and only if
somebody trends it. Ice on the outer casing is the visible sign, and it appears
after the fact.

**Demand.** Evidence that each annulus has a relief and an accessible pump-out port;
a vacuum measurement or a boiloff-rate baseline recorded before the first
propellant load, so a change can be seen; and this treated as an input to F3's
loss-of-vacuum sizing case.

### F30 — Training is generic, and the knowledge leaves in May

**Where.** Claim **C17**.

**Why it matters.** An online laboratory-safety module and a video are not evidence
of competence on specific hardware. The published pattern is hands-on training on
the **specific** system, covering normal operation and emergency shutdown,
documented and retained, with **more than one** person able to shut the system down
so that a single absence neither stops the work nor tempts someone untrained into
it. Here the designer, the only person who fully understands the configuration,
graduates in five months — one month before the drawing is due to be corrected
(F20). Annual turnover is the defining feature of a student group and the thing
that most reliably destroys a safety programme.

**Demand.** A training matrix — person, role, what they were trained on, by whom,
when, how assessed, when it expires — and a documented handover mechanism:
configuration-controlled drawings, a design and analysis package that stands on its
own, written procedures, and a rule about what re-review a change of operators
triggers. Also an honest answer about whether operating authority is held by the
group or by the advisor.

### F31 — The dominant release mode is the activity the design makes people do by hand

**Where.** Claim **C22**, and QD-1.

**Why it matters.** In national-lab failure-rate data a cryogenic line is given a
rupture rate near **10⁻⁷ per hour**, while a human-in-the-loop transfer connection
is **10⁻² to 10⁻³ per demand**. That is four to five orders of magnitude. The
hardware is not the risky part; the connect–disconnect is — and the design puts two
people at that connection, at the stand, inside the bay, for every fill. This is
also the natural subject of a job hazard analysis, the only method in the family
that looks at the relationship between the worker, the task, the tools and the
environment, and whose prioritisation criteria explicitly include jobs able to
cause severe injury *with no accident history*.

**Demand.** A job hazard analysis of the fill evolution, and a design change that
reduces the number of demands and the number of people exposed to each.

### F32 — The visible-cloud assumption, and what the group will believe during a release

**Where.** Implicit throughout, and made concrete by C15's plan to have people at
the stand watching.

**Why it matters.** Worth stating because the group's whole detection and response
philosophy relies on people seeing things. The white cloud over a cryogenic release
is condensed atmospheric water — fog in air the release has chilled — and every one
of these fluids is colourless. The hazardous envelope is a different shape from the
visible one and neither reliably contains the other: dense cold vapour extends
beyond the fog and downward. Vision is not an instrument, and neither is smell —
rocket-grade methane is not odorised, and inert gases announce nothing at all,
because the body has no oxygen sensor.

**Demand.** Nothing hardware-specific; this belongs in training content and in the
emergency plan. But if any control in the proposal reduces to "we will see it", it
is not a control.

---

## The items that are deliberately ambiguous or facility-dependent

These are **questions, not defects.** A reviewer who writes them up as defects is
overreaching, and will be right to be argued with; a reviewer who does not raise
them at all has missed something. The distinction matters more than it looks: a
review's credibility is spent every time it asserts something it cannot support,
and the findings above are too important to be discredited by the ones below.

**Q1 — The set pressures themselves.** 175 psig may well be correct. Nothing in
Figure C.1 lets anyone judge it, because the judgement needs the vessel's MAWP and
the relief calculation. Ask for the basis; do not write "175 psig is wrong".

**Q2 — Stack height, orientation and separation.** These depend on the site, the
terrain, the adjacent structures, the prevailing wind and the AHJ's judgement. The
defect in F1 is the *shared header*; the stack's dimensions are a question.

**Q3 — Where the barricade goes.** The required standoff is a function of quantity
and site and comes from a consequence or explosive-siting analysis. F8 is a defect
because people are inside the envelope by design and because no analysis exists —
not because 8 m is the wrong number. Nobody reviewing a drawing can supply the
right one.

**Q4 — Whether the trench is a permit-required confined space.** Decided by the
facility's confined-space programme against OSHA 29 CFR 1910.146, not by you. Ask
for the determination, and note that the classification follows the *potential* to
contain a hazardous atmosphere, not today's reading.

**Q5 — The ODH class of the bay.** An output of a qualified analysis authority's
work, independently checked. F18 is a defect because no analysis has been requested
and the inventory is comparable to the room volume; the class is not yours to
assign.

**Q6 — Which CGA S-1 part applies.** S-1.2 (11th ed., 2024) covers portable
containers, S-1.3 (10th ed., 2024) stationary storage, S-1.1 (18th ed., 2026)
cylinders. Which applies depends on how these vessels are classified once they are
fixed to a stand, and the answer changes the sizing basis. This is a genuinely open
question and a good one to ask out loud.

**Q7 — Whether the LOX legs must be vacuum-jacketed.** VJ line is the default for
anything long, but a short bare run with controlled drip onto concrete may be
perfectly acceptable. Ask for the heat-leak and condensate reasoning rather than
mandating a jacket.

**Q8 — Occupancy classification and maximum allowable quantity.** Decided by the
adopted code edition, the building's existing control areas and the quantities —
by the AHJ, not by the group and not by the reviewer. The thresholds are
copyrighted, edition-dependent and modified by local amendment; a number from the
wrong edition is worse than no number.

**Q9 — Whether the inventory could simply be smaller.** Inventory is the only
genuinely inherent control available to a small group, and it shrinks the standoff,
the ODH class, the occupancy problem and the permit question simultaneously. "Could
this be done with 20 L?" is a design question, not a finding — but it is the most
valuable question in the whole review, and it costs the group nothing to answer.

**Q10 — Nitrogen versus helium as pressurant.** F16 is a defect at 250 psig because
the saturation data say nitrogen will condense against both ullages at that
pressure. It is not a prohibition on nitrogen as such — at low enough ullage
pressure, or with a diffuser arrangement and an analysis behind it, the answer may
be different. Ask for the ullage thermal analysis; do not simply write "use
helium".

One more, worth naming because readers often raise it: **catalytic bead detectors
are not a defect.** They are cheap, rugged and entirely appropriate in air. The
finding in F17 is the specific placement of one inside an inert enclosure, plus
poisoning by silicones, sulphur and halogens as a failure mode that reports *safe*.
Technology choice follows placement, not the other way round.

---

## What the group got right

A review that lists only defects teaches the group that the exercise is adversarial
and teaches the reviewer nothing about calibration. Six things in this proposal are
correct, and a good review says so — partly because it is true, and partly because
the correct half of a mirrored design is the evidence that convicts the other half.

- **PSV-209 exists.** They found an isolatable segment on the fuel side and relieved
  it. That the identical segment on the oxidiser side has nothing is what makes F5
  findable from the drawing alone.
- **MFV-210 fails closed and FV-203 fails open.** Both correct, and both the exact
  opposite of their oxidiser-side counterparts — which is how you know F7 is an
  oversight rather than a philosophy.
- **The methane fill line is vacuum-jacketed.** Correct, and the contrast with the
  bare oxidiser line is the tell for F24.
- **Filters upstream of the main valves.** Right idea, and the source of F26's
  question rather than a defect in itself.
- **Brass for the quick-disconnect body and PTFE for the seats.** Both good material
  classes: brass is face-centred cubic so it stays ductile cold, and it resists
  ignition to the top of the promoted-ignition test range. The problem at QD-1 is
  the grease and the geometry, not the metal.
- **Pneumatic main valves commanded remotely.** The architecture is right; F8 is
  about everything else that stayed manual.

---

## Scoring guide

Count the findings you wrote, not the ones you nodded at while reading.

**Fewer than 8.** You are reading the picture, not reviewing it. Almost certainly
you found the combined vent stack, the two fail positions and possibly the block
valve on the relief — the three that announce themselves — and then stopped,
because at that point the drawing "makes sense". That is exactly the failure mode
the seven-lens method exists to prevent: a single read finds the problems that are
*visible*, and a lens finds the problems that are *absent*. Go back to Module 08 §3
and run pass 1 and pass 2 alone, writing down every isolated volume and every
relief destination before you allow yourself to think about anything else.

**8 to 11.** Solid drawing literacy. This is the most common landing place, and the
diagnostic is nearly always the same: check how many of your findings cite a claim
number rather than a tag. If the answer is one or two, you reviewed the drawing and
skimmed the text — and roughly a third of what is wrong with this proposal was
never drawn, because it is a record nobody kept, an analysis nobody requested or an
approval nobody gave. A real review is at least half paperwork, and the paperwork
findings are frequently the ones that stop the project.

**12 to 14.** A competent preliminary review. You are running most of the lenses and
reading the text as evidence. The gap at this level is usually pass 6 —
instrumentation coverage — because it is the only lens that asks about things the
drawing does not show at all: what would *tell* anyone that the failure you just
imagined is happening, and how fast. F26, F27 and the detection half of F17 live
there.

**15 or more.** You are doing the job. At this point the count matters less than
the quality of two things. First, **did each finding carry a mechanism and a
number?** "Combined vent header" is a note; "combined vent header, and methane's
range in oxygen is 5.15–60.5 % against 5–15 % in air, so the mixture inside that
pipe is ignitable across most of its composition history" is a finding. Second,
**did each finding carry a demand?** A finding without a specific question,
calculation or record attached is an opinion, and it will be argued with rather
than closed.

**Above about 20**, you should also be checking yourself for the opposite error.
Look at your list and ask which entries you could not defend against a competent
push-back — and whether any of them belong in the Q1–Q10 group instead. Over-calling
is not a lesser sin than under-calling; it is how a review loses the authority it
needs for the findings that matter.

### What should have been obvious by now

If you missed any of these, the corresponding module did not stick, and it is worth
going back rather than reading on:

| Finding | Module |
|---|---|
| Combined fuel and oxidiser vent header (F1) | 03 §4, 07 §8, 08 §2.6 |
| Block valve isolating a relief (F2) | 05 §2.4, 08 §3 pass 2 |
| Trapped LOX between two closed valves and a check valve (F5) | 05 §2.3, 08 §2.4 |
| "Check valves prevent cross-flow" (F6) | 07 §7, 08 §2.5 |
| Inverted fail-safe positions (F7) | 03 §3, 08 §7 |
| Roof-only methane detection (F17) | 02 §6, 07 §5 |
| Set pressures copied from another stand (F10) | 03 §4, and every "facility-specific" note in the course |
| No hazard analysis and no independent reviewer (F19) | practical-engineering §2 and §4 |
| LOX drained onto asphalt (F23) | 05 §7, 07 §8 |

### What is genuinely subtle

Nobody should feel bad about missing these, and finding them is the difference
between reading a drawing and reviewing one:

- **AT-402, a catalytic bead inside a nitrogen-purged box (F17).** It reads zero
  because it has no oxygen to burn the gas with, and on the panel that is
  indistinguishable from a clean atmosphere. This is the single most quietly
  dangerous item in the proposal, because it is a control that reports success while
  doing nothing.
- **Nitrogen condensing against both ullages at 250 psig (F16).** It requires
  carrying two numbers — 3.6 bar at 90 K, 15.6 bar at 111.7 K — and noticing that a
  perfectly ordinary regulator setting is above both.
- **No relief downstream of the regulator (F4).** Easy to miss because the drawing
  shows a regulator and one instinctively credits it. Regulators fail open.
- **The dead leg between QD-1 and HV-105, plus the grease (F15).** Three separate
  facts have to meet: the fast-opening valve, the dead end, and a hydrocarbon film
  in exactly the position where the compression peak lands.
- **PSV-209: right device, wrong destination (F25).** Requires you to keep tracing
  after you have found a relief.
- **Carbon-steel bolts in aluminium flanges (F14).** Two independent problems in one
  fastener — brittleness and the wrong sign of contraction differential — and the
  second is invisible without the integrated ΔL/L numbers.
- **The asymmetry itself.** The most efficient way into this drawing is to notice
  that the two feed legs are mirror images with four differences, and to ask about
  each difference. Reviewers who did that found F5, F7, F24 and F25 in one pass.
- **The vent plume beside the air-handling intake (F11).** Discharge locations are
  easy to read past because they are written as an annotation rather than drawn as a
  component.
- **Control cable in the trench (F9, F22).** It appears on the drawing as a dashed
  line, which the eye reads as information rather than as hardware.
- **No oxygen-enrichment monitoring at all (F17).** Missing things are harder to see
  than wrong things, and this one is missing from a system whose whole left-hand
  side is an oxygen system.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
Notice how many of these findings cost nothing to fix at this stage and would have
been very expensive or impossible to fix later — a vent header split, a trench
avoided, a bay chosen differently, an inventory halved. That is the entire argument
for reviewing a drawing rather than a stand. Every one of the Critical findings
above was available for the price of an afternoon and seven passes.
</div>

---

## A closing note on what you have just done

You have reviewed a fictional system, which is the easy version: nothing was at
stake, nobody argued back, and the answers were written down in advance by someone
who knew where they were hidden.

The real version has a group in the room who have worked on this for a year, an
advisor who signed it, a schedule, and a reviewer — you — who has to say no in a
way that leaves the project alive. That is why every finding above is a demand for
evidence rather than a verdict. "This is unsafe" ends a conversation. "Every
isolatable volume needs a relief path that cannot itself be isolated; here is the
segment between HV-107 and MOV-110; show me its relief and where it discharges" is
a conversation, and it is one the group can win by doing the work.

And the boundary of this course still holds. Finding thirty-one problems in
Figure C.1 does not qualify you to review a real stand, and reviewing one does not
qualify you to operate it. Bring the review skill; let the procedures, the
approvals and the trained supervision come from the institution that owns the
consequences.
