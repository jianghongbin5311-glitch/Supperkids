// Word database for SpeakBuddy - 50 words organized by category
export interface Word {
  id: string;
  category: 'animal' | 'food' | 'transport' | 'verb' | 'social';
  word: string;
  pinyin: string;
  prompt: string;
  emoji: string;
}

export const words: Word[] = [
  // 动物拟声 (12)
  { id: 'w001', category: 'animal', word: '汪汪', pinyin: 'wāng wāng', prompt: '小狗怎么叫？', emoji: '🐕' },
  { id: 'w002', category: 'animal', word: '喵喵', pinyin: 'miāo miāo', prompt: '小猫怎么叫？', emoji: '🐱' },
  { id: 'w003', category: 'animal', word: '咩咩', pinyin: 'miē miē', prompt: '小羊怎么叫？', emoji: '🐑' },
  { id: 'w004', category: 'animal', word: '哞哞', pinyin: 'mōu mōu', prompt: '奶牛怎么叫？', emoji: '🐄' },
  { id: 'w005', category: 'animal', word: '嘎嘎', pinyin: 'gā gā', prompt: '鸭子怎么叫？', emoji: '🦆' },
  { id: 'w006', category: 'animal', word: '咕咕', pinyin: 'gū gū', prompt: '鸽子怎么叫？', emoji: '🐦' },
  { id: 'w007', category: 'animal', word: '叽叽', pinyin: 'jī jī', prompt: '小鸡怎么叫？', emoji: '🐥' },
  { id: 'w008', category: 'animal', word: '呱呱', pinyin: 'guā guā', prompt: '青蛙怎么叫？', emoji: '🐸' },
  { id: 'w009', category: 'animal', word: '嗡嗡', pinyin: 'wēng wēng', prompt: '蜜蜂怎么叫？', emoji: '🐝' },
  { id: 'w010', category: 'animal', word: '吱吱', pinyin: 'zhī zhī', prompt: '小老鼠怎么叫？', emoji: '🐭' },
  { id: 'w011', category: 'animal', word: '熊猫', pinyin: 'xióng māo', prompt: '这是什么动物？', emoji: '🐼' },
  { id: 'w012', category: 'animal', word: '兔子', pinyin: 'tù zi', prompt: '这是什么动物？', emoji: '🐰' },

  // 食物饮品 (12)
  { id: 'w013', category: 'food', word: '水', pinyin: 'shuǐ', prompt: '宝宝要喝什么？', emoji: '💧' },
  { id: 'w014', category: 'food', word: '奶', pinyin: 'nǎi', prompt: '宝宝爱喝什么？', emoji: '🍼' },
  { id: 'w015', category: 'food', word: '饭', pinyin: 'fàn', prompt: '宝宝吃什么？', emoji: '🍚' },
  { id: 'w016', category: 'food', word: '面', pinyin: 'miàn', prompt: '这是什么？', emoji: '🍜' },
  { id: 'w017', category: 'food', word: '苹果', pinyin: 'píng guǒ', prompt: '这是什么水果？', emoji: '🍎' },
  { id: 'w018', category: 'food', word: '香蕉', pinyin: 'xiāng jiāo', prompt: '这是什么水果？', emoji: '🍌' },
  { id: 'w019', category: 'food', word: '蛋糕', pinyin: 'dàn gāo', prompt: '这是什么好吃的？', emoji: '🎂' },
  { id: 'w020', category: 'food', word: '饼干', pinyin: 'bǐng gān', prompt: '这是什么好吃的？', emoji: '🍪' },
  { id: 'w021', category: 'food', word: '糖', pinyin: 'táng', prompt: '这是什么？', emoji: '🍬' },
  { id: 'w022', category: 'food', word: '西瓜', pinyin: 'xī guā', prompt: '这是什么水果？', emoji: '🍉' },
  { id: 'w023', category: 'food', word: '葡萄', pinyin: 'pú tao', prompt: '这是什么水果？', emoji: '🍇' },
  { id: 'w024', category: 'food', word: '鸡蛋', pinyin: 'jī dàn', prompt: '这是什么？', emoji: '🥚' },

  // 交通工具 (8)
  { id: 'w025', category: 'transport', word: '车', pinyin: 'chē', prompt: '这是什么？', emoji: '🚗' },
  { id: 'w026', category: 'transport', word: '飞机', pinyin: 'fēi jī', prompt: '天上飞的是什么？', emoji: '✈️' },
  { id: 'w027', category: 'transport', word: '火车', pinyin: 'huǒ chē', prompt: '这是什么？', emoji: '🚂' },
  { id: 'w028', category: 'transport', word: '船', pinyin: 'chuán', prompt: '水里开的是什么？', emoji: '⛵' },
  { id: 'w029', category: 'transport', word: '公交', pinyin: 'gōng jiāo', prompt: '这是什么车？', emoji: '🚌' },
  { id: 'w030', category: 'transport', word: '自行车', pinyin: 'zì xíng chē', prompt: '这是什么？', emoji: '🚲' },
  { id: 'w031', category: 'transport', word: '嘟嘟', pinyin: 'dū dū', prompt: '汽车怎么叫？', emoji: '🚗' },
  { id: 'w032', category: 'transport', word: '呜呜', pinyin: 'wū wū', prompt: '火车怎么叫？', emoji: '🚂' },

  // 常用动词 (10)
  { id: 'w033', category: 'verb', word: '要', pinyin: 'yào', prompt: '宝宝想要就说？', emoji: '👋' },
  { id: 'w034', category: 'verb', word: '不要', pinyin: 'bú yào', prompt: '不想要就说？', emoji: '🙅' },
  { id: 'w035', category: 'verb', word: '来', pinyin: 'lái', prompt: '叫人过来说？', emoji: '🏃' },
  { id: 'w036', category: 'verb', word: '走', pinyin: 'zǒu', prompt: '要走了说？', emoji: '🚶' },
  { id: 'w037', category: 'verb', word: '吃', pinyin: 'chī', prompt: '想吃东西说？', emoji: '😋' },
  { id: 'w038', category: 'verb', word: '喝', pinyin: 'hē', prompt: '想喝水说？', emoji: '🥤' },
  { id: 'w039', category: 'verb', word: '抱抱', pinyin: 'bào bào', prompt: '想要抱抱说？', emoji: '🤗' },
  { id: 'w040', category: 'verb', word: '睡觉', pinyin: 'shuì jiào', prompt: '困了要？', emoji: '😴' },
  { id: 'w041', category: 'verb', word: '玩', pinyin: 'wán', prompt: '想玩就说？', emoji: '🎮' },
  { id: 'w042', category: 'verb', word: '看', pinyin: 'kàn', prompt: '想看就说？', emoji: '👀' },

  // 社交礼貌与情绪 (8)
  { id: 'w043', category: 'social', word: '爸爸', pinyin: 'bà ba', prompt: '这是谁？', emoji: '👨' },
  { id: 'w044', category: 'social', word: '妈妈', pinyin: 'mā ma', prompt: '这是谁？', emoji: '👩' },
  { id: 'w045', category: 'social', word: '拜拜', pinyin: 'bài bài', prompt: '要走了说？', emoji: '👋' },
  { id: 'w046', category: 'social', word: '谢谢', pinyin: 'xiè xie', prompt: '收到礼物说？', emoji: '🙏' },
  { id: 'w047', category: 'social', word: '好', pinyin: 'hǎo', prompt: '同意就说？', emoji: '👍' },
  { id: 'w048', category: 'social', word: '哭', pinyin: 'kū', prompt: '伤心了会？', emoji: '😢' },
  { id: 'w049', category: 'social', word: '笑', pinyin: 'xiào', prompt: '开心了会？', emoji: '😊' },
  { id: 'w050', category: 'social', word: '疼', pinyin: 'téng', prompt: '不舒服就说？', emoji: '🤕' },
];

export const categoryLabels: Record<Word['category'], string> = {
  animal: '动物',
  food: '食物',
  transport: '交通',
  verb: '动作',
  social: '社交',
};

export const categoryColors: Record<Word['category'], string> = {
  animal: 'bg-success',
  food: 'bg-accent',
  transport: 'bg-secondary',
  verb: 'bg-primary',
  social: 'bg-warning',
};

// Shuffle words for training
export function shuffleWords(wordList: Word[]): Word[] {
  const shuffled = [...wordList];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
