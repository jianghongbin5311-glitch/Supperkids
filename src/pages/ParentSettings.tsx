import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Timer, Trash2, Check, Lock, Star } from 'lucide-react';
import { useAntiAddiction } from '@/hooks/useAntiAddiction';
import { getRatingMode, setRatingMode, RatingMode } from '@/hooks/useStarRating';

export default function ParentSettings() {
  const navigate = useNavigate();
  const antiAddiction = useAntiAddiction();
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinError, setShowPinError] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [currentRatingMode, setCurrentRatingMode] = useState<RatingMode>('easy');

  // Load rating mode on mount
  useEffect(() => {
    setCurrentRatingMode(getRatingMode());
  }, []);

  // Simple PIN verification (default: 1234)
  const correctPin = '1234';

  const handlePinSubmit = () => {
    if (pin === correctPin) {
      setIsUnlocked(true);
      setShowPinError(false);
    } else {
      setShowPinError(true);
      setPin('');
    }
  };

  const handleSettingChange = (key: string, value: number) => {
    antiAddiction.updateSettings({ [key]: value });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
  };

  const handleRatingModeChange = (mode: RatingMode) => {
    setRatingMode(mode);
    setCurrentRatingMode(mode);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有本地数据吗？')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleParentUnlock = () => {
    antiAddiction.parentUnlock();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
  };

  // PIN entry screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-sunny flex flex-col">
        <header className="p-4">
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-card shadow-soft"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-3xl shadow-card p-8 w-full max-w-sm text-center"
          >
            <Lock className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-display text-foreground mb-2">
              家长验证
            </h2>
            <p className="text-muted-foreground mb-6">
              请输入PIN码（默认1234）
            </p>

            {/* PIN input */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold
                    ${pin.length > i ? 'border-primary bg-primary/10' : 'border-border bg-background'}
                  `}
                >
                  {pin.length > i ? '•' : ''}
                </div>
              ))}
            </div>

            {showPinError && (
              <p className="text-destructive text-sm mb-4">PIN码错误，请重试</p>
            )}

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((num, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (num === 'del') {
                      setPin(p => p.slice(0, -1));
                    } else if (num !== null && pin.length < 4) {
                      const newPin = pin + num;
                      setPin(newPin);
                      if (newPin.length === 4) {
                        setTimeout(() => {
                          if (newPin === correctPin) {
                            setIsUnlocked(true);
                          } else {
                            setShowPinError(true);
                            setPin('');
                          }
                        }, 200);
                      }
                    }
                  }}
                  className={`
                    h-14 rounded-xl font-semibold text-xl
                    ${num === null ? 'invisible' : 'bg-muted hover:bg-muted/80 text-foreground'}
                  `}
                  disabled={num === null}
                >
                  {num === 'del' ? '⌫' : num}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Settings screen
  return (
    <div className="min-h-screen bg-sunny">
      <header className="p-4 flex items-center gap-4">
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-card shadow-soft"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </motion.button>
        <h1 className="text-xl font-display text-foreground">家长设置</h1>
        
        {showSaved && (
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="ml-auto flex items-center gap-1 text-success text-sm"
          >
            <Check className="w-4 h-4" /> 已保存
          </motion.span>
        )}
      </header>

      <main className="px-4 pb-8 space-y-6">
        {/* Star Rating Mode */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-2xl shadow-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-xl">
              <Star className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">星星评分标准</h3>
              <p className="text-sm text-muted-foreground">根据发音表现给予星星奖励</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { mode: 'easy' as RatingMode, label: '宽松', desc: '任何声音都得3星' },
              { mode: 'standard' as RatingMode, label: '标准', desc: '根据音量和时长评分' },
              { mode: 'strict' as RatingMode, label: '严格', desc: '需要大声且持久发音' },
            ].map(({ mode, label, desc }) => (
              <button
                key={mode}
                onClick={() => handleRatingModeChange(mode)}
                className={`w-full p-3 rounded-xl text-left transition-colors flex items-center justify-between
                  ${currentRatingMode === mode 
                    ? 'bg-warning text-warning-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'}
                `}
              >
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm opacity-80">{desc}</p>
                </div>
                {currentRatingMode === mode && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Session limit */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">单次训练时长</h3>
              <p className="text-sm text-muted-foreground">每次训练的最长时间</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {[5, 8, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSettingChange('sessionLimit', mins)}
                className={`flex-1 py-2 rounded-xl font-semibold transition-colors
                  ${antiAddiction.settings.sessionLimit === mins 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'}
                `}
              >
                {mins}分钟
              </button>
            ))}
          </div>
        </motion.div>

        {/* Daily limit */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">每日训练上限</h3>
              <p className="text-sm text-muted-foreground">每天最多训练时间</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSettingChange('dailyLimit', mins)}
                className={`flex-1 py-2 rounded-xl font-semibold transition-colors
                  ${antiAddiction.settings.dailyLimit === mins 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'}
                `}
              >
                {mins}分钟
              </button>
            ))}
          </div>
        </motion.div>

        {/* Reminder Interval */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-2xl shadow-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-info/10 rounded-xl">
              <Timer className="w-6 h-6 text-info" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">提醒间隔</h3>
              <p className="text-sm text-muted-foreground">录音时无声提醒的时间间隔</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {[2, 3, 5, 8].map((seconds) => (
              <button
                key={seconds}
                onClick={() => handleSettingChange('reminderInterval', seconds)}
                className={`flex-1 py-2 rounded-xl font-semibold transition-colors
                  ${antiAddiction.settings.reminderInterval === seconds 
                    ? 'bg-info text-info-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'}
                `}
              >
                {seconds}秒
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cooldown time */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl shadow-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-xl">
              <Timer className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">冷却时间</h3>
              <p className="text-sm text-muted-foreground">单次训练后的休息时间</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {[10, 20, 30, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSettingChange('cooldownTime', mins)}
                className={`flex-1 py-2 rounded-xl font-semibold transition-colors
                  ${antiAddiction.settings.cooldownTime === mins 
                    ? 'bg-warning text-warning-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'}
                `}
              >
                {mins}分钟
              </button>
            ))}
          </div>
        </motion.div>

        {/* Parent unlock */}
        {antiAddiction.isLocked && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl shadow-card p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success/10 rounded-xl">
                <Lock className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">临时解锁</h3>
                <p className="text-sm text-muted-foreground">跳过当前冷却时间</p>
              </div>
            </div>
            <button
              onClick={handleParentUnlock}
              className="w-full py-3 rounded-xl bg-success text-success-foreground font-semibold"
            >
              立即解锁
            </button>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl shadow-card p-5"
        >
          <h3 className="font-semibold text-foreground mb-3">今日统计</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-display text-foreground">
                {Math.floor(antiAddiction.todayUsed / 60)}
              </p>
              <p className="text-sm text-muted-foreground">已用时(分钟)</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-display text-foreground">
                {Math.floor(antiAddiction.remainingDailyTime / 60)}
              </p>
              <p className="text-sm text-muted-foreground">剩余(分钟)</p>
            </div>
          </div>
        </motion.div>

        {/* Clear data */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={handleClearData}
          className="w-full py-4 rounded-2xl bg-destructive/10 text-destructive font-semibold flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          清除所有本地数据
        </motion.button>
      </main>
    </div>
  );
}
