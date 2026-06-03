const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../database/models/Player');
const Achievement = require('../database/models/Achievement');
const config = require('../config/config');
const { divider, progressBar } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievements')
    .setDescription('عرض إنجازاتك وتقدمك'),

  async execute(interaction) {
    await interaction.deferReply();

    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return interaction.editReply({ content: '⚠️ استخدم /start أولاً' });

    const allAchievements = await Achievement.find({}).lean();
    const unlocked = player.achievements?.map(a => a.id) || [];
    const unlockedCount = unlocked.length;

    const categories = {};
    for (const ach of allAchievements) {
      const cat = ach.category || 'general';
      if (!categories[cat]) categories[cat] = { total: 0, unlocked: 0, items: [] };
      categories[cat].total++;
      categories[cat].items.push(ach);
      if (unlocked.includes(ach._id?.toString() || ach.id)) categories[cat].unlocked++;
    }

    const catNames = { general: 'عام', matches: 'المباريات', economy: 'الاقتصاد', collection: 'المجموعة', clan: 'العشيرة' };

    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('· · ────────────𖧧──────────── · ·\n🏆  الإنجازات\n· · ────────────𖧧──────────── · ·')
      .setDescription([
        '',
        divider(),
        '',
        `**📊  تم فتح:** ${unlockedCount}/${allAchievements.length}`,
        progressBar(unlockedCount, allAchievements.length, 20),
        '',
        divider(),
        '',
        ...Object.entries(categories).map(([cat, data]) =>
          `**${catNames[cat] || cat}:** ${data.unlocked}/${data.total}`
        ),
        '',
        divider(),
        ''
      ].join('\n'))
      .setFooter({ text: 'أكمل المهام لفتح الإنجازات  •  Blue Lock' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId('ach_cat_select').setPlaceholder('اختر تصنيف...')
        .addOptions(Object.entries(categories).map(([cat, data]) => ({
          label: `${catNames[cat] || cat} (${data.unlocked}/${data.total})`,
          value: `ach_${cat}`,
          description: `عرض إنجازات ${catNames[cat] || cat}`
        })))
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
};
