import { describe, expect, it } from 'vitest';
import { INITIAL, aspects, elements, speedAt, P } from './model';

describe('line model', () => {
  it('derives block aspects from an occupied block', () => {
    const A = aspects({ ...INITIAL, sys: 'ks', occ: 2 });
    expect(A.aus).toBe('Ks2'); // next block occupied → expect stop
    expect(A.bk[0].a).toBe('Hp0'); // Bk 1 protects block 2
    expect(A.bk[1].a).toBe('Ks1');
  });
  it('shows Hp 2 and Vr 2 for a diverging entry', () => {
    const A = aspects({ ...INITIAL, es: 'hp2' });
    expect(A.es).toBe('Hp2');
    expect(A.vs).toBe('Vr2');
  });
  it('stops the train before a home signal at stop', () => {
    const S = { ...INITIAL, es: 'hp0' as const };
    expect(speedAt(S, P.ES - 10)).toBe(0);
    expect(speedAt(S, 100)).toBeGreaterThan(0);
  });
  it('numbers visible elements in order', () => {
    const nums = elements(INITIAL).filter((e) => !e.hide).map((e) => e.n);
    expect(nums).toEqual(nums.map((_, i) => i + 1));
  });
});
