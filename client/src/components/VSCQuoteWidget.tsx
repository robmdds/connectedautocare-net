import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Clock, Car, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface QuoteData {
  id: string;
  productId: string;
  productName: string;
  totalPremium: number;
  monthlyPremium: number;
  termLength: string;
  coverageMiles: string;
  deductible: number;
  coverageDetails: string[];
}

interface VSCQuoteWidgetProps {
  onQuoteSelect?: (quote: QuoteData) => void;
}

export function VSCQuoteWidget({ onQuoteSelect }: VSCQuoteWidgetProps) {
  const [vin, setVin] = useState('JF1GJAC66DH033129'); // Default for demo
  const [mileage, setMileage] = useState('12346');
  const [termLength, setTermLength] = useState('36 months');
  const [coverageMiles, setCoverageMiles] = useState('45,000');
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const { toast } = useToast();

  const generateQuotesMutation = useMutation({
    mutationFn: async () => {
      // First decode VIN to get vehicle info
      const vehicleResponse = await fetch(`/api/vin-decode/${vin}`);
      const vehicleData = await vehicleResponse.json();
      setVehicleInfo(vehicleData.vehicle || vehicleData);

      // Generate quotes for all three products
      const products = ['ELEVATE_PLATINUM', 'ELEVATE_GOLD', 'PINNACLE_SILVER'];
      const quotePromises = products.map(async (productId) => {
        const response = await fetch('/api/connected-auto-care/quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vin,
            mileage: parseInt(mileage),
            productId,
            termLength,
            coverageMiles
          }),
        });
        const data = await response.json();
        return data.quote;
      });

      const allQuotes = await Promise.all(quotePromises);
      return allQuotes;
    },
    onSuccess: (data) => {
      setQuotes(data);
      toast({
        title: "Quotes Generated",
        description: `Generated ${data.length} VSC quotes successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Quote Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const productConfig = {
    ELEVATE_PLATINUM: {
      name: 'Elevate Platinum',
      tier: 'Premium',
      color: 'bg-purple-600',
      features: ['Comprehensive Coverage', 'Rental Car Benefits', '24/7 Roadside Assistance', 'Trip Interruption'],
      icon: <Shield className="h-5 w-5" />
    },
    ELEVATE_GOLD: {
      name: 'Elevate Gold',
      tier: 'Popular',
      color: 'bg-yellow-600',
      features: ['Extended Coverage', 'Roadside Assistance', 'Towing Benefits', 'Parts & Labor'],
      icon: <Zap className="h-5 w-5" />
    },
    PINNACLE_SILVER: {
      name: 'Pinnacle Silver',
      tier: 'Value',
      color: 'bg-gray-600',
      features: ['Essential Coverage', 'Major Components', 'Engine & Transmission', 'Basic Protection'],
      icon: <Car className="h-5 w-5" />
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Input Section - Compact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="vin" className="text-sm">VIN</Label>
              <Input
                id="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="Enter VIN"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="mileage" className="text-sm">Current Mileage</Label>
              <Input
                id="mileage"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Enter mileage"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="term" className="text-sm">Term Length</Label>
              <Select value={termLength} onValueChange={setTermLength}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24 months">24 months</SelectItem>
                  <SelectItem value="36 months">36 months</SelectItem>
                  <SelectItem value="48 months">48 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => generateQuotesMutation.mutate()}
                disabled={generateQuotesMutation.isPending}
                className="h-9 w-full"
              >
                {generateQuotesMutation.isPending ? 'Quoting...' : 'Get Quotes'}
              </Button>
            </div>
          </div>
          
          {vehicleInfo && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</strong> • {vehicleInfo.bodyStyle}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Results - Side by Side */}
      {quotes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {quotes.map((quote, index) => {
            const config = productConfig[quote.productId as keyof typeof productConfig];
            if (!config) return null;

            return (
              <Card key={quote.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`absolute top-0 left-0 right-0 h-1 ${config.color}`} />
                
                {config.tier === 'Popular' && (
                  <div className="absolute -top-2 right-4">
                    <Badge className="bg-yellow-500 text-yellow-50 text-xs">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${config.color} text-white`}>
                        {config.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{config.name}</CardTitle>
                        <p className="text-sm text-gray-600">{config.tier}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price Display */}
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900">
                      ${quote.totalPremium.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      ${quote.monthlyPremium}/month • {quote.termLength}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {quote.coverageMiles} miles • ${quote.deductible} deductible
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="space-y-2">
                    {config.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <Button
                    onClick={() => onQuoteSelect?.(quote)}
                    className={`w-full ${config.color} hover:opacity-90`}
                    size="lg"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Select Coverage
                  </Button>

                  {/* Coverage Details Link */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-gray-600 hover:text-gray-800"
                  >
                    View Full Coverage Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* No Quotes Message */}
      {quotes.length === 0 && !generateQuotesMutation.isPending && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Get Quotes</h3>
            <p className="text-gray-600">
              Enter your vehicle information above and click "Get Quotes" to see all available VSC options.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}