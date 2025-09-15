import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Car,
  CheckCircle,
  AlertCircle,
  LogOut,
  User,
  Search,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function LandingNew() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();
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

  const validateVIN = (vin: string) => {
    const cleanVin = vin.replace(/\s/g, "").toUpperCase();
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

  const validateName = (name: string) => {
    if (!name || name.trim() === "") {
      return "Full name is required";
    }
    if (name.trim().length < 2) {
      return "Please enter a valid name";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email || email.trim() === "") {
      return "Email address is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateZipcode = (zipcode: string) => {
    if (!zipcode || zipcode.trim() === "") {
      return "ZIP code is required";
    }
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zipcode)) {
      return "Please enter a valid ZIP code (12345 or 12345-6789)";
    }
    return "";
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVin = vinInput.replace(/\s/g, "").toUpperCase();

    const vinValidationError = validateVIN(cleanVin);
    const mileageValidationError = validateMileage(mileageInput);
    const nameValidationError = validateName(nameInput);
    const emailValidationError = validateEmail(emailInput);
    const zipcodeValidationError = validateZipcode(zipcodeInput);

    setVinError("");
    setMileageError("");
    setNameError("");
    setEmailError("");
    setZipcodeError("");

    if (vinValidationError) {
      setVinError(vinValidationError);
      return;
    }
    if (mileageValidationError) {
      setMileageError(mileageValidationError);
      return;
    }
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }
    if (zipcodeValidationError) {
      setZipcodeError(zipcodeValidationError);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/vehicles/decode-vin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vin: cleanVin,
          mileage: parseInt(mileageInput),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to decode VIN");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to decode VIN");
      }

      const vehicleData = result.vehicle;

      const quoteData = {
        vehicle: {
          vin: cleanVin,
          year: vehicleData.year,
          make: vehicleData.make,
          model: vehicleData.model,
          mileage: parseInt(mileageInput),
          vehicleClass: vehicleData.vehicleClass || "Class A",
        },
        customer: {
          name: nameInput.trim(),
          email: emailInput.trim(),
          zipcode: zipcodeInput.trim(),
        },
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("currentQuote", JSON.stringify(quoteData));

      setLocation("/vsc-quote");
    } catch (error) {
      console.error("Error processing VIN:", error);
      setVinError("Unable to process VIN. Please check and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = () => {
    setLocation("/login"); // Use wouter navigation
  };

  const handleLogout = () => {
    setLocation("/logout");
  };

  const handleDashboard = () => {
    if (user?.role?.toLowerCase() === "admin") {
      setLocation("/dashboard");
    } else {
      setLocation("/");
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800"
      style={{ background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)" }}
    >
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">Connected Auto Care</span>
            </div>
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              ) : isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <User className="h-4 w-4" />
                    <span>Welcome, {user.firstName || user.email}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {user.role}
                    </span>
                  </div>
                  <Button variant="outline" onClick={handleDashboard}>
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleLogin}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center text-white mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Vehicle Service Contract Protection
              </h1>
              <p className="text-xl mb-8">
                Complete 5-field form with Email & ZIP Code - Get Your Quote Today
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-8 text-gray-900 border-4 border-blue-600">
              <div className="text-center mb-6">
                <Car className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                <h3 className="text-3xl font-bold mb-3 text-blue-800">Get Your VSC Quote</h3>
                <p className="text-lg text-gray-800 font-semibold">
                  Complete form for accurate pricing and coverage options
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300 shadow-sm">
                <form onSubmit={handleQuoteSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label
                      htmlFor="vin-input"
                      className="block text-lg font-bold text-gray-900"
                    >
                      Vehicle Identification Number (VIN) <span className="text-blue-600">*</span>
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
                      className={`text-xl font-mono tracking-wider h-14 ${
                        vinError ? "border-red-500" : "border-blue-300 focus:border-blue-500"
                      }`}
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
                  <div className="space-y-3">
                    <label
                      htmlFor="mileage-input"
                      className="block text-lg font-bold text-gray-900"
                    >
                      Current Mileage <span className="text-blue-600">*</span>
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
                      className={`text-xl h-14 ${
                        mileageError ? "border-red-500" : "border-blue-300 focus:border-blue-500"
                      }`}
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
                    <p className="text-sm text-blue-700">
                      Required for accurate coverage eligibility and pricing
                    </p>
                  </div>
                  <div className="border-t border-blue-200 pt-6">
                    <h4 className="text-xl font-bold text-blue-800 mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label
                          htmlFor="name-input"
                          className="block text-lg font-bold text-gray-900"
                        >
                          Full Name <span className="text-blue-600">*</span>
                        </label>
                        <Input
                          id="name-input"
                          type="text"
                          placeholder="Enter your full name"
                          value={nameInput}
                          onChange={(e) => {
                            setNameInput(e.target.value);
                            setNameError("");
                          }}
                          className={`text-lg h-12 ${
                            nameError ? "border-red-500" : "border-blue-300 focus:border-blue-500"
                          }`}
                          data-testid="input-name"
                        />
                        {nameError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{nameError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="zipcode-input"
                          className="block text-lg font-bold text-gray-900"
                        >
                          ZIP Code <span className="text-blue-600">*</span>
                        </label>
                        <Input
                          id="zipcode-input"
                          type="text"
                          placeholder="Enter ZIP code (e.g., 12345)"
                          value={zipcodeInput}
                          onChange={(e) => {
                            setZipcodeInput(e.target.value);
                            setZipcodeError("");
                          }}
                          className={`text-lg h-12 ${
                            zipcodeError ? "border-red-500" : "border-blue-300 focus:border-blue-500"
                          }`}
                          maxLength={10}
                          data-testid="input-zipcode"
                        />
                        {zipcodeError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{zipcodeError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 mt-4">
                      <label
                        htmlFor="email-input"
                        className="block text-lg font-bold text-gray-900"
                      >
                        Email Address <span className="text-blue-600">*</span>
                      </label>
                      <Input
                        id="email-input"
                        type="email"
                        placeholder="Enter your email address"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          setEmailError("");
                        }}
                        className={`text-lg h-12 ${
                          emailError ? "border-red-500" : "border-blue-300 focus:border-blue-500"
                        }`}
                        data-testid="input-email"
                      />
                      {emailError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{emailError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="bg-blue-100 border border-blue-300 p-4 rounded-lg mt-6">
                    <h4 className="font-semibold text-blue-900 mb-2">What you'll get:</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                        Instant vehicle information and eligibility
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                        Real-time pricing for all coverage levels
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                        Professional quote you can share or save
                      </li>
                    </ul>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-xl font-bold h-16 text-white"
                    size="lg"
                    disabled={
                      isProcessing ||
                      vinInput.length < 17 ||
                      !mileageInput ||
                      !nameInput.trim() ||
                      !emailInput.trim() ||
                      !zipcodeInput.trim()
                    }
                    data-testid="button-get-quote"
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Get Complete VSC Quote (All 5 Fields Required)
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