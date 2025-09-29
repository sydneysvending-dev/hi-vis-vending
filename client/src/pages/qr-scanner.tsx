import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Scan, Gift, Zap, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { Link } from 'wouter';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  pointsBonus: number;
  tierRequired: string;
  type: 'discount' | 'bonus_points' | 'free_item';
}

export default function QRScanner() {
  const { user } = useAuth();
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [availableOffers, setAvailableOffers] = useState<Promotion[]>([]);

  useEffect(() => {
    // Load promotions based on user tier
    if (user) {
      loadPromotionsForTier(user.currentTier || 'Apprentice');
    }
  }, [user]);

  const loadPromotionsForTier = (tier: string) => {
    // Sample promotions based on tier
    const allPromotions: Promotion[] = [
      {
        id: 'promo-1',
        title: 'Apprentice Welcome',
        description: '10% off your next purchase',
        discount: 10,
        pointsBonus: 0,
        tierRequired: 'Apprentice',
        type: 'discount'
      },
      {
        id: 'promo-2',
        title: 'Tradie Power Hour',
        description: 'Double points on energy drinks',
        discount: 0,
        pointsBonus: 20,
        tierRequired: 'Tradie',
        type: 'bonus_points'
      },
      {
        id: 'promo-3',
        title: 'Foreman Special',
        description: 'Free large coffee with any purchase',
        discount: 0,
        pointsBonus: 0,
        tierRequired: 'Foreman',
        type: 'free_item'
      },
      {
        id: 'promo-4',
        title: 'Site Safety Bonus',
        description: '25 bonus points for healthy snacks',
        discount: 0,
        pointsBonus: 25,
        tierRequired: 'Apprentice',
        type: 'bonus_points'
      }
    ];

    // Filter promotions based on user tier
    const tierOrder = ['Apprentice', 'Tradie', 'Foreman'];
    const userTierIndex = tierOrder.indexOf(tier);
    
    const available = allPromotions.filter(promo => {
      const promoTierIndex = tierOrder.indexOf(promo.tierRequired);
      return promoTierIndex <= userTierIndex;
    });

    setAvailableOffers(available);
    setActivePromotions(available.slice(0, 2)); // Show 2 active promotions
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'discount': return <Gift className="w-4 h-4" />;
      case 'bonus_points': return <Zap className="w-4 h-4" />;
      case 'free_item': return <Star className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getPromotionColor = (type: string) => {
    switch (type) {
      case 'discount': return 'bg-green-600';
      case 'bonus_points': return 'bg-blue-600';
      case 'free_item': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'foreman': return 'text-yellow-400 bg-yellow-900/20 border-yellow-400';
      case 'tradie': return 'text-blue-400 bg-blue-900/20 border-blue-400';
      default: return 'text-green-400 bg-green-900/20 border-green-400';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="bg-slate-700 border-slate-600 max-w-md">
          <CardContent className="text-center p-6">
            <QrCode className="w-16 h-16 mx-auto text-orange-500 mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">Login Required</h3>
            <p className="text-slate-300 text-sm">Please log in to access your personal QR code.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-orange-500 hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">QR Code Scanner</h1>
              <p className="text-slate-400 text-sm">Unlock promotions at vending machines</p>
            </div>
          </div>
          <Badge className={`${getTierColor(user.currentTier || 'Apprentice')} border`}>
            {user.currentTier || 'Apprentice'}
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* User QR Code */}
        <QRCodeGenerator 
          userId={user.id}
          userTier={user.currentTier || 'Apprentice'}
          totalPoints={user.totalPoints || 0}
        />

        {/* Active Promotions */}
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Scan className="w-5 h-5 mr-2 text-orange-500" />
              Active Promotions Available
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePromotions.length > 0 ? (
              <div className="grid gap-4">
                {activePromotions.map((promo) => (
                  <div 
                    key={promo.id}
                    className="bg-slate-800 p-4 rounded-lg border border-slate-600 hover:border-orange-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`${getPromotionColor(promo.type)} text-white`}>
                            {getPromotionIcon(promo.type)}
                            <span className="ml-1">{promo.type.replace('_', ' ')}</span>
                          </Badge>
                          <Badge variant="outline" className="text-slate-300 border-slate-500">
                            {promo.tierRequired}+
                          </Badge>
                        </div>
                        <h4 className="text-white font-semibold">{promo.title}</h4>
                        <p className="text-slate-300 text-sm mt-1">{promo.description}</p>
                        
                        {promo.discount > 0 && (
                          <div className="mt-2 text-green-400 font-semibold">
                            {promo.discount}% OFF
                          </div>
                        )}
                        {promo.pointsBonus > 0 && (
                          <div className="mt-2 text-blue-400 font-semibold">
                            +{promo.pointsBonus} Bonus Points
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400">No active promotions available</p>
                <p className="text-slate-500 text-sm mt-2">Check back later for new offers!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">How QR Code Scanning Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">At the Vending Machine:</h4>
                <ol className="text-slate-300 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                    Find the "Scan QR Code" option on the Nayax DOT screen
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                    Hold your phone with this QR code up to the scanner
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                    Your promotions and discounts will be applied automatically
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                    Complete your purchase and earn bonus points
                  </li>
                </ol>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Benefits by Tier:</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge className="text-green-400 bg-green-900/20 border-green-400 border">
                      Apprentice
                    </Badge>
                    <span className="text-slate-300 text-sm">Basic promotions + 10% discounts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="text-blue-400 bg-blue-900/20 border-blue-400 border">
                      Tradie
                    </Badge>
                    <span className="text-slate-300 text-sm">Enhanced offers + double points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="text-yellow-400 bg-yellow-900/20 border-yellow-400 border">
                      Foreman
                    </Badge>
                    <span className="text-slate-300 text-sm">Premium deals + free items</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-100 border border-blue-400 p-4 rounded-lg">
              <p className="text-blue-800 text-sm font-semibold">
                💡 Pro Tip: Your QR code updates automatically with your current tier and points, 
                ensuring you always get the best available promotions!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}