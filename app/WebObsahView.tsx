// Sdílený vzhled obsahu z web_obsah - používá ho web (úvodní stránka) i náhled v adminu,
// aby vypadaly stejně. "Hloupé" prezentační komponenty bez načítání dat.

import { stylNaCss, type StylSdeleni } from './lib/sdeleniStyl'

export type SdeleniVzhled = 'splynout' | 'zvyraznit'

// Jedno volitelné sdělení (píše majitel, anglicky). Vzhled podle StylSdeleni:
// velikost/font/řez/barva/rámeček. Vnitřní obal je inline-block → obepne JEN text.
// `vzhled` = zpětná kompatibilita se starým editorem (jen zapne rámeček).
export function SdeleniRadek({ text, styl, vzhled }: { text: string; styl?: StylSdeleni; vzhled?: SdeleniVzhled }) {
  const css = stylNaCss(styl ?? (vzhled ? { ram: vzhled === 'zvyraznit' } : undefined))
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={css.obal}>
        <p style={css.text}>{text}</p>
      </div>
    </div>
  )
}

// Řádek "výhled na zítřek" - malý text jako uvnitř karty stavu.
export function ZitraRadek({ text }: { text: string }) {
  // Velkými písmeny přes CSS - nezávislé na tom, jak je text uložený v DB.
  return <p style={{ fontSize: '12px', color: '#8a7f70', margin: '8px 0 0', overflowWrap: 'anywhere', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{text}</p>
}
