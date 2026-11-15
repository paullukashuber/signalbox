import { useState } from 'react';
import { tx, useLang } from '../i18n';
import { Seg } from '../components/Seg';
import { load, save } from '../lib/storage';
import { BUILD_DEFAULTS, type BuildState, type Owned } from '../features/build/shared';
import CalcTab from './build/CalcTab';
import RecipesTab from './build/RecipesTab';
import SwitchesTab from './build/SwitchesTab';
import SpeedsTab from './build/SpeedsTab';
import PartsTab from './build/PartsTab';
import PlannerTab from './build/PlannerTab';

type Tab = 'calc' | 'rez' | 'wei' | 'spd' | 'plan' | 'parts';

export default function Build() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>('calc');
  const [B, setB] = useState<BuildState>(() => ({ ...BUILD_DEFAULTS, ...load<Partial<BuildState>>('sig-build', {}) }));
  const [owned, setOwnedState] = useState<Owned>(() => load<Owned>('sig-parts', {}));
  const set = (p: Partial<BuildState>) => setB((prev) => {
    const next = { ...prev, ...p };
    save('sig-build', next);
    return next;
  });
  const setOwned = (o: Owned) => {
    setOwnedState(o);
    save('sig-parts', o);
  };
  return (
    <>
      <h1>{t(tx('Bauhilfe für den Nachbau', 'Building guide'))}</h1>
      <p className="lead">
        {t(tx(
          'Für Transport Fever 3 und andere Simulationen: Abstände ausrechnen, typische Situationen Schritt für Schritt aufbauen und nur die Bauteile verwenden, die du wirklich hast.',
          'For Transport Fever 3 and other simulators: work out distances, build typical situations step by step and use only the parts you actually have.',
        ))}
      </p>
      <Seg className="sub3" value={tab} onChange={setTab} label={t(tx('Bereich', 'Area'))} options={[
        { v: 'calc', label: tx('Abstandsrechner', 'Distance calculator') },
        { v: 'rez', label: tx('Bau-Rezepte', 'Build recipes') },
        { v: 'wei', label: tx('Weichen & Anschlüsse', 'Switches & sidings') },
        { v: 'spd', label: tx('Geschwindigkeiten', 'Speeds') },
        { v: 'plan', label: tx('Mein Streckenplan', 'My line plan') },
        { v: 'parts', label: tx('Meine Bauteile', 'My parts') },
      ]} />
      {tab === 'calc' && <CalcTab B={B} set={set} owned={owned} />}
      {tab === 'rez' && <RecipesTab B={B} set={set} owned={owned} />}
      {tab === 'wei' && <SwitchesTab B={B} owned={owned} />}
      {tab === 'spd' && <SpeedsTab B={B} set={set} owned={owned} />}
      {tab === 'plan' && <PlannerTab B={B} owned={owned} />}
      {tab === 'parts' && <PartsTab B={B} owned={owned} setOwned={setOwned} />}
    </>
  );
}
