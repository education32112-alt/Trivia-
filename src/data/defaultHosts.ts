import { HostProfile } from '../types/trivia';

export const DEFAULT_HOSTS: HostProfile[] = [
  {
    id: 'rex-sterling',
    name: 'Rex "Megavolt" Sterling',
    title: 'The Golden Age Gameshow King',
    voiceName: 'Puck',
    stylePrompt: 'Bombastic, high-voltage, golden 1990s TV game show host with loud laughs, rapid punchlines, and dramatic pauses',
    avatarEmoji: '⚡',
    accentColor: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-amber-950/40 border-amber-500/40 text-amber-200',
    glowColor: 'shadow-amber-500/30',
    catchphrase: 'Lock it in, baby, and let the dice roll!',
    roastStyle: 'Playful Sassy',
    personalityBio: 'A flashy, gold-sequined TV veteran who treats every multiple-choice question like the grand finale of the Super Bowl. Loves confetti and dramatic tension.'
  },
  {
    id: 'glitch-9000',
    name: 'Glitch-9000',
    title: 'Rogue Quantum Synth & Roast AI',
    voiceName: 'Zephyr',
    stylePrompt: 'Cybernetic, ironic, slightly glitched voice with cold deadpan roasts, electronic pauses, and intellectual superiority',
    avatarEmoji: '🤖',
    accentColor: 'from-cyan-400 to-blue-600',
    bgColor: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200',
    glowColor: 'shadow-cyan-500/30',
    catchphrase: 'Processing human error rate: 99.4% probability.',
    roastStyle: 'Savage Roastmaster',
    personalityBio: 'An escapee neural network who finds human trivia adorable yet statistically pitiful. Delivers razor-sharp roasts and calculates your brain latency in real-time.'
  },
  {
    id: 'prof-quill',
    name: 'Prof. Thaddeus Quill',
    title: 'Oxford Scholar & Archival Snob',
    voiceName: 'Charon',
    stylePrompt: 'Distinguished, Victorian academic British professor, dry witty sarcasm, sophisticated pauses, tea-sipping manner',
    avatarEmoji: '🧐',
    accentColor: 'from-emerald-400 to-teal-600',
    bgColor: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
    glowColor: 'shadow-emerald-500/30',
    catchphrase: 'Indubitably. Let us see if your intellect rivals a pickled turnip.',
    roastStyle: 'Playful Sassy',
    personalityBio: 'Senior fellow in antiquities and arcane trivia. Appalled by modern slang, delights in obscure historical footnotes, and grades contestants with severe scholarly disdain.'
  },
  {
    id: 'madame-mystique',
    name: 'Madame Mystique',
    title: 'Cosmic Oracle of the Astral Void',
    voiceName: 'Kore',
    stylePrompt: 'Ethereal, dramatic, hypnotic fortune-teller whisper with mysterious cosmic intonations and theatrical flare',
    avatarEmoji: '🔮',
    accentColor: 'from-purple-400 to-fuchsia-600',
    bgColor: 'bg-purple-950/40 border-purple-500/40 text-purple-200',
    glowColor: 'shadow-purple-500/30',
    catchphrase: 'The celestial constellations tremble with your choice...',
    roastStyle: 'Gentle & Encouraging',
    personalityBio: 'An enigmatic seer who consults tarot cards, nebulas, and planetary alignments before validating your answers. Speaks in hypnotic astrological prophecies.'
  },
  {
    id: 'coach-buzz',
    name: 'Coach Buzz McGraw',
    title: 'Drill Sergeant of Trivia Boot Camp',
    voiceName: 'Fenrir',
    stylePrompt: 'Gruff, booming, ultra-intense athletic coach yelling motivational commands with whistle pauses and relentless drive',
    avatarEmoji: '🪖',
    accentColor: 'from-red-500 to-orange-600',
    bgColor: 'bg-red-950/40 border-red-500/40 text-red-200',
    glowColor: 'shadow-red-500/30',
    catchphrase: 'Drop and give me twenty cognitive pushups! No pain, no trivia gain!',
    roastStyle: 'Savage Roastmaster',
    personalityBio: 'A former military boot camp instructor turned hardcore trivia commander. Treats wrong answers like missed laps on the track and victory like Olympic gold.'
  }
];

export const PRESET_TOPICS = [
  {
    id: 'breaking-2025-2026',
    title: '2025/2026 Breakthroughs & Trends',
    desc: 'Latest real-time advancements in tech, space, AI, and viral global events.',
    icon: '🔥',
    badge: 'Live Search Grounded'
  },
  {
    id: 'space-and-cosmos',
    title: 'Deep Space & Astronomy',
    desc: 'Black holes, James Webb discoveries, exoplanets, and quantum mysteries.',
    icon: '🪐',
    badge: 'Fact-Checked'
  },
  {
    id: 'pop-culture-cinema',
    title: 'Pop Culture & Cinema Lore',
    desc: 'Blockbuster cinema, music charts, streaming sensations, and celebrity mythos.',
    icon: '🎬',
    badge: 'Entertainment'
  },
  {
    id: 'bizarre-history',
    title: 'Wild History & Ancient Secrets',
    desc: 'The weirdest battles, forgotten empires, eccentric monarchs, and ancient enigmas.',
    icon: '🏛️',
    badge: 'Historical Deep-Dive'
  },
  {
    id: 'gaming-and-geekdom',
    title: 'Gaming & Cyber Lore',
    desc: 'Video game history, esports champions, anime lore, and digital speedruns.',
    icon: '🕹️',
    badge: 'Geek Culture'
  },
  {
    id: 'extreme-nature',
    title: 'Wild Planet & Deep Oceans',
    desc: 'Bizarre abyssal creatures, extreme climates, venomous flora, and super-volcanoes.',
    icon: '🌋',
    badge: 'Earth Science'
  }
];
