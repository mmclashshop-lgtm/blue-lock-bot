// نظام الشخصيات الكامل من Blue Lock

const CHARACTERS = {
  isagi: {
    characterId: 'char_isagi',
    name: 'إيساغي يويتشي',
    description: 'المهاجم المتوازن - خبير في تحليل اللعبة وإيجاد المسافات الفارغة',
    image: 'https://bluelock-anime-en.com/assets/img/character/isagi.png',
    playstyle: 'Balanced',
    position: 'Forward',
    rarity: 'Legendary',

    statMultipliers: {
      shooting: 1.15,
      dribbling: 1.12,
      passing: 1.10,
      vision: 1.18, // نقاط القوة
      speed: 1.08,
      defense: 0.95,
      stamina: 1.12,
      finishing: 1.16,
      control: 1.14,
      reaction: 1.15,
      ego: 1.05
    },

    passiveSkill: {
      name: 'تحليل المسافات الفارغة',
      description: 'يزيد الرؤية والتمرير بنسبة 15% في كل مباراة',
      effect: 'vision_passing_boost',
      value: 15
    },

    activeSkill: {
      name: 'حركة إيساغي الخاصة',
      description: 'تمرير دقيق يزيد فرص التسديد لمدة 10 ثوانِ',
      effect: 'precision_pass',
      cooldown: 30,
      baseValue: 25
    },

    awakening: {
      name: 'صحوة الذئب الأبيض',
      description: 'تطور كامل في التحليل والرؤية - يزيد جميع الإحصائيات بـ 20%',
      unlockLevel: 50,
      effect: 'white_wolf_awakening',
      statBoost: {
        shooting: 20, dribbling: 18, passing: 15, vision: 25,
        speed: 15, defense: 10, stamina: 20, finishing: 22,
        control: 20, reaction: 20
      }
    },

    specialAbility: {
      name: 'لحظة التسديدة المثالية',
      description: 'تسديدة قوية جداً مع فرصة 80% للتسجيل',
      unlockLevel: 75,
      cooldown: 45,
      effect: 'perfect_shot',
      damageMultiplier: 1.8
    }
  },

  rin: {
    characterId: 'char_rin',
    name: 'رين إيتوشي',
    description: 'العبقري التقني - دقة لا تقبل المنافسة وتحكم كامل بالكرة',
    image: 'https://bluelock-anime-en.com/assets/img/character/rin.png',
    playstyle: 'Technician',
    position: 'Forward',
    rarity: 'Legendary',

    statMultipliers: {
      shooting: 1.20,
      dribbling: 1.18,
      passing: 1.15,
      vision: 1.12,
      speed: 1.10,
      defense: 0.92,
      stamina: 1.10,
      finishing: 1.22,
      control: 1.25, // نقطة القوة
      reaction: 1.18,
      ego: 1.12
    },

    passiveSkill: {
      name: 'التحكم المثالي',
      description: 'تحكم أفضل بالكرة - يقلل فرص خسارتها بـ 20%',
      effect: 'perfect_control',
      value: 20
    },

    activeSkill: {
      name: 'تقنية رين',
      description: 'لفة خادعة سريعة تزيد السرعة والمراوغة',
      effect: 'tempo_control',
      cooldown: 25,
      baseValue: 30
    },

    awakening: {
      name: 'صحوة الملك الأزرق',
      description: 'إتقان تام للتقنيات - جميع الإحصائيات +25%',
      unlockLevel: 50,
      effect: 'blue_king_awakening',
      statBoost: {
        shooting: 25, dribbling: 28, passing: 22, vision: 18,
        speed: 20, defense: 12, stamina: 22, finishing: 28,
        control: 30, reaction: 25
      }
    },

    specialAbility: {
      name: 'الحركة الأخيرة (Last Move)',
      description: 'تسديدة فنية معقدة - فرصة 85% للتسجيل',
      unlockLevel: 75,
      cooldown: 50,
      effect: 'last_move',
      damageMultiplier: 1.9
    }
  },

  bachira: {
    characterId: 'char_bachira',
    name: 'باشيرا ميجورو',
    description: 'البطاقة البرية - عفويتها لا تضاهى والإبداع في كل حركة',
    image: 'https://bluelock-anime-en.com/assets/img/character/bachira.png',
    playstyle: 'Speedster',
    position: 'Winger',
    rarity: 'Epic',

    statMultipliers: {
      shooting: 1.14,
      dribbling: 1.22, // نقطة القوة
      passing: 1.08,
      vision: 1.10,
      speed: 1.20,
      defense: 0.85,
      stamina: 1.18,
      finishing: 1.12,
      control: 1.16,
      reaction: 1.14,
      ego: 1.15
    },

    passiveSkill: {
      name: 'الحرية المطلقة',
      description: 'لا يوجد حدود للإبداع - يزيد المراوغة بـ 18%',
      effect: 'absolute_freedom',
      value: 18
    },

    activeSkill: {
      name: 'حركة باشيرا',
      description: 'مراوغة سريعة وعفوية تخرج اللاعب من الضغط',
      effect: 'wild_dribble',
      cooldown: 20,
      baseValue: 28
    },

    awakening: {
      name: 'صحوة الوحش الوحشي',
      description: 'تطور كامل في السرعة والإبداع - +22%',
      unlockLevel: 50,
      effect: 'monster_awakening',
      statBoost: {
        shooting: 18, dribbling: 28, passing: 15, vision: 16,
        speed: 25, defense: 8, stamina: 25, finishing: 20,
        control: 22, reaction: 20
      }
    },

    specialAbility: {
      name: 'الزعيم الأسطوري',
      description: 'مراوغة مستحيلة مع تسديقة دقيقة',
      unlockLevel: 75,
      cooldown: 40,
      effect: 'legend_dribble',
      damageMultiplier: 1.7
    }
  },

  nagi: {
    characterId: 'char_nagi',
    name: 'ناجي سيشيرو',
    description: 'خبير الدقة - لعب حسابي مثالي مع ملايين الحسابات',
    image: 'https://bluelock-anime-en.com/assets/img/character/nagi.png',
    playstyle: 'Technician',
    position: 'Forward',
    rarity: 'Legendary',

    statMultipliers: {
      shooting: 1.18,
      dribbling: 1.16,
      passing: 1.20, // نقطة القوة
      vision: 1.16,
      speed: 0.90,
      defense: 1.05,
      stamina: 1.00,
      finishing: 1.20,
      control: 1.24, // نقطة القوة
      reaction: 1.16,
      ego: 1.08
    },

    passiveSkill: {
      name: 'ملايين الحسابات',
      description: 'دقة لا تضاهى - يزيد نسبة نجاح التمريرات بـ 22%',
      effect: 'million_calculations',
      value: 22
    },

    activeSkill: {
      name: 'تمرية ناجي',
      description: 'تمرير حسابي دقيق يصل لللاعب دائماً',
      effect: 'precision_pass_nagi',
      cooldown: 28,
      baseValue: 32
    },

    awakening: {
      name: 'صحوة الحاسب الفائق',
      description: 'كمبيوتر حي - يتحكم باللعبة تماماً',
      unlockLevel: 50,
      effect: 'supercomputer_awakening',
      statBoost: {
        shooting: 22, dribbling: 20, passing: 28, vision: 24,
        speed: 8, defense: 8, stamina: 10, finishing: 24,
        control: 28, reaction: 22
      }
    },

    specialAbility: {
      name: 'الحساب النهائي',
      description: 'تسديدة محسوبة بملايين الطرق',
      unlockLevel: 75,
      cooldown: 48,
      effect: 'final_calculation',
      damageMultiplier: 1.85
    }
  },

  kaiser: {
    characterId: 'char_kaiser',
    name: 'كايزر مايكل',
    description: 'الشامل - الأفضل في كل شيء، لاعب متكامل لا منازع له',
    image: 'https://bluelock-anime-en.com/assets/img/character/kaiser.png',
    playstyle: 'Balanced',
    position: 'Forward',
    rarity: 'Mythical',

    statMultipliers: {
      shooting: 1.25,
      dribbling: 1.22,
      passing: 1.18,
      vision: 1.16,
      speed: 1.18,
      defense: 1.12,
      stamina: 1.16,
      finishing: 1.28,
      control: 1.24,
      reaction: 1.22,
      ego: 1.20
    },

    passiveSkill: {
      name: 'الإمبراطورية المطلقة',
      description: 'السيطرة على اللعبة - جميع الإحصائيات +12%',
      effect: 'absolute_empire',
      value: 12
    },

    activeSkill: {
      name: 'حركة كايزر',
      description: 'هجمة منظمة قوية جداً',
      effect: 'kaiser_strike',
      cooldown: 32,
      baseValue: 35
    },

    awakening: {
      name: 'صحوة الإمبراطور',
      description: 'سيطرة مطلقة على كل شيء',
      unlockLevel: 50,
      effect: 'emperor_awakening',
      statBoost: {
        shooting: 30, dribbling: 28, passing: 25, vision: 22,
        speed: 25, defense: 20, stamina: 25, finishing: 32,
        control: 28, reaction: 28
      }
    },

    specialAbility: {
      name: 'الضربة الملكية',
      description: 'تسديدة إمبراطورية - فرصة 90% للتسجيل',
      unlockLevel: 75,
      cooldown: 55,
      effect: 'royal_strike',
      damageMultiplier: 2.0
    }
  },

  shidou: {
    characterId: 'char_shidou',
    name: 'شيدو رويسي',
    description: 'المفترس العدواني - هجوم شرس لا يرحم',
    image: 'https://bluelock-anime-en.com/assets/img/character/shidou.png',
    playstyle: 'Striker',
    position: 'Forward',
    rarity: 'Legendary',

    statMultipliers: {
      shooting: 1.22,
      dribbling: 1.12,
      passing: 0.95,
      vision: 0.98,
      speed: 1.16,
      defense: 0.88,
      stamina: 1.14,
      finishing: 1.25,
      control: 1.10,
      reaction: 1.16,
      ego: 1.18
    },

    passiveSkill: {
      name: 'غريزة المفترس',
      description: 'هجوم شرس - يزيد التسديق والإنهاء بـ 20%',
      effect: 'predator_instinct',
      value: 20
    },

    activeSkill: {
      name: 'الهجمة العنيفة',
      description: 'تسديق قوي جداً يكسر الدفاعات',
      effect: 'savage_attack',
      cooldown: 26,
      baseValue: 32
    },

    awakening: {
      name: 'صحوة الوحش المفترس',
      description: 'حيوان بري يهاجم بلا رحمة',
      unlockLevel: 50,
      effect: 'beast_awakening',
      statBoost: {
        shooting: 28, dribbling: 18, passing: 10, vision: 12,
        speed: 22, defense: 8, stamina: 20, finishing: 30,
        control: 15, reaction: 20
      }
    },

    specialAbility: {
      name: 'الفم المغروي (Predator\'s Feast)',
      description: 'عضة قاتلة - تسديقة عنيفة لا تقاوم',
      unlockLevel: 75,
      cooldown: 42,
      effect: 'predator_feast',
      damageMultiplier: 1.95
    }
  },

  chigiri: {
    characterId: 'char_chigiri',
    name: 'تشيجيري هيوما',
    description: 'ملك السرعة - مسرع يفوق الحدود',
    image: 'https://bluelock-anime-en.com/assets/img/character/chigiri.png',
    playstyle: 'Speedster',
    position: 'Winger',
    rarity: 'Rare',

    statMultipliers: {
      shooting: 1.10,
      dribbling: 1.20,
      passing: 1.08,
      vision: 1.09,
      speed: 1.28, // أعلى سرعة
      defense: 0.88,
      stamina: 1.22,
      finishing: 1.14,
      control: 1.18,
      reaction: 1.15,
      ego: 1.06
    },

    passiveSkill: {
      name: 'الرقم الذهبي',
      description: 'سرعة خارقة - يزيد السرعة بـ 25%',
      effect: 'golden_number',
      value: 25
    },

    activeSkill: {
      name: 'الهزة السريعة',
      description: 'تسارع فائق يترك المدافعين وراء',
      effect: 'speed_burst',
      cooldown: 22,
      baseValue: 28
    },

    awakening: {
      name: 'صحوة الرقم الذهبي الكامل',
      description: 'سرعة إلهية',
      unlockLevel: 50,
      effect: 'golden_number_full',
      statBoost: {
        shooting: 16, dribbling: 24, passing: 12, vision: 14,
        speed: 30, defense: 10, stamina: 28, finishing: 18,
        control: 20, reaction: 18
      }
    },

    specialAbility: {
      name: 'الخط الذهبي',
      description: 'سباق سريع للنهاية',
      unlockLevel: 75,
      cooldown: 38,
      effect: 'golden_line',
      damageMultiplier: 1.65
    }
  },

  reo: {
    characterId: 'char_reo',
    name: 'ريو ميكاغي',
    description: 'صانع اللعب - المساعد الذكي والموازن',
    image: 'https://bluelock-anime-en.com/assets/img/character/reo.png',
    playstyle: 'Playmaker',
    position: 'Midfielder',
    rarity: 'Epic',

    statMultipliers: {
      shooting: 1.08,
      dribbling: 1.14,
      passing: 1.22, // نقطة القوة
      vision: 1.20,
      speed: 1.12,
      defense: 1.08,
      stamina: 1.10,
      finishing: 1.06,
      control: 1.16,
      reaction: 1.14,
      ego: 1.04
    },

    passiveSkill: {
      name: 'الدعم الذكي',
      description: 'تمريرات دقيقة - يزيد فرص زملائه بـ 15%',
      effect: 'smart_support',
      value: 15
    },

    activeSkill: {
      name: 'تمريرة ريو',
      description: 'تمرير دقيق يضع الزميل في وضع مثالي',
      effect: 'reo_pass',
      cooldown: 24,
      baseValue: 26
    },

    awakening: {
      name: 'صحوة الموازن المثالي',
      description: 'لعب منظم وذكي',
      unlockLevel: 50,
      effect: 'perfect_balance_awakening',
      statBoost: {
        shooting: 12, dribbling: 18, passing: 28, vision: 26,
        speed: 16, defense: 14, stamina: 16, finishing: 12,
        control: 20, reaction: 18
      }
    },

    specialAbility: {
      name: 'اللحظة الذهبية',
      description: 'تمريرة ساحرة تضع الزميل في حالة ممتازة',
      unlockLevel: 75,
      cooldown: 45,
      effect: 'golden_moment',
      damageMultiplier: 1.6
    }
  },

  sai: {
    characterId: 'char_sai',
    name: 'ساي إيوشي',
    description: 'المخطط الاستراتيجي - الدماغ التكتيكي للفريق',
    image: 'https://bluelock-anime-en.com/assets/img/character/sai.png',
    playstyle: 'Technician',
    position: 'Midfielder',
    rarity: 'Rare',

    statMultipliers: {
      shooting: 0.95,
      dribbling: 1.08,
      passing: 1.18, // نقطة القوة
      vision: 1.22,
      speed: 0.98,
      defense: 1.18, // نقطة القوة
      stamina: 1.12,
      finishing: 0.92,
      control: 1.14,
      reaction: 1.20,
      ego: 1.02
    },

    passiveSkill: {
      name: 'العقل التكتيكي',
      description: 'رؤية ستراتيجية - يزيد الدفاع والرؤية بـ 18%',
      effect: 'tactical_mind',
      value: 18
    },

    activeSkill: {
      name: 'الخطة المثالية',
      description: 'تنظيم الدفاع والهجوم بذكاء',
      effect: 'master_plan',
      cooldown: 30,
      baseValue: 24
    },

    awakening: {
      name: 'صحوة الجنرال',
      description: 'قائد الفريق الكامل',
      unlockLevel: 50,
      effect: 'general_awakening',
      statBoost: {
        shooting: 10, dribbling: 14, passing: 24, vision: 28,
        speed: 10, defense: 24, stamina: 18, finishing: 8,
        control: 18, reaction: 26
      }
    },

    specialAbility: {
      name: 'الحصار الكامل',
      description: 'دفاع وهجوم منظم بشكل مثالي',
      unlockLevel: 75,
      cooldown: 50,
      effect: 'full_lockdown',
      damageMultiplier: 1.55
    }
  },

  barou: {
    characterId: 'char_barou',
    name: 'بارو شوي',
    description: 'القوة الخام - قوة بدنية فائقة وسيطرة مطلقة',
    image: 'https://bluelock-anime-en.com/assets/img/character/barou.png',
    playstyle: 'Striker',
    position: 'Forward',
    rarity: 'Epic',

    statMultipliers: {
      shooting: 1.18,
      dribbling: 1.14,
      passing: 0.98,
      vision: 1.00,
      speed: 1.12,
      defense: 1.15,
      stamina: 1.20,
      finishing: 1.20,
      control: 1.16,
      reaction: 1.12,
      ego: 1.14
    },

    passiveSkill: {
      name: 'السيطرة المطلقة',
      description: 'قوة غاشمة - يزيد التحكم والقوة بـ 18%',
      effect: 'absolute_control',
      value: 18
    },

    activeSkill: {
      name: 'الضربة الغاشمة',
      description: 'تسديق قوي يكسر كل شيء',
      effect: 'brute_force_strike',
      cooldown: 28,
      baseValue: 30
    },

    awakening: {
      name: 'صحوة الملك الأناني',
      description: 'سيطرة فائقة على اللعبة',
      unlockLevel: 50,
      effect: 'selfish_king_awakening',
      statBoost: {
        shooting: 25, dribbling: 20, passing: 12, vision: 14,
        speed: 18, defense: 20, stamina: 25, finishing: 25,
        control: 22, reaction: 18
      }
    },

    specialAbility: {
      name: 'العرش الأناني',
      description: 'سيطرة مطلقة على الكرة والملعب',
      unlockLevel: 75,
      cooldown: 46,
      effect: 'selfish_throne',
      damageMultiplier: 1.8
    }
  }
};

module.exports = CHARACTERS;
