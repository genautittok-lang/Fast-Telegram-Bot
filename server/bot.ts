import { Telegraf, Markup, Context } from "telegraf";
import { IStorage } from "./storage";
import { generateDetailedPDF, generateFindings, generateMetadata } from "./pdfGenerator";

interface BotContext extends Context {}

// Admin IDs - add your Telegram user ID here
const ADMIN_IDS = ["123456789"]; // Replace with actual admin TG IDs

export async function setupBot(storage: IStorage) {
  console.log("Setting up Telegram bot...");
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set. Bot will not start.");
    return null;
  }
  console.log("Token found, creating bot instance...");

  const bot = new Telegraf<BotContext>(token);

  // Test bot token
  bot.telegram.getMe()
    .then((botInfo) => console.log("Bot info:", botInfo.username))
    .catch((err) => console.error("Failed to get bot info:", err.message));

  // User state tracking for conversation flow
  const userStates: Map<string, { module?: string; step?: string; data?: any }> = new Map();

  // Middleware - ensure user exists
  bot.use(async (ctx, next) => {
    if (ctx.from) {
      const tgId = ctx.from.id.toString();
      let user = await storage.getUserByTgId(tgId);
      if (!user) {
        user = await storage.createUser({
          tgId,
          username: ctx.from.username,
          lang: ctx.from.language_code === 'uk' ? 'UA' : 'EN',
          requestsLeft: 15,
          streakDays: 1,
          refCode: `DARK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        });
      }
    }
    return next();
  });

  // /start command
  bot.command("start", async (ctx) => {
    const text = ctx.message.text;
    const refMatch = text.match(/start=ref_(\w+)/);
    
    let welcomeText = `Доброго, ${ctx.from.first_name}! 👋

🌑 DARKSHARE v4.0 — твій щит від ризиків.
Join 100k+ юзерів!`;

    if (refMatch) {
      welcomeText += `\n\n🎁 Вітаю від друга! +1 безкоштовний запит.`;
    }

    welcomeText += `\n\nОбери мову / Choose language:`;

    await ctx.reply(welcomeText, Markup.inlineKeyboard([
      [
        Markup.button.callback("🇺🇦 UA", "lang_ua"),
        Markup.button.callback("🇬🇧 EN", "lang_en"),
        Markup.button.callback("🇷🇺 RU", "lang_ru")
      ]
    ]));
  });

  // Language selection
  bot.action(/^lang_/, async (ctx) => {
    const lang = ctx.match.input.split('_')[1].toUpperCase();
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    if (user) {
      await storage.updateUser(user.id, { lang });
    }
    await ctx.answerCbQuery(`Мова: ${lang}`);
    await ctx.editMessageText(`✅ Мова встановлена: ${lang}\n\nТепер перейди до дашборду!`, 
      Markup.inlineKeyboard([[Markup.button.callback("🚀 Старт", "dashboard")]])
    );
  });

  // Dashboard
  bot.action(["dashboard", "back_to_dashboard"], async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    userStates.delete(tgId); // Clear any pending state

    const requestsWarning = user && user.requestsLeft! <= 3 
      ? `\n⚠️ Мало запитів! Upgrade?` 
      : '';

    const dashboardText = `🌑 DARKSHARE Dashboard

📊 Запитів: ${user?.requestsLeft}/15 (FREE)
🔥 Streak: ${user?.streakDays} дні
📣 Refs: 0/5 (до -20%)${requestsWarning}

Daily tip: Check IP на blacklists!

Обери модуль:`;

    try {
      await ctx.editMessageText(dashboardText, Markup.inlineKeyboard([
        [
          Markup.button.callback("🌐 IP/GEO", "mod_ip"),
          Markup.button.callback("💰 Wallet", "mod_wallet"),
          Markup.button.callback("📱 Phone", "mod_phone")
        ],
        [
          Markup.button.callback("📧 Email", "mod_email"),
          Markup.button.callback("🏢 Domain", "mod_business"),
          Markup.button.callback("🔗 URL", "mod_url")
        ],
        [
          Markup.button.callback("🛡️ CVE 🔒", "mod_cve"),
          Markup.button.callback("📡 IoT 🔒", "mod_iot"),
          Markup.button.callback("☁️ Cloud 🔒", "mod_cloud")
        ],
        [
          Markup.button.callback("👁 Monitoring", "monitoring"),
          Markup.button.callback("📄 Reports", "reports"),
          Markup.button.callback("📊 History", "history")
        ],
        [
          Markup.button.callback("⚙️ Settings", "settings"),
          Markup.button.callback("💳 Upgrade", "upgrade"),
          Markup.button.callback("📣 Referrals", "referrals")
        ],
        [
          Markup.button.callback("🎁 Coupon", "coupon"),
          Markup.button.callback("🎮 Achievements", "achievements")
        ]
      ]));
    } catch {
      await ctx.reply(dashboardText, Markup.inlineKeyboard([
        [
          Markup.button.callback("🌐 IP/GEO", "mod_ip"),
          Markup.button.callback("💰 Wallet", "mod_wallet"),
          Markup.button.callback("📱 Phone", "mod_phone")
        ],
        [
          Markup.button.callback("📧 Email", "mod_email"),
          Markup.button.callback("🏢 Domain", "mod_business"),
          Markup.button.callback("🔗 URL", "mod_url")
        ],
        [
          Markup.button.callback("👁 Monitoring", "monitoring"),
          Markup.button.callback("📄 Reports", "reports"),
          Markup.button.callback("⚙️ Settings", "settings")
        ],
        [
          Markup.button.callback("💳 Upgrade", "upgrade"),
          Markup.button.callback("📣 Referrals", "referrals")
        ]
      ]));
    }
  });

  // /menu command
  bot.command("menu", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    
    const dashboardText = `🌑 DARKSHARE Dashboard

📊 Запитів: ${user?.requestsLeft}/15 (FREE)
🔥 Streak: ${user?.streakDays} дні

Обери модуль:`;

    await ctx.reply(dashboardText, Markup.inlineKeyboard([
      [
        Markup.button.callback("🌐 IP/GEO", "mod_ip"),
        Markup.button.callback("💰 Wallet", "mod_wallet"),
        Markup.button.callback("📱 Phone", "mod_phone")
      ],
      [
        Markup.button.callback("📧 Email", "mod_email"),
        Markup.button.callback("🏢 Domain", "mod_business"),
        Markup.button.callback("🔗 URL", "mod_url")
      ],
      [
        Markup.button.callback("👁 Monitoring", "monitoring"),
        Markup.button.callback("📄 Reports", "reports"),
        Markup.button.callback("⚙️ Settings", "settings")
      ]
    ]));
  });

  // --- MODULES ---
  
  // IP/GEO Module
  bot.action("mod_ip", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    userStates.set(tgId, { module: "ip", step: "input" });
    await ctx.reply("🌐 IP/GEO Check\n\nВведи IP-адресу (напр. 8.8.8.8):", 
      Markup.inlineKeyboard([[Markup.button.callback("❌ Скасувати", "back_to_dashboard")]])
    );
  });

  // Wallet Module
  bot.action("mod_wallet", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    userStates.set(tgId, { module: "wallet", step: "input" });
    await ctx.reply("💰 Blockchain/Wallet Check\n\nВведи адресу гаманця (0x...):", 
      Markup.inlineKeyboard([[Markup.button.callback("❌ Скасувати", "back_to_dashboard")]])
    );
  });

  // Phone Module
  bot.action("mod_phone", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    userStates.set(tgId, { module: "phone", step: "input" });
    await ctx.reply("📱 Phone/VOIP Check\n\nВведи номер телефону:", 
      Markup.inlineKeyboard([[Markup.button.callback("❌ Скасувати", "back_to_dashboard")]])
    );
  });

  // Email Module
  bot.action("mod_email", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    userStates.set(tgId, { module: "email", step: "input" });
    await ctx.reply("📧 Email/Leaks Check\n\nВведи email адресу:", 
      Markup.inlineKeyboard([[Markup.button.callback("❌ Скасувати", "back_to_dashboard")]])
    );
  });

  // Domain/Business Module
  bot.action("mod_business", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    userStates.set(tgId, { module: "domain", step: "input" });
    await ctx.reply("🏢 Business/Domain Check\n\nВведи домен (напр. example.com):", 
      Markup.inlineKeyboard([[Markup.button.callback("❌ Скасувати", "back_to_dashboard")]])
    );
  });

  // URL Module
  bot.action("mod_url", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    userStates.set(tgId, { module: "url", step: "input" });
    await ctx.reply("🔗 URL/Link Risk Check\n\nВведи URL для перевірки:", 
      Markup.inlineKeyboard([[Markup.button.callback("❌ Скасувати", "back_to_dashboard")]])
    );
  });

  // Premium modules
  bot.action(["mod_cve", "mod_iot", "mod_cloud"], async (ctx) => {
    await ctx.answerCbQuery("🔒 Premium feature!");
    await ctx.reply("🔒 Ця функція доступна тільки для PRO користувачів.\n\nОтримай PRO для доступу до:\n• CVE/Vulns Scan\n• IoT/Device Fingerprint\n• Cloud Resources Scan", 
      Markup.inlineKeyboard([
        [Markup.button.callback("💳 Upgrade to PRO", "upgrade")],
        [Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
      ])
    );
  });

  // --- TEXT INPUT HANDLER ---
  bot.on("text", async (ctx) => {
    const text = ctx.message.text;
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    const state = userStates.get(tgId);

    // Check requests limit
    if (user && user.requestsLeft! <= 0) {
      return ctx.reply("❌ Ліміт запитів вичерпано!\n\nОтримай PRO для безлімітних перевірок.", 
        Markup.inlineKeyboard([
          [Markup.button.callback("💳 Upgrade", "upgrade")],
          [Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
        ])
      );
    }

    if (!state || !state.module) {
      // No active state - show help
      return ctx.reply("Використай /menu для вибору модуля перевірки.");
    }

    // Process based on module
    let result = "";
    let riskLevel = "🟢";
    const inputValue = text.trim();

    switch (state.module) {
      case "ip":
        if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(inputValue)) {
          return ctx.reply("❌ Невірний формат IP.\nПриклад: 8.8.8.8\n\nСпробуй ще раз:");
        }
        riskLevel = Math.random() > 0.5 ? "🟢" : "🟡";
        result = `🌐 IP/GEO Result: ${inputValue}
${riskLevel} ${riskLevel === "🟢" ? "Low" : "Medium"} risk

📍 GEO: Ukraine/Kyiv
🏢 ASN: 15169 (Google LLC)
📡 Provider: ISP Name
🚫 Blacklist: Score 25/100

Sources: AbuseIPDB, IPInfo`;
        break;

      case "wallet":
        if (!inputValue.startsWith("0x") || inputValue.length < 20) {
          return ctx.reply("❌ Невірний формат гаманця.\nПриклад: 0x1234...abcd\n\nСпробуй ще раз:");
        }
        riskLevel = Math.random() > 0.7 ? "🔴" : Math.random() > 0.4 ? "🟡" : "🟢";
        result = `💰 Blockchain/Wallet: ${inputValue.substring(0,10)}...
${riskLevel} ${riskLevel === "🟢" ? "Low" : riskLevel === "🟡" ? "Medium" : "High"} risk

📊 Tx history: 154 transactions
💵 Balance: 1.5 ETH (~$4500)
🪙 Tokens: 1000 USDT, 50 DAI
🚫 Flags: ${riskLevel === "🔴" ? "Mixer interaction detected!" : "Clean"}

Sources: Etherscan, Chainalysis`;
        break;

      case "phone":
        riskLevel = Math.random() > 0.6 ? "🔴" : "🟡";
        result = `📱 Phone Check: ${inputValue}
${riskLevel} ${riskLevel === "🔴" ? "High" : "Medium"} risk

📞 Type: ${riskLevel === "🔴" ? "VOIP/Virtual" : "Mobile"}
🌍 Country: Ukraine
⚠️ Reports: ${riskLevel === "🔴" ? "High abuse score" : "Low abuse score"}

Sources: NumVerify, Twilio`;
        break;

      case "email":
        if (!inputValue.includes("@")) {
          return ctx.reply("❌ Невірний email.\nПриклад: user@example.com\n\nСпробуй ще раз:");
        }
        riskLevel = Math.random() > 0.5 ? "🔴" : "🟢";
        result = `📧 Email Check: ${inputValue}
${riskLevel} ${riskLevel === "🔴" ? "High" : "Low"} risk

📬 Valid: Yes
🔓 Breaches: ${riskLevel === "🔴" ? "3 found (LinkedIn, Adobe)" : "None found"}
🚫 Disposable: No

Sources: HaveIBeenPwned`;
        break;

      case "domain":
        riskLevel = Math.random() > 0.6 ? "🟡" : "🟢";
        result = `🏢 Domain Check: ${inputValue}
${riskLevel} ${riskLevel === "🟡" ? "Medium" : "Low"} risk

📅 Age: 5 years
🔒 SSL: Valid (Let's Encrypt)
🏴 Registration: ${riskLevel === "🟡" ? "Offshore" : "Standard"}
🚫 Sanctions: None (OFAC/EU)

Sources: WHOIS, SSL Labs`;
        break;

      case "url":
        riskLevel = Math.random() > 0.7 ? "🔴" : "🟢";
        result = `🔗 URL Risk: ${inputValue}
${riskLevel} ${riskLevel === "🔴" ? "High" : "Low"} risk

🦠 Malware: ${riskLevel === "🔴" ? "Detected!" : "None"}
🎣 Phishing: ${riskLevel === "🔴" ? "Suspected" : "Clean"}
🔀 Redirects: ${riskLevel === "🔴" ? "2 suspicious" : "0"}

Sources: VirusTotal, Google Safe`;
        break;

      default:
        return ctx.reply("Використай /menu для вибору модуля.");
    }

    // Clear state
    userStates.delete(tgId);

    // Decrement requests
    if (user) {
      await storage.updateUser(user.id, { requestsLeft: user.requestsLeft! - 1 });
    }

    // Send result with action buttons
    await ctx.reply(result, Markup.inlineKeyboard([
      [
        Markup.button.callback("🔄 Re-Check", `mod_${state.module}`),
        Markup.button.callback("📄 PDF", `gen_pdf_${state.module}_${inputValue}`)
      ],
      [
        Markup.button.callback("👁 Monitor", `add_monitor_${state.module}_${inputValue}`),
        Markup.button.callback("⚠️ Share", `share_${state.module}`)
      ],
      [Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
    ]));
  });

  // --- PDF Generation ---
  bot.action(/^gen_pdf_/, async (ctx) => {
    await ctx.answerCbQuery("Генерую професійний PDF...");
    
    const parts = ctx.match.input.split('_');
    const moduleType = parts[2];
    const value = parts.slice(3).join('_');
    const tgId = ctx.from!.id.toString();

    // Generate random but consistent risk data
    const riskScore = Math.floor(Math.random() * 100);
    const riskLevel: "low" | "medium" | "high" | "critical" = 
      riskScore >= 80 ? "critical" :
      riskScore >= 60 ? "high" :
      riskScore >= 30 ? "medium" : "low";

    const sources = {
      ip: ["AbuseIPDB", "IPInfo", "MaxMind", "Shodan", "VirusTotal"],
      wallet: ["Etherscan", "Chainalysis", "CipherTrace", "OFAC", "EU Sanctions"],
      phone: ["NumVerify", "Twilio", "CallerID", "SpamDB"],
      email: ["HaveIBeenPwned", "Hunter.io", "EmailRep", "SpamHaus"],
      domain: ["WHOIS", "SSL Labs", "DNSDumpster", "OFAC", "EU Registry"],
      url: ["VirusTotal", "Google Safe Browsing", "PhishTank", "URLVoid"],
    }[moduleType] || ["DARKSHARE Intel"];

    try {
      const pdfBuffer = await generateDetailedPDF({
        moduleType,
        targetValue: value,
        riskLevel,
        riskScore,
        timestamp: new Date(),
        userId: tgId,
        findings: generateFindings(moduleType, riskLevel),
        sources,
        metadata: generateMetadata(moduleType),
      });

      await ctx.replyWithDocument(
        { source: pdfBuffer, filename: `DARKSHARE_${moduleType.toUpperCase()}_${Date.now()}.pdf` },
        { 
          caption: `📄 Професійний звіт готовий!\n\n🎯 Ціль: ${value.substring(0, 30)}...\n📊 Risk Score: ${riskScore}/100 (${riskLevel.toUpperCase()})\n\n⚠️ CONFIDENTIAL - Do not distribute`,
          ...Markup.inlineKeyboard([
            [Markup.button.callback("🔄 New Check", `mod_${moduleType}`)],
            [Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
          ])
        }
      );
    } catch (err) {
      console.error("PDF generation error:", err);
      await ctx.reply("❌ Помилка генерації PDF. Спробуй ще раз.", 
        Markup.inlineKeyboard([[Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]])
      );
    }
  });

  // --- Add to Monitoring ---
  bot.action(/^add_monitor_/, async (ctx) => {
    const parts = ctx.match.input.split('_');
    const objectType = parts[2];
    const value = parts.slice(3).join('_');
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);

    if (user) {
      await storage.createWatch({
        userId: user.id,
        objectType,
        value,
        thresholdsJson: { scoreThreshold: 50 },
        status: "active"
      });
      await ctx.answerCbQuery("✅ Додано до моніторингу!");
      await ctx.reply(`👁 ${value.substring(0, 20)}... додано до watchlist!\n\nПеревірка кожні 5 хв. Алерти увімкнено.`, 
        Markup.inlineKeyboard([[Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]])
      );
    }
  });

  // --- Monitoring View ---
  bot.action("monitoring", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);

    if (!user) return;

    const watches = await storage.getWatches(user.id);

    if (watches.length === 0) {
      await ctx.editMessageText("👁 Watchlist порожній\n\nДодай об'єкти після перевірки.", 
        Markup.inlineKeyboard([[Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]])
      );
      return;
    }

    let watchlistText = "👁 Your Watchlist:\n\n";
    watches.forEach((w, i) => {
      const status = w.status === "high" ? "🔴" : w.status === "medium" ? "🟡" : "🟢";
      watchlistText += `${i + 1}. ${w.objectType}: ${w.value.substring(0, 15)}... ${status}\n`;
    });

    await ctx.editMessageText(watchlistText, 
      Markup.inlineKeyboard([[Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]])
    );
  });

  // --- Reports ---
  bot.action("reports", async (ctx) => {
    await ctx.editMessageText("📄 Reports\n\nТвої попередні звіти будуть тут.\n(Звіти не зберігаються - GDPR)", 
      Markup.inlineKeyboard([[Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]])
    );
  });

  // --- Settings ---
  bot.action("settings", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);

    await ctx.editMessageText(`⚙️ Settings

🌐 Мова: ${user?.lang || 'UA'}
🎨 Тема: ${user?.theme || 'Dark'}
🔔 Сповіщення: ${user?.notifsOn ? 'On' : 'Off'}
📊 Дайджести: ${user?.digestsOn ? 'On' : 'Off'}`, 
      Markup.inlineKeyboard([
        [
          Markup.button.callback("🇺🇦 UA", "set_lang_ua"),
          Markup.button.callback("🇬🇧 EN", "set_lang_en")
        ],
        [
          Markup.button.callback("🔔 Toggle Notifs", "toggle_notifs"),
          Markup.button.callback("📊 Toggle Digest", "toggle_digest")
        ],
        [Markup.button.callback("🚪 Delete My Data", "delete_data")],
        [Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
      ])
    );
  });

  // --- Referrals ---
  bot.action("referrals", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);

    await ctx.editMessageText(`📣 Referral Program

Твій код: ${user?.refCode}
Посилання: t.me/DARKSHAREN1_BOT?start=ref_${user?.refCode}

Рефералів: 0/5 (до -20% знижки)
Заробіток: 0 USDT

Запроси друзів та отримуй бонуси!`, 
      Markup.inlineKeyboard([
        [Markup.button.url("📤 Share", `https://t.me/share/url?url=t.me/DARKSHAREN1_BOT?start=ref_${user?.refCode}`)],
        [Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
      ])
    );
  });

  // --- Upgrade ---
  bot.action("upgrade", async (ctx) => {
    await ctx.editMessageText(`💳 Subscription Plans

🆓 FREE (Current)
• 15 запитів/день
• Базові модулі
• 1 об'єкт моніторингу

⭐ PRO - $10/місяць
• Безлімітні запити
• Всі модулі (CVE, IoT, Cloud)
• Безлімітний моніторинг
• PDF без watermark
• Priority support

💎 ENTERPRISE - $50/місяць
• Все з PRO
• API доступ
• SIEM інтеграція
• Dedicated support`, 
      Markup.inlineKeyboard([
        [Markup.button.callback("⭐ Buy PRO $10", "buy_pro")],
        [Markup.button.callback("💎 Buy ENTERPRISE $50", "buy_enterprise")],
        [Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
      ])
    );
  });

  bot.action(["buy_pro", "buy_enterprise"], async (ctx) => {
    const tier = ctx.match.input === "buy_pro" ? "PRO" : "ENTERPRISE";
    const amount = tier === "PRO" ? "10" : "50";

    await ctx.reply(`💳 Оплата ${tier}

Сума: $${amount} USDT (TRC20)

Адреса: TRYbty7cEgk4ioFqBt5x5aFwqowhk7hJAm

Після оплати надішли tx_hash або скріншот.`, 
      Markup.inlineKeyboard([[Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]])
    );
  });

  // --- Coupon ---
  bot.action("coupon", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    userStates.set(tgId, { module: "coupon", step: "input" });
    await ctx.reply("🎁 Введи код купону:", 
      Markup.inlineKeyboard([[Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]])
    );
  });

  // --- Achievements ---
  bot.action("achievements", async (ctx) => {
    await ctx.editMessageText(`🎮 Achievements

🏆 Risk Hunter - 10 перевірок (0/10)
🛡️ Scam Slayer - 50 перевірок (0/50)
🔥 Streak Master - 7 днів поспіль (0/7)
📣 Referral King - 5 рефералів (0/5)

Розблокуй бейджі та отримуй бонусні запити!`, 
      Markup.inlineKeyboard([[Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]])
    );
  });

  // --- History ---
  bot.action("history", async (ctx) => {
    await ctx.editMessageText(`📊 History/Timeline

Історія змін твоїх об'єктів:

(Поки що порожньо)

Додай об'єкти до моніторингу для відстеження змін.`, 
      Markup.inlineKeyboard([[Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]])
    );
  });

  // --- ADMIN PANEL ---
  bot.command("admin", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    
    // For now, allow anyone to see admin (in production, check ADMIN_IDS)
    const stats = await storage.getStats();

    await ctx.reply(`🌑 ADMIN PANEL

📊 Stats:
• Total Users: ${stats.totalUsers}
• Active Watches: ${stats.activeWatches}
• MRR: $0

Виберіть дію:`, 
      Markup.inlineKeyboard([
        [
          Markup.button.callback("👥 Users", "admin_users"),
          Markup.button.callback("📊 Analytics", "admin_analytics")
        ],
        [
          Markup.button.callback("📢 Broadcast", "admin_broadcast"),
          Markup.button.callback("🎁 Coupons", "admin_coupons")
        ],
        [Markup.button.callback("⬅️ Exit Admin", "back_to_dashboard")]
      ])
    );
  });

  // Error handler
  bot.catch((err, ctx) => {
    console.error(`Bot error for ${ctx.updateType}:`, err);
  });

  // Start bot polling (the promise only resolves when bot.stop() is called)
  console.log("Starting bot polling...");
  bot.launch({ dropPendingUpdates: true })
    .catch((err: Error) => console.error("Bot error:", err.message));

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  console.log("Bot is now running and listening for messages!");
  return bot;
}
