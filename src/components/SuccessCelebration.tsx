import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getRandomPraise, speakText, playSuccessSound } from '@/utils/audio';

interface SuccessCelebrationProps {
  show: boolean;
  onComplete: () => void;
  word: string;
  stars?: 1 | 2 | 3; // Number of stars earned
}

const emojis = ['⭐', '🌟', '✨', '🎉', '🎊', '💫', '🌈', '❤️', '💖', '🎈'];

export function SuccessCelebration({ show, onComplete, word, stars = 3 }: SuccessCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; emoji: string; x: number; delay: number }>>([]);
  const [praise, setPraise] = useState('');

  useEffect(() => {
    if (show) {
      // Generate random particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * 100,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);

      // Get praise message
      const praiseText = getRandomPraise();
      setPraise(praiseText);

      // Play success sound
      playSuccessSound();

      // Speak praise after a short delay
      setTimeout(() => {
        speakText(praiseText, () => {
          // Complete after speech
          setTimeout(onComplete, 500);
        });
      }, 200);
    }
  }, [show, onComplete]);

  // Generate star display
  const renderStars = () => {
    const starElements = [];
    for (let i = 0; i < 3; i++) {
      const isEarned = i < stars;
      starElements.push(
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: isEarned ? 1 : 0.6, 
            rotate: 0,
            opacity: isEarned ? 1 : 0.3,
          }}
          transition={{ 
            delay: 0.2 + i * 0.15,
            type: 'spring',
            stiffness: 300,
          }}
          className={`text-5xl md:text-7xl ${isEarned ? '' : 'grayscale'}`}
        >
          ⭐
        </motion.span>
      );
    }
    return starElements;
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
        >
          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: `${particle.x}vw`,
                y: '100vh',
              }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                scale: [0, 1.5, 1.5, 0],
                y: [100, -100],
              }}
              transition={{ 
                duration: 2,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              className="absolute text-4xl md:text-6xl"
              style={{ left: `${particle.x}%` }}
            >
              {particle.emoji}
            </motion.div>
          ))}

          {/* Main celebration card */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="bg-card rounded-3xl p-8 md:p-12 shadow-card text-center mx-4"
          >
            {/* Stars display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center gap-2 mb-4"
            >
              {renderStars()}
            </motion.div>

            {/* Praise text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl md:text-5xl font-display text-primary mb-2"
            >
              {praise}
            </motion.h2>

            {/* Word learned */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xl md:text-2xl text-muted-foreground"
            >
              「{word}」
            </motion.p>

            {/* Star count feedback */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-4 text-lg text-warning font-semibold"
            >
              +{stars} ⭐
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
