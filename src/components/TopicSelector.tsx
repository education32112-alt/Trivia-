import React, { useState } from 'react';
import { Search, Sparkles, Globe, Clock, Target, Play, Flame } from 'lucide-react';
import { HostProfile, GameSettings } from '../types/trivia';
import { PRESET_TOPICS } from '../data/defaultHosts';

interface TopicSelectorProps {
  currentHost: HostProfile;
  onStartGame: (settings: GameSettings) => void;
  isLoading: boolean;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  currentHost,
  onStartGame,
  isLoading,
}) => {
  const [selectedTopic, setSelectedTopic] = useState(PRESET_TOPICS[0].title);
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeTopic = customTopic.trim() ? customTopic.trim() : selectedTopic;
    onStartGame({
      topic: activeTopic,
      difficulty,
      questionCount,
      timePerQuestion,
      enableHostAudio: true,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-purple-500/30 text-purple-200 text-xs font-semibold backdrop-blur-sm">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-time Google Search Grounding with Gemini 3.8 Flash</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white font-['Space_Grotesk'] tracking-tight">
          CHOOSE YOUR <span className="bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">ARENA</span>
        </h2>
        <p className="text-sm sm:text-base text-purple-200/80 max-w-2xl mx-auto leading-relaxed">
          Questions are dynamically verified and generated from live web search data.
          Host <span className="text-amber-300 font-semibold">{currentHost.name}</span> will read every question aloud and react in real-time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Custom Real-Time Search Query Bar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-purple-500/40 shadow-xl backdrop-blur-md">
          <label className="block text-xs font-extrabold text-purple-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              Custom Search Topic (Ask Anything!)
            </span>
            <span className="text-[11px] font-mono text-cyan-400">Google Search Grounded</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. 2026 World Cup Qualifiers, James Webb Exoplanets, 90s Grunge Rock, Artificial Superintelligence..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-950 border border-purple-600/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
            <Globe className="w-5 h-5 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-70" />
            {customTopic && (
              <button
                type="button"
                onClick={() => setCustomTopic('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>
          {customTopic && (
            <p className="mt-2 text-xs text-cyan-300/90 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Will query Google Search directly for fresh trivia on: <strong>"{customTopic}"</strong>
            </p>
          )}
        </div>

        {/* Preset Category Tiles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-purple-300 uppercase tracking-wider">
              Or Select A Featured Category
            </span>
            <span className="text-xs text-slate-400 font-mono">6 Curated Channels</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRESET_TOPICS.map((topic) => {
              const isSelected = !customTopic && selectedTopic === topic.title;
              return (
                <button
                  type="button"
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopic(topic.title);
                    setCustomTopic('');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-purple-900/50 border-purple-400 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20'
                      : 'bg-slate-900/60 border-purple-900/30 hover:border-purple-600/60 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {topic.icon}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                      {topic.badge}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm mb-1 font-['Space_Grotesk']">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-slate-300/80 leading-relaxed line-clamp-2">
                    {topic.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration Row: Difficulty, Question Count, Timer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-3xl bg-slate-900/80 border border-purple-500/30">
          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Difficulty
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['easy', 'medium', 'hard', 'expert'] as const).map((diff) => (
                <button
                  type="button"
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold capitalize transition ${
                    difficulty === diff
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Rounds / Questions
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[5, 8, 10].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    questionCount === num
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  {num} Qs
                </button>
              ))}
            </div>
          </div>

          {/* Countdown Timer */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-pink-400" />
              Timer Per Question
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { sec: 15, label: '15s Blitz' },
                { sec: 30, label: '30s Std' },
                { sec: 0, label: 'Relaxed' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.sec}
                  onClick={() => setTimePerQuestion(t.sec)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    timePerQuestion === t.sec
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Game Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-lg shadow-xl shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-3 font-['Space_Grotesk'] tracking-wide"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-6 h-6 animate-spin text-amber-300" />
                <span>GROUNDING TRIVIA VIA GOOGLE SEARCH...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-white" />
                <span>START TRIVIA SHOW WITH {currentHost.name.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
