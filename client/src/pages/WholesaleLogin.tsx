import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Store, Shield, Users, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function WholesaleLogin() {
  const [, setLocation] = useLocation();
  const [loginData, setLoginData] = useState({
    partnerCode: "",
    username: "",
    password: "",
    rememberMe: false
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would authenticate with the wholesale API
    console.log("Wholesale login:", loginData);
    setLocation("/wholesale/portal");
  };

  const features = [
    {
      icon: Store,
      title: "Partner Dashboard",
      description: "Comprehensive dashboard with sales analytics and performance metrics"
    },
    {
      icon: Shield,
      title: "Product Management",
      description: "Access to all wholesale products with custom pricing and markup tools"
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Lead tracking, quote management, and customer relationship tools"
    },
    {
      icon: TrendingUp,
      title: "Commission Tracking",
      description: "Real-time commission calculations and payment tracking"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Store className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Wholesale Portal</h1>
            </div>
            <p className="text-xl text-gray-600">
              Partner login for dealers, agents, and wholesale distributors
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Login Form */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl">Partner Login</CardTitle>
                <CardDescription>
                  Enter your wholesale partner credentials to access the portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="partnerCode">Partner Code</Label>
                    <Input
                      id="partnerCode"
                      placeholder="Enter your partner code"
                      value={loginData.partnerCode}
                      onChange={(e) => setLoginData({...loginData, partnerCode: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={loginData.rememberMe}
                      onCheckedChange={(checked) => setLoginData({...loginData, rememberMe: !!checked})}
                    />
                    <Label htmlFor="rememberMe" className="text-sm">
                      Remember me for 30 days
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Access Wholesale Portal
                  </Button>
                </form>

                <div className="mt-6 text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Forgot your password? <a href="#" className="text-blue-600 hover:underline">Reset it here</a>
                  </p>
                  <p className="text-sm text-gray-600">
                    Need a partner account? <a href="#" className="text-blue-600 hover:underline">Apply for wholesale access</a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features Overview */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Wholesale Portal Features</h2>
                <p className="text-gray-600 mb-6">
                  Access powerful tools designed specifically for our wholesale partners
                </p>
              </div>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <feature.icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                          <p className="text-gray-600 text-sm">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Partner Benefits */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3 text-blue-900">Partner Benefits</h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Competitive wholesale pricing with volume discounts</li>
                    <li>• Up to 15% commission on all sales</li>
                    <li>• Marketing materials and sales support</li>
                    <li>• Dedicated partner success manager</li>
                    <li>• Real-time quote generation and processing</li>
                    <li>• White-label options available</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}