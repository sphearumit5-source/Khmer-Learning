export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  role: UserRole;
  grade_level?: number;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Subject {
  id: string;
  code: string;
  name_km: string;
  name_en: string;
  description_km?: string;
  icon_name: string;
  color: string;
  grade_level: number;
  chapters_count: number;
  lessons_count: number;
  completed_lessons_count: number;
}

export interface LessonItem {
  id: string;
  chapter_id: string;
  lesson_number: number;
  title_km: string;
  summary_km?: string;
  estimated_minutes: number;
  order_index: number;
  is_completed: boolean;
  has_quiz: boolean;
}

export interface Chapter {
  id: string;
  chapter_number: number;
  title_km: string;
  description_km?: string;
  lessons: LessonItem[];
}

export interface LessonMedia {
  id: string;
  media_type: 'image' | 'audio' | 'video';
  url: string;
  caption_km?: string;
  audio_script_km?: string;
}

export interface LessonDetail {
  id: string;
  chapter_id: string;
  chapter_title_km: string;
  subject_id: string;
  subject_name_km: string;
  grade_level: number;
  lesson_number: number;
  title_km: string;
  summary_km?: string;
  content_html: string;
  estimated_minutes: number;
  media: LessonMedia[];
  has_quiz: boolean;
  quiz_id?: string;
  is_completed: boolean;
  prev_lesson_id?: string;
  next_lesson_id?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionPublic {
  id: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank';
  question_text_km: string;
  points: number;
  order_index: number;
  hint_km?: string;
  options?: QuestionOption[];
}

export interface QuizPublic {
  id: string;
  lesson_id: string;
  lesson_title_km: string;
  title_km: string;
  passing_score: number;
  duration_minutes: number;
  questions: QuestionPublic[];
}

export interface QuestionResultDetail {
  question_id: string;
  question_text_km: string;
  question_type: string;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
  points_awarded: number;
  max_points: number;
  explanation_km?: string;
}

export interface QuizSubmissionResult {
  attempt_id: string;
  quiz_id: string;
  quiz_title_km: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  congratulatory_message_km: string;
  details: QuestionResultDetail[];
}

export interface SubjectProgressItem {
  subject_id: string;
  code: string;
  name_km: string;
  name_en: string;
  color: string;
  icon_name: string;
  total_lessons: number;
  completed_lessons: number;
  completion_rate: number;
  average_quiz_score: number;
}

export interface RecentQuizAttempt {
  attempt_id: string;
  quiz_title_km: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  completed_at: string;
}

export interface BadgeItem {
  id: string;
  name_km: string;
  description_km: string;
  icon: string;
  is_unlocked: boolean;
}

export interface ProgressSummary {
  total_lessons: number;
  completed_lessons: number;
  overall_completion_rate: number;
  average_quiz_score: number;
  total_quizzes_taken: number;
  earned_stars: number;
  subjects: SubjectProgressItem[];
  recent_attempts: RecentQuizAttempt[];
  badges: BadgeItem[];
}

export interface TutorMessage {
  id?: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface TutorChatResponse {
  reply: string;
  conversation_id: string;
  is_fallback: boolean;
  model_name: string;
  answer_source: 'ai_live' | 'lessons' | 'built_in';
  suggested_questions: string[];
}

export interface TeacherStats {
  total_students: number;
  total_lessons: number;
  total_quizzes: number;
  average_class_score: number;
}

export interface StudentRosterItem {
  id: string;
  full_name: string;
  username: string;
  grade_level: number;
  completed_lessons: number;
  total_lessons: number;
  average_quiz_score: number;
  last_active?: string;
}
