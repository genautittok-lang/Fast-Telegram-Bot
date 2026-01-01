import { Telegraf, Markup, Context } from "telegraf";
import { IStorage } from "./storage";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Define a minimal custom context type if needed
interface BotContext extends Context {
  // Add custom properties if needed
}

export async function setupBot(storage: IStorage) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set. Bot will not start.");
    return null;
  }

  const bot = new Telegraf<BotContext>(token);

  // Middleware to ensure user exists
  bot.use(async (ctx, next) => {
    if (ctx.from) {
      const tgId = ctx.from.id.toString();
      let user = await storage.getUserByTgId(tgId);
      if (!user) {
        user = await storage.createUser({
          tgId,
          username: ctx.from.username,
          lang: ctx.from.language_code === 'uk' ? 'UA' : 'EN',
          requestsLeft: 15, // Free tier
        });
      }
      // Attach user to context if needed, but for now we just ensure existence
    }
    return next();
  });

  bot.command("start", async (ctx) => {
    const welcomeText = `
Доброго, ${ctx.from.first_name}! 👋 DARKSHARE v4.0 — твій щит від ризиків. Join 100k+ юзерів!

Обери мову / Choose language:
`;
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
    
    const dashboardText = `
🌑 DARKSHARE Dashboard
Запитів: ${user?.requestsLeft}/15 (FREE). Streak: 3 дні.
Total users: 100k+. Daily tip: Check IP на blacklists!

Обери модуль або дію:
`;
    
    await ctx.editMessageText(dashboardText, Markup.inlineKeyboard([
      [Markup.button.callback("🌐 IP/GEO", "mod_ip"), Markup.button.callback("💰 Wallet", "mod_wallet")],
      [Markup.button.callback("📱 Phone", "mod_phone"), Markup.button.callback("📧 Email", "mod_email")],
      [Markup.button.callback("👁 Monitoring", "monitoring"), Markup.button.callback("⚙️ Settings", "settings")],
      [Markup.button.callback("📄 Reports", "reports"), Markup.button.callback("💳 Upgrade", "upgrade")]
    ]));
  });

  // --- Module: Wallet Check ---
  bot.action("mod_wallet", async (ctx) => {
    await ctx.reply("Enter wallet address (ETH/BTC/USDT):");
    // In a real bot, we'd use a scene or state machine to capture the next input.
    // For this 'lite' version, we'll assume the next text message is the input if the user just clicked this.
    // But telegraf simple text handling is global. We'll simulate a result for ANY text that looks like a wallet.
  });

  // --- Mock Input Handler for Wallet/IP ---
  bot.on("text", async (ctx) => {
    const text = ctx.message.text;
    
    // Simple heuristic for demo
    if (text.startsWith("0x") && text.length > 20) {
      // It's a crypto wallet
      await ctx.reply("Checking blockchain data...", Markup.inlineKeyboard([
         [Markup.button.callback("Wait...", "dummy_wait")]
      ]));
      
      // Simulate delay
      setTimeout(async () => {
        const resultText = `
Результат Blockchain/Wallet: ${text.substring(0, 10)}...
🟢 Low risk

Деталі:
- Tx history: 150 tx, last 1 day ago.
- Flags: Clean.
- Balance: 1.5 ETH, 1000 USDT.

Recommends: Rotate keys every 90 days.
`;
        await ctx.reply(resultText, Markup.inlineKeyboard([
          [Markup.button.callback("🔄 Re-Check", "mod_wallet"), Markup.button.callback("📄 Generate PDF", `gen_pdf_${text}`)],
          [Markup.button.callback("👁 Monitor", `monitor_${text}`), Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
        ]));
      }, 1500);
      return;
    }

    if (text.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        // IP Address
        await ctx.reply(`
Результат IP: ${text}
🟡 Medium risk

ASN: 12345, Provider: ISP
Blacklist: Score 45/100
        `, Markup.inlineKeyboard([
            [Markup.button.callback("⬅️ Dashboard", "back_to_dashboard")]
        ]));
        return;
    }
  });

  // --- PDF Generation ---
  bot.action(/^gen_pdf_/, async (ctx) => {
    const data = ctx.match.input.replace("gen_pdf_", "");
    await ctx.answerCbQuery("Generating PDF...");
    
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    
    doc.fontSize(20).text('DARKSHARE v4.0 Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date().toISOString()}`);
    doc.text(`Object: ${data}`);
    doc.moveDown();
    doc.text('Risk Analysis: LOW RISK (Green)');
    doc.text('Balance: 1.5 ETH');
    doc.text('Flags: None');
    doc.moveDown();
    doc.text('CONFIDENTIAL - DO NOT DISTRIBUTE', { align: 'center', color: 'red' });
    
    doc.end();
    
    doc.on('end', async () => {
        const pdfData = Buffer.concat(buffers);
        await ctx.replyWithDocument({ source: pdfData, filename: `report_${data}.pdf` }, {
            caption: "PDF Ready! 📄"
        });
    });
  });
  
  // --- Monitoring ---
  bot.action(/^monitor_/, async (ctx) => {
      const value = ctx.match.input.replace("monitor_", "");
      const tgId = ctx.from!.id.toString();
      const user = await storage.getUserByTgId(tgId);
      
      if (user) {
          await storage.createWatch({
              userId: user.id,
              objectType: value.startsWith("0x") ? "wallet" : "ip",
              value: value,
              thresholdsJson: {},
              status: "active"
          });
          await ctx.reply(`✅ Added ${value} to monitoring!`);
      }
  });

  bot.launch(() => {
    console.log("Bot started!");
  }).catch(err => {
    console.error("Bot launch failed:", err);
  });
  
  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot;
}
