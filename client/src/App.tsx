import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Scan from "@/pages/scan";
import MyCode from "@/pages/my-code";
import Rewards from "@/pages/rewards";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import Leaderboard from "@/pages/leaderboard";
import CompleteProfile from "@/pages/complete-profile";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Developer from "@/pages/developer";
import TransactionHistory from "@/pages/transaction-history";
import { AnimationProvider, useAnimation } from "@/contexts/AnimationContext";
import PointsGainedAnimation from "@/components/PointsGainedAnimation";
import TierUpgradeAnimation from "@/components/TierUpgradeAnimation";

function AnimationOverlay() {
  const { animationState, hidePointsGained, hideTierUpgrade } = useAnimation();
  
  return (
    <>
      <PointsGainedAnimation
        points={animationState.pointsGained.points}
        isVisible={animationState.pointsGained.isVisible}
        onComplete={hidePointsGained}
      />
      <TierUpgradeAnimation
        newTier={animationState.tierUpgrade.newTier}
        isVisible={animationState.tierUpgrade.isVisible}
        onComplete={hideTierUpgrade}
      />
    </>
  );
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route path="*" component={Landing} />
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={Signup} />
          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route component={Signup} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/scan" component={Scan} />
          <Route path="/my-code" component={MyCode} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/rewards" component={Rewards} />
          <Route path="/profile" component={Profile} />
          <Route path="/transaction-history" component={TransactionHistory} />
          <Route path="/admin" component={Admin} />
          <Route path="/developer" component={Developer} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnimationProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <AnimationOverlay />
        </TooltipProvider>
      </AnimationProvider>
    </QueryClientProvider>
  );
}

export default App;
