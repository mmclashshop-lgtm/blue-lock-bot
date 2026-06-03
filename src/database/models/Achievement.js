const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  achievementId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  
  // Achievement Type
  category: {
    type: String,
    enum: ['Match', 'Training', 'Collection', 'Tournament', 'Team', 'Seasonal', 'Secret'],
    default: 'Match'
  },

  // Difficulty/Rarity
  rarity: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Secret'],
    default: 'Bronze'
  },

  // Progress
  progressType: {
    type: String,
    enum: ['Simple', 'Counter', 'Percentage'],
    default: 'Simple'
  },

  targetValue: { type: Number, default: 1 },
  
  // Condition
  condition: {
    type: String,
    description: 'How to unlock this achievement',
    required: true
  },

  // Rewards
  rewards: {
    coins: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    title: { type: String, default: null },
    item: { type: String, default: null }
  },

  // Display
  hidden: { type: Boolean, default: false },
  secretHint: { type: String, default: null },

  // Stats
  unlockedCount: { type: Number, default: 0 },
  unlockedPercentage: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

// Predefined achievements
const ACHIEVEMENTS = [
  // Match Achievements
  {
    achievementId: 'first_win',
    name: 'أول انتصار',
    description: 'فُز بأول مباراة لك',
    category: 'Match',
    rarity: 'Bronze',
    condition: 'wins >= 1',
    rewards: { coins: 100, xp: 50 }
  },
  {
    achievementId: 'ten_wins',
    name: 'العاشر',
    description: 'فز بـ 10 مباريات',
    category: 'Match',
    rarity: 'Silver',
    condition: 'wins >= 10',
    rewards: { coins: 500, xp: 200 }
  },
  {
    achievementId: 'fifty_wins',
    name: 'نصف مائة',
    description: 'فز بـ 50 مباراة',
    category: 'Match',
    rarity: 'Gold',
    condition: 'wins >= 50',
    rewards: { coins: 2000, xp: 1000, title: 'نصف مائة' }
  },
  {
    achievementId: 'hundred_wins',
    name: 'المائة السحرية',
    description: 'فز بـ 100 مباراة',
    category: 'Match',
    rarity: 'Platinum',
    condition: 'wins >= 100',
    rewards: { coins: 5000, gems: 50, xp: 2500, title: 'محارب محترف' }
  },
  {
    achievementId: 'perfect_win_streak',
    name: 'الحبل السحري',
    description: 'حقق 10 انتصارات متتالية',
    category: 'Match',
    rarity: 'Diamond',
    condition: 'bestWinStreak >= 10',
    rewards: { coins: 3000, gems: 25, xp: 1500 }
  },
  
  // Training Achievements
  {
    achievementId: 'first_training',
    name: 'بداية التدريب',
    description: 'أكمل جلسة تدريب واحدة',
    category: 'Training',
    rarity: 'Bronze',
    condition: 'totalTrainingSessions >= 1',
    rewards: { coins: 50, xp: 25 }
  },
  {
    achievementId: 'training_100',
    name: 'المدرب الشرس',
    description: 'أكمل 100 جلسة تدريب',
    category: 'Training',
    rarity: 'Gold',
    condition: 'totalTrainingSessions >= 100',
    rewards: { coins: 2000, gems: 20, xp: 1000 }
  },

  // Level Achievements
  {
    achievementId: 'level_10',
    name: 'الصاعد',
    description: 'وصل إلى المستوى 10',
    category: 'Match',
    rarity: 'Silver',
    condition: 'level >= 10',
    rewards: { coins: 500, xp: 200 }
  },
  {
    achievementId: 'level_50',
    name: 'نجم النجوم',
    description: 'وصل إلى المستوى 50',
    category: 'Match',
    rarity: 'Gold',
    condition: 'level >= 50',
    rewards: { coins: 3000, gems: 30, xp: 1500, title: 'نجم النجوم' }
  },
  {
    achievementId: 'level_100',
    name: 'الأسطورة',
    description: 'وصل إلى المستوى 100',
    category: 'Match',
    rarity: 'Diamond',
    condition: 'level >= 100',
    rewards: { coins: 10000, gems: 100, xp: 5000, title: 'الأسطورة' }
  },

  // Secret Achievements
  {
    achievementId: 'secret_no_loss',
    name: '🔐 لا هزيمة',
    description: 'سر...',
    category: 'Secret',
    rarity: 'Secret',
    hidden: true,
    secretHint: 'لا تخسر أي مباراة خلال يوم واحد',
    condition: 'losses = 0 in 24h',
    rewards: { gems: 50, xp: 1000 }
  },
  {
    achievementId: 'secret_perfect_game',
    name: '🔐 اللعبة المثالية',
    description: 'سر...',
    category: 'Secret',
    rarity: 'Secret',
    hidden: true,
    secretHint: 'احقق 10 أهداف في مباراة واحدة',
    condition: 'goalsInOneMatch >= 10',
    rewards: { gems: 100, xp: 2000, title: 'صانع الأهداف' }
  }
];

module.exports = mongoose.model('Achievement', achievementSchema);
module.exports.ACHIEVEMENTS = ACHIEVEMENTS;
