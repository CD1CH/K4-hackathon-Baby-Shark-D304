/**
 * Client-side WAV encoding for voice cloning.
 *
 * MediaRecorder hands us webm/opus, but POST /voice/clone needs a WAV. We decode
 * the recording with the Web Audio API and re-encode 16-bit PCM mono ourselves,
 * so the backend needs no ffmpeg dependency.
 *
 * 16 kHz mono is what reference audio gets resampled to anyway, and it keeps the
 * base64 body around 30x smaller than raw 48 kHz stereo.
 */

const TARGET_SAMPLE_RATE = 16000;

/** Decode any browser-recorded audio, down-mixed to mono and resampled. */
async function decodeToMono(blob: Blob, maxSeconds?: number): Promise<Float32Array> {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  const Offline = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  if (!Ctx || !Offline) throw new Error('Web Audio API is unavailable in this browser');

  const ctx = new Ctx();
  let decoded;
  try {
    decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
  } finally {
    ctx.close();
  }

  const seconds = maxSeconds ? Math.min(decoded.duration, maxSeconds) : decoded.duration;
  const frames = Math.max(1, Math.ceil(seconds * TARGET_SAMPLE_RATE));

  // A 1-channel destination makes the graph down-mix stereo for us, and the
  // context's sample rate does the resampling in the same render pass.
  const offline = new Offline(1, frames, TARGET_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  // Rendering stops at `frames`, so an over-long take is truncated, not rejected.
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

/** Wrap Float32 samples in a 16-bit PCM mono WAV container. */
function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeAscii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, buffer.byteLength - 8, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk length
  view.setUint16(20, 1, true); // 1 = uncompressed PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate: mono @ 2 bytes/sample
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, Math.round(clamped * 32767), true);
  }
  return buffer;
}

/** btoa() on a whole recording blows the argument limit — feed it in chunks. */
function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return btoa(binary);
}

/**
 * Turn a MediaRecorder blob into `{ base64, durationSec }` ready for
 * POST /voice/clone. Pass `maxSeconds` to hard-cap the take — the recorder can
 * overshoot its own stop() by a fraction of a second, and the clone API rejects
 * anything longer than its limit.
 */
export async function recordingToWavBase64(blob: Blob, { maxSeconds }: { maxSeconds?: number } = {}) {
  const samples = await decodeToMono(blob, maxSeconds);
  return {
    base64: toBase64(encodeWav(samples, TARGET_SAMPLE_RATE)),
    durationSec: samples.length / TARGET_SAMPLE_RATE
  };
}
