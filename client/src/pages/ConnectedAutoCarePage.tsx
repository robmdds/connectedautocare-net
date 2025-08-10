import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function ConnectedAutoCarePage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Connected Auto Care products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/connected-auto-care/products'],
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

  const handleGenerateQuote = async (productId: string) => {
    const sampleQuoteRequest = {
      productId,
      coverageSelections: {
        termLength: '36 months',
        coverageMiles: '75,000',
        vehicleClass: 'Class A'
      },
      customerData: {
        name: 'Sample Customer',
        email: 'customer@example.com',
        phone: '555-123-4567',
        address: {
          street: '123 Main St',
          city: 'Phoenix',
          state: 'AZ',
          zip: '85001'
        }
      },
      vehicleData: {
        year: 2021,
        make: 'Honda',
        model: 'Civic',
        mileage: 45000
      }
    };

    await generateQuoteMutation.mutateAsync(sampleQuoteRequest);
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

  const products = productsData?.products || {};

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

        {/* Quote Results Section */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quote Results</h2>
          
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