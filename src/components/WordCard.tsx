import { motion } from 'framer-motion';
import { Word, categoryColors } from '@/data/words';
import { Volume2 } from 'lucide-react';

interface WordCardProps {
  word: Word;
  onPlayDemo: () => void;
  isPlaying?: boolean;
}

export function WordCard({ word, onPlayDemo, isPlaying = false }: WordCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card rounded-3xl shadow-card p-6 md:p-8 w-full max-w-md mx-auto"
    >
      {/* Category badge */}
      <div className="flex justify-center mb-4">
        <span className={`${categoryColors[word.category]} text-card px-4 py-1 rounded-full text-sm font-semibold`}>
          {word.category === 'animal' && '🐾 动物'}
          {word.category === 'food' && '🍎 食物'}
          {word.category === 'transport' && '🚗 交通'}
          {word.category === 'verb' && '✋ 动作'}
          {word.category === 'social' && '💬 社交'}
        </span>
      </div>

      {/* Big emoji display */}
      <motion.div
        className="text-center mb-6"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95, rotate: [0, -10, 10, 0] }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <motion.span
          animate={{ 
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-8xl md:text-9xl inline-block cursor-pointer select-none"
          onClick={onPlayDemo}
        >
          {word.emoji}
        </motion.span>
      </motion.div>

      {/* Word display */}
      <div className="text-center mb-4">
        <h2 className="text-4xl md:text-5xl font-display text-foreground mb-2">
          {word.word}
        </h2>
        <p className="text-lg text-muted-foreground">
          {word.pinyin}
        </p>
      </div>

      {/* Prompt text */}
      <div className="text-center mb-6">
        <p className="text-xl md:text-2xl text-foreground/80 font-medium">
          {word.prompt}
        </p>
      </div>

      {/* Play demo button */}
      <motion.button
        onClick={onPlayDemo}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          mx-auto flex items-center gap-2 px-6 py-3 rounded-2xl
          bg-secondary text-secondary-foreground font-semibold
          shadow-soft btn-bounce
          ${isPlaying ? 'animate-pulse' : ''}
        `}
      >
        <Volume2 className="w-6 h-6" />
        <span>听示范</span>
      </motion.button>
    </motion.div>
  );
}
