import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, QrCode, Gift, Zap, Crown, Copy, RefreshCw, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

// QR Code Generator Component
function QRCodeGenerator({ data }: { data: string }) {
  const size = 280;
  const qrValue = encodeURIComponent(data);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrValue}&bgcolor=ffffff&color=ea580c&format=png&margin=15&ecc=H`;
  
  return (
    <div className="flex justify-center p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200 shadow-lg">
      <img 
        src={qrUrl} 
        alt="Your Personal Hi-Vis QR Code" 
        width={size} 
        height={size}
        className="rounded-lg shadow-md"
      />
    </div>
  );
}

function TierBadge({ tier, points }: { tier: string; points: number }) {
  const getTierIcon = () => {
    switch (tier) {
      case 'Foreman': return <Crown className="w-5 h-5" />;
      case 'Tradie': return <Zap className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const getTierColor = () => {
    switch (tier) {
      case 'Foreman': return 'bg-yellow-500 text-yellow-900';
      case 'Tradie': return 'bg-orange-500 text-orange-900';
      default: return 'bg-green-500 text-green-900';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${getTierColor()}`}>
      {getTierIcon()}
      {tier} • {points} pts
    </div>
  );
}

export default function MyCode() {
  const { user } = useAuth() as { user: User | null };
  const { toast } = useToast();
  const [qrData, setQrData] = useState<string>("");
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  // Generate QR code data
  const generateQRData = () => {
    if (!user) return "";

    const qrPayload = {
      userId: user.id,
      timestamp: Date.now(),
      tier: (user as any).currentTier || 'Apprentice',
      points: (user as any).totalPoints || 0,
      type: 'hi-vis-customer',
      token: Math.random().toString(36).substring(2, 15)
    };

    return JSON.stringify(qrPayload);
  };

  // Auto-generate QR code when component mounts or user changes
  useEffect(() => {
    if (user) {
      const newQrData = generateQRData();
      setQrData(newQrData);
      setLastGenerated(new Date());
    }
  }, [user]);

  // Manual refresh function
  const refreshQRCode = () => {
    const newQrData = generateQRData();
    setQrData(newQrData);
    setLastGenerated(new Date());
    toast({
      title: "QR Code Refreshed",
      description: "Your personal QR code has been updated with current tier and points.",
    });
  };

  // Copy QR data to clipboard
  const copyQRData = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      toast({
        title: "Copied!",
        description: "QR code data copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Get promotion benefits based on tier
  const getPromotionBenefits = (tier: string) => {
    const benefits: Record<string, string[]> = {
      'Apprentice': [
        '🎯 10% discount on any purchase',
        '🥗 25 bonus points for healthy snacks',
        '🆕 Welcome promotions'
      ],
      'Tradie': [
        '⚡ Double points on energy drinks',
        '🥤 15% off all beverages',
        '💪 Enhanced tier promotions',
        '✅ All Apprentice benefits'
      ],
      'Foreman': [
        '☕ Free large coffee with any purchase',
        '🏆 20% off + 50 bonus points combo',
        '👑 Premium exclusive offers',
        '✅ All Tradie & Apprentice benefits'
      ]
    };
    return benefits[tier] || benefits['Apprentice'];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardContent className="p-6 text-center">
              <QrCode className="w-12 h-12 mx-auto mb-4 text-orange-600" />
              <p>Loading your personal QR code...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const benefits = getPromotionBenefits((user as any)?.currentTier || 'Apprentice');
  const timeUntilExpiry = lastGenerated ? new Date(lastGenerated.getTime() + 24 * 60 * 60 * 1000) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <div className="max-w-lg mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My QR Code</h1>
          <p className="text-gray-600">Show this code at any Hi-Vis vending machine</p>
        </div>

        {/* User Info & Tier */}
        <Card className="border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Hey {(user as any)?.firstName || 'Hi-Vis Customer'}! 👋
              </h2>
              <TierBadge tier={(user as any)?.currentTier || 'Apprentice'} points={(user as any)?.totalPoints || 0} />
            </div>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <Card className="border-orange-200">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <QrCode className="w-6 h-6 text-orange-600" />
              Your Personal QR Code
            </CardTitle>
            <CardDescription>
              Scan this at vending machines for instant promotions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrData && <QRCodeGenerator data={qrData} />}
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={refreshQRCode}
                variant="outline" 
                className="flex-1 border-orange-200 hover:bg-orange-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={copyQRData}
                variant="outline"
                className="flex-1 border-orange-200 hover:bg-orange-50"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Data
              </Button>
            </div>

            {/* Security Info */}
            {timeUntilExpiry && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Expires: {timeUntilExpiry.toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Promotions */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg text-orange-700">
              🎁 Your Available Promotions
            </CardTitle>
            <CardDescription>
              Benefits you'll get when scanning at vending machines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-gray-700">{benefit}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg text-orange-700">
              📱 How to Use Your QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                <span>Approach any Hi-Vis vending machine</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                <span>Select "Scan QR Code" on the machine screen</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                <span>Hold your phone with this QR code up to the scanner</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                <span>Your promotions will be applied automatically!</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-semibold">5</span>
                <span>Complete your purchase and earn bonus points</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Safety Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Security Note</h4>
              <p className="text-sm text-yellow-700">
                Your QR code is unique to you and expires every 24 hours for security. 
                Never share your QR code with others.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}