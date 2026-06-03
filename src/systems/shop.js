const Player = require('../database/models/Player');
const { generateCardRarity } = require('../utils/helpers');

class ShopSystem {
  async buyItem(player, itemId) {
    const { getItemById, getBoxPrice, getBoxRarity } = require('../ui/shopUI');

    // Check if it's a loot box (by box key or shop item id)
    const boxTypeMap = { common: 'common', rare: 'rare', epic: 'epic', legendary: 'legendary', mythic: 'mythic', common_box: 'common', rare_box: 'rare', epic_box: 'epic', legendary_box: 'legendary', mythic_box: 'mythic' };
    if (boxTypeMap[itemId]) {
      const boxType = boxTypeMap[itemId];
      const price = getBoxPrice(boxType);
      const rarity = getBoxRarity(boxType);
      return this.buyLootBox(player, boxType, price, rarity);
    }

    const item = getItemById(itemId);
    if (!item) {
      return { success: false, message: '⚠️ عنصر غير موجود' };
    }

    if (player.coins < item.price) {
      return { success: false, message: `⚠️ ليس لديك عملات كافية! تحتاج 🪙${item.price}` };
    }

    player.coins -= item.price;

    let result;
    switch (item.id) {
      case 'training_boost':
        player.boosters.training = Date.now() + 24 * 60 * 60 * 1000;
        player.boosters.training_multiplier = 2;
        result = { boost: 'training', duration: '24h' };
        break;
      case 'xp_boost':
        player.boosters.xp = Date.now() + 60 * 60 * 1000;
        player.boosters.xp_multiplier = 2;
        result = { boost: 'xp', duration: '1h' };
        break;
      case 'coin_boost':
        player.boosters.coin = Date.now() + 60 * 60 * 1000;
        player.boosters.coin_multiplier = 2;
        result = { boost: 'coin', duration: '1h' };
        break;
      case 'premium_pass':
        player.seasonPass.premium = true;
        result = { premium: true };
        break;
      case 'title_change':
        result = { titleChange: true };
        break;
      case 'name_change':
        result = { nameChange: true };
        break;
      case 'skill_reset':
        // Reset all stats to base values
        for (const key of Object.keys(player.stats)) {
          player.stats[key] = 40;
        }
        result = { reset: true };
        break;
      default:
        return { success: false, message: '⚠️ عنصر غير صالح' };
    }

    player.updatedAt = new Date();
    await player.save();

    return {
      success: true,
      item,
      result,
      message: `✅ اشتريت **${item.name}** بنجاح!`
    };
  }

  async buyLootBox(player, boxType, price, rarity) {
    if (player.coins < price) {
      return { success: false, message: `⚠️ ليس لديك عملات كافية! تحتاج 🪙${price}` };
    }

    player.coins -= price;

    // Generate random card
    const cardRarity = this._rollLootBoxRarity(boxType);
    const card = {
      cardId: new (require('mongoose').Types.ObjectId)(),
      name: `${cardRarity} Card`,
      rarity: cardRarity,
      acquiredAt: new Date()
    };

    if (!player.cards) player.cards = [];
    player.cards.push(card);
    player.cardsCount = (player.cardsCount || 0) + 1;

    player.updatedAt = new Date();
    await player.save();

    return {
      success: true,
      card,
      boxType,
      rarity,
      message: `📦 فتحت **${rarity} Box**!\n🎴 حصلت على بطاقة **${cardRarity}**!`
    };
  }

  _rollLootBoxRarity(boxType) {
    const rarities = {
      common: [
        { name: 'Common', chance: 0.7 },
        { name: 'Rare', chance: 0.2 },
        { name: 'Epic', chance: 0.08 },
        { name: 'Legendary', chance: 0.02 }
      ],
      rare: [
        { name: 'Common', chance: 0.3 },
        { name: 'Rare', chance: 0.4 },
        { name: 'Epic', chance: 0.2 },
        { name: 'Legendary', chance: 0.09 },
        { name: 'Mythic', chance: 0.01 }
      ],
      epic: [
        { name: 'Rare', chance: 0.3 },
        { name: 'Epic', chance: 0.4 },
        { name: 'Legendary', chance: 0.2 },
        { name: 'Mythic', chance: 0.09 },
        { name: 'Divine', chance: 0.01 }
      ],
      legendary: [
        { name: 'Epic', chance: 0.3 },
        { name: 'Legendary', chance: 0.4 },
        { name: 'Mythic', chance: 0.2 },
        { name: 'Divine', chance: 0.1 }
      ],
      mythic: [
        { name: 'Legendary', chance: 0.4 },
        { name: 'Mythic', chance: 0.4 },
        { name: 'Divine', chance: 0.2 }
      ]
    };

    const table = rarities[boxType] || rarities.common;
    const roll = Math.random();
    let cumulative = 0;

    for (const entry of table) {
      cumulative += entry.chance;
      if (roll <= cumulative) return entry.name;
    }

    return 'Common';
  }
}

module.exports = new ShopSystem();
