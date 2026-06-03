const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 Deploying ${commands.length} commands...`);

    if (process.env.GUILD_ID) {
      // Deploy only to the specific guild to avoid duplicate command registration.
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`✅ Deployed to guild ${process.env.GUILD_ID}`);
      console.log('✅ Command deployment complete!');
      return;
    }

    // If no guild ID is specified, deploy globally.
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Deployed globally');
    console.log('✅ Command deployment complete!');
  } catch (error) {
    console.error('❌ Failed to deploy commands:', error);
  }
})();
