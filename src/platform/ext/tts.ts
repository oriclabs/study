import type { TTSAdapter, Voice } from '@platform/types.js';

/**
 * Extension TTS — uses Web Speech API in the document context
 * (popup/sidepanel). Not available from service workers.
 */
export function createExtTTS(): TTSAdapter {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  return {
    isSupported: () => supported,
    async speak(text, opts) {
      if (!supported) return;
      return new Promise<void>(resolve => {
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = opts?.rate ?? 1;
        if (opts?.voice) {
          const v = speechSynthesis.getVoices().find(v => v.name === opts.voice);
          if (v) utt.voice = v;
        }
        utt.onend = () => resolve();
        utt.onerror = () => resolve();
        speechSynthesis.speak(utt);
      });
    },
    cancel() { if (supported) speechSynthesis.cancel(); },
    async listVoices(): Promise<Voice[]> {
      if (!supported) return [];
      return speechSynthesis.getVoices().map(v => ({ id: v.voiceURI, name: v.name, lang: v.lang }));
    },
  };
}
