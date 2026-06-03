const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  listingId: { type: String, required: true, unique: true },
  sellerId: { type: String, required: true },
  sellerName: { type: String, required: true },
  guildId: { type: String, required: true },
  itemType: { type: String, enum: ['card', 'title', 'character'], required: true },
  itemData: { type: mongoose.Schema.Types.Mixed, required: true },
  price: { type: Number, required: true },
  listedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

listingSchema.index({ guildId: 1, active: 1 });
listingSchema.index({ sellerId: 1 });
listingSchema.index({ price: 1 });

module.exports = mongoose.model('Listing', listingSchema);
