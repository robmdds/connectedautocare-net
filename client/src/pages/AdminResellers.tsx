import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Store, Plus, Edit, DollarSign, TrendingUp, Users, Mail, Phone } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function AdminResellers() {
  const [newResellerName, setNewResellerName] = useState('');
  const [newResellerEmail, setNewResellerEmail] = useState('');
  const [newResellerCommission, setNewResellerCommission] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Edit reseller state
  const [editReseller, setEditReseller] = useState<any>(null);
  const [editResellerName, setEditResellerName] = useState('');
  const [editResellerEmail, setEditResellerEmail] = useState('');
  const [editResellerCommission, setEditResellerCommission] = useState('');
  const [editResellerTier, setEditResellerTier] = useState('');
  const [editResellerStatus, setEditResellerStatus] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resellers, isLoading } = useQuery({
    queryKey: ['/api/admin/resellers'],
    retry: false,
  });

  const createResellerMutation = useMutation({
    mutationFn: async (reseller: any) => {
      const response = await fetch('/api/admin/resellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reseller),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reseller Created",
        description: "New reseller has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resellers'] });
      setIsCreateDialogOpen(false);
      setNewResellerName('');
      setNewResellerEmail('');
      setNewResellerCommission('');
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateResellerMutation = useMutation({
    mutationFn: async ({ id, reseller }: { id: string, reseller: any }) => {
      const response = await fetch(`/api/admin/resellers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reseller),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reseller Updated",
        description: "Reseller has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resellers'] });
      setIsEditDialogOpen(false);
      setEditReseller(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sample reseller data for demonstration
  const sampleResellers = [
    {
      id: 'dealer-123',
      name: 'Premium Auto Dealers',
      email: 'contact@premiumauto.com',
      phone: '(555) 123-4567',
      status: 'active',
      commissionRate: 15.0,
      totalSales: 245000,
      policiesSold: 156,
      joinDate: '2024-02-15',
      lastSale: '2025-08-10',
      tier: 'platinum'
    },
    {
      id: 'dealer-456',
      name: 'Metro Vehicle Services',
      email: 'sales@metrovehicle.com',
      phone: '(555) 987-6543',
      status: 'active',
      commissionRate: 12.5,
      totalSales: 189000,
      policiesSold: 98,
      joinDate: '2024-04-22',
      lastSale: '2025-08-09',
      tier: 'gold'
    },
    {
      id: 'dealer-789',
      name: 'Coastal Auto Care',
      email: 'info@coastalauto.com',
      phone: '(555) 456-7890',
      status: 'active',
      commissionRate: 10.0,
      totalSales: 95000,
      policiesSold: 67,
      joinDate: '2024-06-10',
      lastSale: '2025-08-08',
      tier: 'silver'
    },
    {
      id: 'dealer-101',
      name: 'Budget Car Solutions',
      email: 'team@budgetcar.com',
      phone: '(555) 321-0987',
      status: 'pending',
      commissionRate: 8.0,
      totalSales: 23000,
      policiesSold: 15,
      joinDate: '2025-07-28',
      lastSale: '2025-08-05',
      tier: 'bronze'
    }
  ];

  const handleCreateReseller = () => {
    if (!newResellerName.trim() || !newResellerEmail.trim()) {
      toast({
        title: "Validation Error",
        description: "Reseller name and email are required.",
        variant: "destructive",
      });
      return;
    }

    createResellerMutation.mutate({
      name: newResellerName,
      email: newResellerEmail,
      commissionRate: parseFloat(newResellerCommission) || 10.0,
    });
  };

  const handleEditReseller = (reseller: any) => {
    setEditReseller(reseller);
    setEditResellerName(reseller.name);
    setEditResellerEmail(reseller.email);
    setEditResellerCommission(reseller.commissionRate.toString());
    setEditResellerTier(reseller.tier);
    setEditResellerStatus(reseller.status);
    setIsEditDialogOpen(true);
  };

  const handleUpdateReseller = () => {
    if (!editResellerName.trim() || !editResellerEmail.trim()) {
      toast({
        title: "Validation Error",
        description: "Reseller name and email are required.",
        variant: "destructive",
      });
      return;
    }

    updateResellerMutation.mutate({
      id: editReseller.id,
      reseller: {
        name: editResellerName,
        email: editResellerEmail,
        commissionRate: parseFloat(editResellerCommission),
        tier: editResellerTier,
        status: editResellerStatus,
      }
    });
  };

  const handleViewCommissions = (reseller: any) => {
    toast({
      title: "Commission Details",
      description: `${reseller.name} has a ${reseller.commissionRate}% commission rate with total earnings of $${(reseller.totalSales * reseller.commissionRate / 100).toFixed(2)}.`,
    });
  };

  const handleViewPerformance = (reseller: any) => {
    toast({
      title: "Performance Metrics",
      description: `${reseller.name} has sold ${reseller.policiesSold} policies generating $${reseller.totalSales.toLocaleString()} in total sales.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return <Badge className="bg-purple-100 text-purple-800">Platinum</Badge>;
      case 'gold':
        return <Badge className="bg-yellow-100 text-yellow-800">Gold</Badge>;
      case 'silver':
        return <Badge className="bg-gray-100 text-gray-800">Silver</Badge>;
      case 'bronze':
        return <Badge className="bg-orange-100 text-orange-800">Bronze</Badge>;
      default:
        return <Badge variant="secondary">Untiered</Badge>;
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
              <h1 className="text-2xl font-bold text-gray-900">Reseller Management</h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reseller
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Reseller</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resellerName">Company Name</Label>
                    <Input
                      id="resellerName"
                      value={newResellerName}
                      onChange={(e) => setNewResellerName(e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resellerEmail">Email Address</Label>
                    <Input
                      id="resellerEmail"
                      type="email"
                      value={newResellerEmail}
                      onChange={(e) => setNewResellerEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resellerCommission">Commission Rate (%)</Label>
                    <Input
                      id="resellerCommission"
                      type="number"
                      value={newResellerCommission}
                      onChange={(e) => setNewResellerCommission(e.target.value)}
                      placeholder="10.0"
                      min="0"
                      max="50"
                      step="0.5"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateReseller} disabled={createResellerMutation.isPending}>
                      {createResellerMutation.isPending ? 'Creating...' : 'Add Reseller'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Edit Reseller Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Reseller</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editResellerName">Company Name</Label>
              <Input
                id="editResellerName"
                value={editResellerName}
                onChange={(e) => setEditResellerName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="editResellerEmail">Email Address</Label>
              <Input
                id="editResellerEmail"
                type="email"
                value={editResellerEmail}
                onChange={(e) => setEditResellerEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="editResellerCommission">Commission Rate (%)</Label>
              <Input
                id="editResellerCommission"
                type="number"
                value={editResellerCommission}
                onChange={(e) => setEditResellerCommission(e.target.value)}
                placeholder="10.0"
                min="0"
                max="50"
                step="0.5"
              />
            </div>
            <div>
              <Label htmlFor="editResellerTier">Tier</Label>
              <Select value={editResellerTier} onValueChange={setEditResellerTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editResellerStatus">Status</Label>
              <Select value={editResellerStatus} onValueChange={setEditResellerStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateReseller} disabled={updateResellerMutation.isPending}>
                {updateResellerMutation.isPending ? 'Updating...' : 'Update Reseller'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Reseller Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Reseller Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{sampleResellers.length}</div>
                  <div className="text-sm text-gray-600">Total Resellers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sampleResellers.filter(r => r.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Resellers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${sampleResellers.reduce((sum, r) => sum + r.totalSales, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {sampleResellers.reduce((sum, r) => sum + r.policiesSold, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Policies Sold</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reseller List */}
          <Card>
            <CardHeader>
              <CardTitle>Reseller Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading resellers...</div>
              ) : (
                <div className="space-y-4">
                  {sampleResellers.map((reseller) => (
                    <div key={reseller.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Store className="h-8 w-8 text-gray-600" />
                        <div>
                          <h3 className="font-medium">{reseller.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span>{reseller.email}</span>
                            <Phone className="h-3 w-3 ml-2" />
                            <span>{reseller.phone}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>ID: {reseller.id}</span>
                            <span>Joined: {reseller.joinDate}</span>
                            <span>Last Sale: {reseller.lastSale}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <div className="font-medium">${reseller.totalSales.toLocaleString()}</div>
                          <div className="text-gray-600">{reseller.policiesSold} policies</div>
                          <div className="text-gray-600">{reseller.commissionRate}% commission</div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          {getStatusBadge(reseller.status)}
                          {getTierBadge(reseller.tier)}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditReseller(reseller)}
                            title="Edit Reseller"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewCommissions(reseller)}
                            title="View Commissions"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPerformance(reseller)}
                            title="View Performance"
                          >
                            <TrendingUp className="h-4 w-4" />
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