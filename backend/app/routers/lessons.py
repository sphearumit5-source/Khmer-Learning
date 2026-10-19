from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_optional_user, get_current_user
from app.models.models import Lesson, Chapter, Subject, LessonMedia, LessonProgress, User
from app.schemas.schemas import LessonDetailResponse, LessonMediaResponse, LessonProgressUpdate

router = APIRouter(prefix="/lessons", tags=["មេរៀន (Lessons)"])

@router.get("/{lesson_id}", response_model=LessonDetailResponse)
def get_lesson_detail(
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="រកមិនឃើញមេរៀននេះឡើយ (Lesson not found)"
        )
    
    chapter = db.query(Chapter).filter(Chapter.id == lesson.chapter_id).first()
    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first() if chapter else None

    # Find prev and next lesson in same chapter or adjacent chapters
    siblings = db.query(Lesson).filter(Lesson.chapter_id == lesson.chapter_id).order_by(Lesson.lesson_number).all()
    prev_id = None
    next_id = None
    for i, sib in enumerate(siblings):
        if sib.id == lesson.id:
            if i > 0:
                prev_id = siblings[i - 1].id
            if i < len(siblings) - 1:
                next_id = siblings[i + 1].id
            break

    # Check completion and update last_accessed_at if user is logged in
    is_completed = False
    if current_user:
        prog = (
            db.query(LessonProgress)
            .filter(
                LessonProgress.user_id == current_user.id,
                LessonProgress.lesson_id == lesson.id
            )
            .first()
        )
        if prog:
            is_completed = prog.is_completed
            prog.last_accessed_at = datetime.now(timezone.utc)
            db.commit()
        else:
            new_prog = LessonProgress(
                user_id=current_user.id,
                lesson_id=lesson.id,
                is_completed=False,
                last_accessed_at=datetime.now(timezone.utc)
            )
            db.add(new_prog)
            db.commit()

    media_items = [
        LessonMediaResponse(
            id=m.id,
            media_type=m.media_type,
            url=m.url,
            caption_km=m.caption_km,
            audio_script_km=m.audio_script_km
        )
        for m in lesson.media
    ]

    quiz_id = lesson.quiz.id if lesson.quiz and lesson.quiz.is_active else None

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
        media=media_items,
        has_quiz=quiz_id is not None,
        quiz_id=quiz_id,
        is_completed=is_completed,
        prev_lesson_id=prev_id,
        next_lesson_id=next_id
    )

@router.post("/{lesson_id}/complete")
def toggle_lesson_completion(
    lesson_id: str,
    update: LessonProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="រកមិនឃើញមេរៀននេះឡើយ (Lesson not found)"
        )
    
    prog = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson_id
        )
        .first()
    )

    now = datetime.now(timezone.utc)
    if prog:
        prog.is_completed = update.is_completed
        prog.last_accessed_at = now
        if update.is_completed and not prog.completed_at:
            prog.completed_at = now
    else:
        prog = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            is_completed=update.is_completed,
            last_accessed_at=now,
            completed_at=now if update.is_completed else None
        )
        db.add(prog)
    
    db.commit()
    return {
        "status": "success",
        "message": "បានកត់ត្រាវឌ្ឍនភាពមេរៀនដោយជោគជ័យ (Lesson progress saved successfully)",
        "is_completed": prog.is_completed
    }
