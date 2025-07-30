import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardHat, Users, Activity, Gift, Zap, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Admin() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: recentUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: machines = [] } = useQuery({
    queryKey: ["/api/machines"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <HardHat className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-pulse" />
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "apprentice": return "👷";
      case "tradie": return "🔧";
      case "foreman": return "👑";
      default: return "👷";
    }
  };

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Header */}
      <header className="bg-orange-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              <HardHat className="text-orange-500 w-5 h-5" />
            </div>
            <h1 className="text-slate-800 text-xl font-bold">Admin Dashboard</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-slate-800 hover:bg-orange-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Overview */}
        <section className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-4">System Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
                <p className="text-slate-300">Total Users</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stats?.totalTransactions || 0}</p>
                <p className="text-slate-300">Transactions</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <Gift className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stats?.pointsRedeemed || 0}</p>
                <p className="text-slate-300">Points Redeemed</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stats?.activeMachines || 0}</p>
                <p className="text-slate-300">Active Machines</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Users */}
        <section className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-4">Recent Users</h2>
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-0">
              {recentUsers.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  No recent users found
                </div>
              ) : (
                recentUsers.map((user: any, index: number) => (
                  <div key={user.id} className={`p-4 flex items-center justify-between ${
                    index < recentUsers.length - 1 ? 'border-b border-slate-600' : ''
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-slate-800 text-sm font-bold">
                          {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Unknown User'}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <span>{getTierIcon(user.loyaltyTier)} {user.loyaltyTier}</span>
                          <span>•</span>
                          <span>{user.totalPoints} points</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        {/* Machine Status */}
        <section>
          <h2 className="text-white text-xl font-semibold mb-4">Machine Status</h2>
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-0">
              {machines.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  No machines found
                </div>
              ) : (
                machines.map((machine: any, index: number) => (
                  <div key={machine.id} className={`p-4 flex items-center justify-between ${
                    index < machines.length - 1 ? 'border-b border-slate-600' : ''
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                        <HardHat className="text-orange-500 w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{machine.name}</p>
                        <p className="text-sm text-slate-400">{machine.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${
                        machine.isOnline ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className={`text-sm font-medium ${
                        machine.isOnline ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {machine.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
