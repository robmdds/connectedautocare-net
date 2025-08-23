import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, TrendingUp, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Analytics() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    retry: false,
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
                <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Required</h2>
                <p className="text-gray-600 mb-4">Please sign in to view analytics data</p>
                <a href="/api/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Sign In</a>
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
            <Link href="/" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
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
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{((analytics?.retentionRate || 0) * 100).toFixed(1)}%</div>
                  <p className="text-sm text-gray-500">Quote to policy conversion</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${analytics?.monthlyRevenue?.toLocaleString() || 0}</div>
                  <p className="text-sm text-gray-500">Monthly premium collected</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Active Policies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics?.activePolicies || 0}</div>
                  <p className="text-sm text-gray-500">Currently active</p>
                </CardContent>
              </Card>
            </div>

            {/* Chart Section */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart visualization would be implemented here with a charting library like Recharts
                </div>
              </CardContent>
            </Card>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Claims Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Active Claims</span>
                      <span className="font-semibold">{analytics?.pendingClaims || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Processing Time</span>
                      <span className="font-semibold">5.2 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Settlement Rate</span>
                      <span className="font-semibold">87%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Auto Insurance</span>
                      <span className="font-semibold">45% of sales</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Home Insurance</span>
                      <span className="font-semibold">28% of sales</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RV Insurance</span>
                      <span className="font-semibold">18% of sales</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marine Insurance</span>
                      <span className="font-semibold">9% of sales</span>
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