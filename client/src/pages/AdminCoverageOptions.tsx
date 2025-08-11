import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Shield, Car } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminCoverageOptions() {
  const { data: coverageOptions, isLoading } = useQuery({
    queryKey: ['/api/admin/coverage-options'],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Coverage Options Configuration</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Coverage Providers & Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading coverage options...</div>
              ) : coverageOptions?.providers ? (
                <div className="space-y-6">
                  {coverageOptions.providers.map((provider: any) => (
                    <div key={provider.id} className="border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        {provider.id === 'hero-vsc' ? (
                          <Shield className="h-6 w-6 mr-3 text-blue-600" />
                        ) : (
                          <Car className="h-6 w-6 mr-3 text-green-600" />
                        )}
                        <h2 className="text-xl font-semibold">{provider.name}</h2>
                        <Badge variant="secondary" className="ml-3">
                          {provider.products.length} Products
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {provider.products.map((item: any) => (
                          <div key={item.productId} className="border rounded p-4 bg-gray-50">
                            <h3 className="font-medium text-sm mb-2">{item.product.name}</h3>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>ID: {item.productId}</div>
                              <div>Type: {item.product.type || 'VSC'}</div>
                              <div>Coverage: {item.product.description || 'Vehicle Service Contract'}</div>
                              {item.product.deductibleOptions && (
                                <div>Deductibles: {item.product.deductibleOptions.join(', ')}</div>
                              )}
                              {item.product.termOptions && (
                                <div>Terms: {item.product.termOptions.join(', ')} months</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No coverage options found.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coverage Configuration Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Add New Provider</div>
                    <div className="text-sm text-gray-600">Integrate additional VSC providers</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Modify Product Settings</div>
                    <div className="text-sm text-gray-600">Update coverage terms and options</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Eligibility Rules</div>
                    <div className="text-sm text-gray-600">Configure vehicle eligibility criteria</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Pricing Configuration</div>
                    <div className="text-sm text-gray-600">Manage pricing and markup settings</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}