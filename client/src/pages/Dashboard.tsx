import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import MetricsCards from "@/components/MetricsCards";
import PolicyManagement from "@/components/PolicyManagement";
import ClaimsManagement from "@/components/ClaimsManagement";
import PaymentIntegration from "@/components/PaymentIntegration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, DownloadIcon } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    retry: false,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/analytics/recent-activity"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {user?.firstName || 'User'}. Here's what's happening with your insurance business today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="inline-flex items-center">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="inline-flex items-center">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Policy
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metrics Cards */}
        <MetricsCards analytics={analytics} isLoading={analyticsLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {/* Dashboard overview image */}
              <div className="mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300" 
                  alt="Insurance dashboard analytics overview" 
                  className="rounded-lg shadow-sm w-full h-48 object-cover" 
                />
              </div>
              
              <div className="space-y-4">
                {analytics?.recentActivity?.length > 0 ? (
                  analytics.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 ${activity.color === 'green' ? 'bg-green-100' : activity.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                          <i className={`fas fa-${activity.icon} ${activity.color === 'green' ? 'text-green-600' : activity.color === 'blue' ? 'text-blue-600' : 'text-gray-600'} text-sm`}></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString()} ago
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No recent activity to display
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <Button className="w-full flex items-center justify-center">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create New Policy
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center">
                <i className="fas fa-calculator mr-2"></i>
                Generate Quote
              </Button>

              <Button variant="outline" className="w-full flex items-center justify-center">
                <i className="fas fa-file-upload mr-2"></i>
                Upload Rate Table
              </Button>

              <Button variant="outline" className="w-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                File New Claim
              </Button>

              <hr className="my-4" />

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">AI Assistant</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-robot text-primary mt-1"></i>
                    <div>
                      <p className="text-sm text-gray-700">
                        "How can I help you with policy comparisons or claim guidance today?"
                      </p>
                      <button className="text-xs text-primary hover:text-blue-700 mt-2">Ask a question →</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Management */}
        <PolicyManagement />

        {/* Claims Management */}
        <ClaimsManagement />

        {/* Payment Integration */}
        <PaymentIntegration />

        {/* Resellers and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Resellers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Resellers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=200" 
                  alt="Business analytics dashboard with performance metrics" 
                  className="rounded-lg shadow-sm w-full h-32 object-cover" 
                />
              </div>
              
              <div className="space-y-4">
                {analytics?.topResellers?.length > 0 ? (
                  analytics.topResellers.map((reseller: any) => (
                    <div key={reseller.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{reseller.initials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reseller.name}</p>
                          <p className="text-xs text-gray-500">{reseller.policiesThisMonth} policies this month</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${reseller.revenue?.toLocaleString()}</p>
                        <p className="text-xs text-green-600">+{reseller.growth}%</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No reseller data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=200" 
                  alt="Financial analytics and business performance charts" 
                  className="rounded-lg shadow-sm w-full h-32 object-cover" 
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.conversionRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${analytics?.conversionRate || 0}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Acquisition Cost</span>
                  <span className="text-sm font-medium text-gray-900">${analytics?.analyticsOverview?.cac || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '73%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lifetime Value</span>
                  <span className="text-sm font-medium text-gray-900">${analytics?.analyticsOverview?.ltv || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Claims Ratio</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.analyticsOverview?.claimsRatio || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
