import { useEffect, useMemo, useState } from 'react';
import { tx, useLang, type Tx } from '../../i18n';
import { Fig } from '../../components/Svg';
import { Seg } from '../../components/Seg';
import { load, save } from '../../lib/storage';
import { R } from '../../rules';
import { decimal, mini, num, type BuildState, type Owned } from '../../features/build/shared';
import { generate } from '../../features/planner/generate';
import { DEFAULT_PLAN, newElement, newId, sanitizePlan } from '../../features/planner/model';
import { bandMarkup, itemIcon } from '../../features/planner/band';
import type { ElKind, LinePlan, PlanEl } from '../../features/planner/types';
import { NumberField, ScaleField, SelectField } from './fields';

const PLAN_KEY = 'sig-plan', DONE_KEY = 'sig-plan-done';
type Done = Record<string, boolean>;

export const KINDS: [ElKind, Tx][] = [
  ['bf', tx('Bahnhof', 'Station')],
  ['hpt', tx('Haltepunkt', 'Halt')],
  ['abzw', tx('Abzweig', 'Junction')],
  ['curve', tx('Bogen', 'Curve')],
  ['bue', tx('Bahnübergang', 'Level crossing')],
  ['el', tx('Trennstelle', 'Section break')],
  ['lf', tx('Langsamfahrstelle', 'Speed restriction')],
];
const kindName = (k: ElKind) => KINDS.find(([v]) => v === k)![1];

/** Keeps only boolean ticks (storage and imports are untrusted). */
export function cleanDone(raw: unknown): Done {
  const out: Done = {};
  if (raw && typeof raw === 'object') Object.entries(raw).forEach(([k, v]) => { if (v === true) out[k] = true; });
  return out;
}

/** Kilometre input (shown as km with three decimals, stored as metres). */
function KmField({ label, value, onChange }: { label: string; value: number; onChange: (m: number) => void }) {
  const { lang } = useLang();
  const show = (m: number) => { const s = (m / 1000).toFixed(3); return lang === 'de' ? s.replace('.', ',') : s; };
  const [raw, setRaw] = useState(show(value));
  useEffect(() => setRaw(show(value)), [value, lang]);
  const commit = () => {
    const v = Number(raw.replace(',', '.'));
    if (raw.trim() === '' || !Number.isFinite(v)) return setRaw(show(value));
    const m = Math.max(0, Math.min(1000, v)) * 1000;
    setRaw(show(m));
    if (Math.round(m) !== value) onChange(Math.round(m));
  };
  return (
    <label>
      {label}
      <input type="text" inputMode="decimal" value={raw} onChange={(e) => setRaw(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} />
    </label>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label>
      {label}
      <input type="text" maxLength={60} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function ElementEditor({ e, update, remove }: { e: PlanEl; update: (p: Partial<PlanEl>) => void; remove: () => void }) {
  const { t } = useLang();
  const swOpts = R.switches.map((w, i) => [i, `${w.name} → ${w.div} km/h`] as [number, string]);
  const title = t(kindName(e.kind)) + ('name' in e && e.name ? ` ${e.name}` : '');
  const K = (de: string, en: string) => t(tx(de, en));
  return (
    <fieldset className="pl-el" data-kind={e.kind}>
      <legend>{title}</legend>
      <div className="calc">
        {'name' in e && <TextField label={K('Name', 'Name')} value={e.name} onChange={(name) => update({ name })} />}
        {e.kind === 'bf' && <>
          <KmField label={K('km Anfang (erste Einfahrweiche)', 'km start (first entry switch)')} value={e.from} onChange={(from) => update({ from })} />
          <KmField label={K('km Ende (Ausfahrweiche, Mitte)', 'km end (exit switch, centre)')} value={e.to} onChange={(to) => update({ to })} />
          <NumberField label={K('Einfahrgeschwindigkeit (km/h)', 'Entry speed (km/h)')} value={e.vein} min={20} max={160} step={10} onChange={(vein) => update({ vein })} />
          <SelectField label={K('Einfahrt ins abzweigende Gleis', 'Entry onto the diverging track')} value={e.sw ?? -1} onChange={(v) => update({ sw: v < 0 ? null : v })}
            options={[[-1, K('nein – nur geradeaus', 'no – straight only')], ...swOpts]} />
        </>}
        {(e.kind === 'hpt' || e.kind === 'bue' || e.kind === 'el') && <KmField label={e.kind === 'hpt' ? K('km Halteplatz (Ne 5)', 'km stopping point (Ne 5)') : 'km'} value={e.at} onChange={(at) => update({ at })} />}
        {e.kind === 'abzw' && <>
          <KmField label={K('km Weichenanfang', 'km switch start')} value={e.at} onChange={(at) => update({ at })} />
          <SelectField label={K('Weiche', 'Switch')} value={e.sw} onChange={(sw) => update({ sw })} options={swOpts} />
        </>}
        {(e.kind === 'curve' || e.kind === 'lf') && <>
          <KmField label={K('km von', 'km from')} value={e.from} onChange={(from) => update({ from })} />
          <KmField label={K('km bis', 'km to')} value={e.to} onChange={(to) => update({ to })} />
        </>}
        {e.kind === 'curve' && <>
          <NumberField label={K('Radius r (m)', 'Radius r (m)')} value={e.r} min={100} max={20000} step={10} onChange={(r) => update({ r })} />
          <NumberField label={K('Überhöhung u (mm)', 'Cant u (mm)')} value={e.u} min={0} max={180} step={5} onChange={(u) => update({ u })} />
        </>}
        {e.kind === 'lf' && <NumberField label={K('Geschwindigkeit (km/h)', 'Speed (km/h)')} value={e.v} min={10} max={160} step={10} onChange={(v) => update({ v })} />}
        {e.kind === 'bue' && <SelectField label={K('Sicherung', 'Protection')} value={e.secured ? 1 : 0} onChange={(v) => update({ secured: v === 1 })}
          options={[[1, K('technisch gesichert (Bü 0/Bü 1)', 'protected (Bü 0/Bü 1)')], [0, K('nicht technisch gesichert (Bü 4/Bü 5)', 'unprotected (Bü 4/Bü 5)')]]} />}
        {e.kind === 'el' && <>
          <SelectField label={K('Art', 'Type')} value={e.type} onChange={(type) => update({ type })}
            options={[['schutz', K('Schutzstrecke (El 1 / El 2)', 'Neutral section (El 1 / El 2)')], ['buegel', K('ohne Fahrdraht (El 3 – El 5)', 'no contact wire (El 3 – El 5)')]]} />
          {e.type === 'buegel' && <NumberField label={K('Länge des Abschnitts (m)', 'Section length (m)')} value={e.len} min={0} max={2000} step={10} onChange={(len) => update({ len })} />}
        </>}
      </div>
      <button type="button" className="go ghost pl-del" onClick={remove} aria-label={K(`${title} entfernen`, `Remove ${title}`)}>{K('Entfernen', 'Remove')}</button>
    </fieldset>
  );
}

export default function PlannerTab({ B, owned }: { B: BuildState; owned: Owned }) {
  const { t, lang } = useLang();
  const K = (de: string, en: string) => t(tx(de, en));
  const [plan, setPlanState] = useState<LinePlan>(() => sanitizePlan(load<unknown>(PLAN_KEY, null)) ?? { ...DEFAULT_PLAN, f: B.f, sys: B.sys });
  const [done, setDoneState] = useState<Done>(() => cleanDone(load<unknown>(DONE_KEY, {})));
  const [filter, setFilter] = useState<'all' | 'open'>('all');
  const setPlan = (p: LinePlan) => { setPlanState(p); save(PLAN_KEY, p); };
  const setDone = (d: Done) => { setDoneState(d); save(DONE_KEY, d); };
  const upd = (p: Partial<LinePlan>) => setPlan({ ...plan, ...p });
  const updEl = (id: string, p: Partial<PlanEl>) => setPlan({ ...plan, elements: plan.elements.map((e) => (e.id === id ? ({ ...e, ...p } as PlanEl) : e)) });
  const addEl = (kind: ElKind) => {
    const end = Math.max(0, ...plan.elements.map((e) => ('to' in e ? e.to : e.at)));
    setPlan({ ...plan, elements: [...plan.elements, newElement(kind, Math.round((end + 1000) / 100) * 100, newId(plan))] });
  };

  const { items, warnings } = useMemo(() => generate(plan, owned), [plan, owned]);
  const band = useMemo(() => bandMarkup(plan, items, done, lang), [plan, items, done, lang]);
  const sorted = [...plan.elements].sort((a, b) => ('from' in a ? a.from : a.at) - ('from' in b ? b.from : b.at));
  const builtCount = items.filter((i) => done[i.id]).length;
  const kmTxt = (m: number) => (lang === 'de' ? (m / 1000).toFixed(3).replace('.', ',') : (m / 1000).toFixed(3));

  return (
    <div className="planner">
      <div className="panel pl-sec">
        <h2>{K('Strecke', 'Line')}</h2>
        <div className="calc">
          <TextField label={K('Name des Plans', 'Plan name')} value={plan.name} onChange={(name) => upd({ name })} />
          <SelectField label={K('Streckenklasse', 'Line class')} value={plan.cls} onChange={(cls) => upd({ cls })} options={[
            ['haupt', K(`Hauptbahn – ${R.brake.haupt} m Bremsweg`, `Main line – ${R.brake.haupt} m braking distance`)],
            ['neben', K(`Nebenbahn – ${R.brake.neben} m Bremsweg`, `Branch line – ${R.brake.neben} m braking distance`)],
            ['langsam', K(`Langsame Strecke – ${R.brake.langsam} m Bremsweg`, `Slow line – ${R.brake.langsam} m braking distance`)],
          ]} />
          <NumberField label={K('Höchstgeschwindigkeit (km/h)', 'Line speed (km/h)')} value={plan.vmax} min={20} max={300} step={10} onChange={(vmax) => upd({ vmax })} />
          <SelectField label={K('Signalsystem', 'Signalling system')} value={plan.sys} onChange={(sys) => upd({ sys })}
            options={[['form', K('Form H/V', 'Semaphore H/V')], ['licht', K('Licht H/V', 'Light H/V')], ['ks', 'Ks'], ['hl', 'Hl']]} />
          <SelectField label={K('Zugbeeinflussung', 'Train protection')} value={plan.tc} onChange={(tc) => upd({ tc })}
            options={[['pzb', 'PZB'], ['lzb', 'LZB'], ['etcs', 'ETCS']]} />
          <NumberField label={K('Ziel-Blocklänge (m)', 'Target block length (m)')} value={plan.block} min={400} max={10000} step={50} onChange={(block) => upd({ block })} />
          <SelectField label={K('Weichenneigung (Grenzzeichen)', 'Switch angle (clearance marker)')} value={plan.n} onChange={(n) => upd({ n })}
            options={[7, 9, 12, 14, 18.5].map((n) => [n, `1 : ${decimal(n, lang)}`] as [number, string])} />
          <NumberField label={<>{K('Überhöhungsfehlbetrag uf (mm)', 'Cant deficiency uf (mm)')} <span className="tag">{K('Richtwert', 'guide value')}</span></>} value={plan.uf} min={0} max={150} step={10} onChange={(uf) => upd({ uf })} />
          <label className="pl-check">
            <input type="checkbox" checked={plan.electric} onChange={(e) => upd({ electric: e.target.checked })} />
            {K('Elektrifiziert (Fahrleitung)', 'Electrified (catenary)')}
          </label>
          <ScaleField value={plan.f} onChange={(f) => upd({ f })} />
        </div>
      </div>

      <div className="panel pl-sec pl-edit">
        <h2>{K('Elemente', 'Elements')}</h2>
        <p className="note">{K('Kilometerlage in Fahrtrichtung. Blocksignale zwischen den Bahnhöfen setzt der Planer selbst.', 'Kilometre positions in the direction of travel. The planner places block signals between stations by itself.')}</p>
        {sorted.map((e) => <ElementEditor key={e.id} e={e} update={(p) => updEl(e.id, p)} remove={() => setPlan({ ...plan, elements: plan.elements.filter((x) => x.id !== e.id) })} />)}
        {!sorted.length && <p className="note">{K('Noch keine Elemente.', 'No elements yet.')}</p>}
        <div className="pl-add" role="group" aria-label={K('Element hinzufügen', 'Add element')}>
          <span>{K('Hinzufügen:', 'Add:')}</span>
          {KINDS.map(([k, l]) => <button key={k} type="button" className="go ghost" onClick={() => addEl(k)}>+ {t(l)}</button>)}
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="pl-warn" role="status">
          {warnings.map((w, i) => <p key={i} className="warn" data-code={w.code}>{w.m !== undefined && <b>km {kmTxt(w.m)}: </b>}{t(w.text)}</p>)}
        </div>
      )}

      <div className="panel pl-sec">
        <h2>{K('Streckenband', 'Strip map')}</h2>
        <div className="tw">
          <svg className="pl-band" viewBox={`0 0 ${band.width} ${band.height}`} width={band.width} height={band.height} role="img"
            aria-label={K('Streckenband mit nummerierten Signalen', 'Strip map with numbered signals')} dangerouslySetInnerHTML={{ __html: band.svg }} />
        </div>
        <p className="hint">{K('Nummern wie in der Bauliste. PZB-Magnete und markierte Maste stehen nur in der Liste.', 'Numbers as in the build list. PZB magnets and marked masts are only in the list.')}</p>
      </div>

      <div className="panel pl-sec">
        <div className="pl-listhead">
          <h2>{K('Bauliste', 'Build list')}</h2>
          <span className="note" aria-live="polite">{K(`${builtCount} von ${items.length} gebaut`, `${builtCount} of ${items.length} built`)}</span>
          <Seg value={filter} onChange={setFilter} label={K('Filter', 'Filter')} options={[{ v: 'all', label: tx('Alle', 'All') }, { v: 'open', label: tx('Offen', 'Open') }]} />
          <button type="button" className="go ghost" onClick={() => setDone({})} disabled={!builtCount}>{K('Häkchen zurücksetzen', 'Clear ticks')}</button>
        </div>
        <div className="tw">
          <table className="res pl-list">
            <thead>
              <tr>
                <th><span className="sr">{K('Gebaut', 'Built')}</span></th>
                <th>#</th>
                <th style={{ width: 54 }} />
                <th>{K('Element', 'Item')}</th>
                <th>km</th>
                <th>{K('Im Spiel', 'In game')}</th>
                <th>{K('Regel', 'Rule')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                if (filter === 'open' && done[it.id]) return null;
                const name = t(it.name);
                return (
                  <tr key={it.id} data-id={it.id} className={(done[it.id] ? 'done ' : '') + (it.missing ? 'miss' : '')}>
                    <td><input type="checkbox" checked={!!done[it.id]} aria-label={K(`${i + 1}. ${name} gebaut`, `${i + 1}. ${name} built`)}
                      onChange={(e) => { const d = { ...done }; if (e.target.checked) d[it.id] = true; else delete d[it.id]; setDone(d); }} /></td>
                    <td>{i + 1}</td>
                    <td><div className="pl-ic"><Fig markup={mini(itemIcon(it, plan.sys))} /></div></td>
                    <td>
                      <b>{name}</b>
                      {it.aspect && <small>{t(it.aspect)}</small>}
                      {it.missing && <small className="alt">{it.alt?.owned ? `${K('Ersatz', 'Substitute')}: ${t(it.alt.text)}` : K('Bauteil nicht vorhanden', 'Part not available')}</small>}
                    </td>
                    <td>{kmTxt(it.m)}</td>
                    <td>{num(it.game, lang)} m</td>
                    <td className="pl-rule">{t(it.rule)}{it.guide && <> <span className="tag" title={K('Üblicher Planwert, nicht aus der Richtlinie geprüft', 'Common planning value, not checked against the rulebook')}>{K('Richtwert', 'guide value')}</span></>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="hint">{K('„Im Spiel“ = Abstand ab km 0 × Maßstab. Häkchen und Plan bleiben in diesem Browser gespeichert.', '“In game” = distance from km 0 × scale. Ticks and plan stay saved in this browser.')}</p>
      </div>
    </div>
  );
}
