const crypto = require('crypto');
const Player = require('../database/models/Player');
const { PACKS, RARITY_STYLES, DUPLICATE_COMPENSATION, GACHA_PLAYERS } = require('../data/gachaData');

class GachaSystem {
  _generateCardId() {
    return crypto.randomBytes(8).toString('hex');
  }

  _rollRarity(packKey) {
    const pack = PACKS[packKey];
    if (!pack) return null;

    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, chance] of Object.entries(pack.rates)) {
      cumulative += chance;
      if (rand < cumulative) return rarity;
    }

    return 'common';
  }

  _pickPlayerByRarity(rarity) {
    const pool = GACHA_PLAYERS[rarity];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  _generateRating(playerData) {
    const [min, max] = playerData.ratingRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  _calculateValue(rarity, rating) {
    const multiplier = RARITY_STYLES[rarity]?.valueMultiplier || 1;
    return Math.floor(rating * multiplier * 10);
  }

  async openPack(userId, guildId, packKey) {
    const pack = PACKS[packKey];
    if (!pack) return { success: false, message: '⚠️ نوع الباقة غير معروف' };

    // Atomic coin deduction to prevent race conditions
    const result = await Player.findOneAndUpdate(
      { userId, guildId, coins: { $gte: pack.price } },
      { $inc: { coins: -pack.price } },
      { new: false }
    );
    if (!result) {
      const player = await Player.findOne({ userId, guildId });
      if (!player) return { success: false, message: '⚠️ يجب إنشاء لاعب أولاً باستخدام /start' };
      return {
        success: false,
        message: `⚠️ تحتاج 🪙${pack.price} لشراء ${pack.emoji} **${pack.name}**\nلديك فقط 🪙${player.coins}`
      };
    }

    const rarity = this._rollRarity(packKey);
    const playerData = this._pickPlayerByRarity(rarity);
    if (!playerData) {
      await Player.findOneAndUpdate(
        { userId, guildId },
        { $inc: { coins: pack.price } }
      );
      return { success: false, message: '⚠️ حدث خطأ في سحب اللاعب. تم استرداد المبلغ.' };
    }

    const rating = this._generateRating(playerData);
    const value = this._calculateValue(rarity, rating);
    const cardId = this._generateCardId();

    const existingPlayer = await Player.findOne({ userId, guildId });
    const existingCard = existingPlayer.gachaPlayers.find(
      p => p.name === playerData.name
    );

    if (existingCard) {
      const compensation = DUPLICATE_COMPENSATION[rarity] || 50;
      await Player.findOneAndUpdate(
        { userId, guildId },
        { $inc: { coins: compensation } }
      );

      return {
        success: true,
        isDuplicate: true,
        card: null,
        rarity,
        playerData,
        rating,
        value,
        packKey,
        compensation,
        message: `🔁 **${playerData.name}** مكرر! تم تعويضك بـ 🪙${compensation}`
      };
    }

    await Player.findOneAndUpdate(
      { userId, guildId },
      {
        $push: {
          gachaPlayers: {
            cardId,
            name: playerData.name,
            rarity,
            rating,
            position: playerData.position,
            value,
            image: playerData.image || null,
            acquiredAt: new Date()
          }
        },
        $inc: {
          'gachaStats.totalPacksOpened': 1,
          'gachaStats.totalSpent': pack.price
        },
        $set: { updatedAt: new Date() }
      }
    );

    // Update bestRarity separately (needs conditional logic)
    const rarityOrder = ['common', 'rare', 'epic', 'legendary', 'mythic'];
    const currentBest = existingPlayer.gachaStats.bestRarity || 'None';
    const currentBestIndex = currentBest === 'None' ? -1 : rarityOrder.indexOf(currentBest.toLowerCase());
    const newIndex = rarityOrder.indexOf(rarity);
    if (newIndex > currentBestIndex) {
      await Player.findOneAndUpdate(
        { userId, guildId },
        { $set: { 'gachaStats.bestRarity': RARITY_STYLES[rarity].name } }
      );
    }

    const updatedPlayer = await Player.findOne({ userId, guildId });
    const newCard = updatedPlayer.gachaPlayers[updatedPlayer.gachaPlayers.length - 1];

    return {
      success: true,
      isDuplicate: false,
      card: newCard,
      rarity,
      playerData,
      rating,
      value,
      packKey,
      compensation: 0
    };
  }

  async buyPack(userId, guildId, packKey) {
    const pack = PACKS[packKey];
    if (!pack) return { success: false, message: '⚠️ نوع الباقة غير معروف' };

    const player = await Player.findOne({ userId, guildId });
    if (!player) return { success: false, message: '⚠️ يجب إنشاء لاعب أولاً باستخدام /start' };

    return {
      success: true,
      packKey,
      price: pack.price,
      coins: player.coins,
      canAfford: player.coins >= pack.price
    };
  }

  getInventory(player) {
    if (!player.gachaPlayers || player.gachaPlayers.length === 0) {
      return { players: [], total: 0 };
    }

    const grouped = {};
    for (const card of player.gachaPlayers) {
      if (!grouped[card.rarity]) grouped[card.rarity] = [];
      grouped[card.rarity].push(card);
    }

    return {
      players: player.gachaPlayers,
      grouped,
      total: player.gachaPlayers.length,
      stats: player.gachaStats
    };
  }

  getPlayerCard(player, cardId) {
    if (!player.gachaPlayers || player.gachaPlayers.length === 0) return null;
    return player.gachaPlayers.find(c => c.cardId === cardId) || null;
  }

  async sellDuplicate(userId, guildId, cardId) {
    const player = await Player.findOne({ userId, guildId });
    if (!player) return { success: false, message: '⚠️ يجب إنشاء لاعب أولاً' };

    const cardIndex = player.gachaPlayers.findIndex(c => c.cardId === cardId);
    if (cardIndex === -1) return { success: false, message: '⚠️ البطاقة غير موجودة في مخزونك' };

    const isDuplicate = player.gachaPlayers.some(
      (c, i) => i !== cardIndex && c.name === player.gachaPlayers[cardIndex].name
    );

    if (!isDuplicate) {
      const count = player.gachaPlayers.filter(c => c.name === player.gachaPlayers[cardIndex].name).length;
      if (count > 1) {
        return { success: false, message: '⚠️ لا يمكن بيع آخر نسخة من هذا اللاعب. تحتاج على الأقل نسختين.' };
      }
    }

    const card = player.gachaPlayers[cardIndex];
    const compensation = DUPLICATE_COMPENSATION[card.rarity] || 50;

    player.gachaPlayers.splice(cardIndex, 1);
    player.coins += compensation;
    player.updatedAt = new Date();
    await player.save();

    return {
      success: true,
      card,
      compensation,
      message: `✅ تم بيع **${card.name}** (${RARITY_STYLES[card.rarity]?.emoji || '⬜'} ${card.rating}) مقابل 🪙${compensation}`
    };
  }

  getCoins(player) {
    return {
      coins: player.coins || 0,
      totalEarned: player.totalCoinsEarned || 0
    };
  }
}

module.exports = new GachaSystem();
