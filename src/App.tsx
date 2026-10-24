/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TopicSelector } from './components/TopicSelector';
import { TriviaGame } from './components/TriviaGame';
import { GameOverModal } from './components/GameOverModal';
import { HostSelectorModal } from './components/HostSelectorModal';
import { LiveVoiceBoothModal } from './components/LiveVoiceBoothModal';
import { GlobalLeaderboardModal } from './components/GlobalLeaderboardModal';
import { DEFAULT_HOSTS } from './data/defaultHosts';
import { HostProfile, TriviaQuestion, SearchSource, QuestionResult, GameSettings } from './types/trivia';
import { sounds } from './utils/soundEffects';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Active AI Host
  const [currentHost, setCurrentHost] = useState<HostProfile>(() => {
    try {
      const saved = localStorage.getItem('trivia_active_host');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_HOSTS[0];
  });

  // Sound settings
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('trivia_is_muted') === 'true';
  });

  // Modals
  const [isHostSelectorOpen, setIsHostSelectorOpen] = useState(false);
  const [isVoiceBoothOpen, setIsVoiceBoothOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [testingHostId, setTestingHostId] = useState<string | null>(null);

  // Game state
  const [gameState, setGameState] = useState<'setup' | 'loading' | 'playing' | 'game_over'>('setup');
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [searchSources, setSearchSources] = useState<SearchSource[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameResults, setGameResults] = useState<QuestionResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);

  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    sounds.setMuted(isMuted);
    localStorage.setItem('trivia_is_muted', String(isMuted));
  }, [isMuted]);

  const handleSelectHost = (host: HostProfile) => {
    setCurrentHost(host);
    try {
      localStorage.setItem('trivia_active_host', JSON.stringify(host));
    } catch (e) {
      // ignore
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Test voice in modal via gemini-3.8-flash-tts
  const handleTestVoice = async (host: HostProfile) => {
    if (testingHostId) return;
    setTestingHostId(host.id);

    try {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
        testAudioRef.current = null;
      }

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: host.catchphrase,
          voiceName: host.voiceName,
          speechStyle: host.stylePrompt,
          hostName: host.name,
        }),
      });

      const data = await res.json();
      if (data.success && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        testAudioRef.current = audio;
        audio.onended = () => setTestingHostId(null);
        audio.onerror = () => setTestingHostId(null);
        audio.play().catch(() => setTestingHostId(null));
      } else {
        setTestingHostId(null);
      }
    } catch (err) {
      console.error('Test voice error:', err);
      setTestingHostId(null);
    }
  };

  // Start a new game with Search Grounding
  const handleStartGame = async (settings: GameSettings) => {
    setGameSettings(settings);
    setGameState('loading');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/trivia/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: settings.topic,
          difficulty: settings.difficulty,
          count: settings.questionCount,
          hostName: currentHost.name,
          hostStyle: currentHost.stylePrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.questions || data.questions.length === 0) {
        throw new Error(data.error || 'Failed to generate search-grounded trivia questions.');
      }

      if (data.isQuotaLimited && data.quotaNotice) {
        setQuotaNotice(data.quotaNotice);
      } else {
        setQuotaNotice(null);
      }

      setQuestions(data.questions);
      setSearchSources(data.sources || []);
      setScore(0);
      setStreak(0);
      setGameResults([]);
      setGameState('playing');
    } catch (err: any) {
      console.error('Error starting game:', err);
      setErrorMessage(err.message || 'Could not load search-grounded trivia. Please try again.');
      setGameState('setup');
    }
  };

  const handleFinishGame = (results: QuestionResult[], finalScore: number) => {
    setGameResults(results);
    setScore(finalScore);
    setGameState('game_over');
  };

  const handleExitGame = () => {
    setGameState('setup');
  };

  return (
    <div className="min-h-screen bg-[#090a14] text-white flex flex-col selection:bg-purple-600 selection:text-white font-['Outfit']">
      {/* Top Header */}
      <Header
        currentHost={currentHost}
        score={score}
        streak={streak}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenHostSelector={() => setIsHostSelectorOpen(true)}
        onOpenVoiceBooth={() => setIsVoiceBoothOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        isInGame={gameState === 'playing'}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-center">
        {quotaNotice && (
          <div className="w-full max-w-2xl mb-4 p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-md animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{quotaNotice}</span>
            </div>
            <button
              onClick={() => setQuotaNotice(null)}
              className="text-amber-400 hover:text-white text-xs px-2 py-0.5 rounded-md hover:bg-amber-900/40 transition"
            >
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="w-full max-w-xl mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-white font-semibold transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Setup Screen */}
        {gameState === 'setup' && (
          <TopicSelector
            currentHost={currentHost}
            onStartGame={handleStartGame}
            isLoading={false}
          />
        )}

        {/* Loading Screen during Search Grounding */}
        {gameState === 'loading' && (
          <div className="text-center space-y-6 max-w-md p-8 rounded-3xl bg-slate-900/80 border border-purple-500/40 shadow-2xl backdrop-blur-md animate-in fade-in">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-amber-400 animate-spin" />
              <span className="text-4xl">{currentHost.avatarEmoji}</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white font-['Space_Grotesk']">
                GROUNDING TRIVIA VIA GOOGLE SEARCH...
              </h3>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                Gemini 3.8 Flash is searching live web data for topic:
                <br />
                <strong className="text-amber-300">"{gameSettings?.topic}"</strong>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300 font-mono">
              Host {currentHost.name} ({currentHost.voiceName}) is prepping commentary...
            </div>
          </div>
        )}

        {/* In-Game Arena */}
        {gameState === 'playing' && gameSettings && (
          <TriviaGame
            currentHost={currentHost}
            questions={questions}
            searchSources={searchSources}
            topic={gameSettings.topic}
            timePerQuestion={gameSettings.timePerQuestion}
            onFinishGame={handleFinishGame}
            onExitGame={handleExitGame}
            isMuted={isMuted}
          />
        )}

        {/* Game Over Screen */}
        {gameState === 'game_over' && (
          <GameOverModal
            currentHost={currentHost}
            score={score}
            results={gameResults}
            onPlayAgain={() => {
              if (gameSettings) {
                handleStartGame(gameSettings);
              } else {
                setGameState('setup');
              }
            }}
            onChangeHost={() => {
              setIsHostSelectorOpen(true);
              setGameState('setup');
            }}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            isMuted={isMuted}
          />
        )}
      </main>

      {/* Host Selector Modal */}
      <HostSelectorModal
        isOpen={isHostSelectorOpen}
        onClose={() => setIsHostSelectorOpen(false)}
        currentHost={currentHost}
        onSelectHost={handleSelectHost}
        onTestVoice={handleTestVoice}
        testingHostId={testingHostId}
      />

      {/* Real-time Voice Booth Modal (Live API) */}
      <LiveVoiceBoothModal
        isOpen={isVoiceBoothOpen}
        onClose={() => setIsVoiceBoothOpen(false)}
        currentHost={currentHost}
      />

      {/* Global Leaderboard Modal */}
      <GlobalLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentHost={currentHost}
        latestScore={score}
        latestAccuracy={
          gameResults.length > 0
            ? Math.round(
                (gameResults.filter((r) => r.isCorrect).length / gameResults.length) * 100
              )
            : 0
        }
        latestStreak={streak}
        latestTopic={gameSettings?.topic || 'General Trivia'}
      />
    </div>
  );
}
