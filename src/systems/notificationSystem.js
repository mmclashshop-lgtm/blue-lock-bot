const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

const subscribers = new Map();
const notificationQueue = [];

const TYPES = {
  TRADE_OFFER: 'trade_offer',
  TRADE_ACCEPTED: 'trade_accepted',
  TRADE_CANCELLED: 'trade_cancelled',
  TOURNAMENT_START: 'tournament_start',
  TOURNAMENT_END: 'tournament_end',
  MATCH_RESULT: 'match_result',
  DAILY_REWARD: 'daily_reward',
  EVENT_START: 'event_start',
  EVENT_END: 'event_end',
  CLAN_INVITE: 'clan_invite',
  MARKET_LISTING: 'market_listing',
  MARKET_SOLD: 'market_sold',
  ACHIEVEMENT: 'achievement'
};

const EMBED_CONFIG = {
  [TYPES.TRADE_OFFER]: { color: config.colors.info, icon: '🤝' },
  [TYPES.TRADE_ACCEPTED]: { color: config.colors.success, icon: '✅' },
  [TYPES.TOURNAMENT_START]: { color: config.colors.danger, icon: '🏆' },
  [TYPES.TOURNAMENT_END]: { color: config.colors.success, icon: '👑' },
  [TYPES.MATCH_RESULT]: { color: config.colors.info, icon: '⚔️' },
  [TYPES.DAILY_REWARD]: { color: config.colors.success, icon: '🎁' },
  [TYPES.EVENT_START]: { color: config.colors.warning, icon: '🌟' },
  [TYPES.EVENT_END]: { color: config.colors.danger, icon: '🏁' },
  [TYPES.CLAN_INVITE]: { color: config.colors.blueLock, icon: '🏰' },
  [TYPES.MARKET_SOLD]: { color: config.colors.success, icon: '💰' },
  [TYPES.ACHIEVEMENT]: { color: config.colors.warning, icon: '⭐' }
};

function subscribe(userId, channel) {
  if (!subscribers.has(userId)) subscribers.set(userId, []);
  subscribers.get(userId).push(channel);
}

function unsubscribe(userId, channel) {
  if (subscribers.has(userId)) {
    subscribers.set(userId, subscribers.get(userId).filter(c => c !== channel));
  }
}

async function notifyUser(client, userId, type, data = {}) {
  const embedConfig = EMBED_CONFIG[type] || { color: config.colors.info, icon: '📢' };
  const embed = new EmbedBuilder()
    .setColor(embedConfig.color)
    .setTitle(`${embedConfig.icon} ${data.title || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`)
    .setDescription(data.description || '')
    .setTimestamp();

  if (data.fields) embed.addFields(data.fields);
  if (data.footer) embed.setFooter({ text: data.footer, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' });

  const userSubs = subscribers.get(userId) || [];
  for (const channel of userSubs) {
    try { await channel.send({ embeds: [embed] }); } catch {}
  }
}

async function notifyAll(client, guildId, type, data = {}) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;

  const embedConfig = EMBED_CONFIG[type] || { color: config.colors.info, icon: '📢' };
  const embed = new EmbedBuilder()
    .setColor(embedConfig.color)
    .setTitle(`${embedConfig.icon} ${data.title || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`)
    .setDescription(data.description || '')
    .setTimestamp();

  if (data.fields) embed.addFields(data.fields);

  const channel = guild.channels.cache.find(c => c.name === 'notifications' || c.name === 'announcements');
  if (channel) {
    try { await channel.send({ embeds: [embed] }); } catch {}
  }
}

async function processNotificationQueue(client) {
  while (notificationQueue.length > 0) {
    const notification = notificationQueue.shift();
    try {
      if (notification.target === 'all') {
        await notifyAll(client, notification.guildId, notification.type, notification.data);
      } else {
        await notifyUser(client, notification.target, notification.type, notification.data);
      }
    } catch {}
  }
}

module.exports = { TYPES, subscribe, unsubscribe, notifyUser, notifyAll, processNotificationQueue };
