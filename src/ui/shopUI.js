const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, StringSelectMenuBuilder
} = require('discord.js');
const config = require('../config/config');
const { divider, bullet } = require('../utils/embeds');

const SHOP_ITEMS = [
  { id: 'common_box', name: 'صندوق عادي', price: 500, rarity: 'Common', category: 'boxes', description: 'يحتوي على بطاقة عادية' },
  { id: 'rare_box', name: 'صندوق نادر', price: 1500, rarity: 'Rare', category: 'boxes', description: 'فرصة للحصول على بطاقة نادرة' },
  { id: 'epic_box', name: 'صندوق ملحمي', price: 5000, rarity: 'Epic', category: 'boxes', description: 'فرصة للحصول على بطاقة ملحمية' },
  { id: 'legendary_box', name: 'صندوق أسطوري', price: 15000, rarity: 'Legendary', category: 'boxes', description: 'فرصة للحصول على بطاقة أسطورية' },
  { id: 'mythic_box', name: 'صندوق ميثيك', price: 50000, rarity: 'Mythic', category: 'boxes', description: 'فرصة للحصول على بطاقة ميثيك' },
  { id: 'training_boost', name: 'معزز تدريب', price: 1000, rarity: 'Rare', category: 'boosts', description: '×2 نقاط تدريب لمدة 24 ساعة' },
  { id: 'xp_boost', name: 'معزز خبرة', price: 2000, rarity: 'Rare', category: 'boosts', description: '×2 XP لمدة ساعة' },
  { id: 'coin_boost', name: 'معزز عملات', price: 3000, rarity: 'Epic', category: 'boosts', description: '×2 عملات لمدة ساعة' },
  { id: 'premium_pass', name: 'باس بريميوم', price: 25000, rarity: 'Legendary', category: 'special', description: 'ترقية الموسم إلى بريميوم' },
  { id: 'title_change', name: 'تغيير اللقب', price: 10000, rarity: 'Epic', category: 'special', description: 'تغيير لقبك' },
  { id: 'name_change', name: 'تغيير الاسم', price: 5000, rarity: 'Rare', category: 'special', description: 'تغيير اسم لاعبك' },
  { id: 'skill_reset', name: 'إعادة المهارات', price: 20000, rarity: 'Legendary', category: 'special', description: 'إعادة جميع نقاط المهارات' }
];

function createShopMenu(category = 'all') {
  let filtered = SHOP_ITEMS;
  if (category !== 'all') filtered = SHOP_ITEMS.filter(item => item.category === category);

  const itemsDesc = filtered.map(item =>
    `${_getRarityEmoji(item.rarity)} **${item.name}** — 🪙\`${item.price.toLocaleString()}\`\n${bullet(item.description)}`
  ).join('\n\n');

  const catName = category === 'all' ? 'جميع العناصر' : category === 'boxes' ? 'الصناديق' : category === 'boosts' ? 'المعززات' : 'العناصر الخاصة';

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('· · ────────────𖧧──────────── · ·\n🛒  المتجر\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      divider(),
      '',
      `**📦  ${catName}**`,
      '',
      itemsDesc || 'لا توجد عناصر',
      '',
      divider(),
      ''
    ].join('\n'))
    .setFooter({ text: '🪙  استخدم العملات لشراء العناصر  •  Blue Lock Shop' })
    .setTimestamp();

  const categoryRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('shop_category')
      .setPlaceholder('اختر الفئة')
      .addOptions([
        { label: '📦 جميع العناصر', value: 'all', description: 'جميع عناصر المتجر' },
        { label: '📦 الصناديق', value: 'boxes', description: 'صناديق الغنائم والبطاقات' },
        { label: '⚡ المعززات', value: 'boosts', description: 'معززات الخبرة والتدريب' },
        { label: '✨ عناصر خاصة', value: 'special', description: 'عناصر خاصة' }
      ])
  );

  const itemRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('buy_item')
      .setPlaceholder('اختر عنصراً للشراء')
      .addOptions(
        filtered.map(item => ({
          label: `${item.name} - 🪙${item.price.toLocaleString()}`,
          value: item.id,
          description: item.description.substring(0, 50)
        }))
      )
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [categoryRow, itemRow, backRow] };
}

function createLootBoxMenu() {
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('· · ────────────𖧧──────────── · ·\n📦  صناديق الغنائم\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      divider(),
      '',
      'اختر صندوقاً وافتحه للحصول على جوائز وبطاقات جديدة!',
      '',
      divider(),
      ''
    ].join('\n'))
    .addFields(
      { name: '🟤  صندوق عادي — 🪙500', value: bullet('بطاقة عادية مضمونة'), inline: true },
      { name: '🔵  صندوق نادر — 🪙1,500', value: bullet('فرصة بطاقة نادرة'), inline: true },
      { name: '🟣  صندوق ملحمي — 🪙5,000', value: bullet('فرصة بطاقة ملحمية'), inline: true },
      { name: '🟠  صندوق أسطوري — 🪙15,000', value: bullet('فرصة بطاقة أسطورية'), inline: true },
      { name: '🔴  صندوق ميثيك — 🪙50,000', value: bullet('فرصة بطاقة ميثيك'), inline: true }
    )
    .setFooter({ text: '⚽  اختر صندوقاً وافتحه للحصول على الجوائز  •  Blue Lock Loot' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('open_lootbox')
      .setPlaceholder('اختر صندوقاً لفتحه')
      .addOptions([
        { label: '🟤 صندوق عادي - 🪙500', value: 'common', description: 'احصل على بطاقة عادية' },
        { label: '🔵 صندوق نادر - 🪙1,500', value: 'rare', description: 'احصل على بطاقة نادرة' },
        { label: '🟣 صندوق ملحمي - 🪙5,000', value: 'epic', description: 'احصل على بطاقة ملحمية' },
        { label: '🟠 صندوق أسطوري - 🪙15,000', value: 'legendary', description: 'احصل على بطاقة أسطورية' },
        { label: '🔴 صندوق ميثيك - 🪙50,000', value: 'mythic', description: 'احصل على بطاقة ميثيك' }
      ])
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row, backRow] };
}

function getItemById(id) {
  return SHOP_ITEMS.find(item => item.id === id);
}

function getBoxPrice(type) {
  const prices = { common: 500, rare: 1500, epic: 5000, legendary: 15000, mythic: 50000 };
  return prices[type] || 500;
}

function getBoxRarity(type) {
  const rarities = { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', mythic: 'Mythic' };
  return rarities[type] || 'Common';
}

function _getRarityEmoji(rarity) {
  const emojis = { Common: '🟤', Rare: '🔵', Epic: '🟣', Legendary: '🟠', Mythic: '🔴', Divine: '💎' };
  return emojis[rarity] || '⬜';
}

module.exports = { createShopMenu, createLootBoxMenu, getItemById, getBoxPrice, getBoxRarity };