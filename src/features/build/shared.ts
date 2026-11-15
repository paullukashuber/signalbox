import * as D from '../../signals/draw';
import { tx, type Lang, type Tx } from '../../i18n';

export type BuildSys = 'form' | 'licht' | 'ks' | 'hl';
export type BuildState = {
  bw: number; vmax: number; vein: number; f: number; n: number; blk: number; sys: BuildSys;
  wt: number; r: number; u: number; uf: number; zl: number; lfv: number;
};
export const BUILD_DEFAULTS: BuildState = { bw: 1000, vmax: 120, vein: 80, f: 1, n: 9, blk: 1100, sys: 'form', wt: 2, r: 700, u: 100, uf: 100, zl: 200, lfv: 70 };

export type PartKey =
  | 'hs' | 'vs' | 'ms' | 'zs3' | 'zs6' | 'zs1' | 'zs13'
  | 'ne1' | 'ne2' | 'ne3' | 'ne4' | 'ne5' | 'ne6' | 'lf67' | 'lf13'
  | 'shf' | 'gs' | 'shl' | 'ra12' | 'ra10' | 'ra11' | 'sh2'
  | 'bue1' | 'bue2' | 'bue4' | 'el1' | 'el4' | 'flt' | 'pzb';

/** Parts the player can tick off in “My parts”. */
export const PARTS: [Tx, [PartKey, Tx][]][] = [
  [tx('Haupt- und Vorsignale', 'Main and distant signals'), [['hs', tx('Hauptsignal (Einfahr-, Ausfahr-, Blocksignal)', 'Main signal (home, exit, block)')], ['vs', tx('Vorsignal', 'Distant signal')], ['ms', tx('Mehrabschnittssignal (Ks/Hl/Sk)', 'Multi-section signal (Ks/Hl/Sk)')], ['zs3', tx('Zs 3 / Zs 3v', 'Zs 3 / Zs 3v')], ['zs6', tx('Zs 6 Gegengleisanzeiger', 'Zs 6 opposite-track indicator')], ['zs1', tx('Zs 1 / Zs 7', 'Zs 1 / Zs 7')], ['zs13', tx('Zs 13', 'Zs 13')]]],
  [tx('Tafeln', 'Boards'), [['ne1', tx('Ne 1 Trapeztafel', 'Ne 1 trapezoid board')], ['ne2', tx('Ne 2 Vorsignaltafel', 'Ne 2 distant board')], ['ne3', tx('Ne 3 Vorsignalbaken', 'Ne 3 distant beacons')], ['ne4', tx('Ne 4 Schachbretttafel', 'Ne 4 chequerboard')], ['ne5', tx('Ne 5 Haltetafel', 'Ne 5 stop marker')], ['ne6', tx('Ne 6 Haltepunkttafel', 'Ne 6 halt board')], ['lf67', tx('Lf 6 / Lf 7', 'Lf 6 / Lf 7')], ['lf13', tx('Lf 1 / Lf 2 / Lf 3', 'Lf 1 / Lf 2 / Lf 3')]]],
  [tx('Rangier und Schutz', 'Shunting and protection'), [['shf', tx('Formsperrsignal Sh 0/Sh 1', 'Semaphore shunting signal Sh 0/Sh 1')], ['gs', tx('Gleissperre mit Gleissperrsignal', 'Derailer with derailer signal')], ['shl', tx('Lichtsperrsignal', 'Light shunting signal')], ['ra12', tx('Grenzzeichen', 'Clearance marker')], ['ra10', tx('Ra 10 Rangierhalttafel', 'Ra 10 shunting limit board')], ['ra11', tx('Ra 11 Wartezeichen', 'Ra 11 wait sign')], ['sh2', tx('Sh 2 Schutzhalt', 'Sh 2 protection stop')]]],
  [tx('Bahnübergang', 'Level crossing'), [['bue1', tx('Bü 0/Bü 1 Überwachungssignal', 'Bü 0/Bü 1 monitor signal')], ['bue2', tx('Bü 2 Rautentafel', 'Bü 2 diamond board')], ['bue4', tx('Bü 4 / Bü 5', 'Bü 4 / Bü 5')]]],
  [tx('Fahrleitung und Technik', 'Catenary and equipment'), [['el1', tx('El 1v / El 1 / El 2', 'El 1v / El 1 / El 2')], ['el4', tx('El 3 / El 4 / El 5', 'El 3 / El 4 / El 5')], ['flt', tx('Markierte Fahrleitungsmaste', 'Marked catenary masts')], ['pzb', tx('PZB-Gleismagnete', 'PZB track magnets')]]],
];

export type Owned = Record<string, boolean>;
const ALIAS: Record<string, PartKey> = { lf7: 'lf67', lf2: 'lf13', lf3: 'lf13', bue5: 'bue4', el1v: 'el1', el2: 'el1', el3: 'el4', el5: 'el4' };
/** Whether the player owns the part (unticked parts are false; unknown ones count as owned). */
export const owns = (owned: Owned, p: string) => p === 'weiche' || p === 'bue' || owned[ALIAS[p] || p] !== false;

export const gsIcon = () => D.shForm(false) + `<rect x="-22" y="104" width="44" height="4" fill="var(--track)"/><rect x="6" y="95" width="14" height="9" rx="1.5" fill="${D.K.yel}" stroke="#222" stroke-width=".8"/>`;

/** Drawing for a part in the chosen signal system. */
export function icon(part: string, sys: BuildSys): string {
  switch (part) {
    case 'hs': case 'ms':
      return sys === 'form' ? D.formHp('Hp0') : sys === 'licht' ? D.hvHp('Hp0') : sys === 'ks' ? D.ksSig('Hp0', '', '', false, part === 'ms') : D.hlSig('Hp0', false, part === 'ms');
    case 'vs':
      return sys === 'form' ? D.formVr('Vr0') : sys === 'licht' ? D.hvVr('Vr0') : sys === 'ks' ? D.ksSig('Ks2', '', '', true) : D.hlSig('Hl10', true);
    case 'zs3': return D.zs2('6');
    case 'zs6': return D.zs6();
    case 'zs1': return D.zsLights('zs1');
    case 'zs13': return D.zs13();
    case 'ne1': return D.ne1();
    case 'ne2': return D.ne2Only();
    case 'ne3': return D.bake(3);
    case 'ne4': return D.ne4();
    case 'ne5': return D.ne5();
    case 'ne6': return D.labelBoard('Ne 6');
    case 'lf67': return D.lf6(6);
    case 'lf7': return D.lf7(6);
    case 'lf13': return D.lf1(5);
    case 'lf2': return D.lf2();
    case 'lf3': return D.lf3();
    case 'shf': return D.shForm(false);
    case 'shl': return D.sperrL('Hp0');
    case 'ra12': return D.ra12();
    case 'ra10': return D.ra10();
    case 'ra11': return D.ra11();
    case 'sh2': return D.sh2();
    case 'bue1': return D.bue1('ok');
    case 'bue2': return D.bue2();
    case 'bue4': return D.bueTxt('P');
    case 'bue5': return D.bueTxt('L');
    case 'el1': case 'el1v': case 'el2': case 'el3': case 'el4': case 'el5': return D.elB(part);
    case 'flt': return D.fltMast(true);
    case 'pzb': return `<rect x="-9" y="40" width="18" height="10" rx="2" fill="#EF9F27" stroke="#555"/><line x1="-20" y1="52" x2="20" y2="52" stroke="var(--track)" stroke-width="3"/>`;
    case 'gs': return gsIcon();
    case 'weiche': return `<path d="M-22 70 H22 M-22 70 L18 46" stroke="var(--track)" stroke-width="3" fill="none"/>`;
    case 'bue': return D.andreas();
  }
  return '';
}

export const mini = (d: string, sc = 0.42) => D.pic(d, 44, 70, sc, 22, 4);
export const isMulti = (s: BuildState) => s.sys === 'ks' || s.sys === 'hl';

/** Overlap behind the home signal for the entry speed (rule-of-thumb values). */
export const overlap = (vein: number) => (vein > 60 ? 200 : vein > 40 ? 100 : 50);

const locale = (lang: Lang) => (lang === 'de' ? 'de-DE' : 'en-GB');
/** Signed metres, e.g. “−1,000 m”. */
export const fmt = (m: number, lang: Lang) => (m > 0 ? '+' : m < 0 ? '−' : '') + Math.abs(Math.round(m)).toLocaleString(locale(lang)) + ' m';
export const num = (n: number, lang: Lang) => Math.round(n).toLocaleString(locale(lang));
export const decimal = (n: number, lang: Lang) => n.toLocaleString(locale(lang));

/* ---------- speed formulas ---------- */
/** Switch types: [name, diverging speed km/h, approx. length m]. */
export const SWITCHES: [string, number, number][] = [
  ['190 – 1:7,5 / 1:9', 40, 27], ['300 – 1:9 / 1:14', 50, 33], ['500 – 1:12 / 1:14', 60, 42],
  ['760 – 1:14 / 1:18,5', 80, 54], ['1200 – 1:18,5', 100, 65], ['2500 – 1:26,5', 130, 94],
];
export const floor10 = (v: number) => Math.floor(v / 10) * 10;
/** EBO § 40 (7): v = √(r / 11.8 · (u + uf)), rounded down to 10 km/h. */
export const curveSpeed = (r: number, u: number, uf: number) => floor10(Math.sqrt((r / 11.8) * (u + uf)));
/** Smallest radius (rounded up to 50 m) for a speed. */
export const minRadius = (v: number, u: number, uf: number) => Math.ceil((11.8 * v * v) / (u + uf) / 50) * 50;
/** Hl can only show 40, 60 or 100 km/h. */
export const hlStep = (v: number) => (v >= 100 ? 100 : v >= 60 ? 60 : 40);
