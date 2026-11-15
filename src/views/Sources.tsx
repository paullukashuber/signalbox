import { tx, useLang, type Tx } from '../i18n';

const SOURCES: [string, Tx][] = [
  ['https://www.gesetze-im-internet.de/eso_1959/BJNR210220959.html', tx('Eisenbahn-Signalordnung (ESO) – gesetze-im-internet.de', 'Railway Signalling Regulations (ESO) – gesetze-im-internet.de')],
  ['https://lxgesetze.de/ebo/14', tx('EBO § 14 Abs. 13 – Vorsignalabstand', 'EBO § 14 (13) – distant signal spacing')],
  ['https://lxgesetze.de/ebo/40', tx('EBO § 40 – Fahrgeschwindigkeit, Bogenformel', 'EBO § 40 – line speed, curve formula')],
  ['https://files.hanser.de/Files/Article/ARTK_ZCO_9783446448940_0001.pdf', tx('Grundformen von Weichen mit Zweiggleis-Geschwindigkeiten – Hanser (Leseprobe)', 'Standard switch types with diverging speeds – Hanser (sample chapter)')],
  ['https://bahnsys.uni-wuppertal.de/fileadmin/bauing/bahnsys/Bahnverkehr_1_LuFG_Oeffentlicher_Verkehr_2011_FORMELSAMMLUNG_ZUR_VERTIEFUNG.pdf', tx('Formelsammlung Bahnverkehr (Überhöhung, Weichen) – Uni Wuppertal', 'Railway formula collection (cant, switches) – University of Wuppertal')],
  ['https://www.gesetze-bayern.de/Content/Document/BayEBOA-ANL_21', tx('EBOA Anlage 21 – Bü-Signale (Bayern)', 'EBOA annex 21 – level crossing signals (Bavaria)')],
  ['https://sh1.org/eisenbahn/snbu.htm', tx('Bahnübergangssignale – sh1.org', 'Level crossing signals – sh1.org')],
  ['https://sh1.org/eisenbahn/snne.htm', tx('Nebensignale – sh1.org', 'Secondary signals – sh1.org')],
  ['https://sh1.org/eisenbahn/snra.htm', tx('Rangiersignale – sh1.org', 'Shunting signals – sh1.org')],
  ['https://sh1.org/eisenbahn/snsh.htm', tx('Schutzsignale – sh1.org', 'Protection signals – sh1.org')],
  ['https://sh1.org/eisenbahn/shhl.htm', tx('Hl-Signale – sh1.org', 'Hl signals – sh1.org')],
  ['https://www.sh1.org/fotos/sk.htm', tx('Sk-Signale (Fotos) – sh1.org', 'Sk signals (photos) – sh1.org')],
  ['https://dewiki.de/Lexikon/Ks-Signal', tx('Ks-Signal – dewiki.de', 'Ks signal – dewiki.de')],
  ['https://dewiki.de/Lexikon/Hl-Signal', tx('Hl-Signal – dewiki.de', 'Hl signal – dewiki.de')],
  ['https://webserver.jmri.org/xml/signals/DB-HV-1969/index.shtml', tx('JMRI: DB HV System 1969', 'JMRI: DB HV system 1969')],
  ['https://wiki.openstreetmap.org/wiki/OpenRailwayMap/Tagging_in_Germany/Ra_and_Sh_Signals', tx('OpenRailwayMap: Ra- und Sh-Signale', 'OpenRailwayMap: Ra and Sh signals')],
  ['https://wiki.openstreetmap.org/wiki/DE:OpenRailwayMap/Tagging_in_Germany/Lf_Signals', tx('OpenRailwayMap: Lf-Signale', 'OpenRailwayMap: Lf signals')],
  ['https://sh1.org/eisenbahn/snzs.htm', tx('Zusatzsignale – sh1.org', 'Supplementary signals – sh1.org')],
  ['https://wiki.osm.org/wiki/OpenRailwayMap/Tagging_in_Germany/Zs_Signals', tx('OpenRailwayMap: Zs-Signale', 'OpenRailwayMap: Zs signals')],
  ['https://de-academic.com/dic.nsf/dewiki/426510', tx('Fahrleitungssignal – de-academic', 'Catenary signal – de-academic')],
  ['https://wiki.openstreetmap.org/wiki/OpenRailwayMap/Tagging_in_Germany/El_Signals', tx('OpenRailwayMap: El-Signale', 'OpenRailwayMap: El signals')],
  ['https://dewiki.de/Lexikon/Mastschild', tx('Mastschild – dewiki.de', 'Mast plate – dewiki.de')],
  ['https://www.sh1.org/eisenbahn/shpp.htm', tx('Mastschilder – sh1.org', 'Mast plates – sh1.org')],
  ['https://sh1.org/eisenbahn/snwn.htm', tx('Weichensignale – sh1.org', 'Switch signals – sh1.org')],
  ['https://www.system-bahn.net/file/pdf-reader/42017', tx('Deine Bahn 7/2024: ETCS, Balisen und Ne 14', 'Deine Bahn 7/2024: ETCS, balises and Ne 14')],
  ['https://www.gesetze-im-internet.de/eso_1959/inhaltsverzeichnis.html', tx('ESO – Inhaltsverzeichnis', 'ESO – table of contents')],
  ['https://www.mist-4.de/archiv/2011-09-vortrag-signale-deutschland.pdf', tx('Vortrag „Signale in Deutschland“ (Sk, Sv)', 'Talk “Signale in Deutschland” (Sk, Sv)')],
];

export default function Sources() {
  const { t, lang } = useLang();
  return (
    <>
      <h1>{t(tx('Quellen', 'Sources'))}</h1>
      <p className="lead">
        {t(
          tx(
            'Lernhilfe, kein Regelwerk. Verbindlich sind die aktuelle Ril 301 (Signalbuch) und die örtlichen Richtlinien.',
            'A learning aid, not a rulebook. The binding documents are the current Ril 301 (signal book) and local rules.',
          ),
        )}
      </p>
      {lang === 'en' && (
        <p className="note">Most sources are in German. Signal names such as Hp 0 or Zs 3 are kept in their German form throughout.</p>
      )}
      <div className="panel">
        <ul className="src">
          {SOURCES.map(([href, label]) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noreferrer">
                {t(label)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
