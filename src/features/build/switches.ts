import { tx, type Tx } from '../../i18n';
import { isMulti, overlap, type BuildState } from './shared';

/** [x, y, placement, part, label, description, alternative?]; placement: b/b2 below, t/t2 above, m on the track. */
export type SwItem = [number, number, 'b' | 'b2' | 't' | 't2' | 'm', string, Tx, Tx, [string, Tx]?];
export type Scenario = { t: Tx; short: Tx; d: Tx; tr: string[]; it: SwItem[] };
export type ScenarioKey = 'abzw' | 'einm' | 'anst' | 'uest' | 'depot';

export const SWITCH_RULES: [Tx, Tx][] = [
  [tx('Spitz oder stumpf', 'Facing or trailing'), tx('Gegen die Spitze befahren heißt: Der Zug kommt vom Weichenanfang und die Weiche entscheidet, wohin er fährt. Stumpf befahren heißt: Er kommt vom Herzstück her und wird zusammengeführt.', 'Facing means the train comes from the switch start and the switch decides where it goes. Trailing means it comes from the frog side and is merged.')],
  [tx('Signalsicherung', 'Signal protection'), tx('Auf der freien Strecke liegende Weichen, die mit mehr als 50 km/h gegen die Spitze befahren werden, sind durch Signale zu sichern. Weichen, die von Reisezügen gegen die Spitze befahren werden, müssen so von den Signalen abhängig sein, dass Fahrt nur bei richtig liegender, verschlossener Weiche möglich ist.', 'Switches on the open line that are run facing at more than 50 km/h must be protected by signals. Switches that passenger trains run facing must be interlocked with the signals so that clear is only possible with the switch set and locked correctly.')],
  [tx('Flankenschutz', 'Flank protection'), tx('Für Reisezüge über 50 km/h sind Flankenschutzvorkehrungen zu treffen – etwa Schutzweichen, Gleissperren oder Halt zeigende Signale. Über 160 km/h muss der Flankenschutz in Bahnhöfen und Anschlussstellen durch Schutzweichen gewährleistet sein.', 'Passenger trains above 50 km/h need flank protection – for example trap points, derailers or signals at stop. Above 160 km/h flank protection in stations and sidings must come from trap points.')],
  [tx('Grenzzeichen', 'Clearance marker'), tx('Zwischen zusammenlaufenden Gleisen muss ein Grenzzeichen stehen, bis zu dem ein Gleis besetzt sein darf. Signale an zusammenlaufenden Gleisen stehen davor.', 'Converging tracks need a clearance marker up to which a track may be occupied. Signals on converging tracks stand before it.')],
  [tx('Grundstellung', 'Normal position'), tx('Weichen und Gleissperren, für die eine Grundstellung bestimmt ist, müssen in Grundstellung stehen, wenn sie nicht anders gebraucht werden – bei Anschlüssen: Weiche auf das Hauptgleis, Gleissperre aufgelegt.', 'Switches and derailers with a defined normal position must stay in it when not needed otherwise – for sidings: switch to the main track, derailer on.')],
  [tx('Vorsignal oder Ne 2', 'Distant signal or Ne 2'), tx('Mit Einfahrsignalen und Hauptsignalen der freien Strecke sind Vorsignale zu verbinden, wenn im Bremswegabstand mehr als 60 km/h gefahren wird. Sonst genügt eine Signaltafel (Ne 2) am Bremspunkt.', 'Home signals and main signals on the open line need distant signals if trains run faster than 60 km/h within the braking distance. Otherwise a board (Ne 2) at the braking point is enough.')],
];

export function scenarios(B: BuildState): Record<ScenarioKey, Scenario> {
  const bw = B.bw, dw = overlap(B.vein), hs = isMulti(B) ? 'ms' : 'hs';
  return {
    abzw: {
      t: tx('Abzweigstelle – eine Strecke geht ab', 'Junction – a line branches off'), short: tx('Abzweigstelle', 'Junction'),
      d: tx('Eine Abzweigstelle ist eine Blockstelle der freien Strecke, wo Züge von einer Strecke auf eine andere übergehen können. Sie wird durch ihre Blocksignale begrenzt. Hier eingleisig in beide Richtungen.', 'A junction is a block post on the open line where trains can move from one line to another. Its block signals define its limits. Shown here single-track in both directions.'),
      tr: ['M20 200 H980', 'M470 200 L600 120 H980'],
      it: [
        [110, 200, 'b', 'vs', tx('Vorsignal (→)', 'Distant signal (→)'), tx(`${bw} m vor dem Abzweigsignal. Kündigt bei Fahrt in den Abzweig die niedrigere Geschwindigkeit an (Vr 2 bzw. Zs 3v).`, `${bw} m before the junction signal. Announces the lower speed for the branch (Vr 2 or Zs 3v).`)],
        [370, 200, 'b', hs, tx('Abzweigsignal (→)', 'Junction signal (→)'), tx(`Hauptsignal vor der Weiche, Durchrutschweg ≈ ${dw} m bis zum Weichenanfang. Zeigt Fahrt geradeaus oder Langsamfahrt / Zs 3 in den Abzweig.`, `Main signal before the switch, overlap ≈ ${dw} m to the switch start. Shows clear straight on, or slow speed / Zs 3 into the branch.`)],
        [370, 200, 'b2', 'zs3', tx('Zs 3 (→)', 'Zs 3 (→)'), tx('Geschwindigkeit im abzweigenden Strang (bei Ks; bei H/V Hp 2).', 'Speed on the diverging route (Ks; with H/V it is Hp 2).')],
        [470, 200, 'm', 'weiche', tx('Weiche (Weichenanfang)', 'Switch (switch start)'), tx('Wird von Zügen in Richtung → gegen die Spitze befahren. Auf der freien Strecke müssen solche Weichen ab 50 km/h durch Signale gesichert sein.', 'Trains in direction → run it facing. On the open line such switches must be signal-protected from 50 km/h.')],
        [585, 165, 'm', 'ra12', tx('Grenzzeichen', 'Clearance marker'), tx('Zwischen Stamm- und Abzweiggleis, wo die Gleismitten 3,50 m auseinanderliegen.', 'Between main and branch track, where the track centres are 3.50 m apart.')],
        [700, 200, 't', hs, tx('Hauptsignal Stammgleis (←)', 'Main signal, main track (←)'), tx('Für Züge aus Richtung rechts auf dem Stammgleis. Steht rechts in deren Fahrtrichtung (hier oberhalb) und vor dem Grenzzeichen, damit ein haltender Zug den Abzweig nicht blockiert.', 'For trains from the right on the main track. It stands to the right in their direction (here above) and before the clearance marker so a stopped train does not block the junction.')],
        [720, 120, 't', hs, tx('Hauptsignal Abzweiggleis (←)', 'Main signal, branch track (←)'), tx('Für Züge aus der abzweigenden Strecke, ebenfalls vor dem Grenzzeichen. Nur eines der beiden Signale (←) kann gleichzeitig Fahrt zeigen.', 'For trains from the branch line, also before the clearance marker. Only one of the two signals (←) can show clear at a time.')],
        [930, 200, 't', 'vs', tx('Vorsignal Stammgleis (←)', 'Distant signal, main track (←)'), tx(`${bw} m vor dem Hauptsignal.`, `${bw} m before the main signal.`)],
        [930, 120, 't', 'vs', tx('Vorsignal Abzweiggleis (←)', 'Distant signal, branch track (←)'), tx(`${bw} m vor dem Hauptsignal.`, `${bw} m before the main signal.`)],
      ],
    },
    einm: {
      t: tx('Einmündung – eine Strecke kommt hinzu', 'Merge – a line joins'), short: tx('Einmündung', 'Merge'),
      d: tx('Dieselbe Anlage aus Sicht der Züge, die zusammengeführt werden. Beide Zuläufe brauchen ein Hauptsignal vor dem Grenzzeichen; das Stellwerk lässt immer nur einen Zug in die Weiche.', 'The same layout seen by the merging trains. Both approaches need a main signal before the clearance marker; the interlocking only lets one train into the switch at a time.'),
      tr: ['M20 200 H980', 'M20 60 H360 L520 200'],
      it: [
        [80, 200, 'b', 'vs', tx('Vorsignal Stammgleis (→)', 'Distant signal, main track (→)'), tx(`${bw} m vor dem Hauptsignal.`, `${bw} m before the main signal.`)],
        [150, 60, 'b', 'vs', tx('Vorsignal Zulaufstrecke (→)', 'Distant signal, joining line (→)'), tx('Steht rechts vom Zulaufgleis, also zwischen den Gleisen.', 'Stands to the right of the joining track, i.e. between the tracks.')],
        [260, 200, 'b', hs, tx('Hauptsignal Stammgleis (→)', 'Main signal, main track (→)'), tx('Vor dem Grenzzeichen. Zeigt Halt, solange ein Zug aus der Zulaufstrecke einfährt.', 'Before the clearance marker. Shows stop while a train from the joining line enters.')],
        [300, 60, 'b', hs, tx('Hauptsignal Zulaufstrecke (→)', 'Main signal, joining line (→)'), tx('Vor dem Grenzzeichen. Für Reisezüge über 50 km/h braucht der Fahrweg Flankenschutz, z. B. dadurch, dass dieses Signal Halt zeigt und eine Schutzweiche oder Gleissperre ein Abrollen verhindert.', 'Before the clearance marker. Passenger trains above 50 km/h need flank protection, e.g. this signal at stop plus trap points or a derailer to stop runaways.')],
        [430, 150, 'm', 'ra12', tx('Grenzzeichen', 'Clearance marker'), tx('Hier enden beide Zuläufe; bis hierher darf ein Gleis besetzt sein.', 'Both approaches end here; a track may be occupied up to this point.')],
        [520, 200, 'm', 'weiche', tx('Weiche', 'Switch'), tx('Wird von Zügen in Richtung → stumpf (vom Herzstück her) befahren.', 'Trains in direction → run it trailing (from the frog side).')],
        [520 + dw * 0.35, 200, 't', hs, tx('Hauptsignal (←)', 'Main signal (←)'), tx(`Für Gegenrichtung: gegen die Spitze, Durchrutschweg ≈ ${dw} m.`, `For the opposite direction: facing, overlap ≈ ${dw} m.`)],
        [900, 200, 't', 'vs', tx('Vorsignal (←)', 'Distant signal (←)'), tx('', '')],
      ],
    },
    anst: {
      t: tx('Anschlussstelle – Depot oder Anschlussgleis an der freien Strecke', 'Siding – depot or private siding on the open line'), short: tx('Anschlussstelle', 'Siding'),
      d: tx('Eine Anschlussstelle liegt an der freien Strecke; Züge befahren das angeschlossene Gleis als Rangierfahrt. Es gibt dafür keine eigenen Haupt- und Vorsignale wie im Bahnhof – gesichert wird über die Weichenstellung und Schlüssel.', 'A siding lies on the open line; trains use the connected track as a shunting move. There are no main and distant signals as in a station – protection comes from the switch position and keys.'),
      tr: ['M20 200 H980', 'M440 200 L560 120 H900'],
      it: [
        [440, 200, 'm', 'weiche', tx('Anschlussweiche', 'Siding switch'), tx('Grundstellung: Hauptgleis, verschlossen. Der Schlüssel liegt beim Fahrdienstleiter bzw. in einer Schlüsselsperre und ist von den Signalen abhängig. Ab 50 km/h gegen die Spitze ist Signalsicherung Pflicht.', 'Normal position: main track, locked. The key is held by the dispatcher or in a key lock interlocked with the signals. From 50 km/h facing, signal protection is required.')],
        [555, 165, 'm', 'ra12', tx('Grenzzeichen', 'Clearance marker'), tx('Bis hierher dürfen Fahrzeuge im Anschlussgleis stehen.', 'Vehicles in the siding may stand up to here.')],
        [640, 120, 't', 'gs', tx('Gleissperre mit Gleissperrsignal', 'Derailer with derailer signal'), tx('Hinter dem Grenzzeichen im Anschlussgleis. Flankenschutz: Abrollende Fahrzeuge werden vor dem Hauptgleis aufgehalten. Grundstellung: aufgelegt (Sh 0). Oft per Schlüssel mit der Weiche gekoppelt.', 'Behind the clearance marker in the siding. Flank protection: runaway vehicles are stopped before the main track. Normal position: on (Sh 0). Often key-locked with the switch.')],
        [760, 120, 't', 'ra10', tx('Ra 10 (optional)', 'Ra 10 (optional)'), tx('Grenze für Rangierfahrten im Anschluss.', 'Limit for shunting in the siding.')],
        [880, 120, 't', 'sh2', tx('Sh 2 am Gleisende', 'Sh 2 at the track end'), tx('Schutzhalt am Prellbock des Depots.', 'Protection stop at the depot buffer stop.')],
        [250, 200, 'b', hs, tx('Blocksignal der Strecke (→)', 'Line block signal (→)'), tx('Die Anschlussstelle liegt innerhalb eines Blockabschnitts. Bei einer Ausweichanschlussstelle kann der Block nach dem Einfahren in den Anschluss für andere Züge freigegeben werden.', 'The siding lies within a block section. At a siding with block release, the block can be released for other trains once the train is in the siding.')],
      ],
    },
    uest: {
      t: tx('Überleitstelle – Gleiswechsel auf zweigleisiger Strecke', 'Crossover – changing tracks on a double-track line'), short: tx('Überleitstelle', 'Crossover'),
      d: tx('Eine Überleitstelle ist eine Blockstelle der freien Strecke, wo Züge auf ein anderes Gleis derselben Strecke übergehen können. Mit Zs 6 wird die Fahrt ins Gegengleis angezeigt.', 'A crossover is a block post on the open line where trains can move to the other track of the same line. Zs 6 indicates the move onto the opposite track.'),
      tr: ['M20 120 H980', 'M20 210 H980', 'M420 210 L520 120', 'M620 120 L720 210'],
      it: [
        [300, 210, 'b', hs, tx('Blocksignal rechtes Gleis (→)', 'Block signal, right track (→)'), tx('Vor der Weichenverbindung, mit Durchrutschweg. Zeigt mit Zs 6 die Fahrt ins Gegengleis an.', 'Before the crossover, with overlap. Indicates the move onto the opposite track with Zs 6.')],
        [300, 210, 'b2', 'zs6', tx('Zs 6 (→)', 'Zs 6 (→)'), tx('Gegengleisanzeiger.', 'Opposite-track indicator.')],
        [420, 210, 'm', 'weiche', tx('Weiche (→ gegen die Spitze)', 'Switch (→ facing)'), tx('', '')],
        [470, 165, 'm', 'ra12', tx('Grenzzeichen', 'Clearance marker'), tx('Zwischen den Gleisen an jeder Verbindung.', 'Between the tracks at each connection.')],
        [670, 165, 'm', 'ra12', tx('Grenzzeichen', 'Clearance marker'), tx('', '')],
        [720, 210, 'm', 'weiche', tx('Weiche', 'Switch'), tx('', '')],
        [840, 120, 't', hs, tx('Blocksignal linkes Gleis (←)', 'Block signal, left track (←)'), tx('Für die Gegenrichtung im linken Gleis, ebenfalls vor der Verbindung, mit Zs 6.', 'For the opposite direction on the left track, also before the crossover, with Zs 6.')],
        [840, 120, 't2', 'zs6', tx('Zs 6 (←)', 'Zs 6 (←)'), tx('', '')],
        [80, 210, 'b', 'vs', tx('Vorsignal (→)', 'Distant signal (→)'), tx(`${bw} m vor dem Blocksignal.`, `${bw} m before the block signal.`)],
      ],
    },
    depot: {
      t: tx('Depot oder Abstellgleis im Bahnhof', 'Depot or siding in a station'), short: tx('Depot', 'Depot'),
      d: tx('Ein Depot mündet in ein Bahnhofsgleis. Bewegungen sind Rangierfahrten; das Hauptgleis wird mit Sperrsignal, Gleissperre und Grenzzeichen geschützt.', 'A depot joins a station track. Movements are shunting moves; the main track is protected by a shunting signal, a derailer and a clearance marker.'),
      tr: ['M20 210 H980', 'M960 110 H640 L520 210'],
      it: [
        [300, 210, 'b', hs, tx('Ausfahrsignal / Hauptsignal Gleis 1 (→)', 'Exit signal / main signal track 1 (→)'), tx('Unverändert; die Depotweiche liegt im Fahrweg dahinter und gehört zur Fahrstraße.', 'Unchanged; the depot switch lies in the route behind it and is part of the route.')],
        [520, 210, 'm', 'weiche', tx('Depotweiche', 'Depot switch'), tx('Grundstellung: Hauptgleis. Wird für Zugfahrten auf dem Hauptgleis in Grundstellung verschlossen.', 'Normal position: main track. Locked in normal position for trains on the main track.')],
        [605, 170, 'm', 'ra12', tx('Grenzzeichen', 'Clearance marker'), tx('', '')],
        [700, 110, 't', 'shl', tx('Sperrsignal Depotausfahrt', 'Depot exit shunting signal'), tx('Licht- oder Formsperrsignal vor dem Grenzzeichen, rechts in Fahrtrichtung aus dem Depot. Zeigt Sh 1, wenn die Rangierfahrt ins Hauptgleis darf.', 'Light or semaphore shunting signal before the clearance marker, to the right when leaving the depot. Shows Sh 1 when the shunting move may enter the main track.'), ['shf', tx('Formsperrsignal Sh 0/Sh 1', 'semaphore shunting signal Sh 0/Sh 1')]],
        [780, 110, 't', 'gs', tx('Gleissperre mit Gleissperrsignal', 'Derailer with derailer signal'), tx('Flankenschutz für das Hauptgleis. Ersetzt bei kleinen Depots oft das Sperrsignal.', 'Flank protection for the main track. Often replaces the shunting signal at small depots.')],
        [860, 110, 't', 'ra11', tx('Ra 11 Wartezeichen (optional)', 'Ra 11 wait sign (optional)'), tx('Hier wartet die Rangierfahrt auf den Auftrag.', 'The shunting move waits here for its order.')],
        [950, 110, 't', 'sh2', tx('Sh 2 am Gleisende', 'Sh 2 at the track end'), tx('', '')],
      ],
    },
  };
}
