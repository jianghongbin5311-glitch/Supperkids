import { motion, AnimatePresence } from 'framer-motion';
import { getRandomEncouragement } from '@/utils/audio';

interface EncouragementToastProps {
  show: boolean;
  attempts: number;
}

export function EncouragementToast({ show, attempts }: EncouragementToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 max-w-sm mx-4"
        >
          <div className="bg-card rounded-2xl shadow-card p-4 md:p-5 text-center border-2 border-warning/30">
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="text-4xl inline-block mb-2"
            >
              💪
            </motion.span>
            <p className="text-lg font-medium text-foreground">
              {getRandomEncouragement()}
            </p>
            {attempts >= 2 && (
              <p className="text-sm text-muted-foreground mt-2">
                再试一次就好啦！
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
