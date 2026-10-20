import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, BookOpen, Clock, CheckCircle2, 
  Circle, HelpCircle, ChevronRight, Sparkles 
} from 'lucide-react';
import { Subject, Chapter } from '../types';
import { api } from '../services/api';
import { sounds } from '../utils/sound';

interface SubjectPageProps {
  subject: Subject;
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export const SubjectPage: React.FC<SubjectPageProps> = ({ 
  subject, 
  onBack, 
  onSelectLesson 
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapters = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getSubjectChapters(subject.id);
        setChapters(data);
      } catch (err: any) {
        console.error("Failed to fetch chapters:", err);
        setError("មិនអាចផ្ទុកមេរៀននៃមុខវិជ្ជានេះបានឡើយ");
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [subject.id]);

  const handleLessonClick = (lessonId: string) => {
    sounds.playClick();
    onSelectLesson(lessonId);
  };

  const getSubjectBannerTheme = (code: string) => {
    switch (code) {
      case 'math':
        return {
          gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
          badge: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30'
        };
      case 'english':
        return {
          gradient: 'from-purple-600 via-pink-600 to-indigo-700',
          badge: 'bg-purple-400/20 text-purple-100 border-purple-300/30'
        };
      case 'social_studies':
        return {
          gradient: 'from-amber-500 via-orange-600 to-rose-700',
          badge: 'bg-amber-400/20 text-amber-100 border-amber-300/30'
        };
      case 'khmer':
      default:
        return {
          gradient: 'from-blue-600 via-indigo-600 to-purple-700',
          badge: 'bg-blue-400/20 text-blue-100 border-blue-300/30'
        };
    }
  };

  const theme = getSubjectBannerTheme(subject.code);
  const totalLessonsCount = chapters.reduce((acc, c) => acc + c.lessons.length, 0);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="px-4 py-2 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-black shadow-2xs active:scale-95 font-khmer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ត្រឡប់ទៅទំព័រដើម</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-khmer">
          ថ្នាក់ទី {subject.grade_level}
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-khmer">
          {subject.name_km}
        </span>
      </div>

      {/* Subject Header Banner */}
      <div className={`bg-gradient-to-r ${theme.gradient} rounded-3xl p-5 sm:p-10 text-white shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md ${theme.badge} font-khmer`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ថ្នាក់ទី {subject.grade_level} • {subject.name_en}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black font-khmer">
              {subject.name_km}
            </h1>

            <p className="text-xs sm:text-sm text-white/90 font-khmer leading-relaxed">
              {subject.description_km || `កម្មវិធីសិក្សាពេញលេញសម្រាប់មុខវិជ្ជា ${subject.name_km} ថ្នាក់ទី ${subject.grade_level}`}
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md p-5 rounded-3xl text-center border border-white/20 shadow-sm min-w-[130px]">
            <p className="text-3xl font-black text-yellow-300">
              {totalLessonsCount}
            </p>
            <p className="text-xs text-white/90 font-bold font-khmer mt-0.5">មេរៀនសរុប</p>
          </div>
        </div>
      </div>

      {/* Chapters & Lessons Listing */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600 font-khmer">កំពុងផ្ទុកបញ្ជីជំពូក និងមេរៀន...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 text-rose-700 font-bold text-sm">
          {error}
        </div>
      ) : chapters.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <BookOpen className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 font-khmer">មិនទាន់មានមេរៀននៅឡើយទេ</h3>
          <p className="text-xs text-slate-400 mt-1 font-khmer">លោកគ្រូអ្នកគ្រូអាចបន្ថែមមេរៀនថ្មីនៅក្នុងផ្ទាំងគ្រប់គ្រងគ្រូ</p>
        </div>
      ) : (
        <div className="space-y-6">
          {chapters.map((chap) => (
            <div key={chap.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
              {/* Chapter Title Header */}
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-khmer">
                    ជំពូកទី {chap.chapter_number}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-2 font-khmer">
                    {chap.title_km}
                  </h2>
                  {chap.description_km && (
                    <p className="text-xs text-slate-500 mt-0.5 font-khmer">{chap.description_km}</p>
                  )}
                </div>

                <span className="text-xs font-bold text-slate-400 self-start sm:self-auto font-khmer">
                  {chap.lessons.length} មេរៀនក្នុងជំពូកនេះ
                </span>
              </div>

              {/* Lessons Grid in this chapter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {chap.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson.id)}
                    className="p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer bg-slate-50/50 hover:bg-white flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-full font-khmer">
                          មេរៀនទី {lesson.lesson_number}
                        </span>
                        
                        {lesson.is_completed ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-khmer shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>បានរៀនចប់</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full font-khmer">
                            <Circle className="w-3 h-3 text-slate-300" />
                            <span>មិនទាន់រៀន</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors font-khmer leading-snug">
                        {lesson.title_km}
                      </h3>

                      {lesson.summary_km && (
                        <p className="text-xs text-slate-500 line-clamp-2 font-khmer leading-relaxed">
                          {lesson.summary_km}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 mt-4 text-xs font-khmer">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-500 font-bold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lesson.estimated_minutes} នាទី</span>
                        </span>
                        {lesson.has_quiz && (
                          <span className="flex items-center gap-1 text-amber-800 font-black bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span>មានតេស្ត</span>
                          </span>
                        )}
                      </div>

                      <span className="text-blue-600 font-black group-hover:translate-x-1.5 transition-transform flex items-center gap-0.5">
                        <span>ចូលរៀន</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
