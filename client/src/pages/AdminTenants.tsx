import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Building, Plus, Edit, Trash2, Users, Shield, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function AdminTenants() {
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantDescription, setNewTenantDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['/api/admin/tenants'],
    retry: false,
  });

  const createTenantMutation = useMutation({
    mutationFn: async (tenant: any) => {
      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenant),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tenant Created",
        description: "New tenant has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      setIsCreateDialogOpen(false);
      setNewTenantName('');
      setNewTenantDescription('');
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sample tenant data for demonstration
  const sampleTenants = [
    {
      id: 'hero-vsc',
      name: 'Hero VSC',
      description: 'Hero Vehicle Service Contract provider with comprehensive warranty products',
      status: 'active',
      productsCount: 6,
      policiesCount: 1250,
      createdAt: '2024-01-15',
      lastActivity: '2025-08-11'
    },
    {
      id: 'connected-auto-care',
      name: 'Connected Auto Care',
      description: 'Premium VSC provider offering Elevate and Pinnacle product lines',
      status: 'active',
      productsCount: 3,
      policiesCount: 890,
      createdAt: '2024-03-22',
      lastActivity: '2025-08-11'
    },
    {
      id: '9845ec29-d1bc-40ea-b086-226736367ea3',
      name: 'Sample Insurance Tenant',
      description: 'Demo tenant for traditional insurance products',
      status: 'active',
      productsCount: 5,
      policiesCount: 567,
      createdAt: '2024-05-10',
      lastActivity: '2025-08-10'
    }
  ];

  const handleCreateTenant = () => {
    if (!newTenantName.trim()) {
      toast({
        title: "Validation Error",
        description: "Tenant name is required.",
        variant: "destructive",
      });
      return;
    }

    createTenantMutation.mutate({
      name: newTenantName,
      description: newTenantDescription,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tenant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tenant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tenantName">Tenant Name</Label>
                    <Input
                      id="tenantName"
                      value={newTenantName}
                      onChange={(e) => setNewTenantName(e.target.value)}
                      placeholder="Enter tenant name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenantDescription">Description</Label>
                    <Textarea
                      id="tenantDescription"
                      value={newTenantDescription}
                      onChange={(e) => setNewTenantDescription(e.target.value)}
                      placeholder="Enter tenant description"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTenant} disabled={createTenantMutation.isPending}>
                      {createTenantMutation.isPending ? 'Creating...' : 'Create Tenant'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Tenant Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Tenant Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{sampleTenants.length}</div>
                  <div className="text-sm text-gray-600">Total Tenants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sampleTenants.filter(t => t.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Tenants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {sampleTenants.reduce((sum, t) => sum + t.productsCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {sampleTenants.reduce((sum, t) => sum + t.policiesCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Policies</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading tenants...</div>
              ) : (
                <div className="space-y-4">
                  {sampleTenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Building className="h-8 w-8 text-gray-600" />
                        <div>
                          <h3 className="font-medium">{tenant.name}</h3>
                          <p className="text-sm text-gray-600">{tenant.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>ID: {tenant.id}</span>
                            <span>Created: {tenant.createdAt}</span>
                            <span>Last Activity: {tenant.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <div>{tenant.productsCount} Products</div>
                          <div>{tenant.policiesCount} Policies</div>
                        </div>
                        {getStatusBadge(tenant.status)}
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Shield className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}