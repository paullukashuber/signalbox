import { describe, expect, it } from 'vitest';
import { cleanDone, fileName, planFromJson, planToJson } from './io';
import { DEFAULT_PLAN } from './model';

describe('plan export and import', () => {
  it('round-trips plan and ticks', () => {
    const done = { 'e1:es': true, 'e4:aus': true };
    expect(planFromJson(planToJson(DEFAULT_PLAN, done))).toEqual({ plan: DEFAULT_PLAN, done });
  });
  it('rejects broken files', () => {
    expect(planFromJson('not json')).toBeNull();
    expect(planFromJson('{"version":1}')).toBeNull();
    expect(planFromJson('[]')).toBeNull();
  });
  it('keeps only true ticks', () => {
    expect(cleanDone({ a: true, b: false, c: 'yes', d: 1 })).toEqual({ a: true });
    expect(cleanDone([true])).toEqual({});
    expect(cleanDone(null)).toEqual({});
  });
  it('builds a safe file name', () => {
    expect(fileName({ ...DEFAULT_PLAN, name: 'Strecke Süd / Großdorf' })).toBe('streckenplan-strecke-sud-grossdorf.json');
    expect(fileName({ ...DEFAULT_PLAN, name: '' })).toBe('streckenplan.json');
  });
});
