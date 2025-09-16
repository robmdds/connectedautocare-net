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
import { AlertTriangle, Search, Plus, Shield, Upload, X, FileText, Image } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  status: z.enum(["open", "review", "awaiting_docs", "estimate", "decision", "approved", "denied", "payout", "closed"]),
  actualAmount: z.string().optional(),
  adjusterNotes: z.string().optional(),
});

export default function Claims() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [showViewClaimModal, setShowViewClaimModal] = useState(false);
  const [showProcessClaimModal, setShowProcessClaimModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: claims, isLoading } = useQuery({
    queryKey: ["/api/claims"],
    retry: false,
  });

  const form = useForm<z.infer<typeof claimFormSchema>>({
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

  const updateForm = useForm<z.infer<typeof updateClaimFormSchema>>({
    resolver: zodResolver(updateClaimFormSchema),
    defaultValues: {
      status: "open",
      actualAmount: "",
      adjusterNotes: "",
    },
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const createClaimMutation = useMutation({
    mutationFn: async (claimData: z.infer<typeof claimFormSchema>) => {
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
      return apiRequest("/api/claims", "POST", apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      setShowNewClaimModal(false);
      form.reset();
      setUploadedFiles([]);
      toast({
        title: "Claim Created",
        description: "New claim has been successfully filed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create claim",
        variant: "destructive",
      });
    },
  });

  const updateClaimMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & z.infer<typeof updateClaimFormSchema>) => {
      return apiRequest(`/api/claims/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      setShowProcessClaimModal(false);
      updateForm.reset();
      toast({
        title: "Claim Updated",
        description: "Claim has been successfully updated",
      });
    },
    onError: (error: any) => {
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
        status: selectedClaim.status || "open",
        actualAmount: selectedClaim.actualAmount ? selectedClaim.actualAmount.toString() : "",
        adjusterNotes: selectedClaim.adjusterNotes || "",
      });
    }
  }, [selectedClaim, showProcessClaimModal, updateForm]);

  const onSubmit = (data: z.infer<typeof claimFormSchema>) => {
    createClaimMutation.mutate(data);
  };

  const onUpdateSubmit = (data: z.infer<typeof updateClaimFormSchema>) => {
    updateClaimMutation.mutate({ id: selectedClaim.id, ...data });
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
        (claim: any) =>
          claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "review":
        return "secondary";
      case "awaiting_docs":
        return "secondary";
      case "estimate":
        return "secondary";
      case "decision":
        return "secondary";
      case "approved":
        return "default";
      case "denied":
        return "destructive";
      case "payout":
        return "default";
      case "closed":
        return "outline";
      default:
        return "outline";
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Claim Details - {selectedClaim?.claimNumber}</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Claim Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Claim Number</p>
                    <p className="text-sm text-gray-900">{selectedClaim.claimNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Policy Number</p>
                    <p className="text-sm text-gray-900">{selectedClaim.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-gray-900">{selectedClaim.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-sm text-gray-900">{selectedClaim.type.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Claimant Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Claimant Name</p>
                    <p className="text-sm text-gray-900">{selectedClaim.claimantName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedClaim.claimantEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{selectedClaim.claimantPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Incident Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Loss</p>
                    <p className="text-sm text-gray-900">
                      {selectedClaim.dateOfLoss ? new Date(selectedClaim.dateOfLoss).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">{selectedClaim.incidentLocation || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-sm text-gray-900">{selectedClaim.description}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Financial Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estimated Amount</p>
                    <p className="text-sm text-gray-900">
                      {selectedClaim.estimatedAmount ? `$${selectedClaim.estimatedAmount}` : 'Not assessed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Actual Amount</p>
                    <p className="text-sm text-gray-900">
                      {selectedClaim.actualAmount ? `$${selectedClaim.actualAmount}` : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Adjuster</p>
                    <p className="text-sm text-gray-900">{selectedClaim.adjusterName || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Risk Score</p>
                    <p className="text-sm text-gray-900">{selectedClaim.riskScore || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Fraud Indicators</p>
                    <p className="text-sm text-gray-900">
                      {selectedClaim.fraudIndicators.length > 0 ? selectedClaim.fraudIndicators.join(', ') : 'None'}
                    </p>
                  </div>
                </div>
              </div>
              {selectedClaim.documents?.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium">Documents</h3>
                  <div className="space-y-2 mt-2">
                    {selectedClaim.documents.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {doc.type.startsWith('image/') ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="awaiting_docs">Awaiting Documents</SelectItem>
                              <SelectItem value="estimate">Estimate</SelectItem>
                              <SelectItem value="decision">Decision</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="denied">Denied</SelectItem>
                              <SelectItem value="payout">Payout</SelectItem>
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
        <DialogContent className="max-w-2xl">
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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