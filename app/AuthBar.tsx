'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

// Lišta nahoře: ukazuje, kdo je přihlášený.
// - přihlášen  -> "Přihlášen: {jmeno z profiles, nebo e-mail}" + tlačítko Odhlásit se
// - nepřihlášen -> odkaz Přihlásit se (/login)
// Stav čteme ze session (supabase uloží přihlášení do prohlížeče) a posloucháme
// jeho změny přes onAuthStateChange, takže se lišta po (od)hlášení sama překreslí.
export default function AuthBar() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [jmeno, setJmeno] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    // Doplní jméno z tabulky profiles. Když to RLS nedovolí nebo řádek chybí,
    // jméno zůstane prázdné a níže se použije e-mail.
    async function loadProfileName(userId: string) {
      const { data } = await supabase.from('profiles').select('jmeno').eq('id', userId).maybeSingle()
      if (active) setJmeno(data?.jmeno ?? null)
    }

    // počáteční stav po načtení stránky
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const user = data.session?.user
      setEmail(user?.email ?? null)
      setLoading(false)
      if (user) loadProfileName(user.id)
    })

    // reakce na přihlášení / odhlášení
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const user = session?.user
      setEmail(user?.email ?? null)
      setJmeno(null)
      if (user) loadProfileName(user.id)
    })

    return () => { active = false; sub.subscription.unsubscribe() }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    // o překreslení do nepřihlášeného stavu se postará onAuthStateChange výše
  }

  const displayName = (jmeno && jmeno.trim()) ? jmeno : email

  const bar: React.CSSProperties = {
    background: '#f7f3ec', padding: '8px 20px', display: 'flex', alignItems: 'center',
    justifyContent: 'flex-end', gap: '12px', minHeight: '36px', boxSizing: 'border-box',
    fontFamily: 'Inter,sans-serif', fontSize: '12px'
  }

  if (loading) {
    return <div style={bar} />
  }

  return (
    <div style={bar}>
      {email ? (
        <>
          <a href="/profil" style={{ color: '#6b6057', textDecoration: 'none' }}>
            Přihlášen: <strong style={{ color: '#1a1208', fontWeight: 600, textDecoration: 'underline' }}>{displayName}</strong>
          </a>
          <button onClick={handleLogout}
            style={{ background: 'none', border: '1px solid #e0d9d0', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', color: '#1a1208', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            Odhlásit se
          </button>
        </>
      ) : (
        <a href="/login"
          style={{ background: '#1a1208', color: '#d4a96a', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
          Přihlásit se
        </a>
      )}
    </div>
  )
}
