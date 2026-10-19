"""Load authored curriculum JSON files into the active database (Neon or SQLite).

Usage (run from backend/):
    python scripts/add_curriculum.py                     # every file in app/seeds/curriculum
    python scripts/add_curriculum.py --subject math      # one subject
    python scripts/add_curriculum.py --grade 3           # one grade
    python scripts/add_curriculum.py --dry-run           # report only, insert nothing

Curriculum file: app/seeds/curriculum/<subject_code>_g<grade>.json
See app/seeds/curriculum/README_SCHEMA.md for the format.

Idempotent: a lesson is skipped when the same chapter already holds that title,
and a question is skipped when the quiz already has the same question text.
"""
import argparse
import glob
import json
import os
import re
import sys

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND)
CURRICULUM_DIR = os.path.join(BACKEND, "app", "seeds", "curriculum")

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from sqlalchemy import func, select

from app.core.database import DATABASE_URL, SessionLocal
from app.models.models import Chapter, Lesson, Question, Quiz, Subject

STATS = {"chapter": 0, "lesson": 0, "quiz": 0, "question": 0, "skipped_lesson": 0}


def get_subject(db, code, grade):
    return db.scalar(
        select(Subject).where(Subject.code == code, Subject.grade_level == grade)
    )


def next_number(db, model, column, **filters):
    stmt = select(func.max(column)).where(*[getattr(model, k) == v for k, v in filters.items()])
    return (db.scalar(stmt) or 0) + 1


# the app renders "ជំពូកទី N" / "មេរៀនទី N" itself, so a baked-in number in the
# authored title would disagree with the real position once chapters are appended
NUMBER_PREFIX = re.compile(r"^\s*(ជំពូកទី|មេរៀនទី)\s*[០-៩0-9]+\s*[៖:]?\s*")


def strip_number_prefix(title: str) -> str:
    return NUMBER_PREFIX.sub("", title).strip()


def get_or_create_chapter(db, subject, title, description, dry_run):
    chapter = db.scalar(
        select(Chapter).where(Chapter.subject_id == subject.id, Chapter.title_km == title)
    )
    if chapter:
        return chapter
    number = next_number(db, Chapter, Chapter.chapter_number, subject_id=subject.id)
    chapter = Chapter(
        subject_id=subject.id,
        chapter_number=number,
        title_km=title,
        description_km=description,
        order_index=number,
    )
    if not dry_run:
        db.add(chapter)
        db.flush()
    STATS["chapter"] += 1
    return chapter


def build_questions(quiz, spec, existing_texts):
    for index, q in enumerate(spec, start=1):
        text_km = q["text_km"].strip()
        if text_km in existing_texts:
            continue
        qtype = q.get("type", "multiple_choice")
        if qtype == "true_false":
            options = [
                {"id": "true", "text": "ត្រូវ (ពិត)"},
                {"id": "false", "text": "ខុស (មិនពិត)"},
            ]
        elif qtype == "fill_blank":
            options = []
        else:
            options = [{"id": o["id"], "text": o["text"]} for o in q["options"]]
        yield Question(
            quiz_id=quiz.id,
            question_type=qtype,
            question_text_km=text_km,
            options_json=options,
            correct_answer=str(q["correct"]).strip(),
            hint_km=q.get("hint_km"),
            explanation_km=q.get("explanation_km"),
            points=q.get("points", 10),
            order_index=index,
        )
        existing_texts.add(text_km)


def load_file(path, dry_run):
    with open(path, encoding="utf-8") as handle:
        data = json.load(handle)

    code, grade = data["subject"], int(data["grade"])
    start = dict(STATS)
    with SessionLocal() as db:
        subject = get_subject(db, code, grade)
        if not subject:
            print(f"!! no subject row for {code} grade {grade} - skipped {path}")
            return

        for chapter_spec in data["chapters"]:
            chapter = get_or_create_chapter(
                db,
                subject,
                strip_number_prefix(chapter_spec["title_km"]),
                chapter_spec.get("description_km"),
                dry_run,
            )
            for lesson_spec in chapter_spec["lessons"]:
                title = strip_number_prefix(lesson_spec["title_km"])
                exists = db.scalar(
                    select(Lesson).where(
                        Lesson.chapter_id == chapter.id,
                        Lesson.title_km == title,
                    )
                )
                if exists:
                    STATS["skipped_lesson"] += 1
                    continue

                number = next_number(
                    db, Lesson, Lesson.lesson_number, chapter_id=chapter.id
                )
                lesson = Lesson(
                    chapter_id=chapter.id,
                    lesson_number=number,
                    title_km=title,
                    summary_km=lesson_spec.get("summary_km"),
                    content_html=lesson_spec["content_html"],
                    estimated_minutes=lesson_spec.get("estimated_minutes", 15),
                    order_index=number,
                )
                db.add(lesson)
                STATS["lesson"] += 1

                if not dry_run:
                    db.flush()
                    quiz = Quiz(
                        lesson_id=lesson.id,
                        title_km=f"តេស្ត៖ {title}",
                        passing_score=60,
                        duration_minutes=10,
                    )
                    db.add(quiz)
                    db.flush()
                    STATS["quiz"] += 1

                    existing = {
                        row[0]
                        for row in db.execute(
                            select(Question.question_text_km).where(
                                Question.quiz_id == quiz.id
                            )
                        )
                    }
                    for question in build_questions(quiz, lesson_spec.get("questions", []), existing):
                        db.add(question)
                        STATS["question"] += 1

        print(
            f"{code} g{grade}: lessons+{STATS['lesson'] - start['lesson']} "
            f"quizzes+{STATS['quiz'] - start['quiz']} "
            f"questions+{STATS['question'] - start['question']} "
            f"chapters+{STATS['chapter'] - start['chapter']} "
            f"already_present={STATS['skipped_lesson'] - start['skipped_lesson']}"
        )
        if dry_run:
            db.rollback()
        else:
            db.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--grade", type=int)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if DATABASE_URL.startswith("sqlite"):
        print("note: writing to SQLite (set DATABASE_URL for Neon)")

    pattern = os.path.join(CURRICULUM_DIR, "*.json")
    files = sorted(glob.glob(pattern))
    if args.subject:
        files = [f for f in files if os.path.basename(f).startswith(args.subject + "_g")]
    if args.grade:
        files = [f for f in files if f.endswith(f"_g{args.grade}.json")]

    if not files:
        sys.exit(f"no curriculum files matched in {CURRICULUM_DIR}")

    print(f"{len(files)} file(s), dry_run={args.dry_run}")
    for path in files:
        load_file(path, args.dry_run)

    print("total:", STATS)


if __name__ == "__main__":
    main()
