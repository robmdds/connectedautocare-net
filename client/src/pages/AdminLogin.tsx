import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAdminAccess = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/admin-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Admin Access Granted",
          description: "Redirecting to admin panel...",
        });
        
        // Redirect to admin panel
        setTimeout(() => {
          setLocation('/admin');
        }, 1000);
      } else {
        toast({
          title: "Access Denied",
          description: "Failed to grant admin access",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to authentication service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    // Redirect to OAuth login
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Login
          </CardTitle>
          <p className="text-sm text-gray-600">
            Access the TPA administration panel
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleAdminAccess}
            disabled={isLoading}
            className="w-full"
            data-testid="button-admin-access"
          >
            <Lock className="h-4 w-4 mr-2" />
            {isLoading ? 'Granting Access...' : 'Admin Access'}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          
          <Button
            onClick={handleOAuthLogin}
            variant="outline"
            className="w-full"
            data-testid="button-oauth-login"
          >
            <Shield className="h-4 w-4 mr-2" />
            Login with Replit
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Admin access is required for system management
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}