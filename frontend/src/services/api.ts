import {
  AuthResponse, Subject, Chapter, LessonDetail,
  QuizPublic, QuizSubmissionResult, ProgressSummary,
  TutorChatResponse, TeacherStats, StudentRosterItem
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('khmer_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };
    
    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        let errorDetail = 'មានបញ្ហាក្នុងការតភ្ជាប់ (Connection error)';
        try {
          const errData = await response.json();
          errorDetail = errData.detail || errData.message || errorDetail;
        } catch {
          // fallback
        }
        throw new Error(errorDetail);
      }
      
      return await response.json();
    } catch (err: any) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // --- AUTH ---
  async login(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  async register(data: {
    username: string;
    password: string;
    full_name: string;
    email?: string;
    role: string;
    grade_level?: number;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMe(): Promise<any> {
    return this.request('/auth/me');
  }

  // --- SUBJECTS ---
  async getSubjects(gradeLevel: number): Promise<Subject[]> {
    return this.request<Subject[]>(`/subjects?grade_level=${gradeLevel}`);
  }

  async getSubjectChapters(subjectId: string): Promise<Chapter[]> {
    return this.request<Chapter[]>(`/subjects/${subjectId}/chapters`);
  }

  // --- LESSONS ---
  async getLessonDetail(lessonId: string): Promise<LessonDetail> {
    return this.request<LessonDetail>(`/lessons/${lessonId}`);
  }

  async completeLesson(lessonId: string, isCompleted: boolean = true): Promise<{ status: string; is_completed: boolean }> {
    return this.request(`/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ is_completed: isCompleted })
    });
  }

  // --- QUIZZES ---
  async getQuizByLesson(lessonId: string): Promise<QuizPublic> {
    return this.request<QuizPublic>(`/quizzes/by-lesson/${lessonId}`);
  }

  async submitQuiz(quizId: string, answers: { question_id: string; student_answer: string }[]): Promise<QuizSubmissionResult> {
    return this.request<QuizSubmissionResult>(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  // --- PROGRESS ---
  async getProgressSummary(gradeLevel?: number): Promise<ProgressSummary> {
    const query = gradeLevel ? `?grade_level=${gradeLevel}` : '';
    return this.request<ProgressSummary>(`/progress/summary${query}`);
  }

  // --- AI TUTOR ---
  async chatWithTutor(data: {
    message: string;
    grade_level?: number;
    subject_code?: string;
    conversation_id?: string;
  }): Promise<TutorChatResponse> {
    return this.request<TutorChatResponse>('/tutor/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- TEACHER ---
  async getTeacherStats(): Promise<TeacherStats> {
    return this.request<TeacherStats>('/teacher/stats');
  }

  async getTeacherStudents(): Promise<StudentRosterItem[]> {
    return this.request<StudentRosterItem[]>('/teacher/students');
  }

  async createLesson(data: {
    chapter_id: string;
    lesson_number: number;
    title_km: string;
    summary_km?: string;
    content_html: string;
    estimated_minutes: number;
  }): Promise<LessonDetail> {
    return this.request<LessonDetail>('/teacher/lessons', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteLesson(lessonId: string): Promise<{ status: string }> {
    return this.request(`/teacher/lessons/${lessonId}`, {
      method: 'DELETE'
    });
  }
}

export const api = new ApiService();
