import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Search, Plus, Shield, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  coverageLevel: z.enum(["basic", "standard", "premium", "platinum"]),
  termLength: z.enum(["12", "24", "36", "48", "60"]),
  premium: z.string().min(1, "Premium amount is required"),
});

export default function Policies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPolicyModal, setShowNewPolicyModal] = useState(false);
  const [showViewPolicyModal, setShowViewPolicyModal] = useState(false);
  const [showEditPolicyModal, setShowEditPolicyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: policies, isLoading, error } = useQuery({
    queryKey: ["/api/policies"],
    retry: false,
  });

  const form = useForm({
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
    },
  });

  const createPolicyMutation = useMutation({
    mutationFn: async (policyData) => {
      return apiRequest("/api/policies", "POST", policyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      setShowNewPolicyModal(false);
      form.reset();
      toast({
        title: "Policy Created",
        description: "New policy has been successfully created",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create policy",
        variant: "destructive",
      });
    },
  });

  const updatePolicyMutation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      return apiRequest(`/api/policies/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      setShowEditPolicyModal(false);
      form.reset();
      toast({
        title: "Policy Updated",
        description: "Policy has been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update policy",
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
        productType: selectedPolicy.productType || "auto_vsc",
        vehicleMake: selectedPolicy.vehicleMake || "",
        vehicleModel: selectedPolicy.vehicleModel || "",
        vehicleYear: selectedPolicy.vehicleYear || "",
        vehicleVin: selectedPolicy.vehicleVin || "",
        coverageLevel: selectedPolicy.coverageLevel || "standard",
        termLength: selectedPolicy.termLength || "36",
        premium: selectedPolicy.premium || "",
      });
    }
  }, [selectedPolicy, showEditPolicyModal, form]);

  const onSubmit = (data) => {
    createPolicyMutation.mutate(data);
  };

  const filteredPolicies = Array.isArray(policies)
    ? policies.filter(
        (policy) =>
          policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "default";
      case "expired":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
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
                <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Required</h2>
                <p className="text-gray-600 mb-4">Please sign in to view policy data</p>
                <a href="/api/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Sign In
                </a>
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
              placeholder="Search policies by number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{policy.policyNumber}</CardTitle>
                    <Badge variant={getStatusColor(policy.status)}>{policy.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customer</p>
                      <p className="text-sm text-gray-900">{policy.customerName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Product</p>
                      <p className="text-sm text-gray-900">{policy.productName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Premium</p>
                      <p className="text-sm text-gray-900">{policy.premium}</p>
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
                      : "Start by creating your first quote to generate policies"}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Policy Details</DialogTitle>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Policy Number</p>
                <p>{selectedPolicy.policyNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Customer</p>
                <p>{selectedPolicy.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Product</p>
                <p>{selectedPolicy.productName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Premium</p>
                <p>{selectedPolicy.premium}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Effective Date</p>
                <p>{new Date(selectedPolicy.effectiveDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                <p>{new Date(selectedPolicy.expiryDate).toLocaleDateString()}</p>
              </div>
              <div className="flex justify-end">
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
          </DialogHeader>
          {selectedPolicy && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  updatePolicyMutation.mutate({ id: selectedPolicy.id, ...data })
                )}
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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