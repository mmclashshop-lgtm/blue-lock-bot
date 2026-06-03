const {
  SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder,
  ButtonBuilder, ButtonStyle
} = require('discord.js');
const Player = require('../database/models/Player');
const gacha = require('../systems/gacha');
const { DUPLICATE_COMPENSATION, RARITY_STYLES } = require('../data/gachaData');
const config = require('../config/config');
const {
  createSellEmbed,
  createNoDuplicatesEmbed
} = require('../utils/gachaCardEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('⚠ بيع لاعب مكرر من مخزونك مقابل عملات'),

  async execute(interaction) {
    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً باستخدام /start', flags: 64 });

    const cards = player.gachaPlayers || [];
    if (cards.length === 0) {
      return interaction.reply({ content: '⚠️ مخزونك فارغ! لا يوجد ما يمكن بيعه.', flags: 64 });
    }

    const duplicatable = cards.filter(c => {
      const count = cards.filter(x => x.name === c.name).length;
      return count > 1;
    });

    const uniqueDups = [...new Map(duplicatable.map(c => [c.name, c])).values()];

    if (uniqueDups.length === 0) {
      const embed = createNoDuplicatesEmbed(config);
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('pack_list').setLabel('📦 عرض الباقات').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
        );
      return interaction.reply({ embeds: [embed], components: [row] });
    }

    const sellEmbed = createSellEmbed(uniqueDups, cards, player.coins, config);

    const selectRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('sell_select_card')
          .setPlaceholder('⚠ اختر لاعباً لبيعه...')
          .addOptions(
            uniqueDups.slice(0, 25).map(c => ({
              label: `${c.name} — ${c.rating} OVR`,
              value: c.cardId,
              description: `💰 🪙${DUPLICATE_COMPENSATION[c.rarity] || 50}`
            }))
          )
      );

    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('inventory').setLabel('📂 المخزون').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [sellEmbed], components: [selectRow, backRow] });
  }
};
