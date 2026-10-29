// arXiv, ADS and INSPIRE — the three databases a physicist searches, what
// each is for, and their query languages: arXiv API field prefixes and
// Boolean operators, ADS fielded search and its citation and second-order
// operators, INSPIRE's SPIRES-style terms. Syntax checked against the arXiv
// API manual and ADS help sources (both on GitHub); INSPIRE's against its
// help pages as summarized by search — the learner is told to check the
// live sites, which change.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { venn, SRC } from './_rs.js';

const t = String.raw;

// real arXiv identifiers of papers used in this course
const IDS = [
  { id: '1602.03837', what: 'the GW150914 discovery paper (LIGO and Virgo)', y: 2016, m: 2 },
  { id: '1807.06209', what: 'Planck 2018 results VI: cosmological parameters', y: 2018, m: 7 },
  { id: '2112.04510', what: 'the SH0ES 2022 measurement of the Hubble constant', y: 2021, m: 12 },
  { id: '1606.02744', what: 'Weisberg & Huang’s timing of the binary pulsar PSR B1913+16', y: 2016, m: 6 },
  { id: '1403.7377', what: 'Will’s Living Review on tests of general relativity', y: 2014, m: 3 },
  { id: '1008.4686', what: 'Hogg, Bovy & Lang’s “Data analysis recipes: fitting a model to data”', y: 2010, m: 8 },
  { id: '2202.04077', what: 'the Pantheon+ cosmology analysis', y: 2022, m: 2 },
];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const OPS = { key: 'op', label: 'Boolean operator', options: [[0, 'A AND B', 'and'], [1, 'A OR B', 'or'], [2, 'A ANDNOT B', 'andnot']], value: 0 };

export default lesson({
  id: 'research.R1.1',
  title: 'arXiv, ADS and INSPIRE',
  minutes: 12, difficulty: 2,
  intro: t`Three databases hold most of the literature you will need. **arXiv** is the preprint server: papers appear there, sorted by category (\`gr-qc\`, \`astro-ph.HE\`, \`astro-ph.CO\`, \`hep-th\` …), usually before or alongside journal publication — moderated, but **not peer reviewed**. **ADS**, NASA’s Astrophysics Data System, indexes astronomy and physics journals *and* arXiv, and links every paper to what it cites and what cites it. **INSPIRE** does the same for high-energy physics and gravitation.

All three search by **fields** (title, author, abstract, category …) joined by Boolean operators, and each operator is a set operation on the results:

$$A \text{ AND } B = A \cap B, \qquad A \text{ OR } B = A \cup B, \qquad A \text{ ANDNOT } B = A \setminus B$$`,
  symbols: [
    { tex: 'A,\\ B', text: 'the sets of papers each single term finds, for example $A$ = every paper with “perihelion” in the title' },
    { tex: '\\cap', text: 'intersection: papers in **both** sets (narrows a search)' },
    { tex: '\\cup', text: 'union: papers in **either** set (widens it)' },
    { tex: '\\setminus', text: 'difference: papers in $A$ but **not** in $B$ (excludes)' },
  ],
  why: t`A search you can write down exactly is a search you can rerun, refine and report — the start of a reproducible literature review.`,
  visual: {
    ...venn({ A: 'A: ti:perihelion', B: 'B: cat:gr-qc', choice: OPS, caption: 'Each circle is the set of papers one fielded term finds; the shaded region is what the combined query returns. Circle sizes are schematic, not real result counts.' }),
    title: 'Boolean searches are set operations',
    lead: t`Circle A holds the arXiv papers with *perihelion* in the title; circle B every paper in the general-relativity category \`gr-qc\`. Switch the operator and watch which region the query returns.`,
    tasks: ['AND: only the overlap — perihelion papers inside gr-qc.', 'OR: everything in either circle — far more papers, most of them irrelevant.', 'ANDNOT: perihelion papers outside gr-qc (celestial mechanics, comets, planetary science).'],
  },
  example: {
    prompt: t`Write an arXiv API query for papers in \`gr-qc\` with *perihelion* in the title that do **not** mention Mercury in the abstract, newest first. Then say how you would run the same search in ADS.`,
    visual: venn({ A: 'ti:perihelion', B: 'cat:gr-qc', op: 'and', caption: 'The first two terms: perihelion papers inside gr-qc (shaded). The ANDNOT then removes those whose abstract mentions Mercury.' }),
    steps: [
      { label: 'Concepts to fields', text: t`Three ideas, three fields. arXiv’s API prefixes are \`ti\` (title), \`au\` (author), \`abs\` (abstract), \`co\` (comment), \`jr\` (journal reference), \`cat\` (subject category), \`rn\` (report number) and \`all\`. So: \`ti:perihelion\`, \`cat:gr-qc\`, \`abs:Mercury\`.` },
      { label: 'Combine', text: t`The API’s operators are \`AND\`, \`OR\` and \`ANDNOT\`:

\`\`\`text
ti:perihelion AND cat:gr-qc ANDNOT abs:Mercury
\`\`\`` },
      { label: 'Encode as a URL', text: t`Spaces become \`+\`, quotes \`%22\`, brackets \`%28\` and \`%29\`. Sort by submission date, newest first:

\`\`\`text
http://export.arxiv.org/api/query?search_query=ti:perihelion+AND+cat:gr-qc+ANDNOT+abs:Mercury&sortBy=submittedDate&sortOrder=descending&max_results=50
\`\`\`` },
      { label: 'Play nice', text: t`arXiv asks for at most one API request every three seconds; a script that pages through results must sleep between calls.` },
      { label: 'The same in ADS', text: t`ADS uses \`field:"phrase"\`, a minus sign to exclude, and filters such as \`year:\` and \`property:refereed\`:

\`\`\`text
title:"perihelion" -abs:"Mercury" year:2015-2025 property:refereed
\`\`\`

The refereed filter is something arXiv cannot give you.` },
      { label: 'Check', text: t`Syntax drifts. Before trusting a search, run it on the live site and read a few results: if the first ten are off topic, the query is wrong, not the literature.` },
    ],
    answer: t`\`ti:perihelion AND cat:gr-qc ANDNOT abs:Mercury\`, sorted by \`submittedDate\`; in ADS, \`title:"perihelion" -abs:"Mercury"\` plus filters.`,
  },
  practice: [
    mcq({
      id: 'read-andnot', difficulty: 1,
      prompt: t`What does this arXiv API query return?

\`\`\`text
abs:"binary pulsar" ANDNOT ti:review
\`\`\``,
      visual: venn({ A: 'abs:"binary pulsar"', B: 'ti:review', caption: 'The two sets the query combines (nothing shaded: which region is returned is the question).' }),
      choices: [
        'Papers whose abstract mentions “binary pulsar”, except those with “review” in the title',
        'Papers whose abstract mentions “binary pulsar” and whose title contains “review”',
        'Papers that mention “binary pulsar” or have “review” in the title',
        'Every paper except reviews',
      ],
      answer: 0,
      why: { 1: 'That is AND: the overlap. ANDNOT removes the overlap instead.', 2: 'That is OR, the union of both circles.', 3: 'ANDNOT subtracts from the first set only; it never adds papers that lack the first term.' },
      hints: ['ANDNOT is a set difference: A minus B.', 'Start from the left circle and remove what it shares with the right one.'],
      teach: 'ANDNOT keeps the first set and removes every paper that is also in the second.',
      explain: 'A ANDNOT B is the left circle minus the overlap: binary-pulsar papers that are not titled as reviews.',
    }),
    num({
      id: 'or-count', difficulty: 2,
      gen(r) {
        const a = r.int(12, 60) * 10, ab = r.int(3, 15) * 10, b = r.int(40, 120) * 10;
        const op = r.pick(['or', 'andnot', 'and']);
        const ans = op === 'or' ? a + ab + b : op === 'andnot' ? a : ab;
        const q = op === 'or' ? 'A OR B' : op === 'andnot' ? 'A ANDNOT B' : 'A AND B';
        return {
          prompt: t`Term A alone finds $${a + ab}$ papers and term B alone finds $${b + ab}$; $${ab}$ papers match both (illustrative counts). How many papers does \`${q}\` return?`,
          visual: venn({ A: `A (${a + ab})`, B: `B (${b + ab})`, counts: { ab }, caption: 'Totals for each term are on the labels; the number in the overlap matches both.' }),
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [
            { value: a + b + 2 * ab, feedback: 'You added both totals and counted the overlap twice: subtract it once.' },
            { value: a + ab, feedback: 'That is everything term A finds — ANDNOT removes the papers that also match B.' },
          ].filter((e) => e.value !== ans),
          hints: ['Split the picture into three regions: A only, both, B only.', t`A only $= ${a + ab} - ${ab} = ${a}$; B only $= ${b + ab} - ${ab} = ${b}$.`],
          teach: 'Count a Boolean query by regions: OR is all three, AND the overlap, ANDNOT the first circle minus the overlap.',
          explain: t`${op === 'or' ? t`$${a} + ${ab} + ${b} = ${ans}$: the union counts the overlap once.` : op === 'andnot' ? t`$${a + ab} - ${ab} = ${ans}$: A without the papers it shares with B.` : t`$${ab}$: only papers matching both terms.`}`,
        };
      },
    }),
    mcq({
      id: 'ads-first', difficulty: 2,
      prompt: t`In ADS, what is the difference between these two queries?

\`\`\`text
author:"Taylor, J"
author:"^Taylor, J"
\`\`\``,
      visual: {
        type: 'graph',
        params: {
          x: [-2.1, 2.1], y: [-1.2, 1.3], aspect: 'wide', equal: true, axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
          curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent2', width: 2 }, { param: ['0.25 + 0.62*cos(t)', '-0.2 + 0.62*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 }],
          points: [{ x: -1.25, y: 1.1, r: 0, label: 'author:"Taylor, J"', color: 'accent2' }, { x: 0.25, y: -0.2, r: 0, label: 'author:"^Taylor, J"', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 }],
        },
        caption: 'Schematic: everything the second query finds, the first finds too.',
      },
      choices: [
        'The caret restricts the second to papers where Taylor, J is the first author.',
        'The caret makes the second an exact-name match with no initials expanded.',
        'The second finds papers that cite Taylor, J.',
        'They are identical; the caret is ignored.',
      ],
      answer: 0,
      why: { 1: t`An exact name match in ADS is a leading \`=\`, as in \`=author:"Taylor, J"\`.`, 2: t`Citations are a separate operator: \`citations(author:"Taylor, J")\`.`, 3: 'The caret is ADS’s first-author marker, and it changes the results a lot for collaborations.' },
      hints: ['Think about large collaborations: hundreds of authors per paper.', 'ADS writes the first-author restriction with a symbol at the start of the name.'],
      teach: t`In ADS, \`^\` in an author search means first author; \`=\` turns off name expansion.`,
      explain: t`\`author:"^Taylor, J"\` keeps only first-author papers. Since ADS author search is “greedy” (it matches J., Joseph, J. H. …), adding the caret, a fuller name or an ORCID is how you find one person’s own work.`,
    }),
    mcq({
      id: 'ads-second', difficulty: 3,
      prompt: t`You are new to binary-pulsar timing and want the **classic methods papers** that the field keeps relying on. Which ADS query does that?

\`\`\`text
useful("binary pulsar")
reviews("binary pulsar")
similar("binary pulsar")
trending("binary pulsar")
\`\`\``,
      visual: venn({ A: 'inner query', B: 'new set', caption: 'Schematic: a second-order operator first runs the inner query (left circle), then builds a new set (right) from what those papers cite, what cites them, what resembles them or what their readers read.' }),
      choices: [t`\`useful("binary pulsar")\``, t`\`reviews("binary pulsar")\``, t`\`similar("binary pulsar")\``, t`\`trending("binary pulsar")\``],
      answer: 0,
      why: {
        1: t`\`reviews()\` returns papers that **cite** many of the matching ones — review articles, not the classics they cite.`,
        2: t`\`similar()\` ranks papers by text similarity to the matching abstracts, excluding the originals.`,
        3: t`\`trending()\` returns what readers of those papers are reading now.`,
      },
      hints: ['A classic methods paper is one that many papers on the topic cite.', 'Which operator combines the reference lists of the matching papers?'],
      teach: t`ADS’s \`useful()\` ranks what the matching papers cite; \`reviews()\` ranks what cites them.`,
      explain: t`\`useful()\` merges the reference lists of every paper the inner query finds and ranks the cited papers by how often they appear: the methods and data papers the field leans on. \`reviews()\` does the reverse and surfaces reviews.`,
    }),
    num({
      id: 'arxiv-id', difficulty: 1,
      gen(r) {
        const P = r.pick(IDS);
        return {
          prompt: t`The identifier of ${P.what} is below. In which month of ${P.y} was it submitted? Give the month as a number from 1 to 12.

\`\`\`text
arXiv:${P.id}
\`\`\``,
          answer: P.m, tol: { rel: 0, abs: 0.1 },
          hints: [t`Since April 2007, arXiv identifiers read \`YYMM.number\`.`, `The two digits after the year are the month.`],
          teach: t`A modern arXiv identifier is \`YYMM.NNNNN\`: two-digit year, two-digit month, then a sequence number (4 digits until 2014, 5 since 2015).`,
          explain: t`\`${P.id.slice(0, 2)}\` is ${P.y}, \`${P.id.slice(2, 4)}\` is ${MONTHS[P.m - 1]}, and ${P.id.split('.')[1]} is its number in that month’s sequence. A version suffix such as \`v2\` marks a revision; cite the version you used.`,
        };
      },
    }),
    mcq({
      id: 'refereed', difficulty: 2,
      prompt: t`A 2025 arXiv preprint claims a deviation from general relativity in a binary pulsar. You want to know whether it has since passed peer review. Which check is **not** a way to find out?

\`\`\`text
arXiv:  look at its jr (journal reference) field
ADS:    property:refereed
INSPIRE: tc p
\`\`\``,
      visual: venn({ A: 'all arXiv papers', B: 'refereed papers', op: 'and', caption: 'Schematic: most arXiv papers in physics are later published in refereed journals, but not all, and many refereed papers in engineering never appear on arXiv.' }),
      choices: [
        'Its arXiv category, since arXiv only accepts refereed papers in gr-qc',
        'Its journal reference on arXiv, added by the authors once it is published',
        t`An ADS search with \`property:refereed\``,
        t`An INSPIRE search with \`tc p\` (published papers)`,
      ],
      answer: 0,
      why: {
        1: 'A journal reference is a good sign, though authors add it themselves and sometimes forget.',
        2: 'ADS marks refereed journal records, so this filter works.',
        3: t`INSPIRE’s type code \`tc p\` selects published papers.`,
      },
      hints: ['What does arXiv’s moderation check, and what does it not?', 'No arXiv category requires peer review.'],
      teach: 'arXiv is moderated but not peer reviewed; publication status comes from a journal reference or a database that tracks refereed records.',
      explain: 'arXiv moderators check that a submission is on topic and plausibly scholarly; they do not referee it. Use the journal reference, ADS’s refereed property or INSPIRE’s published type — and remember that peer review is a filter, not a guarantee.',
    }),
    match({
      id: 'where', difficulty: 2,
      prompt: 'Match each task with the place to start.',
      left: [
        t`Today’s new preprints in general relativity`,
        t`Every refereed paper that cites the 1975 discovery of the binary pulsar`,
        t`Papers citing a LIGO–Virgo result, with collaboration and author records from high-energy physics`,
        t`NASA rocket-engine test reports from the 1960s`,
      ],
      right: ['arXiv new listing for gr-qc', 'ADS citations() operator', 'INSPIRE refersto search', 'NASA Technical Reports Server (NTRS)', 'A general web search engine'],
      answer: [0, 1, 2, 3],
      hints: ['arXiv is for what is new; ADS and INSPIRE are for links between papers.', 'Engineering reports from NASA live in NASA’s own server, not arXiv.'],
      teach: 'arXiv for the newest work by category; ADS for astronomy and physics with citation links; INSPIRE for high-energy physics and gravitation; NTRS for NASA engineering reports.',
      explain: t`The daily \`gr-qc\` listing shows new preprints; \`citations(…)\` in ADS lists citing papers; INSPIRE’s \`refersto\` does the same with HEP author records; and decades of NASA propulsion reports are only in NTRS. A web search engine is a last resort: it is not reproducible and mixes in unrefereed material.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-query', difficulty: 2,
      prompt: t`Which arXiv API query returns \`gr-qc\` papers with *perihelion* in the title whose abstract does not mention Mercury?`,
      visual: venn({ A: 'ti:perihelion', B: 'cat:gr-qc', caption: 'The two main sets (nothing shaded).' }),
      choices: [
        t`\`ti:perihelion AND cat:gr-qc ANDNOT abs:Mercury\``,
        t`\`ti:perihelion OR cat:gr-qc ANDNOT abs:Mercury\``,
        t`\`ti:perihelion AND cat:gr-qc AND abs:Mercury\``,
        t`\`all:perihelion ANDNOT cat:gr-qc\``,
      ],
      answer: 0,
      why: {
        1: 'OR returns the union: every gr-qc paper would come back, thousands of them.',
        2: 'AND keeps the Mercury papers instead of removing them.',
        3: 'This removes the gr-qc papers — the opposite of what you want.',
      },
      hints: ['Two conditions must both hold, and one must not.', 'AND narrows; ANDNOT removes.'],
      teach: 'Translate each condition into a fielded term, then join them with AND for "both" and ANDNOT for "but not".',
      explain: t`AND gives the overlap of the title and category sets; ANDNOT then removes the papers whose abstracts mention Mercury.`,
    }),
    mcq({
      id: 'cp-propulsion', difficulty: 3, transfer: true,
      prompt: t`You want the literature on **rotating detonation rocket engines**. A search of arXiv returns a few dozen papers. What is the best next step?`,
      visual: venn({ A: 'rotating-detonation papers', B: 'papers on arXiv', op: 'a', caption: 'Schematic, not to scale: much of the engineering propulsion literature appears in AIAA journals and conference papers, and in NASA reports, without an arXiv version.' }),
      choices: [
        'Search ADS and NTRS, and an engineering index such as the AIAA’s, as well: much propulsion research never appears on arXiv.',
        'Conclude that the field is small, since arXiv holds essentially all physics research.',
        t`Widen the arXiv query with \`OR\` until it returns thousands of papers.`,
        'Use only the most cited arXiv paper and follow nothing else.',
      ],
      answer: 0,
      why: {
        1: 'arXiv coverage is excellent in high-energy physics and astrophysics and patchy in engineering.',
        2: 'More results is not better coverage; it is more irrelevant papers.',
        3: 'One paper is a starting point for citation trails (next lesson), not a literature review.',
      },
      hints: ['Where do aerospace engineers publish?', 'The shaded circle is the whole topic; arXiv covers only part of it.'],
      teach: 'Choose databases by field: arXiv is not the whole literature, especially in engineering.',
      explain: 'Detonation-engine work is mostly published through the AIAA and in combustion journals, with NASA work in NTRS. ADS indexes some of it; arXiv only a fraction. A search that covers one database is a sample, not a review.',
    }),
    num({
      id: 'cp-rate', difficulty: 2,
      gen(r) {
        const slice = r.pick([500, 1000, 2000]), n = r.int(3, 10), N = slice * n;
        const ans = 3 * (n - 1);
        return {
          prompt: t`You page through $${N}$ arXiv API results in slices of $${slice}$ (\`max_results=${slice}\`, with \`start\` advancing each time), pausing three seconds between consecutive requests as arXiv asks. How many seconds of pauses does the script spend, at minimum?

\`\`\`text
...&start=0&max_results=${slice}
...&start=${slice}&max_results=${slice}
...
\`\`\``,
          answer: ans, units: 's', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 3 * n, feedback: 'There is no pause before the first request: n requests have n − 1 gaps.' }, { value: N * 3, feedback: 'The pause is per request, not per paper.' }].filter((e) => e.value !== ans),
          hints: [t`Number of requests: $${N}/${slice}$.`, 'Pauses come between requests: one fewer than the number of requests.'],
          teach: 'Paging divides a large result set into requests; a polite script pauses between them.',
          explain: t`$${N}/${slice} = ${n}$ requests, so $${n - 1}$ pauses of 3 s: $${ans}$ s, plus the time each response takes.`,
        };
      },
    }),
  ],
  sources: [SRC.arxivApi, { label: 'arXiv help: understanding the arXiv identifier', url: 'https://info.arxiv.org/help/arxiv_identifier.html' }, SRC.adsSyntax, SRC.adsSecond, SRC.adsCites, SRC.inspire],
});
