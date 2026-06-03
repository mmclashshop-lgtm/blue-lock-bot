const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config/config');
const backupSystem = require('../systems/backupSystem');
const { divider } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('إدارة النسخ الاحتياطي (للمشرفين فقط)')
    .addSubcommand(sub => sub.setName('create').setDescription('إنشاء نسخة احتياطية جديدة'))
    .addSubcommand(sub => sub.setName('list').setDescription('عرض النسخ الاحتياطية'))
    .addSubcommand(sub => sub.setName('restore').setDescription('استعادة نسخة احتياطية').addStringOption(opt => opt.setName('id').setDescription('معرف النسخة').setRequired(true))),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.member?.permissions?.has('Administrator')) {
      return interaction.editReply({ content: '⚠️ هذا الأمر للمشرفين فقط' });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      const result = await backupSystem.createBackup();
      const embed = new EmbedBuilder()
        .setColor(result.success ? config.colors.success : config.colors.danger)
        .setAuthor({ name: '💾 النسخ الاحتياطي', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
        .setDescription(result.message)
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'list') {
      const backups = backupSystem.getBackups();
      const embed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setAuthor({ name: '📋 النسخ الاحتياطية', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
        .setTitle('النسخ الاحتياطية')
        .setDescription(backups.length === 0
          ? 'لا توجد نسخ احتياطية'
          : backups.map((b, i) => `\`${b.id}\` — ${new Date(b.createdAt).toLocaleString()} — ${(b.size / 1024).toFixed(1)} KB`).join('\n'))
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'restore') {
      const id = interaction.options.getString('id');
      const result = await backupSystem.restoreBackup(id);
      const embed = new EmbedBuilder()
        .setColor(result.success ? config.colors.success : config.colors.danger)
        .setAuthor({ name: '🔄 استعادة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
        .setDescription(result.message)
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }
  }
};
