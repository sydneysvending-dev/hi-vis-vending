import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { HardHat, Trophy, Medal, Award } from "lucide-react";

export default function Leaderboard() {
  const { user } = useAuth();

  // Mock leaderboard data for now - replace with real API call
  const { data: leaderboardData } = useQuery({
    queryKey: ["/api/leaderboard"],
    queryFn: () => Promise.resolve([
      { id: "1", name: "Jake Thompson", points: 2850, tier: "foreman", rank: 1 },
      { id: "2", name: "Sarah Miller", points: 2420, tier: "foreman", rank: 2 },
      { id: "3", name: "Mike Johnson", points: 1980, tier: "foreman", rank: 3 },
      { id: "4", name: "Lisa Chen", points: 1750, tier: "foreman", rank: 4 },
      { id: "5", name: "David Brown", points: 1650, tier: "foreman", rank: 5 },
      { id: "6", name: "Emma Wilson", points: 890, tier: "tradie", rank: 6 },
      { id: "7", name: "Tom Davis", points: 720, tier: "tradie", rank: 7 },
      { id: "8", name: "Kelly Smith", points: 640, tier: "tradie", rank: 8 },
      { id: "9", name: "Chris Lee", points: 580, tier: "tradie", rank: 9 },
      { id: "10", name: "Alex Turner", points: 450, tier: "apprentice", rank: 10 },
    ]),
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-slate-400 font-bold">#{rank}</span>;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "foreman": return "text-orange-400";
      case "tradie": return "text-yellow-400";
      case "apprentice": return "text-green-400";
      default: return "text-slate-400";
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case "foreman": return "Foreman";
      case "tradie": return "Tradie";
      case "apprentice": return "Apprentice";
      default: return "Apprentice";
    }
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
              <h1 className="text-white font-bold text-lg">Leaderboard</h1>
              <p className="text-yellow-400 text-xs font-medium">Top loyalty earners</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 pb-20">
        {/* Hero Section */}
        <div className="gradient-orange rounded-2xl p-6 text-slate-800 mb-6">
          <div className="text-center">
            <Trophy className="w-16 h-16 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">Top Performers</h2>
            <p className="text-lg opacity-90">See how you rank against other workers</p>
          </div>
        </div>

        {/* Current User Stats */}
        {user && (
          <Card className="bg-slate-700 border-slate-600 mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-white font-semibold mb-2">Your Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-orange-400">{user.totalPoints || 0}</p>
                    <p className="text-slate-400 text-sm">Points</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${getTierColor(user.loyaltyTier || 'apprentice')}`}>
                      {getTierName(user.loyaltyTier || 'apprentice')}
                    </p>
                    <p className="text-slate-400 text-sm">Tier</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">#?</p>
                    <p className="text-slate-400 text-sm">Rank</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <section>
          <h3 className="text-white text-lg font-semibold mb-4">Top 10 Workers</h3>
          <div className="space-y-3">
            {leaderboardData?.map((player) => (
              <Card key={player.id} className={`bg-slate-700 border-slate-600 ${
                player.rank <= 3 ? 'ring-2 ring-orange-500/20' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(player.rank)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{player.name}</p>
                        <p className={`text-sm ${getTierColor(player.tier)}`}>
                          {getTierName(player.tier)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-400">{player.points}</p>
                      <p className="text-slate-400 text-sm">points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}