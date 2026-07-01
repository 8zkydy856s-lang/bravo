'use client'
import { useLang } from './LangContext'

// Podtitul pod BraVo = struna KOMPLETNÍ (obě části vedle sebe): „chvíle spočinutí".
// Obě slova jsou STABILNÍ text (nemizí) — jen jimi projede světlo orchestrace.
// Značky: .struna-chvile (projede zář zleva doprava) · .struna-spocin (usadí se zář).
// „…" počítáme ke struně (necháváme před chvíle).
const PODTITUL: Record<string, string> = {
  cz: `… <span class="struna-chvile">chvíle</span> <span class="struna-spocin">spočinutí</span>`,
  en: `… a <span class="struna-chvile">moment</span> to <span class="struna-spocin">rest</span>`,
  fr: `… un <span class="struna-chvile">instant</span> pour <span class="struna-spocin">souffler</span>`,
  de: `… eine <span class="struna-chvile">Weile</span> zum <span class="struna-spocin">Verweilen</span>`,
  lu: `… eng <span class="struna-chvile">Weil</span> fir ze <span class="struna-spocin">verweilen</span>`,
}

export default function PodtitulStruna() {
  const { lang } = useLang()
  return (
    <p className="podtitul-struna"
       style={{ fontSize: '12px', color: '#6f6253', letterSpacing: '0.14em', paddingLeft: '0.14em', marginTop: '-2px' }}
       dangerouslySetInnerHTML={{ __html: PODTITUL[lang] || PODTITUL.cz }} />
  )
}
