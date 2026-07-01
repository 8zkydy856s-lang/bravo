'use client'
import { useEffect } from 'react'

// DIRIGENT struny. Pravidelný PULS „chvíle spočinutí" po celé stránce:
//  Fáze 1 „chvíle projede" = zlatá zář zleva doprava SOUČASNĚ přes všechna 3 místa .struna-chvile
//    (podtitul, morf před BraVo, popis ř.2); uprostřed průjezdu se POD světlem odhalí nová varianta morfu.
//  Fáze 2 „spočinutí zůstane" = klidná zář se usadí SOUČASNĚ na 3 místech .struna-spocin
//    (podtitul, provoz „spočinu", popis „spočine").
// Kotvy zatím běží nezávisle (přidají se později); dirigent je postaven fázově, aby šla anchor-fáze zapojit.
// reduced-motion → nespouští se (klid).

const DISSOLVE_MS = 1000 // než se starý tvar morfu rozplyne (opacity→0), pak teprve přijede světlo
// JEDNA baterka: chvíle i spočinutí = stejné světlo, stejná rychlost (4 s). Sekvenčně a plynule.
const SWEEP_MS = 4000    // světlo „chvíle" přejíždí (prosvítí podtitul/popis + napíše morf)
const FILL_MS = 4000     // „spočinutí": přírůstkové rozsvěcování STEJNOU rychlostí
const SIGH_MS = 2400     // povzdech: drží → zář se zvedne → pozvolna zhasne (jeden plynulý pohyb)
const GAP_MS = 2600      // klid mezi pulsy

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
        // Fáze 2 — „spočinutí": postupné rozsvěcování (přírůstek) → drží (spočine) → zář se zvýší → zhasne
        later(() => {
          q('.struna-chvile').forEach((e) => e.classList.remove('sweep'))
          q('.morf-slot').forEach((e) => e.classList.remove('sweep-write'))
          q('.struna-spocin').forEach((e) => { e.classList.remove('fill', 'sigh'); void e.offsetWidth; e.classList.add('fill') })
          later(() => {
            // celé rozsvíceno → jeden plynulý povzdech (drží → zvedne se → zhasne)
            q('.struna-spocin').forEach((e) => { e.classList.remove('fill'); void e.offsetWidth; e.classList.add('sigh') })
            later(() => {
              q('.struna-spocin').forEach((e) => e.classList.remove('sigh'))
              later(cycle, GAP_MS)
            }, SIGH_MS)
          }, FILL_MS)
        }, SWEEP_MS)
      }, DISSOLVE_MS)
    }

    later(cycle, 900) // krátká prodleva po načtení
    return () => { pending.forEach((id) => window.clearTimeout(id)); pending.clear() }
  }, [])

  return null
}
