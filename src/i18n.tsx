import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { load, save } from './lib/storage';

export type Lang = 'de' | 'en';
/** A text in both languages. */
export type Tx = { de: string; en: string };
export const tx = (de: string, en: string): Tx => ({ de, en });

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: 'de', setLang: () => {} });

function initialLang(): Lang {
  const stored = load<Lang | null>('sig-lang', null);
  if (stored === 'de' || stored === 'en') return stored;
  return typeof navigator !== 'undefined' && !navigator.language.toLowerCase().startsWith('de') ? 'en' : 'de';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    save('sig-lang', l);
  };
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

/** Returns the language and a picker that resolves a Tx (or plain string) to the active language. */
export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  const t = (v: Tx | string): string => (typeof v === 'string' ? v : v[lang]);
  return { lang, setLang, t };
}

/** Resolve a Tx outside of React (drawing code receives the language explicitly). */
export const pick = (v: Tx | string, lang: Lang) => (typeof v === 'string' ? v : v[lang]);
