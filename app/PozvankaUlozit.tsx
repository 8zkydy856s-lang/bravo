'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

// Jemná pozvánka „ulož si BRAVO na plochu" — na VŠECH veřejných stránkách (ne admin/login).
// Objeví se po ~70 s nebo při odchodu (desktop), POMALU vyjede zespoda, jednou.
// „Teď ne" = připomenout za 15 dní · „Rozumím" = už nikdy · po přidání = nikdy.
// Jazyk čte z localStorage (bravo-lang), aby nepotřebovala provider. Test/reset: ?pozvanka=1.

// PLNÝ symbol vděčnosti s třídami (animuje se přes globals.css, když je v .veta-blok > .fx-symbol.go)
const SYMBOL_SVG = `<svg viewBox="65 102 230 318" xmlns="http://www.w3.org/2000/svg"><g stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(180,248) scale(0.795) translate(-180,-248)"><path class="sym-bud-l" fill="#f2ad4e" stroke="#d98b34" d="M174 84 C 140 110, 120 170, 132 214 C 140 240, 158 250, 170 246 C 190 200, 188 132, 174 84 Z"/><path class="sym-bud-r" fill="#f2ad4e" stroke="#d98b34" d="M186 84 C 220 110, 240 170, 228 214 C 220 240, 202 250, 190 246 C 170 200, 172 132, 186 84 Z"/></g><g transform="translate(180,248) scale(1.05) translate(-180,-248)"><path class="sym-stemL" fill="none" stroke="#57913a" d="M180 248 C 174 288, 162 320, 150 342"/><path class="sym-leafL" fill="#6faa4a" stroke="#4a7c30" d="M152 328 C 118 340, 90 366, 80 402 C 96 392, 118 384, 140 380 C 152 366, 158 352, 158 346 Z"/><path class="sym-foL" fill="none" stroke="#4a7c30" stroke-width="3.4" d="M84 398 C 96 408, 116 402, 132 390"/><path class="sym-veinL" fill="none" stroke="#3f6d29" stroke-width="2.8" d="M138 356 L110 380"/><path class="sym-veinL" fill="none" stroke="#3f6d29" stroke-width="2.6" d="M146 352 L122 372"/><path class="sym-stemR" fill="none" stroke="#57913a" d="M180 248 C 186 288, 198 320, 210 342"/><path class="sym-leafR" fill="#6faa4a" stroke="#4a7c30" d="M208 328 C 242 340, 270 366, 280 402 C 264 392, 242 384, 220 380 C 208 366, 202 352, 202 346 Z"/><path class="sym-foR" fill="none" stroke="#4a7c30" stroke-width="3.4" d="M276 398 C 264 408, 244 402, 228 390"/><path class="sym-veinR" fill="none" stroke="#3f6d29" stroke-width="2.8" d="M222 356 L250 380"/><path class="sym-veinR" fill="none" stroke="#3f6d29" stroke-width="2.6" d="M214 352 L238 372"/></g></g></svg>`

// Krátká slova (spojka/předložka/člen/jedno písmeno) svážeme s dalším slovem (nezůstanou na konci řádku)
const KRATKA = ['a', 'i', 'o', 'u', 'k', 's', 'v', 'z', 'y', 'à', 'and', 'to', 'of', 'the', 'or', 'und', 'zu', 'je', 'der', 'die', 'das', 'für', 'et', 'ou', 'le', 'la', 'de', 'du', 'se', 'si', 'na', 'do', 'op', 'no', 'fir', 'mir']
const svaz = (s: string) => s.replace(new RegExp(' (' + KRATKA.join('|') + ') ', 'gi'), ' $1 ')

const TXT: Record<string, { nadpis: string; t1: string; akce: string; dekuji: string; pridat: string; tedNe: string; rozumim: string; ios: string; zalozka: string }> = {
  cz: { nadpis: 'Ať příště nejsi zklamán a OBA se potkáme', t1: 'Otevírací doba je proměnlivá a ovlivněná počasím.', akce: 'Ulož si BRAVO na plochu — jedním klepnutím tak hned uvidíš, zda tu pro Tebe dnes jsem…', dekuji: 'Děkuji', pridat: 'Přidat na plochu', tedNe: 'Teď ne', rozumim: 'Rozumím', ios: 'Klepni na Sdílet, pak „Přidat na plochu".', zalozka: 'Ulož do oblíbených: ⌘/Ctrl + D.' },
  en: { nadpis: 'So next time you’re not let down — and we BOTH meet', t1: 'Opening hours are changeable, shaped by the weather.', akce: 'Add BRAVO to your home screen — one tap and you’ll instantly see if I’m here for You today…', dekuji: 'thank you', pridat: 'Add to home screen', tedNe: 'Not now', rozumim: 'Got it', ios: 'Tap Share, then “Add to Home Screen”.', zalozka: 'Bookmark it: ⌘/Ctrl + D.' },
  fr: { nadpis: 'Pour ne pas être déçu, et qu’on se retrouve TOUS LES DEUX', t1: 'Les horaires sont changeants, au gré de la météo.', akce: 'Ajoute BRAVO à ton écran d’accueil — un geste et tu vois tout de suite si je suis là pour Toi aujourd’hui…', dekuji: 'merci', pridat: 'Sur l’écran d’accueil', tedNe: 'Plus tard', rozumim: 'Compris', ios: 'Touche Partager, puis « Sur l’écran d’accueil ».', zalozka: 'En favori : ⌘/Ctrl + D.' },
  de: { nadpis: 'Damit du nicht enttäuscht wirst und wir uns BEIDE treffen', t1: 'Die Öffnungszeiten sind wechselhaft, je nach Wetter.', akce: 'Füge BRAVO zum Startbildschirm hinzu — ein Tipp und du siehst sofort, ob ich heute für Dich da bin…', dekuji: 'danke', pridat: 'Zum Startbildschirm', tedNe: 'Später', rozumim: 'Verstanden', ios: 'Tippe auf Teilen, dann „Zum Home-Bildschirm".', zalozka: 'Lesezeichen: ⌘/Strg + D.' },
  lu: { nadpis: 'Fir datts du net enttäuscht bass a mir eis BEID treffen', t1: 'D’Zäite si wiesselhaft, no Wieder.', akce: 'Setz BRAVO op däin Startbildschirm — ee Klick a s’gesäis direkt, ob ech haut fir Dech do sinn…', dekuji: 'merci', pridat: 'Op de Startbildschirm', tedNe: 'Méi spéit', rozumim: 'Verstanen', ios: 'Klick op Deelen, dann „Op den Home-Bildschirm".', zalozka: 'Lieszeeche: ⌘/Ctrl + D.' },
}

// plynulé zalomení bez „vdov" (osamocených slov na konci) — moderní prohlížeče
const wrap: any = { textWrap: 'pretty' }
const KLIC = 'bravo-pozvanka-v2'

export default function PozvankaUlozit() {
  const pathname = usePathname()
  const [t, setT] = useState(TXT.cz)
  const [show, setShow] = useState(false)
  const [prompt, setPrompt] = useState<any>(null)
  const [ios, setIos] = useState(false)
  const [desktop, setDesktop] = useState(false)

  const skryta = pathname?.startsWith('/admin') || pathname?.startsWith('/login')

  useEffect(() => {
    if (skryta) return
    try {
      const lang = (localStorage.getItem('bravo-lang') || 'en') as string
      setT(TXT[lang] || TXT.cz)
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => { })

      const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
      const ulozeno = localStorage.getItem(KLIC)
      const force = new URLSearchParams(location.search).get('pozvanka') === '1'
      if (!force) {
        if (standalone || ulozeno === 'nikdy') return
        if (ulozeno && Date.now() - Number(ulozeno) < 15 * 864e5) return // „Teď ne" → 15 dní klid
      }

      const ua = navigator.userAgent
      setIos(/iphone|ipad|ipod/i.test(ua))
      setDesktop(!/android|iphone|ipad|ipod|mobile/i.test(ua))

      const onBIP = (e: Event) => { e.preventDefault(); setPrompt(e) }
      window.addEventListener('beforeinstallprompt', onBIP)
      window.addEventListener('appinstalled', () => { try { localStorage.setItem(KLIC, 'nikdy') } catch { }; setShow(false) })

      let zobrazeno = false
      const zobraz = () => { if (!zobrazeno) { zobrazeno = true; setShow(true) } }
      if (force) zobraz()
      const casovac = setTimeout(zobraz, 70000) // po ~70 s
      const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) zobraz() } // odchod myší nahoru (desktop)
      document.addEventListener('mouseout', onLeave)
      return () => { clearTimeout(casovac); window.removeEventListener('beforeinstallprompt', onBIP); document.removeEventListener('mouseout', onLeave) }
    } catch { /* nikdy nerozbít stránku */ }
  }, [skryta])

  if (skryta || !show) return null

  const tedNe = () => { try { localStorage.setItem(KLIC, String(Date.now())) } catch { }; setShow(false) } // 15 dní
  const nikdy = () => { try { localStorage.setItem(KLIC, 'nikdy') } catch { }; setShow(false) }
  const pridat = async () => {
    if (prompt) { try { prompt.prompt(); const r = await prompt.userChoice; if (r?.outcome === 'accepted') { try { localStorage.setItem(KLIC, 'nikdy') } catch { } } } catch { }; setShow(false) }
    else nikdy()
  }
  const maPrompt = !!prompt

  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 400, display: 'flex', justifyContent: 'center', padding: '0 12px 16px', pointerEvents: 'none' }}>
      <style>{`
        @keyframes pozv-vyjezd { from { transform: translateY(130%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pozv-zar { 0%,100% { text-shadow: 0 0 4px rgba(232,201,122,0.5); } 50% { text-shadow: 0 0 14px rgba(232,201,122,0.95), 0 0 26px rgba(232,201,122,0.7); } }
      `}</style>
      <div style={{ pointerEvents: 'auto', maxWidth: 440, width: '100%', background: '#fffdf8', border: '0.5px solid rgba(120,90,40,0.28)', borderRadius: 20, boxShadow: '0 8px 30px rgba(58,42,18,0.22)', padding: '16px 18px', fontFamily: 'Inter,sans-serif', animation: 'pozv-vyjezd 1.4s cubic-bezier(.16,.84,.3,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <img src="/icon-192.png" alt="" width={46} height={46} style={{ borderRadius: 11, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#3d3123', flex: 1, lineHeight: 1.4, ...wrap }}>
                {svaz(t.nadpis)}
                <span className="veta-blok" aria-hidden="true" style={{ display: 'inline-block', width: 34, height: 46, verticalAlign: 'middle', marginLeft: 16 }}>
                  <span className="fx-symbol go" style={{ display: 'block', width: '100%', height: '100%', transform: 'none', opacity: 1, marginLeft: 0 }} dangerouslySetInnerHTML={{ __html: SYMBOL_SVG }} />
                </span>
              </p>
              <button onClick={tedNe} aria-label="Zavřít" style={{ background: 'none', border: 'none', color: '#b0a595', fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 0 }}>×</button>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#6f6253', lineHeight: 1.5, ...wrap }}>{svaz(t.t1)}</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#3d3123', lineHeight: 1.5, fontWeight: 500, ...wrap }}>
              {svaz(t.akce)}{' '}
              <span style={{ display: 'inline-block', animation: 'pozv-zar 2.4s ease-in-out infinite' }}>😌</span>
              <span style={{ color: '#8a7f70', marginLeft: 10 }}>{t.dekuji}</span>
            </p>
            {ios && <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#3d3123', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span aria-hidden="true" style={{ display: 'inline-flex', width: 18, height: 18 }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3d3123" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3M8 7l4-4 4 4M6 12v7a1 1 0 001 1h10a1 1 0 001-1v-7"/></svg>
              </span>
              {t.ios}
            </p>}
            {desktop && !maPrompt && <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#3d3123' }}>🔖 {t.zalozka}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 13 }}>
              {maPrompt ? (
                <button onClick={pridat} style={{ flex: 1, background: '#1a1208', color: '#f6f1e6', border: 'none', borderRadius: 11, padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t.pridat}</button>
              ) : (
                <button onClick={nikdy} style={{ flex: 1, background: '#1a1208', color: '#f6f1e6', border: 'none', borderRadius: 11, padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t.rozumim}</button>
              )}
              <button onClick={tedNe} style={{ background: 'none', border: '0.5px solid #e0d9d0', color: '#8a7f70', borderRadius: 11, padding: '10px 14px', fontSize: 13, cursor: 'pointer' }}>{t.tedNe}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
