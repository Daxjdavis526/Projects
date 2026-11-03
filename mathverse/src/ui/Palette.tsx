// The command palette (Ctrl+K): every command and every demonstration, searchable.
import { useEffect, useMemo, useRef, useState } from 'react';

export interface Command { id: string; title: string; hint?: string; group: string; keys?: string; run: () => void }

export function score(q: string, text: string): number {
  if (!q) return 1;
  const t = text.toLowerCase(), s = q.toLowerCase().trim();
  if (t.includes(s)) return 100 - t.indexOf(s);
  // every query word somewhere in the text
  const words = s.split(/\s+/);
  if (words.every((w) => t.includes(w))) return 50;
  // subsequence match
  let i = 0;
  for (const ch of t) if (ch === s[i]) i++;
  return i === s.length ? 10 : 0;
}

export function Palette({ commands, onClose }: { commands: Command[]; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inp = useRef<HTMLInputElement>(null);
  const list = useMemo(() => commands.map((c) => ({ c, s: score(q, `${c.title} ${c.hint ?? ''} ${c.group}`) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 60).map((x) => x.c), [q, commands]);
  useEffect(() => { inp.current?.focus(); }, []);
  useEffect(() => { setSel(0); }, [q]);
  const run = (c: Command) => { onClose(); setTimeout(c.run, 0); };
  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div className="palette" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search commands and demonstrations…"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { setSel((s) => Math.min(list.length - 1, s + 1)); e.preventDefault(); }
            else if (e.key === 'ArrowUp') { setSel((s) => Math.max(0, s - 1)); e.preventDefault(); }
            else if (e.key === 'Enter' && list[sel]) run(list[sel]);
            else if (e.key === 'Escape') onClose();
          }} />
        <ul>
          {list.map((c, i) => (
            <li key={c.id} className={i === sel ? 'sel' : ''} onMouseEnter={() => setSel(i)} onClick={() => run(c)}>
              <span className="pal-group">{c.group}</span>
              <span className="pal-title">{c.title}</span>
              {c.hint && <span className="pal-hint">{c.hint}</span>}
              {c.keys && <kbd>{c.keys}</kbd>}
            </li>
          ))}
          {!list.length && <li className="empty">Nothing matches “{q}”.</li>}
        </ul>
      </div>
    </div>
  );
}
