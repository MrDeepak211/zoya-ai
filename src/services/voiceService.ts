const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const VoiceService = {
  isSupported(): boolean {
    return !!SpeechRecognition && 'speechSynthesis' in window;
  },

  playSFX(type: 'startup' | 'send' | 'receive' | 'wake') {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch (type) {
      case 'startup':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.5);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start();
        oscillator.stop(now + 0.5);
        break;
      case 'wake':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
        oscillator.start();
        oscillator.stop(now + 0.1);
        break;
      case 'send':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, now);
        oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.2);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        oscillator.start();
        oscillator.stop(now + 0.2);
        break;
    }
  },

  privateVoiceIndex: 0,

  getFemaleVoices() {
    const voices = window.speechSynthesis.getVoices();
    // Prioritize high quality and Indian female voices (en-IN, hi-IN, mr-IN) for sweet multilingual pronunciation, followed by other global female voices.
    const priorityKeywords = ['neerja', 'heera', 'priya', 'swara', 'samantha', 'google', 'microsoft Heera', 'zira', 'karen', 'tessa'];
    
    return voices.filter(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      
      const isFemale = name.includes('female') || 
                      name.includes('girl') || 
                      name.includes('woman') ||
                      name.includes('shruti') ||
                      name.includes('heera') ||
                      name.includes('neerja') ||
                      name.includes('priya') ||
                      name.includes('swara') ||
                      priorityKeywords.some(p => name.includes(p));
      
      const isTargetLang = lang.startsWith('en') || lang.startsWith('hi') || lang.startsWith('mr');
      return isFemale && isTargetLang;
    }).sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aLang = a.lang.toLowerCase();
      const bLang = b.lang.toLowerCase();

      // Highest priority to Indian/Multilingual female voices for natural English-Hindi-Marathi hybrid speech
      const aIsIndian = aLang.includes('in') || aName.includes('india') || aName.includes('heera') || aName.includes('neerja') || aName.includes('shruti');
      const bIsIndian = bLang.includes('in') || bName.includes('india') || bName.includes('heera') || bName.includes('neerja') || bName.includes('shruti');

      if (aIsIndian && !bIsIndian) return -1;
      if (!aIsIndian && bIsIndian) return 1;

      const aScore = priorityKeywords.findIndex(p => aName.includes(p));
      const bScore = priorityKeywords.findIndex(p => bName.includes(p));
      
      if (aScore !== -1 && bScore !== -1) return aScore - bScore;
      if (aScore !== -1) return -1;
      if (bScore !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  },

  cycleVoice() {
    const femaleVoices = this.getFemaleVoices();
    if (femaleVoices.length > 0) {
      this.privateVoiceIndex = (this.privateVoiceIndex + 1) % femaleVoices.length;
      return femaleVoices[this.privateVoiceIndex].name;
    }
    return null;
  },

  getCurrentVoice() {
    const femaleVoices = this.getFemaleVoices();
    if (femaleVoices.length === 0) return null;
    return femaleVoices[this.privateVoiceIndex % femaleVoices.length];
  },

  speak(text: string, emotion: string = 'neutral', onEnd?: () => void, onBoundary?: () => void) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Remove emotion tags and bracketed actions for speech
    const cleanText = text.replace(/\[[A-Z]+\]/g, '').replace(/\((.*?)\)/g, '').replace(/\*(.*?)\*/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voice = this.getCurrentVoice();
    if (voice) {
      utterance.voice = voice;
      // Synthesize in the voice's language config to guarantee high quality accent
      utterance.lang = voice.lang;
    }

    // Cute, sweet 18-year-old girl base tuning: elevated pitch and natural friendly rate
    const basePitch = 1.25; 
    const baseRate = 1.0;

    // Emotional adjustments
    switch (emotion.toLowerCase()) {
      case 'excited':
        utterance.pitch = basePitch + 0.15;
        utterance.rate = baseRate + 0.15;
        break;
      case 'happy':
        utterance.pitch = basePitch + 0.08;
        utterance.rate = baseRate + 0.05;
        break;
      case 'sad':
        utterance.pitch = basePitch - 0.15;
        utterance.rate = baseRate - 0.15;
        break;
      case 'shy':
        utterance.pitch = basePitch - 0.05;
        utterance.rate = baseRate - 0.08;
        break;
      case 'surprised':
        utterance.pitch = basePitch + 0.2;
        utterance.rate = baseRate + 0.1;
        break;
      case 'loving':
        utterance.pitch = basePitch + 0.05;
        utterance.rate = baseRate - 0.05;
        break;
      case 'worried':
        utterance.pitch = basePitch + 0.02;
        utterance.rate = baseRate + 0.05;
        break;
      case 'sleepy':
        utterance.pitch = basePitch - 0.1;
        utterance.rate = baseRate - 0.2;
        break;
      default:
        utterance.pitch = basePitch;
        utterance.rate = baseRate;
    }
    
    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word' && onBoundary) {
        onBoundary();
      }
    };

    window.speechSynthesis.speak(utterance);
  },

  listen(onResult: (text: string) => void, onEnd?: () => void) {
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    recognition.start();
    return recognition;
  }
};
