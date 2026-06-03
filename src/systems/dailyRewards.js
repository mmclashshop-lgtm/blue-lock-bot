const Player = require('../database/models/Player');

const STREAK_REWARDS = {
  1:   { coins: 50,  xp: 25,  label: 'اليوم 1' },
  2:   { coins: 75,  xp: 40,  label: 'اليوم 2' },
  3:   { coins: 100, xp: 60,  label: 'اليوم 3' },
  4:   { coins: 125, xp: 80,  label: 'اليوم 4' },
  5:   { coins: 150, xp: 100, label: 'اليوم 5' },
  6:   { coins: 200, xp: 125, label: 'اليوم 6' },
  7:   { coins: 300, xp: 200, label: 'اليوم 7  🔥' },
  14:  { coins: 500, xp: 350, label: 'اليوم 14 💎' },
  30:  { coins: 1000, xp: 750, label: 'اليوم 30 👑' },
};

const MULTIPLIERS = {
  base: 1,
  streak7: 2,
  streak14: 3,
  streak30: 5,
  premium: 2
};

async function claimDaily(player) {
  const now = Date.now();
  const lastClaim = player.lastDailyClaim || 0;
  const diff = now - lastClaim;
  const DAY_MS = 86400000;

  if (diff < DAY_MS && lastClaim > 0) {
    const nextClaim = lastClaim + DAY_MS;
    const hoursLeft = Math.ceil((nextClaim - now) / 3600000);
    return { success: false, message: `المطالبة التالية بعد ${hoursLeft} ساعة`, cooldown: nextClaim };
  }

  const isNewDay = diff >= DAY_MS && diff < DAY_MS * 2;
  const missedDay = diff >= DAY_MS * 2;

  if (missedDay) {
    player.dailyStreak = 1;
  } else if (isNewDay) {
    player.dailyStreak = (player.dailyStreak || 0) + 1;
  } else if (lastClaim === 0) {
    player.dailyStreak = 1;
  }

  const streak = player.dailyStreak;
  const reward = Object.entries(STREAK_REWARDS)
    .filter(([day]) => streak >= parseInt(day))
    .pop()?.[1] || STREAK_REWARDS[1];

  let multiplier = MULTIPLIERS.base;
  if (streak >= 30) multiplier = MULTIPLIERS.streak30;
  else if (streak >= 14) multiplier = MULTIPLIERS.streak14;
  else if (streak >= 7) multiplier = MULTIPLIERS.streak7;

  const coinsGain = reward.coins * multiplier;
  const xpGain = reward.xp * multiplier;

  player.coins += coinsGain;
  player.addXP(xpGain);
  player.lastDailyClaim = now;
  await player.save();

  return {
    success: true,
    streak,
    coins: coinsGain,
    xp: xpGain,
    multiplier,
    nextMilestone: getNextMilestone(streak),
    message: `✅ تمت المطالبة اليومية! السلسلة: ${streak} يوم${streak > 1 ? '' : ''}`
  };
}

function getNextMilestone(streak) {
  const milestones = Object.keys(STREAK_REWARDS).map(Number).sort((a, b) => a - b);
  return milestones.find(m => m > streak) || null;
}

function getStreakDisplay(player) {
  return {
    currentStreak: player.dailyStreak || 0,
    lastClaim: player.lastDailyClaim || 0,
    nextMilestone: getNextMilestone(player.dailyStreak || 0)
  };
}

module.exports = { claimDaily, getStreakDisplay, STREAK_REWARDS };
