'use client'
import { useEffect, useRef } from 'react'
import { useLang } from './LangContext'

// ŽIVÝ TEXT PROVOZU — přeneseno ze simulátoru + orchestrace.
// Struktura řádků je záměrná: 1. věta = řádek, 2. věta = 3 dechy (.cast = 3 řádky), 3. věta = řádek.
// MORF (nový model): celý tvar (za·chvíli·k) je v .morf-slot = PEVNÁ MEZERA (šířku drží engine),
// nová varianta se objeví VYCENTROVANÁ uprostřed → „Než se vydám ___ BraVo", BraVo se NEHNE.
// Proměnu řídí dirigent (Orchestrace) přes událost 'bravo-morf-next' — nový tvar se odhalí POD světlem
// (synchronně s pulsem struny), ne vlastním časovačem.

type Var = { pre: string; jadro: string; prep: string; _tw?: number }
type MData = { vars: Var[]; maxTotal?: number; order?: number[]; startPositions?: number[] }

const MORPH: Record<string, MData> = {
  cz: { vars: [
    { pre: 'za ', jadro: 'chvíli', prep: 'k' }, { pre: 'za ', jadro: 'chvíli', prep: 'u' }, { pre: 'za ', jadro: 'chvíli', prep: 's' },
    { pre: 'za ', jadro: 'chvílí', prep: 'k' }, { pre: 'za ', jadro: 'chvílí', prep: 'u' }, { pre: 'za ', jadro: 'chvílí', prep: 's' },
    { pre: '', jadro: 'chvílí', prep: 'k' }, { pre: '', jadro: 'chvílí', prep: 'u' }, { pre: '', jadro: 'chvílí', prep: 's' } ] },
  en: { vars: [
    { pre: '', jadro: 'a moment', prep: 'to' }, { pre: '', jadro: 'a moment', prep: 'at' },
    { pre: 'for ', jadro: 'a moment', prep: 'to' }, { pre: 'for ', jadro: 'a moment', prep: 'at' },
    { pre: 'in ', jadro: 'a moment', prep: 'to' }, { pre: 'in ', jadro: 'a moment', prep: 'at' } ] },
  fr: { vars: [
    { pre: '', jadro: 'un instant', prep: 'vers' }, { pre: '', jadro: 'un instant', prep: 'à' }, { pre: '', jadro: 'un instant', prep: 'chez' },
    { pre: 'dans ', jadro: 'un instant', prep: 'vers' }, { pre: 'dans ', jadro: 'un instant', prep: 'à' }, { pre: 'dans ', jadro: 'un instant', prep: 'chez' } ] },
  de: { vars: [
    { pre: '', jadro: 'eine Weile', prep: 'zu' }, { pre: '', jadro: 'eine Weile', prep: 'bei' },
    { pre: 'für ', jadro: 'eine Weile', prep: 'zu' }, { pre: 'für ', jadro: 'eine Weile', prep: 'bei' },
    { pre: 'in ', jadro: 'einer Weile', prep: 'zu' }, { pre: 'in ', jadro: 'einer Weile', prep: 'bei' } ] },
  lu: { vars: [
    { pre: '', jadro: 'eng Weil', prep: 'op' }, { pre: '', jadro: 'eng Weil', prep: 'bei' },
    { pre: 'fir ', jadro: 'eng Weil', prep: 'op' }, { pre: 'fir ', jadro: 'eng Weil', prep: 'bei' },
    { pre: 'an ', jadro: 'enger Weil', prep: 'op' }, { pre: 'an ', jadro: 'enger Weil', prep: 'bei' } ] },
}

// Strukturovaný text provozu (5 jazyků). Morf v .morf-slot (centrovaný). „spočinu"=.struna-spocin, jádro=.struna-chvile.
const PROVOZ: Record<string, string> = {
  cz: `<span class="veta veta1">Otevírací doba je <em>přibližná</em> a&nbsp;závisí na&nbsp;<em>počasí</em>.</span><span class="veta veta2"><span class="cast">Než se vydám <span class="morf-slot"><span class="chv-za">za&nbsp;</span><span class="chv-jadro">chvíli</span><span class="fx-k">&nbsp;k</span></span> <span class="anchor">BraVo</span>,</span><span class="cast">vždy nejdřív <span class="struna-spocin">spočinu</span> <span class="anchor">ZDE</span> a&nbsp;naladím se,</span><span class="cast">abychom se skutečně sešli <span class="anchor">OBA</span>&nbsp;připraveni.</span></span><span class="veta veta3">Těším se, děkuji <span class="anchor">TOBĚ</span> za&nbsp;pochopení<span class="fx-kvetina" aria-hidden="true"> ❀</span></span>`,
  en: `<span class="veta veta1">Hours are <em>approximate</em> and depend on the <em>weather</em>.</span><span class="veta veta2"><span class="cast">Before I set out <span class="morf-slot"><span class="chv-za">for&nbsp;</span><span class="chv-jadro">a&nbsp;moment</span><span class="fx-k">&nbsp;to</span></span> <span class="anchor">BraVo</span>,</span><span class="cast">I always <span class="struna-spocin">rest</span> <span class="anchor">HERE</span> first and tune in,</span><span class="cast">so we truly meet <span class="anchor">BOTH</span> of us ready.</span></span><span class="veta veta3">Looking forward, thank <span class="anchor">YOU</span> for understanding<span class="fx-kvetina" aria-hidden="true"> ❀</span></span>`,
  fr: `<span class="veta veta1">Les horaires sont <em>approximatifs</em>, selon la <em>météo</em>.</span><span class="veta veta2"><span class="cast">Avant de partir <span class="morf-slot"><span class="chv-za">dans&nbsp;</span><span class="chv-jadro">un&nbsp;instant</span><span class="fx-k">&nbsp;vers</span></span> <span class="anchor">BraVo</span>,</span><span class="cast"><span class="struna-spocin">je souffle</span> d'abord <span class="anchor">ICI</span> et je me mets au diapason,</span><span class="cast">pour qu'on se retrouve vraiment prêts <span class="anchor">TOUS LES DEUX</span>.</span></span><span class="veta veta3">Au plaisir, merci <span class="anchor">à&nbsp;TOI</span> pour la compréhension<span class="fx-kvetina" aria-hidden="true"> ❀</span></span>`,
  de: `<span class="veta veta1">Die Öffnungszeiten sind <em>ungefähr</em>, je nach <em>Wetter</em>.</span><span class="veta veta2"><span class="cast">Bevor ich <span class="morf-slot"><span class="chv-za">für&nbsp;</span><span class="chv-jadro">eine&nbsp;Weile</span><span class="fx-k">&nbsp;zu</span></span> <span class="anchor">BraVo</span> aufbreche,</span><span class="cast"><span class="struna-spocin">verweile ich</span> zuerst <span class="anchor">HIER</span> und stimme mich ein,</span><span class="cast">damit wir uns wirklich <span class="anchor">BEIDE</span> bereit begegnen.</span></span><span class="veta veta3">Ich freue mich, danke <span class="anchor">DIR</span> fürs Verständnis<span class="fx-kvetina" aria-hidden="true"> ❀</span></span>`,
  lu: `<span class="veta veta1">D'Öffnungszäiten si <em>ongeféier</em>, je no <em>Wieder</em>.</span><span class="veta veta2"><span class="cast">Ier ech <span class="morf-slot"><span class="chv-za">fir&nbsp;</span><span class="chv-jadro">eng&nbsp;Weil</span><span class="fx-k">&nbsp;op</span></span> <span class="anchor">BraVo</span> lassginn,</span><span class="cast"><span class="struna-spocin">verweilen ech</span> als éischt <span class="anchor">HEI</span> a stëmme mech an,</span><span class="cast">fir datt mir eis wierklech <span class="anchor">BEIDS</span> prett begéinen.</span></span><span class="veta veta3">Ech freeë mech, merci <span class="anchor">DIR</span> fir d'Verständnis<span class="fx-kvetina" aria-hidden="true"> ❀</span></span>`,
}

const NBSP = ' '

function mereni(root: HTMLElement, t: string): number {
  const s = document.createElement('span')
  s.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;'
  s.textContent = t
  root.appendChild(s)
  const w = s.getBoundingClientRect().width
  s.remove()
  return w
}

function morphBuild(lang: string, root: HTMLElement): MData | null {
  const D = MORPH[lang]
  if (!D) return null
  let maxTotal = 0
  D.vars.forEach((v) => {
    const s = (v.pre.trim() ? v.pre.trim() + NBSP : '') + v.jadro + NBSP + v.prep
    v._tw = mereni(root, s)
    if (v._tw > maxTotal) maxTotal = v._tw
  })
  D.maxTotal = Math.ceil(maxTotal) + 2
  // POŘADÍ: prokládat DELŠÍ/KRATŠÍ (žádné dvě kratší za sebou = žádná dvojitá optická díra).
  // Seřadit dle šířky sestupně a brát střídavě z nejširšího a nejužšího konce.
  const byW = D.vars.map((v, i) => ({ i, w: v._tw || 0 })).sort((a, b) => b.w - a.w)
  const order: number[] = []
  let lo = 0, hi = byW.length - 1, takeWide = true
  while (lo <= hi) { if (takeWide) order.push(byW[lo++].i); else order.push(byW[hi--].i); takeWide = !takeWide }
  D.order = order
  // start z jednoho ze DVOU NEJDELŠÍCH (v order jsou na pozicích 0 a 2) — střídá se návštěvu od návštěvy
  D.startPositions = [0, Math.min(2, order.length - 1)]
  return D
}

// nastaví obsah morf-slotu na danou variantu (vycentrovanou v pevné šířce)
function morphSet(root: HTMLElement, D: MData, vi: number) {
  const v = D.vars[vi]
  const slot = root.querySelector<HTMLElement>('.morf-slot')
  const chvza = root.querySelector<HTMLElement>('.chv-za')
  const jad = root.querySelector<HTMLElement>('.chv-jadro')
  const fxk = root.querySelector<HTMLElement>('.fx-k')
  if (slot && D.maxTotal) { slot.style.width = D.maxTotal + 'px' }
  if (chvza) chvza.textContent = v.pre.trim() ? v.pre.trim() + NBSP : ''
  if (jad) jad.textContent = v.jadro
  if (fxk) fxk.textContent = NBSP + v.prep
}

// MIZENÍ: celý tvar se POZVOLNA rozplyne úplně do ztracena (opacity → 0). Ne světlem, prostě zmizí.
function morphDissolve(root: HTMLElement) {
  const slot = root.querySelector<HTMLElement>('.morf-slot')
  if (!slot) return
  slot.style.transition = 'opacity 1.6s ease-in-out'
  slot.style.opacity = '0'
}
// PSANÍ SVĚTLEM: nastaví CELÝ nový výraz (vycentrovaný) a krytí OKAMŽITĚ zpět na 1;
// viditelnost pak řídí .sweep-write — světlo text napíše zleva doprava (za světlem JE, před ním NENÍ).
// Volá dirigent těsně před přejezdem světla, aby objevení bylo sjednocené s baterkou.
function morphWriteNew(root: HTMLElement, D: MData, vi: number) {
  const slot = root.querySelector<HTMLElement>('.morf-slot')
  morphSet(root, D, vi)
  if (slot) { slot.style.transition = 'none'; slot.style.opacity = '1' }
}

export default function ProvozZivot() {
  const { lang } = useLang()
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const D = morphBuild(lang, root)
    if (!D) return
    const order = D.order || D.vars.map((_, i) => i)
    const starts = D.startPositions || [0]
    // PRVNÍ pořádný tvar (co světlo napíše jako první) = jeden ze 2 NEJDELŠÍCH (střídavě) → celistvý první zážitek.
    const chosenLong = starts[Math.random() < 0.5 ? 0 : 1] ?? starts[0]
    let pos = (chosenLong - 1 + order.length) % order.length // aby první proměna dopadla na nejdelší
    // Výchozí (krátký) tvar, který se hned prví proměnou přepíše na nejdelší (ne naopak).
    const initialShort = order.length > 1 ? order[1] : order[0]
    morphSet(root, D, initialShort)
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { morphSet(root, D, order[chosenLong]); return } // bez pohybu rovnou nejdelší
    const onDissolve = () => { morphDissolve(root) }
    const onWrite = () => { pos = (pos + 1) % order.length; morphWriteNew(root, D, order[pos]) }
    window.addEventListener('bravo-morf-dissolve', onDissolve)
    window.addEventListener('bravo-morf-write', onWrite)
    return () => {
      window.removeEventListener('bravo-morf-dissolve', onDissolve)
      window.removeEventListener('bravo-morf-write', onWrite)
    }
  }, [lang])

  return (
    <p ref={ref} className="landing-band-text veta-blok" style={{ fontSize: '13px', lineHeight: 1.7, color: '#6f6253' }}
       dangerouslySetInnerHTML={{ __html: PROVOZ[lang] || PROVOZ.cz }} />
  )
}
