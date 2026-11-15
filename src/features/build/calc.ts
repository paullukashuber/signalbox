import { tx, type Lang, type Tx } from '../../i18n';
import { R, clearanceFor, ne6Before } from '../../rules';
import { decimal, num, overlap, type BuildState } from './shared';

/** [distance, metres, rule, part] */
export type CalcRow = [Tx, number, Tx, string];

/** Rows of the distance calculator. */
export function calcRows(B: BuildState, lang: Lang): CalcRow[] {
  const bw = B.bw, dw = overlap(B.vein), n = B.n, gz = clearanceFor(n), ns = decimal(n, lang), Bo = R.boards;
  const tol = R.distant.shortenTol, pct = Math.round(tol * 100), [b3, b2, b1] = R.distant.beacons, k = R.clearance.perGradient;
  const ov = R.overlap.v, [m1, m2] = R.block.typicalMulti.v, ne6 = ne6Before(bw), ne6Main = bw >= Bo.ne6.v.mainFrom;
  return [
    [tx('Vorsignal → Hauptsignal', 'Distant → main signal'), bw, tx(`Mindestens der Bremsweg (EBO). Ist er mehr als ${pct} % kürzer, wird das gekennzeichnet. Kürzer ohne Kennzeichnung höchstens bis ${num(bw * (1 - tol), 'de')} m.`, `At least the braking distance (EBO). If it is more than ${pct} % shorter this is marked. Without marking at most down to ${num(bw * (1 - tol), 'en')} m.`), 'vs'],
    [tx('Vorsignalbaken Ne 3', 'Ne 3 distant beacons'), b3, tx(`Drei Baken: ${b3} m, ${b2} m und ${b1} m vor dem Vorsignal.`, `Three beacons: ${b3} m, ${b2} m and ${b1} m before the distant signal.`), 'ne3'],
    [tx('PZB 1000 Hz', 'PZB 1000 Hz'), R.pzb.hz1000BeforeDistant, tx('Direkt am Vorsignal.', 'Right at the distant signal.'), 'pzb'],
    [tx('PZB 500 Hz → Hauptsignal', 'PZB 500 Hz → main signal'), R.pzb.hz500BeforeMain, tx(`Rund ${R.pzb.hz500BeforeMain} m vor dem Hauptsignal.`, `About ${R.pzb.hz500BeforeMain} m before the main signal.`), 'pzb'],
    [tx('PZB 2000 Hz', 'PZB 2000 Hz'), R.pzb.hz2000BeforeMain, tx('Direkt am Hauptsignal.', 'Right at the main signal.'), 'pzb'],
    [tx('Durchrutschweg (Einfahrsignal → erste Weiche)', 'Overlap (home signal → first switch)'), dw, tx(`Richtwert für ${B.vein} km/h Einfahrgeschwindigkeit (über ${ov[0].above} km/h ≈ ${ov[0].m} m, bis ${ov[0].above} ≈ ${ov[1].m} m, bis ${ov[1].above} ≈ ${ov[2].m} m). Übliche Planwerte, nicht aus der Richtlinie geprüft.`, `Guide value for ${B.vein} km/h entry speed (above ${ov[0].above} km/h ≈ ${ov[0].m} m, up to ${ov[0].above} ≈ ${ov[1].m} m, up to ${ov[1].above} ≈ ${ov[2].m} m). Common planning values, not checked against the rulebook.`), 'hs'],
    [tx('Blocklänge (Hauptsignal → Hauptsignal)', 'Block length (main → main signal)'), bw * R.block.minFactor, tx(`Mindestens der Bremsweg. Kombinierte Signale (Ks/Hl) folgen meist im Abstand von ${m1} bis ${m2} m.`, `At least the braking distance. Combined signals (Ks/Hl) usually follow every ${m1} to ${m2} m.`), 'ms'],
    [tx('Grenzzeichen', 'Clearance marker'), gz, tx(`Dort, wo die Gleismitten 3,50 m auseinanderliegen (EBO Anlage 4; in engen Bögen etwas mehr). Näherung für 1 : ${ns}: ≈ ${decimal(k, 'de')} m × ${ns} hinter dem Weichenmittelpunkt (Schnittpunkt der Gleisachsen).`, `Where the track centres are 3.50 m apart (EBO annex 4; a little more in tight curves). Approximation for 1 : ${ns}: ≈ ${decimal(k, 'en')} m × ${ns} behind the switch centre (where the track axes cross).`), 'ra12'],
    [tx('Lf 6 → Lf 7', 'Lf 6 → Lf 7'), bw * Bo.lf6Factor, tx('So weit vorher, dass bis Lf 7 abgebremst werden kann; hier Bremsweg.', 'Far enough before to brake by Lf 7; here one braking distance.'), 'lf67'],
    [tx('Lf 1 → Lf 2', 'Lf 1 → Lf 2'), bw * Bo.lf1Factor, tx('In der Regel im Bremswegabstand.', 'Usually one braking distance.'), 'lf13'],
    [tx('El 1v → El 1  /  El 3 → El 4', 'El 1v → El 1  /  El 3 → El 4'), bw * Bo.el1vFactor, tx('Grundsätzlich im halben Bremswegabstand.', 'Normally half a braking distance.'), 'el1'],
    [tx('El 4 → Abschnitt  /  Abschnitt → El 5', 'El 4 → section  /  section → El 5'), Bo.el45, tx(`${Bo.el45} m vor bzw. hinter dem Abschnitt mit gesenktem Stromabnehmer.`, `${Bo.el45} m before or after the section with lowered pantograph.`), 'el4'],
    [tx('Bü 2 → Bü-Überwachungssignal', 'Bü 2 → crossing monitor signal'), Bo.bue2BeforeMonitor, tx(`Kündigt das Überwachungssignal an (im Plan ${Bo.bue2BeforeMonitor} m).`, `Announces the monitor signal (${Bo.bue2BeforeMonitor} m in the plan).`), 'bue2'],
    [tx('Bü-Überwachungssignal → Bahnübergang', 'Monitor signal → crossing'), bw * Bo.bue1Factor.v, Bo.bue1Factor.note, 'bue1'],
    [tx('Ne 6 → Haltepunkt', 'Ne 6 → halt'), ne6, ne6Main ? tx('800 bis 1300 m auf Hauptbahnen.', '800 to 1300 m on main lines.') : tx('150 m auf Nebenbahnen.', '150 m on branch lines.'), 'ne6'],
    [tx('Markierte Fahrleitungsmaste', 'Marked catenary masts'), 0, tx('Die letzten drei Maste vor jedem Hauptsignal.', 'The last three masts before every main signal.'), 'flt'],
  ];
}
