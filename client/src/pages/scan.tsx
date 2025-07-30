import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import QRScanner from "@/components/QRScanner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardHat, QrCode, CheckCircle } from "lucide-react";

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
    <div className="min-h-screen bg-slate-800">
      {/* Header */}
      <header className="bg-slate-800 border-b-4 border-orange-500 sticky top-0 z-50">
        <div className="flex items-center justify-center px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <HardHat className="text-slate-800 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Scan QR Code</h1>
              <p className="text-yellow-400 text-xs font-medium">Earn points with every purchase</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 pb-20">
        {!isScanning && !scanResult && (
          <div className="text-center space-y-6">
            <div className="gradient-orange rounded-2xl p-8 text-slate-800">
              <QrCode className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Ready to Scan</h2>
              <p className="text-lg opacity-90">Point your camera at the vending machine QR code</p>
            </div>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-3">How it works:</h3>
                <ol className="text-slate-300 space-y-2 text-left">
                  <li className="flex items-start space-x-2">
                    <span className="bg-orange-500 text-slate-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Tap "Start Scanning" below</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-orange-500 text-slate-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                    <span>Point camera at machine QR code</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-orange-500 text-slate-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                    <span>Earn 10 points automatically</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Button 
              onClick={handleStartScan}
              className="w-full bg-orange-500 hover:bg-orange-600 text-slate-800 font-bold py-4 text-lg"
            >
              Start Scanning
            </Button>
          </div>
        )}

        {isScanning && (
          <QRScanner 
            onScan={handleScan}
            onClose={() => setIsScanning(false)}
            isLoading={scanMutation.isPending}
          />
        )}

        {scanResult && (
          <div className="text-center space-y-6">
            <div className="bg-green-600 rounded-2xl p-8 text-white">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Scan Successful!</h2>
              <p className="text-lg opacity-90">You earned {scanResult.pointsEarned} points</p>
            </div>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-3">Transaction Details:</h3>
                <div className="text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Points Earned:</span>
                    <span className="text-green-400 font-semibold">+{scanResult.pointsEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => setScanResult(null)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-slate-800 font-bold py-3"
            >
              Scan Another Code
            </Button>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
