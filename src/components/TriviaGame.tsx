import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
  Globe,
  CheckCircle2,
  XCircle,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HostProfile, TriviaQuestion, SearchSource, QuestionResult } from '../types/trivia';
import { HostAvatar } from './HostAvatar';
import { sounds } from '../utils/soundEffects';

interface TriviaGameProps {
  currentHost: HostProfile;
  questions: TriviaQuestion[];
  searchSources: SearchSource[];
  topic: string;
  timePerQuestion: number;
  onFinishGame: (results: QuestionResult[], totalScore: number) => void;
  onExitGame: () => void;
  isMuted: boolean;
}

export const TriviaGame: React.FC<TriviaGameProps> = ({
  currentHost,
  questions,
  searchSources,
  topic,
  timePerQuestion,
  onFinishGame,
  onExitGame,
  isMuted,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);

  // Timer
  const [timeLeft, setTimeLeft] = useState<number>(timePerQuestion > 0 ? timePerQuestion : 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Lifelines
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [used5050, setUsed5050] = useState(false);
  const [usedClue, setUsedClue] = useState(false);
  const [usedRadar, setUsedRadar] = useState(false);
  const [hostClueText, setHostClueText] = useState<string | null>(null);
  const [showRadar, setShowRadar] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);

  // Host Voice / Speech
  const [hostSpeech, setHostSpeech] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentQ = questions[currentIndex];

  // Helper to play TTS audio for given text
  const speakHostLine = async (text: string, styleOverride?: string) => {
    if (isMuted || !text) return;

    try {
      // Stop previous audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      setIsLoadingAudio(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: currentHost.voiceName,
          speechStyle: styleOverride || currentHost.stylePrompt,
          hostName: currentHost.name,
        }),
      });

      const data = await res.json();
      setIsLoadingAudio(false);

      if (data.success && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        currentAudioRef.current = audio;
        setIsSpeaking(true);

        audio.onended = () => {
          setIsSpeaking(false);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
        };

        audio.play().catch((err) => {
          console.warn('Autoplay blocked or audio error:', err);
          setIsSpeaking(false);
        });
      } else {
        // Graceful fallback to browser speech synthesis if Gemini TTS quota reached
        if (!isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.05;
          setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
        }
      }
    } catch (e) {
      console.warn('TTS request error, falling back to speech synthesis:', e);
      setIsLoadingAudio(false);
      if (!isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    }
  };

  // When question changes, reset options, lifelines, and speak question
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setEliminatedOptions([]);
    setHostClueText(null);
    setShowRadar(false);
    setTimeLeft(timePerQuestion > 0 ? timePerQuestion : 0);

    const questionIntro = currentQ.hostIntro || `Question number ${currentIndex + 1}!`;
    const fullSpeech = `${questionIntro} ${currentQ.question}`;
    setHostSpeech(fullSpeech);
    speakHostLine(fullSpeech);

    // Start timer if enabled
    if (timePerQuestion > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeOut();
            return 0;
          }
          if (prev <= 5) {
            sounds.playTick(true);
          } else if (prev % 5 === 0) {
            sounds.playTick(false);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, [currentIndex, currentQ]);

  // Handle Timeout
  const handleTimeOut = () => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);
    setSelectedOption(-1); // timed out
    sounds.playWrong();

    setStreak(0);
    const newResult: QuestionResult = {
      question: currentQ,
      selectedOptionIndex: null,
      isCorrect: false,
      timeSpentSeconds: timePerQuestion,
      pointsEarned: 0,
    };
    setResults((prev) => [...prev, newResult]);

    const failReaction = currentQ.hostFailReaction || `Time's up! The clock shows no mercy!`;
    setHostSpeech(failReaction);
    speakHostLine(failReaction);
  };

  // Handle Option Selection
  const handleSelectOption = (idx: number) => {
    if (isAnswerLocked || eliminatedOptions.includes(idx)) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnswerLocked(true);
    setSelectedOption(idx);

    const isCorrect = idx === currentQ.correctIndex;
    const timeSpent = timePerQuestion > 0 ? timePerQuestion - timeLeft : 0;

    let points = 0;
    if (isCorrect) {
      sounds.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);

      // Scoring: 1000 base + speed bonus + streak multiplier
      const speedBonus = timePerQuestion > 0 ? Math.round((timeLeft / timePerQuestion) * 500) : 250;
      const multiplier = 1 + (newStreak - 1) * 0.25;
      points = Math.round((1000 + speedBonus) * multiplier);
      setScore((prev) => prev + points);

      if (newStreak >= 2) {
        sounds.playStreak();
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      const winReaction = currentQ.hostWinReaction || `Spot on! You locked it in with precision!`;
      setHostSpeech(winReaction);
      speakHostLine(winReaction);
    } else {
      sounds.playWrong();
      setStreak(0);

      const failReaction =
        currentQ.hostFailReaction ||
        `Incorrect! The correct answer was ${currentQ.options[currentQ.correctIndex]}. Better luck next time!`;
      setHostSpeech(failReaction);
      speakHostLine(failReaction);
    }

    const newResult: QuestionResult = {
      question: currentQ,
      selectedOptionIndex: idx,
      isCorrect,
      timeSpentSeconds: timeSpent,
      pointsEarned: points,
    };
    setResults((prev) => [...prev, newResult]);
  };

  // Lifeline 1: 50/50
  const handle5050 = () => {
    if (used5050 || isAnswerLocked) return;
    sounds.playClick();
    setUsed5050(true);

    const incorrectIndices = [0, 1, 2, 3].filter((i) => i !== currentQ.correctIndex);
    // Shuffle and pick 2
    const shuffled = incorrectIndices.sort(() => Math.random() - 0.5);
    const toEliminate = shuffled.slice(0, 2);
    setEliminatedOptions(toEliminate);

    const line = `Eliminating two decoys. You've now got a 50-50 shot!`;
    setHostSpeech(line);
    speakHostLine(line);
  };

  // Lifeline 2: Ask Host for a Clue
  const handleAskClue = async () => {
    if (usedClue || isAnswerLocked) return;
    sounds.playClick();
    setUsedClue(true);

    try {
      const res = await fetch('/api/host/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: currentHost.name,
          personalityBio: currentHost.stylePrompt,
          event: 'ask_hint',
          currentQuestion: currentQ,
          streak,
          score,
        }),
      });
      const data = await res.json();
      const hint = data.commentary || `Think carefully about the details in the question!`;
      setHostClueText(hint);
      setHostSpeech(hint);
      speakHostLine(hint);
    } catch (e) {
      const fallback = `Here is a whisper: eliminated possibilities leave the truth bare!`;
      setHostClueText(fallback);
      setHostSpeech(fallback);
      speakHostLine(fallback);
    }
  };

  // Lifeline 3: Fact Radar (Preview search grounding / fun fact)
  const handleFactRadar = () => {
    if (usedRadar || isAnswerLocked) return;
    sounds.playClick();
    setUsedRadar(true);
    setShowRadar(true);
    const line = `Activating Fact Radar from Google Search Grounding! Check out this intel snippet.`;
    setHostSpeech(line);
    speakHostLine(line);
  };

  // Next Question or Finish
  const handleNext = () => {
    sounds.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinishGame(results, score);
    }
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Game Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-purple-900/40 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-purple-900/60 text-purple-200 border border-purple-500/40 text-xs font-black font-mono">
            ROUND {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-purple-300 font-semibold truncate max-w-[200px] sm:max-w-xs">
            {topic}
          </span>
        </div>

        {/* Search Grounding Sources Drawer Trigger */}
        {searchSources.length > 0 && (
          <button
            onClick={() => setShowSourcesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700/50 text-cyan-300 text-xs font-semibold transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Search Sources ({searchSources.length})</span>
          </button>
        )}

        {/* Timer Bar */}
        {timePerQuestion > 0 && (
          <div className="flex items-center gap-2">
            <Clock
              className={`w-4 h-4 ${
                timeLeft <= 5 ? 'text-rose-400 animate-spin' : 'text-amber-400'
              }`}
            />
            <span
              className={`text-sm font-mono font-bold ${
                timeLeft <= 5 ? 'text-rose-400 font-black scale-110' : 'text-slate-200'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Host Avatar & Speech Card */}
      <HostAvatar
        host={currentHost}
        speechText={hostSpeech}
        isSpeaking={isSpeaking}
        isLoadingAudio={isLoadingAudio}
        onReplaySpeech={() => speakHostLine(hostSpeech)}
        badgeLabel="VOICE COMMENTARY (gemini-3.8-flash-tts)"
      />

      {/* Lifelines Toolbar */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900/60 border border-purple-900/30">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider pl-1 hidden sm:inline">
          LIFELINES:
        </span>

        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-around sm:justify-start">
          {/* 50/50 */}
          <button
            onClick={handle5050}
            disabled={used5050 || isAnswerLocked}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              used5050
                ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-purple-900/60 border-purple-700/50 text-purple-200'
            }`}
            title="Eliminate two incorrect options"
          >
            <span>⚖️ 50:50</span>
          </button>

          {/* Ask Host Hint */}
          <button
            onClick={handleAskClue}
            disabled={usedClue || isAnswerLocked}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              usedClue
                ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-purple-900/60 border-purple-700/50 text-purple-200'
            }`}
            title="Ask host for a hint"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask Host Hint</span>
          </button>

          {/* Fact Radar */}
          <button
            onClick={handleFactRadar}
            disabled={usedRadar || isAnswerLocked}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              usedRadar
                ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-purple-900/60 border-purple-700/50 text-purple-200'
            }`}
            title="Search grounding radar preview"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fact Radar</span>
          </button>
        </div>
      </div>

      {/* Clue Notice if triggered */}
      {hostClueText && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">{currentHost.name}'s Clue: </strong>
            <span>{hostClueText}</span>
          </div>
        </div>
      )}

      {/* Fact Radar Preview if triggered */}
      {showRadar && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
          <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-cyan-300">Grounding Intel: </strong>
            <span>{currentQ.funFact || currentQ.explanation}</span>
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-purple-500/40 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <h3 className="text-lg sm:text-2xl font-black text-white font-['Space_Grotesk'] leading-snug tracking-wide mb-6">
          {currentQ.question}
        </h3>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {currentQ.options.map((opt, idx) => {
            const isEliminated = eliminatedOptions.includes(idx);
            const isChosen = selectedOption === idx;
            const isCorrect = idx === currentQ.correctIndex;

            let btnStyle =
              'bg-slate-950/70 border-purple-900/40 hover:border-purple-500/80 hover:bg-slate-800/80 text-white';

            if (isEliminated) {
              btnStyle = 'opacity-20 pointer-events-none line-through border-slate-800 bg-slate-950';
            } else if (isAnswerLocked) {
              if (isCorrect) {
                btnStyle =
                  'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/60 text-emerald-100 shadow-lg shadow-emerald-500/30';
              } else if (isChosen && !isCorrect) {
                btnStyle =
                  'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/60 text-rose-100 shadow-lg shadow-rose-500/30';
              } else {
                btnStyle = 'opacity-50 border-slate-800 bg-slate-950 text-slate-400';
              }
            }

            const letter = ['A', 'B', 'C', 'D'][idx];

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswerLocked || isEliminated}
                className={`p-4 rounded-2xl border text-left font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-between group active:scale-[0.98] ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center font-mono font-bold text-xs text-purple-200 group-hover:border-purple-300">
                    {letter}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </div>

                {isAnswerLocked && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {isAnswerLocked && isChosen && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Answer Explanation Card */}
        {isAnswerLocked && (
          <div className="mt-6 pt-6 border-t border-purple-900/40 space-y-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-700/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Verified Fact & Explanation</span>
              </div>
              <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
                {currentQ.explanation}
              </p>
              {currentQ.funFact && (
                <p className="text-xs text-amber-200/90 bg-amber-950/30 border border-amber-900/40 p-2.5 rounded-xl italic">
                  💡 <strong>Bonus Lore: </strong>
                  {currentQ.funFact}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={onExitGame}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl transition"
              >
                Quit Game
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <span>
                  {currentIndex + 1 < questions.length ? 'NEXT QUESTION' : 'VIEW SHOWDOWN VERDICT'}
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Grounding Sources Modal */}
      {showSourcesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0e1022] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h4 className="font-black text-white text-base">Google Search Grounding Sources</h4>
              </div>
              <button
                onClick={() => setShowSourcesModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-cyan-200/80">
              The facts in this round were grounded in real-time search queries by Gemini 3.8 Flash. Explore the underlying web references:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchSources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-cyan-900/40 hover:border-cyan-400 text-xs text-white transition group"
                >
                  <span className="truncate max-w-[85%] font-medium group-hover:text-cyan-300">
                    {source.title || source.uri}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                </a>
              ))}
            </div>

            <button
              onClick={() => setShowSourcesModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
            >
              Close Sources
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
