'use client'
import { useLang } from './LangContext'

// Podtitul pod BraVo = struna KOMPLETNÍ (obě části vedle sebe): „chvíle spočinutí".
// Obě slova jsou STABILNÍ text (nemizí) — jen jimi projede světlo orchestrace.
// Značky: .struna-chvile (projede zář zleva doprava) · .struna-spocin (usadí se zář).
// „…" počítáme ke struně (necháváme před chvíle).
// Rozšíření: baterka (chvíle) projede i „… + náběhové slovo"; rozsvícení (spočinout) i spojku před slovem.
const PODTITUL: Record<string, string> = {
  cz: `<span class="struna-chvile">… chvíle</span> <span class="struna-spocin">spočinutí</span>`,
  en: `<span class="struna-chvile">… a moment</span> <span class="struna-spocin">to rest</span>`,
  fr: `<span class="struna-chvile">… un instant</span> <span class="struna-spocin">pour souffler</span>`,
  de: `<span class="struna-chvile">… eine Weile</span> <span class="struna-spocin">zum Verweilen</span>`,
  lu: `<span class="struna-chvile">… eng Weil</span> <span class="struna-spocin">fir ze verweilen</span>`,
}

export default function PodtitulStruna() {
  const { lang } = useLang()
  return (
    <p className="podtitul-struna"
       style={{ fontSize: '13px', color: '#574b3a', letterSpacing: '0.14em', paddingLeft: '0.14em', marginTop: '-2px' }}
       dangerouslySetInnerHTML={{ __html: PODTITUL[lang] || PODTITUL.cz }} />
  )
}
