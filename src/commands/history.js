const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Player = require('../database/models/Player');
const MatchHistory = require('../database/models/MatchHistory');
const config = require('../config/config');
const { divider } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('عرض سجل مبارياتك الأخيرة'),

  async execute(interaction) {
    await interaction.deferReply();

    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return interaction.editReply({ content: '⚠️ استخدم /start أولاً' });

    const matches = await MatchHistory.find({
      $or: [{ player1Id: interaction.user.id }, { player2Id: interaction.user.id }],
      guildId: interaction.guildId
    }).sort({ createdAt: -1 }).limit(10).lean();

    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setAuthor({ name: '📜 سجل المباريات', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('⚔️ سجل المباريات')
      .setDescription(matches.length === 0
        ? 'لا توجد مباريات بعد — استخدم `/matchmaking` للبدء'
        : matches.map(m => {
            const isWin = (m.player1Id === interaction.user.id && m.result === 'p1_win') ||
                          (m.player2Id === interaction.user.id && m.result === 'p2_win');
            const isDraw = m.result === 'draw';
            const icon = isWin ? '✅' : isDraw ? '🤝' : '❌';
            const score = `${m.score?.p1 || 0} - ${m.score?.p2 || 0}`;
            const date = m.createdAt ? `<t:${Math.floor(new Date(m.createdAt).getTime() / 1000)}:R>` : 'قديم';
            return `${icon} ${score} — ${date}`;
          }).join('\n'))
      .addFields(
        { name: '📊 الإحصائيات', value: [
          `✅ الانتصارات: \`${player.wins || 0}\``,
          `❌ الخسائر: \`${player.losses || 0}\``,
          `🤝 التعادلات: \`${player.draws || 0}\``,
          `⚔️ الإجمالي: \`${player.matchesPlayed || 0}\``
        ].join('\n'), inline: false }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
