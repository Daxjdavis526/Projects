# The dataset pipeline

Eight Node stages, no npm dependencies. Run everything with

    node run-all.js

or any stage alone (`node parse.js` …). Stages read and write only inside
this folder (`cache/`, `build/` — both gitignored) and emit the final
static files into `../data/`.

    canon.js       the manifest everything trusts: 88 books, API slugs,
                   chapter counts, pinned canon verse totals, spot checks
    fetch.js       Gospel Library content API → cache/, one JSON per
                   chapter; 350 ms throttle, resumable, --probe for six
    parse.js       cache → verses, official footnote cross-ref targets,
                   Topical Guide tags, chapter headings; exits non-zero
                   unless canon totals match exactly
    match.js       stop-phrase-damped 5-gram matcher → textual parallels
                   (machine edges never rise above "strong")
    curated.js     the only hand-written data: famous pairs with notes,
                   plus the persons table
    classify.js    merge + dedupe all evidence into one typed edge list
    aggregate.js   book rollups, seeded network layout, computed stats,
                   the coverage report
    pack.js        emit ../data/ — 12-byte edge records, verse text
                   chunks, evidence chunks, topics/persons, manifest
    validate.js    the acceptance checklist against the PACKED data:
                   totals, known pairs, structural invariants, coverage
                   honesty; exits non-zero on any failure

Not part of `run-all.js`:

    bundle.js      inline ../data/ into ../dist/scripture-universe.html —
                   the single-file offline copy that opens from disk

Determinism: the network layout uses a seeded PRNG and pack.js writes with
stable ordering, so a rebuild from the same cache diffs cleanly. The one
intentionally variable byte is the fetch date recorded into coverage.
