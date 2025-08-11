import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, Shield, Clock, Car, Zap, Info, MessageSquare, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isLoadingVin, setIsLoadingVin] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const { toast } = useToast();

  // Auto-decode VIN when entered
  useEffect(() => {
    const decodeVin = async () => {
      if (vin && vin.length === 17 && !isLoadingVin) {
        setIsLoadingVin(true);
        try {
          const response = await fetch(`/api/vin-decode/${vin}`);
          const data = await response.json();
          setVehicleInfo(data.vehicle || data);
        } catch (error) {
          console.error('VIN decode error:', error);
        } finally {
          setIsLoadingVin(false);
        }
      }
    };

    const timeoutId = setTimeout(decodeVin, 500); // Debounce VIN input
    return () => clearTimeout(timeoutId);
  }, [vin, isLoadingVin]);

  const generateQuotesMutation = useMutation({
    mutationFn: async () => {
      if (!vehicleInfo) {
        throw new Error('Please enter a valid VIN first');
      }

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
        
        if (!response.ok) {
          throw new Error(`Failed to generate quote for ${productId}`);
        }
        
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
      detailedFeatures: [
        'Engine & Engine Components', 'Transmission & Transaxle', 'Drive Axle Assembly',
        'Electrical Components', 'A/C & Heating', 'Fuel System', 'Cooling System',
        'Brake System', 'Suspension & Steering', 'Seals & Gaskets Coverage'
      ],
      icon: <Shield className="h-5 w-5" />
    },
    ELEVATE_GOLD: {
      name: 'Elevate Gold',
      tier: 'Popular',
      color: 'bg-yellow-600',
      features: ['Extended Coverage', 'Roadside Assistance', 'Towing Benefits', 'Parts & Labor'],
      detailedFeatures: [
        'Engine & Major Components', 'Transmission', 'Drive Axle',
        'Electrical System', 'A/C System', 'Fuel System', 'Cooling System',
        'Brake System', 'Power Steering'
      ],
      icon: <Zap className="h-5 w-5" />
    },
    PINNACLE_SILVER: {
      name: 'Pinnacle Silver',
      tier: 'Value',
      color: 'bg-gray-600',
      features: ['Essential Coverage', 'Major Components', 'Engine & Transmission', 'Basic Protection'],
      detailedFeatures: [
        'Engine Block & Internal Parts', 'Transmission Case & Internal Parts',
        'Drive Axle Assembly', 'Electrical System', 'A/C Compressor',
        'Fuel Pump', 'Water Pump', 'Master Cylinder'
      ],
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
          
          {isLoadingVin && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Decoding VIN...</p>
            </div>
          )}
          
          {vehicleInfo && !isLoadingVin && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</strong> • {vehicleInfo.bodyStyle}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {quotes.length > 0 && (
        <div className="flex gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setShowComparison(true)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Compare Coverage
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowChatbot(true)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Get Assistance
          </Button>
        </div>
      )}

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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                      >
                        <Info className="h-3 w-3" />
                        View Full Coverage Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{config.name} - Detailed Coverage</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Coverage Details</h4>
                            <ul className="text-sm space-y-1">
                              {config.detailedFeatures.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Contract Terms</h4>
                            <div className="text-sm space-y-2">
                              <p><strong>Term:</strong> {quote.termLength}</p>
                              <p><strong>Coverage Miles:</strong> {quote.coverageMiles}</p>
                              <p><strong>Deductible:</strong> ${quote.deductible}</p>
                              <p><strong>Total Premium:</strong> ${quote.totalPremium.toLocaleString()}</p>
                              <p><strong>Monthly Payment:</strong> ${quote.monthlyPremium}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Coverage Comparison Modal */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Coverage Level Comparison</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            {quotes.map((quote) => {
              const config = productConfig[quote.productId as keyof typeof productConfig];
              if (!config) return null;
              return (
                <Card key={quote.id} className="h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    <div className="text-2xl font-bold">${quote.totalPremium.toLocaleString()}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h5 className="font-medium">Covered Components:</h5>
                      {config.detailedFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Chatbot Assistance Modal */}
      <Dialog open={showChatbot} onOpenChange={setShowChatbot}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>VSC Assistant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">How can I help you today?</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    I can help you understand coverage options, compare plans, or answer questions about your vehicle service contract.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium">Common Questions:</h5>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="justify-start text-left h-auto p-3">
                  <div>
                    <div className="font-medium">What's the difference between coverage levels?</div>
                    <div className="text-xs text-gray-600">Compare Platinum, Gold, and Silver plans</div>
                  </div>
                </Button>
                <Button variant="outline" size="sm" className="justify-start text-left h-auto p-3">
                  <div>
                    <div className="font-medium">How do claims work?</div>
                    <div className="text-xs text-gray-600">Learn about the claims process and requirements</div>
                  </div>
                </Button>
                <Button variant="outline" size="sm" className="justify-start text-left h-auto p-3">
                  <div>
                    <div className="font-medium">What's covered under my plan?</div>
                    <div className="text-xs text-gray-600">Detailed breakdown of covered components</div>
                  </div>
                </Button>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Input placeholder="Type your question here..." className="flex-1" />
                <Button>Send</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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