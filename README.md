# ⚽ Blue Lock Ultimate Discord Bot

**Blue Lock Ultimate** هو بوت ديسكورد احترافي مستوحى من أنمي Blue Lock، يقدم تجربة كاملة للاعبين داخل السيرفر تشعرهم أنهم داخل مشروع Blue Lock الحقيقي.

## 📋 المتطلبات

- Node.js 18+
- MongoDB 6+
- npm
- Canvas dependencies (اختياري للصور)

## 🚀 التثبيت

```bash
# 1. نسخ المستودع
git clone <repo>
cd blue-lock-bot

# 2. تثبيت الاعتماديات
npm install

# 3. إعداد المتغيرات
cp .env.example .env
# عدّل ملف .env بوضع التوكن ومعلومات MongoDB

# 4. نشر الأوامر
npm run deploy

# 5. تشغيل البوت
npm start
```

## 🎮 الأوامر

| الأمر | الوصف |
|-------|-------|
| `/start` | إنشاء لاعب جديد (4 خطوات تفاعلية) |
| `/menu` | فتح لوحة التحكم الرئيسية |

## 🏟️ الأنظمة

### ⚽ نظام المباريات
- **Quick Match**: مباراة سريعة ضد خصم عشوائي
- **VS Bot**: تدرب ضد البوت
- محاكاة مباريات بأحداث متتابعة (دقيبل، تمرير، تسديد، تصدي)

### 🏋️ نظام التدريب
- 5 حصص تدريب يومياً
- 11 إحصائية قابلة للتطوير
- نظام Potential (Common/Rare/Epic/Legendary)

### 🎯 نظام المهام
- مهام يومية (4 مهام)
- مهام أسبوعية (4 مهام)
- جوائز فورية (XP، عملات، جواهر)

### 🏆 نظام البطولات
- 8, 16, 32, 64 لاعب
- Bracket تلقائي
- جوائز ضخمة

### 🛒 المتجر
- صناديق Loot (Common → Mythic)
- تعزيزات (Training/XP/Coin Boost)
- عناصر خاصة

### 🎴 نظام البطاقات
- 6 ندرات (Common → Divine)
- 20+ شخصية قابلة للجمع
- نظام إكمال المجموعة

### 🏰 نظام الكلانات
- إنشاء كلان (5000 عملة)
- نظام Levels ونقاط
- قائد وأعضاء

### ⚔️ Club Wars
- حروب أسبوعية بين الكلانات
- 5 مباريات لكل حرب
- جوائز للكلان الفائز
- لقب War MVP

### 🎯 Draft System
- اختيار عشوائي للشخصيات
- 4, 8, 16 لاعب
- Snake draft order
- مباراة الفرق التلقائية

### 🔄 Transfer Market
- بيع وشراء البطاقات
- نظام ضريبة 10%
- تصفح وشراء العناصر
- إلغاء الإدراجات

### ⚡ Boosters
- Training Boost (x2 لمدة 24 ساعة)
- XP Boost (x2 لمدة ساعة)
- Coin Boost (x2 لمدة ساعة)

### 👤 نظام اللاعبين
- 11 إحصائية (Shooting → Ego)
- 9 رتب (Bronze → Egoist King)
- نظام Seasons Pass (Free/Premium)
- 20+ إنجاز
- Titles system

### 📊 أنظمة أخرى
- Live Ranking
- Card Collection
- Profile Images
- Economy System (عملات، جواهر)
- Cooldown/Anti-Spam

## 📁 هيكل المشروع

```
src/
├── index.js              # نقطة الدخول الرئيسية
├── deploy-commands.js    # نشر أوامر السlash
├── config/
│   ├── config.js         # الإعدادات (الرتب، المراكز، الشخصيات)
│   └── constants.js      # الثوابت (الإنجازات، المهام)
├── database/
│   ├── db.js             # اتصال MongoDB
│   └── models/
│       ├── Player.js     # نموذج اللاعب
│       ├── Clan.js       # نموذج الكلان
│       └── Tournament.js # نموذج البطولة
├── commands/
│   ├── start.js          # /start
│   └── menu.js           # /menu
├── events/
│   ├── ready.js          # حدث التشغيل
│   └── interactionCreate.js  # معالج الأزرار
├── systems/
│   ├── matchmaking.js    # نظام المباريات
│   ├── training.js       # نظام التدريب
│   ├── missions.js       # نظام المهام
│   ├── shop.js           # نظام المتجر
│   ├── tournament.js     # نظام البطولات
│   ├── clan.js           # نظام الكلانات
│   ├── collection.js     # نظام البطاقات
│   ├── transferMarket.js # سوق الانتقالات
│   ├── clubWars.js       # حروب الأندية
│   ├── draft.js          # نظام الاختيار
│   ├── boosters.js       # نظام التعزيزات
│   └── errorLogger.js    # تسجيل الأخطاء
├── ui/
│   ├── mainMenu.js       # القوائم التفاعلية
│   └── shopUI.js         # واجهة المتجر
├── utils/
│   ├── helpers.js        # دوال مساعدة
│   ├── cardGenerator.js  # توليد البطاقات (Canvas)
│   ├── matchSimulator.js # محاكاة المباريات
│   └── lootBoxAnimation.js # أنميشن الصناديق
└── assets/
    ├── fonts/
    └── images/
```

## 🔒 الأمان

- Anti-Exploit
- Anti-Spam (Cooldowns)
- Error Logging المنظم
- Permission System
- Rate Limiting
- Input Validation

## 📝 الترخيص

MIT License

## 👨‍💻 التطوير

للمساهمة في التطوير، راسلنا على Discord.

---

**Blue Lock Ultimate** — اصنع مصيرك، كن الأفضل.
