export function Climat() {
  return (
    <>
      <div className="carte">
        <p className="etiquette">Thème 6 · Atmosphère et changement climatique</p>
        <h2>De la prise de courant au climat</h2>
        <div className="prose">
          <p>
            L’électricité n’existe pas telle quelle dans la nature : il faut la produire. Une
            partie de la production mondiale vient de la combustion de charbon, de gaz ou de
            fioul. Brûler ces combustibles libère du dioxyde de carbone, qui s’ajoute à
            l’atmosphère.
          </p>
          <p>
            Le CO<sub>2</sub> est un gaz à effet de serre : il laisse passer le rayonnement
            solaire qui arrive, mais absorbe une partie du rayonnement infrarouge que la Terre
            réémet vers l’espace. Plus sa concentration augmente, plus la quantité d’énergie
            retenue dans le système climatique s’élève. C’est le forçage radiatif, et c’est le
            mécanisme central du réchauffement observé.
          </p>
          <p>
            Chaque kilowattheure que ton foyer ne consomme pas est un kilowattheure qu’il n’a
            pas fallu produire. C’est ce qu’on appelle la sobriété, et c’est l’un des leviers
            d’atténuation du changement climatique : il agit sur la cause, en amont, plutôt que
            sur les conséquences.
          </p>
        </div>
      </div>

      <div className="carte">
        <h2>Pourquoi cette application n’affiche aucun chiffre de CO₂</h2>
        <div className="prose">
          <p>
            Convertir des kilowattheures en kilogrammes de CO<sub>2</sub> demande un{' '}
            <strong>facteur d’émission</strong> : la quantité de gaz à effet de serre émise pour
            produire un kilowattheure. Afficher un tel chiffre serait facile. Il serait aussi
            très probablement faux, pour trois raisons.
          </p>
          <ul>
            <li>
              <strong>Il dépend du pays.</strong> Un réseau alimenté surtout au charbon et un
              réseau alimenté surtout par le nucléaire et l’hydraulique n’ont pas du tout le même
              facteur. L’application ne sait pas où tu habites, et ne te le demandera pas.
            </li>
            <li>
              <strong>Il dépend du moment.</strong> Le mélange de sources change d’heure en
              heure selon la demande, le vent et l’ensoleillement. Une moyenne annuelle masque
              ces variations, qui sont parfois d’un facteur important.
            </li>
            <li>
              <strong>Il dépend de la méthode.</strong> Certains facteurs ne comptent que la
              combustion ; d’autres intègrent la construction des centrales, l’extraction du
              combustible et le démantèlement. Les valeurs obtenues ne sont pas comparables
              entre elles.
            </li>
          </ul>
          <p>
            Donner un nombre sans dire lequel de ces facteurs a été utilisé, c’est produire une
            fausse précision. Mieux vaut un kilowattheure mesuré honnêtement qu’un kilogramme de
            CO<sub>2</sub> inventé.
          </p>
        </div>

        <div className="encadre">
          <h3>Comment faire la conversion toi-même, proprement</h3>
          <div className="prose">
            <p>
              Va chercher un facteur d’émission à une source primaire, note sa valeur, son unité,
              son année et sa méthode, puis fais la multiplication dans ton rapport en citant
              cette source. Trois références reconnues :
            </p>
            <ul>
              <li>
                <strong>RTE, éCO₂mix</strong> — l’intensité carbone de l’électricité en France,
                mesurée en direct et consultable heure par heure.
              </li>
              <li>
                <strong>ADEME, Base Empreinte</strong> — la base de facteurs d’émission de
                référence en France, avec la méthode documentée pour chaque valeur.
              </li>
              <li>
                <strong>Agence internationale de l’énergie</strong> — pour comparer l’intensité
                carbone entre plusieurs pays.
              </li>
            </ul>
            <p>
              Expliquer <em>pourquoi</em> tu as retenu ce facteur-là vaut mieux, dans une
              évaluation, que le chiffre lui-même.
            </p>
          </div>
        </div>
      </div>

      <div className="carte">
        <h2>Pistes pour aller plus loin dans ton rapport</h2>
        <div className="prose">
          <ul>
            <li>
              <strong>L’heure compte autant que la quantité.</strong> Réduire sa consommation
              pendant une pointe de demande évite souvent de faire tourner les moyens de
              production les plus émetteurs, qui sont appelés en dernier. Le même kilowattheure
              économisé n’a donc pas le même effet selon le moment de la journée.
            </li>
            <li>
              <strong>L’électricité n’est pas toute l’empreinte d’un logement.</strong> Le
              chauffage au gaz, les déplacements et l’alimentation pèsent souvent davantage.
              Dire ce que ta mesure ne couvre pas fait partie du travail.
            </li>
            <li>
              <strong>L’effet rebond.</strong> Une économie réalisée quelque part est parfois
              dépensée ailleurs. C’est un objet d’étude classique en économie de
              l’environnement, directement mobilisable au niveau supérieur.
            </li>
            <li>
              <strong>Qui peut agir ?</strong> Un locataire ne choisit ni son isolation ni son
              mode de chauffage. La question de la répartition de l’effort entre ménages,
              propriétaires et pouvoirs publics relève de l’analyse éthique et politique du
              thème.
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
