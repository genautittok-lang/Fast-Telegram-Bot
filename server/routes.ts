import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupBot } from "./bot";
import { api } from "@shared/routes";

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
