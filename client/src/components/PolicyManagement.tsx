import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { SearchIcon, FilterIcon, EyeIcon, EditIcon, CheckCircleIcon, PlusCircleIcon } from "lucide-react";

export default function PolicyManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: policies, isLoading } = useQuery({
    queryKey: ["/api/policies"],
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auto': return 'bg-blue-100 text-blue-800';
      case 'rv': return 'bg-purple-100 text-purple-800';
      case 'marine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPolicies = policies?.filter((policy: any) =>
    policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Policy Management</CardTitle>
          <div className="flex items-center space-x-3">
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
              <Button variant="outline" size="sm">
                <FilterIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Policy documents image */}
          <div className="md:col-span-2 lg:col-span-1">
            <img 
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
              alt="Policy documents and contracts on desk" 
              className="rounded-lg shadow-sm w-full h-48 object-cover" 
            />
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
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
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New This Month</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {analytics?.newThisMonth || 0}
                      </p>
                    </div>
                    <PlusCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Business insurance documents */}
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=200" 
              alt="Business insurance documentation and analysis" 
              className="rounded-lg shadow-sm w-full h-32 object-cover" 
            />
          </div>
        </div>

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
                  <TableHead>Policy</TableHead>
                  <TableHead>Policyholder</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.slice(0, 5).map((policy: any) => (
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
                      <div className="font-medium">{policy.customerName}</div>
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
  );
}
