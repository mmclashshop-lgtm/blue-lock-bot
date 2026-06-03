const Player = require('../database/models/Player');
const { generateCardRarity } = require('../utils/helpers');

const CARD_TEMPLATES = [
  { name: 'Isagi Yoichi', type: 'player', statBonus: 'vision' },
  { name: 'Rin Itoshi', type: 'player', statBonus: 'shooting' },
  { name: 'Nagi Seishiro', type: 'player', statBonus: 'control' },
  { name: 'Bachira Meguru', type: 'player', statBonus: 'dribbling' },
  { name: 'Barou Shoei', type: 'player', statBonus: 'finishing' },
  { name: 'Shidou Ryusei', type: 'player', statBonus: 'shooting' },
  { name: 'Kaiser Michael', type: 'player', statBonus: 'finishing' },
  { name: 'Sae Itoshi', type: 'player', statBonus: 'passing' },
  { name: 'Chigiri Hyoma', type: 'player', statBonus: 'speed' },
  { name: 'Reo Mikage', type: 'player', statBonus: 'passing' },
  { name: 'Ego Jinpachi', type: 'special', statBonus: 'ego' },
  { name: 'Noa Noel', type: 'player', statBonus: 'shooting' },
  { name: 'Loki Julian', type: 'player', statBonus: 'speed' },
  { name: 'Agi', type: 'player', statBonus: 'passing' },
  { name: 'Karasu', type: 'player', statBonus: 'vision' },
  { name: 'Yukimiya', type: 'player', statBonus: 'dribbling' },
  { name: 'Niko', type: 'player', statBonus: 'defense' },
  { name: 'Aiku', type: 'player', statBonus: 'defense' },
  { name: 'Gagamaru', type: 'player', statBonus: 'reaction' },
  { name: 'Raichi', type: 'player', statBonus: 'stamina' }
];

const RARITY_COLORS = {
  Common: '🟤',
  Rare: '🔵',
  Epic: '🟣',
  Legendary: '🟠',
  Mythic: '🔴',
  Divine: '💎'
};

class CollectionSystem {
  generateCard(userId) {
    const template = CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)];
    const rarity = generateCardRarity();

    return {
      cardId: new (require('mongoose').Types.ObjectId)(),
      userId,
      name: template.name,
      type: template.type,
      statBonus: template.statBonus,
      rarity,
      color: RARITY_COLORS[rarity] || '⬜',
      acquiredAt: new Date()
    };
  }

  async addCardToPlayer(player, card) {
    if (!player.cards) player.cards = [];

    player.cards.push({
      cardId: card.cardId,
      name: card.name,
      rarity: card.rarity,
      acquiredAt: card.acquiredAt
    });

    player.cardsCount = (player.cardsCount || 0) + 1;
    await player.save();
    return player;
  }

  getPlayerCards(player, rarity = null) {
    if (!player.cards) return [];
    if (rarity) {
      return player.cards.filter(c => c.rarity === rarity);
    }
    return player.cards;
  }

  getRarityStats(player) {
    if (!player.cards) return { Common: 0, Rare: 0, Epic: 0, Legendary: 0, Mythic: 0, Divine: 0 };

    const stats = { Common: 0, Rare: 0, Epic: 0, Legendary: 0, Mythic: 0, Divine: 0 };
    player.cards.forEach(c => {
      if (stats[c.rarity] !== undefined) stats[c.rarity]++;
    });
    return stats;
  }

  getCardCompletion(player) {
    const totalTemplates = CARD_TEMPLATES.length;
    const uniqueCards = new Set((player.cards || []).map(c => c.name));
    return {
      total: totalTemplates,
      collected: uniqueCards.size,
      percentage: Math.round((uniqueCards.size / totalTemplates) * 100)
    };
  }

  async checkCollectionAchievements(player) {
    const completion = this.getCardCompletion(player);
    const achievements = [];

    if (completion.collected >= 5) achievements.push('collector_5');
    if (completion.collected >= 10) achievements.push('collector_10');
    if (completion.collected >= 15) achievements.push('collector_15');
    if (completion.collected >= 20) achievements.push('collector_20');

    const rarityStats = this.getRarityStats(player);
    if (rarityStats.Legendary >= 1) achievements.push('legendary_owner');
    if (rarityStats.Mythic >= 1) achievements.push('mythic_owner');
    if (rarityStats.Divine >= 1) achievements.push('divine_owner');

    return achievements;
  }

  getCollectionDisplay(player, page = 0, perPage = 9) {
    const cards = player.cards || [];
    const totalPages = Math.ceil(cards.length / perPage) || 1;
    const start = page * perPage;
    const end = start + perPage;
    const pageCards = cards.slice(start, end);

    const rarityOrder = { Divine: 0, Mythic: 1, Legendary: 2, Epic: 3, Rare: 4, Common: 5 };
    pageCards.sort((a, b) => (rarityOrder[a.rarity] || 99) - (rarityOrder[b.rarity] || 99));

    return {
      cards: pageCards,
      page: page + 1,
      totalPages,
      totalCards: cards.length,
      display: pageCards.map(c =>
        `${RARITY_COLORS[c.rarity] || '⬜'} **${c.name}** — ${c.rarity}`
      ).join('\n') || 'لا توجد بطاقات'
    };
  }
}

module.exports = new CollectionSystem();
