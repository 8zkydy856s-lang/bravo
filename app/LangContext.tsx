'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { DICT, Lang, tr } from './i18n'

const KEY = 'bravo-lang'
const VALID: Lang[] = ['en', 'fr', 'de', 'lu', 'cz']

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} })

// Drží zvolený jazyk veřejné stránky. Default EN; volba se pamatuje v localStorage.
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as Lang | null
      if (stored && VALID.includes(stored)) setLangState(stored)
    } catch { /* ignore */ }
  }, [])
  const setLang = (l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(KEY, l) } catch { /* ignore */ }
  }
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>
}

export function useLang() { return useContext(LangCtx) }

// Inline překlad: <T k="napojovyListek" />
export function T({ k }: { k: string }) {
  const { lang } = useLang()
  return <>{tr(k, lang)}</>
}

export { DICT }
