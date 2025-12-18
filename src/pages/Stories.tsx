import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, BookOpen, Star, Mic } from 'lucide-react';
import { speakText, playClickSound } from '@/utils/audio';
import { useVoiceDetection } from '@/hooks/useVoiceDetection';

interface Story {
  id: number;
  title: string;
  content: string[];
  moral: string;
  difficulty: 'easy' | 'medium' | 'hard';
  image?: string;
}

const stories: Story[] = [
  {
    id: 1,
    title: '小兔子找朋友',
    content: [
      '从前，有一只小兔子叫小白。',
      '小白很想找个朋友一起玩。',
      '他遇到了小松鼠，问："你愿意和我做朋友吗？"',
      '小松鼠说："当然愿意！我们一起去森林里玩吧！"',
      '小白和小松鼠成了最好的朋友。',
      '他们每天一起在森林里奔跑、跳跃，非常开心。'
    ],
    moral: '友谊需要主动去寻找，勇敢地表达自己的想法。',
    difficulty: 'easy',
    image: '🐰🐿️'
  },
  {
    id: 2,
    title: '勇敢的小鸟',
    content: [
      '有一只小鸟，它害怕飞行。',
      '看着其他鸟儿在天空中自由飞翔，它很羡慕。',
      '妈妈鼓励它说："孩子，勇敢一点，你可以的！"',
      '小鸟深吸一口气，跳出了鸟巢。',
      '它发现飞行其实并不可怕，反而很快乐！',
      '从此，它成为了最勇敢的飞行者。'
    ],
    moral: '勇敢面对恐惧，你会发现自己的潜力。',
    difficulty: 'medium',
    image: '🐦✨'
  },
  {
    id: 3,
    title: '分享的快乐',
    content: [
      '小熊有一个大大的蜂蜜罐。',
      '小猴子看到了，很想尝一尝。',
      '小熊犹豫了一下，但还是分享了蜂蜜。',
      '小猴子非常开心，把最好的香蕉送给了小熊。',
      '他们发现分享让快乐加倍了。',
      '从那以后，他们经常分享各自的好东西。'
    ],
    moral: '分享不仅让别人快乐，也会让自己收获更多。',
    difficulty: 'easy',
    image: '🐻🐵🍯'
  }
];

export default function Stories() {
  const navigate = useNavigate();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Use refs to track playback state in async functions
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const playbackAbortRef = useRef(false);
  
  // Sync refs with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const handleStorySelect = (story: Story) => {
    playClickSound();
    setSelectedStory(story);
    setCurrentParagraph(0);
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handlePlayStory = async () => {
    if (!selectedStory) return;
    
    playClickSound();
    
    // If already playing, just resume
    if (isPlaying && isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      return;
    }
    
    // Start from beginning or current paragraph
    const startParagraph = isPlaying ? currentParagraph : 0;
    setIsPlaying(true);
    setIsPaused(false);
    isPlayingRef.current = true;
    isPausedRef.current = false;
    playbackAbortRef.current = false;
    
    if (startParagraph === 0) {
      setCurrentParagraph(0);
    }
    
    // Play all paragraphs sequentially
    for (let i = startParagraph; i < selectedStory.content.length; i++) {
      // Check if playback was stopped or paused
      if (playbackAbortRef.current || !isPlayingRef.current) {
        break;
      }
      
      // Wait if paused
      while (isPausedRef.current && isPlayingRef.current && !playbackAbortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (playbackAbortRef.current || !isPlayingRef.current) {
        break;
      }
      
      setCurrentParagraph(i);
      
      // Wait for current paragraph to finish speaking before continuing
      await speakText(selectedStory.content[i]);
      
      // Check again after speaking (user might have stopped during speech)
      if (playbackAbortRef.current || !isPlayingRef.current) {
        break;
      }
      
      // Wait a bit between paragraphs (unless stopped or it's the last paragraph)
      if (i < selectedStory.content.length - 1 && !playbackAbortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // If we completed all paragraphs, read the moral
    if (!playbackAbortRef.current && isPlayingRef.current && currentParagraph === selectedStory.content.length - 1) {
      await speakText(`这个故事告诉我们：${selectedStory.moral}`);
    }
    
    // Only set playing to false if we completed or were stopped
    if (!playbackAbortRef.current) {
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  const handlePauseResume = () => {
    playClickSound();
    if (isPlaying) {
      setIsPaused(!isPaused);
      isPausedRef.current = !isPaused;
    }
  };

  const handleStop = () => {
    playClickSound();
    playbackAbortRef.current = true;
    setIsPlaying(false);
    setIsPaused(false);
    isPlayingRef.current = false;
    isPausedRef.current = false;
    setCurrentParagraph(0);
  };

  const handleBack = () => {
    if (selectedStory) {
      setSelectedStory(null);
      setCurrentParagraph(0);
      setIsPlaying(false);
      setIsPaused(false);
    } else {
      navigate('/');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'hard': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-sunny flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-4">
        <motion.button
          onClick={handleBack}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-card shadow-soft"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </motion.button>
        <h1 className="text-xl font-display text-foreground">
          {selectedStory ? selectedStory.title : '讲故事'}
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-8">
        {!selectedStory ? (
          // Story selection screen
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-display text-foreground mb-2">
                选择一个故事
              </h2>
              <p className="text-muted-foreground">
                点击故事开始听讲
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((story, index) => (
                <motion.button
                  key={story.id}
                  onClick={() => handleStorySelect(story)}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card rounded-2xl shadow-card p-5 text-left"
                >
                  {/* Story preview image */}
                  {story.image && (
                    <div className="flex items-center justify-center mb-3 min-h-[60px]">
                      <div className="text-5xl leading-none" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>
                        {Array.from(story.image).filter(char => char.trim() !== '').map((emoji, i) => (
                          <motion.span
                            key={i}
                            className="inline-block mx-1"
                            animate={{
                              y: [0, -8, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: "easeInOut"
                            }}
                            style={{ display: 'inline-block' }}
                          >
                            {emoji}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-2">
                      {story.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(story.difficulty)}`}>
                      {getDifficultyLabel(story.difficulty)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {story.content[0]}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {story.content.length} 段落
                    </span>
                    <Star className="w-4 h-4 text-warning" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          // Story reading screen
          <div className="max-w-2xl mx-auto">
            {/* Story progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  第 {currentParagraph + 1} / {selectedStory.content.length} 段
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedStory.difficulty)}`}>
                  {getDifficultyLabel(selectedStory.difficulty)}
                </span>
              </div>
              <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentParagraph + 1) / selectedStory.content.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Story image */}
            {selectedStory.image && (
              <motion.div
                key={`image-${currentParagraph}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: 1,
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex items-center justify-center mb-6 min-h-[120px]"
              >
                <div className="text-8xl md:text-9xl leading-none" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>
                  {Array.from(selectedStory.image).filter(char => char.trim() !== '').map((emoji, i) => (
                    <motion.span
                      key={i}
                      className="inline-block mx-2"
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                      style={{ display: 'inline-block' }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Story content */}
            <motion.div
              key={currentParagraph}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl shadow-card p-6 mb-6 cursor-pointer hover:bg-card/80 transition-colors"
              onClick={() => {
                playClickSound();
                speakText(selectedStory.content[currentParagraph]);
              }}
            >
              <p className="text-lg leading-relaxed text-foreground">
                {selectedStory.content[currentParagraph]}
              </p>
            </motion.div>

            {/* Moral (shown at the end) */}
            {currentParagraph === selectedStory.content.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6 cursor-pointer hover:bg-primary/15 transition-colors"
                onClick={() => {
                  playClickSound();
                  speakText(`这个故事告诉我们：${selectedStory.moral}`);
                }}
              >
                <h4 className="font-semibold text-primary mb-2">故事寓意</h4>
                <p className="text-foreground">{selectedStory.moral}</p>
              </motion.div>
            )}

            {/* Control buttons */}
            <div className="flex items-center justify-center gap-4">
              {!isPlaying ? (
                <motion.button
                  onClick={handlePlayStory}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {currentParagraph === 0 ? '开始讲故事' : '继续讲故事'}
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={handlePauseResume}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-warning text-warning-foreground rounded-full font-semibold"
                  >
                    {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5" />}
                    {isPaused ? '继续' : '暂停'}
                  </motion.button>
                  <motion.button
                    onClick={handleStop}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-full font-semibold"
                  >
                    停止
                  </motion.button>
                </>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <motion.button
                onClick={() => {
                  const newIndex = Math.max(0, currentParagraph - 1);
                  setCurrentParagraph(newIndex);
                  playClickSound();
                  speakText(selectedStory.content[newIndex]);
                }}
                disabled={currentParagraph === 0}
                whileHover={{ scale: currentParagraph > 0 ? 1.05 : 1 }}
                whileTap={{ scale: currentParagraph > 0 ? 0.95 : 1 }}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  currentParagraph > 0 
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                上一段
              </motion.button>
              <motion.button
                onClick={() => {
                  const newIndex = Math.min(selectedStory.content.length - 1, currentParagraph + 1);
                  setCurrentParagraph(newIndex);
                  playClickSound();
                  speakText(selectedStory.content[newIndex]);
                }}
                disabled={currentParagraph === selectedStory.content.length - 1}
                whileHover={{ scale: currentParagraph < selectedStory.content.length - 1 ? 1.05 : 1 }}
                whileTap={{ scale: currentParagraph < selectedStory.content.length - 1 ? 0.95 : 1 }}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  currentParagraph < selectedStory.content.length - 1 
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                下一段
              </motion.button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
