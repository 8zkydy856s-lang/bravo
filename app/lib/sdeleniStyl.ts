// SDÍLENÝ STYL SDĚLENÍ — jeden zdroj pravdy pro web (WebObsahView) i admin (StatusSdeleni).
// 3 řádky sdělení píše výjimečně majitel (ANGLICKY — nepřekládá se). Každý řádek má vlastní vzhled:
// velikost (5), font (12), řez (4), barva (paleta + vlastní), rámeček (tenký, těsně obepne text,
// padding roste s velikostí písma). Úpravy lze aplikovat na 1/2/3 řádky současně (řídí admin).

import type { CSSProperties } from 'react'

export type Velikost = 'drobne' | 'male' | 'stredni' | 'vetsi' | 'velke'
export type Rez = 'normal' | 'bold' | 'italic' | 'bolditalic'
export type StylSdeleni = {
  velikost?: Velikost
  font?: string       // klíč z FONTY
  rez?: Rez
  barva?: string      // hex
  ram?: boolean
}

export const VELIKOSTI: { id: Velikost; label: string; px: number }[] = [
  { id: 'drobne', label: 'Drobné', px: 12 },
  { id: 'male', label: 'Malé', px: 14 },
  { id: 'stredni', label: 'Střední', px: 16 },
  { id: 'vetsi', label: 'Větší', px: 19 },
  { id: 'velke', label: 'Velké', px: 23 },
]

// 12 fondů. `css` = font-family; `nacist` = jak se objeví v Google Fonts URL (viz layout).
export const FONTY: { id: string; label: string; css: string }[] = [
  { id: 'inter', label: 'Inter', css: "'Inter', sans-serif" },
  { id: 'cormorant', label: 'Cormorant Garamond', css: "'Cormorant Garamond', serif" },
  { id: 'ebgaramond', label: 'EB Garamond', css: "'EB Garamond', serif" },
  { id: 'playfair', label: 'Playfair Display', css: "'Playfair Display', serif" },
  { id: 'lora', label: 'Lora', css: "'Lora', serif" },
  { id: 'baskerville', label: 'Libre Baskerville', css: "'Libre Baskerville', serif" },
  { id: 'spectral', label: 'Spectral', css: "'Spectral', serif" },
  { id: 'fraunces', label: 'Fraunces', css: "'Fraunces', serif" },
  { id: 'marcellus', label: 'Marcellus', css: "'Marcellus', serif" },
  { id: 'italiana', label: 'Italiana', css: "'Italiana', serif" },
  { id: 'josefin', label: 'Josefin Sans', css: "'Josefin Sans', sans-serif" },
  { id: 'tangerine', label: 'Tangerine (ozdobné)', css: "'Tangerine', cursive" },
]

export const REZY: { id: Rez; label: string }[] = [
  { id: 'normal', label: 'Normální' },
  { id: 'bold', label: 'Tučné' },
  { id: 'italic', label: 'Kurzíva' },
  { id: 'bolditalic', label: 'Tučná kurzíva' },
]

// Paleta tónů BRAVO (+ vlastní barva zvlášť v adminu)
export const BARVY_SDELENI: { hex: string; label: string }[] = [
  { hex: '#3d3123', label: 'Inkoust' },
  { hex: '#6f6253', label: 'Hnědá' },
  { hex: '#8a7f70', label: 'Tlumená' },
  { hex: '#b8954a', label: 'Zlatá' },
  { hex: '#9a7a2e', label: 'Tmavě zlatá' },
  { hex: '#4a7c30', label: 'Zelená' },
  { hex: '#a8432a', label: 'Červená' },
  { hex: '#3f5c7a', label: 'Modrá' },
]

export const DEFAULT_STYL: Required<StylSdeleni> = {
  velikost: 'stredni', font: 'inter', rez: 'normal', barva: '#6f6253', ram: false,
}

function pxVelikosti(v?: Velikost): number {
  return (VELIKOSTI.find(x => x.id === v)?.px) ?? 16
}
function cssFontu(id?: string): string {
  return (FONTY.find(f => f.id === id)?.css) ?? FONTY[0].css
}

// Ze StylSdeleni → CSS pro <p> (text) a pro obal (rámeček). Rámeček padding/rádius roste s velikostí.
export function stylNaCss(s?: StylSdeleni): { text: CSSProperties; obal: CSSProperties } {
  const st = { ...DEFAULT_STYL, ...(s || {}) }
  const px = pxVelikosti(st.velikost)
  const bold = st.rez === 'bold' || st.rez === 'bolditalic'
  const italic = st.rez === 'italic' || st.rez === 'bolditalic'
  const text: CSSProperties = {
    fontFamily: cssFontu(st.font),
    fontSize: `${px}px`,
    lineHeight: 1.5,
    fontWeight: bold ? 700 : 400,
    fontStyle: italic ? 'italic' : 'normal',
    color: st.barva,
    margin: 0,
    textAlign: 'center',
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
  }
  // rámeček těsně obepne text a reaguje na velikost písma
  const obal: CSSProperties = st.ram
    ? {
        display: 'inline-block', maxWidth: '100%', boxSizing: 'border-box',
        border: '1px solid rgba(120,90,40,0.30)',
        borderRadius: `${Math.round(px * 0.7)}px`,
        padding: `${Math.round(px * 0.42)}px ${Math.round(px * 0.85)}px`,
        background: 'rgba(184,149,74,0.06)',
      }
    : { display: 'inline-block', maxWidth: '100%', boxSizing: 'border-box', padding: `${Math.round(px * 0.18)}px ${Math.round(px * 0.3)}px` }
  return { text, obal }
}
