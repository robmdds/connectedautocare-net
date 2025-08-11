import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Brain, Settings, Zap, CheckCircle, AlertCircle, Bot } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function AdminAiModels() {
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState('2048');
  const [enableFunctionCalling, setEnableFunctionCalling] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: modelConfig, isLoading } = useQuery({
    queryKey: ['/api/admin/ai-models'],
    retry: false,
  });

  const updateModelMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await fetch('/api/admin/ai-models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Model Updated",
        description: "AI model configuration has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-models'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const availableModels = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      status: 'active',
      description: 'Latest multimodal model with vision and text capabilities',
      maxTokens: 128000,
      costPer1K: 0.005
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      status: 'active',
      description: 'High-performance model with 128K context window',
      maxTokens: 128000,
      costPer1K: 0.01
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      status: 'active',
      description: 'Fast and cost-effective model for most tasks',
      maxTokens: 16385,
      costPer1K: 0.0015
    }
  ];

  const handleSaveConfiguration = () => {
    updateModelMutation.mutate({
      model: selectedModel,
      temperature: temperature[0],
      maxTokens: parseInt(maxTokens),
      enableFunctionCalling,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'deprecated':
        return <Badge className="bg-yellow-100 text-yellow-800">Deprecated</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">AI Models Configuration</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Current Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Current Model Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="modelSelect">Active Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(e.target.value)}
                    min="1"
                    max="128000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Temperature: {temperature[0]}</Label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Conservative</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="functionCalling"
                    checked={enableFunctionCalling}
                    onCheckedChange={setEnableFunctionCalling}
                  />
                  <Label htmlFor="functionCalling">Enable Function Calling</Label>
                </div>
              </div>

              <Button onClick={handleSaveConfiguration} disabled={updateModelMutation.isPending}>
                {updateModelMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>

          {/* Available Models */}
          <Card>
            <CardHeader>
              <CardTitle>Available Models</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading models...</div>
              ) : (
                <div className="space-y-4">
                  {availableModels.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Bot className="h-8 w-8 text-gray-600" />
                        <div>
                          <h3 className="font-medium">{model.name}</h3>
                          <p className="text-sm text-gray-600">{model.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>Provider: {model.provider}</span>
                            <span>Max Tokens: {model.maxTokens.toLocaleString()}</span>
                            <span>Cost: ${model.costPer1K}/1K tokens</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {selectedModel === model.id && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {getStatusBadge(model.status)}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedModel(model.id)}
                          disabled={selectedModel === model.id}
                        >
                          {selectedModel === model.id ? 'Active' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Usage Statistics (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2,847</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1.2M</div>
                  <div className="text-sm text-gray-600">Tokens Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">$47.85</div>
                  <div className="text-sm text-gray-600">Total Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">98.5%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}