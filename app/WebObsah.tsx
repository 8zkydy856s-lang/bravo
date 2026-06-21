'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { SdeleniRadek, ZitraRadek } from './WebObsahView'

// Načte řádek web_obsah jednou a sdílí ho přes context konzumentům (Sdeleni, ZitraVyhled).
// Tím se data čtou živě (jako KioskStatus), ale jen jedním dotazem pro celou stránku.

type WebObsahData = {
  sdeleni1_zap: boolean; sdeleni1_text: string | null
  sdeleni2_zap: boolean; sdeleni2_text: string | null
  sdeleni3_zap: boolean; sdeleni3_text: string | null
  zitra_zap: boolean; zitra_text: string | null
}

const Ctx = createContext<WebObsahData | null>(null)

export function WebObsahProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<WebObsahData | null>(null)
  useEffect(() => {
    let active = true
    supabase
      .from('web_obsah')
      .select('sdeleni1_zap, sdeleni1_text, sdeleni2_zap, sdeleni2_text, sdeleni3_zap, sdeleni3_text, zitra_zap, zitra_text')
      .eq('klic', 'hlavni')
      .maybeSingle()
      .then(({ data }) => { if (active) setData((data as WebObsahData | null) ?? null) })
    return () => { active = false }
  }, [])
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>
}

// Jedno sdělení podle pozice (1 nad statusem, 2 mezi statusem a popisem, 3 pod popisem).
// Vykreslí se jen když je zapnuté a má text.
export function Sdeleni({ pozice, className, style }: { pozice: 1 | 2 | 3; className?: string; style?: React.CSSProperties }) {
  const data = useContext(Ctx)
  if (!data) return null
  const zap = pozice === 1 ? data.sdeleni1_zap : pozice === 2 ? data.sdeleni2_zap : data.sdeleni3_zap
  const raw = pozice === 1 ? data.sdeleni1_text : pozice === 2 ? data.sdeleni2_text : data.sdeleni3_text
  const text = raw?.trim() || ''
  if (!zap || !text) return null
  return <div className={className} style={style}><SdeleniRadek text={text} /></div>
}

// Výhled na zítřek uvnitř karty stavu (nahrazuje dřívější pevný řádek).
export function ZitraVyhled() {
  const data = useContext(Ctx)
  if (!data) return null
  const text = data.zitra_text?.trim() || ''
  if (!data.zitra_zap || !text) return null
  return <ZitraRadek text={text} />
}
