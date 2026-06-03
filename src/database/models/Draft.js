const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  draftId: { type: String, required: true, unique: true },
  guildId: { type: String, required: true },
  channelId: { type: String, default: null },
  hostId: { type: String, required: true },
  playerCount: { type: Number, default: 8 },
  status: { type: String, enum: ['registering', 'picking', 'playing', 'completed'], default: 'registering' },
  players: [{
    userId: String,
    name: String
  }],
  teams: {
    teamA: [{ userId: String, name: String }],
    teamB: [{ userId: String, name: String }],
    teamAPicks: [{ name: String, stat: String, bonus: Number }],
    teamBPicks: [{ name: String, stat: String, bonus: Number }]
  },
  availableChars: [{ name: String, stat: String, bonus: Number }],
  picks: [{
    userId: String,
    userName: String,
    character: { name: String, stat: String, bonus: Number },
    team: String,
    pickNumber: Number
  }],
  currentPick: { type: Number, default: 0 },
  turnOrder: [{
    userId: String,
    team: String
  }],
  results: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
});

draftSchema.index({ guildId: 1, status: 1 });

module.exports = mongoose.model('Draft', draftSchema);
