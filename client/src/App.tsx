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
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

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
