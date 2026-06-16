'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Hodnoty se ukládají do stejnojmenných sloupců v public.profiles (ověřeno proti DB).
// Ukládání řeší VÝHRADNĚ databázový trigger handle_new_user z metadat (options.data) -
// žádný client-side zápis do profiles (po signUp není uživatel přihlášený a RLS by ho zablokovala).

const POHLAVI: [string, string][] = [['', 'Oslovení'], ['pan', 'Pan'], ['pani', 'Paní'], ['jine', 'Bez oslovení']]
const JAZYKY: [string, string][] = [['cs', 'Čeština'], ['en', 'English'], ['fr', 'Français'], ['de', 'Deutsch'], ['lu', 'Lëtzebuergesch']]
const MLEKO: [string, string][] = [['', 'Preference mléka'], ['bez', 'Bez mléka'], ['kravske', 'Kravské'], ['ovesne', 'Ovesné'], ['mandlove', 'Mandlové'], ['sojove', 'Sójové'], ['kokosove', 'Kokosové']]
const DIETY: [string, string][] = [['vegan', 'Vegan'], ['vegetarian', 'Vegetarián'], ['bez_laktozy', 'Bez laktózy'], ['bez_lepku', 'Bez lepku'], ['diabetes', 'Diabetes']]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #e0d9d0', borderRadius: '10px',
  fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter,sans-serif'
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [msgOk, setMsgOk] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '',
    jmeno: '', prijmeni: '', prezdivka: '',
    pohlavie: '', telefon: '', datum_narozeni: '', svatek: '',
    preferovany_jazyk: 'cs', oblibeny_napoj: '', preference_mleka: '',
    vegan: false, vegetarian: false, bez_laktozy: false, bez_lepku: false, diabetes: false, dieta_poznamka: '',
    newsletter: false, notifikace_nabidky: false, notifikace_novinky: false,
    souhlas_podminky: false, souhlas_gdpr: false
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const fail = (m: string) => { setMsgOk(false); setMessage(m) }

  // Dietní omezení (zaškrtávátka + volná poznámka) spojíme do jednoho textu pro sloupec intolerance.
  function buildIntolerance(): string {
    const parts: string[] = []
    for (const [key, label] of DIETY) if ((form as any)[key]) parts.push(label)
    const note = form.dieta_poznamka.trim()
    if (note) parts.push(note)
    return parts.join(', ')
  }

  // Z jakékoli chyby vytáhne čitelný text a celý objekt zaloguje do konzole prohlížeče.
  // Nikdy nevrátí prázdné "{}" - když chybí message, poskládá status/code, jinak String().
  function describeError(err: any): string {
    console.error('Supabase chyba:', err)
    if (!err) return 'Něco se nepovedlo, zkus to prosím znovu.'
    if (typeof err === 'string') return err
    const parts = [err.message, err.error_description, err.code, err.status]
      .filter(v => v !== undefined && v !== null && v !== '')
    if (parts.length) return parts.join(' · ')
    try { const s = JSON.stringify(err); return s && s !== '{}' ? s : String(err) } catch { return String(err) }
  }

  async function handleSubmit() {
    setMessage('')

    if (isRegister) {
      if (!form.email || !form.password) return fail('Vyplň e-mail a heslo.')
      if (form.password.length < 8) return fail('Heslo musí mít aspoň 8 znaků.')
      if (!form.souhlas_podminky) return fail('Musíš souhlasit s podmínkami věrnostního programu.')
      if (!form.souhlas_gdpr) return fail('Musíš souhlasit se zpracováním osobních údajů.')
    }

    setLoading(true)
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            // Tahle metadata přečte trigger handle_new_user a zapíše do profiles.
            data: {
              jmeno: form.jmeno, prijmeni: form.prijmeni, prezdivka: form.prezdivka,
              pohlavie: form.pohlavie, telefon: form.telefon,
              datum_narozeni: form.datum_narozeni, svatek: form.svatek,
              preferovany_jazyk: form.preferovany_jazyk,
              oblibeny_napoj: form.oblibeny_napoj, preference_mleka: form.preference_mleka,
              intolerance: buildIntolerance(),
              newsletter: form.newsletter,
              notifikace_nabidky: form.notifikace_nabidky,
              notifikace_novinky: form.notifikace_novinky,
              souhlas_podminky: form.souhlas_podminky,
              souhlas_gdpr: form.souhlas_gdpr
            }
          }
        })
        if (error) {
          if (error.message?.includes('already')) fail('Tento e-mail je již zaregistrován.')
          else if (error.message?.includes('Database error')) fail('Chyba při ukládání profilu (trigger v databázi). Podrobnosti najdeš v Supabase → Logs → Postgres Logs.')
          else fail(describeError(error))
        } else {
          setMsgOk(true)
          setMessage('Zkontroluj e-mail pro potvrzení registrace.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (error) fail('Nesprávný e-mail nebo heslo.')
        else window.location.href = '/'
      }
    } catch (e) {
      fail(describeError(e))
    } finally {
      setLoading(false)
    }
  }

  const inp = (ph: string, k: string, type = 'text') => (
    <input type={type} placeholder={ph} value={(form as any)[k]} onChange={e => set(k, e.target.value)} style={inputStyle} />
  )

  const sel = (k: string, options: (string | [string, string])[]) => (
    <select value={(form as any)[k]} onChange={e => set(k, e.target.value)}
      style={{ ...inputStyle, background: 'white', color: (form as any)[k] ? '#1a1208' : '#aaa' }}>
      {options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v} style={{ color: '#1a1208' }}>{l}</option> })}
    </select>
  )

  const chk = (k: string, label: string) => (
    <label key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#1a1208', marginBottom: '8px', cursor: 'pointer', lineHeight: '1.4' }}>
      <input type="checkbox" checked={(form as any)[k]} onChange={e => set(k, e.target.checked)}
        style={{ width: '16px', height: '16px', accentColor: '#1a1208', marginTop: '1px', flexShrink: 0 }} />
      {label}
    </label>
  )

  const sectionLabel = (t: string) => (
    <p style={{ fontSize: '12px', color: '#8a7f70', margin: '4px 0 8px', fontWeight: 500 }}>{t}</p>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#f7f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '32px 28px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 24px rgba(0,0,0,0.07)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.3em', color: '#1a1208', margin: '0 0 2px' }}>BRAVO</h1>
        <p style={{ fontSize: '11px', color: '#8a7f70', letterSpacing: '0.1em', margin: '0 0 20px' }}>Luxembourg · místo pro zastavení</p>

        {isRegister && (
          <div style={{ background: '#f7f3ec', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#1a1208', lineHeight: 1.6, margin: '0 0 6px', fontWeight: 500 }}>Proč tě prosíme o tyto informace?</p>
            <p style={{ fontSize: '12px', color: '#6b6057', lineHeight: 1.6, margin: 0 }}>BRAVO není jen kiosek — je to pozvánka k zastavení. Chceme tě poznat a pamatovat si tvé preference. Tvoje data jsou v bezpečí, nikdy je nesdílíme.</p>
          </div>
        )}

        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1208', margin: '0 0 16px' }}>{isRegister ? 'Vytvořit účet' : 'Přihlásit se'}</h2>

        {isRegister && <>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="Jméno" value={form.jmeno} onChange={e => set('jmeno', e.target.value)} style={{ ...inputStyle, width: '50%' }} />
            <input type="text" placeholder="Příjmení" value={form.prijmeni} onChange={e => set('prijmeni', e.target.value)} style={{ ...inputStyle, width: '50%' }} />
          </div>
          {inp('Přezdívka / jméno na kelímek', 'prezdivka')}
          {sel('pohlavie', POHLAVI)}
          {inp('Telefon', 'telefon', 'tel')}

          {sectionLabel('Datum narození')}
          <input type="date" value={form.datum_narozeni} onChange={e => set('datum_narozeni', e.target.value)}
            style={{ ...inputStyle, color: form.datum_narozeni ? '#1a1208' : '#aaa' }} />
          {sectionLabel('Datum svátku')}
          <input type="date" value={form.svatek} onChange={e => set('svatek', e.target.value)}
            style={{ ...inputStyle, color: form.svatek ? '#1a1208' : '#aaa' }} />

          {sel('preferovany_jazyk', JAZYKY)}
          {inp('Oblíbený nápoj', 'oblibeny_napoj')}
          {sel('preference_mleka', MLEKO)}

          {sectionLabel('Dietní omezení')}
          {DIETY.map(([k, label]) => chk(k, label))}
          <textarea placeholder="Další poznámky ke stravě (volitelné)" value={form.dieta_poznamka}
            onChange={e => set('dieta_poznamka', e.target.value)} rows={2}
            style={{ ...inputStyle, resize: 'vertical' }} />

          <div style={{ height: '1px', background: '#f0ebe3', margin: '12px 0' }} />
          {sectionLabel('Notifikace')}
          {chk('newsletter', 'Chci dostávat novinky a inspiraci od BRAVO')}
          {chk('notifikace_nabidky', 'Upozornit mě na speciální nabídky a akce')}
          {chk('notifikace_novinky', 'Novinky v menu a seasonal specials')}

          <div style={{ height: '1px', background: '#f0ebe3', margin: '12px 0' }} />
          {sectionLabel('Povinné souhlasy *')}
          {chk('souhlas_podminky', 'Souhlasím s podmínkami věrnostního programu BRAVO')}
          {chk('souhlas_gdpr', 'Souhlasím se zpracováním osobních údajů dle GDPR')}
          <div style={{ height: '1px', background: '#f0ebe3', margin: '12px 0' }} />
        </>}

        {inp('E-mail *', 'email', 'email')}
        {inp('Heslo (min. 8 znaků) *', 'password', 'password')}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: '13px', background: '#1a1208', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'default' : 'pointer', marginTop: '8px', marginBottom: '14px', fontFamily: 'Inter,sans-serif', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Načítám...' : isRegister ? 'Zaregistrovat se' : 'Přihlásit se'}
        </button>

        {message && <p style={{ fontSize: '13px', color: msgOk ? '#2e7d32' : '#c0392b', textAlign: 'center', margin: '0 0 10px', lineHeight: 1.5 }}>{message}</p>}

        <p style={{ fontSize: '13px', color: '#8a7f70', textAlign: 'center', margin: 0 }}>
          {isRegister ? 'Už máš účet?' : 'Nemáš účet?'}{' '}
          <span onClick={() => { setIsRegister(!isRegister); setMessage('') }} style={{ color: '#1a1208', cursor: 'pointer', fontWeight: 600 }}>
            {isRegister ? 'Přihlásit se' : 'Registrovat'}
          </span>
        </p>
      </div>
    </main>
  )
}
