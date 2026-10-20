import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, BookOpen, HelpCircle, 
  Plus, Sparkles, ShieldAlert, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TeacherStats, StudentRosterItem, Subject, Chapter } from '../types';
import { sounds } from '../utils/sound';

export const TeacherDashboardPage: React.FC = () => {
  const { user, login } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'students' | 'lessons'>('students');
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lesson Creation Modal State
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [chaptersList, setChaptersList] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [newLessonNumber, setNewLessonNumber] = useState<number>(2);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonSummary, setNewLessonSummary] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState<number>(15);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

  useEffect(() => {
    if (!isTeacher) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsData, studentsData] = await Promise.all([
          api.getTeacherStats(),
          api.getTeacherStudents()
        ]);
        setStats(statsData);
        setStudents(studentsData);
      } catch (err: any) {
        console.error("Failed to load teacher data:", err);
        setError("មិនអាចទាញយកទិន្នន័យគ្រូបង្រៀនបានឡើយ");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isTeacher]);

  const openCreateLesson = async () => {
    setIsCreateLessonOpen(true);
    setSuccessMsg('');
    try {
      const subs = await api.getSubjects(3); // default grade 3
      setSubjectsList(subs);
      if (subs.length > 0) {
        setSelectedSubjectId(subs[0].id);
        const chaps = await api.getSubjectChapters(subs[0].id);
        setChaptersList(chaps);
        if (chaps.length > 0) {
          setSelectedChapterId(chaps[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubjectChange = async (subjId: string) => {
    setSelectedSubjectId(subjId);
    try {
      const chaps = await api.getSubjectChapters(subjId);
      setChaptersList(chaps);
      if (chaps.length > 0) {
        setSelectedChapterId(chaps[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId || !newLessonTitle) return;

    setCreating(true);
    try {
      await api.createLesson({
        chapter_id: selectedChapterId,
        lesson_number: Number(newLessonNumber),
        title_km: newLessonTitle,
        summary_km: newLessonSummary,
        content_html: `<div class="space-y-4"><h3 class="text-xl font-bold">${newLessonTitle}</h3><p>${newLessonContent.replace(/\n/g, '<br/>')}</p></div>`,
        estimated_minutes: Number(newLessonDuration)
      });

      sounds.playCorrect();
      setSuccessMsg("បានបង្កើតមេរៀនថ្មីដោយជោគជ័យ! 🎉");
      setIsCreateLessonOpen(false);
      // Refresh stats
      const updatedStats = await api.getTeacherStats();
      setStats(updatedStats);
    } catch (err: any) {
      sounds.playWrong();
      alert(err.message || "មានបញ្ហាក្នុងការបង្កើតមេរៀន");
    } finally {
      setCreating(false);
    }
  };

  const handleQuickTeacherLogin = async () => {
    sounds.playClick();
    await login('kru_dara', 'password123');
  };

  if (!isTeacher) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xl border-2 border-amber-200">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 font-khmer">
            តម្រូវឲ្យមានសិទ្ធិជាគ្រូបង្រៀន (Teacher Access Required)
          </h2>
          <p className="text-sm text-slate-500 font-khmer max-w-md mx-auto leading-relaxed">
            ផ្នែកនេះត្រូវបានការពារសម្រាប់តែលោកគ្រូ-អ្នកគ្រូ ដើម្បីគ្រប់គ្រងមេរៀន លំហាត់តេស្ត និងពិនិត្យពិន្ទុសិស្ស។
          </p>
        </div>

        <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-3xl max-w-md mx-auto space-y-3.5 shadow-sm">
          <p className="text-xs font-black text-blue-900 font-khmer">
            💡 សាកល្បងចូលដោយគណនីគ្រូបង្រៀនគំរូភ្លាមៗ៖
          </p>
          <button
            onClick={handleQuickTeacherLogin}
            className="btn-3d-blue w-full py-3 px-4 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all font-khmer"
          >
            👨‍🏫 ចូលដោយគណនី «លោកគ្រូ តារា» (kru_dara)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Teacher Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-5 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden border border-white/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-amber-300 font-khmer border border-white/20 shadow-2xs">
            <GraduationCap className="w-4 h-4" />
            <span>ផ្ទាំងគ្រប់គ្រងលោកគ្រូ-អ្នកគ្រូ (Teacher Portal)</span>
          </div>
          <h1 className="text-3xl font-black font-khmer">
            សូមស្វាគមន៍ {user.full_name}! 👨‍🏫
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg font-khmer leading-relaxed">
            គ្រប់គ្រងខ្លឹមសារមេរៀន កម្រងសំណួរតេស្ត និងតាមដានវឌ្ឍនភាពសិក្សារបស់សិស្សានុសិស្ស
          </p>
        </div>

        <button
          onClick={openCreateLesson}
          className="btn-3d-amber px-6 py-3.5 rounded-2xl text-slate-900 font-black text-xs sm:text-sm flex items-center gap-2 flex-shrink-0 font-khmer z-10"
        >
          <Plus className="w-5 h-5 text-slate-950" />
          <span>បន្ថែមមេរៀនថ្មី</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-xs font-black text-emerald-800 font-khmer shadow-2xs">
          {successMsg}
        </div>
      )}

      {/* Statistics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-2xs">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs font-black text-slate-400 font-khmer">សិស្សសរុប</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-khmer">{stats.total_students} នាក់</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-xs font-black text-slate-400 font-khmer">មេរៀនសរុប</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-khmer">{stats.total_lessons} មេរៀន</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 shadow-2xs">
              <HelpCircle className="w-6 h-6" />
            </div>
            <p className="text-xs font-black text-slate-400 font-khmer">កម្រងសំណួរ</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-khmer">{stats.total_quizzes} តេស្ត</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-xs font-black text-slate-400 font-khmer">ពិន្ទុមធ្យមសរុប</p>
            <p className="text-2xl sm:text-3xl font-black text-purple-600 font-khmer">{stats.average_class_score}%</p>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md font-khmer border border-slate-200/80">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('students');
          }}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
            activeTab === 'students' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          👥 បញ្ជីសិស្ស និងលទ្ធផល
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('lessons');
          }}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
            activeTab === 'lessons' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          📚 គ្រប់គ្រងមេរៀន
        </button>
      </div>

      {/* Tab: Student Roster */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-khmer">
              បញ្ជីឈ្មោះសិស្ស និងវឌ្ឍនភាពសិក្សា
            </h2>
            <p className="text-xs text-slate-500 font-khmer mt-0.5">
              តាមដានការបំពេញមេរៀន និងពិន្ទុតេស្តរបស់សិស្សម្នាក់ៗ
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs font-khmer">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="pb-3.5 font-black">ឈ្មោះសិស្ស</th>
                  <th className="pb-3.5 font-black">ឈ្មោះគណនី</th>
                  <th className="pb-3.5 font-black">កម្រិតថ្នាក់</th>
                  <th className="pb-3.5 font-black">មេរៀនដែលបានបញ្ចប់</th>
                  <th className="pb-3.5 font-black">ពិន្ទុមធ្យមតេស្ត</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 font-black text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs shadow-2xs">
                        {st.full_name[0]}
                      </div>
                      <span>{st.full_name}</span>
                    </td>
                    <td className="py-3.5 text-slate-500 font-bold">@{st.username}</td>
                    <td className="py-3.5">
                      <span className="bg-blue-50 text-blue-700 font-black px-2.5 py-1 rounded-full text-[10px] border border-blue-200">
                        ថ្នាក់ទី {st.grade_level}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700 font-black">
                      {st.completed_lessons} / {st.total_lessons} មេរៀន
                    </td>
                    <td className="py-3.5">
                      <span className="font-black text-emerald-600 text-sm">
                        {st.average_quiz_score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Lesson Management */}
      {activeTab === 'lessons' && (
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-khmer">
                គ្រប់គ្រងមេរៀន និងខ្លឹមសារបង្រៀន
              </h2>
              <p className="text-xs text-slate-500 font-khmer mt-0.5">
                លោកគ្រូ-អ្នកគ្រូអាចបន្ថែម កែប្រែ ឬលុបមេរៀនបានយ៉ាងងាយស្រួល
              </p>
            </div>
            <button
              onClick={openCreateLesson}
              className="btn-3d-blue px-5 py-2.5 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 self-start sm:self-auto font-khmer"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមមេរៀន</span>
            </button>
          </div>

          <div className="p-5 sm:p-8 bg-slate-50 rounded-3xl border-2 border-slate-200 text-center space-y-2.5">
            <BookOpen className="w-10 h-10 text-blue-600 mx-auto" />
            <p className="text-base font-black text-slate-800 font-khmer">
              មេរៀនទាំងអស់ត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិក្នងប្រព័ន្ធ
            </p>
            <p className="text-xs text-slate-500 font-khmer max-w-md mx-auto leading-relaxed">
              ដើម្បីបន្ថែមមេរៀនថ្មី សូមចុចប៊ូតុង «បន្ថែមមេរៀន» ខាងលើ រួចបំពេញព័ត៌មានលម្អិត។
            </p>
          </div>
        </div>
      )}

      {/* Modal: Create New Lesson */}
      {isCreateLessonOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[92dvh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 font-khmer">
                ✍️ បន្ថែមមេរៀនថ្មី (Add New Lesson)
              </h3>
              <button
                onClick={() => setIsCreateLessonOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="p-6 space-y-4 font-khmer">
              {/* Subject selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  មុខវិជ្ជា *
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {subjectsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_km} (ថ្នាក់ទី {s.grade_level})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  ជំពូក *
                </label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {chaptersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      ជំពូកទី {c.chapter_number}៖ {c.title_km}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    លេខមេរៀន
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newLessonNumber}
                    onChange={(e) => setNewLessonNumber(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    រយៈពេលប្រមាណ (នាទី)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  ចំណងជើងមេរៀន (ជាភាសាខ្មែរ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. មេរៀនទី ២៖ វិធីគុណលេខខ្ទង់រយ"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  សេចក្តីសង្ខេបមេរៀន
                </label>
                <input
                  type="text"
                  placeholder="សេចក្តីសង្ខេបខ្លីៗសម្រាប់សិស្ស..."
                  value={newLessonSummary}
                  onChange={(e) => setNewLessonSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  ខ្លឹមសារមេរៀនលម្អិត *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="សរសេរខ្លឹមសារមេរៀនជាភាសាខ្មែរ..."
                  value={newLessonContent}
                  onChange={(e) => setNewLessonContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateLessonOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-3d-blue px-6 py-2.5 text-white text-xs font-black rounded-xl shadow-md disabled:opacity-50"
                >
                  {creating ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកមេរៀន'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
