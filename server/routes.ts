import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupBot } from "./bot";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // API Routes for the landing page
  app.get(api.stats.get.path, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });
  
  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUserByTgId(req.params.tgId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
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
      // Create a dummy user to show stats
      await storage.createUser({
          tgId: "123456789",
          username: "admin_demo",
          lang: "UA",
          tier: "PREMIUM"
      });
  }

  return httpServer;
}
