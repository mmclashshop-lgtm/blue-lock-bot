const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const Player = require('../database/models/Player');
const { RARITY_STYLES } = require('../data/gachaData');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('player')
    .setDescription('⚠ عرض بطاقة لاعب معينة من مخزونك')
    .addStringOption(opt =>
      opt.setName('card_id')
        .setDescription('⚠ Card ID (آخر 8 أحرف)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً باستخدام /start', flags: 64 });

    const cards = player.gachaPlayers || [];
    if (cards.length === 0) {
      return interaction.reply({ content: '⚠️ مخزونك فارغ! استخدم `/pack open` أولاً', flags: 64 });
    }

    const cardIdInput = interaction.options.getString('card_id');
    let targetCard;

    if (cardIdInput) {
      targetCard = cards.find(c => c.cardId.endsWith(cardIdInput) || c.cardId.startsWith(cardIdInput));
      if (!targetCard) {
        return interaction.reply({ content: `⚠️ لا توجد بطاقة بهذا الـ ID: \`${cardIdInput}\``, flags: 64 });
      }
    } else {
      const best = { mythic: null, legendary: null, epic: null, rare: null, common: null };
      const order = ['mythic', 'legendary', 'epic', 'rare', 'common'];
      for (const card of cards) {
        if (!best[card.rarity] || card.rating > best[card.rarity].rating) {
          best[card.rarity] = card;
        }
      }
      for (const r of order) {
        if (best[r]) { targetCard = best[r]; break; }
      }
      if (!targetCard) targetCard = cards[0];
    }

    const rStyle = RARITY_STYLES[targetCard.rarity];
    const stars = targetCard.rating >= 95 ? '★★★★★' : targetCard.rating >= 85 ? '★★★★☆' : targetCard.rating >= 75 ? '★★★☆☆' : targetCard.rating >= 65 ? '★★☆☆☆' : '★☆☆☆☆';

    const cardEmbed = new EmbedBuilder()
      .setColor(rStyle.color)
      .setAuthor({
        name: `🎴  ${targetCard.name}  •  ${rStyle.emoji} ${rStyle.name.toUpperCase()}`,
        iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
      })
      .setTitle(`${targetCard.name}`)
      .setThumbnail(targetCard.image || 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png')
      .setDescription([
        '',
        `${'─'.repeat(28)}`,
        '',
        `╭${'─'.repeat(22)}╮`,
        `│  ⚡ **OVR ${targetCard.rating}**  ${stars}  │`,
        `│  ${rStyle.emoji}  **${rStyle.name}**${' '.repeat(17 - rStyle.name.length)}│`,
        `│  🎯  **${targetCard.position}**${' '.repeat(15 - targetCard.position.length)}│`,
        `╰${'─'.repeat(22)}╯`,
        '',
        `${'─'.repeat(28)}`,
        ''
      ].join('\n'))
      .addFields(
        { name: `📊 Rating`, value: `\`${targetCard.rating}/99\``, inline: true },
        { name: `🎯 Position`, value: `\`${targetCard.position}\``, inline: true },
        { name: `💎 Rarity`, value: `${rStyle.emoji} \`${rStyle.name}\``, inline: true },
        { name: `💰 Value`, value: `\`🪙${targetCard.value.toLocaleString()}\``, inline: true },
        { name: `🆔 Card ID`, value: `\`${targetCard.cardId.slice(0, 12)}…\``, inline: true },
        { name: `📅 Acquired`, value: `<t:${Math.floor((targetCard.acquiredAt?.getTime() || Date.now()) / 1000)}:R>`, inline: true }
      )
      .setFooter({
        text: `⚽ ${targetCard.name}  •  ${rStyle.name}  •  ${targetCard.rating} OVR`,
        iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
      })
      .setTimestamp();

    if (targetCard.rarity === 'mythic') {
      cardEmbed.setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHoxaHh4MTRsZml3ZGliZmdlMTZ4dWxpZGhhZnZidnRvN2NuZzN1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlNQ03J5JxX6lAm/giphy.gif');
    } else if (targetCard.rarity === 'legendary') {
      cardEmbed.setImage('https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnN2aGk0bHpjeGxmcXpncWZraDM5dGJ1bTFreW1sY2piMnFjOGFmZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btTqfTLGH9H5B6/giphy.gif');
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('inventory')
          .setLabel('📂 Back to Inventory')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [cardEmbed], components: [row] });
  }
};
