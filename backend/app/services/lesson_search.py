"""Answer the AI tutor from the lessons that are actually stored in the database.

Used when no AI_API_KEY is configured, so a child still gets a real explanation
taken from the curriculum instead of a canned demo paragraph.
"""
import re
from typing import List, Set, Tuple

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import Chapter, Lesson, Subject

TAG_RE = re.compile(r"<[^>]+>")
LATIN_RE = re.compile(r"[A-Za-z][A-Za-z']+")
KHMER_RE = re.compile(r"[^\u1780-\u17ff]+")

# Khmer is often written without spaces, so word tokenising is unreliable:
# match on character bigrams inside Khmer runs instead.
MIN_SCORE = 0.12


def strip_html(html: str) -> str:
    return TAG_RE.sub(" ", html or "").replace("\n", " ").strip()


def khmer_bigrams(text: str) -> Set[str]:
    grams = set()
    for run in KHMER_RE.split(text or ""):
        for i in range(len(run) - 1):
            grams.add(run[i:i + 2])
    return grams


def features(text: str) -> Set[str]:
    return khmer_bigrams(text) | {w.lower() for w in LATIN_RE.findall(text or "")}


def sentences(text: str, limit: int = 3) -> str:
    parts = [p.strip() for p in re.split(r"(?<=[។ៗ!?])\s+", text) if p.strip()]
    return " ".join(parts[:limit])


def search_lessons(
    db: Session, query: str, subject_code: str, grade_level: int, limit: int = 3
) -> List[Tuple[Lesson, float, str]]:
    """Rank lessons of this subject/grade by similarity to the question."""
    query_features = features(query)
    if not query_features:
        return []

    rows = db.execute(
        select(Lesson, Chapter.title_km)
        .join(Chapter, Lesson.chapter_id == Chapter.id)
        .join(Subject, Chapter.subject_id == Subject.id)
        .where(Subject.code == subject_code, Subject.grade_level == grade_level)
    ).all()

    scored = []
    for lesson, _chapter_title in rows:
        title_features = features(lesson.title_km)
        body_features = features(f"{lesson.summary_km or ''} {strip_html(lesson.content_html)}")
        hits = len(query_features & title_features) * 2 + len(query_features & body_features)
        score = hits / len(query_features)
        if score < MIN_SCORE:
            continue
        snippet = sentences(lesson.summary_km or strip_html(lesson.content_html), 2)
        scored.append((lesson, score, snippet))

    scored.sort(key=lambda item: item[1], reverse=True)
    return scored[:limit]


KHMER_DIGITS = "០១២៣៤៥៦៧៨៩"


def khmer_number(value: int) -> str:
    return "".join(KHMER_DIGITS[int(d)] for d in str(value))


def compose_reply(message: str, grade_level: int, results) -> str:
    lines = [
        f"📘 ចម្លើយចេញពីមេរៀនពិតក្នុងសៀវភៅ (ថ្នាក់ទី {khmer_number(grade_level)})",
        "",
        f"សួស្ដីកូន! លោកគ្រូរកឃើញមេរៀនដែលពាក់ព័ន្ធនឹងសំណួរ «{message}» ដូចខាងក្រោម៖",
        "",
    ]
    for index, (lesson, _score, snippet) in enumerate(results, start=1):
        lines.append(f"{khmer_number(index)}. {lesson.title_km}")
        if snippet:
            lines.append(f"   {snippet}")
        lines.append("")
    lines.append(
        "បើកូនចង់បានឧទាហរណ៍បន្ថែម ចុចលើមេរៀនខាងលើដើម្បីអានពេញ រួចធ្វើលំហាត់តេស្ត។ "
        "លោកគ្រូនៅទីនេះជួយកូនគ្រប់ពេល! 🌟"
    )
    return "\n".join(lines)
