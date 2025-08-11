import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Database, Plus, Upload, FileText, Trash2, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function AdminTrainingData() {
  const [newDatasetName, setNewDatasetName] = useState('');
  const [newDatasetDescription, setNewDatasetDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainingData, isLoading } = useQuery({
    queryKey: ['/api/admin/training-data'],
    retry: false,
  });

  const createDatasetMutation = useMutation({
    mutationFn: async (dataset: any) => {
      const response = await fetch('/api/admin/training-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataset),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Dataset Created",
        description: "New training dataset has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/training-data'] });
      setIsCreateDialogOpen(false);
      setNewDatasetName('');
      setNewDatasetDescription('');
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sample training data for demonstration
  const sampleDatasets = [
    {
      id: 'insurance-faq',
      name: 'Insurance FAQ Dataset',
      description: 'Comprehensive Q&A dataset covering insurance policies, claims, and coverage questions',
      type: 'Q&A',
      status: 'active',
      recordCount: 1847,
      lastUpdated: '2025-08-10',
      accuracy: 94.2,
      category: 'customer-support'
    },
    {
      id: 'claims-processing',
      name: 'Claims Processing Guidelines',
      description: 'Training data for automated claims analysis and processing workflows',
      type: 'procedures',
      status: 'active',
      recordCount: 623,
      lastUpdated: '2025-08-09',
      accuracy: 97.8,
      category: 'operations'
    },
    {
      id: 'vehicle-specifications',
      name: 'Vehicle Specifications Database',
      description: 'Detailed vehicle make, model, year, and specification data for coverage determination',
      type: 'reference',
      status: 'active',
      recordCount: 12450,
      lastUpdated: '2025-08-08',
      accuracy: 99.1,
      category: 'product-data'
    },
    {
      id: 'policy-documents',
      name: 'Policy Document Templates',
      description: 'Template language and structure for generating policy documents',
      type: 'templates',
      status: 'training',
      recordCount: 89,
      lastUpdated: '2025-08-07',
      accuracy: 89.5,
      category: 'documentation'
    }
  ];

  const handleCreateDataset = () => {
    if (!newDatasetName.trim()) {
      toast({
        title: "Validation Error",
        description: "Dataset name is required.",
        variant: "destructive",
      });
      return;
    }

    createDatasetMutation.mutate({
      name: newDatasetName,
      description: newDatasetDescription,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'training':
        return <Badge className="bg-blue-100 text-blue-800">Training</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Q&A':
        return <FileText className="h-4 w-4" />;
      case 'procedures':
        return <CheckCircle className="h-4 w-4" />;
      case 'reference':
        return <Database className="h-4 w-4" />;
      case 'templates':
        return <Edit className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Training Data Management</h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Dataset
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Training Dataset</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="datasetName">Dataset Name</Label>
                      <Input
                        id="datasetName"
                        value={newDatasetName}
                        onChange={(e) => setNewDatasetName(e.target.value)}
                        placeholder="Enter dataset name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="datasetDescription">Description</Label>
                      <Textarea
                        id="datasetDescription"
                        value={newDatasetDescription}
                        onChange={(e) => setNewDatasetDescription(e.target.value)}
                        placeholder="Enter dataset description"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateDataset} disabled={createDatasetMutation.isPending}>
                        {createDatasetMutation.isPending ? 'Creating...' : 'Create Dataset'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Training Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Training Data Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{sampleDatasets.length}</div>
                  <div className="text-sm text-gray-600">Active Datasets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sampleDatasets.reduce((sum, d) => sum + d.recordCount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {(sampleDatasets.reduce((sum, d) => sum + d.accuracy, 0) / sampleDatasets.length).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {sampleDatasets.filter(d => d.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Sets</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dataset List */}
          <Card>
            <CardHeader>
              <CardTitle>Training Datasets</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading training data...</div>
              ) : (
                <div className="space-y-4">
                  {sampleDatasets.map((dataset) => (
                    <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getTypeIcon(dataset.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{dataset.name}</h3>
                          <p className="text-sm text-gray-600">{dataset.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>Category: {dataset.category}</span>
                            <span>Records: {dataset.recordCount.toLocaleString()}</span>
                            <span>Updated: {dataset.lastUpdated}</span>
                            <span>Accuracy: {dataset.accuracy}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right text-sm">
                          <div className="font-medium">{dataset.type}</div>
                          <div className="text-gray-600">{dataset.recordCount.toLocaleString()} records</div>
                        </div>
                        {getStatusBadge(dataset.status)}
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}