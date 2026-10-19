from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_optional_user
from app.models.models import Subject, Chapter, Lesson, LessonProgress, User
from app.schemas.schemas import SubjectResponse, ChapterWithLessons, LessonItem

router = APIRouter(prefix="/subjects", tags=["មុខវិជ្ជា (Subjects)"])

@router.get("", response_model=List[SubjectResponse])
def get_subjects(
    grade_level: int = Query(default=3, ge=1, le=6),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    subjects = db.query(Subject).filter(Subject.grade_level == grade_level).order_by(Subject.created_at).all()
    
    result = []
    for sub in subjects:
        # Count chapters and lessons
        chapters = db.query(Chapter).filter(Chapter.subject_id == sub.id).all()
        chapter_ids = [c.id for c in chapters]
        
        total_lessons = 0
        if chapter_ids:
            total_lessons = db.query(Lesson).filter(Lesson.chapter_id.in_(chapter_ids)).count()
        
        completed_lessons = 0
        if current_user and chapter_ids:
            completed_lessons = (
                db.query(LessonProgress)
                .join(Lesson, LessonProgress.lesson_id == Lesson.id)
                .filter(
                    LessonProgress.user_id == current_user.id,
                    LessonProgress.is_completed == True,
                    Lesson.chapter_id.in_(chapter_ids)
                )
                .count()
            )
        
        result.append(SubjectResponse(
            id=sub.id,
            code=sub.code,
            name_km=sub.name_km,
            name_en=sub.name_en,
            description_km=sub.description_km,
            icon_name=sub.icon_name,
            color=sub.color,
            grade_level=sub.grade_level,
            chapters_count=len(chapters),
            lessons_count=total_lessons,
            completed_lessons_count=completed_lessons
        ))
    
    return result

@router.get("/{subject_id}/chapters", response_model=List[ChapterWithLessons])
def get_subject_chapters(
    subject_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="រកមិនឃើញមុខវិជ្ជានេះឡើយ (Subject not found)"
        )
    
    chapters = (
        db.query(Chapter)
        .filter(Chapter.subject_id == subject_id)
        .order_by(Chapter.chapter_number)
        .all()
    )
    
    # Get user completed lesson IDs if logged in
    completed_ids = set()
    if current_user:
        records = (
            db.query(LessonProgress.lesson_id)
            .filter(
                LessonProgress.user_id == current_user.id,
                LessonProgress.is_completed == True
            )
            .all()
        )
        completed_ids = {r[0] for r in records}
    
    result = []
    for chap in chapters:
        lessons = (
            db.query(Lesson)
            .filter(Lesson.chapter_id == chap.id)
            .order_by(Lesson.lesson_number)
            .all()
        )
        
        lesson_items = []
        for les in lessons:
            has_quiz = les.quiz is not None
            lesson_items.append(LessonItem(
                id=les.id,
                chapter_id=les.chapter_id,
                lesson_number=les.lesson_number,
                title_km=les.title_km,
                summary_km=les.summary_km,
                estimated_minutes=les.estimated_minutes,
                order_index=les.order_index,
                is_completed=les.id in completed_ids,
                has_quiz=has_quiz
            ))
        
        result.append(ChapterWithLessons(
            id=chap.id,
            chapter_number=chap.chapter_number,
            title_km=chap.title_km,
            description_km=chap.description_km,
            lessons=lesson_items
        ))
    
    return result
