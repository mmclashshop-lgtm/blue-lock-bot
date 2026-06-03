const Tournament = require('../database/models/Tournament');
const Player = require('../database/models/Player');
const { shuffleArray } = require('../utils/helpers');

const ENTRY_FEES = { '8': 2000, '16': 5000, '32': 15000, '64': 50000 };
const PRIZE_POOLS = { '8': 10000, '16': 30000, '32': 100000, '64': 500000 };

class TournamentManager {
  async createTournament(guildId, channelId, hostId, type) {
    if (!['8', '16', '32', '64'].includes(type)) return { success: false, message: '⚠️ نوع غير صالح' };

    const active = await Tournament.findOne({ guildId, status: { $in: ['registering', 'in_progress'] } });
    if (active) return { success: false, message: '⚠️ يوجد بطولة نشطة بالفعل' };

    const host = await Player.findOne({ userId: hostId, guildId });
    if (!host) return { success: false, message: '⚠️ يجب إنشاء لاعب أولاً' };
    if (host.coins < ENTRY_FEES[type]) return { success: false, message: `⚠️ تحتاج ${ENTRY_FEES[type]} عملة لإنشاء البطولة` };

    host.coins -= ENTRY_FEES[type];

    const tournament = new Tournament({
      guildId, channelId, hostId, type,
      status: 'registering',
      prize: {
        coins: PRIZE_POOLS[type],
        gems: type === '64' ? 50 : type === '32' ? 25 : type === '16' ? 10 : 5,
        title: type === '64' ? '🏆 Tournament Champion' : null
      }
    });

    tournament.players.push({ userId: hostId, name: host.name, seed: 1 });
    await tournament.save();
    await host.save();

    return { success: true, tournament: tournament.toObject(), message: `✅ بطولة ${type} لاعب! انضم الآن 🏆` };
  }

  async joinTournament(tournamentId, userId, guildId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return { success: false, message: '⚠️ البطولة غير موجودة' };
    if (tournament.status !== 'registering') return { success: false, message: '⚠️ البطولة بدأت بالفعل' };

    const player = await Player.findOne({ userId, guildId });
    if (!player) return { success: false, message: '⚠️ يجب إنشاء لاعب أولاً' };
    if (tournament.players.find(p => p.userId === userId)) return { success: false, message: '⚠️ أنت مسجل بالفعل' };

    const maxPlayers = parseInt(tournament.type);
    if (tournament.players.length >= maxPlayers) return { success: false, message: '⚠️ البطولة ممتلئة' };

    if (player.coins < Math.floor(ENTRY_FEES[tournament.type] * 0.5)) {
      return { success: false, message: `⚠️ تحتاج ${Math.floor(ENTRY_FEES[tournament.type] * 0.5)} عملة` };
    }
    player.coins -= Math.floor(ENTRY_FEES[tournament.type] * 0.5);

    tournament.players.push({ userId, name: player.name, seed: tournament.players.length + 1 });
    await tournament.save();
    await player.save();

    if (tournament.players.length >= maxPlayers) {
      await this.startTournament(tournament._id.toString());
    }

    return { success: true, tournament: tournament.toObject(), message: `✅ انضم ${player.name}! (${tournament.players.length}/${maxPlayers})` };
  }

  async startTournament(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return { success: false, message: '⚠️ البطولة غير موجودة' };

    const shuffled = shuffleArray(tournament.players);
    shuffled.forEach((p, i) => { p.seed = i + 1; });

    const numPlayers = shuffled.length;
    const totalRounds = Math.ceil(Math.log2(numPlayers));
    const bracketSize = Math.pow(2, totalRounds);

    // Standard bracket: pair players (0v1, 2v3, ...), handle byes, skip null-vs-null
    const bracket = [];
    let roundStart = 0;
    let roundMatchCount = 0;

    for (let m = 0; m < bracketSize / 2; m++) {
      const idx1 = m * 2;
      const idx2 = m * 2 + 1;
      if (idx1 >= numPlayers && idx2 >= numPlayers) continue; // skip null-vs-null
      bracket.push({
        round: 0, matchIndex: roundMatchCount++,
        player1: idx1 < numPlayers ? { userId: shuffled[idx1].userId, name: shuffled[idx1].name, score: 0 } : null,
        player2: idx2 < numPlayers ? { userId: shuffled[idx2].userId, name: shuffled[idx2].name, score: 0 } : null,
        winner: null, played: false
      });
    }

    for (let round = 1; round < totalRounds; round++) {
      const prevCount = roundMatchCount;
      roundMatchCount = 0;
      for (let m = 0; m < Math.ceil(prevCount / 2); m++) {
        bracket.push({
          round, matchIndex: roundMatchCount++,
          player1: null, player2: null,
          winner: null, played: false
        });
      }
    }

    tournament.bracket = bracket;
    tournament.status = 'in_progress';
    tournament.startedAt = new Date();
    await tournament.save();

    return { success: true, tournament: tournament.toObject(), message: '✅ بدأت البطولة!' };
  }

  async simulateMatch(tournamentId, bracketIndex) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament || tournament.status !== 'in_progress') return { success: false, message: '⚠️ البطولة غير نشطة' };

    const match = tournament.bracket[bracketIndex];
    if (!match || match.played) return { success: false, message: '⚠️ المباراة غير متاحة' };

    // Auto-advance on byes
    if (!match.player1 || !match.player2) {
      const winner = match.player1 || match.player2;
      match.played = true;
      match.winner = winner.userId;
      this._advanceWinner(tournament, match, winner);
      if (this._isTournamentComplete(tournament)) {
        await this._finalizeTournament(tournament);
      }
      await tournament.save();
      return {
        success: true, match, tournament: tournament.toObject(),
        message: `🔄 **تأهل تلقائي:** ${winner.name} (خصم غير متاح)`
      };
    }

    const p1 = await Player.findOne({ userId: match.player1.userId, guildId: tournament.guildId });
    const p2 = await Player.findOne({ userId: match.player2.userId, guildId: tournament.guildId });
    if (!p1 || !p2) return { success: false, message: '⚠️ لاعب غير موجود' };

    const p1Rating = p1.calculateOVR();
    const p2Rating = p2.calculateOVR();
    const total = p1Rating + p2Rating;
    const p1Chance = p1Rating / total;

    const p1Score = Math.random() < p1Chance ? (Math.floor(Math.random() * 4) + 1) : Math.floor(Math.random() * 3);
    const p2Score = Math.random() < (1 - p1Chance) ? (Math.floor(Math.random() * 4) + 1) : Math.floor(Math.random() * 3);
    const actualP1Score = Math.round(p1Score * (p1.stats.finishing / 99 || 0.5));
    const actualP2Score = Math.round(p2Score * (p2.stats.finishing / 99 || 0.5));

    match.player1.score = actualP1Score;
    match.player2.score = actualP2Score;
    match.played = true;

    const winnerId = actualP1Score >= actualP2Score ? match.player1.userId : match.player2.userId;
    match.winner = winnerId;

    this._advanceWinner(tournament, match, { userId: winnerId, name: winnerId === match.player1.userId ? match.player1.name : match.player2.name });

    if (this._isTournamentComplete(tournament)) {
      await this._finalizeTournament(tournament, winnerId === match.player1.userId ? p1 : p2);
    }

    p1.addXP(10);
    p2.addXP(10);
    await p1.save();
    await p2.save();
    await tournament.save();

    const winnerName = winnerId === match.player1.userId ? match.player1.name : match.player2.name;
    return {
      success: true, match, tournament: tournament.toObject(),
      message: `⚔️ **${match.player1.name}** ${actualP1Score}-${actualP2Score} **${match.player2.name}**\n🏆 ${winnerName} يفوز!`
    };
  }

  _advanceWinner(tournament, match, winner) {
    const nextRound = match.round + 1;
    const nextMatchIdx = Math.floor(match.matchIndex / 2);
    const nextMatch = tournament.bracket.find(m => m.round === nextRound && m.matchIndex === nextMatchIdx);
    if (nextMatch) {
      const slot = match.matchIndex % 2;
      if (slot === 0) {
        nextMatch.player1 = { userId: winner.userId, name: winner.name, score: 0 };
      } else {
        nextMatch.player2 = { userId: winner.userId, name: winner.name, score: 0 };
      }
    }
  }

  _isTournamentComplete(tournament) {
    const finalRound = tournament.bracket.reduce((max, m) => Math.max(max, m.round), 0);
    return tournament.bracket.some(m => m.round === finalRound && m.played);
  }

  async _finalizeTournament(tournament, winnerPlayer) {
    tournament.status = 'completed';
    const finalMatch = tournament.bracket.find(m => m.round === tournament.bracket.reduce((max, m2) => Math.max(max, m2.round), 0) && m.played);
    tournament.winner = { userId: finalMatch.winner, name: finalMatch.player1?.userId === finalMatch.winner ? finalMatch.player1.name : finalMatch.player2?.name || '???' };
    tournament.endedAt = new Date();

    if (winnerPlayer) {
      winnerPlayer.coins += tournament.prize.coins;
      winnerPlayer.addXP(200);
      if (tournament.prize.gems) winnerPlayer.gems = (winnerPlayer.gems || 0) + tournament.prize.gems;
      if (tournament.prize.title) {
        if (!winnerPlayer.titles) winnerPlayer.titles = [];
        if (!winnerPlayer.titles.includes(tournament.prize.title)) winnerPlayer.titles.push(tournament.prize.title);
      }
      await winnerPlayer.save();
    }
  }

  async getStatus(tournamentId) {
    const t = await Tournament.findById(tournamentId).lean();
    if (!t) return null;
    return t;
  }

  async listActive(guildId) {
    return Tournament.find({ guildId, status: { $ne: 'completed' } }).lean();
  }

  async cleanupOld() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await Tournament.deleteMany({ createdAt: { $lt: cutoff }, status: 'completed' });
  }
}

module.exports = new TournamentManager();
module.exports.ENTRY_FEES = ENTRY_FEES;
