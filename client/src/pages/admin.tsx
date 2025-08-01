import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { HardHat, Users, Activity, Gift, Bell, Link2, DollarSign, Target, Clock, ArrowLeft, Send, Play, Square, Wifi, WifiOff, Upload, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Admin() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "promotion"
  });

  // Moma sync state
  const [syncStatus, setSyncStatus] = useState({
    isRunning: false,
    lastSync: null,
    connectionStatus: "unknown"
  });

  // CSV and redemption state
  const [csvData, setCsvData] = useState("");
  const [redemptionCode, setRedemptionCode] = useState("");

  // AWS sync state
  const [awsStatus, setAwsStatus] = useState({
    isRunning: false,
    bucketName: "",
    connectionStatus: "unknown"
  });

  // Query admin stats
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  // Query all users
  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  // Query unprocessed transactions
  const { data: unprocessedTransactions = [] } = useQuery({
    queryKey: ["/api/admin/unprocessed-transactions"],
    enabled: isAuthenticated && user?.isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutation for sending notifications
  const sendNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/send-notification", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notifications Sent",
        description: "Push notifications have been sent to all users",
      });
      setNotificationForm({ title: "", message: "", type: "promotion" });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Could not send notifications",
        variant: "destructive",
      });
    },
  });

  // Mutation for matching transactions
  const matchTransactionMutation = useMutation({
    mutationFn: async ({ externalTransactionId, userId }: { externalTransactionId: string; userId: string }) => {
      const response = await apiRequest("POST", "/api/admin/match-transaction", { externalTransactionId, userId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/unprocessed-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Transaction Matched",
        description: "Transaction has been matched to user and points awarded",
      });
    },
    onError: (error) => {
      toast({
        title: "Matching Failed",
        description: error.message || "Could not match transaction",
        variant: "destructive",
      });
    },
  });

  // Moma sync mutations
  const startSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/start-moma-sync", {});
      return response.json();
    },
    onSuccess: () => {
      setSyncStatus(prev => ({ ...prev, isRunning: true }));
      toast({
        title: "Moma Sync Started",
        description: "Now automatically checking for new transactions every 30 seconds",
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Could not start Moma sync",
        variant: "destructive",
      });
    },
  });

  const stopSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/stop-moma-sync", {});
      return response.json();
    },
    onSuccess: () => {
      setSyncStatus(prev => ({ ...prev, isRunning: false }));
      toast({
        title: "Moma Sync Stopped",
        description: "Automatic transaction checking has been disabled",
      });
    },
    onError: (error) => {
      toast({
        title: "Stop Failed",
        description: error.message || "Could not stop Moma sync",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/test-moma-connection", {});
      return response.json();
    },
    onSuccess: (data) => {
      setSyncStatus(prev => ({ ...prev, connectionStatus: data.success ? "connected" : "failed" }));
      toast({
        title: data.success ? "Connection Success" : "Connection Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      setSyncStatus(prev => ({ ...prev, connectionStatus: "failed" }));
      toast({
        title: "Connection Test Failed",
        description: error.message || "Could not test Moma connection",
        variant: "destructive",
      });
    },
  });

  // CSV upload mutation
  const uploadCsvMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/upload-csv", { csvData });
      return response.json();
    },
    onSuccess: (data) => {
      setCsvData("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/unprocessed-transactions"] });
      toast({
        title: "CSV Upload Complete",
        description: `Processed ${data.processed} transactions, ${data.errors} errors`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Could not process CSV data",
        variant: "destructive",
      });
    },
  });

  // Redemption code validation mutation
  const validateCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/validate-redemption", { redemptionCode });
      return response.json();
    },
    onSuccess: (data) => {
      setRedemptionCode("");
      if (data.valid) {
        toast({
          title: "Valid Redemption Code!",
          description: `${data.reward} for ${data.customerName}`,
        });
      } else {
        toast({
          title: "Invalid Code",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Validation Failed",
        description: error.message || "Could not validate redemption code",
        variant: "destructive",
      });
    },
  });

  // AWS sync mutations
  const startAwsSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/aws-sync/start", {});
      return response.json();
    },
    onSuccess: () => {
      setAwsStatus(prev => ({ ...prev, isRunning: true }));
      toast({
        title: "AWS Sync Started",
        description: "Automatic sync with AWS services is now active",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start AWS Sync",
        description: error.message || "Could not start AWS sync service",
        variant: "destructive",
      });
    },
  });

  const stopAwsSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/aws-sync/stop", {});
      return response.json();
    },
    onSuccess: () => {
      setAwsStatus(prev => ({ ...prev, isRunning: false }));
      toast({
        title: "AWS Sync Stopped",
        description: "Automatic sync has been disabled",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Stop AWS Sync",
        description: error.message || "Could not stop AWS sync service",
        variant: "destructive",
      });
    },
  });

  const testAwsConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/aws-sync/test", {});
      return response.json();
    },
    onSuccess: (data) => {
      setAwsStatus(prev => ({ ...prev, connectionStatus: data.success ? "connected" : "failed" }));
      toast({
        title: data.success ? "AWS Connection Successful" : "AWS Connection Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      setAwsStatus(prev => ({ ...prev, connectionStatus: "failed" }));
      toast({
        title: "AWS Connection Test Failed",
        description: error.message || "Could not test AWS connection",
        variant: "destructive",
      });
    },
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
          <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <HardHat className="text-slate-800 w-8 h-8" />
          </div>
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSendNotification = () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and message",
        variant: "destructive",
      });
      return;
    }

    sendNotificationMutation.mutate(notificationForm);
  };

  // Construction industry notification templates
  const notificationTemplates = [
    {
      title: "Knock-off Deal's On!",
      message: "End your shift with a cold drink! Use your loyalty points for 50% off all beverages until 5pm. 🏗️",
      type: "promotion"
    },
    {
      title: "Smoko Sorted!",
      message: "Pre-smoko special: Buy any snack and get 20 bonus points! Perfect for your morning break. ☕",
      type: "promotion"
    },
    {
      title: "Safety First Rewards",
      message: "Hard work deserves rewards! Check out your new loyalty tier and available rewards in the app. 👷‍♂️",
      type: "achievement"
    },
    {
      title: "Tool Down Time",
      message: "Lunch break reminder: Don't forget to grab something from the Hi-Vis vending machine to fuel up! 🔧",
      type: "reminder"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Header */}
      <header className="bg-slate-800 border-b-4 border-orange-500 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <HardHat className="text-slate-800 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Admin Dashboard</h1>
              <p className="text-yellow-400 text-xs font-medium">Hi-Vis Vending Control Center</p>
            </div>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="p-6 pb-20">
        {/* Stats Overview */}
        <div className="mb-6">
          <h2 className="text-white text-xl font-semibold mb-4">System Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                <p className="text-slate-300 text-sm">Total Users</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats?.activeUsersToday || 0}</p>
                <p className="text-slate-300 text-sm">Active Today</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats?.totalTransactions || 0}</p>
                <p className="text-slate-300 text-sm">Transactions</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats?.totalPointsEarned || 0}</p>
                <p className="text-slate-300 text-sm">Points Earned</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <Gift className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats?.pointsRedeemed || 0}</p>
                <p className="text-slate-300 text-sm">Points Redeemed</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 text-center">
                <Link2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats?.activeMachines || 0}</p>
                <p className="text-slate-300 text-sm">Active Machines</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-700">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-orange-500 data-[state=active]:text-slate-800">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-orange-500 data-[state=active]:text-slate-800">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-orange-500 data-[state=active]:text-slate-800">
              <Clock className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="moma" className="data-[state=active]:bg-orange-500 data-[state=active]:text-slate-800">
              <Link2 className="w-4 h-4 mr-2" />
              Moma Sync
            </TabsTrigger>
            <TabsTrigger value="aws" className="data-[state=active]:bg-blue-500 data-[state=active]:text-slate-800">
              <Wifi className="w-4 h-4 mr-2" />
              AWS Integration
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-orange-500" />
                  Send Push Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Title</Label>
                  <Input
                    id="title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Knock-off Deal's On!"
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white">Message</Label>
                  <Textarea
                    id="message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Write your message to all Hi-Vis app users..."
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSendNotification}
                  disabled={sendNotificationMutation.isPending}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-slate-800 font-semibold"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendNotificationMutation.isPending ? "Sending..." : "Send to All Users"}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Templates */}  
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Quick Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {notificationTemplates.map((template, index) => (
                    <Card key={index} className="bg-slate-800 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{template.title}</h4>
                          <Badge className="bg-orange-500 text-slate-800">{template.type}</Badge>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">{template.message}</p>
                        <Button
                          size="sm"
                          onClick={() => setNotificationForm(template)}
                          className="bg-slate-600 hover:bg-slate-500 text-white"
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">All Users ({allUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allUsers.map((user: any) => (
                    <Card key={user.id} className="bg-slate-800 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-white">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                            <p className="text-yellow-400 text-sm">
                              {user.totalPoints || 0} points • {user.loyaltyTier}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-600 text-white mb-1">
                              {user.referralCount || 0} referrals
                            </Badge>
                            {user.cardNumber && (
                              <p className="text-xs text-slate-400">Card: {user.cardNumber}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">
                  Unprocessed Vending Machine Transactions ({unprocessedTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unprocessedTransactions.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No unprocessed transactions</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {unprocessedTransactions.map((transaction: any) => (
                      <Card key={transaction.id} className="bg-slate-800 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-white">
                                ${(transaction.amount / 100).toFixed(2)} • {transaction.productName || 'Unknown Item'}
                              </p>
                              <p className="text-slate-400 text-sm">
                                Machine: {transaction.machineId} • {new Date(transaction.timestamp).toLocaleString()}
                              </p>
                              {transaction.cardNumber && (
                                <p className="text-yellow-400 text-sm">Card: {transaction.cardNumber}</p>
                              )}
                            </div>
                            <div className="ml-4">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    matchTransactionMutation.mutate({
                                      externalTransactionId: transaction.id,
                                      userId: e.target.value
                                    });
                                  }
                                }}
                                className="bg-slate-600 text-white text-xs p-1 rounded"
                                disabled={matchTransactionMutation.isPending}
                              >
                                <option value="">Match to User</option>
                                {allUsers.map((user: any) => (
                                  <option key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moma Integration Tab */}
          <TabsContent value="moma" className="space-y-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Link2 className="w-5 h-5 mr-2 text-orange-500" />
                  Moma App Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <h4 className="text-white font-semibold">Auto-Sync Status</h4>
                    <p className="text-slate-400 text-sm">
                      {syncStatus.isRunning 
                        ? "Checking for new transactions every 30 seconds" 
                        : "Automatic sync is stopped"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {syncStatus.isRunning ? (
                      <Wifi className="w-6 h-6 text-green-400" />
                    ) : (
                      <WifiOff className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
                    <h4 className="text-white font-semibold">CSV Upload</h4>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Paste CSV data here (date,amount,card_number,product)..."
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                      />
                      <Button
                        onClick={() => uploadCsvMutation.mutate()}
                        disabled={uploadCsvMutation.isPending || !csvData.trim()}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {uploadCsvMutation.isPending ? "Processing..." : "Upload CSV Data"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
                    <h4 className="text-white font-semibold">Redemption Code Validator</h4>
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter redemption code..."
                        value={redemptionCode}
                        onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Button
                        onClick={() => validateCodeMutation.mutate()}
                        disabled={validateCodeMutation.isPending || !redemptionCode.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {validateCodeMutation.isPending ? "Validating..." : "Validate Code"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Connection Status</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      syncStatus.connectionStatus === "connected" ? "bg-green-400" :
                      syncStatus.connectionStatus === "failed" ? "bg-red-400" : "bg-yellow-400"
                    }`} />
                    <span className="text-slate-300">
                      {syncStatus.connectionStatus === "connected" ? "Connected to Moma API" :
                       syncStatus.connectionStatus === "failed" ? "Connection Failed" : "Connection Unknown"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integration Setup Instructions */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Integration Setup Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 text-slate-300">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Method 1: Real-time Webhooks (Recommended)</h4>
                    <p className="text-sm mb-2">Configure your Moma app to send transaction data instantly:</p>
                    <div className="bg-slate-800 p-3 rounded font-mono text-xs">
                      POST https://your-domain/api/moma/webhook
                    </div>
                    <p className="text-xs mt-2">Include card number, amount, product, and timestamp in the webhook payload.</p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Method 2: CSV Import</h4>
                    <p className="text-sm mb-2">Export transaction data from your Moma app and upload it here:</p>
                    <div className="space-y-1 text-xs">
                      <div>• Export sales reports from Moma app</div>
                      <div>• Include: date, amount, card number, product</div>
                      <div>• Upload CSV file for automatic processing</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Method 3: QR Code Tracking</h4>
                    <p className="text-sm">Have customers scan QR codes on vending machines after purchase to earn points manually.</p>
                  </div>

                  <div className="bg-orange-100 border border-orange-400 p-3 rounded">
                    <p className="text-orange-800 text-sm font-semibold">
                      💡 Pro Tip: For best results, have customers link their payment card numbers in their Hi-Vis profiles for automatic matching.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AWS Integration Tab */}
          <TabsContent value="aws" className="space-y-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Wifi className="w-5 h-5 mr-2 text-blue-500" />
                  AWS Integration for Moma Data Transfer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <h4 className="text-white font-semibold">AWS Sync Status</h4>
                    <p className="text-slate-400 text-sm">
                      {awsStatus.isRunning 
                        ? "Monitoring AWS S3 and SQS for new transactions" 
                        : "AWS sync is currently stopped"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {awsStatus.isRunning ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <WifiOff className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => startAwsSyncMutation.mutate()}
                    disabled={startAwsSyncMutation.isPending || awsStatus.isRunning}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {startAwsSyncMutation.isPending ? "Starting..." : "Start AWS Sync"}
                  </Button>

                  <Button
                    onClick={() => stopAwsSyncMutation.mutate()}
                    disabled={stopAwsSyncMutation.isPending || !awsStatus.isRunning}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    {stopAwsSyncMutation.isPending ? "Stopping..." : "Stop AWS Sync"}
                  </Button>

                  <Button
                    onClick={() => testAwsConnectionMutation.mutate()}
                    disabled={testAwsConnectionMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Wifi className="w-4 h-4 mr-2" />
                    {testAwsConnectionMutation.isPending ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AWS Setup Instructions */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">AWS Configuration Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 text-slate-300">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Step 1: AWS Credentials</h4>
                    <p className="text-sm mb-2">Set up your AWS credentials for Hi-Vis Vending integration:</p>
                    <div className="bg-slate-800 p-3 rounded font-mono text-xs space-y-1">
                      <div>AWS_ACCESS_KEY_ID=your_access_key</div>
                      <div>AWS_SECRET_ACCESS_KEY=your_secret_key</div>
                      <div>AWS_REGION=us-east-1</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Step 2: S3 Bucket Setup</h4>
                    <p className="text-sm mb-2">Configure Moma app to upload transaction files to S3:</p>
                    <div className="bg-slate-800 p-3 rounded font-mono text-xs space-y-1">
                      <div>Bucket: hi-vis-moma-data</div>
                      <div>Folder: transactions/</div>
                      <div>Format: JSON files with transaction data</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Step 3: SQS Queue (Optional)</h4>
                    <p className="text-sm mb-2">For real-time notifications:</p>
                    <div className="bg-slate-800 p-3 rounded font-mono text-xs">
                      <div>Queue: hi-vis-transaction-notifications</div>
                    </div>
                  </div>

                  <div className="bg-blue-100 border border-blue-400 p-3 rounded">
                    <p className="text-blue-800 text-sm font-semibold">
                      ⚡ AWS Integration automatically processes transactions from both S3 files and SQS messages, 
                      providing seamless sync with your Moma vending machines.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}