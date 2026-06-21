// Sdílený vizuál stavu kiosku - jediné místo s pravidly zobrazení.
// Používá ho KioskStatus (web, načítá data z DB) i náhled v adminu (živě z formuláře).
// "Hloupá" prezentační komponenta: jen dostane hodnoty a vykreslí je.
//
// Pravidla (jednotná pro web i náhled):
//  - tečka: otevřeno = zelená (#4caf50), zavřeno = červená (#c0392b)
//  - časy: jen když je otevřeno A NENÍ dnešní výjimka
//  - poznámka: ukazuje se v obou stavech (je-li vyplněná)
type Props = {
  je_otevreno: boolean
  oteviraci_cas: string | null
  zaviraci_cas: string | null
  poznamka: string | null
  dnesni_vyjimka: boolean
}

export default function KioskStatusView({ je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, dnesni_vyjimka }: Props) {
  const dotColor = je_otevreno ? '#4caf50' : '#c0392b'
  const title = je_otevreno ? 'Otevřeno' : 'Dnes zavřeno'

  let casy = ''
  if (je_otevreno && !dnesni_vyjimka) {
    const o = oteviraci_cas?.trim()
    const z = zaviraci_cas?.trim()
    if (o && z) casy = `${o} – ${z}`
    else if (o) casy = `od ${o}`
    else if (z) casy = `do ${z}`
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
