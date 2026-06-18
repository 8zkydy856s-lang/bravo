'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

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
  viditelnost: string
}

export default function KioskStatus() {
  const [status, setStatus] = useState<Status | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    supabase
      .from('kiosk_status')
      .select('je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, duvod, viditelnost')
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

  const open = status.je_otevreno
  const dotColor = open ? '#4caf50' : '#b0a89a'
  const title = open ? 'Otevřeno' : 'Dnes zavřeno'

  // časy jen když je otevřeno
  let casy = ''
  if (open) {
    const o = status.oteviraci_cas?.trim()
    const z = status.zaviraci_cas?.trim()
    if (o && z) casy = `${o} – ${z}`
    else if (o) casy = `od ${o}`
    else if (z) casy = `do ${z}`
  }

  // poznámka se zobrazuje v OBOU stavech (pro hladký přechod fallback na starou duvod)
  const poznamka = (status.poznamka?.trim() || status.duvod?.trim() || '')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor }} />
      <div>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#1a1208', margin: 0 }}>{title}</p>
        {casy && <p style={{ fontSize: '11px', color: '#8a7f70', margin: 0 }}>{casy}</p>}
        {poznamka && <p style={{ fontSize: '11px', color: '#8a7f70', margin: 0 }}>{poznamka}</p>}
      </div>
    </div>
  )
}
