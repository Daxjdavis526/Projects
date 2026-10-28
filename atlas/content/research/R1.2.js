// Search strategies and citation trails — how a literature search is built
// and judged: keyword searches measured by precision and recall, backward
// (references) and forward (citations) trails from a seed paper, review
// papers first, a stopping rule (saturation), and the biases of following
// citations. The citation graphs are schematic; real operators are ADS's
// references()/citations() and INSPIRE's refersto/citedby.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { venn, citeGraph, SRC } from './_rs.js';

const t = String.raw;

// a schematic citation network around a 2016 seed paper
const BACK = 'step(abs(dir - 2) - 0.5)*step(dir - 0.5)';   // dir = 1 or 3
const FWD = 'step(dir - 1.5)';                              // dir = 2 or 3
const GEN2 = 'step(dir - 2.5)';                             // dir = 3
const NODES = [
  { id: 'S', x: 2016, y: 0, label: 'seed (2016)', color: 'gold', r: 8, labelDx: -30, labelDy: 20 },
  { id: 'r1', x: 1975, y: 1.3, label: 'r1', color: 'accent2', when: BACK },
  { id: 'r2', x: 1982, y: -1.1, label: 'r2', color: 'accent2', when: BACK },
  { id: 'r3', x: 2004, y: 1.6, label: 'r3', color: 'accent2', when: BACK },
  { id: 'r4', x: 2010, y: -1.5, label: 'r4', color: 'accent2', when: BACK, labelDx: -10, labelDy: 18 },
  { id: 'c1', x: 2018, y: 1.4, label: 'c1', color: 'accent', when: FWD },
  { id: 'c2', x: 2020, y: -0.9, label: 'c2', color: 'accent', when: FWD },
  { id: 'c3', x: 2023, y: 0.7, label: 'c3', color: 'accent', when: FWD },
  { id: 'c4', x: 2024, y: -1.8, label: 'c4', color: 'accent', when: FWD },
  { id: 'g1', x: 1969, y: -0.3, label: 'g1', color: 'violet', when: GEN2 },
  { id: 'g2', x: 1995, y: -0.2, label: 'g2', color: 'violet', when: GEN2 },
  { id: 'g3', x: 2025, y: 1.7, label: 'g3', color: 'violet', when: GEN2 },
];
const EDGES = [
  ['S', 'r1', { when: BACK }], ['S', 'r2', { when: BACK }], ['S', 'r3', { when: BACK }], ['S', 'r4', { when: BACK }],
  ['c1', 'S', { when: FWD }], ['c2', 'S', { when: FWD }], ['c3', 'S', { when: FWD }], ['c4', 'S', { when: FWD }],
  ['r2', 'g1', { when: GEN2, color: 'violet' }], ['r3', 'g2', { when: GEN2, color: 'violet' }], ['r4', 'g2', { when: GEN2, color: 'violet' }], ['g3', 'c3', { when: GEN2, color: 'violet' }], ['c2', 'r4', { when: GEN2, color: 'violet' }],
];
const WINDOW = { x: [1962, 2030], y: [-2.4, 2.4], xlabel: 'year', xticks: 7 };
const network = (dir, caption) => {
  const fix = (w) => (w === undefined ? undefined : w.replaceAll('dir', String(dir)));
  const nodes = NODES.map((n) => ({ ...n, when: fix(n.when) }));
  const edges = EDGES.map(([a, b, o]) => [a, b, { ...o, when: fix(o.when) }]);
  return citeGraph(nodes, edges, WINDOW, caption);
};

// retrieved-versus-relevant picture with counts
const prPic = (found, rel, both, caption) => venn({ A: `found by the search (${found})`, B: `relevant (${rel})`, counts: { ab: both }, caption });

export default lesson({
  id: 'research.R1.2',
  title: 'Search strategies and citation trails',
  minutes: 12, difficulty: 2,
  intro: t`A literature search has two failure modes: drowning in irrelevant papers, and missing the important ones. Two numbers measure them. **Precision** is the fraction of what you found that is relevant; **recall** is the fraction of everything relevant that you found:

$$P = \frac{N_{\text{rel,found}}}{N_{\text{found}}}, \qquad R = \frac{N_{\text{rel,found}}}{N_{\text{rel}}}$$

Keyword searches trade one against the other. **Citation trails** escape the trade: from one good *seed* paper, follow its reference list **backward** to the work it builds on, and its citations **forward** to the work that built on it. Start from a review if one exists, and stop when new trails keep returning papers you already have.`,
  symbols: [
    { tex: 'N_{\\text{found}}', text: 'the number of papers your search returned' },
    { tex: 'N_{\\text{rel}}', text: 'the number of relevant papers that exist — never known exactly; estimated from a review’s reference list or from papers you know must appear' },
    { tex: 'N_{\\text{rel,found}}', text: 'the relevant papers among those you found' },
    { tex: 'P,\\ R', text: 'precision and recall, each between 0 and 1' },
  ],
  why: t`A missed paper can mean redoing published work — or missing the result that already answers your question.`,
  visual: {
    ...citeGraph(NODES, EDGES, { ...WINDOW, choices: [{ key: 'dir', label: 'Follow the trail', value: 0, options: [[0, 'seed only'], [1, 'backward (its references)'], [2, 'forward (its citations)'], [3, 'both, plus one more step']], explain: 'Which papers the trail has reached from the seed.' }] }),
    title: 'Backward and forward from one seed',
    lead: t`One seed paper from 2016 (gold). Its **references** point back in time to the work it builds on; its **citations** come from later papers that build on it. Arrows point from the citing paper to the cited one.`,
    tasks: ['Backward: the trail reaches earlier work — the foundations, but nothing newer than 2016.', 'Forward: only forward citations find what happened after the seed was written.', 'One more step: r3 and r4 both cite g2, a paper the seed never cited — a paper cited by several of your papers is probably one you need.'],
    caption: 'Schematic, not real papers. In ADS the two directions are references(…) and citations(…); in INSPIRE, citedby and refersto.',
  },
  example: {
    prompt: t`You start a project on the binary pulsar PSR B1913+16 with one seed: Weisberg & Huang (2016), ADS bibcode \`2016ApJ...829...55W\`. Build a reading list.`,
    visual: network(3, 'The trail after one step backward, one forward, and one more in each direction (schematic).'),
    steps: [
      { label: 'Look for a review', text: t`A recent review gives you a curated list in one go. In ADS, \`reviews("binary pulsar")\` ranks papers that cite many of the matching ones — usually reviews. Will’s *Living Review* on tests of general relativity (2014) is one.` },
      { label: 'Backward', text: t`The seed’s references:

\`\`\`text
references(bibcode:2016ApJ...829...55W)
\`\`\`

This reaches the discovery (Hulse & Taylor 1975) and the first orbital-decay measurement (Taylor & Weisberg 1982).` },
      { label: 'Forward', text: t`Who built on it since?

\`\`\`text
citations(bibcode:2016ApJ...829...55W)
\`\`\`

This is the only direction that finds work newer than the seed. INSPIRE’s equivalent is a \`refersto\` search on the record.` },
      { label: 'Keep score', text: t`Note a paper that turns up from **several** directions — cited by many of your papers, or citing many of them. It is central; read it early.` },
      { label: 'Fill the gaps', text: t`Citation trails stay inside one community. Run keyword searches too (\`abs:"binary pulsar" abs:"orbital decay"\`), and in another database, to catch work that does not cite your seed.` },
      { label: 'Stop', text: t`When each new round mostly returns papers already on your list, you have reached **saturation**. Record the queries and dates so the search can be rerun.` },
    ],
    answer: t`Review first, then backward (\`references\`) and forward (\`citations\`) from the seed, keyword searches to escape the citation bubble, and stop at saturation — with every query written down.`,
  },
  practice: [
    mcq({
      id: 'which-way', difficulty: 1,
      prompt: t`You have a 2016 paper on the binary pulsar. You want the papers that have **tested or extended** its result since. Which direction do you follow?`,
      visual: network(0, 'The seed paper alone (schematic).'),
      choices: ['Forward: the papers that cite it', 'Backward: the papers it cites', 'Neither: search by the same authors only', 'Backward, then sort by date'],
      answer: 0,
      why: { 1: 'A 2016 paper can only cite work from before 2016.', 2: 'Others test results too, often more critically than the original authors.', 3: 'Sorting older references by date still gives nothing after 2016.' },
      hints: ['A paper cannot cite the future.', 'Newer work points at the seed, not the other way.'],
      teach: 'References lead back to foundations; citations lead forward to everything built since.',
      explain: t`Later work appears in the seed’s **citations**: ADS \`citations(…)\`, INSPIRE \`refersto\`.`,
    }),
    num({
      id: 'precision', difficulty: 1,
      gen(r) {
        const found = r.int(8, 20) * 10, both = r.int(2, Math.floor(found / 20)) * 10, rel = both + r.int(2, 8) * 10;
        return {
          prompt: t`A keyword search returns $${found}$ papers. Reading the abstracts, you judge $${both}$ of them relevant. You also know of $${rel}$ relevant papers in all. What is the search’s **precision**?`,
          visual: prPic(found, rel, both, 'Found against relevant. The overlap is what the search got right.'),
          answer: both / found, tol: { rel: 0.01 },
          errors: [{ value: both / rel, feedback: 'That is recall — the fraction of all relevant papers found. Precision divides by what the search returned.' }].filter((e) => Math.abs(e.value - both / found) > 0.02 * both / found),
          hints: ['Precision asks: of what came back, how much is useful?', t`$P = N_{\text{rel,found}}/N_{\text{found}}$.`],
          teach: 'Precision is the useful fraction of what the search returned.',
          explain: t`$P = ${both}/${found} = ${(both / found).toFixed(3)}$: you read ${found} abstracts to find ${both} useful papers.`,
        };
      },
    }),
    num({
      id: 'recall', difficulty: 2,
      gen(r) {
        const key = r.int(25, 60), got = r.int(Math.ceil(key * 0.4), key - 4);
        return {
          prompt: t`A recent review cites $${key}$ papers you consider essential for your topic. Your own keyword search finds $${got}$ of them. Estimate the search’s **recall**.`,
          visual: prPic('?', key, got, 'Found against the review’s essential papers, used as a stand-in for “all relevant papers”.'),
          answer: got / key, tol: { rel: 0.01 },
          errors: [{ value: 1 - got / key, feedback: 'That is the fraction you missed. Recall is the fraction you found.' }].filter((e) => Math.abs(e.value - got / key) > 0.02),
          hints: ['Recall asks: of everything relevant, how much did you find?', t`$R = N_{\text{rel,found}}/N_{\text{rel}}$, with the review’s list standing in for $N_{\text{rel}}$.`],
          teach: 'Recall is the fraction of the relevant literature your search reached; a review’s reference list is a practical yardstick.',
          explain: t`$R \approx ${got}/${key} = ${(got / key).toFixed(2)}$. The ${key - got} missed papers tell you which words your query lacks — look at their titles and abstracts.`,
        };
      },
    }),
    mcq({
      id: 'tradeoff', difficulty: 2,
      prompt: t`Your search \`abs:"gravitational waves"\` returns tens of thousands of papers. You add \`AND abs:"neutron star"\`. What happens to precision and recall for a project on neutron-star mergers?`,
      visual: venn({ A: 'abs:"gravitational waves"', B: 'abs:"neutron star"', op: 'and', caption: 'The narrowed search returns only the overlap (schematic sizes).' }),
      choices: ['Precision rises; recall falls a little (relevant papers using other words, such as “kilonova”, are lost)', 'Both rise', 'Precision falls; recall rises', 'Neither changes: AND only reorders results'],
      answer: 0,
      why: { 1: 'Narrowing can never find a relevant paper the wider search missed, so recall cannot rise.', 2: 'That is what OR does: it widens.', 3: 'AND removes every paper lacking the second term.' },
      hints: ['AND can only remove papers.', 'Removing mostly irrelevant papers raises precision; any relevant paper removed lowers recall.'],
      teach: 'Narrowing a search raises precision at the cost of recall; widening does the reverse.',
      explain: 'The AND discards most off-topic gravitational-wave papers (precision up) but also drops relevant ones that say “binary neutron star” only in the full text or use “kilonova” (recall down). Citation trails recover many of those.',
    }),
    order({
      id: 'strategy', difficulty: 2,
      prompt: 'Put the steps of a literature search for a new project in a sensible order.',
      visual: network(3, 'Where the steps lead: a seed, its references and citations, and one more step (schematic).'),
      items: [
        'Find a recent review of the topic',
        'Pick seed papers from it',
        'Follow their references backward',
        'Follow their citations forward',
        'Run keyword searches to catch papers outside the citation trail',
        'Stop when new rounds return mostly papers you already have',
      ],
      hints: ['A review is the best first seed.', 'Saturation is the stopping rule, so it comes last.'],
      teach: 'Review → seeds → backward → forward → keywords to escape the bubble → saturation.',
      explain: 'The review saves days; trails from its key papers find the core; keyword searches catch work from outside the community; saturation tells you when to stop. Record each query so the search can be rerun.',
    }),
    num({
      id: 'per-year', difficulty: 2,
      gen(r) {
        const yA = r.pick([1975, 1982, 1990]), cA = r.int(15, 30) * 100;
        const yB = r.pick([2015, 2016, 2018]), cB = r.int(5, 12) * 100, now = 2025;
        const rate = cB / (now - yB);
        return {
          prompt: t`By ${now}, a paper from ${yA} has $${cA}$ citations and a paper from ${yB} has $${cB}$ (illustrative counts). How many citations per year has the ${yB} paper collected?`,
          visual: {
            type: 'graph',
            params: {
              x: [yA - 3, now + 3], y: [0, Math.max(cA, cB) * 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'year', ylabel: 'citations so far', xticks: 6, yticks: 4,
              curves: [
                { fn: `${cA}*(x - ${yA})/${now - yA}`, domain: [yA, now], color: 'accent2', label: `${yA} paper`, labelAt: (yA + now) / 2, labelDx: -20, labelDy: -14 },
                { fn: `${cB}*(x - ${yB})/${now - yB}`, domain: [yB, now], color: 'gold', label: `${yB} paper`, labelAt: yB + 2, labelDx: -70, labelDy: -14 },
              ],
            },
            caption: 'Cumulative citations, drawn as straight lines for simplicity; real citation histories rise and fall.',
          },
          answer: rate, tol: { rel: 0.01 },
          errors: [{ value: cB / (now - yA), feedback: 'Divide by the age of the paper in question.' }].filter((e) => Math.abs(e.value - rate) > 0.02 * rate),
          hints: [t`Its age is $${now} - ${yB} = ${now - yB}$ years.`],
          teach: 'Raw citation counts favour old papers; dividing by age (and comparing within one field) is fairer — and still not a measure of correctness.',
          explain: t`$${cB}/${now - yB} = ${rate.toFixed(0)}$ per year, against $${cA}/${now - yA} = ${(cA / (now - yA)).toFixed(0)}$ per year for the older paper. Citations measure attention, which can include papers cited because they were wrong.`,
        };
      },
    }),
    mcq({
      id: 'saturation', difficulty: 2,
      prompt: t`You record how many **new** relevant papers each round of trail-following adds (below). When is it reasonable to stop?`,
      visual: {
        type: 'graph',
        params: {
          x: [0.4, 7.6], y: [0, 26], aspect: 'wide', axesAt: 'edge', xlabel: 'round', ylabel: 'new relevant papers', xticks: 7, yticks: 5,
          shade: [[1, 22], [2, 14], [3, 9], [4, 5], [5, 2], [6, 1], [7, 1]].map(([k, n]) => ({ fn: String(n), from: k - 0.3, to: k + 0.3, color: 'accent', alpha: 0.6 })),
        },
        caption: 'One search’s record, constructed for illustration: new papers per round of following references and citations.',
      },
      choices: ['Around round 5 or 6, when rounds add one or two papers — then run one keyword search in another database as a check', 'After round 1, since it found the most', 'Never: a search is only complete when every paper in the field is found', 'When you have 50 papers, whatever the trend'],
      answer: 0,
      why: { 1: 'Round 1 is where the trail is richest, not where it ends.', 2: 'Complete recall is impossible and not needed; diminishing returns is the signal.', 3: 'A fixed number ignores the topic: a narrow question may need 15 papers, a broad one 200.' },
      hints: ['Look at the shape of the bars, not the total.', 'Stop when another round costs a lot and returns almost nothing new.'],
      teach: 'Stop at saturation — when new rounds return mostly papers you already have — and check once from an independent direction.',
      explain: 'The returns fall to one or two papers per round by round 5. One independent keyword search (another database, other words) checks that the saturation is real and not a closed citation bubble.',
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-backward', difficulty: 2, transfer: true,
      prompt: t`From Weisberg & Huang (2016), bibcode \`2016ApJ...829...55W\`, you want the 1975 paper announcing the discovery of the binary pulsar. Which ADS query reaches it in one step?`,
      visual: network(1, 'The seed and its references (schematic).'),
      choices: [t`\`references(bibcode:2016ApJ...829...55W)\``, t`\`citations(bibcode:2016ApJ...829...55W)\``, t`\`similar(bibcode:2016ApJ...829...55W)\``, t`\`trending(bibcode:2016ApJ...829...55W)\``],
      answer: 0,
      why: { 1: 'Citations are later papers; a 1975 paper cannot cite a 2016 one.', 2: 'similar() ranks papers by text similarity and may or may not include it.', 3: 'trending() lists what readers of the seed are reading now.' },
      hints: ['1975 is before 2016: which direction is that?', 'Backward means the seed’s reference list.'],
      teach: t`\`references(…)\` goes backward to what a paper cites; \`citations(…)\` forward to what cites it.`,
      explain: t`The seed cites the discovery paper (Hulse & Taylor 1975, ApJ 195, L51), so \`references(…)\` lists it.`,
    }),
    num({
      id: 'cp-pr', difficulty: 2,
      gen(r) {
        const found = r.int(10, 30) * 10, both = r.int(3, 9) * 5, rel = both + r.int(2, 10) * 5;
        const which = r.pick(['precision', 'recall']);
        const ans = which === 'precision' ? both / found : both / rel;
        return {
          prompt: t`A search for papers on Mercury’s perihelion returns $${found}$ papers, $${both}$ of them relevant. A review lists $${rel}$ relevant papers, all of which you can check against your results. What is the search’s **${which}**?`,
          visual: prPic(found, rel, both, 'Found against relevant (the review’s list).'),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: which === 'precision' ? both / rel : both / found, feedback: which === 'precision' ? 'That is recall. Precision divides by the number found.' : 'That is precision. Recall divides by the number relevant.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: ['Precision divides by what you found; recall by what exists.'],
          teach: 'Precision = relevant found ÷ found; recall = relevant found ÷ relevant.',
          explain: t`${which === 'precision' ? t`$P = ${both}/${found} = ${ans.toFixed(3)}$.` : t`$R = ${both}/${rel} = ${ans.toFixed(3)}$.`}`,
        };
      },
    }),
    mcq({
      id: 'cp-bubble', difficulty: 3,
      prompt: t`A literature review built only from citation trails, starting from one well-known group’s paper, has a systematic weakness. Which?`,
      visual: network(3, 'A trail grows through citation links only (schematic): papers that never cite into this cluster cannot appear.'),
      choices: [
        'It over-represents papers inside one citation community and misses independent work that does not cite it.',
        'It misses old papers, since trails only move forward.',
        'It finds too many papers to read.',
        'It cannot reach review articles.',
      ],
      answer: 0,
      why: { 1: 'Backward trails reach old papers well.', 2: 'Volume is a nuisance, not a systematic bias.', 3: 'Reviews usually cite, and are cited by, the seed’s community.' },
      hints: ['Ask what a paper must do to get onto the list at all.', 'A paper joins only if it is linked by citation to papers already on it.'],
      teach: 'Citation trails inherit the citing habits of a community; keyword searches and other databases are the cure.',
      explain: 'Groups cite their own and their friends’ work more. A competing method published in another community — or in an engineering journal — may never link into the cluster. Independent keyword searches catch it.',
    }),
  ],
  sources: [SRC.adsCites, SRC.adsSecond, SRC.inspire, SRC.pulsar, SRC.will,
    { label: 'R. A. Hulse & J. H. Taylor, “Discovery of a pulsar in a binary system”, ApJ 195, L51 (1975)', url: 'https://ui.adsabs.harvard.edu/abs/1975ApJ...195L..51H' }],
});
