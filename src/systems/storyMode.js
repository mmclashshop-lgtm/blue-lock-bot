const Player = require('../database/models/Player');
const STORY_DATA = require('../data/storyData');
const { randomRange, randomFloat } = require('../utils/helpers');
const achievementSystem = require('./achievements');

class StoryMode {
  /**
   * Get a player's story progress
   * @param {Object} player - The player object
   * @returns {Object} Story progress data
   */
  getProgress(player) {
    if (!player.storyProgress) {
      player.storyProgress = { completedChapters: [], currentChapter: null, cleared: [] };
    }
    return player.storyProgress;
  }

  /**
   * Get all story chapters
   * @returns {Array} All chapters grouped by parts
   */
  getAllChapters() {
    const chapters = [];
    for (const part of STORY_DATA.parts) {
      for (const chapter of part.chapters) {
        chapters.push({
          ...chapter,
          partId: part.id,
          partName: part.name
        });
      }
    }
    return chapters;
  }

  /**
   * Get chapter by ID
   * @param {string} chapterId - The chapter ID
   * @returns {Object|null} Chapter data or null
   */
  getChapter(chapterId) {
    for (const part of STORY_DATA.parts) {
      const chapter = part.chapters.find(c => c.id === chapterId);
      if (chapter) {
        return { ...chapter, partId: part.id, partName: part.name };
      }
    }
    return null;
  }

  /**
   * Get next available chapter for a player
   * @param {Object} player - The player object
   * @returns {Object|null} Next chapter or null if all completed
   */
  getNextChapter(player) {
    const progress = this.getProgress(player);
    const allChapters = this.getAllChapters();

    for (const chapter of allChapters) {
      if (!progress.completedChapters.includes(chapter.id)) {
        // Check if prereq chapters are completed
        const chapterIndex = allChapters.indexOf(chapter);
        const prevChapters = allChapters.slice(0, chapterIndex);

        const allPrevCompleted = prevChapters.every(
          c => progress.completedChapters.includes(c.id)
        );

        if (allPrevCompleted) {
          return chapter;
        }
      }
    }
    return null;
  }

  /**
   * Check if player meets requirements for a chapter
   * @param {Object} player - The player object
   * @param {Object} chapter - The chapter data
   * @returns {Object} Result with success and message
   */
  canPlayChapter(player, chapter) {
    const progress = this.getProgress(player);

    if (progress.completedChapters.includes(chapter.id)) {
      return { success: false, message: '⚠️ لقد أكملت هذه المرحلة بالفعل' };
    }

    if (chapter.requirements && chapter.requirements.ovr) {
      const playerOvr = player.calculateOVR();
      if (playerOvr < chapter.requirements.ovr) {
        return {
          success: false,
          message: `⚠️ تحتاج مستوى OVR **${chapter.requirements.ovr}** على الأقل. مستوى OVR الحالي: **${playerOvr}**`
        };
      }
    }

    // Check if previous chapters are completed
    const allChapters = this.getAllChapters();
    const chapterIndex = allChapters.findIndex(c => c.id === chapter.id);
    const prevChapters = allChapters.slice(0, chapterIndex);

    const allPrevCompleted = prevChapters.every(
      c => progress.completedChapters.includes(c.id)
    );

    if (!allPrevCompleted) {
      return { success: false, message: '⚠️ يجب إكمال المراحل السابقة أولاً' };
    }

    return { success: true };
  }

  /**
   * Play a chapter match
   * @param {Object} player - The player object
   * @param {Object} chapter - The chapter data
   * @returns {Object} Match result
   */
  async playChapter(player, chapter) {
    const check = this.canPlayChapter(player, chapter);
    if (!check.success) {
      return check;
    }

    const playerOvr = player.calculateOVR();
    const opponentOvr = chapter.opponent.ovr;
    const diff = playerOvr - opponentOvr;

    // Calculate win probability based on OVR difference and difficulty
    let winChance = 0.5 + (diff / 100);
    winChance = Math.max(0.15, Math.min(0.95, winChance));

    // Difficulty modifier
    winChance -= (chapter.difficulty - 1) * 0.05;

    // Ego stat bonus
    const egoBonus = (player.stats.ego || 50) / 500;
    winChance += egoBonus;

    const winRoll = Math.random();
    const isWin = winRoll < winChance;

    // Generate match stats
    const playerGoals = isWin ? randomRange(1, 5) : randomRange(0, 2);
    const opponentGoals = isWin ? randomRange(0, playerGoals - 1) : randomRange(playerGoals + 1, 5);

    // Apply rewards
    let rewardText = '';
    if (isWin) {
      if (!player.storyProgress) {
        player.storyProgress = { completedChapters: [], currentChapter: null, cleared: [] };
      }
      if (!player.storyProgress.completedChapters) {
        player.storyProgress.completedChapters = [];
      }
      player.storyProgress.completedChapters.push(chapter.id);
      player.storyProgress.cleared = player.storyProgress.cleared || [];
      player.storyProgress.cleared.push({
        chapterId: chapter.id,
        completedAt: new Date(),
        score: `${playerGoals}-${opponentGoals}`
      });

      // Award rewards
      if (chapter.rewards.coins) {
        player.coins += chapter.rewards.coins;
        rewardText += `\n🪙 +${chapter.rewards.coins} عملات`;
      }
      if (chapter.rewards.xp) {
        player.addXP(chapter.rewards.xp);
        rewardText += `\n✨ +${chapter.rewards.xp} XP`;
      }
      if (chapter.rewards.cards) {
        rewardText += `\n🎴 +${chapter.rewards.cards} بطاقة`;
      }
      if (chapter.rewards.gems) {
        player.gems = (player.gems || 0) + chapter.rewards.gems;
        rewardText += `\n💎 +${chapter.rewards.gems} جوهرة`;
      }

      await player.save();
    }

    return {
      success: true,
      isWin,
      playerGoals,
      opponentGoals,
      opponent: chapter.opponent.name,
      chapterName: chapter.name,
      rewards: isWin ? rewardText : null,
      dialogue: chapter.dialogue || []
    };
  }

  /**
   * Get total story completion stats for a player
   * @param {Object} player - The player object
   * @returns {Object} Completion statistics
   */
  getCompletionStats(player) {
    const progress = this.getProgress(player);
    const allChapters = this.getAllChapters();
    const completed = progress.completedChapters || [];
    const totalChapters = allChapters.length;

    return {
      completed: completed.length,
      total: totalChapters,
      percentage: Math.round((completed.length / totalChapters) * 100),
      nextChapter: this.getNextChapter(player)
    };
  }
}

module.exports = new StoryMode();