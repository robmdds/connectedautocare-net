import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldIcon, CreditCardIcon, Bot, BarChart3Icon } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShieldIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">TPA Platform</span>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Complete TPA Insurance
            <span className="text-primary block">Management Platform</span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-500">
            Streamline your insurance operations with our comprehensive Third Party Administrator platform. 
            Handle policies, claims, payments, and analytics all in one place.
          </p>
          <div className="mt-10">
            <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-blue-700 text-lg px-8 py-4">
              Get Started Today
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShieldIcon className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Multi-Industry Coverage</CardTitle>
              <CardDescription>Auto, RV, Marine, Powersports, and Home insurance management</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCardIcon className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Helcim Payments</CardTitle>
              <CardDescription>Secure payment processing with automatic policy issuance</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>Intelligent claim guidance and policy comparisons</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3Icon className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Real-time KPIs, conversion tracking, and business insights</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Manage Insurance Operations
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Insurance dashboard overview" 
                className="rounded-lg shadow-lg w-full h-96 object-cover"
              />
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Policy Lifecycle</h3>
                <p className="text-gray-600">From quote generation to policy issuance, renewals, and cancellations - manage the entire policy lifecycle with ease.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Claims Management</h3>
                <p className="text-gray-600">Streamlined FNOL process, adjuster assignment, workflow management, and automated audit trails.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Reseller Portal</h3>
                <p className="text-gray-600">White-label microsites, commission tracking, and embeddable widgets for your reseller network.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-primary rounded-2xl px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Insurance Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of insurance professionals who trust our platform.
          </p>
          <Button 
            onClick={handleLogin} 
            size="lg" 
            variant="secondary" 
            className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4"
          >
            Start Free Trial
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShieldIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold">TPA Platform</span>
            </div>
            <p className="text-gray-400">
              Comprehensive insurance management for the modern world.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
