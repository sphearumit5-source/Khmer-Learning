from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, get_optional_user
from app.models.models import Quiz, Question, QuizAttempt, QuizAnswer, Lesson, LessonProgress, User
from app.schemas.schemas import (
    QuizPublicResponse, QuestionPublic, QuestionOption,
    QuizSubmissionRequest, QuizSubmissionResult, QuestionResultDetail
)

router = APIRouter(prefix="/quizzes", tags=["កម្រងសំណួរតេស្ត (Quizzes)"])

@router.get("/by-lesson/{lesson_id}", response_model=QuizPublicResponse)
def get_quiz_by_lesson(
    lesson_id: str,
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="រកមិនឃើញមេរៀននេះឡើយ (Lesson not found)"
        )
    
    quiz = db.query(Quiz).filter(Quiz.lesson_id == lesson_id, Quiz.is_active == True).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="មេរៀននេះមិនទាន់មានកម្រងសំណួរនៅឡើយទេ (No active quiz for this lesson)"
        )

    questions = db.query(Question).filter(Question.quiz_id == quiz.id).order_by(Question.order_index).all()
    
    public_questions = []
    for q in questions:
        raw_options = q.options_json or []
        parsed_options = []
        for opt in raw_options:
            if isinstance(opt, dict):
                parsed_options.append(QuestionOption(id=str(opt.get("id")), text=str(opt.get("text"))))
            elif isinstance(opt, str):
                parsed_options.append(QuestionOption(id=opt, text=opt))

        # Notice: correct_answer is excluded!
        public_questions.append(QuestionPublic(
            id=q.id,
            question_type=q.question_type,
            question_text_km=q.question_text_km,
            points=q.points,
            order_index=q.order_index,
            hint_km=q.hint_km,
            options=parsed_options
        ))

    return QuizPublicResponse(
        id=quiz.id,
        lesson_id=quiz.lesson_id,
        lesson_title_km=lesson.title_km,
        title_km=quiz.title_km,
        passing_score=quiz.passing_score,
        duration_minutes=quiz.duration_minutes,
        questions=public_questions
    )

@router.post("/{quiz_id}/submit", response_model=QuizSubmissionResult)
def submit_quiz(
    quiz_id: str,
    submission: QuizSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="រកមិនឃើញកម្រងសំណួរនេះឡើយ (Quiz not found)"
        )

    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    q_map = {q.id: q for q in questions}

    total_score = 0
    max_score = sum(q.points for q in questions)
    if max_score == 0:
        max_score = 100

    answers_map = {ans.question_id: ans.student_answer.strip() for ans in submission.answers}
    details: List[QuestionResultDetail] = []
    db_quiz_answers: List[QuizAnswer] = []

    now = datetime.now(timezone.utc)
    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_id=current_user.id,
        started_at=now,
        completed_at=now
    )
    db.add(attempt)
    db.flush()  # assign attempt.id

    for q in questions:
        student_ans = answers_map.get(q.id, "").strip()
        correct_ans = q.correct_answer.strip()
        
        is_correct = False
        if q.question_type in ["multiple_choice", "true_false"]:
            is_correct = (student_ans.lower() == correct_ans.lower())
        elif q.question_type == "fill_blank":
            # Normalizing whitespace for Khmer text
            is_correct = (student_ans.replace(" ", "").lower() == correct_ans.replace(" ", "").lower())

        points_awarded = q.points if is_correct else 0
        total_score += points_awarded

        details.append(QuestionResultDetail(
            question_id=q.id,
            question_text_km=q.question_text_km,
            question_type=q.question_type,
            student_answer=student_ans,
            correct_answer=correct_ans,
            is_correct=is_correct,
            points_awarded=points_awarded,
            max_points=q.points,
            explanation_km=q.explanation_km or ("ចម្លើយត្រឹមត្រូវគឺ៖ " + correct_ans)
        ))

        db_ans = QuizAnswer(
            attempt_id=attempt.id,
            question_id=q.id,
            student_answer=student_ans,
            is_correct=is_correct,
            points_awarded=points_awarded,
            created_at=now
        )
        db_quiz_answers.append(db_ans)

    percentage = round((total_score / max_score) * 100, 2) if max_score > 0 else 0.0
    passed = percentage >= quiz.passing_score

    attempt.score = total_score
    attempt.max_score = max_score
    attempt.percentage = percentage
    attempt.passed = passed

    for a in db_quiz_answers:
        db.add(a)

    # If passed, automatically mark the lesson as completed
    if passed and quiz.lesson_id:
        prog = (
            db.query(LessonProgress)
            .filter(
                LessonProgress.user_id == current_user.id,
                LessonProgress.lesson_id == quiz.lesson_id
            )
            .first()
        )
        if prog:
            prog.is_completed = True
            if not prog.completed_at:
                prog.completed_at = now
            prog.last_accessed_at = now
        else:
            prog = LessonProgress(
                user_id=current_user.id,
                lesson_id=quiz.lesson_id,
                is_completed=True,
                last_accessed_at=now,
                completed_at=now
            )
            db.add(prog)

    db.commit()

    # Friendly Khmer feedback message based on score
    if percentage >= 90:
        msg = "🎉 ពូកែណាស់កូន! កូនទទួលបានពិន្ទុឆ្នើមស្ទើរតែពេញ! (អស្ចារ្យណាស់)"
    elif percentage >= 75:
        msg = "👏 ល្អណាស់កូន! កូនយល់មេរៀនបានយ៉ាងល្អប្រសើរ! (បន្តការខិតខំទៀតណា)"
    elif percentage >= 60:
        msg = "✨ កូនបានជាប់ហើយ! ព្យាយាមអានមេរៀនបន្ថែមទៀតដើម្បីទទួលបានពិន្ទុកាន់តែខ្ពស់!"
    else:
        msg = "💪 កុំបាក់ទឹកចិត្តណា៎កូន! ចូរសាកល្បងមើលការពន្យល់ឡើងវិញ ហើយធ្វើតេស្តម្តងទៀត!"

    return QuizSubmissionResult(
        attempt_id=attempt.id,
        quiz_id=quiz.id,
        quiz_title_km=quiz.title_km,
        score=total_score,
        max_score=max_score,
        percentage=percentage,
        passed=passed,
        congratulatory_message_km=msg,
        details=details
    )
