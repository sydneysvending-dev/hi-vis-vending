import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardHat, Share2, Gift, Users, Copy, QrCode } from "lucide-react";

export default function Referral() {
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [showQR, setShowQR] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: myReferralData } = useQuery({
    queryKey: ["/api/referral/my-code"],
  });

  const useReferralMutation = useMutation({
    mutationFn: async (referralCode: string) => {
      const response = await apiRequest("POST", "/api/referral/use-code", { referralCode });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      toast({
        title: "Welcome Bonus!",
        description: `You earned ${data.pointsEarned} points for using a referral code!`,
      });
      setReferralCodeInput("");
    },
    onError: (error) => {
      toast({
        title: "Invalid Code",
        description: error.message || "This referral code is not valid",
        variant: "destructive",
      });
    },
  });

  const handleUseReferralCode = () => {
    if (!referralCodeInput.trim()) return;
    useReferralMutation.mutate(referralCodeInput.trim().toUpperCase());
  };

  const copyReferralCode = () => {
    if (myReferralData?.referralCode) {
      navigator.clipboard.writeText(myReferralData.referralCode);
      toast({
        title: "Copied!",
        description: "Your referral code has been copied to clipboard",
      });
    }
  };

  const shareReferralCode = () => {
    if (myReferralData?.referralCode) {
      const message = `Join Hi-Vis Vending loyalty program with my code ${myReferralData.referralCode} and get 25 free points! 🏗️`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Join Hi-Vis Vending',
          text: message,
          url: window.location.origin
        });
      } else {
        // Fallback for browsers without Web Share API
        navigator.clipboard.writeText(message);
        toast({
          title: "Copied!",
          description: "Referral message copied to clipboard",
        });
      }
    }
  };

  const myReferralCode = myReferralData?.referralCode;
  const hasUsedReferral = user?.referredBy;

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
              <h1 className="text-white font-bold text-lg">Refer-a-Mate</h1>
              <p className="text-yellow-400 text-xs font-medium">Share the rewards with your crew</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 pb-20">
        {/* Hero Section */}
        <div className="gradient-orange rounded-2xl p-6 text-slate-800 mb-6">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">Bring Your Mates!</h2>
            <p className="text-lg opacity-90">Share your code, earn together</p>
          </div>
        </div>

        {/* How it Works */}
        <section className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-4">How It Works:</h3>
          <div className="space-y-3">
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-slate-800 font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white">Share your code</p>
                  <p className="text-sm text-slate-400">Send your unique code to workmates</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-slate-800 font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white">They join & earn</p>
                  <p className="text-sm text-slate-400">New mate gets 25 welcome points</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-white">You get rewarded</p>
                  <p className="text-sm text-slate-400">Earn 50 points for each referral</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* My Referral Code */}
        <section className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-4">Your Referral Code</h3>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="safety-stripes w-16 h-4 rounded mx-auto mb-4"></div>
                <div className="text-4xl font-bold text-slate-800 mb-2 tracking-wider">
                  {myReferralCode || "LOADING..."}
                </div>
                <p className="text-slate-600 mb-4">Share this code with your workmates</p>
                
                <div className="flex space-x-2 justify-center">
                  <Button
                    onClick={copyReferralCode}
                    disabled={!myReferralCode}
                    className="bg-orange-500 hover:bg-orange-600 text-slate-800"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  
                  <Button
                    onClick={shareReferralCode}
                    disabled={!myReferralCode}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-800"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                
                <div className="mt-4">
                  <Button
                    onClick={() => setShowQR(!showQR)}
                    variant="outline"
                    className="text-slate-600 border-slate-300"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {showQR ? "Hide" : "Show"} QR Code
                  </Button>
                </div>

                {showQR && myReferralCode && (
                  <div className="mt-4 p-4 bg-slate-100 rounded-lg">
                    <div className="w-32 h-32 bg-slate-300 rounded-lg mx-auto flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-slate-600" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Scan to join with code {myReferralCode}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Use Referral Code */}
        {!hasUsedReferral && (
          <section className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-4">Got a Mate's Code?</h3>
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="referralCode" className="text-white">
                      Enter Referral Code
                    </Label>
                    <Input
                      id="referralCode"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                      placeholder="Enter 6-character code"
                      maxLength={6}
                      className="mt-1 bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  
                  <Button
                    onClick={handleUseReferralCode}
                    disabled={!referralCodeInput.trim() || useReferralMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {useReferralMutation.isPending ? "Checking..." : "Use Code & Get 25 Points"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {hasUsedReferral && (
          <section className="mb-6">
            <Card className="bg-green-600 border-green-500">
              <CardContent className="p-6 text-center">
                <Gift className="w-12 h-12 text-white mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Welcome Bonus Claimed!</h3>
                <p className="text-green-100">You've already used a referral code and earned your welcome points.</p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Referral Stats - Moved to Bottom */}
        <section>
          <h3 className="text-white text-lg font-semibold mb-4">Your Referrals</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-orange-500">{user?.referralCount || 0}</p>
                <p className="text-slate-300">Mates Referred</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{(user?.referralCount || 0) * 50}</p>
                <p className="text-slate-300">Bonus Points</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}