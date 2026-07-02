'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import KioskStatusView from '../KioskStatusView'
import { vypocetStav, luxDen, type RozvrhDen, type KioskRow } from '../lib/stav'
import { SdeleniRadek } from '../WebObsahView'
import { VELIKOSTI, FONTY, REZY, BARVY_SDELENI, DEFAULT_STYL, type StylSdeleni } from '../lib/sdeleniStyl'

// Admin: STATUS & SDĚLENÍ na jednom místě. Náhled + Uložit nahoře (nescrolluješ).
// Režim auto (rozvrh) / ruční (potvrzený rozvrh — předvyplněno z plánu, mezifáze fungují i tady).
// Sdělení 1–3: text (ANGLICKY, nepřekládá se) + vzhled (velikost/font/řez/barva/rámeček), úpravy na 1/2/3 řádky.

const DNY = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
const POZICE = ['nad statusem', 'mezi statusem a popisem', 'pod popisem']
const CZ = {
  otevreno: 'Otevřeno', dnesZavreno: 'Dnes zavřeno', od: 'od', do: 'do',
  brzyOtevreme: 'Brzy otevřeme', zatimZavreno: 'Zatím zavřeno', brzyZavirame: 'Brzy zavíráme',
  otevira: 'otevírá', vyuzijChvili: 'využij chvíli', zitra: 'Zítra', zitraZavreno: 'zavřeno', dnes: 'dnes',
  praveTed: 'Právě teď', dnesUzZavreno: 'Dnes už zavřeno', pravdepodobne: 'pravděpodobně', otevrenoMale: 'otevřeno',
}
const inp: React.CSSProperties = { border: '0.5px solid #e0d9d0', borderRadius: 8, padding: '7px 10px', fontSize: 13, fontFamily: 'Inter,sans-serif', outline: 'none', color: '#1a1208' }

type Kiosk = KioskRow & { viditelnost?: string; poznamka_preklady?: Record<string, string> | null }
type Sdel = { zap: boolean; text: string; styl: StylSdeleni }
type Hlaska = { id: number; kategorie: string; text: string; preklady: Record<string, string>; poradi: number }

// Přeloží anglický text do 5 jazyků přes /api/preklad (fallback = angličtina).
async function prelozit(text: string): Promise<Record<string, string>> {
  try {
    const r = await fetch('/api/preklad', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    return await r.json()
  } catch { return { en: text, cz: text, fr: text, de: text, lu: text } }
}

export default function StatusSdeleni() {
  const [k, setK] = useState<Kiosk | null>(null)
  const [rozvrh, setRozvrh] = useState<RozvrhDen[]>([])
  const [sd, setSd] = useState<Sdel[]>([])
  const [cil, setCil] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [hlasky, setHlasky] = useState<Hlaska[]>([])
  const [novaHlaska, setNovaHlaska] = useState({ text: '', kategorie: 'sdeleni' })
  const [hlaskaBusy, setHlaskaBusy] = useState(false)
  const [zkop, setZkop] = useState(false)
  const [nahledKey, setNahledKey] = useState(0) // vynucené obnovení mini náhledu úvodní stránky

  useEffect(() => {
    Promise.all([
      supabase.from('kiosk_status').select('je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, poznamka_preklady, duvod, dnesni_vyjimka, rezim, brzy_otevre_min, brzy_zavre_min, vyhled_text, vyhled_rezim').eq('pobocka_id', 'hlavni').maybeSingle(),
      supabase.from('rozvrh').select('den, zavreno, otevira, zavira').eq('pobocka_id', 'hlavni').order('den'),
      supabase.from('web_obsah').select('sdeleni1_zap, sdeleni1_text, sdeleni1_styl, sdeleni2_zap, sdeleni2_text, sdeleni2_styl, sdeleni3_zap, sdeleni3_text, sdeleni3_styl').eq('klic', 'hlavni').maybeSingle(),
      supabase.from('hlasky').select('id, kategorie, text, preklady, poradi').order('poradi', { ascending: true }).order('id', { ascending: true }),
    ]).then(([ks, rz, wo, hl]) => {
      setHlasky((hl.data as Hlaska[]) || [])
      const d = (ks.data as Kiosk) || null
      if (d) setK({ ...d, rezim: d.rezim || 'auto', brzy_otevre_min: d.brzy_otevre_min ?? 25, brzy_zavre_min: d.brzy_zavre_min ?? 30 })
      const rows = (rz.data as RozvrhDen[]) || []
      setRozvrh([0, 1, 2, 3, 4, 5, 6].map(den => rows.find(x => x.den === den) || { den, zavreno: den === 6, otevira: '08:00', zavira: '16:00' }))
      const w: any = wo.data || {}
      setSd([1, 2, 3].map(n => ({
        zap: !!w[`sdeleni${n}_zap`], text: w[`sdeleni${n}_text`] || '',
        styl: { ...DEFAULT_STYL, ...(w[`sdeleni${n}_styl`] || {}) },
      })))
      setLoading(false)
    })
  }, [])

  if (loading || !k) return <div className="adm-muted">Načítám…</div>
  const setKf = (f: keyof Kiosk, v: any) => setK({ ...k, [f]: v })
  const setRf = (den: number, f: keyof RozvrhDen, v: any) => setRozvrh(rozvrh.map(r => r.den === den ? { ...r, [f]: v } : r))
  const auto = (k.rezim || 'auto') === 'auto'
  const stav = vypocetStav(rozvrh, k, new Date())

  // Přepnutí režimu: do ručního předvyplníme dnešní čas z plánu (majitel jen potvrdí / upraví výjimku).
  function prepnoutRezim(r: 'auto' | 'rucni') {
    if (r !== 'rucni') { setKf('rezim', 'auto'); return }
    const dnes = rozvrh.find(x => x.den === luxDen(new Date()))
    setK(prev => prev ? {
      ...prev, rezim: 'rucni',
      je_otevreno: prev.je_otevreno ?? !(dnes?.zavreno),
      oteviraci_cas: prev.oteviraci_cas || dnes?.otevira || '08:00',
      zaviraci_cas: prev.zaviraci_cas || dnes?.zavira || '16:00',
    } : prev)
  }
  function prevzitZPlanu() {
    const dnes = rozvrh.find(x => x.den === luxDen(new Date()))
    setK(prev => prev ? { ...prev, je_otevreno: !(dnes?.zavreno), oteviraci_cas: dnes?.otevira || '08:00', zaviraci_cas: dnes?.zavira || '16:00' } : prev)
  }

  // Úpravy vzhledu se propíšou do všech zaškrtnutých řádků (cíl).
  const cilPos = [0, 1, 2].filter(i => cil[i])
  const repr: StylSdeleni = { ...DEFAULT_STYL, ...(sd[cilPos[0] ?? 0]?.styl || {}) }
  function upravStyl(f: keyof StylSdeleni, v: any) {
    setSd(sd.map((s, i) => cil[i] ? { ...s, styl: { ...s.styl, [f]: v } } : s))
  }
  const setSdF = (i: number, f: keyof Sdel, v: any) => setSd(sd.map((s, j) => j === i ? { ...s, [f]: v } : s))

  // Knihovna hlášek: přidat (přeloží se), smazat, vložit do řádku / výjimky.
  async function pridatHlasku() {
    if (!novaHlaska.text.trim()) return
    setHlaskaBusy(true)
    const prek = await prelozit(novaHlaska.text.trim())
    const maxP = Math.max(0, ...hlasky.filter(h => h.kategorie === novaHlaska.kategorie).map(h => h.poradi))
    const { data, error } = await supabase.from('hlasky').insert({ kategorie: novaHlaska.kategorie, text: novaHlaska.text.trim(), preklady: prek, poradi: maxP + 1 }).select('id, kategorie, text, preklady, poradi').maybeSingle()
    if (!error && data) { setHlasky([...hlasky, data as Hlaska]); setNovaHlaska({ ...novaHlaska, text: '' }) }
    else setMsg('Chyba hlášky: ' + (error?.message || ''))
    setHlaskaBusy(false)
  }
  async function smazatHlasku(id: number) {
    await supabase.from('hlasky').delete().eq('id', id)
    setHlasky(hlasky.filter(h => h.id !== id))
  }
  // Přesun nahoru/dolů = prohození pořadí se sousedem ve stejné kategorii
  async function presunHlasku(h: Hlaska, dir: -1 | 1) {
    const skupina = hlasky.filter(x => x.kategorie === h.kategorie).sort((a, b) => a.poradi - b.poradi || a.id - b.id)
    const idx = skupina.findIndex(x => x.id === h.id)
    const soused = skupina[idx + dir]
    if (!soused) return
    const pa = h.poradi, pb = soused.poradi
    await Promise.all([
      supabase.from('hlasky').update({ poradi: pb }).eq('id', h.id),
      supabase.from('hlasky').update({ poradi: pa }).eq('id', soused.id),
    ])
    setHlasky(hlasky.map(x => x.id === h.id ? { ...x, poradi: pb } : x.id === soused.id ? { ...x, poradi: pa } : x))
  }

  // Text pro Instagram bio (anglicky):
  //  otevřeno den:  🟢 Thursday: open 09:00–18:30  tomorrow: likely open/closed
  //  zavřeno den:   🔴 Thursday: closed  tomorrow: likely open/closed  (bez času)
  //  „tomorrow" vždy malým písmenem; dvě mezery před ním.
  function instagramText(): string {
    const den = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Luxembourg', weekday: 'long' }).format(new Date())
    const denOtevreny = !!(stav.otevira && stav.zavira) // dnešek je otevírací den (má hodiny)
    const dnesCast = denOtevreny ? `open ${stav.otevira}–${stav.zavira}` : 'closed'
    const kruh = denOtevreny ? '🟢' : '🔴'
    const zOpen = !!stav.vyhledOtevreno
    // dnešní verdikt oddělen ČÁRKOU + dvě mezery od zítřejšího → přehledné, nesplývá to
    return `${kruh} ${den}: ${dnesCast},  tomorrow: likely ${zOpen ? 'open' : 'closed'}`
  }
  async function kopirovatIG() {
    try { await navigator.clipboard.writeText(instagramText()); setZkop(true); setTimeout(() => setZkop(false), 2000) }
    catch { setMsg('Nepodařilo se zkopírovat do schránky') }
  }

  async function ulozit() {
    if (!k) return
    setSaving(true); setMsg('Ukládám a překládám…')
    try {
      // překlady (angličtina → 5 jazyků) pro sdělení + výjimku; volá se jen tady, uloží se do DB
      const [p0, p1, p2] = await Promise.all(sd.map(s => s.text.trim() ? prelozit(s.text.trim()) : Promise.resolve({})))
      const poznPrek = k.poznamka?.trim() ? await prelozit(k.poznamka.trim()) : {}
      const vhPrek = k.vyhled_text?.trim() ? await prelozit(k.vyhled_text.trim()) : {}
      const e1 = (await supabase.from('kiosk_status').update({
        rezim: k.rezim, je_otevreno: k.je_otevreno, dnesni_vyjimka: k.dnesni_vyjimka,
        oteviraci_cas: k.oteviraci_cas || null, zaviraci_cas: k.zaviraci_cas || null, poznamka: k.poznamka || null,
        poznamka_preklady: poznPrek,
        brzy_otevre_min: k.brzy_otevre_min, brzy_zavre_min: k.brzy_zavre_min, vyhled_text: k.vyhled_text || null,
        vyhled_text_preklady: vhPrek, vyhled_rezim: k.vyhled_rezim || 'plan',
      }).eq('pobocka_id', 'hlavni')).error
      for (const r of rozvrh) {
        await supabase.from('rozvrh').update({ zavreno: r.zavreno, otevira: r.otevira || null, zavira: r.zavira || null }).eq('pobocka_id', 'hlavni').eq('den', r.den)
      }
      const e3 = (await supabase.from('web_obsah').update({
        sdeleni1_zap: sd[0].zap, sdeleni1_text: sd[0].text || null, sdeleni1_styl: sd[0].styl, sdeleni1_preklady: p0,
        sdeleni2_zap: sd[1].zap, sdeleni2_text: sd[1].text || null, sdeleni2_styl: sd[1].styl, sdeleni2_preklady: p1,
        sdeleni3_zap: sd[2].zap, sdeleni3_text: sd[2].text || null, sdeleni3_styl: sd[2].styl, sdeleni3_preklady: p2,
      }).eq('klic', 'hlavni')).error
      if (e1 || e3) setMsg('Chyba: ' + ((e1 || e3)?.message))
      else { setMsg('Uloženo ✓ (přeloženo do 5 jazyků)'); setNahledKey(x => x + 1) } // obnov mini náhled
    } catch (e: any) { setMsg('Chyba: ' + e.message) }
    finally { setSaving(false) }
  }

  const seg = (label: string, on: boolean, onClick: () => void, flex = true) => (
    <button className={'adm-seg' + (on ? ' on' : '')} onClick={onClick} style={flex ? { flex: 1 } : undefined}>{label}</button>
  )
  // Výběr hlášky z knihovny → vloží její (anglický) text do pole
  const VyberHlasky = ({ kat, onPick }: { kat: string; onPick: (t: string) => void }) => {
    const list = hlasky.filter(h => h.kategorie === kat).sort((a, b) => a.poradi - b.poradi || a.id - b.id)
    if (!list.length) return null
    return (
      <select style={{ ...inp, maxWidth: 220 }} value="" onChange={e => { const h = list.find(x => x.id === +e.target.value); if (h) onPick(h.text) }}>
        <option value="">Vložit hlášku…</option>
        {list.map(h => <option key={h.id} value={h.id}>{h.text}</option>)}
      </select>
    )
  }
  const UlozitBtn = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button className="adm-btn" onClick={ulozit} disabled={saving} style={{ background: '#1a1208', color: '#d4a96a', border: 'none', whiteSpace: 'nowrap' }}>{saving ? 'Ukládám…' : 'Uložit'}</button>
      {msg && <span style={{ fontSize: 13, color: msg.startsWith('Chyba') ? '#c0392b' : '#3b7d3b' }}>{msg}</span>}
    </div>
  )

  return (
    <>
      {/* NÁHLED + ULOŽIT vlevo, INSTAGRAM vpravo — obojí nahoře, poslední kroky vedle sebe */}
      <div className="adm-sticky">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '2 1 240px', minWidth: 0 }}>
            <p className="adm-card-h" style={{ margin: '0 0 5px' }}>Živý náhled — co teď vidí zákazník</p>
            <div className="adm-preview"><KioskStatusView stav={stav} stavLabels={CZ} /></div>
            <div style={{ marginTop: 7 }}>{UlozitBtn}</div>
          </div>
          <div style={{ flex: '2 1 220px', minWidth: 0 }}>
            <p className="adm-card-h" style={{ margin: '0 0 5px' }}>Instagram bio <span className="adm-badge" style={{ color: '#8a7f70' }}>anglicky</span></p>
            <div className="adm-preview" style={{ display: 'flex', alignItems: 'center', minHeight: 40 }}><span style={{ fontSize: 13.5, color: '#1a1208', overflowWrap: 'anywhere' }}>{instagramText()}</span></div>
            <div style={{ marginTop: 7 }}>
              <button className="adm-btn" onClick={kopirovatIG} style={{ background: zkop ? '#3b7d3b' : '#1a1208', color: '#fff', border: 'none', fontWeight: 600 }}>{zkop ? 'Zkopírováno ✓' : '📋 Zkopírovat'}</button>
            </div>
          </div>
          <div style={{ flex: '0 1 130px', minWidth: 0 }}>
            <p className="adm-card-h" style={{ margin: '0 0 5px', fontSize: 12 }}>Story sticker</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <a className="adm-btn" href="/stav-obrazek" download="bravo-status.png" style={{ background: '#1a1208', color: '#fff', border: 'none', fontWeight: 600, textAlign: 'center', fontSize: 12, padding: '7px 8px' }}>⬇ Stáhnout</a>
              <a className="adm-btn" href="/stav-obrazek" target="_blank" rel="noopener noreferrer" style={{ textAlign: 'center', fontSize: 12, padding: '6px 8px' }}>Otevřít</a>
            </div>
          </div>
        </div>
      </div>

      {/* Režim — kompaktní jeden řádek */}
      <div className="adm-card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="adm-card-h" style={{ margin: 0 }}>Režim:</span>
          {seg('Automatický', auto, () => prepnoutRezim('auto'), false)}
          {seg('Ruční', !auto, () => prepnoutRezim('rucni'), false)}
          <span className="adm-muted" style={{ flex: '1 1 180px' }}>{auto ? 'Vše běží podle rozvrhu — nemusíš nic dělat.' : 'Časy předvyplněné z plánu, uprav jen výjimku.'}</span>
        </div>
      </div>

      {/* Ruční: dnešní stav (jen v ručním režimu) */}
      {!auto && (
        <div className="adm-card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="adm-card-h" style={{ margin: 0 }}>Dnes:</span>
            {seg('Otevřeno', !!k.je_otevreno, () => setKf('je_otevreno', true), false)}
            {seg('Zavřeno', !k.je_otevreno, () => setKf('je_otevreno', false), false)}
            {k.je_otevreno && <>
              <input style={{ ...inp, width: 74 }} value={k.oteviraci_cas || ''} onChange={e => setKf('oteviraci_cas', e.target.value)} placeholder="08:00" />
              <span className="adm-muted">–</span>
              <input style={{ ...inp, width: 74 }} value={k.zaviraci_cas || ''} onChange={e => setKf('zaviraci_cas', e.target.value)} placeholder="18:30" />
            </>}
            <button onClick={prevzitZPlanu} style={{ background: '#d4a96a', color: '#1a1208', border: 'none', borderRadius: 9, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>↺ Převzít z plánu</button>
          </div>
        </div>
      )}

      {/* Mezifáze — kompaktní jeden řádek */}
      <div className="adm-card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
          <span className="adm-card-h" style={{ margin: 0 }}>Mezifáze:</span>
          <span>brzy otevře</span>
          <input style={{ ...inp, width: 54 }} type="number" value={k.brzy_otevre_min ?? 25} onChange={e => setKf('brzy_otevre_min', +e.target.value)} />
          <span className="adm-muted">min ·</span>
          <span>brzy zavře</span>
          <input style={{ ...inp, width: 54 }} type="number" value={k.brzy_zavre_min ?? 30} onChange={e => setKf('brzy_zavre_min', +e.target.value)} />
          <span className="adm-muted">min předem</span>
        </div>
      </div>

      <div className="adm-card">
        <p className="adm-card-h">Výhled na zítřek</p>
        <div className="adm-row" style={{ marginBottom: 8 }}>
          {seg('Podle plánu', (k.vyhled_rezim || 'plan') === 'plan', () => setKf('vyhled_rezim', 'plan'))}
          {seg('Pravděpodobně otevřeno', k.vyhled_rezim === 'otevreno', () => setKf('vyhled_rezim', 'otevreno'))}
          {seg('Pravděpodobně zavřeno', k.vyhled_rezim === 'zavreno', () => setKf('vyhled_rezim', 'zavreno'))}
        </div>
        <p className="adm-muted" style={{ marginBottom: 8 }}>Volba se přeloží do všech jazyků. „Podle plánu" bere zítřek z rozvrhu. Níže vlastní text = přepis (nepřekládá se).</p>
        <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }} value={k.vyhled_text || ''} onChange={e => setKf('vyhled_text', e.target.value)} placeholder="Vlastní text (nepovinné) — např. Zítra svátek" />
      </div>

      <div className="adm-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <p className="adm-card-h" style={{ margin: 0, flex: 1 }}>Výjimka u statusu <span className="adm-badge" style={{ color: '#8a7f70' }}>EN · přeloží se</span></p>
          <VyberHlasky kat="vyjimka" onPick={t => setKf('poznamka', t)} />
          <button className="adm-seg" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setKf('poznamka', '')} disabled={!k.poznamka} title="Smazat výjimku">Vyčistit</button>
        </div>
        <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }} value={k.poznamka || ''} onChange={e => setKf('poznamka', e.target.value)} placeholder="Text in English (e.g. Closed due to weather)" />
      </div>

      {/* SDĚLENÍ — 3 řádky (anglicky) + vzhled písma na 1/2/3 řádky současně */}
      <div className="adm-card">
        <p className="adm-card-h">Sdělení na web <span className="adm-badge" style={{ color: '#8a7f70' }}>EN · přeloží se</span></p>
        {sd.map((s, i) => (
          <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < 2 ? '0.5px solid #eee5d8' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <button className={'adm-seg' + (s.zap ? ' on' : '')} style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setSdF(i, 'zap', !s.zap)}>{s.zap ? 'Zap' : 'Vyp'}</button>
              <span className="adm-muted">Sdělení {i + 1} · {POZICE[i]}</span>
              <span style={{ flex: 1 }} />
              <VyberHlasky kat="sdeleni" onPick={t => setSdF(i, 'text', t)} />
              <button className="adm-seg" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setSdF(i, 'text', '')} disabled={!s.text} title="Smazat text řádku">Vyčistit</button>
              <label style={{ fontSize: 12, color: '#8a7f70', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!cil[i]} onChange={e => setCil({ ...cil, [i]: e.target.checked })} /> upravovat vzhled
              </label>
            </div>
            <textarea style={{ ...inp, width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 40 }} value={s.text} onChange={e => setSdF(i, 'text', e.target.value)} placeholder="Text in English…" />
            {s.text.trim() && <div className="adm-preview" style={{ marginTop: 8 }}><SdeleniRadek text={s.text} styl={s.styl} /></div>}
          </div>
        ))}

        {/* Ovladač vzhledu — aplikuje na zaškrtnuté řádky */}
        <div style={{ background: '#faf7f1', borderRadius: 10, padding: 12, marginTop: 4 }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, color: '#8a7f70' }}>Vzhled písma — použije se na zaškrtnuté řádky ({cilPos.length ? cilPos.map(i => i + 1).join(', ') : 'žádný'})</p>
          <div style={{ opacity: cilPos.length ? 1 : 0.4, pointerEvents: cilPos.length ? 'auto' : 'none' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {VELIKOSTI.map(v => <button key={v.id} className={'adm-seg' + (repr.velikost === v.id ? ' on' : '')} style={{ padding: '4px 9px', fontSize: 12 }} onClick={() => upravStyl('velikost', v.id)}>{v.label}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
              <select style={{ ...inp, flex: '1 1 180px' }} value={repr.font} onChange={e => upravStyl('font', e.target.value)}>
                {FONTY.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              {REZY.map(r => <button key={r.id} className={'adm-seg' + (repr.rez === r.id ? ' on' : '')} style={{ padding: '4px 9px', fontSize: 12 }} onClick={() => upravStyl('rez', r.id)}>{r.label}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#8a7f70' }}>Barva:</span>
              {BARVY_SDELENI.map(b => (
                <button key={b.hex} title={b.label} onClick={() => upravStyl('barva', b.hex)}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: b.hex, cursor: 'pointer', border: repr.barva === b.hex ? '2px solid #1a1208' : '1px solid rgba(0,0,0,0.15)' }} />
              ))}
              <label style={{ fontSize: 12, color: '#8a7f70', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                vlastní <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(repr.barva || '') ? repr.barva : '#6f6253'} onChange={e => upravStyl('barva', e.target.value)} style={{ width: 26, height: 22, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
              </label>
              <label style={{ fontSize: 12, color: '#8a7f70', display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!repr.ram} onChange={e => upravStyl('ram', e.target.checked)} /> rámeček
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* KNIHOVNA HLÁŠEK — přednastavené vzkazy (přeloží se jednou), vybíráš je výše z „Vložit hlášku…" */}
      <div className="adm-card">
        <p className="adm-card-h">Knihovna hlášek <span className="adm-badge" style={{ color: '#8a7f70' }}>napiš anglicky, přeloží se</span></p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <select style={{ ...inp, width: 130 }} value={novaHlaska.kategorie} onChange={e => setNovaHlaska({ ...novaHlaska, kategorie: e.target.value })}>
            <option value="sdeleni">pro sdělení</option>
            <option value="vyjimka">pro výjimku</option>
          </select>
          <input style={{ ...inp, flex: '1 1 200px' }} value={novaHlaska.text} onChange={e => setNovaHlaska({ ...novaHlaska, text: e.target.value })} placeholder="Nová hláška v angličtině…" />
          <button className="adm-btn" onClick={pridatHlasku} disabled={hlaskaBusy || !novaHlaska.text.trim()} style={{ background: '#d4a96a', color: '#1a1208', border: 'none', fontWeight: 600 }}>{hlaskaBusy ? 'Překládám…' : '+ Přidat'}</button>
        </div>
        {(['sdeleni', 'vyjimka'] as const).map(kat => {
          const list = hlasky.filter(h => h.kategorie === kat).sort((a, b) => a.poradi - b.poradi || a.id - b.id)
          if (!list.length) return null
          return (
            <div key={kat} style={{ marginBottom: 8 }}>
              <p className="adm-muted" style={{ marginBottom: 4 }}>{kat === 'sdeleni' ? 'Sdělení' : 'Výjimky'} (pořadí = jak se nabízejí):</p>
              {list.map((h, i) => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                  <button className="adm-seg" style={{ padding: '2px 7px', fontSize: 12, opacity: i === 0 ? 0.3 : 1 }} disabled={i === 0} onClick={() => presunHlasku(h, -1)} title="Nahoru">↑</button>
                  <button className="adm-seg" style={{ padding: '2px 7px', fontSize: 12, opacity: i === list.length - 1 ? 0.3 : 1 }} disabled={i === list.length - 1} onClick={() => presunHlasku(h, 1)} title="Dolů">↓</button>
                  <span style={{ flex: 1, fontSize: 13, color: '#1a1208' }}>{h.text}</span>
                  <span className="adm-muted" title={`cz: ${h.preklady?.cz || ''}\nfr: ${h.preklady?.fr || ''}\nde: ${h.preklady?.de || ''}\nlu: ${h.preklady?.lu || ''}`} style={{ cursor: 'help' }}>5 jaz. ⓘ</span>
                  <button className="adm-seg" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => smazatHlasku(h.id)}>Smazat</button>
                </div>
              ))}
            </div>
          )
        })}
        {!hlasky.length && <p className="adm-muted">Zatím žádné hlášky. Přidej si vzkazy, které používáš často — pak je jen vybíráš nahoře.</p>}
      </div>

      {/* DOLE: týdenní rozvrh (měníš zřídka) + mini živý náhled celé úvodní stránky */}
      <div className="adm-card">
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <p className="adm-card-h">Týdenní rozvrh <span className="adm-muted">— měníš zřídka</span></p>
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
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <p className="adm-card-h" style={{ margin: 0, flex: 1 }}>Náhled úvodní stránky <span className="adm-muted">— po uložení</span></p>
              <button className="adm-seg" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setNahledKey(x => x + 1)}>↻ Obnovit</button>
            </div>
            <div style={{ width: 224, height: 520, overflow: 'hidden', borderRadius: 20, border: '0.5px solid #e0d9d0', background: '#efe7d6' }}>
              <iframe key={nahledKey} src={`/?nahled=${nahledKey}`} title="Náhled úvodní stránky (telefon)"
                style={{ width: 400, height: 1560, border: 0, transform: 'scale(0.56)', transformOrigin: 'top left' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 4 }}>{UlozitBtn}</div>
    </>
  )
}
