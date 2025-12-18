import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Play, Star, Settings, BookOpen, Music } from 'lucide-react';
import { useAntiAddiction } from '@/hooks/useAntiAddiction';
import { LockScreen } from '@/components/LockScreen';
import { playClickSound, speakText } from '@/utils/audio';

export default function Home() {
  const navigate = useNavigate();
  const [showLock, setShowLock] = useState(false);
  const antiAddiction = useAntiAddiction();

  // Handle parent settings button click - open directly on click
  const handleSecretTap = () => {
    navigate('/parent');
  };

  // Play welcome audio on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      speakText('洋洋小朋友，我们一起来学习吧！加油。');
    }, 1000); // Delay 1 second after page loads
    
    return () => clearTimeout(timer);
  }, []);

  const handleStartTraining = async () => {
    playClickSound();
    
    if (!antiAddiction.canPlay) {
      setShowLock(true);
      return;
    }
    
    // Auto-request microphone permission when user clicks start (user interaction context)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request permission in user interaction context
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately stop the stream since we only need permission
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      // Permission denied or error - continue anyway, will request again in Training page
      console.log('Microphone permission request:', error);
    }
    
    navigate('/training');
  };

  const handleRewards = () => {
    playClickSound();
    navigate('/rewards');
  };

  const handleStories = () => {
    playClickSound();
    navigate('/stories');
  };

  const handleRhymes = () => {
    playClickSound();
    navigate('/rhymes');
  };

  return (
    <div className="min-h-screen bg-sunny flex flex-col relative overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/background.png")',
          opacity: 0.1
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header with parent settings button in corner */}
      <header className="p-4 flex justify-between items-center">
        {/* Parent settings button - top left corner */}
        <button
          onClick={handleSecretTap}
          className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center opacity-30 hover:opacity-50 transition-opacity fixed top-4 left-4 z-20"
          aria-label="设置"
        >
          <Settings className="w-8 h-8 text-foreground/50" />
        </button>
        
        {/* Logo area - centered */}
        <div className="flex-1 text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl md:text-3xl font-display text-foreground"
          >
            SpeakBuddy
          </motion.h1>
        </div>
        
        <div className="w-16" /> {/* Spacer for balance */}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Mascot / Hero */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="mb-6"
        >
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, -3, 3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-8xl md:text-9xl select-none"
          >
            🎤
          </motion.div>
        </motion.div>

        {/* Welcome text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-foreground mb-2">
            洋洋宝贝学说话
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            一起来学说话吧～
          </p>
        </motion.div>

        {/* Main buttons arranged in different shapes */}
        <div className="flex flex-col items-center gap-8 mb-8">
          {/* Top row - Start button (larger, rounded rectangle) */}
          <motion.button
            onClick={handleStartTraining}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ delay: 0.4 }}
            className="
              flex items-center justify-center gap-3
              w-48 h-16
              bg-primary text-primary-foreground
              rounded-2xl shadow-button
              font-display text-xl font-bold
              btn-bounce
            "
          >
            <Play className="w-8 h-8 fill-current" />
            开始练习
          </motion.button>

          {/* Second row - Stories and Rhymes (different shapes) */}
          <div className="flex items-center justify-center gap-8">
            {/* Stories - Diamond shape */}
            <motion.button
              onClick={handleStories}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.5 }}
              className="
                flex flex-col items-center justify-center gap-2
                w-28 h-28
                bg-secondary text-secondary-foreground
                transform rotate-45 shadow-soft
                font-semibold
                btn-bounce
              "
            >
              <div className="transform -rotate-45">
                <BookOpen className="w-6 h-6" />
                <span className="text-xs mt-1 block">讲故事</span>
              </div>
            </motion.button>

            {/* Rhymes - Circle shape */}
            <motion.button
              onClick={handleRhymes}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.6 }}
              className="
                flex flex-col items-center justify-center gap-2
                w-28 h-28
                bg-accent text-accent-foreground
                rounded-full shadow-soft
                font-semibold
                btn-bounce
              "
            >
              <Music className="w-6 h-6" />
              <span className="text-xs">学儿歌</span>
            </motion.button>
          </div>

          {/* Bottom row - Rewards (hexagon shape) */}
          <motion.button
            onClick={handleRewards}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ delay: 0.7 }}
            className="
              flex items-center justify-center gap-2
              w-40 h-14
              bg-warning text-warning-foreground
              shadow-soft
              font-semibold
              btn-bounce
              relative
            "
            style={{
              clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)'
            }}
          >
            <Star className="w-6 h-6 fill-current" />
            <span>我的奖励</span>
          </motion.button>
        </div>

        {/* Usage stats hint */}
        {antiAddiction.todayUsed > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            今天已练习 {Math.floor(antiAddiction.todayUsed / 60)} 分钟
          </motion.p>
        )}
      </main>

      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['⭐', '🌟', '✨', '🎈', '🌈'].map((emoji, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute text-3xl md:text-4xl"
            style={{
              left: `${10 + i * 20}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* Lock screen */}
      <LockScreen
        show={showLock}
        reason={antiAddiction.lockReason}
        cooldownRemaining={antiAddiction.cooldownRemaining}
        onClose={() => setShowLock(false)}
      />
    </div>
    </div>
  );
}
