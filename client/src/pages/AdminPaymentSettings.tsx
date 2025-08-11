import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function AdminPaymentSettings() {
  const [helcimApiKey, setHelcimApiKey] = useState('');
  const [testMode, setTestMode] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentConfig, isLoading } = useQuery({
    queryKey: ['/api/admin/payment-config'],
    retry: false,
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await fetch('/api/admin/payment-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Payment configuration has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-config'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    updateConfigMutation.mutate({
      helcimApiKey,
      testMode,
    });
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
            <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Helcim Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Helcim Payment Gateway
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Connection Status</h3>
                  <p className="text-sm text-gray-600">Current Helcim API connection</p>
                </div>
                <div className="flex items-center space-x-2">
                  {paymentConfig?.helcimConnected ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <Badge variant="secondary" className="bg-red-100 text-red-800">Not Connected</Badge>
                    </>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="helcimApiKey">Helcim API Key</Label>
                <Input
                  id="helcimApiKey"
                  type="password"
                  placeholder="Enter Helcim API key"
                  value={helcimApiKey}
                  onChange={(e) => setHelcimApiKey(e.target.value)}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Your Helcim API key for payment processing
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="testMode"
                  checked={testMode}
                  onCheckedChange={setTestMode}
                />
                <Label htmlFor="testMode">Test Mode</Label>
              </div>

              <Button onClick={handleSaveConfig} disabled={updateConfigMutation.isPending}>
                {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>

          {/* Payment Processing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Processing Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Current Configuration</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Payment Provider:</span>
                      <span className="font-medium">Helcim</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto Policy Issuance:</span>
                      <span className="font-medium text-green-600">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Webhook Verification:</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction Fees:</span>
                      <span className="font-medium">2.9% + $0.30</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Supported Payment Methods</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Visa</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Mastercard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">American Express</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Discover</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}