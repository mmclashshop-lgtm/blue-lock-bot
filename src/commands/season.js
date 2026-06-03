const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../database/models/Player');
const Season = require('../database/models/Season');
const config = require('../config/config');
const { divider, progressBar } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('season')
    .setDescription('عرض الـ Season Pass والمكافآت'),

  async execute(interaction) {
    await interaction.deferReply();

    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return interaction.editReply({ content: '⚠️ استخدم /start أولاً' });

    const season = await Season.findOne({ guildId: 'global', active: true }).lean();
    if (!season) return interaction.editReply({ content: '⚠️ لا يوجد موسم نشط حالياً' });

    const sp = player.seasonPass || { level: 1, xp: 0, premium: false, claimedLevels: [] };
    const maxLevel = season.seasonPass?.levels || 100;
    const xpForNext = 100 * Math.pow(1.2, sp.level - 1);

    const embed = new EmbedBuilder()
      .setColor(sp.premium ? config.colors.warning : config.colors.info)
      .setAuthor({ name: `📅 ${season.name}`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('🎫 بطاقة الموسم')
      .setDescription([
        `**الموسم:** ${season.name}`,
        `**متبقي:** <t:${Math.floor(new Date(season.endDate).getTime() / 1000)}:R>`,
        divider(),
        `**مستواك:** ${sp.level}/${maxLevel}`,
        progressBar(sp.level, maxLevel, 20),
        `**XP:** ${Math.floor(sp.xp)}/${Math.floor(xpForNext)}`,
        spinner(),
        `**Premium:** ${sp.premium ? '✅ مفعل' : '❌ غير مفعل'}`,
        `**تم المطالبة:** ${sp.claimedLevels?.length || 0} مكافأة`
      ].join('\n'))
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('season_claim').setLabel('🎁 المطالبة بالمكافآت').setStyle(ButtonStyle.Primary)
        .setDisabled(sp.claimedLevels?.length >= sp.level),
      new ButtonBuilder().setCustomId('season_premium').setLabel(sp.premium ? '✅ مفعل' : '💎 تفعيل بريميوم')
        .setStyle(sp.premium ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setDisabled(sp.premium)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
};

function spinner() {
  const chars = ['▰', '▰', '▰', '▰', '▰', '▰', '▰', '▰', '▰', '▰'];
  return chars.join('');
}
