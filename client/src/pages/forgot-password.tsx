import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardHat, Mail, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const resetMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", { email });
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    },
    onError: (error) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Please check your email address and try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    resetMutation.mutate(email.trim());
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Check Your Email</CardTitle>
              <p className="text-gray-600">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  Didn't receive an email? Check your spam folder or try again.
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full border-orange-200 hover:bg-orange-50"
                >
                  Try Different Email
                </Button>
              </div>
              
              <div className="text-center pt-4">
                <Link href="/login" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <HardHat className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Reset Your Password</CardTitle>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="pl-10 border-orange-200 focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={resetMutation.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {resetMutation.isPending ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center pt-4">
                <Link href="/login" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}