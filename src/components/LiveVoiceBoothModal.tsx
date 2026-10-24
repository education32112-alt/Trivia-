import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Send, Sparkles, Radio, AlertCircle } from 'lucide-react';
import { HostProfile } from '../types/trivia';
import { floatTo16BitPCM, pcmToBase64, LiveAudioPlayer } from '../utils/audioPcm';

interface LiveVoiceBoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHost: HostProfile;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'host' | 'system';
  text: string;
  timestamp: string;
}

export const LiveVoiceBoothModal: React.FC<LiveVoiceBoothModalProps> = ({
  isOpen,
  onClose,
  currentHost,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [statusText, setStatusText] = useState('Connecting to Live API...');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize and tear down WebSocket and Audio
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    const player = new LiveAudioPlayer();
    playerRef.current = player;
    setErrorMsg(null);
    setStatusText('Connecting to Gemini 3.8 Live session...');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live-host`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatusText('Session open. Handshaking with Host...');
      ws.send(
        JSON.stringify({
          type: 'init',
          voiceName: currentHost.voiceName,
          hostName: currentHost.name,
          personality: currentHost.stylePrompt,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ready') {
          setIsConnected(true);
          setStatusText(`Live with ${currentHost.name}`);
          setMessages((prev) => [
            ...prev,
            {
              id: 'init-msg',
              sender: 'host',
              text: `Welcome to the Voice Booth! I am ${currentHost.name}. Ask me for trivia hints, argue about answers, or just test your luck!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        } else if (data.type === 'audio' && data.audio) {
          player.playChunk(data.audio);
          setStatusText(`${currentHost.name} is speaking...`);
        } else if (data.type === 'interrupted') {
          player.stopAndClear();
          setStatusText('Interrupted — Host listening');
        } else if (data.type === 'turnComplete') {
          setStatusText('Host finished speaking — your turn!');
        } else if (data.type === 'text' && data.text) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.sender === 'host') {
              return [...prev.slice(0, -1), { ...last, text: last.text + ' ' + data.text }];
            }
            return [
              ...prev,
              {
                id: `host-${Date.now()}`,
                sender: 'host',
                text: data.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ];
          });
        } else if (data.type === 'error') {
          setErrorMsg(data.message || 'Error occurred in Live API session');
        }
      } catch (err) {
        console.error('Error parsing live WS message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('Live WS error:', err);
      setErrorMsg('WebSocket connection to Live API failed');
      setStatusText('Connection error');
    };

    ws.onclose = () => {
      setIsConnected(false);
      setStatusText('Live session disconnected');
    };

    // Start Visualizer Canvas Loop
    startVisualizer();

    return () => {
      cleanup();
    };
  }, [isOpen, currentHost]);

  const cleanup = () => {
    stopMicrophone();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.close();
      playerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsConnected(false);
  };

  const startMicrophone = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 16000 });
      inputAudioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      // Buffer size 2048 gives quick 128ms packets
      const processor = ctx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const inputFloats = e.inputBuffer.getChannelData(0);
        const pcm16 = floatTo16BitPCM(inputFloats);
        const base64Audio = pcmToBase64(pcm16);

        wsRef.current.send(
          JSON.stringify({
            type: 'audio',
            audio: base64Audio,
          })
        );
      };

      source.connect(processor);
      processor.connect(ctx.destination);

      setIsMicActive(true);
      setStatusText('Mic active — speak to your host!');
    } catch (err: any) {
      console.error('Mic access error:', err);
      setErrorMsg(err.message || 'Microphone access denied');
    }
  };

  const stopMicrophone = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsMicActive(false);
  };

  const toggleMicrophone = () => {
    if (isMicActive) {
      stopMicrophone();
      setStatusText('Microphone muted');
    } else {
      startMicrophone();
    }
  };

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const userText = textInput.trim();
    wsRef.current.send(
      JSON.stringify({
        type: 'text',
        text: userText,
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setTextInput('');
    setStatusText(`${currentHost.name} is thinking...`);
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'text', text: prompt }));
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setStatusText(`${currentHost.name} is preparing a reply...`);
  };

  const startVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const energy = playerRef.current ? playerRef.current.getEnergy() : 0;
      const activePulse = isMicActive ? 0.35 : energy;

      // Draw futuristic animated waveform
      ctx.beginPath();
      ctx.strokeStyle = energy > 0.1 ? '#a855f7' : isMicActive ? '#ec4899' : '#64748b';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = energy > 0.1 ? '#c084fc' : '#f472b6';

      const bars = 32;
      const barWidth = width / bars;
      for (let i = 0; i < bars; i++) {
        const x = i * barWidth;
        const offset = Math.sin(Date.now() * 0.005 + i * 0.3) * (activePulse * 30 + 3);
        const y = centerY + offset;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#0c0d1c] border border-purple-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/40 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentHost.accentColor} p-0.5 shadow-lg`}>
              <div className="w-full h-full bg-[#121426] rounded-[14px] flex items-center justify-center text-2xl">
                {currentHost.avatarEmoji}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white font-['Space_Grotesk']">
                  LIVE VOICE BOOTH
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-pink-400" />
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-purple-300">
                Talking in real-time with <strong>{currentHost.name}</strong> ({currentHost.voiceName})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visualizer Canvas & Live Status Bar */}
        <div className="relative bg-slate-950/80 px-4 py-3 border-b border-purple-900/30 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={500}
            height={50}
            className="w-full max-w-md h-12 object-contain"
          />
          <div className="flex items-center gap-2 mt-1 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="text-purple-200/90 font-medium">{statusText}</span>
          </div>

          {errorMsg && (
            <div className="mt-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 px-3 py-1 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Chat / Interaction Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0b16]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                  m.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-slate-900/90 text-purple-100 border border-purple-800/40 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75 font-mono">
                  <span>{m.sender === 'user' ? 'You (Contestant)' : currentHost.name}</span>
                  <span>{m.timestamp}</span>
                </div>
                <p>{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-purple-900/30 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Quick prompts:</span>
          {[
            "Roast my trivia skills!",
            "Give me your best trivia riddle",
            "What's your favorite secret fact?",
            "Any tips for high score streaks?",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/60 text-purple-200 hover:text-white border border-purple-800/40 text-[11px] whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-purple-900/40 flex items-center gap-3">
          {/* Microphone Push / Toggle */}
          <button
            onClick={toggleMicrophone}
            disabled={!isConnected}
            className={`p-3.5 rounded-2xl font-bold flex items-center gap-2 transition shadow-lg ${
              isMicActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-500/30 animate-pulse'
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white'
            } disabled:opacity-50`}
            title={isMicActive ? 'Mute Microphone' : 'Enable Live Voice with Microphone'}
          >
            {isMicActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-xs hidden sm:inline">
              {isMicActive ? 'Mute Mic' : 'Speak Live'}
            </span>
          </button>

          {/* Text input for typing to Live API */}
          <form onSubmit={handleSendText} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Type a question or message to ${currentHost.name}...`}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={!isConnected}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-purple-700/50 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isConnected || !textInput.trim()}
              className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
