const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const storyMode = require('../systems/storyMode');
const STORY_DATA = require('../data/storyData');
const config = require('../../config');
const { divider, shortDivider, bullet } = require('../utils/embeds');

function createMainStoryEmbed(player) {
  const stats = storyMode.getCompletionStats(player);
  const partsList = STORY_DATA.parts.map((p, i) =>
    `・┆  ${['1️⃣', '2️⃣', '3️⃣', '4️⃣'][i]} **${p.name}** ─ ${p.chapters.length} مراحل`
  ).join('\n');

  const embed = new EmbedBuilder()
    .setColor('#00bfff')
    .setTitle('· · ────────────𖧧──────────── · ·\n📖  قصة بلو لوك\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      'اتبع رحلة إيساغي يويتشي في سجن بلو لوك.',
      'واجه خصوم الأنيمي الحقيقيين وتطور كمهاجم!',
      '',
      divider(),
      '',
      `**📊  التقدم** ─ ${stats.completed}/${stats.total} مرحلة (${stats.percentage}%)`,
      '',
      `**🌟  أجزاء القصة**`,
      '',
      partsList,
      '',
      divider(),
      ''
    ].join('\n'))
    .setThumbnail('https://i.imgur.com/L9qF2dM.png')
    .setFooter({ text: 'انطلق في رحلتك لتصبح أعظم مهاجم في العالم!  •  Blue Lock' });

  return { embeds: [embed] };
}

function createChapterSelectEmbed(player) {
  const progress = storyMode.getProgress(player);
  const completed = progress.completedChapters || [];
  const allChapters = storyMode.getAllChapters();

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('story_chapter_select')
    .setPlaceholder('اختر المرحلة')
    .setMinValues(1)
    .setMaxValues(1);

  for (const part of STORY_DATA.parts) {
    for (const chapter of part.chapters) {
      const isCompleted = completed.includes(chapter.id);
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(`${chapter.name} ${isCompleted ? '✅' : '🔒'}`)
          .setDescription(`OVR ${chapter.requirements.ovr} | ${part.name}`)
          .setValue(chapter.id)
          .setEmoji(isCompleted ? '✅' : '📖')
      );
    }
  }

  const embed = new EmbedBuilder()
    .setColor('#00bfff')
    .setTitle('· · ────────────𖧧──────────── · ·\n📖  اختر المرحلة\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      'اختر المرحلة التي تريد خوضها.',
      'كل مرحلة تحاكي حدثاً حقيقياً من قصّة بلو لوك!',
      '',
      divider(),
      ''
    ].join('\n'))
    .setFooter({ text: '✅ مكتمل  |  🔒 غير مكتمل  •  Blue Lock Story' });

  const row = new ActionRowBuilder().addComponents(selectMenu);

  return { embeds: [embed], components: [row], fetchReply: true };
}

function createChapterInfoEmbed(player, chapter) {
  const progress = storyMode.getProgress(player);
  const completed = progress.completedChapters || [];
  const isCompleted = completed.includes(chapter.id);
  const playerOvr = player.calculateOVR();

  const rewards = [
    chapter.rewards.coins ? `🪙 ${chapter.rewards.coins} عملات` : null,
    chapter.rewards.xp ? `✨ ${chapter.rewards.xp} XP` : null,
    chapter.rewards.cards ? `🎴 ${chapter.rewards.cards} بطاقات` : null,
    chapter.rewards.gems ? `💎 ${chapter.rewards.gems} جواهر` : null
  ].filter(Boolean).join('  |  ');

  const embed = new EmbedBuilder()
    .setColor(isCompleted ? '#00ff00' : '#00bfff')
    .setTitle(`· · ────────────𖧧──────────── · ·\n📖  ${chapter.name}\n· · ────────────𖧧──────────── · ·`)
    .setDescription([
      '',
      chapter.description,
      '',
      divider(),
      '',
      `**🏆  الجزء**  ﹒ ${chapter.partName}`,
      `**📺  الحلقة**  ﹒ ${chapter.episode || 'المانجا'}`,
      `**🎯  الخصم**  ﹒ **${chapter.opponent.name}** (OVR ${chapter.opponent.ovr})`,
      `**🎮  متطلبات**  ﹒ OVR ${chapter.requirements.ovr} (مستواك: ${playerOvr})`,
      `**⚔️  الصعوبة**  ﹒ ${'⭐'.repeat(chapter.difficulty)}`,
      '',
      shortDivider(),
      '',
      `**🎁  المكافآت**`,
      rewards || 'لا توجد مكافآت',
      '',
      shortDivider(),
      '',
      `**📜  الحالة**  ﹒ ${isCompleted ? '✅ مكتملة' : (storyMode.canPlayChapter(player, chapter).success ? '🟢 متاحة للعب' : '🔴 غير متاحة - طور مستواك')}`,
      '',
      divider(),
      ''
    ].join('\n'))
    .setFooter({ text: 'قصة بلو لوك  •  كن أعظم مهاجم في العالم' });

  return { embeds: [embed] };
}

function createMatchResultEmbed(result) {
  const embed = new EmbedBuilder()
    .setColor(result.isWin ? '#00ff00' : '#ff0000')
    .setTitle(result.isWin
      ? '· · ────────────𖧧──────────── · ·\n🏆  انتصار!\n· · ────────────𖧧──────────── · ·'
      : '· · ────────────𖧧──────────── · ·\n💔  هزيمة\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      `**${result.chapterName}** ضد **${result.opponent}**`,
      '',
      divider(),
      '',
      `**⚽  النتيجة**`,
      `**أنت ${result.playerGoals}** - **${result.opponentGoals} الخصم**`,
      '',
      divider(),
      '',
      `**📊  الأداء**`,
      result.isWin
        ? 'لقد أظهرت مهارات استثنائية في الملعب!'
        : 'لم يكن هذا كافياً. حاول مرة أخرى بعد تطوير نفسك!',
      '',
      divider(),
      ''
    ].join('\n'));

  if (result.isWin && result.rewards) {
    embed.addFields({ name: '\n🎁  المكافآت', value: result.rewards, inline: false });
  }

  if (result.dialogue && result.dialogue.length > 0) {
    const lastLine = result.dialogue[result.dialogue.length - 1];
    embed.setFooter({ text: `"${lastLine.text}" — ${lastLine.speaker}` });
  }

  return { embeds: [embed] };
}

function createStoryButtons(chapterId, isCompleted, isWin = false) {
  const buttons = [];

  if (!isCompleted) {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`story_play_${chapterId}`)
        .setLabel('⚔️ العب المرحلة')
        .setStyle(ButtonStyle.Primary)
    );
  }

  if (isWin) {
    buttons.push(
      new ButtonBuilder()
        .setCustomId('story_next_chapter')
        .setLabel('➡️ المرحلة التالية')
        .setStyle(ButtonStyle.Success)
    );
  }

  buttons.push(
    new ButtonBuilder()
      .setCustomId('story_menu')
      .setLabel('🔙 القائمة')
      .setStyle(ButtonStyle.Secondary)
  );

  return buttons.length > 0 ? [new ActionRowBuilder().addComponents(buttons)] : [];
}

function createPartSelectEmbed() {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('story_part_select')
    .setPlaceholder('اختر جزء القصة')
    .setMinValues(1)
    .setMaxValues(1);

  const partEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

  for (let i = 0; i < STORY_DATA.parts.length; i++) {
    const part = STORY_DATA.parts[i];
    selectMenu.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(part.name)
        .setDescription(`${part.chapters.length} مراحل - ${partEmojis[i]}`)
        .setValue(part.id)
        .setEmoji(partEmojis[i])
    );
  }

  const embed = new EmbedBuilder()
    .setColor('#00bfff')
    .setTitle('· · ────────────𖧧──────────── · ·\n📖  أجزاء القصة\n· · ────────────𖧧──────────── · ·')
    .setDescription([
      '',
      'اختر جزء القصة الذي تريد استعراضه',
      '',
      divider(),
      ''
    ].join('\n'))
    .setFooter({ text: '4 أجزاء رئيسية تحاكي قصّة الأنيمي والمانجا  •  Blue Lock Story' });

  const row = new ActionRowBuilder().addComponents(selectMenu);

  return { embeds: [embed], components: [row] };
}

function createPartChaptersEmbed(player, partId) {
  const part = STORY_DATA.parts.find(p => p.id === partId);
  if (!part) {
    return { embeds: [new EmbedBuilder().setColor('#ff0000').setTitle('❌ خطأ').setDescription('هذا الجزء غير موجود')] };
  }

  const progress = storyMode.getProgress(player);
  const completed = progress.completedChapters || [];
  const playerOvr = player.calculateOVR();

  let chaptersList = '';
  for (let i = 0; i < part.chapters.length; i++) {
    const ch = part.chapters[i];
    const isDone = completed.includes(ch.id);
    const canPlay = storyMode.canPlayChapter(player, ch).success;
    const statusEmoji = isDone ? '✅' : (canPlay ? '🟢' : '🔴');
    chaptersList += `\n${statusEmoji}  **${i + 1}. ${ch.name}**`;
    chaptersList += `\n　・┆ ⭐ ${'⭐'.repeat(ch.difficulty)}  ﹒ ${ch.opponent.name} (OVR ${ch.opponent.ovr})  ﹒ متطلب: OVR ${ch.requirements.ovr}`;
  }

  const embed = new EmbedBuilder()
    .setColor('#00bfff')
    .setTitle(`· · ────────────𖧧──────────── · ·\n📖  ${part.name}\n· · ────────────𖧧──────────── · ·`)
    .setDescription([
      '',
      part.description,
      '',
      divider(),
      '',
      `**🎯  المراحل**`,
      chaptersList,
      '',
      divider(),
      ''
    ].join('\n'))
    .setFooter({ text: '🟢 متاح  |  🔴 OVR غير كافي  |  ✅ مكتمل  •  Blue Lock Story' });

  return { embeds: [embed] };
}

module.exports = {
  createMainStoryEmbed,
  createChapterSelectEmbed,
  createChapterInfoEmbed,
  createMatchResultEmbed,
  createStoryButtons,
  createPartSelectEmbed,
  createPartChaptersEmbed
};