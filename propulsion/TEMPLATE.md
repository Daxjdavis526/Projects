# Module template and authoring rules

Every module `NN-topic.md` follows this structure. The answer key
`NN-topic-key.md` contains only sections K1–K4. Nothing in the module file
gives away an answer.

---

## 0. Header block
```
# Module NN — Title
Part X · Prerequisites: modules … · Estimated time: N h
```
Then a **one-paragraph "why this module exists"** in the voice of an
engineer who has been burned by getting it wrong.

## 1. Learning objectives
5–10 bullets, each a verb phrase that can be tested ("compute the throat
area for a given thrust, Pc, and c*", not "understand throats").

## 2. Terminology
A table: term · symbol · SI unit · one-line definition. Every symbol used
later must appear here.

## 3. Theory
The textbook chapter proper. Subsections as needed. Rules:

- Start from the physics (conservation law, thermodynamic statement, or
  observed phenomenon), then derive. Derivations are shown where they are
  short enough to follow and matter for intuition; otherwise cite and
  state.
- **Every displayed equation** gets: every variable defined (or already in
  §2), SI units, one sentence of physical meaning, its assumptions, and
  when it fails. Use a compact callout right under the equation:

  > **Eq. 3.4** — variables: …; assumes: …; fails when: …

- Tag claims with the epistemic labels from the course README:
  [F] fundamental, [E] empirical, [H] historical, [M] modern, [R] research,
  [A] approximation, [J] judgment.
- Cite by tag into `reference/sources.md`, e.g. `[SB §3.3]`, `[SP-8089 p. 12]`.
  Cite generously; a page or section number whenever possible.
- Where sources disagree, say so and give both.
- Avoid the shallow sentence. "An injector mixes the propellants" is
  banned; explain the mechanism, how it is quantified, what governs it,
  what breaks.

## 4. Typical engineering ranges
A table of the quantities in this module with realistic ranges, and a note
on which engine sits at each extreme. Numbers must agree with
`reference/engine-database.md`.

## 5. Worked examples
At least three, fully numerical, SI, showing every step and every unit.
Each ends with a **sanity check** line comparing the answer to a real
engine or a rule of thumb. Where practical, the arithmetic is also in
`tools/` so it can be rerun.

## 6. Real engines
"Why did they design it that way?" subsections. Take 3–6 engines from the
database, state the relevant design choice, give the alternatives that
were available at the time, and argue why the choice made sense given the
constraints. Then say whether a modern engineer would choose the same.

Include at least one historical and one modern example.

## 7. Design trade-offs, failure modes, materials, manufacturing, testing
Short subsections. Failure modes: mechanism → symptom → evidence → fix.
Materials: why these alloys. Manufacturing: what process, what it limits.
Testing: what is measured, with what instrument, and what the data looks
like when the thing is wrong.

## 8. Misconceptions and "what engineers actually care about"
- 4–8 misconceptions, each stated then corrected in two or three sentences.
- "What engineers actually care about": the 3–5 quantities or questions a
  practising engineer in this area spends their day on, with a sentence on
  why.

## 9. Mastery levels
What you must be able to do at Level 1, 2, 3 **for this module's subject**.
Concrete and testable.

## 10. Problems (no answers here)
- **Conceptual** (5–8): short-answer physics and reasoning.
- **Calculation** (5–8): numerical, SI, with realistic inputs. Some must
  require reading a value off a table or the engine database.
- **Engineering reasoning** (3–5): diagnosis, comparison, interpretation
  of a described data plot.
- **Mini trade study** (1): a design decision with 3–4 competing options
  and stated constraints; ask for a recommendation and justification.

## 11. Quiz (no answers here)
10 questions, mixed multiple-choice and short calculation, scored /100.
Not trivial. At least three require a calculation; at least two require
engineering judgment rather than recall.

## 12. Further reading
5–10 items from `reference/sources.md` with a sentence each on what to
read it for.

---

# Key file `NN-topic-key.md`

## K1. Problem solutions
Every problem, fully worked, with the reasoning that a grader would want
to see. For reasoning problems, give the argument and the counter-argument
and say which wins and why.

## K2. Quiz answers with explanations
For every quiz item: the answer, why it is right, and why each wrong
option is wrong (for multiple choice).

## K3. Trade-study reference solution
A defensible recommendation and a rubric: what a strong answer must
contain, what would lose marks.

## K4. Common wrong answers
The mistakes students actually make on this material and what they reveal.

---

# Hard rules

1. SI units. $g_0 = 9.80665$ m/s². $R_u = 8314.46$ J/(kmol·K).
2. Real-engine numbers come from `reference/engine-database.md`; if you
   need a number that is not there, add it there with its source, do not
   invent it in the module.
3. Company-claimed figures for engines still in development (Raptor, BE-4,
   Archimedes, etc.) are labelled as claims.
4. Part III and testing content: engineering theory, public architectures,
   generalized parameters. No formulations beyond what NASA fact sheets
   publish, no processing procedures, no weapon dimensions, no operational
   test procedures.
5. Problems and quizzes go in the module file; answers go only in the key.
6. Never write "it can be shown that" for something under five lines.
7. Diagrams: describe in words and, where a public diagram exists, cite
   it (report number, figure number). Use Mermaid for flow paths (engine
   cycles, feed systems) and simple ASCII for geometry where it helps.
