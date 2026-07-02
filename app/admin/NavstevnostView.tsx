'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Přehled návštěvnosti pro majitele (skryté, jen v dashboardu). Denní návštěvníci (unikátní/den)
// + návštěvy (načtení), sloupcový graf posledních dní, souhrny a trend (roste/klesá).

type Den = { den: string; navstevy: number; navstevnici: number }

const DNY_ZKR = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so']

export default function NavstevnostView() {
  const [data, setData] = useState<Den[] | null>(null)

  useEffect(() => {
    supabase.from('navstevnost').select('den, navstevy, navstevnici').order('den', { ascending: false }).limit(30)
      .then(({ data }) => setData(((data as Den[]) || []).slice().reverse()))
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

  const graf = poslednich(14)
  const max = Math.max(1, ...graf.map(d => d.navstevnici))

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

      {/* Sloupcový graf — návštěvníci za posledních 14 dní */}
      <p className="adm-muted" style={{ marginBottom: 6 }}>Návštěvníci za den (posledních {graf.length} dní):</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130, padding: '0 2px' }}>
        {graf.map(d => {
          const h = Math.round((d.navstevnici / max) * 110)
          const dt = new Date(d.den + 'T12:00:00')
          return (
            <div key={d.den} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
              title={`${d.den}: ${d.navstevnici} návštěvníků · ${d.navstevy} načtení`}>
              <span style={{ fontSize: 10, color: '#8a7f70' }}>{d.navstevnici}</span>
              <div style={{ width: '100%', maxWidth: 26, height: Math.max(3, h), background: 'linear-gradient(#d4a96a,#b8894a)', borderRadius: '5px 5px 0 0' }} />
              <span style={{ fontSize: 10, color: '#b0a595' }}>{DNY_ZKR[dt.getDay()]} {dt.getDate()}.</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
