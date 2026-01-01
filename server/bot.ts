import { Telegraf, Markup, Context } from "telegraf";
import { IStorage } from "./storage";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

interface BotContext extends Context {}

export async function setupBot(storage: IStorage) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set. Bot will not start.");
    return null;
  }

  const bot = new Telegraf<BotContext>(token);

  // Middleware
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
          refCode: `DARK-${Math.random().toString(36).substring(7).toUpperCase()}`,
        });
      }
    }
    return next();
  });

  bot.command("start", async (ctx) => {
    const welcomeText = `Доброго, ${ctx.from.first_name}! 👋 DARKSHARE v4.0 — твій щит від ризиків. Join 100k+ юзерів!`;
    await ctx.reply(welcomeText, Markup.inlineKeyboard([
      [Markup.button.callback("🇺🇦 UA", "lang_ua"), Markup.button.callback("🇬🇧 EN", "lang_en"), Markup.button.callback("🇷🇺 RU", "lang_ru")]
    ]));
  });

  bot.action(/^lang_/, async (ctx) => {
    const lang = ctx.match.input.split('_')[1].toUpperCase();
    await ctx.answerCbQuery(`Language set to ${lang}`);
    await ctx.reply("Tutorial done! Go to dashboard.", Markup.inlineKeyboard([
      [Markup.button.callback("🚀 Start", "dashboard")]
    ]));
  });

  bot.action(["dashboard", "back_to_dashboard"], async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    
    const dashboardText = `🌑 DARKSHARE Dashboard
Запитів: ${user?.requestsLeft}/15 (FREE). Streak: ${user?.streakDays} дні.
Refs: 0/5. Total users: 100k+.
Daily tip: Check IP на blacklists!

Обери модуль або дію:`;
    
    await ctx.editMessageText(dashboardText, Markup.inlineKeyboard([
      [Markup.button.callback("🌐 IP/GEO", "mod_ip"), Markup.button.callback("💰 Wallet", "mod_wallet"), Markup.button.callback("📱 Phone", "mod_phone")],
      [Markup.button.callback("📧 Email", "mod_email"), Markup.button.callback("🏢 Business", "mod_business"), Markup.button.callback("📱 Social", "mod_social")],
      [Markup.button.callback("🛡️ CVE Scan 🔒", "mod_cve"), Markup.button.callback("📡 IoT Scan 🔒", "mod_iot"), Markup.button.callback("☁️ Cloud 🔒", "mod_cloud")],
      [Markup.button.callback("🔗 URL Risk", "mod_url"), Markup.button.callback("👁 Monitoring", "monitoring"), Markup.button.callback("📄 Reports", "reports")],
      [Markup.button.callback("⚙️ Settings", "settings"), Markup.button.callback("💳 Subscription", "upgrade"), Markup.button.callback("📣 Referrals", "referrals")],
      [Markup.button.callback("🎁 Coupon", "coupon"), Markup.button.callback("🎮 Achievements", "achievements")]
    ]));
  });

  // --- Mock Module Handlers ---
  const modules = ["ip", "wallet", "phone", "email", "business", "social", "cve", "iot", "cloud", "url"];
  modules.forEach(mod => {
    bot.action(`mod_${mod}`, async (ctx) => {
      await ctx.reply(`Enter ${mod.toUpperCase()} to check:`);
    });
  });

  bot.on("text", async (ctx) => {
    const text = ctx.message.text;
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);

    if (user && user.requestsLeft! <= 0) {
        return ctx.reply("❌ Limit hit. Upgrade for more requests!", Markup.inlineKeyboard([
            [Markup.button.callback("💳 Upgrade", "upgrade")]
        ]));
    }

    // Heuristics
    if (text.startsWith("0x")) {
        await ctx.reply("Checking Wallet...", Markup.inlineKeyboard([[Markup.button.callback("Wait...", "dummy")]]));
        setTimeout(async () => {
            const res = `Result: 0x...
🟢 Low risk
- Tx: 150
- Balance: 1.5 ETH`;
            await ctx.reply(res, Markup.inlineKeyboard([
                [Markup.button.callback("📄 Generate PDF", `gen_pdf_${text}`), Markup.button.callback("👁 Add Monitor", `monitor_${text}`)],
                [Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
            ]));
            await storage.updateUser(user!.id, { requestsLeft: user!.requestsLeft! - 1 });
        }, 1000);
    } else if (text.includes("@")) {
        await ctx.reply(`Email check: ${text}\n🔴 High risk (Breached)`);
    } else if (text.match(/^\d+$/)) {
        await ctx.reply(`Phone check: ${text}\n🟡 Medium risk (VOIP)`);
    } else {
        await ctx.reply("I can't recognize this data. Try Wallet, IP, Email, or Phone.");
    }
  });

  bot.action(/^gen_pdf_/, async (ctx) => {
    await ctx.answerCbQuery("Generating...");
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.fontSize(25).text('DARKSHARE Report', {align:'center'});
    doc.fontSize(12).text(`Target: ${ctx.match.input}`);
    doc.text('Verdict: LOW RISK');
    doc.end();
    doc.on('end', async () => {
        await ctx.replyWithDocument({ source: Buffer.concat(buffers), filename: 'report.pdf' });
    });
  });

  bot.action("monitoring", async (ctx) => {
    await ctx.editMessageText("👁 Monitoring Watchlist:\nEmpty", Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
    ]));
  });

  bot.action("referrals", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const user = await storage.getUserByTgId(tgId);
    await ctx.editMessageText(`📣 Referrals\nCode: ${user?.refCode}\nRefs: 0/5`, Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
    ]));
  });

  bot.launch();
  return bot;
}
