import React, { useState, useEffect } from 'react';
import { 
  Award, BookOpen, Star, Trophy, CheckCircle, 
  Sparkles, LogIn, TrendingUp, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProgressSummary } from '../types';
import { sounds } from '../utils/sound';

export const ProgressPage: React.FC = () => {
  const { user, selectedGrade, openAuthModal } = useAuth();
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await api.getProgressSummary(selectedGrade);
        setProgress(data);
      } catch (err: any) {
        console.error("Failed to load progress:", err);
        setError("មិនអាចទាញយកទិន្នន័យវឌ្ឍនភាពបានឡើយ");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, selectedGrade]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl">
          <Award className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-800 font-khmer">
            សូមចូលគណនីដើម្បីមើលវឌ្ឍនភាពសិក្សា
          </h2>
          <p className="text-sm text-slate-500 font-khmer max-w-md mx-auto leading-relaxed">
            ចូលគណនីដើម្បីកត់ត្រាមេរៀនដែលបានរៀន ពិន្ទុធ្វើតេស្ត ផ្កាយ និងមេដាយកិត្តិយសដែលកូនទទួលបាន!
          </p>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            openAuthModal();
          }}
          className="btn-3d-blue px-7 py-3 text-white font-black text-sm rounded-2xl flex items-center gap-2 mx-auto font-khmer"
        >
          <LogIn className="w-4 h-4" />
          <span>ចូលគណនីឥឡូវនេះ</span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-600 font-khmer">កំពុងគណនាវឌ្ឍនភាពសិក្សា...</p>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200">
        <p className="text-sm font-bold text-rose-700 font-khmer">{error || "មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Student Profile Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-9 text-white shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden border border-white/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
            alt={user.full_name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-white shadow-xl object-cover"
          />
        </div>

        <div className="relative z-10 space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-khmer">{user.full_name}</h1>
            <span className="text-xs font-black bg-white/20 backdrop-blur-md text-amber-200 border border-white/30 px-3.5 py-1 rounded-full font-khmer shadow-2xs">
              ថ្នាក់ទី {user.grade_level || selectedGrade}
            </span>
          </div>
          
          <p className="text-xs text-blue-100 font-khmer">
            ឈ្មោះគណនី៖ @{user.username} {user.email && `• ${user.email}`}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-black font-khmer">
            <div className="bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 border border-white/20">
              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              <span>{progress.earned_stars} ផ្កាយកិត្តិយស</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 border border-white/20">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>{progress.badges.filter(b => b.is_unlocked).length} មេដាយសម្រេចបាន</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed Lessons */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-2xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-xs font-black text-slate-400 font-khmer">មេរៀនបានរៀនចប់</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-khmer">
            {progress.completed_lessons} <span className="text-base text-slate-400">/ {progress.total_lessons}</span>
          </p>
          <p className="text-xs text-blue-600 font-black font-khmer">
            សម្រេចបាន {progress.overall_completion_rate}%
          </p>
        </div>

        {/* Average Quiz Score */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs">
            <CheckCircle className="w-6 h-6" />
          </div>
          <p className="text-xs font-black text-slate-400 font-khmer">ពិន្ទុមធ្យមតេស្ត</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-khmer">
            {progress.average_quiz_score}%
          </p>
          <p className="text-xs text-emerald-600 font-black font-khmer">
            បានធ្វើតេស្ត {progress.total_quizzes_taken} ដង
          </p>
        </div>

        {/* Earned Stars */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 shadow-2xs">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
          </div>
          <p className="text-xs font-black text-slate-400 font-khmer">ផ្កាយកិត្តិយស</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 font-khmer">
            {progress.earned_stars} ⭐
          </p>
          <p className="text-xs text-amber-700 font-black font-khmer">
            ទទួលពីការធ្វើតេស្តជាប់
          </p>
        </div>

        {/* Medals */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 shadow-2xs">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="text-xs font-black text-slate-400 font-khmer">មេដាយសម្រេចបាន</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-600 font-khmer">
            {progress.badges.filter(b => b.is_unlocked).length} <span className="text-base text-slate-400">/ {progress.badges.length}</span>
          </p>
          <p className="text-xs text-purple-700 font-black font-khmer">
            មេដាយកិត្តិយស
          </p>
        </div>
      </div>

      {/* Subject-by-Subject Progress Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-khmer flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>វឌ្ឍនភាពតាមមុខវិជ្ជា (ថ្នាក់ទី {selectedGrade})</span>
          </h2>
          <p className="text-xs text-slate-500 font-khmer mt-0.5">
            តាមដានអត្រានៃការរៀនចប់មេរៀន និងពិន្ទុតេស្តតាមមុខវិជ្ជានីមួយៗ
          </p>
        </div>

        <div className="space-y-5">
          {progress.subjects.map((sub) => (
            <div key={sub.subject_id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 hover:bg-white hover:shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-0">
                <div>
                  <span className="text-base font-black text-slate-900 font-khmer">
                    {sub.name_km}
                  </span>
                  <span className="text-xs text-slate-400 ml-2 font-bold font-khmer">({sub.name_en})</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-blue-700 font-khmer">
                    {sub.completion_rate}%
                  </span>
                  <span className="text-xs text-slate-500 font-bold ml-2 font-khmer">
                    ({sub.completed_lessons}/{sub.total_lessons} មេរៀន)
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700"
                  style={{ width: `${sub.completion_rate}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500 font-bold font-khmer pt-1">
                <span>ពិន្ទុតេស្តមធ្យម៖ <strong className="text-slate-800">{sub.average_quiz_score}%</strong></span>
                <span className={sub.completion_rate === 100 ? 'text-emerald-600 font-black' : 'text-slate-500'}>
                  {sub.completion_rate === 100 ? '🎉 បានរៀនចប់សព្វគ្រប់' : 'កំពុងបន្តការសិក្សា'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges & Achievements Showcase */}
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-khmer flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>មេដាយ និងពានរង្វាន់កិត្តិយស (Badges)</span>
          </h2>
          <p className="text-xs text-slate-500 font-khmer mt-0.5">
            ខិតខំរៀនសូត្រ និងធ្វើតេស្តឲ្យបានពិន្ទុល្អ ដើម្បីដោះសោមេដាយទាំងនេះ!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {progress.badges.map((b) => (
            <div
              key={b.id}
              className={`p-5 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                b.is_unlocked
                  ? 'border-amber-200 bg-amber-50/70 shadow-sm'
                  : 'border-slate-100 bg-slate-50 opacity-60'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                b.is_unlocked ? 'bg-gradient-to-tr from-amber-400 to-orange-400 text-white shadow-md' : 'bg-slate-200 text-slate-400'
              }`}>
                {b.is_unlocked ? '🏆' : '🔒'}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 font-khmer">{b.name_km}</h4>
                <p className="text-xs text-slate-500 font-khmer leading-relaxed">{b.description_km}</p>
                <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full font-khmer ${
                  b.is_unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {b.is_unlocked ? 'បានដោះសោ ✅' : 'មិនទាន់ដោះសោ'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Quiz Attempts History */}
      {progress.recent_attempts && progress.recent_attempts.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-khmer">
              🕒 ប្រវត្តិនៃការធ្វើតេស្តថ្មីៗ
            </h2>
            <p className="text-xs text-slate-500 font-khmer mt-0.5">
              កម្រងលំហាត់ដែលកូនបានធ្វើកន្លងមក
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs font-khmer">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="pb-3.5 font-black">កម្រងសំណួរ</th>
                  <th className="pb-3.5 font-black">ពិន្ទុ</th>
                  <th className="pb-3.5 font-black">ភាគរយ</th>
                  <th className="pb-3.5 font-black">លទ្ធផល</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {progress.recent_attempts.map((att) => (
                  <tr key={att.attempt_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 font-black text-slate-800">{att.quiz_title_km}</td>
                    <td className="py-3.5 text-slate-600 font-bold">{att.score} / {att.max_score}</td>
                    <td className="py-3.5 font-black text-blue-700">{att.percentage}%</td>
                    <td className="py-3.5">
                      <span className={`px-3 py-1 rounded-full font-black text-[10px] ${
                        att.passed ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {att.passed ? 'ជាប់ ✅' : 'ធ្លាក់ ❌'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
