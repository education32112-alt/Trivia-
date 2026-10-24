import React from 'react';
import { Volume2, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import { HostProfile } from '../types/trivia';

interface HostAvatarProps {
  host: HostProfile;
  speechText: string;
  isSpeaking: boolean;
  isLoadingAudio: boolean;
  onReplaySpeech?: () => void;
  badgeLabel?: string;
}

export const HostAvatar: React.FC<HostAvatarProps> = ({
  host,
  speechText,
  isSpeaking,
  isLoadingAudio,
  onReplaySpeech,
  badgeLabel = 'HOST COMMENTARY'
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 border border-purple-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
      {/* Background ambient lighting */}
      <div className={`absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none bg-gradient-to-br ${host.accentColor}`} />
      <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-15 pointer-events-none bg-purple-500" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 relative z-10">
        {/* Host Avatar Frame */}
        <div className="relative shrink-0">
          <div
            className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br ${host.accentColor} p-1 shadow-xl transition-transform duration-300 ${
              isSpeaking ? 'scale-105 ring-4 ring-purple-400/50 shadow-purple-500/40' : ''
            }`}
          >
            <div className="w-full h-full bg-[#111322] rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none">
                {host.avatarEmoji}
              </span>

              {/* Speaking animated waveform indicator */}
              {isSpeaking && (
                <div className="absolute bottom-1.5 inset-x-2 flex items-end justify-center gap-0.5 h-3">
                  <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-2" />
                  <span className="w-1 bg-pink-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3.5" />
                  <span className="w-1 bg-purple-400 rounded-full animate-[pulse_0.3s_ease-in-out_infinite] h-2.5" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-3" />
                  <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-1.5" />
                </div>
              )}
            </div>
          </div>

          {/* Active Voice Tag */}
          <div className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-md bg-purple-900 border border-purple-400/60 text-[9px] font-mono text-purple-200 uppercase font-bold tracking-wider shadow">
            {host.voiceName}
          </div>
        </div>

        {/* Speech Bubble & Meta */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-white font-['Space_Grotesk'] tracking-wide">
                {host.name}
              </span>
              <span className="text-xs text-purple-300/80 hidden sm:inline">• {host.title}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-300 bg-purple-900/50 border border-purple-500/30 px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                {badgeLabel}
              </span>
              {onReplaySpeech && speechText && (
                <button
                  onClick={onReplaySpeech}
                  disabled={isLoadingAudio || isSpeaking}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-purple-800/60 text-purple-200 hover:text-white border border-purple-700/40 text-xs transition disabled:opacity-50"
                  title="Replay host speech"
                >
                  {isLoadingAudio ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Speech Text Quote Bubble */}
          <div className="relative bg-slate-950/70 border border-purple-800/40 rounded-xl px-4 py-2.5 text-slate-100 text-sm sm:text-base leading-relaxed shadow-inner">
            <p className="font-medium italic text-purple-100/95 flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                "{speechText || host.catchphrase}"
              </span>
            </p>
          </div>

          {/* Host subtle status note */}
          <div className="mt-2 flex items-center justify-center sm:justify-start gap-3 text-[11px] text-purple-300/60 font-mono">
            <span>Style: {host.roastStyle}</span>
            <span>•</span>
            <span className="truncate">Persona: {host.catchphrase}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
