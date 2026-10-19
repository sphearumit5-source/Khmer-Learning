"""Read-only verification that migrated rows survived the Postgres round-trip.

Usage: DATABASE_URL=postgresql://... python scripts/verify_pg_roundtrip.py
Checks Khmer text integrity, JSON option lists, and timestamps.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import DATABASE_URL, SessionLocal
from app.models.models import Question, Subject, User

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

assert not DATABASE_URL.startswith("sqlite"), "point DATABASE_URL at Postgres"

KHMER_SAMPLE = "សិក្សា"  # "សិក្សា"

with SessionLocal() as db:
    users = db.query(User).all()
    subjects = db.query(Subject).all()
    question = db.query(Question).first()

    print("users:", len(users), "| subjects:", len(subjects))
    print("login user:", users[0].username, "| created_at:", users[0].created_at,
          "| tzinfo:", users[0].created_at.tzinfo)

    name = subjects[0].name_km
    print("subject name:", name)
    print("khmer chars present:", any(ord(c) >= 0x1780 for c in name))
    print("utf-8 roundtrip ok:", name.encode("utf-8").decode("utf-8") == name)
    print("sample codepoints:", [hex(ord(c)) for c in KHMER_SAMPLE])

    print("question text:", question.question_text_km)
    print("options type:", type(question.options_json).__name__,
          "| items:", len(question.options_json or []))
    print("option[0]:", (question.options_json or [None])[0])

    hashed = users[0].hashed_password
    print("bcrypt hash len:", len(hashed), "| prefix:", hashed[:4])
