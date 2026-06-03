const Clan = require('../database/models/Clan');
const Player = require('../database/models/Player');

class ClanSystem {
  async createClan(name, guildId, leaderId) {
    const existing = await Clan.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) return { success: false, message: '⚠️ هذا الاسم مستخدم بالفعل' };

    const leader = await Player.findOne({ userId: leaderId, guildId });
    if (!leader) return { success: false, message: '⚠️ يجب إنشاء لاعب أولاً' };
    if (leader.clanId) return { success: false, message: '⚠️ أنت بالفعل في كلان' };
    if (leader.coins < 5000) return { success: false, message: '⚠️ تحتاج 🪙5000 لإنشاء كلان' };

    leader.coins -= 5000;

    const clan = new Clan({
      name,
      guildId,
      leaderId,
      members: [leaderId]
    });

    leader.clanId = clan._id.toString();
    leader.clanRole = 'leader';
    leader.clanJoinDate = new Date();

    await clan.save();
    await leader.save();

    return {
      success: true,
      clan,
      message: `🏰 تم إنشاء كلان **${name}** بنجاح!`
    };
  }

  async joinClan(clanId, userId) {
    const clan = await Clan.findById(clanId);
    if (!clan) return { success: false, message: '⚠️ الكلان غير موجود' };

    const player = await Player.findOne({ userId });
    if (!player) return { success: false, message: '⚠️ يجب إنشاء لاعب أولاً' };
    if (player.clanId) return { success: false, message: '⚠️ أنت بالفعل في كلان' };

    clan.members.push(userId);
    player.clanId = clan._id.toString();
    player.clanRole = 'member';
    player.clanJoinDate = new Date();

    await clan.save();
    await player.save();

    return {
      success: true,
      clan,
      message: `✅ انضممت إلى كلان **${clan.name}**`
    };
  }

  async leaveClan(userId) {
    const player = await Player.findOne({ userId });
    if (!player || !player.clanId) return { success: false, message: '⚠️ أنت لست في كلان' };

    const clan = await Clan.findById(player.clanId);
    if (!clan) return { success: false, message: '⚠️ الكلان غير موجود' };

    if (player.clanRole === 'leader' && clan.members.length > 1) {
      return { success: false, message: '⚠️ يجب تعيين نائب قائد أو حذف الكلان أولاً' };
    }

    clan.members = clan.members.filter(m => m !== userId);

    if (clan.members.length === 0) {
      await Clan.findByIdAndDelete(clan._id);
    } else {
      await clan.save();
    }

    player.clanId = null;
    player.clanRole = 'member';
    player.clanJoinDate = null;
    await player.save();

    return {
      success: true,
      message: '🚪 غادرت الكلان بنجاح'
    };
  }

  async addClanXP(clanId, amount) {
    const clan = await Clan.findById(clanId);
    if (!clan) return false;

    clan.xp += amount;
    clan.points += Math.floor(amount / 10);

    // Level up check
    const xpNeeded = clan.level * 500;
    while (clan.xp >= xpNeeded) {
      clan.xp -= xpNeeded;
      clan.level++;
    }

    await clan.save();
    return true;
  }

  async getClanLeaderboard(guildId, limit = 10) {
    return Clan.find({ guildId })
      .sort({ points: -1 })
      .limit(limit)
      .lean();
  }

  async getClanInfo(clanId) {
    const clan = await Clan.findById(clanId);
    if (!clan) return null;

    const leader = await Player.findOne({ userId: clan.leaderId });
    const members = await Player.find({ userId: { $in: clan.members } })
      .select('name level rank ovr')
      .lean();

    return { clan, leader, members };
  }

  async searchClans(query, guildId, limit = 10) {
    return Clan.find({
      guildId,
      name: { $regex: query, $options: 'i' }
    })
      .sort({ points: -1 })
      .limit(limit)
      .lean();
  }
}

module.exports = new ClanSystem();
