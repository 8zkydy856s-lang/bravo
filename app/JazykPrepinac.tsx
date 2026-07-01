'use client'
import { useState, useRef, useEffect } from 'react'
import { useLang } from './LangContext'
import { LANGS } from './i18n'

// Rozklikávací přepínač jazyků (dle simulátoru): tlačítko „▼ CZ" → menu s jazyky.
export default function JazykPrepinac() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open])

  const current = LANGS.find(([c]) => c === lang)?.[1] ?? lang.toUpperCase()

  return (
    <div className="jp-langs" ref={ref}>
      <button
        className={'jp-cur' + (open ? ' jp-open' : '')}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        aria-label="Jazyk"
        aria-expanded={open}
      >
        <span className="jp-sip" aria-hidden="true">▼</span>
        <span className="jp-kod">{current}</span>
      </button>
      <div className={'jp-menu' + (open ? ' jp-menu-open' : '')}>
        {LANGS.map(([code, label]) => (
          <a
            key={code}
            href="#"
            className={lang === code ? 'jp-on' : undefined}
            onClick={(e) => { e.preventDefault(); setLang(code); setOpen(false) }}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  )
}
