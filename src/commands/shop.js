const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../database/models/Player');
const Item = require('../database/models/Item');
const config = require('../config/config');
const { divider } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('المتجر — شراء البطاقات، المعززات، الصناديق'),

  async execute(interaction) {
    await interaction.deferReply();

    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return interaction.editReply({ content: '⚠️ استخدم /start أولاً' });

    const items = await Item.find({ guildId: 'global', available: true }).lean();
    const categories = {};
    for (const item of items) {
      const cat = item.category || 'general';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    }

    const catNames = {
      characters: '🎭 الشخصيات',
      boosters: '⚡ المعززات',
      lootBoxes: '📦 الصناديق',
      cosmetics: '💫 التجميلية',
      general: 'عام'
    };

    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setAuthor({ name: '🛒 المتجر', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('🛒 المتجر')
      .setDescription([
        `🪙 رصيدك: \`${player.coins.toLocaleString()}\``,
        `💎 الجواهر: \`${player.gems || 0}\``,
        divider(),
        ...Object.entries(categories).map(([cat, catItems]) =>
          `**${catNames[cat] || cat}** (${catItems.length})`
        )
      ].join('\n'))
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId('shop_category_select').setPlaceholder('اختر تصنيف...')
        .addOptions(Object.entries(categories).map(([cat, catItems]) => ({
          label: `${catNames[cat] || cat} (${catItems.length})`,
          value: `shop_${cat}`,
          description: `عرض ${catNames[cat] || cat}`
        })))
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
};
