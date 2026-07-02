// CHYTRÝ STATUS — sdílený výpočet fáze kiosku z rozvrhu + režimu. Počítá se v čase Europe/Luxembourg.
// Používá úvodní stránka (KioskStatus) i admin náhled. Fáze → barva květu (zelená/jantar/červená).

export type Faze = 'otevreno' | 'brzy_zavre' | 'brzy_otevre' | 'pred_otevrenim' | 'zavreno'
export type Barva = 'zelena' | 'jantar' | 'cervena'

export type RozvrhDen = { den: number; zavreno: boolean; otevira: string | null; zavira: string | null }
export type KioskRow = {
  je_otevreno: boolean; oteviraci_cas: string | null; zaviraci_cas: string | null
  poznamka: string | null; duvod: string | null; dnesni_vyjimka: boolean
  rezim?: string; brzy_otevre_min?: number; brzy_zavre_min?: number; vyhled_text?: string | null
}
export type Stav = {
  faze: Faze
  barva: Barva
  otevira?: string
  zavira?: string
  poznamka?: string
  vyhledOtevreno?: boolean
  vyhledOd?: string
  vyhledDo?: string
  vyhledText?: string
}

function luxParts(now: Date): { den: number; min: number } {
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Luxembourg', weekday: 'short' }).format(now)
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }
  const hm = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Luxembourg', hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
  const [h, m] = hm.split(':').map(Number)
  return { den: map[wd] ?? 0, min: h * 60 + m }
}
function toMin(t?: string | null): number | null {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

export function vypocetStav(rozvrh: RozvrhDen[], k: KioskRow, now: Date): Stav {
  const { den, min } = luxParts(now)
  const dnes = rozvrh.find(r => r.den === den)
  const zitra = rozvrh.find(r => r.den === (den + 1) % 7)
  const vyhled = k.vyhled_text
    ? { vyhledText: k.vyhled_text }
    : (zitra && !zitra.zavreno && zitra.otevira && zitra.zavira
      ? { vyhledOtevreno: true, vyhledOd: zitra.otevira, vyhledDo: zitra.zavira }
      : { vyhledOtevreno: false })

  // RUČNÍ režim — majitel řídí přímo (automat vypnutý)
  if ((k.rezim || 'auto') === 'rucni') {
    const pozn = (k.poznamka || k.duvod || '') || undefined
    if (k.je_otevreno) return { faze: 'otevreno', barva: 'zelena', otevira: k.oteviraci_cas || undefined, zavira: k.zaviraci_cas || undefined, poznamka: pozn, ...vyhled }
    return { faze: 'zavreno', barva: 'cervena', poznamka: pozn, ...vyhled }
  }

  // AUTOMATICKÝ režim — podle rozvrhu
  const pozn = (k.poznamka || '') || undefined
  const od = toMin(dnes?.otevira), doo = toMin(dnes?.zavira)
  if (!dnes || dnes.zavreno || od == null || doo == null) {
    return { faze: 'zavreno', barva: 'cervena', poznamka: pozn, ...vyhled }
  }
  if (min < od) {
    const faze: Faze = min >= od - (k.brzy_otevre_min ?? 25) ? 'brzy_otevre' : 'pred_otevrenim'
    return { faze, barva: 'jantar', otevira: dnes.otevira!, zavira: dnes.zavira!, poznamka: pozn, ...vyhled }
  }
  if (min < doo) {
    const faze: Faze = min >= doo - (k.brzy_zavre_min ?? 30) ? 'brzy_zavre' : 'otevreno'
    return { faze, barva: 'zelena', otevira: dnes.otevira!, zavira: dnes.zavira!, poznamka: pozn, ...vyhled }
  }
  return { faze: 'zavreno', barva: 'cervena', poznamka: pozn, ...vyhled }
}

// barva → hex + rgba záře (pro stavový květ)
export const BARVY: Record<Barva, { kv: string; glow: string }> = {
  zelena: { kv: '#4caf50', glow: 'rgba(76,175,80,.5)' },
  jantar: { kv: '#d99a2b', glow: 'rgba(217,154,43,.5)' },
  cervena: { kv: '#c0392b', glow: 'rgba(192,57,43,.5)' },
}
