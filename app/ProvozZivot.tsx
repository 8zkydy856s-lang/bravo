'use client'
import { useEffect, useRef } from 'react'
import { useLang } from './LangContext'

// ŽIVÝ TEXT PROVOZU — přeneseno ze simulátoru (bravo-simulator _9).
// Věta 2 se PROMĚŇUJE: předložka k→u→s + „chvíli" (za chvíli → za chvílí → chvílí),
// 9 variant CZ / 6 ostatní jazyky. Kořen (jádro) drží na místě, prefix mizí přes opacity
// (DRŽÍ MÍSTO), koncovka i předložka se mění prolnutím. Kotva „BraVo" se NEHNE (drift 0)
// díky rezervaci šířky (maxPre/maxPrep/maxJad) — a tím se také nikdy nevytvoří řádek navíc.
// Struktura řádků je záměrná: 1. věta = řádek, 2. věta = 3 dechy (.cast = 3 řádky), 3. věta = řádek.

type Var = { pre: string; jadro: string; prep: string; _pw?: number; _prepw?: number; _jw?: number; _hole?: number }
type MData = { root: string; prepAlign: string; jadReserve?: string; vars: Var[]; maxPre?: number; maxPrep?: number; maxJad?: number; order?: number[]; startPos?: number[] }

const MORPH: Record<string, MData> = {
  cz: { root: 'chvíl', prepAlign: 'right', vars: [
    { pre: 'za ', jadro: 'chvíli', prep: 'k' }, { pre: 'za ', jadro: 'chvíli', prep: 'u' }, { pre: 'za ', jadro: 'chvíli', prep: 's' },
    { pre: 'za ', jadro: 'chvílí', prep: 'k' }, { pre: 'za ', jadro: 'chvílí', prep: 'u' }, { pre: 'za ', jadro: 'chvílí', prep: 's' },
    { pre: '', jadro: 'chvílí', prep: 'k' }, { pre: '', jadro: 'chvílí', prep: 'u' }, { pre: '', jadro: 'chvílí', prep: 's' } ] },
  en: { root: 'a while', prepAlign: 'right', vars: [
    { pre: '', jadro: 'a while', prep: 'to' }, { pre: '', jadro: 'a while', prep: 'at' },
    { pre: 'for ', jadro: 'a while', prep: 'to' }, { pre: 'for ', jadro: 'a while', prep: 'at' },
    { pre: 'in ', jadro: 'a while', prep: 'to' }, { pre: 'in ', jadro: 'a while', prep: 'at' } ] },
  fr: { root: 'un instant', prepAlign: 'right', vars: [
    { pre: '', jadro: 'un instant', prep: 'vers' }, { pre: '', jadro: 'un instant', prep: 'à' }, { pre: '', jadro: 'un instant', prep: 'chez' },
    { pre: 'dans ', jadro: 'un instant', prep: 'vers' }, { pre: 'dans ', jadro: 'un instant', prep: 'à' }, { pre: 'dans ', jadro: 'un instant', prep: 'chez' } ] },
  de: { root: 'eine Weile', prepAlign: 'right', jadReserve: 'right', vars: [
    { pre: '', jadro: 'eine Weile', prep: 'zu' }, { pre: '', jadro: 'eine Weile', prep: 'bei' },
    { pre: 'für ', jadro: 'eine Weile', prep: 'zu' }, { pre: 'für ', jadro: 'eine Weile', prep: 'bei' },
    { pre: 'in ', jadro: 'einer Weile', prep: 'zu' }, { pre: 'in ', jadro: 'einer Weile', prep: 'bei' } ] },
  lu: { root: 'eng Weil', prepAlign: 'right', jadReserve: 'right', vars: [
    { pre: '', jadro: 'eng Weil', prep: 'op' }, { pre: '', jadro: 'eng Weil', prep: 'bei' },
    { pre: 'fir ', jadro: 'eng Weil', prep: 'op' }, { pre: 'fir ', jadro: 'eng Weil', prep: 'bei' },
    { pre: 'an ', jadro: 'enger Weil', prep: 'op' }, { pre: 'an ', jadro: 'enger Weil', prep: 'bei' } ] },
}

// Strukturovaný text provozu (5 jazyků) — přesně ze simulátoru: dechy (.cast), kotvy (.anchor),
// morf sloty (.fx-chvili/.chv-za/.chv-jadro/.fx-k), nezlomitelné mezery (&nbsp;), kurzíva (<em>).
const PROVOZ: Record<string, string> = {
  cz: `<span class="veta veta1">Otevírací doba je <em>přibližná</em> a&nbsp;závisí na&nbsp;<em>počasí</em>.</span><span class="veta veta2"><span class="cast">Než se <span class="mark">vydám<span class="fx-chvili"><span class="chv-za">za&nbsp;</span><span class="chv-jadro">chvílí</span></span><span class="fx-k">k</span></span> <span class="anchor">BraVo</span>,</span><span class="cast">vždy nejdřív spočinu <span class="anchor">ZDE</span> a&nbsp;naladím se,</span><span class="cast">abychom se <span class="mark">skutečně</span> sešli <span class="anchor">OBA</span>&nbsp;připraveni.</span></span><span class="veta veta3">Těším se, děkuji <span class="anchor">TOBĚ</span> za&nbsp;pochopení<span class="fx-kvetina" aria-hidden="true"> ❀</span></span>`,
  en: `<span class="veta veta1">Hours are <em>approximate</em> and depend on the <em>weather</em>.</span><span class="veta veta2"><span class="cast">Before I set out<span class="fx-chvili"><span class="chv-za">for&nbsp;</span><span class="chv-jadro mark">a&nbsp;while</span></span><span class="fx-k">to</span> <span class="anchor">BraVo</span>,</span><span class="cast">I always <span class="mark">rest</span> <span class="anchor">HERE</span> first and tune in,</span><span class="cast">so we <span class="mark">truly</span> meet <span class="anchor">BOTH</span> of us ready.</span></span><span class="veta veta3">Looking forward, thank <span class="anchor">YOU</span> for understanding<span class="fx-kvetina" aria-hidden="true"> ❀</span></span>`,
  fr: `<span class="veta veta1">Les horaires sont <em>approximatifs</em>, selon la <em>météo</em>.</span><span class="veta veta2"><span class="cast">Avant de partir<span class="fx-chvili"><span class="chv-za">dans&nbsp;</span><span class="chv-jadro mark">un&nbsp;instant</span></span><span class="fx-k">vers</span> <span class="anchor">BraVo</span>,</span><span class="cast">je <span class="mark">souffle</span> d'abord <span class="anchor">ICI</span> et je me mets au diapason,</span><span class="cast">pour qu'on se retrouve <span class="mark">vraiment</span> prêts <span class="anchor">TOUS LES DEUX</span>.</span></span><span class="veta veta3">Au plaisir, merci <span class="anchor">à&nbsp;TOI</span> pour la compréhension<span class="fx-kvetina" aria-hidden="true"> ❀</span></span>`,
  de: `<span class="veta veta1">Die Öffnungszeiten sind <em>ungefähr</em>, je nach <em>Wetter</em>.</span><span class="veta veta2"><span class="cast">Bevor ich<span class="fx-chvili"><span class="chv-za">für&nbsp;</span><span class="chv-jadro mark">eine&nbsp;Weile</span></span><span class="fx-k">zu</span> <span class="anchor">BraVo</span> aufbreche,</span><span class="cast"><span class="mark">verweile</span> ich zuerst <span class="anchor">HIER</span> und stimme mich ein,</span><span class="cast">damit wir uns <span class="mark">wirklich</span> <span class="anchor">BEIDE</span> bereit begegnen.</span></span><span class="veta veta3">Ich freue mich, danke <span class="anchor">DIR</span> fürs Verständnis<span class="fx-kvetina" aria-hidden="true"> ❀</span></span>`,
  lu: `<span class="veta veta1">D'Öffnungszäiten si <em>ongeféier</em>, je no <em>Wieder</em>.</span><span class="veta veta2"><span class="cast">Ier ech<span class="fx-chvili"><span class="chv-za">fir&nbsp;</span><span class="chv-jadro mark">eng&nbsp;Weil</span></span><span class="fx-k">op</span> <span class="anchor">BraVo</span> lassginn,</span><span class="cast"><span class="mark">verweilen</span> ech als éischt <span class="anchor">HEI</span> a stëmme mech an,</span><span class="cast">fir datt mir eis <span class="mark">wierklech</span> <span class="anchor">BEIDS</span> prett begéinen.</span></span><span class="veta veta3">Ech freeë mech, merci <span class="anchor">DIR</span> fir d'Verständnis<span class="fx-kvetina" aria-hidden="true"> ❀</span></span>`,
}

const BARVA = '#a9763a' // zlatá — jemný nádech při prolnutí (ladí s dechem kotev; snadno laditelné)

function mereni(root: HTMLElement, t: string): number {
  const s = document.createElement('span')
  s.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;'
  s.textContent = t.replace(/ /g, ' ')
  root.appendChild(s)
  const w = s.getBoundingClientRect().width
  s.remove()
  return w
}

function morphBuild(lang: string, root: HTMLElement): MData | null {
  const D = MORPH[lang]
  if (!D) return null
  let maxPre = 0, maxPrep = 0, maxJad = 0
  D.vars.forEach((v) => {
    v._pw = mereni(root, v.pre.trim()); v._prepw = mereni(root, v.prep); v._jw = mereni(root, v.jadro)
    if (v._pw > maxPre) maxPre = v._pw; if (v._prepw > maxPrep) maxPrep = v._prepw; if (v._jw > maxJad) maxJad = v._jw
  })
  D.vars.forEach((v) => { v._hole = (maxPre - v._pw!) + (maxPrep - v._prepw!) })
  D.maxPre = maxPre; D.maxPrep = maxPrep; D.maxJad = maxJad
  const sorted = D.vars.map((v, i) => ({ i, h: v._hole! })).sort((a, b) => a.h - b.h)
  const order: number[] = []; let lo = 0, hi = sorted.length - 1, takeLo = true
  while (lo <= hi) { if (takeLo) order.push(sorted[lo++].i); else order.push(sorted[hi--].i); takeLo = !takeLo }
  D.order = order
  const byHole = order.map((oi, pos) => ({ pos, h: D.vars[oi]._hole! })).sort((a, b) => a.h - b.h)
  D.startPos = [byHole[0].pos, byHole[1].pos]
  return D
}

// aplikuje JEDNU variantu na živé elementy věty 2 — celá skupina se mění naráz prolnutím.
function morphApply(root: HTMLElement, D: MData, vi: number, instant: boolean) {
  const v = D.vars[vi]
  const pres = root.querySelectorAll<HTMLElement>('.chv-za')
  const jads = root.querySelectorAll<HTMLElement>('.chv-jadro')
  const preps = root.querySelectorAll<HTMLElement>('.fx-k')
  const setGroup = () => {
    pres.forEach((e) => {
      e.style.display = 'inline-block'; e.style.width = (D.maxPre! + 2) + 'px'; e.style.textAlign = 'left'
      e.style.whiteSpace = 'nowrap'; e.style.verticalAlign = 'baseline'; e.style.overflow = 'visible'
      e.style.marginLeft = '0.30em'; e.style.marginRight = '0'
      e.textContent = v.pre.trim()
      e.style.visibility = v.pre.trim() ? 'visible' : 'hidden'
    })
    jads.forEach((e) => {
      e.style.display = 'inline-block'; e.style.verticalAlign = 'baseline'; e.style.whiteSpace = 'nowrap'
      e.style.padding = '0 0.22em'
      if (D.jadReserve) { e.style.width = (D.maxJad! + 2) + 'px'; e.style.textAlign = D.jadReserve }
      else { e.style.width = ''; e.style.textAlign = '' }
      e.textContent = v.jadro
    })
    preps.forEach((e) => {
      e.style.display = 'inline-block'; e.style.width = D.maxPrep + 'px'; e.style.overflow = 'visible'
      e.style.textAlign = (D.prepAlign || 'left'); e.style.whiteSpace = 'nowrap'; e.style.verticalAlign = 'baseline'; e.style.marginRight = '0'
      e.textContent = v.prep
    })
  }
  if (instant) { setGroup(); return }
  const sets = [pres, jads, preps]
  sets.forEach((set) => set.forEach((e) => { e.style.transition = 'opacity .9s ease,color .9s ease'; e.style.opacity = '0.25'; e.style.color = BARVA }))
  window.setTimeout(() => {
    setGroup()
    sets.forEach((set) => set.forEach((e) => { e.style.opacity = '1'; window.setTimeout(() => { e.style.color = '' }, 500) }))
  }, 900)
}

export default function ProvozZivot() {
  const { lang } = useLang()
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const D = morphBuild(lang, root)
    if (!D || !D.order) return
    // start: náhodně 1. nebo 2. nejkompaktnější varianta (klid + různost)
    let pos = D.startPos![Math.floor(Math.random() * 2)]
    morphApply(root, D, D.order[pos], true)
    // respekt k reduced-motion: text zůstane staticky ve výchozí variantě, necyklí
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const timer = window.setInterval(() => {
      pos = (pos + 1) % D.order!.length
      morphApply(root, D, D.order![pos], false)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [lang])

  return (
    <p ref={ref} className="landing-band-text veta-blok" style={{ fontSize: '13px', lineHeight: 1.7, color: '#6f6253' }}
       dangerouslySetInnerHTML={{ __html: PROVOZ[lang] || PROVOZ.cz }} />
  )
}
