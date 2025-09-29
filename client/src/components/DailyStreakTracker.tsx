import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Gift, Star } from "lucide-react";

interface DailyStreakTrackerProps {
  currentStreak: number;
  streakRewardEarned: boolean;
}

export default function DailyStreakTracker({ currentStreak, streakRewardEarned }: DailyStreakTrackerProps) {
  const targetStreak = 7;
  const progressPercentage = Math.min((currentStreak / targetStreak) * 100, 100);

  return (
    <Card className="bg-slate-700 border-slate-600">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="text-white font-semibold">Daily Streak</h3>
          </div>
          {streakRewardEarned ? (
            <Badge className="bg-green-500 hover:bg-green-600">
              <Star className="w-3 h-3 mr-1" />
              Reward Earned!
            </Badge>
          ) : (
            <Badge variant="outline" className="border-orange-500 text-orange-500">
              {currentStreak}/{targetStreak} days
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Progress</span>
            <span className="text-orange-400 font-medium">{currentStreak}/{targetStreak} days</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-slate-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Start</span>
            <span>Free Large Drink</span>
          </div>
        </div>

        {/* Progress Description */}
        <div className="text-center">
          {currentStreak === 0 ? (
            <p className="text-slate-300 text-sm">
              Make a purchase today to start your streak!
            </p>
          ) : currentStreak < targetStreak ? (
            <p className="text-slate-300 text-sm">
              {targetStreak - currentStreak} more day{targetStreak - currentStreak !== 1 ? 's' : ''} for a <span className="text-orange-400 font-semibold">free large drink</span>!
            </p>
          ) : streakRewardEarned ? (
            <p className="text-green-400 text-sm font-medium">
              🎉 You've earned a free large drink! Check your rewards.
            </p>
          ) : (
            <p className="text-orange-400 text-sm font-medium">
              7-day streak complete! Free large drink reward pending.
            </p>
          )}
        </div>

        {/* Reward Info */}
        {!streakRewardEarned && (
          <div className="mt-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg p-3 border border-orange-500/20">
            <div className="flex items-center gap-2 text-orange-400">
              <Gift className="w-4 h-4" />
              <span className="text-xs font-medium">
                Purchase on 7 consecutive days to earn a FREE large drink!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}