const Player = require('../database/models/Player');
const { randomRange } = require('../utils/helpers');
const achievementSystem = require('./achievements');

class TrainingSystem {
  async train(player, statName) {
    const now = new Date();
    const today = now.toDateString();

    // Reset daily sessions if new day
    const today = new Date().toDateString();
    if (!player.lastTrainingReset || player.lastTrainingReset.toDateString() !== today) {
      player.trainingSessionsToday = 0;
      player.lastTrainingReset = new Date();
    }

    if (player.trainingSessionsToday >= 5) {
      return { success: false, message: '⚠️ لقد استنفذت حصص التدريب لهذا اليوم! عد غداً.' };
    }

    if (!player.stats[statName]) {
      return { success: false, message: '⚠️ مهارة غير صالحة' };
    }

    if (player.stats[statName] >= 99) {
      return { success: false, message: '⚠️ هذه المهارة في أقصاها بالفعل!' };
    }

    // Calculate stat gain
    const potentialMultiplier = player.potential ? player.potential.multiplier : 1;
    const gain = Math.round(randomRange(1, 3) * potentialMultiplier);
    const cappedGain = Math.min(gain, 99 - player.stats[statName]);

    // Apply gain
    player.stats[statName] += cappedGain;
    player.trainingSessionsToday++;
    player.totalTrainingSessions = (player.totalTrainingSessions || 0) + 1;

    // XP reward
    const xpGain = 15 * potentialMultiplier;
    const levelUp = player.addXP(Math.round(xpGain));

     player.updatedAt = new Date();
     await player.save();

     // Track mission progress
     try {
       const missions = require('./missions');
       await missions.updateMissionProgress(player, 'train', 1);
     } catch {}

     // Check for new achievements
     try {
       await achievementSystem.checkAndAwardAchievements(player);
     } catch (achievementError) {
       console.error('Error checking achievements:', achievementError);
     }

     return {
       success: true,
       statName,
       gain: cappedGain,
       xpGain: Math.round(xpGain),
       newValue: player.stats[statName],
       sessionsLeft: 5 - player.trainingSessionsToday,
       levelUp,
       message: `✅ تدربت على **${_getStatArabicName(statName)}**!\n📈 +${cappedGain} ${_getStatArabicName(statName)}\n✨ +${Math.round(xpGain)} XP`
     };
  }
}

function _getStatArabicName(statName) {
  const names = {
    shooting: 'التسديد',
    dribbling: 'المراوغة',
    passing: 'التمرير',
    vision: 'الرؤية',
    speed: 'السرعة',
    defense: 'الدفاع',
    stamina: 'التحمل',
    finishing: 'الإنهاء',
    control: 'التحكم',
    reaction: 'رد الفعل',
    ego: 'الأنانية'
  };
  return names[statName] || statName;
}

module.exports = new TrainingSystem();
