import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Gift, Image as ImageIcon } from "lucide-react";
import { AppExclusiveReward } from "@shared/schema";

interface AppExclusiveRewardsProps {
  rewards: AppExclusiveReward[];
  onRedeem?: (rewardId: string) => void;
}

export default function AppExclusiveRewards({ rewards, onRedeem }: AppExclusiveRewardsProps) {
  if (!rewards || rewards.length === 0) {
    return null;
  }

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Expires soon';
  };

  return (
    <section className="px-6 py-4">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-400" />
        <h3 className="text-white text-lg font-semibold">App Exclusive Rewards</h3>
        <Badge className="bg-yellow-400 text-slate-800 text-xs font-bold">EXCLUSIVE</Badge>
      </div>
      
      <div className="space-y-3">
        {rewards.map((reward) => (
          <Card key={reward.id} className="bg-white border border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {reward.imageUrl ? (
                    <img 
                      src={reward.imageUrl} 
                      alt={reward.title}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLDivElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full ${reward.imageUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                    <Gift className="w-6 h-6 text-orange-500" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-slate-800 font-bold text-base">{reward.title}</h4>
                      <p className="text-slate-600 text-sm font-medium">{reward.description}</p>
                    </div>
                    {reward.isLimitedTime && reward.expiresAt && (
                      <Badge variant="outline" className="border-red-400 text-red-400 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeRemaining(reward.expiresAt)}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-orange-600 font-bold text-base">
                        {reward.pointsCost} points
                      </div>
                      {reward.originalPrice && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs line-through">
                            {reward.originalPrice}
                          </span>
                          {reward.savingsText && (
                            <span className="text-green-600 text-xs font-semibold">
                              {reward.savingsText}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <Button 
                      size="sm" 
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                      onClick={() => onRedeem?.(reward.id)}
                    >
                      Redeem Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}