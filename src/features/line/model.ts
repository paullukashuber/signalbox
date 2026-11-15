import { HLM } from '../../signals/draw';
import { pick, tx, type Lang, type Tx } from '../../i18n';
import { R, ne6Before } from '../../rules';

export type Sys = 'form' | 'licht' | 'hl' | 'ks' | 'sk' | 'neben';
export type Section = 'bf' | 'blk' | 'bue' | 'hpt' | 'all';
export type LineState = {
  sys: Sys;
  line: 'haupt' | 'neben';
  es: 'hp0' | 'hp1' | 'hp2' | 'z1' | 'z7';
  aus: 'halt' | 'fahrt';
  bue: 'ok' | 'stoer';
  hpt: 'durch' | 'halt';
  occ: 0 | 1 | 2 | 3;
  sec: Section;
  night: boolean;
  pzb: boolean;
  dim: boolean;
  sel: string;
};

export const INITIAL: LineState = {
  sys: 'form', line: 'haupt', es: 'hp1', aus: 'fahrt', bue: 'ok', hpt: 'durch',
  occ: 0, sec: 'bf', night: false, pzb: true, dim: true, sel: 'es',
};

/** Fixed positions along the line in metres. */
export const P = { ES: 1300, RA10: 1460, W1: 1500, A: 2250, W2: 2380, NE5: 2150, BK1: 3350, BK2: 4450, BK3: 5550, LF7: 5000, BUE: 7100, EL1: 7800, TR: 7850, EL2: 7950, HPT: 9200, END: 9600 } as const;
export const SECS: Record<Section, [number, number]> = { bf: [0, 3600], blk: [2050, 5650], bue: [5300, 8900], hpt: [6000, 9600], all: [0, 9600] };
export const TY = 210, SY = 80, VH = 545;
export const X = (m: number) => 30 + m * 0.36;

export const bw = (S: LineState) => R.brake[S.line];
export const vsPos = (S: LineState) => P.ES - bw(S);
export const lf6Pos = (S: LineState) => P.LF7 - bw(S) * R.boards.lf6Factor;
export const bu1Pos = (S: LineState) => P.BUE - bw(S) * R.boards.bue1Factor.v;
export const bu2Pos = (S: LineState) => bu1Pos(S) - R.boards.bue2BeforeMonitor;
export const el1vPos = (S: LineState) => P.EL1 - bw(S) * R.boards.el1vFactor;
export const ne6Pos = (S: LineState) => P.HPT - ne6Before(bw(S));
/** Ne 3 beacon positions before the distant signal, outermost first. */
export const bakenPos = (S: LineState) => R.distant.beacons.map((d) => vsPos(S) - d);
export const pzb500Pos = () => P.ES - R.pzb.hz500BeforeMain;
export const isNeben = (S: LineState) => S.sys === 'neben';
export const isFault = (S: LineState) => S.es === 'z1' || S.es === 'z7';
export const occ = (S: LineState) => (isNeben(S) ? 0 : S.occ);
export const exitHalt = (S: LineState) => S.aus === 'halt' || occ(S) === 1;

type Block = 'halt' | 'warn' | 'clear';
function chain(S: LineState): Block[] {
  const hl = [exitHalt(S), occ(S) === 2, occ(S) === 3, false, false];
  return [0, 1, 2, 3].map((i) => (hl[i] ? 'halt' : hl[i + 1] ? 'warn' : 'clear'));
}
function sysAsp(S: LineState, st: Block): string {
  const s = S.sys;
  if (s === 'form' || s === 'licht') return st === 'halt' ? 'Hp0' : 'Hp1';
  if (s === 'hl') return st === 'halt' ? 'Hp0' : st === 'warn' ? 'Hl10' : 'Hl1';
  if (s === 'ks') return st === 'halt' ? 'Hp0' : st === 'warn' ? 'Ks2' : 'Ks1';
  return st === 'halt' ? 'Hp0' : st === 'warn' ? 'Sk2' : 'Sk1';
}
function sysVr(S: LineState, st: Block, nx: Block): string {
  if (st === 'halt') return S.sys === 'licht' ? 'dunkel' : 'Vr0';
  return nx === 'halt' ? 'Vr0' : 'Vr1';
}

export type Aspects = {
  vs: string; vs3: string; es: string; esVr: string; zs: '' | 'z1' | 'z7'; zs3: string;
  aus: string; ausVr: string; ausMain: string; ausSide: string;
  bk: { a: string; vr: string }[];
};

/** Derives every signal aspect from the current settings. */
export function aspects(S: LineState): Aspects {
  const a = exitHalt(S) ? 'halt' : 'fahrt', s = S.sys;
  const e = isFault(S) ? 'hp0' : S.es;
  const o: Aspects = { vs: '', vs3: '', es: '', esVr: '', zs: isFault(S) ? (S.es as 'z1' | 'z7') : '', zs3: '', aus: '', ausVr: '', ausMain: '', ausSide: '', bk: [] };
  if (s === 'form' || s === 'licht') {
    o.vs = e === 'hp0' ? 'Vr0' : e === 'hp1' ? 'Vr1' : 'Vr2';
    o.es = e === 'hp0' ? 'Hp0' : e === 'hp1' ? 'Hp1' : 'Hp2';
    o.esVr = e === 'hp0' ? (s === 'licht' ? 'dunkel' : 'Vr0') : a === 'halt' ? 'Vr0' : 'Vr1';
    o.aus = a === 'halt' ? 'Hp0' : 'Hp1';
  } else if (s === 'hl') {
    o.vs = e === 'hp0' ? 'Hl10' : e === 'hp1' ? 'Hl1' : 'Hl7';
    o.es = e === 'hp0' ? 'Hp0' : e === 'hp1' ? (a === 'halt' ? 'Hl10' : 'Hl1') : a === 'halt' ? 'Hl12a' : 'Hl3a';
    o.aus = a === 'halt' ? 'Hp0' : 'Hl1';
  } else if (s === 'ks') {
    o.vs = e === 'hp0' ? 'Ks2' : e === 'hp1' ? 'Ks1' : 'Ks1b';
    o.vs3 = e === 'hp2' ? '4' : '';
    o.es = e === 'hp0' ? 'Hp0' : a === 'halt' ? 'Ks2' : 'Ks1';
    o.zs3 = e === 'hp2' ? '4' : '';
    o.aus = a === 'halt' ? 'Hp0' : 'Ks1';
  } else if (s === 'sk') {
    o.vs = e === 'hp0' ? 'Sk2' : 'Sk1';
    o.vs3 = e === 'hp2' ? '4' : '';
    o.es = e === 'hp0' ? 'Hp0' : a === 'halt' ? 'Sk2' : 'Sk1';
    o.zs3 = e === 'hp2' ? '4' : '';
    o.aus = a === 'halt' ? 'Hp0' : 'Sk1';
  }
  if (s !== 'neben') {
    const ch = chain(S);
    o.aus = sysAsp(S, ch[0]);
    o.ausVr = sysVr(S, ch[0], ch[1]);
    o.bk = [1, 2, 3].map((i) => ({ a: sysAsp(S, ch[i]), vr: sysVr(S, ch[i], ch[i + 1] || 'clear') }));
  }
  o.ausMain = e === 'hp2' ? 'Hp0' : o.aus;
  o.ausSide = e === 'hp2' ? o.aus : 'Hp0';
  return o;
}

const MEAN: Record<string, Tx> = {
  Vr0: tx('Halt erwarten', 'Expect stop'),
  Vr1: tx('Fahrt erwarten', 'Expect clear'),
  Vr2: tx('Langsamfahrt erwarten', 'Expect slow speed'),
  Hp0: tx('Halt', 'Stop'),
  Hp1: tx('Fahrt', 'Clear'),
  Hp2: tx('Langsamfahrt (40 km/h)', 'Slow speed (40 km/h)'),
  Ks1: tx('Fahrt', 'Clear'),
  Ks1b: tx('Fahrt, Geschwindigkeitsbeschränkung erwarten', 'Clear, expect a speed restriction'),
  Ks2: tx('Halt erwarten', 'Expect stop'),
  Sk1: tx('Fahrt bzw. Fahrt erwarten', 'Clear / expect clear'),
  Sk2: tx('Halt erwarten', 'Expect stop'),
  dunkel: tx('dunkel (Hauptsignal zeigt Halt)', 'dark (main signal shows stop)'),
};

/** Meaning of an Hl aspect such as Hl3a. */
export function hlMeaning(c: string, lang: Lang): string {
  if (c === 'Hp0') return pick(MEAN.Hp0, lang);
  const [r, x] = HLM[c];
  const max = lang === 'de' ? 'Höchstgeschwindigkeit' : 'line speed';
  const here = ({ max, 100: '100 km/h', 40: '40 km/h', 60: '60 km/h' } as Record<string, string>)[r];
  const next = ({ max, 100: '100 km/h', 46: lang === 'de' ? '40 oder 60 km/h' : '40 or 60 km/h', halt: lang === 'de' ? 'Halt' : 'stop' } as Record<string, string>)[x];
  return lang === 'de' ? `Fahrt mit ${here}, am nächsten Signal ${next} erwarten` : `Proceed at ${here}, expect ${next} at the next signal`;
}

export function meaning(c: string, sys: Sys, lang: Lang): string {
  if (HLM[c] || (c === 'Hp0' && sys === 'hl')) return hlMeaning(c, lang);
  return MEAN[c] ? pick(MEAN[c], lang) : c;
}

/** Display name: "Hp0" → "Hp 0". */
export function nm(c: string, lang: Lang): string {
  if (c === 'Ks1b') return lang === 'de' ? 'Ks 1 blinkend' : 'Ks 1 flashing';
  if (c === 'dunkel') return lang === 'de' ? 'dunkel' : 'dark';
  return c.replace(/^([A-Za-z]+)(\d)/, '$1 $2');
}

export type El = { k: string; m: number; m2?: number; lab: Tx; hide?: boolean; up?: boolean; side?: boolean; n?: number };

/** All plan elements, sorted by position. */
export function elements(S: LineState): El[] {
  const VS = vsPos(S), n = isNeben(S), a: El[] = [];
  const bk = bakenPos(S);
  a.push({ k: 'baken', m: bk[0], m2: bk[2], lab: tx('Vorsignalbaken Ne 3', 'Ne 3 distant signal beacons') });
  a.push({ k: 'vs', m: VS, lab: n ? tx('Vorsignaltafel Ne 2', 'Ne 2 distant board') : tx('Vorsignal', 'Distant signal') });
  if (S.pzb && !n) ['pzb1000', 'pzb500', 'pzb2000'].forEach((k) => a.push({ k, hide: true, m: 0, lab: tx('', '') }));
  a.push({ k: 'es', m: P.ES, lab: n ? tx('Trapeztafel Ne 1', 'Ne 1 trapezoid board') : tx('Einfahrsignal', 'Home signal') });
  a.push({ k: 'ra10', m: P.RA10, lab: tx('Rangierhalttafel Ra 10 (Gegenrichtung)', 'Ra 10 shunting limit (opposite direction)'), up: true });
  a.push({ k: 'ne5', m: P.NE5, lab: tx('Haltetafel Ne 5', 'Ne 5 stop marker') });
  if (!n) {
    a.push({ k: 'aus', m: P.A, lab: tx('Ausfahrsignal Gleis 1', 'Exit signal track 1') });
    a.push({ k: 'aus2', m: P.A, lab: tx('Ausfahrsignal Gleis 2', 'Exit signal track 2'), side: true });
    ([1, 2, 3] as const).forEach((i) => a.push({ k: 'bk' + i, m: P[`BK${i}`], lab: tx('Blocksignal Bk ' + i, 'Block signal Bk ' + i) }));
  }
  a.push({ k: 'lf6', m: lf6Pos(S), lab: tx('Lf 6 (60 km/h angekündigt)', 'Lf 6 (60 km/h announced)') });
  a.push({ k: 'lf7', m: P.LF7, lab: tx('Lf 7 (ab hier 60 km/h)', 'Lf 7 (60 km/h from here)') });
  a.push({ k: 'bue2', m: bu2Pos(S), lab: tx('Rautentafel Bü 2', 'Bü 2 diamond board') });
  a.push({ k: 'bue1', m: bu1Pos(S), lab: tx('Überwachungssignal Bü 0/Bü 1', 'Bü 0/Bü 1 crossing monitor signal') });
  a.push({ k: 'andreas', m: P.BUE, lab: tx('Bahnübergang mit Andreaskreuz', 'Level crossing with St Andrew’s cross'), up: true });
  a.push({ k: 'el1v', m: el1vPos(S), lab: tx('El 1v Ausschaltsignal erwarten', 'El 1v expect power off') });
  a.push({ k: 'el1', m: P.EL1, lab: tx('El 1 Ausschaltsignal', 'El 1 power off') });
  a.push({ k: 'el2', m: P.EL2, lab: tx('El 2 Einschaltsignal', 'El 2 power on') });
  a.push({ k: 'ne6', m: ne6Pos(S), lab: tx('Ne 6 Haltepunkttafel', 'Ne 6 halt board') });
  a.push({ k: 'hpt', m: P.HPT, lab: tx('Haltetafel Ne 5 am Haltepunkt', 'Ne 5 stop marker at the halt') });
  const sorted = a.sort((p, q) => (p.hide ? 0 : p.m) - (q.hide ? 0 : q.m));
  let num = 0;
  sorted.forEach((e) => { if (!e.hide) e.n = ++num; });
  return sorted;
}

/** Current aspect code of a clickable signal, if any. */
export function currentAspect(k: string, A: Aspects): string | undefined {
  return ({ vs: A.vs, es: A.es, aus: A.ausMain, aus2: A.ausSide, bk1: A.bk[0]?.a, bk2: A.bk[1]?.a, bk3: A.bk[2]?.a } as Record<string, string | undefined>)[k];
}

/* ---------- simulation ---------- */
function vBase(S: LineState, m: number): number {
  const vm = S.line === 'haupt' ? 120 : 80, VS = vsPos(S), n = isNeben(S), st = isFault(S) && !n;
  const e = n && S.es === 'hp2' ? 'hp1' : st ? 'hp0' : S.es;
  const vE = st ? 20 : e === 'hp0' ? 0 : e === 'hp2' ? R.speed.hp2Default : vm, ah = !n && exitHalt(S), L6 = lf6Pos(S), vL = 60;
  if (m < VS) return vm;
  if (m < P.ES) {
    const end = vE ? P.ES : P.ES - 25;
    if (m >= end) return 0;
    return Math.sqrt(vE * vE + ((vm * vm - vE * vE) * (end - m)) / (end - VS));
  }
  const vB = st ? 40 : vE, lim = S.es === 'z7' ? P.A : P.W2;
  if (ah) {
    const end = P.A - 25;
    if (m >= end) return 0;
    return Math.sqrt((vB * vB * (end - m)) / (end - P.ES));
  }
  if (m < lim) return vB;
  const acc = (x: number) => Math.min(vm, vB + (x - lim) * 0.6);
  if (m < L6) return acc(m);
  const v6 = acc(L6);
  if (m < P.LF7) return v6 <= vL ? Math.min(vL, acc(m)) : Math.sqrt(vL * vL + ((v6 * v6 - vL * vL) * (P.LF7 - m)) / (P.LF7 - L6));
  const v7 = Math.min(vL, acc(P.LF7));
  if (S.bue === 'stoer' && m >= bu1Pos(S) && m < P.BUE) {
    const end = P.BUE - 25;
    if (m >= end) return 0;
    return Math.sqrt((v7 * v7 * (end - m)) / (end - bu1Pos(S)));
  }
  if (S.hpt === 'halt' && m >= P.HPT - 450) {
    const end = P.HPT - 8;
    if (m >= end) return 0;
    return Math.sqrt((v7 * v7 * (end - m)) / (end - (P.HPT - 450)));
  }
  return Math.min(vL, acc(m));
}

/** Speed (km/h) of the demo train at position m. */
export function speedAt(S: LineState, m: number): number {
  let v = vBase(S, m);
  const o = occ(S);
  if (o >= 2) {
    const end = (o === 2 ? P.BK1 : P.BK2) - 25, vm = S.line === 'haupt' ? 120 : 80;
    if (m >= end) return 0;
    if (m > end - bw(S)) v = Math.min(v, vm * Math.sqrt((end - m) / bw(S)));
  }
  return v;
}

/** Vertical plan position of the train (it uses track 2 for a diverging entry). */
export function trainY(S: LineState, m: number): number {
  if (S.es !== 'hp2' || isNeben(S) || m < P.W1 || m > P.W2) return TY;
  if (m < 1650) return TY - ((m - P.W1) / 150) * (TY - SY);
  if (m < 2300) return SY;
  return SY + ((m - 2300) / 80) * (TY - SY);
}

/** Log messages the driver sees, by position. */
export function events(S: LineState, lang: Lang): [number, string][] {
  const A = aspects(S), VS = vsPos(S), n = isNeben(S), st = isFault(S) && !n;
  const L = (de: string, en: string) => (lang === 'de' ? de : en);
  const N = (c: string) => nm(c, lang), M = (c: string) => meaning(c, S.sys, lang);
  const esTxt = st
    ? S.es === 'z1'
      ? L('Einfahrsignal gestört, Hp 0 + Zs 1: ohne schriftlichen Befehl vorbeifahren, 2000 Hz mit Befehlstaste überbrücken', 'Home signal failed, Hp 0 + Zs 1: pass without a written order, override 2000 Hz with the command key')
      : L('Einfahrsignal gestört, Hp 0 + Zs 7: vorbeifahren, auf Sicht bis zum nächsten Hauptsignal', 'Home signal failed, Hp 0 + Zs 7: pass, on sight up to the next main signal')
    : `${L('Einfahrsignal', 'Home signal')} ${N(A.es)}: ${M(A.es)}`;
  const ev: [number, string][] = [
    [bakenPos(S)[0], n ? L('Baken: Ne 2 folgt', 'Beacons: Ne 2 ahead') : L('Baken: Vorsignal folgt', 'Beacons: distant signal ahead')],
    [VS, n ? L('Ne 2: Bremspunkt vor Ne 1', 'Ne 2: braking point before Ne 1') : `${L('Vorsignal', 'Distant signal')} ${N(A.vs)}: ${M(A.vs)}${S.es !== 'hp1' ? L(' – PZB 1000 Hz, Wachsamkeitstaste', ' – PZB 1000 Hz, acknowledge') : ''}`],
    [pzb500Pos(), !n && (S.es === 'hp0' || st) ? L('500 Hz wirksam: Geschwindigkeit geprüft', '500 Hz active: speed checked') : ''],
    [P.ES, n ? L('Ne 1: Einfahrt mit Zulassung des Zugleiters', 'Ne 1: entry with the train controller’s permission') : esTxt],
    [P.RA10, L('Ra 10 (gilt nur für Rangierfahrten)', 'Ra 10 (applies to shunting only)')],
    [P.W1, !n && S.es === 'hp2' ? L('Weiche abzweigend, 40 km/h', 'Switch set diverging, 40 km/h') : ''],
    [P.W2, S.es === 'z1' && !n ? L('Ende des Weichenbereichs, Zug beschleunigt', 'End of the switch area, train accelerates') : ''],
    [P.A, n ? '' : `${L('Ausfahrsignal', 'Exit signal')} ${N(A.aus)}: ${M(A.aus)}${S.es === 'z7' ? L(' – Fahrt auf Sicht endet', ' – running on sight ends') : ''}`],
    ...(n ? [] : ([1, 2, 3] as const).map((i): [number, string] => [P[`BK${i}`], `${L('Blocksignal', 'Block signal')} Bk ${i} ${N(A.bk[i - 1].a)}: ${M(A.bk[i - 1].a)}`])),
    [lf6Pos(S), L('Lf 6: 60 km/h angekündigt', 'Lf 6: 60 km/h announced')],
    [P.LF7, L('Lf 7: ab hier 60 km/h', 'Lf 7: 60 km/h from here')],
    [bu2Pos(S), L('Bü 2: Überwachungssignal folgt', 'Bü 2: monitor signal ahead')],
    [bu1Pos(S), S.bue === 'ok' ? L('Bü 1: Bahnübergang gesichert', 'Bü 1: crossing protected') : L('Bü 0: Halt vor dem Bahnübergang', 'Bü 0: stop before the crossing')],
    [P.BUE, L('Bahnübergang befahren', 'Crossing passed')],
    [el1vPos(S), L('El 1v: Ausschaltsignal erwarten', 'El 1v: expect power off')],
    [P.EL1, L('El 1: Hauptschalter aus', 'El 1: main breaker off')],
    [P.TR, L('Trennstelle stromlos durchfahren', 'Section break passed without power')],
    [P.EL2, L('El 2: Einschalten erlaubt', 'El 2: power on allowed')],
    [ne6Pos(S), S.hpt === 'halt' ? L('Ne 6: Haltepunkt folgt, Zug bremst', 'Ne 6: halt ahead, train brakes') : L('Ne 6: Haltepunkt folgt (ohne Halt)', 'Ne 6: halt ahead (not stopping)')],
  ];
  return ev.filter((e) => e[1]).sort((p, q) => p[0] - q[0]);
}

/** Why the train stopped at position m. */
export function stopReason(S: LineState, m: number, lang: Lang): string {
  const L = (de: string, en: string) => (lang === 'de' ? de : en), n = isNeben(S), o = occ(S);
  if (m < P.ES) return n ? L('Halt an Ne 1 (keine Zulassung)', 'Stop at Ne 1 (no permission)') : L('Zug hält vor dem Einfahrsignal', 'Train stops at the home signal');
  if (m < P.A + 5) return o === 1 ? L('Zug hält vor dem Ausfahrsignal – Block 1 ist belegt', 'Train stops at the exit signal – block 1 is occupied') : L('Zug hält vor dem Ausfahrsignal', 'Train stops at the exit signal');
  if (m < P.BK3) return L(`Zug hält vor Blocksignal Bk ${o - 1} – Block ${o} ist belegt`, `Train stops at block signal Bk ${o - 1} – block ${o} is occupied`);
  if (m < P.BUE) return L('Zug hält vor dem Bahnübergang – Weiterfahrt erst nach Sicherung', 'Train stops before the crossing – it may only continue once protected');
  return L('Zug hält am Haltepunkt (Ne 5)', 'Train stops at the halt (Ne 5)');
}
