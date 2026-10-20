import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, Volume2, BookOpen, 
  Calculator, Globe, Compass, AlertCircle, MessageCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TutorMessage } from '../types';
import { sounds } from '../utils/sound';

// Gemini answers arrive in markdown; children read plain Khmer text
const toPlainText = (text: string) =>
  text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/^\s*---+\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const AITutorPage: React.FC = () => {
  const { user, selectedGrade, setSelectedGrade, openAuthModal } = useAuth();
  
  const [selectedSubject, setSelectedSubject] = useState<string>('khmer');
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      sender: 'assistant',
      content: `សួស្តីកូនៗ! លោកគ្រូឈ្មោះ «គ្រូឆ្លាត សុវណ្ណ» គឺជាគ្រូបង្រៀននិម្មិត AI សម្រាប់ជួយបង្រៀនកូនៗថ្នាក់ទី ${selectedGrade}។ តើកូនមានចម្ងល់ ឬចង់ឲ្យលោកគ្រូជួយពន្យល់មេរៀនអ្វីដែរ?`,
      created_at: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [answerSource, setAnswerSource] = useState<'ai_live' | 'lessons' | 'built_in'>('lessons');
  const [modelName, setModelName] = useState<string>('មេរៀនក្នុងសៀវភៅ');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "តើព្យញ្ជនៈខ្មែរមានប៉ុន្មានតួ និងចែកជាប៉ុន្មានពួក?",
    "ពន្យល់ពីរបៀបចាំមេលេខគុណបានលឿន",
    "How do I say 'អរគុណ' in English?",
    "តើទង់ជាតិកម្ពុជាមានប៉ុន្មានពណ៌ និងមានន័យដូចម្តេច?"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || sending) return;

    if (!user) {
      sounds.playClick();
      alert("សូមចូលគណនីដើម្បីសន្ទនាជាមួយគ្រូឆ្លាត AI!");
      openAuthModal();
      return;
    }

    sounds.playClick();
    const newMsg: TutorMessage = {
      sender: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    setSending(true);

    try {
      const res = await api.chatWithTutor({
        message: text,
        grade_level: selectedGrade,
        subject_code: selectedSubject
      });

      setAnswerSource(res.answer_source);
      setModelName(res.model_name);
      if (res.suggested_questions && res.suggested_questions.length > 0) {
        setSuggestedQuestions(res.suggested_questions);
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          content: res.reply,
          created_at: new Date().toISOString()
        }
      ]);
      sounds.playCorrect();
    } catch (err: any) {
      sounds.playWrong();
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          content: "⚠️ សូមអភ័យទោស មានបញ្ហាក្នុងការតភ្ជាប់សេវាកម្ម AI។ សូមសាកល្បងម្តងទៀត!",
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleReadAloud = (text: string) => {
    sounds.playClick();
    sounds.speakText(text);
  };

  const subjects = [
    { code: 'khmer', label: 'ភាសាខ្មែរ', icon: BookOpen, color: 'text-blue-600', active: 'border-blue-600 bg-blue-50 text-blue-700' },
    { code: 'math', label: 'គណិតវិទ្យា', icon: Calculator, color: 'text-emerald-600', active: 'border-emerald-600 bg-emerald-50 text-emerald-700' },
    { code: 'english', label: 'ភាសាអង់គ្លេស', icon: Globe, color: 'text-purple-600', active: 'border-purple-600 bg-purple-50 text-purple-700' },
    { code: 'social_studies', label: 'សិក្សាសង្គម', icon: Compass, color: 'text-amber-600', active: 'border-amber-600 bg-amber-50 text-amber-700' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 rounded-3xl p-6 sm:p-9 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden border border-white/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-amber-200 border border-white/20 font-khmer">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>ជំនួយការរៀនសូត្រឆ្លាតវៃសម្រាប់បឋមសិក្សា</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black font-khmer">
            គ្រូឆ្លាត AI (AI Tutor) 🤖
          </h1>
          
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg font-khmer leading-relaxed">
            បកស្រាយមេរៀន លើកឧទាហរណ៍ជាក់ស្តែង ជួយដោះស្រាយលំហាត់ និងឆ្លើយតបដោយសុវត្ថិភាពសម្រាប់កុមារ ថ្នាក់ទី ១ ដល់ ទី ៦។
          </p>
        </div>

        {/* Mascot Avatar */}
        <div className="relative z-10 w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center flex-shrink-0 shadow-lg animate-float">
          <span className="text-5xl">🦉</span>
        </div>
      </div>

      {/* Mode & Environment Indicator Alert */}
      <div className={`p-3.5 sm:p-4 rounded-2xl border text-xs font-black font-khmer flex flex-wrap items-center justify-between gap-2 sm:gap-3 shadow-2xs ${
        answerSource === 'ai_live'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : answerSource === 'lessons'
            ? 'bg-sky-50 border-sky-200 text-sky-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2.5">
          <AlertCircle className={`w-4 h-4 flex-shrink-0 ${
            answerSource === 'ai_live' ? 'text-emerald-600' : answerSource === 'lessons' ? 'text-sky-600' : 'text-amber-600'
          }`} />
          <span>
            {answerSource === 'ai_live'
              ? `🟢 ភ្ជាប់ AI ផ្ទាល់: ${modelName}`
              : answerSource === 'lessons'
                ? `📘 ចម្លើយចេញពីមេរៀនក្នុងសៀវភៅ: ${modelName}`
                : `⚙️ ចម្លើយសម្រាប់ថ្នាក់ (គ្មាន AI Key): ${modelName}`}
          </span>
        </div>
        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white border shadow-2xs">
          {answerSource === 'ai_live' ? 'Live AI' : answerSource === 'lessons' ? 'មេរៀន' : 'Built-in'}
        </span>
      </div>

      {/* Controls: Grade and Subject Selectors */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Grade Selector */}
        <div>
          <span className="text-xs font-black text-slate-600 block mb-2 font-khmer">
            ១. ជ្រើសរើសកម្រិតថ្នាក់ដែលកូនចង់សួរ៖
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`py-2 rounded-xl text-xs font-black transition-all font-khmer ${
                  selectedGrade === grade
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                ថ្នាក់ទី {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Selector */}
        <div>
          <span className="text-xs font-black text-slate-600 block mb-2 font-khmer">
            ២. ជ្រើសរើសមុខវិជ្ជា៖
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {subjects.map((s) => {
              const Icon = s.icon;
              const isSelected = selectedSubject === s.code;
              return (
                <button
                  key={s.code}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedSubject(s.code);
                  }}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 text-xs font-black transition-all font-khmer ${
                    isSelected
                      ? s.active + ' shadow-sm scale-102'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${s.color}`} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col h-[65dvh] min-h-[380px] max-h-[680px]">
        
        {/* Messages List */}
        <div className="flex-1 min-h-0 p-3.5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto bg-slate-50/40">
          {messages.map((msg, index) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={index}
                className={`flex items-start gap-3.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-xl">🦉</span>
                  </div>
                )}

                <div className={`max-w-[86%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-sm space-y-2 ${
                  isBot
                    ? 'bg-white border-2 border-slate-200/90 text-slate-800'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                }`}>
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100/60 pb-1.5">
                    <span className="text-xs font-black opacity-90 font-khmer flex items-center gap-1.5 min-w-0 truncate">
                      {isBot ? '🦉 លោកគ្រូ ភារុំ' : user ? `👦 ${user.full_name}` : 'សិស្សតូច'}
                    </span>
                    {isBot && (
                      <button
                        onClick={() => handleReadAloud(toPlainText(msg.content))}
                        title="អានជាសំឡេង"
                        className="text-slate-400 hover:text-blue-600 p-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold font-khmer bg-slate-100 hover:bg-blue-50 px-2 py-0.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>ស្តាប់</span>
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-khmer leading-relaxed whitespace-pre-wrap">
                    {toPlainText(msg.content)}
                  </p>
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <span className="text-xl">🦉</span>
              </div>
              <div className="bg-white border-2 border-slate-200 p-4 rounded-3xl text-xs font-black text-slate-600 font-khmer flex items-center gap-2.5 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce" />
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span>លោកគ្រូឆ្លាតកំពុងគិត និងរៀបចំការពន្យល់...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions Chips */}
        {suggestedQuestions.length > 0 && (
          <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-200/70 flex-shrink-0">
            <span className="text-xs font-black text-slate-500 block mb-2 font-khmer">
              💡 សំណួរគំរូដែលកូនអាចសាកល្បងសួរ៖
            </span>
            <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-x-visible pb-1">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="flex-shrink-0 sm:flex-shrink whitespace-nowrap sm:whitespace-normal px-3.5 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold transition-all font-khmer shadow-2xs active:scale-95 text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="សរសេរសំណួររបស់កូននៅទីនេះ (ជាភាសាខ្មែរ)..."
            className="flex-1 min-w-0 px-4 sm:px-5 py-3 text-[16px] sm:text-sm font-black font-khmer rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 bg-slate-50 focus:bg-white transition-all shadow-2xs"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || sending}
            className="btn-3d-blue p-3.5 rounded-2xl text-white shadow-md transition-all active:scale-95 disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

      </div>

    </div>
  );
};
