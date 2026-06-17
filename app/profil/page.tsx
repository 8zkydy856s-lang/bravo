'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

// Stránka profilu /profil - jen pro přihlášeného uživatele.
// Zobrazuje a ukládá vybraná pole tabulky profiles. Profilovou fotku, body,
// věrnostní systém apod. ZDE NEŘEŠÍME (jiné kroky).

const POHLAVI: [string, string][] = [['', 'Oslovení'], ['pan', 'Pan'], ['pani', 'Paní'], ['jine', 'Bez oslovení']]
const JAZYKY: [string, string][] = [['cs', 'Čeština'], ['en', 'English'], ['fr', 'Français'], ['de', 'Deutsch'], ['lu', 'Lëtzebuergesch']]
const MLEKO: [string, string][] = [['', 'Preference mléka'], ['bez', 'Bez mléka'], ['kravske', 'Kravské'], ['ovesne', 'Ovesné'], ['mandlove', 'Mandlové'], ['sojove', 'Sójové'], ['kokosove', 'Kokosové']]

// Pevný seznam oblíbených nápojů (zaškrtávání). Ukládá se do oblibeny_napoj jako text spojený čárkami.
const NAPOJE = [
  'Espresso', 'Doppio', 'Macchiato', 'Cortado', 'Flat white', 'Cappuccino',
  'Caffè latte', 'Filtrovaná káva (V60)', 'Cold brew', 'Ledový hibiscus',
  'Matcha latte', 'Chai latte', 'Horká čokoláda', 'Rooibos / red espresso'
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #e0d9d0', borderRadius: '10px',
  fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter,sans-serif'
}

type FormState = {
  jmeno: string; prijmeni: string; prezdivka: string; pohlavie: string; telefon: string;
  datum_narozeni: string; svatek: string; preferovany_jazyk: string; preference_mleka: string;
  intolerance: string; newsletter: boolean; notifikace_nabidky: boolean; notifikace_novinky: boolean;
}

const EMPTY: FormState = {
  jmeno: '', prijmeni: '', prezdivka: '', pohlavie: '', telefon: '',
  datum_narozeni: '', svatek: '', preferovany_jazyk: 'cs', preference_mleka: '',
  intolerance: '', newsletter: false, notifikace_nabidky: false, notifikace_novinky: false,
}

export default function ProfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [napoje, setNapoje] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [msgOk, setMsgOk] = useState(false)

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }))
  const fail = (m: string) => { setMsgOk(false); setMessage(m) }

  const toggleNapoj = (name: string) =>
    setNapoje(list => list.includes(name) ? list.filter(n => n !== name) : [...list, name])

  // Z chyby vždy vytáhne čitelný text + zaloguje celý objekt do konzole. Nikdy prázdné "{}".
  function describeError(err: any): string {
    console.error('Supabase chyba:', err)
    if (!err) return 'Něco se nepovedlo, zkus to prosím znovu.'
    if (typeof err === 'string') return err
    const parts = [err.message, err.error_description, err.code, err.status]
      .filter(v => v !== undefined && v !== null && v !== '')
    if (parts.length) return parts.join(' · ')
    try { const s = JSON.stringify(err); return s && s !== '{}' ? s : String(err) } catch { return String(err) }
  }

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user) { router.replace('/login'); return }   // jen pro přihlášené
      if (!active) return
      setUserId(user.id)

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('jmeno, prijmeni, prezdivka, pohlavie, telefon, datum_narozeni, svatek, preferovany_jazyk, preference_mleka, intolerance, oblibeny_napoj, newsletter, notifikace_nabidky, notifikace_novinky')
        .eq('id', user.id)
        .maybeSingle()

      if (!active) return
      if (error) { fail(describeError(error)); setLoading(false); return }

      if (profile) {
        setForm({
          jmeno: profile.jmeno ?? '', prijmeni: profile.prijmeni ?? '', prezdivka: profile.prezdivka ?? '',
          pohlavie: profile.pohlavie ?? '', telefon: profile.telefon ?? '',
          datum_narozeni: profile.datum_narozeni ?? '', svatek: profile.svatek ?? '',
          preferovany_jazyk: profile.preferovany_jazyk ?? 'cs', preference_mleka: profile.preference_mleka ?? '',
          intolerance: profile.intolerance ?? '',
          newsletter: !!profile.newsletter, notifikace_nabidky: !!profile.notifikace_nabidky, notifikace_novinky: !!profile.notifikace_novinky,
        })
        // rozparsuj uložené nápoje a zaškrtni ty z pevného seznamu
        const saved = (profile.oblibeny_napoj ?? '').split(',').map((s: string) => s.trim()).filter(Boolean)
        setNapoje(NAPOJE.filter(n => saved.includes(n)))
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [router])

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase.from('profiles').update({
        jmeno: form.jmeno, prijmeni: form.prijmeni, prezdivka: form.prezdivka,
        pohlavie: form.pohlavie, telefon: form.telefon,
        datum_narozeni: form.datum_narozeni || null,
        svatek: form.svatek || null,
        preferovany_jazyk: form.preferovany_jazyk, preference_mleka: form.preference_mleka,
        intolerance: form.intolerance,
        oblibeny_napoj: napoje.join(', '),
        newsletter: form.newsletter, notifikace_nabidky: form.notifikace_nabidky, notifikace_novinky: form.notifikace_novinky,
      }).eq('id', userId)

      if (error) fail(describeError(error))
      else { setMsgOk(true); setMessage('Uloženo') }
    } catch (e) {
      fail(describeError(e))
    } finally {
      setSaving(false)
    }
  }

  const inp = (ph: string, k: keyof FormState, type = 'text') => (
    <input type={type} placeholder={ph} value={form[k] as string} onChange={e => set(k, e.target.value)} style={inputStyle} />
  )

  const sel = (k: keyof FormState, options: [string, string][]) => (
    <select value={form[k] as string} onChange={e => set(k, e.target.value)}
      style={{ ...inputStyle, background: 'white', color: form[k] ? '#1a1208' : '#aaa' }}>
      {options.map(([v, l]) => <option key={v} value={v} style={{ color: '#1a1208' }}>{l}</option>)}
    </select>
  )

  const chk = (k: keyof FormState, label: string) => (
    <label key={k as string} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#1a1208', marginBottom: '8px', cursor: 'pointer', lineHeight: 1.4 }}>
      <input type="checkbox" checked={form[k] as boolean} onChange={e => set(k, e.target.checked)}
        style={{ width: '16px', height: '16px', accentColor: '#1a1208', marginTop: '1px', flexShrink: 0 }} />
      {label}
    </label>
  )

  const sectionLabel = (t: string) => (
    <p style={{ fontSize: '12px', color: '#8a7f70', margin: '14px 0 8px', fontWeight: 500, letterSpacing: '0.04em' }}>{t}</p>
  )

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#f7f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif', color: '#8a7f70', fontSize: '14px' }}>
        Načítám profil…
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f7f3ec', fontFamily: 'Inter,sans-serif', padding: '20px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <a href="/" style={{ fontSize: '13px', color: '#8a7f70', textDecoration: 'none' }}>← Zpět</a>
          <span style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '0.3em', color: '#1a1208' }}>BRAVO</span>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '28px 24px', boxShadow: '0 2px 24px rgba(0,0,0,0.07)' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1208', margin: '0 0 4px' }}>Můj profil</h1>
          <p style={{ fontSize: '12px', color: '#8a7f70', margin: '0 0 8px' }}>Uprav své údaje a preference.</p>

          {sectionLabel('Jméno')}
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

          {sectionLabel('Preferovaný jazyk')}
          {sel('preferovany_jazyk', JAZYKY)}
          {sectionLabel('Preference mléka')}
          {sel('preference_mleka', MLEKO)}

          {sectionLabel('Dietní omezení / poznámky')}
          <textarea placeholder="Např. bez laktózy, bez lepku, vegan…" value={form.intolerance}
            onChange={e => set('intolerance', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />

          {sectionLabel('Oblíbené nápoje')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginBottom: '4px' }}>
            {NAPOJE.map(name => (
              <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1a1208', marginBottom: '6px', cursor: 'pointer', lineHeight: 1.3 }}>
                <input type="checkbox" checked={napoje.includes(name)} onChange={() => toggleNapoj(name)}
                  style={{ width: '16px', height: '16px', accentColor: '#1a1208', flexShrink: 0 }} />
                {name}
              </label>
            ))}
          </div>

          <div style={{ height: '1px', background: '#f0ebe3', margin: '14px 0' }} />
          {sectionLabel('Notifikace')}
          {chk('newsletter', 'Chci dostávat novinky a inspiraci od BRAVO')}
          {chk('notifikace_nabidky', 'Upozornit mě na speciální nabídky a akce')}
          {chk('notifikace_novinky', 'Novinky v menu a seasonal specials')}

          <button onClick={handleSave} disabled={saving}
            style={{ width: '100%', padding: '13px', background: '#1a1208', color: '#d4a96a', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: saving ? 'default' : 'pointer', marginTop: '18px', fontFamily: 'Inter,sans-serif', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Ukládám…' : 'Uložit'}
          </button>

          {message && <p style={{ fontSize: '13px', color: msgOk ? '#2e7d32' : '#c0392b', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>{message}</p>}
        </div>
      </div>
    </main>
  )
}
