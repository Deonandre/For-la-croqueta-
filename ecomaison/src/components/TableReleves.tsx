import { useState } from 'react'
import type { Releve } from '../types'
import { formatJour } from '../lib/dates'
import { entier } from '../lib/format'
import { trierReleves } from '../lib/releves'

interface Props {
  releves: readonly Releve[]
  idEnEdition: string | null
  onModifier: (releve: Releve) => void
  onSupprimer: (releve: Releve) => void
}

/** Liste des relevés saisis, avec modification et suppression. */
export function TableReleves({ releves, idEnEdition, onModifier, onSupprimer }: Props) {
  const [aConfirmer, setAConfirmer] = useState<string | null>(null)
  const tries = trierReleves(releves)

  if (tries.length === 0) return null

  return (
    <div className="table-defilante">
      <table>
        <caption className="invisible">
          Relevés de compteur saisis, du plus ancien au plus récent
        </caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col" className="nombre">
              Index du compteur
            </th>
            <th scope="col">
              <span className="invisible">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tries.map((r) => {
            const enCours = r.id === idEnEdition
            const confirmation = aConfirmer === r.id
            return (
              <tr key={r.id}>
                <td>
                  {formatJour(r.date)}
                  {enCours && <span className="note-ligne">en cours de modification</span>}
                  {r.note && <span className="note-ligne">{r.note}</span>}
                </td>
                <td className="nombre">
                  {entier(r.index)} <abbr title="kilowattheures">kWh</abbr>
                </td>
                <td>
                  {confirmation ? (
                    <div className="actions-cellule">
                      <button
                        type="button"
                        className="btn btn-petit btn-danger"
                        onClick={() => {
                          setAConfirmer(null)
                          onSupprimer(r)
                        }}
                      >
                        Confirmer
                        <span className="invisible"> la suppression du relevé du {r.date}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-petit btn-discret"
                        onClick={() => setAConfirmer(null)}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="actions-cellule">
                      <button
                        type="button"
                        className="btn btn-petit"
                        onClick={() => onModifier(r)}
                      >
                        Modifier
                        <span className="invisible"> le relevé du {r.date}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-petit btn-discret"
                        onClick={() => setAConfirmer(r.id)}
                      >
                        Supprimer
                        <span className="invisible"> le relevé du {r.date}</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
