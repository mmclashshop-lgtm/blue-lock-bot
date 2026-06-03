const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const config = require('../config/config');
const clanLeagues = require('../systems/clanLeagues');
const { divider, bullet } = require('../utils/embeds');

function createLeaguesOverview(guildId) {
  const status = clanLeagues.getSeasonStatus(guildId);

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('· · ────────────𖧧──────────── · ·\n🏆  دوري العشائر\n· · ────────────𖧧──────────── · ·')
    .setTimestamp();

  if (!status.active) {
    embed.setDescription([
      '',
      divider(),
      '',
      'لا يوجد موسم نشط حالياً.',
      '',
      'يمكنك إنشاء موسم جديد باستخدام الزر أدناه.',
      '',
      divider(),
      ''
    ].join('\n'))
    .setFooter({ text: 'دوري العشائر  •  Blue Lock' });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('league_create').setLabel('🏆 إنشاء موسم').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('clan_menu').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
    );
    return { embeds: [embed], components: [row] };
  }

  embed.setDescription([
    '',
    divider(),
    '',
    `**📅  الموسم الحالي نشط**`,
    `**🕐  ينتهي:** <t:${Math.floor(status.endsAt / 1000)}:R>`,
    `**📊  التقدم:** ${status.progress} (${status.percentage}%)`,
    '',
    divider(),
    ''
  ].join('\n'))
  .setFooter({ text: 'اختر القسم للاطلاع على الترتيب  •  Blue Lock Clans' });

  const divisions = status.divisions || [];
  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('league_div_select')
      .setPlaceholder('اختر القسم')
      .addOptions(divisions.map(d => ({
        label: d,
        value: `league_${d}`,
        description: `عرض ترتيب ${d}`
      })))
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('league_standings').setLabel('📊 الترتيب الكامل').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('league_round').setLabel('⚔️ لعب الجولة').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('clan_menu').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [selectRow, row] };
}

function createDivisionEmbed(guildId, divisionName) {
  const standings = clanLeagues.getStandings(guildId, divisionName);
  if (!standings) {
    return createLeaguesOverview(guildId);
  }

  const divInfo = clanLeagues.getDivisionInfo(divisionName);
  const embeds = [];

  for (let i = 0; i < standings.length; i += 15) {
    const chunk = standings.slice(i, i + 15);
    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(`· · ────────────𖧧──────────── · ·\n🏆  ${divisionName}\n· · ────────────𖧧──────────── · ·`)
      .setDescription([
        '',
        divider(),
        '',
        ...chunk.map((s, idx) => {
          const pos = i + idx + 1;
          const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `\`${pos}.\``;
          const arrow = divInfo && pos <= divInfo.promotion ? '⬆️' :
            divInfo && pos > standings.length - divInfo.relegation ? '⬇️' : '';
          return `${medal}  **${s.name}** ${arrow}\n　${bullet(`لعب ${s.played}  |  ف ${s.wins}  |  ت ${s.draws}  |  خ ${s.losses}  |  **${s.points}** نقاط`)}`;
        }).join('\n\n'),
        '',
        divider(),
        ''
      ].join('\n'))
      .setFooter({ text: `الصفحة ${Math.floor(i / 15) + 1}/${Math.ceil(standings.length / 15)}  •  Blue Lock Clans` })
      .setTimestamp();

    if (divInfo) {
      embed.addFields(
        { name: '🔼  الصعود', value: `أول ${divInfo.promotion}`, inline: true },
        { name: '🔽  الهبوط', value: `آخر ${divInfo.relegation}`, inline: true }
      );
    }

    embeds.push(embed);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('league_overview').setLabel('📋 نظرة عامة').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('league_round').setLabel('⚔️ لعب الجولة').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('clan_menu').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
  );

  return { embeds, components: [row] };
}

function createAllStandingsEmbed(guildId) {
  const allStandings = clanLeagues.getStandings(guildId);
  if (!allStandings) {
    return createLeaguesOverview(guildId);
  }

  const embeds = [];
  for (const [divName, standings] of Object.entries(allStandings)) {
    const sorted = standings.sort((a, b) => b.points - a.points);
    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setAuthor({ name: '🔵 BLUE LOCK', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle(`· · ────────────𖧧──────────── · ·\n🏆  ${divName}\n· · ────────────𖧧──────────── · ·`)
      .setDescription([
        '',
        divider(),
        '',
        ...sorted.slice(0, 10).map((s, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `\`${i + 1}.\``;
          return `${medal}  **${s.name}** — ${s.points} نقاط | ${s.wins}ف/${s.draws}ت/${s.losses}خ`;
        }),
        '',
        divider(),
        ''
      ].join('\n'))
      .setFooter({ text: 'دوري العشائر  •  Blue Lock' })
      .setTimestamp();

    embeds.push(embed);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('league_overview').setLabel('📋 نظرة عامة').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('clan_menu').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary)
  );

  return { embeds, components: [row] };
}

module.exports = { createLeaguesOverview, createDivisionEmbed, createAllStandingsEmbed };