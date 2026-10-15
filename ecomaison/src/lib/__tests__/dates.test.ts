import { describe, expect, it } from 'vitest'
import { aujourdhuiISO, estDateValide, formatJour, joursEntre, versUTC } from '../dates'

describe('estDateValide', () => {
  it('accepte une date réelle', () => {
    expect(estDateValide('2026-01-11')).toBe(true)
  })
  it('refuse un format incorrect', () => {
    expect(estDateValide('11/01/2026')).toBe(false)
    expect(estDateValide('2026-1-11')).toBe(false)
    expect(estDateValide('')).toBe(false)
  })
  it('refuse une date qui n’existe pas', () => {
    expect(estDateValide('2026-02-31')).toBe(false)
    expect(estDateValide('2026-13-01')).toBe(false)
    expect(estDateValide('2025-02-29')).toBe(false)
  })
  it('accepte le 29 février d’une année bissextile', () => {
    expect(estDateValide('2024-02-29')).toBe(true)
  })
})

describe('joursEntre', () => {
  it('compte les jours dans le bon sens', () => {
    expect(joursEntre('2026-01-01', '2026-01-15')).toBe(14)
    expect(joursEntre('2026-01-15', '2026-01-01')).toBe(-14)
    expect(joursEntre('2026-01-01', '2026-01-01')).toBe(0)
  })
  it('traverse un changement d’heure sans perdre ni gagner un jour', () => {
    // En France, l'heure d'été commence le 29 mars 2026.
    expect(joursEntre('2026-03-28', '2026-03-30')).toBe(2)
    // Retour à l'heure d'hiver le 25 octobre 2026.
    expect(joursEntre('2026-10-24', '2026-10-26')).toBe(2)
  })
  it('traverse une fin d’année et une année bissextile', () => {
    expect(joursEntre('2025-12-25', '2026-01-05')).toBe(11)
    expect(joursEntre('2024-02-28', '2024-03-01')).toBe(2)
  })
  it('renvoie null sur une date invalide', () => {
    expect(joursEntre('pas une date', '2026-01-01')).toBeNull()
  })
})

describe('aujourdhuiISO', () => {
  it('utilise la date locale, pas la date UTC', () => {
    // 23 h 30 heure locale : la date UTC pourrait déjà être le lendemain.
    const soir = new Date(2026, 0, 11, 23, 30)
    expect(aujourdhuiISO(soir)).toBe('2026-01-11')
  })
  it('complète les mois et jours à deux chiffres', () => {
    expect(aujourdhuiISO(new Date(2026, 2, 5))).toBe('2026-03-05')
  })
})

describe('formatJour', () => {
  it('ne décale pas la date d’un jour', () => {
    expect(formatJour('2026-01-11')).toContain('11')
    expect(formatJour('2026-01-11')).toContain('2026')
  })
  it('renvoie l’entrée telle quelle si elle est illisible', () => {
    expect(formatJour('bricolage')).toBe('bricolage')
  })
})

describe('versUTC', () => {
  it('place la date à minuit UTC', () => {
    expect(versUTC('1970-01-02')).toBe(86_400_000)
  })
})
