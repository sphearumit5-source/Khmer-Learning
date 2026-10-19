"""Write-path smoke test for Postgres that commits nothing.

Usage: DATABASE_URL=postgresql://... python scripts/verify_pg_write_path.py

Inserts a probe user and a Khmer lesson through the ORM, exercises a JSON write,
then rolls back. Verifies UUID defaults, Boolean, Text and JSON handling on
Postgres without leaving rows behind.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import DATABASE_URL, SessionLocal
from app.models.models import Lesson, Question, Quiz, Subject, User

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

assert not DATABASE_URL.startswith("sqlite"), "point DATABASE_URL at Postgres"

db = SessionLocal()
try:
    subject = db.query(Subject).first()

    user = User(
        username="zz_write_probe",
        email="zz_write_probe@example.invalid",
        hashed_password="$2b$12$" + "x" * 53,
        full_name="សាកល្បងសរសេរ",
        role="student",
        grade_level=1,
    )
    db.add(user)
    db.flush()
    print("user uuid default len 36:", len(user.id) == 36)
    print("boolean default:", user.is_active)
    print("khmer full_name read back:", user.full_name)

    chapter = subject.chapters[0] if subject.chapters else None
    if chapter:
        lesson = Lesson(
            chapter_id=chapter.id,
            lesson_number=99,
            title_km="មេរៀនសាកល្បង",
            content_html="<p>អត្ថបទសាកល្បង</p>",
            order_index=999,
        )
        db.add(lesson)
        db.flush()
        print("lesson saved, title:", lesson.title_km)

    options = [{"id": "A", "text": "ជម្រើស ក"}, {"id": "B", "text": "ជម្រើស ខ"}]
    quiz = db.query(Quiz).first()
    question = Question(
        quiz_id=quiz.id,
        question_type="multiple_choice",
        question_text_km="សំណួរសាកល្បង?",
        options_json=options,
        correct_answer="A",
        order_index=999,
    )
    db.add(question)
    db.flush()
    # read from a fresh identity map slot so the JSON column is re-fetched
    db.refresh(question)
    print("json round-trip type:", type(question.options_json).__name__,
          "| first option:", question.options_json[0]["text"])

    print("outer transaction will roll back")
finally:
    db.rollback()
    db.close()

with SessionLocal() as check:
    print("probe users after rollback (expect 0):",
          check.query(User).filter(User.username == "zz_write_probe").count())
