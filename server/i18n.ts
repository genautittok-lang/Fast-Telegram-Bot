export type Language = "uk" | "en" | "ru";

export const translations = {
  uk: {
    welcome: `🌑 DARKSHARE v4.0

Ласкаво просимо, {username}!
Твій ID: {tgId}

Вибери модуль для перевірки:`,
    
    dashboard: {
      title: "🌑 DARKSHARE - Панель керування",
      stats: "📊 Ліміт: {requestsLeft}/{requestsLimit} запитів",
      tier: "Рівень: {tier}",
      selectModule: "Вибери модуль:",
    },
    
    modules: {
      ip: "🌐 IP/GEO",
      wallet: "💰 Гаманець",
      phone: "📱 Телефон",
      email: "📧 Email",
      domain: "🏢 Домен",
      url: "🔗 URL",
      cve: "🔓 CVE",
      iot: "📡 IoT",
      cloud: "☁️ Cloud",
    },
    
    modulePrompts: {
      ip: "🌐 IP/GEO Перевірка\n\nВведи IP-адресу (напр. 8.8.8.8):",
      wallet: "💰 Гаманець/Блокчейн Перевірка\n\nВведи адресу гаманця (0x...):",
      phone: "📱 Телефон/VOIP Перевірка\n\nВведи номер телефону:",
      email: "📧 Email/Витоки Перевірка\n\nВведи email адресу:",
      domain: "🏢 Домен/Бізнес Перевірка\n\nВведи домен (напр. example.com):",
      url: "🔗 URL/Посилання Перевірка\n\nВведи URL для перевірки:",
    },
    
    buttons: {
      cancel: "❌ Скасувати",
      back: "⬅️ Панель",
      pdf: "📄 PDF",
      monitoring: "👁 Моніторинг",
      newCheck: "🔄 Нова перевірка",
      share: "📤 Поділитися",
      upgrade: "⬆️ Покращити",
      referrals: "📣 Реферали",
      settings: "⚙️ Налаштування",
      history: "📊 Історія",
      achievements: "🎮 Досягнення",
      coupon: "🎁 Купон",
      language: "🌍 Мова",
      exit: "⬅️ Вийти",
    },
    
    validation: {
      invalidIp: "❌ Неправильний формат IP. Приклад: 8.8.8.8",
      invalidWallet: "❌ Неправильний формат гаманця. Має починатися з 0x",
      invalidEmail: "❌ Неправильний формат email",
      limitReached: "❌ Ліміт запитів вичерпано!\n\nТвій ліміт: {limit} запитів/день\n\n⭐ Оновись до PRO для безлімітних запитів!",
      error: "❌ Помилка аналізу: {error}\n\nСпробуй ще раз.",
    },
    
    result: {
      analysis: "Аналіз",
      risk: "Ризик",
      findings: "Знахідки",
      sources: "Джерела",
    },
    
    premium: {
      locked: "🔒 Преміум функція!",
      required: "Потрібен PRO тариф",
    },
    
    referrals: {
      title: "📣 Реферальна програма",
      yourCode: "Твій код: {code}",
      link: "Посилання: t.me/DARKSHAREN1_BOT?start=ref_{code}",
      count: "Рефералів: {count}/5 (до -20% знижки)",
      earnings: "Заробіток: {amount} USDT",
      invite: "Запроси друзів та отримуй бонуси!",
    },
    
    upgrade: {
      title: "💳 Тарифні плани",
      free: "🆓 БЕЗКОШТОВНО (Поточний)",
      freeDetails: "• 15 запитів/день\n• Базові модулі\n• 1 об'єкт моніторингу",
      pro: "⭐ PRO - $10/місяць",
      proDetails: "• Безлімітні запити\n• Всі модулі (CVE, IoT, Cloud)\n• Безлімітний моніторинг\n• PDF без водяного знаку\n• Пріоритетна підтримка",
      enterprise: "💎 ENTERPRISE - $50/місяць",
      enterpriseDetails: "• Все з PRO\n• API доступ\n• SIEM інтеграція\n• Персональна підтримка",
      buyPro: "⭐ Купити PRO $10",
      buyEnterprise: "💎 Купити ENTERPRISE $50",
    },
    
    payment: {
      title: "💳 Оплата {tier}",
      amount: "Сума: ${amount} USDT (TRC20)",
      address: "Адреса: TRYbty7cEgk4ioFqBt5x5aFwqowhk7hJAm",
      instructions: "Після оплати надішли:\n• TX Hash (текстом)\n• АБО скріншот оплати\n\nТвій запит буде перевірено модератором.",
      created: "✅ Запит на оплату #{id} створено!",
      pending: "Очікуйте підтвердження від модератора.",
      approved: "✅ Оплату #{id} підтверджено!\n\nТвій тариф: {tier}\nДійсний до: {expiry}\n\nДякуємо за підтримку!",
      rejected: "❌ Оплату #{id} відхилено.\n\nМожливі причини:\n• Неправильна сума\n• Невідповідний скріншот\n• Транзакцію не знайдено\n\nЗверніться до підтримки для уточнення.",
      tryAgain: "💳 Спробувати ще",
      alreadyProcessed: "Платіж вже оброблено",
    },
    
    coupon: {
      enter: "🎁 Введи код купону:",
    },
    
    achievements: {
      title: "🎮 Досягнення",
      riskHunter: "🏆 Risk Hunter - 10 перевірок ({count}/10)",
      scamSlayer: "🛡️ Scam Slayer - 50 перевірок ({count}/50)",
      streakMaster: "🔥 Streak Master - 7 днів поспіль ({count}/7)",
      referralKing: "📣 Referral King - 5 рефералів ({count}/5)",
      unlock: "Розблокуй бейджі та отримуй бонусні запити!",
    },
    
    common: {
      streak: "Серія",
      days: "днів",
      tier: "Тариф",
      amount: "Сума",
      reports: "Звіти",
      webPanel: "Веб-панель",
      start: "Старт",
      analyzing: "🔄 Аналізую дані...",
      generatingPdf: "📄 Генерую PDF...",
      pdfError: "❌ Помилка генерації PDF",
      empty: "(Порожньо)",
      useMenu: "Використай /menu для вибору модуля.",
      referralBonus: "🎁 Вітаю від друга! +1 безкоштовний запит.",
      selectLanguage: "Обери мову / Choose language:",
      languageSet: "✅ Мову встановлено: Українська\n\nТепер перейди до панелі!",
      lowRequests: "⚠️ Мало запитів!",
      tipOfDay: "💡 Порада дня: Перевіряй IP на чорних списках!",
      tierFree: "БЕЗКОШТОВНО",
      proOnly: "🔒 Ця функція доступна тільки для PRO.\n\nОтримай PRO для доступу до:\n• CVE/Vulns Scan\n• IoT/Device Fingerprint\n• Cloud Resources Scan",
      screenshot: "Скріншот",
      addAfterCheck: "Додай об'єкт після перевірки.",
      runCheck: "Проведи перевірку для створення звіту.",
      error: "Помилка",
      na: "Н/Д",
    },
    
    history: {
      title: "📊 Історія/Хронологія",
      description: "Історія змін твоїх об'єктів:",
      empty: "(Поки що порожньо)",
      addMonitor: "Додай об'єкти до моніторингу для відстеження змін.",
    },
    
    settings: {
      title: "⚙️ Налаштування",
      language: "Мова: {lang}",
      selectLanguage: "Вибери мову:",
      languageChanged: "✅ Мову змінено на українську",
    },
    
    admin: {
      title: "🌑 АДМІН ПАНЕЛЬ",
      stats: "📊 Статистика:",
      totalUsers: "• Всього користувачів: {count}",
      activeWatches: "• Активних моніторів: {count}",
      mrr: "• MRR: ${amount}",
      selectAction: "Виберіть дію:",
      users: "👥 Користувачі",
      analytics: "📊 Аналітика",
      broadcast: "📢 Розсилка",
      coupons: "🎁 Купони",
      newPayment: "💳 Нова оплата #{id}",
      user: "Користувач: @{username} (ID: {tgId})",
      tier: "Тариф: {tier}",
      paymentAmount: "Сума: ${amount} USDT",
      type: "Тип: {type}",
      approve: "✅ Прийняти",
      reject: "❌ Відхилити",
      approved: "✅ ПІДТВЕРДЖЕНО модератором @{admin}",
      rejected: "❌ ВІДХИЛЕНО модератором @{admin}",
      approvedShort: "✅ Підтверджено!",
      rejectedShort: "❌ Відхилено",
      txHash: "TX Hash",
    },
    
    monitoring: {
      title: "👁 Моніторинг",
      added: "✅ Об'єкт додано до моніторингу!",
      description: "Ти отримаєш сповіщення при зміні ризику.",
      limitReached: "❌ Ліміт моніторингу досягнуто",
      upgradeHint: "Безкоштовний план: 1 об'єкт\nОновись до PRO для безлімітного моніторингу!",
    },
  },
  
  en: {
    welcome: `🌑 DARKSHARE v4.0

Welcome, {username}!
Your ID: {tgId}

Select a module for analysis:`,
    
    dashboard: {
      title: "🌑 DARKSHARE - Control Panel",
      stats: "📊 Limit: {requestsLeft}/{requestsLimit} requests",
      tier: "Tier: {tier}",
      selectModule: "Select module:",
    },
    
    modules: {
      ip: "🌐 IP/GEO",
      wallet: "💰 Wallet",
      phone: "📱 Phone",
      email: "📧 Email",
      domain: "🏢 Domain",
      url: "🔗 URL",
      cve: "🔓 CVE",
      iot: "📡 IoT",
      cloud: "☁️ Cloud",
    },
    
    modulePrompts: {
      ip: "🌐 IP/GEO Check\n\nEnter IP address (e.g. 8.8.8.8):",
      wallet: "💰 Wallet/Blockchain Check\n\nEnter wallet address (0x...):",
      phone: "📱 Phone/VOIP Check\n\nEnter phone number:",
      email: "📧 Email/Leaks Check\n\nEnter email address:",
      domain: "🏢 Domain/Business Check\n\nEnter domain (e.g. example.com):",
      url: "🔗 URL/Link Risk Check\n\nEnter URL to check:",
    },
    
    buttons: {
      cancel: "❌ Cancel",
      back: "⬅️ Dashboard",
      pdf: "📄 PDF",
      monitoring: "👁 Monitoring",
      newCheck: "🔄 New Check",
      share: "📤 Share",
      upgrade: "⬆️ Upgrade",
      referrals: "📣 Referrals",
      settings: "⚙️ Settings",
      history: "📊 History",
      achievements: "🎮 Achievements",
      coupon: "🎁 Coupon",
      language: "🌍 Language",
      exit: "⬅️ Exit",
    },
    
    validation: {
      invalidIp: "❌ Invalid IP format. Example: 8.8.8.8",
      invalidWallet: "❌ Invalid wallet format. Must start with 0x",
      invalidEmail: "❌ Invalid email format",
      limitReached: "❌ Request limit reached!\n\nYour limit: {limit} requests/day\n\n⭐ Upgrade to PRO for unlimited requests!",
      error: "❌ Analysis error: {error}\n\nPlease try again.",
    },
    
    result: {
      analysis: "Analysis",
      risk: "Risk",
      findings: "Findings",
      sources: "Sources",
    },
    
    premium: {
      locked: "🔒 Premium feature!",
      required: "PRO tier required",
    },
    
    referrals: {
      title: "📣 Referral Program",
      yourCode: "Your code: {code}",
      link: "Link: t.me/DARKSHAREN1_BOT?start=ref_{code}",
      count: "Referrals: {count}/5 (up to -20% discount)",
      earnings: "Earnings: {amount} USDT",
      invite: "Invite friends and get bonuses!",
    },
    
    upgrade: {
      title: "💳 Subscription Plans",
      free: "🆓 FREE (Current)",
      freeDetails: "• 15 requests/day\n• Basic modules\n• 1 monitoring object",
      pro: "⭐ PRO - $10/month",
      proDetails: "• Unlimited requests\n• All modules (CVE, IoT, Cloud)\n• Unlimited monitoring\n• PDF without watermark\n• Priority support",
      enterprise: "💎 ENTERPRISE - $50/month",
      enterpriseDetails: "• Everything from PRO\n• API access\n• SIEM integration\n• Dedicated support",
      buyPro: "⭐ Buy PRO $10",
      buyEnterprise: "💎 Buy ENTERPRISE $50",
    },
    
    payment: {
      title: "💳 Payment {tier}",
      amount: "Amount: ${amount} USDT (TRC20)",
      address: "Address: TRYbty7cEgk4ioFqBt5x5aFwqowhk7hJAm",
      instructions: "After payment send:\n• TX Hash (as text)\n• OR payment screenshot\n\nYour request will be verified by moderator.",
      created: "✅ Payment request #{id} created!",
      pending: "Awaiting moderator confirmation.",
      approved: "✅ Payment #{id} approved!\n\nYour tier: {tier}\nValid until: {expiry}\n\nThank you for your support!",
      rejected: "❌ Payment #{id} rejected.\n\nPossible reasons:\n• Incorrect amount\n• Invalid screenshot\n• Transaction not found\n\nContact support for details.",
      tryAgain: "💳 Try again",
      alreadyProcessed: "Payment already processed",
    },
    
    coupon: {
      enter: "🎁 Enter coupon code:",
    },
    
    achievements: {
      title: "🎮 Achievements",
      riskHunter: "🏆 Risk Hunter - 10 checks ({count}/10)",
      scamSlayer: "🛡️ Scam Slayer - 50 checks ({count}/50)",
      streakMaster: "🔥 Streak Master - 7 days streak ({count}/7)",
      referralKing: "📣 Referral King - 5 referrals ({count}/5)",
      unlock: "Unlock badges and get bonus requests!",
    },
    
    common: {
      streak: "Streak",
      days: "days",
      tier: "Tier",
      amount: "Amount",
      reports: "Reports",
      webPanel: "Web Panel",
      start: "Start",
      analyzing: "🔄 Analyzing data...",
      generatingPdf: "📄 Generating PDF...",
      pdfError: "❌ PDF generation error",
      empty: "(Empty)",
      useMenu: "Use /menu to select a module.",
      referralBonus: "🎁 Greeting from a friend! +1 free request.",
      selectLanguage: "Select language:",
      languageSet: "✅ Language set: English\n\nNow go to dashboard!",
      lowRequests: "⚠️ Low requests!",
      tipOfDay: "💡 Tip of the day: Check IPs against blacklists!",
      tierFree: "FREE",
      proOnly: "🔒 This feature is PRO only.\n\nGet PRO for access to:\n• CVE/Vulns Scan\n• IoT/Device Fingerprint\n• Cloud Resources Scan",
      screenshot: "Screenshot",
      addAfterCheck: "Add an object after a check.",
      runCheck: "Run a check to create a report.",
      error: "Error",
      na: "N/A",
    },
    
    history: {
      title: "📊 History/Timeline",
      description: "Change history of your objects:",
      empty: "(Empty for now)",
      addMonitor: "Add objects to monitoring to track changes.",
    },
    
    settings: {
      title: "⚙️ Settings",
      language: "Language: {lang}",
      selectLanguage: "Select language:",
      languageChanged: "✅ Language changed to English",
    },
    
    admin: {
      title: "🌑 ADMIN PANEL",
      stats: "📊 Statistics:",
      totalUsers: "• Total users: {count}",
      activeWatches: "• Active monitors: {count}",
      mrr: "• MRR: ${amount}",
      selectAction: "Select action:",
      users: "👥 Users",
      analytics: "📊 Analytics",
      broadcast: "📢 Broadcast",
      coupons: "🎁 Coupons",
      newPayment: "💳 New payment #{id}",
      user: "User: @{username} (ID: {tgId})",
      tier: "Tier: {tier}",
      paymentAmount: "Amount: ${amount} USDT",
      type: "Type: {type}",
      approve: "✅ Approve",
      reject: "❌ Reject",
      approved: "✅ APPROVED by moderator @{admin}",
      rejected: "❌ REJECTED by moderator @{admin}",
      approvedShort: "✅ Approved!",
      rejectedShort: "❌ Rejected",
      txHash: "TX Hash",
    },
    
    monitoring: {
      title: "👁 Monitoring",
      added: "✅ Object added to monitoring!",
      description: "You will receive notifications when risk changes.",
      limitReached: "❌ Monitoring limit reached",
      upgradeHint: "Free plan: 1 object\nUpgrade to PRO for unlimited monitoring!",
    },
  },
  
  ru: {
    welcome: `🌑 DARKSHARE v4.0

Добро пожаловать, {username}!
Твой ID: {tgId}

Выбери модуль для проверки:`,
    
    dashboard: {
      title: "🌑 DARKSHARE - Панель управления",
      stats: "📊 Лимит: {requestsLeft}/{requestsLimit} запросов",
      tier: "Уровень: {tier}",
      selectModule: "Выбери модуль:",
    },
    
    modules: {
      ip: "🌐 IP/GEO",
      wallet: "💰 Кошелёк",
      phone: "📱 Телефон",
      email: "📧 Email",
      domain: "🏢 Домен",
      url: "🔗 URL",
      cve: "🔓 CVE",
      iot: "📡 IoT",
      cloud: "☁️ Cloud",
    },
    
    modulePrompts: {
      ip: "🌐 IP/GEO Проверка\n\nВведи IP-адрес (напр. 8.8.8.8):",
      wallet: "💰 Кошелёк/Блокчейн Проверка\n\nВведи адрес кошелька (0x...):",
      phone: "📱 Телефон/VOIP Проверка\n\nВведи номер телефона:",
      email: "📧 Email/Утечки Проверка\n\nВведи email адрес:",
      domain: "🏢 Домен/Бизнес Проверка\n\nВведи домен (напр. example.com):",
      url: "🔗 URL/Ссылка Проверка\n\nВведи URL для проверки:",
    },
    
    buttons: {
      cancel: "❌ Отмена",
      back: "⬅️ Панель",
      pdf: "📄 PDF",
      monitoring: "👁 Мониторинг",
      newCheck: "🔄 Новая проверка",
      share: "📤 Поделиться",
      upgrade: "⬆️ Улучшить",
      referrals: "📣 Рефералы",
      settings: "⚙️ Настройки",
      history: "📊 История",
      achievements: "🎮 Достижения",
      coupon: "🎁 Купон",
      language: "🌍 Язык",
      exit: "⬅️ Выход",
    },
    
    validation: {
      invalidIp: "❌ Неправильный формат IP. Пример: 8.8.8.8",
      invalidWallet: "❌ Неправильный формат кошелька. Должен начинаться с 0x",
      invalidEmail: "❌ Неправильный формат email",
      limitReached: "❌ Лимит запросов исчерпан!\n\nТвой лимит: {limit} запросов/день\n\n⭐ Обновись до PRO для безлимитных запросов!",
      error: "❌ Ошибка анализа: {error}\n\nПопробуй ещё раз.",
    },
    
    result: {
      analysis: "Анализ",
      risk: "Риск",
      findings: "Находки",
      sources: "Источники",
    },
    
    premium: {
      locked: "🔒 Премиум функция!",
      required: "Нужен PRO тариф",
    },
    
    referrals: {
      title: "📣 Реферальная программа",
      yourCode: "Твой код: {code}",
      link: "Ссылка: t.me/DARKSHAREN1_BOT?start=ref_{code}",
      count: "Рефералов: {count}/5 (до -20% скидки)",
      earnings: "Заработок: {amount} USDT",
      invite: "Пригласи друзей и получай бонусы!",
    },
    
    upgrade: {
      title: "💳 Тарифные планы",
      free: "🆓 БЕСПЛАТНО (Текущий)",
      freeDetails: "• 15 запросов/день\n• Базовые модули\n• 1 объект мониторинга",
      pro: "⭐ PRO - $10/месяц",
      proDetails: "• Безлимитные запросы\n• Все модули (CVE, IoT, Cloud)\n• Безлимитный мониторинг\n• PDF без водяного знака\n• Приоритетная поддержка",
      enterprise: "💎 ENTERPRISE - $50/месяц",
      enterpriseDetails: "• Всё из PRO\n• API доступ\n• SIEM интеграция\n• Персональная поддержка",
      buyPro: "⭐ Купить PRO $10",
      buyEnterprise: "💎 Купить ENTERPRISE $50",
    },
    
    payment: {
      title: "💳 Оплата {tier}",
      amount: "Сумма: ${amount} USDT (TRC20)",
      address: "Адрес: TRYbty7cEgk4ioFqBt5x5aFwqowhk7hJAm",
      instructions: "После оплаты отправь:\n• TX Hash (текстом)\n• ИЛИ скриншот оплаты\n\nТвой запрос будет проверен модератором.",
      created: "✅ Запрос на оплату #{id} создан!",
      pending: "Ожидайте подтверждения от модератора.",
      approved: "✅ Оплата #{id} подтверждена!\n\nТвой тариф: {tier}\nДействителен до: {expiry}\n\nСпасибо за поддержку!",
      rejected: "❌ Оплата #{id} отклонена.\n\nВозможные причины:\n• Неправильная сумма\n• Неподходящий скриншот\n• Транзакция не найдена\n\nОбратитесь в поддержку для уточнения.",
      tryAgain: "💳 Попробовать ещё",
      alreadyProcessed: "Платёж уже обработан",
    },
    
    coupon: {
      enter: "🎁 Введи код купона:",
    },
    
    achievements: {
      title: "🎮 Достижения",
      riskHunter: "🏆 Risk Hunter - 10 проверок ({count}/10)",
      scamSlayer: "🛡️ Scam Slayer - 50 проверок ({count}/50)",
      streakMaster: "🔥 Streak Master - 7 дней подряд ({count}/7)",
      referralKing: "📣 Referral King - 5 рефералов ({count}/5)",
      unlock: "Открывай значки и получай бонусные запросы!",
    },
    
    common: {
      streak: "Серия",
      days: "дней",
      tier: "Тариф",
      amount: "Сумма",
      reports: "Отчёты",
      webPanel: "Веб-панель",
      start: "Старт",
      analyzing: "🔄 Анализирую данные...",
      generatingPdf: "📄 Генерирую PDF...",
      pdfError: "❌ Ошибка генерации PDF",
      empty: "(Пусто)",
      useMenu: "Используй /menu для выбора модуля.",
      referralBonus: "🎁 Приветствие от друга! +1 бесплатный запрос.",
      selectLanguage: "Выбери язык / Choose language:",
      languageSet: "✅ Язык установлен: Русский\n\nТеперь перейди в панель!",
      lowRequests: "⚠️ Мало запросов!",
      tipOfDay: "💡 Совет дня: Проверяй IP на чёрных списках!",
      tierFree: "БЕСПЛАТНО",
      proOnly: "🔒 Эта функция доступна только для PRO.\n\nПолучи PRO для доступа к:\n• CVE/Vulns Scan\n• IoT/Device Fingerprint\n• Cloud Resources Scan",
      screenshot: "Скриншот",
      addAfterCheck: "Добавь объект после проверки.",
      runCheck: "Проведи проверку для создания отчёта.",
      error: "Ошибка",
      na: "Н/Д",
    },
    
    history: {
      title: "📊 История/Хронология",
      description: "История изменений твоих объектов:",
      empty: "(Пока пусто)",
      addMonitor: "Добавь объекты в мониторинг для отслеживания изменений.",
    },
    
    settings: {
      title: "⚙️ Настройки",
      language: "Язык: {lang}",
      selectLanguage: "Выбери язык:",
      languageChanged: "✅ Язык изменён на русский",
    },
    
    admin: {
      title: "🌑 АДМИН ПАНЕЛЬ",
      stats: "📊 Статистика:",
      totalUsers: "• Всего пользователей: {count}",
      activeWatches: "• Активных мониторов: {count}",
      mrr: "• MRR: ${amount}",
      selectAction: "Выберите действие:",
      users: "👥 Пользователи",
      analytics: "📊 Аналитика",
      broadcast: "📢 Рассылка",
      coupons: "🎁 Купоны",
      newPayment: "💳 Новая оплата #{id}",
      user: "Пользователь: @{username} (ID: {tgId})",
      tier: "Тариф: {tier}",
      paymentAmount: "Сумма: ${amount} USDT",
      type: "Тип: {type}",
      approve: "✅ Принять",
      reject: "❌ Отклонить",
      approved: "✅ ПОДТВЕРЖДЕНО модератором @{admin}",
      rejected: "❌ ОТКЛОНЕНО модератором @{admin}",
      approvedShort: "✅ Подтверждено!",
      rejectedShort: "❌ Отклонено",
      txHash: "TX Hash",
    },
    
    monitoring: {
      title: "👁 Мониторинг",
      added: "✅ Объект добавлен в мониторинг!",
      description: "Ты получишь уведомление при изменении риска.",
      limitReached: "❌ Лимит мониторинга достигнут",
      upgradeHint: "Бесплатный план: 1 объект\nОбновись до PRO для безлимитного мониторинга!",
    },
  },
} as const;

export type TranslationKeys = typeof translations.uk;

export function t(lang: Language, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, param) => {
      return params[param]?.toString() ?? `{${param}}`;
    });
  }
  
  return value;
}

export const languageNames: Record<Language, string> = {
  uk: "🇺🇦 Українська",
  en: "🇬🇧 English",
  ru: "🇷🇺 Русский",
};
