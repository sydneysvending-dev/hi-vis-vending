import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardHat, Coffee, Cookie, Gift } from "lucide-react";

export default function Rewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rewards = [] } = useQuery({
    queryKey: ["/api/rewards"],
  });

  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const response = await apiRequest("POST", "/api/rewards/redeem", { rewardId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      toast({
        title: "Reward Redeemed!",
        description: "Your reward has been successfully redeemed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to redeem reward",
        variant: "destructive",
      });
    },
  });

  const getRewardIcon = (category: string) => {
    switch (category) {
      case 'drink':
        return <Coffee className="text-white w-6 h-6" />;
      case 'snack':
        return <Cookie className="text-white w-6 h-6" />;
      default:
        return <Gift className="text-white w-6 h-6" />;
    }
  };

  const getRewardColor = (category: string) => {
    switch (category) {
      case 'drink':
        return 'bg-blue-500';
      case 'snack':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const userPoints = user?.totalPoints || 0;

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
              <h1 className="text-white font-bold text-lg">Rewards</h1>
              <p className="text-yellow-400 text-xs font-medium">{userPoints} points available</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 pb-20">
        {/* Points Balance */}
        <div className="gradient-orange rounded-2xl p-6 text-slate-800 mb-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">{userPoints}</h2>
            <p className="text-lg opacity-90">Available Points</p>
          </div>
        </div>

        {/* Available Rewards */}
        <section>
          <h3 className="text-white text-lg font-semibold mb-4">Available Rewards</h3>
          
          {rewards.length === 0 ? (
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6 text-center">
                <Gift className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-300">No rewards available at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward: any) => {
                const canAfford = userPoints >= reward.pointsCost;
                const isRedeeming = redeemMutation.isPending;
                
                return (
                  <Card key={reward.id} className={`bg-slate-700 border-slate-600 ${!canAfford ? 'opacity-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${getRewardColor(reward.category)} rounded-full flex items-center justify-center`}>
                            {getRewardIcon(reward.category)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{reward.name}</p>
                            <p className="text-sm text-slate-400">{reward.pointsCost} points required</p>
                            {reward.description && (
                              <p className="text-xs text-slate-500 mt-1">{reward.description}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => redeemMutation.mutate(reward.id)}
                          disabled={!canAfford || isRedeeming}
                          className={`${
                            canAfford 
                              ? "bg-orange-500 hover:bg-orange-600 text-slate-800" 
                              : "bg-slate-600 text-slate-400 cursor-not-allowed"
                          } font-semibold px-4 py-2`}
                        >
                          {isRedeeming ? "Redeeming..." : canAfford ? "Redeem" : "Insufficient"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Redemption Tips */}
        <section className="mt-8">
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-3">How to earn more points:</h3>
              <ul className="text-slate-300 space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Scan QR codes at vending machines (+10 points)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span>Complete your punch card (+100 points)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Achieve higher loyalty tiers for bonuses</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
