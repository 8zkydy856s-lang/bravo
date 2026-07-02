// CHYTRÝ STATUS — sdílený výpočet fáze kiosku z rozvrhu + režimu. Počítá se v čase Europe/Luxembourg.
// Používá úvodní stránka (KioskStatus) i admin náhled. Fáze → barva květu (zelená/jantar/červená).

// 'po_zavirace' = dnes BYLO otevřeno, ale už je po zavírací době → „Dnes už zavřeno"
// (odlišné od 'zavreno' = celý den zavřeno).
export type Faze = 'otevreno' | 'brzy_zavre' | 'brzy_otevre' | 'pred_otevrenim' | 'po_zavirace' | 'zavreno'
export type Barva = 'zelena' | 'jantar' | 'cervena'

export type RozvrhDen = { den: number; zavreno: boolean; otevira: string | null; zavira: string | null }
export type KioskRow = {
  je_otevreno: boolean; oteviraci_cas: string | null; zaviraci_cas: string | null
  poznamka: string | null; duvod: string | null; dnesni_vyjimka: boolean
  rezim?: string; brzy_otevre_min?: number; brzy_zavre_min?: number
  vyhled_text?: string | null; vyhled_rezim?: string // 'plan' | 'otevreno' | 'zavreno'
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
// Dnešní den v Lucembursku (0=Po … 6=Ne) — pro předvyplnění ručního režimu z plánu.
export function luxDen(now: Date): number { return luxParts(now).den }

function toMin(t?: string | null): number | null {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

// JEDEN motor fáze z efektivních hodin dne (od–do v minutách) + prahů mezifází.
// Používá se v automatickém i ručním režimu → mezifáze „brzy otevře/zavře" fungují v obou.
function fazeZHodin(od: number, doo: number, min: number, brzyO: number, brzyZ: number): { faze: Faze; barva: Barva } {
  if (min < od) return { faze: min >= od - brzyO ? 'brzy_otevre' : 'pred_otevrenim', barva: 'jantar' }
  if (min < doo) return { faze: min >= doo - brzyZ ? 'brzy_zavre' : 'otevreno', barva: 'zelena' }
  return { faze: 'po_zavirace', barva: 'cervena' } // bylo dnes otevřeno, teď už po zavírací době
}

export function vypocetStav(rozvrh: RozvrhDen[], k: KioskRow, now: Date): Stav {
  const { den, min } = luxParts(now)
  const dnes = rozvrh.find(r => r.den === den)
  const zitra = rozvrh.find(r => r.den === (den + 1) % 7)
  // VÝHLED NA ZÍTŘEK: priorita vlastní text > rychlá volba (otevřeno/zavřeno) > podle plánu.
  const vr = k.vyhled_rezim || 'plan'
  let vyhled: Partial<Stav>
  if (k.vyhled_text) vyhled = { vyhledText: k.vyhled_text }
  else if (vr === 'zavreno') vyhled = { vyhledOtevreno: false }
  else if (vr === 'otevreno') vyhled = { vyhledOtevreno: true, vyhledOd: zitra?.otevira || undefined, vyhledDo: zitra?.zavira || undefined }
  else vyhled = (zitra && !zitra.zavreno && zitra.otevira && zitra.zavira)
    ? { vyhledOtevreno: true, vyhledOd: zitra.otevira, vyhledDo: zitra.zavira }
    : { vyhledOtevreno: false }
  const brzyO = k.brzy_otevre_min ?? 25
  const brzyZ = k.brzy_zavre_min ?? 30
  const rucni = (k.rezim || 'auto') === 'rucni'
  const pozn = (k.poznamka || (rucni ? k.duvod : '') || '') || undefined

  // EFEKTIVNÍ hodiny dne + je-li dnes vůbec otevřeno:
  //  - RUČNÍ: majitel dá souhlas „dnes otevřeno" + čas (předvyplněný z plánu, editovatelný jako výjimka);
  //           když časy nevyplní, spadneme zpět na plán, ať mezifáze počítají z něčeho.
  //  - AUTO:  hodiny čistě z rozvrhu.
  let otevrenoDnes: boolean
  let otStr: string | null, zaStr: string | null
  if (rucni) {
    otevrenoDnes = !!k.je_otevreno
    otStr = k.oteviraci_cas || dnes?.otevira || null
    zaStr = k.zaviraci_cas || dnes?.zavira || null
  } else {
    otevrenoDnes = !!(dnes && !dnes.zavreno)
    otStr = dnes?.otevira || null
    zaStr = dnes?.zavira || null
  }

  if (!otevrenoDnes) return { faze: 'zavreno', barva: 'cervena', poznamka: pozn, ...vyhled }

  const od = toMin(otStr), doo = toMin(zaStr)
  if (od == null || doo == null) {
    // otevřeno bez známých hodin (ruční bez času) — prostě otevřeno, bez mezifází
    return { faze: 'otevreno', barva: 'zelena', poznamka: pozn, ...vyhled }
  }
  const f = fazeZHodin(od, doo, min, brzyO, brzyZ)
  return { faze: f.faze, barva: f.barva, otevira: otStr || undefined, zavira: zaStr || undefined, poznamka: pozn, ...vyhled }
}

// barva → hex + rgba záře (pro stavový květ)
export const BARVY: Record<Barva, { kv: string; glow: string }> = {
  zelena: { kv: '#4caf50', glow: 'rgba(76,175,80,.5)' },
  jantar: { kv: '#d99a2b', glow: 'rgba(217,154,43,.5)' },
  cervena: { kv: '#c0392b', glow: 'rgba(192,57,43,.5)' },
}
