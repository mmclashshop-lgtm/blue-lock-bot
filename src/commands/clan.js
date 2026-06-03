const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../database/models/Player');
const Clan = require('../database/models/Clan');
const config = require('../config/config');
const { ClanTournamentSystem, upgradeBase, depositToBank, withdrawFromBank, BASE_UPGRADES } = require('../systems/clanSystems');
const { divider, progressBar } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clan')
    .setDescription('إدارة العشيرة — إنشاء، معلومات، إيداع، سحب، تطوير، بطولات')
    .addSubcommand(sub => sub.setName('create').setDescription('إنشاء عشيرة جديدة').addStringOption(opt => opt.setName('name').setDescription('اسم العشيرة').setRequired(true)))
    .addSubcommand(sub => sub.setName('info').setDescription('عرض معلومات العشيرة'))
    .addSubcommand(sub => sub.setName('deposit').setDescription('إيداع عملات في خزينة العشيرة').addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ').setRequired(true)))
    .addSubcommand(sub => sub.setName('withdraw').setDescription('سحب عملات من خزينة العشيرة (القائد فقط)').addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ').setRequired(true)))
    .addSubcommand(sub => sub.setName('upgrade').setDescription('تطوير قاعدة العشيرة')
      .addStringOption(opt => opt.setName('type').setDescription('نوع التطوير')
        .setRequired(true)
        .addChoices(
          { name: '🏋️ منشأة التدريب', value: 'training_facility' },
          { name: '💰 الخزينة', value: 'treasury' },
          { name: '🪖 الثكنات', value: 'barracks' },
          { name: '🔍 مركز الاستكشاف', value: 'scouting' }
        )
      )
    )
    .addSubcommand(sub => sub.setName('tournament').setDescription('بطولات العشيرة')
      .addStringOption(opt => opt.setName('action').setDescription('الإجراء').setRequired(true)
        .addChoices(
          { name: 'إنشاء', value: 'create' },
          { name: 'انضمام', value: 'join' },
          { name: 'الحالة', value: 'status' }
        )
      )
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case 'create': return createClan(interaction);
      case 'info': return clanInfo(interaction);
      case 'deposit': return deposit(interaction);
      case 'withdraw': return withdraw(interaction);
      case 'upgrade': return upgrade(interaction);
      case 'tournament': return tournament(interaction);
    }
  }
};

async function createClan(interaction) {
  const name = interaction.options.getString('name');
  const existing = await Clan.findOne({ guildId: interaction.guildId, name });
  if (existing) return interaction.editReply({ content: '⚠️ اسم العشيرة موجود بالفعل' });

  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.editReply({ content: '⚠️ استخدم /start أولاً' });
  if (player.coins < 2000) return interaction.editReply({ content: '⚠️ تحتاج 🪙2000 لإنشاء عشيرة' });

  const clan = new Clan({
    name, guildId: interaction.guildId,
    leaderId: interaction.user.id,
    members: [interaction.user.id],
    balance: 0,
    baseUpgrades: { training_facility: 0, treasury: 0, barracks: 0, scouting: 0 }
  });
  await clan.save();

  player.coins -= 2000;
  player.clanId = clan._id.toString();
  player.clanRole = 'leader';
  await player.save();

  const embed = new EmbedBuilder()
    .setColor(config.colors.success)
    .setAuthor({ name: '🏰 تم إنشاء العشيرة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle(name)
    .setDescription(`**القائد:** ${interaction.user}\n**الأعضاء:** 1/∞`)
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}

async function clanInfo(interaction) {
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player || !player.clanId) return interaction.editReply({ content: '⚠️ أنت لست في عشيرة' });

  const clan = await Clan.findById(player.clanId);
  if (!clan) return interaction.editReply({ content: '⚠️ العشيرة غير موجودة' });

  const upgrades = clan.baseUpgrades || {};
  const upgradesStr = Object.entries(BASE_UPGRADES).map(([key, cfg]) => {
    const level = upgrades[key] || 0;
    return `${cfg.name}: المستوى ${level}/${cfg.levels}`;
  }).join('\n');

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: '🏰 ' + clan.name, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setDescription([
      `**القائد:** <@${clan.leaderId}>`,
      `**الأعضاء:** ${clan.members.length}`,
      divider(),
      `**الرصيد:** 🪙${clan.balance || 0}`,
      `**النقاط:** ${clan.points || 0}`,
      `**ف/خ:** ${clan.wins || 0}/${clan.losses || 0}`,
      divider(),
      '**تطوير القاعدة:**',
      upgradesStr
    ].join('\n'))
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}

async function deposit(interaction) {
  const amount = interaction.options.getInteger('amount');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player || !player.clanId) return interaction.editReply({ content: '⚠️ أنت لست في عشيرة' });
  const result = await depositToBank(player.clanId, interaction.user.id, amount);
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setDescription(result.message)
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}

async function withdraw(interaction) {
  const amount = interaction.options.getInteger('amount');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player || !player.clanId) return interaction.editReply({ content: '⚠️ أنت لست في عشيرة' });
  const result = await withdrawFromBank(player.clanId, interaction.user.id, amount);
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setDescription(result.message)
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}

async function upgrade(interaction) {
  const type = interaction.options.getString('type');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player || !player.clanId) return interaction.editReply({ content: '⚠️ أنت لست في عشيرة' });
  const result = await upgradeBase(player.clanId, type);
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setDescription(result.message)
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}

async function tournament(interaction) {
  const action = interaction.options.getString('action');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player || !player.clanId) return interaction.editReply({ content: '⚠️ أنت لست في عشيرة' });

  if (action === 'create') {
    const result = await ClanTournamentSystem.createTournament(interaction.guildId, player.clanId);
    const embed = new EmbedBuilder()
      .setColor(result.success ? config.colors.success : config.colors.danger)
      .setDescription(result.message)
      .setTimestamp();
    return interaction.editReply({ embeds: [embed] });
  }

  if (action === 'join') {
    const tournaments = Array.from(ClanTournamentSystem.activeTournaments.values())
      .filter(t => t.guildId === interaction.guildId && t.status === 'registering');
    if (tournaments.length === 0) return interaction.editReply({ content: '⚠️ لا توجد بطولات مفتوحة' });
    const result = await ClanTournamentSystem.joinTournament(tournaments[0].id, player.clanId);
    const embed = new EmbedBuilder()
      .setColor(result.success ? config.colors.success : config.colors.danger)
      .setDescription(result.message)
      .setTimestamp();
    return interaction.editReply({ embeds: [embed] });
  }

  if (action === 'status') {
    const tournaments = Array.from(ClanTournamentSystem.activeTournaments.values())
      .filter(t => t.guildId === interaction.guildId);
    if (tournaments.length === 0) return interaction.editReply({ content: '⚠️ لا توجد بطولات نشطة' });
    const t = tournaments[0];
    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setAuthor({ name: '🏆 بطولة العشيرة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(t.name)
      .setDescription([
        `**الحالة:** ${t.status === 'registering' ? 'تسجيل' : t.status === 'active' ? 'نشط' : t.status === 'completed' ? 'مكتمل' : t.status}`,
        `**الفرق:** ${t.teams.length}/${t.maxTeams}`,
        `**الجائزة:** 🪙${t.prize?.coins || 0}`,
        divider(),
        t.teams.map(team => `• ${team.name}`).join('\n')
      ].join('\n'))
      .setTimestamp();
    return interaction.editReply({ embeds: [embed] });
  }
}
