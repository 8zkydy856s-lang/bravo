import BravoNapis from "../BravoNapis";
import ZpetOdkaz from "../ZpetOdkaz";
// Nápojový lístek BRAVO (/listek) - statická stránka, anglicky.
// Ceny HOT (červená) / ICE (modrá) přeneseny ze simulátoru (aktuálnější verze).

type Polozka = { name: string; popis?: string; hot?: string; ice?: string; plain?: string }
type Sekce = { nadpis: string; podnadpis?: string; polozky: Polozka[] }
type Blok = { nadpis: string; text: string }

const HOT = '#c08a72'
const ICE = '#84a6b0'

const SEKCE: Sekce[] = [
  {
    nadpis: 'Black coffee', podnadpis: '… bio · fair trade',
    polozky: [
      { name: 'Espresso (Ristretto) / Double Espresso', hot: '3,5/5,0', ice: '3,8/5,3' },
      { name: 'Espresso Romano', popis: 'slice of lemon / orange / grapefruit', hot: '3,8/5,3', ice: '4,0/5,5' },
      { name: 'Café Americano', popis: 'classic black coffee', hot: '4,3/5,0', ice: '6,0' },
      { name: 'Areocano', popis: 'steamed black coffee', hot: '6,0', ice: '7,0' },
      { name: 'Ice Freddo Espresso', popis: 'shaken Greek espresso', ice: '6,5' },
    ],
  },
  {
    nadpis: 'Coffee + milk',
    polozky: [
      { name: 'Espresso Macchiato / Double Macchiato', hot: '4,0/5,5', ice: '4,5/5,8' },
      { name: 'Café Cortado', popis: '“micro cappuccino”', hot: '4,5', ice: '4,8' },
      { name: 'Flat White', popis: '“stronger cappuccino”', hot: '5,5/6,8', ice: '7,6' },
      { name: 'Cappuccino', hot: '5,0/6,3', ice: '7,3' },
      { name: 'Café Latte / Café Latte Macchiato', hot: '5,5', ice: '6,5' },
      { name: 'Ice Frappé', ice: '7,0' },
      { name: 'Ice Freddo Cappuccino / Freddo Café Latte', popis: 'foamy', ice: '7,5/7,0' },
    ],
  },
  {
    nadpis: 'Extravagant', podnadpis: '… only real, good ingredients',
    polozky: [
      { name: 'Orange Espresso / Apple Espresso', hot: '7,0', ice: '7,9' },
      { name: 'Apple / Orange “Cider”', popis: 'spiced honey juice', hot: '6,6', ice: '7,6' },
      { name: 'Spiced Hibiscus Punch', hot: '6,9', ice: '7,9' },
      { name: 'Golden Café Latte / Golden Latte', hot: '7,0/6,0', ice: '7,9/7,0' },
      { name: 'Carob Café Latte / Carob Latte', hot: '7,0/6,0', ice: '8,0/7,0' },
      { name: 'Mocha Dark / White / Mocha Latte', popis: 'lighter', hot: '7,5/6,6', ice: '8,5/7,6' },
      { name: 'Chai Latte / Chai Café Latte', hot: '6,5/7,5', ice: '7,5/8,5' },
      { name: 'Green Matcha Latte / Matcha Tea', popis: 'bio grade', hot: '7,3/5,7', ice: '8,3/6,7' },
      { name: 'Wild Grade Ceremonial Cacao', popis: 'from the jungle', hot: '8,8' },
      { name: 'Nutty Café Latte', popis: 'pistachio / hazelnut / sesame / almond', hot: '8,0', ice: '8,5' },
    ],
  },
  {
    nadpis: 'Chocolate, tea, juice',
    polozky: [
      { name: 'Ice Hibiscus Lemonade', popis: 'apple / grapefruit / orange juice', ice: '7,0' },
      { name: 'Tea', popis: 'Hibiscus, Home Mint / Salvia, Roibos, Greek, Ginger-Lemon-Mint, Hibiscus-Mint … and more', hot: '5,5', ice: '6,5' },
      { name: 'Tea', popis: 'Chamomile, Fennel, Green, Earl Grey, English Breakfast, Mint … and more', hot: '5,5', ice: '6,5' },
      { name: 'Chocolate', popis: 'Dark or White Vanilla', hot: '5,0/6,5', ice: '7,4' },
      { name: 'Juice', popis: 'Orange, Apple, Grapefruit', ice: '5,8' },
      { name: 'Babyccino / Water 0,5 L', plain: '3,8 / 2,5' },
    ],
  },
]

const BLOKY: Blok[] = [
  { nadpis: 'Milk', text: 'bio whole · no lactose · oat · almond.' },
  { nadpis: 'Free spices', text: 'Cardamom, Ginger, Cinnamon, Masala Chai, Nutmeg, Chilli, Golden Turmeric Mix, Tonka, Fennel, Pepper, Clove, Star Anise.' },
  { nadpis: 'Extra  1€', text: 'Espresso, Vanilla seeds, (Salty) Caramel, Hazelnut / Pistachio / Almond cream, Choco Dark / White, Carob, Whipped cream.' },
]

function Nadpis({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#b8954a', textTransform: 'uppercase', margin: '0 0 12px', fontWeight: 600 }}>{children}</p>
}

function Cena({ p }: { p: Polozka }) {
  if (p.plain) return <span style={{ color: '#6f6253' }}>{p.plain}</span>
  if (!p.hot && !p.ice) return <span style={{ color: '#6f6253' }}>—</span>
  return (
    <>
      {p.hot && <span style={{ color: HOT }}>{p.hot}</span>}
      {p.hot && p.ice && <span style={{ color: '#cabfa8' }}> · </span>}
      {p.ice && <span style={{ color: ICE }}>{p.ice}</span>}
    </>
  )
}

export default function ListekPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f6f1e6', fontFamily: 'Inter,sans-serif', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <ZpetOdkaz />
          <BravoNapis height={34} />
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 300, letterSpacing: '0.06em', color: '#1a1208', textAlign: 'center', margin: '0 0 8px' }}>Drinks</h1>
        <p style={{ textAlign: 'center', fontSize: '12px', margin: '0 0 28px' }}>
          <span style={{ color: HOT }}>● HOT</span>&nbsp;&nbsp;<span style={{ color: ICE }}>● ICE</span>
        </p>

        {SEKCE.map(s => (
          <section key={s.nadpis} style={{ marginBottom: '22px' }}>
            <Nadpis>{s.nadpis}</Nadpis>
            {s.podnadpis && <p style={{ fontSize: '12px', color: '#9b8d76', fontStyle: 'italic', margin: '-6px 0 12px' }}>{s.podnadpis}</p>}
            {s.polozky.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', margin: '0 0 5px' }}>
                <span style={{ flex: '1 1 auto', minWidth: 0, fontSize: '14px', color: '#1a1208' }}>
                  {p.name}
                  {p.popis && <span style={{ fontSize: '12px', color: '#9b8d76', fontStyle: 'italic' }}>{'  '}… {p.popis}</span>}
                </span>
                <span style={{ flex: '0 0 auto', whiteSpace: 'nowrap', fontSize: '13px' }}><Cena p={p} /></span>
              </div>
            ))}
          </section>
        ))}

        {BLOKY.map(b => (
          <section key={b.nadpis} style={{ marginBottom: '22px' }}>
            <Nadpis>{b.nadpis}</Nadpis>
            <p style={{ fontSize: '13px', color: '#6f6253', lineHeight: 1.7, margin: 0 }}>{b.text}</p>
          </section>
        ))}

        <p style={{ fontSize: '13px', color: '#8c7f6a', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.7, margin: '8px 0 24px' }}>
          … play with your taste, be more creative and follow your feelings! ( :
        </p>
      </div>
    </main>
  )
}
