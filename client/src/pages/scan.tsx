import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Scan() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scanMutation = useMutation({
    mutationFn: async (qrData: string) => {
      const response = await apiRequest("POST", "/api/qr/scan", { qrData });
      return response.json();
    },
    onSuccess: (data) => {
      setScanResult(data);
      setIsScanning(false);
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

        {/* Info Card */}
        <Card className="mb-6 border-orange-200">
          <CardContent className="p-6 text-center">
            <QrCode className="w-12 h-12 mx-auto mb-4 text-orange-600" />
            <h2 className="text-xl font-semibold mb-2">Looking for your personal QR code?</h2>
            <p className="text-gray-600 mb-4">
              Each customer now has their own unique QR code for instant promotions at vending machines.
            </p>
            <Link href="/my-code">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Go to My Code
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Legacy Scanner */}
        <Card className="border-orange-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Manual Points Entry</h3>
            <p className="text-gray-600 mb-4">
              Use this to manually add points for purchases (fallback method).
            </p>
            
            {!isScanning && !scanResult && (
              <Button 
                onClick={handleStartScan}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Start Manual Scanner
              </Button>
            )}
            
            {scanResult && (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">Points Added!</h3>
                <p className="text-gray-600">
                  You earned {scanResult.pointsEarned} points from your purchase.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}