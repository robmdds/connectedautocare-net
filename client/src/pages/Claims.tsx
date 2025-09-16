import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Search, Plus, Shield, Upload, X, FileText, Image, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

// API fetch functions
const fetchClaims = async () => {
  const response = await fetch('/api/claims');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const createClaim = async (claimData: any) => {
  const response = await fetch('/api/claims', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(claimData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

const updateClaim = async ({ id, ...data }: { id: string; [key: string]: any }) => {
  const response = await fetch(`/api/claims/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Form schema for new claims
const claimFormSchema = z.object({
  policyNumber: z.string().min(1, "Policy/Contract number is required"),
  claimantName: z.string().min(1, "Claimant name is required"),
  claimantEmail: z.string().email("Valid email is required"),
  claimantPhone: z.string().optional(),
  type: z.enum(["mechanical_breakdown", "deductible_reimbursement", "tire_wheel", "key_replacement", "theft", "ding_dent"]),
  dateOfLoss: z.string().min(1, "Date of loss is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  estimatedAmount: z.string().optional(),
});

// Form schema for updating claims
const updateClaimFormSchema = z.object({
  status: z.enum(["submitted", "under_review", "approved", "denied", "settled", "closed"]),
  actualAmount: z.string().optional(),
  adjusterNotes: z.string().optional(),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;
type UpdateClaimFormData = z.infer<typeof updateClaimFormSchema>;

interface Claim {
  id: string;
  claimNumber: string;
  policyId?: string;
  policyNumber?: string;
  status: string;
  type?: string;
  claimantName?: string;
  claimantEmail?: string;
  claimantPhone?: string;
  description?: string;
  claimAmount?: string;
  estimatedAmount?: string;
  actualAmount?: string;
  incidentDate?: string;
  dateOfLoss?: string;
  incidentLocation?: string;
  submittedAt?: string;
  adjusterName?: string;
  adjusterNotes?: string;
  riskScore?: number;
  fraudIndicators?: string[];
  documents?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function Claims() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [showViewClaimModal, setShowViewClaimModal] = useState(false);
  const [showProcessClaimModal, setShowProcessClaimModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fixed useQuery with proper queryFn
  const { data: claims, isLoading, error } = useQuery({
    queryKey: ["claims"],
    queryFn: fetchClaims,
    retry: 3,
    retryDelay: 1000,
  });

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      policyNumber: "",
      claimantName: "",
      claimantEmail: "",
      claimantPhone: "",
      type: "mechanical_breakdown",
      dateOfLoss: "",
      description: "",
      estimatedAmount: "",
    },
  });

  const updateForm = useForm<UpdateClaimFormData>({
    resolver: zodResolver(updateClaimFormSchema),
    defaultValues: {
      status: "submitted",
      actualAmount: "",
      adjusterNotes: "",
    },
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const createClaimMutation = useMutation({
    mutationFn: async (claimData: ClaimFormData) => {
      const apiData = {
        ...claimData,
        dateOfLoss: new Date(claimData.dateOfLoss),
        estimatedAmount: claimData.estimatedAmount ? parseFloat(claimData.estimatedAmount) : undefined,
        documents: uploadedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
      };
      return createClaim(apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      setShowNewClaimModal(false);
      form.reset();
      setUploadedFiles([]);
      toast({
        title: "Claim Created",
        description: "New claim has been successfully filed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create claim",
        variant: "destructive",
      });
    },
  });

  const updateClaimMutation = useMutation({
    mutationFn: updateClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      setShowProcessClaimModal(false);
      updateForm.reset();
      toast({
        title: "Claim Updated",
        description: "Claim has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update claim",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (selectedClaim && showProcessClaimModal) {
      updateForm.reset({
        status: selectedClaim.status as any || "submitted",
        actualAmount: selectedClaim.actualAmount ? selectedClaim.actualAmount.toString() : "",
        adjusterNotes: selectedClaim.adjusterNotes || "",
      });
    }
  }, [selectedClaim, showProcessClaimModal, updateForm]);

  const onSubmit = (data: ClaimFormData) => {
    createClaimMutation.mutate(data);
  };

  const onUpdateSubmit = (data: UpdateClaimFormData) => {
    if (selectedClaim) {
      updateClaimMutation.mutate({ id: selectedClaim.id, ...data });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith("image/") || file.type === "application/pdf" || file.type.startsWith("text/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);

    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were skipped",
        description: "Only images, PDFs, and text files under 10MB are allowed",
        variant: "destructive",
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const filteredClaims = Array.isArray(claims)
    ? claims.filter(
        (claim: Claim) =>
          claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.claimantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
      case "open":
        return "default";
      case "under_review":
      case "review":
        return "secondary";
      case "awaiting_docs":
      case "estimate":
      case "decision":
        return "secondary";
      case "approved":
        return "default";
      case "denied":
        return "destructive";
      case "settled":
      case "payout":
        return "default";
      case "closed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getClaimTypeDisplayName = (type: string) => {
    const typeNames: { [key: string]: string } = {
      'mechanical_breakdown': 'Mechanical Breakdown',
      'deductible_reimbursement': 'Deductible Reimbursement',
      'tire_wheel': 'Tire & Wheel',
      'key_replacement': 'Key Replacement',
      'theft': 'Theft',
      'ding_dent': 'Ding & Dent'
    };
    
    return typeNames[type] || type?.replace('_', ' ') || 'Unknown';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Shield className="h-8 w-8 text-blue-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Claims Management</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Claims</h2>
                <p className="text-gray-600 mb-4">
                  {error instanceof Error ? error.message : 'Failed to load claims'}
                </p>
                <Button onClick={() => window.location.reload()} className="mr-2">
                  Retry
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewClaimModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  File New Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
            <Button onClick={() => setShowNewClaimModal(true)}>
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
            <Link href="/dashboard" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
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
              placeholder="Search claims by number, description, claimant, or policy number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Claims Summary */}
        {Array.isArray(claims) && claims.length > 0 && (
          <div className="mb-6">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {filteredClaims.length} of {claims.length} claims
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600">
                      Open: {claims.filter((c: Claim) => ['submitted', 'under_review', 'open'].includes(c.status)).length}
                    </span>
                    <span className="text-green-600">
                      Approved: {claims.filter((c: Claim) => c.status === 'approved').length}
                    </span>
                    <span className="text-orange-600">
                      Settled: {claims.filter((c: Claim) => c.status === 'settled').length}
                    </span>
                    <span className="text-red-600">
                      Denied: {claims.filter((c: Claim) => c.status === 'denied').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Claims List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">Loading claims...</div>
              </CardContent>
            </Card>
          ) : filteredClaims.length > 0 ? (
            filteredClaims.map((claim: Claim) => (
              <Card key={claim.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{claim.claimNumber}</CardTitle>
                    <Badge variant={getStatusColor(claim.status)}>
                      {claim.status?.replace('_', ' ') || 'Unknown'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Claimant</p>
                      <p className="text-sm text-gray-900">{claim.claimantName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{claim.claimantEmail || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="text-sm text-gray-900">{getClaimTypeDisplayName(claim.type || '')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Incident Date</p>
                      <p className="text-sm text-gray-900">
                        {claim.incidentDate 
                          ? new Date(claim.incidentDate).toLocaleDateString() 
                          : claim.dateOfLoss 
                            ? new Date(claim.dateOfLoss).toLocaleDateString() 
                            : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Amount</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {claim.actualAmount 
                          ? `$${parseFloat(claim.actualAmount).toLocaleString()}`
                          : claim.claimAmount
                            ? `$${parseFloat(claim.claimAmount).toLocaleString()}`
                            : claim.estimatedAmount 
                              ? `~$${parseFloat(claim.estimatedAmount).toLocaleString()}`
                              : 'Not assessed'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-sm text-gray-900 mt-1 line-clamp-2">
                      {claim.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Policy: {claim.policyNumber || 'N/A'} • 
                      Submitted: {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : new Date(claim.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClaim(claim);
                          setShowViewClaimModal(true);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClaim(claim);
                          setShowProcessClaimModal(true);
                        }}
                      >
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
                      : 'Claims will appear here when customers file them'}
                  </p>
                  <Button onClick={() => setShowNewClaimModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    File New Claim
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* View Claim Modal */}
      <Dialog open={showViewClaimModal} onOpenChange={setShowViewClaimModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Claim Details - {selectedClaim?.claimNumber}</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Claim Number</p>
                  <p className="font-medium">{selectedClaim.claimNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge variant={getStatusColor(selectedClaim.status)}>
                    {selectedClaim.status?.replace('_', ' ') || 'Unknown'}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Claim Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Policy Number</p>
                    <p>{selectedClaim.policyNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p>{getClaimTypeDisplayName(selectedClaim.type || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Loss</p>
                    <p>
                      {selectedClaim.incidentDate 
                        ? new Date(selectedClaim.incidentDate).toLocaleDateString()
                        : selectedClaim.dateOfLoss 
                          ? new Date(selectedClaim.dateOfLoss).toLocaleDateString() 
                          : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p>{selectedClaim.incidentLocation || 'Not specified'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="mt-1">{selectedClaim.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Claimant Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p>{selectedClaim.claimantName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{selectedClaim.claimantEmail || 'N/A'}</p>
                  </div>
                  {selectedClaim.claimantPhone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p>{selectedClaim.claimantPhone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Financial Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estimated Amount</p>
                    <p className="font-semibold">
                      {selectedClaim.estimatedAmount 
                        ? `$${parseFloat(selectedClaim.estimatedAmount).toLocaleString()}`
                        : selectedClaim.claimAmount
                          ? `$${parseFloat(selectedClaim.claimAmount).toLocaleString()}`
                          : 'Not assessed'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Actual Amount</p>
                    <p className="font-semibold">
                      {selectedClaim.actualAmount 
                        ? `$${parseFloat(selectedClaim.actualAmount).toLocaleString()}`
                        : 'Not set'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Adjuster</p>
                    <p>{selectedClaim.adjusterName || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Risk Score</p>
                    <p>{selectedClaim.riskScore || 'N/A'}</p>
                  </div>
                  {selectedClaim.adjusterNotes && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Adjuster Notes</p>
                      <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedClaim.adjusterNotes}</p>
                    </div>
                  )}
                  {selectedClaim.fraudIndicators && selectedClaim.fraudIndicators.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Fraud Indicators</p>
                      <p className="text-red-600">{selectedClaim.fraudIndicators.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedClaim.documents && selectedClaim.documents.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Documents</h3>
                  <div className="space-y-2">
                    {selectedClaim.documents.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {doc.type?.startsWith('image/') ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name || `Document ${index + 1}`}</p>
                          <p className="text-xs text-gray-500">
                            {doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowViewClaimModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Claim Modal */}
      <Dialog open={showProcessClaimModal} onOpenChange={setShowProcessClaimModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Claim - {selectedClaim?.claimNumber}</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Update Claim Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={updateForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="denied">Denied</SelectItem>
                              <SelectItem value="settled">Settled</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateForm.control}
                      name="actualAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Actual Amount</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" placeholder="0.00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateForm.control}
                      name="adjusterNotes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Adjuster Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter notes or comments" className="min-h-[100px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowProcessClaimModal(false)}
                    disabled={updateClaimMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateClaimMutation.isPending}>
                    {updateClaimMutation.isPending ? "Updating..." : "Update Claim"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* New Claim Modal */}
      <Dialog open={showNewClaimModal} onOpenChange={setShowNewClaimModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>File New Claim</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="policyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy/Contract Number *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter policy or contract number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="claimantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claimant Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter claimant's full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="claimantEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter email address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="claimantPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(555) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claim Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select claim type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mechanical_breakdown">Mechanical Breakdown</SelectItem>
                          <SelectItem value="deductible_reimbursement">Deductible Reimbursement</SelectItem>
                          <SelectItem value="tire_wheel">Tire & Wheel</SelectItem>
                          <SelectItem value="key_replacement">Key Replacement</SelectItem>
                          <SelectItem value="theft">Theft</SelectItem>
                          <SelectItem value="ding_dent">Ding & Dent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfLoss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Loss *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimatedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Amount</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide a detailed description of the incident"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <div>
                  <FormLabel>Documents & Photos</FormLabel>
                  <p className="text-sm text-gray-500">Upload relevant documents, photos, or receipts (max 10MB each)</p>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Drop files here or click to upload
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          PNG, JPG, PDF up to 10MB each
                        </span>
                      </label>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept="image/*,.pdf,.txt"
                        className="sr-only"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <FormLabel>Uploaded Files ({uploadedFiles.length})</FormLabel>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewClaimModal(false)}
                  disabled={createClaimMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createClaimMutation.isPending}
                >
                  {createClaimMutation.isPending ? "Creating..." : "Create Claim"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}