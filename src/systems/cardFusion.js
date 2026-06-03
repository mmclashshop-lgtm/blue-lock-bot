const Player = require('../database/models/Player');

const RARITY_TIER = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Divine'];
const RARITY_STATS_MULTIPLIER = { Common: 1, Rare: 1.2, Epic: 1.5, Legendary: 2, Mythic: 2.5, Divine: 3.5 };
const FUSION_COST = { Common: 200, Rare: 500, Epic: 2000, Legendary: 10000, Mythic: 50000 };

function getRarityIndex(rarity) {
  return RARITY_TIER.indexOf(rarity);
}

function getNextRarity(rarity) {
  const idx = getRarityIndex(rarity);
  if (idx >= RARITY_TIER.length - 1) return null;
  return RARITY_TIER[idx + 1];
}

function getFusionResult(baseCard, materialCard) {
  const baseRarity = baseCard.rarity || 'Common';
  const materialRarity = materialCard.rarity || 'Common';
  const nextRarity = getNextRarity(baseRarity);

  if (!nextRarity) return { success: false, message: 'Cards are already max rarity' };

  const baseIdx = getRarityIndex(baseRarity);
  const matIdx = getRarityIndex(materialRarity);
  const minRequired = Math.max(baseIdx - 1, 0);

  if (matIdx < minRequired) {
    return { success: false, message: `Material card rarity too low. Need at least ${RARITY_TIER[minRequired]}` };
  }

  const newStats = {
    speed: Math.round((baseCard.speed || 50) * RARITY_STATS_MULTIPLIER[nextRarity] / RARITY_STATS_MULTIPLIER[baseRarity]),
    shooting: Math.round((baseCard.shooting || 50) * RARITY_STATS_MULTIPLIER[nextRarity] / RARITY_STATS_MULTIPLIER[baseRarity]),
    passing: Math.round((baseCard.passing || 50) * RARITY_STATS_MULTIPLIER[nextRarity] / RARITY_STATS_MULTIPLIER[baseRarity]),
    defense: Math.round((baseCard.defense || 50) * RARITY_STATS_MULTIPLIER[nextRarity] / RARITY_STATS_MULTIPLIER[baseRarity]),
    stamina: Math.round((baseCard.stamina || 50) * RARITY_STATS_MULTIPLIER[nextRarity] / RARITY_STATS_MULTIPLIER[baseRarity])
  };

  return {
    success: true,
    newCard: {
      name: `✦ ${baseCard.name}`,
      rarity: nextRarity,
      ...newStats,
      fused: true,
      fusionOrigin: `${baseCard.name} + ${materialCard.name}`
    }
  };
}

async function fuseCards(userId, guildId, baseCardId, materialCardId) {
  const player = await Player.findOne({ userId, guildId });
  if (!player) return { success: false, message: 'Player not found' };

  const baseCard = player.cards.find(c => c.cardId.toString() === baseCardId);
  const materialCard = player.cards.find(c => c.cardId.toString() === materialCardId);
  if (!baseCard || !materialCard) return { success: false, message: 'Card not found' };
  if (baseCardId === materialCardId) return { success: false, message: 'Cannot fuse a card with itself' };

  const baseRarity = baseCard.rarity || 'Common';
  const cost = FUSION_COST[baseRarity] || 500;
  if (player.coins < cost) return { success: false, message: `Need 🪙${cost} for fusion` };

  const result = getFusionResult(baseCard, materialCard);
  if (!result.success) return result;

  player.coins -= cost;
  const baseIdx = player.cards.findIndex(c => c.cardId.toString() === baseCardId);
  const matIdx = player.cards.findIndex(c => c.cardId.toString() === materialCardId);

  player.cards.splice(Math.max(baseIdx, matIdx), 1);
  player.cards.splice(Math.min(baseIdx, matIdx), 1, result.newCard);

  await player.save();
  return { success: true, message: `Fusion successful! ✦ ${result.newCard.name} [${result.newCard.rarity}]`, card: result.newCard, cost };
}

function getFusionPreview(baseCard, materialCard) {
  return getFusionResult(baseCard, materialCard);
}

module.exports = { fuseCards, getFusionPreview, FUSION_COST, RARITY_TIER };
