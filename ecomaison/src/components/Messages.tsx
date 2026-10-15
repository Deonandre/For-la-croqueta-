import type { Anomalie } from '../types'

interface Props {
  anomalies: readonly Anomalie[]
  /** « alert » interrompt le lecteur d'écran, « status » attend une pause. */
  role?: 'alert' | 'status'
  id?: string
}

/** Liste de messages de validation, lisible à l'œil comme au lecteur d'écran. */
export function Messages({ anomalies, role = 'status', id }: Props) {
  if (anomalies.length === 0) return null
  return (
    <div className="messages" role={role} id={id}>
      {anomalies.map((a, i) => (
        <p
          key={`${a.gravite}-${i}`}
          className={`message ${a.gravite === 'erreur' ? 'message-erreur' : 'message-alerte'}`}
        >
          <span className="pastille" aria-hidden="true">
            {a.gravite === 'erreur' ? '✕' : '!'}
          </span>
          <span>
            <span className="invisible">{a.gravite === 'erreur' ? 'Erreur : ' : 'À vérifier : '}</span>
            {a.message}
          </span>
        </p>
      ))}
    </div>
  )
}
