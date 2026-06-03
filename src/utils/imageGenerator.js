let createCanvas, loadImage, registerFont;
try {
  const canvas = require('canvas');
  createCanvas = canvas.createCanvas;
  loadImage = canvas.loadImage;
  registerFont = canvas.registerFont;
} catch (e) {}
let sharp;
try {
  sharp = require('sharp');
} catch (e) {}
const path = require('path');
const config = require('../config/config');

const FONT_PATH = path.join(__dirname, '..', 'assets', 'fonts');

class ImageGenerator {
  constructor() {
    this.canvasWidth = 1000;
    this.canvasHeight = 1400;
    this.fontsLoaded = false;
  }

  async ensureFonts() {
    if (!registerFont) return;
    if (this.fontsLoaded) return;
    try {
      registerFont(path.join(FONT_PATH, 'NotoSans-Regular.ttf'), { family: 'Noto Sans' });
      registerFont(path.join(FONT_PATH, 'NotoSans-Bold.ttf'), { family: 'Noto Sans', weight: 'bold' });
      this.fontsLoaded = true;
    } catch {}
  }

  async generatePlayerCard(player, rank) {
    if (!createCanvas) return null;
    await this.ensureFonts();
    try {
      const canvas = createCanvas(this.canvasWidth, this.canvasHeight);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      ctx.fillStyle = '#16213e';
      ctx.fillRect(20, 20, this.canvasWidth - 40, this.canvasHeight - 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = this.fontsLoaded ? 'bold 48px Noto Sans' : 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(player.name || 'Player', this.canvasWidth / 2, 100);
      ctx.font = this.fontsLoaded ? '32px Noto Sans' : '32px Arial';
      ctx.fillStyle = '#e94560';
      ctx.fillText(`OVR ${rank || '??'}`, this.canvasWidth / 2, 160);
      ctx.fillStyle = '#ffffff';
      ctx.font = this.fontsLoaded ? '24px Noto Sans' : '24px Arial';
      const stats = player.stats || {};
      const statNames = ['shooting', 'dribbling', 'passing', 'speed', 'defense', 'stamina'];
      statNames.forEach((s, i) => {
        const y = 260 + i * 60;
        ctx.textAlign = 'left';
        ctx.fillText(`${s.toUpperCase()}`, 60, y);
        const val = stats[s] || 50;
        ctx.fillStyle = val >= 80 ? '#2ecc71' : val >= 60 ? '#f1c40f' : '#e74c3c';
        ctx.textAlign = 'right';
        ctx.fillText(`${val}/99`, this.canvasWidth - 60, y);
        ctx.fillStyle = '#333';
        ctx.fillRect(60, y + 10, this.canvasWidth - 120, 20);
        ctx.fillStyle = val >= 80 ? '#2ecc71' : val >= 60 ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(60, y + 10, (this.canvasWidth - 120) * (val / 99), 20);
        ctx.fillStyle = '#ffffff';
      });
      return canvas.toBuffer();
    } catch {
      return null;
    }
  }
}

module.exports = new ImageGenerator();
