import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Gift, Star } from "lucide-react";

interface DailyStreakTrackerProps {
  currentStreak: number;
  streakRewardEarned: boolean;
}

export default function DailyStreakTracker({ currentStreak, streakRewardEarned }: DailyStreakTrackerProps) {
  const targetStreak = 7;
  const streakDays = Array.from({ length: targetStreak }, (_, i) => i + 1);

  const getStreakIcon = (day: number) => {
    if (day <= currentStreak) {
      return <Flame className="w-6 h-6 text-orange-500" />;
    }
    return <Calendar className="w-6 h-6 text-slate-400" />;
  };

  const getStreakColor = (day: number) => {
    if (day <= currentStreak) {
      return "bg-orange-500/20 border-orange-500";
    }
    return "bg-slate-600 border-slate-500";
  };

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

        {/* Streak Progress */}
        <div className="flex justify-center gap-3 mb-4">
          {streakDays.map((day) => (
            <div
              key={day}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${getStreakColor(day)}`}
            >
              {getStreakIcon(day)}
            </div>
          ))}
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
              3-day streak complete! Free large drink reward pending.
            </p>
          )}
        </div>

        {/* Reward Info */}
        {!streakRewardEarned && (
          <div className="mt-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg p-3 border border-orange-500/20">
            <div className="flex items-center gap-2 text-orange-400">
              <Gift className="w-4 h-4" />
              <span className="text-xs font-medium">
                Purchase on 3 consecutive days to earn a FREE large drink!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}