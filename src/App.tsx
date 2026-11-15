import { useEffect, useState, type CSSProperties } from 'react';
import { tx, useLang } from './i18n';
import { save } from './lib/storage';
import Line from './views/Line';
import OppositeTrack from './views/OppositeTrack';
import Build from './views/Build';
import Catalog from './views/Catalog';
import Rules from './views/Rules';
import Sources from './views/Sources';

const VIEWS = [
  { id: 'strecke', label: tx('Strecke', 'Line'), C: Line },
  { id: 'gegengleis', label: tx('Gegengleis', 'Opposite track'), C: OppositeTrack },
  { id: 'bauhilfe', label: tx('Bauhilfe', 'Building'), C: Build },
  { id: 'signale', label: tx('Signalbegriffe', 'Aspects'), C: Catalog },
  { id: 'regeln', label: tx('Regeln & Systeme', 'Rules & systems'), C: Rules },
  { id: 'quellen', label: tx('Quellen', 'Sources'), C: Sources },
] as const;

const fromHash = () => {
  const h = location.hash.replace('#', '');
  return VIEWS.some((v) => v.id === h) ? h : 'strecke';
};

function useMode() {
  const [light, setLight] = useState(() => document.documentElement.dataset.mode === 'light');
  useEffect(() => {
    if (light) document.documentElement.dataset.mode = 'light';
    else delete document.documentElement.dataset.mode;
    save('sig-mode', light ? 'light' : 'dark');
  }, [light]);
  return [light, setLight] as const;
}

export default function App() {
  const { t, lang, setLang } = useLang();
  const [view, setView] = useState(fromHash);
  const [light, setLight] = useMode();
  useEffect(() => {
    const on = () => {
      setView(fromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const current = VIEWS.find((v) => v.id === view)!;
  const idx = VIEWS.indexOf(current);
  useEffect(() => {
    document.title = `${t(current.label)} – Signalbox`;
  }, [current, t]);
  // keep the current section visible in the scrolling nav on small screens
  useEffect(() => {
    document.querySelector('nav.main a.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [view]);
  const View = current.C;
  return (
    <>
      <a className="skip" href="#main">{t(tx('Zum Inhalt springen', 'Skip to content'))}</a>
      <header className="top">
        <div className="wrap">
          <div className="brand"><span className="dot" />Signalbox</div>
          <nav className="main" aria-label={t(tx('Bereiche', 'Sections'))}>
            {VIEWS.map((v, i) => (
              // the route is lit from the first section up to the current one
              <a key={v.id} href={`#${v.id}`} style={{ '--i': i } as CSSProperties}
                className={[i <= idx && 'lit', v.id === view && 'on'].filter(Boolean).join(' ') || undefined}
                aria-current={v.id === view ? 'page' : undefined}>
                {t(v.label)}
                {v.id === view && <span className="lamp" aria-hidden="true" />}
              </a>
            ))}
          </nav>
          <div className="tools">
            <button type="button" className="mode lang" onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
              aria-label={lang === 'de' ? 'Switch to English' : 'Auf Deutsch umschalten'} title={lang === 'de' ? 'English' : 'Deutsch'}>
              {lang === 'de' ? 'EN' : 'DE'}
            </button>
            <button type="button" className="mode" onClick={() => setLight(!light)}
              aria-label={light ? t(tx('Zum dunklen Design wechseln', 'Switch to dark design')) : t(tx('Zum hellen Design wechseln', 'Switch to light design'))}>
              {light ? (
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5Z" fill="currentColor" /></svg>
              ) : (
                <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="currentColor" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M3 13l1.4-1.4M11.6 4.4 13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              )}
              <span>{light ? t(tx('Dunkel', 'Dark')) : t(tx('Hell', 'Light'))}</span>
            </button>
          </div>
        </div>
      </header>
      <main className="wrap" id="main">
        <View key={view} />
      </main>
    </>
  );
}
