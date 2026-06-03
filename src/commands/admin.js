const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  PermissionFlagsBits, StringSelectMenuBuilder
} = require('discord.js');
const config = require('../config/config');
const Player = require('../database/models/Player');
const Clan = require('../database/models/Clan');
const Season = require('../database/models/Season');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('لوحة المشرف (للمشرفين فقط)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      // التحقق من الصلاحيات
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          content: '❌ أنت لا تملك صلاحيات الإدارة!',
          flags: 64
        });
      }

      await this.showAdminPanel(interaction);
    } catch (error) {
      console.error('Admin command error:', error);
      await interaction.reply({
        content: '❌ حدث خطأ في فتح لوحة الإدارة.',
        flags: 64
      });
    }
  },

  async showAdminPanel(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('⚙️ لوحة الإدارة')
      .setDescription('مرحباً بك في لوحة الإدارة! اختر القسم الذي تريد إدارته.')
      .addFields(
        { name: '👥 **إدارة اللاعبين**', value: 'عرض وتعديل بيانات اللاعبين', inline: false },
        { name: '👜 **إدارة الفرق**', value: 'عرض وتعديل بيانات الفرق', inline: false },
        { name: '📅 **إدارة المواسم**', value: 'إنشاء وتعديل المواسم', inline: false },
        { name: '🏆 **إدارة البطولات**', value: 'إنشاء وتعديل البطولات', inline: false },
        { name: '💰 **إدارة الاقتصاد**', value: 'إضافة عملات وجواهر للاعبين', inline: false },
        { name: '📊 **الإحصائيات**', value: 'عرض إحصائيات السيرفر', inline: false },
        { name: '⚠️ **الحماية والأمان**', value: 'عرض السجلات والمنع', inline: false }
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({ text: `السيرفر: ${interaction.guild.name} | الوقت: ${new Date().toLocaleTimeString('ar-SA')}` })
      .setTimestamp();

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('admin_players')
          .setLabel('👥 اللاعبون')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('admin_clans')
          .setLabel('👜 الفرق')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('admin_seasons')
          .setLabel('📅 المواسم')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('admin_tournaments')
          .setLabel('🏆 البطولات')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('admin_economy')
          .setLabel('💰 الاقتصاد')
          .setStyle(ButtonStyle.Danger)
      );

    const buttons2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('admin_stats')
          .setLabel('📊 الإحصائيات')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('admin_security')
          .setLabel('⚠️ الأمان')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('admin_events')
          .setLabel('🎉 الأحداث')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({
      embeds: [embed],
      components: [buttons, buttons2],
      flags: 64
    });
  },

  async showPlayerManagement(interaction) {
    const guildPlayers = await Player.find({ guildId: interaction.guildId });

    const embed = new EmbedBuilder()
      .setColor('#FF6600')
      .setTitle('👥 إدارة اللاعبين')
      .setDescription(`إجمالي اللاعبين: ${guildPlayers.length}`)
      .addFields(
        { 
          name: '📊 الإحصائيات',
          value: `إجمالي المستوى: ${guildPlayers.reduce((sum, p) => sum + (p.level || 0), 0)}\n` +
                 `إجمالي المباريات: ${guildPlayers.reduce((sum, p) => sum + (p.matchesPlayed || 0), 0)}\n` +
                 `أعلى مستوى: ${Math.max(...guildPlayers.map(p => p.level || 0))}\n` +
                 `أعلى OVR: ${Math.max(...guildPlayers.map(p => p.calculateOVR() || 0))}`,
          inline: false
        }
      );

    // أفضل 5 لاعبين
    const topPlayers = guildPlayers
      .sort((a, b) => b.calculateOVR() - a.calculateOVR())
      .slice(0, 5);

    const topPlayersText = topPlayers
      .map((p, i) => `${i + 1}. ${p.name} - OVR: ${p.calculateOVR()}`)
      .join('\n');

    embed.addFields(
      { name: '🏆 أفضل 5 لاعبين', value: topPlayersText || 'لا يوجد لاعبون', inline: false }
    );

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('admin_search_player')
          .setLabel('🔍 البحث عن لاعب')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('admin_add_xp')
          .setLabel('➕ إضافة XP')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('admin_add_coins')
          .setLabel('🪙 إضافة عملات')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('admin_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({
      embeds: [embed],
      components: [buttons],
      flags: 64
    });
  },

  async showServerStats(interaction) {
    const players = await Player.find({ guildId: interaction.guildId });
    const clans = await Clan.find({ guildId: interaction.guildId });
    const totalMatches = players.reduce((sum, p) => sum + (p.matchesPlayed || 0), 0);
    const totalWins = players.reduce((sum, p) => sum + (p.wins || 0), 0);
    const totalCoins = players.reduce((sum, p) => sum + (p.coins || 0), 0);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('📊 إحصائيات السيرفر')
      .addFields(
        { name: '👥 **اللاعبون**', value: `${players.length} لاعب مسجل`, inline: true },
        { name: '👜 **الفرق**', value: `${clans.length} فريق مسجل`, inline: true },
        { name: '⚽ **المباريات**', value: `${totalMatches} مباراة تم لعبها`, inline: true },
        { name: '✅ **الانتصارات**', value: `${totalWins} انتصار إجمالي`, inline: true },
        { name: '🪙 **العملات**', value: `${totalCoins.toLocaleString('ar-SA')} عملة إجمالي`, inline: true },
        { name: '📈 **متوسط المستوى**', value: `${Math.round(players.reduce((sum, p) => sum + (p.level || 1), 0) / players.length)} مستوى`, inline: true }
      )
      .setFooter({ text: 'آخر تحديث الآن' })
      .setTimestamp();

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('admin_refresh_stats')
          .setLabel('🔄 تحديث')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('admin_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({
      embeds: [embed],
      components: [buttons],
      flags: 64
    });
  },

  async showClanManagement(interaction) {
    const clans = await Clan.find({ guildId: interaction.guildId });
    const embed = new EmbedBuilder()
      .setColor('#FF6600')
      .setTitle('👜 إدارة الفرق')
      .setDescription(`إجمالي الفرق: ${clans.length}`)
      .addFields(
        { name: '📊 الإحصائيات', value: clans.map((c, i) => `${i + 1}. **${c.name}** — ${c.members?.length || 0} أعضاء`).join('\n') || 'لا يوجد فرق', inline: false }
      )
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('admin_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [embed], components: [row], flags: 64 });
  },

  async showSeasonManagement(interaction) {
    const seasons = await Season.find({ guildId: interaction.guildId });
    const embed = new EmbedBuilder()
      .setColor('#FF6600')
      .setTitle('📅 إدارة المواسم')
      .setDescription(seasons.length > 0
        ? seasons.map((s, i) => `${i + 1}. ${s.name} — ${s.active ? '✅ نشط' : '❌ غير نشط'}`).join('\n')
        : 'لا يوجد مواسم حالياً. استخدم الأمر لإنشاء موسم جديد.')
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('admin_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [embed], components: [row], flags: 64 });
  },

  async showTournamentManagement(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF6600')
      .setTitle('🏆 إدارة البطولات')
      .setDescription('نظام البطولات قيد التطوير حالياً.')
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('admin_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [embed], components: [row], flags: 64 });
  },

  async showEconomyManagement(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('💰 إدارة الاقتصاد')
      .setDescription('اختر لاعباً لإضافة عملات أو جواهر.')
      .addFields(
        { name: '🪙 إضافة عملات', value: 'اضغط الزر لإظهار نافذة إدخال المبلغ', inline: false },
        { name: '💎 إضافة جواهر', value: 'اضغط الزر لإظهار نافذة إدخال المبلغ', inline: false }
      )
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('admin_add_coins')
          .setLabel('🪙 إضافة عملات')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('admin_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [embed], components: [row], flags: 64 });
  },

  async showSecurityPanel(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('⚠️ لوحة الأمان')
      .setDescription('سجلات الأمان والمراقبة.')
      .addFields(
        { name: '🛡️ حالة الحماية', value: '✅ النظام نشط', inline: true },
        { name: '📋 السجلات', value: 'جميع الأحداث يتم تسجيلها', inline: true }
      )
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('admin_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [embed], components: [row], flags: 64 });
  },

  async showEventsPanel(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF6600')
      .setTitle('🎉 إدارة الأحداث')
      .setDescription('الأحداث الحالية والقادمة.')
      .addFields(
        { name: '📅 الأحداث النشطة', value: 'لا يوجد أحداث نشطة حالياً', inline: false }
      )
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('admin_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [embed], components: [row], flags: 64 });
  }
};
