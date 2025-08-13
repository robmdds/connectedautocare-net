import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Server,
  Database,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Settings,
  MonitorSpeaker,
  CloudLightning,
  BarChart3,
  LineChart,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Eye,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  RotateCcw,
  Bell,
  FileText,
  Code,
  Globe,
  Lock,
  Unlock,
  Power,
  PowerOff
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SystemStatus {
  id: string;
  name: string;
  type: "service" | "database" | "api" | "external";
  status: "online" | "offline" | "warning" | "maintenance";
  uptime: number;
  responseTime: number;
  lastCheck: string;
  healthScore: number;
  dependencies: string[];
  version: string;
  endpoint?: string;
}

interface Integration {
  id: string;
  name: string;
  type: "webhook" | "api" | "database" | "file_transfer" | "email";
  status: "active" | "inactive" | "error" | "pending";
  provider: string;
  lastSync: string;
  syncFrequency: string;
  recordsProcessed: number;
  errorCount: number;
  successRate: number;
  configuration: {
    [key: string]: any;
  };
}

interface WorkflowAutomation {
  id: string;
  name: string;
  type: "policy_issuance" | "claim_processing" | "renewal" | "notification" | "reporting";
  status: "running" | "paused" | "error" | "completed";
  trigger: string;
  actions: string[];
  lastRun: string;
  successCount: number;
  errorCount: number;
  avgExecutionTime: number;
  schedule?: string;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  threshold: {
    warning: number;
    critical: number;
  };
}

export default function SystemIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSystem, setSelectedSystem] = useState<SystemStatus | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch system status
  const { data: systemStatuses = [], isLoading: systemLoading } = useQuery({
    queryKey: ["/api/system/status"],
    refetchInterval: 5000, // Real-time monitoring
  });

  // Fetch integrations
  const { data: integrations = [], isLoading: integrationLoading } = useQuery({
    queryKey: ["/api/system/integrations"],
    refetchInterval: 10000,
  });

  // Fetch workflow automations
  const { data: workflows = [] } = useQuery({
    queryKey: ["/api/system/workflows"],
    refetchInterval: 15000,
  });

  // Fetch system metrics
  const { data: metrics = [] } = useQuery({
    queryKey: ["/api/system/metrics"],
    refetchInterval: 30000,
  });

  // Restart system mutation
  const restartSystemMutation = useMutation({
    mutationFn: async (systemId: string) => {
      return await apiRequest("POST", `/api/system/${systemId}/restart`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/status"] });
      toast({
        title: "System Restarted",
        description: "System has been successfully restarted",
      });
    },
  });

  // Toggle integration mutation
  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ integrationId, action }: { integrationId: string; action: "enable" | "disable" | "sync" }) => {
      return await apiRequest("POST", `/api/system/integrations/${integrationId}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/integrations"] });
      toast({
        title: "Integration Updated",
        description: "Integration status has been updated successfully",
      });
    },
  });

  // Control workflow mutation
  const controlWorkflowMutation = useMutation({
    mutationFn: async ({ workflowId, action }: { workflowId: string; action: "start" | "pause" | "stop" | "reset" }) => {
      return await apiRequest("POST", `/api/system/workflows/${workflowId}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/workflows"] });
      toast({
        title: "Workflow Updated",
        description: "Workflow has been updated successfully",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'running':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'offline':
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
      case 'paused':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance':
      case 'paused':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSystemIcon = (type: string) => {
    switch (type) {
      case 'service': return Server;
      case 'database': return Database;
      case 'api': return Zap;
      default: return Activity;
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'webhook': return CloudLightning;
      case 'api': return Globe;
      case 'database': return Database;
      case 'file_transfer': return Upload;
      case 'email': return Bell;
      default: return Zap;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Integration Hub</h1>
            <p className="text-gray-600 mt-2">Real-time monitoring, integrations, and workflow automation</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" data-testid="button-export-logs">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button data-testid="button-system-settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-system-health">
                98.5%
              </div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-integrations">
                {integrations.filter((i: Integration) => i.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                of {integrations.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows Running</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-running-workflows">
                {workflows.filter((w: WorkflowAutomation) => w.status === 'running').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Automated processes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-response-time">
                145ms
              </div>
              <p className="text-xs text-muted-foreground">
                System performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="systems" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="systems">System Status</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="metrics">Performance</TabsTrigger>
          </TabsList>

          {/* System Status Tab */}
          <TabsContent value="systems" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>System Components</CardTitle>
                    <CardDescription>Real-time status of all system components</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {systemLoading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Loading system status...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {systemStatuses.map((system: SystemStatus) => {
                          const SystemIcon = getSystemIcon(system.type);
                          
                          return (
                            <div
                              key={system.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedSystem(system)}
                              data-testid={`system-item-${system.id}`}
                            >
                              <div className="flex items-center space-x-3">
                                <SystemIcon className="h-5 w-5 text-gray-500" />
                                <div>
                                  <p className="font-medium">{system.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {system.type} • v{system.version}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <p className="text-sm font-medium">{system.responseTime}ms</p>
                                  <p className="text-xs text-gray-500">
                                    {system.uptime.toFixed(1)}% uptime
                                  </p>
                                </div>
                                <Badge className={getStatusColor(system.status)}>
                                  {getStatusIcon(system.status)}
                                  <span className="ml-1">{system.status}</span>
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                {selectedSystem ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>System Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">System Name</Label>
                        <p className="text-sm text-gray-600">{selectedSystem.name}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Health Score</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                selectedSystem.healthScore >= 90 ? 'bg-green-500' :
                                selectedSystem.healthScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedSystem.healthScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{selectedSystem.healthScore}%</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Dependencies</Label>
                        <div className="space-y-1 mt-1">
                          {selectedSystem.dependencies.map((dep, index) => (
                            <Badge key={index} variant="outline" className="mr-1">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Last Check</Label>
                        <p className="text-sm text-gray-600">
                          {format(new Date(selectedSystem.lastCheck), 'MMM dd, yyyy HH:mm:ss')}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => restartSystemMutation.mutate(selectedSystem.id)}
                          disabled={restartSystemMutation.isPending}
                          data-testid="button-restart-system"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restart
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Logs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Select a system to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Integrations</CardTitle>
                <CardDescription>External system integrations and data synchronization</CardDescription>
              </CardHeader>
              <CardContent>
                {integrationLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading integrations...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {integrations.map((integration: Integration) => {
                      const IntegrationIcon = getIntegrationIcon(integration.type);
                      
                      return (
                        <div
                          key={integration.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                          data-testid={`integration-item-${integration.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <IntegrationIcon className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{integration.name}</p>
                              <p className="text-sm text-gray-600">
                                {integration.provider} • {integration.syncFrequency}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {integration.recordsProcessed.toLocaleString()} records
                              </p>
                              <p className="text-xs text-gray-500">
                                {integration.successRate.toFixed(1)}% success
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(integration.status)}>
                                {getStatusIcon(integration.status)}
                                <span className="ml-1">{integration.status}</span>
                              </Badge>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleIntegrationMutation.mutate({
                                  integrationId: integration.id,
                                  action: integration.status === 'active' ? 'disable' : 'enable'
                                })}
                                data-testid={`button-toggle-${integration.id}`}
                              >
                                {integration.status === 'active' ? <Pause /> : <Play />}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleIntegrationMutation.mutate({
                                  integrationId: integration.id,
                                  action: 'sync'
                                })}
                                data-testid={`button-sync-${integration.id}`}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Automations</CardTitle>
                <CardDescription>Automated business processes and triggers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map((workflow: WorkflowAutomation) => (
                    <div
                      key={workflow.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`workflow-item-${workflow.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <RefreshCw className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{workflow.name}</p>
                          <p className="text-sm text-gray-600">
                            {workflow.type} • Trigger: {workflow.trigger}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {workflow.successCount} successful
                          </p>
                          <p className="text-xs text-gray-500">
                            Avg: {workflow.avgExecutionTime}s
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(workflow.status)}>
                            {getStatusIcon(workflow.status)}
                            <span className="ml-1">{workflow.status}</span>
                          </Badge>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => controlWorkflowMutation.mutate({
                              workflowId: workflow.id,
                              action: workflow.status === 'running' ? 'pause' : 'start'
                            })}
                            data-testid={`button-control-${workflow.id}`}
                          >
                            {workflow.status === 'running' ? <Pause /> : <Play />}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => controlWorkflowMutation.mutate({
                              workflowId: workflow.id,
                              action: 'reset'
                            })}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.map((metric: SystemMetric, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{metric.name}</span>
                      <div className="flex items-center space-x-1">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : metric.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <Activity className="h-4 w-4 text-gray-500" />
                        )}
                        <Badge className={
                          metric.status === 'good' ? 'bg-green-100 text-green-800' :
                          metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {metric.status}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2" data-testid={`metric-${metric.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {metric.value}{metric.unit}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Warning</span>
                        <span>{metric.threshold.warning}{metric.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Critical</span>
                        <span>{metric.threshold.critical}{metric.unit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.status === 'good' ? 'bg-green-500' :
                            metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min((metric.value / metric.threshold.critical) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}