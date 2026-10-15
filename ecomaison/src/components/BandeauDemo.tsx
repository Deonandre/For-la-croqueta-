interface Props {
  onEffacer: () => void
}

/** Rappel permanent que les chiffres affichés sont inventés. */
export function BandeauDemo({ onEffacer }: Props) {
  return (
    <div className="bandeau-demo" role="status">
      <p>
        <strong>Données de démonstration.</strong> Ces relevés sont inventés pour montrer le
        fonctionnement de l’application. Ils ne viennent d’aucun logement réel et ne doivent
        pas figurer comme résultats dans un rapport.
      </p>
      <button type="button" className="btn btn-petit" onClick={onEffacer}>
        Effacer et saisir mes propres relevés
      </button>
    </div>
  )
}
