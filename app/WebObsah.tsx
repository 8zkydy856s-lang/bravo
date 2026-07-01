'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { SdeleniRadek, ZitraRadek, SdeleniVzhled } from './WebObsahView'
import { useLang } from './LangContext'
import { DICT } from './i18n'
import { PinIkona } from './Ikony'

// Načte řádek web_obsah jednou a sdílí ho přes context konzumentům.
// Data se čtou živě (jako KioskStatus), ale jen jedním dotazem pro celou stránku.

// Výchozí texty = stejné jako defaulty v DB. Slouží jako fallback, než se data načtou,
// aby na úvodní stránce neproblikla prázdná místa.
export const DEFAULT_PROVOZ = 'Otevírací doba je přibližná a závisí na počasí. Než vyrazíš za BRAVEM, vždy se podívej na aktuální stav, ať mě tu najdeš. Děkuji za pochopení.'
export const DEFAULT_POPIS = 'Speciální káva, čaj, květiny a klasická hudba.\nNápoje laděné na míru, podle tvé chuti.\nPozvánka k zastavení v každém všedním dni.'
export const DEFAULT_MAPS = 'https://maps.app.goo.gl/2gwzhh7xnpfEp7Lt9'

type WebObsahData = {
  sdeleni1_zap: boolean; sdeleni1_text: string | null; sdeleni1_vzhled: SdeleniVzhled
  sdeleni2_zap: boolean; sdeleni2_text: string | null; sdeleni2_vzhled: SdeleniVzhled
  sdeleni3_zap: boolean; sdeleni3_text: string | null; sdeleni3_vzhled: SdeleniVzhled
  zitra_zap: boolean; zitra_text: string | null
  maps_odkaz: string | null
  provoz_text: string | null
  popis_text: string | null
}

const Ctx = createContext<WebObsahData | null>(null)

export function WebObsahProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<WebObsahData | null>(null)
  useEffect(() => {
    let active = true
    supabase
      .from('web_obsah')
      .select('sdeleni1_zap, sdeleni1_text, sdeleni1_vzhled, sdeleni2_zap, sdeleni2_text, sdeleni2_vzhled, sdeleni3_zap, sdeleni3_text, sdeleni3_vzhled, zitra_zap, zitra_text, maps_odkaz, provoz_text, popis_text')
      .eq('klic', 'hlavni')
      .maybeSingle()
      .then(({ data }) => { if (active) setData((data as WebObsahData | null) ?? null) })
    return () => { active = false }
  }, [])
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>
}

// Jedno sdělení podle pozice. Vykreslí se jen když je zapnuté a má text; vzhled dle DB.
export function Sdeleni({ pozice, className, style }: { pozice: 1 | 2 | 3; className?: string; style?: React.CSSProperties }) {
  const data = useContext(Ctx)
  if (!data) return null
  const zap = pozice === 1 ? data.sdeleni1_zap : pozice === 2 ? data.sdeleni2_zap : data.sdeleni3_zap
  const raw = pozice === 1 ? data.sdeleni1_text : pozice === 2 ? data.sdeleni2_text : data.sdeleni3_text
  const vzhled = pozice === 1 ? data.sdeleni1_vzhled : pozice === 2 ? data.sdeleni2_vzhled : data.sdeleni3_vzhled
  const text = raw?.trim() || ''
  if (!zap || !text) return null
  return <div className={className} style={style}><SdeleniRadek text={text} vzhled={vzhled === 'zvyraznit' ? 'zvyraznit' : 'splynout'} /></div>
}

// Výhled na zítřek uvnitř karty stavu.
export function ZitraVyhled() {
  const data = useContext(Ctx)
  if (!data) return null
  const text = data.zitra_text?.trim() || ''
  if (!data.zitra_zap || !text) return null
  return <ZitraRadek text={text} />
}

// Text mezi *…* vykreslí kurzívou; ostatní normálně.
function sKurzivou(text: string) {
  return text.split('*').map((cast, i) => (i % 2 === 1 ? <em key={i}>{cast}</em> : <span key={i}>{cast}</span>))
}

// Text o provozu - na webu primárně ze slovníku dle jazyka, DB jako fallback.
export function ProvozText() {
  const { lang } = useLang()
  const data = useContext(Ctx)
  const text = DICT.provozText[lang] || data?.provoz_text?.trim() || DEFAULT_PROVOZ
  return (
    <p className="landing-band-text" style={{ fontSize: '13px', lineHeight: 1.7, color: '#655a4b', whiteSpace: 'pre-wrap' }}>{sKurzivou(text)}</p>
  )
}

// Slova struny + kotva v popisu (dle jazyka) — pro orchestraci obalíme do značek.
// ř.2 nese „chvíle"-slovo (.struna-chvile), ř.3 nese kotvu POZVÁNKA (.anchor) + „spočin-" (.struna-spocin).
const POPIS_STRUNA: Record<string, { chvile: string; spocin: string; kotva: string }> = {
  cz: { chvile: 'chvíle', spocin: 'spočine', kotva: 'POZVÁNKA' },
  en: { chvile: 'moment', spocin: 'rests', kotva: 'INVITATION' },
  fr: { chvile: 'instant', spocin: 'souffle', kotva: 'INVITATION' },
  de: { chvile: 'Weile', spocin: 'verweilt', kotva: 'EINLADUNG' },
  lu: { chvile: 'Weil', spocin: 'verweilt', kotva: 'ANVITATIOUN' },
}
function obal(text: string, slovo: string, cls: string) {
  return text.replace(slovo, `<span class="${cls}">${slovo}</span>`)
}

// Třířádkový popis kurzívou - ze slovníku dle jazyka, se značkami struny/kotvy.
export function PopisText() {
  const { lang } = useLang()
  const s = POPIS_STRUNA[lang] || POPIS_STRUNA.cz
  const l1 = DICT.popisRadek1[lang]
  const l2 = obal(DICT.popisRadek2[lang], s.chvile, 'struna-chvile')
  const l3 = obal(obal(DICT.popisRadek3[lang], s.kotva, 'anchor'), s.spocin, 'struna-spocin')
  const html = [l1, l2, l3].join('<br/>')
  return (
    <p className="popis-struna" style={{ fontSize: '14px', lineHeight: 1.8, color: '#3d3123', fontStyle: 'italic', margin: 0 }}
       dangerouslySetInnerHTML={{ __html: html }} />
  )
}

// Odkaz "Následuj mě" (mapový odkaz z DB, fallback default; label ze slovníku). Styl zvenčí.
export function NavigujOdkaz({ style }: { style?: React.CSSProperties }) {
  const { lang } = useLang()
  const data = useContext(Ctx)
  const href = data?.maps_odkaz?.trim() || DEFAULT_MAPS
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
      <PinIkona /><span>{DICT.nasledujMe[lang]}</span>
    </a>
  )
}
