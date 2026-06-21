// Sdílený vzhled obsahu z web_obsah - používá ho web (úvodní stránka) i náhled v adminu,
// aby vypadaly stejně. "Hloupé" prezentační komponenty bez načítání dat.

export type SdeleniVzhled = 'splynout' | 'zvyraznit'

// Jedno volitelné sdělení. Výška podle obsahu (auto), text se celý zalomí.
// - splynout = bez rámu, splývá s krémovým pozadím (tiché)
// - zvyraznit = jemné béžovo-zlatavé pozadí + tenký okraj (vystoupí, klidně)
export function SdeleniRadek({ text, vzhled = 'splynout' }: { text: string; vzhled?: SdeleniVzhled }) {
  const zvyraznit = vzhled === 'zvyraznit'
  return (
    <div style={{
      background: zvyraznit ? 'rgba(184,149,74,0.10)' : 'transparent',
      border: zvyraznit ? '1px solid rgba(184,149,74,0.35)' : 'none',
      borderRadius: '14px',
      padding: zvyraznit ? '11px 15px' : '4px 8px',
    }}>
      <p style={{
        fontSize: '13px', lineHeight: 1.6, color: '#6f6253', margin: 0, textAlign: 'center',
        overflowWrap: 'anywhere', whiteSpace: 'pre-wrap',
      }}>{text}</p>
    </div>
  )
}

// Řádek "výhled na zítřek" - malý text jako uvnitř karty stavu.
export function ZitraRadek({ text }: { text: string }) {
  return <p style={{ fontSize: '11px', color: '#8a7f70', margin: '8px 0 0', overflowWrap: 'anywhere' }}>{text}</p>
}
