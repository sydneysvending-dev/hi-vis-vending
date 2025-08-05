import {
  users,
  transactions,
  rewards,
  machines,
  notifications,
  externalTransactions,
  seasons,
  monthlyPoints,
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
  type Season,
  type MonthlyPoints,
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
  
  // Leaderboard operations
  getLeaderboardBySuburb(): Promise<{ suburb: string; users: Array<User & { rank: number }> }[]>;
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
      firstName: userData.firstName ? this.capitalizeName(userData.firstName) : userData.firstName,
      lastName: userData.lastName ? this.capitalizeName(userData.lastName) : userData.lastName,
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
      firstName: userData.firstName ? this.capitalizeName(userData.firstName) : userData.firstName,
      lastName: userData.lastName ? this.capitalizeName(userData.lastName) : userData.lastName,
      referralCode: existingUser?.referralCode || this.generateShortCode(),
    };

    const updateData = {
      ...userData,
      firstName: userData.firstName ? this.capitalizeName(userData.firstName) : userData.firstName,
      lastName: userData.lastName ? this.capitalizeName(userData.lastName) : userData.lastName,
      updatedAt: new Date(),
    };

    const [user] = await db
      .insert(users)
      .values(dataToInsert)
      .onConflictDoUpdate({
        target: users.id,
        set: updateData,
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

  private capitalizeName(name: string): string {
    if (!name || !name.trim()) return name;
    return name.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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

  async updateDailyStreak(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastPurchase = user.lastPurchaseDate ? new Date(user.lastPurchaseDate) : null;
    const lastPurchaseDate = lastPurchase ? new Date(lastPurchase.getFullYear(), lastPurchase.getMonth(), lastPurchase.getDate()) : null;
    
    let newStreak = user.currentStreak || 0;
    let streakRewardEarned = user.streakRewardEarned || false;

    // If last purchase was yesterday, increment streak
    if (lastPurchaseDate) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastPurchaseDate.getTime() === yesterday.getTime()) {
        newStreak += 1;
      } else if (lastPurchaseDate.getTime() !== today.getTime()) {
        // Reset streak if more than a day has passed
        newStreak = 1;
      }
      // If last purchase was today, don't change streak
    } else {
      // First purchase ever
      newStreak = 1;
    }

    // Check if user earned 3-day streak reward
    if (newStreak >= 3 && !streakRewardEarned) {
      streakRewardEarned = true;
      
      // Create a reward transaction for free large drink
      await this.createTransaction({
        userId,
        type: "bonus",
        points: 0, // Free drink, no points deducted
        description: "3-Day Streak Reward: Free Large Drink",
        redemptionCode: `STREAK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        isRedeemed: false
      });
    }

    const [updatedUser] = await db
      .update(users)
      .set({ 
        currentStreak: newStreak,
        lastPurchaseDate: today,
        streakRewardEarned,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
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
        firstName: this.capitalizeName(profile.firstName),
        lastName: this.capitalizeName(profile.lastName),
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
    try {
      const totalUsers = await db.select().from(users);
      const allTransactions = await db.select().from(transactions);
      const allMachines = await db.select().from(machines);
      
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

      const activeMachines = allMachines.filter(m => m.isOnline);

      return {
        totalUsers: totalUsers.length,
        totalTransactions: allTransactions.length,
        pointsRedeemed,
        activeMachines: activeMachines.length,
        activeUsersToday,
        totalPointsEarned,
      };
    } catch (error) {
      console.error("Error in getAdminStats:", error);
      // Return default stats if there's an error
      return {
        totalUsers: 0,
        totalTransactions: 0,
        pointsRedeemed: 0,
        activeMachines: 0,
        activeUsersToday: 0,
        totalPointsEarned: 0,
      };
    }
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

  // Process external transaction with product-specific points
  async processExternalTransactionWithPoints(transaction: any): Promise<void> {
    // First, store the external transaction
    const [externalTx] = await db
      .insert(externalTransactions)
      .values({
        externalId: transaction.externalId,
        machineId: transaction.machineId,
        cardNumber: transaction.cardNumber,
        amount: transaction.amount,
        productName: transaction.productName,
        timestamp: transaction.timestamp,
        isProcessed: false,
      })
      .returning();

    // Try to match to a user by card number
    if (transaction.cardNumber) {
      const user = await this.getUserByCardNumber(transaction.cardNumber);
      if (user) {
        await this.matchTransactionToUserWithPoints(externalTx.id, user.id, transaction.pointsEarned);
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
      amount: externalTx.amount,
      cardNumber: externalTx.cardNumber || undefined,
      isAutoGenerated: true,
    });

    // Update user points, monthly points, and daily streak
    await this.updateUserPointsAndMonthly(userId, points);
    await this.updateDailyStreak(userId);

    // Mark external transaction as processed
    await db
      .update(externalTransactions)
      .set({ 
        isProcessed: true,
        matchedUserId: userId 
      })
      .where(eq(externalTransactions.id, externalTransactionId));
  }

  // Update user points and monthly season points
  async updateUserPointsAndMonthly(userId: string, points: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const newTotal = (user.totalPoints || 0) + points;
    await this.updateUserPoints(userId, newTotal);

    // Check for tier promotion
    let newTier = user.loyaltyTier;
    if (newTotal >= 1000) newTier = "foreman";
    else if (newTotal >= 500) newTier = "tradie";
    
    if (newTier !== user.loyaltyTier) {
      await this.updateUserTier(userId, newTier || "apprentice");
      
      // Send congratulatory notification
      await this.createNotification({
        userId,
        title: "Level Up!",
        message: `Congratulations! You've been promoted to ${newTier!.charAt(0).toUpperCase() + newTier!.slice(1)}!`,
        type: "achievement",
      });
    }

    // Update monthly points for current season
    await this.updateMonthlyPoints(userId, points);
  }

  // Monthly season management
  async getCurrentSeason(): Promise<Season | undefined> {
    const [currentSeason] = await db
      .select()
      .from(seasons)
      .where(eq(seasons.isActive, true))
      .limit(1);
    return currentSeason;
  }

  async createNewSeason(): Promise<Season> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Deactivate any existing active season
    await db
      .update(seasons)
      .set({ isActive: false });

    // Create new season
    const startDate = new Date(year, now.getMonth(), 1);
    const endDate = new Date(year, now.getMonth() + 1, 0);

    const [newSeason] = await db
      .insert(seasons)
      .values({
        year,
        month,
        name: `${monthNames[month - 1]} ${year}`,
        isActive: true,
        startDate,
        endDate,
      })
      .returning();

    return newSeason;
  }

  async updateMonthlyPoints(userId: string, points: number): Promise<void> {
    let currentSeason = await this.getCurrentSeason();
    
    // Create new season if none exists or if we're in a new month
    if (!currentSeason) {
      currentSeason = await this.createNewSeason();
    }

    const user = await this.getUser(userId);
    if (!user) return;

    // Check if user has monthly points record for current season
    const [existingRecord] = await db
      .select()
      .from(monthlyPoints)
      .where(and(
        eq(monthlyPoints.userId, userId),
        eq(monthlyPoints.seasonId, currentSeason.id)
      ));

    if (existingRecord) {
      // Update existing record
      await db
        .update(monthlyPoints)
        .set({ 
          points: existingRecord.points + points,
          updatedAt: new Date()
        })
        .where(eq(monthlyPoints.id, existingRecord.id));
    } else {
      // Create new record
      await db
        .insert(monthlyPoints)
        .values({
          userId,
          seasonId: currentSeason.id,
          points,
          suburb: user.suburb || 'Unknown',
        });
    }

    // Update ranks for the season
    await this.updateSeasonRanks(currentSeason.id);
  }

  async updateSeasonRanks(seasonId: string): Promise<void> {
    // Get all monthly points for this season, grouped by suburb
    const allPoints = await db
      .select()
      .from(monthlyPoints)
      .where(eq(monthlyPoints.seasonId, seasonId))
      .orderBy(desc(monthlyPoints.points));

    // Group by suburb and update ranks
    const suburbGroups = new Map<string, any[]>();
    for (const record of allPoints) {
      if (!suburbGroups.has(record.suburb)) {
        suburbGroups.set(record.suburb, []);
      }
      suburbGroups.get(record.suburb)!.push(record);
    }

    // Update ranks within each suburb
    for (const [suburb, users] of suburbGroups) {
      const sortedUsers = users.sort((a: any, b: any) => b.points - a.points);
      for (let i = 0; i < sortedUsers.length; i++) {
        const user = sortedUsers[i];
        const rank = i + 1;
        await db
          .update(monthlyPoints)
          .set({ rank, updatedAt: new Date() })
          .where(eq(monthlyPoints.id, user.id));
      }
    }
  }

  // Match transaction with specific point value
  async matchTransactionToUserWithPoints(externalTransactionId: string, userId: string, points: number): Promise<void> {
    const [externalTx] = await db
      .select()
      .from(externalTransactions)
      .where(eq(externalTransactions.id, externalTransactionId));

    if (!externalTx) return;

    // Create loyalty transaction with product-specific points
    await this.createTransaction({
      userId,
      type: "purchase",
      points,
      description: `Purchase: ${externalTx.productName || 'Vending machine item'} (${points} pts)`,
      machineId: externalTx.machineId,
      amount: externalTx.amount,
      cardNumber: externalTx.cardNumber || undefined,
      isAutoGenerated: true,
    });

    // Update user points, monthly points, and daily streak
    await this.updateUserPointsAndMonthly(userId, points);
    await this.updateDailyStreak(userId);

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

  // Leaderboard operations
  async getLeaderboardBySuburb(): Promise<{ suburb: string; users: Array<User & { rank: number }> }[]> {
    // Get all users with points, grouped by suburb
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.totalPoints));

    // Group users by suburb
    const suburbGroups = new Map<string, User[]>();
    
    for (const user of allUsers) {
      if (!user.suburb) continue;
      
      if (!suburbGroups.has(user.suburb)) {
        suburbGroups.set(user.suburb, []);
      }
      suburbGroups.get(user.suburb)!.push(user);
    }

    // Create leaderboard with rankings for each suburb
    const leaderboards: { suburb: string; users: Array<User & { rank: number }> }[] = [];
    
    for (const [suburb, suburbUsers] of suburbGroups) {
      // Sort users by points and add ranking
      const rankedUsers = suburbUsers
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      leaderboards.push({
        suburb,
        users: rankedUsers
      });
    }

    // Sort suburbs by highest total points
    leaderboards.sort((a, b) => {
      const aTotal = a.users.reduce((sum, u) => sum + (u.totalPoints || 0), 0);
      const bTotal = b.users.reduce((sum, u) => sum + (u.totalPoints || 0), 0);
      return bTotal - aTotal;
    });

    return leaderboards;
  }

  async getMonthlyLeaderboard(seasonId: string): Promise<any[]> {
    return await db
      .select({
        id: monthlyPoints.id,
        userId: monthlyPoints.userId,
        points: monthlyPoints.points,
        rank: monthlyPoints.rank,
        suburb: monthlyPoints.suburb,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          loyaltyTier: users.loyaltyTier,
        }
      })
      .from(monthlyPoints)
      .leftJoin(users, eq(monthlyPoints.userId, users.id))
      .where(eq(monthlyPoints.seasonId, seasonId))
      .orderBy(monthlyPoints.rank);
  }
}

export const storage = new DatabaseStorage();
