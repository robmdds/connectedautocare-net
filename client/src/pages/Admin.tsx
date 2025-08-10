import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  SettingsIcon,
  UsersIcon,
  BuildingIcon,
  PackageIcon,
  FileSpreadsheetIcon,
  WebhookIcon,
  BarChart3Icon,
  PlusIcon,
  EditIcon,
  TrashIcon
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Admin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: rateTables, isLoading: rateTablesLoading } = useQuery({
    queryKey: ["/api/rate-tables"],
    retry: false,
  });

  const { data: resellers, isLoading: resellersLoading } = useQuery({
    queryKey: ["/api/resellers"],
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    retry: false,
  });

  return (
    <Layout>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Admin Console</h1>
              <p className="text-sm text-gray-500 mt-1">
                System administration, tenant management, and platform configuration.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="rate-tables">Rate Tables</TabsTrigger>
            <TabsTrigger value="resellers">Resellers</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PackageIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Products</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {products?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileSpreadsheetIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rate Tables</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {rateTables?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <UsersIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Resellers</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {resellers?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BarChart3Icon className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">System Health</p>
                      <p className="text-2xl font-semibold text-green-600">Good</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Rate table uploaded</p>
                      <p className="text-xs text-gray-500">Auto Insurance 2024 rates - 5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New reseller registered</p>
                      <p className="text-xs text-gray-500">AutoCare Partners - 1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Webhook endpoint updated</p>
                      <p className="text-xs text-gray-500">Helcim payment webhook - 3 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products</CardTitle>
                  <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : products?.length === 0 ? (
                  <div className="text-center py-8">
                    <PackageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No products configured</p>
                    <Button className="mt-4">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products?.map((product: any) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(product.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <EditIcon className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rate Tables Tab */}
          <TabsContent value="rate-tables" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Rate Tables</CardTitle>
                  <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Upload Rate Table
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {rateTablesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : rateTables?.length === 0 ? (
                  <div className="text-center py-8">
                    <FileSpreadsheetIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No rate tables uploaded</p>
                    <Button className="mt-4">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Upload Your First Rate Table
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Effective Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Uploaded By</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rateTables?.map((table: any) => (
                          <TableRow key={table.id}>
                            <TableCell className="font-medium">{table.name}</TableCell>
                            <TableCell>{table.version}</TableCell>
                            <TableCell>
                              {new Date(table.effectiveDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={table.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {table.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>System</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <EditIcon className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resellers Tab */}
          <TabsContent value="resellers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Reseller Management</CardTitle>
                  <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Reseller
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {resellersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : resellers?.length === 0 ? (
                  <div className="text-center py-8">
                    <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No resellers registered</p>
                    <Button className="mt-4">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Your First Reseller
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business Name</TableHead>
                          <TableHead>Contact Email</TableHead>
                          <TableHead>Commission Rate</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resellers?.map((reseller: any) => (
                          <TableRow key={reseller.id}>
                            <TableCell className="font-medium">{reseller.businessName}</TableCell>
                            <TableCell>{reseller.contactEmail}</TableCell>
                            <TableCell>{reseller.commissionRate}%</TableCell>
                            <TableCell>
                              <Badge className={reseller.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {reseller.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(reseller.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <EditIcon className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <WebhookIcon className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Helcim Payment Webhook</p>
                          <p className="text-sm text-green-700">Connected and operational</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <WebhookIcon className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">DocuSign Webhook</p>
                          <p className="text-sm text-gray-700">Ready for configuration</p>
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{analytics?.activePolicies || 0}</p>
                    <p className="text-sm text-gray-600">Total Policies</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{analytics?.openClaims || 0}</p>
                    <p className="text-sm text-gray-600">Active Claims</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{analytics?.conversionRate || 0}%</p>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">System Health</h4>
                  <p className="text-sm text-blue-700">
                    All services are operational. Database performance is optimal, 
                    API response times are within acceptable limits, and webhook 
                    processing is functioning normally.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
