const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

function errorEmbed(message) {
  return new EmbedBuilder()
    .setColor(config.colors.danger || 0xFF0000)
    .setAuthor({
      name: '❌ خطأ',
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setDescription([
      '',
      divider(),
      '',
      message,
      '',
      divider(),
      ''
    ])
    .setTimestamp();
}

function successEmbed(title, message) {
  return new EmbedBuilder()
    .setColor(config.colors.success || 0x00FF00)
    .setAuthor({
      name: `✅ ${title || 'نجاح'}`,
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setDescription([
      '',
      divider(),
      '',
      message,
      '',
      divider(),
      ''
    ].join('\n'))
    .setTimestamp();
}

function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(config.colors.info || 0x0070DD)
    .setAuthor({
      name: `ℹ️ ${title || 'معلومات'}`,
      iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png'
    })
    .setDescription([
      '',
      divider(),
      '',
      description,
      '',
      divider(),
      ''
    ].join('\n'))
    .setTimestamp();
}

function divider() {
  return `· · ────────────𖧧──────────── · ·`;
}

function shortDivider() {
  return `· · ────𖧧──── · ·`;
}

function sectionLine(label) {
  return `· · ────✦ ${label} ✦──── · ·`;
}

function bullet(text) {
  return `・┆ ${text}`;
}

function header(text) {
  return [
    `· · ────────────𖧧──────────── · ·`,
    `${text}`,
    `· · ────────────𖧧──────────── · ·`
  ].join('\n');
}

function progressBar(value, max, length = 10) {
  const filled = Math.round((value / max) * length);
  return '█'.repeat(Math.min(filled, length)) + '░'.repeat(Math.max(length - filled, 0));
}

module.exports = { errorEmbed, successEmbed, infoEmbed, divider, shortDivider, sectionLine, bullet, header, progressBar };
