import {
  users,
  transactions,
  rewards,
  machines,
  type User,
  type UpsertUser,
  type InsertTransaction,
  type Transaction,
  type Reward,
  type Machine,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  generateReferralCode(userId: string): Promise<string>;
  updateUserReferredBy(userId: string, referrerId: string): Promise<User>;
  updateReferralCount(userId: string, count: number): Promise<User>;
  
  // Loyalty operations
  updateUserPoints(userId: string, points: number): Promise<User>;
  updateUserTier(userId: string, tier: string): Promise<User>;
  updatePunchCard(userId: string, progress: number): Promise<User>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  
  // Reward operations
  getRewards(): Promise<Reward[]>;
  getReward(id: string): Promise<Reward | undefined>;
  redeemReward(userId: string, rewardId: string): Promise<Transaction>;
  
  // Machine operations
  getMachines(): Promise<Machine[]>;
  updateMachineStatus(id: string, isOnline: boolean): Promise<Machine>;
  
  // Admin operations
  getAdminStats(): Promise<{
    totalUsers: number;
    totalTransactions: number;
    pointsRedeemed: number;
    activeMachines: number;
  }>;
  getRecentUsers(limit?: number): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Generate referral code if new user
    const existingUser = await this.getUser(userData.id!);
    const dataToInsert = {
      ...userData,
      referralCode: existingUser?.referralCode || this.generateShortCode(),
    };

    const [user] = await db
      .insert(users)
      .values(dataToInsert)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));
    return user;
  }

  async generateReferralCode(userId: string): Promise<string> {
    const code = this.generateShortCode();
    await db
      .update(users)
      .set({ referralCode: code })
      .where(eq(users.id, userId));
    return code;
  }

  async updateUserReferredBy(userId: string, referrerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        referredBy: referrerId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateReferralCount(userId: string, count: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        referralCount: count,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  private generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Loyalty operations
  async updateUserPoints(userId: string, points: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        totalPoints: points,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserTier(userId: string, tier: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        loyaltyTier: tier,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updatePunchCard(userId: string, progress: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        punchCardProgress: progress,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string, limit = 20): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // Reward operations
  async getRewards(): Promise<Reward[]> {
    return await db
      .select()
      .from(rewards)
      .where(eq(rewards.isActive, true));
  }

  async getReward(id: string): Promise<Reward | undefined> {
    const [reward] = await db
      .select()
      .from(rewards)
      .where(eq(rewards.id, id));
    return reward;
  }

  async redeemReward(userId: string, rewardId: string): Promise<Transaction> {
    const reward = await this.getReward(rewardId);
    if (!reward) {
      throw new Error("Reward not found");
    }

    const user = await this.getUser(userId);
    if (!user || (user.totalPoints || 0) < reward.pointsCost) {
      throw new Error("Insufficient points");
    }

    // Create redemption transaction
    const transaction = await this.createTransaction({
      userId,
      type: "redemption",
      points: -reward.pointsCost,
      description: `Redeemed ${reward.name}`,
    });

    // Update user points
    await this.updateUserPoints(userId, (user.totalPoints || 0) - reward.pointsCost);

    return transaction;
  }

  // Machine operations
  async getMachines(): Promise<Machine[]> {
    return await db.select().from(machines);
  }

  async updateMachineStatus(id: string, isOnline: boolean): Promise<Machine> {
    const [machine] = await db
      .update(machines)
      .set({ 
        isOnline,
        lastPing: new Date()
      })
      .where(eq(machines.id, id))
      .returning();
    return machine;
  }

  // Admin operations
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalTransactions: number;
    pointsRedeemed: number;
    activeMachines: number;
  }> {
    const totalUsers = await db.select().from(users);
    const allTransactions = await db.select().from(transactions);
    const activeMachines = await db.select().from(machines).where(eq(machines.isOnline, true));
    
    const pointsRedeemed = allTransactions
      .filter(t => t.type === "redemption")
      .reduce((sum, t) => sum + Math.abs(t.points), 0);

    return {
      totalUsers: totalUsers.length,
      totalTransactions: allTransactions.length,
      pointsRedeemed,
      activeMachines: activeMachines.length,
    };
  }

  async getRecentUsers(limit = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
