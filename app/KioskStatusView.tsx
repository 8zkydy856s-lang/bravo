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
  praveTed: string; dnesUzZavreno: string; pravdepodobne: string; otevrenoMale: string
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
  // (A) CHYTRÝ STATUS — úzký, max 3 řádky. „PRÁVĚ TEĎ" nahoře, „ZÍTRA:" dole zarovnané s ním.
  //  ř.1: STAV (tučně) + drobně „dnes 08:00–16:00"  ·  ř.2: výjimka (jen když je)  ·  ř.3: „ZÍTRA: pravděpodobně …"
  if (props.stav && props.stavLabels) {
    const s = props.stav, L = props.stavLabels
    const zavrenoDnes = s.faze === 'zavreno' || s.faze === 'po_zavirace'
    let title = L.otevreno
    if (s.faze === 'brzy_zavre') title = L.brzyZavirame
    else if (s.faze === 'brzy_otevre') title = L.brzyOtevreme
    else if (s.faze === 'pred_otevrenim') title = L.zatimZavreno
    else if (s.faze === 'po_zavirace') title = L.dnesUzZavreno
    else if (s.faze === 'zavreno') title = L.dnesZavreno

    // dnešní hodiny inline (jen když je dnes otevřeno / bude teprve otevírat)
    const dnesCas = (!zavrenoDnes && s.otevira && s.zavira) ? `${L.dnes} ${s.otevira}–${s.zavira}` : ''
    const note = s.poznamka?.trim() || ''

    // výhled na zítřek: buď vlastní text, nebo „pravděpodobně otevřeno/zavřeno" (+ čas). Slovo jemně zeleně/červeně.
    const otevrenoZitra = !!s.vyhledOtevreno
    const slovoZitra = otevrenoZitra ? L.otevrenoMale : L.zitraZavreno
    const barvaZitra = otevrenoZitra ? '#6f9350' : '#bd6a52'
    const casZitra = otevrenoZitra && s.vyhledOd && s.vyhledDo ? ` ${s.vyhledOd}–${s.vyhledDo}` : ''
    const zitraNadpis = <span style={{ letterSpacing: '0.06em', color: '#8a7f70' }}>{L.zitra.toUpperCase()}:</span>

    return (
      <div style={{ transform: 'translate(3px, 3px)' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#8b7d66', margin: '0 0 6px', textTransform: 'uppercase' }}>{L.praveTed}</p>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <Kvet barva={s.barva} />
          <div>
            <p style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1208' }}>{title}</span>
              {dnesCas && <span style={{ fontSize: '12px', color: '#8a7f70' }}>{dnesCas}</span>}
            </p>
            {note && <p style={{ fontSize: '12px', color: '#7c7162', margin: '4px 0 0', overflowWrap: 'anywhere' }}>{note}</p>}
          </div>
        </div>
        {!s.vyhledSkryto && (
          <p style={{ fontSize: '11px', color: '#9b8d76', margin: '8px 0 0' }}>
            {zitraNadpis}{' '}
            {s.vyhledText
              ? s.vyhledText
              : <>{L.pravdepodobne} <span style={{ color: barvaZitra }}>{slovoZitra}</span>{casZitra}</>}
          </p>
        )}
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
