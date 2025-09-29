import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardHat, Zap, Gift, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-800 text-white">
      {/* Header */}
      <header className="border-b-4 border-orange-500 p-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <HardHat className="text-slate-800 w-6 h-6" />
          </div>
          <div className="text-center">
            <h1 className="text-white font-bold text-xl">HI-VIS</h1>
            <p className="text-yellow-400 text-sm font-medium">VENDING</p>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="gradient-orange rounded-2xl p-8 text-slate-800 mb-6">
            <h2 className="text-3xl font-bold mb-2">Welcome to Hi-Vis Vending</h2>
            <p className="text-lg opacity-90">Your construction site loyalty program</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Zap className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Earn Points</h3>
                <p className="text-slate-300 text-sm">Get 10 points for every purchase</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <Gift className="text-slate-800 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Redeem Rewards</h3>
                <p className="text-slate-300 text-sm">Free drinks, snacks, and more</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Star className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Loyalty Tiers</h3>
                <p className="text-slate-300 text-sm">Apprentice, Tradie, Foreman levels</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login Button */}
        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-orange-500 hover:bg-orange-600 text-slate-800 font-bold py-4 text-lg"
          >
            Get Started
          </Button>
          <p className="text-slate-400 text-sm mt-4">
            Join thousands of construction workers saving on their daily coffee and snacks
          </p>
        </div>
      </main>
    </div>
  );
}
