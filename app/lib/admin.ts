// Adminové (majitel) — allowlist e-mailů. Jediná brána do dashboardu vede z úvodní stránky
// přes „vstup pro majitele" → /login. Registrace pro veřejnost je zatím vypnutá (zákaznické
// funkce nejsou hotové), takže se přihlásí jen admin. Později role rozliší zákazník vs. admin.
export const ADMIN_EMAILS = ['vbratrsovsky@seznam.cz']

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}
