import type { Defi, DefiEnCours, Periode } from '../types'

export const DEFIS: Defi[] = [
  {
    id: 'veille',
    nom: 'Éteindre les appareils en veille',
    description:
      'Box internet, télévision, console, imprimante, chargeurs : couper ce qui reste allumé sans servir.',
    conseil:
      'Une multiprise à interrupteur permet de tout couper d’un geste en quittant la maison ou en allant dormir.',
  },
  {
    id: 'chauffage',
    nom: 'Baisser le chauffage d’un degré',
    description:
      'À ne tester que si le logement est chauffé à l’électricité : radiateurs électriques ou pompe à chaleur.',
    conseil:
      'Note la température de consigne avant et après. Sans ce chiffre, tu ne pourras pas décrire précisément ce que tu as changé.',
  },
  {
    id: 'lessive',
    nom: 'Laver le linge à 30 °C',
    description:
      'Chauffer l’eau est le poste le plus consommateur d’un lave-linge, bien avant le moteur.',
    conseil:
      'Compte le nombre de lessives pendant chaque période : si ce nombre change, la comparaison perd son sens.',
  },
  {
    id: 'lumiere',
    nom: 'Éteindre en quittant une pièce',
    description: 'Prendre l’habitude d’éteindre systématiquement la lumière derrière soi.',
    conseil:
      'L’effet est faible si l’éclairage est déjà en LED. C’est un résultat intéressant à discuter, pas un échec.',
  },
  {
    id: 'douche',
    nom: 'Raccourcir les douches',
    description:
      'À ne tester que si l’eau chaude est produite par un chauffe-eau électrique.',
    conseil:
      'Un minuteur ou une chanson de durée connue aide à rendre la consigne reproductible pour tout le foyer.',
  },
  {
    id: 'secheLinge',
    nom: 'Étendre le linge au lieu du sèche-linge',
    description: 'Le sèche-linge est l’un des appareils les plus consommateurs du logement.',
    conseil: 'Note combien de cycles de sèche-linge ont eu lieu avant, puis pendant le défi.',
  },
]

export function trouverDefi(id: string): Defi | undefined {
  return DEFIS.find((d) => d.id === id)
}

/** Agrégat de consommation sur une fenêtre de temps. */
export interface Fenetre {
  periodes: number
  jours: number
  kwh: number
  kwhParJour: number
}

export interface ComparaisonDefi {
  avant: Fenetre | null
  apres: Fenetre | null
  /** Écart en kWh par jour. Négatif quand la consommation a baissé. */
  difference: number | null
  /** Écart relatif en pourcentage. Négatif quand la consommation a baissé. */
  pourcentage: number | null
  /** Vrai quand les deux fenêtres contiennent assez de données pour être comparées. */
  comparable: boolean
  /** Ce qui manque, le cas échéant. Toujours renseigné quand `comparable` est faux. */
  message: string
  /** Périodes ignorées parce qu'elles chevauchent la date de début. */
  periodesACheval: number
}

/** Minimum de jours dans chaque fenêtre pour qu'une comparaison soit présentée. */
export const JOURS_MINIMUM = 7

function agreger(periodes: readonly Periode[]): Fenetre | null {
  if (periodes.length === 0) return null
  let kwh = 0
  let jours = 0
  for (const p of periodes) {
    kwh += p.kwh
    jours += p.jours
  }
  if (jours <= 0) return null
  return { periodes: periodes.length, jours, kwh, kwhParJour: kwh / jours }
}

/**
 * Compare la consommation du foyer avant et pendant un défi.
 *
 * Une période n'est retenue que si elle tient entièrement d'un côté de la date de début :
 * une période à cheval mélangerait les deux comportements et fausserait les deux moyennes.
 *
 * Cette fonction décrit un écart observé. Elle n'établit aucun lien de cause à effet :
 * la météo, la saison et le nombre de personnes présentes changent eux aussi d'une
 * période à l'autre.
 */
export function comparerDefi(
  periodes: readonly Periode[],
  defi: DefiEnCours,
): ComparaisonDefi {
  const avantPeriodes: Periode[] = []
  const apresPeriodes: Periode[] = []
  let periodesACheval = 0

  for (const p of periodes) {
    const entierementAvant = p.fin.date <= defi.dateDebut
    const commenceApres = p.debut.date >= defi.dateDebut
    const finitAvantLaFin = !defi.dateFin || p.fin.date <= defi.dateFin

    if (entierementAvant) {
      avantPeriodes.push(p)
    } else if (commenceApres && finitAvantLaFin) {
      apresPeriodes.push(p)
    } else if (!commenceApres) {
      periodesACheval++
    }
  }

  const avant = agreger(avantPeriodes)
  const apres = agreger(apresPeriodes)

  const base = { avant, apres, periodesACheval }

  if (!avant) {
    return {
      ...base,
      difference: null,
      pourcentage: null,
      comparable: false,
      message:
        'Il manque des relevés antérieurs au début du défi. Sans point de comparaison, un écart ne veut rien dire.',
    }
  }
  if (!apres) {
    return {
      ...base,
      difference: null,
      pourcentage: null,
      comparable: false,
      message:
        'Aucune période complète depuis le début du défi. Continue à relever ton compteur : la comparaison apparaîtra au prochain relevé.',
    }
  }
  if (avant.jours < JOURS_MINIMUM || apres.jours < JOURS_MINIMUM) {
    return {
      ...base,
      difference: null,
      pourcentage: null,
      comparable: false,
      message: `Il faut au moins ${JOURS_MINIMUM} jours de chaque côté pour que la comparaison ait un sens. Tu en as ${avant.jours} avant et ${apres.jours} pendant.`,
    }
  }

  const difference = apres.kwhParJour - avant.kwhParJour
  const pourcentage = avant.kwhParJour > 0 ? (difference / avant.kwhParJour) * 100 : null

  return {
    ...base,
    difference,
    pourcentage,
    comparable: true,
    message:
      'Cet écart est une observation, pas une preuve. La météo, la saison et le nombre de personnes présentes ont pu changer en même temps que ton geste.',
  }
}
