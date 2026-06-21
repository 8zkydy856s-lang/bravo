'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { SdeleniRadek, ZitraRadek } from '../../WebObsahView'

// Admin "Sdělení na web" - /admin/sdeleni (jen pro přihlášené, jinak redirect na /login).
// Ovládá volitelná sdělení (3) a výhled na zítřek; ukládá do řádku web_obsah (klic = 'hlavni').

const KLIC = 'hlavni'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #e0d9d0', borderRadius: '10px',
  fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter,sans-serif'
}

type FormState = {
  sdeleni1_zap: boolean; sdeleni1_text: string
  sdeleni2_zap: boolean; sdeleni2_text: string
  sdeleni3_zap: boolean; sdeleni3_text: string
  zitra_zap: boolean; zitra_text: string
}

const EMPTY: FormState = {
  sdeleni1_zap: false, sdeleni1_text: '',
  sdeleni2_zap: false, sdeleni2_text: '',
  sdeleni3_zap: false, sdeleni3_text: '',
  zitra_zap: true, zitra_text: 'Zítra: pravděpodobně otevřeno',
}

export default function AdminSdeleniPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
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
      if (!data.session?.user) { router.replace('/login'); return }
      if (!active) return
      const { data: row, error } = await supabase
        .from('web_obsah')
        .select('sdeleni1_zap, sdeleni1_text, sdeleni2_zap, sdeleni2_text, sdeleni3_zap, sdeleni3_text, zitra_zap, zitra_text')
        .eq('klic', KLIC)
        .maybeSingle()
      if (!active) return
      if (error) { fail(describeError(error)); setLoading(false); return }
      if (row) {
        setForm({
          sdeleni1_zap: !!row.sdeleni1_zap, sdeleni1_text: row.sdeleni1_text ?? '',
          sdeleni2_zap: !!row.sdeleni2_zap, sdeleni2_text: row.sdeleni2_text ?? '',
          sdeleni3_zap: !!row.sdeleni3_zap, sdeleni3_text: row.sdeleni3_text ?? '',
          zitra_zap: !!row.zitra_zap, zitra_text: row.zitra_text ?? '',
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
      const { error } = await supabase.from('web_obsah').update({
        sdeleni1_zap: form.sdeleni1_zap, sdeleni1_text: form.sdeleni1_text || null,
        sdeleni2_zap: form.sdeleni2_zap, sdeleni2_text: form.sdeleni2_text || null,
        sdeleni3_zap: form.sdeleni3_zap, sdeleni3_text: form.sdeleni3_text || null,
        zitra_zap: form.zitra_zap, zitra_text: form.zitra_text,
      }).eq('klic', KLIC)
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

  // segment Zapnuto / Vypnuto
  const toggle = (zapKey: keyof FormState) => (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
      {[['Zapnuto', true], ['Vypnuto', false]].map(([label, val]) => {
        const active = form[zapKey] === val
        return (
          <button key={String(label)} onClick={() => set(zapKey, val)}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter,sans-serif',
              border: active ? '1px solid #1a1208' : '1px solid #e0d9d0',
              background: active ? '#1a1208' : 'white',
              color: active ? '#d4a96a' : '#8a7f70'
            }}>
            {label}
          </button>
        )
      })}
    </div>
  )

  const sectionLabel = (t: string) => (
    <p style={{ fontSize: '12px', color: '#8a7f70', margin: '16px 0 8px', fontWeight: 500 }}>{t}</p>
  )

  const radek = (nadpis: string, zapKey: keyof FormState, textKey: keyof FormState, placeholder: string) => (
    <>
      {sectionLabel(nadpis)}
      {toggle(zapKey)}
      <input type="text" placeholder={placeholder} value={form[textKey] as string} onChange={e => set(textKey, e.target.value)} style={inputStyle} />
    </>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#f7f3ec', fontFamily: 'Inter,sans-serif', padding: '20px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <a href="/" style={{ fontSize: '13px', color: '#8a7f70', textDecoration: 'none' }}>← Zpět</a>
          <span style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '0.3em', color: '#1a1208' }}>BRAVO</span>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '28px 24px', boxShadow: '0 2px 24px rgba(0,0,0,0.07)' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1208', margin: '0 0 4px' }}>Sdělení na web</h1>
          <p style={{ fontSize: '12px', color: '#8a7f70', margin: '0 0 8px' }}>Volitelná sdělení na úvodní stránce a výhled na zítřek.</p>

          {radek('Sdělení 1 (nad statusem)', 'sdeleni1_zap', 'sdeleni1_text', 'Text sdělení 1')}
          {radek('Sdělení 2 (mezi statusem a popisem)', 'sdeleni2_zap', 'sdeleni2_text', 'Text sdělení 2')}
          {radek('Sdělení 3 (pod popisem)', 'sdeleni3_zap', 'sdeleni3_text', 'Text sdělení 3')}
          {radek('Výhled na zítřek', 'zitra_zap', 'zitra_text', 'Zítra: pravděpodobně otevřeno')}

          {/* Živý náhled */}
          <p style={{ fontSize: '11px', color: '#8a7f70', margin: '20px 0 6px', fontStyle: 'italic' }}>Náhled — takto to uvidí zákazník</p>
          <div style={{ background: '#f7f3ec', borderRadius: '12px', padding: '14px' }}>
            {form.sdeleni1_zap && form.sdeleni1_text.trim() && (
              <div style={{ marginBottom: '10px' }}><SdeleniRadek text={form.sdeleni1_text} /></div>
            )}
            <div style={{ background: 'white', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '12px 14px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '0.15em', color: '#8a7f70', margin: '0 0 6px' }}>PRÁVĚ TEĎ</p>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#1a1208', margin: 0 }}>Stav kiosku (živě)</p>
              {form.zitra_zap && form.zitra_text.trim() && <ZitraRadek text={form.zitra_text} />}
            </div>
            {form.sdeleni2_zap && form.sdeleni2_text.trim() && (
              <div style={{ marginTop: '10px' }}><SdeleniRadek text={form.sdeleni2_text} /></div>
            )}
            <p style={{ fontSize: '12px', color: '#8a7f70', fontStyle: 'italic', textAlign: 'center', margin: '12px 0' }}>… popis kurzívou …</p>
            {form.sdeleni3_zap && form.sdeleni3_text.trim() && (
              <div><SdeleniRadek text={form.sdeleni3_text} /></div>
            )}
          </div>

          <button onClick={handleSave} disabled={saving}
            style={{ width: '100%', padding: '13px', background: '#1a1208', color: '#d4a96a', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: saving ? 'default' : 'pointer', marginTop: '16px', fontFamily: 'Inter,sans-serif', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Ukládám…' : 'Uložit'}
          </button>

          {message && <p style={{ fontSize: '13px', color: msgOk ? '#2e7d32' : '#c0392b', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>{message}</p>}
        </div>
      </div>
    </main>
  )
}
