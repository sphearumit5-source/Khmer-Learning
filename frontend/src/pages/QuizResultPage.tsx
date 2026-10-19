import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, CheckCircle2, XCircle, RotateCcw, 
  BookOpen, Star, Sparkles 
} from 'lucide-react';
import { QuizSubmissionResult } from '../types';
import { sounds } from '../utils/sound';

interface QuizResultPageProps {
  result: QuizSubmissionResult;
  onRetry: () => void;
  onBackToLesson: () => void;
}

export const QuizResultPage: React.FC<QuizResultPageProps> = ({
  result,
  onRetry,
  onBackToLesson
}) => {
  useEffect(() => {
    if (result.passed) {
      sounds.playFanfare();
      // Trigger double joyful confetti burst!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } else {
      sounds.playWrong();
    }
  }, [result.passed]);

  // Determine star count (1 to 3 stars)
  const starCount = result.percentage >= 90 ? 3 : result.percentage >= 60 ? 2 : 1;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      {/* Top Victory / Result Card */}
      <div className={`p-8 sm:p-12 rounded-3xl text-center shadow-2xl text-white relative overflow-hidden border border-white/20 ${
        result.passed
          ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-700'
          : 'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600'
      }`}>
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md shadow-xl mx-auto border-2 border-white/30 animate-bounce-short">
            <Award className="w-14 h-14 text-yellow-300 drop-shadow-md" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-white/80 font-khmer">
              លទ្ធផលតេស្តវាស់សមត្ថភាព
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mt-1 font-khmer">
              {result.quiz_title_km}
            </h1>
          </div>

          {/* Stars Showcase */}
          <div className="flex items-center justify-center gap-3 py-2">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-10 h-10 ${
                  star <= starCount
                    ? 'text-yellow-300 fill-yellow-300 scale-110 drop-shadow-lg animate-pulse-glow'
                    : 'text-white/25'
                } transition-all duration-300`}
              />
            ))}
          </div>

          {/* Score Badge */}
          <div className="inline-block bg-white/20 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/30 shadow-lg">
            <p className="text-5xl sm:text-6xl font-black tracking-tight">
              {result.percentage}%
            </p>
            <p className="text-xs font-black text-white/90 mt-1 font-khmer">
              ទទួលបាន {result.score} នៃ {result.max_score} ពិន្ទុ
            </p>
          </div>

          {/* Feedback message in Khmer */}
          <p className="text-base sm:text-lg font-black text-white max-w-lg mx-auto font-khmer leading-relaxed">
            {result.congratulatory_message_km}
          </p>

          {/* Actions */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => {
                sounds.playClick();
                onRetry();
              }}
              className="px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black text-xs transition-all flex items-center gap-2 font-khmer border border-white/20 shadow-sm active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ធ្វើតេស្តម្តងទៀត</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onBackToLesson();
              }}
              className="px-7 py-3 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs shadow-xl transition-all flex items-center gap-2 font-khmer active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>ត្រឡប់ទៅមេរៀន 📖</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-khmer flex items-center gap-2">
            <span>🔍 ពិនិត្យចម្លើយ និងការពន្យល់លម្អិត</span>
          </h2>
          <p className="text-xs text-slate-500 font-khmer">
            អានការពន្យល់ខាងក្រោមដើម្បីយល់ដឹងកាន់តែច្បាស់ពីមេរៀន
          </p>
        </div>

        <div className="space-y-4">
          {result.details.map((detail, index) => (
            <div
              key={detail.question_id}
              className={`p-6 rounded-3xl border-2 bg-white shadow-sm space-y-3.5 transition-all ${
                detail.is_correct ? 'border-emerald-200' : 'border-rose-200'
              }`}
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-2xl flex-shrink-0 mt-0.5 shadow-2xs ${
                    detail.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {detail.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-400 font-khmer">
                      សំណួរទី {index + 1}
                    </span>
                    <h3 className="text-base font-black text-slate-900 font-khmer mt-0.5 leading-snug">
                      {detail.question_text_km}
                    </h3>
                  </div>
                </div>

                <span className={`text-xs font-black px-3 py-1 rounded-full font-khmer flex-shrink-0 border ${
                  detail.is_correct 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  +{detail.points_awarded}/{detail.max_points} ពិន្ទុ
                </span>
              </div>

              {/* Answers breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-khmer">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-slate-500 font-bold">ចម្លើយរបស់កូន៖</p>
                  <p className={`font-black mt-1 text-sm ${detail.is_correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {detail.student_answer || "(មិនបានឆ្លើយ)"}
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <p className="text-emerald-700 font-bold">ចម្លើយត្រឹមត្រូវ៖</p>
                  <p className="font-black mt-1 text-sm text-emerald-900">
                    {detail.correct_answer === 'true' ? 'ត្រូវ (True)' : detail.correct_answer === 'false' ? 'ខុស (False)' : detail.correct_answer}
                  </p>
                </div>
              </div>

              {/* Explanation in Khmer */}
              {detail.explanation_km && (
                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/90 text-xs text-amber-950 font-khmer shadow-2xs">
                  <p className="font-black flex items-center gap-1.5 mb-1 text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>ការពន្យល់បន្ថែម៖</span>
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    {detail.explanation_km}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
