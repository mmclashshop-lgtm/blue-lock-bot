const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  characterId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  
  // Base Stats Multiplier
  statMultipliers: {
    shooting: { type: Number, default: 1.0 },
    dribbling: { type: Number, default: 1.0 },
    passing: { type: Number, default: 1.0 },
    vision: { type: Number, default: 1.0 },
    speed: { type: Number, default: 1.0 },
    defense: { type: Number, default: 1.0 },
    stamina: { type: Number, default: 1.0 },
    finishing: { type: Number, default: 1.0 },
    control: { type: Number, default: 1.0 },
    reaction: { type: Number, default: 1.0 },
    ego: { type: Number, default: 1.0 }
  },

  // Skills
  passiveSkill: {
    name: String,
    description: String,
    effect: String,
    value: Number
  },

  activeSkill: {
    name: String,
    description: String,
    effect: String,
    cooldown: Number, // in seconds
    baseValue: Number
  },

  awakening: {
    name: String,
    description: String,
    unlockLevel: { type: Number, default: 50 },
    effect: String,
    statBoost: {
      shooting: { type: Number, default: 0 },
      dribbling: { type: Number, default: 0 },
      passing: { type: Number, default: 0 },
      vision: { type: Number, default: 0 },
      speed: { type: Number, default: 0 },
      defense: { type: Number, default: 0 },
      stamina: { type: Number, default: 0 },
      finishing: { type: Number, default: 0 },
      control: { type: Number, default: 0 },
      reaction: { type: Number, default: 0 }
    }
  },

  specialAbility: {
    name: String,
    description: String,
    unlockLevel: { type: Number, default: 75 },
    cooldown: Number,
    effect: String,
    damageMultiplier: { type: Number, default: 1.5 }
  },

  // Playstyle
  playstyle: {
    type: String,
    enum: ['Striker', 'Playmaker', 'Speedster', 'Technician', 'Defender', 'Balanced'],
    required: true
  },

  position: {
    type: String,
    enum: ['Forward', 'Midfielder', 'Winger', 'Fullback', 'Goalkeeper', 'Multi'],
    required: true
  },

  rarity: {
    type: String,
    enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical', 'Divine'],
    default: 'Common'
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

characterSchema.methods.applySkillBoosts = function(baseStats) {
  const boostedStats = { ...baseStats };
  Object.keys(this.statMultipliers).forEach(stat => {
    boostedStats[stat] = Math.floor(boostedStats[stat] * this.statMultipliers[stat]);
  });
  return boostedStats;
};

characterSchema.methods.getFullSkills = function(playerLevel) {
  const skills = {
    passive: this.passiveSkill,
    active: this.activeSkill,
    awakening: playerLevel >= this.awakening.unlockLevel ? this.awakening : null,
    special: playerLevel >= this.specialAbility.unlockLevel ? this.specialAbility : null
  };
  return skills;
};

module.exports = mongoose.model('Character', characterSchema);
