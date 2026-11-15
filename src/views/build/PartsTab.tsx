import { tx, useLang } from '../../i18n';
import { Fig } from '../../components/Svg';
import { PARTS, icon, mini, type BuildState, type Owned } from '../../features/build/shared';

export default function PartsTab({ B, owned, setOwned }: { B: BuildState; owned: Owned; setOwned: (o: Owned) => void }) {
  const { t } = useLang();
  const all = (v: boolean) => setOwned(Object.fromEntries(PARTS.flatMap(([, ps]) => ps.map(([k]) => [k, v]))));
  return (
    <div className="panel">
      <p className="note" style={{ margin: '0 0 18px', fontSize: 14 }}>
        {t(tx('Hake an, welche Signale und Tafeln du im Spiel hast. Rechner und Rezepte blenden fehlende Bauteile aus oder schlagen Ersatz vor. Die Auswahl wird in diesem Browser gespeichert.', 'Tick the signals and boards you have in the game. The calculator and recipes grey out missing parts or suggest substitutes. Your choice is saved in this browser.'))}
      </p>
      <div className="parts">
        {PARTS.map(([g, ps]) => (
          <div key={g.de}>
            <h3>{t(g)}</h3>
            {ps.map(([k, l]) => (
              <label key={k}>
                <input type="checkbox" checked={owned[k] !== false} onChange={(e) => setOwned({ ...owned, [k]: e.target.checked })} />
                <Fig markup={mini(icon(k, B.sys), 0.38)} />
                {t(l)}
              </label>
            ))}
          </div>
        ))}
      </div>
      <p style={{ margin: '20px 0 0', display: 'flex', gap: 8 }}>
        <button type="button" className="go ghost" onClick={() => all(true)}>{t(tx('Alle an', 'Select all'))}</button>
        <button type="button" className="go ghost" onClick={() => all(false)}>{t(tx('Alle aus', 'Clear all'))}</button>
      </p>
    </div>
  );
}
