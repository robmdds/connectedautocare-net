import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  Download, 
  Calculator, 
  FileSpreadsheet, 
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BulkQuoteItem {
  id: string;
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  productId: string;
  term: string;
  zip: string;
  customerEmail?: string;
  basePremium?: number;
  totalPremium?: number;
  commission?: number;
  status: "pending" | "processed" | "error";
  errorMessage?: string;
}

export default function WholesaleBulkPricing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bulkItems, setBulkItems] = useState<BulkQuoteItem[]>([]);
  const [processingResults, setProcessingResults] = useState<BulkQuoteItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addBulkItem = () => {
    const newItem: BulkQuoteItem = {
      id: `bulk-${Date.now()}`,
      vin: "",
      productId: "",
      term: "",
      zip: "",
      customerEmail: "",
      status: "pending"
    };
    setBulkItems([...bulkItems, newItem]);
  };

  const updateBulkItem = (id: string, field: string, value: string) => {
    setBulkItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeBulkItem = (id: string) => {
    setBulkItems(prev => prev.filter(item => item.id !== id));
  };

  const processBulkQuotes = useMutation({
    mutationFn: async (items: BulkQuoteItem[]) => {
      return await apiRequest("POST", "/api/wholesale/bulk-quotes", { items });
    },
    onSuccess: (data) => {
      setProcessingResults(data.results);
      toast({
        title: "Bulk Processing Complete",
        description: `Processed ${data.results.length} quotes successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Processing Error",
        description: "Failed to process bulk quotes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProcessBulk = () => {
    if (bulkItems.length === 0) {
      toast({
        title: "No Items",
        description: "Please add items to process",
        variant: "destructive",
      });
      return;
    }

    const validItems = bulkItems.filter(item => item.vin && item.productId && item.term);
    if (validItems.length === 0) {
      toast({
        title: "Invalid Items",
        description: "Please ensure all items have VIN, Product, and Term specified",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    processBulkQuotes.mutate(validItems);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const exportResults = () => {
    if (processingResults.length === 0) {
      toast({
        title: "No Results",
        description: "No processed results to export",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["VIN", "Product", "Term", "Customer Email", "Base Premium", "Total Premium", "Commission", "Status"];
    const csvContent = [
      headers.join(","),
      ...processingResults.map(item => [
        item.vin,
        item.productId,
        item.term,
        item.customerEmail || "",
        item.basePremium || "",
        item.totalPremium || "",
        item.commission || "",
        item.status
      ].join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bulk-quotes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const uploadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const newItems: BulkQuoteItem[] = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',');
          return {
            id: `csv-${Date.now()}-${index}`,
            vin: values[0] || "",
            productId: values[1] || "",
            term: values[2] || "",
            zip: values[3] || "",
            customerEmail: values[4] || "",
            status: "pending" as const
          };
        });

      setBulkItems([...bulkItems, ...newItems]);
      toast({
        title: "CSV Imported",
        description: `Imported ${newItems.length} items from CSV`,
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bulk Pricing Tool</h1>
                <p className="text-gray-600">Process multiple quotes simultaneously</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={uploadCSV}
                className="hidden"
              />
              <Button variant="outline" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Bulk Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bulk Quote Input</span>
              <Button onClick={addBulkItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardTitle>
            <CardDescription>
              Add multiple vehicles for bulk quote processing. You can also import from CSV.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bulkItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileSpreadsheet className="mx-auto h-12 w-12 mb-4" />
                <p>No items added yet. Click "Add Item" or import a CSV to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bulkItems.map((item, index) => (
                  <Card key={item.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="grid md:grid-cols-6 gap-4 items-end">
                        <div>
                          <Label htmlFor={`vin-${item.id}`}>VIN</Label>
                          <Input
                            id={`vin-${item.id}`}
                            placeholder="17-digit VIN"
                            value={item.vin}
                            onChange={(e) => updateBulkItem(item.id, "vin", e.target.value)}
                            maxLength={17}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`product-${item.id}`}>Product</Label>
                          <Select 
                            value={item.productId}
                            onValueChange={(value) => updateBulkItem(item.id, "productId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto-advantage-wholesale">Auto Advantage</SelectItem>
                              <SelectItem value="home-protection-wholesale">Home Protection</SelectItem>
                              <SelectItem value="all-vehicle-wholesale">All-Vehicle</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`term-${item.id}`}>Term</Label>
                          <Select 
                            value={item.term}
                            onValueChange={(value) => updateBulkItem(item.id, "term", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
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

                        <div>
                          <Label htmlFor={`zip-${item.id}`}>ZIP</Label>
                          <Input
                            id={`zip-${item.id}`}
                            placeholder="ZIP Code"
                            value={item.zip}
                            onChange={(e) => updateBulkItem(item.id, "zip", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`email-${item.id}`}>Customer Email</Label>
                          <Input
                            id={`email-${item.id}`}
                            placeholder="Email (optional)"
                            value={item.customerEmail}
                            onChange={(e) => updateBulkItem(item.id, "customerEmail", e.target.value)}
                          />
                        </div>

                        <div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeBulkItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={handleProcessBulk}
                    disabled={isProcessing || bulkItems.length === 0}
                    size="lg"
                  >
                    {isProcessing ? "Processing..." : `Process ${bulkItems.length} Quotes`}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {processingResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Results</CardTitle>
              <CardDescription>
                Results from your bulk quote processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VIN</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Base Premium</TableHead>
                    <TableHead>Total Premium</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processingResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-mono text-sm">{result.vin}</TableCell>
                      <TableCell>{result.productId}</TableCell>
                      <TableCell>{result.term} months</TableCell>
                      <TableCell>${result.basePremium?.toLocaleString()}</TableCell>
                      <TableCell>${result.totalPremium?.toLocaleString()}</TableCell>
                      <TableCell>${result.commission?.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {result.status === "processed" ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <Badge variant="default">Success</Badge>
                            </>
                          ) : result.status === "error" ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                              <Badge variant="destructive">Error</Badge>
                            </>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* CSV Template Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>CSV Import Template</CardTitle>
            <CardDescription>
              Use this template format for bulk importing quotes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm">
                VIN,ProductID,Term,ZIP,CustomerEmail<br/>
                1HGCM82633A123456,auto-advantage-wholesale,36,12345,customer1@example.com<br/>
                2HGCM82633A123457,home-protection-wholesale,24,54321,customer2@example.com
              </code>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Required fields: VIN, ProductID, Term. Optional: ZIP, CustomerEmail
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}