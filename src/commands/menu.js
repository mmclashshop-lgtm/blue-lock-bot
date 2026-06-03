const {
  SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, StringSelectMenuBuilder, ComponentType
} = require('discord.js');
const Player = require('../database/models/Player');
const { createMainMenu, createPlayMenu, createTrainingMenu, createMissionsMenu, createSeasonPassMenu, createClanMenu } = require('../ui/mainMenu');
const { createShopMenu, createLootBoxMenu } = require('../ui/shopUI');
const config = require('../config/config');
const { RARITY_STYLES } = require('../data/gachaData');
const { divider } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('menu')
    .setDescription('افتح لوحة التحكم الرئيسية'),

  async execute(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });

    if (!player) {
      return interaction.reply({
        content: '⚠️ يجب عليك إنشاء لاعب أولاً! استخدم /start',
        flags: 64
      });
    }

    const ovr = player.calculateOVR();
    const menuData = createMainMenu(ovr);

    await interaction.reply(menuData);
  },

  async handleMenuBack(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const ovr = player.calculateOVR();
    const menuData = createMainMenu(ovr);
    await interaction.update(menuData);
  },

  async handleProfile(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const ovr = player.calculateOVR();
    const stats = player.stats;
    const rankColor = config.ranks.find(r => r.name === player.rank)?.color || '#808080';
    const { generateProgressBar: gpb } = require('../utils/helpers');
    const xpBar = gpb(player.xp || 0, player.xpToNext || 100, 12);

    const embed = new EmbedBuilder()
      .setColor(rankColor)
      .setAuthor({ name: `👤 ${player.name}`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(`👤 <@${player.userId}>`)
      .setDescription(`${divider()}`)
      .addFields(
        { name: '📊 **معلومات أساسية**', value:
          `▸ **المستوى**: ${player.level}\n` +
          `▸ **الرتبة**: ${player.rank}\n` +
          `▸ **OVR**: ${ovr}\n` +
          `▸ **المركز**: ${player.position}\n` +
          `▸ **الأسلوب**: ${player.playStyle}\n` +
          `▸ **الشخصية**: ${player.character}`, inline: false },
        { name: '⚔️ **سجل المباريات**', value:
          `▸ **المباريات**: ${player.matchesPlayed || 0}\n` +
          `▸ **الفوز**: ${player.wins || 0}\n` +
          `▸ **الخسارة**: ${player.losses || 0}\n` +
          `▸ **نسبة الفوز**: ${player.winRate || 0}%\n` +
          `▸ **الأهداف**: ${player.goalsScored || 0}`, inline: true },
        { name: '💰 **الاقتصاد**', value:
          `▸ **العملات**: 🪙 ${player.coins || 0}\n` +
          `▸ **الجواهر**: 💎 ${player.gems || 0}\n` +
          `▸ **XP**: ${player.xp || 0}/${player.xpToNext || 100}`, inline: true },
        { name: `✨ **XP** \`${xpBar}\``, value:
          `⎔ **النوع**: ${player.potential?.type || 'Common'}\n` +
          `⎔ **معدل النمو**: x${player.potential?.multiplier || 1}`, inline: false }
      )
      .setFooter({ text: `⚽ Blue Lock Ultimate • ${player.totalXP || 0} إجمالي XP`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTimestamp();

    // Add stats bars
    const statArray = ['shooting', 'dribbling', 'passing', 'vision', 'speed', 'defense', 'stamina', 'finishing', 'control', 'reaction', 'ego'];
    const statsEmoji = { shooting: '🎯', dribbling: '🪄', passing: '🔄', vision: '👁️', speed: '💨', defense: '🛡️', stamina: '💪', finishing: '⚽', control: '🎮', reaction: '⚡', ego: '🔥' };
    const statsArName = { shooting: 'التسديد', dribbling: 'المراوغة', passing: 'التمرير', vision: 'الرؤية', speed: 'السرعة', defense: 'الدفاع', stamina: 'التحمل', finishing: 'الإنهاء', control: 'التحكم', reaction: 'رد الفعل', ego: 'الأنانية' };
    const statDisplay = statArray.map(name => {
      const value = stats[name] || 50;
      const bar = '█'.repeat(Math.floor(value / 10)) + '░'.repeat(10 - Math.floor(value / 10));
      return `${statsEmoji[name]} **${statsArName[name]}**: \`${bar}\` ${value}/99`;
    }).join('\n');
    embed.addFields({ name: '📈 **الإحصائيات**', value: statDisplay, inline: false });

    // Generate card image
    let cardBuffer = null;
    try {
      const cardGenerator = require('../utils/cardGenerator');
      cardBuffer = await cardGenerator.generateProfileImage(player, player.achievements || []);
    } catch (e) {
      console.error('Profile card generation error:', e.message);
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('main_menu_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('view_achievements')
          .setLabel('🏆 الإنجازات')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('view_titles')
          .setLabel('🎗️ الألقاب')
          .setStyle(ButtonStyle.Success)
      );

    await interaction.update({
      embeds: [embed],
      components: [row],
      files: cardBuffer ? [{ attachment: cardBuffer, name: 'profile.png' }] : []
    });
  },

  async handleRankings(interaction) {
    const allPlayers = await Player.find({ guildId: interaction.guildId })
      .limit(50)
      .lean();



    // Sort based on button pressed
    const sortMode = interaction.customId || 'rankings_ovr';
    let sorted = allPlayers.sort((a, b) => {
      if (sortMode === 'rankings_wins') return (b.wins || 0) - (a.wins || 0);
      if (sortMode === 'rankings_goals') return (b.goalsScored || 0) - (a.goalsScored || 0);
      const ovrA = (a.stats.shooting + a.stats.dribbling + a.stats.passing + a.stats.vision +
        a.stats.speed + a.stats.defense + a.stats.stamina + a.stats.finishing +
        a.stats.control + a.stats.reaction + a.stats.ego) / 11;
      const ovrB = (b.stats.shooting + b.stats.dribbling + b.stats.passing + b.stats.vision +
        b.stats.speed + b.stats.defense + b.stats.stamina + b.stats.finishing +
        b.stats.control + b.stats.reaction + b.stats.ego) / 11;
      return ovrB - ovrA;
    });

    const top = sorted.slice(0, 10);

    const sortNames = { rankings_ovr: 'التقييم', rankings_wins: 'الفوز', rankings_goals: 'الأهداف' };
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setAuthor({ name: '📊 التصنيف العالمي', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(`📊 الترتيب حسب ${sortNames[sortMode] || 'OVR'}`)
      .setDescription(`${divider()}`);

    if (top.length === 0) {
      embed.addFields({ name: 'لا يوجد لاعبين بعد', value: 'كن أول من ينضم!' });
    } else {
      const rankList = top.map((p, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        const ovr = Math.round(
          (p.stats.shooting + p.stats.dribbling + p.stats.passing + p.stats.vision +
            p.stats.speed + p.stats.defense + p.stats.stamina + p.stats.finishing +
            p.stats.control + p.stats.reaction + p.stats.ego) / 11
        );
        return `${medal} **${p.name}** — OVR ${ovr} | ${p.rank} | ${p.wins || 0}W`;
      }).join('\n');

      embed.addFields(
        { name: '🏆 **المتصدرون**', value: rankList, inline: false }
      );
    }

    embed.setFooter({ text: '⚽ Blue Lock Ultimate • تحديث تلقائي', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' }).setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('rankings_ovr')
          .setLabel('📊 OVR')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('rankings_wins')
          .setLabel('🏆 انتصارات')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('rankings_goals')
          .setLabel('⚽ أهداف')
          .setStyle(ButtonStyle.Danger)
      );

    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('main_menu_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [embed], components: [row, backRow] });
  },

  async handleAchievements(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const { ACHIEVEMENTS } = require('../config/constants');
    const unlocked = player.achievements || [];
    const { progressBar: pb, divider } = require('../utils/embeds');

    let currentPage = 1;
    if (interaction.isButton() && interaction.message?.embeds?.[0]?.fields?.[0]?.name) {
      const match = interaction.message.embeds[0].fields[0].name.match(/Page (\d+)\/(\d+)/);
      if (match) {
        currentPage = interaction.customId === 'ach_page_next'
          ? Math.min(parseInt(match[1]) + 1, parseInt(match[2]))
          : Math.max(1, parseInt(match[1]) - 1);
      }
    }

    const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setAuthor({ name: '🏆 الإنجازات', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('· · ────────────𖧧──────────── · ·\n🏆  الإنجازات\n· · ────────────𖧧──────────── · ·')
      .setDescription([
        '',
        `${divider()}`,
        '',
        `التقدم: \`${pb(pct, 100)}\`  ${pct}%`,
        `تم الفتح: \`${unlocked.length}/${ACHIEVEMENTS.length}\``,
        '',
        `${divider()}`,
        ''
      ].join('\n'));

    const grouped = ACHIEVEMENTS.map(ach => {
      const has = unlocked.find(u => u.id === ach.id);
      return `${has ? '✅' : '⬜'} **${ach.icon} ${ach.name}**\n└ ${ach.description}${has ? '' : `\n└ 🪙${ach.coinReward}  ✨${ach.xpReward} XP`}`;
    });

    const perPage = 10;
    const pages = Math.ceil(grouped.length / perPage);
    const start = (currentPage - 1) * perPage;
    embed.addFields({ name: `📋 الصفحة ${currentPage}/${pages}`, value: grouped.slice(start, start + perPage).join('\n\n') });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('main_menu_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    if (currentPage < pages) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('ach_page_next')
          .setLabel('▶️ التالي')
          .setStyle(ButtonStyle.Primary)
      );
    }

    if (currentPage > 1) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('ach_page_prev')
          .setLabel('◀️ السابق')
          .setStyle(ButtonStyle.Secondary)
      );
    }

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleTitles(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const { divider } = require('../utils/embeds');
    const titles = player.titles || [];
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setAuthor({ name: '🎗️ الألقاب', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('🏷️ إدارة الألقاب')
      .setDescription([
        player.activeTitle ? `✅ **اللقب النشط:** \`${player.activeTitle}\`` : '⚠️ **لا يوجد لقب نشط**',
        divider(),
        titles.length > 0
          ? titles.map(t => `${t === player.activeTitle ? '✅' : '⬜'} \`${t}\``).join('\n')
          : '📭 لا توجد ألقاب — احصل على ألقاب من البطولات والمهام'
      ].join('\n'))
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('main_menu_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    if (titles.length > 0) {
      row.addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_title')
          .setPlaceholder('اختر لقباً')
          .addOptions(titles.map(t => ({ label: t, value: t, description: 'انقر لتفعيل هذا اللقب' })))
      );
    }

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleStatsDetailed(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const { progressBar, divider } = require('../utils/embeds');
    const stats = player.stats;
    const attrs = [
      ['📍 Shooting', 'shooting'],
      ['🎯 Dribbling', 'dribbling'],
      ['🎪 Passing', 'passing'],
      ['👁️ Vision', 'vision'],
      ['⚡ Speed', 'speed'],
      ['🛡️ Defense', 'defense'],
      ['💨 Stamina', 'stamina'],
      ['🎯 Finishing', 'finishing'],
      ['🎮 Control', 'control'],
      ['🔄 Reaction', 'reaction'],
      ['💪 Ego', 'ego']
    ];
    const total = attrs.reduce((sum, [_, k]) => sum + (stats[k] || 50), 0);
    const ovr = Math.round(total / attrs.length);

    const left = attrs.slice(0, 6).map(([name, key]) => {
      const v = stats[key] || 50;
      return `${name} ${progressBar(v, 99)} \`${v}\``;
    }).join('\n');

    const right = attrs.slice(6).map(([name, key]) => {
      const v = stats[key] || 50;
      return `${name} ${progressBar(v, 99)} \`${v}\``;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setAuthor({ name: `📊  إحصائيات ${player.name}`, iconURL: interaction.user.displayAvatarURL() })
      .setTitle('· · ────────────𖧧──────────── · ·\n📊  إحصائيات مفصلة\n· · ────────────𖧧──────────── · ·')
      .setDescription([
        '',
        `${divider()}`,
        '',
        `⚡ **OVR ${ovr}/99** — التقييم العام`,
        '',
        `${divider()}`,
        ''
      ].join('\n'))
      .addFields(
        { name: '\u200b', value: left, inline: true },
        { name: '\u200b', value: right, inline: true }
      )
      .setFooter({ text: `⚽ Blue Lock Ultimate • ${player.name}`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('profile')
          .setLabel('◀️ Back to Profile')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleItems(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const { divider } = require('../utils/embeds');
    const gachaCards = player.gachaPlayers || [];
    const cardsCount = gachaCards.length;
    const uniqueNames = [...new Set(gachaCards.map(c => c.name))];
    const grouped = {};
    const order = ['mythic', 'legendary', 'epic', 'rare', 'common'];
    for (const c of gachaCards) {
      if (!grouped[c.rarity]) grouped[c.rarity] = [];
      grouped[c.rarity].push(c);
    }

    const summary = order
      .filter(r => grouped[r])
      .map(r => {
        const rs = RARITY_STYLES[r];
        return `${rs.emoji}  **${rs.name}**  ─  \`${grouped[r].length}\``;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setAuthor({ name: `🎴  ${player.name}  •  المجموعة`, iconURL: interaction.user.displayAvatarURL() })
      .setTitle('· · ────────────𖧧──────────── · ·\n🎴  المجموعة\n· · ────────────𖧧──────────── · ·')
      .setDescription([
        '',
        `${divider()}`,
        '',
        `🃏 البطاقات: \`${cardsCount}\`  •  🌟 فريدة: \`${uniqueNames.length}\``,
        '',
        `${divider()}`,
        '',
        summary || '> لا توجد بطاقات مجمعة',
        '',
        `${divider()}`,
        ''
      ].join('\n'))
      .setFooter({ text: `🪙 ${player.coins.toLocaleString()} عملة`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('profile')
          .setLabel('◀️ رجوع للملف')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('inventory')
          .setLabel('📂 عرض المخزون')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleQuickMatch(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const matchmaking = require('../systems/matchmaking');

    if (matchmaking.isInQueue(interaction.user.id)) {
      return interaction.reply({ content: '⏳ أنت بالفعل في قائمة الانتظار!', flags: 64 });
    }

    matchmaking.addToQueue(interaction.user.id, player);

    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setAuthor({ name: '⚔️ بحث عن مباراة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('🔍 جاري البحث عن خصم...')
      .setDescription([`${divider()}`, `**${player.name}** يبحث عن خصم...`, `${divider()}`].join('\n'))
      .addFields(
        { name: '📊 OVR', value: `${player.calculateOVR()}`, inline: true },
        { name: '🏆 الرتبة', value: `${player.rank}`, inline: true }
      )
      .setFooter({ text: '⚽ اضغط إلغاء للإلغاء', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('cancel_search')
          .setLabel('❌ إلغاء')
          .setStyle(ButtonStyle.Danger)
      );

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    // Try to find match
    setTimeout(async () => {
      const opponent = matchmaking.findMatch(interaction.user.id, player);
      if (!opponent) {
        matchmaking.removeFromQueue(interaction.user.id);
        return interaction.editReply({
          content: '⏰ لم يتم العثور على خصم. حاول مرة أخرى.',
          embeds: [],
          components: []
        });
      }

      // Found a match!
      matchmaking.removeFromQueue(interaction.user.id);
      matchmaking.removeFromQueue(opponent.userId);

      player.inMatch = true;
      await player.save();

      const opponentPlayer = await Player.findOne({ userId: opponent.userId });
      if (opponentPlayer) {
        opponentPlayer.inMatch = true;
        await opponentPlayer.save();
      }

      const vsEmbed = new EmbedBuilder()
        .setColor(config.colors.blueLock)
        .setAuthor({ name: '⚔️ تم العثور على مباراة!', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
        .setTitle('⚔️ تم العثور على خصم!')
        .setDescription(`${divider()}`)
        .setImage('https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery01.jpg')
        .addFields(
          { name: `🔵 **${player.name}**`, value: `OVR: ${player.calculateOVR()}\n🏆 ${player.rank}`, inline: true },
          { name: '⚔️', value: '⎯⎯⎯\nVS\n⎯⎯⎯', inline: true },
          { name: `🔴 **${opponent.player.name}**`, value: `OVR: ${opponent.rating}\n🏆 ${opponent.player.rank}`, inline: true }
        )
        .setFooter({ text: '⚽ اضغط بدء للبدء', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
        .setTimestamp();

      const playRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId('start_match')
          .setLabel('⚽ بدء المباراة')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('cancel_match')
          .setLabel('❌ إلغاء')
          .setStyle(ButtonStyle.Danger)
        );

      await interaction.editReply({ embeds: [vsEmbed], components: [playRow] });
    }, 3000);
  },

  async handleStartMatch(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const matchmaking = require('../systems/matchmaking');

    // For now, simulate vs bot
    const botPlayer = {
      name: 'بوت بلو لوك',
      stats: {
        shooting: 50, dribbling: 50, passing: 50, vision: 50,
        speed: 50, defense: 50, stamina: 50, finishing: 50,
        control: 50, reaction: 50, ego: 50
      },
      calculateOVR: () => 50,
      goalsScored: 0,
      matchesPlayed: 0,
      wins: 0, losses: 0, draws: 0,
      goalsConceded: 0
    };

    const result = await matchmaking.quickMatch(player, botPlayer);

    // Update player stats
    player.inMatch = false;
    player.updatedAt = new Date();

    // Apply rewards
    if (result.result === 'p1_win') {
      player.addXP(config.match.winXP);
      player.coins += config.match.winCoins;
      player.totalCoinsEarned = (player.totalCoinsEarned || 0) + config.match.winCoins;
    } else if (result.result === 'p2_win') {
      player.addXP(config.match.lossXP);
      player.coins += config.match.lossCoins;
      player.totalCoinsEarned = (player.totalCoinsEarned || 0) + config.match.lossCoins;
    } else {
      player.addXP(config.match.drawXP);
      player.coins += config.match.drawCoins;
      player.totalCoinsEarned = (player.totalCoinsEarned || 0) + config.match.drawCoins;
    }

    await player.save();

    const { divider } = require('../utils/embeds');
    const scoreText = `${result.score.p1} - ${result.score.p2}`;
    const isWin = result.result === 'p1_win';
    const resultLabel = isWin ? '🏆 انتصار' : result.result === 'p2_win' ? '💔 هزيمة' : '🤝 تعادل';

    const embed = new EmbedBuilder()
      .setColor(isWin ? config.colors.success : config.colors.danger)
      .setAuthor({ name: resultLabel, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(`⚽ ${scoreText}`)
      .setDescription([
        '',
        `${divider()}`,
        ''
      ].join('\n'))
      .addFields(
        { name: `🔵 ${player.name}`, value: `\`${result.score.p1}\``, inline: true },
        { name: '⚔️ VS', value: `${divider()}`, inline: true },
        { name: `🔴 ${botPlayer.name}`, value: `\`${result.score.p2}\``, inline: true }
      );

    const recentEvents = result.events.slice(-5);
    if (recentEvents.length > 0) {
      embed.addFields({
        name: '🔥 أحداث المباراة',
        value: recentEvents.map(e => `\`${e.time}'\" \` ${e.text}`).join('\n'),
        inline: false
      });
    }

    const xpEarned = isWin ? config.match.winXP : result.result === 'p2_win' ? config.match.lossXP : config.match.drawXP;
    const coinEarned = isWin ? config.match.winCoins : result.result === 'p2_win' ? config.match.lossCoins : config.match.drawCoins;

    embed.addFields({ name: '🎁 المكافآت', value: `✨ \`+${xpEarned}\` XP  •  🪙 \`+${coinEarned}\` عملة`, inline: false })
      .setFooter({ text: `⚽ ${player.matchesPlayed} مباراة • ${player.wins} فوز`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('play_again').setLabel('🔄 لعب مرة أخرى').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ القائمة الرئيسية').setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleVsBot(interaction) {
    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return;

    const matchmaking = require('../systems/matchmaking');
    const botPlayer = {
      name: 'بوت بلو لوك',
      stats: { shooting: 45, dribbling: 45, passing: 45, vision: 45, speed: 45, defense: 45, stamina: 45, finishing: 45, control: 45, reaction: 45, ego: 45 },
      calculateOVR: () => 45,
      goalsScored: 0, matchesPlayed: 0, wins: 0, losses: 0, draws: 0, goalsConceded: 0
    };

    const result = await matchmaking.quickMatch(player, botPlayer);
    player.inMatch = false;
    player.updatedAt = new Date();

    if (result.result === 'p1_win') { player.addXP(config.match.winXP); player.coins += config.match.winCoins; }
    else if (result.result === 'p2_win') { player.addXP(config.match.lossXP); player.coins += config.match.lossCoins; }
    else { player.addXP(config.match.drawXP); player.coins += config.match.drawCoins; }
    await player.save();

    const { divider } = require('../utils/embeds');
    const isWin = result.result === 'p1_win';
    const resultLabel = isWin ? '🏆 انتصار تدريبي' : result.result === 'p2_win' ? '💔 هزيمة تدريبية' : '🤝 تعادل تدريبي';

    const embed = new EmbedBuilder()
      .setColor(isWin ? config.colors.success : config.colors.danger)
      .setAuthor({ name: resultLabel, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(`⚽ ${result.score.p1} - ${result.score.p2}`)
      .setDescription([
        '',
        `${divider()}`,
        ''
      ].join('\n'))
      .addFields(
        { name: `🔵 ${player.name}`, value: `\`${result.score.p1}\``, inline: true },
        { name: '⚔️ VS', value: `${divider()}`, inline: true },
        { name: `🤖 ${botPlayer.name}`, value: `\`${result.score.p2}\``, inline: true }
      );

    const recentEvents = result.events.slice(-5);
    if (recentEvents.length > 0) {
      embed.addFields({
        name: '🔥 أحداث المباراة',
        value: recentEvents.map(e => `\`${e.time}'\" \` ${e.text}`).join('\n'),
        inline: false
      });
    }

    const xpEarned = isWin ? config.match.winXP * 0.5 : result.result === 'p2_win' ? config.match.lossXP * 0.5 : config.match.drawXP * 0.5;
    const coinEarned = isWin ? config.match.winCoins * 0.5 : result.result === 'p2_win' ? config.match.lossCoins * 0.5 : config.match.drawCoins * 0.5;

    embed.addFields({ name: '🎁 المكافآت', value: `✨ \`+${Math.round(xpEarned)}\` XP  •  🪙 \`+${Math.round(coinEarned)}\` عملة`, inline: false })
      .setFooter({ text: '⚽ Blue Lock Ultimate • تدريب', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleCancelSearch(interaction) {
    const matchmaking = require('../systems/matchmaking');
    matchmaking.removeFromQueue(interaction.user.id);

    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (player) {
      player.inQueue = false;
      await player.save();
    }

    await interaction.update({
      content: '❌ تم إلغاء البحث',
      embeds: [],
      components: []
    });
  },

  async handleTrain(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const trainingMenu = createTrainingMenu(player);
    await interaction.update(trainingMenu);
  },

  async handleTrainStat(interaction) {
    const statName = interaction.values[0];
    const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!player) return;

    const training = require('../systems/training');
    const result = await training.train(player, statName);

    const { divider } = require('../utils/embeds');
    const { getStatEmoji } = require('../utils/helpers');
    const embed = new EmbedBuilder()
      .setColor(result.success ? config.colors.success : config.colors.danger)
      .setAuthor({ name: result.success ? '🏋️ تدريب' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(result.success ? '✅ تم التدريب بنجاح' : '❌ فشل التدريب')
      .setDescription([
        '',
        result.message,
        '',
        divider(),
        ''
      ].join('\n'));

    if (result.success) {
      const statEmoji = getStatEmoji(statName);
      embed.addFields(
        { name: `${statEmoji} المهارة`, value: `\`${result.newValue}/99\``, inline: true },
        { name: '📅 الجلسات', value: `\`${result.sessionsLeft}/5\``, inline: true },
        { name: '✨ XP المكتسب', value: `\`+${result.xpGain}\``, inline: true }
      );

      if (result.levelUp) {
        embed.addFields({ name: '🎉 رفع المستوى!', value: `لقد وصلت إلى **المستوى ${player.level}**!`, inline: false });
      }
    }
    embed.setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('training').setLabel('🏋️ متابعة التدريب').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleMissions(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const missions = require('../systems/missions');
    await missions.resetDailyMissions(player);
    await missions.resetWeeklyMissions(player);

    const missionMenu = createMissionsMenu(player);
    await interaction.update(missionMenu);
  },

  async handleClaimDaily(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const missions = require('../systems/missions');
    const result = await missions.claimDailyRewards(player);

    const embed = new EmbedBuilder()
      .setColor(result.success ? config.colors.success : config.colors.danger)
      .setAuthor({ name: result.success ? '✅ تم المطالبة!' : '⚠️ لا توجد مكافآت', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('📅 المهام اليومية')
      .setDescription(result.message)
      .setFooter({ text: '⚽ Blue Lock Ultimate', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('missions')
          .setLabel('🎯 المهام')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('main_menu_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleClaimWeekly(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const missions = require('../systems/missions');
    const result = await missions.claimWeeklyRewards(player);

    const embed = new EmbedBuilder()
      .setColor(result.success ? config.colors.success : config.colors.danger)
      .setAuthor({ name: result.success ? '✅ تم المطالبة!' : '⚠️ لا توجد مكافآت', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('📆 المهام الأسبوعية')
      .setDescription(result.message)
      .setFooter({ text: '⚽ Blue Lock Ultimate', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('missions')
          .setLabel('🎯 Missions')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('main_menu_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleCollection(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    // Parse current page from embed message or default to 0
    let currentPage = 0;
    if (interaction.isButton() && interaction.message?.embeds?.[0]?.fields) {
      const fields = interaction.message.embeds[0].fields;
      const pageField = fields.find(f => f.name.includes('الصفحة'));
      if (pageField) {
        const match = pageField.name.match(/(\d+)\/(\d+)/);
        if (match) {
          const parsed = parseInt(match[1]);
          currentPage = interaction.customId === 'collection_next'
            ? parsed  // already 1-indexed from display
            : Math.max(1, parsed - 1);
          currentPage = Math.max(0, currentPage - 1); // convert to 0-indexed
        }
      }
    }

    const collection = require('../systems/collection');
    const display = collection.getCollectionDisplay(player, currentPage);
    const rarityStats = collection.getRarityStats(player);
    const completion = collection.getCardCompletion(player);

    const completionPct = completion.percentage;
    const compBar = '█'.repeat(Math.floor(completionPct / 10)) + '░'.repeat(10 - Math.floor(completionPct / 10));
    const { divider } = require('../utils/embeds');
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setAuthor({ name: '🎴 المجموعة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(`🎴 Cards: ${display.totalCards}`)
      .setDescription([
        '',
        `${divider()}`,
        ''
      ].join('\n'))
      .addFields(
        { name: '🟤 Common', value: `\`${rarityStats.Common || 0}\``, inline: true },
        { name: '🔵 Rare', value: `\`${rarityStats.Rare || 0}\``, inline: true },
        { name: '🟣 Epic', value: `\`${rarityStats.Epic || 0}\``, inline: true },
        { name: '🟠 Legendary', value: `\`${rarityStats.Legendary || 0}\``, inline: true },
        { name: '🔴 Mythic', value: `\`${rarityStats.Mythic || 0}\``, inline: true },
        { name: '💎 Divine', value: `\`${rarityStats.Divine || 0}\``, inline: true },
        { name: `📋 Page ${display.page}/${display.totalPages}`, value: display.display, inline: false },
        { name: `📊 Completion \`${compBar}\``, value: `\`${completion.collected}/${completion.total}\` (\`${completion.percentage}%\`)`, inline: false }
      )
      .setFooter({ text: '⚽ Blue Lock Ultimate • المجموعة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('collection_prev')
          .setLabel('◀️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(display.page <= 1),
        new ButtonBuilder()
          .setCustomId('collection_next')
          .setLabel('▶️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(display.page >= display.totalPages),
        new ButtonBuilder()
          .setCustomId('main_menu_back')
          .setLabel('◀️ رجوع')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleShop(interaction) {
    const shopMenu = createShopMenu('all');
    await interaction.update(shopMenu);
  },

  async handleBuyItem(interaction) {
    const itemId = interaction.values[0];
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const shop = require('../systems/shop');
    const result = await shop.buyItem(player, itemId);

    const { divider } = require('../utils/embeds');
    const embed = new EmbedBuilder()
      .setColor(result.success ? config.colors.success : config.colors.danger)
      .setAuthor({ name: result.success ? '✅ تم الشراء بنجاح' : '❌ فشل الشراء', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('🛒 المتجر')
      .setDescription([
        '',
        result.message,
        '',
        `${divider()}`,
        ''
      ].join('\n'));

    if (result.card) {
      embed.addFields({ name: '🎴 البطاقة', value: `**${result.card.name}** — \`${result.card.rarity}\``, inline: false });
    }
    embed.setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('shop').setLabel('🛒 متابعة التسوق').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleLootBox(interaction) {
    const lootBoxMenu = createLootBoxMenu();
    await interaction.update(lootBoxMenu);
  },

  async handleOpenLootBox(interaction) {
    const boxType = interaction.values[0];
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const shop = require('../systems/shop');
    const { getBoxPrice, getBoxRarity } = require('../ui/shopUI');
    const price = getBoxPrice(boxType);
    const rarity = getBoxRarity(boxType);
    const result = await shop.buyLootBox(player, boxType, price, rarity);

    const { divider } = require('../utils/embeds');
    const embed = new EmbedBuilder()
      .setColor(result.success ? config.colors.success : config.colors.danger)
      .setAuthor({ name: result.success ? '📦 تم فتح الصندوق' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(result.success ? '📦 تم فتح الصندوق!' : '❌ فشل')
      .setDescription([
        '',
        result.message,
        '',
        `${divider()}`,
        ''
      ].join('\n'));

    if (result.card) {
      const rarityColors = { Common: '#808080', Rare: '#3498DB', Epic: '#9B59B6', Legendary: '#F39C12', Mythic: '#E74C3C', Divine: '#00FFFF' };
      embed.addFields({ name: '🎴 البطاقة', value: `**${result.card.name}** — \`${result.card.rarity}\``, inline: false });
      embed.setColor(rarityColors[result.card.rarity] || '#808080');
      const collection = require('../systems/collection');
      await collection.addCardToPlayer(player, result.card);
    }

    embed.addFields({ name: '🪙 الرصيد', value: `\`${player.coins.toLocaleString()}\` عملة`, inline: false });
    embed.setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('lootbox').setLabel('📦 فتح آخر').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({ embeds: [embed], components: [row] });
  },

  async handleSeasonPass(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    const passMenu = createSeasonPassMenu(player);
    await interaction.update(passMenu);
  },

  async handleClanMenu(interaction) {
    const player = await Player.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if (!player) return;

    if (player.clanId) {
      const Clan = require('../database/models/Clan');
      const clan = await Clan.findById(player.clanId).lean();
      if (clan) {
        const membersBar = '█'.repeat(Math.min(clan.members.length, 10)) + '░'.repeat(10 - Math.min(clan.members.length, 10));
        const embed = new EmbedBuilder()
          .setColor(config.colors.blueLock)
          .setAuthor({ name: clan.name, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
          .setTitle('🏰 معلومات الكلان')
          .setDescription([`${divider()}`, `🎯 **المستوى**: ${clan.level} | ⭐ **النقاط**: ${clan.points}`].join('\n')): ${clan.level} | ⭐ **النقاط**: ${clan.points}`)
          .addFields(
            { name: '👑 **القائد**', value: `<@${clan.leaderId}>`, inline: true },
            { name: '👥 **الأعضاء**', value: `\`${membersBar}\` ${clan.members.length}`, inline: true },
            { name: '🏆 **السجل**', value: `▸ فوز: ${clan.wins || 0}\n▸ خسارة: ${clan.losses || 0}`, inline: false },
            { name: '⚔️ **حروب الكلانات**', value: `▸ فوز: ${clan.warWins || 0}\n▸ خسارة: ${clan.warLosses || 0}`, inline: false }
          )
      .setFooter({ text: '⚽ Blue Lock Ultimate • العشيرة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('clan_leaderboard').setLabel('📊 التصنيف').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('leave_clan').setLabel('🚪 مغادرة').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
          );

        return interaction.update({ embeds: [embed], components: [row] });
      }
    }

    const clanMenu = createClanMenu(player);
    await interaction.update(clanMenu);
  }
};
