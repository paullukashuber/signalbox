import { tx, useLang, type Tx } from '../../i18n';
import { Fig } from '../../components/Svg';
import { decimal, icon, mini, num, overlap, owns, type BuildState, type Owned } from '../../features/build/shared';
import { BuildInputs } from './fields';

export default function CalcTab({ B, set, owned }: { B: BuildState; set: (p: Partial<BuildState>) => void; owned: Owned }) {
  const { t, lang } = useLang();
  const bw = B.bw, dw = overlap(B.vein), n = B.n, gz = 3.5 * n, ns = decimal(n, lang);
  const rows: [Tx, number, Tx, string][] = [
    [tx('Vorsignal → Hauptsignal', 'Distant → main signal'), bw, tx(`Mindestens der Bremsweg (EBO). Ist er mehr als 5 % kürzer, wird das gekennzeichnet. Kürzer ohne Kennzeichnung höchstens bis ${num(bw * 0.95, 'de')} m.`, `At least the braking distance (EBO). If it is more than 5 % shorter this is marked. Without marking at most down to ${num(bw * 0.95, 'en')} m.`), 'vs'],
    [tx('Vorsignalbaken Ne 3', 'Ne 3 distant beacons'), 250, tx('Drei Baken: 250 m, 175 m und 100 m vor dem Vorsignal.', 'Three beacons: 250 m, 175 m and 100 m before the distant signal.'), 'ne3'],
    [tx('PZB 1000 Hz', 'PZB 1000 Hz'), 0, tx('Direkt am Vorsignal.', 'Right at the distant signal.'), 'pzb'],
    [tx('PZB 500 Hz → Hauptsignal', 'PZB 500 Hz → main signal'), 250, tx('Rund 250 m vor dem Hauptsignal.', 'About 250 m before the main signal.'), 'pzb'],
    [tx('PZB 2000 Hz', 'PZB 2000 Hz'), 0, tx('Direkt am Hauptsignal.', 'Right at the main signal.'), 'pzb'],
    [tx('Durchrutschweg (Einfahrsignal → erste Weiche)', 'Overlap (home signal → first switch)'), dw, tx(`Richtwert für ${B.vein} km/h Einfahrgeschwindigkeit (über 60 km/h ≈ 200 m, bis 60 ≈ 100 m, bis 40 ≈ 50 m). Übliche Planwerte, nicht aus der Richtlinie geprüft.`, `Guide value for ${B.vein} km/h entry speed (above 60 km/h ≈ 200 m, up to 60 ≈ 100 m, up to 40 ≈ 50 m). Common planning values, not checked against the rulebook.`), 'hs'],
    [tx('Blocklänge (Hauptsignal → Hauptsignal)', 'Block length (main → main signal)'), bw, tx('Mindestens der Bremsweg. Kombinierte Signale (Ks/Hl) folgen meist im Abstand von 1000 bis 1300 m.', 'At least the braking distance. Combined signals (Ks/Hl) usually follow every 1000 to 1300 m.'), 'ms'],
    [tx('Grenzzeichen', 'Clearance marker'), gz, tx(`Dort, wo die Gleismitten 3,50 m auseinanderliegen (EBO Anlage 4; in engen Bögen etwas mehr). Näherung für 1 : ${ns}: ≈ 3,5 m × ${ns} hinter dem Weichenmittelpunkt (Schnittpunkt der Gleisachsen).`, `Where the track centres are 3.50 m apart (EBO annex 4; a little more in tight curves). Approximation for 1 : ${ns}: ≈ 3.5 m × ${ns} behind the switch centre (where the track axes cross).`), 'ra12'],
    [tx('Lf 6 → Lf 7', 'Lf 6 → Lf 7'), bw, tx('So weit vorher, dass bis Lf 7 abgebremst werden kann; hier Bremsweg.', 'Far enough before to brake by Lf 7; here one braking distance.'), 'lf67'],
    [tx('Lf 1 → Lf 2', 'Lf 1 → Lf 2'), bw, tx('In der Regel im Bremswegabstand.', 'Usually one braking distance.'), 'lf13'],
    [tx('El 1v → El 1  /  El 3 → El 4', 'El 1v → El 1  /  El 3 → El 4'), bw / 2, tx('Grundsätzlich im halben Bremswegabstand.', 'Normally half a braking distance.'), 'el1'],
    [tx('El 4 → Abschnitt  /  Abschnitt → El 5', 'El 4 → section  /  section → El 5'), 30, tx('30 m vor bzw. hinter dem Abschnitt mit gesenktem Stromabnehmer.', '30 m before or after the section with lowered pantograph.'), 'el4'],
    [tx('Bü 2 → Bü-Überwachungssignal', 'Bü 2 → crossing monitor signal'), 250, tx('Kündigt das Überwachungssignal an (im Plan 250 m).', 'Announces the monitor signal (250 m in the plan).'), 'bue2'],
    [tx('Bü-Überwachungssignal → Bahnübergang', 'Monitor signal → crossing'), bw, tx('Ausreichend zum Anhalten vor dem Übergang; Richtwert Bremsweg.', 'Enough to stop before the crossing; guide value one braking distance.'), 'bue1'],
    [tx('Ne 6 → Haltepunkt', 'Ne 6 → halt'), bw >= 1000 ? 1000 : 150, bw >= 1000 ? tx('800 bis 1300 m auf Hauptbahnen.', '800 to 1300 m on main lines.') : tx('150 m auf Nebenbahnen.', '150 m on branch lines.'), 'ne6'],
    [tx('Markierte Fahrleitungsmaste', 'Marked catenary masts'), 0, tx('Die letzten drei Maste vor jedem Hauptsignal.', 'The last three masts before every main signal.'), 'flt'],
  ];
  return (
    <div className="panel">
      <BuildInputs B={B} set={set} />
      {B.vmax > 160 && <p className="warn">{t(tx('Über 160 km/h reicht die Signalisierung an der Strecke nicht mehr: Solche Strecken brauchen Führerraumsignalisierung (LZB oder ETCS).', 'Above 160 km/h lineside signalling is not enough: such lines need cab signalling (LZB or ETCS).'))}</p>}
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
