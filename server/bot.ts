import { Telegraf, Markup, Context } from "telegraf";
import { IStorage } from "./storage";
import { generateDetailedPDF, generateFindings, generateMetadata } from "./pdfGenerator";
import { performCheck, CheckResult } from "./checkService";
import { t, Language, languageNames } from "./i18n";

interface BotContext extends Context {}

const ADMIN_IDS = ["123456789"];

function getUserLang(langCode: string | null | undefined): Language {
  if (!langCode) return "uk";
  const code = langCode.toLowerCase();
  if (code === "uk" || code === "ua") return "uk";
  if (code === "ru") return "ru";
  return "en";
}

export async function setupBot(storage: IStorage) {
  console.log("Setting up Telegram bot...");
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set. Bot will not start.");
    return null;
  }
  console.log("Token found, creating bot instance...");

  const bot = new Telegraf<BotContext>(token);

  bot.telegram.getMe()
    .then((botInfo) => console.log("Bot info:", botInfo.username))
    .catch((err) => console.error("Failed to get bot info:", err.message));

  const userStates: Map<string, { module?: string; step?: string; data?: any }> = new Map();

  bot.use(async (ctx, next) => {
    if (ctx.from) {
      const tgId = ctx.from.id.toString();
      let user = await storage.getUserByTgId(tgId);
      if (!user) {
        const detectedLang = getUserLang(ctx.from.language_code);
        user = await storage.createUser({
          tgId,
          username: ctx.from.username,
          lang: detectedLang,
          requestsLeft: 15,
          streakDays: 1,
          refCode: `DARK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        });
      }
    }
    return next();
  });

  async function getLang(tgId: string): Promise<Language> {
    const user = await storage.getUserByTgId(tgId);
    return getUserLang(user?.lang);
  }

  bot.command("start", async (ctx) => {
    const text = ctx.message.text;
    const refMatch = text.match(/start=ref_(\w+)/);
    const tgId = ctx.from!.id.toString();
    const lang = await getLang(tgId);
    
    let welcomeText = t(lang, "welcome", { 
      username: ctx.from.first_name || ctx.from.username || "User",
      tgId: tgId 
    });

    if (refMatch) {
      welcomeText += lang === "uk" 
        ? "\n\n🎁 Вітаю від друга! +1 безкоштовний запит."
        : lang === "ru" 
        ? "\n\n🎁 Приветствие от друга! +1 бесплатный запрос."
        : "\n\n🎁 Greeting from a friend! +1 free request.";
    }

    welcomeText += lang === "uk" 
      ? "\n\nОбери мову / Choose language:"
      : lang === "ru"
      ? "\n\nВыбери язык / Choose language:"
      : "\n\nSelect language:";

    await ctx.reply(welcomeText, Markup.inlineKeyboard([
      [
        Markup.button.callback("🇺🇦 Українська", "lang_uk"),
        Markup.button.callback("🇬🇧 English", "lang_en"),
        Markup.button.callback("🇷🇺 Русский", "lang_ru")
      ]
    ]));
  });

  bot.action(/^lang_/, async (ctx) => {
    const langCode = ctx.match.input.split('_')[1] as Language;
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    if (user) {
      await storage.updateUser(user.id, { lang: langCode });
    }
    await ctx.answerCbQuery(t(langCode, "settings.languageChanged"));
    
    const startText = langCode === "uk" 
      ? "✅ Мову встановлено: Українська\n\nТепер перейди до панелі!"
      : langCode === "ru"
      ? "✅ Язык установлен: Русский\n\nТеперь перейди в панель!"
      : "✅ Language set: English\n\nNow go to dashboard!";
    
    await ctx.editMessageText(startText, 
      Markup.inlineKeyboard([[Markup.button.callback("🚀 " + t(langCode, "buttons.back").replace("⬅️ ", ""), "dashboard")]])
    );
  });

  async function showDashboard(ctx: any, tgId: string, isEdit: boolean = true) {
    const user = await storage.getUserByTgId(tgId);
    const lang = getUserLang(user?.lang);
    userStates.delete(tgId);

    const requestsWarning = user && user.requestsLeft! <= 3 
      ? (lang === "uk" ? "\n⚠️ Мало запитів!" : lang === "ru" ? "\n⚠️ Мало запросов!" : "\n⚠️ Low requests!")
      : '';

    const tipText = lang === "uk" 
      ? "💡 Порада дня: Перевіряй IP на чорних списках!"
      : lang === "ru"
      ? "💡 Совет дня: Проверяй IP на чёрных списках!"
      : "💡 Tip of the day: Check IPs against blacklists!";

    const tierName = lang === "uk" ? "БЕЗКОШТОВНО" : lang === "ru" ? "БЕСПЛАТНО" : "FREE";
    
    const dashboardText = `${t(lang, "dashboard.title")}

${t(lang, "dashboard.stats", { requestsLeft: user?.requestsLeft?.toString() || "15", requestsLimit: "15" })} (${tierName})
🔥 ${lang === "uk" ? "Серія" : lang === "ru" ? "Серия" : "Streak"}: ${user?.streakDays} ${lang === "uk" ? "днів" : lang === "ru" ? "дней" : "days"}${requestsWarning}

${tipText}

${t(lang, "dashboard.selectModule")}`;

    const webUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : "https://darkshare.replit.app";

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback(t(lang, "modules.ip"), "mod_ip"),
        Markup.button.callback(t(lang, "modules.wallet"), "mod_wallet"),
        Markup.button.callback(t(lang, "modules.phone"), "mod_phone")
      ],
      [
        Markup.button.callback(t(lang, "modules.email"), "mod_email"),
        Markup.button.callback(t(lang, "modules.domain"), "mod_business"),
        Markup.button.callback(t(lang, "modules.url"), "mod_url")
      ],
      [
        Markup.button.callback(t(lang, "modules.cve") + " 🔒", "mod_cve"),
        Markup.button.callback(t(lang, "modules.iot") + " 🔒", "mod_iot"),
        Markup.button.callback(t(lang, "modules.cloud") + " 🔒", "mod_cloud")
      ],
      [
        Markup.button.callback(t(lang, "buttons.monitoring"), "monitoring"),
        Markup.button.callback("📄 " + (lang === "uk" ? "Звіти" : lang === "ru" ? "Отчёты" : "Reports"), "reports"),
        Markup.button.callback(t(lang, "buttons.history"), "history")
      ],
      [
        Markup.button.callback(t(lang, "buttons.settings"), "settings"),
        Markup.button.callback(t(lang, "buttons.upgrade"), "upgrade"),
        Markup.button.callback(t(lang, "buttons.referrals"), "referrals")
      ],
      [
        Markup.button.callback(t(lang, "buttons.coupon"), "coupon"),
        Markup.button.callback(t(lang, "buttons.achievements"), "achievements")
      ],
      [
        Markup.button.url("🖥️ " + (lang === "uk" ? "Веб-панель" : lang === "ru" ? "Веб-панель" : "Web Panel"), webUrl)
      ]
    ]);

    try {
      if (isEdit) {
        await ctx.editMessageText(dashboardText, keyboard);
      } else {
        await ctx.reply(dashboardText, keyboard);
      }
    } catch {
      await ctx.reply(dashboardText, keyboard);
    }
  }

  bot.action(["dashboard", "back_to_dashboard"], async (ctx) => {
    const tgId = ctx.from!.id.toString();
    await showDashboard(ctx, tgId, true);
  });

  bot.command("menu", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    await showDashboard(ctx, tgId, false);
  });

  const moduleActions = ["mod_ip", "mod_wallet", "mod_phone", "mod_email", "mod_business", "mod_url"];
  const moduleMap: Record<string, string> = {
    "mod_ip": "ip",
    "mod_wallet": "wallet", 
    "mod_phone": "phone",
    "mod_email": "email",
    "mod_business": "domain",
    "mod_url": "url"
  };

  for (const action of moduleActions) {
    bot.action(action, async (ctx) => {
      const tgId = ctx.from!.id.toString();
      const lang = await getLang(tgId);
      const module = moduleMap[action];
      userStates.set(tgId, { module, step: "input" });
      await ctx.reply(t(lang, `modulePrompts.${module}`), 
        Markup.inlineKeyboard([[Markup.button.callback(t(lang, "buttons.cancel"), "back_to_dashboard")]])
      );
    });
  }

  bot.action(["mod_cve", "mod_iot", "mod_cloud"], async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const lang = await getLang(tgId);
    await ctx.answerCbQuery(t(lang, "premium.locked"));
    
    const text = lang === "uk" 
      ? "🔒 Ця функція доступна тільки для PRO.\n\nОтримай PRO для доступу до:\n• CVE/Vulns Scan\n• IoT/Device Fingerprint\n• Cloud Resources Scan"
      : lang === "ru"
      ? "🔒 Эта функция доступна только для PRO.\n\nПолучи PRO для доступа к:\n• CVE/Vulns Scan\n• IoT/Device Fingerprint\n• Cloud Resources Scan"
      : "🔒 This feature is PRO only.\n\nGet PRO for access to:\n• CVE/Vulns Scan\n• IoT/Device Fingerprint\n• Cloud Resources Scan";
    
    await ctx.reply(text, 
      Markup.inlineKeyboard([
        [Markup.button.callback(t(lang, "upgrade.buyPro"), "upgrade")],
        [Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]
      ])
    );
  });

  bot.on("text", async (ctx) => {
    const text = ctx.message.text;
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    const lang = getUserLang(user?.lang);
    const state = userStates.get(tgId);

    if (state?.module === "payment" && state?.step === "awaiting_proof") {
      if (!user) return;
      
      const txHash = text.trim();
      
      const payment = await storage.createPayment({
        userId: user.id,
        tier: state.data.tier,
        amountUsdt: state.data.amount,
        txHash: txHash,
        status: "pending",
      });

      userStates.delete(tgId);

      await ctx.reply(t(lang, "payment.created", { id: payment.id.toString() }) + `\n\n${lang === "uk" ? "Тариф" : lang === "ru" ? "Тариф" : "Tier"}: ${state.data.tier}\n${lang === "uk" ? "Сума" : lang === "ru" ? "Сумма" : "Amount"}: $${state.data.amount} USDT\nTX Hash: ${txHash}\n\n${t(lang, "payment.pending")}`, 
        Markup.inlineKeyboard([[Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]])
      );

      for (const adminId of ADMIN_IDS) {
        try {
          await ctx.telegram.sendMessage(adminId, t("uk", "admin.newPayment", { id: payment.id.toString() }) + `\n\n${t("uk", "admin.user", { username: user.username || "N/A", tgId: user.tgId })}\n${t("uk", "admin.tier", { tier: state.data.tier })}\n${t("uk", "admin.paymentAmount", { amount: state.data.amount })}\nTX Hash: ${txHash}`, 
            {
              reply_markup: Markup.inlineKeyboard([
                [
                  Markup.button.callback(t("uk", "admin.approve"), `approve_pay_${payment.id}`),
                  Markup.button.callback(t("uk", "admin.reject"), `reject_pay_${payment.id}`)
                ]
              ]).reply_markup
            }
          );
        } catch (e) {
          console.log(`Failed to notify admin ${adminId}:`, e);
        }
      }
      return;
    }

    if (user && user.requestsLeft! <= 0) {
      return ctx.reply(t(lang, "validation.limitReached", { limit: "15" }), 
        Markup.inlineKeyboard([
          [Markup.button.callback(t(lang, "buttons.upgrade"), "upgrade")],
          [Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]
        ])
      );
    }

    if (!state || !state.module) {
      const helpText = lang === "uk" 
        ? "Використай /menu для вибору модуля."
        : lang === "ru"
        ? "Используй /menu для выбора модуля."
        : "Use /menu to select a module.";
      return ctx.reply(helpText);
    }

    const inputValue = text.trim();
    
    switch (state.module) {
      case "ip":
        if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(inputValue)) {
          return ctx.reply(t(lang, "validation.invalidIp"));
        }
        break;
      case "wallet":
        if (!inputValue.startsWith("0x") || inputValue.length < 20) {
          return ctx.reply(t(lang, "validation.invalidWallet"));
        }
        break;
      case "email":
        if (!inputValue.includes("@")) {
          return ctx.reply(t(lang, "validation.invalidEmail"));
        }
        break;
    }
    
    let checkResult: CheckResult;
    try {
      const analyzingText = lang === "uk" ? "🔄 Аналізую дані..." : lang === "ru" ? "🔄 Анализирую данные..." : "🔄 Analyzing data...";
      await ctx.reply(analyzingText);
      checkResult = await performCheck(state.module, inputValue);
    } catch (error: any) {
      console.error("Check error:", error);
      return ctx.reply(t(lang, "validation.error", { error: error.message }));
    }
    
    const getRiskEmoji = (level: string) => {
      switch (level) {
        case "low": return "🟢";
        case "medium": return "🟡";
        case "high": return "🔴";
        case "critical": return "⚫";
        default: return "🟡";
      }
    };

    const moduleEmojis: Record<string, string> = {
      ip: "🌐", wallet: "💰", phone: "📱", 
      email: "📧", domain: "🏢", url: "🔗"
    };
    
    const riskEmoji = getRiskEmoji(checkResult.riskLevel);
    const findingsText = checkResult.findings.slice(0, 5).map(f => `• ${f}`).join("\n");
    
    const riskWord = lang === "uk" ? "Ризик" : lang === "ru" ? "Риск" : "Risk";
    const findingsWord = lang === "uk" ? "Знахідки" : lang === "ru" ? "Находки" : "Findings";
    const sourcesWord = lang === "uk" ? "Джерела" : lang === "ru" ? "Источники" : "Sources";

    const result = `${moduleEmojis[state.module] || "🔍"} ${checkResult.type.toUpperCase()} ${t(lang, "result.analysis")}: ${checkResult.target.substring(0, 30)}${checkResult.target.length > 30 ? "..." : ""}
${riskEmoji} ${riskWord}: ${checkResult.riskLevel.toUpperCase()} (${checkResult.riskScore}/100)

📋 ${findingsWord}:
${findingsText}

📊 ${sourcesWord}: ${checkResult.sources.join(", ")}`;

    if (user) {
      await storage.updateUser(user.id, { requestsLeft: Math.max(0, (user.requestsLeft || 15) - 1) });
      
      await storage.createReport({
        userId: user.id,
        objectType: state.module,
        dataJson: checkResult,
      });
    }

    userStates.delete(tgId);

    await ctx.reply(result, 
      Markup.inlineKeyboard([
        [
          Markup.button.callback(t(lang, "buttons.pdf"), `gen_pdf_${state.module}_${inputValue}`),
          Markup.button.callback(t(lang, "buttons.newCheck"), `mod_${state.module === "domain" ? "business" : state.module}`)
        ],
        [
          Markup.button.callback(t(lang, "buttons.monitoring"), `add_monitor_${state.module}_${inputValue}`),
          Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")
        ]
      ])
    );
  });

  bot.action(/^gen_pdf_/, async (ctx) => {
    const parts = ctx.match.input.split('_');
    const module = parts[2];
    const target = parts.slice(3).join('_');
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    const lang = getUserLang(user?.lang);
    
    if (!user) return ctx.answerCbQuery("Error");

    try {
      const generatingText = lang === "uk" ? "📄 Генерую PDF..." : lang === "ru" ? "📄 Генерирую PDF..." : "📄 Generating PDF...";
      await ctx.answerCbQuery(generatingText);
      
      const checkResult = await performCheck(module, target);
      const findings = generateFindings(module, checkResult.riskLevel);
      const metadata = generateMetadata(module);
      
      const pdfBuffer = await generateDetailedPDF({
        moduleType: module,
        targetValue: target,
        riskLevel: checkResult.riskLevel as "low" | "medium" | "high" | "critical",
        riskScore: checkResult.riskScore,
        timestamp: new Date(),
        userId: user.id.toString(),
        findings,
        sources: checkResult.sources,
        metadata
      });

      const filename = `darkshare_${module}_${Date.now()}.pdf`;
      
      await ctx.replyWithDocument({
        source: pdfBuffer,
        filename: filename
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      const errorText = lang === "uk" ? "❌ Помилка генерації PDF" : lang === "ru" ? "❌ Ошибка генерации PDF" : "❌ PDF generation error";
      await ctx.reply(errorText);
    }
  });

  bot.action(/^add_monitor_/, async (ctx) => {
    const parts = ctx.match.input.split('_');
    const module = parts[2];
    const target = parts.slice(3).join('_');
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    const lang = getUserLang(user?.lang);
    
    if (!user) return ctx.answerCbQuery("Error");

    const existingWatches = await storage.getWatches(user.id);
    const watchLimit = user.tier === "FREE" ? 1 : 999;
    
    if (existingWatches.length >= watchLimit) {
      await ctx.answerCbQuery(t(lang, "monitoring.limitReached"));
      return ctx.reply(t(lang, "monitoring.upgradeHint"), 
        Markup.inlineKeyboard([
          [Markup.button.callback(t(lang, "upgrade.buyPro"), "upgrade")],
          [Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]
        ])
      );
    }

    await storage.createWatch({
      userId: user.id,
      objectType: module,
      value: target,
      status: "low",
      alertsOn: true,
    });

    await ctx.answerCbQuery(t(lang, "monitoring.added"));
    await ctx.reply(t(lang, "monitoring.added") + "\n\n" + t(lang, "monitoring.description"), 
      Markup.inlineKeyboard([[Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]])
    );
  });

  bot.action("monitoring", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    const lang = getUserLang(user?.lang);
    
    if (!user) return;

    const watches = await storage.getWatches(user.id);
    
    const title = t(lang, "monitoring.title");
    let text = `${title}\n\n`;
    
    if (watches.length === 0) {
      text += lang === "uk" 
        ? "(Порожньо)\n\nДодай об'єкт після перевірки."
        : lang === "ru"
        ? "(Пусто)\n\nДобавь объект после проверки."
        : "(Empty)\n\nAdd an object after a check.";
    } else {
      watches.forEach((w, i) => {
        const statusEmoji = w.status === "low" ? "🟢" : w.status === "medium" ? "🟡" : "🔴";
        text += `${i + 1}. ${statusEmoji} ${w.objectType}: ${w.value}\n`;
      });
    }

    await ctx.editMessageText(text, 
      Markup.inlineKeyboard([[Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]])
    );
  });

  bot.action("reports", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    const lang = getUserLang(user?.lang);
    
    if (!user) return;

    const reports = await storage.getReports(user.id);
    
    const title = lang === "uk" ? "📄 Звіти" : lang === "ru" ? "📄 Отчёты" : "📄 Reports";
    let text = `${title}\n\n`;
    
    if (reports.length === 0) {
      text += lang === "uk" 
        ? "(Порожньо)\n\nПроведи перевірку для створення звіту."
        : lang === "ru"
        ? "(Пусто)\n\nПроведи проверку для создания отчёта."
        : "(Empty)\n\nRun a check to create a report.";
    } else {
      reports.slice(0, 10).forEach((r, i) => {
        const date = r.generatedAt ? new Date(r.generatedAt).toLocaleDateString() : "N/A";
        text += `${i + 1}. ${r.objectType.toUpperCase()} - ${date}\n`;
      });
    }

    await ctx.editMessageText(text, 
      Markup.inlineKeyboard([[Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]])
    );
  });

  bot.action("settings", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    const lang = getUserLang(user?.lang);

    const text = `${t(lang, "settings.title")}\n\n${t(lang, "settings.language", { lang: languageNames[lang] })}\n\n${t(lang, "settings.selectLanguage")}`;

    await ctx.editMessageText(text, Markup.inlineKeyboard([
      [
        Markup.button.callback("🇺🇦 Українська", "set_lang_uk"),
        Markup.button.callback("🇬🇧 English", "set_lang_en"),
        Markup.button.callback("🇷🇺 Русский", "set_lang_ru")
      ],
      [Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]
    ]));
  });

  bot.action(/^set_lang_/, async (ctx) => {
    const newLang = ctx.match.input.split('_')[2] as Language;
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    
    if (user) {
      await storage.updateUser(user.id, { lang: newLang });
    }
    
    await ctx.answerCbQuery(t(newLang, "settings.languageChanged"));
    await showDashboard(ctx, tgId, true);
  });

  bot.action("referrals", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    const lang = getUserLang(user?.lang);

    const text = `${t(lang, "referrals.title")}\n\n${t(lang, "referrals.yourCode", { code: user?.refCode || "N/A" })}\n${t(lang, "referrals.link", { code: user?.refCode || "N/A" })}\n\n${t(lang, "referrals.count", { count: "0" })}\n${t(lang, "referrals.earnings", { amount: "0" })}\n\n${t(lang, "referrals.invite")}`;

    await ctx.editMessageText(text, 
      Markup.inlineKeyboard([
        [Markup.button.url(t(lang, "buttons.share"), `https://t.me/share/url?url=t.me/DARKSHAREN1_BOT?start=ref_${user?.refCode}`)],
        [Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]
      ])
    );
  });

  bot.action("upgrade", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const lang = await getLang(tgId);

    const text = `${t(lang, "upgrade.title")}\n\n${t(lang, "upgrade.free")}\n${t(lang, "upgrade.freeDetails")}\n\n${t(lang, "upgrade.pro")}\n${t(lang, "upgrade.proDetails")}\n\n${t(lang, "upgrade.enterprise")}\n${t(lang, "upgrade.enterpriseDetails")}`;

    await ctx.editMessageText(text, 
      Markup.inlineKeyboard([
        [Markup.button.callback(t(lang, "upgrade.buyPro"), "buy_pro")],
        [Markup.button.callback(t(lang, "upgrade.buyEnterprise"), "buy_enterprise")],
        [Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]
      ])
    );
  });

  bot.action(["buy_pro", "buy_enterprise"], async (ctx) => {
    const tier = ctx.match.input === "buy_pro" ? "PRO" : "ENTERPRISE";
    const amount = tier === "PRO" ? "10" : "50";
    const tgId = ctx.from!.id.toString();
    const lang = await getLang(tgId);

    userStates.set(tgId, { module: "payment", step: "awaiting_proof", data: { tier, amount } });

    const text = `${t(lang, "payment.title", { tier })}\n\n${t(lang, "payment.amount", { amount })}\n\n${t(lang, "payment.address")}\n\n${t(lang, "payment.instructions")}`;

    await ctx.reply(text, 
      Markup.inlineKeyboard([[Markup.button.callback(t(lang, "buttons.cancel"), "back_to_dashboard")]])
    );
  });

  bot.on("photo", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const state = userStates.get(tgId);
    
    if (state?.module === "payment" && state?.step === "awaiting_proof") {
      const user = await storage.getUserByTgId(tgId);
      if (!user) return;
      const lang = getUserLang(user.lang);

      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const fileId = photo.file_id;
      
      const payment = await storage.createPayment({
        userId: user.id,
        tier: state.data.tier,
        amountUsdt: state.data.amount,
        screenshotUrl: fileId,
        status: "pending",
      });

      userStates.delete(tgId);

      await ctx.reply(`${t(lang, "payment.created", { id: payment.id.toString() })}\n\n${lang === "uk" ? "Тариф" : lang === "ru" ? "Тариф" : "Tier"}: ${state.data.tier}\n${lang === "uk" ? "Сума" : lang === "ru" ? "Сумма" : "Amount"}: $${state.data.amount} USDT\n\n${t(lang, "payment.pending")}`, 
        Markup.inlineKeyboard([[Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]])
      );

      for (const adminId of ADMIN_IDS) {
        try {
          await ctx.telegram.sendPhoto(adminId, fileId, {
            caption: `${t("uk", "admin.newPayment", { id: payment.id.toString() })}\n\n${t("uk", "admin.user", { username: user.username || "N/A", tgId: user.tgId })}\n${t("uk", "admin.tier", { tier: state.data.tier })}\n${t("uk", "admin.paymentAmount", { amount: state.data.amount })}\n${t("uk", "admin.type", { type: lang === "uk" ? "Скріншот" : lang === "ru" ? "Скриншот" : "Screenshot" })}`,
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.button.callback(t("uk", "admin.approve"), `approve_pay_${payment.id}`),
                Markup.button.callback(t("uk", "admin.reject"), `reject_pay_${payment.id}`)
              ]
            ]).reply_markup
          });
        } catch (e) {
          console.log(`Failed to notify admin ${adminId}:`, e);
        }
      }
    }
  });

  bot.action(/^approve_pay_(\d+)$/, async (ctx) => {
    const adminTgId = ctx.from!.id.toString();
    const paymentId = parseInt(ctx.match[1]);
    
    const payment = await storage.getPaymentById(paymentId);
    if (!payment) {
      return ctx.answerCbQuery("Payment not found");
    }

    if (payment.status !== "pending") {
      return ctx.answerCbQuery(t("uk", "payment.alreadyProcessed"));
    }

    await storage.updatePaymentStatus(paymentId, "approved");
    
    const user = await storage.getUserById(payment.userId!);
    if (user) {
      const newTier = payment.tier;
      await storage.updateUser(user.id, { tier: newTier, requestsLeft: 9999 });
      
      const userLang = getUserLang(user.lang);
      const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
      
      try {
        await ctx.telegram.sendMessage(user.tgId, t(userLang, "payment.approved", { id: paymentId.toString(), tier: newTier, expiry }), 
          Markup.inlineKeyboard([[Markup.button.callback(t(userLang, "buttons.back"), "back_to_dashboard")]])
        );
      } catch (e) {
        console.log(`Failed to notify user:`, e);
      }
    }

    await ctx.editMessageCaption(`${t("uk", "admin.approved", { admin: ctx.from!.username || "Admin" })}\n\n${t("uk", "admin.newPayment", { id: paymentId.toString() })}\n${t("uk", "admin.user", { username: user?.username || "N/A", tgId: user?.tgId || "N/A" })}`);
    await ctx.answerCbQuery("Approved!");
  });

  bot.action(/^reject_pay_(\d+)$/, async (ctx) => {
    const paymentId = parseInt(ctx.match[1]);
    
    const payment = await storage.getPaymentById(paymentId);
    if (!payment) {
      return ctx.answerCbQuery("Payment not found");
    }

    if (payment.status !== "pending") {
      return ctx.answerCbQuery(t("uk", "payment.alreadyProcessed"));
    }

    await storage.updatePaymentStatus(paymentId, "rejected");

    const user = await storage.getUserById(payment.userId!);
    if (user) {
      const userLang = getUserLang(user.lang);
      try {
        await ctx.telegram.sendMessage(user.tgId, t(userLang, "payment.rejected", { id: paymentId.toString() }), 
          Markup.inlineKeyboard([[Markup.button.callback(t(userLang, "payment.tryAgain"), "upgrade")]])
        );
      } catch (e) {
        console.log(`Failed to notify user:`, e);
      }
    }

    await ctx.editMessageCaption(`${t("uk", "admin.rejected", { admin: ctx.from!.username || "Admin" })}\n\n${t("uk", "admin.newPayment", { id: paymentId.toString() })}\n${t("uk", "admin.user", { username: user?.username || "N/A", tgId: user?.tgId || "N/A" })}`);
    await ctx.answerCbQuery("Rejected");
  });

  bot.action("coupon", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const lang = await getLang(tgId);
    userStates.set(tgId, { module: "coupon", step: "input" });
    await ctx.reply(t(lang, "coupon.enter"), 
      Markup.inlineKeyboard([[Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]])
    );
  });

  bot.action("achievements", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const lang = await getLang(tgId);
    
    const text = `${t(lang, "achievements.title")}\n\n${t(lang, "achievements.riskHunter", { count: "0" })}\n${t(lang, "achievements.scamSlayer", { count: "0" })}\n${t(lang, "achievements.streakMaster", { count: "0" })}\n${t(lang, "achievements.referralKing", { count: "0" })}\n\n${t(lang, "achievements.unlock")}`;

    await ctx.editMessageText(text, 
      Markup.inlineKeyboard([[Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]])
    );
  });

  bot.action("history", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const lang = await getLang(tgId);

    const text = `${t(lang, "history.title")}\n\n${t(lang, "history.description")}\n\n${t(lang, "history.empty")}\n\n${t(lang, "history.addMonitor")}`;

    await ctx.editMessageText(text, 
      Markup.inlineKeyboard([[Markup.button.callback(t(lang, "buttons.back"), "back_to_dashboard")]])
    );
  });

  bot.command("admin", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const stats = await storage.getStats();

    const text = `${t("uk", "admin.title")}\n\n${t("uk", "admin.stats")}\n${t("uk", "admin.totalUsers", { count: stats.totalUsers.toString() })}\n${t("uk", "admin.activeWatches", { count: stats.activeWatches.toString() })}\n${t("uk", "admin.mrr", { amount: "0" })}\n\n${t("uk", "admin.selectAction")}`;

    await ctx.reply(text, 
      Markup.inlineKeyboard([
        [
          Markup.button.callback(t("uk", "admin.users"), "admin_users"),
          Markup.button.callback(t("uk", "admin.analytics"), "admin_analytics")
        ],
        [
          Markup.button.callback(t("uk", "admin.broadcast"), "admin_broadcast"),
          Markup.button.callback(t("uk", "admin.coupons"), "admin_coupons")
        ],
        [Markup.button.callback(t("uk", "buttons.exit"), "back_to_dashboard")]
      ])
    );
  });

  bot.catch((err, ctx) => {
    console.error(`Bot error for ${ctx.updateType}:`, err);
  });

  console.log("Starting bot polling...");
  bot.launch({ dropPendingUpdates: true })
    .catch((err: Error) => console.error("Bot error:", err.message));

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  console.log("Bot is now running and listening for messages!");
  return bot;
}
