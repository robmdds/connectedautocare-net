import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function ConnectedAutoCarePage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [vehicleData, setVehicleData] = useState<any>({});
  const [quoteForm, setQuoteForm] = useState({
    vin: '',
    termLength: '',
    coverageMiles: '',
    vehicleClass: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: {
      street: '',
      city: '',
      state: '',
      zip: ''
    }
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Connected Auto Care products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/connected-auto-care/products'],
  });

  // VIN decoder mutation
  const vinDecodeMutation = useMutation({
    mutationFn: async (vin: string) => {
      const response = await apiRequest('POST', '/api/vehicles/decode-vin', { vin });
      const result = await response.json();
      console.log('VIN decode response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('VIN decode success data:', data);
      setVehicleData(data.vehicle || data);
      // Auto-select vehicle class based on make
      const make = data.vehicle.make?.toLowerCase() || '';
      let vehicleClass = 'Class B'; // Default
      
      const classAMakes = ['honda', 'hyundai', 'kia', 'mazda', 'mitsubishi', 'toyota', 'lexus', 'nissan', 'infiniti', 'subaru'];
      const classCMakes = ['audi', 'bmw', 'cadillac', 'jaguar', 'mercedes', 'porsche', 'tesla'];
      
      if (classAMakes.some(m => make.includes(m))) {
        vehicleClass = 'Class A';
      } else if (classCMakes.some(m => make.includes(m))) {
        vehicleClass = 'Class C';
      }
      
      setQuoteForm(prev => ({ ...prev, vehicleClass }));
      
      // Show different messages based on data completeness
      const isCompleteData = data.vehicle.make !== 'Unknown' && data.vehicle.model !== 'Unknown';
      const sourceMessage = data.vehicle.source === 'Basic Parser' ? ' (basic info only)' : '';
      
      toast({
        title: isCompleteData ? "VIN Decoded Successfully" : "VIN Processed",
        description: isCompleteData ? 
          `${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}${sourceMessage}` :
          `Year ${data.vehicle.year} detected. Please verify vehicle details manually.`,
        variant: isCompleteData ? "default" : "default",
      });
    },
    onError: (error: any) => {
      console.error('VIN decode error:', error);
      const errorMessage = error.message || "Could not decode VIN number";
      
      // Provide more helpful error messages
      let description = errorMessage;
      if (errorMessage.includes('Invalid VIN format')) {
        description = "Please enter a valid 17-character VIN number";
      } else if (errorMessage.includes('Failed to decode')) {
        description = "VIN decode service temporarily unavailable. You can continue manually.";
      }
      
      toast({
        title: "VIN Decode Issue",
        description,
        variant: "destructive",
      });
    },
  });

  // Generate quote mutation
  const generateQuoteMutation = useMutation({
    mutationFn: async (quoteRequest: any) => {
      const response = await apiRequest('POST', '/api/connected-auto-care/quotes', quoteRequest);
      return await response.json();
    },
    onSuccess: (data) => {
      setQuoteData(data);
      toast({
        title: "Quote Generated Successfully",
        description: `Connected Auto Care quote #${data.quote.quoteNumber} created`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Quote Generation Failed",
        description: error.message || "Failed to generate Connected Auto Care quote",
        variant: "destructive",
      });
    },
  });

  // Handle VIN decode
  const handleVinDecode = () => {
    if (!quoteForm.vin || quoteForm.vin.length !== 17) {
      toast({
        title: "Invalid VIN",
        description: "Please enter a valid 17-character VIN number",
        variant: "destructive",
      });
      return;
    }
    vinDecodeMutation.mutate(quoteForm.vin);
  };

  // Handle quote generation with form data
  const handleGenerateQuote = async (productId: string) => {
    // Validate required fields
    if (!quoteForm.termLength || !quoteForm.coverageMiles || !quoteForm.vehicleClass) {
      toast({
        title: "Missing Information",
        description: "Please select term length, coverage miles, and vehicle class",
        variant: "destructive",
      });
      return;
    }

    if (!quoteForm.customerName || !quoteForm.customerEmail) {
      toast({
        title: "Customer Information Required",
        description: "Please enter customer name and email",
        variant: "destructive",
      });
      return;
    }

    const quoteRequest = {
      productId,
      coverageSelections: {
        termLength: quoteForm.termLength,
        coverageMiles: quoteForm.coverageMiles,
        vehicleClass: quoteForm.vehicleClass
      },
      customerData: {
        name: quoteForm.customerName,
        email: quoteForm.customerEmail,
        phone: quoteForm.customerPhone,
        address: quoteForm.customerAddress
      },
      vehicleData: vehicleData || {
        year: 2021,
        make: "Unknown",
        model: "Unknown",
        mileage: 50000
      }
    };

    generateQuoteMutation.mutate(quoteRequest);
  };

  if (productsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Connected Auto Care VSC products...</p>
          </div>
        </div>
      </div>
    );
  }

  const products = (productsData as any)?.products || {};

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Connected Auto Care VSC</h1>
        <p className="text-xl text-gray-600 mb-4">
          Premium vehicle service contracts with comprehensive coverage
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                <span className="text-blue-600 font-semibold text-sm">i</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Administrator Information</h3>
              <p className="text-sm text-blue-700">
                <strong>Ascent Administration Services, LLC</strong><br />
                360 South Smith Road, Tempe, Arizona 85281<br />
                Phone: 866-660-7003 | Roadside: 877-626-0880
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available VSC Products</h2>
          <div className="grid gap-6">
            {Object.entries(products).map(([key, product]: [string, any]) => (
              <Card key={key} className={`border-2 transition-colors ${
                selectedProduct === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-gray-900">{product.name}</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">{product.description}</CardDescription>
                    </div>
                    <Badge variant={product.category === 'auto' ? 'default' : 'secondary'}>
                      {product.category.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Key Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.features?.slice(0, 6).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Coverage Options */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Coverage Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {product.coverageOptions?.map((option: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="font-medium text-gray-900 text-sm mb-1">{option.name}</h5>
                          <p className="text-xs text-gray-600 mb-2">{option.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {option.options?.slice(0, 3).map((opt: string, optIndex: number) => (
                              <Badge key={optIndex} variant="outline" className="text-xs">
                                {opt}
                              </Badge>
                            ))}
                            {option.options?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{option.options.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Contract Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contract Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Deductible:</span>
                        <p className="text-gray-900">{product.deductible?.sellingDealer}</p>
                        <p className="text-gray-600 text-xs">(at selling dealer)</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Labor Rate:</span>
                        <p className="text-gray-900">{product.laborRate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Classification */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Vehicle Classifications</h4>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="bg-green-50 p-2 rounded">
                        <h5 className="font-medium text-green-800 mb-1">Class A</h5>
                        <p className="text-green-700">
                          {product.vehicleClassification?.classA?.slice(0, 3).join(', ')}
                          {product.vehicleClassification?.classA?.length > 3 && '...'}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded">
                        <h5 className="font-medium text-yellow-800 mb-1">Class B</h5>
                        <p className="text-yellow-700">
                          {product.vehicleClassification?.classB?.slice(0, 3).join(', ')}
                          {product.vehicleClassification?.classB?.length > 3 && '...'}
                        </p>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <h5 className="font-medium text-red-800 mb-1">Class C</h5>
                        <p className="text-red-700">
                          {product.vehicleClassification?.classC?.slice(0, 3).join(', ')}
                          {product.vehicleClassification?.classC?.length > 3 && '...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={() => setSelectedProduct(selectedProduct === key ? null : key)}
                      variant={selectedProduct === key ? 'default' : 'outline'}
                      className="flex-1"
                    >
                      {selectedProduct === key ? 'Selected' : 'Select Product'}
                    </Button>
                    <Button
                      onClick={() => handleGenerateQuote(key)}
                      disabled={generateQuoteMutation.isPending}
                      variant="default"
                    >
                      {generateQuoteMutation.isPending ? 'Generating...' : 'Get Quote'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Quote Form Section */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get Quote</h2>
          
          {/* VIN Decoder Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>Enter VIN to decode vehicle details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vin">VIN Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="vin"
                    value={quoteForm.vin}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                    placeholder="Enter 17-character VIN"
                    maxLength={17}
                    className="font-mono"
                  />
                  <Button 
                    onClick={handleVinDecode}
                    disabled={vinDecodeMutation.isPending || quoteForm.vin.length !== 17}
                    variant="outline"
                  >
                    {vinDecodeMutation.isPending ? 'Decoding...' : 'Decode'}
                  </Button>
                </div>
              </div>
              
              {vehicleData && Object.keys(vehicleData).length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Vehicle Details</h4>
                  <div className="text-sm text-green-800">
                    <p><strong>Year:</strong> {vehicleData.year}</p>
                    <p><strong>Make:</strong> {vehicleData.make}</p>
                    <p><strong>Model:</strong> {vehicleData.model}</p>
                    {vehicleData.trim && <p><strong>Trim:</strong> {vehicleData.trim}</p>}
                    {vehicleData.source && (
                      <p className="text-xs text-green-600 mt-1">
                        Source: {vehicleData.source === 'Basic Parser' ? 'Basic VIN decode' : 'NHTSA Database'}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Manual Vehicle Entry - Show if VIN decode failed or returned limited data */}
              {(!vehicleData || vehicleData.make === 'Unknown') && (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Manual Entry:</strong> You can enter vehicle details manually below.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="manualYear">Year</Label>
                      <Input
                        id="manualYear"
                        type="number"
                        placeholder="2020"
                        value={quoteForm.vehicleYear}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, vehicleYear: e.target.value }))}
                        min="1990"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                    <div>
                      <Label htmlFor="manualMake">Make</Label>
                      <Input
                        id="manualMake"
                        placeholder="Toyota"
                        value={quoteForm.vehicleMake}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, vehicleMake: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="manualModel">Model</Label>
                    <Input
                      id="manualModel"
                      placeholder="Camry"
                      value={quoteForm.vehicleModel}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, vehicleModel: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coverage Options Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Coverage Options</CardTitle>
              <CardDescription>Select your coverage preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="termLength">Term Length</Label>
                <Select value={quoteForm.termLength} onValueChange={(value) => setQuoteForm(prev => ({ ...prev, termLength: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12 months">12 months</SelectItem>
                    <SelectItem value="24 months">24 months</SelectItem>
                    <SelectItem value="36 months">36 months</SelectItem>
                    <SelectItem value="48 months">48 months</SelectItem>
                    <SelectItem value="60 months">60 months</SelectItem>
                    <SelectItem value="72 months">72 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="coverageMiles">Coverage Miles</Label>
                <Select value={quoteForm.coverageMiles} onValueChange={(value) => setQuoteForm(prev => ({ ...prev, coverageMiles: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select coverage miles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15,000">15,000 miles</SelectItem>
                    <SelectItem value="25,000">25,000 miles</SelectItem>
                    <SelectItem value="30,000">30,000 miles</SelectItem>
                    <SelectItem value="45,000">45,000 miles</SelectItem>
                    <SelectItem value="60,000">60,000 miles</SelectItem>
                    <SelectItem value="75,000">75,000 miles</SelectItem>
                    <SelectItem value="90,000">90,000 miles</SelectItem>
                    <SelectItem value="100,000">100,000 miles</SelectItem>
                    <SelectItem value="125,000">125,000 miles</SelectItem>
                    <SelectItem value="Unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vehicleClass">Vehicle Class</Label>
                <Select value={quoteForm.vehicleClass} onValueChange={(value) => setQuoteForm(prev => ({ ...prev, vehicleClass: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class A">Class A (Economy/Compact)</SelectItem>
                    <SelectItem value="Class B">Class B (Mid-size/Full-size)</SelectItem>
                    <SelectItem value="Class C">Class C (Luxury/Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Enter customer details for the quote</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name</Label>
                <Input
                  id="customerName"
                  value={quoteForm.customerName}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Email Address</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={quoteForm.customerEmail}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={quoteForm.customerPhone}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={quoteForm.customerAddress.city}
                    onChange={(e) => setQuoteForm(prev => ({
                      ...prev,
                      customerAddress: { ...prev.customerAddress, city: e.target.value }
                    }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={quoteForm.customerAddress.state}
                    onChange={(e) => setQuoteForm(prev => ({
                      ...prev,
                      customerAddress: { ...prev.customerAddress, state: e.target.value }
                    }))}
                    placeholder="State"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={quoteForm.customerAddress.zip}
                  onChange={(e) => setQuoteForm(prev => ({
                    ...prev,
                    customerAddress: { ...prev.customerAddress, zip: e.target.value }
                  }))}
                  placeholder="ZIP Code"
                  maxLength={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Quote Button */}
          {selectedProduct && (
            <Button 
              onClick={() => handleGenerateQuote(selectedProduct)}
              disabled={generateQuoteMutation.isPending}
              className="w-full mb-4"
              size="lg"
            >
              {generateQuoteMutation.isPending ? 'Generating Quote...' : 'Generate Quote'}
            </Button>
          )}

          {/* Quote Results */}
          
          {quoteData ? (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">Quote Generated!</CardTitle>
                <CardDescription className="text-green-700">
                  Quote #{quoteData.quote.quoteNumber}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Product Details</h4>
                  <p className="text-sm text-green-800 font-medium">{quoteData.productDetails?.name}</p>
                  <p className="text-xs text-green-700">{quoteData.productDetails?.description}</p>
                </div>

                <Separator className="bg-green-200" />

                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Coverage Selected</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Term:</span>
                      <span className="text-green-900">{quoteData.quote.coverageSelections?.termLength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Miles:</span>
                      <span className="text-green-900">{quoteData.quote.coverageSelections?.coverageMiles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Vehicle Class:</span>
                      <span className="text-green-900">{quoteData.quote.coverageSelections?.vehicleClass}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-green-200" />

                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Pricing Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Base Premium:</span>
                      <span className="text-green-900">${quoteData.quote.basePremium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Taxes:</span>
                      <span className="text-green-900">${quoteData.quote.taxes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Fees:</span>
                      <span className="text-green-900">${quoteData.quote.fees}</span>
                    </div>
                    <Separator className="bg-green-200" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-green-900">Total Premium:</span>
                      <span className="text-green-900">${quoteData.quote.totalPremium}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Contact Information</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-green-700">Claims:</span>
                      <span className="text-green-900">{quoteData.productDetails?.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Roadside:</span>
                      <span className="text-green-900">{quoteData.productDetails?.roadsidePhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Website:</span>
                      <span className="text-green-900">{quoteData.productDetails?.claimsProcess?.website}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <p className="mb-2">No quote generated yet</p>
                  <p className="text-sm">Select a product and click "Get Quote" to see pricing</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}