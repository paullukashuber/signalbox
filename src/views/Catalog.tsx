import { useState } from 'react';
import { useLang } from '../i18n';
import { Fig } from '../components/Svg';
import { HLM, hlSig, pic } from '../signals/draw';
import { CARDS, GROUPS, HL_COLS, HL_ROWS, INTRO, type CatKey } from '../features/catalog/data';
import { hlMeaning, nm } from '../features/line/model';

export default function Catalog() {
  const { t, lang } = useLang();
  const [cat, setCat] = useState<CatKey>('form');
  const L = (de: string, en: string) => (lang === 'de' ? de : en);
  return (
    <>
      <h1>{L('Signalbegriffe', 'Signal aspects')}</h1>
      <p className="lead">
        {L(
          'Was jedes Signal zeigen kann und wofür es steht. Bei Formsignalen sind Tag- und Nachtzeichen nebeneinander dargestellt.',
          'What each signal can show and what it means. For semaphores the day and night aspects are shown side by side.',
        )}
      </p>
      <div className="catlay">
        <nav className="side" aria-label={L('Signalgruppen', 'Signal groups')}>
          {GROUPS.map((g) => (
            <div key={g.title.de} style={{ display: 'contents' }}>
              <span className="grp">{t(g.title)}</span>
              {g.items.map(([k, label]) => (
                <button key={k} type="button" className={k === cat ? 'on' : undefined} aria-pressed={k === cat} onClick={() => setCat(k)}>
                  {t(label)}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div>
          <p className="intro">{t(INTRO[cat])}</p>
          {cat === 'hl' && (
            <>
              <div className="card tw">
                <table className="hlm">
                  <thead>
                    <tr>
                      <th />
                      {HL_COLS.map(([k, l]) => (
                        <th key={k}>{L('Nächstes Signal:', 'Next signal:')}<br />{t(l)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HL_ROWS.map(([r, rl]) => (
                      <tr key={r}>
                        <td className="rl">{L('Ab hier:', 'From here:')}<br /><b>{t(rl)}</b></td>
                        {HL_COLS.map(([col]) => {
                          const code = Object.keys(HLM).find((k) => HLM[k][0] === r && HLM[k][1] === col)!;
                          return (
                            <td key={col} title={hlMeaning(code, lang)}>
                              <Fig markup={pic(hlSig(code), 80, 125, 0.8, 40, 6)} />
                              <div className="code" style={{ fontSize: 12 }}>{nm(code, lang)}</div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ height: 12 }} />
            </>
          )}
          <div className="cat">
            {CARDS[cat].map((card, i) => (
              <div key={i} className={'asp' + (card.figs.length ? '' : ' txt')}>
                <div className="pics">
                  {card.figs.map((f, j) => (
                    <figure key={j}>
                      <Fig markup={f.svg} />
                      {f.cap && <figcaption>{t(f.cap)}</figcaption>}
                    </figure>
                  ))}
                </div>
                <div><span className="code">{t(card.code)}</span> · <b>{t(card.title)}</b></div>
                {t(card.text) && <p>{t(card.text)}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
