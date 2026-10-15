/** Un relevé de compteur saisi à la main par l'élève. */
export interface Releve {
  /** Identifiant interne, jamais affiché. */
  id: string
  /** Date du relevé, au format AAAA-MM-JJ. */
  date: string
  /** Nombre affiché sur le compteur, en kWh. C'est un index cumulé, pas une consommation. */
  index: number
  /** Remarque libre : « absence une semaine », « invités », etc. */
  note?: string
}

/** L'intervalle entre deux relevés consécutifs : c'est là que se calcule la consommation. */
export interface Periode {
  debut: Releve
  fin: Releve
  /** Nombre de jours entre les deux relevés. Toujours strictement positif. */
  jours: number
  /** Consommation sur la période, en kWh. */
  kwh: number
  /** Consommation moyenne journalière, en kWh par jour. */
  kwhParJour: number
}

/** Un geste de sobriété que l'élève décide de tester. */
export interface Defi {
  id: string
  nom: string
  description: string
  conseil: string
}

/** Le défi en cours : une date de début, et éventuellement une date de fin. */
export interface DefiEnCours {
  defiId: string
  dateDebut: string
  dateFin?: string
}

/** Tout ce que l'application conserve dans le navigateur. */
export interface EtatApp {
  releves: Releve[]
  defi: DefiEnCours | null
  /** Vrai quand les données affichées sont le jeu de démonstration. */
  demo: boolean
}

export type Gravite = 'erreur' | 'alerte'

/** Un problème détecté sur un relevé ou une période. */
export interface Anomalie {
  gravite: Gravite
  message: string
}
