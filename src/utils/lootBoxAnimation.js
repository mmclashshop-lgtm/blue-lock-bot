const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const RARITY_CONFIG = {
  common: {
    name: 'عادي',
    color: 0x808080,
    emoji: '🟤',
    glowColor: '#808080',
    description: 'بطاقة عادية'
  },
  rare: {
    name: 'نادر',
    color: 0x0070DD,
    emoji: '🔵',
    glowColor: '#0070DD',
    description: 'بطاقة نادرة'
  },
  epic: {
    name: 'ملحمي',
    color: 0xA335EE,
    emoji: '🟣',
    glowColor: '#A335EE',
    description: 'بطاقة ملحمية'
  },
  legendary: {
    name: 'أسطوري',
    color: 0xFF8000,
    emoji: '🟠',
    glowColor: '#FF8000',
    description: 'بطاقة أسطورية'
  },
  mythic: {
    name: 'ميثيك',
    color: 0xFF0000,
    emoji: '🔴',
    glowColor: '#FF0000',
    description: 'بطاقة ميثيك'
  },
  divine: {
    name: 'Divine',
    color: 0x00FFFF,
    emoji: '💎',
    glowColor: '#00FFFF',
    description: 'بطاقة divine'
  }
};

const LOOT_MESSAGES = {
  opening: [
    '📦 **جاري فتح الصندوق...**',
    '🔓 **تم كسر القفل...**',
    '✨ **الطاقة تتدفق...**',
    '💫 **تظهر البطاقة...**'
  ],
  common: [
    '🟤 صندوق عادي... لا بأس به',
    '🟤 بطاقة عادية، يمكن أفضل'
  ],
  rare: [
    '🔵 بطاقة نادرة! بداية جيدة!',
    '🔵 نادرة! ليست سيئة على الإطلاق'
  ],
  epic: [
    '🟣 **بطاقة ملحمية!** رائعة!',
    '🟣 **ملحمي!** فرصة جميلة!'
  ],
  legendary: [
    '🟠 **🔥 بطاقة أسطورية!!!** لا تصدق!',
    '🟠 **🔥 أسطوري!** هذا هو الحظ!'
  ],
  mythic: [
    '🔴 **💥 بطاقة ميثيك!!!** مستحيل!',
    '🔴 **💥 ميثيك!** أنت الأسطورة!'
  ],
  divine: [
    '💎 **✨ بطاقة Divine!!!** العالم ليس كافيًا!',
    '💎 **✨ Divine!** الخرافة أصبحت حقيقة!'
  ]
};

class LootBoxAnimation {
  async showConfirm(interaction, boxType, player) {
    const rarity = require('../ui/shopUI').getBoxRarity(boxType);
    const config = RARITY_CONFIG[boxType] || RARITY_CONFIG.common;

    const boxEmbed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle(`${config.emoji} صندوق ${config.name}`)
      .setDescription('🎰 **تأكيد فتح الصندوق**')
      .addFields(
        { name: '🪙 السعر', value: `${require('../ui/shopUI').getBoxPrice(boxType)} عملات`, inline: true },
        { name: '📦 المحتوى', value: config.description, inline: true },
        { name: '💰 رصيدك', value: `${player.coins} عملات`, inline: true }
      );

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('open_box_confirm')
          .setLabel('🔓 افتح الصندوق')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('open_box_cancel')
          .setLabel('❌ إلغاء')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [boxEmbed], components: [row] });
  }

  async animateOpen(interaction, boxType, player, openCallback) {
    const rarity = require('../ui/shopUI').getBoxRarity(boxType);

    // Step 1: Opening animation
    const openingMsgs = LOOT_MESSAGES.opening;
    for (let i = 0; i < openingMsgs.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      const animEmbed = new EmbedBuilder()
        .setColor(RARITY_CONFIG[boxType]?.color || 0x808080)
        .setTitle('📦 جاري الفتح...')
        .setDescription(openingMsgs[i])
        .setFooter({ text: '🎰 جاري الفتح...' });
      await interaction.editReply({ embeds: [animEmbed], components: [] });
    }

    // Step 2: Get result from callback
    const result = await openCallback();
    if (!result || !result.success) {
      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xFF4444)
          .setTitle('❌ فشل الفتح')
          .setDescription(result?.message || 'حدث خطأ')
        ],
        components: []
      });
      return result;
    }

    // Step 3: Reveal card with rarity effects
    const cardRarity = result.card.rarity;
    const rarityConfig = RARITY_CONFIG[cardRarity.toLowerCase()] || RARITY_CONFIG.common;
    const revealMsgs = LOOT_MESSAGES[cardRarity.toLowerCase()] || LOOT_MESSAGES.common;

    // Flash effect
    for (let i = 0; i < 3; i++) {
      const flashEmbed = new EmbedBuilder()
        .setColor(rarityConfig.color)
        .setTitle('✨✨✨')
        .setDescription('**✨✨✨**');
      await interaction.editReply({ embeds: [flashEmbed], components: [] });
      await new Promise(r => setTimeout(r, 300));
    }

    // Final reveal
    const revealText = revealMsgs[Math.floor(Math.random() * revealMsgs.length)];
    const finalEmbed = new EmbedBuilder()
      .setColor(rarityConfig.color)
      .setTitle(`📦 ${rarityConfig.emoji} نتيجة صندوق ${rarityConfig.name}!`)
      .setDescription(revealText)
      .addFields(
        { name: '🎴 **البطاقة**', value: `**${result.card.name}**`, inline: true },
        { name: '⭐ **الندرة**', value: `${rarityConfig.emoji} **${rarityConfig.name}**`, inline: true },
        { name: '🪙 **الرصيد**', value: `${player.coins} عملات`, inline: false }
      );

    if (result.card.rarity === 'Legendary' || result.card.rarity === 'Mythic' || result.card.rarity === 'Divine') {
      finalEmbed.setDescription(`🔥 **${revealText}** 🔥\n\n${result.card.rarity === 'Divine' ? '👑 أسطورة حقيقية!' : result.card.rarity === 'Mythic' ? '💥 أسطوري!' : '🌟 مذهل!'}`);
    }

    const playRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('lootbox')
          .setLabel('📦 فتح صندوق آخر')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('collection')
          .setLabel('🎴 المعرض')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('main_menu_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [finalEmbed], components: [playRow] });
    return result;
  }
}

module.exports = new LootBoxAnimation();
