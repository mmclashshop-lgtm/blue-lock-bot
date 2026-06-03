const { ActivityType } = require('discord.js');
const config = require('../config/config');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`✅ ${client.user.tag} is online!`);

    client.user.setPresence({
      activities: [{
        name: '⚽ Blue Lock Ultimate',
        type: ActivityType.Playing
      }],
      status: 'online'
    });

    // Set up periodic activities rotation
    const activities = [
      { name: '⚽ Blue Lock Ultimate', type: ActivityType.Playing },
      { name: '🏟️ /menu للمنافسة', type: ActivityType.Playing },
      { name: '🔥 Blue Lock: Episode 2', type: ActivityType.Watching },
      { name: '🎯 مع Isagi Yoichi', type: ActivityType.Playing }
    ];

    let index = 0;
    setInterval(() => {
      index = (index + 1) % activities.length;
      client.user.setActivity(activities[index]);
    }, 30000);
  }
};
