// Minimální service worker — jen aby byl web „instalovatelný" (ikona na plochu).
// Nedělá offline cache; fetch handler jen prochází na síť (splní kritérium prohlížeče).
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => { /* passthrough */ })
