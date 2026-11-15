import { tx, useLang } from '../../i18n';
import { Fig } from '../../components/Svg';
import { icon, mini, num, owns, type BuildState, type Owned } from '../../features/build/shared';
import { calcRows } from '../../features/build/calc';
import { R } from '../../rules';
import { BuildInputs } from './fields';

export default function CalcTab({ B, set, owned }: { B: BuildState; set: (p: Partial<BuildState>) => void; owned: Owned }) {
  const { t, lang } = useLang();
  const rows = calcRows(B, lang);
  return (
    <div className="panel">
      <BuildInputs B={B} set={set} />
      {B.vmax > R.speed.limits.pzb && <p className="warn">{t(tx(`Über ${R.speed.limits.pzb} km/h reicht die Signalisierung an der Strecke nicht mehr: Solche Strecken brauchen Führerraumsignalisierung (LZB oder ETCS).`, `Above ${R.speed.limits.pzb} km/h lineside signalling is not enough: such lines need cab signalling (LZB or ETCS).`))}</p>}
      <div className="tw">
        <table className="res">
          <thead>
            <tr>
              <th style={{ width: 54 }} />
              <th>{t(tx('Abstand', 'Distance'))}</th>
              <th>{t(tx('Echt', 'Real'))}</th>
              <th>{t(tx('Im Spiel', 'In game'))}</th>
              <th>{t(tx('Regel', 'Rule'))}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([a, m, rule, p], i) => {
              const ok = owns(owned, p);
              return (
                <tr key={i} style={ok ? undefined : { opacity: 0.45 }}>
                  <td><div style={{ background: 'var(--sky)', borderRadius: 6 }}><Fig markup={mini(icon(p, B.sys))} /></div></td>
                  <td>{t(a)}</td>
                  <td>{m ? `${num(m, lang)} m` : '–'}</td>
                  <td>{m ? `${num(m * B.f, lang)} m` : '–'}</td>
                  <td style={{ color: 'var(--mute)', fontSize: 13.5 }}>{t(rule)}{!ok && <i> {t(tx('(Bauteil nicht vorhanden)', '(part not available)'))}</i>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="hint">{t(tx('„Im Spiel“ = echter Wert × Maßstab. Mit 1 : 1 baust du maßstäblich; kleinere Maßstäbe stauchen alle Abstände gleichmäßig, damit die Anordnung stimmig bleibt.', '“In game” = real value × scale. At 1 : 1 you build to scale; smaller scales compress all distances evenly so the layout stays consistent.'))}</p>
    </div>
  );
}
