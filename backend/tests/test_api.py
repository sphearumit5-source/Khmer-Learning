import os

# app.main creates tables and seeds on import, so pin it to the local test file
# even when .env points at the production Postgres.
os.environ["DATABASE_URL"] = "sqlite:///./test_temp.db"
os.environ["AI_API_KEY"] = ""
os.environ["GEMINI_API_KEY"] = ""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.models.models import User, Lesson, Quiz, Question
from app.seeds.seed_data import seed_database

TEST_DATABASE_URL = os.environ["DATABASE_URL"]
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)
with TestingSessionLocal() as db:
    seed_database(db)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_student():
    response = client.post("/api/auth/login", json={
        "username": "sothun",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "sothun"
    assert data["user"]["role"] == "student"

def test_login_teacher():
    response = client.post("/api/auth/login", json={
        "username": "kru_dara",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "teacher"

def test_get_subjects():
    response = client.get("/api/subjects?grade_level=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    codes = [s["code"] for s in data]
    assert "khmer" in codes
    assert "math" in codes
    assert "english" in codes
    assert "social_studies" in codes

def test_ai_tutor_fallback():
    login_resp = client.post("/api/auth/login", json={"username": "sothun", "password": "password123"})
    token = login_resp.json()["access_token"]
    
    response = client.post(
        "/api/tutor/chat",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "grade_level": 3,
            "subject_code": "math",
            "message": "តើវិធីគុណជាអ្វី?"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    # No AI key is configured during tests, so the tutor must answer from the
    # stored lessons (or the built-in notes) and never claim a live AI call.
    assert data["answer_source"] in ("lessons", "built_in")
    assert data["reply"].strip() != ""
    assert len(data["suggested_questions"]) > 0

def test_quiz_and_progress_flow():
    # 1. Login as student
    login_resp = client.post("/api/auth/login", json={"username": "sothun", "password": "password123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get lesson list for grade 1 Khmer
    sub_resp = client.get("/api/subjects?grade_level=1")
    assert sub_resp.status_code == 200
    sub_id = [s["id"] for s in sub_resp.json() if s["code"] == "khmer"][0]

    chap_resp = client.get(f"/api/subjects/{sub_id}/chapters", headers=headers)
    assert chap_resp.status_code == 200
    chapters = chap_resp.json()
    assert len(chapters) > 0
    lesson = chapters[0]["lessons"][0]
    lesson_id = lesson["id"]

    # 3. Get quiz by lesson
    quiz_resp = client.get(f"/api/quizzes/by-lesson/{lesson_id}", headers=headers)
    assert quiz_resp.status_code == 200
    quiz_data = quiz_resp.json()
    assert "questions" in quiz_data
    # Verify correct_answer is NOT exposed in public response!
    for q in quiz_data["questions"]:
        assert "correct_answer" not in q

    # 4. Submit quiz
    quiz_id = quiz_data["id"]
    answers = []
    for q in quiz_data["questions"]:
        # Find correct answer in DB to test passing
        with TestingSessionLocal() as db:
            db_q = db.query(Question).filter(Question.id == q["id"]).first()
            answers.append({"question_id": q["id"], "student_answer": db_q.correct_answer})

    submit_resp = client.post(f"/api/quizzes/{quiz_id}/submit", headers=headers, json={"answers": answers})
    assert submit_resp.status_code == 200
    result = submit_resp.json()
    assert result["passed"] is True
    assert result["percentage"] == 100.0
    assert "congratulatory_message_km" in result

    # 5. Check progress summary
    prog_resp = client.get("/api/progress/summary?grade_level=1", headers=headers)
    assert prog_resp.status_code == 200
    prog_data = prog_resp.json()
    assert prog_data["completed_lessons"] >= 1
    assert prog_data["total_quizzes_taken"] >= 1
