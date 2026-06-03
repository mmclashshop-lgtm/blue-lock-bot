const MatchHistory = require('../database/models/MatchHistory');
const config = require('../config/config');

class AdvancedMatchSimulator {
  constructor() {
    this.matchDuration = 90; // seconds for simulation
  }

  /**
   * محاكاة مباراة كاملة بين لاعبين
   */
  async simulateMatch(player1, player2, matchType = 'Ranked') {
    try {
      const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const startTime = new Date();

      // Get player stats
      const p1Stats = this.getMatchStats(player1);
      const p2Stats = this.getMatchStats(player2);

      // Initialize match state
      const matchState = {
        score: { p1: 0, p2: 0 },
        possession: 50,
        events: [],
        p1Stats: {
          goals: 0, assists: 0, tackles: 0, passes: 0, dribbles: 0, saves: 0
        },
        p2Stats: {
          goals: 0, assists: 0, tackles: 0, passes: 0, dribbles: 0, saves: 0
        }
      };

      // محاكاة المباراة
      for (let minute = 0; minute < this.matchDuration; minute++) {
        // احتمالية حدث كل دقيقة
        const eventChance = Math.random();

        if (eventChance < 0.15) {
          // احتمالية 15% لحدث مهم
          const event = this.generateMatchEvent(matchState, p1Stats, p2Stats, minute);
          if (event) matchState.events.push(event);
        }

        // تحديث التملك
        matchState.possession = this.updatePossession(matchState.possession, p1Stats, p2Stats);
      }

      // تحديد الفائز
      const result = this.determineWinner(matchState);

      // حساب المكافآت
      const rewards = this.calculateRewards(player1, player2, result, matchType);

      // إنشاء سجل المباراة
      const matchRecord = new MatchHistory({
        matchId,
        team1: {
          playerId: player1._id,
          playerName: player1.name,
          playerLevel: player1.level,
          playerRank: player1.rank,
          character: player1.character,
          stats: this.formatStats(p1Stats)
        },
        team2: {
          playerId: player2._id,
          playerName: player2.name,
          playerLevel: player2.level,
          playerRank: player2.rank,
          character: player2.character,
          stats: this.formatStats(p2Stats)
        },
        matchType,
        score: matchState.score,
        winner: result.winner,
        events: matchState.events,
        team1Stats: matchState.p1Stats,
        team2Stats: matchState.p2Stats,
        bestPlayer: result.bestPlayer,
        bestPlayerStats: result.bestPlayerStats,
        team1Rewards: rewards.team1,
        team2Rewards: rewards.team2,
        startedAt: startTime,
        endedAt: new Date(),
        guildId: player1.guildId,
        replay: {
          enabled: true,
          events: matchState.events
        }
      });

      await matchRecord.save();
      return {
        success: true,
        matchId,
        matchRecord,
        result,
        rewards
      };
    } catch (error) {
      console.error('Error simulating match:', error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات اللاعب للمباراة
   */
  getMatchStats(player) {
    const stats = { ...player.stats };
    
    // تطبيق تأثير الشخصية
    if (player.characterStats) {
      Object.keys(stats).forEach(stat => {
        stats[stat] = Math.round(stats[stat] * (1 + (player.characterStats[stat] || 0) / 100));
      });
    }

    // حد أقصى 99
    Object.keys(stats).forEach(stat => {
      stats[stat] = Math.min(stats[stat], 99);
    });

    return stats;
  }

  /**
   * توليد حدث مباراة عشوائي
   */
  generateMatchEvent(matchState, p1Stats, p2Stats, minute) {
    const eventTypes = ['goal', 'save', 'tackle', 'pass', 'dribble', 'skill_used'];
    
    // احتياليات حسب الإحصائيات
    const p1GoalChance = (p1Stats.shooting + p1Stats.finishing) / 200;
    const p2GoalChance = (p2Stats.shooting + p2Stats.finishing) / 200;

    const random = Math.random();

    // منطقة الهدف
    if (random < p1GoalChance * 0.08) {
      matchState.score.p1++;
      matchState.p1Stats.goals++;
      return {
        time: minute,
        type: 'goal',
        player: 'p1',
        description: `⚽ هدف! اللاعب الأول سجل هدفاً`,
        timestamp: new Date()
      };
    } else if (random < (p1GoalChance + p2GoalChance) * 0.08) {
      matchState.score.p2++;
      matchState.p2Stats.goals++;
      return {
        time: minute,
        type: 'goal',
        player: 'p2',
        description: `⚽ هدف! اللاعب الثاني سجل هدفاً`,
        timestamp: new Date()
      };
    }

    // تصديات
    if (random < 0.12) {
      const isP1 = Math.random() < 0.5;
      if (isP1) matchState.p1Stats.saves++;
      else matchState.p2Stats.saves++;

      return {
        time: minute,
        type: 'save',
        player: isP1 ? 'p1' : 'p2',
        description: `🧤 تصدي رائع!`,
        timestamp: new Date()
      };
    }

    // مراوغات
    if (random < 0.20) {
      const isP1 = Math.random() < (matchState.possession / 100);
      if (isP1) matchState.p1Stats.dribbles++;
      else matchState.p2Stats.dribbles++;

      return {
        time: minute,
        type: 'dribble',
        player: isP1 ? 'p1' : 'p2',
        description: `🏃 مراوغة ماهرة!`,
        timestamp: new Date()
      };
    }

    // تمريرات
    if (random < 0.30) {
      const isP1 = Math.random() < (matchState.possession / 100);
      if (isP1) matchState.p1Stats.passes++;
      else matchState.p2Stats.passes++;

      return {
        time: minute,
        type: 'pass',
        player: isP1 ? 'p1' : 'p2',
        description: `🎯 تمرية دقيقة`,
        timestamp: new Date()
      };
    }

    // مهارات خاصة
    if (random < 0.35) {
      const isP1 = Math.random() < 0.5;
      return {
        time: minute,
        type: 'skill_used',
        player: isP1 ? 'p1' : 'p2',
        description: `🔥 استخدام مهارة خاصة!`,
        timestamp: new Date()
      };
    }

    return null;
  }

  /**
   * تحديث حالة التملك
   */
  updatePossession(currentPossession, p1Stats, p2Stats) {
    const p1Control = (p1Stats.control + p1Stats.passing + p1Stats.dribbling) / 3;
    const p2Control = (p2Stats.control + p2Stats.passing + p2Stats.dribbling) / 3;
    
    const controlDiff = (p1Control - p2Control) / 100;
    const randomFactor = (Math.random() - 0.5) * 10;
    
    let newPossession = currentPossession + controlDiff * 2 + randomFactor;
    
    // حد ادنى 20% و 80% أعلى
    return Math.max(20, Math.min(80, newPossession));
  }

  /**
   * تحديد الفائز والإحصائيات
   */
  determineWinner(matchState) {
    let winner;
    if (matchState.score.p1 > matchState.score.p2) {
      winner = 'team1';
    } else if (matchState.score.p2 > matchState.score.p1) {
      winner = 'team2';
    } else {
      winner = 'draw';
    }

    // أفضل لاعب
    const totalP1 = 
      matchState.p1Stats.goals * 10 + 
      matchState.p1Stats.assists * 5 + 
      matchState.p1Stats.passes * 0.5 + 
      matchState.p1Stats.dribbles * 2;

    const totalP2 = 
      matchState.p2Stats.goals * 10 + 
      matchState.p2Stats.assists * 5 + 
      matchState.p2Stats.passes * 0.5 + 
      matchState.p2Stats.dribbles * 2;

    const bestPlayer = totalP1 > totalP2 ? 'team1' : 'team2';
    const bestStats = bestPlayer === 'team1' ? matchState.p1Stats : matchState.p2Stats;

    return {
      winner,
      bestPlayer,
      bestPlayerStats: bestStats
    };
  }

  /**
   * حساب المكافآت
   */
  calculateRewards(player1, player2, result, matchType) {
    const baseXP = 50;
    const baseCoins = 100;

    let p1Multiplier = 1;
    let p2Multiplier = 1;

    // حسب نوع المباراة
    if (matchType === 'Tournament') {
      p1Multiplier = 1.5;
      p2Multiplier = 1.5;
    } else if (matchType === 'ClanWar') {
      p1Multiplier = 1.3;
      p2Multiplier = 1.3;
    }

    // حسب النتيجة
    if (result.winner === 'team1') {
      p1Multiplier *= 2;
    } else if (result.winner === 'team2') {
      p2Multiplier *= 2;
    } else {
      p1Multiplier *= 1.3;
      p2Multiplier *= 1.3;
    }

    return {
      team1: {
        xp: Math.floor(baseXP * p1Multiplier),
        coins: Math.floor(baseCoins * p1Multiplier),
        gems: result.winner === 'team1' ? 5 : 0
      },
      team2: {
        xp: Math.floor(baseXP * p2Multiplier),
        coins: Math.floor(baseCoins * p2Multiplier),
        gems: result.winner === 'team2' ? 5 : 0
      }
    };
  }

  /**
   * تنسيق الإحصائيات
   */
  formatStats(stats) {
    return {
      shooting: stats.shooting,
      dribbling: stats.dribbling,
      passing: stats.passing,
      vision: stats.vision,
      speed: stats.speed,
      defense: stats.defense,
      stamina: stats.stamina,
      finishing: stats.finishing,
      control: stats.control,
      reaction: stats.reaction,
      ovr: Math.round(
        (stats.shooting + stats.dribbling + stats.passing + stats.vision +
         stats.speed + stats.defense + stats.stamina + stats.finishing +
         stats.control + stats.reaction) / 10
      )
    };
  }
}

module.exports = new AdvancedMatchSimulator();
