import { describe, expect, it } from 'vitest';
import { curveSpeed, hlStep, minRadius, overlap, owns } from './shared';

describe('speed formulas', () => {
  it('rounds curve speed down to 10 km/h (EBO § 40)', () => {
    // √(700 / 11.8 · 200) ≈ 108.9 km/h
    expect(curveSpeed(700, 100, 100)).toBe(100);
    expect(curveSpeed(150, 100, 100)).toBe(50);
  });
  it('gives the smallest radius for a speed', () => {
    expect(minRadius(120, 100, 100)).toBe(850);
    expect(minRadius(160, 100, 100)).toBe(1550);
    expect(curveSpeed(minRadius(120, 100, 100), 100, 100)).toBeGreaterThanOrEqual(120);
  });
  it('maps speeds to the Hl steps', () => {
    expect([40, 50, 60, 80, 100, 130].map(hlStep)).toEqual([40, 40, 60, 60, 100, 100]);
  });
});

describe('build helpers', () => {
  it('picks the overlap by entry speed', () => {
    expect(overlap(80)).toBe(200);
    expect(overlap(60)).toBe(100);
    expect(overlap(40)).toBe(50);
  });
  it('treats aliases as the same part', () => {
    expect(owns({ lf67: false }, 'lf7')).toBe(false);
    expect(owns({}, 'hs')).toBe(true);
    expect(owns({ hs: false }, 'weiche')).toBe(true);
  });
});
