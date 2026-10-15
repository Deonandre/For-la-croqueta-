import type { DefiEnCours, EtatApp, Releve } from '../types'

const CLE = 'ecomaison.v1'

export const ETAT_INITIAL: EtatApp = { releves: [], defi: null, demo: false }

function estReleve(valeur: unknown): valeur is Releve {
  if (typeof valeur !== 'object' || valeur === null) return false
  const v = valeur as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.date === 'string' &&
    typeof v.index === 'number' &&
    Number.isFinite(v.index) &&
    (v.note === undefined || typeof v.note === 'string')
  )
}

function estDefi(valeur: unknown): valeur is DefiEnCours {
  if (typeof valeur !== 'object' || valeur === null) return false
  const v = valeur as Record<string, unknown>
  return (
    typeof v.defiId === 'string' &&
    typeof v.dateDebut === 'string' &&
    (v.dateFin === undefined || typeof v.dateFin === 'string')
  )
}

/**
 * Relit l'état depuis le navigateur.
 *
 * Le stockage peut être vide, désactivé en navigation privée, ou contenir des données
 * écrites par une version antérieure : dans tous ces cas on repart d'un état vide
 * plutôt que de faire échouer le chargement de l'application.
 */
export function chargerEtat(): EtatApp {
  try {
    const brut = localStorage.getItem(CLE)
    if (!brut) return ETAT_INITIAL
    const analyse: unknown = JSON.parse(brut)
    if (typeof analyse !== 'object' || analyse === null) return ETAT_INITIAL
    const o = analyse as Record<string, unknown>
    return {
      releves: Array.isArray(o.releves) ? o.releves.filter(estReleve) : [],
      defi: estDefi(o.defi) ? o.defi : null,
      demo: o.demo === true,
    }
  } catch {
    return ETAT_INITIAL
  }
}

/** Enregistre l'état. Un échec d'écriture ne doit jamais interrompre l'utilisation. */
export function enregistrerEtat(etat: EtatApp): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat))
  } catch {
    // Stockage plein ou refusé : les données restent en mémoire pour la session en cours.
  }
}

export function effacerStockage(): void {
  try {
    localStorage.removeItem(CLE)
  } catch {
    // Rien à faire : il n'y avait de toute façon rien à effacer.
  }
}
