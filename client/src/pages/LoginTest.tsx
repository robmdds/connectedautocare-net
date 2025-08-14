import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Check, AlertCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const runLoginTest = async () => {
    setIsLoading(true);
    const results: any = {
      timestamp: new Date().toLocaleString(),
      steps: []
    };

    try {
      // Step 1: Test admin access endpoint
      results.steps.push("Testing admin access endpoint...");
      const loginResponse = await fetch('/api/auth/admin-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      const loginData = await loginResponse.json();
      results.steps.push(`Login Response: ${loginResponse.status} - ${loginData.message}`);
      
      if (loginData.success) {
        results.steps.push("✅ Admin access successful");
        
        // Step 2: Test user endpoint
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for session to propagate
        
        results.steps.push("Testing user authentication endpoint...");
        const userResponse = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          results.steps.push(`✅ User data retrieved: ${userData.email}`);
          results.authenticationWorking = true;
        } else {
          results.steps.push(`❌ User endpoint failed: ${userResponse.status}`);
          results.authenticationWorking = false;
        }
      } else {
        results.steps.push("❌ Admin access failed");
        results.authenticationWorking = false;
      }
    } catch (error) {
      results.steps.push(`❌ Error: ${error.message}`);
      results.authenticationWorking = false;
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-white mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Authentication Test Center</h1>
          <p className="text-blue-100">Test the Quick Sign In functionality</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Auth Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Current Authentication Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {authLoading ? (
                <p className="text-gray-600">Loading authentication status...</p>
              ) : isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="font-semibold">Authenticated</span>
                  </div>
                  {user && (
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm"><strong>Email:</strong> {user.email}</p>
                      <p className="text-sm"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                      <p className="text-sm"><strong>ID:</strong> {user.id}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-semibold">Not Authenticated</span>
                </div>
              )}
              
              <Button onClick={refreshPage} variant="outline" className="w-full">
                Refresh Status
              </Button>
            </CardContent>
          </Card>

          {/* Test Login */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Sign In Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Test the authentication system to verify it's working properly.
              </p>
              
              <Button 
                onClick={runLoginTest} 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Testing..." : "Run Authentication Test"}
              </Button>

              {testResults && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <h3 className="font-semibold mb-2">Test Results ({testResults.timestamp})</h3>
                  <div className="space-y-1 text-sm">
                    {testResults.steps.map((step, index) => (
                      <div key={index} className="font-mono text-xs">
                        {step}
                      </div>
                    ))}
                  </div>
                  
                  {testResults.authenticationWorking === true && (
                    <div className="mt-3 p-2 bg-green-100 text-green-800 rounded text-sm">
                      ✅ Authentication system is working correctly!
                    </div>
                  )}
                  
                  {testResults.authenticationWorking === false && (
                    <div className="mt-3 p-2 bg-red-100 text-red-800 rounded text-sm">
                      ❌ Authentication test failed. Check server logs.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p><strong>1. Test Authentication:</strong> Click "Run Authentication Test" to verify the login system works</p>
              <p><strong>2. Check Status:</strong> The left panel shows your current authentication status</p>
              <p><strong>3. OAuth Issues:</strong> If OAuth callback fails, this Quick Sign In provides immediate access</p>
              <p><strong>4. Access Platform:</strong> Once authenticated, you can access all TPA features</p>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-blue-800 text-sm">
                <strong>Platform Access:</strong> After successful authentication, visit the main dashboard or use the navigation to access policies, claims, analytics, and other TPA features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}