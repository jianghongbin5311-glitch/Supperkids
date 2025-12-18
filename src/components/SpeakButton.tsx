import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface SpeakButtonProps {
  isRecording: boolean;
  isDetected: boolean;
  volume: number;
  onPressStart: () => void;
  onPressEnd: () => void;
  onToggle?: () => void; // New: for click-to-toggle mode
  disabled?: boolean;
  mode?: 'hold' | 'toggle'; // hold = press and hold, toggle = click to start/stop
}

export function SpeakButton({
  isRecording,
  isDetected,
  volume,
  onPressStart,
  onPressEnd,
  onToggle,
  disabled = false,
  mode = 'toggle', // Default to toggle mode now
}: SpeakButtonProps) {
  const pulseScale = 1 + volume * 0.5;

  const handleClick = () => {
    if (mode === 'toggle' && onToggle) {
      onToggle();
    }
  };

  const handleMouseDown = () => {
    if (mode === 'hold') {
      onPressStart();
    }
  };

  const handleMouseUp = () => {
    if (mode === 'hold') {
      onPressEnd();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (mode === 'hold') {
      onPressStart();
    } else if (mode === 'toggle' && onToggle) {
      onToggle();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (mode === 'hold') {
      onPressEnd();
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings when recording */}
      {isRecording && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-40 h-40 md:w-56 md:h-56 rounded-full bg-primary/30"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
            className="absolute w-40 h-40 md:w-56 md:h-56 rounded-full bg-primary/20"
          />
        </>
      )}

      {/* Volume visualizer */}
      {isRecording && (
        <motion.div
          animate={{ scale: pulseScale }}
          transition={{ duration: 0.1 }}
          className={`absolute w-36 h-36 md:w-48 md:h-48 rounded-full ${
            isDetected ? 'bg-success/40' : 'bg-primary/40'
          }`}
        />
      )}

      {/* Main button */}
      <motion.button
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
        animate={isRecording ? { scale: 1.1 } : { scale: 1 }}
        className={`
          relative z-10 w-32 h-32 md:w-44 md:h-44 rounded-full
          flex flex-col items-center justify-center gap-2
          font-display text-xl md:text-2xl
          shadow-button btn-bounce select-none
          transition-colors duration-200
          ${disabled 
            ? 'bg-muted text-muted-foreground cursor-not-allowed' 
            : isDetected
              ? 'bg-success text-success-foreground shadow-success'
              : isRecording
                ? 'bg-accent text-accent-foreground'
                : 'bg-primary text-primary-foreground hover:brightness-110'
          }
        `}
      >
        <motion.div
          animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          {isRecording ? (
            <MicOff className="w-10 h-10 md:w-14 md:h-14" />
          ) : (
            <Mic className="w-10 h-10 md:w-14 md:h-14" />
          )}
        </motion.div>
        <span className="text-base md:text-lg">
          {isRecording ? '说话中...' : '点击说话'}
        </span>
      </motion.button>

      {/* Detection indicator */}
      {isDetected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-10 h-10 bg-success rounded-full flex items-center justify-center text-2xl"
        >
          ✓
        </motion.div>
      )}

      {/* Auto-stop hint when recording */}
      {isRecording && !isDetected && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-10 text-sm text-muted-foreground whitespace-nowrap"
        >
          静音2秒后自动停止
        </motion.p>
      )}
    </div>
  );
}
