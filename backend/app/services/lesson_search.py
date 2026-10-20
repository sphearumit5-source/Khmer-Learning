"""Answer the AI tutor from the lessons that are actually stored in the database.

Used when the live AI cannot answer (no key, provider error or too slow), so a
child still gets a real explanation taken from the curriculum — or an honest
statement that no lesson covers the question, instead of an unrelated one.
"""
import math
import re
from collections import Counter
from typing import List, Optional, Set, Tuple

from sqlalchemy import select
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.models.models import Chapter, Lesson, Subject

TAG_RE = re.compile(r"<[^>]+>")
LATIN_RE = re.compile(r"[A-Za-z][A-Za-z']+")
KHMER_RE = re.compile(r"[^\u1780-\u17ff]+")

# Khmer is often written without spaces, so word tokenising is unreliable and
# matching falls back to character n-grams. Short grams alone are useless here:
# «ាន» or «រា» appear in almost every lesson, so a question made of nothing but
# them looked 80% covered by an unrelated lesson. Longer grams are the topic
# words, so they carry the decision.
GRAM_SIZES = (2, 3, 4)
MIN_SCORE = 0.50
WEAK_SCORE = 0.20
# grams this common are script noise and must not count as evidence
NOISE_DF_RATIO = 0.5

# Question words carry no topic, and they appear in every lesson too, so they
# would otherwise make unrelated lessons look similar to the question.
QUESTION_WORDS = (
    "តើ", "អ្វី", "ប៉ុន្មាន", "យ៉ាងណា", "ដូចម្តេច", "ណាមួយ", "ដែរឬទេ", "ទេ", "ណា",
)


def strip_html(html: str) -> str:
    return TAG_RE.sub(" ", html or "").replace("\n", " ").strip()


def khmer_grams(text: str) -> Set[str]:
    grams = set()
    for run in KHMER_RE.split(text or ""):
        for size in GRAM_SIZES:
            for i in range(len(run) - size + 1):
                grams.add(run[i:i + size])
    return grams


def features(text: str) -> Set[str]:
    return khmer_grams(text) | {w.lower() for w in LATIN_RE.findall(text or "")}


def question_features(text: str) -> Set[str]:
    cleaned = text or ""
    for word in QUESTION_WORDS:
        cleaned = cleaned.replace(word, " ")
    found = features(cleaned)
    return found or features(text)


def sentences(text: str, limit: int = 3, focus: Optional[str] = None) -> str:
    parts = [p.strip() for p in re.split(r"(?<=[។ៗ!?])\s+", text) if p.strip()]
    if focus:
        for index, part in enumerate(parts):
            if focus in part:
                return " ".join(parts[index:index + 2])
    return " ".join(parts[:limit])


def search_lessons(
    db: Session,
    query: str,
    subject_code: Optional[str] = None,
    grade_level: Optional[int] = None,
    limit: int = 3,
    min_score: float = MIN_SCORE,
    preferred_subject: Optional[str] = None,
) -> List[Tuple[Lesson, float, str, str, int]]:
    """Rank lessons by how much of the question's distinctive wording they cover.

    Passing no subject or grade searches the whole curriculum, so a child can ask
    about any lesson instead of only the one currently selected. A guessed
    subject only ranks matches higher — it never hides a lesson that fits.
    """
    query_features = question_features(query)
    if not query_features:
        return []

    stmt = (
        select(Lesson, Subject.code, Subject.name_km, Subject.grade_level)
        .join(Chapter, Lesson.chapter_id == Chapter.id)
        .join(Subject, Chapter.subject_id == Subject.id)
    )
    if subject_code:
        stmt = stmt.where(Subject.code == subject_code)
    if grade_level:
        stmt = stmt.where(Subject.grade_level == grade_level)
    try:
        rows = db.execute(stmt).all()
    except OperationalError:
        # Neon closes pooled connections that sit idle, and pool_pre_ping only
        # catches that before the query starts — a fresh connection on the
        # second attempt is what actually keeps the tutor answering.
        db.rollback()
        rows = db.execute(stmt).all()
    if not rows:
        return []

    docs = []
    for lesson, code, name_km, level in rows:
        title_features = features(lesson.title_km)
        body_features = features(f"{lesson.summary_km or ''} {strip_html(lesson.content_html)}")
        docs.append((lesson, code, name_km, level, title_features, title_features | body_features))

    # Weight each wording by how rare it is in this corpus: «ខេត្ត» appears in
    # nearly every lesson, while a temple name appears in one.
    doc_count = len(docs)
    doc_freq = Counter()
    for *_rest, _title, combined in docs:
        for gram in query_features & combined:
            doc_freq[gram] += 1

    unseen_weight = math.log(doc_count + 1)
    noise_floor = NOISE_DF_RATIO * doc_count

    def weight(gram: str) -> float:
        found = doc_freq.get(gram, 0)
        if found == 0:
            return unseen_weight
        if found > noise_floor:
            return 0.0
        return math.log((doc_count + 1) / (found + 1))

    total_weight = sum(weight(gram) for gram in query_features)
    if total_weight <= 0:
        return []

    scored = []
    for lesson, code, name_km, level, title_features, combined in docs:
        matched = query_features & combined
        if not matched:
            continue
        coverage = sum(weight(gram) for gram in matched) / total_weight
        score = coverage * (1.1 if query_features & title_features else 1.0)
        if preferred_subject and code == preferred_subject:
            score *= 1.05
        if score < min_score:
            continue
        # quote the sentence that actually contains the question's rarest wording
        focus = max(matched, key=weight)
        text = f"{lesson.summary_km or ''} {strip_html(lesson.content_html)}".strip()
        snippet = sentences(text, 2, focus=focus)
        scored.append((lesson, score, snippet, name_km, level))

    scored.sort(key=lambda item: item[1], reverse=True)
    return scored[:limit]


KHMER_DIGITS = "០១២៣៤៥៦៧៨៩"


def khmer_number(value: int) -> str:
    return "".join(KHMER_DIGITS[int(d)] for d in str(value))


def _lesson_line(index: int, result) -> List[str]:
    lesson, _score, snippet, subject_name, subject_grade = result
    lines = [
        f"{khmer_number(index)}. {lesson.title_km}",
        f"   មុខវិជ្ជា {subject_name} · ថ្នាក់ទី {khmer_number(subject_grade)}",
    ]
    if snippet:
        lines.append(f"   {snippet}")
    return lines


def compose_reply(message: str, grade_level: Optional[int], results) -> str:
    """Lead with the best lesson's own text, then list the other matches."""
    lesson, _score, snippet, subject_name, subject_grade = results[0]

    lines = [
        "📘 ចម្លើយចេញពីមេរៀនពិតក្នុងសៀវភៅ",
        "",
        f"សួស្ដីកូន! សំណួរ «{message}» ត្រូវនឹងមេរៀន «{lesson.title_km}» "
        f"(មុខវិជ្ជា {subject_name} · ថ្នាក់ទី {khmer_number(subject_grade)})។",
        "",
    ]
    if snippet:
        lines += [f"លោកគ្រូបកស្រាយតាមមេរៀននេះថា៖ {snippet}", ""]

    others = results[1:4]
    if others:
        lines.append("មេរៀនដែលពាក់ព័ន្ធផ្សេងទៀត៖")
        lines.append("")
        for index, result in enumerate(others, start=2):
            lines += _lesson_line(index, result)
            lines.append("")

    lines.append(
        "ចុចលើមេរៀនខាងលើដើម្បីអានពេញ រួចធ្វើលំហាត់តេស្ត។ "
        "លោកគ្រូនៅទីនេះជួយកូនគ្រប់ពេល! 🌟"
    )
    return "\n".join(lines)


def compose_not_found(message: str, related) -> str:
    """Say plainly that the textbook has no lesson on this, instead of guessing."""
    lines = [
        "🙏 សួស្ដីកូន! លោកគ្រូរកមិនទាន់ឃើញមេរៀនណានិយាយត្រង់អំពីសំណួរនេះទេ។",
        "",
        f"សំណួររបស់កូន៖ «{message}»",
        "",
        "កូនអាចសាកល្បង៖",
        "   ១. សួរខ្លី និងច្បាស់ (ឧ. «ព្យញ្ជនៈខ្មែរមានប៉ុន្មានតួ?»)។",
        "   ២. រៀបរាប់ថាកូនចង់ដឹងអំពីមេរៀនអ្វី ឬសៀវភៅមុខវិជ្ជាណា។",
        "   ៣. សួរម្ដងទៀត នៅពេលលោកគ្រូ AI ត្រឡប់មកឆ្លើយវិញបាន។",
    ]

    if related:
        lines += ["", "មេរៀនដែលជិតនឹងសំណួររបស់កូនបំផុតមាន៖", ""]
        for index, result in enumerate(related[:3], start=1):
            lines += _lesson_line(index, result)
            lines.append("")

    return "\n".join(lines)
