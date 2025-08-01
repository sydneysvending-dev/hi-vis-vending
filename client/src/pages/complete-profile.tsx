import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardHat, MapPin } from "lucide-react";

export default function CompleteProfile() {
  const [suburb, setSuburb] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { suburb: string }) => {
      const response = await apiRequest("POST", "/api/auth/complete-profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Complete!",
        description: "Welcome to Hi-Vis Vending loyalty program!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suburb.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter your suburb to continue",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate({ suburb: suburb.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <HardHat className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Complete Your Profile</CardTitle>
            <p className="text-gray-600">
              Welcome {user?.firstName || 'to Hi-Vis Vending'}! We need a bit more info to set up your account.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="suburb" className="text-gray-700 font-medium">
                  Construction Site / Suburb *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="suburb"
                    type="text"
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    placeholder="e.g. Parramatta, Sydney CBD, Blacktown"
                    className="pl-10 border-orange-200 focus:border-orange-500"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">
                  We use this to group you with other workers in your area for local promotions and offers.
                </p>
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending || !suburb.trim()}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {updateProfileMutation.isPending ? "Setting up..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}