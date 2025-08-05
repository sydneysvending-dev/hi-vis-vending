import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { HardHat, Trophy, Medal, Award, MapPin } from "lucide-react";

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

  const { data: leaderboardData } = useQuery<SuburbLeaderboard[]>({
    queryKey: ["/api/leaderboard"],
  });

  // Get the user's suburb leaderboard
  const userSuburbData = leaderboardData?.find(s => s.suburb === user?.suburb);

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
              <h1 className="text-white font-bold text-lg">Monthly Leaderboard</h1>
              <p className="text-yellow-400 text-xs font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Season</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 pb-20">


        {/* Monthly Prizes Section */}
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 mb-6">
          <CardContent className="p-6">
            <div className="text-center text-slate-800">
              <Award className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-4">Monthly Prizes</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <p className="font-bold text-lg">1st Place</p>
                  <p className="text-sm">3 Free Large Drinks</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <Medal className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="font-bold text-lg">2nd Place</p>
                  <p className="text-sm">2 Free Large Drinks</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <Award className="w-8 h-8 mx-auto mb-2 text-amber-700" />
                  <p className="font-bold text-lg">3rd Place</p>
                  <p className="text-sm">1 Free Large Drink</p>
                </div>
              </div>
              <p className="text-sm mt-4 opacity-80">
                Prizes awarded at the end of each month based on suburb rankings
              </p>
            </div>
          </CardContent>
        </Card>

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

        {/* User's Suburb Leaderboard */}
        <section>
          {user?.suburb && userSuburbData ? (
            <>
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                {user.suburb} Leaderboard
              </h3>
              {userSuburbData.users.map((player) => (
                <Card 
                  key={player.id} 
                  className={`bg-slate-700 border-slate-600 mb-3 ${
                    player.rank <= 3 ? 'ring-2 ring-orange-500/20' : ''
                  } ${player.id === user.id ? 'ring-2 ring-blue-500/30' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(player.rank)}
                        </div>
                        <div>
                          <p className={`font-semibold ${player.id === user.id ? 'text-blue-400' : 'text-white'}`}>
                            {player.firstName} {player.lastName}
                            {player.id === user.id && ' (You)'}
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
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-white text-lg font-semibold mb-2">No Suburb Set</p>
              <p className="text-slate-400">
                {user?.suburb ? 
                  'No other workers in your suburb yet. Be the first!' : 
                  'Please update your profile with your suburb to see the leaderboard.'
                }
              </p>
            </div>
          )}
        </section>
      </main>

      <Navigation />
    </div>
  );
}