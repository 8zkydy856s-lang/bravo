'use client'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'

// Skryté počítadlo návštěv (neviditelné na stránce). Při načtení úvodní stránky zavolá bezpečnou
// funkci zaznamenat_navstevu → přičte 1 návštěvu; „nový" = tento prohlížeč dnes poprvé (dle localStorage),
// aby se dal odlišit počet NÁVŠTĚVNÍKŮ (unikátní/den) od počtu NÁVŠTĚV (načtení). Datum řeší DB v čase
// Europe/Luxembourg. Žádná osobní data, žádné sledovací cookies — jen agregát pro dashboard majitele.

export default function PocitadloNavstev() {
  useEffect(() => {
    try {
      const dnes = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Luxembourg' }).format(new Date()) // YYYY-MM-DD
      const posledni = localStorage.getItem('bravo-navsteva-den')
      const novy = posledni !== dnes
      if (novy) localStorage.setItem('bravo-navsteva-den', dnes)

      // ZDROJ návštěvy z označeného odkazu (?zdroj=instagram / ?zdroj=google); drží se po celou session
      const p = (new URLSearchParams(location.search).get('zdroj') || '').toLowerCase()
      let zdroj = ['instagram', 'ig', 'insta'].includes(p) ? 'instagram'
        : ['google', 'gbp', 'maps'].includes(p) ? 'google'
          : (sessionStorage.getItem('bravo-zdroj') || 'primo')
      if (p) { try { sessionStorage.setItem('bravo-zdroj', zdroj) } catch { } }

      // .then() je nutné — supabase.rpc je „líný" a bez něj se dotaz vůbec neodešle
      supabase.rpc('zaznamenat_navstevu', { p_novy: novy, p_zdroj: zdroj }).then(() => { }, () => { })
    } catch { /* tiché — počítadlo nikdy nesmí rozbít stránku */ }
  }, [])
  return null
}
