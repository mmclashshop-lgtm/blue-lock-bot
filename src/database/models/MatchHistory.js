const mongoose = require('mongoose');

const matchHistorySchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  
  // Teams
  team1: {
    playerId: String,
    playerName: String,
    playerLevel: Number,
    playerRank: String,
    character: String,
    stats: {
      shooting: Number,
      dribbling: Number,
      passing: Number,
      vision: Number,
      speed: Number,
      defense: Number,
      stamina: Number,
      finishing: Number,
      control: Number,
      reaction: Number,
      ovr: Number
    }
  },

  team2: {
    playerId: String,
    playerName: String,
    playerLevel: Number,
    playerRank: String,
    character: String,
    stats: {
      shooting: Number,
      dribbling: Number,
      passing: Number,
      vision: Number,
      speed: Number,
      defense: Number,
      stamina: Number,
      finishing: Number,
      control: Number,
      reaction: Number,
      ovr: Number
    }
  },

  // Match Details
  matchType: {
    type: String,
    enum: ['Ranked', 'Casual', 'Tournament', 'ClanWar', 'Draft'],
    default: 'Ranked'
  },

  // Score
  score: {
    team1: { type: Number, default: 0 },
    team2: { type: Number, default: 0 }
  },

  // Winner
  winner: { type: String, enum: ['team1', 'team2', 'draw'], required: true },
  winnerXP: Number,
  loserXP: Number,
  winnerCoins: Number,
  loserCoins: Number,

  // Match Events
  events: [{
    time: Number, // in seconds (0-90)
    type: String, // goal, save, tackle, dribble, pass, skill_used
    player: String,
    description: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // Highlights
  bestPlayer: String,
  bestPlayerStats: {
    goals: Number,
    assists: Number,
    tackles: Number,
    passes: Number,
    dribbles: Number,
    saves: Number
  },

  // Statistics
  team1Stats: {
    goals: Number,
    assists: Number,
    tackles: Number,
    passes: Number,
    dribbles: Number,
    saves: Number,
    possession: Number // percentage
  },

  team2Stats: {
    goals: Number,
    assists: Number,
    tackles: Number,
    passes: Number,
    dribbles: Number,
    saves: Number,
    possession: Number // percentage
  },

  // Rewards
  team1Rewards: {
    xp: Number,
    coins: Number,
    gems: Number
  },

  team2Rewards: {
    xp: Number,
    coins: Number,
    gems: Number
  },

  // Timestamps
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, required: true },
  duration: Number, // in seconds

  // Guild
  guildId: String,

  // Playback
  replay: {
    enabled: { type: Boolean, default: false },
    events: [] // serialized match events for replay
  }
});

// Calculate match duration
matchHistorySchema.pre('save', function(next) {
  if (this.startedAt && this.endedAt) {
    this.duration = (this.endedAt - this.startedAt) / 1000;
  }
  next();
});

// Methods
matchHistorySchema.methods.getHighlight = function() {
  // Get the most important event
  if (this.events.length === 0) return null;
  
  // Prioritize goals > assists > tackles > skills
  const goals = this.events.filter(e => e.type === 'goal');
  const assists = this.events.filter(e => e.type === 'assist');
  const skills = this.events.filter(e => e.type === 'skill_used');
  
  if (goals.length > 0) return goals[goals.length - 1];
  if (assists.length > 0) return assists[assists.length - 1];
  if (skills.length > 0) return skills[skills.length - 1];
  
  return this.events[0];
};

matchHistorySchema.methods.getMatchSummary = function() {
  return {
    winner: this.winner,
    score: this.score,
    duration: this.duration,
    type: this.matchType,
    team1: {
      name: this.team1.playerName,
      level: this.team1.playerLevel,
      character: this.team1.character
    },
    team2: {
      name: this.team2.playerName,
      level: this.team2.playerLevel,
      character: this.team2.character
    },
    highlight: this.getHighlight()
  };
};

module.exports = mongoose.model('MatchHistory', matchHistorySchema);
