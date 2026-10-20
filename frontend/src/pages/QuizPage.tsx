import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Lightbulb, ChevronRight, ChevronLeft, 
  Send, Sparkles, AlertCircle, HelpCircle, Star 
} from 'lucide-react';
import { QuizPublic, QuizSubmissionResult } from '../types';
import { api } from '../services/api';
import { sounds } from '../utils/sound';
import { useAuth } from '../context/AuthContext';

interface QuizPageProps {
  lessonId: string;
  onBackToLesson: () => void;
  onQuizCompleted: (result: QuizSubmissionResult) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  lessonId,
  onBackToLesson,
  onQuizCompleted
}) => {
  const { user, openAuthModal } = useAuth();
  const [quiz, setQuiz] = useState<QuizPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getQuizByLesson(lessonId);
        setQuiz(data);
      } catch (err: any) {
        console.error("Failed to load quiz:", err);
        setError("មិនអាចទាញយកកម្រងសំណួរនៃមេរៀននេះបានឡើយ");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [lessonId]);

  const handleSelectAnswer = (questionId: string, answerValue: string) => {
    sounds.playClick();
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerValue
    }));
  };

  const toggleHint = (questionId: string) => {
    sounds.playClick();
    setShowHint(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    if (!user) {
      sounds.playClick();
      alert("សូមចូលគណនីដើម្បីកត់ត្រាលទ្ធផលតេស្តរបស់អ្នក!");
      openAuthModal();
      return;
    }

    // Check if any unanswered
    const unanswered = quiz.questions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    if (unanswered.length > 0) {
      sounds.playClick();
      const confirmSubmit = window.confirm(`កូននៅសល់សំណួរចំនួន ${unanswered.length} មិនទាន់បានឆ្លើយ។ តើកូនពិតជាចង់បញ្ជូនចម្លើយឥឡូវនេះមែនទេ?`);
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const payload = quiz.questions.map(q => ({
        question_id: q.id,
        student_answer: answers[q.id] || ''
      }));

      const result = await api.submitQuiz(quiz.id, payload);
      onQuizCompleted(result);
    } catch (err: any) {
      sounds.playWrong();
      alert(err.message || "មានបញ្ហាក្នុងការបញ្ជូនចម្លើយ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-600 font-khmer">កំពុងរៀបចំកម្រងសំណួរ...</p>
      </div>
    );
  }

  if (error || !quiz || quiz.questions.length === 0) {
    return (
      <div className="p-8 text-center bg-amber-50 rounded-3xl border border-amber-200 space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <p className="text-sm font-bold text-amber-900 font-khmer">
          {error || "មេរៀននេះមិនទាន់មានសំណួរតេស្តនៅឡើយទេ"}
        </p>
        <button
          onClick={onBackToLesson}
          className="px-5 py-2.5 bg-white text-amber-900 border border-amber-300 rounded-2xl text-xs font-bold font-khmer shadow-sm"
        >
          ត្រឡប់ទៅមេរៀនវិញ
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const currentAnswer = answers[currentQuestion.id] || '';
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const answeredCount = Object.keys(answers).filter(k => answers[k] && answers[k].trim() !== '').length;

  const optionColors = [
    { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', activeBg: 'bg-blue-50' },
    { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', activeBg: 'bg-emerald-50' },
    { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200', activeBg: 'bg-purple-50' },
    { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', activeBg: 'bg-amber-50' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick();
            onBackToLesson();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 rounded-2xl text-xs font-black transition-all shadow-2xs font-khmer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ចាកចេញពីការធ្វើតេស្ត</span>
        </button>

        <span className="text-xs font-black text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full font-khmer shadow-2xs flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{quiz.title_km}</span>
        </span>
      </div>

      {/* Progress Bar & Indicators */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-slate-700 font-khmer flex items-center gap-1.5">
            <span>សំណួរទី {currentIndex + 1} នៃ {totalQuestions}</span>
          </span>
          <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-khmer">
            បានឆ្លើយ៖ {answeredCount} / {totalQuestions}
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question dots indicator */}
        <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
          {quiz.questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => {
                  sounds.playClick();
                  setCurrentIndex(idx);
                }}
                className={`w-8 h-8 rounded-full text-xs font-black transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'ring-4 ring-blue-300 bg-blue-600 text-white scale-110 shadow-sm'
                    : isAnswered
                    ? 'bg-emerald-500 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-md space-y-6">
        
        {/* Question Header */}
        <div className="space-y-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 font-khmer shadow-2xs">
              {currentQuestion.question_type === 'multiple_choice' 
                ? '📝 ពហុជ្រើសរើស (Multiple Choice)' 
                : currentQuestion.question_type === 'true_false' 
                ? '⚖️ ត្រូវ ឬ ខុស (True / False)' 
                : '✍️ បំពេញចន្លោះ (Fill in blank)'}
            </span>
            <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-khmer">
              ⭐ {currentQuestion.points} ពិន្ទុ
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-khmer leading-snug">
            {currentQuestion.question_text_km}
          </h2>
        </div>

        {/* Question Type: Multiple Choice */}
        {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
          <div className="grid grid-cols-1 gap-3.5 pt-1">
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = currentAnswer === opt.id;
              const colorConfig = optionColors[optIdx % optionColors.length];

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectAnswer(currentQuestion.id, opt.id)}
                  className={`p-4 sm:p-5 rounded-2xl text-left border-2 transition-all duration-200 flex items-center gap-4 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/90 shadow-md scale-[1.01] ring-2 ring-blue-300'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 transition-colors shadow-2xs ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border-2 border-slate-200 text-slate-700'
                  }`}>
                    {opt.id}
                  </div>
                  <span className={`text-base font-black font-khmer ${isSelected ? 'text-blue-950 font-black' : 'text-slate-800'}`}>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Question Type: True or False */}
        {currentQuestion.question_type === 'true_false' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <button
              onClick={() => handleSelectAnswer(currentQuestion.id, 'true')}
              className={`p-4 sm:p-8 rounded-3xl border-3 text-center transition-all flex flex-col items-center gap-2.5 ${
                currentAnswer === 'true'
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-105 ring-4 ring-emerald-200'
                  : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/30'
              }`}
            >
              <span className="text-4xl sm:text-5xl drop-shadow-sm">👍</span>
              <span className="text-xl font-black text-emerald-800 font-khmer">
                ត្រូវ (ពិតមែន)
              </span>
              <span className="text-[11px] text-slate-400 font-bold">True</span>
            </button>

            <button
              onClick={() => handleSelectAnswer(currentQuestion.id, 'false')}
              className={`p-4 sm:p-8 rounded-3xl border-3 text-center transition-all flex flex-col items-center gap-2.5 ${
                currentAnswer === 'false'
                  ? 'border-rose-500 bg-rose-50 shadow-lg scale-105 ring-4 ring-rose-200'
                  : 'border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50/30'
              }`}
            >
              <span className="text-4xl sm:text-5xl drop-shadow-sm">👎</span>
              <span className="text-xl font-black text-rose-800 font-khmer">
                ខុស (មិនពិតទេ)
              </span>
              <span className="text-[11px] text-slate-400 font-bold">False</span>
            </button>
          </div>
        )}

        {/* Question Type: Fill in blank */}
        {currentQuestion.question_type === 'fill_blank' && (
          <div className="pt-2 space-y-2.5">
            <label className="block text-xs font-black text-slate-600 font-khmer">
              វាយបញ្ចូលចម្លើយត្រឹមត្រូវជាភាសាខ្មែរ៖
            </label>
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
              placeholder="សរសេរចម្លើយនៅទីនេះ..."
              className="w-full px-5 py-3.5 text-lg font-black font-khmer rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50 focus:bg-white shadow-2xs"
            />
          </div>
        )}

        {/* Hint Box (Optional) */}
        {currentQuestion.hint_km && (
          <div className="pt-2">
            {showHint[currentQuestion.id] ? (
              <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 flex items-start gap-3 shadow-2xs">
                <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-amber-900 font-khmer">💡 តម្រុយជួយគិត៖</p>
                  <p className="text-xs font-bold text-amber-800 mt-0.5 font-khmer">{currentQuestion.hint_km}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => toggleHint(currentQuestion.id)}
                className="text-xs text-amber-700 font-black hover:text-amber-800 flex items-center gap-1.5 font-khmer bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>ត្រូវការតម្រុយជួយគិត? ចុចទីនេះ</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick();
            setCurrentIndex(prev => Math.max(0, prev - 1));
          }}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-2xs font-khmer active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>សំណួរមុន</span>
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-3d-emerald flex items-center gap-2 px-5 sm:px-8 py-3 text-white rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95 disabled:opacity-50 font-khmer"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'កំពុងគណនាពិន្ទុ...' : 'បញ្ជូនចម្លើយតេស្ត 🚀'}</span>
          </button>
        ) : (
          <button
            onClick={() => {
              sounds.playClick();
              setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1));
            }}
            className="btn-3d-blue flex items-center gap-2 px-7 py-3 text-white rounded-2xl text-xs font-black font-khmer"
          >
            <span>សំណួរបន្ទាប់</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};
