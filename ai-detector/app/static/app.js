"use strict";

const I18N = {
  fr: {
    tagline: "Détecteur d'écriture IA pour les travaux du BI (IA, mémoire, TdC)",
    tab_paste: "Coller le texte",
    tab_upload: "Importer un fichier",
    placeholder: "Collez ici l'évaluation interne, le mémoire (Extended Essay) ou l'essai de TdC…",
    drop_title: "Déposez un fichier ou cliquez pour choisir",
    drop_hint: ".docx, .pdf ou .txt, jusqu'à 15 Mo",
    privacy: "Le texte est analysé puis oublié : rien n'est enregistré.",
    analyze: "Analyser",
    analyzing: "Analyse…",
    words: (n) => `${n.toLocaleString("fr-FR")} mots`,
    result: "Résultat",
    passages: "Passages signalés",
    no_passages: "Aucun passage signalé.",
    sections: "Par section",
    new: "Nouvelle analyse",
    print: "Imprimer / PDF",
    disclaimer: "Un résultat est une probabilité, pas une preuve. Servez-vous-en pour ouvrir une discussion avec l'élève (par ex. lors d'une séance de réflexion), jamais comme seule preuve.",
    label_ai: "Généré par IA",
    label_rephrased: "Reformulé par IA",
    label_human: "Humain",
    label_excluded: "Non analysé",
    verdict: {
      human: "Aucun passage signalé",
      mostly_human: "Principalement humain, quelques passages à vérifier",
      mixed: "Texte mixte : plusieurs passages signalés",
      mostly_ai: "Majoritairement généré par IA",
      mostly_rephrased: "Majoritairement reformulé par IA",
      insufficient: "Texte trop court pour un résultat fiable",
    },
    confidence: { high: "confiance élevée", medium: "confiance moyenne", low: "confiance faible" },
    meta: (w, s, lang, conf) => `${w.toLocaleString("fr-FR")} mots, dont ${s.toLocaleString("fr-FR")} analysés · ${lang === "fr" ? "français" : "anglais"} · ${conf}`,
    warnings: {
      short_text: "Texte court : les résultats sont moins fiables en dessous de 150 mots analysés.",
      excluded_regions: "Titres, citations, tableaux, bibliographie et annexes ne sont pas analysés (en gris).",
      baseline_model: "Modèle de base (TF-IDF) : moins précis que le modèle principal.",
    },
    kinds: {
      heading: "Titre", toc: "Table des matières", bibliography: "Bibliographie", appendix: "Annexe",
      reference: "Référence", quote: "Citation", table: "Tableau / données", caption: "Légende",
      equation: "Équation", other: "Non analysé",
    },
    no_section: "Sans titre",
    errors: {
      no_model: "Le modèle n'est pas encore entraîné sur ce serveur.",
      empty_text: "Collez un texte ou choisissez un fichier.",
      text_too_long: "Texte trop long (maximum ~20 000 mots).",
      unsupported_file: "Format non pris en charge : utilisez .docx, .pdf ou .txt.",
      file_too_large: "Fichier trop volumineux (15 Mo maximum).",
      unreadable_file: "Impossible de lire ce fichier.",
      network: "Le serveur ne répond pas.",
    },
    preview_note: "Aperçu : le modèle n'est pas encore entraîné, donc l'analyse de vos propres textes n'est pas encore disponible. Cliquez sur « Voir l'exemple » pour explorer l'interface.",
    see_example: "Voir l'exemple",
    demo_banner: "Démonstration : exemple fictif pour présenter l'interface, pas une vraie analyse.",
    words_short: (n) => `${n} mots`,
  },
  en: {
    tagline: "AI-writing detector for IB work (IA, Extended Essay, TOK)",
    tab_paste: "Paste text",
    tab_upload: "Upload a file",
    placeholder: "Paste the Internal Assessment, Extended Essay or TOK essay here…",
    drop_title: "Drop a file or click to choose",
    drop_hint: ".docx, .pdf or .txt, up to 15 MB",
    privacy: "Text is analysed and then forgotten: nothing is stored.",
    analyze: "Analyse",
    analyzing: "Analysing…",
    words: (n) => `${n.toLocaleString("en-GB")} words`,
    result: "Result",
    passages: "Flagged passages",
    no_passages: "No passages flagged.",
    sections: "By section",
    new: "New analysis",
    print: "Print / PDF",
    disclaimer: "A result is a probability, not proof. Use it to start a conversation with the student (for example in a reflection session), never as the only evidence.",
    label_ai: "AI-generated",
    label_rephrased: "AI-rephrased",
    label_human: "Human",
    label_excluded: "Not analysed",
    verdict: {
      human: "No passages flagged",
      mostly_human: "Mostly human, a few passages to check",
      mixed: "Mixed text: several passages flagged",
      mostly_ai: "Mostly AI-generated",
      mostly_rephrased: "Mostly AI-rephrased",
      insufficient: "Too short for a reliable result",
    },
    confidence: { high: "high confidence", medium: "medium confidence", low: "low confidence" },
    meta: (w, s, lang, conf) => `${w.toLocaleString("en-GB")} words, ${s.toLocaleString("en-GB")} analysed · ${lang === "fr" ? "French" : "English"} · ${conf}`,
    warnings: {
      short_text: "Short text: results are less reliable below 150 analysed words.",
      excluded_regions: "Headings, quotations, tables, bibliography and appendices are not analysed (shown in grey).",
      baseline_model: "Baseline (TF-IDF) model: less accurate than the main model.",
    },
    kinds: {
      heading: "Heading", toc: "Table of contents", bibliography: "Bibliography", appendix: "Appendix",
      reference: "Reference", quote: "Quotation", table: "Table / data", caption: "Caption",
      equation: "Equation", other: "Not analysed",
    },
    no_section: "Untitled",
    errors: {
      no_model: "The model has not been trained on this server yet.",
      empty_text: "Paste a text or choose a file.",
      text_too_long: "Text too long (about 20,000 words maximum).",
      unsupported_file: "Unsupported format: use .docx, .pdf or .txt.",
      file_too_large: "File too large (15 MB maximum).",
      unreadable_file: "This file could not be read.",
      network: "The server is not responding.",
    },
    preview_note: "Preview: the model is not trained yet, so analysing your own texts is not available yet. Click \u201cSee the example\u201d to explore the interface.",
    see_example: "See the example",
    demo_banner: "Demo: a made-up example to show the interface, not a real analysis.",
    words_short: (n) => `${n} words`,
  },
};

const $ = (id) => document.getElementById(id);
const PREVIEW = window.PLUME_PREVIEW || null; // static page with an embedded demo and no server
const state = { lang: "fr", tab: "paste", file: null, result: null, demo: false };

function t(key) { return I18N[state.lang][key]; }

function pickLang() {
  let saved = null;
  try { saved = localStorage.getItem("plume.lang"); } catch (_) {}
  state.lang = saved || ((navigator.language || "fr").startsWith("fr") ? "fr" : "en");
}

function applyI18n() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll(".lang-switch button").forEach((b) => b.classList.toggle("active", b.dataset.lang === state.lang));
  updateCounter();
  if (state.result) renderResult(state.result);
}

function updateCounter() {
  const n = ($("text").value.match(/\w+/g) || []).length;
  $("counter").textContent = state.tab === "paste" ? t("words")(n) : "";
}

function showError(code) {
  const el = $("error");
  if (!code) { el.hidden = true; return; }
  el.textContent = t("errors")[code] || code;
  el.hidden = false;
}

// ------------------------------------------------------------------ input
document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
  state.tab = tab.dataset.tab;
  document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === tab));
  document.querySelectorAll(".tab-panel").forEach((p) => { p.hidden = p.dataset.panel !== state.tab; });
  updateCounter();
}));

$("text").addEventListener("input", updateCounter);

function setFile(f) {
  state.file = f;
  $("file-name").textContent = f ? f.name : "";
}
$("file").addEventListener("change", (e) => setFile(e.target.files[0] || null));
const drop = $("drop");
["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", (e) => { if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); });

document.querySelectorAll(".lang-switch button").forEach((b) => b.addEventListener("click", () => {
  state.lang = b.dataset.lang;
  try { localStorage.setItem("plume.lang", state.lang); } catch (_) {}
  applyI18n();
}));

$("analyze").addEventListener("click", async () => {
  showError(null);
  if (PREVIEW) return showResult(PREVIEW.demo);
  let req;
  if (state.tab === "paste") {
    const text = $("text").value;
    if (!text.trim()) return showError("empty_text");
    req = fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
  } else {
    if (!state.file) return showError("empty_text");
    const fd = new FormData();
    fd.append("file", state.file);
    req = fetch("/api/analyze-file", { method: "POST", body: fd });
  }
  const btn = $("analyze");
  btn.disabled = true;
  btn.textContent = t("analyzing");
  try {
    const res = await req;
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return showError(body.detail || "network");
    showResult(body);
  } catch (_) {
    showError("network");
  } finally {
    btn.disabled = false;
    btn.textContent = t("analyze");
  }
});

$("new").addEventListener("click", () => {
  state.result = null;
  $("result-view").hidden = true;
  $("input-view").hidden = false;
  window.scrollTo({ top: 0 });
});
$("print").addEventListener("click", () => window.print());

// ------------------------------------------------------------------ results
const COLORS = { ai: "var(--ai)", rephrased: "var(--reph)", human: "var(--human)" };

function pct(x) { return `${Math.round(x * 100)}%`; }

function stackBar(el, fr) {
  el.innerHTML = "";
  for (const k of ["ai", "rephrased", "human"]) {
    if (!fr[k]) continue;
    const s = document.createElement("span");
    s.style.width = `${fr[k] * 100}%`;
    s.style.background = `rgb(${COLORS[k]})`;
    el.appendChild(s);
  }
}

function showResult(res) {
  state.result = res;
  $("input-view").hidden = true;
  $("result-view").hidden = false;
  renderResult(res);
  window.scrollTo({ top: 0 });
}

function renderResult(res) {
  const s = res.summary;
  $("verdict").textContent = t("verdict")[s.verdict];
  stackBar($("stack"), s);
  $("meta").textContent = t("meta")(res.word_count, res.scored_word_count, res.language, t("confidence")[s.confidence]);

  const legend = $("legend");
  legend.innerHTML = "";
  for (const k of ["ai", "rephrased", "human"]) {
    const li = document.createElement("li");
    const toggle = k === "human" ? "" : `<input type="checkbox" checked data-toggle="${k}">`;
    li.innerHTML = `<label>${toggle}<span class="swatch sw-${k}"></span><span>${t("label_" + k)}</span></label><span class="pct">${pct(s[k])}</span>`;
    legend.appendChild(li);
  }
  legend.querySelectorAll("input[data-toggle]").forEach((cb) => cb.addEventListener("change", () => {
    $("document").classList.toggle(`hide-${cb.dataset.toggle}`, !cb.checked);
  }));

  const warns = $("warnings");
  warns.innerHTML = "";
  for (const w of res.warnings) {
    const li = document.createElement("li");
    li.textContent = t("warnings")[w] || w;
    warns.appendChild(li);
  }

  renderDocument(res);
  renderPassages(res);
  renderSections(res);
}

function renderDocument(res) {
  const doc = $("document");
  doc.innerHTML = "";
  doc.className = "card document";
  const text = res.text;
  let pos = 0;
  res.segments.forEach((seg, i) => {
    if (seg.start > pos) doc.appendChild(document.createTextNode(text.slice(pos, seg.start)));
    const span = document.createElement("span");
    span.textContent = text.slice(seg.start, seg.end);
    span.dataset.i = i;
    if (seg.kind === "sentence") {
      span.className = `seg ${seg.label}`;
      if (seg.label !== "human") span.style.setProperty("--a", (0.18 + 0.4 * seg.probs[seg.label]).toFixed(2));
    } else {
      span.className = "seg excluded";
    }
    doc.appendChild(span);
    pos = seg.end;
  });
  if (pos < text.length) doc.appendChild(document.createTextNode(text.slice(pos)));
}

function renderPassages(res) {
  const ol = $("passages");
  ol.innerHTML = "";
  if (!res.passages.length) {
    ol.innerHTML = `<li class="muted" style="cursor:default">${t("no_passages")}</li>`;
    return;
  }
  const sorted = [...res.passages].sort((a, b) => b.confidence - a.confidence);
  for (const p of sorted) {
    const li = document.createElement("li");
    const excerpt = res.text.slice(p.start, p.end).replace(/\s+/g, " ");
    li.innerHTML = `<div class="row"><span class="chip"><span class="swatch sw-${p.label}"></span>${t("label_" + p.label)}</span><span>${pct(p.confidence)}</span></div>
      <div class="excerpt"></div><div class="muted">${t("words_short")(p.words)}</div>`;
    li.querySelector(".excerpt").textContent = excerpt;
    li.addEventListener("click", () => {
      const el = [...document.querySelectorAll(".document .seg")].find((s) => res.segments[s.dataset.i].start === p.start);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
    });
    ol.appendChild(li);
  }
}

function renderSections(res) {
  const ul = $("sections");
  ul.innerHTML = "";
  const secs = res.sections.filter((s) => s.words > 0);
  $("sections-card").hidden = secs.length < 2;
  for (const s of secs) {
    const li = document.createElement("li");
    li.innerHTML = `<div class="title"><span></span><span class="muted">${pct(s.ai + s.rephrased)}</span></div><div class="stack"></div>`;
    li.querySelector(".title span").textContent = s.title || t("no_section");
    stackBar(li.querySelector(".stack"), s);
    ul.appendChild(li);
  }
}

// ------------------------------------------------------------------ popover
const pop = $("pop");
function showPop(span, x, y) {
  const seg = state.result.segments[span.dataset.i];
  if (seg.kind !== "sentence") {
    pop.innerHTML = `<strong>${t("label_excluded")}</strong><br>${t("kinds")[seg.kind] || seg.kind}`;
  } else {
    const rows = ["ai", "rephrased", "human"].map((k) => `<div class="bar"><span>${t("label_" + k)}</span>
      <span class="track"><span class="fill" style="display:block;width:${seg.probs[k] * 100}%;background:rgb(${COLORS[k]})"></span></span>
      <span class="pv">${pct(seg.probs[k])}</span></div>`).join("");
    const section = seg.section ? `<div style="opacity:.7;margin-bottom:4px"></div>` : "";
    pop.innerHTML = `<strong>${t("label_" + seg.label)}</strong>${section}${rows}`;
    if (seg.section) pop.querySelector("div").textContent = seg.section;
  }
  pop.hidden = false;
  const r = pop.getBoundingClientRect();
  pop.style.left = `${Math.min(x + 14, window.innerWidth - r.width - 10)}px`;
  pop.style.top = `${y + 18 + r.height > window.innerHeight ? y - r.height - 12 : y + 18}px`;
}
$("document").addEventListener("mousemove", (e) => {
  const span = e.target.closest(".seg");
  if (!span) { pop.hidden = true; return; }
  showPop(span, e.clientX, e.clientY);
});
$("document").addEventListener("mouseleave", () => { pop.hidden = true; });
$("document").addEventListener("click", (e) => {
  const span = e.target.closest(".seg");
  if (span && matchMedia("(hover: none)").matches) showPop(span, e.clientX, e.clientY);
});

// ------------------------------------------------------------------ boot
pickLang();
if (PREVIEW) {
  document.body.classList.add("preview");
  const note = document.createElement("p");
  note.className = "preview-note";
  note.dataset.i18n = "preview_note";
  $("input-view").before(note);
  $("analyze").dataset.i18n = "see_example";
  $("demo-banner").hidden = false;
}
applyI18n();
if (PREVIEW) showResult(PREVIEW.demo);
if (new URLSearchParams(location.search).has("demo")) {
  state.demo = true;
  $("demo-banner").hidden = false;
  fetch("/static/demo.json").then((r) => r.json()).then(showResult);
}
