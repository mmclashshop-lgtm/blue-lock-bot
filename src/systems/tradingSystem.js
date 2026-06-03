const Player = require('../database/models/Player');

class TradingSystem {
  constructor() {
    this.pendingTrades = new Map();
  }

  createTrade(fromUserId, toUserId, guildId, offer, request) {
    const tradeId = `trade_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.pendingTrades.set(tradeId, {
      id: tradeId,
      fromUserId, toUserId, guildId,
      offer, request,
      status: 'pending',
      createdAt: Date.now()
    });
    setTimeout(() => {
      const t = this.pendingTrades.get(tradeId);
      if (t && t.status === 'pending') {
        t.status = 'expired';
        this.pendingTrades.delete(tradeId);
      }
    }, 300000);
    return tradeId;
  }

  getTrade(tradeId) {
    return this.pendingTrades.get(tradeId);
  }

  async acceptTrade(tradeId) {
    const trade = this.pendingTrades.get(tradeId);
    if (!trade) return { success: false, message: 'Trade not found' };
    if (trade.status !== 'pending') return { success: false, message: 'Trade is no longer active' };

    const fromPlayer = await Player.findOne({ userId: trade.fromUserId, guildId: trade.guildId });
    const toPlayer = await Player.findOne({ userId: trade.toUserId, guildId: trade.guildId });
    if (!fromPlayer || !toPlayer) return { success: false, message: 'Player not found' };

    for (const item of trade.offer) {
      if (item.type === 'card') {
        const idx = fromPlayer.cards.findIndex(c => c.cardId.toString() === item.id);
        if (idx === -1) return { success: false, message: 'Offered card no longer available' };
        const [card] = fromPlayer.cards.splice(idx, 1);
        toPlayer.cards.push(card);
      }
      if (item.type === 'coin') {
        if (fromPlayer.coins < item.amount) return { success: false, message: 'Insufficient coins' };
        fromPlayer.coins -= item.amount;
        toPlayer.coins += item.amount;
      }
    }

    for (const item of trade.request) {
      if (item.type === 'card') {
        const idx = toPlayer.cards.findIndex(c => c.cardId.toString() === item.id);
        if (idx === -1) return { success: false, message: 'Requested card no longer available' };
        const [card] = toPlayer.cards.splice(idx, 1);
        fromPlayer.cards.push(card);
      }
      if (item.type === 'coin') {
        if (toPlayer.coins < item.amount) return { success: false, message: 'Insufficient coins' };
        toPlayer.coins -= item.amount;
        fromPlayer.coins += item.amount;
      }
    }

    await fromPlayer.save();
    await toPlayer.save();
    trade.status = 'completed';
    this.pendingTrades.delete(tradeId);

    return { success: true, message: 'Trade completed successfully', fromPlayer, toPlayer };
  }

  cancelTrade(tradeId) {
    const trade = this.pendingTrades.get(tradeId);
    if (!trade) return { success: false, message: 'Trade not found' };
    trade.status = 'cancelled';
    this.pendingTrades.delete(tradeId);
    return { success: true, message: 'Trade cancelled' };
  }

  getPendingForUser(userId) {
    const trades = [];
    for (const trade of this.pendingTrades.values()) {
      if (trade.toUserId === userId || trade.fromUserId === userId) {
        trades.push(trade);
      }
    }
    return trades;
  }
}

module.exports = new TradingSystem();
