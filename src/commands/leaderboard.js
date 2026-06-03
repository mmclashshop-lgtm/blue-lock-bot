const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const LeaderboardSystem = require('../systems/leaderboard');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('لوحة المتصدرين — أفضل اللاعبين والعشائر')
    .addStringOption(opt => opt.setName('type').setDescription('نوع الترتيب')
      .addChoices(
        { name: 'التقييم (OVR)', value: 'ovr' },
        { name: 'المستوى', value: 'level' },
        { name: 'الانتصارات', value: 'wins' },
        { name: 'العملات', value: 'coins' },
        { name: 'العشائر', value: 'clans' }
      ).setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();
    const type = interaction.options.getString('type') || 'ovr';

    if (type === 'clans') {
      const clans = await LeaderboardSystem.getClanLeaderboard(interaction.guildId);
      const embed = LeaderboardSystem.createClanLeaderboardEmbed(clans);
      return interaction.editReply({ embeds: [embed] });
    }

    const players = await LeaderboardSystem.getPlayerLeaderboard(interaction.guildId, type);
    if (players.length === 0) return interaction.editReply({ content: '⚠️ لا يوجد لاعبون بعد' });

    const embed = LeaderboardSystem.createPlayerLeaderboardEmbed(players, type);
    const row = LeaderboardSystem.createLeaderboardSelectMenu();

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
};
