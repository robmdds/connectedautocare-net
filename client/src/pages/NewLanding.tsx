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
    AlertCircle,
    LogOut,
    User
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function NewLanding() {

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

    const handleQuoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanVin = vinInput.replace(/\s/g, '').toUpperCase();

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

            // Store quote data for the results page including customer info (same format as LandingNew)
            const quoteData = {
                vehicle: {
                    vin: cleanVin,
                    year: vehicleData.year,
                    make: vehicleData.make,
                    model: vehicleData.model,
                    mileage: parseInt(mileageInput),
                    vehicleClass: vehicleData.vehicleClass || 'Class A'
                },
                customer: {
                    name: nameInput.trim(),
                    email: emailInput.trim(),
                    zipcode: zipcodeInput.trim()
                },
                timestamp: new Date().toISOString()
            };

            console.log("💾 NewLanding: Saving quote data to localStorage:", quoteData);
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
        setLocation("/login");
    };

    const handleLogout = () => {
        setLocation('/logout');
    };

    const handleDashboard = () => {
        // Role-based routing for dashboard access
        if (user?.role?.toLowerCase() === 'admin') {
            setLocation('/admin');
        } else {
            setLocation('/');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800" style={{background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'}}>
            {/* Navigation */}
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

            {/* Hero Section */}
            <div className="relative py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center text-white mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                Vehicle Service Contract Protection
                            </h1>
                            <p className="text-lg mb-6">
                                Comprehensive coverage for your vehicle with instant quotes and nationwide service
                            </p>
                        </div>

                        {/* VSC Quote Form */}
                        <div className="bg-white rounded-lg shadow-xl p-6 text-gray-900">
                            <div className="text-center mb-6">
                                <Car className="mx-auto h-12 w-12 text-blue-600 mb-3" />
                                <h3 className="text-2xl font-bold mb-2 text-blue-600">Get Your Free Quote</h3>
                                <p className="text-gray-700">Enter your information below for instant VSC pricing</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
                                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                                    {/* Vehicle Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* VIN Input */}
                                        <div className="space-y-2">
                                            <label htmlFor="vin-input-new" className="block text-sm font-semibold text-gray-900">
                                                Vehicle Identification Number (VIN) <span className="text-blue-600">*</span>
                                            </label>
                                            <Input
                                                id="vin-input-new"
                                                type="text"
                                                placeholder="Enter 17-character VIN"
                                                value={vinInput}
                                                onChange={(e) => {
                                                    setVinInput(e.target.value.toUpperCase());
                                                    setVinError("");
                                                }}
                                                className="font-mono tracking-wide border-blue-300 focus:border-blue-500"
                                                maxLength={17}
                                                data-testid="input-vin-new"
                                            />
                                            {vinError && (
                                                <Alert variant="destructive" className="py-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>{vinError}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>

                                        {/* Mileage Input */}
                                        <div className="space-y-2">
                                            <label htmlFor="mileage-input-new" className="block text-sm font-semibold text-gray-900">
                                                Current Mileage <span className="text-blue-600">*</span>
                                            </label>
                                            <Input
                                                id="mileage-input-new"
                                                type="number"
                                                placeholder="Enter current mileage"
                                                value={mileageInput}
                                                onChange={(e) => {
                                                    setMileageInput(e.target.value);
                                                    setMileageError("");
                                                }}
                                                className="border-blue-300 focus:border-blue-500"
                                                min="0"
                                                max="500000"
                                                data-testid="input-mileage-new"
                                            />
                                            {mileageError && (
                                                <Alert variant="destructive" className="py-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>{mileageError}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Full Name */}
                                        <div className="space-y-2">
                                            <label htmlFor="name-input-new" className="block text-sm font-semibold text-gray-900">
                                                Full Name <span className="text-blue-600">*</span>
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
                                                className="border-blue-300 focus:border-blue-500"
                                                data-testid="input-name-new"
                                            />
                                            {nameError && (
                                                <Alert variant="destructive" className="py-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>{nameError}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <label htmlFor="email-input-new" className="block text-sm font-semibold text-gray-900">
                                                Email Address <span className="text-blue-600">*</span>
                                            </label>
                                            <Input
                                                id="email-input-new"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={emailInput}
                                                onChange={(e) => {
                                                    setEmailInput(e.target.value);
                                                    setEmailError("");
                                                }}
                                                className="border-blue-300 focus:border-blue-500"
                                                data-testid="input-email-new"
                                            />
                                            {emailError && (
                                                <Alert variant="destructive" className="py-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>{emailError}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>

                                        {/* ZIP Code */}
                                        <div className="space-y-2">
                                            <label htmlFor="zipcode-input-new" className="block text-sm font-semibold text-gray-900">
                                                ZIP Code <span className="text-blue-600">*</span>
                                            </label>
                                            <Input
                                                id="zipcode-input-new"
                                                type="text"
                                                placeholder="Enter ZIP code"
                                                value={zipcodeInput}
                                                onChange={(e) => {
                                                    setZipcodeInput(e.target.value);
                                                    setZipcodeError("");
                                                }}
                                                className="border-blue-300 focus:border-blue-500"
                                                maxLength={10}
                                                data-testid="input-zipcode-new"
                                            />
                                            {zipcodeError && (
                                                <Alert variant="destructive" className="py-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>{zipcodeError}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg mt-4">
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
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        size="lg"
                                        disabled={isProcessing || vinInput.length < 17 || !mileageInput || !nameInput.trim() || !emailInput.trim() || !zipcodeInput.trim()}
                                        data-testid="button-get-quote-new"
                                    >
                                        {isProcessing ? (
                                            <>Processing...</>
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