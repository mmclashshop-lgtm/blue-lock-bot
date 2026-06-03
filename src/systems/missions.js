const Player = require('../database/models/Player');
const { getDailyMissions, getWeeklyMissions } = require('../utils/helpers');

class MissionSystem {
  async resetDailyMissions(player) {
    const today = new Date().toDateString();
    if (player.dailyMissions && player.dailyMissions.date === today) return;

    player.dailyMissions = {
      date: today,
      missions: getDailyMissions()
    };
    await player.save();
  }

  async resetWeeklyMissions(player) {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekKey = weekStart.toDateString();

    if (player.weeklyMissions && player.weeklyMissions.week === weekKey) return;

    player.weeklyMissions = {
      week: weekKey,
      missions: getWeeklyMissions()
    };
    await player.save();
  }

  async updateMissionProgress(player, missionId, amount = 1) {
    let changed = false;

    if (player.dailyMissions?.date !== new Date().toDateString()) {
      player.dailyMissions = { date: new Date().toDateString(), missions: getDailyMissions() };
      changed = true;
    }

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekKey = weekStart.toDateString();
    if (player.weeklyMissions?.week !== weekKey) {
      player.weeklyMissions = { week: weekKey, missions: getWeeklyMissions() };
      changed = true;
    }

    if (player.dailyMissions?.missions) {
      for (const mission of player.dailyMissions.missions) {
        if (mission.id === missionId && !mission.completed) {
          mission.progress += amount;
          if (mission.progress >= mission.requirement) mission.completed = true;
          changed = true;
        }
      }
    }

    if (player.weeklyMissions?.missions) {
      for (const mission of player.weeklyMissions.missions) {
        if (mission.id === missionId && !mission.completed) {
          mission.progress += amount;
          if (mission.progress >= mission.requirement) mission.completed = true;
          changed = true;
        }
      }
    }

    if (changed) {
      player.updatedAt = new Date();
      await player.save();
    }
  }

  async claimDailyRewards(player) {
    await this.resetDailyMissions(player);

    let totalXP = 0;
    let totalCoins = 0;
    let claimed = 0;

    if (player.dailyMissions && player.dailyMissions.missions) {
      for (const mission of player.dailyMissions.missions) {
        if (mission.completed && !mission.claimed) {
          mission.claimed = true;
          totalXP += mission.xpReward;
          totalCoins += mission.coinReward;
          claimed++;
        }
      }
    }

    if (claimed === 0) {
      return { success: false, message: '⚠️ لا توجد مهام يومية مكتملة للمطالبة' };
    }

    player.addXP(totalXP);
    player.coins += totalCoins;
    player.totalCoinsEarned = (player.totalCoinsEarned || 0) + totalCoins;
    await player.save();

    return {
      success: true,
      type: 'daily',
      claimed,
      totalXP,
      totalCoins,
      message: `✅ تمت المطالبة بـ **${claimed}** مهام يومية!\n✨ +${totalXP} XP\n🪙 +${totalCoins} عملات`
    };
  }

  async claimWeeklyRewards(player) {
    await this.resetWeeklyMissions(player);

    let totalXP = 0;
    let totalCoins = 0;
    let totalGems = 0;
    let claimed = 0;

    if (player.weeklyMissions && player.weeklyMissions.missions) {
      for (const mission of player.weeklyMissions.missions) {
        if (mission.completed && !mission.claimed) {
          mission.claimed = true;
          totalXP += mission.xpReward;
          totalCoins += mission.coinReward;
          totalGems += mission.gemReward || 0;
          claimed++;
        }
      }
    }

    if (claimed === 0) {
      return { success: false, message: '⚠️ لا توجد مهام أسبوعية مكتملة للمطالبة' };
    }

    player.addXP(totalXP);
    player.coins += totalCoins;
    player.gems += totalGems;
    player.totalCoinsEarned = (player.totalCoinsEarned || 0) + totalCoins;
    await player.save();

    return {
      success: true,
      type: 'weekly',
      claimed,
      totalXP,
      totalCoins,
      totalGems,
      message: `✅ تمت المطالبة بـ **${claimed}** مهام أسبوعية!\n✨ +${totalXP} XP\n🪙 +${totalCoins} عملات\n💎 +${totalGems} جواهر`
    };
  }

  async checkAchievement(player, achievementId) {
    if (!player.achievements) player.achievements = [];
    const alreadyHas = player.achievements.find(a => a.id === achievementId);
    if (alreadyHas) return null;

    const { ACHIEVEMENTS } = require('../config/constants');
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    player.achievements.push({ id: achievementId, unlockedAt: new Date() });
    player.addXP(achievement.xpReward);
    player.coins += achievement.coinReward;
    player.totalCoinsEarned = (player.totalCoinsEarned || 0) + achievement.coinReward;
    await player.save();

    return achievement;
  }
}

module.exports = new MissionSystem();
