// Praise audio messages for success feedback
export const praiseMessages = [
  '你真棒！',
  '太厉害了！',
  '好极了！',
  '我听到啦！',
  '真聪明！',
  '做得好！',
  '继续加油！',
  '棒棒哒！',
];

// Encouragement messages for soft failure
export const encourageMessages = [
  '我听到一点点啦，再大声一点试试～',
  '你可以随便叫一叫～',
  '再试一次，你可以的！',
  '大声说出来～',
  '我想听你说话～',
];

// Get random message
export function getRandomPraise(): string {
  return praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
}

export function getRandomEncouragement(): string {
  return encourageMessages[Math.floor(Math.random() * encourageMessages.length)];
}

// Initialize speech synthesis voices
export function initializeSpeechSynthesis(): void {
  if ('speechSynthesis' in window) {
    // Trigger voice loading
    window.speechSynthesis.getVoices();
  }
}

// Speech synthesis for Chinese
export function speakText(text: string, onEnd?: () => void): Promise<void> {
  return new Promise((resolve, reject) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8; // Slower for children
      utterance.pitch = 1.2; // Slightly higher pitch
      utterance.volume = 1.0;
      
      // Set up completion handlers
      utterance.onend = () => {
        if (onEnd) {
          onEnd();
        }
        resolve();
      };
      
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        if (onEnd) {
          onEnd();
        }
        resolve(); // Resolve anyway to continue playback
      };
      
      // Find Chinese voice if available
      const voices = window.speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice => 
        voice.lang.includes('zh') || voice.lang.includes('cmn')
      );
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }
      
      // Handle the case where voices aren't loaded yet
      if (voices.length === 0) {
        // Wait for voices to be loaded
        const voicesChangedHandler = () => {
          const updatedVoices = window.speechSynthesis.getVoices();
          const updatedChineseVoice = updatedVoices.find(voice => 
            voice.lang.includes('zh') || voice.lang.includes('cmn')
          );
          if (updatedChineseVoice) {
            utterance.voice = updatedChineseVoice;
          }
          window.speechSynthesis.speak(utterance);
          window.speechSynthesis.onvoiceschanged = null; // Remove handler after use
        };
        
        window.speechSynthesis.onvoiceschanged = voicesChangedHandler;
      } else {
        window.speechSynthesis.speak(utterance);
      }
    } else {
      // If speech synthesis not available, resolve after a delay
      setTimeout(() => {
        if (onEnd) {
          onEnd();
        }
        resolve();
      }, 1000);
    }
  });
}

// Play success sound effect using Web Audio API
export function playSuccessSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a cheerful success sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    
    // Play ascending notes
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = audioContext.currentTime;
    
    notes.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, now + i * 0.1);
    });
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  } catch (error) {
    console.log('Audio playback not available');
  }
}

// Play click sound
export function playClickSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.log('Audio playback not available');
  }
}
