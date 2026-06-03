const { randomRange, randomFloat, calculateMatchRating } = require('./helpers');

class MatchSimulator {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.score = { p1: 0, p2: 0 };
    this.actions = [];
    this.minutes = 0;
    this.currentPlayer = null;
    this.skillActivated = false;

    this.rating1 = calculateMatchRating(player1);
    this.rating2 = calculateMatchRating(player2);
  }

  _getActionText(action, player, opponent) {
    const actions = {
      dribble: [
        `🔥 ${player} dribbles past ${opponent}!`,
        `🪄 ${player} shows amazing ball control!`,
        `💨 ${player} speeds past the defender!`,
        `🎯 ${player} cuts inside with precision!`
      ],
      pass: [
        `🔄 ${player} makes a精准 pass!`,
        `👁️ ${player} finds the open man!`,
        `⚡ ${player} plays a through ball!`,
        `🎯 ${player} crosses into the box!`
      ],
      shot: [
        `⚽ ${player} shoots!`,
        `🔥 Powerful shot from ${player}!`,
        `🎯 ${player} aims for the top corner!`,
        `💥 ${player} unleashes a rocket!`
      ],
      save: [
        `🧤 Amazing save from ${opponent}!`,
        `🛡️ ${opponent} blocks the shot!`,
        `👋 ${opponent} punches it away!`,
        `🌟 Great reflexes from ${opponent}!`
      ],
      miss: [
        `😤 ${player}'s shot goes wide!`,
        `💨 The ball flies over the bar!`,
        `🛡️ Blocked by the defense!`,
        `📐 Just inches wide!`
      ],
      goal: [
        `GOOOOOAL! ${player} scores! 🎉`,
        `⚽ ${player} finds the back of the net!`,
        `🔥 WHAT A GOAL FROM ${player}!`,
        `🌟 ${player} scores a beauty!`
      ],
      foul: [
        `🟨 Foul by ${player}!`,
        `⚠️ ${player} commits a foul`,
        `🛑 Dangerous challenge from ${player}!`
      ],
      skill: [
        `⚡ ${player} activates their special ability!`,
        `🔥 ${player}'s unique skill shines!`,
        `💫 ${player} unleashes their hidden power!`
      ]
    };

    const options = actions[action] || [action];
    return options[Math.floor(Math.random() * options.length)];
  }

  _calculateGoalChance(attacker, defender) {
    const baseChance = 0.35;
    const diff = attacker.ego - defender.ego;
    const staminaFactor = attacker.stamina / 99;
    const skillFactor = attacker.finishing / 99;
    return baseChance + (diff * 0.002) + (staminaFactor * 0.1) + (skillFactor * 0.15);
  }

  _calculateAction(attacker, defender) {
    const roll = Math.random();

    // Dribble attempt
    if (roll < 0.35) {
      const dribbleSuccess = (attacker.dribbling + attacker.vision) / 2 / 99;
      if (Math.random() < dribbleSuccess) {
        this.actions.push(this._getActionText('dribble', attacker.name, defender.name));

        // Shot opportunity
        if (Math.random() < 0.5) {
          this.actions.push(this._getActionText('shot', attacker.name, defender.name));
          const goalChance = this._calculateGoalChance(attacker, defender);
          if (Math.random() < goalChance) {
            return 'goal';
          } else {
            if (Math.random() < 0.4) {
              this.actions.push(this._getActionText('save', attacker.name, defender.name));
            } else {
              this.actions.push(this._getActionText('miss', attacker.name, defender.name));
            }
            return 'miss';
          }
        }
      } else {
        this.actions.push(this._getActionText('foul', attacker.name, defender.name));
        return 'turnover';
      }
    }
    // Pass attempt
    else if (roll < 0.65) {
      const passSuccess = (attacker.passing + attacker.vision) / 2 / 99;
      this.actions.push(this._getActionText('pass', attacker.name, defender.name));
      if (Math.random() < passSuccess) {
        this.actions.push(this._getActionText('shot', defender.name, attacker.name));
        const goalChance = this._calculateGoalChance(attacker, defender) * 0.8;
        if (Math.random() < goalChance) {
          return 'goal';
        } else {
          this.actions.push(this._getActionText('save', attacker.name, defender.name));
          this.actions.push(this._getActionText('miss', attacker.name, defender.name));
          return 'miss';
        }
      }
      return 'turnover';
    }
    // Direct shot
    else {
      this.actions.push(this._getActionText('shot', attacker.name, defender.name));
      const goalChance = this._calculateGoalChance(attacker, defender) * 0.6;
      if (Math.random() < goalChance) {
        return 'goal';
      } else {
        this.actions.push(this._getActionText('save', attacker.name, defender.name));
        return 'miss';
      }
    }
  }

  _simulateHalf() {
    for (let i = 0; i < 15; i++) {
      if (Math.random() < 0.15) continue;

      const totalRating = this.rating1 + this.rating2;
      const attackingTeam = Math.random() < (this.rating1 / totalRating) ? 'p1' : 'p2';

      let attacker, defender;
      if (attackingTeam === 'p1') {
        attacker = { ...this.player1.stats, name: this.player1.name, character: this.player1.character };
        defender = { ...this.player2.stats, name: this.player2.name, character: this.player2.character };
      } else {
        attacker = { ...this.player2.stats, name: this.player2.name, character: this.player2.character };
        defender = { ...this.player1.stats, name: this.player1.name, character: this.player1.character };
      }

      // Skill activation
      if (!this.skillActivated && Math.random() < 0.15) {
        this.actions.push(this._getActionText('skill', attacker.name, defender.name));
        this.skillActivated = true;
        attacker.finishing += 10;
        attacker.ego += 10;
      }

      const result = this._calculateAction(attacker, defender);

      if (result === 'goal') {
        if (attackingTeam === 'p1') {
          this.score.p1++;
          this.player1.goalsScored = (this.player1.goalsScored || 0) + 1;
        } else {
          this.score.p2++;
          this.player2.goalsScored = (this.player2.goalsScored || 0) + 1;
        }
        this.actions.push(this._getActionText('goal', attacker.name, defender.name));
        this.actions.push('---');
      }

      this.minutes++;
    }
  }

  simulate() {
    this._simulateHalf();
    this._simulateHalf();

    // Determine winner
    let winner, loser, isDraw = false;
    if (this.score.p1 > this.score.p2) {
      winner = this.player1;
      loser = this.player2;
      this.player1.wins = (this.player1.wins || 0) + 1;
      this.player2.losses = (this.player2.losses || 0) + 1;
    } else if (this.score.p2 > this.score.p1) {
      winner = this.player2;
      loser = this.player1;
      this.player2.wins = (this.player2.wins || 0) + 1;
      this.player1.losses = (this.player1.losses || 0) + 1;
    } else {
      isDraw = true;
      this.player1.draws = (this.player1.draws || 0) + 1;
      this.player2.draws = (this.player2.draws || 0) + 1;
    }

    this.player1.matchesPlayed = (this.player1.matchesPlayed || 0) + 1;
    this.player2.matchesPlayed = (this.player2.matchesPlayed || 0) + 1;
    this.player1.goalsConceded = (this.player1.goalsConceded || 0) + this.score.p2;
    this.player2.goalsConceded = (this.player2.goalsConceded || 0) + this.score.p1;

    // Track mission progress
    try {
      const missions = require('../systems/missions');
      missions.updateMissionProgress(this.player1, 'play_match', 1).catch(() => {});
      missions.updateMissionProgress(this.player1, 'score_goal', this.score.p1).catch(() => {});
      if (winner === this.player1) {
        missions.updateMissionProgress(this.player1, 'win_matches', 1).catch(() => {});
        missions.updateMissionProgress(this.player1, 'win_streak', 1).catch(() => {});
      }
      missions.updateMissionProgress(this.player2, 'play_match', 1).catch(() => {});
      missions.updateMissionProgress(this.player2, 'score_goal', this.score.p2).catch(() => {});
      if (winner === this.player2) {
        missions.updateMissionProgress(this.player2, 'win_matches', 1).catch(() => {});
        missions.updateMissionProgress(this.player2, 'win_streak', 1).catch(() => {});
      }
    } catch {}

    return {
      score: this.score,
      actions: this.actions,
      winner,
      loser,
      isDraw,
      player1: this.player1,
      player2: this.player2
    };
  }

  simulateQuickMatch() {
    // Simple quick simulation for tournaments etc.
    const p1Chance = this.rating1 / (this.rating1 + this.rating2);
    const roll = Math.random();
    const p1Score = Math.floor(Math.random() * 4);
    const p2Score = Math.floor(Math.random() * 3);

    if (roll < p1Chance) {
      this.score.p1 = Math.max(1, p1Score);
      this.score.p2 = p2Score < this.score.p1 ? p2Score : Math.max(0, this.score.p1 - 1);
    } else {
      this.score.p2 = Math.max(1, p2Score);
      this.score.p1 = p1Score < this.score.p2 ? p1Score : Math.max(0, this.score.p2 - 1);
    }

    if (this.score.p1 === this.score.p2) {
      if (Math.random() < p1Chance) this.score.p1++;
      else this.score.p2++;
    }

    return {
      score: this.score,
      winner: this.score.p1 > this.score.p2 ? this.player1 : this.player2,
      loser: this.score.p1 > this.score.p2 ? this.player2 : this.player1,
      isDraw: false,
      player1: this.player1,
      player2: this.player2
    };
  }
}

module.exports = MatchSimulator;
