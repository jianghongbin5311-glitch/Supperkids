import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar } from 'lucide-react';

interface LockScreenProps {
  show: boolean;
  reason: 'session' | 'daily' | 'cooldown' | null;
  cooldownRemaining: number;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function LockScreen({ show, reason, cooldownRemaining, onClose }: LockScreenProps) {
  const getMessage = () => {
    switch (reason) {
      case 'session':
        return {
          title: '休息一下吧！',
          subtitle: '本次练习完成啦～',
          emoji: '😊',
          detail: '休息一会儿再来玩！',
        };
      case 'daily':
        return {
          title: '今天练习完成啦！',
          subtitle: '明天再来哦～',
          emoji: '🌙',
          detail: '晚安，好好睡觉！',
        };
      case 'cooldown':
        return {
          title: '休息中...',
          subtitle: `还要等 ${formatTime(cooldownRemaining)}`,
          emoji: '⏰',
          detail: '先去玩点别的吧！',
        };
      default:
        return {
          title: '休息一下',
          subtitle: '',
          emoji: '😴',
          detail: '',
        };
    }
  };

  const content = getMessage();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-sunny"
        >
          {/* Close button for parent */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center px-8"
          >
            {/* Big emoji */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-8xl md:text-9xl mb-6"
            >
              {content.emoji}
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">
              {content.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              {content.subtitle}
            </p>

            {/* Detail */}
            <p className="text-lg text-muted-foreground/70">
              {content.detail}
            </p>

            {/* Timer for cooldown */}
            {reason === 'cooldown' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex items-center justify-center gap-2 text-2xl text-secondary"
              >
                <Clock className="w-8 h-8" />
                <span className="font-display">{formatTime(cooldownRemaining)}</span>
              </motion.div>
            )}

            {/* Calendar icon for daily limit */}
            {reason === 'daily' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex items-center justify-center gap-2 text-xl text-primary"
              >
                <Calendar className="w-6 h-6" />
                <span>明天见！</span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
