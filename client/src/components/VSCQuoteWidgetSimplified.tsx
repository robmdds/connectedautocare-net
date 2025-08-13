import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface VSCQuoteWidgetSimplifiedProps {
  onQuoteSelect?: (quote: any) => void;
}

export function VSCQuoteWidgetSimplified({ onQuoteSelect }: VSCQuoteWidgetSimplifiedProps) {
  // Debug log to verify this is the new simplified component
  console.log("VSCQuoteWidgetSimplified LOADED - CACHE BUSTED v4.0", new Date().toISOString());
  
  const [vin, setVin] = useState('');
  const [mileage, setMileage] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleGenerateQuote = () => {
    if (!vin || !mileage || !fullName || !email || !zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate your VSC quote.",
        variant: "destructive",
      });
      return;
    }

    if (vin.length !== 17) {
      toast({
        title: "Invalid VIN",
        description: "VIN must be exactly 17 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Navigate to quote results with form data
    const formData = {
      vin,
      mileage: parseInt(mileage),
      fullName,
      email,
      zipCode
    };
    
    // Store form data in sessionStorage for the results page
    sessionStorage.setItem('vscQuoteData', JSON.stringify(formData));
    
    // Navigate to results page
    setTimeout(() => {
      window.location.href = '/vsc-quote';
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* CACHE-BUSTED Simplified All-in-One Quote Form */}
      <Card className="border-4 border-green-500 bg-green-50">
        <CardHeader className="pb-3 bg-green-100">
          <CardTitle className="text-3xl font-bold mb-3 text-green-800">✅ SIMPLIFIED VSC QUOTE FORM - v4.0 WORKING!</CardTitle>
          <p className="text-lg text-gray-800 font-semibold">All 5 fields below are required for accurate tax calculation and quote saving. Updated: {new Date().toLocaleTimeString()}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* VIN Input */}
            <div>
              <Label htmlFor="vin" className="text-lg font-semibold text-gray-900 mb-2 block">
                Vehicle Identification Number (VIN) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="Enter 17-character VIN (e.g., JF1GJAC66DH033129)"
                className="h-14 text-lg font-mono border-2 border-green-400 focus:border-green-600"
                maxLength={17}
                data-testid="input-vin"
              />
            </div>

            {/* Current Mileage - SINGLE FIELD ONLY */}
            <div>
              <Label htmlFor="mileage" className="text-lg font-semibold text-gray-900 mb-2 block">
                Current Mileage <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mileage"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Enter current mileage (e.g., 45000)"
                className="h-14 text-lg border-2 border-green-400 focus:border-green-600"
                data-testid="input-mileage"
              />
            </div>

            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="text-lg font-semibold text-gray-900 mb-2 block">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="h-14 text-lg border-2 border-green-400 focus:border-green-600"
                data-testid="input-fullname"
              />
            </div>

            {/* Email Address - REQUIRED FOR QUOTE SAVING */}
            <div>
              <Label htmlFor="email" className="text-lg font-semibold text-gray-900 mb-2 block">
                Email Address <span className="text-red-500">*</span> <span className="text-sm text-gray-600">(For quote delivery)</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-14 text-lg border-2 border-green-400 focus:border-green-600"
                data-testid="input-email"
              />
            </div>

            {/* ZIP Code - REQUIRED FOR TAX CALCULATION */}
            <div>
              <Label htmlFor="zipCode" className="text-lg font-semibold text-gray-900 mb-2 block">
                ZIP Code <span className="text-red-500">*</span> <span className="text-sm text-gray-600">(For tax calculation)</span>
              </Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter your ZIP code"
                className="h-14 text-lg border-2 border-green-400 focus:border-green-600"
                maxLength={10}
                data-testid="input-zipcode"
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleGenerateQuote}
              disabled={isProcessing}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg"
              data-testid="button-generate-quote"
            >
              {isProcessing ? "Processing..." : "🚀 Get Complete VSC Quote (All 5 Fields Required)"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}