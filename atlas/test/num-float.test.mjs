// The floating-point model behind the num-float simulation: bit patterns,
// fields, neighbours and exact decimal values of IEEE 754 numbers.
//   node atlas/test/num-float.test.mjs

import * as M from '../src/viz/model/num-float.js';
import { validate } from '../src/viz/sims/num-float.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

// bit patterns (checked against Python's struct.pack('>d', x))
check('1.0 is 0 01111111111 000…0', M.bitsOf(1) === '0' + '01111111111' + '0'.repeat(52));
check('-2.5 has sign 1, exponent 1024', M.decode(-2.5).sign === 1 && M.decode(-2.5).stored === 1024 && M.decode(-2.5).e === 1);
check('0.1 in hex is 3fb999999999999a', BigInt('0b' + M.bitsOf(0.1)).toString(16) === '3fb999999999999a');
check('float32 1.0 is 0x3f800000', parseInt(M.bitsOf(1, 'f32'), 2) === 0x3f800000);
check('bits round-trip (float64)', [0.1, -3.75, 1e-310, 6.02214076e23, Number.MAX_VALUE].every((x) => M.fromBits(M.bitsOf(x)) === x));
check('bits round-trip (float32)', [0.1, -3.75, 1e-40, 3e38].every((x) => { const y = Math.fround(x); return M.fromBits(M.bitsOf(y, 'f32'), 'f32') === y; }));

// kinds and exponents
check('subnormal detected', M.decode(1e-310).kind === 'subnormal' && M.decode(1e-310).e === -1022);
check('zero, inf and NaN', M.decode(0).kind === 'zero' && M.decode(Infinity).kind === 'inf' && M.decode(NaN).kind === 'nan');
check('unbiased exponent of 6.371e6 is 22', M.decode(6.371e6).e === 22);

// spacing
check('ulp(1) = 2⁻⁵² (machine epsilon)', M.ulp(1) === 2 ** -52);
check('ulp(1) in float32 = 2⁻²³', M.ulp(1, 'f32') === 2 ** -23);
check('ulp(2⁵³) = 2', M.ulp(2 ** 53) === 2);
check('ulp of a subnormal is 2⁻¹⁰⁷⁴', M.ulp(1e-320) === 2 ** -1074);
check('nextUp(1) = 1 + 2⁻⁵²', M.nextUp(1) === 1 + 2 ** -52);
check('nextDown(1) = 1 − 2⁻⁵³', M.nextDown(1) === 1 - 2 ** -53);
check('nextUp(-1) = −1 + 2⁻⁵³', M.nextUp(-1) === -1 + 2 ** -53);
check('nextUp(0) is the smallest subnormal', M.nextUp(0) === 2 ** -1074);
check('float32 nextUp(1)', M.nextUp(1, 'f32') === 1 + 2 ** -23);

// exact decimal values (Python: decimal.Decimal(x))
const d01 = M.exactDecimal(0.1);
check('0.1 is stored as 0.1000000000000000055511151231257827021181583404541015625', d01.text === '0.1000000000000000055511151231257827021181583404541015625', d01.text);
check('0.1 has 55 significant digits, first at 10⁻¹', d01.digits === 55 && d01.exp10 === -1);
check('cut to 20 digits', M.exactDecimal(0.1, 20).sig === '10000000000000000555' && M.exactDecimal(0.1, 20).cut);
check('2⁶⁰ is exact', M.exactDecimal(2 ** 60).text === '1152921504606846976');
check('1e22 is exact, 1e23 is not', M.exactDecimal(1e22).text === '1' + '0'.repeat(22) && M.exactDecimal(1e23).text === '99999999999999991611392');
check('float32 0.1 is 0.100000001490116119384765625', M.exactDecimal(Math.fround(0.1)).text === '0.100000001490116119384765625');
check('negative values', M.exactDecimal(-0.375).text === '-0.375' && M.exactDecimal(-0.375).neg);

// the simulation's parameter check
check('validate accepts the defaults', validate({ value: 0.1, format: 'f64' }).length === 0);
check('validate rejects a bad format', validate({ value: 1, format: 'f16' }).length > 0);
check('validate rejects a non-number', validate({ value: 'x', format: 'f64' }).length > 0);

console.log(`\nnum-float: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
