import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, Clock, HelpCircle, 
  ChevronLeft, ChevronRight, BookOpen, Volume2, Sparkles, Circle 
} from 'lucide-react';
import { LessonDetail } from '../types';
import { api } from '../services/api';
import { AudioReader } from '../components/AudioReader';
import { sounds } from '../utils/sound';
import { useAuth } from '../context/AuthContext';

interface LessonDetailPageProps {
  lessonId: string;
  onBackToSubject: () => void;
  onStartQuiz: (lessonId: string) => void;
  onNavigateLesson: (lessonId: string) => void;
}

export const LessonDetailPage: React.FC<LessonDetailPageProps> = ({
  lessonId,
  onBackToSubject,
  onStartQuiz,
  onNavigateLesson
}) => {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getLessonDetail(lessonId);
        setLesson(data);
        setIsCompleted(data.is_completed);
      } catch (err: any) {
        console.error("Failed to fetch lesson detail:", err);
        setError("មិនអាចផ្ទុកខ្លឹមសារមេរៀននេះបានឡើយ");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleToggleCompletion = async () => {
    if (!user) {
      sounds.playClick();
      alert("សូមចូលគណនីដើម្បីកត់ត្រាវឌ្ឍនភាពសិក្សារបស់អ្នក!");
      return;
    }

    setMarking(true);
    const nextStatus = !isCompleted;
    try {
      await api.completeLesson(lessonId, nextStatus);
      setIsCompleted(nextStatus);
      if (nextStatus) {
        sounds.playCorrect();
      } else {
        sounds.playClick();
      }
    } catch (err: any) {
      console.error("Failed to update progress:", err);
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-600 font-khmer">កំពុងផ្ទុកខ្លឹមសារមេរៀន...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 space-y-4">
        <p className="text-sm font-bold text-rose-700 font-khmer">{error || "រកមិនឃើញមេរៀននេះទេ"}</p>
        <button
          onClick={onBackToSubject}
          className="px-4 py-2 bg-white text-rose-700 border border-rose-300 rounded-xl text-xs font-bold font-khmer"
        >
          ត្រឡប់ទៅមុខវិជ្ជាវិញ
        </button>
      </div>
    );
  }

  // Extract clean text from HTML content for text-to-speech audio reader
  const cleanSummary = (lesson.summary_km || "") + " " + lesson.content_html.replace(/<[^>]*>?/gm, ' ');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick();
            onBackToSubject();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 rounded-2xl text-xs font-black transition-all shadow-2xs active:scale-95 font-khmer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ត្រឡប់ទៅបញ្ជីមេរៀន</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-full font-khmer shadow-2xs">
            {lesson.subject_name_km} • ថ្នាក់ទី {lesson.grade_level}
          </span>
        </div>
      </div>

      {/* Main Lesson Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        
        {/* Lesson Header Banner */}
        <div className="p-6 sm:p-9 bg-gradient-to-r from-blue-50/80 via-indigo-50/70 to-purple-50/80 border-b border-blue-100/80 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-black text-blue-800 bg-white border border-blue-200 px-3.5 py-1.5 rounded-full shadow-2xs font-khmer">
              {lesson.chapter_title_km}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-black text-slate-500 bg-white/70 px-3 py-1 rounded-full font-khmer">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{lesson.estimated_minutes} នាទី</span>
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full font-khmer shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>បានរៀនចប់</span>
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-khmer tracking-tight">
            {lesson.title_km}
          </h1>

          {lesson.summary_km && (
            <p className="text-sm text-slate-600 font-khmer leading-relaxed max-w-3xl">
              💡 {lesson.summary_km}
            </p>
          )}
        </div>

        {/* Audio Reader Toolbar */}
        <div className="p-6 sm:p-7 pb-2">
          <AudioReader 
            textToRead={cleanSummary} 
            label="ស្តាប់សំឡេងអានមេរៀននេះ (Listen Aloud)"
          />
        </div>

        {/* Lesson Media (Illustrations & Audio transcription) */}
        {lesson.media && lesson.media.length > 0 && (
          <div className="px-4 sm:px-8 py-4 space-y-4">
            {lesson.media.map((med) => (
              <div key={med.id} className="rounded-3xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
                {med.media_type === 'image' && (
                  <div className="text-center p-4">
                    <img
                      src={med.url}
                      alt={med.caption_km || lesson.title_km}
                      className="max-h-56 sm:max-h-84 w-full max-w-full object-contain mx-auto rounded-2xl shadow-md bg-white"
                    />
                    {med.caption_km && (
                      <p className="text-xs font-bold text-slate-600 mt-2.5 font-khmer">
                        📷 {med.caption_km}
                      </p>
                    )}
                  </div>
                )}
                {med.audio_script_km && (
                  <div className="p-4 sm:p-5 bg-amber-50/80 border-t border-amber-200/80">
                    <p className="text-xs font-black text-amber-900 mb-1 font-khmer flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-amber-600" />
                      <span>អត្ថបទសំឡេងពន្យល់ (Audio Transcript)៖</span>
                    </p>
                    <p className="text-xs sm:text-sm text-amber-900 font-khmer italic leading-relaxed">
                      «{med.audio_script_km}»
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formatted Lesson Content with Rich Children Typography */}
        <div className="p-4 sm:p-9 space-y-6">
          <div 
            className="lesson-body max-w-none text-slate-800 font-khmer leading-relaxed sm:leading-loose text-sm sm:text-base break-words"
            dangerouslySetInnerHTML={{ __html: lesson.content_html }}
          />
        </div>

        {/* Lesson Action Footer Bar */}
        <div className="p-4 sm:p-7 bg-slate-50 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <button
            onClick={handleToggleCompletion}
            disabled={marking}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-sm active:scale-95 font-khmer ${
              isCompleted
                ? 'btn-3d-emerald text-white'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
            <span>{isCompleted ? 'បានរៀនចប់រួចរាល់ ✅' : 'សម្គាល់ថាបានរៀនចប់'}</span>
          </button>

          {lesson.has_quiz && (
            <button
              onClick={() => {
                sounds.playClick();
                onStartQuiz(lesson.id);
              }}
              className="btn-3d-amber px-7 py-3 rounded-2xl text-slate-900 font-black text-xs sm:text-sm flex items-center gap-2.5 font-khmer"
            >
              <HelpCircle className="w-5 h-5 text-slate-950" />
              <span>ធ្វើតេស្តវាស់សមត្ថភាព 📝</span>
            </button>
          )}
        </div>
      </div>

      {/* Next and Previous Lesson Navigation */}
      <div className="flex items-center justify-between pt-2">
        {lesson.prev_lesson_id ? (
          <button
            onClick={() => {
              sounds.playClick();
              onNavigateLesson(lesson.prev_lesson_id!);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all shadow-2xs font-khmer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>មេរៀនមុន</span>
          </button>
        ) : <div />}

        {lesson.next_lesson_id ? (
          <button
            onClick={() => {
              sounds.playClick();
              onNavigateLesson(lesson.next_lesson_id!);
            }}
            className="btn-3d-blue flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black text-white font-khmer"
          >
            <span>មេរៀនបន្ទាប់</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : <div />}
      </div>

    </div>
  );
};
