import React from 'react';
import { Volume2, VolumeX, Mic, Sparkles, Flame, Trophy, UserCheck } from 'lucide-react';
import { HostProfile } from '../types/trivia';

interface HeaderProps {
  currentHost: HostProfile;
  score: number;
  streak: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHostSelector: () => void;
  onOpenVoiceBooth: () => void;
  onOpenLeaderboard: () => void;
  isInGame: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentHost,
  score,
  streak,
  isMuted,
  onToggleMute,
  onOpenHostSelector,
  onOpenVoiceBooth,
  onOpenLeaderboard,
  isInGame
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0d0e1b]/80 border-b border-purple-900/30 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 shadow-lg shadow-purple-500/25">
            <span className="text-xl">⚡</span>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-pink-300 bg-clip-text text-transparent font-['Space_Grotesk']">
                TRIVIAVERSE <span className="text-amber-400">LIVE</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" /> AI HOST
              </span>
            </div>
            <p className="text-xs text-purple-300/70 hidden sm:block">
              Voice-enabled TV Game Show powered by Gemini Live & TTS
            </p>
          </div>
        </div>

        {/* Middle Stats when in Game */}
        {isInGame && (
          <div className="flex items-center gap-3 bg-slate-900/80 border border-purple-800/40 rounded-full px-4 py-1.5 shadow-inner">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">Score:</span>
              <span className="text-sm font-bold text-amber-300 font-mono">{score.toLocaleString()}</span>
            </div>
            <div className="h-3 w-[1px] bg-purple-800/60" />
            <div className="flex items-center gap-1.5">
              <Flame className={`w-4 h-4 ${streak > 1 ? 'text-orange-500 animate-bounce' : 'text-slate-500'}`} />
              <span className="text-xs text-slate-400">Streak:</span>
              <span className={`text-sm font-extrabold font-mono ${streak > 2 ? 'text-orange-400' : 'text-slate-200'}`}>
                {streak}x
              </span>
            </div>
          </div>
        )}

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold transition shadow-sm"
            title="View Global Leaderboard Top 10"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>

          {/* Active Host Selector Pill */}
          <button
            onClick={onOpenHostSelector}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-purple-500/30 text-white text-xs sm:text-sm font-medium transition group hover:border-purple-400 shadow-sm"
            title="Switch or customize AI Host"
          >
            <span className="text-base sm:text-lg group-hover:scale-110 transition-transform">
              {currentHost.avatarEmoji}
            </span>
            <div className="text-left hidden md:block">
              <div className="font-semibold text-slate-100 flex items-center gap-1">
                {currentHost.name}
                <UserCheck className="w-3 h-3 text-purple-400" />
              </div>
              <div className="text-[10px] text-purple-300/80 truncate max-w-[110px]">
                Voice: {currentHost.voiceName}
              </div>
            </div>
          </button>

          {/* Live Voice Booth Button (Live API) */}
          <button
            onClick={onOpenVoiceBooth}
            className="relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 hover:shadow-purple-500/50 transition-all active:scale-95 group"
          >
            <Mic className="w-4 h-4 text-pink-200 group-hover:animate-pulse" />
            <span className="hidden sm:inline">Voice Booth</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-400"></span>
            </span>
          </button>

          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition ${
              isMuted
                ? 'bg-rose-950/40 border-rose-800/50 text-rose-300 hover:bg-rose-900/50'
                : 'bg-slate-800/80 border-purple-800/40 text-purple-200 hover:bg-slate-700/80 hover:text-white'
            }`}
            title={isMuted ? 'Unmute sound & AI Host speech' : 'Mute sound & speech'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
