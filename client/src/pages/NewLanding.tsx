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

export default function NewLanding() {
  console.log("🚀 NEW LANDING PAGE COMPONENT LOADED - FRESH START", new Date().toISOString());
  
  const [, setLocation] = useLocation();
  const [vinInput, setVinInput] = useState("");
  const [vinError, setVinError] = useState("");
  const [mileageInput, setMileageInput] = useState("");
  const [mileageError, setMileageError] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [zipcodeInput, setZipcodeInput] = useState("");
  const [zipcodeError, setZipcodeError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    let hasErrors = false;
    
    if (!vinInput || vinInput.length !== 17) {
      setVinError("VIN must be exactly 17 characters");
      hasErrors = true;
    }
    
    if (!mileageInput) {
      setMileageError("Current mileage is required");
      hasErrors = true;
    }
    
    if (!nameInput.trim()) {
      setNameError("Full name is required");
      hasErrors = true;
    }
    
    if (!emailInput.trim()) {
      setEmailError("Email address is required");
      hasErrors = true;
    }
    
    if (!zipcodeInput.trim()) {
      setZipcodeError("ZIP code is required");
      hasErrors = true;
    }
    
    if (hasErrors) return;
    
    setIsProcessing(true);
    
    // Store form data in sessionStorage for the results page
    const formData = {
      vin: vinInput.toUpperCase(),
      mileage: parseInt(mileageInput),
      fullName: nameInput.trim(),
      email: emailInput.trim(),
      zipCode: zipcodeInput.trim()
    };
    
    sessionStorage.setItem('vscQuoteData', JSON.stringify(formData));
    
    // Navigate to results page
    setTimeout(() => {
      setLocation('/vsc-quote');
    }, 500);
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'}}>
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">Connected Auto Care - NEW FORM v6.0</span>
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
                🚀 NEW COMPONENT v6.0 - Vehicle Service Contract
              </h1>
              <p className="text-xl mb-8">
                FRESH COMPONENT WITH ALL 5 REQUIRED FIELDS - Time: {new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* NEW COMPLETE FORM */}
            <div className="bg-white rounded-lg shadow-xl p-8 text-gray-900 border-8 border-yellow-400">
              <div className="text-center mb-6">
                <Car className="mx-auto h-16 w-16 text-yellow-600 mb-4" />
                <h3 className="text-3xl font-bold mb-3 text-yellow-800">🚀 FRESH FORM - ALL 5 FIELDS v6.0</h3>
                <p className="text-lg text-gray-800 font-semibold">This is a completely NEW component with Email & ZIP Code! Created: {new Date().toLocaleTimeString()}</p>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg border-4 border-yellow-500 shadow-sm">
                <form onSubmit={handleQuoteSubmit} className="space-y-6">
                  {/* VIN Input */}
                  <div className="space-y-3">
                    <label htmlFor="vin-input-new" className="block text-xl font-bold text-gray-900">
                      1. Vehicle Identification Number (VIN) <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="vin-input-new"
                      type="text"
                      placeholder="Enter 17-character VIN (e.g., JF1GJAC66DH033129)"
                      value={vinInput}
                      onChange={(e) => {
                        setVinInput(e.target.value.toUpperCase());
                        setVinError("");
                      }}
                      className="text-xl font-mono tracking-wider h-16 border-4 border-yellow-400"
                      maxLength={17}
                      data-testid="input-vin-new"
                    />
                    {vinError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{vinError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* MILEAGE INPUT - SINGLE FIELD */}
                  <div className="space-y-3">
                    <label htmlFor="mileage-input-new" className="block text-xl font-bold text-gray-900">
                      2. Current Mileage <span className="text-red-500">*</span> (SINGLE FIELD - NO DUPLICATES)
                    </label>
                    <Input 
                      id="mileage-input-new"
                      type="number"
                      placeholder="Enter current mileage (e.g., 85000)"
                      value={mileageInput}
                      onChange={(e) => {
                        setMileageInput(e.target.value);
                        setMileageError("");
                      }}
                      className="text-xl h-16 border-4 border-yellow-400"
                      min="0"
                      max="500000"
                      data-testid="input-mileage-new"
                    />
                    {mileageError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{mileageError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* FULL NAME */}
                  <div className="space-y-3">
                    <label htmlFor="name-input-new" className="block text-xl font-bold text-gray-900">
                      3. Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="name-input-new"
                      type="text"
                      placeholder="Enter your full name"
                      value={nameInput}
                      onChange={(e) => {
                        setNameInput(e.target.value);
                        setNameError("");
                      }}
                      className="text-xl h-16 border-4 border-yellow-400"
                      data-testid="input-name-new"
                    />
                    {nameError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{nameError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* EMAIL - REQUIRED FOR QUOTE DELIVERY */}
                  <div className="space-y-3">
                    <label htmlFor="email-input-new" className="block text-xl font-bold text-gray-900">
                      4. Email Address <span className="text-red-500">*</span> 
                      <span className="text-lg bg-green-200 px-3 py-1 rounded ml-2">(Required for quote delivery & logging)</span>
                    </label>
                    <Input 
                      id="email-input-new"
                      type="email"
                      placeholder="Enter your email address"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setEmailError("");
                      }}
                      className="text-xl h-16 border-4 border-yellow-400"
                      data-testid="input-email-new"
                    />
                    {emailError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{emailError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* ZIP CODE - REQUIRED FOR TAX CALCULATION */}
                  <div className="space-y-3">
                    <label htmlFor="zipcode-input-new" className="block text-xl font-bold text-gray-900">
                      5. ZIP Code <span className="text-red-500">*</span> 
                      <span className="text-lg bg-green-200 px-3 py-1 rounded ml-2">(Required for tax calculation)</span>
                    </label>
                    <Input 
                      id="zipcode-input-new"
                      type="text"
                      placeholder="Enter ZIP code (e.g., 12345)"
                      value={zipcodeInput}
                      onChange={(e) => {
                        setZipcodeInput(e.target.value);
                        setZipcodeError("");
                      }}
                      className="text-xl h-16 border-4 border-yellow-400"
                      maxLength={10}
                      data-testid="input-zipcode-new"
                    />
                    {zipcodeError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{zipcodeError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="bg-green-100 p-4 rounded-lg mt-6 border-2 border-green-400">
                    <h4 className="font-semibold text-green-900 mb-2">✅ ALL 5 FIELDS CAPTURED:</h4>
                    <ul className="space-y-1 text-sm text-green-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        VIN for vehicle identification
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Mileage for coverage eligibility
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Name for customer identification
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Email for quote delivery and logging
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        ZIP Code for accurate tax calculation
                      </li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-black text-2xl font-bold h-20 border-4 border-yellow-800" 
                    size="lg"
                    disabled={isProcessing || vinInput.length < 17 || !mileageInput || !nameInput.trim() || !emailInput.trim() || !zipcodeInput.trim()}
                    data-testid="button-get-quote-new"
                  >
                    {isProcessing ? (
                      <>Processing All 5 Fields...</>
                    ) : (
                      <>
                        <Search className="h-6 w-6 mr-3" />
                        🚀 GET VSC QUOTE - ALL 5 FIELDS CAPTURED v6.0
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