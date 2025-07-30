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
        const newPoints = user.totalPoints + points;
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

      const users = await storage.getRecentUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch admin users" });
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
        const newPoints = user.totalPoints + 10;
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

  const httpServer = createServer(app);
  return httpServer;
}
