import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  UsersIcon,
  FileTextIcon,
  ClipboardListIcon
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Analytics() {
  const { toast } = useToast();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    retry: false,
  });

  // Handle error states
  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  const kpis = [
    {
      title: "Active Policies",
      value: analytics?.activePolicies?.toLocaleString() || "0",
      icon: FileTextIcon,
      change: "+8.2%",
      trend: "up",
      color: "text-green-600"
    },
    {
      title: "Open Claims",
      value: analytics?.openClaims?.toLocaleString() || "0",
      icon: ClipboardListIcon,
      change: "-2.1%",
      trend: "down",
      color: "text-red-600"
    },
    {
      title: "Monthly Premium",
      value: `$${(analytics?.monthlyPremium / 1000000)?.toFixed(1) || "0"}M`,
      icon: DollarSignIcon,
      change: "+12.5%",
      trend: "up",
      color: "text-green-600"
    },
    {
      title: "Conversion Rate",
      value: `${analytics?.conversionRate || "0"}%`,
      icon: TrendingUpIcon,
      change: "+1.3%",
      trend: "up",
      color: "text-green-600"
    }
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Analytics & KPIs</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track performance metrics, conversion rates, and business insights.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                Export Report
              </Button>
              <Button>
                <BarChart3Icon className="w-4 h-4 mr-2" />
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <kpi.icon className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    {kpi.trend === "up" ? (
                      <TrendingUpIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDownIcon className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ml-1 ${kpi.color}`}>
                      {kpi.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">from last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics?.conversionRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${analytics?.conversionRate || 0}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Acquisition Cost</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${analytics?.analyticsOverview?.cac || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '73%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lifetime Value</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${analytics?.analyticsOverview?.ltv?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Claims Ratio</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics?.analyticsOverview?.claimsRatio || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Business Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=200" 
                  alt="Financial analytics and business performance charts" 
                  className="rounded-lg shadow-sm w-full h-32 object-cover" 
                />
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Revenue Growth</h4>
                  <p className="text-sm text-blue-700">
                    Monthly premium revenue has increased by 12.5% compared to last month, 
                    driven by new policy acquisitions and successful renewals.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Claims Efficiency</h4>
                  <p className="text-sm text-green-700">
                    Claims processing time has improved by 18% with the new automated 
                    workflow and AI-assisted claim analysis.
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Opportunity</h4>
                  <p className="text-sm text-orange-700">
                    Quote-to-policy conversion rate can be improved by 5-8% by optimizing 
                    the checkout process and reducing form abandonment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Resellers Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Reseller Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : analytics?.topResellers?.length > 0 ? (
              <div className="space-y-4">
                {analytics.topResellers.map((reseller: any) => (
                  <div key={reseller.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{reseller.initials}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{reseller.name}</h4>
                        <p className="text-sm text-gray-500">
                          {reseller.policiesThisMonth} policies • ${reseller.revenue?.toLocaleString()} revenue
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <TrendingUpIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          +{reseller.growth}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">vs last month</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reseller data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
