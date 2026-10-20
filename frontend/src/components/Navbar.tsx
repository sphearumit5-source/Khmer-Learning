import React, { useState } from 'react';
import { 
  BookOpen, Award, Bot, GraduationCap, Volume2, 
  VolumeX, User as UserIcon, LogOut, Menu, X, Sparkles, 
  ChevronDown, Star 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    user, selectedGrade, setSelectedGrade, soundEnabled, 
    toggleSound, openAuthModal, logout 
  } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // only a teacher or the admin may reach the management area
  const isStaff = user?.role === 'teacher' || user?.role === 'admin';

  const navItems = [
    { id: 'home', label: 'ទំព័រដើម', short: 'ទំព័រ', icon: BookOpen, color: 'text-blue-600' },
    { id: 'progress', label: 'វឌ្ឍនភាព', short: 'វឌ្ឍនភាព', icon: Award, color: 'text-amber-500' },
    { id: 'tutor', label: 'គ្រូឆ្លាត AI', short: 'គ្រូ AI', icon: Bot, color: 'text-indigo-600', badge: 'ឆ្លាតវៃ' },
    ...(isStaff
      ? [{ id: 'teacher', label: 'ផ្នែកគ្រូបង្រៀន', short: 'គ្រូបង្រៀន', icon: GraduationCap, color: 'text-emerald-600' }]
      : []),
  ];

  const handleNavClick = (tabId: string) => {
    sounds.playClick();
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  const gradeEmojis = ['🌱', '🌿', '🍀', '🌸', '🌻', '🏆'];

  return (
    <>
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-500 flex items-center justify-center shadow-md group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
                <span className="text-2xl drop-shadow-sm">🇰🇭</span>
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm font-black animate-pulse-glow">
                ★
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-2xl font-black bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent font-khmer tracking-tight">
                  Khmer Learning
                </span>
                <span className="hidden sm:inline-flex text-[10px] bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300/80 shadow-2xs font-khmer">
                  បឋមសិក្សា
                </span>
              </div>
              <p className="hidden sm:flex text-[11px] text-slate-500 font-bold font-khmer items-center gap-1.5">
                <span>កម្មវិធីស្វ័យសិក្សាថ្នាក់ទី ១ ដល់ ទី ៦</span>
              </p>
            </div>
          </div>

          {/* Grade Selector Pills (Desktop) */}
          <div className="hidden xl:flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-black text-slate-500 pl-2 pr-1 font-khmer">
              ថ្នាក់៖
            </span>
            {[1, 2, 3, 4, 5, 6].map((grade, idx) => {
              const isSelected = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white/80'
                  }`}
                >
                  <span className="text-xs">{gradeEmojis[idx]}</span>
                  <span className="font-khmer">ទី {grade}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black transition-all duration-200 font-khmer ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-700 shadow-sm border border-blue-200/60'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce-short">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Sound Toggle Button */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "បិទសំឡេង (Mute)" : "បើកសំឡេង (Unmute)"}
              className={`p-2.5 rounded-2xl transition-all border ${
                soundEnabled 
                  ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 shadow-2xs' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* User Profile or Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 py-1.5 px-3 rounded-2xl shadow-2xs transition-all active:scale-95"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full border-2 border-amber-300 object-cover shadow-2xs"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-black text-slate-800 leading-tight font-khmer">
                      {user.full_name}
                    </p>
                    <p className="text-[10px] text-blue-600 font-extrabold font-khmer">
                      {user.role === 'teacher' ? '👨‍🏫 គ្រូបង្រៀន' : user.role === 'admin' ? '⚙️ អ្នកគ្រប់គ្រង' : `សិស្សថ្នាក់ទី ${user.grade_level || selectedGrade}`}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-bounce-short">
                    <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                      <p className="text-xs font-bold text-slate-800 font-khmer">{user.full_name}</p>
                      <p className="text-[10px] text-slate-500">@{user.username}</p>
                    </div>
                    {isStaff && (
                      <button
                        onClick={() => {
                          handleNavClick('teacher');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 font-khmer"
                      >
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        ផ្ទាំងគ្រប់គ្រងគ្រូ
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleNavClick('progress');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 font-khmer"
                    >
                      <Award className="w-4 h-4 text-amber-500" />
                      វឌ្ឍនភាពរបស់ខ្ញុំ
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-khmer border-t border-slate-100 mt-1 pt-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      ចាកចេញពីគណនី
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="btn-3d-blue text-white font-black text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 font-khmer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>ចូលគណនី</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-3 font-khmer">
            {/* Grade selector on mobile */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-xs font-black text-slate-500 block mb-2 px-1">
                ជ្រើសរើសកម្រិតថ្នាក់៖
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((grade, idx) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                      selectedGrade === grade
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{gradeEmojis[idx]}</span>
                    <span>ថ្នាក់ទី {grade}</span>
                  </button>
                ))}
              </div>
            </div>

            {!user && (
              <button
                onClick={() => {
                  sounds.playClick();
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-black bg-blue-600 text-white font-khmer"
              >
                <UserIcon className="w-4 h-4" />
                ចូលគណនី ឬបញ្ជីឈ្នោះ
              </button>
            )}
          </div>
        )}

      </div>
    </header>

    {/* Phone tab bar: large targets that stay under the thumb */}
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/97 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
      <div className="flex items-stretch px-1.5 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-black font-khmer transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-slate-400'}`} />
              <span className="leading-tight">{item.short}</span>
            </button>
          );
        })}
      </div>
    </nav>
    </>
  );
};
