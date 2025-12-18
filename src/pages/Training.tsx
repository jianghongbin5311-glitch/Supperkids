import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Settings } from 'lucide-react';
import { words, shuffleWords, Word } from '@/data/words';
import { useVoiceDetection } from '@/hooks/useVoiceDetection';
import { useAntiAddiction } from '@/hooks/useAntiAddiction';
import { useStarRating } from '@/hooks/useStarRating';
import { speakText, playClickSound } from '@/utils/audio';
import { WordCard } from '@/components/WordCard';
import { SpeakButton } from '@/components/SpeakButton';
import { SuccessCelebration } from '@/components/SuccessCelebration';
import { EncouragementToast } from '@/components/EncouragementToast';
import { LockScreen } from '@/components/LockScreen';

type TrainingState = 'idle' | 'demoPlaying' | 'promptHold' | 'recording' | 'successFeedback' | 'nextCard';

const MAX_ATTEMPTS = 3;

export default function Training() {
  const navigate = useNavigate();
  const [trainingWords] = useState(() => shuffleWords(words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<TrainingState>('idle');
  const [attempts, setAttempts] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [earnedStars, setEarnedStars] = useState<1 | 2 | 3>(3);
  const [secretTapCount, setSecretTapCount] = useState(0);
  
  const stateRef = useRef(state);
  stateRef.current = state;
  
  const reminderTimerRef = useRef<NodeJS.Timeout | null>(null);
  const secretTapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const antiAddiction = useAntiAddiction();
  const starRating = useStarRating();
  const voiceDetection = useVoiceDetection({
    minDuration: 400,
    volumeThreshold: 0.05,
    maxDuration: 6000,
    silenceTimeout: 2000, // Auto-stop after 2 seconds of silence
  });

  const currentWord = trainingWords[currentIndex];

  // Handle secret tap for parent settings
  const handleSecretTap = () => {
    setSecretTapCount(prev => prev + 1);
    
    if (secretTapTimerRef.current) {
      clearTimeout(secretTapTimerRef.current);
    }
    
    secretTapTimerRef.current = setTimeout(() => {
      setSecretTapCount(0);
    }, 2000);
  };

  useEffect(() => {
    if (secretTapCount >= 5) {
      setSecretTapCount(0);
      antiAddiction.endSession();
      navigate('/parent');
    }
  }, [secretTapCount, navigate, antiAddiction]);

  // Start session on mount
  useEffect(() => {
    antiAddiction.startSession();
    return () => {
      antiAddiction.endSession();
      if (reminderTimerRef.current) {
        clearTimeout(reminderTimerRef.current);
      }
    };
  }, []);

  // Check for lock conditions
  useEffect(() => {
    if (!antiAddiction.canPlay && state !== 'successFeedback') {
      // Don't interrupt celebration
    }
  }, [antiAddiction.canPlay, state]);

  // Auto-play demo when card changes
  useEffect(() => {
    if (state === 'idle' && currentWord) {
      const timer = setTimeout(() => {
        playDemo();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, state, currentWord]);

  // 3-second reminder when in promptHold state (no mic button pressed) or recording with no sound
  useEffect(() => {
    if ((state === 'promptHold' || (state === 'recording' && !voiceDetection.isDetected)) && currentWord) {
      reminderTimerRef.current = setTimeout(() => {
        // Speak reminder
        speakText(`洋洋宝贝，请说 ${currentWord.word}`);
      }, antiAddiction.settings.reminderInterval * 1000);
      
      return () => {
        if (reminderTimerRef.current) {
          clearTimeout(reminderTimerRef.current);
        }
      };
    }
  }, [state, voiceDetection.isDetected, currentWord, antiAddiction.settings.reminderInterval]);

  // Handle auto-stop from voice detection (when silence timeout is reached)
  useEffect(() => {
    if (stateRef.current === 'recording' && !voiceDetection.isRecording) {
      // Recording stopped automatically due to silence
      handleRecordingComplete();
    }
  }, [voiceDetection.isRecording]);

  const playDemo = useCallback(() => {
    if (state !== 'idle' && state !== 'promptHold') return;
    
    setState('demoPlaying');
    setIsPlaying(true);
    
    speakText(currentWord.word, () => {
      setIsPlaying(false);
      if (stateRef.current === 'demoPlaying') {
        setState('promptHold');
      }
    });
  }, [currentWord, state]);

  const handleToggleRecording = useCallback(() => {
    if (!antiAddiction.canPlay) return;
    
    if (voiceDetection.isRecording) {
      // Stop recording
      voiceDetection.stopRecording();
      handleRecordingComplete();
    } else if (state === 'promptHold') {
      // Start recording
      playClickSound();
      setState('recording');
      setShowEncouragement(false);
      voiceDetection.startRecording();
    }
  }, [state, antiAddiction.canPlay, voiceDetection]);

  const handleRecordingComplete = useCallback(() => {
    if (stateRef.current !== 'recording') return;
    
    // Check if voice was detected
    if (voiceDetection.isDetected) {
      // Calculate star rating
      const rating = starRating.calculate(
        voiceDetection.averageVolume,
        voiceDetection.recordingDuration
      );
      
      setEarnedStars(rating.stars);
      setState('successFeedback');
      setShowCelebration(true);
      setAttempts(0);
    } else {
      // Not detected - encourage retry
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        // After max attempts, let them pass anyway (soft failure)
        setEarnedStars(3); // Still give full stars for effort
        setState('successFeedback');
        setShowCelebration(true);
        setAttempts(0);
      } else {
        setState('promptHold');
        setShowEncouragement(true);
        setTimeout(() => setShowEncouragement(false), 2500);
      }
    }
  }, [voiceDetection, starRating, attempts]);

  // Legacy handlers for hold mode (keeping for compatibility)
  const handlePressStart = useCallback(() => {
    if (state !== 'promptHold' || !antiAddiction.canPlay) return;
    
    playClickSound();
    setState('recording');
    setShowEncouragement(false);
    voiceDetection.startRecording();
  }, [state, antiAddiction.canPlay, voiceDetection]);

  const handlePressEnd = useCallback(() => {
    if (state !== 'recording') return;
    
    voiceDetection.stopRecording();
    handleRecordingComplete();
  }, [state, voiceDetection, handleRecordingComplete]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setCompletedCount(prev => prev + 1);
    
    // Move to next card
    if (currentIndex < trainingWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setState('idle');
    } else {
      // All cards completed
      navigate('/rewards', { state: { completed: completedCount + 1 } });
    }
  }, [currentIndex, trainingWords.length, completedCount, navigate]);

  const handleExit = useCallback(() => {
    antiAddiction.endSession();
    navigate('/');
  }, [antiAddiction, navigate]);

  // Handle swipe down to skip to next card
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (info.offset.y > 100 && info.velocity.y > 0) {
      // Swiped down - go to next card
      if (currentIndex < trainingWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setState('idle');
      }
    }
  }, [currentIndex, trainingWords.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show lock screen if needed
  if (antiAddiction.isLocked) {
    return (
      <LockScreen
        show={true}
        reason={antiAddiction.lockReason}
        cooldownRemaining={antiAddiction.cooldownRemaining}
        onClose={handleExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-sunny flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <motion.button
          onClick={handleExit}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-card shadow-soft"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </motion.button>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground/70">
            {currentIndex + 1} / {trainingWords.length}
          </span>
          <div className="w-24 h-2 bg-card rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / trainingWords.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer and Settings */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-card shadow-soft">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {formatTime(antiAddiction.remainingSessionTime)}
            </span>
          </div>
          
          {/* Hidden parent settings button */}
          <button
            onClick={handleSecretTap}
            className="p-2 rounded-full bg-transparent opacity-20 hover:opacity-40 transition-opacity"
            aria-label="设置"
          >
            <Settings className="w-4 h-4 text-foreground/50" />
          </button>
        </div>
      </header>

      {/* Main content - moved up */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-4 pb-8">
        {/* Word card with swipe gesture */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full max-w-md mb-6 cursor-grab active:cursor-grabbing"
          >
            <WordCard
              word={currentWord}
              onPlayDemo={playDemo}
              isPlaying={isPlaying}
            />
            
            {/* Swipe hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="text-center text-xs text-muted-foreground mt-2"
            >
              ↓ 下滑跳过
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Instruction text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg md:text-xl text-foreground/70 text-center mb-6 font-medium"
        >
          {state === 'demoPlaying' && '听一听...'}
          {state === 'promptHold' && '轮到你啦！点击说话 👇'}
          {state === 'recording' && '我在听...大声说！'}
        </motion.p>

        {/* Speak button */}
        <SpeakButton
          isRecording={state === 'recording'}
          isDetected={voiceDetection.isDetected}
          volume={voiceDetection.volume}
          onPressStart={handlePressStart}
          onPressEnd={handlePressEnd}
          onToggle={handleToggleRecording}
          disabled={state !== 'promptHold' && state !== 'recording'}
          mode="toggle"
        />
      </main>

      {/* Encouragement toast */}
      <EncouragementToast show={showEncouragement} attempts={attempts} />

      {/* Success celebration */}
      <SuccessCelebration
        show={showCelebration}
        word={currentWord.word}
        stars={earnedStars}
        onComplete={handleCelebrationComplete}
      />
    </div>
  );
}
