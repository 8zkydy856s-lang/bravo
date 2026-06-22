// Slovník překladů veřejné kostry webu (5 jazyků). Výchozí jazyk = EN.
// Pravidlo (podpis BRAVO): oslovovací zájmena s velkým počátečním písmenem ve všech jazycích.

export type Lang = 'en' | 'fr' | 'de' | 'lu' | 'cz'

export const LANGS: [Lang, string][] = [
  ['en', 'EN'], ['fr', 'FR'], ['de', 'DE'], ['lu', 'LU'], ['cz', 'CZ'],
]

export const DICT: Record<string, Record<Lang, string>> = {
  mistoKeSpocinuti: {
    cz: "místo ke spočinutí",
    en: "a place to rest",
    fr: "un lieu pour souffler",
    de: "ein Moment zum Verweilen",
    lu: "e Plaz fir ze verweilen",
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
  od: { cz: "od", en: "from", fr: "de", de: "ab", lu: "vun" },
  do: { cz: "do", en: "until", fr: "jusqu'à", de: "bis", lu: "bis" },
  // Hvězdičky *…* označují slova kurzívou (renderuje ProvozText, uživateli se nezobrazí).
  provozText: {
    cz: "Otevírací doba je *přibližná* a závisí na *počasí*. Než vyrazím za chvilkou s BraVo, vždy nejdřív spočinu ZDE a naladím se, abychom se sešli OBA připraveni. Těším se, děkuji za pochopení 🙏",
    en: "Opening hours are *approximate* and depend on the *weather*. Before I set out for a little while with BraVo, I always rest HERE first and tune in, so the two of us meet ready, BOTH of us. I'm looking forward to it, thank You for understanding 🙏",
    fr: "Les horaires sont *approximatifs* et dépendent de la *météo*. Avant de partir un instant avec BraVo, je souffle d'abord ICI et je me mets au diapason, pour que l'on se retrouve prêts TOUS LES DEUX. Je m'en réjouis, merci de Votre compréhension 🙏",
    de: "Die Öffnungszeiten sind *ungefähr* und hängen vom *Wetter* ab. Bevor ich für eine Weile mit BraVo losziehe, verweile ich zuerst HIER und stimme mich ein, damit wir uns BEIDE bereit begegnen. Ich freue mich darauf, danke für Ihr Verständnis 🙏",
    lu: "D'Öffnungszäiten si *geféier* a hänken vum *Wieder* of. Ier ech fir e Moment mat BraVo lass ziehen, verweilen ech als éischt HEI a stëmme mech an, fir datt mir eis BEIDS prett begéinen. Ech freeë mech, merci fir d'Verständnis 🙏",
  },
  popisRadek1: {
    cz: "Speciální káva, čaj, květiny a klasická hudba.",
    en: "Specialty coffee, tea, flowers and classical music.",
    fr: "Café de spécialité, thé, fleurs et musique classique.",
    de: "Spezialitätenkaffee, Tee, Blumen und klassische Musik.",
    lu: "Spezialitéitekaffi, Téi, Blummen a klassesch Musek.",
  },
  popisRadek2: {
    cz: "Nápoje laděné na míru, podle Tvé chuti i nálady.",
    en: "Drinks tuned to Your taste and mood.",
    fr: "Des boissons accordées à Votre goût et à Votre humeur.",
    de: "Getränke, ganz nach Ihrem Geschmack und Ihrer Stimmung.",
    lu: "Gedrénks ganz no Ärem Goût an Ärer Laun.",
  },
  popisRadek3: {
    cz: "Pozvánka ke spočinutí ve všedním dni.",
    en: "An invitation to rest in every ordinary day.",
    fr: "Une invitation à souffler dans chaque jour ordinaire.",
    de: "Eine Einladung zum Verweilen an jedem gewöhnlichen Tag.",
    lu: "Eng Invitatioun fir an all gewéinlechen Dag ze verweilen.",
  },
  aBrzyPrijdeVic: {
    cz: "… a brzy přijde víc 😌",
    en: "… and more is on the way 😌",
    fr: "… et bientôt davantage 😌",
    de: "… und bald kommt mehr 😌",
    lu: "… a geschwë kënnt méi 😌",
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
