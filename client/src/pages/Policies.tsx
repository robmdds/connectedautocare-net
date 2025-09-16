import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Search, Plus, Shield, Calendar, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

// API fetch functions
const fetchPolicies = async () => {
  const response = await fetch('/api/policies');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const createPolicy = async (policyData: any) => {
  const response = await fetch('/api/policies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(policyData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

const updatePolicy = async ({ id, ...data }: { id: string; [key: string]: any }) => {
  const response = await fetch(`/api/policies/${id}`, {
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

// Form schema for policies
const policyFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  productType: z.enum(["auto_vsc", "rv_vsc", "marine_vsc", "powersports_vsc", "home_warranty"]),
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleYear: z.string().min(4, "Vehicle year is required"),
  vehicleVin: z.string().min(17, "Valid VIN is required").max(17, "Valid VIN is required"),
  coverageLevel: z.enum(["basic", "standard", "premium", "platinum", "gold", "silver"]),
  termLength: z.enum(["12", "24", "36", "48", "60"]),
  premium: z.string().min(1, "Premium amount is required"),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
});

type PolicyFormData = z.infer<typeof policyFormSchema>;

interface Policy {
  id: string;
  policyNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productType: string;
  productName?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleVin?: string;
  coverageLevel?: string;
  termLength?: string;
  premium: string;
  effectiveDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Policies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPolicyModal, setShowNewPolicyModal] = useState(false);
  const [showViewPolicyModal, setShowViewPolicyModal] = useState(false);
  const [showEditPolicyModal, setShowEditPolicyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fixed useQuery with proper queryFn
  const { data: policies, isLoading, error } = useQuery({
    queryKey: ["policies"],
    queryFn: fetchPolicies,
    retry: 3,
    retryDelay: 1000,
  });

  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      productType: "auto_vsc",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleVin: "",
      coverageLevel: "standard",
      termLength: "36",
      premium: "",
      effectiveDate: "",
      expirationDate: "",
    },
  });

  const createPolicyMutation = useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      setShowNewPolicyModal(false);
      form.reset();
      toast({
        title: "Policy Created",
        description: "New policy has been successfully created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create policy",
        variant: "destructive",
      });
    },
  });

  const updatePolicyMutation = useMutation({
    mutationFn: updatePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      setShowEditPolicyModal(false);
      form.reset();
      toast({
        title: "Policy Updated",
        description: "Policy has been successfully updated",
      });
    },
    onError: (error: Error) => {
      console.error('Update policy error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update policy',
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (selectedPolicy && showEditPolicyModal) {
      form.reset({
        customerName: selectedPolicy.customerName || "",
        customerEmail: selectedPolicy.customerEmail || "",
        customerPhone: selectedPolicy.customerPhone || "",
        productType: selectedPolicy.productType as any || "auto_vsc",
        vehicleMake: selectedPolicy.vehicleMake || "",
        vehicleModel: selectedPolicy.vehicleModel || "",
        vehicleYear: selectedPolicy.vehicleYear || "",
        vehicleVin: selectedPolicy.vehicleVin || "",
        coverageLevel: selectedPolicy.coverageLevel as any || "standard",
        termLength: selectedPolicy.termLength as any || "36",
        premium: selectedPolicy.premium || "",
        effectiveDate: selectedPolicy.effectiveDate || "",
        expirationDate: selectedPolicy.expiryDate || "",
      });
    }
  }, [selectedPolicy, showEditPolicyModal, form]);

  const onSubmit = (data: PolicyFormData) => {
    createPolicyMutation.mutate(data);
  };

  const onUpdateSubmit = (data: PolicyFormData) => {
    if (selectedPolicy) {
      updatePolicyMutation.mutate({ id: selectedPolicy.id, ...data });
    }
  };

  const filteredPolicies = Array.isArray(policies)
    ? policies.filter(
        (policy: Policy) =>
          policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "default";
      case "expired":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const getProductDisplayName = (productType: string) => {
    const productNames: { [key: string]: string } = {
      'auto_vsc': 'Auto VSC',
      'rv_vsc': 'RV VSC',
      'marine_vsc': 'Marine VSC',
      'powersports_vsc': 'Powersports VSC',
      'home_warranty': 'Home Warranty'
    };
    
    return productNames[productType] || productType;
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
                <h1 className="text-2xl font-bold text-gray-900">Policy Management</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Policies</h2>
                <p className="text-gray-600 mb-4">
                  {error instanceof Error ? error.message : 'Failed to load policies'}
                </p>
                <Button onClick={() => window.location.reload()} className="mr-2">
                  Retry
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewPolicyModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Shield className="h-8 w-8 text-blue-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Policy Management</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">Loading policies...</div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Shield className="h-8 w-8 text-blue-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Policy Management</h1>
            </div>
            <Button onClick={() => setShowNewPolicyModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Link href="/dashboard" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <Link
              href="/policies"
              className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium"
            >
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
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search policies by number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Policies Count Summary */}
        {Array.isArray(policies) && policies.length > 0 && (
          <div className="mb-6">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {filteredPolicies.length} of {policies.length} policies
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600">
                      Active: {policies.filter((p: Policy) => p.status === 'active').length}
                    </span>
                    <span className="text-orange-600">
                      Pending: {policies.filter((p: Policy) => p.status === 'pending').length}
                    </span>
                    <span className="text-red-600">
                      Expired: {policies.filter((p: Policy) => p.status === 'expired').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          {filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy: Policy) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{policy.policyNumber}</CardTitle>
                    <Badge variant={getStatusColor(policy.status)}>{policy.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customer</p>
                      <p className="text-sm text-gray-900">{policy.customerName || "N/A"}</p>
                      <p className="text-xs text-gray-500">{policy.customerEmail || ""}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Product</p>
                      <p className="text-sm text-gray-900">
                        {policy.productName || getProductDisplayName(policy.productType) || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Vehicle</p>
                      <p className="text-sm text-gray-900">
                        {policy.vehicleYear && policy.vehicleMake && policy.vehicleModel 
                          ? `${policy.vehicleYear} ${policy.vehicleMake} ${policy.vehicleModel}`
                          : "N/A"
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Premium</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        ${policy.premium}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Effective: {policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : "N/A"} - 
                      Expires: {policy.expiryDate ? new Date(policy.expiryDate).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setShowViewPolicyModal(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setShowEditPolicyModal(true);
                        }}
                      >
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
                    {searchTerm ? "No policies found" : "No policies yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm
                      ? "Try adjusting your search criteria"
                      : "Start by creating your first policy or generating policies from quotes"}
                  </p>
                  <Button onClick={() => setShowNewPolicyModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* View Policy Modal */}
      <Dialog open={showViewPolicyModal} onOpenChange={setShowViewPolicyModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Policy Details</DialogTitle>
            <DialogDescription>View Policy Modal</DialogDescription>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Policy Number</p>
                  <p className="font-medium">{selectedPolicy.policyNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge variant={getStatusColor(selectedPolicy.status)}>{selectedPolicy.status}</Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p>{selectedPolicy.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{selectedPolicy.customerEmail}</p>
                  </div>
                  {selectedPolicy.customerPhone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p>{selectedPolicy.customerPhone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Coverage Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Product</p>
                    <p>{getProductDisplayName(selectedPolicy.productType)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Premium</p>
                    <p className="font-semibold">${selectedPolicy.premium}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Coverage Level</p>
                    <p>{selectedPolicy.coverageLevel || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Term Length</p>
                    <p>{selectedPolicy.termLength ? `${selectedPolicy.termLength} months` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Effective Date</p>
                    <p>{selectedPolicy.effectiveDate ? new Date(selectedPolicy.effectiveDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                    <p>{selectedPolicy.expiryDate ? new Date(selectedPolicy.expiryDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {(selectedPolicy.vehicleMake || selectedPolicy.vehicleModel || selectedPolicy.vehicleYear || selectedPolicy.vehicleVin) && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Vehicle Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPolicy.vehicleYear && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Year</p>
                        <p>{selectedPolicy.vehicleYear}</p>
                      </div>
                    )}
                    {selectedPolicy.vehicleMake && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Make</p>
                        <p>{selectedPolicy.vehicleMake}</p>
                      </div>
                    )}
                    {selectedPolicy.vehicleModel && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Model</p>
                        <p>{selectedPolicy.vehicleModel}</p>
                      </div>
                    )}
                    {selectedPolicy.vehicleVin && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">VIN</p>
                        <p className="font-mono text-sm">{selectedPolicy.vehicleVin}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowViewPolicyModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Policy Modal */}
      <Dialog open={showEditPolicyModal} onOpenChange={setShowEditPolicyModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Policy {selectedPolicy?.policyNumber}</DialogTitle>
            <DialogDescription>Edit Policy Modal</DialogDescription>
          </DialogHeader>
          {selectedPolicy && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onUpdateSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter customer name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="customer@example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="(555) 123-4567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="productType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="auto_vsc">Auto VSC</SelectItem>
                              <SelectItem value="rv_vsc">RV VSC</SelectItem>
                              <SelectItem value="marine_vsc">Marine VSC</SelectItem>
                              <SelectItem value="powersports_vsc">Powersports VSC</SelectItem>
                              <SelectItem value="home_warranty">Home Warranty</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Vehicle Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehicleYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="2020" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehicleMake"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Toyota" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehicleModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Camry" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehicleVin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIN *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="17-character VIN" maxLength={17} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Coverage Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="coverageLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coverage Level *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select coverage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="platinum">Platinum</SelectItem>
                              <SelectItem value="gold">Gold</SelectItem>
                              <SelectItem value="silver">Silver</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="termLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Term (Months) *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select term" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="12">12 Months</SelectItem>
                              <SelectItem value="24">24 Months</SelectItem>
                              <SelectItem value="36">36 Months</SelectItem>
                              <SelectItem value="48">48 Months</SelectItem>
                              <SelectItem value="60">60 Months</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="premium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Premium Amount *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1500.00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="effectiveDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Effective Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expirationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditPolicyModal(false)}
                    disabled={updatePolicyMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updatePolicyMutation.isPending}>
                    {updatePolicyMutation.isPending ? "Updating..." : "Update Policy"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Policy Modal */}
      <Dialog open={showNewPolicyModal} onOpenChange={setShowNewPolicyModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Policy</DialogTitle>
            <DialogDescription>Create Policy Modal</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter customer name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="customer@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(555) 123-4567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="auto_vsc">Auto VSC</SelectItem>
                            <SelectItem value="rv_vsc">RV VSC</SelectItem>
                            <SelectItem value="marine_vsc">Marine VSC</SelectItem>
                            <SelectItem value="powersports_vsc">Powersports VSC</SelectItem>
                            <SelectItem value="home_warranty">Home Warranty</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="2020" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleMake"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Toyota" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Camry" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleVin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIN *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="17-character VIN" maxLength={17} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Coverage Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="coverageLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coverage Level *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select coverage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="termLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Term (Months) *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select term" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="12">12 Months</SelectItem>
                              <SelectItem value="24">24 Months</SelectItem>
                              <SelectItem value="36">36 Months</SelectItem>
                              <SelectItem value="48">48 Months</SelectItem>
                              <SelectItem value="60">60 Months</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="premium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Premium Amount *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1500.00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="effectiveDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Effective Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expirationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewPolicyModal(false)}
                    disabled={createPolicyMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPolicyMutation.isPending}>
                    {createPolicyMutation.isPending ? "Creating..." : "Create Policy"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    );
}