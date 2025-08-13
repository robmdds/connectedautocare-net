import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Car, 
  CheckCircle, 
  Phone, 
  Search,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";

export default function LandingNew() {
  const [, setLocation] = useLocation();
  const [vinInput, setVinInput] = useState("");
  const [vinError, setVinError] = useState("");
  const [mileageInput, setMileageInput] = useState("");
  const [mileageError, setMileageError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const validateVIN = (vin: string) => {
    const cleanVin = vin.replace(/\s/g, '').toUpperCase();
    if (cleanVin.length !== 17) {
      return "VIN must be exactly 17 characters";
    }
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) {
      return "VIN contains invalid characters";
    }
    return "";
  };

  const validateMileage = (mileage: string) => {
    if (!mileage || mileage.trim() === "") {
      return "Current mileage is required";
    }
    const miles = parseInt(mileage);
    if (isNaN(miles) || miles < 0) {
      return "Please enter a valid mileage";
    }
    if (miles > 500000) {
      return "Mileage cannot exceed 500,000 miles";
    }
    return "";
  };

  const handleVinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVin = vinInput.replace(/\s/g, '').toUpperCase();
    
    const vinError = validateVIN(cleanVin);
    const mileageValidationError = validateMileage(mileageInput);
    
    if (vinError) {
      setVinError(vinError);
      return;
    }
    if (mileageValidationError) {
      setMileageError(mileageValidationError);
      return;
    }

    setVinError("");
    setMileageError("");
    setIsProcessing(true);
    
    try {
      // Call VIN decode service to get vehicle info
      const response = await fetch('/api/vehicles/decode-vin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vin: cleanVin,
          mileage: parseInt(mileageInput)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to decode VIN');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to decode VIN');
      }
      
      const vehicleData = result.vehicle;
      
      // Store quote data for the results page
      const quoteData = {
        vehicle: {
          vin: cleanVin,
          year: vehicleData.year,
          make: vehicleData.make,
          model: vehicleData.model,
          mileage: parseInt(mileageInput),
          vehicleClass: vehicleData.vehicleClass || 'Class A'
        },
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('currentQuote', JSON.stringify(quoteData));
      
      // Redirect to VSC quote results page
      setLocation('/vsc-quote');
    } catch (error) {
      console.error('Error processing VIN:', error);
      setVinError('Unable to process VIN. Please check and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">Connected Auto Care</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleLogin}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center text-white mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Vehicle Service Contract Protection
              </h1>
              <p className="text-xl mb-8">
                Comprehensive coverage for your vehicle with instant quotes and nationwide service
              </p>
            </div>

            {/* VIN Quote Form - PROMINENT ENTRY */}
            <div className="bg-white rounded-lg shadow-xl p-8 text-gray-900">
              <div className="text-center mb-6">
                <Car className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                <h3 className="text-3xl font-bold mb-3 text-blue-600">Get Your Free Quote</h3>
                <p className="text-lg text-gray-700 font-semibold">Enter your VIN and current mileage for instant pricing</p>
              </div>
              
              {/* Single Border Container */}
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-blue-400 shadow-sm">
                <form onSubmit={handleVinSubmit} className="space-y-6">
                  {/* VIN Input */}
                  <div className="space-y-3">
                    <label htmlFor="vin-input" className="block text-lg font-bold text-gray-900">
                      Vehicle Identification Number (VIN) <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="vin-input"
                      type="text"
                      placeholder="Enter 17-character VIN (e.g., JF1GJAC66DH033129)"
                      value={vinInput}
                      onChange={(e) => {
                        setVinInput(e.target.value);
                        setVinError("");
                      }}
                      className={`text-xl font-mono tracking-wider h-14 ${vinError ? 'border-red-500' : ''}`}
                      maxLength={17}
                      data-testid="input-vin"
                    />
                    {vinError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{vinError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* MILEAGE INPUT */}
                  <div className="space-y-3">
                    <label htmlFor="mileage-input" className="block text-lg font-bold text-gray-900">
                      Current Mileage <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="mileage-input"
                      type="number"
                      placeholder="Enter current mileage (e.g., 85000)"
                      value={mileageInput}
                      onChange={(e) => {
                        setMileageInput(e.target.value);
                        setMileageError("");
                      }}
                      className={`text-xl h-14 ${mileageError ? 'border-red-500' : ''}`}
                      min="0"
                      max="500000"
                      data-testid="input-mileage"
                    />
                    {mileageError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{mileageError}</AlertDescription>
                      </Alert>
                    )}
                    <p className="text-sm text-gray-600">Required for accurate coverage eligibility and pricing</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mt-6">
                    <h4 className="font-semibold text-blue-900 mb-2">What you'll get:</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Instant vehicle information and eligibility
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Real-time pricing for all coverage levels
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Professional quote you can share or save
                      </li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    size="lg"
                    disabled={isProcessing || vinInput.length < 17 || !mileageInput}
                    data-testid="button-get-vin-quote"
                  >
                    {isProcessing ? (
                      <>Processing VIN...</>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Get Instant Quote
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}