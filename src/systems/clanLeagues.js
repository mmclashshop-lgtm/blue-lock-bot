const Clan = require('../database/models/Clan');
const Player = require('../database/models/Player');
const clubWars = require('./clubWars');
const errorLogger = require('./errorLogger');
const { shuffleArray, randomRange } = require('../utils/helpers');

const DIVISIONS = [
  { name: 'القسم الماسي', tier: 0, minLevel: 20, minMembers: 8, promotion: 2, relegation: 2 },
  { name: 'القسم الذهبي', tier: 1, minLevel: 15, minMembers: 6, promotion: 2, relegation: 3 },
  { name: 'القسم الفضي', tier: 2, minLevel: 10, minMembers: 4, promotion: 3, relegation: 3 },
  { name: 'القسم البرونزي', tier: 3, minLevel: 5, minMembers: 3, promotion: 3, relegation: 0 }
];

const SEASON_DURATION_DAYS = 14;
const MATCHES_PER_TEAM = 6;
const POINTS_WIN = 3;
const POINTS_DRAW = 1;
const POINTS_LOSS = 0;

class ClanLeagues {
  constructor() {
    this.activeSeasons = new Map();
  }

  _getSeasonId(guildId) {
    const now = new Date();
    const seasonNumber = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (SEASON_DURATION_DAYS * 86400000));
    return `${guildId}_season_${seasonNumber}`;
  }

  async getOrCreateSeason(guildId) {
    const seasonId = this._getSeasonId(guildId);
    let season = this.activeSeasons.get(seasonId);
    if (season) return season;

    const clans = await Clan.find({ guildId }).sort({ points: -1 }).lean();
    if (clans.length < 4) {
      return { success: false, message: 'تحتاج 4 عشائر على الأقل لبدء الموسم' };
    }

    season = this._createSeason(seasonId, guildId, clans);
    this.activeSeasons.set(seasonId, season);
    return season;
  }

  _createSeason(seasonId, guildId, clans) {
    const divisions = {};
    const sorted = [...clans];

    // Assign clans to divisions based on eligibility
    DIVISIONS.forEach((div, divIndex) => {
      const eligible = [];
      for (let i = 0; i < sorted.length && eligible.length < 10; i++) {
        const c = sorted[i];
        if (c.members?.length >= div.minMembers && (!div.minLevel || (c.level || 1) >= div.minLevel)) {
          eligible.push(c);
          sorted.splice(i, 1);
          i--;
        }
      }
      if (eligible.length > 0) {
        divisions[div.name] = this._generateFixture(div.name, guildId, eligible);
      }
    });

    return {
      seasonId,
      guildId,
      startedAt: Date.now(),
      endsAt: Date.now() + SEASON_DURATION_DAYS * 86400000,
      divisions,
      status: 'active'
    };
  }

  _generateFixture(divisionName, guildId, clans) {
    const standings = clans.map(c => ({
      clanId: c._id.toString(),
      name: c.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      mvpVotes: 0
    }));

    // Generate round-robin fixture
    const fixtures = [];
    const clanIds = clans.map(c => c._id.toString());

    for (let round = 0; round < MATCHES_PER_TEAM && round < clanIds.length - 1; round++) {
      for (let i = 0; i < Math.floor(clanIds.length / 2); i++) {
        const home = i;
        const away = clanIds.length - 1 - i;
        if (home !== away) {
          fixtures.push({
            homeId: clanIds[home],
            awayId: clanIds[away],
            round,
            played: false,
            homeScore: 0,
            awayScore: 0,
            winner: null
          });
        }
      }
      clanIds.splice(1, 0, clanIds.pop());
    }

    return {
      name: divisionName,
      standings,
      fixtures,
      completedRounds: 0
    };
  }

  async playRound(guildId, divisionName) {
    const season = this.getActiveSeason(guildId);
    if (!season) return { success: false, message: 'لا يوجد موسم نشط' };

    const division = season.divisions[divisionName];
    if (!division) return { success: false, message: 'القسم غير موجود' };

    const currentRound = division.completedRounds;
    const roundFixtures = division.fixtures.filter(f => f.round === currentRound && !f.played);

    if (roundFixtures.length === 0) {
      return { success: false, message: 'اكتملت جميع جولات هذا القسم' };
    }

    for (const fixture of roundFixtures) {
      const homeClan = await Clan.findById(fixture.homeId);
      const awayClan = await Clan.findById(fixture.awayId);
      if (!homeClan || !awayClan) continue;

      const homePlayers = await Player.find({ guildId, clanId: fixture.homeId });
      const awayPlayers = await Player.find({ guildId, clanId: fixture.awayId });

      const homeMember = shuffleArray(homePlayers)[0];
      const awayMember = shuffleArray(awayPlayers)[0];

      if (!homeMember || !awayMember) {
        fixture.played = true;
        fixture.winner = homeMember ? 'home' : awayMember ? 'away' : 'draw';
        continue;
      }

      const match = await clubWars.startWar(
        guildId,
        fixture.homeId,
        fixture.awayId
      );

      if (match.success && match.war) {
        let homeWins = 0;
        let awayWins = 0;

        for (let i = 0; i < match.war.matches.length; i++) {
          const result = await clubWars.playMatch(match.warId, i);
          if (result.success) {
            if (result.match.result === 'A') homeWins++;
            else if (result.match.result === 'B') awayWins++;
          }
        }

        fixture.homeScore = homeWins;
        fixture.awayScore = awayWins;
        fixture.played = true;

        if (homeWins > awayWins) {
          fixture.winner = 'home';
        } else if (awayWins > homeWins) {
          fixture.winner = 'away';
        } else {
          fixture.winner = 'draw';
        }

        // Update standings
        const homeStanding = division.standings.find(s => s.clanId === fixture.homeId);
        const awayStanding = division.standings.find(s => s.clanId === fixture.awayId);

        if (homeStanding && awayStanding) {
          homeStanding.played++;
          awayStanding.played++;

          if (fixture.winner === 'home') {
            homeStanding.wins++;
            homeStanding.points += POINTS_WIN;
            awayStanding.losses++;
          } else if (fixture.winner === 'away') {
            awayStanding.wins++;
            awayStanding.points += POINTS_WIN;
            homeStanding.losses++;
          } else {
            homeStanding.draws++;
            awayStanding.draws++;
            homeStanding.points += POINTS_DRAW;
            awayStanding.points += POINTS_DRAW;
          }
        }
      }
    }

    division.completedRounds++;
    this._checkSeasonComplete(season);

    return {
      success: true,
      round: currentRound + 1,
      fixtures: roundFixtures,
      standings: division.standings
    };
  }

  _checkSeasonComplete(season) {
    const allComplete = Object.values(season.divisions).every(
      div => div.fixtures.every(f => f.played)
    );

    if (allComplete) {
      season.status = 'completed';
      season.endedAt = Date.now();
      this._awardSeasonRewards(season);
    }
  }

  async _awardSeasonRewards(season) {
    for (const [divName, division] of Object.entries(season.divisions)) {
      const sorted = [...division.standings].sort((a, b) => b.points - a.points);
      const divIndex = DIVISIONS.findIndex(d => d.name === divName);
      const divConfig = DIVISIONS[divIndex];

      if (!divConfig) continue;

      // Top clans get rewards
      const topClans = sorted.slice(0, Math.min(3, sorted.length));

      for (const standing of topClans) {
        const clan = await Clan.findById(standing.clanId);
        if (!clan) continue;

        const rank = topClans.indexOf(standing) + 1;
        const coinReward = (3 - rank + 1) * 5000;
        const xpReward = (3 - rank + 1) * 1000;
        const titleReward = `🏆 بطل ${divName}`;

        clan.balance = (clan.balance || 0) + coinReward;
        clan.xp = (clan.xp || 0) + xpReward;

        const xpNeeded = clan.level * 500;
        while (clan.xp >= xpNeeded) {
          clan.xp -= xpNeeded;
          clan.level++;
        }

        for (const memberId of clan.members) {
          const player = await Player.findOne({ userId: memberId, guildId: season.guildId });
          if (player) {
            if (!player.titles) player.titles = [];
            if (!player.titles.includes(titleReward)) {
              player.titles.push(titleReward);
            }
            player.coins += Math.floor(coinReward / clan.members.length);
            await player.save();
          }
        }

        await clan.save();
      }

      // Handle promotion/relegation
      if (divConfig.promotion > 0 && divIndex > 0) {
        const promoted = sorted.slice(0, divConfig.promotion);
        for (const p of promoted) {
          const clan = await Clan.findById(p.clanId);
          if (clan) {
            clan.points += 200;
            await clan.save();
          }
        }
      }

      if (divConfig.relegation > 0 && divIndex < DIVISIONS.length - 1) {
        const relegated = sorted.slice(sorted.length - divConfig.relegation);
        for (const r of relegated) {
          const clan = await Clan.findById(r.clanId);
          if (clan) {
            clan.points = Math.max(clan.points - 100, 0);
            await clan.save();
          }
        }
      }
    }
  }

  getActiveSeason(guildId) {
    const now = Date.now();
    for (const [id, season] of this.activeSeasons) {
      if (season.guildId === guildId && season.status === 'active' && now < season.endsAt) {
        return season;
      }
    }
    return null;
  }

  getStandings(guildId, divisionName) {
    const season = this.getActiveSeason(guildId);
    if (!season) return null;

    if (divisionName) {
      const div = season.divisions[divisionName];
      return div ? [...div.standings].sort((a, b) => b.points - a.points) : null;
    }

    const allStandings = {};
    for (const [name, div] of Object.entries(season.divisions)) {
      allStandings[name] = [...div.standings].sort((a, b) => b.points - a.points);
    }
    return allStandings;
  }

  getDivisionInfo(divisionName) {
    return DIVISIONS.find(d => d.name === divisionName);
  }

  getSeasonStatus(guildId) {
    const season = this.getActiveSeason(guildId);
    if (!season) return { active: false, message: 'لا يوجد موسم نشط' };

    const totalFixtures = Object.values(season.divisions)
      .reduce((s, d) => s + d.fixtures.length, 0);
    const playedFixtures = Object.values(season.divisions)
      .reduce((s, d) => s + d.fixtures.filter(f => f.played).length, 0);

    return {
      active: true,
      seasonId: season.seasonId,
      startedAt: season.startedAt,
      endsAt: season.endsAt,
      progress: `${playedFixtures}/${totalFixtures}`,
      percentage: Math.round((playedFixtures / totalFixtures) * 100),
      status: season.status,
      divisions: Object.keys(season.divisions)
    };
  }
}

module.exports = new ClanLeagues();