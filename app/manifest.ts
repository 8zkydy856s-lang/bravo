import type { MetadataRoute } from 'next'

// Web app manifest — dělá bra-vo.com „instalovatelným" (ikona na ploše telefonu → 1 klepnutí = živý stav).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BRAVO · místo k zastavení',
    short_name: 'BRAVO',
    description: 'Otevřeno / zavřeno hned na jedno klepnutí — káva, čaj, květiny.',
    start_url: '/',
    display: 'standalone',
    background_color: '#e8dfca',
    theme_color: '#e8dfca',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
