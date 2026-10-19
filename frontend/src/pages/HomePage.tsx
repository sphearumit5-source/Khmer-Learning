import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calculator, Globe, Compass, Sparkles, 
  Award, Bot, Star, ArrowRight, Zap, Flame, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Subject } from '../types';
import { sounds } from '../utils/sound';

interface HomePageProps {
  onSelectSubject: (subject: Subject) => void;
  onNavigateTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectSubject, onNavigateTab }) => {
  const { user, selectedGrade, setSelectedGrade } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getSubjects(selectedGrade);
        setSubjects(data);
      } catch (err: any) {
        console.error("Failed to load subjects:", err);
        setError("មិនអាចផ្ទុកទិន្នន័យមុខវិជ្ជាបានឡើយ សូមពិនិត្យការតភ្ជាប់ Backend");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [selectedGrade, user]);

  // Dynamic greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "អរុណសួស្តី";
    if (hour < 17) return "ទិវាសួស្តី";
    return "សាយណ្ហសួស្តី";
  };

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return Calculator;
      case 'Globe': return Globe;
      case 'Compass': return Compass;
      default: return BookOpen;
    }
  };

  const getSubjectDesign = (code: string) => {
    switch (code) {
      case 'khmer':
        return {
          gradient: 'from-blue-600 to-indigo-700',
          lightBg: 'bg-blue-50/70',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          bar: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          text: 'text-blue-700',
          emoji: '📖',
          tagline: 'រៀនអក្សរ ស្រៈ និងវេយ្យាករណ៍ខ្មែរ'
        };
      case 'math':
        return {
          gradient: 'from-emerald-500 to-teal-700',
          lightBg: 'bg-emerald-50/70',
          border: 'border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          bar: 'bg-gradient-to-r from-emerald-500 to-teal-600',
          text: 'text-emerald-700',
          emoji: '🔢',
          tagline: 'លេខ វិធីគណនា និងដោះស្រាយចំណោទ'
        };
      case 'english':
        return {
          gradient: 'from-purple-600 to-pink-600',
          lightBg: 'bg-purple-50/70',
          border: 'border-purple-200',
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          bar: 'bg-gradient-to-r from-purple-500 to-pink-500',
          text: 'text-purple-700',
          emoji: '🇬🇧',
          tagline: 'Conversation, Vocabulary & Phonics'
        };
      case 'social_studies':
      default:
        return {
          gradient: 'from-amber-500 to-orange-600',
          lightBg: 'bg-amber-50/70',
          border: 'border-amber-200',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
          text: 'text-amber-700',
          emoji: '🌏',
          tagline: 'បរិស្ថាន ធម្មជាតិ និងប្រវត្តិសាស្ត្រ'
        };
    }
  };

  const gradeList = [
    { grade: 1, title: 'ថ្នាក់ទី ១', emoji: '🌱', desc: 'មូលដ្ឋានដំបូង' },
    { grade: 2, title: 'ថ្នាក់ទី ២', emoji: '🌿', desc: 'ពង្រីកការអាន' },
    { grade: 3, title: 'ថ្នាក់ទី ៣', emoji: '🍀', desc: 'លំហាត់គុណចែក' },
    { grade: 4, title: 'ថ្នាក់ទី ៤', emoji: '🌸', desc: 'ការគិតស៊ីជម្រៅ' },
    { grade: 5, title: 'ថ្នាក់ទី ៥', emoji: '🌻', desc: 'ត្រៀមប្រឡង' },
    { grade: 6, title: 'ថ្នាក់ទី ៦', emoji: '🏆', desc: 'បញ្ចប់បឋមសិក្សា' },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Banner with Welcoming Cambodian Mascot */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-8 sm:p-12 text-white shadow-xl border border-indigo-500/30">
        {/* Decorative background blurs and circles */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-4 right-1/4 text-yellow-300 text-3xl animate-bounce-short select-none">✨</div>
        <div className="absolute bottom-6 right-10 text-amber-300 text-4xl animate-float select-none hidden lg:block">🌟</div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-amber-200 border border-white/20 shadow-sm font-khmer">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{getGreeting()}! សូមស្វាគមន៍ការសិក្សារីករាយ</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight font-khmer">
              {user ? (
                <>សួស្តីប្អូន <span className="text-amber-300">{user.full_name}</span>! 👋</>
              ) : (
                <>រៀនសូត្រដោយរីករាយ និង<span className="text-amber-300">ឆ្លាតវៃ</span>! 🚀</>
              )}
            </h1>
            
            <p className="text-sm sm:text-base text-blue-100 font-khmer leading-relaxed max-w-2xl">
              ប្រព័ន្ធស្វ័យសិក្សាថ្នាក់បឋមសិក្សាកម្ពុជា ថ្នាក់ទី ១ ដល់ ទី ៦។ រៀនមេរៀនតាមរូបភាព ស្តាប់សំឡេងអាន ធ្វើលំហាត់តេស្ត និងជជែកសួរនាំជាមួយគ្រូឆ្លាត AI គ្រប់ពេលវេលា!
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  onNavigateTab('tutor');
                }}
                className="btn-3d-amber px-6 py-3 rounded-2xl text-slate-900 font-black text-xs sm:text-sm flex items-center gap-2 font-khmer"
              >
                <Bot className="w-5 h-5 text-slate-950" />
                <span>សួរគ្រូឆ្លាត AI 🤖</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  onNavigateTab('progress');
                }}
                className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 border border-white/20 shadow-sm font-khmer"
              >
                <Award className="w-5 h-5 text-amber-300" />
                <span>មើលវឌ្ឍនភាពសិក្សា 🏆</span>
              </button>
            </div>
          </div>

          {/* Mascot Illustration Box */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative">
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-tr from-amber-400/90 to-orange-500/90 p-4 shadow-2xl flex flex-col items-center justify-center text-center border-4 border-white/40 animate-float">
                <span className="text-6xl sm:text-7xl mb-2 drop-shadow-md">🦉</span>
                <span className="text-sm font-black text-white font-khmer">គ្រូឆ្លាត សុវណ្ណ</span>
                <span className="text-[11px] font-bold text-amber-100 font-khmer">AI Tutor កុមារ</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1 font-khmer">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>ត្រៀមជួយ ២៤/៧</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grade Selector - Tactile Bouncy Carousel Cards */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-800 font-khmer flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>ជ្រើសរើសកម្រិតថ្នាក់សិក្សា</span>
            </h2>
            <p className="text-xs text-slate-500 font-khmer">
              ជ្រើសរើសថ្នាក់ដែលកូនកំពុងរៀន ដើម្បីទទួលបានមេរៀនសមស្របតាមកម្មវិធីជាតិ
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full font-khmer shadow-2xs">
              ★ កំពុងរៀន៖ ថ្នាក់ទី {selectedGrade}
            </span>
          </div>
        </div>

        {/* Grade Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-1">
          {gradeList.map((g) => {
            const isSelected = selectedGrade === g.grade;
            return (
              <button
                key={g.grade}
                onClick={() => setSelectedGrade(g.grade)}
                className={`p-4 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center text-center gap-1.5 border-2 ${
                  isSelected
                    ? 'border-blue-600 bg-gradient-to-b from-blue-50 to-indigo-50/70 text-blue-700 shadow-md scale-[1.04] ring-2 ring-blue-400/30'
                    : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-white text-slate-700 hover:shadow-sm'
                }`}
              >
                <span className="text-3xl mb-0.5 transform transition-transform group-hover:scale-110">
                  {g.emoji}
                </span>
                <span className="text-sm font-black font-khmer">{g.title}</span>
                <span className="text-[10px] text-slate-400 font-semibold font-khmer">{g.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Subjects Grid */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-khmer flex items-center gap-2">
              <span>📚 មុខវិជ្ជាសិក្សា ថ្នាក់ទី {selectedGrade}</span>
            </h2>
            <p className="text-xs text-slate-500 font-khmer mt-0.5">
              ជ្រើសរើសមុខវិជ្ជាខាងក្រោម ដើម្បីចូលអានមេរៀន ស្តាប់សំឡេង និងធ្វើលំហាត់តេស្ត
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600 font-khmer">កំពុងផ្ទុកបញ្ជីមុខវិជ្ជា...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200">
            <p className="text-sm font-bold text-rose-700 font-khmer">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((sub) => {
              const Icon = getSubjectIcon(sub.icon_name);
              const design = getSubjectDesign(sub.code);
              const completionPercent = sub.lessons_count > 0 
                ? Math.round((sub.completed_lessons_count / sub.lessons_count) * 100) 
                : 0;

              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectSubject(sub);
                  }}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Decorative top corner accent */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${design.gradient} opacity-10 rounded-bl-full pointer-events-none`} />

                  <div className="space-y-4">
                    {/* Icon & Subject Tag */}
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${design.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <span className={`text-[11px] font-black px-3 py-1 rounded-full border shadow-2xs font-khmer ${design.badge}`}>
                        {sub.name_en}
                      </span>
                    </div>

                    {/* Subject Names */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{design.emoji}</span>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors font-khmer">
                          {sub.name_km}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-khmer line-clamp-2">
                        {design.tagline}
                      </p>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="pt-2 space-y-1.5">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-slate-600 font-khmer">វឌ្ឍនភាពសិក្សា</span>
                        <span className={design.text}>{completionPercent}%</span>
                      </div>
                      
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                        <div
                          className={`h-full ${design.bar} rounded-full transition-all duration-700`}
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold font-khmer pt-0.5">
                        <span>{sub.completed_lessons_count}/{sub.lessons_count} មេរៀន</span>
                        {completionPercent === 100 && (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> រៀនចប់
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tactile Button */}
                  <div className="pt-6">
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 transition-all group-hover:shadow-md font-khmer"
                    >
                      <span>ចូលរៀនមេរៀន</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Highlights & Interactive Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* AI Tutor Card */}
        <div 
          onClick={() => {
            sounds.playClick();
            onNavigateTab('tutor');
          }}
          className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 rounded-3xl p-7 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-between gap-5 relative overflow-hidden group"
        >
          <div className="space-y-2.5 z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-xs font-black px-3 py-1 rounded-full text-amber-200 border border-white/20 font-khmer">
              <Bot className="w-3.5 h-3.5 text-amber-300" />
              <span>ជំនួយការឆ្លាតវៃ AI</span>
            </span>
            <h3 className="text-2xl font-black font-khmer">គ្រូឆ្លាត AI សម្រាប់កុមារ 🤖</h3>
            <p className="text-xs sm:text-sm text-blue-100 font-khmer max-w-sm leading-relaxed">
              ឆ្ងល់មេរៀន មិនយល់វិធីគណនា ឬចង់ដឹងអត្ថន័យពាក្យ? សួរគ្រូឆ្លាត AI បានភ្លាមៗជាភាសាខ្មែរ!
            </p>
            <div className="pt-2 text-xs font-black text-amber-300 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform font-khmer">
              <span>សាកល្បងជជែកឥឡូវនេះ</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center flex-shrink-0 border-2 border-white/20 shadow-md group-hover:scale-110 transition-transform">
            <span className="text-4xl">🦉</span>
          </div>
        </div>

        {/* Gamified Rewards Card */}
        <div 
          onClick={() => {
            sounds.playClick();
            onNavigateTab('progress');
          }}
          className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-7 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-between gap-5 relative overflow-hidden group"
        >
          <div className="space-y-2.5 z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-xs font-black px-3 py-1 rounded-full text-white border border-white/20 font-khmer">
              <Award className="w-3.5 h-3.5 text-yellow-200" />
              <span>ប្រព័ន្ធមេដាយ និងពានរង្វាន់</span>
            </span>
            <h3 className="text-2xl font-black font-khmer">ប្រមូលផ្កាយ និងមេដាយ 🏆</h3>
            <p className="text-xs sm:text-sm text-amber-100 font-khmer max-w-sm leading-relaxed">
              ខិតខំរៀនសូត្រ និងធ្វើតេស្តឲ្យបានពិន្ទុខ្ពស់ ដើម្បីដោះសោមេដាយកិត្តិយស និងកត់ត្រាការរីកចម្រើន!
            </p>
            <div className="pt-2 text-xs font-black text-yellow-200 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform font-khmer">
              <span>ពិនិត្យមើលពានរង្វាន់របស់ខ្ញុំ</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center flex-shrink-0 border-2 border-white/20 shadow-md group-hover:scale-110 transition-transform">
            <span className="text-4xl">⭐</span>
          </div>
        </div>
      </section>

    </div>
  );
};
