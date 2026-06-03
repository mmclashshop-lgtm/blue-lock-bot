const config = require('../config/config');

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function generateStats(baseMin = 40, baseMax = 70) {
  const statNames = ['shooting', 'dribbling', 'passing', 'vision', 'speed', 'defense', 'stamina', 'finishing', 'control', 'reaction', 'ego'];
  const stats = {};
  statNames.forEach(name => {
    stats[name] = randomRange(baseMin, baseMax);
  });
  return stats;
}

function calculateLevel(xp) {
  let level = 1;
  let required = 100;
  let totalXP = 0;
  while (xp >= required) {
    xp -= required;
    level++;
    required = Math.floor(100 * Math.pow(1.5, level - 1));
    if (level >= 100) break;
  }
  return { level, xp, xpToNext: required };
}

function generatePotential() {
  const roll = Math.random();
  if (roll < 0.5) return { type: 'Common', multiplier: 1.0, growth: 1 };
  if (roll < 0.75) return { type: 'Rare', multiplier: 1.5, growth: 2 };
  if (roll < 0.9) return { type: 'Epic', multiplier: 2.0, growth: 3 };
  return { type: 'Legendary', multiplier: 3.0, growth: 5 };
}

function generateCardRarity() {
  const roll = Math.random();
  if (roll < 0.4) return 'Common';
  if (roll < 0.65) return 'Rare';
  if (roll < 0.82) return 'Epic';
  if (roll < 0.93) return 'Legendary';
  if (roll < 0.98) return 'Mythic';
  return 'Divine';
}

function getRankFromXP(xp) {
  const { ranks } = config;
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (xp >= ranks[i].minXP) return ranks[i];
  }
  return ranks[0];
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function generateProgressBar(current, max, length = 15) {
  const progress = Math.min(current / max, 1);
  const filled = Math.round(progress * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function getDailyMissions() {
  const { DAILY_MISSIONS } = require('../config/constants');
  return DAILY_MISSIONS.map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    requirement: m.requirement,
    xpReward: m.xpReward,
    coinReward: m.coinReward,
    progress: 0,
    completed: false,
    claimed: false
  }));
}

function getWeeklyMissions() {
  const { WEEKLY_MISSIONS } = require('../config/constants');
  return WEEKLY_MISSIONS.map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    requirement: m.requirement,
    xpReward: m.xpReward,
    coinReward: m.coinReward,
    gemReward: m.gemReward || 0,
    progress: 0,
    completed: false,
    claimed: false
  }));
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getStatEmoji(statName) {
  const map = {
    shooting: '🎯', dribbling: '🪄', passing: '🔄', vision: '👁️',
    speed: '💨', defense: '🛡️', stamina: '💪', finishing: '⚽',
    control: '🎮', reaction: '⚡', ego: '🔥'
  };
  return map[statName] || '📊';
}

function getPositionEmoji(position) {
  const map = {
    ST: '⚽', LW: '⬅️', RW: '➡️', CM: '🔄',
    CDM: '🛡️', LB: '⬅️', RB: '➡️', CB: '🛡️', GK: '🧤'
  };
  return map[position] || '👤';
}

function calculateMatchRating(player) {
  const s = player.stats;
  return (
    s.shooting * 1.2 + s.dribbling * 1.0 + s.passing * 1.0 +
    s.vision * 1.1 + s.speed * 1.0 + s.defense * 0.8 +
    s.stamina * 0.8 + s.finishing * 1.3 + s.control * 1.0 +
    s.reaction * 1.0 + s.ego * 1.5
  ) / 11;
}

module.exports = {
  randomRange,
  randomFloat,
  clamp,
  generateStats,
  calculateLevel,
  generatePotential,
  generateCardRarity,
  getRankFromXP,
  formatNumber,
  generateProgressBar,
  getDailyMissions,
  getWeeklyMissions,
  shuffleArray,
  getOrdinalSuffix,
  getStatEmoji,
  getPositionEmoji,
  calculateMatchRating
};
