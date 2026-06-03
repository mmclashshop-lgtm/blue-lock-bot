const fetch = (...args) => import('node-fetch').then(m => m.default(...args));

const GIF_SOURCES = {
  nekolife: 'https://nekos.life/api/v2/img',
  nekoapi: 'https://nekobot.xyz/api/image?type='
};

const TAGS = {
  celebrate: ['waifu', 'neko'],
  punch: ['neko'],
  slap: ['neko'],
  hug: ['neko', 'hug'],
  kick: ['neko'],
  blush: ['neko', 'blush'],
  cry: ['neko', 'cry'],
  dance: ['neko', 'dance'],
  smile: ['neko', 'smile'],
  think: ['neko', 'think'],
  wave: ['neko', 'wave'],
  stare: ['neko', 'stare'],
  bonus: ['neko', 'bonus']
};

async function getGif(tag) {
  try {
    const endpoint = `https://api.waifu.pics/sfw/${tag}`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.url || null;
  } catch {
    try {
      const res = await fetch(`https://nekos.life/api/v2/img/${tag}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  }
}

function getAnimeResponse(type, userName, targetName) {
  const templates = {
    punch: [
      `${userName} punches ${targetName}! 🥊`,
      `${targetName} got knocked out by ${userName}! 💥`,
      `${userName} lands a devastating blow on ${targetName}!`
    ],
    slap: [
      `${userName} slaps ${targetName}! 👋`,
      `${targetName} got slapped by ${userName}! 😲`,
    ],
    hug: [
      `${userName} hugs ${targetName}! 🤗`,
      `${targetName} receives a warm hug from ${userName}! 💙`,
    ],
    kick: [
      `${userName} kicks ${targetName}! 🦵`,
      `${targetName} got sent flying by ${userName}! 💨`,
    ],
    kiss: [
      `${userName} kisses ${targetName}! 💋`,
      `${targetName} is blushing after ${userName}'s kiss! 😊`,
    ],
    pat: [
      `${userName} pats ${targetName}'s head! 🐱`,
      `${targetName} enjoys the pats from ${userName}! ✨`,
    ],
    poke: [
      `${userName} pokes ${targetName}! 👆`,
      `${targetName} got poked by ${userName}! 😮`,
    ],
    stare: [
      `${userName} stares intensely at ${targetName}... 👀`,
      `${targetName} feels ${userName}'s gaze! 🔥`,
    ],
    dance: [
      `${userName} dances with ${targetName}! 💃`,
      `${targetName} joins ${userName} on the dance floor! 🎵`,
    ],
    celebrate: [
      `${userName} celebrates! 🎉`,
      `${userName} is victorious! 🏆`,
    ],
    cry: [
      `${userName} is crying... 😢`,
      `${targetName} tries to comfort ${userName}! 💧`,
    ],
    blush: [
      `${userName} blushes! 😊`,
      `${targetName} made ${userName} blush! 💕`,
    ],
    think: [
      `${userName} is thinking deeply... 🤔`,
      `${userName} has a brilliant idea! 💡`,
    ],
    wave: [
      `${userName} waves at ${targetName}! 👋`,
      `${targetName} waves back at ${userName}! ✋`,
    ],
    smile: [
      `${userName} smiles brightly! 😊`,
      `${targetName} smiles at ${userName}! ✨`,
    ],
    bonus: [
      `${userName} receives a bonus! 🎁`,
      `Bonus time for ${userName}! 🌟`,
    ]
  };

  const responses = templates[type] || [`${userName} does something!`];
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = { getGif, getAnimeResponse, TAGS };
