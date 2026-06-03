const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  seasonId: { type: String, required: true, unique: true },
  seasonNumber: { type: Number, required: true },
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  
  // Season Timing
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  active: { type: Boolean, default: true },

  // Season Pass
  seasonPass: {
    levels: { type: Number, default: 100 },
    freeRewards: [{
      level: Number,
      reward: String,
      amount: Number
    }],
    premiumRewards: [{
      level: Number,
      reward: String,
      amount: Number
    }]
  },

  // Events
  events: [{
    eventId: String,
    name: String,
    description: String,
    startDate: Date,
    endDate: Date,
    rewards: [{
      condition: String,
      reward: String,
      amount: Number
    }]
  }],

  // Rankings & Rewards
  rewards: {
    topPlayerReward: String,
    topClanReward: String,
    topPlayerAmount: Number,
    topClanAmount: Number
  },

  // Rankings at end of season
  finalRankings: [{
    userId: String,
    rank: Number,
    level: Number,
    wins: Number,
    reward: Number
  }],

  // Settings
  baseXpMultiplier: { type: Number, default: 1.0 },
  baseCoinMultiplier: { type: Number, default: 1.0 },
  baseLootMultiplier: { type: Number, default: 1.0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

seasonSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

seasonSchema.methods.getDaysRemaining = function() {
  const now = new Date();
  const diff = this.endDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

module.exports = mongoose.model('Season', seasonSchema);
