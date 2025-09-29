// Moma App Integration Service
// This service handles automatic data scraping and transaction matching

import { storage } from "./storage";

export interface MomaTransaction {
  id: string;
  machineId: string;
  cardNumber?: string;
  phoneNumber?: string;
  amount: number;
  productName: string;
  timestamp: Date;
  location?: string;
  paymentMethod?: string;
}

export class MomaIntegrationService {
  private apiKey: string;
  private baseUrl: string;
  private pollInterval: number = 30000; // 30 seconds
  private isPolling: boolean = false;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // Method 1: API Polling - Continuously check Moma API for new transactions
  async startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log("🔄 Starting Moma transaction polling...");

    while (this.isPolling) {
      try {
        await this.fetchAndProcessNewTransactions();
        await this.sleep(this.pollInterval);
      } catch (error) {
        console.error("❌ Error during polling:", error);
        await this.sleep(5000); // Wait 5 seconds before retry
      }
    }
  }

  stopPolling() {
    this.isPolling = false;
    console.log("⏹️ Stopped Moma transaction polling");
  }

  // Method 2: Webhook Handler - Process incoming webhook data from Moma
  async processWebhookData(webhookData: any): Promise<void> {
    try {
      console.log("📥 Processing webhook data from Moma...");
      
      const transactions = this.parseWebhookData(webhookData);
      
      for (const transaction of transactions) {
        await this.processTransaction(transaction);
      }
      
      console.log(`✅ Processed ${transactions.length} transactions from webhook`);
    } catch (error) {
      console.error("❌ Error processing webhook data:", error);
      throw error;
    }
  }

  // Method 3: Direct API Fetch - Get transactions from Moma API
  private async fetchAndProcessNewTransactions(): Promise<void> {
    try {
      // Check if API credentials are configured
      if (!this.apiKey || !this.baseUrl || this.baseUrl === "https://api.moma.app") {
        console.log("⏸️ Moma API not configured - skipping polling");
        return;
      }

      // Get the timestamp of the last processed transaction
      const lastProcessedTime = await this.getLastProcessedTimestamp();
      
      // Fetch new transactions from Moma API
      const response = await fetch(`${this.baseUrl}/api/transactions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        // Add query parameters for pagination and filtering
        // Note: You'll need to adjust these based on Moma's actual API
      });

      if (!response.ok) {
        throw new Error(`Moma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const transactions = this.parseMomaApiResponse(data);
      
      // Filter for only new transactions
      const newTransactions = transactions.filter(t => 
        new Date(t.timestamp) > lastProcessedTime
      );

      console.log(`📊 Found ${newTransactions.length} new transactions from Moma API`);

      for (const transaction of newTransactions) {
        await this.processTransaction(transaction);
      }

      if (newTransactions.length > 0) {
        await this.updateLastProcessedTimestamp(new Date());
      }

    } catch (error) {
      console.error("❌ Error fetching from Moma API:", error);
      // Don't throw error to prevent stopping the polling loop
      console.log("⏸️ Stopping polling due to API error");
      this.stopPolling();
    }
  }

  // Smart transaction processing with multiple matching strategies
  private async processTransaction(transaction: MomaTransaction): Promise<void> {
    try {
      console.log(`🔍 Processing transaction: ${transaction.id} - $${(transaction.amount / 100).toFixed(2)}`);

      // Strategy 1: Match by card number (most reliable)
      let matchedUser = null;
      if (transaction.cardNumber) {
        matchedUser = await storage.getUserByCardNumber(transaction.cardNumber);
        if (matchedUser) {
          console.log(`✅ Matched by card number: ${matchedUser.firstName} ${matchedUser.lastName}`);
        }
      }

      // Strategy 2: Match by phone number (backup method)
      if (!matchedUser && transaction.phoneNumber) {
        // You'll need to add this method to storage
        // matchedUser = await storage.getUserByPhoneNumber(transaction.phoneNumber);
      }

      // Strategy 3: Store as unprocessed for manual matching
      if (!matchedUser) {
        console.log(`⏳ No automatic match found, storing for manual processing`);
        await storage.processExternalTransaction({
          externalId: transaction.id,
          machineId: transaction.machineId,
          cardNumber: transaction.cardNumber,
          amount: transaction.amount,
          productName: transaction.productName,
          timestamp: transaction.timestamp,
        });
        return;
      }

      // Process the matched transaction
      await this.awardPointsAndCreateTransaction(matchedUser.id, transaction);

    } catch (error) {
      console.error(`❌ Error processing transaction ${transaction.id}:`, error);
      // Store as unprocessed for manual review
      await storage.processExternalTransaction({
        externalId: transaction.id,
        machineId: transaction.machineId,
        cardNumber: transaction.cardNumber,
        amount: transaction.amount,
        productName: transaction.productName,
        timestamp: transaction.timestamp,
      });
    }
  }

  // Award points and create transaction record
  private async awardPointsAndCreateTransaction(userId: string, momaTransaction: MomaTransaction): Promise<void> {
    try {
      // Calculate points (10 points per dollar spent)
      const pointsEarned = Math.floor(momaTransaction.amount / 100) * 10;
      
      // Create Hi-Vis loyalty transaction
      await storage.createTransaction({
        userId,
        type: "purchase",
        points: pointsEarned,
        description: `Auto-purchase: ${momaTransaction.productName} from ${momaTransaction.machineId}`,
        machineId: momaTransaction.machineId,
        externalTransactionId: momaTransaction.id,
        amount: momaTransaction.amount,
        cardNumber: momaTransaction.cardNumber,
        isAutoGenerated: true,
      });

      // Update user points
      const user = await storage.getUser(userId);
      if (user) {
        const newTotalPoints = (user.totalPoints || 0) + pointsEarned;
        await storage.updateUserPoints(userId, newTotalPoints);

        // Update punch card
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

        // Check for tier upgrades
        await this.checkAndUpdateUserTier(userId, newTotalPoints + (newPunchProgress === 10 ? 100 : 0));

        // Send notification to user
        await this.sendPointsEarnedNotification(userId, pointsEarned, momaTransaction.productName);
      }

      console.log(`✅ Awarded ${pointsEarned} points to user ${userId} for ${momaTransaction.productName}`);

    } catch (error) {
      console.error(`❌ Error awarding points for transaction ${momaTransaction.id}:`, error);
      throw error;
    }
  }

  // Check and update user loyalty tier based on points
  private async checkAndUpdateUserTier(userId: string, totalPoints: number): Promise<void> {
    let newTier = "apprentice";
    
    if (totalPoints >= 1000) {
      newTier = "foreman";
    } else if (totalPoints >= 500) {
      newTier = "tradie";
    }

    const user = await storage.getUser(userId);
    if (user && user.loyaltyTier !== newTier) {
      await storage.updateUserTier(userId, newTier);
      
      // Send tier upgrade notification
      await storage.createNotification({
        userId,
        title: "🏗️ Tier Upgrade!",
        message: `Congratulations! You've been promoted to ${newTier.toUpperCase()} tier. New rewards unlocked!`,
        type: "achievement",
      });
      
      console.log(`🎉 User ${userId} upgraded to ${newTier} tier with ${totalPoints} points`);
    }
  }

  // Send points earned notification
  private async sendPointsEarnedNotification(userId: string, points: number, productName: string): Promise<void> {
    try {
      await storage.createNotification({
        userId,
        title: "Points Earned! 🎯",
        message: `You earned ${points} points from your ${productName} purchase. Keep collecting for great rewards!`,
        type: "achievement",
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  // Parse webhook data from Moma app
  private parseWebhookData(webhookData: any): MomaTransaction[] {
    // This will depend on the format Moma sends
    // Example implementation:
    if (Array.isArray(webhookData.transactions)) {
      return webhookData.transactions.map(this.mapMomaTransaction);
    } else if (webhookData.transaction) {
      return [this.mapMomaTransaction(webhookData.transaction)];
    }
    return [];
  }

  // Parse API response from Moma
  private parseMomaApiResponse(apiResponse: any): MomaTransaction[] {
    // This will depend on Moma's API response format
    if (Array.isArray(apiResponse.data)) {
      return apiResponse.data.map(this.mapMomaTransaction);
    }
    return [];
  }

  // Map Moma transaction format to our internal format
  private mapMomaTransaction(momaData: any): MomaTransaction {
    return {
      id: momaData.id || momaData.transaction_id,
      machineId: momaData.machine_id || momaData.deviceId,
      cardNumber: momaData.card_number || momaData.cardNumber,
      phoneNumber: momaData.phone_number || momaData.phoneNumber,
      amount: momaData.amount_cents || (momaData.amount * 100),
      productName: momaData.product_name || momaData.productName || momaData.item,
      timestamp: new Date(momaData.timestamp || momaData.created_at),
      location: momaData.location,
      paymentMethod: momaData.payment_method || momaData.paymentType,
    };
  }

  // Utility methods for tracking last processed timestamp
  private async getLastProcessedTimestamp(): Promise<Date> {
    // You could store this in database or file system
    // For now, return 24 hours ago as default
    return new Date(Date.now() - 24 * 60 * 60 * 1000);
  }

  private async updateLastProcessedTimestamp(timestamp: Date): Promise<void> {
    // Store the timestamp for next polling cycle
    console.log(`📝 Updated last processed timestamp to: ${timestamp.toISOString()}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const momaIntegration = new MomaIntegrationService(
  process.env.MOMA_API_KEY || "",
  process.env.MOMA_API_URL || "https://api.moma.app"
);