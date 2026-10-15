import { useEffect, useMemo, useRef, useState } from 'react'
import type { EtatApp, Releve } from './types'
import { aujourdhuiISO } from './lib/dates'
import { nombre } from './lib/format'
import {
  calculerPeriodes,
  medianeKwhParJour,
  moyenneKwhParJour,
  trierReleves,
} from './lib/releves'
import { chargerDemo } from './lib/demo'
import { ETAT_INITIAL, chargerEtat, effacerStockage, enregistrerEtat } from './lib/stockage'
import { Accueil } from './components/Accueil'
import { BandeauDemo } from './components/BandeauDemo'
import { Climat } from './components/Climat'
import { Defis } from './components/Defis'
import { FormulaireReleve } from './components/FormulaireReleve'
import { Graphique } from './components/Graphique'
import { TablePeriodes } from './components/TablePeriodes'
import { TableReleves } from './components/TableReleves'

type Vue = 'accueil' | 'releves' | 'defis' | 'climat'

const ONGLETS: { id: Vue; libelle: string }[] = [
  { id: 'accueil', libelle: 'Accueil' },
  { id: 'releves', libelle: 'Mes relevés' },
  { id: 'defis', libelle: 'Défis' },
  { id: 'climat', libelle: 'Climat' },
]

export default function App() {
  const [etat, setEtat] = useState<EtatApp>(() => chargerEtat())
  const [vue, setVue] = useState<Vue>('accueil')
  const [enEdition, setEnEdition] = useState<string | null>(null)
  const [annonce, setAnnonce] = useState('')
  const [confirmerEffacement, setConfirmerEffacement] = useState(false)

  const zoneVue = useRef<HTMLDivElement>(null)
  const premierRendu = useRef(true)

  const aujourdhui = aujourdhuiISO()

  useEffect(() => {
    enregistrerEtat(etat)
  }, [etat])

  // Au changement de vue, on déplace le focus pour que la navigation au clavier
  // et au lecteur d'écran suive le changement de contenu.
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false
      return
    }
    zoneVue.current?.focus()
  }, [vue])

  const periodes = useMemo(() => calculerPeriodes(etat.releves), [etat.releves])
  const moyenne = useMemo(() => moyenneKwhParJour(periodes), [periodes])
  const mediane = useMemo(() => medianeKwhParJour(periodes), [periodes])
  const totalKwh = useMemo(() => periodes.reduce((s, p) => s + p.kwh, 0), [periodes])
  const totalJours = useMemo(() => periodes.reduce((s, p) => s + p.jours, 0), [periodes])

  const releveEnEdition = enEdition
    ? (etat.releves.find((r) => r.id === enEdition) ?? null)
    : null

  function enregistrerReleve(releve: Releve, modification: boolean) {
    setEtat((precedent) => ({
      ...precedent,
      releves: modification
        ? precedent.releves.map((r) => (r.id === releve.id ? releve : r))
        : [...precedent.releves, releve],
    }))
    setEnEdition(null)
    setAnnonce(
      modification
        ? `Relevé du ${releve.date} modifié.`
        : `Relevé du ${releve.date} ajouté : ${nombre(releve.index, 0)} kilowattheures.`,
    )
  }

  function supprimerReleve(releve: Releve) {
    setEtat((precedent) => ({
      ...precedent,
      releves: precedent.releves.filter((r) => r.id !== releve.id),
    }))
    if (enEdition === releve.id) setEnEdition(null)
    setAnnonce(`Relevé du ${releve.date} supprimé.`)
  }

  function toutEffacer() {
    effacerStockage()
    setEtat(ETAT_INITIAL)
    setEnEdition(null)
    setConfirmerEffacement(false)
    setAnnonce('Toutes les données ont été effacées.')
  }

  function chargerJeuDemo() {
    setEtat(chargerDemo())
    setEnEdition(null)
    setVue('releves')
    setAnnonce('Données de démonstration chargées. Ce sont des exemples, pas des mesures réelles.')
  }

  return (
    <div className="coque">
      <a className="lien-evitement" href="#contenu">
        Aller au contenu
      </a>

      <header className="entete">
        <span className="marque">
          ÉcoMaison<span className="marque-point">.</span>
        </span>
        <span className="sous-marque">
          Suivi de la consommation électrique d’un foyer — projet d’ESS, thème 6
        </span>
      </header>

      <nav className="nav" aria-label="Sections de l’application">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-current={vue === o.id ? 'page' : undefined}
            onClick={() => setVue(o.id)}
          >
            {o.libelle}
          </button>
        ))}
      </nav>

      {etat.demo && <BandeauDemo onEffacer={toutEffacer} />}

      <p aria-live="polite" className="invisible">
        {annonce}
      </p>

      <main id="contenu" ref={zoneVue} tabIndex={-1}>
        {vue === 'accueil' && (
          <Accueil
            nbReleves={etat.releves.length}
            moyenne={moyenne}
            periodes={periodes}
            demo={etat.demo}
            onAllerAuxReleves={() => setVue('releves')}
            onChargerDemo={chargerJeuDemo}
          />
        )}

        {vue === 'releves' && (
          <>
            <div className="carte">
              <h2>Mes relevés</h2>
              <p className="chapo">
                Saisis l’index affiché sur ton compteur, c’est-à-dire le nombre total de
                kilowattheures consommés depuis son installation. L’application calcule
                elle-même les différences. Rien n’est lu automatiquement : tout vient de ce que
                tu recopies.
              </p>
              <FormulaireReleve
                releves={etat.releves}
                releveEnEdition={releveEnEdition}
                aujourdhui={aujourdhui}
                onEnregistrer={enregistrerReleve}
                onAnnulerEdition={() => setEnEdition(null)}
              />
            </div>

            {etat.releves.length > 0 && (
              <div className="carte">
                <h2>Synthèse</h2>
                <dl className="chiffres">
                  <div className="chiffre">
                    <dt>Moyenne générale</dt>
                    <dd className="num">
                      {moyenne === null ? '—' : nombre(moyenne, 2)}
                      <span className="unite">kWh/jour</span>
                      <span className="precision">
                        sur l’ensemble de tes relevés, pondérée par la durée
                      </span>
                    </dd>
                  </div>
                  <div className="chiffre">
                    <dt>Dernière période</dt>
                    <dd className="num">
                      {periodes.length === 0
                        ? '—'
                        : nombre(periodes[periodes.length - 1].kwhParJour, 2)}
                      <span className="unite">kWh/jour</span>
                      <span className="precision">
                        {periodes.length === 0
                          ? 'il faut deux relevés'
                          : `du ${periodes[periodes.length - 1].debut.date} au ${periodes[periodes.length - 1].fin.date}`}
                      </span>
                    </dd>
                  </div>
                  <div className="chiffre">
                    <dt>Total mesuré</dt>
                    <dd className="num">
                      {nombre(totalKwh, 0)}
                      <span className="unite">kWh</span>
                      <span className="precision">
                        sur {nombre(totalJours, 0)} jours suivis
                      </span>
                    </dd>
                  </div>
                </dl>
                <p className="chapo" style={{ fontSize: '0.86rem' }}>
                  La moyenne par jour est la seule grandeur comparable d’une période à l’autre :
                  deux semaines et deux mois ne donnent évidemment pas le même total.
                </p>
              </div>
            )}

            <div className="carte">
              <h2>Consommation entre deux relevés</h2>
              <Graphique periodes={periodes} debutDefi={etat.defi?.dateDebut ?? null} />
              <div style={{ marginTop: 16 }}>
                <TablePeriodes periodes={periodes} mediane={mediane} />
              </div>
            </div>

            {etat.releves.length > 0 && (
              <div className="carte">
                <h2>Relevés saisis</h2>
                <TableReleves
                  releves={etat.releves}
                  idEnEdition={enEdition}
                  onModifier={(r) => {
                    setEnEdition(r.id)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  onSupprimer={supprimerReleve}
                />
                <div className="rangee-boutons">
                  {confirmerEffacement ? (
                    <>
                      <button type="button" className="btn btn-danger" onClick={toutEffacer}>
                        Confirmer l’effacement de tout
                      </button>
                      <button
                        type="button"
                        className="btn btn-discret"
                        onClick={() => setConfirmerEffacement(false)}
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-discret"
                      onClick={() => setConfirmerEffacement(true)}
                    >
                      Effacer toutes mes données
                    </button>
                  )}
                </div>
              </div>
            )}

            {etat.releves.length === 0 && !etat.demo && (
              <div className="carte vide">
                <p>
                  Pas encore de relevé. Tu peux aussi charger un jeu de démonstration pour voir
                  à quoi ressemble l’application une fois remplie.
                </p>
                <div className="rangee-boutons" style={{ justifyContent: 'center', marginTop: 14 }}>
                  <button type="button" className="btn" onClick={chargerJeuDemo}>
                    Charger des données de démonstration
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {vue === 'defis' && (
          <Defis
            defi={etat.defi}
            periodes={periodes}
            aujourdhui={aujourdhui}
            onDemarrer={(defiId, dateDebut) => {
              setEtat((p) => ({ ...p, defi: { defiId, dateDebut } }))
              setAnnonce('Défi démarré.')
            }}
            onTerminer={(dateFin) => {
              setEtat((p) => (p.defi ? { ...p, defi: { ...p.defi, dateFin } } : p))
              setAnnonce('Défi terminé.')
            }}
            onArreter={() => {
              setEtat((p) => ({ ...p, defi: null }))
              setAnnonce('Défi arrêté. Tu peux en choisir un autre.')
            }}
          />
        )}

        {vue === 'climat' && <Climat />}
      </main>

      <footer className="pied">
        <p>
          Aucun compte, aucune donnée envoyée sur internet. Tes {trierReleves(etat.releves).length}{' '}
          relevés restent dans ce navigateur, sur cet appareil.
        </p>
      </footer>
    </div>
  )
}
