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
  AlertTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Claims() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: claims, isLoading, error } = useQuery({
    queryKey: ["/api/claims"],
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
      case 'open': return 'bg-red-100 text-red-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-gray-100 text-gray-800';
      case 'payout': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClaimTypeColor = (type: string) => {
    switch (type) {
      case 'collision': return 'bg-red-100 text-red-800';
      case 'comprehensive': return 'bg-blue-100 text-blue-800';
      case 'theft': return 'bg-purple-100 text-purple-800';
      case 'vandalism': return 'bg-orange-100 text-orange-800';
      case 'weather': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClaims = claims?.filter((claim: any) =>
    claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claimantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claimantEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Claims Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage insurance claims from FNOL to payout with complete workflow tracking.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <FilterIcon className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                <AlertTriangleIcon className="w-4 h-4 mr-2" />
                File New Claim
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent Claims</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics?.urgentClaims || 0}
                  </p>
                </div>
                <AlertTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics?.underReview || 0}
                  </p>
                </div>
                <ClockIcon className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics?.approvedClaims || 0}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims Process Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300" 
              alt="Claims processing and documentation workflow" 
              className="rounded-lg shadow-sm w-full h-32 object-cover" 
            />
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {analytics?.urgentClaims || 23}
                  </p>
                  <p className="text-sm text-gray-600">Urgent Claims</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <img 
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300" 
              alt="Insurance adjuster conducting vehicle damage inspection" 
              className="rounded-lg shadow-sm w-full h-32 object-cover" 
            />
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">
                    {analytics?.underReview || 87}
                  </p>
                  <p className="text-sm text-gray-600">Under Review</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <img 
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300" 
              alt="Professional vehicle inspection and damage assessment" 
              className="rounded-lg shadow-sm w-full h-32 object-cover" 
            />
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {analytics?.approvedClaims || 142}
                  </p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Claims</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search claims..."
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
            ) : filteredClaims.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No claims found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim #</TableHead>
                      <TableHead>Claimant</TableHead>
                      <TableHead>Policy</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Adjuster</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim: any) => (
                      <TableRow key={claim.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{claim.claimNumber}</div>
                            <div className="text-sm text-gray-500">
                              Filed: {new Date(claim.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{claim.claimantName}</div>
                            <div className="text-sm text-gray-500">{claim.claimantEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {claim.policyId ? `POL-${claim.policyId.slice(-6)}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getClaimTypeColor(claim.type)}>
                            {claim.type?.charAt(0).toUpperCase() + claim.type?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${parseFloat(claim.estimatedAmount || '0').toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status?.charAt(0).toUpperCase() + claim.status?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {claim.adjusterId ? 'Assigned' : 'Unassigned'}
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
