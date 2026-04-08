import type { SpeakOp } from '@core/types/op.js';
import type { RenderContext } from '../state.js';
import type { TTSAdapter } from '@platform/types.js';

/** Speak text via TTS. Wired through an adapter so targets with no speech synth can no-op. */
export function createSpeakOp(tts: TTSAdapter) {
  return async function speakOp(op: SpeakOp, _ctx: RenderContext): Promise<void> {
    if (!tts.isSupported()) return;
    await tts.speak(op.data.text, { rate: op.data.rate });
  };
}
