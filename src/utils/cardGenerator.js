let createCanvas, loadImage, registerFont;
try {
  const canvas = require('canvas');
  createCanvas = canvas.createCanvas;
  loadImage = canvas.loadImage;
  registerFont = canvas.registerFont;
} catch (e) {
  // canvas module not installed — card/image generation disabled
}
const path = require('path');
const config = require('../config/config');

const CHARACTER_IMAGES = {
  'Isagi Yoichi': 'https://bluelock-anime-en.com/assets/img/character/isagi.png',
  'Rin Itoshi': 'https://bluelock-anime-en.com/assets/img/character/rin.png',
  'Nagi Seishiro': 'https://bluelock-anime-en.com/assets/img/character/nagi.png',
  'Bachira Meguru': 'https://bluelock-anime-en.com/assets/img/character/bachira.png',
  'Barou Shoei': 'https://bluelock-anime-en.com/assets/img/character/barou.png',
  'Shidou Ryusei': 'https://bluelock-anime-en.com/assets/img/character/shidou.png',
  'Kaiser Michael': 'https://bluelock-anime-en.com/assets/img/character/kaiser.png',
  'Sae Itoshi': 'https://bluelock-anime-en.com/assets/img/character/sae.png',
  'Chigiri Hyoma': 'https://bluelock-anime-en.com/assets/img/character/chigiri.png',
  'Reo Mikage': 'https://bluelock-anime-en.com/assets/img/character/reo.png',
};

const DEFAULT_AVATAR = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Blue_Lock_logo.svg/200px-Blue_Lock_logo.svg.png';

class CardGenerator {
  constructor() {
    this.fontsLoaded = false;
    this.images = {};
    this.themeColor = '#00B4D8';
  }

  async loadAssets() {
    if (this.fontsLoaded) return;
    try {
      this.fontsLoaded = true;
    } catch (e) {
      console.warn('Could not load fonts, using defaults');
    }
  }

  async _loadCharacterImage(characterName) {
    const url = CHARACTER_IMAGES[characterName] || DEFAULT_AVATAR;
    if (this.images[url]) return this.images[url];
    try {
      const img = await loadImage(url);
      this.images[url] = img;
      return img;
    } catch (e) {
      return null;
    }
  }

  _getPositionColor(position) {
    const colors = {
      ST: '#FF3366', LW: '#FF6B35', RW: '#FF6B35',
      CM: '#00B4D8', CDM: '#0077B6',
      LB: '#00E5FF', RB: '#00E5FF',
      CB: '#00C853', GK: '#FFD700'
    };
    return colors[position] || '#00B4D8';
  }

  _getRarityColor(rarity) {
    const colors = {
      Common: '#808080', Rare: '#0070DD', Epic: '#A335EE',
      Legendary: '#FF8000', Mythic: '#FF0000', Divine: '#00FFFF'
    };
    return colors[rarity] || '#808080';
  }

  _getRankColor(rank) {
    const r = config.ranks.find(r => r.name === rank);
    return r ? r.color : '#808080';
  }

  _drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  _drawHexagon(ctx, cx, cy, r, rotation = 0) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + rotation;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  _drawStatHex(ctx, cx, cy, size, value, maxVal, color) {
    const ratio = value / maxVal;
    const innerSize = size * ratio;
    this._drawHexagon(ctx, cx, cy, innerSize, -Math.PI / 2);
    ctx.fillStyle = color + '40';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  async generatePlayerCard(player) {
    if (!createCanvas) return null;
    await this.loadAssets();
    const width = 800;
    const height = 1120;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const posColor = this._getPositionColor(player.position);
    const rankColor = this._getRankColor(player.rank);
    const ovr = player.calculateOVR ? player.calculateOVR() : 50;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0A0A23');
    bgGrad.addColorStop(0.5, '#1A1A3E');
    bgGrad.addColorStop(1, '#0A0A23');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Border glow
    ctx.shadowColor = posColor;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = posColor;
    ctx.lineWidth = 4;
    this._drawRoundedRect(ctx, 10, 10, width - 20, height - 20, 20);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Title bar
    const titleGrad = ctx.createLinearGradient(0, 0, width, 0);
    titleGrad.addColorStop(0, posColor);
    titleGrad.addColorStop(1, '#FFD700');
    ctx.fillStyle = titleGrad;
    this._drawRoundedRect(ctx, 20, 20, width - 40, 60, 15);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BLUE LOCK PLAYER CARD', width / 2, 60);

    // Avatar with character image
    const avatarSize = 160;
    const avatarX = width / 2 - avatarSize / 2;
    const avatarY = 110;

    ctx.shadowColor = posColor;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2);
    ctx.fillStyle = posColor;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#1A1A3E';
    ctx.fill();
    ctx.strokeStyle = posColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Try to load character image
    const charImg = await this._loadCharacterImage(player.character);
    if (charImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2 - 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(charImg, avatarX + 4, avatarY + 4, avatarSize - 8, avatarSize - 8);
      ctx.restore();
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.character ? player.character.charAt(0).toUpperCase() : (player.name ? player.name.charAt(0).toUpperCase() : '?'), width / 2, avatarY + avatarSize / 2);
      ctx.textBaseline = 'alphabetic';
    }

    // Player name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.name || 'Unknown', width / 2, 310);

    // OVR rating
    this._drawRoundedRect(ctx, width / 2 - 50, 330, 100, 50, 25);
    const ovrGrad = ctx.createLinearGradient(width / 2 - 50, 0, width / 2 + 50, 0);
    ovrGrad.addColorStop(0, posColor);
    ovrGrad.addColorStop(1, '#FFD700');
    ctx.fillStyle = ovrGrad;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`OVR ${ovr}`, width / 2, 362);

    // Info section
    const infoY = 410;
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';

    const infoItems = [
      { label: 'LEVEL', value: player.level || 1, color: '#00FF88' },
      { label: 'RANK', value: player.rank || 'Bronze', color: rankColor },
      { label: 'POSITION', value: player.position || 'N/A', color: posColor },
      { label: 'STYLE', value: player.playStyle || 'N/A', color: '#FFD700' },
      { label: 'CHARACTER', value: player.character || 'N/A', color: '#A335EE' },
      { label: 'POTENTIAL', value: (player.potential && player.potential.type) || 'Common', color: this._getRarityColor((player.potential && player.potential.type) || 'Common') }
    ];

    infoItems.forEach((item, i) => {
      const y = infoY + i * 35;
      const labelWidth = ctx.measureText(item.label + ':').width;

      ctx.fillStyle = '#8888AA';
      ctx.fillText(item.label + ':', 40, y);

      ctx.fillStyle = item.color;
      ctx.fillText(String(item.value), 50 + labelWidth, y);
    });

    // Stats section
    const statsY = 670;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('STATS', width / 2, statsY);

    const stats = player.stats || {};
    const statNames = ['shooting', 'dribbling', 'passing', 'vision', 'speed', 'defense', 'stamina', 'finishing', 'control', 'reaction', 'ego'];
    const statColors = ['#FF4444', '#FF6B35', '#00B4D8', '#A335EE', '#00FF88', '#FFD700', '#FF69B4', '#FF3366', '#00E5FF', '#FFA500', '#FF0000'];

    const barX = 60;
    const barWidth = 680;
    const barHeight = 18;
    const barGap = 8;
    const startY = statsY + 30;

    statNames.forEach((name, i) => {
      const y = startY + i * (barHeight + barGap);
      const value = stats[name] || 50;
      const fillWidth = (value / 99) * barWidth;

      ctx.fillStyle = '#2A2A4E';
      this._drawRoundedRect(ctx, barX, y, barWidth, barHeight, 9);
      ctx.fill();

      const barGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      barGrad.addColorStop(0, statColors[i]);
      barGrad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = barGrad;
      this._drawRoundedRect(ctx, barX, y, fillWidth, barHeight, 9);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(name.charAt(0).toUpperCase() + name.slice(1), barX + 8, y + 14);

      ctx.textAlign = 'right';
      ctx.fillText(String(value), barX + barWidth - 8, y + 14);
    });

    // XP bar at bottom
    const xpY = height - 70;
    const xpBarWidth = 700;
    const xpBarHeight = 20;
    const xpBarX = (width - xpBarWidth) / 2;

    ctx.fillStyle = '#2A2A4E';
    this._drawRoundedRect(ctx, xpBarX, xpY, xpBarWidth, xpBarHeight, 10);
    ctx.fill();

    const xpProgress = player.xp || 0;
    const xpMax = player.xpToNext || 100;
    const xpFill = (xpProgress / xpMax) * xpBarWidth;
    const xpGrad = ctx.createLinearGradient(xpBarX, 0, xpBarX + xpBarWidth, 0);
    xpGrad.addColorStop(0, '#00B4D8');
    xpGrad.addColorStop(1, '#A335EE');
    ctx.fillStyle = xpGrad;
    this._drawRoundedRect(ctx, xpBarX, xpY, xpFill, xpBarHeight, 10);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.xp || 0} / ${xpMax} XP`, width / 2, xpY + 15);

    // Footer
    ctx.fillStyle = '#555577';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BLUE LOCK ULTIMATE', width / 2, height - 30);

    // Watermark
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BL', width / 2, height / 2);
    ctx.globalAlpha = 1.0;

    return canvas.toBuffer();
  }

  async generateVSBanner(player1, player2, p1, p2) {
    if (!createCanvas) return null;
    const width = 1000;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const bgGrad = ctx.createLinearGradient(0, 0, width, 0);
    bgGrad.addColorStop(0, '#0A0A23');
    bgGrad.addColorStop(0.3, '#1A1A3E');
    bgGrad.addColorStop(0.5, '#FF3366');
    bgGrad.addColorStop(0.7, '#1A1A3E');
    bgGrad.addColorStop(1, '#0A0A23');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.shadowColor = '#FF3366';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#FF3366';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VS', width / 2, height / 2 + 40);
    ctx.shadowBlur = 0;

    // Try to load character images
    const img1 = p1 ? await this._loadCharacterImage(p1.character) : null;
    const img2 = p2 ? await this._loadCharacterImage(p2.character) : null;

    if (img1) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 4, height / 2 - 30, 70, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img1, width / 4 - 70, height / 2 - 100, 140, 140);
      ctx.restore();
    }

    if (img2) {
      ctx.save();
      ctx.beginPath();
      ctx.arc((width / 4) * 3, height / 2 - 30, 70, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img2, (width / 4) * 3 - 70, height / 2 - 100, 140, 140);
      ctx.restore();
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player1, width / 4, height / 2 + 120);
    ctx.fillText(player2, (width / 4) * 3, height / 2 + 120);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`OVR ${p1?.calculateOVR?.() || 50}`, width / 4, height / 2 + 150);
    ctx.fillText(`OVR ${p2?.calculateOVR?.() || 50}`, (width / 4) * 3, height / 2 + 150);

    return canvas.toBuffer();
  }

  async generateProfileImage(player, achievements = []) {
    if (!createCanvas) return null;
    await this.loadAssets();
    const width = 800;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const posColor = this._getPositionColor(player.position);
    const rankColor = this._getRankColor(player.rank);
    const ovr = player.calculateOVR ? player.calculateOVR() : 50;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0A0A23');
    bgGrad.addColorStop(0.5, '#1A1A3E');
    bgGrad.addColorStop(1, '#0A0A23');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.shadowColor = posColor;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = posColor;
    ctx.lineWidth = 3;
    this._drawRoundedRect(ctx, 10, 10, width - 20, height - 20, 20);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.name}'s Profile`, width / 2, 55);

    const avatarSize = 120;
    ctx.beginPath();
    ctx.arc(width / 2, 130, avatarSize / 2 + 3, 0, Math.PI * 2);
    ctx.fillStyle = posColor;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width / 2, 130, avatarSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#1A1A3E';
    ctx.fill();

    const charImg = await this._loadCharacterImage(player.character);
    if (charImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, 130, avatarSize / 2 - 3, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(charImg, width / 2 - avatarSize / 2 + 3, 130 - avatarSize / 2 + 3, avatarSize - 6, avatarSize - 6);
      ctx.restore();
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.character ? player.character.charAt(0).toUpperCase() : player.name.charAt(0).toUpperCase(), width / 2, 130);
      ctx.textBaseline = 'alphabetic';
    }

    ctx.font = '22px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`OVR ${ovr}`, width / 2, 195);

    ctx.textAlign = 'left';
    ctx.font = '18px Arial';
    let y = 230;
    const info = [
      { label: 'Level', value: player.level, color: '#00FF88' },
      { label: 'Rank', value: player.rank, color: rankColor },
      { label: 'Position', value: player.position, color: posColor },
      { label: 'Style', value: player.playStyle, color: '#FFD700' },
      { label: 'Character', value: player.character, color: '#A335EE' },
      { label: 'Matches', value: player.matchesPlayed || 0, color: '#00B4D8' },
      { label: 'Wins', value: player.wins || 0, color: '#00FF88' },
      { label: 'Goals', value: player.goalsScored || 0, color: '#FF4444' },
      { label: 'Coins', value: player.coins || 0, color: '#FFD700' },
      { label: 'Win Rate', value: `${player.winRate || 0}%`, color: '#A335EE' }
    ];

    info.forEach((item, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = col === 0 ? 60 : 410;
      const yi = y + row * 30 + (col > 0 && row === 0 ? 30 : 0);
      ctx.fillStyle = '#8888AA';
      ctx.fillText(`${item.label}: `, x, yi);
      ctx.fillStyle = item.color;
      ctx.fillText(String(item.value), x + ctx.measureText(`${item.label}: `).width + 5, yi);
    });

    // Achievements
    const achY = 530;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ACHIEVEMENTS', width / 2, achY);

    const displayAch = (achievements || []).slice(0, 8);
    const achGrid = 4;
    displayAch.forEach((ach, i) => {
      const col = i % achGrid;
      const row = Math.floor(i / achGrid);
      const ax = 40 + col * 185;
      const ay = achY + 30 + row * 45;
      ctx.fillStyle = '#2A2A4E';
      this._drawRoundedRect(ctx, ax, ay, 175, 35, 8);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(ach.icon || '⭐', ax + 8, ay + 24);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText((ach.name || ach.id || '').substring(0, 15), ax + 32, ay + 24);
    });

    ctx.fillStyle = '#555577';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BLUE LOCK ULTIMATE', width / 2, height - 30);

    return canvas.toBuffer();
  }

  async generateRankCard(rank, playerName, ovr) {
    if (!createCanvas) return null;
    const width = 600;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const rankColor = this._getRankColor(rank);

    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 300);
    bgGrad.addColorStop(0, '#1A1A3E');
    bgGrad.addColorStop(1, '#0A0A23');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.shadowColor = rankColor;
    ctx.shadowBlur = 40;
    ctx.strokeStyle = rankColor;
    ctx.lineWidth = 4;
    this._drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 20);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RANK', width / 2, 80);

    ctx.fillStyle = rankColor;
    ctx.font = 'bold 64px Arial';
    ctx.fillText(rank.toUpperCase(), width / 2, 180);

    ctx.fillStyle = '#8888AA';
    ctx.font = '20px Arial';
    ctx.fillText(playerName, width / 2, 240);

    ctx.fillStyle = '#FFD700';
    ctx.font = '18px Arial';
    ctx.fillText(`OVR ${ovr}`, width / 2, 280);

    ctx.fillStyle = '#555577';
    ctx.font = '14px Arial';
    ctx.fillText('BLUE LOCK ULTIMATE', width / 2, height - 50);

    return canvas.toBuffer();
  }

  async generateShopItem(name, price, rarity, imageUrl) {
    if (!createCanvas) return null;
    const width = 400;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const rarityColor = this._getRarityColor(rarity);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0A0A23');
    bgGrad.addColorStop(1, '#1A1A3E');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.shadowColor = rarityColor;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = 3;
    this._drawRoundedRect(ctx, 10, 10, width - 20, height - 20, 15);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const iconSize = 100;
    ctx.beginPath();
    ctx.arc(width / 2, 130, iconSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = rarityColor + '30';
    ctx.fill();
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = rarityColor;
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📦', width / 2, 145);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(name, width / 2, 220);

    ctx.fillStyle = rarityColor;
    ctx.font = '18px Arial';
    ctx.fillText(`✦ ${rarity} ✦`, width / 2, 260);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`${price} 🪙`, width / 2, 320);

    ctx.fillStyle = '#555577';
    ctx.font = '14px Arial';
    ctx.fillText('BLUE LOCK ULTIMATE', width / 2, height - 40);

    return canvas.toBuffer();
  }

  async generateLootBoxAnimation(rarity) {
    if (!createCanvas) return null;
    const width = 500;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const rarityColor = this._getRarityColor(rarity);

    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 300);
    bgGrad.addColorStop(0, '#1A1A3E');
    bgGrad.addColorStop(1, '#0A0A23');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const numParticles = 30;
    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 / numParticles) * i;
      const dist = 100 + Math.random() * 150;
      const x = width / 2 + Math.cos(angle) * dist;
      const y = height / 2 + Math.sin(angle) * dist;
      const size = 3 + Math.random() * 5;
      ctx.fillStyle = rarityColor;
      ctx.globalAlpha = 0.3 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.shadowColor = rarityColor;
    ctx.shadowBlur = 60;
    ctx.fillStyle = rarityColor;
    ctx.font = '120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📦', width / 2, height / 2 + 40);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`${rarity} BOX`, width / 2, height - 100);

    ctx.fillStyle = rarityColor;
    ctx.font = '20px Arial';
    ctx.fillText('✦ Click to Open ✦', width / 2, height - 60);

    return canvas.toBuffer();
  }
}

module.exports = new CardGenerator();
