import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Anomalie, Releve } from '../types'
import { lireNombre } from '../lib/format'
import { nouvelId, validerReleve } from '../lib/releves'
import { Messages } from './Messages'

interface Props {
  releves: readonly Releve[]
  /** Relevé en cours de modification, ou null pour une nouvelle saisie. */
  releveEnEdition: Releve | null
  aujourdhui: string
  onEnregistrer: (releve: Releve, modification: boolean) => void
  onAnnulerEdition: () => void
}

/**
 * Saisie d'un relevé.
 *
 * Les erreurs bloquent l'enregistrement : elles décrivent des situations impossibles.
 * Les alertes demandent une seconde validation : la valeur est surprenante, mais ce
 * n'est pas à l'application de décider si le foyer est hors norme ou si la main a ripé.
 */
export function FormulaireReleve({
  releves,
  releveEnEdition,
  aujourdhui,
  onEnregistrer,
  onAnnulerEdition,
}: Props) {
  const idBase = useId()
  const idDate = `${idBase}-date`
  const idIndex = `${idBase}-index`
  const idNote = `${idBase}-note`
  const idAideIndex = `${idBase}-aide-index`
  const idMessages = `${idBase}-messages`

  const champDate = useRef<HTMLInputElement>(null)

  const [date, setDate] = useState(aujourdhui)
  const [indexTexte, setIndexTexte] = useState('')
  const [note, setNote] = useState('')
  const [tentative, setTentative] = useState(false)
  const [alertesAcceptees, setAlertesAcceptees] = useState(false)

  const modification = releveEnEdition !== null

  useEffect(() => {
    if (releveEnEdition) {
      setDate(releveEnEdition.date)
      setIndexTexte(String(releveEnEdition.index).replace('.', ','))
      setNote(releveEnEdition.note ?? '')
      champDate.current?.focus()
    } else {
      setDate(aujourdhui)
      setIndexTexte('')
      setNote('')
    }
    setTentative(false)
    setAlertesAcceptees(false)
  }, [releveEnEdition, aujourdhui])

  const valeurIndex = lireNombre(indexTexte)

  const anomalies: Anomalie[] = useMemo(
    () =>
      validerReleve(
        { date, index: valeurIndex },
        releves,
        releveEnEdition?.id,
        aujourdhui,
      ),
    [date, valeurIndex, releves, releveEnEdition, aujourdhui],
  )

  const erreurs = anomalies.filter((a) => a.gravite === 'erreur')
  const alertes = anomalies.filter((a) => a.gravite === 'alerte')
  const aMontrer = tentative ? anomalies : []

  function changer(setter: (v: string) => void) {
    return (valeur: string) => {
      setter(valeur)
      // Toute modification remet en jeu la confirmation d'une valeur surprenante.
      setAlertesAcceptees(false)
    }
  }

  function soumettre(evenement: React.FormEvent) {
    evenement.preventDefault()
    setTentative(true)
    if (erreurs.length > 0 || valeurIndex === null) return
    if (alertes.length > 0 && !alertesAcceptees) {
      setAlertesAcceptees(true)
      return
    }
    onEnregistrer(
      {
        id: releveEnEdition?.id ?? nouvelId(),
        date,
        index: valeurIndex,
        note: note.trim() === '' ? undefined : note.trim(),
      },
      modification,
    )
    setTentative(false)
    setAlertesAcceptees(false)
    if (!modification) {
      setIndexTexte('')
      setNote('')
      champDate.current?.focus()
    }
  }

  const dateInvalide = tentative && erreurs.some((e) => /date/i.test(e.message))
  const indexInvalide =
    tentative && erreurs.some((e) => /compteur|index|kWh/i.test(e.message))

  return (
    <form onSubmit={soumettre} noValidate>
      <h3>{modification ? 'Modifier ce relevé' : 'Ajouter un relevé'}</h3>

      <div className="champs">
        <div className="champ">
          <label htmlFor={idDate}>Date du relevé</label>
          <input
            ref={champDate}
            id={idDate}
            type="date"
            value={date}
            max={aujourdhui}
            required
            aria-invalid={dateInvalide || undefined}
            aria-describedby={aMontrer.length > 0 ? idMessages : undefined}
            onChange={(e) => changer(setDate)(e.target.value)}
          />
        </div>

        <div className="champ">
          <label htmlFor={idIndex}>Index du compteur, en kWh</label>
          <input
            id={idIndex}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={indexTexte}
            placeholder="46 702"
            required
            aria-invalid={indexInvalide || undefined}
            aria-describedby={`${idAideIndex}${aMontrer.length > 0 ? ` ${idMessages}` : ''}`}
            onChange={(e) => changer(setIndexTexte)(e.target.value)}
          />
          <span className="aide" id={idAideIndex}>
            Recopie le nombre total affiché sur le compteur, pas une consommation.
          </span>
        </div>
      </div>

      <div className="champ" style={{ marginTop: 14 }}>
        <label htmlFor={idNote}>Remarque, facultative</label>
        <input
          id={idNote}
          type="text"
          autoComplete="off"
          value={note}
          placeholder="Absence une semaine, invités, retour de vacances…"
          onChange={(e) => changer(setNote)(e.target.value)}
        />
        <span className="aide">
          Ce qui sort de l’ordinaire pendant la période. Ces notes serviront à expliquer les
          écarts dans ton rapport.
        </span>
      </div>

      <div style={{ marginTop: 14 }}>
        <Messages anomalies={aMontrer} role="alert" id={idMessages} />
      </div>

      {alertesAcceptees && erreurs.length === 0 && (
        <p className="message message-alerte" style={{ marginTop: 10 }}>
          <span className="pastille" aria-hidden="true">
            ?
          </span>
          <span>
            Si cette valeur est bien celle que tu as lue, enregistre-la : une consommation
            inhabituelle est une donnée, pas une erreur. Décris simplement la cause dans la
            remarque.
          </span>
        </p>
      )}

      <div className="rangee-boutons" style={{ marginTop: 16 }}>
        <button type="submit" className="btn btn-principal">
          {alertesAcceptees && erreurs.length === 0
            ? 'Enregistrer quand même'
            : modification
              ? 'Enregistrer les modifications'
              : 'Ajouter ce relevé'}
        </button>
        {modification && (
          <button type="button" className="btn" onClick={onAnnulerEdition}>
            Annuler la modification
          </button>
        )}
      </div>
    </form>
  )
}
