const Clan = require('../database/models/Clan');
const Player = require('../database/models/Player');

class ClanManager {
  async createClan(name, leaderId, guildId) {
    if (name.length < 2 || name.length > 20) return { success: false, message: '⚠️ الاسم يجب أن يكون بين 2-20 حرف' };

    const existing = await Clan.findOne({ guildId, name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return { success: false, message: '⚠️ يوجد كلان بنفس الاسم' };

    const leader = await Player.findOne({ userId: leaderId, guildId });
    if (!leader) return { success: false, message: '⚠️ يجب إنشاء لاعب أولاً' };
    if (leader.clanId) return { success: false, message: '⚠️ أنت بالفعل في كلان' };

    if (leader.coins < 1000) return { success: false, message: '⚠️ تحتاج 1000 عملة لإنشاء كلان' };
    leader.coins -= 1000;

    const clan = new Clan({
      name, guildId, leaderId,
      viceLeaders: [], members: [leaderId],
      description: '', level: 1
    });

    leader.clanId = clan._id.toString();
    await clan.save();
    await leader.save();

    return { success: true, clan: clan.toObject(), message: `✅ تم إنشاء الكلان **${name}**` };
  }

  async joinClan(clanId, userId, guildId) {
    const clan = await Clan.findById(clanId);
    if (!clan) return { success: false, message: '⚠️ الكلان غير موجود' };

    const player = await Player.findOne({ userId, guildId });
    if (!player) return { success: false, message: '⚠️ يجب إنشاء لاعب أولاً' };
    if (player.clanId) return { success: false, message: '⚠️ أنت بالفعل في كلان' };
    if (clan.members.includes(userId)) return { success: false, message: '⚠️ أنت عضو بالفعل' };

    if (clan.members.length >= 50) return { success: false, message: '⚠️ الكلان ممتلئ (50 عضو)' };

    clan.members.push(userId);
    player.clanId = clan._id.toString();
    await clan.save();
    await player.save();

    return { success: true, clan: clan.toObject(), message: `✅ انضممت إلى **${clan.name}**` };
  }

  async leaveClan(userId, guildId) {
    const player = await Player.findOne({ userId, guildId });
    if (!player || !player.clanId) return { success: false, message: '⚠️ لست في كلان' };

    const clan = await Clan.findById(player.clanId);
    if (!clan) { player.clanId = null; await player.save(); return { success: false, message: '⚠️ الكلان غير موجود' }; }

    if (clan.leaderId === userId) {
      if (clan.members.length > 1) return { success: false, message: '⚠️ سلم القيادة لعضو آخر أولاً' };
      await Clan.deleteOne({ _id: clan._id });
      player.clanId = null;
      await player.save();
      return { success: true, message: `✅ تم حذف الكلان **${clan.name}**` };
    }

    clan.members = clan.members.filter(m => m !== userId);
    player.clanId = null;
    await clan.save();
    await player.save();

    return { success: true, message: `✅ غادرت **${clan.name}**` };
  }

  async getLeaderboard(guildId) {
    const clans = await Clan.find({ guildId }).sort({ points: -1 }).limit(10).lean();
    if (clans.length === 0) return 'لا توجد كلانات بعد';
    return clans.map((c, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      return `${medal} **${c.name}** — Lv.${c.level} | ${c.points}pts | ${c.members.length} أعضاء | ${c.warWins || 0}W`;
    }).join('\n');
  }

  async getClanInfo(userId, guildId) {
    if (!userId) return null;
    const player = await Player.findOne({ userId, guildId });
    if (!player || !player.clanId) return null;
    return Clan.findById(player.clanId).lean();
  }

  async listJoinableClans(guildId) {
    return Clan.find({ guildId }).sort({ points: -1 }).limit(25).lean();
  }
}

module.exports = new ClanManager();
