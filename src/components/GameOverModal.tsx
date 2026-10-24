import React, { useEffect, useState, useRef } from 'react';
import { Trophy, Flame, Target, RotateCcw, Volume2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HostProfile, QuestionResult } from '../types/trivia';

interface GameOverModalProps {
  currentHost: HostProfile;
  score: number;
  results: QuestionResult[];
  onPlayAgain: () => void;
  onChangeHost: () => void;
  onOpenLeaderboard: () => void;
  isMuted: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  currentHost,
  score,
  results,
  onPlayAgain,
  onChangeHost,
  onOpenLeaderboard,
  isMuted,
}) => {
  const [verdictText, setVerdictText] = useState<string>('Compiling the grand verdict...');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalQuestions = results.length;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  useEffect(() => {
    // Confetti fanfare if score > 0
    if (correctCount > 0) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    // Generate Host End-Game Commentary and speak it with gemini-3.8-flash-tts
    const fetchVerdict = async () => {
      try {
        const commentaryRes = await fetch('/api/host/commentary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostName: currentHost.name,
            personalityBio: currentHost.stylePrompt,
            event: 'game_over',
            streak: correctCount,
            score,
            playerAnswer: `${correctCount} out of ${totalQuestions} correct (${accuracy}% accuracy)`,
          }),
        });

        const data = await commentaryRes.json();
        const text =
          data.commentary ||
          `That is all she wrote! You finished with ${score.toLocaleString()} points. A game to remember!`;
        setVerdictText(text);

        if (!isMuted) {
          const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              voiceName: currentHost.voiceName,
              speechStyle: currentHost.stylePrompt,
              hostName: currentHost.name,
            }),
          });
          const ttsData = await ttsRes.json();
          if (ttsData.success && ttsData.audioBase64) {
            const audio = new Audio(`data:audio/wav;base64,${ttsData.audioBase64}`);
            audioRef.current = audio;
            setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);
            audio.play().catch(() => setIsSpeaking(false));
          }
        }
      } catch (e) {
        console.error('Verdict speech error:', e);
        setVerdictText(`What a thrilling showdown! You racked up ${score.toLocaleString()} points.`);
      }
    };

    fetchVerdict();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Trophy & Verdict Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-purple-950/60 via-slate-900/90 to-slate-900/90 border border-purple-500/40 shadow-2xl text-center relative overflow-hidden backdrop-blur-md">
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
          <Trophy className="w-10 h-10 stroke-[2.5]" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white font-['Space_Grotesk'] tracking-tight mb-2">
          SHOWDOWN COMPLETE!
        </h2>
        <p className="text-sm sm:text-base text-purple-200/80 max-w-xl mx-auto mb-6">
          Final results certified by host <strong className="text-amber-300">{currentHost.name}</strong>.
        </p>

        {/* Host Speech Bubble */}
        <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-700/50 text-left mb-8 relative shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentHost.avatarEmoji}</span>
              <div>
                <span className="text-xs font-bold text-white block">{currentHost.name}</span>
                <span className="text-[10px] text-purple-300">Voice: {currentHost.voiceName}</span>
              </div>
            </div>
            {isSpeaking && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse">
                <Volume2 className="w-3 h-3" /> Speaking...
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-purple-100 italic leading-relaxed">
            "{verdictText}"
          </p>
        </div>

        {/* Score Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-900/40">
            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Final Score</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-900/40">
            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Accuracy</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {accuracy}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              ({correctCount}/{totalQuestions} correct)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-900/40">
            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Persona Rating</span>
            <span className="text-base sm:text-lg font-bold text-pink-300">
              {accuracy >= 80 ? 'Mastermind 🧠' : accuracy >= 50 ? 'Sharp Contender ⚡' : 'Rookie Guess 🎲'}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenLeaderboard}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black text-sm sm:text-base shadow-lg shadow-amber-500/10 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>GLOBAL LEADERBOARD</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onChangeHost}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-purple-200 hover:text-white border border-purple-700/40 font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <span>SWITCH AI HOST</span>
          </button>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white font-['Space_Grotesk'] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          ROUND REVIEW & EXPLANATIONS
        </h3>

        <div className="space-y-3">
          {results.map((r, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border text-left transition ${
                r.isCorrect
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : 'bg-rose-950/20 border-rose-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  Question {i + 1}
                </span>
                <span
                  className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    r.isCorrect
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {r.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      +{r.pointsEarned} pts
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      Incorrect
                    </>
                  )}
                </span>
              </div>

              <p className="font-bold text-white text-sm mb-2">{r.question.question}</p>

              <div className="text-xs space-y-1 mb-2">
                <div className="text-emerald-300">
                  <strong>Correct Answer:</strong> {r.question.options[r.question.correctIndex]}
                </div>
                {!r.isCorrect && (
                  <div className="text-rose-300">
                    <strong>Your Choice:</strong>{' '}
                    {r.selectedOptionIndex !== null && r.selectedOptionIndex >= 0
                      ? r.question.options[r.selectedOptionIndex]
                      : 'Timed Out'}
                  </div>
                )}
              </div>

              <p className="text-xs text-purple-200/80 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-purple-900/30">
                {r.question.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
