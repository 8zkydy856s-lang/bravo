import BravoNapis from "../BravoNapis";
// Nápojový lístek BRAVO (/listek) - statická stránka, anglicky, bez cen.
// Krémové pozadí, klidný vzhled, responzivní (čtecí sloupec), zpět na úvod.

type Polozka = { name: string; popis?: string }
type Sekce = { nadpis: string; podnadpis?: string; polozky: Polozka[] }

const SEKCE: Sekce[] = [
  {
    nadpis: 'Black coffee',
    polozky: [
      { name: 'Espresso (Ristretto) / Double Espresso' },
      { name: 'Espresso Romano', popis: 'slice of lemon / orange / grapefruit' },
      { name: 'Café Americano', popis: 'classic black coffee' },
      { name: 'Areocano', popis: 'steamed black coffee' },
      { name: 'Ice Freddo Espresso', popis: 'shaken Greek espresso' },
    ],
  },
  {
    nadpis: 'Coffee + milk',
    polozky: [
      { name: 'Espresso Macchiato / Double Macchiato' },
      { name: 'Café Cortado', popis: '“micro cappuccino”' },
      { name: 'Flat White', popis: '“stronger cappuccino”' },
      { name: 'Cappuccino' },
      { name: 'Café Latte / Café Latte Macchiato' },
      { name: 'Ice Frappé' },
      { name: 'Ice Freddo Cappuccino / Freddo Café Latte', popis: 'foamy' },
    ],
  },
  {
    nadpis: 'Extravagant',
    podnadpis: '… only real, good ingredients',
    polozky: [
      { name: 'Orange Espresso / Apple Espresso' },
      { name: 'Apple / Orange “Cider”', popis: 'spiced honey juice' },
      { name: 'Spiced Hibiscus Punch' },
      { name: 'Golden Café Latte / Golden Latte' },
      { name: 'Carob Café Latte / Carob Latte' },
      { name: 'Mocha Dark / White / Mocha Latte', popis: 'lighter' },
      { name: 'Chai Latte / Chai Café Latte' },
      { name: 'Green Matcha Latte / Matcha Tea', popis: 'bio grade' },
      { name: 'Wild Grade Ceremonial Cacao', popis: 'from the jungle' },
      { name: 'Nutty Café Latte', popis: 'pistachio / hazelnut / sesame / almond' },
    ],
  },
  {
    nadpis: 'Chocolate, tea, juice',
    polozky: [
      { name: 'Ice Hibiscus Lemonade', popis: 'apple / grapefruit / orange juice' },
      { name: 'Tea', popis: 'Hibiscus, Home Mint / Salvia, Roibos, Greek, Ginger-Lemon-Mint, Hibiscus-Mint … and more' },
      { name: 'Tea', popis: 'Chamomile, Fennel, Green, Earl Grey, English Breakfast, Mint … and more' },
      { name: 'Chocolate', popis: 'Dark or White Vanilla' },
      { name: 'Juice', popis: 'Orange, Apple, Grapefruit' },
      { name: 'Babyccino / Water 0,5 L' },
    ],
  },
]

const MILK = 'bio whole · no lactose · oat · almond.  … only real, good ingredients. bio, fair trade.'
const FREE_SPICES = 'Cardamom, Ginger, Cinnamon, Masala Chai, Nutmeg, Chilli, Golden Turmeric Mix, Tonka, Fennel, Pepper, Clove, Star Anise.'
const EXTRA = 'Espresso, Vanilla seeds, (Salty) Caramel, Hazelnut / Pistachio / Almond cream, Choco Dark / White, Carob, Whipped cream.'

function Nadpis({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#b8954a', textTransform: 'uppercase', margin: '0 0 12px', fontWeight: 600 }}>{children}</p>
}

export default function ListekPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f6f1e6', fontFamily: 'Inter,sans-serif', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <a href="/" style={{ fontSize: '13px', color: '#8a7f70', textDecoration: 'none' }}>← Zpět</a>
          <BravoNapis height={34} />
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 300, letterSpacing: '0.06em', color: '#1a1208', textAlign: 'center', margin: '0 0 28px' }}>Drinks</h1>

        {SEKCE.map(s => (
          <section key={s.nadpis} style={{ marginBottom: '22px' }}>
            <Nadpis>{s.nadpis}</Nadpis>
            {s.podnadpis && <p style={{ fontSize: '12px', color: '#9b8d76', fontStyle: 'italic', margin: '-6px 0 12px' }}>{s.podnadpis}</p>}
            {s.polozky.map((p, i) => (
              <div key={i} style={{ margin: '0 0 5px' }}>
                <span style={{ fontSize: '16px', color: '#1a1208' }}>{p.name}</span>
                {p.popis && <span style={{ fontSize: '13px', color: '#9b8d76', fontStyle: 'italic' }}>{'  '}… {p.popis}</span>}
              </div>
            ))}
          </section>
        ))}

        <section style={{ marginBottom: '22px' }}>
          <Nadpis>Milk</Nadpis>
          <p style={{ fontSize: '13px', color: '#6f6253', lineHeight: 1.7, margin: 0 }}>{MILK}</p>
        </section>

        <section style={{ marginBottom: '22px' }}>
          <Nadpis>Free spices</Nadpis>
          <p style={{ fontSize: '13px', color: '#6f6253', lineHeight: 1.7, margin: 0 }}>{FREE_SPICES}</p>
        </section>

        <section style={{ marginBottom: '22px' }}>
          <Nadpis>Extra</Nadpis>
          <p style={{ fontSize: '13px', color: '#6f6253', lineHeight: 1.7, margin: 0 }}>{EXTRA}</p>
        </section>

        <p style={{ fontSize: '13px', color: '#8c7f6a', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.7, margin: '8px 0 24px' }}>
          … play with your taste, be more creative and follow your feelings! ( :
        </p>
      </div>
    </main>
  )
}
