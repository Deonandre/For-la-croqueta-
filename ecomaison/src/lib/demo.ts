import type { EtatApp } from '../types'

/**
 * Jeu de démonstration : un logement chauffé à l'électricité, relevé tous les
 * quatorze jours d'un début novembre à un début mars.
 *
 * Ces valeurs sont inventées pour permettre de présenter l'application sans
 * attendre plusieurs mois de relevés réels. Elles ne décrivent aucun foyer existant.
 *
 * Le jeu est construit pour illustrer un piège d'interprétation : la consommation
 * baisse après le début du défi, mais l'hiver se termine au même moment. C'est
 * exactement la confusion que l'élève doit savoir repérer et discuter.
 */
export const DEMO: EtatApp = {
  demo: true,
  defi: { defiId: 'veille', dateDebut: '2026-01-11' },
  releves: [
    { id: 'demo-1', date: '2025-11-02', index: 45210, note: 'Premier relevé' },
    { id: 'demo-2', date: '2025-11-16', index: 45361 },
    { id: 'demo-3', date: '2025-11-30', index: 45523 },
    { id: 'demo-4', date: '2025-12-14', index: 45706, note: 'Premiers vrais froids' },
    { id: 'demo-5', date: '2025-12-28', index: 45905, note: 'Vacances, maison pleine' },
    { id: 'demo-6', date: '2026-01-11', index: 46098, note: 'Début du défi' },
    { id: 'demo-7', date: '2026-01-25', index: 46265 },
    { id: 'demo-8', date: '2026-02-08', index: 46422 },
    { id: 'demo-9', date: '2026-02-22', index: 46570 },
    { id: 'demo-10', date: '2026-03-08', index: 46702, note: 'Il fait plus doux' },
  ],
}

/** Copie profonde, pour que modifier les données de démonstration n'altère pas le modèle. */
export function chargerDemo(): EtatApp {
  return {
    demo: true,
    defi: DEMO.defi ? { ...DEMO.defi } : null,
    releves: DEMO.releves.map((r) => ({ ...r })),
  }
}
