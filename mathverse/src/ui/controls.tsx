// Controls: parameter sliders (editable value and range, animate), choices,
// switches, readouts.

import { useState } from 'react';
import type { ParamSpec } from '../core/input/classify';
import type { ChoiceSpec, Readout, ToggleSpec } from '../modules/types';
import { Tex } from './tex';
import { Icon } from './icons';
import { symbolTeX, GREEK } from '../core/expr';
import { blip } from './sound';

const fmt = (v: number) => (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(3) : String(+v.toFixed(4)));

/** A label that is a single symbol renders as maths; anything else as text (with $…$ allowed). */
export function Label({ text }: { text: string }) {
  // a single symbol (x, v_0, alpha, omega_n) is typeset as maths; a word stays a word
  if (/^([A-Za-z](_[A-Za-z0-9]+)?|[A-Za-z]+_[A-Za-z0-9]+)$/.test(text) || text in GREEK) return <Tex tex={symbolTeX(text)} />;
  const parts = text.split(/(\$[^$]+\$)/g);
  return <>{parts.map((p, i) => (p.startsWith('$') ? <Tex key={i} tex={p.slice(1, -1)} /> : <span key={i}>{p}</span>))}</>;
}

export function ParamSlider({ spec, value, range, animating, onChange, onRange, onAnimate, sound, link, onLink }: {
  spec: ParamSpec; value: number; range?: [number, number]; animating: boolean; sound: boolean;
  onChange: (v: number) => void; onRange: (r: [number, number]) => void; onAnimate: () => void;
  /** this parameter follows an expression in the others (e.g. 2*A) */
  link?: string; onLink?: (expr: string | null) => void;
}) {
  const [lo, hi] = range ?? [spec.min, spec.max];
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [linking, setLinking] = useState<string | null>(null);
  const step = spec.step || (hi - lo) / 400;
  return (
    <div className={`param ${animating ? 'animating' : ''}`}>
      <div className="param-head">
        <span className="param-label"><Label text={spec.label} /></span>
        {editing ? (
          <input className="param-value-edit" autoFocus value={text} onChange={(e) => setText(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const v = Number(text);
                if (Number.isFinite(v)) { onChange(v); if (v < lo) onRange([v, hi]); if (v > hi) onRange([lo, v]); }
                setEditing(false);
              } else if (e.key === 'Escape') setEditing(false);
            }} />
        ) : (
          <button className="param-value" title="Type an exact value" onClick={() => { setText(String(value)); setEditing(true); }}>{fmt(value)}</button>
        )}
        {onLink && <button className={`mini ${link ? 'on' : ''}`} title={link ? `Linked: = ${link} (click to unlink)` : 'Link: make this parameter follow the others, e.g. 2*A'} onClick={() => (link ? onLink(null) : setLinking(''))}><Icon name="link" size={13} /></button>}
        <button className={`mini ${animating ? 'on' : ''}`} title={animating ? 'Stop animating' : 'Animate: sweep through the range'} onClick={onAnimate}><Icon name={animating ? 'pause' : 'play'} size={13} /></button>
      </div>
      {linking !== null && (
        <form className="link-edit" onSubmit={(e) => { e.preventDefault(); if (linking.trim()) onLink?.(linking.trim()); setLinking(null); }}>
          <span>{spec.key} =</span><input autoFocus value={linking} onChange={(e) => setLinking(e.target.value)} onBlur={() => setLinking(null)} placeholder="e.g. 2*A + 1" spellCheck={false} />
        </form>
      )}
      {link && <div className="link-note">= {link}</div>}
      <div className="param-row">
        <RangeEdit value={lo} onCommit={(v) => v < hi && onRange([v, hi])} />
        <input type="range" min={lo} max={hi} step={step} value={Math.min(hi, Math.max(lo, value))} disabled={!!link}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerUp={() => sound && blip(0.4 + 0.5 * (value - lo) / (hi - lo || 1))}
          aria-label={spec.label} />
        <RangeEdit value={hi} onCommit={(v) => v > lo && onRange([lo, v])} />
      </div>
    </div>
  );
}

function RangeEdit({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [t, setT] = useState<string | null>(null);
  return t === null
    ? <button className="range-end" title="Edit the slider's limit" onClick={() => setT(String(value))}>{fmt(value)}</button>
    : <input className="range-end-edit" autoFocus value={t} onChange={(e) => setT(e.target.value)} onBlur={() => setT(null)}
        onKeyDown={(e) => { if (e.key === 'Enter') { const v = Number(t); if (Number.isFinite(v)) onCommit(v); setT(null); } else if (e.key === 'Escape') setT(null); }} />;
}

export function ChoiceControl({ spec, value, onChange }: { spec: ChoiceSpec; value: string; onChange: (v: string) => void }) {
  return (
    <div className="choice">
      <div className="choice-label"><Label text={spec.label} /></div>
      {spec.options.length <= 4
        ? <div className="seg">{spec.options.map(([v, l]) => <button key={v} className={v === value ? 'on' : ''} onClick={() => onChange(v)}><Label text={l} /></button>)}</div>
        : <select value={value} onChange={(e) => onChange(e.target.value)}>{spec.options.map(([v, l]) => <option key={v} value={v}>{l.replace(/\$/g, '')}</option>)}</select>}
    </div>
  );
}

export function ToggleControl({ spec, value, onChange }: { spec: ToggleSpec; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <span><Label text={spec.label} /></span>
      <button role="switch" aria-checked={value} className={`switch ${value ? 'on' : ''}`} onClick={() => onChange(!value)}><span /></button>
    </label>
  );
}

export function Readouts({ rows }: { rows: Readout[] }) {
  if (!rows.length) return null;
  return (
    <dl className="readouts">
      {rows.map((r, i) => (
        <div key={i} className={`readout ${r.tone ?? ''}`}>
          <dt><Label text={r.label} /></dt>
          <dd>{r.tex ? <Tex tex={r.value} /> : r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
