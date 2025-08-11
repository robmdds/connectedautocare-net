import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, Shield, Car, Plus, Edit, Users, DollarSign } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminCoverageOptions() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();

  const { data: coverageOptions, isLoading } = useQuery({
    queryKey: ['/api/admin/coverage-options'],
    retry: false,
  });

  const handleModalOpen = (modalType: string) => {
    setActiveModal(modalType);
    setFormData({});
  };

  const handleModalClose = () => {
    setActiveModal(null);
    setFormData({});
  };

  const handleFormSubmit = async (actionType: string) => {
    try {
      // Here you would make API calls to save the configuration
      toast({
        title: "Configuration Updated",
        description: `${actionType} settings have been successfully updated.`,
      });
      handleModalClose();
    } catch (error) {
      toast({
        title: "Update Failed", 
        description: "There was an error updating the configuration.",
        variant: "destructive",
      });
    }
  };

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
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => handleModalOpen('addProvider')}
                >
                  <Plus className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Add New Provider</div>
                    <div className="text-sm text-gray-600">Integrate additional VSC providers</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => handleModalOpen('modifyProduct')}
                >
                  <Edit className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Modify Product Settings</div>
                    <div className="text-sm text-gray-600">Update coverage terms and options</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => handleModalOpen('eligibilityRules')}
                >
                  <Users className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Eligibility Rules</div>
                    <div className="text-sm text-gray-600">Configure vehicle eligibility criteria</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => handleModalOpen('pricingConfig')}
                >
                  <DollarSign className="h-5 w-5 mr-3" />
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

      {/* Add New Provider Modal */}
      <Dialog open={activeModal === 'addProvider'} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Provider</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="providerName">Provider Name</Label>
              <Input 
                id="providerName"
                value={formData.providerName || ''}
                onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                placeholder="e.g., Premium Auto Care"
              />
            </div>
            <div>
              <Label htmlFor="providerType">Provider Type</Label>
              <Select value={formData.providerType || ''} onValueChange={(value) => setFormData({ ...formData, providerType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vsc">Vehicle Service Contract</SelectItem>
                  <SelectItem value="warranty">Extended Warranty</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="apiEndpoint">API Endpoint</Label>
              <Input 
                id="apiEndpoint"
                value={formData.apiEndpoint || ''}
                onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                placeholder="https://api.provider.com/v1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleModalClose}>Cancel</Button>
              <Button onClick={() => handleFormSubmit('Provider')}>Add Provider</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modify Product Settings Modal */}
      <Dialog open={activeModal === 'modifyProduct'} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modify Product Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Select value={formData.provider || ''} onValueChange={(value) => setFormData({ ...formData, provider: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero-vsc">Hero VSC</SelectItem>
                  <SelectItem value="connected-auto-care">Connected Auto Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="productId">Product</Label>
              <Select value={formData.productId || ''} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELEVATE_PLATINUM">Elevate Platinum</SelectItem>
                  <SelectItem value="ELEVATE_GOLD">Elevate Gold</SelectItem>
                  <SelectItem value="PINNACLE_SILVER">Pinnacle Silver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="termOptions">Term Options (months)</Label>
              <Input 
                id="termOptions"
                value={formData.termOptions || ''}
                onChange={(e) => setFormData({ ...formData, termOptions: e.target.value })}
                placeholder="24, 36, 48, 60"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleModalClose}>Cancel</Button>
              <Button onClick={() => handleFormSubmit('Product Settings')}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Eligibility Rules Modal */}
      <Dialog open={activeModal === 'eligibilityRules'} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Eligibility Rules</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="maxAge">Maximum Vehicle Age (years)</Label>
              <Input 
                id="maxAge"
                type="number"
                value={formData.maxAge || ''}
                onChange={(e) => setFormData({ ...formData, maxAge: e.target.value })}
                placeholder="15"
              />
            </div>
            <div>
              <Label htmlFor="maxMileage">Maximum Mileage</Label>
              <Input 
                id="maxMileage"
                type="number"
                value={formData.maxMileage || ''}
                onChange={(e) => setFormData({ ...formData, maxMileage: e.target.value })}
                placeholder="150000"
              />
            </div>
            <div>
              <Label htmlFor="excludedMakes">Excluded Makes</Label>
              <Textarea 
                id="excludedMakes"
                value={formData.excludedMakes || ''}
                onChange={(e) => setFormData({ ...formData, excludedMakes: e.target.value })}
                placeholder="Enter excluded vehicle makes, one per line"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleModalClose}>Cancel</Button>
              <Button onClick={() => handleFormSubmit('Eligibility Rules')}>Update Rules</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pricing Configuration Modal */}
      <Dialog open={activeModal === 'pricingConfig'} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pricing Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="baseMarkup">Base Markup (%)</Label>
              <Input 
                id="baseMarkup"
                type="number"
                value={formData.baseMarkup || ''}
                onChange={(e) => setFormData({ ...formData, baseMarkup: e.target.value })}
                placeholder="15"
              />
            </div>
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input 
                id="taxRate"
                type="number"
                step="0.01"
                value={formData.taxRate || ''}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                placeholder="6.5"
              />
            </div>
            <div>
              <Label htmlFor="adminFee">Admin Fee ($)</Label>
              <Input 
                id="adminFee"
                type="number"
                value={formData.adminFee || ''}
                onChange={(e) => setFormData({ ...formData, adminFee: e.target.value })}
                placeholder="50"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleModalClose}>Cancel</Button>
              <Button onClick={() => handleFormSubmit('Pricing Configuration')}>Save Settings</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}