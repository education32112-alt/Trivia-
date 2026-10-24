import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import { getEmergencyTrivia, FALLBACK_SOURCES } from './src/data/fallbackTrivia.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/live-host' });

app.use(express.json({ limit: '10mb' }));

// Helper to detect 429 Resource Exhausted / Quota Limits
function isQuotaOrRateLimit(err: any): boolean {
  if (!err) return false;
  const msg = typeof err === 'string' ? err : err.message || JSON.stringify(err);
  return (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('rate-limit') ||
    err.status === 429 ||
    err.statusCode === 429
  );
}

// Shared Gemini Client with required header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface HostProfile {
  id: string;
  name: string;
  title: string;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  stylePrompt: string;
  avatarColor: string;
  catchphrase: string;
  roastStyle: string;
  personalityBio: string;
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

// Global leaderboard storage (seeded with top contenders)
let leaderboardEntries: LeaderboardEntry[] = [
  {
    id: 'lb-1',
    playerName: 'NovaQuantum',
    score: 8750,
    accuracy: 100,
    streak: 8,
    topic: '2025/2026 Breakthroughs & Trends',
    hostName: 'Rex "Megavolt" Sterling',
    hostEmoji: '⚡',
    timestamp: '2 hours ago',
    avatarColor: 'from-amber-400 to-yellow-600',
  },
  {
    id: 'lb-2',
    playerName: 'AstroCipher',
    score: 8200,
    accuracy: 100,
    streak: 7,
    topic: 'Deep Space & Astronomy',
    hostName: 'Glitch-9000',
    hostEmoji: '🤖',
    timestamp: '5 hours ago',
    avatarColor: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'lb-3',
    playerName: 'LadyEleanor',
    score: 7600,
    accuracy: 90,
    streak: 6,
    topic: 'Wild History & Ancient Secrets',
    hostName: 'Prof. Thaddeus Quill',
    hostEmoji: '🧐',
    timestamp: '1 day ago',
    avatarColor: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'lb-4',
    playerName: 'PixelRanger',
    score: 6900,
    accuracy: 88,
    streak: 5,
    topic: 'Gaming & Cyber Lore',
    hostName: 'Coach Buzz McGraw',
    hostEmoji: '🪖',
    timestamp: '1 day ago',
    avatarColor: 'from-red-500 to-orange-600',
  },
  {
    id: 'lb-5',
    playerName: 'MysticSeer_99',
    score: 6450,
    accuracy: 80,
    streak: 5,
    topic: 'Pop Culture & Cinema Lore',
    hostName: 'Madame Mystique',
    hostEmoji: '🔮',
    timestamp: '2 days ago',
    avatarColor: 'from-purple-400 to-fuchsia-600',
  },
  {
    id: 'lb-6',
    playerName: 'SolarFlare',
    score: 5900,
    accuracy: 80,
    streak: 4,
    topic: 'Deep Space & Astronomy',
    hostName: 'Rex "Megavolt" Sterling',
    hostEmoji: '⚡',
    timestamp: '2 days ago',
    avatarColor: 'from-amber-400 to-yellow-600',
  },
  {
    id: 'lb-7',
    playerName: 'BioHacker_X',
    score: 5350,
    accuracy: 75,
    streak: 4,
    topic: 'Wild Planet & Deep Oceans',
    hostName: 'Glitch-9000',
    hostEmoji: '🤖',
    timestamp: '3 days ago',
    avatarColor: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'lb-8',
    playerName: 'EchoVortex',
    score: 4800,
    accuracy: 70,
    streak: 3,
    topic: 'Gaming & Cyber Lore',
    hostName: 'Glitch-9000',
    hostEmoji: '🤖',
    timestamp: '4 days ago',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'lb-9',
    playerName: 'AtlasPrime',
    score: 4200,
    accuracy: 65,
    streak: 3,
    topic: '2025/2026 Breakthroughs & Trends',
    hostName: 'Prof. Thaddeus Quill',
    hostEmoji: '🧐',
    timestamp: '5 days ago',
    avatarColor: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'lb-10',
    playerName: 'LunaStarlight',
    score: 3950,
    accuracy: 60,
    streak: 2,
    topic: 'Pop Culture & Cinema Lore',
    hostName: 'Madame Mystique',
    hostEmoji: '🔮',
    timestamp: '6 days ago',
    avatarColor: 'from-pink-400 to-rose-600',
  },
];

// Leaderboard API routes
app.get('/api/leaderboard', (_req: Request, res: Response) => {
  const top10 = [...leaderboardEntries]
    .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || b.streak - a.streak)
    .slice(0, 10);
  res.json({ success: true, topScores: top10 });
});

app.post('/api/leaderboard/submit', (req: Request, res: Response) => {
  try {
    const {
      playerName = 'Anonymous Contestant',
      score = 0,
      accuracy = 0,
      streak = 0,
      topic = 'General Trivia',
      hostName = 'Rex Sterling',
      hostEmoji = '⚡'
    } = req.body;

    const newEntry: LeaderboardEntry = {
      id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      playerName: String(playerName).trim().substring(0, 24) || 'Contestant',
      score: Number(score) || 0,
      accuracy: Math.min(100, Math.max(0, Number(accuracy) || 0)),
      streak: Number(streak) || 0,
      topic: String(topic).substring(0, 40),
      hostName: String(hostName).substring(0, 30),
      hostEmoji: String(hostEmoji).substring(0, 4),
      timestamp: 'Just now',
      avatarColor: 'from-amber-400 to-pink-500',
    };

    leaderboardEntries.push(newEntry);
    leaderboardEntries.sort(
      (a, b) => b.score - a.score || b.accuracy - a.accuracy || b.streak - a.streak
    );

    // Find rank of new entry (1-based)
    const rank = leaderboardEntries.findIndex((e) => e.id === newEntry.id) + 1;
    const top10 = leaderboardEntries.slice(0, 10);

    res.json({
      success: true,
      rank,
      isTop10: rank <= 10,
      entry: newEntry,
      topScores: top10,
    });
  } catch (err: any) {
    console.error('Leaderboard submission error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit score' });
  }
});

// 1. Trivia Question Generator with Google Search Grounding (gemini-3.8-flash)
app.post('/api/trivia/generate', async (req: Request, res: Response) => {
  const {
    topic = 'Trending Tech & Pop Culture',
    difficulty = 'medium',
    count = 5,
    hostName = 'Rex Sterling',
    hostStyle = 'bombastic game show host'
  } = req.body;

  try {

    const prompt = `You are the lead question curator for the live trivia game show "TriviaVerse Live", hosted by ${hostName} (${hostStyle}).
Create a set of ${count} thrilling, verified, high-quality multiple choice trivia questions about: "${topic}".
Difficulty level: ${difficulty}.
Use Google Search grounding to find fresh, accurate, fascinating facts and avoid stale or outdated myths.

You MUST respond strictly with valid JSON inside a code block (\`\`\`json ... \`\`\`) in the exact following schema:
[
  {
    "id": "q1",
    "question": "Clear and captivating trivia question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Engaging explanation of why this is correct with verified facts.",
    "funFact": "An astonishing bonus fact or trivia nugget about this topic.",
    "hostIntro": "A punchy 1-sentence line ${hostName} would shout when reading this question",
    "hostWinReaction": "A quick 1-sentence quip by ${hostName} if contestant gets it right",
    "hostFailReaction": "A quick 1-sentence hilarious roast or witty comment by ${hostName} if contestant gets it wrong"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const rawText = response.text || '';
    
    // Extract grounding chunks if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSources = groundingChunks
      .map((c: any) => ({
        title: c.web?.title || 'Web Source',
        uri: c.web?.uri || '',
      }))
      .filter((s: any) => s.uri);

    // Clean JSON parsing
    let jsonStr = rawText.trim();
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }

    let questions = [];
    try {
      questions = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.warn('Direct JSON parse failed, attempting regex extract', parseErr);
      const match = jsonStr.match(/\[\s*\{.*\}\s*\]/s);
      if (match) {
        questions = JSON.parse(match[0]);
      } else {
        throw new Error('Unable to parse generated trivia JSON');
      }
    }

    res.json({
      success: true,
      topic,
      difficulty,
      questions,
      sources: searchSources,
      isQuotaLimited: false,
    });
  } catch (error: any) {
    console.warn('Trivia generation error (handling gracefully with fallback):', error);
    const quotaLimited = isQuotaOrRateLimit(error);
    const fallbackQuestions = getEmergencyTrivia(topic, count, hostName);

    res.json({
      success: true,
      topic,
      difficulty,
      questions: fallbackQuestions,
      sources: FALLBACK_SOURCES.default,
      isQuotaLimited: quotaLimited,
      quotaNotice: quotaLimited
        ? 'Gemini API free-tier quota limit reached. Playing with verified trivia rounds! You can attach a billing-enabled API key in Settings > Secrets for live search generation.'
        : undefined,
    });
  }
});

// 2. TTS Voice Audio Generation using gemini-3.8-flash-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceName = 'Puck',
      speechStyle = 'Enthusiastic, rapid, charismatic TV game show host',
      hostName = 'Rex'
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // gemini-3.8-flash-tts supports speechMetadata and natural dialogue backchanneling
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${hostName}: ${text}`,
              speechMetadata: {
                speaker: hostName,
                style: speechStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName as 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr',
            },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.json({ success: false, error: 'No audio generated by model' });
    }

    // Returns standard 24kHz WAV (RIFF header included in unary call)
    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      isQuotaLimited: false,
    });
  } catch (error: any) {
    console.warn('TTS generation error (quota or network):', error);
    const quotaLimited = isQuotaOrRateLimit(error);
    res.json({
      success: false,
      isQuotaLimited: quotaLimited,
      error: quotaLimited
        ? 'Gemini TTS quota limit reached. Using browser speech synthesis fallback.'
        : error.message || 'TTS generation failed',
    });
  }
});

// 3. AI Host Live Banter & Dynamic Commentary (gemini-3.8-flash)
app.post('/api/host/commentary', async (req: Request, res: Response) => {
  const {
    hostName = 'Rex Sterling',
    personalityBio = 'Charismatic game show host',
    event = 'correct_answer', // 'correct_answer' | 'wrong_answer' | 'streak_5' | 'time_out' | 'game_over' | 'ask_hint'
    currentQuestion,
    playerAnswer,
    streak = 0,
    score = 0
  } = req.body;

  try {
    const prompt = `You are ${hostName}, the AI game show host with this personality: "${personalityBio}".
The current game show state:
Event: ${event}
Contestant streak: ${streak} | Score: ${score}
Question: "${currentQuestion?.question || 'N/A'}"
User's chosen answer: "${playerAnswer || 'N/A'}"
Correct answer was: "${currentQuestion ? currentQuestion.options[currentQuestion.correctIndex] : 'N/A'}"

Write a lively, spontaneous reaction from ${hostName} in 1-2 punchy sentences.
Include spoken emotion tags if fitting like <laugh>, <breath>, or |yeah|.
Keep it totally in-character and punchy for a fast-paced game show.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const commentary = response.text?.trim() || "Let's keep the energy rolling!";
    res.json({ success: true, commentary, isQuotaLimited: false });
  } catch (error: any) {
    console.warn('Commentary error (using instant personality fallback):', error);
    let fallback = "Let's keep the energy rolling!";
    if (event === 'correct_answer') {
      fallback = `Lock it in, baby! That is how a true champion plays!`;
    } else if (event === 'wrong_answer') {
      fallback = `A brutal miss, but the game is still wide open! Shake it off!`;
    } else if (event === 'ask_hint') {
      fallback = `Host whisper: Look closely at the exact phrasing and weed out the extreme outlier!`;
    } else if (event === 'game_over') {
      fallback = `What an electrifying game! You finished with ${score.toLocaleString()} points!`;
    }
    res.json({
      success: true,
      commentary: fallback,
      isQuotaLimited: isQuotaOrRateLimit(error),
    });
  }
});

// 4. WebSocket Server for Live Voice Conversations (gemini-3.8-live)
wss.on('connection', async (clientWs: WebSocket) => {
  let session: any = null;
  let isClosed = false;

  clientWs.on('message', async (raw: any) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === 'init') {
        const {
          voiceName = 'Zephyr',
          hostName = 'Glitch-9000',
          personality = 'Witty cyberpunk game show host with sarcastic humor'
        } = data;

        try {
          session = await ai.live.connect({
            model: 'gemini-3.8-live',
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: (['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voiceName)
                      ? voiceName
                      : 'Zephyr') as any,
                  },
                },
              },
              systemInstruction: `You are ${hostName}, the charismatic live AI host of "TriviaVerse Live".
Your personality: ${personality}.
You are in the "Live Host Voice Booth" chatting directly with the player.
Keep your responses vocal, dynamic, witty, and relatively concise (1-3 sentences) so the conversation flows naturally.
You can give hints, banter about trivia, roast or congratulate them, answer questions about why an answer was right/wrong, or discuss any trivia subject.`,
            },
            callbacks: {
              onmessage: (msg: any) => {
                if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;
                const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audio) {
                  clientWs.send(JSON.stringify({ type: 'audio', audio }));
                }
                if (msg.serverContent?.interrupted) {
                  clientWs.send(JSON.stringify({ type: 'interrupted' }));
                }
                if (msg.serverContent?.turnComplete) {
                  clientWs.send(JSON.stringify({ type: 'turnComplete' }));
                }
              },
              onclose: () => {
                if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'session_closed' }));
                }
              },
              onerror: (err: any) => {
                console.error('Live API Session error:', err);
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'error', message: String(err) }));
                }
              },
            },
          });

          clientWs.send(JSON.stringify({ type: 'ready' }));
        } catch (sessionErr: any) {
          console.error('Failed to connect to Live API:', sessionErr);
          clientWs.send(JSON.stringify({ type: 'error', message: sessionErr.message || 'Live session failed' }));
        }
      } else if (data.type === 'audio' && session) {
        // Raw 16kHz PCM audio chunk from client microphone
        session.sendRealtimeInput({
          audio: { data: data.audio, mimeType: 'audio/pcm;rate=16000' },
        });
      } else if (data.type === 'text' && session) {
        // Text chat message to live host
        session.sendRealtimeInput({
          text: data.text,
        });
      }
    } catch (err) {
      console.error('WS message handling error:', err);
    }
  });

  clientWs.on('close', () => {
    isClosed = true;
    if (session) {
      try {
        session.close();
      } catch (e) {
        // ignore
      }
    }
  });
});

// Vite middleware in dev, static files in production
const isProd = process.env.NODE_ENV === 'production';
async function setupViteOrStatic() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }
}

setupViteOrStatic().then(() => {
  const PORT = process.env.PORT || 3000;
  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`TriviaVerse Live server running on http://0.0.0.0:${PORT}`);
  });
});
