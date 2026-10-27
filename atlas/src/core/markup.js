// The small markup lessons are written in: paragraphs, **bold**, *italic*,
// `code`, [links](url), "- " lists, "> " callouts, $inline$ and $$display$$
// TeX. Rendering is a pure string → HTML function with the math renderer
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

/** Every TeX fragment in a string (for validation). */
export const mathIn = (text) => segments(text).filter((g) => g.t !== 'text').map((g) => ({ tex: g.v, display: g.t === 'display' }));

function inline(text, math) {
  return segments(text).map((g) => {
    if (g.t === 'math') return math(g.v, false);
    if (g.t === 'display') return math(g.v, true);
    return esc(g.v)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|#[^)\s]*)\)/g, (m, label, url) =>
        `<a href="${url}"${url.startsWith('#') ? '' : ' target="_blank" rel="noopener"'}>${label}</a>`);
  }).join('');
}

/**
 * Render markup to HTML.
 * @param {string} text
 * @param {(tex:string, display:boolean)=>string} math
 */
export function render(text, math = (t) => `<code>${esc(t)}</code>`) {
  if (!text) return '';
  const blocks = String(text).replace(/\r/g, '').split(/\n\s*\n/);
  return blocks.map((block) => {
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

/** Characters that betray a TeX command eaten by a JS string escape (\theta → TAB + "heta"). */
export function escapeDamage(text) {
  const s = String(text);
  if (/[\t\f\v\b\r]/.test(s)) return 'contains a control character — a TeX command like \\theta, \\frac, \\vec or \\rho lost its backslash to a JS escape; use String.raw';
  if (/\n(abla|u\b|eq\b|eq\s|ot\b|ewline|i\b|orm)/.test(s) && /\$/.test(s)) return 'a newline sits where \\nabla, \\nu, \\neq or \\not was probably meant; use String.raw';
  return null;
}
