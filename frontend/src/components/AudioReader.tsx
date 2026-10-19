import React, { useState } from 'react';
import { Volume2, Play, Square, FastForward, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface AudioReaderProps {
  textToRead: string;
  audioUrl?: string;
  label?: string;
}

export const AudioReader: React.FC<AudioReaderProps> = ({ 
  textToRead, 
  audioUrl, 
  label = "អានមេរៀនឮៗ (Audio Reader)" 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(0.9);

  const handleToggle = async () => {
    sounds.playClick();
    if (isPlaying) {
      sounds.stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await sounds.speakText(textToRead, rate);
      setIsPlaying(false);
    }
  };

  const cycleRate = () => {
    sounds.playClick();
    if (rate === 0.9) setRate(1.1);
    else if (rate === 1.1) setRate(0.75);
    else setRate(0.9);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-5 text-white shadow-lg border border-white/20 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-4 z-10">
        <div className={`w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-sm ${isPlaying ? 'scale-105 ring-4 ring-white/30' : ''} transition-all`}>
          {isPlaying ? (
            /* Animated Equalizer Wave Bars */
            <div className="flex items-center gap-1 h-6">
              <span className="w-1 bg-amber-300 rounded-full wave-bar-1" />
              <span className="w-1 bg-yellow-200 rounded-full wave-bar-2" />
              <span className="w-1 bg-white rounded-full wave-bar-3" />
              <span className="w-1 bg-amber-300 rounded-full wave-bar-4" />
            </div>
          ) : (
            <Volume2 className="w-6 h-6 text-amber-300" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm sm:text-base leading-tight font-khmer">{label}</h4>
            {isPlaying && (
              <span className="text-[10px] bg-amber-400 text-slate-900 font-black px-2 py-0.5 rounded-full animate-pulse-glow font-khmer">
                កំពុងចាក់សំឡេង
              </span>
            )}
          </div>
          <p className="text-xs text-blue-100 font-khmer mt-0.5">
            {isPlaying ? 'ចុចប៊ូតុងខាងស្តាំដើម្បីបញ្ឈប់ការអាន' : 'ចុចប៊ូតុងខាងស្តាំដើម្បីស្តាប់សំឡេងអានមេរៀនជាភាសាខ្មែរ'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 z-10">
        {/* Speed button */}
        <button
          onClick={cycleRate}
          title="ល្បឿនអាន"
          className="flex items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-2 rounded-2xl text-xs font-black transition-all shadow-2xs"
        >
          <FastForward className="w-3.5 h-3.5 text-amber-200" />
          <span>{rate}x</span>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all active:scale-95 font-khmer ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : 'bg-white hover:bg-amber-50 text-slate-900'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-white" />
              <span>បញ្ឈប់ការអាន</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-900" />
              <span>ចាក់សំឡេងអាន 🔊</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
