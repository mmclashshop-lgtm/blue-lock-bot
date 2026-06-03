const mongoose = require('mongoose');

const clanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  guildId: { type: String, required: true },
  leaderId: { type: String, required: true },
  viceLeaders: [{ type: String }],
  members: [{ type: String }],
  description: { type: String, default: '' },
  logo: { type: String, default: null },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  warWins: { type: Number, default: 0 },
  warLosses: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  baseUpgrades: {
    training_facility: { type: Number, default: 0 },
    treasury: { type: Number, default: 0 },
    barracks: { type: Number, default: 0 },
    scouting: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

clanSchema.virtual('memberCount').get(function () {
  return this.members.length;
});

clanSchema.virtual('winRate').get(function () {
  const total = this.wins + this.losses;
  if (total === 0) return 0;
  return Math.round((this.wins / total) * 100);
});

module.exports = mongoose.model('Clan', clanSchema);
