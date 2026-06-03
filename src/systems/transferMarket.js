const Listing = require('../database/models/Listing');
const Player = require('../database/models/Player');

const TAX_RATE = 0.1;
const MAX_LISTINGS_PER_PLAYER = 5;

class TransferMarketSystem {
  async getActiveListingsFromDB(guildId, filter = {}) {
    const query = { guildId, active: true };
    if (filter.type) query.itemType = filter.type;
    if (filter.minPrice) query.price = { $gte: filter.minPrice };
    if (filter.maxPrice) query.price = { ...query.price, $lte: filter.maxPrice };
    return Listing.find(query).sort({ listedAt: -1 }).limit(50).lean();
  }

  async listItem(sellerId, guildId, itemType, itemData, price) {
    const seller = await Player.findOne({ userId: sellerId, guildId });
    if (!seller) return { success: false, message: '⚠️ يجب إنشاء لاعب أولاً' };

    const activeCount = await Listing.countDocuments({ sellerId, guildId, active: true });
    if (activeCount >= MAX_LISTINGS_PER_PLAYER) {
      return { success: false, message: `⚠️ لا يمكنك عرض أكثر من ${MAX_LISTINGS_PER_PLAYER} عناصر` };
    }

    if (price < 100) return { success: false, message: '⚠️ السعر الأدنى 100 عملة' };
    if (price > 1000000) return { success: false, message: '⚠️ السعر الأقصى 1,000,000 عملة' };

    if (itemType === 'card') {
      const cardIdx = (seller.cards || []).findIndex(c => c.cardId.toString() === itemData.cardId);
      if (cardIdx === -1) return { success: false, message: '⚠️ البطاقة غير موجودة' };
      seller.cards.splice(cardIdx, 1);
      seller.cardsCount = Math.max(0, (seller.cardsCount || 1) - 1);
    } else if (itemType === 'title') {
      if (!(seller.titles || []).includes(itemData.title)) return { success: false, message: '⚠️ اللقب غير موجود' };
      seller.titles = seller.titles.filter(t => t !== itemData.title);
    } else {
      return { success: false, message: '⚠️ نوع غير صالح' };
    }

    const listing = new Listing({
      listingId: `lst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sellerId, sellerName: seller.name, guildId,
      itemType, itemData, price
    });

    seller.updatedAt = new Date();
    await listing.save();
    await seller.save();

    require('./errorLogger').economy(sellerId, 'list_item', 0, seller.coins);

    return {
      success: true, listingId: listing.listingId,
      message: `✅ تم عرض ${_getItemName(itemType, itemData)} للبيع بـ 🪙${price}`
    };
  }

  async buyItem(buyerId, guildId, listingId) {
    const listing = await Listing.findOne({ listingId, active: true });
    if (!listing) return { success: false, message: '⚠️ هذا العنصر غير متاح' };
    if (listing.sellerId === buyerId) return { success: false, message: '⚠️ لا يمكنك شراء عنصرك الخاص' };

    const buyer = await Player.findOne({ userId: buyerId, guildId });
    if (!buyer) return { success: false, message: '⚠️ يجب إنشاء لاعب أولاً' };

    const totalPrice = Math.ceil(listing.price * (1 + TAX_RATE));
    if (buyer.coins < totalPrice) return { success: false, message: `⚠️ تحتاج 🪙${totalPrice} (السعر + الضريبة)` };

    if (listing.itemType === 'card') {
      if (!buyer.cards) buyer.cards = [];
      buyer.cards.push({
        cardId: listing.itemData.cardId || new (require('mongoose').Types.ObjectId)(),
        name: listing.itemData.name, rarity: listing.itemData.rarity,
        acquiredAt: new Date()
      });
      buyer.cardsCount = (buyer.cardsCount || 0) + 1;
    } else if (listing.itemType === 'title') {
      if (!buyer.titles) buyer.titles = [];
      buyer.titles.push(listing.itemData.title);
    }

    buyer.coins -= totalPrice;
    buyer.updatedAt = new Date();

    const sellerAmount = Math.floor(listing.price * (1 - TAX_RATE));
    const seller = await Player.findOne({ userId: listing.sellerId, guildId });
    if (seller) {
      seller.coins += sellerAmount;
      seller.totalCoinsEarned = (seller.totalCoinsEarned || 0) + sellerAmount;
      await seller.save();
    }

    listing.active = false;
    await listing.save();
    await buyer.save();

    require('./errorLogger').economy(buyerId, 'buy_item', totalPrice, buyer.coins);
    return {
      success: true, listing,
      message: `✅ اشتريت **${_getItemName(listing.itemType, listing.itemData)}**\n🪙 دفع: ${totalPrice} | البائع حصل: ${sellerAmount}`
    };
  }

  async cancelListing(sellerId, listingId) {
    const listing = await Listing.findOne({ listingId });
    if (!listing) return { success: false, message: '⚠️ الإدراج غير موجود' };
    if (listing.sellerId !== sellerId) return { success: false, message: '⚠️ ليس إدراجك' };

    const seller = await Player.findOne({ userId: sellerId, guildId: listing.guildId });
    if (seller) {
      if (listing.itemType === 'card') {
        if (!seller.cards) seller.cards = [];
        seller.cards.push({
          cardId: listing.itemData.cardId || new (require('mongoose').Types.ObjectId)(),
          name: listing.itemData.name, rarity: listing.itemData.rarity,
          acquiredAt: new Date()
        });
        seller.cardsCount = (seller.cardsCount || 0) + 1;
      } else if (listing.itemType === 'title') {
        if (!seller.titles) seller.titles = [];
        seller.titles.push(listing.itemData.title);
      }
      await seller.save();
    }

    listing.active = false;
    await listing.save();
    return { success: true, message: '✅ تم إلغاء الإدراج واسترجاع العنصر' };
  }

  async getListingsByPage(guildId, page = 0, perPage = 6, filter = {}) {
    const query = { guildId, active: true };
    if (filter.type) query.itemType = filter.type;
    const all = await Listing.find(query).sort({ listedAt: -1 }).lean();
    const totalPages = Math.ceil(all.length / perPage) || 1;
    const start = page * perPage;
    const items = all.slice(start, start + perPage);

    return {
      items, page: page + 1, totalPages, total: all.length,
      display: items.length === 0
        ? 'لا توجد عناصر في السوق'
        : items.map((l, i) =>
          `**${start + i + 1}.** ${_getItemEmoji(l.itemType)} **${_getItemName(l.itemType, l.itemData)}**\n` +
          `└ 🪙${l.price} | ${l.sellerName} | \`${l.listingId.slice(0, 10)}...\``
        ).join('\n\n')
    };
  }

  async getSellerListings(sellerId) {
    return Listing.find({ sellerId, active: true }).lean();
  }

  async getActiveListingsCount(guildId) {
    return Listing.countDocuments({ guildId, active: true });
  }
}

function _getItemName(type, data) {
  switch (type) {
    case 'card': return `🎴 ${data.name || 'Card'} [${data.rarity || 'Common'}]`;
    case 'title': return `🎗️ ${data.title || 'Title'}`;
    case 'character': return `⭐ ${data.character || 'Character'}`;
    default: return 'Unknown';
  }
}

function _getItemEmoji(type) {
  switch (type) { case 'card': return '🎴'; case 'title': return '🎗️'; case 'character': return '⭐'; default: return '📦'; }
}

module.exports = new TransferMarketSystem();
