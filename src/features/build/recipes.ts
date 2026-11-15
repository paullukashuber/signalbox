import { tx, type Tx } from '../../i18n';
import { R, clearanceFor, distantOnMast, ne6Before } from '../../rules';
import { decimal, isMulti, overlap, type BuildState } from './shared';

/** [position m, part, name, note, alternative [part, text]?] */
export type Step = [number, string, Tx, Tx, [string, Tx]?];
export type Recipe = { t: Tx; ref: Tx; d: Tx; s: Step[] };
export type RecipeKey = 'einfahrt' | 'ausfahrt' | 'block' | 'kreuz' | 'abzweig' | 'kopf' | 'rangier' | 'bue' | 'el' | 'hpt' | 'lfvor' | 'lfdauer';

const E = tx('', '');

export function recipes(B: BuildState): Record<RecipeKey, Recipe> {
  const bw = B.bw, dw = overlap(B.vein), n = B.n, gz = clearanceFor(n), L = Math.max(B.blk, bw), ms = isMulti(B);
  const [b3, b2, b1] = R.distant.beacons, pz5 = R.pzb.hz500BeforeMain, gap = R.clearance.signalGap.v, k = R.clearance.perGradient, Bo = R.boards;
  const bue1 = bw * Bo.bue1Factor.v, el = Bo.el45;
  const hs = ms ? 'ms' : 'hs';
  const vsName = ms ? (B.sys === 'ks' ? tx('Ks-Vorsignal', 'Ks distant signal') : tx('Hl-Vorsignal', 'Hl distant signal')) : tx('Vorsignal', 'Distant signal');
  const short = distantOnMast(L, bw);
  return {
    einfahrt: {
      t: tx('Einfahrt in einen Bahnhof', 'Entry into a station'), ref: tx('Einfahrsignal', 'Home signal'), d: tx('Die Grundanordnung vor jedem Bahnhof.', 'The basic layout in front of every station.'),
      s: [
        [-bw - b3, 'ne3', tx('Vorsignalbake (3 Streifen)', 'Distant beacon (3 stripes)'), tx('rechts vom Gleis', 'to the right of the track')],
        [-bw - b2, 'ne3', tx('Vorsignalbake (2 Streifen)', 'Distant beacon (2 stripes)'), E],
        [-bw - b1, 'ne3', tx('Vorsignalbake (1 Streifen)', 'Distant beacon (1 stripe)'), E],
        [-bw, 'vs', vsName, tx('mit Ne 2 am Mast; dazu PZB 1000 Hz', 'with Ne 2 on the mast; plus PZB 1000 Hz'), ['ne2', tx('Fehlt das Vorsignal: Ne 2 allein als Bremspunkt', 'No distant signal: Ne 2 alone as braking point')]],
        [-pz5, 'pzb', tx('PZB 500 Hz', 'PZB 500 Hz'), tx('am rechten Schienenstrang', 'on the right-hand rail')],
        [-Bo.markedMastsBefore.v, 'flt', tx('Drei markierte Fahrleitungsmaste', 'Three marked catenary masts'), tx('die letzten drei Maste vor dem Signal', 'the last three masts before the signal')],
        [0, hs, tx('Einfahrsignal', 'Home signal'), ms ? tx('Mehrabschnittssignal: kündigt gleich das Ausfahrsignal an', 'Multi-section signal: also announces the exit signal') : tx('am Mast: Vorsignal des Ausfahrsignals, wenn der Bahnhof kürzer als ein Bremsweg ist; PZB 2000 Hz', 'on the mast: distant for the exit signal if the station is shorter than one braking distance; PZB 2000 Hz')],
        [0, 'zs3', tx('Zs 3 (optional)', 'Zs 3 (optional)'), tx('nur wenn die Einfahrt ins abzweigende Gleis langsamer ist', 'only if the entry into the diverging track is slower')],
        [dw - Bo.ra10BeforeSwitch.v, 'ra10', tx('Rangierhalttafel Ra 10', 'Ra 10 shunting limit board'), tx('gilt für Rangierfahrten Richtung Strecke; steht oft links vom Gleis', 'applies to shunting towards the line; often to the left of the track')],
        [dw, 'weiche', tx('Erste Einfahrweiche (Weichenanfang)', 'First entry switch (switch start)'), tx(`Durchrutschweg ${dw} m hinter dem Einfahrsignal`, `Overlap ${dw} m behind the home signal`)],
      ],
    },
    ausfahrt: {
      t: tx('Ausfahrt und erster Block', 'Exit and first block'), ref: tx('Ausfahrsignal', 'Exit signal'), d: tx('Bahnhofsende mit Haltetafel, Ausfahrsignal, Grenzzeichen und dem ersten Blocksignal.', 'Station end with stop marker, exit signal, clearance marker and the first block signal.'),
      s: [
        [-Bo.ne5BeforeExit.v, 'ne5', tx('Haltetafel Ne 5', 'Ne 5 stop marker'), tx('Halteplatz der Zugspitze am Bahnsteig', 'stopping point for the head of the train')],
        [0, hs, tx('Ausfahrsignal', 'Exit signal'), ms ? tx('Mehrabschnittssignal, kündigt Bk 1 an', 'Multi-section signal, announces Bk 1') : short ? tx('mit Vorsignal für Bk 1 am Mast', 'with the distant for Bk 1 on the mast') : tx('Vorsignal für Bk 1 separat, siehe unten', 'separate distant for Bk 1, see below')],
        [gap, 'ra12', tx('Grenzzeichen', 'Clearance marker'), tx('hinter dem Signal; dort, wo die Gleise 3,50 m auseinanderliegen', 'behind the signal, where the tracks are 3.50 m apart')],
        [gap + gz, 'weiche', tx('Weichenmittelpunkt der Ausfahrweiche', 'Centre of the exit switch'), tx(`≈ ${decimal(k, 'de')} m × ${n} = ${Math.round(gz)} m hinter dem Grenzzeichen`, `≈ ${decimal(k, 'en')} m × ${n} = ${Math.round(gz)} m behind the clearance marker`)],
        ...(ms || short ? [] : [[L - bw, 'vs', tx('Vorsignal für Bk 1', 'Distant signal for Bk 1'), tx(`mit Baken davor (${b3}/${b2}/${b1} m)`, `with beacons before it (${b3}/${b2}/${b1} m)`)] as Step]),
        [L, hs, tx('Blocksignal Bk 1', 'Block signal Bk 1'), tx(`${L} m hinter dem Ausfahrsignal (mindestens ${bw} m)`, `${L} m after the exit signal (at least ${bw} m)`)],
      ],
    },
    block: {
      t: tx('Blockstrecke', 'Block section'), ref: tx('Blocksignal Bk 1', 'Block signal Bk 1'),
      d: ms ? tx('Mehrabschnittssignale in gleichmäßigem Abstand; jedes Signal ist zugleich Vorsignal für das nächste.', 'Multi-section signals at even spacing; each signal is also the distant for the next.') : tx('Hauptsignale mit dem Vorsignal des nächsten Signals am Mast, solange der Block nicht länger als etwa 1,3 Bremswege ist.', 'Main signals with the distant for the next signal on the mast, as long as the block is no longer than about 1.3 braking distances.'),
      s: [
        [0, hs, tx('Blocksignal Bk 1', 'Block signal Bk 1'), ms ? tx('Mastschild weiß-rot-weiß mit gelbem Dreieck', 'white-red-white mast plate with yellow triangle') : short ? tx('am Mast: Vorsignal für Bk 2', 'on the mast: distant for Bk 2') : E],
        ...(ms || short ? [] : [[L - bw - b3, 'ne3', tx('Vorsignalbaken', 'Distant beacons'), E] as Step, [L - bw, 'vs', tx('Vorsignal für Bk 2', 'Distant signal for Bk 2'), tx('mit Ne 2', 'with Ne 2')] as Step]),
        [L, hs, tx('Blocksignal Bk 2', 'Block signal Bk 2'), E],
        ...(ms || short ? [] : [[2 * L - bw, 'vs', tx('Vorsignal für Bk 3', 'Distant signal for Bk 3'), tx('mit Ne 2', 'with Ne 2')] as Step]),
        [2 * L, hs, tx('Blocksignal Bk 3', 'Block signal Bk 3'), tx('usw. – jeder Block mindestens einen Bremsweg lang', 'and so on – every block at least one braking distance long')],
      ],
    },
    kreuz: {
      t: tx('Eingleisige Strecke mit Kreuzungsbahnhof', 'Single-track line with passing station'), ref: tx('Bahnhofsmitte', 'Station centre'),
      d: tx('Zwei Gleise, Züge beider Richtungen. Signale für jede Richtung stehen rechts in deren Fahrtrichtung. In Transport Fever 3 braucht jede Stelle, an der sich Züge begegnen sollen, Signale.', 'Two tracks, trains in both directions. Signals for each direction stand to the right in that direction. In Transport Fever 3 every place where trains should pass needs signals.'),
      s: [
        [-300 - dw - bw, 'vs', tx('→ Vorsignal (Richtung →)', '→ Distant signal (direction →)'), E],
        [-300 - dw, hs, tx('→ Einfahrsignal', '→ Home signal'), E],
        [-300, 'weiche', tx('Weiche West', 'West switch'), E],
        [-300 + gz, 'ra12', tx('Grenzzeichen West', 'West clearance marker'), tx('zwischen den beiden Bahnhofsgleisen', 'between the two station tracks')],
        [-300 + gz + gap, hs, tx('← Ausfahrsignale (2×, je Gleis)', '← Exit signals (2×, one per track)'), tx('für Züge Richtung West, rechts von ihrem Gleis', 'for westbound trains, to the right of their track')],
        [300 - gz - gap, hs, tx('→ Ausfahrsignale (2×, je Gleis)', '→ Exit signals (2×, one per track)'), tx('für Züge Richtung Ost', 'for eastbound trains')],
        [300 - gz, 'ra12', tx('Grenzzeichen Ost', 'East clearance marker'), E],
        [300, 'weiche', tx('Weiche Ost', 'East switch'), E],
        [300 + dw, hs, tx('← Einfahrsignal', '← Home signal'), tx('auf der anderen Gleisseite', 'on the other side of the track')],
        [300 + dw + bw, 'vs', tx('← Vorsignal (Richtung ←)', '← Distant signal (direction ←)'), E],
      ],
    },
    abzweig: {
      t: tx('Abzweigstelle auf freier Strecke', 'Junction on the open line'), ref: tx('Weichenanfang', 'Switch start'), d: tx('Eine Strecke zweigt ab. Das Signal vor der Weiche zeigt bei Fahrt in den Abzweig eine Geschwindigkeit.', 'A line branches off. The signal before the switch shows a speed for the diverging route.'),
      s: [
        [-dw - bw - b3, 'ne3', tx('Vorsignalbaken', 'Distant beacons'), E],
        [-dw - bw, 'vs', vsName, ms ? tx('mit Zs 3v (gelbe Ziffer) für den Abzweig', 'with Zs 3v (yellow number) for the branch') : tx('zeigt Vr 2 für den Abzweig', 'shows Vr 2 for the branch')],
        [-dw, hs, tx('Abzweigsignal', 'Junction signal'), ms ? tx('Ks 1/Ks 2 mit Zs 3 (weiße Ziffer)', 'Ks 1/Ks 2 with Zs 3 (white number)') : tx('Hp 2 für den Abzweig, Hp 1 geradeaus', 'Hp 2 for the branch, Hp 1 straight on')],
        [-dw, 'zs3', tx('Zs 3 / Zs 3v', 'Zs 3 / Zs 3v'), tx('Geschwindigkeit im Abzweig', 'speed on the branch')],
        [0, 'weiche', tx('Weichenanfang', 'Switch start'), tx(`Durchrutschweg ${dw} m`, `Overlap ${dw} m`)],
        [gz + gap, 'ra12', tx('Grenzzeichen', 'Clearance marker'), tx('für Züge, die aus dem Abzweig kommen', 'for trains coming from the branch')],
      ],
    },
    kopf: {
      t: tx('Kopfbahnhof', 'Terminus'), ref: tx('Prellbock', 'Buffer stop'), d: tx('Gleise enden am Prellbock. Der Zug muss früh und langsam halten.', 'Tracks end at the buffer stop. The train must stop early and slowly.'),
      s: [
        [-bw - 500, 'vs', vsName, E],
        [-500, hs, tx('Einfahrsignal', 'Home signal'), tx('mit Zs 13, wenn in ein Stumpfgleis eingefahren wird', 'with Zs 13 when entering a dead-end track')],
        [-500, 'zs13', tx('Zs 13', 'Zs 13'), tx('Stumpfgleis- und Frühhaltanzeiger', 'dead-end and early-stop indicator')],
        [-480 + dw, 'weiche', tx('Weichen der Gleisharfe', 'Switches of the track fan'), E],
        [-30, 'ne5', tx('Haltetafel Ne 5', 'Ne 5 stop marker'), tx('vor dem Prellbock', 'before the buffer stop')],
        [-10, hs, tx('Ausfahrsignale', 'Exit signals'), tx('am Gleisende, zeigen Richtung Strecke', 'at the track end, facing the line')],
        [0, 'sh2', tx('Sh 2 am Prellbock', 'Sh 2 at the buffer stop'), tx('Schutzhalt', 'protection stop')],
      ],
    },
    rangier: {
      t: tx('Abstellgruppe / Rangierbereich', 'Sidings / shunting area'), ref: tx('Zusammenführung', 'Merge point'), d: tx('Abstellgleise münden in ein Ausziehgleis. Rangierfahrten werden mit Sperrsignalen geregelt.', 'Sidings lead into a shunting neck. Shunting is controlled with shunting signals.'),
      s: [
        [-60, 'shf', tx('Sperrsignal je Abstellgleis', 'Shunting signal per siding'), tx('Formsperrsignal Sh 0/Sh 1 oder Lichtsperrsignal, vor dem Grenzzeichen', 'semaphore Sh 0/Sh 1 or light shunting signal, before the clearance marker'), ['shl', tx('Lichtsperrsignal als Alternative', 'light shunting signal as an alternative')]],
        [-40, 'ra12', tx('Grenzzeichen je Zusammenführung', 'Clearance marker per merge'), tx(`3,50 m Gleismittenabstand, ≈ ${Math.round(gz)} m vor dem Weichenmittelpunkt`, `3.50 m between track centres, ≈ ${Math.round(gz)} m before the switch centre`)],
        [-40 + gz, 'weiche', tx('Weichenmittelpunkt', 'Switch centre'), E],
        [150, 'ra11', tx('Wartezeichen Ra 11', 'Ra 11 wait sign'), tx('hier auf den Auftrag zur Rangierfahrt warten', 'wait here for the order to shunt')],
        [300, 'ra10', tx('Rangierhalttafel Ra 10', 'Ra 10 shunting limit board'), tx('Grenze des Rangierbereichs zur Strecke', 'limit of the shunting area towards the line')],
        [-400, 'sh2', tx('Sh 2 an den Gleisenden', 'Sh 2 at the track ends'), tx('Schutzhalt', 'protection stop')],
      ],
    },
    bue: {
      t: tx('Bahnübergang', 'Level crossing'), ref: tx('Bahnübergang', 'Level crossing'), d: tx('Technisch gesichert mit Überwachungssignal; nicht technisch gesichert mit Pfeif- und Läutetafel.', 'Protected crossings get a monitor signal; unprotected ones get whistle and bell boards.'),
      s: [
        [-bue1 - Bo.bue2BeforeMonitor, 'bue2', tx('Rautentafel Bü 2', 'Bü 2 diamond board'), tx('kündigt das Überwachungssignal an', 'announces the monitor signal')],
        [-bue1, 'bue1', tx('Überwachungssignal Bü 0/Bü 1', 'Bü 0/Bü 1 monitor signal'), tx('rechts vom Gleis', 'to the right of the track')],
        [-Bo.bue4Before.v, 'bue4', tx('Pfeiftafel Bü 4 (nur ohne technische Sicherung)', 'Bü 4 whistle board (unprotected only)'), tx('Abstand nach örtlicher Festlegung; Pfiff in der Mitte wiederholen', 'distance set locally; repeat the whistle halfway')],
        [-Bo.bue5Before.v, 'bue5', tx('Läutetafel Bü 5 (nur ohne technische Sicherung)', 'Bü 5 bell board (unprotected only)'), tx('läuten bis zum Übergang', 'ring until the crossing')],
        [0, 'bue', tx('Bahnübergang', 'Level crossing'), tx('Andreaskreuz an der Straße', 'St Andrew’s cross at the road')],
      ],
    },
    el: {
      t: tx('Fahrleitung: Trennstelle und „Bügel ab“', 'Catenary: section break and “pantograph down”'), ref: tx('El 1 bzw. El 4', 'El 1 or El 4'), d: tx('Zwei typische Fälle: Schutzstrecke (Hauptschalter aus) und Abschnitt ohne Fahrdraht (Stromabnehmer senken).', 'Two typical cases: a neutral section (main breaker off) and a section without contact wire (lower the pantograph).'),
      s: [
        [-bw * Bo.el1vFactor, 'el1v', tx('El 1v', 'El 1v'), tx('halber Bremsweg vor El 1', 'half a braking distance before El 1')],
        [0, 'el1', tx('El 1 Ausschaltsignal', 'El 1 power off'), tx('Hauptschalter aus', 'main breaker off')],
        [Bo.el2After.v, 'el2', tx('El 2 Einschaltsignal', 'El 2 power on'), tx('hinter der Trennstelle', 'after the section break')],
        [-bw * Bo.el1vFactor, 'el3', tx('El 3 (zweiter Fall)', 'El 3 (second case)'), tx('halber Bremsweg vor El 4', 'half a braking distance before El 4')],
        [0, 'el4', tx('El 4 „Bügel ab“', 'El 4 “pantograph down”'), tx(`${el} m vor dem Abschnitt`, `${el} m before the section`)],
        [2 * el, 'el5', tx('El 5 „Bügel an“', 'El 5 “pantograph up”'), tx(`${el} m hinter dem Abschnitt (hier 0–${el} m langer Abschnitt)`, `${el} m after the section (here a 0–${el} m long section)`)],
      ],
    },
    hpt: {
      t: tx('Haltepunkt', 'Halt'), ref: tx('Halteplatz', 'Stopping point'), d: tx('Haltepunkte haben keine Weichen und deshalb keine Einfahr- oder Ausfahrsignale.', 'Halts have no switches and therefore no home or exit signals.'),
      s: [
        [-ne6Before(bw), 'ne6', tx('Haltepunkttafel Ne 6', 'Ne 6 halt board'), tx('nur, wenn der Haltepunkt schwer zu erkennen ist', 'only if the halt is hard to see')],
        [0, 'ne5', tx('Haltetafel Ne 5', 'Ne 5 stop marker'), tx('am Bahnsteigende', 'at the platform end')],
      ],
    },
    lfvor: {
      t: tx('Vorübergehende Langsamfahrstelle', 'Temporary speed restriction'), ref: tx('Lf 2', 'Lf 2'), d: tx('Baustelle oder schlechter Oberbau.', 'Work site or poor track.'),
      s: [
        [-bw * Bo.lf1Factor, 'lf13', tx('Lf 1 Langsamfahrscheibe', 'Lf 1 warning board'), tx('mit Kennziffer, im Bremswegabstand', 'with number, one braking distance before')],
        [0, 'lf2', tx('Lf 2 Anfangscheibe', 'Lf 2 start board'), E],
        [500, 'lf3', tx('Lf 3 Endscheibe', 'Lf 3 end board'), tx('Ende der Langsamfahrstelle', 'end of the restriction')],
      ],
    },
    lfdauer: {
      t: tx('Dauerhafte Geschwindigkeitsbeschränkung', 'Permanent speed restriction'), ref: tx('Lf 7', 'Lf 7'), d: tx('Kurve, Brücke oder Ortsdurchfahrt.', 'Curve, bridge or passage through a town.'),
      s: [
        [-bw * Bo.lf6Factor, 'lf67', tx('Lf 6', 'Lf 6'), tx('Ankündigung mit Kennziffer', 'warning with number')],
        [0, 'lf7', tx('Lf 7', 'Lf 7'), tx('ab hier gilt die Geschwindigkeit', 'the speed applies from here')],
        [800, 'lf7', tx('Lf 7 (höher)', 'Lf 7 (higher)'), tx('Erhöhung: nur Lf 7, ohne Ankündigung', 'increase: Lf 7 only, no warning')],
      ],
    },
  };
}
