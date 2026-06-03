const {
  SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle,
  StringSelectMenuBuilder, ComponentType
} = require('discord.js');
const Player = require('../database/models/Player');
const Character = require('../database/models/Character');
const config = require('../config/config');
const { generateStats, generatePotential } = require('../utils/helpers');
const CHARACTERS = require('../database/data/characters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('ابدأ مغامرتك في Blue Lock'),

  async execute(interaction) {
    const existingPlayer = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });

    if (existingPlayer) {
      return interaction.reply({
        content: '⚠️ لديك بالفعل لاعب! استخدم /menu',
        flags: 64
      });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('· · ────────────𖧧──────────── · ·\n⚽  بلو لوك\n· · ────────────𖧧──────────── · ·')
      .setDescription(
        '**مرحباً بك في عالم Blue Lock!**\n\n' +
        'هذا هو مشروعك لتصبح أعظم مهاجم في العالم.\n' +
        'اختر طريقك وابدأ رحلتك نحو المجد.\n\n' +
        '🎯 **جاهز لإنشاء لاعبك؟**\n' +
        'اضغط على الزر أدناه لبدء رحلتك.'
      )
      .setImage('https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery01.jpg')
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png')
      .addFields(
        { name: '🎮 **ما هو Blue Lock؟**', value: 'مشروع تأهيل المهاجمين الأقوياء', inline: false },
        { name: '🏆 **الهدف**', value: 'كن أفضل مهاجم وارتقِ في الرتب', inline: false },
        { name: '⚔️ **المنافسة**', value: 'تنافس ضد لاعبين آخرين', inline: false }
      )
      .setFooter({ text: '⚽ Blue Lock Ultimate • اضغط إنشاء لاعب للبدء' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_player')
          .setLabel('🎯 إنشاء لاعب')
          .setStyle(ButtonStyle.Success)
          .setEmoji('⚽'),
        new ButtonBuilder()
          .setCustomId('how_to_play')
          .setLabel('❓ كيف تلعب')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  },

  async handleCreatePlayer(interaction) {
    // Show a modal directly for the button interaction.
    const nameModal = new ModalBuilder()
      .setCustomId('player_name_modal')
      .setTitle('🔹 الخطوة 1: اختر اسم لاعبك');

    const nameInput = new TextInputBuilder()
      .setCustomId('player_name')
      .setLabel('اسم اللاعب')
      .setPlaceholder('أدخل اسم لاعبك (2-20 حرف)')
      .setMinLength(2)
      .setMaxLength(20)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    nameModal.addComponents(new ActionRowBuilder().addComponents(nameInput));

    try {
      await interaction.showModal(nameModal);
    } catch (error) {
      console.error('CreatePlayer modal error:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '⚠️ حدث خطأ عند فتح النموذج. حاول مرة أخرى.', flags: 64 }).catch(e => console.error('followUp error:', e));
      } else {
        await interaction.reply({ content: '⚠️ حدث خطأ عند فتح النموذج. حاول مرة أخرى.', flags: 64 }).catch(e => console.error('reply error:', e));
      }
    }
  },

  async handlePlayerNameModal(interaction) {
    const playerName = interaction.fields.getTextInputValue('player_name');

    // Step 2: Position selection
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('🔹 الخطوة 2: اختر مركزك')
      .setDescription('اختر المركز الذي تريد اللعب فيه')
      .setFooter({ text: 'اختيارك سيؤثر على تطور إحصائياتك' });

    const options = config.positions.map(pos => ({
      label: pos.name,
      value: pos.key,
      description: pos.description
    }));

    const selectRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_position')
          .setPlaceholder('اختر مركزك...')
          .addOptions(options)
      );

    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_player_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    // Store the name in a collector
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000
    });

    // Temporarily store name and position for the flow
    const tempData = { name: playerName };

    const msg = await interaction.reply({
      embeds: [embed],
      components: [selectRow, backRow],
      fetchReply: true
    });

    // Handle the selection
    const positionSelect = await msg.awaitMessageComponent({
      filter: i => i.customId === 'select_position' && i.user.id === interaction.user.id,
      time: 60000
    }).catch(() => null);

    if (!positionSelect) {
      return interaction.editReply({ content: '⏰ انتهى الوقت! حاول مرة أخرى.', components: [] });
    }

    tempData.position = positionSelect.values[0];
    await positionSelect.deferUpdate();

    // Step 3: Play Style
    const styleEmbed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('🔹 الخطوة 3: اختر أسلوب اللعب')
      .setDescription('كيف تريد أن تلعب؟')
      .setFooter({ text: 'أسلوب اللعب يحدد شخصيتك في الملعب' });

    const styleOptions = config.playStyles.map(style => ({
      label: `${style.name}`,
      value: style.key,
      description: style.description
    }));

    const styleRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_style')
          .setPlaceholder('اختر أسلوب لعبك...')
          .addOptions(styleOptions)
      );

    await positionSelect.editReply({
      embeds: [styleEmbed],
      components: [styleRow]
    });

    const styleSelect = await msg.awaitMessageComponent({
      filter: i => i.customId === 'select_style' && i.user.id === interaction.user.id,
      time: 60000
    }).catch(() => null);

    if (!styleSelect) {
      return interaction.editReply({ content: '⏰ انتهى الوقت! حاول مرة أخرى.', components: [] });
    }

    tempData.playStyle = styleSelect.values[0];
    await styleSelect.deferUpdate();

    // Step 4: Character
    const charEmbed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('🔹 الخطوة 4: اختر شخصيتك المفضلة')
      .setDescription('اختر الشخصية التي ستلهم رحلتك')
      .addFields(
        ...config.characters.map(c =>
          ({ name: `${c.name}`, value: `🔹 **${c.skill}**: +${c.statBonus} ${c.stat}`, inline: true })
        )
      );

    const charOptions = config.characters.map(c => ({
      label: c.name,
      value: c.key,
      description: `${c.skill} - +${c.statBonus} ${c.stat}`
    }));

    const charRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_character')
          .setPlaceholder('اختر شخصيتك...')
          .addOptions(charOptions)
      );

    await styleSelect.editReply({
      embeds: [charEmbed],
      components: [charRow]
    });

    const charSelect = await msg.awaitMessageComponent({
      filter: i => i.customId === 'select_character' && i.user.id === interaction.user.id,
      time: 60000
    }).catch(() => null);

    if (!charSelect) {
      return interaction.editReply({ content: '⏰ انتهى الوقت! حاول مرة أخرى.', components: [] });
    }

    tempData.character = charSelect.values[0];
    await charSelect.deferUpdate();

    // Create the player
    const stats = generateStats();
    const potential = generatePotential();
    const charConfig = config.characters.find(c => c.key === tempData.character);

    // Apply character stat bonus
    if (charConfig && stats[charConfig.stat] !== undefined) {
      stats[charConfig.stat] = Math.min(stats[charConfig.stat] + charConfig.statBonus, 99);
    }

    const player = new Player({
      userId: interaction.user.id,
      guildId: interaction.guildId,
      name: tempData.name,
      position: tempData.position,
      playStyle: tempData.playStyle,
      character: tempData.character,
      stats: stats,
      potential: potential,
      coins: 500,
      dailyMissions: {
        date: new Date().toDateString(),
        missions: require('../utils/helpers').getDailyMissions()
      },
      weeklyMissions: {
        week: new Date().toDateString(),
        missions: require('../utils/helpers').getWeeklyMissions()
      },
      seasonPass: {
        level: 0,
        xp: 0,
        premium: false,
        claimedLevels: []
      }
    });

    await player.save();

    // Create the card image
    let cardBuffer = null;
    try {
      const cardGenerator = require('../utils/cardGenerator');
      cardBuffer = await cardGenerator.generatePlayerCard(player);
    } catch (e) {
      console.error('Card generation error:', e.message);
    }

    const ovr = player.calculateOVR();
    const posName = config.positions.find(p => p.key === tempData.position);
    const styleName = config.playStyles.find(s => s.key === tempData.playStyle);
    const charName = config.characters.find(c => c.key === tempData.character);

    const finalEmbed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('🎉 تم إنشاء لاعبك بنجاح!')
      .setDescription(`**${tempData.name}**، مرحباً بك في Blue Lock!`)
      .addFields(
        { name: '🎮 **اللاعب**', value: tempData.name, inline: true },
        { name: '📊 **OVR**', value: `${ovr}`, inline: true },
        { name: '🎯 **المركز**', value: posName ? posName.name : tempData.position, inline: true },
        { name: '🔥 **الأسلوب**', value: styleName ? styleName.name : tempData.playStyle, inline: true },
        { name: '⭐ **الشخصية**', value: charName ? charName.name : tempData.character, inline: true },
        { name: '💎 **الإمكانيات**', value: `${potential.type}`, inline: true },
        { name: '🪙 **العملات**', value: '500', inline: true },
        { name: '🏆 **الرتبة**', value: 'Bronze', inline: true }
      )
      .setFooter({ text: 'استخدم /menu للوحة التحكم' })
      .setTimestamp();

    const menuButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('open_menu')
          .setLabel('🏟️ القائمة الرئيسية')
          .setStyle(ButtonStyle.Primary)
      );

    await charSelect.editReply({
      embeds: [finalEmbed],
      components: [menuButton],
      files: cardBuffer ? [{ attachment: cardBuffer, name: 'player-card.png' }] : []
    });

    collector.stop();
  },

  async handleHowToPlay(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('❓ كيف تلعب Blue Lock؟')
      .setDescription('دليل سريع للبدء')
      .addFields(
        { name: '1️⃣ **إنشاء لاعب**', value: 'استخدم /start وأنشئ لاعبك', inline: false },
        { name: '2️⃣ **القائمة الرئيسية**', value: 'استخدم /menu للوصول لكل الأنظمة', inline: false },
        { name: '3️⃣ **المباريات**', value: 'اختر Play Match وتنافس ضد الآخرين', inline: false },
        { name: '4️⃣ **التدريب**', value: 'طور مهاراتك في Training Center', inline: false },
        { name: '5️⃣ **المهام**', value: 'أنجز المهام اليومية والأسبوعية', inline: false },
        { name: '6️⃣ **البطولات**', value: 'شارك في البطولات لتفوز بجوائز ضخمة', inline: false },
        { name: '7️⃣ **التقدم**', value: 'ارتقِ في الرتب واجمع البطاقات', inline: false }
      )
      .setFooter({ text: '⚽ Blue Lock Ultimate' });

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};
