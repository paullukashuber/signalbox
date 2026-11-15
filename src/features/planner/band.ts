import * as D from '../../signals/draw';
import { pick, type Lang } from '../../i18n';
import { icon, type BuildSys } from '../build/shared';
import type { LinePlan, PlacedItem } from './types';

/** Drawing for a placed item; uses the replacement part when the original is missing but the substitute is owned. */
export function itemIcon(it: PlacedItem, sys: BuildSys): string {
  const part = it.missing && it.alt?.owned ? it.alt.part : it.part;
  if (it.num !== undefined && part === it.part) {
    if (part === 'lf67') return D.lf6(it.num);
    if (part === 'lf7') return D.lf7(it.num);
    if (part === 'lf13') return D.lf1(it.num);
    if (part === 'zs3') return D.zs2(String(it.num));
  }
  return icon(part, sys);
}

/** Parts left out of the band to keep it readable (still in the list). */
const HIDDEN = new Set(['pzb', 'flt']);

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Linear strip map of the line with numbered markers (numbers = position in the build list). */
export function bandMarkup(plan: LinePlan, items: PlacedItem[], done: Record<string, boolean>, lang: Lang) {
  const starts = plan.elements.flatMap((e) => ('from' in e ? [e.from, e.to] : [e.at]));
  const ms = [...items.map((i) => i.m), ...starts, 0];
  const a = Math.min(...ms) - 150, b = Math.max(...ms) + 150;
  const W = Math.round(Math.min(12000, Math.max(1000, (b - a) * 0.2))), pad = 20;
  const x = (m: number) => pad + ((m - a) / (b - a)) * (W - 2 * pad);

  // stack icons above and numbers below the track so they do not overlap
  const iconRows: { x: number; r: number }[] = [], numRows: { x: number; r: number }[] = [];
  const place = (rows: { x: number; r: number }[], X: number, w: number) => {
    let r = 0;
    while (rows.some((u) => u.r === r && Math.abs(u.x - X) < w)) r++;
    rows.push({ x: X, r });
    return r;
  };
  const shown = items.map((it, i) => ({ it, n: i + 1 })).filter(({ it }) => !HIDDEN.has(it.part));
  const laid = shown.map((s) => ({ ...s, X: x(s.it.m), ir: place(iconRows, x(s.it.m), 30), nr: place(numRows, x(s.it.m), 22) }));
  const maxI = Math.max(0, ...laid.map((l) => l.ir)), maxN = Math.max(0, ...laid.map((l) => l.nr));
  const RH = 74, ty = 34 + (maxI + 1) * RH, ny = ty + 26, zy = ny + (maxN + 1) * 22 + 14, H = zy + 22;
  const L = (de: string, en: string) => (lang === 'de' ? de : en);

  let s = '';
  // km grid
  const step = b - a > 8000 ? 1000 : 500;
  for (let m = Math.ceil(a / step) * step; m <= b; m += step) {
    s += `<line x1="${x(m)}" y1="14" x2="${x(m)}" y2="${zy - 6}" stroke="var(--line)" stroke-width="1"/>`;
    s += `<text x="${x(m) + 3}" y="12" font-size="11" style="fill:var(--mute)">km ${pick({ de: (m / 1000).toFixed(1).replace('.', ','), en: (m / 1000).toFixed(1) }, lang)}</text>`;
  }
  // zones
  plan.elements.forEach((e) => {
    if (e.kind === 'bf') {
      s += `<rect x="${x(e.from)}" y="${ty - 12}" width="${Math.max(2, x(e.to) - x(e.from))}" height="24" rx="3" fill="var(--plat)"/>`;
      s += `<text x="${x(e.from)}" y="${zy + 12}" font-size="12" font-weight="600" style="fill:var(--ink)">${esc(L('Bf ', 'Stn ') + (e.name || '?'))}</text>`;
    } else if (e.kind === 'curve' || e.kind === 'lf') {
      const col = e.kind === 'curve' ? 'var(--sel)' : 'var(--acc)';
      s += `<rect x="${x(e.from)}" y="${ty + 5}" width="${Math.max(2, x(e.to) - x(e.from))}" height="5" fill="${col}" opacity=".7"/>`;
      s += `<text x="${x(e.from)}" y="${zy + 12}" font-size="11" style="fill:var(--mute)">${e.kind === 'curve' ? `R ${e.r}` : `Lf ${e.v}`}</text>`;
    } else if (e.kind === 'hpt') {
      s += `<rect x="${x(e.at) - 18}" y="${ty - 10}" width="18" height="20" rx="2" fill="var(--plat)"/>`;
      s += `<text x="${x(e.at)}" y="${zy + 12}" font-size="11" text-anchor="end" style="fill:var(--mute)">${esc(L('Hp ', 'Halt ') + (e.name || ''))}</text>`;
    }
  });
  s += `<line x1="${pad}" y1="${ty}" x2="${W - pad}" y2="${ty}" stroke="var(--track)" stroke-width="3"/>`;
  // markers
  laid.forEach(({ it, n, X, ir, nr }) => {
    const top = ty - 8 - 64 - ir * RH, built = !!done[it.id];
    if (ir) s += `<line x1="${X}" y1="${top + 64}" x2="${X}" y2="${ty}" stroke="var(--mute)" stroke-width=".6"/>`;
    s += `<g transform="translate(${X} ${top}) scale(.45)" opacity="${it.missing && !it.alt?.owned ? 0.3 : 1}">${itemIcon(it, plan.sys)}</g>`;
    s += `<line x1="${X}" y1="${ty}" x2="${X}" y2="${ny + nr * 22 - 8}" stroke="var(--mute)" stroke-width=".6"/>`;
    s += `<circle cx="${X}" cy="${ny + nr * 22}" r="9" fill="${built ? 'var(--soft)' : 'var(--ink)'}"/>`;
    s += `<text x="${X}" y="${ny + nr * 22 + 3.5}" text-anchor="middle" font-size="10" font-weight="600" style="fill:${built ? 'var(--mute)' : 'var(--panel)'}">${n}</text>`;
  });
  s += `<text x="${W - pad}" y="${zy + 12}" text-anchor="end" font-size="11" style="fill:var(--mute)">${L('Fahrtrichtung →', 'Direction of travel →')}</text>`;
  return { svg: s, width: W, height: H };
}
