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
  const [coverageOptions, setCoverageOptions] = useState<any>(null);
  const [quoteForm, setQuoteForm] = useState({
    vin: '',
    currentMileage: '',
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

  // Coverage options mutation
  const coverageOptionsMutation = useMutation({
    mutationFn: async ({ productId, vehicleData }: { productId: string; vehicleData: any }) => {
      const response = await apiRequest('POST', '/api/connected-auto-care/coverage-options', {
        productId,
        vehicleData: { ...vehicleData, mileage: parseInt(quoteForm.currentMileage) || 0 }
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setCoverageOptions(data.coverageOptions);
      if (data.coverageOptions.reasons && data.coverageOptions.reasons.length > 0) {
        toast({
          title: "Coverage Options Limited",
          description: data.coverageOptions.reasons.join('. '),
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Coverage Options Error",
        description: "Could not load coverage options. Please try again.",
        variant: "destructive",
      });
    },
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
      
      // Auto-fetch coverage options if we have a selected product
      if (selectedProduct && quoteForm.currentMileage) {
        const vehicleDataWithMileage = { 
          ...data.vehicle, 
          mileage: parseInt(quoteForm.currentMileage) || 0 
        };
        coverageOptionsMutation.mutate({ 
          productId: selectedProduct, 
          vehicleData: vehicleDataWithMileage 
        });
      }
      
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
      // Handle different quote statuses
      if (data.quote?.status === 'ineligible') {
        toast({
          title: "Vehicle Not Eligible",
          description: "This vehicle does not qualify for standard coverage. See options below.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Quote Generated Successfully",
          description: `Connected Auto Care quote #${data.quote.quoteNumber} created`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Quote Generation Failed",
        description: error.message || "Failed to generate Connected Auto Care quote",
        variant: "destructive",
      });
    },
  });

  // Special quote request mutation
  const specialQuoteRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await apiRequest('POST', '/api/special-quote-requests', requestData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Special Quote Request Submitted",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit special quote request",
        variant: "destructive",
      });
    },
  });

  // Effect to fetch coverage options when vehicle data, mileage, or product changes
  useEffect(() => {
    if (selectedProduct && vehicleData?.year && quoteForm.currentMileage) {
      const vehicleDataWithMileage = { 
        ...vehicleData, 
        mileage: parseInt(quoteForm.currentMileage) || 0 
      };
      coverageOptionsMutation.mutate({ 
        productId: selectedProduct, 
        vehicleData: vehicleDataWithMileage 
      });
    } else {
      setCoverageOptions(null);
    }
  }, [selectedProduct, vehicleData?.year, quoteForm.currentMileage]);

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

  // Handle special quote request
  const handleSpecialQuoteRequest = async (productId: string, requestReason: string = '') => {
    // Validate required fields for special quote request
    if (!quoteForm.customerName || !quoteForm.customerEmail) {
      toast({
        title: "Customer Information Required",
        description: "Please enter customer name and email to submit special quote request",
        variant: "destructive",
      });
      return;
    }

    const finalVehicleData = {
      ...vehicleData,
      mileage: parseInt(quoteForm.currentMileage) || 0,
      year: vehicleData?.year || parseInt(quoteForm.vehicleYear) || 2021,
      make: vehicleData?.make || quoteForm.vehicleMake || "Unknown",
      model: vehicleData?.model || quoteForm.vehicleModel || "Unknown"
    };

    const requestData = {
      productId,
      vehicleData: finalVehicleData,
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
      eligibilityReasons: quoteData?.quote?.eligibilityReasons || [],
      requestReason: requestReason || 'Customer requested special review for ineligible vehicle'
    };

    specialQuoteRequestMutation.mutate(requestData);
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

    if (!quoteForm.currentMileage) {
      toast({
        title: "Current Mileage Required",
        description: "Please enter the vehicle's current mileage for accurate pricing",
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

    // Prepare vehicle data with current mileage
    const finalVehicleData = {
      ...vehicleData,
      mileage: parseInt(quoteForm.currentMileage) || 0,
      // Use manual entry if VIN decode failed
      year: vehicleData?.year || parseInt(quoteForm.vehicleYear) || 2021,
      make: vehicleData?.make || quoteForm.vehicleMake || "Unknown",
      model: vehicleData?.model || quoteForm.vehicleModel || "Unknown"
    };

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
      vehicleData: finalVehicleData
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
              
              {/* Current Mileage Field */}
              <div>
                <Label htmlFor="currentMileage">Current Mileage</Label>
                <Input
                  id="currentMileage"
                  type="number"
                  placeholder="50,000"
                  value={quoteForm.currentMileage}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, currentMileage: e.target.value }))}
                  min="0"
                  max="300000"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Enter current odometer reading (affects pricing tier)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Options Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Coverage Options</CardTitle>
              <CardDescription>Select your coverage preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dynamic Coverage Options Status */}
              {coverageOptionsMutation.isPending && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">Loading coverage options for your vehicle...</p>
                </div>
              )}

              {coverageOptions && coverageOptions.reasons && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Coverage Limitations:</strong> {coverageOptions.reasons.join('. ')}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="termLength">Term Length</Label>
                <Select 
                  value={quoteForm.termLength} 
                  onValueChange={(value) => setQuoteForm(prev => ({ ...prev, termLength: value }))}
                  disabled={!coverageOptions || coverageOptions.validTermLengths.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !coverageOptions ? "Select vehicle and mileage first" :
                      coverageOptions.validTermLengths.length === 0 ? "No valid terms available" :
                      "Select term length"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {coverageOptions?.validTermLengths?.map((term: string) => (
                      <SelectItem key={term} value={term}>{term}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {coverageOptions && (
                  <p className="text-xs text-gray-600 mt-1">
                    {coverageOptions.validTermLengths.length} option(s) available for your vehicle
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="coverageMiles">Coverage Miles</Label>
                <Select 
                  value={quoteForm.coverageMiles} 
                  onValueChange={(value) => setQuoteForm(prev => ({ ...prev, coverageMiles: value }))}
                  disabled={!coverageOptions || coverageOptions.validCoverageMiles.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !coverageOptions ? "Select vehicle and mileage first" :
                      coverageOptions.validCoverageMiles.length === 0 ? "No valid coverage available" :
                      "Select coverage miles"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {coverageOptions?.validCoverageMiles?.map((miles: string) => (
                      <SelectItem key={miles} value={miles}>
                        {miles === 'Unlimited' ? 'Unlimited' : `${miles} miles`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {coverageOptions && (
                  <p className="text-xs text-gray-600 mt-1">
                    {coverageOptions.validCoverageMiles.length} option(s) available for your vehicle
                  </p>
                )}
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
          
          {quoteData && quoteData.quote ? (
            quoteData.quote.status === 'ineligible' ? (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-900">Vehicle Not Eligible</CardTitle>
                  <CardDescription className="text-red-700">
                    This vehicle does not qualify for standard coverage
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2">Eligibility Issues</h4>
                    <ul className="space-y-1">
                      {quoteData.quote.eligibilityReasons?.map((reason: string, index: number) => (
                        <li key={index} className="text-sm text-red-800 flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {quoteData.quote.allowSpecialQuote && (
                    <>
                      <Separator className="bg-red-200" />
                      <div>
                        <h4 className="font-semibold text-red-900 mb-2">Special Quote Available</h4>
                        <p className="text-sm text-red-800 mb-3">
                          While your vehicle doesn't qualify for standard coverage, an admin can manually review your request and may be able to offer alternative products or special pricing.
                        </p>
                        <Button
                          onClick={() => handleSpecialQuoteRequest(selectedProduct!)}
                          disabled={specialQuoteRequestMutation.isPending}
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          {specialQuoteRequestMutation.isPending ? 'Submitting Request...' : 'Request Special Quote Review'}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
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
            )
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