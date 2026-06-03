const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../database/models/Player');
const config = require('../config/config');
const { divider } = require('../utils/embeds');

const marketListings = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('market')
    .setDescription('السوق العام — بيع وشراء البطاقات بين اللاعبين')
    .addSubcommand(sub => sub.setName('list').setDescription('عرض البطاقات المعروضة في السوق'))
    .addSubcommand(sub => sub
      .setName('sell')
      .setDescription('عرض بطاقة للبيع في السوق')
      .addStringOption(opt => opt.setName('card_id').setDescription('معرف البطاقة').setRequired(true))
      .addIntegerOption(opt => opt.setName('price').setDescription('السعر بالعملات').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('buy')
      .setDescription('شراء بطاقة من السوق')
      .addStringOption(opt => opt.setName('listing_id').setDescription('معرف العرض').setRequired(true))
    )
    .addSubcommand(sub => sub.setName('my').setDescription('عرض بطاقاتك المعروضة للبيع')),

  async execute(interaction) {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      if (marketListings.length === 0) return interaction.editReply({ content: '⚠️ السوق فارغ — لا توجد بطاقات معروضة' });

      const embed = new EmbedBuilder()
        .setColor(config.colors.warning)
        .setAuthor({ name: '🏪 السوق', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
        .setTitle('السوق العام')
        .setDescription(marketListings.map(l =>
          `\`${l.id.slice(0, 10)}\` — **${l.cardName}** — 🪙${l.price} — <@${l.sellerId}>`
        ).join('\n'))
        .setFooter({ text: `${marketListings.length} معروض` })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'sell') {
      const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
      if (!player) return interaction.editReply({ content: '⚠️ استخدم /start أولاً' });

      const cardId = interaction.options.getString('card_id');
      const price = interaction.options.getInteger('price');
      if (price < 50) return interaction.editReply({ content: '⚠️ الحد الأدنى للسعر 50 عملة' });

      const card = player.gachaPlayers.find(c => c.cardId === cardId || c._id?.toString() === cardId);
      if (!card) return interaction.editReply({ content: '⚠️ البطاقة غير موجودة في مخزونك' });

      const idx = player.gachaPlayers.findIndex(c => c.cardId === cardId || c._id?.toString() === cardId);
      player.gachaPlayers.splice(idx, 1);
      await player.save();

      const listing = {
        id: `mkt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sellerId: interaction.user.id,
        guildId: interaction.guildId,
        cardName: card.name,
        cardRarity: card.rarity,
        cardData: card,
        price,
        listedAt: Date.now()
      };
      marketListings.push(listing);

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setDescription(`✅ **${card.name}** معروضة للبيع بـ 🪙${price}\nID: \`${listing.id}\``)
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'buy') {
      const listingId = interaction.options.getString('listing_id');
      const listing = marketListings.find(l => l.id === listingId);
      if (!listing || listing.guildId !== interaction.guildId) return interaction.editReply({ content: '⚠️ العرض غير موجود' });
      if (listing.sellerId === interaction.user.id) return interaction.editReply({ content: '⚠️ لا يمكنك شراء بطاقتك الخاصة' });

      const buyer = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
      if (!buyer) return interaction.editReply({ content: '⚠️ استخدم /start أولاً' });
      if (buyer.coins < listing.price) return interaction.editReply({ content: `⚠️ تحتاج 🪙${listing.price}` });

      const seller = await Player.findOne({ userId: listing.sellerId, guildId: interaction.guildId });
      if (!seller) return interaction.editReply({ content: '⚠️ البائع غير موجود' });

      buyer.coins -= listing.price;
      seller.coins += listing.price;
      buyer.gachaPlayers.push(listing.cardData);
      await buyer.save();
      await seller.save();

      const idx = marketListings.indexOf(listing);
      marketListings.splice(idx, 1);

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setDescription(`✅ اشتريت **${listing.cardName}** بـ 🪙${listing.price}`)
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'my') {
      const myListings = marketListings.filter(l => l.sellerId === interaction.user.id);
      if (myListings.length === 0) return interaction.editReply({ content: '⚠️ ليس لديك بطاقات معروضة للبيع' });

      const embed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setAuthor({ name: '📋 قائمتي', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
        .setDescription(myListings.map(l =>
          `\`${l.id.slice(0, 10)}\` — **${l.cardName}** — 🪙${l.price}`
        ).join('\n'))
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }
  }
};
