const {
  SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const Player = require('../database/models/Player');
const config = require('../config/config');
const { createCoinsEmbed } = require('../utils/gachaCardEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coins')
    .setDescription('⚠ عرض رصيدك من العملات'),

  async execute(interaction) {
    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً باستخدام /start', flags: 64 });

    const embed = createCoinsEmbed(player, interaction, config);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('pack_list').setLabel('📦 شراء باك').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
