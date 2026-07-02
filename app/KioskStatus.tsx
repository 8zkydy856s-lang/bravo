'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import KioskStatusView from './KioskStatusView'
import { useLang } from './LangContext'
import { DICT } from './i18n'
import { vypocetStav, type RozvrhDen, type KioskRow } from './lib/stav'

// Stav kiosku pro zákazníky (chytrý status): fáze se počítá z rozvrhu + režimu (auto/ruční),
// v čase Europe/Luxembourg. Mezifáze „brzy otevře/zavře", výhled na zítřek. Přepočítává se každých 30 s.
type Status = KioskRow & { viditelnost: string }

export default function KioskStatus() {
  const { lang } = useLang()
  const [status, setStatus] = useState<Status | null>(null)
  const [rozvrh, setRozvrh] = useState<RozvrhDen[]>([])
  const [loaded, setLoaded] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([
      supabase.from('kiosk_status')
        .select('je_otevreno, oteviraci_cas, zaviraci_cas, poznamka, duvod, dnesni_vyjimka, viditelnost, rezim, brzy_otevre_min, brzy_zavre_min, vyhled_text')
        .eq('pobocka_id', 'hlavni').maybeSingle(),
      supabase.from('rozvrh').select('den, zavreno, otevira, zavira').eq('pobocka_id', 'hlavni'),
    ]).then(([s, r]) => {
      if (!active) return
      setStatus((s.data as Status | null) ?? null)
      setRozvrh((r.data as RozvrhDen[] | null) ?? [])
      setLoaded(true)
    })
    const t = setInterval(() => setTick(x => x + 1), 30000)
    return () => { active = false; clearInterval(t) }
  }, [])

  if (!loaded || !status) return null
  if (status.viditelnost !== 'viditelne') return null

  const stav = vypocetStav(rozvrh, status, new Date())
  const stavLabels = {
    otevreno: DICT.otevreno[lang], dnesZavreno: DICT.dnesZavreno[lang], od: DICT.od[lang], do: DICT.do[lang],
    brzyOtevreme: DICT.brzyOtevreme[lang], zatimZavreno: DICT.zatimZavreno[lang], brzyZavirame: DICT.brzyZavirame[lang],
    otevira: DICT.otevira[lang], vyuzijChvili: DICT.vyuzijChvili[lang], zitra: DICT.zitra[lang], zitraZavreno: DICT.zitraZavreno[lang], dnes: DICT.dnes[lang],
    praveTed: DICT.praveTed[lang], dnesUzZavreno: DICT.dnesUzZavreno[lang], pravdepodobne: DICT.pravdepodobne[lang], otevrenoMale: DICT.otevrenoMale[lang],
  }

  return <KioskStatusView stav={stav} stavLabels={stavLabels} />
}
