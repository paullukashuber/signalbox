import { useEffect, useState, type ReactNode } from 'react';
import { tx, useLang } from '../../i18n';
import { Fig } from '../../components/Svg';
import { decimal, fmt, icon, mini, owns, type BuildState, type Owned } from '../../features/build/shared';
import type { Tx } from '../../i18n';
import { R } from '../../rules';

/** Braking distance choices from the rule profile. */
export const brakeOptions = (t: (v: Tx) => string): [number, string][] => [
  [R.brake.haupt, t(tx(`${R.brake.haupt} m – Hauptbahn`, `${R.brake.haupt} m – main line`))],
  [R.brake.neben, t(tx(`${R.brake.neben} m – Nebenbahn`, `${R.brake.neben} m – branch line`))],
  [R.brake.langsam, t(tx(`${R.brake.langsam} m – langsame Strecke`, `${R.brake.langsam} m – slow line`))],
];

/** Number input that commits on blur/Enter and clamps to its range. */
export function NumberField({ label, value, min, max, step, onChange }: { label: ReactNode; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(String(value));
  useEffect(() => setRaw(String(value)), [value]);
  const commit = () => {
    const v = Number(raw.replace(',', '.'));
    if (raw.trim() === '' || Number.isNaN(v)) return setRaw(String(value));
    const clamped = Math.max(min, Math.min(max, Math.round(v / step) * step));
    setRaw(String(clamped));
    if (clamped !== value) onChange(clamped);
  };
  return (
    <label>
      {label}
      <input type="number" inputMode="numeric" min={min} max={max} step={step} value={raw}
        onChange={(e) => setRaw(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} />
    </label>
  );
}

export function SelectField<V extends string | number>({ label, value, options, onChange }: { label: ReactNode; value: V; options: [V, string][]; onChange: (v: V) => void }) {
  return (
    <label>
      {label}
      <select value={String(value)} onChange={(e) => {
        const o = options.find(([v]) => String(v) === e.target.value);
        if (o) onChange(o[0]);
      }}>
        {options.map(([v, l]) => <option key={String(v)} value={String(v)}>{l}</option>)}
      </select>
    </label>
  );
}

/** Shared inputs for the distance calculator and recipes. */
export function BuildInputs({ B, set, withBlock }: { B: BuildState; set: (p: Partial<BuildState>) => void; withBlock?: boolean }) {
  const { t, lang } = useLang();
  return (
    <div className="calc">
      <SelectField label={t(tx('Bremsweg der Strecke', 'Line braking distance'))} value={B.bw}
        onChange={(bw) => set({ bw, blk: Math.max(B.blk, bw) })}
        options={brakeOptions(t)} />
      <NumberField label={t(tx('Streckengeschwindigkeit (km/h)', 'Line speed (km/h)'))} value={B.vmax} min={20} max={300} step={10} onChange={(vmax) => set({ vmax })} />
      <NumberField label={t(tx('Einfahrgeschwindigkeit in den Bahnhof (km/h)', 'Entry speed into the station (km/h)'))} value={B.vein} min={20} max={160} step={10} onChange={(vein) => set({ vein })} />
      <SelectField label={t(tx('Weichenneigung (für das Grenzzeichen)', 'Switch angle (for the clearance marker)'))} value={B.n} onChange={(n) => set({ n })}
        options={[7, 9, 12, 14, 18.5].map((n) => [n, `1 : ${decimal(n, lang)}`] as [number, string])} />
      {withBlock && <NumberField label={t(tx('Blocklänge (m)', 'Block length (m)'))} value={B.blk} min={400} max={3000} step={50} onChange={(blk) => set({ blk })} />}
      <SelectField label={t(tx('Signalsystem', 'Signalling system'))} value={B.sys} onChange={(sys) => set({ sys })}
        options={[['form', t(tx('Form H/V', 'Semaphore H/V'))], ['licht', t(tx('Licht H/V', 'Light H/V'))], ['ks', 'Ks'], ['hl', 'Hl']]} />
      <ScaleField value={B.f} onChange={(f) => set({ f })} />
    </div>
  );
}

/** Game scale slider; commits when the pointer or key is released. */
export function ScaleField({ value, onChange }: { value: number; onChange: (f: number) => void }) {
  const { t, lang } = useLang();
  const [f, setF] = useState(value);
  useEffect(() => setF(value), [value]);
  const scale = (v: number) => decimal(Math.round(10 / v) / 10, lang);
  return (
    <label>
      <span>{t(tx('Maßstab im Spiel', 'In-game scale'))}: <b style={{ color: 'var(--ink)' }}>1 : {scale(f)}</b></span>
      <input type="range" min={0.1} max={1} step={0.05} value={f}
        onChange={(e) => setF(+e.target.value)}
        onPointerUp={() => onChange(f)} onKeyUp={() => onChange(f)} onBlur={() => f !== value && onChange(f)} />
    </label>
  );
}

export type StepRow = { m: number; part: string; name: Tx; note: Tx; alt?: [string, Tx]; svg?: string };

/** Numbered placement list with real and in-game positions. */
export function StepList({ rows, B, owned }: { rows: StepRow[]; B: BuildState; owned: Owned }) {
  const { t, lang } = useLang();
  return (
    <ol className="steps">
      {rows.map((r, i) => {
        const ok = owns(owned, r.part);
        const useAlt = !ok && r.alt && owns(owned, r.alt[0]);
        const svg = r.svg ?? icon(useAlt ? r.alt![0] : r.part, B.sys);
        return (
          <li key={i} className={ok ? undefined : 'miss'}>
            <div className="pos">{fmt(r.m, lang)}<small>{t(tx('Spiel', 'Game'))} {fmt(r.m * B.f, lang)}</small></div>
            <div className="ic"><Fig markup={mini(svg)} /></div>
            <div className="t">
              <b>{i + 1}. {t(r.name)}</b>
              {t(r.note) && <span>{t(r.note)}</span>}
              {!ok && (useAlt
                ? <span className="alt">{t(tx('Ersatz', 'Substitute'))}: {t(r.alt![1])}</span>
                : <span className="alt">{t(tx('Bauteil nicht vorhanden – weglassen', 'Part not available – leave out'))}</span>)}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Track diagram with numbered markers for a step list. */
export function Schema({ rows, owned }: { rows: StepRow[]; owned: Owned }) {
  const { t } = useLang();
  const ps = rows.map((r) => r.m);
  let a = Math.min(...ps), b = Math.max(...ps);
  if (a === b) { a -= 100; b += 100; }
  const W = 1000, pad = 40, x = (m: number) => pad + ((m - a) / (b - a)) * (W - 2 * pad);
  const used: { x: number; r: number }[] = [];
  const marks = rows.map((r, i) => {
    const X0 = x(r.m);
    let row = 0;
    while (used.some((u) => u.r === row && Math.abs(u.x - X0) < 70)) row++;
    used.push({ x: X0, r: row });
    return (
      <g key={i}>
        <line x1={X0} y1={40} x2={X0} y2={52 + row * 22} stroke="var(--mute)" strokeWidth={0.7} />
        <circle cx={X0} cy={40} r={4} fill={owns(owned, r.part) ? 'var(--acc)' : 'var(--mute)'} />
        <text x={X0} y={64 + row * 22} textAnchor="middle" fontSize={11}>{i + 1}</text>
      </g>
    );
  });
  const h = 70 + Math.max(...used.map((u) => u.r)) * 22 + 10;
  return (
    <svg viewBox={`0 0 ${W} ${h}`} width="100%" style={{ display: 'block', marginBottom: 12 }} aria-hidden="true">
      <line x1={10} y1={40} x2={W - 10} y2={40} stroke="var(--track)" strokeWidth={3} />
      {marks}
      <text x={10} y={20} fontSize={12} style={{ fill: 'var(--mute)' }}>{t(tx('Fahrtrichtung', 'Direction of travel'))} →</text>
    </svg>
  );
}

/** Rule cards shown as a grid. */
export function RuleGrid({ rules }: { rules: [Tx, Tx][] }) {
  const { t } = useLang();
  return (
    <div className="sys rules">
      {rules.map(([a, b], i) => (
        <div className="rule" key={i}>
          <b>{t(a)}</b>
          <p className="note">{t(b)}</p>
        </div>
      ))}
    </div>
  );
}
