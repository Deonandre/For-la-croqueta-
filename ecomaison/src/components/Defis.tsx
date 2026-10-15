import { useId, useState } from 'react'
import type { DefiEnCours, Periode } from '../types'
import { DEFIS, comparerDefi, trouverDefi } from '../lib/defis'
import { formatJour } from '../lib/dates'
import { entier, jours as formatJours, nombre, signe } from '../lib/format'

interface Props {
  defi: DefiEnCours | null
  periodes: readonly Periode[]
  aujourdhui: string
  onDemarrer: (defiId: string, dateDebut: string) => void
  onTerminer: (dateFin: string) => void
  onArreter: () => void
}

export function Defis({
  defi,
  periodes,
  aujourdhui,
  onDemarrer,
  onTerminer,
  onArreter,
}: Props) {
  const idBase = useId()
  const [choix, setChoix] = useState<string>(DEFIS[0].id)
  const [dateDebut, setDateDebut] = useState<string>(aujourdhui)

  if (!defi) {
    return (
      <div className="carte">
        <h2>Choisir un défi</h2>
        <p className="chapo">
          Un défi, c’est un geste précis que tu tiens pendant plusieurs semaines. Plus la
          consigne est précise, plus tu pourras la décrire dans ton rapport et plus quelqu’un
          d’autre pourra la reproduire.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onDemarrer(choix, dateDebut)
          }}
        >
          <fieldset>
            <legend>Quel geste veux-tu essayer ?</legend>
            <div className="liste-defis">
              {DEFIS.map((d) => (
                <label className="choix-defi" key={d.id} htmlFor={`${idBase}-${d.id}`}>
                  <input
                    type="radio"
                    id={`${idBase}-${d.id}`}
                    name={`${idBase}-defi`}
                    value={d.id}
                    checked={choix === d.id}
                    onChange={() => setChoix(d.id)}
                  />
                  <span>
                    <span className="nom-defi">{d.nom}</span>
                    <span className="desc-defi">{d.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="champ" style={{ marginTop: 16, maxWidth: 260 }}>
            <label htmlFor={`${idBase}-debut`}>À partir de quelle date ?</label>
            <input
              id={`${idBase}-debut`}
              type="date"
              value={dateDebut}
              max={aujourdhui}
              onChange={(e) => setDateDebut(e.target.value)}
            />
            <span className="aide">
              Idéalement le jour d’un relevé : une période à cheval sur cette date ne pourra
              être comptée ni avant ni après.
            </span>
          </div>

          <div className="rangee-boutons" style={{ marginTop: 16 }}>
            <button type="submit" className="btn btn-principal">
              Démarrer ce défi
            </button>
          </div>
        </form>
      </div>
    )
  }

  const descriptif = trouverDefi(defi.defiId)
  const comparaison = comparerDefi(periodes, defi)
  const baisse = comparaison.difference !== null && comparaison.difference < 0

  return (
    <>
      <div className="carte">
        <p className="etiquette">Défi en cours</p>
        <h2>{descriptif?.nom ?? 'Défi'}</h2>
        {descriptif && <p className="chapo">{descriptif.description}</p>}
        <p className="chapo">
          Démarré le {formatJour(defi.dateDebut)}
          {defi.dateFin ? `, terminé le ${formatJour(defi.dateFin)}.` : ', toujours en cours.'}
        </p>
        {descriptif && (
          <div className="encadre">
            <h3>Pour que la mesure tienne la route</h3>
            <p>{descriptif.conseil}</p>
          </div>
        )}
        <div className="rangee-boutons">
          {!defi.dateFin && (
            <button type="button" className="btn" onClick={() => onTerminer(aujourdhui)}>
              Terminer le défi aujourd’hui
            </button>
          )}
          <button type="button" className="btn btn-discret" onClick={onArreter}>
            Changer de défi
          </button>
        </div>
      </div>

      <div className="carte">
        <h2>Avant et pendant</h2>

        {!comparaison.comparable ? (
          <div className="encadre prudence">
            <h3>Pas encore de comparaison</h3>
            <p>{comparaison.message}</p>
          </div>
        ) : (
          <div className="resultat-defi">
            <p className="etiquette">Écart de consommation journalière</p>
            <p className={`ecart ${baisse ? 'ecart-baisse' : 'ecart-hausse'}`}>
              {signe(comparaison.difference ?? 0, 2)}
              <span style={{ fontSize: '0.45em', marginLeft: 6 }}>kWh/jour</span>
            </p>
            <p className="chapo">
              {baisse ? 'Baisse' : 'Hausse'} de{' '}
              {comparaison.pourcentage === null
                ? '—'
                : `${nombre(Math.abs(comparaison.pourcentage), 1)} %`}{' '}
              par rapport à la période précédant le défi.
            </p>

            <dl className="comparaison">
              <div className="chiffre">
                <dt>Avant le défi</dt>
                <dd className="num">
                  {nombre(comparaison.avant!.kwhParJour, 2)}
                  <span className="unite">kWh/jour</span>
                  <span className="precision">
                    {formatJours(comparaison.avant!.jours)}, {entier(comparaison.avant!.kwh)} kWh,{' '}
                    {comparaison.avant!.periodes}{' '}
                    {comparaison.avant!.periodes > 1 ? 'périodes' : 'période'}
                  </span>
                </dd>
              </div>
              <div className="chiffre">
                <dt>Pendant le défi</dt>
                <dd className="num">
                  {nombre(comparaison.apres!.kwhParJour, 2)}
                  <span className="unite">kWh/jour</span>
                  <span className="precision">
                    {formatJours(comparaison.apres!.jours)}, {entier(comparaison.apres!.kwh)} kWh,{' '}
                    {comparaison.apres!.periodes}{' '}
                    {comparaison.apres!.periodes > 1 ? 'périodes' : 'période'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        )}

        {comparaison.periodesACheval > 0 && (
          <p className="message message-alerte">
            <span className="pastille" aria-hidden="true">
              !
            </span>
            <span>
              {comparaison.periodesACheval}{' '}
              {comparaison.periodesACheval > 1 ? 'périodes sont écartées' : 'période est écartée'}{' '}
              du calcul : elle chevauche la date de début du défi et mélangerait les deux
              comportements.
            </span>
          </p>
        )}

        <div className="encadre prudence">
          <h3>Ce que cet écart prouve, et ce qu’il ne prouve pas</h3>
          <p>
            Une baisse observée ne démontre pas, à elle seule, que le défi en est la cause.
            D’autres choses ont changé en même temps : la température extérieure, la durée du
            jour, le nombre de personnes présentes, les vacances scolaires, un appareil tombé en
            panne ou remplacé.
          </p>
          <p style={{ marginTop: 10 }}>
            Il n’y a ici ni groupe témoin ni tirage au sort : c’est une observation avant-après
            sur un seul foyer. Pour renforcer la conclusion, tu peux comparer à la même période
            de l’année précédente, noter les températures extérieures jour par jour, ou arrêter
            le geste pendant quelques semaines et regarder si la consommation remonte.
          </p>
        </div>
      </div>
    </>
  )
}
