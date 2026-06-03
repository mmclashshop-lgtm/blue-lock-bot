const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, StringSelectMenuBuilder
} = require('discord.js');
const config = require('../config/config');
const { divider, progressBar, bullet } = require('../utils/embeds');

function createMainMenu(ovr) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('· · ────────────𖧧──────────── · ·\n🏟️  القائمة الرئيسية\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      `> *"من سيصبح أعظم مهاجم في العالم؟"*`,
      '',
      divider(),
      '',
      bullet('**⚔️  مباراة** ─ العب سريعة، تصنيف، أو قصة'),
      bullet('**🏋️  تدريب** ─ طور مهاراتك'),
      bullet('**🎯  مهام** ─ أكمل المهام اليومية والأسبوعية'),
      bullet('**🏆  بطولة** ─ تنافس من أجل المجد'),
      bullet('**🛒  متجر** ─ اشتر عناصر وباكات'),
      bullet('**🎴  مجموعتي** ─ عرض بطاقاتك'),
      bullet('**👤  بروفايل** ─ إحصائيات لاعبك'),
      bullet('**📊  ترتيب** ─ لوحة المتصدرين'),
      bullet('**🏰  عشيرة** ─ النادي الخاص بك'),
      '',
      divider(),
      ''
    ].join('\n'))
    .setFooter({
      text: `⚽ OVR ${ovr}  •  Blue Lock Ultimate`,
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('play_match').setLabel('⚔️ مباراة').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('training').setLabel('🏋️ تدريب').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('missions').setLabel('🎯 مهام').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tournament').setLabel('🏆 بطولة').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('shop').setLabel('🛒 متجر').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('collection').setLabel('🎴 مجموعتي').setStyle(ButtonStyle.Secondary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('profile').setLabel('👤 بروفايل').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('rankings').setLabel('📊 ترتيب').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('clan_menu').setLabel('🏰 عشيرة').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2, row3] };
}

function createPlayMenu(player) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('· · ────────────𖧧──────────── · ·\n⚔️  اختار نوع المباراة\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      divider(),
      '',
      bullet('**⚔️  سريعة** ─ العب ضد لاعب عشوائي'),
      bullet('**🤖  ضد البوت** ─ تدرب ضد الذكاء الاصطناعي'),
      bullet('**🎯  تصنيف** ─ مباراة تنافسية مع نقاط تصنيف'),
      bullet('**📖  القصة** ─ اتبع رحلة إيساغي في بلو لوك'),
      '',
      divider(),
      ''
    ].join('\n'))
    .setFooter({ text: 'اختر نوع المباراة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('quick_match').setLabel('⚔️ سريعة').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('bot_match').setLabel('🤖 ضد البوت').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ranked_match').setLabel('🎯 تصنيف').setStyle(ButtonStyle.Danger)
  );
  const storyRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('story_menu').setLabel('📖 القصة').setStyle(ButtonStyle.Success)
  );
  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row, storyRow, backRow] };
}

function createTrainingMenu(player) {
  const stats = player.stats;
  const sessions = player.trainingSessionsToday || 0;
  const attrs = [
    ['🎯 تسديد', 'shooting'],
    ['🪄 مراوغة', 'dribbling'],
    ['🔄 تمرير', 'passing'],
    ['👁️ رؤية', 'vision'],
    ['💨 سرعة', 'speed'],
    ['🛡️ دفاع', 'defense'],
    ['💪 لياقة', 'stamina'],
    ['⚽ إنهاء', 'finishing'],
    ['🎮 تحكم', 'control'],
    ['⚡ رد فعل', 'reaction'],
    ['🔥 أنانية', 'ego']
  ];

  const statsSections = [];
  const half = Math.ceil(attrs.length / 2);
  for (let i = 0; i < half; i++) {
    const idx = i + half;
    if (idx < attrs.length) {
      const left = attrs[i];
      const right = attrs[idx];
      const leftVal = stats[left[1]] || 50;
      const rightVal = stats[right[1]] || 50;
      statsSections.push(
        `${left[0]} \`${leftVal}/99\` ${progressBar(leftVal, 99, 8)}　` +
        `${right[0]} \`${rightVal}/99\` ${progressBar(rightVal, 99, 8)}`
      );
    }
  }

  const embed = new EmbedBuilder()
    .setColor(config.colors.success)
    .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('· · ────────────𖧧──────────── · ·\n🏋️  مركز التدريب\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      `**📊  حصص اليوم:** ${sessions}/5`,
      '',
      divider(),
      '',
      ...statsSections,
      '',
      divider(),
      '',
      sessions >= 5 ? '⚠️  انتهت حصصك لهذا اليوم! عد غداً.' : '👇  اختر إحصائية للتدريب',
      ''
    ].join('\n'))
    .setFooter({ text: `تبقى ${5 - sessions} حصة  •  Blue Lock Ultimate` })
    .setTimestamp();

  const options = attrs.map(([label, key]) => ({
    label, value: key,
    description: `الحالي: ${stats[key] || 50}/99`
  }));

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('train_stat')
      .setPlaceholder('اختر إحصائية للتدريب...')
      .addOptions(options)
      .setDisabled(sessions >= 5)
  );
  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [selectRow, backRow] };
}

function createMissionsMenu(player) {
  const dailyMissions = player.dailyMissions?.missions || [];
  const weeklyMissions = player.weeklyMissions?.missions || [];

  const dailyText = dailyMissions.length > 0
    ? dailyMissions.map(m => formatMissionLine(m)).join('\n')
    : 'لا توجد مهام اليوم';
  const weeklyText = weeklyMissions.length > 0
    ? weeklyMissions.map(m => formatMissionLine(m)).join('\n')
    : 'لا توجد مهام هذا الأسبوع';

  const dailyDone = dailyMissions.filter(m => m.claimed).length;
  const weeklyDone = weeklyMissions.filter(m => m.claimed).length;

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('· · ────────────𖧧──────────── · ·\n🎯  المهام\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      `**📅  يومي** ─ ${dailyDone}/${dailyMissions.length}`,
      divider(),
      dailyText,
      '',
      `**📆  أسبوعي** ─ ${weeklyDone}/${weeklyMissions.length}`,
      divider(),
      weeklyText,
      ''
    ].join('\n'))
    .setFooter({ text: 'أنجز المهمة ثم اضغط للمطالبة بالمكافآت  •  Blue Lock Ultimate' })
    .setTimestamp();

  const claimRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('claim_daily').setLabel('📅 يومي').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('claim_weekly').setLabel('📆 أسبوعي').setStyle(ButtonStyle.Primary)
  );
  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [claimRow, backRow] };
}

function formatMissionLine(m) {
  const status = m.claimed ? '✅' : m.completed ? '🎯' : '⬜';
  const bar = progressBar(m.progress || 0, m.requirement || 1, 12);
  const name = m.name || 'مهمة';
  const xp = m.xpReward || 0;
  const coins = m.coinReward || 0;
  const gems = m.gemReward || 0;
  const rewards = `✨${xp}  🪙${coins}${gems > 0 ? `  💎${gems}` : ''}`;
  return `\n${status}  **${name}**  ─  ${rewards}\n\`${bar}\`  \`${m.progress || 0}/${m.requirement || 1}\``;
}

function createSeasonPassMenu(player) {
  const pass = player.seasonPass || { level: 0, xp: 0, premium: false, claimedLevels: [] };
  const xpToNext = 500;
  const pct = Math.min(pass.xp / xpToNext, 1) * 100;

  const embed = new EmbedBuilder()
    .setColor(pass.premium ? config.colors.accent : config.colors.blueLock)
    .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('· · ────────────𖧧──────────── · ·\n🎫  بطاقة الموسم\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      divider(),
      '',
      `**المستوى** \`${pass.level}\`  •  **XP** ${progressBar(pass.xp, xpToNext)} \`${pass.xp}/${xpToNext}\``,
      '',
      divider(),
      ''
    ].join('\n'))
    .addFields(
      { name: '💎 النوع', value: pass.premium ? '⭐ **ممتاز**' : '🆓 **مجاني**', inline: true },
      { name: '🎁 تم المطالبة', value: `\`${pass.claimedLevels.length}\` مستوى`, inline: true }
    )
    .setFooter({ text: '500 XP لكل مستوى موسم  •  Blue Lock Ultimate' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('claim_pass').setLabel('🎁 المطالبة').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('upgrade_pass').setLabel(`💎 ${pass.premium ? 'مفعل' : 'تطوير'}`).setStyle(ButtonStyle.Success).setDisabled(pass.premium)
  );
  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row, backRow] };
}

function createClanMenu(player) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('· · ────────────𖧧──────────── · ·\n🏰  العشيرة\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      divider(),
      '',
      bullet('**👥  إنشاء / انضمام** ─ أنشئ عشيرتك أو انضم لواحدة'),
      bullet('**⚔️  حروب العشائر** ─ تنافس مع عشائر أخرى'),
      bullet('**🏆  دوري العشائر** ─ موسم تنافسي منظم'),
      bullet('**🏗️  تطوير القاعدة** ─ طور مباني عشيرتك'),
      '',
      divider(),
      ''
    ].join('\n'))
    .setFooter({ text: 'اختر إجراءً  •  Blue Lock Ultimate' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('clan_create').setLabel('👥 إنشاء/انضمام').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('clan_wars').setLabel('⚔️ حروب').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('clan_tournaments').setLabel('🏆 بطولات').setStyle(ButtonStyle.Success)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('league_overview').setLabel('🏆 دوري').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('clan_upgrades').setLabel('🏗️ تطوير').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('clan_info').setLabel('ℹ️ معلومات').setStyle(ButtonStyle.Primary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row, row2, row3] };
}

module.exports = {
  createMainMenu,
  createPlayMenu,
  createTrainingMenu,
  createMissionsMenu,
  createSeasonPassMenu,
  createClanMenu
};