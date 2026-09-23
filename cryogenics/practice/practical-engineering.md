# How Cryogenic Operations Actually Get Developed

*Practice section. Roughly 25 minutes. Prerequisite: Modules 01–08.*

Module 08 taught you to look at a drawing and see what is missing. This section is
about the machinery around that skill: the reviews, analyses, documents and gates
that turn "we would like to run a methalox engine" into an operation an institution
is willing to own. There is no procedure here, as there is none anywhere in this
course — only a description of *what these things are and what each accomplishes*, so
that when someone hands you a HAZOP worksheet or asks whether your CDR actions are
closed, you know what is being asked and why it exists.

## 1. The shape of the thing

Development of a hazardous operation is a sequence of gates, and the gates are
event-based rather than calendar-based: you hold the review when the work is ready,
and each review has entrance criteria determining whether you may hold it at all
(NASA NPR 7123.1D, Appendix G). The point is that nothing is carried forward
silently. Open items either close or acquire a written closure plan with an owner.

<figure>
<svg viewBox="0 0 700 320" role="img" aria-label="Flow diagram of the review lifecycle for a cryogenic test operation. Top row left to right: concept, preliminary hazard analysis, preliminary design review, and deviation and component studies on the piping and instrumentation diagram. The flow drops down and runs right to left through critical design review, fabrication under configuration control, and cleaning, proof and leak testing, ending at test readiness review. From there it drops to the test itself. A dashed feedback line runs from the test back up, labelled: any change re-enters the review at the gate that qualified it.">
  <g font-family="system-ui, sans-serif" font-size="13">

    <!-- Row 1 -->
    <rect x="16" y="34" width="150" height="50" rx="5" fill="var(--side)" stroke="currentColor" stroke-width="1.4"/>
    <text x="91" y="55" text-anchor="middle" fill="currentColor">Concept</text>
    <text x="91" y="72" text-anchor="middle" fill="var(--muted)">what fluids, how much</text>

    <rect x="186" y="34" width="150" height="50" rx="5" fill="var(--side)" stroke="currentColor" stroke-width="1.4"/>
    <text x="261" y="55" text-anchor="middle" fill="currentColor">Preliminary</text>
    <text x="261" y="72" text-anchor="middle" fill="currentColor">hazard analysis</text>

    <rect x="356" y="34" width="150" height="50" rx="5" fill="var(--side)" stroke="var(--ok)" stroke-width="2"/>
    <text x="431" y="55" text-anchor="middle" fill="currentColor">PDR — gate</text>
    <text x="431" y="72" text-anchor="middle" fill="var(--muted)">may we detail-design?</text>

    <rect x="526" y="34" width="158" height="50" rx="5" fill="var(--side)" stroke="currentColor" stroke-width="1.4"/>
    <text x="605" y="55" text-anchor="middle" fill="currentColor">HAZOP · FMEA · FTA</text>
    <text x="605" y="72" text-anchor="middle" fill="var(--muted)">on a frozen P&amp;ID</text>

    <path d="M166 59 L182 59" stroke="currentColor" stroke-width="1.4" marker-end="url(#pa)"/>
    <path d="M336 59 L352 59" stroke="currentColor" stroke-width="1.4" marker-end="url(#pa)"/>
    <path d="M506 59 L522 59" stroke="currentColor" stroke-width="1.4" marker-end="url(#pa)"/>
    <path d="M605 84 L605 104 L605 120" stroke="currentColor" stroke-width="1.4" fill="none" marker-end="url(#pa)"/>

    <!-- Row 2, flowing right to left -->
    <rect x="526" y="122" width="158" height="50" rx="5" fill="var(--side)" stroke="var(--ok)" stroke-width="2"/>
    <text x="605" y="143" text-anchor="middle" fill="currentColor">CDR — gate</text>
    <text x="605" y="160" text-anchor="middle" fill="var(--muted)">may we build it?</text>

    <rect x="356" y="122" width="150" height="50" rx="5" fill="var(--side)" stroke="currentColor" stroke-width="1.4"/>
    <text x="431" y="143" text-anchor="middle" fill="currentColor">Fabricate · assemble</text>
    <text x="431" y="160" text-anchor="middle" fill="var(--muted)">configuration control</text>

    <rect x="186" y="122" width="150" height="50" rx="5" fill="var(--side)" stroke="currentColor" stroke-width="1.4"/>
    <text x="261" y="143" text-anchor="middle" fill="currentColor">Clean · proof · leak</text>
    <text x="261" y="160" text-anchor="middle" fill="var(--muted)">verified, documented</text>

    <rect x="16" y="122" width="150" height="50" rx="5" fill="var(--side)" stroke="var(--ok)" stroke-width="2"/>
    <text x="91" y="143" text-anchor="middle" fill="currentColor">TRR — gate</text>
    <text x="91" y="160" text-anchor="middle" fill="var(--muted)">per test, not per year</text>

    <path d="M526 147 L510 147" stroke="currentColor" stroke-width="1.4" marker-end="url(#pa)"/>
    <path d="M356 147 L340 147" stroke="currentColor" stroke-width="1.4" marker-end="url(#pa)"/>
    <path d="M186 147 L170 147" stroke="currentColor" stroke-width="1.4" marker-end="url(#pa)"/>
    <path d="M91 172 L91 196" stroke="currentColor" stroke-width="1.4" fill="none" marker-end="url(#pa)"/>

    <!-- Test -->
    <rect x="16" y="200" width="240" height="46" rx="5" fill="var(--side)" stroke="var(--warn)" stroke-width="2"/>
    <text x="136" y="221" text-anchor="middle" fill="currentColor">TEST — people behind the barricade</text>
    <text x="136" y="238" text-anchor="middle" fill="var(--muted)">remote operation, exclusion zone set</text>

    <!-- Feedback -->
    <path d="M256 223 L620 223 L620 178" stroke="var(--warn)" stroke-width="1.6" fill="none" stroke-dasharray="7 5" marker-end="url(#pw)"/>
    <text x="20" y="272" fill="var(--warn)">Dashed return: any change to hardware, software, fluid or procedure re-enters</text>
    <text x="20" y="289" fill="var(--warn)">the review at the gate that qualified the thing being changed.</text>
    <text x="20" y="306" fill="var(--muted)">Heavy outlines are gates — you must be let through them. Light outlines are work.</text>
  </g>
  <defs>
    <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,1 L9,5 L0,9 z" fill="currentColor"/>
    </marker>
    <marker id="pw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,1 L9,5 L0,9 z" fill="var(--warn)"/>
    </marker>
  </defs>
</svg>
<figcaption>Figure P.1 — The review lifecycle for a cryogenic test operation. The gate structure and the "closed or with a closure plan" rule follow NASA NPR 7123.1D, Appendix G, Rev D. The dashed return path is the part groups actually get wrong.</figcaption>
</figure>

---

## 2. Hazard analysis is a family of lenses, not a document

OSHA's process safety management standard names the acceptable methodologies
outright — what-if, checklist, what-if/checklist, HAZOP, FMEA, fault tree analysis,
or an appropriate equivalent — and requires the method to suit the complexity of the
process `[OSHA-3132]`. The common student error is to believe a single method *is*
"the hazard analysis." Each looks at the system from one direction and is
systematically blind in the others; mature programmes run several.

**Preliminary hazard analysis** comes first, before a design exists. It enumerates the
hazard *inventory* — the energies, materials and environments in play — and its output
is requirements: this system will hold a cryogenic oxidiser, a flammable cryogen,
stored pressure and an oxygen-deficiency source, so it will need relief on every
isolatable volume, gas detection, an ODH assessment and an oxygen-compatibility
review. Its blind spot is that it cannot see scenarios, because nothing exists yet to
deviate.

**What-if** is open-ended and fast: a room of experienced people asking "what if this
valve is shut when that one opens?" It catches what a keyword list would never
generate, and depends entirely on who is in the room — a team with no member who has
watched a vent stack ice over will not what-if a vent stack icing over. **Checklist**
is the mirror image: closed, repeatable, complete against known failure modes, useless
against novelty. Hence what-if/checklist as the usual compromise.

**HAZOP** is the workhorse for flow systems and the right lens for the hazard class
this course keeps returning to. It divides the system into nodes, takes a parameter
(flow, pressure, temperature, level, composition) and combines it with a guide word to
force a deviation into existence. The standard guide words are **no/none, more, less,
as well as, part of, reverse, other than**, plus **early, late, before, after** for
sequenced operations; IEC 61882:2016 is the governing application guide. "No flow",
"reverse flow", "more pressure" on an isolated node — exactly the questions that
surface a trapped cryogenic volume. HAZOP needs a stable, correct P&ID, costs real
time, and examines deviations of the process rather than failures of a part.

**FMEA**, and **FMECA** when criticality ranking is added, works bottom-up from the
components: for each part, how can it fail and what does that do? It feeds redundancy,
instrumentation and maintenance decisions directly. Its blind spot is the one that
killed people at Williams Olefins — an FMEA can pass every component as healthy while
the *configuration* is lethal, because a block valve isolating a relief device is not
failed, it is doing exactly what a block valve does `[CSB-WILLIAMS-OLEFINS]`.

**Fault tree analysis** runs the other way: deductive, starting from one undesired top
event — "unrelieved overpressure of the oxidiser feed leg" — and decomposing downward
through AND and OR gates to basic events. It handles combinations and common causes
and can be quantified. Its blind spot is that it only tells you about the top event
you nominated. NASA's own framing is that hazard-centric methods like FMEA and HAZOP
are valuable but "limited in their ability to identify hazardous system interactions"
`[NASA-SP-2010-580]`.

**Job hazard analysis** is the only one that looks at the human being: the
relationship between the worker, the task, the tools and the work environment
`[OSHA-3071]`. Its prioritisation criteria include jobs able to cause severe injury
*even with no accident history*, which puts a clean-record student group with a LOX
system squarely in scope. In national-lab failure-rate data a human-in-the-loop
cryogenic connection is four to five orders of magnitude more likely to release
cryogen than a pipe is to rupture `[JLAB-ODH]`. The hardware is not the risky part.
The connect–disconnect is.

**Layers of protection analysis** comes last, on the scenarios a HAZOP flagged as
serious: take one scenario, estimate how often the initiating event happens, credit
each protection layer with an order-of-magnitude probability of failing on demand, and
compare the mitigated frequency against a tolerable-risk target. The concept you
actually need is the **independent protection layer** — a layer counts only if it is
independent of the initiating cause, independent of the other layers, effective
against that scenario, and auditable.

<figure>
<svg viewBox="0 0 700 380" role="img" aria-label="Nested layers of protection diagram. From the centre outward: inherent design, the only layer that removes the hazard; the basic control system, which depends on software and power; alarms and human response, which depend on a person; independent mechanical protection such as relief valves and burst discs, which are physical; physical separation such as barricades, exclusion zones and quantity-distance, which is physical; and emergency response on the outside, which acts only after control is already lost.">
  <g font-family="system-ui, sans-serif" font-size="13">
    <rect x="12" y="12" width="676" height="356" rx="9" fill="none" stroke="var(--muted)" stroke-width="1.6"/>
    <text x="26" y="32" fill="var(--muted)">Emergency response — acts only after control is already lost (people, off site)</text>

    <rect x="44" y="44" width="612" height="292" rx="8" fill="none" stroke="var(--ok)" stroke-width="2"/>
    <text x="58" y="64" fill="var(--ok)">Physical separation — barricade, exclusion zone, quantity-distance (physical)</text>

    <rect x="76" y="76" width="548" height="228" rx="7" fill="none" stroke="var(--ok)" stroke-width="2"/>
    <text x="90" y="96" fill="var(--ok)">Independent mechanical protection — reliefs, burst discs (physical)</text>

    <rect x="108" y="108" width="484" height="164" rx="6" fill="none" stroke="var(--muted)" stroke-width="1.6"/>
    <text x="122" y="128" fill="var(--muted)">Alarms and human response — gas and ODH detection (needs a person)</text>

    <rect x="140" y="140" width="420" height="100" rx="6" fill="none" stroke="var(--muted)" stroke-width="1.6"/>
    <text x="154" y="160" fill="var(--muted)">Control system — interlocks, fail-safe positions (software, power)</text>

    <rect x="172" y="172" width="356" height="44" rx="5" fill="var(--side)" stroke="var(--ok)" stroke-width="2.2"/>
    <text x="350" y="190" text-anchor="middle" fill="currentColor">Inherent design — the hazard removed</text>
    <text x="350" y="207" text-anchor="middle" fill="var(--muted)">least inventory · no isolatable volume · right materials</text>

    <text x="26" y="356" fill="var(--warn)">A layer counts only if it is independent of the initiating cause and of every other layer.</text>
  </g>
</svg>
<figcaption>Figure P.2 — Layers of protection. Only the innermost layer removes the hazard; every other layer merely intercepts it. Note which layers depend on a person, a program or a power supply — those are the ones a single power failure or a single misunderstanding takes out together.</figcaption>
</figure>

<div class="box"><span class="lbl">Worth knowing</span>
The Williams Olefins case is the cleanest published demonstration of what
"independent" means. A locked-open block valve was credited as the path to pressure
relief; the CSB's own conclusion was that installing a relief valve on the vessel
would have been the correct control, and that relying on a locked-open block valve
is <em>less reliable due to the possibility of human implementation errors</em>
<code>[CSB-WILLIAMS-OLEFINS]</code>. An administrative control placed in series with
a mechanical one does not add a layer. It replaces one.
</div>

---

## 3. Procedures, checklists, and why generic is worse than nothing

A written operating procedure is a hazard control, and like any control it is
developed, reviewed and approved rather than typed — normally written by the engineers
who built the system, checked by someone who did not, approved by the institution that
carries the consequences. MIT's pressure-vessel programme is a good published model:
procedures are required per system — "if there are multiple pressure vessel systems in
the lab, each needs an SOP" — on an EHS template, including emergency shutdown,
reviewed by the EHS office `[MIT-EHS-0082]`.

The per-system rule is the important part. A procedure names actual valves with actual
tag numbers, actual set pressures traceable to actual relief calculations, and actual
people holding actual certifications. Change the hardware and it is wrong; change the
fluid and it is wrong; move it to another stand and it is wrong.

Which is why a *generic* procedure is worse than none. No procedure at least announces
itself. A generic sequence that reads like a real one manufactures false confidence: it
looks authoritative, it invites someone to follow it, and it will be followed right
past the one valve on this particular stand that the generic version does not know
exists.

Checklists are a different instrument. A checklist verifies a *state* — configuration
confirmed, relief paths open, personnel accounted for, area cleared — and its power
comes from being short, from being read aloud by one person and confirmed by another,
and from having a defined stopping rule when an item cannot be confirmed.

---

## 4. Peer review and independent review

The principle is simple and constantly violated: **the reviewer must not be the
designer, and must have standing to say no.** A comment is not a review. NASA threads
peer reviews through the entrance criteria of essentially every life-cycle review, so
arriving at a formal gate presupposes that lower-level reviews happened and their
action items were dispositioned with the originator (NPR 7123.1D, Appendix G).

Real programmes make this concrete by naming the approving roles. Jefferson Lab
requires an oxygen-deficiency risk assessment to be approved by the primary ODH
analysis authority, by a *second independent* ODH analysis authority and by a
department head, then verified by a safety reviewer — and specifies the qualifications
required to be an analysis authority at all `[JLAB-ODH]`. MIT requires design plans to
be reviewed with an EHS safety team member *before building* `[MIT-EHS-0082]`. Cornell
will not let a proposal to use liquid oxygen proceed without prior approval, an EHS
risk assessment and an engineering code review `[CORNELL-CRYO]`.

For a student group the translation is that you need at least one reviewer who did not
design the system, understands cryogenics, and whose disapproval stops the test. If no
such person exists, that is the first finding.

---

## 5. The P&ID is the controlling document

Everything above runs on drawings. The piping and instrumentation diagram is what the
HAZOP is performed against, what the relief analysis is traceable to, where the
procedure's valve tags come from, and what a reviewer reads to decide whether every
isolatable volume has a relief path that cannot itself be isolated. Tags follow
ISA-5.1 (2022) `[ISA-5.1]` so a stranger can read it.

So a drawing that no longer matches the built system is not a paperwork problem. It is
a safety defect, because every analysis performed on it is now an analysis of a system
that does not exist. A field-added tee, a swapped check valve, a cap left
"temporarily" on a vent — each silently invalidates a hazard analysis, and none of
them announce themselves. The Texas fire marshal's finding after a university nitrogen
dewar ruptured is the extreme version: relief devices had been replaced with brass
plugs by "inexperienced and unidentified person(s)", undocumented, discovered only by
forensic examination after the explosion `[TX-FIRE-MARSHAL-2006]`.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
The system is reviewed in March. In April someone adds an isolation valve so a
transducer can be swapped without draining the run tank. It is a sensible change. It
also creates a new isolatable segment with no relief path, and it is not on the
drawing, so the HAZOP that would have caught it was completed a month before the
segment existed. Nobody did anything careless. The configuration simply drifted away
from the analysis, which is the ordinary way this goes wrong.
</div>

---

## 6. Design review gates: PDR and CDR

**Preliminary design review** demonstrates that the preliminary design meets the
requirements at acceptable risk and *establishes the basis for proceeding with detailed
design*. **Critical design review** demonstrates that the design is mature enough for
full-scale fabrication, assembly, integration and test (NPR 7123.1D, Appendix G).

What propulsion brings to those gates that a structures or avionics project does not is
a set of specifically fluid questions. At PDR: what fluids, in what quantities, at what
pressures, on what site, and what does that imply for siting, occupancy classification
and code compliance? What is the relief philosophy — not set pressures yet, but the
principle that every isolatable volume gets its own unisolatable relief
`[LBNL-PUB3000-29]`? Is the material set plausible for oxygen service
`[LANL-OXYGEN-GUIDE]`? Is the inventory as small as the objective allows, that being
the only genuinely inherent control available?

At CDR the same questions arrive with numbers and drawings attached: a released P&ID;
relief sizing traceable to the governing code (ASME BPVC Section VIII Division 1, 2025
edition, and the applicable CGA S-1 part for the container type); piping designed to
ASME B31.3 (2024); a materials list with oxygen-compatibility rationale; a completed
HAZOP with dispositioned findings; the instrumentation and interlock design; and vent
and relief routing shown all the way to discharge. A CDR that cannot say where every
relief discharges is not a CDR.

---

## 7. Proof testing, leak testing, and the energy in the test itself

Two distinct verifications, often conflated. A **proof test** — strength or
hydrostatic test — pressurises the system above its maximum allowable working pressure
by a code-defined factor to demonstrate that it does not yield or burst. MAWP is the
pressure the system is *permitted to work at*; proof pressure is a deliberate,
controlled overload above it. A **leak test** is a much lower-pressure, much more
sensitive check for tightness, and a system can pass one and fail the other in either
direction. Cryogenic systems earn a third check neither covers: joints tight at room
temperature routinely leak cold, because contraction has moved the sealing surfaces.

Both tests use an **inert fluid**, never the service fluid. You do not proof-test an
oxygen system with oxygen or leak-check a methane system with methane; the test is
already one of the most hazardous evolutions in the programme and there is no reason
to add a fuel or an oxidiser to it. With the corollary Module 06 raised: a nitrogen
proof test can leave contamination that only becomes an ignition hazard when the
system later sees oxygen, so a proof test is a standard re-cleaning trigger
`[NASA-TM-2007-213740]`.

<div class="box remember"><span class="lbl">Remember this</span>
<b>Hydrostatic testing is preferred to pneumatic because much less energy is stored
in a compressed liquid than in a compressed gas</b> — MIT states exactly this rule
and exactly this reason <code>[MIT-EHS-0082]</code>. A liquid is nearly
incompressible: when a hydrotested vessel fails, the pressure collapses almost
immediately and very little energy is available to throw fragments. The same vessel
pneumatically tested holds a large volume of compressed gas that expands into the
failure, and the result is a blast wave and shrapnel. Where a pneumatic test is
unavoidable, it becomes a remote operation with an exclusion zone, not a shop task.
</div>

---

## 8. Cleanliness and oxygen compatibility as formal products

For any oxygen-service system, two things that feel like workshop activities are
**review deliverables with documentation attached**.

**Cleanliness** is a specified, verified, recorded condition, not an impression. The
specification names a level and the standard defining it — ASTM G93/G93M-25 for levels
and verification methods `[ASTM-G93]`, and CGA G-4.1 (7th ed., August 2018) as the
cleaning requirement a purchase order should invoke, applying to all surfaces
contacting fluid above 23.5 % oxygen `[CGA-G-4.1]`. What travels with the part is
evidence: who cleaned it, to what level, what quantitative non-volatile residue and
particle results were obtained, how it was packaged, and what triggers re-cleaning.
"We degreased it carefully" is not a cleanliness level.

**Oxygen compatibility assessment** is likewise a structured report, not a folder of
datasheets: worst-case operating conditions, material flammability, an
ignition-mechanism-by-mechanism walk, the kindling chain, the reaction effect, history
of use, and a hazard control table `[NASA-TM-2007-213740]`. Its mandatory inputs
include a system flow schematic and a cross-sectional drawing of each component —
another reason the drawings must be right.

---

## 9. Test readiness review

TRR is the gate immediately before the operation, and its scope is broader than people
expect: it establishes that the **test article, the test facility, the support
personnel and the test procedures** are all ready, along with the arrangements for
acquiring, reducing and controlling data (NPR 7123.1D, Appendix G). Personnel are
inside that boundary — a TRR asks who will be in which position, what they are
certified for, and who may call an abort.

The feature student groups miss is that **TRR is per test or test series, not once per
programme**. You do not pass "the safety review" and then own the stand; each campaign
gets its own readiness gate, because hardware, people and objectives have all changed
since the last one. Morpheus ran with defined pad-crew positions each carrying its own
certification and an embedded safety and mission assurance engineer, which is what
that looks like taken seriously at small scale `[NASA-MORPHEUS-LESSONS]`.

---

## 10. Emergency planning, exclusion zones and remote operation

Emergency procedures are a coordinated product, not a paragraph appended to the
operating procedure: what the credible emergencies are, the response to each, who is
notified, and — critically — who *outside* the group has been told. MIT requires its
EHS office to ensure emergency procedures for major pressure-vessel installations are
developed and **disseminated to emergency response personnel** `[MIT-EHS-0082]`;
Jefferson Lab requires ODH signage, alarms and safeguards verified in place *before*
the hazard is introduced `[JLAB-ODH]`. If the campus fire department first learns of
your LOX inventory when they arrive at it, the plan has already failed.

The **exclusion zone** is the physical expression of the analysis. Fire codes work
through maximum allowable quantities per control area: exceed the threshold for a
hazard class and the space reclassifies to high-hazard occupancy, with heavier
construction, separation, ventilation and suppression attached `[ICC-IFC-MAQ]`. NFPA 55
(2026 edition) is the adoptable code covering storage, use and handling of compressed
gases and cryogenic fluids, including separation and siting `[NFPA-55]`.
**Quantity-distance** thinking generalises this: safe standoff is a function of how
much energetic material is present, so distance and inventory trade against each other.
Reduce the inventory and the required standoff shrinks — the most powerful lever a
small group has, and the reason "build the minimum size system possible to minimise
stored energy" appears as an explicit institutional rule `[MIT-EHS-0082]`.

**Remote operation** follows. The barricade exists because no combination of procedure
quality, training and PPE protects a person standing next to a vessel that fails — PPE
is explicitly the last line of defence and a weak one `[LBNL-PUB3000-29]`. Distance is
the only control that works against fragments, blast and a sudden oxygen-deficient
atmosphere at once, and it works whether or not anybody did the right thing. Hence the
design goal: a system that can be loaded, pressurised, fired and safed with the crew
behind the barricade, with every surviving manual action treated as a finding to argue
about rather than a convenience.

---

## 11. Training and documented competency

Competency is a record, not a belief. The published pattern is consistent: hands-on
training on the **specific** system rather than on cryogenics in general, covering
normal operation and emergency shutdown; documented, retained records; more than one
trained person, so a single absence neither stops the work nor tempts someone
untrained into it; and named qualification criteria for the roles that sign analyses
`[MIT-EHS-0082]` `[JLAB-ODH]` `[LBNL-PUB3000-29]`. MIT states the
single-point-of-knowledge rule outright: train at least one other person to shut the
system down when the owner is not there `[MIT-EHS-0082]`.

For a student group with annual turnover this is the hardest item on the list to
satisfy honestly, and it is the one a reviewer will probe hardest.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
<b>The system you reviewed must be the system you test.</b> That single sentence is
what configuration control means, and every other control in this section depends on
it: the hazard analysis, the relief sizing, the procedure's valve tags, the
cleanliness records and the training all refer to a specific configuration. Change
the configuration and you have not made a small modification — you have invalidated
the evidence that the operation is safe, and the only way to get it back is to go
round the loop again.
</div>

---

## Where this leaves you

None of this is bureaucracy in the pejorative sense. Every gate exists because an
analysis is only ever valid about one specific system, and the gates are how a group
proves that the thing on the pad is still the thing that was analysed. The methods are
lenses; the drawings are the shared object all the lenses look at; the reviews are how
someone who is not you gets to say no; and the barricade is what protects everyone
when all of it turns out to have missed something.

The next section is the other half of the same skill: what happens when you take this
to the people who have to approve it.
