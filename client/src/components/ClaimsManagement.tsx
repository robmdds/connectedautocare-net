import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertTriangleIcon, 
  ClockIcon, 
  CheckCircleIcon,
  EyeIcon,
  EditIcon
} from "lucide-react";

export default function ClaimsManagement() {
  const { data: claims, isLoading } = useQuery({
    queryKey: ["/api/claims"],
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClaimTypeColor = (type: string) => {
    switch (type) {
      case 'collision': return 'bg-red-100 text-red-800';
      case 'theft': return 'bg-blue-100 text-blue-800';
      case 'comprehensive': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Claims Management</CardTitle>
          <Button className="bg-red-600 hover:bg-red-700">
            <AlertTriangleIcon className="w-4 h-4 mr-2" />
            File New Claim
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Claims processing workflow */}
          <div className="space-y-4">
            <img 
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300" 
              alt="Claims processing and documentation workflow" 
              className="rounded-lg shadow-sm w-full h-32 object-cover" 
            />
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Urgent Claims</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics?.urgentClaims || 23}
                    </p>
                  </div>
                  <AlertTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insurance adjuster inspection */}
          <div className="space-y-4">
            <img 
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300" 
              alt="Insurance adjuster conducting vehicle damage inspection" 
              className="rounded-lg shadow-sm w-full h-32 object-cover" 
            />
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Under Review</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics?.underReview || 87}
                    </p>
                  </div>
                  <ClockIcon className="w-6 h-6 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle inspection process */}
          <div className="space-y-4">
            <img 
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300" 
              alt="Professional vehicle inspection and damage assessment" 
              className="rounded-lg shadow-sm w-full h-32 object-cover" 
            />
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics?.approvedClaims || 142}
                    </p>
                  </div>
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : claims?.length === 0 ? (
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
                {claims?.slice(0, 3).map((claim: any) => (
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
                      <div className="font-medium">{claim.claimantName}</div>
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
                )) || []}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
