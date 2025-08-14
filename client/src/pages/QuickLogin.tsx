import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuickLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuickLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/admin-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session persistence
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Signed In Successfully",
          description: "Welcome to Connected Auto Care",
        });
        
        // Force reload to ensure session is recognized
        setTimeout(() => {
          window.location.href = '/?logged_in=true';
        }, 1000);
      } else {
        toast({
          title: "Sign In Failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Quick login error:', error);
      toast({
        title: "Connection Error",
        description: "Please check your internet connection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Connected Auto Care
          </CardTitle>
          <p className="text-sm text-gray-600">
            TPA Platform - Quick Access
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleQuickLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
            data-testid="button-quick-login"
          >
            <Zap className="h-5 w-5 mr-2" />
            {isLoading ? 'Signing In...' : 'Quick Sign In'}
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Access to TPA management platform
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Policies • Claims • Analytics • Admin
            </p>
          </div>

          <div className="border-t pt-4">
            <Button
              onClick={() => window.location.href = '/api/login'}
              variant="outline"
              className="w-full"
              data-testid="button-oauth-login"
            >
              <Lock className="h-4 w-4 mr-2" />
              Or use Replit Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}