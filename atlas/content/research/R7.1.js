// Version control and notebooks, for research: a number is reproducible only
// if its code, data, environment and randomness are all recorded. git bisect
// finds the commit that changed a result in ⌈log₂ N⌉ tests (the Explore runs
// one on a 31-commit history); tags pin the code a paper used; notebooks hide
// state when cells run out of order (Restart & Run All is the test); a
// seeded local generator (default_rng) rather than the global np.random.
// Commits themselves, project layout and tests are prog.P15.1–P15.2; recording
// an analysis at the bench is lab.A13.1.
import { lesson, mcq, multi, num, order, code } from '../../src/core/content.js';
import { commitLine, notebookOrder, SRC2 } from './_rs2.js';
import { timeBars } from './_rs.js';

const t = String.raw;

// the Explore's history: tag v1.0 is commit 0 (H₀ = 73.2), HEAD is commit 31 (71.9); the culprit is 21
const EX = commitLine({ N: 31, culprit: 21, good: 73.2, bad: 71.9, y: [71.3, 73.8], key: 'k', ylabel: 'H₀ printed (km/s/Mpc)' });
const commitPic = (N, culprit, upto, caption) => {
  const c = commitLine({ N, culprit, good: 73.2, bad: 71.9, y: [71.3, 73.8], upto, ylabel: 'H₀ printed (km/s/Mpc)' });
  return { type: 'graph', params: c.params, caption };
};

// the notebook: page order against the order the cells were run
const L_ = 0.994;
const Tof = (g) => 2 * Math.PI * Math.sqrt(L_ / g);
const NB = [
  { page: 1, run: 2, label: 'import math' },
  { page: 2, run: 1, label: 'g = 9.80; L = 0.994' },
  { page: 3, run: 4, label: 'T = 2π√(L/g)' },
  { page: 4, run: 3, label: 'g = 9.81' },
];
const NB_CODE = t`\`\`\`python
[2]  import math
[1]  g = 9.80; L = 0.994          # m/s², m
[4]  T = 2 * math.pi * math.sqrt(L / g)
     print(T)                      # shows ${Tof(9.81).toFixed(4)}
[3]  g = 9.81
\`\`\``;
const nbPic = (caption) => notebookOrder(NB, { caption });

export default lesson({
  id: 'research.R7.1',
  title: 'Version control and notebooks',
  minutes: 12, difficulty: 2,
  intro: t`A result is **reproducible** when someone else — or you, in six months — can rerun it and get the same number. Four things make a number: the **code**, the **data**, the **environment** (which versions of Python, NumPy and SciPy) and the **randomness** (the seed of every random draw). Version control records the first; an environment file the third; a seed the fourth; raw data is kept untouched and only ever read.

When a number changes and you do not know why, version control can find the change. \`git bisect\` tests the commit halfway between a known-good and a known-bad version, keeps the half that contains the change, and repeats, so among $N$ suspect commits it needs only

$$n = \lceil \log_2 N \rceil$$

tests. [Organizing a project](#/lesson/prog.P15.2) introduced commits; this lesson is about using them to defend a research number.`,
  symbols: [
    { tex: 'N', text: 'the number of commits that could have introduced the change: every commit after the last known-good one, up to the known-bad one' },
    { tex: 'n', text: 'the number of tests (runs of the analysis) the bisection needs, in the worst case' },
    { tex: '\\log_2 N', text: 'how many times $N$ can be halved before one commit is left' },
    { tex: '\\lceil\\,\\cdot\\,\\rceil', text: 'the ceiling: round up to the next whole number (half a test is not possible)' },
  ],
  why: t`A referee, a collaborator or a later you will ask “why does this give a different number now?” — and the answer should take minutes, not weeks.`,
  visual: {
    type: 'graph',
    title: 'Bisecting a history',
    lead: t`Your paper’s analysis was tagged \`v1.0\` at commit 0, where it printed $H_0 = 73.2$ km/s/Mpc. Today, 31 commits later, it prints $71.9$. Each step runs the analysis on the commit in the middle of the gold interval: green means it still prints the old value, red the new one. Step through the tests.`,
    tasks: ['Step to 1 test: commit 15 prints the old value, so the change is in 16–31.', 'Step to 5 tests: one commit is left. It is the first one that prints the new value.', 'Count: 31 suspects took 5 tests — ⌈log₂ 31⌉ = 5. Testing commits one by one could have taken 30.'],
    params: {
      ...EX.params,
      sliders: [{ key: 'k', label: 'tests run', min: 0, max: EX.nTests, step: 1, value: 0, explain: 'How many commits the bisection has tested so far.' }],
      readouts: [{ label: 'commits still suspect', expr: EX.steps.map((s, j) => `${s.hi - s.lo}*step(0.5 - abs(k - ${j}))`).join(' + '), digits: 2 }],
    },
    caption: 'A constructed history: hollow grey dots are commits not yet tested; the gold band holds the commits that could still be the culprit. A real bisection only ever runs the tested commits.',
  },
  example: {
    prompt: t`The Explore’s history: commit 0 (tag \`v1.0\`) prints $H_0 = 73.2$, commit 31 (\`HEAD\`) prints $71.9$. Find the commit that changed it, and say what you would do next.`,
    visual: { type: 'graph', params: commitLine({ N: 31, culprit: 21, good: 73.2, bad: 71.9, y: [71.3, 73.8], upto: 5, ylabel: 'H₀ printed (km/s/Mpc)' }).params, caption: 'After five tests: commit 21 is the first to print the new value. Constructed history.' },
    steps: [
      { label: 'Start', text: t`\`git bisect start\`, then \`git bisect bad\` (the current commit prints 71.9) and \`git bisect good v1.0\` (the tag prints 73.2). There are $N = 31$ suspects, so expect $\lceil\log_2 31\rceil = 5$ tests.` },
      { label: 'Test the middle', text: t`Git checks out commit 15. Run the analysis: it prints 73.2, so type \`git bisect good\`. The change is in 16–31.` },
      { label: 'Repeat', text: t`Commit 23 prints 71.9 (\`bad\`); commit 19 prints 73.2 (\`good\`); commit 21 prints 71.9 (\`bad\`); commit 20 prints 73.2 (\`good\`). Git reports: **commit 21 is the first bad commit**.` },
      { label: 'Read the diff', text: t`\`git show\` on commit 21 shows what changed. Suppose it switched the supernova sample’s redshift cut. That may be a bug — or a deliberate improvement whose effect on $H_0$ you must now report.` },
      { label: 'Finish', text: t`\`git bisect reset\` returns you to \`HEAD\`. The bisection could be automated (\`git bisect run\` with a script that fails when the number changes), but even by hand it took five runs.` },
    ],
    answer: t`Commit 21, found in 5 tests. The diff says what changed; whether the new number or the old one is right is a physics question the diff only starts.`,
  },
  practice: [
    num({
      id: 'bisect-count', difficulty: 1,
      gen(r) {
        const N = r.pick([12, 20, 24, 40, 50, 60]);
        const ans = Math.ceil(Math.log2(N));
        return {
          prompt: t`A fit gives a different $\chi^2$ than it did last month. There are ${N} commits since the last version known to give the old value. In the worst case, how many tests does \`git bisect\` need to find the commit that changed it?`,
          visual: commitPic(N, Math.max(2, Math.round(N * 0.6)), 0, `${N} suspect commits between a known-good version (left) and the current one (right). Constructed history.`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: N - 1, feedback: 'That is testing the commits one by one. Bisection halves the suspects with every test.' }, { value: N / 2, feedback: 'Half the commits is the *first* step of halving — keep halving.' }, { value: Math.log2(N), feedback: t`Round up: the number of tests is a whole number, $\lceil\log_2 N\rceil$.` }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: ['Each test halves the number of suspect commits.', t`Find the smallest $n$ with $2^n \ge ${N}$.`],
          teach: t`Bisection needs $\lceil\log_2 N\rceil$ tests because each one halves the suspects.`,
          explain: t`$2^{${ans - 1}} = ${2 ** (ans - 1)} < ${N} \le 2^{${ans}} = ${2 ** ans}$, so $n = ${ans}$.`,
        };
      },
    }),
    mcq({
      id: 'nb-hidden', difficulty: 2,
      prompt: t`A notebook shows these cells, with the execution counts Jupyter prints beside them:

${NB_CODE}

Which value of $g$ did the printed period use?`,
      visual: nbPic('Each dot is a cell: across, the order it was run; down, its place on the page. The run order zig-zags up and down the page.'),
      choices: [t`$9.81\ \text{m/s}^2$ — cell [3] ran just before cell [4]`, t`$9.80\ \text{m/s}^2$ — it is set above the formula`, 'Neither: the formula cell raised a NameError, because math is imported in a different cell', t`The average of the two, $9.805\ \text{m/s}^2$`],
      answer: 0,
      why: { 1: 'That is the page order. A notebook remembers the order cells were *run*, which the numbers in brackets record.', 2: 'All cells share one namespace: `import math` ran as cell [2], before the formula ran as [4].', 3: 'A name holds one value at a time: the last one assigned before the formula ran.' },
      hints: ['Read the numbers in brackets, not the page: they are the order Python ran the cells.', 'Which assignment to g happened last before cell [4]?'],
      teach: 'A notebook’s state is whatever the cells did in the order they ran, which need not be the order on the page.',
      explain: t`The run order was [1] $g = 9.80$, [2] import, [3] $g = 9.81$, [4] the formula — so $T = 2\pi\sqrt{0.994/9.81} = ${Tof(9.81).toFixed(4)}$ s.`,
    }),
    mcq({
      id: 'nb-restart', difficulty: 2,
      prompt: t`The same notebook:

${NB_CODE}

You choose **Restart & Run All**, which clears everything and runs the cells top to bottom. What happens?`,
      visual: nbPic('Restart & Run All replaces this zig-zag with a straight run down the page.'),
      choices: [t`It runs without error and prints $${Tof(9.80).toFixed(4)}$ s — a different number from the one on the page`, t`It prints $${Tof(9.81).toFixed(4)}$ s again`, 'It stops with a NameError at the formula', 'It refuses to run, because the execution counts are out of order'],
      answer: 0,
      why: { 1: 'Top to bottom, $g = 9.81$ comes *after* the formula, so the formula sees 9.80.', 2: 'Top to bottom, `import math` (page cell 1) runs before the formula (page cell 3).', 3: 'Execution counts are only labels; Jupyter will run the cells in any order.' },
      hints: ['Top to bottom: what is g when the formula runs?'],
      teach: 'Restart & Run All is the test of a notebook: only what it produces is what the notebook actually computes.',
      explain: t`Top to bottom the formula sees $g = 9.80$ and prints $${Tof(9.80).toFixed(4)}$ s, not the $${Tof(9.81).toFixed(4)}$ s on the page. No error warns you: the difference is a silent ${((Tof(9.80) / Tof(9.81) - 1) * 1e6).toFixed(0)} parts per million. Run all from a fresh kernel before trusting, or sharing, any number in a notebook.`,
    }),
    multi({
      id: 'what-to-commit', difficulty: 2,
      prompt: 'A project measures a pulsar’s spin-down from 40 GB of radio-telescope recordings. Which belong in the git repository?',
      visual: timeBars([
        { y: 3, from: 0, to: 3, color: 'accent', label: 'raw data (read only, archived)' },
        { y: 2, from: 3, to: 7, color: 'gold', label: 'code (in git)' },
        { y: 1, from: 7, to: 10, color: 'violet', label: 'results and figures (regenerated)' },
      ], { x: [-0.2, 10.4], y: [0.4, 3.7], xlabel: '', xticks: 0 }, { caption: 'Data flows one way: raw data is read, never edited; code turns it into results; results can always be regenerated.' }),
      choices: ['The analysis scripts and the script that makes each figure', 'An environment file that pins the Python, NumPy and SciPy versions', 'A small README saying where the raw data is archived, with its checksum', 'The 40 GB of raw recordings', 'The password for the telescope archive'],
      answer: [0, 1, 2],
      why: { 3: 'Git keeps every version of every file forever; 40 GB would make every clone 40 GB. Archive it (with a DOI if possible) and record where it is and its checksum.', 4: 'Anything committed is in the history for good, even after you delete it. Secrets live outside the repository.' },
      hints: ['Git is for small text files that people edit.', 'For each item, ask: can it be regenerated, and would it be safe to publish?'],
      teach: 'Commit what you write (code, environment, pointers to data); archive what you collect; regenerate what you compute; never commit secrets.',
      explain: 'Scripts, the environment file and a pointer to the archived data are small, written by you, and needed to rerun the analysis. The recordings belong in an archive; the password belongs nowhere in the history.',
    }),
    code({
      id: 'seeded', difficulty: 2,
      prompt: t`This function makes **synthetic** pendulum timings (20 periods, true $T = 2.006$ s, scatter $0.01$ s) and returns their mean. Make it reproducible: the same \`seed\` must always give the same result, a different seed a different one, and it must not disturb NumPy’s global random state (other code may rely on it). Use a local generator, \`np.random.default_rng(seed)\`.`,
      starter: t`import numpy as np

def synthetic_run(seed):
    """Mean of 20 synthetic periods: true T = 2.006 s, scatter 0.01 s."""
    T = 2.006 + 0.01 * np.random.normal(size=20)
    return T.mean()

print(synthetic_run(7), synthetic_run(7))
`,
      answer: t`import numpy as np

def synthetic_run(seed):
    """Mean of 20 synthetic periods: true T = 2.006 s, scatter 0.01 s."""
    rng = np.random.default_rng(seed)
    T = 2.006 + 0.01 * rng.normal(size=20)
    return T.mean()

print(synthetic_run(7), synthetic_run(7))
`,
      tests: [
        { name: 'the same seed gives the same result', code: 'synthetic_run(7) == synthetic_run(7)' },
        { name: 'different seeds give different results', code: 'synthetic_run(7) != synthetic_run(8)' },
        { name: 'the result is near 2.006 s', code: 'abs(synthetic_run(7) - 2.006) < 0.01' },
        { name: 'the global random state is left alone', code: '(lambda s: (synthetic_run(3), np.random.get_state()[2] == s[2] and (np.random.get_state()[1] == s[1]).all())[1])(np.random.get_state())' },
      ],
      hints: ['Make a generator inside the function from the seed it is given.', '`rng = np.random.default_rng(seed)`, then draw with `rng.normal(size=20)`.'],
      teach: 'Give every random computation its own seeded generator, and record the seed with the result.',
      explain: t`\`np.random.default_rng(seed)\` makes a private generator: the same seed replays the same draws, and nothing outside the function is touched. \`np.random.seed(seed)\` would repeat too, but it resets the *global* generator that every other part of the program shares.`,
    }),
    order({
      id: 'bisect-steps', difficulty: 2,
      prompt: 'Put a bisection by hand in order.',
      visual: commitPic(31, 21, 2, 'Two tests in: the gold band holds the commits still suspected. Constructed history.'),
      items: [
        '`git bisect start`',
        '`git bisect bad` — the current commit gives the new number',
        '`git bisect good v1.0` — the tagged version gave the old number',
        'Run the analysis on the commit git checks out',
        'Type `git bisect good` or `git bisect bad`, and repeat until git names the first bad commit',
        '`git bisect reset`, then read that commit’s diff',
      ],
      hints: ['Git needs to know one bad and one good version before it can pick a middle.', 'The reset comes after git has named the commit.'],
      teach: 'Bisection needs a known-bad and a known-good version, a test you can run on any commit, and a verdict for each one.',
      explain: 'Start, mark the two ends, then test-and-mark until one commit is left; reset returns you to where you were. The test must be the same at every step — the same script, data and seed.',
    }),
    mcq({
      id: 'tag', difficulty: 2,
      prompt: 'You submit a paper today. What makes sure that, a year from now, you can rerun exactly the code that produced its numbers?',
      visual: commitPic(31, 21, 0, 'A tag is a permanent name for one commit, like v1.0 at commit 0 here.'),
      choices: ['Tag the commit (`git tag -a v1.0-submitted`), push the tag, and print the commit hash in the paper’s code-availability statement', 'Copy the project folder to `analysis_FINAL_v2`', 'Keep the notebook open with its outputs showing', 'Write down the date, so you can find the version from the file timestamps'],
      answer: 0,
      why: { 1: 'A copy drifts — someone fixes a bug in one and not the other — and it cannot show what changed since.', 2: 'The outputs on screen may come from hidden state (out-of-order cells); they are not a record of the code.', 3: 'Timestamps change whenever a file is copied or touched.' },
      hints: ['Git can give a commit a permanent, human-readable name.'],
      teach: 'Tag the commit a paper used and cite its hash: then “the code from the paper” is one command away.',
      explain: t`\`git checkout v1.0-submitted\` will then restore exactly that code. With the environment file and the seed in the same commit, the rest of the run is recorded too.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-stand', difficulty: 2, transfer: true,
      gen(r) {
        const N = r.pick([600, 750, 900, 1100, 1300, 1500]), mins = r.pick([8, 12, 15]);
        const n = Math.ceil(Math.log2(N)), ans = n * mins;
        return {
          prompt: t`A rocket test stand’s data pipeline now reports a peak thrust 2% lower than it did for last spring’s hot fire. There are ${N} commits since the version that gave last spring’s number, and reprocessing the hot-fire data takes ${mins} minutes. How long, in minutes, does a worst-case bisection take?`,
          visual: { type: 'graph', params: { x: [-20, N + 40], y: [0, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'commit number', ylabel: '', yticks: 0, xticks: 5, shade: [{ fn: '0.7', lower: '0.3', from: 0, to: N, color: 'gold', alpha: 0.2 }], points: [{ x: 0, y: 0.5, color: 'good', r: 5, label: 'good', labelDx: 6, labelDy: -10 }, { x: N, y: 0.5, color: 'bad', r: 5, label: 'bad', labelDx: -30, labelDy: -10 }] }, caption: `${N} suspect commits, too many to draw one by one.` },
          answer: ans, units: 'min', tol: { rel: 0.001 },
          errors: [{ value: N * mins, feedback: 'That is testing every commit in turn. Bisection halves the suspects with each run.' }, { value: Math.log2(N) * mins, feedback: t`Round the number of runs up to a whole number first: $\lceil\log_2 ${N}\rceil$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Number of runs: the smallest $n$ with $2^n \ge ${N}$.`, `Then multiply by ${mins} minutes per run.`],
          teach: 'Bisection turns a search through a thousand commits into ten runs.',
          explain: t`$\lceil\log_2 ${N}\rceil = ${n}$ runs × ${mins} min $= ${ans}$ min. Testing each commit could take ${(N * mins / 60).toFixed(0)} hours.`,
        };
      },
    }),
    mcq({
      id: 'cp-report', difficulty: 2,
      prompt: t`Your notebook displays a fit with $\chi^2/\nu = 1.02$. After Restart & Run All it gives $\chi^2/\nu = 1.37$. Which number do you put in the report?`,
      visual: nbPic('A notebook run out of order carries state that a fresh run does not have.'),
      choices: ['1.37, after finding what state produced 1.02 — only the fresh run is what the code computes', '1.02: it is the better fit', 'The mean of the two, with half the difference as an uncertainty', 'Whichever matches the published value'],
      answer: 0,
      why: { 1: 'A better-looking number produced by hidden state is not a result of your analysis at all.', 2: 'The two runs are not two measurements; one of them is not reproducible.', 3: 'Choosing the run that agrees is confirmation bias — and the published value may be the wrong one.' },
      hints: ['Which of the two could anyone else reproduce?'],
      teach: 'A number counts only if a fresh, top-to-bottom run produces it.',
      explain: 'The 1.02 came from cells run out of order — perhaps a cut applied twice, or a variable left from an earlier attempt. Find it (that is information about your analysis), fix the code, and report what a fresh run gives.',
    }),
    code({
      id: 'cp-provenance', difficulty: 2,
      prompt: t`Write \`provenance(seed, params)\` that returns a dictionary recording what a result came from: the key \`"numpy"\` holding NumPy’s version string (\`np.__version__\`), \`"seed"\` holding the seed, and every entry of the dictionary \`params\` as well.`,
      starter: t`import numpy as np

def provenance(seed, params):
    pass

print(provenance(42, {"L_m": 0.994, "n_swings": 20}))
`,
      answer: t`import numpy as np

def provenance(seed, params):
    record = {"numpy": np.__version__, "seed": seed}
    record.update(params)
    return record

print(provenance(42, {"L_m": 0.994, "n_swings": 20}))
`,
      tests: [
        { name: 'it records the NumPy version', code: 'provenance(1, {})["numpy"] == np.__version__' },
        { name: 'it records the seed', code: 'provenance(42, {})["seed"] == 42' },
        { name: 'it records every parameter', code: 'provenance(0, {"L_m": 0.994, "n_swings": 20})["L_m"] == 0.994 and provenance(0, {"L_m": 0.994, "n_swings": 20})["n_swings"] == 20' },
      ],
      hints: ['Start a dictionary with the two fixed keys.', 'Then `record.update(params)` adds the rest, and `return record`.'],
      teach: 'Save the provenance next to every result: versions, seed and parameters.',
      explain: t`On a real machine you would add the git commit (from \`git rev-parse HEAD\`) and SciPy’s version, and write the dictionary to a JSON file beside the output. Then “what produced this?” has an answer on disk.`,
    }),
  ],
  sources: [SRC2.gitbook, SRC2.wilson, SRC2.numpyRng, { label: 'Project Jupyter documentation: the notebook interface and running cells', url: 'https://docs.jupyter.org/en/latest/' }],
});
