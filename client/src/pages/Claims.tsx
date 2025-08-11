import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Search, Plus, Shield } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form schema for new claims
const claimFormSchema = z.object({
  policyId: z.string().optional(),
  claimantName: z.string().min(1, "Claimant name is required"),
  claimantEmail: z.string().email("Valid email is required"),
  claimantPhone: z.string().optional(),
  type: z.enum(["mechanical_breakdown", "deductible_reimbursement", "tire_wheel", "key_replacement", "theft", "ding_dent"]),
  dateOfLoss: z.string().min(1, "Date of loss is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  estimatedAmount: z.string().optional(),
});

export default function Claims() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: claims, isLoading } = useQuery({
    queryKey: ["/api/claims"],
    retry: false,
  });

  const form = useForm<z.infer<typeof claimFormSchema>>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      claimantName: "",
      claimantEmail: "",
      claimantPhone: "",
      type: "mechanical_breakdown",
      dateOfLoss: "",
      description: "",
      estimatedAmount: "",
    },
  });

  const createClaimMutation = useMutation({
    mutationFn: async (claimData: z.infer<typeof claimFormSchema>) => {
      // Convert form data to API format
      const apiData = {
        ...claimData,
        dateOfLoss: new Date(claimData.dateOfLoss),
        estimatedAmount: claimData.estimatedAmount ? parseFloat(claimData.estimatedAmount) : undefined,
      };
      return apiRequest("/api/claims", "POST", apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      setShowNewClaimModal(false);
      form.reset();
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

  const onSubmit = (data: z.infer<typeof claimFormSchema>) => {
    createClaimMutation.mutate(data);
  };

  const filteredClaims = Array.isArray(claims) ? claims.filter((claim: any) =>
    claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'review': return 'secondary';
      case 'awaiting_docs': return 'secondary';
      case 'estimate': return 'secondary';
      case 'decision': return 'secondary';
      case 'approved': return 'default';
      case 'denied': return 'destructive';
      case 'payout': return 'default';
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
                  name="claimantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claimant Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter claimant's full name" />
                      </FormControl>
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
                  </FormItem>
                )}
              />
              
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