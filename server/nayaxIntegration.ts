// Nayax DOT Integration for QR Code Scanning and Real-time Promotions
import { storage } from './storage';

interface NayaxPromotion {
  promotionId: string;
  discountPercentage?: number;
  freeItemCode?: string;
  description: string;
}

interface NayaxResponse {
  success: boolean;
  transactionId?: string;
  promotionApplied?: NayaxPromotion;
  message: string;
}

interface QRCodeData {
  userId: string;
  timestamp: number;
  tier: string;
  points: number;
  type: string;
  token: string;
}

export class NayaxIntegration {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // In production, these would come from environment variables
    this.baseUrl = process.env.NAYAX_API_URL || 'https://api.nayax.com/v2';
    this.apiKey = process.env.NAYAX_API_KEY || 'demo-api-key';
  }

  // Validate QR code and determine applicable promotions
  async validateQRCode(qrData: string, machineId?: string): Promise<{
    isValid: boolean;
    user?: any;
    promotions: any[];
    pointsBonus: number;
    discountPercentage: number;
    message: string;
  }> {
    try {
      // Parse QR code data
      const qrCodeData: QRCodeData = JSON.parse(qrData);
      
      // Basic validation
      if (qrCodeData.type !== 'hi-vis-customer') {
        return {
          isValid: false,
          promotions: [],
          pointsBonus: 0,
          discountPercentage: 0,
          message: 'Invalid QR code type'
        };
      }

      // Check timestamp (QR codes expire after 24 hours)
      const now = Date.now();
      const qrAge = now - qrCodeData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (qrAge > maxAge) {
        return {
          isValid: false,
          promotions: [],
          pointsBonus: 0,
          discountPercentage: 0,
          message: 'QR code has expired. Please generate a new one.'
        };
      }

      // Get user from database
      const user = await storage.getUser(qrCodeData.userId);
      if (!user) {
        return {
          isValid: false,
          promotions: [],
          pointsBonus: 0,
          discountPercentage: 0,
          message: 'User not found'
        };
      }

      // Get available promotions for user's tier
      const promotions = await this.getPromotionsForTier(user.currentTier || 'Apprentice');
      
      // Calculate benefits
      let totalPointsBonus = 0;
      let maxDiscountPercentage = 0;

      for (const promo of promotions) {
        if (promo.bonusPoints) {
          totalPointsBonus += promo.bonusPoints;
        }
        if (promo.discountPercentage && promo.discountPercentage > maxDiscountPercentage) {
          maxDiscountPercentage = promo.discountPercentage;
        }
      }

      return {
        isValid: true,
        user,
        promotions,
        pointsBonus: totalPointsBonus,
        discountPercentage: maxDiscountPercentage,
        message: `Welcome ${user.firstName || 'Hi-Vis Customer'}! ${promotions.length} promotions available.`
      };

    } catch (error) {
      console.error('QR code validation error:', error);
      return {
        isValid: false,
        promotions: [],
        pointsBonus: 0,
        discountPercentage: 0,
        message: 'Invalid QR code format'
      };
    }
  }

  // Get promotions available for a specific tier
  private async getPromotionsForTier(tier: string): Promise<any[]> {
    // Sample promotions - in production these would come from database
    const allPromotions = [
      {
        id: 'promo-1',
        name: 'Apprentice Welcome',
        description: '10% off your next purchase',
        discountPercentage: 10,
        bonusPoints: 0,
        tierRequired: 'Apprentice',
        type: 'discount'
      },
      {
        id: 'promo-2',
        name: 'Site Safety Bonus',
        description: '25 bonus points for healthy snacks',
        discountPercentage: 0,
        bonusPoints: 25,
        tierRequired: 'Apprentice',
        type: 'bonus_points'
      },
      {
        id: 'promo-3',
        name: 'Tradie Power Hour',
        description: 'Double points on energy drinks',
        discountPercentage: 0,
        bonusPoints: 20,
        tierRequired: 'Tradie',
        type: 'bonus_points'
      },
      {
        id: 'promo-4',
        name: 'Tradie Special',
        description: '15% off all beverages',
        discountPercentage: 15,
        bonusPoints: 0,
        tierRequired: 'Tradie',
        type: 'discount'
      },
      {
        id: 'promo-5',
        name: 'Foreman Special',
        description: 'Free large coffee with any purchase',
        discountPercentage: 0,
        bonusPoints: 0,
        tierRequired: 'Foreman',
        type: 'free_item',
        freeItemCode: 'COFFEE_LARGE'
      },
      {
        id: 'promo-6',
        name: 'Foreman Premium',
        description: '20% off + 50 bonus points',
        discountPercentage: 20,
        bonusPoints: 50,
        tierRequired: 'Foreman',
        type: 'combo'
      }
    ];

    // Filter promotions based on tier hierarchy
    const tierOrder = ['Apprentice', 'Tradie', 'Foreman'];
    const userTierIndex = tierOrder.indexOf(tier);
    
    return allPromotions.filter(promo => {
      const promoTierIndex = tierOrder.indexOf(promo.tierRequired);
      return promoTierIndex <= userTierIndex;
    });
  }

  // Send promotion to Nayax DOT vending machine
  async pushPromotionToMachine(machineId: string, promotion: any): Promise<NayaxResponse> {
    try {
      // In production, this would make a real API call to Nayax
      const nayaxPayload = {
        machineId,
        promotionType: promotion.type,
        discountPercentage: promotion.discountPercentage || 0,
        freeItemCode: promotion.freeItemCode,
        description: promotion.description,
        validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      };

      console.log('Sending promotion to Nayax DOT:', nayaxPayload);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate success response
      return {
        success: true,
        transactionId: `NAYAX-${Date.now()}`,
        promotionApplied: {
          promotionId: promotion.id,
          discountPercentage: promotion.discountPercentage,
          freeItemCode: promotion.freeItemCode,
          description: promotion.description,
        },
        message: 'Promotion successfully applied to vending machine'
      };

    } catch (error) {
      console.error('Error pushing promotion to Nayax:', error);
      return {
        success: false,
        message: 'Failed to apply promotion to vending machine'
      };
    }
  }

  // Record QR scan in database
  async recordQRScan(
    userId: string,
    machineId: string | undefined,
    qrData: string,
    promotions: any[],
    pointsAwarded: number,
    discountApplied: number
  ): Promise<void> {
    try {
      await storage.createQRScan({
        userId,
        machineId: machineId || 'unknown',
        qrData,
        promotionApplied: promotions.map(p => p.name).join(', '),
        pointsAwarded,
        discountApplied,
        status: 'completed'
      });

      // Also create a transaction record for points
      if (pointsAwarded > 0) {
        await storage.createTransaction({
          userId,
          type: 'bonus',
          points: pointsAwarded,
          description: `QR Code Bonus: ${promotions.map(p => p.name).join(', ')}`,
          machineId: machineId || 'QR-SCAN',
        });

        // Update user's total points
        const user = await storage.getUser(userId);
        if (user) {
          const newTotalPoints = (user.totalPoints || 0) + pointsAwarded;
          await storage.updateUserPoints(userId, newTotalPoints);
        }
      }

    } catch (error) {
      console.error('Error recording QR scan:', error);
    }
  }

  // Get QR scan history for analytics
  async getQRScanHistory(userId?: string, machineId?: string, limit: number = 50): Promise<any[]> {
    try {
      return await storage.getQRScans(userId, machineId, limit);
    } catch (error) {
      console.error('Error fetching QR scan history:', error);
      return [];
    }
  }
}

export const nayaxIntegration = new NayaxIntegration();