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
const SWEEP_MS = 4000      // baterka přejede „chvíle" (prosvítí podtitul/popis + napíše morf) — o poloviční chlup pomaleji
const OVERLAP = 1580       // spočinutí začne DŘÍV (větší překryv) = plynulejší přechod chvíle→spočinutí bez skoku
const FILL_MS = 4000       // „spočinutí" se rozsvítí přírůstkově STEJNOU rychlostí
const HOLD_MS = 370        // celé rozsvícené chvilku drží (spočine)
// KOTVY = jeden akt: rozsvítí se v kaskádě (skoro naráz) až po BraVo; jakmile svítí BraVo,
// od prvních bodů se v téže řadě ZHASÍNÁ (BraVo poslední). Až BraVo úplně zhasne → nový puls.
const ANCHOR_START = 900   // kdy (do zhasínání spočinutí) se začnou rozsvěcovat kotvy
const ANCHOR_STAGGER = 380 // těsný rozestup — skoro naráz (o poloviční chlup pomaleji)
const ANCHOR_FADE = 950    // doba rozsvícení / zhasnutí jedné kotvy (jemné, = CSS transition .95s)
const MORF_DISSOLVE_AT = 370 // kdy (v anchor fázi) se morf rozplyne, ať je vedle BraVo prázdno, než BraVo zhasne
const LOOP_GAP = 295       // těsná pauza po ÚPLNÉM zhasnutí BraVo, pak nový puls (jeden akt, bez překrytí)
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
          // drží → symetrické ZHASNUTÍ spočinutí
          q('.struna-spocin').forEach((e) => { e.classList.remove('fill'); restart(e, 'unfill') })
          // KOTVY jako jeden akt: rozsvítí se v kaskádě (krok 0..3, BraVo poslední) a ZŮSTANOU svítit;
          // jakmile svítí BraVo (krok 3), od prvních bodů se v téže řadě ZHASÍNÁ (BraVo poslední).
          q('.anchor').forEach((a, i) => {
            const step = ANCHOR_STEP[i] ?? i
            later(() => a.classList.add('on'), ANCHOR_START + step * ANCHOR_STAGGER)              // rozsvítí, drží
            later(() => a.classList.remove('on'), ANCHOR_START + (3 + step) * ANCHOR_STAGGER)      // zhasíná (od okamžiku, kdy svítí BraVo)
          })
          // morf se rozplyne, ať je vedle BraVo PRÁZDNO, než BraVo dozáří/zhasne
          later(() => window.dispatchEvent(new CustomEvent('bravo-morf-dissolve')), MORF_DISSOLVE_AT)
          // NOVÝ PULS až po ÚPLNÉM zhasnutí BraVo (žádné překrytí svítící BraVo ↔ nový morf) + těsná pauza
          later(cycle, ANCHOR_START + 6 * ANCHOR_STAGGER + ANCHOR_FADE + LOOP_GAP)
        }, FILL_MS + HOLD_MS)
      }, fillAt)
    }

    later(cycle, 1000) // start orchestrace až PO vstupním zaostření (~0,85 s blur→sharp), pak teprve puls
    return () => { pending.forEach((id) => window.clearTimeout(id)); pending.clear() }
  }, [])

  return null
}
