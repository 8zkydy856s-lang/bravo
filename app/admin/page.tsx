'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import KioskStatusView from '../KioskStatusView'
import BravoNapis from '../BravoNapis'
import { isAdminEmail } from '../lib/admin'
import StatusSdeleni from './StatusSdeleni'
import { vypocetStav, type RozvrhDen, type KioskRow } from '../lib/stav'

// Popisky náhledu (admin je vždy v češtině)
const CZ_LABELS = {
  otevreno: 'Otevřeno', dnesZavreno: 'Dnes zavřeno', od: 'od', do: 'do',
  brzyOtevreme: 'Brzy otevřeme', zatimZavreno: 'Zatím zavřeno', brzyZavirame: 'Brzy zavíráme',
  otevira: 'otevírá', vyuzijChvili: 'využij chvíli', zitra: 'Zítra', zitraZavreno: 'zavřeno', dnes: 'dnes',
}

// BRAVO DASHBOARD — řídicí panel majitele (Etapa 1: KOSTRA). Přístup jen pro admina (allowlist e-mailů).
// Principy (dle dohody + reference PayPerPot): levý panel = tematické SBALITELNÉ skupiny, panel jde
// SBALIT na ikony, nahoře HORNÍ PRUH rychlých voleb (čepice + rychlý status + živý náhled).
// Responzivita: TELEFON = dlaždice otevřou stránku (+zpět); VELKÉ OKNO = levý panel + obsah vedle.
// Sekce jsou zatím PLACEHOLDERY („připravujeme"), Status & sdělení dočasně odkazuje na stávající stránky.

const HATS: [string, string][] = [
  ['sklad', 'Skladník'], ['flor', 'Florista'], ['barista', 'Barista'],
  ['ucet', 'Účetní'], ['kod', 'Programátor'], ['pauza', 'Pauza'], ['volno', 'Volno'],
]

type Sec = { label: string; badge?: string; sub?: string }
const SECTIONS: Record<string, Sec> = {
  home: { label: 'Přehled', sub: 'Živý náhled + rychlé volby' },
  status: { label: 'Status & sdělení', badge: 'hotové', sub: 'Živý stav kiosku + vzkazy pro web' },
  listek: { label: 'Lístek & produkty', badge: 'plánované', sub: 'Ceny, 3 typy A/B/C, květiny zvlášť' },
  zak: { label: 'Zákazníci & věrnost', badge: 'plánované', sub: 'Profily, body, odměny, Wallet' },
  doch: { label: 'Docházka / čepice', badge: 'plánované', sub: 'Kolik času podle čepic, reporty' },
  prop: { label: 'Propojení', badge: 'plánované', sub: 'Google · Instagram · e-mail' },
  stat: { label: 'Přehledy & statistiky', badge: 'plánované', sub: 'Návštěvy, oblíbené, trendy' },
  prekl: { label: 'Překlady & obsah', badge: 'základ hotový', sub: 'Texty webu v 5 jazycích' },
  pob: { label: 'Pobočky', badge: 'plánované', sub: 'Víc kiosků, každý svůj stav' },
  tym: { label: 'Můj tým', badge: 'plánované', sub: 'Registrace baristy/manažera + role' },
  nast: { label: 'Nastavení & role', badge: 'plánované', sub: 'Účet, přístupy, pořadí dlaždic' },
}
const GROUPS: { label: string; keys: string[] }[] = [
  { label: 'Provoz', keys: ['status', 'doch'] },
  { label: 'Nabídka', keys: ['listek'] },
  { label: 'Lidé', keys: ['zak', 'tym'] },
  { label: 'Napojení', keys: ['prop'] },
  { label: 'Přehledy', keys: ['stat'] },
  { label: 'Nastavení', keys: ['pob', 'prekl', 'nast'] },
]
const badgeColor: Record<string, string> = {
  'rozpracované': '#b5732a', 'plánované': '#8a7f70', 'základ hotový': '#3b7d3b', 'hotové': '#3b7d3b',
}

export default function AdminDashboard() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [desktop, setDesktop] = useState(true)
  const [section, setSection] = useState('home')
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(GROUPS.map(g => [g.label, true]))
  )
  const [hats, setHats] = useState<Record<string, boolean>>({})
  const [kiosk, setKiosk] = useState<KioskRow | null>(null)
  const [rozvrh, setRozvrh] = useState<RozvrhDen[]>([])

  // auth gate (allowlist e-mailů; dev bypass jen mimo produkci pro náhled)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email
      const dev = process.env.NODE_ENV !== 'production' &&
        new URLSearchParams(window.location.search).get('dev') === '1'
      if (isAdminEmail(email) || dev) setReady(true)
      else router.replace('/login')
    })
  }, [router])

  // responzivita + deep-link na sekci (?sec=status)
  useEffect(() => {
    setMounted(true)
    const sec = new URLSearchParams(window.location.search).get('sec')
    if (sec && SECTIONS[sec]) setSection(sec)
    const f = () => setDesktop(window.innerWidth >= 860)
    f(); window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])

  // živý náhled stavu (co teď vidí zákazník — chytrý status z rozvrhu)
  useEffect(() => {
    Promise.all([
      supabase.from('kiosk_status')
        .select('je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, duvod, dnesni_vyjimka, rezim, brzy_otevre_min, brzy_zavre_min, vyhled_text')
        .eq('pobocka_id', 'hlavni').maybeSingle(),
      supabase.from('rozvrh').select('den, zavreno, otevira, zavira').eq('pobocka_id', 'hlavni'),
    ]).then(([k, r]) => {
      setKiosk((k.data as KioskRow) ?? null)
      setRozvrh((r.data as RozvrhDen[]) ?? [])
    })
  }, [])

  function toggleHat(k: string) {
    setHats(prev => {
      if (k === 'volno') return {}
      if (k === 'pauza') return { pauza: true }
      const n = { ...prev }; delete n.volno; delete n.pauza
      if (n[k]) delete n[k]; else n[k] = true
      return n
    })
  }
  async function odhlasit() { await supabase.auth.signOut(); router.replace('/') }

  if (!ready || !mounted) {
    return <main className="adm-load">Načítám…</main>
  }

  const onHats = HATS.filter(h => hats[h[0]])
  const hatNow = onHats.length ? onHats.map(h => h[1]).join(' + ') : 'volno'

  const HatBar = (
    <div className="adm-hats">
      <span className="adm-hats-lbl">Čepice</span>
      {HATS.map(h => (
        <button key={h[0]} onClick={() => toggleHat(h[0])}
          className={'adm-hatbtn' + (hats[h[0]] ? ' on' : '')}>{h[1]}</button>
      ))}
      <span className="adm-hats-now">— nasazeno: {hatNow}</span>
    </div>
  )

  const Preview = (
    <div className="adm-card">
      <p className="adm-card-h">Živý náhled — co teď vidí zákazník</p>
      <button className="adm-preview-btn" onClick={() => setSection('status')} title="Otevřít Status & sdělení">
        <div className="adm-preview">
          {kiosk
            ? <KioskStatusView stav={vypocetStav(rozvrh, kiosk, new Date())} stavLabels={CZ_LABELS} />
            : <span className="adm-muted">načítám stav…</span>}
        </div>
        <span className="adm-preview-hint">Klikni pro úpravu → Status &amp; sdělení</span>
      </button>
    </div>
  )

  function sectionBody(key: string) {
    const s = SECTIONS[key]
    if (key === 'home') {
      return Preview
    }
    if (key === 'status') {
      return <StatusSdeleni />
    }
    return (
      <div className="adm-card">
        <p className="adm-card-h">{s.label} {s.badge && <span className="adm-badge" style={{ color: badgeColor[s.badge] }}>{s.badge}</span>}</p>
        <p className="adm-muted">{s.sub}</p>
        <div className="adm-placeholder">připravujeme — tady bude obsah této oblasti</div>
      </div>
    )
  }

  const Sidebar = (
    <aside className={'adm-sidebar' + (collapsed ? ' collapsed' : '')}>
      <button className="adm-collapse" onClick={() => setCollapsed(c => !c)} aria-label="Sbalit panel">
        {collapsed ? '»' : '«'}
      </button>
      <button className={'adm-navi adm-home' + (section === 'home' ? ' on' : '')} onClick={() => setSection('home')}>
        <span className="adm-ico">⌂</span><span className="adm-navi-t">Přehled</span>
      </button>
      {GROUPS.map(g => (
        <div key={g.label} className="adm-group">
          <button className="adm-group-h" onClick={() => setOpenGroups(o => ({ ...o, [g.label]: !o[g.label] }))}>
            <span className="adm-group-t">{g.label}</span><span className="adm-chev">{openGroups[g.label] ? '˅' : '˃'}</span>
          </button>
          {openGroups[g.label] && g.keys.map(k => (
            <button key={k} className={'adm-navi' + (section === k ? ' on' : '')} onClick={() => setSection(k)}>
              <span className="adm-ico">•</span><span className="adm-navi-t">{SECTIONS[k].label}</span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  )

  return (
    <main className="adm-shell">
      <header className="adm-topbar">
        <div className="adm-brand"><BravoNapis height={26} /><span className="adm-tag">dashboard</span></div>
        <div className="adm-top-right">
          <span className="adm-who">{hatNow}</span>
          <button className="adm-logout" onClick={odhlasit}>Odhlásit</button>
        </div>
      </header>

      <div className="adm-quick">{HatBar}</div>

      {desktop ? (
        <div className="adm-body">
          {Sidebar}
          <section className="adm-content">
            <h1 className="adm-h1">{SECTIONS[section].label}</h1>
            {sectionBody(section)}
          </section>
        </div>
      ) : (
        <div className="adm-mobile">
          {section === 'home' ? (
            <>
              <section className="adm-content">{sectionBody('home')}</section>
              {GROUPS.map(g => (
                <div key={g.label} className="adm-mgroup">
                  <p className="adm-mgroup-h">{g.label}</p>
                  <div className="adm-tiles">
                    {g.keys.map(k => (
                      <button key={k} className="adm-tile" onClick={() => setSection(k)}>
                        <span className="adm-tile-t">{SECTIONS[k].label}</span>
                        {SECTIONS[k].badge && <span className="adm-badge" style={{ color: badgeColor[SECTIONS[k].badge!] }}>{SECTIONS[k].badge}</span>}
                        <span className="adm-tile-s">{SECTIONS[k].sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <section className="adm-content">
              <button className="adm-back" onClick={() => setSection('home')}>← zpět</button>
              <h1 className="adm-h1">{SECTIONS[section].label}</h1>
              {sectionBody(section)}
            </section>
          )}
        </div>
      )}
    </main>
  )
}
