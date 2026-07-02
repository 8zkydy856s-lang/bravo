// Sdílený vizuál stavu kiosku. DVA režimy vstupu:
//  (A) NOVÝ (chytrý status): předá se `stav` (fáze + barva + časy + výhled) + `stavLabels` (překlady).
//  (B) STARÝ (zpětná kompatibilita): je_otevreno/časy/poznámka — pro staré /admin/stav.
// Stavový KVĚT: zelená otevřeno / jantar mezifáze / červená zavřeno.

import type { CSSProperties } from 'react'
import { BARVY, type Stav } from './lib/stav'

export type StatusLabels = { otevreno: string; dnesZavreno: string; od: string; do: string }
export type StavLabels = StatusLabels & {
  brzyOtevreme: string; zatimZavreno: string; brzyZavirame: string
  otevira: string; vyuzijChvili: string; zitra: string; zitraZavreno: string; dnes: string
}
const DEFAULT_LABELS: StatusLabels = { otevreno: 'Otevřeno', dnesZavreno: 'Dnes zavřeno', od: 'od', do: 'do' }

type Props = {
  je_otevreno?: boolean
  oteviraci_cas?: string | null
  zaviraci_cas?: string | null
  poznamka?: string | null
  dnesni_vyjimka?: boolean
  labels?: StatusLabels
  stav?: Stav
  stavLabels?: StavLabels
}

function Kvet({ barva }: { barva: 'zelena' | 'jantar' | 'cervena' }) {
  const c = BARVY[barva]
  return (
    <span className="stav-kvet" aria-hidden="true" style={{ ['--kv']: c.kv, ['--kvGlow']: c.glow } as CSSProperties}>
      <span className="rot"><span className="glyf">❀</span></span>
    </span>
  )
}

export default function KioskStatusView(props: Props) {
  // (A) CHYTRÝ STATUS — úzký, max 3 řádky:
  //  ř.1: STAV (tučně) + drobně „dnes 08:00–16:00"  ·  ř.2: výjimka (jen když je)  ·  ř.3: „Zítra: …"
  if (props.stav && props.stavLabels) {
    const s = props.stav, L = props.stavLabels
    let title = L.otevreno
    if (s.faze === 'brzy_zavre') title = L.brzyZavirame
    else if (s.faze === 'brzy_otevre') title = L.brzyOtevreme
    else if (s.faze === 'pred_otevrenim') title = L.zatimZavreno
    else if (s.faze === 'zavreno') title = L.dnesZavreno

    // dnešní hodiny inline (jen když je dnes otevřeno / bude otevírat)
    const dnesCas = (s.faze !== 'zavreno' && s.otevira && s.zavira) ? `${L.dnes} ${s.otevira}–${s.zavira}` : ''
    const note = s.poznamka?.trim() || ''
    let vyhled = ''
    if (s.vyhledText) vyhled = s.vyhledText
    else if (s.vyhledOtevreno && s.vyhledOd && s.vyhledDo) vyhled = `${L.zitra}: ${s.vyhledOd}–${s.vyhledDo}`
    else vyhled = `${L.zitra}: ${L.zitraZavreno}`

    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', transform: 'translate(3px, 3px)' }}>
        <Kvet barva={s.barva} />
        <div>
          <p style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1208' }}>{title}</span>
            {dnesCas && <span style={{ fontSize: '12px', color: '#8a7f70' }}>{dnesCas}</span>}
          </p>
          {note && <p style={{ fontSize: '12px', color: '#7c7162', margin: '4px 0 0', overflowWrap: 'anywhere' }}>{note}</p>}
          {vyhled && <p style={{ fontSize: '11px', color: '#9b8d76', margin: '4px 0 0' }}>{vyhled}</p>}
        </div>
      </div>
    )
  }

  // (B) STARÝ REŽIM (zpětná kompatibilita)
  const labels = props.labels ?? DEFAULT_LABELS
  const je_otevreno = !!props.je_otevreno
  let casy = ''
  if (je_otevreno && !props.dnesni_vyjimka) {
    const o = props.oteviraci_cas?.trim(); const z = props.zaviraci_cas?.trim()
    if (o && z) casy = `${o} – ${z}`
    else if (o) casy = `${labels.od} ${o}`
    else if (z) casy = `${labels.do} ${z}`
  }
  const note = props.poznamka?.trim() || ''
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', transform: 'translate(3px, 3px)' }}>
      <Kvet barva={je_otevreno ? 'zelena' : 'cervena'} />
      <div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: '#1a1208', margin: 0 }}>{je_otevreno ? labels.otevreno : labels.dnesZavreno}</p>
        {casy && <p style={{ fontSize: '12px', color: '#7c7162', margin: '2px 0 0' }}>{casy}</p>}
        {note && <p style={{ fontSize: '12px', color: '#7c7162', margin: '5px 0 0', overflowWrap: 'anywhere' }}>{note}</p>}
      </div>
    </div>
  )
}
