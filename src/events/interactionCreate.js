const startCommand = require('../commands/start');
const menuCommand = require('../commands/menu');
const profileCommand = require('../commands/profile');
const helpCommand = require('../commands/help');
const adminCommand = require('../commands/admin');
const packCommand = require('../commands/pack');
const inventoryCommand = require('../commands/inventory');
const playerCommand = require('../commands/player');
const sellCommand = require('../commands/sell');
const coinsCommand = require('../commands/coins');
const cardsCommand = require('../commands/cards');
const dailyCommand = require('../commands/daily');
const tradeCommand = require('../commands/trade');
const matchmakingCommand = require('../commands/matchmaking');
const fusionCommand = require('../commands/fusion');
const giftCommand = require('../commands/gift');
const clanCommand = require('../commands/clan');
const leaderboardCommand = require('../commands/leaderboard');
const historyCommand = require('../commands/history');
const marketCommand = require('../commands/market');
const achievementsCommand = require('../commands/achievements');
const seasonCommand = require('../commands/season');
const shopCommand = require('../commands/shop');
const backupCommand = require('../commands/backup');
const missionsCommand = require('../commands/missions');
const config = require('../config/config');

const cooldowns = new Map();
const pendingBoxes = new Map(); // userId -> { boxType, price, rarity }
const pendingWarFirst = new Map(); // userId -> clanAId

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isCommand()) {
      const { commandName } = interaction;

      try {
        if (cooldowns.has(interaction.user.id)) {
          const lastUsed = cooldowns.get(interaction.user.id);
          const diff = Date.now() - lastUsed;
          if (diff < 2000) {
            return interaction.reply({
              content: '⏳ انتظر قليلاً قبل استخدام الأمر مرة أخرى',
              flags: 64
            });
          }
        }
        cooldowns.set(interaction.user.id, Date.now());

        switch (commandName) {
          case 'start':
            await startCommand.execute(interaction);
            break;
          case 'menu':
            await menuCommand.execute(interaction);
            break;
          case 'profile':
            await profileCommand.execute(interaction);
            break;
          case 'help':
            await helpCommand.execute(interaction);
            break;
          case 'admin':
            await adminCommand.execute(interaction);
            break;
          case 'pack':
            await packCommand.execute(interaction);
            break;
          case 'inventory':
            await inventoryCommand.execute(interaction);
            break;
          case 'player':
            await playerCommand.execute(interaction);
            break;
          case 'sell':
            await sellCommand.execute(interaction);
            break;
          case 'coins':
            await coinsCommand.execute(interaction);
            break;
          case 'daily':
            await dailyCommand.execute(interaction);
            break;
          case 'trade':
            await tradeCommand.execute(interaction);
            break;
          case 'matchmaking':
            await matchmakingCommand.execute(interaction);
            break;
          case 'fusion':
            await fusionCommand.execute(interaction);
            break;
          case 'gift':
            await giftCommand.execute(interaction);
            break;
          case 'clan':
            await clanCommand.execute(interaction);
            break;
          case 'leaderboard':
            await leaderboardCommand.execute(interaction);
            break;
          case 'history':
            await historyCommand.execute(interaction);
            break;
          case 'market':
            await marketCommand.execute(interaction);
            break;
          case 'achievements':
            await achievementsCommand.execute(interaction);
            break;
          case 'season':
            await seasonCommand.execute(interaction);
            break;
          case 'shop':
            await shopCommand.execute(interaction);
            break;
          case 'backup':
            await backupCommand.execute(interaction);
            break;
          case 'missions':
            await missionsCommand.execute(interaction);
            break;
          default:
            await interaction.reply({ content: '⚠️ أمر غير معروف', flags: 64 });
        }
      } catch (error) {
        console.error(`Error executing ${commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: '❌ خطأ في تنفيذ الأمر', flags: 64 });
        } else {
          await interaction.reply({ content: '❌ خطأ في تنفيذ الأمر', flags: 64 });
        }
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      try {
        switch (interaction.customId) {
          case 'player_name_modal':
            await startCommand.handlePlayerNameModal(interaction);
            break;
          case 'create_clan_modal':
            await handleClanCreateModal(interaction);
            break;
          case 'tournament_create_modal':
            await handleTournamentCreateModal(interaction);
            break;
          case 'admin_search_player_modal':
            await handleAdminSearchPlayer(interaction);
            break;
          case 'admin_add_xp_modal':
            await handleAdminAddXP(interaction);
            break;
          case 'admin_add_coins_modal':
            await handleAdminAddCoins(interaction);
            break;
          default:
            await interaction.reply({ content: '⚠️ نافذة غير معروفة', flags: 64 });
        }
      } catch (error) {
        console.error('Modal error:', error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: '❌ حدث خطأ', flags: 64 });
        } else {
          await interaction.reply({ content: '❌ حدث خطأ', flags: 64 });
        }
      }
      return;
    }

    if (interaction.isButton()) {
      try {
        await handleButtonInteraction(interaction);
      } catch (error) {
        console.error('Button error:', error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: '❌ حدث خطأ', flags: 64 });
        } else {
          await interaction.reply({ content: '❌ حدث خطأ', flags: 64 });
        }
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      try {
        await handleSelectMenuInteraction(interaction);
      } catch (error) {
        console.error('Select menu error:', error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: '❌ حدث خطأ', flags: 64 });
        } else {
          await interaction.reply({ content: '❌ حدث خطأ', flags: 64 });
        }
      }
      return;
    }
  }
};

async function handleButtonInteraction(interaction) {
  const { customId } = interaction;

  switch (customId) {
    // Start command buttons
    case 'create_player':
      await startCommand.handleCreatePlayer(interaction);
      break;
    case 'how_to_play':
      await startCommand.handleHowToPlay(interaction);
      break;
    case 'create_player_back':
      await startCommand.execute(interaction);
      break;

    case 'missions':
      await menuCommand.handleMissions(interaction);
      break;
    case 'claim_weekly':
      await handleClaimWeekly(interaction);
      break;

    // Main menu buttons
    case 'open_menu':
    case 'main_menu_back':
      await menuCommand.handleMenuBack(interaction);
      break;
    case 'play_match':
      const { createPlayMenu } = require('../ui/mainMenu');
      await interaction.update(createPlayMenu());
      break;
    case 'training':
      await menuCommand.handleTrain(interaction);
      break;
    case 'missions':
      await menuCommand.handleMissions(interaction);
      break;
    case 'tournament':
      await handleTournamentMenu(interaction);
      break;
    case 'tournament_create':
      await handleTournamentCreate(interaction);
      break;
    case 'tournament_join':
      await handleTournamentJoin(interaction);
      break;
    case 'tournament_bracket':
      await handleTournamentBracket(interaction);
      break;
    case 'tournament_simulate':
      await handleTournamentSimulate(interaction);
      break;
    case 'shop':
      await menuCommand.handleShop(interaction);
      break;
    case 'collection':
      await menuCommand.handleCollection(interaction);
      break;
    case 'profile':
      await menuCommand.handleProfile(interaction);
      break;
    case 'rankings':
      await menuCommand.handleRankings(interaction);
      break;
    case 'clan_menu':
      await menuCommand.handleClanMenu(interaction);
      break;
    case 'league_overview':
      await handleLeagueOverview(interaction);
      break;
    case 'league_create':
      await handleLeagueCreate(interaction);
      break;
    case 'league_standings':
      await handleLeagueStandings(interaction);
      break;
    case 'league_round':
      await handleLeagueRound(interaction);
      break;
    case 'season_pass':
      await menuCommand.handleSeasonPass(interaction);
      break;
    case 'lootbox':
      await menuCommand.handleLootBox(interaction);
      break;
    case 'transfer_market':
      await handleTransferMarket(interaction);
      break;
    case 'transfer_page_next':
      await handleTransferMarketPage(interaction, 1);
      break;
    case 'transfer_page_prev':
      await handleTransferMarketPage(interaction, -1);
      break;
    case 'transfer_buy':
      await handleTransferBuy(interaction);
      break;
    case 'transfer_list':
      await handleTransferList(interaction);
      break;
    case 'transfer_cancel':
      await handleTransferCancel(interaction);
      break;
    case 'draft':
      await handleDraftMenu(interaction);
      break;
    case 'draft_join':
      await handleDraftJoin(interaction);
      break;
    case 'draft_start':
      await handleDraftStart(interaction);
      break;
    case 'draft_pick':
      await handleDraftPick(interaction);
      break;
    case 'draft_simulate':
      await handleDraftSimulate(interaction);
      break;
    case 'club_wars':
      await handleClubWars(interaction);
      break;
    case 'club_wars_start':
      await handleClubWarsStart(interaction);
      break;
    case 'club_wars_play':
      await handleClubWarsPlay(interaction);
      break;
    case 'club_wars_status':
      await handleClubWarsStatus(interaction);
      break;
    case 'boosters':
      await handleBoostersMenu(interaction);
      break;
    case 'booster_buy':
      await handleBoosterBuy(interaction);
      break;
    case 'booster_status':
      await handleBoosterStatus(interaction);
      break;
    case 'open_box_confirm':
      await handleOpenBoxAnimation(interaction);
      break;
    case 'open_box_cancel':
      await interaction.update({
        content: '❌ تم إلغاء فتح الصندوق',
        embeds: [],
        components: []
      });
      break;

    // Admin buttons
    case 'admin_players':
      await adminCommand.showPlayerManagement(interaction);
      break;
    case 'admin_clans':
      await adminCommand.showClanManagement(interaction);
      break;
    case 'admin_seasons':
      await adminCommand.showSeasonManagement(interaction);
      break;
    case 'admin_tournaments':
      await adminCommand.showTournamentManagement(interaction);
      break;
    case 'admin_economy':
      await adminCommand.showEconomyManagement(interaction);
      break;
    case 'admin_stats':
      await adminCommand.showServerStats(interaction);
      break;
    case 'admin_security':
      await adminCommand.showSecurityPanel(interaction);
      break;
    case 'admin_events':
      await adminCommand.showEventsPanel(interaction);
      break;
    case 'admin_back':
      await adminCommand.showAdminPanel(interaction);
      break;
    case 'admin_refresh_stats':
      await adminCommand.showServerStats(interaction);
      break;
    case 'admin_search_player':
      {
        const { ModalBuilder: MBsp, TextInputBuilder: TIsp, TextInputStyle: TISsp, ActionRowBuilder: ARBsp } = require('discord.js');
        const modal = new MBsp().setCustomId('admin_search_player_modal').setTitle('🔍 بحث عن لاعب');
        const input = new TIsp().setCustomId('player_name').setLabel('اسم اللاعب').setStyle(TISsp.Short).setRequired(true).setPlaceholder('أدخل اسم اللاعب...');
        modal.addComponents(new ARBsp().addComponents(input));
        await interaction.showModal(modal);
      }
      break;
    case 'admin_add_xp':
      {
        const { ModalBuilder: MBax, TextInputBuilder: TIax, TextInputStyle: TISax, ActionRowBuilder: ARBax } = require('discord.js');
        const modal = new MBax().setCustomId('admin_add_xp_modal').setTitle('➕ إضافة XP');
        const nameInput = new TIax().setCustomId('player_name').setLabel('اسم اللاعب').setStyle(TISax.Short).setRequired(true);
        const xpInput = new TIax().setCustomId('xp_amount').setLabel('كمية XP').setStyle(TISax.Short).setRequired(true).setPlaceholder('مثال: 500');
        modal.addComponents(new ARBax().addComponents(nameInput), new ARBax().addComponents(xpInput));
        await interaction.showModal(modal);
      }
      break;
    case 'admin_add_coins':
      {
        const { ModalBuilder: MBac, TextInputBuilder: TIac, TextInputStyle: TISac, ActionRowBuilder: ARBac } = require('discord.js');
        const modal = new MBac().setCustomId('admin_add_coins_modal').setTitle('🪙 إضافة عملات');
        const nameInput = new TIac().setCustomId('player_name').setLabel('اسم اللاعب').setStyle(TISac.Short).setRequired(true);
        const coinsInput = new TIac().setCustomId('coins_amount').setLabel('كمية العملات').setStyle(TISac.Short).setRequired(true).setPlaceholder('مثال: 1000');
        modal.addComponents(new ARBac().addComponents(nameInput), new ARBac().addComponents(coinsInput));
        await interaction.showModal(modal);
      }
      break;

    // Help buttons
    case 'help_start':
      await helpCommand.showGettingStarted(interaction);
      break;
    case 'help_commands':
      await helpCommand.showCommands(interaction);
      break;
    case 'help_systems':
      await helpCommand.showGameSystems(interaction);
      break;
    case 'help_characters':
      await helpCommand.showCharacters(interaction);
      break;
    case 'help_rankings':
      await helpCommand.showRankings(interaction);
      break;
    case 'help_teams':
      await helpCommand.showTeams(interaction);
      break;

    // Gacha / Pack buttons
    case 'pack_list':
      await packCommand.handleList(interaction);
      break;
    case 'inventory':
      await inventoryCommand.execute(interaction);
      break;
    case 'inv_page_next':
    case 'inv_page_prev':
      await inventoryCommand.execute(interaction);
      break;

    // Match buttons
    case 'quick_match':
      await menuCommand.handleQuickMatch(interaction);
      break;
    case 'ranked_match':
        await interaction.reply({ content: '⚔️ المباريات التنافسية قريباً!', flags: 64 });
      break;
    case 'vs_bot':
      await menuCommand.handleVsBot(interaction);
      break;
    case 'ach_page_next':
    case 'ach_page_prev':
      await menuCommand.handleAchievements(interaction);
      break;
    case 'collection_prev':
    case 'collection_next':
      await menuCommand.handleCollection(interaction);
      break;
    case 'rankings_ovr':
    case 'rankings_wins':
    case 'rankings_goals':
      await menuCommand.handleRankings(interaction);
      break;
    case 'challenge_player':
      await handleChallengePlayer(interaction);
      break;
    case 'cancel_search':
      await menuCommand.handleCancelSearch(interaction);
      break;
    case 'start_match':
      await menuCommand.handleStartMatch(interaction);
      break;
    case 'cancel_match':
      await interaction.update({
        content: '❌ تم إلغاء المباراة',
        embeds: [],
        components: []
      });
      break;
    case 'play_again':
      const { createPlayMenu: cpm2 } = require('../ui/mainMenu');
      await interaction.update(cpm2());
      break;
    case 'story_menu':
      await handleStoryMenu(interaction);
      break;

    // Profile buttons
    case 'view_achievements':
      await menuCommand.handleAchievements(interaction);
      break;
    case 'view_titles':
      await menuCommand.handleTitles(interaction);
      break;
    case 'view_stats_detailed':
      await menuCommand.handleStatsDetailed(interaction);
      break;
    case 'view_items':
      await menuCommand.handleItems(interaction);
      break;

    // Mission buttons
    case 'claim_daily':
      await menuCommand.handleClaimDaily(interaction);
      break;
    case 'claim_weekly':
      await menuCommand.handleClaimWeekly(interaction);
      break;

    // Clan buttons
    case 'create_clan':
      await handleClanCreate(interaction);
      break;
    case 'join_clan':
      await handleClanJoin(interaction);
      break;
    case 'clan_leaderboard':
      await handleClanLeaderboard(interaction);
      break;
    case 'leave_clan':
      await handleClanLeave(interaction);
      break;

    // Season pass buttons
    case 'claim_pass':
      const PlayerModel = require('../database/models/Player');
      const seasonPlayer = await PlayerModel.findOne({
        userId: interaction.user.id,
        guildId: interaction.guildId
      });
      if (!seasonPlayer) return;
      const { createSeasonPassMenu: spm } = require('../ui/mainMenu');
      await interaction.update(spm(seasonPlayer));
      break;
    case 'upgrade_pass':
      await interaction.reply({
        content: '💎 ترقية موسم بريميوم قريباً!',
        flags: 64
      });
      break;

    default:
      // Cards museum navigation
      if (customId.startsWith('cards_nav_first_')) {
        const filter = customId.replace('cards_nav_first_', '');
        await cardsCommand.handleNav(interaction, filter, 'first');
        return;
      }
      if (customId.startsWith('cards_nav_prev_')) {
        const filter = customId.replace('cards_nav_prev_', '');
        await cardsCommand.handleNav(interaction, filter, 'prev');
        return;
      }
      if (customId.startsWith('cards_nav_next_')) {
        const filter = customId.replace('cards_nav_next_', '');
        await cardsCommand.handleNav(interaction, filter, 'next');
        return;
      }
      if (customId.startsWith('cards_nav_last_')) {
        const filter = customId.replace('cards_nav_last_', '');
        await cardsCommand.handleNav(interaction, filter, 'last');
        return;
      }
      if (customId.startsWith('cards_filter_')) {
        const filter = customId.replace('cards_filter_', '');
        await cardsCommand.handleRarityFilter(interaction, filter);
        return;
      }

      if (customId.startsWith('pack_open_')) {
        const packKey = customId.replace('pack_open_', '');
        const gacha = require('../systems/gacha');
        const { PACKS: packs } = require('../data/gachaData');
        const { createCardEmbed, createDuplicateEmbed } = require('../utils/gachaCardEmbed');
        const { ActionRowBuilder: ARB4, ButtonBuilder: BB4, ButtonStyle: BS4 } = require('discord.js');

        const result = await gacha.openPack(interaction.user.id, interaction.guildId, packKey);
        if (!result.success) {
          return interaction.update({ content: result.message, embeds: [], components: [] });
        }

        const pack = packs[packKey];

        if (result.isDuplicate) {
          const dupEmbed = createDuplicateEmbed(pack.name, pack.emoji, result.rarity, result.message);
          const dupRow = new ARB4().addComponents(
            new BB4().setCustomId(`pack_open_${packKey}`).setLabel(`${pack.emoji} فتح مرة أخرى`).setStyle(BS4.Primary),
            new BB4().setCustomId('pack_list').setLabel('📋 عرض الباكات').setStyle(BS4.Secondary),
            new BB4().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(BS4.Secondary)
          );
          return interaction.update({ embeds: [dupEmbed], components: [dupRow] });
        }

        const cardEmbed = createCardEmbed(result.card, pack.name, result.rarity, pack.emoji, result.card.image);

        const resultRow = new ARB4().addComponents(
          new BB4().setCustomId(`pack_open_${packKey}`).setLabel(`${pack.emoji} Open Again`).setStyle(BS4.Primary),
            new BB4().setCustomId('inventory').setLabel('📂 المخزون').setStyle(BS4.Secondary),
            new BB4().setCustomId('pack_list').setLabel('📋 الباكات').setStyle(BS4.Secondary),
          new BB4().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(BS4.Secondary)
        );
        await interaction.update({ embeds: [cardEmbed], components: [resultRow] });
        return;
      }

      if (customId.startsWith('story_play_')) {
        const chapterId = customId.replace('story_play_', '');
        await handleStoryPlay(interaction, chapterId);
        return;
      }

      if (customId.startsWith('pack_buy_confirm_')) {
        const packKey = customId.replace('pack_buy_confirm_', '');
        const gacha = require('../systems/gacha');
        const { PACKS: packs } = require('../data/gachaData');
        const { createCardEmbed, createDuplicateEmbed } = require('../utils/gachaCardEmbed');
        const { ActionRowBuilder: ARB5, ButtonBuilder: BB5, ButtonStyle: BS5 } = require('discord.js');

        const result = await gacha.openPack(interaction.user.id, interaction.guildId, packKey);
        if (!result.success) {
          return interaction.update({ content: result.message, embeds: [], components: [] });
        }

        const pack = packs[packKey];

        if (result.isDuplicate) {
          const dupEmbed = createDuplicateEmbed(pack.name, pack.emoji, result.rarity, result.message);
          const dupRow = new ARB5().addComponents(
            new BB5().setCustomId(`pack_open_${packKey}`).setLabel(`${pack.emoji} فتح مرة أخرى`).setStyle(BS5.Primary),
            new BB5().setCustomId('pack_list').setLabel('📋 الباكات').setStyle(BS5.Secondary),
            new BB5().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(BS5.Secondary)
          );
          return interaction.update({ embeds: [dupEmbed], components: [dupRow] });
        }

        const cardEmbed = createCardEmbed(result.card, pack.name, result.rarity, pack.emoji, result.card.image);

        const resultRow = new ARB5().addComponents(
          new BB5().setCustomId(`pack_open_${packKey}`).setLabel(`${pack.emoji} Open Again`).setStyle(BS5.Primary),
            new BB5().setCustomId('inventory').setLabel('📂 المخزون').setStyle(BS5.Secondary),
            new BB5().setCustomId('pack_list').setLabel('📋 الباكات').setStyle(BS5.Secondary),
          new BB5().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(BS5.Secondary)
        );
        await interaction.update({ embeds: [cardEmbed], components: [resultRow] });
        return;
      }

      console.log(`Unknown button: ${customId}`);
      if (!interaction.replied) {
        await interaction.reply({ content: '⚠️ Unknown button', flags: 64 });
      }
  }
}

async function handleSelectMenuInteraction(interaction) {
  const { customId, values } = interaction;

  switch (customId) {
    case 'train_stat':
      await menuCommand.handleTrainStat(interaction);
      break;
    case 'buy_item':
      await menuCommand.handleBuyItem(interaction);
      break;
    case 'open_lootbox':
      await handleOpenLootBoxWithAnimation(interaction);
      break;
    case 'shop_category':
      const { createShopMenu } = require('../ui/shopUI');
      await interaction.update(createShopMenu(values[0]));
      break;
    case 'select_title':
      const PlayerMod = require('../database/models/Player');
      const titlePlayer = await PlayerMod.findOne({
        userId: interaction.user.id,
        guildId: interaction.guildId
      });
      if (titlePlayer) {
        titlePlayer.activeTitle = values[0];
        await titlePlayer.save();
        await interaction.reply({ content: `✅ تم تفعيل اللقب: **${values[0]}**`, flags: 64 });
      }
      break;
    case 'select_position':
    case 'select_style':
    case 'select_character':
      // Handled internally by start command's channel collector
      break;
    case 'transfer_buy_select':
      await handleTransferBuyItem(interaction, values[0]);
      break;
    case 'transfer_list_type':
      await handleTransferListType(interaction, values[0]);
      break;
    case 'draft_available_pick':
      const draftSys = require('../systems/draft');
      const lastUnderscorePos = values[0].lastIndexOf('_');
      const pickDraftId = values[0].substring(0, lastUnderscorePos);
      const pickCharIndex = parseInt(values[0].substring(lastUnderscorePos + 1));
      const pickResult2 = await draftSys.pickCharacter(pickDraftId, interaction.user.id, pickCharIndex);

      const { EmbedBuilder: EB, ActionRowBuilder: ARB2, ButtonBuilder: BB2, ButtonStyle: BS2 } = require('discord.js');
      const draftEmbed2 = new EB()
        .setColor(pickResult2.success ? config.colors.success : config.colors.danger)
        .setAuthor({ name: 'اختيار المسودة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle(pickResult2.success ? '✅ تم الاختيار!' : '❌ فشل')
    .setDescription(pickResult2.message)
    .setTimestamp();

    const row2 = new ActionRowBuilder()
      .addComponents(
        new BB2().setCustomId('draft').setLabel('🎯 Draft').setStyle(BS2.Primary),
        new BB2().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(BS2.Secondary)
      );
      await interaction.update({ embeds: [draftEmbed2], components: [row2] });
      break;
    case 'transfer_sell_card':
      await handleTransferSellCard(interaction);
      break;
    case 'transfer_cancel_select':
      await handleTransferCancelSelect(interaction, values[0]);
      break;
    case 'draft_create_size':
      await handleDraftCreateSize(interaction, parseInt(values[0]));
      break;
    case 'draft_join_select':
      await handleDraftJoinSelect(interaction, values[0]);
      break;
    case 'booster_select':
      await handleBoosterSelect(interaction, values[0]);
      break;
    case 'club_wars_select':
      await handleClubWarsSelect(interaction, values[0]);
      break;
    case 'challenge_select':
      await handleChallengeSelect(interaction, values[0]);
      break;
    case 'clan_join_select':
      await handleClanJoinSelect(interaction, values[0]);
      break;
    case 'tournament_size_select':
      await handleTournamentSizeSelect(interaction, values[0]);
      break;
    case 'tournament_join_select':
      await handleTournamentJoinSelect(interaction, values[0]);
      break;
    case 'league_div_select':
      {
        const divisionName = values[0].replace('league_', '');
        const { createDivisionEmbed } = require('../ui/clanLeaguesUI');
        const result = createDivisionEmbed(interaction.guildId, divisionName);
        await interaction.update(result);
      }
      break;

    // Story mode select menus
    case 'story_part_select':
      await handleStoryPartSelect(interaction, values[0]);
      break;
    case 'story_chapter_select':
      await handleStoryChapterSelect(interaction, values[0]);
      break;

    // Gacha select menus
    case 'pack_buy_select':
      {
        const gachaBuy = require('../systems/gacha');
        const { PACKS: packs2 } = require('../data/gachaData');
        const { createCardEmbed, createDuplicateEmbed } = require('../utils/gachaCardEmbed');
        const { ActionRowBuilder: ARBg1, ButtonBuilder: BBg1, ButtonStyle: BSg1 } = require('discord.js');

        const buyResult = await gachaBuy.openPack(interaction.user.id, interaction.guildId, values[0]);
        if (!buyResult.success) {
          return interaction.update({ content: buyResult.message, embeds: [], components: [] });
        }
        const packItem = packs2[values[0]];

        if (buyResult.isDuplicate) {
          const dupEmbed = createDuplicateEmbed(packItem.name, packItem.emoji, buyResult.rarity, buyResult.message);
          const dupRow = new ARBg1().addComponents(
            new BBg1().setCustomId(`pack_open_${values[0]}`).setLabel(`${packItem.emoji} فتح مرة أخرى`).setStyle(BSg1.Primary),
            new BBg1().setCustomId('pack_list').setLabel('📋 الباكات').setStyle(BSg1.Secondary),
            new BBg1().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(BSg1.Secondary)
          );
          return interaction.update({ embeds: [dupEmbed], components: [dupRow] });
        }

        const cardEmbedG1 = createCardEmbed(buyResult.card, packItem.name, buyResult.rarity, packItem.emoji, buyResult.card.image);

        const resultRowG1 = new ARBg1().addComponents(
          new BBg1().setCustomId(`pack_open_${values[0]}`).setLabel(`${packItem.emoji} Open Again`).setStyle(BSg1.Primary),
            new BBg1().setCustomId('inventory').setLabel('📂 المخزون').setStyle(BSg1.Secondary),
            new BBg1().setCustomId('pack_list').setLabel('📋 الباكات').setStyle(BSg1.Secondary),
          new BBg1().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(BSg1.Secondary)
        );
        await interaction.update({ embeds: [cardEmbedG1], components: [resultRowG1] });
      }
      break;

    case 'inventory_sell_select':
      {
        const invSell = require('../systems/gacha');
        const invSellResult = await invSell.sellDuplicate(interaction.user.id, interaction.guildId, values[0]);
        const { createSellResultEmbed } = require('../utils/gachaCardEmbed');
        const { ActionRowBuilder: ARBg2, ButtonBuilder: BBg2, ButtonStyle: BSg2 } = require('discord.js');

        const sellEmbedG = createSellResultEmbed(invSellResult.success, invSellResult.message);
        const sellRowG = new ARBg2().addComponents(
          new BBg2().setCustomId('inventory').setLabel('📂 المخزون').setStyle(BSg2.Primary),
          new BBg2().setCustomId('pack_list').setLabel('📦 الباكات').setStyle(BSg2.Secondary),
          new BBg2().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(BSg2.Secondary)
        );
        await interaction.update({ embeds: [sellEmbedG], components: [sellRowG] });
      }
      break;

    case 'sell_select_card':
      {
        const sellSys = require('../systems/gacha');
        const sellRes = await sellSys.sellDuplicate(interaction.user.id, interaction.guildId, values[0]);
        const { createSellResultEmbed } = require('../utils/gachaCardEmbed');
        const { ActionRowBuilder: ARBg3, ButtonBuilder: BBg3, ButtonStyle: BSg3 } = require('discord.js');

        const sellEmbedG2 = createSellResultEmbed(sellRes.success, sellRes.message);
        const sellRowG2 = new ARBg3().addComponents(
          new BBg3().setCustomId('inventory').setLabel('📂 المخزون').setStyle(BSg3.Primary),
          new BBg3().setCustomId('pack_list').setLabel('📦 الباكات').setStyle(BSg3.Secondary),
          new BBg3().setCustomId('main_menu_back').setLabel('◀️ رجوع').setStyle(BSg3.Secondary)
        );
        await interaction.update({ embeds: [sellEmbedG2], components: [sellRowG2] });
      }
      break;

    default:
      console.log(`Unknown select menu: ${customId}`);
      if (!interaction.replied) {
        await interaction.reply({ content: '⚠️ قائمة غير معروفة', flags: 64 });
      }
  }
}

// ===================== TRANSFER MARKET HANDLERS =====================

async function handleTransferMarket(interaction) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً', flags: 64 });

  const transfer = require('../systems/transferMarket');
  const listingData = await transfer.getListingsByPage(interaction.guildId, 0);
  const userListings = await transfer.getSellerListings(interaction.user.id);

  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.info)
    .setAuthor({ name: 'سوق الانتقالات', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🔄 سوق الانتقالات')
    .setDescription([
      '',
      `${divider()}`,
      '',
      `Total listings: \`${listingData.total}\`  •  Your listings: \`${userListings.length}/5\``,
      '',
      `${divider()}`,
      ''
    ].join('\n'))
    .addFields(
      { name: `📋 Page ${listingData.page}/${listingData.totalPages}`, value: listingData.display, inline: false }
    )
    .setFooter({ text: '⚽ Buy items or list your own for sale', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('transfer_list').setLabel('📤 عرض للبيع').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('transfer_cancel').setLabel('🗑️ إلغاء العرض').setStyle(ButtonStyle.Danger).setDisabled(userListings.length === 0)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('transfer_page_prev').setLabel('◀️').setStyle(ButtonStyle.Secondary).setDisabled(listingData.page <= 1),
    new ButtonBuilder().setCustomId('transfer_page_next').setLabel('▶️').setStyle(ButtonStyle.Secondary).setDisabled(listingData.page >= listingData.totalPages),
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  if (listingData.items.length > 0) {
    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('transfer_buy_select')
    .setPlaceholder('اختر عنصراً للشراء')
    .addOptions(
          listingData.items.slice(0, 25).map(l => ({
            label: `${l.itemData.name || 'Item'} - 🪙${l.price}`,
            value: l.listingId,
            description: `By ${l.sellerName}`
          }))
        )
    );
    return interaction.update({ embeds: [embed], components: [row1, selectRow, row2] });
  }

  await interaction.update({ embeds: [embed], components: [row1, row2] });
}

async function handleTransferMarketPage(interaction, direction) {
  const transfer = require('../systems/transferMarket');
  const currentPage = parseInt(interaction.message.embeds[0]?.fields?.[0]?.name?.match(/(\d+)\/(\d+)/)?.[1] || 1);
  const newPage = Math.max(0, currentPage - 1 + direction);
  const listingData = await transfer.getListingsByPage(interaction.guildId, newPage);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.info)
    .setTitle('🔄 سوق الانتقالات')
    .setDescription(`عدد العناصر: \`${listingData.total}\`\n${divider()}`)
    .addFields(
      { name: `📋 Page ${listingData.page}/${listingData.totalPages}`, value: listingData.display, inline: false }
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('transfer_page_prev').setLabel('◀️').setStyle(ButtonStyle.Secondary).setDisabled(listingData.page <= 1),
    new ButtonBuilder().setCustomId('transfer_page_next').setLabel('▶️').setStyle(ButtonStyle.Secondary).setDisabled(listingData.page >= listingData.totalPages),
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleTransferBuyItem(interaction, listingId) {
  const transfer = require('../systems/transferMarket');
  const result = await transfer.buyItem(interaction.user.id, interaction.guildId, listingId);

  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '✅ تم الشراء' : '❌ فشل الشراء', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🔄 سوق الانتقالات')
    .setDescription(result.message)
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('transfer_market').setLabel('🔄 السوق').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleTransferList(interaction) {
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.info)
    .setAuthor({ name: 'سوق الانتقالات', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('📤 عرض عنصر للبيع')
    .setDescription(`اختر نوع العنصر للبيع\n${divider()}\n\`10%\` رسوم على البيع`)
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('transfer_list_type')
        .setPlaceholder('اختر نوع العنصر')
        .addOptions([
          { label: '🎴 بطاقة', value: 'card', description: 'بيع بطاقة من مجموعتك' },
          { label: '🎗️ لقب', value: 'title', description: 'بيع لقب تملكه' }
        ])
    );

  const backRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('transfer_market')
        .setLabel('◀️ رجوع')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row, backRow] });
}

async function handleTransferListType(interaction, type) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return;

  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

  if (type === 'card') {
    const cards = player.cards || [];
    if (cards.length === 0) {
      return interaction.update({
        embeds: [new EmbedBuilder().setColor(config.colors.danger).setAuthor({ name: 'سوق الانتقالات', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' }).setTitle('❌ لا توجد بطاقات').setDescription('ليس لديك بطاقات للبيع').setTimestamp()],
        components: []
      });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setAuthor({ name: 'سوق الانتقالات', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('🎴 اختر بطاقة للبيع')
      .setDescription(`اختر بطاقة — سيُطلب منك تحديد السعر\n${divider()}`)
      .setTimestamp();

    const selectRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('transfer_sell_card')
          .setPlaceholder('Select a card')
          .addOptions(
            cards.slice(0, 25).map((c, i) => ({
              label: `${c.name || 'Card'} [${c.rarity || 'Common'}]`,
              value: `${c.cardId}`,
              description: `Suggested: 🪙${_getCardPrice(c.rarity)}`
            }))
          )
      );

    await interaction.update({ embeds: [embed], components: [selectRow] });
  } else if (type === 'title') {
    const titles = player.titles || [];
    if (titles.length === 0) {
      return interaction.update({
        embeds: [new EmbedBuilder().setColor(config.colors.danger)      .setTitle('❌ لا توجد ألقاب').setDescription('ليس لديك ألقاب للبيع')],
        components: []
      });
    }
    await interaction.reply({ content: '⚠️ بيع الألقاب قريباً', flags: 64 });
  }
}

async function handleTransferCancel(interaction) {
  const transfer = require('../systems/transferMarket');
  const listings = await transfer.getSellerListings(interaction.user.id);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

  if (listings.length === 0) {
    return interaction.reply({ content: '⚠️ لا توجد عروض نشطة', flags: 64 });
  }

  const embed = new EmbedBuilder()
    .setColor(config.colors.info)
    .setAuthor({ name: 'سوق الانتقالات', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🗑️ إلغاء العرض')
    .setDescription(`اختر العرض الذي تريد إلغاءه\n${divider()}`)
    .setTimestamp();

  const selectRow = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('transfer_cancel_select')
        .setPlaceholder('اختر عرضاً')
        .addOptions(
          listings.map(l => ({
            label: `${l.itemData.name || 'Item'} - 🪙${l.price}`,
            value: l.listingId,
            description: 'اضغط للإلغاء'
          }))
        )
    );

  await interaction.update({ embeds: [embed], components: [selectRow] });
}

// ===================== DRAFT HANDLERS =====================

async function handleDraftMenu(interaction) {
  const draft = require('../systems/draft');
  const active = await draft.listActiveDrafts(interaction.guildId);

  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'نظام المسودة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🎯 نظام المسودة')
    .setDescription([
      'يتنافس اللاعبون لاختيار أفضل الشخصيات، ثم يتواجهون في مباراة مثيرة!',
      '',
      `${divider()}`,
      '',
      `🟢 المسودات النشطة: \`${active.length}\``,
      '',
      `${divider()}`
    ].join('\n'))
    .addFields(
      { name: '📋 كيف تعمل', value: '`1` إنشاء مسودة  `2` انضمام لاعبين  `3` اختيار الشخصيات  `4` مباراة', inline: false },
      { name: '👥 الأحجام', value: '`4`, `8`, `16` لاعباً', inline: true },
      { name: '🎁 المكافآت', value: 'نقاط خبرة + عملات للفريق الفائز', inline: true }
    )
    .setFooter({ text: '⚽ Blue Lock Ultimate', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  if (active.length > 0) {
    embed.addFields({
      name: '📌 Active Drafts',
      value: active.map(d =>
        `🔹 \`${d.draftId.slice(0, 12)}...\` — ${d.players.length}/${d.playerCount} players — ${d.status}`
      ).join('\n'),
      inline: false
    });
  }

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('draft_join').setLabel('📋 انضمام').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('draft_start').setLabel('🚀 إنشاء مسودة').setStyle(ButtonStyle.Success).setDisabled(active.length >= 3),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleDraftJoin(interaction) {
  const draft = require('../systems/draft');
  const active = await draft.listActiveDrafts(interaction.guildId);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  if (active.length === 0) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.danger)
    .setAuthor({ name: 'المسودة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('❌ لا توجد مسودات')
    .setDescription('لا توجد مسودات نشطة — قم بإنشاء واحدة!')
    .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('draft_start').setLabel('🚀 إنشاء مسودة').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('draft').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

    return interaction.update({ embeds: [embed], components: [row] });
  }

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'المسودة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('📋 انضمام لمسودة')
    .setDescription(`اختر مسودة للانضمام\n${divider()}`)
    .setTimestamp();

  const selectRow = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('draft_join_select')
        .setPlaceholder('اختر مسودة')
        .addOptions(
          active.map(d => ({
            label: `${d.players.length}/${d.playerCount} players`,
            value: d.draftId,
            description: `Status: ${d.status}`
          }))
        )
    );

  await interaction.update({ embeds: [embed], components: [selectRow] });
}

async function handleDraftStart(interaction) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player)     return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً', flags: 64 });

  if (player.coins < 500) {
    return interaction.reply({ content: '⚠️ تحتاج 500 عملة لإنشاء مسودة', flags: 64 });
  }

  const draft = require('../systems/draft');
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'المسودة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🚀 إنشاء مسودة جديدة')
    .setDescription(`التكلفة: \`500 عملة\`  •  اختر عدد اللاعبين\n${divider()}`)
    .setTimestamp();
  const selectRow = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('draft_create_size')
        .setPlaceholder('اختر عدد اللاعبين')
        .addOptions([
          { label: '👥 4 لاعبين', value: '4', description: 'مسودة سريعة' },
          { label: '👥 8 لاعبين', value: '8', description: 'مسودة متوسطة' },
          { label: '👥 16 لاعباً', value: '16', description: 'مسودة كبيرة' }
        ])
    );

  await interaction.update({ embeds: [embed], components: [selectRow] });
}

async function handleDraftPick(interaction) {
  const draft = require('../systems/draft');
  const { progressBar, divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

  const all = await draft.listActiveDrafts(interaction.guildId);
  const active = all.filter(d => d.status === 'picking');

  if (active.length === 0) {
    return interaction.reply({ content: '⚠️ لا توجد مسودات في مرحلة الاختيار', flags: 64 });
  }

  const userDraft = active.find(d => {
    const turn = d.turnOrder[d.currentPick];
    return turn && turn.userId === interaction.user.id;
  });

  if (!userDraft) {
    return interaction.reply({ content: '⏳ ليس دورك', flags: 64 });
  }

  const pct = ((userDraft.currentPick + 1) / userDraft.turnOrder.length) * 100;
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'اختيار المسودة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🎯 اختر شخصيتك')
    .setDescription(`دورك! اختر من \`${userDraft.availableChars.length}\` شخصية متبقية\n${divider()}`)
    .addFields(
      { name: '📊 التقدم', value: `${progressBar(pct, 100)} \`${userDraft.currentPick + 1}/${userDraft.turnOrder.length}\``, inline: true },
      { name: '📦 المتبقي', value: `\`${userDraft.availableChars.length}\``, inline: true }
    )
    .setFooter({ text: '⚽ اختر بحكمة!', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  const selectRow = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('draft_available_pick')
        .setPlaceholder('اختر شخصية')
        .addOptions(
          userDraft.availableChars.map((c, i) => ({
            label: `${c.name} (+${c.bonus} ${c.stat})`,
            value: `${userDraft.draftId}_${i}`,
            description: `Bonus: +${c.bonus} ${c.stat}`
          }))
        )
    );

  await interaction.update({ embeds: [embed], components: [selectRow] });
}

async function handleDraftSimulate(interaction) {
  const draft = require('../systems/draft');
  const all = await draft.listActiveDrafts(interaction.guildId);
  const active = all.filter(d => d.status === 'playing');

  if (active.length === 0) {
    return interaction.reply({ content: '⚠️ لا توجد مسودات في مرحلة اللعب', flags: 64 });
  }

  const result = await draft.simulateDraftMatch(active[0].draftId);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '🏆 نتيجة المسودة!' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🎯 مباراة المسودة')
    .setDescription(`${result.message}\n${divider()}`)
    .setFooter({ text: '⚽ Blue Lock Ultimate • Draft', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  if (result.result) {
    const r = result.result;
    embed.addFields(
      { name: `🔵 الفريق أ — \`${r.score.teamA}\``, value: `${(r.teamAPicks || []).map(p => p.name).join(', ') || 'N/A'}`, inline: true },
      { name: `🔴 الفريق ب — \`${r.score.teamB}\``, value: `${(r.teamBPicks || []).map(p => p.name).join(', ') || 'N/A'}`, inline: true },
      { name: '🔥 لحظات حاسمة', value: (r.events || []).slice(-5).map(e => `\`${e.time}'\` ${e.text}`).join('\n') || 'لا شيء', inline: false }
    );
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('draft').setLabel('🎯 قائمة المسودة').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ===================== CLUB WARS HANDLERS =====================

async function handleClubWars(interaction) {
  const wars = require('../systems/clubWars');
  const activeWars = await wars.getActiveWars(interaction.guildId);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'حروب العشائر', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('⚔️ حروب العشائر')
    .setDescription([
      'معارك أسبوعية بين العشائر — 5 مباريات لكل حرب',
      `${divider()}`
    ].join('\n'))
    .addFields(
      { name: '📋 ما هي حروب العشائر؟', value: 'واجه عشيرة أخرى في سلسلة من 5 مباريات كل أسبوع', inline: false },
      { name: '🏆 المكافآت', value: 'نقاط عشيرة، نقاط، وألقاب MVP', inline: false },
      { name: '⚔️ حروب نشطة', value: activeWars.length > 0 ? activeWars.map(w =>
        `🔹 ${w.clanA.name} vs ${w.clanB.name} — ${w.matches.filter(m => m.played).length}/${w.matches.length}`
      ).join('\n') : 'لا توجد حروب نشطة', inline: false }
    )
    .setFooter({ text: '⚽ Blue Lock Ultimate', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('club_wars_start').setLabel('⚔️ بدء الحرب').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('club_wars_status').setLabel('📊 حالة الحرب').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleClubWarsStart(interaction) {
  const Clan = require('../database/models/Clan');
  const clans = await Clan.find({ guildId: interaction.guildId }).sort({ points: -1 }).lean();
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

  if (clans.length < 2) {
    return interaction.reply({ content: '⚠️ تحتاج عشيرتين على الأقل لبدء حرب', flags: 64 });
  }

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'حروب العشائر', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('⚔️ بدء حرب عشائر')
    .setDescription(`اختر عشيرتين للمواجهة\n${divider()}`)
    .setTimestamp();

  const selectRow = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('club_wars_select')
        .setPlaceholder('اختر العشيرة أ')
        .addOptions(clans.slice(0, 25).map(c => ({
          label: `${c.name} (${c.members.length} members)`,
          value: `${c._id}`,
          description: `Level: ${c.level} | Points: ${c.points}`
        })))
    );

  await interaction.update({ embeds: [embed], components: [selectRow] });
}

async function handleClubWarsPlay(interaction) {
  const wars = require('../systems/clubWars');
  const active = wars.getActiveWars(interaction.guildId);

  if (active.length === 0) {
    return interaction.reply({ content: '⚠️ لا توجد حروب نشطة', flags: 64 });
  }

  const war = active[0];
  const unplayed = war.matches.findIndex(m => !m.played);

  if (unplayed === -1) {
    return interaction.reply({ content: '⚠️ تم لعب جميع المباريات', flags: 64 });
  }

  const result = await wars.playMatch(war.warId, unplayed);

  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: '⚔️ مباراة حرب العشائر', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('⚔️ مباراة حرب العشائر')
    .setDescription(`${result.message}\n${divider()}`)
    .setFooter({ text: '⚽ Blue Lock Ultimate', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  if (result.war) {
    embed.addFields(
      { name: `🔵 ${result.war.clanA.name}`, value: `Points: \`${result.war.clanA.points}\``, inline: true },
      { name: `🔴 ${result.war.clanB.name}`, value: `Points: \`${result.war.clanB.points}\``, inline: true }
    );
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('club_wars').setLabel('⚔️ حروب العشائر').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleClubWarsStatus(interaction) {
  const wars = require('../systems/clubWars');
  const active = wars.getActiveWars(interaction.guildId);
  const { progressBar, divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  if (active.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.danger)
      .setAuthor({ name: 'حروب العشائر', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('❌ لا توجد حروب')
      .setDescription('ابدأ حرباً جديدة!')
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('club_wars_start').setLabel('⚔️ بدء الحرب').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('club_wars').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

    return interaction.update({ embeds: [embed], components: [row] });
  }

  const war = active[0];
  const status = wars.getWarStatus(war.warId);

  const pct = (status.matchesPlayed / status.totalMatches) * 100;
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'حروب العشائر', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle(`⚔️ ${war.clanA.name} vs ${war.clanB.name}`)
    .setDescription([`Status: \`${status.status}\``, `Progress: ${progressBar(pct, 100)} \`${status.progress}\``, divider()].join('\n'))
    .addFields(
      {
        name: '📊 Matches',
        value: status.matches.map((m, i) =>
          `${m.played ? '✅' : '⬜'} Match ${i + 1}: ${m.played ? `\`${m.scoreA}-${m.scoreB}\` ${m.result === 'A' ? '🏆' : m.result === 'B' ? '🏆' : '🤝'}` : 'Pending'}`
        ).join('\n'),
        inline: false
      },
      { name: `🔵 ${status.clanA.name}`, value: `Points: \`${status.clanA.points}\`  •  Wins: \`${status.clanA.wins}\``, inline: true },
      { name: `🔴 ${status.clanB.name}`, value: `Points: \`${status.clanB.points}\`  •  Wins: \`${status.clanB.wins}\``, inline: true }
    )
    .setFooter({ text: '⚽ Blue Lock Ultimate', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  if (status.mvp) {
    embed.addFields({ name: '⭐ MVP', value: `<@${status.mvp}>`, inline: false });
  }

  const hasUnplayed = status.matches.some(m => !m.played);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('club_wars_play').setLabel('⚔️ المباراة التالية').setStyle(ButtonStyle.Danger).setDisabled(!hasUnplayed),
    new ButtonBuilder().setCustomId('club_wars').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ===================== BOOSTER HANDLERS =====================

async function handleBoostersMenu(interaction) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً', flags: 64 });

  const boosters = require('../systems/boosters');
  const active = await boosters.getActiveBoostersDisplay(player);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'المعززات', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('⚡ المعززات')
    .setDescription([`فعل المعززات لتعزيز أدائك`, divider()].join('\n'))
    .addFields(
      { name: '🏋️ معزز التدريب', value: '`×2` نقاط تدريب  •  🪙`1,000`  •  `24h`', inline: true },
      { name: '✨ معزز الخبرة', value: '`×2` XP  •  🪙`2,000`  •  `1h`', inline: true },
      { name: '🪙 معزز العملات', value: '`×2` عملات  •  🪙`3,000`  •  `1h`', inline: true },
      { name: '⚡ المعززات النشطة', value: active, inline: false }
    )
    .setFooter({ text: '⚽ Blue Lock Ultimate', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('booster_buy').setLabel('⚡ شراء معزز').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('booster_status').setLabel('📊 الحالة').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleBoosterBuy(interaction) {
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'المعززات', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('⚡ شراء معزز')
    .setDescription(`اختر المعزز الذي تريد شراءه\n${divider()}`)
    .setTimestamp();

  const selectRow = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('booster_select')
        .setPlaceholder('اختر معززاً')
        .addOptions([
          { label: '🏋️ معزز التدريب - 🪙1,000', value: 'training', description: '×2 نقاط تدريب (24h)' },
          { label: '✨ معزز الخبرة - 🪙2,000', value: 'xp', description: '×2 XP (1h)' },
          { label: '🪙 معزز العملات - 🪙3,000', value: 'coin', description: '×2 عملات (1h)' }
        ])
    );

  const backRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('boosters')
        .setLabel('◀️ رجوع')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

async function handleBoosterStatus(interaction) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return;

  const boosters = require('../systems/boosters');
  const status = await boosters.getBoosterStatus(player);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'حالة المعززات', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('📊 حالة المعززات');

  if (status.active.length === 0) {
    embed.setDescription(`لا توجد معززات نشطة\n${divider()}`);
  } else {
    embed.setDescription([`لديك \`${status.active.length}\` معزز نشط`, divider()].join('\n'));
    embed.addFields({
      name: '⚡ نشط',
      value: status.active.map(b => `🔹 **${b.name}** — \`×${b.multiplier}\`  •  ⏱ \`${b.remaining}m\``).join('\n'),
      inline: false
    });
  }
  embed.setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('boosters').setLabel('⚡ المعززات').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ===================== LOOT BOX HANDLERS =====================

async function handleOpenLootBoxWithAnimation(interaction) {
  const boxType = interaction.values[0];
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً', flags: 64 });

  const { getBoxPrice, getBoxRarity } = require('../ui/shopUI');
  const price = getBoxPrice(boxType);
  const rarity = getBoxRarity(boxType);

  if (player.coins < price) {
    return interaction.reply({ content: `⚠️ تحتاج 🪙${price} لفتح هذا الصندوق`, flags: 64 });
  }

  pendingBoxes.set(interaction.user.id, { boxType, price, rarity });

  const animation = require('../utils/lootBoxAnimation');
  await animation.showConfirm(interaction, boxType, player);
}

async function handleOpenBoxAnimation(interaction) {
  const { EmbedBuilder: EB2 } = require('discord.js');
  const pending = pendingBoxes.get(interaction.user.id);
  if (!pending) {
    return interaction.reply({ content: '⚠️ لم يتم اختيار صندوق بعد', flags: 64 });
  }

  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return;
  if (player.coins < pending.price) {
    return interaction.update({ content: '⚠️ رصيد غير كافٍ', embeds: [], components: [] });
  }

  // Must defer first since this is a fresh button interaction
  await interaction.deferUpdate();

  const animation = require('../utils/lootBoxAnimation');
  await animation.animateOpen(interaction, pending.boxType, player, async () => {
    const shop = require('../systems/shop');
    const result = await shop.buyLootBox(player, pending.boxType, pending.price, pending.rarity);
    pendingBoxes.delete(interaction.user.id);
    return result;
  });
}

// ===================== TRANSFER SELL =====================

async function handleTransferSellCard(interaction) {
  const cardId = interaction.values[0];
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return;

  const card = (player.cards || []).find(c => c.cardId.toString() === cardId);
  if (!card) return interaction.reply({ content: '⚠️ البطاقة غير موجودة', flags: 64 });

  const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
  const modal = new ModalBuilder()
    .setCustomId(`sell_${cardId}`)
    .setTitle('💰 تحديد سعر البيع');

  const priceInput = new TextInputBuilder()
    .setCustomId('sell_price')
    .setLabel('السعر (100 - 1,000,000)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('مثال: 5000')
    .setMinLength(3)
    .setMaxLength(7)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(priceInput));

  try {
    await interaction.showModal(modal);
  } catch (error) {
    console.error('Transfer sell modal error:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '⚠️ خطأ في فتح نموذج البيع. حاول مرة أخرى.', flags: 64 }).catch(e => console.error('followUp error:', e));
    } else {
      await interaction.reply({ content: '⚠️ خطأ في فتح نموذج البيع. حاول مرة أخرى.', flags: 64 }).catch(e => console.error('reply error:', e));
    }
    return;
  }

  const filter = (i) => i.customId === `sell_${cardId}` && i.user.id === interaction.user.id;
  const collected = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(() => null);
  if (!collected) return;

  const price = parseInt(collected.fields.getTextInputValue('sell_price'));
  if (isNaN(price) || price < 100 || price > 1000000) {
    return collected.reply({ content: '⚠️ يجب أن يكون السعر بين 100 و 1,000,000', flags: 64 });
  }

  const transfer = require('../systems/transferMarket');
  const result = await transfer.listItem(interaction.user.id, interaction.guildId, 'card', {
    cardId: card.cardId, name: card.name, rarity: card.rarity
  }, price);

  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder: ARB, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '✅ تم العرض!' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🔄 سوق الانتقالات')
    .setDescription(`${result.message}\n${divider()}`)
    .setTimestamp();

  const row = new ARB().addComponents(
    new ButtonBuilder().setCustomId('transfer_market').setLabel('🔄 السوق').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  await collected.reply({ embeds: [embed], components: [row], flags: 64 });
}

async function handleTransferCancelSelect(interaction, listingId) {
  const transfer = require('../systems/transferMarket');
  const result = await transfer.cancelListing(interaction.user.id, listingId);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '✅ تم الإلغاء' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🗑️ إلغاء العرض')
    .setDescription(`${result.message}\n${divider()}`)
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('transfer_market').setLabel('🔄 السوق').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ===================== DRAFT HANDLERS =====================

async function handleDraftCreateSize(interaction, size) {
  const draft = require('../systems/draft');
  const result = await draft.createDraft(interaction.guildId, interaction.channelId, interaction.user.id, size);

  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '✅ تم إنشاء المسودة!' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🎯 Draft')
    .setDescription(result.message)
    .setTimestamp();

  if (result.success) {
    const player = await require('../database/models/Player').findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (player) {
      player.coins -= 500;
      player.updatedAt = new Date();
      await player.save();
    }
  }

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('draft').setLabel('🎯 قائمة المسودة').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleDraftJoinSelect(interaction, draftId) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً', flags: 64 });

  const draft = require('../systems/draft');
  const result = await draft.joinDraft(draftId, interaction.user.id, player.name);

  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setTitle(result.success ? '✅ انضممت!' : '❌ فشل')
    .setDescription(`${result.message}\n${divider()}`);

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('draft').setLabel('🎯 قائمة المسودة').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ===================== BOOSTER HANDLERS =====================

async function handleBoosterSelect(interaction, type) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً', flags: 64 });

  const boosters = require('../systems/boosters');
  const result = await boosters.activateBooster(player, type);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '✅ تم تفعيل المعزز!' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('⚡ Booster')
    .setDescription(`${result.message}\n${divider()}`)
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('boosters').setLabel('⚡ المعززات').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ===================== CLUB WARS SELECT =====================

async function handleClubWarsSelect(interaction, value) {
  const pending = pendingWarFirst.get(interaction.user.id);
  const { divider } = require('../utils/embeds');
  if (!pending) {
    pendingWarFirst.set(interaction.user.id, value);
    const Clan = require('../database/models/Clan');
    const clans = await Clan.find({ guildId: interaction.guildId }).sort({ points: -1 }).lean();
    const filtered = clans.filter(c => c._id.toString() !== value);

    const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('⚔️ Select Second Clan')
      .setDescription(`Choose the opponent clan\n${divider()}`);

    const selectRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('club_wars_select')
          .setPlaceholder('Select clan B')
          .addOptions(filtered.slice(0, 25).map(c => ({
            label: `${c.name} (${c.members.length} members)`,
            value: `${c._id}`,
            description: `Level: ${c.level}`
          })))
      );

    return interaction.update({ embeds: [embed], components: [selectRow] });
  }

  const wars = require('../systems/clubWars');
  const result = await wars.startWar(interaction.guildId, pending, value);
  pendingWarFirst.delete(interaction.user.id);

  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '⚔️ بدأت الحرب!' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('⚔️ حرب العشائر')
    .setDescription(`${result.message}\n${divider()}`)
    .setFooter({ text: '⚽ Blue Lock Ultimate', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('club_wars')
        .setLabel('⚔️ Club Wars')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('main_menu_back')
        .setLabel('◀️ رجوع')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ===================== CHALLENGE PLAYER =====================

async function handleChallengePlayer(interaction) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً', flags: 64 });

  const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  // Find all players in the guild except the caller
  const players = await Player.find({
    guildId: interaction.guildId,
    userId: { $ne: interaction.user.id }
  }).sort({ level: -1 }).limit(25).lean();

  if (players.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.danger)
      .setAuthor({ name: 'التحدي', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('👥 تحدي لاعب')
      .setDescription('لا يوجد لاعبون آخرون في هذا السيرفر')
      .setTimestamp();
    const row = new ActionRowBuilder()
      .addComponents(new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary));
    return interaction.update({ embeds: [embed], components: [row] });
  }

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'التحدي', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('👥 اختر الخصم')
    .setDescription('اختر لاعباً لتتحداه')
    .setTimestamp();

  const selectRow = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('challenge_select')
        .setPlaceholder('اختر لاعباً')
        .addOptions(players.map(p => ({
          label: `${p.name} — OVR ${p.calculateOVR ? p.calculateOVR() : 50} | Lv.${p.level}`,
          value: p.userId,
          description: `${p.wins || 0} فوز | ${p.rank}`
        })))
    );

  const backRow = new ActionRowBuilder()
    .addComponents(new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary));

  await interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

// ===================== CHALLENGE SELECT MENU =====================

async function handleChallengeSelect(interaction, targetUserId) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  const target = await Player.findOne({ userId: targetUserId, guildId: interaction.guildId });
  if (!player || !target) return interaction.reply({ content: '⚠️ اللاعب غير موجود', flags: 64 });

  const matchmaking = require('../systems/matchmaking');
  const match = await matchmaking.quickMatch(player, target);

  // Save both players after match
  const xpGain = match.result === 'p1_win' ? config.match.winXP : match.result === 'p2_win' ? config.match.lossXP : config.match.drawXP;
  const coinGain = match.result === 'p1_win' ? config.match.winCoins : match.result === 'p2_win' ? config.match.lossCoins : config.match.drawCoins;
  const targetCoinGain = match.result === 'p2_win' ? config.match.winCoins : match.result === 'p1_win' ? config.match.lossCoins : config.match.drawCoins;
  const targetXpGain = match.result === 'p2_win' ? config.match.winXP : match.result === 'p1_win' ? config.match.lossXP : config.match.drawXP;
   player.coins += coinGain;
   target.coins += targetCoinGain;
   player.addXP(xpGain);
   target.addXP(targetXpGain);
   await player.save();
   await target.save();

   // Check for new achievements after match
   try {
     const achievementSystem = require('../systems/achievements');
     await achievementSystem.checkAndAwardAchievements(player);
     await achievementSystem.checkAndAwardAchievements(target);
   } catch (achievementError) {
     console.error('Error checking achievements after match:', achievementError);
   }

  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const isWin = match.result === 'p1_win';
  const isLoss = match.result === 'p2_win';
  const embed = new EmbedBuilder()
    .setColor(isWin ? config.colors.success : isLoss ? config.colors.danger : config.colors.info)
    .setAuthor({ name: isWin ? '🏆 فوز!' : isLoss ? '💔 خسارة' : '🤝 تعادل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('⚔️ نتيجة التحدي')
    .setDescription(`**${player.name}** 🆚 **${target.name}**\n${divider()}`)
    .addFields(
      { name: '📊 النتيجة', value: `\`${match.score.p1}\` - \`${match.score.p2}\``, inline: false },
      { name: `🔵 ${player.name}`, value: `\`${match.score.p1}\``, inline: true },
      { name: `🔴 ${target.name}`, value: `\`${match.score.p2}\``, inline: true }
    );

  if (isWin) {
    embed.setFooter({ text: `🏆 ${player.name} يفوز! +${xpGain} XP, +${coinGain} عملة`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' });
  } else if (isLoss) {
    embed.setFooter({ text: `🏆 ${target.name} يفوز!`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' });
  } else {
    embed.setFooter({ text: '🤝 تعادل!', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' });
  }
  embed.setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('play_match').setLabel('⚔️ العب مرة أخرى').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ===================== CLAN HANDLERS =====================

async function handleClanCreate(interaction) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً', flags: 64 });
  if (player.clanId) return interaction.reply({ content: '⚠️ أنت بالفعل في عشيرة', flags: 64 });

  const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder: ARB } = require('discord.js');
  const modal = new ModalBuilder()
    .setCustomId('create_clan_modal')
    .setTitle('🏰 إنشاء عشيرة جديدة');

  const nameInput = new TextInputBuilder()
    .setCustomId('clan_name')
    .setLabel('اسم العشيرة (2-20 حرف)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('أدخل اسم العشيرة...')
    .setMinLength(2).setMaxLength(20).setRequired(true);

  modal.addComponents(new ARB().addComponents(nameInput));
  try {
    await interaction.showModal(modal);
  } catch (error) {
    console.error('Clan create modal error:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '⚠️ خطأ في فتح نافذة إنشاء العشيرة. حاول مرة أخرى.', flags: 64 }).catch(e => console.error('followUp error:', e));
    } else {
      await interaction.reply({ content: '⚠️ خطأ في فتح نافذة إنشاء العشيرة. حاول مرة أخرى.', flags: 64 }).catch(e => console.error('reply error:', e));
    }
  }
}

async function handleClanCreateModal(interaction) {
  const name = interaction.fields.getTextInputValue('clan_name');
  const cm = require('../systems/clanManager');
  const result = await cm.createClan(name, interaction.user.id, interaction.guildId);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '✅ تم إنشاء العشيرة!' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🏰 إنشاء عشيرة')
    .setDescription(`${result.message}\n${divider()}`)
    .setTimestamp();

  if (result.success && result.clan) {
    embed.addFields(
      { name: '🏰 الاسم', value: result.clan.name, inline: true },
      { name: '👤 الأعضاء', value: `\`${result.clan.members.length}\``, inline: true },
      { name: '👑 القائد', value: `<@${result.clan.leaderId}>`, inline: true }
    );
  }

  const row = new ActionRowBuilder()
    .addComponents(new ButtonBuilder().setCustomId('clan_menu').setLabel('🏰 قائمة العشيرة').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary));
  await interaction.reply({ embeds: [embed], components: [row] });
}

async function handleTournamentCreateModal(interaction) {
  const name = interaction.fields.getTextInputValue('tournament_name') || 'Unnamed';
  const entryFee = parseInt(interaction.fields.getTextInputValue('entry_fee')) || 500;
  const maxTeams = parseInt(interaction.fields.getTextInputValue('max_teams')) || 8;
  const { ClanTournamentSystem } = require('../systems/clanSystems');
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player || !player.clanId) return interaction.reply({ content: '⚠️ لست في عشيرة', flags: 64 });
  const result = await ClanTournamentSystem.createTournament(interaction.guildId, player.clanId, entryFee, maxTeams);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '🏆 تم إنشاء البطولة!' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle(result.success ? '🎯 تم إنشاء البطولة' : '❌ خطأ')
    .setDescription(`${result.message}\n${divider()}`)
    .setTimestamp();
  if (result.success) {
    embed.addFields(
      { name: '📛 Name', value: `\`${name}\``, inline: true },
      { name: '💵 Entry Fee', value: `🪙${entryFee}`, inline: true },
      { name: '👥 Teams', value: `\`${maxTeams}\``, inline: true }
    );
  }
  await interaction.reply({ embeds: [embed], components: [] });
}

async function handleClanJoin(interaction) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً', flags: 64 });
  if (player.clanId) return interaction.reply({ content: '⚠️ أنت بالفعل في عشيرة', flags: 64 });

  const cm = require('../systems/clanManager');
  const clans = await cm.listJoinableClans(interaction.guildId);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  if (clans.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.danger)
      .setAuthor({ name: 'العشيرة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('❌ لا توجد عشائر')
      .setDescription('لم يتم إنشاء أي عشائر بعد')
      .setTimestamp();
    const row = new ActionRowBuilder()
      .addComponents(new ButtonBuilder().setCustomId('clan_menu').setLabel('◀️ رجوع').setStyle(ButtonStyle.Secondary));
    return interaction.update({ embeds: [embed], components: [row] });
  }

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'العشيرة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('📋 انضمام لعشيرة')
    .setDescription(`اختر العشيرة التي تريد الانضمام إليها\n${divider()}`)
    .setTimestamp();

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('clan_join_select')
      .setPlaceholder('اختر عشيرة')
      .addOptions(clans.slice(0, 25).map(c => ({
        label: `${c.name} — Lv.${c.level} (${c.members.length})`,
        value: c._id.toString(),
        description: `Points: ${c.points}`
      })))
  );

  await interaction.update({ embeds: [embed], components: [selectRow] });
}

async function handleClanLeaderboard(interaction) {
  const cm = require('../systems/clanManager');
  const display = await cm.getLeaderboard(interaction.guildId);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'ترتيب العشائر', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🏆 ترتيب العشائر')
    .setDescription(`${display}\n${divider()}`)
    .setFooter({ text: '⚽ Blue Lock Ultimate', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(new ButtonBuilder().setCustomId('clan_menu').setLabel('🏰 قائمة العشيرة').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary));

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleClanLeave(interaction) {
  const cm = require('../systems/clanManager');
  const result = await cm.leaveClan(interaction.user.id, interaction.guildId);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '✅ تم' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🏰 العشيرة')
    .setDescription(`${result.message}\n${divider()}`)
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(new ButtonBuilder().setCustomId('clan_menu').setLabel('🏰 قائمة العشيرة').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary));

  await interaction.update({ embeds: [embed], components: [row] });
}

// ===================== LEAGUE HANDLERS =====================

async function handleLeagueOverview(interaction) {
  const { createLeaguesOverview } = require('../ui/clanLeaguesUI');
  const result = createLeaguesOverview(interaction.guildId);
  await interaction.update(result);
}

async function handleLeagueCreate(interaction) {
  const clanLeagues = require('../systems/clanLeagues');
  const season = await clanLeagues.getOrCreateSeason(interaction.guildId);
  const { createLeaguesOverview } = require('../ui/clanLeaguesUI');

  if (!season.success) {
    const { EmbedBuilder } = require('discord.js');
    return interaction.reply({ content: `⚠️ ${season.message}`, flags: 64 });
  }

  const result = createLeaguesOverview(interaction.guildId);
  await interaction.update(result);
}

async function handleLeagueStandings(interaction) {
  const { createAllStandingsEmbed } = require('../ui/clanLeaguesUI');
  const result = createAllStandingsEmbed(interaction.guildId);
  await interaction.update(result);
}

async function handleLeagueRound(interaction) {
  const clanLeagues = require('../systems/clanLeagues');
  const season = clanLeagues.getActiveSeason(interaction.guildId);
  if (!season) {
    return interaction.reply({ content: '⚠️ لا يوجد موسم نشط', flags: 64 });
  }

  const divisions = Object.keys(season.divisions);
  let result = null;

  for (const divName of divisions) {
    result = await clanLeagues.playRound(interaction.guildId, divName);
    if (result.success) break;
  }

  if (!result || !result.success) {
    return interaction.reply({ content: '⚠️ لم يتم لعب أي جولة جديدة', flags: 64 });
  }

  const { createDivisionEmbed } = require('../ui/clanLeaguesUI');
  const msg = `⚔️ تم لعب الجولة ${result.round} في ${result.fixtures.length} مباريات`;
  const embedResult = createDivisionEmbed(interaction.guildId, divisions[0]);
  if (embedResult.embeds) {
    embedResult.embeds[0].setDescription(`${msg}\n\n${embedResult.embeds[0].data.description || ''}`);
  }
  await interaction.update(embedResult);
}

// ===================== STORY MODE HANDLERS =====================

async function handleStoryMenu(interaction) {
  const PlayerMod = require('../database/models/Player');
  const { createMainStoryEmbed } = require('../ui/storyUI');
  const { createPartSelectEmbed } = require('../ui/storyUI');

  const player = await PlayerMod.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ استخدم /start أولاً', flags: 64 });

  const mainEmbed = createMainStoryEmbed(player);
  const partSelect = createPartSelectEmbed();
  await interaction.update({ embeds: [...mainEmbed.embeds, ...partSelect.embeds], components: partSelect.components });
}

async function handleStoryPlay(interaction, chapterId) {
  const PlayerMod = require('../database/models/Player');
  const storyMode = require('../systems/storyMode');
  const { createChapterInfoEmbed, createMatchResultEmbed, createStoryButtons } = require('../ui/storyUI');

  const player = await PlayerMod.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ استخدم /start أولاً', flags: 64 });

  const chapter = storyMode.getChapter(chapterId);
  if (!chapter) return interaction.reply({ content: '⚠️ المرحلة غير موجودة', flags: 64 });

  const check = storyMode.canPlayChapter(player, chapter);
  if (!check.success) {
    return interaction.reply({ content: check.message, flags: 64 });
  }

  await interaction.deferUpdate();

  const result = await storyMode.playChapter(player, chapter);
  if (!result.success) {
    return interaction.editReply({ content: result.message || '❌ حدث خطأ', components: [], embeds: [] });
  }

  const resultEmbed = createMatchResultEmbed(result);
  const completed = (player.storyProgress?.completedChapters || []).includes(chapter.id);
  const buttons = createStoryButtons(chapterId, completed, result.isWin);

  await interaction.editReply({ embeds: resultEmbed.embeds, components: buttons });
}

async function handleStoryPartSelect(interaction, partId) {
  const PlayerMod = require('../database/models/Player');
  const { createPartChaptersEmbed, createChapterInfoEmbed } = require('../ui/storyUI');
  const storyMode = require('../systems/storyMode');

  const player = await PlayerMod.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) {
    return interaction.reply({ content: '⚠️ استخدم /start أولاً', flags: 64 });
  }

  const partChapters = createPartChaptersEmbed(player, partId);

  // Get first chapter of this part for info
  const allChapters = storyMode.getAllChapters();
  const firstChapter = allChapters.find(c => c.partId === partId);
  const chapterInfo = firstChapter ? createChapterInfoEmbed(player, firstChapter) : null;

  await interaction.update({
    embeds: chapterInfo ? [...partChapters.embeds, ...chapterInfo.embeds] : partChapters.embeds,
    components: []
  });
}

async function handleStoryChapterSelect(interaction, chapterId) {
  const PlayerMod = require('../database/models/Player');
  const storyMode = require('../systems/storyMode');
  const { createChapterInfoEmbed, createStoryButtons } = require('../ui/storyUI');

  const player = await PlayerMod.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) {
    return interaction.reply({ content: '⚠️ استخدم /start أولاً', flags: 64 });
  }

  const chapter = storyMode.getChapter(chapterId);
  if (!chapter) {
    return interaction.reply({ content: '⚠️ المرحلة غير موجودة', flags: 64 });
  }

  const infoEmbed = createChapterInfoEmbed(player, chapter);
  const completed = (player.storyProgress?.completedChapters || []).includes(chapter.id);
  const buttons = createStoryButtons(chapterId, completed);

  await interaction.update({
    embeds: infoEmbed.embeds,
    components: buttons
  });
}

async function handleStoryNextChapter(interaction) {
  const PlayerMod = require('../database/models/Player');
  const storyMode = require('../systems/storyMode');
  const { createChapterInfoEmbed, createStoryButtons } = require('../ui/storyUI');

  const player = await PlayerMod.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ استخدم /start أولاً', flags: 64 });

  const nextChapter = storyMode.getNextChapter(player);
  if (!nextChapter) {
    return interaction.reply({ content: '🎉 لقد أكملت جميع المراحل! انتظر التحديثات القادمة', flags: 64 });
  }

  const infoEmbed = createChapterInfoEmbed(player, nextChapter);
  const completed = (player.storyProgress?.completedChapters || []).includes(nextChapter.id);
  const buttons = createStoryButtons(nextChapter.id, completed);

  await interaction.update({ embeds: infoEmbed.embeds, components: buttons });
}

// ===================== TOURNAMENT HANDLERS =====================

async function handleTournamentMenu(interaction) {
  const tm = require('../systems/tournamentManager');
  const active = await tm.listActive(interaction.guildId);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'البطولة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🏆 البطولة')
    .setDescription([`نظام البطولات التنافسية`, divider()].join('\n'))
    .addFields(
      { name: '📋 كيف تعمل', value: '`1` إنشاء بطولة  `2` انضمام لاعبين  `3` لعب مباريات  `4` الفائز يأخذ كل شيء', inline: false },
      { name: '👥 الأحجام', value: '`8` لاعبين (🪙`2,000`)\n`16` لاعباً (🪙`5,000`)\n`32` لاعباً (🪙`15,000`)\n`64` لاعباً (🪙`50,000`)', inline: true },
      { name: '🏆 المكافآت', value: 'جوائز ضخمة للفائز + ألقاب حصرية', inline: true }
    )
    .setFooter({ text: '⚽ Blue Lock Ultimate', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  if (active.length > 0) {
    embed.addFields({
      name: '📌 Active Tournaments',
      value: active.map(t => `🔹 \`${t.type}\` players — ${t.players.length}/${t.type} — ${t.status === 'registering' ? '🟢 Registering' : '🔴 In Progress'}`).join('\n'),
      inline: false
    });
  }

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('tournament_create').setLabel('🏆 إنشاء بطولة').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('tournament_join').setLabel('📋 انضمام').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('tournament_bracket').setLabel('📊 القوس').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleTournamentCreate(interaction) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً', flags: 64 });

  const { divider } = require('../utils/embeds');
  const { StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder } = require('discord.js');

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'البطولة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🏆 إنشاء بطولة')
    .setDescription(`اختر حجم البطولة\n${divider()}`)
    .setTimestamp();

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('tournament_size_select')
      .setPlaceholder('اختر الحجم')
      .addOptions([
        { label: '👥 8 لاعبين - 🪙2,000', value: '8', description: 'بطولة صغيرة' },
        { label: '👥 16 لاعباً - 🪙5,000', value: '16', description: 'بطولة متوسطة' },
        { label: '👥 32 لاعباً - 🪙15,000', value: '32', description: 'بطولة كبيرة' },
        { label: '👥 64 لاعباً - 🪙50,000', value: '64', description: 'بطولة ضخمة' }
      ])
  );

  await interaction.update({ embeds: [embed], components: [selectRow] });
}

async function handleTournamentJoin(interaction) {
  const tm = require('../systems/tournamentManager');
  const active = await tm.listActive(interaction.guildId);
  const registering = active.filter(t => t.status === 'registering');
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  if (registering.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.danger)
      .setAuthor({ name: 'البطولة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('❌ لا توجد بطولات')
      .setDescription('لا توجد بطولات مفتوحة للتسجيل')
      .setTimestamp();
    const row = new ActionRowBuilder()
      .addComponents(new ButtonBuilder().setCustomId('tournament').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary));
    return interaction.update({ embeds: [embed], components: [row] });
  }

  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'البطولة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('📋 انضمام لبطولة')
    .setDescription(`اختر بطولة للانضمام\n${divider()}`)
    .setTimestamp();

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('tournament_join_select')
      .setPlaceholder('اختر بطولة')
      .addOptions(registering.map(t => ({
        label: `🏆 ${t.type} players (${t.players.length}/${t.type})`,
        value: t._id.toString(),
        description: `Fee: 🪙${({ '8': 2000, '16': 5000, '32': 15000, '64': 50000 })[t.type] || 0}`
      })))
  );

  await interaction.update({ embeds: [embed], components: [selectRow] });
}

async function handleTournamentBracket(interaction) {
  const tm = require('../systems/tournamentManager');
  const active = await tm.listActive(interaction.guildId);
  const inProgress = active.find(t => t.status === 'in_progress') || active.find(t => t.status === 'registering');
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  if (!inProgress) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.danger)
      .setAuthor({ name: 'البطولة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
      .setTitle('❌ لا توجد بطولات')
      .setDescription('لا توجد بطولات نشطة')
      .setTimestamp();
    const row = new ActionRowBuilder()
      .addComponents(new ButtonBuilder().setCustomId('tournament').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary));
    return interaction.update({ embeds: [embed], components: [row] });
  }

  const statusStr = inProgress.status === 'registering' ? '🟢 تسجيل مفتوح' : '🔴 قيد التنفيذ';
  const embed = new EmbedBuilder()
    .setColor(config.colors.blueLock)
    .setAuthor({ name: 'قوس البطولة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle(`🏆 ${inProgress.type} Players`)
    .setDescription([`Status: **${statusStr}**  •  Players: \`${inProgress.players.length}/${inProgress.type}\``, divider()].join('\n'))
    .setFooter({ text: '⚽ Blue Lock Ultimate', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  if (inProgress.bracket && inProgress.bracket.length > 0) {
    const rounds = [...new Set(inProgress.bracket.map(m => m.round))];
    for (const round of rounds) {
      const matches = inProgress.bracket.filter(m => m.round === round);
      const matchText = matches.map(m =>
        `${m.played ? '✅' : '⬜'} ${m.player1?.name || '???'} vs ${m.player2?.name || '???'}${m.played ? ` \`${m.player1?.score || 0}-${m.player2?.score || 0}\`` : ''}`
      ).join('\n');
      embed.addFields({ name: `📌 Round ${round + 1}`, value: matchText, inline: false });
    }
  } else {
    embed.addFields({ name: '📋 Players', value: inProgress.players.map(p => `🔹 ${p.name}`).join('\n') || 'None', inline: false });
  }

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('tournament_simulate').setLabel('⚔️ العب مباراة').setStyle(ButtonStyle.Danger)
        .setDisabled(inProgress.status !== 'in_progress'),
      new ButtonBuilder().setCustomId('tournament').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleTournamentSimulate(interaction) {
  const tm = require('../systems/tournamentManager');
  const active = await tm.listActive(interaction.guildId);
  const t = active.find(t => t.status === 'in_progress');
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  if (!t) {
    return interaction.reply({ content: '⚠️ لا توجد بطولة نشطة', flags: 64 });
  }

  const unplayed = t.bracket.findIndex(m => !m.played && (m.player1 || m.player2));
  if (unplayed === -1) {
    return interaction.reply({ content: '⚠️ تم لعب جميع المباريات', flags: 64 });
  }

  const result = await tm.simulateMatch(t._id.toString(), unplayed);

  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.tournament?.status === 'completed' ? '🏆 اكتملت البطولة!' : '⚔️ مباراة البطولة', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('⚔️ مباراة البطولة')
    .setDescription(`${result.message}\n${divider()}`);

  if (result.tournament?.status === 'completed') {
    embed.addFields({
      name: '🏆 البطل',
      value: `👑 **${result.tournament.winner?.name || '???'}**`,
      inline: false
    });
    embed.addFields({
      name: '🎁 الجائزة',
      value: `🪙 \`+${result.tournament.prize?.coins || 0}\`  •  💎 \`+${result.tournament.prize?.gems || 0}\``,
      inline: false
    });
  }
  embed.setFooter({ text: '⚽ Blue Lock Ultimate • Tournament', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('tournament_bracket').setLabel('📊 القوس').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('tournament').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ===== TOURNAMENT / CLAN SELECT MENUS =====

async function handleTournamentSizeSelect(interaction, value) {
  const Player = require('../database/models/Player');
  const player = await Player.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
  if (!player) return interaction.reply({ content: '⚠️ يجب إنشاء لاعب أولاً', flags: 64 });

  const type = value;
  const entryFees = { '8': 2000, '16': 5000, '32': 15000, '64': 50000 };
  if (player.coins < entryFees[type]) {
    return interaction.reply({ content: `⚠️ تحتاج ${entryFees[type]} عملة`, flags: 64 });
  }

  const tm = require('../systems/tournamentManager');
  const result = await tm.createTournament(interaction.guildId, interaction.channelId, interaction.user.id, type);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '✅ تم إنشاء البطولة!' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🏆 البطولة')
    .setDescription(`${result.message}\n${divider()}`)
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('tournament').setLabel('🏆 البطولة').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleTournamentJoinSelect(interaction, value) {
  const tm = require('../systems/tournamentManager');
  const result = await tm.joinTournament(value, interaction.user.id, interaction.guildId);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '✅ تم الانضمام!' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🏆 البطولة')
    .setDescription(`${result.message}\n${divider()}`)
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('tournament').setLabel('🏆 البطولة').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleClanJoinSelect(interaction, value) {
  const cm = require('../systems/clanManager');
  const result = await cm.joinClan(value, interaction.user.id, interaction.guildId);
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(result.success ? config.colors.success : config.colors.danger)
    .setAuthor({ name: result.success ? '✅ تم الانضمام!' : '❌ فشل', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🏰 العشيرة')
    .setDescription(`${result.message}\n${divider()}`)
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('clan_menu').setLabel('🏰 قائمة العشيرة').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('main_menu_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ===================== ADMIN MODAL HANDLERS =====================

async function handleAdminSearchPlayer(interaction) {
  const name = interaction.fields.getTextInputValue('player_name');
  const Player = require('../database/models/Player');
  const players = await Player.find({ guildId: interaction.guildId, name: { $regex: name, $options: 'i' } });
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.info)
    .setAuthor({ name: 'المشرف', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('🔍 نتائج البحث')
    .setDescription(players.length > 0
      ? players.map((p, i) => `\`${i + 1}.\` **${p.name}**  •  مستوى \`${p.level}\`  •  🪙\`${p.coins}\`\n${divider()}`).join('')
      : `لا يوجد لاعبون بهذا الاسم\n${divider()}`
    )
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('admin_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
}

async function handleAdminAddXP(interaction) {
  const name = interaction.fields.getTextInputValue('player_name');
  const amount = parseInt(interaction.fields.getTextInputValue('xp_amount'));
  const Player = require('../database/models/Player');

  if (isNaN(amount) || amount < 1) {
    return interaction.reply({ content: '⚠️ أدخل كمية XP صالحة (أكبر من 0)', flags: 64 });
  }

  const player = await Player.findOne({ guildId: interaction.guildId, name: { $regex: `^${name}$`, $options: 'i' } });
  if (!player) {
    return interaction.reply({ content: `⚠️ لا يوجد لاعب اسمه **${name}**`, flags: 64 });
  }

  player.addXP(amount);
  await player.save();
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.success)
    .setAuthor({ name: 'المشرف', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('✅ تمت إضافة XP')
    .setDescription([`\`+${amount} XP\` تمت إضافتها إلى **${player.name}**`, `المستوى: \`${player.level}\``, divider()].join('\n'))
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('admin_players').setLabel('👥 اللاعبين').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('admin_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
}

async function handleAdminAddCoins(interaction) {
  const name = interaction.fields.getTextInputValue('player_name');
  const amount = parseInt(interaction.fields.getTextInputValue('coins_amount'));
  const Player = require('../database/models/Player');

  if (isNaN(amount) || amount < 1) {
    return interaction.reply({ content: '⚠️ أدخل كمية عملات صالحة (أكبر من 0)', flags: 64 });
  }

  const player = await Player.findOne({ guildId: interaction.guildId, name: { $regex: `^${name}$`, $options: 'i' } });
  if (!player) {
    return interaction.reply({ content: `⚠️ لا يوجد لاعب اسمه **${name}**`, flags: 64 });
  }

  player.coins += amount;
  await player.save();
  const { divider } = require('../utils/embeds');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.success)
    .setAuthor({ name: 'المشرف', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png' })
    .setTitle('✅ تمت إضافة العملات')
    .setDescription([`\`+${amount}\` عملة تمت إضافتها إلى **${player.name}**`, `الرصيد: 🪙\`${player.coins}\``, divider()].join('\n'))
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('admin_players').setLabel('👥 اللاعبين').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('admin_back').setLabel('◀️ Back').setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
}

// ===================== UTILITY =====================

function _getCardPrice(rarity) {
  const prices = { Common: 100, Rare: 300, Epic: 1000, Legendary: 5000, Mythic: 20000, Divine: 100000 };
  return prices[rarity] || 100;
}
