import { users, reports, watches, payments, referrals, type User, type InsertUser, type Report, type Watch, type Payment } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByTgId(tgId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
  // Reports
  createReport(report: any): Promise<Report>; // using any for insert schema helper
  getReports(userId: number): Promise<Report[]>;
  
  // Watches
  createWatch(watch: any): Promise<Watch>;
  getWatches(userId: number): Promise<Watch[]>;
  updateWatch(id: number, updates: Partial<Watch>): Promise<Watch>;
  
  // Stats
  getStats(): Promise<{ totalUsers: number, activeWatches: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByTgId(tgId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.tgId, tgId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async createReport(insertReport: any): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  async getReports(userId: number): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.userId, userId));
  }

  async createWatch(insertWatch: any): Promise<Watch> {
    const [watch] = await db.insert(watches).values(insertWatch).returning();
    return watch;
  }

  async getWatches(userId: number): Promise<Watch[]> {
    return await db.select().from(watches).where(eq(watches.userId, userId));
  }

  async updateWatch(id: number, updates: Partial<Watch>): Promise<Watch> {
    const [watch] = await db.update(watches).set(updates).where(eq(watches.id, id)).returning();
    return watch;
  }

  async getStats(): Promise<{ totalUsers: number, activeWatches: number }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [watchCount] = await db.select({ count: sql<number>`count(*)` }).from(watches).where(eq(watches.alertsOn, true));
    return {
      totalUsers: Number(userCount?.count || 0),
      activeWatches: Number(watchCount?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
