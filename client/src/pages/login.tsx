import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardHat, Mail, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome Back!",
        description: "You have successfully logged in.",
      });
      // Redirect to home page after successful login
      setLocation("/");
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your email and password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "Required Fields",
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <HardHat className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Welcome Back</CardTitle>
            <p className="text-gray-600">
              Log in to your Hi-Vis Vending account
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                    className="pl-10 border-orange-200 focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 border-orange-200 focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {loginMutation.isPending ? "Logging In..." : "Log In"}
              </Button>

              <div className="text-center pt-4 space-y-2">
                <Link href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 underline">
                  Forgot your password?
                </Link>
                
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}