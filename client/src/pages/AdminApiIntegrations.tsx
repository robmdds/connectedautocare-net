import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Plug, CheckCircle, AlertCircle, Car, Brain, CreditCard, Database, Settings, TestTube } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminApiIntegrations() {
  const [editDialog, setEditDialog] = useState<{open: boolean, integration: any}>({open: false, integration: null});
  const [testDialog, setTestDialog] = useState<{open: boolean, integration: any, result: any}>({open: false, integration: null, result: null});
  const [editForm, setEditForm] = useState<any>({});
  const { toast } = useToast();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['/api/admin/integrations'],
    retry: false,
  });

  const testMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      return await apiRequest(`/api/admin/integrations/${integrationId}/test`, {
        method: 'POST'
      });
    },
    onSuccess: (result, integrationId) => {
      const integration = apiIntegrations.find(i => i.id === integrationId);
      setTestDialog({open: true, integration, result});
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: "Unable to test the integration connection.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({integrationId, data}: {integrationId: string, data: any}) => {
      return await apiRequest(`/api/admin/integrations/${integrationId}`, {
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Integration Updated",
        description: "The integration settings have been successfully updated.",
      });
      setEditDialog({open: false, integration: null});
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Unable to update the integration settings.",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (integration: any) => {
    setEditForm({
      apiKey: '••••••••••••',
      endpoint: integration.endpoint,
      timeout: '30000',
      retries: '3'
    });
    setEditDialog({open: true, integration});
  };

  const handleTest = (integration: any) => {
    testMutation.mutate(integration.id);
  };

  const handleSave = () => {
    if (editDialog.integration) {
      updateMutation.mutate({
        integrationId: editDialog.integration.id,
        data: editForm
      });
    }
  };

  const apiIntegrations = [
    {
      id: 'vin-decode',
      name: 'VIN Decoding Service',
      description: 'NHTSA API for vehicle identification and specifications',
      status: 'connected',
      icon: Car,
      endpoint: 'https://vpic.nhtsa.dot.gov/api/',
      lastTested: '2025-08-11',
      responseTime: '188ms'
    },
    {
      id: 'helcim-payments',
      name: 'Helcim Payment Gateway',
      description: 'Credit card processing and payment management',
      status: 'configured',
      icon: CreditCard,
      endpoint: 'https://api.helcim.com/v2/',
      lastTested: '2025-08-11',
      responseTime: '245ms'
    },
    {
      id: 'openai',
      name: 'OpenAI API',
      description: 'AI assistant and natural language processing',
      status: 'connected',
      icon: Brain,
      endpoint: 'https://api.openai.com/v1/',
      lastTested: '2025-08-11',
      responseTime: '892ms'
    },
    {
      id: 'postgres',
      name: 'PostgreSQL Database',
      description: 'Primary database for application data',
      status: 'connected',
      icon: Database,
      endpoint: 'Neon Serverless PostgreSQL',
      lastTested: '2025-08-11',
      responseTime: '45ms'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'configured':
        return <Badge className="bg-blue-100 text-blue-800">Configured</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'connected' || status === 'configured') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <AlertCircle className="h-5 w-5 text-red-600" />;
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
            <h1 className="text-2xl font-bold text-gray-900">API Integrations</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plug className="h-5 w-5 mr-2" />
                Active Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading integrations...</div>
              ) : (
                <div className="space-y-4">
                  {apiIntegrations.map((integration) => {
                    const IconComponent = integration.icon;
                    return (
                      <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <IconComponent className="h-8 w-8 text-gray-600" />
                          <div>
                            <h3 className="font-medium">{integration.name}</h3>
                            <p className="text-sm text-gray-600">{integration.description}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>Endpoint: {integration.endpoint}</span>
                              <span>Response: {integration.responseTime}</span>
                              <span>Last tested: {integration.lastTested}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTest(integration)}
                            disabled={testMutation.isPending}
                          >
                            <TestTube className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(integration)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {getStatusIcon(integration.status)}
                          {getStatusBadge(integration.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Health Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">4</div>
                  <div className="text-sm text-gray-600">Active Integrations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">100%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">342ms</div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">0</div>
                  <div className="text-sm text-gray-600">Failed Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Integration Dialog */}
      <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({open: false, integration: null})}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editDialog.integration?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={editForm.apiKey || ''}
                onChange={(e) => setEditForm({...editForm, apiKey: e.target.value})}
                placeholder="Enter API key"
              />
            </div>
            <div>
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                value={editForm.endpoint || ''}
                onChange={(e) => setEditForm({...editForm, endpoint: e.target.value})}
                placeholder="https://api.example.com/v1"
              />
            </div>
            <div>
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={editForm.timeout || ''}
                onChange={(e) => setEditForm({...editForm, timeout: e.target.value})}
                placeholder="30000"
              />
            </div>
            <div>
              <Label htmlFor="retries">Max Retries</Label>
              <Input
                id="retries"
                type="number"
                value={editForm.retries || ''}
                onChange={(e) => setEditForm({...editForm, retries: e.target.value})}
                placeholder="3"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setEditDialog({open: false, integration: null})}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Results Dialog */}
      <Dialog open={testDialog.open} onOpenChange={() => setTestDialog({open: false, integration: null, result: null})}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Test Results - {testDialog.integration?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {testDialog.result ? (
              <>
                <div className="flex items-center space-x-2">
                  {testDialog.result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${testDialog.result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testDialog.result.success ? 'Connection Successful' : 'Connection Failed'}
                  </span>
                </div>
                <div>
                  <Label>Response Time</Label>
                  <div className="text-sm text-gray-600">{testDialog.result.responseTime}ms</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="text-sm text-gray-600">{testDialog.result.status || 'N/A'}</div>
                </div>
                {testDialog.result.error && (
                  <div>
                    <Label>Error Details</Label>
                    <Textarea
                      value={testDialog.result.error}
                      readOnly
                      className="text-sm"
                      rows={3}
                    />
                  </div>
                )}
                {testDialog.result.data && (
                  <div>
                    <Label>Response Data</Label>
                    <Textarea
                      value={JSON.stringify(testDialog.result.data, null, 2)}
                      readOnly
                      className="text-sm font-mono"
                      rows={4}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <div className="mt-2 text-sm text-gray-600">Testing connection...</div>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setTestDialog({open: false, integration: null, result: null})}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}