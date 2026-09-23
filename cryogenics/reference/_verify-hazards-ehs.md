# Verification notes — universal cryogenic hazards & institutional safety practice

Research file for the propulsion course. Everything below is a *claim plus a
citation plus a confidence label*. It is source material for writing course
prose, not course prose itself.

**Scope boundary.** This file covers hazard recognition, engineering controls
and institutional review practice. It deliberately contains **no operating
procedures, no transfer sequences, and no handling how-to**. Where a question
has a facility-specific answer (relief set pressures, ventilation rates, room
volumes, ODH class, permit routes, quantity limits), that is stated explicitly
rather than answered. The course must not give facility-specific answers it
cannot know.

## Confidence scale

| Label | Meaning |
|---|---|
| **A** | Primary authoritative source (regulator, federal investigation body, national-lab ES&H manual, standards body), fetched and read directly for this file. |
| **B** | Authoritative but one step removed: a reliable reproduction of a primary source I could not fetch; a paywalled standard cited by number; or standard engineering physics stated without a single canonical free citation. |
| **C** | Reasonable and widely repeated, but weakly sourced, contested, or a synthesis judgement of mine. Treat as "check before printing." |

## What I could not reach (declare this honestly)

- **Fermilab FESHM 4240 / 4240TA** (`https://publicdocs.fnal.gov/cgi-bin/RetrieveFile?docid=136&filename=FESHM+4240-June+2018.pdf&version=2`)
  — all `fnal.gov` hosts returned a Cloudflare bot challenge from this
  environment. The Fermilab ODH method is nonetheless **verified**, because two
  independent labs reproduce it in public documents I *did* fetch and read in
  full: Jefferson Lab 6540 Appendix T4 (which excerpts FESHM 4240TA by name) and
  Berkeley Lab's ODH page (which states it bases its assessments on Fermilab's
  model and gives the governing formula). Cite JLab/LBNL for the numbers; cite
  Fermilab as the origin of the method.
- **CGA P-12** *Guideline for Safe Handling of Cryogenic and Refrigerated
  Liquids* (7th ed., January 2023) — paywalled. Title, edition and year are
  verified from the publisher's own catalogue page; **its contents are not quoted
  anywhere in this file.** Note that the frequently-linked ANSI webstore entry is
  the superseded 6th edition (2017).
- **NFPA 55 / IFC maximum allowable quantity tables** — copyrighted, not
  reproduced anywhere free that I could verify. The *mechanism* is described
  below; the *numbers* are not, and must be read from the edition the local AHJ
  has adopted.
- **AIAA 2021-3273** (small liquid propellant engine safety processes) —
  paywalled; title only, contents unverified.
- **NASA NSS 1740.16** downloaded but its OCR text layer is scrambled beyond
  safe quotation. Not used.

---

# 1. Cold injury

## 1.1 The three contact mechanisms

Cold injury from cryogens arrives by three routes, and they are not equally
dangerous:

1. **Liquid splash.** Often the *least* damaging of the three for a brief,
   free-running splash onto bare skin — see Leidenfrost below.
2. **Cold vapour.** Boil-off gas leaves a vent or relief path only slightly
   warmer than the liquid's boiling point and will cause burns and frostbite.
   Berkeley Lab is explicit that contact with "cryogenic liquid, its boil-off
   gases, or components cooled to these low temperatures can readily cause
   frostbite or cryogenic burns." **[A]** — LBNL PUB-3000 Ch.29, Table A.2,
   <https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch29/>. Colorado State makes
   the same point specifically for "cold vapor escaping a pressure relief valve."
   **[A]** — <https://lasers.colostate.edu/wp-content/uploads/2019/04/Cryogenic-Safety-Manual.pdf>
3. **Cold metal contact and skin adhesion.** This is the mechanism with **no
   Leidenfrost protection at all**. LBNL: "there is no such protection when
   handling solid objects that have been cooled to cryogenic liquid temperatures.
   Metal parts that are in contact with a cryogenic liquid, such as piping,
   valves, and fittings, can and will cause severe burns on contact with skin."
   **[A]** — <https://ehs.lbl.gov/service/cryogenic-liquid-safety/the-leidenfrost-effect/>
   LBNL's first-response guidance separately contemplates the case where "skin has
   been torn from freezing to a cold surface," which is the adhesion failure mode.
   **[A]** — <https://ehs.lbl.gov/service/cryogenic-liquid-safety/cryogenic-liquid-burns-and-frostbite/>

## 1.2 The Leidenfrost effect — and why it is a trap

**The physics.** A liquid contacting a surface far above its boiling point
hovers on a self-generated vapour layer. That vapour insulates, so heat transfer
is low, and the droplet skates on a near-frictionless gas film. **[A]** — LBNL,
Leidenfrost page (URL above).

**Why brief splash often does not injure.** LBNL: "A small splash of cryogenic
liquid over the skin tends to skate off on a cushion of expanding gas, with a
heat transfer rate so low that it feels like nothing more than reaching into the
freezer." **[A]**

**Why trapped liquid does severe damage.** The protection depends entirely on
the liquid being free to run off. LBNL: "The protectiveness of the Leidenfrost
effect relies on perfect conditions for the liquid to skate freely off the body.
Any place where the liquid might collect, such as local depressions (a cupped
hand, a shirt pocket, a rolled cuff), prevents the liquid from running off and
can lead to severe burns." **[A]**

And absorbent material defeats it completely: "The Leidenfrost effect only works
on non-porous, non-absorbent materials. Recently, we learned the hard way that
absorbent materials can and do absorb liquid nitrogen and can cause serious
burns. Even a small, incidental splash of liquid nitrogen can be absorbed by some
materials, especially absorbent cloth, trapping the ultra-cold liquid against the
skin." **[A]**

> **Course framing.** The Leidenfrost effect is not a safety margin, it is a
> reason people underestimate the hazard. The same splash is nearly harmless on
> bare skin and disfiguring inside a glove, a shoe, a cuff or a pocket. The
> variable is not the cryogen, it is whether the geometry lets the liquid leave.

LBNL also flags **thermally conductive worn items** — "metal watches and
jewelry that may become ultra-cooled by a liquid nitrogen splash and cause burns
where the thermally conductive material touches the skin." **[A]**

## 1.3 Why loose gloves, and no tucked-in cuffs

This is the direct engineering consequence of §1.2, and Berkeley Lab states the
design rule and the reason together:

> "There are also two main styles of cryo gloves: One with wide openings at the
> wrists, and one with elastic cuffs at the wrists. Berkeley Lab recommends the
> gloves with loose, wide openings at the wrists, and that cryo gloves be
> over-sized for the hands of the person wearing them. The reason for this is to
> protect against the possibility of trapping cryogenic liquid within the glove
> against the hand. If cryogenic liquid enters the glove, the glove will need to
> be removed quickly to minimize the potential of a cryo burn. Elastic cuffs make
> it harder to remove the glove, while gloves with a wide, loose opening at the
> wrist can be thrown off quickly with a flick of the arm."

**[A]** — LBNL Leidenfrost page (URL above). The page labels elastic-cuff cryo
gloves "Not Recommended" outright.

The same logic drives the "no cuffs tucked in, trousers over boots" convention:
every tucked interface is a cup. **[C]** for the specific sleeves/trousers
phrasing — the *principle* is A-grade (LBNL's "local depressions… a rolled cuff")
but I did not find a single authoritative source stating the trouser-over-boot
rule in those words.

**PPE is the last line, and a weak one.** LBNL is unusually blunt: cryo gloves
"only provide minimal protection and do not protect a wearer against a flow of
cryogenic liquid, submersion in cryogenic liquid, or prolonged contact with a
cryogenically cooled object… It is very possible to sustain burns from
cryogenically cooled objects or cryogenic liquid while wearing cryo gloves. This
has happened at LBNL." Also: waterproofing is a coating that rubs off, seams
leak, and "if the interior of the cryo glove does get wet, the glove loses its
insulative properties and becomes completely ineffective." **[A]** — LBNL burns
page. LBNL further warns that heat-resistant gloves are *not* cryo gloves and
that porous heat gloves "can actually trap cryogen against the skin." **[A]** —
PUB-3000 Ch.29.

## 1.4 Eye vulnerability

The eye is the highest-consequence target because it has no protective reflex
fast enough and no tissue reserve. LBNL treats eye contact with cryogen **or
cold vapour** as an immediate emergency-services call, noting "cryogen burns to
the eyes can lead to permanent damage and loss of vision." **[A]** — LBNL burns
page. Colorado State: all cryogens "can cause frostbite and eye injury upon
direct contact, contact with cooled objects, or exposure to cold vapor escaping a
pressure relief valve." **[A]**

This is the argument for face protection rather than safety glasses wherever
there is a splash or a vent path, and it is why vent and relief discharge
orientation is an eye-protection question as well as an ODH question.

## 1.5 First aid — policy level only

**Deliberately not reproduced as a procedure.** What the course should say is
that a facility must *have* a written cryogenic first-response protocol tied to
its own emergency numbers and its own occupational-medicine route, and that the
protocol exists because of four hazard-recognition facts:

- **The injury is masked at the time it happens.** "Below about 7 degrees
  Celsius, tissues become numb, so there may be no pain immediately following a
  cryogenic liquid burn." LBNL reports two burns where "the person who was burned
  did not immediately recognize the injury due to the extreme cold and numbness"
  and states "It can be nearly impossible to distinguish between a cold sensation
  that is harmless and a cold sensation that is associated with a burn." **[A]**
- **Presentation is unlike a thermal burn** — "pale, somewhat yellowish, and
  waxy," hard to the touch in severe cases; pain arrives on rewarming. **[A]**
- **Well-meant rewarming causes additional injury.** LBNL's protocol explicitly
  excludes dry heat and excludes massaging or rubbing. **[A]**
- **Any suspected injury needs professional evaluation**, because severity is
  not apparent to the injured person: "Any injury from cryogenic liquids or
  cryogenically cooled materials must be evaluated by a medical professional as
  quickly as possible." **[A]**

All four: <https://ehs.lbl.gov/service/cryogenic-liquid-safety/cryogenic-liquid-burns-and-frostbite/>

Cite LBNL's page as a *published example of what such a policy looks like*. The
course must not present it as medical instruction, and must say that the
protocol, the numbers to call and the receiving facility are facility-specific.

---

# 2. Trapped liquid expansion

**This is the most important hazard section in the course.** It is the mechanism
that turns a routine, correctly-specified, leak-free piping system into a bomb
with no warning, no operator error at the moment of failure, and no external
energy input beyond room-temperature heat leak.

## 2.1 The physics — two distinct mechanisms

A cryogenic liquid sealed into a closed volume warms. What happens next depends
on whether there is a vapour space.

**(a) Boiling / vapour-generation case.** If the volume is not liquid-full, the
liquid boils and the vapour has nowhere to go. Pressure climbs toward the
saturation pressure at the rising temperature, and once the fluid is above its
critical temperature it is simply a dense fluid whose pressure is set by density
and temperature.

**(b) Liquid-full hydraulic case.** If the segment is *liquid-full* with no
vapour space, the pressure rise is hydraulic and far more violent per degree,
because the liquid must either expand or push. For a constant-volume liquid the
exact thermodynamic relation is

> dP/dT |_V = β / κ_T

where β is the isobaric thermal expansivity and κ_T the isothermal
compressibility. Cryogens near their boiling point have large β and modest κ_T,
so β/κ_T is large — the pressure rise per kelvin is severe, and it begins
immediately, before any boiling. **[B]** — standard thermodynamic identity; I did
not find a cryogen-specific free source tabulating β/κ_T, so do **not** quote a
psi-per-kelvin number in the course.

The industrial term for (b) is **hydraulic thermal expansion**: "When an
entrapped volume of liquid begins absorbing heat, the pressure in the loop starts
rising far above nominal operating pressure as a result of hydraulic thermal
expansion." **[C]** — Dynaflow Research Group,
<https://dynaflow.com/news/articles/thermal-expansion-of-trapped-liquids/>
(engineering consultancy, not a standards body; use for vocabulary, not numbers).

## 2.2 Quantitative — published figures

Berkeley Lab's ES&H Manual publishes a table of exactly the number the course
needs. **[A]** — LBNL PUB-3000 Ch.29, Table A.1,
<https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch29/>

| Cryogen | Boiling point °F (K) @ 1 atm | Liquid/gas expansion | **Pressure generated from trapped liquid allowed to warm to room temperature** |
|---|---|---|---|
| LO₂ | −297 (90.2) | 860 : 1 | **12,600 psig** |
| LAr | −302 (87.3) | 847 : 1 | **12,300 psig** |
| LN₂ | −320 (77.4) | 696 : 1 | **10,200 psig** |
| LH₂ | −423 (20.3) | 851 : 1 | **12,400 psig** |
| LHe | −452 (4.2) | 757 : 1 | **11,000 psig** |

And the plain-language version from the same chapter: "Cryogenic liquid confined
and allowed to warm to room temperature will generate pressure in excess of
10,000 psig." **[A]**

### The ideal-gas idealisation — show the work, label it as an idealisation

The published figures are reproducible from a one-line estimate, which is worth
showing in the course because it makes the number *understandable* rather than
memorised.

**Assumptions (state every one):**
- A rigid, perfectly strong, perfectly sealed volume *V*.
- Initially **100 % liquid-full** at its normal boiling point and 1 atm.
- All of it ends as gas at room temperature (~294 K) in the same volume *V*.
- The gas is treated as **ideal**.
- No leakage, no dissolution, no container expansion.

Then the final pressure is just the expansion ratio times one atmosphere:

> LN₂: *P* ≈ 696 × 1 atm ≈ **696 atm ≈ 10,200 psi ≈ 70 MPa**

which reproduces LBNL's published 10,200 psig. The ~700× figure quoted loosely
in the literature is this same expansion ratio.

**Why this is an idealisation and must be labelled as one [B]:**
- At that density (~800 kg/m³ of nitrogen at 294 K) the fluid is a **dense
  supercritical fluid, not an ideal gas**. Its compressibility factor Z exceeds
  1, so the *true* pressure at that density is **higher** than the ideal-gas
  estimate. The idealisation is not conservative in the safe direction.
- Real hardware never gets there. Ordinary tube, fittings, hose and valve bodies
  fail one to two orders of magnitude below these pressures. **The function of
  the number is not to predict a pressure — it is to show that the pressure
  demand is effectively unbounded relative to any realistic containment.** There
  is no "strong enough pipe" answer to a trapped cryogen; there is only a relief
  path.
- The figures assume warming to room temperature. A segment that warms only
  partway still reaches destructive pressure; the table is an endpoint, not a
  threshold.

## 2.3 Taxonomy — where liquid gets trapped

This list is the practical heart of the section. Sources vary in how many of
these they name explicitly, so confidence is per-item.

| # | Trap | Notes |
|---|---|---|
| 1 | **Between two closed valves in a line segment** | The canonical case. LBNL requires relief "for any piping segment that has the potential to trap cryogenic liquids (i.e., cryogenic liquid trapped between closed valves)." **[A]** |
| 2 | **Valve body cavity** (double-seated / floating ball valve) | When a ball valve closes, liquid is sealed in the cavity between the two seats. Vendor engineering literature: uncontrolled cavity pressure rise ranges "from seat distortion resulting in a leaking valve to deformation or destruction of the valve body with catastrophic release of fluid to the atmosphere." **[C]** — <https://janhenvalve.com/cryogenic-ball-valve-cavity-pressure-relief-why-critical/> (vendor source; the mechanism is uncontroversial, the wording is not authoritative) |
| 3 | **Dead leg or instrument sense line** | A capped stub, a gauge line, a DP transmitter leg. Fills with liquid, has one connection, warms from the closed end. **[C]** — synthesis; no single citation found. |
| 4 | **Downstream of a check valve** | The check valve is a closed valve that cannot be opened by an operator. Liquid between it and the next closure has no path back. **[C]** — synthesis. |
| 5 | **A filled hose disconnected at one end** | The disconnected end is often capped or self-sealing. Widely cited in trade guidance: trapped LN₂ can turn "a four-foot cryogenic transfer hose into a pipe bomb." **[C]** — <https://www.middlesexgases.com/trapping-liquid-nitrogen-may-be-catastrophic/> (gas distributor; illustrative phrasing only) |
| 6 | **Vacuum-jacketed annulus** | If the inner vessel leaks, cryogen enters the insulating vacuum space and pressurises it. LBNL requires relief "in vacuum-insulation spaces to address potential leakage of cryogenic liquids into the vacuum space," and describes the annulus relief on low-pressure dewars: "In that scenario, pressure might build up inside the vacuum space and rupture the dewar, so instead it is safely vented through a relief valve." **[A]** |
| 7 | **Pump casing** | Same geometry as a valve cavity, larger volume, isolated by suction and discharge valves. **[C]** — synthesis. |
| 8 | **Under a closed relief that was isolated by a block valve** | The relief exists, is correctly sized, and is disconnected from the thing it protects. **This is the CSB Williams Olefins mechanism** — see §2.5. **[A]** |
| 9 | **A line sealed by a plug of solid air or ice** | The blockage *is* the closed valve, and it forms without anyone touching anything. See §6.2. LBNL: "The function of vent lines can be defeated by the formation of ice (from condensed moisture) in the vent line. With LHe, air or other gases can solidify to form this blockage." **[A]** |

## 2.4 Engineering controls

**The governing rule, stated by Berkeley Lab [A]:**

> "Cryogenic systems must be designed such that **every isolatable part of the
> system which could conceivably have cryogenic liquid or gas introduced must
> have its own pressure relief**, in the form of a valve or burst disk with
> adequate gas flow capacity, to prevent explosion from trapped cryogen."

— LBNL PUB-3000 Ch.29 §J.1. Note the test: *isolatable*, not *normally
isolated*. If a combination of valve positions can strand liquid, that segment
needs relief regardless of whether anyone intends to create that combination.

Controls, in rough hierarchy:

1. **Thermal relief on every isolatable segment.** As above. Sizing, set
   pressure and discharge routing are **facility- and system-specific** and are a
   design-review output, not a course answer.
2. **Vented ball valves.** A relief hole drilled through the ball on the
   *upstream* side, so that when the valve is closed the body cavity vents back
   to the upstream line and cavity pressure cannot exceed upstream pressure.
   Orientation matters: a downstream vent can unseat the ball and create a
   permanent leak path. **[C]** — mechanism described consistently across vendor
   engineering literature (e.g. Milwaukee Valve, *Vented Ball Option for Ball
   Valves*, <https://www.milwaukeevalve.com/wp-content/uploads/vented-ball-option-for-ball-valves.pdf>).
   A vented ball is **directional**, which makes it a design-intent question, not
   a parts-bin substitution.
3. **Self-relieving seats** on trunnion-mounted ball valves — the upstream seat
   lifts when cavity pressure exceeds line pressure by a set margin.
   Bidirectional. **[C]**, same sourcing caveat.
4. **No block valve upstream of a relief unless positively locked open.**
   Standard practice is car-sealed-open (CSO) or locked-open with a captive-key
   programme. API STD 521 *Pressure-relieving and Depressuring Systems* is the
   governing industry standard for this and treats locked-open block valves as an
   **administrative** control. **[B]** — standard cited by number; I could not
   fetch an authoritative free copy. The CSB's finding on Williams (§2.5) is the
   A-grade evidence for *why* this is weaker than a dedicated relief.
5. **Relief on the VJ annulus.** Item 6 of the taxonomy; LBNL requires it. **[A]**
6. **Relief hardware suited to the service.** LBNL: relief devices "must not
   cease to function in extreme cold temperatures or be subject to failure from
   ice buildup," must not shift set pressure when thermally shocked, and a device
   suitable for LN₂ may not be suitable for LHe or LO₂. LBNL's rule is that
   **users never replace or repair relief devices** on cryogenic systems. **[A]**
7. **Design the relief out of the cold flow path.** A relief mounted directly in
   the liquid stream freezes and is inoperative when needed; standard practice is
   a riser/standoff so the device sees warmed gas. **[C]**

## 2.5 Documented incidents

### (i) Williams Olefins, Geismar, Louisiana — 13 June 2013 [A]

The clearest published case of *relief isolated from the thing it protects*.

- A reboiler heat exchanger was **offline and isolated from its pressure relief
  device**. Non-routine activity introduced heat; the confined liquid propane
  mixture heated, "resulting in a dramatic pressure rise within the vessel."
- The shell **catastrophically ruptured**, causing a BLEVE and fire. **Two
  workers killed; 167 others reported injuries**, mostly contractors.
- Root cause chain: a **2001 management-of-change** installed block valves that
  could isolate each reboiler from the pressure relief device at the top of the
  distillation column, and the organisation then relied on **administrative
  control of those valve positions**.
- CSB's own lesson: a hierarchy-of-controls approach "could have resulted in
  Williams choosing to **install a pressure relief valve on the reboiler** that
  ultimately ruptured **instead of relying on a locked open block valve** to
  provide an open path to pressure relief, **which is less reliable due to the
  possibility of human implementation errors**."
- CSB also "identified gaps in a key industry standard by the American Petroleum
  Institute (API) and issued recommendations to API to strengthen its
  'Pressure-relieving and Depressuring Systems' requirements."

Source: U.S. Chemical Safety Board, final case study released 19 October 2016 —
<https://www.csb.gov/csb-releases-final-case-study-into-2013-explosion-and-fire-at-williams-olefins-plant-in-geismar-louisiana/>

> **Note for the course:** propane is not a cryogen. Use this case for the
> *mechanism* — isolated relief, trapped liquid, heat input, BLEVE — and say so.
> It is the best-documented example in the public record, and CSB's finding on
> locked-open block valves is directly transferable.

### (ii) University LN₂ dewar cylinder rupture — 12 January 2006 [A]

Texas State Fire Marshal's Alert, 22 February 2006 —
<https://www.tdi.texas.gov/fire/documents/fmred022206.pdf>

- ~3:00 a.m., "an explosion occurred in a state university chemistry building
  laboratory, causing substantial building damage. The explosion resulted from a
  rupture in a liquid nitrogen (Dewar) cylinder." Cylinder built and tested
  December 1980.
- "The examination revealed that the cylinder's pressure release valve and
  rupture disc had been **replaced by two brass plugs**."
- The cylinder had been venting through a leaking gasket for 12–18 months (which
  students read as "the cylinder is leaking"). Roughly twelve hours before the
  explosion a student replaced the leaking gasket and refilled the cylinder —
  **removing the only remaining relief path**. "The cylinder ruptured when its
  internal pressure rose above **1,000 psi**."
- Conclusion: "The catastrophic failure of the nitrogen cylinder was a direct
  result of the removal and subsequent plugging of the internal tank pressure
  relief devices. The cylinder was modified by inexperienced and unidentified
  person(s)."

The Fire Marshal alert does not name the university; secondary press reporting
identifies it as Texas A&M. **[C]** for the attribution, **[A]** for every
technical fact above. The alert's institutional recommendations are used again in
§8.

> **Why this belongs in a *student propulsion* course specifically:** the failure
> was an undocumented modification by unidentified people, discovered only by
> forensic examination after the rupture. A symptom (frosting, apparent leaking)
> was visible for over a year and was interpreted as a nuisance rather than as
> evidence that the relief path was gone. Then a well-intentioned repair sealed
> the last vent.

### (iii) Solid-air plug in a liquid helium cylinder — Berkeley Lab ALS [A]

A near-miss, and the best illustration of taxonomy item 9:

> "A liquid helium cylinder was in use at the ALS, and a user failed to close one
> of the valves when finished with their operation. Nothing seemed amiss until a
> few days later, when another user went to withdraw liquid from the cylinder…
> the tube would not insert all the way; instead, it hit something hard well above
> the bottom of the reservoir. It turned out that air had entered the cylinder
> through the valve that was left open, had **frozen solid on top of the liquid
> helium, and formed an impenetrable plug**. Had the situation not been discovered
> and remedied, the cylinder may have exploded as the helium trapped below the
> plug slowly vaporized and built up pressure in the confined space."

— LBNL PUB-3000 Ch.29, Appendix C. The trapping agent here was **the atmosphere
itself**, admitted by an open valve.

---

# 3. Oxygen deficiency hazard (ODH)

## 3.1 Physiology by concentration band

The most widely reproduced table in US practice, published by the CSB and
attributed by them to the Compressed Gas Association (2001):

| Atmospheric O₂ (%) | Possible results |
|---|---|
| 20.9 | Normal |
| 19.0 | Some unnoticeable adverse physiological effects |
| 16.0 | Increased pulse and breathing rate, impaired thinking and attention, reduced coordination |
| 14.0 | Abnormal fatigue upon exertion, emotional upset, faulty coordination, poor judgment |
| 12.5 | Very poor judgment and coordination, impaired respiration that may cause permanent heart damage, nausea, and vomiting |
| <10 | Inability to move, loss of consciousness, convulsions, death |

**[A]** — CSB Safety Bulletin, *Hazards of Nitrogen Asphyxiation*, No. 2003-10-B,
11 June 2003, p.4 (table sourced there to "Compressed Gas Association, 2001") —
<https://www.csb.gov/assets/1/6/nitrogen_asphyxiation_safety_bulletin_(6-11-03).pdf>

Below the table's range, the same bulletin: "An atmosphere of only 4 to 6 percent
oxygen causes the victim to fall into a coma in less than 40 seconds." **[A]**

**Regulatory definitions [A]** — OSHA 29 CFR 1910.146:
- *Oxygen deficient atmosphere* = "an atmosphere containing less than **19.5
  percent** oxygen by volume."
- *Oxygen enriched atmosphere* = "an atmosphere containing more than **23.5
  percent** oxygen by volume."
- Both appear in the definition of a *hazardous atmosphere*: "Atmospheric oxygen
  concentration below 19.5 percent or above 23.5 percent."

<https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.146>

## 3.2 Why an inert release is lethal without warning

The human body has **no oxygen sensor**. The urge to breathe is driven by CO₂,
which an inert diluent does not raise. The CSB states the consequence plainly:

> "Breathing an oxygen deficient atmosphere can have serious and immediate
> effects, including unconsciousness after only one or two breaths. **The exposed
> person has no warning and cannot sense that the oxygen level is too low.**"

**[A]** — CSB bulletin (URL above).

Supporting statistics from the same bulletin, all **[A]**:
- **85 nitrogen asphyxiation incidents** identified in the US, **1992–2002**,
  causing **80 deaths and 50 injuries**.
- **~10 % of the fatalities were would-be rescuers** — people who went in after a
  collapsed colleague. This is the single most important operational fact in the
  section: the hazard is invisible, so the second casualty is caused by the
  first.
- **42 of the 85 incidents involved contractors**, accounting for **over 60 % of
  the fatalities** — i.e. the people least embedded in the local safety culture.
- Recurring causal pattern: "workers inadvertently using nitrogen instead of air
  because of **interchangeable couplings** on lines and **poor or nonexistent
  labeling**." In one case "workers inadvertently connected the hose for their
  breathing-air respirator to a pure nitrogen line."
- "When fatalities and injuries occurred in **open areas**… the hazard of
  asphyxiation was not expected and personnel were typically caught off guard."

> **Course framing.** Nitrogen killed ~8 people a year in US workplaces over that
> decade while being, by volume, the most ordinary substance in the room. It is
> not exotic. The lethality comes from the absence of a warning channel, not from
> toxicity.

## 3.3 The quantitative ODH analysis method (national-lab practice)

**Explain this conceptually. It is not a procedure the reader should execute** —
it is performed by a designated, qualified ODH analysis authority, and the course
should say so.

### What it computes

A **fatality-rate figure of merit** with units of *fatalities per hour of
occupancy*, combining, for every credible release scenario, **how often the
release happens** with **how likely it is to kill someone if it does**.

Jefferson Lab states the formula and every symbol **[A]**:

> *f* = Σ *P*ᵢ *F*ᵢ
>
> where *f* = the ODH fatality rate (per hour); *P*ᵢ = the expected rate of the
> *i*-th type of event (per hour); *F*ᵢ = the fatality factor for the *i*-th type
> event.

— JLab ES&H Manual 6540 Appendix T4, §4.2,
<https://www.jlab.org/ehs/ehsmanual/6540T4.htm>

Berkeley Lab writes the same quantity as **φ = Σ Fᵢ Pᵢ** and notes it "is always
≤ 1." **[A]** — <https://ehs.lbl.gov/service/cryogenic-liquid-safety/oxygen-deficiency-hazard-analysis/>

Fermilab's own formulation includes a component-count term, **φ = Σ Nᵢ Pᵢ Fᵢ**,
where *N*ᵢ is the number of components of that type. **[B]** — Fermilab FESHM
4240 (not fetchable from this environment; see the "could not reach" note above).

LBNL is explicit about the provenance: "Fermilab essentially wrote the book (or
at least the chapter) on oxygen deficiency hazard (ODH) risk assessment… Here at
LBNL, we base all of our own oxygen deficiency hazard assessments on Fermilab's
model and methods." **[A]**

### The two halves of the model

LBNL describes the structure cleanly **[A]**:

> "There are two main pieces to determining the oxygen deficiency hazard (ODH)
> class of a given room: a model for determining the **oxygen concentration** in
> a given room based on the volume of inert gas released and the ventilation
> provided to the room; and a **risk analysis** to estimate the fatality rate for
> the given release scenario based on the risk of death from oxygen deficiency
> and the probability of the event occurring."

**Half 1 — concentration model.** An oxygen mass balance on the room. JLab's
appendix (excerpting FESHM 4240TA) enumerates five cases **[A]**:

- **A** — during release, perfect mixing, fan **blowing into** the volume
- **B** — during release, perfect mixing, fan **drawing from** the volume, ventilation rate **>** spill rate
- **C** — during release, perfect mixing, fan drawing from the volume, ventilation rate **≤** spill rate
- **D** — **after** release, perfect mixing
- **E** — **stratification** of inerting gases

with terms *C* (oxygen concentration), *Q* (ventilation rate), *R* (spill rate
into the confined volume), *V* (confined volume), *t*, *tₑ*.

Stated assumptions for cases A–D **[A]**: "complete and instantaneous mixing
takes place in the confined volume. This is only a good assumption where gases
have similar densities and/or mixing is 'vigorous'"; *Q*, *R*, *V* constant;
pressure stays near atmospheric via louvers or natural leakage; incoming air is
21 % O₂.

On stratification, JLab gives a rule that is worth quoting to students verbatim:
**"Stratification should not be used to reduce the risk."** **[A]** In other
words, you may be *penalised* for stratification but never *credited* for it.

**Half 2 — fatality factor.** *F*ᵢ is "the probability that a person will die if
the *i*-th event occurs. This value depends on the oxygen concentration, the
duration of exposure, and the difficulty of escape." **[A]** — JLab §4.5.

Anchor points, both labs agreeing **[A]**:
- **Above 18 % O₂ → *F*ᵢ = 0.** "All exposures above 18% are defined to not
  contribute to fatality."
- **At 18 % O₂ → *F*ᵢ = 10⁻⁷.**
- **At 8.8 % O₂ → *F*ᵢ = 1** (certain death). JLab: "That point was selected to
  be 8.8% oxygen, **the concentration at which one minute of consciousness is
  expected**."
- The relationship between them is logarithmic. LBNL gives the closed form:
  **f = 10^((65 − P_O₂)/10)**, with P_O₂ the oxygen **partial pressure in mmHg**,
  bounded by *p*=0 at ≥135 mmHg (18 % at 760 mmHg) and *p*=1 at ≤65 mmHg (8.8 %).
  Sanity check: 135 mmHg → 10⁻⁷ ✓, 65 mmHg → 1 ✓.
- JLab uses the **lowest attainable** concentration, not an average, "since the
  minimum value is conservative and not enough is understood to allow the
  definition of an averaging period." **[A]**

Note that LBNL, at ~1,000 ft elevation, uses **730 mmHg** rather than 760 mmHg
for atmospheric pressure — a reminder that the model runs on *partial pressure*,
so **altitude is a real input**. **[A]** Directly relevant to any propulsion test
site on high ground.

### Inputs the analysis needs

Compiled from JLab §1.0 and §4.1 and LBNL **[A]**:

- **Room/enclosure volume**, doorways, penetrations, passive vent areas,
  elevation views
- **Ventilation systems and capacities** (and whether ventilation is credited in
  each case — JLab requires this to be stated explicitly per case)
- **Inventory** of every ODH source: total quantity and continuous flow rates
- **Release scenarios**: "all possible cases… (instantaneous venting of entire
  ODH source, continuous flow into work space, etc.)", with gas mixing and
  stratification considered
- **Event rates *P*ᵢ** from operating experience, or published failure-rate data
- **Ease of egress**, and the work actually performed in the space
- **Existing ODH sources or installations** nearby
- Atmospheric pressure / altitude

LBNL adds site-specific scenarios — notably a **seismic scenario** in which all
cryogenic storage fails completely, with the rate derived from the USGS UCERF3
forecast (0.72 probability of M6.7+ in 30 years for the SF Bay Area →
4.84 × 10⁻⁶ per hour). **[A]** This is a good illustration for the course that
the scenario set is *site*-dependent, not generic.

**Example failure rates** (JLab Tables 2–3, "median estimates excerpted from
FESHM-4240 Technical Appendix, Rev 11/2016") **[A]**:

| Item | Failure mode | Rate |
|---|---|---|
| Dewar | Loss of vacuum | 1 × 10⁻⁶ /hr |
| Cryogenic fluid line | Leak / rupture | 5 × 10⁻⁷ /hr, 2 × 10⁻⁸ /hr |
| Header piping assembly | Rupture | 1 × 10⁻⁸ /hr |
| U-tube change | Small / large cryogen release | 3 × 10⁻² per demand, 1 × 10⁻³ per demand |
| Electrical power failure (unplanned) | Time / demand rate | 1 × 10⁻⁴ /hr, 3 × 10⁻⁴ /D (1 hr off) |

Note the U-tube figure: a **human-in-the-loop connection operation is four to
five orders of magnitude more likely to release cryogen than a pipe is to
rupture**. That is the single most instructive number in the table.

### ODH class ratings and what follows

**[A]** — JLab Table 1 (LBNL's cutoffs agree for classes 0–2):

| ODH Class | Worker-hours per expected fatality* | Φ (ODH fatality rate, per hour) |
|---|---|---|
| 0 | > 10 million | < 10⁻⁷ |
| 1 | 100,000 to 10 million | ≥ 10⁻⁷ and < 10⁻⁵ |
| 2 | 1,000 to 100,000 | ≥ 10⁻⁵ and < 10⁻³ |
| 3 | 10 to 1,000 | ≥ 10⁻³ and < 10⁻¹ |
| 4 | < 10 | ≥ 10⁻¹ |

\*JLab footnote: "2000 worker-hours equals one year."

JLab: **Classes 3 and 4 "are considered unacceptable as an ODH Risk Assessment
result. Further mitigations to lower the classification would be necessary before
the risks are considered acceptable."** **[A]**

The 10⁻⁷/hr line at the bottom of Class 0 is the definition of "not an ODH
operation" — Fermilab defines ODH operations as those exposing personnel to
fatality risk **in excess of 10⁻⁷/hr** from oxygen deficiency. **[B]** (FESHM
4240, unreachable; consistent with both JLab and LBNL tables which I did read).

**Mitigations that follow from the class**, per JLab §4.1.8 and §3.4 **[A]**:
- **Engineering controls** to obtain and *retain* the classification: ventilation,
  lintels (to stop dense gas pooling), penetration sealing, passive vent area
- **Area oxygen monitoring systems**, installed, maintained and **calibrated** by
  a named organisation
- **Alarms and signage / posting and labelling**, verified in place **before the
  ODH source is introduced**
- **Training** — JLab names a specific ODH training course as a qualification
  requirement for its analysis authority
- **Restricted access** and administrative controls appropriate to the class
- **Re-review every 3 years** while the ODH is present, or whenever conditions
  change

**Approval chain [A]:** JLab requires every ODH risk assessment be approved by
the primary ODH Analysis Authority, **a second independent ODH Analysis
Authority**, and the Engineering Division Manager or Cryogenic Department Head,
then submitted to the ODH Safety Reviewer for verification and approval. The
qualification bar for an ODH Analysis Authority is specified: an engineering or
physics degree plus five years' relevant experience, or professional engineering
registration plus experience, together with named technical proficiencies.

> **Course framing.** The ODH number is not the point. The point is that a room
> plus an inventory plus a ventilation rate produces a *defensible, reviewable
> number* which then drives monitoring, access and PPE — and that the number is
> computed by a qualified person and independently checked. A student group
> cannot self-certify this. The class of a given space is a **facility-specific**
> answer the course cannot supply.

**Other labs' framing.** SLAC covers the same ground in ES&H Manual Chapter 36,
*Cryogenic and Oxygen Deficiency Hazard Safety*, whose stated purpose is to
ensure work with cryogens and other oxygen-displacing gases "is performed safely,
avoiding such hazards as asphyxiation, pressure explosions, and cold burns,"
covering "the approval, use, and handling of such substances, including the
setting up of new operations and modification of existing operations." **[A]** —
<https://www-group.slac.stanford.edu/esh/eshmanual/pdfs/ESHch36.pdf>
CERN's HSE unit "provides assistance and support in the evaluation of oxygen
deficiency hazards and applicable mitigation measures, in facilities where inert
gases and cryogens are intended to be used," across "experimental areas,
accelerator facilities, laboratories, and workshops." **[A]** for that statement;
the page is a service directory and carries **no** thresholds or classification
scheme — <https://hse.cern/services-support/OHS/ODH-risk-management>

---

# 4. Confined spaces and low points

## 4.1 Why cold vapour collects low

Two separate effects, often conflated:

1. **Molecular weight.** Argon (M≈40) is denser than air at equal temperature.
   Nitrogen (M≈28) is very slightly lighter. Helium and hydrogen are far lighter.
2. **Temperature.** This usually dominates near a release. Boil-off leaves the
   liquid at its boiling point and is *enormously* denser than room air until it
   warms. UT Austin states it directly: "In the case of liquid argon and liquid
   nitrogen, the gas generated from malfunctioning equipment or spills will be
   **cold and denser than ambient air. Even well-ventilated lab spaces that have
   pits or other low-lying areas could have the oxygen displaced by this cold,
   dense gas.**" **[A]** — <https://ehs.utexas.edu/working-safely/equipment-safety/cryogens>

The consequence: **a nitrogen release is a low-lying hazard for as long as it
stays cold**, even though nitrogen gas at room temperature is neutrally buoyant.
The buoyancy reverses as it warms, which is why the danger zone moves.

## 4.2 The locations that matter

Pits, trenches, sumps, basements, crawl spaces, cold rooms, environmental
chambers, stairwells (which act as vertical drains), lift/elevator cars, and any
enclosure below grade or below the release point.

- **Small rooms and cold rooms**: Cornell — "Small spaces, environmental
  chambers, and cold rooms often do not have sufficient exhaust ventilation to
  support storage and use of cryogenic materials." **[A]** —
  <https://ehs.cornell.edu/book/export/html/1459>
- **Elevators** get specific treatment because the occupant cannot leave.
  Berkeley Lab: "The transportation of cryogenic liquids in elevators poses a
  potential asphyxiation and fire/explosion risk if workers become trapped in an
  elevator with a container of cryogen," and requires a risk assessment for the
  case where "a passenger is trapped in the elevator with the evaporating cryogen
  for a prolonged period." **[A]** UT Austin prohibits pressurised cryogen
  cylinders in passenger elevators outright and requires freight elevators, with
  the container sent unaccompanied. **[A]** Utah State: "Do not ride in the
  elevator with the liquid nitrogen. Make arrangements for someone to send the
  elevator to a receiving person waiting on the desired floor." **[A]** —
  <https://research.usu.edu/ehs/training-and-resources/liquid-nitrogen>
- **Lintels** appear in JLab's list of engineering controls precisely because a
  raised threshold stops dense gas draining into a lower space. **[A]**

## 4.3 OSHA confined-space framing

**[A]** — 29 CFR 1910.146,
<https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.146>

A **permit-required confined space** is a confined space with one or more of:

1. contains, or has the potential to contain, a **hazardous atmosphere**;
2. contains a material with the potential for **engulfing** an entrant;
3. has an internal configuration such that an entrant could be **trapped or
   asphyxiated** by inwardly converging walls or a downward-sloping, tapering
   floor;
4. contains **any other recognized serious safety or health hazard**.

A **hazardous atmosphere** includes "atmospheric oxygen concentration below 19.5
percent or above 23.5 percent."

Two points the course should draw out:

- Criterion (1) says **"has the potential to contain."** A pit that is fine today
  is a permit space if a credible cryogen release could make it hazardous. The
  classification follows the *potential*, not the *current* reading.
- The standard notes spaces may be entered without a written permit or attendant
  **only** where the space "can be maintained in a safe condition for entry by
  mechanical ventilation alone" — which is exactly the judgement the ODH analysis
  in §3 exists to support.

Whether a *given* pit, trench or test cell at a *given* facility is a permit
space is determined by that facility's confined-space programme. **The course
cannot answer it.**

---

# 5. Vapour clouds and visibility

## 5.1 The visible cloud is not the cryogen

The white cloud over a cryogenic release is **condensed atmospheric water
vapour** — fog formed in the ambient air chilled by the release. The cryogens in
question (N₂, O₂, Ar, He, H₂) are colourless gases. The cloud is therefore a
*tracer of chilled air*, not a map of the hazardous substance.

Even in dry conditions a liquid hydrogen spill "will create a white cloud of
condensed water vapor," and "the scope of visible cloud indicated by the condensed
water vapor **expands with the increasing air humidity**." **[C]** — synthesised
from the LH₂ dispersion literature summarised in search results; I could not
fetch the h2tools primary documents (403) and have not verified a direct quote.
Treat the humidity-dependence claim as needing a citation before print.

## 5.2 Why the hazardous envelope can be *larger* than the visible cloud

At the edges of the cloud the chilled air has mixed with enough warm ambient air
to rise back above its dew point — the fog evaporates while the displacing or
flammable gas is still present. "The warmer air on the outer edge of the vapor
cloud causes the gas to become invisible, making it possible to be in an
oxygen-enriched atmosphere, flammable atmosphere or in a gas that can cause
asphyxiation **without the gases being visible**." **[C]** — Firehouse Magazine,
<https://www.firehouse.com/rescue/article/10545542/cryogenic-liquids> (trade
press; the physics is sound and uncontroversial, the source is not authoritative
— find a better citation before printing).

Consequence: **the edge of the fog is not the edge of the hazard.** Standing just
outside the visible cloud is not a control.

## 5.3 Why the visible cloud can also be *smaller* — helium and hydrogen

For the light cryogens the failure mode inverts. Helium and hydrogen warm and
become buoyant very quickly, so the cold zone that sustains a fog is small and
short-lived while the gas itself continues to travel. Measurements on helium
releases show "the visible range of the helium vapor cloud is **much smaller**
than the measured combustible concentration range" at 50–70 % humidity. For
hydrogen, "rapid wind dissipates the water vapor cloud and also more rapidly
warms the cold hydrogen which now **rises invisibly without its water vapor
cloak**." **[C]** — same sourcing caveat as §5.1; the underlying studies are in
*Int. J. Hydrogen Energy* / *Cryogenics* but are paywalled and I did not read
them.

> **Course framing (safe to state at A-confidence as a principle):** for every
> cryogen, the visible cloud and the hazardous envelope are two different shapes,
> and neither reliably contains the other. For dense cold vapour the hazard
> extends beyond the fog and downward; for helium and hydrogen the hazard extends
> beyond the fog and upward, and may be effectively invisible throughout. Vision
> is not an instrument. Oxygen and flammable-gas monitoring is.

---

# 6. Condensed and solid air

## 6.1 Oxygen enrichment on LN₂-cooled surfaces

**The governing temperatures.** LN₂ boils at **77.4 K**. Oxygen boils at
**90.2 K**. Any surface held at LN₂ temperature is therefore **13 K below the
boiling point of oxygen** and will condense oxygen out of the air touching it.
Nitrogen (77.4 K) barely condenses; oxygen does preferentially. The condensate is
therefore **oxygen-enriched relative to air**. Temperatures **[A]** — LBNL
PUB-3000 Ch.29 Table A.1.

**What that gets you, quantitatively [A]** — LBNL PUB-3000 Ch.29:

- "Liquid nitrogen is cold enough to condense the surrounding air into a liquid
  form. The concentration of oxygen in this condensed air is enhanced. This
  condensed 'liquid air' can be observed **dripping from the outer surfaces of
  uninsulated/nonvacuum-jacketed lines carrying liquid nitrogen**. This 'liquid
  air' will be composed of **approximately 50% oxygen** and will amplify any
  combustion/flammable hazards in the surrounding areas."
- "**Open dewars of liquid nitrogen can condense oxygen from the air into the
  liquid nitrogen and cause an oxygen enrichment of the liquid that can reach
  levels as high as 80% oxygen.**"
- "Liquid helium can also condense air into a liquid or even solid with an
  enriched oxygen content."

Control: "Air should be prevented from condensing into liquid nitrogen with
**loose-fitting stoppers or covers that allow for the venting of nitrogen
boil-off gas**." **[A]** Note the same design tension as the gloves in §1.3 — the
cover must exclude air *without* sealing the vessel.

**The blue liquid on a cold trap.** Liquid oxygen is pale blue; condensed
oxygen-enriched air on a cold surface or in a trap is the visible signature of
this process. Cornell states the hazard chain **[A]**:

> "Since the boiling point of liquid nitrogen is below that of liquid oxygen, it
> is possible for oxygen to condense on any surface cooled by liquid nitrogen. If
> the system is subsequently closed and the liquid nitrogen removed, the
> evaporation of the condensed oxygen may **over-pressurize the equipment or
> cause a chemical explosion if exposed to combustible materials, e.g., the oil
> in a rotary vacuum pump**. In addition, **if the mixture is exposed to
> radiation ozone is formed, which freezes into ice and is very unstable. An
> explosion can result if this ice is disturbed.** For this reason, air should not
> be admitted to enclosed equipment that is below the boiling point of oxygen
> unless specifically required by a written procedure."

— <https://ehs.cornell.edu/book/export/html/1459>. Cornell adds the trapped-liquid
link: "If liquid nitrogen or helium traps are used to remove condensable gas
impurities from a vacuum system that may be closed off by valves, the condensed
gases will be released when the trap warms up." **[A]**

**Why the liquid is an oxidiser hazard.** LBNL: liquid oxygen "expands by 860
times when allowed to warm to room temperature. **A single drop of liquid oxygen
has as many oxygen molecules, and thus as much oxidizing power, as approximately
half a liter of air.**" Materials that burn readily in oxygen-rich environments
include "hair, clothing, oil, grease, kerosene, tar, asphalt, and many plastics
and rubbers," and "cloth and clothing can trap oxygen gas in the porous weave of
the fibers and **remain incredibly prone to ignition long after the source of
oxygen has been removed**." **[A]**

LBNL also notes two second-order cases **[A]**: "Large quantities of liquid
nitrogen spilled onto **oily surfaces (such as asphalt)** could condense enough
oxygen to present a combustion hazard"; and cryogens used "in high ionizing
radiation fields that can generate ozone or nitrogen oxides may cause a potential
explosion hazard when the cryogen condenses quantities of oxygen from the
atmosphere."

## 6.2 Solid air and ice plugs

**The mechanism.** LN₂ surfaces condense air; LHe surfaces (4.2 K) **freeze** it.
Air, CO₂ and water vapour entering a cold line or a vent path solidify and
accumulate until the passage is blocked. The plug then acts as a closed valve
(taxonomy item 9 in §2.3) — and it forms in the **vent and relief paths first**,
because that is where the cold gas meets the atmosphere.

**[A]** — LBNL PUB-3000 Ch.29: "The function of vent lines can be defeated by the
formation of ice (from condensed moisture) in the vent line. With LHe, air or
other gases can solidify to form this blockage." And: "The temperatures
associated with cryogenic liquids can easily condense moisture from the air and
cause the formation of ice. This ice can cause components or systems to
malfunction (e.g., can plug vent lines and impede valve operation) or can damage
piping systems."

**The worked example** is the ALS liquid helium cylinder in §2.5(iii) — an open
valve admitted air, which froze into "an impenetrable plug" above the liquid
helium, and the cylinder "may have exploded as the helium trapped below the plug
slowly vaporized." **[A]**

## 6.3 Icing of relief valves and vent stacks

This is where §2 and §6 meet, and it is the reason a correctly-specified relief
can still fail to protect.

**[A]** — LBNL PUB-3000 Ch.29:

- Relief devices "must not cease to function in extreme cold temperatures **or be
  subject to failure from ice buildup**, and must have the flow capacity to safely
  vent excess gas without further buildup of pressure inside the system." They
  must also not shift set pressure when taken from ambient to cryogenic
  temperature.
- **Ice can lock a relief valve open**: "Ice on the pressure relief valve can lock
  the pressure relief valve in the open position." (LBNL's instruction is to call
  the manufacturer or vendor — deliberately *not* a user task.)
- Conversely, unexplained ice is a **diagnostic**: "any ice buildup that cannot be
  explained through normal operation of the cylinder may be a sign of a defective
  cylinder," and on a vacuum-jacketed vessel "ice should not form on the outside
  of the aluminum casing — **ice formation is a clear sign that the vacuum jacket
  has failed**."

**Both failure directions matter and the course should say both:**

| Icing failure | Consequence |
|---|---|
| Relief **frozen shut** / vent stack plugged | System is now an unrelieved closed volume → §2 |
| Relief **frozen open** | Continuous cryogen release → §3 ODH, and inventory loss |

The Texas fire marshal incident (§2.5(ii)) is the extreme version of the first
row, with brass plugs instead of ice.

---

# 7. Brittle failure and structural hazards

## 7.1 Low-temperature embrittlement

**The mechanism.** Many structural materials — notably carbon steels and many
ferritic steels — undergo a **ductile-to-brittle transition** as temperature
falls. Above the transition they yield and deform before failing; below it they
fracture with little or no plastic deformation, fast, and often from a small
flaw. Face-centred-cubic metals (austenitic stainless steels, aluminium alloys,
copper) largely do not show this transition and are the usual cryogenic choices.
**[B]** — standard materials science; the specific alloy behaviour is documented
in NASA NSS 1740.16 but that PDF's text layer was not reliably readable here, so
no quotation is offered.

**Published statements at university-policy level [A]:**

- Cornell: "**Materials and Construction Hazards** — The selection of materials
  calls for consideration of the effects of low temperatures on the properties of
  those materials. **Some materials become brittle at super low temperatures.
  Brittle materials fracture easily and can result in almost instantaneous
  material failure.**"
- Cornell also flags the everyday case: cryogens "make many materials brittle,
  such as the epoxy or phenolic resin that laboratory benchtops and sinks are
  made of."

— <https://ehs.cornell.edu/book/export/html/1459>

**Why this matters for the course:** embrittlement is a *silent design-time*
failure. The system passes a room-temperature pressure test and fails cold. It
also converts every §2 overpressure event from a leak into a fragmentation event,
because a brittle vessel does not bulge and weep, it bursts.

**Related structural effects** the course should name **[C]** unless otherwise
noted:
- **Thermal contraction** over a long run is large and must be accommodated
  (bellows, expansion loops, sliding supports); restraint produces very high
  loads.
- **Differential contraction** at dissimilar-material joints loosens seals and
  bolted connections that were tight warm.
- **Loss of vacuum in a VJ line** causes sudden heat leak, external icing and
  rapid boil-off — an ODH source and a §2 pressurisation source at once.
  **[A]** — LBNL lists dewar loss of vacuum at 1 × 10⁻⁶/hr in the ODH failure
  data, so it is a *credible* scenario, not an exotic one.
- **Glass dewars**: LBNL notes these are "the most fragile of all cryogenic
  liquid containers… when they do shatter the process is quite energetic and
  fragments of glass may be ejected from the top opening of the flask at high
  speed," and that wrapping them with tape/plastic "has not been proven to be
  effective." **[A]**

## 7.2 Spills onto concrete and asphalt

**Thermal damage / spalling [B].** A cryogenic spill onto concrete drives a
severe thermal gradient into the surface; moisture in the pores freezes and
expands. The result is surface spalling and cracking. Berkeley Lab records the
general property-damage class — release "can damage equipment and property (e.g.,
frozen water pipes, **damaged flooring**, damaged electrical cables and their
insulation)" **[A]** — but I did **not** find a free authoritative source that
specifically quantifies cryogenic spalling of concrete. **Do not put a number on
this in the course.**

**LOX on asphalt — the honest version.** This is a case where the folk teaching
is stronger than the evidence, and the course should say so plainly, because
overstating it costs credibility on everything else.

*The origin.* NASA field-tested LOX-soaked asphalt and runway materials in 1973
using a remotely-released "plummet" impactor. The test detonated, blowing "the
test apparatus 30 m into the air" and creating "a debris field 50 m in diameter."
**[A]** — as described and reproduced by Utah Valley University researchers,
*Oxygen impact and reactivity trials: A new perspective on emergency response
precautions*, PMC10011059,
<https://pmc.ncbi.nlm.nih.gov/articles/PMC10011059/>

*The crucial detail.* The NASA test stratum was **not** simply asphalt and LOX.
It was "2.5 cm of crumbled asphalt on which a **2.5 cm thick solid aluminum
block** was placed, covered by an additional 2.5 cm of crumbled asphalt, then
immersed in LOx." **[A]**

*The 2021–23 replication.* UVU rebuilt the test to ASTM G86-17 and found **[A]**:
- They **successfully replicated NASA's detonations** — but "a reaction would
  only occur if the unique NASA stratum consisting of a solid aluminum block
  resting on and covered by crumbled asphalt was used."
- "Explosions could not be replicated using **solid or crumbled asphalt and LOx
  alone**, a much more likely configuration."
- "**LOx-soaked and frosted over asphalt will not react to impact pressure
  alone.**" No reactions from driving fire apparatus through a LOX pool on
  asphalt; none from dropped tools; none from a simulated sledgehammer strike.
- Under the NASA stratum they observed 5 reactions in 20 drops (25 %); ASTM G86-17
  classifies a material "reactive" at ≥1 in 20 (5 %). Drop height 110 cm, impact
  force 99.7 kg, pressure 7722 kPa.
- Separately and importantly: LOX "will not react on contact with common
  combustibles… unless an **ignition source** is introduced — in which case the
  combustion will be violent and instantaneous," and "**immediate and violent
  reactions were observed** when pilot ignition or arc ignition was used to
  initiate combustion when combustible materials were in an ultra-high gaseous or
  liquid oxygen environment."

> **Course framing.** The accurate statement is: *LOX plus asphalt plus a
> confining metal interface plus a sharp impact is a demonstrated detonable
> combination; LOX plus asphalt plus ordinary foot and vehicle traffic is not.
> But LOX plus any combustible plus any ignition source is violent and immediate,
> and that is the case you will actually meet.* Teaching "the asphalt will
> explode if you step on it" is not supported by the replication study; teaching
> "do not put LOX near hydrocarbons, and treat every ignition source as
> disqualifying" is fully supported. LOX-soaked porous materials — asphalt,
> clothing, insulation — stay hazardous after the visible frost is gone (see
> LBNL on clothing in §6.1).

## 7.3 Rapid phase transition and BLEVE-type events — conceptual

**BLEVE (boiling liquid expanding vapour explosion).** A pressurised vessel
holding liquid above its atmospheric boiling point fails; the depressurisation
flashes a large fraction of the liquid to vapour essentially instantaneously; the
expansion produces a blast wave and fragments, and — if the fluid is flammable —
a fireball.

**[A]** — LBNL PUB-3000 Ch.29 names the mechanism in the cryogenic context: "If a
cryogenic fluid is subjected to a large amount of heat input, a flash
vaporization can occur. This will result in a rapid pressure rise that can be
described as a BLEVE (boiling liquid expanding vapor explosion)."

**[A]** — CSB confirms the Williams Olefins rupture "caus[ed] a boiling liquid
expanding vapor explosion (BLEVE) and fire."

**Rapid phase transition (RPT).** Where a cryogen contacts a much warmer liquid
(most classically LNG on water), heat transfer can become so fast that the cryogen
flashes explosively without any combustion — a purely physical explosion.
**[C]** — I did not secure an authoritative free citation for RPT in this
research pass. If the course covers it, source it properly first; do not rely on
this note.

**Two points to draw out conceptually:**
- BLEVE requires **no combustion**. The blast is stored thermodynamic energy. A
  nitrogen or helium vessel can BLEVE.
- The §2 trapped-liquid case and the BLEVE case are the same physics at different
  boundaries: in §2 the container holds and the pressure climbs; in a BLEVE the
  container lets go and the energy is released at once. Both are governed by how
  much liquid is confined and how much heat reaches it.

---

# 8. Institutional review practice

What a university actually requires before a group operates cryogens — and
especially LOX/methane — assembled from **real, published** policies. Every item
below has at least one working citation to an institution that actually imposes
it.

## 8.1 The gates, with real examples

### (a) Prior approval, hazard analysis and engineering code review

Cornell requires, for the two propellant-relevant cryogens, an explicit
pre-approval gate **[A]**:

> "**Any proposal for the use of liquid hydrogen must obtain prior approval and
> undergo an EHS risk assessment and engineering code review.**"
>
> "**Any proposal to use liquid oxygen must obtain prior approval and undergo an
> EHS risk assessment and engineering code review.**"

— <https://ehs.cornell.edu/book/export/html/1459>

This is the single most transferable finding for the course: at a real R1
university, LOX and LH₂ are not "buy it and start" materials. They are
**proposal-and-approval** materials, and the review is explicitly *both* a safety
review *and* a code review.

Berkeley Lab's general framing: "Before work with cryogenic liquids is
undertaken, an oxygen-deficiency risk assessment must be conducted… Any
reasonably foreseeable accidents (i.e., spillage, ice plug, cold burns, etc.)
should be taken into account and appropriate contingency plans implemented."
**[A]** — PUB-3000 Ch.29.

### (b) Pressure-system review / registration

Many universities run a formal pressure-safety programme. **MIT's is the best
published example of a *tiered* one [A]** — *Laboratory Use of Research Pressure
Vessel Systems*, EHS-0082 Rev 2.0,
<https://ehs.mit.edu/wp-content/uploads/EHS_0082.pdf>

MIT defines a pressure vessel system as "any vessel or enclosure that are capable
of building an internal pressure in excess of **15 psi** or 1 Atmosphere," then
grades requirements by pressure and hazard:

| Category | Definition | Adds |
|---|---|---|
| A1 | < 50 psi, no hazardous chemicals | Review guidelines; review manufacturer manual; review pressure calculations with PI |
| A2 | < 50 psi, hazardous chemical or dangerous condition | + review test procedures with Safety Team Member & EHS Coordinator; leak test before experiments |
| B1 | 50–500 psi, no hazardous chemicals | + **add to Pressure Vessel Master List**; **add PV hazard to PI Space Registration** |
| B2 | 50–500 psi, hazardous chemical or dangerous condition | + **review design build with Safety Team Member & EHS Coordinator**; **complete a PV SOP template** |
| C | **> 500 psi, regardless** of chemicals | All of the above; MIT states explicitly there is no lower-tier option in this category |

Other MIT requirements worth lifting **[A]**:
- "All research pressure vessel systems should undergo a **comprehensive risk
  assessment prior to initial installation, after any alterations, modifications,
  repairs or relocation.**"
- "A pressure vessel system's weakest component shall be rated to **no less than 4
  times the maximum allowable working pressure (MAWP)**."
- "Every pressure vessel system shall have at least one safety or other equivalent
  fitting to relieve pressure at or below the system MAWP. Pressure Vessel Systems
  shall NOT be operated without an appropriate and properly functioning pressure
  gauge and safety relief."
- "**No safety relief valves shall be removed** and the design function of said
  safety relief valves shall not be restricted by tie downs, paint, blocks, caps,
  or any other means." (Compare §2.5(ii): brass plugs.)
- "Build the **minimum size system possible to minimize the amount of stored
  energy**."
- **Hydraulic testing is preferred to pneumatic** "for safety reasons because much
  less energy is stored in compressed liquid than in compressed gas."
- The EHS Office must "**Create and maintain a Research Pressure Vessel System
  Master List**," and coordinate decommissioning and removal from the list.
- "**No one may use a pressure vessel system without adequate hands-on training**
  in safe operation and emergency shutdown of the specific pressure system."
- PI/lab supervisors must "**Ensure no working alone** with specific pressure
  vessel systems, as determined by potential hazards."

Berkeley Lab's Chapter 7 – Pressure Safety and SLAC's Chapter 14 – Pressure
Systems are the national-lab analogues; SLAC's cryogenic chapter explicitly
cross-references its pressure-systems chapter, confirming that **a cryogenic
system is a pressure system and gets reviewed as both**. **[A]** —
<https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch07/>,
<https://esh.slac.stanford.edu/hazardous_activities/pressure>,
<https://www-group.slac.stanford.edu/esh/eshmanual/pdfs/ESHch36.pdf>

### (c) Standard operating procedures

Required at MIT for categories B2 and C, per-system ("If there are multiple PV
systems in the lab, **each needs an SOP**"), on an EHS-supplied template,
"including warning signs and emergency shutdown procedures," and reviewed by both
the EHS Office and EHS Coordinators. **[A]**

### (d) Training and documented competency

- MIT: hands-on training on the **specific** system, plus annual
  laboratory-specific chemical hygiene / hazard communication training that
  includes pressure-system safe operation and emergency shutdown; training records
  retained. **[A]**
- MIT: "**Train at least 1 person in the lab on emergency response procedures so
  they can shut down the PV system when the owner is out of the lab.**" **[A]**
  (Single-point-of-knowledge is treated as a hazard.)
- LBNL: on-the-job training may be required for some cryogen systems and "it is
  highly recommended that this OJT requirement be documented" by the PI or
  supervisor. **[A]**
- JLab: named training course plus specified degree/experience/registration
  criteria for the ODH Analysis Authority role. **[A]** (§3.3)

### (e) PPE programme

Selection is a documented programme output, not a personal choice: LBNL publishes
a PPE Selection Guide for cryogens and a hazard-vs-PPE matrix by task (open-dewar
work, handling chilled transfer lines, dispensing to an open dewar, closed
pressurised transfer), and states that PPE "is a Last Line of Defense." **[A]** —
PUB-3000 Ch.29 and
<https://ehs.lbl.gov/service/cryogenic-liquid-safety/cryogenic-liquid-burns-and-frostbite/>

### (f) ODH assessment

See §3.3. Required before introducing the source; approved by named authorities;
re-reviewed on a fixed cycle; drives monitoring, alarms, posting, access and PPE.
**[A]** — JLab, LBNL.

### (g) Fire marshal / AHJ, permits, quantity limits and siting

- The **AHJ** (campus fire marshal, or the municipal fire department) is the body
  that adopts and enforces the fire code edition in force. Whether a given
  inventory needs a permit, and which permit, is **entirely facility- and
  jurisdiction-specific**.
- The mechanism to teach is the **maximum allowable quantity (MAQ) per control
  area**: fire codes set a threshold quantity of each hazard class per control
  area; exceeding it reclassifies the space to a high-hazard (Group H) occupancy
  with much heavier construction, separation, ventilation and suppression
  requirements. Control areas are separated by fire barriers, and their permitted
  number per floor is limited. **[A]** for the control-area mechanism — ICC,
  <https://www.iccsafe.org/building-safety-journal/bsj-technical/code-corner-2024-international-fire-code-tables-5003-1-11-and-5003-1-12-maximum-allowable-quantities/>;
  IFC §5003.1.1 and Tables 5003.1.1(1)/(2),
  <https://codes.iccsafe.org/s/IFC2021P1/part-v-hazardous-materials/IFC2021P1-Pt05-Ch50-Sec5003.1.1>
- **NFPA 55**, *Compressed Gases and Cryogenic Fluids Code*, is the parallel
  standard covering storage, use and handling of compressed gases and cryogenic
  fluids, including separation and siting. **[B]** — cited by number;
  <https://www.nfpa.org/product/nfpa-55-code/p0055code>
- **The numbers are deliberately not reproduced here.** The MAQ tables are
  copyrighted, edition-dependent, and modified by local amendments; a number
  quoted from the wrong edition is worse than no number. The course should state
  the mechanism and direct readers to the edition their AHJ has adopted.
- The Texas State Fire Marshal alert (§2.5(ii)) is a published example of a fire
  authority issuing **university-directed** minimum requirements after a campus
  cryogenic failure **[A]**: repair/replace/remove leaking or damaged cylinders
  and systems; implement and sustain a preventative maintenance programme
  including "periodic inspection of all cryogenic fluid storage systems and
  **replacement of pressure relief valves every five years**," with inspection
  records available to the user or AHJ on request; ensure "an individual trained
  in tank usage be in attendance at all times cryogenic fluid is transferred"; and
  perform all service/repair/modification/removal of valves and pressure-relief
  devices "in accordance with National Fire Protection Association (NFPA) Standard
  55 and the Compressed Gas Association (CGA) guidelines."

### (h) Emergency response coordination

MIT requires the EHS Office to "**Ensure emergency response procedures for
major/high hazard pressure vessel system installations have been developed and
disseminated to emergency response personnel** and affected DLCs." **[A]** JLab
requires ODH equipment safeguards, posting and labelling to be verified in place
**before** the hazard is introduced, and coordination with the group that
installs and calibrates area oxygen monitoring. **[A]**

### (i) Insurance / risk management review

**[C]** — I found no published university policy stating this explicitly in this
research pass. It is standard practice for high-consequence student activities
(and is why many universities route rocketry through a risk-management office),
but **it is not evidenced here**. Either source it before printing or present it
as "expect this, ask about it" rather than as a cited requirement.

## 8.2 A published rocket-propulsion-lab safety framework

This is the weakest-sourced part of the file and the course should be honest
about it.

- **AIAA 2021-3273**, *Development of Safety Processes for Design and Manufacture
  of Small Liquid Propellant Engines and Launch Vehicles*, AIAA Propulsion and
  Energy Forum, 2021. DOI <https://doi.org/10.2514/6.2021-3273>. **[C]** —
  **paywalled; I retrieved the title and venue only and could not read the
  abstract or body.** Cite it as "a published treatment exists" and nothing more
  until someone reads it.
- Secondary indications that university propulsion groups apply standard process
  safety tooling — e.g. a Cal Poly Pomona liquid rocket lab reportedly performing
  **FMEA** on system elements and developing oxygen-compatibility and cleaning
  procedures — appeared in search results but **I could not verify any of them
  against a primary document**. **[C]**, do not cite.

**What *is* solidly available** and should carry this part of the course instead:
the national-lab and university frameworks in §8.1, which are public, current,
and cover every element a propulsion group needs — pressure system review, ODH
assessment, SOPs, training, PPE programme, AHJ approval. A student propulsion
group operating LOX/methane is, from an institutional standpoint, a **pressure
system + cryogen + flammable gas + oxidiser** problem, and each of those already
has a published, citable university programme.

---

# 9. Hazard-analysis methods

Conceptual explanations with citable anchors. The organising point for the
course: **these are not competitors, they are different lenses, and mature
programmes use several.** The main axes are (i) inductive vs deductive, (ii)
qualitative vs quantitative, and (iii) component-focused vs deviation-focused vs
task-focused.

## 9.1 The regulator's list

OSHA's Process Safety Management standard names the acceptable methodologies
outright — a useful, citable canon **[A]**, 29 CFR 1910.119(e)(2),
<https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.119>:

> "The employer shall use one or more of the following methodologies that are
> appropriate to determine and evaluate the hazards of the process being
> analyzed: (i) What-If; (ii) Checklist; (iii) What-If/Checklist; (iv) Hazard and
> Operability Study (HAZOP); (v) Failure Mode and Effects Analysis (FMEA); (vi)
> Fault Tree Analysis; or (vii) **An appropriate equivalent methodology**."

The same paragraph requires the analysis be "appropriate to the complexity of the
process," and 1910.119(e)(3) requires it to address, among other things, "the
hazards of the process" and "the identification of any previous incident which
had a likely potential for catastrophic consequences." **[A]** See also OSHA
3132, *Process Safety Management*,
<https://www.osha.gov/sites/default/files/publications/osha3132.pdf> **[A]**

## 9.2 Method by method

| Method | Reasoning direction | What it is good at | When it is used |
|---|---|---|---|
| **Preliminary hazard analysis (PHA)** | Broad, non-scenario | Enumerating the hazard *inventory* — energies, materials, environments — before a design exists | Earliest concept phase; feeds requirements and sets which deeper studies are needed |
| **What-if** | Inductive, open | Surfacing scenarios that a structured method's keywords would miss; fast; needs experienced people | Small/moderate systems; early design; supplementing a checklist |
| **Checklist** | Inductive, closed | Completeness against known/codified failure modes; repeatable; weak on novelty | Mature, well-understood designs; as a backstop to what-if |
| **What-if/Checklist** | Both | Brainstorming breadth with a completeness backstop | Very common compromise for moderate complexity |
| **HAZOP** | Inductive, systematic | Exhaustive coverage of **process deviations** in flow systems; excellent for piping, valves, and exactly the §2 trapped-liquid class of hazard | Detailed design onward, on a fixed P&ID |
| **FMEA / FMECA** | Inductive, bottom-up | Systematic coverage of **component** failure modes and their effects; FMECA adds criticality ranking | Hardware design; feeds maintenance, redundancy and instrumentation decisions |
| **Fault tree analysis (FTA)** | **Deductive, top-down** | Starting from one defined undesired event and finding all combinations of causes; quantifiable; handles common-cause | When one specific catastrophic outcome must be understood or given a probability |
| **Job hazard analysis (JHA)** | Task-focused | Hazards of the **human task** — the worker, the task, the tools, the environment | Any operation with people in the loop; see the U-tube failure rate in §3.3 |
| **Layers of protection analysis (LOPA)** | Semi-quantitative | Testing whether the independent protection layers on one scenario actually reduce risk enough | After a HAZOP, on the scenarios that mattered |

### HAZOP specifics

HAZOP divides the system into **nodes**, applies a **parameter** (flow,
pressure, temperature, level, composition), and combines it with a **guide word**
to generate a **deviation** whose causes, consequences and safeguards are then
examined. The standard guide-word set is **no/none, more, less, as well as, part
of, reverse, other than**, with **early/late/before/after** added for
time-sequenced operations. **[B]** — the canonical reference is IEC 61882:2016,
*Hazard and operability studies (HAZOP studies) — Application guide*,
<https://webstore.iec.ch/en/publication/24321>; the standard is paywalled and I
did not read it, so the guide-word list is stated from general knowledge and
should be checked against IEC 61882 before printing.

> **Why HAZOP is the right lens for §2.** "No flow" and "reverse flow" on a
> segment, and "more pressure" on an isolated node, are exactly the deviations
> that surface trapped-liquid traps. A component-level FMEA can pass every part
> as healthy while the *configuration* is lethal. Williams Olefins (§2.5(i)) was
> a configuration hazard, not a component failure — and CSB found the
> organisation's process hazard analysis programme deficient.

### FTA vs FMEA — the direction distinction

FTA is **deductive**: start at the top event ("unrelieved overpressure of segment
X") and decompose downward through AND/OR gates to basic events. FMEA is
**inductive**: start at each component, ask how it can fail, and propagate the
effect upward. FTA answers "what combinations produce this disaster?"; FMEA
answers "what does this part's failure do?" Neither substitutes for the other.
**[B]** — the distinction is standard; NASA's System Safety Handbook treats FMEA
and HAZOP as "hazard-centric analysis techniques" that are "valuable elements of
systems safety" while noting they are "limited in their ability to identify
hazardous system **interactions**," which is why non-hazard-centric methods (PRA)
are also used. **[A]** — NASA/SP-2010-580, *NASA System Safety Handbook, Volume
1*, <https://ntrs.nasa.gov/api/citations/20120003291/downloads/20120003291.pdf>

### JHA specifics

**[A]** — OSHA 3071, *Job Hazard Analysis*,
<https://www.osha.gov/sites/default/files/publications/osha3071.pdf>

> "A job hazard analysis is a technique that focuses on job tasks as a way to
> identify hazards before they occur. It focuses on the **relationship between
> the worker, the task, the tools, and the work environment**."

OSHA's prioritisation criteria are directly applicable to a student propulsion
group **[A]**: give priority to "jobs with the highest injury or illness rates"
and "**jobs with the potential to cause severe or disabling injuries or illness,
even if there is no history of previous accidents.**" The second criterion is the
one that matters — a group with a clean record and a LOX system is squarely in
scope. OSHA also notes the analysis "can be a valuable tool for training new
employees," which maps onto annual membership turnover.

### LOPA specifics

LOPA sits between qualitative HAZOP and fully quantitative FTA/ETA in rigour. It
takes a single HAZOP scenario, estimates the initiating-event frequency, and
credits each **independent protection layer** (IPL) with an order-of-magnitude
probability of failure on demand, multiplying through to a mitigated frequency
which is compared against a tolerable-risk target. An IPL must be **independent**
of the initiating cause and of the other layers, **effective** against that
scenario, and **auditable**. **[C]** — conceptually standard (CCPS *Layer of
Protection Analysis*), but I did not secure an authoritative free citation in
this pass; source before printing.

The concept the course actually needs is the underlying one — **independent
protection layers** — and the Williams case supplies the A-grade illustration:
a locked-open block valve is not independent of human action, so relying on it in
place of a dedicated relief valve removed a layer rather than adding one. **[A]**

## 9.3 Design review gates

**[A]** — NASA NPR 7123.1D, Appendix G,
<https://nodis3.gsfc.nasa.gov/displayDir.cfm?Internal_ID=N_PR_7123_001D_&page_name=AppendixG>

NASA's required minimum set of technical reviews runs MCR → SRR/MDR → SDR → PDR →
CDR → TRR → SAR → FRR → ORR → DR. Reviews are **event-based**, held before
management reviews when progressing from one life-cycle phase to the next, and
each has published **entrance criteria** and **success criteria**. The three the
course should teach:

- **PDR** — "demonstrates that the preliminary design meets all system of
  interest requirements with acceptable risk and within the cost and schedule
  constraints and **establishes the basis for proceeding with detailed design**."
- **CDR** — "demonstrates that the maturity of the design is appropriate to
  support proceeding with **full-scale fabrication, assembly, integration, and
  test**… determines that the technical effort is on track to complete the system
  development, meeting functional and performance requirements within the
  identified cost and schedule constraints at an acceptable risk."
- **TRR** — held "**for each planned test or series of tests**," it "ensures that
  the **test article (hardware/software), test facility, support personnel, and
  test procedures are ready** for testing and data acquisition, reduction, and
  control."

Three structural features worth drawing out for students **[A]**:

1. **Entrance criteria are gates, not paperwork.** A review has criteria for
   being *allowed to hold it*, e.g. for PDR: "all planned lower level PDRs and
   **peer reviews** have been successfully conducted, and RID/RFA/Action Items
   have been addressed with the originator."
2. **Open items must be closed or have a closure plan.** The recurring formula is
   "all RFAs and RIDs have been addressed and resolved, **or a timely closure plan
   exists** for those items remaining open." Nothing is silently dropped.
3. **TRR is per-test.** A group does not pass "the safety review" once. Each test
   campaign has its own readiness gate covering hardware, facility, **people**,
   and procedures.

**Independent peer review.** NPR 7123.1D threads peer reviews through the
entrance criteria of essentially every life-cycle review **[A]**. The principle
the course should state: the reviewer must not be the designer, and must have
standing to say no. JLab's ODH approval chain (§3.3) is the same principle made
concrete — **a second, independent qualified authority must approve**, not merely
comment. **[A]** MIT's requirement that design plans be reviewed with an EHS
Safety Team Member and EHS Coordinator **before building** is the university-scale
version. **[A]**

---

# 10. Source register

Fetched and read directly for this file unless marked otherwise.

## Regulators and federal bodies
| Source | URL | Used for |
|---|---|---|
| OSHA 29 CFR 1910.146, Permit-required confined spaces | <https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.146> | §3.1, §4.3 |
| OSHA 29 CFR 1910.119, Process safety management | <https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.119> | §9.1 |
| OSHA 3132, Process Safety Management | <https://www.osha.gov/sites/default/files/publications/osha3132.pdf> | §9.1 |
| OSHA 3071, Job Hazard Analysis | <https://www.osha.gov/sites/default/files/publications/osha3071.pdf> | §9.2 |
| CSB, *Hazards of Nitrogen Asphyxiation*, 2003-10-B (11 Jun 2003) | <https://www.csb.gov/assets/1/6/nitrogen_asphyxiation_safety_bulletin_(6-11-03).pdf> | §3.1, §3.2 |
| CSB, Williams Olefins final case study (19 Oct 2016) | <https://www.csb.gov/csb-releases-final-case-study-into-2013-explosion-and-fire-at-williams-olefins-plant-in-geismar-louisiana/> | §2.5(i), §7.3, §9.2 |
| Texas State Fire Marshal's Alert, 22 Feb 2006 | <https://www.tdi.texas.gov/fire/documents/fmred022206.pdf> | §2.5(ii), §8.1(g) |

## National laboratories
| Source | URL | Used for |
|---|---|---|
| LBNL PUB-3000 Ch.29, Safe Handling of Cryogenic Liquids | <https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch29/> | §1, §2, §6, §7 — **the single richest source in this file** |
| LBNL, Oxygen Deficiency Hazard Analysis | <https://ehs.lbl.gov/service/cryogenic-liquid-safety/oxygen-deficiency-hazard-analysis/> | §3.3 (fatality-factor formula, class table, model structure) |
| LBNL, The Leidenfrost Effect | <https://ehs.lbl.gov/service/cryogenic-liquid-safety/the-leidenfrost-effect/> | §1.2, §1.3 |
| LBNL, Cryogenic Liquid Burns and Frostbite | <https://ehs.lbl.gov/service/cryogenic-liquid-safety/cryogenic-liquid-burns-and-frostbite/> | §1.4, §1.5 |
| LBNL PUB-3000 Ch.07, Pressure Safety | <https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch07/> | §8.1(b) |
| Jefferson Lab ES&H Manual 6540 Appendix T4, ODH Risk Assessment | <https://www.jlab.org/ehs/ehsmanual/6540T4.htm> | §3.3 — **the primary ODH methodology source** |
| SLAC ES&H Manual Ch.36, Cryogenic and ODH Safety | <https://www-group.slac.stanford.edu/esh/eshmanual/pdfs/ESHch36.pdf> | §3.3, §8.1(b) |
| SLAC ES&H Manual Ch.14, Pressure Systems | <https://esh.slac.stanford.edu/hazardous_activities/pressure> | §8.1(b) |
| CERN HSE, ODH Risk Management | <https://hse.cern/services-support/OHS/ODH-risk-management> | §3.3 (service-level statement only) |
| Fermilab FESHM 4240 / 4240TA | <https://publicdocs.fnal.gov/cgi-bin/RetrieveFile?docid=136&filename=FESHM+4240-June+2018.pdf&version=2> | **NOT FETCHED** — Cloudflare block; method verified via JLab + LBNL |

## NASA
| Source | URL | Used for |
|---|---|---|
| NASA NPR 7123.1D, Appendix G (life-cycle reviews) | <https://nodis3.gsfc.nasa.gov/displayDir.cfm?Internal_ID=N_PR_7123_001D_&page_name=AppendixG> | §9.3 |
| NASA/SP-2010-580, System Safety Handbook Vol. 1 | <https://ntrs.nasa.gov/api/citations/20120003291/downloads/20120003291.pdf> | §9.2 |
| NASA NSS 1740.16 (hydrogen) | <https://ntrs.nasa.gov/api/citations/19970033338/downloads/19970033338.pdf> | Downloaded; **text layer unusable, not cited** |

## Universities
| Source | URL | Used for |
|---|---|---|
| MIT EHS-0082, Laboratory Use of Research Pressure Vessel Systems | <https://ehs.mit.edu/wp-content/uploads/EHS_0082.pdf> | §8.1(b)–(d), (h) — **best tiered pressure programme example** |
| Cornell Laboratory Safety Manual §16.10, Cryogenic Material Safety | <https://ehs.cornell.edu/book/export/html/1459> | §4.2, §6.1, §7.1, §8.1(a) — **the LOX/LH₂ prior-approval gate** |
| UT Austin EHS, Cryogens | <https://ehs.utexas.edu/working-safely/equipment-safety/cryogens> | §4.1, §4.2 |
| Utah State University, Liquid Nitrogen | <https://research.usu.edu/ehs/training-and-resources/liquid-nitrogen> | §4.2 |
| Colorado State University, Cryogenic Safety Manual | <https://lasers.colostate.edu/wp-content/uploads/2019/04/Cryogenic-Safety-Manual.pdf> | §1.1, §1.4 |
| Yale EHS, Cryogen Use and Storage Guidelines | <https://ehs.yale.edu/resource/download/154> | Background |
| East Carolina University OEHS, Cryogenic Materials | <https://oehs.ecu.edu/chemical-hygiene/lab-safety/lab-safety-resource-index/cryogenic-materials/> | Background |
| CU Boulder Fire & Life Safety, gas storage | <https://www.colorado.edu/firelifesafety/sites/default/files/attached-files/gas_storage.pdf> | §8.1(g) control areas |

## Codes, standards and literature
| Source | URL | Status |
|---|---|---|
| CGA P-12, *Guideline for Safe Handling of Cryogenic and Refrigerated Liquids*, 7th ed., January 2023 | <https://legacy.cganet.com/Publication/Details.aspx?id=P-12> (publisher's page; title/edition/year verified there) | **Paywalled — cited by number only, contents not quoted.** The ANSI webstore mirror blocks automated access and its top hit is the superseded 6th ed. (2017) — cite the CGA page, not ANSI. |
| NFPA 55, Compressed Gases and Cryogenic Fluids Code | <https://www.nfpa.org/product/nfpa-55-code/p0055code> | Paywalled; cited by number |
| IFC §5003.1.1, MAQ per control area | <https://codes.iccsafe.org/s/IFC2021P1/part-v-hazardous-materials/IFC2021P1-Pt05-Ch50-Sec5003.1.1> | Mechanism only; tables not reproduced |
| ICC, Code Corner on IFC Tables 5003.1.1(1)/(2) | <https://www.iccsafe.org/building-safety-journal/bsj-technical/code-corner-2024-international-fire-code-tables-5003-1-11-and-5003-1-12-maximum-allowable-quantities/> | §8.1(g) |
| IEC 61882:2016, HAZOP studies — Application guide | <https://webstore.iec.ch/en/publication/24321> | Paywalled; guide words stated from general knowledge |
| API STD 521, Pressure-relieving and Depressuring Systems | (no verified free URL) | §2.4 item 4; cited by number **[B]** |
| UVU, *Oxygen impact and reactivity trials* (PMC10011059) | <https://pmc.ncbi.nlm.nih.gov/articles/PMC10011059/> | §7.2 — LOX/asphalt replication |
| AIAA 2021-3273, safety processes for small liquid propellant engines | <https://doi.org/10.2514/6.2021-3273> | **Paywalled; title only [C]** |

---

# 11. Open gaps — do not paper over these

Ranked by how much they would improve the course.

1. **Fermilab FESHM 4240 primary text.** Everything in §3.3 is verified through
   JLab and LBNL, but someone on an unblocked network should pull the Fermilab
   chapter directly to confirm the **φ = Σ NᵢPᵢFᵢ** form (the *N*ᵢ component-count
   term) and the ODH-class PPE/mitigation requirements per class, which JLab
   references but does not tabulate.
2. **HAZOP guide words** need a citation to IEC 61882:2016 or an equivalently
   authoritative source. Stated from general knowledge in §9.2 — **[B]**.
3. **LOPA / independent protection layers** needs a real citation (CCPS *Layer of
   Protection Analysis*). Currently **[C]**.
4. **Vapour-cloud visibility (§5)** is the weakest-sourced substantive section.
   The physics is not in doubt but the citations are trade press and paraphrased
   search results. The h2tools primary documents returned 403; try
   `h2tools.org/sites/default/files/dispersion.pdf` from another network, and the
   *Int. J. Hydrogen Energy* LH₂ dispersion papers.
5. **Concrete spalling from cryogenic spills** has no quantitative source here.
   Do not put a number on it.
6. **Rapid phase transition (RPT)** — §7.3 has no authoritative citation. Either
   source it or cut it.
7. **University rocket-propulsion-lab safety framework (§8.2)** — no verified
   primary example was obtained. Worth a dedicated effort: try Purdue Zucrow, Cal
   Poly Pomona LRL, Penn State, Georgia Tech, and read AIAA 2021-3273.
8. **Insurance / risk-management review (§8.1(i))** — asserted from general
   practice, not evidenced. Find a real university policy or reframe it.
9. **NFPA 55 / IFC MAQ numbers** — intentionally absent. If the course wants a
   worked example, get the specific adopted edition from a named AHJ and cite it
   as *that* jurisdiction's number, not as a general figure.
10. **β/κ_T values for cryogens** (§2.1) would let the course give a real
    psi-per-kelvin figure for the liquid-full hydraulic case. NIST REFPROP or the
    NIST Chemistry WebBook could supply these; not done here.

## Standing cautions for whoever writes the prose

- **Do not convert this file into procedures.** Every control described here is
  described so the reader understands *why it exists* and *what it protects
  against*. Sizing, setting, sequencing and handling are out of scope by design.
- **Do not generalise facility-specific answers.** ODH class, relief set
  pressures, permit routes, quantity limits, emergency numbers, confined-space
  classifications and ventilation rates are all local. Say so each time.
- **Keep the LOX/asphalt nuance (§7.2).** It is tempting to teach the scary
  version. The replication study does not support it, and overstating one hazard
  discredits the correctly-stated ones next to it.
- **The 10,000+ psi trapped-liquid figure is an endpoint, not a prediction.**
  Present it with its assumptions, as LBNL does, and say plainly that real
  hardware fails long before it.
