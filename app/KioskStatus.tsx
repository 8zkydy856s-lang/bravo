'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import KioskStatusView from './KioskStatusView'
import { useLang } from './LangContext'
import { DICT } from './i18n'

// Zobrazení stavu kiosku pro zákazníky (levá část karty na úvodní stránce).
// - otevřeno -> "Otevřeno" + časy (jsou-li vyplněné)
// - zavřeno  -> "Dnes zavřeno" + důvod (je-li vyplněný)
// Respektuje sloupec viditelnost: při "skryte"/"vypnuto" se nevykreslí nic.
type Status = {
  je_otevreno: boolean
  oteviraci_cas: string | null
  zaviraci_cas: string | null
  poznamka: string | null
  duvod: string | null
  dnesni_vyjimka: boolean
  viditelnost: string
}

export default function KioskStatus() {
  const { lang } = useLang()
  const [status, setStatus] = useState<Status | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    supabase
      .from('kiosk_status')
      .select('je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, duvod, dnesni_vyjimka, viditelnost')
      .eq('pobocka_id', 'hlavni')
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        setStatus((data as Status | null) ?? null)
        setLoaded(true)
      })
    return () => { active = false }
  }, [])

  // dokud nemáme data, nebo řádek chybí -> nic nezobrazujeme
  if (!loaded || !status) return null
  // viditelnost: zatím reálně počítáme s "viditelne", ale pole čteme a respektujeme
  if (status.viditelnost !== 'viditelne') return null

  // poznámka: nově poznamka, pro hladký přechod fallback na starou duvod
  const poznamka = (status.poznamka?.trim() || status.duvod?.trim() || '')

  const labels = {
    otevreno: DICT.otevreno[lang], dnesZavreno: DICT.dnesZavreno[lang],
    od: DICT.od[lang], do: DICT.do[lang],
  }

  return (
    <KioskStatusView
      je_otevreno={status.je_otevreno}
      oteviraci_cas={status.oteviraci_cas}
      zaviraci_cas={status.zaviraci_cas}
      poznamka={poznamka}
      dnesni_vyjimka={status.dnesni_vyjimka}
      labels={labels}
    />
  )
}
