import { R } from '../../rules';
import type { ElKind, LinePlan, PlanEl } from './types';

export const DEFAULT_PLAN: LinePlan = {
  version: 1,
  name: '',
  cls: 'haupt',
  vmax: 120,
  sys: 'form',
  f: 1,
  tc: 'pzb',
  block: 2000,
  uf: R.curve.ufDefault.v,
  n: 9,
  electric: true,
  elements: [
    { id: 'e1', kind: 'bf', name: 'A', from: 1500, to: 2300, vein: 80, sw: null },
    { id: 'e2', kind: 'curve', from: 4500, to: 5000, r: 500, u: 100 },
    { id: 'e3', kind: 'bue', at: 6500, secured: true },
    { id: 'e4', kind: 'bf', name: 'B', from: 9000, to: 9800, vein: 60, sw: 2 },
  ],
};

let seq = 0;
/** Fresh element id that does not collide with existing ones. */
export function newId(plan: LinePlan): string {
  const used = new Set(plan.elements.map((e) => e.id));
  let id: string;
  do id = `e${Date.now().toString(36)}${(seq++).toString(36)}`; while (used.has(id));
  return id;
}

/** A new element of the given kind at position m. */
export function newElement(kind: ElKind, m: number, id: string): PlanEl {
  switch (kind) {
    case 'bf': return { id, kind, name: '', from: m, to: m + 800, vein: 80, sw: null };
    case 'hpt': return { id, kind, name: '', at: m };
    case 'abzw': return { id, kind, name: '', at: m, sw: 2 };
    case 'curve': return { id, kind, from: m, to: m + 400, r: 600, u: 100 };
    case 'bue': return { id, kind, at: m, secured: true };
    case 'el': return { id, kind, at: m, type: 'schutz', len: 30 };
    case 'lf': return { id, kind, from: m, to: m + 500, v: 60 };
  }
}

const num = (v: unknown, lo: number, hi: number, fb: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fb);
const str = (v: unknown, fb = '') => (typeof v === 'string' ? v.slice(0, 60) : fb);
const oneOf = <T extends string>(v: unknown, all: readonly T[], fb: T): T => (all.includes(v as T) ? (v as T) : fb);
const MAX = 1_000_000;

/** Turns untrusted JSON (storage or import) into a valid plan; returns null if it is not a plan at all. */
export function sanitizePlan(raw: unknown): LinePlan | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.version !== 1 || !Array.isArray(o.elements)) return null;
  const d = DEFAULT_PLAN, sw = R.switches.length - 1;
  const ids = new Set<string>();
  const elements: PlanEl[] = [];
  for (const r of o.elements.slice(0, 200)) {
    if (!r || typeof r !== 'object') continue;
    const e = r as Record<string, unknown>;
    let id = str(e.id) || `x${elements.length}`;
    while (ids.has(id)) id += '_';
    ids.add(id);
    const at = num(e.at, 0, MAX, 0), from = num(e.from, 0, MAX, 0), to = Math.max(from + 10, num(e.to, 0, MAX, from + 10));
    switch (e.kind) {
      case 'bf': elements.push({ id, kind: 'bf', name: str(e.name), from, to, vein: num(e.vein, 20, 160, 80), sw: e.sw === null || e.sw === undefined ? null : Math.round(num(e.sw, 0, sw, 0)) }); break;
      case 'hpt': elements.push({ id, kind: 'hpt', name: str(e.name), at }); break;
      case 'abzw': elements.push({ id, kind: 'abzw', name: str(e.name), at, sw: Math.round(num(e.sw, 0, sw, 0)) }); break;
      case 'curve': elements.push({ id, kind: 'curve', from, to, r: num(e.r, 100, 20000, 600), u: num(e.u, 0, 180, 100) }); break;
      case 'bue': elements.push({ id, kind: 'bue', at, secured: e.secured !== false }); break;
      case 'el': elements.push({ id, kind: 'el', at, type: oneOf(e.type, ['schutz', 'buegel'] as const, 'schutz'), len: num(e.len, 0, 2000, 30) }); break;
      case 'lf': elements.push({ id, kind: 'lf', from, to, v: Math.round(num(e.v, 10, 160, 60) / 10) * 10 }); break;
    }
  }
  return {
    version: 1,
    name: str(o.name),
    cls: oneOf(o.cls, ['haupt', 'neben', 'langsam'] as const, d.cls),
    vmax: Math.round(num(o.vmax, 20, 300, d.vmax) / 10) * 10,
    sys: oneOf(o.sys, ['form', 'licht', 'ks', 'hl'] as const, d.sys),
    f: num(o.f, 0.1, 1, d.f),
    tc: oneOf(o.tc, ['pzb', 'lzb', 'etcs'] as const, d.tc),
    block: num(o.block, 400, 10000, d.block),
    uf: num(o.uf, 0, 150, d.uf),
    n: num(o.n, 5, 30, d.n),
    electric: o.electric !== false,
    elements,
  };
}

const startOf = (e: PlanEl) => ('from' in e ? e.from : e.at);
const moveEl = (e: PlanEl, d: number): PlanEl => ('from' in e ? { ...e, from: e.from + d, to: e.to + d } : { ...e, at: e.at + d });

/**
 * Moves one element by d metres, or (following = true) the element and everything that starts at or after it.
 * The shift is limited so nothing ends up before km 0.
 */
export function shiftElements(plan: LinePlan, id: string, d: number, following: boolean): LinePlan {
  const el = plan.elements.find((e) => e.id === id);
  if (!el || !d) return plan;
  const s0 = startOf(el);
  const hit = (e: PlanEl) => e.id === id || (following && startOf(e) >= s0);
  const minStart = Math.min(...plan.elements.filter(hit).map(startOf));
  const dd = Math.max(d, -minStart);
  if (!dd) return plan;
  return { ...plan, elements: plan.elements.map((e) => (hit(e) ? moveEl(e, dd) : e)) };
}
