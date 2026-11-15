import { useEffect, useMemo, useRef, useState } from 'react';
import { tx, useLang } from '../i18n';
import { Seg } from '../components/Seg';
import { Fig } from '../components/Svg';
import { pic } from '../signals/draw';
import {
  INITIAL, P, SECS, VH, X, aspects, bw, currentAspect, elements, events, isNeben, meaning, nm, speedAt, stopReason, trainY, vsPos,
  type LineState,
} from '../features/line/model';
import { aspectLabel, planMarkup, viewBox } from '../features/line/plan';
import { info } from '../features/line/info';

const NO_NEBEN = ['aus', 'aus2', 'pzb1000', 'pzb500', 'pzb2000', 'dw', 'dw2'];

export default function Line() {
  const { t, lang } = useLang();
  const L = (de: string, en: string) => (lang === 'de' ? de : en);
  const [S, setS] = useState<LineState>(INITIAL);
  const [speed, setSpeed] = useState(0);
  const [log, setLog] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trainRef = useRef<SVGRectElement>(null);
  const raf = useRef<number | null>(null);

  const stop = () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  };
  useEffect(() => stop, []);

  /** Update settings; any change stops a running train. */
  const set = (patch: Partial<LineState>) => {
    stop();
    setSpeed(0);
    setS((prev) => {
      const next = { ...prev, ...patch };
      if (isNeben(next)) {
        if (['hp2', 'z1', 'z7'].includes(next.es)) next.es = 'hp1';
        if (NO_NEBEN.includes(next.sel)) next.sel = 'es';
      }
      if (!next.pzb && next.sel.startsWith('pzb')) next.sel = 'es';
      return next;
    });
  };

  const markup = useMemo(() => planMarkup(S, lang), [S, lang]);
  const vb = viewBox(S);
  const A = aspects(S);
  const n = isNeben(S);
  const els = elements(S);
  const sec = SECS[S.sec];
  const card = info(S, S.sel, lang);

  // Reset the train whenever the plan changes.
  useEffect(() => {
    trainRef.current?.setAttribute('x', '-60');
    svgRef.current?.setAttribute('viewBox', `${vb.vx} 0 ${vb.vw} ${VH}`);
  }, [markup, vb.vx, vb.vw]);

  const onPlanClick = (e: React.MouseEvent) => {
    const k = (e.target as Element).closest('[data-k]')?.getAttribute('data-k');
    if (k) setS((p) => ({ ...p, sel: k }));
  };

  const run = () => {
    stop();
    const ev = events(S, lang);
    const lines: string[] = [];
    const out = () => setLog(lines.slice(-3).join('  ·  '));
    let m = 0, i = 0, last: number | null = null;
    const step = (time: number) => {
      const dt = last ? Math.min(0.05, (time - last) / 1000) : 0;
      last = time;
      const v = speedAt(S, m);
      if (v === 0) {
        setSpeed(0);
        lines.push(stopReason(S, m, lang));
        out();
        raf.current = null;
        return;
      }
      m += (Math.max(v, 6) / 3.6) * dt * 28;
      while (i < ev.length && m >= ev[i][0]) lines.push(ev[i++][1]);
      trainRef.current?.setAttribute('x', String(X(m) - 15));
      trainRef.current?.setAttribute('y', String(trainY(S, m) - 6));
      if (S.sec !== 'all') {
        let vx = X(m) - vb.vw * 0.35;
        vx = Math.max(X(0) - 20, Math.min(vx, X(P.END) + 20 - vb.vw));
        svgRef.current?.setAttribute('viewBox', `${vx} 0 ${vb.vw} ${VH}`);
      }
      setSpeed(Math.round(v));
      out();
      if (m < P.END) raf.current = requestAnimationFrame(step);
      else {
        lines.push(L('Strecke frei', 'Line clear'));
        out();
        setSpeed(0);
        raf.current = null;
      }
    };
    raf.current = requestAnimationFrame(step);
  };

  // "Currently shows" line for signals
  const cur = currentAspect(S.sel, A);
  let showing = '';
  if (cur && !n) {
    showing = `${nm(cur, lang)} – ${meaning(cur, S.sys, lang)}`;
    if (S.sel === 'es' && A.zs3) showing += L(' + Zs 3 „4“ (40 km/h)', ' + Zs 3 “4” (40 km/h)');
    if (S.sel === 'es' && A.zs === 'z1') showing += L(' + Zs 1 (Ersatzsignal): am gestörten Signal ohne schriftlichen Befehl vorbeifahren', ' + Zs 1 (substitute signal): pass the failed signal without a written order');
    if (S.sel === 'es' && A.zs === 'z7') showing += L(' + Zs 7 (Vorsichtsignal): vorbeifahren, auf Sicht bis zum nächsten Hauptsignal', ' + Zs 7 (caution signal): pass, on sight up to the next main signal');
    if (S.sel === 'es' && A.esVr) showing += `; ${L('Vorsignal am Mast', 'distant signal on the mast')}: ${nm(A.esVr, lang)}`;
    if ((S.sel === 'aus' || S.sel === 'aus2') && A.ausVr && (S.sys === 'form' || S.sys === 'licht'))
      showing += `; ${L('Vorsignal für Bk 1 am Mast', 'distant signal for Bk 1 on the mast')}: ${nm(cur === 'Hp0' ? (S.sys === 'licht' ? 'dunkel' : 'Vr0') : A.ausVr, lang)}`;
    if (/^bk/.test(S.sel) && (S.sys === 'form' || S.sys === 'licht')) showing += `; ${L('Vorsignal am Mast', 'distant signal on the mast')}: ${nm(A.bk[+S.sel[2] - 1].vr, lang)}`;
  }

  const legendNote = (k: string, m: number) => {
    const VS = vsPos(S);
    const extra: Record<string, string> = {
      vs: L(` · ${P.ES - m} m vor ${n ? 'Ne 1' : 'Einfahrsignal'}`, ` · ${P.ES - m} m before ${n ? 'Ne 1' : 'the home signal'}`),
      baken: L(` · 250/175/100 m vor ${n ? 'Ne 2' : 'Vorsignal'}`, ` · 250/175/100 m before ${n ? 'Ne 2' : 'the distant signal'}`),
      lf6: L(` · ${bw(S)} m vor Lf 7`, ` · ${bw(S)} m before Lf 7`),
      bue1: L(` · ${bw(S)} m vor dem Bahnübergang`, ` · ${bw(S)} m before the crossing`),
      bue2: L(' · 250 m vor dem Bü-Signal', ' · 250 m before the Bü signal'),
    };
    const pos = k === 'baken' ? `${VS - 250} / ${VS - 175} / ${VS - 100} m` : `${m} m`;
    return `${L('Position', 'Position')} ${pos}${extra[k] || ''}`;
  };

  return (
    <>
      <h1>{t(tx('Wo welches Signal steht', 'Where each signal stands'))}</h1>
      <p className="lead">
        {t(tx(
          'Eine Strecke von der Einfahrt in einen Bahnhof über drei Blockabschnitte bis zum Haltepunkt. Wähle einen Abschnitt, klicke ein Element an oder lass den Zug fahren.',
          'A line from the entry into a station through three block sections to a halt. Pick a section, click an element or let the train run.',
        ))}
      </p>
      <div className="bar">
        <Seg
          className="chips"
          label={L('Abschnitt', 'Section')}
          value={S.sec}
          onChange={(sec) => set({ sec })}
          options={[
            { v: 'bf', label: tx('Einfahrt & Bahnhof', 'Entry & station') },
            { v: 'blk', label: tx('Blockstrecke', 'Block sections') },
            { v: 'bue', label: tx('Bahnübergang & Fahrleitung', 'Crossing & catenary') },
            { v: 'hpt', label: tx('Haltepunkt', 'Halt') },
            { v: 'all', label: tx('Gesamt', 'Whole line') },
          ]}
        />
        <div className="run">
          <span className="speed" aria-live="polite">{speed} km/h</span>
          <button type="button" className="go" onClick={run}>▶ {t(tx('Zug fahren lassen', 'Run the train'))}</button>
        </div>
      </div>
      <div className="plan">
        <svg ref={svgRef} viewBox={`${vb.vx} 0 ${vb.vw} ${VH}`} role="img" aria-label={L('Streckenplan mit Signalen', 'Line plan with signals')} onClick={onPlanClick}>
          <g dangerouslySetInnerHTML={{ __html: markup }} />
          <rect ref={trainRef} x={-60} y={0} width={30} height={12} rx={3} fill="#378ADD" />
        </svg>
      </div>
      <p className="log">{log ?? t(tx('Signale stehen rechts vom Gleis – in dieser Draufsicht also unterhalb.', 'Signals stand to the right of the track – below it in this top view.'))}</p>
      <div className="lay">
        <div className="panel">
          <h3>{t(tx('Einstellungen', 'Settings'))}</h3>
          <div className="set">
            <span>{t(tx('Signalsystem', 'Signalling system'))}</span>
            <Seg value={S.sys} onChange={(sys) => set({ sys })} options={[
              { v: 'form', label: tx('Form H/V', 'Semaphore H/V') },
              { v: 'licht', label: tx('Licht H/V (Hv 69)', 'Light H/V (Hv 69)') },
              { v: 'hl', label: 'Hl' }, { v: 'ks', label: 'Ks' }, { v: 'sk', label: 'Sk' },
              { v: 'neben', label: tx('Nebenbahn Ne 1/Ne 2', 'Branch line Ne 1/Ne 2') },
            ]} />
            <span>{t(tx('Strecke', 'Line'))}</span>
            <Seg value={S.line} onChange={(line) => set({ line })} options={[
              { v: 'haupt', label: tx('Hauptbahn · 1000 m', 'Main line · 1000 m') },
              { v: 'neben', label: tx('Nebenbahn · 700 m', 'Branch line · 700 m') },
            ]} />
            <span>{t(tx('Einfahrsignal', 'Home signal'))}</span>
            <Seg value={S.es} onChange={(es) => set({ es })} options={[
              { v: 'hp0', label: n ? tx('Keine Zulassung', 'No permission') : tx('Halt', 'Stop') },
              { v: 'hp1', label: n ? tx('Zulassung', 'Permission') : tx('Fahrt', 'Clear') },
              { v: 'hp2', label: tx('Abzweigend 40', 'Diverging 40'), disabled: n },
              { v: 'z1', label: tx('Gestört + Zs 1', 'Failed + Zs 1'), disabled: n },
              { v: 'z7', label: tx('Gestört + Zs 7', 'Failed + Zs 7'), disabled: n },
            ]} />
            <span>{t(tx('Ausfahrsignal', 'Exit signal'))}</span>
            <Seg value={S.aus} onChange={(aus) => set({ aus })} options={[
              { v: 'halt', label: tx('Halt', 'Stop'), disabled: n },
              { v: 'fahrt', label: tx('Fahrt', 'Clear'), disabled: n },
            ]} />
            <span>{t(tx('Zug 2 auf der Strecke', 'Train 2 on the line'))}</span>
            <Seg value={S.occ} onChange={(occ) => set({ occ })} options={[
              { v: 0, label: tx('keiner', 'none'), disabled: n },
              { v: 1, label: tx('in Block 1', 'in block 1'), disabled: n },
              { v: 2, label: tx('in Block 2', 'in block 2'), disabled: n },
              { v: 3, label: tx('in Block 3', 'in block 3'), disabled: n },
            ]} />
            <span>{t(tx('Bahnübergang', 'Level crossing'))}</span>
            <Seg value={S.bue} onChange={(bue) => set({ bue })} options={[
              { v: 'ok', label: tx('gesichert', 'protected') },
              { v: 'stoer', label: tx('gestört', 'failed') },
            ]} />
            <span>{t(tx('Haltepunkt', 'Halt'))}</span>
            <Seg value={S.hpt} onChange={(hpt) => set({ hpt })} options={[
              { v: 'durch', label: tx('durchfahren', 'pass through') },
              { v: 'halt', label: tx('halten', 'stop') },
            ]} />
            <span>{t(tx('Anzeige', 'Show'))}</span>
            <div className="chk">
              <label><input type="checkbox" checked={S.night} onChange={(e) => set({ night: e.target.checked })} /> {t(tx('Nachtzeichen (Form)', 'Night aspects (semaphore)'))}</label>
              <label><input type="checkbox" checked={S.pzb} onChange={(e) => set({ pzb: e.target.checked })} /> {t(tx('PZB-Magnete', 'PZB magnets'))}</label>
              <label><input type="checkbox" checked={S.dim} onChange={(e) => set({ dim: e.target.checked })} /> {t(tx('Maße', 'Dimensions'))}</label>
            </div>
          </div>
          <details className="els">
            <summary>{t(tx('Elemente in diesem Abschnitt', 'Elements in this section'))}</summary>
            <ul className="legend">
              {els.filter((e) => !e.hide && e.m >= sec[0] && e.m <= sec[1]).map((e) => {
                const al = aspectLabel(S, e.k, A, lang);
                return (
                  <li key={e.k} className={e.k === S.sel ? 'on' : undefined}>
                    <button type="button" className="lg" onClick={() => setS((p) => ({ ...p, sel: e.k }))}>
                      <span className="num">{e.n}</span>
                      <span>
                        <b>{t(e.lab)}</b>
                        {al && <> – <span className="code">{al}</span></>}
                        <small>{legendNote(e.k, e.m)}</small>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </details>
          <p className="hint">{t(tx('Die Signalbilder sind vereinfacht gezeichnet; Lampenanordnungen sind angenähert.', 'Signal drawings are simplified; lamp layouts are approximate.'))}</p>
        </div>
        <aside className="panel info" aria-live="polite">
          {card && (
            <>
              <h3>{card.t}</h3>
              {card.d && <div className="pic"><Fig markup={pic(card.d, 130, 175, 1.15, 65, 12)} /></div>}
              <dl>
                {showing && (<><dt>{t(tx('Zeigt gerade', 'Currently shows'))}</dt><dd>{showing}</dd></>)}
                <dt>{t(tx('Aussehen', 'Appearance'))}</dt><dd>{card.look}</dd>
                <dt>{t(tx('Wofür', 'Purpose'))}</dt><dd>{card.why}</dd>
                <dt>{t(tx('Wo es steht', 'Where it stands'))}</dt><dd>{card.where}</dd>
              </dl>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
