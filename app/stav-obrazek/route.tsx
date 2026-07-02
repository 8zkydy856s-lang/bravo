import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { vypocetStav, type RozvrhDen, type KioskRow } from '../lib/stav'

// Sdílecí sticker stavu v duchu BRAVO: ručně psané logo BraVo (PNG) + symbol vděčnosti (SVG) +
// stav (kolečko + Open/Closed + čas) + zítřek + web. PRŮHLEDNÉ (jen rám). Vždy čerstvé (no-store).

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Symbol vděčnosti (statická barevná varianta) — vloží se jako data-URI obrázek.
const SYMBOL_SVG = `<svg viewBox="65 102 230 318" xmlns="http://www.w3.org/2000/svg"><g stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(180,248) scale(0.795) translate(-180,-248)"><path fill="#f2ad4e" stroke="#d98b34" d="M174 84 C 140 110, 120 170, 132 214 C 140 240, 158 250, 170 246 C 190 200, 188 132, 174 84 Z"/><path fill="#f2ad4e" stroke="#d98b34" d="M186 84 C 220 110, 240 170, 228 214 C 220 240, 202 250, 190 246 C 170 200, 172 132, 186 84 Z"/></g><g transform="translate(180,248) scale(1.05) translate(-180,-248)"><path fill="none" stroke="#57913a" d="M180 248 C 174 288, 162 320, 150 342"/><path fill="#6faa4a" stroke="#4a7c30" d="M152 328 C 118 340, 90 366, 80 402 C 96 392, 118 384, 140 380 C 152 366, 158 352, 158 346 Z"/><path fill="none" stroke="#4a7c30" stroke-width="3.4" d="M84 398 C 96 408, 116 402, 132 390"/><path fill="none" stroke="#3f6d29" stroke-width="2.8" d="M138 356 L110 380"/><path fill="none" stroke="#3f6d29" stroke-width="2.6" d="M146 352 L122 372"/><path fill="none" stroke="#57913a" d="M180 248 C 186 288, 198 320, 210 342"/><path fill="#6faa4a" stroke="#4a7c30" d="M208 328 C 242 340, 270 366, 280 402 C 264 392, 242 384, 220 380 C 208 366, 202 352, 202 346 Z"/><path fill="none" stroke="#4a7c30" stroke-width="3.4" d="M276 398 C 264 408, 244 402, 228 390"/><path fill="none" stroke="#3f6d29" stroke-width="2.8" d="M222 356 L250 380"/><path fill="none" stroke="#3f6d29" stroke-width="2.6" d="M214 352 L238 372"/></g></g></svg>`
const SYMBOL_URI = 'data:image/svg+xml;utf8,' + encodeURIComponent(SYMBOL_SVG)

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
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
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: 'transparent', border: '3px solid rgba(122,96,54,0.6)', borderRadius: 38, padding: '26px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <img src={`${origin}/bravo-logo.png`} width={132} height={47} alt="BraVo" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', width: 30, height: 30, borderRadius: 30, background: dot }} />
              <div style={{ display: 'flex', fontSize: 46, fontWeight: 600, color: ink }}>{title}</div>
              {hours ? <div style={{ display: 'flex', fontSize: 34, color: muted, marginLeft: 4 }}>{hours}</div> : <div style={{ display: 'flex' }} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <div style={{ display: 'flex', fontSize: 26, color: muted, letterSpacing: 1 }}>{tomorrow}</div>
              <div style={{ display: 'flex', fontSize: 23, color: muted, letterSpacing: 3, marginLeft: 34 }}>bra-vo.com</div>
            </div>
          </div>
          <img src={SYMBOL_URI} width={64} height={88} alt="" />
        </div>
      </div>
    ),
    { width: 720, height: 250, headers: { 'cache-control': 'no-store, max-age=0, must-revalidate' } }
  )
}
