const mongoose = require('mongoose');

const warHistorySchema = new mongoose.Schema({
  warId: { type: String, required: true, unique: true },
  guildId: { type: String, required: true },
  clanA: {
    id: String, name: String, points: Number, wins: Number
  },
  clanB: {
    id: String, name: String, points: Number, wins: Number
  },
  matches: [{
    matchIndex: Number, playerA: String, playerB: String,
    played: Boolean, result: String, scoreA: Number, scoreB: Number
  }],
  status: { type: String, default: 'completed' },
  mvp: { type: String, default: null },
  winner: { type: String, default: null },
  startedAt: Date,
  completedAt: { type: Date, default: Date.now },
  week: Number
});

warHistorySchema.index({ guildId: 1, completedAt: -1 });

module.exports = mongoose.model('WarHistory', warHistorySchema);
