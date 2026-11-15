import * as D from '../../signals/draw';
import { tx, type Tx } from '../../i18n';
import { R, overlapFor } from '../../rules';
import { SWITCHES, curveSpeed, hlStep, icon, type BuildState, type BuildSys } from './shared';

export type SigView = { svg: string; name: Tx; zs?: boolean };

/** How a main signal shows speed v in each system. */
export function speedMain(v: number, sys: BuildSys): SigView {
  const z = String(v / 10);
  if (sys === 'form' || sys === 'licht') {
    const withZs = v !== R.speed.hp2Default;
    return {
      svg: sys === 'form' ? D.formHp('Hp2') : D.hvHp('Hp2'),
      name: tx('Hp 2 Langsamfahrt' + (withZs ? ` + Zs 3 „${z}“` : ''), 'Hp 2 slow speed' + (withZs ? ` + Zs 3 “${z}”` : '')),
      zs: withZs,
    };
  }
  if (sys === 'ks') return { svg: D.ksSig('Ks1', z), name: tx(`Ks 1 + Zs 3 „${z}“ (weiße Ziffer)`, `Ks 1 + Zs 3 “${z}” (white number)`) };
  const st = hlStep(v), c = st === 100 ? 'Hl2' : st === 60 ? 'Hl3b' : 'Hl3a';
  const strip = st === 100 ? tx('grüner', 'green') : st === 60 ? tx('gelber', 'yellow') : tx('ohne', 'no');
  return { svg: D.hlSig(c), name: tx(`${c.replace('Hl', 'Hl ')} – ${strip.de} Lichtstreifen = ${st} km/h`, `${c.replace('Hl', 'Hl ')} – ${strip.en} light strip = ${st} km/h`) };
}

/** How the distant signal announces speed v. */
export function speedDistant(v: number, sys: BuildSys): SigView {
  const z = String(v / 10);
  if (sys === 'form' || sys === 'licht') {
    const de = 'Vr 2 Langsamfahrt erwarten' + (v !== R.speed.hp2Default ? ` + Zs 3v „${z}“` : '');
    const en = 'Vr 2 expect slow speed' + (v !== R.speed.hp2Default ? ` + Zs 3v “${z}”` : '');
    return { svg: sys === 'form' ? D.formVr('Vr2') : D.hvVr('Vr2'), name: tx(de, en) };
  }
  if (sys === 'ks') return { svg: D.ksSig('Ks1b', '', z, true), name: tx(`Ks 1 blinkend + Zs 3v „${z}“ (gelbe Ziffer)`, `Ks 1 flashing + Zs 3v “${z}” (yellow number)`) };
  const st = hlStep(v);
  return st === 100
    ? { svg: D.hlSig('Hl4', true), name: tx('Hl 4 – grün blinkend: 100 km/h erwarten', 'Hl 4 – flashing green: expect 100 km/h') }
    : { svg: D.hlSig('Hl7', true), name: tx('Hl 7 – gelb blinkend: 40 oder 60 km/h erwarten', 'Hl 7 – flashing yellow: expect 40 or 60 km/h') };
}

export const SPEED_RULES: [Tx, Tx][] = [
  [tx('Senken gilt ab dem Signal', 'A reduction applies from the signal'), tx('Zs 3, Hp 2, Lf 7 und Lf 2 gelten ab dem Signal. Der Zug muss davor schon langsam genug sein – deshalb steht die Ankündigung (Vorsignal mit Vr 2 / Zs 3v, Lf 6, Lf 1) einen Bremsweg vorher.', 'Zs 3, Hp 2, Lf 7 and Lf 2 apply from the signal. The train must already be slow enough there – which is why the warning (distant with Vr 2 / Zs 3v, Lf 6, Lf 1) stands one braking distance before.')],
  [tx('Erhöhen erst mit dem Zugschluss', 'Increase only once the rear has passed'), tx('Die Geschwindigkeit aus Zs 3 oder Hp 2 gilt im anschließenden Weichenbereich, bis die letzte Achse ihn verlassen hat – auch wenn dahinter mehr erlaubt ist. Bei Erhöhungen an Lf 7 rechnet der Planer genauso; die Schweiz schreibt das ausdrücklich vor.', 'The speed from Zs 3 or Hp 2 applies through the following switches until the last axle has left them – even if more is allowed beyond. The planner treats increases at Lf 7 the same way; Switzerland prescribes this explicitly.')],
  [tx('Hp 2 ohne Zs 3 = 40 km/h', 'Hp 2 without Zs 3 = 40 km/h'), tx('Langsamfahrt bedeutet 40 km/h, sofern kein Zs 3 und kein Fahrplan etwas anderes sagt. Für 50, 60, 80 … km/h braucht ein H/V-Signal einen Zs 3.', 'Slow speed means 40 km/h unless a Zs 3 or the timetable says otherwise. For 50, 60, 80 … km/h an H/V signal needs a Zs 3.')],
  [tx('Erhöhung ohne Ankündigung', 'Increases are not announced'), tx('Steigt die Geschwindigkeit, steht nur ein Lf 7 mit dem höheren Wert – ohne Lf 6 davor. Am Ende einer vorübergehenden Langsamfahrstelle steht Lf 3.', 'When the speed rises there is only an Lf 7 with the higher value – no Lf 6 before it. A temporary restriction ends with Lf 3.')],
  [tx('Hl kennt nur drei Stufen', 'Hl only has three steps'), tx('Unterer gelber Lichtpunkt ohne Streifen = 40, mit gelbem Lichtstreifen = 60, mit grünem = 100 km/h. Andere Werte (50, 80) zeigt Hl auf die nächstniedrigere Stufe.', 'Lower yellow light without strip = 40, with a yellow light strip = 60, with a green one = 100 km/h. Other values (50, 80) are shown at the next lower step.')],
  [tx('Grenzen der Strecke (EBO § 40)', 'Line limits (EBO § 40)'), tx('Reisezüge: bis 160 km/h mit Zugbeeinflussung (PZB), bis 250 km/h mit Linienzugbeeinflussung (LZB/ETCS). Nebenbahnen: höchstens 100 km/h, sonst 80. Güterzüge: 120 bzw. 80 km/h. Über 100 km/h ist Zugbeeinflussung Pflicht.', 'Passenger trains: up to 160 km/h with train protection (PZB), up to 250 km/h with continuous train control (LZB/ETCS). Branch lines: at most 100 km/h, otherwise 80. Freight trains: 120 or 80 km/h. Above 100 km/h train protection is mandatory.')],
];

export type PlanItem = { m: number; svg: string; name: Tx; note: Tx; part: string };
export type SpeedPlan = {
  end: number; dx: number; allowed: number[]; head: number[]; driven: number[];
  items: PlanItem[]; zones: [number, number, Tx][]; vDiv: number;
};

/** Example line with speed profile: station A → curve → work site → station B. */
export function speedPlan(B: BuildState): SpeedPlan {
  const vmax = B.vmax, bw = B.bw, zl = B.zl, [wn, vW, lw] = SWITCHES[B.wt];
  const vB = Math.min(vmax, curveSpeed(B.r, B.u, B.uf)), lfv = Math.min(vmax, B.lfv), vDiv = Math.min(vW, vmax);
  const acc = 0.35, dec = Math.pow(vmax / 3.6, 2) / (2 * bw);
  const accDist = (v1: number, v2: number) => (Math.pow(v2 / 3.6, 2) - Math.pow(v1 / 3.6, 2)) / (2 * acc);
  const WA = 120, wEnd = WA + lw;
  let x = wEnd + zl + accDist(vDiv, vmax);
  const B0 = Math.round((x + bw + 600) / 50) * 50, BL = 600;
  x = B0 + BL + zl + (vB < vmax ? accDist(vB, vmax) : 0);
  const L0 = Math.round((x + bw + 600) / 50) * 50, LL = 400;
  x = L0 + LL + zl + (lfv < vmax ? accDist(lfv, vmax) : 0);
  const E = Math.round((x + bw + 800) / 50) * 50, dw = overlapFor(vDiv), END = E + dw + lw + 400;
  const segs: [number, number, number][] = [[0, wEnd, vDiv], [B0, B0 + BL, vB], [L0, L0 + LL, lfv], [E, END, vDiv]];
  const lim = (m: number, ext: boolean) => {
    let v = vmax;
    segs.forEach(([a, b, s]) => { if (m >= a && m <= b + (ext && s < vmax && b < END ? zl : 0)) v = Math.min(v, s); });
    return v;
  };
  const dx = 10, N = Math.ceil(END / dx), allowed: number[] = [], head: number[] = [];
  for (let i = 0; i <= N; i++) { allowed.push(lim(i * dx, true)); head.push(lim(i * dx, false)); }
  const ms = allowed.map((v) => v / 3.6), drv = new Array<number>(N + 1);
  drv[N] = ms[N];
  for (let i = N - 1; i >= 0; i--) drv[i] = Math.min(ms[i], Math.sqrt(drv[i + 1] * drv[i + 1] + 2 * dec * dx));
  let v = 0;
  for (let i = 0; i <= N; i++) { v = Math.min(drv[i], i ? Math.sqrt(v * v + 2 * acc * dx) : 0); drv[i] = v * 3.6; }

  const H = speedMain(vDiv, B.sys), V = speedDistant(vDiv, B.sys), z = vDiv / 10;
  const items: PlanItem[] = [];
  items.push({ m: 0, svg: H.svg, name: tx('Ausfahrsignal Bahnhof A', 'Exit signal station A'), note: tx(`Ausfahrt ins abzweigende Gleis über Weiche ${wn}: ${H.name.de}. Gilt bis der Zugschluss die letzte Weiche (Weichenende ≈ ${Math.round(wEnd)} m) verlassen hat.`, `Departure onto the diverging track over switch ${wn}: ${H.name.en}. Applies until the rear of the train has left the last switch (switch end ≈ ${Math.round(wEnd)} m).`), part: 'hs' });
  if (H.zs) items.push({ m: 0, svg: D.zs2(String(z)), name: tx('Zs 3 am Ausfahrsignal', 'Zs 3 at the exit signal'), note: tx(`Kennziffer ${z} = ${vDiv} km/h.`, `Number ${z} = ${vDiv} km/h.`), part: 'zs3' });
  items.push({ m: WA, svg: icon('weiche', B.sys), name: tx('Ausfahrweiche', 'Exit switch'), note: tx(`${wn}: ${vW} km/h im abzweigenden Strang.`, `${wn}: ${vW} km/h on the diverging route.`), part: 'weiche' });
  if (vB < vmax) {
    items.push({ m: B0 - bw, svg: D.lf6(vB / 10), name: tx('Lf 6 Ankündigung', 'Lf 6 warning'), note: tx(`Bremsweg (${bw} m) vor dem Bogen: ${vB} km/h kommt.`, `One braking distance (${bw} m) before the curve: ${vB} km/h ahead.`), part: 'lf67' });
    items.push({ m: B0, svg: D.lf7(vB / 10), name: tx('Lf 7 Bogenanfang', 'Lf 7 curve start'), note: tx(`Ab hier ${vB} km/h (Radius ${B.r} m).`, `${vB} km/h from here (radius ${B.r} m).`), part: 'lf7' });
    items.push({ m: B0 + BL, svg: D.lf7(vmax / 10), name: tx('Lf 7 Bogenende', 'Lf 7 curve end'), note: tx(`Wieder ${vmax} km/h – beschleunigen, wenn der Zugschluss (${zl} m) vorbei ist. Keine Ankündigung nötig.`, `Back to ${vmax} km/h – accelerate once the rear (${zl} m) has passed. No warning needed.`), part: 'lf7' });
  }
  if (lfv < vmax) {
    items.push({ m: L0 - bw, svg: D.lf1(lfv / 10), name: tx('Lf 1 Langsamfahrscheibe', 'Lf 1 warning board'), note: tx(`Bremsweg vor der Baustelle, Kennziffer ${lfv / 10}.`, `One braking distance before the work site, number ${lfv / 10}.`), part: 'lf13' });
    items.push({ m: L0, svg: D.lf2(), name: tx('Lf 2 Anfangscheibe', 'Lf 2 start board'), note: tx(`Ab hier ${lfv} km/h.`, `${lfv} km/h from here.`), part: 'lf2' });
    items.push({ m: L0 + LL, svg: D.lf3(), name: tx('Lf 3 Endscheibe', 'Lf 3 end board'), note: tx('Ende der Langsamfahrstelle; Erhöhung erst mit dem Zugschluss.', 'End of the restriction; increase only once the rear has passed.'), part: 'lf3' });
  }
  items.push({ m: E - bw, svg: V.svg, name: tx('Vorsignal Bahnhof B', 'Distant signal station B'), note: tx(V.name.de + '.', V.name.en + '.'), part: 'vs' });
  items.push({ m: E, svg: H.svg, name: tx('Einfahrsignal Bahnhof B', 'Home signal station B'), note: tx(`${H.name.de}. Der Zug muss hier schon auf ${vDiv} km/h abgebremst haben.`, `${H.name.en}. The train must already be down to ${vDiv} km/h here.`), part: 'hs' });
  if (H.zs) items.push({ m: E, svg: D.zs2(String(z)), name: tx('Zs 3 am Einfahrsignal', 'Zs 3 at the home signal'), note: tx('', ''), part: 'zs3' });
  items.push({ m: E + dw, svg: icon('weiche', B.sys), name: tx('Einfahrweiche', 'Entry switch'), note: tx(`Durchrutschweg ≈ ${dw} m hinter dem Einfahrsignal.`, `Overlap ≈ ${dw} m behind the home signal.`), part: 'weiche' });
  const zones: [number, number, Tx][] = [];
  if (vB < vmax) zones.push([B0, B0 + BL, tx(`Bogen r = ${B.r} m`, `Curve r = ${B.r} m`)]);
  if (lfv < vmax) zones.push([L0, L0 + LL, tx('Baustelle', 'Work site')]);
  return { end: END, dx, allowed, head, driven: drv, items, zones, vDiv };
}
