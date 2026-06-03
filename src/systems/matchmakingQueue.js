const Player = require('../database/models/Player');
const matchmaking = require('./matchmaking');

class MatchmakingQueue {
  constructor() {
    this.queue = [];
    this.activeMatches = new Map();
    this.intervals = new Map();
  }

  joinQueue(userId, guildId, interaction) {
    if (this.queue.find(p => p.userId === userId)) {
      return { success: false, message: 'You are already in queue' };
    }

    this.queue.push({ userId, guildId, interaction, joinedAt: Date.now() });
    this.tryMatch(guildId);

    return { success: true, message: 'Joined matchmaking queue!' };
  }

  leaveQueue(userId) {
    const idx = this.queue.findIndex(p => p.userId === userId);
    if (idx === -1) return { success: false, message: 'Not in queue' };
    this.queue.splice(idx, 1);
    return { success: true, message: 'Left matchmaking queue' };
  }

  async tryMatch(guildId) {
    const guildQueue = this.queue.filter(p => p.guildId === guildId);
    if (guildQueue.length < 2) return;

    guildQueue.sort((a, b) => a.joinedAt - b.joinedAt);
    const p1 = guildQueue[0];
    const p2 = guildQueue[1];

    this.queue.splice(this.queue.indexOf(p1), 1);
    this.queue.splice(this.queue.indexOf(p2), 1);

    const player1 = await Player.findOne({ userId: p1.userId, guildId });
    const player2 = await Player.findOne({ userId: p2.userId, guildId });
    if (!player1 || !player2) return;

    const match = await matchmaking.quickMatch(player1, player2);

    const xpGain = match.result === 'p1_win' ? 50 : match.result === 'p2_win' ? 30 : 20;
    const coinGain = match.result === 'p1_win' ? 100 : match.result === 'p2_win' ? 60 : 40;
    const targetXp = match.result === 'p2_win' ? 50 : match.result === 'p1_win' ? 30 : 20;
    const targetCoin = match.result === 'p2_win' ? 100 : match.result === 'p1_win' ? 60 : 40;

    player1.addXP(xpGain);
    player1.coins += coinGain;
    player2.addXP(targetXp);
    player2.coins += targetCoin;
    await player1.save();
    await player2.save();

    const matchId = `match_${Date.now()}`;
    this.activeMatches.set(matchId, { p1: p1.userId, p2: p2.userId, guildId, match });

    const { EmbedBuilder } = require('discord.js');
    const { divider } = require('../utils/embeds');
    const config = require('../config/config');

    for (const p of [p1, p2]) {
      if (p.interaction) {
        try {
          const isWin = (p === p1 && match.result === 'p1_win') || (p === p2 && match.result === 'p2_win');
          const isDraw = match.result === 'draw';
          const embed = new EmbedBuilder()
            .setColor(isWin ? config.colors.success : isDraw ? config.colors.info : config.colors.danger)
            .setAuthor({ name: isWin ? '🏆 Victory!' : isDraw ? '🤝 Draw' : '💔 Defeat', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
            .setTitle('⚔️ Matchmaking Result')
            .setDescription([
              `**${player1.name}** 🆚 **${player2.name}**`,
              divider()
            ].join('\n'))
            .addFields(
              { name: '📊 Result', value: `\`${match.score.p1}\` - \`${match.score.p2}\``, inline: false },
              { name: `🔵 ${player1.name}`, value: isWin && p === p1 ? `🏆 Win  •  ✨ \`+${xpGain} XP\`  •  🪙 \`+${coinGain}\`` : `\`${match.score.p1}\``, inline: true },
              { name: `🔴 ${player2.name}`, value: isWin && p === p2 ? `🏆 Win  •  ✨ \`+${targetXp} XP\`  •  🪙 \`+${targetCoin}\`` : `\`${match.score.p2}\``, inline: true }
            )
            .setTimestamp();
          await p.interaction.editReply({ embeds: [embed], components: [] });
        } catch {}
      }
    }

    this.activeMatches.delete(matchId);
  }

  getQueueStatus(guildId) {
    const guildQueue = this.queue.filter(p => p.guildId === guildId);
    return {
      inQueue: guildQueue.length,
      players: guildQueue.map(p => `<@${p.userId}>`),
      estimatedWait: guildQueue.length < 2 ? 'Waiting for more players...' : 'Ready!'
    };
  }

  isInQueue(userId) {
    return this.queue.some(p => p.userId === userId);
  }
}

module.exports = new MatchmakingQueue();
