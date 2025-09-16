import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, TrendingUp, Shield, Users, DollarSign, Activity, Clock, Target } from "lucide-react";
import { Link } from "wouter";

// API fetch function
const fetchAnalytics = async () => {
  const response = await fetch('/api/analytics/dashboard');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export default function Analytics() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: fetchAnalytics,
    retry: 3,
    retryDelay: 1000,
  });

  // Show error state if API fails
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Shield className="h-8 w-8 text-blue-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Analytics</h2>
                <p className="text-gray-600 mb-4">
                  {error instanceof Error ? error.message : 'Failed to load analytics data'}
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Shield className="h-8 w-8 text-blue-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Link href="/dashboard" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <Link href="/policies" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Policies
            </Link>
            <Link href="/claims" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Claims
            </Link>
            <Link href="/analytics" className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium">
              Analytics
            </Link>
            <Link href="/admin" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">Loading analytics...</div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Key Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics?.totalRevenue?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.growthRate ? `+${analytics.growthRate}% from last period` : 'No growth data available'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.activePolicies || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total policies: {analytics?.totalPolicies || analytics?.activePolicies || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.avgProcessingTime ? `${analytics.avgProcessingTime} days` : analytics?.processingTime ? `${analytics.processingTime} days` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">Average claim processing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.customerSatisfaction ? `${analytics.customerSatisfaction}/5` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">Average rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Loss Ratio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {analytics?.lossRatio ? `${(analytics.lossRatio * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                  <p className="text-sm text-gray-500">Claims paid vs premiums</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Monthly Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${analytics?.monthlyRevenue?.toLocaleString() || analytics?.monthlyPremium?.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-gray-500">This month's collections</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Retention Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {analytics?.retentionRate ? `${(analytics.retentionRate * 100).toFixed(1)}%` : analytics?.oneYearRetention ? `${analytics.oneYearRetention}%` : 'N/A'}
                  </div>
                  <p className="text-sm text-gray-500">Customer retention</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Product Chart Placeholder */}
            {analytics?.revenueByProduct && analytics.revenueByProduct.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.revenueByProduct.map((product: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: product.fill }}
                          ></div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <span className="font-bold">${product.value?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Claims and Policy Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Claims Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Open Claims</span>
                      <span className="font-semibold">
                        {analytics?.pendingClaims || analytics?.openClaims || analytics?.totalClaims || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Processing Time</span>
                      <span className="font-semibold">
                        {analytics?.avgProcessingTime || analytics?.processingTime || 'N/A'} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Claim Amount</span>
                      <span className="font-semibold">
                        ${analytics?.averageClaimAmount?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approval Rate</span>
                      <span className="font-semibold">
                        {analytics?.approvalRate ? `${analytics.approvalRate}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Combined Ratio</span>
                      <span className="font-semibold">
                        {analytics?.combinedRatio ? `${analytics.combinedRatio}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Margin</span>
                      <span className="font-semibold">
                        {analytics?.profitMargin ? `${analytics.profitMargin}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Premium</span>
                      <span className="font-semibold">
                        ${analytics?.averagePremium?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Renewal Success Rate</span>
                      <span className="font-semibold">
                        {analytics?.renewalSuccessRate ? `${analytics.renewalSuccessRate}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}