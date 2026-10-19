"""Try the offline tutor retrieval with a few realistic child questions.

Usage: DATABASE_URL=... python scripts/try_tutor.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.lesson_search import compose_reply, features, search_lessons
from app.core.database import DATABASE_URL, SessionLocal

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

QUESTIONS = [
    ("khmer", 1, "តើព្យញ្ជនៈខ្មែរមានប៉ុន្មានតួ?"),
    ("math", 3, "តើប្រភាគគឺជាអ្វី?"),
    ("english", 2, "ពណ៌ជាអង់គ្លេសនិយាយយ៉ាងណា?"),
    ("social_studies", 5, "ទន្លេមេគង្គសំខាន់យ៉ាងណា?"),
]

print("database:", "postgres" if not DATABASE_URL.startswith("sqlite") else "sqlite")

with SessionLocal() as db:
    for code, grade, q in QUESTIONS:
        results = search_lessons(db, q, code, grade)
        print("=" * 70)
        print(f"[{code} g{grade}] {q}")
        print("features:", len(features(q)))
        print("matches:", len(results))
        for lesson, score, snippet in results:
            print(f"  - ({score:.2f}) {lesson.title_km}")
        if results:
            print(compose_reply(q, grade, results)[:400])
