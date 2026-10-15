import { useEffect, useId, useRef, useState } from 'react'
import type { Periode } from '../types'
import { formatJourCourt } from '../lib/dates'
import { nombre } from '../lib/format'

interface Props {
  periodes: readonly Periode[]
  /** Date de début du défi en cours, marquée d'un trait vertical. */
  debutDefi?: string | null
}

const HAUTEUR = 280
const LARGEUR_MIN = 280
const LARGEUR_MAX = 760
const MARGE = { gauche: 46, droite: 12, haut: 20, bas: 52 }
/** Place disponible estimée pour une étiquette de date, en pixels. */
const PLACE_ETIQUETTE = 74

/** Arrondit le haut de l'axe à une valeur lisible, toujours supérieure au maximum. */
function hautDAxe(max: number): number {
  if (max <= 0) return 1
  const cible = max * 1.05
  const exposant = Math.pow(10, Math.floor(Math.log10(cible)))
  for (const m of [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8]) {
    if (m * exposant >= cible) return m * exposant
  }
  return 10 * exposant
}

/**
 * Consommation journalière moyenne de chaque période, en barres.
 *
 * Le dessin est tracé à la taille réelle de son conteneur plutôt que dans un
 * repère fixe qu'on étirerait ensuite : sur un téléphone, une mise à l'échelle
 * rendrait les dates et les graduations trop petites pour être lues.
 *
 * Le tableau qui accompagne ce graphique porte exactement les mêmes nombres :
 * il reste la source accessible pour qui ne peut pas voir le dessin.
 */
export function Graphique({ periodes, debutDefi }: Props) {
  const idTitre = useId()
  const idDesc = useId()
  const conteneur = useRef<HTMLDivElement>(null)
  const [largeur, setLargeur] = useState(640)

  useEffect(() => {
    const element = conteneur.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observateur = new ResizeObserver((entrees) => {
      const mesure = entrees[0]?.contentRect.width
      if (mesure) {
        setLargeur(Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, Math.round(mesure))))
      }
    })
    observateur.observe(element)
    return () => observateur.disconnect()
  }, [])

  if (periodes.length === 0) {
    return (
      <p className="chapo">
        Le graphique apparaîtra dès que tu auras saisi deux relevés : il faut deux dates pour
        calculer une consommation.
      </p>
    )
  }

  const plotL = largeur - MARGE.gauche - MARGE.droite
  const plotH = HAUTEUR - MARGE.haut - MARGE.bas
  const baseY = MARGE.haut + plotH

  const valeurs = periodes.map((p) => Math.max(0, p.kwhParJour))
  const max = Math.max(...valeurs)
  const sommet = hautDAxe(max)
  const largeurCase = plotL / periodes.length
  const largeurBarre = Math.min(largeurCase * 0.66, 46)

  const graduations = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    valeur: sommet * f,
    y: baseY - f * plotH,
  }))

  // Le nombre d'étiquettes s'adapte à la largeur : mieux vaut trois dates lisibles
  // que neuf dates qui se chevauchent.
  const etiquettesTenables = Math.max(2, Math.floor(plotL / PLACE_ETIQUETTE))
  const pas = Math.ceil(periodes.length / etiquettesTenables)

  const indexDefi = debutDefi ? periodes.findIndex((p) => p.debut.date >= debutDefi) : -1
  const xDefi = indexDefi > 0 ? MARGE.gauche + largeurCase * indexDefi : null

  const resume =
    `Consommation journalière moyenne sur ${periodes.length} ` +
    `${periodes.length > 1 ? 'périodes' : 'période'}, ` +
    `de ${nombre(Math.min(...valeurs))} à ${nombre(max)} kWh par jour. ` +
    `Première période du ${periodes[0].debut.date} au ${periodes[0].fin.date}, ` +
    `dernière jusqu’au ${periodes[periodes.length - 1].fin.date}. ` +
    `Les valeurs exactes figurent dans le tableau qui suit.`

  return (
    <div ref={conteneur}>
      <svg
        className="graphique"
        width={largeur}
        height={HAUTEUR}
        viewBox={`0 0 ${largeur} ${HAUTEUR}`}
        role="img"
        aria-labelledby={`${idTitre} ${idDesc}`}
      >
        <title id={idTitre}>Consommation journalière moyenne entre deux relevés</title>
        <desc id={idDesc}>{resume}</desc>

        {graduations.map((g) => (
          <g key={g.y}>
            <line
              x1={MARGE.gauche}
              x2={largeur - MARGE.droite}
              y1={g.y}
              y2={g.y}
              stroke="var(--trait)"
              strokeWidth={1}
            />
            <text
              x={MARGE.gauche - 8}
              y={g.y + 4}
              textAnchor="end"
              fontSize={12}
              fill="var(--encre-3)"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {nombre(g.valeur, sommet < 5 ? 1 : 0)}
            </text>
          </g>
        ))}

        <text
          x={MARGE.gauche - 8}
          y={MARGE.haut - 7}
          textAnchor="end"
          fontSize={12}
          fill="var(--encre-2)"
          fontWeight={600}
        >
          kWh/j
        </text>

        {periodes.map((p, i) => {
          const hauteur = sommet > 0 ? (valeurs[i] / sommet) * plotH : 0
          const centre = MARGE.gauche + largeurCase * (i + 0.5)
          const afficherEtiquette = i % pas === 0 || i === periodes.length - 1
          return (
            <g key={p.fin.id}>
              <rect
                x={centre - largeurBarre / 2}
                y={baseY - hauteur}
                width={largeurBarre}
                height={Math.max(hauteur, 1)}
                rx={3}
                fill="var(--accent)"
              >
                <title>
                  {`Du ${p.debut.date} au ${p.fin.date} : ${nombre(p.kwhParJour)} kWh par jour`}
                </title>
              </rect>
              {afficherEtiquette && (
                <text
                  x={centre}
                  y={baseY + 19}
                  textAnchor="middle"
                  fontSize={12}
                  fill="var(--encre-3)"
                >
                  {formatJourCourt(p.fin.date)}
                </text>
              )}
            </g>
          )
        })}

        <line
          x1={MARGE.gauche}
          x2={largeur - MARGE.droite}
          y1={baseY}
          y2={baseY}
          stroke="var(--encre-3)"
          strokeWidth={1.5}
        />

        {xDefi !== null && (
          <g>
            <line
              x1={xDefi}
              x2={xDefi}
              y1={MARGE.haut}
              y2={baseY}
              stroke="var(--signal)"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
            <text
              x={xDefi > largeur * 0.6 ? xDefi - 7 : xDefi + 7}
              y={MARGE.haut + 11}
              textAnchor={xDefi > largeur * 0.6 ? 'end' : 'start'}
              fontSize={12}
              fontWeight={600}
              fill="var(--signal)"
            >
              début du défi
            </text>
          </g>
        )}

        <text
          x={MARGE.gauche + plotL / 2}
          y={HAUTEUR - 12}
          textAnchor="middle"
          fontSize={12}
          fill="var(--encre-3)"
        >
          date de fin de période
        </text>
      </svg>

      <p className="legende">
        <span>
          <i style={{ background: 'var(--accent)' }} aria-hidden="true" />
          Consommation moyenne par jour
        </span>
        {xDefi !== null && (
          <span>
            <i
              style={{ background: 'transparent', borderTop: '3px dashed var(--signal)' }}
              aria-hidden="true"
            />
            Début du défi
          </span>
        )}
      </p>
    </div>
  )
}
