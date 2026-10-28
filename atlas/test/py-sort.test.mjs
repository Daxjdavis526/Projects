// The traces behind the py-sort simulation: insertion sort, bottom-up merge
// sort and binary search for a bracket, checked against what the algorithms
// must do.
//   node atlas/test/py-sort.test.mjs

import { insertionTrace, mergeTrace, searchTrace, bracket } from '../src/viz/model/py-sort.js';
import { validate } from '../src/viz/sims/py-sort.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const last = (f) => f[f.length - 1];
const sortedCopy = (a) => [...a].sort((x, y) => x - y);
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// a fixed pseudo-random generator, so the test is repeatable
let seed = 12345;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

for (let trial = 0; trial < 40; trial++) {
  const n = 2 + Math.floor(rand() * 30);
  const a = Array.from({ length: n }, () => Math.round(rand() * 100));
  const ins = insertionTrace(a), mer = mergeTrace(a);
  check(`insertion sort sorts (n = ${n})`, same(last(ins).arr, sortedCopy(a)));
  check(`merge sort sorts (n = ${n})`, same(last(mer).arr, sortedCopy(a)));
  check(`every insertion frame is a permutation of the input (n = ${n})`, ins.every((f) => same(sortedCopy(f.arr), sortedCopy(a))));
  check(`merge sort needs at most n⌈log₂ n⌉ comparisons (n = ${n})`, last(mer).comparisons <= n * Math.ceil(Math.log2(n)));
  check(`the input array is left untouched (n = ${n})`, ins[0].arr.length === n && mer[0].arr.length === n);
}

// insertion sort: n − 1 comparisons on sorted input, n(n − 1)/2 on reversed input
{
  const n = 12;
  const up = Array.from({ length: n }, (_, i) => i), down = [...up].reverse();
  check('insertion sort on sorted input: n − 1 comparisons', last(insertionTrace(up)).comparisons === n - 1);
  check('insertion sort on reversed input: n(n − 1)/2 comparisons', last(insertionTrace(down)).comparisons === (n * (n - 1)) / 2);
  check('merge sort on reversed input: far fewer comparisons', last(mergeTrace(down)).comparisons < (n * (n - 1)) / 2);
}

// binary search: the right bracket, in at most ⌈log₂(n − 1)⌉ probes
for (let trial = 0; trial < 60; trial++) {
  const n = 2 + Math.floor(rand() * 500);
  const table = [];
  let v = rand();
  for (let i = 0; i < n; i++) { table.push(v); v += 0.01 + rand(); }
  const x = table[0] + rand() * (table[n - 1] - table[0]) * 0.999999;
  const i = bracket(table, x);
  check(`binary search brackets x (n = ${n})`, table[i] <= x && x < table[i + 1], `i = ${i}`);
  const probes = last(searchTrace(table, x)).comparisons;
  check(`binary search probes ≤ ⌈log₂(n − 1)⌉ (n = ${n})`, probes <= Math.ceil(Math.log2(Math.max(1, n - 1))), `${probes} probes`);
}
check('a two-row table needs no probe', last(searchTrace([0, 1], 0.5)).comparisons === 0);

// the simulation's parameter check
check('validate accepts a sorting spec', validate({ mode: 'insertion', values: [5, 2, 4, 6, 1, 3] }).length === 0);
check('validate accepts a search spec', validate({ mode: 'search', values: [0, 10, 20, 30], target: 12 }).length === 0);
check('validate rejects an unsorted search table', validate({ mode: 'search', values: [0, 20, 10], target: 5 }).length > 0);
check('validate rejects a target outside the table', validate({ mode: 'search', values: [0, 10, 20], target: 25 }).length > 0);
check('validate rejects an unknown mode', validate({ mode: 'bogo', values: [1, 2] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
