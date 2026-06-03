const Player = require('../database/models/Player');
const Clan = require('../database/models/Clan');
const config = require('../config/config');
const { divider } = require('../utils/embeds');

class LeaderboardSystem {
  /**
   * Get player leaderboard based on specified type
   * @param {string} guildId - The guild ID
   * @param {string} type - The type of leaderboard (ovr, level, wins, coins)
   * @param {number} limit - Number of entries to return
   * @returns {Promise<Array>} Array of player objects
   */
  async getPlayerLeaderboard(guildId, type = 'ovr', limit = 10) {
    const sortMap = { 
      ovr: '-level', 
      level: '-level', 
      wins: '-wins', 
      coins: '-coins' 
    };
    const sortField = sortMap[type] || '-level';
    const sortObj = {};
    sortObj[sortField.replace('-', '')] = -1;

    return await Player.find({ guildId: guildId }).sort(sortObj).limit(limit).lean();
  }

  /**
   * Get clan leaderboard based on points
   * @param {string} guildId - The guild ID
   * @param {number} limit - Number of entries to return
   * @returns {Promise<Array>} Array of clan objects
   */
  async getClanLeaderboard(guildId, limit = 10) {
    return await Clan.find({ guildId: guildId }).sort({ points: -1 }).limit(limit).lean();
  }

  /**
   * Format player leaderboard entry for display
   * @param {Object} player - The player object
   * @param {string} type - The type of leaderboard
   * @param {number} index - The position in the leaderboard
   * @returns {string} Formatted leaderboard entry
   */
  formatPlayerEntry(player, type, index) {
    const labels = { 
      ovr: 'OVR', 
      level: 'Level', 
      wins: '🏆 Wins', 
      coins: '🪙 Coins' 
    };
    
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
    
    let value;
    if (type === 'ovr') value = player.level;
    else if (type === 'level') value = player.level;
    else if (type === 'wins') value = player.wins || 0;
    else if (type === 'coins') value = player.coins || 0;
    else value = player.level;
    
    return `${medal} **${player.name}** — ${value} | ${player.rank || 'Bronze'}`;
  }

  /**
   * Format clan leaderboard entry for display
   * @param {Object} clan - The clan object
   * @param {number} index - The position in the leaderboard
   * @returns {string} Formatted leaderboard entry
   */
  formatClanEntry(clan, index) {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
    return `${medal} **${clan.name}** — ${clan.points || 0} pts | 👥 ${clan.members?.length || 0}`;
  }

  /**
   * Create leaderboard embed for players
   * @param {Array} players - Array of player objects
   * @param {string} type - The type of leaderboard
   * @returns {Object} EmbedBuilder object
   */
  createPlayerLeaderboardEmbed(players, type) {
    const { EmbedBuilder } = require('discord.js');
    
    const labels = { 
      ovr: 'التقييم', 
      level: 'المستوى', 
      wins: '🏆 الانتصارات', 
      coins: '🪙 العملات' 
    };
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setAuthor({ name: '📊 لوحة المتصدرين', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(`🏆 ترتيب حسب ${labels[type] || 'OVR'}`)
      .setDescription(
        players.length === 0 
          ? '⚠️ لا يوجد لاعبون بعد' 
          : players.map((p, i) => this.formatPlayerEntry(p, type, i)).join('\n')
      )
      .setFooter({ text: 'لوحة المتصدرين  •  Blue Lock' })
      .setTimestamp();
    
    return embed;
  }

  /**
   * Create leaderboard embed for clans
   * @param {Array} clans - Array of clan objects
   * @returns {Object} EmbedBuilder object
   */
  createClanLeaderboardEmbed(clans) {
    const { EmbedBuilder } = require('discord.js');
    
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setAuthor({ name: '🏆 Clan Leaderboard', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('ترتيب العشائر')
      .setDescription(
        clans.length === 0 
          ? 'لا توجد عشائر بعد' 
          : clans.map((c, i) => this.formatClanEntry(c, i)).join('\n')
      )
      .setTimestamp();
    
    return embed;
  }

  /**
   * Create leaderboard select menu components
   * @returns {Object} ActionRowBuilder with select menu
   */
  createLeaderboardSelectMenu() {
    const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
    
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId('lb_select').setPlaceholder('تغيير الترتيب...')
        .addOptions([
          { label: 'OVR', value: 'lb_ovr', description: 'حسب المستوى' },
          { label: 'الانتصارات', value: 'lb_wins', description: 'حسب الانتصارات' },
          { label: 'العملات', value: 'lb_coins', description: 'حسب العملات' },
          { label: 'العشائر', value: 'lb_clans', description: 'ترتيب العشائر' }
        ])
    );
    
    return row;
  }
}

module.exports = new LeaderboardSystem();