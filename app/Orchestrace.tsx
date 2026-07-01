'use client'
import { useEffect } from 'react'

// DIRIGENT struny. Pravidelný PULS „chvíle spočinutí" po celé stránce:
//  Fáze 1 „chvíle projede" = zlatá zář zleva doprava SOUČASNĚ přes všechna 3 místa .struna-chvile
//    (podtitul, morf před BraVo, popis ř.2); uprostřed průjezdu se POD světlem odhalí nová varianta morfu.
//  Fáze 2 „spočinutí zůstane" = klidná zář se usadí SOUČASNĚ na 3 místech .struna-spocin
//    (podtitul, provoz „spočinu", popis „spočine").
// Kotvy zatím běží nezávisle (přidají se později); dirigent je postaven fázově, aby šla anchor-fáze zapojit.
// reduced-motion → nespouští se (klid).

// JEDNA baterka, KONSTANTNÍ rychlost (linear) — švy na sebe navazují bez zpomalení = plynulé.
const DISSOLVE_MS = 900  // starý tvar morfu se rozplyne (opacity→0), pak přijede světlo
const SWEEP_MS = 3400    // baterka přejede „chvíle" (prosvítí podtitul/popis + napíše morf)
const FILL_MS = 3400     // „spočinutí" se rozsvítí přírůstkově STEJNOU rychlostí
const HOLD_MS = 500      // celé rozsvícené chvilku drží (spočine)
const UNFILL_MS = 3400   // „spočinutí" zhasne SYMETRICKY (zleva doprava, stejně jako se rozsvítilo)
const ANCHOR_START = 1300 // kdy (do zhasínání) se začnou rozsvěcovat kotvy
const ANCHOR_STAGGER = 450 // rozestup mezi jednotlivými kotvami
const GLOW_MS = 2600     // jak dlouho kotva září (nadech → drží → zhasne)
const GAP_MS = 2200      // klid mezi pulsy

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
        // Fáze 2 — „spočinutí": přírůstkové ROZSVÍCENÍ zleva doprava (stejná rychlost, zůstane)
        later(() => {
          q('.struna-chvile').forEach((e) => e.classList.remove('sweep'))
          q('.morf-slot').forEach((e) => e.classList.remove('sweep-write'))
          q('.struna-spocin').forEach((e) => { e.classList.remove('fill', 'unfill'); void e.offsetWidth; e.classList.add('fill') })
          later(() => {
            // Fáze 3 — chvilku DRŽÍ → symetrické ZHASNUTÍ (zleva doprava, stejně jako se rozsvítilo)
            q('.struna-spocin').forEach((e) => { e.classList.remove('fill'); void e.offsetWidth; e.classList.add('unfill') })
            // z pohasínání spočinutí vzejde postupné NADECHNUTÍ kotev (jedna po druhé)
            q('.anchor').forEach((a, i) => {
              later(() => { a.classList.remove('glow'); void a.offsetWidth; a.classList.add('glow') }, ANCHOR_START + i * ANCHOR_STAGGER)
            })
            // po zhasnutí spočinutí + dozáření kotev → další puls
            later(cycle, ANCHOR_START + 4 * ANCHOR_STAGGER + GLOW_MS + GAP_MS)
          }, FILL_MS + HOLD_MS)
        }, SWEEP_MS)
      }, DISSOLVE_MS)
    }

    later(cycle, 900) // krátká prodleva po načtení
    return () => { pending.forEach((id) => window.clearTimeout(id)); pending.clear() }
  }, [])

  return null
}
