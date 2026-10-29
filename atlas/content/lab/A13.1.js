// Recording analysis so it can be rerun — a result is a function of raw
// data, parameters, code, random seeds and software versions, and every one
// of them must be recorded: raw data kept unedited and fingerprinted with a
// hash; the analysis a script run from the top (notebooks restarted and run
// in order); every cut and exclusion in code with its reason; randomness
// from a seeded generator (numpy.random.default_rng), with enough draws that
// the seed does not matter; versions and the commit printed with the
// result. A bootstrap in the browser's Python (the Explore), the muon
// lifetime pipeline (the worked example), and reprocessing a spacecraft's
// telemetry years later as the transfer.
// The Python outputs quoted were copied from running the snippets in the
// Atlas's Pyodide; other numbers are computed here.
import { lesson, mcq, multi, num, order, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { r6 } from './_labf.js';

const t = String.raw;

// a pipeline drawn as boxes and arrows; hi marks one stage
function pipe(labels, caption, hi = -1, warn = -1) {
  const n = labels.length, w = 10 / n;
  const box = (x0, x1, col) => [[x0, 0.4, x1, 0.4], [x1, 0.4, x1, 0.6], [x1, 0.6, x0, 0.6], [x0, 0.6, x0, 0.4]].map(([a, b, c, d]) => ({ param: [`${r6(a)} + ${r6(c - a)}*t`, `${r6(b)} + ${r6(d - b)}*t`], t: [0, 1], color: col, width: 2 }));
  const curves = labels.flatMap((_, i) => box(i * w + 0.3 * w, i * w + 0.7 * w, i === warn ? 'warn' : i === hi ? 'gold' : 'accent'));
  const arrows = labels.slice(0, -1).map((_, i) => ({ from: [r6(i * w + 0.72 * w), 0.5], to: [r6((i + 1) * w + 0.28 * w), 0.5], color: 'ink3' }));
  const points = labels.map((l, i) => ({ x: r6(i * w + 0.5 * w), y: i % 2 ? 0.25 : 0.75, r: 0, label: l, labelAlign: 'center', labelDx: 0, labelDy: 0, color: i === warn ? 'warn' : i === hi ? 'gold' : 'ink' }));
  return { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [0.1, 0.9], axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves, arrows, points }, caption };
}

// Monte Carlo spread of a standard-deviation estimate from B draws: σ/√(2(B − 1))
const mcRel = (B) => 1 / Math.sqrt(2 * (B - 1));

export default lesson({
  id: 'lab.A13.1',
  title: 'Recording analysis so it can be rerun',
  minutes: 13, difficulty: 2,
  lab: true,
  intro: t`A number in a report is the output of a calculation, and someone — a referee, your lab partner, you in two years — will want to run it again. That is only possible if **every input** was kept:

$$\text{result} = F(\text{raw data},\ \text{parameters},\ \text{code},\ \text{seed},\ \text{versions})$$

Keep the raw data exactly as recorded and fingerprint it with a hash. Make the analysis a script that runs top to bottom, with every cut and parameter in it, never a sequence of clicks. Draw random numbers from a generator with a recorded **seed** — and take enough of them that the seed hardly matters. Print the software versions and the code’s commit with every result. The [lab notebook](#/lesson/lab.A0.1) records the measurement; this records the analysis.`,
  symbols: [
    { tex: '\\text{raw data}', text: 'the files as the instrument wrote them: never edited, only read; a hash (SHA-256) proves they have not changed' },
    { tex: '\\text{parameters}', text: 'every choice the analysis makes — bin width, fit range, cuts, calibration constants — written in one place in the code' },
    { tex: '\\text{code}', text: 'the script, identified by its version-control commit' },
    { tex: '\\text{seed}', text: 'the starting state of the random-number generator used for Monte Carlo or bootstrap' },
    { tex: '\\text{versions}', text: 'Python, NumPy, SciPy …: defaults and algorithms change between releases' },
  ],
  why: t`Results that cannot be rerun cannot be checked, corrected or extended; reanalysis of old data with better methods has found errors and discoveries alike, but only where the raw data and the code survived.`,
  visual: {
    type: 'code-runner',
    title: 'A bootstrap with and without a seed',
    lead: t`Eight readings of $g$, fingerprinted with a hash, the software versions printed, and the standard error of their mean estimated by a bootstrap (resampling the data with replacement 2000 times). Run it twice.`,
    tasks: [
      'The unseeded bootstrap gives a slightly different answer every run; the seeded one repeats exactly. Both are equally valid — only one can be checked.',
      'Change one reading by 0.01 and run again: the hash changes completely. A hash in the report proves which data it came from.',
      'Raise B from 2000 to 200 000: the unseeded answers agree to more digits. A seed makes a result repeatable; enough draws make it not depend on the seed.',
    ],
    params: {
      rows: 18,
      code: t`import hashlib, sys
import numpy as np, scipy

data = np.array([9.81, 9.79, 9.84, 9.80, 9.77, 9.83, 9.82, 9.78])   # m/s², raw readings
print("data sha256:", hashlib.sha256(data.tobytes()).hexdigest()[:16])
print("python", sys.version.split()[0], "| numpy", np.__version__, "| scipy", scipy.__version__)

def bootstrap_se(x, B, rng):
    means = [rng.choice(x, size=x.size, replace=True).mean() for _ in range(B)]
    return float(np.std(means, ddof=1))

B = 2000
print("unseeded:", [round(bootstrap_se(data, B, np.random.default_rng()), 5) for _ in range(3)])
print("seed 42: ", [round(bootstrap_se(data, B, np.random.default_rng(42)), 5) for _ in range(3)])
print("formula: ", round(float(data.std(ddof=1) / np.sqrt(data.size)), 5))`,
    },
    caption: t`The bootstrap’s standard error comes out about 6 % below $s/\sqrt N$ because resampling uses the $N$-divisor spread, $\sqrt{(N-1)/N}$ smaller for $N = 8$. Constructed readings; runs in the browser’s Python.`,
  },
  example: {
    prompt: t`You have analysed a muon-lifetime run ([lab.E.15](#/lesson/lab.E.15)): 4000 stop–decay delays in a text file, histogrammed in 0.25 μs bins, fitted from 1.0 μs by Poisson likelihood, $\tau = 2.11 \pm 0.06$ μs. List what must be recorded so that anyone can reproduce that number exactly.`,
    visual: pipe(['raw delays', 'parameters', 'script', 'fit', 'result'], 'The analysis as a pipeline: every box is an input or a step that must be recorded.', 2),
    steps: [
      { label: 'Raw data', text: t`The delay file as the time-to-digital converter wrote it, read-only, with its SHA-256 hash in the analysis log. Converting units or removing events happens in code, never in the file.` },
      { label: 'Parameters', text: t`Bin width 0.25 μs, window 0–20 μs, fit start 1.0 μs, the model $N_0e^{-t/\tau} + B$, the starting values — in one block at the top of the script, each with a comment saying why.` },
      { label: 'Cuts with reasons', text: t`“Bins below 1.0 μs excluded: photomultiplier afterpulsing (see notebook p. 14).” A cut written as code with its reason can be varied and tested; a deleted row cannot.` },
      { label: 'Code and versions', text: t`The script’s commit hash, and the versions of Python, NumPy and SciPy printed by the script itself into the output.` },
      { label: 'Randomness', text: t`This fit uses none. If you add a bootstrap or Monte Carlo check, seed it with \`np.random.default_rng(seed)\`, record the seed, and use enough draws that another seed gives the same digits you report.` },
      { label: 'Output', text: t`The script writes $\tau$, its uncertainty, $\chi^2/\nu$, the data hash, the commit and the versions into one results file — the numbers in the report are copied from there, or formatted by the same code.` },
    ],
    answer: t`The raw file and its hash; the parameters and cuts with reasons, in the script; the script’s commit; the software versions; any seed; and a results file the script writes. With those, $\tau = 2.11 \pm 0.06$ μs can be regenerated by anyone, byte for byte.`,
  },
  practice: [
    mcq({
      id: 'notebook', difficulty: 2,
      prompt: t`A Jupyter notebook gives your result, but its cells were run in the order 1, 2, 5, 3, 4, 5, and cell 3 was edited after it ran. What should you do before reporting the number?`,
      visual: pipe(['cell 1', 'cell 2', 'cell 3 (edited)', 'cell 4', 'cell 5'], 'A notebook whose state no longer matches its text.', -1, 2),
      choices: ['Restart the kernel and run every cell from the top; report what that gives', 'Nothing: the output is on the screen', 'Copy the output into the report before the kernel dies', 'Rerun only cell 5'],
      answer: 0,
      why: { 1: 'The screen shows the result of a state that no longer corresponds to the code anyone can read.', 2: 'Saving a number whose provenance is unknown makes it worse, not better.', 3: 'Cell 5 depends on variables that cells 3 and 4 set in an unknown order.' },
      hints: ['Which variables does cell 5 see — the ones the current text of cell 3 would make, or older ones?'],
      teach: 'Hidden state: a notebook is only reproducible after a restart and a run from the top.',
      explain: t`Variables from deleted or edited cells linger in memory. “Restart and run all” forces the result to depend only on the code as written — the minimum for anything you report.`,
    }),
    num({
      id: 'mc-draws', difficulty: 3,
      gen(r) {
        const pc = r.pick([0.5, 1, 2, 5]);
        const ans = 1 + 1 / (2 * (pc / 100) ** 2);
        return {
          prompt: t`A Monte Carlo estimate of a standard deviation from $B$ independent draws is itself uncertain by a fraction $1/\sqrt{2(B - 1)}$. How many draws make it reproducible — from one seed to another — to ${pc} %?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [1, 6], y: [-3, 0], xlabel: 'log₁₀ B', ylabel: 'log₁₀ (relative spread)', axesAt: 'edge', curves: [{ fn: '-0.5*log10(2*(10^x - 1))', color: 'accent', domain: [1.05, 6] }], hlines: [{ y: r6(Math.log10(pc / 100)), color: 'gold' }] }, caption: 'Seed-to-seed spread of a Monte Carlo standard deviation against the number of draws (log–log); the gold line is the target.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 1 / (pc / 100) ** 2, feedback: 'You dropped the factor 2: a standard deviation’s relative spread is 1/√(2(B − 1)).' }, { value: 1 / (2 * (pc / 100)), feedback: 'Square: the spread falls as 1/√B.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Solve $1/\sqrt{2(B - 1)} = ${pc / 100}$ for $B$.`, t`Square both sides: $2(B - 1) = 1/${pc / 100}^2$.`],
          teach: 'Seed the generator for repeatability, and use enough draws that the seed does not move the digits you report.',
          explain: t`$B = 1 + 1/(2 \times ${pc / 100}^2) = ${ans.toFixed(0)}$. The Explore’s 2000 draws give about ${(100 * mcRel(2000)).toFixed(1)} %, which is why its unseeded answers differ in the third figure.`,
        };
      },
    }),
    multi({
      id: 'record', difficulty: 2,
      prompt: t`Which of these must be recorded for an analysis to be rerun exactly?`,
      visual: pipe(['raw data', 'parameters', 'code', 'seed', 'versions'], 'The inputs of a result.'),
      choices: ['the hash of the raw data file', 'the random seed of any Monte Carlo step', 'the versions of NumPy and SciPy', 'every cut, with its reason, as code', 'the time of day the script was run'],
      answer: [0, 1, 2, 3],
      why: { 4: 'The clock time does not change the result (unless the code reads it — which it should not).' },
      hints: ['Ask of each: if it changed, could the result change?'],
      teach: 'Record every input that could change the result: data (by hash), parameters and cuts, code, seeds and versions.',
      explain: t`Data, choices, code, randomness and the environment determine the output; the time of day does not — unless something like an unseeded generator secretly uses it.`,
    }),
    order({
      id: 'pipeline', difficulty: 2,
      prompt: t`Put the stages of a reproducible analysis in order.`,
      visual: pipe(['1', '2', '3', '4', '5'], 'Five stages from instrument to report.'),
      items: ['Save the raw data unedited and record its hash', 'Write parameters and cuts at the top of a script, each with its reason', 'Run the script from the top, with a seeded generator', 'Have the script write results, versions and the data hash to a file', 'Copy numbers into the report from that file (or format them in code)'],
      hints: ['Nothing downstream may change anything upstream: data first, report last.'],
      teach: 'Data → parameters → run → results file → report: each stage reads only the one before.',
      explain: t`The report never contains a number typed by hand from a screen: every value can be traced to a line of a results file, and that file to a commit, a seed and a data hash.`,
    }),
    mcq({
      id: 'hash', difficulty: 1,
      prompt: t`You change a single reading in a 2 MB data file from 9.81 to 9.82. What happens to its SHA-256 hash?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [0, 2], axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', points: [{ x: 0.4, y: 1.4, r: 0, label: 'ee3335a51bbb96bb…  (the Explore’s data)' }, { x: 0.4, y: 0.6, r: 0, label: '????????????????…  (one reading changed)' }] }, caption: 'Two fingerprints: the first 16 hexadecimal digits of each hash.' },
      choices: ['It changes completely and unpredictably: about half its bits flip', 'Only its last digit changes', 'It stays the same, since 0.01 is within the uncertainty', 'It changes by an amount proportional to 0.01'],
      answer: 0,
      why: { 1: 'Cryptographic hashes are designed so that no part of the output tracks a small change in the input.', 2: 'A hash knows nothing about uncertainties: any changed byte changes it.', 3: 'There is no proportionality; that is the point of a hash.' },
      hints: ['A hash is designed to make any change detectable.'],
      teach: 'A hash fingerprints data exactly: any change, however small, gives an unrelated hash.',
      explain: t`So a hash in the analysis log proves which bytes were analysed — and a mismatch years later shows at once that the file is not the one used.`,
    }),
    mcq({
      id: 'cuts', difficulty: 2,
      prompt: t`Three readings look wrong. Which is the reproducible way to exclude them?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 21], y: [9.5, 10.3], xlabel: 'reading number', ylabel: 'g (m/s²)', axesAt: 'edge', points: Array.from({ length: 20 }, (_, i) => ({ x: i + 1, y: [5, 12, 17].includes(i + 1) ? [9.58, 10.21, 9.62][[5, 12, 17].indexOf(i + 1)] : r6(9.80 + 0.02 * Math.sin(3.1 * i)), r: 4, color: [5, 12, 17].includes(i + 1) ? 'warn' : 'accent' })) }, caption: 'Twenty readings; three stand out.' },
      choices: ['Keep them in the raw file and exclude them in code by a stated rule (with the notebook’s reason), reporting the result with and without the cut', 'Delete their rows from the spreadsheet', 'Overwrite them with the mean of their neighbours', 'Leave them out of the figure but in the fit'],
      answer: 0,
      why: { 1: 'Deleted rows leave no trace of what was removed or why.', 2: 'Inventing data is falsification.', 3: 'The figure and the analysis must show the same data.' },
      hints: ['Could someone else apply — or argue with — your exclusion?'],
      teach: 'Exclusions are code with a reason, applied to untouched data, and their effect is reported.',
      explain: t`A rule in code (“readings where the photogate logged a double trigger”) can be inspected, changed and tested; showing the result both ways lets the reader judge whether the cut matters. See [residual analysis](#/lesson/lab.A6.2) on outliers.`,
    }),
    code({
      id: 'provenance', difficulty: 3,
      prompt: t`Write \`analyse(data, seed)\` that returns a dictionary with: \`"mean"\`, \`"se_boot"\` (a bootstrap standard error of the mean from 5000 resamples using \`np.random.default_rng(seed)\`), \`"sha256"\` (the hex digest of \`data.tobytes()\`), \`"seed"\`, and \`"numpy"\` (NumPy’s version string). The same inputs must always give the same output.`,
      starter: t`import hashlib
import numpy as np

def analyse(data, seed):
    data = np.asarray(data, float)
    # your code
    return {}

g = np.array([9.81, 9.79, 9.84, 9.80, 9.77, 9.83, 9.82, 9.78])
print(analyse(g, 7))`,
      answer: t`import hashlib
import numpy as np

def analyse(data, seed):
    data = np.asarray(data, float)
    rng = np.random.default_rng(seed)
    means = rng.choice(data, size=(5000, data.size), replace=True).mean(axis=1)
    return {
        "mean": float(data.mean()),
        "se_boot": float(np.std(means, ddof=1)),
        "sha256": hashlib.sha256(data.tobytes()).hexdigest(),
        "seed": seed,
        "numpy": np.__version__,
    }

g = np.array([9.81, 9.79, 9.84, 9.80, 9.77, 9.83, 9.82, 9.78])
print(analyse(g, 7))`,
      tests: [
        { name: 'the same seed gives exactly the same bootstrap error', code: 'analyse(g, 7)["se_boot"] == analyse(g, 7)["se_boot"]' },
        { name: 'a different seed gives a slightly different one', code: 'analyse(g, 7)["se_boot"] != analyse(g, 8)["se_boot"] and abs(analyse(g, 7)["se_boot"] / analyse(g, 8)["se_boot"] - 1) < 0.05' },
        { name: 'the bootstrap error is close to s/√N × √((N − 1)/N)', code: 'abs(analyse(g, 7)["se_boot"] / (g.std(ddof=0) / np.sqrt(g.size)) - 1) < 0.05' },
        { name: 'the record holds the data hash, the seed and the NumPy version', code: 'analyse(g, 7)["sha256"] == hashlib.sha256(g.tobytes()).hexdigest() and analyse(g, 7)["seed"] == 7 and analyse(g, 7)["numpy"] == np.__version__' },
        { name: 'the mean is right', code: 'abs(analyse(g, 7)["mean"] - 9.805) < 1e-12' },
      ],
      hints: [t`\`rng = np.random.default_rng(seed)\` — a generator of your own, not the global \`np.random.seed\`. \`rng.choice(data, size=(5000, data.size), replace=True).mean(axis=1)\` gives 5000 bootstrap means at once.`, t`\`hashlib.sha256(data.tobytes()).hexdigest()\`; put everything in a dictionary.`],
      teach: 'A function of explicit inputs — data, seed — that returns its own provenance is reproducible by construction.',
      explain: t`Passing a seeded generator in (rather than seeding NumPy’s global state) keeps the randomness local and repeatable even when other code draws random numbers too. The returned dictionary is a results record: write it to a file next to the numbers you report.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-telemetry', difficulty: 2, transfer: true,
      prompt: t`Ten years after a spacecraft’s mission, a team wants to reanalyse its accelerometer data with a better model of thruster leaks. What must have been archived for that to be possible?`,
      visual: pipe(['raw telemetry', 'calibrations', 'processing code', 'versions', 'products'], 'A mission’s data chain, from raw telemetry to published products.', 0),
      choices: ['The raw telemetry with its calibration files, the processing code at the version used, and its environment — not only the processed products', 'The final plots and tables in the published papers', 'The processed products, since the raw telemetry is too large to keep', 'The names of the people who did the processing'],
      answer: 0,
      why: { 1: 'Plots cannot be reprocessed with a new model.', 2: 'Processed products already contain the old model’s assumptions, which are exactly what the new analysis wants to replace.', 3: 'People move on; code and files remain.' },
      hints: ['A new model must be applied before the old model’s assumptions were.'],
      teach: 'Archive raw data, calibrations and the exact code: reanalysis needs the inputs, not the outputs.',
      explain: t`Reanalysis of archived raw data is how long-standing anomalies — the Pioneer spacecraft’s unexplained acceleration among them — were finally traced to thermal recoil, decades later.`,
    }),
    mcq({
      id: 'cp-upgrade', difficulty: 3,
      prompt: t`After a SciPy upgrade, rerunning your analysis changes the fitted value in the fourth significant figure (well inside its uncertainty). What do you do?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3], y: [2.08, 2.16], xlabel: '', ylabel: 'τ (μs)', xticks: 0, axesAt: 'edge', curves: [{ param: ['1', '2.0715 + 0.116*t'], t: [0, 1], color: 'accent', width: 2 }, { param: ['2', '2.0718 + 0.116*t'], t: [0, 1], color: 'violet', width: 2 }], points: [{ x: 1, y: 2.1295, r: 5, color: 'accent', label: 'SciPy 1.17' }, { x: 2, y: 2.1298, r: 5, color: 'violet', label: 'SciPy 1.18' }] }, caption: 'The same analysis under two library versions, each with its ±1σ bar (illustrative numbers).' },
      choices: ['Record both versions and both results, find which default or algorithm changed, and report with the version stated', 'Downgrade SciPy silently and keep the old number', 'Average the two results', 'Report more significant figures to show both'],
      answer: 0,
      why: { 1: 'Hiding the version dependence loses information a reader may need.', 2: 'The two are not independent measurements; averaging them means nothing.', 3: 'Digits beyond the uncertainty carry no information either way.' },
      hints: ['Is the change a problem for the result, or a fact about the analysis worth recording?', 'Which inputs of the result equation changed?'],
      teach: 'Software versions are inputs: record them, and investigate a version dependence rather than hiding it.',
      explain: t`A change far inside the uncertainty does not change the conclusion, but it is evidence that the analysis touches a default (a tolerance, a starting value) that you should set explicitly — after which both versions should agree.`,
    }),
    num({
      id: 'cp-boot', difficulty: 2,
      gen(r) {
        const B = r.pick([200, 500, 1000, 5000, 20000]);
        const ans = 100 * mcRel(B);
        return {
          prompt: t`A bootstrap with $B = ${B}$ resamples estimates a standard error. By roughly what percentage would its value change from one seed to another (one standard deviation, $1/\sqrt{2(B - 1)}$)?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [2, 5], y: [0, 6], xlabel: 'log₁₀ B', ylabel: 'seed-to-seed spread (%)', axesAt: 'edge', curves: [{ fn: '100/sqrt(2*(10^x - 1))', color: 'accent' }], vlines: [{ x: r6(Math.log10(B)), color: 'gold' }] }, caption: 'The spread of a bootstrap standard error against the number of resamples.' },
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 / Math.sqrt(B), feedback: 'For a standard deviation the relative spread is 1/√(2(B − 1)), not 1/√B.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$100/\sqrt{2(${B} - 1)}$.`],
          teach: 'A bootstrap error is itself a Monte Carlo estimate: report it to the digits its B supports.',
          explain: t`$100/\sqrt{2 \times ${B - 1}} = ${ans.toFixed(2)}\,\%$. ${ans > 2 ? 'Too coarse to quote two figures of the standard error; raise B.' : 'Enough for two significant figures.'}`,
        };
      },
    }),
  ],
  sources: [
    { label: 'G. Wilson et al., Good enough practices in scientific computing, PLOS Comput. Biol. 13, e1005510 (2017)', url: 'https://doi.org/10.1371/journal.pcbi.1005510' },
    { label: 'NumPy documentation: random Generator and seeding (numpy.random.default_rng)', url: 'https://numpy.org/doc/stable/reference/random/generator.html' },
    { label: 'S. G. Turyshev et al., Support for the thermal origin of the Pioneer anomaly, Phys. Rev. Lett. 108, 241101 (2012)', url: 'https://doi.org/10.1103/PhysRevLett.108.241101' },
    { label: 'B. Efron & R. J. Tibshirani, An Introduction to the Bootstrap (Chapman & Hall, 1993)', url: 'https://doi.org/10.1201/9780429246593' },
  ],
});
