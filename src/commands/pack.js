const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder
} = require('discord.js');
const Player = require('../database/models/Player');
const gacha = require('../systems/gacha');
const { PACKS, RARITY_STYLES } = require('../data/gachaData');
const config = require('../config/config');
const {
  createCardEmbed,
  createDuplicateEmbed,
  createPackListEmbed,
  createBuyConfirmEmbed
} = require('../utils/gachaCardEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pack')
    .setDescription('⚠ فتح أو شراء الباقات')
    .addSubcommand(sub =>
      sub.setName('open')
        .setDescription('⚠ افتح باك')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('⚠ نوع الباك')
            .setRequired(true)
            .addChoices(
              { name: '📦 Basic Pack - 🪙500', value: 'basic' },
              { name: '🔵 Rare Pack - 🪙1,500', value: 'rare' },
              { name: '🟣 Epic Pack - 🪙4,000', value: 'epic' },
              { name: '🟠 Legendary Pack - 🪙12,000', value: 'legendary' },
              { name: '💎 World Class Pack - 🪙35,000', value: 'world-class' }
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('buy')
        .setDescription('⚠ اشتري باك')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('⚠ نوع الباك')
            .setRequired(true)
            .addChoices(
              { name: '📦 Basic Pack - 🪙500', value: 'basic' },
              { name: '🔵 Rare Pack - 🪙1,500', value: 'rare' },
              { name: '🟣 Epic Pack - 🪙4,000', value: 'epic' },
              { name: '🟠 Legendary Pack - 🪙12,000', value: 'legendary' },
              { name: '💎 World Class Pack - 🪙35,000', value: 'world-class' }
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('⚠ عرض كل الباقات المتاحة')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'list') return this.handleList(interaction);
    if (sub === 'open') return this.handleOpen(interaction);
    if (sub === 'buy') return this.handleBuy(interaction);
  },

  async handleList(interaction) {
    const embed = createPackListEmbed(PACKS, config);

    const buyRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('pack_buy_select')
          .setPlaceholder('⚠ اختر باقتك...')
          .addOptions(
            Object.entries(PACKS).map(([key, pack]) => ({
              label: `${pack.emoji} ${pack.name} - 🪙${pack.price.toLocaleString()}`,
              value: key,
              description: pack.description.substring(0, 50)
            }))
          )
      );

    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('cards_filter_all').setLabel('🏛️ Card Museum').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [buyRow, backRow] });
  },

  async handleOpen(interaction) {
    const packKey = interaction.options.getString('type');
    const result = await gacha.openPack(interaction.user.id, interaction.guildId, packKey);
    if (!result.success) return interaction.reply({ content: result.message, flags: 64 });

    const pack = PACKS[packKey];

    if (result.isDuplicate) {
      const dupEmbed = createDuplicateEmbed(pack.name, pack.emoji, result.rarity, result.message);
      const openAgain = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId(`pack_open_${packKey}`).setLabel(`${pack.emoji} افتح مرة أخرى`).setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('pack_list').setLabel('📋 عرض الباقات').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
        );
      return interaction.reply({ embeds: [dupEmbed], components: [openAgain] });
    }

    const cardEmbed = createCardEmbed(result.card, pack.name, result.rarity, pack.emoji, result.card.image);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId(`pack_open_${packKey}`).setLabel(`${pack.emoji} افتح مرة أخرى`).setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('inventory').setLabel('📂 المخزون').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('pack_list').setLabel('📋 الباقات').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [cardEmbed], components: [row] });
  },

  async handleBuy(interaction) {
    const packKey = interaction.options.getString('type');
    const result = await gacha.buyPack(interaction.user.id, interaction.guildId, packKey);
    if (!result.success) return interaction.reply({ content: result.message, flags: 64 });

    const pack = PACKS[packKey];
    const embed = createBuyConfirmEmbed(pack, result.coins, result.canAfford);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`pack_buy_confirm_${packKey}`)
          .setLabel('✅ Confirm')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!result.canAfford),
        new ButtonBuilder()
          .setCustomId('pack_list')
          .setLabel('📋 الباقات')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
