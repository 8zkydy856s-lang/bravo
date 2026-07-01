'use client'
import { useEffect } from 'react'

// DIRIGENT struny. Pravidelný PULS „chvíle spočinutí" po celé stránce:
//  Fáze 1 „chvíle projede" = zlatá zář zleva doprava SOUČASNĚ přes všechna 3 místa .struna-chvile
//    (podtitul, morf před BraVo, popis ř.2); uprostřed průjezdu se POD světlem odhalí nová varianta morfu.
//  Fáze 2 „spočinutí zůstane" = klidná zář se usadí SOUČASNĚ na 3 místech .struna-spocin
//    (podtitul, provoz „spočinu", popis „spočine").
// Kotvy zatím běží nezávisle (přidají se později); dirigent je postaven fázově, aby šla anchor-fáze zapojit.
// reduced-motion → nespouští se (klid).

const DISSOLVE_MS = 900 // než se starý tvar morfu rozplyne (opacity→0), pak teprve přijede světlo
const SWEEP_MS = 3400   // jak dlouho světlo „chvíle" přejíždí (prosvítí podtitul/popis + napíše morf)
const SETTLE_MS = 1800  // jak dlouho „spočinutí" drží zář
const GAP_MS = 2600     // klid mezi pulsy

export default function Orchestrace() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const pending = new Set<number>()
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => { pending.delete(id); fn() }, ms)
      pending.add(id)
      return id
    }
    const q = (sel: string) => Array.from(document.querySelectorAll<HTMLElement>(sel))

    const cycle = () => {
      // Fáze 0 — starý tvar morfu se pozvolna rozplyne (opacity→0)
      window.dispatchEvent(new CustomEvent('bravo-morf-dissolve'))
      // Fáze 1 — po rozplynutí přijede SLADĚNÝ přejezd světla přes stránku:
      later(() => {
        window.dispatchEvent(new CustomEvent('bravo-morf-write')) // nastaví nový tvar (zatím neviditelný pod psacím světlem)
        q('.struna-chvile').forEach((e) => { e.classList.remove('sweep'); void e.offsetWidth; e.classList.add('sweep') })         // podtitul + popis: prosvícení
        q('.morf-slot').forEach((e) => { e.classList.remove('sweep-write'); void e.offsetWidth; e.classList.add('sweep-write') }) // morf: světlo NAPÍŠE nový výraz
        // Fáze 2 — po přejezdu se „spočinutí" usadí, chvíli drží, pak vše zhasne a po pauze další puls
        later(() => {
          q('.struna-chvile').forEach((e) => e.classList.remove('sweep'))
          q('.morf-slot').forEach((e) => e.classList.remove('sweep-write'))
          q('.struna-spocin').forEach((e) => e.classList.add('settle'))
          later(() => {
            q('.struna-spocin').forEach((e) => e.classList.remove('settle'))
            later(cycle, GAP_MS)
          }, SETTLE_MS)
        }, SWEEP_MS)
      }, DISSOLVE_MS)
    }

    later(cycle, 900) // krátká prodleva po načtení
    return () => { pending.forEach((id) => window.clearTimeout(id)); pending.clear() }
  }, [])

  return null
}
