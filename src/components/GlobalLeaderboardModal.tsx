import React, { useEffect, useState } from 'react';
import {
  Trophy,
  X,
  Crown,
  Medal,
  Flame,
  Target,
  RefreshCw,
  Send,
  Sparkles,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LeaderboardEntry, HostProfile } from '../types/trivia';

interface GlobalLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHost: HostProfile;
  latestScore?: number;
  latestAccuracy?: number;
  latestStreak?: number;
  latestTopic?: string;
}

export const GlobalLeaderboardModal: React.FC<GlobalLeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentHost,
  latestScore = 0,
  latestAccuracy = 0,
  latestStreak = 0,
  latestTopic = 'General Trivia',
}) => {
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState(() => {
    return localStorage.getItem('trivia_player_name') || '';
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionRank, setSubmissionRank] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success && data.topScores) {
        setTopScores(data.topScores);
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
      setHasSubmitted(false);
      setSubmissionRank(null);
    }
  }, [isOpen]);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerNameInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const finalName = playerNameInput.trim();
    localStorage.setItem('trivia_player_name', finalName);

    try {
      const res = await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: finalName,
          score: latestScore,
          accuracy: latestAccuracy,
          streak: latestStreak,
          topic: latestTopic,
          hostName: currentHost.name,
          hostEmoji: currentHost.avatarEmoji,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setHasSubmitted(true);
        setSubmissionRank(data.rank);
        if (data.topScores) {
          setTopScores(data.topScores);
        }
        if (data.isTop10) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (e) {
      console.error('Error submitting score:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const firstPlace = topScores[0];
  const secondPlace = topScores[1];
  const thirdPlace = topScores[2];
  const remainingScores = topScores.slice(3, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#0c0d1c] border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-amber-900/40 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#121426] rounded-[14px] flex items-center justify-center text-2xl">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white font-['Space_Grotesk'] tracking-wide">
                  GLOBAL LEADERBOARD
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  TOP 10 HALL OF FAME
                </span>
              </div>
              <p className="text-xs text-purple-300/80">
                The highest-scoring trivia champions across all dynamic host arenas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Submit Current Game Score Card (If available and score > 0) */}
          {latestScore > 0 && !hasSubmitted && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-amber-950/40 to-slate-900 border border-amber-500/40 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Submit Your Latest Showdown Score
                </span>
                <span className="text-sm font-black font-mono text-amber-300">
                  {latestScore.toLocaleString()} PTS
                </span>
              </div>

              <form onSubmit={handleSubmitScore} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="Enter your Contestant Call Sign..."
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  maxLength={20}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-700/50 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !playerNameInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Posting...' : 'Claim Rank'}</span>
                </button>
              </form>
            </div>
          )}

          {hasSubmitted && submissionRank && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
              <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Score recorded! You are ranked <strong>#{submissionRank}</strong> globally
                {submissionRank <= 10 ? ' — Welcome to the Top 10 Hall of Fame!' : '.'}
              </span>
            </div>
          )}

          {/* Top 3 Podium (Visual Showcase) */}
          {topScores.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 pb-2 items-end">
              {/* 2nd Place */}
              {secondPlace && (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 p-0.5 shadow-lg shadow-slate-500/20 mb-2 relative">
                    <div className="w-full h-full bg-[#151728] rounded-[14px] flex items-center justify-center text-xl sm:text-2xl">
                      {secondPlace.hostEmoji || '🥈'}
                    </div>
                    <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-md bg-slate-300 text-slate-950 font-black text-[9px]">
                      #2
                    </span>
                  </div>
                  <div className="w-full p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-700/60 text-center space-y-0.5">
                    <div className="font-bold text-xs sm:text-sm text-slate-200 truncate">
                      {secondPlace.playerName}
                    </div>
                    <div className="font-mono font-black text-xs sm:text-base text-slate-300">
                      {secondPlace.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                      {secondPlace.topic}
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place (Champion) */}
              {firstPlace && (
                <div className="flex flex-col items-center -mt-3">
                  <Crown className="w-6 h-6 text-amber-400 animate-bounce mb-1" />
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 p-1 shadow-xl shadow-amber-500/30 mb-2 relative">
                    <div className="w-full h-full bg-[#151728] rounded-[12px] flex items-center justify-center text-2xl sm:text-3xl">
                      {firstPlace.hostEmoji || '👑'}
                    </div>
                    <span className="absolute -top-2 -right-1 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px]">
                      #1
                    </span>
                  </div>
                  <div className="w-full p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/60 text-center space-y-0.5 shadow-lg shadow-amber-500/10">
                    <div className="font-extrabold text-sm sm:text-base text-amber-200 truncate">
                      {firstPlace.playerName}
                    </div>
                    <div className="font-mono font-black text-sm sm:text-xl text-amber-400">
                      {firstPlace.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-amber-300/80 truncate hidden sm:block">
                      {firstPlace.topic}
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {thirdPlace && (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-700 to-orange-800 p-0.5 shadow-lg shadow-amber-800/20 mb-2 relative">
                    <div className="w-full h-full bg-[#151728] rounded-[14px] flex items-center justify-center text-xl sm:text-2xl">
                      {thirdPlace.hostEmoji || '🥉'}
                    </div>
                    <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-md bg-amber-700 text-white font-black text-[9px]">
                      #3
                    </span>
                  </div>
                  <div className="w-full p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-amber-900/40 text-center space-y-0.5">
                    <div className="font-bold text-xs sm:text-sm text-slate-200 truncate">
                      {thirdPlace.playerName}
                    </div>
                    <div className="font-mono font-black text-xs sm:text-base text-amber-600">
                      {thirdPlace.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                      {thirdPlace.topic}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ranks 4 to 10 Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1 border-b border-purple-900/30">
              <span className="w-12">Rank</span>
              <span className="flex-1">Contestant & Topic</span>
              <span className="text-right pr-2">Accuracy</span>
              <span className="w-24 text-right">High Score</span>
            </div>

            {remainingScores.map((entry, idx) => {
              const rank = idx + 4;
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-purple-900/30 hover:border-purple-600/50 hover:bg-slate-800/60 transition group text-xs sm:text-sm"
                >
                  <div className="w-12 font-mono font-bold text-slate-400 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs">
                      #{rank}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 font-bold text-white truncate">
                      <span>{entry.hostEmoji}</span>
                      <span>{entry.playerName}</span>
                    </div>
                    <div className="text-[11px] text-purple-300/70 truncate flex items-center gap-1">
                      <span>{entry.topic}</span>
                      <span>•</span>
                      <span>{entry.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-right pr-3 font-mono text-xs text-slate-300 hidden sm:block">
                    <span className="text-emerald-400 font-semibold">{entry.accuracy}%</span>
                    <span className="text-[10px] text-slate-500 block">{entry.streak}x streak</span>
                  </div>

                  <div className="w-24 text-right font-mono font-black text-amber-300 text-sm sm:text-base">
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-purple-900/30 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Scores verified & certified by AI Hosts
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
