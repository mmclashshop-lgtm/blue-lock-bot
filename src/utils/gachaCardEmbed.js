const { EmbedBuilder } = require('discord.js');
const { RARITY_STYLES } = require('../data/gachaData');

function createCardEmbed(card, pack, rarity, packEmoji, cardImage) {
  const rStyle = RARITY_STYLES[rarity];
  const stars = card.rating >= 95 ? '★★★★★' : card.rating >= 85 ? '★★★★☆' : card.rating >= 75 ? '★★★☆☆' : card.rating >= 65 ? '★★☆☆☆' : '★☆☆☆☆';

  const embed = new EmbedBuilder()
    .setColor(rStyle.color)
    .setAuthor({
      name: `${packEmoji} ${pack}`,
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTitle(`${card.name}`)
    .setThumbnail(cardImage || 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png')
    .setDescription([
      '',
      `${'─'.repeat(28)}`,
      '',
      `╭${'─'.repeat(24)}╮`,
      `│  ${rStyle.emoji}  **${rStyle.name.toUpperCase()}**   ${rStyle.emoji}  │`,
      `│  ⚡ **OVR ${card.rating}**  ${stars}  │`,
      `│  🎯 **${card.position}**${' '.repeat(18 - card.position.length)}│`,
      `╰${'─'.repeat(24)}╯`,
      '',
      `${'─'.repeat(28)}`,
      '',
    ].join('\n'))
    .addFields(
      { name: '📊 التقييم', value: `\`${card.rating}/99\``, inline: true },
      { name: '🎯 المركز', value: `\`${card.position}\``, inline: true },
      { name: '💎 الندرة', value: `${rStyle.emoji} \`${rStyle.name}\``, inline: true },
      { name: '💰 القيمة', value: `\`🪙${card.value.toLocaleString()}\``, inline: true },
      { name: '🆔 المعرف', value: `\`${card.cardId.slice(0, 10)}…\``, inline: true },
      { name: '📅 تم الحصول', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    )
    .setFooter({
      text: `⚽ Blue Lock Ultimate  •  ${rStyle.name}  •  ${card.rating} OVR`,
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();

  if (rarity === 'mythic') {
    embed.setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHoxaHh4MTRsZml3ZGliZmdlMTZ4dWxpZGhhZnZidnRvN2NuZzN1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlNQ03J5JxX6lAm/giphy.gif');
  } else if (rarity === 'legendary') {
    embed.setImage('https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnN2aGk0bHpjeGxmcXpncWZraDM5dGJ1bTFreW1sY2piMnFjOGFmZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btTqfTLGH9H5B6/giphy.gif');
  }

  return embed;
}

function createDuplicateEmbed(pack, packEmoji, rarity, message) {
  const rStyle = RARITY_STYLES[rarity];
  return new EmbedBuilder()
    .setColor(rStyle.color)
    .setAuthor({
      name: `${packEmoji} ${pack}  •  مكرر`,
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTitle('🔄 بطاقة مكررة')
    .setDescription([
      '',
      `${'─'.repeat(28)}`,
      '',
      `${rStyle.emoji}  **${rarity.toUpperCase()}**  ${rStyle.emoji}`,
      '',
      message,
      '',
      `${'─'.repeat(28)}`,
      ''
    ].join('\n'))
    .setFooter({
      text: '⚽ Blue Lock Ultimate  •  نظام السحب',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();
}

function createPackListEmbed(packs, config) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({
      name: '🎴  سوق الباكات',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTitle('━━━ متجر الباكات ━━━')
    .setDescription([
      '',
      'اختر باكك وابدأ في جمع',
      'أعظم لاعبي **Blue Lock**!',
      '',
      `${'─'.repeat(28)}`,
      ''
    ].join('\n'))
    .setFooter({
      text: '⚽ Blue Lock Ultimate  •  نظام السحب',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();

  for (const [key, pack] of Object.entries(packs)) {
    const ratesList = Object.entries(pack.rates)
      .filter(([_, v]) => v > 0)
      .map(([r, v]) => `${RARITY_STYLES[r].emoji} ${RARITY_STYLES[r].name} ${v}%`)
      .join(' ┊ ');

    embed.addFields({
      name: `${pack.emoji}  **${pack.name}**  ─  🪙 ${pack.price.toLocaleString()}`,
      value: [
        `> ${pack.description}`,
        `> 📊 **نسب الظهور:** ${ratesList}`
      ].join('\n'),
      inline: false
    });
  }

  return embed;
}

function createBuyConfirmEmbed(pack, coins, canAfford) {
  const ratesPreview = Object.entries(pack.rates)
    .filter(([_, v]) => v > 0)
    .map(([r, v]) => `${RARITY_STYLES[r].emoji} ${v}%`)
    .join('  ');

  return new EmbedBuilder()
    .setColor(pack.color)
    .setAuthor({
      name: `🛒  شراء  •  ${pack.name}`,
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTitle(`${pack.emoji} ${pack.name}`)
    .setDescription([
      '',
      `${pack.description}`,
      '',
      `${'─'.repeat(28)}`,
      '',
      `📊 **نسب الظهور:** ${ratesPreview}`,
      '',
      `${'─'.repeat(28)}`,
      ''
    ].join('\n'))
    .addFields(
      { name: '💰 السعر', value: `\`🪙${pack.price.toLocaleString()}\``, inline: true },
      { name: '💳 الرصيد', value: `\`🪙${coins.toLocaleString()}\``, inline: true },
      { name: '📊 الحالة', value: canAfford ? '✅ **متاح**' : '❌ **غير كافٍ**', inline: true }
    )
    .setFooter({
      text: canAfford ? '✅ اضغط Confirm للشراء' : '❌ ليس لديك عملات كافية — اربح من المباريات',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();
}

function createInventoryEmbed(player, cards, grouped, total, uniqueNames, page, config, interaction) {
  const rarityOrder = ['mythic', 'legendary', 'epic', 'rare', 'common'];
  const totalPages = Math.ceil(total / 10) || 1;

  const summary = rarityOrder
    .filter(r => grouped[r])
    .map(r => {
      const s = RARITY_STYLES[r];
      return `${s.emoji}  **${s.name}**  ─  ${grouped[r].length}`;
    })
    .join('\n');

  const statsBlock = [
    '```ml',
    `البطاقات      : ${String(total).padStart(3)}`,
    `اللاعبين الفريد: ${String(uniqueNames.length).padStart(3)}`,
    `أفضل ندرة     : ${(player.gachaStats?.bestRarity || 'لا يوجد').padStart(8)}`,
    `الباكات المفتوحة: ${String(player.gachaStats?.totalPacksOpened || 0).padStart(3)}`,
    '```'
  ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({
      name: `📂  ${interaction.user.username}  •  المخزون`,
      iconURL: interaction.user.displayAvatarURL()
    })
    .setTitle('━━━ مجموعتي ━━━')
    .setDescription([
      '',
      `${'─'.repeat(28)}`,
      '',
      statsBlock,
      '',
      '━━━ التوزيع ━━━',
      '',
      summary || '> لا توجد بطاقات',
      '',
      `${'─'.repeat(28)}`,
      ''
    ].join('\n'))
    .setFooter({
      text: `📄 صفحة ${page + 1}/${totalPages}  •  🪙 ${player.coins.toLocaleString()}`,
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();

  const start = page * 10;
  const pageCards = cards.slice(start, start + 10);

  for (const c of pageCards) {
    const rs = RARITY_STYLES[c.rarity];
    embed.addFields({
      name: `${rs.emoji}  **${c.name}**  ─  ${c.rating} OVR`,
      value: `🎯 ${c.position}  ┊  🆔 \`${c.cardId.slice(0, 8)}…\``,
      inline: true
    });
  }

  return embed;
}

function createSellEmbed(uniqueDups, cards, coins, config) {
  const list = uniqueDups.map(c => {
    const count = cards.filter(x => x.name === c.name).length;
    const comp = require('../data/gachaData').DUPLICATE_COMPENSATION[c.rarity] || 50;
    const rs = RARITY_STYLES[c.rarity];
    return `${rs.emoji}  **${c.name}**  —  ${c.rating} OVR  —  🪙 ${comp}  (×${count})`;
  }).join('\n');

  return new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({
      name: '💰  بيع المكرر',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTitle('━━━ بيع المكرر ━━━')
    .setDescription([
      '',
      `${'─'.repeat(28)}`,
      '',
      'بيع اللاعبين المكررين للحصول على عملات.',
      '',
      '━━━ متاح للبيع ━━━',
      '',
      list,
      '',
      `${'─'.repeat(28)}`,
      ''
    ].join('\n'))
    .setFooter({
      text: `🪙  ${coins.toLocaleString()}  •  Blue Lock Ultimate`,
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();
}

function createSellResultEmbed(success, message) {
  return new EmbedBuilder()
    .setColor(success ? 0x00FF00 : 0xFF0000)
    .setAuthor({
      name: success ? '✅  تم البيع' : '❌  فشل البيع',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTitle(success ? '━━━ ✅ بيع ناجح ━━━' : '━━━ ❌ بيع فاشل ━━━')
    .setDescription([
      '',
      `${'─'.repeat(28)}`,
      '',
      message,
      '',
      `${'─'.repeat(28)}`,
      ''
    ].join('\n'))
    .setFooter({
      text: '⚽ Blue Lock Ultimate',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();
}

function createEmptyInventoryEmbed(config) {
  return new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({
      name: '📂  المخزون',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTitle('━━━ مخزون فارغ ━━━')
    .setDescription([
      '',
      `${'─'.repeat(28)}`,
      '',
      'لم تقم بجمع أي لاعبين بعد!',
      '',
      '> استخدم \`/pack open\` أو \`/pack buy\` للبدء',
      '> اجمع كل لاعبي Blue Lock المفضلين لديك',
      '',
      `${'─'.repeat(28)}`,
      ''
    ].join('\n'))
    .setFooter({
      text: '⚽ Blue Lock Ultimate  •  نظام السحب',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();
}

function createNoDuplicatesEmbed(config) {
  return new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({
      name: '💰  البيع',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTitle('━━━ لا يوجد مكرر ━━━')
    .setDescription([
      '',
      `${'─'.repeat(28)}`,
      '',
      'ليس لديك لاعبين مكررين للبيع.',
      '',
      '> افتح باكات للحصول على نسخ مكررة',
      '> ثم بعها هنا للحصول على عملات إضافية',
      '',
      `${'─'.repeat(28)}`,
      ''
    ].join('\n'))
    .setFooter({
      text: '⚽ Blue Lock Ultimate  •  نظام السحب',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();
}

function createCoinsEmbed(player, interaction, config) {
  return new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({
      name: `💰  ${interaction.user.username}  •  المحفظة`,
      iconURL: interaction.user.displayAvatarURL()
    })
    .setTitle('━━━ المحفظة ━━━')
    .setDescription([
      '',
      `${'─'.repeat(28)}`,
      '',
      '```ml',
      `العملات       : ${String(player.coins).padStart(10)}`,
      `الجواهر       : ${String(player.gems || 0).padStart(10)}`,
      `الإجمالي      : ${String(player.totalCoinsEarned || 0).padStart(10)}`,
      '```',
      '',
      `${'─'.repeat(28)}`,
      ''
    ].join('\n'))
    .addFields(
      { name: '🪙 عملات', value: `**${player.coins.toLocaleString()}**`, inline: true },
      { name: '💎 جواهر', value: `**${player.gems || 0}**`, inline: true },
      { name: '📈 الإجمالي', value: `**🪙 ${(player.totalCoinsEarned || 0).toLocaleString()}**`, inline: true }
    )
    .setFooter({
      text: 'اكسب المزيد من المباريات والمهام والبيع',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();
}

module.exports = {
  createCardEmbed,
  createDuplicateEmbed,
  createPackListEmbed,
  createBuyConfirmEmbed,
  createInventoryEmbed,
  createSellEmbed,
  createSellResultEmbed,
  createEmptyInventoryEmbed,
  createNoDuplicatesEmbed,
  createCoinsEmbed
};
