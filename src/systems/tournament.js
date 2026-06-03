const Tournament = require('../database/models/Tournament');
const MatchSimulator = require('../utils/matchSimulator');
const { shuffleArray } = require('../utils/helpers');

class TournamentSystem {
  async createTournament(guildId, channelId, hostId, type) {
    const maxPlayers = parseInt(type);

    const tournament = new Tournament({
      guildId,
      channelId,
      hostId,
      type,
      status: 'registering'
    });

    await tournament.save();
    return tournament;
  }

  async joinTournament(tournamentId, userId, playerName) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return null;
    if (tournament.status !== 'registering') return null;
    if (tournament.players.length >= parseInt(tournament.type)) return null;
    if (tournament.players.find(p => p.userId === userId)) return null;

    tournament.players.push({
      userId,
      name: playerName,
      seed: tournament.players.length + 1
    });

    await tournament.save();
    return tournament;
  }

  async startTournament(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return null;
    if (tournament.status !== 'registering') return null;

    const maxPlayers = parseInt(tournament.type);
    if (tournament.players.length < 2) return null;

    tournament.status = 'in_progress';
    tournament.startedAt = new Date();

    // Shuffle and create bracket
    const shuffled = shuffleArray(tournament.players);
    const bracket = [];
    const numRounds = Math.ceil(Math.log2(shuffled.length));

    for (let round = 1; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        bracket.push({
          round,
          matchIndex: i,
          player1: null,
          player2: null,
          winner: null,
          played: false
        });
      }
    }

    // Assign first round players
    const firstRoundMatches = Math.pow(2, numRounds - 1);
    for (let i = 0; i < firstRoundMatches; i++) {
      const p1Index = i * 2;
      const p2Index = i * 2 + 1;
      if (p1Index < shuffled.length) {
        bracket[i].player1 = {
          userId: shuffled[p1Index].userId,
          name: shuffled[p1Index].name,
          score: 0
        };
      }
      if (p2Index < shuffled.length) {
        bracket[i].player2 = {
          userId: shuffled[p2Index].userId,
          name: shuffled[p2Index].name,
          score: 0
        };
      }
    }

    tournament.bracket = bracket;
    await tournament.save();
    return tournament;
  }

  async playMatch(tournamentId, bracketIndex, player1Stats, player2Stats) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return null;

    const match = tournament.bracket[bracketIndex];
    if (!match || match.played) return null;

    const sim = new MatchSimulator(
      { ...player1Stats, name: match.player1.name },
      { ...player2Stats, name: match.player2.name }
    );

    const result = sim.simulate();

    match.player1.score = result.score.p1;
    match.player2.score = result.score.p2;

    if (result.score.p1 > result.score.p2) {
      match.winner = match.player1.userId;
    } else {
      match.winner = match.player2.userId;
    }

    match.played = true;

    // Advance winner to next round
    const numRounds = Math.ceil(Math.log2(tournament.players.length));
    const nextMatchIndex = Math.floor(bracketIndex / 2) + Math.pow(2, numRounds - 2);
    const isLeftChild = bracketIndex % 2 === 0;

    if (match.round < numRounds && nextMatchIndex < tournament.bracket.length) {
      const nextMatch = tournament.bracket[nextMatchIndex];
      const winnerData = result.score.p1 > result.score.p2
        ? match.player1
        : match.player2;

      if (isLeftChild) {
        nextMatch.player1 = winnerData;
      } else {
        nextMatch.player2 = winnerData;
      }
    }

    // Check if tournament is over
    if (match.round === numRounds) {
      tournament.status = 'completed';
      tournament.winner = {
        userId: match.winner,
        name: result.score.p1 > result.score.p2 ? match.player1.name : match.player2.name
      };
      tournament.endedAt = new Date();
    }

    await tournament.save();
    return { tournament, match, result };
  }

  async cancelTournament(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return null;

    tournament.status = 'cancelled';
    tournament.endedAt = new Date();
    await tournament.save();
    return tournament;
  }

  generateBracketDisplay(tournament) {
    const display = [];
    const numRounds = Math.ceil(Math.log2(tournament.players.length));

    for (let round = 1; round <= numRounds; round++) {
      const roundMatches = tournament.bracket.filter(m => m.round === round);
      const roundText = [];

      roundMatches.forEach((match, i) => {
        const p1 = match.player1 ? match.player1.name : 'TBD';
        const p2 = match.player2 ? match.player2.name : 'TBD';
        const score = match.played
          ? `(${match.player1.score}-${match.player2.score})`
          : '';
        const winner = match.winner ? `✅ ${match.winner}` : '';
        roundText.push(`🔹 ${p1} vs ${p2} ${score} ${winner}`);
      });

      display.push({
        name: `🏆 Round ${round}`,
        value: roundText.join('\n') || 'No matches'
      });
    }

    return display;
  }
}

module.exports = new TournamentSystem();
