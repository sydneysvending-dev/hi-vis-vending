import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardHat, Trophy, Medal, Award, MapPin, Users } from "lucide-react";
import { useState } from "react";

type LeaderboardUser = {
  id: string;
  firstName: string;
  lastName: string;
  totalPoints: number;
  loyaltyTier: string;
  suburb: string;
  rank: number;
};

type SuburbLeaderboard = {
  suburb: string;
  users: LeaderboardUser[];
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [selectedSuburb, setSelectedSuburb] = useState<string | null>(null);

  const { data: leaderboardData } = useQuery<SuburbLeaderboard[]>({
    queryKey: ["/api/leaderboard"],
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
                <h3 className="text-white font-semibold mb-2">Your Stats - {user.suburb || 'No Suburb'}</h3>
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
                    {(() => {
                      const userSuburbData = leaderboardData?.find(s => s.suburb === user.suburb);
                      const userRank = userSuburbData?.users.find(u => u.id === user.id)?.rank;
                      return (
                        <>
                          <p className="text-2xl font-bold text-yellow-400">#{userRank || '?'}</p>
                          <p className="text-slate-400 text-sm">Rank in {user.suburb}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suburb Selector */}
        {leaderboardData && leaderboardData.length > 0 && (
          <section className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Choose Suburb
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                onClick={() => setSelectedSuburb(null)}
                variant={selectedSuburb === null ? "default" : "outline"}
                className={selectedSuburb === null ? 
                  "bg-orange-600 hover:bg-orange-700 text-white" : 
                  "bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                }
              >
                All Suburbs
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {leaderboardData.map((suburbData) => (
                <Button
                  key={suburbData.suburb}
                  onClick={() => setSelectedSuburb(suburbData.suburb)}
                  variant={selectedSuburb === suburbData.suburb ? "default" : "outline"}
                  className={selectedSuburb === suburbData.suburb ? 
                    "bg-orange-600 hover:bg-orange-700 text-white" : 
                    "bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                  }
                >
                  <div className="text-left">
                    <p className="font-semibold">{suburbData.suburb}</p>
                    <p className="text-xs opacity-75">{suburbData.users.length} workers</p>
                  </div>
                </Button>
              ))}
            </div>
          </section>
        )}

        {/* Leaderboard Display */}
        <section>
          {selectedSuburb ? (
            <>
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                {selectedSuburb} Leaderboard
              </h3>
              {(() => {
                const suburbData = leaderboardData?.find(s => s.suburb === selectedSuburb);
                return suburbData?.users.map((player) => (
                  <Card key={player.id} className={`bg-slate-700 border-slate-600 mb-3 ${
                    player.rank <= 3 ? 'ring-2 ring-orange-500/20' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(player.rank)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {player.firstName} {player.lastName}
                            </p>
                            <p className={`text-sm ${getTierColor(player.loyaltyTier)}`}>
                              {getTierName(player.loyaltyTier)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-400">{player.totalPoints}</p>
                          <p className="text-slate-400 text-sm">points</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </>
          ) : (
            <>
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                All Suburbs Overview
              </h3>
              {leaderboardData?.map((suburbData) => (
                <Card key={suburbData.suburb} className="bg-slate-700 border-slate-600 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-semibold text-lg">{suburbData.suburb}</h4>
                      <p className="text-slate-400">{suburbData.users.length} workers</p>
                    </div>
                    <div className="space-y-2">
                      {suburbData.users.slice(0, 3).map((player) => (
                        <div key={player.id} className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8">
                              {getRankIcon(player.rank)}
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm">
                                {player.firstName} {player.lastName}
                              </p>
                              <p className={`text-xs ${getTierColor(player.loyaltyTier)}`}>
                                {getTierName(player.loyaltyTier)}
                              </p>
                            </div>
                          </div>
                          <p className="text-orange-400 font-bold">{player.totalPoints}</p>
                        </div>
                      ))}
                      {suburbData.users.length > 3 && (
                        <p className="text-slate-400 text-sm text-center">
                          +{suburbData.users.length - 3} more workers
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </section>
      </main>

      <Navigation />
    </div>
  );
}