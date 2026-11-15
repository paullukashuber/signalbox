import { tx, type Tx } from '../../i18n';
import { R as DEFAULT, clearanceFor, distantOnMast, ne6Before, overlapFor, type RuleProfile } from '../../rules';
import { curveSpeed, hlStep, owns, partName, type Owned } from '../build/shared';
import { speedDistant, speedMain } from '../build/speeds';
import type { Junction, LinePlan, PlacedItem, PlanEl, PlanResult, Station, Warning } from './types';

type MainKind = 'es' | 'aus' | 'bk' | 'abzw';
type Main = { id: string; m: number; kind: MainKind; name: Tx; src: string; div?: number };

/** Replacements offered when a part is missing (as in the build recipes). */
const ALTS: Record<string, [string, Tx]> = {
  vs: ['ne2', tx('Ne 2 allein als Bremspunkt', 'Ne 2 alone as braking point')],
  ms: ['hs', tx('Einfaches Hauptsignal mit Vorsignal am Mast', 'Plain main signal with distant on the mast')],
  hs: ['ms', tx('Mehrabschnittssignal', 'Multi-section signal')],
  shl: ['shf', tx('Formsperrsignal', 'Semaphore shunting signal')],
};

const km = (m: number) => (m / 1000).toFixed(3).replace('.', ',');
const kmEn = (m: number) => (m / 1000).toFixed(3);
const KM = (m: number) => tx(`km ${km(m)}`, `km ${kmEn(m)}`);

/** Generates every signal and board for a line plan (one direction of travel). Pure function. */
export function generate(plan: LinePlan, owned: Owned = {}, P: RuleProfile = DEFAULT): PlanResult {
  const items: PlacedItem[] = [];
  const warnings: Warning[] = [];
  const bw = P.brake[plan.cls], vmax = plan.vmax, sys = plan.sys, multi = sys === 'ks' || sys === 'hl';
  const B = P.boards, gz = clearanceFor(plan.n, P), gap = P.clearance.signalGap.v;
  const hsPart = multi ? 'ms' : 'hs';
  const els = [...plan.elements].sort((a, b) => start(a) - start(b));
  const warn = (w: Warning) => warnings.push(w);
  const add = (it: Omit<PlacedItem, 'game' | 'guide'> & { guide?: boolean }) => items.push({ guide: false, ...it, game: it.m * plan.f });
  const brakeRule = tx(`Bremsweg ${bw} m`, `braking distance ${bw} m`);

  /* ---------- line-wide checks ---------- */
  const lim = P.speed.limits;
  if (vmax > lim.lzb) warn({ code: 'speed-max', text: tx(`Über ${lim.lzb} km/h sind nach EBO § 40 nicht vorgesehen.`, `EBO § 40 does not provide for more than ${lim.lzb} km/h.`) });
  else if (vmax > lim.pzb && plan.tc === 'pzb') warn({ code: 'speed-cab', text: tx(`Über ${lim.pzb} km/h braucht die Strecke LZB oder ETCS – PZB und Signale an der Strecke reichen nicht.`, `Above ${lim.pzb} km/h the line needs LZB or ETCS – PZB and lineside signals are not enough.`) });
  if (plan.cls !== 'haupt' && vmax > lim.branch) warn({ code: 'branch-speed', text: tx(`Nebenbahnen: höchstens ${lim.branch} km/h.`, `Branch lines: at most ${lim.branch} km/h.`) });

  /* ---------- stations and junctions → main signals ---------- */
  const stations = els.filter((e): e is Station => e.kind === 'bf');
  const mains: Main[] = [];
  stations.forEach((s) => {
    const dw = overlapFor(s.vein, P), es = s.from - dw, aus = s.to - gz - gap;
    const div = s.sw !== null ? Math.min(P.switches[s.sw]?.div ?? vmax, vmax) : undefined;
    if (aus <= s.from) warn({ code: 'station-short', m: s.from, src: s.id, text: tx(`Bahnhof ${s.name}: zu kurz – Ausfahrsignal läge vor der Einfahrweiche.`, `Station ${s.name}: too short – the exit signal would stand before the entry switch.`) });
    mains.push({ id: `${s.id}:es`, m: es, kind: 'es', name: tx(`Einfahrsignal ${s.name}`, `Home signal ${s.name}`), src: s.id, div });
    mains.push({ id: `${s.id}:aus`, m: aus, kind: 'aus', name: tx(`Ausfahrsignal ${s.name}`, `Exit signal ${s.name}`), src: s.id });
    add({ id: `${s.id}:ra10`, m: s.from - B.ra10BeforeSwitch.v, part: 'ra10', name: tx('Rangierhalttafel Ra 10', 'Ra 10 shunting limit board'), rule: tx(`Vor der Einfahrweiche (${B.ra10BeforeSwitch.v} m), gilt für Rangierfahrten Richtung Strecke`, `Before the entry switch (${B.ra10BeforeSwitch.v} m), applies to shunting towards the line`), guide: true, src: s.id });
    add({ id: `${s.id}:w1`, m: s.from, part: 'weiche', name: tx(`Einfahrweiche ${s.name}`, `Entry switch ${s.name}`), rule: tx(`Durchrutschweg ${dw} m hinter dem Einfahrsignal (Einfahrt mit ${s.vein} km/h)`, `Overlap ${dw} m behind the home signal (entry at ${s.vein} km/h)`), guide: true, src: s.id, aspect: div !== undefined ? tx(`abzweigend ${div} km/h`, `diverging ${div} km/h`) : undefined });
    add({ id: `${s.id}:ne5`, m: aus - B.ne5BeforeExit.v, part: 'ne5', name: tx('Haltetafel Ne 5', 'Ne 5 stop marker'), rule: tx(`Halteplatz der Zugspitze, ≈ ${B.ne5BeforeExit.v} m vor dem Ausfahrsignal`, `Stopping point, ≈ ${B.ne5BeforeExit.v} m before the exit signal`), guide: true, src: s.id });
    add({ id: `${s.id}:ra12`, m: s.to - gz, part: 'ra12', name: tx('Grenzzeichen', 'Clearance marker'), rule: tx(`${gap} m hinter dem Ausfahrsignal, ≈ ${P.clearance.perGradient} m × ${plan.n} vor dem Weichenmittelpunkt`, `${gap} m after the exit signal, ≈ ${P.clearance.perGradient} m × ${plan.n} before the switch centre`), guide: true, src: s.id });
    add({ id: `${s.id}:w2`, m: s.to, part: 'weiche', name: tx(`Ausfahrweiche ${s.name} (Mitte)`, `Exit switch ${s.name} (centre)`), rule: tx('Weichenmittelpunkt', 'Switch centre'), src: s.id });
    if (div !== undefined && sys === 'hl' && hlStep(div) !== div) warn({ code: 'hl-step', m: es, src: s.id, text: tx(`Hl zeigt ${div} km/h nicht an – das Einfahrsignal zeigt ${hlStep(div)} km/h.`, `Hl cannot show ${div} km/h – the home signal shows ${hlStep(div)} km/h.`) });
  });
  stations.forEach((a, i) => stations.slice(i + 1).forEach((b) => {
    if (b.from - overlapFor(b.vein, P) < a.to) warn({ code: 'overlap', m: b.from, src: b.id, text: tx(`Bahnhöfe ${a.name} und ${b.name} überschneiden sich.`, `Stations ${a.name} and ${b.name} overlap.`) });
  }));

  const inStation = (m: number) => stations.find((s) => m >= s.from - overlapFor(s.vein, P) && m <= s.to);
  els.filter((e): e is Junction => e.kind === 'abzw').forEach((j) => {
    const st = inStation(j.at);
    if (st) {
      warn({ code: 'junction-in-station', m: j.at, src: j.id, text: tx(`Abzweig ${j.name} liegt im Bahnhof ${st.name} – als abzweigende Weiche des Bahnhofs planen.`, `Junction ${j.name} lies inside station ${st.name} – plan it as the station's diverging switch.`) });
      return;
    }
    const dw = overlapFor(vmax, P), div = Math.min(P.switches[j.sw]?.div ?? vmax, vmax);
    mains.push({ id: `${j.id}:sig`, m: j.at - dw, kind: 'abzw', name: tx(`Abzweigsignal ${j.name}`, `Junction signal ${j.name}`), src: j.id, div });
    add({ id: `${j.id}:w`, m: j.at, part: 'weiche', name: tx(`Weiche ${j.name} (Weichenanfang)`, `Switch ${j.name} (switch start)`), rule: tx(`Durchrutschweg ${dw} m hinter dem Abzweigsignal`, `Overlap ${dw} m behind the junction signal`), guide: true, src: j.id, aspect: tx(`abzweigend ${div} km/h`, `diverging ${div} km/h`) });
    add({ id: `${j.id}:ra12`, m: j.at + gz + gap, part: 'ra12', name: tx('Grenzzeichen', 'Clearance marker'), rule: tx('Für Züge aus dem Abzweig; Gleismitten 3,50 m auseinander', 'For trains from the branch; track centres 3.50 m apart'), guide: true, src: j.id });
    if (sys === 'hl' && hlStep(div) !== div) warn({ code: 'hl-step', m: j.at, src: j.id, text: tx(`Hl zeigt ${div} km/h nicht an – das Signal zeigt ${hlStep(div)} km/h.`, `Hl cannot show ${div} km/h – the signal shows ${hlStep(div)} km/h.`) });
  });
  mains.sort((a, b) => a.m - b.m);

  /* ---------- automatic block division ---------- */
  const blocks: Main[] = [];
  mains.forEach((a, i) => {
    const b = mains[i + 1];
    if (!b || a.kind === 'es' || b.kind === 'aus') return;
    const L = b.m - a.m;
    if (L < bw * P.block.minFactor) {
      warn({ code: 'block-short', m: a.m, src: a.src, text: tx(`Block zwischen ${a.name.de} und ${b.name.de} ist ${Math.round(L)} m lang – kürzer als der Bremsweg (${bw} m).`, `Block between ${a.name.en} and ${b.name.en} is ${Math.round(L)} m – shorter than the braking distance (${bw} m).`) });
      return;
    }
    const n = Math.max(1, Math.min(Math.round(L / plan.block), Math.floor(L / (bw * P.block.minFactor))));
    for (let k = 1; k < n; k++) {
      blocks.push({ id: `${a.id}:bk${k}`, m: Math.round(a.m + (L * k) / n), kind: 'bk', name: tx(`Blocksignal Bk ${k} (hinter ${a.name.de})`, `Block signal Bk ${k} (after ${a.name.en})`), src: a.src });
    }
  });
  mains.push(...blocks);
  mains.sort((a, b) => a.m - b.m);

  /* ---------- main signals with distants, PZB and masts ---------- */
  const needDistant = vmax > P.distant.requiredAbove;
  mains.forEach((M, i) => {
    const prev = mains[i - 1];
    const div = M.div !== undefined && M.div < vmax ? M.div : undefined;
    const H = div !== undefined ? speedMain(div, sys) : undefined;
    add({ id: M.id, m: M.m, part: hsPart, name: M.name, aspect: mainAspect(sys, H?.name), rule: mainRule(M, P, plan), guide: M.kind === 'es' || M.kind === 'abzw', src: M.src });
    if (H && (H.zs || sys === 'ks')) add({ id: `${M.id}:zs3`, m: M.m, part: 'zs3', name: tx(`Zs 3 „${div! / 10}“`, `Zs 3 “${div! / 10}”`), aspect: tx(`${div} km/h im abzweigenden Strang`, `${div} km/h on the diverging route`), rule: tx('Geschwindigkeit gilt ab dem Signal bis der Zugschluss die Weichen verlassen hat', 'Speed applies from the signal until the rear has left the switches'), src: M.src });
    add({ id: `${M.id}:pzb2000`, m: M.m - P.pzb.hz2000BeforeMain, part: 'pzb', name: tx('PZB 2000 Hz', 'PZB 2000 Hz'), rule: tx('Am Hauptsignal, rechter Schienenstrang', 'At the main signal, right-hand rail'), src: M.src });
    add({ id: `${M.id}:pzb500`, m: M.m - P.pzb.hz500BeforeMain, part: 'pzb', name: tx('PZB 500 Hz', 'PZB 500 Hz'), rule: tx(`${P.pzb.hz500BeforeMain} m vor dem Hauptsignal`, `${P.pzb.hz500BeforeMain} m before the main signal`), src: M.src });
    if (plan.electric) add({ id: `${M.id}:flt`, m: M.m - B.markedMastsBefore.v, part: 'flt', name: tx('Drei markierte Fahrleitungsmaste', 'Three marked catenary masts'), rule: tx('Die letzten drei Maste vor dem Hauptsignal', 'The last three masts before the main signal'), guide: true, src: M.src });

    const D = div !== undefined ? speedDistant(div, sys) : undefined;
    const L = prev ? M.m - prev.m : Infinity;
    if (prev && distantOnMast(L, bw, P)) {
      // previous main signal announces this one
      if (L < bw * (1 - P.distant.shortenTol)) warn({ code: 'distant-before-main', m: prev.m, src: M.src, text: tx(`Das Vorsignal für ${M.name.de} müsste ${Math.round(bw - L)} m vor ${prev.name.de} stehen. Es kommt an dessen Mast; der verkürzte Vorsignalabstand (${Math.round(L)} m) muss gekennzeichnet werden.`, `The distant for ${M.name.en} would have to stand ${Math.round(bw - L)} m before ${prev.name.en}. It goes on that mast; the shortened distance (${Math.round(L)} m) must be marked.`) });
      if (!multi) add({ id: `${M.id}:vs`, m: prev.m, part: 'vs', name: tx(`Vorsignal für ${M.name.de} am Mast von ${prev.name.de}`, `Distant for ${M.name.en} on the mast of ${prev.name.en}`), aspect: distantAspect(sys, D?.name), rule: tx(`Block ${Math.round(L)} m ≤ ${P.distant.onMastFactor.v} × ${bw} m: Vorsignal am Mast des vorherigen Hauptsignals`, `Block ${Math.round(L)} m ≤ ${P.distant.onMastFactor.v} × ${bw} m: distant on the mast of the previous main signal`), guide: true, src: M.src });
      add({ id: `${M.id}:pzb1000`, m: prev.m - P.pzb.hz1000BeforeDistant, part: 'pzb', name: tx('PZB 1000 Hz', 'PZB 1000 Hz'), rule: tx('Am Vorsignal', 'At the distant signal'), src: M.src });
      return;
    }
    const vm = M.m - bw;
    const board = !needDistant;
    add({
      id: `${M.id}:vs`, m: vm, part: board ? 'ne2' : 'vs',
      name: board ? tx(`Vorsignaltafel Ne 2 für ${M.name.de}`, `Ne 2 distant board for ${M.name.en}`) : tx(`${distantName(sys).de} für ${M.name.de}`, `${distantName(sys).en} for ${M.name.en}`),
      aspect: board ? undefined : distantAspect(sys, D?.name),
      rule: board ? tx(`Höchstens ${P.distant.requiredAbove} km/h: Ne 2 am Bremspunkt genügt (${bw} m)`, `At most ${P.distant.requiredAbove} km/h: Ne 2 at the braking point suffices (${bw} m)`) : tx(`${bw} m vor dem Hauptsignal (Bremsweg, EBO)`, `${bw} m before the main signal (braking distance, EBO)`),
      src: M.src,
    });
    if (!board) add({ id: `${M.id}:pzb1000`, m: vm - P.pzb.hz1000BeforeDistant, part: 'pzb', name: tx('PZB 1000 Hz', 'PZB 1000 Hz'), rule: tx('Am Vorsignal', 'At the distant signal'), src: M.src });
    P.distant.beacons.forEach((d, k) => add({ id: `${M.id}:ne3-${3 - k}`, m: vm - d, part: 'ne3', name: tx(`Vorsignalbake (${3 - k} Streifen)`, `Distant beacon (${3 - k} stripe${3 - k > 1 ? 's' : ''})`), rule: tx(`${d} m vor dem Vorsignal`, `${d} m before the distant signal`), src: M.src }));
  });

  /* ---------- other elements ---------- */
  els.forEach((e) => {
    switch (e.kind) {
      case 'hpt':
        add({ id: `${e.id}:ne6`, m: e.at - ne6Before(bw, P), part: 'ne6', name: tx(`Haltepunkttafel Ne 6 ${e.name}`, `Ne 6 halt board ${e.name}`), rule: tx(`${ne6Before(bw, P)} m vor dem Haltepunkt; nur wenn er schwer zu erkennen ist`, `${ne6Before(bw, P)} m before the halt; only if it is hard to see`), guide: true, src: e.id });
        add({ id: `${e.id}:ne5`, m: e.at, part: 'ne5', name: tx(`Haltetafel Ne 5 ${e.name}`, `Ne 5 stop marker ${e.name}`), rule: tx('Am Bahnsteigende (Halteplatz)', 'At the platform end (stopping point)'), src: e.id });
        break;
      case 'curve': {
        const v = Math.min(vmax, curveSpeed(e.r, e.u, plan.uf));
        if (v <= 0) { warn({ code: 'curve-too-tight', m: e.from, src: e.id, text: tx(`Bogen bei ${KM(e.from).de}: Radius ${e.r} m ist zu eng.`, `Curve at ${KM(e.from).en}: radius ${e.r} m is too tight.`) }); break; }
        if (v >= vmax) break;
        const rule = tx(`v = √(r / ${P.curve.k} · (u + uf)) = √(${e.r} / ${P.curve.k} · (${e.u} + ${plan.uf})), abgerundet: ${v} km/h`, `v = √(r / ${P.curve.k} · (u + uf)) = √(${e.r} / ${P.curve.k} · (${e.u} + ${plan.uf})), rounded down: ${v} km/h`);
        add({ id: `${e.id}:lf6`, m: e.from - bw * B.lf6Factor, part: 'lf67', name: tx('Lf 6 Geschwindigkeitsankündigung', 'Lf 6 speed warning'), aspect: tx(`Kennziffer ${v / 10}`, `number ${v / 10}`), rule: tx(`${brakeRule.de} vor dem Bogen`, `${brakeRule.en} before the curve`), src: e.id });
        add({ id: `${e.id}:lf7`, m: e.from, part: 'lf7', name: tx('Lf 7 Bogenanfang', 'Lf 7 curve start'), aspect: tx(`Kennziffer ${v / 10} = ${v} km/h`, `number ${v / 10} = ${v} km/h`), rule, src: e.id });
        add({ id: `${e.id}:lf7e`, m: e.to, part: 'lf7', name: tx('Lf 7 Bogenende', 'Lf 7 curve end'), aspect: tx(`Kennziffer ${vmax / 10} = ${vmax} km/h`, `number ${vmax / 10} = ${vmax} km/h`), rule: tx('Erhöhung ohne Ankündigung; beschleunigen erst mit dem Zugschluss', 'Increase without warning; accelerate only once the rear has passed'), src: e.id });
        if (!owns(owned, 'lf67')) warn({ code: 'curve-no-lf', m: e.from, src: e.id, text: tx(`Bogen bei ${KM(e.from).de} braucht ${v} km/h statt ${vmax} km/h, aber Lf 6/Lf 7 fehlen in „Meine Bauteile“.`, `Curve at ${KM(e.from).en} needs ${v} km/h instead of ${vmax} km/h, but Lf 6/Lf 7 are missing from “My parts”.`) });
        break;
      }
      case 'bue': {
        if (e.secured) {
          const d1 = bw * B.bue1Factor.v;
          add({ id: `${e.id}:bue2`, m: e.at - d1 - B.bue2BeforeMonitor, part: 'bue2', name: tx('Rautentafel Bü 2', 'Bü 2 diamond board'), rule: tx(`${B.bue2BeforeMonitor} m vor dem Überwachungssignal`, `${B.bue2BeforeMonitor} m before the monitor signal`), src: e.id });
          add({ id: `${e.id}:bue1`, m: e.at - d1, part: 'bue1', name: tx('Überwachungssignal Bü 0/Bü 1', 'Bü 0/Bü 1 monitor signal'), aspect: tx('Bü 1 = gesichert, Bü 0 = Halt vor dem Übergang', 'Bü 1 = protected, Bü 0 = stop before the crossing'), rule: tx(`${d1} m vor dem Bahnübergang (${B.bue1Factor.note.de})`, `${d1} m before the crossing (${B.bue1Factor.note.en})`), guide: true, src: e.id });
        } else {
          add({ id: `${e.id}:bue4`, m: e.at - B.bue4Before.v, part: 'bue4', name: tx('Pfeiftafel Bü 4', 'Bü 4 whistle board'), rule: tx(`≈ ${B.bue4Before.v} m vor dem Übergang; ${B.bue4Before.note.de}`, `≈ ${B.bue4Before.v} m before the crossing; ${B.bue4Before.note.en}`), guide: true, src: e.id });
          add({ id: `${e.id}:bue5`, m: e.at - B.bue5Before.v, part: 'bue5', name: tx('Läutetafel Bü 5', 'Bü 5 bell board'), rule: tx(`≈ ${B.bue5Before.v} m vor dem Übergang; ${B.bue5Before.note.de}`, `≈ ${B.bue5Before.v} m before the crossing; ${B.bue5Before.note.en}`), guide: true, src: e.id });
        }
        add({ id: `${e.id}:x`, m: e.at, part: 'bue', name: tx('Bahnübergang mit Andreaskreuz', 'Level crossing with St Andrew’s cross'), rule: tx(e.secured ? 'Technisch gesichert' : 'Nicht technisch gesichert', e.secured ? 'Protected' : 'Unprotected'), src: e.id });
        break;
      }
      case 'el': {
        if (!plan.electric) warn({ code: 'not-electric', m: e.at, src: e.id, text: tx('Trennstelle auf einer Strecke ohne Fahrleitung.', 'Section break on a line without catenary.') });
        const half = bw * B.el1vFactor;
        if (e.type === 'schutz') {
          add({ id: `${e.id}:el1v`, m: e.at - half, part: 'el1v', name: tx('El 1v Ausschaltsignal erwarten', 'El 1v expect power off'), rule: tx(`Halber Bremsweg (${half} m) vor El 1`, `Half a braking distance (${half} m) before El 1`), src: e.id });
          add({ id: `${e.id}:el1`, m: e.at, part: 'el1', name: tx('El 1 Ausschaltsignal', 'El 1 power off'), rule: tx('Hauptschalter aus', 'Main breaker off'), src: e.id });
          add({ id: `${e.id}:el2`, m: e.at + B.el2After.v, part: 'el2', name: tx('El 2 Einschaltsignal', 'El 2 power on'), rule: tx(`≈ ${B.el2After.v} m, hinter der Trennstelle`, `≈ ${B.el2After.v} m, after the section break`), guide: true, src: e.id });
        } else {
          const el4 = e.at - B.el45;
          add({ id: `${e.id}:el3`, m: el4 - half, part: 'el3', name: tx('El 3 „Bügel ab“ erwarten', 'El 3 expect “pantograph down”'), rule: tx(`Halber Bremsweg (${half} m) vor El 4`, `Half a braking distance (${half} m) before El 4`), src: e.id });
          add({ id: `${e.id}:el4`, m: el4, part: 'el4', name: tx('El 4 „Bügel ab“', 'El 4 “pantograph down”'), rule: tx(`${B.el45} m vor dem Abschnitt ohne Fahrdraht`, `${B.el45} m before the section without contact wire`), src: e.id });
          add({ id: `${e.id}:el5`, m: e.at + e.len + B.el45, part: 'el5', name: tx('El 5 „Bügel an“', 'El 5 “pantograph up”'), rule: tx(`${B.el45} m hinter dem Abschnitt (${e.len} m lang)`, `${B.el45} m after the section (${e.len} m long)`), src: e.id });
        }
        break;
      }
      case 'lf': {
        const v = e.v;
        if (v >= vmax) { warn({ code: 'lf-not-slower', m: e.from, src: e.id, text: tx(`Langsamfahrstelle bei ${KM(e.from).de} ist nicht langsamer als die Strecke.`, `Temporary restriction at ${KM(e.from).en} is not slower than the line.`) }); break; }
        add({ id: `${e.id}:lf1`, m: e.from - bw * B.lf1Factor, part: 'lf13', name: tx('Lf 1 Langsamfahrscheibe', 'Lf 1 warning board'), aspect: tx(`Kennziffer ${v / 10}`, `number ${v / 10}`), rule: tx(`${brakeRule.de} vor der Langsamfahrstelle`, `${brakeRule.en} before the restriction`), src: e.id });
        add({ id: `${e.id}:lf2`, m: e.from, part: 'lf2', name: tx('Lf 2 Anfangscheibe', 'Lf 2 start board'), aspect: tx(`ab hier ${v} km/h`, `${v} km/h from here`), rule: tx('Beginn der Langsamfahrstelle', 'Start of the restriction'), src: e.id });
        add({ id: `${e.id}:lf3`, m: e.to, part: 'lf3', name: tx('Lf 3 Endscheibe', 'Lf 3 end board'), rule: tx('Ende; Erhöhung erst mit dem Zugschluss', 'End; increase only once the rear has passed'), src: e.id });
        break;
      }
    }
  });

  /* ---------- order, parts, position checks ---------- */
  items.sort((a, b) => a.m - b.m);
  const missing = new Map<string, number>();
  items.forEach((it) => {
    if (owns(owned, it.part)) return;
    it.missing = true;
    const a = ALTS[it.part];
    if (a) it.alt = { part: a[0], text: a[1], owned: owns(owned, a[0]) };
    if (!a || !owns(owned, a[0])) missing.set(it.part, (missing.get(it.part) || 0) + 1);
  });
  missing.forEach((count, part) => {
    if (part === 'lf67' || part === 'lf7') return; // reported per curve
    const nm = partName(part);
    warn({ code: 'missing-part', text: tx(`${count}× „${nm.de}“ fehlt in „Meine Bauteile“ und hat keinen Ersatz.`, `${count}× “${nm.en}” is missing from “My parts” and has no replacement.`) });
  });
  const first = items.find((it) => it.m < 0);
  if (first) warn({ code: 'before-start', m: first.m, src: first.src, text: tx(`${items.filter((it) => it.m < 0).length} Elemente liegen vor km 0 – Strecke dort verlängern oder alles verschieben.`, `${items.filter((it) => it.m < 0).length} items lie before km 0 – extend the line there or shift everything.`) });
  return { items, warnings };
}

function start(e: PlanEl): number {
  return 'from' in e ? e.from : e.at;
}

function distantName(sys: LinePlan['sys']): Tx {
  return sys === 'ks' ? tx('Ks-Vorsignal', 'Ks distant signal') : sys === 'hl' ? tx('Hl-Vorsignal', 'Hl distant signal') : tx('Vorsignal', 'Distant signal');
}

function mainAspect(sys: LinePlan['sys'], div?: Tx): Tx {
  const base = sys === 'ks' ? 'Hp 0 / Ks 1 / Ks 2' : sys === 'hl' ? 'Hp 0 / Hl 1 / Hl 10 …' : 'Hp 0 / Hp 1';
  return div ? tx(`${base}; abzweigend: ${div.de}`, `${base}; diverging: ${div.en}`) : tx(base, base);
}

function distantAspect(sys: LinePlan['sys'], div?: Tx): Tx {
  const base = sys === 'ks' ? 'Ks 1 / Ks 2' : sys === 'hl' ? 'Hl 1 / Hl 10' : 'Vr 0 / Vr 1';
  return div ? tx(`${base}; abzweigend: ${div.de}`, `${base}; diverging: ${div.en}`) : tx(base, base);
}

function mainRule(M: Main, P: RuleProfile, plan: LinePlan): Tx {
  switch (M.kind) {
    case 'es': return tx('Durchrutschweg vor der ersten Einfahrweiche (Richtwert nach Einfahrgeschwindigkeit)', 'Overlap before the first entry switch (guide value by entry speed)');
    case 'aus': return tx(`Vor dem Grenzzeichen der Ausfahrweiche (${P.clearance.signalGap.v} m)`, `Before the clearance marker of the exit switch (${P.clearance.signalGap.v} m)`);
    case 'abzw': return tx('Blockstelle vor der Weiche, mit Durchrutschweg', 'Block post before the switch, with overlap');
    case 'bk': return tx(`Automatische Blockteilung: Ziel ${plan.block} m, mindestens ${P.brake[plan.cls]} m (Bremsweg)`, `Automatic block division: target ${plan.block} m, at least ${P.brake[plan.cls]} m (braking distance)`);
  }
}
