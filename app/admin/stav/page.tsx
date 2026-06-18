'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

// Ovládání stavu kiosku pro majitele - /admin/stav (jen pro přihlášené, jinak redirect na /login).
// Ukládá do řádku kiosk_status s pobocka_id = 'hlavni'. Sloupec viditelnost zde neměníme.

const POBOCKA = 'hlavni'

// Předpřipravené hlášky - jedním klikem do pole poznámky (rychlost > psaní).
const RYCHLE_HLASKY = [
  'Dnes jen do 14:00',
  'Zavřeno kvůli počasí',
  'Čerstvé květiny dorazily',
  'Dnes mimořádně zavřeno',
  'Vrátím se za chvíli',
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #e0d9d0', borderRadius: '10px',
  fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter,sans-serif'
}

type FormState = { je_otevreno: boolean; oteviraci_cas: string; zaviraci_cas: string; poznamka: string }

export default function AdminStavPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({ je_otevreno: true, oteviraci_cas: '', zaviraci_cas: '', poznamka: '' })
  const [message, setMessage] = useState('')
  const [msgOk, setMsgOk] = useState(false)

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }))
  const fail = (m: string) => { setMsgOk(false); setMessage(m) }

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
      if (!data.session?.user) { router.replace('/login'); return }   // jen pro přihlášené
      if (!active) return

      const { data: row, error } = await supabase
        .from('kiosk_status')
        .select('je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, duvod')
        .eq('pobocka_id', POBOCKA)
        .maybeSingle()

      if (!active) return
      if (error) { fail(describeError(error)); setLoading(false); return }
      if (row) {
        setForm({
          je_otevreno: !!row.je_otevreno,
          oteviraci_cas: row.oteviraci_cas ?? '',
          zaviraci_cas: row.zaviraci_cas ?? '',
          // pro hladký přechod: když poznamka chybí, použij starou duvod
          poznamka: row.poznamka ?? row.duvod ?? '',
        })
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [router])

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase.from('kiosk_status').update({
        je_otevreno: form.je_otevreno,
        oteviraci_cas: form.oteviraci_cas || null,
        zaviraci_cas: form.zaviraci_cas || null,
        poznamka: form.poznamka || null,
      }).eq('pobocka_id', POBOCKA)

      if (error) fail(describeError(error))
      else { setMsgOk(true); setMessage('Uloženo') }
    } catch (e) {
      fail(describeError(e))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#f7f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif', color: '#8a7f70', fontSize: '14px' }}>
        Načítám…
      </main>
    )
  }

  // přepínací tlačítko Otevřeno / Zavřeno
  const stateBtn = (label: string, active: boolean, onClick: () => void) => (
    <button onClick={onClick}
      style={{
        flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
        fontFamily: 'Inter,sans-serif',
        border: active ? '1px solid #1a1208' : '1px solid #e0d9d0',
        background: active ? '#1a1208' : 'white',
        color: active ? '#d4a96a' : '#8a7f70'
      }}>
      {label}
    </button>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#f7f3ec', fontFamily: 'Inter,sans-serif', padding: '20px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <a href="/" style={{ fontSize: '13px', color: '#8a7f70', textDecoration: 'none' }}>← Zpět</a>
          <span style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '0.3em', color: '#1a1208' }}>BRAVO</span>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '28px 24px', boxShadow: '0 2px 24px rgba(0,0,0,0.07)' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1208', margin: '0 0 4px' }}>Stav kiosku</h1>
          <p style={{ fontSize: '12px', color: '#8a7f70', margin: '0 0 18px' }}>Nastav, zda je dnes otevřeno, a časy.</p>

          <p style={{ fontSize: '12px', color: '#8a7f70', margin: '0 0 8px', fontWeight: 500 }}>Stav</p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {stateBtn('Otevřeno', form.je_otevreno, () => set('je_otevreno', true))}
            {stateBtn('Zavřeno', !form.je_otevreno, () => set('je_otevreno', false))}
          </div>

          <p style={{ fontSize: '12px', color: '#8a7f70', margin: '0 0 8px', fontWeight: 500 }}>Otevírací doba</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="Otevírá (07:00)" value={form.oteviraci_cas} onChange={e => set('oteviraci_cas', e.target.value)} style={{ ...inputStyle, width: '50%' }} />
            <input type="text" placeholder="Zavírá (18:00)" value={form.zaviraci_cas} onChange={e => set('zaviraci_cas', e.target.value)} style={{ ...inputStyle, width: '50%' }} />
          </div>

          <p style={{ fontSize: '12px', color: '#8a7f70', margin: '4px 0 8px', fontWeight: 500 }}>Poznámka (nepovinné)</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {RYCHLE_HLASKY.map(h => (
              <button key={h} onClick={() => set('poznamka', h)}
                style={{
                  padding: '7px 11px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer',
                  fontFamily: 'Inter,sans-serif',
                  border: form.poznamka === h ? '1px solid #1a1208' : '1px solid #e0d9d0',
                  background: form.poznamka === h ? '#1a1208' : 'white',
                  color: form.poznamka === h ? '#d4a96a' : '#1a1208'
                }}>
                {h}
              </button>
            ))}
          </div>
          <input type="text" placeholder="…nebo napiš vlastní poznámku" value={form.poznamka} onChange={e => set('poznamka', e.target.value)} style={inputStyle} />

          <button onClick={handleSave} disabled={saving}
            style={{ width: '100%', padding: '13px', background: '#1a1208', color: '#d4a96a', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: saving ? 'default' : 'pointer', marginTop: '14px', fontFamily: 'Inter,sans-serif', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Ukládám…' : 'Uložit'}
          </button>

          {message && <p style={{ fontSize: '13px', color: msgOk ? '#2e7d32' : '#c0392b', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>{message}</p>}
        </div>
      </div>
    </main>
  )
}
