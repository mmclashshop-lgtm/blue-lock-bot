const Player = require('../database/models/Player');
const MatchSimulator = require('../utils/matchSimulator');
const { randomRange } = require('../utils/helpers');
const config = require('../config/config');

class MatchmakingSystem {
  constructor() {
    this.queues = new Map();
  }

  addToQueue(userId, player) {
    const rating = player.calculateOVR();
    this.queues.set(userId, {
      userId,
      player,
      rating,
      joinedAt: Date.now()
    });
  }

  removeFromQueue(userId) {
    this.queues.delete(userId);
  }

  isInQueue(userId) {
    return this.queues.has(userId);
  }

  findMatch(userId, player) {
    const rating = player.calculateOVR();
    const range = 20;

    let bestMatch = null;
    let bestDiff = Infinity;

    for (const [id, data] of this.queues) {
      if (id === userId) continue;
      const diff = Math.abs(data.rating - rating);
      if (diff <= range && diff < bestDiff) {
        bestDiff = diff;
        bestMatch = data;
      }
    }

    // Expand search range if no match found
    if (!bestMatch) {
      const expandedRange = 50;
      for (const [id, data] of this.queues) {
        if (id === userId) continue;
        const diff = Math.abs(data.rating - rating);
        if (diff <= expandedRange && diff < bestDiff) {
          bestDiff = diff;
          bestMatch = data;
        }
      }
    }

    return bestMatch;
  }

  async simulateMatch(player1Data, player2Data) {
    const simulator = new MatchSimulator(player1Data, player2Data);
    return simulator.simulate();
  }

  async quickMatch(player1, player2) {
    try {
      const p1Rating = player1.calculateOVR();
      const p2Rating = player2.calculateOVR();
      const totalRating = p1Rating + p2Rating;
      const p1Chance = p1Rating / totalRating;

      let p1Goals = 0;
      let p2Goals = 0;
      const events = [];

      let ballPos = Math.random() < 0.5 ? 'p1' : 'p2';
      let time = 0;

      while (time < 90) {
        time += randomRange(1, 5);
        if (time > 90) time = 90;

        const action = Math.random();
        let currentAttacker, currentDefender;

        if (ballPos === 'p1') {
          currentAttacker = { ...player1.stats, name: player1.name };
          currentDefender = { ...player2.stats, name: player2.name };
        } else {
          currentAttacker = { ...player2.stats, name: player2.name };
          currentDefender = { ...player1.stats, name: player1.name };
        }

        if (action < 0.3) {
          const success = currentAttacker.dribbling / 99;
          if (Math.random() < success) {
            events.push({ time, text: `🔥 ${currentAttacker.name} dribbles past ${currentDefender.name}!` });
          } else {
            events.push({ time, text: `🛡️ ${currentDefender.name} wins the ball!` });
            ballPos = ballPos === 'p1' ? 'p2' : 'p1';
          }
        } else if (action < 0.55) {
          const success = currentAttacker.passing / 99;
          if (Math.random() < success) {
            events.push({ time, text: `🔄 ${currentAttacker.name} makes a pass!` });
          } else {
            events.push({ time, text: `✂️ ${currentDefender.name} intercepts!` });
            ballPos = ballPos === 'p1' ? 'p2' : 'p1';
          }
        } else {
          events.push({ time, text: `⚽ ${currentAttacker.name} shoots!` });
          const goalChance = (currentAttacker.finishing / 99) * 0.3 + (Math.random() < p1Chance ? 0.15 : 0);
          if (Math.random() < goalChance) {
            if (ballPos === 'p1') {
              p1Goals++;
              player1.goalsScored = (player1.goalsScored || 0) + 1;
            } else {
              p2Goals++;
              player2.goalsScored = (player2.goalsScored || 0) + 1;
            }
            events.push({ time, text: `⚽ **GOOOOOAL!** ${currentAttacker.name} scores! (${p1Goals}-${p2Goals})` });
            ballPos = Math.random() < 0.5 ? 'p1' : 'p2';
          } else {
            if (Math.random() < 0.4) {
              events.push({ time, text: `🧤 ${currentDefender.name} saves!` });
            } else {
              events.push({ time, text: `😤 ${currentAttacker.name}'s shot goes wide!` });
            }
          }
        }
      }

      // Determine result
      let result;
      if (p1Goals > p2Goals) {
        result = 'p1_win';
        player1.wins = (player1.wins || 0) + 1;
        player2.losses = (player2.losses || 0) + 1;
      } else if (p2Goals > p1Goals) {
        result = 'p2_win';
        player2.wins = (player2.wins || 0) + 1;
        player1.losses = (player1.losses || 0) + 1;
      } else {
        result = 'draw';
        player1.draws = (player1.draws || 0) + 1;
        player2.draws = (player2.draws || 0) + 1;
      }

      player1.matchesPlayed = (player1.matchesPlayed || 0) + 1;
      player2.matchesPlayed = (player2.matchesPlayed || 0) + 1;
      player1.goalsConceded = (player1.goalsConceded || 0) + p2Goals;
      player2.goalsConceded = (player2.goalsConceded || 0) + p1Goals;

      // Track mission progress
      const missions = require('./missions');
      await missions.updateMissionProgress(player1, 'play_match', 1);
      await missions.updateMissionProgress(player1, 'score_goal', p1Goals);
      if (result === 'p1_win') {
        await missions.updateMissionProgress(player1, 'win_matches', 1);
        await missions.updateMissionProgress(player1, 'win_streak', 1);
      }
      await missions.updateMissionProgress(player2, 'play_match', 1);
      await missions.updateMissionProgress(player2, 'score_goal', p2Goals);
      if (result === 'p2_win') {
        await missions.updateMissionProgress(player2, 'win_matches', 1);
        await missions.updateMissionProgress(player2, 'win_streak', 1);
      }

      return {
        score: { p1: p1Goals, p2: p2Goals },
        events,
        result,
        player1,
        player2,
        winner: result === 'p1_win' ? player1 : result === 'p2_win' ? player2 : null,
        loser: result === 'p1_win' ? player2 : result === 'p2_win' ? player1 : null,
        isDraw: result === 'draw'
      };
    } catch (error) {
      const errorLogger = require('../systems/errorLogger');
      errorLogger.error('matchmaking.quickMatch', error);
      throw error;
    }
  }

  getRewards(player, won) {
    const matchConfig = config.match || {};
    const xp = won ? (matchConfig.winXP || 50) : (matchConfig.lossXP || 20);
    const coins = won ? (matchConfig.winCoins || 100) : (matchConfig.lossCoins || 30);
    return { xp, coins };
  }
}

module.exports = new MatchmakingSystem();
