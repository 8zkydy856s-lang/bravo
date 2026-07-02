import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { vypocetStav, type RozvrhDen, type KioskRow } from '../lib/stav'

// Sdílecí obrázek stavu pro Instagram story (9:16, ANGLICKY). Generuje se při každém otevření
// z živých dat → vždy čerstvý. Bez klíče/placení. Stav se počítá v čase Europe/Luxembourg.

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

  const cream = '#f4efe4', ink = '#3d3123', muted = '#8a7f70'
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: cream, padding: 80 }}>
        <div style={{ display: 'flex', fontSize: 92, color: ink, letterSpacing: 2, marginBottom: 24, fontStyle: 'italic' }}>BraVo</div>
        <div style={{ display: 'flex', fontSize: 26, color: muted, letterSpacing: 6, marginBottom: 90 }}>… a moment to rest</div>
        <div style={{ display: 'flex', width: 64, height: 64, borderRadius: 64, background: dot, marginBottom: 40 }} />
        <div style={{ display: 'flex', fontSize: 76, color: ink, fontWeight: 500, marginBottom: 14 }}>{title}</div>
        {hours ? <div style={{ display: 'flex', fontSize: 52, color: muted, marginBottom: 40 }}>{hours}</div> : <div style={{ display: 'flex', marginBottom: 40 }} />}
        <div style={{ display: 'flex', fontSize: 40, color: muted, letterSpacing: 2 }}>{tomorrow}</div>
        <div style={{ display: 'flex', flex: 1 }} />
        <div style={{ display: 'flex', fontSize: 34, color: muted, letterSpacing: 4 }}>bra-vo.com</div>
      </div>
    ),
    { width: 1080, height: 1920 }
  )
}
