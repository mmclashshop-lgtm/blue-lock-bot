const Player = require('../database/models/Player');

const BOOSTER_TYPES = {
  training: {
    name: 'Training Boost',
    effect: 'ضعف نقاط التدريب',
    multiplier: 2,
    duration: 24 * 60 * 60 * 1000,
    price: 1000
  },
  xp: {
    name: 'XP Boost',
    effect: 'ضعف XP',
    multiplier: 2,
    duration: 60 * 60 * 1000,
    price: 2000
  },
  coin: {
    name: 'Coin Boost',
    effect: 'ضعف العملات',
    multiplier: 2,
    duration: 60 * 60 * 1000,
    price: 3000
  }
};

class BoosterSystem {
  async activateBooster(player, type) {
    const config = BOOSTER_TYPES[type];
    if (!config) return { success: false, message: '⚠️ نوع غير معروف' };

    if (player.coins < config.price) {
      return { success: false, message: `⚠️ تحتاج 🪙${config.price}` };
    }

    if (!player.boosters) player.boosters = {};
    const now = Date.now();

    if (player.boosters[type] && player.boosters[type] > now) {
      const remaining = Math.ceil((player.boosters[type] - now) / 60000);
      return { success: false, message: `⚠️ لديك بالفعل boost نشط! متبقي ${remaining} دقيقة` };
    }

    player.coins -= config.price;
    player.boosters[type] = now + config.duration;
    player.boosters[`${type}_multiplier`] = config.multiplier;
    player.updatedAt = new Date();
    await player.save();

    return {
      success: true,
      type,
      config,
      message: `✅ **${config.name}** مفعّل!\n⏱ المدة: ${config.duration / 60000} دقيقة\n📈 المضاعف: x${config.multiplier}`
    };
  }

  async getBoosterStatus(player) {
    if (!player.boosters) return { active: [] };
    const now = Date.now();
    const active = [];

    for (const type of Object.keys(BOOSTER_TYPES)) {
      const expiry = player.boosters[type];
      if (expiry && expiry > now) {
        const remaining = Math.ceil((expiry - now) / 60000);
        active.push({
          type,
          name: BOOSTER_TYPES[type].name,
          remaining,
          multiplier: player.boosters[`${type}_multiplier`] || 1
        });
      } else if (expiry) {
        delete player.boosters[type];
        delete player.boosters[`${type}_multiplier`];
      }
    }

    if (active.length === 0 && player.boosters) {
      // cleanup expired
      for (const key of Object.keys(player.boosters)) {
        if (BOOSTER_TYPES[key] && player.boosters[key] < now) {
          delete player.boosters[key];
          delete player.boosters[`${key}_multiplier`];
        }
      }
      await player.save().catch(e => console.error('Boosters save error:', e));
    }

    return { active };
  }

  getMultiplier(player, type) {
    if (!player.boosters || !player.boosters[type]) return 1;
    const now = Date.now();
    if (player.boosters[type] < now) return 1;
    return player.boosters[`${type}_multiplier`] || 1;
  }

  async getActiveBoostersDisplay(player) {
    const status = await this.getBoosterStatus(player);
    if (status.active.length === 0) return 'لا توجد تعزيزات نشطة';

    return status.active.map(b =>
      `⚡ **${b.name}** — x${b.multiplier} | ⏱ ${b.remaining}د`
    ).join('\n');
  }
}

module.exports = new BoosterSystem();
module.exports.BOOSTER_TYPES = BOOSTER_TYPES;
