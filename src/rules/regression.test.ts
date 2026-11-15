import { describe, expect, it } from 'vitest';
import { BUILD_DEFAULTS, type BuildState } from '../features/build/shared';
import { recipes } from '../features/build/recipes';
import { scenarios } from '../features/build/switches';
import { speedPlan } from '../features/build/speeds';
import { calcRows } from '../features/build/calc';
import { INITIAL, elements, events, speedAt, type LineState } from '../features/line/model';
import { planMarkup } from '../features/line/plan';
import { info } from '../features/line/info';

// Locks the output of all rule consumers so moving values into the profile cannot change behaviour.
const builds: Partial<BuildState>[] = [
  {},
  { bw: 700, vein: 50, sys: 'ks', blk: 900, n: 12 },
  { bw: 400, vein: 40, sys: 'hl', blk: 400, wt: 4, r: 300, lfv: 40 },
  { bw: 1000, vein: 100, sys: 'licht', blk: 2000, vmax: 160, wt: 5 },
];
const lines: Partial<LineState>[] = [{}, { line: 'neben' }, { sys: 'neben', line: 'neben' }, { sys: 'ks', es: 'hp2', occ: 2 }, { sys: 'hl', es: 'z1', bue: 'stoer', hpt: 'halt' }];

describe('rule consumers stay unchanged', () => {
  builds.forEach((p, i) => {
    const B = { ...BUILD_DEFAULTS, ...p };
    it(`build variant ${i}`, () => {
      expect(recipes(B)).toMatchSnapshot();
      expect(scenarios(B)).toMatchSnapshot();
      expect(speedPlan(B)).toMatchSnapshot();
      expect([calcRows(B, 'de'), calcRows(B, 'en')]).toMatchSnapshot();
    });
  });
  lines.forEach((p, i) => {
    const S = { ...INITIAL, ...p };
    it(`line variant ${i}`, () => {
      expect(elements(S)).toMatchSnapshot();
      expect(events(S, 'de')).toMatchSnapshot();
      expect(planMarkup({ ...S, dim: true }, 'en')).toMatchSnapshot();
      expect(['baken', 'bue2', 'abst', 'pzb500', 'el1v', 'ne6', 'lf6'].map((k) => info(S, k, 'de'))).toMatchSnapshot();
      expect(Array.from({ length: 97 }, (_, j) => Math.round(speedAt(S, j * 100) * 1000))).toMatchSnapshot();
    });
  });
});
