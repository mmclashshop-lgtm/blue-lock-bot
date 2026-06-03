const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Player = require('../database/models/Player');
const storyMode = require('../systems/storyMode');
const { createMainStoryEmbed, createChapterSelectEmbed } = require('../ui/storyUI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('story')
    .setDescription('📖 وضع القصة - اتبع رحلة بلو لوك'),

  async execute(interaction) {
    await interaction.deferReply();

    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return interaction.editReply({ content: '⚠️ استخدم /start أولاً' });

    const mainEmbed = createMainStoryEmbed(player);
    const selectMenu = require('../ui/storyUI').createPartSelectEmbed();
    await interaction.editReply({ embeds: [...mainEmbed.embeds, ...selectMenu.embeds], components: selectMenu.components });
  }
};