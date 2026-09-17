# Croqueta Studio — business en ligne prêt à lancer

Site web + offre + tarifs + documents juridiques + méthode de vente.
Tout est là. Il manque une seule chose, et elle ne peut pas être automatisée :
**parler à des commerçants.**

---

## D'abord, la vérité sur les 50 000 €/semaine

50 000 €/semaine = **2,6 millions d'euros par an**. Pour situer :

| Ce que ça représente | Réalité |
|---|---|
| 2,6 M€/an de CA | Le top 0,01 % des entrepreneurs |
| Depuis zéro expérience, en quelques semaines | **Jamais arrivé à personne, nulle part** |
| Ce que promettent les formations à 2 000 € | Le produit vendu, c'est l'espoir — pas le résultat |

Une règle simple : **quiconque te promet 50 000 €/semaine rapidement te vend
quelque chose.** Le seul « business » qui atteint ce chiffre depuis zéro, c'est
celui qui consiste à vendre ce rêve à des gens comme toi. C'est aussi celui qui
finit devant la DGCCRF.

**Ce qui est réellement atteignable**, avec du travail sérieux et ce dépôt :

| Échéance | Revenu mensuel réaliste | Ce que ça demande |
|---|---|---|
| Mois 1 | 0 – 900 € | Trouver le tout premier client |
| Mois 3 | 2 000 – 5 000 € | 2-3 sites/mois + premiers abonnements |
| Mois 6 | 5 000 – 9 000 € | Bouche-à-oreille + ~15 abonnements |
| Mois 12 | 10 000 – 15 000 € | 4-6 sites/mois + ~40 abonnements |
| Au-delà | 20 000 €+ | Tu recrutes : ce n'est plus toi qui produis |

10 000 €/mois au bout d'un an, c'est **excellent**. Beaucoup n'y arrivent pas.
Ceux qui y arrivent ont tous fait la même chose : contacter des gens, tous les jours.

---

## Pourquoi ce business et pas un autre

Tu as zéro expérience et probablement peu de capital. Comparons honnêtement :

| Business | Capital de départ | Premier euro | Le vrai problème |
|---|---|---|---|
| Dropshipping | 1 500 – 3 000 € de pub | 1-3 mois | Marge ~10 %, tu finances Meta avant toi-même |
| Trading / crypto | Ton épargne | — | Ce n'est pas un business, c'est un pari |
| Print on demand | 300 € | 2-4 mois | Marché saturé, 4 € de marge par t-shirt |
| SaaS | 0 € mais 6 mois | 6-12 mois | Il faut savoir coder |
| Contenu / YouTube | 0 € | 12-18 mois | Le temps, et rien ne garantit l'audience |
| **Site web pour commerçants** | **~100 €** | **7-30 jours** | **Il faut décrocher son téléphone** |

Le dernier gagne sur les critères qui comptent quand on part de rien :
tu encaisses **avant** de produire (acompte de 40 %), la marge est proche de
**100 %** (tu vends ton temps, pas du stock), le client est **local et joignable**,
et tu peux apprendre le métier en livrant le premier.

Son défaut est réel : **ça ne marche que si tu prospectes.** Aucun site, aussi
beau soit-il, ne fait sonner le téléphone tout seul les trois premiers mois.

---

## Contenu du dépôt

```
index.html               Page de vente principale — l'offre complète
merci.html               Confirmation après envoi du formulaire
mentions-legales.html    Obligatoire en France (LCEN)
cgv.html                 Conditions de vente : te protège en cas de litige
confidentialite.html     RGPD — le site ne pose aucun cookie
assets/js/config.js      ⭐ LE SEUL FICHIER À MODIFIER
assets/css/style.css     Design (mode clair et sombre automatiques)
assets/js/main.js        Formulaire, injection de la config
robots.txt, sitemap.xml  Référencement
docs/DEMARRAGE.md        ⭐ Tes 7 premiers jours, heure par heure
docs/PROSPECTION.md      ⭐ Les scripts exacts : mail, téléphone, visite
docs/LIVRER.md           Comment livrer un site quand tu n'y connais rien
docs/PLAN-90-JOURS.md    Objectifs chiffrés semaine par semaine
archive/valentine.html   Ton ancienne page, conservée
```

---

## Mise en ligne (15 minutes, gratuit)

1. **Ouvre `assets/js/config.js`** et remplis les champs vides.
   Tant qu'un champ manque, le site l'affiche en rouge : impossible d'oublier.
2. **Crée un formulaire gratuit** sur [formspree.io](https://formspree.io),
   colle l'URL dans `config.js` → `formspree`.
3. **Active GitHub Pages** : dans ce dépôt, *Settings → Pages → Source : branche
   `main`, dossier `/root` → Save*. Ton site est en ligne 2 minutes plus tard sur
   `https://deonandre.github.io/For-la-croqueta-/`.
4. **Un vrai nom de domaine** (optionnel, ~12 €/an chez OVH ou Gandi) fait une
   grosse différence en crédibilité. `Settings → Pages → Custom domain`.
5. **Déclare ta micro-entreprise** — gratuit, 20 minutes, en ligne :
   [formalites.entreprises.gouv.fr](https://formalites.entreprises.gouv.fr).
   Tu reçois ton SIRET sous 1 à 3 semaines. **Tu peux prospecter avant de l'avoir**,
   mais pas encaisser.

Pour tester en local avant de publier :

```bash
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

---

## Et maintenant ?

Le site ne te rapportera pas un euro cette semaine. **Ta prospection, oui.**

➡️ Ouvre **[docs/DEMARRAGE.md](docs/DEMARRAGE.md)** et fais le jour 1 aujourd'hui.

Une seule habitude sépare ceux qui réussissent des autres :
**20 commerçants contactés par jour, tous les jours ouvrés.**
Fais-le pendant 30 jours et tu auras des clients. Ne le fais pas et rien de ce
dépôt n'aura d'importance.
