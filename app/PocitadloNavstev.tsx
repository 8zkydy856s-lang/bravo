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
      supabase.rpc('zaznamenat_navstevu', { p_novy: novy })
    } catch { /* tiché — počítadlo nikdy nesmí rozbít stránku */ }
  }, [])
  return null
}
