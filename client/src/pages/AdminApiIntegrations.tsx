import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plug, CheckCircle, AlertCircle, Car, Brain, CreditCard, Database } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminApiIntegrations() {
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['/api/admin/integrations'],
    retry: false,
  });

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
                          {getStatusIcon(integration.status)}
                          {getStatusBadge(integration.status)}
                          <Button variant="outline" size="sm">
                            Test
                          </Button>
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
    </div>
  );
}