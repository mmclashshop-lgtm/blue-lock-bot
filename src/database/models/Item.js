const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },

  // Item Type
  type: {
    type: String,
    enum: ['Character', 'Effect', 'Title', 'LootBox', 'Booster', 'Card', 'Cosmetic'],
    required: true
  },

  // Rarity System
  rarity: {
    type: String,
    enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical', 'Divine', 'Selfish'],
    default: 'Common'
  },

  // Price
  price: {
    coins: { type: Number, default: 0 },
    gems: { type: Number, default: 0 }
  },

  // For Boosters
  boosterType: { type: String, enum: ['Training', 'XP', 'Coins', 'Loot'] },
  boosterMultiplier: { type: Number, default: 1.5 },
  boosterDuration: { type: Number, default: 3600 }, // in seconds

  // For LootBoxes
  lootBoxType: String,
  lootBoxContents: [{
    itemId: String,
    chance: Number, // 0-100
    quantity: Number
  }],

  // For Characters
  characterStats: {
    shooting: { type: Number, default: 0 },
    dribbling: { type: Number, default: 0 },
    passing: { type: Number, default: 0 },
    vision: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    stamina: { type: Number, default: 0 },
    finishing: { type: Number, default: 0 },
    control: { type: Number, default: 0 },
    reaction: { type: Number, default: 0 }
  },

  // For Titles
  titleText: { type: String },
  titleColor: { type: String },

  // Availability
  available: { type: Boolean, default: true },
  limitedTime: { type: Boolean, default: false },
  startDate: { type: Date },
  endDate: { type: Date },

  // Stock (if limited)
  limitedStock: { type: Boolean, default: false },
  totalStock: { type: Number },
  currentStock: { type: Number },

  // Tradeable
  tradeable: { type: Boolean, default: false },
  giftable: { type: Boolean, default: true },

  // Special
  requirementLevel: { type: Number, default: 0 },
  requirementRank: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Predefined items
const ITEMS = {
  // Characters
  characters: [
    {
      itemId: 'char_isagi',
      name: 'إيساغي يويتشي',
      type: 'Character',
      rarity: 'Legendary',
      description: 'المهاجم المتوازن - خبير في تحليل اللعبة',
      price: { gems: 300 },
      characterStats: {
        shooting: 88, dribbling: 86, passing: 82, vision: 90,
        speed: 84, defense: 65, stamina: 88, finishing: 89,
        control: 87, reaction: 89
      }
    },
    {
      itemId: 'char_rin',
      name: 'رين إيتوشي',
      type: 'Character',
      rarity: 'Legendary',
      description: 'العبقري التقني - دقة لا تقبل المنافسة',
      price: { gems: 300 },
      characterStats: {
        shooting: 92, dribbling: 91, passing: 88, vision: 85,
        speed: 83, defense: 68, stamina: 86, finishing: 94,
        control: 95, reaction: 92
      }
    },
    {
      itemId: 'char_bachira',
      name: 'باشيرا ميجورو',
      type: 'Character',
      rarity: 'Epic',
      description: 'البطاقة البرية - عفويتها لا تضاهى',
      price: { gems: 250 },
      characterStats: {
        shooting: 85, dribbling: 92, passing: 78, vision: 82,
        speed: 90, defense: 60, stamina: 92, finishing: 84,
        control: 88, reaction: 85
      }
    },
    {
      itemId: 'char_nagi',
      name: 'ناجي سيشيرو',
      type: 'Character',
      rarity: 'Legendary',
      description: 'خبير الدقة - لعب حسابي مثالي',
      price: { gems: 280 },
      characterStats: {
        shooting: 90, dribbling: 89, passing: 93, vision: 88,
        speed: 70, defense: 72, stamina: 75, finishing: 92,
        control: 94, reaction: 88
      }
    },
    {
      itemId: 'char_kaiser',
      name: 'كايزر مايكل',
      type: 'Character',
      rarity: 'Mythical',
      description: 'الشامل - المثالي في كل شيء',
      price: { gems: 400 },
      characterStats: {
        shooting: 95, dribbling: 93, passing: 90, vision: 88,
        speed: 89, defense: 85, stamina: 91, finishing: 96,
        control: 92, reaction: 93
      }
    }
  ],

  // Boosters
  boosters: [
    {
      itemId: 'boost_training_3h',
      name: 'معزز التدريب (3 ساعات)',
      type: 'Booster',
      rarity: 'Common',
      boosterType: 'Training',
      boosterMultiplier: 2.0,
      boosterDuration: 10800,
      price: { coins: 500 }
    },
    {
      itemId: 'boost_xp_24h',
      name: 'معزز XP (24 ساعة)',
      type: 'Booster',
      rarity: 'Rare',
      boosterType: 'XP',
      boosterMultiplier: 2.5,
      boosterDuration: 86400,
      price: { gems: 50 }
    }
  ],

  // LootBoxes
  lootBoxes: [
    {
      itemId: 'box_bronze',
      name: 'صندوق برونزي',
      type: 'LootBox',
      rarity: 'Common',
      price: { coins: 100 },
      lootBoxContents: [
        { itemId: 'card_common', chance: 70, quantity: 1 },
        { itemId: 'card_rare', chance: 25, quantity: 1 },
        { itemId: 'card_epic', chance: 5, quantity: 1 }
      ]
    },
    {
      itemId: 'box_legendary',
      name: 'صندوق أسطوري',
      type: 'LootBox',
      rarity: 'Legendary',
      price: { gems: 100 },
      lootBoxContents: [
        { itemId: 'card_epic', chance: 40, quantity: 1 },
        { itemId: 'card_legendary', chance: 50, quantity: 1 },
        { itemId: 'card_mythical', chance: 10, quantity: 1 }
      ]
    }
  ]
};

module.exports = mongoose.model('Item', itemSchema);
module.exports.ITEMS = ITEMS;
