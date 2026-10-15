import { describe, expect, it } from 'vitest'
import { entier, jours, lireNombre, nombre, signe } from '../format'

describe('lireNombre', () => {
  it('lit un entier simple', () => {
    expect(lireNombre('46702')).toBe(46702)
  })
  it('accepte la virgule décimale française', () => {
    expect(lireNombre('46702,5')).toBe(46702.5)
  })
  it('accepte aussi le point décimal', () => {
    expect(lireNombre('46702.5')).toBe(46702.5)
  })
  it('ignore les espaces de séparation des milliers, y compris insécables', () => {
    expect(lireNombre('46 702')).toBe(46702)
    expect(lireNombre('46 702')).toBe(46702)
    expect(lireNombre('46 702,5')).toBe(46702.5)
  })
  it('refuse une saisie vide ou faite seulement d’espaces', () => {
    expect(lireNombre('')).toBeNull()
    expect(lireNombre('   ')).toBeNull()
  })
  it('refuse du texte, même s’il contient des chiffres', () => {
    expect(lireNombre('environ 46702')).toBeNull()
    expect(lireNombre('46702 kWh')).toBeNull()
    expect(lireNombre('12,5,3')).toBeNull()
    expect(lireNombre('--5')).toBeNull()
  })
  it('refuse les notations que l’utilisateur n’a pas voulu saisir', () => {
    expect(lireNombre('1e5')).toBeNull()
    expect(lireNombre('Infinity')).toBeNull()
    expect(lireNombre('NaN')).toBeNull()
  })
  it('lit un nombre négatif, que la validation rejettera ensuite explicitement', () => {
    expect(lireNombre('-5')).toBe(-5)
  })
  it('lit un décimal écrit sans zéro initial', () => {
    expect(lireNombre(',5')).toBe(0.5)
  })
})

describe('mise en forme', () => {
  it('écrit les décimales demandées', () => {
    expect(nombre(10, 2)).toBe('10,00')
    expect(nombre(9.456)).toBe('9,5')
  })
  it('arrondit les entiers', () => {
    expect(entier(46702.4)).toBe('46 702'.replace(' ', ' '))
  })
  it('marque explicitement le signe d’un écart', () => {
    expect(signe(-4, 2)).toBe('−4,00')
    expect(signe(4, 2)).toBe('+4,00')
    expect(signe(0, 2)).toBe('0,00')
  })
  it('accorde le mot jour', () => {
    expect(jours(1)).toBe('1 jour')
    expect(jours(14)).toBe('14 jours')
  })
})
