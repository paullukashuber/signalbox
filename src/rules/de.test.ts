import { describe, expect, it } from 'vitest';
import { DE, clearanceFor, distantOnMast, ne6Before, overlapFor } from '.';
import { INITIAL, bakenPos, bu1Pos, bu2Pos, el1vPos, lf6Pos, ne6Pos, pzb500Pos, vsPos, P } from '../features/line/model';

describe('German rule profile', () => {
  it('has the braking distances per line class', () => {
    expect(DE.brake).toEqual({ haupt: 1000, neben: 700, langsam: 400 });
  });
  it('places beacons and PZB magnets', () => {
    expect(DE.distant.beacons).toEqual([250, 175, 100]);
    expect(DE.pzb).toEqual({ hz1000BeforeDistant: 0, hz500BeforeMain: 250, hz2000BeforeMain: 0 });
  });
  it('picks the overlap by entry speed (guide value)', () => {
    expect(DE.overlap.guide).toBe(true);
    expect([100, 61, 60, 41, 40, 20].map((v) => overlapFor(v, DE))).toEqual([200, 200, 100, 100, 50, 50]);
  });
  it('derives board distances from the braking distance', () => {
    const b = DE.boards;
    expect(1000 * b.lf6Factor).toBe(1000);
    expect(700 * b.lf1Factor).toBe(700);
    expect(1000 * b.el1vFactor).toBe(500);
    expect(b.el45).toBe(30);
    expect(b.bue2BeforeMonitor).toBe(250);
    expect([ne6Before(1000, DE), ne6Before(700, DE), ne6Before(400, DE)]).toEqual([1000, 150, 150]);
  });
  it('carries the distant on the mast up to 1.3 braking distances', () => {
    expect(distantOnMast(1300, 1000, DE)).toBe(true);
    expect(distantOnMast(1301, 1000, DE)).toBe(false);
    expect(DE.distant.onMastFactor.guide).toBe(true);
  });
  it('puts the clearance marker 3.5 m × gradient behind the switch centre', () => {
    expect(clearanceFor(9, DE)).toBe(31.5);
    expect(clearanceFor(14, DE)).toBe(49);
  });
  it('keeps the EBO § 40 speed limits and switch types', () => {
    expect(DE.speed.limits.pzb).toBe(160);
    expect(DE.speed.limits.lzb).toBe(250);
    expect(DE.speed.limits.branch).toBe(100);
    expect(DE.speed.hlSteps).toEqual([40, 60, 100]);
    expect(DE.switches.map((w) => w.div)).toEqual([40, 50, 60, 80, 100, 130]);
  });
});

describe('line plan positions come from the profile', () => {
  it('main line', () => {
    const S = { ...INITIAL, line: 'haupt' as const };
    expect(vsPos(S)).toBe(P.ES - 1000);
    expect(bakenPos(S)).toEqual([50, 125, 200]);
    expect(pzb500Pos()).toBe(P.ES - 250);
    expect(lf6Pos(S)).toBe(P.LF7 - 1000);
    expect(bu2Pos(S)).toBe(P.BUE - 1250);
    expect(el1vPos(S)).toBe(P.EL1 - 500);
    expect(ne6Pos(S)).toBe(P.HPT - 1000);
  });
  it('branch line', () => {
    const S = { ...INITIAL, line: 'neben' as const };
    expect(vsPos(S)).toBe(600);
    expect(bu1Pos(S)).toBe(P.BUE - 700);
    expect(el1vPos(S)).toBe(P.EL1 - 350);
    expect(ne6Pos(S)).toBe(P.HPT - 150);
  });
});
