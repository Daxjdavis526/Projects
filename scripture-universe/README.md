# SCRIPTURE UNIVERSE — the standard works as one graph

An interactive map of every documented cross-reference between the five
scriptural collections of the Latter-day Saint canon: Old Testament, New
Testament, Book of Mormon, Doctrine & Covenants, and Pearl of Great Price.
39,149 typed, confidence-rated relationships over 42,033 verses, drawn as
luminous arcs on black — zoom from the whole canon down to a single pair of
verses compared word by word.

Live: https://daxjdavis526.github.io/Projects/scripture-universe/

Desktop is the intended experience (WebGL2 required); phones get pan, pinch,
search, and focus mode.

## Controls

    1 / 2 / 3        ribbon · chord · network view
    scroll / pinch   zoom — canon → book → chapter → verse
    drag             pan
    hover            relationship card (types, confidence, snippet, source)
    click a verse    focus its constellation; click connections to travel
    click a line     side-by-side comparison with matched phrases highlighted
    F                search — `Isaiah 53` · `3 Nephi 12:3` · `baptism` · `Melchizedek`
    T                guided tour of eight famous connections
    Esc              clear focus / close panels
    H or ?           help

The legend is the filter: click a relationship type to hide it, drag the
confidence slider, and use the 5×5 canon matrix (or the presets — **BIBLE ↔
RESTORATION** is the headline view) to isolate any pair of collections.
**STATS** opens the computed dashboard, **DATA** the coverage report, **PNG**
and **CSV** export what you are looking at.

## Where the connections come from

Nothing in the graph is invented. Every edge carries provenance from one of
three sources, and the DATA panel reports the exact counts and parameters:

1. **Official footnote cross-references** — the 48,446 verse-level scripture
   targets in the Gospel Library edition's footnotes, extracted as reference
   *facts* (footnote prose, study helps, and chapter headings are not
   reproduced). These are the confirmed backbone. Topical Guide links become
   topic *tags* on verses — never edges — and power topic and person modes.
2. **Textual analysis** — a stop-phrase-damped 5-gram matcher run over the
   public-domain texts finds 5,781 verbatim and near-verbatim parallels
   ("and it came to pass" can lengthen a real quotation but can never create
   an edge by itself). Machine-detected lines are dashed, capped below
   "confirmed", and never typed as direct quotation — the algorithm cannot
   know which text depends on which.
3. **A curated table** — 100 hand-written rows covering the famous
   relationships (Isaiah 2–14 ↔ 2 Nephi 12–24, Matthew 5–7 ↔ 3 Nephi 12–14,
   Matthew 24 ↔ Joseph Smith—Matthew, James 1:5 ↔ JS—History 1:11, 1
   Corinthians 15 ↔ D&C 76 …), each with a short neutral explanation shown in
   the comparison panel.

A line is a textual or referential relationship, not a claim about
authorship, dependence, or divine origin — interpretive categories are
labeled as such, and the graph leaves those questions open.

## How it works

The whole app is one dependency-free HTML file plus static data.

**One position texture.** Every node — 42,033 verses, 1,584 chapter anchors,
88 book anchors — has a slot in a single 256×256 RG32F texture. Edges are
instanced cubic béziers whose vertex shader fetches both endpoints *and*
bundling anchors from that texture, so switching between the ribbon, chord,
and network views (or tweening between them) never touches edge geometry:
the CPU lerps one Float32Array of positions and re-uploads it.

**Bundling without a solver.** Each curve's control points are pulled toward
its endpoints' chapter anchors (or book anchors when zoomed out). Hundreds
of Isaiah → Book of Mormon connections leave as one stream and split apart
as you zoom — hierarchical edge bundling for the cost of a `mix()`.

**Level of detail.** Beyond ~24 verses per pixel you see 1,889 book↔book
flows; in between, 22,614 chapter↔chapter flows; up close, the individual
verse connections, culled to the visible span. Aggregates are precomputed so
the far views never iterate verse edges. Exposure scales with granularity so
the canon view glows instead of clipping to white.

**Picking** is a GPU color-pass: instances are re-drawn with ID colors into
a quarter-resolution buffer and one pixel is read back — exact on curves
whose shape changes with zoom.

**The data format.** `data/edges.bin` holds fixed 12-byte records (two
16-bit node ids, a 13-bit type mask, confidence/direction flags, provenance
bits, weight, extent, and an evidence index — `0xFFFF` when the explanation
can be templated client-side). The boot payload — metadata, the edge binary,
and book-level rollups — is ~260 KB gzipped; verse text ships as 88
per-book JSON files loaded lazily and prefetched in idle time. Explanations
live in 256-record evidence chunks fetched on demand. Committing ~9 MB of
data to the repo is a deliberate trade: it is what makes the site a static
page with no backend.

## Rebuilding the dataset

    cd pipeline
    node run-all.js

Eight stages: fetch (1,584 chapters into a local cache, resumable, ~10 min),
parse (hard-validated against exact canon verse totals — 23,145 / 7,957 /
6,604 / 3,654 / 635), match, curated, classify, aggregate, pack, validate.
`validate.js` re-checks the packed data end to end, including known-pair
assertions (Isaiah 53:5 ↔ Mosiah 14:5 with a ≥15-word run, Malachi 3:1 ↔
3 Nephi 24:1, ≥20 Matthew 24 ↔ JS—Matthew verse pairs, …) and recomputes
every number in the coverage report. See [pipeline/README.md](pipeline/README.md).

## Files

    index.html        the app — renderer, UI, everything (no dependencies)
    data/             packed dataset: manifest, verses-meta, edges.bin,
                      agg, text/ (88 books), evidence/, topics, persons,
                      stats, coverage
    pipeline/         the eight-stage builder (Node, no dependencies);
                      cache/ and build/ are gitignored intermediates

## Future work

Chronological layout, degrees-of-separation view, an OpenBible.info merge
for a second Bible-internal source (CC-BY), the Topical Guide long tail
beyond the top 500 topics.
