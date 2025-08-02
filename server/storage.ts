import {
  users,
  transactions,
  rewards,
  machines,
  notifications,
  externalTransactions,
  type User,
  type UpsertUser,
  type InsertTransaction,
  type Transaction,
  type Reward,
  type Machine,
  type Notification,
  type InsertNotification,
  type ExternalTransaction,
  type InsertExternalTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPassword(id: string, password: string): Promise<User>;
  setPasswordResetToken(id: string, token: string, expiry: Date): Promise<User>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  generateReferralCode(userId: string): Promise<string>;
  updateUserReferredBy(userId: string, referrerId: string): Promise<User>;
  updateReferralCount(userId: string, count: number): Promise<User>;
  
  // Loyalty operations
  updateUserPoints(userId: string, points: number): Promise<User>;
  updateUserTier(userId: string, tier: string): Promise<User>;
  updatePunchCard(userId: string, progress: number): Promise<User>;
  updateUserSuburb(id: string, suburb: string): Promise<User>;
  updateUserProfile(id: string, profile: { firstName: string; lastName: string; suburb: string }): Promise<User>;
  
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
    activeUsersToday: number;
    totalPointsEarned: number;
  }>;
  getRecentUsers(limit?: number): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  sendBulkNotifications(title: string, message: string, type: string, userIds?: string[]): Promise<void>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
  
  // External transaction matching
  processExternalTransaction(transaction: InsertExternalTransaction): Promise<void>;
  getUnprocessedExternalTransactions(): Promise<ExternalTransaction[]>;
  matchTransactionToUser(externalTransactionId: string, userId: string): Promise<void>;
  getUserByCardNumber(cardNumber: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const dataToInsert = {
      ...userData,
      referralCode: this.generateShortCode(),
      // Check if this is the developer account
      isDeveloper: userData.email?.toLowerCase() === 'byron@sydneyselectvending.com.au',
    };

    const [user] = await db
      .insert(users)
      .values(dataToInsert)
      .returning();
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

  // Reward redemption methods
  async getTransactionByRedemptionCode(code: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.redemptionCode, code));
    return transaction;
  }

  async markTransactionAsRedeemed(transactionId: string): Promise<void> {
    await db.update(transactions)
      .set({ 
        isRedeemed: true, 
        redeemedAt: new Date() 
      })
      .where(eq(transactions.id, transactionId));
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

  async updateUserSuburb(id: string, suburb: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        suburb: suburb,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, profile: { firstName: string; lastName: string; suburb: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        firstName: profile.firstName,
        lastName: profile.lastName,
        suburb: profile.suburb,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: string, password: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        password,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async setPasswordResetToken(id: string, token: string, expiry: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        resetToken: token,
        resetTokenExpiry: expiry,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token));
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
    activeUsersToday: number;
    totalPointsEarned: number;
  }> {
    const totalUsers = await db.select().from(users);
    const allTransactions = await db.select().from(transactions);
    const activeMachines = await db.select().from(machines).where(eq(machines.isOnline, true));
    
    const pointsRedeemed = allTransactions
      .filter(t => t.type === "redemption")
      .reduce((sum, t) => sum + Math.abs(t.points), 0);

    const totalPointsEarned = allTransactions
      .filter(t => t.points > 0)
      .reduce((sum, t) => sum + t.points, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeUsersToday = allTransactions
      .filter(t => new Date(t.createdAt!) >= today)
      .map(t => t.userId)
      .filter((userId, index, arr) => arr.indexOf(userId) === index)
      .length;

    return {
      totalUsers: totalUsers.length,
      totalTransactions: allTransactions.length,
      pointsRedeemed,
      activeMachines: activeMachines.length,
      activeUsersToday,
      totalPointsEarned,
    };
  }

  async getRecentUsers(limit = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async sendBulkNotifications(title: string, message: string, type: string, userIds?: string[]): Promise<void> {
    let targetUsers: User[];
    
    if (userIds && userIds.length > 0) {
      targetUsers = await db.select().from(users).where(and(...userIds.map(id => eq(users.id, id))));
    } else {
      targetUsers = await db.select().from(users).where(eq(users.notificationsEnabled, true));
    }

    const notificationsToInsert = targetUsers.map(user => ({
      userId: user.id,
      title,
      message,
      type,
    }));

    if (notificationsToInsert.length > 0) {
      await db.insert(notifications).values(notificationsToInsert);
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  // External transaction matching
  async processExternalTransaction(transaction: InsertExternalTransaction): Promise<void> {
    // First, store the external transaction
    const [externalTx] = await db
      .insert(externalTransactions)
      .values({
        ...transaction,
        isProcessed: false,
      })
      .returning();

    // Try to match to a user by card number
    if (transaction.cardNumber) {
      const user = await this.getUserByCardNumber(transaction.cardNumber);
      if (user) {
        await this.matchTransactionToUser(externalTx.id, user.id);
      }
    }
  }

  async getUnprocessedExternalTransactions(): Promise<ExternalTransaction[]> {
    return await db
      .select()
      .from(externalTransactions)
      .where(eq(externalTransactions.isProcessed, false))
      .orderBy(desc(externalTransactions.createdAt));
  }

  async matchTransactionToUser(externalTransactionId: string, userId: string): Promise<void> {
    const [externalTx] = await db
      .select()
      .from(externalTransactions)
      .where(eq(externalTransactions.id, externalTransactionId));

    if (!externalTx) return;

    // Calculate points (e.g., 10 points per dollar spent)
    const points = Math.floor(externalTx.amount / 100) * 10;

    // Create loyalty transaction
    await this.createTransaction({
      userId,
      type: "purchase",
      points,
      description: `Purchase: ${externalTx.productName || 'Vending machine item'}`,
      machineId: externalTx.machineId,
      externalTransactionId: externalTx.id,
      amount: externalTx.amount,
      cardNumber: externalTx.cardNumber || undefined,
      isAutoGenerated: true,
    });

    // Update user points
    const user = await this.getUser(userId);
    if (user) {
      const newTotal = (user.totalPoints || 0) + points;
      await this.updateUserPoints(userId, newTotal);

      // Check for tier promotion
      let newTier = user.loyaltyTier;
      if (newTotal >= 1000) newTier = "foreman";
      else if (newTotal >= 500) newTier = "tradie";
      
      if (newTier !== user.loyaltyTier) {
        await this.updateUserTier(userId, newTier);
        
        // Send congratulatory notification
        await this.createNotification({
          userId,
          title: "Level Up!",
          message: `Congratulations! You've been promoted to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)}!`,
          type: "achievement",
        });
      }
    }

    // Mark external transaction as processed
    await db
      .update(externalTransactions)
      .set({ 
        isProcessed: true,
        matchedUserId: userId,
      })
      .where(eq(externalTransactions.id, externalTransactionId));
  }

  async getUserByCardNumber(cardNumber: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.cardNumber, cardNumber));
    return user;
  }

  // QR code scan operations
  async createQRScan(scanData: any): Promise<any> {
    const [scan] = await db
      .insert(qrScans)
      .values(scanData)
      .returning();
    return scan;
  }

  async getQRScans(userId?: string, machineId?: string, limit: number = 50): Promise<any[]> {
    let query = db.select().from(qrScans);
    
    if (userId) {
      query = query.where(eq(qrScans.userId, userId));
    }
    if (machineId) {
      query = query.where(eq(qrScans.machineId, machineId));
    }
    
    return await query
      .orderBy(desc(qrScans.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
