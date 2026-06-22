// Sdílený vizuál stavu kiosku - jediné místo s pravidly zobrazení.
// Texty (Otevřeno/Dnes zavřeno/od/do) se předávají jako props - na webu přeložené
// podle jazyka, v admin náhledu zůstává český default.
//
// Pravidla:
//  - tečka: otevřeno = zelená (#4caf50), zavřeno = červená (#c0392b)
//  - časy: jen když je otevřeno A NENÍ dnešní výjimka
//  - poznámka: ukazuje se v obou stavech (je-li vyplněná)

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
  const dotColor = je_otevreno ? '#4caf50' : '#c0392b'
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor }} />
      <div>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#1a1208', margin: 0 }}>{title}</p>
        {casy && <p style={{ fontSize: '11px', color: '#8a7f70', margin: 0 }}>{casy}</p>}
        {note && <p style={{ fontSize: '11px', color: '#8a7f70', margin: 0 }}>{note}</p>}
      </div>
    </div>
  )
}
