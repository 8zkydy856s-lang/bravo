'use client'
import { useEffect, useState } from 'react'
import { useLang } from './LangContext'

// Jemná pozvánka „ulož si BRAVO na plochu telefonu" — objeví se až po chvíli (nebo při odchodu),
// jednou, dá se odmítnout a pamatuje si to (nevtíravé). Na Androidu/Chromu spustí skutečnou instalaci,
// na iPhonu ukáže návod (Sdílet → Na plochu), na počítači nabídne instalaci / uložení do oblíbených.
// Cíl: 1 klepnutí = hned vidí, jestli je otevřeno (spolehnout se na web, ne na Instagram).

const TXT: Record<string, { nadpis: string; text: string; pridat: string; tedNe: string; ios: string; rozumim: string; zalozka: string }> = {
  cz: { nadpis: 'Ať příště nejsi zklamán', text: 'Otevírací doba je spontánní, hodně podle počasí. Ulož si BRAVO na plochu — jedním klepnutím hned uvidíš, jestli tu jsem.', pridat: 'Přidat na plochu', tedNe: 'Teď ne', ios: 'Klepni na Sdílet a pak „Přidat na plochu".', rozumim: 'Rozumím', zalozka: 'Ulož do oblíbených: stiskni ⌘/Ctrl + D.' },
  en: { nadpis: 'So you’re not disappointed next time', text: 'Hours are spontaneous, much depends on the weather. Add BRAVO to your home screen — one tap and you’ll see if I’m here.', pridat: 'Add to home screen', tedNe: 'Not now', ios: 'Tap Share, then “Add to Home Screen”.', rozumim: 'Got it', zalozka: 'Bookmark it: press ⌘/Ctrl + D.' },
  fr: { nadpis: 'Pour ne pas être déçu la prochaine fois', text: 'Les horaires sont spontanés, souvent selon la météo. Ajoute BRAVO à ton écran d’accueil — un geste et tu vois si je suis là.', pridat: 'Ajouter à l’écran', tedNe: 'Plus tard', ios: 'Touche Partager, puis « Sur l’écran d’accueil ».', rozumim: 'Compris', zalozka: 'Mets en favori : ⌘/Ctrl + D.' },
  de: { nadpis: 'Damit du nächstes Mal nicht enttäuscht bist', text: 'Die Zeiten sind spontan, oft je nach Wetter. Füge BRAVO zum Startbildschirm hinzu — ein Tipp und du siehst, ob ich da bin.', pridat: 'Zum Startbildschirm', tedNe: 'Später', ios: 'Tippe auf Teilen, dann „Zum Home-Bildschirm“.', rozumim: 'Verstanden', zalozka: 'Als Lesezeichen: ⌘/Strg + D.' },
  lu: { nadpis: 'Fir datts du nächst Kéier net enttäuscht bass', text: 'D’Zäite si spontan, vill no Wieder. Setz BRAVO op däin Startbildschirm — ee Klick a s’gesäis, ob ech do sinn.', pridat: 'Op de Startbildschirm', tedNe: 'Méi spéit', ios: 'Klick op Deelen, dann „Op den Home-Bildschirm“.', rozumim: 'Verstanen', zalozka: 'Als Lieszeeche: ⌘/Ctrl + D.' },
}

const KLIC = 'bravo-pozvanka-ulozit'

export default function PozvankaUlozit() {
  const { lang } = useLang()
  const t = TXT[lang] || TXT.cz
  const [show, setShow] = useState(false)
  const [prompt, setPrompt] = useState<any>(null)
  const [ios, setIos] = useState(false)
  const [desktop, setDesktop] = useState(false)

  useEffect(() => {
    try {
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => { })

      const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
      const ulozeno = localStorage.getItem(KLIC)
      // znovu nabídnout nejdřív za 21 dní; když už přidal / je v appce → nikdy
      if (standalone || ulozeno === 'pridano') return
      if (ulozeno && Date.now() - Number(ulozeno) < 21 * 864e5) return

      const ua = navigator.userAgent
      const jeIos = /iphone|ipad|ipod/i.test(ua)
      const jeDesktop = !/android|iphone|ipad|ipod|mobile/i.test(ua)
      setIos(jeIos); setDesktop(jeDesktop)

      const onBIP = (e: Event) => { e.preventDefault(); setPrompt(e) }
      window.addEventListener('beforeinstallprompt', onBIP)
      window.addEventListener('appinstalled', () => { try { localStorage.setItem(KLIC, 'pridano') } catch { }; setShow(false) })

      let zobrazeno = false
      const zobraz = () => { if (!zobrazeno) { zobrazeno = true; setShow(true) } }
      if (new URLSearchParams(location.search).get('pozvanka') === '1') zobraz() // náhled/test
      const casovac = setTimeout(zobraz, 80000) // po ~80 s
      const onLeave = (e: MouseEvent) => { if (jeDesktop && e.clientY <= 0) zobraz() } // odchod myší nahoru (desktop)
      document.addEventListener('mouseout', onLeave)

      return () => { clearTimeout(casovac); window.removeEventListener('beforeinstallprompt', onBIP); document.removeEventListener('mouseout', onLeave) }
    } catch { /* nikdy nerozbít stránku */ }
  }, [])

  if (!show) return null

  const odmitnout = () => { try { localStorage.setItem(KLIC, String(Date.now())) } catch { }; setShow(false) }
  const pridat = async () => {
    if (prompt) {
      try { prompt.prompt(); const r = await prompt.userChoice; if (r?.outcome === 'accepted') { try { localStorage.setItem(KLIC, 'pridano') } catch { } } } catch { }
      setShow(false)
    } else { odmitnout() } // iOS/desktop bez promptu — jen zavřít (návod je vidět v kartě)
  }

  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 300, display: 'flex', justifyContent: 'center', padding: '0 12px 14px', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto', maxWidth: 430, width: '100%', background: '#fffdf8', border: '0.5px solid rgba(120,90,40,0.28)', borderRadius: 18, boxShadow: '0 6px 26px rgba(58,42,18,0.20)', padding: '14px 16px', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <img src="/icon-192.png" alt="" width={44} height={44} style={{ borderRadius: 11, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#3d3123', flex: 1 }}>{t.nadpis}</p>
            <button onClick={odmitnout} aria-label="Zavřít" style={{ background: 'none', border: 'none', color: '#b0a595', fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 0 }}>×</button>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#6f6253', lineHeight: 1.5 }}>{t.text}</p>
          {ios && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: '#3d3123' }}>📲 {t.ios}</p>}
          {desktop && !prompt && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: '#3d3123' }}>🔖 {t.zalozka}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {(prompt || (!ios && !desktop)) ? (
              <button onClick={pridat} style={{ flex: 1, background: '#1a1208', color: '#f6f1e6', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{prompt ? t.pridat : t.rozumim}</button>
            ) : (
              <button onClick={odmitnout} style={{ flex: 1, background: '#1a1208', color: '#f6f1e6', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t.rozumim}</button>
            )}
            <button onClick={odmitnout} style={{ background: 'none', border: '0.5px solid #e0d9d0', color: '#8a7f70', borderRadius: 10, padding: '9px 14px', fontSize: 13, cursor: 'pointer' }}>{t.tedNe}</button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
