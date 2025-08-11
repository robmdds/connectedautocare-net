import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, MessageSquare, Plus, Edit, Copy, Trash2, FileText, HelpCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function AdminResponseTemplates() {
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Edit template state
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [editTemplateName, setEditTemplateName] = useState('');
  const [editTemplateCategory, setEditTemplateCategory] = useState('');
  const [editTemplateContent, setEditTemplateContent] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/admin/response-templates'],
    retry: false,
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const response = await fetch('/api/admin/response-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Created",
        description: "New response template has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/response-templates'] });
      setIsCreateDialogOpen(false);
      setNewTemplateName('');
      setNewTemplateCategory('');
      setNewTemplateContent('');
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, template }: { id: string, template: any }) => {
      const response = await fetch(`/api/admin/response-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Updated",
        description: "Response template has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/response-templates'] });
      setIsEditDialogOpen(false);
      setEditTemplate(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sample response templates for demonstration
  const sampleTemplates = [
    {
      id: 'welcome-message',
      name: 'Welcome Message',
      category: 'customer-service',
      content: 'Hello! Welcome to our insurance platform. I\'m here to help you with any questions about your policy, claims, or coverage options. How can I assist you today?',
      status: 'active',
      usageCount: 1247,
      lastUsed: '2025-08-11',
      variables: ['customer_name', 'policy_number']
    },
    {
      id: 'claim-status-inquiry',
      name: 'Claim Status Inquiry',
      category: 'claims',
      content: 'I\'d be happy to help you check the status of your claim. Your claim #{claim_number} is currently {claim_status}. {status_details} If you have any questions about this update, please let me know.',
      status: 'active',
      usageCount: 892,
      lastUsed: '2025-08-11',
      variables: ['claim_number', 'claim_status', 'status_details']
    },
    {
      id: 'coverage-explanation',
      name: 'Coverage Explanation',
      category: 'product-info',
      content: 'Your {product_name} policy provides comprehensive coverage including: {coverage_details}. Your deductible is ${deductible_amount} and your monthly premium is ${monthly_premium}. This coverage is effective from {start_date} to {end_date}.',
      status: 'active',
      usageCount: 634,
      lastUsed: '2025-08-10',
      variables: ['product_name', 'coverage_details', 'deductible_amount', 'monthly_premium', 'start_date', 'end_date']
    },
    {
      id: 'payment-reminder',
      name: 'Payment Reminder',
      category: 'billing',
      content: 'This is a friendly reminder that your payment of ${payment_amount} for policy #{policy_number} is due on {due_date}. You can make a payment online through your account or call our billing department at {phone_number}.',
      status: 'active',
      usageCount: 445,
      lastUsed: '2025-08-09',
      variables: ['payment_amount', 'policy_number', 'due_date', 'phone_number']
    },
    {
      id: 'technical-support',
      name: 'Technical Support',
      category: 'support',
      content: 'I understand you\'re experiencing technical difficulties. Let me help you resolve this issue. Can you please describe what specific problem you\'re encountering? In the meantime, you can also contact our technical support team at {support_email}.',
      status: 'draft',
      usageCount: 23,
      lastUsed: '2025-08-05',
      variables: ['support_email', 'issue_description']
    }
  ];

  const categories = [
    'customer-service',
    'claims',
    'product-info',
    'billing',
    'support',
    'compliance'
  ];

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name and content are required.",
        variant: "destructive",
      });
      return;
    }

    createTemplateMutation.mutate({
      name: newTemplateName,
      category: newTemplateCategory,
      content: newTemplateContent,
    });
  };

  const handleEditTemplate = (template: any) => {
    setEditTemplate(template);
    setEditTemplateName(template.name);
    setEditTemplateCategory(template.category);
    setEditTemplateContent(template.content);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTemplate = () => {
    if (!editTemplateName.trim() || !editTemplateContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name and content are required.",
        variant: "destructive",
      });
      return;
    }

    updateTemplateMutation.mutate({
      id: editTemplate.id,
      template: {
        name: editTemplateName,
        category: editTemplateCategory,
        content: editTemplateContent,
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'customer-service':
        return <MessageSquare className="h-4 w-4" />;
      case 'claims':
        return <FileText className="h-4 w-4" />;
      case 'product-info':
        return <HelpCircle className="h-4 w-4" />;
      case 'billing':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
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
              <h1 className="text-2xl font-bold text-gray-900">Response Templates</h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Response Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateCategory">Category</Label>
                    <Select value={newTemplateCategory} onValueChange={setNewTemplateCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="templateContent">Template Content</Label>
                    <Textarea
                      id="templateContent"
                      value={newTemplateContent}
                      onChange={(e) => setNewTemplateContent(e.target.value)}
                      placeholder="Enter template content with variables like {variable_name}"
                      rows={6}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Use {`{variable_name}`} syntax for dynamic content replacement
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTemplate} disabled={createTemplateMutation.isPending}>
                      {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Response Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTemplateName">Template Name</Label>
              <Input
                id="editTemplateName"
                value={editTemplateName}
                onChange={(e) => setEditTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="editTemplateCategory">Category</Label>
              <Select value={editTemplateCategory} onValueChange={setEditTemplateCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editTemplateContent">Template Content</Label>
              <Textarea
                id="editTemplateContent"
                value={editTemplateContent}
                onChange={(e) => setEditTemplateContent(e.target.value)}
                placeholder="Enter template content with variables like {variable_name}"
                rows={6}
              />
              <p className="text-sm text-gray-500 mt-1">
                Use {`{variable_name}`} syntax for dynamic content replacement
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTemplate} disabled={updateTemplateMutation.isPending}>
                {updateTemplateMutation.isPending ? 'Updating...' : 'Update Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Templates Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Templates Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{sampleTemplates.length}</div>
                  <div className="text-sm text-gray-600">Total Templates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sampleTemplates.filter(t => t.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Templates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {sampleTemplates.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Usage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(sampleTemplates.map(t => t.category)).size}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template List */}
          <Card>
            <CardHeader>
              <CardTitle>Response Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading templates...</div>
              ) : (
                <div className="space-y-4">
                  {sampleTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(template.category)}
                          <h3 className="font-medium">{template.name}</h3>
                          {getStatusBadge(template.status)}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                        {template.content}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Category: {template.category}</span>
                          <span>Used: {template.usageCount} times</span>
                          <span>Last used: {template.lastUsed}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Variables:</span>
                          {template.variables.slice(0, 3).map((variable, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                          {template.variables.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.variables.length - 3}
                            </Badge>
                          )}
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