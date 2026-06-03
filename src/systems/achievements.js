const Player = require('../database/models/Player');
const { randomRange } = require('../utils/helpers');

class AchievementSystem {
  constructor() {
    this.achievements = {
      // Match Achievements
      first_win: {
        id: 'first_win',
        name: 'أول فوز',
        description: 'حقق أول فوز لك في مباراة',
        icon: '🏆',
        category: 'matches',
        reward: { coins: 500, xp: 300 },
        condition: (player) => player.wins >= 1
      },
      win_streak_5: {
        id: 'win_streak_5',
        name: 'سلسلة انتصارات',
        description: 'حقق 5 انتصارات متتالية',
        icon: '🔥',
        category: 'matches',
        reward: { coins: 1500, xp: 800 },
        condition: (player) => player.bestWinStreak >= 5
      },
      matches_100: {
        id: 'matches_100',
        name: 'المباريات المائة',
        description: 'لعب 100 مباراة',
        icon: '⚽',
        category: 'matches',
        reward: { coins: 5000, xp: 2000 },
        condition: (player) => player.matchesPlayed >= 100
      },
      goals_50: {
        id: 'goals_50',
        name: 'الهداف',
        description: 'سجل 50 هدفًا إجماليًا',
        icon: '🎯',
        category: 'matches',
        reward: { coins: 3000, xp: 1500 },
        condition: (player) => player.goalsScored >= 50
      },

      // Training Achievements
      training_sessions_50: {
        id: 'training_sessions_50',
        name: 'متدرب مجتهد',
        description: 'أكمل 50 حصة تدريب',
        icon: '🏋️',
        category: 'training',
        reward: { coins: 1000, xp: 500 },
        condition: (player) => player.totalTrainingSessions >= 50
      },
      max_stat: {
        id: 'max_stat',
        name: 'إتقان المهارة',
        description: 'وصل أي إحصائية إلى المستوى 99',
        icon: '⭐',
        category: 'training',
        reward: { coins: 2000, xp: 1000 },
        condition: (player) => Object.values(player.stats || {}).some(stat => stat >= 99)
      },
      all_stats_50: {
        id: 'all_stats_50',
        name: 'متوازن',
        description: 'وصل جميع الإحصائيات إلى المستوى 50 على الأقل',
        icon: '⚖️',
        category: 'training',
        reward: { coins: 3000, xp: 1500 },
        condition: (player) => {
          const stats = player.stats || {};
          return Object.values(stats).every(stat => stat >= 50);
        }
      },

      // Collection Achievements
      collector_bronze: {
        id: 'collector_bronze',
        name: 'جامع برونزي',
        description: 'اجمع 10 بطاقات',
        icon: '🎴',
        category: 'collection',
        reward: { coins: 800, xp: 400 },
        condition: (player) => player.gachaPlayers?.length >= 10
      },
      collector_silver: {
        id: 'collector_silver',
        name: 'جامع فضي',
        description: 'اجمع 25 بطاقة',
        icon: '🎴',
        category: 'collection',
        reward: { coins: 2000, xp: 1000 },
        condition: (player) => player.gachaPlayers?.length >= 25
      },
      collector_gold: {
        id: 'collector_gold',
        name: 'جامع ذهبي',
        description: 'اجمع 50 بطاقة',
        icon: '🎴',
        category: 'collection',
        reward: { coins: 5000, xp: 2500 },
        condition: (player) => player.gachaPlayers?.length >= 50
      },
      legendary_collector: {
        id: 'legendary_collector',
        name: 'جامع الأسطوريين',
        description: 'اجمع 5 بطاقات أسطورية أو أعلى',
        icon: '👑',
        category: 'collection',
        reward: { coins: 10000, xp: 5000 },
        condition: (player) => {
          const legendaryCount = (player.gachaPlayers || []).filter(card => 
            card.rarity === 'Legendary' || card.rarity === 'Mythic' || card.rarity === 'Divine'
          ).length;
          return legendaryCount >= 5;
        }
      },

      // Economy Achievements
      rich_player: {
        id: 'rich_player',
        name: 'اللاعب الثري',
        description: 'اجمع 100,000 عملة',
        icon: '💰',
        category: 'economy',
        reward: { coins: 5000, xp: 2500 },
        condition: (player) => player.coins >= 100000
      },
      big_spender: {
        id: 'big_spender',
        name: 'المنفق الكبير',
        description: 'أنفق 50,000 عملة في المتجر',
        icon: '🛒',
        category: 'economy',
        reward: { coins: 3000, xp: 1500 },
        condition: (player) => player.gachaStats?.totalSpent >= 50000
      },

      // Clan Achievements
      clan_founders: {
        id: 'clan_founders',
        name: 'مؤسس عشيرة',
        description: 'أنشئ عشيرة',
        icon: '🏰',
        category: 'clan',
        reward: { coins: 2000, xp: 1000 },
        condition: (player) => player.clanId !== null
      },
      clan_leader_10: {
        id: 'clan_leader_10',
        name: 'قائد عشيرة',
        description: 'قود عشيرة تضم 10 أعضاء أو أكثر',
        icon: '👑',
        category: 'clan',
        reward: { coins: 5000, xp: 2500 },
        condition: (player) => {
          // This would require checking clan members count
          // For now, we'll approximate with a placeholder
          return player.clanId !== null && false; // To be implemented with clan system
        }
      },

      // Special Achievements
      blue_lock_legend: {
        id: 'blue_lock_legend',
        name: 'أسطورة بلو لوك',
        description: ' raggi il livello 100',
        icon: '🌟',
        category: 'special',
        reward: { coins: 50000, xp: 20000, title: 'أسطورة بلو لوك' },
        condition: (player) => player.level >= 100
      },
      first_blood: {
        id: 'first_blood',
        name: 'الدم الأول',
        description: 'حقق فوزك الأول ضد لاعب آخر',
        icon: '⚔️',
        category: 'matches',
        reward: { coins: 1000, xp: 500 },
        condition: (player) => player.wins >= 1 // Assuming all wins are vs players for simplicity
      }
    };
  }

  /**
   * Check and award new achievements for a player
   * @param {Object} player - The player object
   * @returns {Array} List of newly awarded achievements
   */
  async checkAndAwardAchievements(player) {
    const newlyAwarded = [];

    for (const achievementId in this.achievements) {
      const achievement = this.achievements[achievementId];

      // Skip if already achieved
      if (player.achievements && player.achievements.some(a => a.id === achievementId)) {
        continue;
      }

      // Check condition
      if (achievement.condition(player)) {
        // Award achievement
        await this._awardAchievement(player, achievement);
        newlyAwarded.push(achievement);
      }
    }

    return newlyAwarded;
  }

  /**
   * Award an achievement to a player
   * @param {Object} player - The player object
   * @param {Object} achievement - The achievement to award
   * @returns {Promise<void>}
   */
  async _awardAchievement(player, achievement) {
    // Initialize achievements array if not present
    if (!player.achievements) {
      player.achievements = [];
    }

    // Add achievement with unlock time
    player.achievements.push({
      id: achievement.id,
      unlockedAt: new Date()
    });

    // Apply rewards
    if (achievement.reward) {
      if (achievement.reward.coins) {
        player.coins += achievement.reward.coins;
        player.totalCoinsEarned = (player.totalCoinsEarned || 0) + achievement.reward.coins;
      }
      if (achievement.reward.xp) {
        const levelUp = player.addXP(achievement.reward.xp);
        // Handle level up if needed
      }
      if (achievement.reward.title) {
        // Add title to player's title collection
        if (!player.titles) {
          player.titles = [];
        }
        if (!player.titles.includes(achievement.reward.title)) {
          player.titles.push(achievement.reward.title);
        }
      }
    }

    // Save player
    await player.save();

    // Log achievement award
    console.log(`Achievement awarded: ${player.userId} - ${achievement.name}`);
  }

  /**
   * Get player's achievements with details
   * @param {Object} player - The player object
   * @returns {Array} List of achievement objects with completion status
   */
  getPlayerAchievements(player) {
    const earnedAchievementIds = player.achievements ? player.achievements.map(a => a.id) : [];
    return Object.values(this.achievements).map(achievement => ({
      ...achievement,
      completed: earnedAchievementIds.includes(achievement.id),
      unlockedAt: player.achievements.find(a => a.id === achievement.id)?.unlockedAt || null
    }));
  }

  /**
   * Get achievements by category
   * @param {Object} player - The player object
   * @param {string} category - The category to filter by
   * @returns {Array} List of achievements in the category
   */
  getAchievementsByCategory(player, category) {
    return this.getPlayerAchievements(player)
      .filter(achievement => achievement.category === category);
  }
}

module.exports = new AchievementSystem();