import { tx } from '../i18n';
import type { Guide, RuleProfile } from './types';

const guide = <T,>(v: T, note = tx('Üblicher Planwert, nicht aus der Richtlinie geprüft.', 'Common planning value, not checked against the rulebook.')): Guide<T> => ({ v, guide: true, note });

/** Germany: EBO, ESO and Ril 301 as summarised on this site. */
export const DE: RuleProfile = {
  id: 'de',
  name: tx('Deutschland', 'Germany'),
  brake: { haupt: 1000, neben: 700, langsam: 400 },
  distant: {
    beacons: [250, 175, 100],
    shortenTol: 0.05,
    onMastFactor: guide(1.3),
    requiredAbove: 60,
  },
  pzb: { hz1000BeforeDistant: 0, hz500BeforeMain: 250, hz2000BeforeMain: 0 },
  overlap: guide([{ above: 60, m: 200 }, { above: 40, m: 100 }, { above: -Infinity, m: 50 }]),
  block: { minFactor: 1, typicalMulti: guide([1000, 1300] as const) },
  boards: {
    lf6Factor: 1,
    lf1Factor: 1,
    el1vFactor: 0.5,
    el45: 30,
    el2After: guide(150),
    bue2BeforeMonitor: 250,
    bue1Factor: guide(1, tx('Ausreichend zum Anhalten vor dem Übergang; Richtwert Bremsweg.', 'Enough to stop before the crossing; guide value one braking distance.')),
    bue4Before: guide(400, tx('Abstand nach örtlicher Festlegung.', 'Distance set locally.')),
    bue5Before: guide(200, tx('Abstand nach örtlicher Festlegung.', 'Distance set locally.')),
    ne6: guide({ main: 1000, branch: 150, mainFrom: 1000 }, tx('800 bis 1300 m auf Hauptbahnen, 150 m auf Nebenbahnen.', '800 to 1300 m on main lines, 150 m on branch lines.')),
    ne5BeforeExit: guide(120),
    markedMastsBefore: guide(180),
    ra10BeforeSwitch: guide(40),
  },
  clearance: { perGradient: 3.5, signalGap: guide(20) },
  speed: {
    hp2Default: 40,
    hlSteps: [40, 60, 100],
    limits: { pzb: 160, lzb: 250, branch: 100, branchNoTp: 80, tpRequired: 100, freight: 120, freightBranch: 80 },
    switchProtection: 50,
  },
  switches: [
    { name: '190 – 1:7,5 / 1:9', div: 40, len: 27 },
    { name: '300 – 1:9 / 1:14', div: 50, len: 33 },
    { name: '500 – 1:12 / 1:14', div: 60, len: 42 },
    { name: '760 – 1:14 / 1:18,5', div: 80, len: 54 },
    { name: '1200 – 1:18,5', div: 100, len: 65 },
    { name: '2500 – 1:26,5', div: 130, len: 94 },
  ],
  curve: { k: 11.8, round: 10, radiusStep: 50, ufDefault: guide(100) },
};
