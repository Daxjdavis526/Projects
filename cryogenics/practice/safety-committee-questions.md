# What the Safety Committee Is Going to Ask Me

*Practice section. Prerequisite: Modules 01–08 and the practical engineering section.*

At some point a group that wants to run liquid oxygen and liquid methane has to sit
in a room with people who can stop them. Understanding who those people are, and what
each of them is actually frightened of, converts that meeting from an ambush into a
technical conversation.

**The dean, or whoever chairs the committee,** is thinking about a student dying on
university property, and about the press conference afterwards. Their question behind
every question is: *if this goes wrong, will the investigation find that we approved
something no competent person had reviewed?*

**The EHS office** is thinking about specific, named hazards with specific, named
programmes attached — pressure systems, oxygen deficiency, flammable gases, confined
spaces, oxidiser separation. They are not hostile to your project; they are trying to
work out which of their existing programmes it falls into, and whether it fits at
all. They have almost certainly never been asked about a rocket engine before, which
makes them cautious, and they will be reassured by the same things that reassure any
engineer: real drawings, real analysis, real standards.

**The lab or facility manager** is thinking about everyone else in the building. Your
inventory changes their occupancy classification, their ventilation adequacy, their
egress, and the risk to the graduate student in the next room who never agreed to any
of this.

**The fire marshal** — campus or municipal, and they are the authority having
jurisdiction — is thinking about the code edition they have adopted, about quantity
thresholds and separation distances, and about what happens to the firefighters who
respond. They are the one person in the room whose objections are not advisory.

**Risk management, insurance and legal** are thinking about whether the institution
is exposed, whether the activity is covered at all, and whether anyone in the room
can demonstrate competence rather than enthusiasm. Note that this last route is
weakly documented in published university policy — expect it and ask about it early,
rather than assuming a published rule exists.

What unites all five is that they are trying to answer one question: *does this group
know what it does not know?* The questions below are the ones a competent engineer
should have already asked themselves. If they make you uncomfortable, the discomfort
is diagnostic, and it is far better felt now than in the meeting.

<div class="box"><span class="lbl">Worth knowing</span>
Nearly every answer below is <b>facility-specific, jurisdiction-specific or
hardware-specific</b>. That is not evasion — it is the substance. A number quoted from
the wrong code edition, or a relief set pressure carried over from someone else's
stand, is worse than admitting you do not yet know. What follows teaches you what the
<i>evidence</i> looks like. It cannot supply the evidence, and neither can any other
document that has not seen your hardware.
</div>

---

## A. People and competence

### 1. "Who on this team has actually done this before?"

**Why they are asking.** They are picturing a group whose entire cryogenic experience
is reading and simulation, standing next to a pressurised vessel for the first time
with nobody present who can recognise that something is going wrong. The single most
common finding after student-project accidents is that no experienced person was
there.

**What you would need.** Named individuals, with what they did, where, under whose
supervision, and for how long — not "several members have relevant coursework." A
named faculty or staff advisor with cryogenic or propulsion experience who will be
physically present, and a statement of what they are actually undertaking to do.
Whether your institution requires a specific supervisor qualification is a local
question, determined by your EHS office's pressure-systems and cryogen programmes.

### 2. "What training have your operators had, on this system, and where is it recorded?"

**Why they are asking.** They are picturing generic online safety training being
offered as evidence of competence on a specific piece of hardware. Published
institutional practice is unambiguous that this is not sufficient: MIT's
pressure-vessel programme requires hands-on training in safe operation and emergency
shutdown of the *specific* system, with records retained `[MIT-EHS-0082]`.

**What you would need.** A training matrix: person, role, what they were trained on,
by whom, when, how it was assessed, and when it expires. Evidence that more than one
person can shut the system down — MIT requires at least one trained person besides
the system owner `[MIT-EHS-0082]`. The content of that training is determined by your
hardware and your procedures, so it cannot exist until those do.

### 3. "What happens to all of this when the seniors graduate?"

**Why they are asking.** Annual turnover is the defining feature of a student group
and the thing that most reliably destroys a safety programme. They are picturing a
system operated in year three by people who were not present for any of its reviews,
following procedures whose reasoning nobody remembers.

**What you would need.** A documented handover mechanism: configuration-controlled
drawings, a design and analysis package that stands on its own, written procedures,
and a rule about what re-review a change of operators triggers. Also an honest answer
on whether operating authority is held by the group or by the advisor. What the
institution requires here is local policy, and it is worth asking EHS directly rather
than proposing your own scheme.

---

## B. The hardware itself

### 4. "Is this a registered pressure system, and who reviewed the design?"

**Why they are asking.** Many institutions run a formal pressure-safety programme with
a registration threshold, and they are picturing an unregistered system that nobody
in the EHS office knew existed. MIT, as a published example, treats anything capable
of exceeding 15 psi as a pressure vessel system and tiers requirements by pressure and
hazard, with systems above 500 psi getting the full set regardless of contents
`[MIT-EHS-0082]`.

**What you would need.** Your institution's pressure-system policy — whether there is
a master list, what the registration thresholds are, and what review the tier you fall
into demands. Then the design evidence: vessel documentation, design code
(ASME BPVC Section VIII Division 1, 2025 edition, where applicable), piping design to
ASME B31.3 (2024 edition), and the name of the qualified person who reviewed it. The
thresholds, tiers and reviewer are entirely institution-specific.

### 5. "Show me the P&ID. Does it match what is built?"

**Why they are asking.** They may not read a P&ID fluently, but they know that
analysis performed on a drawing is only valid if the drawing is true. They are
picturing the Texas case: a university nitrogen dewar whose relief valve and rupture
disc had been replaced with brass plugs by unidentified people, undocumented,
discovered only by forensic examination after it burst at over 1,000 psi
`[TX-FIRE-MARSHAL-2006]`.

**What you would need.** A released, revision-controlled P&ID with ISA-5.1 (2022)
tagging `[ISA-5.1]`, a walkdown record signed by someone who physically traced the
system against it, and a change-control mechanism showing how modifications get back
onto the drawing. This is one of the few questions whose answer does not depend on
your jurisdiction — but it depends completely on your hardware, and it is the question
you are most likely to fail.

### 6. "Every volume that can be isolated — what relieves it, and where does that go?"

**Why they are asking.** This is the trapped-cryogen question, and a technically
literate reviewer will go straight to it. The governing rule is that every isolatable
part of the system which could conceivably contain cryogenic liquid or gas must have
its own pressure relief `[LBNL-PUB3000-29]`. They are picturing Williams Olefins: a
correctly sized relief device isolated from the vessel it protected, two dead
`[CSB-WILLIAMS-OLEFINS]`.

**What you would need.** A relief schedule tied to the P&ID: every isolatable segment,
its relief device, set pressure, sizing case and discharge destination — plus evidence
that no relief path can itself be blocked by a valve. Sizing must be traceable to the
applicable code: ASME BPVC Section VIII Division 1 (2025) for accumulation limits, and
the right part of the CGA S-1 series for the container type (S-1.1 cylinders, 18th ed.
August 2026; S-1.2 portable containers, 11th ed. September 2024; S-1.3 stationary
storage, 10th ed. September 2024). **Every set pressure and every device size is
specific to your vessels and your credible heat inputs.** No generic answer exists,
and a set pressure copied from another group's stand is a finding, not an answer.

### 7. "Is the oxygen side actually clean, and how do you know?"

**Why they are asking.** They may or may not know the ignition mechanisms, but they
know that contamination in oxygen systems starts fires, and they are picturing an
assurance in place of a record. Cleaning is required for all surfaces contacting fluid
above 23.5 % oxygen `[CGA-G-4.1]`.

**What you would need.** A specified cleanliness level with the standard that defines
it — ASTM G93/G93M-25 for levels and verification methods `[ASTM-G93]`, CGA G-4.1 (7th
ed., August 2018) as the cleaning requirement invoked on the purchase order — and then
the evidence trail: who cleaned each part, quantitative non-volatile residue and
particle results, packaging and preservation, and what event triggers re-cleaning.
Separately, an oxygen compatibility assessment covering worst-case conditions,
material flammability, ignition mechanisms, kindling chain and reaction effect, with a
hazard control table `[NASA-TM-2007-213740]`, supported by the materials-selection
guides (ASTM G88-21 for system design, G63-15(2023) for nonmetals, G94-22 for metals).
The level appropriate to your system depends on your pressures, velocities and
geometry, and is a review output.

---

## C. The fluids and quantities

### 8. "Exactly how much LOX and how much methane, on site, at once?"

**Why they are asking.** This one number drives almost everything else they care
about: occupancy classification, separation distance, permit requirements, ODH class
and emergency response. They are picturing a group that has not decided, or that will
quietly scale up after approval.

**What you would need.** A stated maximum inventory of each fluid — in use, in
storage, and in transit — with the basis for it, plus a commitment that exceeding it
re-opens the approval. Fire codes work on maximum allowable quantity per control area;
exceed the threshold for a hazard class and the space reclassifies to high-hazard
occupancy with much heavier construction, separation, ventilation and suppression
requirements `[ICC-IFC-MAQ]`. **The thresholds themselves are copyrighted,
edition-dependent and modified by local amendment.** Get them from the edition your
AHJ has actually adopted; a number from the wrong edition is worse than no number.

### 9. "Where is it stored, and how far is it from everything else?"

**Why they are asking.** Separation is the control that works when everything else
fails, and they are picturing a LOX dewar parked next to a fuel drum in a shared bay.
Oxidiser and fuel separation, and separation from occupied buildings and property
lines, are code matters, not preferences.

**What you would need.** A site plan with distances marked, and the code basis for
each distance: NFPA 55 (2026 edition) for storage, use and handling of compressed
gases and cryogenic fluids including separation and siting `[NFPA-55]`; 29 CFR
1910.104 for bulk oxygen system siting and separation from flammables. **The required
distances depend on quantity, container type, construction and the adopted edition,
and are confirmed by the AHJ, not calculated by you from a textbook.**

### 10. "Who supplies it, how does it get here, and where does the empty go?"

**Why they are asking.** Transport and handling are where the human-in-the-loop
failures live. In national-lab failure-rate data a person making or breaking a
cryogenic connection is four to five orders of magnitude more likely to release
cryogen than a pipe is to rupture `[JLAB-ODH]`. They are also picturing a dewar in a
passenger lift, which several universities prohibit outright `[UNIV-EHS-OTHER]`.

**What you would need.** The supplier and delivery arrangement, the container type and
its rating, the route from the delivery point to the stand, and the campus rules that
apply to that route — lifts, corridors, loading docks. If anything moves by road under
your control, the DOT framework applies (49 CFR 173.316 and 173.318 for cryogens in
cylinders and cargo tanks; 173.320 is the exception most laboratories live under for
low-pressure atmospheric-gas dewars). The applicable rules depend on the container,
the fluid and who is driving.

### 11. "What happens if it all leaks out at once, indoors?"

**Why they are asking.** This is the oxygen-deficiency question, and it is the one
most likely to be asked by an EHS professional who has seen it before. Inert
asphyxiation gives no warning — the body has no oxygen sensor — and roughly one in ten
of the fatalities in the CSB's decade-long review were would-be rescuers
`[CSB-NITROGEN]`.

**What you would need.** An **ODH analysis**, which is a quantitative product: room
volume, ventilation rate and whether it may be credited, full inventory and flow
rates, credible release scenarios, event rates, ease of egress, and site elevation —
producing a fatality-rate figure of merit and an ODH class that then drives monitoring,
alarms, posting, access control and PPE `[JLAB-ODH]` `[LBNL-PUB3000-29]`. **A student
group cannot self-certify this.** It is performed by a designated, qualified analysis
authority and independently approved; Jefferson Lab requires a second independent
authority plus a department head plus a safety reviewer, with stated qualification
criteria for the role `[JLAB-ODH]`. **The class of your specific space is a
facility-specific answer that depends on volume, ventilation and inventory, and no
course can supply it.** What you can supply is the request, the inventory data and the
room drawings.

---

## D. The facility

### 12. "What is the occupancy classification of this space, and does this change it?"

**Why they are asking.** The lab manager and the fire marshal both care, for different
reasons. They are picturing a building whose fire protection, egress and construction
were designed for a classification that your inventory has just invalidated.

**What you would need.** The current classification and control-area configuration of
the space from facilities, the quantities you propose, and a determination — by the
AHJ, not by you — of whether you stay under the maximum allowable quantity for that
control area `[ICC-IFC-MAQ]`. **This is decided by your adopted code edition, your
building's existing control areas and your quantities.** It is the single most common
reason a proposal is refused in the space originally requested and approved somewhere
else instead.

### 13. "Are there any pits, trenches or low points, and are they confined spaces?"

**Why they are asking.** Cold vapour sinks and stays low while it is cold, and a
trench under a test stand is exactly where it collects. Under OSHA 29 CFR 1910.146 a
space is permit-required if it *has the potential to contain* a hazardous atmosphere,
including oxygen below 19.5 % or above 23.5 % — the classification follows the
potential, not today's reading `[OSHA-1910.146]`.

**What you would need.** A drawing showing every below-grade or low-lying volume near
the system, your facility's confined-space inventory and programme, and a
determination of whether these spaces are permit-required. **Whether a given pit at a
given facility is a permit space is decided by that facility's confined-space
programme, not by you and not by this course.** Note that methane vapour is heavy
until it warms roughly 53 K above its boiling point, so "methane is lighter than air"
does not exempt a trench.

### 14. "Where does every vent and relief discharge to, and who is standing there?"

**Why they are asking.** They are picturing a relief valve that does its job perfectly
and dumps cold oxidiser or fuel into an occupied space, a walkway, or an air intake.

**What you would need.** Vent and relief routing shown on the P&ID all the way to
atmosphere, with discharge locations on the site plan; separate stacks for fuel,
oxidiser and inert, sited so two plumes cannot meet; evidence that discharge cannot
enter a building intake or reduce room oxygen below 19.5 % `[SLAC-CH36]`; and a note on
reaction force, because a relieving stack is a nozzle. **Stack heights, orientations
and separations are site-specific**, depending on terrain, adjacent structures,
prevailing wind and the AHJ's judgement.

### 15. "Is the electrical equipment in there rated for a flammable atmosphere?"

**Why they are asking.** Methane's minimum ignition energy in air is around 0.28 mJ,
and a static discharge from a person is around 10 mJ. They are picturing an ordinary
extension lead in a space where a flammable release is credible.

**What you would need.** An area classification study identifying which zones or
divisions exist around credible release points, with the equipment in each zone rated
accordingly: NFPA 70 (National Electrical Code, 2026 edition) Articles 500–506, with
NFPA 497 (2024 edition) as the recommended practice for classifying the locations
`[NFPA-70]` `[NFPA-497]`. Plus bonding and grounding provisions. **The extent of each
classified zone depends on your release sources, ventilation and geometry**, and the
study is a design product performed against your drawings.

---

## E. Hazard analysis and review

### 16. "What formal hazard analysis have you done, by what method, and who reviewed it?"

**Why they are asking.** They want to know whether hazards were *systematically*
sought or merely thought about. OSHA's process safety management standard names the
acceptable methodologies — what-if, checklist, what-if/checklist, HAZOP, FMEA, fault
tree, or an appropriate equivalent — and requires the method to suit the complexity of
the process `[OSHA-3132]`.

**What you would need.** The completed study itself, with method named, nodes or
components covered, the team and their qualifications, and every finding tracked to
disposition. For a flow system, a HAZOP against a frozen P&ID using the standard guide
words is the expected form (IEC 61882:2016 is the application guide); component
failures usually warrant an FMEA alongside it. Crucially, the name of a reviewer **who
did not design the system and who can say no** — that is the structural requirement,
and whether your institution supplies such a person is a local question worth asking
before you need one.

### 17. "What is your single worst credible accident, and what happens to the people?"

**Why they are asking.** This is the question that separates groups who have thought
about consequences from groups who have thought about components. They are picturing
being unable to describe, at a subsequent inquiry, what the group believed the worst
case was.

**What you would need.** A defined top event — vessel rupture, coincident fuel and
oxidiser release, unrelieved overpressure of a trapped segment — analysed
deductively (fault tree) to its causes and forward to its consequences: overpressure,
fragments, thermal radiation, oxygen deficiency. Then the standoff that follows from
it, and evidence that no person is inside that standoff during the operation. **The
consequence distances depend on your quantities, your geometry and your site**, and
this is exactly the analysis a reviewer will expect to see done by, or checked by,
someone qualified.

### 18. "Which of your safety controls depend on someone doing the right thing?"

**Why they are asking.** This is the independence question in plain language. They are
picturing a stack of protections that all fail together — because they all depend on
one person, one program, or one power supply.

**What you would need.** A layers-of-protection view of your worst scenarios naming
each protection layer and what it depends on, distinguishing physical, passive
controls from administrative ones. The governing precedent is the CSB's finding that
relying on a locked-open block valve is less reliable than installing a relief valve,
"due to the possibility of human implementation errors" `[CSB-WILLIAMS-OLEFINS]`. What
counts as adequate for your system is a review judgement, but *identifying* which
controls are administrative is entirely within your power and should already be done.

---

## F. Operations and emergencies

### 19. "Walk me through what happens when it goes wrong at 2 a.m. — who do you call?"

**Why they are asking.** They are picturing emergency responders arriving at a
cryogenic oxidiser fire with no idea what is in the building. MIT requires emergency
procedures for major pressure-vessel installations to be developed and *disseminated
to emergency response personnel* `[MIT-EHS-0082]`; Jefferson Lab requires ODH signage,
alarms and safeguards verified in place *before* the hazard is introduced
`[JLAB-ODH]`.

**What you would need.** A written emergency plan covering the credible emergencies,
the notification chain, and evidence that campus police, EHS and the fire department
have been briefed on the inventory and its location. Also a cryogenic first-response
protocol tied to your own emergency numbers and occupational-medicine route — the
injury is masked at the time it happens, because tissue goes numb, and any suspected
cold injury needs professional evaluation `[LBNL-PUB3000-29]`. **The numbers, the
receiving facility and the notification chain are entirely local.**

### 20. "Nobody is near this thing when it runs — prove it."

**Why they are asking.** This is the last question and the most important one, because
distance is the only control that works against fragments, blast and a sudden
oxygen-deficient atmosphere at once, and it works whether or not anybody did the right
thing. PPE is explicitly the last line of defence and a weak one `[LBNL-PUB3000-29]`.

**What you would need.** The exclusion zone drawn on a site plan with its basis, the
barricade or barrier and what it is designed to stop, the remote-operation
architecture — what is commanded from behind the barrier, what happens on loss of
power, air or comms — and the access control that keeps people out during the
operation. Also the list of manual actions that survive in your procedure, each with
a justification for why it could not be designed out. **The required standoff is a
function of your quantities and your site and is determined by an explosive-siting or
consequence analysis**, and the location of the barricade is not a course answer.

---

## How to walk into that meeting well

**Bring the package, not the pitch.** A released P&ID with a walkdown record. The
relief schedule with sizing basis and discharge routing. The materials and cleanliness
evidence. The completed hazard analysis with findings and dispositions. The stated
maximum inventory. A site plan with distances, vent discharges and the exclusion zone.
A training matrix with names. A one-page emergency plan. The name of your independent
reviewer.

**Do the cheap things first, and early.** Talk to EHS months before you need approval,
and let them tell you which of their programmes you fall into — you will discover
requirements you did not know existed and, occasionally, that a route already exists.
Find out who the AHJ is and which code edition they have adopted, because the answer
determines several of the questions above. Minimise the inventory: it is the only
inherent control available to you, and it shrinks the standoff, the ODH class, the
occupancy problem and the permit question simultaneously.

**Answer "I don't know yet" properly.** "I don't know" is a bad answer. "That depends
on the ODH analysis, which we have asked EHS to scope, and we have the room volume,
ventilation data and inventory ready for it" is an excellent one. The committee is
assessing whether you know the shape of the answer and who owns it — not whether you
can recite a number.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
<b>"We read a course" is not an answer to a single question on this page.</b> This
course was written to let you hold the conversation intelligently — to know what a
HAZOP is, why a relief cannot be isolated, what an ODH class means and which answers
are facility-specific. It does not make you trained, it does not make you qualified,
and it cannot substitute for a drawing, an analysis, an approval or a person with
experience standing next to you. Every question above is answered by evidence about
<i>your</i> hardware at <i>your</i> facility under <i>your</i> jurisdiction. Go and
build that evidence; the committee is not the obstacle to it, they are the reason it
exists.
</div>
