// Slovník překladů veřejné kostry webu (5 jazyků). Výchozí jazyk = EN.
// Pravidlo (podpis BRAVO): oslovovací zájmena s velkým počátečním písmenem ve všech jazycích.

export type Lang = 'en' | 'fr' | 'de' | 'lu' | 'cz'

export const LANGS: [Lang, string][] = [
  ['en', 'EN'], ['fr', 'FR'], ['de', 'DE'], ['lu', 'LU'], ['cz', 'CZ'],
]

export const DICT: Record<string, Record<Lang, string>> = {
  mistoKeSpocinuti: {
    cz: "… chvíle spočinutí",
    en: "… a moment to rest",
    fr: "… un instant pour souffler",
    de: "… eine Weile zum Verweilen",
    lu: "… eng Weil fir ze verweilen",
  },
  praveTed: {
    cz: "PRÁVĚ TEĎ", en: "RIGHT NOW", fr: "EN CE MOMENT", de: "GERADE JETZT", lu: "ELO GRAD",
  },
  otevreno: {
    cz: "Otevřeno", en: "Open", fr: "Ouvert", de: "Geöffnet", lu: "Op",
  },
  dnesZavreno: {
    cz: "Dnes zavřeno", en: "Closed today", fr: "Fermé aujourd'hui", de: "Heute geschlossen", lu: "Haut zou",
  },
  dnesUzZavreno: {
    cz: "Dnes už zavřeno", en: "Closed for today", fr: "Fermé pour aujourd'hui", de: "Für heute geschlossen", lu: "Fir haut zou",
  },
  pravdepodobne: {
    cz: "pravděpodobně", en: "likely", fr: "probablement", de: "voraussichtlich", lu: "warscheinlech",
  },
  otevrenoMale: {
    cz: "otevřeno", en: "open", fr: "ouvert", de: "geöffnet", lu: "op",
  },
  od: { cz: "od", en: "from", fr: "de", de: "ab", lu: "vun" },
  do: { cz: "do", en: "until", fr: "jusqu'à", de: "bis", lu: "bis" },
  brzyOtevreme: { cz: "Brzy otevřeme", en: "Opening soon", fr: "Bientôt ouvert", de: "Öffnet bald", lu: "Bal op" },
  zatimZavreno: { cz: "Zatím zavřeno", en: "Not open yet", fr: "Pas encore ouvert", de: "Noch geschlossen", lu: "Nach net op" },
  brzyZavirame: { cz: "Brzy zavíráme", en: "Closing soon", fr: "Bientôt fermé", de: "Schließt bald", lu: "Bal zou" },
  otevira: { cz: "otevírá", en: "opens", fr: "ouvre", de: "öffnet", lu: "mécht op" },
  vyuzijChvili: { cz: "využij chvíli", en: "enjoy the moment", fr: "profite de l'instant", de: "nutze den Moment", lu: "genéiss de Moment" },
  dnes: { cz: "dnes", en: "today", fr: "aujourd'hui", de: "heute", lu: "haut" },
  zitra: { cz: "Zítra", en: "Tomorrow", fr: "Demain", de: "Morgen", lu: "Muer" },
  zitraZavreno: { cz: "zavřeno", en: "closed", fr: "fermé", de: "geschlossen", lu: "zou" },
  // Hvězdičky *…* označují slova kurzívou (renderuje ProvozText, uživateli se nezobrazí).
  provozText: {
    cz: "Otevírací doba je *přibližná* a závisí na *počasí*. Než se vydám za chvílí k BraVo, vždy nejdřív spočinu ZDE a naladím se, abychom se skutečně sešli OBA připraveni. Těším se, děkuji TOBĚ za pochopení ❀",
    en: "Hours are *approximate* and depend on the *weather*. Before I set out for a moment to BraVo, I always rest HERE first and tune in, so we truly meet BOTH of us ready. Looking forward, thank YOU for understanding ❀",
    fr: "Les horaires sont *approximatifs*, selon la *météo*. Avant de partir un instant vers BraVo, je souffle d'abord ICI et je me mets au diapason, pour qu'on se retrouve vraiment prêts TOUS LES DEUX. Au plaisir, merci à TOI pour la compréhension ❀",
    de: "Die Öffnungszeiten sind *ungefähr*, je nach *Wetter*. Bevor ich für eine Weile zu BraVo aufbreche, verweile ich zuerst HIER und stimme mich ein, damit wir uns wirklich BEIDE bereit begegnen. Ich freue mich, danke DIR fürs Verständnis ❀",
    lu: "D'Öffnungszäiten si *ongeféier*, je no *Wieder*. Ier ech fir eng Weil op BraVo lassginn, verweilen ech als éischt HEI a stëmme mech an, fir datt mir eis wierklech BEIDS prett begéinen. Ech freeë mech, merci DIR fir d'Verständnis ❀",
  },
  popisRadek1: {
    cz: "Speciální káva, čaj, květiny a klasická hudba,",
    en: "Specialty coffee, tea, flowers and classical music,",
    fr: "Café de spécialité, thé, fleurs et musique classique,",
    de: "Spezialitätenkaffee, Tee, Blumen und klassische Musik,",
    lu: "Spezialitéitekaffi, Téi, Blummen a klassesch Musek,",
  },
  popisRadek2: {
    cz: "laděné dle Tvé chuti a chvíle,",
    en: "tuned to Your taste and moment,",
    fr: "accordés à Votre goût et à Votre instant,",
    de: "nach Deinem Geschmack und Weile,",
    lu: "no Dengem Goût an Weil,",
  },
  popisRadek3: {
    cz: "POZVÁNKA do místa, kde všední den spočine.",
    en: "an INVITATION to a place where the everyday rests.",
    fr: "une INVITATION vers un lieu où le quotidien souffle.",
    de: "eine EINLADUNG an einen Ort, wo der Alltag verweilt.",
    lu: "eng ANVITATIOUN op e Plaz, wou den Alldag verweilt.",
  },
  aBrzyPrijdeVic: {
    cz: "… a brzy přijde víc",
    en: "… and more is on the way",
    fr: "… et bientôt davantage",
    de: "… und bald kommt mehr",
    lu: "… a geschwë kënnt méi",
  },
  napojovyListek: {
    cz: "Nápojový lístek", en: "Drinks menu", fr: "Carte des boissons", de: "Getränkekarte", lu: "Gedrénkskaart",
  },
  nasledujMe: {
    cz: "Následuj mě", en: "Follow me", fr: "Suivez-moi", de: "Folgen Sie mir", lu: "Follegt mir",
  },
  vstupProMajitele: {
    cz: "Vstup pro majitele", en: "Owner login", fr: "Accès propriétaire", de: "Inhaber-Login", lu: "Login fir de Besëtzer",
  },
  zpet: {
    cz: "← Zpět", en: "← Back", fr: "← Retour", de: "← Zurück", lu: "← Zréck",
  },
}

export function tr(key: string, lang: Lang): string {
  return DICT[key]?.[lang] ?? DICT[key]?.en ?? key
}
