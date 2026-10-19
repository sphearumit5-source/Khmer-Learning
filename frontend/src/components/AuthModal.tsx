import React, { useState } from 'react';
import { X, Sparkles, User, Lock, Mail, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [gradeLevel, setGradeLevel] = useState(3);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      if (isLoginTab) {
        await login(username, password);
      } else {
        await register({
          username,
          password,
          full_name: fullName,
          email: email || undefined,
          role,
          grade_level: role === 'student' ? gradeLevel : undefined
        });
      }
    } catch (err: any) {
      sounds.playWrong();
      setErrorMessage(err.message || 'ការផ្ទៀងផ្ទាត់មិនបានជោគជ័យ សូមព្យាយាមម្តងទៀត');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoUsername: string) => {
    sounds.playClick();
    setSubmitting(true);
    setErrorMessage('');
    try {
      await login(demoUsername, 'password123');
    } catch (err: any) {
      sounds.playWrong();
      setErrorMessage(err.message || 'មិនអាចចូលគណនីគំរូបានឡើយ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-2 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 font-khmer">
            {isLoginTab ? 'ចូលគណនីរៀនសូត្រ' : 'បង្កើតគណនីថ្មី'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-khmer">
            ស្វាគមន៍មកកាន់ប្រព័ន្ធសិក្សាភាសាខ្មែរ Khmer Learning
          </p>

          {/* Quick Demo Logins Banner */}
          <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <p className="text-xs font-bold text-amber-900 mb-2 font-khmer">
              ⚡ ជ្រើសរើសគណនីគំរូសាកល្បងភ្លាមៗ (Demo Accounts)៖
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleDemoLogin('sothun')}
                className="p-2 bg-white hover:bg-amber-100/80 rounded-xl border border-amber-200 text-xs font-semibold text-slate-800 transition-all flex items-center gap-2"
              >
                <span className="text-lg">👦</span>
                <div>
                  <p className="font-bold">សុធន់ (សិស្ស)</p>
                  <p className="text-[10px] text-amber-700">ថ្នាក់ទី ៣</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('bopha')}
                className="p-2 bg-white hover:bg-amber-100/80 rounded-xl border border-amber-200 text-xs font-semibold text-slate-800 transition-all flex items-center gap-2"
              >
                <span className="text-lg">👧</span>
                <div>
                  <p className="font-bold">បុប្ផា (សិស្ស)</p>
                  <p className="text-[10px] text-amber-700">ថ្នាក់ទី ១</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('kru_dara')}
                className="p-2 bg-white hover:bg-amber-100/80 rounded-xl border border-amber-200 text-xs font-semibold text-slate-800 transition-all flex items-center gap-2 col-span-2"
              >
                <span className="text-lg">👨‍🏫</span>
                <div>
                  <p className="font-bold">លោកគ្រូ តារា (គ្រូបង្រៀន/Teacher Portal)</p>
                  <p className="text-[10px] text-blue-700">គ្រប់គ្រងមេរៀន និងមើលពិន្ទុសិស្ស</p>
                </div>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mt-4">
            <button
              onClick={() => {
                setIsLoginTab(true);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isLoginTab ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ចូលគណនី
            </button>
            <button
              onClick={() => {
                setIsLoginTab(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                !isLoginTab ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ចុះឈ្មោះថ្មី
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium font-khmer">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-3 font-khmer">
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ឈ្មោះពេញ (Full Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="ឧ. គឹម សុខា"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ឈ្មោះគណនី (Username) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="ឧ. sokha123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {!isLoginTab && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                អ៊ីមែល (ស្រេចចិត្ត)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  placeholder="student@school.edu.kh"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ពាក្យសម្ងាត់ (Password) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {!isLoginTab && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  តួនាទី (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="student">សិស្ស (Student)</option>
                  <option value="teacher">គ្រូបង្រៀន (Teacher)</option>
                </select>
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    កម្រិតថ្នាក់
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>
                        ថ្នាក់ទី {g}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'កំពុងដំណើរការ...' : isLoginTab ? 'ចូលគណនី' : 'បង្កើតគណនី'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
