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
import Referral from "@/pages/referral";
import CompleteProfile from "@/pages/complete-profile";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Check if user needs to complete their profile (missing suburb)
  const needsProfileCompletion = isAuthenticated && user && !user.suburb;

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : needsProfileCompletion ? (
        <Route path="*" component={CompleteProfile} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/scan" component={Scan} />
          <Route path="/my-code" component={MyCode} />
          <Route path="/referral" component={Referral} />
          <Route path="/rewards" component={Rewards} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
