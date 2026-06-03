const STORY_DATA = {
  parts: [
    {
      id: 'first_selection',
      name: 'الاختيار الأول',
      arc: 'First Selection',
      description: '300 مهاجم يدخلون سجن بلو لوك. الفرق مقسمة إلى 5 مجموعات. الناجي الوحيد هو من سيصبح أعظم مهاجم في العالم.',
      chapters: [
        {
          id: 'ch_1',
          name: 'دخول بلو لوك',
          episode: 'الحلقة 1-2',
          description: 'يصل إيساغي إلى بلو لوك مع 299 مهاجماً آخر. أول اختبار: مباراة تصنيف داخل الفريق.',
          opponent: { name: 'كو كيورا', ovr: 60 },
          requirements: { ovr: 50 },
          rewards: { coins: 1000, xp: 500, cards: 1 },
          dialogue: [
            { speaker: 'جينباتشي إيغو', text: 'مرحباً بكم في بلو لوك. من الآن فصاعداً، أنتم لستم بشراً... أنتم وحوش كرة القدم.' },
            { speaker: 'إيساغي', text: 'هذا هو المكان الذي سأصبح فيه الأفضل.' },
            { speaker: 'جينباتشي إيغو', text: 'قواعد بسيطة: من يخسر يخرج. الفائز الوحيد سيصبح أعظم مهاجم في العالم.' }
          ],
          difficulty: 1
        },
        {
          id: 'ch_2',
          name: 'Team Z vs Team X',
          episode: 'الحلقة 3',
          description: 'أول مباراة رسمية لفريق Z. أمامهم فريق X بقيادة كو كيورا.',
          opponent: { name: 'Team X', ovr: 62 },
          requirements: { ovr: 52 },
          rewards: { coins: 1500, xp: 700, cards: 1 },
          dialogue: [
            { speaker: 'إيساغي', text: 'يجب أن نفوز. لا يمكننا الخروج من هنا.' },
            { speaker: 'ميغورو باخيرا', text: 'اتبعني أيها الوغد. سأريك كيف يسجل المهاجم الحقيقي!' }
          ],
          difficulty: 2
        },
        {
          id: 'ch_3',
          name: 'Team Z vs Team W',
          episode: 'الحلقة 4',
          description: 'Team W بقيادة ريوسوكي كايسي. معركة شرسة من أجل البقاء.',
          opponent: { name: 'Team W', ovr: 65 },
          requirements: { ovr: 55 },
          rewards: { coins: 2000, xp: 900, cards: 2 },
          dialogue: [
            { speaker: 'ريوسوكي كايسي', text: 'أنتم مجرد فاشلين. سأريكم الفرق بيني وبينكم.' },
            { speaker: 'إيساغي', text: 'لن نستسلم. هذا حلمي أيضاً!' }
          ],
          difficulty: 2
        },
        {
          id: 'ch_4',
          name: 'Team Z vs Team Y',
          episode: 'الحلقة 5',
          description: 'مواجهة Team Y. فريق باخيرا القديم. توترات عالية.',
          opponent: { name: 'Team Y', ovr: 63 },
          requirements: { ovr: 55 },
          rewards: { coins: 2000, xp: 1000, cards: 2 },
          dialogue: [
            { speaker: 'باخيرا', text: 'هذا فريقي القديم... لكنني الآن جزء من Z. سأهزمهم!' }
          ],
          difficulty: 2
        },
        {
          id: 'ch_5',
          name: 'Team Z vs Team V',
          episode: 'الحلقة 6-7',
          description: 'أقوى فريق في المجموعة. Team V بقيادة سيشيرو ناغي وسي ريو.',
          opponent: { name: 'Team V', ovr: 70 },
          requirements: { ovr: 58 },
          rewards: { coins: 3000, xp: 1500, cards: 3 },
          dialogue: [
            { speaker: 'سي ريو', text: 'التسلية بدأت. ناغي، أظهر لهم مهاراتك.' },
            { speaker: 'ناغي', text: 'ها... هذا مزعج.' },
            { speaker: 'إيساغي', text: 'لديهم ناغي وريو... لكن لدينا روح الفريق!' }
          ],
          difficulty: 3
        },
        {
          id: 'ch_6',
          name: 'جولة الإقصاء',
          episode: 'الحلقة 8-9',
          description: 'آخر مباراة في الاختيار الأول. الفريق الذي يخسر يغادر بلو لوك للأبد.',
          opponent: { name: 'Team Y (إقصاء)', ovr: 68 },
          requirements: { ovr: 60 },
          rewards: { coins: 4000, xp: 2000, cards: 3 },
          dialogue: [
            { speaker: 'إيساغي', text: 'إذا خسرنا... تنتهي أحلامنا هنا. لا يمكن أن نسمح بذلك!' },
            { speaker: 'جينباتشي إيغو', text: 'أظهروا لي شغفكم. من يستحق البقاء في بلو لوك؟' }
          ],
          difficulty: 3
        },
        {
          id: 'ch_7',
          name: 'نهائي الاختيار الأول',
          episode: 'الحلقة 10-11',
          description: 'المباراة النهائية للاختيار الأول. أفضل اللاعبين يتأهلون للاختيار الثاني.',
          opponent: { name: 'فريق النخبة', ovr: 75 },
          requirements: { ovr: 62 },
          rewards: { coins: 5000, xp: 3000, cards: 5, gems: 50 },
          dialogue: [
            { speaker: 'إيساغي', text: 'هذه مجرد البداية. الاختيار الثاني ينتظرني.' },
            { speaker: 'جينباتشي إيغو', text: 'أحسنت. الآن يبدأ الجزء الحقيقي من بلو لوك.' }
          ],
          difficulty: 3,
          boss: true
        }
      ]
    },
    {
      id: 'second_selection',
      name: 'الاختيار الثاني',
      arc: 'Second Selection',
      description: 'الناجون من الاختيار الأول يدخلون مرحلة جديدة. هذه المرة، يختارون شركائهم. الثقة والتعاون هما المفتاح.',
      chapters: [
        {
          id: 'ch_8',
          name: 'اختيار الرفاق',
          episode: 'الحلقة 12-13',
          description: 'بعد النجاة من الاختيار الأول، يتحدى إيساغي الاختيار الثاني مع باخيرا وناغي.',
          opponent: { name: 'فريق الـ 3', ovr: 70 },
          requirements: { ovr: 64 },
          rewards: { coins: 3000, xp: 2000, cards: 2 },
          dialogue: [
            { speaker: 'إيساغي', text: 'يجب أن أجد شركاء يجيدون القراءة معي.' },
            { speaker: 'ناغي', text: 'إيساغي، العب معي. معاً يمكننا الفوز.' }
          ],
          difficulty: 2
        },
        {
          id: 'ch_9',
          name: 'اختبار المهارات 2 ضد 2',
          episode: 'الحلقة 14-15',
          description: 'مباريات 2 ضد 2. إيساغي وناغي ضد أقوى الثنائيات.',
          opponent: { name: 'ثنائي الساموراي', ovr: 73 },
          requirements: { ovr: 66 },
          rewards: { coins: 4000, xp: 2500, cards: 3, gems: 30 },
          dialogue: [
            { speaker: 'إيساغي', text: 'أنت وناغي. هجوم لا يمكن إيقافه.' },
            { speaker: 'ناغي', text: 'سأصنع لك المساحة. سجل.' }
          ],
          difficulty: 3
        },
        {
          id: 'ch_10',
          name: 'النهائي 2 ضد 2',
          episode: 'الحلقة 16-17',
          description: 'نهائي مباريات 2 ضد 2. إيساغي وناغي ضد رين إيتوشي وريكو كوياما.',
          opponent: { name: 'رين إيتوشي وريكو', ovr: 78 },
          requirements: { ovr: 68 },
          rewards: { coins: 5000, xp: 3000, cards: 4, gems: 50 },
          dialogue: [
            { speaker: 'رين إيتوشي', text: 'أنتم مجرد مبتدئين. سأريكم مستواي الحقيقي.' },
            { speaker: 'إيساغي', text: 'هذا أفضل لاعب في بلو لوك... لكنني لن أخاف!' }
          ],
          difficulty: 4
        },
        {
          id: 'ch_11',
          name: 'اختبار الرأس',
          episode: 'الحلقة 18-19',
          description: 'معركة 1 ضد 1. إيساغي ضد خصمه اللدود لتعزيز مكانته في التصنيف.',
          opponent: { name: 'بارو', ovr: 76 },
          requirements: { ovr: 70 },
          rewards: { coins: 6000, xp: 3500, cards: 4, gems: 75 },
          dialogue: [
            { speaker: 'بارو', text: 'أنت مجرد فأر تجري خلف الكرة. سأسحقك.' },
            { speaker: 'إيساغي', text: 'سأثبت لك أنني أكثر من مجرد فأر.' }
          ],
          difficulty: 4
        }
      ]
    },
    {
      id: 'u20_match',
      name: 'مباراة تحت 20',
      arc: 'U-20 Match Arc',
      description: 'أفضل 11 لاعباً في بلو لوك يشكلون فريقاً لمواجهة منتخب اليابان تحت 20 سنة. مصير بلو لوك بأكمله على المحك.',
      chapters: [
        {
          id: 'ch_12',
          name: 'تشكيل بلو لوك 11',
          episode: 'الحلقة 20-22',
          description: 'اختيار أفضل 11 لاعباً لتمثيل بلو لوك ضد منتخب اليابان تحت 20 سنة.',
          opponent: { name: 'Bluアロック 11', ovr: 75 },
          requirements: { ovr: 72 },
          rewards: { coins: 5000, xp: 3000, cards: 3 },
          dialogue: [
            { speaker: 'جينباتشي إيغو', text: 'هؤلاء هم الـ 11 الذين سيمثلون بلو لوك. إذا خسرنا، ينتهي المشروع.' },
            { speaker: 'إيساغي', text: 'أنا في التشكيلة الأساسية... سأثبت أنني الأفضل.' }
          ],
          difficulty: 3
        },
        {
          id: 'ch_13',
          name: 'الشوط الأول',
          episode: 'الحلقة 23-24',
          description: 'الشوط الأول من مباراة بلو لوك ضد منتخب اليابان تحت 20. ضغط هائل من الجماهير.',
          opponent: { name: 'اليابان تحت 20', ovr: 78 },
          requirements: { ovr: 74 },
          rewards: { coins: 7000, xp: 4000, cards: 5, gems: 100 },
          dialogue: [
            { speaker: 'أوليفر آيكو', text: 'هذه كرة قدم حقيقية يا أولاد. أظهروا لنا ما عندكم.' },
            { speaker: 'ساي', text: 'بلو لوك مجرد تجربة فاشلة. سأريكم.' }
          ],
          difficulty: 4
        },
        {
          id: 'ch_14',
          name: 'الشوط الثاني',
          episode: 'الحلقة 25-26',
          description: 'بلو لوك متأخر في النتيجة. يحتاجون لهدف معجزة. حان وقت إظهار الشغف الحقيقي.',
          opponent: { name: 'اليابان تحت 20 - الشوط الثاني', ovr: 82 },
          requirements: { ovr: 76 },
          rewards: { coins: 10000, xp: 5000, cards: 6, gems: 150 },
          dialogue: [
            { speaker: 'إيساغي', text: 'لن أستسلم أبداً. سأحرز الهدف وأثبت أن بلو لوك هو المستقبل!' },
            { speaker: 'جينباتشي إيغو', text: 'الآن... أظهروهم ما هو بلو لوك الحقيقي!' }
          ],
          difficulty: 5,
          boss: true
        }
      ]
    },
    {
      id: 'neo_egoist',
      name: 'دوري الأنانية الجديد',
      arc: 'Neo Egoist League',
      description: 'بعد الفوز على منتخب اليابان تحت 20، يدخل اللاعبون مرحلة جديدة: الانضمام إلى أندية أوروبية في دوري الأنانية الجديد.',
      chapters: [
        {
          id: 'ch_15',
          name: 'الانضمام إلى Bastard München',
          episode: 'المانجا الفصل 101-110',
          description: 'إيساغي ينضم إلى Bastard München تحت قيادة نيو ميسيان. بداية مرحلة جديدة تماماً.',
          opponent: { name: 'FC Barcha', ovr: 80 },
          requirements: { ovr: 78 },
          rewards: { coins: 8000, xp: 4000, cards: 4, gems: 100 },
          dialogue: [
            { speaker: 'مايكل كايزر', text: 'أهلاً بالوافد الجديد. لا تعترض طريقي.' },
            { speaker: 'إيساغي', text: 'كايزر... سأتفوق عليك يوماً ما.' }
          ],
          difficulty: 4
        },
        {
          id: 'ch_16',
          name: 'مواجهة القمم',
          episode: 'المانجا الفصل 111-120',
          description: 'معركة شرسة ضد أقوى اللاعبين في دوري الأنانية الجديد. كل هدف يغير التصنيف.',
          opponent: { name: 'PXG', ovr: 85 },
          requirements: { ovr: 80 },
          rewards: { coins: 12000, xp: 6000, cards: 6, gems: 200 },
          dialogue: [
            { speaker: 'رين إيتوشي', text: 'لقد تطورت أيضاً يا إيساغي. لكنني ما زلت في القمة.' },
            { speaker: 'إيساغي', text: 'لا يهم من في القمة الآن. المهم من سيبقى.' }
          ],
          difficulty: 5,
          boss: true
        }
      ]
    }
  ]
};

module.exports = STORY_DATA;