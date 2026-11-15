import { useState } from 'react';
import { tx, useLang } from '../../i18n';
import { Seg } from '../../components/Seg';
import { Fig } from '../../components/Svg';
import { pic } from '../../signals/draw';
import { icon, mini, owns, type BuildState, type Owned } from '../../features/build/shared';
import { SWITCH_RULES, scenarios, type Scenario, type ScenarioKey } from '../../features/build/switches';
import { RuleGrid } from './fields';

function plan(sc: Scenario, sel: number, B: BuildState, owned: Owned, dir: string): string {
  let s = `<text x="20" y="24" font-size="13" font-weight="500">${dir} →</text>`;
  sc.tr.forEach((d) => { s += `<path d="${d}" stroke="var(--track)" stroke-width="5" fill="none" opacity=".25"/><path d="${d}" stroke="var(--track)" stroke-width="2.2" fill="none"/>`; });
  sc.it.forEach(([x, y, pl, p], i) => {
    const ok = owns(owned, p), on = i === sel, scl = 0.5;
    if (pl === 'm') {
      s += `<g data-i="${i}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="13" fill="transparent"/><circle cx="${x}" cy="${y}" r="5" fill="${on ? 'var(--sel)' : ok ? 'var(--acc)' : 'var(--mute)'}"/><circle cx="${x + 14}" cy="${y - 14}" r="9" fill="${on ? 'var(--sel)' : 'var(--ink)'}"/><text x="${x + 14}" y="${y - 10.5}" text-anchor="middle" font-size="10" font-weight="600" style="fill:var(--panel)">${i + 1}</text></g>`;
      return;
    }
    const off = pl === 'b2' || pl === 't2' ? 26 : 0, below = pl[0] === 'b';
    const tx0 = x + off, ty = below ? y + 10 : y - 10 - 150 * scl;
    s += `<g data-i="${i}" style="cursor:pointer;opacity:${ok ? 1 : 0.3}" transform="translate(${tx0} ${ty}) scale(${scl})"><rect x="-30" y="-6" width="60" height="160" fill="transparent"/>${on ? '<rect x="-30" y="-8" width="60" height="164" rx="10" fill="none" stroke="var(--sel)" stroke-width="3" stroke-dasharray="7 5"/>' : ''}${icon(p, B.sys)}</g>`;
    const by = below ? y + 10 + 150 * scl + 10 : y - 10 - 150 * scl - 10;
    s += `<g data-i="${i}" style="cursor:pointer"><circle cx="${tx0}" cy="${by}" r="9" fill="${on ? 'var(--sel)' : 'var(--ink)'}"/><text x="${tx0}" y="${by + 3.5}" text-anchor="middle" font-size="10" font-weight="600" style="fill:var(--panel)">${i + 1}</text></g>`;
  });
  return s;
}

export default function SwitchesTab({ B, owned }: { B: BuildState; owned: Owned }) {
  const { t } = useLang();
  const [key, setKey] = useState<ScenarioKey>('abzw');
  const [sel, setSel] = useState(0);
  const all = scenarios(B);
  const sc = all[key];
  const i = sel < sc.it.length ? sel : 0;
  const it = sc.it[i];
  const ok = owns(owned, it[3]);
  return (
    <>
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3>{t(tx('Grundregeln für Weichen', 'Basic rules for switches'))}</h3>
        <RuleGrid rules={SWITCH_RULES} />
      </div>
      <Seg className="chips" value={key} onChange={(k) => { setKey(k); setSel(0); }}
        options={(Object.keys(all) as ScenarioKey[]).map((k) => ({ v: k, label: all[k].short }))} />
      <div className="plan" style={{ margin: '12px 0 6px' }}>
        <svg viewBox="0 0 1000 330" role="img" aria-label={t(sc.t)}
          onClick={(e) => { const d = (e.target as Element).closest('[data-i]')?.getAttribute('data-i'); if (d) setSel(+d); }}
          dangerouslySetInnerHTML={{ __html: plan(sc, i, B, owned, t(tx('Fahrtrichtung', 'Direction of travel'))) }} />
      </div>
      <div className="lay" style={{ marginTop: 12 }}>
        <div className="panel">
          <h2 style={{ margin: '0 0 6px' }}>{t(sc.t)}</h2>
          <p className="note" style={{ margin: '0 0 14px', fontSize: 14 }}>{t(sc.d)}</p>
          <ol className="steps">
            {sc.it.map(([, , , p, l, dsc], j) => (
              <li key={j} className={(owns(owned, p) ? '' : 'miss') + (j === i ? ' cur' : '')}>
                <button type="button" className="steprow" onClick={() => setSel(j)}>
                  <div className="pos" style={{ textAlign: 'center' }}>{j + 1}</div>
                  <div className="ic"><Fig markup={mini(icon(p, B.sys))} /></div>
                  <div className="t"><b>{t(l)}</b>{t(dsc) && <span>{t(dsc)}</span>}</div>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <aside className="panel info" aria-live="polite">
          <h3>{t(it[4])}</h3>
          <div className="pic"><Fig markup={pic(icon(it[3], B.sys), 130, 175, 1.1, 65, 10)} /></div>
          {t(it[5]) && <p style={{ margin: 0 }}>{t(it[5])}</p>}
          {!ok && (it[6] && owns(owned, it[6][0])
            ? <p className="alt" style={{ color: 'var(--acc)' }}>{t(tx('Ersatz', 'Substitute'))}: {t(it[6][1])}</p>
            : <p style={{ color: 'var(--acc)' }}>{t(tx('Dieses Bauteil ist in „Meine Bauteile“ nicht angehakt.', 'This part is not ticked in “My parts”.'))}</p>)}
          <p className="hint">
            {t(tx(
              `Signale stehen rechts in Fahrtrichtung: für → unterhalb, für ← oberhalb des Gleises. Abstände gelten für ${B.bw} m Bremsweg (einstellbar im Abstandsrechner).`,
              `Signals stand to the right in the direction of travel: below the track for →, above it for ←. Distances assume ${B.bw} m braking distance (set it in the distance calculator).`,
            ))}
          </p>
        </aside>
      </div>
    </>
  );
}
