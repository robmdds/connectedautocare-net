import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface VSCQuoteWidgetProps {
  onQuoteSelect?: (quote: any) => void;
}

export function VSCQuoteWidget({ onQuoteSelect }: VSCQuoteWidgetProps) {
  // FORCE CACHE CLEAR - THIS IS THE NEW SIMPLIFIED FORM
  console.log("🔥 CACHE CLEARED - NEW VSC FORM LOADED v5.0", new Date().toISOString());
  
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
      {/* COMPLETELY NEW CACHE-BUSTED FORM */}
      <Card className="border-4 border-red-500 bg-red-50">
        <CardHeader className="pb-3 bg-red-100">
          <CardTitle className="text-3xl font-bold mb-3 text-red-800">🔥 CACHE BUSTED - ALL 5 FIELDS FORM v5.0</CardTitle>
          <p className="text-lg text-gray-800 font-semibold">This is the NEW form with ALL 5 REQUIRED FIELDS including Email & ZIP Code! Time: {new Date().toLocaleTimeString()}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* VIN Input */}
            <div>
              <Label htmlFor="vin" className="text-lg font-semibold text-gray-900 mb-2 block">
                1. Vehicle Identification Number (VIN) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="Enter 17-character VIN (e.g., JF1GJAC66DH033129)"
                className="h-14 text-lg font-mono border-2 border-red-400 focus:border-red-600"
                maxLength={17}
                data-testid="input-vin"
              />
            </div>

            {/* SINGLE Mileage Field - NO DUPLICATES */}
            <div>
              <Label htmlFor="mileage" className="text-lg font-semibold text-gray-900 mb-2 block">
                2. Current Mileage <span className="text-red-500">*</span> (SINGLE FIELD ONLY)
              </Label>
              <Input
                id="mileage"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Enter current mileage (e.g., 45000)"
                className="h-14 text-lg border-2 border-red-400 focus:border-red-600"
                data-testid="input-mileage"
              />
            </div>

            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="text-lg font-semibold text-gray-900 mb-2 block">
                3. Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="h-14 text-lg border-2 border-red-400 focus:border-red-600"
                data-testid="input-fullname"
              />
            </div>

            {/* Email Address - REQUIRED FOR QUOTE SAVING */}
            <div>
              <Label htmlFor="email" className="text-lg font-semibold text-gray-900 mb-2 block">
                4. Email Address <span className="text-red-500">*</span> <span className="text-sm bg-yellow-200 px-2 py-1 rounded">(Required for quote delivery)</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-14 text-lg border-2 border-red-400 focus:border-red-600"
                data-testid="input-email"
              />
            </div>

            {/* ZIP Code - REQUIRED FOR TAX CALCULATION */}
            <div>
              <Label htmlFor="zipCode" className="text-lg font-semibold text-gray-900 mb-2 block">
                5. ZIP Code <span className="text-red-500">*</span> <span className="text-sm bg-yellow-200 px-2 py-1 rounded">(Required for tax calculation)</span>
              </Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter your ZIP code"
                className="h-14 text-lg border-2 border-red-400 focus:border-red-600"
                maxLength={10}
                data-testid="input-zipcode"
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleGenerateQuote}
              disabled={isProcessing}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg"
              data-testid="button-generate-quote"
            >
              {isProcessing ? "Processing..." : "🔥 Get Complete VSC Quote (All 5 Fields Required)"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}