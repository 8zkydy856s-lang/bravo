import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { vypocetStav, type RozvrhDen, type KioskRow } from '../lib/stav'

// Sdílecí STICKER stavu (malé „tlačítko", PRŮHLEDNÉ pozadí) — položíš na fotku do IG story.
// Generuje se z živých dat při každém otevření → vždy čerstvé. Anglicky. Bez klíče/placení.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const [ks, rz] = await Promise.all([
    sb.from('kiosk_status').select('je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, duvod, dnesni_vyjimka, rezim, brzy_otevre_min, brzy_zavre_min, vyhled_text, vyhled_rezim').eq('pobocka_id', 'hlavni').maybeSingle(),
    sb.from('rozvrh').select('den, zavreno, otevira, zavira').eq('pobocka_id', 'hlavni'),
  ])
  const k = (ks.data as KioskRow) || { je_otevreno: false, oteviraci_cas: null, zaviraci_cas: null, poznamka: null, duvod: null, dnesni_vyjimka: false }
  const stav = vypocetStav((rz.data as RozvrhDen[]) || [], k, new Date())

  const denOtevreny = !!(stav.otevira && stav.zavira)
  const dot = denOtevreny ? '#4caf50' : '#c0392b'
  const title = denOtevreny ? 'Open today' : 'Closed today'
  const hours = denOtevreny ? `${stav.otevira}–${stav.zavira}` : ''
  const tomorrow = `tomorrow: likely ${stav.vyhledOtevreno ? 'open' : 'closed'}`
  const ink = '#3d3123', muted = '#8a7f70'

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', background: '#f4efe4', border: '3px solid #e4d9c2', borderRadius: 54, padding: '40px 56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ display: 'flex', width: 40, height: 40, borderRadius: 40, background: dot }} />
            <div style={{ display: 'flex', fontSize: 58, color: ink, fontWeight: 500 }}>{title}</div>
            {hours ? <div style={{ display: 'flex', fontSize: 44, color: muted, marginLeft: 6 }}>{hours}</div> : <div style={{ display: 'flex' }} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <div style={{ display: 'flex', fontSize: 30, color: muted, letterSpacing: 1 }}>{tomorrow}</div>
            <div style={{ display: 'flex', fontSize: 26, color: muted, letterSpacing: 3, marginLeft: 40 }}>bra-vo.com</div>
          </div>
        </div>
      </div>
    ),
    { width: 900, height: 340 }
  )
}
