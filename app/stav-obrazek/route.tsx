import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { vypocetStav, type RozvrhDen, type KioskRow } from '../lib/stav'

// Sdílecí obrázek stavu (sticker pro IG story), VĚRNĚ podle statusu na úvodní stránce:
// květ, krémové pozadí, elegantní písmo (Cormorant), adresa webu. Anglicky. Vždy ČERSTVÝ
// (dynamic + cache-control no-store — dřív se cachoval a neaktualizoval).

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function nactiFont(url: string): Promise<ArrayBuffer | null> {
  try { const r = await fetch(url); return r.ok ? await r.arrayBuffer() : null } catch { return null }
}

export async function GET() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const [ks, rz, cReg, cSemi] = await Promise.all([
    sb.from('kiosk_status').select('je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, duvod, dnesni_vyjimka, rezim, brzy_otevre_min, brzy_zavre_min, vyhled_text, vyhled_rezim').eq('pobocka_id', 'hlavni').maybeSingle(),
    sb.from('rozvrh').select('den, zavreno, otevira, zavira').eq('pobocka_id', 'hlavni'),
    nactiFont('https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Regular.ttf'),
    nactiFont('https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-SemiBold.ttf'),
  ])
  const k = (ks.data as KioskRow) || { je_otevreno: false, oteviraci_cas: null, zaviraci_cas: null, poznamka: null, duvod: null, dnesni_vyjimka: false }
  const stav = vypocetStav((rz.data as RozvrhDen[]) || [], k, new Date())

  const denOtevreny = !!(stav.otevira && stav.zavira)
  const kv = denOtevreny ? '#4caf50' : '#c0392b'
  const kvStred = denOtevreny ? '#2e7d32' : '#8e2a20'
  const title = denOtevreny ? 'Open today' : 'Closed today'
  const hours = denOtevreny ? `${stav.otevira}–${stav.zavira}` : ''
  const tomorrow = `tomorrow: likely ${stav.vyhledOtevreno ? 'open' : 'closed'}`
  const ink = '#3d3123', muted = '#8a7f70'
  const petals = [0, 72, 144, 216, 288]

  const fonts: any[] = []
  if (cReg) fonts.push({ name: 'Cormorant', data: cReg, weight: 400, style: 'normal' })
  if (cSemi) fonts.push({ name: 'Cormorant', data: cSemi, weight: 600, style: 'normal' })

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: 16, fontFamily: 'Cormorant' }}>
        <div style={{ display: 'flex', flexDirection: 'column', background: 'transparent', border: '3px solid rgba(122,96,54,0.6)', borderRadius: 40, padding: '30px 44px' }}>
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 600, color: ink, letterSpacing: 1, marginBottom: 18 }}>BraVo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <svg width="52" height="52" viewBox="0 0 100 100">
              {petals.map(a => <ellipse key={a} cx="50" cy="27" rx="15" ry="24" fill={kv} transform={`rotate(${a} 50 50)`} />)}
              <circle cx="50" cy="50" r="12" fill={kvStred} />
            </svg>
            <div style={{ display: 'flex', fontSize: 50, fontWeight: 600, color: ink }}>{title}</div>
            {hours ? <div style={{ display: 'flex', fontSize: 40, color: muted, marginLeft: 6 }}>{hours}</div> : <div style={{ display: 'flex' }} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <div style={{ display: 'flex', fontSize: 28, color: muted, letterSpacing: 1 }}>{tomorrow}</div>
            <div style={{ display: 'flex', fontSize: 24, color: muted, letterSpacing: 3, marginLeft: 40 }}>bra-vo.com</div>
          </div>
        </div>
      </div>
    ),
    { width: 720, height: 300, fonts: fonts.length ? fonts : undefined, headers: { 'cache-control': 'no-store, max-age=0, must-revalidate' } }
  )
}
