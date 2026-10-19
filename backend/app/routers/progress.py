from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import (
    User, Subject, Chapter, Lesson, LessonProgress, QuizAttempt, Quiz
)
from app.schemas.schemas import (
    ProgressSummaryResponse, SubjectProgressItem, RecentQuizAttempt, BadgeItem
)

router = APIRouter(prefix="/progress", tags=["វឌ្ឍនភាពសិក្សា (Student Progress)"])

@router.get("/summary", response_model=ProgressSummaryResponse)
def get_progress_summary(
    grade_level: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_grade = grade_level or current_user.grade_level or 3
    
    # 1. Subjects for this grade
    subjects = db.query(Subject).filter(Subject.grade_level == target_grade).all()
    
    subject_items = []
    total_grade_lessons = 0
    total_grade_completed = 0
    
    for sub in subjects:
        # chapters and lessons
        chapters = db.query(Chapter).filter(Chapter.subject_id == sub.id).all()
        chap_ids = [c.id for c in chapters]
        
        lesson_count = 0
        completed_count = 0
        avg_subject_score = 0.0
        
        if chap_ids:
            lessons = db.query(Lesson).filter(Lesson.chapter_id.in_(chap_ids)).all()
            lesson_count = len(lessons)
            total_grade_lessons += lesson_count
            
            les_ids = [l.id for l in lessons]
            completed_count = (
                db.query(LessonProgress)
                .filter(
                    LessonProgress.user_id == current_user.id,
                    LessonProgress.is_completed == True,
                    LessonProgress.lesson_id.in_(les_ids)
                )
                .count()
            )
            total_grade_completed += completed_count
            
            # Quiz average for this subject
            quizzes = db.query(Quiz).filter(Quiz.lesson_id.in_(les_ids)).all()
            quiz_ids = [q.id for q in quizzes]
            if quiz_ids:
                scores = (
                    db.query(func.avg(QuizAttempt.percentage))
                    .filter(
                        QuizAttempt.user_id == current_user.id,
                        QuizAttempt.quiz_id.in_(quiz_ids)
                    )
                    .scalar()
                )
                avg_subject_score = round(float(scores or 0.0), 1)

        rate = round((completed_count / lesson_count * 100), 1) if lesson_count > 0 else 0.0
        subject_items.append(SubjectProgressItem(
            subject_id=sub.id,
            code=sub.code,
            name_km=sub.name_km,
            name_en=sub.name_en,
            color=sub.color,
            icon_name=sub.icon_name,
            total_lessons=lesson_count,
            completed_lessons=completed_count,
            completion_rate=rate,
            average_quiz_score=avg_subject_score
        ))

    # Overall completion rate
    overall_rate = round((total_grade_completed / total_grade_lessons * 100), 1) if total_grade_lessons > 0 else 0.0

    # Quiz stats for this user
    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.completed_at.desc())
        .all()
    )
    total_quizzes = len(attempts)
    avg_score = 0.0
    if total_quizzes > 0:
        avg_score = round(sum(float(a.percentage) for a in attempts) / total_quizzes, 1)

    # Calculate earned stars: 1 star per 20% score on each passed attempt
    earned_stars = 0
    for a in attempts:
        if a.passed:
            earned_stars += max(1, int(float(a.percentage) // 25))

    recent_attempts = []
    for a in attempts[:6]:
        quiz = db.query(Quiz).filter(Quiz.id == a.quiz_id).first()
        recent_attempts.append(RecentQuizAttempt(
            attempt_id=a.id,
            quiz_title_km=quiz.title_km if quiz else "កម្រងសំណួរ",
            score=a.score,
            max_score=a.max_score,
            percentage=float(a.percentage),
            passed=a.passed,
            completed_at=a.completed_at
        ))

    # Dynamic Badges
    badges = [
        BadgeItem(
            id="first_step",
            name_km="ជំហានដំបូង (First Step)",
            description_km="បានបញ្ចប់មេរៀនដំបូងរបស់អ្នក",
            icon="Footprints",
            is_unlocked=total_grade_completed >= 1
        ),
        BadgeItem(
            id="quiz_champion",
            name_km="ជើងឯកតេស្ត (Quiz Star)",
            description_km="ទទួលបានពិន្ទុ ១០០% ក្នុងការធ្វើតេស្ត",
            icon="Award",
            is_unlocked=any(float(a.percentage) >= 100 for a in attempts)
        ),
        BadgeItem(
            id="bookworm",
            name_km="អ្នកស្រឡាញ់ការអាន (Bookworm)",
            description_km="បានរៀនចប់មេរៀនចំនួន ៥ ឬលើសពីនេះ",
            icon="BookOpenCheck",
            is_unlocked=total_grade_completed >= 5
        ),
        BadgeItem(
            id="math_wizard",
            name_km="អ្នកពូកែគណិត (Math Wizard)",
            description_km="បានប្រឡងជាប់តេស្តគណិតវិទ្យា",
            icon="Calculator",
            is_unlocked=any(a.passed for a in attempts)
        ),
        BadgeItem(
            id="tutor_friend",
            name_km="មិត្តល្អគ្រូឆ្លាត (AI Buddy)",
            description_km="បានសន្ទនា និងរៀនសូត្រជាមួយគ្រូឆ្លាត AI",
            icon="Bot",
            is_unlocked=True
        )
    ]

    return ProgressSummaryResponse(
        total_lessons=total_grade_lessons,
        completed_lessons=total_grade_completed,
        overall_completion_rate=overall_rate,
        average_quiz_score=avg_score,
        total_quizzes_taken=total_quizzes,
        earned_stars=earned_stars,
        subjects=subject_items,
        recent_attempts=recent_attempts,
        badges=badges
    )
