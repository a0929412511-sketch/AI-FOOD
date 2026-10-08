// Audio helper for playing Gemini TTS WAV or falling back to Web Speech API with cute voice tuning

class VoiceAssistant {
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeakingSpeechSynth = false;

  public playCuteVoice(
    text: string,
    audioBase64?: string,
    onStart?: () => void,
    onEnd?: () => void
  ): { stop: () => void } {
    this.stop();

    // 1. If Gemini TTS audioBase64 exists, play it
    if (audioBase64) {
      try {
        const audioSrc = `data:audio/wav;base64,${audioBase64}`;
        const audio = new Audio(audioSrc);
        this.currentAudio = audio;

        audio.onplay = () => onStart?.();
        audio.onended = () => {
          this.currentAudio = null;
          onEnd?.();
        };
        audio.onerror = () => {
          console.warn('Audio element error, falling back to Web Speech API');
          this.currentAudio = null;
          this.speakWebSpeech(text, onStart, onEnd);
        };

        audio.play().catch((err) => {
          console.warn('Auto-play blocked or failed, fallback to Web Speech:', err);
          this.speakWebSpeech(text, onStart, onEnd);
        });

        return {
          stop: () => this.stop(),
        };
      } catch (err) {
        console.warn('Error creating audio, using Web Speech:', err);
      }
    }

    // 2. Web Speech API fallback with cute pitch and speed
    this.speakWebSpeech(text, onStart, onEnd);

    return {
      stop: () => this.stop(),
    };
  }

  private speakWebSpeech(text: string, onStart?: () => void, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported on this browser.');
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of emojis for cleaner speech synthesis pronunciation
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'zh-TW';
    utterance.pitch = 1.35; // Slightly higher pitch for cute kawaii mascot voice
    utterance.rate = 1.05;  // Slightly lively pace

    // Pick best Chinese voice if available
    const voices = window.speechSynthesis.getVoices();
    const twVoice = voices.find(
      (v) =>
        v.lang === 'zh-TW' ||
        v.lang.toLowerCase().includes('zh') ||
        v.name.includes('Taiwan') ||
        v.name.includes('Mei-Jia') ||
        v.name.includes('Yating') ||
        v.name.includes('Ting-Ting')
    );
    if (twVoice) {
      utterance.voice = twVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingSpeechSynth = true;
      onStart?.();
    };

    utterance.onend = () => {
      this.isSpeakingSpeechSynth = false;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.isSpeakingSpeechSynth = false;
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeakingSpeechSynth = false;
  }
}

export const voiceAssistant = new VoiceAssistant();
