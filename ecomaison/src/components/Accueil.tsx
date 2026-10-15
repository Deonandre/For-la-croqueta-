import type { Periode } from '../types'
import { nombre } from '../lib/format'

interface Props {
  nbReleves: number
  moyenne: number | null
  periodes: readonly Periode[]
  demo: boolean
  onAllerAuxReleves: () => void
  onChargerDemo: () => void
}

export function Accueil({
  nbReleves,
  moyenne,
  periodes,
  demo,
  onAllerAuxReleves,
  onChargerDemo,
}: Props) {
  return (
    <>
      <div className="carte">
        <p className="etiquette">Projet d’ESS · Thème 6 · Atmosphère et changement climatique</p>
        <h1>Suivre l’électricité de chez soi, et tester un geste</h1>
        <p className="chapo">
          ÉcoMaison sert à mesurer la consommation électrique d’un logement à partir des relevés
          du compteur, puis à observer ce qui change quand on modifie une habitude. Tout tient
          en trois opérations : noter l’index du compteur, laisser passer quelques jours, noter
          à nouveau.
        </p>

        <div className="encadre">
          <h3>Comment ça marche</h3>
          <ol className="prose" style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              Tu relèves le nombre affiché sur ton compteur électrique et tu le saisis ici, avec
              la date. L’application ne lit aucun compteur toute seule : la saisie est manuelle.
            </li>
            <li>
              Entre deux relevés, elle calcule la consommation de la période, puis une moyenne
              en kWh par jour. Cette moyenne permet de comparer des périodes de durées
              différentes, ce que les totaux bruts ne permettent pas.
            </li>
            <li>
              Tu choisis un défi, par exemple éteindre les appareils en veille, et tu continues
              à relever. L’application compare la période d’avant à celle d’après.
            </li>
          </ol>
        </div>

        <div className="encadre prudence">
          <h3>Ce que l’application ne fait pas</h3>
          <p>
            Elle ne compare jamais ton foyer à un autre : un logement de 30 m² et une maison de
            150 m² n’ont aucune raison de consommer pareil, et le classement n’apprendrait rien.
            Chaque foyer n’est comparé qu’à lui-même. Elle ne demande aucun compte, aucun nom,
            aucune adresse, et tout reste dans ton navigateur.
          </p>
        </div>
      </div>

      {nbReleves > 0 ? (
        <div className="carte">
          <h2>Où tu en es</h2>
          <dl className="chiffres">
            <div className="chiffre">
              <dt>Relevés saisis</dt>
              <dd className="num">{nbReleves}</dd>
            </div>
            <div className="chiffre">
              <dt>Périodes calculées</dt>
              <dd className="num">{periodes.length}</dd>
            </div>
            <div className="chiffre">
              <dt>Moyenne générale</dt>
              <dd className="num">
                {moyenne === null ? '—' : nombre(moyenne)}
                <span className="unite">kWh/jour</span>
              </dd>
            </div>
          </dl>
          <div className="rangee-boutons">
            <button type="button" className="btn btn-principal" onClick={onAllerAuxReleves}>
              Voir et compléter mes relevés
            </button>
          </div>
        </div>
      ) : (
        <div className="carte">
          <h2>Commencer</h2>
          <p className="chapo">
            Deux relevés suffisent pour obtenir une première mesure. Si tu veux d’abord voir à
            quoi ressemble l’application remplie, charge le jeu de démonstration : il est
            clairement signalé et s’efface en un clic.
          </p>
          <div className="rangee-boutons">
            <button type="button" className="btn btn-principal" onClick={onAllerAuxReleves}>
              Saisir mon premier relevé
            </button>
            {!demo && (
              <button type="button" className="btn" onClick={onChargerDemo}>
                Charger des données de démonstration
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
