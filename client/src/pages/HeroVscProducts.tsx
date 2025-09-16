import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Car, Home, CheckCircle, AlertCircle, Phone, Globe, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// API fetch functions
const fetchHeroVscProducts = async () => {
  const response = await fetch('/api/hero-vsc/products');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const decodeVin = async (vin: string) => {
  const response = await fetch('/api/vehicles/decode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vin }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to decode VIN');
  }
  
  return response.json();
};

const generateHeroVscQuote = async (quoteData: any) => {
  const response = await fetch('/api/hero-vsc/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quoteData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate quote');
  }
  
  return response.json();
};

// Hero VSC product configuration schema
const heroVscQuoteSchema = z.object({
  productId: z.string().min(1, "Product selection is required"),
  deductibleCoverage: z.string().optional(),
  termYears: z.string().min(1, "Term selection is required"),
  vehicleScope: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(10, "Phone number is required"),
  customerAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    zip: z.string().min(5, "ZIP code is required"),
  }),
  vehicleVin: z.string().optional(),
});

type HeroVscQuoteForm = z.infer<typeof heroVscQuoteSchema>;

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  features?: string[];
  vehicleTypes?: string[];
  coverageOptions?: CoverageOption[];
  claimsProcess?: {
    phone: string;
    website?: string;
    timeLimit: string;
  };
}

interface CoverageOption {
  name: string;
  description: string;
  options: string[];
}

interface VehicleData {
  year: string;
  make: string;
  model: string;
  trim?: string;
  vin?: string;
}

interface QuoteResult {
  quote: {
    quoteNumber: string;
    id: string;
  };
  productDetails: {
    name: string;
  };
  ratingResult: {
    basePremium: number;
    taxes: number;
    fees: number;
    totalPremium: number;
  };
}

export default function HeroVscProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);

  const form = useForm<HeroVscQuoteForm>({
    resolver: zodResolver(heroVscQuoteSchema),
    defaultValues: {
      customerAddress: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
    },
  });

  // Fixed useQuery with proper queryFn
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['hero-vsc-products'],
    queryFn: fetchHeroVscProducts,
    retry: 3,
    retryDelay: 1000,
  });

  // VIN decode mutation
  const vinDecodeMutation = useMutation({
    mutationFn: decodeVin,
    onSuccess: (data) => {
      setVehicleData(data);
      toast({
        title: "VIN Decoded Successfully",
        description: `${data.year} ${data.make} ${data.model}`,
      });
    },
    onError: (error: Error) => {
      console.error('VIN decode error:', error);
      toast({
        title: "VIN Decode Failed",
        description: error.message || "Unable to decode VIN. You can still continue with manual entry.",
        variant: "destructive",
      });
    },
  });

  // Hero VSC quote mutation
  const quoteMutation = useMutation({
    mutationFn: async (quoteData: HeroVscQuoteForm) => {
      const { productId, vehicleVin, ...customerData } = quoteData;
      
      // Prepare coverage selections
      const coverageSelections: any = {
        termyears: quoteData.termYears,
      };
      
      if (quoteData.deductibleCoverage) {
        coverageSelections.deductiblecoverage = quoteData.deductibleCoverage;
      }
      
      if (quoteData.vehicleScope) {
        coverageSelections.vehiclescope = quoteData.vehicleScope;
      }

      const requestData = {
        productId,
        coverageSelections,
        vehicleData: vehicleVin ? { ...vehicleData, vin: vehicleVin } : vehicleData,
        customerData: {
          ...customerData,
          vehicleVin, // Include VIN in customer data as well
        },
      };

      console.log('Sending quote request:', requestData);
      return await generateHeroVscQuote(requestData);
    },
    onSuccess: (data) => {
      console.log('Quote generated successfully:', data);
      setQuoteResult(data);
      toast({
        title: "Quote Generated Successfully",
        description: `Premium: $${data.ratingResult?.totalPremium?.toFixed(2) || 'N/A'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: (error: Error) => {
      console.error('Quote generation error:', error);
      toast({
        title: "Quote Generation Failed",
        description: error.message || "Unable to generate quote. Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleProductSelect = (product: Product) => {
    console.log('Product selected:', product);
    setSelectedProduct(product);
    form.setValue('productId', product.id);
    setQuoteResult(null);
    // Clear vehicle data when switching products
    setVehicleData(null);
  };

  const handleVinDecode = () => {
    const vin = form.getValues('vehicleVin');
    if (vin && vin.length === 17) {
      console.log('Decoding VIN:', vin);
      vinDecodeMutation.mutate(vin);
    } else {
      toast({
        title: "Invalid VIN",
        description: "Please enter a valid 17-character VIN",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: HeroVscQuoteForm) => {
    console.log('Form submitted with data:', data);
    
    // Validate required fields
    if (!data.productId) {
      toast({
        title: "Product Required",
        description: "Please select a product before generating a quote.",
        variant: "destructive",
      });
      return;
    }

    if (!data.termYears) {
      toast({
        title: "Term Required", 
        description: "Please select a term length.",
        variant: "destructive",
      });
      return;
    }

    quoteMutation.mutate(data);
  };

  const getProductIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'auto': return <Car className="h-6 w-6" />;
      case 'home': return <Home className="h-6 w-6" />;
      default: return <Shield className="h-6 w-6" />;
    }
  };

  const formatProductId = (id: string) => {
    return id.replace(/^hero-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (productsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>Loading Hero VSC products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Products</h2>
                <p className="text-gray-600 mb-4">
                  {productsError instanceof Error ? productsError.message : 'Failed to load Hero VSC products'}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!products || Object.keys(products).length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No Products Available</h2>
                <p className="text-gray-500 mb-4">
                  No Hero VSC products are currently available.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Hero VSC Products</h1>
            <p className="text-gray-600">Authentic Hero Vehicle Service Contracts and Protection Plans</p>
          </div>
        </div>
      </div>

      {!selectedProduct ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(products).map(([key, product]: [string, any]) => (
            <Card key={key} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getProductIcon(product.category)}
                    <Badge variant={product.category === 'auto' ? 'default' : 'secondary'}>
                      {product.category?.toUpperCase() || 'PRODUCT'}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{product.name || formatProductId(key)}</CardTitle>
                <CardDescription>{product.description || 'Hero VSC Protection Plan'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {product.features?.slice(0, 3).map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      )) || (
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Comprehensive coverage</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  {product.vehicleTypes && (
                    <div>
                      <h4 className="font-semibold mb-2">Vehicle Types:</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.vehicleTypes.slice(0, 3).map((type: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {product.vehicleTypes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.vehicleTypes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={() => handleProductSelect({ ...product, id: key })} 
                    className="w-full"
                  >
                    Select This Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getProductIcon(selectedProduct.category)}
                  <Badge>{selectedProduct.category?.toUpperCase() || 'PRODUCT'}</Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedProduct(null);
                    setQuoteResult(null);
                    setVehicleData(null);
                    form.reset();
                  }}
                >
                  Change Product
                </Button>
              </div>
              <CardTitle>{selectedProduct.name}</CardTitle>
              <CardDescription>{selectedProduct.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div>
                <h4 className="font-semibold mb-3">Product Features:</h4>
                <ul className="space-y-2">
                  {selectedProduct.features?.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  )) || (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Comprehensive vehicle service contract coverage</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Coverage Options */}
              {selectedProduct.coverageOptions && selectedProduct.coverageOptions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Coverage Options:</h4>
                  <div className="space-y-3">
                    {selectedProduct.coverageOptions.map((option: CoverageOption, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h5 className="font-medium">{option.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{option.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {option.options?.map((opt: string, optIndex: number) => (
                            <Badge key={optIndex} variant="outline" className="text-xs">
                              {opt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Claims Information */}
              {selectedProduct.claimsProcess && (
                <div>
                  <h4 className="font-semibold mb-3">Claims Process:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone: {selectedProduct.claimsProcess.phone}</span>
                    </div>
                    {selectedProduct.claimsProcess.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Online: {selectedProduct.claimsProcess.website}</span>
                      </div>
                    )}
                    <div className="mt-2">
                      <span className="font-medium">Time Limits: </span>
                      <span>{selectedProduct.claimsProcess.timeLimit}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Form */}
          <Card>
            <CardHeader>
              <CardTitle>Get Your Quote</CardTitle>
              <CardDescription>
                Complete the information below to receive your Hero VSC quote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Coverage Selections */}
                  {selectedProduct.coverageOptions?.map((option: CoverageOption, index: number) => {
                    const fieldName = option.name.replace(/\s+/g, '').toLowerCase();
                    
                    if (fieldName === 'termoptions' || fieldName.includes('term')) {
                      return (
                        <FormField
                          key={index}
                          control={form.control}
                          name="termYears"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{option.name} *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select ${option.name.toLowerCase()}`} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {option.options?.map((opt: string) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    }
                    
                    if (fieldName === 'deductiblecoverage' || fieldName.includes('deductible')) {
                      return (
                        <FormField
                          key={index}
                          control={form.control}
                          name="deductibleCoverage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{option.name}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select ${option.name.toLowerCase()}`} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {option.options?.map((opt: string) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    }

                    if (fieldName === 'vehiclescope' || fieldName.includes('vehicle') || fieldName.includes('scope')) {
                      return (
                        <FormField
                          key={index}
                          control={form.control}
                          name="vehicleScope"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{option.name}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select ${option.name.toLowerCase()}`} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {option.options?.map((opt: string) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    }
                    
                    return null;
                  })}

                  {/* Manual term selection if no coverage options */}
                  {(!selectedProduct.coverageOptions || selectedProduct.coverageOptions.length === 0) && (
                    <FormField
                      control={form.control}
                      name="termYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Term Length *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select term length" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="12">12 Months</SelectItem>
                              <SelectItem value="24">24 Months</SelectItem>
                              <SelectItem value="36">36 Months</SelectItem>
                              <SelectItem value="48">48 Months</SelectItem>
                              <SelectItem value="60">60 Months</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Separator />

                  {/* Vehicle Information */}
                  <div>
                    <h4 className="font-medium mb-3">Vehicle Information (Optional)</h4>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="vehicleVin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle VIN</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input 
                                  placeholder="Enter 17-digit VIN"
                                  maxLength={17}
                                  {...field}
                                />
                              </FormControl>
                              <Button 
                                type="button"
                                variant="outline"
                                onClick={handleVinDecode}
                                disabled={!field.value || field.value.length !== 17 || vinDecodeMutation.isPending}
                              >
                                {vinDecodeMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Decoding...
                                  </>
                                ) : (
                                  'Decode'
                                )}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {vehicleData && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h5 className="font-medium text-green-800 dark:text-green-200">
                            Vehicle Decoded Successfully
                          </h5>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {vehicleData.year} {vehicleData.make} {vehicleData.model}
                            {vehicleData.trim && ` ${vehicleData.trim}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium mb-3">Customer Information</h4>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone *</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="customerAddress.street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address *</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name="customerAddress.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerAddress.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State *</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" maxLength={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerAddress.zip"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code *</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={quoteMutation.isPending}
                  >
                    {quoteMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Quote...
                      </>
                    ) : (
                      'Get Quote'
                    )}
                  </Button>
                </form>
              </Form>

              {/* Quote Result */}
              {quoteResult && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    Quote Generated Successfully!
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Quote Number:</span>
                      <span className="font-mono">{quoteResult.quote?.quoteNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Product:</span>
                      <span>{quoteResult.productDetails?.name || selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Premium:</span>
                      <span>${quoteResult.ratingResult?.basePremium?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes:</span>
                      <span>${quoteResult.ratingResult?.taxes?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fees:</span>
                      <span>${quoteResult.ratingResult?.fees?.toFixed(2) || '0.00'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Premium:</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        ${quoteResult.ratingResult?.totalPremium?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button className="w-full">
                      Purchase This Coverage
                    </Button>
                    <Button variant="outline" className="w-full">
                      Save Quote & Email Details
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}