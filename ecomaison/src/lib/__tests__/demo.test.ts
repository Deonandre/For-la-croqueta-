import { describe, expect, it } from 'vitest'
import { chargerDemo } from '../demo'
import { calculerPeriodes, validerReleve } from '../releves'
import { comparerDefi, trouverDefi } from '../defis'

describe('jeu de démonstration', () => {
  const demo = chargerDemo()

  it('est marqué comme démonstration', () => {
    expect(demo.demo).toBe(true)
  })

  it('ne contient aucun relevé que l’application refuserait', () => {
    const accumules: typeof demo.releves = []
    for (const releve of demo.releves) {
      const anomalies = validerReleve(
        { date: releve.date, index: releve.index },
        accumules,
        undefined,
        '2026-10-15',
      )
      expect(anomalies.filter((a) => a.gravite === 'erreur')).toEqual([])
      accumules.push(releve)
    }
  })

  it('décrit une consommation plausible pour un logement', () => {
    for (const p of calculerPeriodes(demo.releves)) {
      expect(p.kwhParJour).toBeGreaterThan(1)
      expect(p.kwhParJour).toBeLessThan(60)
    }
  })

  it('pointe vers un défi qui existe', () => {
    expect(demo.defi).not.toBeNull()
    expect(trouverDefi(demo.defi!.defiId)).toBeDefined()
  })

  it('produit une comparaison exploitable, montrant une baisse', () => {
    const c = comparerDefi(calculerPeriodes(demo.releves), demo.defi!)
    expect(c.comparable).toBe(true)
    expect(c.difference).toBeLessThan(0)
    expect(c.avant!.periodes).toBeGreaterThanOrEqual(2)
    expect(c.apres!.periodes).toBeGreaterThanOrEqual(2)
  })

  it('est recopié, pas partagé, pour qu’une modification ne contamine pas le modèle', () => {
    const a = chargerDemo()
    const b = chargerDemo()
    a.releves[0].index = 999_999
    expect(b.releves[0].index).not.toBe(999_999)
  })
})
