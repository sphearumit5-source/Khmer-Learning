from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import TutorConversation, TutorMessage, User
from app.schemas.schemas import TutorChatRequest, TutorChatResponse, TutorMessageItem
from app.services.tutor_service import generate_tutor_response

router = APIRouter(prefix="/tutor", tags=["គ្រូឆ្លាត AI (AI Tutor)"])

@router.post("/chat", response_model=TutorChatResponse)
async def chat_with_tutor(
    req: TutorChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find or create conversation
    conv = None
    if req.conversation_id:
        conv = (
            db.query(TutorConversation)
            .filter(
                TutorConversation.id == req.conversation_id,
                TutorConversation.user_id == current_user.id
            )
            .first()
        )
    
    if not conv:
        conv = TutorConversation(
            user_id=current_user.id,
            grade_level=req.grade_level,
            subject_code=req.subject_code or "khmer",
            title=f"ការសន្ទនាអំពី {req.subject_code or 'ទូទៅ'} ថ្នាក់ទី {req.grade_level}"
        )
        db.add(conv)
        db.flush()

    # Save user message
    user_msg = TutorMessage(
        conversation_id=conv.id,
        sender="user",
        content=req.message
    )
    db.add(user_msg)

    # Generate response
    reply_text, is_fallback, model_name, suggested, answer_source = await generate_tutor_response(
        message=req.message,
        grade_level=req.grade_level,
        subject_code=req.subject_code or "khmer",
        db=db
    )

    # Save tutor response
    bot_msg = TutorMessage(
        conversation_id=conv.id,
        sender="assistant",
        content=reply_text
    )
    db.add(bot_msg)
    db.commit()

    return TutorChatResponse(
        reply=reply_text,
        conversation_id=conv.id,
        is_fallback=is_fallback,
        model_name=model_name,
        answer_source=answer_source,
        suggested_questions=suggested
    )

@router.get("/conversations/{conv_id}/messages", response_model=List[TutorMessageItem])
def get_conversation_messages(
    conv_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = (
        db.query(TutorConversation)
        .filter(
            TutorConversation.id == conv_id,
            TutorConversation.user_id == current_user.id
        )
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="រកមិនឃើញប្រវត្តិសន្ទនានេះឡើយ (Conversation not found)"
        )

    messages = (
        db.query(TutorMessage)
        .filter(TutorMessage.conversation_id == conv.id)
        .order_by(TutorMessage.created_at)
        .all()
    )
    return [
        TutorMessageItem(
            sender=m.sender,
            content=m.content,
            created_at=m.created_at
        )
        for m in messages
    ]
