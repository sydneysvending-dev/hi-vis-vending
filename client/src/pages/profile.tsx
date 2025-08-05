import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import LoyaltyProgress from "@/components/LoyaltyProgress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardHat, LogOut, History, Star, Trophy, Code, ExternalLink } from "lucide-react";
import { useLocation, Link } from "wouter";
import { User, Transaction } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth() as { user: User | null };
  const [, setLocation] = useLocation();

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/user/transactions"],
  });

  if (!user) {
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

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "apprentice": return <HardHat className="w-6 h-6" />;
      case "tradie": return <Star className="w-6 h-6" />;
      case "foreman": return <Trophy className="w-6 h-6" />;
      default: return <HardHat className="w-6 h-6" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "apprentice": return "bg-slate-500";
      case "tradie": return "bg-orange-500";
      case "foreman": return "bg-yellow-400";
      default: return "bg-slate-500";
    }
  };

  const totalPurchases = transactions.filter(t => t.type === 'purchase').length;
  const totalRedemptions = transactions.filter(t => t.type === 'redemption').length;
  const totalEarned = transactions
    .filter(t => t.points > 0)
    .reduce((sum, t) => sum + t.points, 0);

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
              <h1 className="text-white font-bold text-lg">Profile</h1>
              <p className="text-yellow-400 text-xs font-medium">Manage your account</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 pb-20">
        {/* Profile Info */}
        <div className="gradient-orange rounded-2xl p-6 text-slate-800 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
              </h2>
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 ${getTierColor(user.loyaltyTier || 'apprentice')} rounded-full flex items-center justify-center`}>
                  {getTierIcon(user.loyaltyTier || 'apprentice')}
                </div>
                <span className="font-semibold">{getTierName(user.loyaltyTier || 'apprentice')}</span>
              </div>
            </div>
          </div>
          
          <LoyaltyProgress 
            tier={user.loyaltyTier || 'apprentice'}
            points={user.totalPoints || 0}
          />
        </div>

        {/* Stats */}
        <section className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-4">Your Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-500">{user.totalPoints || 0}</p>
                <p className="text-slate-300 text-sm">Total Points</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{totalEarned}</p>
                <p className="text-slate-300 text-sm">Points Earned</p>
              </CardContent>
            </Card>
            
            <Link href="/transaction-history">
              <Card className="bg-slate-700 border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <p className="text-2xl font-bold text-blue-400">{totalPurchases}</p>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-slate-300 text-sm">Purchases</p>
                  <p className="text-xs text-slate-400 mt-1">View history</p>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">{totalRedemptions}</p>
                <p className="text-slate-300 text-sm">Rewards Redeemed</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Account Info */}
        <section className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-4">Account Information</h3>
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Email:</span>
                <span className="text-white">{user.email || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Suburb:</span>
                <span className="text-white">{user.suburb || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Member since:</span>
                <span className="text-white">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Punch card progress:</span>
                <span className="text-orange-500 font-semibold">
                  {user.punchCardProgress || 0}/10
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Activity */}
        {transactions.length > 0 && (
          <section className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Recent Activity</span>
            </h3>
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-0">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div key={transaction.id} className={`p-4 flex items-center justify-between ${
                    index < 4 ? 'border-b border-slate-600' : ''
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'purchase' ? 'bg-green-100' :
                        transaction.type === 'redemption' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <span className={`text-xs font-bold ${
                          transaction.type === 'purchase' ? 'text-green-600' :
                          transaction.type === 'redemption' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {transaction.type === 'purchase' ? '+' : 
                           transaction.type === 'redemption' ? '−' : '★'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm capitalize">{transaction.type}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(transaction.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${
                        transaction.points > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Developer Access (Byron only) */}
        {user.email === 'byron@sydneyselectvending.com.au' && (
          <Button 
            onClick={() => setLocation('/developer')}
            className="w-full flex items-center justify-center space-x-2 mb-4 bg-purple-600 hover:bg-purple-700"
          >
            <Code className="w-4 h-4" />
            <span>Developer Console</span>
          </Button>
        )}

        {/* Logout Button */}
        <Button 
          onClick={() => window.location.href = '/api/logout'}
          variant="destructive"
          className="w-full flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </main>

      <Navigation />
    </div>
  );
}
