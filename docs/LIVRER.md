# Livrer un site quand tu n'y connais rien

Un client vient de dire oui. Voici exactement quoi faire. Compte **4 à 6 heures**
pour ton premier site, **2 heures** au cinquième.

---

## Avant de commencer : encaisser l'acompte

Jamais une ligne de travail avant l'acompte de 40 %. Ce n'est pas de la méfiance,
c'est ce qui filtre les clients sérieux.

- **Stripe** (stripe.com) → *Produits → Créer un lien de paiement*. Aucun code.
  Tu envoies un lien, il paie par carte. Commission ~1,5 % + 0,25 €.
- **Ou virement** avec une facture simple (Facture.net ou Henrri, gratuits).

Sur 890 € : **356 € encaissés avant d'avoir commencé.**

---

## Étape 1 — Récupérer les informations (30 min)

Envoie ce message, mot pour mot :

```
Parfait, c'est lancé ! Pour aller vite, j'ai besoin de :

1. Vos horaires exacts (jours de fermeture compris)
2. Téléphone + adresse tels que vous voulez les voir affichés
3. 5 à 10 photos : devanture, intérieur, vos produits
   (celles de votre téléphone suffisent très bien)
4. Votre logo si vous en avez un
5. En trois phrases : ce qui fait que les gens viennent chez vous
   plutôt qu'ailleurs

Envoyez-moi tout par WhatsApp, c'est le plus simple.
Dès que j'ai ça, vous avez le site sous 5 jours.
```

**Le point 5 est le plus important.** C'est ce qui fait la différence entre un
site générique et un site qui vend. Si la réponse est vague, appelle-le et
fais-le parler cinq minutes : il te donnera des phrases bien meilleures que
tout ce que tu pourrais inventer.

---

## Étape 2 — Construire (2 à 3 h)

1. Duplique le dossier du projet.
2. Pars de `index.html` et remplace les textes.
3. Modifie les **3 variables de couleur** en haut de `assets/css/style.css` :

   ```css
   --brand:        #d97706;   /* la couleur principale */
   --brand-strong: #b45309;   /* la même, en plus foncé */
   --brand-soft:   #fef3c7;   /* la même, très claire */
   ```

   Prends la couleur de son logo ou de sa devanture.
   [coolors.co](https://coolors.co) génère les variantes en un clic.

4. **Les photos.** Compresse-les sur [squoosh.app](https://squoosh.app),
   vise moins de 300 Ko chacune. C'est l'erreur n°1 des débutants : un site
   lent à cause de photos de 8 Mo sorties d'un iPhone.

5. **Les textes.** Structure qui marche, dans cet ordre :
   - Ce qu'il fait + où (« Boulangerie artisanale à Levallois depuis 1987 »)
   - Pourquoi lui et pas un autre (ses trois phrases de l'étape 1)
   - Ce qu'on peut faire : appeler, venir, commander
   - Horaires, plan, téléphone — **visibles sans scroller sur mobile**

> **Écris comme lui, pas comme une agence.** « On fait notre pain sur place
> tous les matins » vaut cent fois mieux que « une expertise artisanale
> d'excellence au service de votre satisfaction ».

---

## Étape 3 — Mettre en ligne (30 min)

**La méthode gratuite (GitHub Pages)**
1. Nouveau dépôt public sur github.com, nom = celui du client.
2. Glisse-dépose les fichiers dans le navigateur.
3. *Settings → Pages → branche `main`* → en ligne en 2 minutes.

**Le nom de domaine (~12 €/an, chez OVH ou Gandi)**
- Achète-le **au nom du client** — c'est une promesse de ta page de vente,
  et c'est ce qui te distingue des agences qui prennent les sites en otage.
- Dans les DNS, ajoute 4 enregistrements A : `185.199.108.153`,
  `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- Dans *Settings → Pages → Custom domain*, saisis le domaine, coche
  *Enforce HTTPS*. Compte 1 h de propagation.

**Ta marge réelle sur une formule Essentiel : 890 − 12 = 878 €.**

---

## Étape 4 — La fiche Google Business (20 min, énorme valeur perçue)

[business.google.com](https://business.google.com) — gratuit.
Souvent, c'est ce qui rapporte le plus de clients à ton client, plus que le site.

- Revendiquer ou créer la fiche
- Catégorie exacte, horaires, téléphone, **lien vers le nouveau site**
- Ajouter les mêmes photos
- Lui montrer comment répondre aux avis

Cette étape prend 20 minutes et vaut à elle seule ton tarif aux yeux du client.

---

## Étape 5 — Livrer et encaisser le solde

```
C'est en ligne : [lien]

Regardez-le sur votre téléphone, c'est là que vos clients le verront.
Notez tout ce que vous voulez changer et envoyez-moi la liste
en une fois — je fais les corrections dans la foulée.

La facture du solde est en pièce jointe.
```

**Puis, tout de suite, les deux choses qui font la vraie différence :**

1. **Proposer l'abonnement Sérénité (59 €/mois).**
   > « Pour que le site reste à jour, je propose un suivi à 59 €/mois :
   > l'hébergement, les sauvegardes, et une modification par mois quand
   > vous changez vos horaires ou vos produits. Sans engagement. »

   Environ un client sur deux dit oui. **C'est ce qui transforme un
   travail de freelance en revenu qui tombe tous les mois.**

2. **Demander une recommandation.**
   > « Content que ça vous plaise ! Vous connaissez un autre commerçant
   > du quartier à qui ça rendrait service ? »

   C'est comme ça que le mois 3 devient plus facile que le mois 1.

---

## Les erreurs qui coûtent cher

| Erreur | Conséquence |
|---|---|
| Commencer sans acompte | Tu travailles gratuitement, ça arrivera une fois |
| Corrections illimitées non cadrées | Le client à 890 € te mange trois semaines |
| Photos non compressées | Site lent, client déçu, mauvaise réputation |
| Promettre « premier sur Google » | Promesse intenable, client furieux à 3 mois |
| Domaine à ton nom | Tu deviens ce que tu dénonces dans ta page de vente |
| Oublier de proposer l'abonnement | Tu laisses 700 €/an sur la table, à chaque client |
