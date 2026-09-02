# Natural Rewrite

A writing utility that removes formulaic patterns from over-polished prose
while keeping the author's meaning, facts and voice.

Paste text on the left, press **Naturalize**, and read the result on the
right. Every edit is listed, with a reason, in *Why these changes were
made*. Nothing you paste leaves your browser.

Live: https://daxjdavis526.github.io/Projects/naturalize/

## What it is not

It is not an AI-detector bypass, and it does not claim the output is
"undetectable". Detection systems are probabilistic and produce false
positives; writing aimed at a detector score is not the same thing as
good writing. The objective here is measurable and worth wanting on its
own: **fewer formulaic patterns, less repetition, plainer wording, and
the author's meaning intact.**

## Controls

| Control | What it does |
|---|---|
| **Mode** | Minimal, Natural, Casual, Professional, Academic, Student. Each caps strength and switches specific rules on or off. |
| **Rewrite strength** | 1 (almost unchanged) to 5 (major stylistic rewrite). Defaults to 2. Every rule declares the minimum strength at which it will fire. |
| **Preserve my writing style** | Measures your contraction use, sentence length, first-person use and formality, then keeps them. It overrides the mode: Casual will not add contractions to text that has none. |
| **Technical / engineering text** | Masks equations, units, variable names, standards, citations and acronyms before any rule runs, and disables the rules that trade precision for plainness. |

Click any highlighted sentence in the output to overrule the engine on
that sentence alone: keep the original, re-run it harder, make it more
casual or more professional, shorten it, or back off to a lighter touch.
Options that would produce no change are shown but disabled.

`Ctrl`/`Cmd`+`Enter` runs the rewrite. Settings and theme persist in
`localStorage`.

## How it works

Two layers, both in `src/`.

**Sentence rules** (`rules.mjs`) are local substitutions — about 70 of
them — each with a stated reason, a minimum strength, and a flag for
whether it is safe in technical text. `utilize` → `use`, `due to the
fact that` → `because`, `it is important to note that` → deleted.

**Document passes** (`engine.mjs`) are the part that makes the output
feel written rather than processed. A transition is only padding if the
document keeps reaching for it; three-item lists are only a tic when they
repeat. Judging that needs the whole document, so these passes spend a
limited budget of edits on the habits the text actually leans on:

- transitions, budgeted by type — additive openers (*Furthermore*,
  *Moreover*) are padding wherever they sit, causal ones carry an
  argument and are kept longer, contrastive ones almost always earn their
  place
- restatement — a follow-up that repeats the previous sentence is
  removed; one that adds something keeps its content and loses only the
  *"This means that"* marker
- closing paragraphs that restate the piece and introduce nothing new
- qualifier and intensifier padding, on an allowance rather than a
  blanket ban
- em-dashes, rationed to roughly one per 180 words rather than eliminated
- the three-item list rhythm, trimmed only from the third occurrence on
- repeated rhetorical contrast (*"it's not just X — it's Y"*), rewritten
  only after the first use
- sentence-length variation, when lengths are measurably uniform
- bullet lists of short fragments, folded into the sentence that
  introduces them

Everything is masked before rules run (`text.mjs`): quotations, inline
code, TeX, citations, numbers with units, URLs, and — in Technical mode —
standards, acronyms and hyphenated identifiers. Rules cannot reach inside
a masked span, which is why numbers, equations and quoted text come back
byte-identical.

`diff.mjs` is a Myers diff over word tokens, plus a coalescing pass so a
rewritten phrase shows as one deletion and one insertion instead of five
interleaved fragments.

## What is honest versus approximated

Being blunt about this, in the house style:

**The engine does what it claims for pattern-level habits.** Overused
transitions, formal-word swaps, corporate vocabulary, wordy phrases,
generic openings and conclusions, qualifier padding, em-dash overuse and
list rhythm are all detected by rule and corrected with the reason
recorded. Restatement detection is content-word overlap between adjacent
sentences — it catches literal repetition reliably.

**It does not understand the text.** Restatement detection compares
vocabulary, not meaning, so two sentences that make the same point in
entirely different words are not caught. "The valve validates each
record" followed by "the valve checks every entry" reads as new
information to the engine.

**Some patterns are reported rather than edited.** Repeated sentence
openings and heavy word repetition need a clause rewritten, not a word
substituted, and a rule engine that attempts that produces worse prose
than it started with. Those appear under *What the engine noticed but
did not change*, with an explanation. Sentence-length variation only ever
splits an existing compound sentence; it never merges or invents clauses.

**"Expand slightly" cannot add content.** There is no language model
here, so it re-runs that sentence at strength 1, which brings back more
of your original wording. It restores rather than generates.

**Rewriting is deterministic.** The same text with the same settings
always produces the same output. That is a feature for a utility, but it
means the engine cannot find a phrasing outside its rule set.

## Testing

The engine imports no DOM and no browser API, so it runs headlessly:

```
node naturalize/test/engine.test.mjs
```

38 tests. Most of them assert restraint — that already-natural prose
comes back untouched, that numbers and citations survive, that hedges
like *may* and *suggests* are never removed, that one three-item list is
left alone. Over-rewriting is the failure mode that matters, so that is
what the suite mostly guards.

## Files

```
index.html          markup
style.css           light and dark themes
app.js              DOM wiring only
src/text.mjs        segmentation, masking, word helpers
src/rules.mjs       the sentence rules
src/engine.mjs      document passes and orchestration
src/diff.mjs        Myers word diff and coalescing
test/engine.test.mjs
```

No build step, no dependencies, no network calls.
