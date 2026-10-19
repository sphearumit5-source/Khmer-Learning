import json
from pathlib import Path

from app.core.database import SessionLocal
from app.models.models import Chapter, Lesson, Question, Quiz, Subject
from sqlalchemy import func, select

db = SessionLocal()
rows = db.execute(
    select(
        Subject.code,
        Subject.grade_level,
        func.count(Lesson.id),
    )
    .join(Chapter, Chapter.subject_id == Subject.id)
    .join(Lesson, Lesson.chapter_id == Chapter.id)
    .group_by(Subject.code, Subject.grade_level)
    .order_by(Subject.code, Subject.grade_level)
).all()

out = {"per_subject_grade": [[c, g, n] for c, g, n in rows]}
out["totals"] = {
    "lessons": db.scalar(select(func.count()).select_from(Lesson)),
    "quizzes": db.scalar(select(func.count()).select_from(Quiz)),
    "questions": db.scalar(select(func.count()).select_from(Question)),
}
out["sample_titles"] = db.execute(
    select(Lesson.title_km).order_by(func.random()).limit(5)
).scalars().all()
out["sample_chapters"] = [
    [title, number]
    for title, number in db.execute(
        select(Chapter.title_km, Chapter.chapter_number).limit(6)
    ).all()
]
db.close()

Path("db_counts.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print(out["totals"])
print("rows:", len(out["per_subject_grade"]))
