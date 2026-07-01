'use client'
import { useEffect, useRef, useState } from 'react'

// Skrytý editor poloh — aktivní JEN když je v URL ?uprav=bravo (tajné slovo).
// Běžný návštěvník ho nevidí; ani ?uprav bez slova ho nespustí.
// Vojtěch přetáhne prvky přesně kam chce (na SKUTEČNÉM webu), klikne „Kopírovat volby",
// vloží text Claudovi → Claude hodnoty zabetonuje natrvalo. Konec hádání ze slov.
const TAJNE_SLOVO = 'bravo'

type Cil = { sel: string; label: string }
const CILE: Cil[] = [
  { sel: 'header', label: 'Nápis + podtitul' },
  { sel: '.landing-photo', label: 'Obrázek vozíku' },
  { sel: '.landing-band', label: 'Provoz + status (blok)' },
  { sel: '.landing-band-status', label: 'Hello + status karta' },
  { sel: '.landing-desc', label: 'Popis' },
  { sel: '.landing-cta', label: 'Tlačítko lístek' },
  { sel: '.landing-links', label: 'Odkazy' },
]

type Off = { x: number; y: number }

function parseTranslate(el: HTMLElement): Off {
  const t = getComputedStyle(el).transform
  if (!t || t === 'none') return { x: 0, y: 0 }
  const m = t.match(/matrix\(([^)]+)\)/)
  if (m) { const p = m[1].split(','); return { x: Math.round(parseFloat(p[4]) || 0), y: Math.round(parseFloat(p[5]) || 0) } }
  return { x: 0, y: 0 }
}

export default function LayoutEditor() {
  const [active, setActive] = useState(false)
  const [, setTick] = useState(0)
  const offsets = useRef<Record<string, Off>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (new URLSearchParams(window.location.search).get('uprav') !== TAJNE_SLOVO) return
    setActive(true)

    const cleanups: (() => void)[] = []
    CILE.forEach((c) => {
      const el = document.querySelector(c.sel) as HTMLElement | null
      if (!el) return
      offsets.current[c.label] = parseTranslate(el)
      const prevOutline = el.style.outline
      const prevCursor = el.style.cursor
      el.style.outline = '1.5px dashed rgba(184,149,74,0.85)'
      el.style.cursor = 'move'

      let start: { px: number; py: number; ox: number; oy: number } | null = null
      const move = (ev: PointerEvent) => {
        if (!start) return
        const nx = Math.round(start.ox + (ev.clientX - start.px))
        const ny = Math.round(start.oy + (ev.clientY - start.py))
        offsets.current[c.label] = { x: nx, y: ny }
        el.style.transform = `translate(${nx}px, ${ny}px)`
        setTick((k) => k + 1)
      }
      const up = () => { start = null; document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up) }
      const down = (e: PointerEvent) => {
        e.preventDefault(); e.stopPropagation()
        const o = offsets.current[c.label]
        start = { px: e.clientX, py: e.clientY, ox: o.x, oy: o.y }
        document.addEventListener('pointermove', move)
        document.addEventListener('pointerup', up)
      }
      el.addEventListener('pointerdown', down)
      cleanups.push(() => {
        el.removeEventListener('pointerdown', down)
        el.style.outline = prevOutline
        el.style.cursor = prevCursor
      })
    })
    return () => cleanups.forEach((f) => f())
  }, [])

  if (!active) return null

  const radky = CILE.map((c) => {
    const o = offsets.current[c.label]
    return o ? `${c.label} (${c.sel}): x=${o.x}, y=${o.y}` : null
  }).filter(Boolean).join('\n')

  const kopiruj = () => {
    const txt = '=== Polohy z editoru (px) ===\n' + radky
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(
        () => alert('Zkopírováno ✓\nVlož Claudovi do chatu (Cmd+V).'),
        () => window.prompt('Zkopíruj tento text:', txt)
      )
    } else {
      window.prompt('Zkopíruj tento text:', txt)
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 99999, background: '#fffdf8', border: '1px solid #d8c8ad', borderRadius: 12, padding: 12, maxWidth: 320, fontFamily: 'Inter,sans-serif', fontSize: 12, boxShadow: '0 6px 22px rgba(60,40,15,0.18)' }}>
      <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#1a1208' }}>Editor poloh — táhni prvky myší</p>
      <p style={{ margin: '0 0 8px', color: '#9b8d76', fontSize: 11 }}>Čárkované prvky posouvej. Pak „Kopírovat" a vlož Claudovi.</p>
      <pre style={{ margin: '0 0 8px', whiteSpace: 'pre-wrap', color: '#6f6253', fontSize: 11, maxHeight: 150, overflow: 'auto' }}>{radky}</pre>
      <button onClick={kopiruj} style={{ background: '#4d4030', color: '#f6f1e6', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}>Kopírovat volby ⤓</button>
    </div>
  )
}
