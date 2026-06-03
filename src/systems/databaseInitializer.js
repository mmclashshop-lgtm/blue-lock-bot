const Character = require('../database/models/Character');
const Season = require('../database/models/Season');
const Achievement = require('../database/models/Achievement');
const Item = require('../database/models/Item');
const CHARACTERS = require('../database/data/characters');

/**
 * تهيئة قاعدة البيانات بالبيانات الأساسية
 */
async function initializeDatabase() {
  try {
    console.log('🔧 جاري تهيئة قاعدة البيانات...');

    // تهيئة الشخصيات
    await initializeCharacters();
    console.log('✅ تم تهيئة الشخصيات');

    // تهيئة المواسم
    await initializeSeasons();
    console.log('✅ تم تهيئة المواسم');

    // تهيئة الإنجازات
    await initializeAchievements();
    console.log('✅ تم تهيئة الإنجازات');

    // تهيئة العناصر
    await initializeItems();
    console.log('✅ تم تهيئة العناصر');

    console.log('✨ تم تهيئة قاعدة البيانات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
  }
}

/**
 * تهيئة الشخصيات
 */
async function initializeCharacters() {
  try {
    const count = await Character.countDocuments();
    if (count > 0) return; // تم التهيئة بالفعل

    const charactersData = Object.values(CHARACTERS).map(char => ({
      ...char,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await Character.insertMany(charactersData);
  } catch (error) {
    if (error.code !== 11000) throw error; // تجاهل خطأ المفتاح المكرر
  }
}

/**
 * تهيئة المواسم
 */
async function initializeSeasons() {
  try {
    const currentSeason = await Season.findOne({ active: true });
    if (currentSeason) return; // موسم نشط بالفعل

    const newSeason = new Season({
      seasonId: `season_${Date.now()}`,
      seasonNumber: 1,
      guildId: 'global',
      name: 'موسم البدايات',
      description: 'الموسم الأول من Blue Lock Ultimate',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 أيام
      active: true,
      seasonPass: {
        levels: 100,
        freeRewards: Array.from({ length: 100 }, (_, i) => ({
          level: i + 1,
          reward: i % 5 === 0 ? 'gem' : 'coin',
          amount: (i + 1) * 10
        })),
        premiumRewards: Array.from({ length: 100 }, (_, i) => ({
          level: i + 1,
          reward: 'premium_item',
          amount: 1
        }))
      },
      baseXpMultiplier: 1.0,
      baseCoinMultiplier: 1.0,
      baseLootMultiplier: 1.0
    });

    await newSeason.save();
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
}

/**
 * تهيئة الإنجازات
 */
async function initializeAchievements() {
  try {
    const count = await Achievement.countDocuments();
    if (count > 0) return; // تم التهيئة بالفعل

    const { ACHIEVEMENTS } = require('../database/models/Achievement');
    await Achievement.insertMany(ACHIEVEMENTS);
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
}

/**
 * تهيئة العناصر
 */
async function initializeItems() {
  try {
    const count = await Item.countDocuments();
    if (count > 0) return; // تم التهيئة بالفعل

    const { ITEMS } = require('../database/models/Item');
    
    const allItems = [
      ...ITEMS.characters,
      ...ITEMS.boosters,
      ...ITEMS.lootBoxes
    ];

    await Item.insertMany(allItems);
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
}

module.exports = { initializeDatabase };
