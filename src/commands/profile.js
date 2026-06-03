const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const Player = require('../database/models/Player');
const config = require('../config/config');
const { progressBar, divider } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('عرض بروفايلك أو بروفايل لاعب آخر')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('اختر لاعباً (اختياري)')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const targetUser = interaction.options.getUser('user') || interaction.user;
      
      const player = await Player.findOne({
        userId: targetUser.id,
        guildId: interaction.guildId
      });

      if (!player) {
        return interaction.editReply({
          content: `⚠️ اللاعب **${targetUser.username}** لم ينشئ حسابه بعد! استخدم /start`
        });
      }

      const ovr = player.calculateOVR();
      const stats = player.stats;
      const rankColor = this.getRankColor(player.rank);
      const createdAt = player.createdAt?.getTime() ? Math.floor(player.createdAt.getTime() / 1000) : Math.floor(Date.now() / 1000);
      const xpBar = progressBar(player.xp || 0, player.xpToNext || 100);
      const winRate = this.getWinRate(player);

      const embed = new EmbedBuilder()
        .setColor(rankColor)
        .setTitle(`👤 ${player.name}`)
        .setDescription([
          '',
          `${divider()}`,
          '',
          `🆔 <@${player.userId}>  •  📅 <t:${createdAt}:D>`,
          '',
          `${divider()}`,
          ''
        ].join('\n'))
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: '📋 الإحصائيات',
            value: [
              `🎮 Level \`${player.level}\`  🏆 Rank \`${player.rank}\``,
              `⚡ OVR \`${ovr}/99\`  🎯 ${player.position}  ⭐ ${player.character}`,
              `💪 Potential \`${player.potential?.type || 'Normal'}\``
            ].join('\n'),
            inline: false
          },
          {
            name: '⚔️ سجل المباريات',
            value: [
              `📊 \`${player.matchesPlayed || 0}\` matches  •  ✅ \`${player.wins || 0}\`W  ❌ \`${player.losses || 0}\`L  🤝 \`${player.draws || 0}\`D`,
              `📈 Win Rate \`${winRate}%\`  🔥 Best Streak \`${player.bestWinStreak || 0}\``,
              `⚽ \`${player.goalsScored || 0}\` scored  •  🛡️ \`${player.goalsConceded || 0}\` conceded`
            ].join('\n'),
            inline: false
          },
          {
            name: '💰 الاقتصاد',
            value: [
              `🪙 \`${player.coins || 0}\`  •  💎 \`${player.gems || 0}\``,
              `✨ XP ${xpBar} \`${player.xp || 0}/${player.xpToNext || 100}\``,
              `📈 Total XP \`${player.totalXP || 0}\``
            ].join('\n'),
            inline: false
          },
          {
            name: '📊 المهارات',
            value: [
              `📍 Shooting  ${progressBar(stats.shooting || 50, 99)} \`${stats.shooting || 50}\``,
              `🎯 Dribbling ${progressBar(stats.dribbling || 50, 99)} \`${stats.dribbling || 50}\``,
              `🎪 Passing   ${progressBar(stats.passing || 50, 99)} \`${stats.passing || 50}\``,
              `👁️ Vision    ${progressBar(stats.vision || 50, 99)} \`${stats.vision || 50}\``,
              `⚡ Speed     ${progressBar(stats.speed || 50, 99)} \`${stats.speed || 50}\``,
              `🛡️ Defense   ${progressBar(stats.defense || 50, 99)} \`${stats.defense || 50}\``
            ].join('\n'),
            inline: true
          },
          {
            name: '\u200b',
            value: [
              `💨 Stamina   ${progressBar(stats.stamina || 50, 99)} \`${stats.stamina || 50}\``,
              `🎯 Finishing ${progressBar(stats.finishing || 50, 99)} \`${stats.finishing || 50}\``,
              `🎮 Control   ${progressBar(stats.control || 50, 99)} \`${stats.control || 50}\``,
              `🔄 Reaction  ${progressBar(stats.reaction || 50, 99)} \`${stats.reaction || 50}\``,
              `💪 Ego       ${progressBar(stats.ego || 50, 99)} \`${stats.ego || 50}\``
            ].join('\n'),
            inline: true
          }
        )
        .setFooter({ 
          text: `⚽ Blue Lock Ultimate  •  ${ovr}/99 OVR`, 
          iconURL: interaction.client.user.displayAvatarURL() 
        })
        .setTimestamp();

      if (player.achievements?.length > 0) {
        const achievementList = player.achievements.slice(0, 5)
          .map(a => `🏆 \`${a.id}\``)
          .join('\n');
        embed.addFields({ name: '🎖️ الإنجازات', value: achievementList, inline: false });
      }

      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('view_stats_detailed')
            .setLabel('📊 إحصائيات مفصلة')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('view_achievements')
            .setLabel('🏆 الإنجازات')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('view_items')
            .setLabel('📦 المجموعة')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.editReply({ embeds: [embed], components: [buttons] });

    } catch (error) {
      console.error('Profile command error:', error);
      await interaction.editReply({
        content: '❌ حدث خطأ في عرض البروفايل. حاول مرة أخرى.'
      });
    }
  },

  getRankColor(rank) {
    const rankColors = {
      'Bronze': '#CD7F32',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Platinum': '#E5E4E2',
      'Diamond': '#B9F2FF',
      'Master': '#FF00FF',
      'Champion': '#FF4500',
      'Elite': '#00FFFF',
      'King': '#FFD700'
    };
    return rankColors[rank] || '#808080';
  },

  getWinRate(player) {
    if ((player.wins || 0) + (player.losses || 0) === 0) return 0;
    return Math.round(((player.wins || 0) / ((player.wins || 0) + (player.losses || 0))) * 100);
  }
};
