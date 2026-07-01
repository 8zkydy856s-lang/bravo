'use client'
import { useEffect } from 'react'

// DIRIGENT struny. Pravidelný PULS „chvíle spočinutí" po celé stránce:
//  Fáze 1 „chvíle projede" = zlatá zář zleva doprava SOUČASNĚ přes všechna 3 místa .struna-chvile
//    (podtitul, morf před BraVo, popis ř.2); uprostřed průjezdu se POD světlem odhalí nová varianta morfu.
//  Fáze 2 „spočinutí zůstane" = klidná zář se usadí SOUČASNĚ na 3 místech .struna-spocin
//    (podtitul, provoz „spočinu", popis „spočine").
// Kotvy zatím běží nezávisle (přidají se později); dirigent je postaven fázově, aby šla anchor-fáze zapojit.
// reduced-motion → nespouští se (klid).

const SWEEP_MS = 1800   // jak dlouho světlo „chvíle" projíždí
const SETTLE_MS = 1500  // jak dlouho „spočinutí" drží zář
const GAP_MS = 2200     // klid mezi pulsy

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
      // Fáze 1 — „chvíle" projede zleva doprava (restart animace přes reflow)
      q('.struna-chvile').forEach((e) => { e.classList.remove('sweep'); void e.offsetWidth; e.classList.add('sweep') })
      // uprostřed průjezdu odhalit nový tvar morfu POD světlem
      later(() => { window.dispatchEvent(new CustomEvent('bravo-morf-next')) }, SWEEP_MS / 2)
      // Fáze 2 — „spočinutí" se usadí, chvíli drží, pak vše zhasne a po pauze další puls
      later(() => {
        q('.struna-chvile').forEach((e) => e.classList.remove('sweep'))
        q('.struna-spocin').forEach((e) => e.classList.add('settle'))
        later(() => {
          q('.struna-spocin').forEach((e) => e.classList.remove('settle'))
          later(cycle, GAP_MS)
        }, SETTLE_MS)
      }, SWEEP_MS)
    }

    later(cycle, 900) // krátká prodleva po načtení
    return () => { pending.forEach((id) => window.clearTimeout(id)); pending.clear() }
  }, [])

  return null
}
