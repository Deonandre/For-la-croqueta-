import { describe, expect, it } from 'vitest'
import type { Releve } from '../../types'
import {
  anomaliesPeriode,
  calculerPeriodes,
  medianeKwhParJour,
  moyenneKwhParJour,
  trierReleves,
  validerReleve,
} from '../releves'

const AUJOURDHUI = '2026-03-15'

function r(id: string, date: string, index: number): Releve {
  return { id, date, index }
}

const BASE: Releve[] = [
  r('a', '2026-01-01', 1000),
  r('b', '2026-01-11', 1100), // 10 jours, 100 kWh, 10 kWh/j
  r('c', '2026-01-21', 1180), // 10 jours, 80 kWh, 8 kWh/j
]

describe('trierReleves', () => {
  it('trie par date sans modifier le tableau reçu', () => {
    const desordre = [BASE[2], BASE[0], BASE[1]]
    const copie = [...desordre]
    expect(trierReleves(desordre).map((x) => x.id)).toEqual(['a', 'b', 'c'])
    expect(desordre).toEqual(copie)
  })
})

describe('calculerPeriodes', () => {
  it('produit n − 1 périodes', () => {
    expect(calculerPeriodes(BASE)).toHaveLength(2)
  })
  it('ne produit aucune période avec un seul relevé', () => {
    expect(calculerPeriodes([BASE[0]])).toHaveLength(0)
    expect(calculerPeriodes([])).toHaveLength(0)
  })
  it('calcule la consommation et la moyenne journalière', () => {
    const [p1, p2] = calculerPeriodes(BASE)
    expect(p1.jours).toBe(10)
    expect(p1.kwh).toBe(100)
    expect(p1.kwhParJour).toBe(10)
    expect(p2.kwhParJour).toBe(8)
  })
  it('fonctionne même si les relevés arrivent dans le désordre', () => {
    const periodes = calculerPeriodes([BASE[2], BASE[0], BASE[1]])
    expect(periodes.map((p) => p.kwhParJour)).toEqual([10, 8])
  })
  it('ignore deux relevés à la même date, qui donneraient une division par zéro', () => {
    const periodes = calculerPeriodes([r('a', '2026-01-01', 1000), r('b', '2026-01-01', 1050)])
    expect(periodes).toHaveLength(0)
  })
})

describe('moyenneKwhParJour', () => {
  it('pondère par la durée, et non par le nombre de périodes', () => {
    const releves = [
      r('a', '2026-01-01', 0),
      r('b', '2026-01-02', 2), // 1 jour à 2 kWh/j
      r('c', '2026-02-01', 302), // 30 jours à 10 kWh/j
    ]
    // La moyenne des moyennes donnerait 6 ; la bonne réponse est 302 / 31.
    expect(moyenneKwhParJour(calculerPeriodes(releves))).toBeCloseTo(302 / 31, 10)
  })
  it('renvoie null sans période', () => {
    expect(moyenneKwhParJour([])).toBeNull()
  })
})

describe('medianeKwhParJour', () => {
  it('prend la valeur centrale sur un nombre impair de périodes', () => {
    const releves = [
      r('a', '2026-01-01', 0),
      r('b', '2026-01-02', 1),
      r('c', '2026-01-03', 11),
      r('d', '2026-01-04', 16),
    ]
    expect(medianeKwhParJour(calculerPeriodes(releves))).toBe(5)
  })
  it('fait la moyenne des deux valeurs centrales sur un nombre pair', () => {
    expect(medianeKwhParJour(calculerPeriodes(BASE))).toBe(9)
  })
})

describe('validerReleve', () => {
  const erreurs = (a: ReturnType<typeof validerReleve>) => a.filter((x) => x.gravite === 'erreur')
  const alertes = (a: ReturnType<typeof validerReleve>) => a.filter((x) => x.gravite === 'alerte')

  it('accepte un relevé normal', () => {
    const a = validerReleve({ date: '2026-01-31', index: 1260 }, BASE, undefined, AUJOURDHUI)
    expect(a).toEqual([])
  })
  it('refuse une date absente ou invalide', () => {
    expect(erreurs(validerReleve({ date: '', index: 1200 }, BASE, undefined, AUJOURDHUI))).toHaveLength(1)
    expect(
      erreurs(validerReleve({ date: '2026-02-30', index: 1200 }, BASE, undefined, AUJOURDHUI)),
    ).toHaveLength(1)
  })
  it('refuse une date dans le futur', () => {
    const a = erreurs(validerReleve({ date: '2026-03-16', index: 1300 }, BASE, undefined, AUJOURDHUI))
    expect(a).toHaveLength(1)
    expect(a[0].message).toContain('futur')
  })
  it('accepte la date du jour', () => {
    expect(
      erreurs(validerReleve({ date: AUJOURDHUI, index: 1300 }, BASE, undefined, AUJOURDHUI)),
    ).toHaveLength(0)
  })
  it('refuse une date déjà utilisée', () => {
    const a = erreurs(validerReleve({ date: '2026-01-11', index: 1100 }, BASE, undefined, AUJOURDHUI))
    expect(a.some((x) => x.message.includes('existe déjà'))).toBe(true)
  })
  it('autorise la date d’un relevé quand on modifie ce relevé', () => {
    const a = validerReleve({ date: '2026-01-11', index: 1105 }, BASE, 'b', AUJOURDHUI)
    expect(erreurs(a)).toHaveLength(0)
  })
  it('refuse un index absent, illisible ou négatif', () => {
    expect(erreurs(validerReleve({ date: '2026-02-01', index: null }, BASE, undefined, AUJOURDHUI))).toHaveLength(1)
    expect(erreurs(validerReleve({ date: '2026-02-01', index: NaN }, BASE, undefined, AUJOURDHUI))).toHaveLength(1)
    expect(erreurs(validerReleve({ date: '2026-02-01', index: -5 }, BASE, undefined, AUJOURDHUI))).toHaveLength(1)
  })
  it('refuse un compteur qui recule par rapport au relevé précédent', () => {
    const a = erreurs(validerReleve({ date: '2026-02-01', index: 1000 }, BASE, undefined, AUJOURDHUI))
    expect(a.some((x) => x.message.includes('ne peut pas diminuer'))).toBe(true)
  })
  it('refuse un relevé intercalé qui dépasse le relevé suivant', () => {
    const a = erreurs(validerReleve({ date: '2026-01-05', index: 5000 }, BASE, undefined, AUJOURDHUI))
    expect(a.some((x) => x.message.includes('revenir en arrière'))).toBe(true)
  })
  it('accepte un relevé intercalé cohérent', () => {
    expect(
      erreurs(validerReleve({ date: '2026-01-05', index: 1050 }, BASE, undefined, AUJOURDHUI)),
    ).toHaveLength(0)
  })
  it('alerte sur une consommation journalière énorme sans bloquer', () => {
    const a = validerReleve({ date: '2026-01-31', index: 3000 }, BASE, undefined, AUJOURDHUI)
    expect(erreurs(a)).toHaveLength(0)
    expect(alertes(a).some((x) => x.message.includes('kWh par jour'))).toBe(true)
  })
  it('alerte sur un écart très supérieur aux autres périodes', () => {
    const a = alertes(validerReleve({ date: '2026-01-26', index: 1480 }, BASE, undefined, AUJOURDHUI))
    expect(a.length).toBeGreaterThan(0)
  })
  it('alerte quand le compteur n’a pas bougé', () => {
    const a = alertes(validerReleve({ date: '2026-01-31', index: 1180 }, BASE, undefined, AUJOURDHUI))
    expect(a.some((x) => x.message.includes('n’a pas bougé'))).toBe(true)
  })
  it('alerte sur une période très longue', () => {
    // 131 jours après le dernier relevé, à une consommation ordinaire de 9 kWh/j :
    // seule la durée doit déclencher une alerte.
    const a = validerReleve({ date: '2026-06-01', index: 2359 }, BASE, undefined, '2026-07-01')
    expect(erreurs(a)).toHaveLength(0)
    expect(alertes(a).some((x) => x.message.includes('jours depuis le relevé voisin'))).toBe(true)
  })
  it('accepte le tout premier relevé d’un foyer', () => {
    expect(validerReleve({ date: '2026-01-01', index: 42_000 }, [], undefined, AUJOURDHUI)).toEqual([])
  })
})

describe('anomaliesPeriode', () => {
  it('ne signale rien sur une période ordinaire', () => {
    const [p] = calculerPeriodes(BASE)
    expect(anomaliesPeriode(p, 9)).toEqual([])
  })
  it('signale une période où le compteur n’a pas bougé', () => {
    const [p] = calculerPeriodes([r('a', '2026-01-01', 1000), r('b', '2026-01-11', 1000)])
    expect(anomaliesPeriode(p, 9)).toHaveLength(1)
  })
  it('signale une période trop longue', () => {
    const [p] = calculerPeriodes([r('a', '2026-01-01', 1000), r('b', '2026-06-01', 2000)])
    expect(anomaliesPeriode(p, 9).some((x) => x.message.includes('très longue'))).toBe(true)
  })
})
