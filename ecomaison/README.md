# ÉcoMaison

Application web de suivi de la consommation électrique d’un foyer, écrite pour un projet
d’**ESS (Systèmes environnementaux et sociétés), thème 6 : atmosphère et changement
climatique**.

L’élève relève l’index de son compteur à la main, l’application calcule la consommation entre
deux relevés, puis compare la période précédant un geste de sobriété à celle qui le suit.

## Démarrer

Il faut **Node.js 20 ou plus récent** (vérifier avec `node -v`).

```bash
cd ecomaison
npm install      # une seule fois
npm run dev      # démarre le serveur de développement
```

Le terminal affiche une adresse du type `http://localhost:5173/`. Ouvre-la dans un navigateur.
Pour tester sur un téléphone connecté au même réseau Wi-Fi : `npm run dev -- --host`, puis
ouvre l’adresse « Network » affichée.

Pour produire une version autonome, à déposer sur n’importe quel hébergement de fichiers :

```bash
npm run build     # écrit le site dans dist/
npm run preview   # sert dist/ en local pour vérifier avant publication
```

## Vérifications

```bash
npm run verifier   # typecheck + lint + tests + build, dans cet ordre
```

Ou séparément :

| Commande | Rôle |
| --- | --- |
| `npm run typecheck` | contrôle des types TypeScript |
| `npm run lint` | ESLint |
| `npm test` | 73 tests unitaires sur la logique de calcul |
| `npm run build` | compilation de production |

Les tests portent sur ce qui peut se tromper silencieusement : écarts de dates au passage à
l’heure d’été, moyenne pondérée par la durée, détection des relevés incohérents, découpage des
périodes autour de la date de début d’un défi, lecture des nombres saisis avec une virgule ou
des espaces.

## Organisation du code

```
src/
  types.ts              types du domaine : relevé, période, défi
  lib/
    dates.ts            écarts de dates en UTC, formatage français
    releves.ts          périodes, moyennes, validation des relevés
    defis.ts            catalogue des gestes, comparaison avant/après
    format.ts           lecture et affichage des nombres en français
    demo.ts             jeu de démonstration
    stockage.ts         persistance dans le navigateur
    __tests__/          tests unitaires
  components/           un fichier par bloc d’interface
  App.tsx               état de l’application et navigation
  index.css             jetons de couleur et styles, thèmes clair et sombre
```

## Données

Tout est conservé dans le `localStorage` du navigateur, sous la clé `ecomaison.v1`. Aucun
compte, aucun serveur, aucune donnée personnelle : rien ne quitte l’appareil. Le bouton
« Effacer toutes mes données » supprime définitivement le contenu de cette clé.

Un foyer n’est jamais comparé à un autre foyer, seulement à ses propres relevés antérieurs.

## Limites scientifiques

Ces limites sont à reprendre explicitement dans le rapport : les énoncer fait partie du
travail attendu au niveau supérieur.

**Une baisse observée ne prouve pas que le défi en est la cause.** Le dispositif est une
observation avant-après sur un seul foyer, sans groupe témoin ni tirage au sort. Entre les deux
périodes, d’autres choses ont changé : la température extérieure, la durée du jour, le nombre
de personnes présentes, les vacances scolaires, un appareil remplacé ou tombé en panne. Le jeu
de démonstration fourni illustre volontairement ce piège : la consommation baisse après le
début du défi, mais l’hiver se termine au même moment.

**La saison est le facteur de confusion principal** dans un logement chauffé à l’électricité.
Pour le réduire : comparer à la même période de l’année précédente, relever les températures
extérieures jour par jour, ou arrêter le geste pendant quelques semaines et observer si la
consommation remonte.

**Les périodes à cheval sur la date de début du défi sont écartées du calcul**, puisqu’elles
mélangeraient les deux comportements. L’application indique combien de périodes sont ainsi
exclues.

**La moyenne journalière lisse les variations internes à une période.** Deux semaines à 10 kWh
par jour et deux semaines alternant 2 et 18 kWh par jour donnent la même moyenne. Des relevés
plus fréquents donnent une image plus fine.

**Aucun chiffre d’émissions de CO₂ n’est affiché.** Convertir des kilowattheures en kilogrammes
de CO₂ exige un facteur d’émission, qui dépend du pays, de l’heure et de la méthode de calcul.
Afficher un nombre sans préciser lequel de ces facteurs a été retenu produirait une fausse
précision. L’application explique où trouver un facteur fiable (RTE éCO₂mix, Base Empreinte de
l’ADEME, Agence internationale de l’énergie) et laisse l’élève faire la conversion en citant sa
source.

**Le compteur mesure l’électricité, pas l’empreinte du logement.** Le chauffage au gaz, les
déplacements et l’alimentation en sont absents.

**La précision de lecture est limitée.** Un index se lit au kilowattheure entier ; sur une
période courte, l’erreur d’arrondi pèse proportionnellement plus lourd. C’est l’une des raisons
pour lesquelles l’application signale les périodes très courtes comme les très longues.

## Rattachement au programme

- **6.1** — effet de serre, forçage radiatif, bilan énergétique : section « Climat ».
- **6.2** — origine des émissions liées à la production d’électricité, variabilité du mix.
- **6.3** — atténuation par la sobriété, effet rebond, répartition de l’effort entre ménages,
  propriétaires et pouvoirs publics.
