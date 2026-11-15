import { useState } from 'react';
import { tx, useLang } from '../../i18n';
import { recipes, type RecipeKey } from '../../features/build/recipes';
import type { BuildState, Owned } from '../../features/build/shared';
import { BuildInputs, Schema, StepList, type StepRow } from './fields';

export default function RecipesTab({ B, set, owned }: { B: BuildState; set: (p: Partial<BuildState>) => void; owned: Owned }) {
  const { t } = useLang();
  const [key, setKey] = useState<RecipeKey>('einfahrt');
  const all = recipes(B);
  const r = all[key];
  const rows: StepRow[] = [...r.s].sort((p, q) => p[0] - q[0]).map(([m, part, name, note, alt]) => ({ m, part, name, note, alt }));
  return (
    <div className="rlay">
      <nav className="side rlist" aria-label={t(tx('Bau-Rezepte', 'Build recipes'))}>
        {(Object.keys(all) as RecipeKey[]).map((k) => (
          <button key={k} type="button" className={k === key ? 'on' : undefined} aria-pressed={k === key} onClick={() => setKey(k)}>{t(all[k].t)}</button>
        ))}
      </nav>
      <div>
        <div className="panel" style={{ marginBottom: 16 }}>
          <BuildInputs B={B} set={set} withBlock={key === 'ausfahrt' || key === 'block'} />
        </div>
        <div className="panel">
          <h2 style={{ margin: '0 0 4px' }}>{t(r.t)}</h2>
          <p className="note" style={{ margin: '0 0 14px', fontSize: 14 }}>
            {t(r.d)} {t(tx('Positionen relativ zu:', 'Positions relative to:'))} <b>{t(r.ref)}</b> (0 m). {t(tx('Negativ = davor, positiv = dahinter in Fahrtrichtung.', 'Negative = before, positive = after in the direction of travel.'))}
          </p>
          <Schema rows={rows} owned={owned} />
          <StepList rows={rows} B={B} owned={owned} />
        </div>
      </div>
    </div>
  );
}
