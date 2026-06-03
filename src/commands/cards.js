const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const config = require('../config/config');
const { GACHA_PLAYERS, RARITY_STYLES } = require('../data/gachaData');

const RARITY_ORDER = ['mythic', 'legendary', 'epic', 'rare', 'common'];

let allPlayersCache = null;

function getAllPlayers() {
  if (allPlayersCache) return allPlayersCache;
  const list = [];
  for (const rarity of RARITY_ORDER) {
    for (const p of (GACHA_PLAYERS[rarity] || [])) {
      list.push({ ...p, rarity });
    }
  }
  allPlayersCache = list;
  return list;
}

function getFilteredPlayers(filter) {
  if (filter === 'all') return getAllPlayers();
  return (GACHA_PLAYERS[filter] || []).map(p => ({ ...p, rarity: filter }));
}

function buildCardEmbed(playerData, index, total, filter) {
  const rarity = playerData.rarity;
  const rStyle = RARITY_STYLES[rarity];
  const [min, max] = playerData.ratingRange;
  const avgRating = Math.round((min + max) / 2);
  const stars = avgRating >= 90 ? '★★★★★' : avgRating >= 80 ? '★★★★☆' : avgRating >= 70 ? '★★★☆☆' : avgRating >= 65 ? '★★☆☆☆' : '★☆☆☆☆';

  const embed = new EmbedBuilder()
    .setColor(rStyle.color)
    .setAuthor({
      name: `🏛️  ${rStyle.emoji} ${rStyle.name.toUpperCase()}`,
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTitle(`${playerData.name}`)
    .setThumbnail(playerData.image || 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png')
    .setDescription([
      '',
      `${'─'.repeat(28)}`,
      '',
      `╭${'─'.repeat(22)}╮`,
      `│  ⚡ **OVR ${avgRating}**  ${stars}  │`,
      `│  ${rStyle.emoji}  **${rStyle.name}**${' '.repeat(17 - rStyle.name.length)}│`,
      `│  🎯  **${playerData.position}**${' '.repeat(15 - playerData.position.length)}│`,
      `╰${'─'.repeat(22)}╯`,
      '',
      `${'─'.repeat(28)}`,
      ''
    ].join('\n'))
    .addFields(
      { name: '📊 Rating Range', value: `\`${min}\` — \`${max}\``, inline: true },
      { name: '🎯 Position', value: `\`${playerData.position}\``, inline: true },
      { name: '💎 Rarity', value: `${rStyle.emoji} \`${rStyle.name}\``, inline: true },
      { name: '⭐ Average OVR', value: `\`${avgRating}/99\``, inline: true },
      { name: '📦 Found In', value: getPackSources(playerData.rarity), inline: true },
      { name: '🔢 Card #', value: `\`${index + 1}/${total}\``, inline: true }
    )
    .setFooter({
      text: `🏛️ Card Museum  •  ${playerData.name}  •  ${rStyle.name}`,
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setTimestamp();

  if (rarity === 'mythic') {
    embed.setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHoxaHh4MTRsZml3ZGliZmdlMTZ4dWxpZGhhZnZidnRvN2NuZzN1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlNQ03J5JxX6lAm/giphy.gif');
  } else if (rarity === 'legendary') {
    embed.setImage('https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnN2aGk0bHpjeGxmcXpncWZraDM5dGJ1bTFreW1sY2piMnFjOGFmZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btTqfTLGH9H5B6/giphy.gif');
  } else if (rarity === 'epic') {
    embed.setImage('https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDk0cGx2NnF4emVsN3VhbWhrOTF0YzRsd3RwNjdyYTZmeGhirTRveiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYC0LQ5g1W6W6GY/giphy.gif');
  }

  return embed;
}

function getPackSources(rarity) {
  const { PACKS } = require('../data/gachaData');
  const sources = Object.entries(PACKS)
    .filter(([_, p]) => p.rates[rarity] > 0)
    .map(([_, p]) => `${p.emoji} ${p.name} (${p.rates[rarity]}%)`);
  return sources.length > 0 ? sources.join('\n') : '❌ غير متاح في أي باك';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cards')
    .setDescription('⚠ معرض جميع بطاقات Blue Lock المتاحة في البوت'),

  async execute(interaction) {
    const all = getAllPlayers();
    const embed = buildCardEmbed(all[0], 0, all.length, 'all');
    const rows = buildActionRows(0, all.length, 'all');
    await interaction.reply({ embeds: [embed], components: rows });
  },

  async handleNav(interaction, filter, direction) {
    const players = getFilteredPlayers(filter);
    const currentMatch = interaction.message.embeds[0]?.footer?.text;
    let currentIndex = 0;

    for (let i = 0; i < players.length; i++) {
      if (currentMatch && players[i].name && currentMatch.includes(players[i].name)) {
        currentIndex = i;
        break;
      }
    }

    let newIndex = currentIndex;
    if (direction === 'next') newIndex = Math.min(currentIndex + 1, players.length - 1);
    else if (direction === 'prev') newIndex = Math.max(currentIndex - 1, 0);
    else if (direction === 'first') newIndex = 0;
    else if (direction === 'last') newIndex = players.length - 1;

    const embed = buildCardEmbed(players[newIndex], newIndex, players.length, filter);
    const rows = buildActionRows(newIndex, players.length, filter);
    await interaction.update({ embeds: [embed], components: rows });
  },

  async handleRarityFilter(interaction, filter) {
    const players = getFilteredPlayers(filter);
    if (players.length === 0) {
      return interaction.reply({ content: '⚠️ لا يوجد لاعبين في هذه الندرة', flags: 64 });
    }
    const embed = buildCardEmbed(players[0], 0, players.length, filter);
    const rows = buildActionRows(0, players.length, filter);
    await interaction.update({ embeds: [embed], components: rows });
  }
};

function buildActionRows(currentIndex, total, filter) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  const navRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId(`cards_nav_first_${filter}`).setLabel('⏪').setStyle(ButtonStyle.Secondary).setDisabled(isFirst),
      new ButtonBuilder().setCustomId(`cards_nav_prev_${filter}`).setLabel('◀️').setStyle(ButtonStyle.Primary).setDisabled(isFirst),
      new ButtonBuilder().setCustomId('cards_nav_info').setLabel(`${currentIndex + 1}/${total}`).setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId(`cards_nav_next_${filter}`).setLabel('▶️').setStyle(ButtonStyle.Primary).setDisabled(isLast),
      new ButtonBuilder().setCustomId(`cards_nav_last_${filter}`).setLabel('⏩').setStyle(ButtonStyle.Secondary).setDisabled(isLast)
    );

  const filterRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('cards_filter_all').setLabel('🏛️ All').setStyle(filter === 'all' ? ButtonStyle.Primary : ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('cards_filter_mythic').setLabel(`${RARITY_STYLES.mythic.emoji}`).setStyle(filter === 'mythic' ? ButtonStyle.Primary : ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('cards_filter_legendary').setLabel(`${RARITY_STYLES.legendary.emoji}`).setStyle(filter === 'legendary' ? ButtonStyle.Primary : ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('cards_filter_epic').setLabel(`${RARITY_STYLES.epic.emoji}`).setStyle(filter === 'epic' ? ButtonStyle.Primary : ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('cards_filter_rare').setLabel(`${RARITY_STYLES.rare.emoji}`).setStyle(filter === 'rare' ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );

  const filterRow2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('cards_filter_common').setLabel(`${RARITY_STYLES.common.emoji}`).setStyle(filter === 'common' ? ButtonStyle.Primary : ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
    );

  return [navRow, filterRow, filterRow2];
}
