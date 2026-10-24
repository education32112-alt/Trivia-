export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface HostProfile {
  id: string;
  name: string;
  title: string;
  voiceName: VoiceName;
  stylePrompt: string;
  avatarEmoji: string;
  accentColor: string;
  bgColor: string;
  glowColor: string;
  catchphrase: string;
  roastStyle: 'Gentle & Encouraging' | 'Playful Sassy' | 'Savage Roastmaster';
  personalityBio: string;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  funFact: string;
  hostIntro: string;
  hostWinReaction: string;
  hostFailReaction: string;
}

export interface QuestionResult {
  question: TriviaQuestion;
  selectedOptionIndex: number | null; // null if timed out
  isCorrect: boolean;
  timeSpentSeconds: number;
  pointsEarned: number;
}

export interface GameSettings {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  questionCount: number;
  timePerQuestion: number; // in seconds, 0 for unlimited
  enableHostAudio: boolean;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  accuracy: number;
  streak: number;
  topic: string;
  hostName: string;
  hostEmoji: string;
  timestamp: string;
  avatarColor: string;
}

