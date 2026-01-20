import { users, reports, watches, payments, referrals, type User, type InsertUser, type Report, type Watch, type Payment } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByTgId(tgId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  updateUserLogin(id: number): Promise<void>;
  
  // Reports
  createReport(report: any): Promise<Report>;
  getReports(userId: number): Promise<Report[]>;
  getReportById(id: number): Promise<Report | undefined>;
  
  // Watches
  createWatch(watch: any): Promise<Watch>;
  getWatches(userId: number): Promise<Watch[]>;
  updateWatch(id: number, updates: Partial<Watch>): Promise<Watch>;
  deleteWatch(id: number): Promise<void>;
  
  // Payments
  createPayment(payment: any): Promise<Payment>;
  getPaymentById(id: number): Promise<Payment | undefined>;
  getPendingPayments(): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  
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

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  async updateUserLogin(id: number): Promise<void> {
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, id));
  }

  async createReport(insertReport: any): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  async getReports(userId: number): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.userId, userId));
  }

  async getReportById(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
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

  async deleteWatch(id: number): Promise<void> {
    await db.delete(watches).where(eq(watches.id, id));
  }

  async getStats(): Promise<{ totalUsers: number, activeWatches: number }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [watchCount] = await db.select({ count: sql<number>`count(*)` }).from(watches).where(eq(watches.alertsOn, true));
    return {
      totalUsers: Number(userCount?.count || 0),
      activeWatches: Number(watchCount?.count || 0),
    };
  }

  async createPayment(insertPayment: any): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPendingPayments(): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.status, "pending"));
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const [payment] = await db.update(payments).set({ status }).where(eq(payments.id, id)).returning();
    return payment;
  }
}

export const storage = new DatabaseStorage();
