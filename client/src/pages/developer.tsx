import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Code2, Database, Settings, Users, Activity, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Developer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Get system stats
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  // Get all users for developer analysis
  const { data: allUsers } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  if (!user?.isDeveloper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="border-red-200 shadow-lg max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Access Denied</CardTitle>
            <p className="text-gray-600">
              This page is restricted to developer access only.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "database", label: "Database", icon: Database },
    { id: "users", label: "Users", icon: Users },
    { id: "system", label: "System", icon: Settings },
  ];

  const handleDatabaseAction = (action: string) => {
    toast({
      title: "Developer Action",
      description: `${action} functionality would be implemented here`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Developer Console</h1>
            <Badge variant="destructive" className="bg-red-500">RESTRICTED</Badge>
          </div>
          <p className="text-gray-600">
            Advanced system controls and diagnostics for {user.firstName} {user.lastName}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm border border-orange-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-orange-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats?.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.activeUsersToday || 0}</div>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats?.totalTransactions || 0}</div>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Points Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats?.totalPointsEarned || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "database" && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Database Operations</CardTitle>
                <p className="text-gray-600">Direct database management tools</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleDatabaseAction("Reset all user points")}
                    variant="destructive"
                    className="w-full"
                  >
                    Reset All Points
                  </Button>
                  
                  <Button
                    onClick={() => handleDatabaseAction("Clear transaction history")}
                    variant="destructive"
                    className="w-full"
                  >
                    Clear Transactions
                  </Button>
                  
                  <Button
                    onClick={() => handleDatabaseAction("Export user data")}
                    variant="outline"
                    className="w-full border-orange-200"
                  >
                    Export Data
                  </Button>
                  
                  <Button
                    onClick={() => handleDatabaseAction("Run database cleanup")}
                    variant="outline"
                    className="w-full border-orange-200"
                  >
                    Cleanup Database
                  </Button>
                </div>
                
                <Separator />
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ Danger Zone</h4>
                  <p className="text-red-700 text-sm mb-3">
                    These actions cannot be undone and will affect all users.
                  </p>
                  <Button
                    onClick={() => handleDatabaseAction("Delete all user accounts")}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete All Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "users" && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">User Management</CardTitle>
                <p className="text-gray-600">Advanced user controls and analytics</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800">Apprentices</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {allUsers?.filter(u => u.loyaltyTier === "apprentice").length || 0}
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800">Tradies</h4>
                      <p className="text-2xl font-bold text-orange-600">
                        {allUsers?.filter(u => u.loyaltyTier === "tradie").length || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800">Foremen</h4>
                      <p className="text-2xl font-bold text-yellow-600">
                        {allUsers?.filter(u => u.loyaltyTier === "foreman").length || 0}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDatabaseAction("Generate user report")}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    Generate Full User Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "system" && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">System Configuration</CardTitle>
                <p className="text-gray-600">Environment and system settings</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Environment</h4>
                    <Badge variant="secondary">Development</Badge>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Database Status</h4>
                    <Badge className="bg-green-500">Connected</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    onClick={() => handleDatabaseAction("Check system health")}
                    variant="outline"
                    className="w-full border-orange-200"
                  >
                    Run Health Check
                  </Button>
                  
                  <Button
                    onClick={() => handleDatabaseAction("View system logs")}
                    variant="outline"
                    className="w-full border-orange-200"
                  >
                    View System Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}