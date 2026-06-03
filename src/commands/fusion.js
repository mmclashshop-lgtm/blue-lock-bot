const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../database/models/Player');
const config = require('../config/config');
const { fuseCards, getFusionPreview, FUSION_COST, RARITY_TIER } = require('../systems/cardFusion');
const { divider } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fusion')
    .setDescription('دمج بطاقتين للحصول على بطاقة بندرة أعلى')
    .addStringOption(opt => opt.setName('base_card').setDescription('معرف البطاقة الأساسية').setRequired(true))
    .addStringOption(opt => opt.setName('material_card').setDescription('معرف البطاقة المادية').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const baseCardId = interaction.options.getString('base_card');
    const materialCardId = interaction.options.getString('material_card');

    const result = await fuseCards(interaction.user.id, interaction.guildId, baseCardId, materialCardId);

    const embed = new EmbedBuilder()
      .setColor(result.success ? config.colors.success : config.colors.danger)
      .setAuthor({ name: result.success ? '⭐ تم الدمج بنجاح' : '❌ فشل الدمج', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('🔮 دمج البطاقات');

    if (result.success) {
      embed.setDescription([
        result.message,
        divider(),
        `Base card upgraded to **${result.card.rarity}**`,
        `Cost: 🪙${result.cost}`,
        divider(),
        '**New Stats:**',
        `⚡ Speed: \`${result.card.speed || '??'}\``,
        `🎯 Shooting: \`${result.card.shooting || '??'}\``,
        `👟 Passing: \`${result.card.passing || '??'}\``,
        `🛡 Defense: \`${result.card.defense || '??'}\``,
        `💪 Stamina: \`${result.card.stamina || '??'}\``
      ].join('\n'));
    } else {
      embed.setDescription(result.message);
    }

    embed.setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }
};
