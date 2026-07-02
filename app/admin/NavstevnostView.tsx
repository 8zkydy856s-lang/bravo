'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Přehled návštěvnosti pro majitele (skryté, jen v dashboardu). Denní návštěvníci (unikátní/den)
// + návštěvy (načtení), sloupcový graf posledních dní, souhrny a trend (roste/klesá).

type Den = { den: string; navstevy: number; navstevnici: number }

const DNY_ZKR = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so']

type Zdroj = { den: string; zdroj: string; pocet: number }

export default function NavstevnostView() {
  const [data, setData] = useState<Den[] | null>(null)
  const [zdroje, setZdroje] = useState<Zdroj[]>([])
  const [dny, setDny] = useState(7)

  useEffect(() => {
    supabase.from('navstevnost').select('den, navstevy, navstevnici').order('den', { ascending: false }).limit(30)
      .then(({ data }) => setData(((data as Den[]) || []).slice().reverse()))
    supabase.from('navstevy_zdroj').select('den, zdroj, pocet').order('den', { ascending: false }).limit(200)
      .then(({ data }) => setZdroje((data as Zdroj[]) || []))
  }, [])

  if (!data) return <div className="adm-card"><p className="adm-muted">Načítám návštěvnost…</p></div>
  if (!data.length) return (
    <div className="adm-card">
      <p className="adm-card-h">Návštěvnost</p>
      <p className="adm-muted">Zatím žádná data — počítadlo začne sbírat návštěvy od teď. Vrať se za pár dní.</p>
    </div>
  )

  const suma = (arr: Den[], f: (d: Den) => number) => arr.reduce((a, d) => a + f(d), 0)
  const poslednich = (n: number) => data.slice(-n)
  const dnesRec = data[data.length - 1]
  const tento = poslednich(7), minuly = data.slice(-14, -7)
  const navTento = suma(tento, d => d.navstevnici)
  const navMinuly = suma(minuly, d => d.navstevnici)
  const trend = navMinuly > 0 ? Math.round(((navTento - navMinuly) / navMinuly) * 100) : null

  const graf = poslednich(dny)
  const max = Math.max(1, ...graf.map(d => d.navstevy)) // načtení bývají výš → podle nich škálujeme

  // rozpad zdrojů za vybraný rozsah
  const dnyGraf = new Set(graf.map(d => d.den))
  const zdrojSum = (z: string) => zdroje.filter(x => dnyGraf.has(x.den) && x.zdroj === z).reduce((a, x) => a + x.pocet, 0)
  const zInsta = zdrojSum('instagram'), zGoogle = zdrojSum('google'), zPrimo = zdrojSum('primo')
  const zMa = zInsta + zGoogle + zPrimo > 0
  const Chip = ({ ikona, label, val, barva }: { ikona: string; label: string; val: number; barva: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f7f3ec', borderRadius: 20, padding: '5px 12px', fontSize: 13 }}>
      <span>{ikona}</span><span style={{ color: '#8a7f70' }}>{label}</span><span style={{ fontWeight: 600, color: barva }}>{val}</span>
    </div>
  )

  const Metric = ({ label, val, sub }: { label: string; val: string | number; sub?: React.ReactNode }) => (
    <div style={{ background: '#f7f3ec', borderRadius: 10, padding: '10px 14px', flex: '1 1 120px', minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 12, color: '#8a7f70' }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 600, color: '#1a1208' }}>{val}</p>
      {sub && <p style={{ margin: '2px 0 0', fontSize: 12 }}>{sub}</p>}
    </div>
  )

  return (
    <div className="adm-card">
      <p className="adm-card-h">Návštěvnost <span className="adm-badge" style={{ color: '#8a7f70' }}>jen pro tebe</span></p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <Metric label="Dnes návštěvníků" val={dnesRec?.navstevnici ?? 0} sub={<span className="adm-muted">{dnesRec?.navstevy ?? 0} načtení</span>} />
        <Metric label="Tento týden" val={navTento} sub={
          trend === null ? <span className="adm-muted">—</span>
            : <span style={{ color: trend >= 0 ? '#3b7d3b' : '#c0392b' }}>{trend >= 0 ? '▲' : '▼'} {Math.abs(trend)} % vs min. týden</span>
        } />
        <Metric label="Celkem návštěvníků" val={suma(data, d => d.navstevnici)} sub={<span className="adm-muted">{suma(data, d => d.navstevy)} načtení</span>} />
      </div>

      {/* Graf — návštěvníci i načtení za den; přepínač rozsahu + legenda */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <span className="adm-muted">Graf za:</span>
        {[7, 14, 30].map(n => (
          <button key={n} className={'adm-seg' + (dny === n ? ' on' : '')} style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => setDny(n)}>{n} dní</button>
        ))}
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#8a7f70' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#b8894a', marginRight: 4, verticalAlign: -1 }} />návštěvníci</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#e6cfa0', marginRight: 4, verticalAlign: -1 }} />načtení</span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: dny > 14 ? 3 : 6, height: 140, padding: '0 2px' }}>
        {graf.map(d => {
          const hN = Math.max(3, Math.round((d.navstevnici / max) * 108))
          const hL = Math.max(3, Math.round((d.navstevy / max) * 108))
          const dt = new Date(d.den + 'T12:00:00')
          return (
            <div key={d.den} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 0 }}
              title={`${d.den}: ${d.navstevnici} návštěvníků · ${d.navstevy} načtení`}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 112, width: '100%', justifyContent: 'center' }}>
                <div style={{ width: '42%', maxWidth: 14, height: hN, background: '#b8894a', borderRadius: '4px 4px 0 0' }} />
                <div style={{ width: '42%', maxWidth: 14, height: hL, background: '#e6cfa0', borderRadius: '4px 4px 0 0' }} />
              </div>
              {dny <= 14 && <span style={{ fontSize: 10, color: '#b0a595', whiteSpace: 'nowrap' }}>{DNY_ZKR[dt.getDay()]} {dt.getDate()}.</span>}
            </div>
          )
        })}
      </div>

      {/* Odkud přišli — rozpad zdrojů za vybraný rozsah */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '0.5px solid #eee5d8' }}>
        <p className="adm-muted" style={{ marginBottom: 6 }}>Odkud přišli (za {dny} dní):</p>
        {zMa ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Chip ikona="📷" label="Instagram" val={zInsta} barva="#c13584" />
            <Chip ikona="🔍" label="Google" val={zGoogle} barva="#3f7a34" />
            <Chip ikona="↗" label="Přímo" val={zPrimo} barva="#1a1208" />
          </div>
        ) : <p className="adm-muted">Zatím nerozlišeno — začne se plnit, jakmile použiješ označené odkazy.</p>}
        <p className="adm-muted" style={{ marginTop: 8, fontSize: 11 }}>Do profilů dej odkazy: <b>bra-vo.com/?zdroj=instagram</b> (do IG bia) a <b>bra-vo.com/?zdroj=google</b> (do Google profilu).</p>
      </div>
    </div>
  )
}
