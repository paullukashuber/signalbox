import * as D from '../../signals/draw';
import { pick, type Lang } from '../../i18n';
import {
  P, SECS, SY, TY, X, aspects, bu1Pos, bu2Pos, bw, el1vPos, elements, isFault, isNeben, lf6Pos, ne6Pos, occ, vsPos,
  type Aspects, type LineState,
} from './model';

/** A main signal of the chosen system with its distant aspect on the same mast. */
export function signalAt(S: LineState, a: string, vr: string, night: boolean): string {
  const s = S.sys;
  if (s === 'form') return D.formHp(a, night, vr);
  if (s === 'licht') return D.hvHp(a, vr === 'dunkel' ? 'x' : vr);
  if (s === 'hl') return D.hlSig(a, false, true);
  if (s === 'ks') return D.ksSig(a, '', '', false, true);
  return D.skSig(a, '', '', 'komb');
}

/** Drawing for a plan element key. */
export function drawElement(S: LineState, k: string, A: Aspects, night: boolean): string {
  const s = S.sys;
  switch (k) {
    case 'vs':
      return s === 'form' ? D.formVr(A.vs, night) : s === 'licht' ? D.hvVr(A.vs) : s === 'hl' ? D.hlSig(A.vs, true) : s === 'ks' ? D.ksSig(A.vs, '', A.vs3, true) : s === 'sk' ? D.skSig(A.vs, '', A.vs3, 'vs') : D.ne2Only();
    case 'es':
      return s === 'form' ? D.formHp(A.es, night, A.esVr, A.zs) : s === 'licht' ? D.hvHp(A.es, A.esVr === 'dunkel' ? 'x' : A.esVr, 'wrw', A.zs) : s === 'hl' ? D.hlSig(A.es, false, true, A.zs) : s === 'ks' ? D.ksSig(A.es, A.zs3, '', false, true, A.zs) : s === 'sk' ? D.skSig(A.es, A.zs3, '', 'komb', A.zs) : D.ne1();
    case 'aus':
    case 'aus2': {
      const v = k === 'aus' ? A.ausMain : A.ausSide;
      const vr = v === 'Hp0' ? (s === 'licht' ? 'dunkel' : 'Vr0') : A.ausVr;
      return signalAt(S, v, vr, night);
    }
    case 'bk1':
    case 'bk2':
    case 'bk3': {
      const b = A.bk[+k[2] - 1];
      return signalAt(S, b.a, b.vr, night);
    }
    case 'ne5': return D.ne5();
    case 'lf6': return D.lf6(6);
    case 'lf7': return D.lf7(6);
    case 'ra10': return D.ra10();
    case 'bue2': return D.bue2();
    case 'bue1': return D.bue1(S.bue);
    case 'andreas': return D.andreas();
    case 'el1v': return D.elB('el1v');
    case 'el1': return D.elB('el1');
    case 'el2': return D.elB('el2');
    case 'ne6': return D.labelBoard('Ne 6');
    case 'hpt': return D.ne5();
    case 'flt': return D.fltMast(true);
    case 'baken': return D.bake(3);
  }
  return '';
}

const hit = (k: string, inner: string, transform = '') =>
  `<g class="hit" data-k="${k}" style="cursor:pointer"${transform ? ` transform="${transform}"` : ''}>${inner}</g>`;

function dim(m1: number, m2: number, y: number, l: string, k: string) {
  const a = X(m1), b = X(m2);
  return hit(k, `<rect x="${a}" y="${y - 18}" width="${b - a}" height="26" fill="transparent"/><line x1="${a}" y1="${y}" x2="${b}" y2="${y}" stroke="var(--mute)" stroke-width="1"/><line x1="${a}" y1="${y - 5}" x2="${a}" y2="${y + 5}" stroke="var(--mute)"/><line x1="${b}" y1="${y - 5}" x2="${b}" y2="${y + 5}" stroke="var(--mute)"/><text x="${(a + b) / 2}" y="${y - 6}" text-anchor="middle" font-size="12" style="fill:var(--mute)">${l}</text>`);
}

/** The view box for the chosen section. */
export function viewBox(S: LineState) {
  const sec = SECS[S.sec];
  return { vx: X(sec[0]) - 20, vw: (sec[1] - sec[0]) * 0.36 + 40 };
}

/** Full plan markup (without the train). */
export function planMarkup(S: LineState, lang: Lang): string {
  const A = aspects(S), VS = vsPos(S), n = isNeben(S), night = S.night && S.sys === 'form', o = occ(S);
  const L = (de: string, en: string) => (lang === 'de' ? de : en);
  const { vx } = viewBox(S);
  const mute = (x: number, y: number, t: string, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="12" style="fill:var(--mute)">${t}</text>`;
  let s = `<text x="${vx + 20}" y="28" font-size="13" font-weight="500">${L('Fahrtrichtung', 'Direction of travel')} →</text>`;
  s += `<rect x="${X(1750)}" y="${SY + 22}" width="${X(2150) - X(1750)}" height="${TY - SY - 44}" rx="3" fill="var(--plat)"/>` + mute(X(1950), (SY + TY) / 2 + 4, L('Bahnsteig', 'Platform'));
  s += `<rect x="${X(P.BUE) - 14}" y="110" width="28" height="210" fill="var(--road)"/>` + mute(X(P.BUE) + 20, 130, L('Straße', 'Road'), 'start');
  s += `<rect x="${X(P.HPT - 260)}" y="${TY - 46}" width="${X(P.HPT) - X(P.HPT - 260)}" height="30" rx="3" fill="var(--plat)"/>` + mute(X(P.HPT - 130), TY - 56, L('Haltepunkt', 'Halt'));
  // catenary with section break
  const CY = TY - 30;
  s += `<path d="M${X(0)} ${CY}H${X(P.TR - 25)} M${X(P.TR + 25)} ${CY}H${X(P.END)}" stroke="#9a7b4f" stroke-width="1.2" stroke-dasharray="6 3" fill="none"/><text x="${X(P.TR)}" y="${CY - 6}" text-anchor="middle" font-size="11" style="fill:#9a7b4f">${L('Trennstelle', 'Section break')}</text><text x="${X(500)}" y="${CY - 6}" font-size="11" style="fill:#9a7b4f">${L('Fahrleitung', 'Catenary')}</text>`;
  for (let m = 0; m <= P.END; m += 300) {
    if (Math.abs(m - P.ES) < 260) continue;
    s += `<rect x="${X(m) - 1}" y="${CY}" width="2" height="8" fill="#8e8d87"/>`;
  }
  [P.ES - 60, P.ES - 120, P.ES - 180].forEach((m) => {
    s += hit('flt', `<rect x="-6" y="-2" width="12" height="20" fill="transparent"/><rect x="-1.5" y="0" width="3" height="14" fill="#8e8d87"/><rect x="-3" y="3" width="6" height="2.5" fill="#fff" stroke="#222" stroke-width=".3"/><rect x="-3" y="5.5" width="6" height="2.5" fill="${D.K.red}"/><rect x="-3" y="8" width="6" height="2.5" fill="#fff" stroke="#222" stroke-width=".3"/>`, `translate(${X(m)} ${CY - 4})`);
  });
  s += mute(X(1950), SY - 10, L('Gleis 2 (abzweigend)', 'Track 2 (diverging)')) + mute(X(1950), TY - 8, L('Gleis 1', 'Track 1'));
  s += n
    ? mute(X(2800), TY - 10, L('freie Strecke (Zugleitbetrieb, keine Blocksignale)', 'open line (radio train control, no block signals)'))
    : [2800, 3900, 5000].map((m, i) => (o === i + 1 ? '' : mute(X(m), TY - 10, `Block ${i + 1}`))).join('');
  const rails = (d: string) => `<path d="${d}" stroke="var(--track)" stroke-width="5" fill="none" opacity=".25"/><path d="${d}" stroke="var(--track)" stroke-width="2.2" fill="none"/>`;
  s += rails(`M${X(0)} ${TY}H${X(P.END)}`) + rails(`M${X(P.W1)} ${TY}L${X(1650)} ${SY}L${X(2300)} ${SY}L${X(P.W2)} ${TY}`);
  if (o) {
    const m0 = [P.A, P.BK1, P.BK2][o - 1], m1 = [P.BK1, P.BK2, P.BK3][o - 1], mm = (m0 + m1) / 2;
    s += `<line x1="${X(m0) + 4}" y1="${TY}" x2="${X(m1) - 4}" y2="${TY}" stroke="#d85a30" stroke-width="7" opacity=".3"/><rect x="${X(mm + 150) - 15}" y="${TY - 6}" width="30" height="12" rx="3" fill="#d85a30"/><text x="${X(mm + 150)}" y="${TY - 12}" text-anchor="middle" font-size="12" font-weight="600" style="fill:#d85a30">${L(`Zug 2 · Block ${o} belegt`, `Train 2 · block ${o} occupied`)}</text>`;
  }
  const els = elements(S);
  const se = els.find((e) => e.k === S.sel && !e.hide);
  if (se) {
    const x1 = X(se.m) - 26, x2 = X(se.m2 || se.m) + 26;
    const [y, h] = se.side ? [SY + 4, TY - SY - 10] : se.up ? [TY - 118, 110] : [TY + 8, 160];
    s += `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${h}" rx="8" fill="none" stroke="var(--sel)" stroke-width="2" stroke-dasharray="5 4"/>`;
  }
  const low = ['ne5', 'lf6', 'lf7', 'bue2', 'andreas', 'el1v', 'el1', 'el2', 'ne6', 'hpt'];
  els.forEach((e) => {
    if (e.hide) return;
    const x = X(e.m);
    if (e.k === 'baken') {
      ([[VS - 250, 3], [VS - 175, 2], [VS - 100, 1]] as const).forEach(([m, c]) => {
        s += hit('baken', `<rect x="-10" y="-4" width="20" height="120" fill="transparent"/>${D.bake(c)}`, `translate(${X(m)} ${TY + 30}) scale(.95)`);
      });
    } else if (e.side) s += hit(e.k, `<rect x="-26" y="-4" width="52" height="160" fill="transparent"/>${drawElement(S, e.k, A, night)}`, `translate(${x} ${SY + 12}) scale(.72)`);
    else if (e.up) s += hit(e.k, `<rect x="-26" y="-4" width="52" height="120" fill="transparent"/>${drawElement(S, e.k, A, night)}`, `translate(${x} ${TY - 112}) scale(.85)`);
    else {
      const top = TY + 14 + (low.includes(e.k) ? 30 : 0) + (e.k === 'bue1' ? 20 : 0) + (n && (e.k === 'vs' || e.k === 'es') ? 30 : 0);
      s += hit(e.k, `<rect x="-26" y="-14" width="52" height="160" fill="transparent"/>${drawElement(S, e.k, A, night)}`, `translate(${x} ${top})`);
    }
    const bx = e.k === 'baken' ? X(VS - 175) : e.side ? x + 24 : e.up ? x + 30 : x;
    const by = e.side ? SY + 60 : e.up ? TY - 100 : TY + 174;
    s += hit(e.k, `<circle cx="${bx}" cy="${by}" r="10" fill="var(--ink)"/><text x="${bx}" y="${by + 4}" text-anchor="middle" font-size="11" font-weight="600" style="fill:var(--card)">${e.n}</text>`);
  });
  if (S.pzb && !n) {
    const on1 = S.es !== 'hp1', on5 = S.es === 'hp0' || isFault(S);
    ([[VS, '1000 Hz', on1, 'pzb1000'], [P.ES - 250, '500 Hz', on5, 'pzb500'], [P.ES, '2000 Hz', on5, 'pzb2000']] as const).forEach(([m, l, on, k]) => {
      const x = X(m);
      s += hit(k, `<rect x="${x - 22}" y="${TY - 26}" width="44" height="34" fill="transparent"/><rect x="${x + 3}" y="${TY + 2}" width="12" height="7" rx="1.5" fill="${on ? '#EF9F27' : '#888780'}" stroke="var(--track)" stroke-width=".6"/><text x="${x + 9}" y="${TY - 8}" text-anchor="middle" font-size="11" style="fill:${on ? '#BA7517' : 'var(--mute)'}">${l}</text>`);
    });
  }
  if (S.dim) {
    const y1 = 430, y2 = 462, y3 = 494, y4 = 526, b = bw(S);
    s += dim(VS, P.ES, y1, `${n ? L('Bremswegabstand', 'Braking distance') : L('Vorsignalabstand', 'Distant signal spacing')} ${b} m`, 'abst');
    s += dim(P.ES, P.A, y1, L('Bahnhof', 'Station'), 'bhf');
    s += dim(lf6Pos(S), P.LF7, y1, `Lf 6 → Lf 7: ${b} m`, 'lfabst');
    s += dim(bu1Pos(S), P.BUE, y1, `${L('Bü-Signal → Bahnübergang', 'Bü signal → crossing')}: ${b} m`, 'bueabst');
    s += dim(VS - 250, VS, y2, L('Baken 250 m', 'Beacons 250 m'), 'baken');
    if (S.pzb && !n) s += dim(P.ES - 250, P.ES, y2, '500 Hz: 250 m', 'pzb500');
    s += dim(bu2Pos(S), bu1Pos(S), y2, '250 m', 'bue2');
    if (!n) {
      s += dim(P.ES, P.W1, y3, L('Durchrutschweg ≈200 m', 'Overlap ≈200 m'), 'dw');
      s += dim(P.A, P.W2, y3, L('Durchrutschweg', 'Overlap'), 'dw2');
    }
    s += dim(el1vPos(S), P.EL1, y2, `El 1v → El 1: ${b / 2} m ${L('(halber Bremsweg)', '(half braking distance)')}`, 'elabst');
    s += dim(ne6Pos(S), P.HPT, y1, `${L('Ne 6 → Haltepunkt', 'Ne 6 → halt')}: ${P.HPT - ne6Pos(S)} m`, 'ne6abst');
    if (!n) s += dim(P.A, P.BK1, y4, `Block 1: ${P.BK1 - P.A} m`, 'blk') + dim(P.BK1, P.BK2, y4, `Block 2: ${P.BK2 - P.BK1} m`, 'blk') + dim(P.BK2, P.BK3, y4, `Block 3: ${P.BK3 - P.BK2} m`, 'blk');
  }
  return s;
}

/** Short aspect label shown next to a legend entry. */
export function aspectLabel(S: LineState, k: string, A: Aspects, lang: Lang): string {
  if (k === 'bue1') return S.bue === 'ok' ? 'Bü 1' : 'Bü 0';
  if (isNeben(S)) return '';
  const m = ({ vs: A.vs, es: A.es, aus: A.ausMain, aus2: A.ausSide, bk1: A.bk[0]?.a, bk2: A.bk[1]?.a, bk3: A.bk[2]?.a } as Record<string, string | undefined>)[k];
  if (!m) return '';
  const name = m === 'Ks1b' ? (lang === 'de' ? 'Ks 1 blinkend' : 'Ks 1 flashing') : m === 'dunkel' ? pick({ de: 'dunkel', en: 'dark' }, lang) : m.replace(/^([A-Za-z]+)(\d)/, '$1 $2');
  return name + (k === 'es' && A.zs ? ' + Zs ' + A.zs.slice(1) : '');
}
