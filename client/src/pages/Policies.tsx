import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  EyeIcon, 
  EditIcon,
  FileTextIcon,
  CheckCircleIcon
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Policies() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: policies, isLoading, error } = useQuery({
    queryKey: ["/api/policies"],
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    retry: false,
  });

  // Handle error states
  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auto': return 'bg-blue-100 text-blue-800';
      case 'rv': return 'bg-purple-100 text-purple-800';
      case 'marine': return 'bg-green-100 text-green-800';
      case 'powersports': return 'bg-orange-100 text-orange-800';
      case 'home': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPolicies = policies?.filter((policy: any) =>
    policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Policy Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your insurance policies, track renewals, and monitor policy lifecycle.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <FilterIcon className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                New Policy
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileTextIcon className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Policies</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics?.activePolicies?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 text-sm font-medium ml-1">8.2%</span>
                  <span className="text-gray-500 text-sm ml-1">from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Renewals</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics?.pendingRenewals || 0}
                  </p>
                </div>
                <i className="fas fa-clock text-orange-500 text-xl"></i>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics?.newThisMonth || 0}
                  </p>
                </div>
                <i className="fas fa-plus-circle text-green-600 text-xl"></i>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Premium</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${(analytics?.monthlyPremium / 1000000)?.toFixed(1) || '0'}M
                  </p>
                </div>
                <i className="fas fa-dollar-sign text-blue-600 text-xl"></i>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policy Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
              alt="Policy documents and contracts on desk" 
              className="rounded-lg shadow-sm w-full h-48 object-cover" 
            />
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=200" 
              alt="Business insurance documentation and analysis" 
              className="rounded-lg shadow-sm w-full h-48 object-cover" 
            />
          </div>
          <div className="md:col-span-1 flex flex-col space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{policies?.length || 0}</p>
                  <p className="text-sm text-gray-600">Total Policies</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {filteredPolicies?.filter((p: any) => p.status === 'active').length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Active Policies</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Policies</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search policies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredPolicies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No policies found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Number</TableHead>
                      <TableHead>Policyholder</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy: any) => (
                      <TableRow key={policy.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{policy.policyNumber}</div>
                            <div className="text-sm text-gray-500">
                              Expires: {new Date(policy.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{policy.customerName}</div>
                            <div className="text-sm text-gray-500">{policy.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor('auto')}>
                            Auto
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${parseFloat(policy.premium).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(policy.status)}>
                            {policy.status?.charAt(0).toUpperCase() + policy.status?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(policy.effectiveDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <EditIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
