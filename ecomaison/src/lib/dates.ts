/**
 * Manipulation de dates au format AAAA-MM-JJ.
 *
 * Les écarts sont calculés en UTC pour qu'un changement d'heure
 * (passage à l'heure d'été) n'introduise pas un décalage d'un jour.
 */

const FORMAT_ISO = /^(\d{4})-(\d{2})-(\d{2})$/

/** Convertit une date AAAA-MM-JJ en millisecondes UTC, ou null si la date est invalide. */
export function versUTC(iso: string): number | null {
  const m = FORMAT_ISO.exec(iso)
  if (!m) return null
  const annee = Number(m[1])
  const mois = Number(m[2])
  const jour = Number(m[3])
  if (mois < 1 || mois > 12 || jour < 1 || jour > 31) return null
  const ms = Date.UTC(annee, mois - 1, jour)
  const d = new Date(ms)
  // Rejette les dates qui « débordent », par exemple le 31 février.
  if (d.getUTCFullYear() !== annee || d.getUTCMonth() !== mois - 1 || d.getUTCDate() !== jour) {
    return null
  }
  return ms
}

export function estDateValide(iso: string): boolean {
  return versUTC(iso) !== null
}

const MS_PAR_JOUR = 86_400_000

/** Nombre de jours de `depuis` à `jusqua`. Négatif si `jusqua` précède `depuis`. */
export function joursEntre(depuis: string, jusqua: string): number | null {
  const a = versUTC(depuis)
  const b = versUTC(jusqua)
  if (a === null || b === null) return null
  return Math.round((b - a) / MS_PAR_JOUR)
}

/** La date du jour dans le fuseau de l'utilisateur, au format AAAA-MM-JJ. */
export function aujourdhuiISO(maintenant: Date = new Date()): string {
  const an = maintenant.getFullYear()
  const mois = String(maintenant.getMonth() + 1).padStart(2, '0')
  const jour = String(maintenant.getDate()).padStart(2, '0')
  return `${an}-${mois}-${jour}`
}

/** « 2026-01-11 » devient « 11 janv. 2026 ». */
export function formatJour(iso: string): string {
  const ms = versUTC(iso)
  if (ms === null) return iso
  return new Date(ms).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Version courte pour les axes de graphique : « 11 janv. ». */
export function formatJourCourt(iso: string): string {
  const ms = versUTC(iso)
  if (ms === null) return iso
  return new Date(ms).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}
