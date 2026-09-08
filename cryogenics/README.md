# Cryogenic Propulsion Hardware & Safety

**A Practical Introduction for Rocket Engine Engineers**

A compact course on the hardware, physics and hazards of cryogenic propulsion
systems — liquid oxygen, liquid methane, liquid nitrogen, and the gases that
live alongside them. Eight modules, 15–25 minutes each. Built to be worked
through and retained, not skimmed once.

The aim is specific: to let you hold an intelligent technical and safety
conversation with propulsion engineers, test engineers, faculty, facility
managers and a university EHS office **before** you are ever responsible for
operating any of this hardware.

---

## Read this part first

This course teaches you to **recognise hazards and review systems**. It does not
teach you to operate them, and it deliberately contains no operating procedures,
no transfer sequences, no firing procedures and no build recipes.

Completing it does not qualify you to work with LOX or methane. Nothing written
by an AI can do that. Competence with cryogenic propellants comes from trained
supervision on the actual hardware, written procedures specific to that
hardware, manufacturer instructions, and institutional approval — and this
course exists to make you a more useful and less dangerous person when you walk
into that environment, not to substitute for it.

Where a real task would require any of those things, the text says so and stops.

---

## Two ways to read it

- **In the browser, with progress tracking:**
  https://daxjdavis526.github.io/Projects/cryogenics/ — renders every module
  with its diagrams, remembers where you stopped, lets you mark modules done,
  record quiz scores, and export or import your progress as a small JSON file.
  Progress is stored in your browser; nothing is sent anywhere.
- **Offline, as one file:** download
  [`offline/CRYOGENICS-course.html`](offline/CRYOGENICS-course.html), save it
  anywhere, and double-click it. Same reader, whole course embedded, no internet
  needed.

The plain Markdown files also render on GitHub, without the progress tracking.

## How to work through it

Do the modules in order — each one leans on the last. Every module ends with a
five-question checkpoint quiz whose answers are hidden behind a **Show answers**
toggle. Answer them before you open it; the quizzes are where the material
actually sticks.

After Module 08, do the practical section and the safety-committee questions,
then sit the final exam, then attempt the capstone review before reading its
solution.

---

## Contents

### Modules
| # | module | what it covers |
|---|---|---|
| 01 | [What cryogenic actually means](modules/01-what-cryogenic-means.md) | saturation, latent heat, boiloff, two-phase flow, expansion, heat leak |
| 02 | [Meet the rocket cryogens](modules/02-meet-the-rocket-cryogens.md) | LOX, LCH4, LN2, LH2 compared — and why each is dangerous differently |
| 03 | [Cryogenic hardware](modules/03-cryogenic-hardware.md) | dewars, VJ piping, valves, reliefs, instrumentation, reading a P&ID |
| 04 | [Materials, seals and thermal contraction](modules/04-materials-seals-contraction.md) | contraction sums, embrittlement, why cold joints leak |
| 05 | [Universal cryogenic hazards](modules/05-universal-cryogenic-hazards.md) | cold injury, trapped liquid, relief philosophy, oxygen deficiency |
| 06 | [LOX is different](modules/06-lox-is-different.md) | oxygen compatibility, ignition mechanisms, cleanliness, incidents |
| 07 | [Liquid methane and methalox facilities](modules/07-methane-and-methalox.md) | flammability, dispersion, detection, area classification, escalation |
| 08 | [Understanding a cryogenic test stand](modules/08-reading-a-test-stand.md) | a full conceptual P&ID, walked node by node |

### Practice and assessment
| file | what it is |
|---|---|
| [How cryogenic operations are developed](practice/practical-engineering.md) | hazard analysis, FMEA, procedures, design reviews, TRR |
| [What the safety committee is going to ask me](practice/safety-committee-questions.md) | 20 real questions and what you would need to answer each |
| [Final exam](practice/final-exam.md) | 30 questions · [answer key](practice/final-exam-key.md) |
| [Capstone review](practice/capstone.md) | a flawed system to review · [instructor solution](practice/capstone-key.md) |

### Reference
| file | what it is |
|---|---|
| [Properties](reference/properties.md) | every fluid number used in the course, sourced |
| [Standards register](reference/standards.md) | designations, current editions, what each governs |
| [Sources](reference/sources.md) | annotated bibliography with working links |
| [Where to go next](reference/where-to-go-next.md) | the reading route to real competence |

---

## How the course handles facts

Cryogenic safety literature is full of numbers repeated without provenance. This
course tries not to add to that.

- Every physical number comes from [`reference/properties.md`](reference/properties.md),
  which records its source and a confidence label, and states the reference
  conditions. A ratio without its reference conditions is meaningless, and the
  course shows you why using a real example.
- Every standard cited carries its **edition and date**, verified, in
  [`reference/standards.md`](reference/standards.md). Several designations that
  circulate widely turn out to be wrong or superseded; the register lists those
  corrections rather than repeating them.
- Where a figure could not be verified, the text says so instead of printing it
  with false confidence.
- Where an answer depends on your specific facility, hardware or institution —
  which is often — the text says that too, rather than inventing a number you
  might act on.

The `_verify-*.md` files in `reference/` are the raw research worksheets behind
all of this. They are kept as the audit trail; you do not need to read them, but
they are there if you want to check something.

## Credits

Photographs are NASA's, used under NASA's media usage guidelines, with
per-image credits in [`img/CREDITS.md`](img/CREDITS.md). **NASA has not
reviewed, approved or endorsed this course.** Schematics and diagrams are
original.
