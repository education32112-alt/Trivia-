import React, { useState } from 'react';
import { X, Check, Volume2, Plus, Sparkles, Wand2, ShieldAlert } from 'lucide-react';
import { HostProfile, VoiceName } from '../types/trivia';
import { DEFAULT_HOSTS } from '../data/defaultHosts';

interface HostSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHost: HostProfile;
  onSelectHost: (host: HostProfile) => void;
  onTestVoice: (host: HostProfile) => void;
  testingHostId: string | null;
}

const AVAILABLE_VOICES: { name: VoiceName; desc: string; sample: string }[] = [
  { name: 'Puck', desc: 'Upbeat, electric, playful & energetic', sample: 'Lock it in, baby!' },
  { name: 'Charon', desc: 'Distinguished, scholarly, deep & aristocratic', sample: 'Indubitably. Let us proceed.' },
  { name: 'Kore', desc: 'Hypnotic, mysterious, warm & astral', sample: 'The stars whisper the truth.' },
  { name: 'Fenrir', desc: 'Intense, booming, gritty & loud', sample: 'Let\'s go! No pain, no trivia gain!' },
  { name: 'Zephyr', desc: 'Crisp, sarcastic synth & modern cybernetic', sample: 'Calculating human failure probability.' },
];

export const HostSelectorModal: React.FC<HostSelectorModalProps> = ({
  isOpen,
  onClose,
  currentHost,
  onSelectHost,
  onTestVoice,
  testingHostId,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customHosts, setCustomHosts] = useState<HostProfile[]>(() => {
    try {
      const saved = localStorage.getItem('trivia_custom_hosts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Custom host form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🔥');
  const [voiceName, setVoiceName] = useState<VoiceName>('Puck');
  const [catchphrase, setCatchphrase] = useState('');
  const [roastStyle, setRoastStyle] = useState<'Gentle & Encouraging' | 'Playful Sassy' | 'Savage Roastmaster'>('Playful Sassy');
  const [personalityBio, setPersonalityBio] = useState('');

  if (!isOpen) return null;

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHost: HostProfile = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      title: title.trim() || 'Dynamic Trivia Master',
      voiceName,
      stylePrompt: `${roastStyle} tone: ${personalityBio || 'Vibrant, sharp-witted AI trivia host'}. Distinctive catchphrase: ${catchphrase}`,
      avatarEmoji: avatarEmoji || '✨',
      accentColor: 'from-fuchsia-500 to-indigo-600',
      bgColor: 'bg-fuchsia-950/40 border-fuchsia-500/40 text-fuchsia-200',
      glowColor: 'shadow-fuchsia-500/30',
      catchphrase: catchphrase.trim() || 'Let the mind games begin!',
      roastStyle,
      personalityBio: personalityBio.trim() || 'An unpredictable, dynamic custom AI game show host created by the player.',
    };

    const updated = [newHost, ...customHosts];
    setCustomHosts(updated);
    try {
      localStorage.setItem('trivia_custom_hosts', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    onSelectHost(newHost);
    onClose();
  };

  const allHosts = [...DEFAULT_HOSTS, ...customHosts];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f1021] border border-purple-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-purple-900/40 flex items-center justify-between bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk'] tracking-wide">
                CHOOSE YOUR AI HOST
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DYNAMIC PERSONALITIES
              </span>
            </div>
            <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
              Each AI host has their own unique personality, commentary voice (gemini-3.8-flash-tts), and Live API persona.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-purple-900/30 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'border-purple-500 text-purple-200'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Host Hall of Fame ({allHosts.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'custom'
                ? 'border-purple-500 text-purple-200'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-pink-400" />
            Host Forge (Create Custom AI)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'presets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allHosts.map((h) => {
                const isSelected = h.id === currentHost.id;
                const isTesting = testingHostId === h.id;

                return (
                  <div
                    key={h.id}
                    className={`relative p-5 rounded-2xl border transition-all text-left flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-400 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20'
                        : 'bg-slate-900/70 border-purple-900/30 hover:border-purple-600/60 hover:bg-slate-800/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${h.accentColor} p-0.5 shadow-md`}>
                            <div className="w-full h-full bg-[#131525] rounded-[10px] flex items-center justify-center text-2xl">
                              {h.avatarEmoji}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-extrabold text-white text-base font-['Space_Grotesk'] flex items-center gap-2">
                              {h.name}
                              {isSelected && (
                                <span className="p-0.5 rounded-full bg-emerald-500 text-black">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-purple-300/80 font-medium">{h.title}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/50 text-purple-200 border border-purple-700/40">
                              Voice: {h.voiceName} • {h.roastStyle}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-3">
                        {h.personalityBio}
                      </p>

                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-purple-900/40 text-xs italic text-amber-200/90 mb-4">
                        "{h.catchphrase}"
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-purple-900/30">
                      {/* Audio voice test button */}
                      <button
                        onClick={() => onTestVoice(h)}
                        disabled={isTesting}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-purple-900/60 text-purple-200 hover:text-white border border-purple-700/40 text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                        title="Sample speech with gemini-3.8-flash-tts"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isTesting ? 'animate-bounce text-amber-400' : ''}`} />
                        {isTesting ? 'Generating Voice...' : 'Test Voice'}
                      </button>

                      {/* Select button */}
                      <button
                        onClick={() => {
                          onSelectHost(h);
                          onClose();
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-purple-600 text-white cursor-default'
                            : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-md'
                        }`}
                      >
                        {isSelected ? 'Active Host' : 'Select Host'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Custom Host Forge Form */
            <form onSubmit={handleSaveCustom} className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-3">
                <Wand2 className="w-5 h-5 text-amber-400 shrink-0" />
                <p>
                  Design an original AI host! Powered by <strong>gemini-3.8-flash-tts</strong>, your host will read trivia questions, deliver custom roasts, and converse in the Live Voice Booth!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Host Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Captain Quasar, DJ Byte, Lady Eleanor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-700/50 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Host Title / Moniker
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Quantum Quizmaster, Neon Oracle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-700/50 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Avatar Emoji
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={avatarEmoji}
                    onChange={(e) => setAvatarEmoji(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-700/50 text-white text-center text-xl focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Voice Actor Model (gemini-3.8-flash-tts)
                  </label>
                  <select
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value as VoiceName)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-700/50 text-white text-sm focus:outline-none focus:border-purple-400"
                  >
                    {AVAILABLE_VOICES.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} — {v.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Roast & Attitude Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Gentle & Encouraging', 'Playful Sassy', 'Savage Roastmaster'] as const).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRoastStyle(r)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                        roastStyle === r
                          ? 'bg-purple-600/80 border-purple-400 text-white shadow-md'
                          : 'bg-slate-900 border-purple-900/40 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Signature Catchphrase
                </label>
                <input
                  type="text"
                  placeholder="e.g. In space, no one can hear you guess wrong!"
                  value={catchphrase}
                  onChange={(e) => setCatchphrase(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-700/50 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Personality & Backstory Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe how they speak, their humor, their obsessions, or their quirks..."
                  value={personalityBio}
                  onChange={(e) => setPersonalityBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-700/50 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition transform active:scale-98"
                >
                  Create & Activate Host
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
