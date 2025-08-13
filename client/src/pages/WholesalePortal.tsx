import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Store, 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Settings,
  Download,
  Upload,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Shield,
  Calculator
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PartnerStats {
  totalSales: number;
  monthlyCommission: number;
  activePolicies: number;
  conversionRate: number;
}

interface WholesaleProduct {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  partnerMarkup: number;
  commission: number;
  status: "active" | "inactive";
  description: string;
}

export default function WholesalePortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quoteParams, setQuoteParams] = useState({
    productId: "",
    vin: "",
    zip: "",
    term: "",
    mileage: ""
  });

  // Fetch partner stats
  const { data: partnerStats, isLoading: statsLoading } = useQuery<PartnerStats>({
    queryKey: ["/api/wholesale/stats"],
  });

  // Fetch wholesale products
  const { data: products, isLoading: productsLoading } = useQuery<WholesaleProduct[]>({
    queryKey: ["/api/wholesale/products"],
  });

  // Fetch partner quotes
  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["/api/wholesale/quotes"],
  });

  // Generate quote mutation
  const generateQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/wholesale/quotes", data);
    },
    onSuccess: () => {
      toast({
        title: "Quote Generated",
        description: "Wholesale quote has been generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wholesale/quotes"] });
    },
    onError: () => {
      toast({
        title: "Quote Error",
        description: "Failed to generate quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteParams.productId || !quoteParams.vin) {
      toast({
        title: "Missing Information",
        description: "Please select a product and enter a VIN",
        variant: "destructive",
      });
      return;
    }
    generateQuoteMutation.mutate(quoteParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wholesale Portal</h1>
                <p className="text-gray-600">Partner dashboard and quote management</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button size="sm" asChild>
                <Link href="/wholesale/bulk-pricing">
                  <Calculator className="h-4 w-4 mr-2" />
                  Bulk Pricing
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/wholesale/white-label">
                  <Settings className="h-4 w-4 mr-2" />
                  White-label Config
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${statsLoading ? "..." : partnerStats?.totalSales?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Commission</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${statsLoading ? "..." : partnerStats?.monthlyCommission?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : partnerStats?.activePolicies?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">+15 new this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : `${partnerStats?.conversionRate || 0}%`}
              </div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="quote-generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="quote-generator">Quote Generator</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="quotes">My Quotes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="branding">White-label</TabsTrigger>
          </TabsList>

          {/* Quote Generator Tab */}
          <TabsContent value="quote-generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Generate Wholesale Quote
                </CardTitle>
                <CardDescription>
                  Create instant quotes with your partner markup and commission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateQuote} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product">Product</Label>
                      <Select 
                        value={quoteParams.productId}
                        onValueChange={(value) => setQuoteParams({...quoteParams, productId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {product.category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="vin">VIN Number</Label>
                      <Input
                        id="vin"
                        placeholder="Enter 17-digit VIN"
                        value={quoteParams.vin}
                        onChange={(e) => setQuoteParams({...quoteParams, vin: e.target.value})}
                        maxLength={17}
                      />
                    </div>

                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        placeholder="Customer ZIP"
                        value={quoteParams.zip}
                        onChange={(e) => setQuoteParams({...quoteParams, zip: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="term">Term Length</Label>
                      <Select 
                        value={quoteParams.term}
                        onValueChange={(value) => setQuoteParams({...quoteParams, term: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                          <SelectItem value="48">48 months</SelectItem>
                          <SelectItem value="60">60 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={generateQuoteMutation.isPending}
                  >
                    {generateQuoteMutation.isPending ? "Generating..." : "Generate Quote"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Products</CardTitle>
                <CardDescription>
                  Products available for wholesale with your pricing and commission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productsLoading ? (
                    <div className="text-center py-8">Loading products...</div>
                  ) : (
                    products?.map((product) => (
                      <Card key={product.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-lg">{product.name}</h3>
                                <Badge variant={product.status === "active" ? "default" : "secondary"}>
                                  {product.status}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-3">{product.description}</p>
                              <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Base Price:</span>
                                  <p className="text-gray-600">${product.basePrice}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Your Markup:</span>
                                  <p className="text-green-600">+{product.partnerMarkup}%</p>
                                </div>
                                <div>
                                  <span className="font-medium">Commission:</span>
                                  <p className="text-blue-600">{product.commission}%</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quotes</CardTitle>
                <CardDescription>
                  Your generated quotes and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotesLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading quotes...
                        </TableCell>
                      </TableRow>
                    ) : quotes?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No quotes found. Generate your first quote using the Quote Generator tab.
                        </TableCell>
                      </TableRow>
                    ) : (
                      quotes?.map((quote: any) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">{quote.id.slice(0, 8)}</TableCell>
                          <TableCell>{quote.productName}</TableCell>
                          <TableCell>{quote.customerEmail || "N/A"}</TableCell>
                          <TableCell>${quote.totalPremium?.toLocaleString()}</TableCell>
                          <TableCell>${quote.commission?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={quote.status === "sold" ? "default" : "secondary"}>
                              {quote.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>This Month</span>
                      <span className="font-semibold">$24,580</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Last Month</span>
                      <span className="font-semibold">$21,340</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Growth</span>
                      <span className="font-semibold text-green-600">+15.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Auto Advantage</span>
                      <span className="font-semibold">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Home Protection</span>
                      <span className="font-semibold">32%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>All-Vehicle</span>
                      <span className="font-semibold">23%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* White-label Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  White-label Configuration
                </CardTitle>
                <CardDescription>
                  Set up custom branding, subdomains, and embeddable widgets for your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quick Setup</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">🎨 Custom Branding</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Upload your logo, set brand colors, and customize page content
                        </p>
                        <Button size="sm" asChild variant="outline">
                          <Link href="/wholesale/white-label">Configure Branding</Link>
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">🌐 Domain Setup</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Get a custom subdomain like: <code>yourcompany.tpaplatform.com</code>
                        </p>
                        <Button size="sm" asChild variant="outline">
                          <Link href="/wholesale/white-label">Setup Domain</Link>
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">⚡ Quote Widget</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Embed branded quote forms directly into your website
                        </p>
                        <Button size="sm" asChild variant="outline">
                          <Link href="/wholesale/white-label">Get Widget Code</Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Preview</h3>
                    <div className="p-4 border rounded-lg bg-muted">
                      <h4 className="font-medium mb-2">Your Branded Portal</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Domain:</strong> premiuminsurance.tpaplatform.com</p>
                        <p><strong>Company:</strong> Premium Insurance Partners</p>
                        <p><strong>Status:</strong> <Badge variant="default">Active</Badge></p>
                        <p><strong>Products:</strong> 3 enabled</p>
                      </div>
                      <div className="mt-3">
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/branded/reseller-001" target="_blank">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Portal
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-muted">
                      <h4 className="font-medium mb-2">Integration Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Widget Installations:</span>
                          <span className="font-medium">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Branded Page Views:</span>
                          <span className="font-medium">1,247</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Widget Quotes:</span>
                          <span className="font-medium">89</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion Rate:</span>
                          <span className="font-medium text-green-600">7.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}