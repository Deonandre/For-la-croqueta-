import { describe, expect, it } from 'vitest'
import type { Releve } from '../../types'
import { JOURS_MINIMUM, comparerDefi, trouverDefi, DEFIS } from '../defis'
import { calculerPeriodes } from '../releves'

function r(id: string, date: string, index: number): Releve {
  return { id, date, index }
}

/** Dix kWh par jour avant le 1er février, six kWh par jour ensuite. */
const RELEVES: Releve[] = [
  r('a', '2026-01-01', 0),
  r('b', '2026-01-15', 140), // 14 j à 10 kWh/j
  r('c', '2026-02-01', 310), // 17 j à 10 kWh/j, se termine le jour du défi
  r('d', '2026-02-15', 394), // 14 j à 6 kWh/j
  r('e', '2026-03-01', 478), // 14 j à 6 kWh/j
]
const PERIODES = calculerPeriodes(RELEVES)

describe('catalogue de défis', () => {
  it('expose des identifiants uniques', () => {
    expect(new Set(DEFIS.map((d) => d.id)).size).toBe(DEFIS.length)
  })
  it('retrouve un défi par son identifiant', () => {
    expect(trouverDefi('veille')?.nom).toBeTruthy()
    expect(trouverDefi('inexistant')).toBeUndefined()
  })
})

describe('comparerDefi', () => {
  it('sépare les périodes de part et d’autre de la date de début', () => {
    const c = comparerDefi(PERIODES, { defiId: 'veille', dateDebut: '2026-02-01' })
    expect(c.avant?.periodes).toBe(2)
    expect(c.avant?.jours).toBe(31)
    expect(c.apres?.periodes).toBe(2)
    expect(c.apres?.jours).toBe(28)
  })

  it('calcule l’écart en kWh par jour et en pourcentage', () => {
    const c = comparerDefi(PERIODES, { defiId: 'veille', dateDebut: '2026-02-01' })
    expect(c.comparable).toBe(true)
    expect(c.avant?.kwhParJour).toBeCloseTo(10, 10)
    expect(c.apres?.kwhParJour).toBeCloseTo(6, 10)
    expect(c.difference).toBeCloseTo(-4, 10)
    expect(c.pourcentage).toBeCloseTo(-40, 10)
  })

  it('rappelle qu’un écart observé n’est pas une preuve', () => {
    const c = comparerDefi(PERIODES, { defiId: 'veille', dateDebut: '2026-02-01' })
    expect(c.message).toMatch(/pas une preuve/)
  })

  it('exclut une période à cheval sur la date de début et le signale', () => {
    const c = comparerDefi(PERIODES, { defiId: 'veille', dateDebut: '2026-01-20' })
    expect(c.periodesACheval).toBe(1)
    // Seule la première période est entièrement antérieure.
    expect(c.avant?.periodes).toBe(1)
    expect(c.apres?.periodes).toBe(2)
  })

  it('refuse de conclure sans période antérieure', () => {
    const c = comparerDefi(PERIODES, { defiId: 'veille', dateDebut: '2026-01-01' })
    expect(c.comparable).toBe(false)
    expect(c.avant).toBeNull()
    expect(c.difference).toBeNull()
    expect(c.message).toMatch(/relevés antérieurs/)
  })

  it('refuse de conclure sans période postérieure', () => {
    const c = comparerDefi(PERIODES, { defiId: 'veille', dateDebut: '2026-03-01' })
    expect(c.comparable).toBe(false)
    expect(c.apres).toBeNull()
    expect(c.message).toMatch(/Aucune période complète/)
  })

  it('refuse de conclure sur des fenêtres trop courtes', () => {
    const courts = calculerPeriodes([
      r('a', '2026-01-01', 0),
      r('b', '2026-01-04', 30), // 3 jours avant
      r('c', '2026-01-07', 48), // 3 jours après
    ])
    const c = comparerDefi(courts, { defiId: 'veille', dateDebut: '2026-01-04' })
    expect(c.comparable).toBe(false)
    expect(c.message).toContain(String(JOURS_MINIMUM))
  })

  it('tient compte d’une date de fin', () => {
    const c = comparerDefi(PERIODES, {
      defiId: 'veille',
      dateDebut: '2026-02-01',
      dateFin: '2026-02-15',
    })
    expect(c.apres?.periodes).toBe(1)
    expect(c.apres?.jours).toBe(14)
  })

  it('signale une hausse par un écart positif', () => {
    const hausse = calculerPeriodes([
      r('a', '2026-01-01', 0),
      r('b', '2026-01-15', 70), // 5 kWh/j
      r('c', '2026-01-29', 210), // 10 kWh/j
    ])
    const c = comparerDefi(hausse, { defiId: 'veille', dateDebut: '2026-01-15' })
    expect(c.difference).toBeCloseTo(5, 10)
    expect(c.pourcentage).toBeCloseTo(100, 10)
  })

  it('ne divise pas par zéro quand la consommation antérieure est nulle', () => {
    const nulle = calculerPeriodes([
      r('a', '2026-01-01', 500),
      r('b', '2026-01-15', 500), // 0 kWh/j avant
      r('c', '2026-01-29', 570), // 5 kWh/j après
    ])
    const c = comparerDefi(nulle, { defiId: 'veille', dateDebut: '2026-01-15' })
    expect(c.difference).toBeCloseTo(5, 10)
    expect(c.pourcentage).toBeNull()
  })

  it('ne renvoie rien à comparer sans aucune période', () => {
    const c = comparerDefi([], { defiId: 'veille', dateDebut: '2026-02-01' })
    expect(c.comparable).toBe(false)
    expect(c.avant).toBeNull()
    expect(c.apres).toBeNull()
  })
})
