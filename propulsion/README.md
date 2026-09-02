# PROPULSION — A Rocket Propulsion Engineering Course

A self-contained, cited, two-semester-equivalent course on chemical rocket
propulsion: liquid bipropellant engines, solid rocket motors, and cold-gas
thrusters. Written to take an aerospace student with intermediate
thermodynamics and fluids to the point where they can read a NASA technical
report, an engine schematic, or a hot-fire data plot and follow what the
engineers are arguing about.

Everything is plain Markdown. Read it on GitHub, in an editor, or with any
Markdown viewer that renders `$…$` LaTeX. Problems and answer keys are in
**separate files** so you can sit the tests honestly.

---

## Two ways to read it

- **In the browser, with progress tracking:**
  https://daxjdavis526.github.io/Projects/propulsion/ — a reader that renders
  every chapter with math and diagrams, remembers where you stopped, lets you
  mark modules done, record quiz scores, tick the checklist, and export or
  import your progress as a small JSON file. Progress is stored in your
  browser; nothing is sent anywhere.
- **Offline, as one file:** download
  [`offline/PROPULSION-course.html`](offline/PROPULSION-course.html)
  (about 15 MB), save it anywhere, and double-click it. It is the same reader
  with the whole course embedded, so it works with no internet. Rebuild it
  after editing chapters with `python3 tools/build_offline.py`.

The plain Markdown files render on GitHub too, but without progress.

## How to use this course

1. Read [`reference/sources.md`](reference/sources.md) once. It is the
   annotated bibliography; every module cites into it by tag (e.g. `[SB]` for
   Sutton & Biblarz, `[SP-8089]` for the NASA injector monograph).
2. Sit the [diagnostic exam](00-diagnostic-exam.md) before reading anything.
   Score it with the [key](00-diagnostic-key.md). It tells you which of the
   foundations modules you can skim.
3. Pick a roadmap (below) and follow it in order. Every module ends with
   problems and a quiz; do them before opening the key.
4. Keep [`reference/engine-database.md`](reference/engine-database.md) open.
   Modules refer to real engines constantly; the database is the single
   source of numbers so figures are consistent across chapters.
5. Every few months, run through
   [`reference/checklist.md`](reference/checklist.md). Anything you cannot
   tick is your next study target.

## Epistemic labelling

The course tags claims so you know how much to trust them:

| tag | meaning |
|---|---|
| **[F]** | accepted engineering fundamental: derivable from conservation laws or thermodynamics |
| **[E]** | empirical rule or correlation: fitted to data, valid inside a stated range |
| **[H]** | historical practice: what was done, not necessarily what is done now |
| **[M]** | modern practice: what current programs do, as far as public record shows |
| **[R]** | emerging research: not yet standard practice |
| **[A]** | approximation: a simplification whose error you should be able to estimate |
| **[J]** | engineering judgment: a defensible choice, not a derivation |

Where sources disagree on a number (and for real engines they often do) the
text says so and gives both figures with their provenance rather than picking
one silently.

## Scope boundary

Part III covers solid rocket motors and their defense applications at the
level of engineering theory, publicly documented architectures, analytical
methods, manufacturing science, and failure analysis. It does not contain
propellant formulations beyond what NASA publishes in fact sheets,
processing procedures, or weapon-specific dimensions. Where a worked
example needs numbers, they are generic or fictional. The same boundary
applies to test operations: methodology and data interpretation, not
operational procedures.

---

## Table of contents

### Part I — Foundations
| # | module | key |
|---|---|---|
| 01 | [Thermodynamics for propulsion](part1-foundations/01-thermodynamics.md) | [key](part1-foundations/01-thermodynamics-key.md) |
| 02 | [Compressible flow and nozzles](part1-foundations/02-compressible-flow.md) | [key](part1-foundations/02-compressible-flow-key.md) |
| 03 | [Rocket performance: thrust, c*, Cf, Isp](part1-foundations/03-performance.md) | [key](part1-foundations/03-performance-key.md) |
| 04 | [Thermochemistry and CEA](part1-foundations/04-thermochemistry-cea.md) | [key](part1-foundations/04-thermochemistry-cea-key.md) |
| — | [Part I exam](exams/exam-part1.md) | [key](exams/exam-part1-key.md) |

### Part II — Bipropellant liquid rocket engines
| # | module | key |
|---|---|---|
| 05 | [Propellants](part2-liquid/05-propellants.md) | [key](part2-liquid/05-propellants-key.md) |
| 06 | [Combustion chambers](part2-liquid/06-combustion-chambers.md) | [key](part2-liquid/06-combustion-chambers-key.md) |
| 07 | [Injectors](part2-liquid/07-injectors.md) | [key](part2-liquid/07-injectors-key.md) |
| 08 | [Ignition systems](part2-liquid/08-ignition.md) | [key](part2-liquid/08-ignition-key.md) |
| 09 | [Nozzles](part2-liquid/09-nozzles.md) | [key](part2-liquid/09-nozzles-key.md) |
| 10 | [Heat transfer](part2-liquid/10-heat-transfer.md) | [key](part2-liquid/10-heat-transfer-key.md) |
| 11 | [Cooling systems](part2-liquid/11-cooling.md) | [key](part2-liquid/11-cooling-key.md) |
| 12 | [Feed systems and turbopumps](part2-liquid/12-feed-systems.md) | [key](part2-liquid/12-feed-systems-key.md) |
| 13 | [Engine cycles](part2-liquid/13-engine-cycles.md) | [key](part2-liquid/13-engine-cycles-key.md) |
| 14 | [Valves, plumbing, and engine hardware](part2-liquid/14-valves-plumbing.md) | [key](part2-liquid/14-valves-plumbing-key.md) |
| 15 | [Combustion instability](part2-liquid/15-combustion-instability.md) | [key](part2-liquid/15-combustion-instability-key.md) |
| 16 | [Structures and materials](part2-liquid/16-materials.md) | [key](part2-liquid/16-materials-key.md) |
| 17 | [Manufacturing](part2-liquid/17-manufacturing.md) | [key](part2-liquid/17-manufacturing-key.md) |
| 18 | [Engine testing and instrumentation](part2-liquid/18-testing.md) | [key](part2-liquid/18-testing-key.md) |
| — | [Part II exam A (modules 05–11)](exams/exam-part2a.md) | [key](exams/exam-part2a-key.md) |
| — | [Part II exam B (modules 12–18)](exams/exam-part2b.md) | [key](exams/exam-part2b-key.md) |

### Part III — Solid rocket motors and defense propulsion
| # | module | key |
|---|---|---|
| 19 | [Solid propellant fundamentals](part3-solid/19-solid-fundamentals.md) | [key](part3-solid/19-solid-fundamentals-key.md) |
| 20 | [Combustion and burn rate](part3-solid/20-burn-rate.md) | [key](part3-solid/20-burn-rate-key.md) |
| 21 | [Grain geometry](part3-solid/21-grain-geometry.md) | [key](part3-solid/21-grain-geometry-key.md) |
| 22 | [Motor cases](part3-solid/22-cases.md) | [key](part3-solid/22-cases-key.md) |
| 23 | [Insulation and liners](part3-solid/23-insulation-liners.md) | [key](part3-solid/23-insulation-liners-key.md) |
| 24 | [Solid rocket nozzles](part3-solid/24-solid-nozzles.md) | [key](part3-solid/24-solid-nozzles-key.md) |
| 25 | [Solid rocket manufacturing](part3-solid/25-solid-manufacturing.md) | [key](part3-solid/25-solid-manufacturing-key.md) |
| 26 | [Historical large solid motors](part3-solid/26-historical-motors.md) | [key](part3-solid/26-historical-motors-key.md) |
| 27 | [Modern defense propulsion engineering](part3-solid/27-defense-propulsion.md) | [key](part3-solid/27-defense-propulsion-key.md) |
| — | [Part III exam](exams/exam-part3.md) | [key](exams/exam-part3-key.md) |

### Part IV — Cold-gas thrusters
| # | module | key |
|---|---|---|
| 28 | [Cold-gas principles](part4-coldgas/28-coldgas-principles.md) | [key](part4-coldgas/28-coldgas-principles-key.md) |
| 29 | [Cold-gas performance modeling](part4-coldgas/29-coldgas-modeling.md) | [key](part4-coldgas/29-coldgas-modeling-key.md) |
| 30 | [Cold-gas hardware](part4-coldgas/30-coldgas-hardware.md) | [key](part4-coldgas/30-coldgas-hardware-key.md) |
| 31 | [Real cold-gas systems](part4-coldgas/31-coldgas-systems.md) | [key](part4-coldgas/31-coldgas-systems-key.md) |
| — | [Part IV exam](exams/exam-part4.md) | [key](exams/exam-part4-key.md) |

### Part V — Cross-system propulsion engineering
| # | module | key |
|---|---|---|
| 32 | [Liquid vs solid vs cold gas](part5-cross-system/32-comparison.md) | [key](part5-cross-system/32-comparison-key.md) |
| 33 | [Systems engineering for propulsion](part5-cross-system/33-systems-engineering.md) | [key](part5-cross-system/33-systems-engineering-key.md) |
| 34 | [Failure case studies](part5-cross-system/34-failure-case-studies.md) | [key](part5-cross-system/34-failure-case-studies-key.md) |
| 35 | [Historical evolution](part5-cross-system/35-historical-evolution.md) | [key](part5-cross-system/35-historical-evolution-key.md) |
| 36 | [Modern engineering methods](part5-cross-system/36-modern-methods.md) | [key](part5-cross-system/36-modern-methods-key.md) |
| — | [Cumulative exam (Parts I–V)](exams/exam-cumulative.md) | [key](exams/exam-cumulative-key.md) |

### Part VI — Interview and professional preparation
| file | contents |
|---|---|
| [200 propulsion questions](part6-interview/200-questions.md) | beginner → very advanced; [key](part6-interview/200-questions-key.md) |
| [Whiteboard problems](part6-interview/whiteboard-problems.md) | [solutions](part6-interview/whiteboard-problems-key.md) |
| ["Explain this to an engineer"](part6-interview/explain-to-an-engineer.md) | 100+ prompts; [model answers](part6-interview/explain-to-an-engineer-key.md) |
| [Engine identification](part6-interview/engine-identification.md) | [reveals](part6-interview/engine-identification-key.md) |
| [Trade-study projects](part6-interview/trade-study-projects.md) | [rubrics and reference solutions](part6-interview/trade-study-projects-key.md) |
| [Oral exam question bank](part6-interview/oral-exam.md) | [what a strong answer contains](part6-interview/oral-exam-key.md) |

### Capstone, final, reference
| file | contents |
|---|---|
| [Capstone](capstone.md) | three fictional missions; full trade study; [rubric](capstone-key.md) |
| [Final comprehensive exam](exams/exam-final.md) | [key](exams/exam-final-key.md) |
| [Engine database](reference/engine-database.md) | ~60 engines, motors, thrusters |
| [Sources](reference/sources.md) | annotated bibliography with report numbers and links |
| [Checklist](reference/checklist.md) | "What a propulsion engineer should know" |
| [Equation sheet](reference/equation-sheet.md) | every governing equation with variables, units, assumptions |
| [Tools](tools/) | Python scripts that recompute every worked example |

---

## Study roadmaps

Assume 5–10 h/week. Each module is roughly 4–8 h including problems.
Exams are 3 h each; the capstone is 15–25 h.

### 12-week accelerated path (≈10 h/wk, foundations + liquids emphasis)
| wk | modules |
|---|---|
| 1 | diagnostic, 01, 02 |
| 2 | 03, 04, Part I exam |
| 3 | 05, 06 |
| 4 | 07, 08 |
| 5 | 09, 10 |
| 6 | 11, 12 |
| 7 | 13, 14, Part II exam A |
| 8 | 15, 16, 17, 18, Part II exam B |
| 9 | 19, 20, 21, 22 (skim 23–25), 26, 27, Part III exam |
| 10 | 28, 29, 30, 31, Part IV exam |
| 11 | 32, 33, 34, 35, 36, cumulative exam |
| 12 | Part VI interview drills, capstone (short form: one mission) |

### 24-week standard path (≈7 h/wk)
| wk | modules |
|---|---|
| 1 | diagnostic, 01 |
| 2 | 02 |
| 3 | 03 |
| 4 | 04, Part I exam |
| 5 | 05 |
| 6 | 06 |
| 7 | 07 |
| 8 | 08, 09 |
| 9 | 10 |
| 10 | 11 |
| 11 | Part II exam A, 12 |
| 12 | 13 |
| 13 | 14, 15 |
| 14 | 16, 17 |
| 15 | 18, Part II exam B |
| 16 | 19, 20 |
| 17 | 21, 22, 23 |
| 18 | 24, 25, 26 |
| 19 | 27, Part III exam |
| 20 | 28, 29 |
| 21 | 30, 31, Part IV exam |
| 22 | 32, 33, 34 |
| 23 | 35, 36, cumulative exam |
| 24 | Part VI, capstone (one mission), final exam |

### 36-week deep-mastery path (≈6 h/wk, all problems, all trade studies, full capstone)
Follow the 24-week order, but:
- Take one week per module from 05 to 18 (14 weeks for Part II instead of 11).
- Do every "mini trade study" in every module, not just the quiz.
- Spend three weeks on the capstone (all three missions) and one week on the final.
- Weeks 33–36: Part VI in full, including all 200 questions, all whiteboard problems, and a mock oral exam.

---

## Grading scale

Every exam and quiz is scored out of 100. The scale is deliberately stiff;
the tests are designed so that a strong graduate student in a propulsion
group would score in the 80s.

| score | meaning |
|---|---|
| 90–100 | interview mastery: could defend the material to a senior propulsion engineer |
| 75–89 | working engineering knowledge: correct analysis, minor gaps in judgment |
| 60–74 | familiarity: concepts right, calculations or reasoning incomplete |
| < 60 | re-study the module before proceeding |

Weighting of the full course (if you want a single number):

| component | weight |
|---|---|
| module quizzes (36) | 20 % |
| Part exams (5) | 25 % |
| cumulative exam | 15 % |
| capstone | 20 % |
| final exam | 20 % |

Calculation questions are graded on method first: a right setup with an
arithmetic slip loses at most 30 % of the marks; a wrong setup with the
right number by luck scores zero.

---

## Mastery system

Every module states what Level 1, 2, and 3 mean for its subject. The
generic definitions:

**Level 1 — Familiarity.** You can explain the concept in plain language,
name the governing quantities, sketch the trend of each (what goes up when
what goes down), and name two real engines where it matters.

**Level 2 — Working engineering knowledge.** You can set up and solve the
governing equations with correct units, quote typical ranges from memory,
state the assumptions and where they fail, and read a data plot or table
about the subject without help.

**Level 3 — Interview mastery.** Given an unfamiliar engine, mission, or
failure, you can reason to a defensible answer using the concept, identify
what you would need to measure or compute to confirm it, argue the
trade-offs both ways, and say which historical program faced the same
problem and what they did.

---

## Conventions

- SI units throughout. Where a source quantity is customarily quoted in
  US units (psia, lbf, in), both are given on first appearance.
- $g_0 = 9.80665\ \mathrm{m/s^2}$. $R_u = 8314.46\ \mathrm{J/(kmol\,K)}$.
- "Isp" always means specific impulse in seconds unless stated. "Vacuum"
  and "sea-level" are always specified for real engines.
- Chamber pressure $p_c$ is the stagnation pressure at the injector face
  unless stated (some sources quote throat-stagnation or nozzle-stagnation
  pressure, which is a few percent lower; the text flags this).
- Citation tags in square brackets refer to `reference/sources.md`.
