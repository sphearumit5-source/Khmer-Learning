from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.deps import require_teacher_or_admin
from app.models.models import (
    User, Lesson, Quiz, Question, QuizAttempt, LessonProgress, Subject, Chapter
)
from app.schemas.schemas import (
    TeacherStats, StudentRosterItem, LessonCreateUpdate, LessonDetailResponse,
    QuizAdminResponse, QuestionAdminCreateUpdate, QuestionOption
)

router = APIRouter(prefix="/teacher", tags=["ផ្នែកគ្រូបង្រៀន (Teacher Area)"])

@router.get("/stats", response_model=TeacherStats)
def get_teacher_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin)
):
    total_students = db.query(User).filter(User.role == "student").count()
    total_lessons = db.query(Lesson).count()
    total_quizzes = db.query(Quiz).count()
    
    attempts = db.query(QuizAttempt).all()
    avg_score = 0.0
    if attempts:
        avg_score = round(sum(float(a.percentage) for a in attempts) / len(attempts), 1)

    return TeacherStats(
        total_students=total_students,
        total_lessons=total_lessons,
        total_quizzes=total_quizzes,
        average_class_score=avg_score
    )

@router.get("/students", response_model=List[StudentRosterItem])
def get_student_roster(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin)
):
    students = db.query(User).filter(User.role == "student").order_by(User.grade_level, User.full_name).all()
    
    result = []
    for s in students:
        # Total lessons for student's grade
        grade = s.grade_level or 3
        grade_subjects = db.query(Subject).filter(Subject.grade_level == grade).all()
        subj_ids = [sub.id for sub in grade_subjects]
        
        total_lessons = 0
        if subj_ids:
            chap_ids = [c.id for c in db.query(Chapter).filter(Chapter.subject_id.in_(subj_ids)).all()]
            if chap_ids:
                total_lessons = db.query(Lesson).filter(Lesson.chapter_id.in_(chap_ids)).count()

        completed_count = db.query(LessonProgress).filter(
            LessonProgress.user_id == s.id,
            LessonProgress.is_completed == True
        ).count()

        # Quiz attempts
        scores = db.query(QuizAttempt.percentage).filter(QuizAttempt.user_id == s.id).all()
        avg_score = 0.0
        if scores:
            avg_score = round(sum(float(sc[0]) for sc in scores) / len(scores), 1)

        # Last active
        last_prog = (
            db.query(LessonProgress.last_accessed_at)
            .filter(LessonProgress.user_id == s.id)
            .order_by(LessonProgress.last_accessed_at.desc())
            .first()
        )
        last_active = last_prog[0] if last_prog else s.created_at

        result.append(StudentRosterItem(
            id=s.id,
            full_name=s.full_name,
            username=s.username,
            grade_level=grade,
            completed_lessons=completed_count,
            total_lessons=total_lessons,
            average_quiz_score=avg_score,
            last_active=last_active
        ))

    return result

@router.post("/lessons", response_model=LessonDetailResponse)
def create_lesson(
    req: LessonCreateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin)
):
    chapter = db.query(Chapter).filter(Chapter.id == req.chapter_id).first()
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="រកមិនឃើញជំពូកនេះឡើយ (Chapter not found)"
        )
    
    lesson = Lesson(
        chapter_id=req.chapter_id,
        lesson_number=req.lesson_number,
        title_km=req.title_km,
        summary_km=req.summary_km,
        content_html=req.content_html,
        estimated_minutes=req.estimated_minutes,
        order_index=req.order_index
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first()

    return LessonDetailResponse(
        id=lesson.id,
        chapter_id=lesson.chapter_id,
        chapter_title_km=chapter.title_km,
        subject_id=subject.id if subject else "",
        subject_name_km=subject.name_km if subject else "",
        grade_level=subject.grade_level if subject else 1,
        lesson_number=lesson.lesson_number,
        title_km=lesson.title_km,
        summary_km=lesson.summary_km,
        content_html=lesson.content_html,
        estimated_minutes=lesson.estimated_minutes,
        media=[],
        has_quiz=False,
        quiz_id=None,
        is_completed=False
    )

@router.put("/lessons/{lesson_id}", response_model=LessonDetailResponse)
def update_lesson(
    lesson_id: str,
    req: LessonCreateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="រកមិនឃើញមេរៀននេះឡើយ")

    lesson.chapter_id = req.chapter_id
    lesson.lesson_number = req.lesson_number
    lesson.title_km = req.title_km
    lesson.summary_km = req.summary_km
    lesson.content_html = req.content_html
    lesson.estimated_minutes = req.estimated_minutes
    lesson.order_index = req.order_index
    db.commit()
    db.refresh(lesson)

    chapter = db.query(Chapter).filter(Chapter.id == lesson.chapter_id).first()
    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first() if chapter else None

    return LessonDetailResponse(
        id=lesson.id,
        chapter_id=lesson.chapter_id,
        chapter_title_km=chapter.title_km if chapter else "",
        subject_id=subject.id if subject else "",
        subject_name_km=subject.name_km if subject else "",
        grade_level=subject.grade_level if subject else 1,
        lesson_number=lesson.lesson_number,
        title_km=lesson.title_km,
        summary_km=lesson.summary_km,
        content_html=lesson.content_html,
        estimated_minutes=lesson.estimated_minutes,
        media=[],
        has_quiz=lesson.quiz is not None,
        quiz_id=lesson.quiz.id if lesson.quiz else None,
        is_completed=False
    )

@router.delete("/lessons/{lesson_id}")
def delete_lesson(
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="រកមិនឃើញមេរៀននេះឡើយ")
    db.delete(lesson)
    db.commit()
    return {"status": "success", "message": "បានលុបមេរៀនដោយជោគជ័យ (Lesson deleted successfully)"}

@router.get("/quizzes/{quiz_id}", response_model=QuizAdminResponse)
def get_quiz_admin(
    quiz_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="រកមិនឃើញកម្រងសំណួរនេះឡើយ")

    questions = db.query(Question).filter(Question.quiz_id == quiz.id).order_by(Question.order_index).all()
    q_admin_list = []
    for q in questions:
        raw_options = q.options_json or []
        opts = []
        for o in raw_options:
            if isinstance(o, dict):
                opts.append(QuestionOption(id=str(o.get("id")), text=str(o.get("text"))))
            elif isinstance(o, str):
                opts.append(QuestionOption(id=o, text=o))
        
        q_admin_list.append(QuestionAdminCreateUpdate(
            id=q.id,
            question_type=q.question_type,
            question_text_km=q.question_text_km,
            points=q.points,
            order_index=q.order_index,
            hint_km=q.hint_km,
            explanation_km=q.explanation_km,
            options=opts,
            correct_answer=q.correct_answer
        ))

    return QuizAdminResponse(
        id=quiz.id,
        lesson_id=quiz.lesson_id,
        title_km=quiz.title_km,
        passing_score=quiz.passing_score,
        duration_minutes=quiz.duration_minutes,
        is_active=quiz.is_active,
        questions=q_admin_list
    )
