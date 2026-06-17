'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

// Karta důvěry uprostřed úvodní stránky.
// - přihlášen   -> skutečné jméno (jmeno -> prezdivka -> e-mail). Body zatím NEŘEŠÍME
//                  (bodový systém neexistuje) -> ponecháno staticky jako dřív.
// - nepřihlášen -> jemná pozvánka k registraci, žádné cizí jméno ani vymyšlené body.
export default function TrustCard() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [jmeno, setJmeno] = useState<string | null>(null)
  const [prezdivka, setPrezdivka] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadProfile(userId: string) {
      const { data } = await supabase.from('profiles').select('jmeno, prezdivka').eq('id', userId).maybeSingle()
      if (!active) return
      setJmeno(data?.jmeno ?? null)
      setPrezdivka(data?.prezdivka ?? null)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const user = data.session?.user
      setEmail(user?.email ?? null)
      setLoading(false)
      if (user) loadProfile(user.id)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const user = session?.user
      setEmail(user?.email ?? null)
      setJmeno(null)
      setPrezdivka(null)
      if (user) loadProfile(user.id)
    })

    return () => { active = false; sub.subscription.unsubscribe() }
  }, [])

  const card: React.CSSProperties = {
    margin: '12px 16px 0', background: '#1a1208', borderRadius: '16px',
    padding: '16px', border: '1px solid rgba(184,149,74,0.2)'
  }

  // dokud neznáme stav, držíme jen prázdnou kartu (žádné jméno ani text), ať se nic nepřebliká
  if (loading) {
    return <div style={{ ...card, minHeight: '96px' }} />
  }

  // PŘIHLÁŠEN: jméno z profilu, jinak přezdívka, jinak e-mail. Body ponechány jako dřív.
  if (email) {
    const displayName = (jmeno && jmeno.trim()) || (prezdivka && prezdivka.trim()) || email
    return (
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', margin: '0 0 4px' }}>KARTA DŮVĚRY</p>
            <p style={{ fontSize: '17px', color: '#d4a96a', fontWeight: 300, margin: 0 }}>{displayName}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '24px', color: '#d4a96a', fontWeight: 300, margin: 0 }}>240</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>BODŮ</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: i < 7 ? '#b8954a' : 'transparent', border: i < 7 ? 'none' : '1px solid rgba(184,149,74,0.3)' }} />
          ))}
        </div>
      </div>
    )
  }

  // NEPŘIHLÁŠEN: pozvánka k registraci.
  return (
    <div style={card}>
      <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', margin: '0 0 8px' }}>KARTA DŮVĚRY</p>
      <p style={{ fontSize: '15px', color: '#d4a96a', fontWeight: 300, margin: '0 0 6px', lineHeight: 1.4 }}>Pozvánka k zastavení</p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 0 14px' }}>
        Vytvoř si účet a my si zapamatujeme tvé chutě i tvůj rytmus. BRAVO není jen kiosek — je to místo, kde tě poznáme.
      </p>
      <a href="/login"
        style={{ display: 'inline-block', background: '#b8954a', color: '#1a1208', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
        Vytvořit účet
      </a>
    </div>
  )
}
