import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Car, Home, Ship, Truck } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Shield className="mx-auto mb-6 h-16 w-16 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TPA Insurance Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comprehensive insurance management for auto, RV, marine, powersports, and home coverage. 
            Advanced claims processing, AI assistance, and seamless payment integration.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Car className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <CardTitle className="text-lg">Auto Insurance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive auto coverage with liability, collision, and comprehensive options
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Truck className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <CardTitle className="text-lg">RV Insurance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Specialized coverage for recreational vehicles and motorhomes
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Ship className="mx-auto mb-2 h-8 w-8 text-cyan-600" />
              <CardTitle className="text-lg">Marine Insurance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete protection for boats, watercraft, and marine equipment
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Home className="mx-auto mb-2 h-8 w-8 text-orange-600" />
              <CardTitle className="text-lg">Home Insurance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive homeowners coverage for property and liability
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Platform Features */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-3">AI-Powered Claims</h3>
              <p className="text-gray-600">
                Advanced AI analysis for claim processing, fraud detection, and damage estimation
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-3">Instant Quotes</h3>
              <p className="text-gray-600">
                Real-time quote generation with VIN decoding and smart rating engine
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
              <p className="text-gray-600">
                Integrated Helcim payment processing with automatic policy issuance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}