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
      if (vin && vin.length === 17) {
        setIsLoadingVin(true);
        try {
          console.log('Decoding VIN:', vin);
          const response = await fetch(`/api/vin-decode/${vin}`);
          const data = await response.json();
          console.log('VIN decode response:', data);
          
          // Handle both possible response formats
          const vehicleData = data.vehicle || data.data || data;
          console.log('Processed vehicle data:', vehicleData);
          setVehicleInfo(vehicleData);
        } catch (error) {
          console.error('VIN decode error:', error);
          setVehicleInfo(null);
        } finally {
          setIsLoadingVin(false);
        }
      } else if (vin.length < 17) {
        setVehicleInfo(null);
        setIsLoadingVin(false);
      }
    };

    // Immediately decode if VIN is already 17 characters (like the default)
    if (vin && vin.length === 17 && !vehicleInfo && !isLoadingVin) {
      decodeVin();
    } else {
      const timeoutId = setTimeout(decodeVin, 800); // Debounce VIN input
      return () => clearTimeout(timeoutId);
    }
  }, [vin]); // Remove isLoadingVin from dependencies to prevent infinite loop

  const generateQuotesMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting quote generation with:', { vin, mileage, vehicleInfo });
      
      if (!vin || vin.length !== 17) {
        throw new Error('Please enter a valid 17-character VIN');
      }

      // First ensure we have vehicle info
      let currentVehicleInfo = vehicleInfo;
      if (!currentVehicleInfo) {
        console.log('Fetching vehicle info first...');
        const vehicleResponse = await fetch(`/api/vin-decode/${vin}`);
        const vehicleData = await vehicleResponse.json();
        currentVehicleInfo = vehicleData.vehicle || vehicleData;
        setVehicleInfo(currentVehicleInfo);
      }

      // Generate quotes for all three products
      const products = ['ELEVATE_PLATINUM', 'ELEVATE_GOLD', 'PINNACLE_SILVER'];
      const allQuotes = [];

      for (const productId of products) {
        try {
          console.log(`Generating quote for ${productId}...`);
          
          // Determine vehicle class based on make (Subaru = Class A)
          const getVehicleClass = (make: string) => {
            const classAMakes = ['Honda', 'Hyundai', 'Isuzu', 'Kia', 'Mazda', 'Mitsubishi', 'Scion', 'Subaru', 'Toyota', 'Lexus', 'Nissan', 'Infiniti'];
            const classBMakes = ['Acura', 'Buick', 'Chevrolet', 'Chrysler', 'Dodge', 'Plymouth', 'Fiat', 'Ford', 'GMC', 'Jeep', 'Mercury', 'Mini', 'Oldsmobile', 'Pontiac', 'VW', 'Volvo'];
            
            if (classAMakes.includes(make)) return 'Class A';
            if (classBMakes.includes(make)) return 'Class B';
            return 'Class C';
          };
          
          const vehicleClass = getVehicleClass(currentVehicleInfo?.make || 'Unknown');
          
          // Prepare coverage selections in the format expected by backend
          const coverageSelections = {
            termLength: termLength,
            termlength: termLength, // fallback
            term: termLength, // another fallback
            coverageMiles: coverageMiles,
            coveragemiles: coverageMiles, // fallback
            miles: coverageMiles, // another fallback
            vehicleClass: vehicleClass,
            vehicleclass: vehicleClass, // fallback
            class: vehicleClass // another fallback
          };
          
          console.log('Coverage selections:', coverageSelections);
          
          const response = await fetch('/api/connected-auto-care/quotes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId,
              coverageSelections,
              vehicleData: {
                ...currentVehicleInfo,
                mileage: parseInt(mileage) || 0 // Include current mileage for eligibility
              },
              customerData: {
                state: 'TX', // Default state for now
                zipCode: '75001' // Default zip code for now
              }
            }),
          });
          
          const responseText = await response.text();
          console.log(`Response for ${productId}:`, responseText);
          
          if (!response.ok) {
            throw new Error(`Failed to generate quote for ${productId}: ${responseText}`);
          }
          
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            throw new Error(`Invalid JSON response for ${productId}: ${responseText}`);
          }
          
          if (data.quote) {
            allQuotes.push({
              ...data.quote,
              id: `${productId}_${Date.now()}`,
              productId
            });
          }
        } catch (error) {
          console.error(`Error generating quote for ${productId}:`, error);
          // Continue with other products instead of failing completely
        }
      }

      if (allQuotes.length === 0) {
        throw new Error('Unable to generate any quotes. Please check vehicle eligibility.');
      }

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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <div>
              <Label htmlFor="coverage" className="text-sm">Coverage Miles</Label>
              <Select value={coverageMiles} onValueChange={setCoverageMiles}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15,000">15,000 miles</SelectItem>
                  <SelectItem value="25,000">25,000 miles</SelectItem>
                  <SelectItem value="30,000">30,000 miles</SelectItem>
                  <SelectItem value="45,000">45,000 miles</SelectItem>
                  <SelectItem value="60,000">60,000 miles</SelectItem>
                  <SelectItem value="75,000">75,000 miles</SelectItem>
                  <SelectItem value="100,000">100,000 miles</SelectItem>
                  <SelectItem value="125,000">125,000 miles</SelectItem>
                  <SelectItem value="unlimited">Unlimited miles</SelectItem>
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
                    {quote.totalPremium > 0 ? (
                      <>
                        <div className="text-3xl font-bold text-gray-900">
                          ${quote.totalPremium.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Premium • {quote.termLength}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {quote.coverageMiles} miles • ${quote.deductible} deductible
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-gray-500">
                          Not Available
                        </div>
                        <div className="text-sm text-gray-500">
                          This configuration is not eligible
                        </div>
                      </>
                    )}
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
                    disabled={quote.totalPremium <= 0}
                    className={`w-full ${quote.totalPremium > 0 ? config.color + ' hover:opacity-90' : 'bg-gray-400'}`}
                    size="lg"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {quote.totalPremium > 0 ? 'Select Coverage' : 'Not Available'}
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

      {/* Coverage Options Overview - Always Visible */}
      {quotes.length === 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Available Coverage Levels</CardTitle>
              <p className="text-gray-600">Choose from three tiers of Connected Auto Care VSC protection</p>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'ELEVATE_PLATINUM',
                name: 'Elevate Platinum',
                tier: 'Premium',
                color: 'bg-purple-600',
                price: 'Starting at $1,679',
                features: ['Comprehensive Coverage', 'Rental Car Benefits', '24/7 Roadside Assistance', 'Trip Interruption'],
                detailedFeatures: [
                  'Engine & Engine Components', 'Transmission & Transaxle', 'Drive Axle Assembly',
                  'Electrical Components', 'A/C & Heating', 'Fuel System', 'Cooling System',
                  'Brake System', 'Suspension & Steering', 'Seals & Gaskets Coverage'
                ],
                description: 'Most comprehensive protection with extensive component coverage and premium benefits.'
              },
              {
                id: 'ELEVATE_GOLD',
                name: 'Elevate Gold',
                tier: 'Popular',
                color: 'bg-yellow-600',
                price: 'Starting at $1,299',
                features: ['Extended Coverage', 'Roadside Assistance', 'Towing Benefits', 'Parts & Labor'],
                detailedFeatures: [
                  'Engine & Major Components', 'Transmission', 'Drive Axle',
                  'Electrical System', 'A/C System', 'Fuel System', 'Cooling System',
                  'Brake System', 'Power Steering'
                ],
                description: 'Popular choice with solid coverage of major vehicle systems and roadside assistance.'
              },
              {
                id: 'PINNACLE_SILVER',
                name: 'Pinnacle Silver',
                tier: 'Value',
                color: 'bg-gray-600',
                price: 'Starting at $899',
                features: ['Essential Coverage', 'Major Components', 'Engine & Transmission', 'Basic Protection'],
                detailedFeatures: [
                  'Engine Block & Internal Parts', 'Transmission Case & Internal Parts',
                  'Drive Axle Assembly', 'Electrical System', 'A/C Compressor',
                  'Fuel Pump', 'Water Pump', 'Master Cylinder'
                ],
                description: 'Essential protection for key powertrain components at an affordable price.'
              }
            ].map((level) => (
              <Card key={level.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`absolute top-0 left-0 right-0 h-1 ${level.color}`} />
                
                {level.tier === 'Popular' && (
                  <div className="absolute -top-2 right-4">
                    <Badge className="bg-yellow-500 text-yellow-50 text-xs">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${level.color} text-white`}>
                        {level.id === 'ELEVATE_PLATINUM' ? <Shield className="h-5 w-5" /> :
                         level.id === 'ELEVATE_GOLD' ? <Zap className="h-5 w-5" /> :
                         <Car className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{level.name}</CardTitle>
                        <p className="text-sm text-gray-600">{level.tier}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{level.price}</div>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Key Features:</h4>
                    <ul className="text-sm space-y-1">
                      {level.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Info className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{level.name} - Detailed Coverage</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Coverage Details</h4>
                            <ul className="text-sm space-y-1">
                              {level.detailedFeatures.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Contract Information</h4>
                            <div className="text-sm space-y-2">
                              <p><strong>Administrator:</strong> Ascent Administration Services</p>
                              <p><strong>Phone:</strong> 866-660-7003</p>
                              <p><strong>Deductible:</strong> $0 at selling dealer, $100 elsewhere</p>
                              <p><strong>Labor Rate:</strong> $150/hour maximum</p>
                              <p><strong>Roadside:</strong> 877-626-0880</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Get Your Personalized Quotes</h3>
              <p className="text-gray-600 mb-4">
                Enter your vehicle information above and click "Get Quotes" to see exact pricing for your vehicle.
              </p>
              <p className="text-sm text-gray-500">
                • Quotes based on your specific vehicle year, make, model, and mileage<br/>
                • Terms and coverage miles adjusted for your vehicle's eligibility<br/>
                • Instant pricing with no hidden fees
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}