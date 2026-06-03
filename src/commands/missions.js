const { SlashCommandBuilder } = require('discord.js');
const Player = require('../database/models/Player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('missions')
    .setDescription('المهام اليومية والأسبوعية'),

  async execute(interaction) {
    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return interaction.reply({ content: '⚠️ استخدم /start أولاً', flags: 64 });

    const { createMissionsMenu } = require('../ui/mainMenu');
    const missions = require('../systems/missions');
    await missions.resetDailyMissions(player);
    await missions.resetWeeklyMissions(player);
    await interaction.reply(createMissionsMenu(player));
  }
};
