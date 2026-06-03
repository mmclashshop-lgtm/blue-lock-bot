const Clan = require('../database/models/Clan');
const Player = require('../database/models/Player');
const WarHistory = require('../database/models/WarHistory');
const { shuffleArray, randomRange } = require('../utils/helpers');
const matchmaking = require('./matchmaking');
const errorLogger = require('./errorLogger');

const WAR_POINTS = {
  WIN: 100,
  LOSS: 25,
  DRAW: 50,
  MVP: 25,
  CLEAN_SHEET: 30
};

const MATCHES_PER_WAR = 5;

class ClubWarsSystem {
  constructor() {
    this.activeWars = new Map();
    this.weeklyPairings = new Map();
  }

  async generateWeeklyPairings(guildId) {
    const clans = await Clan.find({ guildId }).sort({ points: -1 }).lean();
    if (clans.length < 2) return [];

    const pairings = [];
    const shuffled = shuffleArray(clans);

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      if (shuffled[i + 1]) {
        pairings.push({
          clanA: shuffled[i],
          clanB: shuffled[i + 1],
          week: this._getWeekNumber()
        });
      }
    }

    this.weeklyPairings.set(guildId, pairings);
    // Auto-start wars for pairings
    for (const p of pairings) {
      await this.startWar(guildId, p.clanA._id.toString(), p.clanB._id.toString()).catch(e => console.error('Auto-start war error:', e));
    }
    return pairings;
  }

  async startWar(guildId, clanIdA, clanIdB) {
    const clanA = await Clan.findById(clanIdA);
    const clanB = await Clan.findById(clanIdB);
    if (!clanA || !clanB) return { success: false, message: '⚠️ كلان غير موجود' };

    if (clanA.members.length < 2 || clanB.members.length < 2) {
      return { success: false, message: '⚠️ يحتاج كل كلان لعضوين على الأقل' };
    }

    const warId = `war_${guildId}_${Date.now()}`;
    const war = {
      warId,
      guildId,
      clanA: { id: clanA._id.toString(), name: clanA.name, points: 0, wins: 0 },
      clanB: { id: clanB._id.toString(), name: clanB.name, points: 0, wins: 0 },
      matches: [],
      status: 'active', // active -> completed
      startedAt: Date.now(),
      mvp: null
    };

    // Schedule matches
    const clanAMembers = shuffleArray(clanA.members).slice(0, MATCHES_PER_WAR);
    const clanBMembers = shuffleArray(clanB.members).slice(0, MATCHES_PER_WAR);

    for (let i = 0; i < Math.max(clanAMembers.length, clanBMembers.length); i++) {
      if (i >= MATCHES_PER_WAR) break;
      war.matches.push({
        matchIndex: i,
        playerA: clanAMembers[i] || clanAMembers[clanAMembers.length - 1],
        playerB: clanBMembers[i] || clanBMembers[clanBMembers.length - 1],
        played: false,
        result: null,
        scoreA: 0,
        scoreB: 0
      });
    }

    this.activeWars.set(warId, war);
    return { success: true, warId, war, message: `⚔️ **Clan War!** ${clanA.name} vs ${clanB.name}` };
  }

  async playMatch(warId, matchIndex) {
    const war = this.activeWars.get(warId);
    if (!war) return { success: false, message: '⚠️ الحرب غير موجودة' };
    if (war.status !== 'active') return { success: false, message: '⚠️ الحرب انتهت' };

    const match = war.matches[matchIndex];
    if (!match) return { success: false, message: '⚠️ المباراة غير موجودة' };
    if (match.played) return { success: false, message: '⚠️ المباراة لعبت بالفعل' };

    // Get player data
    const playerA = await Player.findOne({ userId: match.playerA, guildId: war.guildId });
    const playerB = await Player.findOne({ userId: match.playerB, guildId: war.guildId });

    if (!playerA || !playerB) {
      return { success: false, message: '⚠️ أحد اللاعبين غير موجود' };
    }

    // Simulate match
    const result = await matchmaking.quickMatch(playerA, playerB);
    match.played = true;

    if (result.result === 'p1_win') {
      match.scoreA = result.score.p1;
      match.scoreB = result.score.p2;
      match.result = 'A';
      war.clanA.points += WAR_POINTS.WIN;
      war.clanA.wins++;
    } else if (result.result === 'p2_win') {
      match.scoreA = result.score.p1;
      match.scoreB = result.score.p2;
      match.result = 'B';
      war.clanB.points += WAR_POINTS.WIN;
      war.clanB.wins++;
    } else {
      match.scoreA = result.score.p1;
      match.scoreB = result.score.p2;
      match.result = 'draw';
      war.clanA.points += WAR_POINTS.DRAW;
      war.clanB.points += WAR_POINTS.DRAW;
    }

    await playerA.save();
    await playerB.save();

    // Check if all matches played
    const allPlayed = war.matches.every(m => m.played);
    if (allPlayed) {
      war.status = 'completed';
      await this._finalizeWar(war);
    }

    return {
      success: true,
      match,
      war,
      result,
      message: `⚔️ **Match ${matchIndex + 1} Complete!**\n${result.score.p1}-${result.score.p2}`
    };
  }

  async _finalizeWar(war) {
    const clanA = await Clan.findById(war.clanA.id);
    const clanB = await Clan.findById(war.clanB.id);
    if (!clanA || !clanB) return;

    // Award clan points
    const aPoints = war.clanA.points;
    const bPoints = war.clanB.points;

    clanA.points += aPoints;
    clanB.points += bPoints;

    clanA.xp += aPoints;
    clanB.xp += bPoints;

    let winner = null;
    if (aPoints > bPoints) {
      clanA.warWins = (clanA.warWins || 0) + 1;
      clanB.warLosses = (clanB.warLosses || 0) + 1;
      war.mvp = this._findMVP(war, 'A');
      winner = clanA.name;
    } else if (bPoints > aPoints) {
      clanB.warWins = (clanB.warWins || 0) + 1;
      clanA.warLosses = (clanA.warLosses || 0) + 1;
      war.mvp = this._findMVP(war, 'B');
      winner = clanB.name;
    }

    for (const clan of [clanA, clanB]) {
      const xpNeeded = clan.level * 500;
      while (clan.xp >= xpNeeded) {
        clan.xp -= xpNeeded;
        clan.level++;
      }
    }

    await clanA.save();
    await clanB.save();

    for (const match of war.matches) {
      const winnerId = match.result === 'A' ? match.playerA :
        match.result === 'B' ? match.playerB : null;
      if (winnerId) {
        const winner = await Player.findOne({ userId: winnerId, guildId: war.guildId });
        if (winner) {
          winner.addXP(50);
          winner.coins += 100;
          await winner.save();
        }
      }
    }

    if (war.mvp) {
      const mvpPlayer = await Player.findOne({ userId: war.mvp, guildId: war.guildId });
      if (mvpPlayer) {
        mvpPlayer.addXP(100);
        mvpPlayer.coins += 200;
        if (!mvpPlayer.titles) mvpPlayer.titles = [];
        if (!mvpPlayer.titles.includes('War MVP')) {
          mvpPlayer.titles.push('War MVP');
        }
        await mvpPlayer.save();
      }
    }

    // Save to history
    try {
      await new WarHistory({
        warId: war.warId, guildId: war.guildId,
        clanA: war.clanA, clanB: war.clanB,
        matches: war.matches, status: 'completed',
        mvp: war.mvp, winner,
        startedAt: new Date(war.startedAt), completedAt: new Date(),
        week: Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000)
      }).save();
    } catch (e) { /* duplicate warId */ }

    errorLogger.info('club_wars', `War ${war.warId} finalized: ${war.clanA.name} ${aPoints} - ${bPoints} ${war.clanB.name}`);
  }

  _findMVP(war, winningTeam) {
    const teamMatches = war.matches.filter(m =>
      (winningTeam === 'A' && m.result === 'A') ||
      (winningTeam === 'B' && m.result === 'B')
    );
    if (teamMatches.length === 0) return null;

    // Find player with biggest goal margin
    return teamMatches.reduce((best, m) => {
      const diff = winningTeam === 'A' ? m.scoreA - m.scoreB : m.scoreB - m.scoreA;
      if (!best || diff > best.diff) return { userId: winningTeam === 'A' ? m.playerA : m.playerB, diff };
      return best;
    }, null)?.userId || null;
  }

  getWarStatus(warId) {
    const war = this.activeWars.get(warId);
    if (!war) return null;

    const matchesPlayed = war.matches.filter(m => m.played).length;
    const totalMatches = war.matches.length;

    return {
      warId: war.warId,
      clanA: war.clanA,
      clanB: war.clanB,
      status: war.status,
      matchesPlayed,
      totalMatches,
      progress: `${matchesPlayed}/${totalMatches}`,
      matches: war.matches,
      mvp: war.mvp
    };
  }

  getActiveWars(guildId) {
    return Array.from(this.activeWars.values())
      .filter(w => w.guildId === guildId && w.status === 'active');
  }

  getWeeklyStandings(guildId) {
    const pairings = this.weeklyPairings.get(guildId) || [];
    return pairings;
  }

  _getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
  }
}

module.exports = new ClubWarsSystem();
