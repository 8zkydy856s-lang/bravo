import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { vypocetStav, type RozvrhDen, type KioskRow } from '../lib/stav'

// Sdílecí sticker stavu v duchu BRAVO: symbol vděčnosti + „BraVo" (Cormorant) + stav (slovo Open/Closed
// barevné, bez kolečka) + zítřek + web. PRŮHLEDNÉ (jen rám). Vždy čerstvé (no-store). Anglicky.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYMBOL_SVG = `<svg viewBox="65 102 230 318" xmlns="http://www.w3.org/2000/svg"><g stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(180,248) scale(0.795) translate(-180,-248)"><path fill="#f2ad4e" stroke="#d98b34" d="M174 84 C 140 110, 120 170, 132 214 C 140 240, 158 250, 170 246 C 190 200, 188 132, 174 84 Z"/><path fill="#f2ad4e" stroke="#d98b34" d="M186 84 C 220 110, 240 170, 228 214 C 220 240, 202 250, 190 246 C 170 200, 172 132, 186 84 Z"/></g><g transform="translate(180,248) scale(1.05) translate(-180,-248)"><path fill="none" stroke="#57913a" d="M180 248 C 174 288, 162 320, 150 342"/><path fill="#6faa4a" stroke="#4a7c30" d="M152 328 C 118 340, 90 366, 80 402 C 96 392, 118 384, 140 380 C 152 366, 158 352, 158 346 Z"/><path fill="none" stroke="#4a7c30" stroke-width="3.4" d="M84 398 C 96 408, 116 402, 132 390"/><path fill="none" stroke="#3f6d29" stroke-width="2.8" d="M138 356 L110 380"/><path fill="none" stroke="#3f6d29" stroke-width="2.6" d="M146 352 L122 372"/><path fill="none" stroke="#57913a" d="M180 248 C 186 288, 198 320, 210 342"/><path fill="#6faa4a" stroke="#4a7c30" d="M208 328 C 242 340, 270 366, 280 402 C 264 392, 242 384, 220 380 C 208 366, 202 352, 202 346 Z"/><path fill="none" stroke="#4a7c30" stroke-width="3.4" d="M276 398 C 264 408, 244 402, 228 390"/><path fill="none" stroke="#3f6d29" stroke-width="2.8" d="M222 356 L250 380"/><path fill="none" stroke="#3f6d29" stroke-width="2.6" d="M214 352 L238 372"/></g></g></svg>`
const SYMBOL_URI = 'data:image/svg+xml;utf8,' + encodeURIComponent(SYMBOL_SVG)

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
  const barvaStav = denOtevreny ? '#3f7a34' : '#b23a2a'
  const title = denOtevreny ? 'Open today' : 'Closed today'
  const hours = denOtevreny ? ` · ${stav.otevira}–${stav.zavira}` : ''
  const tomorrow = `tomorrow: likely ${stav.vyhledOtevreno ? 'open' : 'closed'}`
  const ink = '#3d3123', muted = '#8a7f70'

  const fonts: any[] = []
  if (cReg) fonts.push({ name: 'Cormorant', data: cReg, weight: 400, style: 'normal' })
  if (cSemi) fonts.push({ name: 'Cormorant', data: cSemi, weight: 600, style: 'normal' })

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: 12, fontFamily: 'Cormorant' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: 'transparent', border: '2.5px solid rgba(122,96,54,0.55)', borderRadius: 34, padding: '24px 40px' }}>
          <img src={SYMBOL_URI} width={58} height={80} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 44, fontWeight: 600, color: ink, letterSpacing: 1, marginBottom: 8 }}>BraVo</div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ display: 'flex', fontSize: 42, fontWeight: 600, color: barvaStav }}>{title}</span>
              {hours ? <span style={{ display: 'flex', fontSize: 32, color: muted }}>{hours}</span> : <span style={{ display: 'flex' }} />}
            </div>
            <div style={{ display: 'flex', fontSize: 26, color: muted, marginTop: 6 }}>{tomorrow}</div>
            <div style={{ display: 'flex', fontSize: 22, color: muted, letterSpacing: 3, marginTop: 8 }}>bra-vo.com</div>
          </div>
        </div>
      </div>
    ),
    { width: 640, height: 250, fonts: fonts.length ? fonts : undefined, headers: { 'cache-control': 'no-store, max-age=0, must-revalidate' } }
  )
}
