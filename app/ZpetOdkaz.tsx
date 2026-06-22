'use client'
import { useEffect, useState } from 'react'
import { DICT, Lang } from './i18n'

// Přeložený odkaz "← Zpět" pro /listek. Čte uložený jazyk z localStorage
// (na lístku není přepínač, takže stačí přečíst jednou).
export default function ZpetOdkaz() {
  const [lang, setLang] = useState<Lang>('en')
  useEffect(() => {
    try {
      const s = localStorage.getItem('bravo-lang') as Lang | null
      if (s && ['en', 'fr', 'de', 'lu', 'cz'].includes(s)) setLang(s)
    } catch { /* ignore */ }
  }, [])
  return <a href="/" style={{ fontSize: '13px', color: '#8a7f70', textDecoration: 'none' }}>{DICT.zpet[lang]}</a>
}
