import { tx, useLang, type Tx } from '../i18n';

type Row = [Tx, Tx, Tx, Tx];

const ROWS: Row[] = [
  [tx('Hauptsignal', 'Main signal'), tx('In der Regel rechts vom Gleis; abweichend gekennzeichnet mit Ne 4.', 'Normally to the right of the track; exceptions are marked with Ne 4.'), tx('Dahinter Durchrutschweg bis zum Gefahrpunkt.', 'Behind it the overlap up to the danger point.'), tx('Lichthauptsignale, an denen bei erloschenem Bild zu halten ist, tragen ein Mastschild.', 'Light main signals where a dark aspect means stop carry a mast plate.')],
  [tx('Einfahrsignal', 'Home signal'), tx('Vor der ersten Weiche des Bahnhofs.', 'Before the first switch of the station.'), tx('Durchrutschweg, bei schneller Einfahrt grob 200 m.', 'Overlap, roughly 200 m for fast entries.'), tx('Am Mast oft das Vorsignal des Ausfahrsignals.', 'Its mast often carries the distant signal for the exit signal.')],
  [tx('Ausfahrsignal', 'Exit signal'), tx('Am Ende jedes Bahnhofsgleises, rechts von seinem Gleis.', 'At the end of every station track, to the right of its track.'), tx('Vor Weiche bzw. Grenzzeichen.', 'Before the switch or clearance marker.'), tx('Deckt den anschließenden Streckenabschnitt.', 'Protects the following line section.')],
  [tx('Vorsignal', 'Distant signal'), tx('Rechts vom Gleis vor dem Hauptsignal.', 'To the right of the track before the main signal.'), tx('Mindestens der Bremsweg; in der Regel 1000 m (Hauptbahn) bzw. 700 m (Nebenbahn), auf langsamen Strecken auch 400 m.', 'At least the braking distance; usually 1000 m (main line) or 700 m (branch line), 400 m on slow lines.'), tx('Über 5 % Verkürzung wird gekennzeichnet, bei Lichtvorsignalen mit weißem Zusatzlicht.', 'A distance more than 5 % short is marked; light distant signals show an extra white light.')],
  [tx('Ne 3 Vorsignalbaken', 'Ne 3 distant signal beacons'), tx('Rechts vor dem Vorsignal.', 'To the right, before the distant signal.'), tx('250, 175 und 100 m vor dem Vorsignal.', '250, 175 and 100 m before the distant signal.'), tx('Selten bis zu fünf Baken.', 'Occasionally up to five beacons.')],
  [tx('Ne 2 / Ne 1', 'Ne 2 / Ne 1'), tx('Ne 2 am Vorsignal oder allein; Ne 1 statt Einfahrsignal auf Nebenbahnen.', 'Ne 2 at the distant signal or on its own; Ne 1 replaces the home signal on branch lines.'), tx('Ne 2 allein im Bremswegabstand vor Ne 1.', 'Ne 2 on its own one braking distance before Ne 1.'), tx('Ne 2 entfällt am Hauptsignalmast.', 'No Ne 2 on a main signal mast.')],
  [tx('Bü 0/Bü 1 Überwachungssignal', 'Bü 0/Bü 1 crossing monitor signal'), tx('Rechts vom Gleis vor technisch gesicherten Bahnübergängen.', 'To the right of the track before protected level crossings.'), tx('In einem für das Abbremsen ausreichenden Abstand vor dem Bahnübergang.', 'Far enough before the crossing to stop.'), tx('Kann wiederholt werden; Wiederholer haben eine weiße runde Scheibe am Mastschild.', 'Can be repeated; repeaters have a round white disc on the mast plate.')],
  [tx('Bü 2 Rautentafel', 'Bü 2 diamond board'), tx('Vor dem Überwachungssignal.', 'Before the monitor signal.'), tx('Kündigt das Überwachungssignal an.', 'Announces the monitor signal.'), tx('Bei verkürztem Abstand zusätzlich mit Dreieck.', 'With a triangle if the distance is shortened.')],
  [tx('Bü 4 / Bü 5', 'Bü 4 / Bü 5'), tx('Vor Bahnübergängen ohne technische Sicherung.', 'Before unprotected level crossings.'), tx('Pfeifsignal etwa in der Mitte zwischen Tafel und Bahnübergang wiederholen.', 'Repeat the whistle about halfway between board and crossing.'), tx('Ab Bü 5 läuten, bis die Zugspitze den Übergang überquert hat.', 'From Bü 5 ring the bell until the head of the train has crossed.')],
  [tx('Lf 1 / Lf 2 / Lf 3', 'Lf 1 / Lf 2 / Lf 3'), tx('Vorübergehende Langsamfahrstellen, z. B. Baustellen.', 'Temporary speed restrictions, e.g. work sites.'), tx('Lf 1 in der Regel im Bremswegabstand vor Lf 2.', 'Lf 1 usually one braking distance before Lf 2.'), tx('Lf 2 = Anfang, Lf 3 = Ende.', 'Lf 2 = start, Lf 3 = end.')],
  [tx('Lf 6 / Lf 7', 'Lf 6 / Lf 7'), tx('Dauerhafte Geschwindigkeitswechsel.', 'Permanent speed changes.'), tx('Lf 6 so weit vor Lf 7, dass abgebremst werden kann.', 'Lf 6 far enough before Lf 7 to brake.'), tx('Ab Lf 7 gilt die Geschwindigkeit; Erhöhung nur mit Lf 7.', 'The speed applies from Lf 7; increases use Lf 7 only.')],
  [tx('Ra 10 Rangierhalttafel', 'Ra 10 shunting limit board'), tx('Im Bahnhof hinter dem Einfahrsignal, gilt für Rangierfahrten Richtung Strecke.', 'Inside the station behind the home signal; applies to shunting towards the line.'), tx('Kennzeichnet den Gefahrpunkt hinter dem Einfahrsignal bzw. Ne 1.', 'Marks the danger point behind the home signal or Ne 1.'), tx('Steht oft links vom Gleis.', 'Often stands to the left of the track.')],
  [tx('Zs 1 / Zs 7 / Zs 8', 'Zs 1 / Zs 7 / Zs 8'), tx('Am Hauptsignal, als Zusatzschirm oder als Licht im Schirm.', 'At the main signal, as an extra head or a light in the head.'), tx('Gelten für das Vorbeifahren an genau diesem Signal.', 'Apply to passing exactly this signal.'), tx('Zs 7: auf Sicht bis zum nächsten Hauptsignal. Zs 8: Vorbeifahrt in das Gegengleis.', 'Zs 7: on sight up to the next main signal. Zs 8: passing into the opposite track.')],
  [tx('Zs 6', 'Zs 6'), tx('Am Hauptsignal oder allein.', 'At the main signal or on its own.'), tx('Vor dem Übergang ins Gegengleis.', 'Before the crossover to the opposite track.'), tx('Zs 2, Zs 2v, Zs 3, Zs 3v, Zs 6 und Zs 10 können auch allein stehen.', 'Zs 2, Zs 2v, Zs 3, Zs 3v, Zs 6 and Zs 10 can also stand alone.')],
  [tx('El 1v / El 1 / El 2', 'El 1v / El 1 / El 2'), tx('Vor und hinter Schutzstrecken bzw. Trennstellen der Fahrleitung.', 'Before and after neutral sections or catenary section breaks.'), tx('El 1v im halben Bremswegabstand vor El 1.', 'El 1v half a braking distance before El 1.'), tx('Am El 1 muss der Hauptschalter aus sein; ab El 2 darf eingeschaltet werden.', 'The main breaker must be off at El 1; it may be switched on from El 2.')],
  [tx('El 3 / El 4 / El 5', 'El 3 / El 4 / El 5'), tx('Vor und hinter Abschnitten, die mit gesenktem Stromabnehmer zu befahren sind.', 'Before and after sections to be run with the pantograph lowered.'), tx('El 3 im halben Bremswegabstand vor El 4; El 4 30 m davor, El 5 30 m dahinter.', 'El 3 half a braking distance before El 4; El 4 30 m before, El 5 30 m after the section.'), tx('El 6: Ende der Fahrleitung, Halt für Fahrzeuge mit gehobenem Stromabnehmer.', 'El 6: end of catenary, stop for vehicles with raised pantograph.')],
  [tx('Ne 6 Haltepunkttafel', 'Ne 6 halt board'), tx('Schräg zum Gleis gestellt, vor schwer erkennbaren Haltepunkten.', 'Set at an angle to the track before halts that are hard to see.'), tx('800–1300 m (Hauptbahn) bzw. 150 m (Nebenbahn) vor dem Haltepunkt.', '800–1300 m (main line) or 150 m (branch line) before the halt.'), tx('Nur wo der Haltepunkt schlecht zu sehen ist, z. B. in einer Kurve.', 'Only where the halt is hard to see, e.g. in a curve.')],
  [tx('Fahrleitungsmaste', 'Catenary masts'), tx('Die letzten drei Maste vor einem Hauptsignal.', 'The last three masts before a main signal.'), tx('Weiß-rot-weiße, nicht rückstrahlende Kennzeichnung.', 'White-red-white, non-reflective marking.'), tx('Hilft, das Hauptsignal früh zuzuordnen.', 'Helps to identify the main signal early.')],
  [tx('Blocksignal (freie Strecke)', 'Block signal (open line)'), tx('Rechts vom Gleis an der Blockstelle.', 'To the right of the track at the block post.'), tx('Mindestens ein Bremsweg zum vorherigen Hauptsignal; kombinierte Signale meist alle 1000–1300 m.', 'At least one braking distance from the previous main signal; combined signals usually every 1000–1300 m.'), tx('Ein Block = Abschnitt zwischen zwei Hauptsignalen, in dem nur ein Zug sein darf.', 'A block = the section between two main signals that only one train may occupy.')],
  [tx('PZB-Gleismagnete', 'PZB track magnets'), tx('Am rechten Schienenstrang.', 'On the right-hand rail.'), tx('1000 Hz am Vorsignal, 500 Hz rund 250 m vor dem Hauptsignal, 2000 Hz am Hauptsignal.', '1000 Hz at the distant signal, 500 Hz about 250 m before the main signal, 2000 Hz at the main signal.'), tx('Für H/V, Hl, Ks und Sk gleich.', 'The same for H/V, Hl, Ks and Sk.')],
];

const SYSTEMS: [Tx, Tx, Tx][] = [
  [tx('Selbstblock und Streckenblock', 'Automatic and manual block'), tx('Blockabschnitte', 'Block sections'), tx('Auf der freien Strecke teilen Blocksignale die Strecke in Abschnitte. Beim Selbstblock schalten die Signale automatisch über die Gleisfreimeldung, sonst bedient der Fahrdienstleiter den Streckenblock.', 'On the open line, block signals divide the line into sections. With automatic block the signals switch via track vacancy detection; otherwise the dispatcher operates the line block.')],
  [tx('Formsignale (H/V)', 'Semaphore signals (H/V)'), tx('ab 1924 vereinheitlicht', 'standardised from 1924'), tx('Flügel und Scheiben an Gittermasten, über Drahtzüge von mechanischen Stellwerken bewegt. Heute vor allem auf Neben- und Regionalstrecken mit alter Technik.', 'Arms and discs on lattice masts, moved by wires from mechanical interlockings. Today mostly on branch and regional lines with old equipment.')],
  [tx('H/V-Lichtsignale, Bauform Hv 69', 'H/V light signals, Hv 69 design'), tx('Altbundesgebiet', 'former West Germany'), tx('Kein eigenes Signalsystem, sondern die 1969 eingeführte Einheitsbauform der DB-Lichtsignale. Sie zeigt dieselben Begriffe wie die Nachtzeichen der Formsignale; ältere Bauformen stammen von 1948 und 1951.', 'Not a separate system but the standard DB light signal design introduced in 1969. It shows the same aspects as the night aspects of semaphores; older designs date from 1948 and 1951.')],
  [tx('Hl-Signale', 'Hl signals'), tx('ehemalige DR', 'former East German DR'), tx('Mehrabschnittssystem: Ein Schirm zeigt, was hier gilt und was am nächsten Signal kommt. Geschwindigkeiten über Lichtstreifen statt Ziffern.', 'Multi-section system: one head shows what applies here and what comes at the next signal. Speeds are shown with light strips instead of numbers.')],
  [tx('Ks-Signale', 'Ks signals'), tx('Standard bei Neubau', 'standard for new installations'), tx('Ein Licht (rot, grün, gelb) plus Zs 3/Zs 3v als Ziffern. Wird bei elektronischen Stellwerken eingebaut.', 'One light (red, green, yellow) plus Zs 3/Zs 3v as digits. Installed with electronic interlockings.')],
  [tx('Sk-Signale', 'Sk signals'), tx('nur Augsburg–Donauwörth', 'Augsburg–Donauwörth only'), tx('Versuchssystem der DB ab 1977 und Vorbild für Ks. Mastschilder zeigen die Funktion: rot = Hauptsignal, rot-gelb = kombiniertes Signal, gelb = Vorsignal.', 'DB trial system from 1977 and the model for Ks. Mast plates show the function: red = main signal, red-yellow = combined signal, yellow = distant signal.')],
  [tx('Sv-Signale', 'Sv signals'), tx('S-Bahn Berlin/Hamburg', 'S-Bahn Berlin/Hamburg'), tx('Haupt- und Vorsignal nebeneinander auf einem Schirm: links das Hauptsignalbild, rechts das Vorsignalbild für das nächste Sv-Signal.', 'Main and distant signal side by side on one head: the main aspect on the left, the distant aspect for the next Sv signal on the right.')],
  [tx('Vereinfachte Nebenbahn', 'Simplified branch line'), tx('Zugleitbetrieb', 'train control by radio'), tx('Nur Ne 2 und Ne 1; die Fahrerlaubnis kommt per Funk oder Telefon vom Zugleiter.', 'Only Ne 2 and Ne 1; permission to run comes by radio or phone from the train controller.')],
  [tx('LZB und ETCS', 'LZB and ETCS'), tx('Führerstandssignalisierung', 'cab signalling'), tx('Fahrerlaubnis direkt auf den Führerstand. Auf signallosen ETCS-Strecken markiert die ETCS-Halttafel Ne 14 die Blockgrenzen.', 'Movement authority straight to the cab. On ETCS lines without signals the ETCS stop board Ne 14 marks the block limits.')],
];

export default function Rules() {
  const { t } = useLang();
  return (
    <>
      <h1>{t(tx('Regeln & Systeme', 'Rules & systems'))}</h1>
      <p className="lead">{t(tx('Wo welches Element steht und welches Signalsystem wofür eingesetzt wird.', 'Where each element stands and which signalling system is used for what.'))}</p>
      <h2 style={{ marginTop: 0 }}>{t(tx('Standortregeln', 'Placement rules'))}</h2>
      <div className="panel tw">
        <table>
          <thead>
            <tr>
              <th>{t(tx('Element', 'Element'))}</th>
              <th>{t(tx('Wo es steht', 'Where it stands'))}</th>
              <th>{t(tx('Abstand / Bezug', 'Distance / reference'))}</th>
              <th>{t(tx('Hinweis', 'Note'))}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i}>
                <td><b>{t(r[0])}</b></td>
                <td>{t(r[1])}</td>
                <td>{t(r[2])}</td>
                <td>{t(r[3])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>{t(tx('Welches System wofür', 'Which system for what'))}</h2>
      <div className="sys">
        {SYSTEMS.map(([h, tag, p], i) => (
          <div className="card" key={i}>
            <h3>{t(h)}</h3>
            <span className="tag">{t(tag)}</span>
            <p>{t(p)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
