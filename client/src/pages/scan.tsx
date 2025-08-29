import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAnimation } from "@/contexts/AnimationContext";

export default function Scan() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { showPointsGained, showTierUpgrade } = useAnimation();

  const scanMutation = useMutation({
    mutationFn: async (qrData: string) => {
      const response = await apiRequest("POST", "/api/qr/scan", { qrData });
      return response.json();
    },
    onSuccess: (data) => {
      setScanResult(data);
      setIsScanning(false);
      
      // Show points gained animation
      if (data.pointsEarned) {
        showPointsGained(data.pointsEarned);
      }
      
      // Check if user upgraded tier and show animation
      if (data.tierUpgrade) {
        setTimeout(() => {
          showTierUpgrade(data.tierUpgrade);
        }, 1500); // Delay tier animation after points animation
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      toast({
        title: "Success!",
        description: `Earned ${data.pointsEarned} points from your purchase!`,
      });
    },
    onError: (error) => {
      setIsScanning(false);
      toast({
        title: "Scan Failed",
        description: error.message || "Invalid QR code",
        variant: "destructive",
      });
    },
  });

  const handleScan = (data: string) => {
    if (data) {
      scanMutation.mutate(data);
    }
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setScanResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      {/* Header */}
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-6 pt-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="border-orange-200">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
            <p className="text-gray-600">Scan machine codes to earn points</p>
          </div>
        </div>

        {/* Redirect to My Code */}
        <Card className="border-orange-200">
          <CardContent className="p-6 text-center">
            <QrCode className="w-16 h-16 mx-auto mb-4 text-orange-600" />
            <h2 className="text-xl font-semibold mb-2">QR Scanner Moved</h2>
            <p className="text-gray-600 mb-4">
              The scanner feature has been replaced with personalized QR codes. Each customer now has their own unique code.
            </p>
            <Link href="/my-code">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Go to My Code
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Animation Demo Section */}
        <Card className="border-orange-200 mt-4">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-orange-800">Animation Demo</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => showPointsGained(25)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Demo: +25 Points Animation
              </Button>
              <Button 
                onClick={() => showTierUpgrade("tradie")}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Demo: Tier Upgrade (Tradie)
              </Button>
              <Button 
                onClick={() => showTierUpgrade("foreman")}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Demo: Tier Upgrade (Foreman)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}