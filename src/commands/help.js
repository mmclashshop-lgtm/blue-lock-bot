const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('عرض دليل المساعدة والأوامر')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('اختر موضوعاً للمساعدة')
        .addChoices(
          { name: 'ابدأ هنا', value: 'start' },
          { name: 'الأوامر', value: 'commands' },
          { name: 'أنظمة اللعبة', value: 'systems' },
          { name: 'الشخصيات', value: 'characters' },
          { name: 'التصنيف', value: 'rankings' },
          { name: 'الفرق', value: 'teams' },
          { name: 'المتجر', value: 'shop' },
          { name: 'الأسئلة الشائعة', value: 'faq' }
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const topic = interaction.options.getString('topic');

      if (!topic) {
        return this.showMainHelp(interaction);
      }

      switch (topic) {
        case 'start':
          return this.showGettingStarted(interaction);
        case 'commands':
          return this.showCommands(interaction);
        case 'systems':
          return this.showGameSystems(interaction);
        case 'characters':
          return this.showCharacters(interaction);
        case 'rankings':
          return this.showRankings(interaction);
        case 'teams':
          return this.showTeams(interaction);
        case 'shop':
          return this.showShop(interaction);
        case 'faq':
          return this.showFAQ(interaction);
        default:
          return this.showMainHelp(interaction);
      }
    } catch (error) {
      console.error('Help command error:', error);
      await interaction.reply({
        content: '❌ حدث خطأ في عرض المساعدة.',
        flags: 64
      });
    }
  },

  async showMainHelp(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('📚 دليل Blue Lock Ultimate')
      .setDescription('مرحباً بك في Blue Lock Ultimate! 🎮\n\n اختر من القائمة أدناه للحصول على معلومات أكثر تفصيلاً.')
      .addFields(
        { name: '🎯 **ابدأ هنا**', value: 'تعرف على كيفية بدء اللعبة وإنشاء لاعبك الأول', inline: false },
        { name: '📋 **الأوامر الأساسية**', value: 'تعرف على جميع الأوامر المتاحة', inline: false },
        { name: '⚙️ **أنظمة اللعبة**', value: 'اكتشف جميع الأنظمة المتاحة في اللعبة', inline: false },
        { name: '⭐ **الشخصيات**', value: 'تعرف على جميع الشخصيات المتاحة', inline: false },
        { name: '🏆 **التصنيفات**', value: 'تعرف على نظام الرتب والتصنيفات', inline: false },
        { name: '👥 **الفرق**', value: 'تعرف على نظام الفرق وحروب الفرق', inline: false },
        { name: '🛒 **المتجر**', value: 'تسوق الشخصيات والعناصر', inline: false },
        { name: '❓ **الأسئلة الشائعة**', value: 'الإجابة على الأسئلة الشائعة', inline: false }
      )
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/6/6b/Blue_Lock_Logo.png')
      .setFooter({ text: '⚽ Blue Lock Ultimate • استخدم /help [موضوع] للمزيد من المعلومات' })
      .setTimestamp();

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('help_start')
          .setLabel('🎯 ابدأ هنا')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('help_commands')
          .setLabel('📋 الأوامر')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('help_systems')
          .setLabel('⚙️ الأنظمة')
          .setStyle(ButtonStyle.Primary)
      );

    const buttons2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('help_characters')
          .setLabel('⭐ الشخصيات')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('help_rankings')
          .setLabel('🏆 التصنيفات')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('help_teams')
          .setLabel('👥 الفرق')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({
      embeds: [embed],
      components: [buttons, buttons2],
      ephemeral: false
    });
  },

  async showGettingStarted(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('🎯 ابدأ هنا')
      .setDescription('خطوات بدء اللعبة')
      .addFields(
        { 
          name: '**الخطوة 1: إنشاء حسابك**', 
          value: 'استخدم `/ابدأ` لإنشاء لاعبك الأول\n' +
                 '• اختر اسماً للاعب\n' +
                 '• اختر مركزك (مهاجم، وسط، جناح، إلخ)\n' +
                 '• اختر أسلوب لعبك\n' +
                 '• اختر شخصيتك المفضلة',
          inline: false 
        },
        { 
          name: '**الخطوة 2: فهم الإحصائيات**', 
          value: '📊 **التسديق**: دقة تسديقاتك\n' +
                 '🎯 **المراوغة**: القدرة على تجاوز المدافعين\n' +
                 '🎪 **التمرير**: دقة تمريراتك\n' +
                 '👁️ **الرؤية**: قراءتك للعبة\n' +
                 '⚡ **السرعة**: سرعتك في الملعب\n' +
                 '🛡️ **الدفاع**: قدرتك الدفاعية\n' +
                 '💨 **اللياقة**: قدرتك على التحمل\n' +
                 '🎯 **الإنهاء**: جودة أهدافك\n' +
                 '🎮 **التحكم**: التحكم بالكرة\n' +
                 '🔄 **رد الفعل**: سرعة ردود أفعالك',
          inline: false 
        },
        { 
          name: '**الخطوة 3: لعب المباريات**', 
          value: 'اذهب إلى `/القائمة` واختر `⚽ لعب مباراة`\n' +
                 '• ستلعب ضد خصم مناسب\n' +
                 '• اكسب XP والعملات من كل مباراة\n' +
                 '• اصعد في الرتب',
          inline: false 
        },
        { 
          name: '**الخطوة 4: التطور**', 
          value: '🏋️ **التدريب**: ادرّب إحصائياتك\n' +
                 '🎯 **المهام**: اكمل المهام اليومية والأسبوعية\n' +
                 '🛒 **المتجر**: اشتري شخصيات وعناصر جديدة\n' +
                 '👥 **الفريق**: انضم إلى فريق وتنافس مع فرق أخرى',
          inline: false 
        }
      )
      .setFooter({ text: '⚽ Blue Lock Ultimate • استخدم /help للرجوع' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },

  async showCommands(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('الأوامر')
      .setDescription('جميع الأوامر المتاحة')
      .addFields(
        {
          name: '**أساسي**',
          value: '`/start` - إنشاء لاعب\n' +
                 '`/menu` - القائمة الرئيسية\n' +
                 '`/profile` - عرض البروفايل\n' +
                 '`/help` - هذه الرسالة\n' +
                 '`/admin` - لوحة المشرف',
          inline: false
        },
        {
          name: '**الاقتصاد**',
          value: '`/coins` - رصيد العملات\n' +
                 '`/daily` - المكافأة اليومية\n' +
                 '`/sell` - بيع البطاقات\n' +
                 '`/pack` - فتح الباكات',
          inline: false
        },
        {
          name: '**المجموعة**',
          value: '`/inventory` - المخزون\n' +
                 '`/cards` - عرض البطاقات\n' +
                 '`/player` - معلومات اللاعب\n' +
                 '`/fusion` - دمج بطاقتين',
          inline: false
        },
        {
          name: '**PvP**',
          value: '`/matchmaking` - الانضمام للطابور\n' +
                 '`/trade` - التجارة',
          inline: false
        },
        {
          name: '**اجتماعي**',
          value: '`/gift` - إرسال ردود فعل\n' +
                 '`/clan` - أوامر العشيرة',
          inline: false
        }
      )
      .setFooter({ text: '⚽ Blue Lock Ultimate • استخدم /help [موضوع]' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },

  async showGameSystems(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('⚙️ أنظمة اللعبة')
      .setDescription('شرح شامل لأنظمة اللعبة')
      .addFields(
        { name: '🎮 **نظام المستويات والخبرة**', value: 'اكسب XP من المباريات والتدريبات. كل مستوى يتطلب خبرة أكثر.', inline: false },
        { name: '⚽ **نظام المباريات**', value: 'لعب مباريات ضد لاعبين آخرين. الفوز يعتمد على إحصائياتك والمهارات.', inline: false },
        { name: '🏋️ **نظام التدريب**', value: 'ادرب إحصائياتك المختلفة لتحسين أدائك في المباريات.', inline: false },
        { name: '🎯 **نظام المهام**', value: 'أكمل مهام يومية وأسبوعية وشهرية للحصول على مكافآت.', inline: false },
        { name: '🏆 **نظام الرتب**', value: 'ابدأ من البرونزي وحتى ملك الأنانيين. اكسب نقاط الترقية من المباريات.', inline: false },
        { name: '👥 **نظام الفرق**', value: 'أنشئ أو انضم إلى فريق. شارك في حروب الفرق الأسبوعية.', inline: false },
        { name: '🎴 **نظام المجموعات**', value: 'اجمع بطاقات نادرة وأسطورية من خلال الصناديق والمتجر.', inline: false },
        { name: '🛒 **نظام المتجر**', value: 'اشتري شخصيات وعناصر وعناصر كوزمتيكية بالعملات أو الجواهر.', inline: false }
      )
      .setFooter({ text: '⚽ Blue Lock Ultimate • استخدم /help للرجوع' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },

  async showCharacters(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('⭐ الشخصيات المتاحة')
      .setDescription('جميع شخصيات Blue Lock المتاحة')
      .addFields(
        { name: '⭐ **إيساغي يويتشي** - الضالعة المتوازنة', value: 'مهاجم متوازن خبير في تحليل اللعبة. رؤية عالية جداً.', inline: false },
        { name: '⭐ **رين إيتوشي** - العبقري التقني', value: 'تقني ممتاز بتحكم ودقة لا تضاهى في التسديق.', inline: false },
        { name: '⭐ **باشيرا ميجورو** - البطاقة البرية', value: 'سرعة وإبداع لا محدود. متخصص في المراوغة والسرعة.', inline: false },
        { name: '⭐ **ناجي سيشيرو** - خبير الدقة', value: 'دقة حسابية. إحصائيات التمرير والتحكم عالية جداً.', inline: false },
        { name: '⭐ **كايزر مايكل** - الشامل الأسطوري', value: 'متكامل في كل شيء. الأفضل في جميع الإحصائيات (نادر جداً).', inline: false },
        { name: '⭐ **شيدو رويسي** - المفترس العدواني', value: 'هجوم شرس. متخصص في التسديق والإنهاء.', inline: false },
        { name: '⭐ **تشيجيري هيوما** - ملك السرعة', value: 'أسرع شخصية. متخصص في السرعة والمراوغة.', inline: false },
        { name: '⭐ **ريو ميكاغي** - صانع اللعب', value: 'صانع أهداف. متخصص في التمرير والرؤية.', inline: false },
        { name: '⭐ **ساي إيوشي** - المخطط الاستراتيجي', value: 'دماغ تكتيكي. متخصص في الدفاع والرؤية.', inline: false },
        { name: '⭐ **بارو شوي** - القوة الخام', value: 'قوة غاشمة. متخصص في السيطرة والتسديق.', inline: false }
      )
      .setFooter({ text: '⚽ Blue Lock Ultimate • استخدم /help للرجوع' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },

  async showRankings(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('🏆 نظام الرتب')
      .setDescription('تسلق السلم من البرونزي إلى ملك الأنانيين')
      .addFields(
        { name: '🥉 **1️⃣ برونزي**', value: 'المستوى الأول - ابدأ هنا', inline: true },
        { name: '🥈 **2️⃣ فضي**', value: 'مستوى متقدم', inline: true },
        { name: '🥇 **3️⃣ ذهبي**', value: 'لاعب قوي', inline: true },
        { name: '💎 **4️⃣ بلاتيني**', value: 'لاعب محترف', inline: true },
        { name: '💠 **5️⃣ ألماسي**', value: 'لاعب ماهر', inline: true },
        { name: '🟣 **6️⃣ ماستر**', value: 'لاعب خبير', inline: true },
        { name: '👑 **7️⃣ جراند ماستر**', value: 'لاعب نخبة', inline: true },
        { name: '⭐ **8️⃣ نخبة بلو لوك**', value: 'أفضل اللاعبين', inline: true },
        { name: '🔥 **9️⃣ ملك الأنانيين**', value: 'الأعلى والأقوى', inline: true }
      )
      .addFields(
        { name: '**نقاط الترقية**', value: 'اكسب نقاط من المباريات والبطولات. عندما تصل إلى 100 نقطة، ستحصل على مباراة ترقية.', inline: false },
        { name: '**الهبوط**', value: 'إذا خسرت الكثير من المباريات، قد تنزل رتبة واحدة.', inline: false }
      )
      .setFooter({ text: '⚽ Blue Lock Ultimate • استخدم /help للرجوع' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },

  async showTeams(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('👥 نظام الفرق')
      .setDescription('انضم أو أنشئ فريقك الخاص')
      .addFields(
        { name: '📋 **إنشاء فريق**', value: 'اختر اسماً وشعاراً ووصفاً لفريقك. كل فريق يحتاج إلى 10 لاعبين على الأقل.', inline: false },
        { name: '👤 **الأدوار**', value: '👑 **القائد** - يدير الفريق\n📝 **نائب** - يساعد في الإدارة\n⚽ **عضو** - لاعب عادي', inline: false },
        { name: '⚔️ **حروب الفرق**', value: 'تنافسوا مع فرق أخرى أسبوعياً. الفريق الفائز يحصل على مكافآت.', inline: false },
        { name: '🏆 **بطولات الفرق**', value: 'شارك في بطولات فريقية كبرى. الفريق الفائز يصبح الأفضل.', inline: false },
        { name: '💰 **صندوق الفريق**', value: 'اجمع عملات الفريق. استخدمها لشراء معززات وعناصر خاصة.', inline: false }
      )
      .setFooter({ text: '⚽ Blue Lock Ultimate • استخدم /help للرجوع' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },

  async showShop(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('🛒 المتجر')
      .setDescription('اشتري الشخصيات والعناصر والعناصر الكوزمتيكية')
      .addFields(
        { name: '🎭 **الشخصيات**', value: 'اشتري شخصيات جديدة بأسعار مختلفة حسب الندرة.', inline: false },
        { name: '💫 **التأثيرات**', value: 'أضف تأثيرات بصرية خاصة لشخصيتك.', inline: false },
        { name: '📛 **الألقاب**', value: 'اعرض ألقابك الخاصة على بروفايلك.', inline: false },
        { name: '📦 **الصناديق**', value: 'افتح صناديق الحظ للحصول على عناصر عشوائية\n🟨 عادي - 100 عملة\n🟪 نادر - 250 عملة\n🟩 ملحمي - 500 عملة\n⭐ أسطوري - 1000 عملة\n✨ خرافي - 2000 عملة\n💎 إلهي - 5000 جوهرة\n❤️ أناني - 10000 جوهرة', inline: false },
        { name: '⚡ **المعززات**', value: '🏋️ معزز التدريب - ادرب أسرع\n⭐ معزز XP - اكسب XP أكثر\n🪙 معزز العملات - اكسب عملات أكثر', inline: false }
      )
      .setFooter({ text: '⚽ Blue Lock Ultimate • استخدم /help للرجوع' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },

  async showFAQ(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.blueLock)
      .setTitle('❓ الأسئلة الشائعة')
      .setDescription('إجابات على الأسئلة الشائعة')
      .addFields(
        { name: '**كيف أحسّن إحصائياتي؟**', value: 'استخدم نظام التدريب (`🏋️ التدريب` من القائمة). يمكنك أيضاً الحصول على معززات لتسريع العملية.', inline: false },
        { name: '**كيف أكسب عملات أكثر؟**', value: 'لعب المباريات وأكمل المهام. كل مباراة فوز تعطيك عملات أكثر.', inline: false },
        { name: '**ما هو OVR؟**', value: 'التقييم العام (Overall Rating) هو متوسط جميع إحصائياتك. يعكس قوتك العامة.', inline: false },
        { name: '**كيف أصعد في الرتب؟**', value: 'اكسب نقاط الترقية من المباريات. عندما تجمع 100 نقطة، ستخوض مباراة ترقية.', inline: false },
        { name: '**هل يمكنني تغيير شخصيتي؟**', value: 'نعم، يمكنك شراء شخصيات أخرى من المتجر.', inline: false },
        { name: '**ما هي الصناديق؟**', value: 'صناديق الحظ تحتوي على بطاقات وعناصر عشوائية. كل صندوق له ندرة مختلفة.', inline: false },
        { name: '**كيف أنضم إلى فريق؟**', value: 'اذهب إلى قسم الفرق واختر فريقاً تريد الانضمام إليه. قد تحتاج إلى دعوة من القائد.', inline: false },
        { name: '**هل هناك حد أقصى للمستوى؟**', value: 'المستوى الأقصى هو 100 حالياً، لكن يمكن أن يزيد مع التحديثات.', inline: false }
      )
      .setFooter({ text: '⚽ Blue Lock Ultimate • استخدم /help للرجوع' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
