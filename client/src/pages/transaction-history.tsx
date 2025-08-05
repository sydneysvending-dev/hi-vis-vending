import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, DollarSign, Gift, Zap } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: "purchase" | "redemption" | "bonus";
  points: number;
  description: string;
  createdAt: string;
  externalTransactionId?: string;
}

export default function TransactionHistory() {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/user/transactions"],
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "redemption":
        return <Gift className="h-4 w-4 text-red-600" />;
      case "bonus":
        return <Zap className="h-4 w-4 text-yellow-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "bg-green-100 text-green-800 border-green-200";
      case "redemption":
        return "bg-red-100 text-red-800 border-red-200";
      case "bonus":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/profile">
              <ArrowLeft className="h-6 w-6 text-orange-600 hover:text-orange-700 cursor-pointer" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/profile">
            <ArrowLeft className="h-6 w-6 text-orange-600 hover:text-orange-700 cursor-pointer" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        </div>

        {/* Transaction List */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              All Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <DollarSign className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600 text-lg">No transactions yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Start earning points by scanning QR codes at vending machines!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                  <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(transaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          {transaction.externalTransactionId && (
                            <p className="text-xs text-gray-400 mt-1">
                              ID: {transaction.externalTransactionId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${getTransactionColor(transaction.type)}`}
                        >
                          {transaction.type}
                        </Badge>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.points > 0 ? '+' : ''}{transaction.points}
                          </p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    </div>
                    {index < transactions.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Points Earned</p>
                    <p className="text-xl font-bold text-green-600">
                      +{transactions.filter(t => t.points > 0).reduce((sum, t) => sum + t.points, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Points Spent</p>
                    <p className="text-xl font-bold text-red-600">
                      {Math.abs(transactions.filter(t => t.points < 0).reduce((sum, t) => sum + t.points, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-xl font-bold text-blue-600">
                      {transactions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}