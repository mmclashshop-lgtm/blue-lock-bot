const Draft = require('../database/models/Draft');
const Player = require('../database/models/Player');
const { shuffleArray, randomRange } = require('../utils/helpers');

const DRAFT_CHARACTERS = [
  { name: 'Isagi Yoichi', stat: 'vision', bonus: 5 },
  { name: 'Rin Itoshi', stat: 'shooting', bonus: 5 },
  { name: 'Nagi Seishiro', stat: 'control', bonus: 5 },
  { name: 'Bachira Meguru', stat: 'dribbling', bonus: 5 },
  { name: 'Barou Shoei', stat: 'finishing', bonus: 5 },
  { name: 'Shidou Ryusei', stat: 'shooting', bonus: 4 },
  { name: 'Chigiri Hyoma', stat: 'speed', bonus: 5 },
  { name: 'Reo Mikage', stat: 'passing', bonus: 4 },
  { name: 'Karasu Tabito', stat: 'defense', bonus: 4 },
  { name: 'Yukimiya Kenyu', stat: 'dribbling', bonus: 4 },
  { name: 'Kunigami Rensuke', stat: 'shooting', bonus: 4 },
  { name: 'Niko Ikki', stat: 'vision', bonus: 4 }
];

class DraftSystem {
  async createDraft(guildId, channelId, hostId, playerCount = 8) {
    if (![4, 8, 16].includes(playerCount)) return { success: false, message: '⚠️ العدد يجب أن 4, 8, أو 16' };

    const draft = new Draft({
      draftId: `drf_${Date.now()}`,
      guildId, channelId, hostId, playerCount,
      availableChars: shuffleArray([...DRAFT_CHARACTERS])
    });

    await draft.save();
    return { success: true, draftId: draft.draftId, draft: draft.toObject(), message: `✅ تم إنشاء Draft لـ ${playerCount} لاعب!` };
  }

  async joinDraft(draftId, userId, playerName) {
    const draft = await Draft.findOne({ draftId });
    if (!draft) return { success: false, message: '⚠️ الدرافت غير موجود' };
    if (draft.status !== 'registering') return { success: false, message: '⚠️ الدرافت بدأ بالفعل' };
    if (draft.players.find(p => p.userId === userId)) return { success: false, message: '⚠️ أنت مسجل بالفعل' };
    if (draft.players.length >= draft.playerCount) return { success: false, message: '⚠️ اكتمل العدد' };

    draft.players.push({ userId, name: playerName });
    await draft.save();
    return { success: true, draft: draft.toObject(), message: `✅ انضم ${playerName} (${draft.players.length}/${draft.playerCount})` };
  }

  async startDraft(draftId) {
    const draft = await Draft.findOne({ draftId });
    if (!draft) return { success: false, message: '⚠️ الدرافت غير موجود' };
    if (draft.status !== 'registering') return { success: false, message: '⚠️ الدرافت بدأ بالفعل' };
    if (draft.players.length < 2) return { success: false, message: '⚠️ عدد اللاعبين غير كافٍ' };

    draft.status = 'picking';
    const shuffled = shuffleArray(draft.players);
    const half = Math.ceil(shuffled.length / 2);
    draft.teams = {
      teamA: shuffled.slice(0, half),
      teamB: shuffled.slice(half),
      teamAPicks: [],
      teamBPicks: []
    };

    const numPicks = Math.min(draft.availableChars.length, 6);
    draft.turnOrder = [];
    for (let round = 0; round < numPicks; round++) {
      if (round % 2 === 0) {
        draft.turnOrder.push(...draft.teams.teamA.map(p => ({ userId: p.userId, team: 'A' })));
        draft.turnOrder.push(...draft.teams.teamB.map(p => ({ userId: p.userId, team: 'B' })));
      } else {
        draft.turnOrder.push(...draft.teams.teamB.map(p => ({ userId: p.userId, team: 'B' })));
        draft.turnOrder.push(...draft.teams.teamA.map(p => ({ userId: p.userId, team: 'A' })));
      }
    }

    await draft.save();
    return { success: true, draft: draft.toObject(), message: `✅ بدأ الدرافت! ${draft.teams.teamA.length} vs ${draft.teams.teamB.length}` };
  }

  async pickCharacter(draftId, userId, charIndex) {
    const draft = await Draft.findOne({ draftId });
    if (!draft) return { success: false, message: '⚠️ الدرافت غير موجود' };
    if (draft.status !== 'picking') return { success: false, message: '⚠️ ليس وقت الاختيار' };

    const turn = draft.turnOrder[draft.currentPick];
    if (!turn || turn.userId !== userId) return { success: false, message: '⏳ ليس دورك' };
    if (charIndex < 0 || charIndex >= draft.availableChars.length) return { success: false, message: '⚠️ شخصية غير صالحة' };

    const character = draft.availableChars.splice(charIndex, 1)[0];
    const teamKey = turn.team === 'A' ? 'teamAPicks' : 'teamBPicks';

    draft.picks.push({
      userId, userName: draft.players.find(p => p.userId === userId)?.name || 'Unknown',
      character, team: turn.team, pickNumber: ++draft.currentPick
    });
    draft.teams[teamKey] = draft.teams[teamKey] || [];
    draft.teams[teamKey].push(character);

    if (draft.currentPick >= draft.turnOrder.length || draft.availableChars.length === 0) {
      draft.status = 'playing';
    }

    await draft.save();
    const d = draft.toObject();
    return {
      success: true, character, draft: d,
      nextTurn: d.turnOrder[d.currentPick] || null,
      message: `✅ اختار ${character.name}!`
    };
  }

  async simulateDraftMatch(draftId) {
    const draft = await Draft.findOne({ draftId });
    if (!draft) return { success: false, message: '⚠️ الدرافت غير موجود' };
    if (draft.status === 'completed') return { success: false, message: '⚠️ الدرافت انتهى' };

    draft.status = 'playing';
    const teamAPicks = draft.teams.teamAPicks || [];
    const teamBPicks = draft.teams.teamBPicks || [];

    const teamARating = teamAPicks.reduce((s, c) => s + 50 + (c.bonus || 0) * 5, 50 * Math.max(draft.teams.teamA.length, 1));
    const teamBRating = teamBPicks.reduce((s, c) => s + 50 + (c.bonus || 0) * 5, 50 * Math.max(draft.teams.teamB.length, 1));
    const total = teamARating + teamBRating;
    const teamAChance = teamARating / total;

    let scoreA = 0, scoreB = 0;
    const events = [];
    for (let t = 0; t < 90; t += randomRange(3, 8)) {
      const attacking = Math.random() < teamAChance ? 'A' : 'B';
      const team = attacking === 'A' ? draft.teams.teamA : draft.teams.teamB;
      const shooter = team[Math.floor(Math.random() * team.length)];
      if (Math.random() < (attacking === 'A' ? teamAChance * 0.3 : (1 - teamAChance) * 0.3)) {
        if (attacking === 'A') scoreA++; else scoreB++;
        events.push({ time: Math.min(t, 90), text: `⚽ **GOAL!** ${shooter.name} scores! (${scoreA}-${scoreB})` });
      } else if (Math.random() < 0.6) {
        events.push({ time: Math.min(t, 90), text: `🧤 Save! ${shooter.name} denied!` });
      } else {
        events.push({ time: Math.min(t, 90), text: `😤 ${shooter.name}'s shot goes wide!` });
      }
    }

    const winner = scoreA > scoreB ? 'Team A' : scoreB > scoreA ? 'Team B' : 'Draw';
    const result = { score: { teamA: scoreA, teamB: scoreB }, winner, events: events.slice(-8), teamAPicks, teamBPicks };

    draft.results = result;
    draft.status = 'completed';
    await draft.save();

    const winners = winner === 'Team A' ? draft.teams.teamA : draft.teams.teamB;
    const losers = winner === 'Team A' ? draft.teams.teamB : draft.teams.teamA;
    for (const p of [...winners, ...losers]) {
      const pl = await Player.findOne({ userId: p.userId, guildId: draft.guildId });
      if (pl) {
        pl.addXP(winners.includes(p) ? 30 : 15);
        pl.coins += winners.includes(p) ? 60 : 30;
        pl.draftPlayed = (pl.draftPlayed || 0) + 1;
        if (winners.includes(p)) pl.draftWins = (pl.draftWins || 0) + 1;
        await pl.save();
      }
    }

    return { success: true, result, message: `🏆 **Draft Match!** ${winner} wins ${scoreA}-${scoreB}!` };
  }

  async getDraft(draftId) {
    const d = await Draft.findOne({ draftId }).lean();
    if (!d) return null;
    return { ...d, availableChars: d.availableChars?.length || 0 };
  }

  async listActiveDrafts(guildId) {
    return Draft.find({ guildId, status: { $ne: 'completed' } }).sort({ createdAt: -1 }).lean();
  }

  async cleanupOldDrafts() {
    const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await Draft.deleteMany({ createdAt: { $lt: cutoff }, status: 'completed' });
  }
}

module.exports = new DraftSystem();
