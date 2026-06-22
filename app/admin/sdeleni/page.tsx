'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { SdeleniRadek, ZitraRadek, SdeleniVzhled } from '../../WebObsahView'
import BravoNapis from '../../BravoNapis'

// Admin "Sdělení na web" - /admin/sdeleni (jen pro přihlášené, jinak redirect na /login).
// Ovládá obsah úvodní stránky uložený v řádku web_obsah (klic = 'hlavni').

const KLIC = 'hlavni'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #e0d9d0', borderRadius: '10px',
  fontSize: '14px', marginBottom: '0', boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter,sans-serif'
}

const blokStyle: React.CSSProperties = {
  background: '#fffdf8', border: '0.5px solid rgba(120,90,40,0.16)', borderRadius: '14px',
  padding: '16px', marginBottom: '14px'
}

type FormState = {
  sdeleni1_zap: boolean; sdeleni1_text: string; sdeleni1_vzhled: SdeleniVzhled
  sdeleni2_zap: boolean; sdeleni2_text: string; sdeleni2_vzhled: SdeleniVzhled
  sdeleni3_zap: boolean; sdeleni3_text: string; sdeleni3_vzhled: SdeleniVzhled
  zitra_zap: boolean; zitra_text: string
  maps_odkaz: string
  provoz_text: string
  popis_text: string
}

const EMPTY: FormState = {
  sdeleni1_zap: false, sdeleni1_text: '', sdeleni1_vzhled: 'splynout',
  sdeleni2_zap: false, sdeleni2_text: '', sdeleni2_vzhled: 'splynout',
  sdeleni3_zap: false, sdeleni3_text: '', sdeleni3_vzhled: 'splynout',
  zitra_zap: true, zitra_text: 'Zítra: pravděpodobně otevřeno',
  maps_odkaz: '', provoz_text: '', popis_text: '',
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
        .select('sdeleni1_zap, sdeleni1_text, sdeleni1_vzhled, sdeleni2_zap, sdeleni2_text, sdeleni2_vzhled, sdeleni3_zap, sdeleni3_text, sdeleni3_vzhled, zitra_zap, zitra_text, maps_odkaz, provoz_text, popis_text')
        .eq('klic', KLIC)
        .maybeSingle()
      if (!active) return
      if (error) { fail(describeError(error)); setLoading(false); return }
      if (row) {
        const vz = (v: any): SdeleniVzhled => (v === 'zvyraznit' ? 'zvyraznit' : 'splynout')
        setForm({
          sdeleni1_zap: !!row.sdeleni1_zap, sdeleni1_text: row.sdeleni1_text ?? '', sdeleni1_vzhled: vz(row.sdeleni1_vzhled),
          sdeleni2_zap: !!row.sdeleni2_zap, sdeleni2_text: row.sdeleni2_text ?? '', sdeleni2_vzhled: vz(row.sdeleni2_vzhled),
          sdeleni3_zap: !!row.sdeleni3_zap, sdeleni3_text: row.sdeleni3_text ?? '', sdeleni3_vzhled: vz(row.sdeleni3_vzhled),
          zitra_zap: !!row.zitra_zap, zitra_text: row.zitra_text ?? '',
          maps_odkaz: row.maps_odkaz ?? '',
          provoz_text: row.provoz_text ?? '',
          popis_text: row.popis_text ?? '',
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
        sdeleni1_zap: form.sdeleni1_zap, sdeleni1_text: form.sdeleni1_text || null, sdeleni1_vzhled: form.sdeleni1_vzhled,
        sdeleni2_zap: form.sdeleni2_zap, sdeleni2_text: form.sdeleni2_text || null, sdeleni2_vzhled: form.sdeleni2_vzhled,
        sdeleni3_zap: form.sdeleni3_zap, sdeleni3_text: form.sdeleni3_text || null, sdeleni3_vzhled: form.sdeleni3_vzhled,
        zitra_zap: form.zitra_zap, zitra_text: form.zitra_text,
        maps_odkaz: form.maps_odkaz, provoz_text: form.provoz_text, popis_text: form.popis_text,
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
      <main style={{ minHeight: '100vh', background: '#f6f1e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif', color: '#8a7f70', fontSize: '14px' }}>
        Načítám…
      </main>
    )
  }

  // segmentový přepínač (dvě hodnoty)
  const segment = (current: any, options: [string, any][], onPick: (v: any) => void) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      {options.map(([label, val]) => {
        const active = current === val
        return (
          <button key={String(label)} onClick={() => onPick(val)}
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

  // nadpis bloku (karty)
  const blokNadpis = (t: string, podtitul?: string) => (
    <div style={{ marginBottom: '12px' }}>
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1208', margin: 0 }}>{t}</p>
      {podtitul && <p style={{ fontSize: '11px', color: '#b0a48f', margin: '2px 0 0' }}>{podtitul}</p>}
    </div>
  )

  const malyLabel = (t: string) => (
    <p style={{ fontSize: '11px', color: '#9b8d76', margin: '12px 0 6px', fontWeight: 500 }}>{t}</p>
  )

  // karta jednoho sdělení: zap/vyp + text + vzhled
  const sdeleniBlok = (n: 1 | 2 | 3, nadpis: string, podtitul: string) => {
    const zapKey = `sdeleni${n}_zap` as keyof FormState
    const textKey = `sdeleni${n}_text` as keyof FormState
    const vzKey = `sdeleni${n}_vzhled` as keyof FormState
    return (
      <div style={blokStyle}>
        {blokNadpis(nadpis, podtitul)}
        {segment(form[zapKey], [['Zapnuto', true], ['Vypnuto', false]], v => set(zapKey, v))}
        <div style={{ marginTop: '10px' }}>
          <input type="text" placeholder={`Text sdělení ${n}`} value={form[textKey] as string} onChange={e => set(textKey, e.target.value)} style={inputStyle} />
        </div>
        {malyLabel('Vzhled')}
        {segment(form[vzKey], [['Splynout', 'splynout'], ['Zvýraznit', 'zvyraznit']], v => set(vzKey, v))}
      </div>
    )
  }

  const previewLines = (form.popis_text || '').split('\n')

  return (
    <main style={{ minHeight: '100vh', background: '#f6f1e6', fontFamily: 'Inter,sans-serif', padding: '20px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <a href="/" style={{ fontSize: '13px', color: '#8a7f70', textDecoration: 'none' }}>← Zpět</a>
          <BravoNapis height={26} />
        </div>

        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1208', margin: '0 0 4px' }}>Sdělení na web</h1>
        <p style={{ fontSize: '12px', color: '#8a7f70', margin: '0 0 18px' }}>Obsah úvodní stránky — vše se ukládá tlačítkem dole.</p>

        {sdeleniBlok(1, 'Sdělení 1', 'nad statusem')}
        {sdeleniBlok(2, 'Sdělení 2', 'mezi statusem a popisem')}
        {sdeleniBlok(3, 'Sdělení 3', 'pod popisem')}

        {/* Výhled na zítřek */}
        <div style={blokStyle}>
          {blokNadpis('Výhled na zítřek', 'malý řádek v kartě stavu')}
          {segment(form.zitra_zap, [['Zapnuto', true], ['Vypnuto', false]], v => set('zitra_zap', v))}
          <div style={{ display: 'flex', gap: '6px', margin: '10px 0' }}>
            <button onClick={() => set('zitra_text', 'Zítra: pravděpodobně otevřeno')}
              style={{ flex: 1, padding: '8px 10px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', border: '1px solid #e0d9d0', background: 'white', color: '#1a1208' }}>
              pravděpodobně otevřeno
            </button>
            <button onClick={() => set('zitra_text', 'Zítra: pravděpodobně zavřeno')}
              style={{ flex: 1, padding: '8px 10px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', border: '1px solid #e0d9d0', background: 'white', color: '#1a1208' }}>
              pravděpodobně zavřeno
            </button>
          </div>
          <input type="text" placeholder="Zítra: …" value={form.zitra_text} onChange={e => set('zitra_text', e.target.value)} style={inputStyle} />
        </div>

        {/* Texty na úvodní stránce */}
        <div style={blokStyle}>
          {blokNadpis('Texty na úvodní stránce')}
          {malyLabel('Text o provozu')}
          <textarea placeholder="Text o provozu" value={form.provoz_text} onChange={e => set('provoz_text', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          {malyLabel('Popis (každý řádek zvlášť)')}
          <textarea placeholder="Řádek 1&#10;Řádek 2&#10;Řádek 3" value={form.popis_text} onChange={e => set('popis_text', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {/* Odkaz Naviguj */}
        <div style={blokStyle}>
          {blokNadpis('Odkaz Naviguj', 'poloha vozíku na mapě')}
          <input type="text" placeholder="https://maps.app.goo.gl/…" value={form.maps_odkaz} onChange={e => set('maps_odkaz', e.target.value)} style={inputStyle} />
        </div>

        {/* Živý náhled */}
        <div style={{ ...blokStyle, background: '#f6f1e6' }}>
          {blokNadpis('Náhled', 'takto to uvidí zákazník')}
          {form.provoz_text.trim() && (
            <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#6f6253', textAlign: 'center', margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>{form.provoz_text}</p>
          )}
          {form.sdeleni1_zap && form.sdeleni1_text.trim() && (
            <div style={{ marginBottom: '10px' }}><SdeleniRadek text={form.sdeleni1_text} vzhled={form.sdeleni1_vzhled} /></div>
          )}
          <div style={{ background: '#fffdf8', border: '0.5px solid rgba(120,90,40,0.12)', borderRadius: '14px', padding: '12px 14px' }}>
            <p style={{ fontSize: '9px', letterSpacing: '0.15em', color: '#9b8d76', margin: '0 0 6px' }}>PRÁVĚ TEĎ</p>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#1a1208', margin: 0 }}>Stav kiosku (živě)</p>
            {form.zitra_zap && form.zitra_text.trim() && <ZitraRadek text={form.zitra_text} />}
          </div>
          {form.sdeleni2_zap && form.sdeleni2_text.trim() && (
            <div style={{ marginTop: '10px' }}><SdeleniRadek text={form.sdeleni2_text} vzhled={form.sdeleni2_vzhled} /></div>
          )}
          {form.popis_text.trim() && (
            <p style={{ fontSize: '12px', color: '#6f6253', fontStyle: 'italic', textAlign: 'center', margin: '12px 0' }}>
              {previewLines.map((ln, i) => <span key={i}>{ln}{i < previewLines.length - 1 ? <br /> : null}</span>)}
            </p>
          )}
          {form.sdeleni3_zap && form.sdeleni3_text.trim() && (
            <div><SdeleniRadek text={form.sdeleni3_text} vzhled={form.sdeleni3_vzhled} /></div>
          )}
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{ width: '100%', padding: '14px', background: '#1a1208', color: '#d4a96a', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: saving ? 'default' : 'pointer', marginTop: '4px', fontFamily: 'Inter,sans-serif', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Ukládám…' : 'Uložit'}
        </button>

        {message && <p style={{ fontSize: '13px', color: msgOk ? '#2e7d32' : '#c0392b', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>{message}</p>}
      </div>
    </main>
  )
}
