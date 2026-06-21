'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import KioskStatusView from '../../KioskStatusView'

// Ovládání stavu kiosku pro majitele - /admin/stav (jen pro přihlášené, jinak redirect na /login).
// Stav kiosku se ukládá tlačítkem Uložit do řádku kiosk_status (pobocka_id = 'hlavni').
// Rychlé hlášky se načítají z tabulky rychle_hlasky a spravují se v sekci "Správa hlášek"
// (změny v ní se ukládají hned). Sloupec viditelnost zde neměníme.

const POBOCKA = 'hlavni'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #e0d9d0', borderRadius: '10px',
  fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter,sans-serif'
}

type FormState = {
  je_otevreno: boolean; oteviraci_cas: string; zaviraci_cas: string; poznamka: string; dnesni_vyjimka: boolean
}
type Hlaska = { id: number; text: string; aktivni: boolean; poradi: number }

export default function AdminStavPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({ je_otevreno: true, oteviraci_cas: '', zaviraci_cas: '', poznamka: '', dnesni_vyjimka: false })
  const [hlasky, setHlasky] = useState<Hlaska[]>([])
  const [novaHlaska, setNovaHlaska] = useState('')
  const [message, setMessage] = useState('')
  const [msgOk, setMsgOk] = useState(false)

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }))
  const fail = (m: string) => { setMsgOk(false); setMessage(m) }
  const ok = (m: string) => { setMsgOk(true); setMessage(m) }

  function describeError(err: any): string {
    console.error('Supabase chyba:', err)
    if (!err) return 'Něco se nepovedlo, zkus to prosím znovu.'
    if (typeof err === 'string') return err
    const parts = [err.message, err.error_description, err.code, err.status]
      .filter(v => v !== undefined && v !== null && v !== '')
    if (parts.length) return parts.join(' · ')
    try { const s = JSON.stringify(err); return s && s !== '{}' ? s : String(err) } catch { return String(err) }
  }

  // načte všechny hlášky (i vypnuté) pro správu, seřazené podle pořadí
  async function loadHlasky() {
    const { data, error } = await supabase
      .from('rychle_hlasky')
      .select('id, text, aktivni, poradi')
      .order('poradi', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) { fail(describeError(error)); return }
    setHlasky((data as Hlaska[]) ?? [])
  }

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) { router.replace('/login'); return }   // jen pro přihlášené
      if (!active) return

      const { data: row, error } = await supabase
        .from('kiosk_status')
        .select('je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, duvod, dnesni_vyjimka')
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
          dnesni_vyjimka: !!row.dnesni_vyjimka,
        })
      }
      await loadHlasky()
      if (active) setLoading(false)
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
        dnesni_vyjimka: form.dnesni_vyjimka,
      }).eq('pobocka_id', POBOCKA)

      if (error) fail(describeError(error))
      else ok('Uloženo')
    } catch (e) {
      fail(describeError(e))
    } finally {
      setSaving(false)
    }
  }

  // --- správa hlášek (ukládá se hned) ---
  async function pridejHlasku() {
    const text = novaHlaska.trim()
    if (!text) return
    const maxPoradi = hlasky.reduce((m, h) => Math.max(m, h.poradi), 0)
    const { error } = await supabase.from('rychle_hlasky').insert({ text, aktivni: true, poradi: maxPoradi + 1 })
    if (error) { fail(describeError(error)); return }
    setNovaHlaska('')
    await loadHlasky()
    ok('Hláška přidána')
  }

  async function prejmenujHlasku(id: number, text: string) {
    const t = text.trim()
    if (!t) { await loadHlasky(); return }   // prázdný text neukládáme, vrátíme původní
    const { error } = await supabase.from('rychle_hlasky').update({ text: t }).eq('id', id)
    if (error) { fail(describeError(error)); return }
  }

  async function prepniAktivni(id: number, aktivni: boolean) {
    const { error } = await supabase.from('rychle_hlasky').update({ aktivni: !aktivni }).eq('id', id)
    if (error) { fail(describeError(error)); return }
    await loadHlasky()
  }

  async function smazHlasku(id: number) {
    const { error } = await supabase.from('rychle_hlasky').delete().eq('id', id)
    if (error) { fail(describeError(error)); return }
    await loadHlasky()
    ok('Hláška smazána')
  }

  // posun hlášky v pořadí - prohodí poradi se sousedem a uloží hned
  async function presunHlasku(index: number, dir: -1 | 1) {
    const a = hlasky[index]
    const b = hlasky[index + dir]
    if (!a || !b) return
    const e1 = (await supabase.from('rychle_hlasky').update({ poradi: b.poradi }).eq('id', a.id)).error
    const e2 = (await supabase.from('rychle_hlasky').update({ poradi: a.poradi }).eq('id', b.id)).error
    if (e1 || e2) { fail(describeError(e1 || e2)); return }
    await loadHlasky()
  }

  // klik na rychlou hlášku = toggle (druhý klik na aktivní vyprázdní poznámku)
  const klikniHlasku = (text: string) => set('poznamka', form.poznamka === text ? '' : text)

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#f7f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif', color: '#8a7f70', fontSize: '14px' }}>
        Načítám…
      </main>
    )
  }

  // přepínací tlačítko (segment)
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

  const sectionLabel = (t: string) => (
    <p style={{ fontSize: '12px', color: '#8a7f70', margin: '0 0 8px', fontWeight: 500 }}>{t}</p>
  )

  const aktivniHlasky = hlasky.filter(h => h.aktivni)

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

          {sectionLabel('Stav')}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {stateBtn('Otevřeno', form.je_otevreno, () => set('je_otevreno', true))}
            {stateBtn('Zavřeno', !form.je_otevreno, () => set('je_otevreno', false))}
          </div>

          {sectionLabel('Dnešní výjimka (skryje běžnou otevírací dobu, ukáže jen poznámku)')}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {stateBtn('Zapnuto', form.dnesni_vyjimka, () => set('dnesni_vyjimka', true))}
            {stateBtn('Vypnuto', !form.dnesni_vyjimka, () => set('dnesni_vyjimka', false))}
          </div>

          {sectionLabel('Otevírací doba')}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="Otevírá (07:00)" value={form.oteviraci_cas} onChange={e => set('oteviraci_cas', e.target.value)} style={{ ...inputStyle, width: '50%' }} />
            <input type="text" placeholder="Zavírá (18:00)" value={form.zaviraci_cas} onChange={e => set('zaviraci_cas', e.target.value)} style={{ ...inputStyle, width: '50%' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 8px' }}>
            <span style={{ fontSize: '12px', color: '#8a7f70', fontWeight: 500 }}>Poznámka (nepovinné)</span>
            {form.poznamka && (
              <button onClick={() => set('poznamka', '')}
                style={{ background: 'none', border: 'none', fontSize: '12px', color: '#c0392b', cursor: 'pointer', fontFamily: 'Inter,sans-serif', padding: 0 }}>
                Vymazat poznámku
              </button>
            )}
          </div>
          {aktivniHlasky.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {aktivniHlasky.map(h => (
                <button key={h.id} onClick={() => klikniHlasku(h.text)}
                  style={{
                    padding: '7px 11px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer',
                    fontFamily: 'Inter,sans-serif',
                    border: form.poznamka === h.text ? '1px solid #1a1208' : '1px solid #e0d9d0',
                    background: form.poznamka === h.text ? '#1a1208' : 'white',
                    color: form.poznamka === h.text ? '#d4a96a' : '#1a1208'
                  }}>
                  {h.text}
                </button>
              ))}
            </div>
          )}
          <input type="text" placeholder="…nebo napiš vlastní poznámku" value={form.poznamka} onChange={e => set('poznamka', e.target.value)} style={inputStyle} />

          <p style={{ fontSize: '11px', color: '#8a7f70', margin: '14px 0 6px', fontStyle: 'italic' }}>Náhled — takto to uvidí zákazník</p>
          <div style={{ background: '#f7f3ec', borderRadius: '12px', padding: '12px' }}>
            <div style={{ background: 'white', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '12px 14px' }}>
              <KioskStatusView
                je_otevreno={form.je_otevreno}
                oteviraci_cas={form.oteviraci_cas}
                zaviraci_cas={form.zaviraci_cas}
                poznamka={form.poznamka}
                dnesni_vyjimka={form.dnesni_vyjimka}
              />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            style={{ width: '100%', padding: '13px', background: '#1a1208', color: '#d4a96a', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: saving ? 'default' : 'pointer', marginTop: '14px', fontFamily: 'Inter,sans-serif', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Ukládám…' : 'Uložit'}
          </button>

          {message && <p style={{ fontSize: '13px', color: msgOk ? '#2e7d32' : '#c0392b', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>{message}</p>}

          <div style={{ height: '1px', background: '#f0ebe3', margin: '22px 0 16px' }} />

          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1208', margin: '0 0 4px' }}>Správa hlášek</h2>
          <p style={{ fontSize: '12px', color: '#8a7f70', margin: '0 0 12px' }}>Změny se ukládají hned. Vypnutá hláška se nenabízí jako rychlá volba.</p>

          {hlasky.map((h, i) => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button onClick={() => presunHlasku(i, -1)} disabled={i === 0} title="Nahoru"
                  style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '13px', lineHeight: 1.2, cursor: i === 0 ? 'default' : 'pointer', fontFamily: 'Inter,sans-serif', border: '1px solid #e0d9d0', background: 'white', color: '#1a1208', opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                <button onClick={() => presunHlasku(i, 1)} disabled={i === hlasky.length - 1} title="Dolů"
                  style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '13px', lineHeight: 1.2, cursor: i === hlasky.length - 1 ? 'default' : 'pointer', fontFamily: 'Inter,sans-serif', border: '1px solid #e0d9d0', background: 'white', color: '#1a1208', opacity: i === hlasky.length - 1 ? 0.3 : 1 }}>↓</button>
              </div>
              <input type="text" defaultValue={h.text}
                onChange={e => setHlasky(list => list.map(x => x.id === h.id ? { ...x, text: e.target.value } : x))}
                onBlur={e => prejmenujHlasku(h.id, e.target.value)}
                style={{ ...inputStyle, marginBottom: 0, flex: 1, minWidth: 0, opacity: h.aktivni ? 1 : 0.5 }} />
              <button onClick={() => prepniAktivni(h.id, h.aktivni)}
                title={h.aktivni ? 'Vypnout' : 'Zapnout'}
                style={{
                  padding: '8px 10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap',
                  border: h.aktivni ? '1px solid #1a1208' : '1px solid #e0d9d0',
                  background: h.aktivni ? '#1a1208' : 'white',
                  color: h.aktivni ? '#d4a96a' : '#8a7f70'
                }}>
                {h.aktivni ? 'Zap' : 'Vyp'}
              </button>
              <button onClick={() => smazHlasku(h.id)} title="Smazat"
                style={{ padding: '8px 10px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', border: '1px solid #e0d9d0', background: 'white', color: '#c0392b' }}>
                ✕
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            <input type="text" placeholder="Nová hláška" value={novaHlaska}
              onChange={e => setNovaHlaska(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') pridejHlasku() }}
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
            <button onClick={pridejHlasku}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter,sans-serif', border: 'none', background: '#1a1208', color: '#d4a96a', whiteSpace: 'nowrap' }}>
              Přidat
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
