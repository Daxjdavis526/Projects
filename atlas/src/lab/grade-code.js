// Grading a coding exercise in the browser: run the learner's program in a
// fresh namespace in the Python worker, then the exercise's tests
// (harness.js). The result has the same shape as the other graders'.

import { run } from './python.js';
import { cleanTraceback } from './harness.js';

export async function gradeCode(item, src, { onOutput } = {}) {
  if (!String(src || '').trim()) return { status: 'invalid', correct: false, feedback: 'Write some code first.' };
  let r;
  try {
    r = await run(src, { fresh: true, tests: item.tests, onOutput, timeoutMs: item.timeoutMs ?? 20000 });
  } catch (e) {
    return { status: 'invalid', correct: false, feedback: `Python could not start: ${e?.message || e}` };
  }
  if (!r.ok) {
    const tb = cleanTraceback(r.error);
    return { status: 'incorrect', correct: false, feedback: `Your program stopped with an error:\n\n\`\`\`\n${tb}\n\`\`\``.replace(/```\n([\s\S]*?)\n```/, (m, body) => body.split('\n').map((l) => '    ' + l).join('\n')) };
  }
  const tests = r.tests || [];
  const failed = tests.filter((t) => !t.ok);
  if (!failed.length) return { status: 'correct', correct: true, feedback: `All ${tests.length} test${tests.length === 1 ? '' : 's'} passed.` };
  const lines = tests.map((t) => `- ${t.ok ? '✓' : '✗'} ${t.name}${t.error ? ` — \`${t.error.slice(0, 160)}\`` : ''}`);
  return { status: 'incorrect', correct: false, feedback: `${failed.length} of ${tests.length} test${tests.length === 1 ? '' : 's'} failed:\n\n${lines.join('\n')}` };
}
