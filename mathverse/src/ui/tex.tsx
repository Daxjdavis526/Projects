// KaTeX rendering: <Tex> for one formula, <Markup> for prose with $…$ and $$…$$.
import katex from 'katex';
import { useMemo } from 'react';

export function texToHtml(tex: string, display = false): string {
  try { return katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'html' }); }
  catch { return tex.replace(/</g, '&lt;'); }
}

export function Tex({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => texToHtml(tex, display), [tex, display]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Prose with **bold**, *italic*, $inline$ and $$display$$ maths, and blank-line paragraphs. */
export function markupToHtml(text: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // line breaks and paragraphs are made from the prose only — never inside KaTeX's output,
  // whose SVG paths (\sqrt, \underbrace) would be corrupted by a <br>
  const parts: string[] = [];
  const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
  let last = 0, m: RegExpExecArray | null;
  const prose = (t: string) => fmt(esc(t)).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');
  while ((m = re.exec(text))) {
    parts.push(prose(text.slice(last, m.index)));
    parts.push(m[1] !== undefined ? texToHtml(m[1], true) : texToHtml(m[2], false));
    last = re.lastIndex;
  }
  parts.push(prose(text.slice(last)));
  return `<p>${parts.join('')}</p>`;
  function fmt(s: string) { return s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>'); }
}

export function Markup({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => markupToHtml(text), [text]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
