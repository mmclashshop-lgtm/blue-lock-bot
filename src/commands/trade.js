const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../database/models/Player');
const config = require('../config/config');
const tradingSystem = require('../systems/tradingSystem');
const { divider } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trade')
    .setDescription('تبادل البطاقات أو العملات مع لاعب آخر')
    .addSubcommand(sub => sub
      .setName('send')
      .setDescription('إرسال عرض تبادل إلى لاعب')
      .addUserOption(opt => opt.setName('user').setDescription('اللاعب المستهدف').setRequired(true))
      .addStringOption(opt => opt.setName('offer_cards').setDescription('معرفات البطاقات المرسلة (مفصولة بفواصل)').setRequired(false))
      .addIntegerOption(opt => opt.setName('offer_coins').setDescription('العملات المرسلة').setRequired(false))
      .addStringOption(opt => opt.setName('request_cards').setDescription('معرفات البطاقات المطلوبة (مفصولة بفواصل)').setRequired(false))
      .addIntegerOption(opt => opt.setName('request_coins').setDescription('العملات المطلوبة').setRequired(false))
    )
    .addSubcommand(sub => sub
      .setName('accept')
      .setDescription('قبول عرض تبادل معلق')
      .addStringOption(opt => opt.setName('trade_id').setDescription('معرف التبادل').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('cancel')
      .setDescription('إلغاء عرض تبادل معلق')
      .addStringOption(opt => opt.setName('trade_id').setDescription('معرف التبادل').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('pending')
      .setDescription('عرض طلبات التبادل المعلقة')
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();

    if (sub === 'send') return sendTrade(interaction);
    if (sub === 'accept') return acceptTrade(interaction);
    if (sub === 'cancel') return cancelTrade(interaction);
    if (sub === 'pending') return pendingTrades(interaction);
  }
};

async function sendTrade(interaction) {
  const target = interaction.options.getUser('user');
  if (target.id === interaction.user.id) return interaction.editReply({ content: '⚠️ لا يمكنك التبادل مع نفسك' });

  const offerCards = interaction.options.getString('offer_cards')?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const offerCoins = interaction.options.getInteger('offer_coins') || 0;
  const requestCards = interaction.options.getString('request_cards')?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const requestCoins = interaction.options.getInteger('request_coins') || 0;

  if (offerCards.length === 0 && offerCoins === 0) return interaction.editReply({ content: '⚠️ يجب عرض بطاقة أو عملات على الأقل' });
  if (requestCards.length === 0 && requestCoins === 0) return interaction.editReply({ content: '⚠️ يجب طلب بطاقة أو عملات على الأقل' });

  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  const targetPlayer = await Player.findOne({ userId: target.id, guildId: interaction.guildId });
  if (!player || !targetPlayer) return interaction.editReply({ content: '⚠️ اللاعب غير موجود' });

  const offer = [];
  if (offerCoins > 0) {
    if (player.coins < offerCoins) return interaction.editReply({ content: '⚠️ عملات غير كافية' });
    offer.push({ type: 'coin', amount: offerCoins });
  }
  for (const cid of offerCards) {
    const card = player.cards.find(c => c.cardId?.toString() === cid || c._id?.toString() === cid);
    if (!card) return interaction.editReply({ content: `⚠️ البطاقة ${cid} غير موجودة في مخزونك` });
    offer.push({ type: 'card', id: card._id?.toString() || card.cardId?.toString() });
  }

  const request = [];
  if (requestCoins > 0) request.push({ type: 'coin', amount: requestCoins });
  for (const cid of requestCards) {
    const card = targetPlayer.cards.find(c => c.cardId?.toString() === cid || c._id?.toString() === cid);
    if (!card) return interaction.editReply({ content: `⚠️ البطاقة ${cid} غير موجودة في مخزون المستهدف` });
    request.push({ type: 'card', id: card._id?.toString() || card.cardId?.toString() });
  }

  const tradeId = tradingSystem.createTrade(interaction.user.id, target.id, interaction.guildId, offer, request);

  const embed = new EmbedBuilder()
    .setColor(config.colors.info)
    .setAuthor({ name: '🤝 عرض تبادل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setDescription([
      `${interaction.user} → ${target}`,
      divider(),
      `**المعروض:** ${offerCoins > 0 ? `🪙${offerCoins} ` : ''}${offerCards.length} بطاقة`,
      `**المطلوب:** ${requestCoins > 0 ? `🪙${requestCoins} ` : ''}${requestCards.length} بطاقة`,
      divider(),
      `معرف التبادل: \`${tradeId}\``,
      `ينتهي: <t:${Math.floor((Date.now() + 300000) / 1000)}:R>`
    ].join('\n'))
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function acceptTrade(interaction) {
  const tradeId = interaction.options.getString('trade_id');
  const result = await tradingSystem.acceptTrade(tradeId);
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '✅ تم قبول التبادل' : '❌ فشل التبادل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setDescription(result.message)
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}

async function cancelTrade(interaction) {
  const tradeId = interaction.options.getString('trade_id');
  const result = tradingSystem.cancelTrade(tradeId);
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.warning : config.colors.danger)
    .setAuthor({ name: result.success ? '🚫 تم إلغاء التبادل' : '❌ خطأ', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setDescription(result.message)
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}

async function pendingTrades(interaction) {
  const trades = tradingSystem.getPendingForUser(interaction.user.id);
  if (trades.length === 0) return interaction.editReply({ content: '⚠️ لا توجد تبادلات معلقة' });

  const embed = new EmbedBuilder()
    .setColor(config.colors.info)
    .setAuthor({ name: '📋 التبادلات المعلقة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setDescription(trades.map(t =>
      `\`${t.id}\` — <@${t.fromUserId}> ↔ <@${t.toUserId}> — ${t.status === 'pending' ? 'معلق' : t.status}`
    ).join('\n'))
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
