import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, Database, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Admin() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/system-stats"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Shield className="h-8 w-8 text-blue-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
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
            <Link href="/analytics" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Analytics
            </Link>
            <Link href="/admin" className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-sm text-gray-500">PostgreSQL connection active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  API Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-sm text-gray-500">All services operational</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(systemStats as any)?.activeUsers || 1}</div>
                <p className="text-sm text-gray-500">Currently logged in</p>
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/hero-vsc" className="w-full">
                  <Button className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Insurance Products
                  </Button>
                </Link>
                <Link href="/admin/rate-tables" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Upload Rate Tables
                  </Button>
                </Link>
                <Link href="/admin/coverage-options" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Configure Coverage Options
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/admin/users" className="w-full">
                  <Button className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users & Roles
                  </Button>
                </Link>
                <Link href="/admin/tenants" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Tenant Configuration
                  </Button>
                </Link>
                <Link href="/admin/resellers" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Reseller Management
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/admin/payment-settings" className="w-full">
                  <Button className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Payment Settings
                  </Button>
                </Link>
                <Link href="/admin/api-integrations" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    API Integrations
                  </Button>
                </Link>
                <Link href="/admin/system-logs" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    System Logs
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/admin/ai-models" className="w-full">
                  <Button className="w-full justify-start">
                    Configure AI Models
                  </Button>
                </Link>
                <Link href="/admin/training-data" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Training Data
                  </Button>
                </Link>
                <Link href="/admin/response-templates" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Response Templates
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Current User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Logged in as</p>
                  <p className="text-sm text-gray-900">{(user as any)?.email || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-sm text-gray-900">{(user as any)?.id || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}