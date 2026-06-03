const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const { getGif, getAnimeResponse } = require('../systems/animeGifs');
const { divider } = require('../utils/embeds');

const ACTIONS = [
  { name: 'Punch', value: 'punch' },
  { name: 'Slap', value: 'slap' },
  { name: 'Hug', value: 'hug' },
  { name: 'Kick', value: 'kick' },
  { name: 'Kiss', value: 'kiss' },
  { name: 'Pat', value: 'pat' },
  { name: 'Poke', value: 'poke' },
  { name: 'Stare', value: 'stare' },
  { name: 'Dance', value: 'dance' },
  { name: 'Celebrate', value: 'celebrate' },
  { name: 'Cry', value: 'cry' },
  { name: 'Blush', value: 'blush' },
  { name: 'Think', value: 'think' },
  { name: 'Wave', value: 'wave' },
  { name: 'Smile', value: 'smile' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gift')
    .setDescription('إرسال ردود فعل أنمي — punch, hug, slap, kiss وغيرها')
    .addStringOption(opt => opt.setName('action').setDescription('نوع الحركة')
      .setRequired(true)
      .addChoices(...ACTIONS.map(a => ({ name: a.name, value: a.value })))
    )
    .addUserOption(opt => opt.setName('target').setDescription('اللاعب المستهدف (اختياري)').setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();

    const action = interaction.options.getString('action');
    const target = interaction.options.getUser('target');
    const gifUrl = await getGif(action);
    const description = getAnimeResponse(action, interaction.user.username, target?.username || 'themselves');

    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setDescription(`**${description}**`)
      .setTimestamp();

    if (gifUrl) embed.setImage(gifUrl);
    if (target) embed.addFields({ name: 'Target', value: `${target}`, inline: true });

    await interaction.editReply({ embeds: [embed] });
  }
};
