const {
  SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder
} = require('discord.js');
const Player = require('../database/models/Player');
const { RARITY_STYLES } = require('../data/gachaData');
const config = require('../config/config');
const {
  createInventoryEmbed,
  createEmptyInventoryEmbed
} = require('../utils/gachaCardEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('⚠ عرض مخزون اللاعبين الذين حصلت عليهم'),

  async execute(interaction) {
    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً باستخدام /start', flags: 64 });

    const cards = player.gachaPlayers || [];
    if (cards.length === 0) {
      const emptyEmbed = createEmptyInventoryEmbed(config);
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('pack_list').setLabel('📦 عرض الباقات').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
        );
      return interaction.reply({ embeds: [emptyEmbed], components: [row] });
    }

    const grouped = {};
    for (const card of cards) {
      if (!grouped[card.rarity]) grouped[card.rarity] = [];
      grouped[card.rarity].push(card);
    }

    const total = cards.length;
    const uniqueNames = [...new Set(cards.map(c => c.name))];
    const page = 0;

    const mainEmbed = createInventoryEmbed(player, cards, grouped, total, uniqueNames, page, config, interaction);

    const components = [];

    if (total > 10) {
      const navRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('inv_page_prev').setLabel('◀️ السابق').setStyle(ButtonStyle.Secondary).setDisabled(true),
          new ButtonBuilder().setCustomId('inv_page_next').setLabel('التالي ▶️').setStyle(ButtonStyle.Secondary)
        );
      components.push(navRow);
    }

    const sellRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('inventory_sell_select')
          .setPlaceholder('⚠ اختر لاعباً لبيعه من المخزون...')
          .addOptions(
            cards.slice(0, 25).map(c => ({
              label: `${c.name} — ${c.rating} OVR (${RARITY_STYLES[c.rarity]?.name || c.rarity})`,
              value: c.cardId,
              description: `🎯 ${c.position} | 🪙${c.value.toLocaleString()}`
            }))
          )
      );
    components.push(sellRow);

    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('pack_list').setLabel('📦 الباقات').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
      );
    components.push(backRow);

    await interaction.reply({ embeds: [mainEmbed], components });
  }
};
