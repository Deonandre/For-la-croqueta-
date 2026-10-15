/** Formatage des nombres en français : espace insécable fine et virgule décimale. */

export function nombre(valeur: number, decimales = 1): string {
  return valeur.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

export function entier(valeur: number): string {
  return valeur.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
}

/** Ajoute explicitement le signe, utile pour un écart où le sens compte. */
export function signe(valeur: number, decimales = 1): string {
  const prefixe = valeur > 0 ? '+' : valeur < 0 ? '−' : ''
  return prefixe + nombre(Math.abs(valeur), decimales)
}

/** « 14 jours », « 1 jour ». */
export function jours(n: number): string {
  return `${entier(n)} ${n > 1 ? 'jours' : 'jour'}`
}

/**
 * Lit un nombre saisi au clavier en français : « 46 702,5 » vaut 46702.5.
 * Renvoie null si la saisie n'est pas un nombre exploitable.
 */
export function lireNombre(texte: string): number | null {
  const nettoye = texte
    .replace(/[\s\u00a0\u202f]/g, '')
    .replace(',', '.')
    .trim()
  if (nettoye === '') return null
  if (!/^-?\d*\.?\d+$/.test(nettoye)) return null
  const valeur = Number(nettoye)
  return Number.isFinite(valeur) ? valeur : null
}
