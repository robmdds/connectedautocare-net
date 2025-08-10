import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Search, Plus, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Policies() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: policies, isLoading } = useQuery({
    queryKey: ["/api/policies"],
    retry: false,
  });

  const filteredPolicies = policies?.filter((policy: any) =>
    policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'secondary';
      case 'cancelled': return 'destructive';
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
              <h1 className="text-2xl font-bold text-gray-900">Policy Management</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Quote
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
            <Link href="/policies" className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium">
              Policies
            </Link>
            <Link href="/claims" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
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
        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search policies by number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Policies List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">Loading policies...</div>
              </CardContent>
            </Card>
          ) : filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy: any) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{policy.policyNumber}</CardTitle>
                    <Badge variant={getStatusColor(policy.status)}>
                      {policy.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customer</p>
                      <p className="text-sm text-gray-900">{policy.customerName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Product</p>
                      <p className="text-sm text-gray-900">{policy.productName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Premium</p>
                      <p className="text-sm text-gray-900">${policy.premium}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Effective: {policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : 'N/A'} - 
                      Expires: {policy.expiryDate ? new Date(policy.expiryDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
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
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No policies found' : 'No policies yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search criteria' 
                      : 'Start by creating your first quote to generate policies'
                    }
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quote
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