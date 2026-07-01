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
    scope.querySelectorAll<HTMLElement>('.vz-p').forEach((el) => {
      const band = el.dataset.band
      el.style.left = (band === 'L' ? rnd(6, 33) : rnd(67, 94)).toFixed(1) + '%'
      el.style.animationDelay = '-' + rnd(0, 42).toFixed(1) + 's'
      el.style.animationDuration = rnd(32, 48).toFixed(1) + 's'
    })

    // noty 1 a 2 — vycházejí ze středu vozíku, každá jiný směr; trajektorie se každou návštěvu trochu liší
    const n1 = scope.querySelector<HTMLElement>('.vz-note1')
    if (n1) {
      n1.style.left = rnd(48, 56).toFixed(1) + '%'
      n1.style.setProperty('--nx', Math.round(rnd(-8, 20)) + 'px')
      n1.style.animationDelay = '-' + rnd(0, 14).toFixed(1) + 's'
    }
    const n2 = scope.querySelector<HTMLElement>('.vz-note2')
    if (n2) {
      n2.style.left = rnd(42, 50).toFixed(1) + '%'
      n2.style.setProperty('--nx', Math.round(rnd(-20, 8)) + 'px')
      n2.style.animationDelay = '-' + rnd(0, 16).toFixed(1) + 's'
    }

    // nota 3 — nejsvětlejší, náhodně kdekoli přes obrázek, náhodný směr, u toho pulzuje
    const n3 = scope.querySelector<HTMLElement>('.vz-note3')
    if (n3) {
      n3.style.left = rnd(14, 78).toFixed(1) + '%'
      n3.style.top = rnd(22, 70).toFixed(1) + '%'
      n3.style.setProperty('--nx', Math.round(rnd(-30, 30)) + 'px')
      n3.style.setProperty('--ny', Math.round(rnd(-42, -16)) + 'px')
      n3.style.animationDelay = '-' + rnd(0, 12).toFixed(1) + 's'
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
      </div>
    </>
  )
}
