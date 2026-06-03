const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },

  // Basic Info
  name: { type: String, required: true },
  position: { type: String, required: true },
  playStyle: { type: String, required: true },
  character: { type: String, required: true },

  // Progression
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNext: { type: Number, default: 100 },
  rank: { type: String, default: 'Bronze' },
  totalXP: { type: Number, default: 0 },

  // Stats
  stats: {
    shooting: { type: Number, default: 50 },
    dribbling: { type: Number, default: 50 },
    passing: { type: Number, default: 50 },
    vision: { type: Number, default: 50 },
    speed: { type: Number, default: 50 },
    defense: { type: Number, default: 50 },
    stamina: { type: Number, default: 50 },
    finishing: { type: Number, default: 50 },
    control: { type: Number, default: 50 },
    reaction: { type: Number, default: 50 },
    ego: { type: Number, default: 50 }
  },

  // Economy
  coins: { type: Number, default: 500 },
  gems: { type: Number, default: 0 },
  totalCoinsEarned: { type: Number, default: 0 },

  // Match History
  matchesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  goalsScored: { type: Number, default: 0 },
  goalsConceded: { type: Number, default: 0 },
  winStreak: { type: Number, default: 0 },
  bestWinStreak: { type: Number, default: 0 },
  cleanSheets: { type: Number, default: 0 },

  // Special Skills
  skills: [{
    name: String,
    key: String,
    level: { type: Number, default: 1 }
  }],

  // Potential System
  potential: {
    type: { type: String, enum: ['Common', 'Rare', 'Epic', 'Legendary'], default: 'Common' },
    multiplier: { type: Number, default: 1.0 },
    growth: { type: Number, default: 1 }
  },

  // Collection
  cards: [{
    cardId: { type: mongoose.Schema.Types.ObjectId },
    name: String,
    rarity: String,
    acquiredAt: { type: Date, default: Date.now }
  }],
  cardsCount: { type: Number, default: 0 },

  // Titles
  titles: [{ type: String }],
  activeTitle: { type: String, default: null },

  // Achievements
  achievements: [{
    id: String,
    unlockedAt: { type: Date, default: Date.now }
  }],

  // Story Mode
  storyProgress: {
    completedChapters: [String],
    currentChapter: { type: String, default: null },
    cleared: [{
      chapterId: String,
      completedAt: { type: Date, default: Date.now },
      score: String
    }]
  },

  // Missions
  dailyMissions: {
    date: String,
    missions: [{
      id: String,
      progress: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      claimed: { type: Boolean, default: false }
    }]
  },
  weeklyMissions: {
    week: String,
    missions: [{
      id: String,
      progress: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      claimed: { type: Boolean, default: false }
    }]
  },

  // Season Pass
  seasonPass: {
    level: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    premium: { type: Boolean, default: false },
    claimedLevels: [Number]
  },

  // Clan
  clanId: { type: String, default: null },
  clanRole: { type: String, enum: ['member', 'vice', 'leader'], default: 'member' },
  clanJoinDate: { type: Date, default: null },

  // Tournament
  tournamentWins: { type: Number, default: 0 },
  tournamentPlayed: { type: Number, default: 0 },

  // Training
  trainingSessionsToday: { type: Number, default: 0 },
  lastTrainingReset: { type: Date, default: null },
  totalTrainingSessions: { type: Number, default: 0 },

  // Daily Rewards
  lastDailyClaim: { type: Number, default: 0 },
  dailyStreak: { type: Number, default: 0 },

  // Cooldowns
  cooldowns: {
    dailyReset: { type: Date, default: null },
    weeklyReset: { type: Date, default: null }
  },

  // Matchmaking
  inMatch: { type: Boolean, default: false },
  inQueue: { type: Boolean, default: false },
  matchCooldown: { type: Date, default: null },

  // Boosters
  boosters: {
    training: { type: Number, default: null },
    training_multiplier: { type: Number, default: 1 },
    xp: { type: Number, default: null },
    xp_multiplier: { type: Number, default: 1 },
    coin: { type: Number, default: null },
    coin_multiplier: { type: Number, default: 1 }
  },

  // Draft stats
  draftWins: { type: Number, default: 0 },
  draftPlayed: { type: Number, default: 0 },

  // Gacha Collection
  gachaPlayers: [{
    cardId: { type: String, required: true },
    name: { type: String, required: true },
    rarity: { type: String, required: true },
    rating: { type: Number, required: true },
    position: { type: String, required: true },
    value: { type: Number, required: true },
    image: { type: String, default: null },
    acquiredAt: { type: Date, default: Date.now }
  }],
  gachaStats: {
    totalPacksOpened: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    bestRarity: { type: String, default: 'None' },
    uniquePlayers: { type: Number, default: 0 }
  },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

playerSchema.index({ userId: 1, guildId: 1 }, { unique: true });
playerSchema.index({ rank: 1 });
playerSchema.index({ wins: -1 });
playerSchema.index({ goalsScored: -1 });
playerSchema.index({ level: -1 });
playerSchema.index({ xp: -1 });

playerSchema.virtual('ovr').get(function () {
  return this.calculateOVR();
});

playerSchema.virtual('winRate').get(function () {
  if (this.matchesPlayed === 0) return 0;
  return Math.round((this.wins / this.matchesPlayed) * 100);
});

playerSchema.virtual('titleDisplay').get(function () {
  return this.activeTitle || this.rank;
});

playerSchema.methods.addXP = function (amount) {
  this.xp += amount;
  this.totalXP += amount;
  let leveled = false;
  while (this.xp >= this.xpToNext && this.level < 100) {
    this.xp -= this.xpToNext;
    this.level++;
    this.xpToNext = Math.floor(100 * Math.pow(1.5, this.level - 1));
    leveled = true;
    this.updateRank();
  }
  return leveled;
};

playerSchema.methods.updateRank = function () {
  const { ranks } = require('../../config/config');
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (this.totalXP >= ranks[i].minXP) {
      if (this.rank !== ranks[i].name) {
        this.rank = ranks[i].name;
        return true;
      }
      break;
    }
  }
  return false;
};

playerSchema.methods.getStatWithBonus = function (statName) {
  const charConfig = require('../../config/config').characters.find(c => c.key === this.character);
  let value = this.stats[statName] || 50;
  if (charConfig && charConfig.stat === statName) {
    value += charConfig.statBonus;
  }
  return Math.min(value, 99);
};

playerSchema.methods.calculateOVR = function () {
  const s = this.stats;
  let ovr = (s.shooting + s.dribbling + s.passing + s.vision +
    s.speed + s.defense + s.stamina + s.finishing +
    s.control + s.reaction + s.ego) / 11;
  const charConfig = require('../../config/config').characters.find(c => c.key === this.character);
  if (charConfig) {
    const bonusValue = this.stats[charConfig.stat] + charConfig.statBonus;
    ovr = (ovr * 11 - this.stats[charConfig.stat] + Math.min(bonusValue, 99)) / 11;
  }
  return Math.round(ovr);
};

playerSchema.set('toJSON', { virtuals: true });
playerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Player', playerSchema);
