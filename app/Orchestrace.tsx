'use client'
import { useEffect } from 'react'

// DIRIGENT struny. Pravidelný PULS „chvíle spočinutí" po celé stránce:
//  Fáze 1 „chvíle projede" = zlatá zář zleva doprava SOUČASNĚ přes všechna 3 místa .struna-chvile
//    (podtitul, morf před BraVo, popis ř.2); uprostřed průjezdu se POD světlem odhalí nová varianta morfu.
//  Fáze 2 „spočinutí zůstane" = klidná zář se usadí SOUČASNĚ na 3 místech .struna-spocin
//    (podtitul, provoz „spočinu", popis „spočine").
// Kotvy zatím běží nezávisle (přidají se později); dirigent je postaven fázově, aby šla anchor-fáze zapojit.
// reduced-motion → nespouští se (klid).

// JEDNA baterka, KONSTANTNÍ rychlost (linear). Fáze se PŘEKRÝVAJÍ → světlo projede plynule celou
// stránkou bez kroku/přerušení; morf se rozplyne O CHVÍLI DŘÍV, aby další cyklus naskočil bez čekání.
const SWEEP_MS = 3400      // baterka přejede „chvíle" (prosvítí podtitul/popis + napíše morf)
const OVERLAP = 1200       // spočinutí začne DŘÍV (o tolik před koncem sweepu) = plynulý přechod 1.→2. část
const FILL_MS = 3400       // „spočinutí" se rozsvítí přírůstkově STEJNOU rychlostí
const HOLD_MS = 300        // celé rozsvícené chvilku drží (spočine)
const ANCHOR_START = 1300  // kdy (do zhasínání) se začnou rozsvěcovat kotvy
const ANCHOR_STAGGER = 700 // rozestup mezi kroky kotev (pomaleji)
const GLOW_MS = 3800       // jak dlouho kotva září (nadech → drží → zhasne) — pomaleji
const LOOP_GAP = 700       // malý přesah — další puls naskočí, než kotvy dozní = plynulá smyčka
const DISSOLVE_LEAD = 1100 // o kolik dřív (před dalším cyklem) se morf rozplyne
// Pořadí rozsvěcování dle DOM pořadí kotev [BraVo, ZDE, OBA, TOBĚ, POZVÁNKA]:
// krok 0 = ZDE + POZVÁNKA (současně) → 1 = TOBĚ → 2 = OBA → 3 = BraVo
const ANCHOR_STEP = [3, 0, 2, 1, 0]

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
    const restart = (e: HTMLElement, cls: string) => { e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls) }

    const cycle = () => {
      // Baterka projede „chvíle" + NAPÍŠE nový tvar morfu (starý byl rozplynut ke konci předchozího cyklu)
      window.dispatchEvent(new CustomEvent('bravo-morf-write'))
      q('.struna-chvile').forEach((e) => restart(e, 'sweep'))
      q('.morf-slot').forEach((e) => restart(e, 'sweep-write'))
      later(() => { q('.struna-chvile').forEach((e) => e.classList.remove('sweep')); q('.morf-slot').forEach((e) => e.classList.remove('sweep-write')) }, SWEEP_MS)

      // „spočinutí" se rozsvítí — začne PŘED koncem sweepu (překryv) = plynulý přechod 1.→2. část
      const fillAt = SWEEP_MS - OVERLAP
      later(() => {
        q('.struna-spocin').forEach((e) => { e.classList.remove('fill', 'unfill'); restart(e, 'fill') })
        later(() => {
          // drží → symetrické ZHASNUTÍ (zleva doprava) + z pohasínání se rozsvěcují KOTVY
          q('.struna-spocin').forEach((e) => { e.classList.remove('fill'); restart(e, 'unfill') })
          q('.anchor').forEach((a, i) => {
            const step = ANCHOR_STEP[i] ?? i
            later(() => restart(a, 'glow'), ANCHOR_START + step * ANCHOR_STAGGER)
          })
        }, FILL_MS + HOLD_MS)
      }, fillAt)

      // délka cyklu — další puls naskočí, když kotvy ještě doznívají (plynulá smyčka)
      const period = fillAt + FILL_MS + HOLD_MS + ANCHOR_START + 3 * ANCHOR_STAGGER + LOOP_GAP
      // morf se rozplyne O CHVÍLI DŘÍV, ať je při dalším cyklu hned připraven (žádné čekání na švu)
      later(() => window.dispatchEvent(new CustomEvent('bravo-morf-dissolve')), period - DISSOLVE_LEAD)
      later(cycle, period)
    }

    later(cycle, 900) // krátká prodleva po načtení
    return () => { pending.forEach((id) => window.clearTimeout(id)); pending.clear() }
  }, [])

  return null
}
