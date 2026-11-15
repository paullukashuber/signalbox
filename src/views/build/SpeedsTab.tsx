import { tx, useLang } from '../../i18n';
import { Fig } from '../../components/Svg';
import * as D from '../../signals/draw';
import { SWITCHES, curveSpeed, decimal, hlStep, minRadius, mini, num, owns, type BuildState, type Owned } from '../../features/build/shared';
import { SPEED_RULES, speedDistant, speedMain, speedPlan, type SpeedPlan } from '../../features/build/speeds';
import { NumberField, RuleGrid, SelectField, StepList, type StepRow } from './fields';

function Profile({ P, B, owned }: { P: SpeedPlan; B: BuildState; owned: Owned }) {
  const { t } = useLang();
  const W = 1000, x0 = 46, x1 = W - 14, X = (m: number) => x0 + (m / P.end) * (x1 - x0);
  const vtop = Math.ceil((B.vmax + 10) / 20) * 20, yT = 26, yB = 206, Y = (v: number) => yB - (v / vtop) * (yB - yT);
  const path = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${X(i * P.dx).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const ty = 246;
  const used: { x: number; r: number }[] = [];
  const marks = P.items.map((it, i) => {
    const X0 = X(it.m);
    let row = 0;
    while (used.some((u) => u.r === row && Math.abs(u.x - X0) < 22)) row++;
    used.push({ x: X0, r: row });
    return { X0, row, own: owns(owned, it.part), i };
  });
  const h = ty + 30 + Math.max(...used.map((u) => u.r)) * 20;
  const ticks: number[] = [];
  for (let v = 0; v <= vtop; v += 20) ticks.push(v);
  return (
    <>
      <div className="legend-row">
        <span><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="var(--ink)" strokeWidth="1.6" strokeDasharray="6 4" /></svg> {t(tx('erlaubt an der Zugspitze', 'allowed at the head of the train'))}</span>
        <span><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="var(--mute)" strokeWidth="1.2" strokeDasharray="2 3" /></svg> {t(tx(`verlängert um die Zuglänge (${B.zl} m)`, `extended by the train length (${B.zl} m)`))}</span>
        <span><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="var(--acc)" strokeWidth="2.6" /></svg> {t(tx('gefahrene Geschwindigkeit', 'speed driven'))}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${h}`} width="100%" style={{ display: 'block' }} role="img" aria-label={t(tx('Geschwindigkeitsprofil', 'Speed profile'))}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={x0} y1={Y(v)} x2={x1} y2={Y(v)} stroke="var(--line)" />
            <text x={x0 - 6} y={Y(v) + 4} textAnchor="end" fontSize={11} style={{ fill: 'var(--mute)' }}>{v}</text>
          </g>
        ))}
        <text x={x0} y={14} fontSize={11.5} style={{ fill: 'var(--mute)' }}>km/h</text>
        {P.zones.map(([a, b, l], i) => (
          <g key={i}>
            <rect x={X(a)} y={yT} width={X(b) - X(a)} height={yB - yT} fill="var(--soft)" />
            <text x={(X(a) + X(b)) / 2} y={yT + 14} textAnchor="middle" fontSize={11} style={{ fill: 'var(--mute)' }}>{t(l)}</text>
          </g>
        ))}
        <path d={path(P.allowed)} fill="none" stroke="var(--mute)" strokeWidth={1.2} strokeDasharray="2 3" />
        <path d={path(P.head)} fill="none" stroke="var(--ink)" strokeWidth={1.6} strokeDasharray="6 4" />
        <path d={path(P.driven)} fill="none" stroke="var(--acc)" strokeWidth={2.6} />
        <line x1={x0} y1={ty} x2={x1} y2={ty} stroke="var(--track)" strokeWidth={3} />
        {marks.map(({ X0, row, own, i }) => (
          <g key={i}>
            <line x1={X0} y1={yT} x2={X0} y2={ty} stroke="var(--mute)" strokeWidth={0.5} opacity={0.5} />
            <circle cx={X0} cy={ty} r={4} fill={own ? 'var(--acc)' : 'var(--mute)'} />
            <circle cx={X0} cy={ty + 18 + row * 20} r={8.5} fill="var(--ink)" />
            <text x={X0} y={ty + 21.5 + row * 20} textAnchor="middle" fontSize={10} fontWeight={600} style={{ fill: 'var(--panel)' }}>{i + 1}</text>
          </g>
        ))}
      </svg>
    </>
  );
}

export default function SpeedsTab({ B, set, owned }: { B: BuildState; set: (p: Partial<BuildState>) => void; owned: Owned }) {
  const { t, lang } = useLang();
  const P = speedPlan(B);
  const [wn, vW] = SWITCHES[B.wt];
  const vB = curveSpeed(B.r, B.u, B.uf), rm = minRadius(B.vmax, B.u, B.uf), z = P.vDiv / 10;
  const warn: string[] = [];
  if (B.vmax > 160) warn.push(t(tx('Über 160 km/h brauchst du Führerraumsignalisierung (LZB oder ETCS); Lf-Tafeln und Zs 3 reichen nicht mehr.', 'Above 160 km/h you need cab signalling (LZB or ETCS); Lf boards and Zs 3 are no longer enough.')));
  if (B.bw < 1000 && B.vmax > 100) warn.push(t(tx('Mit 700 m oder 400 m Bremsweg (Nebenbahn) sind höchstens 100 km/h zulässig.', 'With 700 m or 400 m braking distance (branch line) at most 100 km/h is allowed.')));
  if (B.sys === 'hl' && ![40, 60, 100].includes(P.vDiv)) warn.push(t(tx(`Hl zeigt ${P.vDiv} km/h nicht an – das Signal zeigt ${hlStep(P.vDiv)} km/h.`, `Hl cannot show ${P.vDiv} km/h – the signal shows ${hlStep(P.vDiv)} km/h.`)));
  const rows: StepRow[] = P.items.map((it) => ({ m: it.m, part: it.part, name: it.name, note: it.note, svg: it.svg }));
  const SigCell = ({ svg, extra, label }: { svg: string; extra?: string; label: string }) => (
    <div className="sigcell">
      <div className="sky"><Fig markup={mini(svg)} /></div>
      {extra && <div className="sky"><Fig markup={mini(extra)} /></div>}
      <span>{label}</span>
    </div>
  );
  const sysRow = (k: BuildState['sys'], label: string) => {
    const h = speedMain(P.vDiv, k), v = speedDistant(P.vDiv, k);
    return (
      <tr key={k}>
        <td>{label}</td>
        <td><SigCell svg={v.svg} label={t(v.name)} /></td>
        <td><SigCell svg={h.svg} extra={h.zs ? D.zs2(String(z)) : undefined} label={t(h.name)} /></td>
      </tr>
    );
  };
  return (
    <>
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3>{t(tx('Woher kommt die Geschwindigkeit?', 'Where does the speed come from?'))}</h3>
        <p className="note" style={{ margin: '0 0 14px', fontSize: 14 }}>
          {t(tx('Ein Zug fährt immer das Niedrigste aus vier Grenzen: Strecke, Weichen, Bögen und das, was Signale und Tafeln zeigen. Signale erzeugen keine Geschwindigkeit – sie melden eine Grenze, die von der Strecke kommt.', 'A train always runs at the lowest of four limits: the line, switches, curves and what signals and boards show. Signals do not create a speed – they report a limit that comes from the track.'))}
        </p>
        <RuleGrid rules={SPEED_RULES} />
      </div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3>{t(tx('Planer', 'Planner'))}</h3>
        <div className="calc">
          <NumberField label={t(tx('Streckengeschwindigkeit (km/h)', 'Line speed (km/h)'))} value={B.vmax} min={40} max={300} step={10} onChange={(vmax) => set({ vmax })} />
          <SelectField label={t(tx('Bremsweg der Strecke', 'Line braking distance'))} value={B.bw} onChange={(bw) => set({ bw, blk: Math.max(B.blk, bw) })}
            options={[[1000, t(tx('1000 m – Hauptbahn', '1000 m – main line'))], [700, t(tx('700 m – Nebenbahn', '700 m – branch line'))], [400, t(tx('400 m – langsame Strecke', '400 m – slow line'))]]} />
          <SelectField label={t(tx('Signalsystem', 'Signalling system'))} value={B.sys} onChange={(sys) => set({ sys })}
            options={[['form', t(tx('Form H/V', 'Semaphore H/V'))], ['licht', t(tx('Licht H/V', 'Light H/V'))], ['ks', 'Ks'], ['hl', 'Hl']]} />
          <SelectField label={t(tx('Weiche (Radius – Neigung)', 'Switch (radius – angle)'))} value={B.wt} onChange={(wt) => set({ wt })}
            options={SWITCHES.map(([n, v], i) => [i, `${n} → ${v} km/h`] as [number, string])} />
          <NumberField label={t(tx('Bogenradius (m)', 'Curve radius (m)'))} value={B.r} min={150} max={8000} step={50} onChange={(r) => set({ r })} />
          <NumberField label={t(tx('Überhöhung u (mm)', 'Cant u (mm)'))} value={B.u} min={0} max={160} step={10} onChange={(u) => set({ u })} />
          <NumberField label={t(tx('Überhöhungsfehlbetrag uf (mm)', 'Cant deficiency uf (mm)'))} value={B.uf} min={0} max={150} step={10} onChange={(uf) => set({ uf })} />
          <NumberField label={t(tx('Langsamfahrstelle (km/h)', 'Temporary restriction (km/h)'))} value={B.lfv} min={10} max={160} step={10} onChange={(lfv) => set({ lfv })} />
          <NumberField label={t(tx('Zuglänge (m)', 'Train length (m)'))} value={B.zl} min={20} max={740} step={10} onChange={(zl) => set({ zl })} />
        </div>
        {warn.map((w) => <p key={w} className="warn">{w}</p>)}
        <div className="sys tiles">
          <div className="tile">
            <div className="tl">{t(tx('Weiche abzweigend', 'Switch, diverging'))}</div>
            <div className="tv">{vW} km/h</div>
            <p className="note">{wn}. {t(tx(`Zs 3 „${vW / 10}“ am Signal davor.`, `Zs 3 “${vW / 10}” at the signal before it.`))}</p>
          </div>
          <div className="tile">
            <div className="tl">{t(tx('Bogen', 'Curve'))} r = {num(B.r, lang)} m</div>
            <div className="tv">{vB} km/h</div>
            <p className="note">v = √(r / 11,8 · (u + u<sub>f</sub>)), {t(tx('abgerundet auf 10.', 'rounded down to 10.'))} {vB >= B.vmax ? t(tx('Keine Tafel nötig.', 'No board needed.')) : t(tx(`Lf 6 / Lf 7 „${Math.min(vB, B.vmax) / 10}“ aufstellen.`, `Place Lf 6 / Lf 7 “${Math.min(vB, B.vmax) / 10}”.`))}</p>
          </div>
          <div className="tile">
            <div className="tl">{t(tx(`Radius für ${B.vmax} km/h`, `Radius for ${B.vmax} km/h`))}</div>
            <div className="tv">≥ {num(rm, lang)} m</div>
            <p className="note">{t(tx(`Mindestradius bei u = ${B.u} und uf = ${B.uf} mm. Größer bauen = keine Beschränkung.`, `Minimum radius at u = ${B.u} and uf = ${B.uf} mm. Build wider = no restriction.`))}</p>
          </div>
        </div>
        <h3 style={{ marginTop: 18 }}>{t(tx('Geschwindigkeitsprofil einer Beispielstrecke', 'Speed profile of an example line'))}</h3>
        <p className="note" style={{ margin: '0 0 6px', fontSize: 14 }}>{t(tx('Bahnhof A (Ausfahrt abzweigend) → Bogen → Baustelle → Bahnhof B (Einfahrt abzweigend). Bremsen und Anfahren sind vereinfacht gerechnet.', 'Station A (diverging departure) → curve → work site → station B (diverging entry). Braking and acceleration are simplified.'))}</p>
        <Profile P={P} B={B} owned={owned} />
        <div style={{ marginTop: 12 }}><StepList rows={rows} B={B} owned={owned} /></div>
        <p className="hint">{t(tx(`Positionen ab dem Ausfahrsignal von Bahnhof A. „Spiel“ = echter Wert × Maßstab aus dem Abstandsrechner (1 : ${decimal(Math.round(10 / B.f) / 10, 'de')}).`, `Positions from the exit signal of station A. “Game” = real value × the scale from the distance calculator (1 : ${decimal(Math.round(10 / B.f) / 10, 'en')}).`))}</p>
      </div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3>{t(tx(`So zeigt jedes System ${P.vDiv} km/h`, `How each system shows ${P.vDiv} km/h`))}</h3>
        <div className="tw">
          <table className="res sp">
            <thead>
              <tr><th>{t(tx('System', 'System'))}</th><th>{t(tx('Ankündigen (Vorsignal)', 'Announce (distant)'))}</th><th>{t(tx('Ab hier (Hauptsignal)', 'From here (main signal)'))}</th></tr>
            </thead>
            <tbody>
              {sysRow('form', t(tx('Form H/V', 'Semaphore H/V')))}
              {sysRow('licht', t(tx('Licht H/V', 'Light H/V')))}
              {sysRow('ks', 'Ks')}
              {sysRow('hl', 'Hl')}
              <tr>
                <td>{t(tx('Dauerhaft, freie Strecke', 'Permanent, open line'))}</td>
                <td><SigCell svg={D.lf6(z)} label={t(tx(`Lf 6 „${z}“ im Bremsweg davor`, `Lf 6 “${z}” one braking distance before`))} /></td>
                <td><SigCell svg={D.lf7(z)} label={t(tx(`Lf 7 „${z}“; Ende: Lf 7 mit höherem Wert`, `Lf 7 “${z}”; end: Lf 7 with the higher value`))} /></td>
              </tr>
              <tr>
                <td>{t(tx('Vorübergehend (Baustelle)', 'Temporary (work site)'))}</td>
                <td><SigCell svg={D.lf1(z)} label={t(tx(`Lf 1 „${z}“ im Bremsweg davor`, `Lf 1 “${z}” one braking distance before`))} /></td>
                <td><SigCell svg={D.lf2()} extra={D.lf3()} label={t(tx('Lf 2 Anfang, Lf 3 Ende', 'Lf 2 start, Lf 3 end'))} /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="hint">{t(tx('Faustregel: Signale melden Geschwindigkeiten im Bahnhof und an Abzweigen (wegen der Weichen). Tafeln melden sie auf der freien Strecke (wegen Bögen, Brücken oder Baustellen).', 'Rule of thumb: signals report speeds in stations and at junctions (because of the switches). Boards report them on the open line (because of curves, bridges or work sites).'))}</p>
      </div>
      <div className="lay" style={{ marginTop: 0 }}>
        <div className="panel">
          <h3>{t(tx('Weichen und ihre Geschwindigkeit', 'Switches and their speeds'))}</h3>
          <div className="tw">
            <table className="res">
              <thead><tr><th>{t(tx('Weiche (Radius – Neigung)', 'Switch (radius – angle)'))}</th><th>{t(tx('Abzweig', 'Diverging'))}</th><th>{t(tx('Länge ≈', 'Length ≈'))}</th></tr></thead>
              <tbody>{SWITCHES.map(([n, v, l]) => <tr key={n}><td>EW {n}</td><td>{v} km/h</td><td>{l} m</td></tr>)}</tbody>
            </table>
          </div>
          <p className="hint">{t(tx('Geradeaus (Stammgleis) sind die Weichen deutlich schneller, je nach Bauart 80 bis über 230 km/h. Die Abzweiggeschwindigkeit ergibt sich aus dem Radius – deshalb heißen Weichen nach ihm. Länge = Weichenanfang bis Weichenende, gerundet.', 'Straight through (main route) switches are much faster, 80 to over 230 km/h depending on the type. The diverging speed comes from the radius – which is why switches are named after it. Length = switch start to switch end, rounded.'))}</p>
        </div>
        <aside className="panel">
          <h3>{t(tx('Umsetzung in Transport Fever 3', 'Building it in Transport Fever 3'))}</h3>
          <ol className="tf">
            <li><b>{t(tx('Erst die Strecke, dann die Tafeln.', 'Track first, boards second.'))}</b> {t(tx('Im Spiel bestimmen Gleistyp, Kurvenradius und Weichen, wie schnell der Zug wirklich fährt. Tafeln und Zs 3 sind Anzeige – sie bremsen nur, wenn ein Mod das ausdrücklich kann.', 'In the game, track type, curve radius and switches decide how fast the train really runs. Boards and Zs 3 are display only – they only slow a train if a mod explicitly supports it.'))}</li>
            <li><b>{t(tx('Radien bewusst wählen.', 'Choose radii on purpose.'))}</b> {t(tx('Willst du keine Beschränkung, baue mindestens den Radius aus der Kachel oben. Wo es eng wird, plane die Beschränkung ein.', 'If you want no restriction, build at least the radius from the tile above. Where space is tight, plan the restriction in.'))}</li>
            <li><b>{t(tx('Wert im Spiel ablesen.', 'Read the value in the game.'))}</b> {t(tx('Fahr einen Zug durch und lies die tatsächliche Geschwindigkeit im Bogen ab. Auf 10 km/h abrunden – das ist die Kennziffer für Lf 6/Lf 7.', 'Run a train through and read the actual speed in the curve. Round down to 10 km/h – that is the number for Lf 6/Lf 7.'))}</li>
            <li><b>{t(tx('Tafeln an die Stelle, wo das Spiel bremst.', 'Boards where the game slows down.'))}</b> {t(tx('Lf 7 an den Bogenanfang, Lf 6 einen Bremsweg davor (im Spiel × Maßstab), Lf 7 mit dem höheren Wert ans Bogenende.', 'Lf 7 at the curve start, Lf 6 one braking distance before it (× scale in the game), Lf 7 with the higher value at the curve end.'))}</li>
            <li><b>{t(tx('Zs 3 passend zur Weiche.', 'Match Zs 3 to the switch.'))}</b> {t(tx('Die Ziffer am Signal vor der Weiche = Abzweiggeschwindigkeit der Weiche, abgerundet. Ohne Zs 3 nur dort, wo 40 km/h stimmen (Hp 2).', 'The number at the signal before the switch = the switch’s diverging speed, rounded down. Without Zs 3 only where 40 km/h is right (Hp 2).'))}</li>
            <li><b>{t(tx('Vorsignal nicht vergessen.', 'Don’t forget the distant signal.'))}</b> {t(tx('Wo das Hauptsignal eine Geschwindigkeit zeigt, kündigt das Vorsignal sie an (Vr 2, Zs 3v oder Hl-Blinklicht).', 'Where the main signal shows a speed, the distant signal announces it (Vr 2, Zs 3v or a flashing Hl light).'))}</li>
          </ol>
          <p className="hint">{t(tx('Wie genau Transport Fever 3 die Kurvengeschwindigkeit berechnet, ist hier nicht geprüft – daher der Schritt „im Spiel ablesen“.', 'How exactly Transport Fever 3 calculates curve speed has not been verified here – hence the “read the value in the game” step.'))}</p>
        </aside>
      </div>
    </>
  );
}
