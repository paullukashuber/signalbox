import { useState } from 'react';
import { tx, useLang, type Tx } from '../i18n';
import { Seg } from '../components/Seg';
import { Fig } from '../components/Svg';
import { K, ksSig, ne1, ne2Only, pic, screen, zsSide } from '../signals/draw';

type Mode = 'gwb' | 'ohne';
type Item = { t: Tx; look: Tx; why: Tx; where: Tx; d: string };

const ITEMS = (mode: Mode): Record<string, Item> => ({
  gg_aus: mode === 'gwb'
    ? { t: tx('Ausfahrsignal mit Zs 6', 'Exit signal with Zs 6'), look: tx('Ks 1 (grün) und darüber bzw. daneben der Gegengleisanzeiger Zs 6.', 'Ks 1 (green) with the opposite-track indicator Zs 6 above or beside it.'), why: tx('Fahrt; der Fahrweg führt in das Streckengleis entgegen der gewöhnlichen Fahrtrichtung.', 'Clear; the route leads onto the line track against the normal direction.'), where: tx('Am Ausfahrsignal vor der Weichenverbindung. Zs 6 kann auch allein stehen.', 'At the exit signal before the crossover. Zs 6 can also stand alone.'), d: ksSig('Ks1', '', '', false) + `<g transform="translate(26 0)">${screen(-10, 0, 20, 22, 3)}<path d="M-4 18 V12 L4 7 V3" fill="none" stroke="${K.w}" stroke-width="2.4"/></g>` }
    : { t: tx('Ausfahrsignal mit Zs 8', 'Exit signal with Zs 8'), look: tx('Hp 0 und blinkendes Gegengleisfahrt-Ersatzsignal Zs 8 (bei der DB wie Zs 1, aber blinkend).', 'Hp 0 and the flashing opposite-track substitute signal Zs 8 (at DB like Zs 1 but flashing).'), why: tx('Am Halt zeigenden Hauptsignal auf mündlichen oder fernmündlichen Auftrag vorbeifahren; der Fahrweg führt ins Gegengleis.', 'Pass the main signal at stop on a verbal or phone order; the route leads into the opposite track.'), where: tx('Am Ausfahrsignal. Ohne Zs 8 braucht der Zug einen schriftlichen Befehl.', 'At the exit signal. Without Zs 8 the train needs a written order.'), d: ksSig('Hp0', '', '', false) + `<g transform="translate(30 30)">${zsSide('zs1', true, true)}</g>` },
  gg_vs: { t: tx('Vorsignal für das Gegengleis', 'Distant signal for the opposite track'), look: tx('Ks-Vorsignal mit Ne 2.', 'Ks distant signal with Ne 2.'), why: tx('Kündigt das Einfahrsignal für Fahrten im Gegengleis an.', 'Announces the home signal for trains on the opposite track.'), where: tx('Im Bremswegabstand vor dem Einfahrsignal. Signale für das Gegengleis stehen in der Regel links von diesem Gleis, also außen.', 'One braking distance before the home signal. Signals for the opposite track usually stand to the left of it, i.e. on the outside.'), d: ksSig('Ks2', '', '', true) },
  gg_es: { t: tx('Einfahrsignal aus dem Gegengleis', 'Home signal from the opposite track'), look: tx('Ks-Hauptsignal mit Mastschild.', 'Ks main signal with mast plate.'), why: tx('Deckt den nächsten Bahnhof für Züge, die im Gegengleis ankommen.', 'Protects the next station for trains arriving on the opposite track.'), where: tx('Links vom Gegengleis. Steht ein Hauptsignal nicht unmittelbar rechts neben oder über seinem Gleis, kann die Schachbretttafel Ne 4 das kennzeichnen.', 'To the left of the opposite track. If a main signal is not directly to the right of or above its track, the chequerboard Ne 4 can mark this.'), d: ksSig('Hp0', '', '', false) },
  gg_ne2: { t: tx('Ne 2 im Gegengleis', 'Ne 2 on the opposite track'), look: tx('Vorsignaltafel ohne Signal.', 'Distant board without a signal.'), why: tx('Ersetzt auf dem linken Gleis von Hauptbahnen das Vorsignal und kündigt die Trapeztafel an.', 'Replaces the distant signal on the left track of main lines and announces the trapezoid board.'), where: tx('Im Bremswegabstand vor Ne 1.', 'One braking distance before Ne 1.'), d: ne2Only() },
  gg_ne1: { t: tx('Ne 1 im Gegengleis', 'Ne 1 on the opposite track'), look: tx('Trapeztafel (schematisch).', 'Trapezoid board (schematic).'), why: tx('Ersetzt auf dem linken Gleis von Hauptbahnen das Einfahrsignal. Hier hält der Zug, bis er die Erlaubnis zur Einfahrt hat.', 'Replaces the home signal on the left track of main lines. The train stops here until it has permission to enter.'), where: tx('Vor der Einfahrweiche des nächsten Bahnhofs.', 'Before the entry switch of the next station.'), d: ne1() },
  gg_regel: { t: tx('Blocksignal im Regelgleis', 'Block signal on the normal track'), look: tx('Ks-Hauptsignal.', 'Ks main signal.'), why: tx('Gilt nur für Züge im rechten Gleis in dieser Richtung.', 'Applies only to trains on the right-hand track in this direction.'), where: tx('Rechts vom Regelgleis – zum Vergleich mit den Signalen des Gegengleises.', 'To the right of the normal track – for comparison with the opposite-track signals.'), d: ksSig('Ks1', '', '', false) },
});

export default function OppositeTrack() {
  const { t, lang } = useLang();
  const L = (de: string, en: string) => (lang === 'de' ? de : en);
  const [mode, setMode] = useState<Mode>('gwb');
  const [sel, setSel] = useState('gg_aus');
  const items = ITEMS(mode);
  const UY = 120, LY = 210;
  const rails = (d: string) => `<path d="${d}" stroke="var(--track)" stroke-width="5" fill="none" opacity=".25"/><path d="${d}" stroke="var(--track)" stroke-width="2.2" fill="none"/>`;
  const placed = [
    { k: 'gg_aus', x: 180, below: true },
    { k: 'gg_regel', x: 640, below: true },
    ...(mode === 'gwb' ? [{ k: 'gg_vs', x: 620, below: false }, { k: 'gg_es', x: 1000, below: false }] : [{ k: 'gg_ne2', x: 620, below: false }, { k: 'gg_ne1', x: 1000, below: false }]),
  ];
  let s = `<text x="20" y="22" font-size="13" font-weight="500">${L('Fahrtrichtung', 'Direction of travel')} →</text>`;
  s += `<rect x="20" y="${LY + 14}" width="120" height="22" rx="3" fill="var(--plat)"/><text x="80" y="${LY + 29}" text-anchor="middle" font-size="11" style="fill:var(--mute)">${L('Bahnhof A', 'Station A')}</text><rect x="1060" y="${UY - 36}" width="120" height="22" rx="3" fill="var(--plat)"/><text x="1120" y="${UY - 21}" text-anchor="middle" font-size="11" style="fill:var(--mute)">${L('Bahnhof B', 'Station B')}</text>`;
  s += rails(`M20 ${UY}H1180`) + rails(`M20 ${LY}H1180`) + rails(`M230 ${LY}L320 ${UY}`);
  s += `<text x="820" y="${UY + 20}" text-anchor="middle" font-size="12" style="fill:var(--mute)">${L('linkes Gleis = Gegengleis', 'left track = opposite track')}</text><text x="820" y="${LY - 10}" text-anchor="middle" font-size="12" style="fill:var(--mute)">${L('rechtes Gleis = Regelgleis (für diese Richtung)', 'right track = normal track (for this direction)')}</text>`;
  s += `<path d="M120 ${LY - 8}H226 L316 ${UY - 8} H1040" fill="none" stroke="#378ADD" stroke-width="2" stroke-dasharray="6 4"/><polygon points="1040,${UY - 13} 1052,${UY - 8} 1040,${UY - 3}" fill="#378ADD"/><rect x="100" y="${LY - 6}" width="30" height="12" rx="3" fill="#378ADD"/>`;
  placed.forEach((it) => {
    const sc = 0.6, y = it.below ? LY + 14 : UY - 14 - 150 * sc;
    if (sel === it.k) s += `<rect x="${it.x - 34}" y="${y - 6}" width="${it.k === 'gg_aus' ? 96 : 68}" height="${150 * sc + 12}" rx="8" fill="none" stroke="var(--sel)" stroke-width="2" stroke-dasharray="5 4"/>`;
    s += `<g data-k="${it.k}" style="cursor:pointer" transform="translate(${it.x} ${y}) scale(${sc})"><rect x="-40" y="-6" width="100" height="160" fill="transparent"/>${items[it.k].d}</g>`;
  });
  const cur = items[sel] || items.gg_aus;
  const changeMode = (m: Mode) => {
    setMode(m);
    if (!['gg_aus', 'gg_regel'].includes(sel)) setSel(m === 'gwb' ? 'gg_vs' : 'gg_ne2');
  };
  return (
    <>
      <h1>{L('Fahrt ins Gegengleis', 'Running on the opposite track')}</h1>
      <p className="lead">
        {L(
          'Zweigleisige Strecke, Rechtsverkehr: Der Zug verlässt den Bahnhof über eine Weichenverbindung ins linke Gleis. Wie das signalisiert wird, hängt davon ab, ob das Gegengleis eigene Signale hat.',
          'Double-track line, right-hand running: the train leaves the station over a crossover onto the left track. How this is signalled depends on whether the opposite track has its own signals.',
        )}
      </p>
      <div className="ctl">
        <div className="grp">
          <span>{L('Ausrüstung des Gegengleises', 'Opposite track equipment')}</span>
          <Seg value={mode} onChange={changeMode} options={[
            { v: 'gwb', label: tx('Gleiswechselbetrieb (mit Signalen)', 'Bidirectional working (with signals)') },
            { v: 'ohne', label: tx('ohne Signale (Ne 2/Ne 1)', 'without signals (Ne 2/Ne 1)') },
          ]} />
        </div>
      </div>
      <div className="plan">
        <svg viewBox="0 0 1200 325" role="img" aria-label={L('Gegengleisfahrt', 'Opposite-track running')}
          onClick={(e) => { const k = (e.target as Element).closest('[data-k]')?.getAttribute('data-k'); if (k) setSel(k); }}
          dangerouslySetInnerHTML={{ __html: s }} />
      </div>
      <div className="lay">
        <div className="card">
          <p className="note" style={{ margin: 0, fontSize: 14 }}>
            {mode === 'gwb' ? (
              <><b>{L('Gleiswechselbetrieb:', 'Bidirectional working:')}</b> {L('Beide Gleise sind in beide Richtungen mit Signalen ausgerüstet. Das Ausfahrsignal zeigt Fahrt und den Gegengleisanzeiger Zs 6; im Gegengleis folgen eigene Vor- und Hauptsignale.', 'Both tracks are signalled in both directions. The exit signal shows clear and the opposite-track indicator Zs 6; the opposite track has its own distant and main signals.')}</>
            ) : (
              <><b>{L('Ohne Signale im Gegengleis:', 'Without signals on the opposite track:')}</b> {L('Das Ausfahrsignal bleibt auf Halt; der Zug fährt mit Zs 8 (oder schriftlichem Befehl) ins Gegengleis. Am nächsten Bahnhof ersetzen Ne 2 und Ne 1 Vor- und Einfahrsignal.', 'The exit signal stays at stop; the train enters the opposite track with Zs 8 (or a written order). At the next station Ne 2 and Ne 1 replace the distant and home signals.')}</>
            )}
          </p>
          <p className="hint">{L('Klicke ein Signal im Plan an.', 'Click a signal in the plan.')}</p>
          <div className="seg" style={{ marginTop: 10 }}>
            {placed.map((p) => (
              <button key={p.k} type="button" className={p.k === sel ? 'on' : undefined} onClick={() => setSel(p.k)}>{t(items[p.k].t)}</button>
            ))}
          </div>
        </div>
        <div className="card info" aria-live="polite">
          <h3>{t(cur.t)}</h3>
          <div className="pic"><Fig markup={pic(cur.d, 150, 175, 1.1, 65, 10)} /></div>
          <dl>
            <dt>{L('Aussehen', 'Appearance')}</dt><dd>{t(cur.look)}</dd>
            <dt>{L('Wofür', 'Purpose')}</dt><dd>{t(cur.why)}</dd>
            <dt>{L('Wo es steht', 'Where it stands')}</dt><dd>{t(cur.where)}</dd>
          </dl>
        </div>
      </div>
    </>
  );
}
