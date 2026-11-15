import * as D from '../../signals/draw';
import { tx, type Tx } from '../../i18n';

export type Figure = { svg: string; cap?: Tx };
export type Card = { code: string | Tx; title: Tx; text: Tx; figs: Figure[] };
export type CatKey = 'form' | 'licht' | 'hl' | 'ks' | 'sk' | 'sv' | 'zs' | 'lf' | 'bue' | 'el' | 'ra' | 'wn' | 'ne' | 'ms' | 'etcs' | 'zp';

export const GROUPS: { title: Tx; items: [CatKey, Tx | string][] }[] = [
  { title: tx('Signalsysteme', 'Signalling systems'), items: [['form', tx('Form H/V', 'Semaphore H/V')], ['licht', tx('Licht H/V (Hv 69)', 'Light H/V (Hv 69)')], ['hl', 'Hl'], ['ks', 'Ks'], ['sk', 'Sk'], ['sv', 'Sv']] },
  { title: tx('Weitere Signale', 'Other signals'), items: [['zs', tx('Zusatzsignale (Zs)', 'Supplementary (Zs)')], ['lf', tx('Langsamfahrsignale (Lf)', 'Speed signs (Lf)')], ['bue', tx('Bahnübergänge (Bü)', 'Level crossings (Bü)')], ['el', tx('Fahrleitung (El)', 'Catenary (El)')], ['ra', tx('Rangier & Schutz (Ra/Sh)', 'Shunting & protection (Ra/Sh)')], ['wn', tx('Weichen (Wn)', 'Switches (Wn)')], ['ne', tx('Nebensignale (Ne)', 'Secondary signals (Ne)')]] },
  { title: tx('Kennzeichen & Technik', 'Markers & technology'), items: [['ms', tx('Mastschilder', 'Mast plates')], ['etcs', tx('LZB und ETCS', 'LZB and ETCS')], ['zp', tx('Zug & Personal', 'Train & staff')]] },
];

export const INTRO: Record<CatKey, Tx> = {
  form: tx('Formsignale werden mechanisch gestellt. Hauptsignale haben rote Flügel, Vorsignale eine gelbe Scheibe. Nachts zeigen Laternen dieselben Begriffe als Lichter.', 'Semaphore signals are set mechanically. Main signals have red arms, distant signals a yellow disc. At night lamps show the same aspects as lights.'),
  licht: tx('„Hv 69“ ist kein eigenes Signalsystem, sondern die 1969 eingeführte Einheitsbauform der DB-Lichtsignale im H/V-System. Ältere Bauformen gibt es von 1948 und 1951. Die Begriffe sind dieselben wie bei den Nachtzeichen der Formsignale.', '“Hv 69” is not a separate system but the standard design of DB light signals in the H/V system, introduced in 1969. Older designs date from 1948 and 1951. The aspects match the night aspects of semaphores.'),
  hl: tx('Hl-Signale zeigen in einem Schirm zwei Informationen: Die Zeile sagt, wie schnell ab hier gefahren werden darf (unteres Gelb, Lichtstreifen); die Spalte sagt, was am nächsten Signal zu erwarten ist (obere Lampe, blinkend = ermäßigen).', 'Hl signals show two things in one head: the row says how fast you may run from here (lower yellow, light strip); the column says what to expect at the next signal (upper lamp, flashing = reduce).'),
  ks: tx('Ks verwendet für Signale ohne Geschwindigkeitsbeschränkung nur drei Lichtpunkte (Hp 0, Ks 1, Ks 2) statt sieben bei H/V. Geschwindigkeiten kommen über Zs 3 (weiß) und Zs 3v (gelb).', 'Ks uses only three lights (Hp 0, Ks 1, Ks 2) for unrestricted aspects instead of seven in H/V. Speeds come from Zs 3 (white) and Zs 3v (yellow).'),
  sk: tx('Das Sk-System („Signalkombination“) wurde 1977 versuchsweise auf der Strecke Augsburg–Donauwörth eingerichtet und ist dort bis heute in Betrieb. Es war Vorbild für Ks. Die Schirme ähneln den H/V-Lichtsignalen, die Funktion zeigt das Mastschild. Einige Vorsignale haben als einzige in Deutschland runde Schirme.', 'The Sk system (“signal combination”) was installed as a trial on the Augsburg–Donauwörth line in 1977 and is still in use there. It was the model for Ks. The heads resemble H/V light signals; the mast plate shows the function. Some of its distant signals have the only round heads in Germany.'),
  sv: tx('Sv-Signale (Haupt- und Vorsignalverbindungen) gibt es bei S-Bahnen. Ein Schirm vereint Haupt- und Vorsignal nebeneinander: Die linken Lichter entsprechen Hp 0, Hp 1 oder Hp 2, die rechten Vr 0, Vr 1 oder Vr 2 für das nächste Sv-Signal.', 'Sv signals (combined main and distant) are used on S-Bahn networks. One head shows main and distant side by side: the left lights correspond to Hp 0, Hp 1 or Hp 2, the right ones to Vr 0, Vr 1 or Vr 2 for the next Sv signal.'),
  bue: tx('Bü 0/Bü 1 sowie Bü 2 und Bü 3 stehen vor Bahnübergängen mit Blinklichtern oder Lichtzeichen (mit oder ohne Halbschranken). Bü 4 und Bü 5 stehen vor Bahnübergängen ohne technische Sicherung.', 'Bü 0/Bü 1 as well as Bü 2 and Bü 3 stand before crossings with flashing lights or traffic lights (with or without half barriers). Bü 4 and Bü 5 stand before unprotected crossings.'),
  lf: tx('Langsamfahrsignale kennzeichnen Abschnitte, die langsamer befahren werden müssen. Lf 1–3 gelten für vorübergehende Langsamfahrstellen, Lf 6/Lf 7 für dauerhafte Geschwindigkeitswechsel. Kennziffer × 10 = km/h. Die Tafelformen von Lf 1–3 sind schematisch.', 'Speed signs mark sections that must be run more slowly. Lf 1–3 are for temporary restrictions, Lf 6/Lf 7 for permanent speed changes. Number × 10 = km/h. The shapes of Lf 1–3 are schematic.'),
  ra: tx('Schutzsignale (Sh) gelten für Zug- und Rangierfahrten, Rangiersignale (Ra) für den Rangierdienst. Im Gebiet der ehemaligen DR heißt Sh 1 als Lichtsignal Ra 12; es zeigt in beiden Fällen zwei weiße, nach rechts steigende Lichter.', 'Protection signals (Sh) apply to trains and shunting, shunting signals (Ra) to shunting only. In the former DR area the light signal Sh 1 is called Ra 12; both show two white lights rising to the right.'),
  ne: tx('Nebensignale kennzeichnen Standorte und Besonderheiten. Formen von Ne 1, Ne 2, Ne 5 und Ne 6 sind schematisch.', 'Secondary signals mark locations and special features. The shapes of Ne 1, Ne 2, Ne 5 and Ne 6 are schematic.'),
  zs: tx('Zusatzsignale ersetzen einen schriftlichen Befehl oder ergänzen die durch Signale erteilten Fahraufträge. Ortsfeste Zusatzsignale werden in der Regel an Haupt- oder Vorsignalen gezeigt; Zs 2, Zs 2v, Zs 3, Zs 3v, Zs 6 und Zs 10 können auch allein stehen. Darstellungen von Zs 6, Zs 10 und Zs 13 sind schematisch.', 'Supplementary signals replace a written order or add to the authority given by signals. Fixed ones are usually shown at main or distant signals; Zs 2, Zs 2v, Zs 3, Zs 3v, Zs 6 and Zs 10 can also stand alone. Zs 6, Zs 10 and Zs 13 are drawn schematically.'),
  el: tx('Fahrleitungssignale sind auf der Spitze stehende blaue quadratische Tafeln mit weißen Zeichen, schwarz und weiß umrandet. An Gleisverzweigungen ergänzt ein Richtungspfeil (blau auf weiß), für welches Gleis das Signal gilt.', 'Catenary signs are blue square boards standing on a corner, with white symbols and a black and white border. At junctions a direction arrow (blue on white) shows which track the sign applies to.'),
  ms: tx('Mastschilder kennzeichnen Lichtsignale, an deren Standort bei erloschenem Signal zu halten ist, und regeln, wie an einem Halt zeigenden oder gestörten Signal zu verfahren ist. Formsignale haben stattdessen Mastbleche ohne betriebliche Bedeutung.', 'Mast plates mark light signals where a dark signal means stop, and state what to do at a signal showing stop or failed. Semaphores have mast tags without operational meaning instead.'),
  wn: tx('Weichensignale zeigen an, für welchen Fahrweg eine Weiche gestellt ist. Rückfallweichen haben eigene Überwachungssignale.', 'Switch indicators show which route a switch is set for. Spring switches have their own monitor signals.'),
  etcs: tx('Bei LZB und ETCS bekommt der Triebfahrzeugführer die Fahrerlaubnis im Führerraum angezeigt („anzeigegeführt“). An der Strecke bleiben nur wenige Kennzeichen.', 'With LZB and ETCS the driver receives the movement authority in the cab (“cab-signalled”). Only a few markers remain at the lineside.'),
  zp: tx('Diese Signale stehen nicht fest an der Strecke: Sie werden vom Personal gegeben oder am Zug gezeigt. Hier nur als Überblick.', 'These signals are not fixed at the lineside: staff give them or they are shown on the train. Listed here as an overview only.'),
};

const one = (d: string, w = 90, h = 160, sc = 1, ox = 45, oy = 8): Figure[] => [{ svg: D.pic(d, w, h, sc, ox, oy) }];
const dayNight = (f: (night: boolean) => string): Figure[] => [
  { svg: D.pic(f(false), 80, 160, 1, 32, 6), cap: tx('Tag', 'Day') },
  { svg: D.pic(f(true), 80, 160, 1, 42, 6), cap: tx('Nacht', 'Night') },
];
const raw = (svg: string): Figure[] => [{ svg }];
const c = (code: string | Tx, title: Tx, text: Tx, figs: Figure[] = []): Card => ({ code, title, text, figs });
const skPlates = D.pic(`<g transform="translate(-22 0)">${D.post(0, 60)}${D.mschild(10, 'r')}</g><g>${D.post(0, 60)}${D.mschild(10, 'ry')}</g><g transform="translate(22 0)">${D.post(0, 60)}${D.mschild(10, 'y')}</g>`, 90, 80, 1, 45, 6);

export const HL_ROWS: [string, Tx][] = [['max', tx('Höchstgeschw.', 'Line speed')], ['100', tx('100 km/h', '100 km/h')], ['40', tx('40 km/h', '40 km/h')], ['60', tx('60 km/h', '60 km/h')]];
export const HL_COLS: [string, Tx][] = [['max', tx('Höchstgeschw.', 'Line speed')], ['100', tx('100 km/h', '100 km/h')], ['46', tx('40/60 km/h', '40/60 km/h')], ['halt', tx('Halt', 'Stop')]];

export const CARDS: Record<CatKey, Card[]> = {
  form: [
    c('Hp 0', tx('Halt', 'Stop'), tx('Oberer Flügel waagerecht nach rechts. Nachts ein rotes Licht.', 'Upper arm horizontal to the right. At night one red light.'), dayNight((n) => D.formHp('Hp0', n))),
    c('Hp 1', tx('Fahrt', 'Clear'), tx('Flügel schräg nach rechts oben. Nachts grün.', 'Arm angled up to the right. Green at night.'), dayNight((n) => D.formHp('Hp1', n))),
    c('Hp 2', tx('Langsamfahrt', 'Slow speed'), tx('Zwei Flügel schräg; nachts grün über gelb. 40 km/h, wenn kein Zs 3 etwas anderes zeigt. Oft sind beide Flügel gekuppelt und das Signal kann nur Hp 0 und Hp 2.', 'Two arms angled; green above yellow at night. 40 km/h unless a Zs 3 shows otherwise. Often both arms are coupled and the signal can only show Hp 0 and Hp 2.'), dayNight((n) => D.formHp('Hp2', n))),
    c('Vr 0', tx('Halt erwarten', 'Expect stop'), tx('Scheibe senkrecht. Nachts zwei gelbe Lichter, nach rechts steigend.', 'Disc upright. At night two yellow lights rising to the right.'), dayNight((n) => D.formVr('Vr0', n, false))),
    c('Vr 1', tx('Fahrt erwarten', 'Expect clear'), tx('Scheibe waagerecht geklappt. Nachts zwei grüne Lichter.', 'Disc folded flat. At night two green lights.'), dayNight((n) => D.formVr('Vr1', n, false))),
    c('Vr 2', tx('Langsamfahrt erwarten', 'Expect slow speed'), tx('Scheibe senkrecht, Zusatzflügel schräg nach rechts unten. Nachts gelb und grün. Ohne Zusatzflügel kein Vr 2 möglich.', 'Disc upright, extra arm angled down to the right. Yellow and green at night. Without the extra arm Vr 2 is not possible.'), dayNight((n) => D.formVr('Vr2', n, false))),
  ],
  licht: [
    c('Hp 0', tx('Halt', 'Stop'), tx('Ein rotes Licht oder zwei rote Lichter nebeneinander.', 'One red light or two red lights side by side.'), one(D.hvHp('Hp0'))),
    c('Hp 1', tx('Fahrt', 'Clear'), tx('Ein grünes Licht.', 'One green light.'), one(D.hvHp('Hp1'))),
    c('Hp 2', tx('Langsamfahrt', 'Slow speed'), tx('Grün, senkrecht darunter gelb. 40 km/h, sofern kein Zs 3.', 'Green with yellow directly below. 40 km/h unless a Zs 3 says otherwise.'), one(D.hvHp('Hp2'))),
    c('Vr 0', tx('Halt erwarten', 'Expect stop'), tx('Zwei gelbe Lichter, nach rechts steigend.', 'Two yellow lights rising to the right.'), one(D.hvVr('Vr0'))),
    c('Vr 1', tx('Fahrt erwarten', 'Expect clear'), tx('Zwei grüne Lichter, nach rechts steigend.', 'Two green lights rising to the right.'), one(D.hvVr('Vr1'))),
    c('Vr 2', tx('Langsamfahrt erwarten', 'Expect slow speed'), tx('Gelb und grün, nach rechts steigend.', 'Yellow and green rising to the right.'), one(D.hvVr('Vr2'))),
    c(tx('Vr + weiß', 'Vr + white'), tx('Verkürzter Abstand', 'Shortened distance'), tx('Weißes Zusatzlicht: Das Vorsignal steht um mehr als 5 % näher am Hauptsignal als der Bremsweg.', 'Extra white light: the distant signal is more than 5 % closer to the main signal than the braking distance.'), one(D.hvVr('Vr0', true))),
    c('Hp + Vr', tx('Am gleichen Mast', 'On the same mast'), tx('Hauptsignal oben, Vorsignal des nächsten Signals darunter. Das Vorsignal ist dunkel, solange Hp 0 gezeigt wird.', 'Main signal on top, distant signal for the next signal below. The distant signal is dark while Hp 0 is shown.'), one(D.hvHp('Hp1', 'Vr2'), 90, 170)),
  ],
  hl: [
    c('Hp 0', tx('Halt', 'Stop'), tx('Rotes Licht.', 'Red light.'), one(D.hlSig('Hp0'))),
    c(tx('Hl-Vorsignal', 'Hl distant signal'), tx('Nur obere Lampen', 'Upper lamps only'), tx('Reine Vorsignale zeigen nur Hl 1, Hl 4, Hl 7 und Hl 10 und tragen Ne 2.', 'Distant-only signals show just Hl 1, Hl 4, Hl 7 and Hl 10 and carry Ne 2.'), one(D.hlSig('Hl7', true))),
    c(tx('Mehrabschnitt', 'Multi-section'), tx('Mastschild + gelbes Dreieck', 'Mast plate + yellow triangle'), tx('Ein gelbes Dreieck unter dem Mastschild kennzeichnet ein Hl-Mehrabschnittssignal.', 'A yellow triangle below the mast plate marks an Hl multi-section signal.'), one(D.hlSig('Hl10', false, true), 90, 170)),
  ],
  ks: [
    c('Hp 0', tx('Halt', 'Stop'), tx('Rotes Licht.', 'Red light.'), one(D.ksSig('Hp0', '', '', false))),
    c('Ks 1', tx('Fahrt', 'Clear'), tx('Grünes Licht.', 'Green light.'), one(D.ksSig('Ks1', '', '', false))),
    c('Ks 1 + Zs 3', tx('Fahrt mit Beschränkung', 'Clear with restriction'), tx('Weiße Ziffer über dem Schirm: im Weichenbereich höchstens Ziffer × 10 km/h.', 'White number above the head: through the switches at most number × 10 km/h.'), one(D.ksSig('Ks1', '6', '', false), 90, 165, 1, 45, 10)),
    c(tx('Ks 1 blinkend + Zs 3v', 'Ks 1 flashing + Zs 3v'), tx('Beschränkung erwarten', 'Expect restriction'), tx('Grünes Blinklicht, gelbe Ziffer darunter.', 'Flashing green light, yellow number below.'), one(D.ksSig('Ks1b', '', '8', true), 90, 165)),
    c('Ks 2', tx('Halt erwarten', 'Expect stop'), tx('Gelbes Licht: Fahrt, am nächsten Signal Halt erwarten.', 'Yellow light: proceed, expect stop at the next signal.'), one(D.ksSig('Ks2', '', '', false))),
    c('Ks 2 + Zs 3', tx('Langsam, dann Halt', 'Slow, then stop'), tx('Ab hier beschränkt, am nächsten Signal Halt erwarten.', 'Restricted from here, expect stop at the next signal.'), one(D.ksSig('Ks2', '4', '', false), 90, 165, 1, 45, 10)),
    c(tx('Ks-Vorsignal', 'Ks distant signal'), tx('Mit Ne 2', 'With Ne 2'), tx('Zeigt nur Ks 1, Ks 1 blinkend und Ks 2; daher Ne 2 statt Mastschild.', 'Shows only Ks 1, Ks 1 flashing and Ks 2; so it carries Ne 2 instead of a mast plate.'), one(D.ksSig('Ks2', '', '', true), 90, 165)),
  ],
  sk: [
    c('Hp 0', tx('Halt', 'Stop'), tx('Rotes Licht, hier an einem Sk-Hauptsignal (rotes Mastschild).', 'Red light, here on an Sk main signal (red mast plate).'), one(D.skSig('Hp0', '', '', 'hs'))),
    c('Sk 1', tx('Fahrt, Fahrt erwarten', 'Clear, expect clear'), tx('Grünes Licht. Am kombinierten Signal (rot-gelbes Mastschild).', 'Green light. On a combined signal (red-yellow mast plate).'), one(D.skSig('Sk1', '', '', 'komb'))),
    c('Sk 2', tx('Fahrt, Halt erwarten', 'Clear, expect stop'), tx('Gelbes Licht.', 'Yellow light.'), one(D.skSig('Sk2', '', '', 'komb'))),
    c('Sk 1 + Zs 3', tx('Fahrt mit Beschränkung', 'Clear with restriction'), tx('Die Beschränkung gilt im Sk-System bis zum nächsten Geschwindigkeitssignal, nicht nur im Weichenbereich.', 'In the Sk system the restriction applies until the next speed signal, not only through the switches.'), one(D.skSig('Sk1', '6', '', 'komb'), 90, 175, 1, 45, 28)),
    c(tx('Sk-Vorsignal', 'Sk distant signal'), tx('Runder Schirm', 'Round head'), tx('Gelbes Mastschild, teilweise runder Schirm. Sk 1 = Fahrt erwarten, Sk 2 = Halt erwarten. Darunter ein dreieckiger Zs 3v.', 'Yellow mast plate, partly round head. Sk 1 = expect clear, Sk 2 = expect stop. Below it a triangular Zs 3v.'), one(D.skSig('Sk1', '', '6', 'vs'))),
    c(tx('Mastschilder', 'Mast plates'), tx('rot / rot-gelb / gelb', 'red / red-yellow / yellow'), tx('Rot = Hauptsignal, rot-gelb = kombiniertes Signal (Mehrabschnitt), gelb = Vorsignal.', 'Red = main signal, red-yellow = combined signal (multi-section), yellow = distant signal.'), raw(skPlates)),
  ],
  sv: [
    c('Sv 0', tx('Zughalt! Weiterfahrt auf Sicht', 'Train stop! Proceed on sight'), tx('', '')),
    c('Sv 1', tx('Fahrt! Fahrt erwarten', 'Clear! Expect clear'), tx('Links Hauptsignalbild Fahrt, rechts Vorsignalbild Fahrt erwarten.', 'Left: main aspect clear; right: distant aspect expect clear.')),
    c('Sv 2', tx('Fahrt! Halt erwarten', 'Clear! Expect stop'), tx('', '')),
    c('Sv 3', tx('Fahrt! Langsamfahrt erwarten', 'Clear! Expect slow speed'), tx('', '')),
    c('Sv 4', tx('Langsamfahrt! Fahrt erwarten', 'Slow speed! Expect clear'), tx('', '')),
    c('Sv 5', tx('Langsamfahrt! Langsamfahrt erwarten', 'Slow speed! Expect slow speed'), tx('', '')),
    c('Sv 6', tx('Langsamfahrt! Halt erwarten', 'Slow speed! Expect stop'), tx('', '')),
    c('Hp 0', tx('Halt', 'Stop'), tx('Sv-Signale folgen einander meist im Abstand von 1000 bis 1300 m.', 'Sv signals usually follow each other every 1000 to 1300 m.')),
  ],
  bue: [
    c('Bü 0', tx('Halt vor dem Bahnübergang', 'Stop before the crossing'), tx('Nur gelbes Licht über dem schräg gestreiften Mastschild (das gelbe Licht kann entfallen). Weiterfahrt erst nach Sicherung.', 'Only the yellow light above the diagonally striped mast plate (the yellow light may be missing). Continue only once the crossing is secured.'), one(D.bue1('stoer'), 90, 140)),
    c('Bü 1', tx('Bahnübergang darf befahren werden', 'Crossing may be passed'), tx('Weißes Blinklicht über dem gelben Licht und dem gestreiften Mastschild.', 'Flashing white light above the yellow light and the striped mast plate.'), one(D.bue1('ok'), 90, 140)),
    c('Bü 2', tx('Rautentafel', 'Diamond board'), tx('Schwarze Tafel mit vier weißen Rauten: Ein Überwachungssignal ist zu erwarten.', 'Black board with four white diamonds: a monitor signal follows.'), one(D.bue2(), 90, 130)),
    c('Bü 3', tx('Merktafel', 'Marker board'), tx('Schwarz-weiß waagerecht gestreift: Einschaltpunkt von Blinklichtern oder Lichtzeichen mit Fernüberwachung.', 'Black and white horizontal stripes: trigger point of remotely monitored flashing lights or traffic lights.'), one(D.bue3(), 90, 130)),
    c('Bü 4', tx('Pfeiftafel', 'Whistle board'), tx('Weiße Tafel mit schwarzem P (oder schwarz mit weißem P): etwa 3 Sekunden pfeifen, in der Mitte bis zum Übergang wiederholen.', 'White board with a black P (or black with a white P): whistle for about 3 seconds, repeat halfway to the crossing.'), one(D.bueTxt('P'), 90, 130)),
    c('Bü 5', tx('Läutetafel', 'Bell board'), tx('Weiße Tafel mit schwarzem L: läuten, bis die Zugspitze den Übergang überquert hat.', 'White board with a black L: ring the bell until the head of the train has crossed.'), one(D.bueTxt('L'), 90, 130)),
    c(tx('Wiederholer', 'Repeater'), tx('Überwachungssignalwiederholer', 'Monitor signal repeater'), tx('Bü-Signale können wiederholt werden; Wiederholer erkennt man an einer weißen runden Scheibe auf schwarzem Grund am Mastschild.', 'Bü signals can be repeated; repeaters have a round white disc on a black background on the mast plate.')),
  ],
  lf: [
    c('Lf 1', tx('Langsamfahrscheibe', 'Speed restriction warning'), tx('Kündigt eine vorübergehende Langsamfahrstelle an (Kennziffer × 10 km/h). Nachts mit gelben Lichtern. Steht in der Regel im Bremswegabstand vor Lf 2.', 'Announces a temporary speed restriction (number × 10 km/h). Yellow lights at night. Usually one braking distance before Lf 2.'), one(D.lf1(5), 90, 130)),
    c('Lf 2', tx('Anfangscheibe', 'Start board'), tx('Anfang der vorübergehenden Langsamfahrstelle.', 'Start of the temporary restriction.'), one(D.lf2(), 90, 130)),
    c('Lf 3', tx('Endscheibe', 'End board'), tx('Ende der Langsamfahrstelle; danach gilt wieder die Fahrplangeschwindigkeit.', 'End of the restriction; the timetable speed applies again afterwards.'), one(D.lf3(), 90, 130)),
    c('Lf 6', tx('Geschwindigkeits-Ankündesignal', 'Speed warning sign'), tx('Gelbes Dreieck: kündigt eine dauerhaft niedrigere Geschwindigkeit an.', 'Yellow triangle: announces a permanently lower speed.'), one(D.lf6(8), 90, 130)),
    c('Lf 7', tx('Geschwindigkeitssignal', 'Speed sign'), tx('Weiße Tafel: Ab hier gilt die Geschwindigkeit, auch für Erhöhungen.', 'White board: the speed applies from here, increases included.'), one(D.lf7(8), 90, 130)),
    c('Lf 4 / Lf 5', tx('Ältere Tafeln', 'Older boards'), tx('Geschwindigkeitstafel und Anfangtafel bzw. „Eckentafel“ (DR) für Nebenbahnen; werden durch Lf 6/Lf 7 ersetzt.', 'Speed board and start board or “corner board” (DR) for branch lines; being replaced by Lf 6/Lf 7.')),
    c('Lf 1/2', tx('Langsamfahrbeginnscheibe (DR)', 'Restriction start board (DR)'), tx('Im Gebiet der ehemaligen DR, wenn eine Langsamfahrstelle nicht angekündigt werden muss: Die Beschränkung gilt ab dieser Tafel bis zur Endscheibe.', 'In the former DR area, where a restriction need not be announced: it applies from this board up to the end board.')),
  ],
  ra: [
    c('Sh 0', tx('Halt! Fahrverbot', 'Stop! No movement'), tx('Formsperrsignal: runde weiße Scheibe mit waagerechtem schwarzem Streifen.', 'Semaphore shunting signal: round white disc with a horizontal black bar.'), one(D.shForm(false), 90, 110)),
    c('Sh 1', tx('Fahrverbot aufgehoben', 'Movement allowed'), tx('Formsperrsignal: Streifen schräg nach rechts steigend.', 'Semaphore shunting signal: bar rising to the right.'), one(D.shForm(true), 90, 110)),
    c(tx('Hp 0 (Sperrsignal)', 'Hp 0 (shunting signal)'), tx('Halt für Rangierfahrten', 'Stop for shunting'), tx('Lichtsperrsignal (Zwergsignal) mit roten Lichtern; bei der DB früher als Sh 0 bezeichnet.', 'Light shunting signal (dwarf) with red lights; formerly called Sh 0 at DB.'), one(D.sperrL('Hp0'), 90, 70, 1, 45, 10)),
    c('Sh 1 / Ra 12 (DR)', tx('Rangierfahrt erlaubt', 'Shunting allowed'), tx('Zwei weiße Lichter, nach rechts steigend.', 'Two white lights rising to the right.'), one(D.sperrL('Sh1'), 90, 70, 1, 45, 10)),
    c('Sh 2', tx('Schutzhalt', 'Protection stop'), tx('Rechteckige rote Tafel mit weißem Rand, z. B. an Gleisenden oder vor gesperrten Gleisen (Form schematisch).', 'Rectangular red board with a white rim, e.g. at track ends or before closed tracks (shape schematic).'), one(D.sh2(), 90, 110)),
    c('Ra 10', tx('Rangierhalttafel', 'Shunting limit board'), tx('Über die Tafel hinaus darf nicht rangiert werden.', 'Shunting must not go beyond this board.'), one(D.ra10(), 90, 130)),
    c('Ra 11', tx('Wartezeichen', 'Wait sign'), tx('Gelbe Tafel mit W: Auftrag des Wärters zur Rangierfahrt abwarten. Oft mit Lampen für Sh 1; im DR-Gebiet auch weiß ohne Lampen (Ra 11b).', 'Yellow board with a W: wait for the signaller’s order to shunt. Often with lamps for Sh 1; in the DR area also white without lamps (Ra 11b).'), one(D.ra11(), 90, 130)),
    c('Ra 12 (DB)', tx('Grenzzeichen', 'Clearance marker'), tx('Grenze, bis zu der bei zusammenlaufenden Gleisen das Gleis besetzt werden darf (Form schematisch).', 'Limit up to which a track may be occupied where tracks converge (shape schematic).'), one(D.ra12(), 90, 60)),
    c('Ra 1–5', tx('Rangiersignale', 'Shunting signals'), tx('Wegfahren, Herkommen, Aufdrücken, Abstoßen, Rangierhalt – per Hand, Laterne, Horn oder Funk.', 'Move away, come here, push up, kick, stop – by hand, lamp, horn or radio.')),
    c('Ra 6–9', tx('Abdrücksignale', 'Hump signals'), tx('An Ablaufbergen: Abdrücken verboten, langsam, mäßig schnell abdrücken, Zurückziehen.', 'At humps: humping prohibited, hump slowly, hump at moderate speed, pull back.')),
  ],
  zs: [
    c('Zs 1', tx('Ersatzsignal', 'Substitute signal'), tx('Am Signal Hp 0 oder am gestörten Lichthauptsignal ohne schriftlichen Befehl vorbeifahren. Drei weiße Lichter in A-Form; bei Ks- und Hl-Signalen ein weißes Blinklicht im Schirm.', 'Pass a signal at Hp 0 or a failed light main signal without a written order. Three white lights in an A shape; on Ks and Hl signals one flashing white light in the head.'), [...one(D.zsLights('zs1'), 90, 110), ...one(D.ksSig('Hp0', '', '', false, false, 'z1'), 90, 160)]),
    c('Zs 7', tx('Vorsichtsignal', 'Caution signal'), tx('Drei gelbe Lichter in V-Form: am Halt zeigenden oder gestörten Signal vorbeifahren, auf Sicht bis zum nächsten Hauptsignal.', 'Three yellow lights in a V shape: pass the signal at stop or failed, on sight up to the next main signal.'), one(D.zsLights('zs7'), 90, 110)),
    c('Zs 8', tx('Gegengleisfahrt-Ersatzsignal', 'Opposite-track substitute signal'), tx('Am Halt zeigenden oder gestörten Hauptsignal auf mündlichen oder fernmündlichen Auftrag vorbeifahren; der Fahrweg führt ins Gegengleis. Bei der DB wie Zs 1, aber blinkend.', 'Pass the main signal at stop or failed on a verbal or phone order; the route leads into the opposite track. At DB like Zs 1 but flashing.'), one(D.zsLights('zs1', true), 90, 110)),
    c('Zs 2', tx('Richtungsanzeiger', 'Route indicator'), tx('Leuchtender Buchstabe: Die Fahrstraße führt in die angezeigte Richtung.', 'Lit letter: the route leads in the direction shown.'), one(D.zs2('F'), 90, 110)),
    c('Zs 2v', tx('Richtungsvoranzeiger', 'Route pre-indicator'), tx('Gelber Buchstabe: Zs 2 erwarten.', 'Yellow letter: expect Zs 2.'), one(D.zs2('F', true), 90, 110)),
    c('Zs 3', tx('Geschwindigkeitsanzeiger', 'Speed indicator'), tx('Weiße Ziffer: Geschwindigkeit (× 10 km/h) ab dem Signal im anschließenden Weichenbereich.', 'White number: speed (× 10 km/h) from the signal through the following switches.'), one(D.zs2('6'), 90, 110)),
    c('Zs 3v', tx('Geschwindigkeitsvoranzeiger', 'Speed pre-indicator'), tx('Gelbe Ziffer: Zs 3 mit dieser Ziffer erwarten.', 'Yellow number: expect Zs 3 with this number.'), one(D.zs2('6', true), 90, 110)),
    c('Zs 6', tx('Gegengleisanzeiger', 'Opposite-track indicator'), tx('Der Fahrweg führt in das Streckengleis entgegen der gewöhnlichen Fahrtrichtung.', 'The route leads onto the line track against the normal direction.'), one(D.zs6(), 90, 110)),
    c('Zs 10', tx('Endesignal', 'End signal'), tx('Ende der Geschwindigkeitsbeschränkung (nur im ehemaligen DB-Gebiet).', 'End of the speed restriction (former DB area only).'), one(D.zs10(), 90, 110)),
    c('Zs 13', tx('Stumpfgleis- und Frühhaltanzeiger', 'Dead-end and early-stop indicator'), tx('Gelbes, um 90° gedrehtes T: kündigt die Einfahrt in ein Stumpfgleis bzw. einen frühen Halt an.', 'Yellow T rotated by 90°: announces entry into a dead-end track or an early stop.'), one(D.zs13(), 90, 110)),
    c('Zs 4 / Zs 5', tx('Beschleunigungs- und Verzögerungsanzeiger', 'Acceleration and deceleration indicators'), tx('Historisch. Der Verzögerungsanzeiger forderte, die Geschwindigkeit um etwa 30 % zu senken.', 'Historic. The deceleration indicator required reducing speed by about 30 %.')),
  ],
  el: [
    c('El 1v', tx('Ausschaltsignal erwarten', 'Expect power off'), tx('Zwei waagerecht nebeneinanderliegende weiße Rechtecke. Grundsätzlich im halben Bremswegabstand vor El 1.', 'Two white rectangles side by side. Normally half a braking distance before El 1.'), one(D.elB('el1v'), 90, 130)),
    c('El 1', tx('Ausschaltsignal', 'Power off'), tx('Zerlegtes weißes U: Hauptschalter ausschalten; muss am Signal erledigt sein.', 'Broken white U: switch the main breaker off; it must be off by the sign.'), one(D.elB('el1'), 90, 130)),
    c('El 2', tx('Einschaltsignal', 'Power on'), tx('Geschlossenes weißes U: Einschalten erlaubt. Mit El 1 am gleichen Standort steht El 2 darüber.', 'Closed white U: switching on is allowed. Sharing a location with El 1, El 2 sits above it.'), one(D.elB('el2'), 90, 130)),
    c('El 3', tx('„Bügel ab“-Ankündesignal', '“Lower pantograph” warning'), tx('Zwei gegeneinander versetzte weiße Streifen: El 4 erwarten. Im halben Bremswegabstand vor El 4.', 'Two offset white bars: expect El 4. Half a braking distance before El 4.'), one(D.elB('el3'), 90, 130)),
    c('El 4', tx('„Bügel ab“-Signal', '“Lower pantograph” sign'), tx('Waagerechter weißer Streifen: Stromabnehmer senken. 30 m vor dem Abschnitt; am Signal muss der Bügel ganz unten sein.', 'Horizontal white bar: lower the pantograph. 30 m before the section; it must be fully down at the sign.'), one(D.elB('el4'), 90, 130)),
    c('El 5', tx('„Bügel an“-Signal', '“Raise pantograph” sign'), tx('Senkrechter weißer Streifen: Stromabnehmer heben. 30 m hinter dem Abschnitt.', 'Vertical white bar: raise the pantograph. 30 m after the section.'), one(D.elB('el5'), 90, 130)),
    c('El 6', tx('Halt für gehobene Stromabnehmer', 'Stop for raised pantographs'), tx('Weißer Rahmen mit Quadrat, beide auf der Spitze. Steht dort, wo die Fahrleitung endet.', 'White frame with a square, both on a corner. Stands where the catenary ends.'), one(D.elB('el6'), 90, 130)),
  ],
  ms: [],
  wn: [
    c('Wn 1', tx('Gerader Zweig', 'Straight route'), tx('Ein auf der Schmalseite stehendes weißes Rechteck auf schwarzem Grund.', 'A white upright rectangle on a black background.'), one(D.wn1(), 90, 60, 1.3, 45, 4)),
    c('Wn 2', tx('Gebogener Zweig', 'Diverging route'), tx('Weiche liegt auf dem gebogenen Zweig.', 'The switch is set to the curved route.')),
    c('Wn 3–Wn 6', tx('Doppelte Kreuzungsweichen', 'Double slip switches'), tx('Gerade von links nach rechts, gerade von rechts nach links, Bogen von links nach links, Bogen von rechts nach rechts.', 'Straight left to right, straight right to left, curve left to left, curve right to right.')),
    c(tx('Rückfallweiche', 'Spring switch'), tx('Orangefarbener Grund', 'Orange background'), tx('Lagemelder wie bei normalen Weichen, aber mit orangefarbenem statt schwarzem Grund.', 'Position indicator like normal switches but on an orange instead of black background.'), one(D.wn1(true), 90, 60, 1.3, 45, 4)),
    c('Ne 12', tx('Ankündigungsbake', 'Warning beacon'), tx('Kündigt das Überwachungssignal einer Rückfallweiche an: Signalbegriff am folgenden Ne 13 prüfen.', 'Announces the monitor signal of a spring switch: check the aspect at the following Ne 13.')),
    c('Ne 13a / Ne 13b', tx('Überwachungssignal der Rückfallweiche', 'Spring switch monitor signal'), tx('Ne 13a: Weiche ist gegen die Spitze befahrbar. Ne 13b: vor der Weichenspitze anhalten und Befahrbarkeit prüfen.', 'Ne 13a: the switch can be run facing. Ne 13b: stop before the switch points and check it.')),
  ],
  etcs: [
    c('Ne 14', tx('ETCS-Halttafel', 'ETCS stop marker'), tx('Halt für Züge in der ETCS-Betriebsart SR. Allein stehend auch Halt für Züge, die nicht in FS oder OS fahren, für Rangier- und Kleinwagenfahrten. Kennzeichnet eine Ganzblockgrenze.', 'Stop for trains in ETCS mode SR. Standing alone also a stop for trains not in FS or OS, for shunting and small vehicles. Marks a full block limit.')),
    c(tx('Ne 14 – Standort', 'Ne 14 – location'), tx('Haupt- oder virtuelles Hauptsignal', 'Main or virtual main signal'), tx('Am Standort von Hauptsignalen oder, bei ETCS Level 2 ohne Lichthauptsignale, an Standorten virtueller Hauptsignale.', 'At main signals or, on ETCS Level 2 without light main signals, at the locations of virtual main signals.')),
    c(tx('Balisen', 'Balises'), tx('Ortung im Gleis', 'Positioning in the track'), tx('ETCS Level 1: schaltbare Balisengruppen 250 m vor und direkt am Hauptsignal. An Ne 14: nicht schaltbare Balisen 300 m und gegebenenfalls 50 m davor.', 'ETCS Level 1: switchable balise groups 250 m before and right at the main signal. At Ne 14: fixed balises 300 m and possibly 50 m before it.')),
    c(tx('Blockkennzeichen', 'Block marker'), tx('LZB/ETCS-Blockstelle', 'LZB/ETCS block point'), tx('An Blockstellen, die nicht durch ein Hauptsignal oder Ne 14 gekennzeichnet sind; gilt nur für anzeigegeführte Züge. Form rund oder pfeilförmig.', 'At block points not marked by a main signal or Ne 14; applies only to cab-signalled trains. Round or arrow-shaped.')),
    c(tx('Anzeigegeführt', 'Cab-signalled'), tx('LZB oder ETCS', 'LZB or ETCS'), tx('Ein Zug ist anzeigegeführt, wenn LZB oder ETCS ihn selbsttätig anhalten kann und die zulässigen Werte im Führerraum anzeigt.', 'A train is cab-signalled when LZB or ETCS can stop it automatically and shows the permitted values in the cab.')),
    c(tx('ETCS Level 2 ohne Signale', 'ETCS Level 2 without signals'), tx('früher „Level 3“', 'formerly “Level 3”'), tx('Keine ortsfesten Signale außer Ne 14 und keine Gleisfreimeldeanlagen.', 'No fixed signals except Ne 14 and no track vacancy detection.')),
  ],
  zp: [
    c('Zp 1–5', tx('Signale des Triebfahrzeugführers', 'Driver’s signals'), tx('Achtungssignal, Handbremsen mäßig/stark anziehen, Handbremsen lösen, Notsignal.', 'Attention, apply hand brakes moderately/firmly, release hand brakes, emergency.')),
    c('Zp 6–8', tx('Bremsprobesignale', 'Brake test signals'), tx('Bremse anlegen, Bremse lösen, Bremse in Ordnung.', 'Apply brake, release brake, brake OK.')),
    c('Zp 9, 11, 12', tx('Abfahr- und Rufsignale', 'Departure and call signals'), tx('Abfahren; Kommen; Grenzzeichenfrei.', 'Depart; come; clear of the clearance marker.')),
    c('Zg 1 / Zg 2', tx('Signale an Zügen', 'Signals on trains'), tx('Spitzensignal und Schlusssignal.', 'Head lights and tail lights.')),
    c('Fz 1 / Fz 2', tx('Signale an Fahrzeugen', 'Signals on vehicles'), tx('Rangierlokomotivsignal und Gelbe Fahne.', 'Shunting locomotive signal and yellow flag.')),
    c('Ro 1–4', tx('Rottenwarnsignale', 'Track gang warnings'), tx('Vorsicht, im Nachbargleis nähern sich Fahrzeuge; Arbeitsgleise räumen; schnellstens räumen; Fahnenschild.', 'Caution, vehicles approaching on the adjacent track; clear the work track; clear immediately; flag board.')),
    c('Ts 1–3', tx('Schiebelokomotiven und Sperrfahrten', 'Banking locomotives and engineering trains'), tx('Nachschieben einstellen; Halt bzw. Weiterfahrt für zurückkehrende Schiebelokomotiven und Sperrfahrten.', 'Stop banking; stop or proceed for returning banking locomotives and engineering trains.')),
  ],
  ne: [
    c('Ne 1', tx('Trapeztafel', 'Trapezoid board'), tx('Nebenbahnen ohne Einfahrsignal: Halt für Züge ohne Zulassung.', 'Branch lines without a home signal: stop for trains without permission.'), one(D.ne1(), 90, 130)),
    c('Ne 2', tx('Vorsignaltafel', 'Distant board'), tx('Kennzeichnet ein Vorsignal oder steht allein im Bremswegabstand vor Ne 1 bzw. einem Hauptsignal.', 'Marks a distant signal or stands alone one braking distance before Ne 1 or a main signal.'), one(D.ne2Only(), 90, 130)),
    c('Ne 3', tx('Vorsignalbaken', 'Distant signal beacons'), tx('250, 175 und 100 m vor dem Vorsignal.', '250, 175 and 100 m before the distant signal.'), raw(D.pic(`<g transform="translate(-18 0)">${D.bake(3)}</g>${D.bake(2)}<g transform="translate(18 0)">${D.bake(1)}</g>`, 90, 130, 1, 45, 6))),
    c('Ne 4', tx('Schachbretttafel', 'Chequerboard'), tx('Das Hauptsignal steht nicht direkt rechts neben oder über dem Gleis.', 'The main signal is not directly to the right of or above the track.'), one(D.ne4(), 90, 130)),
    c('Ne 5', tx('Haltetafel', 'Stop marker'), tx('Halteplatz der Zugspitze am Bahnsteig.', 'Stopping point for the head of the train at the platform.'), one(D.ne5(), 90, 130)),
    c(tx('Mastschild', 'Mast plate'), tx('weiß-rot-weiß', 'white-red-white'), tx('An Lichthauptsignalen, an denen bei erloschenem Signal zu halten ist.', 'On light main signals where a dark signal means stop.'), raw(D.pic(D.post(0, 60) + D.mschild(14, 'wrw'), 90, 80, 1, 45, 6))),
    c('Ne 6', tx('Haltepunkttafel', 'Halt board'), tx('Kündigt einen schwer erkennbaren Haltepunkt an, schräg zum Gleis gestellt. 800–1300 m (Hauptbahn) bzw. 150 m (Nebenbahn) davor.', 'Announces a halt that is hard to see, set at an angle to the track. 800–1300 m (main line) or 150 m (branch line) before it.'), one(D.labelBoard('Ne 6'), 90, 130)),
    c('Ne 7a / Ne 7b', tx('Schneepflugtafel', 'Snowplough board'), tx('Schneepflug heben bzw. senken; weiße oder (DR) gelbe Variante.', 'Raise or lower the snowplough; white or (DR) yellow version.')),
    c('Ne 12 / Ne 13', tx('Rückfallweichen', 'Spring switches'), tx('Ankündigungsbake und Überwachungssignal einer Rückfallweiche (siehe Weichensignale).', 'Warning beacon and monitor signal of a spring switch (see switch signals).')),
    c('Ne 14', tx('ETCS-Halttafel', 'ETCS stop marker'), tx('Blockgrenze auf ETCS-Strecken (siehe LZB und ETCS).', 'Block limit on ETCS lines (see LZB and ETCS).')),
  ],
};

const M = (t: D.MastPlate) => raw(D.pic(D.post(0, 62) + D.mschild(16, t), 90, 80, 1.4, 45, 4));
CARDS.ms = [
  c(tx('weiß-rot-weiß', 'white-red-white'), tx('Hauptsignal', 'Main signal'), tx('Am Halt zeigenden oder gestörten Signal nur mit Zustimmung vorbeifahren (Befehl, Zs 1, Zs 7 oder Zs 8).', 'Pass a signal at stop or failed only with permission (written order, Zs 1, Zs 7 or Zs 8).'), M('wrw')),
  c(tx('wrw + gelbes Dreieck', 'wrw + yellow triangle'), tx('Hauptsignal mit Vorsignalfunktion', 'Main signal with distant function'), tx('Ein gelbes, nach unten zeigendes Dreieck unter dem weiß-rot-weißen Schild kennzeichnet ein Hauptsignal, das zugleich das nächste Signal ankündigt.', 'A yellow downward triangle below the white-red-white plate marks a main signal that also announces the next signal.'), raw(D.pic(D.post(0, 62) + D.mschild(10, 'wrw') + D.mschild(28, 'tri'), 90, 80, 1.4, 45, 4))),
  c(tx('weiß-gelb-weiß-gelb-weiß', 'white-yellow-white-yellow-white'), tx('Selbstblock / Verständigung', 'Automatic block / contact'), tx('Ist nach dem Anhalten keine Verständigung mit dem Fahrdienstleiter möglich, darf ohne Zustimmung vorbeigefahren werden; danach auf Sicht bis zum nächsten Hauptsignal.', 'If no contact with the dispatcher is possible after stopping, the train may pass without permission, then on sight up to the next main signal.'), M('wywyw')),
  c(tx('weiß-schwarz-weiß-schwarz-weiß', 'white-black-white-black-white'), tx('S-Bahn Berlin/Hamburg', 'S-Bahn Berlin/Hamburg'), tx('Nur an (halb-)automatischen Blocksignalen dieser S-Bahnen: nach dem Anhalten ohne Zustimmung vorbeifahren, auf Sicht weiter.', 'Only on (semi-)automatic block signals of these S-Bahn networks: after stopping, pass without permission and continue on sight.'), M('wswsw')),
  c(tx('weiß mit zwei schwarzen Punkten', 'white with two black dots'), tx('Sperrsignale', 'Shunting signals'), tx('Nur an Sperrsignalen. Zeigt das Signal Ra 12 (DV) oder ist es erloschen, hat es für Züge keine Bedeutung.', 'Only on shunting signals. If the signal shows Ra 12 (DV) or is dark, it has no meaning for trains.'), M('dots')),
  c(tx('rot / rot-gelb / gelb', 'red / red-yellow / yellow'), tx('Sk-System', 'Sk system'), tx('Hauptsignal / kombiniertes Signal / Vorsignal auf der Strecke Augsburg–Donauwörth.', 'Main / combined / distant signal on the Augsburg–Donauwörth line.'), raw(skPlates)),
  c(tx('schwarz-weiß schräg', 'black-white diagonal'), tx('Bü-Überwachungssignal', 'Crossing monitor signal'), tx('Gehört zu Bü 0/Bü 1. Wiederholer haben zusätzlich eine weiße runde Scheibe auf schwarzem Grund.', 'Belongs to Bü 0/Bü 1. Repeaters also have a round white disc on a black background.'), raw(D.pic(D.post(0, 62) + D.mschild(10, 'bu'), 90, 80, 1.4, 45, 4))),
  c(tx('Fahrleitungsmaste', 'Catenary masts'), tx('Letzte drei Maste vor dem Hauptsignal', 'Last three masts before the main signal'), tx('Weiß-rot-weiße, nicht rückstrahlende Kennzeichnung.', 'White-red-white non-reflective marking.'), raw(D.pic(D.fltMast(true), 90, 60, 1.4, 45, 6))),
  c(tx('Kennlicht', 'Marker light'), tx('Signal abgeschaltet', 'Signal switched off'), tx('Zeigt an, dass das Signal ausgeschaltet ist; es gilt dann nicht. Die Lichtanordnung hängt von der Bauform ab.', 'Shows that the signal is switched off and does not apply. The light layout depends on the design.')),
];
