import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { SubjectPage } from './pages/SubjectPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { QuizPage } from './pages/QuizPage';
import { QuizResultPage } from './pages/QuizResultPage';
import { ProgressPage } from './pages/ProgressPage';
import { AITutorPage } from './pages/AITutorPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { Subject, QuizSubmissionResult } from './types';
import { Heart, Sparkles, BookOpen } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null);

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentTab('subject');
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setCurrentTab('lesson');
  };

  const handleStartQuiz = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setCurrentTab('quiz');
  };

  const handleQuizCompleted = (result: QuizSubmissionResult) => {
    setQuizResult(result);
    setCurrentTab('quiz-result');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-khmer">
      {/* Navigation Bar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'home' && (
          <HomePage
            onSelectSubject={handleSelectSubject}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'subject' && selectedSubject && (
          <SubjectPage
            subject={selectedSubject}
            onBack={() => setCurrentTab('home')}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {currentTab === 'lesson' && selectedLessonId && (
          <LessonDetailPage
            lessonId={selectedLessonId}
            onBackToSubject={() => setCurrentTab('subject')}
            onStartQuiz={handleStartQuiz}
            onNavigateLesson={handleSelectLesson}
          />
        )}

        {currentTab === 'quiz' && selectedLessonId && (
          <QuizPage
            lessonId={selectedLessonId}
            onBackToLesson={() => setCurrentTab('lesson')}
            onQuizCompleted={handleQuizCompleted}
          />
        )}

        {currentTab === 'quiz-result' && quizResult && (
          <QuizResultPage
            result={quizResult}
            onRetry={() => setCurrentTab('quiz')}
            onBackToLesson={() => setCurrentTab('lesson')}
          />
        )}

        {currentTab === 'progress' && <ProgressPage />}

        {currentTab === 'tutor' && <AITutorPage />}

        {currentTab === 'teacher' && <TeacherDashboardPage />}
      </main>

      {/* Authentication Modal */}
      <AuthModal />

      {/* Child-Friendly Footer in Khmer */}
      <footer className="bg-white border-t border-amber-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-blue-700 font-black text-lg">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Khmer Learning • រៀនសូត្រដើម្បីអនាគតភ្លឺស្វាង</span>
          </div>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            ប្រព័ន្ធស្វ័យសិក្សាតាមប្រព័ន្ធបច្ចេកវិទ្យាឌីជីថល សម្រាប់សិស្សានុសិស្សបឋមសិក្សាកម្ពុជា ថ្នាក់ទី ១ ដល់ ទី ៦។
          </p>
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <span>រៀបចំឡើងដោយក្តីស្រឡាញ់ចំពោះការអប់រំកុមារកម្ពុជា</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
