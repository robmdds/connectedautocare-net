import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Shield,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from "lucide-react";
import { format, subDays, subMonths } from "date-fns";

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  format: "currency" | "percentage" | "number";
  trend: "up" | "down" | "stable";
  target?: number;
  description: string;
}

interface ChartData {
  name: string;
  value: number;
  previousValue?: number;
  fill?: string;
  date?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AdvancedAnalytics() {
  const [dateRange, setDateRange] = useState("30");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "revenue", "policies", "claims", "retention"
  ]);

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard", dateRange],
  });

  // Fetch KPI metrics
  const { data: kpiMetrics = [] } = useQuery({
    queryKey: ["/api/analytics/kpi-metrics", dateRange],
  });

  // Fetch revenue trends
  const { data: revenueTrends = [] } = useQuery({
    queryKey: ["/api/analytics/revenue-trends", dateRange],
  });

  // Fetch policy analytics
  const { data: policyAnalytics = [] } = useQuery({
    queryKey: ["/api/analytics/policy-breakdown"],
  });

  // Fetch claims analytics
  const { data: claimsAnalytics = [] } = useQuery({
    queryKey: ["/api/analytics/claims-breakdown"],
  });

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600 mt-2">Real-time business intelligence and performance metrics</p>
          </div>
          <div className="flex space-x-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]" data-testid="select-date-range">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-export-analytics">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" data-testid="button-refresh-analytics">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiMetrics.map((metric: KPIMetric) => {
            const change = ((metric.value - metric.previousValue) / metric.previousValue) * 100;
            const isPositiveChange = change > 0;
            
            return (
              <Card key={metric.id} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getTrendIcon(metric.trend, change)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1" data-testid={`metric-${metric.id}`}>
                    {formatValue(metric.value, metric.format)}
                  </div>
                  <div className={`text-xs ${getTrendColor(metric.trend)}`}>
                    {isPositiveChange ? '+' : ''}{change.toFixed(1)}% from last period
                  </div>
                  {metric.target && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Target</span>
                        <span>{formatValue(metric.target, metric.format)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min((metric.value / metric.target) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600"></div>
              </Card>
            );
          })}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
          </TabsList>

          {/* Revenue Analytics */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChartIcon className="h-5 w-5 mr-2" />
                    Revenue Trends
                  </CardTitle>
                  <CardDescription>Premium revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2" />
                    Revenue by Product
                  </CardTitle>
                  <CardDescription>Revenue breakdown by insurance product</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.revenueByProduct || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(analyticsData?.revenueByProduct || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
                <CardDescription>Detailed revenue analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600" data-testid="text-total-revenue">
                      ${analyticsData?.totalRevenue?.toLocaleString() || 0}
                    </div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600" data-testid="text-avg-premium">
                      ${analyticsData?.averagePremium?.toLocaleString() || 0}
                    </div>
                    <p className="text-sm text-gray-600">Average Premium</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600" data-testid="text-growth-rate">
                      {analyticsData?.growthRate?.toFixed(1) || 0}%
                    </div>
                    <p className="text-sm text-gray-600">Growth Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policy Analytics */}
          <TabsContent value="policies" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Policy Issuance Trends
                  </CardTitle>
                  <CardDescription>New policies issued over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData?.policyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="new" stackId="1" stroke="#10B981" fill="#10B981" />
                      <Area type="monotone" dataKey="renewed" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2" />
                    Policy Distribution
                  </CardTitle>
                  <CardDescription>Active policies by product type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={policyAnalytics}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {policyAnalytics.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Claims Analytics */}
          <TabsContent value="claims" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Claims Volume & Payouts
                  </CardTitle>
                  <CardDescription>Monthly claims statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData?.claimsTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Claims Count" />
                      <Bar yAxisId="right" dataKey="payout" fill="#10B981" name="Payouts ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Claims Performance
                  </CardTitle>
                  <CardDescription>Processing times and approval rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Average Processing Time</span>
                        <span className="text-sm text-gray-600">
                          {analyticsData?.avgProcessingTime || 0} days
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((analyticsData?.avgProcessingTime || 0) / 14 * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Approval Rate</span>
                        <span className="text-sm text-gray-600">
                          {analyticsData?.approvalRate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${analyticsData?.approvalRate || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Customer Satisfaction</span>
                        <span className="text-sm text-gray-600">
                          {analyticsData?.customerSatisfaction?.toFixed(1) || 0}/5.0
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${((analyticsData?.customerSatisfaction || 0) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Analytics */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Loss Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center mb-4" data-testid="text-loss-ratio">
                    {analyticsData?.lossRatio?.toFixed(1) || 0}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        (analyticsData?.lossRatio || 0) > 80 ? 'bg-red-600' :
                        (analyticsData?.lossRatio || 0) > 60 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(analyticsData?.lossRatio || 0, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">Claims paid / Premiums collected</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Combined Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center mb-4" data-testid="text-combined-ratio">
                    {analyticsData?.combinedRatio?.toFixed(1) || 0}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        (analyticsData?.combinedRatio || 0) > 100 ? 'bg-red-600' :
                        (analyticsData?.combinedRatio || 0) > 95 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(analyticsData?.combinedRatio || 0, 120)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">Total costs / Premiums collected</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profit Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center mb-4" data-testid="text-profit-margin">
                    {analyticsData?.profitMargin?.toFixed(1) || 0}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${Math.max(analyticsData?.profitMargin || 0, 0)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">Net income / Total revenue</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Retention Analytics */}
          <TabsContent value="retention" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Customer Retention Analysis
                </CardTitle>
                <CardDescription>Customer lifecycle and retention metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium mb-4">Retention Rate by Cohort</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={analyticsData?.retentionCohorts || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Line type="monotone" dataKey="retention" stroke="#3B82F6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-4">Key Retention Metrics</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>1-Year Retention Rate</span>
                        <span className="font-semibold text-green-600">
                          {analyticsData?.oneYearRetention?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Lifetime Value</span>
                        <span className="font-semibold text-blue-600">
                          ${analyticsData?.customerLifetimeValue?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Churn Rate</span>
                        <span className="font-semibold text-red-600">
                          {analyticsData?.churnRate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Renewal Success Rate</span>
                        <span className="font-semibold text-purple-600">
                          {analyticsData?.renewalSuccessRate?.toFixed(1) || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}