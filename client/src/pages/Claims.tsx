import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Search, Plus, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Claims() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: claims, isLoading } = useQuery({
    queryKey: ["/api/claims"],
    retry: false,
  });

  const filteredClaims = claims?.filter((claim: any) =>
    claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'under_review': return 'secondary';
      case 'approved': return 'default';
      case 'denied': return 'destructive';
      case 'settled': return 'default';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Shield className="h-8 w-8 text-blue-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Claims Management</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              File New Claim
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Link href="/" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <Link href="/policies" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Policies
            </Link>
            <Link href="/claims" className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium">
              Claims
            </Link>
            <Link href="/analytics" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Analytics
            </Link>
            <Link href="/admin" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search claims by number or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">Loading claims...</div>
              </CardContent>
            </Card>
          ) : filteredClaims.length > 0 ? (
            filteredClaims.map((claim: any) => (
              <Card key={claim.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{claim.claimNumber}</CardTitle>
                    <Badge variant={getStatusColor(claim.status)}>
                      {claim.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Incident Date</p>
                      <p className="text-sm text-gray-900">
                        {claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Estimated Amount</p>
                      <p className="text-sm text-gray-900">
                        {claim.estimatedAmount ? `$${claim.estimatedAmount}` : 'Not assessed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Submitted</p>
                      <p className="text-sm text-gray-900">
                        {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-sm text-gray-900 mt-1">{claim.description || 'No description provided'}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Location: {claim.incidentLocation || 'Not specified'}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Process
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No claims found' : 'No claims yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search criteria' 
                      : 'Claims will appear here when customers file them'
                    }
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    File New Claim
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}