# Diagram and module style guide

Internal. Every module author follows this so the whole course looks like one
piece of work.

---

## 1. Diagrams are hand-authored inline SVG

No diagram library. Write the `<svg>` directly into the Markdown, wrapped in a
`<figure>`, with a blank line before and after so the parser treats it as a
block:

```html
<figure>
<svg viewBox="0 0 640 260" role="img" aria-label="Short description for screen readers">
  …
</svg>
<figcaption>Figure 3.2 — What the reader should take from this.</figcaption>
</figure>
```

Rules:

- **`viewBox` always, `width`/`height` never.** The CSS scales it to the column.
- **Never hard-code black, white, or grey.** Use the palette variables below so
  the diagram works in light and dark themes. A diagram that vanishes in dark
  mode is a bug.
- `role="img"` and a real `aria-label`. Someone will read this with a screen
  reader.
- Keep it under about 700 units wide so it fits the 980 px column without
  shrinking the text.
- Text at `font-size="13"` or larger, `font-family="system-ui, sans-serif"`.
  Anything smaller is unreadable on a laptop.
- Prefer one clear diagram over three cluttered ones.

## 2. Palette

Use these CSS variables, which the reader defines for both themes:

| use | fill / stroke |
|---|---|
| structure, outlines, text | `currentColor` |
| secondary lines, dimensions | `var(--muted)` |
| oxidiser (LOX, GOX) lines and vessels | `var(--oxy)` |
| fuel (LCH4, LH2) lines and vessels | `var(--fuel)` |
| inert (LN2, GN2, He) lines | `var(--inert)` |
| hazard, warning, "this is the problem" | `var(--warn)` |
| good practice, "this is the fix" | `var(--ok)` |
| panel/vessel fill | `var(--side)` |

Colour carries meaning here, so never colour a line purely for decoration, and
never rely on colour alone: label every stream with text too, because roughly
one reader in twelve will not distinguish the oxidiser green from the fuel
orange.

## 3. P&ID conventions

The course teaches schematic literacy, so the schematics must be honest.

- **Lines:** liquid runs solid, gas runs solid but thinner, a vacuum jacket is
  drawn as a double line, an electrical/signal line is dashed.
- **Valves:** the standard bow-tie. Filled = normally closed, open = normally
  open. Put the actuator on top: a bare stem for manual, a circle for solenoid,
  a half-dome for pneumatic.
- **Relief devices:** the angled-body relief symbol with the set pressure
  labelled. Burst discs get the arc symbol. Every relief in the drawing must
  discharge somewhere the drawing shows.
- **Instruments:** ISA-style bubbles with a two- or three-letter tag —
  `PT` pressure transmitter, `TT` temperature, `FT` flow, `LT` level,
  `PSV` relief valve, `AT` analyser (gas detection). A bubble on a line is
  field-mounted; a bubble with a horizontal bar is control-room. Number them
  consistently within a figure and refer to the tags in the prose.
- Label every vessel and every stream. An unlabelled schematic teaches nothing.

## 4. Callout boxes

Four kinds, no more. They are raw HTML so they work in the reader and on GitHub:

```html
<div class="box wcgw"><span class="lbl">What could go wrong?</span>
Concrete failure, concrete consequence. Not a platitude.
</div>

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
The one sentence worth carrying into a design review.
</div>

<div class="box remember"><span class="lbl">Remember this</span>
A number or rule worth committing to memory.
</div>

<div class="box"><span class="lbl">Worth knowing</span>
Context, history, an aside.
</div>
```

Aim for three to six per module. More than that and they stop standing out.

## 5. Cryogen cards (Module 02)

```html
<div class="cards">
<div class="card oxidiser">
  <h4>LOX</h4><div class="sub">liquid oxygen · O₂</div>
  <dl><dt>Boils</dt><dd>90.2 K</dd>
      <dt>Density</dt><dd>1141 kg/m³</dd>
      <dt>Class</dt><dd>Oxidiser</dd></dl>
  <div class="say">"I don't burn. I make everything else burn."</div>
</div>
</div>
```

Card classes: `oxidiser`, `fuel`, or omit for inert.

## 6. Numbers

Every physical number comes from `reference/properties.md`. If a number you need
is not there, add it there with its source first, then use it. Do not put a
figure in a module that the reference file cannot back. Standards citations come
from `reference/standards.md` and must carry an edition and year.

## 7. Module skeleton

```markdown
# Module N — Title

*Roughly 20 minutes. Prerequisite: Module N-1.*

One short paragraph on why this module exists, written like an engineer who has
seen it go wrong.

## What you'll be able to do
Four or five bullets, each testable.

## 1. First concept
Prose in short paragraphs. Diagram. Callout.

## …

## Checkpoint quiz
Five questions, mixed: multiple choice, short answer, identify-the-hazard,
schematic reading, "what would concern you here?", a conceptual calculation.

<details>
<summary>Show answers</summary>

Numbered answers with the reasoning, not just the letter. Explain why the
wrong options are wrong.

</details>
```

Exactly one `<details>` block per module, at the end, containing all five
answers. No answers anywhere else in the file.

## 8. Voice and length

- 1,800–3,000 words per module. This is a compact course; the propulsion course
  next door is the place for 15,000-word chapters.
- Short paragraphs. No wall of text. Intuition before equations, always.
- Say what is uncertain. Say what depends on the specific facility.
- Never write anything that reads as an operating procedure, a transfer
  sequence, or a build recipe. Teach recognition and review thinking. Where a
  real task would need trained personnel, a written procedure, manufacturer
  instructions or institutional approval, say so in one sentence and move on.
