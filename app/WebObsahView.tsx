// Sdílený vzhled obsahu z web_obsah - používá ho web (úvodní stránka) i náhled v adminu,
// aby vypadaly stejně. "Hloupé" prezentační komponenty bez načítání dat.

// Jedno volitelné sdělení (jemná karta s textem).
export function SdeleniRadek({ text }: { text: string }) {
  return (
    <div style={{ background: 'white', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '10px 14px' }}>
      <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#6b6057', margin: 0, textAlign: 'center' }}>{text}</p>
    </div>
  )
}

// Řádek "výhled na zítřek" - malý text jako uvnitř karty stavu.
export function ZitraRadek({ text }: { text: string }) {
  return <p style={{ fontSize: '11px', color: '#8a7f70', margin: '8px 0 0' }}>{text}</p>
}
