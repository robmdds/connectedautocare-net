import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, DollarSign, TrendingUp, Plus, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    retry: false,
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/analytics/recent-activity"],
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TPA Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName || user?.email || 'User'}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Link href="/" className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium">
              Dashboard
            </Link>
            <Link href="/policies" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Policies
            </Link>
            <Link href="/claims" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Claims
            </Link>
            <Link href="/analytics" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Analytics
            </Link>
            <Link href="/admin" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? "..." : analytics?.totalPolicies || 0}
              </div>
              <p className="text-xs text-muted-foreground">Active insurance policies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? "..." : analytics?.activeClaims || 0}
              </div>
              <p className="text-xs text-muted-foreground">Claims in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Premium</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${analyticsLoading ? "..." : analytics?.monthlyPremium?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">This month's revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? "..." : analytics?.conversionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">Quote to policy</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/policies?action=create">
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Quote
                </Button>
              </Link>
              <Link href="/claims?action=create">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  File New Claim
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <p className="text-sm text-gray-500">Loading activity...</p>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity: any) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Badge variant={activity.type === 'claim_submitted' ? 'destructive' : 'default'}>
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}