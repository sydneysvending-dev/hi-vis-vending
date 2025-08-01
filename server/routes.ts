import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTransactionSchema, insertRewardSchema, insertMachineSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User loyalty routes
  app.get('/api/user/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/user/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { machineId, amount } = req.body;
      
      // Award 10 points per purchase
      const points = 10;
      const transaction = await storage.createTransaction({
        userId,
        type: "purchase",
        points,
        description: `Purchase from machine ${machineId}`,
        machineId,
      });

      // Update user points and punch card
      const user = await storage.getUser(userId);
      if (user) {
        const newPoints = (user.totalPoints || 0) + points;
        const newPunchProgress = Math.min((user.punchCardProgress || 0) + 1, 10);
        
        await storage.updateUserPoints(userId, newPoints);
        await storage.updatePunchCard(userId, newPunchProgress);
        
        // Check for tier upgrade
        let newTier = user.loyaltyTier;
        if (newPoints >= 500 && user.loyaltyTier === "apprentice") {
          newTier = "tradie";
          await storage.updateUserTier(userId, newTier);
        } else if (newPoints >= 1000 && user.loyaltyTier === "tradie") {
          newTier = "foreman";
          await storage.updateUserTier(userId, newTier);
        }

        // Check for punch card completion
        if (newPunchProgress === 10) {
          await storage.createTransaction({
            userId,
            type: "bonus",
            points: 100,
            description: "Punch card completed - Free large drink",
          });
          await storage.updateUserPoints(userId, newPoints + 100);
          await storage.updatePunchCard(userId, 0); // Reset punch card
        }
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error processing purchase:", error);
      res.status(500).json({ message: "Failed to process purchase" });
    }
  });

  // Rewards routes
  app.get('/api/rewards', async (req, res) => {
    try {
      const rewards = await storage.getRewards();
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.post('/api/rewards/redeem', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { rewardId } = req.body;
      
      const transaction = await storage.redeemReward(userId, rewardId);
      res.json(transaction);
    } catch (error) {
      console.error("Error redeeming reward:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to redeem reward" });
      }
    }
  });

  // Machine routes
  app.get('/api/machines', async (req, res) => {
    try {
      const machines = await storage.getMachines();
      res.json(machines);
    } catch (error) {
      console.error("Error fetching machines:", error);
      res.status(500).json({ message: "Failed to fetch machines" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });

  // Referral routes
  app.get('/api/referral/my-code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.referralCode) {
        const newCode = await storage.generateReferralCode(userId);
        res.json({ referralCode: newCode });
      } else {
        res.json({ referralCode: user.referralCode });
      }
    } catch (error) {
      console.error("Error getting referral code:", error);
      res.status(500).json({ message: "Failed to get referral code" });
    }
  });

  app.post('/api/referral/use-code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { referralCode } = req.body;
      
      const user = await storage.getUser(userId);
      if (user?.referredBy) {
        return res.status(400).json({ message: "You have already used a referral code" });
      }

      const referrer = await storage.getUserByReferralCode(referralCode);
      if (!referrer) {
        return res.status(400).json({ message: "Invalid referral code" });
      }

      if (referrer.id === userId) {
        return res.status(400).json({ message: "Cannot use your own referral code" });
      }

      // Update the new user with referral
      await storage.updateUserReferredBy(userId, referrer.id);
      
      // Give both users bonus points
      await storage.createTransaction({
        userId: referrer.id,
        type: "bonus",
        points: 50,
        description: "Referral bonus - Friend joined",
      });

      await storage.createTransaction({
        userId,
        type: "bonus", 
        points: 25,
        description: "Welcome bonus - Used referral code",
      });

      // Update points
      await storage.updateUserPoints(referrer.id, (referrer.totalPoints || 0) + 50);
      await storage.updateUserPoints(userId, (user?.totalPoints || 0) + 25);
      await storage.updateReferralCount(referrer.id, (referrer.referralCount || 0) + 1);

      res.json({ success: true, pointsEarned: 25 });
    } catch (error) {
      console.error("Error using referral code:", error);
      res.status(500).json({ message: "Failed to use referral code" });
    }
  });

  // QR code simulation route
  app.post('/api/qr/scan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { qrData } = req.body;
      
      // Parse QR data (format: "HIVIS_MACHINE_001")
      if (!qrData || !qrData.startsWith("HIVIS_MACHINE_")) {
        return res.status(400).json({ message: "Invalid QR code" });
      }
      
      const machineId = qrData;
      
      // Simulate purchase
      const transaction = await storage.createTransaction({
        userId,
        type: "purchase",
        points: 10,
        description: `QR Purchase from ${machineId}`,
        machineId,
      });

      // Update user points and punch card
      const user = await storage.getUser(userId);
      if (user) {
        const newPoints = (user.totalPoints || 0) + 10;
        const newPunchProgress = Math.min((user.punchCardProgress || 0) + 1, 10);
        
        await storage.updateUserPoints(userId, newPoints);
        await storage.updatePunchCard(userId, newPunchProgress);
        
        // Check for punch card completion
        if (newPunchProgress === 10) {
          await storage.createTransaction({
            userId,
            type: "bonus",
            points: 100,
            description: "Punch card completed - Free large drink",
          });
          await storage.updateUserPoints(userId, newPoints + 100);
          await storage.updatePunchCard(userId, 0);
        }
      }

      res.json({ 
        success: true, 
        pointsEarned: 10,
        transaction 
      });
    } catch (error) {
      console.error("Error processing QR scan:", error);
      res.status(500).json({ message: "Failed to process QR scan" });
    }
  });

  // Notification routes
  app.post('/api/admin/send-notification', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { title, message, type, userIds } = req.body;
      await storage.sendBulkNotifications(title, message, type, userIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending notifications:", error);
      res.status(500).json({ message: "Failed to send notifications" });
    }
  });

  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ message: "Failed to mark notification read" });
    }
  });

  // External transaction processing routes
  app.post('/api/external/transaction', async (req, res) => {
    try {
      const { externalId, machineId, cardNumber, amount, productName, timestamp } = req.body;
      
      await storage.processExternalTransaction({
        externalId,
        machineId,
        cardNumber,
        amount,
        productName,
        timestamp: new Date(timestamp),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error processing external transaction:", error);
      res.status(500).json({ message: "Failed to process transaction" });
    }
  });

  app.get('/api/admin/unprocessed-transactions', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const transactions = await storage.getUnprocessedExternalTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching unprocessed transactions:", error);
      res.status(500).json({ message: "Failed to fetch unprocessed transactions" });
    }
  });

  app.post('/api/admin/match-transaction', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { externalTransactionId, userId } = req.body;
      await storage.matchTransactionToUser(externalTransactionId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error matching transaction:", error);
      res.status(500).json({ message: "Failed to match transaction" });
    }
  });

  // Update user profile with card number for automatic matching
  app.post('/api/user/update-card', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { cardNumber } = req.body;
      
      await storage.upsertUser({ 
        id: userId, 
        cardNumber,
        updatedAt: new Date(),
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating card number:", error);
      res.status(500).json({ message: "Failed to update card number" });
    }
  });

  // Moma Integration Routes
  
  // Webhook endpoint for Moma to send real-time transaction data
  app.post('/api/moma/webhook', async (req, res) => {
    try {
      const { momaIntegration } = await import('./momaIntegration');
      await momaIntegration.processWebhookData(req.body);
      res.json({ success: true, message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Error processing Moma webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  // Start automatic polling of Moma API
  app.post('/api/admin/start-moma-sync', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { momaIntegration } = await import('./momaIntegration');
      momaIntegration.startPolling();
      res.json({ success: true, message: "Moma sync started" });
    } catch (error) {
      console.error("Error starting Moma sync:", error);
      res.status(500).json({ message: "Failed to start Moma sync" });
    }
  });

  // Stop automatic polling
  app.post('/api/admin/stop-moma-sync', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { momaIntegration } = await import('./momaIntegration');
      momaIntegration.stopPolling();
      res.json({ success: true, message: "Moma sync stopped" });
    } catch (error) {
      console.error("Error stopping Moma sync:", error);
      res.status(500).json({ message: "Failed to stop Moma sync" });
    }
  });

  // CSV Upload endpoint for Moma transaction data
  app.post('/api/admin/upload-csv', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { csvData } = req.body;
      if (!csvData) {
        return res.status(400).json({ message: "CSV data required" });
      }

      // Parse CSV data (expecting: date, amount, card_number, product)
      const lines = csvData.split('\n').filter((line: string) => line.trim());
      const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
      
      let processedCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map((v: string) => v.trim());
          const record: any = {};
          
          headers.forEach((header, index) => {
            record[header] = values[index];
          });

          // Create external transaction
          await storage.processExternalTransaction({
            externalId: `CSV_${Date.now()}_${i}`,
            machineId: record.machine_id || record.machine || "UNKNOWN",
            cardNumber: record.card_number || record.card,
            amount: Math.round(parseFloat(record.amount || '0') * 100), // Convert to cents
            productName: record.product || record.item || "Unknown Product",
            timestamp: new Date(record.date || record.timestamp),
          });

          processedCount++;
        } catch (error) {
          console.error(`Error processing CSV line ${i}:`, error);
          errorCount++;
        }
      }

      res.json({ 
        success: true, 
        message: `Processed ${processedCount} transactions, ${errorCount} errors`,
        processed: processedCount,
        errors: errorCount
      });
    } catch (error) {
      console.error("Error processing CSV upload:", error);
      res.status(500).json({ message: "Failed to process CSV data" });
    }
  });

  // Enhanced reward redemption system
  app.post("/api/rewards/redeem", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { rewardId } = req.body;

      const user = await storage.getUser(userId);
      const reward = await storage.getReward(rewardId);

      if (!user || !reward) {
        return res.status(404).json({ message: "User or reward not found" });
      }

      if (user.totalPoints < reward.pointsCost) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      // Generate unique redemption code
      const redemptionCode = `HIVIS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Create redemption transaction
      await storage.createTransaction({
        userId,
        type: "redemption",
        points: -reward.pointsCost,
        description: `Redeemed: ${reward.name} - Code: ${redemptionCode}`,
        redemptionCode,
      });

      // Update user points
      await storage.updateUserPoints(userId, user.totalPoints - reward.pointsCost);

      // Create notification about successful redemption
      await storage.createNotification({
        userId,
        title: "🎯 Reward Redeemed!",
        message: `Your ${reward.name} is ready! Show code ${redemptionCode} at any Hi-Vis vending machine.`,
        type: "reward",
      });

      res.json({ 
        success: true, 
        redemptionCode,
        message: `${reward.name} redeemed successfully!`
      });
    } catch (error) {
      console.error("Error redeeming reward:", error);
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  // Validate redemption code (for vending machine operators)
  app.post("/api/admin/validate-redemption", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { redemptionCode } = req.body;
      const transaction = await storage.getTransactionByRedemptionCode(redemptionCode);

      if (!transaction) {
        return res.status(404).json({ 
          valid: false, 
          message: "Invalid redemption code" 
        });
      }

      if (transaction.isRedeemed) {
        return res.status(400).json({ 
          valid: false, 
          message: "Code already used" 
        });
      }

      // Mark as redeemed
      await storage.markTransactionAsRedeemed(transaction.id);
      
      const rewardUser = await storage.getUser(transaction.userId);
      
      res.json({ 
        valid: true, 
        reward: transaction.description,
        customerName: `${rewardUser?.firstName} ${rewardUser?.lastName}`,
        redeemedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error validating redemption:", error);
      res.status(500).json({ message: "Failed to validate redemption code" });
    }
  });

  // QR Code scanner for manual point addition
  app.post("/api/scan-purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { machineId, amount } = req.body;

      if (!machineId || !amount) {
        return res.status(400).json({ message: "Machine ID and amount required" });
      }

      // Calculate points (10 points per dollar)
      const pointsEarned = Math.floor(amount / 100) * 10;

      // Create transaction
      await storage.createTransaction({
        userId,
        type: "purchase",
        points: pointsEarned,
        description: `QR Purchase at ${machineId}`,
        machineId,
        amount,
      });

      // Update user points and punch card
      const user = await storage.getUser(userId);
      if (user) {
        const newTotalPoints = (user.totalPoints || 0) + pointsEarned;
        await storage.updateUserPoints(userId, newTotalPoints);

        const newPunchProgress = Math.min((user.punchCardProgress || 0) + 1, 10);
        await storage.updatePunchCard(userId, newPunchProgress);

        // Check for punch card completion
        if (newPunchProgress === 10) {
          await storage.createTransaction({
            userId,
            type: "bonus",
            points: 100,
            description: "Punch card completed - Free large drink",
          });
          await storage.updateUserPoints(userId, newTotalPoints + 100);
          await storage.updatePunchCard(userId, 0);
        }
      }

      res.json({ 
        success: true, 
        pointsEarned,
        message: `Earned ${pointsEarned} points!`
      });
    } catch (error) {
      console.error("Error processing QR purchase:", error);
      res.status(500).json({ message: "Failed to process purchase" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
