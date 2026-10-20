from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- AUTH SCHEMAS ---
class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=150)
    email: Optional[str] = None
    role: str = Field(default="student")  # student, teacher, admin
    grade_level: Optional[int] = Field(default=3, ge=1, le=6)
    avatar_url: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    full_name: str
    email: Optional[str] = None
    role: str
    grade_level: Optional[int] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- SUBJECT & CHAPTER SCHEMAS ---
class ChapterSimple(BaseModel):
    id: str
    chapter_number: int
    title_km: str
    description_km: Optional[str] = None
    order_index: int

    class Config:
        from_attributes = True

class SubjectResponse(BaseModel):
    id: str
    code: str
    name_km: str
    name_en: str
    description_km: Optional[str] = None
    icon_name: str
    color: str
    grade_level: int
    chapters_count: Optional[int] = 0
    lessons_count: Optional[int] = 0
    completed_lessons_count: Optional[int] = 0

    class Config:
        from_attributes = True

# --- LESSON SCHEMAS ---
class LessonMediaResponse(BaseModel):
    id: str
    media_type: str
    url: str
    caption_km: Optional[str] = None
    audio_script_km: Optional[str] = None

    class Config:
        from_attributes = True

class LessonItem(BaseModel):
    id: str
    chapter_id: str
    lesson_number: int
    title_km: str
    summary_km: Optional[str] = None
    estimated_minutes: int
    order_index: int
    is_completed: bool = False
    has_quiz: bool = False

    class Config:
        from_attributes = True

class ChapterWithLessons(BaseModel):
    id: str
    chapter_number: int
    title_km: str
    description_km: Optional[str] = None
    lessons: List[LessonItem] = []

    class Config:
        from_attributes = True

class LessonDetailResponse(BaseModel):
    id: str
    chapter_id: str
    chapter_title_km: str
    subject_id: str
    subject_name_km: str
    grade_level: int
    lesson_number: int
    title_km: str
    summary_km: Optional[str] = None
    content_html: str
    estimated_minutes: int
    media: List[LessonMediaResponse] = []
    has_quiz: bool = False
    quiz_id: Optional[str] = None
    is_completed: bool = False
    next_lesson_id: Optional[str] = None
    prev_lesson_id: Optional[str] = None

    class Config:
        from_attributes = True

class LessonCreateUpdate(BaseModel):
    chapter_id: str
    lesson_number: int
    title_km: str
    summary_km: Optional[str] = None
    content_html: str
    estimated_minutes: int = 15
    order_index: int = 1

# --- QUIZ SCHEMAS ---
class QuestionOption(BaseModel):
    id: str
    text: str

class QuestionPublic(BaseModel):
    id: str
    question_type: str  # multiple_choice, true_false, fill_blank
    question_text_km: str
    points: int
    order_index: int
    hint_km: Optional[str] = None
    options: Optional[List[QuestionOption]] = None
    # NOTE: correct_answer is deliberately NOT included here for security!

class QuizPublicResponse(BaseModel):
    id: str
    lesson_id: str
    lesson_title_km: str
    title_km: str
    passing_score: int
    duration_minutes: int
    questions: List[QuestionPublic] = []

    class Config:
        from_attributes = True

class QuizAnswerSubmission(BaseModel):
    question_id: str
    student_answer: str

class QuizSubmissionRequest(BaseModel):
    answers: List[QuizAnswerSubmission]

class QuestionResultDetail(BaseModel):
    question_id: str
    question_text_km: str
    question_type: str
    student_answer: str
    correct_answer: str
    is_correct: bool
    points_awarded: int
    max_points: int
    explanation_km: Optional[str] = None

class QuizSubmissionResult(BaseModel):
    attempt_id: str
    quiz_id: str
    quiz_title_km: str
    score: int
    max_score: int
    percentage: float
    passed: bool
    congratulatory_message_km: str
    details: List[QuestionResultDetail]

class QuestionAdminCreateUpdate(BaseModel):
    id: Optional[str] = None
    question_type: str
    question_text_km: str
    points: int = 10
    order_index: int = 1
    hint_km: Optional[str] = None
    explanation_km: Optional[str] = None
    options: Optional[List[QuestionOption]] = None
    correct_answer: str

class QuizAdminResponse(BaseModel):
    id: str
    lesson_id: str
    title_km: str
    passing_score: int
    duration_minutes: int
    is_active: bool
    questions: List[QuestionAdminCreateUpdate] = []

    class Config:
        from_attributes = True

# --- PROGRESS SCHEMAS ---
class LessonProgressUpdate(BaseModel):
    is_completed: bool = True

class SubjectProgressItem(BaseModel):
    subject_id: str
    code: str
    name_km: str
    name_en: str
    color: str
    icon_name: str
    total_lessons: int
    completed_lessons: int
    completion_rate: float
    average_quiz_score: float

class RecentQuizAttempt(BaseModel):
    attempt_id: str
    quiz_title_km: str
    score: int
    max_score: int
    percentage: float
    passed: bool
    completed_at: datetime

class BadgeItem(BaseModel):
    id: str
    name_km: str
    description_km: str
    icon: str
    is_unlocked: bool

class ProgressSummaryResponse(BaseModel):
    total_lessons: int
    completed_lessons: int
    overall_completion_rate: float
    average_quiz_score: float
    total_quizzes_taken: int
    earned_stars: int
    subjects: List[SubjectProgressItem] = []
    recent_attempts: List[RecentQuizAttempt] = []
    badges: List[BadgeItem] = []

# --- AI TUTOR SCHEMAS ---
class TutorChatRequest(BaseModel):
    grade_level: Optional[int] = Field(default=None, ge=1, le=6)
    subject_code: Optional[str] = None
    message: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None

class TutorMessageItem(BaseModel):
    sender: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class TutorChatResponse(BaseModel):
    reply: str
    conversation_id: str
    is_fallback: bool = False
    model_name: str
    answer_source: str = "built_in"  # ai_live | lessons | built_in
    suggested_questions: List[str] = []

# --- TEACHER SCHEMAS ---
class TeacherStats(BaseModel):
    total_students: int
    total_lessons: int
    total_quizzes: int
    average_class_score: float

class StudentRosterItem(BaseModel):
    id: str
    full_name: str
    username: str
    grade_level: int
    completed_lessons: int
    total_lessons: int
    average_quiz_score: float
    last_active: Optional[datetime] = None
