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
  // Debug log to verify this is the new simplified component
  console.log("VSCQuoteWidget SIMPLIFIED FORM LOADED - v3.0", new Date().toISOString());
  
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
      {/* Simplified All-in-One Quote Form */}
      <Card className="border-2 border-blue-500">
        <CardHeader className="pb-3 bg-blue-50">
          <CardTitle className="text-3xl font-bold mb-3 text-blue-600">🎯 Get Your Free Quote (ALL-IN-ONE FORM) - v3.0</CardTitle>
          <p className="text-lg text-gray-700 font-semibold">Enter all information below for instant VSC pricing - no back and forth! Updated: {new Date().toLocaleTimeString()}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
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
                className="h-12 text-lg font-mono border-2 border-blue-300 focus:border-blue-500"
                maxLength={17}
                data-testid="input-vin"
              />
            </div>

            {/* Current Mileage */}
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
                className="h-12 text-lg border-2 border-blue-300 focus:border-blue-500"
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
                className="h-12 text-lg border-2 border-blue-300 focus:border-blue-500"
                data-testid="input-fullname"
              />
            </div>

            {/* Email Address */}
            <div>
              <Label htmlFor="email" className="text-lg font-semibold text-gray-900 mb-2 block">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-12 text-lg border-2 border-blue-300 focus:border-blue-500"
                data-testid="input-email"
              />
            </div>

            {/* ZIP Code */}
            <div>
              <Label htmlFor="zipCode" className="text-lg font-semibold text-gray-900 mb-2 block">
                ZIP Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter your ZIP code"
                className="h-12 text-lg border-2 border-blue-300 focus:border-blue-500"
                maxLength={10}
                data-testid="input-zipcode"
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleGenerateQuote}
              disabled={isProcessing}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              data-testid="button-generate-quote"
            >
              {isProcessing ? "Processing..." : "🚀 Get My VSC Quote (All-in-One)"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}