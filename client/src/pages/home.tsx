import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import LoyaltyProgress from "@/components/LoyaltyProgress";
import PunchCard from "@/components/PunchCard";
import DailyStreakTracker from "@/components/DailyStreakTracker";
import PhotoReel from "@/components/PhotoReel";
import AppExclusiveRewards from "@/components/AppExclusiveRewards";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Gift, HardHat, Bell, Users, Copy, Share2 } from "lucide-react";
import { Link } from "wouter";
import { capitalizeName } from "@/lib/utils";
import { PhotoReelItem, AppExclusiveReward } from "@shared/schema";

export default function Home() {
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions } = useQuery({
    queryKey: ["/api/user/transactions"],
    enabled: isAuthenticated,
  });

  const { data: myReferralData } = useQuery({
    queryKey: ["/api/referral/my-code"],
    enabled: isAuthenticated,
  });

  const { data: photoReelItems } = useQuery<PhotoReelItem[]>({
    queryKey: ["/api/content/photo-reel"],
    enabled: isAuthenticated,
    staleTime: 0, // Force refresh
  });

  const { data: appExclusiveRewards } = useQuery<AppExclusiveReward[]>({
    queryKey: ["/api/content/app-exclusive-rewards"],
    enabled: isAuthenticated,
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <HardHat className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-pulse" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const getTierName = (tier: string) => {
    switch (tier) {
      case "apprentice": return "Apprentice";
      case "tradie": return "Tradie";
      case "foreman": return "Foreman";
      default: return "Apprentice";
    }
  };

  const getNextTierPoints = (tier: string, currentPoints: number) => {
    switch (tier) {
      case "apprentice": return 500 - currentPoints;
      case "tradie": return 1000 - currentPoints;
      default: return 0;
    }
  };

  const recentTransactions = transactions?.slice(0, 3) || [];

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
        navigator.clipboard.writeText(message);
        toast({
          title: "Copied!",
          description: "Referral message copied to clipboard",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Header */}
      <header className="bg-slate-800 border-b-4 border-orange-500 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <HardHat className="text-slate-800 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">HI-VIS</h1>
              <p className="text-yellow-400 text-xs font-medium">VENDING</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <Link href="/profile">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-400 transition-colors">
                <span className="text-slate-800 font-bold text-sm">
                  {(user.firstName?.[0] || 'U').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* Hero Section */}
        <section className="gradient-orange p-6 text-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                {user.firstName ? `${capitalizeName(user.firstName)} ${capitalizeName(user.lastName || '')}` : 'Welcome'}
              </h2>
              <p className="text-lg opacity-90">Welcome back, {getTierName(user.loyaltyTier || 'apprentice')}!</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{user.totalPoints || 0}</p>
              <p className="text-sm opacity-90">Points</p>
            </div>
          </div>
          
          <LoyaltyProgress 
            tier={user.loyaltyTier || 'apprentice'}
            points={user.totalPoints || 0}
          />
        </section>

        {/* Photo Reel Section */}
        {photoReelItems && photoReelItems.length > 0 && (
          <PhotoReel items={photoReelItems} />
        )}

        {/* App Exclusive Rewards Section */}
        {appExclusiveRewards && appExclusiveRewards.length > 0 && (
          <AppExclusiveRewards 
            rewards={appExclusiveRewards} 
            onRedeem={(rewardId) => {
              // Handle reward redemption
              toast({
                title: "Reward Redemption",
                description: "Coming soon! Visit the rewards tab to redeem.",
              });
            }}
          />
        )}

        {/* Daily Streak Tracker */}
        <section className="px-6 py-6">
          <DailyStreakTracker 
            currentStreak={user.currentStreak || 0}
            streakRewardEarned={user.streakRewardEarned || false}
          />
        </section>

        {/* Punch Card */}
        <section className="px-6 py-4">
          <PunchCard progress={user.punchCardProgress || 0} />
        </section>



        {/* Recent Activity */}
        {recentTransactions.length > 0 && (
          <section className="px-6 py-4">
            <h3 className="text-white text-lg font-semibold mb-4">Recent Activity</h3>
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-0">
                {recentTransactions.map((transaction, index) => (
                  <div key={transaction.id} className={`p-4 flex items-center justify-between ${
                    index < recentTransactions.length - 1 ? 'border-b border-slate-600' : ''
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'purchase' ? 'bg-green-100' :
                        transaction.type === 'redemption' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <span className={`text-sm font-bold ${
                          transaction.type === 'purchase' ? 'text-green-600' :
                          transaction.type === 'redemption' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {transaction.type === 'purchase' ? '+' : 
                           transaction.type === 'redemption' ? '−' : '★'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white capitalize">{transaction.type}</p>
                        <p className="text-sm text-slate-400">
                          {new Date(transaction.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.points > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                      </p>
                      <p className="text-sm text-slate-400">{transaction.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}


      </main>

      <Navigation />
    </div>
  );
}
