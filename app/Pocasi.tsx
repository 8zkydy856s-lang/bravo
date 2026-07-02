'use client'
import { useEffect, useState } from 'react'

// Reálné dnešní počasí pro polohu vozíku (Luxembourg) z Open-Meteo (zdarma, bez klíče).
// Při jakémkoli výpadku se prostě nezobrazí (return null) - nic nerozbije.

const LAT = 49.6102
const LON = 6.1242

function ikona(code: number): string {
  if (code === 0) return '☀️'              // jasno
  if (code === 1 || code === 2) return '⛅' // skoro jasno / polojasno
  if (code === 3) return '☁️'              // zataženo
  if (code >= 45 && code <= 48) return '🌫️' // mlha
  if (code >= 51 && code <= 67) return '🌧️' // mrholení / déšť
  if (code >= 71 && code <= 77) return '❄️' // sníh
  if (code >= 80 && code <= 82) return '🌧️' // přeháňky
  if (code >= 85 && code <= 86) return '❄️' // sněhové přeháňky
  if (code >= 95) return '⛈️'              // bouřka
  return '⛅'
}

export default function Pocasi() {
  const [w, setW] = useState<{ temp: number; code: number } | null>(null)

  useEffect(() => {
    let active = true
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('weather fetch failed'))))
      .then(j => {
        const c = j?.current
        if (active && c && typeof c.temperature_2m === 'number' && typeof c.weather_code === 'number') {
          setW({ temp: Math.round(c.temperature_2m), code: c.weather_code })
        }
      })
      .catch(() => { /* počasí prostě nezobrazíme */ })
    return () => { active = false }
  }, [])

  if (!w) return null
  // ikona a stupně vyrovnané na střed vůči sobě; celek o 3px doleva (větší mezera od okraje okna)
  return (
    <div style={{ textAlign: 'center', marginRight: '3px' }}>
      <p style={{ fontSize: '23px', margin: 0, lineHeight: 1 }}>{ikona(w.code)}</p>
      <p style={{ fontSize: '12px', color: '#8a7f70', margin: '2px 0 0' }}>{w.temp} °C</p>
    </div>
  )
}
