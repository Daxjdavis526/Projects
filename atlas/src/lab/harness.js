// How a coding exercise is checked, shared by the browser worker and the
// Node test that runs every exercise's reference solution. The learner's
// program runs in a fresh namespace; then each test — a Python expression —
// is evaluated in that same namespace, with everything the program printed
// available as `_stdout`. A test passes when its expression is truthy.

/** Python source that evaluates the tests and leaves a JSON list as its value. */
export function testScript(tests) {
  const pairs = JSON.stringify(tests.map((t) => [t.name, t.code]));
  return [
    'import json as _json',
    '_results = []',
    `for _name, _expr in ${pairs}:`,
    '    try:',
    '        _results.append({"name": _name, "ok": bool(eval(_expr, globals()))})',
    '    except Exception as _err:',
    '        _results.append({"name": _name, "ok": False, "error": type(_err).__name__ + ": " + str(_err)})',
    '_json.dumps(_results)',
  ].join('\n');
}

/** The part of a Pyodide traceback that belongs to the learner's code. */
export function cleanTraceback(message) {
  const lines = String(message || '').trimEnd().split('\n');
  const first = lines.findIndex((l) => l.includes('File "<exec>"'));
  if (first < 0) return lines.slice(-1)[0] || 'The program stopped with an error.';
  return lines.slice(first).map((l) => l.replace('File "<exec>", ', '')).join('\n');
}

/** Packages a program needs loaded before it runs. */
export const SCIENTIFIC = ['numpy', 'scipy', 'matplotlib'];
export const imports = (code, mod) => new RegExp(`^\\s*(import|from)\\s+${mod}\\b`, 'm').test(code);
