import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Eye, 
  Edit,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Car,
  Home,
  MapPin,
  CreditCard,
  FileCheck,
  Send,
  Archive,
  Trash2,
  UserCheck
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addMonths } from "date-fns";

interface Policy {
  id: string;
  policyNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productType: "auto" | "home" | "rv" | "marine" | "powersports";
  productName: string;
  coverageLevel: string;
  status: "active" | "pending" | "cancelled" | "expired" | "suspended";
  effectiveDate: string;
  expirationDate: string;
  premiumAmount: number;
  deductible: number;
  paymentMethod: string;
  paymentFrequency: "monthly" | "quarterly" | "semi-annual" | "annual";
  nextPaymentDue: string;
  agent?: string;
  notes: string;
  documents: {
    id: string;
    name: string;
    type: "policy" | "certificate" | "amendment" | "cancellation";
    url: string;
    createdAt: string;
  }[];
  claims: {
    id: string;
    claimNumber: string;
    dateOfLoss: string;
    status: string;
    amount: number;
  }[];
  vehicle?: {
    vin: string;
    year: number;
    make: string;
    model: string;
    mileage: number;
  };
  property?: {
    address: string;
    propertyType: string;
    squareFootage: number;
    yearBuilt: number;
  };
  renewalInfo: {
    autoRenew: boolean;
    renewalDate: string;
    renewalPremium: number;
    renewalNotificationSent: boolean;
  };
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
  suspended: "bg-orange-100 text-orange-800"
};

const productTypeIcons = {
  auto: Car,
  home: Home,
  rv: Car,
  marine: Car,
  powersports: Car
};

export default function PolicyManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch policies with filters
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["/api/policies/management", filterStatus, filterProduct, searchTerm],
  });

  // Fetch policy statistics
  const { data: policyStats } = useQuery({
    queryKey: ["/api/policies/statistics"],
  });

  // Generate document mutation
  const generateDocumentMutation = useMutation({
    mutationFn: async ({ policyId, documentType }: { policyId: string; documentType: string }) => {
      return await apiRequest("POST", `/api/policies/${policyId}/generate-document`, { documentType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies/management"] });
      toast({
        title: "Document Generated",
        description: "Policy document has been generated successfully",
      });
    },
  });

  // Update policy status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ policyId, status, reason }: { policyId: string; status: string; reason?: string }) => {
      return await apiRequest("PUT", `/api/policies/${policyId}/status`, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies/management"] });
      toast({
        title: "Status Updated",
        description: "Policy status has been successfully updated",
      });
    },
  });

  // Send renewal notice
  const sendRenewalMutation = useMutation({
    mutationFn: async (policyId: string) => {
      return await apiRequest("POST", `/api/policies/${policyId}/renewal-notice`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies/management"] });
      toast({
        title: "Renewal Notice Sent",
        description: "Renewal notice has been sent to the customer",
      });
    },
  });

  const filteredPolicies = policies.filter((policy: Policy) => {
    const matchesStatus = filterStatus === "all" || policy.status === filterStatus;
    const matchesProduct = filterProduct === "all" || policy.productType === filterProduct;
    const matchesSearch = searchTerm === "" || 
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesProduct && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired': return <Calendar className="h-4 w-4 text-gray-500" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Policy Management</h1>
            <p className="text-gray-600 mt-2">Comprehensive policy lifecycle management and document generation</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" data-testid="button-export-policies">
              <Download className="h-4 w-4 mr-2" />
              Export Policies
            </Button>
            <Button data-testid="button-new-policy">
              <Plus className="h-4 w-4 mr-2" />
              Issue Policy
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-policies">
                {policyStats?.activePolicies || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{policyStats?.newThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-premium-revenue">
                ${(policyStats?.premiumRevenue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renewals Due</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-renewals-due">
                {policyStats?.renewalsDue || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Next 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-retention-rate">
                {policyStats?.retentionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Customer retention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by policy number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-policies"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="w-[180px]" data-testid="select-product-filter">
                <SelectValue placeholder="Filter by Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="rv">RV</SelectItem>
                <SelectItem value="marine">Marine</SelectItem>
                <SelectItem value="powersports">Powersports</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" data-testid="button-refresh-policies">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Policies List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Policies ({filteredPolicies.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading policies...</p>
                  </div>
                ) : filteredPolicies.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No policies found matching your criteria
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredPolicies.map((policy: Policy) => {
                      const ProductIcon = productTypeIcons[policy.productType];
                      const isExpiringSoon = new Date(policy.expirationDate) < addDays(new Date(), 30);
                      
                      return (
                        <div
                          key={policy.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedPolicy(policy)}
                          data-testid={`policy-item-${policy.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <ProductIcon className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-sm">
                                  {policy.policyNumber}
                                </span>
                                <Badge className={statusColors[policy.status]}>
                                  {policy.status}
                                </Badge>
                                {isExpiringSoon && policy.status === 'active' && (
                                  <Badge className="bg-orange-100 text-orange-800">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Expiring Soon
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-900 font-medium">
                                {policy.customerName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {policy.productName} • {policy.coverageLevel}
                              </p>
                              <p className="text-sm text-gray-500">
                                Expires: {format(new Date(policy.expirationDate), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                ${policy.premiumAmount.toLocaleString()}/year
                              </p>
                              <p className="text-xs text-gray-500">
                                {policy.paymentFrequency}
                              </p>
                              {getStatusIcon(policy.status)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Policy Details */}
          <div className="lg:col-span-1">
            {selectedPolicy ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Policy Details</CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateDocumentMutation.mutate({ 
                          policyId: selectedPolicy.id, 
                          documentType: 'certificate' 
                        })}
                        disabled={generateDocumentMutation.isPending}
                        data-testid="button-generate-certificate"
                      >
                        <FileCheck className="h-4 w-4 mr-2" />
                        Certificate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendRenewalMutation.mutate(selectedPolicy.id)}
                        disabled={sendRenewalMutation.isPending}
                        data-testid="button-send-renewal"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Renewal
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="coverage">Coverage</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                      <TabsTrigger value="claims">Claims</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Policy Number</Label>
                        <p className="text-sm text-gray-600" data-testid="text-policy-number">
                          {selectedPolicy.policyNumber}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Customer Information</Label>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <UserCheck className="h-3 w-3 inline mr-1" />
                            {selectedPolicy.customerName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <Mail className="h-3 w-3 inline mr-1" />
                            {selectedPolicy.customerEmail}
                          </p>
                          <p className="text-sm text-gray-600">
                            <Phone className="h-3 w-3 inline mr-1" />
                            {selectedPolicy.customerPhone}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Effective Date</Label>
                          <p className="text-sm text-gray-600">
                            {format(new Date(selectedPolicy.effectiveDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Expiration Date</Label>
                          <p className="text-sm text-gray-600">
                            {format(new Date(selectedPolicy.expirationDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Premium</Label>
                          <p className="text-lg font-semibold text-green-600">
                            ${selectedPolicy.premiumAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Deductible</Label>
                          <p className="text-lg font-semibold text-blue-600">
                            ${selectedPolicy.deductible.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Update Status</Label>
                        <Select
                          value={selectedPolicy.status}
                          onValueChange={(status) => 
                            updateStatusMutation.mutate({ 
                              policyId: selectedPolicy.id, 
                              status 
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    <TabsContent value="coverage" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Product Details</Label>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <Shield className="h-3 w-3 inline mr-1" />
                            {selectedPolicy.productName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Coverage Level: {selectedPolicy.coverageLevel}
                          </p>
                          <p className="text-sm text-gray-600">
                            Payment: {selectedPolicy.paymentFrequency} • {selectedPolicy.paymentMethod}
                          </p>
                        </div>
                      </div>

                      {selectedPolicy.vehicle && (
                        <div>
                          <Label className="text-sm font-medium">Vehicle Information</Label>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <Car className="h-3 w-3 inline mr-1" />
                              {selectedPolicy.vehicle.year} {selectedPolicy.vehicle.make} {selectedPolicy.vehicle.model}
                            </p>
                            <p className="text-sm text-gray-600">
                              VIN: {selectedPolicy.vehicle.vin}
                            </p>
                            <p className="text-sm text-gray-600">
                              Mileage: {selectedPolicy.vehicle.mileage.toLocaleString()} miles
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedPolicy.property && (
                        <div>
                          <Label className="text-sm font-medium">Property Information</Label>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <Home className="h-3 w-3 inline mr-1" />
                              {selectedPolicy.property.propertyType}
                            </p>
                            <p className="text-sm text-gray-600">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {selectedPolicy.property.address}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedPolicy.property.squareFootage.toLocaleString()} sq ft • Built {selectedPolicy.property.yearBuilt}
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium">Renewal Information</Label>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Auto Renew: {selectedPolicy.renewalInfo.autoRenew ? 'Yes' : 'No'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Renewal Date: {format(new Date(selectedPolicy.renewalInfo.renewalDate), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Renewal Premium: ${selectedPolicy.renewalInfo.renewalPremium.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Policy Documents</Label>
                        <div className="space-y-2 mt-2">
                          {selectedPolicy.documents.length === 0 ? (
                            <p className="text-sm text-gray-500">No documents available</p>
                          ) : (
                            selectedPolicy.documents.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="text-sm font-medium">{doc.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {doc.type} • {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                                    </p>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Generate New Document</Label>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => generateDocumentMutation.mutate({ 
                              policyId: selectedPolicy.id, 
                              documentType: 'policy' 
                            })}
                            disabled={generateDocumentMutation.isPending}
                          >
                            Policy Document
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateDocumentMutation.mutate({ 
                              policyId: selectedPolicy.id, 
                              documentType: 'certificate' 
                            })}
                            disabled={generateDocumentMutation.isPending}
                          >
                            Certificate
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="claims" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Associated Claims</Label>
                        <div className="space-y-2 mt-2">
                          {selectedPolicy.claims.length === 0 ? (
                            <p className="text-sm text-gray-500">No claims filed</p>
                          ) : (
                            selectedPolicy.claims.map((claim) => (
                              <div key={claim.id} className="p-2 border rounded">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{claim.claimNumber}</p>
                                    <p className="text-xs text-gray-500">
                                      {format(new Date(claim.dateOfLoss), 'MMM dd, yyyy')} • {claim.status}
                                    </p>
                                  </div>
                                  <p className="text-sm font-semibold">
                                    ${claim.amount.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a policy to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}