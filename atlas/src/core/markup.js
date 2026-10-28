// The small markup lessons are written in: paragraphs, **bold**, *italic*,
// `code`, ```fenced code blocks```, [links](url), "- " lists, "> " callouts,
// $inline$ and $$display$$ TeX. Nothing inside code is math or emphasis. Rendering is a pure string → HTML function with the math renderer
// passed in, so the browser uses KaTeX and the Node tests can extract every
// TeX fragment and compile it.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export { esc as escapeHTML };

/** Split text into alternating prose and math segments. `\$` is a literal dollar. */
export function segments(text) {
  const out = [];
  const s = String(text);
  let i = 0, buf = '';
  while (i < s.length) {
    if (s[i] === '\\' && s[i + 1] === '$') { buf += '$'; i += 2; continue; }
    if (s[i] === '$') {
      const display = s[i + 1] === '$';
      const open = display ? 2 : 1;
      const close = s.indexOf(display ? '$$' : '$', i + open);
      if (close === -1) { buf += s.slice(i); break; }
      if (buf) out.push({ t: 'text', v: buf });
      buf = '';
      out.push({ t: display ? 'display' : 'math', v: s.slice(i + open, close) });
      i = close + open;
      continue;
    }
    buf += s[i++];
  }
  if (buf) out.push({ t: 'text', v: buf });
  return out;
}

const FENCE = /```[^\n]*\n([\s\S]*?)\n?```/g;
const CODE_SPAN = /(`[^`\n]+`)/;

// Inside String.raw (how lessons are written) a backtick has to be typed \`,
// and String.raw keeps the backslash; markup reads \` as a plain backtick.
const unescapeTicks = (text) => String(text).replace(/\\`/g, '`');

/** Text with code (fenced blocks and `spans`) removed — code is never math. */
const withoutCode = (text) => unescapeTicks(text).replace(FENCE, ' ').split(CODE_SPAN).filter((p, i) => i % 2 === 0).join(' ');

/** Every TeX fragment in a string (for validation). */
export const mathIn = (text) => segments(withoutCode(text)).filter((g) => g.t !== 'text').map((g) => ({ tex: g.v, display: g.t === 'display' }));

function inline(text, math) {
  // code spans first, so `x**2` or `$HOME` inside them stays literal
  return unescapeTicks(text).split(CODE_SPAN).map((part, k) => {
    if (k % 2 === 1) return `<code>${esc(part.slice(1, -1))}</code>`;
    // math becomes a placeholder while emphasis and links are applied, so
    // **bold with $x$ inside** works; then the rendered math goes back in
    const maths = [];
    const text = segments(part).map((g) => (g.t === 'text' ? esc(g.v) : `\u0002${maths.push(math(g.v, g.t === 'display')) - 1}\u0002`)).join('');
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|#[^)\s]*)\)/g, (m, label, url) =>
        `<a href="${url}"${url.startsWith('#') ? '' : ' target="_blank" rel="noopener"'}>${label}</a>`)
      // punctuation right after math stays on its line ("onto $\vec b$." never orphans the full stop)
      .replace(/([(\[“‘]*)\u0002(\d+)\u0002([.,;:!?)\]’”]*)/g, (m, a, k, p) => (a || p ? `<span class="nowrap">${a}${maths[+k]}${p}</span>` : m))
      .replace(/\u0002(\d+)\u0002/g, (m, k) => maths[+k]);
  }).join('');
}

/**
 * Render markup to HTML.
 * @param {string} text
 * @param {(tex:string, display:boolean)=>string} math
 */
export function render(text, math = (t) => `<code>${esc(t)}</code>`) {
  if (!text) return '';
  // fenced code blocks are lifted out first and put back verbatim
  const fences = [];
  const src = unescapeTicks(text).replace(/\r/g, '').replace(FENCE, (m, body) => `\n\n\u0000${fences.push(body) - 1}\u0000\n\n`);
  const blocks = src.split(/\n\s*\n/).filter((b) => b.trim());
  return blocks.map((block) => {
    const f = /^\s*\u0000(\d+)\u0000\s*$/.exec(block);
    if (f) return `<pre class="code-block"><code>${esc(fences[+f[1]])}</code></pre>`;
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
      return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-•]\s+/, ''), math)}</li>`).join('')}</ul>`;
    }
    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''), math)}</li>`).join('')}</ol>`;
    }
    if (lines.every((l) => /^\s*>\s?/.test(l))) {
      return `<aside class="callout">${inline(lines.map((l) => l.replace(/^\s*>\s?/, '')).join(' '), math)}</aside>`;
    }
    const joined = lines.join(' ').trim();
    if (/^\$\$[\s\S]*\$\$$/.test(joined) && segments(joined).length === 1) return `<div class="display-math">${math(joined.slice(2, -2), true)}</div>`;
    return `<p>${inline(joined, math)}</p>`;
  }).join('');
}

/** Render a single line without wrapping it in a paragraph. */
export const renderInline = (text, math) => inline(String(text ?? ''), math);

// TeX command names that never appear in math without their backslash: in an
// ordinary JS string '\int' silently becomes 'int' and '\sqrt' 'sqrt'
const BARE_COMMAND = /(?<![\\A-Za-z])(frac|dfrac|tfrac|sqrt|int|iint|oint|sum|prod|lim|vec|hat|cdot|times|infty|partial|nabla|alpha|beta|gamma|delta|epsilon|varepsilon|theta|lambda|sigma|omega|Omega|Delta|Gamma|Sigma|Lambda|displaystyle|left|right|mathrm|mathbf|approx|equiv|propto|rightarrow|Rightarrow|leq|geq|neq|quad|qquad)(?![A-Za-z])/;

/**
 * Characters that betray a TeX command eaten by a JS string escape (\theta → TAB + "heta"),
 * and, in prose (`prose: false` for bare TeX fields), TeX commands left outside $…$.
 */
export function escapeDamage(text, { prose = true } = {}) {
  const s = String(text);
  if (/[\t\f\v\b\r]/.test(s)) return 'contains a control character — a TeX command like \\theta, \\frac, \\vec or \\rho lost its backslash to a JS escape; use String.raw';
  if (/\n(abla|u\b|eq\b|eq\s|ot\b|ewline|i\b|orm)/.test(withoutCode(s)) && /\$/.test(s)) return 'a newline sits where \\nabla, \\nu, \\neq or \\not was probably meant; use String.raw';
  for (const m of mathIn(s)) {
    const sci = /(?<![\w.\\])(\d+(?:\.\d+)?e[+-]?\d+)(?![\w])/.exec(m.tex);
    if (sci) return `the math “${m.tex.slice(0, 40)}” contains “${sci[1]}”, computer notation — use tex() to write ×10ⁿ`;
    const bare = bareCommand(m.tex);
    if (bare) return `the math “${m.tex.slice(0, 40)}” contains “${bare}” without its backslash — a JS string ate it; write the string with String.raw (t\`…\`)`;
    // a row break written as \\ inside String.raw arrives as one backslash (a control space): an
    // environment with columns, a lone "\ " and no row break at all was surely meant to have rows
    if (/\\begin\{(?:[pbvBV]?matrix|array|aligned|cases)\}/.test(m.tex) && /&/.test(m.tex) && !/\\\\/.test(m.tex) && /(?<!\\)\\ (?!\\)/.test(m.tex)) return `the math “${m.tex.slice(0, 40)}” has columns but no row break, and a lone “\\ ” (a control space) where \\\\ was probably meant — inside t\`…\` write \\\\`;
    const lost = lostRowBreak(m.tex);
    if (lost) return `the math “${m.tex.slice(0, 40)}” ${lost} — a row break \\\\ was probably lost (inside t\`…\` write \\\\)`;
    // a number that failed to compute: NaN, undefined or Infinity spliced into the math
    const junk = /(?<![A-Za-z\\])(NaN|undefined|Infinity|null)(?![A-Za-z])/.exec(m.tex);
    if (junk) return `the math “${m.tex.slice(0, 40)}” contains “${junk[1]}” — a value failed to compute before it was spliced in`;
    // '\rho' in an ordinary string is a carriage return + "ho", which a later rewrite may turn into a newline
    if (/\n(ho|ight|angle|floor|ceil|ightarrow|m)(?![A-Za-z])/.test(m.tex)) return `the math “${m.tex.slice(0, 40)}” has a line break where \\rho, \\right or \\rangle was probably meant; use String.raw`;
  }
  // an odd number of unescaped $ leaves one open: everything after it reads as math
  if (prose && (withoutCode(s).replace(/\\\$/g, '').match(/\$/g) || []).length % 2) return 'has an odd number of $ signs — one opens math that never closes (a stray $ after an interpolation?)';
  // a TeX command in prose prints literally: it belongs inside $…$
  if (prose) for (const g of segments(withoutCode(s))) {
    if (g.t !== 'text') continue;
    const cmd = /\\([A-Za-z]{2,})/.exec(g.v);
    if (cmd) return `“\\${cmd[1]}” sits outside $…$, so it would print literally — put it inside math`;
    // computer notation (1.97e7) is not for readers: ×10ⁿ, via format.js's tex()
    const sci = /(?<![\w.])(\d+(?:\.\d+)?e[+-]?\d+)(?![\w])/.exec(g.v);
    if (sci) return `“${sci[1]}” is computer notation — write it as a power of ten (format it with tex() inside $…$)`;
    // a subscript in prose (I_cm, v_0) prints its underscore: it belongs in math (link targets excepted)
    // (a symbol: a base of one or two letters — v_0, mL_f, PV^γ, e^{3x}; longer snake_case
    // names like kinetic_energy are identifiers and print as written)
    const sub = /(?<![\w\\/.-])([A-Za-zα-ωΑ-Ω]{1,2}[_^](?:\{[^}]*\}|[A-Za-z0-9α-ωΑ-Ω]+))(?![\w/])/.exec(g.v.replace(/\]\([^)]*\)/g, ']'));
    if (sub) return `“${sub[1]}” is a subscript or power outside $…$ and would print literally — write $${sub[1]}$`;
    // …and after a bracket: (∂P/∂T)_V, (a + b)^2
    const after = /\)([_^](?:\{[^}]*\}|[A-Za-z0-9α-ωΑ-Ω]+))/.exec(g.v.replace(/\]\([^)]*\)/g, ']'));
    if (after) return `“)${after[1]}” is a subscript or power outside $…$ and would print literally — put the whole expression in math`;
    if (/\{,\}/.test(g.v)) return 'a “{,}” sits outside $…$ and would print literally — a TeX thousands separator belongs in math';
  }
  return null;
}

/** A TeX command name that lost its backslash, in bare TeX (words inside \text{…} are prose). */
export function bareCommand(tex) {
  const m = BARE_COMMAND.exec(String(tex).replace(/\\(?:text|mathrm|textrm|textbf|textit|operatorname|texttt|mbox)\s*\{[^{}]*\}/g, ''));
  return m ? m[1] : null;
}

// Rows of a tabular environment that hold more cells than the environment has
// columns: the sign that a \\ between two rows lost a backslash (to a JS escape,
// or a join(' \ ')) and two rows ran together. Nested environments are skipped.
function lostRowBreak(tex) {
  const re = /\\begin\{(array|[pbvBV]?matrix|cases)\}(\{[^{}]*\})?/g;
  for (let m; (m = re.exec(tex));) {
    const end = tex.indexOf(`\\end{${m[1]}}`, re.lastIndex);
    if (end < 0) continue;
    const body = tex.slice(re.lastIndex, end);
    if (/\\begin\{/.test(body)) continue;
    const rows = body.split(/\\\\(?:\[[^\]]*\])?/).map((r) => r.replace(/\\(?:hline|hdashline)/g, '').trim()).filter(Boolean);
    const cells = rows.map((r) => (r.match(/(?<!\\)&/g) || []).length + 1);
    if (m[1] === 'array' && m[2] && !m[2].includes('*')) {
      const cols = (m[2].slice(1, -1).replace(/[@!]\{[^{}]*\}/g, '').replace(/\{[^{}]*\}/g, '').match(/[lcrpmb]/g) || []).length;
      const over = cells.findIndex((c) => c > cols);
      if (cols && over >= 0) return `has a row of ${cells[over]} cells in a ${cols}-column array`;
    } else if (rows.length >= 2) {
      const most = [...cells].sort((a, b) => a - b)[Math.floor((cells.length - 1) / 2)];
      const over = cells.findIndex((c) => most > 1 && c >= 2 * most - 1);   // two rows run together: 2n − 1 cells
      if (over >= 0) return `has a row of ${cells[over]} cells where the others have ${most}`;
    }
  }
  return '';
}
