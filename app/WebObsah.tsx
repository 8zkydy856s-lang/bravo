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

// Text o provozu - na webu primárně ze slovníku dle jazyka, DB jako fallback.
export function ProvozText() {
  const { lang } = useLang()
  const data = useContext(Ctx)
  const text = DICT.provozText[lang] || data?.provoz_text?.trim() || DEFAULT_PROVOZ
  return (
    <p className="landing-band-text" style={{ fontSize: '13px', lineHeight: 1.7, color: '#6f6253', whiteSpace: 'pre-wrap' }}>{text}</p>
  )
}

// Třířádkový popis kurzívou - ze slovníku dle jazyka.
export function PopisText() {
  const { lang } = useLang()
  const lines = [DICT.popisRadek1[lang], DICT.popisRadek2[lang], DICT.popisRadek3[lang]]
  return (
    <p style={{ fontSize: '13px', lineHeight: 1.8, color: '#6f6253', fontStyle: 'italic', margin: 0 }}>
      {lines.map((ln, i) => <span key={i}>{ln}{i < lines.length - 1 ? <br /> : null}</span>)}
    </p>
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
