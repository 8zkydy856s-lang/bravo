// Server-side překlad krátkých hlášek/výjimek do 5 jazyků BRAVO. Zdroj = angličtina.
// Zdarma přes veřejný Google endpoint (žádný klíč), volá se JEN při ukládání v adminu → výsledek se
// uloží do DB, takže na webu se už nepřekládá. Selže-li překlad, spadne elegantně na angličtinu.
// Jazyky BRAVO → Google kódy: cz→cs, lu(lucemburština)→lb.

export const runtime = 'nodejs'

const CILE: Record<string, string> = { cz: 'cs', fr: 'fr', de: 'de', lu: 'lb' }

async function prelozit1(text: string, tl: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 8000)
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: ctrl.signal })
    if (!r.ok) throw new Error('http ' + r.status)
    const data = await r.json()
    // data[0] = pole segmentů; každý segment[0] je přeložený kus
    return (data[0] as any[]).map(seg => seg[0]).join('')
  } finally {
    clearTimeout(t)
  }
}

export async function POST(request: Request) {
  let text = ''
  try {
    const body = await request.json()
    text = (body?.text || '').toString().trim()
  } catch { /* ignore */ }

  if (!text) return Response.json({ en: '', cz: '', fr: '', de: '', lu: '' })

  const out: Record<string, string> = { en: text }
  await Promise.all(Object.entries(CILE).map(async ([app, g]) => {
    try { out[app] = await prelozit1(text, g) }
    catch { out[app] = text } // fallback = angličtina
  }))
  return Response.json(out)
}
