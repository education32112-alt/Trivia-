/**
 * Audio helpers for Live API (gemini-3.8-live) and PCM streaming
 */

// Downsample or convert Float32 [-1.0, 1.0] to 16-bit PCM little-endian
export function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

// Convert Int16Array to base64
export function pcmToBase64(pcmData: Int16Array): string {
  const bytes = new Uint8Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 16-bit PCM (24kHz from Live API) into Float32Array for AudioBuffer
export function base64ToFloat32Array(base64: string): Float32Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  return float32;
}

/**
 * Live audio player managing gapless queue at 24kHz for gemini-3.8-live
 */
export class LiveAudioPlayer {
  private ctx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  public analyser: AnalyserNode | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx({ sampleRate: 24000 });
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playChunk(base64Pcm: string) {
    this.init();
    if (!this.ctx || !this.analyser) return;

    try {
      const floatData = base64ToFloat32Array(base64Pcm);
      const audioBuffer = this.ctx.createBuffer(1, floatData.length, 24000);
      audioBuffer.getChannelData(0).set(floatData);

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.analyser);

      const currentTime = this.ctx.currentTime;
      // Schedule gaplessly
      const startTime = Math.max(currentTime, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) this.activeSources.splice(idx, 1);
      };
    } catch (err) {
      console.error('Error queuing Live PCM audio chunk:', err);
    }
  }

  public stopAndClear() {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.activeSources = [];
    if (this.ctx) {
      this.nextStartTime = this.ctx.currentTime;
    }
  }

  public getEnergy(): number {
    if (!this.analyser) return 0;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / (data.length * 255);
  }

  public close() {
    this.stopAndClear();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
