import type { Anomalie, Periode, Releve } from '../types'
import { aujourdhuiISO, estDateValide, joursEntre } from './dates'

/** Au-delà de cette moyenne, un foyer de particuliers est très inhabituel. */
export const SEUIL_KWH_JOUR_ELEVE = 100
/** Au-delà de cette durée, la moyenne journalière lisse trop les variations. */
export const SEUIL_PERIODE_LONGUE = 92
/** Un écart de ce facteur par rapport à la médiane mérite une vérification. */
export const FACTEUR_ECART_INHABITUEL = 5

/** Tri chronologique. Ne modifie pas le tableau reçu. */
export function trierReleves(releves: readonly Releve[]): Releve[] {
  return [...releves].sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Transforme une liste de relevés en périodes de consommation.
 * Avec n relevés on obtient n − 1 périodes : un seul relevé ne dit rien d'une consommation.
 */
export function calculerPeriodes(releves: readonly Releve[]): Periode[] {
  const tries = trierReleves(releves)
  const periodes: Periode[] = []
  for (let i = 1; i < tries.length; i++) {
    const debut = tries[i - 1]
    const fin = tries[i]
    const jours = joursEntre(debut.date, fin.date)
    if (jours === null || jours <= 0) continue
    const kwh = fin.index - debut.index
    periodes.push({ debut, fin, jours, kwh, kwhParJour: kwh / jours })
  }
  return periodes
}

/**
 * Moyenne journalière sur l'ensemble des périodes.
 *
 * On divise le total des kWh par le total des jours, et non la moyenne des moyennes :
 * sinon une période de deux jours pèserait autant qu'une période de deux mois.
 */
export function moyenneKwhParJour(periodes: readonly Periode[]): number | null {
  if (periodes.length === 0) return null
  let kwh = 0
  let jours = 0
  for (const p of periodes) {
    kwh += p.kwh
    jours += p.jours
  }
  if (jours <= 0) return null
  return kwh / jours
}

/** Médiane des moyennes journalières, utilisée comme repère pour repérer les valeurs aberrantes. */
export function medianeKwhParJour(periodes: readonly Periode[]): number | null {
  if (periodes.length === 0) return null
  const valeurs = periodes.map((p) => p.kwhParJour).sort((a, b) => a - b)
  const milieu = Math.floor(valeurs.length / 2)
  return valeurs.length % 2 === 0
    ? (valeurs[milieu - 1] + valeurs[milieu]) / 2
    : valeurs[milieu]
}

export interface CandidatReleve {
  date: string
  /** null quand le champ est vide ou illisible. */
  index: number | null
}

/**
 * Vérifie un relevé avant son enregistrement.
 *
 * Les anomalies de gravité « erreur » empêchent l'enregistrement : elles décrivent
 * des situations physiquement impossibles. Les « alertes » sont enregistrables,
 * mais signalées, car elles peuvent aussi bien venir d'une faute de frappe
 * que d'une vraie particularité du foyer.
 *
 * @param idIgnore identifiant du relevé en cours de modification, exclu des comparaisons
 */
export function validerReleve(
  candidat: CandidatReleve,
  releves: readonly Releve[],
  idIgnore?: string,
  aujourdhui: string = aujourdhuiISO(),
): Anomalie[] {
  const anomalies: Anomalie[] = []
  const autres = trierReleves(releves.filter((r) => r.id !== idIgnore))

  if (!candidat.date) {
    anomalies.push({ gravite: 'erreur', message: 'Indique la date du relevé.' })
  } else if (!estDateValide(candidat.date)) {
    anomalies.push({ gravite: 'erreur', message: 'Cette date n’existe pas.' })
  } else if (candidat.date > aujourdhui) {
    anomalies.push({
      gravite: 'erreur',
      message: 'Cette date est dans le futur. Un relevé se note le jour où tu lis le compteur.',
    })
  } else if (autres.some((r) => r.date === candidat.date)) {
    anomalies.push({
      gravite: 'erreur',
      message: 'Un relevé existe déjà à cette date. Modifie-le plutôt que d’en ajouter un second.',
    })
  }

  if (candidat.index === null || !Number.isFinite(candidat.index)) {
    anomalies.push({ gravite: 'erreur', message: 'Saisis le nombre affiché sur le compteur, en kWh.' })
  } else if (candidat.index < 0) {
    anomalies.push({ gravite: 'erreur', message: 'Un index de compteur ne peut pas être négatif.' })
  }

  // Les contrôles suivants n'ont de sens que si la date et l'index sont déjà exploitables.
  if (anomalies.some((a) => a.gravite === 'erreur')) return anomalies
  const index = candidat.index as number

  const precedent = [...autres].reverse().find((r) => r.date < candidat.date)
  const suivant = autres.find((r) => r.date > candidat.date)

  if (precedent && index < precedent.index) {
    anomalies.push({
      gravite: 'erreur',
      message: `Le compteur ne peut pas diminuer : il affichait déjà ${precedent.index.toLocaleString('fr-FR')} kWh le ${precedent.date}. Vérifie le nombre que tu as lu.`,
    })
  }
  if (suivant && index > suivant.index) {
    anomalies.push({
      gravite: 'erreur',
      message: `Ce relevé dépasse celui du ${suivant.date}, qui affiche ${suivant.index.toLocaleString('fr-FR')} kWh. Le compteur ne peut pas revenir en arrière.`,
    })
  }
  if (anomalies.some((a) => a.gravite === 'erreur')) return anomalies

  // Repères issus des périodes déjà enregistrées, pour juger de la vraisemblance.
  const mediane = medianeKwhParJour(calculerPeriodes(autres))

  for (const voisin of [precedent, suivant]) {
    if (!voisin) continue
    const avant = voisin === precedent
    const jours = avant
      ? joursEntre(voisin.date, candidat.date)
      : joursEntre(candidat.date, voisin.date)
    if (jours === null || jours <= 0) continue
    const kwh = avant ? index - voisin.index : voisin.index - index
    const parJour = kwh / jours

    if (parJour > SEUIL_KWH_JOUR_ELEVE) {
      anomalies.push({
        gravite: 'alerte',
        message: `Cela représente ${parJour.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} kWh par jour, ce qui est très élevé pour un logement. Vérifie que tu n’as pas ajouté un chiffre.`,
      })
    } else if (mediane !== null && mediane > 0 && parJour > mediane * FACTEUR_ECART_INHABITUEL) {
      anomalies.push({
        gravite: 'alerte',
        message: `Cela représente ${parJour.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} kWh par jour, soit bien plus que tes autres périodes. Vérifie le relevé, ou note ce qui s’est passé.`,
      })
    } else if (parJour === 0 && jours > 2) {
      anomalies.push({
        gravite: 'alerte',
        message: `Le compteur n’a pas bougé en ${jours} jours. C’est possible si le logement était vide, mais vérifie le relevé.`,
      })
    }

    if (jours > SEUIL_PERIODE_LONGUE) {
      anomalies.push({
        gravite: 'alerte',
        message: `Il s’écoule ${jours} jours depuis le relevé voisin. La moyenne journalière restera très lissée : relève plus souvent si tu peux.`,
      })
    }
  }

  return anomalies
}

/** Anomalies visibles sur une période déjà enregistrée, affichées dans le tableau. */
export function anomaliesPeriode(periode: Periode, mediane: number | null): Anomalie[] {
  const anomalies: Anomalie[] = []
  if (periode.kwhParJour > SEUIL_KWH_JOUR_ELEVE) {
    anomalies.push({ gravite: 'alerte', message: 'Consommation journalière très élevée.' })
  } else if (
    mediane !== null &&
    mediane > 0 &&
    periode.kwhParJour > mediane * FACTEUR_ECART_INHABITUEL
  ) {
    anomalies.push({ gravite: 'alerte', message: 'Valeur très supérieure à tes autres périodes.' })
  } else if (periode.kwhParJour === 0 && periode.jours > 2) {
    anomalies.push({ gravite: 'alerte', message: 'Le compteur n’a pas bougé.' })
  }
  if (periode.jours > SEUIL_PERIODE_LONGUE) {
    anomalies.push({ gravite: 'alerte', message: 'Période très longue, moyenne peu détaillée.' })
  }
  return anomalies
}

/** Identifiant unique, avec repli si l'API du navigateur n'est pas disponible. */
export function nouvelId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
