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
- **CGA P-12** *Safe Handling of Cryogenic Liquids* — paywalled. Cited by number
  and edition only; its contents are **not** quoted here.
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
