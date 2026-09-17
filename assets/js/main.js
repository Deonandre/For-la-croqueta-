/* ==========================================================================
   main.js — injection de la config, formulaire, garde-fous
   Ne nécessite aucune modification. Tout se règle dans config.js.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.CROQUETA || {};
  var manquants = [];

  function val(chemin) {
    return chemin.split(".").reduce(function (o, k) {
      return (o && o[k] !== undefined) ? o[k] : "";
    }, C);
  }

  /* --- 1. Injection du texte : <span data-cfg="marque"></span> ---------- */
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var v = val(el.getAttribute("data-cfg"));
    if (v) {
      el.textContent = v;
    } else {
      el.textContent = "[" + el.getAttribute("data-cfg") + " — à remplir dans config.js]";
      el.style.background = "#fee2e2";
      el.style.color = "#991b1b";
      el.style.padding = "0 5px";
      el.style.borderRadius = "4px";
      if (manquants.indexOf(el.getAttribute("data-cfg")) === -1) {
        manquants.push(el.getAttribute("data-cfg"));
      }
    }
  });

  /* --- 2. Injection des liens : <a data-href="email"> ------------------- */
  document.querySelectorAll("[data-href]").forEach(function (el) {
    var cle = el.getAttribute("data-href");
    var v = val(cle);
    if (!v) {
      // Pas encore configuré : le lien ne doit pas mener dans le vide.
      el.setAttribute("href", "#contact");
      el.setAttribute("title", "Configure « " + cle + " » dans assets/js/config.js");
      if (manquants.indexOf(cle) === -1) manquants.push(cle);
      return;
    }
    if (cle === "email")          el.setAttribute("href", "mailto:" + v);
    else if (cle === "telephone") el.setAttribute("href", "tel:" + v.replace(/\s/g, ""));
    else if (cle === "whatsapp")  el.setAttribute("href", "https://wa.me/" + v);
    else                          el.setAttribute("href", v);
  });

  /* --- 3. Année du copyright ------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* --- 4. Formulaire de contact ---------------------------------------- */
  var form = document.getElementById("devis-form");
  if (form) {
    var msg = document.getElementById("form-msg");

    function afficher(texte, type) {
      if (!msg) return;
      msg.textContent = texte;
      msg.className = "form-msg show " + type;
      msg.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Anti-spam : champ caché que seuls les robots remplissent.
      if (form.querySelector('input[name="_gotcha"]').value) return;

      var endpoint = C.formspree;
      if (!endpoint) {
        afficher(
          "Le formulaire n'est pas encore relié. Ouvre assets/js/config.js et " +
          "renseigne « formspree » (compte gratuit sur formspree.io).",
          "err"
        );
        return;
      }

      var bouton = form.querySelector('button[type="submit"]');
      var texteInitial = bouton.textContent;
      bouton.disabled = true;
      bouton.textContent = "Envoi…";

      fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          window.location.href = "merci.html";
        })
        .catch(function () {
          afficher(
            "L'envoi a échoué. Écris-moi directement à " + (C.email || "l'adresse en bas de page") + ".",
            "err"
          );
          bouton.disabled = false;
          bouton.textContent = texteInitial;
        });
    });
  }

  /* --- 5. Boutons de paiement Stripe ------------------------------------ */
  document.querySelectorAll("[data-stripe]").forEach(function (el) {
    var lien = val("stripe." + el.getAttribute("data-stripe"));
    if (lien) {
      el.setAttribute("href", lien);
      el.textContent = "Réserver ma place";
    }
    // Sinon : le bouton garde son texte et pointe vers #contact (par défaut
    // dans le HTML). C'est le bon comportement tant que Stripe n'est pas prêt :
    // on récupère la demande, on facture ensuite.
  });

  /* --- 6. Rappel de configuration (visible uniquement en local) --------- */
  if (manquants.length && /^(localhost|127\.0\.0\.1|)$/.test(location.hostname)) {
    console.warn(
      "⚠️ Croqueta — à configurer dans assets/js/config.js : " + manquants.join(", ")
    );
  }
})();
