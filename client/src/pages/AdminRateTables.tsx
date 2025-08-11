import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Database, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function AdminRateTables() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [productType, setProductType] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rateTables, isLoading } = useQuery({
    queryKey: ['/api/admin/rate-tables'],
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/rate-tables/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rate Table Uploaded",
        description: "Rate table has been successfully uploaded and processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/rate-tables'] });
      setSelectedFile(null);
      setProductType('');
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = () => {
    if (!selectedFile || !productType) {
      toast({
        title: "Missing Information",
        description: "Please select a file and product type.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('productType', productType);
    uploadMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Rate Table Management</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload New Rate Table
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productType">Product Type</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero-vsc">Hero VSC</SelectItem>
                    <SelectItem value="connected-auto-care">Connected Auto Care</SelectItem>
                    <SelectItem value="home-warranty">Home Warranty</SelectItem>
                    <SelectItem value="rv-warranty">RV Warranty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file">Rate Table File (CSV/XLSX)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>

              <Button 
                onClick={handleFileUpload}
                disabled={uploadMutation.isPending || !selectedFile || !productType}
                className="w-full"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Rate Table'}
              </Button>
            </CardContent>
          </Card>

          {/* Current Rate Tables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Current Rate Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading rate tables...</div>
              ) : rateTables && Array.isArray(rateTables) && rateTables.length > 0 ? (
                <div className="space-y-4">
                  {rateTables.map((table: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{table.name}</h3>
                        <p className="text-sm text-gray-600">
                          Product: {table.productId}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tenant: {table.tenantId}
                        </p>
                        <p className="text-sm text-gray-600">
                          Uploaded: {new Date(table.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {table.rateData?.recordCount || 'Unknown'} records
                        </p>
                        <p className="text-sm text-gray-600">
                          Version: {table.version} | {table.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No rate tables uploaded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}