const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  hostId: { type: String, required: true },
  type: { type: String, enum: ['8', '16', '32', '64'], required: true },
  status: {
    type: String,
    enum: ['registering', 'in_progress', 'completed', 'cancelled'],
    default: 'registering'
  },
  players: [{
    userId: String,
    name: String,
    seed: Number
  }],
  bracket: [{
    round: Number,
    matchIndex: Number,
    player1: { userId: String, name: String, score: Number },
    player2: { userId: String, name: String, score: Number },
    winner: { type: String, default: null },
    played: { type: Boolean, default: false }
  }],
  winner: {
    userId: { type: String, default: null },
    name: { type: String, default: null }
  },
  prize: {
    coins: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
    title: { type: String, default: null }
  },
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tournament', tournamentSchema);
