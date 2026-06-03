const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../database/models/Player');
const config = require('../config/config');
const matchmakingQueue = require('../systems/matchmakingQueue');
const { divider } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('matchmaking')
    .setDescription('الدخول أو الخروج من طابور المباريات — العب ضد لاعبين آخرين')
    .addSubcommand(sub => sub
      .setName('join')
      .setDescription('الدخول في طابور المباريات')
    )
    .addSubcommand(sub => sub
      .setName('leave')
      .setDescription('الخروج من طابور المباريات')
    )
    .addSubcommand(sub => sub
      .setName('status')
      .setDescription('التحقق من حالة الطابور')
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();

    if (sub === 'join') {
      const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
      if (!player) return interaction.editReply({ content: '⚠️ استخدم /start أولاً' });

      const result = matchmakingQueue.joinQueue(interaction.user.id, interaction.guildId, interaction);
      const embed = new EmbedBuilder()
        .setColor(result.success ? config.colors.success : config.colors.danger)
        .setAuthor({ name: '⚔️ البحث عن مباراة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
        .setDescription(result.message)
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'leave') {
      const result = matchmakingQueue.leaveQueue(interaction.user.id);
      const embed = new EmbedBuilder()
        .setColor(result.success ? config.colors.warning : config.colors.danger)
        .setAuthor({ name: '⚔️ البحث عن مباراة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
        .setDescription(result.message)
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'status') {
      const status = matchmakingQueue.getQueueStatus(interaction.guildId);
      const embed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setAuthor({ name: '⚔️ حالة الطابور', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
        .setDescription([
          `👥 **في الطابور:** ${status.inQueue}`,
          status.inQueue > 0 ? `اللاعبون: ${status.players.join(', ')}` : '',
          divider(),
          `⏱ ${status.estimatedWait}`
        ].filter(Boolean).join('\n'))
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }
  }
};
