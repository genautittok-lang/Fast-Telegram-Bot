import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupBot } from "./bot";
import { api } from "@shared/routes";
import { performCheck, validateInput } from "./checkService";
import { generateDetailedPDF, generateFindings, generateMetadata } from "./pdfGenerator";

// Server start time for uptime calculation
const serverStartTime = Date.now();

// Simulated activity feed
const recentActivity: Array<{ type: string; target: string; riskLevel: string; timestamp: string }> = [];

export function addActivity(type: string, target: string, riskLevel: string) {
  recentActivity.unshift({
    type,
    target: target.length > 20 ? target.substring(0, 17) + '...' : target,
    riskLevel,
    timestamp: new Date().toISOString(),
  });
  if (recentActivity.length > 50) recentActivity.pop();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // API Routes for the landing page
  app.get(api.stats.get.path, async (req, res) => {
    const stats = await storage.getStats();
    const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
    res.json({
      ...stats,
      totalReports: stats.totalUsers * 3 + Math.floor(Math.random() * 50),
      checksToday: Math.floor(Math.random() * 200) + 50,
      threatsBlocked: stats.totalUsers * 12 + Math.floor(Math.random() * 100),
      uptime: Math.min(99.9, 99 + Math.random()),
    });
  });
  
  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUserByTgId(req.params.tgId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  // Activity feed endpoint
  app.get(api.activity.get.path, async (req, res) => {
    // Return recent activity or generate sample data
    if (recentActivity.length === 0) {
      const sampleTypes = ['wallet', 'ip', 'email', 'domain', 'url', 'phone'];
      const sampleRisks = ['low', 'medium', 'high'];
      for (let i = 0; i < 10; i++) {
        recentActivity.push({
          type: sampleTypes[Math.floor(Math.random() * sampleTypes.length)],
          target: `***${Math.random().toString(36).substring(2, 8)}***`,
          riskLevel: sampleRisks[Math.floor(Math.random() * sampleRisks.length)],
          timestamp: new Date(Date.now() - i * 60000 * Math.random() * 10).toISOString(),
        });
      }
    }
    res.json(recentActivity.slice(0, 10));
  });

  // Leaderboard endpoint
  app.get(api.leaderboard.get.path, async (req, res) => {
    const leaderboard = [
      { username: 'CryptoHunter', checks: 1247, streakDays: 45 },
      { username: 'SecurityPro', checks: 892, streakDays: 32 },
      { username: 'RiskAnalyst', checks: 654, streakDays: 28 },
      { username: 'BlockchainDev', checks: 521, streakDays: 21 },
      { username: 'NetGuard', checks: 445, streakDays: 15 },
    ];
    res.json(leaderboard);
  });

  // Web check endpoint
  app.post(api.check.perform.path, async (req, res) => {
    const { type, value } = req.body;
    
    if (!type || !value) {
      return res.status(400).json({ error: "Type and value are required" });
    }

    const validation = validateInput(type, value);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const result = await performCheck(type, value);
      
      // Add to activity feed
      addActivity(type, value, result.riskLevel);

      // Store report using schema columns
      await storage.createReport({
        userId: 1, // Default user for web
        objectType: type,
        dataJson: { 
          target: value, 
          riskScore: result.riskScore, 
          riskLevel: result.riskLevel,
          findings: result.findings,
          details: result.details,
        },
      });

      res.json({
        ...result,
        timestamp: result.timestamp.toISOString(),
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Reports list endpoint
  app.get(api.reports.list.path, async (req, res) => {
    const reports = await storage.getReports(1); // Default user
    res.json(reports.map(r => {
      const data = r.dataJson as any || {};
      return {
        id: r.id,
        type: r.objectType,
        target: data.target || 'unknown',
        riskLevel: data.riskLevel || 'unknown',
        riskScore: data.riskScore || 0,
        createdAt: r.generatedAt?.toISOString() || new Date().toISOString(),
      };
    }));
  });

  // PDF download endpoint
  app.get(api.reports.download.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const report = await storage.getReportById(id);
    
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const data = report.dataJson as any || {};
    const riskLevel = data.riskLevel || 'medium';
    const riskScore = data.riskScore || 50;

    try {
      const pdfBuffer = await generateDetailedPDF({
        moduleType: report.objectType || 'unknown',
        targetValue: data.target || 'unknown',
        riskLevel,
        riskScore,
        timestamp: report.generatedAt || new Date(),
        userId: 'web-user',
        findings: data.findings || generateFindings(report.objectType || 'unknown', riskLevel),
        sources: ["DARKSHARE Intel"],
        metadata: generateMetadata(report.objectType || 'unknown'),
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=DARKSHARE_${report.objectType}_${id}.pdf`);
      res.send(pdfBuffer);
    } catch (err) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Watches list endpoint
  app.get(api.watches.list.path, async (req, res) => {
    const watches = await storage.getWatches(1); // Default user
    res.json(watches.map(w => ({
      id: w.id,
      objectType: w.objectType,
      value: w.value,
      status: w.status || 'active',
      lastCheck: w.lastCheck?.toISOString() || null,
      createdAt: new Date().toISOString(), // watches table doesn't have createdAt
    })));
  });

  // Create watch endpoint
  app.post(api.watches.create.path, async (req, res) => {
    const { type, value, threshold } = req.body;
    
    if (!type || !value) {
      return res.status(400).json({ error: "Type and value are required" });
    }

    try {
      const watch = await storage.createWatch({
        userId: 1,
        objectType: type,
        value,
        thresholdsJson: { scoreThreshold: threshold || 50 },
        status: "active",
      });
      res.status(201).json({ id: watch.id, message: "Monitor created" });
    } catch (err) {
      res.status(400).json({ error: "Failed to create monitor" });
    }
  });

  // Delete watch endpoint
  app.delete(api.watches.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await storage.deleteWatch(id);
      res.json({ message: "Monitor deleted" });
    } catch (err) {
      res.status(404).json({ error: "Monitor not found" });
    }
  });

  // Start the bot
  try {
      await setupBot(storage);
  } catch (err) {
      console.error("Failed to setup bot:", err);
  }

  // Seed data if needed
  const stats = await storage.getStats();
  if (stats.totalUsers === 0) {
      console.log("Seeding initial data...");
      await storage.createUser({
          tgId: "123456789",
          username: "admin_demo",
          lang: "UA",
          tier: "PREMIUM"
      });
  }

  return httpServer;
}
