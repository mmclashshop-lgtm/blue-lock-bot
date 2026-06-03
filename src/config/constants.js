const config = require('./config');

module.exports = {
  VERSION: '1.0.0',
  BOT_NAME: 'Blue Lock Ultimate',
  FOOTER_TEXT: 'بلو لوك • © 2024',
  SUPPORT_SERVER: 'https://discord.gg/bluelock',

  EVENTS: {
    PLAYER_CREATED: 'player_created',
    MATCH_STARTED: 'match_started',
    MATCH_ENDED: 'match_ended',
    LEVEL_UP: 'level_up',
    RANK_UP: 'rank_up',
    ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
    CLAN_CREATED: 'clan_created',
    TOURNAMENT_STARTED: 'tournament_started',
    TOURNAMENT_ENDED: 'tournament_ended'
  },

  TIMERS: {
    DAILY_RESET: '0 0 * * *',
    WEEKLY_RESET: '0 0 * * 0',
    SEASON_PASS_RESET: '0 0 1 * *',
    CLUB_WARS: '0 0 * * 6'
  },

  MESSAGES: {
    NO_PLAYER: '⚠️ يجب عليك إنشاء لاعب أولاً! استخدم /start',
    PLAYER_EXISTS: '⚠️ لديك بالفعل لاعب! استخدم /menu',
    COOLDOWN: '⏳ انتظر قليلاً قبل استخدام هذا الأمر مرة أخرى',
    NOT_ENOUGH_COINS: '🪙 ليس لديك عملات كافية!',
    NOT_ENOUGH_GEMS: '💎 ليس لديك جواهر كافية!',
    MATCH_FOUND: '✅ تم العثور على خصم!',
    MATCH_CANCELLED: '❌ تم إلغاء المباراة',
    TRAINING_DONE: '✅ تم الانتهاء من التدريب!',
    MISSION_COMPLETE: '🎯 تم إكمال المهمة!',
    RANK_UP: '🎉 تهانينا! لقد ترقيت إلى رتبة {rank}!',
    LEVEL_UP: '🎉 تهانينا! لقد وصلت إلى المستوى {level}!'
  },

  IMAGES: {
    BANNER: 'https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery03.jpg',
    LOGO: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png',
    VS: 'https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery01.jpg',
    CARD_BG: 'https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery03.jpg',
    PROFILE_BG: 'https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery01.jpg',
    SHOP_BG: 'https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery02.jpg',
    RANK_BG: 'https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery03.jpg',
    LOOTBOX: {
      common: 'https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery02.jpg',
      rare: 'https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery01.jpg',
      epic: 'https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery03.jpg',
      legendary: 'https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery01.jpg',
      mythic: 'https://bluelock-anime-en.com/wp-content/themes/anime/assets/images/gallery03.jpg'
    }
  },

  ACHIEVEMENTS: [
    { id: 'first_goal', name: 'الهدف الأول', description: 'سجل هدفك الأول', icon: '⚽', xpReward: 100, coinReward: 50 },
    { id: 'champion', name: 'البطل', description: 'اربح بطولة', icon: '🏆', xpReward: 500, coinReward: 300 },
    { id: 'monster_striker', name: 'المهاجم الوحش', description: 'سجل 100 هدف', icon: '🔥', xpReward: 1000, coinReward: 500 },
    { id: 'king_of_blue_lock', name: 'ملك بلو لوك', description: 'كن الأقوى', icon: '👑', xpReward: 5000, coinReward: 2000 },
    { id: 'legend', name: 'أسطورة', description: 'وصل للمستوى 50', icon: '⭐', xpReward: 2000, coinReward: 1000 },
    { id: 'goal_getter', name: 'هداف', description: 'سجل 10 أهداف', icon: '🎯', xpReward: 200, coinReward: 100 },
    { id: 'win_streak_5', name: 'سلسلة انتصارات', description: 'اربح 5 مباريات متتالية', icon: '⚡', xpReward: 300, coinReward: 150 },
    { id: 'collector', name: 'جامع', description: 'اجمع 10 بطاقات', icon: '🎴', xpReward: 250, coinReward: 120 },
    { id: 'rich', name: 'غني', description: 'اجمع 10000 عملة', icon: '🪙', xpReward: 400, coinReward: 200 },
    { id: 'trainer', name: 'مدرب', description: 'تدرب 50 مرة', icon: '🏋️', xpReward: 300, coinReward: 150 },
    { id: 'clan_warrior', name: 'محارب العشيرة', description: 'اربح 10 حروب أندية', icon: '🏰', xpReward: 600, coinReward: 300 },
    { id: 'tournament_winner', name: 'بطل البطولة', description: 'اربح 5 بطولات', icon: '🏆', xpReward: 1000, coinReward: 500 },
    { id: 'sharpshooter', name: 'قناص', description: 'حقق دقة تسديد 90%+', icon: '🎯', xpReward: 350, coinReward: 175 },
    { id: 'unbreakable', name: 'لا يُكسر', description: 'حقق 10 كلين شيت', icon: '🛡️', xpReward: 400, coinReward: 200 },
    { id: 'mvp', name: 'أفضل لاعب', description: 'كن أفضل لاعب في مباراة', icon: '⭐', xpReward: 200, coinReward: 100 },
    { id: 'comeback', name: 'ملك العودة', description: 'افوز من تأخر', icon: '🔄', xpReward: 300, coinReward: 150 },
    { id: 'hundred_matches', name: 'محارب قديم', description: 'العب 100 مباراة', icon: '⚔️', xpReward: 500, coinReward: 250 },
    { id: 'clan_leader', name: 'قائد العشيرة', description: 'كون كلان', icon: '👑', xpReward: 400, coinReward: 200 },
    { id: 'diamond_rank', name: 'يد ألماسية', description: 'وصل لرتبة Diamond', icon: '💎', xpReward: 800, coinReward: 400 },
    { id: 'egoist', name: 'أناني', description: 'افوز بالمباراة بـ Ego 100%', icon: '🔥', xpReward: 600, coinReward: 300 }
  ],

  DAILY_MISSIONS: [
    { id: 'play_match', name: '🎮 العب مباراة', description: 'العب مباراة واحدة', requirement: 1, xpReward: 30, coinReward: 50 },
    { id: 'score_goal', name: '⚽ سجل 3 أهداف', description: 'سجل 3 أهداف في المباريات', requirement: 3, xpReward: 50, coinReward: 80 },
    { id: 'win_matches', name: '🏆 اربح مباراة', description: 'اربح مباراة واحدة', requirement: 1, xpReward: 40, coinReward: 70 },
    { id: 'train', name: '🏋️ تدرب مرتين', description: 'أكمل حصتين تدريبيتين', requirement: 2, xpReward: 35, coinReward: 50 },
    { id: 'open_pack', name: '📦 افتح باك', description: 'افتح باك واحد', requirement: 1, xpReward: 25, coinReward: 40 },
    { id: 'daily_login', name: '🔑 تسجيل الدخول', description: 'سجل دخولك اليومي', requirement: 1, xpReward: 15, coinReward: 25 }
  ],

  WEEKLY_MISSIONS: [
    { id: 'win_10', name: '🏆 10 انتصارات', description: 'اربح 10 مباريات', requirement: 10, xpReward: 400, coinReward: 600, gemReward: 50 },
    { id: 'score_20', name: '⚽ 20 هدف', description: 'سجل 20 هدف', requirement: 20, xpReward: 500, coinReward: 700, gemReward: 75 },
    { id: 'train_15', name: '🏋️ 15 تدريب', description: 'أكمل 15 حصة تدريبية', requirement: 15, xpReward: 300, coinReward: 400, gemReward: 25 },
    { id: 'win_streak', name: '⚡ 5 انتصارات متتالية', description: 'اربح 5 مباريات متتالية', requirement: 5, xpReward: 600, coinReward: 1000, gemReward: 100 },
    { id: 'earn_coins', name: '🪙 اجمع 5000 عملة', description: 'اجمع 5000 عملة', requirement: 5000, xpReward: 350, coinReward: 500, gemReward: 30 },
    { id: 'open_packs', name: '📦 افتح 10 باكات', description: 'افتح 10 باكات', requirement: 10, xpReward: 300, coinReward: 450, gemReward: 40 }
  ]
};
