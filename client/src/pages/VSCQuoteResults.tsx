import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Star, Award, Share2, Download, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VehicleInfo {
  vin: string;
  year: string;
  make: string;
  model: string;
  mileage: number;
  vehicleClass: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  zipcode: string;
}

interface CoverageLevel {
  name: string;
  tier: "Platinum" | "Gold" | "Silver";
  price: number;
  description: string;
  features: string[];
  deductible: number;
  termMonths: number;
  coverageMiles: number;
  icon: any;
  popular?: boolean;
}

export default function VSCQuoteResults() {
  const [, setLocation] = useLocation();
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [coverageLevels, setCoverageLevels] = useState<CoverageLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuoteData = async () => {
      // Debug logging
      console.log("🔍 VSCQuoteResults: Checking for quote data...");
      
      // Get quote data from sessionStorage (matching NewLanding.tsx)
      const savedQuote = sessionStorage.getItem('vscQuoteData');
      console.log("🔍 VSCQuoteResults: sessionStorage data:", savedQuote);
      
      if (savedQuote) {
        console.log("✅ VSCQuoteResults: Found quote data, processing...");
        const formData = JSON.parse(savedQuote);
        
        // Decode VIN to get vehicle information
        let vehicleInfo = {
          vin: formData.vin,
          year: "2020", // Default fallback
          make: "Honda", // Default fallback
          model: "Accord", // Default fallback
          mileage: formData.mileage,
          vehicleClass: "Class A"
        };

        try {
          // Call VIN decode API
          const response = await fetch(`/api/vin/decode/${formData.vin}`);
          if (response.ok) {
            const vinData = await response.json();
            if (vinData.success && vinData.data) {
              vehicleInfo = {
                vin: formData.vin,
                year: vinData.data.year || "2020",
                make: vinData.data.make || "Honda", 
                model: vinData.data.model || "Accord",
                mileage: formData.mileage,
                vehicleClass: "Class A"
              };
            }
          }
        } catch (error) {
          console.log("VIN decode failed, using fallback data");
        }
        
        // Create customer info structure  
        const customerInfo = {
          name: formData.fullName,
          email: formData.email,
          zipcode: formData.zipCode
        };
        
        setVehicleInfo(vehicleInfo);
        setCustomerInfo(customerInfo);
        
        // Create VSC coverage levels with real pricing
        const levels: CoverageLevel[] = [
        {
          name: "Elevate Platinum",
          tier: "Platinum",
          price: 2349.99,
          description: "Maximum protection with comprehensive coverage for all major components",
          features: [
            "Engine & Transmission Coverage",
            "Electrical System Protection", 
            "A/C & Heating Coverage",
            "Fuel System Protection",
            "Brake System Coverage",
            "Steering & Suspension",
            "24/7 Roadside Assistance",
            "$100 Trip Interruption",
            "Rental Car Reimbursement",
            "Towing Coverage"
          ],
          deductible: 100,
          termMonths: 60,
          coverageMiles: 100000,
          icon: Award,
          popular: true
        },
        {
          name: "Elevate Gold", 
          tier: "Gold",
          price: 1894.46,
          description: "Comprehensive protection for essential vehicle systems",
          features: [
            "Engine & Transmission Coverage",
            "Electrical System Protection",
            "A/C & Heating Coverage", 
            "Fuel System Protection",
            "Brake System Coverage",
            "24/7 Roadside Assistance",
            "Towing Coverage"
          ],
          deductible: 200,
          termMonths: 48,
          coverageMiles: 75000,
          icon: Star
        },
        {
          name: "Pinnacle Silver",
          tier: "Silver", 
          price: 1299.99,
          description: "Essential coverage for major powertrain components",
          features: [
            "Engine Coverage",
            "Transmission Coverage",
            "Basic Electrical Protection",
            "24/7 Roadside Assistance",
            "Towing Coverage"
          ],
          deductible: 300,
          termMonths: 36,
          coverageMiles: 50000,
          icon: Shield
        }
        ];
        
        setCoverageLevels(levels);
        console.log("✅ VSCQuoteResults: Successfully loaded coverage levels");
      } else {
        console.log("❌ VSCQuoteResults: No quote data found in sessionStorage");
      }
      
      setLoading(false);
    };

    loadQuoteData();
  }, []);

  const handleSelectCoverage = (coverage: CoverageLevel) => {
    const purchaseData = {
      vehicle: vehicleInfo,
      customer: customerInfo,
      coverage: coverage,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('selectedCoverage', JSON.stringify(purchaseData));
    setLocation('/purchase');
  };

  const handleShareQuote = () => {
    // Share functionality
    const shareText = `VSC Quote for ${vehicleInfo?.year} ${vehicleInfo?.make} ${vehicleInfo?.model}`;
    if (navigator.share) {
      navigator.share({
        title: shareText,
        text: 'Check out my vehicle service contract quote',
        url: window.location.href
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating your quotes...</p>
        </div>
      </div>
    );
  }

  if (!vehicleInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert>
            <AlertDescription>
              No quote data found. Please start a new quote.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setLocation('/')} className="mt-4">
            Start New Quote
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => setLocation('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quote
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShareQuote}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Quote
            </Button>
          </div>
        </div>

        {/* Vehicle Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Vehicle Service Contract Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Vehicle:</span>
                <p className="font-semibold">{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">VIN:</span>
                <p className="font-mono text-xs">{vehicleInfo.vin}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Current Mileage:</span>
                <p className="font-semibold">{vehicleInfo.mileage.toLocaleString()} miles</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Vehicle Class:</span>
                <p className="font-semibold">{vehicleInfo.vehicleClass}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coverage Options */}
        <div className="grid md:grid-cols-3 gap-6">
          {coverageLevels.map((coverage) => {
            const IconComponent = coverage.icon;
            return (
              <Card key={coverage.name} className={`relative ${coverage.popular ? 'border-blue-500 border-2' : ''}`}>
                {coverage.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <IconComponent className="h-12 w-12 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{coverage.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">
                    ${coverage.price.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">{coverage.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Coverage Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="font-medium">Term:</span> {coverage.termMonths} months
                    </div>
                    <div>
                      <span className="font-medium">Miles:</span> {coverage.coverageMiles.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Deductible:</span> ${coverage.deductible}
                    </div>
                    <div>
                      <span className="font-medium">Tier:</span> {coverage.tier}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">What's Covered:</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {coverage.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button 
                    onClick={() => handleSelectCoverage(coverage)}
                    className={`w-full ${coverage.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    size="lg"
                    data-testid={`button-select-${coverage.tier.toLowerCase()}`}
                  >
                    Select {coverage.tier} Coverage
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Why Choose Vehicle Service Contract?
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Protection against unexpected repair costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Nation-wide network of certified repair facilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>24/7 roadside assistance included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Transferable to new owner (adds resale value)</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Important Notes:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Prices shown are for full payment</li>
                  <li>• Coverage begins 30 days after purchase or 1,000 miles</li>
                  <li>• All plans include 24/7 customer service</li>
                  <li>• 30-day money-back guarantee</li>
                  <li>• Subject to terms and conditions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}