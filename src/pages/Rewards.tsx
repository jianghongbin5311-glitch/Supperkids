import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Trophy, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';

const REWARDS_KEY = 'speakbuddy_rewards';

interface RewardsData {
  totalStars: number;
  todayStars: number;
  lastDate: string;
  achievements: string[];
}

function getRewardsData(): RewardsData {
  const stored = localStorage.getItem(REWARDS_KEY);
  const today = new Date().toDateString();
  
  if (stored) {
    const data = JSON.parse(stored) as RewardsData;
    if (data.lastDate !== today) {
      return {
        ...data,
        todayStars: 0,
        lastDate: today,
      };
    }
    return data;
  }
  
  return {
    totalStars: 0,
    todayStars: 0,
    lastDate: today,
    achievements: [],
  };
}

function saveRewardsData(data: RewardsData) {
  localStorage.setItem(REWARDS_KEY, JSON.stringify(data));
}

export default function Rewards() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rewards, setRewards] = useState<RewardsData>(getRewardsData);
  const [showNewStars, setShowNewStars] = useState(false);
  const [newStarsCount, setNewStarsCount] = useState(0);

  // Handle new completions from training
  useEffect(() => {
    const state = location.state as { completed?: number } | null;
    if (state?.completed) {
      const currentData = getRewardsData();
      const newData = {
        ...currentData,
        totalStars: currentData.totalStars + state.completed,
        todayStars: currentData.todayStars + state.completed,
      };
      setRewards(newData);
      saveRewardsData(newData);
      setNewStarsCount(state.completed);
      setShowNewStars(true);
      
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const achievements = [
    { id: 'first', name: '第一次开口', emoji: '🎤', stars: 1, unlocked: rewards.totalStars >= 1 },
    { id: 'five', name: '说了5个词', emoji: '⭐', stars: 5, unlocked: rewards.totalStars >= 5 },
    { id: 'ten', name: '说了10个词', emoji: '🌟', stars: 10, unlocked: rewards.totalStars >= 10 },
    { id: 'twenty', name: '小小演说家', emoji: '🎉', stars: 20, unlocked: rewards.totalStars >= 20 },
    { id: 'fifty', name: '语言小天才', emoji: '🏆', stars: 50, unlocked: rewards.totalStars >= 50 },
  ];

  return (
    <div className="min-h-screen bg-sunny">
      {/* Header */}
      <header className="p-4 flex items-center gap-4">
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-card shadow-soft"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </motion.button>
        <h1 className="text-xl font-display text-foreground">我的奖励</h1>
      </header>

      <main className="px-4 pb-8">
        {/* New stars celebration */}
        {showNewStars && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-r from-warning to-primary text-primary-foreground rounded-3xl p-6 mb-6 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="text-6xl mb-2"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-display mb-1">太棒了！</h2>
            <p className="text-lg">获得 {newStarsCount} 颗星星！</p>
          </motion.div>
        )}

        {/* Stars count */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-3xl shadow-card p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 bg-warning/20 rounded-2xl flex items-center justify-center"
              >
                <Star className="w-10 h-10 text-warning fill-warning" />
              </motion.div>
              <div>
                <p className="text-sm text-muted-foreground">我的星星</p>
                <p className="text-4xl font-display text-foreground">{rewards.totalStars}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">今日获得</p>
              <p className="text-2xl font-display text-primary">+{rewards.todayStars}</p>
            </div>
          </div>
        </motion.div>

        {/* Today's stickers */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl shadow-card p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">今日贴纸</h3>
          </div>
          
          {rewards.todayStars > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: Math.min(rewards.todayStars, 20) }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-3xl"
                >
                  {['⭐', '🌟', '✨', '💫'][i % 4]}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              今天还没有练习哦～
            </p>
          )}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl shadow-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-foreground">成就徽章</h3>
          </div>
          
          <div className="space-y-3">
            {achievements.map((achievement, i) => (
              <motion.div
                key={achievement.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-2xl transition-colors
                  ${achievement.unlocked ? 'bg-success/10' : 'bg-muted'}
                `}
              >
                <span className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                  {achievement.emoji}
                </span>
                <div className="flex-1">
                  <p className={`font-semibold ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {achievement.stars} 颗星星
                  </p>
                </div>
                {achievement.unlocked && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-success text-xl"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
