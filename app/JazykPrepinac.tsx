'use client'
import { useLang } from './LangContext'
import { LANGS } from './i18n'

// Funkční přepínač jazyků: EN · FR · DE · LU · CZ. Aktivní je zvýrazněný.
export default function JazykPrepinac() {
  const { lang, setLang } = useLang()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
      {LANGS.map(([code, label], i) => (
        <span key={code} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          {i > 0 && <span style={{ color: '#cdbfa9' }}>·</span>}
          <button onClick={() => setLang(code)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter,sans-serif',
              fontSize: '11px', letterSpacing: '0.1em',
              color: lang === code ? '#1a1208' : '#b6ab9b',
              fontWeight: lang === code ? 700 : 400,
            }}>
            {label}
          </button>
        </span>
      ))}
    </div>
  )
}
