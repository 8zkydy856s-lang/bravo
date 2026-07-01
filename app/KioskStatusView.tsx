// Sdílený vizuál stavu kiosku - jediné místo s pravidly zobrazení.
// Texty (Otevřeno/Dnes zavřeno/od/do) se předávají jako props - na webu přeložené
// podle jazyka, v admin náhledu zůstává český default.
//
// Pravidla:
//  - tečka: otevřeno = zelená (#4caf50), zavřeno = červená (#c0392b)
//  - časy: jen když je otevřeno A NENÍ dnešní výjimka
//  - poznámka: ukazuje se v obou stavech (je-li vyplněná)

import type { CSSProperties } from 'react'

export type StatusLabels = { otevreno: string; dnesZavreno: string; od: string; do: string }
const DEFAULT_LABELS: StatusLabels = { otevreno: 'Otevřeno', dnesZavreno: 'Dnes zavřeno', od: 'od', do: 'do' }

type Props = {
  je_otevreno: boolean
  oteviraci_cas: string | null
  zaviraci_cas: string | null
  poznamka: string | null
  dnesni_vyjimka: boolean
  labels?: StatusLabels
}

export default function KioskStatusView({ je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, dnesni_vyjimka, labels = DEFAULT_LABELS }: Props) {
  const kvetColor = je_otevreno ? '#4caf50' : '#c0392b'
  const kvetGlow = je_otevreno ? 'rgba(76,175,80,.5)' : 'rgba(192,57,43,.5)'
  const title = je_otevreno ? labels.otevreno : labels.dnesZavreno

  let casy = ''
  if (je_otevreno && !dnesni_vyjimka) {
    const o = oteviraci_cas?.trim()
    const z = zaviraci_cas?.trim()
    if (o && z) casy = `${o} – ${z}`
    else if (o) casy = `${labels.od} ${o}`
    else if (z) casy = `${labels.do} ${z}`
  }

  const note = poznamka?.trim() || ''

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <span className="stav-kvet" aria-hidden="true" style={{ ['--kv']: kvetColor, ['--kvGlow']: kvetGlow } as CSSProperties}>
        <span className="glyf">❀</span>
      </span>
      <div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: '#1a1208', margin: 0 }}>{title}</p>
        {casy && <p style={{ fontSize: '12px', color: '#8a7f70', margin: '2px 0 0' }}>{casy}</p>}
        {note && <p style={{ fontSize: '12px', color: '#8a7f70', margin: '5px 0 0', overflowWrap: 'anywhere' }}>{note}</p>}
      </div>
    </div>
  )
}
