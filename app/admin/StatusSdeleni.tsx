'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import KioskStatusView from '../KioskStatusView'
import { vypocetStav, type RozvrhDen, type KioskRow } from '../lib/stav'

// Admin: STATUS & SDĚLENÍ na jednom místě (jeden typ aktivity — živá úvodní stránka).
// Režim auto (rozvrh) / ruční (výjimka). Mezifáze, výhled na zítřek. Sdělení 1–3.

const DNY = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
const CZ = {
  otevreno: 'Otevřeno', dnesZavreno: 'Dnes zavřeno', od: 'od', do: 'do',
  brzyOtevreme: 'Brzy otevřeme', zatimZavreno: 'Zatím zavřeno', brzyZavirame: 'Brzy zavíráme',
  otevira: 'otevírá', vyuzijChvili: 'využij chvíli', zitra: 'Zítra', zitraZavreno: 'zavřeno',
}
const inp: React.CSSProperties = { border: '0.5px solid #e0d9d0', borderRadius: 8, padding: '7px 10px', fontSize: 13, fontFamily: 'Inter,sans-serif', outline: 'none' }

type Kiosk = KioskRow & { viditelnost?: string }

export default function StatusSdeleni() {
  const [k, setK] = useState<Kiosk | null>(null)
  const [rozvrh, setRozvrh] = useState<RozvrhDen[]>([])
  const [sd, setSd] = useState({ s1z: false, s1t: '', s2z: false, s2t: '', s3z: false, s3t: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('kiosk_status').select('je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, duvod, dnesni_vyjimka, rezim, brzy_otevre_min, brzy_zavre_min, vyhled_text').eq('pobocka_id', 'hlavni').maybeSingle(),
      supabase.from('rozvrh').select('den, zavreno, otevira, zavira').eq('pobocka_id', 'hlavni').order('den'),
      supabase.from('web_obsah').select('sdeleni1_zap, sdeleni1_text, sdeleni2_zap, sdeleni2_text, sdeleni3_zap, sdeleni3_text').eq('klic', 'hlavni').maybeSingle(),
    ]).then(([ks, rz, wo]) => {
      const d = (ks.data as Kiosk) || null
      if (d) setK({ ...d, rezim: d.rezim || 'auto', brzy_otevre_min: d.brzy_otevre_min ?? 25, brzy_zavre_min: d.brzy_zavre_min ?? 30 })
      const rows = (rz.data as RozvrhDen[]) || []
      setRozvrh([0, 1, 2, 3, 4, 5, 6].map(den => rows.find(x => x.den === den) || { den, zavreno: den === 6, otevira: '08:00', zavira: '16:00' }))
      const w: any = wo.data || {}
      setSd({ s1z: !!w.sdeleni1_zap, s1t: w.sdeleni1_text || '', s2z: !!w.sdeleni2_zap, s2t: w.sdeleni2_text || '', s3z: !!w.sdeleni3_zap, s3t: w.sdeleni3_text || '' })
      setLoading(false)
    })
  }, [])

  if (loading || !k) return <div className="adm-muted">Načítám…</div>
  const setKf = (f: keyof Kiosk, v: any) => setK({ ...k, [f]: v })
  const setRf = (den: number, f: keyof RozvrhDen, v: any) => setRozvrh(rozvrh.map(r => r.den === den ? { ...r, [f]: v } : r))
  const auto = (k.rezim || 'auto') === 'auto'
  const stav = vypocetStav(rozvrh, k, new Date())

  async function ulozit() {
    if (!k) return
    setSaving(true); setMsg('')
    try {
      const e1 = (await supabase.from('kiosk_status').update({
        rezim: k.rezim, je_otevreno: k.je_otevreno, dnesni_vyjimka: k.dnesni_vyjimka,
        oteviraci_cas: k.oteviraci_cas || null, zaviraci_cas: k.zaviraci_cas || null, poznamka: k.poznamka || null,
        brzy_otevre_min: k.brzy_otevre_min, brzy_zavre_min: k.brzy_zavre_min, vyhled_text: k.vyhled_text || null,
      }).eq('pobocka_id', 'hlavni')).error
      for (const r of rozvrh) {
        await supabase.from('rozvrh').update({ zavreno: r.zavreno, otevira: r.otevira || null, zavira: r.zavira || null }).eq('pobocka_id', 'hlavni').eq('den', r.den)
      }
      const e3 = (await supabase.from('web_obsah').update({
        sdeleni1_zap: sd.s1z, sdeleni1_text: sd.s1t || null, sdeleni2_zap: sd.s2z, sdeleni2_text: sd.s2t || null, sdeleni3_zap: sd.s3z, sdeleni3_text: sd.s3t || null,
      }).eq('klic', 'hlavni')).error
      if (e1 || e3) setMsg('Chyba: ' + ((e1 || e3)?.message))
      else setMsg('Uloženo ✓')
    } catch (e: any) { setMsg('Chyba: ' + e.message) }
    finally { setSaving(false) }
  }

  const seg = (label: string, on: boolean, onClick: () => void) => (
    <button className={'adm-seg' + (on ? ' on' : '')} onClick={onClick} style={{ flex: 1 }}>{label}</button>
  )

  return (
    <>
      <div className="adm-card">
        <p className="adm-card-h">Režim statusu</p>
        <div className="adm-row" style={{ marginBottom: 10 }}>
          {seg('Automatický', auto, () => setKf('rezim', 'auto'))}
          {seg('Ruční', !auto, () => setKf('rezim', 'rucni'))}
        </div>
        <div style={{ background: auto ? '#eef6ea' : '#faf1e0', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: auto ? '#3b6d2a' : '#8a5a1a' }}>
          {auto ? 'Vše běží podle rozvrhu — teď nemusíš nic dělat. Přepni na Ruční, když je výjimka.' : 'Ruční režim — automat je vypnutý, stavy měníš a hlídáš sám.'}
        </div>
      </div>

      <div className="adm-card">
        <p className="adm-card-h">Živý náhled — co teď vidí zákazník</p>
        <div className="adm-preview"><KioskStatusView stav={stav} stavLabels={CZ} /></div>
      </div>

      {auto ? (
        <>
          <div className="adm-card">
            <p className="adm-card-h">Týdenní rozvrh</p>
            {rozvrh.map(r => (
              <div key={r.den} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 24, fontSize: 13 }}>{DNY[r.den]}</span>
                <button className={'adm-seg' + (r.zavreno ? '' : ' on')} style={{ padding: '5px 10px' }} onClick={() => setRf(r.den, 'zavreno', !r.zavreno)}>{r.zavreno ? 'Zavřeno' : 'Otevřeno'}</button>
                {!r.zavreno && <>
                  <input style={{ ...inp, width: 74 }} value={r.otevira || ''} onChange={e => setRf(r.den, 'otevira', e.target.value)} placeholder="08:00" />
                  <span className="adm-muted">–</span>
                  <input style={{ ...inp, width: 74 }} value={r.zavira || ''} onChange={e => setRf(r.den, 'zavira', e.target.value)} placeholder="16:00" />
                </>}
              </div>
            ))}
          </div>
          <div className="adm-card">
            <p className="adm-card-h">Mezifáze (status je hlídá sám)</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
              <span style={{ flex: 1 }}>Brzy otevře — kolik minut předem</span>
              <input style={{ ...inp, width: 60 }} type="number" value={k.brzy_otevre_min ?? 25} onChange={e => setKf('brzy_otevre_min', +e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ flex: 1 }}>Brzy zavře — kolik minut předem</span>
              <input style={{ ...inp, width: 60 }} type="number" value={k.brzy_zavre_min ?? 30} onChange={e => setKf('brzy_zavre_min', +e.target.value)} />
            </div>
          </div>
          <div className="adm-card">
            <p className="adm-card-h">Výhled na zítřek</p>
            <p className="adm-muted" style={{ marginBottom: 8 }}>Prázdné = spočítá se z rozvrhu. Vyplněné = tvůj vlastní text.</p>
            <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }} value={k.vyhled_text || ''} onChange={e => setKf('vyhled_text', e.target.value)} placeholder="např. Zítra otevřeno 8–16" />
          </div>
        </>
      ) : (
        <div className="adm-card">
          <p className="adm-card-h">Dnešní stav (ruční)</p>
          <div className="adm-row" style={{ marginBottom: 10 }}>
            {seg('Otevřeno', !!k.je_otevreno, () => setKf('je_otevreno', true))}
            {seg('Zavřeno', !k.je_otevreno, () => setKf('je_otevreno', false))}
          </div>
          <div className="adm-row" style={{ marginBottom: 10 }}>
            <input style={{ ...inp, flex: 1 }} value={k.oteviraci_cas || ''} onChange={e => setKf('oteviraci_cas', e.target.value)} placeholder="Otevírá 08:00" />
            <input style={{ ...inp, flex: 1 }} value={k.zaviraci_cas || ''} onChange={e => setKf('zaviraci_cas', e.target.value)} placeholder="Zavírá 16:00" />
          </div>
          <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }} value={k.poznamka || ''} onChange={e => setKf('poznamka', e.target.value)} placeholder="Poznámka (např. Zavřeno kvůli počasí)" />
        </div>
      )}

      <div className="adm-card">
        <p className="adm-card-h">Sdělení na web (živé vzkazy pro zákazníky)</p>
        {[
          ['nad statusem', sd.s1z, sd.s1t, (z: boolean) => setSd({ ...sd, s1z: z }), (t: string) => setSd({ ...sd, s1t: t })],
          ['mezi statusem a popisem', sd.s2z, sd.s2t, (z: boolean) => setSd({ ...sd, s2z: z }), (t: string) => setSd({ ...sd, s2t: t })],
          ['pod popisem', sd.s3z, sd.s3t, (z: boolean) => setSd({ ...sd, s3z: z }), (t: string) => setSd({ ...sd, s3t: t })],
        ].map(([label, zap, text, setZ, setT]: any, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <button className={'adm-seg' + (zap ? ' on' : '')} style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setZ(!zap)}>{zap ? 'Zap' : 'Vyp'}</button>
              <span className="adm-muted">Sdělení {i + 1} · {label}</span>
            </div>
            <input style={{ ...inp, width: '100%', boxSizing: 'border-box', opacity: zap ? 1 : 0.5 }} value={text} onChange={e => setT(e.target.value)} placeholder="např. Dnes čerstvé tulipány" />
          </div>
        ))}
      </div>

      <button className="adm-btn" onClick={ulozit} disabled={saving} style={{ background: '#1a1208', color: '#d4a96a', border: 'none' }}>{saving ? 'Ukládám…' : 'Uložit'}</button>
      {msg && <span style={{ marginLeft: 10, fontSize: 13, color: msg.startsWith('Chyba') ? '#c0392b' : '#3b7d3b' }}>{msg}</span>}
    </>
  )
}
