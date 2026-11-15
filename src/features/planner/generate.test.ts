import { describe, expect, it } from 'vitest';
import { generate } from './generate';
import { DEFAULT_PLAN, sanitizePlan } from './model';
import type { LinePlan, PlanEl } from './types';

const plan = (p: Partial<LinePlan> = {}, elements?: PlanEl[]): LinePlan => ({ ...DEFAULT_PLAN, ...p, elements: elements ?? DEFAULT_PLAN.elements });
const twoStations = (gap: number): PlanEl[] => [
  { id: 'a', kind: 'bf', name: 'A', from: 2000, to: 2800, vein: 80, sw: null },
  { id: 'b', kind: 'bf', name: 'B', from: 2800 + gap, to: 3600 + gap, vein: 80, sw: null },
];
const at = (r: ReturnType<typeof generate>, id: string) => {
  const it = r.items.find((i) => i.id === id);
  if (!it) throw new Error(`no item ${id}`);
  return it.m;
};
const codes = (r: ReturnType<typeof generate>) => r.warnings.map((w) => w.code);

describe('planner generator', () => {
  it('places home signal, distant, beacons and PZB from the profile', () => {
    const r = generate(plan({}, twoStations(6000)));
    const es = at(r, 'a:es');
    expect(es).toBe(2000 - 200); // overlap for 80 km/h
    expect(at(r, 'a:es:vs')).toBe(es - 1000);
    expect([at(r, 'a:es:ne3-3'), at(r, 'a:es:ne3-2'), at(r, 'a:es:ne3-1')]).toEqual([es - 1250, es - 1175, es - 1100]);
    expect(at(r, 'a:es:pzb500')).toBe(es - 250);
    expect(at(r, 'a:es:pzb1000')).toBe(es - 1000);
    expect(at(r, 'a:es:pzb2000')).toBe(es);
  });

  it('puts the exit signal before the clearance marker of the exit switch', () => {
    const r = generate(plan({}, twoStations(6000)));
    expect(at(r, 'a:ra12')).toBe(2800 - 31.5);
    expect(at(r, 'a:aus')).toBe(2800 - 31.5 - 20);
    expect(at(r, 'a:ne5')).toBe(at(r, 'a:aus') - 120);
  });

  it('divides the line between stations into blocks of at least one braking distance', () => {
    const r = generate(plan({ block: 2000 }, twoStations(6000)));
    const mains = ['a:aus', ...r.items.filter((i) => /:bk\d$/.test(i.id)).map((i) => i.id), 'b:es'].map((id) => at(r, id));
    expect(mains.length).toBeGreaterThan(2);
    const lens = mains.slice(1).map((m, i) => m - mains[i]);
    lens.forEach((L) => expect(L).toBeGreaterThanOrEqual(1000));
    expect(Math.max(...lens) - Math.min(...lens)).toBeLessThanOrEqual(1);
    expect(codes(r)).not.toContain('block-short');
  });

  it('carries the next distant on the mast when the block is short enough (H/V)', () => {
    const r = generate(plan({ block: 1200 }, twoStations(4000)));
    const bk1 = r.items.find((i) => i.id === 'a:aus:bk1')!;
    expect(at(r, 'a:aus:bk2:vs')).toBe(bk1.m);
    expect(r.items.find((i) => i.id === 'a:aus:bk2:vs')!.name.de).toContain('am Mast');
  });

  it('uses multi-section signals without separate distants between blocks (Ks)', () => {
    const r = generate(plan({ sys: 'ks', block: 1200 }, twoStations(4000)));
    expect(r.items.find((i) => i.id === 'a:aus:bk1')!.part).toBe('ms');
    expect(r.items.some((i) => i.id === 'a:aus:bk2:vs')).toBe(false);
    expect(r.items.find((i) => i.id === 'a:es:vs')!.name.de).toContain('Ks-Vorsignal');
  });

  it('warns about short blocks and distants before the previous main signal', () => {
    const r = generate(plan({}, twoStations(700)));
    expect(codes(r)).toContain('block-short');
    expect(codes(r)).toContain('distant-before-main');
  });

  it('announces slower curves with Lf 6 / Lf 7', () => {
    const r = generate(plan({}, [{ id: 'c', kind: 'curve', from: 3000, to: 3500, r: 400, u: 100 }]));
    expect(at(r, 'c:lf6')).toBe(2000);
    expect(at(r, 'c:lf7')).toBe(3000);
    expect(at(r, 'c:lf7e')).toBe(3500);
    expect(r.items.find((i) => i.id === 'c:lf7')!.aspect!.de).toContain('80 km/h'); // √(400/11.8·200) ≈ 82
    expect(codes(r)).not.toContain('curve-no-lf');
    expect(codes(generate(plan({}, [{ id: 'c', kind: 'curve', from: 3000, to: 3500, r: 400, u: 100 }]), { lf67: false }))).toContain('curve-no-lf');
  });

  it('skips curves that allow the line speed', () => {
    const r = generate(plan({}, [{ id: 'c', kind: 'curve', from: 3000, to: 3500, r: 3000, u: 100 }]));
    expect(r.items).toHaveLength(0);
  });

  it('places level crossing boards by protection', () => {
    const r1 = generate(plan({}, [{ id: 'x', kind: 'bue', at: 5000, secured: true }]));
    expect(at(r1, 'x:bue1')).toBe(4000);
    expect(at(r1, 'x:bue2')).toBe(3750);
    const r2 = generate(plan({}, [{ id: 'x', kind: 'bue', at: 5000, secured: false }]));
    expect(at(r2, 'x:bue4')).toBe(4600);
    expect(at(r2, 'x:bue5')).toBe(4800);
    expect(r2.items.find((i) => i.id === 'x:bue4')!.guide).toBe(true);
  });

  it('places section breaks, halts and temporary restrictions', () => {
    const r = generate(plan({ cls: 'neben', vmax: 80 }, [
      { id: 't', kind: 'el', at: 3000, type: 'schutz', len: 0 },
      { id: 'h', kind: 'hpt', name: 'H', at: 6000 },
      { id: 'l', kind: 'lf', from: 8000, to: 8300, v: 40 },
    ]));
    expect(at(r, 't:el1v')).toBe(3000 - 350);
    expect(at(r, 't:el2')).toBe(3150);
    expect(at(r, 'h:ne6')).toBe(6000 - 150);
    expect(at(r, 'l:lf1')).toBe(8000 - 700);
    expect(at(r, 'l:lf3')).toBe(8300);
  });

  it('uses Ne 2 instead of a distant signal up to 60 km/h', () => {
    const r = generate(plan({ vmax: 60, cls: 'neben' }, twoStations(6000)));
    expect(r.items.find((i) => i.id === 'a:es:vs')!.part).toBe('ne2');
  });

  it('shows Zs 3 for a diverging entry', () => {
    const els = twoStations(6000);
    (els[1] as Extract<PlanEl, { kind: 'bf' }>).sw = 2; // 60 km/h switch
    const r = generate(plan({}, els));
    expect(r.items.find((i) => i.id === 'b:es:zs3')!.name.de).toBe('Zs 3 „6“');
    expect(r.items.find((i) => i.id === 'b:es')!.aspect!.de).toContain('Hp 2');
  });

  it('checks speed limits', () => {
    expect(codes(generate(plan({ vmax: 200 }, [])))).toContain('speed-cab');
    expect(codes(generate(plan({ vmax: 200, tc: 'lzb' }, [])))).not.toContain('speed-cab');
    expect(codes(generate(plan({ vmax: 120, cls: 'neben' }, [])))).toContain('branch-speed');
  });

  it('marks missing parts and suggests replacements', () => {
    const r = generate(plan({}, twoStations(6000)), { vs: false });
    const vs = r.items.find((i) => i.id === 'a:es:vs')!;
    expect(vs.missing).toBe(true);
    expect(vs.alt?.part).toBe('ne2');
    expect(vs.alt?.owned).toBe(true);
  });

  it('warns about items before km 0 and junctions inside stations', () => {
    const r = generate(plan({}, [
      { id: 'a', kind: 'bf', name: 'A', from: 500, to: 1300, vein: 80, sw: null },
      { id: 'j', kind: 'abzw', name: 'J', at: 900, sw: 2 },
    ]));
    expect(codes(r)).toContain('before-start');
    expect(codes(r)).toContain('junction-in-station');
  });

  it('gives every item a unique id, sorted positions and game positions', () => {
    const r = generate(plan({ f: 0.5 }));
    const ids = r.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    r.items.forEach((it, i) => {
      expect(it.game).toBe(it.m * 0.5);
      if (i) expect(it.m).toBeGreaterThanOrEqual(r.items[i - 1].m);
    });
  });
});

describe('plan sanitizing', () => {
  it('keeps a valid plan', () => {
    expect(sanitizePlan(JSON.parse(JSON.stringify(DEFAULT_PLAN)))).toEqual(DEFAULT_PLAN);
  });
  it('rejects non-plans and clamps bad values', () => {
    expect(sanitizePlan(null)).toBeNull();
    expect(sanitizePlan({ version: 2, elements: [] })).toBeNull();
    const p = sanitizePlan({ version: 1, vmax: 9999, sys: 'x', elements: [{ kind: 'bue', at: -5 }, { kind: 'nope' }, { id: 'a', kind: 'hpt', at: 1 }, { id: 'a', kind: 'hpt', at: 2 }] })!;
    expect(p.vmax).toBe(300);
    expect(p.sys).toBe('form');
    expect(p.elements).toHaveLength(3);
    expect(p.elements[0]).toMatchObject({ kind: 'bue', at: 0 });
    expect(new Set(p.elements.map((e) => e.id)).size).toBe(3);
  });
});
