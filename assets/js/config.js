/* ==========================================================================
   CONFIG — LE SEUL FICHIER QUE TU DOIS MODIFIER POUR DÉMARRER
   Remplace chaque valeur entre guillemets par les tiennes.
   Tout ce qui vaut "" affiche un avertissement visible sur le site tant que
   ce n'est pas rempli : impossible d'oublier quelque chose.
   ========================================================================== */

window.CROQUETA = {

  /* --- 1. IDENTITÉ ------------------------------------------------------ */
  marque:   "Croqueta Studio",
  baseline: "Sites web pour commerçants et artisans",
  ville:    "Paris",            // ta ville : sert au SEO local et à la crédibilité
  zone:     "Paris et Île-de-France",

  /* --- 2. CONTACT (obligatoire) ----------------------------------------- */
  email:     "",                // ex : "contact@croqueta-studio.fr"
  telephone: "",                // ex : "+33 6 12 34 56 78"
  whatsapp:  "",                // numéro international sans espaces ni +, ex : "33612345678"
  calendly:  "",                // ex : "https://calendly.com/ton-compte/30min" (gratuit)

  /* --- 3. RÉCEPTION DES DEMANDES (obligatoire) -------------------------- */
  // Crée un compte gratuit sur https://formspree.io, crée un formulaire,
  // copie l'URL "endpoint" ici. 50 demandes/mois gratuites.
  formspree: "",                // ex : "https://formspree.io/f/xdorzabc"

  /* --- 4. PAIEMENT (à faire dès le 1er client) -------------------------- */
  // Stripe → Produits → Créer un lien de paiement. Aucun code nécessaire.
  // Mets ici le lien de l'ACOMPTE de 40 % pour chaque formule.
  stripe: {
    essentiel: "",              // ex : "https://buy.stripe.com/xxxxx"
    pro:       "",
    premium:   "",
    maintenance: ""
  },

  /* --- 5. MENTIONS LÉGALES (obligatoire en France) ---------------------- */
  legal: {
    nom:     "",                // ton prénom NOM ou la raison sociale
    statut:  "Entrepreneur individuel (micro-entreprise)",
    siret:   "",                // obtenu gratuitement sur formalites.entreprises.gouv.fr
    adresse: "",                // adresse de l'entreprise
    tva:     "TVA non applicable, art. 293 B du CGI",
    hebergeur: "GitHub Pages — GitHub Inc., 88 Colin P. Kelly Jr. St, San Francisco, CA 94107, USA"
  },

  /* --- 6. SITE ---------------------------------------------------------- */
  url: "https://deonandre.github.io/For-la-croqueta-/"   // ton URL une fois en ligne
};
