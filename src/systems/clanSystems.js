const Clan = require('../database/models/Clan');
const Player = require('../database/models/Player');
const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

class ClanTournamentSystem {
  constructor() {
    this.activeTournaments = new Map();
  }

  async createTournament(guildId, hostClanId, entryFee = 1000, maxTeams = 8) {
    const host = await Clan.findById(hostClanId);
    if (!host) return { success: false, message: 'Clan not found' };
    if (host.balance < entryFee) return { success: false, message: 'Clan lacks funds' };

    const id = `ct_${Date.now()}`;
    this.activeTournaments.set(id, {
      id, guildId, hostClanId,
      name: `${host.name} Tournament`,
      entryFee, maxTeams,
      teams: [{ clanId: hostClanId, name: host.name, enteredAt: Date.now() }],
      bracket: null,
      status: 'registering',
      createdAt: Date.now(),
      prize: { coins: entryFee * maxTeams * 0.9 }
    });

    host.balance -= entryFee;
    await host.save();

    setTimeout(() => {
      const t = this.activeTournaments.get(id);
      if (t && t.status === 'registering') this.startTournament(id);
    }, 86400000);

    return { success: true, tournament: this.activeTournaments.get(id) };
  }

  async joinTournament(tournamentId, clanId) {
    const tournament = this.activeTournaments.get(tournamentId);
    if (!tournament) return { success: false, message: 'Tournament not found' };
    if (tournament.status !== 'registering') return { success: false, message: 'Registration closed' };
    if (tournament.teams.length >= tournament.maxTeams) return { success: false, message: 'Tournament full' };
    if (tournament.teams.find(t => t.clanId === clanId)) return { success: false, message: 'Already registered' };

    const clan = await Clan.findById(clanId);
    if (!clan) return { success: false, message: 'Clan not found' };
    if (clan.balance < tournament.entryFee) return { success: false, message: 'Insufficient balance' };

    clan.balance -= tournament.entryFee;
    await clan.save();

    tournament.teams.push({ clanId, name: clan.name, enteredAt: Date.now() });
    return { success: true, message: `Joined ${tournament.name}` };
  }

  async startTournament(tournamentId) {
    const tournament = this.activeTournaments.get(tournamentId);
    if (!tournament) return;
    if (tournament.teams.length < 4) {
      tournament.status = 'cancelled';
      return;
    }

    const shuffled = tournament.teams.sort(() => Math.random() - 0.5);
    tournament.bracket = [];
    const totalRounds = Math.ceil(Math.log2(shuffled.length));

    for (let round = 0; round < totalRounds; round++) {
      const roundTeams = round === 0 ? shuffled : [];
      for (let i = 0; i < shuffled.length / Math.pow(2, round + 1); i++) {
        const teamA = round === 0 ? shuffled[i * 2] : null;
        const teamB = round === 0 ? shuffled[i * 2 + 1] : null;
        tournament.bracket.push({
          round, match: i,
          teamA, teamB,
          played: false,
          winner: null
        });
      }
    }
    tournament.status = 'in_progress';
    return tournament;
  }

  async simulateMatch(tournamentId) {
    const tournament = this.activeTournaments.get(tournamentId);
    if (!tournament || tournament.status !== 'in_progress') return;

    const match = tournament.bracket.find(m => !m.played && m.teamA && m.teamB);
    if (!match) {
      tournament.status = 'completed';
      const finalMatch = tournament.bracket[tournament.bracket.length - 1];
      const winner = finalMatch?.winner;
      if (winner) {
        const winningClan = await Clan.findById(winner.clanId);
        if (winningClan) {
          winningClan.balance += tournament.prize.coins;
          winningClan.points += 100;
          winningClan.wins = (winningClan.wins || 0) + 1;
          await winningClan.save();
        }
      }
      tournament.prize.claimed = true;
      return { success: true, winner, completed: true };
    }

    const scoreA = Math.floor(Math.random() * 5);
    const scoreB = Math.floor(Math.random() * 5);
    match.played = true;

    if (scoreA > scoreB) {
      match.winner = match.teamA;
      this.advanceWinner(tournament, match);
    } else if (scoreB > scoreA) {
      match.winner = match.teamB;
      this.advanceWinner(tournament, match);
    } else {
      match.winner = Math.random() > 0.5 ? match.teamA : match.teamB;
      this.advanceWinner(tournament, match);
    }

    return { success: true, match: { scoreA, scoreB, winner: match.winner } };
  }

  advanceWinner(tournament, match) {
    const nextRound = match.round + 1;
    const nextMatchIndex = Math.floor(match.match / 2);
    const nextMatch = tournament.bracket.find(m => m.round === nextRound && m.match === nextMatchIndex);
    if (nextMatch) {
      if (match.match % 2 === 0) nextMatch.teamA = match.winner;
      else nextMatch.teamB = match.winner;
    }
  }

  getTournament(tournamentId) {
    return this.activeTournaments.get(tournamentId);
  }
}

// === CLAN BASE SYSTEM ===
const BASE_UPGRADES = {
  training_facility: {
    name: 'Training Facility', levels: 5,
    costs: [2000, 5000, 15000, 30000, 70000],
    bonuses: [1.05, 1.1, 1.15, 1.2, 1.3]
  },
  treasury: {
    name: 'Treasury', levels: 5,
    costs: [3000, 8000, 20000, 50000, 100000],
    bonuses: [1.05, 1.1, 1.2, 1.35, 1.5]
  },
  barracks: {
    name: 'Barracks', levels: 5,
    costs: [1000, 3000, 8000, 20000, 50000],
    bonuses: [5, 10, 15, 20, 30]
  },
  scouting: {
    name: 'Scouting Center', levels: 3,
    costs: [5000, 15000, 40000],
    bonuses: [1.1, 1.25, 1.5]
  }
};

async function upgradeBase(clanId, upgradeType) {
  const clan = await Clan.findById(clanId);
  if (!clan) return { success: false, message: 'Clan not found' };

  const upgrade = BASE_UPGRADES[upgradeType];
  if (!upgrade) return { success: false, message: 'Unknown upgrade' };

  const currentLevel = clan.baseUpgrades?.[upgradeType] || 0;
  if (currentLevel >= upgrade.levels) return { success: false, message: 'Max level reached' };

  const cost = upgrade.costs[currentLevel];
  if (clan.balance < cost) return { success: false, message: `Need 🪙${cost}` };

  if (!clan.baseUpgrades) clan.baseUpgrades = {};
  clan.baseUpgrades[upgradeType] = currentLevel + 1;
  clan.balance -= cost;

  const bonus = upgrade.bonuses[currentLevel];
  await clan.save();

  return {
    success: true,
    message: `${upgrade.name} upgraded to Level ${currentLevel + 1}`,
    newLevel: currentLevel + 1,
    bonus,
    cost
  };
}

// === CLAN BANK SYSTEM ===
async function depositToBank(clanId, userId, amount) {
  const clan = await Clan.findById(clanId);
  const player = await Player.findOne({ userId, guildId: clan?.guildId });
  if (!clan || !player) return { success: false, message: 'Not found' };
  if (player.coins < amount) return { success: false, message: 'Insufficient coins' };
  if (amount < 50) return { success: false, message: 'Min deposit: 50' };

  player.coins -= amount;
  clan.balance = (clan.balance || 0) + amount;
  const interestRate = (clan.baseUpgrades?.treasury || 0) * 0.05;
  clan.balance = Math.floor(clan.balance * (1 + interestRate));

  await player.save();
  await clan.save();
  return { success: true, message: `Deposited 🪙${amount}`, newBalance: clan.balance };
}

async function withdrawFromBank(clanId, userId, amount) {
  const clan = await Clan.findById(clanId);
  const player = await Player.findOne({ userId, guildId: clan?.guildId });
  if (!clan || !player) return { success: false, message: 'Not found' };
  if (clan.leaderId !== userId) return { success: false, message: 'Only leader can withdraw' };
  if ((clan.balance || 0) < amount) return { success: false, message: 'Insufficient balance' };

  clan.balance -= amount;
  player.coins += amount;
  await player.save();
  await clan.save();
  return { success: true, message: `Withdrew 🪙${amount}`, newBalance: clan.balance };
}

module.exports = {
  ClanTournamentSystem: new ClanTournamentSystem(),
  upgradeBase,
  depositToBank,
  withdrawFromBank,
  BASE_UPGRADES
};
