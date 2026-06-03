const PACKS = {
  basic: {
    name: 'Basic Pack',
    emoji: '📦',
    price: 500,
    color: 0x9D9D9D,
    description: 'الباقة الأساسية للمبتدئين',
    rates: { common: 55, rare: 30, epic: 12, legendary: 3, mythic: 0 },
    minCards: 1
  },
  rare: {
    name: 'Rare Pack',
    emoji: '🔵',
    price: 1500,
    color: 0x0070DD,
    description: 'الباقة النادرة — فرصة أفضل للاعبين المميزين',
    rates: { common: 30, rare: 40, epic: 22, legendary: 7, mythic: 1 },
    minCards: 1
  },
  epic: {
    name: 'Epic Pack',
    emoji: '🟣',
    price: 4000,
    color: 0xA335EE,
    description: 'الباقة الملحمية — مضمونة على الأقل Rare!',
    rates: { common: 10, rare: 30, epic: 40, legendary: 17, mythic: 3 },
    minCards: 1
  },
  legendary: {
    name: 'Legendary Pack',
    emoji: '🟠',
    price: 12000,
    color: 0xFF8C00,
    description: 'الباقة الأسطورية — مضمونة على الأقل Epic!',
    rates: { common: 0, rare: 10, epic: 30, legendary: 45, mythic: 15 },
    minCards: 1
  },
  'world-class': {
    name: 'World Class Pack',
    emoji: '💎',
    price: 35000,
    color: 0x00E5FF,
    description: 'قمة الباقات — أعلى نسبة للـ Mythic!',
    rates: { common: 0, rare: 0, epic: 15, legendary: 40, mythic: 45 },
    minCards: 1
  }
};

const RARITY_STYLES = {
  common: { color: 0x9D9D9D, emoji: '⬜', name: 'Common', glow: '#9D9D9D', valueMultiplier: 1 },
  rare: { color: 0x0070DD, emoji: '🔵', name: 'Rare', glow: '#0070DD', valueMultiplier: 3 },
  epic: { color: 0xA335EE, emoji: '🟣', name: 'Epic', glow: '#A335EE', valueMultiplier: 8 },
  legendary: { color: 0xFF8C00, emoji: '🟠', name: 'Legendary', glow: '#FF8C00', valueMultiplier: 25 },
  mythic: { color: 0xE6CC80, emoji: '💎', name: 'Mythic', glow: '#F5D742', valueMultiplier: 80 }
};

const DUPLICATE_COMPENSATION = {
  common: 50,
  rare: 200,
  epic: 800,
  legendary: 3000,
  mythic: 15000
};

const GACHA_PLAYERS = {
  common: [
    { name: 'Igarashi', position: 'CB', ratingRange: [60, 64], image: 'https://static.wikia.nocookie.net/bluelock/images/a/aa/Gurimu_Igarashi.png' },
    { name: 'Naruhaya', position: 'LW', ratingRange: [60, 64], image: 'https://static.wikia.nocookie.net/bluelock/images/8/89/Asahi_Naruhaya.png' },
    { name: 'Kuon', position: 'CB', ratingRange: [61, 65], image: 'https://static.wikia.nocookie.net/bluelock/images/e/ed/Wataru_Kuon.png' },
    { name: 'Imamura', position: 'GK', ratingRange: [60, 63], image: 'https://static.wikia.nocookie.net/bluelock/images/2/2e/Yudai_Imamura.png' },
    { name: 'Hiiragi', position: 'CM', ratingRange: [62, 66], image: 'https://static.wikia.nocookie.net/bluelock/images/1/18/Reji_Hiiragi_(anime).png' }
  ],
  rare: [
    { name: 'Raichi', position: 'CM', ratingRange: [67, 73], image: 'https://static.wikia.nocookie.net/bluelock/images/5/5c/Jingo_Raichi.png' },
    { name: 'Zantetsu', position: 'LW', ratingRange: [68, 74], image: 'https://static.wikia.nocookie.net/bluelock/images/3/39/Zantetsu_Tsurugi.png' },
    { name: 'Niko', position: 'CB', ratingRange: [69, 75], image: 'https://static.wikia.nocookie.net/bluelock/images/a/a4/Ikki_Niko.png' },
    { name: 'Tokimitsu', position: 'DM', ratingRange: [68, 73], image: 'https://static.wikia.nocookie.net/bluelock/images/b/b4/Aoshi_Tokimitsu.png' },
    { name: 'Aryu', position: 'CB', ratingRange: [70, 75], image: 'https://static.wikia.nocookie.net/bluelock/images/4/40/Jyubei_Aryu.png' }
  ],
  epic: [
    { name: 'Chigiri Hyoma', position: 'LW', ratingRange: [76, 82], image: 'https://static.wikia.nocookie.net/bluelock/images/f/f5/Hyoma_Chigiri.png' },
    { name: 'Bachira Meguru', position: 'LW', ratingRange: [77, 83], image: 'https://static.wikia.nocookie.net/bluelock/images/f/f5/Meguru_Bachira.png' },
    { name: 'Kunigami Rensuke', position: 'CF', ratingRange: [76, 82], image: 'https://static.wikia.nocookie.net/bluelock/images/8/87/Rensuke_Kunigami.png' },
    { name: 'Yukimiya Kenyu', position: 'LW', ratingRange: [75, 81], image: 'https://static.wikia.nocookie.net/bluelock/images/7/73/Kenyu_Yukimiya.png' },
    { name: 'Karasu Tabito', position: 'CM', ratingRange: [77, 83], image: 'https://static.wikia.nocookie.net/bluelock/images/4/4b/Tabito_Karasu.png' },
    { name: 'Otoya Eita', position: 'RW', ratingRange: [76, 82], image: 'https://static.wikia.nocookie.net/bluelock/images/2/23/Eita_Otoya.png' }
  ],
  legendary: [
    { name: 'Nagi Seishiro', position: 'CF', ratingRange: [84, 89], image: 'https://static.wikia.nocookie.net/bluelock/images/c/c9/Seishiro_Nagi.png' },
    { name: 'Mikage Reo', position: 'CM', ratingRange: [83, 88], image: 'https://static.wikia.nocookie.net/bluelock/images/4/40/Reo_Mikage.png' },
    { name: 'Barou Shoei', position: 'ST', ratingRange: [85, 90], image: 'https://static.wikia.nocookie.net/bluelock/images/f/f0/Shoei_Baro.png' },
    { name: 'Shidou Ryusei', position: 'ST', ratingRange: [85, 91], image: 'https://static.wikia.nocookie.net/bluelock/images/b/b3/Ryusei_Shido.png' },
    { name: 'Aiku Oliver', position: 'CB', ratingRange: [84, 89], image: 'https://static.wikia.nocookie.net/bluelock/images/f/fc/Oliver_Aiku.png' }
  ],
  mythic: [
    { name: 'Isagi Yoichi', position: 'CF', ratingRange: [91, 97], image: 'https://static.wikia.nocookie.net/bluelock/images/3/39/Yoichi_Isagi.png' },
    { name: 'Rin Itoshi', position: 'CF', ratingRange: [92, 98], image: 'https://static.wikia.nocookie.net/bluelock/images/1/12/Rin_Itoshi.png' },
    { name: 'Sae Itoshi', position: 'CM', ratingRange: [93, 99], image: 'https://static.wikia.nocookie.net/bluelock/images/f/f3/Sae_Itoshi.png' },
    { name: 'Kaiser Michael', position: 'CF', ratingRange: [92, 97], image: 'https://static.wikia.nocookie.net/bluelock/images/f/f0/Michael_Kaiser.png' },
    { name: 'Noa Noel', position: 'CF', ratingRange: [94, 99], image: 'https://static.wikia.nocookie.net/bluelock/images/1/1d/Noel_Noa.png' },
    { name: 'Loki Julian', position: 'RW', ratingRange: [91, 96], image: 'https://static.wikia.nocookie.net/bluelock/images/2/21/Julian_Loki.png' }
  ]
};

module.exports = { PACKS, RARITY_STYLES, DUPLICATE_COMPENSATION, GACHA_PLAYERS };
