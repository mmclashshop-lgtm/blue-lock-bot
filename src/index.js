require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config/config');
const connectDB = require('./database/db');
const errorLogger = require('./systems/errorLogger');
const { initializeDatabase } = require('./systems/databaseInitializer');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ]
});

client.commands = new Collection();

// Load commands
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) {
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
  }
}

// Load events
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Global error handlers with logging
process.on('unhandledRejection', (error) => {
  errorLogger.error('unhandledRejection', error);
});

process.on('uncaughtException', (error) => {
  errorLogger.error('uncaughtException', error);
});

// Scheduled tasks
cron.schedule('0 */6 * * *', () => {
  const draft = require('./systems/draft');
  draft.cleanupOldDrafts();
  errorLogger.info('cron', 'Cleaned up old drafts');
});

cron.schedule('0 0 * * 0', async () => {
  errorLogger.info('cron', 'Weekly reset tasks started');
  const { getWeeklyMissions } = require('./utils/helpers');
  const Clan = require('./database/models/Clan');
  const clubWars = require('./systems/clubWars');
  const guildIds = await Clan.distinct('guildId');
  for (const gid of guildIds) {
    await clubWars.generateWeeklyPairings(gid).catch(e => errorLogger.error('cron', e));
  }
});

cron.schedule('0 12 * * 3', async () => {
  errorLogger.info('cron', 'Mid-week club wars check');
  const clubWars = require('./systems/clubWars');
  const Clan = require('./database/models/Clan');
  const guildIds = await Clan.distinct('guildId');
  for (const gid of guildIds) {
    const active = clubWars.getActiveWars(gid);
    if (active.length === 0) {
      await clubWars.generateWeeklyPairings(gid).catch(e => console.error('Weekly pairing error:', e));
    }
  }
});

// Auto backup every 6 hours
cron.schedule('0 */6 * * *', async () => {
  try {
    const backupSystem = require('./systems/backupSystem');
    const result = await backupSystem.createBackup();
    errorLogger.info('backup', result.message);
  } catch (e) {
    errorLogger.error('backup', e);
  }
});

// Process notification queue every 30s
setInterval(() => {
  const { processNotificationQueue } = require('./systems/notificationSystem');
  processNotificationQueue(client);
}, 30000);

// Start bot
async function start() {
  try {
    await connectDB();

    await initializeDatabase();
    console.log('Database initialized');

    // Init backup system
    try {
      const backupSystem = require('./systems/backupSystem');
      await backupSystem.init();
      console.log('Backup system initialized');
    } catch {}

    // Init event manager
    const eventManager = require('./systems/eventManager');
    console.log('Event manager ready');

    await client.login(config.token);
    errorLogger.info('bot', 'Bot started successfully');
    console.log('Bot is ready!');
    console.log('Active systems: Blue Lock, Daily, Trade, Matchmaking, Fusion, Clan, Events, Backup, Dashboard');

    // Start dashboard
    try {
      const { startDashboard } = require('../dashboard/server');
      startDashboard();
      console.log('Dashboard started');
    } catch (e) {
      console.log('Dashboard not available (requires DASHBOARD_CLIENT_SECRET)');
    }
  } catch (error) {
    errorLogger.error('startup', error);
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

start();

module.exports = client;
