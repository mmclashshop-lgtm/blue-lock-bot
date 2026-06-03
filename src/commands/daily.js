const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../database/models/Player');
const config = require('../config/config');
const { claimDaily, getStreakDisplay, STREAK_REWARDS } = require('../systems/dailyRewards');
const { progressBar, divider } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('استلام مكافأتك اليومية — كلما زاد الstreak زادت المكافأة'),

  async execute(interaction) {
    await interaction.deferReply();

    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) {
      return interaction.editReply({ content: '⚠️ استخدم /start أولاً' });
    }

    const result = await claimDaily(player);

    if (!result.success) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.danger)
        .setAuthor({ name: '⏳ فترة التهدئة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
        .setTitle('⏳ تم الاستلام بالفعل')
        .setDescription(`Next claim <t:${Math.floor(result.cooldown / 1000)}:R>`)
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    const streakInfo = getStreakDisplay(player);
    const nextMilestone = streakInfo.nextMilestone
      ? Object.entries(STREAK_REWARDS).find(([day]) => parseInt(day) === streakInfo.nextMilestone)?.[1]
      : null;

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setAuthor({ name: '🎁 المكافأة اليومية', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(`🔥 ${result.streak} أيام متتالية!`)
      .setDescription([
        `✨ **+${result.xp}** XP`,
        `🪙 **+${result.coins}** Coins`,
        result.multiplier > 1 ? `⚡ **×${result.multiplier}** Streak Multiplier!` : '',
        divider(),
        `🔥 **السلسلة:** ${result.streak} ${result.streak > 1 ? 'أيام' : 'يوم'}`,
      ].filter(Boolean).join('\n'))
      .setTimestamp();

    if (nextMilestone) {
      embed.addFields({
        name: '🎯 الإنجاز التالي',
        value: `اليوم ${streakInfo.nextMilestone}: 🪙${nextMilestone.coins} + ✨${nextMilestone.xp} XP`,
        inline: false
      });
    }

    await interaction.editReply({ embeds: [embed] });
  }
};
