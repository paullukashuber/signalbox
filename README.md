# Signalbox

Interaktiver Leitfaden zu deutschen Eisenbahnsignalen: wo sie an der Strecke stehen, was sie zeigen und wie man sie in **Transport Fever 3** realistisch nachbaut. Deutsch und Englisch, hell und dunkel.

**Live:** https://paullukashuber.github.io/signalbox/

*English:* An interactive guide to German railway signals – where they stand, what they mean and how to rebuild them realistically in Transport Fever 3. Switch the language with the **EN/DE** button in the header.

## Bereiche

| Bereich | Inhalt |
| --- | --- |
| **Strecke** | Streckenplan von der Einfahrt über drei Blockabschnitte bis zum Haltepunkt. Signalsystem, Belegung und Störungen umschalten, Elemente anklicken, Zug fahren lassen. |
| **Gegengleis** | Fahrt ins Gegengleis mit Gleiswechselbetrieb (Zs 6) oder ohne Signale (Zs 8, Ne 2/Ne 1). |
| **Bauhilfe** | Abstandsrechner mit Spielmaßstab, zwölf Bau-Rezepte, Weichen und Anschlüsse, Geschwindigkeiten mit Planer und Profil, „Mein Streckenplan“, „Meine Bauteile“. |
| **Mein Streckenplan** | Eigene Strecke beschreiben (Bahnhöfe, Haltepunkte, Abzweige, Bögen, Bahnübergänge, Trennstellen, Langsamfahrstellen mit Kilometerlage). Die Seite teilt die Blöcke ein und erzeugt Streckenband, Warnungen und eine abhakbare Bauliste mit echter und Spiel-Position, Signalbild und angewendeter Regel. Export/Import als JSON, Druckansicht. |
| **Signalbegriffe** | Katalog aller Signalgruppen: H/V, Hl, Ks, Sk, Sv, Zs, Lf, Bü, El, Ra/Sh, Wn, Ne, Mastschilder, LZB/ETCS. |
| **Regeln & Systeme** | Standortregeln und welches System wofür eingesetzt wird. |
| **Quellen** | Gesetze, Richtlinien und Nachschlagewerke. |

Die Seite ist eine Lernhilfe, kein Regelwerk. Verbindlich sind die aktuelle Ril 301 und die örtlichen Richtlinien.

## Entwickeln

Voraussetzung: Node.js 22.

```bash
npm install
npm run dev        # Entwicklungsserver
npm test           # Unit-Tests (Vitest)
npm run build      # Typprüfung und Produktions-Build nach dist/
npm run test:e2e   # Browser-Tests (Playwright) gegen den Build
```

Für die Browser-Tests einmalig `npx playwright install chromium` ausführen oder mit `CHROME_PATH=/pfad/zu/chrome` ein vorhandenes Chrome verwenden.

Jeder Push auf `main` startet den Workflow `.github/workflows/deploy.yml`: Tests, Build und Veröffentlichung auf GitHub Pages. Unter *Settings → Pages* muss als Quelle **GitHub Actions** eingestellt sein.

## Aufbau

```
src/
  signals/draw.ts        Zeichenbausteine: jede Funktion liefert SVG für ein Signal oder eine Tafel
  i18n.tsx               Sprachumschaltung; Texte stehen als tx('deutsch', 'english') direkt bei den Daten
  rules/                 Regelprofil: types.ts (RuleProfile), de.ts (Deutschland), index.ts (aktives Profil, abgeleitete Abstände)
  features/
    line/                Streckenplan: Modell (Signalbegriffe, Simulation), Plan-Zeichnung, Infotexte
    catalog/data.ts      Alle Karten des Signalkatalogs
    build/               Bauhilfe: Bauteile, Formeln, Rezepte, Weichen-Szenarien, Geschwindigkeiten
    planner/             Streckenplaner: Datenmodell, generate() (Plan → Bauliste + Warnungen), Streckenband, Export/Import
  views/                 Die Seiten (React-Komponenten)
tests/                   Playwright-Tests
```

### Ein Signal ergänzen

1. Zeichnung in `src/signals/draw.ts` anlegen (lokale Koordinaten: x = 0 ist die Mastachse, y = 0 die Oberkante).
2. Karte in `src/features/catalog/data.ts` in der passenden Gruppe ergänzen, Text mit `tx('…', '…')` in beiden Sprachen.
3. Soll es in der Bauhilfe auftauchen: Bauteil in `PARTS` und `icon()` in `src/features/build/shared.ts` eintragen.

### Regelprofil

Alle Abstände und Grenzwerte (Bremswege, Baken, PZB, Durchrutschwege, Lf-/El-/Bü-Abstände, Grenzzeichen, EBO-§-40-Grenzen, Weichentypen, Bogenformel) stehen in `src/rules/de.ts`. Rezepte, Abstandsrechner, Streckenplan und Planer lesen ihre Werte von dort (`import { R } from '../rules'`). Werte, die nicht aus der Richtlinie geprüft sind, haben den Typ `Guide<T>` und erscheinen in der Oberfläche als **Richtwert**. `src/rules/regression.test.ts` hält die Ausgabe aller Rezepte und Pläne als Snapshot fest; ändert sich ein Wert absichtlich, mit `npx vitest run -u` aktualisieren.

### Neues Land ergänzen

1. `src/rules/de.ts` nach `src/rules/<land>.ts` kopieren, `id`, `name` und alle Werte anpassen. Der Typ `RuleProfile` meldet fehlende Felder; unsichere Werte als `guide(…)` eintragen.
2. Tests nach dem Muster von `src/rules/de.test.ts` anlegen.
3. In `src/rules/index.ts` das aktive Profil `R` umschalten (eine Auswahl in der Oberfläche gibt es noch nicht). `generate(plan, owned, profile)` nimmt das Profil auch direkt entgegen.
4. Prüfen, was sich nicht über Zahlen ausdrücken lässt: Signalsysteme und Signalbilder (`src/signals/draw.ts`, `src/features/build/speeds.ts`) und die Texte in Katalog und Regeln sind deutsch geprägt.

Einstellungen (Design, Sprache, Bauhilfe-Werte, Meine Bauteile, Streckenplan mit Häkchen) speichert die Seite nur im `localStorage` des Browsers. Schriften werden mitgeliefert, es gibt keine Anfragen an Dritte.

## Lizenz

MIT – siehe [LICENSE](LICENSE).
