const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const { progressBar, divider } = require('../utils/embeds');

class EventManager {
  constructor() {
    this.activeEvents = new Map();
    this.eventTypes = {
      WORLD_CUP: { name: '🌍 World Cup', duration: 604800000, multiplier: 3 },
      BLUE_LOCK_CUP: { name: '🔵 Blue Lock Cup', duration: 345600000, multiplier: 2 },
      TRAINING_CAMP: { name: '🏋️ Training Camp', duration: 172800000, multiplier: 2 },
      COIN_RUSH: { name: '🪙 Coin Rush', duration: 86400000, multiplier: 2 },
      CLAN_WARS: { name: '⚔️ Clan Wars', duration: 604800000, multiplier: 2.5 },
      EVENT_MATCH: { name: '🎯 Special Match', duration: 259200000, multiplier: 2 }
    };
  }

  async startEvent(guildId, client, eventType, customConfig = {}) {
    const template = this.eventTypes[eventType];
    if (!template) return { success: false, message: 'Unknown event type' };

    const eventConfig = { ...template, ...customConfig };
    const eventId = `event_${Date.now()}`;
    const endTime = Date.now() + eventConfig.duration;

    const event = {
      id: eventId,
      guildId,
      type: eventType,
      name: eventConfig.name,
      startTime: Date.now(),
      endTime,
      multiplier: eventConfig.multiplier,
      active: true,
      stats: { matchesPlayed: 0, totalXpEarned: 0, totalCoinsEarned: 0, participants: new Set() }
    };

    this.activeEvents.set(eventId, event);

    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setAuthor({ name: '🌟 EVENT STARTED', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(eventConfig.name)
      .setDescription([
        `**${eventConfig.name}** is now active!`,
        divider(),
        `⚡ **×${eventConfig.multiplier}** all rewards`,
        `⏱ Duration: ${msToTime(eventConfig.duration)}`,
        divider()
      ].join('\n'))
      .setTimestamp();

    const channel = client.guilds.cache.get(guildId)?.channels.cache.find(c => c.name === 'announcements' || c.name === 'events');
    if (channel) await channel.send({ embeds: [embed] }).catch(() => {});

    setTimeout(() => this.endEvent(eventId, client), eventConfig.duration);
    return { success: true, event, message: `${eventConfig.name} started!` };
  }

  async endEvent(eventId, client) {
    const event = this.activeEvents.get(eventId);
    if (!event) return;

    event.active = false;
    const duration = Date.now() - event.startTime;
    const { matchesPlayed, totalXpEarned, totalCoinsEarned, participants } = event.stats;

    const embed = new EmbedBuilder()
      .setColor(config.colors.danger)
      .setAuthor({ name: '🏁 EVENT ENDED', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(`${event.name} has ended!`)
      .setDescription([
        divider(),
        `⚔️ Matches: \`${matchesPlayed}\``,
        `✨ XP Earned: \`${totalXpEarned.toLocaleString()}\``,
        `🪙 Coins Earned: \`${totalCoinsEarned.toLocaleString()}\``,
        `👥 Participants: \`${participants.size}\``,
        divider()
      ].join('\n'))
      .setTimestamp();

    const channel = client.guilds.cache.get(event.guildId)?.channels.cache.find(c => c.name === 'announcements' || c.name === 'events');
    if (channel) await channel.send({ embeds: [embed] }).catch(() => {});

    this.activeEvents.delete(eventId);
  }

  getActiveEvents(guildId) {
    return Array.from(this.activeEvents.values()).filter(e => e.guildId === guildId && e.active);
  }

  getMultiplier(guildId) {
    const events = this.getActiveEvents(guildId);
    return events.reduce((max, e) => Math.max(max, e.multiplier), 1);
  }

  recordActivity(eventId, userId, xpEarned, coinsEarned) {
    const event = this.activeEvents.get(eventId);
    if (!event || !event.active) return;
    event.stats.matchesPlayed++;
    event.stats.totalXpEarned += xpEarned;
    event.stats.totalCoinsEarned += coinsEarned;
    event.stats.participants.add(userId);
  }

  getEventLeaderboard(eventId) {
    const event = this.activeEvents.get(eventId);
    if (!event) return [];
    return Array.from(event.stats.participants).map(userId => ({
      userId,
      xpContributed: event.stats.totalXpEarned
    })).sort((a, b) => b.xpContributed - a.xpContributed).slice(0, 10);
  }
}

function msToTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days}d ${hours % 24}h` : `${hours}h`;
}

module.exports = new EventManager();
