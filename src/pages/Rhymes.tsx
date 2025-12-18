import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Music, Volume2, Mic } from 'lucide-react';
import { speakText, playClickSound } from '@/utils/audio';
import { useVoiceDetection } from '@/hooks/useVoiceDetection';

interface Rhyme {
  id: number;
  title: string;
  lyrics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  hasActions: boolean;
  image?: string;
}

const rhymes: Rhyme[] = [
  {
    id: 1,
    title: '小星星',
    lyrics: [
      '一闪一闪亮晶晶',
      '满天都是小星星',
      '挂在天上放光明',
      '好像许多小眼睛',
      '一闪一闪亮晶晶',
      '满天都是小星星'
    ],
    difficulty: 'easy',
    hasActions: true,
    image: '⭐✨🌟'
  },
  {
    id: 2,
    title: '两只老虎',
    lyrics: [
      '两只老虎，两只老虎',
      '跑得快，跑得快',
      '一只没有眼睛',
      '一只没有尾巴',
      '真奇怪，真奇怪'
    ],
    difficulty: 'easy',
    hasActions: true,
    image: '🐯🐯'
  },
  {
    id: 3,
    title: '小兔子乖乖',
    lyrics: [
      '小兔子乖乖',
      '把门儿开开',
      '快点儿开开',
      '我要进来',
      '不开不开就不开',
      '妈妈没回来',
      '谁来也不开'
    ],
    difficulty: 'medium',
    hasActions: true,
    image: '🐰🏠'
  },
  {
    id: 4,
    title: '上学歌',
    lyrics: [
      '太阳当空照',
      '花儿对我笑',
      '小鸟说早早早',
      '你为什么背上小书包',
      '我去上学校',
      '天天不迟到',
      '爱学习爱劳动',
      '长大要为人民立功劳'
    ],
    difficulty: 'medium',
    hasActions: false,
    image: '🌞🌺🐦🎒'
  }
];

export default function Rhymes() {
  const navigate = useNavigate();
  const [selectedRhyme, setSelectedRhyme] = useState<Rhyme | null>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  
  // Use refs to track playback state in async functions
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const playbackAbortRef = useRef(false);
  
  const voiceDetection = useVoiceDetection({
    minDuration: 500,
    volumeThreshold: 0.05,
    maxDuration: 8000,
    silenceTimeout: 2000,
  });
  
  // Sync refs with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const handleRhymeSelect = (rhyme: Rhyme) => {
    playClickSound();
    setSelectedRhyme(rhyme);
    setCurrentLine(0);
    setIsPlaying(false);
    setIsPaused(false);
    setIsPracticeMode(false);
  };

  const handlePlayRhyme = async () => {
    if (!selectedRhyme) return;
    
    playClickSound();
    
    // If already playing, just resume
    if (isPlaying && isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      return;
    }
    
    // Start from beginning or current line
    const startLine = isPlaying ? currentLine : 0;
    setIsPlaying(true);
    setIsPaused(false);
    isPlayingRef.current = true;
    isPausedRef.current = false;
    playbackAbortRef.current = false;
    
    if (startLine === 0) {
      setCurrentLine(0);
    }
    
    // Play all lines sequentially
    for (let i = startLine; i < selectedRhyme.lyrics.length; i++) {
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
      
      setCurrentLine(i);
      
      // Wait for current line to finish speaking before continuing
      await speakText(selectedRhyme.lyrics[i]);
      
      // Check again after speaking (user might have stopped during speech)
      if (playbackAbortRef.current || !isPlayingRef.current) {
        break;
      }
      
      // Wait a bit between lines (unless stopped or it's the last line)
      if (i < selectedRhyme.lyrics.length - 1 && !playbackAbortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    // Only set playing to false if we completed or were stopped
    if (!playbackAbortRef.current) {
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  const handlePracticeMode = () => {
    playClickSound();
    setIsPracticeMode(!isPracticeMode);
    if (!isPracticeMode) {
      // Start practice mode - speak current line
      if (selectedRhyme) {
        speakText(`请跟着说：${selectedRhyme.lyrics[currentLine]}`);
      }
    }
  };

  const handleRecordPractice = async () => {
    if (!isPracticeMode) return;
    
    playClickSound();
    
    if (voiceDetection.isRecording) {
      voiceDetection.stopRecording();
      
      if (voiceDetection.isDetected) {
        // Good recording
        await speakText('很好！我们继续下一句。');
        if (currentLine < selectedRhyme!.lyrics.length - 1) {
          setCurrentLine(prev => prev + 1);
          setTimeout(() => {
            speakText(`请跟着说：${selectedRhyme!.lyrics[currentLine + 1]}`);
          }, 1000);
        } else {
          await speakText('太棒了！你已经学会了整首儿歌！');
          setIsPracticeMode(false);
        }
      } else {
        // No sound detected
        await speakText('没有听到声音，请再试一次。');
      }
    } else {
      voiceDetection.startRecording();
      await speakText('开始录音...');
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
    setCurrentLine(0);
    if (voiceDetection.isRecording) {
      voiceDetection.stopRecording();
    }
  };

  const handleBack = () => {
    if (selectedRhyme) {
      setSelectedRhyme(null);
      setCurrentLine(0);
      setIsPlaying(false);
      setIsPaused(false);
      setIsPracticeMode(false);
      if (voiceDetection.isRecording) {
        voiceDetection.stopRecording();
      }
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
          {selectedRhyme ? selectedRhyme.title : '学儿歌'}
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-8">
        {!selectedRhyme ? (
          // Rhyme selection screen
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <Music className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-display text-foreground mb-2">
                选择一首儿歌
              </h2>
              <p className="text-muted-foreground">
                点击儿歌开始学习和练习
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
              {rhymes.map((rhyme, index) => (
                <motion.button
                  key={rhyme.id}
                  onClick={() => handleRhymeSelect(rhyme)}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card rounded-2xl shadow-card p-5 text-left"
                >
                  {/* Rhyme preview image */}
                  {rhyme.image && (
                    <div className="flex items-center justify-center mb-3 min-h-[60px]">
                      <div className="text-5xl leading-none" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>
                        {Array.from(rhyme.image).filter(char => char.trim() !== '').map((emoji, i) => (
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
                    <h3 className="font-semibold text-lg text-foreground">
                      {rhyme.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(rhyme.difficulty)}`}>
                      {getDifficultyLabel(rhyme.difficulty)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {rhyme.lyrics[0]}...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {rhyme.lyrics.length} 句
                      </span>
                      {rhyme.hasActions && (
                        <span className="text-xs text-primary">
                          🎭 带动作
                        </span>
                      )}
                    </div>
                    <Music className="w-4 h-4 text-primary" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          // Rhyme learning screen
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  第 {currentLine + 1} / {selectedRhyme.lyrics.length} 句
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedRhyme.difficulty)}`}>
                  {getDifficultyLabel(selectedRhyme.difficulty)}
                </span>
              </div>
              <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentLine + 1) / selectedRhyme.lyrics.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Rhyme image */}
            {selectedRhyme.image && (
              <motion.div
                key={`image-${currentLine}`}
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
                  {Array.from(selectedRhyme.image).filter(char => char.trim() !== '').map((emoji, i) => (
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

            {/* Current line */}
            <motion.div
              key={currentLine}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl shadow-card p-6 mb-6 cursor-pointer hover:bg-card/80 transition-colors"
              onClick={() => {
                playClickSound();
                speakText(selectedRhyme.lyrics[currentLine]);
              }}
            >
              <p className="text-xl md:text-2xl leading-relaxed text-foreground text-center font-medium">
                {selectedRhyme.lyrics[currentLine]}
              </p>
            </motion.div>

            {/* Full lyrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-muted/30 rounded-2xl p-4 mb-6"
            >
              <h4 className="font-semibold text-foreground mb-3">完整歌词</h4>
              <div className="space-y-1">
                {selectedRhyme.lyrics.map((line, index) => (
                  <p 
                    key={index}
                    onClick={() => {
                      playClickSound();
                      speakText(line);
                      setCurrentLine(index);
                    }}
                    className={`text-sm cursor-pointer hover:opacity-80 transition-opacity ${
                      index === currentLine 
                        ? 'text-primary font-medium' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {index + 1}. {line}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Control buttons */}
            <div className="flex flex-col items-center gap-4">
              {/* Mode toggle */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => !isPracticeMode && handlePlayRhyme()}
                  disabled={isPracticeMode}
                  whileHover={{ scale: !isPracticeMode ? 1.05 : 1 }}
                  whileTap={{ scale: !isPracticeMode ? 0.95 : 1 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors ${
                    isPracticeMode 
                      ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                      : isPlaying
                      ? 'bg-warning text-warning-foreground hover:bg-warning/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Volume2 className="w-5 h-5 animate-pulse" />
                      {isPaused ? '已暂停' : '播放中...'}
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      听儿歌
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  onClick={handlePracticeMode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors ${
                    isPracticeMode 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  {isPracticeMode ? '练习中' : '开始练习'}
                </motion.button>
              </div>

              {/* Practice mode controls */}
              {isPracticeMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4"
                >
                  <motion.button
                    onClick={handleRecordPractice}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold ${
                      voiceDetection.isRecording
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-success text-success-foreground'
                    }`}
                  >
                    {voiceDetection.isRecording ? (
                      <>
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        停止录音
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        跟着说
                      </>
                    )}
                  </motion.button>
                  
                  {voiceDetection.isDetected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-success text-sm font-medium"
                    >
                      ✓ 检测到声音
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Playback controls */}
              {isPlaying && !isPracticeMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4"
                >
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
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between w-full mt-4">
                <motion.button
                  onClick={() => {
                    const newIndex = Math.max(0, currentLine - 1);
                    setCurrentLine(newIndex);
                    playClickSound();
                    speakText(selectedRhyme.lyrics[newIndex]);
                  }}
                  disabled={currentLine === 0}
                  whileHover={{ scale: currentLine > 0 ? 1.05 : 1 }}
                  whileTap={{ scale: currentLine > 0 ? 0.95 : 1 }}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    currentLine > 0 
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  上一句
                </motion.button>
                <motion.button
                  onClick={() => {
                    const newIndex = Math.min(selectedRhyme.lyrics.length - 1, currentLine + 1);
                    setCurrentLine(newIndex);
                    playClickSound();
                    speakText(selectedRhyme.lyrics[newIndex]);
                  }}
                  disabled={currentLine === selectedRhyme.lyrics.length - 1}
                  whileHover={{ scale: currentLine < selectedRhyme.lyrics.length - 1 ? 1.05 : 1 }}
                  whileTap={{ scale: currentLine < selectedRhyme.lyrics.length - 1 ? 0.95 : 1 }}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    currentLine < selectedRhyme.lyrics.length - 1 
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  下一句
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
