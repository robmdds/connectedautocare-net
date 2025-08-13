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
  Upload, 
  Eye, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  Calendar,
  Camera,
  Phone,
  Mail,
  MapPin,
  User,
  Car,
  Home,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bot,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Claim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dateOfLoss: string;
  reportedDate: string;
  claimType: "auto" | "home" | "rv" | "marine" | "powersports";
  status: "submitted" | "under_review" | "investigating" | "approved" | "denied" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  estimatedAmount: number;
  approvedAmount?: number;
  description: string;
  adjusterName?: string;
  adjusterEmail?: string;
  lastUpdate: string;
  documents: string[];
  aiAnalysis?: {
    riskScore: number;
    fraudIndicators: string[];
    recommendations: string[];
    estimatedProcessingTime: number;
  };
  timeline: {
    date: string;
    action: string;
    user: string;
    notes?: string;
  }[];
}

const statusColors = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800", 
  investigating: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
  closed: "bg-gray-100 text-gray-800"
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

export default function AdvancedClaims() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch claims with filters
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ["/api/claims/advanced", filterStatus, filterType, searchTerm],
  });

  // Fetch claim statistics
  const { data: claimStats } = useQuery({
    queryKey: ["/api/claims/statistics"],
  });

  // AI Analysis mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async (claimId: string) => {
      return await apiRequest("POST", `/api/claims/${claimId}/ai-analysis`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims/advanced"] });
      toast({
        title: "AI Analysis Complete",
        description: "Fraud detection and risk assessment completed",
      });
    },
  });

  // Update claim status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ claimId, status, notes }: { claimId: string; status: string; notes?: string }) => {
      return await apiRequest("PUT", `/api/claims/${claimId}/status`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims/advanced"] });
      toast({
        title: "Status Updated",
        description: "Claim status has been successfully updated",
      });
    },
  });

  // Assign adjuster
  const assignAdjusterMutation = useMutation({
    mutationFn: async ({ claimId, adjusterData }: { claimId: string; adjusterData: any }) => {
      return await apiRequest("PUT", `/api/claims/${claimId}/adjuster`, adjusterData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims/advanced"] });
      toast({
        title: "Adjuster Assigned",
        description: "Claim has been assigned to adjuster successfully",
      });
    },
  });

  const filteredClaims = claims.filter((claim: Claim) => {
    const matchesStatus = filterStatus === "all" || claim.status === filterStatus;
    const matchesType = filterType === "all" || claim.claimType === filterType;
    const matchesSearch = searchTerm === "" || 
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Claims Management</h1>
            <p className="text-gray-600 mt-2">AI-powered claims processing and fraud detection</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" data-testid="button-export-claims">
              <Download className="h-4 w-4 mr-2" />
              Export Claims
            </Button>
            <Button data-testid="button-new-claim">
              <FileText className="h-4 w-4 mr-2" />
              New Claim
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-claims">
                {claimStats?.totalClaims || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{claimStats?.newThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-processing">
                {claimStats?.avgProcessingDays || 0} days
              </div>
              <p className="text-xs text-muted-foreground">
                -2 days from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-payouts">
                ${(claimStats?.totalPayouts || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fraud Detection</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-fraud-rate">
                {claimStats?.fraudRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                AI-powered detection
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
                  placeholder="Search by claim number, customer name, or policy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-claims"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="rv">RV</SelectItem>
                <SelectItem value="marine">Marine</SelectItem>
                <SelectItem value="powersports">Powersports</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" data-testid="button-refresh-claims">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Claims List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Claims ({filteredClaims.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading claims...</p>
                  </div>
                ) : filteredClaims.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No claims found matching your criteria
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredClaims.map((claim: Claim) => (
                      <div
                        key={claim.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedClaim(claim)}
                        data-testid={`claim-item-${claim.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-sm">
                                {claim.claimNumber}
                              </span>
                              <Badge className={statusColors[claim.status]}>
                                {claim.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={priorityColors[claim.priority]}>
                                {claim.priority}
                              </Badge>
                              {claim.aiAnalysis && claim.aiAnalysis.riskScore > 70 && (
                                <Badge className="bg-red-100 text-red-800">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  High Risk
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-900 font-medium">
                              {claim.customerName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Policy: {claim.policyNumber} • {claim.claimType.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Loss Date: {format(new Date(claim.dateOfLoss), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ${claim.estimatedAmount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(claim.lastUpdate), 'MMM dd')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Claim Details */}
          <div className="lg:col-span-1">
            {selectedClaim ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Claim Details</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => aiAnalysisMutation.mutate(selectedClaim.id)}
                      disabled={aiAnalysisMutation.isPending}
                      data-testid="button-ai-analysis"
                    >
                      {aiAnalysisMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Bot className="h-4 w-4 mr-2" />
                      )}
                      AI Analysis
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Claim Number</Label>
                        <p className="text-sm text-gray-600" data-testid="text-claim-number">
                          {selectedClaim.claimNumber}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Customer</Label>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <User className="h-3 w-3 inline mr-1" />
                            {selectedClaim.customerName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <Mail className="h-3 w-3 inline mr-1" />
                            {selectedClaim.customerEmail}
                          </p>
                          <p className="text-sm text-gray-600">
                            <Phone className="h-3 w-3 inline mr-1" />
                            {selectedClaim.customerPhone}
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-sm text-gray-600">
                          {selectedClaim.description}
                        </p>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <Label className="text-sm font-medium">Estimated</Label>
                          <p className="text-lg font-semibold text-green-600">
                            ${selectedClaim.estimatedAmount.toLocaleString()}
                          </p>
                        </div>
                        {selectedClaim.approvedAmount && (
                          <div className="flex-1">
                            <Label className="text-sm font-medium">Approved</Label>
                            <p className="text-lg font-semibold text-blue-600">
                              ${selectedClaim.approvedAmount.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Update Status</Label>
                        <Select
                          value={selectedClaim.status}
                          onValueChange={(status) => 
                            updateStatusMutation.mutate({ 
                              claimId: selectedClaim.id, 
                              status 
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="denied">Denied</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-4">
                      {selectedClaim.aiAnalysis ? (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Risk Score</Label>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    selectedClaim.aiAnalysis.riskScore > 70 ? 'bg-red-500' :
                                    selectedClaim.aiAnalysis.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${selectedClaim.aiAnalysis.riskScore}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {selectedClaim.aiAnalysis.riskScore}%
                              </span>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Fraud Indicators</Label>
                            <div className="space-y-1">
                              {selectedClaim.aiAnalysis.fraudIndicators.map((indicator, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                  <span className="text-sm text-red-600">{indicator}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Recommendations</Label>
                            <div className="space-y-1">
                              {selectedClaim.aiAnalysis.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <CheckCircle2 className="h-3 w-3 text-blue-500" />
                                  <span className="text-sm text-blue-600">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Est. Processing Time</Label>
                            <p className="text-sm text-gray-600">
                              {selectedClaim.aiAnalysis.estimatedProcessingTime} business days
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No AI analysis available</p>
                          <Button
                            className="mt-4"
                            onClick={() => aiAnalysisMutation.mutate(selectedClaim.id)}
                            disabled={aiAnalysisMutation.isPending}
                          >
                            Run AI Analysis
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="timeline" className="space-y-4">
                      <div className="space-y-4">
                        {selectedClaim.timeline.map((event, index) => (
                          <div key={index} className="flex space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{event.action}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(event.date), 'MMM dd, yyyy HH:mm')} by {event.user}
                              </p>
                              {event.notes && (
                                <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a claim to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}