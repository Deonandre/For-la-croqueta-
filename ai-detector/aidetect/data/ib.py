"""IB task descriptions and the prompts used to generate AI training text, in French and English.

Variety is the point: many personas, styles, temperatures and generator models, so the detector
learns what AI writing has in common rather than one model's habits. Word counts are only rough
targets for generation, not official IB limits.
"""

from __future__ import annotations

import random

TASKS = {
    "ee": {"en": "IB Extended Essay", "fr": "mémoire (Extended Essay) du Baccalauréat International"},
    "tok": {"en": "IB Theory of Knowledge essay", "fr": "essai de Théorie de la connaissance (TdC) du Baccalauréat International"},
    "ia": {"en": "IB Internal Assessment", "fr": "évaluation interne (IA) du Baccalauréat International"},
}

SUBJECTS = [
    ("biology", "Biology", "Biologie"),
    ("chemistry", "Chemistry", "Chimie"),
    ("physics", "Physics", "Physique"),
    ("mathematics", "Mathematics (exploration)", "Mathématiques (exploration)"),
    ("history", "History (historical investigation)", "Histoire (enquête historique)"),
    ("economics", "Economics", "Économie"),
    ("geography", "Geography (fieldwork)", "Géographie (travail sur le terrain)"),
    ("psychology", "Psychology", "Psychologie"),
    ("business", "Business Management", "Gestion des entreprises"),
    ("literature", "Language A: Literature", "Langue A : littérature"),
    ("philosophy", "Philosophy", "Philosophie"),
    ("computer_science", "Computer Science", "Informatique"),
    ("visual_arts", "Visual Arts", "Arts visuels"),
    ("global_politics", "Global Politics", "Politique mondiale"),
    ("ess", "Environmental Systems and Societies", "Systèmes de l'environnement et sociétés"),
    ("world_studies", "World Studies", "Études sur le monde contemporain"),
]

PERSONAS = {
    "en": [
        "a 17-year-old IB Diploma student",
        "a hard-working IB student who is a non-native English speaker",
        "a strong IB student aiming for a 7",
        "an average IB student writing under time pressure",
        "an IB student who is passionate about the topic",
    ],
    "fr": [
        "un élève de 17 ans en Programme du diplôme du BI",
        "une élève sérieuse du BI dont le français est la langue seconde",
        "un très bon élève du BI qui vise la note maximale",
        "une élève moyenne du BI qui rédige dans l'urgence",
        "un élève du BI passionné par son sujet",
    ],
}

PLAIN = {
    "en": "Write plain text only: no markdown, no bullet points, no title, no commentary before or after.",
    "fr": "Écris uniquement du texte brut : pas de markdown, pas de listes à puces, pas de titre, aucun commentaire avant ou après.",
}

REPHRASE_STYLES = {
    "paraphrase": {
        "en": "Paraphrase the following passage so that it says the same thing in different words.",
        "fr": "Paraphrase le passage suivant pour qu'il dise la même chose avec d'autres mots.",
    },
    "academic": {
        "en": "Rewrite the following passage to make it sound more academic and sophisticated.",
        "fr": "Réécris le passage suivant pour qu'il soit plus académique et plus soutenu.",
    },
    "humanize": {
        "en": "Rewrite the following passage so that it sounds natural and human-written and would not be flagged by an AI detector. Vary sentence length.",
        "fr": "Réécris le passage suivant pour qu'il paraisse naturel, écrit par un humain, et qu'il ne soit pas détecté par un détecteur d'IA. Varie la longueur des phrases.",
    },
    "simplify": {
        "en": "Rewrite the following passage in simpler, clearer language.",
        "fr": "Réécris le passage suivant dans une langue plus simple et plus claire.",
    },
    "concise": {
        "en": "Make the following passage more concise without losing any idea.",
        "fr": "Rends le passage suivant plus concis sans perdre aucune idée.",
    },
    "improve": {
        "en": "Improve the following passage from my IB essay: fix the flow, the vocabulary and the structure.",
        "fr": "Améliore le passage suivant de mon travail du BI : fluidité, vocabulaire et structure.",
    },
}


def _subject_name(subject: str, lang: str) -> str:
    for key, en, fr in SUBJECTS:
        if key == subject:
            return fr if lang == "fr" else en
    return subject


def random_task(rng: random.Random) -> tuple[str, str]:
    task = rng.choice(["ee", "ee", "ia", "ia", "tok"])
    subject = "tok" if task == "tok" else rng.choice(SUBJECTS)[0]
    return task, subject


def _system(lang: str, rng: random.Random) -> str:
    persona = rng.choice(PERSONAS[lang])
    if lang == "fr":
        return f"Tu es {persona}. Tu rédiges en français."
    return f"You are {persona}. You write in English."


def mirror_messages(task: str, subject: str, lang: str, topic_hint: str, words: int, rng: random.Random) -> list[dict]:
    task_name = TASKS.get(task, TASKS["ee"])[lang]
    subj = _subject_name(subject, lang)
    if lang == "fr":
        user = (
            f"Rédige un extrait d'environ {words} mots d'un {task_name}"
            + (f" en {subj}" if task != "tok" else "")
            + f". Le texte doit porter sur le même sujet que ce passage :\n\n« {topic_hint} »\n\n"
            + "Écris le corps du texte (introduction, développement ou analyse), avec plusieurs paragraphes. "
            + PLAIN["fr"]
        )
    else:
        user = (
            f"Write an excerpt of about {words} words from an {task_name}"
            + (f" in {subj}" if task != "tok" else "")
            + f". It must be about the same topic as this passage:\n\n\"{topic_hint}\"\n\n"
            + "Write the body of the text (introduction, development or analysis) in several paragraphs. "
            + PLAIN["en"]
        )
    return [{"role": "system", "content": _system(lang, rng)}, {"role": "user", "content": user}]


def fill_messages(before: str, after: str, lang: str, words: int, rng: random.Random) -> list[dict]:
    if lang == "fr":
        user = (
            "Voici un extrait de mon travail pour le BI avec un passage manquant, indiqué par [PASSAGE MANQUANT].\n\n"
            f"{before}\n\n[PASSAGE MANQUANT]\n\n{after}\n\n"
            f"Écris uniquement le passage manquant, environ {words} mots, pour qu'il s'enchaîne naturellement. "
            + PLAIN["fr"]
        )
    else:
        user = (
            "Here is an excerpt of my IB work with a missing passage marked [MISSING PASSAGE].\n\n"
            f"{before}\n\n[MISSING PASSAGE]\n\n{after}\n\n"
            f"Write only the missing passage, about {words} words, so that it flows naturally. " + PLAIN["en"]
        )
    return [{"role": "system", "content": _system(lang, rng)}, {"role": "user", "content": user}]


def rephrase_messages(text: str, lang: str, style: str, rng: random.Random) -> list[dict]:
    instruction = REPHRASE_STYLES[style][lang]
    user = f"{instruction} {PLAIN[lang]}\n\n{text}"
    return [{"role": "user", "content": user}]


def polish_messages(text: str, lang: str) -> list[dict]:
    if lang == "fr":
        user = "Corrige uniquement l'orthographe, la grammaire et la ponctuation du texte suivant, sans changer le style ni les mots. Renvoie seulement le texte corrigé.\n\n" + text
    else:
        user = "Fix only the spelling, grammar and punctuation of the following text, without changing its style or wording. Return only the corrected text.\n\n" + text
    return [{"role": "user", "content": user}]


def translate_messages(text: str, src: str, tgt: str) -> list[dict]:
    if tgt == "fr":
        user = "Traduis le texte suivant en français, dans un style académique naturel. Renvoie seulement la traduction.\n\n" + text
    else:
        user = "Translate the following text into English, in a natural academic style. Return only the translation.\n\n" + text
    return [{"role": "user", "content": user}]
