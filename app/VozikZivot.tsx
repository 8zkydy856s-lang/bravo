'use client'
import { useEffect, useRef } from 'react'

// Plátky (jeden zelený) a tři noty. Náhoda při KAŽDÉ návštěvě → organické, nikdy stejné.
// Základní JSX je stejné na serveru i klientu (žádný hydration mismatch); náhoda se aplikuje
// až v useEffect na klientu (pozice, tempo, směr, prodleva).
const PETALS = [
  { band: 'L', green: false },
  { band: 'L', green: true },   // jeden plátek jemně zelený (list), poloprůhledný
  { band: 'L', green: false },
  { band: 'R', green: false },
  { band: 'R', green: false },
  { band: 'R', green: false },
]

export default function VozikZivot() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fall = ref.current
    if (!fall) return
    const scope: HTMLElement = (fall.parentElement as HTMLElement) ?? fall
    const rnd = (a: number, b: number) => a + Math.random() * (b - a)

    // plátky — pokaždé z trošku jiného místa, jiným tempem
    const petals = Array.from(scope.querySelectorAll<HTMLElement>('.vz-p'))
    petals.forEach((el) => {
      const band = el.dataset.band
      el.style.left = (band === 'L' ? rnd(6, 33) : rnd(67, 94)).toFixed(1) + '%'
      el.style.animationDelay = '-' + rnd(0, 42).toFixed(1) + 's'
      el.style.animationDuration = rnd(32, 48).toFixed(1) + 's'
    })
    // náhodně JEDEN plátek se v půli pádu pozastaví a chvíli vznáší (ne všechny padají stejně)
    if (petals.length) {
      const h = petals[Math.floor(rnd(0, petals.length))]
      h.style.animationName = 'vzp-hover'
      h.style.animationDuration = rnd(42, 54).toFixed(1) + 's'
    }

    // noty 1 a 2 — vycházejí ze středu vozíku, každá jiný směr; trajektorie se každou návštěvu trochu liší
    const n1 = scope.querySelector<HTMLElement>('.vz-note1')
    if (n1) {
      n1.style.left = rnd(60, 70).toFixed(1) + '%'   // VEDLE hlavy baristy (vpravo), ne v ní
      n1.style.setProperty('--nx', Math.round(rnd(-4, 22)) + 'px')
      n1.style.animationDelay = '-' + rnd(0, 14).toFixed(1) + 's'
    }
    const n2 = scope.querySelector<HTMLElement>('.vz-note2')
    if (n2) {
      n2.style.left = rnd(58, 68).toFixed(1) + '%'   // taky vedle hlavy (vpravo)
      n2.style.setProperty('--nx', Math.round(rnd(-14, 8)) + 'px')
      n2.style.animationDelay = '-' + rnd(0, 16).toFixed(1) + 's'
    }

    // nota 3 — nejsvětlejší, pluje DÉLE; vždy začne v PRŮHLEDNÉ části (strany), ne přes kresbu vozíku
    const n3 = scope.querySelector<HTMLElement>('.vz-note3')
    if (n3) {
      const side = Math.random() < 0.5 ? rnd(6, 26) : rnd(74, 92)
      n3.style.left = side.toFixed(1) + '%'
      n3.style.top = rnd(12, 58).toFixed(1) + '%'
      n3.style.setProperty('--nx', Math.round(rnd(-26, 26)) + 'px')
      n3.style.setProperty('--ny', Math.round(rnd(-40, -14)) + 'px')
      n3.style.animationDelay = '-' + rnd(0, 20).toFixed(1) + 's'
    }

    // SRDCE — malé, červené ale průhledné; vznáší se, zjeví se, roste a rozplyne;
    // POKAŽDÉ se objeví na jiném NÁHODNÉM místě v oblasti obrázku (přemístí se při každém cyklu).
    const srdce = scope.querySelector<HTMLElement>('.vz-srdce')
    if (srdce) {
      const umisti = () => {
        // druhá strana postavičky, NAD květinami (pravá horní část obrázku nad květinovým boxem)
        srdce.style.left = rnd(62, 84).toFixed(1) + '%'
        srdce.style.top = rnd(20, 44).toFixed(1) + '%'
        srdce.style.setProperty('--sx', Math.round(rnd(-10, 10)) + 'px')
        srdce.style.fontSize = rnd(7, 9).toFixed(1) + 'px' // menší než zelený plátek (~12px)
      }
      umisti()
      srdce.style.animationDuration = rnd(11, 16).toFixed(1) + 's'
      srdce.style.animationDelay = '-' + rnd(0, 8).toFixed(1) + 's'
      srdce.addEventListener('animationiteration', umisti) // nové místo při každém objevení
    }
  }, [])

  return (
    <>
      <div className="vozik-fall" aria-hidden="true" ref={ref}>
        {PETALS.map((p, i) => (
          <span key={i} className={'vz-p vz-p' + (i + 1) + (p.green ? ' vz-p-green' : '')} data-band={p.band} />
        ))}
      </div>
      <div className="vozik-zivot" aria-hidden="true">
        <span className="vz-leaf vz-leaf1" />
        <span className="vz-leaf vz-leaf2" />
        <span className="vz-note vz-note1">♪</span>
        <span className="vz-note vz-note2">♫</span>
        <span className="vz-note vz-note3">♬</span>
        <span className="vz-srdce">♥</span>
      </div>
    </>
  )
}
